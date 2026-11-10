"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Link2, RefreshCw, Unplug } from "lucide-react";
import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { useStore } from "@/lib/store";
import { platformLabels } from "@/lib/format";
import { useConnections } from "@/lib/use-connections";
import type { Platform, Project } from "@/lib/types";

const all: { platform: Platform; note: string }[] = [
  { platform: "instagram", note: "Cont Business sau Creator, legat de o pagină Facebook" },
  { platform: "facebook", note: "Pagini Facebook" },
  { platform: "tiktok", note: "Necesită aprobarea aplicației de către TikTok" },
  { platform: "linkedin", note: "Profil personal sau pagină de companie" },
  { platform: "youtube", note: "Shorts și video, necesită verificarea Google" },
  { platform: "x", note: "API cu plată" },
];

const metaMessages: Record<string, { ok: boolean; text: string }> = {
  connected: { ok: true, text: "Contul de Facebook e conectat. Poți publica direct din Studio." },
  cancelled: { ok: false, text: "Conectarea a fost anulată." },
  invalid: { ok: false, text: "Conectarea a expirat sau nu e validă. Încearcă din nou." },
  no_pages: { ok: false, text: "Contul nu are nicio pagină de Facebook pe care s-o administrezi." },
  not_configured: { ok: false, text: "Lipsesc META_APP_ID și META_APP_SECRET în Vercel." },
  no_storage: { ok: false, text: "Conexiunile au nevoie de cheile Supabase în Vercel, ca să fie păstrate în siguranță." },
  error: { ok: false, text: "Facebook a refuzat conectarea." },
};

export default function AccountsPage() {
  return (
    <Suspense fallback={null}>
      <Accounts />
    </Suspense>
  );
}

function Accounts() {
  const { project, hydrated } = useCurrentProject();
  const { dispatch } = useStore();
  if (!project) return <ProjectMissing hydrated={hydrated} />;

  return (
    <>
      <PageHeader
        title="Conturi conectate"
        description={`Conectează conturile reale ale lui ${project.name} ca să publici direct. Platformele bifate mai jos apar în Studio și în calendar.`}
      />
      <MetaCard project={project} />

      <h2 className="mb-3 mt-8 font-semibold">Platformele proiectului</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {all.map(({ platform, note }) => {
          const connected = project.connected.includes(platform);
          return (
            <div key={platform} className="card flex items-center gap-4 p-4">
              <PlatformIcon platform={platform} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{platformLabels[platform]}</p>
                <p className="text-xs text-muted">{connected ? "Activ în Studio și calendar" : note}</p>
              </div>
              <button
                onClick={() => dispatch({ type: "toggleConnection", projectId: project.id, platform })}
                className={connected ? "btn-ghost" : "btn-primary"}
              >
                {connected ? "Dezactivează" : "Activează"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function MetaCard({ project }: { project: Project }) {
  const { status, reload } = useConnections(project.id);
  const { dispatch } = useStore();
  const sp = useSearchParams();
  const [busy, setBusy] = useState(false);
  const result = sp.get("meta");
  const message = result ? metaMessages[result] : undefined;
  const meta = status?.connections.meta;
  const page = meta?.pages.find((p) => p.id === meta.selectedPageId);

  async function selectPage(pageId: string) {
    setBusy(true);
    await fetch("/api/connect/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, pageId }),
    });
    await reload();
    setBusy(false);
  }

  async function disconnect() {
    setBusy(true);
    await fetch(`/api/connect/meta?project=${encodeURIComponent(project.id)}`, { method: "DELETE" });
    await reload();
    setBusy(false);
  }

  function enablePlatforms() {
    for (const p of ["facebook", "instagram"] as Platform[]) {
      if (p === "instagram" && !page?.instagram) continue;
      if (!project.connected.includes(p)) dispatch({ type: "toggleConnection", projectId: project.id, platform: p });
    }
  }

  const connectHref = `/api/connect/meta?project=${encodeURIComponent(project.id)}&slug=${encodeURIComponent(project.slug)}`;

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex gap-1.5">
          <PlatformIcon platform="facebook" />
          <PlatformIcon platform="instagram" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Facebook și Instagram</h2>
          <p className="mt-1 text-sm text-muted">
            Un singur login cu Facebook. Publici pe pagina de Facebook și pe contul de Instagram Business legat de ea.
          </p>
        </div>
        {meta ? (
          <button onClick={disconnect} disabled={busy} className="btn-ghost">
            <Unplug size={16} /> Deconectează
          </button>
        ) : (
          status?.metaConfigured &&
          status.storage !== "none" && (
            <a href={connectHref} className="btn-primary">
              <Link2 size={16} /> Conectează cu Facebook
            </a>
          )
        )}
      </div>

      {message && (
        <p
          className={`mt-4 rounded-lg p-3 text-sm ${message.ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}`}
        >
          {message.text}
          {result === "error" && sp.get("detail") ? ` ${sp.get("detail")}` : ""}
        </p>
      )}

      {!status && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <RefreshCw size={14} className="animate-spin" /> Verific conexiunea...
        </p>
      )}

      {status && meta && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Pagina pe care publici</span>
            <select className="input" value={meta.selectedPageId ?? ""} disabled={busy} onChange={(e) => selectPage(e.target.value)}>
              {meta.pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.instagram ? ` (+ Instagram @${p.instagram.username})` : ""}
                </option>
              ))}
            </select>
          </label>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" /> Facebook: {page?.name}
            </li>
            <li className="flex items-center gap-2">
              {page?.instagram ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-600" /> Instagram: @{page.instagram.username}
                </>
              ) : (
                <span className="text-muted">
                  Instagram: nu e legat de această pagină. În aplicația Instagram, treci contul pe Business sau Creator și leagă-l de pagina
                  de Facebook, apoi conectează-te din nou.
                </span>
              )}
            </li>
          </ul>
          {(!project.connected.includes("facebook") || (page?.instagram && !project.connected.includes("instagram"))) && (
            <button onClick={enablePlatforms} className="btn-ghost">
              Activează-le în Studio și calendar
            </button>
          )}
        </div>
      )}

      {status && !meta && (!status.metaConfigured || status.storage === "none") && (
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <p className="font-medium">Ce trebuie făcut o singură dată:</p>
          <ol className="list-decimal space-y-1 pl-5 text-muted">
            {status.storage === "none" && (
              <li>Pune în Vercel cheile Supabase (NEXT_PUBLIC_SUPABASE_URL și SUPABASE_SERVICE_ROLE_KEY), ca token-urile să fie păstrate în siguranță.</li>
            )}
            {!status.metaConfigured && (
              <>
                <li>
                  Creează o aplicație pe{" "}
                  <a className="text-accent" href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer">
                    developers.facebook.com
                  </a>{" "}
                  (tip Business) și adaugă produsul Facebook Login.
                </li>
                <li>
                  La „Valid OAuth Redirect URIs” pune: <code className="break-all rounded bg-surface-2 px-1">{status.redirectUri}</code>
                </li>
                <li>Pune în Vercel META_APP_ID și META_APP_SECRET (din Settings → Basic al aplicației), apoi Redeploy.</li>
              </>
            )}
          </ol>
        </div>
      )}
    </section>
  );
}
