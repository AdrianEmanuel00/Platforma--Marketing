import { z } from "zod";

// Proiectul trimis de browser către agenți (datele stau în browser până conectăm Supabase).
const PlatformEnum = z.enum(["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"]);

export const ProjectSchema = z.object({
  id: z.string().max(80),
  slug: z.string().max(80),
  name: z.string().min(1).max(120),
  industry: z.string().max(120),
  website: z.string().max(300),
  goals: z.array(z.string().max(300)).max(10),
  autopilot: z.boolean(),
  connected: z.array(PlatformEnum),
  competitors: z
    .array(
      z.object({
        name: z.string().max(120),
        handle: z.string().max(120),
        platform: PlatformEnum,
        website: z.string().max(300).optional(),
      }),
    )
    .max(20),
  keywords: z.array(z.string().max(80)).max(30).optional(),
  brand: z.object({
    colors: z.array(z.object({ name: z.string().max(60), hex: z.string().max(9) })).max(8),
    fonts: z.object({ heading: z.string().max(60), body: z.string().max(60) }),
    logoText: z.string().max(80),
    voice: z.string().max(1000),
    audience: z.string().max(1000),
    doWords: z.array(z.string().max(80)).max(20),
    dontWords: z.array(z.string().max(80)).max(20),
    visualStyle: z.string().max(1000),
    segments: z
      .array(
        z.object({
          id: z.string().max(80),
          name: z.string().max(120),
          who: z.string().max(1000),
          visualStyle: z.string().max(1000),
          tone: z.string().max(1000),
          platforms: z.array(PlatformEnum),
        }),
      )
      .max(10)
      .optional(),
  }),
});
