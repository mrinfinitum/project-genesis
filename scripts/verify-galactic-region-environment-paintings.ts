import assert from "node:assert/strict";
import derivativeData from "../data/galactic-region-environment-painting-derivatives.json";
import { galacticRegionEnvironmentPaintings } from "../lib/galactic-region-environment-paintings";
import { MILKY_WAY_GALACTIC_REGIONS } from "../lib/universe/generator";
import { getUniverseLibraryData } from "../lib/universe/library";

const regionIds = new Set<string>(MILKY_WAY_GALACTIC_REGIONS.map((region) => region.id));
const assignments = galacticRegionEnvironmentPaintings.map((painting) => painting.galacticRegionId);
assert.equal(new Set(assignments).size, assignments.length, "A Galactic Region environment painting cannot be reused.");
assert(assignments.every((regionId) => regionIds.has(regionId)), "Every painting assignment must resolve a canonical Galactic Region.");
assert(assignments.includes("sector-local-bubble"), "Orion Spur must resolve its named environment painting.");
assert.equal(assignments.length, MILKY_WAY_GALACTIC_REGIONS.length, "Every Milky Way Galactic Region must resolve one environment painting.");

const gameChecksums = galacticRegionEnvironmentPaintings.map((painting) => painting.checksum);
assert.equal(new Set(gameChecksums).size, gameChecksums.length, "Pixel-identical paintings cannot be assigned to different Galactic Regions.");

const library = getUniverseLibraryData();
assert.equal(library.sectors.length, MILKY_WAY_GALACTIC_REGIONS.length, "The Galactic Region Library must expose all nine canonical regions.");
assert(library.sectors.every((record) => Boolean(record.thumbnailUrl)), "Every Galactic Region card must expose its assigned thumbnail.");

console.log(JSON.stringify({
  status: "Ready",
  sourceRecords: derivativeData.records.length,
  assignedPaintings: assignments.length,
  galacticRegions: library.sectors.map((record) => record.name),
  duplicates: derivativeData.records.filter((record) => record.status === "duplicate").map((record) => record.id)
}, null, 2));
