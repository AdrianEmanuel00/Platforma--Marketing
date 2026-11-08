"use client";
import { useState } from "react";
import { ExternalLink, Plus, RefreshCw, Swords, Trash2 } from "lucide-react";
import { SampleNote, Sources } from "@/components/idea-card";
import { PageHeader } from "@/components/page-header";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { formatDate, platformLabels } from "@/lib/format";
import { useLogRun, useProjectData, useStore } from "@/lib/store";
import type { Competitor, CompetitorDossier, Platform } from "@/lib/types";

const PLATFORMS = Object.keys(platformLabels) as Platform[];

export default function CompetitorsPage() {
  const { project, hydrated } = useCurrentProject();
  const { dossiers } = useProjectData(project?.id);
  const { dispatch } = useStore();
  const logRun = useLogRun();
  const [running, setRunning] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  if (!project) return <ProjectMissing hydrated={hydrated} />;
  const competitors = project.competitors;

  const setCompetitors = (c: Competitor[]) => dispatch({ type: "updateProject", id: project.id, patch: { competitors: c } });
  const update = (i: number, patch: Partial<Competitor>) => setCompetitors(competitors.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const latest = (name: string) => dossiers.find((d) => d.competitor === name);

  async function run(i: number) {
    if (!project) return;
    setRunning(i);
    setError("");
    try {
      const res = await fetch("/api/agents/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, index: i }),
      });
      const data = (await res.json()) as CompetitorDossier & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Agentul a eșuat.");
      dispatch({ type: "addDossier", dossier: { ...data, projectId: project.id } });
      setOpen(data.competitor);
      logRun({
        projectId: project.id,
        agent: "competitors",
        status: "succeeded",
        summary: `Fișă nouă pentru ${data.competitor}: ${data.ads.length} reclame, ${data.opportunities.length} oportunități`,
        costUsd: data.sample ? 0 : 0.5,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ceva n-a mers.";
      setError(msg);
      logRun({ projectId: project.id, agent: "competitors", status: "failed", summary: msg.slice(0, 120), costUsd: 0 });
    } finally {
      setRunning(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Competitori"
        description={`Agentul citește site-ul, rețelele sociale și reclamele plătite ale fiecărui competitor și îți spune unde îl poate depăși ${project.name}.`}
        actions={
          competitors.length < 20 && (
            <button onClick={() => setCompetitors([...competitors, { name: "", handle: "", platform: "instagram", website: "" }])} className="btn-primary">
              <Plus size={16} /> Competitor
            </button>
          )
        }
      />
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      {competitors.length === 0 && (
        <div className="card flex flex-col items-center p-10 text-center text-sm text-muted">
          <Swords className="mb-3 text-accent" />
          Adaugă primul competitor: numele, site-ul și contul principal.
        </div>
      )}

      <div className="space-y-4">
        {competitors.map((c, i) => {
          const d = latest(c.name);
          const expanded = open === c.name && d;
          return (
            <section key={i} className="card p-5">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-center">
                <input aria-label="Nume competitor" className="input font-medium" placeholder="Nume" value={c.name} onChange={(e) => update(i, { name: e.target.value })} />
                <input aria-label="Site competitor" className="input" placeholder="site.ro" value={c.website ?? ""} onChange={(e) => update(i, { website: e.target.value })} />
                <div className="flex gap-2">
                  <input aria-label="Cont competitor" className="input" placeholder="@cont" value={c.handle} onChange={(e) => update(i, { handle: e.target.value })} />
                  <select aria-label="Platformă" className="input w-auto" value={c.platform} onChange={(e) => update(i, { platform: e.target.value as Platform })}>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {platformLabels[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={() => run(i)} disabled={running !== null || !c.name.trim()} className="btn-ghost">
                  {running === i ? <RefreshCw size={16} className="animate-spin" /> : <Swords size={16} />}
                  {running === i ? "Analizează (1-3 min)..." : d ? "Reanalizează" : "Fă fișa"}
                </button>
                <button aria-label="Șterge competitorul" onClick={() => setCompetitors(competitors.filter((_, j) => j !== i))} className="justify-self-end text-muted hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>

              {d && (
                <div className="mt-4 border-t border-border pt-4">
                  <button onClick={() => setOpen(expanded ? null : c.name)} className="w-full text-left">
                    <p className="text-xs text-muted">Fișa din {formatDate(d.date)}</p>
                    <p className="mt-1 text-sm">{d.summary}</p>
                    <p className="mt-1 text-xs text-accent">{expanded ? "Ascunde detaliile" : "Vezi toată fișa"}</p>
                  </button>
                  {expanded && <Dossier d={d} />}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

function Dossier({ d }: { d: CompetitorDossier }) {
  return (
    <div className="mt-4">
      {d.sample && <SampleNote />}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <List title="Ce vând acum (site)" items={d.offers} />
        <List title="Ce au făcut recent" items={d.recentActions} />
        <List title="Rețele sociale" items={d.channels.map((c) => `${c.platform}: ${c.activity}`)} />
        <List title="Reclame plătite active" items={d.ads.map((a) => `${a.platform}: ${a.what}`)} empty="Nu am găsit reclame active." />
        <List title="Puncte tari" items={d.strengths} />
        <List title="Puncte slabe" items={d.weaknesses} />
        <div className="md:col-span-2">
          <List title="Unde îi poți depăși" items={d.opportunities} highlight />
        </div>
        {d.sources && d.sources.length > 0 && (
          <div className="md:col-span-2">
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
              <ExternalLink size={12} /> Surse
            </p>
            <Sources sources={d.sources} />
          </div>
        )}
      </div>
    </div>
  );
}

function List({ title, items, empty = "Nimic găsit.", highlight }: { title: string; items: string[]; empty?: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "rounded-lg bg-accent-soft p-3" : ""}>
      <p className={`mb-1 text-xs font-semibold uppercase tracking-wide ${highlight ? "text-accent" : "text-muted"}`}>{title}</p>
      {items.length ? (
        <ul className="list-disc space-y-1 pl-4 text-sm">
          {items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
    </div>
  );
}
