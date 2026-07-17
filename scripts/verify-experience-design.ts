import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getExperienceDesignState, experienceReviewWorkflow, type ExperienceDesignKind } from "@/lib/experience-design";
import { searchStudio } from "@/lib/studio/global-search";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function exists(relativePath: string) {
  return existsSync(path.join(process.cwd(), relativePath));
}

function assertNoExperienceRuntimeLeak(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!/"experienceDesign"\s*:/.test(text), `${label} leaked experienceDesign root data.`);
  assert(!/"inspirationBoards"\s*:/.test(text), `${label} leaked Inspiration Board library data.`);
  assert(!/"experience_bible"\s*:/.test(text), `${label} leaked Experience Bible model data.`);
  assert(!/"mood_board"\s*:/.test(text), `${label} leaked Mood Board model data.`);
  assert(!text.includes("Inspiration Board Library"), `${label} leaked DV-04 Inspiration Board data.`);
  assert(!/"screen_definition"\s*:/.test(text), `${label} leaked Screen Definition model data.`);
}

function assertBaseRecordFields(record: ReturnType<typeof getExperienceDesignState>["records"][number]) {
  for (const field of ["id", "kind", "name", "description", "status", "created", "modified", "version", "author", "tags", "notes", "attachments", "relationships", "approvalStatus", "history"] as const) {
    assert(record[field] !== undefined, `Experience record ${record.id} missing base field ${field}.`);
  }
  assert(experienceReviewWorkflow.includes(record.status), `Experience record ${record.id} has invalid status ${record.status}.`);
  assert(experienceReviewWorkflow.includes(record.approvalStatus), `Experience record ${record.id} has invalid approval status ${record.approvalStatus}.`);
  assert(record.history.length > 0, `Experience record ${record.id} must include version history.`);
}

