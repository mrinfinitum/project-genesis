import { readFileSync } from "node:fs";
import path from "node:path";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { resolveProductionClasses } from "@/lib/assets/production-classification";
import {
  buildBuildingClassifications,
  canonicalBuildingTaxonomy,
  classifyBuilding,
  legacyBuildingCategoryMapping,
  validateBuildingTaxonomy
} from "@/lib/buildings/taxonomy";
import { getGameData } from "@/lib/data";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, getGameRuntimeData } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  const page = read("app/buildings/page.tsx");
  const creativeWorkspace = read("components/creative-production-workspace.tsx");
  const classificationResolver = read("lib/assets/production-classification.ts");
  const gameEngine = read("lib/export/game-engine.ts");
  const runtimeBuilder = read("lib/runtime/game-runtime.ts");

  assert(canonicalBuildingTaxonomy.length === 20, `Expected 20 canonical building families; received ${canonicalBuildingTaxonomy.length}.`);
  const familyIds = new Set(canonicalBuildingTaxonomy.map((family) => family.id));
  const displayOrders = canonicalBuildingTaxonomy.map((family) => family.displayOrder);
  assert(new Set(displayOrders).size === displayOrders.length, "Building family displayOrder values must be unique.");
  for (const family of canonicalBuildingTaxonomy) {
    assert(family.subcategories.length > 0, `${family.displayName} must include subcategories.`);
    assert(new Set(family.subcategories.map((subcategory) => subcategory.displayOrder)).size === family.subcategories.length, `${family.displayName} subcategory displayOrder values must be unique.`);
  }
  for (const required of ["population-housing", "agriculture-food", "resources-extraction", "production", "industry", "utilities-infrastructure", "research-education", "commerce-trade", "government-administration", "health-welfare", "culture-society", "security-defense", "space-exploration", "planetary-development", "civilization-systems", "wonders-megastructures", "ancient-historical", "alien-exotic", "environment-ecology", "special"]) {
    assert(familyIds.has(required), `Canonical building taxonomy is missing ${required}.`);
  }

  const data = await getGameData();
  const validation = validateBuildingTaxonomy(data.buildings);
  assert(validation.valid, `Building taxonomy validation failed: ${validation.issues.map((issue) => issue.message).join("; ")}`);
  const classifications = buildBuildingClassifications(data.buildings);
  assert(classifications.length === data.buildings.length, "Every building must receive exactly one taxonomy classification.");
  assert(new Set(classifications.map((classification) => classification.buildingId)).size === data.buildings.length, "Building taxonomy migration must preserve existing building IDs.");
  for (const building of data.buildings) {
    const classification = classifyBuilding(building);
    assert(familyIds.has(classification.primaryFamilyId), `${building.id} resolved to an unknown family.`);
  }
  for (const legacy of ["residential", "production", "utility", "research", "commercial"]) {
    assert(legacyBuildingCategoryMapping[legacy], `Legacy category mapping is missing ${legacy}.`);
  }

  const state = await getAssetProductionState();
  const buildingProductionClasses = resolveProductionClasses("buildings", data);
  assert(buildingProductionClasses.length > 0, "Creative Production Buildings must resolve taxonomy classes.");
  for (const classRow of buildingProductionClasses.filter((row) => !["shared", "unclassified"].includes(row.classId))) {
    assert(familyIds.has(classRow.classId), `Creative Production Buildings class ${classRow.classId} is not a taxonomy family.`);
  }
  assert(state.assetLibraryInventory.items.some((item) => item.categoryId === "buildings-ui"), "Asset Library must expose Buildings UI inventory records.");
  assert(page.includes("Canonical Building Taxonomy v1.0"), "Building Designer must surface the canonical taxonomy standard.");
  assert(page.includes("Legacy Migration Map"), "Building Designer must show the legacy category migration map.");
  assert(classificationResolver.includes("canonicalBuildingTaxonomy"), "Creative Production class resolver must use canonical building taxonomy.");
  assert(creativeWorkspace.includes("ClassSummaryCard"), "Creative Production must render class summary cards for large building collections.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(runtime.metadata.contentVersion >= 16, `Runtime must publish contentVersion 16 or newer for building taxonomy; received ${runtime.metadata.contentVersion}.`);
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);
  assert(runtime.buildingTaxonomy.length === 20, "Canonical runtime must export the full building taxonomy.");
  assert(runtime.buildingClassifications.length === data.buildings.length, "Canonical runtime must export one building classification per building.");
  const roblox = buildRobloxRuntimePayload(await getGameRuntimeData());
  assert(roblox.buildingTaxonomy.length === 20, "Roblox runtime must export building taxonomy.");
  assert(roblox.buildingClassifications.length === data.buildings.length, "Roblox runtime must export building classifications.");
  assert(runtimeBuilder.includes("buildingTaxonomy") && runtimeBuilder.includes("buildingClassifications"), "Runtime builder must publish taxonomy metadata.");
  assert(gameEngine.includes("building_taxonomy") && gameEngine.includes("building_classifications"), "Engine exports must include taxonomy modules.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
    assert(Array.isArray(engineExport.canonical.building_taxonomy), `${targets[index]} export is missing building_taxonomy.`);
    assert(Array.isArray(engineExport.canonical.building_classifications), `${targets[index]} export is missing building_classifications.`);
  }

  const familyCounts = Object.fromEntries(canonicalBuildingTaxonomy.map((family) => [family.id, classifications.filter((classification) => classification.primaryFamilyId === family.id).length]));
  console.log(JSON.stringify({
    ok: true,
    taxonomyVersion: "building-taxonomy-v1",
    families: canonicalBuildingTaxonomy.length,
    subcategories: canonicalBuildingTaxonomy.reduce((sum, family) => sum + family.subcategories.length, 0),
    buildings: data.buildings.length,
    classifications: classifications.length,
    familyCounts,
    migrationWarnings: validation.issues.filter((issue) => issue.severity === "warning").length,
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      validationStatus: runtime.metadata.validationStatus,
      checksum: runtime.metadata.checksum
    },
    engineExports: Object.fromEntries(exports.map((engineExport, index) => [targets[index], engineExport.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

