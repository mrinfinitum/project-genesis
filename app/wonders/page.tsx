import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function WondersPage() {
  const rows = await getRows("wonders");
  return <AdminTable config={tableConfigs.wonders} initialRows={rows} />;
}
