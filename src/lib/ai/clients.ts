import "server-only";
import Anthropic from "@anthropic-ai/sdk";

import { imageProvider } from "./images";

/**
 * Nivelul de calitate pentru agenții de text, ales din variabila AI_TIER:
 * - "economic" (implicit): Claude Haiku 5.5, cel mai ieftin, bun pentru testare
 * - "echilibrat": Claude Sonnet 5.5
 * - "maxim": Claude Opus 5.5, calitate maximă
 */
export const TIERS = {
  economic: "claude-haiku-5-5",
  echilibrat: "claude-sonnet-5-5",
  maxim: "claude-opus-5-5",
} as const;
export type Tier = keyof typeof TIERS;

export function aiTier(): Tier {
  const t = process.env.AI_TIER?.trim().toLowerCase();
  return t && t in TIERS ? (t as Tier) : "economic";
}

/** Modelul Claude folosit de toți agenții de text. */
export function textModel(): string {
  return TIERS[aiTier()];
}

const isHaiku = () => textModel().startsWith("claude-haiku");

/** Ce chei sunt setate și ce modele rulează. Fără ANTHROPIC_API_KEY, agenții răspund cu date demo. */
export function aiStatus() {
  const img = imageProvider();
  return {
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    fal: Boolean(process.env.FAL_KEY),
    tier: aiTier(),
    textModel: textModel(),
    imageProvider: img.id,
    imageModel: img.model,
    imageReady: img.ready,
  };
}

let anthropic: Anthropic | null = null;
export function claude() {
  anthropic ??= new Anthropic();
  return anthropic;
}

/**
 * Model + setări comune pentru fiecare apel la Claude. Pe Sonnet și Opus, dacă un filtru
 * de siguranță refuză cererea, API-ul o reia automat pe un model de rezervă (Haiku nu are asta).
 */
export function modelParams(): {
  model: string;
  betas: Anthropic.Beta.AnthropicBeta[];
  fallbacks?: "default";
} {
  if (isHaiku()) return { model: textModel(), betas: ["web-fetch-2025-09-10"] };
  return { model: textModel(), betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };
}

/** Căutarea web: varianta nouă (cu filtrare) pe Sonnet/Opus, cea de bază pe Haiku. */
export function webSearchTool(maxUses: number): Anthropic.Beta.BetaToolUnion {
  const common = { name: "web_search" as const, max_uses: maxUses, user_location: { type: "approximate" as const, country: "RO" } };
  return isHaiku() ? { type: "web_search_20250305", ...common } : { type: "web_search_20260209", ...common };
}

/** Citirea unei pagini web (site-ul brandului etc.). */
export function webFetchTool(maxUses: number): Anthropic.Beta.BetaToolUnion {
  return isHaiku()
    ? { type: "web_fetch_20250910", name: "web_fetch", max_uses: maxUses }
    : { type: "web_fetch_20260209", name: "web_fetch", max_uses: maxUses };
}

/** Mesaj de eroare clar pentru interfață, din erorile tipizate ale SDK-ului. */
export function agentErrorMessage(e: unknown) {
  if (e instanceof Anthropic.AuthenticationError) return "Cheia ANTHROPIC_API_KEY nu este validă.";
  if (e instanceof Anthropic.RateLimitError) return "Prea multe cereri către Claude. Încearcă din nou peste un minut.";
  if (e instanceof Anthropic.APIError) return `Eroare de la Claude (${e.status ?? "rețea"}). Încearcă din nou.`;
  return e instanceof Error ? e.message : "Agentul a eșuat.";
}
