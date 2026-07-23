import { NextResponse } from "next/server";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { validateEnvironmentComposerContract } from "@/lib/environment-composer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const runtime = await buildCanonicalRuntimeExportPayload();
    const contract = runtime.environmentComposerContract;
    const issues = validateEnvironmentComposerContract(contract);
    const errors = issues.filter((issue) => issue.severity === "error");

    if (errors.length) {
      return NextResponse.json(
        {
          error: "Environment Composer export validation failed.",
          validation: {
            status: "Blocked",
            errorCount: errors.length,
            warningCount: issues.length - errors.length,
            issues
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      metadata: {
        architectureVersion: runtime.metadata.architectureVersion,
        runtimeVersion: runtime.metadata.schemaVersion,
        contentVersion: runtime.metadata.contentVersion,
        checksum: runtime.metadata.checksum,
        validationStatus: issues.length ? "Ready With Warnings" : "Ready"
      },
      environmentComposerContract: contract
    });
  } catch {
    return NextResponse.json({ error: "Environment Composer export failed." }, { status: 500 });
  }
}
