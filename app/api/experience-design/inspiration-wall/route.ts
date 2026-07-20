import { NextResponse } from "next/server";
import { getInspirationWallManifest } from "@/lib/experience-design/inspiration-wall";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getInspirationWallManifest(), {
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
  });
}
