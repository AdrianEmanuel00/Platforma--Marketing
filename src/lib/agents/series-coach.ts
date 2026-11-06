import "server-only";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { claude, fallbackParams, MODEL } from "../ai/clients";
import { brandContext } from "../ai/brand-context";
import type { Project } from "../types";

const Output = z.object({
  learnings: z.array(z.string()).describe("3-8 reguli scurte, concrete, bazate pe date, despre ce merge în această serie"),
  nextIdeas: z.array(z.string()).describe("3 idei pentru următoarele postări din serie"),
  visualGuide: z.string().describe("Ghidul vizual al seriei, actualizat din grafica folosită până acum"),
});

export type SeriesCoachResult = z.infer<typeof Output>;

export interface SeriesHistoryItem {
  title: string;
  status: string;
  date?: string;
  captions: string[];
  visualPrompt?: string;
  metrics?: { reach: number; likes: number; comments: number; shares: number };
}

/** Agentul seriei: citește istoricul unei serii și își actualizează „memoria”. */
export async function runSeriesCoach(input: {
  project: Project;
  series: { name: string; description: string; visualGuide: string; learnings: string[] };
  history: SeriesHistoryItem[];
}): Promise<SeriesCoachResult> {
  const { project, series, history } = input;
  const response = await claude().beta.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    ...fallbackParams,
    output_config: { effort: "medium", format: betaZodOutputFormat(Output) },
    system: [
      "Ești agentul unei serii de conținut pe social media. Rolul tău e să înveți din istoricul seriei ce funcționează.",
      "Scrii în română, cu diacritice. Regulile sunt scurte, concrete și se bazează pe ce vezi în date (cifre când există).",
      "Păstrezi regulile vechi care încă sunt adevărate și le scoți pe cele contrazise de date. Nu inventa cifre.",
      "",
      brandContext(project),
    ].join("\n"),
    messages: [
      {
        role: "user",
        content: [
          `Seria: ${series.name}. ${series.description}`,
          `Ghidul vizual actual: ${series.visualGuide || "(gol)"}`,
          `Ce știai până acum:\n${series.learnings.map((l) => `- ${l}`).join("\n") || "(nimic încă)"}`,
          "",
          "Istoricul seriei:",
          ...history.map((h) =>
            [
              `- ${h.title} (${h.status}${h.date ? `, ${h.date}` : ""})`,
              h.metrics && `  rezultate: ${h.metrics.reach} oameni atinși, ${h.metrics.likes} aprecieri, ${h.metrics.comments} comentarii, ${h.metrics.shares} distribuiri`,
              ...h.captions.map((c) => `  text: ${c.slice(0, 300)}`),
              h.visualPrompt && `  grafică: ${h.visualPrompt.slice(0, 300)}`,
            ]
              .filter(Boolean)
              .join("\n"),
          ),
        ].join("\n"),
      },
    ],
  });
  if (response.stop_reason === "refusal") throw new Error("Modelul a refuzat cererea.");
  const out = response.parsed_output;
  if (!out) throw new Error("Agentul seriei nu a returnat un rezultat valid.");
  return { learnings: out.learnings.slice(0, 8), nextIdeas: out.nextIdeas.slice(0, 5), visualGuide: out.visualGuide };
}
