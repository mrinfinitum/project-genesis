import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getArchitectureState } from "@/lib/architecture";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getGameData } from "@/lib/data";
import {
  canonicalDiscoveries,
  discoveryCategories,
  discoveryChains,
  discoveryCollections,
  discoveryMilestones,
  discoveryPlayerCollectionSchema,
  discoveryRarities,
  validateDiscoverySystem
} from "@/lib/discovery";
import { buildCivilizationEncyclopediaState } from "@/lib/encyclopedia";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assertNoPrivatePaths(label: string, value: unknown) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("/Users/"), `${label} must not expose local /Users paths.`);
  assert(!serialized.includes("studio-private://"), `${label} must not expose studio-private paths.`);
}

const expectedCanonicalDiscoveryIds = [
  "DISC-FLORA-LUMEN-MOSS",
  "DISC-FAUNA-AEROVALE-SKIMMER",
  "DISC-LIVING-MYCELIAL-WORLDNET",
  "DISC-ELEMENT-HELIUM3-ICEVEIN",
  "DISC-MINERAL-VESPER-CRYSTAL",
  "DISC-EXOTIC-UMBRAL-CONDENSATE",
  "DISC-ARTIFACT-SILENT-SUN-ORRERY",
  "DISC-ALIENTECH-PRECURSOR-MEMORY-LATTICE",
  "DISC-RUINS-ECHO-VAULT",
  "DISC-ANOMALY-PALE-CHORUS"
] as const;

const expectedCollectionNames = [
  "Primitive Biology",
  "Planetary Flora",
  "Planetary Fauna",
  "Rare Matter",
  "Artifacts",
  "Alien Technology",
  "Living Systems",
  "Signals"
] as const;

