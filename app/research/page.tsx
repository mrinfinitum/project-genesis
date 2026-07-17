import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { CanonicalIndex, WorkspaceMiniStat, WorkspacePanel } from "@/components/ui/workspace";
import { getRows } from "@/lib/data";
import type { ResearchNode } from "@/types/schema";

export const dynamic = "force-dynamic";

type ResearchPageProps = {
  searchParams?: Promise<{ record?: string }>;
};

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

function selectedRecordId(record?: string) {
  return typeof record === "string" ? record : "";
}

function ResearchRecordDetail({ node }: { node: ResearchNode }) {
  return (
    <WorkspacePanel title={`${node.name} Record`}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMiniStat label="Era" value={node.era} />
        <WorkspaceMiniStat label="Branch" value={node.branch_id} />
        <WorkspaceMiniStat label="Unlock Type" value={node.primary_unlock_type || "None"} />
        <WorkspaceMiniStat label="Status" value={node.status || "Ready"} />
      </div>
      <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">{node.design_purpose || node.gameplay_effect || node.unlock_summary}</p>
      {node.unlocks?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {node.unlocks.map((unlock) => (
            <span key={unlock} className="rounded-md border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100">
              {unlock}
            </span>
          ))}
        </div>
      ) : null}
    </WorkspacePanel>
  );
}

export default async function ResearchPage({ searchParams }: ResearchPageProps) {
  const params = await searchParams;
  const rows = await getRows("research");
  const researchRows = rows as ResearchNode[];
  const researchCards = researchRows.map(researchLibraryCard);
  const branches = new Set(researchRows.map((row) => row.branch_id).filter(Boolean));
  const eras = new Set(researchRows.map((row) => row.era).filter(Boolean));
  const unlockCount = researchRows.reduce((sum, row) => sum + (Array.isArray(row.unlocks) ? row.unlocks.length : 0), 0);
  const selectedResearch = researchRows.find((row) => row.id === selectedRecordId(params?.record));

  return (
    <div className="space-y-6">
      <CanonicalIndex
        title="Research Library"
        description="Canonical research records formatted as a browsable library. Component contracts and screen references live in the Component Library and Screen Designer."
        items={[
          { label: "Research Nodes", value: researchRows.length.toLocaleString(), detail: "canonical records" },
          { label: "Branches", value: branches.size.toLocaleString(), detail: "research groups" },
          { label: "Eras", value: eras.size.toLocaleString(), detail: "progression coverage" },
          { label: "Unlock Links", value: unlockCount.toLocaleString(), detail: "feature outputs" }
        ]}
      />
      {selectedResearch ? <ResearchRecordDetail node={selectedResearch} /> : null}
      <WorkspacePanel title="Research Library">
        <p className="max-w-4xl text-sm leading-6 text-slate-300">
          Canonical generated research records use the shared Library card system. Long unlock text is truncated on cards and remains available in the opened record.
        </p>
        <div className="mt-4 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {researchCards.map((record) => <GeneratedLibraryCard key={record.id} record={record} />)}
        </div>
      </WorkspacePanel>
    </div>
  );
}
