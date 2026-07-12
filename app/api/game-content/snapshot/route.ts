import { NextResponse } from "next/server";
import { getPublishedRelease } from "@/lib/game-content/publishing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const versionParam = url.searchParams.get("version");
  const contentVersion = versionParam ? Number(versionParam) : undefined;

  if (versionParam && (!Number.isInteger(contentVersion) || Number(contentVersion) < 1)) {
    return NextResponse.json({ error: "version must be a positive contentVersion number." }, { status: 400 });
  }

  const release = await getPublishedRelease(contentVersion);
  if (!release) {
    return NextResponse.json({ error: "Published content release not found." }, { status: 404 });
  }

  return NextResponse.json(release.snapshot, {
    headers: {
      "Cache-Control": "no-store",
      "X-Project-Genesis-Content-Version": release.version,
      "X-Project-Genesis-Content-Hash": release.contentHash
    }
  });
}
