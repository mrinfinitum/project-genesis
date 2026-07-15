import { CreativeProductionWorkspace } from "@/components/creative-production-workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function CreativeProductionPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const area = Array.isArray(params?.area) ? params?.area[0] : params?.area;
  const state = await getAssetProductionState();
  return <CreativeProductionWorkspace state={state} initialArea={area ?? null} />;
}
