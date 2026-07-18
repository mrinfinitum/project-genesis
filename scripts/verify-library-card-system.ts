import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { handoffData } from "@/data/handoff";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { canonicalBuildingLibrary } from "@/lib/buildings/taxonomy";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { getUniverseLibraryData, getUniverseLibrarySource, isGeneratedGameRecord, type UniverseLibraryRecord } from "@/lib/universe/library";
import type { ResearchNode } from "@/types/schema";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assertIncludes(label: string, text: string, expected: string) {
  assert(text.includes(expected), `${label} must include ${expected}.`);
}

function assertNotIncludes(label: string, text: string, blocked: string) {
  assert(!text.includes(blocked), `${label} must not include ${blocked}.`);
}

function assertFile(relativePath: string) {
  assert(existsSync(path.join(process.cwd(), relativePath)), `Expected file is missing: ${relativePath}`);
}

const generatedLibraryFiles = [
  "components/generated-library-card.tsx",
  "components/generated-universe-library.tsx",
  "lib/universe/library.ts",
  "app/galaxy/page.tsx",
  "app/sector-map/page.tsx",
  "app/star-system-map/page.tsx",
  "app/celestial-bodies/page.tsx",
  "app/planets/page.tsx",
  "app/discovery-journal/page.tsx",
  "app/civilizations/page.tsx",
  "app/buildings/page.tsx",
  "app/research/page.tsx"
];

const forbiddenGeneratedLibraryTerms = [
  "resolveCanonicalRecordArtwork",
  "canonical-record-artwork",
  "CANONICAL_LIBRARY_ARTWORK_CATALOG",
  "libraryArtwork(",
  "thumbnailRetinaUrl",
  "artworkFallbackReason",
  "artworkSourceAssetId",
  "asset_galaxy_icon",
  "asset_planet_icon",
  "libraryThumbnails",
  "Artwork Needed",
  "Missing Preview",
  "Background Needed",
  "sourceFilePath",
  "/Users/"
];

const expectedPlanetSamples = ["Earth", "Moon", "Mercury", "Venus", "Mars", "Phobos", "Deimos", "Asteroid Belt"];
const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];

type ArtworkDecision = {
  source: "direct_saved_record_image" | "local_derivative" | "class_fallback" | "missing_art";
  url: string | null;
};

