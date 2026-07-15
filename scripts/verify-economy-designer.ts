import { economyDesignerRouteExists, getEconomyDesignerState } from "@/lib/economy-designer";
import {
  ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS,
  economyDesignerArchitectureCompatibilityStatus,
  validateEconomyDesignerRuntimeCompatibility
} from "@/lib/economy-designer/compatibility";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import type { EconomyDesignerRuntimeCompatibilityInput } from "@/lib/economy-designer/compatibility";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertNoPrivateLeak(payload: unknown) {
  const text = JSON.stringify(payload);
  assert(!/\/Users\/|studio-private:\/\/|SERVICE_ROLE|PRIVATE_KEY|clientSecret|databaseUrl/i.test(text), "Economy Designer leaked private path or secret marker.");
}

function cloneRuntime(input: EconomyDesignerRuntimeCompatibilityInput): EconomyDesignerRuntimeCompatibilityInput {
  return structuredClone(input);
}

function assertCompatibilityIssue(input: EconomyDesignerRuntimeCompatibilityInput, expectedCode: string) {
  const result = validateEconomyDesignerRuntimeCompatibility(input);
  assert(!result.compatible, `${expectedCode} test expected incompatible runtime.`);
  assert(result.issues.some((issue) => issue.code === expectedCode), `${expectedCode} test did not report ${expectedCode}; received ${result.issues.map((issue) => issue.code).join(", ")}.`);
}

function runCompatibilityContractTests(runtime: EconomyDesignerRuntimeCompatibilityInput) {
  for (const contentVersion of [14, 15, 16]) {
    const candidate = cloneRuntime(runtime);
    candidate.metadata.contentVersion = contentVersion;
    const result = validateEconomyDesignerRuntimeCompatibility(candidate);
    assert(result.compatible, `contentVersion ${contentVersion} should pass when economy contracts remain valid: ${result.issues.map((issue) => issue.message).join("; ")}`);
  }

  const stale = cloneRuntime(runtime);
  stale.metadata.contentVersion = 13;
  assertCompatibilityIssue(stale, "content_version_too_old");

  const unsupportedRuntime = cloneRuntime(runtime);
  unsupportedRuntime.metadata.schemaVersion = "game-runtime-v2";
  assertCompatibilityIssue(unsupportedRuntime, "runtime_version_incompatible");

  const missingContracts = cloneRuntime(runtime);
  missingContracts.economyBehaviorContracts = missingContracts.economyBehaviorContracts.slice(0, -1);
  assertCompatibilityIssue(missingContracts, "economy_behavior_contract_count_invalid");

  const missingProducers = cloneRuntime(runtime);
  missingProducers.resourceProducerDefinitions = [];
  assertCompatibilityIssue(missingProducers, "resource_producers_missing");

  const missingEffects = cloneRuntime(runtime);
  missingEffects.buildingResourceEffects = [];
  assertCompatibilityIssue(missingEffects, "building_resource_effects_missing");

  const malformedCalculation = cloneRuntime(runtime);
  malformedCalculation.economyCalculationRules.multiplierOrder = [];
  assertCompatibilityIssue(malformedCalculation, "calculation_order_missing");

  assert(economyDesignerArchitectureCompatibilityStatus(runtime.metadata.architectureVersion) === "compatible", "Current Architecture version should be compatible.");
  assert(economyDesignerArchitectureCompatibilityStatus("1.1.0") === "newer", "Newer Architecture version should be reported for review.");
}

