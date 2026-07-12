import { NextResponse } from "next/server";
import { createGameArtImportPreview, type GameArtImportRequest } from "@/lib/assets/game-art-import";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as GameArtImportRequest;
  const preview = await createGameArtImportPreview(body);
  return NextResponse.json(preview);
}
