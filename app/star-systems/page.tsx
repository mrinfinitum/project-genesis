import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { generatedStarSystemRows } from "@/lib/universe/fallback-data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function StarSystemsPage() {
  const rows = await getRows("star_systems");

  return (
    <AdminTable
      config={tableConfigs.star_systems}
      initialRows={rows.length ? rows : generatedStarSystemRows(24)}
    />
  );
}
