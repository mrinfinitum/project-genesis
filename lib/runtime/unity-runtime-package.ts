import { createHash } from "node:crypto";
import { buildCanonicalRuntimeExportPayload, gameRuntimeContentVersion } from "@/lib/runtime/game-runtime";
import { validateActionSystem } from "@/lib/actions/action-system";
import { validateProgressionSystem } from "@/lib/progression/progression-system";
import {
  UNITY_MINIMUM_CLIENT_VERSION,
  UNITY_RUNTIME_CAPABILITIES,
  UNITY_RUNTIME_CHECKSUM_ALGORITHM,
  UNITY_RUNTIME_CONTRACT_VERSIONS,
  UNITY_RUNTIME_ENDPOINT,
  UNITY_RUNTIME_SCHEMA_ID,
  UNITY_RUNTIME_SCHEMA_VERSION,
  type UnityRuntimePackage
} from "@/lib/runtime/unity-runtime-contract";
import type { ImportIssue } from "@/types/runtime";

const privateRuntimeKeys = new Set(["sourceMasterPath", "sourcePath", "localPath", "privatePath"]);

function sanitizeForUnity(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeForUnity);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([key, item]) => !privateRuntimeKeys.has(key) && !(typeof item === "string" && (item.startsWith("/Users/") || item.startsWith("studio-private://"))))
      .map(([key, item]) => [key, sanitizeForUnity(item)]));
  }
  return value;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

export function canonicalUnityPackageSerialization(runtimePackage: UnityRuntimePackage) {
  const checksumInput = {
    ...runtimePackage,
    metadata: {
      ...runtimePackage.metadata,
      generatedAt: "",
      packageChecksum: ""
    }
  };
  return JSON.stringify(canonicalize(checksumInput));
}

export function checksumUnityRuntimePackage(runtimePackage: UnityRuntimePackage) {
  return createHash(UNITY_RUNTIME_CHECKSUM_ALGORITHM).update(canonicalUnityPackageSerialization(runtimePackage)).digest("hex");
}

