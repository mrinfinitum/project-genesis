import type {
  CanonicalIdentity,
  CanonicalRecordType,
  CanonicalRelationship,
  CanonicalRelationshipType,
  ChangeImpact,
  IdentityRelationshipGraph,
  IdentityRelationshipIssue
} from "@/lib/identity-relationships";

export const universeExplorerModes = [
  "universe",
  "civilization",
  "progression",
  "production",
  "runtime",
  "favorites",
  "recent",
  "orphans",
  "validation"
] as const;

export const universeExplorerSortModes = ["canonical", "name", "record_type", "modified", "status", "validation", "runtime"] as const;

export type UniverseExplorerMode = (typeof universeExplorerModes)[number];
export type UniverseExplorerSortMode = (typeof universeExplorerSortModes)[number];
export type ExplorerValidationStatus = "valid" | "warning" | "error" | "orphan";
export type ExplorerRuntimeStatus = "ready" | "blocked" | "not_applicable";

export type ExplorerRouteDefinition = {
  generatorRoute: string | null;
  libraryRoute: string | null;
};

export type UniverseExplorerNode = {
  canonicalId: string;
  recordType: CanonicalRecordType;
  displayName: string;
  slug: string;
  parentId: string | null;
  relationshipType: CanonicalRelationshipType | null;
  childCount: number;
  dependencyCount: number;
  validationStatus: ExplorerValidationStatus;
  productionStatus: string;
  runtimeStatus: ExplorerRuntimeStatus;
  discoveryStatus: string | null;
  iconId: string;
  generatorRoute: string | null;
  libraryRoute: string | null;
  hasChildren: boolean;
  isExpandable: boolean;
  isLoaded: boolean;
  isFavorite: boolean;
  isRecent: boolean;
  isDeprecated: boolean;
  isOrphan: boolean;
  sortOrder: number;
  metadata: {
    version: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
  };
};

export type ExplorerFlatRow = {
  node: UniverseExplorerNode;
  depth: number;
};

export type ExplorerRelationshipGroup = {
  relationshipType: CanonicalRelationshipType;
  direction: "incoming" | "outgoing";
  records: UniverseExplorerNode[];
  totalCount: number;
};

export type ExplorerParentAssignmentResult = {
  valid: boolean;
  reason: string | null;
};

export type UniverseExplorerModel = {
  graph: IdentityRelationshipGraph;
  nodes: UniverseExplorerNode[];
  nodeById: Map<string, UniverseExplorerNode>;
  childIdsByParentId: Map<string, string[]>;
  parentIdByNodeId: Map<string, string | null>;
  issuesByRecordId: Map<string, IdentityRelationshipIssue[]>;
  relationshipsByRecordId: Map<string, CanonicalRelationship[]>;
  searchTextByRecordId: Map<string, string>;
  rootIds: string[];
};

export type ExplorerMigrationReport = {
  generatedAt: string;
  canonicalTypesFound: Array<{ recordType: CanonicalRecordType; count: number }>;
  generatorRouteMappings: Array<{ recordType: CanonicalRecordType; route: string | null }>;
  libraryRouteMappings: Array<{ recordType: CanonicalRecordType; route: string | null }>;
  records: {
    total: number;
    validHierarchy: number;
    orphaned: number;
    missingParentRelationships: number;
    validationIssues: number;
  };
  duplicateHierarchySystems: string[];
  deprecatedNavigationTrees: string[];
  recordsThatCannotYetBePlaced: string[];
  manualReviewRequired: string[];
};

const route = (generatorRoute: string | null, libraryRoute: string | null): ExplorerRouteDefinition => ({ generatorRoute, libraryRoute });

