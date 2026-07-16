import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const framework = runtime.dynamicEventFramework;
  const triggerIds = new Set<string>(framework.eventTriggerPolicies.map((trigger) => trigger.id));
  const reasonCodes = new Set(framework.eventTriggerPolicies.map((trigger) => trigger.canonicalReasonCode));

  assert(framework.eventTriggerPolicies.length === 34, `Expected 34 trigger policies; received ${framework.eventTriggerPolicies.length}.`);
  assert(triggerIds.size === framework.eventTriggerPolicies.length, "Trigger IDs must be unique.");
  assert(reasonCodes.size === framework.eventTriggerPolicies.length, "Trigger canonical reason codes must be unique.");
  assert(framework.eventTriggerPolicies.every((trigger) => trigger.canonicalReasonCode.startsWith("event_trigger_")), "Trigger reason codes must use event_trigger_ prefix.");

  const required = ["time_elapsed", "action_completed", "mission_completed", "expedition_phase", "discovery_state_changed", "registry_claim", "colony_shortage", "route_disruption", "population_threshold", "random_window_with_conditions", "manual_authorized"];
  for (const id of required) assert(triggerIds.has(id), `Missing trigger policy: ${id}.`);

  const eventTriggers = framework.eventDefinitions.flatMap((event) => event.triggerPolicyIds);
  for (const id of eventTriggers) assert(triggerIds.has(id), `Event references missing trigger policy: ${id}.`);

  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    triggerPolicies: framework.eventTriggerPolicies.length,
    protectedTriggers: framework.eventTriggerPolicies.filter((trigger) => trigger.protectedResolutionRequired).map((trigger) => trigger.id),
    eventTriggerReferences: eventTriggers.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
