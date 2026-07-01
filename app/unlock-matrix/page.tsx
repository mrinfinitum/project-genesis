import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function UnlockMatrixPage() {
  const rows = await getRows("unlock_matrix");
  return <AdminTable config={tableConfigs.unlock_matrix} initialRows={rows} />;
}