export const explorerRouteRegistry: Record<CanonicalRecordType, ExplorerRouteDefinition> = {
  Universe: route("/universe-layer-generator", "/universe-explorer"),
  Galaxy: route("/galaxy-layer-generator", "/galaxy"),
  "Galactic Region": route("/sector-layer-generator", "/sector-map"),
  "Star System": route("/star-system-layer-generator", "/star-system-map"),
  Star: route("/celestial-bodies", "/celestial-bodies"),
  Planet: route("/planet-generation", "/planets"),
  Moon: route("/planet-generation", "/planets"),
  Settlement: route("/colonies", "/colonies"),
  Colony: route("/colonies", "/colonies"),
  Civilization: route("/civilizations", "/civilizations"),
  Faction: route("/factions", "/factions"),
  Creature: route("/creature-generator", "/species"),
  Plant: route("/plant-life-generator", "/species?domain=plant"),
  Fungus: route("/plant-life-generator", "/species?domain=fungus"),
  Microorganism: route("/life-generator", "/species?domain=microorganism"),
  Biome: route("/planet-generation", "/planets"),
  Weather: route("/planet-generation", "/planets"),
  Climate: route("/planet-generation", "/planets"),
  Season: route("/planet-generation", "/planets"),
  Resource: route("/resource-catalog", "/resource-catalog"),
  Material: route("/resource-catalog", "/resource-catalog"),
  Building: route("/buildings", "/buildings"),
  Research: route("/research", "/research"),
  Upgrade: route("/upgrades", "/upgrades"),
  Mission: route("/missions", "/missions"),
  Event: route("/dynamic-events", "/dynamic-events"),
  Discovery: route("/discovery", "/discovery"),
  Prompt: route("/creative-production/render-hub", "/creative-production/render-hub"),
  Asset: route("/creative-production/asset-production", "/asset-library"),
  "Species Plate": route("/visual-production/species-plates", "/visual-production/species-plates"),
  Background: route("/backgrounds", "/backgrounds"),
  "Screen Template": route("/creative-production/design-system/screen-templates", "/creative-production/design-system/screen-templates"),
  Component: route("/creative-production/design-system/component-library", "/creative-production/design-system/component-library"),
  "Design Token": route("/creative-production/design-system", "/creative-production/design-system")
};

const civilizationTypes = new Set<CanonicalRecordType>(["Civilization", "Faction", "Settlement", "Colony", "Building", "Research", "Upgrade", "Mission", "Event"]);
const progressionTypes = new Set<CanonicalRecordType>(["Research", "Upgrade", "Building", "Mission", "Event"]);
const productionTypes = new Set<CanonicalRecordType>(["Prompt", "Asset", "Species Plate", "Background", "Screen Template", "Component", "Design Token"]);

const createTypesByParent: Partial<Record<CanonicalRecordType, CanonicalRecordType[]>> = {
  Universe: ["Galaxy"],
  Galaxy: ["Galactic Region"],
  "Galactic Region": ["Star System"],
  "Star System": ["Star", "Planet"],
  Planet: ["Moon", "Biome", "Creature", "Plant", "Settlement"],
  Creature: ["Species Plate"],
  Plant: ["Species Plate"],
  Fungus: ["Species Plate"],
  Microorganism: ["Species Plate"]
};

function issueSeverity(issues: IdentityRelationshipIssue[]) {
  if (issues.some((issue) => issue.severity === "error")) return "error" as const;
  if (issues.some((issue) => /orphan_record|missing_owner/i.test(issue.code))) return "orphan" as const;
  if (issues.length) return "warning" as const;
  return "valid" as const;
}

function isDeprecated(record: CanonicalIdentity) {
  return /deprecated|archived/i.test(record.status);
}

function normalized(text: string) {
  return text.toLocaleLowerCase();
}

function nodeSort(left: UniverseExplorerNode, right: UniverseExplorerNode, mode: UniverseExplorerSortMode) {
  if (mode === "name") return left.displayName.localeCompare(right.displayName);
  if (mode === "record_type") return `${left.recordType}:${left.displayName}`.localeCompare(`${right.recordType}:${right.displayName}`);
  if (mode === "modified") return right.metadata.updatedAt.localeCompare(left.metadata.updatedAt) || left.displayName.localeCompare(right.displayName);
  if (mode === "status") return `${left.metadata.status}:${left.displayName}`.localeCompare(`${right.metadata.status}:${right.displayName}`);
  if (mode === "validation") return `${left.validationStatus}:${left.displayName}`.localeCompare(`${right.validationStatus}:${right.displayName}`);
  if (mode === "runtime") return `${left.runtimeStatus}:${left.displayName}`.localeCompare(`${right.runtimeStatus}:${right.displayName}`);
  return left.sortOrder - right.sortOrder || left.displayName.localeCompare(right.displayName);
}

function ancestorsFor(model: UniverseExplorerModel, canonicalId: string) {
  const result = new Set<string>();
  const visited = new Set<string>();
  let current = model.parentIdByNodeId.get(canonicalId) ?? null;
  while (current && !visited.has(current)) {
    result.add(current);
    visited.add(current);
    current = model.parentIdByNodeId.get(current) ?? null;
  }
  return result;
}

