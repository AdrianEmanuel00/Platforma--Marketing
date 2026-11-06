import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { claude, fallbackParams, MODEL } from "../ai/clients";

const BrandOutput = z.object({
  colors: z.array(z.object({ name: z.string(), hex: z.string().describe("Culoare hex, de forma #RRGGBB") })),
  fonts: z.object({ heading: z.string(), body: z.string() }),
  logoText: z.string(),
  voice: z.string(),
  audience: z.string(),
  doWords: z.array(z.string()),
  dontWords: z.array(z.string()),
  visualStyle: z.string(),
  goals: z.array(z.string()),
});

export type BrandAgentResult = z.infer<typeof BrandOutput>;

/**
 * Agentul Brand: citește site-ul (web fetch) și propune identitatea.
 * Pasul 2 structurează notițele (structured outputs nu merg împreună cu citările).
 */
export async function runBrandAgent(input: { name: string; industry: string; website: string; notes: string }) {
  const client = claude();
  const url = input.website.startsWith("http") ? input.website : `https://${input.website}`;

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: "user",
      content: [
        `Analizează brandul „${input.name}” (${input.industry}). Site: ${url}`,
        input.notes ? `Note de la client: ${input.notes}` : "",
        "Citește site-ul (pagina principală și, dacă e util, 1-2 pagini relevante).",
        "Descrie: culorile principale (cu cod hex, din CSS sau din imagini), fonturile, tonul vocii, publicul țintă,",
        "expresii caracteristice, ce ar trebui evitat, stilul vizual al fotografiilor și 2-3 obiective realiste de social media.",
        "Dacă site-ul nu se poate citi, propune o identitate potrivită industriei și spune clar asta. Scrie în română.",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];

  let notes = "";
  for (let turn = 0; turn < 3; turn++) {
    const msg = await client.beta.messages
      .stream({
        model: MODEL,
        max_tokens: 16000,
        ...fallbackParams,
        output_config: { effort: "medium" },
        tools: [{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 3 }],
        messages,
      })
      .finalMessage();
    if (msg.stop_reason === "refusal") throw new Error("Modelul a refuzat cererea.");
    notes += msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    if (msg.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: msg.content });
  }

  const structured = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    ...fallbackParams,
    output_config: { effort: "low", format: betaZodOutputFormat(BrandOutput) },
    system:
      "Transformi analiza de brand în identitatea cerută, în română. 3-5 culori hex valide (#RRGGBB), fonturi disponibile pe Google Fonts, 3-6 cuvinte de folosit, 2-5 cuvinte interzise.",
    messages: [{ role: "user", content: `Brand: ${input.name}\n\n${notes}` }],
  });
  const out = structured.parsed_output;
  if (!out) throw new Error("Agentul Brand nu a returnat o identitate validă.");
  return {
    ...out,
    colors: out.colors.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c.hex)).slice(0, 6),
  };
}
