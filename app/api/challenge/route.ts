import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/challenge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(createChallenge(), {
    headers: { "Cache-Control": "no-store" },
  });
}
