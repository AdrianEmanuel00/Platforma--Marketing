import { UserPlus } from "lucide-react";
import { StageBadge } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { agents } from "@/lib/agents/registry";
import { members, projects, workspace } from "@/lib/demo-data";

const roleLabels = { owner: "Owner", admin: "Admin", editor: "Editor", viewer: "Viewer" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Setări" description={`${workspace.name} · plan ${workspace.plan}`} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Echipa</h2>
            <button className="btn-ghost px-2.5 py-1 text-xs">
              <UserPlus size={14} /> Invită
            </button>
          </div>
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
                  {m.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted">
                    {m.projectIds.length === 0
                      ? "Toți clienții"
                      : m.projectIds.map((id) => projects.find((p) => p.id === id)?.name).join(", ")}
                  </p>
                </div>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{roleLabels[m.role]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Agenții și modelele lor</h2>
          <ul className="divide-y divide-border">
            {agents.map((a) => (
              <li key={a.id} className="py-3 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{a.name}</p>
                  <StageBadge stage={a.stage} />
                  <span className="ml-auto font-mono text-xs text-muted">{a.primary.model}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{a.tagline}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
