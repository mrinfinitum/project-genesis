import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { handoffData } from "@/data/handoff";
import { CANONICAL_LIBRARY_ARTWORK_CATALOG, buildCanonicalLibraryArtworkReport, resolveCanonicalRecordArtwork, type CanonicalRecordArtworkInput } from "@/lib/artwork/canonical-record-artwork";
import { canonicalBuildingLibrary } from "@/lib/buildings/taxonomy";
import { getUniverseLibraryData } from "@/lib/universe/library";
import type { ResearchNode } from "@/types/schema";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function publicPath(url?: string) {
  if (!url || !url.startsWith("/")) return null;
  return path.join(process.cwd(), "public", url.replace(/^\//, ""));
}

function publicUrlExists(url?: string) {
  const resolved = publicPath(url);
  return Boolean(resolved && existsSync(resolved));
}

function publicUrlSize(url?: string) {
  const resolved = publicPath(url);
  return resolved && existsSync(resolved) ? statSync(resolved).size : 0;
}

function noPrivatePath(value: unknown) {
  const serialized = JSON.stringify(value);
  return !serialized.includes("/Users/") && !serialized.includes("studio-private://");
}

function libraryRecordInput(record: {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  parentLabel?: string;
  previewTone: CanonicalRecordArtworkInput["tone"];
}): CanonicalRecordArtworkInput {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    classification: record.subtype,
    parent: record.parentLabel,
    tone: record.previewTone
  };
}

const universe = getUniverseLibraryData();
const universeRecords = [
  ...universe.galaxies,
  ...universe.sectors,
  ...universe.starSystems,
  ...universe.stars,
  ...universe.planets,
  ...universe.discoveries,
  ...universe.civilizations
];
const buildingRecords: CanonicalRecordArtworkInput[] = canonicalBuildingLibrary.map((record) => ({
  id: record.id,
  name: record.displayName,
  type: record.familyName,
  classification: record.subcategoryName,
  parent: record.era,
  tone: "building"
}));
const researchRecords: CanonicalRecordArtworkInput[] = (handoffData.research as ResearchNode[]).map((record) => ({
  id: record.id,
  name: record.name,
  type: record.primary_unlock_type || record.branch_id || "Research",
  classification: record.travel_tier || record.space_system_unlocked || "Research Node",
  parent: record.era,
  tone: "research"
}));
const canonicalRecords = [
  ...universeRecords.map(libraryRecordInput),
  ...buildingRecords,
  ...researchRecords
];
const resolutions = canonicalRecords.map((record) => ({ record, artwork: resolveCanonicalRecordArtwork(record) }));
const thumbnailUrls = resolutions.map((row) => row.artwork.thumbnail.url).filter((url): url is string => Boolean(url));
const missingThumbnailFiles = thumbnailUrls.filter((url) => !publicUrlExists(url));
const sourceUrlLeaks = thumbnailUrls.filter((url) => url.startsWith("/images/"));
const privatePathLeaks = resolutions.filter((row) => !noPrivatePath(row));
const thumbnailSizes = thumbnailUrls.map(publicUrlSize).filter((size) => size > 0);
const averageThumbnailBytes = Math.round(thumbnailSizes.reduce((sum, size) => sum + size, 0) / Math.max(1, thumbnailSizes.length));
const largestThumbnailBytes = Math.max(0, ...thumbnailSizes);
const report = buildCanonicalLibraryArtworkReport(canonicalRecords);

function expectedRecord(name: string) {
  const row = universeRecords.find((record) => record.name.toLowerCase() === name.toLowerCase());
  assert(row, `Expected ${name} to exist in generated universe library records.`);
  return row;
}

function assertResolvedSample(name: string, expectedFragment: string) {
  const record = expectedRecord(name);
  assert(record.thumbnailUrl?.includes(expectedFragment), `${name} should resolve to ${expectedFragment}; received ${record.thumbnailUrl ?? "none"}`);
  assert(record.thumbnailRetinaUrl === record.thumbnailUrl, `${name} should use the same public image for standard and retina after removing generated library thumbnails.`);
  assert(record.artworkFallbackReason !== "minimal_neutral_placeholder", `${name} must not use the neutral placeholder.`);
  assert(!record.thumbnailUrl?.includes("asset_galaxy_icon"), `${name} must not use the generic galaxy icon.`);
}

function main() {
  const card = read("components/generated-library-card.tsx");
  const universeLibrary = read("lib/universe/library.ts");
  const universeComponent = read("components/generated-universe-library.tsx");
  const packageJson = JSON.parse(read("package.json")) as { scripts?: Record<string, string> };

  assert(card.includes("resolveCanonicalRecordArtwork"), "GeneratedLibraryCard must use the canonical artwork resolver.");
  assert(card.includes("loading=\"lazy\""), "Library thumbnails must lazy load.");
  assert(card.includes("decoding=\"async\""), "Library thumbnails must async decode.");
  assert(card.includes("sizes="), "Library thumbnails must include responsive sizes.");
  assert(card.includes("srcSet"), "Library thumbnails must include srcset.");
  assert(card.includes("width={artwork.thumbnail.width}") && card.includes("height={artwork.thumbnail.height}"), "Library cards must reserve derivative dimensions from the resolver.");
  assert(universeComponent.includes("thumbnailRetinaUrl"), "Universe cards must pass retina thumbnail metadata.");
  assert(!universeLibrary.includes("libraryThumbnails"), "Universe Library must not use the old hardcoded thumbnail table.");
  assert(!universeLibrary.includes("asset_galaxy_icon"), "Universe Library must not hardcode the generic galaxy icon.");
  assert(!read("app/buildings/page.tsx").includes("asset_buildings_icon"), "Building Library must not override canonical artwork with a fixed icon.");
  assert(!read("app/research/page.tsx").includes("asset_research_icon"), "Research Library must not override canonical artwork with a fixed icon.");

  assert(CANONICAL_LIBRARY_ARTWORK_CATALOG.length >= 20, "Canonical artwork catalog must cover generated library classes.");
  assert(new Set(CANONICAL_LIBRARY_ARTWORK_CATALOG.map((entry) => entry.id)).size === CANONICAL_LIBRARY_ARTWORK_CATALOG.length, "Artwork catalog IDs must be unique.");
  for (const entry of CANONICAL_LIBRARY_ARTWORK_CATALOG) {
    assert(publicUrlExists(entry.thumbnailUrl), `Missing public artwork image: ${entry.thumbnailUrl}`);
    assert(publicUrlExists(entry.retinaThumbnailUrl), `Missing public artwork image: ${entry.retinaThumbnailUrl}`);
    assert(entry.thumbnailUrl.startsWith("/images/"), `Catalog artwork must use existing public images after removing generated library thumbnails: ${entry.thumbnailUrl}`);
  }

  for (const sample of [
    ["Earth", "09-cradle-world.png"],
    ["Moon", "03-archive-moon.png"],
    ["Mercury", "02-rogue-planet-camps.png"],
    ["Venus", "06-crystal-storm-world.png"],
    ["Mars", "16-desert-skyport.png"],
    ["Phobos", "03-ring-miner-convoy.png"],
    ["Deimos", "03-ring-miner-convoy.png"],
    ["Asteroid Belt", "08-asteroid-city.png"],
    ["Sol", "08-solar-forge.png"]
  ] as const) {
    assertResolvedSample(sample[0], sample[1]);
  }

  assert(thumbnailUrls.length === canonicalRecords.length, `Every visual library record needs a thumbnail URL; ${thumbnailUrls.length}/${canonicalRecords.length} resolved.`);
  assert(missingThumbnailFiles.length === 0, `Broken thumbnail derivatives: ${missingThumbnailFiles.join(", ")}`);
  assert(privatePathLeaks.length === 0, "Library artwork diagnostics must not leak private paths.");
  assert(report.genericFallbackInUse === 0, `Neutral placeholders remain in Library cards: ${report.genericFallbackInUse}`);
  assert(!packageJson.scripts?.["generate:library-thumbnails"], "Generated library thumbnail script should not be registered after removing the thumbnail folder.");
  for (const script of [
    "verify:canonical-library-artwork",
    "verify:library-artwork-resolution",
    "verify:artwork-relationships",
    "verify:artwork-fallbacks",
    "verify:library-image-performance"
  ]) {
    assert(packageJson.scripts?.[script], `${script} must be registered.`);
  }

  console.log(JSON.stringify({
    status: "ok",
    rootCause: "Generated universe records were routed through hardcoded tone thumbnails, causing planets and systems to inherit the generic galaxy icon instead of record-specific artwork.",
    resolutionOrder: [
      "record thumbnail derivative",
      "record preview derivative",
      "record artwork asset",
      "semantic catalog derivative",
      "type fallback derivative",
      "neutral placeholder"
    ],
    libraryCounts: {
      galaxies: universe.galaxies.length,
      sectors: universe.sectors.length,
      starSystems: universe.starSystems.length,
      stars: universe.stars.length,
      planets: universe.planets.length,
      discoveries: universe.discoveries.length,
      civilizations: universe.civilizations.length,
      buildings: buildingRecords.length,
      research: researchRecords.length
    },
    report,
    performance: {
      thumbnailCount: thumbnailUrls.length,
      averageThumbnailBytes,
      largestThumbnailBytes,
      publicImageCardSources: sourceUrlLeaks.length,
      brokenThumbnailCount: missingThumbnailFiles.length
    },
    samples: Object.fromEntries(["Earth", "Moon", "Mercury", "Venus", "Mars", "Phobos", "Deimos", "Asteroid Belt", "Sol"].map((name) => {
      const record = expectedRecord(name);
      return [name, { thumbnailUrl: record.thumbnailUrl, sourceAssetId: record.artworkSourceAssetId, reason: record.artworkFallbackReason }];
    }))
  }, null, 2));
}

main();
