import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const rows = await getRows("buildings");
  return <AdminTable config={tableConfigs.buildings} initialRows={rows} />;
}
