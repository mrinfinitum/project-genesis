import { NextResponse } from "next/server";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, validateRobloxRuntimePayload } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const runtimePayload = await buildCanonicalRuntimeExportPayload();
    const robloxPayload = buildRobloxRuntimePayload(runtimePayload);
    const validation = validateRobloxRuntimePayload(robloxPayload);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Roblox runtime export validation failed.",
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

    return NextResponse.json(robloxPayload);
  } catch {
    return NextResponse.json({ error: "Roblox runtime export failed." }, { status: 500 });
  }
}
