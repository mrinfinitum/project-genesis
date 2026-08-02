import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import {
  buildIdentityRelationshipGraph,
  calculateChangeImpact,
  createCanonicalId,
  toIdentityRelationshipRuntimeExport
} from "@/lib/identity-relationships";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, validateGameRuntimeData, validateRobloxRuntimePayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const universe = { recordType: "Universe" as const, sourceId: "test-universe" };
  const galaxy = { recordType: "Galaxy" as const, sourceId: "test-galaxy" };
  const planet = { recordType: "Planet" as const, sourceId: "test-planet" };
  const asset = { recordType: "Asset" as const, sourceId: "test-asset" };
  const graph = buildIdentityRelationshipGraph(
    [
      { ...universe, displayName: "Test Universe", ownerSource: "studio" },
      { ...galaxy, displayName: "Test Galaxy", ownerSource: universe },
      { ...planet, displayName: "Test Planet", ownerSource: galaxy },
      { ...asset, displayName: "Test Asset", ownerSource: planet }
    ],
    [
      { from: galaxy, to: universe, relationshipType: "parent", referenceType: "hard" },
      { from: universe, to: galaxy, relationshipType: "child", referenceType: "hard" },
      { from: planet, to: galaxy, relationshipType: "parent", referenceType: "hard" },
      { from: galaxy, to: planet, relationshipType: "child", referenceType: "hard" },
      { from: asset, to: planet, relationshipType: "references", referenceType: "runtime" }
    ]
  );
  assert(graph.validation.status === "Ready", "Fixture identity graph must validate.");
  assert(createCanonicalId("Planet", "test-planet") === "noveris:planet:test-planet", "Canonical identity namespace is unstable.");
  assert(calculateChangeImpact(graph, createCanonicalId("Planet", "test-planet")).affectedAssetIds.includes(createCanonicalId("Asset", "test-asset")), "Impact analysis must include dependent assets.");

  const safeFixture = toIdentityRelationshipRuntimeExport(graph);
  const safeSerialized = JSON.stringify(safeFixture);
  for (const privateField of ["canonicalOwnerId", "createdAt", "updatedAt", "sourceMaster", "productionStatus"]) {
    assert(!safeSerialized.includes(`\"${privateField}\"`), `Runtime graph leaked ${privateField}.`);
  }

  const cycle = buildIdentityRelationshipGraph(
    [
      { ...universe, displayName: "Test Universe", ownerSource: "studio" },
      { ...galaxy, displayName: "Test Galaxy", ownerSource: universe }
    ],
    [
      { from: universe, to: galaxy, relationshipType: "parent", referenceType: "hard" },
      { from: galaxy, to: universe, relationshipType: "parent", referenceType: "hard" }
    ]
  );
  assert(cycle.validation.issues.some((issue) => issue.code === "circular_parent"), "Circular parent validation is missing.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  const runtimeValidation = validateGameRuntimeData(runtime);
  assert(runtimeValidation.valid, runtimeValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
  assert(runtime.identityRelationshipGraph?.status === "Ready", "Published runtime identity graph is not Ready.");
  assert(runtime.identityRelationshipGraph?.records.length, "Published runtime identity graph has no records.");
  const runtimeJson = JSON.stringify(runtime.identityRelationshipGraph);
  for (const privateField of ["canonicalOwnerId", "createdAt", "updatedAt", "incomingRelationshipIds", "outgoingRelationshipIds", "prompt_text"]) {
    assert(!runtimeJson.includes(`\"${privateField}\"`), `Published runtime leaked ${privateField}.`);
  }
  assert(!runtime.identityRelationshipGraph.records.some((record) => record.recordType === "Prompt"), "Published runtime must not include Studio-only prompt records.");

  const roblox = buildRobloxRuntimePayload(runtime);
  const robloxValidation = validateRobloxRuntimePayload(roblox);
  assert(robloxValidation.valid, robloxValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
  assert(roblox.identityRelationshipGraph?.status === "Ready", "Roblox export is missing the safe identity graph.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map(async (target) => ({ target, payload: await buildGameEngineExport(target) })));
  for (const { target, payload } of exports) {
    assert(payload.validation.status === "Ready", `${target} engine export is ${payload.validation.status}.`);
    const module = payload.canonical.identity_relationships;
    assert(module?.status === "Ready" && module.records.length > 0, `${target} engine export is missing identity relationships.`);
    assert(!JSON.stringify(module).includes("canonicalOwnerId"), `${target} engine export leaked Studio identity metadata.`);
  }

  console.log(JSON.stringify({
    status: "Ready",
    records: runtime.identityRelationshipGraph.records.length,
    relationships: runtime.identityRelationshipGraph.relationships.length,
    contentVersion: runtime.metadata.contentVersion,
    checksum: runtime.metadata.checksum,
    engineExports: Object.fromEntries(exports.map(({ target, payload }) => [target, payload.validation.status]))
  }, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
