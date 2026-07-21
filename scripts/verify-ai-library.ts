import { readFile } from "node:fs/promises";
import path from "node:path";
import { aiLibraryCategories, aiLibraryLegacyIdMigrations, aiLibraryRarities, canonicalAiLibraryAgents, resolveCanonicalAiLibraryId, validateCanonicalAiLibrary } from "../lib/ai-agents/foundations";
import { buildGameEngineExport, type EngineTarget } from "../lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, validateGameRuntimeData, validateRobloxRuntimePayload } from "../lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const validation = validateCanonicalAiLibrary();
  assert(validation.status === "Ready", validation.issues.join("\n"));
  assert(canonicalAiLibraryAgents.length === 1000, "AI Library Volumes I-X must contain 1,000 agents.");
  assert(Math.min(...canonicalAiLibraryAgents.map((agent) => agent.max_level)) === 40 && Math.max(...canonicalAiLibraryAgents.map((agent) => agent.max_level)) === 150, "AI Library rarity level caps must span 40 through 150.");
  assert(canonicalAiLibraryAgents.filter((agent) => agent.rarity === "Genesis").length === 10, "AI Library Volumes I-X must contain exactly ten Genesis agents.");
  assert(aiLibraryLegacyIdMigrations.length === 1000, "Packs A and B must publish 1,000 legacy AI ID migrations.");
  assert(resolveCanonicalAiLibraryId("ai_v01_001_nova") === "ai_v01_001_byte_link", "Pack A must migrate the former first Volume I AI ID.");
  assert(resolveCanonicalAiLibraryId("ai_v05_100_lyric_guide") === "ai_v05_100_ledger_system", "Pack A must migrate the former final Volume V AI ID.");
  assert(resolveCanonicalAiLibraryId("ai_v06_001_yield_archive") === "ai_v06_001_margin_steward", "Pack B must migrate the former first Volume VI AI ID.");
  assert(resolveCanonicalAiLibraryId("ai_v10_100_nimbus_nexus") === "ai_v10_100_gaia_system", "Pack B must migrate the former final Volume X AI ID.");

  const expectedCategoryCounts = new Map([
    ["civilization_systems", 100],
    ["exploration_systems", 100],
    ["general_intelligence", 100],
    ["industrial_systems", 100],
    ["scientific_systems", 100],
    ["economic_systems", 100],
    ["logistics_transportation", 100],
    ["medical_population", 100],
    ["government_administration", 100],
    ["environmental_systems", 100]
  ]);
  assert(aiLibraryCategories.length === expectedCategoryCounts.size, "Canonical AI Library must contain the ten authored categories.");
  for (const category of aiLibraryCategories) {
    const expectedCount = expectedCategoryCounts.get(category.id);
    assert(expectedCount !== undefined, `Unexpected AI Library category ${category.id}.`);
    assert(canonicalAiLibraryAgents.filter((agent) => agent.category_id === category.id).length === expectedCount, `${category.displayName} must contain ${expectedCount} agents.`);
    assert(category.subcategories.length > 0, `${category.displayName} must define at least one subcategory.`);
    assert(canonicalAiLibraryAgents.filter((agent) => agent.category_id === category.id).every((agent) => category.subcategories.includes(agent.subcategory)), `${category.displayName} contains an agent with an unresolved subcategory.`);
  }

  const runtime = await buildCanonicalRuntimeExportPayload();
  const runtimeValidation = validateGameRuntimeData(runtime);
  assert(runtime.aiLibrary.length === 1000, "Canonical runtime must export 1,000 AI Library records.");
  assert(runtime.aiCategories.length === aiLibraryCategories.length, "Canonical runtime category catalog is incomplete.");
  assert(runtime.aiRarity.length === aiLibraryRarities.length, "Canonical runtime rarity catalog is incomplete.");
  assert(runtimeValidation.status === "Ready", runtimeValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const roblox = buildRobloxRuntimePayload(runtime);
  const robloxValidation = validateRobloxRuntimePayload(roblox);
  assert(roblox.aiLibrary.length === 1000, "Roblox runtime must export 1,000 AI Library records.");
  assert(robloxValidation.status === "Ready", robloxValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  for (const target of targets) {
    const payload = await buildGameEngineExport(target);
    assert(payload.validation.status === "Ready", `${target} export is not Ready.`);
    assert(Array.isArray(payload.canonical.ai_library) && payload.canonical.ai_library.length === 1000, `${target} export is missing the canonical AI Library.`);
  }

  const exported = JSON.parse(await readFile(path.join(process.cwd(), "data", "ai-agents", "exports", "ai_library.json"), "utf8")) as unknown[];
  assert(exported.length === 1000, "Generated ai_library.json must contain 1,000 records.");
  console.log(JSON.stringify({ status: "Ready", agents: 1000, volumes: 10, categories: aiLibraryCategories.length, rarities: aiLibraryRarities.length, engineExports: targets.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
