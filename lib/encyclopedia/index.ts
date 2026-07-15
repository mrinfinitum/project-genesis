import { defaultAiAgentId, getAiAgentRuntimeModules } from "@/lib/ai-agents";
import { canonicalBuildingLibrary, canonicalBuildingTaxonomy, type CanonicalBuildingDefinition } from "@/lib/buildings/taxonomy";
import { colonyLevelDefinitions } from "@/lib/colonies/procedural";
import { canonicalEconomyDefinitions } from "@/lib/economy/definitions";
import { canonicalDiscoveries, discoveryCategories, type DiscoveryRecord } from "@/lib/discovery";
import { generateFallbackFactions } from "@/lib/factions/procedural";
import { ResourceService } from "@/lib/resources/service";
import type { ProductionAsset } from "@/lib/assets/asset-production";
import type { GameData, GeneratedPlanet } from "@/types/schema";

export type EncyclopediaEntityType =
  | "building"
  | "research"
  | "resource"
  | "planet"
  | "star"
  | "star_system"
  | "sector"
  | "galaxy"
  | "district"
  | "settlement"
  | "colony"
  | "ship"
  | "ai_agent"
  | "civilization"
  | "faction"
  | "technology"
  | "discovery"
  | "upgrade"
  | "wonder"
  | "megastructure"
  | "event"
  | "mission"
  | "trade"
  | "species"
  | "artifact";

export type EncyclopediaPublicationState = "scaffold" | "canonical_draft" | "approved_design" | "production_ready" | "published" | "deprecated";
export type EncyclopediaEditorialStatus = "missing" | "draft" | "reviewed" | "approved" | "published";
export type EncyclopediaAssetRole = "icon" | "thumbnail" | "hero" | "card" | "gallery" | "diagram" | "progression" | "animation" | "video" | "audio" | "state_variant";
export type EncyclopediaRelationshipType = "requires" | "unlocks" | "produces" | "consumes" | "upgrades_to" | "located_on" | "belongs_to" | "used_by" | "related_to";
export type BuildingChainRelationshipType = "upgrades_to" | "replaces" | "branches_to" | "evolves_into" | "prerequisite_for" | "unlocks";

export type EncyclopediaAssetRequirement = {
  id: string;
  entryId: string;
  entityType: EncyclopediaEntityType;
  canonicalRecordId: string;
  role: EncyclopediaAssetRole;
  required: boolean;
  semanticAssetKey: string;
  displayName: string;
  dimensions: string;
  priority: "low" | "medium" | "high" | "critical";
  derivativeProfile: "icon" | "card" | "hero" | "media";
  aliases: string[];
};

export type EncyclopediaAssetReadiness = {
  required: number;
  supplied: number;
  approved: number;
  published: number;
  missing: number;
  platformReadiness: Record<"web" | "roblox" | "ios" | "android", "ready" | "pending" | "missing">;
  artCompletion: number;
  requirements: Array<EncyclopediaAssetRequirement & {
    status: "missing" | "uploaded" | "approved" | "published";
    linkedAssetId: string | null;
    previewUrl: string | null;
  }>;
};

export type EncyclopediaEntry = {
  id: string;
  entityType: EncyclopediaEntityType;
  canonicalRecordId: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  summary: string;
  status: "canonical" | "planned" | "draft";
  era: string;
  tier: number | null;
  rarity: string;
  category: string;
  subcategory: string;
  tags: string[];
  iconArtKey: string | null;
  heroArtKey: string | null;
  galleryArtKeys: string[];
  relatedEntries: Array<{ entryId: string; relationshipType: EncyclopediaRelationshipType }>;
  unlockRequirements: string[];
  dependencies: string[];
  effects: string[];
  inputs: string[];
  outputs: string[];
  locations: string[];
  civilizations: string[];
  planets: string[];
  progression: string[];
  lore: {
    editorialStatus: EncyclopediaEditorialStatus;
    shortSummary: string;
    longDescription: string;
    playerFacingExplanation: string;
    discoveryText: string;
  };
  references: Array<{ type: string; id: string; label: string; href: string }>;
  assetReadiness: EncyclopediaAssetReadiness;
  publicationState: EncyclopediaPublicationState;
  completeness: {
    dataReadiness: number;
    editorialReadiness: number;
    artReadiness: number;
    publicationReadiness: number;
  };
  priority: "P0" | "P1" | "P2" | "P3";
};

export type EncyclopediaSection = {
  id: EncyclopediaEntityType;
  label: string;
  description: string;
  status: "active" | "planned";
  hierarchy: string[];
  entries: EncyclopediaEntry[];
  plannedReason?: string;
};

export type BuildingProgressionChain = {
  chainId: string;
  displayName: string;
  familyId: string;
  subcategoryId: string;
  nodes: Array<{
    buildingId: string;
    order: number;
    relationshipType: BuildingChainRelationshipType;
    requirements: string[];
  }>;
  validationStatus: "Ready" | "Needs Records";
};

export type EncyclopediaCollection = {
  id: string;
  displayName: string;
  description: string;
  buildingIds: string[];
  displayOrder: number;
  eraRange: string[];
  status: "draft" | "reviewed" | "published";
};

export type EncyclopediaMilestone = {
  id: string;
  displayName: string;
  description: string;
  entryIds: string[];
  requiredFields: string[];
  requiredAssetRoles: EncyclopediaAssetRole[];
  targetPlatforms: string[];
  readiness: number;
};

export type EncyclopediaRelationshipGraph = {
  nodes: Array<{ id: string; label: string; entityType: EncyclopediaEntityType }>;
  edges: Array<{ from: string; to: string; edgeType: EncyclopediaRelationshipType }>;
  brokenRelationships: Array<{ from: string; to: string; reason: string }>;
  circularRelationships: string[][];
};

export type GalactopediaContract = {
  status: "draft_not_published";
  fields: string[];
  excludedFields: string[];
  rule: string;
};