export function validateUnityRuntimePackage(runtimePackage: UnityRuntimePackage) {
  const issues: ImportIssue[] = [];
  const add = (code: string, message: string, records: string[] = []) => issues.push({ severity: "error" as const, code, message, records });

  if (runtimePackage.metadata.authoritativeEndpoint !== UNITY_RUNTIME_ENDPOINT) add("ambiguous_unity_endpoint", `Unity runtime must identify ${UNITY_RUNTIME_ENDPOINT} as its authoritative endpoint.`);
  if (runtimePackage.metadata.runtimeSchemaId !== UNITY_RUNTIME_SCHEMA_ID || runtimePackage.metadata.runtimeSchemaVersion !== UNITY_RUNTIME_SCHEMA_VERSION) add("unsupported_schema_version", "Unity runtime schema must exactly match the published v2 contract.");
  if (!runtimePackage.metadata.sourceRuntimeSchemaId) add("source_runtime_schema_missing", "Unity runtime must identify its canonical source schema.");
  if (!runtimePackage.metadata.minimumClientVersion) add("minimum_client_version_missing", "Unity runtime requires minimumClientVersion.");
  if (!runtimePackage.metadata.capabilities.length) add("capability_marker_missing", "Unity runtime requires capability markers.");
  for (const capability of UNITY_RUNTIME_CAPABILITIES) if (!runtimePackage.metadata.capabilities.includes(capability)) add("required_capability_missing", `Missing required capability ${capability}.`, [capability]);
  for (const [contractId, version] of Object.entries(UNITY_RUNTIME_CONTRACT_VERSIONS)) if (runtimePackage.metadata.contractVersions[contractId] !== version) add("contract_version_missing", `Missing contract version ${contractId}@${version}.`, [contractId]);
  for (const issue of validateProgressionSystem(runtimePackage.runtime.progressionSystem)) if (issue.severity === "error") issues.push(issue);
  for (const issue of validateActionSystem(runtimePackage.runtime.actionSystem, runtimePackage.runtime.timeActionContract)) if (issue.severity === "error") issues.push(issue);
  for (const upgrade of runtimePackage.runtime.upgrades) {
    if (!upgrade.masteryXpOverflowPolicy) add("mastery_overflow_policy_missing", `${upgrade.id} is missing mastery XP overflow policy.`, [upgrade.id]);
    if (upgrade.maxLevel === 100 && (upgrade.generatedLevels.length !== 100 || upgrade.generatedLevels.some((row, index) => row.level !== index + 1) || new Set(upgrade.generatedLevels.map((row) => row.level)).size !== 100)) add("invalid_generated_level_sequence", `${upgrade.id} must publish unique levels 1-100.`, [upgrade.id]);
    for (const [index, row] of upgrade.generatedLevels.entries()) {
      const previous = upgrade.generatedLevels[index - 1];
      if (row.xpRequired < 0 || row.cumulativeXp < 0 || row.laborCost < 0 || row.moneyCost < 0 || row.durationSeconds < 0 || row.crystalAccelerationCost < 0 || row.resourceCosts.some((cost) => cost.amount < 0)) add("invalid_generated_level_value", `${upgrade.id} level ${row.level} contains a negative value.`, [upgrade.id, String(row.level)]);
      if (previous && row.cumulativeXp < previous.cumulativeXp) add("invalid_generated_level_xp_order", `${upgrade.id} cumulative XP is not monotonic.`, [upgrade.id, String(row.level)]);
      if (![row.outputValue, row.researchValue, row.efficiencyValue, row.crystalAccelerationCost].every(Number.isFinite) || !row.sourceProfileVersion || !row.checksum) add("incomplete_generated_level", `${upgrade.id} level ${row.level} is not executable or lacks deterministic coverage.`, [upgrade.id, String(row.level)]);
    }
  }
  if (!runtimePackage.runtime.progressionSystem.reconciliationPolicy || !runtimePackage.runtime.actionSystem.reconciliationPolicy) add("reconciliation_policy_missing", "Progression and Action reconciliation policies are required.");
  if (!runtimePackage.metadata.packageChecksum) add("package_checksum_missing", "Unity runtime package checksum is required.");
  else if (checksumUnityRuntimePackage(runtimePackage) !== runtimePackage.metadata.packageChecksum) add("package_checksum_invalid", "Unity runtime package checksum does not match canonical serialization.");
  const serialized = JSON.stringify(runtimePackage);
  const forbidden = ["/Users/", "studio-private://", "sourceMasterPath", "SUPABASE_SERVICE_ROLE_KEY"];
  for (const marker of forbidden) if (serialized.includes(marker)) add("private_runtime_data_leak", `Unity runtime contains forbidden private marker ${marker}.`);
  return { valid: issues.length === 0, status: issues.length ? "Blocked" as const : "Ready" as const, issues };
}

export async function buildUnityRuntimePackage(options: { generatedAt?: string } = {}): Promise<UnityRuntimePackage> {
  const sourceRuntime = await buildCanonicalRuntimeExportPayload();
  const runtime = sanitizeForUnity(sourceRuntime) as typeof sourceRuntime;
  const runtimePackage: UnityRuntimePackage = {
    metadata: {
      authoritativeEndpoint: UNITY_RUNTIME_ENDPOINT,
      runtimeSchemaId: UNITY_RUNTIME_SCHEMA_ID,
      runtimeSchemaVersion: UNITY_RUNTIME_SCHEMA_VERSION,
      sourceRuntimeSchemaId: sourceRuntime.metadata.schemaVersion,
      contentVersion: gameRuntimeContentVersion,
      minimumClientVersion: UNITY_MINIMUM_CLIENT_VERSION,
      capabilities: [...UNITY_RUNTIME_CAPABILITIES],
      generatedAt: options.generatedAt ?? new Date().toISOString(),
      checksumAlgorithm: UNITY_RUNTIME_CHECKSUM_ALGORITHM,
      packageChecksum: "",
      contractVersions: { ...UNITY_RUNTIME_CONTRACT_VERSIONS },
      compatibilityPolicy: {
        schemaVersionPolicy: "exact_match_required",
        minimumClientPolicy: "reject_below_minimum",
        missingCapabilityPolicy: "reject",
        unsupportedRequiredContractPolicy: "reject",
        unknownOptionalCapabilityPolicy: "ignore"
      },
      validationStatus: "Ready"
    },
    runtime
  };
  runtimePackage.metadata.packageChecksum = checksumUnityRuntimePackage(runtimePackage);
  const validation = validateUnityRuntimePackage(runtimePackage);
  runtimePackage.metadata.validationStatus = validation.status;
  return runtimePackage;
}
