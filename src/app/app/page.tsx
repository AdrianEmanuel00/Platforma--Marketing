import Link from "next/link";
import { Plus } from "lucide-react";
import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { postsFor, projects } from "@/lib/demo-data";

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Toți clienții"
        description="Fiecare client are proiectul lui: brand, conturi, calendar și research separate."
        actions={
          <button className="btn-primary">
            <Plus size={16} /> Client nou
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const ps = postsFor(p.id);
          const scheduled = ps.filter((x) => x.status === "scheduled").length;
          const pending = ps.filter((x) => x.status === "pending_approval").length;
          return (
            <Link key={p.id} href={`/app/${p.slug}`} className="card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ background: p.brand.colors[0].hex, color: p.brand.colors[1].hex }}
                >
                  {p.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted">{p.industry}</p>
                </div>
                {p.autopilot && (
                  <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Pilot automat
                  </span>
                )}
              </div>
              <div className="mt-4 flex gap-1.5">
                {p.connected.map((pl) => (
                  <PlatformIcon key={pl} platform={pl} size="sm" />
                ))}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-surface-2 p-2.5">
                  <dt className="text-xs text-muted">Programate</dt>
                  <dd className="text-lg font-semibold">{scheduled}</dd>
                </div>
                <div className="rounded-lg bg-surface-2 p-2.5">
                  <dt className="text-xs text-muted">De aprobat</dt>
                  <dd className="text-lg font-semibold">{pending}</dd>
                </div>
              </dl>
            </Link>
          );
        })}
      </div>
    </>
  );
}
