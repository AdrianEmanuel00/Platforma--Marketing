import "server-only";
import { z } from "zod";
import { brandContext } from "../ai/brand-context";
import { platformLabels } from "../format";
import type { Competitor, CompetitorDossier, Project } from "../types";
import { searchThenStructure } from "./web-research";

const Dossier = z.object({
  summary: z.string(),
  offers: z.array(z.string()),
  channels: z.array(z.object({ platform: z.string(), activity: z.string() })),
  recentActions: z.array(z.string()),
  ads: z.array(z.object({ platform: z.string(), what: z.string() })),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  sources: z.array(z.object({ title: z.string(), url: z.string() })),
});

/** Fișa unui competitor: ce vinde, unde e activ, ce reclame are și unde îl poate depăși brandul nostru. */
export async function runCompetitor(project: Project, competitor: Competitor, today: string): Promise<CompetitorDossier> {
  const out = await searchThenStructure({
    schema: Dossier,
    maxSearches: 10,
    prompt: [
      `Azi e ${today}. Fă o fișă de competitor pentru brandul de mai jos, pe piața din România.`,
      `Competitorul: ${competitor.name}${competitor.handle ? `, ${competitor.handle} pe ${platformLabels[competitor.platform]}` : ""}${competitor.website ? `, site: ${competitor.website}` : ""}.`,
      "1. Site-ul lor: ce vând, prețuri și oferte vizibile acum, noutăți.",
      "2. Rețelele sociale: pe ce platforme sunt activi, cât de des postează, ce formate și teme folosesc, ce postări au mers.",
      "3. Reclame plătite: caută în Biblioteca de reclame Meta (facebook.com/ads/library) și în Google Ads Transparency Center ce reclame active au și ce mesaj transmit.",
      "4. Ce au făcut recent (campanii, lansări, colaborări, apariții în presă).",
      "5. Punctele lor tari și slabe, și 3-5 oportunități concrete prin care brandul nostru îi poate depăși ca vizibilitate.",
      "Notează sursa (titlu și URL) pentru fiecare afirmație. Dacă nu găsești ceva, spune clar că nu ai găsit. Scrie în română.",
      "",
      "Brandul nostru:",
      brandContext(project),
    ].join("\n"),
    structureInstructions:
      "Rezumatul în 2-3 fraze. Listele scurte, câte o frază pe rând, maxim 6 rânduri fiecare. Unde nu s-a găsit nimic, lasă lista goală.",
  });
  return { id: `cd_${Date.now()}`, projectId: project.id, competitor: competitor.name, date: today, ...out };
}
