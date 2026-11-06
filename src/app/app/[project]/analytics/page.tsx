import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { postsFor } from "@/lib/demo-data";
import { formatDate, formatNumber } from "@/lib/format";
import { loadProject } from "@/lib/project-page";

export default async function AnalyticsPage({ params }: PageProps<"/app/[project]/analytics">) {
  const project = await loadProject(params);
  const published = postsFor(project.id)
    .filter((p) => p.metrics)
    .sort((a, b) => b.metrics!.reach - a.metrics!.reach);
  const max = Math.max(1, ...published.map((p) => p.metrics!.reach));

  return (
    <>
      <PageHeader
        title="Statistici"
        description="Agentul Analytics (V2) va explica aici ce a mers și de ce, și va învăța Strategul ce să repete."
      />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Postare</th>
              <th className="px-4 py-3 font-medium">Oameni atinși</th>
              <th className="px-4 py-3 text-right font-medium">Aprecieri</th>
              <th className="px-4 py-3 text-right font-medium">Comentarii</th>
              <th className="px-4 py-3 text-right font-medium">Distribuiri</th>
            </tr>
          </thead>
          <tbody>
            {published.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.variants.map((v) => (
                      <PlatformIcon key={v.platform} platform={v.platform} size="sm" />
                    ))}
                    <span className="font-medium">{p.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{formatDate(p.scheduledAt!)}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(p.metrics!.reach / max) * 100}%` }} />
                    </div>
                    <span className="tabular-nums">{formatNumber(p.metrics!.reach)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(p.metrics!.likes)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(p.metrics!.comments)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(p.metrics!.shares)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {published.length === 0 && <p className="p-6 text-sm text-muted">Încă nu ai postări publicate.</p>}
      </div>
    </>
  );
}
