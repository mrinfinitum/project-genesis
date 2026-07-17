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
  const assetLibraryPage = read("app/asset-library/page.tsx");
  const assetsPage = read("app/assets/page.tsx");
  const creativeRoute = read("app/creative-production/page.tsx");
  const visualBuilderRoute = read("app/visual-screen-builder/page.tsx");

  assert(existsSync(path.join(process.cwd(), "app/creative-production/[...path]/page.tsx")), "Creative Production catch-all redirect must exist.");
  assert(!appShell.includes('label: "Creative Production"'), "Creative Production must not appear as a primary navigation group.");
  assert(!appShell.includes('href: "/creative-production?area='), "Primary navigation must not link to Creative Production area URLs.");
  assert(appShell.includes('id: "content-libraries"'), "Asset Library must live under Content Libraries.");
  assert(appShell.includes('href: "/asset-library", label: "Asset Library"'), "Asset Library primary navigation item is missing.");

  assert(assetLibraryPage.includes("category ?? section"), "Asset Library page must prefer category routes while preserving section compatibility.");
  assert(assetsPage.includes("category ?? section"), "Legacy /assets route must support category routes.");
  assert(assetWorkspace.includes("GeneratedLibraryCard"), "Asset Library category landing must use the shared GeneratedLibraryCard.");
  assert(assetWorkspace.includes("AssetCategoryLanding"), "Asset Library must render category cards as the first screen.");
  assert(assetWorkspace.includes('activeNode === "dashboard" ? <AssetCategoryLanding'), "Dashboard must open directly to category cards.");
  assert(assetWorkspace.includes("activeNode === \"dashboard\" ? null : <AssetProductionTree"), "Default Asset Library landing must not show the duplicate internal tree.");
  assert(assetWorkspace.includes("?category="), "Asset Library card navigation must use category routes.");

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
    primaryNavigation: "Content Libraries / Asset Library",
    retiredPrimaryNavigation: "Creative Production",
    routeCompatibility: {
      creativeProduction: "/assets?deprecated=creative-production",
      assetLibrary: "/asset-library?category=:categoryId",
      assets: "/assets?category=:categoryId"
    },
    sharedCardComponent: "GeneratedLibraryCard",
    categoryCount: assetLibraryCategoryIds.length,
    categoryTotals
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
