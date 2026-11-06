"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Brain, Plus, Repeat, X } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import {
  ProjectMissing,
  useCurrentProject,
} from "@/components/current-project";
import { formatDate, platformLabels } from "@/lib/format";
import { newId, useProjectData, useStore } from "@/lib/store";
import { seriesPosts } from "@/lib/use-series-learner";
import type { AssetKind, Platform } from "@/lib/types";

const formatLabel: Record<AssetKind, string> = {
  image: "Imagine",
  carousel: "Carusel",
  video: "Video",
};

export default function SeriesPage() {
  const { project, hydrated } = useCurrentProject();
  const { posts, series } = useProjectData(project?.id);
  const [creating, setCreating] = useState(false);
  if (!project) return <ProjectMissing hydrated={hydrated} />;
  const base = `/app/${project.slug}`;

  return (
    <>
      <PageHeader
        title="Serii de conținut"
        description="Temele recurente ale brandului. Fiecare serie își ține istoricul (texte și grafică) și are un agent care învață ce merge."
        actions={
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus size={16} /> Serie nouă
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {series.map((s) => {
          const history = seriesPosts(posts, s.id);
          const last =
            history.find((p) => p.status === "published") ?? history[0];
          return (
            <Link
              key={s.id}
              href={`${base}/series/${s.id}`}
              className="card flex flex-col p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Repeat size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted">
                    {s.cadence} · {formatLabel[s.format]}
                  </p>
                </div>
                <div className="flex gap-1">
                  {s.platforms.map((p) => (
                    <PlatformIcon key={p} platform={p} size="sm" />
                  ))}
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted">
                {s.description}
              </p>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {history.slice(0, 4).map((p) =>
                  p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.id}
                      src={p.imageUrl}
                      alt=""
                      className="aspect-square w-full rounded-md object-cover"
                    />
                  ) : (
                    <AssetPreview
                      key={p.id}
                      brand={project.brand}
                      kind={p.assetKind}
                      title=""
                      className="p-1.5"
                    />
                  ),
                )}
                {Array.from(
                  { length: Math.max(0, 4 - history.length) },
                  (_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-md border border-dashed border-border"
                    />
                  ),
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted">
                <Brain
                  size={14}
                  className={s.learnings.length ? "text-accent" : ""}
                />
                {s.learnings.length
                  ? `Agentul a învățat ${s.learnings.length} ${s.learnings.length === 1 ? "lucru" : "lucruri"}`
                  : "Agentul învață după primele postări"}
                <span className="ml-auto">
                  {history.length}{" "}
                  {history.length === 1 ? "postare" : "postări"}
                  {last?.scheduledAt &&
                    ` · ultima ${formatDate(last.scheduledAt)}`}
                </span>
              </div>
            </Link>
          );
        })}
        {series.length === 0 && (
          <div className="card p-8 text-center text-sm text-muted md:col-span-2">
            Încă nu ai serii. Creează una pentru fiecare temă care revine:
            buchetul săptămânii, sfaturi, din culise.
          </div>
        )}
      </div>

      {creating && (
        <NewSeriesDialog
          projectId={project.id}
          connected={project.connected}
          base={base}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  );
}

const ALL: Platform[] = [
  "instagram",
  "facebook",
  "tiktok",
  "linkedin",
  "youtube",
  "x",
];

function NewSeriesDialog({
  projectId,
  connected,
  base,
  onClose,
}: {
  projectId: string;
  connected: Platform[];
  base: string;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cadence, setCadence] = useState("săptămânal");
  const [format, setFormat] = useState<AssetKind>("image");
  const [platforms, setPlatforms] = useState<Platform[]>(connected.slice(0, 2));
  const [visualGuide, setVisualGuide] = useState("");
  const options = connected.length ? connected : ALL;

  function create() {
    const id = newId("ser");
    dispatch({
      type: "addSeries",
      series: {
        id,
        projectId,
        name: name.trim(),
        description: description.trim(),
        cadence: cadence.trim(),
        format,
        platforms,
        visualGuide: visualGuide.trim(),
        learnings: [],
        nextIdeas: [],
        createdAt: new Date().toISOString(),
      },
    });
    router.push(`${base}/series/${id}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Serie nouă"
        className="card max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-b-none p-5 sm:rounded-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Serie nouă</h2>
          <button
            onClick={onClose}
            aria-label="Închide"
            className="text-muted hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Numele seriei</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Buchetul săptămânii"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Despre ce e</span>
          <textarea
            rows={2}
            className="input resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: în fiecare luni arătăm florile de sezon"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Cât de des</span>
            <input
              className="input"
              value={cadence}
              onChange={(e) => setCadence(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Format</span>
            <select
              className="input"
              value={format}
              onChange={(e) => setFormat(e.target.value as AssetKind)}
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
            {options.map((p) => {
              const on = platforms.includes(p);
              return (
                <button
                  key={p}
                  onClick={() =>
                    setPlatforms(
                      on ? platforms.filter((x) => x !== p) : [...platforms, p],
                    )
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
            Cum arată grafica (opțional)
          </span>
          <textarea
            rows={2}
            className="input resize-none"
            value={visualGuide}
            onChange={(e) => setVisualGuide(e.target.value)}
            placeholder="Ex.: fundal crem, lumină de dimineață, floarea de aproape"
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost">
            Renunță
          </button>
          <button
            onClick={create}
            disabled={!name.trim() || platforms.length === 0}
            className="btn-primary"
          >
            Creează seria
          </button>
        </div>
      </div>
    </div>
  );
}
