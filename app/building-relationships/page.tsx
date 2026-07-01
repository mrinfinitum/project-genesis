import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function BuildingRelationshipsPage() {
  const rows = await getRows("building_relationships");
  return <AdminTable config={tableConfigs.building_relationships} initialRows={rows} />;
}
