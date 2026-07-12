import { GameArtImportWorkspace } from "@/components/game-art-import-workspace";
import { getGameArtImportWorkspaceState } from "@/lib/assets/game-art-import";

export const dynamic = "force-dynamic";

export default async function GameArtImportPage() {
  const state = await getGameArtImportWorkspaceState();
  return <GameArtImportWorkspace initialState={state} />;
}
