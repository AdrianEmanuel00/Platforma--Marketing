import clsx from "clsx";
import { platformLabels, statusLabels } from "@/lib/format";
import { platformGlyphs } from "@/lib/platform-glyphs";
import type { Platform, PostStatus } from "@/lib/types";

const platformBg: Record<Platform, string> = {
  instagram: "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]",
  facebook: "bg-[#0866FF]",
  tiktok: "bg-black",
  linkedin: "bg-[#0A66C2]",
  youtube: "bg-[#FF0000]",
  x: "bg-black",
};

function Glyph({ platform }: { platform: Platform }) {
  if (platform === "linkedin") {
    // „in”: punct, bară și n, desenate simplu
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-[62%] w-[62%]">
        <circle cx="5" cy="4.5" r="2.4" />
        <rect x="2.9" y="8.4" width="4.2" height="13" rx="0.6" />
        <path d="M9.6 8.4h4v1.9c.7-1.2 2.2-2.2 4.3-2.2 3.4 0 4.6 2.1 4.6 5.6v7.7h-4.2v-6.9c0-1.7-.4-2.9-2-2.9-1.7 0-2.5 1.2-2.5 3v6.8H9.6z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-[58%] w-[58%]">
      <path d={platformGlyphs[platform]} />
    </svg>
  );
}

export function PlatformIcon({ platform, size = "md" }: { platform: Platform; size?: "sm" | "md" }) {
  return (
    <span
      title={platformLabels[platform]}
      role="img"
      aria-label={platformLabels[platform]}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center text-white",
        size === "sm" ? "h-5 w-5 rounded-[5px]" : "h-7 w-7 rounded-md",
        platformBg[platform],
      )}
    >
      <Glyph platform={platform} />
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
