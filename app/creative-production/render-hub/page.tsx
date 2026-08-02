import { RenderHubWorkspace } from "@/components/render-hub-workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function RenderHubPage() {
  const state = await getAssetProductionState({ includeEncyclopediaRequirements: false });

  return <RenderHubWorkspace state={state} />;
}
