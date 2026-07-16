import { canonicalActionSystem, validateActionSystem } from "@/lib/actions/action-system";
import { timeActionContract } from "@/lib/planets/exploration-progression";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";

type ActionSystemPayload = {
  timeActionContract?: typeof timeActionContract;
  actionSystem?: typeof canonicalActionSystem;
};

const expectedStates = ["unavailable", "ready", "queued", "waiting", "preparing", "in_progress", "paused", "blocked", "completed", "failed", "cancelled", "archived"];
const requiredActions = ["send_probe", "probe_travel", "probe_scan", "survey_planet", "catalog_planet", "analyze_anomaly", "analyze_artifact", "excavate_ruin", "prepare_colony", "establish_colony", "build_mining_outpost", "deploy_automated_extraction", "build_gas_harvest_platform", "build_ocean_harvest_platform", "build_research_station", "build_archaeological_camp", "build_orbital_refinery", "designate_preserve", "begin_terraforming_study", "terraform_planet_stage", "conduct_research", "construct_building", "upgrade_building", "manufacture_item", "transfer_resources", "establish_trade_route", "travel_to_destination"];
const requiredPresentationContracts = ["ActionCard", "ActionQueue", "ActionProgress", "ActionPhaseStepper", "ActionRequirementList", "ActionInputSummary", "ActionOutputSummary", "ActionModifierBreakdown", "ActionAccelerationPrompt", "ActionCompletionNotification", "ActionHistoryEntry"];
const requiredQueueScopes = ["global", "civilization", "colony", "planet", "research", "construction", "probe", "survey", "manufacturing", "logistics"];

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertNoPlayerStateLeak(value: unknown, label: string) {
  const text = JSON.stringify(value);
  assert(!/"activeTimers"\s*:|activePlayerAction|queueContents|playerBalances|startedAt|completedAt|localPersistence|cloudPersistence/.test(text), `${label} leaked player-owned action state.`);
}

