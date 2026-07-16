import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, getGameRuntimeData } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertKnowledgeSafety(framework: Awaited<ReturnType<typeof getGameRuntimeData>>["dynamicEventFramework"], label: string) {
  const unknown = framework.eventKnowledgeVisibility.find((rule) => rule.knowledgeStateId === "unknown");
  const detected = framework.eventKnowledgeVisibility.find((rule) => rule.knowledgeStateId === "detected");
  assert(unknown, `${label} must publish unknown knowledge visibility rule.`);
  assert(detected, `${label} must publish detected knowledge visibility rule.`);
  assert(unknown.canShowName === false, `${label} unknown events must hide names.`);
  assert(unknown.canShowResources === false, `${label} unknown events must hide resources.`);
  assert(unknown.canShowArtifacts === false, `${label} unknown events must hide artifacts.`);
  assert(unknown.canShowLifeforms === false, `${label} unknown events must hide lifeforms.`);
  assert(unknown.fallbackText === "???", `${label} unknown fallback must be ???.`);
  assert(detected.canShowTargetRegistry === false, `${label} detected events must hide registry attribution.`);
  assert(framework.eventDefinitions.every((event) => !/secret|hidden resource|private/i.test(event.publicDescription)), `${label} public descriptions must not leak hidden information.`);
  assert(!/"(?:activeEventInstances|currentModifiers|selectedChoices|generatedPlayerParameters|resolvedOutcomes|playerEventHistory)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} leaked player event state or private paths.`);
}

async function main() {
  const runtime = await getGameRuntimeData();
  const canonical = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(runtime);

  assertKnowledgeSafety(runtime.dynamicEventFramework, "Internal runtime");
  assertKnowledgeSafety(canonical.dynamicEventFramework, "Canonical public runtime");
  assertKnowledgeSafety(roblox.dynamicEventFramework, "Roblox runtime");

  console.log(JSON.stringify({
    ok: true,
    contentVersion: canonical.metadata.contentVersion,
    knowledgeRules: canonical.dynamicEventFramework.eventKnowledgeVisibility.length,
    unknownFallback: canonical.dynamicEventFramework.eventKnowledgeVisibility.find((rule) => rule.knowledgeStateId === "unknown")?.fallbackText,
    publicEventDescriptionsChecked: canonical.dynamicEventFramework.eventDefinitions.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
