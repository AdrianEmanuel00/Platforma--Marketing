import { NextResponse } from "next/server";
import { ACCESS_COOKIE, accessToken } from "@/lib/access";

export async function POST(req: Request) {
  const expected = process.env.APP_PASSWORD;
  const form = await req.formData().catch(() => null);
  const password = String(form?.get("password") ?? "");
  const next = String(form?.get("next") ?? "/app");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  const origin = new URL(req.url).origin;
  if (!expected || password !== expected) return NextResponse.redirect(`${origin}/unlock?wrong=1&next=${encodeURIComponent(safeNext)}`, 303);
  const res = NextResponse.redirect(`${origin}${safeNext}`, 303);
  res.cookies.set(ACCESS_COOKIE, await accessToken(expected), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
