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
  const data = await import("@/lib/data");
  const upgradeArt = await import("@/lib/upgrades/art-previews");

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
      },
      {
        filename: "resource-management.png",
        name: "Resource Management",
        category: "upgrade_icon",
        artKey: "resource_management",
        iconKey: "resource_management",
        width: 512,
        height: 512,
        webPath: "/assets/verify-upgrade-resource-management.png"
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
  await assetProduction.applyAssetProductionAction({ action: "mapping.unity", assetId, payload: { key: "ProjectGenesis/UI/VerifyCard" } });
  await assetProduction.applyAssetProductionAction({ action: "mapping.unreal", assetId, payload: { path: "/Game/ProjectGenesis/UI/VerifyCard" } });
  await assetProduction.applyAssetProductionAction({ action: "mapping.godot", assetId, payload: { path: "res://project_genesis/ui/verify_card.png" } });
  let invalidMappingBlocked = false;
  try {
    await assetProduction.applyAssetProductionAction({ action: "mapping.godot", assetId, payload: { path: "/bad/godot/path.png" } });
  } catch {
    invalidMappingBlocked = true;
  }
  assert(invalidMappingBlocked, "Invalid Godot mapping was not rejected.");

  await assetProduction.applyAssetProductionAction({
    action: "source.upload_version",
    assetId,
    notes: "Third source should stale existing derivatives.",
    payload: {
      filename: "verify-card-master-v3.psd",
      storagePath: "studio-private://assets/game-assets/source/ui/verify-card-master-v3.psd",
      previewUrl: "/assets/verify-card-preview-v3.png"
    }
  });
  state = await assetProduction.getAssetProductionState();
  asset = state.assets.find((item) => item.id === assetId);
  const staleDerivative = asset?.derivatives.find((item) => item.id === derivative.id);
  assert(staleDerivative?.staleSince, "Derivative was not marked stale after a new source version.");
  assert(staleDerivative?.staleReason === "New source version uploaded", "Stale derivative reason was not recorded.");

  const latestSource = asset?.sourceFiles.find((source) => source.isCurrent);
  if (!latestSource) throw new Error("Latest source version was not current.");
  await assetProduction.applyAssetProductionAction({
    action: "source.preview",
    assetId,
    sourceFileId: latestSource.id,
    payload: { previewUrl: "/assets/verify-card-primary-preview.png", isPrimaryPreview: true }
  });
  await assetProduction.applyAssetProductionAction({
    action: "derivative.reprocess_stale",
    assetId,
    derivativeId: derivative.id,
    presetId: "loading"
  });
  await assetProduction.applyAssetProductionAction({ action: "source.restore", assetId, sourceFileId: previousSource.id, notes: "Restore verification." });

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
      focalPoint: "center",
      profileGroup: "loading_screens",
      outputRole: "loading_screen",
      sourcePolicy: "master_only",
      scale: "1x",
      safeArea: "center 90%",
      padding: "0",
      alignment: "center"
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
  }) as { assetId: string; existing: boolean };
  const duplicateRequirement = await assetProduction.applyAssetProductionAction({
    action: "requirement.create_asset",
    missingRequirementId: requirementId,
    payload: {
      assetName: "Verify Era Icon",
      artKey: "verify_era_icon_requirement",
      iconKey: "verify_era_icon_requirement"
    }
  }) as { assetId: string; existing: boolean };
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

  await gameArtImport.applyGameArtImport({
    sourceProject: "Asset Production Verify",
    sourceType: "generic_assets",
    inputType: "json_asset_manifest",
    files: [
      {
        filename: "single-source-check.png",
        name: "Single Source Check",
        category: "ui",
        artKey: "single_source_check",
        iconKey: "single_source_check"
      }
    ]
  });
  const singleSourceAssetId = "asset_single_source_check";
  await assetProduction.applyAssetProductionAction({
    action: "source.upload_version",
    assetId: singleSourceAssetId,
    payload: {
      filename: "single-source-check.psd",
      storagePath: "studio-private://assets/game-assets/source/ui/single-source-check.psd"
    }
  });
  state = await assetProduction.getAssetProductionState();
  const singleSourceAsset = state.assets.find((item) => item.id === singleSourceAssetId);
  if (!singleSourceAsset?.sourceFiles[0]) throw new Error("Single-source verification asset was not created.");
  let onlySourceArchiveBlocked = false;
  try {
    await assetProduction.applyAssetProductionAction({ action: "source.archive", assetId: singleSourceAssetId, sourceFileId: singleSourceAsset.sourceFiles[0].id });
  } catch {
    onlySourceArchiveBlocked = true;
  }
  assert(onlySourceArchiveBlocked, "Archiving the only source version should be blocked.");

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
  const upgrades = await data.getRows("upgrades") as import("@/types/schema").Upgrade[];
  const upgradeReport = upgradeArt.buildUpgradeArtReport(upgrades, state.assets);
  const resourceManagementUpgrade = upgradeReport.items.find((item) => item.displayName === "Resource Management");
  assert(resourceManagementUpgrade?.linkedAssetId === "asset_resource_management", "Upgrade art resolver did not link exact imported upgrade art.");
  assert(Boolean(resourceManagementUpgrade?.resolvedPreviewUrl), "Linked upgrade art did not produce a usable preview URL.");
  assert(resourceManagementUpgrade?.preview.source !== "missing" && resourceManagementUpgrade?.preview.source !== "placeholder", "Imported upgrade art must not remain a missing placeholder.");
  const basicConstructionUpgrade = upgradeReport.items.find((item) => item.displayName === "Basic Construction");
  assert(basicConstructionUpgrade?.linkedAssetId !== "asset_basic_administration", "Upgrade art resolver accepted an ambiguous fuzzy false-positive match.");
  assertNoPrivateLeak("upgrade art report", upgradeReport);

  asset = state.assets.find((item) => item.id === assetId);
  if (!asset) throw new Error("Verification asset disappeared after actions.");
  assert(asset.sourceFiles.find((source) => source.id === previousSource.id)?.isCurrent, "Source restore did not set current version.");
  assert(asset.sourceFiles.find((source) => source.id === previousSource.id)?.masterFormat === "PSD", "PSD source master format was not detected.");
  assert(asset.sourceFiles.find((source) => source.id === previousSource.id)?.sourceRole === "master", "PSD source role was not marked as master.");
  assert(asset.sourceFiles.find((source) => source.id === previousSource.id)?.previewStatus === "ready", "Manual preview upload was not persisted.");
  assert(asset.sourceFiles.some((source) => source.isPrimaryPreview), "Primary preview switching did not persist.");
  assert(asset.masterSourceStatus === "current", "Asset master source status should be current.");
  assert(asset.currentMasterSourceId === previousSource.id, "Current master source ID was not exposed.");
  assert(asset.approvalStatus === "approved", "Review approval did not persist.");
  assert(JSON.stringify(asset.platformMappings).includes("rbxassetid://123456789"), "Roblox ID normalization failed.");
  assert(JSON.stringify(asset.platformMappings).includes("/assets/published/verify-card.png"), "Web publication mapping failed.");
  assert(JSON.stringify(asset.platformMappings).includes("ProjectGenesis/UI/VerifyCard"), "Unity mapping failed.");
  assert(JSON.stringify(asset.platformMappings).includes("/Game/ProjectGenesis/UI/VerifyCard"), "Unreal mapping failed.");
  assert(JSON.stringify(asset.platformMappings).includes("res://project_genesis/ui/verify_card.png"), "Godot mapping failed.");
  assert(state.processingJobs.some((job) => job.assetId === assetId && job.presetId === "loading" && job.queueLabel === "Pending"), "Stale derivative reprocess job was not queued with a v3 queue label.");
  assert(asset.historyEvents.some((event) => event.eventType === "source_version_uploaded"), "Source version audit history was not recorded.");
  const verifyPreset = state.derivativePresets.find((preset) => preset.name === "Verify Preset");
  if (!verifyPreset) throw new Error("Preset edit/create failed.");
  assert(verifyPreset.profileGroup === "loading_screens" && verifyPreset.sourcePolicy === "master_only", "PSD-centric preset metadata did not persist.");
  assert(state.derivativeProfiles.length >= 5, "Derivative profile catalog was not exposed.");
  assert(state.derivativePresets.some((preset) => preset.id === "ui_icon_2048_png"), "UI icon v3 presets were not registered.");
  assert(state.derivativePresets.some((preset) => preset.id === "hero_3840x2160_webp"), "4K hero v3 preset was not registered.");
  assert(state.derivativePresets.some((preset) => preset.id === "marketing_steam_capsule"), "Marketing v3 preset was not registered.");
  assert(state.assetQualityReport.totalIssues >= state.assetQualityReport.missingMaster, "Asset quality report totals are inconsistent.");
  assert(typeof state.dashboard.masterSourcesCurrent === "number" && typeof state.dashboard.qualityIssues === "number", "Dashboard v3 quality metrics were not exposed.");

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
    upgradeArt: upgradeReport.stats,
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
