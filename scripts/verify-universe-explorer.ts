import {
  buildIdentityRelationshipGraph,
  createCanonicalId,
  toIdentityRelationshipRuntimeExport
} from "@/lib/identity-relationships";
import {
  buildUniverseExplorerModel,
  calculateExplorerChangeImpact,
  flattenExplorerTree,
  getExplorerBreadcrumbs,
  getExplorerChildren,
  getExplorerCreateHref,
  getExplorerGeneratorHref,
  getExplorerRelationshipGroups,
  getExplorerSearchResults,
  getExplorerVirtualWindow,
  validateExplorerParentAssignment
} from "@/lib/universe-explorer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const universe = { recordType: "Universe" as const, sourceId: "explorer-universe" };
  const galaxy = { recordType: "Galaxy" as const, sourceId: "explorer-galaxy" };
  const region = { recordType: "Galactic Region" as const, sourceId: "explorer-region" };
  const system = { recordType: "Star System" as const, sourceId: "explorer-system" };
  const planet = { recordType: "Planet" as const, sourceId: "explorer-planet" };
  const creature = { recordType: "Creature" as const, sourceId: "explorer-creature" };
  const asset = { recordType: "Asset" as const, sourceId: "explorer-asset" };
  const orphan = { recordType: "Discovery" as const, sourceId: "explorer-orphan" };
  const graph = buildIdentityRelationshipGraph(
    [
      { ...universe, displayName: "NOVERIS Universe", ownerSource: "studio" },
      { ...galaxy, displayName: "Milky Way", ownerSource: universe },
      { ...region, displayName: "Orion Spur", ownerSource: galaxy },
      { ...system, displayName: "Sol", ownerSource: region },
      { ...planet, displayName: "Earth", ownerSource: system },
      { ...creature, displayName: "Aurovale Skimmer", ownerSource: planet },
      { ...asset, displayName: "Earth Hero", ownerSource: planet },
      { ...orphan, displayName: "Unassigned Curiosity", ownerSource: "studio" }
    ],
    [
      { from: galaxy, to: universe, relationshipType: "parent", referenceType: "hard" },
      { from: region, to: galaxy, relationshipType: "parent", referenceType: "hard" },
      { from: system, to: region, relationshipType: "parent", referenceType: "hard" },
      { from: planet, to: system, relationshipType: "parent", referenceType: "hard" },
      { from: creature, to: planet, relationshipType: "parent", referenceType: "hard" },
      { from: asset, to: planet, relationshipType: "references", referenceType: "runtime" },
      { from: planet, to: asset, relationshipType: "uses", referenceType: "production" }
    ]
  );
  const model = buildUniverseExplorerModel(graph);
  const earthId = createCanonicalId("Planet", planet.sourceId);
  const solId = createCanonicalId("Star System", system.sourceId);
  const earth = model.nodeById.get(earthId);
  assert(earth?.parentId === solId, "Explorer did not construct the typed planet parent hierarchy.");
  assert(getExplorerChildren(model, solId).nodes.some((node) => node.canonicalId === earthId), "Explorer lazy child lookup failed.");
  assert(getExplorerBreadcrumbs(model, earthId).map((node) => node.displayName).join(" / ") === "NOVERIS Universe / Milky Way / Orion Spur / Sol / Earth", "Explorer breadcrumbs are not canonical.");
  assert(getExplorerSearchResults(model, "orion").some((node) => node.recordType === "Galactic Region"), "Explorer search did not resolve a canonical display name.");
  assert(getExplorerGeneratorHref(earth!).includes("canonicalId=noveris%3Aplanet%3Aexplorer-planet"), "Explorer generator route does not preserve canonical context.");
  const createHref = getExplorerCreateHref(earth!, "Creature");
  assert(createHref?.includes("parentCanonicalId=noveris%3Aplanet%3Aexplorer-planet"), "Create-in-context does not pass the canonical parent ID.");
  assert(!getExplorerCreateHref(earth!, "Galaxy"), "Explorer allowed an invalid contextual child type.");
  assert(validateExplorerParentAssignment(model, earthId, solId).valid, "Explorer rejected a valid planet parent assignment.");
  assert(!validateExplorerParentAssignment(model, earthId, createCanonicalId("Creature", creature.sourceId)).valid, "Explorer allowed an invalid parent type.");
  assert(validateExplorerParentAssignment(model, createCanonicalId("Galaxy", galaxy.sourceId), createCanonicalId("Galactic Region", region.sourceId)).reason?.includes("circular"), "Explorer did not prevent a circular parent assignment.");
  assert(model.nodeById.get(createCanonicalId("Discovery", orphan.sourceId))?.isOrphan, "Explorer orphan view failed to detect Studio-owned records.");
  assert(getExplorerRelationshipGroups(model, earthId).some((group) => group.relationshipType === "uses"), "Relationship inspector did not resolve typed links.");
  assert(calculateExplorerChangeImpact(model, earthId).affectedAssetIds.includes(createCanonicalId("Asset", asset.sourceId)), "Impact analysis did not include referenced assets.");

  const allRows = flattenExplorerTree(model, {
    visibleIds: new Set(model.nodes.map((node) => node.canonicalId)),
    expandedIds: new Set(model.nodes.filter((node) => node.isExpandable).map((node) => node.canonicalId)),
    sortMode: "canonical"
  });
  assert(allRows.length >= 7, "Explorer flattening did not return the hierarchy.");
  const window = getExplorerVirtualWindow(100_000, 240_000, 760);
  assert(window.height === 3_800_000 && window.end - window.start < 50, "Explorer virtualization does not bound the 100k record render window.");

  const runtime = toIdentityRelationshipRuntimeExport(graph);
  const serializedRuntime = JSON.stringify(runtime);
  for (const privateField of ["canonicalOwnerId", "createdAt", "updatedAt", "generatorRoute", "favoriteIds", "recentIds"]) {
    assert(!serializedRuntime.includes(`\"${privateField}\"`), `Runtime sanitization leaked ${privateField}.`);
  }

  console.log(JSON.stringify({
    status: "Ready",
    fixtureRecords: model.nodes.length,
    hierarchyRows: allRows.length,
    virtualRowsRendered: window.end - window.start,
    orphanRecords: model.nodes.filter((node) => node.isOrphan).length,
    runtimeSanitized: true
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
