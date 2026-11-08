import "server-only";
import { z } from "zod";
import { brandContext } from "../ai/brand-context";
import type { KeywordReport, Project } from "../types";
import { searchThenStructure } from "./web-research";

const PlatformEnum = z.enum(["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"]);

const Report = z.object({
  keywords: z.array(
    z.object({
      keyword: z.string(),
      interestNow: z.number().describe("Interes relativ 0-100 în ultimele 4 săptămâni"),
      interestLastYear: z.number().describe("Interes relativ 0-100 în aceleași 4 săptămâni de anul trecut"),
      trend: z.enum(["up", "down", "flat"]),
      peakMonths: z.array(z.string()),
      note: z.string(),
    }),
  ),
  upcoming: z.array(z.object({ when: z.string(), topic: z.string(), why: z.string(), keywords: z.array(z.string()) })),
  suggested: z.array(z.string()),
  ideas: z.array(
    z.object({ title: z.string(), why: z.string(), format: z.enum(["image", "carousel", "video"]), platforms: z.array(PlatformEnum) }),
  ),
  sources: z.array(z.object({ title: z.string(), url: z.string() })),
});

/** Agentul de cuvinte cheie: ce caută oamenii acum, comparat cu aceeași perioadă de anul trecut, și ce urmează să crească. */
export async function runKeywords(project: Project, today: string): Promise<KeywordReport> {
  const keywords = project.keywords?.length ? project.keywords : [];
  const out = await searchThenStructure({
    schema: Report,
    maxSearches: 10,
    prompt: [
      `Azi e ${today}. Ești specialist SEO și social media pe piața din România.`,
      keywords.length
        ? `Analizează aceste cuvinte cheie: ${keywords.join(", ")}.`
        : `Brandul nu are încă cuvinte cheie. Găsește 6-8 cuvinte cheie pe care le caută clienții lui în România.`,
      "Pentru fiecare: cât de mult se caută acum (ultimele 4 săptămâni) față de aceeași perioadă de anul trecut, pe o scară relativă 0-100, și în ce luni e de obicei vârful.",
      "Folosește surse publice: Google Trends, articole, calendarul sezonier al industriei, sărbători și evenimente din România.",
      "Apoi spune ce urmează să crească în următoarele 4-8 săptămâni după tiparul de anul trecut, ca brandul să posteze ÎNAINTE de vârf, nu după.",
      "Propune 3-5 cuvinte cheie noi de urmărit și 4 idei de postări legate de ce urmează.",
      "Notează sursa (titlu și URL) pentru fiecare afirmație. Când o cifră e estimată, spune asta în notă. Scrie în română.",
      "",
      brandContext(project),
    ].join("\n"),
    structureInstructions:
      "Câte un rând pentru fiecare cuvânt cheie analizat, maxim 4 momente în upcoming, 3-5 sugestii, exact 4 idei. Notele scurte, o frază.",
  });
  return {
    id: `kw_${Date.now()}`,
    projectId: project.id,
    date: today,
    ...out,
    ideas: out.ideas.map((i, n) => ({ ...i, id: `kw_${Date.now().toString(36)}_${n}` })),
  };
}
