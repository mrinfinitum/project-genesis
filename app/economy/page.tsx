import { ReferenceScreenWorkflow } from "@/components/reference-screen-workflow";
import { EconomyWorkspace } from "@/components/economy-workspace";

export default function EconomyPage() {
  return (
    <div className="space-y-6">
      <ReferenceScreenWorkflow
        featureId="economy"
        assetsHref="/asset-library?screen=economy"
        componentsHref="/component-library?screen=economy"
        handoffHref="/screen-designer/economy-designer#handoff"
        screenSpecHref="/screen-designer/economy-designer"
      />
      <EconomyWorkspace />
    </div>
  );
}
