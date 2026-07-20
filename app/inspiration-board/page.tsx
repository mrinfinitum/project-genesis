import { InspirationBoardWorkspace } from "@/components/inspiration-board-workspace";
import { getInspirationWallManifest } from "@/lib/experience-design/inspiration-wall";

export const dynamic = "force-dynamic";

export default async function InspirationBoardPage() {
  return <InspirationBoardWorkspace initialManifest={await getInspirationWallManifest()} />;
}
