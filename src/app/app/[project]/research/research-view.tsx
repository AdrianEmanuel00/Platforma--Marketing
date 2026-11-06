"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Minus, Radar, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { useLogRun, useStore } from "@/lib/store";
import { useAgentsLive } from "@/lib/use-agents-live";
import type { Project, ResearchReport } from "@/lib/types";

const momentum = {
  rising: { label: "În creștere", icon: TrendingUp, className: "text-emerald-600" },
  peak: { label: "La vârf", icon: Minus, className: "text-amber-600" },
  fading: { label: "În scădere", icon: TrendingDown, className: "text-red-500" },
};

const formatLabel = { image: "Imagine", carousel: "Carusel", video: "Video" };

export function ResearchView({ project, report }: { project: Project; report?: ResearchReport }) {
  const { dispatch } = useStore();
  const logRun = useLogRun();
  const status = useAgentsLive();
  const live = status?.anthropic ?? null;
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setRunning(true);
    setError("");
    try {
      const res = await fetch("/api/agents/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Agentul a eșuat.");
      dispatch({ type: "addReport", report: { ...data, projectId: project.id } });
      logRun({
        projectId: project.id,
        agent: "research",
        status: "succeeded",
        summary: `${data.trends?.length ?? 0} trenduri și ${data.ideas?.length ?? 0} idei noi`,
        costUsd: 0.6,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ceva n-a mers.";
      setError(msg);
      logRun({ projectId: project.id, agent: "research", status: "failed", summary: msg.slice(0, 120), costUsd: 0 });
    } finally {
      setRunning(false);
    }
  }

  const header = (
    <PageHeader
      title="Research"
      description={
        report
          ? `Raportul din ${formatDate(report.date)}. Agentul urmărește ${project.competitors.length} competitori și trendurile din ${project.industry.toLowerCase() || "domeniul tău"}.`
          : "Încă nu există un raport. Agentul caută pe web trenduri, mișcările competitorilor și idei de postări."
      }
      actions={
        <button onClick={run} disabled={running || live === false} className="btn-primary" title={live === false ? "Research-ul pornește după ce adaugi cheia Anthropic" : ""}>
          {running ? <RefreshCw size={16} className="animate-spin" /> : <Radar size={16} />}
          {running ? "Caută pe web (1-3 minute)..." : "Rulează research acum"}
        </button>
      }
    />
  );

  const notices = (
    <>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
    </>
  );

  if (!report) {
    return (
      <>
        {header}
        {notices}
        <div className="card flex flex-col items-center p-10 text-center text-sm text-muted">
          <Radar className="mb-3 text-accent" />
          {live === false
            ? "Research-ul pornește după ce adaugi cheia Anthropic în Vercel."
            : "Apasă „Rulează research acum” ca să primești primul raport."}
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      {notices}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Trenduri</h2>
          <ul className="space-y-3">
            {report.trends.map((t) => {
              const m = momentum[t.momentum];
              return (
                <li key={t.title} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{t.title}</p>
                    <span className={clsx("flex items-center gap-1 text-xs font-medium", m.className)}>
                      <m.icon size={14} /> {m.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{t.detail}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Ce au făcut competitorii</h2>
          <ul className="space-y-3">
            {report.competitorMoves.map((c) => (
              <li key={c.what} className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{c.competitor}</p>
                <p className="mt-1 text-sm">{c.what}</p>
                <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">{c.result}</p>
              </li>
            ))}
          </ul>
          {report.competitorMoves.length === 0 && <p className="text-sm text-muted">Nimic notabil azi.</p>}
          {project.competitors.length > 0 && (
            <p className="mt-4 text-xs text-muted">Urmăriți: {project.competitors.map((c) => c.handle).join(", ")}</p>
          )}
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Idei pentru azi</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {report.ideas.map((idea) => (
              <div key={idea.id} className="flex flex-col rounded-lg border border-border p-4">
                <span className="mb-2 self-start rounded-full bg-surface-2 px-2 py-0.5 text-[11px]">
                  {formatLabel[idea.format]}
                </span>
                <p className="text-sm font-medium">{idea.title}</p>
                <p className="mt-1 flex-1 text-xs text-muted">{idea.why}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {idea.platforms.map((p) => (
                      <PlatformIcon key={p} platform={p} size="sm" />
                    ))}
                  </div>
                  <Link
                    href={`/app/${project.slug}/studio?idea=${idea.id}`}
                    className="btn-ghost px-2.5 py-1 text-xs"
                  >
                    Fă postarea
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        {report.sources && report.sources.length > 0 && (
          <section className="card p-5 lg:col-span-2">
            <h2 className="mb-3 font-semibold">Surse</h2>
            <ul className="space-y-1 text-sm">
              {report.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
