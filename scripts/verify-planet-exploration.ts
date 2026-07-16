import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { planetExplorationProgression, timeActionContract, validatePlanetExplorationProgression, validateTimeActionContract } from "@/lib/planets/exploration-progression";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";

type ExplorationPayload = {
  timeActionContract?: typeof timeActionContract;
  planetExplorationProgression?: typeof planetExplorationProgression;
};

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function validatePayload(payload: ExplorationPayload, label: string) {
  assert(payload.timeActionContract?.id === "time_action_contract_v1", `${label} is missing Time Action Contract.`);
  assert(payload.planetExplorationProgression?.id === "planet_exploration_progression_v1", `${label} is missing Planet Exploration Progression.`);
  const currentTimeActionContract = payload.timeActionContract;
  const currentPlanetExplorationProgression = payload.planetExplorationProgression;
  if (!currentTimeActionContract || !currentPlanetExplorationProgression) {
    throw new Error(`${label} is missing required exploration runtime contracts.`);
  }
  const issues = [
    ...validateTimeActionContract(currentTimeActionContract),
    ...validatePlanetExplorationProgression(currentPlanetExplorationProgression, currentTimeActionContract)
  ].filter((issue) => issue.severity === "error");
  assert(issues.length === 0, `${label} exploration contract validation failed: ${issues.map((issue) => issue.message).join("; ")}`);

  const preSurvey = currentPlanetExplorationProgression.visibilityRules.filter((rule) => ["unknown", "detected", "probed"].includes(rule.stageId));
  assert(preSurvey.every((rule) => !rule.canShowCivilizationSuitabilityIndex && !rule.canShowStrategicValueIndex && !rule.canShowNickname && !rule.canShowRecommendedUses && !rule.canShowAvailableActions), `${label} reveals evaluation data before Surveyed.`);
  const surveyed = currentPlanetExplorationProgression.visibilityRules.find((rule) => rule.stageId === "surveyed");
  assert(surveyed?.canShowCivilizationSuitabilityIndex && surveyed.canShowStrategicValueIndex && surveyed.canShowNickname && surveyed.canShowRecommendedUses && surveyed.canShowAvailableActions, `${label} Surveyed stage does not reveal evaluation data.`);
  assert(currentTimeActionContract.accelerationPolicy.premiumCrystals.policy === "accelerate_only", `${label} Premium Crystals must accelerate only.`);
  assert(currentTimeActionContract.accelerationPolicy.premiumCrystals.canUnlockUnavailableActions === false, `${label} Premium Crystals must not bypass technology requirements.`);
  assert(currentPlanetExplorationProgression.timedActions.every((action) => action.timeActionContractId === currentTimeActionContract.id), `${label} has exploration actions that do not reference Time Action Contract.`);
}

async function main() {
  assert(gameRuntimeContentVersion >= 23, `Runtime contentVersion must be at least 23; received ${gameRuntimeContentVersion}.`);
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(canonical);

  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must be Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must be Ready; received ${roblox.metadata.validationStatus}.`);
  validatePayload(canonical, "Canonical runtime");
  validatePayload(roblox, "Roblox runtime");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineExports = await Promise.all(targets.map(async (target) => {
    const payload = await buildGameEngineExport(target);
    const canonicalModules = payload.canonical as Record<string, unknown>;
    validatePayload({
      timeActionContract: canonicalModules.time_action_contract as typeof timeActionContract,
      planetExplorationProgression: canonicalModules.planet_exploration_progression as typeof planetExplorationProgression
    }, `${target} export`);
    assert(payload.validation.status === "Ready", `${target} export must remain Ready; received ${payload.validation.status}.`);
    return {
      target,
      validationStatus: payload.validation.status,
      timeActionContractId: (canonicalModules.time_action_contract as { id?: string }).id,
      stageCount: ((canonicalModules.planet_exploration_progression as { pipeline?: unknown[] }).pipeline ?? []).length,
      timedActionCount: ((canonicalModules.planet_exploration_progression as { timedActions?: unknown[] }).timedActions ?? []).length
    };
  }));

  console.log(JSON.stringify({
    contentVersion: gameRuntimeContentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    architectureDecision: timeActionContract.decisionTitle,
    timeActionContract: {
      id: timeActionContract.id,
      states: timeActionContract.stateMachine,
      premiumCrystalPolicy: timeActionContract.accelerationPolicy.premiumCrystals.policy,
      futureSystemScopes: timeActionContract.futureSystemScopes
    },
    planetExplorationProgression: {
      id: planetExplorationProgression.id,
      pipeline: planetExplorationProgression.pipeline.map((stage) => stage.id),
      timedActions: planetExplorationProgression.timedActions.map((action) => ({
        id: action.id,
        baseDurationSeconds: action.baseDurationSeconds,
        minimumDurationSeconds: action.minimumDurationSeconds,
        maximumDurationSeconds: action.maximumDurationSeconds,
        requiresSurveyComplete: action.requiresSurveyComplete
      })),
      nicknameRuleCount: planetExplorationProgression.nicknameRules.length
    },
    engineExports
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
