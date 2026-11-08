import { NextResponse } from "next/server";
import { z } from "zod";
import { clearState, dbEnabled, loadState, saveState } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Account = z.enum(["agency", "business"]);

// Starea aplicației (proiecte, postări, rapoarte) pentru un cont, din baza locală.
export function GET(req: Request) {
  if (!dbEnabled()) return NextResponse.json({ enabled: false, state: null });
  const account = Account.safeParse(new URL(req.url).searchParams.get("account"));
  if (!account.success) return NextResponse.json({ error: "Cont invalid." }, { status: 400 });
  try {
    return NextResponse.json({ enabled: true, state: loadState(account.data) });
  } catch (e) {
    console.error("db read error", e);
    return NextResponse.json({ enabled: false, state: null, error: "Baza locală nu poate fi citită." });
  }
}

const Body = z.object({
  account: Account,
  state: z.object({ version: z.literal(1), projects: z.array(z.unknown()) }).passthrough().nullable(),
});

export async function PUT(req: Request) {
  if (!dbEnabled()) return NextResponse.json({ enabled: false });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  try {
    if (parsed.data.state === null) clearState(parsed.data.account);
    else saveState(parsed.data.account, parsed.data.state);
    return NextResponse.json({ enabled: true, ok: true });
  } catch (e) {
    console.error("db write error", e);
    return NextResponse.json({ error: "Baza locală nu poate fi scrisă." }, { status: 500 });
  }
}
