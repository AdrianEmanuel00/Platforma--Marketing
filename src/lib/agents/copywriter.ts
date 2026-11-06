import "server-only";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { claude, fallbackParams, MODEL } from "../ai/clients";
import { brandContext } from "../ai/brand-context";
import { platformLabels } from "../format";
import type { AssetKind, Platform, Project } from "../types";

const platformGuide: Record<Platform, string> = {
  instagram: "Instagram: prima frază agață, apoi 2-4 rânduri scurte, emoji cu măsură, 3-6 hashtag-uri relevante.",
  facebook: "Facebook: ton de conversație, 1-3 fraze, o întrebare sau un îndemn clar, fără hashtag-uri sau maxim 1.",
  tiktok: "TikTok: foarte scurt (sub 150 de caractere), direct, curiozitate, 2-4 hashtag-uri.",
  linkedin: "LinkedIn: profesionist dar uman, 3-5 fraze, o idee de valoare, fără emoji în exces, 0-3 hashtag-uri.",
  youtube: "YouTube Shorts: titlu-descriere scurtă, cuvinte cheie căutabile, 2-3 hashtag-uri.",
  x: "X: sub 260 de caractere, o singură idee, 0-2 hashtag-uri.",
};

const Output = z.object({
  variants: z.array(
    z.object({
      platform: z.enum(["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"]),
      caption: z.string(),
      hashtags: z.array(z.string()),
    }),
  ),
  visualPrompt: z
    .string()
    .describe("Prompt în engleză pentru generatorul de imagini, care descrie vizualul postării în stilul brandului."),
  overlayText: z.string().describe("Textul scurt (max 6 cuvinte, în română) scris pe imagine, sau gol."),
});

export type CopywriterResult = z.infer<typeof Output>;

export async function runCopywriter(input: {
  project: Project;
  idea: string;
  format: AssetKind;
  platforms: Platform[];
}): Promise<CopywriterResult> {
  const { project, idea, format, platforms } = input;

  const response = await claude().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    ...fallbackParams,
    output_config: { effort: "high", format: betaZodOutputFormat(Output) },
    system: [
      "Ești copywriterul unei agenții de social media din România. Scrii în română corectă, cu diacritice.",
      "Respecți strict identitatea brandului de mai jos: tonul, publicul și cuvintele interzise.",
      "Scrii câte o variantă pentru fiecare platformă cerută, adaptată regulilor ei, nu același text copiat.",
      "Pentru vizual scrii un prompt în engleză pentru un generator de imagini: subiect, compoziție, lumină, paleta brandului (dă culorile hex), fără logo-uri inventate.",
      "",
      brandContext(project),
    ].join("\n"),
    messages: [
      {
        role: "user",
        content: [
          `Ideea postării: ${idea}`,
          `Format: ${format === "video" ? "video scurt vertical" : format === "carousel" ? "carusel (descrie prima imagine)" : "imagine"}`,
          `Platforme: ${platforms.map((p) => platformLabels[p]).join(", ")}`,
          "",
          "Reguli pe platformă:",
          ...platforms.map((p) => `- ${platformGuide[p]}`),
        ].join("\n"),
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Modelul a refuzat cererea. Reformulează ideea.");
  }
  const out = response.parsed_output;
  if (!out) throw new Error("Copywriterul nu a returnat un rezultat valid.");
  return { ...out, variants: out.variants.filter((v) => platforms.includes(v.platform)) };
}
