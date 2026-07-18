import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { assetLibraryCategoryIds } from "@/lib/assets/asset-library-routing";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  const appShell = read("components/app-shell.tsx");
  const assetWorkspace = read("components/asset-production-workspace.tsx");
  const assetContentBrowser = read("components/asset-content-browser.tsx");
  const assetLibraryPage = read("app/asset-library/page.tsx");
  const assetsPage = read("app/assets/page.tsx");
  const creativeRoute = read("app/creative-production/page.tsx");
  const visualBuilderRoute = read("app/visual-screen-builder/page.tsx");

  assert(existsSync(path.join(process.cwd(), "app/creative-production/[...path]/page.tsx")), "Creative Production catch-all redirect must exist.");
  assert(!appShell.includes('label: "Creative Production"'), "Creative Production must not appear as a primary navigation group.");
  assert(!appShell.includes('href: "/creative-production?area='), "Primary navigation must not link to Creative Production area URLs.");
  assert(appShell.includes('id: "home"'), "Home navigation group must exist.");
  assert(appShell.includes('href: "/asset-library", label: "Asset Library"'), "Asset Library Home navigation item is missing.");
  assert(!appShell.includes('id: "asset-library"'), "Asset Library must not be a separate primary navigation group.");

  assert(assetLibraryPage.includes("AssetContentBrowser"), "Asset Library page must render the Content Browser.");
  assert(assetLibraryPage.includes("initialNode={folder ?? category ?? section ?? null}"), "Asset Library page must support folder/category/section deep links.");
  assert(assetContentBrowser.includes("categoryInitialNodeMap"), "Content Browser must map legacy category links into tree folders.");
  assert(assetsPage.includes("category ?? section"), "Legacy /assets route must support category routes.");
  assert(assetContentBrowser.includes("Uploaded Art Browser"), "Asset Library must identify as an uploaded art browser.");
  assert(assetContentBrowser.includes("ContentBrowserTree"), "Asset Library must include a left content tree.");
  assert(assetContentBrowser.includes("AssetBrowserCard"), "Asset Library must include compact browser cards.");
  assert(assetContentBrowser.includes("BulkActionBar"), "Asset Library must expose bulk actions without relying on an inspector.");
  assert(assetContentBrowser.includes("MoveAssetsDialog"), "Asset Library must provide a real folder move dialog.");
  assert(assetContentBrowser.includes("folderOverrides"), "Asset Library must persist browser folder moves.");
  assert(assetContentBrowser.includes("moveAssetsToFolder"), "Asset Library drag/drop and bulk moves must update the browser folder assignment.");
  assert(assetContentBrowser.includes("QuickPreviewOverlay"), "Asset Library must support lightweight quick preview.");
  assert(!assetContentBrowser.includes("AssetInspector"), "Asset Library browser must not include a persistent right inspector.");
  assert(!assetContentBrowser.includes("LazyAssetInspector"), "Asset Library browser must not lazy load a persistent inspector.");
  assert(!assetContentBrowser.includes("grid-cols-[16rem_minmax(0,1fr)_20rem]"), "Asset Library must not reserve a third inspector column.");
  assert(assetContentBrowser.includes("grid-cols-[16rem_minmax(0,1fr)]"), "Asset Library must use a two-column folder tree and asset grid layout.");
  assert(assetContentBrowser.includes("project-genesis-content-browser-expanded"), "Content Browser tree expansion state must persist.");
  assert(assetContentBrowser.includes("thumbnailSizes"), "Asset Library must expose persisted thumbnail size control.");
  assert(assetContentBrowser.includes("repeat(auto-fill, minmax(${thumbnailSizes[thumbnailSize].min}px, ${thumbnailSizes[thumbnailSize].max}px))"), "Asset cards must use the selected thumbnail size range.");
  assert(assetContentBrowser.includes("onDoubleClick"), "Double-click must open the asset detail.");
  assert(assetContentBrowser.includes("handleGridKeyDown"), "Asset grid must support keyboard navigation.");
  assert(assetContentBrowser.includes('role="grid"'), "Asset grid must expose grid semantics for keyboard users.");
  assert(assetContentBrowser.includes("contentVisibility"), "Large grids must use browser-level virtualization/content visibility.");
  assert(assetContentBrowser.includes("Showing the first"), "Large result sets must be bounded.");
  assert(assetContentBrowser.includes("Search name, tags, semantic role, category, status, canonical ID"), "Global search must cover the requested fields.");
  assert(assetContentBrowser.includes("All Engines"), "Engine filter must exist.");
  assert(assetContentBrowser.includes("Any Resolution"), "Resolution filter must exist.");
  assert(assetContentBrowser.includes("Animated"), "Animated filter must exist.");
  for (const removedFolder of ["All Uploaded Art", "Favorites", "Recently Used", "Recently Opened", "Recently Uploaded"]) {
    assert(!assetContentBrowser.includes(`label: "${removedFolder}"`), `${removedFolder} must not appear as an Asset Library tree category.`);
  }
  for (const action of ["Delete", "Move", "Replace", "Tag", "Publish", "Approve"]) {
    assert(assetContentBrowser.includes(action), `Bulk action ${action} must be available from the browser.`);
  }

  assert(creativeRoute.includes("redirect("), "Creative Production route must redirect.");
  assert(creativeRoute.includes("/assets?"), "Creative Production route must redirect into /assets compatibility routes.");
  assert(creativeRoute.includes("areaToCategory"), "Creative Production redirects must map old area URLs to Asset Library categories.");
  assert(read("app/creative-production/[...path]/page.tsx").includes("redirect(\"/assets?deprecated=creative-production\")"), "Creative Production deep links must redirect safely.");
  assert(visualBuilderRoute.includes("/assets?"), "Deprecated visual builder route must redirect to Asset Library.");
  assert(!read("app/advanced/deprecated/visual-builder/page.tsx").includes('href="/creative-production"'), "Deprecated visual builder archive must not present Creative Production as a target.");
  assert(!read("app/encyclopedia/page.tsx").includes("Creative Production Readiness"), "Encyclopedia page must not link to Creative Production readiness.");

  const { getAssetProductionState } = await import("@/lib/assets/asset-production");
  const state = await getAssetProductionState();
  const categoryTotals = Object.fromEntries(assetLibraryCategoryIds.map((categoryId) => [categoryId, state.assetLibraryInventory.categorySummaries[categoryId].total]));
  assert(categoryTotals["top-hud"] > 0, "Top HUD category must contain assets.");
  assert(categoryTotals["buildings-ui"] > 0, "Buildings category must contain assets.");
  assert(categoryTotals["research-ui"] > 0, "Research category must contain assets.");
  assert(categoryTotals["upgrade-categories"] > 0, "Upgrades category must contain assets.");

  console.log(JSON.stringify({
    ok: true,
    primaryNavigation: "Home / Asset Library",
    retiredPrimaryNavigation: "Creative Production",
    routeCompatibility: {
      creativeProduction: "/assets?deprecated=creative-production",
      assetLibrary: "/asset-library?category=:categoryId",
      assets: "/assets?category=:categoryId"
    },
    contentBrowser: {
      layout: "Content Tree / Asset Grid",
      cardWidth: "180-220px",
      treeState: "remembered",
      quickPreview: "hover-or-spacebar",
      persistentInspector: false,
      boundedGrid: true
    },
    categoryCount: assetLibraryCategoryIds.length,
    categoryTotals
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
