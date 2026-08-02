import { NextResponse } from "next/server";
import { buildUnityComponentLibraryExport, noverisComponentLibrary, validateComponentLibrary } from "@/lib/component-library";

export const dynamic = "force-dynamic";

export async function GET() {
  const validation = validateComponentLibrary(noverisComponentLibrary);
  return NextResponse.json(
    {
      ...buildUnityComponentLibraryExport(noverisComponentLibrary),
      validation: {
        status: validation.status,
        issues: validation.issues
      }
    },
    {
      status: validation.valid ? 200 : 500,
      headers: {
        "cache-control": "public, max-age=300, s-maxage=300"
      }
    }
  );
}
