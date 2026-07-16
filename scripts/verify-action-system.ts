import { canonicalActionSystem, validateActionSystem } from "@/lib/actions/action-system";
import { timeActionContract } from "@/lib/planets/exploration-progression";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";

type ActionSystemPayload = {
  timeActionContract?: typeof timeActionContract;
  actionSystem?: typeof canonicalActionSystem;
};

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function validatePayload(payload: ActionSystemPayload, label: string) {
  assert(payload.timeActionContract?.id === "time_action_contract_v1", `${label} is missing Time Action Contract.`);
  assert(payload.actionSystem?.id === "canonical_action_system_v1", `${label} is missing Canonical Action System.`);
  const timeContract = payload.timeActionContract;
  const actionSystem = payload.actionSystem;
  if (!timeContract || !actionSystem) throw new Error(`${label} is missing required action contracts.`);

  const issues = validateActionSystem(actionSystem, timeContract).filter((issue) => issue.severity === "error");
  assert(issues.length === 0, `${label} action system validation failed: ${issues.map((issue) => issue.message).join("; ")}`);

  const stateIds = actionSystem.actionStates.map((state) => state.id);
  assert(stateIds.join("|") === "idle|queued|waiting|preparing|running|paused|blocked|failed|cancelled|completed|archived", `${label} action state machine is invalid.`);
  assert(actionSystem.actionDefinitions.length >= 18, `${label} must publish starter gameplay action definitions.`);
  for (const action of actionSystem.actionDefinitions) {
    assert(action.duration.timeActionContractId === timeContract.id, `${label} ${action.id} must reference Time Action Contract.`);
    assert(action.duration.baseDurationSeconds > 0, `${label} ${action.id} must be time based.`);
    assert(action.requirements.length > 0, `${label} ${action.id} is missing requirements.`);
    assert(action.outputs.length > 0, `${label} ${action.id} is missing outputs.`);
    assert(action.queueBehavior.queueRuleId, `${label} ${action.id} is missing queue rule.`);
    assert(action.automation.automationRules.length > 0, `${label} ${action.id} is missing automation rules.`);
    assert(action.history.started && action.history.completed && action.history.cancelled && action.history.failed && action.history.accelerated && action.history.automated, `${label} ${action.id} is missing history coverage.`);
    assert(action.modifiers.premiumCrystalAcceleration.policy === "accelerate_only", `${label} ${action.id} Premium Crystal policy must be accelerate_only.`);
    assert(action.modifiers.premiumCrystalAcceleration.canUnlockUnavailableActions === false, `${label} ${action.id} Premium Crystals must not bypass requirements.`);
  }
}

async function main() {
  assert(gameRuntimeContentVersion >= 24, `Runtime contentVersion must be at least 24; received ${gameRuntimeContentVersion}.`);
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(canonical);

  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must be Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must be Ready; received ${roblox.metadata.validationStatus}.`);
  validatePayload(canonical, "Canonical runtime");
  validatePayload(roblox, "Roblox runtime");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineExports = await Promise.all(targets.map(async (target) => {
    const payload = await buildGameEngineExport(target);
    const modules = payload.canonical as Record<string, unknown>;
    validatePayload({
      timeActionContract: modules.time_action_contract as typeof timeActionContract,
      actionSystem: modules.action_system as typeof canonicalActionSystem
    }, `${target} export`);
    assert(payload.validation.status === "Ready", `${target} export must remain Ready; received ${payload.validation.status}.`);
    return {
      target,
      validationStatus: payload.validation.status,
      actionCount: ((modules.action_system as { actionDefinitions?: unknown[] }).actionDefinitions ?? []).length,
      stateCount: ((modules.action_system as { actionStates?: unknown[] }).actionStates ?? []).length,
      queueRuleCount: ((modules.action_system as { actionQueueRules?: unknown[] }).actionQueueRules ?? []).length
    };
  }));

  console.log(JSON.stringify({
    contentVersion: gameRuntimeContentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    architectureDecision: canonicalActionSystem.architectureDecisionId,
    actionSystem: {
      id: canonicalActionSystem.id,
      categories: canonicalActionSystem.actionCategories.length,
      states: canonicalActionSystem.actionStates.map((state) => state.id),
      actions: canonicalActionSystem.actionDefinitions.map((action) => action.id),
      queueRules: canonicalActionSystem.actionQueueRules.map((rule) => rule.id),
      accelerationRules: canonicalActionSystem.accelerationRules.length,
      automationRules: canonicalActionSystem.automationRules.length
    },
    engineExports
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
