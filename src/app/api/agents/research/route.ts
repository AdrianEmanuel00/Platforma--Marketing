import { NextResponse } from "next/server";
import { z } from "zod";
import { agentErrorMessage, aiStatus } from "@/lib/ai/clients";
import { runResearch } from "@/lib/agents/research";
import { getProject } from "@/lib/demo-data";

// Research-ul caută pe web și poate dura câteva minute.
export const maxDuration = 300;

const Body = z.object({ projectSlug: z.string() });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  const project = getProject(parsed.data.projectSlug);
  if (!project) return NextResponse.json({ error: "Proiect inexistent." }, { status: 404 });
  if (!aiStatus().anthropic) {
    return NextResponse.json({ error: "Lipsește ANTHROPIC_API_KEY, așa că agenții rulează doar în demo." }, { status: 503 });
  }

  try {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(new Date());
    return NextResponse.json(await runResearch(project, today));
  } catch (e) {
    console.error("research agent error", e);
    return NextResponse.json({ error: agentErrorMessage(e) }, { status: 500 });
  }
}
