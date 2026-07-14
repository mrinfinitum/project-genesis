import { AiAgentsWorkspace } from "@/components/ai-agents-workspace";
import { getAiAgentLibraryState } from "@/lib/ai-agents";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function AiAgentsPage() {
  const assetState = await getAssetProductionState();
  const state = await getAiAgentLibraryState(assetState);
  return <AiAgentsWorkspace state={state} />;
}
