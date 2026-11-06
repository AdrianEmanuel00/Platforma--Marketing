import type { Platform, PostStatus } from "./types";

const TZ = "Europe/Bucharest";

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "short", timeZone: TZ }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

/** Ziua (YYYY-MM-DD) în fusul României. */
export function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("ro-RO").format(n);
}

export const platformLabels: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  x: "X",
};

export const statusLabels: Record<PostStatus, string> = {
  idea: "Idee",
  draft: "Draft",
  pending_approval: "Așteaptă aprobare",
  approved: "Aprobat",
  scheduled: "Programat",
  published: "Publicat",
  failed: "Eșuat",
};
