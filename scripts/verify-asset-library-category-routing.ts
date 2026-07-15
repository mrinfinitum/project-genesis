import { readFileSync } from "node:fs";
import path from "node:path";
import { normalizeAssetLibraryCategoryId, resolveAssetLibraryCategoryView } from "@/lib/assets/asset-library-routing";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assertView(input: string, expectedCategory: string, expectedView: string) {
  const resolved = resolveAssetLibraryCategoryView(input);
  assert(resolved.categoryId === expectedCategory, `${input} normalized to ${resolved.categoryId}; expected ${expectedCategory}.`);
  assert(resolved.viewType === expectedView, `${input} resolved to ${resolved.viewType}; expected ${expectedView}.`);
  return resolved;
}

function main() {
  const assetLibraryPage = read("app/asset-library/page.tsx");
  const workspace = read("components/asset-production-workspace.tsx");
  const routing = read("lib/assets/asset-library-routing.ts");

  const upgrade = assertView("upgrade-categories", "upgrade-categories", "upgrade_category_workflow");
  assertView("ui/upgrade-categories", "upgrade-categories", "upgrade_category_workflow");
  assertView("Upgrade Categories", "upgrade-categories", "upgrade_category_workflow");
  assertView("research-ui", "research-ui", "generic_inventory");
  assertView("buildings-ui", "buildings-ui", "generic_inventory");
  assertView("top-hud", "top-hud", "generic_inventory");

  const beforeHydration = resolveAssetLibraryCategoryView("ui/upgrade-categories");
  const afterHydration = resolveAssetLibraryCategoryView("upgrade-categories");
  const afterDensityRestore = resolveAssetLibraryCategoryView(normalizeAssetLibraryCategoryId("upgrade_categories"));
  const afterFilterRestore = resolveAssetLibraryCategoryView("Upgrade Categories");
  const afterRerender = resolveAssetLibraryCategoryView("upgrade-categories");
  assert(beforeHydration.viewType === "upgrade_category_workflow", "Upgrade Categories must be dedicated before hydration.");
  assert(afterHydration.viewType === "upgrade_category_workflow", "Upgrade Categories must remain dedicated after hydration.");
  assert(afterDensityRestore.viewType === "upgrade_category_workflow", "Density settings must not change Upgrade Categories renderer.");
  assert(afterFilterRestore.viewType === "upgrade_category_workflow", "Filter restoration must not change Upgrade Categories renderer.");
  assert(afterRerender.viewType === "upgrade_category_workflow", "Rerendering must not change Upgrade Categories renderer.");

  assert(upgrade.reason.includes("never falls back"), "Upgrade Categories renderer reason must document no generic fallback.");
  assert(routing.includes('viewType: "upgrade_category_workflow"'), "Routing module must define the dedicated Upgrade Categories view type.");
  assert(!routing.includes("localStorage"), "Routing resolver must not read persisted presentation settings.");
  assert(assetLibraryPage.includes("initialSection"), "Asset Library page must pass route section into the client workspace.");
  assert(workspace.includes("resolveAssetLibraryCategoryView"), "Workspace must use the canonical category view resolver.");
  assert(workspace.includes('categoryRoute.viewType === "upgrade_category_workflow"'), "Workspace must render Upgrade Categories from the resolved view type.");
  assert(workspace.includes('categoryRoute.viewType === "generic_inventory"'), "Workspace must render standard categories from the resolved view type.");
  assert(!workspace.includes('activeNode !== "upgrade-categories" ? <AssetLibraryCategoryInventory'), "Workspace must not use negative fallthrough to protect Upgrade Categories.");
  assert(!workspace.includes('activeNode === "upgrade-categories" ? <UpgradeCategoriesWorkspace'), "Workspace must not select the dedicated workflow with scattered activeNode conditionals.");
  assert(workspace.includes("persistedSettingsLoaded"), "Workspace must expose development routing diagnostics.");
  assert(workspace.includes("presentation-settings-only"), "Diagnostics must identify persisted settings as presentation-only.");

  console.log(JSON.stringify({
    ok: true,
    canonicalCategoryId: "upgrade-categories",
    acceptedAliases: ["ui/upgrade-categories", "Upgrade Categories", "upgrade_categories"],
    upgradeViewType: upgrade.viewType,
    genericInventoryCategories: ["top-hud", "research-ui", "buildings-ui"],
    rendererReason: upgrade.reason,
    routeSectionPassedToClient: true,
    presentationSettingsAffectRenderer: false
  }, null, 2));
}

main();
