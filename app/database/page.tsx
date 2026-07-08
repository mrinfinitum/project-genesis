import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const rows = await getRows("project_systems");
  return <AdminTable config={tableConfigs.project_systems} initialRows={rows} />;
}
