import { NextResponse } from "next/server";
import { getClientKey, peekQuota } from "@/lib/rateLimiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const quota = peekQuota(getClientKey(request));
  return NextResponse.json(quota, { headers: { "Cache-Control": "no-store" } });
}
