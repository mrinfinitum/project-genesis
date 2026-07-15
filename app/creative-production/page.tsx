import { CreativeProductionWorkspace } from "@/components/creative-production-workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getGameData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CreativeProductionPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const area = Array.isArray(params?.area) ? params?.area[0] : params?.area;
  const classId = Array.isArray(params?.class) ? params?.class[0] : params?.class;
  const [state, gameData] = await Promise.all([getAssetProductionState(), getGameData()]);
  return <CreativeProductionWorkspace state={state} studioData={gameData} initialArea={area ?? null} initialClassId={classId ?? null} />;
}
