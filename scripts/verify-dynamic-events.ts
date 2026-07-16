import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, gameRuntimeContentVersion, getGameRuntimeData } from "@/lib/runtime/game-runtime";
import { validateDynamicEventFramework } from "@/lib/events/framework";

const supportedTargets: EngineTarget[] = ["roblox", "unity", "unreal", "godot", "web", "generic"];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertFramework(framework: Awaited<ReturnType<typeof getGameRuntimeData>>["dynamicEventFramework"], label: string) {
  const errors = validateDynamicEventFramework(framework).filter((issue) => issue.severity === "error");
  assert(!errors.length, `${label} has Dynamic Event validation errors: ${errors.map((issue) => `${issue.code}: ${issue.message}`).join("; ")}`);
  assert(framework.id === "dynamic_event_framework_v1", `${label} framework id must be stable.`);
  assert(framework.eventCategoryDefinitions.length === 32, `${label} must publish 32 event categories.`);
  assert(framework.eventTypeDefinitions.length === 23, `${label} must publish 23 event types.`);
  assert(framework.eventLifecycleStateDefinitions.length === 13, `${label} must publish 13 lifecycle states.`);
  assert(framework.eventTriggerPolicies.length === 34, `${label} must publish 34 trigger policies.`);
  assert(framework.eventProbabilityPolicies.length === 12, `${label} must publish 12 probability policies.`);
  assert(framework.eventSeverityDefinitions.length === 7, `${label} must publish 7 severity bands.`);
  assert(framework.eventEffectDefinitions.length === 30, `${label} must publish 30 effect definitions.`);
  assert(framework.eventChoiceDefinitions.length === 20, `${label} must publish 20 choices.`);
  assert(framework.eventChainDefinitions.length === 4, `${label} must publish 4 event chains.`);
  assert(framework.eventDefinitions.length >= 40, `${label} must publish the curated starter event library.`);
  assert(framework.populationSimulationIntegration.implemented === false, `${label} must report Population Simulation as absent.`);
  assert(framework.populationSimulationIntegration.hookOnly === true, `${label} must publish population hooks only while Population Simulation is absent.`);
  assert(framework.activePlayerStatePolicy.exportsActiveEventInstances === false, `${label} must not export active Event instances.`);
  assert(framework.activePlayerStatePolicy.exportsResolvedOutcomes === false, `${label} must not export resolved outcomes.`);
  assert(!/"(?:activeEventInstances|currentModifiers|selectedChoices|generatedPlayerParameters|resolvedOutcomes|playerEventHistory)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} leaked player event state or private paths.`);
}

async function main() {
  assert(gameRuntimeContentVersion >= 31, `Runtime contentVersion must be at least 31; received ${gameRuntimeContentVersion}.`);
  const runtime = await getGameRuntimeData();
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(runtime);

  assertFramework(runtime.dynamicEventFramework, "Internal runtime");
  assertFramework(canonical.dynamicEventFramework, "Canonical public runtime");
  assertFramework(roblox.dynamicEventFramework, "Roblox runtime");

  const engineSummaries = [];
  for (const target of supportedTargets) {
    const exportPayload = await buildGameEngineExport(target);
    assert(exportPayload.validation.status === "Ready", `${target} export must remain Ready.`);
    const framework = exportPayload.canonical.dynamic_event_framework as typeof runtime.dynamicEventFramework;
    assertFramework(framework, `${target} engine export`);
    engineSummaries.push({
      target,
      status: exportPayload.validation.status,
      events: framework.eventDefinitions.length,
      categories: framework.eventCategoryDefinitions.length,
      chains: framework.eventChainDefinitions.length
    });
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: canonical.metadata.contentVersion,
    canonicalChecksum: canonical.metadata.checksum,
    robloxChecksum: roblox.metadata.checksum,
    frameworkId: canonical.dynamicEventFramework.id,
    categories: canonical.dynamicEventFramework.eventCategoryDefinitions.length,
    types: canonical.dynamicEventFramework.eventTypeDefinitions.length,
    lifecycleStates: canonical.dynamicEventFramework.eventLifecycleStateDefinitions.length,
    triggers: canonical.dynamicEventFramework.eventTriggerPolicies.length,
    probabilityPolicies: canonical.dynamicEventFramework.eventProbabilityPolicies.length,
    effects: canonical.dynamicEventFramework.eventEffectDefinitions.length,
    choices: canonical.dynamicEventFramework.eventChoiceDefinitions.length,
    eventLibrary: canonical.dynamicEventFramework.eventDefinitions.length,
    chains: canonical.dynamicEventFramework.eventChainDefinitions.length,
    populationIntegration: canonical.dynamicEventFramework.populationSimulationIntegration,
    missingDefinitions: canonical.dynamicEventFramework.missingCanonicalDefinitions,
    engineSummaries
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
