import { ARCHITECTURE_VERSION } from "@/lib/architecture/version";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { galaxyEnginePresentationContract, validateGalaxyEnginePresentationContract } from "@/lib/runtime/galaxy-engine-contract";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion, gameRuntimeSchemaVersion } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertSameSet(label: string, actual: string[], expected: string[]) {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  assert(actualSorted.join("|") === expectedSorted.join("|"), `${label} mismatch. Expected ${expectedSorted.join(", ")}; received ${actualSorted.join(", ")}.`);
}

function assertNoRendererConfig(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!/"(?:threeJsConfig|reactThreeFiberConfig|cameraConfig|shaderConfig|lightingRig|controlScheme|rendererSettings)"\s*:/i.test(text), `${label} leaked renderer-owned implementation config.`);
}

async function main() {
  const contractIssues = validateGalaxyEnginePresentationContract(galaxyEnginePresentationContract).filter((issue) => issue.severity === "error");
  assert(contractIssues.length === 0, `Galaxy Engine contract has validation errors: ${contractIssues.map((issue) => issue.message).join("; ")}`);

  assert(ARCHITECTURE_VERSION === "1.0.0", `Architecture Workspace version must be 1.0.0; received ${ARCHITECTURE_VERSION}.`);
  assert(gameRuntimeSchemaVersion === "game-runtime-v1", `Runtime version must be game-runtime-v1; received ${gameRuntimeSchemaVersion}.`);
  assert(gameRuntimeContentVersion >= 21, `Content version must be at least 21; received ${gameRuntimeContentVersion}.`);
  assert(galaxyEnginePresentationContract.version === "1.0.0", "Galaxy Engine contract version must be 1.0.0.");

  assertSameSet("Semantic zoom IDs", galaxyEnginePresentationContract.semanticZoom.map((zoom) => zoom.id), ["galaxy", "sector", "star_system"]);
  assertSameSet("Technology gate IDs", galaxyEnginePresentationContract.technologyGates.map((gate) => gate.id), ["survival", "planetary", "interplanetary", "interstellar", "galactic", "intergalactic"]);
  assertSameSet("Knowledge visibility IDs", galaxyEnginePresentationContract.knowledgeVisibility.map((state) => state.id), ["unknown", "detected", "probed", "scanned", "charted", "explored", "colonized", "mastered"]);
  assertSameSet("Presentation class IDs", galaxyEnginePresentationContract.presentationClasses.map((item) => item.id), ["galaxy", "sector", "star", "planet", "moon", "asteroid_belt"]);
  assertSameSet("Platform rendering profile IDs", galaxyEnginePresentationContract.platformRenderingProfiles.map((profile) => profile.id), ["desktop_ultra", "desktop_high", "desktop_medium", "steam", "iphone", "ipad", "android_phone", "android_tablet", "reduced"]);
  assertSameSet("Galaxy Engine asset role IDs", galaxyEnginePresentationContract.assetRoles.map((role) => role.id), ["galaxy", "sector", "star", "planet", "moon", "navigation", "probe", "travel", "unknown", "selection"]);

  const unknown = galaxyEnginePresentationContract.knowledgeVisibility.find((state) => state.id === "unknown");
  assert(unknown?.unknownDisplayName === "???", "Unknown knowledge state must display ???.");
  assert(unknown?.canShowName === false && unknown.canShowRegistry === false && unknown.canShowResources === false && unknown.canShowBodyCount === false && unknown.canShowDiscoveries === false, "Unknown knowledge state must hide registry, resources, body count, and discoveries.");
  assert(galaxyEnginePresentationContract.platformRenderingProfiles.every((profile) => profile.recommendationOnly === true), "All platform rendering profiles must be recommendations only.");
  assertNoRendererConfig("Canonical contract", galaxyEnginePresentationContract);

  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(canonical);
  assert(canonical.metadata.architectureVersion === ARCHITECTURE_VERSION, "Canonical runtime architectureVersion must match Architecture Workspace.");
  assert(canonical.metadata.schemaVersion === gameRuntimeSchemaVersion, "Canonical runtime schemaVersion mismatch.");
  assert(canonical.metadata.galaxyEngineContractVersion === galaxyEnginePresentationContract.version, "Canonical runtime metadata must publish galaxyEngineContractVersion.");
  assert(canonical.metadata.contentVersion === gameRuntimeContentVersion, "Canonical runtime contentVersion mismatch.");
  assert(canonical.galaxyEngineContract.version === galaxyEnginePresentationContract.version, "Canonical runtime must publish Galaxy Engine contract.");
  assert(canonical.metadata.validationStatus === "Ready", `Canonical runtime validationStatus must be Ready; received ${canonical.metadata.validationStatus}.`);
  assert(roblox.galaxyEngineContract.version === galaxyEnginePresentationContract.version, "Roblox runtime must publish Galaxy Engine contract.");
  assert(roblox.metadata.galaxyEngineContractVersion === galaxyEnginePresentationContract.version, "Roblox runtime metadata must publish galaxyEngineContractVersion.");
  assert(roblox.metadata.validationStatus === "Ready", `Roblox runtime validationStatus must be Ready; received ${roblox.metadata.validationStatus}.`);
  assertNoRendererConfig("Canonical runtime contract", canonical.galaxyEngineContract);
  assertNoRendererConfig("Roblox runtime contract", roblox.galaxyEngineContract);

  const engineTargets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineResults = await Promise.all(engineTargets.map(async (target) => {
    const payload = await buildGameEngineExport(target);
    const contract = payload.canonical.galaxy_engine_contract as typeof galaxyEnginePresentationContract | undefined;
    assert(payload.validation.status === "Ready", `${target} export must remain Ready; received ${payload.validation.status}.`);
    assert(payload.metadata.architectureVersion === ARCHITECTURE_VERSION, `${target} export architectureVersion mismatch.`);
    assert(payload.metadata.runtimeVersion === gameRuntimeSchemaVersion, `${target} export runtimeVersion mismatch.`);
    assert(payload.metadata.contentVersion === gameRuntimeContentVersion, `${target} export contentVersion mismatch.`);
    assert(contract?.version === galaxyEnginePresentationContract.version, `${target} export is missing galaxy_engine_contract.`);
    assertNoRendererConfig(`${target} engine export contract`, contract);
    return {
      target,
      validationStatus: payload.validation.status,
      contractVersion: contract?.version
    };
  }));

  console.log(JSON.stringify({
    architectureVersion: ARCHITECTURE_VERSION,
    runtimeVersion: gameRuntimeSchemaVersion,
    contentVersion: gameRuntimeContentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    contract: {
      version: galaxyEnginePresentationContract.version,
      semanticZoom: galaxyEnginePresentationContract.semanticZoom.map((zoom) => zoom.id),
      technologyGates: galaxyEnginePresentationContract.technologyGates.map((gate) => gate.id),
      knowledgeStates: galaxyEnginePresentationContract.knowledgeVisibility.map((state) => state.id),
      presentationClasses: galaxyEnginePresentationContract.presentationClasses.map((item) => item.id),
      platformRenderingProfiles: galaxyEnginePresentationContract.platformRenderingProfiles.map((profile) => profile.id),
      assetRoles: galaxyEnginePresentationContract.assetRoles.map((role) => role.id),
      proceduralFallbackRules: galaxyEnginePresentationContract.proceduralFallbackRules.map((rule) => rule.id)
    },
    runtime: {
      canonicalValidationStatus: canonical.metadata.validationStatus,
      robloxValidationStatus: roblox.metadata.validationStatus,
      galaxyEngineContractVersion: canonical.metadata.galaxyEngineContractVersion
    },
    engineExports: engineResults
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
