import { NextResponse } from "next/server";
import { getInspirationWallManifest } from "@/lib/experience-design/inspiration-wall";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const manifest = await getInspirationWallManifest();
  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
