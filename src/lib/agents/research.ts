import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { claude, modelParams, webSearchTool } from "../ai/clients";
import { brandContext } from "../ai/brand-context";
import type { Project, ResearchReport } from "../types";

const Report = z.object({
  trends: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      momentum: z.enum(["rising", "peak", "fading"]),
    }),
  ),
  competitorMoves: z.array(z.object({ competitor: z.string(), what: z.string(), result: z.string() })),
  ideas: z.array(
    z.object({
      title: z.string(),
      why: z.string(),
      format: z.enum(["image", "carousel", "video"]),
      platforms: z.array(z.enum(["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"])),
    }),
  ),
  sources: z.array(z.object({ title: z.string(), url: z.string() })),
});

/**
 * Pasul 1: Claude caută pe web trenduri și ce fac competitorii.
 * Pasul 2: transformă notițele într-un raport structurat (structured outputs nu merg împreună cu citările căutării).
 */
export async function runResearch(project: Project, today: string): Promise<ResearchReport & { sources: { title: string; url: string }[] }> {
  const client = claude();
  const competitors = project.competitors.map((c) => `${c.name} (${c.handle} pe ${c.platform})`).join(", ");

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: "user",
      content: [
        `Azi e ${today}. Fă research de social media pentru brandul de mai jos, pe piața din România.`,
        "1. Ce trenduri de conținut (formate, teme, sunete, sezonalitate) sunt relevante acum pentru această industrie.",
        `2. Ce au postat recent competitorii și ce le-a mers: ${competitors || "găsește 2-3 competitori locali relevanți"}.`,
        "3. Propune 5 idei de postări concrete, potrivite tonului brandului și obiectivelor lui.",
        "Folosește căutarea pe web. Notează pentru fiecare afirmație sursa (titlu și URL). Scrie în română.",
        "",
        brandContext(project),
      ].join("\n"),
    },
  ];

  let notes = "";
  for (let turn = 0; turn < 4; turn++) {
    const stream = client.beta.messages.stream({
      ...modelParams(),
      max_tokens: 32000,
      output_config: { effort: "high" },
      tools: [webSearchTool(8)],
      messages,
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === "refusal") throw new Error("Modelul a refuzat cererea de research.");
    notes += msg.content
      .map((b) => (b.type === "text" ? b.text + (b.citations?.length ? ` [surse: ${b.citations.map((c) => ("url" in c ? c.url : "")).filter(Boolean).join(", ")}]` : "") : ""))
      .join("");
    if (msg.stop_reason !== "pause_turn") break;
    // Căutarea a fost întreruptă pe server: trimitem tura înapoi ca să continue.
    messages.push({ role: "assistant", content: msg.content });
  }

  const structured = await client.beta.messages.parse({
    ...modelParams(),
    max_tokens: 16000,
    output_config: { effort: "low", format: betaZodOutputFormat(Report) },
    system: "Transformi notițele de research în raportul cerut, în română, fără să inventezi nimic în plus. Exact 3 trenduri, maxim 4 mișcări ale competitorilor, exact 5 idei.",
    messages: [{ role: "user", content: notes }],
  });
  const report = structured.parsed_output;
  if (!report) throw new Error("Raportul de research nu a putut fi structurat.");

  return {
    id: `r_${Date.now()}`,
    projectId: project.id,
    date: today,
    trends: report.trends,
    competitorMoves: report.competitorMoves,
    ideas: report.ideas.map((i, n) => ({ ...i, id: `live_${Date.now().toString(36)}_${n}` })),
    sources: report.sources,
  };
}
