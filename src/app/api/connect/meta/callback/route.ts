import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { safeEqual, sign } from "@/lib/server/crypto";
import { saveMetaConnection } from "@/lib/social/connections";
import { exchangeCode, listPages } from "@/lib/social/meta";
import { appOrigin, metaRedirectUri } from "@/lib/social/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const State = z.object({ p: z.string(), s: z.string(), n: z.string() });

// Facebook se întoarce aici după login: luăm token-ul, paginile și Instagram-ul legat de ele.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const [payload = "", sig = ""] = (sp.get("state") ?? "").split(".");
  let state: z.infer<typeof State> | null = null;
  try {
    state = State.parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
  } catch {
    state = null;
  }
  const origin = appOrigin(req);
  if (!state) return NextResponse.redirect(`${origin}/app?meta=invalid`);
  const back = (q: string) => {
    const res = NextResponse.redirect(`${origin}/app/${encodeURIComponent(state!.s)}/accounts?${q}`);
    res.cookies.delete("meta_oauth");
    return res;
  };

  const cookie = req.cookies.get("meta_oauth")?.value ?? "";
  if (!safeEqual(sig, sign(payload)) || !safeEqual(cookie, state.n)) return back("meta=invalid");
  if (sp.get("error")) return back("meta=cancelled");
  const code = sp.get("code");
  if (!code) return back("meta=cancelled");

  try {
    const { access_token } = await exchangeCode(code, metaRedirectUri(req));
    const pages = await listPages(access_token);
    if (pages.length === 0) return back("meta=no_pages");
    await saveMetaConnection(state.p, pages);
    return back("meta=connected");
  } catch (e) {
    console.error("meta callback error", e);
    return back(`meta=error&detail=${encodeURIComponent(e instanceof Error ? e.message.slice(0, 200) : "")}`);
  }
}
