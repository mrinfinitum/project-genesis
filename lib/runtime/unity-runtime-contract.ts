import type { CanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

export const UNITY_RUNTIME_SCHEMA_ID = "game-runtime-v2" as const;
export const UNITY_RUNTIME_SCHEMA_VERSION = "2.0.0" as const;
export const UNITY_MINIMUM_CLIENT_VERSION = "2.0.0" as const;
export const UNITY_RUNTIME_ENDPOINT = "/api/export/unity-runtime.json" as const;
export const UNITY_RUNTIME_CHECKSUM_ALGORITHM = "sha256" as const;

export const UNITY_RUNTIME_CAPABILITIES = [
  "progression-levels-v1",
  "upgrade-mastery-v1",
  "labor-level-up-v1",
  "crystal-acceleration-v1",
  "canonical-actions-v1",
  "action-queues-v1",
  "offline-reconciliation-v1",
  "reward-claim-policy-v1",
  "runtime-reconciliation-v1",
  "typed-action-requirements-v1"
] as const;

export const UNITY_RUNTIME_CONTRACT_VERSIONS = {
  canonicalProgressionSystem: "1.0.0",
  canonicalActionSystem: "1.0.0",
  timeActionContract: "1.0.0",
  progressionReconciliation: "1.0.0",
  actionReconciliation: "1.0.0"
} as const;

export type UnityRuntimePackage = {
  metadata: {
    authoritativeEndpoint: typeof UNITY_RUNTIME_ENDPOINT;
    runtimeSchemaId: typeof UNITY_RUNTIME_SCHEMA_ID;
    runtimeSchemaVersion: typeof UNITY_RUNTIME_SCHEMA_VERSION;
    sourceRuntimeSchemaId: string;
    contentVersion: number;
    minimumClientVersion: typeof UNITY_MINIMUM_CLIENT_VERSION;
    capabilities: string[];
    generatedAt: string;
    checksumAlgorithm: typeof UNITY_RUNTIME_CHECKSUM_ALGORITHM;
    packageChecksum: string;
    contractVersions: Record<string, string>;
    compatibilityPolicy: {
      schemaVersionPolicy: "exact_match_required";
      minimumClientPolicy: "reject_below_minimum";
      missingCapabilityPolicy: "reject";
      unsupportedRequiredContractPolicy: "reject";
      unknownOptionalCapabilityPolicy: "ignore";
    };
    validationStatus: "Ready" | "Blocked";
  };
  runtime: CanonicalRuntimeExportPayload;
};

export type UnityRuntimeCompatibilityRequest = {
  clientVersion: string;
  supportedRuntimeSchemaIds: string[];
  supportedCapabilities: string[];
  supportedContractVersions: Record<string, string[]>;
};

function semverParts(value: string) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  return match ? match.slice(1).map(Number) : null;
}

function semverAtLeast(value: string, minimum: string) {
  const current = semverParts(value);
  const required = semverParts(minimum);
  if (!current || !required) return false;
  for (let index = 0; index < 3; index += 1) {
    if (current[index] !== required[index]) return current[index] > required[index];
  }
  return true;
}

export function evaluateUnityRuntimeCompatibility(runtimePackage: UnityRuntimePackage, request: UnityRuntimeCompatibilityRequest) {
  const reasons: string[] = [];
  if (!semverAtLeast(request.clientVersion, runtimePackage.metadata.minimumClientVersion)) reasons.push("client_version_below_minimum");
  if (!request.supportedRuntimeSchemaIds.includes(runtimePackage.metadata.runtimeSchemaId)) reasons.push("unsupported_runtime_schema");
  for (const capability of runtimePackage.metadata.capabilities) if (!request.supportedCapabilities.includes(capability)) reasons.push(`missing_capability:${capability}`);
  for (const [contractId, version] of Object.entries(runtimePackage.metadata.contractVersions)) {
    if (!request.supportedContractVersions[contractId]?.includes(version)) reasons.push(`unsupported_contract:${contractId}@${version}`);
  }
  return { compatible: reasons.length === 0, reasons };
}
