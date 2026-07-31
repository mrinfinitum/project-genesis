import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, getGameRuntimeData, validateGameRuntimeData } from "@/lib/runtime/game-runtime";
import { compileCreaturePrompt, creaturePromptModelProfiles, creaturePromptOutputTypes, validateCreaturePrompt, validateCreatureSystem } from "@/lib/life/creature-system";

const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const validation = validateGameRuntimeData(runtime);
  const creature = validateCreatureSystem({
    species: runtime.species,
    occurrences: runtime.speciesOccurrences,
    resourceYields: runtime.speciesResourceYields,
    artProfiles: runtime.creatureArtProfiles,
    animationProfiles: runtime.creatureAnimationProfiles,
    audioProfiles: runtime.creatureAudioProfiles,
    contract: runtime.creatureGeneratorContract,
    resourceIds: runtime.resources.map((resource) => resource.id)
  });
  const promptIssues = runtime.species.flatMap((species) => creaturePromptOutputTypes.flatMap((outputType) => {
    const prompt = compileCreaturePrompt(species, { outputType });
    return validateCreaturePrompt(prompt, species).issues;
  }));
  if (promptIssues.some((issue) => issue.severity === "error")) {
    console.error(JSON.stringify({ promptIssues }, null, 2));
    process.exitCode = 1;
    return;
  }
  if (validation.status === "Blocked" || creature.status === "Blocked") {
    console.error(JSON.stringify({ runtime: validation, creature }, null, 2));
    process.exitCode = 1;
    return;
  }

  const roblox = buildRobloxRuntimePayload(runtime);
  const exports = await Promise.all(targets.map(async (target) => ({ target, payload: await buildGameEngineExport(target) })));
  const missingTargets = exports.filter(({ payload }) => !payload.canonical.species || !payload.canonical.creature_generator_contract).map(({ target }) => target);
  if (missingTargets.length || !roblox.species || !roblox.creatureGeneratorContract) {
    console.error(`Creature data missing from exports: ${[...missingTargets, ...(roblox.species ? [] : ["roblox"])].join(", ")}`);
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({
    status: creature.status,
    schemaVersion: runtime.creatureGeneratorContract.schemaVersion,
    generationVersion: runtime.creatureGeneratorContract.generationVersion,
    species: runtime.species.length,
    occurrences: runtime.speciesOccurrences.length,
    resourceYields: runtime.speciesResourceYields.length,
    promptOutputTypes: creaturePromptOutputTypes.length,
    promptModelProfiles: creaturePromptModelProfiles.length,
    engineTargets: targets,
    runtimeValidation: validation.status,
    contentVersion: runtime.metadata.contentVersion,
    checksum: runtime.metadata.checksum
  }, null, 2));
}

void main();