function publicUrlExists(url: string) {
  if (!url.startsWith("/")) return false;
  return existsSync(path.join(process.cwd(), "public", url.split("?")[0]!.replace(/^\//, "")));
}

function directRecordImage(record: Record<string, unknown>): string | null {
  const fields = [
    "thumbnailUrl",
    "thumbnail_url",
    "imageUrl",
    "image_url",
    "previewUrl",
    "preview_url",
    "artworkUrl",
    "artwork_url",
    "renderUrl",
    "render_url",
    "heroImageUrl",
    "hero_image_url",
    "cardImageUrl",
    "card_image_url"
  ];
  for (const field of fields) {
    const value = record[field];
    if (typeof value === "string" && value.trim().startsWith("/")) return value.trim();
  }
  return null;
}

function artworkDecisionFor(record: UniverseLibraryRecord, sourceRecord: Record<string, unknown>): ArtworkDecision {
  const direct = directRecordImage(sourceRecord);
  if (direct) {
    assert(record.thumbnailUrl === direct, `${record.name} must use its direct saved image field.`);
    return { source: "direct_saved_record_image", url: direct };
  }

  const thumbnailUrl = record.thumbnailUrl;
  if (!thumbnailUrl?.startsWith("/")) {
    return { source: "missing_art", url: null };
  }
  assert(publicUrlExists(thumbnailUrl), `${record.name} thumbnail does not exist: ${thumbnailUrl}.`);

  const name = String(sourceRecord.name ?? record.name).toLowerCase();
  const exactSolPreview = new Set(["earth", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "europa", "ganymede", "titan", "enceladus"]);
  if (exactSolPreview.has(name)) {
    assert(thumbnailUrl === `/assets/game-art/planet-renders/sol/sol_${name}.png`, `${record.name} must use its exact Sol preview derivative.`);
    return { source: "local_derivative", url: thumbnailUrl };
  }

  return { source: thumbnailUrl.startsWith("/assets/game-art/") ? "local_derivative" : "class_fallback", url: thumbnailUrl };
}

function verifyGeneratedLibraryCode() {
  const card = read("components/generated-library-card.tsx");
  const universeComponent = read("components/generated-universe-library.tsx");

  for (const file of generatedLibraryFiles) {
    const content = read(file);
    for (const term of forbiddenGeneratedLibraryTerms) {
      assertNotIncludes(file, content, term);
    }
  }

  assertIncludes("GeneratedLibraryCard", card, "export function GeneratedLibraryCard");
  assertIncludes("GeneratedLibraryCard", card, "aspect-video");
  assertIncludes("GeneratedLibraryCard", card, "object-cover");
  assertIncludes("GeneratedLibraryCard", card, "loading=\"lazy\"");
  assertIncludes("GeneratedLibraryCard", card, "decoding=\"async\"");
  assertIncludes("GeneratedLibraryCard", card, "srcSet");
  assertIncludes("GeneratedLibraryCard", card, "sizes=");
  assertIncludes("GeneratedLibraryCard", card, "record.thumbnailUrl");
  assertIncludes("GeneratedLibraryCard", card, "record.mediumPreviewUrl");
  assertIncludes("GeneratedLibraryCard", card, "<ImageIcon");
  assertNotIncludes("GeneratedLibraryCard", card, "label=\"Seed\"");
  assertNotIncludes("GeneratedLibraryCard", card, "label=\"ID\"");
  assertNotIncludes("GeneratedLibraryCard", card, "Registry");

  assertIncludes("GeneratedUniverseLibrary", universeComponent, "GeneratedLibraryCard");
  assertNotIncludes("GeneratedUniverseLibrary", universeComponent, "function GeneratedRecordCard");
  assertIncludes("Building Library", read("app/buildings/page.tsx"), "GeneratedLibraryCard");
  assertIncludes("Research Library", read("app/research/page.tsx"), "GeneratedLibraryCard");
}

function verifyUniverseRecords() {
  const source = getUniverseLibrarySource();
  const data = getUniverseLibraryData();
  const samples = expectedPlanetSamples.map((name) => {
    const raw = source.bodies.find((body) => body.name === name);
    assert(raw, `Planet Library source is missing ${name}.`);
    const record = data.planets.find((planet) => planet.name === name);
    assert(record, `Planet Library card is missing ${name}.`);
    assert(record.id === raw.id, `${name} card ID changed from source record ${raw.id} to ${record.id}.`);
    assert(record.type === raw.celestial_body_type, `${name} card type must come from celestial_body_type.`);
    assert(record.parentId === raw.system_id, `${name} parent relationship must resolve to its star system.`);
    assert(record.href === `/planets?record=${encodeURIComponent(raw.id)}`, `${name} detail route is incorrect: ${record.href}.`);
    return {
      name,
      id: record.id,
      source: "generateCelestialBodies(system)",
      displayedImage: artworkDecisionFor(record, raw as unknown as Record<string, unknown>),
      route: record.href
    };
  });

  assert(data.galaxies.length === 1, `Galaxy Library should currently expose only generated galaxies; received ${data.galaxies.length}.`);
  assert(data.galaxies[0]?.name === "Milky Way", "Galaxy Library must expose Milky Way from the generated source.");
  assert(data.sectors.length === 1, `Sector Library should currently expose only generated sectors; received ${data.sectors.length}.`);
  assert(data.starSystems.length === 12, `Star System Library expected 12 generated systems; received ${data.starSystems.length}.`);
  assert(data.stars.length === 22, `Star Library expected 22 generated stars; received ${data.stars.length}.`);
  assert(data.planets.length === 98, `Planet Library expected 98 generated celestial bodies; received ${data.planets.length}.`);
  assert(data.discoveries.length === 10, `Discovery Library expected 10 canonical discovery records; received ${data.discoveries.length}.`);
  assert(data.civilizations.length === 8, `Civilization Library expected 8 generated/fallback factions; received ${data.civilizations.length}.`);

  const allRecords = [
    ...data.galaxies,
    ...data.sectors,
    ...data.starSystems,
    ...data.stars,
    ...data.planets,
    ...data.discoveries,
    ...data.civilizations
  ];
  const ids = new Set<string>();
  for (const record of allRecords) {
    assert(record.id.trim(), `${record.name} is missing an ID.`);
    assert(!ids.has(record.id), `Duplicate generated-library record ID: ${record.id}.`);
    ids.add(record.id);
    assert(record.href.includes(encodeURIComponent(record.id)), `${record.name} route does not point at its own ID.`);
    const thumbnailUrl = record.thumbnailUrl;
    if (thumbnailUrl) {
      assert(thumbnailUrl.startsWith("/"), `${record.name} thumbnail must be a browser-safe local path.`);
      assert(publicUrlExists(thumbnailUrl), `${record.name} thumbnail does not exist: ${thumbnailUrl}.`);
      assert(!thumbnailUrl.includes("/Users/") && !thumbnailUrl.startsWith("rbxassetid://"), `${record.name} thumbnail must not expose a private or Roblox-only path.`);
    }
  }

  for (const galaxy of source.galaxies) assert(isGeneratedGameRecord(galaxy as unknown as Record<string, unknown>, "galaxies", source), `Galaxy failed generated-record validation: ${galaxy.id}`);
  for (const sector of source.sectors) assert(isGeneratedGameRecord(sector as unknown as Record<string, unknown>, "sectors", source), `Sector failed generated-record validation: ${sector.id}`);
  for (const system of source.starSystems) assert(isGeneratedGameRecord(system as unknown as Record<string, unknown>, "star-systems", source), `Star system failed generated-record validation: ${system.id}`);
  for (const star of source.stars) assert(isGeneratedGameRecord(star as unknown as Record<string, unknown>, "stars", source), `Star failed generated-record validation: ${star.id}`);
  const displayedPlanetIds = new Set(data.planets.map((planet) => planet.id));
  for (const body of source.bodies.filter((row) => displayedPlanetIds.has(row.id))) {
    assert(isGeneratedGameRecord(body as unknown as Record<string, unknown>, "planets", source), `Planet Library record failed generated-record validation: ${body.id}`);
  }

  const planetNames = data.planets.map((record) => `${record.name} ${record.id}`.toLowerCase());
  for (const forbidden of ["planetary power grid", "rare earth elements", "planet seed", "planet background", "planet card background"]) {
    assert(!planetNames.some((value) => value.includes(forbidden)), `Planet Library still includes non-celestial record: ${forbidden}`);
  }

  return { data, samples };
}

async function verifyAssetLibraryDefaults() {
  const assetContentBrowser = read("components/asset-content-browser.tsx");
  assertIncludes("Asset Content Browser", assetContentBrowser, "function isUploadedAssetItem");
  assertIncludes("Asset Content Browser", assetContentBrowser, "item.sourceType === \"asset_registry\"");
  assertIncludes("Asset Content Browser", assetContentBrowser, "item.previewUrl?.startsWith(\"/\")");
  assertIncludes("Asset Content Browser", assetContentBrowser, "state.assetLibraryInventory.items.filter(isUploadedAssetItem)");
  assertNotIncludes("Asset Content Browser", assetContentBrowser, "Artwork Needed");
  assertNotIncludes("Asset Content Browser", assetContentBrowser, "missing_art");
  assertNotIncludes("Asset Content Browser", assetContentBrowser, "grid-cols-[16rem_minmax(0,1fr)_20rem]");

  const state = await getAssetProductionState();
  const visibleBrowserItems = state.assetLibraryInventory.items.filter((item) => item.sourceType === "asset_registry" && Boolean(item.sourceAssetId) && Boolean(item.previewUrl?.startsWith("/")));
  const hiddenRegistryWithoutPreview = state.assetLibraryInventory.items.filter((item) => item.sourceType === "asset_registry" && Boolean(item.sourceAssetId) && !item.previewUrl?.startsWith("/"));
  const hiddenRequirementItems = state.assetLibraryInventory.items.filter((item) => item.sourceType !== "asset_registry");

  assert(state.assets.length > 0, "Asset Library must preserve real asset records.");
  assert(visibleBrowserItems.length > 0, "Default Asset Library browser must show real uploaded/imported assets.");
  assert(visibleBrowserItems.length + hiddenRegistryWithoutPreview.length === state.assets.length, "Default Asset Library accounting must split real asset records from the one known no-preview record.");
  assert(hiddenRegistryWithoutPreview.length === 1 && hiddenRegistryWithoutPreview[0]?.sourceAssetId === "asset_click_interface_circle", "Only the known Roblox-ID-only click interface asset may be hidden from the default browser.");
  assert(hiddenRequirementItems.length > 0, "Production requirement records should remain available outside default browsing.");
  assert(!visibleBrowserItems.some((item) => item.sourceType !== "asset_registry"), "Requirement-only cards must not appear in the default Asset Library browser.");
  assert(!visibleBrowserItems.some((item) => item.status === "missing"), "Missing requirement cards must not appear in the default Asset Library browser.");
  assert(!visibleBrowserItems.some((item) => item.previewUrl?.includes("/Users/") || item.previewUrl?.startsWith("rbxassetid://")), "Default Asset Library previews must be browser-safe public paths.");

  return {
    realAssets: state.assets.length,
    visibleBrowserItems: visibleBrowserItems.length,
    hiddenRegistryWithoutPreview: hiddenRegistryWithoutPreview.length,
    hiddenRequirementItems: hiddenRequirementItems.length
  };
}

async function verifyRuntimeAndExports() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
  }
  return {
    contentVersion: runtime.metadata.contentVersion,
    runtimeVersion: runtime.metadata.schemaVersion,
    checksum: runtime.metadata.checksum,
    exports: Object.fromEntries(exports.map((engineExport, index) => [targets[index], engineExport.validation.status]))
  };
}

async function main() {
  assertFile("components/generated-library-card.tsx");
  assertFile("components/generated-universe-library.tsx");
  verifyGeneratedLibraryCode();
  const universe = verifyUniverseRecords();
  const assetLibrary = await verifyAssetLibraryDefaults();
  const runtime = await verifyRuntimeAndExports();
  const researchRows = handoffData.research as ResearchNode[];

  console.log(JSON.stringify({
    status: "ok",
    baseline: {
      selected: "2a61656^",
      reason: "Direct generated-record library fields and neutral fallback before canonical artwork substitution and generated thumbnail layers."
    },
    universeLibraries: {
      galaxies: universe.data.galaxies.length,
      sectors: universe.data.sectors.length,
      starSystems: universe.data.starSystems.length,
      stars: universe.data.stars.length,
      planets: universe.data.planets.length,
      discoveries: universe.data.discoveries.length,
      civilizations: universe.data.civilizations.length,
      buildings: canonicalBuildingLibrary.length,
      research: researchRows.length
    },
    planetSamples: universe.samples,
    assetLibrary,
    runtime
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
