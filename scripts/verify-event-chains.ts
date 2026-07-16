import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  const framework = runtime.dynamicEventFramework;
  const eventIds = new Set(framework.eventDefinitions.map((event) => event.id));
  const chainIds = new Set(framework.eventChainDefinitions.map((chain) => chain.id));

  for (const id of ["solar_activity_chain", "ancient_signal_chain", "colony_shortage_chain", "ai_optimization_chain"]) {
    assert(chainIds.has(id), `Missing required event chain: ${id}.`);
  }

  for (const chain of framework.eventChainDefinitions) {
    assert(chain.eventIds.length >= 2, `${chain.id} must contain at least two main-path events.`);
    assert(chain.terminalEventIds.length >= 1, `${chain.id} must define terminal events.`);
    const mainPath = new Set<string>();
    for (const eventId of chain.eventIds) {
      assert(eventIds.has(eventId), `${chain.id} references missing event: ${eventId}.`);
      assert(!mainPath.has(eventId), `${chain.id} repeats event ${eventId} in its main path.`);
      mainPath.add(eventId);
    }
    for (const eventId of [...chain.branchEventIds, ...chain.terminalEventIds]) {
      assert(eventIds.has(eventId), `${chain.id} references missing branch/terminal event: ${eventId}.`);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    chains: framework.eventChainDefinitions.map((chain) => ({
      id: chain.id,
      mainPath: chain.eventIds.length,
      branches: chain.branchEventIds.length,
      terminalEvents: chain.terminalEventIds.length
    }))
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
