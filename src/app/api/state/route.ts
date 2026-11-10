import { NextResponse } from "next/server";
import { z } from "zod";
import { kvBackend, kvDelete, kvGet, kvSet } from "@/lib/server/kv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Account = z.enum(["agency", "business"]);

// Starea aplicației (proiecte, postări, rapoarte) pentru un cont: în Supabase sau în baza locală.
export async function GET(req: Request) {
  const backend = kvBackend();
  if (backend === "none") return NextResponse.json({ enabled: false, backend, state: null });
  const account = Account.safeParse(new URL(req.url).searchParams.get("account"));
  if (!account.success) return NextResponse.json({ error: "Cont invalid." }, { status: 400 });
  try {
    return NextResponse.json({ enabled: true, backend, state: await kvGet(`state/${account.data}`) });
  } catch (e) {
    console.error("state read error", e);
    return NextResponse.json({ enabled: false, backend, state: null, error: e instanceof Error ? e.message : "Citirea a eșuat." });
  }
}

const Body = z.object({
  account: Account,
  state: z.object({ version: z.literal(1), projects: z.array(z.unknown()) }).passthrough().nullable(),
});

export async function PUT(req: Request) {
  const backend = kvBackend();
  if (backend === "none") return NextResponse.json({ enabled: false, backend });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  try {
    const key = `state/${parsed.data.account}`;
    if (parsed.data.state === null) await kvDelete(key);
    else await kvSet(key, parsed.data.state);
    return NextResponse.json({ enabled: true, backend, ok: true });
  } catch (e) {
    console.error("state write error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Salvarea a eșuat." }, { status: 500 });
  }
}
