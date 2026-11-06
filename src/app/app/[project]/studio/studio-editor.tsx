"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  CalendarClock,
  Check,
  FileText,
  Repeat,
  Film,
  Images,
  Image as ImageIcon,
  RefreshCw,
  Send,
  UserCheck,
  WandSparkles,
} from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { PlatformIcon } from "@/components/badges";
import {
  formatDateTime,
  platformLabels,
  toIsoRo,
  todayKey,
} from "@/lib/format";
import { newId, useLogRun, useProjectData, useStore } from "@/lib/store";
import { seriesContext, useSeriesLearner } from "@/lib/use-series-learner";
import { useAgentsLive } from "@/lib/use-agents-live";
import type {
  AssetKind,
  Platform,
  Post,
  PostStatus,
  Project,
  ResearchIdea,
} from "@/lib/types";

const formats: { id: AssetKind; label: string; icon: typeof ImageIcon }[] = [
  { id: "image", label: "Imagine", icon: ImageIcon },
  { id: "carousel", label: "Carusel", icon: Images },
  { id: "video", label: "Video scurt", icon: Film },
];

type Draft = Partial<Record<Platform, string>>;

// Text exemplu, folosit doar când serverul nu are încă cheile AI.
function sampleCaption(project: Project, idea: string, platform: Platform) {
  const tag = `#${project.slug.replace(/-/g, "")}`;
  switch (platform) {
    case "linkedin":
      return `${idea}. La ${project.name} credem în lucruri făcute cu grijă. Ce părere ai?`;
    case "tiktok":
      return `${idea} 👀 Rămâi până la final. ${tag}`;
    case "facebook":
      return `${idea}. Te așteptăm la ${project.name}!`;
    default:
      return `${idea}. ${project.brand.doWords[0] ?? ""} ✨\n\n${tag}`;
  }
}

