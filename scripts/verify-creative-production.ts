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
  const appShell = read("components/app-shell.tsx");
  const workspace = read(workspacePath);
  const architecture = read("lib/architecture/index.ts");

  assert(existsSync(path.join(process.cwd(), pagePath)), "Creative Production route must exist.");
  assert(workspace.includes("See what is missing, upload assets, and finish each part of NOVERIS."), "Creative Production subtitle is missing.");
  assert(workspace.includes("Creative Production Readiness"), "Creative Production readiness summary is missing.");
  assert(workspace.includes("statusCredit"), "Readiness must derive from item status credit, not manual percentages.");
  assert(workspace.includes("density: \"compact\""), "Creative Production default density must be compact.");
  assert(workspace.includes("previewSize: \"small\""), "Creative Production default preview size must be small.");
  assert(workspace.includes("Upload Asset"), "Missing cards must expose upload actions.");
  assert(workspace.includes("Open Inspector"), "Published/linked cards must expose inspector actions.");
  assert(workspace.includes("Open Upgrade Category Workflow"), "Upgrades area must preserve the dedicated Upgrade Category workflow entry point.");
  assert(workspace.includes("Screen Shell") && workspace.includes("Branch Sidebar") && workspace.includes("Era Timeline"), "Research production groups must be present.");
  assert(workspace.includes("Labor") && workspace.includes("Premium Crystal") && workspace.includes("Civilization Identity"), "Top HUD production groups must be present.");
  assert(workspace.includes("Advanced / Systems Authoring"), "Creative Production must link to Advanced / Systems Authoring.");

  const creativeNav = section(appShell, 'id: "civilization"', 'id: "resources"');
  const advancedNav = section(appShell, 'id: "studio"', 'id: "universe"');
  assert(creativeNav.includes('label: "Creative Production"'), "Primary nav must include Creative Production.");
  for (const label of ["Overview", "Top HUD", "Left Navigation", "Research", "Buildings", "Upgrades", "AI Agents", "Civilizations", "Galaxy", "Planets", "Settings", "Login & Account", "Loading", "Icons", "Backgrounds", "Animations", "Audio", "Video"]) {
    assert(creativeNav.includes(`label: "${label}"`), `Creative Production nav is missing ${label}.`);
  }
  assert(!creativeNav.includes("Research Designer"), "Research Designer must not remain in primary Creative Production nav.");
  assert(!creativeNav.includes("Upgrade Designer"), "Upgrade Designer must not remain in primary Creative Production nav.");
  assert(!creativeNav.includes("Building Designer"), "Building Designer must not remain in primary Creative Production nav.");
  for (const label of ["Civilization Design Studio", "Content Authoring", "Research Designer", "Unlock Matrix", "Upgrade Designer", "Building Designer", "Wonder Designer", "District Designer", "Economy Designer", "Architecture"]) {
    assert(advancedNav.includes(`label: "${label}"`), `${label} must appear under Advanced / Systems Authoring.`);
  }
  assert(appShell.includes("function hrefPath"), "App shell must normalize query-string navigation paths.");

  for (const route of ["app/research/page.tsx", "app/upgrades/page.tsx", "app/buildings/page.tsx", "app/unlock-matrix/page.tsx", "app/wonders/page.tsx", "app/districts/page.tsx"]) {
    assert(existsSync(path.join(process.cwd(), route)), `Old designer route must still exist: ${route}.`);
  }

  assert(architecture.includes("ARCH-DECISION-CREATIVE-PRODUCTION-PRIMARY"), "Architecture decision for Creative Production must be recorded.");
  assert(architecture.includes("Creative Production Is the Primary Creative Workflow"), "Architecture decision title is missing.");

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
  assert(runtime.metadata.contentVersion === 15, `Creative Production must not change runtime contentVersion; received ${runtime.metadata.contentVersion}.`);
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
  }

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
      aiAgents: category("ai-agents").length
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
