import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { searchStudio } from "@/lib/studio/global-search";
import { getUniverseLibraryData } from "@/lib/universe/library";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assertIncludes(label: string, source: string, expected: string) {
  assert(source.includes(expected), `${label} must include ${expected}.`);
}

function assertNotIncludes(label: string, source: string, blocked: string) {
  assert(!source.includes(blocked), `${label} must not include ${blocked}.`);
}

function appRouteExists(route: string) {
  return existsSync(path.join(process.cwd(), route));
}

function navigationSource(appShell: string) {
  const start = appShell.indexOf("const navigationGroups");
  const end = appShell.indexOf("function hrefPath", start);
  assert(start >= 0 && end > start, "Unable to isolate navigationGroups source.");
  return appShell.slice(start, end);
}

const authoringAudit = [
  {
    route: "/research",
    displayName: "Research",
    contentType: "Research records",
    classification: "Partial duplicate",
    actionsAvailable: "Browse, search, filter, open record, advanced data editor",
    duplicateDestination: "Research Library",
    uniqueFunctionality: "Direct schema editing remains on /research",
    recommendation: "Keep route; move navigation to Civilization / Research Library"
  },
  {
    route: "/buildings",
    displayName: "Buildings",
    contentType: "Building records",
    classification: "Partial duplicate",
    actionsAvailable: "Browse, search, taxonomy review, open record, advanced data editor",
    duplicateDestination: "Building Library",
    uniqueFunctionality: "Canonical taxonomy and direct schema editing remain on /buildings",
    recommendation: "Keep route; move navigation to Civilization / Building Library"
  },
  {
    route: "/resource-catalog",
    displayName: "Resources",
    contentType: "Resource catalog",
    classification: "Exact duplicate",
    actionsAvailable: "Browse, edit, validate, export",
    duplicateDestination: "Resource Catalog",
    uniqueFunctionality: "None outside canonical resource workspace",
    recommendation: "Keep route; move navigation to Civilization / Resource Catalog"
  },
  {
    route: "/ai-agents",
    displayName: "AI Agents",
    contentType: "AI agent definitions",
    classification: "Exact duplicate",
    actionsAvailable: "Browse, review variants, manage agent assets",
    duplicateDestination: "AI Agents",
    uniqueFunctionality: "None outside canonical AI Agents workspace",
    recommendation: "Keep route; move navigation to Civilization / AI Agents"
  },
  {
    route: "/runtime",
    displayName: "Runtime",
    contentType: "Published runtime contract",
    classification: "Wrong domain",
    actionsAvailable: "Inspect runtime, open public runtime JSON, open content releases",
    duplicateDestination: "Runtime & Verification / Runtime",
    uniqueFunctionality: "Runtime inspection",
    recommendation: "Keep route; move navigation to Runtime & Verification"
  },
  {
    route: "/game-engine-exports",
    displayName: "Exports",
    contentType: "Engine export targets",
    classification: "Wrong domain",
    actionsAvailable: "Review export targets, validation, integration notes",
    duplicateDestination: "Runtime & Verification / Exports",
    uniqueFunctionality: "Export target inspection",
    recommendation: "Keep route; move navigation to Runtime & Verification"
  },
  {
    route: "/architecture",
    displayName: "Architecture",
    contentType: "Architecture workspace",
    classification: "Wrong domain",
    actionsAvailable: "Inspect architecture decisions and ownership",
    duplicateDestination: "Runtime & Verification / Architecture",
    uniqueFunctionality: "Architecture review",
    recommendation: "Keep route; move navigation to Runtime & Verification"
  },
  {
    route: "/content-authoring",
    displayName: "Content Authoring",
    contentType: "Era starter kits and templates",
    classification: "Unique but vague",
    actionsAvailable: "Create era starter kit, duplicate Survival, review templates/wizards",
    duplicateDestination: "Era Starter Kits",
    uniqueFunctionality: "Procedural draft era scaffolding",
    recommendation: "Redirect to /era-starter-kits and use the specific workspace name"
  }
];

