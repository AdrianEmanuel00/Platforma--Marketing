import "server-only";
import { imageProvider, type AspectRatio } from "../ai/images";
import type { AssetKind, Platform } from "../types";

/** Formatul imaginii după platforma principală: vertical pentru TikTok/Shorts, 4:5 pentru Instagram. */
function aspectFor(platforms: Platform[], format: AssetKind): AspectRatio {
  if (format === "video" || platforms[0] === "tiktok" || platforms[0] === "youtube") return "9:16";
  if (platforms[0] === "instagram") return "4:5";
  if (platforms[0] === "linkedin" || platforms[0] === "x") return "16:9";
  return "1:1";
}

/**
 * Generează vizualul postării cu furnizorul de imagini ales (vezi src/lib/ai/images.ts).
 * Pentru video, deocamdată generăm cadrul principal (copertă).
 */
export async function runCreative(input: {
  visualPrompt: string;
  overlayText: string;
  format: AssetKind;
  platforms: Platform[];
}) {
  const prompt = input.overlayText
    ? `${input.visualPrompt}\n\nInclude this exact short headline, clearly legible, in tasteful typography: "${input.overlayText}"`
    : input.visualPrompt;
  return imageProvider().generate({ prompt, aspectRatio: aspectFor(input.platforms, input.format) });
}
