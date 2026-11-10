import "server-only";
import { fal } from "@fal-ai/client";

/**
 * Stratul de generare a imaginilor. Fiecare furnizor primește același input și întoarce un URL,
 * așa că putem schimba furnizorul dintr-o variabilă de mediu (IMAGE_PROVIDER), fără alt cod.
 *
 * - "pollinations": gratuit, fără cheie. Pentru testare.
 * - "fal": Nano Banana Pro prin fal.ai (FAL_KEY). Calitate foarte bună, cu plată.
 * - "higgsfield": rezervat pentru calitate maximă (imagini + video). Se conectează într-un pas următor.
 *
 * Fără IMAGE_PROVIDER: fal dacă există FAL_KEY, altfel pollinations.
 */
export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9";
export interface ImageRequest {
  prompt: string;
  aspectRatio: AspectRatio;
}
export interface ImageResult {
  url: string;
  model: string;
}

interface ImageProvider {
  id: "pollinations" | "fal" | "higgsfield";
  model: string;
  /** Are tot ce îi trebuie (chei) ca să ruleze. */
  ready: boolean;
  generate(req: ImageRequest): Promise<ImageResult>;
}

const SIZES: Record<AspectRatio, [number, number]> = {
  "1:1": [1024, 1024],
  "4:5": [896, 1120],
  "9:16": [768, 1344],
  "16:9": [1344, 768],
};

const pollinations: ImageProvider = {
  id: "pollinations",
  model: "pollinations/flux",
  ready: true,
  async generate({ prompt, aspectRatio }) {
    const [width, height] = SIZES[aspectRatio];
    const seed = Math.floor(Math.random() * 1_000_000);
    const params = new URLSearchParams({
      width: String(width),
      height: String(height),
      seed: String(seed),
      model: "flux",
      nologo: "true",
      enhance: "false",
    });
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 1500))}?${params}`;
    // Cerem imaginea o dată pe server: o generează și o păstrează în cache, iar noi aflăm dacă a mers.
    const res = await fetch(url, { signal: AbortSignal.timeout(90_000) });
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
      throw new Error(`Generatorul gratuit de imagini (Pollinations) a răspuns cu ${res.status}. Încearcă din nou peste un minut.`);
    }
    await res.arrayBuffer();
    return { url, model: this.model };
  },
};

let falReady = false;
const falProvider: ImageProvider = {
  id: "fal",
  model: "fal-ai/nano-banana-pro",
  get ready() {
    return Boolean(process.env.FAL_KEY);
  },
  async generate({ prompt, aspectRatio }) {
    if (!falReady) {
      fal.config({ credentials: process.env.FAL_KEY });
      falReady = true;
    }
    const result = await fal.subscribe(this.model, {
      input: { prompt, aspect_ratio: aspectRatio, num_images: 1, resolution: "1K", output_format: "jpeg" },
    });
    const url = (result.data as { images?: { url: string }[] }).images?.[0]?.url;
    if (!url) throw new Error("Generatorul de imagini nu a returnat nicio imagine.");
    return { url, model: this.model };
  },
};

const higgsfield: ImageProvider = {
  id: "higgsfield",
  model: "higgsfield",
  get ready() {
    return Boolean(process.env.HIGGSFIELD_API_KEY);
  },
  async generate() {
    // Locul pentru integrarea Higgsfield (imagini + video). Până atunci, spunem clar ce lipsește.
    throw new Error("Higgsfield nu este încă conectat. Folosește IMAGE_PROVIDER=pollinations sau fal.");
  },
};

const PROVIDERS = { pollinations, fal: falProvider, higgsfield };

export function imageProvider(): ImageProvider {
  const chosen = process.env.IMAGE_PROVIDER?.trim().toLowerCase();
  if (chosen && chosen in PROVIDERS) return PROVIDERS[chosen as keyof typeof PROVIDERS];
  return process.env.FAL_KEY ? falProvider : pollinations;
}
