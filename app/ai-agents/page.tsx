import { AiAgentsLibrary } from "@/components/ai-agents-library";
import { getAiAgentLibraryState } from "@/lib/ai-agents";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function AiAgentsPage() {
  const assetState = await getAssetProductionState();
  const state = await getAiAgentLibraryState(assetState);
  return <AiAgentsLibrary state={state} />;
}
