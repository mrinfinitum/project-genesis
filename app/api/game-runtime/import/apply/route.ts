import { NextResponse } from "next/server";
import { applyImportPreview, type RuntimeImportRequest } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as RuntimeImportRequest;
  const result = await applyImportPreview(body);
  if (!result.ok) {
    return NextResponse.json({ error: "Runtime import validation failed.", preview: result.preview }, { status: result.status });
  }

  return NextResponse.json(result);
}
