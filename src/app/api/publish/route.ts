import { NextResponse } from "next/server";
import { z } from "zod";
import { selectedMetaPage } from "@/lib/social/connections";
import { publishFacebook, publishInstagram } from "@/lib/social/meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const Body = z.object({
  projectId: z.string().min(1).max(80),
  platform: z.enum(["facebook", "instagram"]),
  caption: z.string().max(5000),
  imageUrl: z.string().url().max(4000).optional(),
});

// Publică o postare pe pagina de Facebook sau pe contul de Instagram conectat la proiect.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  const { projectId, platform, caption, imageUrl } = parsed.data;
  try {
    const page = await selectedMetaPage(projectId);
    if (!page) return NextResponse.json({ error: "Conectează întâi contul de Facebook la acest proiect." }, { status: 400 });
    if (platform === "facebook") return NextResponse.json(await publishFacebook(page, caption, imageUrl));
    if (!page.instagram) {
      return NextResponse.json(
        { error: `Pagina „${page.name}” nu are un cont de Instagram Business legat de ea. Leagă-le din setările Instagram.` },
        { status: 400 },
      );
    }
    return NextResponse.json(await publishInstagram({ id: page.instagram.id, token: page.token }, caption, imageUrl));
  } catch (e) {
    console.error("publish error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Publicarea a eșuat." }, { status: 502 });
  }
}
