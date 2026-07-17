import { AssetProductionWorkspace } from "@/components/asset-production-workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";

export const dynamic = "force-dynamic";

export default async function AssetLibraryPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const section = Array.isArray(params?.section) ? params?.section[0] : params?.section;
  const category = Array.isArray(params?.category) ? params?.category[0] : params?.category;
  const state = await getAssetProductionState();
  return <AssetProductionWorkspace state={state} view="dashboard" preferredRoute="/asset-library" initialSection={category ?? section ?? null} />;
}
