import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const rows = await getRows("research");
  return <AdminTable config={tableConfigs.research} initialRows={rows} />;
}
