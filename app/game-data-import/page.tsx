import { GameDataImportWorkspace } from "@/components/game-data-import-workspace";
import { getRuntimeImportWorkspaceState } from "@/lib/runtime/game-runtime";

export const dynamic = "force-dynamic";

export default async function GameDataImportPage() {
  const state = await getRuntimeImportWorkspaceState();
  return <GameDataImportWorkspace initialState={state} />;
}
