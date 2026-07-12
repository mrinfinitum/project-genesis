import { NextResponse } from "next/server";
import { getLatestPublishedRelease, manifestFromRelease } from "@/lib/game-content/publishing";

export const dynamic = "force-dynamic";

export async function GET() {
  const release = await getLatestPublishedRelease();
  return NextResponse.json(manifestFromRelease(release), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
