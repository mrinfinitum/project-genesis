import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function BuildingChainsPage() {
  const rows = await getRows("building_chains");
  return (
    <DataWorkspace
      config={tableConfigs.building_chains}
      initialRows={rows}
      eyebrow="Engine and Validation"
      title="Balance Designer"
      description="Named building progression chains grouped by district, gameplay role, and research progression."
      intent="Browse building chains as compact progression cards and keep the level mapping fields in the detail panel."
    />
  );
}
