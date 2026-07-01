import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function DistrictsPage() {
  const rows = await getRows("districts");
  return <AdminTable config={tableConfigs.districts} initialRows={rows} />;
}
