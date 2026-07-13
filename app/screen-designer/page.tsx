import { ScreenDesignerWorkspace } from "@/components/screen-designer-workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getScreenDesignerState } from "@/lib/screen-designer";

export const dynamic = "force-dynamic";

export default async function ScreenDesignerPage() {
  const assetState = await getAssetProductionState();
  const state = await getScreenDesignerState(assetState);
  return <ScreenDesignerWorkspace state={state} />;
}
