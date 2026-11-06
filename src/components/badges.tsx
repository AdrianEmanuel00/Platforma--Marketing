import clsx from "clsx";
import { platformLabels, statusLabels } from "@/lib/format";
import type { Platform, PostStatus } from "@/lib/types";

const platformStyle: Record<Platform, { short: string; className: string }> = {
  instagram: { short: "IG", className: "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white" },
  facebook: { short: "FB", className: "bg-blue-600 text-white" },
  tiktok: { short: "TT", className: "bg-black text-white ring-1 ring-cyan-400" },
  linkedin: { short: "in", className: "bg-sky-700 text-white" },
  youtube: { short: "YT", className: "bg-red-600 text-white" },
  x: { short: "X", className: "bg-neutral-900 text-white" },
};

export function PlatformIcon({ platform, size = "md" }: { platform: Platform; size?: "sm" | "md" }) {
  const s = platformStyle[platform];
  return (
    <span
      title={platformLabels[platform]}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold",
        size === "sm" ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-[11px]",
        s.className,
      )}
    >
      {s.short}
    </span>
  );
}

const statusStyle: Record<PostStatus, string> = {
  idea: "bg-surface-2 text-muted",
  draft: "bg-surface-2 text-foreground",
  pending_approval: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  scheduled: "bg-accent-soft text-accent",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", statusStyle[status])}>
      {statusLabels[status]}
    </span>
  );
}

export function StageBadge({ stage }: { stage: "mvp" | "v2" | "v3" }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        stage === "mvp" ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted",
      )}
    >
      {stage === "mvp" ? "MVP" : stage.toUpperCase()}
    </span>
  );
}
