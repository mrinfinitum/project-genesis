import { DataWorkspace } from "@/components/data-workspace";
import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { ReferenceScreenWorkflow } from "@/components/reference-screen-workflow";
import { WorkspacePanel } from "@/components/ui/workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";
import type { ResearchNode } from "@/types/schema";

export const dynamic = "force-dynamic";

const researchArtworkByCue = [
  { cues: ["labor", "workforce", "settlement", "population"], url: "/assets/game-art/asset_population_icon/asset_population_icon.png" },
  { cues: ["industry", "construction", "production", "manufacturing"], url: "/assets/game-art/asset_industrial_management/asset_industrial_management.png" },
  { cues: ["science", "research", "laboratory", "education"], url: "/assets/game-art/asset_research_icon/asset_research_icon.png" },
  { cues: ["technology", "digital", "cyber", "ai", "quantum"], url: "/assets/game-art/asset_quantum_processor_icon/asset_quantum_processor_icon.png" },
  { cues: ["trade", "commerce", "credits", "finance"], url: "/assets/game-art/asset_global_finance/asset_global_finance.png" },
  { cues: ["energy", "power"], url: "/assets/game-art/asset_civilization_energy_icon/asset_civilization_energy_icon.png" },
  { cues: ["space", "interstellar", "galaxy", "travel"], url: "/images/01-aurora-gate.png" },
  { cues: ["government", "civic", "administration"], url: "/assets/game-art/asset_government_administration/asset_government_administration.png" }
];

function researchArtworkFor(node: ResearchNode) {
  const text = [node.name, node.branch_id, node.primary_unlock_type, node.unlock_summary, node.space_system_unlocked, node.era].join(" ").toLowerCase();
  return researchArtworkByCue.find((entry) => entry.cues.some((cue) => text.includes(cue)))?.url ?? "/assets/game-art/asset_research_icon/asset_research_icon.png";
}

function researchLibraryCard(node: ResearchNode): GeneratedLibraryCardRecord {
  const thumbnailUrl = researchArtworkFor(node);
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
    thumbnailUrl,
    mediumPreviewUrl: thumbnailUrl,
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
