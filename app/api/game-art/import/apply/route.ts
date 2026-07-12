import { NextResponse } from "next/server";
import { applyGameArtImport, type GameArtImportRequest } from "@/lib/assets/game-art-import";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as GameArtImportRequest;
  const result = await applyGameArtImport(body);

  if (!result.ok) {
    return NextResponse.json({ error: "Game art import validation failed.", preview: result.preview }, { status: result.status });
  }

  return NextResponse.json(result);
}
