import { NextResponse } from "next/server";
import { generatePrototypeSnapshot, getLatestPrototypeSnapshot } from "@/lib/game-content/prototype";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getLatestPrototypeSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
      "X-Project-Genesis-Prototype-Version": String(snapshot.contentVersion),
      "X-Project-Genesis-Prototype-Schema": snapshot.schemaVersion
    }
  });
}

export async function POST() {
  const result = await generatePrototypeSnapshot();
  if (!result.ok) {
    return NextResponse.json({ error: result.message, validation: result.validation }, { status: result.status });
  }

  return NextResponse.json(result.snapshot, { status: 201 });
}
