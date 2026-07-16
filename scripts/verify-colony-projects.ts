import { validateColonizationFramework } from "@/lib/colonization/framework";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const framework = runtime.colonizationFramework;
  const issues = validateColonizationFramework(framework);
  const errors = issues.filter((issue) => issue.severity === "error");
  assert(errors.length === 0, `Colonization project validation errors: ${errors.map((issue) => issue.code).join(", ")}`);

  const phaseIds = framework.colonyProjectPhaseDefinitions.map((phase) => phase.id);
  assert(phaseIds.join("|") === "planning|site_selection|resource_allocation|population_assignment|transport_preparation|transit|landing_or_orbital_insertion|site_preparation|initial_habitat_construction|life_support_activation|infrastructure_commissioning|operational", "Colonization phases must stay ordered and complete.");
  for (const phase of framework.colonyProjectPhaseDefinitions) {
    assert(phase.canonicalActionPhaseId, `${phase.id} missing canonical Action phase reference.`);
    assert(phase.durationDefinitionId, `${phase.id} missing duration definition reference.`);
    assert(phase.presentationLabel, `${phase.id} missing presentation label.`);
  }

  for (const packageDefinition of framework.colonyResourcePackageDefinitions) {
    assert(packageDefinition.resourceInputs.length >= 9, `${packageDefinition.id} must include baseline package inputs.`);
    assert(packageDefinition.resourceInputs.every((input) => /^RES-/.test(input.resourceId)), `${packageDefinition.id} package inputs must use Resource Catalog IDs.`);
    assert(packageDefinition.transportRequirementIds.length > 0, `${packageDefinition.id} must reference transport requirements.`);
  }

  for (const requirement of framework.colonyPopulationRequirementDefinitions) {
    assert(Number.isFinite(requirement.minimumFoundingPopulation), `${requirement.id} founding population must be finite.`);
    assert(Number.isFinite(requirement.minimumAssignedWorkforce), `${requirement.id} workforce must be finite.`);
    assert(requirement.automationSubstitutionPolicy.length > 0, `${requirement.id} missing automation substitution policy.`);
  }

  for (const template of framework.colonyInitialStateTemplates) {
    assert(template.operationalStatus === "operational", `${template.id} should describe the canonical post-completion operational state.`);
    assert(template.firstBuildingSetId.endsWith("_starter_set"), `${template.id} must link to a starter set.`);
    assert(template.maintenanceCategoryIds.length >= 5, `${template.id} must include maintenance hooks.`);
    assert(template.hazardModifierIds.length >= 5, `${template.id} must include hazard hooks.`);
  }

  const outcomes = new Set<string>(framework.colonyFailurePolicies.map((policy) => policy.id));
  for (const required of ["completed", "paused", "blocked", "failed", "cancelled", "abandoned", "decommissioned", "evacuated"]) {
    assert(outcomes.has(required), `Missing project outcome policy ${required}.`);
  }
  assert(framework.colonyFailurePolicies.every((policy) => policy.historicalRecord), "Every project outcome must preserve history.");

  const transportMissing = framework.missingCanonicalDefinitions.filter((item) => item.type === "transport");
  assert(transportMissing.length >= 3, "Missing transport classes must be reported for review.");

  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    phaseIds,
    resourcePackages: framework.colonyResourcePackageDefinitions.map((item) => item.id),
    initialTemplates: framework.colonyInitialStateTemplates.length,
    outcomes: [...outcomes],
    missingTransportDefinitions: transportMissing.map((item) => item.id)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
