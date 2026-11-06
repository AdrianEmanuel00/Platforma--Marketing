import "server-only";
import { falClient } from "../ai/clients";
import type { AssetKind, Platform } from "../types";

export const IMAGE_MODEL = "fal-ai/nano-banana-pro";

/** Formatul imaginii după platforma principală: vertical pentru TikTok/Shorts, 4:5 pentru Instagram. */
function aspectFor(platforms: Platform[], format: AssetKind) {
  if (format === "video" || platforms[0] === "tiktok" || platforms[0] === "youtube") return "9:16";
  if (platforms[0] === "instagram") return "4:5";
  if (platforms[0] === "linkedin" || platforms[0] === "x") return "16:9";
  return "1:1";
}

/**
 * Generează vizualul postării. Pentru video, deocamdată generăm cadrul principal (copertă);
 * video-ul propriu-zis (Veo 3.1) vine într-un pas următor, ca job în fundal.
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

  const result = await falClient().subscribe(IMAGE_MODEL, {
    input: {
      prompt,
      aspect_ratio: aspectFor(input.platforms, input.format),
      num_images: 1,
      resolution: "1K",
      output_format: "jpeg",
    },
  });
  const data = result.data as { images?: { url: string }[] };
  const url = data.images?.[0]?.url;
  if (!url) throw new Error("Generatorul de imagini nu a returnat nicio imagine.");
  return { url, model: IMAGE_MODEL };
}
