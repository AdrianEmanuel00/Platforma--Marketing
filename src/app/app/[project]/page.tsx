import Link from "next/link";
import { ArrowRight, Loader2, WandSparkles } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { PlatformIcon, StatusBadge } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { getAgent } from "@/lib/agents/registry";
import { DEMO_TODAY, latestReport, postsFor, runsFor } from "@/lib/demo-data";
import { dayKey, formatDateTime, formatNumber, formatTime } from "@/lib/format";
import { loadProject } from "@/lib/project-page";

export default async function ProjectDashboard({ params }: PageProps<"/app/[project]">) {
  const project = await loadProject(params);
  const posts = postsFor(project.id);
  const today = posts.filter((p) => p.scheduledAt && dayKey(p.scheduledAt) === DEMO_TODAY);
  const upcoming = posts
    .filter((p) => p.scheduledAt && dayKey(p.scheduledAt) > DEMO_TODAY && p.status !== "published")
    .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!));
  const published = posts.filter((p) => p.metrics);
  const reach = published.reduce((s, p) => s + p.metrics!.reach, 0);
  const engagement = published.reduce((s, p) => s + p.metrics!.likes + p.metrics!.comments + p.metrics!.shares, 0);
  const report = latestReport(project.id);
  const runs = runsFor(project.id);
  const base = `/app/${project.slug}`;

  return (
    <>
      <PageHeader
        title={project.name}
        description={`Obiective: ${project.goals.join(" · ")}`}
        actions={
          <Link href={`${base}/studio`} className="btn-primary">
            <WandSparkles size={16} /> Postare nouă
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Postări azi" value={String(today.length)} />
        <Stat label="Oameni atinși (7 zile)" value={formatNumber(reach)} />
        <Stat label="Interacțiuni (7 zile)" value={formatNumber(engagement)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <SectionTitle title="Urmează" href={`${base}/calendar`} link="Calendar" />
          <ul className="divide-y divide-border">
            {[...today, ...upcoming].map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3">
                <AssetPreview brand={project.brand} kind={p.assetKind} title="" className="w-12 shrink-0 p-1.5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted">
                    {dayKey(p.scheduledAt!) === DEMO_TODAY ? `Azi, ${formatTime(p.scheduledAt!)}` : formatDateTime(p.scheduledAt!)}
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
          </ul>
        </section>

        <section className="card p-5">
          <SectionTitle title="Agenții lucrează" />
          <ul className="space-y-3">
            {runs.map((r) => (
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

        {report && (
          <section className="card p-5 lg:col-span-3">
            <SectionTitle title="Idei noi de la Research, azi" href={`${base}/research`} link="Raportul complet" />
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
