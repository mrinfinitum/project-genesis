import { GameEngineExportsWorkspace } from "@/components/game-engine-exports-workspace";
import { buildGameEngineExport, getEngineTargets } from "@/lib/export/game-engine";

export const dynamic = "force-dynamic";

export default async function GameEngineExportsPage() {
  const genericExport = await buildGameEngineExport("generic");
  const moduleCounts = Object.entries(genericExport.summary.moduleCounts).map(([key, count]) => ({
    key,
    count: Number(count)
  }));

  return <GameEngineExportsWorkspace targets={getEngineTargets()} moduleCounts={moduleCounts} validation={genericExport.validation} />;
}