function validatePayload(payload: ActionSystemPayload, label: string) {
  assert(payload.timeActionContract?.id === "time_action_contract_v1", `${label} is missing Time Action Contract.`);
  assert(payload.actionSystem?.id === "canonical_action_system_v1", `${label} is missing Canonical Action System.`);
  const timeContract = payload.timeActionContract;
  const actionSystem = payload.actionSystem;
  if (!timeContract || !actionSystem) throw new Error(`${label} is missing required action contracts.`);

  const issues = validateActionSystem(actionSystem, timeContract).filter((issue) => issue.severity === "error");
  assert(issues.length === 0, `${label} action system validation failed: ${issues.map((issue) => issue.message).join("; ")}`);
  assert(actionSystem.architectureDecisionId === "ARCH-DECISION-CANONICAL-ACTION-FRAMEWORK", `${label} must reference the canonical action architecture decision.`);
  assert(actionSystem.actionStates.map((state) => state.id).join("|") === expectedStates.join("|"), `${label} action state machine is invalid.`);
  assert(actionSystem.actionCategories.length >= 28, `${label} must publish all canonical action categories.`);
  assert(actionSystem.actionDurationDefinitions.length >= 5, `${label} must publish reusable duration definitions.`);
  assert(actionSystem.actionPhaseTemplates.length >= 12, `${label} must publish phase templates.`);
  assert(actionSystem.actionAccelerationPolicies.length === 4, `${label} must publish four protected acceleration policies.`);
  assert(actionSystem.actionAutomationPolicies.length >= 4, `${label} must publish automation policies.`);
  assert(actionSystem.actionPresentationContracts.length === requiredPresentationContracts.length, `${label} must publish renderer-independent presentation contracts.`);

  const actionIds = new Set(actionSystem.actionDefinitions.map((action) => action.id));
  for (const actionId of requiredActions) {
    assert(actionIds.has(actionId), `${label} is missing required action ${actionId}.`);
  }
  const presentationIds = new Set(actionSystem.actionPresentationContracts.map((contract) => contract.id));
  for (const presentationId of requiredPresentationContracts) {
    assert(presentationIds.has(presentationId as never), `${label} is missing presentation contract ${presentationId}.`);
  }
  const queueScopes = new Set(actionSystem.actionQueueRules.map((rule) => rule.queueScope));
  for (const queueScope of requiredQueueScopes) {
    assert(queueScopes.has(queueScope as never), `${label} is missing ${queueScope} queue policy.`);
  }
  for (const policy of actionSystem.actionAccelerationPolicies) {
    assert(policy.serverAuthoritativeBalance, `${label} ${policy.id} must require server-authoritative balance.`);
    assert(policy.serverCalculatedCost, `${label} ${policy.id} must require server-calculated cost.`);
    assert(policy.idempotencyRequired, `${label} ${policy.id} must require idempotency.`);
    assert(policy.minimumDurationClamp, `${label} ${policy.id} must enforce minimum-duration clamp.`);
    assert(policy.canBypassRequirements === false, `${label} ${policy.id} must not bypass requirements.`);
  }
  for (const action of actionSystem.actionDefinitions) {
    assert(!action.id.startsWith("action_"), `${label} ${action.id} must use the stable canonical action ID without action_ prefix.`);
    assert(action.duration.timeActionContractId === timeContract.id, `${label} ${action.id} must reference Time Action Contract.`);
    assert(action.duration.baseDurationSeconds > 0, `${label} ${action.id} must be time based.`);
    assert(action.requirements.length > 0, `${label} ${action.id} is missing requirements.`);
    assert(action.requirements.every((requirement) => Boolean(requirement.reasonCode)), `${label} ${action.id} requirements must expose reason codes.`);
    assert(action.outputs.length > 0, `${label} ${action.id} is missing outputs.`);
    assert(action.phases.length > 0, `${label} ${action.id} is missing phases.`);
    assert(action.queueBehavior.queueRuleId, `${label} ${action.id} is missing queue rule.`);
    assert(action.concurrency.concurrencyPolicyId, `${label} ${action.id} is missing concurrency policy.`);
    assert(action.automation.automationRules.length > 0, `${label} ${action.id} is missing automation rules.`);
    assert(action.automation.premiumSpendPermission === "never" || action.automation.premiumSpendPermission === "explicit_player_authorization", `${label} ${action.id} has unsafe Premium Crystal automation permission.`);
    assert(action.history.started && action.history.completed && action.history.cancelled && action.history.failed && action.history.accelerated && action.history.automated, `${label} ${action.id} is missing history coverage.`);
    assert(action.modifiers.premiumCrystalAcceleration.policy === "accelerate_only", `${label} ${action.id} Premium Crystal policy must be accelerate_only.`);
    assert(action.modifiers.premiumCrystalAcceleration.canUnlockUnavailableActions === false, `${label} ${action.id} Premium Crystals must not bypass requirements.`);
    assert(action.publicationStatus === "approved" || action.publicationStatus === "provisional", `${label} ${action.id} must be approved or explicitly provisional.`);
  }
  assertNoPlayerStateLeak(actionSystem, label);
}

async function main() {
  assert(gameRuntimeContentVersion >= 25, `Runtime contentVersion must be at least 25; received ${gameRuntimeContentVersion}.`);
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
      queueRuleCount: ((modules.action_system as { actionQueueRules?: unknown[] }).actionQueueRules ?? []).length,
      presentationContractCount: ((modules.action_system as { actionPresentationContracts?: unknown[] }).actionPresentationContracts ?? []).length
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
      accelerationPolicies: canonicalActionSystem.actionAccelerationPolicies.map((policy) => policy.id),
      automationPolicies: canonicalActionSystem.actionAutomationPolicies.map((policy) => policy.id),
      presentationContracts: canonicalActionSystem.actionPresentationContracts.map((contract) => contract.id)
    },
    engineExports
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
