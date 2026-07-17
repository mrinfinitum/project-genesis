import { NextResponse } from "next/server";
import { searchStudio } from "@/lib/studio/global-search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") ?? 24)));
  const payload = await searchStudio(query, limit);
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "private, max-age=30"
    }
  });
}
