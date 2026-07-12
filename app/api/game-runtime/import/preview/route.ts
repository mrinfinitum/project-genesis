import { NextResponse } from "next/server";
import { createImportPreview, type RuntimeImportRequest } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as RuntimeImportRequest;
  const preview = await createImportPreview(body);
  return NextResponse.json(preview);
}
