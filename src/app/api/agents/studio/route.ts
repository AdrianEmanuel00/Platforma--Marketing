import { NextResponse } from "next/server";
import { z } from "zod";
import { agentErrorMessage, aiStatus } from "@/lib/ai/clients";
import { runCopywriter } from "@/lib/agents/copywriter";
import { runCreative } from "@/lib/agents/creative";
import { getProject } from "@/lib/demo-data";

export const maxDuration = 120;

const Body = z.object({
  projectSlug: z.string(),
  idea: z.string().min(3).max(1000),
  format: z.enum(["image", "carousel", "video"]),
  platforms: z.array(z.enum(["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"])).min(1),
  withImage: z.boolean().default(true),
});

// Studio: Copywriter scrie textele și promptul vizual, apoi Creative generează imaginea.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  const { projectSlug, idea, format, platforms, withImage } = parsed.data;

  const project = getProject(projectSlug);
  if (!project) return NextResponse.json({ error: "Proiect inexistent." }, { status: 404 });

  const keys = aiStatus();
  if (!keys.anthropic) {
    return NextResponse.json({ error: "Lipsește ANTHROPIC_API_KEY, așa că agenții rulează doar în demo." }, { status: 503 });
  }

  try {
    const copy = await runCopywriter({ project, idea, format, platforms });
    let image: { url: string; model: string } | null = null;
    let imageError: string | null = null;
    if (withImage) {
      if (!keys.fal) imageError = "Lipsește FAL_KEY, așa că imaginea nu a fost generată.";
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
