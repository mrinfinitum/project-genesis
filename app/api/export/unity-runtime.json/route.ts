import { NextResponse } from "next/server";
import { buildUnityRuntimePackage, validateUnityRuntimePackage } from "@/lib/runtime/unity-runtime-package";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const runtimePackage = await buildUnityRuntimePackage();
    const validation = validateUnityRuntimePackage(runtimePackage);
    if (!validation.valid) {
      return NextResponse.json({ error: "Unity runtime package validation failed.", validation }, { status: 500 });
    }
    return NextResponse.json(runtimePackage, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        "X-Noveris-Runtime-Schema": runtimePackage.metadata.runtimeSchemaId,
        "X-Noveris-Content-Version": String(runtimePackage.metadata.contentVersion),
        "X-Noveris-Package-Checksum": runtimePackage.metadata.packageChecksum,
        "X-Noveris-Validation-Status": runtimePackage.metadata.validationStatus
      }
    });
  } catch {
    return NextResponse.json({ error: "Unity runtime package generation failed." }, { status: 500 });
  }
}
