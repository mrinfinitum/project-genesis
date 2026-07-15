import { AiAgentsWorkspace } from "@/components/ai-agents-workspace";
import { ReferenceScreenWorkflow } from "@/components/reference-screen-workflow";
import { getAiAgentLibraryState } from "@/lib/ai-agents";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function AiAgentsPage() {
  const assetState = await getAssetProductionState();
  const state = await getAiAgentLibraryState(assetState);
  return (
    <div className="space-y-6">
      <ReferenceScreenWorkflow
        featureId="ai-agents"
        assetsHref="/asset-library?screen=ai-agents"
        componentsHref="/component-library?screen=ai-agents"
        handoffHref="/screen-designer/ai-agent-profile#handoff"
        screenSpecHref="/screen-designer/ai-agent-profile"
      />
      <AiAgentsWorkspace state={state} />
    </div>
  );
}
