// Tipurile de bază ale platformei. Oglindesc tabelele din supabase/migrations.

export type WorkspaceKind = "business" | "agency";
export type Role = "owner" | "admin" | "editor" | "viewer";

export type Platform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "linkedin"
  | "youtube"
  | "x";

export type PostStatus =
  | "idea"
  | "draft"
  | "pending_approval"
  | "approved"
  | "scheduled"
  | "published"
  | "failed";

export type AssetKind = "image" | "carousel" | "video";

export interface Workspace {
  id: string;
  name: string;
  kind: WorkspaceKind;
  plan: "free" | "pro" | "agency";
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Proiectele la care are acces; gol = toate. */
  projectIds: string[];
}

export interface BrandKit {
  colors: { name: string; hex: string }[];
  fonts: { heading: string; body: string };
  logoText: string;
  voice: string;
  audience: string;
  doWords: string[];
  dontWords: string[];
  visualStyle: string;
}

export interface Project {
  id: string;
  createdAt?: string;
  slug: string;
  name: string;
  industry: string;
  website: string;
  goals: string[];
  autopilot: boolean;
  brand: BrandKit;
  connected: Platform[];
  competitors: { name: string; handle: string; platform: Platform }[];
}

export interface PostVariant {
  platform: Platform;
  caption: string;
  hashtags: string[];
}

export interface Post {
  id: string;
  projectId: string;
  title: string;
  status: PostStatus;
  assetKind: AssetKind;
  /** ISO date-time; lipsește pentru idei și drafturi neprogramate. */
  scheduledAt?: string;
  variants: PostVariant[];
  source: "research" | "calendar" | "manual";
  /** Imaginea generată de agentul Creative. */
  imageUrl?: string;
  metrics?: { reach: number; likes: number; comments: number; shares: number };
}

export interface ResearchIdea {
  id: string;
  title: string;
  why: string;
  format: AssetKind;
  platforms: Platform[];
}

export interface ResearchReport {
  id: string;
  projectId: string;
  date: string;
  trends: { title: string; detail: string; momentum: "rising" | "peak" | "fading" }[];
  competitorMoves: { competitor: string; what: string; result: string }[];
  ideas: ResearchIdea[];
  /** Paginile citite de agent (doar la rapoartele generate live). */
  sources?: { title: string; url: string }[];
}

export type AgentId =
  | "brand"
  | "creative"
  | "copywriter"
  | "publisher"
  | "research"
  | "strategist"
  | "analytics"
  | "community";

export interface AgentRun {
  id: string;
  projectId: string;
  agent: AgentId;
  status: "queued" | "running" | "succeeded" | "failed";
  summary: string;
  startedAt: string;
  costUsd: number;
}
