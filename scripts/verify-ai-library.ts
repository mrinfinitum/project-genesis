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
  assert(canonicalAiLibraryAgents.length === 75, "Volume I must contain 75 agents.");
  assert(canonicalAiLibraryAgents.every((agent) => agent.max_level === 50), "Every Foundation AI must use the level 50 cap.");
  assert(!canonicalAiLibraryAgents.some((agent) => ["Ancient", "Genesis", "Mythic", "Singularity"].includes(agent.rarity)), "Volume I contains a forbidden high-tier rarity.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  const runtimeValidation = validateGameRuntimeData(runtime);
  assert(runtime.aiLibrary.length === 75, "Canonical runtime must export 75 AI Library records.");
  assert(runtime.aiCategories.length === aiLibraryCategories.length, "Canonical runtime category catalog is incomplete.");
  assert(runtime.aiRarity.length === aiLibraryRarities.length, "Canonical runtime rarity catalog is incomplete.");
  assert(runtimeValidation.status === "Ready", runtimeValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const roblox = buildRobloxRuntimePayload(runtime);
  const robloxValidation = validateRobloxRuntimePayload(roblox);
  assert(roblox.aiLibrary.length === 75, "Roblox runtime must export 75 AI Library records.");
  assert(robloxValidation.status === "Ready", robloxValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  for (const target of targets) {
    const payload = await buildGameEngineExport(target);
    assert(payload.validation.status === "Ready", `${target} export is not Ready.`);
    assert(Array.isArray(payload.canonical.ai_library) && payload.canonical.ai_library.length === 75, `${target} export is missing the canonical AI Library.`);
  }

  const exported = JSON.parse(await readFile(path.join(process.cwd(), "data", "ai-agents", "exports", "ai_library.json"), "utf8")) as unknown[];
  assert(exported.length === 75, "Generated ai_library.json must contain 75 records.");
  console.log(JSON.stringify({ status: "Ready", agents: 75, categories: aiLibraryCategories.length, rarities: aiLibraryRarities.length, engineExports: targets.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
