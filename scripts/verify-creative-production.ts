import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function section(text: string, start: string, end?: string) {
  const startIndex = text.indexOf(start);
  assert(startIndex >= 0, `Could not find section start: ${start}`);
  const endIndex = end ? text.indexOf(end, startIndex) : -1;
  return text.slice(startIndex, endIndex >= 0 ? endIndex : undefined);
}

function readiness(items: Array<{ status: string }>) {
  const credit: Record<string, number> = {
    published: 1,
    approved: 0.9,
    needs_review: 0.55,
    uploaded: 0.45,
    processing: 0.35,
    missing: 0,
    invalid: 0,
    deprecated: 0,
    unmapped: 0.2
  };
  if (!items.length) return 0;
  return Math.round((items.reduce((sum, item) => sum + (credit[item.status] ?? 0), 0) / items.length) * 100);
}

async function main() {
  const pagePath = "app/creative-production/page.tsx";
  const workspacePath = "components/creative-production-workspace.tsx";
  const robloxArtRoutePath = "app/assets/roblox-art/[...path]/route.ts";
  const appShell = read("components/app-shell.tsx");
  const page = read(pagePath);
  const workspace = read(workspacePath);
  const robloxArtRoute = read(robloxArtRoutePath);
  const architecture = read("lib/architecture/index.ts");

  assert(existsSync(path.join(process.cwd(), pagePath)), "Creative Production route must exist.");
  assert(existsSync(path.join(process.cwd(), robloxArtRoutePath)), "Published Roblox art route must exist.");
  assert(workspace.includes("See what is missing, upload assets, and finish each part of NOVERIS."), "Creative Production subtitle is missing.");
  assert(workspace.includes("Creative Production Readiness"), "Creative Production readiness summary is missing.");
  assert(workspace.includes("statusCredit"), "Readiness must derive from item status credit, not manual percentages.");
  assert(workspace.includes("density: \"compact\""), "Creative Production default density must be compact.");
  assert(workspace.includes("previewSize: \"small\""), "Creative Production default preview size must be small.");
  assert(!workspace.includes("CompactWorkspaceToolbar"), "Primary Creative Production must not render the repeated expanded asset display toolbar.");
  assert(workspace.includes("WorkspaceSearchBar"), "Creative Production must keep search visible.");
  assert(workspace.includes("ViewOptionsButton"), "Creative Production display controls must live behind one collapsed View Options control.");
  assert(workspace.includes("View Options"), "Creative Production must expose the collapsed View Options label.");
  assert(!workspace.includes("ClassSelector"), "Creative Production must not render a duplicate class selector when feature cards already navigate.");
  assert(workspace.includes("FeatureSummaryCard"), "Creative Production must show compact feature navigation cards before large record sets.");
  assert(workspace.includes("Back to Feature Cards"), "Creative Production drill-down must return to feature cards.");
  assert(workspace.includes("role-filter-"), "Creative Production must keep asset role as a secondary filter.");
  assert(workspace.includes("focus-visible:border-cyan-200"), "Creative Production cards must include visible focus states.");
  assert(workspace.includes("hover:border-cyan-300/45"), "Creative Production cards must include hover states.");
  assert(!workspace.includes("`${area.label} Groups`"), "Creative Production must not render noisy group-chip rows.");
  assert(!workspace.includes("area.groups.map"), "Creative Production must not show every group as permanent chips.");
  assert(workspace.includes("viewOptionsState: \"closed_by_default\""), "View Options must remain closed by default.");
  assert(workspace.includes("role=\"tablist\"") && workspace.includes("aria-selected"), "Creative Production status tabs must remain visible and accessible.");
  assert(workspace.includes("resolveCreativeAssetPresentation"), "Creative Production must use role-aware asset card presentation.");
  assert(workspace.includes("roleAwareAssetGridClass"), "Creative Production must use a role-aware card grid.");
  assert(workspace.includes("QuickAssetPreview"), "Creative Production cards must expose hover/focus quick previews.");
  assert(workspace.includes("resolveProductionClasses") && workspace.includes("resolveAssetClass"), "Creative Production must use shared canonical class resolvers.");
  assert(workspace.includes("Upload Asset"), "Missing cards must expose upload actions.");
  assert(workspace.includes("Open Asset Library"), "Creative Production must link to Asset Library instead of an internal layout editor.");
  assert(workspace.includes("Generate Game Handoff"), "Creative Production must generate client handoffs.");
  assert(workspace.includes("Generate Roblox Handoff"), "Creative Production must generate Roblox handoffs.");
  assert(workspace.includes("Generate Mobile Handoff"), "Creative Production must generate mobile handoffs.");
  assert(!workspace.includes("Visual Builder"), "Creative Production must not expose Visual Builder as an active workflow.");
  assert(!workspace.includes("visualBuilderHref"), "Creative Production must not retain active visual builder route wiring.");
  assert(!workspace.includes("mode=visual-builder"), "Creative Production must not link to visual-builder mode.");
  assert(workspace.includes("Inspect asset"), "Published/linked cards must navigate directly to inspection through the card.");
  assert(!workspace.includes("Open Inspector"), "Creative Production must not show Open Inspector buttons.");
  assert(!workspace.includes("Open Requirement"), "Creative Production must not show Open Requirement buttons.");
  assert(!workspace.includes("Open Upgrade Category Workflow"), "Creative Production must not show duplicate Open Upgrade Category Workflow buttons.");
  assert(workspace.includes("SafePreviewImage"), "Creative Production cards must gracefully fall back when a preview URL fails.");
  assert(workspace.includes("Screen Shell") && workspace.includes("Branch Sidebar") && workspace.includes("Era Timeline"), "Research production groups must be present.");
  assert(workspace.includes("Labor") && workspace.includes("Premium Crystal") && workspace.includes("Civilization Identity"), "Top HUD production groups must be present.");
  assert(workspace.includes("Advanced / Systems Authoring"), "Creative Production must link to Advanced / Systems Authoring.");
  assert(workspace.includes("useEffect(() =>"), "Creative Production workspace must sync active area from route changes.");
  assert(workspace.includes("setActiveArea(normalizedInitial ?? \"overview\")"), "Creative Production workspace must update when the selected area query changes.");
  assert(page.includes("buildGameEngineExport(\"generic\")"), "Creative Production must load the canonical generated universe catalog.");
  assert(workspace.includes("UniverseAreaDetail"), "Creative Production must render dedicated universe catalog detail pages.");
  assert(workspace.includes("UniverseCatalogCard"), "Creative Production must render generated celestial records as catalog cards.");
  assert(workspace.includes("universeCatalogItems"), "Creative Production must resolve celestial catalog items from canonical runtime data.");
  assert(workspace.includes('if (value === "galaxy") return "galaxies";'), "Old galaxy route query must normalize to the new Galaxies catalog.");
  assert(workspace.includes('textValue(row.celestial_body_type) !== "Star"'), "Planets catalog must exclude star records.");
  assert(!workspace.includes('id: "planets", label: "Planets", categoryIds: ["planet-ui"]'), "Planets catalog must not use planet-ui asset inventory.");

  const creativeNav = section(appShell, 'id: "civilization"', 'id: "resources"');
  const universeNav = section(appShell, 'id: "universe"', 'id: "operations"');
  const advancedNav = section(appShell, 'id: "studio"', 'id: "universe"');
  assert(creativeNav.includes('label: "Creative Production"'), "Primary nav must include Creative Production.");
  for (const label of ["Overview", "Top HUD", "Left Navigation", "Research", "Buildings", "Upgrades", "AI Agents", "Civilizations", "Galaxies", "Sectors", "Star Systems", "Stars", "Planets", "Settings", "Login & Account", "Loading", "Icons", "Backgrounds", "Animations", "Audio", "Video"]) {
    assert(creativeNav.includes(`label: "${label}"`), `Creative Production nav is missing ${label}.`);
  }
  assert(!creativeNav.includes("Research Designer"), "Research Designer must not remain in primary Creative Production nav.");
  assert(!creativeNav.includes("Upgrade Designer"), "Upgrade Designer must not remain in primary Creative Production nav.");
  assert(!creativeNav.includes("Building Designer"), "Building Designer must not remain in primary Creative Production nav.");
  for (const label of ["Galaxy Library", "Sector Library", "Star System Library", "Star Library", "Planet Library", "Discovery Library"]) {
    assert(universeNav.includes(`label: "${label}"`), `Universe navigation is missing ${label}.`);
  }
  for (const oldLabel of ["Explore Galaxies", "Sector Map", "Star System Map", "Discovery Journal"]) {
    assert(!universeNav.includes(oldLabel), `Universe navigation still contains old label ${oldLabel}.`);
  }
  for (const label of ["Civilization Library", "Content Authoring", "Research Designer", "Unlock Matrix", "Upgrade Designer", "Building Designer", "Wonder Designer", "District Designer", "Economy Designer", "Architecture", "Deprecated Visual Builder Archive"]) {
    assert(advancedNav.includes(`label: "${label}"`), `${label} must appear under Advanced / Systems Authoring.`);
  }
  assert(appShell.includes("function hrefPath"), "App shell must normalize query-string navigation paths.");
  assert(appShell.includes("currentSearchParams"), "Creative Production nav must track query parameters so area links become active.");
  assert(appShell.includes("window.location.search"), "Creative Production nav must sync query state from the current URL without forcing global CSR bailout.");
  assert(appShell.includes("function hrefSearch"), "Creative Production nav must compare query-string route targets.");
  assert(appShell.includes("isItemActive(item, pathname, currentSearchParams)"), "Creative Production nav items must use query-aware active state.");

  for (const route of ["app/research/page.tsx", "app/upgrades/page.tsx", "app/buildings/page.tsx", "app/unlock-matrix/page.tsx", "app/wonders/page.tsx", "app/districts/page.tsx"]) {
    assert(existsSync(path.join(process.cwd(), route)), `Old designer route must still exist: ${route}.`);
  }

  assert(architecture.includes("ARCH-DECISION-CREATIVE-PRODUCTION-PRIMARY"), "Architecture decision for Creative Production must be recorded.");
  assert(architecture.includes("ARCH-DECISION-CONTENT-ASSET-IDE"), "Architecture decision for Studio as canonical Content and Asset IDE must be recorded.");
  assert(architecture.includes("Creative Production Is the Primary Creative Workflow"), "Architecture decision title is missing.");
  assert(robloxArtRoute.includes("public\", \"assets\", \"roblox-art"), "Roblox art route must serve only the public Roblox art folder.");
  assert(robloxArtRoute.includes("path.relative"), "Roblox art route must guard against path traversal.");
  assert(robloxArtRoute.includes("content-type"), "Roblox art route must return image content types.");

  const state = await getAssetProductionState();
  const items = state.assetLibraryInventory.items;
  const category = (id: string) => items.filter((item) => item.categoryId === id);
  const topHud = category("top-hud");
  const research = category("research-ui");
  const buildings = category("buildings-ui");
  const upgrades = category("upgrade-categories");
  assert(topHud.length >= 7, `Top HUD production must use real inventory records; received ${topHud.length}.`);
  assert(research.length >= 18, `Research production must use real inventory records; received ${research.length}.`);
  assert(buildings.length >= 10, `Buildings production must use real inventory records; received ${buildings.length}.`);
  assert(upgrades.length >= 100, `Upgrades production must use real inventory records; received ${upgrades.length}.`);
  assert(items.some((item) => item.status === "missing" && item.requirementId), "Missing requirement cards must be first-class inventory records.");
  assert(items.some((item) => item.status === "published" && item.previewUrl), "Published cards must have previews where available.");
  assert(readiness(topHud) >= 0 && readiness(research) >= 0 && readiness(upgrades) >= 0, "Readiness calculation must produce numeric values.");
  assert(state.upgradeCategoryAssets.length === 4, "Upgrade Category workflow must continue exposing four category background records.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(runtime.metadata.contentVersion >= 17, `Creative Production requires building taxonomy runtime contentVersion 17 or newer; received ${runtime.metadata.contentVersion}.`);
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
  }
  const canonical = exports[0].canonical as {
    galaxies: Array<Record<string, unknown>>;
    sectors: Array<Record<string, unknown>>;
    star_systems: Array<Record<string, unknown>>;
    celestial_bodies: Array<Record<string, unknown>>;
    planets: Array<Record<string, unknown>>;
  };
  const starCount = canonical.celestial_bodies.filter((row) => row.celestial_body_type === "Star").length;
  const planetBodyCount = canonical.celestial_bodies.filter((row) => row.celestial_body_type !== "Star").length;
  assert(canonical.galaxies.length >= 1, "Generated catalog must expose at least one galaxy.");
  assert(canonical.sectors.length >= 1, "Generated catalog must expose at least one sector.");
  assert(canonical.star_systems.length >= 1, "Generated catalog must expose generated star systems.");
  assert(starCount >= 1, "Generated catalog must expose star records.");
  assert(planetBodyCount >= 1, "Generated catalog must expose non-star celestial bodies for Planets.");

  console.log(JSON.stringify({
    ok: true,
    route: "/creative-production",
    defaultDensity: "compact",
    previewSize: "small",
    nav: {
      primary: "Creative Production",
      advanced: "Advanced / Systems Authoring"
    },
    counts: {
      topHud: topHud.length,
      leftNavigation: category("left-navigation").length,
      research: research.length,
      buildings: buildings.length,
      upgrades: upgrades.length,
      aiAgents: category("ai-agents").length,
      galaxies: canonical.galaxies.length,
      sectors: canonical.sectors.length,
      starSystems: canonical.star_systems.length,
      stars: starCount,
      planetsAndMoons: planetBodyCount + canonical.planets.length
    },
    readiness: {
      topHud: readiness(topHud),
      research: readiness(research),
      buildings: readiness(buildings),
      upgrades: readiness(upgrades)
    },
    upgradeCategoryWorkflowRecords: state.upgradeCategoryAssets.length,
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      validationStatus: runtime.metadata.validationStatus,
      checksum: runtime.metadata.checksum
    },
    engineExports: Object.fromEntries(exports.map((engineExport, index) => [targets[index], engineExport.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