function tomorrow() {
  const d = new Date(`${todayKey()}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function StudioEditor({
  project,
  initialIdea,
  initialDate,
  initialSeriesId,
}: {
  project: Project;
  initialIdea?: ResearchIdea;
  initialDate?: string;
  initialSeriesId?: string;
}) {
  const { dispatch } = useStore();
  const { posts, series } = useProjectData(project.id);
  const learnSeries = useSeriesLearner();
  const [seriesId, setSeriesId] = useState(initialSeriesId ?? "");
  const currentSeries = series.find((x) => x.id === seriesId);
  const logRun = useLogRun();
  const status = useAgentsLive();
  const live = status?.anthropic ?? false;

  const [idea, setIdea] = useState(initialIdea?.title ?? "");
  const startSeries = series.find((x) => x.id === initialSeriesId);
  const [format, setFormat] = useState<AssetKind>(
    initialIdea?.format ?? startSeries?.format ?? "image",
  );
  const fromIdea = (
    initialIdea?.platforms ??
    startSeries?.platforms ??
    []
  ).filter((p) => project.connected.includes(p));
  const [selected, setSelected] = useState<Platform[]>(
    fromIdea.length ? fromIdea : project.connected.slice(0, 2),
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [active, setActive] = useState<Platform | null>(null);
  const [day, setDay] = useState(initialDate ?? tomorrow());
  const [time, setTime] = useState("10:00");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [visualPrompt, setVisualPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<{
    status: PostStatus;
    when?: string;
  } | null>(null);
  const [sample, setSample] = useState(false);

  function toggle(p: Platform) {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  async function generate() {
    setGenerating(true);
    setSaved(null);
    setError("");
    setNotice("");
    try {
      if (!live) {
        await new Promise((r) => setTimeout(r, 500));
        const d: Draft = {};
        selected.forEach(
          (p) => (d[p] = sampleCaption(project, idea.trim(), p)),
        );
        setDraft(d);
        setImageUrl(null);
        setSample(true);
      } else {
        const res = await fetch("/api/agents/studio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project,
            idea: idea.trim(),
            format,
            platforms: selected,
            series: currentSeries
              ? seriesContext(currentSeries, posts)
              : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Agentul a eșuat.");
        const d: Draft = {};
        for (const v of data.variants as {
          platform: Platform;
          caption: string;
          hashtags: string[];
        }[]) {
          d[v.platform] = v.hashtags.length
            ? `${v.caption}\n\n${v.hashtags.join(" ")}`
            : v.caption;
        }
        setDraft(d);
        setImageUrl(data.image?.url ?? null);
        setVisualPrompt(data.visualPrompt ?? "");
        setSample(false);
        if (data.imageError) setNotice(data.imageError);
        logRun({
          projectId: project.id,
          agent: "copywriter",
          status: "succeeded",
          summary: `A scris textele pentru „${idea.trim().slice(0, 60)}” pe ${selected.length} platforme`,
          costUsd: 0.08,
        });
        if (data.image?.url) {
          logRun({
            projectId: project.id,
            agent: "creative",
            status: "succeeded",
            summary: "A generat imaginea postării",
            costUsd: 0.15,
          });
        }
      }
      setActive(selected[0] ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ceva n-a mers.";
      setError(msg);
      logRun({
        projectId: project.id,
        agent: "copywriter",
        status: "failed",
        summary: msg.slice(0, 120),
        costUsd: 0,
      });
    } finally {
      setGenerating(false);
    }
  }

  function save(status: PostStatus) {
    if (!draft) return;
    const scheduledAt =
      status === "scheduled"
        ? toIsoRo(day, time)
        : status === "published"
          ? new Date().toISOString()
          : undefined;
    const post: Post = {
      id: newId("post"),
      projectId: project.id,
      title: idea.trim().slice(0, 120),
      status,
      assetKind: format,
      scheduledAt,
      source: initialIdea ? "research" : "manual",
      imageUrl: imageUrl ?? undefined,
      visualPrompt: visualPrompt || undefined,
      seriesId: currentSeries?.id,
      variants: selected
        .filter((p) => draft[p] !== undefined)
        .map((p) => ({ platform: p, caption: draft[p]!, hashtags: [] })),
    };
    dispatch({ type: "addPost", post });
    setSaved({ status, when: scheduledAt });
    // Agentul seriei învață și din postarea nouă (în fundal, doar cu cheile AI).
    if (currentSeries && live)
      learnSeries(project, currentSeries, [...posts, post]).catch(() => {});
  }

  const shown =
    active && draft?.[active] !== undefined
      ? active
      : selected.find((p) => draft?.[p] !== undefined);
  const savedMessage: Partial<Record<PostStatus, string>> = {
    draft: "Salvat ca draft. Îl găsești în calendar, la „Neprogramate”.",
    pending_approval: "Trimis la aprobare. Apare în calendar și pe dashboard.",
    scheduled: `Programat pentru ${saved?.when ? formatDateTime(saved.when) : ""}.`,
    published:
      "Marcat ca publicat. Publicarea reală pornește când conectăm conturile sociale.",
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <section className="card space-y-5 p-5 lg:col-span-2">
        {series.length > 0 && (
          <div>
            <label
              htmlFor="series"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"
            >
              <Repeat size={14} /> Seria
            </label>
            <select
              id="series"
              className="input"
              value={seriesId}
              onChange={(e) => {
                setSeriesId(e.target.value);
                const s = series.find((x) => x.id === e.target.value);
                if (s) {
                  setFormat(s.format);
                  const pl = s.platforms.filter((p) =>
                    project.connected.includes(p),
                  );
                  if (pl.length) setSelected(pl);
                }
              }}
            >
              <option value="">Fără serie (postare separată)</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {currentSeries && (
              <p className="mt-1.5 text-xs text-muted">
                Agenții țin cont de {currentSeries.learnings.length} reguli
                învățate și de ultimele postări din serie.{" "}
                <Link
                  href={`/app/${project.slug}/series/${currentSeries.id}`}
                  className="text-accent"
                >
                  Vezi seria
                </Link>
              </p>
            )}
          </div>
        )}
        <div>
          <label htmlFor="idea" className="mb-1.5 block text-sm font-medium">
            Ideea
          </label>
          <textarea
            id="idea"
            rows={4}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ex.: Prezentăm noul abonament de cafea, cu o cană cadou"
            className="input resize-none"
          />
          {initialIdea?.why && (
            <p className="mt-1.5 text-xs text-muted">
              Din raportul Research: {initialIdea.why}
            </p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Format</p>
          <div className="grid grid-cols-3 gap-2">
            {formats.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={clsx(
                  "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs",
                  format === f.id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border",
                )}
              >
                <f.icon size={18} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Unde publici</p>
          {project.connected.length === 0 ? (
            <p className="text-sm text-muted">
              Niciun cont conectat.{" "}
              <Link
                href={`/app/${project.slug}/accounts`}
                className="font-medium text-accent"
              >
                Conectează conturile
              </Link>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {project.connected.map((p) => (
                <button
                  key={p}
                  onClick={() => toggle(p)}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg border py-1.5 pl-1.5 pr-3 text-sm",
                    selected.includes(p)
                      ? "border-accent bg-accent-soft"
                      : "border-border opacity-60",
                  )}
                >
                  <PlatformIcon platform={p} size="sm" />
                  {platformLabels[p]}
                  {selected.includes(p) && (
                    <Check size={14} className="text-accent" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={generate}
          disabled={
            !idea.trim() ||
            selected.length === 0 ||
            generating ||
            status === null
          }
          className="btn-primary w-full"
        >
          {generating ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <WandSparkles size={16} />
          )}
          {generating
            ? "Agenții lucrează (până la un minut)..."
            : draft
              ? "Generează din nou"
              : "Generează"}
        </button>
        {live && (
          <p className="text-xs font-medium text-emerald-600">
            ● Claude Opus 5.5 pentru text, Nano Banana Pro pentru imagine
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <p className="text-xs text-muted">
          Folosește identitatea „{project.brand.logoText || project.name}”
          {project.brand.voice && (
            <>: ton {project.brand.voice.split(",")[0].toLowerCase()}</>
          )}
          , culorile și fonturile brandului.{" "}
          <Link href={`/app/${project.slug}/brand`} className="text-accent">
            Editează
          </Link>
        </p>
      </section>

      <section className="card p-5 lg:col-span-3">
        {!draft ? (
          <div className="flex h-full min-h-72 flex-col items-center justify-center text-center text-sm text-muted">
            <WandSparkles className="mb-3 text-accent" />
            Scrie o idee și apasă Generează. Previzualizarea pe fiecare
            platformă apare aici.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1 border-b border-border pb-3">
              {selected
                .filter((p) => draft[p] !== undefined)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setActive(p)}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
                      shown === p ? "bg-surface-2 font-medium" : "text-muted",
                    )}
                  >
                    <PlatformIcon platform={p} size="sm" /> {platformLabels[p]}
                  </button>
                ))}
            </div>

            {shown && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={idea}
                    className="w-full rounded-lg object-cover"
                  />
                ) : (
                  <AssetPreview
                    brand={project.brand}
                    kind={format}
                    title={idea}
                  />
                )}
                <div className="flex flex-col gap-2">
                  <label htmlFor="caption" className="text-sm font-medium">
                    Text pentru {platformLabels[shown]}
                  </label>
                  <textarea
                    id="caption"
                    value={draft[shown]}
                    onChange={(e) =>
                      setDraft({ ...draft, [shown]: e.target.value })
                    }
                    className="input min-h-40 flex-1 resize-none"
                  />
                  {sample && (
                    <p className="text-xs text-muted">
                      Text exemplu. Agenții AI scriu textul real după ce adaugi
                      cheile.
                    </p>
                  )}
                  {visualPrompt && (
                    <details className="text-xs text-muted">
                      <summary className="cursor-pointer">
                        Promptul vizual scris de Copywriter
                      </summary>
                      <p className="mt-1">{visualPrompt}</p>
                    </details>
                  )}
                </div>
              </div>
            )}

            {saved ? (
              <div className="flex flex-col gap-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 sm:flex-row sm:items-center dark:bg-emerald-950 dark:text-emerald-300">
                <p className="flex-1">{savedMessage[saved.status]}</p>
                <div className="flex gap-2">
                  <Link
                    href={`/app/${project.slug}/calendar`}
                    className="btn-ghost bg-surface px-2.5 py-1 text-xs"
                  >
                    Vezi în calendar
                  </Link>
                  <button
                    onClick={() => {
                      setDraft(null);
                      setSaved(null);
                      setIdea("");
                      setImageUrl(null);
                      setVisualPrompt("");
                    }}
                    className="btn-ghost bg-surface px-2.5 py-1 text-xs"
                  >
                    Postare nouă
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="input w-auto"
                    aria-label="Ziua programării"
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input w-auto"
                    aria-label="Ora programării"
                  />
                  <button
                    onClick={() => save("scheduled")}
                    disabled={!day}
                    className="btn-primary"
                  >
                    <CalendarClock size={16} /> Programează
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => save("draft")} className="btn-ghost">
                    <FileText size={16} /> Salvează draft
                  </button>
                  <button
                    onClick={() => save("pending_approval")}
                    className="btn-ghost"
                  >
                    <UserCheck size={16} /> Trimite la aprobare
                  </button>
                  <button
                    onClick={() => save("published")}
                    className="btn-ghost sm:ml-auto"
                  >
                    <Send size={16} /> Postează acum
                  </button>
                </div>
              </div>
            )}
            {notice && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {notice}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