function recordMatchesQuery(model: UniverseExplorerModel, node: UniverseExplorerNode, query: string) {
  return !query.trim() || (model.searchTextByRecordId.get(node.canonicalId) ?? "").includes(normalized(query));
}

export function buildUniverseExplorerModel(graph: IdentityRelationshipGraph): UniverseExplorerModel {
  const issuesByRecordId = new Map<string, IdentityRelationshipIssue[]>();
  for (const issue of graph.validation.issues) {
    const affectedRecordIds = ["circular_parent", "circular_dependency", "duplicate_canonical_id"].includes(issue.code)
      ? issue.records
      : issue.records.slice(0, 1);
    for (const recordId of affectedRecordIds) {
      if (!recordId.startsWith("noveris:")) continue;
      issuesByRecordId.set(recordId, [...(issuesByRecordId.get(recordId) ?? []), issue]);
    }
  }

  const recordById = new Map(graph.records.map((record) => [record.canonicalId, record]));
  const relationshipsByRecordId = new Map<string, CanonicalRelationship[]>();
  for (const relationship of graph.relationships) {
    relationshipsByRecordId.set(relationship.fromCanonicalId, [...(relationshipsByRecordId.get(relationship.fromCanonicalId) ?? []), relationship]);
    relationshipsByRecordId.set(relationship.toCanonicalId, [...(relationshipsByRecordId.get(relationship.toCanonicalId) ?? []), relationship]);
  }

  const parentIdByNodeId = new Map<string, string | null>();
  const parentRelationshipByNodeId = new Map<string, CanonicalRelationship | null>();
  for (const record of graph.records) {
    const relationships = relationshipsByRecordId.get(record.canonicalId) ?? [];
    const parent = relationships.find((relationship) => relationship.fromCanonicalId === record.canonicalId && relationship.relationshipType === "parent")
      ?? relationships.find((relationship) => relationship.fromCanonicalId === record.canonicalId && relationship.relationshipType === "belongs_to")
      ?? null;
    const parentId = parent?.toCanonicalId && recordById.has(parent.toCanonicalId) ? parent.toCanonicalId : null;
    parentIdByNodeId.set(record.canonicalId, parentId);
    parentRelationshipByNodeId.set(record.canonicalId, parent);
  }

  const childIdsByParentId = new Map<string, string[]>();
  for (const [nodeId, parentId] of parentIdByNodeId.entries()) {
    if (!parentId) continue;
    childIdsByParentId.set(parentId, [...(childIdsByParentId.get(parentId) ?? []), nodeId]);
  }

  const nodes: Array<UniverseExplorerNode & { searchText: string }> = graph.records.map((record, sortOrder) => {
    const issues = issuesByRecordId.get(record.canonicalId) ?? [];
    const relationships = relationshipsByRecordId.get(record.canonicalId) ?? [];
    const children = childIdsByParentId.get(record.canonicalId) ?? [];
    const runtimeRelationships = relationships.filter((relationship) => relationship.referenceType === "runtime");
    const productionStatus = record.recordType === "Prompt" ? "prompt_ready" : productionTypes.has(record.recordType) ? record.status : "canonical";
    const validationStatus = issueSeverity(issues);
    const relationshipTypes = relationships.map((relationship) => relationship.relationshipType).join(" ");
    return {
      canonicalId: record.canonicalId,
      recordType: record.recordType,
      displayName: record.displayName,
      slug: record.slug,
      parentId: parentIdByNodeId.get(record.canonicalId) ?? null,
      relationshipType: parentRelationshipByNodeId.get(record.canonicalId)?.relationshipType ?? null,
      childCount: children.length,
      dependencyCount: record.dependencyCount,
      validationStatus,
      productionStatus,
      runtimeStatus: validationStatus === "error" ? "blocked" : runtimeRelationships.length || !productionTypes.has(record.recordType) ? "ready" : "not_applicable",
      discoveryStatus: record.recordType === "Discovery" ? "discovered" : null,
      iconId: record.recordType.toLowerCase().replaceAll(" ", "-"),
      generatorRoute: explorerRouteRegistry[record.recordType].generatorRoute,
      libraryRoute: explorerRouteRegistry[record.recordType].libraryRoute,
      hasChildren: children.length > 0,
      isExpandable: children.length > 0,
      isLoaded: true,
      isFavorite: false,
      isRecent: false,
      isDeprecated: isDeprecated(record),
      isOrphan: validationStatus === "orphan",
      sortOrder,
      metadata: {
        version: record.version,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        ownerId: record.canonicalOwnerId
      },
      searchText: normalized([record.canonicalId, record.displayName, record.slug, record.recordType, record.canonicalOwnerId, relationshipTypes].join(" "))
    };
  });

  const searchTextByRecordId = new Map(nodes.map((node) => [node.canonicalId, node.searchText]));
  const explorerNodes = nodes.map(({ searchText: _searchText, ...node }) => node);
  const rootIds = explorerNodes.filter((node) => !node.parentId).map((node) => node.canonicalId);
  return {
    graph,
    nodes: explorerNodes,
    nodeById: new Map(explorerNodes.map((node) => [node.canonicalId, node])),
    childIdsByParentId,
    parentIdByNodeId,
    issuesByRecordId,
    relationshipsByRecordId,
    searchTextByRecordId,
    rootIds
  };
}

