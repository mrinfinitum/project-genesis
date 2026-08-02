import { getUniverseLibrarySource, UNIVERSE_LIBRARY_SEED } from "@/lib/universe/library";

export const IDENTITY_RELATIONSHIP_SYSTEM_ID = "noveris-identity-relationships";
export const IDENTITY_RELATIONSHIP_SYSTEM_VERSION = "1.0.0";
export const CANONICAL_SYSTEM_OWNER_ID = "studio";
export const IDENTITY_RELATIONSHIP_CREATED_AT = "2026-08-02T00:00:00.000Z";

export const canonicalRecordTypes = [
  "Universe",
  "Galaxy",
  "Galactic Region",
  "Star System",
  "Star",
  "Planet",
  "Moon",
  "Settlement",
  "Colony",
  "Civilization",
  "Faction",
  "Creature",
  "Plant",
  "Fungus",
  "Microorganism",
  "Biome",
  "Weather",
  "Climate",
  "Season",
  "Resource",
  "Material",
  "Building",
  "Research",
  "Upgrade",
  "Mission",
  "Event",
  "Discovery",
  "Prompt",
  "Asset",
  "Species Plate",
  "Background",
  "Screen Template",
  "Component",
  "Design Token"
] as const;

export const relationshipTypes = [
  "parent",
  "child",
  "contains",
  "belongs_to",
  "depends_on",
  "uses",
  "requires",
  "produces",
  "consumes",
  "unlocks",
  "references",
  "owns",
  "publishes",
  "renders",
  "derived_from",
  "variant_of",
  "related_to"
] as const;

export const referenceTypes = ["soft", "hard", "runtime", "production", "preview"] as const;

export type CanonicalRecordType = (typeof canonicalRecordTypes)[number];
export type CanonicalRelationshipType = (typeof relationshipTypes)[number];
export type CanonicalReferenceType = (typeof referenceTypes)[number];

export type CanonicalIdentity = {
  canonicalId: string;
  sourceId: string;
  displayName: string;
  slug: string;
  recordType: CanonicalRecordType;
  version: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  canonicalOwnerId: string;
  incomingRelationshipIds: string[];
  outgoingRelationshipIds: string[];
  dependencyCount: number;
  childCount: number;
  parentCount: number;
};

export type CanonicalRelationship = {
  id: string;
  fromCanonicalId: string;
  toCanonicalId: string;
  relationshipType: CanonicalRelationshipType;
  referenceType: CanonicalReferenceType;
};

export type IdentityRelationshipIssue = {
  severity: "error" | "warning";
  code: "orphan_record" | "missing_parent" | "duplicate_canonical_id" | "invalid_relationship" | "broken_dependency" | "circular_parent" | "circular_dependency" | "broken_reference" | "missing_owner" | "unknown_type";
  message: string;
  records: string[];
};

export type ChangeImpact = {
  canonicalId: string;
  affectedObjectIds: string[];
  affectedAssetIds: string[];
  affectedPromptIds: string[];
  unityExportIds: string[];
  productionIds: string[];
};

export type IdentityRelationshipGraph = {
  id: typeof IDENTITY_RELATIONSHIP_SYSTEM_ID;
  version: typeof IDENTITY_RELATIONSHIP_SYSTEM_VERSION;
  systemOwnerId: typeof CANONICAL_SYSTEM_OWNER_ID;
  records: CanonicalIdentity[];
  relationships: CanonicalRelationship[];
  validation: {
    status: "Ready" | "Blocked";
    issues: IdentityRelationshipIssue[];
  };
};

export type IdentityRelationshipRuntimeRecord = Pick<CanonicalIdentity, "canonicalId" | "displayName" | "slug" | "recordType" | "status"> & {
  parentCanonicalId: string | null;
  childCanonicalIds: string[];
  runtimeReferenceIds: string[];
};

export type IdentityRelationshipRuntimeExport = {
  id: typeof IDENTITY_RELATIONSHIP_SYSTEM_ID;
  version: typeof IDENTITY_RELATIONSHIP_SYSTEM_VERSION;
  status: "Ready" | "Blocked";
  records: IdentityRelationshipRuntimeRecord[];
  relationships: Array<Pick<CanonicalRelationship, "fromCanonicalId" | "toCanonicalId" | "relationshipType" | "referenceType">>;
};

type CanonicalObjectInput = {
  sourceId: string;
  displayName: string;
  recordType: CanonicalRecordType;
  version?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerSource?: { recordType: CanonicalRecordType; sourceId: string } | "studio";
};

type RelationshipInput = {
  from: { recordType: CanonicalRecordType; sourceId: string };
  to: { recordType: CanonicalRecordType; sourceId: string };
  relationshipType: CanonicalRelationshipType;
  referenceType?: CanonicalReferenceType;
};

