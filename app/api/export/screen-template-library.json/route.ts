import { NextResponse } from "next/server";
import {
  buildUnityScreenTemplateExport,
  noverisScreenTemplateLibrary,
  validateScreenTemplateLibrary
} from "@/lib/screen-template-library";

export const dynamic = "force-dynamic";

export async function GET() {
  const validation = validateScreenTemplateLibrary(noverisScreenTemplateLibrary);
  return NextResponse.json(
    {
      ...buildUnityScreenTemplateExport(noverisScreenTemplateLibrary),
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