async function main() {
  const state = getExperienceDesignState();
  const requiredKinds: ExperienceDesignKind[] = [
    "experience_bible",
    "mood_board",
    "concept",
    "screen_definition",
    "design_token_collection",
    "material_definition",
    "motion_definition",
    "component_definition",
    "theme",
    "brand_guideline",
    "experience_moment",
    "review"
  ];

  assert(state.frameworkId === "ED-01", "Experience Design framework ID must be ED-01.");
  assert(state.version === "1.0", "Experience Design version must be 1.0.");
  assert(state.creativeDirectionOwner === "Studio", "Studio must own Experience Design creative direction.");
  assert(state.runtimePublishing === "not_published", "ED-01 must not be published to runtime.");
  assert(state.implementationBoundary.some((rule) => rule.includes("not gameplay")), "Experience Design must reject gameplay ownership.");
  assert(state.implementationBoundary.some((rule) => rule.includes("not React implementation")), "Experience Design must reject React implementation ownership.");
  assert(state.implementationBoundary.some((rule) => rule.includes("not Three.js")), "Experience Design must reject Three.js ownership.");

  for (const kind of requiredKinds) {
    assert(state.contentModels.some((model) => model.kind === kind), `Missing Experience Design content model ${kind}.`);
    assert(state.records.some((record) => record.kind === kind), `Missing starter Experience Design record for ${kind}.`);
  }

  for (const model of state.contentModels) {
    for (const field of ["id", "name", "description", "status", "created", "modified", "version", "author", "tags", "notes", "attachments", "relationships", "approvalStatus", "history"]) {
      assert(model.requiredFields.includes(field), `Content model ${model.kind} missing required base field ${field}.`);
    }
    assert(model.route.startsWith("/experience-design"), `Content model ${model.kind} route must stay under /experience-design.`);
  }

  for (const record of state.records) {
    assertBaseRecordFields(record);
  }

  for (const status of ["Draft", "In Review", "Approved", "Deprecated", "Archived"]) {
    assert(state.reviewWorkflow.includes(status as never), `Review workflow missing ${status}.`);
  }

  for (const section of ["bible", "inspiration-boards", "concepts", "screens", "tokens", "materials", "motion", "components", "themes", "brand", "accessibility", "journey", "reviews"]) {
    assert(state.sections.some((item) => item.id === section), `Experience Design section missing ${section}.`);
  }

  const inspirationSection = state.sections.find((item) => item.id === "inspiration-boards");
  assert(inspirationSection?.label === "Inspiration Boards", "Experience Design must expose Inspiration Boards workspace.");
  assert(inspirationSection.route === "/experience-design/inspiration-boards", "Inspiration Boards route must be canonical.");
  const boardModel = state.contentModels.find((model) => model.kind === "mood_board");
  assert(boardModel?.displayName === "Inspiration Board", "Existing mood_board model must be presented as Inspiration Board.");
  for (const required of ["title", "subtitle", "purpose", "creativeGoal", "experienceBibleReferences", "visualDnaReferences", "references", "annotations"]) {
    assert(boardModel?.requiredFields.includes(required), `Inspiration Board content model missing ${required}.`);
  }
  for (const capability of ["categories", "collections", "boards", "subboards", "references", "annotations", "relationships", "versions", "approval", "history", "search", "favorites", "presentation mode"]) {
    assert(boardModel?.supportedCapabilities.includes(capability), `Inspiration Board content model missing capability ${capability}.`);
  }

  assert(state.inspirationBoards.id === "DV-04", "Inspiration Board Library ID must be DV-04.");
  assert(state.inspirationBoards.title === "Inspiration Board Library", "DV-04 title must be Inspiration Board Library.");
  assert(state.inspirationBoards.status === "Draft", "DV-04 must remain Draft.");
  assert(state.inspirationBoards.workspaceRoute === "/experience-design/inspiration-boards", "DV-04 workspace route must be /experience-design/inspiration-boards.");
  const expectedCategories = ["Universe", "Galaxy", "Sector", "Star System", "Planet", "Moon", "Colony", "Civilization", "Architecture", "Megastructures", "Discovery", "Research", "Population", "Economy", "Logistics", "AI", "Interface", "HUD", "Navigation", "Loading", "Main Menu", "Settings", "Studio", "Typography", "Lighting", "Color", "Materials", "Motion", "Brand", "Marketing", "Website", "Steam", "Trailers", "Photography", "NASA", "Engineering", "Natural Phenomena"];
  assert(state.inspirationBoards.categories.map((category) => category.title).join("|") === expectedCategories.join("|"), "DV-04 categories must match the canonical list.");
  assert(state.inspirationBoards.boards.length === expectedCategories.length, "DV-04 must create one starter board per canonical category.");
  const expectedAnnotations = ["Lighting", "Color", "Composition", "Geometry", "Atmosphere", "Scale", "Materials", "Motion ideas", "Typography", "Negative space", "Visual rhythm", "Interaction inspiration"];
  assert(state.inspirationBoards.annotationCategories.join("|") === expectedAnnotations.join("|"), "DV-04 annotation categories must match the canonical list.");
  for (const target of ["Experience Bible Chapters", "Visual DNA Sections", "Screen Definitions", "Design Tokens", "Materials", "Motion Definitions", "Components", "Themes", "Brand Guidance", "Concept Art", "Future Tasks"]) {
    assert(state.inspirationBoards.relationshipTargets.includes(target), `DV-04 relationship targets missing ${target}.`);
  }
  for (const mode of ["Grid", "Masonry", "Canvas", "Presentation Mode"]) {
    assert(state.inspirationBoards.viewModes.includes(mode), `DV-04 view modes missing ${mode}.`);
  }
  assert(state.inspirationBoards.presentationMode.enabled, "DV-04 presentation mode must be enabled.");
  for (const purpose of ["creative reviews", "art direction", "team discussions", "design workshops"]) {
    assert(state.inspirationBoards.presentationMode.purpose.includes(purpose), `DV-04 presentation mode missing ${purpose}.`);
  }
  for (const dimension of ["Hope", "Wonder", "Scale", "Civilization", "Discovery", "Architecture", "Atmosphere", "Light", "Calm", "Engineering"]) {
    assert(state.inspirationBoards.scoreDimensions.includes(dimension), `DV-04 scoring dimensions missing ${dimension}.`);
  }
  for (const tag of ["Monumental Civilization", "Universe First", "Celestial Geometry", "Light Represents Progress", "Calm Intelligence", "Civilization Gold", "Hopeful Futurism"]) {
    assert(state.inspirationBoards.signatureTags.includes(tag), `DV-04 signature tags missing ${tag}.`);
  }
  for (const importSource of ["Asset Library", "Dropbox", "Local Upload", "Generated Concepts", "Approved Marketing Assets"]) {
    assert(state.inspirationBoards.importSources.includes(importSource), `DV-04 import sources missing ${importSource}.`);
  }
  for (const performance of ["lazy images", "virtualized grids", "responsive previews", "deferred loading", "fast search"]) {
    assert(state.inspirationBoards.performanceRequirements.includes(performance), `DV-04 performance requirement missing ${performance}.`);
  }
  for (const accessibility of ["keyboard navigation", "screen readers", "zoom", "reduced motion", "high contrast"]) {
    assert(state.inspirationBoards.accessibilityRequirements.includes(accessibility), `DV-04 accessibility requirement missing ${accessibility}.`);
  }
  for (const board of state.inspirationBoards.boards) {
    assert(board.experienceBibleReferences.length > 0, `Inspiration Board ${board.id} must link to Experience Bible guidance.`);
    assert(board.visualDnaReferences.length > 0, `Inspiration Board ${board.id} must link to Visual DNA guidance.`);
    assert(board.history.length > 0, `Inspiration Board ${board.id} must include history.`);
    assert(board.annotationCategories.length === expectedAnnotations.length, `Inspiration Board ${board.id} must support all annotation categories.`);
    assert(board.relationships.some((relationship) => relationship.targetId === "DV-03"), `Inspiration Board ${board.id} must link to DV-03.`);
  }
  const websiteBoard = state.inspirationBoards.boards.find((board) => board.id === "inspiration-board-website");
  assert(websiteBoard, "Website Inspiration Board must exist.");
  assert(websiteBoard.owner === "Brand Direction", "Website Inspiration Board must be a Brand Reference Board.");
  assert(websiteBoard.status === "In Review", "Website Inspiration Board should begin In Review for approved noveris.life references.");

  assert(exists("app/experience-design/page.tsx"), "Experience Design dashboard route is missing.");
  assert(exists("app/experience-design/[section]/page.tsx"), "Experience Design section route is missing.");
  assert(read("components/app-shell.tsx").includes('id: "experience-design"'), "Sidebar must expose Experience Design as a primary workspace.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/bible"'), "Sidebar must link to Experience Bible.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/inspiration-boards"'), "Sidebar must link to Inspiration Boards.");
  assert(read("app/experience-design/[section]/page.tsx").includes('redirect("/experience-design/inspiration-boards")'), "Old mood board route must redirect to Inspiration Boards.");
  assert(read("components/studio-command-palette.tsx").includes("Open Experience Design"), "Command palette must expose Experience Design.");
  assert(read("components/studio-command-palette.tsx").includes("Open Inspiration Boards"), "Command palette must expose Inspiration Boards.");
  assert(read("components/experience-design-workspace.tsx").includes("InspirationBoardsWorkspace"), "Experience Design workspace must expose Inspiration Boards workspace.");

  const search = await searchStudio("Inspiration Boards", 10);
  assert(search.results.some((result) => result.type === "Experience Design" && /Inspiration Boards|Inspiration Board/i.test(result.title)), "Global search must return Experience Design Inspiration Board results.");
  assert(search.diagnostics.sourceCollections.includes("experience design"), "Global search diagnostics must include Experience Design source collection.");
  const bibleSearch = await searchStudio("Technology serves humanity", 20);
  assert(bibleSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/bible/chapter/core-creative-philosophy"), "Global search must return authored Experience Bible philosophy content.");
  const signatureSearch = await searchStudio("The NOVERIS Signature", 20);
  assert(signatureSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/bible#dv-02c-noveris-signature"), "Global search must return DV-02C NOVERIS Signature content.");
  const visualDnaSearch = await searchStudio("Deep Space Navy", 20);
  assert(visualDnaSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/bible#dv-03-visual-dna"), "Global search must return DV-03 Visual DNA content.");
  const nasaSearch = await searchStudio("NASA", 20);
  assert(nasaSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/inspiration-boards")), "Global search must return NASA Inspiration Board content.");
  const boardSearch = await searchStudio("Light Represents Progress", 20);
  assert(boardSearch.results.some((result) => result.type === "Experience Design" && result.href.includes("/experience-design/inspiration-boards")), "Global search must return signature-tagged Inspiration Board content.");

  const canonicalRuntime = await buildCanonicalRuntimeExportPayload();
  assertNoExperienceRuntimeLeak("Canonical runtime", canonicalRuntime);

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineExports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of engineExports.entries()) {
    assert(engineExport.metadata.validationStatus === "Ready", `${targets[index]} export must remain Ready.`);
    assertNoExperienceRuntimeLeak(`${targets[index]} export`, engineExport);
  }

  console.log(JSON.stringify({
    ok: true,
    frameworkId: state.frameworkId,
    version: state.version,
    sections: state.sections.length,
    contentModels: state.contentModels.length,
    records: state.records.length,
    reviewWorkflow: state.reviewWorkflow,
    searchReturned: search.returned,
    bibleSearchReturned: bibleSearch.returned,
    signatureSearchReturned: signatureSearch.returned,
    visualDnaSearchReturned: visualDnaSearch.returned,
    inspirationBoards: {
      categories: state.inspirationBoards.categories.length,
      boards: state.inspirationBoards.boards.length,
      annotations: state.inspirationBoards.annotationCategories.length,
      viewModes: state.inspirationBoards.viewModes
    },
    inspirationSearchReturned: search.returned,
    nasaSearchReturned: nasaSearch.returned,
    boardSearchReturned: boardSearch.returned,
    runtimePublishing: state.runtimePublishing,
    engineExports: Object.fromEntries(engineExports.map((engineExport, index) => [targets[index], engineExport.metadata.validationStatus]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
