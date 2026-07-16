import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion, getGameRuntimeData } from "@/lib/runtime/game-runtime";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { validateMissionExpeditionFramework } from "@/lib/missions/framework";

const supportedTargets: EngineTarget[] = ["roblox", "unity", "unreal", "godot", "web", "generic"];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertFramework(framework: Awaited<ReturnType<typeof getGameRuntimeData>>["missionExpeditionFramework"], label: string) {
  const issues = validateMissionExpeditionFramework(framework);
  const errors = issues.filter((issue) => issue.severity === "error");
  assert(!errors.length, `${label} has Mission & Expedition validation errors: ${errors.map((issue) => `${issue.code}: ${issue.message}`).join("; ")}`);
  assert(framework.id === "mission_expedition_framework_v1", `${label} framework id must be stable.`);
  assert(framework.missionTypeDefinitions.length === 10, `${label} must publish 10 mission type definitions.`);
  assert(framework.expeditionScopeDefinitions.length === 6, `${label} must publish 6 expedition scopes.`);
  assert(framework.missionLifecycleStateDefinitions.length === 10, `${label} must publish 10 mission lifecycle states.`);
  assert(framework.expeditionLifecycleStateDefinitions.length === 11, `${label} must publish 11 expedition lifecycle states.`);
  assert(framework.missionObjectiveContractDefinitions.length === 20, `${label} must publish 20 objective contracts.`);
  assert(framework.missionRewardContractDefinitions.length === 12, `${label} must publish 12 reward contracts.`);
  assert(framework.missionTemplateDefinitions.length === 6, `${label} must publish 6 starter mission templates.`);
  assert(framework.expeditionRequirementDefinitions.length === 5, `${label} must publish 5 expedition requirement definitions.`);
  assert(framework.expeditionRiskDefinitions.length === 3, `${label} must publish 3 expedition risk definitions.`);
  assert(framework.integrationHooks.length === 9, `${label} must publish integration hooks for all dependent systems.`);
  assert(framework.activePlayerStatePolicy.exportsAcceptedMissions === false, `${label} must not export accepted missions.`);
  assert(framework.activePlayerStatePolicy.exportsActiveExpeditions === false, `${label} must not export active expeditions.`);
  assert(framework.activePlayerStatePolicy.exportsObjectiveProgress === false, `${label} must not export objective progress.`);
  assert(framework.activePlayerStatePolicy.exportsRewardClaims === false, `${label} must not export reward claims.`);
  assert(!/"(?:acceptedMissionRecords|activeExpeditionRecords|objectiveProgressRecords|rewardClaimRecords|crewAssignmentRecords|playerMissionHistoryRecords)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} leaked player mission state or private paths.`);
}

async function main() {
  assert(gameRuntimeContentVersion >= 30, `Runtime contentVersion must be at least 30; received ${gameRuntimeContentVersion}.`);
  const runtime = await getGameRuntimeData();
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(runtime);

  assertFramework(runtime.missionExpeditionFramework, "Internal runtime");
  assertFramework(canonical.missionExpeditionFramework, "Canonical public runtime");
  assertFramework(roblox.missionExpeditionFramework, "Roblox runtime");

  const engineSummaries = [];
  for (const target of supportedTargets) {
    const exportPayload = await buildGameEngineExport(target);
    assert(exportPayload.validation.status === "Ready", `${target} export must remain Ready.`);
    const framework = exportPayload.canonical.mission_expedition_framework as typeof runtime.missionExpeditionFramework;
    assertFramework(framework, `${target} engine export`);
    engineSummaries.push({
      target,
      status: exportPayload.validation.status,
      missionTypes: framework.missionTypeDefinitions.length,
      expeditionScopes: framework.expeditionScopeDefinitions.length,
      templates: framework.missionTemplateDefinitions.length
    });
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: canonical.metadata.contentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    frameworkId: canonical.missionExpeditionFramework.id,
    missionTypes: canonical.missionExpeditionFramework.missionTypeDefinitions.length,
    expeditionScopes: canonical.missionExpeditionFramework.expeditionScopeDefinitions.length,
    objectiveContracts: canonical.missionExpeditionFramework.missionObjectiveContractDefinitions.length,
    rewardContracts: canonical.missionExpeditionFramework.missionRewardContractDefinitions.length,
    templates: canonical.missionExpeditionFramework.missionTemplateDefinitions.length,
    requirements: canonical.missionExpeditionFramework.expeditionRequirementDefinitions.length,
    risks: canonical.missionExpeditionFramework.expeditionRiskDefinitions.length,
    missingDefinitions: canonical.missionExpeditionFramework.missingCanonicalDefinitions,
    engineSummaries
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
