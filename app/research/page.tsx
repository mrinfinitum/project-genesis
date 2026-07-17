import { DataWorkspace } from "@/components/data-workspace";
import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { ReferenceScreenWorkflow } from "@/components/reference-screen-workflow";
import { WorkspacePanel } from "@/components/ui/workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";
import type { ResearchNode } from "@/types/schema";

export const dynamic = "force-dynamic";

function researchLibraryCard(node: ResearchNode): GeneratedLibraryCardRecord {
  return {
    id: node.id,
    name: node.name,
    type: node.primary_unlock_type || node.branch_id,
    classification: node.travel_tier || node.space_system_unlocked || "Research Node",
    parent: node.era,
    contains: node.unlock_summary || node.primary_unlock_type,
    status: node.status || "Ready",
    href: `/research?record=${encodeURIComponent(node.id)}`,
    tone: "research",
    focalPoint: "center"
  };
}

export default async function ResearchPage() {
  const rows = await getRows("research");
  const researchCards = (rows as ResearchNode[]).map(researchLibraryCard);
  return (
    <div className="space-y-6">
      <ReferenceScreenWorkflow
        featureId="research"
        assetsHref="/asset-library?screen=research"
        componentsHref="/component-library?screen=research"
        handoffHref="/screen-designer/research#handoff"
        screenSpecHref="/screen-designer/research"
      />
      <WorkspacePanel title="Research Library">
        <p className="max-w-4xl text-sm leading-6 text-slate-300">
          Canonical generated research records use the shared Library card system. Long unlock text is truncated on cards and remains available in the opened record.
        </p>
        <div className="mt-4 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {researchCards.map((record) => <GeneratedLibraryCard key={record.id} record={record} />)}
        </div>
      </WorkspacePanel>
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
