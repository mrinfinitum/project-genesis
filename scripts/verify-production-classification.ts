import { readFileSync } from "node:fs";
import path from "node:path";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import {
  resolveAssetClass,
  resolveProductionClasses,
  resolveProductionClassSummaries,
  resolveProductionItemsForClass
} from "@/lib/assets/production-classification";
import { getGameData } from "@/lib/data";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  const workspace = read("components/creative-production-workspace.tsx");
  const resolver = read("lib/assets/production-classification.ts");
  const page = read("app/creative-production/page.tsx");

  assert(workspace.includes("ClassSelector"), "Creative Production must render one compact class/group selector.");
  assert(workspace.includes("ClassSummaryCard"), "Creative Production must show class summary cards when Class is All.");
  assert(workspace.includes("Back to All Classes"), "Drill-down view must expose Back to All Classes.");
  assert(workspace.includes("role-filter-"), "Class drill-down must expose secondary role filtering.");
  assert(workspace.includes("Production Priority"), "View Options must include production priority sorting.");
  assert(workspace.includes("sort: \"priority\""), "Creative Production default sort must be production priority.");
  assert(workspace.includes("params.set(\"class\""), "Upload and deep-link flows must carry selected canonical class IDs.");
  assert(workspace.includes("window.history.replaceState"), "Class selection must persist into the URL.");
  assert(!workspace.includes("`${area.label} Groups`"), "Primary Creative Production must not render busy group-chip rows.");
  assert(!workspace.includes("area.groups.map"), "Primary Creative Production must not show every role/group as permanent chips.");
  assert(page.includes("getGameData"), "Creative Production page must pass canonical Studio data into class resolution.");
  assert(resolver.includes("explicit_canonical_reference"), "Class resolver must support explicit canonical references.");
  assert(resolver.includes("linked_canonical_record"), "Class resolver must support linked canonical records.");
  assert(resolver.includes("unclassified"), "Class resolver must preserve an Unclassified queue.");
  assert(!resolver.includes("sourceFilename") && !resolver.includes("filename"), "Class resolver must not classify from source filenames.");

  const state = await getAssetProductionState();
  const data = await getGameData();
  const items = state.assetLibraryInventory.items;
  const areaItems = {
    upgrades: items.filter((item) => item.categoryId === "upgrade-categories" || /upgrade_panel_.*_background|upgrade category|shared fallback/i.test([item.semanticAssetKey, item.displayName, item.role].join(" "))),
    research: items.filter((item) => item.categoryId === "research-ui"),
    buildings: items.filter((item) => item.categoryId === "buildings-ui"),
    topHud: items.filter((item) => item.categoryId === "top-hud"),
    leftNavigation: items.filter((item) => item.categoryId === "left-navigation")
  };

  const upgradeClasses = resolveProductionClasses("upgrades", data);
  const upgradeSummaries = resolveProductionClassSummaries(areaItems.upgrades, "upgrades", data);
  for (const id of ["workforce", "industry", "science", "technology"]) {
    assert(upgradeClasses.some((row) => row.classId === id), `Upgrades class selector is missing ${id}.`);
    assert((upgradeSummaries.find((row) => row.classId === id)?.itemCount ?? 0) > 0, `Upgrades class ${id} must have matching production items.`);
    assert(resolveProductionItemsForClass(areaItems.upgrades, "upgrades", id, data).every((item) => resolveAssetClass(item, "upgrades", data).classId === id), `Upgrades ${id} drill-down leaked another class.`);
  }
  assert(upgradeClasses.some((row) => row.classId === "shared"), "Upgrades must expose Shared / Global.");
  assert(upgradeClasses.some((row) => row.classId === "unclassified"), "Upgrades must expose Unclassified.");
  const workforceRoles = new Set(resolveProductionItemsForClass(areaItems.upgrades, "upgrades", "workforce", data).map((item) => resolveAssetClass(item, "upgrades", data).assetRole));
  assert(workforceRoles.has("Background") || workforceRoles.has("Icon") || workforceRoles.has("Card"), "Upgrade class records must preserve asset roles as secondary metadata.");

  const researchClasses = resolveProductionClasses("research", data);
  assert(researchClasses.length >= 10, `Research class picker must derive canonical branch taxonomy; received ${researchClasses.length}.`);
  const agriculture = researchClasses.find((row) => /agric/i.test(row.displayName));
  assert(agriculture, "Research class picker must include the canonical Agriculture branch.");
  if (!agriculture) throw new Error("Missing Agriculture branch.");
  const agricultureItems = resolveProductionItemsForClass(areaItems.research, "research", agriculture.classId, data);
  assert(agricultureItems.length > 0, "Agriculture drill-down must resolve branch production items.");
  assert(agricultureItems.every((item) => resolveAssetClass(item, "research", data).classId === agriculture.classId), "Agriculture drill-down leaked another branch.");
  assert(resolveProductionClasses("research", data).some((row) => row.classId === "shared"), "Research must expose Shared / Global.");
  assert(resolveProductionClasses("research", data).some((row) => row.classId === "unclassified"), "Research must expose Unclassified.");

  const buildingClasses = resolveProductionClasses("buildings", data);
  const canonicalBuildingClassIds = new Set(data.buildings.map((building) => building.category).filter(Boolean).map((category) => category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")));
  for (const id of canonicalBuildingClassIds) {
    assert(buildingClasses.some((row) => row.classId === id), `Buildings class selector is missing canonical class ${id}.`);
  }
  const populatedBuildingClass = resolveProductionClassSummaries(areaItems.buildings, "buildings", data).find((row) => row.classId !== "shared" && row.classId !== "unclassified");
  assert(populatedBuildingClass, "Buildings must have at least one populated canonical class summary.");
  if (!populatedBuildingClass) throw new Error("Missing populated building class.");
  assert(resolveProductionItemsForClass(areaItems.buildings, "buildings", populatedBuildingClass.classId, data).every((item) => resolveAssetClass(item, "buildings", data).classId === populatedBuildingClass.classId), "Building class drill-down leaked another class.");

  const topHudClasses = resolveProductionClasses("top-hud", data).map((row) => row.classId);
  const navClasses = resolveProductionClasses("left-navigation", data).map((row) => row.classId);
  for (const id of ["shell", "economy-icons", "identity", "utility-buttons", "interaction-states"]) assert(topHudClasses.includes(id), `Top HUD group selector is missing ${id}.`);
  for (const id of ["shell", "navigation-icons", "selected-state", "inactive-state", "badges-indicators"]) assert(navClasses.includes(id), `Left Navigation group selector is missing ${id}.`);

  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(runtime.metadata.contentVersion === 15, `Production classification must not change runtime contentVersion; received ${runtime.metadata.contentVersion}.`);
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);
  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
  }

  console.log(JSON.stringify({
    ok: true,
    routeExamples: [
      "/creative-production?area=upgrades&class=workforce",
      `/creative-production?area=research&class=${agriculture.classId}`,
      `/creative-production?area=buildings&class=${populatedBuildingClass.classId}`
    ],
    upgrades: upgradeSummaries.map((row) => ({ classId: row.classId, itemCount: row.itemCount, missing: row.missingCount, published: row.publishedCount })),
    researchClassCount: researchClasses.length,
    buildingsClassCount: buildingClasses.length,
    topHudGroups: topHudClasses,
    leftNavigationGroups: navClasses,
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

