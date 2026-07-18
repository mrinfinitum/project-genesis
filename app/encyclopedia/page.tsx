import { EncyclopediaBrowser } from "@/components/encyclopedia-browser";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getGameData } from "@/lib/data";
import { buildCivilizationEncyclopediaState } from "@/lib/encyclopedia";

export const dynamic = "force-dynamic";

export default async function EncyclopediaPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const selectedSectionId = typeof params?.section === "string" ? params.section : "building";
  const query = typeof params?.q === "string" ? params.q : "";
  const [data, assetState] = await Promise.all([getGameData(), getAssetProductionState()]);
  const state = buildCivilizationEncyclopediaState(data, assetState.assets);

  return (
    <EncyclopediaBrowser
      sections={state.sections}
      entries={state.entries}
      initialSectionId={selectedSectionId}
      initialQuery={query}
    />
  );
}