type RuntimeIdentitySource = {
  resources: Array<Record<string, unknown>>;
  discoveries: Array<Record<string, unknown>>;
  buildingLibrary: Array<Record<string, unknown>>;
  upgrades: Array<Record<string, unknown>>;
  assets: Array<Record<string, unknown>>;
  species: Array<Record<string, unknown>>;
  speciesOccurrences: Array<Record<string, unknown>>;
  speciesPlates: Array<Record<string, unknown>>;
  planetPrompts?: Array<Record<string, unknown>>;
  research?: Array<Record<string, unknown>>;
  actionSystem?: Record<string, unknown>;
  dynamicEventFramework?: Record<string, unknown>;
  missionExpeditionFramework?: Record<string, unknown>;
  planetDeepDataFramework?: Record<string, unknown>;
  componentLibrary?: Record<string, unknown>;
  screenTemplateLibrary?: Record<string, unknown>;
  designLanguage?: Record<string, unknown>;
};

function stableSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled";
}

export function createCanonicalId(recordType: CanonicalRecordType, sourceId: string) {
  return `noveris:${stableSlug(recordType)}:${encodeURIComponent(sourceId)}`;
}

function recordId(input: { recordType: CanonicalRecordType; sourceId: string }) {
  return createCanonicalId(input.recordType, input.sourceId);
}

function valueAsString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "";
}

function firstString(record: Record<string, unknown>, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = valueAsString(record[key]);
    if (value) return value;
  }
  return fallback;
}

function arrayOfRecords(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object" && !Array.isArray(row)) : [];
}

function relationshipId(input: CanonicalRelationship) {
  return `${input.relationshipType}:${input.referenceType}:${input.fromCanonicalId}:${input.toCanonicalId}`;
}

function relationshipSort(left: CanonicalRelationship, right: CanonicalRelationship) {
  return left.id.localeCompare(right.id);
}

function identitySort(left: CanonicalIdentity, right: CanonicalIdentity) {
  return left.canonicalId.localeCompare(right.canonicalId);
}

function addHierarchyRelationships(relationships: RelationshipInput[], child: RelationshipInput["from"], parent: RelationshipInput["to"]) {
  relationships.push(
    { from: child, to: parent, relationshipType: "parent", referenceType: "hard" },
    { from: parent, to: child, relationshipType: "child", referenceType: "hard" },
    { from: parent, to: child, relationshipType: "contains", referenceType: "hard" }
  );
}

function addOwnershipRelationship(relationships: RelationshipInput[], child: RelationshipInput["from"], owner: RelationshipInput["to"]) {
  relationships.push(
    { from: child, to: owner, relationshipType: "belongs_to", referenceType: "hard" },
    { from: owner, to: child, relationshipType: "owns", referenceType: "hard" }
  );
}

