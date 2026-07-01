import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function UpgradesPage() {
  const rows = await getRows("upgrades");
  return <AdminTable config={tableConfigs.upgrades} initialRows={rows} />;
}
