import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  UNITY_MINIMUM_CLIENT_VERSION,
  UNITY_RUNTIME_CAPABILITIES,
  UNITY_RUNTIME_CONTRACT_VERSIONS,
  UNITY_RUNTIME_ENDPOINT,
  UNITY_RUNTIME_SCHEMA_ID,
  evaluateUnityRuntimeCompatibility,
  type UnityRuntimePackage
} from "@/lib/runtime/unity-runtime-contract";
import {
  buildUnityRuntimePackage,
  checksumUnityRuntimePackage,
  validateUnityRuntimePackage
} from "@/lib/runtime/unity-runtime-package";

function clone(value: UnityRuntimePackage): UnityRuntimePackage {
  return structuredClone(value);
}

function resign(value: UnityRuntimePackage) {
  value.metadata.packageChecksum = checksumUnityRuntimePackage(value);
  return value;
}

async function main() {
  const first = await buildUnityRuntimePackage({ generatedAt: "2026-08-03T00:00:00.000Z" });
  const second = await buildUnityRuntimePackage({ generatedAt: "2026-08-04T00:00:00.000Z" });
  const validation = validateUnityRuntimePackage(first);
  assert.equal(validation.valid, true, JSON.stringify(validation.issues, null, 2));
  assert.equal(first.metadata.authoritativeEndpoint, UNITY_RUNTIME_ENDPOINT);
  assert.equal(first.metadata.runtimeSchemaId, UNITY_RUNTIME_SCHEMA_ID);
  assert.equal(first.metadata.minimumClientVersion, UNITY_MINIMUM_CLIENT_VERSION);
  assert.equal(first.metadata.packageChecksum, second.metadata.packageChecksum, "volatile generatedAt must not affect checksum");

  const compatibleRequest = {
    clientVersion: UNITY_MINIMUM_CLIENT_VERSION,
    supportedRuntimeSchemaIds: [UNITY_RUNTIME_SCHEMA_ID],
    supportedCapabilities: [...UNITY_RUNTIME_CAPABILITIES],
    supportedContractVersions: Object.fromEntries(Object.entries(UNITY_RUNTIME_CONTRACT_VERSIONS).map(([id, version]) => [id, [version]]))
  };
  assert.equal(evaluateUnityRuntimeCompatibility(first, compatibleRequest).compatible, true);
  assert.equal(evaluateUnityRuntimeCompatibility(first, { ...compatibleRequest, clientVersion: "1.9.9" }).compatible, false, "old clients must be rejected");
  assert.equal(evaluateUnityRuntimeCompatibility(first, { ...compatibleRequest, supportedCapabilities: compatibleRequest.supportedCapabilities.slice(1) }).compatible, false, "missing capabilities must be rejected");
  assert.equal(evaluateUnityRuntimeCompatibility(first, { ...compatibleRequest, supportedContractVersions: {} }).compatible, false, "unsupported contracts must be rejected");

  const upgrades = first.runtime.upgrades;
  assert.ok(upgrades.length > 0);
  for (const upgrade of upgrades) {
    assert.equal(upgrade.masteryXpOverflowPolicy, "carry_forward");
    assert.equal(upgrade.generatedLevels.length, 100);
    assert.deepEqual(upgrade.generatedLevels.map((row) => row.level), Array.from({ length: 100 }, (_, index) => index + 1));
    assert.ok(upgrade.generatedLevels.every((row) => row.xpRequired >= 0 && row.laborCost >= 0 && row.sourceProfileVersion && row.checksum));
  }

  const actions = first.runtime.actionSystem;
  assert.ok(actions.actionCostProfiles.flatMap((profile) => profile.costs).every((cost) => cost.quantity > 0 && (typeof cost.resolvedValue === "number" ? cost.resolvedValue > 0 : Boolean(cost.resolvedValue.canonicalSourceId && cost.resolvedValue.valueField))));
  assert.ok(actions.actionRewardProfiles.flatMap((profile) => profile.rewards).every((reward) => reward.resolverId && (typeof reward.amount === "number" ? reward.amount > 0 : Boolean(reward.amount.canonicalSourceId && reward.amount.valueField))));
  assert.ok(actions.canonicalActionProfiles.every((profile) => profile.offlinePolicy && profile.rewardClaimPolicy));
  assert.ok(actions.actionRequirementProfiles.flatMap((profile) => profile.requirements).every((requirement) => requirement.canonicalTargetId && requirement.evaluatorType));
  assert.ok(actions.reconciliationPolicy && first.runtime.progressionSystem.reconciliationPolicy);

  const badCost = clone(first);
  const cost = badCost.runtime.actionSystem.actionCostProfiles.find((profile) => profile.costs.length)?.costs[0];
  assert.ok(cost);
  cost!.quantity = 0;
  assert.equal(validateUnityRuntimePackage(resign(badCost)).valid, false, "unresolved costs must block publication");

  const badReward = clone(first);
  const reward = badReward.runtime.actionSystem.actionRewardProfiles.find((profile) => profile.rewards.length)?.rewards[0];
  assert.ok(reward);
  reward!.resolverId = "";
  assert.equal(validateUnityRuntimePackage(resign(badReward)).valid, false, "unresolved rewards must block publication");

  const changed = clone(first);
  changed.runtime.actionSystem.version = "1.0.1" as "1.0.0";
  assert.notEqual(checksumUnityRuntimePackage(changed), first.metadata.packageChecksum, "contract data changes must change checksum");

  const packageSource = await readFile("lib/runtime/unity-runtime-package.ts", "utf8");
  const contractSource = await readFile("lib/runtime/unity-runtime-contract.ts", "utf8");
  const routeSource = await readFile("app/api/export/unity-runtime.json/route.ts", "utf8");
  assert.equal(packageSource.includes("server-only"), false, "standalone package builder must avoid undeclared server-only dependency");
  assert.equal(contractSource.includes("server-only"), false, "standalone contract must avoid undeclared server-only dependency");
  assert.ok(routeSource.includes("buildUnityRuntimePackage") && routeSource.includes("validateUnityRuntimePackage"), "authoritative route must build and validate the canonical package");
  assert.equal((await readFile("docs/runtime/unity/UNITY_RUNTIME_SCHEMA.json", "utf8")).includes(UNITY_RUNTIME_SCHEMA_ID), true, "machine-readable schema must match runtime schema");

  const packageBytes = Buffer.byteLength(JSON.stringify(first));

  console.log(JSON.stringify({
    status: "Ready",
    endpoint: first.metadata.authoritativeEndpoint,
    schema: `${first.metadata.runtimeSchemaId}@${first.metadata.runtimeSchemaVersion}`,
    contentVersion: first.metadata.contentVersion,
    checksum: first.metadata.packageChecksum,
    capabilities: first.metadata.capabilities.length,
    packageBytes,
    upgrades: upgrades.length,
    actionProfiles: actions.canonicalActionProfiles.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
