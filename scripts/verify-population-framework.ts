import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion, getGameRuntimeData } from "@/lib/runtime/game-runtime";
import { validatePopulationSimulationFramework } from "@/lib/population/framework";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertFramework(framework: Awaited<ReturnType<typeof getGameRuntimeData>>["populationSimulationFramework"], label: string) {
  const issues = validatePopulationSimulationFramework(framework);
  const errors = issues.filter((issue) => issue.severity === "error");
  assert(errors.length === 0, `${label} Population Simulation Framework has validation errors: ${errors.map((issue) => `${issue.code}:${issue.records.join(",")}`).join("; ")}`);
  assert(framework.id === "population_simulation_framework_v1", `${label} must publish population_simulation_framework_v1.`);
  assert(framework.populationCategoryDefinitions.length >= 24, `${label} must publish at least 24 population categories.`);
  assert(framework.populationLifeStageDefinitions.length === 7, `${label} must publish exactly seven life stages.`);
  assert(framework.populationWorkforceRoleDefinitions.length === 20, `${label} must publish exactly 20 workforce roles.`);
  assert(framework.populationSpecialistRoleDefinitions.length === 12, `${label} must publish exactly 12 specialist roles.`);
  assert(framework.populationMigrationDefinitions.length === 11, `${label} must publish 11 migration types.`);
  assert(framework.activePlayerStatePolicy.exportsPlayerPopulationValues === false, `${label} must not export player population values.`);
  assert(framework.activePlayerStatePolicy.exportsAssignments === false, `${label} must not export live assignments.`);
  assert(framework.activePlayerStatePolicy.exportsMigrationInstances === false, `${label} must not export migration instances.`);
  assert(framework.populationPresentationContract.length >= 13, `${label} must publish renderer-independent presentation contracts.`);
}

async function main() {
  assert(gameRuntimeContentVersion >= 32, `Runtime contentVersion must be at least 32; received ${gameRuntimeContentVersion}.`);
  const runtime = await getGameRuntimeData();
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(runtime);

  assertFramework(runtime.populationSimulationFramework, "Internal runtime");
  assertFramework(canonical.populationSimulationFramework, "Canonical public runtime");
  assertFramework(roblox.populationSimulationFramework, "Roblox runtime");
  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime must remain Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime must remain Ready; received ${roblox.metadata.validationStatus}.`);

  console.log(JSON.stringify({
    ok: true,
    contentVersion: canonical.metadata.contentVersion,
    checksum: canonical.metadata.checksum,
    frameworkId: canonical.populationSimulationFramework.id,
    categories: canonical.populationSimulationFramework.populationCategoryDefinitions.length,
    lifeStages: canonical.populationSimulationFramework.populationLifeStageDefinitions.length,
    workforceRoles: canonical.populationSimulationFramework.populationWorkforceRoleDefinitions.length,
    specialistRoles: canonical.populationSimulationFramework.populationSpecialistRoleDefinitions.length,
    migrationTypes: canonical.populationSimulationFramework.populationMigrationDefinitions.length,
    presentationContracts: canonical.populationSimulationFramework.populationPresentationContract.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
