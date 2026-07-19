import { NextResponse } from "next/server";
import { canonicalSurfaceShaderContract, cloneSurfaceProfile } from "@/lib/render-engine/canonical-render-engine";
import { validateSurfaceProfile } from "@/lib/render-engine/render-validation";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ profileId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { profileId } = await context.params;
  const profile = cloneSurfaceProfile(canonicalSurfaceShaderContract);

  if (profileId !== profile.profileId) {
    return NextResponse.json({
      error: {
        code: "RENDER_SURFACE_PROFILE_NOT_FOUND",
        message: `Render surface profile not found: ${profileId}`
      }
    }, { status: 404 });
  }

  const validation = validateSurfaceProfile(profile);
  return NextResponse.json({
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    validation: {
      status: validation.status,
      issues: validation.issues
    },
    profile
  });
}
