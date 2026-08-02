import { AssetProductionSystemWorkspace } from "@/components/asset-production-system-workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function AssetProductionPage() {
  const state = await getAssetProductionState({ includeEncyclopediaRequirements: false });

  return <AssetProductionSystemWorkspace state={state} />;
}
