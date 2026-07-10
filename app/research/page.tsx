import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const rows = await getRows("research");
  return (
    <DataWorkspace
      config={tableConfigs.research}
      initialRows={rows}
      eyebrow="Progression Design"
      title="Research Designer"
      description="Technology tree nodes, costs, prerequisites, gameplay unlocks, travel tiers, and feature gates for the exploration loop."
      intent="Review research as unlockable progression cards. Open a card for dependencies, effects, IDs, and export mapping; use the advanced editor for direct schema edits."
    />
  );
}
