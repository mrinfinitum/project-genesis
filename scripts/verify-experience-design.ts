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
  assert(!/"experience_bible"\s*:/.test(text), `${label} leaked Experience Bible model data.`);
  assert(!/"mood_board"\s*:/.test(text), `${label} leaked Mood Board model data.`);
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

  for (const section of ["bible", "mood-boards", "concepts", "screens", "tokens", "materials", "motion", "components", "themes", "brand", "accessibility", "journey", "reviews"]) {
    assert(state.sections.some((item) => item.id === section), `Experience Design section missing ${section}.`);
  }

  assert(exists("app/experience-design/page.tsx"), "Experience Design dashboard route is missing.");
  assert(exists("app/experience-design/[section]/page.tsx"), "Experience Design section route is missing.");
  assert(read("components/app-shell.tsx").includes('id: "experience-design"'), "Sidebar must expose Experience Design as a primary workspace.");
  assert(read("components/app-shell.tsx").includes('href: "/experience-design/bible"'), "Sidebar must link to Experience Bible.");
  assert(read("components/studio-command-palette.tsx").includes("Open Experience Design"), "Command palette must expose Experience Design.");

  const search = await searchStudio("mood board", 10);
  assert(search.results.some((result) => result.type === "Experience Design" && /Mood Boards|Mood Board/i.test(result.title)), "Global search must return Experience Design mood board results.");
  assert(search.diagnostics.sourceCollections.includes("experience design"), "Global search diagnostics must include Experience Design source collection.");
  const bibleSearch = await searchStudio("Technology serves humanity", 20);
  assert(bibleSearch.results.some((result) => result.type === "Experience Design" && result.href === "/experience-design/bible/chapter/core-creative-philosophy"), "Global search must return authored Experience Bible philosophy content.");

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
    runtimePublishing: state.runtimePublishing,
    engineExports: Object.fromEntries(engineExports.map((engineExport, index) => [targets[index], engineExport.metadata.validationStatus]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
