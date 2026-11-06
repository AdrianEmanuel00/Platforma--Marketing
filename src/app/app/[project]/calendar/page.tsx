"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { PostDialog } from "@/components/post-dialog";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { useProjectData, useStore } from "@/lib/store";
import { dayKey, formatTime, statusLabels, timeKey, toIsoRo, todayKey } from "@/lib/format";
import type { Post } from "@/lib/types";

const weekdays = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

export default function CalendarPage() {
  const { project, hydrated } = useCurrentProject();
  const { posts } = useProjectData(project?.id);
  const { dispatch } = useStore();
  const today = todayKey();
  const [month, setMonth] = useState(today.slice(0, 7)); // YYYY-MM
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  if (!project) return <ProjectMissing hydrated={hydrated} />;

  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // luni = prima zi
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= days ? `${month}-${String(d).padStart(2, "0")}` : null;
  });
  const monthName = new Intl.DateTimeFormat("ro-RO", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const shift = (delta: number) => {
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    setMonth(d.toISOString().slice(0, 7));
  };

  const scheduled = posts.filter((p) => p.scheduledAt);
  const unscheduled = posts.filter((p) => !p.scheduledAt && p.status !== "published");
  const open = posts.find((p) => p.id === openId);

  function moveTo(postId: string, day: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const time = post.scheduledAt ? timeKey(post.scheduledAt) : "10:00";
    const status = post.status === "idea" || post.status === "draft" ? "scheduled" : post.status;
    dispatch({ type: "updatePost", id: postId, patch: { scheduledAt: toIsoRo(day, time), status } });
  }

  const chip = (p: Post) => (
    <button
      key={p.id}
      draggable={p.status !== "published"}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", p.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => setOpenId(p.id)}
      title={statusLabels[p.status]}
      className={clsx(
        "block w-full rounded-md px-1.5 py-1 text-left text-[11px] leading-tight transition-shadow hover:shadow",
        p.status !== "published" && "cursor-grab active:cursor-grabbing",
        p.status === "published"
          ? "bg-emerald-100 dark:bg-emerald-950"
          : p.status === "pending_approval"
            ? "bg-amber-100 dark:bg-amber-950"
            : p.status === "draft" || p.status === "idea"
              ? "border border-dashed border-border bg-surface"
              : "bg-accent-soft",
      )}
    >
      <span className="mb-0.5 flex items-center gap-1">
        {p.variants.map((v) => (
          <PlatformIcon key={v.platform} platform={v.platform} size="sm" />
        ))}
        {p.scheduledAt && <span className="ml-auto text-muted">{formatTime(p.scheduledAt)}</span>}
      </span>
      <span className="line-clamp-2 font-medium">{p.title}</span>
    </button>
  );

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Trage o postare pe altă zi ca s-o muți. Apasă pe ea ca s-o editezi."
        actions={
          <Link href={`/app/${project.slug}/studio`} className="btn-primary">
            <Plus size={16} /> Postare nouă
          </Link>
        }
      />

      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => shift(-1)} className="btn-ghost px-2" aria-label="Luna anterioară">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => shift(1)} className="btn-ghost px-2" aria-label="Luna următoare">
          <ChevronRight size={16} />
        </button>
        <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
        {month !== today.slice(0, 7) && (
          <button onClick={() => setMonth(today.slice(0, 7))} className="ml-auto text-sm font-medium text-accent">
            Azi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_220px]">
        <div className="card overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-7">
            {weekdays.map((w) => (
              <div key={w} className="border-b border-border px-3 py-2 text-xs font-medium text-muted">
                {w}
              </div>
            ))}
            {cells.map((day, i) => {
              const dayPosts = day
                ? scheduled
                    .filter((p) => dayKey(p.scheduledAt!) === day)
                    .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!))
                : [];
              return (
                <div
                  key={i}
                  onDragOver={(e) => {
                    if (!day) return;
                    e.preventDefault();
                    setDragOver(day);
                  }}
                  onDragLeave={() => setDragOver((d) => (d === day ? null : d))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(null);
                    const id = e.dataTransfer.getData("text/plain");
                    if (day && id) moveTo(id, day);
                  }}
                  className={clsx(
                    "group min-h-28 border-b border-r border-border p-2 transition-colors",
                    !day && "bg-surface-2/50",
                    day && dragOver === day && "bg-accent-soft",
                    i % 7 === 6 && "border-r-0",
                  )}
                >
                  {day && (
                    <div className="flex items-center justify-between">
                      <span
                        className={clsx(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                          day === today ? "bg-accent font-semibold text-white" : "text-muted",
                        )}
                      >
                        {Number(day.slice(8))}
                      </span>
                      <Link
                        href={`/app/${project.slug}/studio?date=${day}`}
                        aria-label={`Postare nouă pe ${day}`}
                        className="text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                      >
                        <Plus size={14} />
                      </Link>
                    </div>
                  )}
                  <div className="mt-1 space-y-1">{dayPosts.map(chip)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="card h-fit p-4">
          <h3 className="mb-1 text-sm font-semibold">Neprogramate</h3>
          <p className="mb-3 text-xs text-muted">Idei și drafturi. Trage-le pe o zi din calendar.</p>
          <div className="space-y-1.5">
            {unscheduled.map(chip)}
            {unscheduled.length === 0 && <p className="text-xs text-muted">Nimic în așteptare.</p>}
          </div>
        </aside>
      </div>

      {open && <PostDialog key={open.id} post={open} project={project} onClose={() => setOpenId(null)} />}
    </>
  );
}
