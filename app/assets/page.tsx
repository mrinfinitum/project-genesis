import { AssetProductionWorkspace } from "@/components/asset-production-workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const state = await getAssetProductionState();
  return <AssetProductionWorkspace state={state} view="dashboard" preferredRoute="/assets" />;
}
