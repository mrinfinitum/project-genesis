import { NextResponse } from "next/server";
import { buildUnityDesignLanguageExport, noverisDesignLanguage, validateDesignLanguage } from "@/lib/design-language";

export const dynamic = "force-dynamic";

export async function GET() {
  const validation = validateDesignLanguage(noverisDesignLanguage);
  return NextResponse.json(
    {
      ...buildUnityDesignLanguageExport(noverisDesignLanguage),
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
