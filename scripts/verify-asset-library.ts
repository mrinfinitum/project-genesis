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
    "Open in Visual Builder",
    "Open in Screen Specification",
    "Generate Derivatives"
  ]) {
    assertIncludes("Asset Library workspace", assetWorkspace, expected);
  }
  assertNotIncludes("Asset Library workspace", assetWorkspace, "Recent Imports");
  assertNotIncludes("Asset Library workspace", assetWorkspace, "Import / Reconcile Art");

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
    uploadWorkflow: true,
    pickerLinks: ["component-library", "screen-designer"],
    upgradeCategoryPath: "/asset-library?section=upgrade-categories",
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
