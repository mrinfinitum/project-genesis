import { NextResponse } from "next/server";
import { applyAssetProductionAction, type AssetProductionActionInput } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as AssetProductionActionInput;
    const result = await applyAssetProductionAction(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Asset production action failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
