import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { handoffData } from "@/data/handoff";
import { resolveCanonicalRecordArtwork } from "@/lib/artwork/canonical-record-artwork";
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

function fileSize(url?: string) {
  const resolved = publicPath(url);
  if (!resolved || !existsSync(resolved)) return null;
  return statSync(resolved).size;
}

function assertNoFullResolutionUsage(relativePath: string) {
  const content = read(relativePath);
  for (const pattern of ["3244x1804", "2048x2048", "hero_3840", "hero_2560", "sourceFilePath", "/Users/"]) {
    assert(!content.includes(pattern), `${relativePath} contains full-resolution or private-path Library card usage: ${pattern}`);
  }
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
const researchRows = handoffData.research as ResearchNode[];
const generatedRecordTotal = universeRecords.length + canonicalBuildingLibrary.length + researchRows.length;
const thumbnailUrls = [
  ...universeRecords.map((record) => record.thumbnailUrl),
  ...canonicalBuildingLibrary.map((record) => resolveCanonicalRecordArtwork({
    id: record.id,
    name: record.displayName,
    type: record.familyName,
    classification: record.subcategoryName,
    parent: record.era,
    tone: "building"
  }).thumbnail.url),
  ...researchRows.map((record) => resolveCanonicalRecordArtwork({
    id: record.id,
    name: record.name,
    type: record.primary_unlock_type || record.branch_id || "Research",
    classification: record.travel_tier || record.space_system_unlocked || "Research Node",
    parent: record.era,
    tone: "research"
  }).thumbnail.url)
];
const missingThumbnails = thumbnailUrls.filter((url) => !url);
const brokenThumbnails = thumbnailUrls.filter((url) => {
  const resolved = publicPath(url);
  return resolved ? !existsSync(resolved) : false;
});
const thumbnailSizes = thumbnailUrls.map(fileSize).filter((size): size is number => typeof size === "number");
const averageThumbnailBytes = Math.round(thumbnailSizes.reduce((sum, size) => sum + size, 0) / Math.max(1, thumbnailSizes.length));

function main() {
  const card = read("components/generated-library-card.tsx");
  const universeComponent = read("components/generated-universe-library.tsx");
  const assetProduction = read("lib/assets/asset-production.ts");
  const packageJson = JSON.parse(read("package.json")) as { scripts?: Record<string, string> };

  assert(card.includes("export function GeneratedLibraryCard"), "GeneratedLibraryCard must be exported as the shared Library card component.");
  assert(card.includes("export function resolveLibraryCardArtwork"), "GeneratedLibraryCard must expose resolveLibraryCardArtwork.");
  assert(card.includes("aspect-video"), "Library card image area must use a stable 16:9 thumbnail region.");
  assert(card.includes("object-cover"), "Library thumbnails must use object-fit cover.");
  assert(card.includes("width={artwork.thumbnail.width}") && card.includes("height={artwork.thumbnail.height}"), "Library thumbnails must reserve resolver-provided dimensions.");
  assert(card.includes("alt={artwork.altText}"), "Library thumbnails must expose meaningful alt text.");
  assert(card.includes("loading=\"lazy\""), "Library thumbnails must lazy load.");
  assert(card.includes("decoding=\"async\""), "Library thumbnails must async decode.");
  assert(card.includes("sizes="), "Library thumbnails must publish responsive sizes.");
  assert(card.includes("srcSet"), "Library thumbnails must support srcset.");
  assert(!card.includes("label=\"Seed\""), "GeneratedLibraryCard must not render Seed on compact cards.");
  assert(!card.includes("label=\"ID\""), "GeneratedLibraryCard must not render canonical IDs on compact cards.");
  assert(!card.includes("Registry"), "GeneratedLibraryCard must keep registry/developer fields out of compact cards.");

  assert(universeComponent.includes("GeneratedLibraryCard"), "Universe libraries must render GeneratedLibraryCard.");
  assert(!universeComponent.includes("function GeneratedRecordCard"), "Universe libraries must not keep custom card implementations.");
  assert(!read("lib/universe/library.ts").includes("libraryThumbnails"), "Universe Library must not use a hardcoded thumbnail table.");
  assert(!read("lib/universe/library.ts").includes("asset_galaxy_icon"), "Universe Library must not use the generic galaxy icon for generated records.");
  assert(read("app/buildings/page.tsx").includes("GeneratedLibraryCard"), "Building Library must use GeneratedLibraryCard.");
  assert(read("app/research/page.tsx").includes("GeneratedLibraryCard"), "Research Library must use GeneratedLibraryCard.");
  assert(!read("app/buildings/page.tsx").includes("asset_buildings_icon"), "Building Library should let the canonical artwork resolver choose thumbnails.");
  assert(!read("app/research/page.tsx").includes("asset_research_icon"), "Research Library should let the canonical artwork resolver choose thumbnails.");
  assert(assetProduction.includes("library_thumbnail") && assetProduction.includes("480, 270") && assetProduction.includes("\"WebP\""), "Asset derivative presets must include library_thumbnail 480x270 WebP.");
  assert(assetProduction.includes("library_thumbnail_retina") && assetProduction.includes("960, 540"), "Asset derivative presets must include library_thumbnail_retina 960x540.");
  assert(assetProduction.includes("quick_preview") && assetProduction.includes("Never use full-resolution source images"), "Asset derivative presets must include quick_preview guidance.");
  assert(packageJson.scripts?.["verify:library-card-system"], "verify:library-card-system script must be registered.");
  assert(packageJson.scripts?.["verify:library-card-consistency"], "verify:library-card-consistency script must be registered.");

  for (const relativePath of [
    "components/generated-library-card.tsx",
    "components/generated-universe-library.tsx",
    "app/buildings/page.tsx",
    "app/research/page.tsx",
    "lib/universe/library.ts"
  ]) {
    assertNoFullResolutionUsage(relativePath);
  }

  assert(generatedRecordTotal > 0, "Generated-record Library cards must have records to audit.");
  assert(missingThumbnails.length === 0, `Library cards are missing thumbnail paths: ${missingThumbnails.length}`);
  assert(brokenThumbnails.length === 0, `Library cards reference broken thumbnail paths: ${brokenThumbnails.join(", ")}`);
  assert(averageThumbnailBytes <= 60_000, `Average Library thumbnail size must stay near the 60KB target; received ${averageThumbnailBytes} bytes.`);

  console.log(JSON.stringify({
    status: "ok",
    sharedComponent: "GeneratedLibraryCard",
    generatedRecordTotal,
    thumbnailProfile: {
      id: "library_thumbnail",
      width: 480,
      height: 270,
      format: "WebP",
      targetBytes: 60000
    },
    performance: {
      thumbnailCount: thumbnailUrls.length,
      missingThumbnailCount: missingThumbnails.length,
      brokenThumbnailCount: brokenThumbnails.length,
      averageThumbnailBytes,
      fullResolutionReferences: 0
    },
    libraries: {
      galaxies: universe.galaxies.length,
      sectors: universe.sectors.length,
      starSystems: universe.starSystems.length,
      stars: universe.stars.length,
      planets: universe.planets.length,
      discoveries: universe.discoveries.length,
      civilizations: universe.civilizations.length,
      buildings: canonicalBuildingLibrary.length,
      research: researchRows.length
    }
  }, null, 2));
}

main();
