import { readFile } from "node:fs/promises";
import path from "node:path";
import { aiLibraryCategories, aiLibraryRarities, canonicalAiLibraryAgents, validateCanonicalAiLibrary } from "../lib/ai-agents/foundations";
import { buildGameEngineExport, type EngineTarget } from "../lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, validateGameRuntimeData, validateRobloxRuntimePayload } from "../lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const validation = validateCanonicalAiLibrary();
  assert(validation.status === "Ready", validation.issues.join("\n"));
  assert(canonicalAiLibraryAgents.length === 100, "Volume I must contain 100 agents.");
  assert(Math.min(...canonicalAiLibraryAgents.map((agent) => agent.max_level)) === 40 && Math.max(...canonicalAiLibraryAgents.map((agent) => agent.max_level)) === 150, "Volume I rarity level caps must span 40 through 150.");
  assert(canonicalAiLibraryAgents.filter((agent) => agent.rarity === "Genesis").length === 1, "Volume I must contain exactly one Genesis agent.");

  const expectedCategoryCounts = new Map([
    ["civilization_systems", 25],
    ["exploration_systems", 19],
    ["general_intelligence", 6],
    ["industrial_systems", 18],
    ["scientific_systems", 20],
    ["ancient_intelligence", 11],
    ["genesis_intelligence", 1]
  ]);
  assert(aiLibraryCategories.length === expectedCategoryCounts.size, "Canonical AI Library must contain the seven authored categories.");
  for (const category of aiLibraryCategories) {
    const expectedCount = expectedCategoryCounts.get(category.id);
    assert(expectedCount !== undefined, `Unexpected AI Library category ${category.id}.`);
    assert(canonicalAiLibraryAgents.filter((agent) => agent.category_id === category.id).length === expectedCount, `${category.displayName} must contain ${expectedCount} agents.`);
    assert(category.subcategories.length > 0, `${category.displayName} must define at least one subcategory.`);
    assert(canonicalAiLibraryAgents.filter((agent) => agent.category_id === category.id).every((agent) => category.subcategories.includes(agent.subcategory)), `${category.displayName} contains an agent with an unresolved subcategory.`);
  }

  const runtime = await buildCanonicalRuntimeExportPayload();
  const runtimeValidation = validateGameRuntimeData(runtime);
  assert(runtime.aiLibrary.length === 100, "Canonical runtime must export 100 AI Library records.");
  assert(runtime.aiCategories.length === aiLibraryCategories.length, "Canonical runtime category catalog is incomplete.");
  assert(runtime.aiRarity.length === aiLibraryRarities.length, "Canonical runtime rarity catalog is incomplete.");
  assert(runtimeValidation.status === "Ready", runtimeValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const roblox = buildRobloxRuntimePayload(runtime);
  const robloxValidation = validateRobloxRuntimePayload(roblox);
  assert(roblox.aiLibrary.length === 100, "Roblox runtime must export 100 AI Library records.");
  assert(robloxValidation.status === "Ready", robloxValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  for (const target of targets) {
    const payload = await buildGameEngineExport(target);
    assert(payload.validation.status === "Ready", `${target} export is not Ready.`);
    assert(Array.isArray(payload.canonical.ai_library) && payload.canonical.ai_library.length === 100, `${target} export is missing the canonical AI Library.`);
  }

  const exported = JSON.parse(await readFile(path.join(process.cwd(), "data", "ai-agents", "exports", "ai_library.json"), "utf8")) as unknown[];
  assert(exported.length === 100, "Generated ai_library.json must contain 100 records.");
  console.log(JSON.stringify({ status: "Ready", agents: 100, categories: aiLibraryCategories.length, rarities: aiLibraryRarities.length, engineExports: targets.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
