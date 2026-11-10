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
  /** Segmentele de public, fiecare cu stilul lui (ex.: 50+ preferă imagini brute, sub 33 imagini editate). */
  segments?: AudienceSegment[];
}

export interface AudienceSegment {
  id: string;
  name: string;
  /** Cine sunt: vârstă, interese, unde stau online. */
  who: string;
  /** Cum trebuie să arate imaginile și video-urile pentru ei. */
  visualStyle: string;
  /** Cum le vorbim. */
  tone: string;
  platforms: Platform[];
}

export interface Competitor {
  name: string;
  handle: string;
  platform: Platform;
  website?: string;
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
  competitors: Competitor[];
  /** Cuvintele cheie urmărite de agentul de cuvinte cheie. */
  keywords?: string[];
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
  /** Promptul vizual folosit pentru grafică (ca seria să-și amintească stilul). */
  visualPrompt?: string;
  /** Seria de conținut din care face parte. */
  seriesId?: string;
  metrics?: { reach: number; likes: number; comments: number; shares: number };
  /** Rezultatul publicării reale, pe fiecare platformă. */
  publishLog?: PublishLogEntry[];
}

export interface PublishLogEntry {
  platform: Platform;
  ok: boolean;
  at: string;
  url?: string;
  error?: string;
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
  | "series"
  | "brand"
  | "creative"
  | "copywriter"
  | "publisher"
  | "research"
  | "keywords"
  | "competitors"
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

/** O serie de conținut: o temă recurentă a brandului, cu agentul ei care învață din istoric. */
export interface ContentSeries {
  id: string;
  projectId: string;
  name: string;
  description: string;
  /** Cât de des apare, în cuvinte (ex.: „în fiecare luni”). */
  cadence: string;
  format: AssetKind;
  platforms: Platform[];
  /** Ghidul vizual al seriei: cum arată grafica de fiecare dată. */
  visualGuide: string;
  /** Ce a învățat agentul seriei din postările de până acum. */
  learnings: string[];
  /** Idei propuse de agent pentru următoarele postări. */
  nextIdeas: string[];
  learnedAt?: string;
  createdAt: string;
}

export type Trend = "up" | "down" | "flat";

/** Raportul agentului de cuvinte cheie: interesul de acum comparat cu aceeași perioadă de anul trecut. */
export interface KeywordReport {
  id: string;
  projectId: string;
  date: string;
  keywords: {
    keyword: string;
    /** Interes relativ, 0-100, în ultimele 4 săptămâni. */
    interestNow: number;
    /** Interes relativ, 0-100, în aceleași 4 săptămâni de anul trecut. */
    interestLastYear: number;
    trend: Trend;
    /** Lunile în care căutările sunt de obicei la vârf. */
    peakMonths: string[];
    note: string;
  }[];
  /** Ce urmează să crească, după tiparul de anul trecut: aici câștigi dacă postezi înainte. */
  upcoming: { when: string; topic: string; why: string; keywords: string[] }[];
  /** Cuvinte noi pe care merită să le urmărești. */
  suggested: string[];
  ideas: ResearchIdea[];
  sources?: { title: string; url: string }[];
  sample?: boolean;
}

/** Fișa unui competitor: site, rețele, reclame și ce poți face tu mai bine. */
export interface CompetitorDossier {
  id: string;
  projectId: string;
  competitor: string;
  date: string;
  summary: string;
  offers: string[];
  channels: { platform: string; activity: string }[];
  recentActions: string[];
  ads: { platform: string; what: string }[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  sources?: { title: string; url: string }[];
  sample?: boolean;
}