export function getExplorerVisibleIds(model: UniverseExplorerModel, options: {
  mode: UniverseExplorerMode;
  query?: string;
  recordType?: CanonicalRecordType | "all";
  validation?: ExplorerValidationStatus | "all";
  favorites?: Iterable<string>;
  recent?: Iterable<string>;
}) {
  const favorites = new Set(options.favorites ?? []);
  const recent = new Set(options.recent ?? []);
  const query = options.query ?? "";
  const direct = model.nodes.filter((node) => {
    if (options.recordType && options.recordType !== "all" && node.recordType !== options.recordType) return false;
    if (options.validation && options.validation !== "all" && node.validationStatus !== options.validation) return false;
    if (!recordMatchesQuery(model, node, query)) return false;
    if (options.mode === "civilization") return civilizationTypes.has(node.recordType);
    if (options.mode === "progression") return progressionTypes.has(node.recordType);
    if (options.mode === "production") return productionTypes.has(node.recordType);
    if (options.mode === "runtime") return node.runtimeStatus === "ready";
    if (options.mode === "favorites") return favorites.has(node.canonicalId);
    if (options.mode === "recent") return recent.has(node.canonicalId);
    if (options.mode === "orphans") return node.isOrphan;
    if (options.mode === "validation") return node.validationStatus !== "valid";
    return node.recordType === "Universe" || node.relationshipType === "parent";
  });

  const visible = new Set(direct.map((node) => node.canonicalId));
  for (const node of direct) {
    for (const ancestor of ancestorsFor(model, node.canonicalId)) visible.add(ancestor);
  }
  return visible;
}

export function getExplorerSearchResults(model: UniverseExplorerModel, query: string, limit = 100) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];
  return model.nodes.filter((node) => recordMatchesQuery(model, node, normalizedQuery)).sort((left, right) => left.displayName.localeCompare(right.displayName)).slice(0, limit);
}

export function flattenExplorerTree(model: UniverseExplorerModel, options: {
  visibleIds: Set<string>;
  expandedIds: Set<string>;
  sortMode: UniverseExplorerSortMode;
  forceExpandedIds?: Set<string>;
}) {
  const rows: ExplorerFlatRow[] = [];
  const roots = model.rootIds
    .map((id) => model.nodeById.get(id))
    .filter((node): node is UniverseExplorerNode => node !== undefined)
    .filter((node) => options.visibleIds.has(node.canonicalId))
    .sort((left, right) => nodeSort(left, right, options.sortMode));
  const visit = (node: UniverseExplorerNode, depth: number) => {
    rows.push({ node, depth });
    if (!node.hasChildren || (!options.expandedIds.has(node.canonicalId) && !options.forceExpandedIds?.has(node.canonicalId))) return;
    const children = (model.childIdsByParentId.get(node.canonicalId) ?? [])
      .map((id) => model.nodeById.get(id))
      .filter((child): child is UniverseExplorerNode => child !== undefined)
      .filter((child) => options.visibleIds.has(child.canonicalId))
      .sort((left, right) => nodeSort(left, right, options.sortMode));
    for (const child of children) visit(child, depth + 1);
  };
  for (const root of roots) visit(root, 0);
  return rows;
}

export function getExplorerChildren(model: UniverseExplorerModel, parentCanonicalId: string, offset = 0, limit = 100, sortMode: UniverseExplorerSortMode = "canonical") {
  const children = (model.childIdsByParentId.get(parentCanonicalId) ?? [])
    .map((id) => model.nodeById.get(id))
    .filter((node): node is UniverseExplorerNode => Boolean(node))
    .sort((left, right) => nodeSort(left, right, sortMode));
  return { total: children.length, nodes: children.slice(offset, offset + limit) };
}

