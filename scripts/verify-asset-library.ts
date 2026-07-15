import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { EngineTarget } from "@/lib/export/game-engine";

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

async function main() {
  const appShell = read("components/app-shell.tsx");
  const assetLibraryPage = read("app/asset-library/page.tsx");
  const deprecatedGameArtRoute = read("app/game-art-import/page.tsx");
  const assetWorkspace = read("components/asset-production-workspace.tsx");
  const componentLibrary = read("components/component-library-workspace.tsx");
  const screenDesigner = read("components/screen-designer-workspace.tsx");
  const upgradeArt = read("components/upgrade-art-workspace.tsx");
  const eraArtInventory = read("components/era-art-inventory-workspace.tsx");
  const visualPreviews = read("lib/assets/visual-previews.ts");
  const assetProduction = read("lib/assets/asset-production.ts");
  const assetLibraryRouting = read("lib/assets/asset-library-routing.ts");
  const architecture = read("lib/architecture/index.ts");

  assert(existsSync(path.join(process.cwd(), "app/asset-library/page.tsx")), "Asset Library route must exist.");
  assertIncludes("App shell", appShell, 'href: "/asset-library"');
  assertIncludes("App shell", appShell, 'label: "Asset Library"');
  assertNotIncludes("App shell", appShell, 'label: "Game Art Import"');
  assertNotIncludes("App shell", appShell, 'href: "/game-art-import"');

  assertIncludes("Asset Library page", assetLibraryPage, "AssetProductionWorkspace");
  assertIncludes("Asset Library page", assetLibraryPage, 'preferredRoute="/asset-library"');
  assertIncludes("Deprecated Game Art Import route", deprecatedGameArtRoute, "redirect");
  assertIncludes("Deprecated Game Art Import route", deprecatedGameArtRoute, "/asset-library?deprecated=game-art-import");

  for (const file of [
    "app/assets/page.tsx",
    "app/assets/source/page.tsx",
    "app/assets/generated/page.tsx",
    "app/assets/published/page.tsx",
    "app/assets/missing/page.tsx",
    "app/assets/processing/page.tsx",
    "app/assets/import-history/page.tsx"
  ]) {
    assertIncludes(file, read(file), 'preferredRoute="/assets"');
  }

  for (const expected of [
    "Asset Library",
    "Content browser",
    "Upload Asset",
    "Asset Library Picker",
    "Legacy Import",
    "UploadAssetWorkflow",
    "all-assets",
    "needs-review",
    "approved-assets",
    "upgrade-categories",
    "Upgrades",
    "unmapped",
    "AssetLibraryCategoryInventory",
    "resolveAssetLibraryCategoryView",
    "categoryRoute.viewType",
    "upgradeCategoryGridClass",
    "Upload / Replace Background",
    "compactSizeLabel",
    "Source Pending",
    "generated category preview",
    "All statuses shown",
    "Generate Missing Requirements",
    "Open in Visual Builder",
    "Open in Screen Specification",
    "Generate Derivatives"
  ]) {
    assertIncludes("Asset Library workspace", assetWorkspace, expected);
  }
  assertNotIncludes("Asset Library workspace", assetWorkspace, "Recent Imports");
  assertNotIncludes("Asset Library workspace", assetWorkspace, "Import / Reconcile Art");
  assertIncludes("Asset Library routing", assetLibraryRouting, "Upgrades resolves to the merged upgrade inventory");
  assertIncludes("Asset Library routing", assetLibraryRouting, "category background assets stay in the Backgrounds bucket");
  assertNotIncludes("Asset Library workspace", assetWorkspace, 'activeNode !== "upgrade-categories" ? <AssetLibraryCategoryInventory');
  assertNotIncludes("Asset Library workspace", assetWorkspace, 'title="Inspector"');
  assertNotIncludes("Asset Library workspace", assetWorkspace, "Open Inspector");
  assertIncludes("Asset Library workspace", assetWorkspace, "Open Record");
  assertNotIncludes("Asset Library workspace", assetWorkspace, "Missing Preview");
  assertNotIncludes("Asset Library workspace", assetWorkspace, "Background Needed");

  assertIncludes("Component Library", componentLibrary, "/asset-library?picker=component");
  assertIncludes("Screen Designer", screenDesigner, "/asset-library?picker=screen");
  assertIncludes("Upgrade Art workspace", upgradeArt, "/asset-library?upload=asset");
  assertIncludes("Era Art Inventory", eraArtInventory, "/asset-library?upload=asset");
  assertIncludes("Visual Previews", visualPreviews, "/asset-library?upload=asset");
  assertIncludes("Asset Production links", assetProduction, "/asset-library?upload=asset");
  assertIncludes("Architecture decision log", architecture, "ARCH-DECISION-ASSET-LIBRARY-WORKFLOW");

  const legacyWorkspace = read("components/game-art-import-workspace.tsx");
  assertIncludes("Legacy import workspace", legacyWorkspace, "Legacy Import");
  assertIncludes("Legacy import workspace", legacyWorkspace, "Advanced Asset Migration");
  assertNotIncludes("Legacy import workspace", legacyWorkspace, 'title="Game Art Import"');
  assertNotIncludes("Legacy import workspace", legacyWorkspace, "No game art imports yet.");

  const { getAssetProductionState } = await import("@/lib/assets/asset-production");
  const { buildCanonicalRuntimeExportPayload } = await import("@/lib/runtime/game-runtime");
  const { buildGameEngineExport } = await import("@/lib/export/game-engine");

  const state = await getAssetProductionState();
  assert(state.assets.length > 0, "Asset Library must resolve existing canonical asset records.");
  assert(state.missingRequirements.length >= 0, "Asset Library missing-assets collection must resolve.");
  assert(state.dashboard.totalAssets === state.assets.length, "Asset Library dashboard must count canonical assets.");
  assert(state.assetLibraryInventory.defaultFilter === "all", "Asset Library must default to all statuses.");
  assert(state.assetLibraryInventory.items.length > state.assets.length, "Asset Library inventory must include derived requirements, not only published assets.");
  assert(state.assetLibraryInventory.duplicateSemanticKeys.length === 0, `Duplicate semantic keys found: ${state.assetLibraryInventory.duplicateSemanticKeys.map((item) => item.semanticAssetKey).join(", ")}`);

  const topHud = state.assetLibraryInventory.categorySummaries["top-hud"];
  const upgrades = state.assetLibraryInventory.categorySummaries["upgrade-categories"];
  const backgrounds = state.assetLibraryInventory.categorySummaries.backgrounds;
  const research = state.assetLibraryInventory.categorySummaries["research-ui"];
  const buildings = state.assetLibraryInventory.categorySummaries["buildings-ui"];
  const unmapped = state.assetLibraryInventory.categorySummaries.unmapped;
  assert(topHud.total >= 11, `Top HUD category must have real inventory cards; received ${topHud.total}.`);
  const resolvedTopHudKeys: Record<string, string> = {
    economy_labor: "asset_civilization_energy_icon",
    economy_credits: "asset_credits_icon",
    economy_population: "asset_population_icon",
    economy_research: "asset_research_icon",
    economy_premium_crystals: "asset_civilization_points_icon",
    top_hud_background: "asset_top_bar_resource_panel_strip",
    top_hud_add_crystals_button: "asset_top_bar_plus_button",
    top_hud_calendar_button: "asset_calendar_icon",
    top_hud_trophy_button: "asset_trophy_icon",
    top_hud_settings_button: "asset_settings_icon"
  };
  for (const [semanticAssetKey, sourceAssetId] of Object.entries(resolvedTopHudKeys)) {
    const item = state.assetLibraryInventory.items.find((row) => row.semanticAssetKey === semanticAssetKey);
    assert(item, `Top HUD inventory is missing ${semanticAssetKey}.`);
    assert(item.sourceAssetId === sourceAssetId, `${semanticAssetKey} must resolve to imported Roblox asset ${sourceAssetId}; received ${item.sourceAssetId ?? "(none)"}.`);
    assert(item.status === "published", `${semanticAssetKey} must be published after Roblox/Web alias reconciliation; received ${item.status}.`);
    assert(Boolean(item.previewUrl?.startsWith("/assets/roblox-art/")), `${semanticAssetKey} must use the public Web derivative as preview; received ${item.previewUrl ?? "(none)"}.`);
  }
  const identityFrame = state.assetLibraryInventory.items.find((row) => row.semanticAssetKey === "civilization_identity_frame");
  assert(identityFrame?.status === "missing", "Civilization identity frame must remain missing until the rbxassetid://0 placeholder is replaced.");
  assert(upgrades.total >= 100, `Upgrades category must show the real upgrade inventory, not the four category cards; received ${upgrades.total}.`);
  assert(state.assetLibraryInventory.items.some((item) => item.categoryId === "upgrade-categories" && item.sourceType === "missing_requirement"), "Upgrades category must include generated upgrade requirements.");
  assert(!state.assetLibraryInventory.items.some((item) => item.categoryId === "upgrade-categories" && /upgrade_panel_.*_background/.test(item.semanticAssetKey)), "Upgrade category background assets must not occupy the Upgrades inventory.");
  assert(state.assetLibraryInventory.items.filter((item) => item.categoryId === "backgrounds" && /upgrade_panel_.*_background/.test(item.semanticAssetKey)).length >= 5, "Upgrade category and shared fallback background records must live under Backgrounds.");
  assert(research.total >= 18, `Research category must have requirement cards; received ${research.total}.`);
  assert(buildings.total >= 10, `Buildings category must have meaningful inventory cards; received ${buildings.total}.`);
  assert(state.assetLibraryInventory.items.some((item) => item.status === "published"), "Published assets must appear in the Asset Library inventory.");
  assert(state.assetLibraryInventory.items.some((item) => item.status === "missing"), "Missing requirements must appear in the Asset Library inventory.");
  assert(unmapped.total === state.assetLibraryInventory.unmappedAssets.length, "Unmapped queue must be visible and internally consistent.");
  assert(state.assetLibraryInventory.items.some((item) => item.sourceType === "visual_builder_placeholder" && item.referencedByPlaceholders.length > 0), "Visual Builder placeholder links must resolve into Asset Library.");
  assert(state.assetLibraryInventory.items.some((item) => item.referencedByComponents.length > 0), "Component Library usage links must resolve into Asset Library.");
  assert(state.assetLibraryInventory.items.some((item) => item.requirementId && item.actions.includes("Upload Asset")), "Requirement cards must expose upload actions.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);
  assert(runtime.metadata.contentVersion >= 15, `Asset Library routing requires runtime contentVersion 15 or newer; received ${runtime.metadata.contentVersion}.`);

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
  }

  console.log(JSON.stringify({
    ok: true,
    route: "/asset-library",
    deprecatedRoute: "/game-art-import",
    assets: state.assets.length,
    missingAssets: state.missingRequirements.length,
    inventoryItems: state.assetLibraryInventory.items.length,
    categoryCounts: {
      topHud: topHud.total,
      upgrades: upgrades.total,
      backgrounds: backgrounds.total,
      research: research.total,
      buildings: buildings.total,
      published: state.assetLibraryInventory.items.filter((item) => item.status === "published").length,
      missing: state.assetLibraryInventory.items.filter((item) => item.status === "missing").length,
      unmapped: unmapped.total
    },
    uploadWorkflow: true,
    pickerLinks: ["component-library", "screen-designer"],
    upgradesPath: "/asset-library?section=upgrade-categories",
    upgradeCategoryBackgroundsPath: "/asset-library?section=backgrounds",
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      validationStatus: runtime.metadata.validationStatus,
      checksum: runtime.metadata.checksum
    },
    engineExports: Object.fromEntries(exports.map((engineExport, index) => [targets[index], engineExport.validation.status])),
    missingRequirements: state.missingRequirements.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
