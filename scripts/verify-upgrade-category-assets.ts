import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getComponentLibraryState } from "@/lib/component-library";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload } from "@/lib/runtime/game-runtime";
import { getScreenDesignerState } from "@/lib/screen-designer";
import { categoryPresentationFor, upgradeCategoryAssetRecords, upgradeCategoryBackgroundDerivativePresetIds, upgradeCategoryBackgroundDimensions, upgradeCategoryBackgroundKeys, upgradeCategoryIds, upgradePanelSharedFallbackArtKey, uploadUpgradeCategoryBackgroundAction, validateUpgradeCategoryPresentation } from "@/lib/upgrades/category-presentation";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const [assetState, screenState, componentState, runtime] = await Promise.all([
    getAssetProductionState(),
    getScreenDesignerState(),
    getComponentLibraryState(),
    buildCanonicalRuntimeExportPayload()
  ]);
  const roblox = buildRobloxRuntimePayload(runtime);

  assert(runtime.metadata.contentVersion >= 15, `Expected contentVersion 15 or newer after publishing category presentation fields; received ${runtime.metadata.contentVersion}.`);
  assert(runtime.metadata.validationStatus === "Ready", "Canonical runtime must remain Ready.");
  assert(roblox.metadata.validationStatus === "Ready", "Roblox runtime must remain Ready.");
  assert(uploadUpgradeCategoryBackgroundAction.label === "Upload Upgrade Category Background", "Upload action metadata is missing.");

  const categoryIds = runtime.upgradeCategories.map((category) => category.id);
  assert(upgradeCategoryIds.every((id) => categoryIds.includes(id)), "Runtime must include all four canonical upgrade categories.");
  const validation = validateUpgradeCategoryPresentation({ categories: runtime.upgradeCategories, assets: assetState.assets });
  assert(validation.valid, `Upgrade category presentation validation failed: ${validation.issues.join("; ")}`);

  for (const categoryId of upgradeCategoryIds) {
    const runtimeCategory = runtime.upgradeCategories.find((category) => category.id === categoryId);
    assert(runtimeCategory, `Missing runtime category ${categoryId}.`);
    const expected = categoryPresentationFor(categoryId);
    assert(runtimeCategory.presentation.backgroundArtKey === expected.backgroundArtKey, `${categoryId} background key mismatch.`);
    assert(runtimeCategory.presentation.fallbackBackgroundArtKey === upgradePanelSharedFallbackArtKey, `${categoryId} fallback key mismatch.`);
    assert(runtimeCategory.presentation.selectedTabArtKey === null, `${categoryId} selectedTabArtKey should remain reserved/null.`);
    assert(runtimeCategory.presentation.iconArtKey === null, `${categoryId} iconArtKey should remain reserved/null.`);
    const robloxTab = roblox.upgradeTabs.find((tab) => tab.tabId === categoryId);
    assert(robloxTab?.presentation.backgroundArtKey === expected.backgroundArtKey, `Roblox tab ${categoryId} presentation did not derive from canonical runtime.`);
  }

  const keys = Object.values(upgradeCategoryBackgroundKeys);
  assert(new Set(keys).size === 4, "Upgrade category semantic background keys must be unique.");
  for (const key of keys) {
    assert(/^upgrade_panel_.*_background$/.test(key), `Invalid semantic background key: ${key}.`);
  }

  assert(assetState.upgradeCategoryAssets.length === 4, "Asset Production must expose four upgrade category asset records.");
  assert(assetState.derivativeProfiles.some((profile) => profile.id === "upgrade_category_backgrounds"), "Upgrade category derivative profile is missing.");
  const presetIds = new Set(assetState.derivativePresets.map((preset) => preset.id));
  for (const presetId of upgradeCategoryBackgroundDerivativePresetIds) {
    assert(presetIds.has(presetId), `Missing derivative preset ${presetId}.`);
  }
  for (const record of upgradeCategoryAssetRecords) {
    const stateRecord = assetState.upgradeCategoryAssets.find((item) => item.categoryId === record.categoryId);
    assert(stateRecord, `Missing Asset Production category record ${record.categoryId}.`);
    assert(stateRecord.semanticAssetKey === record.semanticAssetKey, `${record.categoryId} semantic asset key mismatch.`);
    assert(stateRecord.expectedDimensions.masterWidth === upgradeCategoryBackgroundDimensions.masterWidth, `${record.categoryId} expected width mismatch.`);
    assert(stateRecord.expectedDimensions.masterHeight === upgradeCategoryBackgroundDimensions.masterHeight, `${record.categoryId} expected height mismatch.`);
    assert(stateRecord.derivativeRequirements.length === upgradeCategoryBackgroundDerivativePresetIds.length, `${record.categoryId} derivative requirements incomplete.`);
  }

  const upgrades = screenState.records.find((record) => record.screenId === "upgrades");
  assert(upgrades, "Upgrades Screen Designer record is missing.");
  assert(upgrades.dataRequirements.some((item) => item.id === "upgrade-category-presentation" && item.source.includes("presentation.backgroundArtKey")), "Upgrades screen is missing category presentation data binding.");
  for (const key of [...keys, upgradePanelSharedFallbackArtKey]) {
    assert(upgrades.assetRequirements.some((item) => item.artKey === key), `Upgrades screen is missing asset requirement ${key}.`);
  }
  const backgroundSpec = upgrades.componentSpecs.find((component) => component.componentLibraryId === "UpgradeWorkspaceBackground");
  assert(backgroundSpec, "Upgrades screen is missing UpgradeWorkspaceBackground spec.");
  assert(backgroundSpec.dataInputs.includes("selectedUpgradeCategory.presentation.backgroundArtKey"), "UpgradeWorkspaceBackground screen spec must bind to selectedUpgradeCategory.presentation.backgroundArtKey.");
  assert(backgroundSpec.states.includes("workforce") && backgroundSpec.states.includes("technology") && backgroundSpec.states.includes("fallback"), "Upgrade workspace background category states are incomplete.");

  for (const componentId of ["UpgradeCategoryTabs", "UpgradeWorkspaceBackground", "UpgradeCategoryView", "UpgradeList"]) {
    const component = componentState.records.find((record) => record.componentId === componentId);
    assert(component, `Component Library missing ${componentId}.`);
    for (const state of ["workforce", "industry", "science", "technology", "fallback", "missing art", "loading", "selected"]) {
      assert(component.states.some((item) => item.label === state), `${componentId} missing state ${state}.`);
    }
  }

  const publicRuntimeText = JSON.stringify({ runtime, roblox });
  for (const forbidden of ["/Users/", "studio-private://", ".psd", ".psb", "source_file_url", "upload history"]) {
    assert(!publicRuntimeText.includes(forbidden), `Private asset/source data leaked into runtime: ${forbidden}.`);
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    canonicalChecksum: runtime.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    requiredMasterSize: `${upgradeCategoryBackgroundDimensions.masterWidth}x${upgradeCategoryBackgroundDimensions.masterHeight}`,
    semanticAssetKeys: keys,
    assetRecords: assetState.upgradeCategoryAssets.map((record) => ({
      categoryId: record.categoryId,
      semanticAssetKey: record.semanticAssetKey,
      status: record.status,
      webReady: record.webReady,
      robloxReady: record.robloxReady,
      iosReady: record.iosReady,
      androidReady: record.androidReady,
      missingDerivatives: record.missingDerivativeWarnings.length
    }))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