export function getExplorerVirtualWindow(totalRows: number, scrollTop: number, viewportHeight: number, rowHeight = 38, overscan = 8) {
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(totalRows, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);
  return { start, end, top: start * rowHeight, height: totalRows * rowHeight };
}

export function getExplorerBreadcrumbs(model: UniverseExplorerModel, canonicalId: string) {
  const breadcrumbs: UniverseExplorerNode[] = [];
  const visited = new Set<string>();
  let current = model.nodeById.get(canonicalId) ?? null;
  while (current && !visited.has(current.canonicalId)) {
    breadcrumbs.unshift(current);
    visited.add(current.canonicalId);
    current = current.parentId ? model.nodeById.get(current.parentId) ?? null : null;
  }
  return breadcrumbs;
}

export function getExplorerRelationshipGroups(model: UniverseExplorerModel, canonicalId: string, options?: {
  visibleIds?: Set<string>;
  maxRecordsPerGroup?: number;
}) {
  const groups = new Map<string, ExplorerRelationshipGroup>();
  const maxRecordsPerGroup = options?.maxRecordsPerGroup ?? 50;
  for (const relationship of model.relationshipsByRecordId.get(canonicalId) ?? []) {
    const direction = relationship.fromCanonicalId === canonicalId ? "outgoing" : "incoming";
    const counterpartId = direction === "outgoing" ? relationship.toCanonicalId : relationship.fromCanonicalId;
    const counterpart = model.nodeById.get(counterpartId);
    if (!counterpart || (options?.visibleIds && !options.visibleIds.has(counterpartId))) continue;
    const key = `${direction}:${relationship.relationshipType}`;
    const current = groups.get(key) ?? { relationshipType: relationship.relationshipType, direction, records: [], totalCount: 0 };
    current.totalCount += 1;
    if (current.records.length < maxRecordsPerGroup) current.records.push(counterpart);
    groups.set(key, current);
  }
  return [...groups.values()].map((group) => ({ ...group, records: group.records.sort((left, right) => left.displayName.localeCompare(right.displayName)) })).sort((left, right) => `${left.direction}:${left.relationshipType}`.localeCompare(`${right.direction}:${right.relationshipType}`));
}

export function getExplorerCreatableTypes(parent: UniverseExplorerNode | null) {
  return parent ? createTypesByParent[parent.recordType] ?? [] : [];
}

export function validateExplorerParentAssignment(
  model: UniverseExplorerModel,
  childCanonicalId: string,
  parentCanonicalId: string
): ExplorerParentAssignmentResult {
  const child = model.nodeById.get(childCanonicalId);
  const parent = model.nodeById.get(parentCanonicalId);
  if (!child) return { valid: false, reason: `Unknown child record: ${childCanonicalId}` };
  if (!parent) return { valid: false, reason: `Unknown parent record: ${parentCanonicalId}` };
  if (childCanonicalId === parentCanonicalId) return { valid: false, reason: "A record cannot be its own parent." };

  const visited = new Set<string>();
  let ancestor: UniverseExplorerNode | null = parent;
  while (ancestor && !visited.has(ancestor.canonicalId)) {
    if (ancestor.canonicalId === childCanonicalId) return { valid: false, reason: "Parent assignment would create a circular hierarchy." };
    visited.add(ancestor.canonicalId);
    ancestor = ancestor.parentId ? model.nodeById.get(ancestor.parentId) ?? null : null;
  }

  if (!getExplorerCreatableTypes(parent).includes(child.recordType)) {
    return { valid: false, reason: `${parent.recordType} cannot contain ${child.recordType} records.` };
  }
  return { valid: true, reason: null };
}

function withContext(routePath: string, node: Pick<UniverseExplorerNode, "canonicalId" | "recordType">, action: "open" | "create", parentCanonicalId?: string) {
  const [pathname, existingSearch = ""] = routePath.split("?");
  const query = new URLSearchParams(existingSearch);
  query.set("canonicalId", node.canonicalId);
  query.set("recordType", node.recordType);
  query.set("explorerAction", action);
  if (parentCanonicalId) query.set("parentCanonicalId", parentCanonicalId);
  query.set("returnTo", `/universe-explorer?selected=${encodeURIComponent(node.canonicalId)}`);
  return `${pathname}?${query.toString()}`;
}

