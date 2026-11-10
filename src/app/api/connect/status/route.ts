import { NextResponse } from "next/server";
import { kvBackend } from "@/lib/server/kv";
import { publicConnections } from "@/lib/social/connections";
import { metaConfigured } from "@/lib/social/meta";
import { metaRedirectUri } from "@/lib/social/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ce conexiuni reale are un proiect (fără token-uri) și ce lipsește ca să le poți face.
export async function GET(req: Request) {
  const project = new URL(req.url).searchParams.get("project");
  const storage = kvBackend();
  const base = { metaConfigured: metaConfigured(), storage, redirectUri: metaRedirectUri(req) };
  if (!project || storage === "none") return NextResponse.json({ ...base, connections: {} });
  try {
    return NextResponse.json({ ...base, connections: await publicConnections(project) });
  } catch (e) {
    return NextResponse.json({ ...base, connections: {}, error: e instanceof Error ? e.message : "Citirea a eșuat." });
  }
}
