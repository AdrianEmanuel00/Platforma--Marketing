"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";

export default function ClientsPage() {
  const { state, account } = useStore();
  const router = useRouter();
  const own = account === "business" ? state.projects[0] : undefined;
  // O afacere nu are listă de clienți: intră direct în dashboard-ul brandului ei.
  useEffect(() => {
    if (own) router.replace(`/app/${own.slug}`);
  }, [own, router]);
  if (account === "business") return <div className="h-40 animate-pulse rounded-xl bg-surface-2" />;

  return (
    <>
      <PageHeader
        title="Toți clienții"
        description="Fiecare client are proiectul lui: brand, conturi, calendar și research separate."
        actions={
          <Link href="/app/new" className="btn-primary">
            <Plus size={16} /> Client nou
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.projects.map((p) => {
          const ps = state.posts.filter((x) => x.projectId === p.id);
          const scheduled = ps.filter((x) => x.status === "scheduled").length;
          const pending = ps.filter((x) => x.status === "pending_approval").length;
          return (
            <Link key={p.id} href={`/app/${p.slug}`} className="card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ background: p.brand.colors[0]?.hex ?? "#6d4aff", color: p.brand.colors[1]?.hex ?? "#fff" }}
                >
                  {p.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted">{p.industry}</p>
                </div>
                {p.autopilot && (
                  <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Pilot automat
                  </span>
                )}
              </div>
              <div className="mt-4 flex min-h-5 gap-1.5">
                {p.connected.map((pl) => (
                  <PlatformIcon key={pl} platform={pl} size="sm" />
                ))}
                {p.connected.length === 0 && <span className="text-xs text-muted">Niciun cont conectat</span>}
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
        <Link
          href="/app/new"
          className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Plus size={20} />
          Adaugă un client
        </Link>
      </div>
    </>
  );
}
