import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const rows = await getRows("codex_tasks");
  return <AdminTable config={tableConfigs.codex_tasks} initialRows={rows} />;
}
