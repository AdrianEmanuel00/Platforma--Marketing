import clsx from "clsx";
import { APP_NAME } from "@/lib/brand";

/** Semnul: trei puncte care urcă, un roi mic de agenți care cresc împreună. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={clsx("h-8 w-8 shrink-0", className)}>
      <defs>
        <linearGradient id="roi-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B6CFF" />
          <stop offset="1" stopColor="#4A22D6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#roi-g)" />
      <path d="M8.5 23.5 Q15 21 23 9" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9.5" cy="22.5" r="3.4" fill="#fff" />
      <circle cx="17" cy="16.6" r="2.7" fill="#fff" fillOpacity=".85" />
      <circle cx="23" cy="9.5" r="2" fill="#fff" fillOpacity=".7" />
    </svg>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span className={clsx("text-lg", light && "text-white")}>{APP_NAME}</span>
    </span>
  );
}
