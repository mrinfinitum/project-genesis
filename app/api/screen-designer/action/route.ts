import { NextResponse } from "next/server";
import { addScreenReference, updateScreenDesignWorkflow, type ScreenApprovalStatus, type ScreenReference } from "@/lib/screen-designer";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      screenId?: string;
      action?: "ready_for_review" | "request_changes" | "approve" | "reference.add";
      reviewer?: string;
      comments?: string;
      payload?: {
        source?: string;
        type?: ScreenReference["type"];
        viewport?: string;
        notes?: string;
        approvalStatus?: ScreenApprovalStatus;
      };
    };
    if (!body.screenId || !body.action) {
      return NextResponse.json({ error: "screenId and action are required." }, { status: 400 });
    }
    if (body.action === "reference.add") {
      const record = await addScreenReference({
        screenId: body.screenId,
        source: body.payload?.source ?? "",
        type: body.payload?.type,
        viewport: body.payload?.viewport,
        notes: body.payload?.notes,
        approvalStatus: body.payload?.approvalStatus
      });
      return NextResponse.json({ ok: true, record });
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
