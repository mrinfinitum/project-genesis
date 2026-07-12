import { NextResponse } from "next/server";
import { listContentReleases, publishCurrentDraft, rollbackToRelease, validateDraftContent } from "@/lib/game-content/publishing";

export const dynamic = "force-dynamic";

type ReleaseActionBody = {
  action?: "validate" | "publish" | "rollback";
  contentVersion?: number;
  title?: string;
  notes?: string;
};

export async function GET() {
  return NextResponse.json(await listContentReleases(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ReleaseActionBody;

  if (body.action === "validate") {
    return NextResponse.json(await validateDraftContent());
  }

  if (body.action === "publish") {
    const result = await publishCurrentDraft({ title: body.title, notes: body.notes });
    if (!result.ok) {
      return NextResponse.json({ error: result.message, validation: result.validation }, { status: result.status });
    }
    return NextResponse.json(result.release, { status: 201 });
  }

  if (body.action === "rollback") {
    if (!Number.isInteger(body.contentVersion) || Number(body.contentVersion) < 1) {
      return NextResponse.json({ error: "contentVersion is required for rollback." }, { status: 400 });
    }

    const result = await rollbackToRelease(Number(body.contentVersion), { title: body.title, notes: body.notes });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result.release, { status: 201 });
  }

  return NextResponse.json({ error: "Unsupported action. Use validate, publish, or rollback." }, { status: 400 });
}
