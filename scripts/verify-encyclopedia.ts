import { readFileSync } from "node:fs";
import path from "node:path";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { canonicalBuildingLibrary, canonicalBuildingTaxonomy } from "@/lib/buildings/taxonomy";
import { getGameData } from "@/lib/data";
import { canonicalDiscoveries } from "@/lib/discovery";
import { buildCivilizationEncyclopediaState } from "@/lib/encyclopedia";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  const page = read("app/encyclopedia/page.tsx");
  const shell = read("components/app-shell.tsx");
  const assetRouting = read("lib/assets/asset-library-routing.ts");
  const creativeProduction = read("components/creative-production-workspace.tsx");
  const data = await getGameData();
  const assetState = await getAssetProductionState();
  const state = buildCivilizationEncyclopediaState(data, assetState.assets);

  assert(page.includes("Civilization Encyclopedia"), "/encyclopedia page must present the workspace name.");
  assert(shell.includes('href: "/encyclopedia"') && shell.includes("Civilization Encyclopedia"), "Primary navigation must link to Civilization Encyclopedia.");
  assert(assetRouting.includes('"encyclopedia"') && assetRouting.includes("galactopedia"), "Asset Library must expose Encyclopedia/Galactopedia routing.");
  assert(creativeProduction.includes('id: "encyclopedia"'), "Creative Production must include an Encyclopedia readiness area.");

  assert(state.route === "/encyclopedia", "Encyclopedia route metadata must be /encyclopedia.");
  assert(state.validation.status === "Ready", `Encyclopedia validation must be Ready; received ${state.validation.status}: ${state.validation.issues.map((issue) => issue.message).join("; ")}`);
  assert(state.sections.length >= 20, "Encyclopedia must expose the requested section surface.");
  for (const section of ["building", "research", "resource", "planet", "district", "colony", "ai_agent", "civilization", "faction", "upgrade", "wonder", "discovery"]) {
    assert(state.sections.some((item) => item.id === section && item.status === "active"), `${section} section must be backed by canonical records.`);
  }
  for (const section of ["star", "star_system", "sector", "galaxy", "ship", "species", "event", "trade"]) {
    assert(state.sections.some((item) => item.id === section && item.status === "planned"), `${section} must be marked planned rather than fabricated.`);
  }
  assert(state.entries.length > canonicalBuildingLibrary.length, "Encyclopedia must include more than building scaffold entries.");
  assert(state.sections.find((item) => item.id === "building")?.entries.length === canonicalBuildingLibrary.length, "Building encyclopedia must use the canonical building library.");
  assert(state.sections.find((item) => item.id === "discovery")?.entries.length === canonicalDiscoveries.length, "Discovery encyclopedia must use canonical discovery records.");
  assert(canonicalBuildingTaxonomy.length === 40, "Building taxonomy must remain expanded to 40 families.");
  assert(state.buildingCollections.length >= 10, "Building collections must be supported.");
  assert(state.buildingProgressionChains.length >= 5, "Building progression chains must be supported.");
  assert(state.relationshipGraph.edges.length > 0, "Relationship graph must include canonical progression edges.");
  assert(state.galactopediaContract.status === "draft_not_published", "Galactopedia contract must remain draft and unpublished.");
  assert(state.metrics.scaffoldEntries === canonicalBuildingLibrary.length, "Scaffold building entries must be distinguished from published entries.");
  assert(state.metrics.publishedEntries === 0, "Draft/scaffold encyclopedia entries must not be counted as published.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(runtime.metadata.contentVersion >= 18, `Discovery-backed encyclopedia requires contentVersion 18 or newer; received ${runtime.metadata.contentVersion}.`);
  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
  }

  console.log(JSON.stringify({
    ok: true,
    route: state.route,
    sections: Object.fromEntries(state.sections.map((section) => [section.id, { status: section.status, entries: section.entries.length }])),
    totalEntries: state.metrics.totalEntries,
    buildingFamilies: canonicalBuildingTaxonomy.length,
    buildingEntries: state.sections.find((section) => section.id === "building")?.entries.length ?? 0,
    collections: state.buildingCollections.length,
    progressionChains: state.buildingProgressionChains.length,
    relationshipEdges: state.relationshipGraph.edges.length,
    galactopedia: state.galactopediaContract.status,
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
