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
  const eraArt = await import("@/lib/assets/era-art-inventory");

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

  const requirementId = "verify:Era Identity:era:verify:icon";
  const createdRequirement = await assetProduction.applyAssetProductionAction({
    action: "requirement.create_asset",
    missingRequirementId: requirementId,
    payload: {
      eraId: "verify",
      linkedObjectId: "verify",
      linkedObjectType: "era",
      category: "Era Identity",
      requirementType: "icon",
      assetName: "Verify Era Icon",
      artKey: "verify_era_icon_requirement",
      iconKey: "verify_era_icon_requirement",
      width: 256,
      height: 256,
      priority: "critical",
      assignedArtist: "Verification Artist",
      dueDate: "2026-08-01",
      productionNotes: "Created from verification requirement."
    }
  });
  const duplicateRequirement = await assetProduction.applyAssetProductionAction({
    action: "requirement.create_asset",
    missingRequirementId: requirementId,
    payload: {
      assetName: "Verify Era Icon",
      artKey: "verify_era_icon_requirement",
      iconKey: "verify_era_icon_requirement"
    }
  });
  assert(createdRequirement.assetId === duplicateRequirement.assetId, "Requirement asset duplicate prevention returned a different asset ID.");
  assert(duplicateRequirement.existing === true, "Requirement asset duplicate prevention did not report an existing asset.");

  const requirementAssetId = String(createdRequirement.assetId);
  await assetProduction.applyAssetProductionAction({
    action: "source.upload_version",
    assetId: requirementAssetId,
    notes: "Requirement source upload.",
    payload: {
      filename: "verify-era-icon-source.psd",
      storagePath: "studio-private://assets/game-assets/source/verify-era-icon-source.psd",
      previewUrl: "/assets/verify-era-icon-preview.png"
    }
  });
  await assetProduction.applyAssetProductionAction({
    action: "derivative.upload",
    assetId: requirementAssetId,
    payload: {
      derivativeType: "icon",
      format: "PNG",
      width: 256,
      height: 256,
      publicUrl: "/assets/verify-era-icon.png"
    }
  });
  state = await assetProduction.getAssetProductionState();
  const requirementAsset = state.assets.find((item) => item.id === requirementAssetId);
  const requirementDerivative = requirementAsset?.derivatives.find((item) => item.derivativeType === "icon");
  if (!requirementAsset || !requirementDerivative) throw new Error("Requirement asset source or derivative did not persist.");

  let publishBlocked = false;
  try {
    await assetProduction.applyAssetProductionAction({
      action: "mapping.web_publish",
      assetId: requirementAssetId,
      derivativeId: requirementDerivative.id,
      payload: { path: "/assets/published/verify-era-icon.png" }
    });
  } catch {
    publishBlocked = true;
  }
  assert(publishBlocked, "Web publish should be blocked until required derivatives are approved.");

  await assetProduction.applyAssetProductionAction({ action: "derivative.approve", assetId: requirementAssetId, derivativeId: requirementDerivative.id });
  await assetProduction.applyAssetProductionAction({ action: "review.submit_review", assetId: requirementAssetId, reviewer: "verify", notes: "Submit requirement asset." });
  await assetProduction.applyAssetProductionAction({ action: "review.approve", assetId: requirementAssetId, reviewer: "verify", notes: "Approve requirement asset." });
  await assetProduction.applyAssetProductionAction({
    action: "mapping.web_publish",
    assetId: requirementAssetId,
    derivativeId: requirementDerivative.id,
    adminOverride: true,
    payload: { path: "/assets/published/verify-era-icon.png" }
  });

  await assetProduction.applyAssetProductionAction({
    action: "missing.update",
    missingRequirementId: requirementId,
    payload: {
      assignedArtist: "Verification Artist",
      priority: "critical",
      dueDate: "2026-08-01",
      productionNotes: "Inline assignment persisted.",
      status: "approved",
      approvalStatus: "approved",
      publishStatus: "published",
      assetId: requirementAssetId
    }
  });

  const taskPayload = {
    id: requirementId,
    era: "Verify",
    linkedObject: "era:verify",
    requirementType: "icon",
    dimensions: "256 x 256",
    format: "PNG",
    priority: "critical",
    assignedArtist: "Verification Artist",
    dueDate: "2026-08-01",
    assetLink: `/assets/${requirementAssetId}`,
    sourceUploadLink: `/assets/${requirementAssetId}?tab=source_files`,
    notes: "Task dedupe verification."
  };
  const taskResult = await assetProduction.applyAssetProductionAction({
    action: "task.generate_missing",
    payload: { missingRequirementIds: [requirementId], requirements: [taskPayload] }
  }) as { createdTasks: unknown[] };
  const duplicateTaskResult = await assetProduction.applyAssetProductionAction({
    action: "task.generate_missing",
    payload: { missingRequirementIds: [requirementId], requirements: [taskPayload] }
  }) as { createdTasks: unknown[] };
  assert(taskResult.createdTasks.length === 1, "Missing asset task generation did not create the first task.");
  assert(duplicateTaskResult.createdTasks.length === 0, "Missing asset task dedupe failed.");

  await assetProduction.applyAssetProductionAction({
    action: "bulk.missing_update",
    payload: {
      missingRequirementIds: [requirementId],
      assignedArtist: "Bulk Artist",
      priority: "high",
      dueDate: "2026-08-15",
      productionNotes: "Bulk update persisted.",
      publishStatus: "ready"
    }
  });

  const metadata = await assetProduction.getAssetProductionRequirementMetadata();
  assert(metadata.missingRequirements[requirementId]?.assignedArtist === "Bulk Artist", "Requirement metadata assignment did not persist.");
  assert(metadata.productionTasks.filter((task) => task.requirementId === requirementId).length === 1, "Production task metadata dedupe did not persist.");

  const survivalInventory = await eraArt.getEraArtInventory("survival");
  if (!survivalInventory) throw new Error("Era art inventory did not load.");
  assert(survivalInventory.cards.length > 0, "Era art inventory returned no requirement cards.");
  assertNoPrivateLeak("era art inventory manifest", {
    era: survivalInventory.era,
    summary: survivalInventory.summary,
    assets: survivalInventory.cards.map((card) => ({
      id: card.canonicalAssetId,
      sourceVersions: {
        currentFilename: card.currentSourceFilename,
        count: card.sourceVersionCount,
        previewStatus: card.previewStatus
      },
      derivatives: {
        latestDerivativeId: card.latestDerivativeId,
        count: card.derivativeCount,
        status: card.derivativeStatus
      },
      engineMappings: card.engineReadiness
    }))
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
    productionTasks: metadata.productionTasks.length,
    eraArtCards: survivalInventory.cards.length,
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
