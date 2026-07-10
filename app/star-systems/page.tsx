import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { generatedStarSystemRows } from "@/lib/universe/fallback-data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function StarSystemsPage() {
  const rows = await getRows("star_systems");

  return (
    <DataWorkspace
      config={tableConfigs.star_systems}
      initialRows={rows.length ? rows : generatedStarSystemRows(24)}
      eyebrow="Universe Explorer"
      title="Star Systems"
      description="Generated and fixed star systems with discovery state, catalog designation, danger, star counts, and scan estimates."
      intent="This legacy data workspace now follows the same card/detail language as the Star System Map while preserving raw schema editing."
    />
  );
}
