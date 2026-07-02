import { AdminTable } from "@/components/admin-table";
import { handoffData } from "@/data/handoff";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function PlanetaryRulesPage() {
  const rows = await getRows("planets");
  return <AdminTable config={tableConfigs.planets} initialRows={rows.length ? rows : handoffData.planets} />;
}
