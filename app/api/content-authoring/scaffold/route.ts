import { NextResponse } from "next/server";
import { createEraScaffold, type CreateEraScaffoldInput } from "@/lib/content-authoring/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as Partial<CreateEraScaffoldInput>;
    if (!body.eraId || !body.mode) {
      return NextResponse.json({ error: "eraId and mode are required." }, { status: 400 });
    }
    if (!["starter_kit", "duplicate_survival"].includes(body.mode)) {
      return NextResponse.json({ error: "mode must be starter_kit or duplicate_survival." }, { status: 400 });
    }
    const state = await createEraScaffold({ eraId: body.eraId, mode: body.mode });
    return NextResponse.json({ state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content authoring scaffold failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
