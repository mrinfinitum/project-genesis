import { getAssetProductionState } from "@/lib/assets/asset-production";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNoPrivateLeak(label: string, value: unknown) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("/Users/"), `${label} leaked a local /Users path.`);
  assert(!serialized.includes("C:\\"), `${label} leaked a local Windows path.`);
  assert(!serialized.includes("studio-private://"), `${label} leaked a private Studio storage reference.`);
}

async function main() {
  const state = await getAssetProductionState();
  const presetIds = new Set(state.derivativePresets.map((preset) => preset.id));
  const assetIds = new Set<string>();
  const sourceIds = new Set<string>();

  assert(state.derivativePresets.length >= 8, "Derivative presets are missing.");
  assert(state.requirementProfiles.length >= 6, "Requirement profiles are missing.");

  for (const profile of state.requirementProfiles) {
    assert(profile.requirements.length > 0, `${profile.id} has no requirements.`);
    for (const requirement of profile.requirements) {
      assert(presetIds.has(requirement.presetId), `${profile.id} references missing preset ${requirement.presetId}.`);
    }
  }

  for (const asset of state.assets) {
    assert(asset.id, "Asset is missing id.");
    assert(!assetIds.has(asset.id), `Duplicate asset id ${asset.id}.`);
    assetIds.add(asset.id);
    assert(asset.completionPercent >= 0 && asset.completionPercent <= 100, `${asset.id} has invalid completion percent.`);

    const currentSources = asset.sourceFiles.filter((source) => source.isCurrent);
    assert(asset.sourceFiles.length === 0 || currentSources.length === 1, `${asset.id} must have exactly one current source version when source files exist.`);

    for (const source of asset.sourceFiles) {
      assert(source.assetId === asset.id, `${source.id} is linked to the wrong asset.`);
      assert(!sourceIds.has(source.id), `Duplicate source file id ${source.id}.`);
      sourceIds.add(source.id);
      assert(source.version >= 1, `${source.id} has invalid version.`);
      assertNoPrivateLeak(`source storage display for ${source.id}`, { storagePath: source.storagePath.replace("studio-private://", "studio-private-redacted://") });
    }
  }

  for (const item of state.missingRequirements) {
    assert(item.objectId && item.requiredDerivative, `Invalid missing requirement ${item.id}.`);
    assert(item.completionPercent >= 0 && item.completionPercent <= 100, `${item.id} has invalid completion percent.`);
  }

  for (const job of state.processingJobs) {
    assert(assetIds.has(job.assetId), `${job.id} references missing asset ${job.assetId}.`);
    assert(job.progress >= 0 && job.progress <= 100, `${job.id} has invalid progress.`);
  }

  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(canonical);
  assert(canonical.metadata.validationStatus !== "Blocked", "Canonical runtime export is blocked.");
  assert(roblox.metadata.validationStatus !== "Blocked", "Roblox runtime export is blocked.");
  assertNoPrivateLeak("canonical runtime export", canonical);
  assertNoPrivateLeak("roblox runtime export", roblox);

  console.log(JSON.stringify({
    ok: true,
    assets: state.assets.length,
    sourceFiles: state.sourceFiles.length,
    derivativePresets: state.derivativePresets.length,
    requirementProfiles: state.requirementProfiles.length,
    missingRequirements: state.missingRequirements.length,
    processingJobs: state.processingJobs.length,
    canonicalRuntime: canonical.metadata.validationStatus,
    robloxRuntime: roblox.metadata.validationStatus
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
