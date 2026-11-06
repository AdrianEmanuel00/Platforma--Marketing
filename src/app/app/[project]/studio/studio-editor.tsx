"use client";
import { useState } from "react";
import clsx from "clsx";
import { CalendarClock, Check, Film, Images, Image as ImageIcon, RefreshCw, Send, WandSparkles } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { PlatformIcon } from "@/components/badges";
import { platformLabels } from "@/lib/format";
import type { AssetKind, Platform, Project, ResearchIdea } from "@/lib/types";

const formats: { id: AssetKind; label: string; icon: typeof ImageIcon }[] = [
  { id: "image", label: "Imagine", icon: ImageIcon },
  { id: "carousel", label: "Carusel", icon: Images },
  { id: "video", label: "Video scurt", icon: Film },
];

type Draft = Partial<Record<Platform, string>>;

// Demo: în versiunea reală, „Generează” pornește agenții Copywriter și Creative printr-un job în fundal.
function demoCaption(project: Project, idea: string, platform: Platform) {
  const tag = `#${project.slug.replace(/-/g, "")}`;
  switch (platform) {
    case "linkedin":
      return `${idea}. La ${project.name} credem în lucruri făcute cu grijă. Ce părere ai?`;
    case "tiktok":
      return `${idea} 👀 Rămâi până la final. ${tag}`;
    case "facebook":
      return `${idea}. Te așteptăm la ${project.name}!`;
    default:
      return `${idea}. ${project.brand.doWords[0] ?? ""} ✨\n\n${tag} #${project.brand.doWords[1]?.replace(/\s/g, "") ?? "brand"}`;
  }
}

export function StudioEditor({ project, initialIdea }: { project: Project; initialIdea?: ResearchIdea }) {
  const [idea, setIdea] = useState(initialIdea?.title ?? "");
  const [format, setFormat] = useState<AssetKind>(initialIdea?.format ?? "image");
  const [selected, setSelected] = useState<Platform[]>(
    initialIdea?.platforms.filter((p) => project.connected.includes(p)) ?? project.connected.slice(0, 2),
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [active, setActive] = useState<Platform | null>(null);
  const [done, setDone] = useState<"" | "posted" | "scheduled">("");
  const [when, setWhen] = useState("2026-11-07T10:00");

  function toggle(p: Platform) {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  function generate() {
    setGenerating(true);
    setDone("");
    setTimeout(() => {
      const d: Draft = {};
      selected.forEach((p) => (d[p] = demoCaption(project, idea.trim(), p)));
      setDraft(d);
      setActive(selected[0] ?? null);
      setGenerating(false);
    }, 900);
  }

  const shown = active && draft?.[active] !== undefined ? active : selected.find((p) => draft?.[p] !== undefined);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <section className="card space-y-5 p-5 lg:col-span-2">
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
          {initialIdea && <p className="mt-1.5 text-xs text-muted">Din raportul Research: {initialIdea.why}</p>}
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
                  format === f.id ? "border-accent bg-accent-soft text-accent" : "border-border",
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
          <div className="flex flex-wrap gap-2">
            {project.connected.map((p) => (
              <button
                key={p}
                onClick={() => toggle(p)}
                className={clsx(
                  "flex items-center gap-2 rounded-lg border py-1.5 pl-1.5 pr-3 text-sm",
                  selected.includes(p) ? "border-accent bg-accent-soft" : "border-border opacity-60",
                )}
              >
                <PlatformIcon platform={p} size="sm" />
                {platformLabels[p]}
                {selected.includes(p) && <Check size={14} className="text-accent" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={!idea.trim() || selected.length === 0 || generating}
          className="btn-primary w-full"
        >
          {generating ? <RefreshCw size={16} className="animate-spin" /> : <WandSparkles size={16} />}
          {generating ? "Agenții lucrează..." : draft ? "Generează din nou" : "Generează"}
        </button>
        <p className="text-xs text-muted">
          Folosește identitatea „{project.brand.logoText}”: ton {project.brand.voice.split(",")[0].toLowerCase()}, culorile și
          fonturile brandului.
        </p>
      </section>

      <section className="card p-5 lg:col-span-3">
        {!draft ? (
          <div className="flex h-full min-h-72 flex-col items-center justify-center text-center text-sm text-muted">
            <WandSparkles className="mb-3 text-accent" />
            Scrie o idee și apasă Generează. Previzualizarea pe fiecare platformă apare aici.
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
                <AssetPreview brand={project.brand} kind={format} title={idea} />
                <div className="flex flex-col gap-2">
                  <label htmlFor="caption" className="text-sm font-medium">
                    Text pentru {platformLabels[shown]}
                  </label>
                  <textarea
                    id="caption"
                    value={draft[shown]}
                    onChange={(e) => setDraft({ ...draft, [shown]: e.target.value })}
                    className="input min-h-40 flex-1 resize-none"
                  />
                  <button className="btn-ghost text-xs">
                    <RefreshCw size={14} /> Regenerează vizualul cu instrucțiuni
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="input w-auto"
                  aria-label="Data și ora programării"
                />
                <button onClick={() => setDone("scheduled")} className="btn-ghost">
                  <CalendarClock size={16} /> Programează
                </button>
              </div>
              <button onClick={() => setDone("posted")} className="btn-primary">
                <Send size={16} /> Postează acum
              </button>
            </div>
            {done && (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {done === "posted"
                  ? `Demo: postarea ar fi publicată acum pe ${selected.map((p) => platformLabels[p]).join(", ")}.`
                  : `Demo: postarea ar fi programată pentru ${when.replace("T", ", ")}.`}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
