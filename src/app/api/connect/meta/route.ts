import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sign } from "@/lib/server/crypto";
import { kvBackend } from "@/lib/server/kv";
import { removeMetaConnection, selectMetaPage } from "@/lib/social/connections";
import { metaAuthUrl, metaConfigured } from "@/lib/social/meta";
import { appOrigin, metaRedirectUri } from "@/lib/social/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Start = z.object({ project: z.string().min(1).max(80), slug: z.string().min(1).max(80) });

// Pornește login-ul cu Facebook pentru un proiect.
export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const parsed = Start.safeParse({ project: sp.get("project"), slug: sp.get("slug") });
  const back = (q: string) => NextResponse.redirect(`${appOrigin(req)}/app/${encodeURIComponent(sp.get("slug") ?? "")}/accounts?${q}`);
  if (!parsed.success) return back("meta=invalid");
  if (!metaConfigured()) return back("meta=not_configured");
  if (kvBackend() === "none") return back("meta=no_storage");

  const nonce = crypto.randomBytes(16).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ p: parsed.data.project, s: parsed.data.slug, n: nonce })).toString("base64url");
  const res = NextResponse.redirect(metaAuthUrl(metaRedirectUri(req), `${payload}.${sign(payload)}`));
  res.cookies.set("meta_oauth", nonce, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}

const Select = z.object({ projectId: z.string().min(1).max(80), pageId: z.string().min(1).max(80) });

// Alege pagina de Facebook (și Instagram-ul legat de ea) pe care publică proiectul.
export async function POST(req: Request) {
  const parsed = Select.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  try {
    await selectMetaPage(parsed.data.projectId, parsed.data.pageId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Nu am putut salva." }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const project = new URL(req.url).searchParams.get("project");
  if (!project) return NextResponse.json({ error: "Lipsește proiectul." }, { status: 400 });
  await removeMetaConnection(project);
  return NextResponse.json({ ok: true });
}