function relationshipCycles(records: CanonicalIdentity[], relationships: CanonicalRelationship[], type: "parent" | "depends_on") {
  const adjacency = new Map<string, string[]>();
  for (const record of records) adjacency.set(record.canonicalId, []);
  for (const relationship of relationships.filter((row) => row.relationshipType === type)) {
    adjacency.get(relationship.fromCanonicalId)?.push(relationship.toCanonicalId);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycles = new Set<string>();
  const walk = (id: string, trail: string[]) => {
    if (visiting.has(id)) {
      const start = trail.indexOf(id);
      for (const cycleId of trail.slice(start)) cycles.add(cycleId);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const target of adjacency.get(id) ?? []) walk(target, [...trail, id]);
    visiting.delete(id);
    visited.add(id);
  };

  for (const record of records) walk(record.canonicalId, []);
  return [...cycles].sort();
}

export function validateIdentityRelationshipGraph(graph: Pick<IdentityRelationshipGraph, "records" | "relationships" | "systemOwnerId">) {
  const issues: IdentityRelationshipIssue[] = [];
  const recordById = new Map<string, CanonicalIdentity>();
  const duplicateIds = new Set<string>();

  for (const record of graph.records) {
    if (!canonicalRecordTypes.includes(record.recordType)) {
      issues.push({ severity: "error", code: "unknown_type", message: "A canonical identity uses an unsupported record type.", records: [record.canonicalId, record.recordType] });
    }
    if (recordById.has(record.canonicalId)) duplicateIds.add(record.canonicalId);
    recordById.set(record.canonicalId, record);
    if (!record.canonicalOwnerId) {
      issues.push({ severity: "error", code: "missing_owner", message: "Every canonical record requires one canonical owner.", records: [record.canonicalId] });
    } else if (record.canonicalOwnerId !== graph.systemOwnerId && !recordById.has(record.canonicalOwnerId)) {
      // Owner records can appear later; a complete owner pass runs below.
    }
  }
  if (duplicateIds.size) issues.push({ severity: "error", code: "duplicate_canonical_id", message: "Canonical IDs must be globally unique.", records: [...duplicateIds].sort() });

  for (const record of graph.records) {
    if (record.canonicalOwnerId !== graph.systemOwnerId && !recordById.has(record.canonicalOwnerId)) {
      issues.push({ severity: "error", code: "missing_owner", message: "A canonical owner does not resolve to a known canonical record.", records: [record.canonicalId, record.canonicalOwnerId] });
    }
  }

  const relationshipIds = new Set<string>();
  for (const relationship of graph.relationships) {
    if (relationshipIds.has(relationship.id)) {
      issues.push({ severity: "error", code: "invalid_relationship", message: "Relationships must have globally unique stable IDs.", records: [relationship.id] });
    }
    relationshipIds.add(relationship.id);
    if (!relationshipTypes.includes(relationship.relationshipType) || !referenceTypes.includes(relationship.referenceType)) {
      issues.push({ severity: "error", code: "invalid_relationship", message: "A relationship type or reference type is unsupported.", records: [relationship.id] });
    }
    if (!recordById.has(relationship.fromCanonicalId) || !recordById.has(relationship.toCanonicalId)) {
      issues.push({ severity: relationship.relationshipType === "depends_on" ? "error" : "warning", code: relationship.relationshipType === "depends_on" ? "broken_dependency" : "broken_reference", message: "A relationship endpoint does not resolve to a canonical record.", records: [relationship.id, relationship.fromCanonicalId, relationship.toCanonicalId] });
    }
  }

  const parentCycles = relationshipCycles(graph.records, graph.relationships, "parent");
  if (parentCycles.length) issues.push({ severity: "error", code: "circular_parent", message: "Canonical parent relationships cannot contain a cycle.", records: parentCycles });
  const dependencyCycles = relationshipCycles(graph.records, graph.relationships, "depends_on");
  if (dependencyCycles.length) issues.push({ severity: "error", code: "circular_dependency", message: "Canonical dependencies cannot contain a cycle.", records: dependencyCycles });

  const parentIds = new Set(graph.relationships.filter((relationship) => relationship.relationshipType === "parent").map((relationship) => relationship.fromCanonicalId));
  for (const record of graph.records) {
    if (record.recordType !== "Universe" && record.canonicalOwnerId !== graph.systemOwnerId && !parentIds.has(record.canonicalId)) {
      issues.push({ severity: "warning", code: "missing_parent", message: "A record has an owner but no explicit parent hierarchy relationship.", records: [record.canonicalId, record.canonicalOwnerId] });
    }
    if (record.recordType !== "Universe" && record.canonicalOwnerId === graph.systemOwnerId) {
      issues.push({ severity: "warning", code: "orphan_record", message: "A non-root canonical record is owned by Studio instead of a canonical object.", records: [record.canonicalId] });
    }
  }

  return issues.sort((left, right) => `${left.code}:${left.records.join(":")}`.localeCompare(`${right.code}:${right.records.join(":")}`));
}

export function buildIdentityRelationshipGraph(inputs: CanonicalObjectInput[], relationshipInputs: RelationshipInput[]): IdentityRelationshipGraph {
  const recordById = new Map<string, CanonicalIdentity>();
  const sourceToCanonicalId = new Map<string, string>();
  const duplicateSourceIds = new Set<string>();

  for (const input of inputs) {
    const canonicalId = createCanonicalId(input.recordType, input.sourceId);
    const key = `${input.recordType}:${input.sourceId}`;
    if (recordById.has(canonicalId)) duplicateSourceIds.add(canonicalId);
    sourceToCanonicalId.set(key, canonicalId);
    const ownerSource = input.ownerSource ?? "studio";
    const canonicalOwnerId = ownerSource === "studio" ? CANONICAL_SYSTEM_OWNER_ID : recordId(ownerSource);
    recordById.set(canonicalId, {
      canonicalId,
      sourceId: input.sourceId,
      displayName: input.displayName,
      slug: stableSlug(input.displayName),
      recordType: input.recordType,
      version: input.version ?? "1.0.0",
      status: input.status ?? "published",
      createdAt: input.createdAt ?? IDENTITY_RELATIONSHIP_CREATED_AT,
      updatedAt: input.updatedAt ?? input.createdAt ?? IDENTITY_RELATIONSHIP_CREATED_AT,
      canonicalOwnerId,
      incomingRelationshipIds: [],
      outgoingRelationshipIds: [],
      dependencyCount: 0,
      childCount: 0,
      parentCount: 0
    });
  }

  const relationships = new Map<string, CanonicalRelationship>();
  for (const input of relationshipInputs) {
    const fromCanonicalId = sourceToCanonicalId.get(`${input.from.recordType}:${input.from.sourceId}`) ?? recordId(input.from);
    const toCanonicalId = sourceToCanonicalId.get(`${input.to.recordType}:${input.to.sourceId}`) ?? recordId(input.to);
    const relationship: CanonicalRelationship = {
      id: "",
      fromCanonicalId,
      toCanonicalId,
      relationshipType: input.relationshipType,
      referenceType: input.referenceType ?? "soft"
    };
    relationship.id = relationshipId(relationship);
    relationships.set(relationship.id, relationship);
  }

  const records = [...recordById.values()].sort(identitySort);
  const relationshipRows = [...relationships.values()].sort(relationshipSort);
  const outgoing = new Map<string, CanonicalRelationship[]>();
  const incoming = new Map<string, CanonicalRelationship[]>();
  for (const relationship of relationshipRows) {
    outgoing.set(relationship.fromCanonicalId, [...(outgoing.get(relationship.fromCanonicalId) ?? []), relationship]);
    incoming.set(relationship.toCanonicalId, [...(incoming.get(relationship.toCanonicalId) ?? []), relationship]);
  }
  for (const record of records) {
    const incomingRows = incoming.get(record.canonicalId) ?? [];
    const outgoingRows = outgoing.get(record.canonicalId) ?? [];
    record.incomingRelationshipIds = incomingRows.map((relationship) => relationship.id).sort();
    record.outgoingRelationshipIds = outgoingRows.map((relationship) => relationship.id).sort();
    record.dependencyCount = outgoingRows.filter((relationship) => relationship.relationshipType === "depends_on").length;
    record.childCount = outgoingRows.filter((relationship) => relationship.relationshipType === "child").length;
    record.parentCount = outgoingRows.filter((relationship) => relationship.relationshipType === "parent").length;
  }

  const graph: IdentityRelationshipGraph = {
    id: IDENTITY_RELATIONSHIP_SYSTEM_ID,
    version: IDENTITY_RELATIONSHIP_SYSTEM_VERSION,
    systemOwnerId: CANONICAL_SYSTEM_OWNER_ID,
    records,
    relationships: relationshipRows,
    validation: { status: "Ready", issues: [] }
  };
  const issues = validateIdentityRelationshipGraph(graph);
  if (duplicateSourceIds.size) issues.push({ severity: "error", code: "duplicate_canonical_id", message: "Input records generated duplicate canonical identities.", records: [...duplicateSourceIds].sort() });
  graph.validation = { status: issues.some((issue) => issue.severity === "error") ? "Blocked" : "Ready", issues };
  return graph;
}

function pushInput(inputs: CanonicalObjectInput[], input: CanonicalObjectInput) {
  if (!input.sourceId.trim()) return;
  inputs.push(input);
}

function recordTypeForSpecies(record: Record<string, unknown>): CanonicalRecordType {
  const taxonomy = record.taxonomy as Record<string, unknown> | undefined;
  const kingdom = valueAsString(taxonomy?.kingdom).toLowerCase();
  if (kingdom.includes("plant") || kingdom.includes("flora")) return "Plant";
  if (kingdom.includes("fung")) return "Fungus";
  if (kingdom.includes("micro")) return "Microorganism";
  return "Creature";
}

function recordTypeForBody(record: Record<string, unknown>): CanonicalRecordType {
  return valueAsString(record.celestial_body_type).toLowerCase() === "moon" ? "Moon" : "Planet";
}

export function buildIdentityRelationshipGraphFromRuntime(runtime: RuntimeIdentitySource): IdentityRelationshipGraph {
  const source = getUniverseLibrarySource();
  const inputs: CanonicalObjectInput[] = [];
  const relationships: RelationshipInput[] = [];
  const universe = { recordType: "Universe" as const, sourceId: UNIVERSE_LIBRARY_SEED };
  const resourceIds = new Set(runtime.resources.map((record) => firstString(record, ["id"], "")).filter(Boolean));
  const buildingIds = new Set(runtime.buildingLibrary.map((record) => firstString(record, ["id"], "")).filter(Boolean));
  const researchIds = new Set((runtime.research ?? []).map((record) => firstString(record, ["id"], "")).filter(Boolean));
  const componentIds = new Set(arrayOfRecords(runtime.componentLibrary?.components).map((record) => firstString(record, ["id"], "")).filter(Boolean));
  const planetIds = new Set(
    source.bodies
      .filter((body) => recordTypeForBody(body as unknown as Record<string, unknown>) === "Planet")
      .map((body) => body.id)
  );
  pushInput(inputs, { ...universe, displayName: "NOVERIS Universe", ownerSource: "studio", status: "published" });

  for (const galaxy of source.galaxies) {
    const item = { recordType: "Galaxy" as const, sourceId: galaxy.id };
    pushInput(inputs, { ...item, displayName: galaxy.name, ownerSource: universe, status: "generated" });
    addHierarchyRelationships(relationships, item, universe);
    addOwnershipRelationship(relationships, item, universe);
  }
  for (const region of source.sectors) {
    const item = { recordType: "Galactic Region" as const, sourceId: region.id };
    const parent = { recordType: "Galaxy" as const, sourceId: region.galaxy_id };
    pushInput(inputs, { ...item, displayName: region.sector_name, ownerSource: parent, status: "generated" });
    addHierarchyRelationships(relationships, item, parent);
    addOwnershipRelationship(relationships, item, parent);
  }
  for (const system of source.starSystems) {
    const item = { recordType: "Star System" as const, sourceId: system.id };
    const parent = { recordType: "Galactic Region" as const, sourceId: system.sector_id };
    pushInput(inputs, { ...item, displayName: system.system_name, ownerSource: parent, status: "generated" });
    addHierarchyRelationships(relationships, item, parent);
    addOwnershipRelationship(relationships, item, parent);
  }
  for (const star of source.stars) {
    const item = { recordType: "Star" as const, sourceId: star.id };
    const parent = { recordType: "Star System" as const, sourceId: star.system_id };
    pushInput(inputs, { ...item, displayName: star.star_name, ownerSource: parent, status: "generated" });
    addHierarchyRelationships(relationships, item, parent);
    addOwnershipRelationship(relationships, item, parent);
  }
  const bodyById = new Map(source.bodies.map((body) => [body.id, body]));
  for (const body of source.bodies) {
    const recordType = recordTypeForBody(body as unknown as Record<string, unknown>);
    const item = { recordType, sourceId: body.id };
    const parentBody = body.parent_body_id ? bodyById.get(body.parent_body_id) : null;
    const parent = parentBody
      ? { recordType: recordTypeForBody(parentBody as unknown as Record<string, unknown>), sourceId: parentBody.id }
      : { recordType: "Star System" as const, sourceId: body.system_id };
    pushInput(inputs, { ...item, displayName: body.name, ownerSource: parent, status: "generated" });
    addHierarchyRelationships(relationships, item, parent);
    addOwnershipRelationship(relationships, item, parent);
    for (const resourceId of body.resources.filter((resourceId) => resourceIds.has(resourceId))) {
      relationships.push({ from: item, to: { recordType: "Resource", sourceId: resourceId }, relationshipType: "uses", referenceType: "runtime" });
    }
  }

  for (const resource of runtime.resources) {
    const sourceId = firstString(resource, ["id"], "");
    const item = { recordType: "Resource" as const, sourceId };
    pushInput(inputs, { ...item, displayName: firstString(resource, ["displayName", "name", "resource_name"], sourceId), ownerSource: universe, status: firstString(resource, ["status"], "published") });
    addOwnershipRelationship(relationships, item, universe);
  }
  for (const discovery of runtime.discoveries) {
    const sourceId = firstString(discovery, ["id"], "");
    const item = { recordType: "Discovery" as const, sourceId };
    pushInput(inputs, { ...item, displayName: firstString(discovery, ["displayName", "name"], sourceId), ownerSource: universe, status: firstString(discovery, ["publicationStatus", "status"], "published") });
    addOwnershipRelationship(relationships, item, universe);
    for (const resourceId of Array.isArray(discovery.relatedResourceIds) ? discovery.relatedResourceIds.filter((id): id is string => typeof id === "string" && resourceIds.has(id)) : []) {
      relationships.push({ from: item, to: { recordType: "Resource", sourceId: resourceId }, relationshipType: "references", referenceType: "runtime" });
    }
    for (const buildingId of Array.isArray(discovery.relatedBuildingIds) ? discovery.relatedBuildingIds.filter((id): id is string => typeof id === "string" && buildingIds.has(id)) : []) {
      relationships.push({ from: item, to: { recordType: "Building", sourceId: buildingId }, relationshipType: "references", referenceType: "hard" });
    }
  }
  for (const building of runtime.buildingLibrary) {
    const sourceId = firstString(building, ["id"], "");
    const item = { recordType: "Building" as const, sourceId };
    pushInput(inputs, { ...item, displayName: firstString(building, ["displayName", "name"], sourceId), ownerSource: universe, status: firstString(building, ["status"], "draft") });
    addOwnershipRelationship(relationships, item, universe);
    for (const dependencyId of Array.isArray(building.dependencies) ? building.dependencies.filter((id): id is string => typeof id === "string" && buildingIds.has(id)) : []) {
      relationships.push({ from: item, to: { recordType: "Building", sourceId: dependencyId }, relationshipType: "depends_on", referenceType: "hard" });
    }
    for (const resourceId of [...(Array.isArray(building.inputs) ? building.inputs : []), ...(Array.isArray(building.outputs) ? building.outputs : [])].filter((id): id is string => typeof id === "string" && resourceIds.has(id))) {
      relationships.push({ from: item, to: { recordType: "Resource", sourceId: resourceId }, relationshipType: Array.isArray(building.outputs) && building.outputs.includes(resourceId) ? "produces" : "consumes", referenceType: "runtime" });
    }
  }
  for (const research of runtime.research ?? []) {
    const sourceId = firstString(research, ["id"], "");
    const item = { recordType: "Research" as const, sourceId };
    pushInput(inputs, { ...item, displayName: firstString(research, ["name", "displayName"], sourceId), ownerSource: universe, status: firstString(research, ["status"], "published") });
    addOwnershipRelationship(relationships, item, universe);
  }
  for (const upgrade of runtime.upgrades) {
    const sourceId = firstString(upgrade, ["id"], "");
    const item = { recordType: "Upgrade" as const, sourceId };
    pushInput(inputs, { ...item, displayName: firstString(upgrade, ["displayName", "name"], sourceId), ownerSource: universe, status: firstString(upgrade, ["status"], "published") });
    addOwnershipRelationship(relationships, item, universe);
    const requiredResearch = firstString(upgrade, ["researchId", "requiredResearchId"], "");
    if (requiredResearch && researchIds.has(requiredResearch)) relationships.push({ from: item, to: { recordType: "Research", sourceId: requiredResearch }, relationshipType: "requires", referenceType: "runtime" });
  }
  for (const species of runtime.species) {
    const sourceId = firstString(species, ["id"], "");
    const recordType = recordTypeForSpecies(species);
    const item = { recordType, sourceId };
    const originPlanetId = firstString(species, ["originPlanetId"], "");
    const parent = originPlanetId && planetIds.has(originPlanetId) ? { recordType: "Planet" as const, sourceId: originPlanetId } : universe;
    pushInput(inputs, { ...item, displayName: firstString(species, ["displayName", "generatedName", "name"], sourceId), ownerSource: parent, status: firstString(species, ["canonStatus", "status"], "published") });
    if (originPlanetId && planetIds.has(originPlanetId)) addHierarchyRelationships(relationships, item, parent);
    addOwnershipRelationship(relationships, item, parent);
  }
  for (const occurrence of runtime.speciesOccurrences) {
    const speciesId = firstString(occurrence, ["speciesId"], "");
    const planetId = firstString(occurrence, ["planetId"], "");
    const species = runtime.species.find((record) => firstString(record, ["id"], "") === speciesId);
    if (!speciesId || !planetId || !planetIds.has(planetId) || !species) continue;
    relationships.push({ from: { recordType: recordTypeForSpecies(species), sourceId: speciesId }, to: { recordType: "Planet", sourceId: planetId }, relationshipType: "references", referenceType: "runtime" });
  }
  for (const plate of runtime.speciesPlates) {
    const sourceId = firstString(plate, ["speciesPlateId", "id"], "");
    const speciesId = firstString(plate, ["speciesId"], "");
    const item = { recordType: "Species Plate" as const, sourceId };
    const parentSpecies = runtime.species.find((record) => firstString(record, ["id"], "") === speciesId);
    const parent = parentSpecies ? { recordType: recordTypeForSpecies(parentSpecies), sourceId: speciesId } : universe;
    pushInput(inputs, { ...item, displayName: firstString(plate, ["displayName", "speciesPlateId"], sourceId), ownerSource: parent, status: firstString(plate, ["productionStatus", "status"], "planned") });
    addOwnershipRelationship(relationships, item, parent);
    if (parentSpecies) addHierarchyRelationships(relationships, item, parent);
  }
  for (const prompt of runtime.planetPrompts ?? []) {
    const sourceId = firstString(prompt, ["id"], "");
    const item = { recordType: "Prompt" as const, sourceId };
    const planetId = firstString(prompt, ["planet_id", "planetId"], "");
    const owner = planetId && planetIds.has(planetId) ? { recordType: "Planet" as const, sourceId: planetId } : universe;
    pushInput(inputs, {
      ...item,
      displayName: firstString(prompt, ["prompt_type", "displayName", "name"], sourceId),
      ownerSource: owner,
      status: firstString(prompt, ["status"], "draft"),
      createdAt: firstString(prompt, ["created_at", "createdAt"], IDENTITY_RELATIONSHIP_CREATED_AT),
      updatedAt: firstString(prompt, ["updated_at", "updatedAt"], IDENTITY_RELATIONSHIP_CREATED_AT)
    });
    addOwnershipRelationship(relationships, item, owner);
  }
  for (const asset of runtime.assets) {
    const sourceId = firstString(asset, ["id"], "");
    const item = { recordType: "Asset" as const, sourceId };
    pushInput(inputs, { ...item, displayName: firstString(asset, ["displayName", "name", "artKey", "iconKey"], sourceId), ownerSource: universe, status: firstString(asset, ["status", "productionStatus"], "published") });
    addOwnershipRelationship(relationships, item, universe);
  }

  const componentLibrary = runtime.componentLibrary ?? {};
  for (const component of arrayOfRecords(componentLibrary.components)) {
    const sourceId = firstString(component, ["id"], "");
    const item = { recordType: "Component" as const, sourceId };
    pushInput(inputs, { ...item, displayName: firstString(component, ["displayName", "name"], sourceId), ownerSource: universe, status: firstString(component, ["status"], "published") });
    addOwnershipRelationship(relationships, item, universe);
  }
  const screenTemplateLibrary = runtime.screenTemplateLibrary ?? {};
  for (const template of arrayOfRecords(screenTemplateLibrary.templates)) {
    const sourceId = firstString(template, ["id"], "");
    const item = { recordType: "Screen Template" as const, sourceId };
    pushInput(inputs, { ...item, displayName: firstString(template, ["displayName", "name"], sourceId), ownerSource: universe, status: firstString(template, ["status"], "published") });
    addOwnershipRelationship(relationships, item, universe);
    for (const componentId of Array.isArray(template.requiredComponents) ? template.requiredComponents.filter((id): id is string => typeof id === "string" && componentIds.has(id)) : []) {
      relationships.push({ from: item, to: { recordType: "Component", sourceId: componentId }, relationshipType: "uses", referenceType: "runtime" });
    }
  }
  const designLanguage = runtime.designLanguage ?? {};
  const tokens = designLanguage.tokens as Record<string, unknown> | undefined;
  for (const [group, tokenValues] of Object.entries(tokens ?? {})) {
    if (!tokenValues || typeof tokenValues !== "object" || Array.isArray(tokenValues)) continue;
    for (const token of Object.values(tokenValues as Record<string, unknown>)) {
      if (!token || typeof token !== "object" || Array.isArray(token)) continue;
      const tokenRecord = token as Record<string, unknown>;
      const sourceId = firstString(tokenRecord, ["id"], "");
      if (!sourceId) continue;
      const item = { recordType: "Design Token" as const, sourceId };
      pushInput(inputs, { ...item, displayName: firstString(tokenRecord, ["displayName", "name"], `${group} ${sourceId}`), ownerSource: universe, status: "published" });
      addOwnershipRelationship(relationships, item, universe);
    }
  }

  return buildIdentityRelationshipGraph(inputs, relationships);
}

export function toIdentityRelationshipRuntimeExport(graph: IdentityRelationshipGraph): IdentityRelationshipRuntimeExport {
  // Prompts remain a Studio production concern. Engine clients receive only gameplay-safe IDs and links.
  const runtimeRecords = graph.records.filter((record) => record.recordType !== "Prompt");
  const runtimeRecordIds = new Set(runtimeRecords.map((record) => record.canonicalId));
  const parentById = new Map(graph.relationships.filter((relationship) => relationship.relationshipType === "parent").map((relationship) => [relationship.fromCanonicalId, relationship.toCanonicalId]));
  const childrenById = new Map<string, string[]>();
  const runtimeReferencesById = new Map<string, string[]>();
  for (const relationship of graph.relationships) {
    if (relationship.relationshipType === "child") {
      childrenById.set(relationship.fromCanonicalId, [...(childrenById.get(relationship.fromCanonicalId) ?? []), relationship.toCanonicalId]);
    }
    if (relationship.referenceType === "runtime") {
      runtimeReferencesById.set(relationship.fromCanonicalId, [...(runtimeReferencesById.get(relationship.fromCanonicalId) ?? []), relationship.toCanonicalId]);
    }
  }
  const allowedRelationshipTypes = new Set<CanonicalRelationshipType>(["parent", "child", "contains", "depends_on", "uses", "requires", "produces", "consumes", "unlocks", "references", "related_to"]);
  return {
    id: graph.id,
    version: graph.version,
    status: graph.validation.status,
    records: [...runtimeRecords].sort(identitySort).map((record) => ({
      canonicalId: record.canonicalId,
      displayName: record.displayName,
      slug: record.slug,
      recordType: record.recordType,
      status: record.status,
      parentCanonicalId: parentById.get(record.canonicalId) ?? null,
      childCanonicalIds: [...(childrenById.get(record.canonicalId) ?? [])].sort(),
      runtimeReferenceIds: [...(runtimeReferencesById.get(record.canonicalId) ?? [])].sort()
    })),
    relationships: [...graph.relationships]
      .filter((relationship) => runtimeRecordIds.has(relationship.fromCanonicalId) && runtimeRecordIds.has(relationship.toCanonicalId))
      .filter((relationship) => allowedRelationshipTypes.has(relationship.relationshipType) && relationship.referenceType !== "production" && relationship.referenceType !== "preview")
      .sort(relationshipSort)
      .map(({ fromCanonicalId, toCanonicalId, relationshipType, referenceType }) => ({ fromCanonicalId, toCanonicalId, relationshipType, referenceType }))
  };
}

function inboundGraph(graph: IdentityRelationshipGraph) {
  const incoming = new Map<string, CanonicalRelationship[]>();
  for (const relationship of graph.relationships) {
    incoming.set(relationship.toCanonicalId, [...(incoming.get(relationship.toCanonicalId) ?? []), relationship]);
  }
  return incoming;
}

export function calculateChangeImpact(graph: IdentityRelationshipGraph, canonicalId: string): ChangeImpact {
  const incoming = inboundGraph(graph);
  const visited = new Set<string>([canonicalId]);
  const queue = [canonicalId];
  while (queue.length) {
    const current = queue.shift()!;
    for (const relationship of incoming.get(current) ?? []) {
      if (visited.has(relationship.fromCanonicalId)) continue;
      visited.add(relationship.fromCanonicalId);
      queue.push(relationship.fromCanonicalId);
    }
  }
  const records = new Map(graph.records.map((record) => [record.canonicalId, record]));
  const affected = [...visited].filter((id) => id !== canonicalId).sort();
  const hasReference = (id: string, type: CanonicalReferenceType) => graph.relationships.some((relationship) => relationship.fromCanonicalId === id && relationship.referenceType === type);
  return {
    canonicalId,
    affectedObjectIds: affected,
    affectedAssetIds: affected.filter((id) => records.get(id)?.recordType === "Asset"),
    affectedPromptIds: affected.filter((id) => records.get(id)?.recordType === "Prompt"),
    unityExportIds: affected.filter((id) => hasReference(id, "runtime")),
    productionIds: affected.filter((id) => hasReference(id, "production"))
  };
}

export function findCanonicalIdentity(graph: IdentityRelationshipGraph, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return graph.records;
  const relationshipSearchByRecord = new Map<string, string[]>();
  for (const relationship of graph.relationships) {
    const searchText = [relationship.relationshipType, relationship.referenceType, relationship.fromCanonicalId, relationship.toCanonicalId].join(" ");
    relationshipSearchByRecord.set(relationship.fromCanonicalId, [...(relationshipSearchByRecord.get(relationship.fromCanonicalId) ?? []), searchText]);
    relationshipSearchByRecord.set(relationship.toCanonicalId, [...(relationshipSearchByRecord.get(relationship.toCanonicalId) ?? []), searchText]);
  }
  return graph.records.filter((record) => [
    record.canonicalId,
    record.sourceId,
    record.displayName,
    record.slug,
    record.recordType,
    record.canonicalOwnerId,
    ...(relationshipSearchByRecord.get(record.canonicalId) ?? [])
  ].join(" ").toLowerCase().includes(normalized));
}

export function getParent(graph: IdentityRelationshipGraph, canonicalId: string) {
  const parent = graph.relationships.find((relationship) => relationship.fromCanonicalId === canonicalId && relationship.relationshipType === "parent");
  return parent ? graph.records.find((record) => record.canonicalId === parent.toCanonicalId) ?? null : null;
}

export function getChildren(graph: IdentityRelationshipGraph, canonicalId: string) {
  const ids = graph.relationships.filter((relationship) => relationship.fromCanonicalId === canonicalId && relationship.relationshipType === "child").map((relationship) => relationship.toCanonicalId);
  return graph.records.filter((record) => ids.includes(record.canonicalId));
}

export function getDependencies(graph: IdentityRelationshipGraph, canonicalId: string) {
  const ids = graph.relationships.filter((relationship) => relationship.fromCanonicalId === canonicalId && relationship.relationshipType === "depends_on").map((relationship) => relationship.toCanonicalId);
  return graph.records.filter((record) => ids.includes(record.canonicalId));
}

export function getReferences(graph: IdentityRelationshipGraph, canonicalId: string) {
  const ids = graph.relationships.filter((relationship) => relationship.fromCanonicalId === canonicalId && ["references", "uses", "requires"].includes(relationship.relationshipType)).map((relationship) => relationship.toCanonicalId);
  return graph.records.filter((record) => ids.includes(record.canonicalId));
}

export function getAssets(graph: IdentityRelationshipGraph, canonicalId: string) {
  const impact = calculateChangeImpact(graph, canonicalId);
  const assetIds = new Set(impact.affectedAssetIds);
  return graph.records.filter((record) => assetIds.has(record.canonicalId));
}

export function getPrompt(graph: IdentityRelationshipGraph, canonicalId: string) {
  return graph.records.filter((record) => record.recordType === "Prompt" && graph.relationships.some((relationship) => relationship.fromCanonicalId === record.canonicalId && relationship.toCanonicalId === canonicalId));
}

export function getRuntime(graph: IdentityRelationshipGraph, canonicalId: string) {
  return graph.relationships.filter((relationship) => relationship.fromCanonicalId === canonicalId && relationship.referenceType === "runtime");
}
