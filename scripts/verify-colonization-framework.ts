import { validateColonizationFramework } from "@/lib/colonization/framework";
import { buildGameEngineExport, getEngineTargets } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion, getGameRuntimeData } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertFramework(framework: Awaited<ReturnType<typeof getGameRuntimeData>>["colonizationFramework"], label: string) {
  const issues = validateColonizationFramework(framework);
  const errors = issues.filter((issue) => issue.severity === "error");
  assert(errors.length === 0, `${label} colonization framework has validation errors: ${errors.map((issue) => `${issue.code}:${issue.records.join(",")}`).join("; ")}`);
  assert(framework.id === "colonization_settlement_framework_v1", `${label} framework ID must be colonization_settlement_framework_v1.`);
  assert(framework.actionSystemId === "canonical_action_system_v1", `${label} must reference the Canonical Action System.`);
  assert(framework.activePlayerStatePolicy.exportsActiveColonies === false, `${label} must not export active player colonies.`);
  assert(framework.activePlayerStatePolicy.exportsProjectQueues === false, `${label} must not export project queues.`);
  assert(framework.resolverContract.id === "resolveColonizationEligibility", `${label} resolver contract missing.`);
  assert(framework.colonyTypeDefinitions.length === 17, `${label} must publish 17 colony type definitions.`);
  assert(framework.colonizationEligibilityDefinitions.length === 7, `${label} must publish seven eligibility states.`);
  assert(framework.colonizationReasonCodes.length >= 11, `${label} must publish canonical reason codes.`);
  assert(framework.colonyProjectPhaseDefinitions.length === 12, `${label} must publish 12 colonization project phases.`);
  assert(framework.colonyResourcePackageDefinitions.length === 5, `${label} must publish five resource packages.`);
  assert(framework.colonyPopulationRequirementDefinitions.length === 17, `${label} must publish population/workforce hooks for every colony type.`);
  assert(framework.colonyInitialStateTemplates.length === 17, `${label} must publish initial state templates for every colony type.`);
  assert(framework.colonyDevelopmentStages.length === 12, `${label} must publish 12 development stages.`);
  assert(framework.colonyFocusDefinitions.length === 14, `${label} must publish 14 colony focuses.`);
  assert(framework.colonyPresentationContract.length === 13, `${label} must publish renderer-independent presentation contracts.`);
  assert(framework.creativeProductionRequirements.some((item) => item.category === "Colonization & Settlements"), `${label} must include Creative Production requirements.`);
  assert(framework.assetLibraryCategories.some((item) => item.id === "colonization_settlements"), `${label} must include Asset Library category metadata.`);
  assert(!/activePlayerColony|projectStartedAt|queueContents|livePlayerPopulation|liveTransferredResources|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} leaked player state or private paths.`);
}

async function main() {
  assert(gameRuntimeContentVersion >= 28, `Runtime contentVersion must be at least 28; received ${gameRuntimeContentVersion}.`);
  const runtime = await getGameRuntimeData();
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(runtime);

  assertFramework(runtime.colonizationFramework, "Internal runtime");
  assertFramework(canonical.colonizationFramework, "Canonical public runtime");
  assertFramework(roblox.colonizationFramework, "Roblox runtime");
  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must remain Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must remain Ready; received ${roblox.metadata.validationStatus}.`);

  const engineSummaries = [];
  for (const target of getEngineTargets()) {
    const exportPayload = await buildGameEngineExport(target.id);
    const framework = exportPayload.canonical.colonization_framework as typeof runtime.colonizationFramework;
    assertFramework(framework, `${target.label} export`);
    assert(exportPayload.validation.status === "Ready", `${target.label} export must remain Ready; received ${exportPayload.validation.status}.`);
    engineSummaries.push({ target: target.id, status: exportPayload.validation.status, colonyTypes: framework.colonyTypeDefinitions.length });
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: canonical.metadata.contentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    frameworkId: canonical.colonizationFramework.id,
    colonyTypes: canonical.colonizationFramework.colonyTypeDefinitions.length,
    phases: canonical.colonizationFramework.colonyProjectPhaseDefinitions.length,
    packages: canonical.colonizationFramework.colonyResourcePackageDefinitions.length,
    missingDefinitions: canonical.colonizationFramework.missingCanonicalDefinitions.map((item) => ({ id: item.id, type: item.type, severity: item.severity })),
    engineSummaries
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
