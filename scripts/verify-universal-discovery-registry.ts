import { readFileSync } from "node:fs";
import path from "node:path";
import { getArchitectureState } from "@/lib/architecture";
import { getComponentLibraryState } from "@/lib/component-library";
import {
  buildUniversalObjectId,
  objectGenerationVersion,
  registryIdForUniversalObject,
  simulateAtomicFirstDiscoveryClaims,
  universalDiscoveryBackendHandoff,
  universalDiscoveryComponentContracts,
  universalDiscoveryEntityTypes,
  universalDiscoveryEnvironmentPolicy,
  universalDiscoveryGameCodexHandoff,
  universalDiscoveryHistoryContract,
  universalDiscoveryMilestones,
  universalDiscoveryNamingPolicy,
  universalDiscoveryOfflinePolicy,
  universalDiscoveryPresentationContract,
  universalDiscoveryPrivacyPolicy,
  universalDiscoveryRecordContract,
  universalDiscoveryRegistryContract,
  universalDiscoveryRegistryVersion,
  universalDiscoveryRobloxHandoff,
  universalDiscoveryScreenSpecs,
  universeGenerationVersion,
  validateUniversalDiscoveryRegistryContract,
  type UniversalDiscoveryClaimInput,
  type UniversalObjectIdentityInput
} from "@/lib/discovery/universal-registry";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { getScreenDesignerState } from "@/lib/screen-designer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assertNoPrivateLeak(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!/\/Users\/|studio-private:\/\/|SUPABASE_SERVICE_ROLE|SERVICE_ROLE|PRIVATE_KEY|databaseUrl/i.test(text), `${label} leaked a private path or secret marker.`);
}

function identityInput(overrides: Partial<UniversalObjectIdentityInput> = {}): UniversalObjectIdentityInput {
  return {
    environment: "production",
    universeSeedVersion: "seed-v1",
    universeId: "noveris-main",
    galaxyId: "milky-way",
    sectorId: "sector-sol",
    starSystemId: "system-sol",
    celestialBodyId: "planet-earth",
    discoveryEntityType: "planet",
    generationVersion: objectGenerationVersion,
    ...overrides
  };
}

function claim(overrides: Partial<UniversalDiscoveryClaimInput> = {}): UniversalDiscoveryClaimInput {
  return {
    requestId: "claim-001",
    universalObjectId: buildUniversalObjectId(identityInput()),
    entityType: "planet",
    milestoneType: "first_identified",
    publicProfileId: "public-profile-alpha",
    civilizationId: "civilization-noveris-union",
    clientRuntimeVersion: "game-runtime-v1",
    universeGenerationVersion,
    evidenceHash: "evidence-hash-alpha",
    serverReceivedAt: "2026-07-15T12:00:00.000Z",
    ...overrides
  };
}

