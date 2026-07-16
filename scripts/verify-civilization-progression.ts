import { canonicalActionSystem } from "@/lib/actions/action-system";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { civilizationProgressionFramework, validateCivilizationProgressionFramework } from "@/lib/civilization/progression-framework";
import { planetDevelopmentFramework } from "@/lib/planets/development-framework";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertFramework(framework: typeof civilizationProgressionFramework, label: string) {
  const actionIds = new Set(canonicalActionSystem.actionDefinitions.map((action) => action.id));
  const issues = validateCivilizationProgressionFramework(framework, actionIds, planetDevelopmentFramework.id).filter((issue) => issue.severity === "error");
  assert(issues.length === 0, `${label} Civilization Progression Framework failed validation: ${issues.map((issue) => issue.message).join("; ")}`);

  assert(framework.id === "civilization_progression_framework_v1", `${label} must publish civilization_progression_framework_v1.`);
  assert(framework.progressionPolicy.xpAllowed === false, `${label} must explicitly forbid XP progression.`);
  assert(framework.progressionPolicy.deterministic === true, `${label} must be deterministic.`);
  assert(framework.progressionPolicy.playerInstancesExported === false, `${label} must not export player progression instances.`);
  assert(framework.actionSystemId === canonicalActionSystem.id, `${label} must reference Canonical Action System.`);
  assert(framework.planetDevelopmentFrameworkId === planetDevelopmentFramework.id, `${label} must reference Planet Development Framework.`);
  assert(framework.civilizationIdentitySource === "civilization_identity", `${label} must reference Civilization Identity source.`);

  const expectedStages = ["survival", "settlement", "planetary", "interplanetary", "interstellar", "galactic", "intergalactic", "ascendant"];
  assert(framework.civilizationStages.map((stage) => stage.id).join("|") === expectedStages.join("|"), `${label} stage order is invalid.`);
  assert(framework.developmentScores.length === 10, `${label} must publish ten development dimensions.`);
  assert(framework.civilizationMilestones.length >= 10, `${label} must publish required milestone examples.`);
  for (const required of ["first_colony", "first_orbital_colony", "first_trade_route", "first_garden_world", "first_terraforming_project", "first_ai_governor", "first_megastructure", "first_million_population", "first_galaxy_survey", "first_civilization_identity_milestone"]) {
    assert(framework.civilizationMilestones.some((milestone) => milestone.id === required), `${label} is missing milestone ${required}.`);
  }
  assert(!/experiencePoints|rpgLevel|currentStage|completedMilestoneIds|playerProgression|playerBalances|\/Users\//i.test(JSON.stringify(framework)), `${label} leaked XP/player state/private paths.`);
}

async function main() {
  assert(gameRuntimeContentVersion >= 27, `Runtime contentVersion must be at least 27; received ${gameRuntimeContentVersion}.`);
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(canonical);

  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must be Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must be Ready; received ${roblox.metadata.validationStatus}.`);
  assertFramework(canonical.civilizationProgressionFramework, "Canonical runtime");
  assertFramework(roblox.civilizationProgressionFramework, "Roblox runtime");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineExports = await Promise.all(targets.map(async (target) => {
    const payload = await buildGameEngineExport(target);
    const modules = payload.canonical as Record<string, unknown>;
    const framework = modules.civilization_progression_framework as typeof civilizationProgressionFramework;
    assert(payload.validation.status === "Ready", `${target} export must remain Ready; received ${payload.validation.status}.`);
    assertFramework(framework, `${target} export`);
    return {
      target,
      validationStatus: payload.validation.status,
      stages: framework.civilizationStages.length,
      milestones: framework.civilizationMilestones.length,
      dimensions: framework.developmentScores.length
    };
  }));

  console.log(JSON.stringify({
    contentVersion: gameRuntimeContentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    framework: {
      id: canonical.civilizationProgressionFramework.id,
      stages: canonical.civilizationProgressionFramework.civilizationStages.map((stage) => stage.id),
      milestones: canonical.civilizationProgressionFramework.civilizationMilestones.map((milestone) => milestone.id),
      dimensions: canonical.civilizationProgressionFramework.developmentScores.map((dimension) => dimension.id),
      presentationContracts: canonical.civilizationProgressionFramework.civilizationProgressionPresentation.length
    },
    engineExports
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
