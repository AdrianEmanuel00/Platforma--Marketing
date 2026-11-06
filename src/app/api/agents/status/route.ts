import { NextResponse } from "next/server";
import { aiStatus } from "@/lib/ai/clients";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(aiStatus());
}