async function main() {
  const discoveryPagePath = "app/discovery/page.tsx";
  const discoverySource = read("lib/discovery/index.ts");
  const discoveryPage = read(discoveryPagePath);
  const appShell = read("components/app-shell.tsx");
  const creativeProduction = read("components/creative-production-workspace.tsx");
  const assetRouting = read("lib/assets/asset-library-routing.ts");
  const assetInventory = read("lib/assets/asset-library-inventory.ts");
  const encyclopediaSource = read("lib/encyclopedia/index.ts");
  const runtimeSource = read("lib/runtime/game-runtime.ts");
  const engineExportSource = read("lib/export/game-engine.ts");
  const architectureSource = read("lib/architecture/index.ts");

  assert(existsSync(path.join(process.cwd(), discoveryPagePath)), "Discovery workspace route must exist.");
  assert(discoveryPage.includes("Canonical Discovery System"), "Discovery page must present the canonical system name.");
  assert(discoveryPage.includes("Studio publishes definitions only"), "Discovery page must clarify that player state is game-owned.");
  assert(appShell.includes('href: "/discovery"'), "App shell must expose the Discovery workspace.");
  assert(appShell.includes('href: "/creative-production?area=discovery"'), "Creative Production nav must expose Discovery.");
  assert(creativeProduction.includes('id: "discovery"'), "Creative Production must include a Discovery production area.");
  assert(assetRouting.includes('"discovery"'), "Asset Library routing must include Discovery.");
  assert(assetInventory.includes('return "discovery"'), "Asset Library inventory must route discovery requirements into Discovery.");
  assert(encyclopediaSource.includes('section("discovery"'), "Civilization Encyclopedia must include a Discovery section.");
  assert(runtimeSource.includes("discoveryPlayerCollectionSchema"), "Runtime must document player collection schema ownership.");
  assert(engineExportSource.includes("DiscoveryCatalogModule"), "Roblox engine export must include a Discovery module target.");
  assert(architectureSource.includes("ARCH-DECISION-CANONICAL-DISCOVERY-SYSTEM"), "Architecture Workspace must include the canonical Discovery decision.");

  const validation = validateDiscoverySystem();
  assert(validation.status === "Ready", `Discovery validation must be Ready; received ${validation.status}: ${validation.issues.map((issue) => issue.message).join("; ")}`);
  assert(discoveryCategories.length >= 8, `Discovery needs broad category coverage; received ${discoveryCategories.length}.`);
  assert(discoveryCategories.reduce((sum, category) => sum + category.subcategories.length, 0) >= 30, "Discovery must expose the requested subcategory breadth.");
  assert(discoveryRarities.length === 7, `Discovery rarity model must contain seven tiers; received ${discoveryRarities.length}.`);
  assert(canonicalDiscoveries.length === expectedCanonicalDiscoveryIds.length, `Discovery must publish the first ten canonical records exactly; received ${canonicalDiscoveries.length}.`);
  assert(discoveryCollections.length >= 6, "Discovery collections must be defined.");
  assert(discoveryChains.length >= 2, "Discovery chains must be defined.");
  assert(discoveryMilestones.length >= 5, "Discovery milestones must be defined.");
  assert(discoveryPlayerCollectionSchema.studioOwnership === "canonical_definitions_only", "Discovery player collection state must remain game-owned.");

  const categoryIds = new Set(discoveryCategories.map((category) => category.id));
  const rarityIds = new Set(discoveryRarities.map((rarity) => rarity.id));
  const discoveryIds = new Set(canonicalDiscoveries.map((discovery) => discovery.id));
  for (const expectedId of expectedCanonicalDiscoveryIds) {
    assert(discoveryIds.has(expectedId), `Missing canonical discovery record ${expectedId}.`);
  }
  for (const collectionName of expectedCollectionNames) {
    assert(discoveryCollections.some((collection) => collection.displayName === collectionName), `Missing canonical discovery collection ${collectionName}.`);
  }
  for (const rarity of discoveryRarities) {
    assert(canonicalDiscoveries.some((discovery) => discovery.rarity === rarity.id), `Canonical discovery records must represent rarity tier ${rarity.displayName}.`);
  }
  for (const discovery of canonicalDiscoveries) {
    const category = discoveryCategories.find((item) => item.id === discovery.categoryId);
    assert(categoryIds.has(discovery.categoryId), `${discovery.id} references missing category ${discovery.categoryId}.`);
    assert(category?.subcategories.some((subcategory) => subcategory.id === discovery.subcategoryId), `${discovery.id} references missing subcategory ${discovery.subcategoryId}.`);
    assert(rarityIds.has(discovery.rarity), `${discovery.id} references missing rarity ${discovery.rarity}.`);
    assert(discovery.publicationStatus === "published", `${discovery.id} must be published canonical content, not a placeholder or draft.`);
    assert(discovery.spawnWeight > 0, `${discovery.id} must define a positive spawnWeight separate from rarity.`);
    assert(discovery.requiredScanLevel >= 1, `${discovery.id} must define requiredScanLevel.`);
    for (const key of ["icon", "inventoryThumbnail", "card", "hero", "detailIllustration"] as const) {
      assert(Boolean(discovery.assetProfile[key]), `${discovery.id} is missing assetProfile.${key}.`);
    }
    for (const relatedLifeformId of discovery.relatedLifeformIds) {
      assert(discoveryIds.has(relatedLifeformId), `${discovery.id} references missing related lifeform discovery ${relatedLifeformId}.`);
    }
  }
  for (const collection of discoveryCollections) {
    for (const discoveryId of collection.discoveryIds) {
      assert(discoveryIds.has(discoveryId), `Discovery collection ${collection.id} references missing discovery ${discoveryId}.`);
    }
  }
  for (const chain of discoveryChains) {
    for (const node of chain.nodes) {
      assert(discoveryIds.has(node.discoveryId), `Discovery chain ${chain.id} references missing discovery ${node.discoveryId}.`);
    }
  }

  const [data, assetState, runtime, architecture] = await Promise.all([
    getGameData(),
    getAssetProductionState(),
    buildCanonicalRuntimeExportPayload(),
    getArchitectureState()
  ]);
  const encyclopedia = buildCivilizationEncyclopediaState(data, assetState.assets);
  const discoverySection = encyclopedia.sections.find((section) => section.id === "discovery");
  assert(discoverySection?.status === "active", "Encyclopedia Discovery section must be active.");
  assert(discoverySection.entries.length === canonicalDiscoveries.length, "Encyclopedia Discovery entries must mirror canonical discoveries.");
  assert(encyclopedia.entries.filter((entry) => entry.entityType === "discovery").every((entry) => entry.assetReadiness.required > 0), "Discovery encyclopedia entries must create asset requirements.");

  const discoveryInventory = assetState.assetLibraryInventory.categorySummaries.discovery;
  assert(discoveryInventory.total > 0, "Asset Library Discovery category must contain discovery asset requirements.");
  assert(assetState.assetLibraryInventory.items.some((item) => item.categoryId === "discovery" && item.semanticAssetKey.includes("discovery_")), "Asset Library Discovery category must expose semantic discovery keys.");

  assert(architecture.sections.some((section) => section.id === "discovery" && section.status === "Current"), "Architecture state must expose Discovery as a current section.");
  assert(architecture.decisions.some((decision) => decision.id === "ARCH-DECISION-CANONICAL-DISCOVERY-SYSTEM" && decision.status === "Accepted"), "Architecture decision must resolve in state.");

  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);
  assert(runtime.metadata.contentVersion >= 20, `First ten canonical discovery records require contentVersion 20 or newer; received ${runtime.metadata.contentVersion}.`);
  assert(runtime.discoveries.length === canonicalDiscoveries.length, "Runtime discoveries must mirror canonical discovery records.");
  for (const expectedId of expectedCanonicalDiscoveryIds) {
    assert(runtime.discoveries.some((discovery) => discovery.id === expectedId), `Runtime is missing canonical discovery ${expectedId}.`);
  }
  assert(runtime.discoveryCategories.length === discoveryCategories.length, "Runtime discoveryCategories must mirror canonical categories.");
  assert(runtime.discoveryRarities.length === discoveryRarities.length, "Runtime discoveryRarities must mirror canonical rarities.");
  assert(runtime.discoveryCollections.length === discoveryCollections.length, "Runtime discoveryCollections must mirror canonical collections.");
  assert(runtime.discoveryChains.length === discoveryChains.length, "Runtime discoveryChains must mirror canonical chains.");
  assert(runtime.discoveryPlayerCollectionSchema.studioOwnership === "canonical_definitions_only", "Runtime must not publish player collection state.");
  assertNoPrivatePaths("Discovery runtime", runtime);

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    const target = targets[index];
    assert(engineExport.validation.status === "Ready", `${target} export must remain Ready; received ${engineExport.validation.status}.`);
    assert(Array.isArray(engineExport.canonical.discoveries), `${target} export must include canonical discoveries.`);
    assert((engineExport.canonical.discoveries as unknown[]).length === canonicalDiscoveries.length, `${target} export discovery count must match canonical records.`);
    assertNoPrivatePaths(`${target} export`, engineExport);
  }
  const genericExport = exports[0];
  assert(Boolean(genericExport.relationshipMap.discoveriesByCategory), "Generic relationship map must include discoveriesByCategory.");
  assert(Boolean(genericExport.relationshipMap.discoveriesByCollection), "Generic relationship map must include discoveriesByCollection.");
  assert(Boolean(genericExport.relationshipMap.discoveryChainNodes), "Generic relationship map must include discoveryChainNodes.");

  console.log(JSON.stringify({
    ok: true,
    route: "/discovery",
    categories: discoveryCategories.length,
    subcategories: discoveryCategories.reduce((sum, category) => sum + category.subcategories.length, 0),
    discoveries: canonicalDiscoveries.length,
    rarities: discoveryRarities.map((rarity) => rarity.id),
    collections: discoveryCollections.length,
    chains: discoveryChains.length,
    milestones: discoveryMilestones.length,
    playerStatePolicy: discoveryPlayerCollectionSchema.studioOwnership,
    encyclopediaEntries: discoverySection.entries.length,
    assetLibraryDiscoveryItems: discoveryInventory.total,
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      checksum: runtime.metadata.checksum,
      validationStatus: runtime.metadata.validationStatus
    },
    engineExports: Object.fromEntries(exports.map((engineExport, index) => [targets[index], engineExport.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
