import "server-only";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { claude, fallbackParams, MODEL } from "../ai/clients";
import { brandContext, segmentLine } from "../ai/brand-context";
import { platformLabels } from "../format";
import type { AssetKind, AudienceSegment, Platform, Project } from "../types";

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

export interface SeriesContext {
  name: string;
  description: string;
  visualGuide: string;
  learnings: string[];
  /** Ultimele postări din serie, ca să nu se repete și să păstreze stilul. */
  recent: { title: string; caption: string; visualPrompt?: string }[];
}

function seriesBlock(series: SeriesContext) {
  return [
    "",
    `Postarea face parte din seria „${series.name}”: ${series.description}`,
    series.visualGuide && `Ghidul vizual al seriei (păstrează-l în promptul vizual): ${series.visualGuide}`,
    series.learnings.length > 0 && `Ce a mers până acum în serie:\n${series.learnings.map((l) => `- ${l}`).join("\n")}`,
    series.recent.length > 0 &&
      `Ultimele postări din serie (păstrează consecvența, dar nu repeta ideile sau formulările):\n${series.recent
        .map((r) => `- ${r.title}: ${r.caption.slice(0, 200)}${r.visualPrompt ? ` [vizual: ${r.visualPrompt.slice(0, 160)}]` : ""}`)
        .join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function runCopywriter(input: {
  project: Project;
  idea: string;
  format: AssetKind;
  platforms: Platform[];
  series?: SeriesContext;
  segment?: AudienceSegment;
  /** Indicațiile utilizatorului pentru imagine sau video; au prioritate față de stilul general. */
  direction?: string;
}): Promise<CopywriterResult> {
  const { project, idea, format, platforms, series, segment, direction } = input;

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
      series ? seriesBlock(series) : "",
    ].join("\n"),
    messages: [
      {
        role: "user",
        content: [
          `Ideea postării: ${idea}`,
          `Format: ${format === "video" ? "video scurt vertical" : format === "carousel" ? "carusel (descrie prima imagine)" : "imagine"}`,
          `Platforme: ${platforms.map((p) => platformLabels[p]).join(", ")}`,
          "",
          segment
            ? `Postarea e pentru segmentul ${segmentLine(segment)} Adaptează textul la tonul lor și promptul vizual la stilul lor vizual, chiar dacă diferă de stilul general al brandului.`
            : "",
          direction ? `Indicațiile utilizatorului pentru vizual (au prioritate): ${direction}` : "",
          "",
          "Reguli pe platformă:",
          ...platforms.map((p) => `- ${platformGuide[p]}`),
        ]
          .filter((l, i, all) => l !== "" || all[i - 1] !== "")
          .join("\n"),
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
