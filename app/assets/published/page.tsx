import { AssetProductionWorkspace } from "@/components/asset-production-workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function PublishedAssetsPage() {
  const state = await getAssetProductionState();
  return <AssetProductionWorkspace state={state} view="published" />;
}
