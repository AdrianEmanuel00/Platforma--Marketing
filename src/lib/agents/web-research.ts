import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { claude, modelParams, webSearchTool } from "../ai/clients";

/**
 * Tiparul comun al agenților care caută pe web:
 * pasul 1, Claude caută și scrie notițe cu surse; pasul 2, notițele devin date structurate
 * (structured outputs nu merg împreună cu citările căutării, de aceea sunt doi pași).
 */
export async function searchThenStructure<T extends z.ZodType>(opts: {
  prompt: string;
  schema: T;
  structureInstructions: string;
  maxSearches?: number;
}): Promise<z.infer<T>> {
  const client = claude();
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: opts.prompt }];

  let notes = "";
  for (let turn = 0; turn < 4; turn++) {
    const stream = client.beta.messages.stream({
      ...modelParams(),
      max_tokens: 32000,
      output_config: { effort: "high" },
      tools: [webSearchTool(opts.maxSearches ?? 8)],
      messages,
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === "refusal") throw new Error("Modelul a refuzat cererea.");
    notes += msg.content
      .map((b) =>
        b.type === "text"
          ? b.text +
            (b.citations?.length
              ? ` [surse: ${b.citations
                  .map((c) => ("url" in c ? c.url : ""))
                  .filter(Boolean)
                  .join(", ")}]`
              : "")
          : "",
      )
      .join("");
    if (msg.stop_reason !== "pause_turn") break;
    // Căutarea a fost întreruptă pe server: trimitem tura înapoi ca să continue.
    messages.push({ role: "assistant", content: msg.content });
  }

  const structured = await client.beta.messages.parse({
    ...modelParams(),
    max_tokens: 16000,
    output_config: { effort: "low", format: betaZodOutputFormat(opts.schema) },
    system: `Transformi notițele de research în structura cerută, în română, fără să inventezi nimic în plus. ${opts.structureInstructions}`,
    messages: [{ role: "user", content: notes }],
  });
  const out = structured.parsed_output;
  if (!out) throw new Error("Rezultatul nu a putut fi structurat.");
  return out as z.infer<T>;
}
