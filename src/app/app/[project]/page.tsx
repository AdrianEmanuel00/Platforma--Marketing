"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, WandSparkles } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { PlatformIcon, StatusBadge } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { PostDialog } from "@/components/post-dialog";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { getAgent } from "@/lib/agents/registry";
import { useProjectData, useStore } from "@/lib/store";
import { dayKey, formatDateTime, formatNumber, formatTime, todayKey } from "@/lib/format";

export default function ProjectDashboard() {
  const { project, hydrated } = useCurrentProject();
  const { posts, report, runs } = useProjectData(project?.id);
  const { dispatch } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  if (!project) return <ProjectMissing hydrated={hydrated} />;

  const TODAY = todayKey();
  const today = posts.filter((p) => p.scheduledAt && dayKey(p.scheduledAt) === TODAY);
  const upcoming = posts
    .filter((p) => p.scheduledAt && dayKey(p.scheduledAt) > TODAY && p.status !== "published")
    .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!));
  const pending = posts.filter((p) => p.status === "pending_approval");
  const published = posts.filter((p) => p.metrics);
  const reach = published.reduce((s, p) => s + p.metrics!.reach, 0);
  const engagement = published.reduce((s, p) => s + p.metrics!.likes + p.metrics!.comments + p.metrics!.shares, 0);
  const base = `/app/${project.slug}`;
  const open = posts.find((p) => p.id === openId);

  return (
    <>
      <PageHeader
        title={project.name}
        description={project.goals.length ? `Obiective: ${project.goals.join(" · ")}` : project.industry}
        actions={
          <Link href={`${base}/studio`} className="btn-primary">
            <WandSparkles size={16} /> Postare nouă
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Postări azi" value={String(today.length)} />
        <Stat label="De aprobat" value={String(pending.length)} />
        <Stat label="Oameni atinși" value={formatNumber(reach)} />
        <Stat label="Interacțiuni" value={formatNumber(engagement)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <SectionTitle title="Urmează" href={`${base}/calendar`} link="Calendar" />
          <ul className="divide-y divide-border">
            {[...today, ...upcoming].map((p) => (
              <li key={p.id} onClick={() => setOpenId(p.id)} className="flex cursor-pointer items-center gap-4 py-3 hover:bg-surface-2/50">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="aspect-square w-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <AssetPreview brand={project.brand} kind={p.assetKind} title="" className="w-12 shrink-0 p-1.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted">
                    {dayKey(p.scheduledAt!) === TODAY ? `Azi, ${formatTime(p.scheduledAt!)}` : formatDateTime(p.scheduledAt!)}
                  </p>
                </div>
                <div className="hidden gap-1 sm:flex">
                  {p.variants.map((v) => (
                    <PlatformIcon key={v.platform} platform={v.platform} size="sm" />
                  ))}
                </div>
                <StatusBadge status={p.status} />
              </li>
            ))}
            {today.length + upcoming.length === 0 && (
              <li className="py-6 text-center text-sm text-muted">
                Nimic programat.{" "}
                <Link href={`${base}/studio`} className="font-medium text-accent">
                  Fă prima postare
                </Link>
              </li>
            )}
          </ul>
        </section>

        <section className="card p-5">
          <SectionTitle title="Agenții lucrează" />
          <ul className="space-y-3">
            {runs.length === 0 && <li className="text-sm text-muted">Încă nicio rulare.</li>}
            {runs.slice(0, 6).map((r) => (
              <li key={r.id} className="flex gap-3 text-sm">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    r.status === "running" ? "animate-pulse bg-amber-500" : r.status === "failed" ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />
                <div className="min-w-0">
                  <p className="font-medium">
                    {getAgent(r.agent).name}
                    {r.status === "running" && <Loader2 size={12} className="ml-1.5 inline animate-spin" />}
                  </p>
                  <p className="text-xs text-muted">{r.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {pending.length > 0 && (
          <section className="card p-5 lg:col-span-3">
            <SectionTitle title="Așteaptă aprobarea ta" />
            <ul className="divide-y divide-border">
              {pending.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                  <button onClick={() => setOpenId(p.id)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted">{p.scheduledAt ? formatDateTime(p.scheduledAt) : "Fără dată"}</p>
                  </button>
                  <div className="flex gap-1">
                    {p.variants.map((v) => (
                      <PlatformIcon key={v.platform} platform={v.platform} size="sm" />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      dispatch({ type: "updatePost", id: p.id, patch: { status: p.scheduledAt ? "scheduled" : "approved" } })
                    }
                    className="btn-primary px-2.5 py-1 text-xs"
                  >
                    <Check size={14} /> Aprobă
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {report && (
          <section className="card p-5 lg:col-span-3">
            <SectionTitle title={report.date === TODAY ? "Idei noi de la Research, azi" : "Idei de la Research"} href={`${base}/research`} link="Raportul complet" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {report.ideas.slice(0, 3).map((idea) => (
                <div key={idea.id} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">{idea.title}</p>
                  <p className="mt-1 text-xs text-muted">{idea.why}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {idea.platforms.map((pl) => (
                        <PlatformIcon key={pl} platform={pl} size="sm" />
                      ))}
                    </div>
                    <Link href={`${base}/studio?idea=${idea.id}`} className="text-xs font-medium text-accent">
                      Fă postarea →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      {open && <PostDialog key={open.id} post={open} project={project} onClose={() => setOpenId(null)} />}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SectionTitle({ title, href, link }: { title: string; href?: string; link?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-semibold">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-medium text-accent">
          {link} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}
