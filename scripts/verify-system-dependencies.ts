import { getArchitectureState } from "@/lib/architecture";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function hasCycle(edges: Array<{ from: string; to: string; kind: string }>) {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges.filter((item) => item.kind === "required")) adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to]);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(node: string): boolean {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of adjacency.get(node) ?? []) if (visit(next)) return true;
    visiting.delete(node);
    visited.add(node);
    return false;
  }
  return [...adjacency.keys()].some((node) => visit(node));
}

async function main() {
  const state = await getArchitectureState();
  const graph = state.coreArchitectureAudit.dependencyGraph;
  const edgeKeys = new Set(graph.map((edge) => `${edge.from}->${edge.to}`));
  for (const required of ["Action System->Planet Development", "Planet Development->Colonization", "Colonization->Population", "Population->Economy & Logistics", "Economy & Logistics->Missions", "Missions->Dynamic Events"]) {
    assert(edgeKeys.has(required), `Missing required dependency: ${required}`);
  }
  assert(edgeKeys.has("Civilization Identity->Completed Actions"), "Civilization Identity must consume completed Action influence.");
  assert(edgeKeys.has("Discovery System->Universal Discovery Registry"), "Discovery must connect to the Universal Discovery Registry.");
  assert(!hasCycle(graph), "Required system dependency graph contains an invalid cycle.");
  assert(graph.some((edge) => edge.kind === "future" && edge.from === "Living Universe Framework"), "Living Universe must be documented as future dependency, not implemented here.");

  console.log(JSON.stringify({
    ok: true,
    dependencies: graph.length,
    required: graph.filter((edge) => edge.kind === "required").length,
    optional: graph.filter((edge) => edge.kind === "optional").length,
    future: graph.filter((edge) => edge.kind === "future").length,
    invalidCycles: 0
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
