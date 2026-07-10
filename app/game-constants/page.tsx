import { DataWorkspace } from "@/components/data-workspace";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function GameConstantsPage() {
  const rows = await getRows("game_constants");
  return (
    <DataWorkspace
      config={tableConfigs.game_constants}
      initialRows={rows}
      eyebrow="Studio Data"
      title="Game Constants"
      description="Shared tuning constants consumed by game systems and export generation."
      intent="Review constants as compact tuning cards first, then open raw editing when changing canonical values."
    />
  );
}
