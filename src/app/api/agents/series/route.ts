import { NextResponse } from "next/server";
import { z } from "zod";
import { agentErrorMessage, aiStatus } from "@/lib/ai/clients";
import { runSeriesCoach } from "@/lib/agents/series-coach";
import { ProjectSchema } from "@/lib/project-schema";

export const maxDuration = 120;

const Body = z.object({
  project: ProjectSchema,
  series: z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(1000),
    visualGuide: z.string().max(1000),
    learnings: z.array(z.string().max(400)).max(12),
  }),
  history: z
    .array(
      z.object({
        title: z.string().max(200),
        status: z.string().max(40),
        date: z.string().max(40).optional(),
        captions: z.array(z.string().max(2000)).max(6),
        visualPrompt: z.string().max(2000).optional(),
        metrics: z
          .object({ reach: z.number(), likes: z.number(), comments: z.number(), shares: z.number() })
          .optional(),
      }),
    )
    .max(40),
});

// Agentul seriei: învață din istoricul seriei și propune următoarele postări.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  if (!aiStatus().anthropic) {
    return NextResponse.json({ error: "Agentul seriei pornește după ce adaugi ANTHROPIC_API_KEY." }, { status: 503 });
  }
  try {
    return NextResponse.json(await runSeriesCoach(parsed.data));
  } catch (e) {
    console.error("series agent error", e);
    return NextResponse.json({ error: agentErrorMessage(e) }, { status: 500 });
  }
}
