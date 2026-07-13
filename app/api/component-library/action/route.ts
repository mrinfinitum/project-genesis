import { NextResponse } from "next/server";
import { updateComponentWorkflow } from "@/lib/component-library";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      componentId?: string;
      action?: "ready_for_review" | "request_changes" | "approve" | "record_major_change";
      reviewer?: string;
      comments?: string;
      changeTitle?: string;
    };
    if (!body.componentId || !body.action) {
      return NextResponse.json({ error: "componentId and action are required." }, { status: 400 });
    }
    const record = await updateComponentWorkflow({
      componentId: body.componentId,
      action: body.action,
      reviewer: body.reviewer,
      comments: body.comments,
      changeTitle: body.changeTitle
    });
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Component Library action failed." }, { status: 400 });
  }
}
