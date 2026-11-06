// Registrul agenților. Fiecare agent are un rol, un model principal și unul de rezervă.
// Modelele se apelează printr-un strat comun (src/lib/ai, pasul următor), ca să le putem schimba ușor.
import type { AgentId } from "../types";

export type ModelRef = { provider: "anthropic" | "fal"; model: string };

export interface AgentDefinition {
  id: AgentId;
  name: string;
  tagline: string;
  stage: "mvp" | "v2" | "v3";
  primary: ModelRef;
  fallback?: ModelRef;
  /** Rulează automat, după un program (cron), pe lângă rulările cerute de utilizator. */
  schedule?: string;
}

export const agents: AgentDefinition[] = [
  {
    id: "brand",
    name: "Brand",
    tagline: "Construiește identitatea din site, logo și postările vechi",
    stage: "mvp",
    primary: { provider: "anthropic", model: "claude-opus-5-5" },
  },
  {
    id: "creative",
    name: "Creative",
    tagline: "Imagini, carusele și video în identitatea brandului",
    stage: "mvp",
    primary: { provider: "fal", model: "fal-ai/nano-banana-pro" },
    fallback: { provider: "fal", model: "flux" },
  },
  {
    id: "copywriter",
    name: "Copywriter",
    tagline: "Textul, hashtag-urile și varianta pentru fiecare platformă",
    stage: "mvp",
    primary: { provider: "anthropic", model: "claude-opus-5-5" },
    fallback: { provider: "anthropic", model: "claude-sonnet-5-5" },
  },
  {
    id: "series",
    name: "Agentul seriei",
    tagline: "Învață din istoricul fiecărei serii ce merge și propune următoarele postări",
    stage: "mvp",
    primary: { provider: "anthropic", model: "claude-opus-5-5" },
  },
  {
    id: "publisher",
    name: "Postare",
    tagline: "Publică sau programează pe platformele alese",
    stage: "mvp",
    primary: { provider: "anthropic", model: "claude-sonnet-5-5" },
  },
  {
    id: "research",
    name: "Research",
    tagline: "Trenduri, competitori și idei, în fiecare dimineață",
    stage: "mvp",
    primary: { provider: "anthropic", model: "claude-opus-5-5" },
    schedule: "0 5 * * *",
  },
  {
    id: "strategist",
    name: "Strateg",
    tagline: "Transformă obiectivele într-un calendar lunar",
    stage: "v2",
    primary: { provider: "anthropic", model: "claude-opus-5-5" },
  },
  {
    id: "analytics",
    name: "Analytics",
    tagline: "Explică ce a mers și de ce",
    stage: "v2",
    primary: { provider: "anthropic", model: "claude-sonnet-5-5" },
    schedule: "0 6 * * *",
  },
  {
    id: "community",
    name: "Community",
    tagline: "Răspunsuri la comentarii și mesaje, în tonul brandului",
    stage: "v3",
    primary: { provider: "anthropic", model: "claude-sonnet-5-5" },
  },
];

export const videoModels: ModelRef[] = [
  { provider: "fal", model: "veo-3.1" },
  { provider: "fal", model: "sora-2" },
  { provider: "fal", model: "kling" },
];

export function getAgent(id: AgentId) {
  const agent = agents.find((a) => a.id === id);
  if (!agent) throw new Error(`Agent necunoscut: ${id}`);
  return agent;
}
