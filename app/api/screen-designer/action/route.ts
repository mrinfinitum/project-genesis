import { NextResponse } from "next/server";
import { updateScreenDesignWorkflow } from "@/lib/screen-designer";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      screenId?: string;
      action?: "ready_for_review" | "request_changes" | "approve";
      reviewer?: string;
      comments?: string;
    };
    if (!body.screenId || !body.action) {
      return NextResponse.json({ error: "screenId and action are required." }, { status: 400 });
    }
    const record = await updateScreenDesignWorkflow({
      screenId: body.screenId,
      action: body.action,
      reviewer: body.reviewer,
      comments: body.comments
    });
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Screen Designer action failed." }, { status: 400 });
  }
}
