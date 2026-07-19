import { NextResponse } from "next/server";
import { canonicalSurfaceShaderContract, cloneSurfaceProfile } from "@/lib/render-engine/canonical-render-engine";
import { validateSurfaceProfile } from "@/lib/render-engine/render-validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = cloneSurfaceProfile(canonicalSurfaceShaderContract);
  const validation = validateSurfaceProfile(profile);

  return NextResponse.json({
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    validation: {
      status: validation.status,
      issues: validation.issues
    },
    profiles: [profile]
  });
}
