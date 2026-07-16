import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, getGameRuntimeData } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertWorkforce(framework: Awaited<ReturnType<typeof getGameRuntimeData>>["populationSimulationFramework"], label: string) {
  const roleIds = new Set(framework.populationWorkforceRoleDefinitions.map((role) => role.id));
  const specialistIds = new Set(framework.populationSpecialistRoleDefinitions.map((role) => role.id));
  const educationIds = new Set(framework.populationEducationDefinitions.map((tier) => tier.id));
  const substitutionIds = new Set(framework.automationSubstitutionPolicies.map((policy) => policy.id));
  const actionIds = new Set(framework.actionSystemIntegration.flatMap((hook) => hook.referencedIds));

  const requiredRoleIds = ["general_labor", "engineering", "science", "agriculture", "mining", "manufacturing", "logistics", "trade", "administration", "healthcare", "education", "exploration", "archaeology", "terraforming", "automation_management", "security", "hospitality", "maintenance", "construction", "energy"];
  for (const roleId of requiredRoleIds) assert(roleIds.has(roleId as never), `${label} missing workforce role ${roleId}.`);

  const requiredSpecialists = ["xenobiologist", "planetary_scientist", "archaeologist", "quantum_researcher", "ai_engineer", "logistics_coordinator", "terraforming_specialist", "orbital_engineer", "medical_specialist", "ecological_planner", "trade_negotiator", "artifact_analyst"];
  for (const specialistId of requiredSpecialists) assert(specialistIds.has(specialistId), `${label} missing specialist role ${specialistId}.`);

  for (const role of framework.populationWorkforceRoleDefinitions) {
    assert(role.educationTierIds.every((id) => educationIds.has(id)), `${label} role ${role.id} references missing education tier.`);
    assert(role.substitutionPolicyIds.every((id) => substitutionIds.has(id)), `${label} role ${role.id} references missing substitution policy.`);
    assert(role.shortageReasonCodeIds.length > 0, `${label} role ${role.id} must declare shortage effects.`);
  }

  for (const role of framework.populationSpecialistRoleDefinitions) {
    assert(roleIds.has(role.baseWorkforceRoleId), `${label} specialist ${role.id} base role does not resolve.`);
    assert(role.supportedActionIds.length > 0, `${label} specialist ${role.id} must support canonical Actions.`);
  }

  for (const requiredAction of ["assign_workforce", "reassign_workforce", "train_specialist", "retrain_population", "transfer_population", "transport_colonists", "expand_housing", "establish_education_program", "establish_healthcare_program", "deploy_robotic_workforce"]) {
    assert(actionIds.has(requiredAction), `${label} action integration missing ${requiredAction}.`);
  }

  for (const policy of framework.automationSubstitutionPolicies) {
    assert(policy.canBypassTechnology === false, `${label} automation policy ${policy.id} must not bypass technology.`);
    assert(policy.canBypassSpecialists === false, `${label} automation policy ${policy.id} must not bypass specialists.`);
    assert(policy.canBypassCosts === false, `${label} automation policy ${policy.id} must not bypass costs.`);
    assert(policy.canBypassPremiumPermissions === false, `${label} automation policy ${policy.id} must not bypass premium permissions.`);
  }

  for (const assignment of framework.workforceAssignmentDefinitions) {
    assert(assignment.gameOwnsAssignments === true, `${label} workforce assignment ${assignment.id} must be Game-owned.`);
    assert(assignment.actionIds.length > 0, `${label} workforce assignment ${assignment.id} must reference Actions.`);
  }
}

async function main() {
  const runtime = await getGameRuntimeData();
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(runtime);

  assertWorkforce(runtime.populationSimulationFramework, "Internal runtime");
  assertWorkforce(canonical.populationSimulationFramework, "Canonical public runtime");
  assertWorkforce(roblox.populationSimulationFramework, "Roblox runtime");

  console.log(JSON.stringify({
    ok: true,
    contentVersion: canonical.metadata.contentVersion,
    workforceRoles: canonical.populationSimulationFramework.populationWorkforceRoleDefinitions.map((role) => role.id),
    specialistRoles: canonical.populationSimulationFramework.populationSpecialistRoleDefinitions.map((role) => role.id),
    assignmentModes: canonical.populationSimulationFramework.workforceAssignmentDefinitions.map((definition) => definition.id),
    automationPolicies: canonical.populationSimulationFramework.automationSubstitutionPolicies.map((policy) => policy.id)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
