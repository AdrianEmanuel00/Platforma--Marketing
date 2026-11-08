"use client";
import { useState } from "react";
import clsx from "clsx";
import { CalendarClock, KeyRound, Minus, Plus, RefreshCw, TrendingDown, TrendingUp, X } from "lucide-react";
import { IdeaCard, SampleNote, Sources } from "@/components/idea-card";
import { PageHeader } from "@/components/page-header";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { formatDate } from "@/lib/format";
import { useLogRun, useProjectData, useStore } from "@/lib/store";
import type { KeywordReport, Trend } from "@/lib/types";

const trendView: Record<Trend, { label: string; icon: typeof TrendingUp; className: string }> = {
  up: { label: "Mai mult ca anul trecut", icon: TrendingUp, className: "text-emerald-600" },
  flat: { label: "La fel ca anul trecut", icon: Minus, className: "text-amber-600" },
  down: { label: "Mai puțin ca anul trecut", icon: TrendingDown, className: "text-red-500" },
};

export default function KeywordsPage() {
  const { project, hydrated } = useCurrentProject();
  const { keywordReport: report } = useProjectData(project?.id);
  const { dispatch } = useStore();
  const logRun = useLogRun();
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  if (!project) return <ProjectMissing hydrated={hydrated} />;
  const keywords = project.keywords ?? [];

  const setKeywords = (k: string[]) => dispatch({ type: "updateProject", id: project.id, patch: { keywords: k } });
  const add = (word: string) => {
    const w = word.trim().toLowerCase();
    if (w && !keywords.includes(w) && keywords.length < 30) setKeywords([...keywords, w]);
  };

  async function run() {
    if (!project) return;
    setRunning(true);
    setError("");
    try {
      const res = await fetch("/api/agents/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });
      const data = (await res.json()) as KeywordReport & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Agentul a eșuat.");
      dispatch({ type: "addKeywordReport", report: { ...data, projectId: project.id } });
      // Cuvintele găsite de agent devin lista urmărită, dacă încă nu era una.
      if (keywords.length === 0) setKeywords(data.keywords.map((k) => k.keyword.toLowerCase()));
      logRun({
        projectId: project.id,
        agent: "keywords",
        status: "succeeded",
        summary: `${data.keywords.length} cuvinte comparate cu anul trecut, ${data.upcoming.length} momente care urmează`,
        costUsd: data.sample ? 0 : 0.6,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ceva n-a mers.";
      setError(msg);
      logRun({ projectId: project.id, agent: "keywords", status: "failed", summary: msg.slice(0, 120), costUsd: 0 });
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Cuvinte cheie"
        description={
          report
            ? `Agentul compară ce se caută acum cu aceeași perioadă de anul trecut, ca să postezi înainte de vârf. Ultimul raport: ${formatDate(report.date)}`
            : "Agentul compară ce se caută acum cu aceeași perioadă de anul trecut și îți spune ce urmează să crească, ca să postezi înainte de vârf."
        }
        actions={
          <button onClick={run} disabled={running} className="btn-primary">
            {running ? <RefreshCw size={16} className="animate-spin" /> : <KeyRound size={16} />}
            {running ? "Caută (1-3 minute)..." : "Analizează acum"}
          </button>
        }
      />
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
      {report?.sample && <SampleNote />}

      <section className="card mb-6 p-5">
        <h2 className="mb-1 font-semibold">Cuvinte urmărite</h2>
        <p className="mb-3 text-sm text-muted">
          {keywords.length ? "Agentul le analizează la fiecare rulare." : "Lasă gol și agentul găsește singur ce caută clienții tăi."}
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {keywords.map((k) => (
            <span key={k} className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">
              {k}
              <button aria-label={`Șterge ${k}`} onClick={() => setKeywords(keywords.filter((x) => x !== k))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            add(draft);
            setDraft("");
          }}
        >
          <input className="input" placeholder="Ex.: cafea de specialitate cluj" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit" className="btn-ghost" disabled={!draft.trim()}>
            <Plus size={16} /> Adaugă
          </button>
        </form>
        {report && report.suggested.filter((s) => !keywords.includes(s.toLowerCase())).length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            Sugerate de agent:
            {report.suggested
              .filter((s) => !keywords.includes(s.toLowerCase()))
              .map((s) => (
                <button key={s} onClick={() => add(s)} className="rounded-full border border-border px-2.5 py-1 hover:text-accent">
                  + {s}
                </button>
              ))}
          </div>
        )}
      </section>

      {!report ? (
        <div className="card flex flex-col items-center p-10 text-center text-sm text-muted">
          <KeyRound className="mb-3 text-accent" />
          Apasă „Analizează acum” ca să primești primul raport.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="card p-5 lg:col-span-2">
            <h2 className="mb-3 font-semibold">Acum față de anul trecut</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="pb-2 font-medium">Cuvânt cheie</th>
                    <th className="pb-2 font-medium">Interes acum vs anul trecut (0-100)</th>
                    <th className="pb-2 font-medium">Vârf de obicei</th>
                  </tr>
                </thead>
                <tbody>
                  {report.keywords.map((k) => {
                    const t = trendView[k.trend];
                    return (
                      <tr key={k.keyword} className="border-t border-border align-top">
                        <td className="py-3 pr-3">
                          <p className="font-medium">{k.keyword}</p>
                          <p className={clsx("mt-0.5 flex items-center gap-1 text-xs", t.className)}>
                            <t.icon size={12} /> {t.label}
                          </p>
                        </td>
                        <td className="py-3 pr-3">
                          <Bar label="Acum" value={k.interestNow} strong />
                          <Bar label="Anul trecut" value={k.interestLastYear} />
                          <p className="mt-1 text-xs text-muted">{k.note}</p>
                        </td>
                        <td className="py-3 text-xs text-muted">{k.peakMonths.join(", ") || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card p-5 lg:col-span-2">
            <h2 className="mb-1 font-semibold">Ce urmează să crească</h2>
            <p className="mb-3 text-sm text-muted">După tiparul de anul trecut. Pregătește conținutul acum, nu după ce interesul a trecut.</p>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {report.upcoming.map((u) => (
                <li key={u.topic} className="rounded-lg border border-border p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
                    <CalendarClock size={12} /> {u.when}
                  </p>
                  <p className="mt-1 text-sm font-medium">{u.topic}</p>
                  <p className="mt-1 text-xs text-muted">{u.why}</p>
                  {u.keywords.length > 0 && <p className="mt-2 text-xs text-muted">Cuvinte: {u.keywords.join(", ")}</p>}
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5 lg:col-span-2">
            <h2 className="mb-3 font-semibold">Idei de postări</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {report.ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} slug={project.slug} />
              ))}
            </div>
          </section>

          {report.sources && report.sources.length > 0 && (
            <section className="card p-5 lg:col-span-2">
              <h2 className="mb-3 font-semibold">Surse</h2>
              <Sources sources={report.sources} />
            </section>
          )}
        </div>
      )}
    </>
  );
}

function Bar({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-20 shrink-0 text-xs text-muted">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-surface-2">
        <div className={clsx("h-2 rounded-full", strong ? "bg-accent" : "bg-muted/40")} style={{ width: `${v}%` }} />
      </div>
      <span className="w-8 text-right text-xs tabular-nums">{v}</span>
    </div>
  );
}
