import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function CodexHandoffsPage() {
  const rows = await getRows("codex_readiness_items");
  return <AdminTable config={tableConfigs.codex_readiness_items} initialRows={rows} />;
}