export function getExplorerGeneratorHref(node: UniverseExplorerNode) {
  const routePath = node.generatorRoute ?? node.libraryRoute ?? "/architecture/identity-relationships";
  return withContext(routePath, node, "open");
}

export function getExplorerLibraryHref(node: UniverseExplorerNode) {
  const routePath = node.libraryRoute ?? node.generatorRoute ?? "/architecture/identity-relationships";
  return withContext(routePath, node, "open");
}

export function getExplorerCreateHref(parent: UniverseExplorerNode, recordType: CanonicalRecordType) {
  if (!getExplorerCreatableTypes(parent).includes(recordType)) return null;
  const routeDefinition = explorerRouteRegistry[recordType];
  if (!routeDefinition.generatorRoute) return null;
  const prototype: UniverseExplorerNode = {
    ...parent,
    canonicalId: `new:${recordType.toLowerCase().replaceAll(" ", "-")}`,
    recordType,
    displayName: `New ${recordType}`,
    slug: `new-${recordType.toLowerCase().replaceAll(" ", "-")}`,
    generatorRoute: routeDefinition.generatorRoute,
    libraryRoute: routeDefinition.libraryRoute
  };
  return withContext(routeDefinition.generatorRoute, prototype, "create", parent.canonicalId);
}

export function calculateExplorerChangeImpact(model: UniverseExplorerModel, canonicalId: string): ChangeImpact {
  const incoming = new Map<string, CanonicalRelationship[]>();
  for (const relationship of model.graph.relationships) {
    incoming.set(relationship.toCanonicalId, [...(incoming.get(relationship.toCanonicalId) ?? []), relationship]);
  }
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
  const affectedObjectIds = [...visited].filter((id) => id !== canonicalId).sort();
  const hasReference = (id: string, referenceType: CanonicalRelationship["referenceType"]) =>
    (model.relationshipsByRecordId.get(id) ?? []).some((relationship) =>
      relationship.fromCanonicalId === id && relationship.referenceType === referenceType
    );
  return {
    canonicalId,
    affectedObjectIds,
    affectedAssetIds: affectedObjectIds.filter((id) => model.nodeById.get(id)?.recordType === "Asset"),
    affectedPromptIds: affectedObjectIds.filter((id) => model.nodeById.get(id)?.recordType === "Prompt"),
    unityExportIds: affectedObjectIds.filter((id) => hasReference(id, "runtime")),
    productionIds: affectedObjectIds.filter((id) => hasReference(id, "production"))
  };
}

export function buildExplorerMigrationReport(model: UniverseExplorerModel): ExplorerMigrationReport {
  const typeCounts = new Map<CanonicalRecordType, number>();
  for (const node of model.nodes) typeCounts.set(node.recordType, (typeCounts.get(node.recordType) ?? 0) + 1);
  const orphans = model.nodes.filter((node) => node.isOrphan);
  const missingParent = model.nodes.filter((node) => node.validationStatus !== "valid" && (model.issuesByRecordId.get(node.canonicalId) ?? []).some((issue) => issue.code === "missing_parent"));
  const unmapped = model.nodes.filter((node) => !node.generatorRoute && !node.libraryRoute);
  return {
    generatedAt: "deterministic-build",
    canonicalTypesFound: [...typeCounts.entries()].map(([recordType, count]) => ({ recordType, count })).sort((left, right) => left.recordType.localeCompare(right.recordType)),
    generatorRouteMappings: (Object.entries(explorerRouteRegistry) as Array<[CanonicalRecordType, ExplorerRouteDefinition]>).map(([recordType, definition]) => ({ recordType, route: definition.generatorRoute })),
    libraryRouteMappings: (Object.entries(explorerRouteRegistry) as Array<[CanonicalRecordType, ExplorerRouteDefinition]>).map(([recordType, definition]) => ({ recordType, route: definition.libraryRoute })),
    records: {
      total: model.nodes.length,
      validHierarchy: model.nodes.length - orphans.length,
      orphaned: orphans.length,
      missingParentRelationships: missingParent.length,
      validationIssues: model.graph.validation.issues.length
    },
    duplicateHierarchySystems: [],
    deprecatedNavigationTrees: ["Developer Seed Explorer (/universe-explorer prior to this migration)"],
    recordsThatCannotYetBePlaced: unmapped.map((node) => node.canonicalId).sort(),
    manualReviewRequired: [...new Set([...orphans.map((node) => node.canonicalId), ...missingParent.map((node) => node.canonicalId)])].sort()
  };
}
