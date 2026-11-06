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

/** Ziua de azi (YYYY-MM-DD) în fusul României. */
export function todayKey() {
  return dayKey(new Date().toISOString());
}

/** Combină o zi (YYYY-MM-DD) și o oră (HH:MM) din România într-un ISO. */
export function toIsoRo(day: string, time: string) {
  // România: UTC+2 iarna, UTC+3 vara. Calculăm decalajul real pentru ziua respectivă.
  const guess = new Date(`${day}T${time}:00Z`);
  const ro = new Date(guess.toLocaleString("en-US", { timeZone: TZ }));
  const utc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
  const offsetMs = ro.getTime() - utc.getTime();
  return new Date(guess.getTime() - offsetMs).toISOString();
}

/** Ora (HH:MM) în fusul României. */
export function timeKey(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(new Date(iso));
}
