import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function GameConstantsPage() {
  const rows = await getRows("game_constants");
  return <AdminTable config={tableConfigs.game_constants} initialRows={rows} />;
}
