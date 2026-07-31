import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, getGameRuntimeData, validateGameRuntimeData } from "@/lib/runtime/game-runtime";
import { buildCreaturePromptBatchExport, compileCreaturePrompt, creaturePromptBatchActions, creaturePromptLifecycleStages, creaturePromptModelProfiles, creaturePromptOutputTypes, creaturePromptTypeTemplates, validateCreaturePrompt, validateCreatureSystem } from "@/lib/life/creature-system";

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
  const requiredTemplateGroups = {
    biological: ["mammalian", "avian", "reptilian", "amphibian", "fishlike", "arthropod", "insectoid", "arachnid", "crustacean", "molluscoid", "cephalopod", "wormlike", "jellyform", "echinoderm-like", "dinosaurian", "megafauna", "microfauna", "microorganism", "colonial-organism"],
    habitat: ["terrestrial", "aquatic", "amphibious", "aerial", "gliding", "arboreal", "burrowing", "subterranean", "cave-dwelling", "atmospheric", "floating", "deep-ocean", "coastal", "riverine", "polar", "desert", "volcanic", "cryogenic", "high-gravity", "low-gravity", "vacuum-adapted", "orbital"],
    exotic: ["silicon-based", "crystal-life", "mineral-life", "plasma-life", "gas-life", "energy-life", "electromagnetic-life", "photonic-life", "quantum-life", "radiotrophic-life", "cryogenic-life", "sulfur-based", "methane-based", "ammonia-based", "hive-organism", "distributed-organism", "symbiotic-colony", "mycelial-organism", "biomechanical-life", "synthetic-life", "robotic-organism", "nanite-colony", "engineered-organism", "artificial-life-organism", "ai-organism"],
    intelligence: ["non-sapient", "pre-sapient", "sapient", "hive-intelligence", "collective-intelligence", "machine-intelligence"],
    lifecycle: [...creaturePromptLifecycleStages]
  };
  const missingTemplates = Object.entries(requiredTemplateGroups).flatMap(([group, values]) => {
    const templateValues = creaturePromptTypeTemplates[group as keyof typeof creaturePromptTypeTemplates] as readonly string[];
    return values.filter((value) => !templateValues.includes(value)).map((value) => `${group}:${value}`);
  });
  const batchSmoke = creaturePromptBatchActions.map((action) => ({ action, records: buildCreaturePromptBatchExport(action, runtime.species).records.length }));
  if (missingTemplates.length || batchSmoke.some((batch) => batch.records === 0)) {
    console.error(JSON.stringify({ missingTemplates, batchSmoke }, null, 2));
    process.exitCode = 1;
    return;
  }
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
    promptBatchActions: creaturePromptBatchActions.length,
    lifecycleStages: creaturePromptLifecycleStages.length,
    templateGroups: Object.fromEntries(Object.entries(creaturePromptTypeTemplates).map(([key, values]) => [key, values.length])),
    engineTargets: targets,
    runtimeValidation: validation.status,
    contentVersion: runtime.metadata.contentVersion,
    checksum: runtime.metadata.checksum
  }, null, 2));
}

void main();
