import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function BuildingRelationshipsPage() {
  const rows = await getRows("building_relationships");
  return (
    <DataWorkspace
      config={tableConfigs.building_relationships}
      initialRows={rows}
      eyebrow="Engine and Validation"
      title="Relationship Graph"
      description="Mappings between buildings, districts, research prerequisites, upgrade dependencies, wonders, and implementation status."
      intent="Inspect relationship records as linked cards before dropping into the raw editor for dependency maintenance."
    />
  );
}