async function main() {
  const validation = validateUniversalDiscoveryRegistryContract();
  assert(validation.status === "Ready", `Universal Discovery Registry contract must be Ready: ${validation.issues.map((issue) => issue.message).join("; ")}`);

  const sameA = buildUniversalObjectId(identityInput());
  const sameB = buildUniversalObjectId(identityInput());
  const differentPlanet = buildUniversalObjectId(identityInput({ celestialBodyId: "planet-mars" }));
  const differentEnvironment = buildUniversalObjectId(identityInput({ environment: "staging" }));
  const migratedVisual = buildUniversalObjectId(identityInput({ generationVersion: objectGenerationVersion }));
  assert(sameA === sameB, "Same seed/object must produce the same UniversalObjectId.");
  assert(sameA !== differentPlanet, "Different objects must not collide.");
  assert(sameA !== differentEnvironment, "Production/test/staging identities must not collide.");
  assert(sameA === migratedVisual, "Visual generation improvements that preserve objectGenerationVersion must preserve registry ID.");
  assert(!sameA.includes("Earth") && !sameA.includes("Elyra"), "UniversalObjectId must not depend on mutable display names.");
  assert(registryIdForUniversalObject(sameA).startsWith("registry:"), "Registry ID must derive from UniversalObjectId without array indexes.");

  const race = simulateAtomicFirstDiscoveryClaims([
    claim({ requestId: "claim-late", publicProfileId: "public-profile-beta", serverReceivedAt: "2026-07-15T12:00:01.000Z" }),
    claim({ requestId: "claim-winner", publicProfileId: "public-profile-alpha", serverReceivedAt: "2026-07-15T12:00:00.000Z" }),
    claim({ requestId: "claim-winner", publicProfileId: "public-profile-alpha", serverReceivedAt: "2026-07-15T12:00:00.000Z" }),
    claim({ requestId: "claim-landed", milestoneType: "first_landed", serverReceivedAt: "2026-07-15T12:00:02.000Z" })
  ]);
  assert(race.requestResults.get("claim-winner")?.accepted === true, "First atomic claim should win.");
  assert(race.requestResults.get("claim-late")?.accepted === false, "Simultaneous second claimant should lose cleanly.");
  assert(race.requestResults.get("claim-late")?.winnerRequestId === "claim-winner", "Losing claimant must receive the winning canonical record.");
  assert(race.requestResults.get("claim-winner")?.registryId === registryIdForUniversalObject(sameA), "Winner result must return the registry record.");
  assert(race.requestResults.get("claim-landed")?.accepted === true, "Later milestone must be recordable separately.");
  assert(race.winners.size === 2, "There should be one winner per universalObjectId + milestoneType.");

  assert(universalDiscoveryOfflinePolicy.pendingState.includes("pending_verification"), "Offline claims must remain pending verification.");
  assert(universalDiscoveryOfflinePolicy.distinction.includes("Personal discovery") && universalDiscoveryOfflinePolicy.distinction.includes("global first discovery"), "Offline policy must distinguish personal discovery and global first discovery.");
  assert(universalDiscoveryNamingPolicy.statuses.includes("approved") && universalDiscoveryNamingPolicy.statuses.includes("rejected"), "Naming policy must support approved and rejected names.");
  assert(universalDiscoveryNamingPolicy.safeFallback.includes("canonicalFallbackName"), "Rejected names must fall back to canonical fallback names.");
  assert(universalDiscoveryPrivacyPolicy.attributionFallback === "Discovered by an Explorer", "Anonymous attribution fallback is incorrect.");
  assert(universalDiscoveryPrivacyPolicy.hiddenAttributionRule.includes("Do not erase immutable backend ownership"), "Hidden public attribution must not erase immutable ownership.");
  assert(universalDiscoveryRecordContract.sanitizedFields.includes("discoveredByCivilizationNameSnapshot"), "Civilization snapshot must be part of sanitized record contract.");
  assert(universalDiscoveryRecordContract.sanitizedFields.includes("discoveredByDisplayNameSnapshot"), "Display-name snapshot must be part of sanitized record contract.");
  for (const privateField of universalDiscoveryRecordContract.privateFieldsBlocked) {
    assert(!universalDiscoveryRecordContract.sanitizedFields.includes(privateField), `Sanitized registry record must not include ${privateField}.`);
  }
  assert(universalDiscoveryHistoryContract.appendOnly === true, "Discovery history must be append-only.");
  assert(universalDiscoveryBackendHandoff.uniqueConstraints.some((constraint) => constraint.includes("universal_discovery_milestones")), "Backend handoff must include milestone unique constraints.");
  assert(universalDiscoveryBackendHandoff.supabaseRules.some((rule) => rule.includes("RLS blocks clients")), "Supabase handoff must block direct verified claim inserts.");
  assert(universalDiscoveryEnvironmentPolicy.separationRule.includes("Production clients must never display test discoveries"), "Environment policy must isolate production/test discoveries.");
  assert(universalDiscoveryGameCodexHandoff.includes("atomic first-discovery"), "Game handoff must cover atomic first-discovery logic.");
  assert(universalDiscoveryRobloxHandoff.includes("shared backend registry"), "Roblox handoff must prefer shared backend registry for one canonical universe.");
  assertNoPrivateLeak("Universal Discovery Registry contract", universalDiscoveryRegistryContract);

  const [runtime, architecture, componentState, screenState] = await Promise.all([
    buildCanonicalRuntimeExportPayload(),
    getArchitectureState(),
    getComponentLibraryState(),
    getScreenDesignerState()
  ]);
  assert(runtime.metadata.contentVersion >= 19, `Universal Discovery Registry metadata requires contentVersion 19 or newer; received ${runtime.metadata.contentVersion}.`);
  assert(runtime.metadata.universalDiscoveryRegistryVersion === universalDiscoveryRegistryVersion, "Runtime metadata must expose universalDiscoveryRegistryVersion.");
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);
  assert((runtime.universalDiscoveryRegistry as { version?: string }).version === universalDiscoveryRegistryVersion, "Runtime must publish the sanitized registry contract.");
  assert(!(runtime.universalDiscoveryRegistry as Record<string, unknown>).hasOwnProperty("liveRecords"), "Runtime must not export live discovery records.");
  assertNoPrivateLeak("Runtime Universal Discovery Registry", runtime.universalDiscoveryRegistry);

  assert(architecture.decisions.some((decision) => decision.id === "ARCH-DECISION-UNIVERSAL-DISCOVERY-REGISTRY" && decision.status === "Accepted"), "Architecture decision must be accepted.");
  assert(architecture.sections.some((section) => section.id === "discovery" && section.content.some((line) => line.includes("UniversalObjectId"))), "Architecture Discovery section must document UniversalObjectId.");

  const componentIds = new Set(componentState.records.map((record) => record.componentId));
  for (const componentId of universalDiscoveryComponentContracts) {
    assert(componentIds.has(componentId), `Component Library is missing ${componentId}.`);
  }
  const screenNames = new Set(screenState.records.map((record) => record.displayName));
  for (const screenName of universalDiscoveryScreenSpecs) {
    assert(screenNames.has(screenName), `Screen Specifications are missing ${screenName}.`);
  }

  const architectureSource = read("lib/architecture/index.ts");
  const runtimeSource = read("lib/runtime/game-runtime.ts");
  assert(architectureSource.includes("Verified First Discoveries Become Permanent Universal History"), "Architecture source must include the accepted decision title.");
  assert(runtimeSource.includes("universalDiscoveryRegistryContract"), "Runtime source must derive registry metadata from the contract module.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    const target = targets[index];
    assert(engineExport.validation.status === "Ready", `${target} export must remain Ready; received ${engineExport.validation.status}.`);
    assert((engineExport.canonical.universal_discovery_registry as { version?: string }).version === universalDiscoveryRegistryVersion, `${target} export must include registry contract metadata.`);
    assertNoPrivateLeak(`${target} export Universal Discovery Registry`, engineExport.canonical.universal_discovery_registry);
  }

  console.log(JSON.stringify({
    ok: true,
    registryVersion: universalDiscoveryRegistryVersion,
    identitySchemaVersion: universalDiscoveryRegistryContract.identitySchemaVersion,
    entityTypes: universalDiscoveryEntityTypes.length,
    milestones: universalDiscoveryMilestones.length,
    namingStatuses: universalDiscoveryNamingPolicy.statuses.length,
    presentationStates: universalDiscoveryPresentationContract.states.length,
    backendTables: universalDiscoveryBackendHandoff.tables.length,
    componentContracts: universalDiscoveryComponentContracts.length,
    screenSpecs: universalDiscoveryScreenSpecs.length,
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      checksum: runtime.metadata.checksum,
      registryVersion: runtime.metadata.universalDiscoveryRegistryVersion,
      validationStatus: runtime.metadata.validationStatus
    },
    engineExports: Object.fromEntries(exports.map((engineExport, index) => [targets[index], engineExport.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
