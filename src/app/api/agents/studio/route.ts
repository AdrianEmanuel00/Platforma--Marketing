import { NextResponse } from "next/server";
import { z } from "zod";
import { agentErrorMessage, aiStatus } from "@/lib/ai/clients";
import { runCopywriter } from "@/lib/agents/copywriter";
import { runCreative } from "@/lib/agents/creative";
import { ProjectSchema } from "@/lib/project-schema";

export const maxDuration = 120;

const Body = z.object({
  project: ProjectSchema,
  idea: z.string().min(3).max(1000),
  format: z.enum(["image", "carousel", "video"]),
  platforms: z.array(z.enum(["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"])).min(1),
  withImage: z.boolean().default(true),
  segmentId: z.string().max(80).optional(),
  direction: z.string().max(1000).optional(),
  series: z
    .object({
      name: z.string().max(120),
      description: z.string().max(1000),
      visualGuide: z.string().max(1000),
      learnings: z.array(z.string().max(400)).max(12),
      recent: z
        .array(z.object({ title: z.string().max(200), caption: z.string().max(2000), visualPrompt: z.string().max(2000).optional() }))
        .max(8),
    })
    .optional(),
});

// Studio: Copywriter scrie textele și promptul vizual, apoi Creative generează imaginea.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  const { project, idea, format, platforms, withImage, series, segmentId, direction } = parsed.data;
  const segment = project.brand.segments?.find((s) => s.id === segmentId);

  const keys = aiStatus();
  if (!keys.anthropic) {
    return NextResponse.json({ error: "Lipsește ANTHROPIC_API_KEY, așa că agenții rulează doar în demo." }, { status: 503 });
  }

  try {
    const copy = await runCopywriter({ project, idea, format, platforms, series, segment, direction });
    let image: { url: string; model: string } | null = null;
    let imageError: string | null = null;
    if (withImage) {
      if (!keys.imageReady) imageError = `Furnizorul de imagini „${keys.imageProvider}” nu are cheia setată, așa că imaginea nu a fost generată.`;
      else {
        try {
          image = await runCreative({ visualPrompt: copy.visualPrompt, overlayText: copy.overlayText, format, platforms });
        } catch (e) {
          imageError = e instanceof Error ? e.message : "Generarea imaginii a eșuat.";
        }
      }
    }
    return NextResponse.json({ ...copy, image, imageError });
  } catch (e) {
    console.error("studio agent error", e);
    return NextResponse.json({ error: agentErrorMessage(e) }, { status: 500 });
  }
}
