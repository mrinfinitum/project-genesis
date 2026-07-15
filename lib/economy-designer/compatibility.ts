import { ARCHITECTURE_VERSION } from "@/lib/architecture/version";
import type { GameRuntimeData } from "@/types/runtime";

export const ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS = {
  architectureVersion: ARCHITECTURE_VERSION,
  runtimeVersion: "game-runtime-v1",
  minimumContentVersion: 14,
  behaviorContractCount: 5
} as const;

export type EconomyDesignerRuntimeCompatibilityIssue = {
  code:
    | "architecture_version_missing"
    | "architecture_version_incompatible"
    | "runtime_version_incompatible"
    | "content_version_missing"
    | "content_version_too_old"
    | "economy_behavior_contract_count_invalid"
    | "resource_producers_missing"
    | "building_resource_effects_missing"
    | "economy_scope_rules_missing"
    | "offline_policies_missing"
    | "calculation_order_missing"
    | "rate_breakdowns_missing"
    | "transaction_reasons_missing";
  message: string;
};

export type EconomyDesignerRuntimeCompatibilityInput = Pick<GameRuntimeData,
  | "metadata"
  | "economyBehaviorContracts"
  | "resourceProducerDefinitions"
  | "buildingResourceEffects"
  | "economyScopeRules"
  | "offlineProgressionPolicies"
  | "economyCalculationRules"
  | "economyRateBreakdownDefinitions"
  | "economyTransactionReasons"
>;

function semanticParts(value: string) {
  const match = value.match(/^(\d+)\.(\d+)\.(\d+)$/);
  return match ? match.slice(1).map(Number) : null;
}

function isNewerSemanticVersion(value: string, baseline: string) {
  const parts = semanticParts(value);
  const baselineParts = semanticParts(baseline);
  if (!parts || !baselineParts) return false;
  for (let index = 0; index < parts.length; index += 1) {
    if (parts[index] > baselineParts[index]) return true;
    if (parts[index] < baselineParts[index]) return false;
  }
  return false;
}

export function economyDesignerArchitectureCompatibilityStatus(architectureVersion: string) {
  if (!architectureVersion) return "missing";
  if (architectureVersion === ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.architectureVersion) return "compatible";
  if (isNewerSemanticVersion(architectureVersion, ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.architectureVersion)) return "newer";
  return "incompatible";
}

export function validateEconomyDesignerRuntimeCompatibility(runtime: EconomyDesignerRuntimeCompatibilityInput) {
  const issues: EconomyDesignerRuntimeCompatibilityIssue[] = [];
  const architectureStatus = economyDesignerArchitectureCompatibilityStatus(runtime.metadata.architectureVersion);

  if (architectureStatus === "missing") {
    issues.push({
      code: "architecture_version_missing",
      message: `Economy Designer requires architectureVersion ${ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.architectureVersion}; metadata.architectureVersion is missing.`
    });
  } else if (architectureStatus === "incompatible") {
    issues.push({
      code: "architecture_version_incompatible",
      message: `Economy Designer requires architectureVersion ${ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.architectureVersion}; received ${runtime.metadata.architectureVersion}.`
    });
  }

  if (runtime.metadata.schemaVersion !== ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.runtimeVersion) {
    issues.push({
      code: "runtime_version_incompatible",
      message: `Economy Designer supports runtimeVersion ${ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.runtimeVersion}; received ${runtime.metadata.schemaVersion || "missing"}.`
    });
  }

  if (!Number.isInteger(runtime.metadata.contentVersion)) {
    issues.push({
      code: "content_version_missing",
      message: "Economy Designer requires numeric metadata.contentVersion."
    });
  } else if (runtime.metadata.contentVersion < ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.minimumContentVersion) {
    issues.push({
      code: "content_version_too_old",
      message: `Economy Designer requires the economy contract introduced in contentVersion ${ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.minimumContentVersion}; received ${runtime.metadata.contentVersion}.`
    });
  }

  if (runtime.economyBehaviorContracts.length !== ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.behaviorContractCount) {
    issues.push({
      code: "economy_behavior_contract_count_invalid",
      message: `Economy Designer requires exactly ${ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS.behaviorContractCount} economy behavior contracts; received ${runtime.economyBehaviorContracts.length}.`
    });
  }
  if (!runtime.resourceProducerDefinitions.length) {
    issues.push({ code: "resource_producers_missing", message: "Economy Designer requires resourceProducerDefinitions." });
  }
  if (!runtime.buildingResourceEffects.length) {
    issues.push({ code: "building_resource_effects_missing", message: "Economy Designer requires buildingResourceEffects." });
  }
  if (!runtime.economyScopeRules.length) {
    issues.push({ code: "economy_scope_rules_missing", message: "Economy Designer requires economyScopeRules." });
  }
  if (!runtime.offlineProgressionPolicies.length) {
    issues.push({ code: "offline_policies_missing", message: "Economy Designer requires offlineProgressionPolicies." });
  }
  if (!runtime.economyCalculationRules.multiplierOrder.length) {
    issues.push({ code: "calculation_order_missing", message: "Economy Designer requires economyCalculationRules.multiplierOrder." });
  }
  if (!runtime.economyRateBreakdownDefinitions.length) {
    issues.push({ code: "rate_breakdowns_missing", message: "Economy Designer requires economyRateBreakdownDefinitions." });
  }
  if (!runtime.economyTransactionReasons.length) {
    issues.push({ code: "transaction_reasons_missing", message: "Economy Designer requires economyTransactionReasons." });
  }

  return {
    compatible: issues.length === 0,
    architectureStatus,
    requirements: ECONOMY_DESIGNER_RUNTIME_REQUIREMENTS,
    issues
  };
}
