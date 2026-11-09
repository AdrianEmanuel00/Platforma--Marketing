import { NextResponse } from "next/server";
import { z } from "zod";
import { agentErrorMessage, aiStatus } from "@/lib/ai/clients";
import { runKeywords } from "@/lib/agents/keywords";
import { sampleKeywords } from "@/lib/agents/samples";
import { ProjectSchema } from "@/lib/project-schema";
import type { Project } from "@/lib/types";

export const maxDuration = 300;

const Body = z.object({ project: ProjectSchema });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  const project = parsed.data.project as Project;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(new Date());
  if (!aiStatus().anthropic) return NextResponse.json(sampleKeywords(project, today));
  try {
    return NextResponse.json(await runKeywords(project, today));
  } catch (e) {
    console.error("keywords agent error", e);
    return NextResponse.json({ error: agentErrorMessage(e) }, { status: 500 });
  }
}