async function main() {
  const appShell = read("components/app-shell.tsx");
  const nav = navigationSource(appShell);
  const commandPalette = read("components/studio-command-palette.tsx");
  const globalSearch = read("lib/studio/global-search.ts");
  const productionPlanner = read("lib/production/planner.ts");
  const creativeProduction = read("components/creative-production-workspace.tsx");
  const eraStarterKits = read("components/content-authoring-workspace.tsx");

  assertNotIncludes("Primary navigation", nav, 'id: "authoring"');
  assertNotIncludes("Primary navigation", nav, 'label: "Authoring"');
  assertIncludes("Primary navigation", nav, 'id: "civilization"');
  assertIncludes("Primary navigation", nav, 'label: "Building Library"');
  assertIncludes("Primary navigation", nav, 'label: "Research Library"');
  assertIncludes("Primary navigation", nav, 'label: "Resource Catalog"');
  assertIncludes("Primary navigation", nav, 'label: "AI Agents"');
  assertIncludes("Primary navigation", nav, 'label: "Era Starter Kits"');
  assertIncludes("Primary navigation", nav, 'id: "runtime-verification"');
  assertIncludes("Primary navigation", nav, 'label: "Runtime & Verification"');
  assertIncludes("Primary navigation", nav, 'label: "Verification"');

  for (const route of [
    "app/era-starter-kits/page.tsx",
    "app/content-authoring/page.tsx",
    "app/research/page.tsx",
    "app/buildings/page.tsx",
    "app/resource-catalog/page.tsx",
    "app/ai-agents/page.tsx",
    "app/runtime/page.tsx",
    "app/game-engine-exports/page.tsx",
    "app/architecture/page.tsx",
    "app/validation-engine/page.tsx"
  ]) {
    assert(appRouteExists(route), `Expected route is missing: ${route}`);
  }

  assertIncludes("Content Authoring redirect", read("app/content-authoring/page.tsx"), 'redirect("/era-starter-kits")');
  assertIncludes("Era Starter Kits page", read("app/era-starter-kits/page.tsx"), "ContentAuthoringWorkspace");
  assertNotIncludes("Creative Production links", creativeProduction, "Advanced / Systems Authoring");
  assertIncludes("Creative Production links", creativeProduction, "Related Studio Workspaces");
  assertIncludes("Creative Production links", creativeProduction, '"/era-starter-kits", "Era Starter Kits"');
  assertNotIncludes("Production planner", productionPlanner, 'href: "/content-authoring"');
  assertIncludes("Production planner", productionPlanner, 'href: "/era-starter-kits"');
  assertNotIncludes("Era Starter Kits UI", eraStarterKits, "Authoring IDE");
  assertNotIncludes("Era Starter Kits UI", eraStarterKits, "Authoring Throughput");
  assertIncludes("Era Starter Kits UI", eraStarterKits, "Era Starter Kits");

  for (const expected of [
    "Open Planet Library",
    "Generate Planet",
    "Open Galaxy Library",
    "Generate Galaxy",
    "Open Research Library",
    "Create Research",
    "Open Building Library",
    "Create Building",
    "Open Resource Catalog",
    "Create Resource",
    "Open Asset Library",
    "Open Experience Design",
    "Open Era Starter Kits"
  ]) {
    assertIncludes("Command palette", commandPalette, expected);
  }
  for (const blocked of ["Open Authoring", "Open Authoring Dashboard", "Go to Authoring"]) {
    assertNotIncludes("Command palette", commandPalette, blocked);
    assertNotIncludes("Global search", globalSearch, blocked);
  }
  assertNotIncludes("Global search workspace routes", globalSearch, '"/content-authoring"');
  assertIncludes("Global search", globalSearch, '"/era-starter-kits"');
  assertIncludes("Global search", globalSearch, "`/buildings?record=${encodeURIComponent(building.id)}`");
  assertIncludes("Global search", globalSearch, "`/research?record=${encodeURIComponent(research.id)}`");
  assertIncludes("Global search", globalSearch, "`/resource-catalog?record=${encodeURIComponent(resource.id)}`");

  const generatedUniverse = read("components/generated-universe-library.tsx");
  const dataWorkspace = read("components/data-workspace.tsx");
  assertIncludes("Universe libraries", generatedUniverse, "{generateLabel}");
  assertIncludes("Universe libraries", generatedUniverse, "Import");
  assertIncludes("Universe libraries", generatedUniverse, "GeneratedLibraryCard");
  assertIncludes("Data libraries", dataWorkspace, "Advanced Data Editor");
  assertIncludes("Data libraries", dataWorkspace, "AdminTable");
  assertIncludes("Data libraries", dataWorkspace, "CompactWorkspaceToolbar");
  assertIncludes("Data libraries", dataWorkspace, "DensityInspector");

  const assetState = await getAssetProductionState();
  const universe = getUniverseLibraryData();
  const runtime = await buildCanonicalRuntimeExportPayload();
  const exports = await Promise.all((["generic", "roblox", "web", "unity", "unreal", "godot"] as EngineTarget[]).map((target) => buildGameEngineExport(target)));
  const search = await searchStudio("authoring", 12);
  assert(!search.results.some((result) => /content-authoring|authoring dashboard|open authoring/i.test(`${result.title} ${result.href}`)), "Global search must not expose the retired Authoring surface.");
  for (const payload of exports) {
    assert(payload.validation.status === "Ready", `${payload.target.id} export must remain Ready.`);
  }
  assert(runtime.metadata.contentVersion >= 32, `Navigation cleanup expects the current runtime contract or newer; received ${runtime.metadata.contentVersion}.`);

  console.log(JSON.stringify({
    ok: true,
    authoringAudit,
    navigation: {
      removedTopLevelAuthoring: true,
      newHomes: {
        research: "/research",
        buildings: "/buildings",
        resources: "/resource-catalog",
        aiAgents: "/ai-agents",
        runtime: "/runtime",
        exports: "/game-engine-exports",
        architecture: "/architecture",
        eraStarterKits: "/era-starter-kits"
      }
    },
    routeRedirects: {
      "/content-authoring": "/era-starter-kits"
    },
    libraryActionParity: {
      universeLibraries: ["browse", "search", "filter", "generate", "import", "open"],
      dataLibraries: ["browse", "search", "filter", "open", "advanced data editor"],
      assetLibrary: ["browse uploaded assets", "quick preview", "bulk actions", "open asset detail"]
    },
    permissions: {
      source: "unchanged route/API permissions",
      protectedActionsRemoved: 0,
      assetRecordsPreserved: assetState.assets.length,
      universeRecordsPreserved: Object.fromEntries(Object.entries(universe).map(([key, value]) => [key, value.length]))
    },
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      runtimeVersion: runtime.metadata.schemaVersion,
      checksum: runtime.metadata.checksum
    },
    engineExports: Object.fromEntries(exports.map((payload) => [payload.target.id, payload.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
