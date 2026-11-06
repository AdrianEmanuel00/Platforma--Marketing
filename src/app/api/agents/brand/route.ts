import { NextResponse } from "next/server";
import { z } from "zod";
import { agentErrorMessage, aiStatus } from "@/lib/ai/clients";
import { runBrandAgent } from "@/lib/agents/brand";

export const maxDuration = 180;

const Body = z.object({
  name: z.string().min(1).max(120),
  industry: z.string().max(120).default(""),
  website: z.string().min(3).max(300),
  notes: z.string().max(2000).default(""),
});

// Agentul Brand: propune identitatea unui client nou din site-ul lui.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Completează numele și site-ul." }, { status: 400 });
  if (!aiStatus().anthropic) {
    return NextResponse.json({ error: "Agentul Brand pornește după ce adaugi ANTHROPIC_API_KEY." }, { status: 503 });
  }
  try {
    return NextResponse.json(await runBrandAgent(parsed.data));
  } catch (e) {
    console.error("brand agent error", e);
    return NextResponse.json({ error: agentErrorMessage(e) }, { status: 500 });
  }
}
