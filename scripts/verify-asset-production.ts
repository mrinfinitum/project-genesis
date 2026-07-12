import path from "node:path";
import { unlink } from "node:fs/promises";

process.env.PROJECT_GENESIS_ASSET_PRODUCTION_STORE ??= path.join("/private/tmp", "project-genesis-asset-production-verify.json");
process.env.PROJECT_GENESIS_GAME_ART_IMPORT_STORE ??= path.join("/private/tmp", "project-genesis-game-art-import-verify.json");

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertNoPrivateLeak(label: string, value: unknown) {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("/Users/"), `${label} leaked a local /Users path.`);
  assert(!serialized.includes("C:\\"), `${label} leaked a local Windows path.`);
  assert(!serialized.includes("studio-private://"), `${label} leaked a private Studio storage reference.`);
}

async function main() {
  await Promise.all([
    unlink(process.env.PROJECT_GENESIS_ASSET_PRODUCTION_STORE!).catch(() => undefined),
    unlink(process.env.PROJECT_GENESIS_GAME_ART_IMPORT_STORE!).catch(() => undefined)
  ]);

  const assetProduction = await import("@/lib/assets/asset-production");
  const gameArtImport = await import("@/lib/assets/game-art-import");
  const runtime = await import("@/lib/runtime/game-runtime");

  await gameArtImport.applyGameArtImport({
    sourceProject: "Asset Production Verify",
    sourceType: "generic_assets",
    sourceRoot: "/Users/geofftracy/Projects/private-art",
    inputType: "json_asset_manifest",
    files: [
      {
        filename: "verify-card.png",
        category: "ui",
        width: 512,
        height: 512,
        webPath: "/assets/verify-card.png"
      }
    ]
  });

  const assetId = "asset_verify_card";
  await assetProduction.applyAssetProductionAction({
    action: "source.upload_version",
    assetId,
    notes: "Initial PSD source.",
    payload: {
      filename: "verify-card-master.psd",
      storagePath: "studio-private://assets/game-assets/source/ui/verify-card-master.psd",
      previewUrl: "/assets/verify-card-preview.png"
    }
  });
  await assetProduction.applyAssetProductionAction({
    action: "source.upload_version",
    assetId,
    notes: "Second PSD source.",
    payload: {
      filename: "verify-card-master-v2.psd",
      storagePath: "studio-private://assets/game-assets/source/ui/verify-card-master-v2.psd"
    }
  });

  let state = await assetProduction.getAssetProductionState();
  let asset = state.assets.find((item) => item.id === assetId);
  if (!asset) throw new Error("Imported verification asset was not found.");
  assert(asset.sourceFiles.length >= 2, "Source version creation failed.");
  assert(asset.sourceFiles.filter((source) => source.isCurrent).length === 1, "Exactly one source version should be current.");

  const previousSource = asset.sourceFiles.find((source) => source.filename === "verify-card-master.psd");
  if (!previousSource) throw new Error("Previous source version was not found.");
  await assetProduction.applyAssetProductionAction({ action: "source.restore", assetId, sourceFileId: previousSource.id, notes: "Restore verification." });

  await assetProduction.applyAssetProductionAction({
    action: "source.preview",
    assetId,
    sourceFileId: previousSource.id,
    payload: { previewUrl: "/assets/verify-card-preview-v2.png" }
  });

  await assetProduction.applyAssetProductionAction({
    action: "derivative.upload",
    assetId,
    payload: {
      derivativeType: "loading",
      format: "PNG",
      width: 512,
      height: 512,
      publicUrl: "/assets/verify-card-derivative.png"
    }
  });

  state = await assetProduction.getAssetProductionState();
  asset = state.assets.find((item) => item.id === assetId);
  const derivative = asset?.derivatives.find((item) => item.derivativeType === "loading");
  if (!derivative) throw new Error("Manual derivative upload failed.");

  await assetProduction.applyAssetProductionAction({ action: "derivative.approve", assetId, derivativeId: derivative.id });
  await assetProduction.applyAssetProductionAction({ action: "review.submit_review", assetId, reviewer: "verify" });
  await assetProduction.applyAssetProductionAction({ action: "review.approve", assetId, reviewer: "verify" });
  await assetProduction.applyAssetProductionAction({ action: "mapping.web_publish", assetId, derivativeId: derivative.id, adminOverride: true, payload: { path: "/assets/published/verify-card.png" } });
  await assetProduction.applyAssetProductionAction({ action: "mapping.roblox", assetId, payload: { assetId: "123456789" } });
  await assetProduction.applyAssetProductionAction({
    action: "preset.upsert",
    payload: {
      id: "verify_preset",
      name: "Verify Preset",
      category: "ui",
      derivativeType: "loading",
      width: 320,
      height: 180,
      outputFormat: "PNG",
      cropMode: "contain",
      focalPoint: "center"
    }
  });

  state = await assetProduction.getAssetProductionState();
  asset = state.assets.find((item) => item.id === assetId);
  if (!asset) throw new Error("Verification asset disappeared after actions.");
  assert(asset.sourceFiles.find((source) => source.id === previousSource.id)?.isCurrent, "Source restore did not set current version.");
  assert(asset.sourceFiles.find((source) => source.id === previousSource.id)?.previewStatus === "ready", "Manual preview upload was not persisted.");
  assert(asset.approvalStatus === "approved", "Review approval did not persist.");
  assert(JSON.stringify(asset.platformMappings).includes("rbxassetid://123456789"), "Roblox ID normalization failed.");
  assert(JSON.stringify(asset.platformMappings).includes("/assets/published/verify-card.png"), "Web publication mapping failed.");
  assert(state.derivativePresets.some((preset) => preset.name === "Verify Preset"), "Preset edit/create failed.");

  const presetIds = new Set(state.derivativePresets.map((preset) => preset.id));
  for (const profile of state.requirementProfiles) {
    assert(profile.requirements.length > 0, `${profile.id} has no requirements.`);
    for (const requirement of profile.requirements) {
      assert(presetIds.has(requirement.presetId), `${profile.id} references missing preset ${requirement.presetId}.`);
    }
  }

  for (const item of state.missingRequirements) {
    assert(item.objectId && item.requiredDerivative, `Invalid missing requirement ${item.id}.`);
    assert(item.completionPercent >= 0 && item.completionPercent <= 100, `${item.id} has invalid completion percent.`);
  }

  const canonical = await runtime.buildCanonicalRuntimeExportPayload();
  const roblox = runtime.buildRobloxRuntimePayload(canonical);
  assert(canonical.metadata.validationStatus !== "Blocked", "Canonical runtime export is blocked.");
  assert(roblox.metadata.validationStatus !== "Blocked", "Roblox runtime export is blocked.");
  assertNoPrivateLeak("canonical runtime export", canonical);
  assertNoPrivateLeak("roblox runtime export", roblox);

  console.log(JSON.stringify({
    ok: true,
    assets: state.assets.length,
    sourceFiles: asset.sourceFiles.length,
    derivatives: asset.derivatives.length,
    derivativePresets: state.derivativePresets.length,
    missingRequirements: state.missingRequirements.length,
    canonicalRuntime: canonical.metadata.validationStatus,
    robloxRuntime: roblox.metadata.validationStatus,
    webMapping: asset.platformMappings.web,
    robloxMapping: asset.platformMappings.roblox
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
