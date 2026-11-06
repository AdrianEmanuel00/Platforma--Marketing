import Link from "next/link";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { DEMO_TODAY, postsFor } from "@/lib/demo-data";
import { dayKey, formatTime } from "@/lib/format";
import { loadProject } from "@/lib/project-page";

const weekdays = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

export default async function CalendarPage({ params }: PageProps<"/app/[project]/calendar">) {
  const project = await loadProject(params);
  const posts = postsFor(project.id).filter((p) => p.scheduledAt);
  const [y, m] = DEMO_TODAY.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // luni = prima zi
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= days ? `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` : null;
  });
  const monthName = new Intl.DateTimeFormat("ro-RO", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);

  return (
    <>
      <PageHeader
        title="Calendar"
        description={`Postările lui ${project.name}, ${monthName}. În versiunea reală le muți cu drag and drop.`}
        actions={
          <Link href={`/app/${project.slug}/studio`} className="btn-primary">
            <Plus size={16} /> Postare nouă
          </Link>
        }
      />
      <div className="card overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-7">
          {weekdays.map((w) => (
            <div key={w} className="border-b border-border px-3 py-2 text-xs font-medium text-muted">
              {w}
            </div>
          ))}
          {cells.map((day, i) => {
            const dayPosts = day ? posts.filter((p) => dayKey(p.scheduledAt!) === day) : [];
            return (
              <div
                key={i}
                className={clsx(
                  "min-h-28 border-b border-r border-border p-2",
                  !day && "bg-surface-2/50",
                  i % 7 === 6 && "border-r-0",
                )}
              >
                {day && (
                  <span
                    className={clsx(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      day === DEMO_TODAY ? "bg-accent font-semibold text-white" : "text-muted",
                    )}
                  >
                    {Number(day.slice(8))}
                  </span>
                )}
                <div className="mt-1 space-y-1">
                  {dayPosts.map((p) => (
                    <div
                      key={p.id}
                      className={clsx(
                        "rounded-md px-1.5 py-1 text-[11px] leading-tight",
                        p.status === "published" ? "bg-emerald-100 dark:bg-emerald-950" : p.status === "pending_approval" ? "bg-amber-100 dark:bg-amber-950" : "bg-accent-soft",
                      )}
                    >
                      <div className="mb-0.5 flex items-center gap-1">
                        {p.variants.map((v) => (
                          <PlatformIcon key={v.platform} platform={v.platform} size="sm" />
                        ))}
                        <span className="ml-auto text-muted">{formatTime(p.scheduledAt!)}</span>
                      </div>
                      <p className="line-clamp-2 font-medium">{p.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
