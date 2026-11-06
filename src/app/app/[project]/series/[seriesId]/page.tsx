"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  ArrowLeft,
  Brain,
  Plus,
  RefreshCw,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { PlatformIcon, StatusBadge } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { PostDialog } from "@/components/post-dialog";
import {
  ProjectMissing,
  useCurrentProject,
} from "@/components/current-project";
import { formatDateTime, formatNumber, platformLabels } from "@/lib/format";
import { useProjectData, useStore } from "@/lib/store";
import { useAgentsLive } from "@/lib/use-agents-live";
import { seriesPosts, useSeriesLearner } from "@/lib/use-series-learner";
import type { AssetKind, ContentSeries, Platform } from "@/lib/types";

const ALL: Platform[] = [
  "instagram",
  "facebook",
  "tiktok",
  "linkedin",
  "youtube",
  "x",
];

export default function SeriesDetailPage() {
  const { project, hydrated } = useCurrentProject();
  const { posts, series } = useProjectData(project?.id);
  const { seriesId } = useParams<{ seriesId: string }>();
  const { dispatch } = useStore();
  const router = useRouter();
  const status = useAgentsLive();
  const learn = useSeriesLearner();
  const [openId, setOpenId] = useState<string | null>(null);
  const [learning, setLearning] = useState(false);
  const [error, setError] = useState("");
  const [newLearning, setNewLearning] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const s = series.find((x) => x.id === seriesId);
  if (!project || !s)
    return <ProjectMissing hydrated={hydrated && !!project} />;

  const base = `/app/${project.slug}`;
  const history = seriesPosts(posts, s.id);
  const published = history.filter((p) => p.metrics);
  const avgReach = published.length
    ? Math.round(
        published.reduce((t, p) => t + p.metrics!.reach, 0) / published.length,
      )
    : 0;
  const best = [...published].sort(
    (a, b) => b.metrics!.reach - a.metrics!.reach,
  )[0];
  const open = posts.find((p) => p.id === openId);
  const update = (patch: Partial<ContentSeries>) =>
    dispatch({ type: "updateSeries", id: s.id, patch });
  const studioLink = (text?: string) =>
    `${base}/studio?${new URLSearchParams({ series: s.id, ...(text ? { text } : {}) })}`;

  async function runLearn() {
    if (!project || !s) return;
    setLearning(true);
    setError("");
    try {
      await learn(project, s, posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ceva n-a mers.");
    } finally {
      setLearning(false);
    }
  }

  return (
    <>
      <Link
        href={`${base}/series`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} /> Toate seriile
      </Link>
      <PageHeader
        title={s.name}
        description={`${s.cadence} · ${history.length} ${history.length === 1 ? "postare" : "postări"} în istoric`}
        actions={
          <Link href={studioLink()} className="btn-primary">
            <Plus size={16} /> Postare nouă în serie
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="font-semibold">Despre serie</h2>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Despre ce e</span>
            <textarea
              rows={2}
              className="input resize-none"
              value={s.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Nume</span>
              <input
                className="input"
                value={s.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Cât de des</span>
              <input
                className="input"
                value={s.cadence}
                onChange={(e) => update({ cadence: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Format</span>
              <select
                className="input"
                value={s.format}
                onChange={(e) =>
                  update({ format: e.target.value as AssetKind })
                }
              >
                <option value="image">Imagine</option>
                <option value="carousel">Carusel</option>
                <option value="video">Video</option>
              </select>
            </label>
          </div>
          <div className="text-sm">
            <span className="mb-1 block font-medium">Platforme</span>
            <div className="flex flex-wrap gap-2">
              {(project.connected.length ? project.connected : ALL).map((p) => {
                const on = s.platforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() =>
                      update({
                        platforms: on
                          ? s.platforms.filter((x) => x !== p)
                          : [...s.platforms, p],
                      })
                    }
                    className={clsx(
                      "flex items-center gap-2 rounded-lg border py-1 pl-1 pr-2.5 text-xs",
                      on
                        ? "border-accent bg-accent-soft"
                        : "border-border opacity-60",
                    )}
                  >
                    <PlatformIcon platform={p} size="sm" /> {platformLabels[p]}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              Ghidul vizual al seriei
            </span>
            <textarea
              rows={3}
              className="input resize-none"
              value={s.visualGuide}
              onChange={(e) => update({ visualGuide: e.target.value })}
              placeholder="Cum arată grafica de fiecare dată. Agentul Creative îl folosește la fiecare postare din serie."
            />
          </label>
        </section>

        <section className="card p-5">
          <div className="mb-1 flex items-center gap-2">
            <Brain size={18} className="text-accent" />
            <h2 className="font-semibold">Agentul seriei</h2>
          </div>
          <p className="mb-4 text-xs text-muted">
            {s.learnedAt
              ? `A învățat ultima dată pe ${formatDateTime(s.learnedAt)}.`
              : "Încă n-a învățat nimic."}{" "}
            Copywriterul și Creative folosesc aceste reguli la fiecare postare
            nouă din serie.
          </p>

          {published.length > 0 && (
            <dl className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-surface-2 p-2.5">
                <dt className="text-xs text-muted">Reach mediu</dt>
                <dd className="font-semibold">{formatNumber(avgReach)}</dd>
              </div>
              <div className="rounded-lg bg-surface-2 p-2.5">
                <dt className="text-xs text-muted">Cea mai bună</dt>
                <dd
                  className="truncate text-xs font-medium"
                  title={best?.title}
                >
                  {best?.title}
                </dd>
              </div>
            </dl>
          )}

          <p className="mb-1.5 text-sm font-medium">Ce a învățat</p>
          <ul className="mb-3 space-y-1.5">
            {s.learnings.map((l, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm"
              >
                <span className="flex-1">{l}</span>
                <button
                  aria-label="Șterge regula"
                  onClick={() =>
                    update({ learnings: s.learnings.filter((_, j) => j !== i) })
                  }
                  className="mt-0.5 text-muted hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <input
            className="input mb-4"
            placeholder="Adaugă o regulă și apasă Enter"
            value={newLearning}
            onChange={(e) => setNewLearning(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newLearning.trim()) {
                update({ learnings: [...s.learnings, newLearning.trim()] });
                setNewLearning("");
              }
            }}
          />

          <button
            onClick={runLearn}
            disabled={learning || history.length === 0 || !status?.anthropic}
            title={
              status?.anthropic
                ? ""
                : "Agentul pornește după ce adaugi cheia Anthropic"
            }
            className="btn-ghost w-full"
          >
            {learning ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Brain size={16} />
            )}
            {learning ? "Analizează istoricul..." : "Învață din istoric"}
          </button>
          {status && !status.anthropic && (
            <p className="mt-2 text-xs text-muted">
              Agentul analizează singur istoricul după ce adaugi cheia
              Anthropic. Până atunci poți scrie regulile de mână.
            </p>
          )}
          {error && (
            <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          {s.nextIdeas.length > 0 && (
            <>
              <p className="mb-1.5 mt-5 text-sm font-medium">
                Idei pentru următoarele postări
              </p>
              <ul className="space-y-1.5">
                {s.nextIdeas.map((idea) => (
                  <li
                    key={idea}
                    className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm"
                  >
                    <span className="flex-1">{idea}</span>
                    <Link
                      href={studioLink(idea)}
                      className="shrink-0 text-xs font-medium text-accent"
                    >
                      <WandSparkles size={14} className="inline" /> Fă-o
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="card p-5 lg:col-span-3">
          <h2 className="mb-3 font-semibold">Istoricul seriei</h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted">
              Nicio postare încă.{" "}
              <Link href={studioLink()} className="font-medium text-accent">
                Fă prima postare din serie
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setOpenId(p.id)}
                    className="flex w-full gap-4 py-3 text-left hover:bg-surface-2/50"
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="aspect-square w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <AssetPreview
                        brand={project.brand}
                        kind={p.assetKind}
                        title=""
                        className="w-20 shrink-0 p-2"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{p.title}</p>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-muted">
                        {p.scheduledAt
                          ? formatDateTime(p.scheduledAt)
                          : "Fără dată"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {p.variants[0]?.caption}
                      </p>
                      {p.visualPrompt && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted">
                          Grafică: {p.visualPrompt}
                        </p>
                      )}
                    </div>
                    <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                      <div className="flex gap-1">
                        {p.variants.map((v) => (
                          <PlatformIcon
                            key={v.platform}
                            platform={v.platform}
                            size="sm"
                          />
                        ))}
                      </div>
                      {p.metrics && (
                        <p className="text-xs text-muted">
                          {formatNumber(p.metrics.reach)} oameni atinși
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        {confirmDelete ? (
          <span className="flex items-center gap-2 text-sm">
            Ștergi seria? Postările rămân, doar ies din serie.
            <button
              onClick={() => {
                dispatch({ type: "deleteSeries", id: s.id });
                router.push(`${base}/series`);
              }}
              className="btn-ghost px-2.5 py-1 text-red-600"
            >
              Da
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="btn-ghost px-2.5 py-1"
            >
              Nu
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="btn-ghost text-red-600"
          >
            <Trash2 size={16} /> Șterge seria
          </button>
        )}
      </div>

      {open && (
        <PostDialog
          key={open.id}
          post={open}
          project={project}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
