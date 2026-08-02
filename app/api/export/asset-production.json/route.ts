import { NextResponse } from "next/server";
import { buildUnityAssetProductionRuntimeExport, validateAssetProductionRuntimeManifest } from "@/lib/assets/asset-production-system";
import { buildBaseGameRuntimeData } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const runtime = await buildBaseGameRuntimeData();
    const manifest = runtime.assetProductionRuntime;
    const validation = validateAssetProductionRuntimeManifest(manifest);
    const payload = {
      ...buildUnityAssetProductionRuntimeExport(manifest),
      validation: {
        status: validation.status,
        issues: validation.issues
      }
    };

    return NextResponse.json(payload, {
      status: validation.valid ? 200 : 500,
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        "X-Project-Genesis-Asset-Publishing-Policy": manifest.publishingPolicy
      }
    });
  } catch {
    return NextResponse.json({ error: "Asset Production runtime export failed." }, { status: 500 });
  }
}
