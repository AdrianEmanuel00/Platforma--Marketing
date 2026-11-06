import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { fal } from "@fal-ai/client";

export const MODEL = "claude-opus-5-5";

/** Ce chei sunt setate. Fără ele, agenții răspund cu date demo. */
export function aiStatus() {
  return {
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    fal: Boolean(process.env.FAL_KEY),
  };
}

let anthropic: Anthropic | null = null;
export function claude() {
  anthropic ??= new Anthropic();
  return anthropic;
}

let falReady = false;
export function falClient() {
  if (!falReady) {
    fal.config({ credentials: process.env.FAL_KEY });
    falReady = true;
  }
  return fal;
}

/**
 * Setări comune pentru apelurile la Claude: dacă un filtru de siguranță refuză cererea,
 * API-ul o reia automat pe un model de rezervă, în același apel.
 */
export const fallbackParams: { betas: Anthropic.Beta.AnthropicBeta[]; fallbacks: "default" } = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
};

/** Mesaj de eroare clar pentru interfață, din erorile tipizate ale SDK-ului. */
export function agentErrorMessage(e: unknown) {
  if (e instanceof Anthropic.AuthenticationError) return "Cheia ANTHROPIC_API_KEY nu este validă.";
  if (e instanceof Anthropic.RateLimitError) return "Prea multe cereri către Claude. Încearcă din nou peste un minut.";
  if (e instanceof Anthropic.APIError) return `Eroare de la Claude (${e.status ?? "rețea"}). Încearcă din nou.`;
  return e instanceof Error ? e.message : "Agentul a eșuat.";
}
