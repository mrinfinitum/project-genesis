import { NextResponse } from "next/server";
import { addComponentReference, updateComponentWorkflow, type ComponentApprovalStatus, type ComponentReferenceAttachment } from "@/lib/component-library";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      componentId?: string;
      action?: "ready_for_review" | "request_changes" | "approve" | "record_major_change" | "reference.add";
      reviewer?: string;
      comments?: string;
      changeTitle?: string;
      payload?: {
        source?: string;
        type?: ComponentReferenceAttachment["type"];
        viewport?: string;
        version?: number;
        notes?: string;
        approvalStatus?: ComponentApprovalStatus;
      };
    };
    if (!body.componentId || !body.action) {
      return NextResponse.json({ error: "componentId and action are required." }, { status: 400 });
    }
    if (body.action === "reference.add") {
      const record = await addComponentReference({
        componentId: body.componentId,
        source: body.payload?.source ?? "",
        type: body.payload?.type,
        viewport: body.payload?.viewport,
        version: body.payload?.version,
        notes: body.payload?.notes,
        approvalStatus: body.payload?.approvalStatus
      });
      return NextResponse.json({ ok: true, record });
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
