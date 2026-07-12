import { NextResponse } from "next/server";
import { buildCanonicalRuntimeExportPayload, validateGameRuntimeData } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await buildCanonicalRuntimeExportPayload();
    const validation = validateGameRuntimeData(payload);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Canonical runtime export validation failed.",
          validation: {
            status: validation.status,
            errorCount: validation.errorCount,
            warningCount: validation.warningCount,
            issues: validation.issues
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Canonical runtime export failed." }, { status: 500 });
  }
}
