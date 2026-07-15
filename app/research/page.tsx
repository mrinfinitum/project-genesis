import { DataWorkspace } from "@/components/data-workspace";
import { ReferenceScreenWorkflow } from "@/components/reference-screen-workflow";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const rows = await getRows("research");
  return (
    <div className="space-y-6">
      <ReferenceScreenWorkflow
        featureId="research"
        assetsHref="/asset-library?screen=research"
        componentsHref="/component-library?screen=research"
        handoffHref="/screen-designer/research#handoff"
        screenSpecHref="/screen-designer/research"
      />
      <DataWorkspace
        config={tableConfigs.research}
        initialRows={rows}
        eyebrow="Progression Design"
        title="Research Designer"
        description="Technology tree nodes, costs, prerequisites, gameplay unlocks, travel tiers, and feature gates for the exploration loop."
        intent="Review research as unlockable progression cards. Open a card for dependencies, effects, IDs, and export mapping; use the advanced editor for direct schema edits."
      />
    </div>
  );
}
