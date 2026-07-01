import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function BuildingChainsPage() {
  const rows = await getRows("building_chains");
  return <AdminTable config={tableConfigs.building_chains} initialRows={rows} />;
}
