import { canonicalBuildingLibrary } from "@/lib/buildings/taxonomy";
import { getGameData } from "@/lib/data";
import { authoredBuildingCollections, authoredBuildingProgressionChains, buildCivilizationEncyclopediaState } from "@/lib/encyclopedia";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const data = await getGameData();
  const state = buildCivilizationEncyclopediaState(data, []);
  const buildingIds = new Set(canonicalBuildingLibrary.map((building) => building.id));
  const entryIds = new Set(state.entries.map((entry) => entry.id));

  assert(authoredBuildingProgressionChains.length >= 5, "Building progression chains must be authored.");
  for (const chain of authoredBuildingProgressionChains) {
    assert(chain.nodes.length >= 2, `${chain.displayName} must include at least two nodes.`);
    assert(chain.validationStatus === "Ready", `${chain.displayName} must validate as Ready.`);
    assert(new Set(chain.nodes.map((node) => node.order)).size === chain.nodes.length, `${chain.displayName} must use unique node order values.`);
    for (const node of chain.nodes) {
      assert(buildingIds.has(node.buildingId), `${chain.displayName} references missing building ${node.buildingId}.`);
      assert(["upgrades_to", "replaces", "branches_to", "evolves_into", "prerequisite_for", "unlocks"].includes(node.relationshipType), `${chain.displayName} uses invalid relationship type ${node.relationshipType}.`);
    }
  }

  assert(authoredBuildingCollections.length >= 10, "Building collections must be authored.");
  for (const collection of authoredBuildingCollections) {
    assert(collection.buildingIds.length > 0, `${collection.displayName} collection must reference buildings.`);
    for (const buildingId of collection.buildingIds) {
      assert(buildingIds.has(buildingId), `${collection.displayName} references missing building ${buildingId}.`);
    }
  }

  assert(state.relationshipGraph.edges.length > 0, "Relationship graph must include progression-chain edges.");
  for (const edge of state.relationshipGraph.edges) {
    assert(entryIds.has(edge.from), `Relationship edge source does not resolve: ${edge.from}.`);
    assert(entryIds.has(edge.to), `Relationship edge target does not resolve: ${edge.to}.`);
  }
  assert(!state.relationshipGraph.brokenRelationships.length, "Relationship graph must not contain broken progression links.");
  assert(!state.relationshipGraph.circularRelationships.length, "Building progression chains must not contain circular relationships.");

  console.log(JSON.stringify({
    ok: true,
    chains: authoredBuildingProgressionChains.map((chain) => ({ chainId: chain.chainId, nodes: chain.nodes.length, status: chain.validationStatus })),
    collections: authoredBuildingCollections.map((collection) => ({ id: collection.id, buildings: collection.buildingIds.length })),
    relationshipEdges: state.relationshipGraph.edges.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
