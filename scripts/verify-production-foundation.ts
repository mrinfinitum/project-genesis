import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { backgroundContextTypes, backgroundLibraryRecords, compileBackgroundPrompt, validateBackgroundRecords } from "../lib/production/backgrounds";
import { canonicalAssetCategories, canonicalAssetStatuses } from "../lib/production/asset-model";

assert.equal(new Set(canonicalAssetStatuses).size, canonicalAssetStatuses.length, "Asset statuses must be unique.");
assert.equal(new Set(canonicalAssetCategories).size, canonicalAssetCategories.length, "Asset categories must be unique.");
assert.equal(new Set(backgroundContextTypes).size, backgroundContextTypes.length, "Background contexts must be unique.");
assert.equal(validateBackgroundRecords().length, 0, validateBackgroundRecords().join("\n"));

const published = backgroundLibraryRecords.filter((record) => record.productionStatus === "published");
assert.equal(published.length, 21, "Expected 12 assigned star-system and 9 Galactic Region backgrounds.");
assert.equal(published.filter((record) => record.contextType === "star_system").length, 12);
assert.equal(published.filter((record) => record.contextType === "galactic_region").length, 9);
assert.ok(published.every((record) => record.approvedAssetReference?.startsWith("/generated/game-assets/")));
assert.ok(published.every((record) => record.canonicalOwnerId));
assert.ok(backgroundLibraryRecords.every((record) => record.metadata.interactiveObjectsBakedIn !== true));
assert.ok(!JSON.stringify(published).includes("/Users/"), "Published backgrounds must not expose local paths.");

const sourceRoot = path.join(process.cwd(), "source-masters", "backgrounds");
const sourceCounts = [
  ["galaxies", /^galaxy-background-[a-z0-9-]+\.psd$/i, 8],
  ["galactic-regions", /^galactic-region-background-[a-z0-9-]+\.psd$/i, 10],
  ["star-systems", /^star-system-background-[a-z0-9-]+\.psd$/i, 18]
] as const;
for (const [folder, pattern, expected] of sourceCounts) {
  const files = readdirSync(path.join(sourceRoot, folder)).filter((filename) => pattern.test(filename));
  assert.equal(files.length, expected, `${folder} should contain ${expected} canonical PSD masters.`);
}
assert.equal(existsSync(path.join(process.cwd(), "source-masters", "environments")), false, "The retired layered environments tree must not be recreated.");

const prompt = compileBackgroundPrompt({ contextType: "star_system", canonicalOwnerId: "system-sol", ownerName: "Sol" });
for (const requirement of ["Nano Banana 2", "Unity", "No vignette", "No visible blur band", "3840 x 2400", "16:10"]) {
  assert.match(prompt, new RegExp(requirement.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
}

console.log(`Production foundation Ready: ${backgroundLibraryRecords.length} backgrounds, ${published.length} published.`);
