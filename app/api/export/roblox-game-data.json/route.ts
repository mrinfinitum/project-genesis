import { NextResponse } from "next/server";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, validateRobloxRuntimePayload } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

const publicRuntimeHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
  "X-Project-Genesis-Access-Level": "public-published"
};

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

    return NextResponse.json(robloxPayload, {
      headers: {
        ...publicRuntimeHeaders,
        "X-Project-Genesis-Schema-Version": robloxPayload.metadata.schemaVersion,
        "X-Project-Genesis-Content-Version": String(robloxPayload.metadata.contentVersion),
        "X-Project-Genesis-Checksum": robloxPayload.metadata.checksum,
        "X-Project-Genesis-Validation-Status": robloxPayload.metadata.validationStatus
      }
    });
  } catch {
    return NextResponse.json({ error: "Roblox runtime export failed." }, { status: 500 });
  }
}
