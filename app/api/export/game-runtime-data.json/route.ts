import { NextResponse } from "next/server";
import { buildCanonicalRuntimeExportPayload, validateGameRuntimeData } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

const publicRuntimeHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
  "X-Project-Genesis-Access-Level": "public-published"
};

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

    return NextResponse.json(payload, {
      headers: {
        ...publicRuntimeHeaders,
        "X-Project-Genesis-Schema-Version": payload.metadata.schemaVersion,
        "X-Project-Genesis-Content-Version": String(payload.metadata.contentVersion),
        "X-Project-Genesis-Checksum": payload.metadata.checksum,
        "X-Project-Genesis-Validation-Status": payload.metadata.validationStatus
      }
    });
  } catch {
    return NextResponse.json({ error: "Canonical runtime export failed." }, { status: 500 });
  }
}
