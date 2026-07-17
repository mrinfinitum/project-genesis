import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { searchStudio } from "@/lib/studio/global-search";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  const browser = read("components/asset-content-browser.tsx");
  const palette = read("components/studio-command-palette.tsx");
  const appShell = read("components/app-shell.tsx");
  const searchRoute = read("app/api/studio-search/route.ts");
  const searchIndex = read("lib/studio/global-search.ts");

  for (const expected of [
    "ContentBrowserTree",
    "Grid View",
    "List View",
    "ThumbnailSize",
    "favorites",
    "recently-used",
    "recently-opened",
    "QuickPreviewOverlay",
    "FloatingInspector",
    "AssetContextMenu",
    "onDragStart",
    "onDropAsset",
    "Command/Ctrl+A",
    "Regenerate Thumbnail",
    "Regenerate Preview",
    "Regenerate Derivatives"
  ]) {
    assert(browser.includes(expected), `Asset Content Browser Gold contract missing ${expected}.`);
  }

  assert(!browser.includes("LazyAssetInspector"), "Asset Browser must not reintroduce the persistent lazy inspector.");
  assert(!browser.includes("grid-cols-[16rem_minmax(0,1fr)_20rem]"), "Asset Browser must not reserve a permanent inspector column.");
  assert(browser.includes("grid-cols-[16rem_minmax(0,1fr)]"), "Asset Browser must keep the two-column folder tree and asset grid layout.");

  for (const expected of ["StudioCommandPalette", "Command+K", "Ctrl+K", "/api/studio-search", "Open Recent Assets", "Open Favorite Assets"]) {
    assert(palette.includes(expected), `Command Palette missing ${expected}.`);
  }
  assert(appShell.includes("StudioCommandPalette"), "App shell must mount the global command palette.");
  assert(searchRoute.includes("searchStudio"), "Studio search route must use the shared global search index.");
  for (const expected of ["Asset", "Planet", "Star System", "Sector", "Galaxy", "Discovery", "Civilization", "Building", "Research", "Resource"]) {
    assert(searchIndex.includes(`"${expected}"`) || searchIndex.includes(`'${expected}'`), `Global search must index ${expected} records.`);
  }

  assert(existsSync(path.join(process.cwd(), "docs/studio-maintenance-mode.md")), "Maintenance-mode documentation is missing.");
  assert(existsSync(path.join(process.cwd(), "docs/studio-gold-checklist.md")), "Studio Gold checklist is missing.");

  const assetState = await getAssetProductionState();
  const uploadedAssetItems = assetState.assetLibraryInventory.items.filter((item) => item.sourceType === "asset_registry" && Boolean(item.sourceAssetId) && Boolean(item.previewUrl?.startsWith("/")));
  const registryItemsWithoutPreview = assetState.assetLibraryInventory.items.filter((item) => item.sourceType === "asset_registry" && Boolean(item.sourceAssetId) && !item.previewUrl?.startsWith("/"));
  assert(uploadedAssetItems.length + registryItemsWithoutPreview.length === assetState.assets.length, "Asset Browser must browse only uploaded/imported asset records with real previews.");
  assert(assetState.assetLibraryInventory.items.length > uploadedAssetItems.length, "Studio search and production audits must retain derived requirements outside the Asset Browser.");

  const search = await searchStudio("labor", 12);
  assert(search.totalIndexed > 1000, `Global search index is unexpectedly small: ${search.totalIndexed}.`);
  assert(search.results.length > 0, "Global search must return bounded results.");
  assert(search.diagnostics.bounded, "Global search diagnostics must report bounded results.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
  }

  console.log(JSON.stringify({
    ok: true,
    contentBrowser: {
      layout: "Content Tree / Asset Grid",
      permanentInspector: false,
      views: ["grid", "list"],
      thumbnailSizes: ["small", "medium", "large"],
      favorites: true,
      recents: true,
      floatingInspector: true,
      contextMenu: true,
      bulkActions: true
    },
    globalSearch: {
      totalIndexed: search.totalIndexed,
      returned: search.returned,
      diagnostics: search.diagnostics
    },
    commandPalette: {
      shortcut: "Command/Ctrl+K",
      mounted: true
    },
    exports: Object.fromEntries(exports.map((engineExport, index) => [targets[index], engineExport.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