export type CivilizationEncyclopediaState = {
  route: "/encyclopedia";
  title: "Civilization Encyclopedia";
  subtitle: "The canonical knowledge system of NOVERIS.";
  generatedAt: string;
  sections: EncyclopediaSection[];
  entries: EncyclopediaEntry[];
  buildingCollections: EncyclopediaCollection[];
  buildingProgressionChains: BuildingProgressionChain[];
  relationshipGraph: EncyclopediaRelationshipGraph;
  assetProfiles: Record<string, Array<{ role: EncyclopediaAssetRole; required: boolean; dimensions: string; derivativeProfile: string }>>;
  semanticNamingConvention: Array<{ entityType: string; example: string; notes: string }>;
  derivativeProfiles: Record<string, string[]>;
  milestones: EncyclopediaMilestone[];
  galactopediaContract: GalactopediaContract;
  metrics: {
    totalEntries: number;
    activeSections: number;
    plannedSections: number;
    scaffoldEntries: number;
    approvedEntries: number;
    publishedEntries: number;
    missingDescriptions: number;
    missingIcons: number;
    missingHeroArt: number;
    brokenRelationships: number;
    incompleteProgressionChains: number;
    inGameExportReadiness: "draft_not_published";
  };
  bulkRequirementPreview: {
    scopes: string[];
    generatedRequirements: number;
    duplicateSemanticKeys: string[];
    lowConfidenceMappings: string[];
    mutationRequired: false;
  };
  validation: {
    status: "Ready" | "Ready With Warnings" | "Blocked";
    issues: Array<{ severity: "error" | "warning" | "info"; code: string; message: string; records: string[] }>;
  };
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function slug(value: unknown) {
  return text(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function titleCase(value: string) {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function compactStrings(...values: unknown[]) {
  return values.flatMap((value) => Array.isArray(value) ? value : [value]).filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function assetKey(entityType: EncyclopediaEntityType, canonicalRecordId: string, role: EncyclopediaAssetRole) {
  const normalizedId = slug(canonicalRecordId).replace(new RegExp(`^${entityType}_`), "");
  return `${entityType}_${normalizedId}_${role}`;
}

function previewUrlForAsset(asset?: ProductionAsset | null) {
  const webPath = (asset?.platformMappings.web as { path?: unknown } | undefined)?.path;
  if (typeof webPath === "string" && webPath) return webPath;
  return asset?.derivatives.find((derivative) => derivative.publicUrl)?.publicUrl ?? asset?.sourceFiles.find((source) => source.previewUrl)?.previewUrl ?? null;
}

function assetStatus(asset?: ProductionAsset | null): "missing" | "uploaded" | "approved" | "published" {
  if (!asset) return "missing";
  if (asset.productionStatus === "published" || asset.status.toLowerCase() === "published") return "published";
  if (asset.approvalStatus === "approved") return "approved";
  return "uploaded";
}

function findAsset(assets: ProductionAsset[], key: string) {
  const normalized = slug(key);
  return assets.find((asset) => [asset.id, asset.artKey, asset.iconKey, ...asset.aliases].some((candidate) => slug(candidate) === normalized)) ?? null;
}

export const encyclopediaAssetProfiles = {
  building: [
    { role: "icon" as const, required: true, dimensions: "512x512", derivativeProfile: "icon" },
    { role: "card" as const, required: true, dimensions: "1200x675", derivativeProfile: "card" },
    { role: "hero" as const, required: true, dimensions: "3840x2160", derivativeProfile: "hero" },
    { role: "state_variant" as const, required: false, dimensions: "varies", derivativeProfile: "card" },
    { role: "animation" as const, required: false, dimensions: "runtime", derivativeProfile: "media" }
  ],
  research: [
    { role: "icon" as const, required: true, dimensions: "512x512", derivativeProfile: "icon" },
    { role: "hero" as const, required: true, dimensions: "3840x2160", derivativeProfile: "hero" },
    { role: "diagram" as const, required: false, dimensions: "1600x900", derivativeProfile: "card" }
  ],
  resource: [
    { role: "icon" as const, required: true, dimensions: "512x512", derivativeProfile: "icon" },
    { role: "thumbnail" as const, required: true, dimensions: "512x512", derivativeProfile: "icon" },
    { role: "hero" as const, required: false, dimensions: "3840x2160", derivativeProfile: "hero" }
  ],
  planet: [
    { role: "thumbnail" as const, required: true, dimensions: "512x512", derivativeProfile: "icon" },
    { role: "card" as const, required: true, dimensions: "1200x675", derivativeProfile: "card" },
    { role: "hero" as const, required: true, dimensions: "3840x2160", derivativeProfile: "hero" },
    { role: "gallery" as const, required: false, dimensions: "varies", derivativeProfile: "hero" }
  ],
  civilization: [
    { role: "icon" as const, required: true, dimensions: "512x512", derivativeProfile: "icon" },
    { role: "hero" as const, required: true, dimensions: "3840x2160", derivativeProfile: "hero" },
    { role: "card" as const, required: false, dimensions: "1200x675", derivativeProfile: "card" }
  ],
  discovery: [
    { role: "icon" as const, required: true, dimensions: "512x512", derivativeProfile: "icon" },
    { role: "thumbnail" as const, required: true, dimensions: "512x512", derivativeProfile: "icon" },
    { role: "card" as const, required: true, dimensions: "1200x675", derivativeProfile: "card" },
    { role: "hero" as const, required: true, dimensions: "3840x2160", derivativeProfile: "hero" },
    { role: "gallery" as const, required: false, dimensions: "world/detail renders", derivativeProfile: "hero" },
    { role: "animation" as const, required: false, dimensions: "scan/discovery animation", derivativeProfile: "media" },
    { role: "audio" as const, required: false, dimensions: "sound/narration", derivativeProfile: "media" },
    { role: "video" as const, required: false, dimensions: "optional discovery clip", derivativeProfile: "media" }
  ]
};

export const encyclopediaDerivativeProfiles = {
  icon: ["64", "96", "128", "256", "Roblox", "Web", "mobile"],
  card: ["standard card aspect", "compact card", "WebP", "PNG when alpha required"],
  hero: ["4K master", "1440", "1080", "mobile", "thumbnail"],
  media: ["animation", "video", "audio", "state variants"]
};

export const encyclopediaSemanticNamingConvention = [
  { entityType: "building", example: "building_residential_house_icon", notes: "building_<normalized canonical building id>_<role>" },
  { entityType: "research", example: "research_agriculture_crop_cultivation_hero", notes: "research_<branch or node id>_<role>" },
  { entityType: "resource", example: "resource_helium_3_icon", notes: "resource IDs keep canonical Resource Catalog identity." },
  { entityType: "planet", example: "planet_earthlike_alpha_card", notes: "planet_<canonical planet id>_<role>" },
  { entityType: "civilization", example: "civilization_noveris_founders_emblem", notes: "civilization or faction identity art stays tied to canonical records." },
  { entityType: "discovery", example: "discovery_precursor_quantum_core_hero", notes: "discovery_<canonical discovery id>_<role>" }
];

function requirementsForEntry(input: {
  entryId: string;
  entityType: EncyclopediaEntityType;
  canonicalRecordId: string;
  displayName: string;
  priority: "P0" | "P1" | "P2" | "P3";
}) {
  const profile = encyclopediaAssetProfiles[input.entityType as keyof typeof encyclopediaAssetProfiles] ?? [
    { role: "icon" as const, required: true, dimensions: "512x512", derivativeProfile: "icon" },
    { role: "hero" as const, required: false, dimensions: "3840x2160", derivativeProfile: "hero" }
  ];
  return profile.map((row) => ({
    id: `encyclopedia_${input.entryId}_${row.role}`,
    entryId: input.entryId,
    entityType: input.entityType,
    canonicalRecordId: input.canonicalRecordId,
    role: row.role,
    required: row.required,
    semanticAssetKey: assetKey(input.entityType, input.canonicalRecordId, row.role),
    displayName: `${input.displayName} ${titleCase(row.role)}`,
    dimensions: row.dimensions,
    priority: input.priority === "P0" ? "critical" as const : input.priority === "P1" ? "high" as const : input.priority === "P2" ? "medium" as const : "low" as const,
    derivativeProfile: row.derivativeProfile as EncyclopediaAssetRequirement["derivativeProfile"],
    aliases: []
  }));
}

function readinessFor(requirements: EncyclopediaAssetRequirement[], assets: ProductionAsset[]): EncyclopediaAssetReadiness {
  const resolved = requirements.map((requirement) => {
    const asset = findAsset(assets, requirement.semanticAssetKey);
    return {
      ...requirement,
      status: assetStatus(asset),
      linkedAssetId: asset?.id ?? null,
      previewUrl: previewUrlForAsset(asset)
    };
  });
  const required = resolved.filter((item) => item.required);
  const supplied = required.filter((item) => item.status !== "missing").length;
  const approved = required.filter((item) => item.status === "approved" || item.status === "published").length;
  const published = required.filter((item) => item.status === "published").length;
  const missing = required.length - supplied;
  return {
    required: required.length,
    supplied,
    approved,
    published,
    missing,
    platformReadiness: {
      web: published ? "ready" : supplied ? "pending" : "missing",
      roblox: published ? "ready" : supplied ? "pending" : "missing",
      ios: published ? "ready" : supplied ? "pending" : "missing",
      android: published ? "ready" : supplied ? "pending" : "missing"
    },
    artCompletion: required.length ? Math.round((published * 100 + (approved - published) * 80 + (supplied - approved) * 40) / required.length) : 100,
    requirements: resolved
  };
}

function entryBase(input: {
  entityType: EncyclopediaEntityType;
  canonicalRecordId: string;
  displayName: string;
  description?: string;
  summary?: string;
  category?: string;
  subcategory?: string;
  era?: string;
  tier?: number | null;
  rarity?: string;
  tags?: string[];
  effects?: string[];
  inputs?: string[];
  outputs?: string[];
  unlockRequirements?: string[];
  dependencies?: string[];
  locations?: string[];
  references?: EncyclopediaEntry["references"];
  publicationState?: EncyclopediaPublicationState;
  priority?: "P0" | "P1" | "P2" | "P3";
}, assets: ProductionAsset[]): EncyclopediaEntry {
  const id = `${input.entityType}_${slug(input.canonicalRecordId)}`;
  const priority = input.priority ?? "P3";
  const requirements = requirementsForEntry({ entryId: id, entityType: input.entityType, canonicalRecordId: input.canonicalRecordId, displayName: input.displayName, priority });
  const assetReadiness = readinessFor(requirements, assets);
  const hasDescription = Boolean(text(input.description) || text(input.summary));
  const publicationState = input.publicationState ?? "canonical_draft";
  return {
    id,
    entityType: input.entityType,
    canonicalRecordId: input.canonicalRecordId,
    displayName: input.displayName,
    shortDisplayName: input.displayName.length > 28 ? `${input.displayName.slice(0, 25)}...` : input.displayName,
    description: text(input.description),
    summary: text(input.summary, text(input.description)),
    status: "canonical",
    era: input.era ?? "unassigned",
    tier: input.tier ?? null,
    rarity: input.rarity ?? "standard",
    category: input.category ?? input.entityType,
    subcategory: input.subcategory ?? "general",
    tags: input.tags ?? [],
    iconArtKey: assetKey(input.entityType, input.canonicalRecordId, "icon"),
    heroArtKey: assetKey(input.entityType, input.canonicalRecordId, "hero"),
    galleryArtKeys: [],
    relatedEntries: [],
    unlockRequirements: input.unlockRequirements ?? [],
    dependencies: input.dependencies ?? [],
    effects: input.effects ?? [],
    inputs: input.inputs ?? [],
    outputs: input.outputs ?? [],
    locations: input.locations ?? [],
    civilizations: [],
    planets: [],
    progression: [],
    lore: {
      editorialStatus: hasDescription ? "draft" : "missing",
      shortSummary: text(input.summary),
      longDescription: "",
      playerFacingExplanation: "",
      discoveryText: ""
    },
    references: input.references ?? [],
    assetReadiness,
    publicationState,
    completeness: {
      dataReadiness: 100,
      editorialReadiness: hasDescription ? 35 : 0,
      artReadiness: assetReadiness.artCompletion,
      publicationReadiness: publicationState === "published" ? 100 : publicationState === "production_ready" ? 75 : publicationState === "approved_design" ? 60 : publicationState === "canonical_draft" ? 25 : 0
    },
    priority
  };
}

function buildingEntry(definition: CanonicalBuildingDefinition, assets: ProductionAsset[]): EncyclopediaEntry {
  const entry = entryBase({
    entityType: "building",
    canonicalRecordId: definition.id,
    displayName: definition.displayName,
    description: `${definition.displayName} is a ${definition.subcategoryName.toLowerCase()} building definition in ${definition.familyName}.`,
    summary: `${definition.familyName} / ${definition.subcategoryName}`,
    category: definition.familyName,
    subcategory: definition.subcategoryName,
    era: definition.era,
    tier: definition.tier,
    tags: definition.tags,
    effects: [...definition.populationEffects, ...definition.laborEffects, ...definition.creditEffects, ...definition.researchEffects],
    inputs: definition.inputs,
    outputs: definition.outputs,
    unlockRequirements: definition.unlockRequirements,
    dependencies: definition.dependencies,
    publicationState: "scaffold",
    priority: definition.tier <= 2 && ["population-housing", "agriculture-food", "manufacturing", "energy", "research-education"].includes(definition.familyId) ? "P1" : "P3",
    references: [{ type: "building_library", id: definition.id, label: "Canonical Building Library", href: `/buildings` }]
  }, assets);
  entry.locations = [...definition.planetAvailability, ...definition.districtAvailability];
  return entry;
}

function generatedPlanetName(row: GeneratedPlanet) {
  return text(row.name, row.id);
}

function discoveryEntry(row: DiscoveryRecord, assets: ProductionAsset[]): EncyclopediaEntry {
  const category = discoveryCategories.find((item) => item.id === row.categoryId);
  const subcategory = category?.subcategories.find((item) => item.id === row.subcategoryId);
  const spawnRuleSummary = compactStrings(
    row.spawnRules.galaxy,
    row.spawnRules.sector,
    row.spawnRules.starSystem,
    row.spawnRules.planetClass,
    row.spawnRules.biome,
    row.spawnRules.atmosphere,
    row.spawnRules.gravity,
    row.spawnRules.temperature,
    row.spawnRules.weather,
    row.spawnRules.pointsOfInterest,
    row.spawnRules.starType,
    row.spawnRules.specialEvents
  ).join(", ");
  const entry = entryBase({
    entityType: "discovery",
    canonicalRecordId: row.id,
    displayName: row.displayName,
    description: row.description,
    summary: `${category?.displayName ?? row.categoryId} / ${subcategory?.displayName ?? row.subcategoryId}`,
    category: category?.displayName ?? row.categoryId,
    subcategory: subcategory?.displayName ?? row.subcategoryId,
    era: "discovery",
    tier: row.requiredScanLevel,
    rarity: row.rarity,
    tags: row.tags,
    effects: compactStrings(`Discovery XP ${row.discoveryXp}`, `Research ${row.researchValue}`, `Credits ${row.creditsValue}`, row.unlocks),
    inputs: [...row.requiredEquipmentIds, ...row.relatedResourceIds],
    outputs: row.unlocks,
    unlockRequirements: [...row.relatedResearchIds, ...row.requiredEquipmentIds],
    dependencies: row.relatedResearchIds,
    locations: compactStrings(row.spawnRules.galaxy, row.spawnRules.sector, row.spawnRules.starSystem, row.spawnRules.planetClass, row.spawnRules.biome, row.spawnRules.starType),
    publicationState: row.publicationStatus === "published" ? "published" : row.publicationStatus === "approved" ? "approved_design" : "canonical_draft",
    priority: row.rarity === "unique" || row.rarity === "mythic" || row.rarity === "legendary" ? "P1" : "P2",
    references: [{ type: "discovery", id: row.id, label: "Discovery", href: `/discovery?entry=${encodeURIComponent(row.id)}` }]
  }, assets);
  entry.lore.editorialStatus = row.publicationStatus === "published" ? "published" : row.publicationStatus === "approved" ? "reviewed" : "draft";
  entry.lore.shortSummary = row.lore;
  entry.lore.longDescription = compactStrings(row.description, row.lore, spawnRuleSummary ? `Spawn rules: ${spawnRuleSummary}.` : "").join("\n\n");
  entry.lore.playerFacingExplanation = row.description;
  entry.lore.discoveryText = compactStrings(row.lore, row.unlocks.length ? `Discovery notes: unlocks ${row.unlocks.join(", ")}.` : "").join("\n\n");
  entry.relatedEntries = [
    ...row.unlocks.filter((id) => id.startsWith("DISC-")).map((id) => ({ entryId: `discovery_${slug(id)}`, relationshipType: "unlocks" as const })),
    ...row.relatedLifeformIds.map((id) => ({ entryId: `discovery_${slug(id)}`, relationshipType: "related_to" as const }))
  ];
  entry.civilizations = row.relatedCivilizationIds;
  entry.planets = row.relatedPlanetIds;
  entry.progression = [`Scan level ${row.requiredScanLevel}`, `Spawn weight ${row.spawnWeight}`, ...row.unlocks];
  entry.galleryArtKeys = [row.assetProfile.card, row.assetProfile.hero, row.assetProfile.worldRender, row.assetProfile.discoveryAnimation, row.assetProfile.sound, row.assetProfile.video].filter(Boolean);
  entry.completeness.editorialReadiness = entry.lore.editorialStatus === "published" ? 100 : entry.lore.editorialStatus === "reviewed" ? 80 : 35;
  return entry;
}

function buildEntries(data: GameData, assets: ProductionAsset[]) {
  const aiModules = getAiAgentRuntimeModules();
  const fallbackFactions = generateFallbackFactions();
  return [
    ...canonicalBuildingLibrary.map((definition) => buildingEntry(definition, assets)),
    ...data.research.map((row) => entryBase({
      entityType: "research",
      canonicalRecordId: row.id,
      displayName: row.name,
      description: row.unlock_summary || row.design_purpose || row.gameplay_effect,
      category: row.branch_id,
      subcategory: row.primary_unlock_type,
      era: row.era,
      tier: row.node_order,
      unlockRequirements: compactStrings(row.prerequisite_id),
      outputs: row.unlocks,
      tags: compactStrings(row.branch_id, row.primary_unlock_type, row.era, row.related_systems),
      priority: row.era === "Survival" || row.era === "Ancient" ? "P1" : "P2",
      references: [{ type: "research", id: row.id, label: "Research Designer", href: "/research" }]
    }, assets)),
    ...canonicalDiscoveries.map((row) => discoveryEntry(row, assets)),
    ...canonicalEconomyDefinitions.map((row) => entryBase({
      entityType: "resource",
      canonicalRecordId: row.id,
      displayName: row.displayName,
      description: row.description,
      category: "economy",
      subcategory: row.valueType,
      era: "global",
      rarity: row.premium ? "premium" : "common",
      tags: row.usage,
      priority: row.visibility === "always" ? "P0" : "P1",
      references: [{ type: "economy", id: row.id, label: "Economy Designer", href: "/economy-designer" }]
    }, assets)),
    ...ResourceService.catalog.map((row) => entryBase({
      entityType: "resource",
      canonicalRecordId: row.id,
      displayName: row.resource_name,
      description: row.description,
      category: row.category,
      subcategory: row.discovery_tier,
      era: row.discovery_tier,
      rarity: row.rarity,
      tags: [...row.primary_uses, ...row.typical_planet_classes],
      outputs: row.primary_uses,
      priority: row.discovery_tier === "Survival" || row.discovery_tier === "Ancient" ? "P1" : "P3",
      references: [{ type: "resource_catalog", id: row.id, label: "Resource Catalog", href: "/resource-catalog" }]
    }, assets)),
    ...data.generated_planets.map((row) => entryBase({
      entityType: "planet",
      canonicalRecordId: row.id,
      displayName: generatedPlanetName(row),
      description: `${generatedPlanetName(row)} is a ${text(row.rarity, "standard").toLowerCase()} ${text(row.planet_class, "planet").toLowerCase()} world with ${text(row.primary_biome, "unknown").toLowerCase()} biome data.`,
      category: text(row.planet_class, "planet"),
      subcategory: text(row.primary_biome, "unknown biome"),
      rarity: text(row.rarity, "standard"),
      tags: compactStrings(row.planet_subclass, row.primary_biome, row.planet_class, row.hazards, row.traits),
      locations: compactStrings(row.galaxyName, row.sectorName, row.starSystemName),
      outputs: row.resourceIds ?? [],
      priority: row.discoveryState === "colonized" || row.discoveryState === "explored" ? "P1" : "P3",
      references: [{ type: "planet", id: row.id, label: "Planet Library", href: "/planets" }]
    }, assets)),
    ...data.celestial_bodies.map((row) => entryBase({
      entityType: "star",
      canonicalRecordId: row.id,
      displayName: row.name,
      description: text(row.notes, `${row.name} is a celestial body record.`),
      category: row.celestial_body_type,
      subcategory: text(row.planet_class, "stellar"),
      rarity: text(row.planet_rarity, "standard"),
      tags: compactStrings(row.celestial_body_type, row.planet_class, row.planet_subclass, row.planet_rarity),
      locations: [row.system_id],
      priority: "P3",
      references: [{ type: "celestial_body", id: row.id, label: "Celestial Bodies", href: "/celestial-bodies" }]
    }, assets)),
    ...data.star_systems.map((row) => entryBase({
      entityType: "star_system",
      canonicalRecordId: row.id,
      displayName: row.system_name,
      description: `${row.system_name} is a ${row.system_type} star system with ${row.planet_count} planets.`,
      category: text(row.star_type, "star system"),
      subcategory: text(row.system_type, "standard"),
      rarity: text(row.system_rarity, "standard"),
      tags: compactStrings(row.star_type, row.system_type, row.system_role, row.system_rarity, row.resource_bias, row.sector_id),
      locations: [row.sector_id],
      priority: "P3",
      references: [{ type: "star_system", id: row.id, label: "Star System Map", href: "/star-system-map" }]
    }, assets)),
    ...data.districts.map((row) => entryBase({
      entityType: "district",
      canonicalRecordId: row.id,
      displayName: row.name,
      description: row.purpose,
      category: row.primary_stat,
      subcategory: row.bonus,
      era: row.civilization,
      tags: compactStrings(row.primary_stat, row.bonus, row.civilization, row.primary_buildings),
      priority: row.priority <= 2 ? "P1" : "P2",
      references: [{ type: "district", id: row.id, label: "District Designer", href: "/districts" }]
    }, assets)),
    ...data.wonders.map((row) => entryBase({
      entityType: /dyson|ringworld|stellar|mega|galactic/i.test(`${row.name} ${row.notes}`) ? "megastructure" : "wonder",
      canonicalRecordId: row.id,
      displayName: row.name,
      description: row.notes || row.primary_bonus_type,
      category: "wonder",
      subcategory: row.primary_bonus_type,
      era: row.civilization,
      tier: null,
      effects: row.bonuses,
      inputs: row.requirements,
      unlockRequirements: compactStrings(row.unlock_research_id),
      tags: compactStrings(row.civilization, row.primary_bonus_type, row.bonuses, row.requirements),
      priority: "P2",
      references: [{ type: "wonder", id: row.id, label: "Wonder Designer", href: "/wonders" }]
    }, assets)),
    ...data.upgrades.map((row) => entryBase({
      entityType: "upgrade",
      canonicalRecordId: row.id,
      displayName: row.name,
      description: row.description,
      category: row.type,
      subcategory: row.bonus_type,
      era: row.era,
      tier: Number.parseInt(row.tier, 10) || null,
      effects: compactStrings(row.bonus_type, row.bonus_value),
      inputs: compactStrings(row.cost_resource),
      priority: "P1",
      references: [{ type: "upgrade", id: row.id, label: "Upgrade Designer", href: "/upgrades" }]
    }, assets)),
    ...aiModules.aiAgents.map((row) => entryBase({
      entityType: "ai_agent",
      canonicalRecordId: row.id,
      displayName: row.displayName,
      description: row.description,
      category: "ai agent",
      subcategory: row.rarity,
      rarity: row.rarity,
      tags: compactStrings(row.rarity, row.personalityId, Object.keys(row.unlockRequirements), Object.keys(row.eraAvailability)),
      priority: row.id === defaultAiAgentId ? "P0" : "P2",
      references: [{ type: "ai_agent", id: row.id, label: "AI Agents", href: "/ai-agents" }]
    }, assets)),
    ...data.civilization_identity.map((row) => entryBase({
      entityType: "civilization",
      canonicalRecordId: row.id,
      displayName: row.civilization_name,
      description: row.notes || row.future_prediction,
      category: row.civilization_title,
      subcategory: row.primary_alignment,
      era: row.current_age,
      tags: compactStrings(row.civilization_title, row.primary_alignment, row.secondary_alignment, row.current_age),
      priority: "P1",
      references: [{ type: "civilization", id: row.id, label: "Civilization Design Studio", href: "/civilizations" }]
    }, assets)),
    ...fallbackFactions.map((row) => entryBase({
      entityType: "faction",
      canonicalRecordId: row.id,
      displayName: row.name,
      description: row.description,
      category: row.type,
      subcategory: row.alignment,
      rarity: row.technologyLevel,
      tags: compactStrings(row.type, row.government, row.alignment, row.disposition),
      locations: compactStrings(row.homeGalaxyId, row.homeSectorId, row.homeStarSystemId, row.homePlanetId),
      priority: "P2",
      references: [{ type: "faction", id: row.id, label: "Factions", href: "/factions" }]
    }, assets)),
    ...colonyLevelDefinitions.map((row) => entryBase({
      entityType: "colony",
      canonicalRecordId: `colony_level_${row.level}`,
      displayName: row.name,
      description: `${row.name} is colony level ${row.level}, requiring ${row.minimumPopulation.toLocaleString()} population and ${row.requiredInfrastructure} infrastructure.`,
      category: "colony level",
      subcategory: "settlement progression",
      tier: row.level,
      effects: [`${row.buildingSlots} building slots`, `${row.productionModifier} production modifier`],
      priority: row.level <= 2 ? "P1" : "P2",
      references: [{ type: "colony_level", id: `colony_level_${row.level}`, label: "Colonies", href: "/colonies" }]
    }, assets))
  ];
}

function entryByBuildingName(name: string, familyId?: string) {
  return canonicalBuildingLibrary.find((item) => item.displayName === name && (!familyId || item.familyId === familyId))?.id ?? "";
}

export const authoredBuildingProgressionChains: BuildingProgressionChain[] = [
  {
    chainId: "primitive-to-advanced-housing",
    displayName: "Primitive to Advanced Housing",
    familyId: "population-housing",
    subcategoryId: "housing",
    nodes: ["Tent", "Lean-To Shelter", "Log Cabin", "House", "Apartment Block", "High Rise", "Arcology"].map((name, index) => ({ buildingId: entryByBuildingName(name), order: index + 1, relationshipType: index === 0 ? "prerequisite_for" as const : "upgrades_to" as const, requirements: [] })),
    validationStatus: "Ready"
  },
  {
    chainId: "civilization-energy-chain",
    displayName: "Civilization Energy Chain",
    familyId: "energy",
    subcategoryId: "power-plants",
    nodes: ["Campfire", "Windmill", "Water Wheel", "Steam Plant", "Coal Plant", "Solar Farm", "Fusion Reactor", "Antimatter Reactor", "Quantum Reactor"].map((name, index) => ({ buildingId: entryByBuildingName(name), order: index + 1, relationshipType: "evolves_into" as const, requirements: [] })),
    validationStatus: "Ready"
  },
  {
    chainId: "workshop-to-matter-assembly",
    displayName: "Workshop to Matter Assembly",
    familyId: "manufacturing",
    subcategoryId: "workshops",
    nodes: ["Workshop", "Forge", "Machine Shop", "Factory", "Assembly Plant", "Nanofactory", "Matter Assembler"].map((name, index) => ({ buildingId: entryByBuildingName(name), order: index + 1, relationshipType: "upgrades_to" as const, requirements: [] })),
    validationStatus: "Ready"
  },
  {
    chainId: "research-institution-chain",
    displayName: "Research Institution Chain",
    familyId: "research-education",
    subcategoryId: "laboratories",
    nodes: ["Library", "Research Lab", "Advanced Lab", "AI Institute", "Quantum Research Center"].map((name, index) => ({ buildingId: entryByBuildingName(name), order: index + 1, relationshipType: "unlocks" as const, requirements: [] })),
    validationStatus: "Ready"
  },
  {
    chainId: "space-infrastructure-chain",
    displayName: "Space Infrastructure Chain",
    familyId: "space-infrastructure",
    subcategoryId: "spaceports",
    nodes: ["Launch Pad", "Spaceport", "Orbital Dock", "Orbital Shipyard", "Fleet Yard", "Orbital Ring"].map((name, index) => ({ buildingId: entryByBuildingName(name), order: index + 1, relationshipType: "evolves_into" as const, requirements: [] })),
    validationStatus: "Ready"
  },
  {
    chainId: "galactic-megastructure-chain",
    displayName: "Galactic Megastructure Chain",
    familyId: "megastructures",
    subcategoryId: "dyson-systems",
    nodes: ["Dyson Collector", "Dyson Swarm", "Dyson Sphere", "Ringworld", "Stellar Forge", "Quantum Gate"].map((name, index) => ({ buildingId: entryByBuildingName(name), order: index + 1, relationshipType: "branches_to" as const, requirements: [] })),
    validationStatus: "Ready"
  }
].map((chain) => ({
  ...chain,
  nodes: chain.nodes.filter((node) => node.buildingId),
  validationStatus: chain.nodes.some((node) => !node.buildingId) ? "Needs Records" : "Ready"
}));

export const authoredBuildingCollections: EncyclopediaCollection[] = [
  { id: "primitive-housing", displayName: "Primitive Housing", description: "Early settlement shelter and population capacity.", buildingIds: ["Tent", "Lean-To Shelter", "Log Cabin"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 1, eraRange: ["survival", "ancient"], status: "draft" },
  { id: "urban-housing", displayName: "Urban Housing", description: "City-scale housing from houses to towers.", buildingIds: ["House", "Townhouse", "Apartment Block", "High Rise"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 2, eraRange: ["medieval", "modern"], status: "draft" },
  { id: "advanced-habitats", displayName: "Advanced Habitats", description: "Late-game habitation across domes, arcologies, and orbital living.", buildingIds: ["Dome Habitat", "Arcology", "Orbital Habitat", "Ring Habitat"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 3, eraRange: ["space-age", "galactic"], status: "draft" },
  { id: "primitive-energy", displayName: "Primitive Energy", description: "Energy before industrial infrastructure.", buildingIds: ["Campfire", "Charcoal Kiln", "Windmill", "Water Wheel"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 4, eraRange: ["survival", "medieval"], status: "draft" },
  { id: "industrial-energy", displayName: "Industrial Energy", description: "Steam, coal, solar, and fusion power foundations.", buildingIds: ["Steam Plant", "Coal Plant", "Solar Farm", "Fusion Reactor"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 5, eraRange: ["industrial", "space-age"], status: "draft" },
  { id: "stellar-energy", displayName: "Stellar Energy", description: "Antimatter, quantum, and star-scale energy systems.", buildingIds: ["Antimatter Reactor", "Quantum Reactor", "Dyson Swarm", "Dyson Sphere"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 6, eraRange: ["interstellar", "galactic"], status: "draft" },
  { id: "early-agriculture", displayName: "Early Agriculture", description: "Foundational food systems.", buildingIds: ["Farm", "Ranch", "Orchard", "Greenhouse"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 7, eraRange: ["survival", "ancient"], status: "draft" },
  { id: "synthetic-food-systems", displayName: "Synthetic Food Systems", description: "Laboratory and orbital food systems.", buildingIds: ["Food Lab", "Protein Synthesizer", "Nutrient Printer", "Orbital Grow Deck"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 8, eraRange: ["modern", "interstellar"], status: "draft" },
  { id: "planetary-infrastructure", displayName: "Planetary Infrastructure", description: "Planet-scale grids, shields, and elevators.", buildingIds: ["Planetary Grid", "Space Elevator", "Planetary Shield", "World Grid"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 9, eraRange: ["space-age", "interstellar"], status: "draft" },
  { id: "orbital-infrastructure", displayName: "Orbital Infrastructure", description: "Stations, docks, rings, and satellite systems.", buildingIds: ["Orbital Station", "Orbital Dock", "Orbital Ring", "Trade Station"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 10, eraRange: ["space-age", "galactic"], status: "draft" },
  { id: "interstellar-logistics", displayName: "Interstellar Logistics", description: "Supply chains beyond a single star system.", buildingIds: ["Stellar Depot", "Convoy Office", "Jump Logistics Center", "Galactic Depot"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 11, eraRange: ["interstellar", "galactic"], status: "draft" },
  { id: "galactic-megastructures", displayName: "Galactic Megastructures", description: "Stellar engineering and civilization-scale projects.", buildingIds: ["Dyson Swarm", "Dyson Sphere", "Ringworld", "Stellar Forge", "Quantum Gate"].map((name) => entryByBuildingName(name)).filter(Boolean), displayOrder: 12, eraRange: ["interstellar", "galactic"], status: "draft" }
];

function section(id: EncyclopediaEntityType, label: string, description: string, hierarchy: string[], entries: EncyclopediaEntry[], plannedReason?: string): EncyclopediaSection {
  return {
    id,
    label,
    description,
    hierarchy,
    entries,
    status: entries.length ? "active" : "planned",
    plannedReason
  };
}

function buildSections(entries: EncyclopediaEntry[]): EncyclopediaSection[] {
  const byType = (type: EncyclopediaEntityType) => entries.filter((entry) => entry.entityType === type);
  return [
    section("building", "Buildings", "Canonical building families, subcategories, and scaffold definitions.", ["Family", "Subcategory", "Building"], byType("building")),
    section("research", "Research", "Research branches, nodes, costs, prerequisites, and downstream unlocks.", ["Branch", "Node"], byType("research")),
    section("resource", "Resources", "Economy values and canonical material/world resources.", ["Category", "Resource"], byType("resource")),
    section("planet", "Planets", "Generated planet records and resource profiles.", ["Galaxy", "Sector", "Star System", "Planet"], byType("planet")),
    section("star", "Stars", "Stars and celestial bodies when canonical records exist.", ["Star System", "Star"], byType("star")),
    section("star_system", "Star Systems", "Star system records and their published hierarchy links.", ["Galaxy", "Sector", "Star System"], byType("star_system")),
    section("sector", "Sectors", "Sector encyclopedia is planned until canonical sector records are exposed as first-class entries.", ["Galaxy", "Sector"], byType("sector"), "Sector records are currently exported through universe data but not authored as encyclopedia records."),
    section("galaxy", "Galaxies", "Galaxy encyclopedia is planned until canonical galaxy records are exposed as first-class entries.", ["Galaxy"], byType("galaxy"), "Galaxy records are currently generated for exploration workflows."),
    section("district", "Districts", "District types and specialization metadata.", ["Category", "District"], byType("district")),
    section("settlement", "Settlements", "Settlement encyclopedia is planned until settlement records exist.", ["Civilization", "Planet", "Settlement"], byType("settlement"), "Settlement records are represented by colonies/factions today."),
    section("colony", "Colonies", "Colony levels, growth model, and settlement progression.", ["Planet", "Colony"], byType("colony")),
    section("ship", "Ships", "Ship and vehicle entries are planned until canonical ship records exist.", ["Class", "Ship"], byType("ship"), "No canonical ship table exists yet."),
    section("ai_agent", "AI Agents", "AI companion definitions and visual variants.", ["Agent", "Variant"], byType("ai_agent")),
    section("civilization", "Civilizations", "Civilization identity, alignment, and progression records.", ["Civilization"], byType("civilization")),
    section("faction", "Factions", "Faction/civilization presence and generated faction records.", ["Type", "Faction"], byType("faction")),
    section("technology", "Technologies", "Technology entries are represented by research/upgrades until a dedicated table exists.", ["Era", "Technology"], byType("technology"), "Technology records are currently modeled through Research and Upgrades."),
    section("discovery", "Discovery", "Canonical discoverable objects, scan targets, collection records, and discovery-facing lore.", ["Category", "Subcategory", "Discovery"], byType("discovery")),
    section("upgrade", "Upgrades", "Upgrade chains and category effects.", ["Category", "Upgrade"], byType("upgrade")),
    section("wonder", "Wonders", "Wonders and high-impact civilization projects.", ["Era", "Wonder"], byType("wonder")),
    section("megastructure", "Megastructures", "Megastructure definitions and late-game construction.", ["Era", "Megastructure"], byType("megastructure")),
    section("event", "Events", "Event encyclopedia is planned until canonical event records exist.", ["Era", "Event"], byType("event"), "Event records are not first-class canonical data yet."),
    section("mission", "Missions", "Mission encyclopedia is planned until mission records are promoted from procedural templates.", ["Type", "Mission"], byType("mission"), "Procedural missions exist; static encyclopedia publication is not approved yet."),
    section("trade", "Trade", "Trade routes, markets, and listings are planned for a later canonical table.", ["Market", "Route"], byType("trade"), "Trade systems are generated placeholders today."),
    section("species", "Species / Lifeforms", "Species/lifeform entries are planned if canonical records are introduced.", ["Species"], byType("species"), "No canonical species table exists yet."),
    section("artifact", "Artifacts / Relics", "Artifact/relic entries are planned if canonical records are introduced.", ["Artifact"], byType("artifact"), "No canonical artifact table exists yet.")
  ];
}

function buildRelationshipGraph(entries: EncyclopediaEntry[], chains: BuildingProgressionChain[]): EncyclopediaRelationshipGraph {
  const entryIds = new Set(entries.map((entry) => entry.id));
  const buildingEntryByRecord = new Map(entries.filter((entry) => entry.entityType === "building").map((entry) => [entry.canonicalRecordId, entry.id]));
  const edges = chains.flatMap((chain) =>
    chain.nodes.slice(1).map((node, index) => ({
      from: buildingEntryByRecord.get(chain.nodes[index].buildingId) ?? chain.nodes[index].buildingId,
      to: buildingEntryByRecord.get(node.buildingId) ?? node.buildingId,
      edgeType: node.relationshipType === "upgrades_to" ? "upgrades_to" as const : "related_to" as const
    }))
  );
  const brokenRelationships = edges.filter((edge) => !entryIds.has(edge.from) || !entryIds.has(edge.to)).map((edge) => ({ from: edge.from, to: edge.to, reason: "Relationship endpoint does not resolve to an encyclopedia entry." }));
  return {
    nodes: entries.slice(0, 500).map((entry) => ({ id: entry.id, label: entry.displayName, entityType: entry.entityType })),
    edges,
    brokenRelationships,
    circularRelationships: []
  };
}

function validateEncyclopedia(state: Omit<CivilizationEncyclopediaState, "validation">) {
  const issues: CivilizationEncyclopediaState["validation"]["issues"] = [];
  const entryIds = new Set<string>();
  const duplicateIds = new Set<string>();
  for (const entry of state.entries) {
    if (entryIds.has(entry.id)) duplicateIds.add(entry.id);
    entryIds.add(entry.id);
    if (!entry.canonicalRecordId) issues.push({ severity: "error", code: "entry_canonical_record_missing", message: "Every encyclopedia entry must resolve to a canonical record.", records: [entry.id] });
    if (entry.publicationState === "published" && entry.lore.editorialStatus !== "published") issues.push({ severity: "error", code: "draft_editorial_published", message: "Draft editorial content cannot be published.", records: [entry.id] });
  }
  if (duplicateIds.size) issues.push({ severity: "error", code: "duplicate_entry_id", message: "Encyclopedia entries must have unique IDs.", records: [...duplicateIds] });
  for (const collection of state.buildingCollections) {
    const missing = collection.buildingIds.filter((id) => !canonicalBuildingLibrary.some((building) => building.id === id));
    if (missing.length) issues.push({ severity: "error", code: "collection_building_missing", message: "Collections must reference canonical building definitions.", records: [collection.id, ...missing] });
  }
  for (const chain of state.buildingProgressionChains) {
    if (chain.nodes.length < 2) issues.push({ severity: "warning", code: "progression_chain_incomplete", message: "Progression chains should have at least two resolved nodes.", records: [chain.chainId] });
    const missing = chain.nodes.filter((node) => !canonicalBuildingLibrary.some((building) => building.id === node.buildingId));
    if (missing.length) issues.push({ severity: "error", code: "progression_chain_node_missing", message: "Progression chain nodes must reference canonical building definitions.", records: [chain.chainId, ...missing.map((node) => node.buildingId)] });
  }
  if (state.relationshipGraph.brokenRelationships.length) issues.push({ severity: "error", code: "relationship_graph_broken", message: "Relationship graph contains unresolved endpoints.", records: state.relationshipGraph.brokenRelationships.map((edge) => `${edge.from}->${edge.to}`) });
  const serialized = JSON.stringify(state);
  if (/\/Users\/|studio-private:\/\/|SUPABASE|SERVICE_ROLE|PRIVATE_KEY/i.test(serialized)) issues.push({ severity: "error", code: "private_path_leak", message: "Encyclopedia state must not expose private paths or secrets.", records: ["encyclopedia"] });
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    status: errorCount ? "Blocked" as const : warningCount ? "Ready With Warnings" as const : "Ready" as const,
    issues
  };
}

export function buildEncyclopediaAssetRequirements(data: GameData, assets: ProductionAsset[] = [], scope: { section?: EncyclopediaEntityType; priority?: "P0" | "P1" | "P2" | "P3" } = {}) {
  const entries = buildEntries(data, assets).filter((entry) => (!scope.section || entry.entityType === scope.section) && (!scope.priority || entry.priority === scope.priority));
  return entries.flatMap((entry) => entry.assetReadiness.requirements.filter((requirement) => requirement.required && requirement.status === "missing"));
}

export function buildCivilizationEncyclopediaState(data: GameData, assets: ProductionAsset[] = []): CivilizationEncyclopediaState {
  const entries = buildEntries(data, assets);
  const sections = buildSections(entries);
  const relationshipGraph = buildRelationshipGraph(entries, authoredBuildingProgressionChains);
  const milestoneSeeds: EncyclopediaMilestone[] = [
    { id: "alpha-building-encyclopedia", displayName: "Alpha Building Encyclopedia", description: "150-200 curated playable buildings with icons/cards and selected hero art.", entryIds: entries.filter((entry) => entry.entityType === "building" && entry.priority === "P1").slice(0, 200).map((entry) => entry.id), requiredFields: ["displayName", "summary", "family", "subcategory", "unlockRequirements"], requiredAssetRoles: ["icon", "card"], targetPlatforms: ["web", "roblox"], readiness: 0 },
    { id: "mobile-beta-encyclopedia", displayName: "Mobile Beta Encyclopedia", description: "Compact encyclopedia presentation with mobile thumbnails.", entryIds: entries.filter((entry) => ["building", "research", "resource"].includes(entry.entityType)).slice(0, 500).map((entry) => entry.id), requiredFields: ["summary", "assetReadiness"], requiredAssetRoles: ["icon", "thumbnail"], targetPlatforms: ["ios", "android"], readiness: 0 },
    { id: "planet-expansion-pack", displayName: "Planet Expansion Pack", description: "Planet/celestial entries and discovery-facing art requirements.", entryIds: entries.filter((entry) => ["planet", "star", "star_system"].includes(entry.entityType)).map((entry) => entry.id), requiredFields: ["locations", "resources", "summary"], requiredAssetRoles: ["thumbnail", "card", "hero"], targetPlatforms: ["web", "roblox"], readiness: 0 },
    { id: "galactic-megastructures", displayName: "Galactic Megastructures", description: "Wonder and megastructure encyclopedia package.", entryIds: entries.filter((entry) => ["wonder", "megastructure"].includes(entry.entityType)).map((entry) => entry.id), requiredFields: ["requirements", "progression"], requiredAssetRoles: ["hero", "progression"], targetPlatforms: ["web", "roblox"], readiness: 0 },
    { id: "civilization-factions-pack", displayName: "Civilization Factions Pack", description: "Civilization and faction identity records.", entryIds: entries.filter((entry) => ["civilization", "faction", "ai_agent"].includes(entry.entityType)).map((entry) => entry.id), requiredFields: ["identity", "relationships", "visualAssets"], requiredAssetRoles: ["icon", "hero"], targetPlatforms: ["web", "roblox"], readiness: 0 }
  ];
  const milestones: EncyclopediaMilestone[] = milestoneSeeds.map((milestone) => {
    const selected = entries.filter((entry) => milestone.entryIds.includes(entry.id));
    const readiness = selected.length ? Math.round(selected.reduce((sum, entry) => sum + entry.completeness.artReadiness, 0) / selected.length) : 0;
    return { ...milestone, readiness };
  });
  const stateWithoutValidation = {
    route: "/encyclopedia" as const,
    title: "Civilization Encyclopedia" as const,
    subtitle: "The canonical knowledge system of NOVERIS." as const,
    generatedAt: new Date().toISOString(),
    sections,
    entries,
    buildingCollections: authoredBuildingCollections,
    buildingProgressionChains: authoredBuildingProgressionChains,
    relationshipGraph,
    assetProfiles: encyclopediaAssetProfiles,
    semanticNamingConvention: encyclopediaSemanticNamingConvention,
    derivativeProfiles: encyclopediaDerivativeProfiles,
    milestones,
    galactopediaContract: {
      status: "draft_not_published" as const,
      fields: ["entry ID", "entity type", "canonical record ID", "display name", "summary", "approved description/lore", "category", "era", "icon key", "hero key", "related entry IDs", "unlock/visibility rule", "publication state"],
      excludedFields: ["private paths", "internal notes", "review comments", "draft editorial content", "Studio-only diagnostics"],
      rule: "Only approved/published editorial entries may enter a future sanitized Galactopedia export."
    },
    metrics: {
      totalEntries: entries.length,
      activeSections: sections.filter((item) => item.status === "active").length,
      plannedSections: sections.filter((item) => item.status === "planned").length,
      scaffoldEntries: entries.filter((entry) => entry.publicationState === "scaffold").length,
      approvedEntries: entries.filter((entry) => entry.publicationState === "approved_design").length,
      publishedEntries: entries.filter((entry) => entry.publicationState === "published").length,
      missingDescriptions: entries.filter((entry) => entry.lore.editorialStatus === "missing").length,
      missingIcons: entries.filter((entry) => entry.assetReadiness.requirements.some((requirement) => requirement.role === "icon" && requirement.required && requirement.status === "missing")).length,
      missingHeroArt: entries.filter((entry) => entry.assetReadiness.requirements.some((requirement) => requirement.role === "hero" && requirement.required && requirement.status === "missing")).length,
      brokenRelationships: relationshipGraph.brokenRelationships.length,
      incompleteProgressionChains: authoredBuildingProgressionChains.filter((chain) => chain.validationStatus !== "Ready").length,
      inGameExportReadiness: "draft_not_published" as const
    },
    bulkRequirementPreview: {
      scopes: ["selected entry", "selected subcategory", "selected family", "entire section"],
      generatedRequirements: entries.reduce((sum, entry) => sum + entry.assetReadiness.requirements.filter((requirement) => requirement.required && requirement.status === "missing").length, 0),
      duplicateSemanticKeys: [],
      lowConfidenceMappings: [],
      mutationRequired: false as const
    }
  };
  return {
    ...stateWithoutValidation,
    validation: validateEncyclopedia(stateWithoutValidation)
  };
}