async function main() {
  const [view, runtime] = await Promise.all([getEconomyDesignerState(), buildCanonicalRuntimeExportPayload()]);
  const compatibility = validateEconomyDesignerRuntimeCompatibility(runtime);
  const nodeIds = new Set(view.graph.nodes.map((node) => node.id));
  const duplicateNodeIds = view.graph.nodes.map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index);
  const invalidEdges = view.graph.edges.filter((edge) => !nodeIds.has(edge.from) || !nodeIds.has(edge.to));
  const economyIds = ["ECON-LABOR", "ECON-CREDITS", "ECON-POPULATION", "ECON-RESEARCH", "ECON-PREMIUM-CRYSTALS"];
  const byEconomy = new Map(view.economies.map((economy) => [economy.economyId, economy]));
  const labor = byEconomy.get("ECON-LABOR");
  const credits = byEconomy.get("ECON-CREDITS");
  const population = byEconomy.get("ECON-POPULATION");
  const research = byEconomy.get("ECON-RESEARCH");
  const premium = byEconomy.get("ECON-PREMIUM-CRYSTALS");
  const runtimeSnapshot = JSON.stringify({
    architectureVersion: view.metadata.architectureVersion,
    runtimeVersion: view.metadata.runtimeVersion,
    contentVersion: view.metadata.contentVersion,
    checksum: view.metadata.checksum,
    validationStatus: view.metadata.validationStatus
  });
  const after = await getEconomyDesignerState();

  assert(economyDesignerRouteExists(), "Economy Designer route file is missing.");
  assert(compatibility.compatible, `Economy Designer runtime compatibility failed: ${compatibility.issues.map((issue) => issue.message).join("; ")}`);
  assert(compatibility.architectureStatus === "compatible" || compatibility.architectureStatus === "newer", `Architecture version must be compatible with ${ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.architectureVersion}; received ${view.metadata.architectureVersion}.`);
  assert(view.metadata.runtimeVersion === ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.runtimeVersion, `Runtime version must match ${ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.runtimeVersion}.`);
  assert(view.metadata.contentVersion >= ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.minimumContentVersion, `Economy Designer requires contentVersion >= ${ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.minimumContentVersion}.`);
  assert(view.metadata.validationStatus === "Ready", "Runtime validation must remain Ready.");
  assert(runtime.metadata.validationStatus === "Ready", "Canonical runtime validation must remain Ready.");
  assert(view.metadata.contentVersion === runtime.metadata.contentVersion, "Economy Designer metadata must mirror canonical runtime contentVersion.");
  assert(view.metadata.checksum === runtime.metadata.checksum, "Economy Designer metadata must mirror canonical runtime checksum.");
  runCompatibilityContractTests(runtime);
  assert(view.economies.length === economyIds.length, "Resource Inspector must render all five permanent HUD economies.");
  for (const economyId of economyIds) {
    assert(byEconomy.has(economyId), `Missing inspector for ${economyId}.`);
  }
  assert(labor?.basePassiveRate === 1, "Labor must show base passive +1/sec.");
  assert(labor?.manualProduction.includes("laborPerClick"), "Labor must show manual click formula separately.");
  assert(labor?.aiAgentProduction.includes("aiAgentLaborAssistance"), "Labor must show AI Agent production separately.");
  assert(credits?.basePassiveRate === 0, "Credits must show no default passive fallback.");
  assert(!credits?.producedBy.some((producer) => producer.sourceType === "base_system"), "Credits must not have a default base-system producer.");
  assert(population?.capacityResource === true, "Population must be identified as a capacity resource.");
  assert(population?.integerRules === "Integer only", "Population must stay integer-only.");
  assert(view.populationModel.cards.some((card) => /capacity/i.test(`${card.label} ${card.detail} ${card.value}`)), "Population model must distinguish capacity.");
  assert(view.populationModel.cards.some((card) => /workforce|population/i.test(`${card.label} ${card.detail} ${card.value}`)), "Population model must distinguish workforce/population semantics.");
  assert((research?.producedBy.length ?? 0) > 0, "Research model must expose canonical research producers.");
  assert(research?.basePassiveRate === 0, "Research must not use default passive production.");
  assert(premium?.offlineEligibility === false, "Premium Crystals must not be offline eligible.");
  assert(view.premiumSafety.auditReadiness === "Ready", "Premium Crystal unsafe sources must be flagged and clear.");
  assert(view.premiumSafety.transactionReasons.some((reason) => reason.operation === "purchase" && reason.serverAuthoritativeRequired), "Premium safety view must include server-authoritative purchase reason.");
  assert(duplicateNodeIds.length === 0, `Graph has duplicate node IDs: ${duplicateNodeIds.join(", ")}`);
  assert(invalidEdges.length === 0, `Graph edges reference invalid nodes: ${invalidEdges.map((edge) => edge.id).join(", ")}`);
  assert(view.graph.edges.some((edge) => edge.type === "produces" && edge.to === "node-economy-ECON-LABOR"), "Graph must point producers into Labor.");
  assert(view.graph.edges.some((edge) => edge.type === "consumes" && edge.from === "node-economy-ECON-CREDITS"), "Graph must point Credits into consumers.");
  assert(view.graph.filters.economyIds.length === economyIds.length, "Graph filters must include all five economies.");
  assert(view.graph.nodes.length > view.performance.defaultNodeLimit, "Graph should support progressive loading for the large producer set.");
  assert(view.scopeRollups.some((rule) => rule.visibleInCivilizationHud && /(double|twice|once|do not add)/i.test(rule.doubleCountPrevention)), "Scope rollups must include double-count prevention.");
  assert(view.balanceSandbox.sandboxOnly === true, "Balance sandbox must be Studio-only.");
  assert(view.balanceSandbox.result.multiplierOrder.length > 0, "Sandbox must use canonical multiplier order.");
  assert(view.balanceSandbox.projections.some((projection) => projection.label.includes("offline") && projection.projectedGain["ECON-PREMIUM-CRYSTALS"] === 0), "Offline projection must respect Premium Crystal ineligibility.");
  assert(view.eraTimeline.every((era) => era.displayLabels.some((label) => label.economyId === "ECON-CREDITS")), "Era timeline must keep ECON-CREDITS stable across presentation labels.");
  assert(view.buildingEffects.length > 0, "Building effect inspector must expose structured building effects.");
  assert(view.summary.buildingEffects === view.buildingEffects.length, "Building effect summary must match inspector rows.");
  assert(view.summary.producers > 0, "Producer browser must expose canonical producers.");
  assert(view.summary.unsafePremiumSources === 0, "Premium unsafe source count must be zero.");
  assert(view.metadata.privateDataLeakCheck === "passed", "Economy Designer leak check must pass.");
  assertNoPrivateLeak(view);
  assert(JSON.stringify({
    architectureVersion: after.metadata.architectureVersion,
    runtimeVersion: after.metadata.runtimeVersion,
    contentVersion: after.metadata.contentVersion,
    checksum: after.metadata.checksum,
    validationStatus: after.metadata.validationStatus
  }) === runtimeSnapshot, "Economy Designer sandbox/read model must not mutate runtime metadata.");

  console.log(JSON.stringify({
    ok: true,
    route: "/economy-designer",
    requirements: ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS,
    architectureCompatibility: compatibility.architectureStatus,
    contentVersion: view.metadata.contentVersion,
    checksum: view.metadata.checksum,
    economies: view.economies.length,
    producers: view.summary.producers,
    consumers: view.summary.consumers,
    buildingEffects: view.buildingEffects.length,
    graphNodes: view.graph.nodes.length,
    graphEdges: view.graph.edges.length,
    validationIssues: view.validationIssues.length,
    premiumSafety: view.premiumSafety.auditReadiness,
    sandboxOnly: view.balanceSandbox.sandboxOnly,
    privateDataLeakCheck: view.metadata.privateDataLeakCheck
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
