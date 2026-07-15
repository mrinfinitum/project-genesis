import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getGameData } from "@/lib/data";
import { buildCivilizationEncyclopediaState, buildEncyclopediaAssetRequirements, encyclopediaDerivativeProfiles, encyclopediaSemanticNamingConvention } from "@/lib/encyclopedia";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const data = await getGameData();
  const assetState = await getAssetProductionState();
  const state = buildCivilizationEncyclopediaState(data, assetState.assets);
  const requirements = buildEncyclopediaAssetRequirements(data, assetState.assets);
  const libraryItems = assetState.assetLibraryInventory.items.filter((item) => item.categoryId === "encyclopedia");
  const semanticKeys = new Set(requirements.map((item) => item.semanticAssetKey));

  assert(requirements.length > 0, "Encyclopedia asset requirements must be generated.");
  assert(libraryItems.length > 0, "Asset Library must expose Encyclopedia inventory cards.");
  assert(libraryItems.some((item) => semanticKeys.has(item.semanticAssetKey)), "Asset Library Encyclopedia cards must resolve generated semantic keys.");
  assert(assetState.assetLibraryInventory.categorySummaries.encyclopedia.total === libraryItems.length, "Encyclopedia category summary must count Encyclopedia cards.");
  assert(state.assetProfiles.building.some((role) => role.role === "hero" && role.required), "Building encyclopedia profile must require hero art.");
  assert(state.assetProfiles.research.some((role) => role.role === "icon" && role.required), "Research encyclopedia profile must require icons.");
  assert(state.assetProfiles.resource.some((role) => role.role === "thumbnail" && role.required), "Resource encyclopedia profile must require thumbnails.");
  assert(state.assetProfiles.planet.some((role) => role.role === "card" && role.required), "Planet encyclopedia profile must require card art.");
  assert(encyclopediaSemanticNamingConvention.some((row) => row.example === "building_residential_house_icon"), "Semantic naming examples must include building icon convention.");
  assert(encyclopediaDerivativeProfiles.hero.includes("4K master"), "Hero derivative profile must include 4K master output.");
  assert(!JSON.stringify(libraryItems).match(/\/Users\/|studio-private:\/\/|SUPABASE|SERVICE_ROLE|PRIVATE_KEY/i), "Asset Library Encyclopedia inventory must not leak private paths or secrets.");

  console.log(JSON.stringify({
    ok: true,
    requirements: requirements.length,
    encyclopediaInventoryCards: libraryItems.length,
    missing: libraryItems.filter((item) => item.status === "missing").length,
    published: libraryItems.filter((item) => item.status === "published").length,
    categorySummary: assetState.assetLibraryInventory.categorySummaries.encyclopedia,
    namingExamples: encyclopediaSemanticNamingConvention.map((row) => row.example),
    derivativeProfiles: encyclopediaDerivativeProfiles
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
