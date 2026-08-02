import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { civilizationAges, civilizationAlignmentScores } from "@/data/civilization-identity";
import { aiAgentSafePublishedDefaultArtKeys, defaultAiAgentId, defaultAiAgentVariantId, getAiAgentRuntimeModules } from "@/lib/ai-agents";
import { aiLibraryAssignmentRoles, aiLibraryCategories, aiLibraryPersonalities, aiLibraryRarities, aiLibraryVoices, canonicalAiLibraryAgents, validateCanonicalAiLibrary } from "@/lib/ai-agents/foundations";
import { canonicalActionSystem, validateActionSystem } from "@/lib/actions/action-system";
import { ARCHITECTURE_VERSION } from "@/lib/architecture/version";
import { getAssetProductionRuntimeOverrides } from "@/lib/assets/asset-production";
import { buildAssetProductionRuntimeManifest, validateAssetProductionRuntimeManifest } from "@/lib/assets/asset-production-system";
import { civilizationOperationsDeckContract, validateCivilizationOperationsDeckContract } from "@/lib/assets/civilization-operations-deck";
import { getAppliedGameArtAssets } from "@/lib/assets/game-art-import";
import { planetDetailScreenRuntimeContract, validatePlanetDetailScreenContract } from "@/lib/assets/planet-detail-screen";
import { buildBuildingClassifications, canonicalBuildingLibrary, canonicalBuildingTaxonomy } from "@/lib/buildings/taxonomy";
import { civilizationProgressionFramework, validateCivilizationProgressionFramework } from "@/lib/civilization/progression-framework";
import { colonizationFramework, validateColonizationFramework } from "@/lib/colonization/framework";
import { getGameData } from "@/lib/data";
import { canonicalDiscoveries, discoveryCategories, discoveryChains, discoveryCollections, discoveryMilestones, discoveryPlayerCollectionSchema, discoveryPurposeCategories, discoveryRarities, validateDiscoverySystem } from "@/lib/discovery";
import { universalDiscoveryRegistryContract, universalDiscoveryRegistryVersion, validateUniversalDiscoveryRegistryContract } from "@/lib/discovery/universal-registry";
import { laborGenerationFramework, validateLaborGenerationFramework } from "@/lib/economy/labor-generation";
import { resourceEconomyLogisticsFramework, validateResourceEconomyLogisticsFramework } from "@/lib/economy/logistics-framework";
import { dynamicEventFramework, validateDynamicEventFramework } from "@/lib/events/framework";
import { environmentComposerRuntimeContract, validateEnvironmentComposerContract } from "@/lib/environment-composer";
import {
  buildIdentityRelationshipGraphFromRuntime,
  toIdentityRelationshipRuntimeExport,
  validateIdentityRelationshipGraph,
  type IdentityRelationshipGraph,
  type IdentityRelationshipRuntimeExport
} from "@/lib/identity-relationships";
import { noverisDesignLanguage, validateDesignLanguage } from "@/lib/design-language";
import { noverisComponentLibrary, validateComponentLibrary } from "@/lib/component-library";
import { noverisScreenTemplateLibrary, validateScreenTemplateLibrary } from "@/lib/screen-template-library";
import { buildCreatureRuntimeData, validateCreatureSystem } from "@/lib/life/creature-system";
import { buildSpeciesPlateRuntimeData, validateSpeciesPlateRuntimeData } from "@/lib/species-plates/runtime";
import { missionExpeditionFramework, validateMissionExpeditionFramework } from "@/lib/missions/framework";
import {
  buildEconomyUsageRelationships,
  buildBuildingResourceEffects,
  buildEconomyBehaviorContracts,
  buildEconomyCalculationRules,
  buildEconomyRateBreakdownDefinitions,
  buildEconomyScopeRules,
  buildEraEconomyProfiles,
  buildInventoryResourceMetadata,
  buildOfflineProgressionPolicies,
  buildPrimaryHudSlots,
  buildResourceProducerDefinitions,
  buildEconomyTransactionReasons,
  canonicalEconomyDefinitions,
  isEconomyId,
  materialResourceIdsThatMustNotBeHud,
  primaryHudEconomyIds,
  resolveEconomyId
} from "@/lib/economy/definitions";
import { ResourceService } from "@/lib/resources/service";
import { RESOURCE_PRIMARY_CATEGORIES } from "@/lib/resources/taxonomy";
import { planetExplorationProgression, timeActionContract, validatePlanetExplorationProgression, validateTimeActionContract } from "@/lib/planets/exploration-progression";
import { planetDevelopmentFramework, validatePlanetDevelopmentFramework } from "@/lib/planets/development-framework";
import { canonicalPlanetOpportunityProfiles, validatePlanetOpportunityProfiles } from "@/lib/planets/opportunity-profiles";
import { planetDataScreenContract, planetDeepDataFramework } from "@/lib/planets/deep-data";
import { PLANET_DEEP_DATA_SCHEMA_VERSION } from "@/types/planet-deep-data";
import { populationSimulationFramework, validatePopulationSimulationFramework } from "@/lib/population/framework";
import { engineEraNavigationOverrides, resolveEraNavigationProfile, supportedEraNavigationBoundaryModes, supportedEraNavigationDashboardModes } from "@/lib/runtime/client-profiles";
import { galaxyEngineContractVersion, galaxyEnginePresentationContract, validateGalaxyEnginePresentationContract } from "@/lib/runtime/galaxy-engine-contract";
import { buildMobileClientProfile } from "@/lib/runtime/mobile-client-profiles";
import { categoryPresentationFor, validateUpgradeCategoryPresentation } from "@/lib/upgrades/category-presentation";
import { buildUpgradeTreeContract, upgradeTreeAlignmentIds, validateUpgradeTreeContract } from "@/lib/upgrades/tree-contract";
import type { GameData, ResourceCatalogItem, Upgrade } from "@/types/schema";
import type {
  AssetDefinition,
  BalanceDefinition,
  ClientProfile,
  ClientProfiles,
  EraDefinition,
  GameRuntimeData,
  ImportConflict,
  ImportIssue,
  ImportPreview,
  ImportResult,
  ResourceDefinition,
  RuntimeMetadata,
  UpgradeCategory,
  UpgradeDefinition,
  VisibilityRules
} from "@/types/runtime";

export const gameRuntimeSchemaVersion = "game-runtime-v1";
export const gameRuntimeContentVersion = 70;

export type CanonicalRuntimeExportPayload = Omit<GameRuntimeData, "identityRelationshipGraph"> & {
  identityRelationshipGraph?: IdentityRelationshipRuntimeExport;
};

export type RobloxRuntimeExportPayload = {
  metadata: RuntimeMetadata & { target: "roblox"; sourceSchemaVersion: string };
  eras: EraDefinition[];
  economyDefinitions: GameRuntimeData["economyDefinitions"];
  economyBehaviorContracts: GameRuntimeData["economyBehaviorContracts"];
  eraEconomyProfiles: GameRuntimeData["eraEconomyProfiles"];
  economyUsageRelationships: GameRuntimeData["economyUsageRelationships"];
  inventoryResourceMetadata: GameRuntimeData["inventoryResourceMetadata"];
  resourceProducerDefinitions: GameRuntimeData["resourceProducerDefinitions"];
  buildingResourceEffects: GameRuntimeData["buildingResourceEffects"];
  economyScopeRules: GameRuntimeData["economyScopeRules"];
  economyTransactionReasons: GameRuntimeData["economyTransactionReasons"];
  economyRateBreakdownDefinitions: GameRuntimeData["economyRateBreakdownDefinitions"];
  offlineProgressionPolicies: GameRuntimeData["offlineProgressionPolicies"];
  economyCalculationRules: GameRuntimeData["economyCalculationRules"];
  laborGenerationFramework: GameRuntimeData["laborGenerationFramework"];
  aiLibrary: GameRuntimeData["aiLibrary"];
  aiCategories: GameRuntimeData["aiCategories"];
  aiRarity: GameRuntimeData["aiRarity"];
  aiPersonalityCatalog: GameRuntimeData["aiPersonalityCatalog"];
  aiVoiceCatalog: GameRuntimeData["aiVoiceCatalog"];
  aiAssignmentRoles: GameRuntimeData["aiAssignmentRoles"];
  aiAgents: GameRuntimeData["aiAgents"];
  aiAgentVariants: GameRuntimeData["aiAgentVariants"];
  aiAgentPersonalities: GameRuntimeData["aiAgentPersonalities"];
  aiAgentAnimationProfiles: GameRuntimeData["aiAgentAnimationProfiles"];
  automationPresentation: GameRuntimeData["automationPresentation"];
  defaultAiAgentId: GameRuntimeData["defaultAiAgentId"];
  aiAgentSaveSchema: GameRuntimeData["aiAgentSaveSchema"];
  discoveryCategories: GameRuntimeData["discoveryCategories"];
  discoveryPurposeCategories: GameRuntimeData["discoveryPurposeCategories"];
  discoveryRarities: GameRuntimeData["discoveryRarities"];
  discoveries: GameRuntimeData["discoveries"];
  discoveryCollections: GameRuntimeData["discoveryCollections"];
  discoveryChains: GameRuntimeData["discoveryChains"];
  discoveryMilestones: GameRuntimeData["discoveryMilestones"];
  discoveryPlayerCollectionSchema: GameRuntimeData["discoveryPlayerCollectionSchema"];
  universalDiscoveryRegistry: GameRuntimeData["universalDiscoveryRegistry"];
  galaxyEngineContract: GameRuntimeData["galaxyEngineContract"];
  timeActionContract: GameRuntimeData["timeActionContract"];
  actionSystem: GameRuntimeData["actionSystem"];
  planetOpportunityProfiles: GameRuntimeData["planetOpportunityProfiles"];
  planetDeepDataFramework: GameRuntimeData["planetDeepDataFramework"];
  planetDataScreenContract: GameRuntimeData["planetDataScreenContract"];
  planetExplorationProgression: GameRuntimeData["planetExplorationProgression"];
  planetDevelopmentFramework: GameRuntimeData["planetDevelopmentFramework"];
  civilizationProgressionFramework: GameRuntimeData["civilizationProgressionFramework"];
  colonizationFramework: GameRuntimeData["colonizationFramework"];
  populationSimulationFramework: GameRuntimeData["populationSimulationFramework"];
  resourceEconomyLogisticsFramework: GameRuntimeData["resourceEconomyLogisticsFramework"];
  missionExpeditionFramework: GameRuntimeData["missionExpeditionFramework"];
  dynamicEventFramework: GameRuntimeData["dynamicEventFramework"];
  environmentComposerContract: GameRuntimeData["environmentComposerContract"];
  designLanguage: GameRuntimeData["designLanguage"];
  componentLibrary: GameRuntimeData["componentLibrary"];
  screenTemplateLibrary: GameRuntimeData["screenTemplateLibrary"];
  assetProductionRuntime: GameRuntimeData["assetProductionRuntime"];
  identityRelationshipGraph?: IdentityRelationshipRuntimeExport;
  speciesCategories: GameRuntimeData["speciesCategories"];
  speciesTaxonomyFrameworks: GameRuntimeData["speciesTaxonomyFrameworks"];
  species: GameRuntimeData["species"];
  speciesOccurrences: GameRuntimeData["speciesOccurrences"];
  speciesResourceYields: GameRuntimeData["speciesResourceYields"];
  creatureArtProfiles: GameRuntimeData["creatureArtProfiles"];
  creatureAnimationProfiles: GameRuntimeData["creatureAnimationProfiles"];
  creatureAudioProfiles: GameRuntimeData["creatureAudioProfiles"];
  creatureGeneratorContract: GameRuntimeData["creatureGeneratorContract"];
  creaturePromptOutputTypes: GameRuntimeData["creaturePromptOutputTypes"];
  creaturePromptLifecycleStages: GameRuntimeData["creaturePromptLifecycleStages"];
  creaturePromptBatchActions: GameRuntimeData["creaturePromptBatchActions"];
  creaturePromptModelProfiles: GameRuntimeData["creaturePromptModelProfiles"];
  creaturePromptTypeTemplates: GameRuntimeData["creaturePromptTypeTemplates"];
  speciesPlates: GameRuntimeData["speciesPlates"];
  planetDetailScreen: NonNullable<GameRuntimeData["planetDetailScreen"]>;
  civilizationOperationsDeck: NonNullable<GameRuntimeData["civilizationOperationsDeck"]>;
  resources: ResourceDefinition[];
  buildingTaxonomy: GameRuntimeData["buildingTaxonomy"];
  buildingLibrary: GameRuntimeData["buildingLibrary"];
  buildingClassifications: GameRuntimeData["buildingClassifications"];
  upgradeTabs: Array<UpgradeCategory & { tabId: string; label: string }>;
  upgrades: Array<UpgradeDefinition & { tabId: string }>;
  upgradeTree: GameRuntimeData["upgradeTree"];
  assets: Array<AssetDefinition & { robloxAssetId: string | null }>;
  balance: BalanceDefinition;
  clientHints: ClientProfile;
};

type ImportStore = {
  appliedRuntimeData: GameRuntimeData | null;
  history: ImportResult[];
};

type ImportSourceType = ImportPreview["sourceType"];

export type RuntimeImportRequest = {
  sourceType?: ImportSourceType;
  source?: string;
  importedFrom?: string;
  sourceProject?: string;
  sourceFormat?: string;
  environment?: string;
  payload?: unknown;
};

const importStorePath = process.env.PROJECT_GENESIS_RUNTIME_IMPORT_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_RUNTIME_IMPORT_STORE)
  : path.join(process.cwd(), "data", "game-runtime-imports.local.json");

const canonicalEraDefinitions = [
  { id: "survival", name: "survival", displayName: "Survival", shortDisplayName: "Survival" },
  { id: "ancient", name: "ancient", displayName: "Ancient", shortDisplayName: "Ancient" },
  { id: "medieval", name: "medieval", displayName: "Medieval", shortDisplayName: "Medieval" },
  { id: "renaissance", name: "renaissance", displayName: "Renaissance", shortDisplayName: "Renaissance" },
  { id: "industrial", name: "industrial", displayName: "Industrial", shortDisplayName: "Industrial" },
  { id: "modern", name: "modern", displayName: "Modern", shortDisplayName: "Modern" },
  { id: "space-age", name: "space-age", displayName: "Space Age", shortDisplayName: "Space" },
  { id: "interstellar", name: "interstellar", displayName: "Interstellar", shortDisplayName: "Interstellar" },
  { id: "galactic", name: "galactic", displayName: "Galactic", shortDisplayName: "Galactic" }
] as const;
const requiredEraNames = canonicalEraDefinitions.map((era) => era.displayName);
const requiredCategoryIds = ["workforce", "industry", "science", "technology"];
const legacyEraAliases = new Map<string, string>([
  ["survival", "survival"],
  ["village", "ancient"],
  ["town", "medieval"],
  ["renaissance", "renaissance"],
  ["industrial", "industrial"],
  ["industrial-empire", "industrial"],
  ["modern", "modern"],
  ["metropolis-prime", "modern"],
  ["future-core", "space-age"],
  ["cyberpunk-megacity", "interstellar"],
  ["high-tech-singularity", "interstellar"],
  ["eco-green-utopia", "galactic"],
  ["harmony-ascendant", "galactic"]
]);

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripAge(value: string) {
  return value.replace(/\s+age$/i, "").trim();
}

function display(value: unknown, fallback = "Untitled") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: unknown) {
  return asArray(value).map((item) => String(item)).filter(Boolean);
}

function asNumber(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function eraId(value: string) {
  const base = stripAge(value);
  if (/^space$/i.test(base)) return "space-age";
  return slug(base);
}

function eraIdFor(value: unknown) {
  const text = display(value, "Survival");
  const normalized = slug(text).replace(/^era-/, "");
  const canonicalCandidate = normalized.endsWith("-age") && normalized !== "space-age" ? normalized.replace(/-age$/, "") : normalized;
  const aliased = legacyEraAliases.get(canonicalCandidate);
  if (aliased) return aliased;
  const known = requiredEraNames.find((name) => slug(name) === canonicalCandidate || slug(stripAge(name)) === canonicalCandidate || slug(`${stripAge(name)} Age`) === canonicalCandidate);
  return known ? eraId(known) : eraId(text);
}

function resourceClass(resource: ResourceCatalogItem) {
  const category = resource.category.toLowerCase();
  if (/gas|chemical|compound|volatile|organic/.test(category)) return "Compound";
  if (/energy|exotic|ancient|data/.test(category)) return "Special";
  if (/metal|mineral|crystal|ice|planetary/.test(category)) return "Material";
  return "Material";
}

function eraForResource(resource: ResourceCatalogItem) {
  const tier = resource.discovery_tier.toLowerCase();
  if (tier.includes("earth")) return "survival";
  if (tier.includes("planet")) return "modern";
  if (tier.includes("space")) return "space-age";
  if (tier.includes("interstellar") || tier.includes("deep")) return "interstellar";
  if (tier.includes("galactic") || tier.includes("genesis")) return "galactic";
  return "survival";
}

function resourceToRuntime(resource: ResourceCatalogItem): ResourceDefinition {
  const discoveredEraId = eraForResource(resource);
  return {
    id: resource.id,
    name: resource.resource_name,
    displayName: resource.resource_name,
    resourceClass: resourceClass(resource),
    category: resource.category,
    rarity: resource.rarity,
    iconKey: `resource-${slug(resource.resource_name)}`,
    artKey: `resource-${slug(resource.resource_name)}`,
    color: resource.rarity_color,
    description: resource.description,
    discoveredEraId,
    usableEraId: discoveredEraId,
    tradable: Number(resource.base_trade_value) > 0,
    tags: [...new Set([...(resource.tags ?? []), resource.category, resource.rarity, resource.discovery_tier, ...resource.primary_uses, ...resource.typical_planet_classes].filter(Boolean))],
    resourceType: resource.resource_type,
    primaryCategory: resource.primary_category,
    subcategory: resource.subcategory,
    secondaryCategories: resource.secondary_categories,
    recipeIds: [...(resource.recipe_ids ?? [])],
    producedByIds: [...(resource.produced_by_ids ?? [])],
    consumedByIds: [...(resource.consumed_by_ids ?? [])],
    harvestedFromDiscoveryIds: canonicalDiscoveries.filter((discovery) => discovery.harvestedResourceIds?.includes(resource.id)).map((discovery) => discovery.id),
    element: resource.element ? { ...resource.element } : undefined,
    availability: {
      earthAvailable: resource.earth_available,
      naturalOccurrence: resource.natural_occurrence,
      minimumPlanetRarity: resource.minimum_planet_rarity,
      minimumResearchTier: resource.minimum_research_tier,
      extractionMethod: resource.extraction_method,
      requiredTechnology: resource.required_technology,
      resourceProfileEligible: resource.resource_profile_eligible
    }
  };
}

function defaultEras(): EraDefinition[] {
  return canonicalEraDefinitions.map((definition, index) => {
    const age = civilizationAges.find((item) => stripAge(item.name) === stripAge(definition.displayName));
    return {
      id: definition.id,
      index: index + 1,
      name: definition.name,
      displayName: definition.displayName,
      shortDisplayName: definition.shortDisplayName,
      description: age?.description ?? `${definition.displayName} progression era.`,
      unlockRequirements: index === 0 ? { start: true } : { previousEraId: canonicalEraDefinitions[index - 1].id },
      iconKey: `era-${definition.id}`,
      artKey: `era-${definition.id}`,
      themeKey: `theme-${definition.id}`,
      masteryRequirements: {},
      completionPercent: index === 0 ? 100 : index === 1 ? 72 : index === 2 ? 38 : 0,
      researchProgress: index <= 2 ? Math.max(15, 100 - index * 28) : 0,
      buildingProgress: index <= 2 ? Math.max(10, 100 - index * 32) : 0,
      missingArtwork: true,
      tags: ["canonical", "runtime"]
    };
  });
}

export function getCanonicalRuntimeEras(): EraDefinition[] {
  return defaultEras();
}

function defaultCategories(): UpgradeCategory[] {
  return [
    ["workforce", "Workforce", "Population, labor, carrying capacity, and manual productivity."],
    ["industry", "Industry", "Materials, manufacturing, production chains, and infrastructure."],
    ["science", "Science", "Research output, discovery speed, and analysis capability."],
    ["technology", "Technology", "Automation, tools, unlock speed, and advanced systems."]
  ].map(([id, displayName, description], index) => ({
    id,
    displayName,
    description,
    order: index + 1,
    unlockedAtGameStart: index === 0,
    unlockRequirements: index === 0 ? { start: true } : {},
    iconKey: `upgrade-category-${id}`,
    themeKey: `theme-${id}`,
    presentation: categoryPresentationFor(id)
  }));
}

function defaultProfile(overrides: Partial<ClientProfile> = {}): ClientProfile {
  const primaryHudSlots = buildPrimaryHudSlots();
  return {
    defaultUpgradeRowsVisible: 4,
    futureUpgradeTeaserCount: 2,
    showUnknownUpgradeSlots: true,
    lockedOpacity: 0.45,
    availableGlowEnabled: true,
    primaryHudResources: [...primaryHudEconomyIds],
    primaryHudSlots,
    eraNavigation: resolveEraNavigationProfile(),
    ...overrides
  };
}

function defaultClientProfiles(): ClientProfiles {
  const defaultClientProfile = defaultProfile();
  const webProfile = defaultProfile({ defaultUpgradeRowsVisible: 6, futureUpgradeTeaserCount: 3, lockedOpacity: 0.55, eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.web) });
  return {
    default: defaultClientProfile,
    roblox: defaultProfile({ eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.roblox) }),
    web: webProfile,
    unity: defaultProfile({ defaultUpgradeRowsVisible: 5, eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.unity) }),
    unreal: defaultProfile({ defaultUpgradeRowsVisible: 5, eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.unreal) }),
    godot: defaultProfile({ defaultUpgradeRowsVisible: 5, eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.godot) }),
    ios: buildMobileClientProfile("ios", webProfile),
    android: buildMobileClientProfile("android", webProfile)
  };
}

function parseEffectValue(value: unknown) {
  if (typeof value === "number") return value;
  const match = String(value ?? "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function resolveResourceId(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text || text === "None" || text === "-") return null;
  if (resolveEconomyId(text)) return null;
  return ResourceService.resolveId(text);
}

function visibilityRulesFor(eraIdValue: string, order: number): VisibilityRules {
  return {
    defaultState: order <= 1 ? "available" : "locked_discovered",
    revealRequirements: {},
    availableRequirements: { eraId: eraIdValue },
    hideUntilEraId: order > 6 ? eraIdValue : null,
    showTeaser: order > 1,
    teaserOrder: order
  };
}

function upgradeCategoryId(value: unknown) {
  const id = slug(display(value, "technology"));
  if (id.includes("labor") || id.includes("work")) return "workforce";
  if (id.includes("industry") || id.includes("production") || id.includes("build")) return "industry";
  if (id.includes("science") || id.includes("research")) return "science";
  if (id.includes("tech") || id.includes("tool")) return "technology";
  return id || "technology";
}

function upgradeToRuntime(upgrade: Upgrade, index: number): UpgradeDefinition {
  const categoryId = upgradeCategoryId(upgrade.type);
  const era = eraIdFor(upgrade.era);
  const costEconomyId = resolveEconomyId(upgrade.cost_resource);
  return {
    id: upgrade.id,
    categoryId,
    eraId: era,
    chainId: slug(upgrade.tier || upgrade.name || upgrade.id) || upgrade.id,
    order: index + 1,
    name: upgrade.name,
    displayName: upgrade.name,
    description: upgrade.description,
    iconKey: upgrade.icon_name || `upgrade-${slug(upgrade.name)}`,
    defaultLevel: 0,
    maxLevel: Math.max(1, Number(upgrade.max_level) || 1),
    baseCost: Math.max(0, Number(upgrade.base_cost) || 0),
    costResourceId: resolveResourceId(upgrade.cost_resource),
    costEconomyId,
    costGrowthRate: Math.max(1, Number(upgrade.cost_multiplier) || 1),
    effectType: upgrade.bonus_type || "modifier",
    baseEffectValue: parseEffectValue(upgrade.bonus_value),
    effectGrowthRate: 1,
    unlockRequirements: Number(upgrade.unlock_level) > 0 ? { civilizationLevel: upgrade.unlock_level } : { start: true },
    nextUpgradeIds: [],
    visibilityRules: visibilityRulesFor(era, index + 1),
    tags: [...new Set([upgrade.type, upgrade.civilization, upgrade.era, upgrade.tier].filter(Boolean))]
  };
}

function assetToRuntime(asset: GameData["assets"][number]): AssetDefinition {
  const webPath = asset.file_url || "";
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type || "image",
    category: asset.category,
    artKey: slug(asset.name || asset.id),
    width: null,
    height: null,
    aspectRatio: null,
    status: asset.status || asset.export_status || "draft",
    notes: asset.notes || "",
    platformMappings: {
      ...(webPath ? { web: { path: webPath } } : {}),
      ...(asset.roblox_asset_id ? { roblox: { assetId: asset.roblox_asset_id } } : {})
    }
  };
}

function gameConstantsBalance(constants: GameData["game_constants"]): BalanceDefinition {
  const byKey = new Map(constants.map((row) => [slug(row.constant), row.value]));
  const economyById = new Map(canonicalEconomyDefinitions.map((definition) => [definition.id, definition]));
  const populationDefault = economyById.get("ECON-POPULATION")?.startingAmount ?? 5;
  return {
    version: "balance-v1",
    startingCivilizationEnergy: asNumber(byKey.get("starting-civilization-energy"), economyById.get("ECON-CIVILIZATION-ENERGY")?.startingAmount ?? 0),
    startingCoins: asNumber(byKey.get("starting-coins"), economyById.get("ECON-CREDITS")?.startingAmount ?? 0),
    startingResearch: asNumber(byKey.get("starting-research"), economyById.get("ECON-RESEARCH")?.startingAmount ?? 0),
    startingPopulation: asNumber(byKey.get("starting-population"), populationDefault),
    baseClickPower: asNumber(byKey.get("base-click-power"), 1),
    baseAutoClickPower: asNumber(byKey.get("base-auto-click-power"), 0),
    autosaveSeconds: asNumber(byKey.get("autosave-seconds"), 30),
    notes: "Canonical runtime balance derived from Studio game_constants with safe defaults.",
    environmentOverrides: {},
    difficultyProfileOverrides: {}
  };
}

function metadata(overrides: Partial<RuntimeMetadata> = {}): RuntimeMetadata {
  return {
    schemaVersion: gameRuntimeSchemaVersion,
    architectureVersion: ARCHITECTURE_VERSION,
    universalDiscoveryRegistryVersion,
    galaxyEngineContractVersion,
    contentVersion: gameRuntimeContentVersion,
    checksum: "",
    accessLevel: "studio-internal",
    importedAt: "2026-07-12T00:00:00.000Z",
    importedFrom: "existing_project_migration",
    sourceProject: "Project Genesis Studio",
    sourceFormat: "studio",
    environment: "development",
    validationStatus: "Ready",
    saveMigrationHints: [
      {
        id: "migration_population_default_125_to_5",
        targetId: "ECON-POPULATION",
        field: "startingAmount",
        previousDefault: 125,
        currentDefault: 5,
        applyOnlyWhen: "A save has no activity/progression markers and Population exactly equals the old untouched starter default of 125.",
        preserveRule: "Preserve Population 125 or higher when the save has earned resources, completed research, built structures, manual changes, or any other sign of established play.",
        introducedContentVersion: 8,
        notes: "Population is citizen/workforce capacity, not a spendable manual-click currency. Clients should not silently reset established saves."
      },
      {
        id: "migration_selected_ai_agent_default",
        targetId: defaultAiAgentId,
        field: "selectedAiAgentId",
        previousDefault: null,
        currentDefault: defaultAiAgentId,
        applyOnlyWhen: "A save does not contain selectedAiAgentId.",
        preserveRule: "If a save contains an unknown selectedAiAgentId, clients should render the default AI Agent while preserving the unresolved value for diagnostics.",
        introducedContentVersion: 12,
        notes: "AI Agent is a cosmetic/presentation companion layer over the existing automation system."
      },
      {
        id: "migration_selected_ai_agent_variant_default",
        targetId: defaultAiAgentVariantId,
        field: "selectedAiAgentVariantId",
        previousDefault: null,
        currentDefault: defaultAiAgentVariantId,
        applyOnlyWhen: "A save does not contain selectedAiAgentVariantId.",
        preserveRule: "If a save contains an unknown selectedAiAgentVariantId, clients should render the default variant while preserving the unresolved value for diagnostics.",
        introducedContentVersion: 13,
        notes: "AI Agent variant selection is cosmetic only. Automation upgrade levels remain the source of Labor Assistance strength."
      },
      {
        id: "migration_ai_library_pack_a_schema_1_2",
        targetId: "ai-library-pack-a",
        field: "selectedAiAgentId",
        previousDefault: "ai-library-1.1.0",
        currentDefault: "ai_id_migrations.json",
        applyOnlyWhen: "A save or authored reference contains an AI ID from Volumes 1 through 5 using the schema 1.1.0 catalog.",
        preserveRule: "Resolve the former ID through the exported migration map by matching its canonical volume and library index; preserve unknown IDs for diagnostics.",
        introducedContentVersion: 42,
        notes: "Pack A schema 1.2.0 rebuilds Volumes 1 through 5. The migration map prevents existing AI selections and references from being silently discarded."
      },
      {
        id: "migration_ai_library_pack_b_schema_1_2",
        targetId: "ai-library-pack-b",
        field: "selectedAiAgentId",
        previousDefault: "ai-library-1.1.0",
        currentDefault: "ai_id_migrations.json",
        applyOnlyWhen: "A save or authored reference contains an AI ID from Volumes 6 through 10 using the schema 1.1.0 catalog.",
        preserveRule: "Resolve the former ID through the exported migration map by matching its canonical volume and library index; preserve unknown IDs for diagnostics.",
        introducedContentVersion: 43,
        notes: "Pack B schema 1.2.0 rebuilds Volumes 6 through 10. The shared migration export covers all legacy Pack A and B IDs."
      },
      {
        id: "migration_ai_library_schema_2_0_expansion",
        targetId: "ai-library-packs-c-d",
        field: "aiLibrary",
        previousDefault: "ai-library-1.2.0",
        currentDefault: "ai-library-2.0.0",
        applyOnlyWhen: "A client loads contentVersion 44 or later and does not yet contain AI Library Volumes 11 through 20.",
        preserveRule: "Preserve all owned and selected Pack A/B AI IDs. Add Packs C/D as unowned collectible definitions without changing the active companion.",
        introducedContentVersion: 44,
        notes: "AI Library v2 expands the canonical collection to 2,000 companions across 20 volumes while preserving the one-active-AI rule."
      },
      {
        id: "migration_ai_library_volume_11_authored",
        targetId: "ai-volume-11-terraforming-initiative",
        field: "aiLibrary",
        previousDefault: "generated-volume-11-slots-1-20",
        currentDefault: "authored-volume-11-slots-1-20",
        applyOnlyWhen: "A client loads contentVersion 45 or later.",
        preserveRule: "Keep the published ai_v11 stable IDs. Resolve supplied AI-XI-001 through AI-XI-020 IDs as aliases and preserve player ownership or selection.",
        introducedContentVersion: 45,
        notes: "The first twenty Terraforming Initiative companions now use the authored Volume XI identities."
      },
      {
        id: "migration_ai_library_volume_11_authored_part_2",
        targetId: "ai-volume-11-terraforming-initiative",
        field: "aiLibrary",
        previousDefault: "generated-volume-11-slots-21-40",
        currentDefault: "authored-volume-11-slots-21-40",
        applyOnlyWhen: "A client loads contentVersion 46 or later.",
        preserveRule: "Keep the published ai_v11 stable IDs. Resolve supplied AI-XI-021 through AI-XI-040 IDs as aliases and preserve player ownership or selection.",
        introducedContentVersion: 46,
        notes: "The second twenty Terraforming Initiative companions now use the authored Volume XI identities."
      },
      {
        id: "migration_ai_library_volume_11_authored_part_3",
        targetId: "ai-volume-11-terraforming-initiative",
        field: "aiLibrary",
        previousDefault: "generated-volume-11-slots-41-60",
        currentDefault: "authored-volume-11-slots-41-60",
        applyOnlyWhen: "A client loads contentVersion 47 or later.",
        preserveRule: "Keep the published ai_v11 stable IDs. Resolve supplied AI-XI-041 through AI-XI-060 IDs as aliases and preserve player ownership or selection.",
        introducedContentVersion: 47,
        notes: "The third twenty Terraforming Initiative companions now use the authored Volume XI identities."
      },
      {
        id: "migration_ai_library_volume_11_authored_part_4",
        targetId: "ai-volume-11-terraforming-initiative",
        field: "aiLibrary",
        previousDefault: "generated-volume-11-slots-61-80",
        currentDefault: "authored-volume-11-slots-61-80",
        applyOnlyWhen: "A client loads contentVersion 48 or later.",
        preserveRule: "Keep the published ai_v11 stable IDs. Resolve supplied AI-XI-061 through AI-XI-080 IDs as aliases and preserve player ownership or selection.",
        introducedContentVersion: 48,
        notes: "The fourth twenty Terraforming Initiative companions now use the authored Volume XI identities."
      },
      {
        id: "migration_ai_library_volume_11_authored_part_5",
        targetId: "ai-volume-11-terraforming-initiative",
        field: "aiLibrary",
        previousDefault: "generated-volume-11-slots-81-100",
        currentDefault: "authored-volume-11-slots-81-100",
        applyOnlyWhen: "A client loads contentVersion 49 or later.",
        preserveRule: "Keep the published ai_v11 stable IDs. Resolve supplied AI-XI-081 through AI-XI-100 IDs as aliases and preserve player ownership or selection.",
        introducedContentVersion: 49,
        notes: "The final twenty Terraforming Initiative companions complete the authored Volume XI collection."
      },
      {
        id: "migration_ai_library_volume_12_authored_part_1",
        targetId: "ai-volume-12-education-knowledge",
        field: "aiLibrary",
        previousDefault: "generated-volume-12-slots-1-20",
        currentDefault: "authored-volume-12-slots-1-20",
        applyOnlyWhen: "A client loads contentVersion 50 or later.",
        preserveRule: "Keep the published ai_v12 stable IDs. Resolve supplied AI-XII-001 through AI-XII-020 IDs as aliases and preserve player ownership or selection.",
        introducedContentVersion: 50,
        notes: "The first twenty Education & Knowledge companions now use the authored Volume XII identities."
      },
      {
        id: "migration_procedural_visual_signature_v1",
        targetId: "procedural_universe_visual_contract",
        field: "visual_signature",
        previousDefault: null,
        currentDefault: "visual-signature-v1",
        applyOnlyWhen: "A client loads contentVersion 51 or later and a canonical universe object does not yet have a visual signature.",
        preserveRule: "Preserve every canonical universe, galaxy, sector, and star-system ID. Derive visual identity on demand from the existing universe seed, generation version, semantic level, and canonical object ID.",
        introducedContentVersion: 51,
        notes: "Visual signature migration changes presentation metadata only. It must never regenerate topology or materialize the full universe."
      },
      {
        id: "migration_star_system_background_contract_v1",
        targetId: "star_system_backgrounds",
        field: "galaxyEngineContract.starSystemBackgrounds",
        previousDefault: null,
        currentDefault: "star-system-background-contract-v1",
        applyOnlyWhen: "A client loads contentVersion 52 or later and supports Studio-authored star-system background derivatives.",
        preserveRule: "Preserve star-system IDs and runtime visual signatures. Use published background derivatives when present; otherwise fall back to deterministic procedural atlas rendering.",
        introducedContentVersion: 52,
        notes: "PSD sources remain private Studio authoring files and are never consumed by game clients."
      },
      {
        id: "migration_sol_system_reference_data_v1",
        targetId: "sol-system",
        field: "planets.deepPlanetData",
        previousDefault: "deterministic-generic-sol-profiles",
        currentDefault: "sol-system-reference-v1",
        applyOnlyWhen: "A client loads contentVersion 56 or later and consumes canonical Sol body data.",
        preserveRule: "Preserve all existing Sol body IDs, parent links, discovery attribution, authored history, and player state. Replace only unlocked generated scientific fields with source-backed canonical overrides.",
        introducedContentVersion: 56,
        notes: "Adds the five recognized dwarf planets, source metadata, completeness, knowledge modes, active-environment rules, and locked scientific overrides without creating parallel Planet Types or Resources."
      }
    ],
    ...overrides
  };
}

function relationshipMap(runtimeData: GameRuntimeData) {
  const upgradesByCategory: Record<string, string[]> = {};
  const upgradesByEra: Record<string, string[]> = {};
  const nextUpgradesByUpgrade: Record<string, string[]> = {};
  const assetsByKey: Record<string, string> = {};

  for (const upgrade of runtimeData.upgrades) {
    upgradesByCategory[upgrade.categoryId] = [...(upgradesByCategory[upgrade.categoryId] ?? []), upgrade.id];
    upgradesByEra[upgrade.eraId] = [...(upgradesByEra[upgrade.eraId] ?? []), upgrade.id];
    nextUpgradesByUpgrade[upgrade.id] = upgrade.nextUpgradeIds;
  }

  for (const asset of runtimeData.assets) {
    assetsByKey[asset.artKey] = asset.id;
  }

  return { upgradesByCategory, upgradesByEra, nextUpgradesByUpgrade, assetsByKey };
}

function duplicateIds<T extends { id: string }>(rows: T[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.id)) duplicates.add(row.id);
    seen.add(row.id);
  }
  return [...duplicates];
}

function duplicateNumbers(rows: number[]) {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  for (const row of rows) {
    if (seen.has(row)) duplicates.add(row);
    seen.add(row);
  }
  return [...duplicates];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function byId<T extends { id: string }>(left: T, right: T) {
  return left.id.localeCompare(right.id);
}

function byOrderThenId<T extends { id: string; order?: number; index?: number }>(left: T, right: T) {
  return (left.order ?? left.index ?? 0) - (right.order ?? right.index ?? 0) || left.id.localeCompare(right.id);
}

function byDisplayOrderThenId<T extends { id: string; displayOrder: number }>(left: T, right: T) {
  return left.displayOrder - right.displayOrder || left.id.localeCompare(right.id);
}

function sortRuntimeData(runtimeData: GameRuntimeData): GameRuntimeData {
  return {
    ...runtimeData,
    identityRelationshipGraph: runtimeData.identityRelationshipGraph
      ? {
          ...runtimeData.identityRelationshipGraph,
          records: [...runtimeData.identityRelationshipGraph.records].sort((left, right) => left.canonicalId.localeCompare(right.canonicalId)),
          relationships: [...runtimeData.identityRelationshipGraph.relationships].sort((left, right) => left.id.localeCompare(right.id)),
          validation: {
            ...runtimeData.identityRelationshipGraph.validation,
            issues: [...runtimeData.identityRelationshipGraph.validation.issues].sort((left, right) => `${left.code}:${left.records.join(":")}`.localeCompare(`${right.code}:${right.records.join(":")}`))
          }
        }
      : undefined,
    eras: [...runtimeData.eras].sort(byOrderThenId),
    economyDefinitions: [...runtimeData.economyDefinitions].sort(byId),
    economyBehaviorContracts: [...runtimeData.economyBehaviorContracts].sort(byId),
    eraEconomyProfiles: [...runtimeData.eraEconomyProfiles]
      .map((profile) => ({
        ...profile,
        primaryEconomyId: profile.primaryEconomyId ?? profile.activePrimaryEconomyId ?? profile.primaryEconomyIds[0]
      }))
      .sort((left, right) => left.eraIndex - right.eraIndex || left.eraId.localeCompare(right.eraId)),
    inventoryResourceMetadata: [...runtimeData.inventoryResourceMetadata].sort(byId),
    resourceProducerDefinitions: [...runtimeData.resourceProducerDefinitions].sort(byId),
    buildingResourceEffects: [...runtimeData.buildingResourceEffects].sort(byId),
    economyScopeRules: [...runtimeData.economyScopeRules].sort(byId),
    economyTransactionReasons: [...runtimeData.economyTransactionReasons].sort(byId),
    economyRateBreakdownDefinitions: [...runtimeData.economyRateBreakdownDefinitions].sort(byId),
    offlineProgressionPolicies: [...runtimeData.offlineProgressionPolicies].sort(byId),
    laborGenerationFramework: runtimeData.laborGenerationFramework,
    aiLibrary: [...runtimeData.aiLibrary].sort((left, right) => left.ai_id.localeCompare(right.ai_id)),
    aiCategories: [...runtimeData.aiCategories].sort(byId),
    aiRarity: [...runtimeData.aiRarity].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id)),
    aiPersonalityCatalog: [...runtimeData.aiPersonalityCatalog].sort(),
    aiVoiceCatalog: [...runtimeData.aiVoiceCatalog].sort(),
    aiAssignmentRoles: [...runtimeData.aiAssignmentRoles].sort(),
    aiAgents: [...runtimeData.aiAgents].sort(byId),
    aiAgentVariants: [...runtimeData.aiAgentVariants].sort(byId),
    aiAgentPersonalities: [...runtimeData.aiAgentPersonalities].sort(byId),
    aiAgentAnimationProfiles: [...runtimeData.aiAgentAnimationProfiles].sort(byId),
    discoveryCategories: [...runtimeData.discoveryCategories].sort(byDisplayOrderThenId).map((category) => ({
      ...category,
      subcategories: [...category.subcategories].sort(byDisplayOrderThenId)
    })),
    discoveryPurposeCategories: [...runtimeData.discoveryPurposeCategories].sort(byDisplayOrderThenId),
    discoveryRarities: [...runtimeData.discoveryRarities].sort(byDisplayOrderThenId),
    discoveries: [...runtimeData.discoveries].sort(byId),
    discoveryCollections: [...runtimeData.discoveryCollections].sort(byId),
    discoveryChains: [...runtimeData.discoveryChains].sort(byId).map((chain) => ({ ...chain, nodes: [...chain.nodes].sort((left, right) => left.order - right.order || left.discoveryId.localeCompare(right.discoveryId)) })),
    discoveryMilestones: [...runtimeData.discoveryMilestones].sort((left, right) => String(left.id).localeCompare(String(right.id))),
    universalDiscoveryRegistry: runtimeData.universalDiscoveryRegistry,
    galaxyEngineContract: {
      ...runtimeData.galaxyEngineContract,
      semanticZoom: [...runtimeData.galaxyEngineContract.semanticZoom].sort(byId),
      technologyGates: [...runtimeData.galaxyEngineContract.technologyGates].sort(byId),
      knowledgeVisibility: [...runtimeData.galaxyEngineContract.knowledgeVisibility].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id)),
      presentationClasses: [...runtimeData.galaxyEngineContract.presentationClasses].sort(byId),
      platformRenderingProfiles: [...runtimeData.galaxyEngineContract.platformRenderingProfiles].sort(byId),
      assetRoles: [...runtimeData.galaxyEngineContract.assetRoles].sort(byId),
      proceduralFallbackRules: [...runtimeData.galaxyEngineContract.proceduralFallbackRules].sort(byId),
      starSystemBackgrounds: [...runtimeData.galaxyEngineContract.starSystemBackgrounds].sort((left, right) => left.assetId.localeCompare(right.assetId)),
      starSystemVisualProfiles: [...runtimeData.galaxyEngineContract.starSystemVisualProfiles].sort((left, right) => left.systemId.localeCompare(right.systemId))
    },
    environmentComposerContract: {
      ...runtimeData.environmentComposerContract,
      environmentTypes: [...runtimeData.environmentComposerContract.environmentTypes].sort(byId),
      layerAssets: [...runtimeData.environmentComposerContract.layerAssets].sort(byId),
      themes: [...runtimeData.environmentComposerContract.themes].sort(byId).map((theme) => ({
        ...theme,
        allowedAssetIds: [...theme.allowedAssetIds].sort()
      })),
      profiles: [...runtimeData.environmentComposerContract.profiles].sort(byId).map((profile) => ({
        ...profile,
        layers: [...profile.layers].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
      }))
    },
    planetDetailScreen: runtimeData.planetDetailScreen,
    civilizationOperationsDeck: runtimeData.civilizationOperationsDeck,
    timeActionContract: {
      ...runtimeData.timeActionContract,
      stateMachine: [...runtimeData.timeActionContract.stateMachine],
      futureSystemScopes: [...runtimeData.timeActionContract.futureSystemScopes].sort(),
      validationRules: [...runtimeData.timeActionContract.validationRules].sort(),
      accelerationPolicy: {
        ...runtimeData.timeActionContract.accelerationPolicy,
        premiumCrystals: {
          ...runtimeData.timeActionContract.accelerationPolicy.premiumCrystals,
          allowedUses: [...runtimeData.timeActionContract.accelerationPolicy.premiumCrystals.allowedUses].sort()
        },
        researchModifierIds: [...runtimeData.timeActionContract.accelerationPolicy.researchModifierIds].sort(),
        upgradeModifierIds: [...runtimeData.timeActionContract.accelerationPolicy.upgradeModifierIds].sort(),
        aiAgentModifierIds: [...runtimeData.timeActionContract.accelerationPolicy.aiAgentModifierIds].sort(),
        buildingModifierIds: [...runtimeData.timeActionContract.accelerationPolicy.buildingModifierIds].sort(),
        civilizationModifierIds: [...runtimeData.timeActionContract.accelerationPolicy.civilizationModifierIds].sort(),
        automationModifierIds: [...runtimeData.timeActionContract.accelerationPolicy.automationModifierIds].sort()
      }
    },
    actionSystem: {
      ...runtimeData.actionSystem,
      actionCategories: [...runtimeData.actionSystem.actionCategories].sort(byDisplayOrderThenId),
      actionStates: [...runtimeData.actionSystem.actionStates],
      actionDefinitions: [...runtimeData.actionSystem.actionDefinitions].sort(byId),
      actionQueueRules: [...runtimeData.actionSystem.actionQueueRules].sort(byId),
      actionDurationDefinitions: [...runtimeData.actionSystem.actionDurationDefinitions].sort(byId),
      actionPhaseTemplates: [...runtimeData.actionSystem.actionPhaseTemplates].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id)),
      actionAccelerationPolicies: [...runtimeData.actionSystem.actionAccelerationPolicies].sort(byId),
      actionAutomationPolicies: [...runtimeData.actionSystem.actionAutomationPolicies].sort(byId),
      actionFailureCauses: [...runtimeData.actionSystem.actionFailureCauses].sort(byId),
      actionEventDefinitions: [...runtimeData.actionSystem.actionEventDefinitions].sort(byId),
      actionPresentationContracts: [...runtimeData.actionSystem.actionPresentationContracts].sort(byId),
      accelerationRules: [...runtimeData.actionSystem.accelerationRules].sort(),
      automationRules: [...runtimeData.actionSystem.automationRules].sort(),
      actionPresentation: [...runtimeData.actionSystem.actionPresentation].sort((left, right) => left.mode.localeCompare(right.mode)),
      validationRules: [...runtimeData.actionSystem.validationRules].sort()
    },
    planetOpportunityProfiles: [...runtimeData.planetOpportunityProfiles].sort(byId),
    planetDeepDataFramework: {
      ...runtimeData.planetDeepDataFramework,
      planetTypeProfiles: [...runtimeData.planetDeepDataFramework.planetTypeProfiles].sort((left, right) => left.canonicalId.localeCompare(right.canonicalId)),
      resourceDistributionProfiles: [...runtimeData.planetDeepDataFramework.resourceDistributionProfiles].sort((left, right) => left.profileId.localeCompare(right.profileId)),
      atmosphereProfiles: [...runtimeData.planetDeepDataFramework.atmosphereProfiles].sort(byId),
      climateProfiles: [...runtimeData.planetDeepDataFramework.climateProfiles].sort(byId),
      weatherProfiles: [...runtimeData.planetDeepDataFramework.weatherProfiles].sort(byId),
      seasonProfiles: [...runtimeData.planetDeepDataFramework.seasonProfiles].sort(byId),
      biomeProfiles: [...runtimeData.planetDeepDataFramework.biomeProfiles].sort(byId),
      geologyProfiles: [...runtimeData.planetDeepDataFramework.geologyProfiles].sort(byId),
      hydrosphereProfiles: [...runtimeData.planetDeepDataFramework.hydrosphereProfiles].sort(byId),
      hazardProfiles: [...runtimeData.planetDeepDataFramework.hazardProfiles].sort(byId),
      discoveryStates: [...runtimeData.planetDeepDataFramework.discoveryStates],
      validationRules: [...runtimeData.planetDeepDataFramework.validationRules],
      dataScreenContract: {
        ...runtimeData.planetDeepDataFramework.dataScreenContract,
        sections: [...runtimeData.planetDeepDataFramework.dataScreenContract.sections].sort((left, right) => left.sortOrder - right.sortOrder || left.sectionId.localeCompare(right.sectionId))
      }
    },
    planetDataScreenContract: {
      ...runtimeData.planetDataScreenContract,
      sections: [...runtimeData.planetDataScreenContract.sections].sort((left, right) => left.sortOrder - right.sortOrder || left.sectionId.localeCompare(right.sectionId))
    },
    planetExplorationProgression: {
      ...runtimeData.planetExplorationProgression,
      pipeline: [...runtimeData.planetExplorationProgression.pipeline].sort(byOrderThenId),
      visibilityRules: [...runtimeData.planetExplorationProgression.visibilityRules].sort((left, right) => (runtimeData.planetExplorationProgression.pipeline.find((stage) => stage.id === left.stageId)?.order ?? 0) - (runtimeData.planetExplorationProgression.pipeline.find((stage) => stage.id === right.stageId)?.order ?? 0) || left.stageId.localeCompare(right.stageId)),
      timedActions: [...runtimeData.planetExplorationProgression.timedActions].sort(byId),
      nicknameRules: [...runtimeData.planetExplorationProgression.nicknameRules].sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id)),
      validationRules: [...runtimeData.planetExplorationProgression.validationRules].sort()
    },
    planetDevelopmentFramework: {
      ...runtimeData.planetDevelopmentFramework,
      knowledgeLifecycle: [...runtimeData.planetDevelopmentFramework.knowledgeLifecycle].sort(byOrderThenId),
      visibilityMatrix: [...runtimeData.planetDevelopmentFramework.visibilityMatrix].sort((left, right) => (runtimeData.planetDevelopmentFramework.knowledgeLifecycle.find((state) => state.id === left.stateId)?.order ?? 0) - (runtimeData.planetDevelopmentFramework.knowledgeLifecycle.find((state) => state.id === right.stateId)?.order ?? 0) || left.stateId.localeCompare(right.stateId)),
      csiBands: [...runtimeData.planetDevelopmentFramework.csiBands].sort((left, right) => right.min - left.min || left.id.localeCompare(right.id)),
      sviBands: [...runtimeData.planetDevelopmentFramework.sviBands].sort((left, right) => right.min - left.min || left.id.localeCompare(right.id)),
      opportunityArchetypes: [...runtimeData.planetDevelopmentFramework.opportunityArchetypes].sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id)),
      bodyClassBaselines: [...runtimeData.planetDevelopmentFramework.bodyClassBaselines].sort(byId),
      actionReferences: [...runtimeData.planetDevelopmentFramework.actionReferences].sort((left, right) => left.actionId.localeCompare(right.actionId)),
      developmentProjectPhases: [...runtimeData.planetDevelopmentFramework.developmentProjectPhases].sort(byOrderThenId),
      presentationContracts: [...runtimeData.planetDevelopmentFramework.presentationContracts].sort(byId),
      assetRequirements: [...runtimeData.planetDevelopmentFramework.assetRequirements].sort(byId),
      developmentProfiles: [...runtimeData.planetDevelopmentFramework.developmentProfiles].sort(byId),
      validationRules: [...runtimeData.planetDevelopmentFramework.validationRules].sort()
    },
    civilizationProgressionFramework: {
      ...runtimeData.civilizationProgressionFramework,
      developmentScores: [...runtimeData.civilizationProgressionFramework.developmentScores].sort(byId),
      scoreBands: [...runtimeData.civilizationProgressionFramework.scoreBands].sort((left, right) => right.min - left.min || left.id.localeCompare(right.id)),
      civilizationStages: [...runtimeData.civilizationProgressionFramework.civilizationStages].sort(byOrderThenId).map((stage) => ({
        ...stage,
        requirementIds: [...stage.requirementIds].sort(),
        unlockedSystemIds: [...stage.unlockedSystemIds].sort(),
        recommendedGameplay: [...stage.recommendedGameplay].sort(),
        availableActionIds: [...stage.availableActionIds].sort(),
        milestoneIds: [...stage.milestoneIds].sort()
      })),
      civilizationStageRequirements: [...runtimeData.civilizationProgressionFramework.civilizationStageRequirements].sort(byId).map((requirement) => ({
        ...requirement,
        requiredIds: [...requirement.requiredIds].sort(),
        dimensionIds: [...requirement.dimensionIds].sort()
      })),
      civilizationMilestones: [...runtimeData.civilizationProgressionFramework.civilizationMilestones].sort(byId).map((milestone) => ({
        ...milestone,
        requirementIds: [...milestone.requirementIds].sort(),
        contributesToDimensionIds: [...milestone.contributesToDimensionIds].sort(),
        unlockedSystemIds: [...milestone.unlockedSystemIds].sort()
      })),
      civilizationProgressionPresentation: [...runtimeData.civilizationProgressionFramework.civilizationProgressionPresentation].sort(byId).map((presentation) => ({
        ...presentation,
        semanticFields: [...presentation.semanticFields].sort()
      })),
      validationRules: [...runtimeData.civilizationProgressionFramework.validationRules].sort()
    },
    colonizationFramework: {
      ...runtimeData.colonizationFramework,
      colonyTypeDefinitions: [...runtimeData.colonizationFramework.colonyTypeDefinitions].sort(byId).map((type) => ({
        ...type,
        supportedBodyClasses: [...type.supportedBodyClasses].sort(),
        prohibitedBodyClasses: [...type.prohibitedBodyClasses].sort(),
        requiredCapabilityStates: [...type.requiredCapabilityStates].sort(),
        requiredTechnologies: [...type.requiredTechnologies].sort(),
        requiredBuildings: [...type.requiredBuildings].sort(),
        requiredResources: [...type.requiredResources].sort(),
        progressionRequirements: [...type.progressionRequirements].sort((left, right) => left.id.localeCompare(right.id)),
        allowedActionIds: [...type.allowedActionIds].sort()
      })),
      colonizationEligibilityDefinitions: [...runtimeData.colonizationFramework.colonizationEligibilityDefinitions].sort(byOrderThenId),
      colonizationReasonCodes: [...runtimeData.colonizationFramework.colonizationReasonCodes].sort(byId),
      colonyProjectPhaseDefinitions: [...runtimeData.colonizationFramework.colonyProjectPhaseDefinitions].sort(byOrderThenId).map((phase) => ({
        ...phase,
        requirementIds: [...phase.requirementIds].sort(),
        resourceInputRoles: [...phase.resourceInputRoles].sort(),
        populationInputRoles: [...phase.populationInputRoles].sort(),
        workforceInputRoles: [...phase.workforceInputRoles].sort(),
        failureConditionIds: [...phase.failureConditionIds].sort(),
        completionEffects: [...phase.completionEffects].sort()
      })),
      colonyTransportRequirementDefinitions: [...runtimeData.colonizationFramework.colonyTransportRequirementDefinitions].sort(byId).map((requirement) => ({
        ...requirement,
        requiredForColonyTypeIds: [...requirement.requiredForColonyTypeIds].sort()
      })),
      colonyResourcePackageDefinitions: [...runtimeData.colonizationFramework.colonyResourcePackageDefinitions].sort(byId).map((packageDefinition) => ({
        ...packageDefinition,
        resourceInputs: [...packageDefinition.resourceInputs].sort((left, right) => left.role.localeCompare(right.role)),
        transportRequirementIds: [...packageDefinition.transportRequirementIds].sort(),
        recommendedForColonyTypeIds: [...packageDefinition.recommendedForColonyTypeIds].sort()
      })),
      colonyPopulationRequirementDefinitions: [...runtimeData.colonizationFramework.colonyPopulationRequirementDefinitions].sort(byId).map((requirement) => ({
        ...requirement,
        specialistsRequired: [...requirement.specialistsRequired].sort()
      })),
      colonyInitialStateTemplates: [...runtimeData.colonizationFramework.colonyInitialStateTemplates].sort(byId).map((template) => ({
        ...template,
        hazardModifierIds: [...template.hazardModifierIds].sort(),
        maintenanceCategoryIds: [...template.maintenanceCategoryIds].sort(),
        progressionContributionIds: [...template.progressionContributionIds].sort()
      })),
      colonyDevelopmentStages: [...runtimeData.colonizationFramework.colonyDevelopmentStages].sort(byOrderThenId).map((stage) => ({
        ...stage,
        requirements: [...stage.requirements].sort((left, right) => left.id.localeCompare(right.id)),
        unlockedCapabilityIds: [...stage.unlockedCapabilityIds].sort()
      })),
      colonyFocusDefinitions: [...runtimeData.colonizationFramework.colonyFocusDefinitions].sort(byId).map((focus) => ({
        ...focus,
        recommendedBuildingRoles: [...focus.recommendedBuildingRoles].sort(),
        resourcePriorityRoles: [...focus.resourcePriorityRoles].sort(),
        recommendedActionIds: [...focus.recommendedActionIds].sort()
      })),
      colonyStarterSetDefinitions: [...runtimeData.colonizationFramework.colonyStarterSetDefinitions].sort(byId).map((starterSet) => ({
        ...starterSet,
        buildingRoles: [...starterSet.buildingRoles].sort((left, right) => left.role.localeCompare(right.role)),
        missingBuildingRoles: [...starterSet.missingBuildingRoles].sort()
      })),
      colonyCapabilityDefinitions: [...runtimeData.colonizationFramework.colonyCapabilityDefinitions].sort(byId),
      colonyMaintenanceDefinitions: [...runtimeData.colonizationFramework.colonyMaintenanceDefinitions].sort(byId).map((maintenance) => ({
        ...maintenance,
        affectedCapabilityIds: [...maintenance.affectedCapabilityIds].sort()
      })),
      colonyFailurePolicies: [...runtimeData.colonizationFramework.colonyFailurePolicies].sort(byId).map((policy) => ({
        ...policy,
        restartRequirements: [...policy.restartRequirements].sort()
      })),
      colonyPresentationContract: [...runtimeData.colonizationFramework.colonyPresentationContract].sort(byId).map((contract) => ({
        ...contract,
        semanticFields: [...contract.semanticFields].sort()
      })),
      creativeProductionRequirements: [...runtimeData.colonizationFramework.creativeProductionRequirements].sort(byId),
      assetLibraryCategories: [...runtimeData.colonizationFramework.assetLibraryCategories].sort(byId).map((category) => ({
        ...category,
        groups: [...category.groups].sort()
      })),
      missingCanonicalDefinitions: [...runtimeData.colonizationFramework.missingCanonicalDefinitions].sort(byId).map((definition) => ({
        ...definition,
        referencedBy: [...definition.referencedBy].sort()
      })),
      validationRules: [...runtimeData.colonizationFramework.validationRules].sort()
    },
    populationSimulationFramework: {
      ...runtimeData.populationSimulationFramework,
      ownership: {
        studioOwns: [...runtimeData.populationSimulationFramework.ownership.studioOwns].sort(),
        gameOwns: [...runtimeData.populationSimulationFramework.ownership.gameOwns].sort()
      },
      populationCategoryDefinitions: [...runtimeData.populationSimulationFramework.populationCategoryDefinitions].sort(byId).map((definition) => ({
        ...definition,
        lifeStageIds: [...definition.lifeStageIds].sort(),
        workforceRoleIds: [...definition.workforceRoleIds].sort(),
        specialistRoleIds: [...definition.specialistRoleIds].sort()
      })),
      populationLifeStageDefinitions: [...runtimeData.populationSimulationFramework.populationLifeStageDefinitions].sort(byId),
      populationWorkforceRoleDefinitions: [...runtimeData.populationSimulationFramework.populationWorkforceRoleDefinitions].sort(byId).map((definition) => ({
        ...definition,
        educationTierIds: [...definition.educationTierIds].sort(),
        supportedBuildingFamilyIds: [...definition.supportedBuildingFamilyIds].sort(),
        substitutionPolicyIds: [...definition.substitutionPolicyIds].sort(),
        shortageReasonCodeIds: [...definition.shortageReasonCodeIds].sort(),
        identityRelationshipIds: [...definition.identityRelationshipIds].sort()
      })),
      populationSpecialistRoleDefinitions: [...runtimeData.populationSimulationFramework.populationSpecialistRoleDefinitions].sort(byId).map((definition) => ({
        ...definition,
        educationTierIds: [...definition.educationTierIds].sort(),
        requiredResearchIds: [...definition.requiredResearchIds].sort(),
        requiredBuildingFamilyIds: [...definition.requiredBuildingFamilyIds].sort(),
        supportedActionIds: [...definition.supportedActionIds].sort(),
        identityRelationshipIds: [...definition.identityRelationshipIds].sort(),
        missingSourceDefinitionIds: [...definition.missingSourceDefinitionIds].sort()
      })),
      demographicStateSchema: {
        ...runtimeData.populationSimulationFramework.demographicStateSchema,
        fields: [...runtimeData.populationSimulationFramework.demographicStateSchema.fields].sort(byId)
      },
      populationGrowthDefinitions: [...runtimeData.populationSimulationFramework.populationGrowthDefinitions].sort(byId).map((definition) => ({
        ...definition,
        inputs: [...definition.inputs].sort(),
        outputs: [...definition.outputs].sort()
      })),
      populationCapacityDefinitions: [...runtimeData.populationSimulationFramework.populationCapacityDefinitions].sort(byId).map((definition) => ({
        ...definition,
        sourceTypes: [...definition.sourceTypes].sort(),
        constraintIds: [...definition.constraintIds].sort()
      })),
      populationNeedDefinitions: [...runtimeData.populationSimulationFramework.populationNeedDefinitions].sort(byId).map((definition) => ({
        ...definition,
        affects: [...definition.affects].sort()
      })),
      populationWellbeingBands: [...runtimeData.populationSimulationFramework.populationWellbeingBands].sort((left, right) => left.min - right.min || left.id.localeCompare(right.id)),
      populationEducationDefinitions: [...runtimeData.populationSimulationFramework.populationEducationDefinitions].sort(byId).map((definition) => ({
        ...definition,
        capacitySourceTypes: [...definition.capacitySourceTypes].sort(),
        eligibleRoleIds: [...definition.eligibleRoleIds].sort(),
        specialistConversionRoleIds: [...definition.specialistConversionRoleIds].sort(),
        buildingDependencyIds: [...definition.buildingDependencyIds].sort(),
        researchDependencyIds: [...definition.researchDependencyIds].sort(),
        identityModifierIds: [...definition.identityModifierIds].sort()
      })),
      populationMigrationDefinitions: [...runtimeData.populationSimulationFramework.populationMigrationDefinitions].sort(byId).map((definition) => ({
        ...definition,
        actionIds: [...definition.actionIds].sort()
      })),
      workforceAssignmentDefinitions: [...runtimeData.populationSimulationFramework.workforceAssignmentDefinitions].sort(byId).map((definition) => ({
        ...definition,
        targetScopes: [...definition.targetScopes].sort(),
        actionIds: [...definition.actionIds].sort()
      })),
      automationSubstitutionPolicies: [...runtimeData.populationSimulationFramework.automationSubstitutionPolicies].sort(byId).map((definition) => ({
        ...definition,
        allowedWorkerCategoryIds: [...definition.allowedWorkerCategoryIds].sort()
      })),
      populationShortageReasonCodes: [...runtimeData.populationSimulationFramework.populationShortageReasonCodes].sort(byId),
      colonyIntegration: [...runtimeData.populationSimulationFramework.colonyIntegration].sort(byId).map((definition) => ({
        ...definition,
        workforceRoleRequirements: [...definition.workforceRoleRequirements].sort((left, right) => left.roleId.localeCompare(right.roleId)),
        specialistRoleRequirements: [...definition.specialistRoleRequirements].sort(),
        automationSupportPolicyIds: [...definition.automationSupportPolicyIds].sort()
      })),
      buildingIntegrationHooks: [...runtimeData.populationSimulationFramework.buildingIntegrationHooks].sort(byId).map((definition) => ({
        ...definition,
        workforceDemandRoleIds: [...definition.workforceDemandRoleIds].sort(),
        specialistDemandRoleIds: [...definition.specialistDemandRoleIds].sort(),
        automationPolicyIds: [...definition.automationPolicyIds].sort()
      })),
      economyResourceHooks: [...runtimeData.populationSimulationFramework.economyResourceHooks].sort(byId).map((hook) => ({
        ...hook,
        referencedIds: [...hook.referencedIds].sort()
      })),
      civilizationIdentityIntegration: [...runtimeData.populationSimulationFramework.civilizationIdentityIntegration].sort(byId).map((hook) => ({
        ...hook,
        referencedIds: [...hook.referencedIds].sort()
      })),
      civilizationProgressionIntegration: [...runtimeData.populationSimulationFramework.civilizationProgressionIntegration].sort(byId).map((hook) => ({
        ...hook,
        referencedIds: [...hook.referencedIds].sort()
      })),
      actionSystemIntegration: [...runtimeData.populationSimulationFramework.actionSystemIntegration].sort(byId).map((hook) => ({
        ...hook,
        referencedIds: [...hook.referencedIds].sort()
      })),
      populationPresentationContract: [...runtimeData.populationSimulationFramework.populationPresentationContract].sort(byId).map((contract) => ({
        ...contract,
        semanticFields: [...contract.semanticFields].sort()
      })),
      creativeProductionRequirements: [...runtimeData.populationSimulationFramework.creativeProductionRequirements].sort(byId),
      assetLibraryCategories: [...runtimeData.populationSimulationFramework.assetLibraryCategories].sort(byId).map((category) => ({
        ...category,
        groups: [...category.groups].sort()
      })),
      missingSourceDefinitions: [...runtimeData.populationSimulationFramework.missingSourceDefinitions].sort(byId).map((definition) => ({
        ...definition,
        referencedBy: [...definition.referencedBy].sort()
      })),
      validationRules: [...runtimeData.populationSimulationFramework.validationRules].sort()
    },
    resourceEconomyLogisticsFramework: {
      ...runtimeData.resourceEconomyLogisticsFramework,
      auditSummary: [...runtimeData.resourceEconomyLogisticsFramework.auditSummary].sort(byId),
      resourceFlowDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.resourceFlowDefinitions].sort(byId).map((flow) => ({
        ...flow,
        sourceNodeTypes: [...flow.sourceNodeTypes].sort(),
        destinationNodeTypes: [...flow.destinationNodeTypes].sort(),
        storageDefinitionIds: [...flow.storageDefinitionIds].sort(),
        transportModeIds: [...flow.transportModeIds].sort(),
        processingRecipeIds: [...flow.processingRecipeIds].sort(),
        manufacturingRecipeIds: [...flow.manufacturingRecipeIds].sort(),
        consumptionProfileIds: [...flow.consumptionProfileIds].sort(),
        marketEligibility: [...flow.marketEligibility].sort(),
        tradeEligibility: [...flow.tradeEligibility].sort()
      })),
      economyNodeTypeDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.economyNodeTypeDefinitions].sort(byId).map((node) => ({
        ...node,
        supportedResourceClasses: [...node.supportedResourceClasses].sort(),
        buildingReferences: [...node.buildingReferences].sort(),
        hazardConstraints: [...node.hazardConstraints].sort(),
        routeCompatibility: [...node.routeCompatibility].sort()
      })),
      resourceLocationScopes: [...runtimeData.resourceEconomyLogisticsFramework.resourceLocationScopes].sort(byId),
      resourceExtractionDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.resourceExtractionDefinitions].sort(byId).map((definition) => ({
        ...definition,
        eligibleBodyClasses: [...definition.eligibleBodyClasses].sort(),
        eligibleResourceClasses: [...definition.eligibleResourceClasses].sort(),
        buildingRequirementIds: [...definition.buildingRequirementIds].sort(),
        technologyRequirementIds: [...definition.technologyRequirementIds].sort(),
        equipmentRequirementIds: [...definition.equipmentRequirementIds].sort(),
        hazardModifierIds: [...definition.hazardModifierIds].sort(),
        byproductResourceIds: [...definition.byproductResourceIds].sort()
      })),
      resourceStorageDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.resourceStorageDefinitions].sort(byId).map((definition) => ({
        ...definition,
        supportedResourceClasses: [...definition.supportedResourceClasses].sort(),
        hazardRequirements: [...definition.hazardRequirements].sort(),
        environmentalRequirements: [...definition.environmentalRequirements].sort(),
        buildingReferenceIds: [...definition.buildingReferenceIds].sort(),
        upgradeReferenceIds: [...definition.upgradeReferenceIds].sort()
      })),
      transportModeDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.transportModeDefinitions].sort(byId).map((definition) => ({
        ...definition,
        supportedRouteScopes: [...definition.supportedRouteScopes].sort(),
        cargoClasses: [...definition.cargoClasses].sort(),
        fuelRequirementIds: [...definition.fuelRequirementIds].sort(),
        technologyRequirementIds: [...definition.technologyRequirementIds].sort(),
        buildingPortRequirementIds: [...definition.buildingPortRequirementIds].sort(),
        hazardTolerance: [...definition.hazardTolerance].sort(),
        maintenanceHooks: [...definition.maintenanceHooks].sort(),
        actionIds: [...definition.actionIds].sort()
      })),
      logisticsRouteDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.logisticsRouteDefinitions].sort(byId).map((definition) => ({
        ...definition,
        sourceNodeRequirements: [...definition.sourceNodeRequirements].sort(),
        destinationNodeRequirements: [...definition.destinationNodeRequirements].sort(),
        validTransportModeIds: [...definition.validTransportModeIds].sort(),
        hazardModifierIds: [...definition.hazardModifierIds].sort(),
        escortSecurityHooks: [...definition.escortSecurityHooks].sort(),
        routeActionIds: [...definition.routeActionIds].sort()
      })),
      shipmentStateDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.shipmentStateDefinitions].sort(byId).map((definition) => ({
        ...definition,
        allowedTransitions: [...definition.allowedTransitions].sort()
      })),
      throughputDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.throughputDefinitions].sort(byId).map((definition) => ({
        ...definition,
        supportedModes: [...definition.supportedModes].sort(),
        capacityConstraintIds: [...definition.capacityConstraintIds].sort()
      })),
      capacityConstraintDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.capacityConstraintDefinitions].sort(byId).map((definition) => ({
        ...definition,
        appliesTo: [...definition.appliesTo].sort()
      })),
      processingRecipeDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.processingRecipeDefinitions].sort(byId).map((definition) => ({
        ...definition,
        inputItems: [...definition.inputItems].sort((left, right) => left.resourceId.localeCompare(right.resourceId)),
        outputItems: [...definition.outputItems].sort((left, right) => left.resourceId.localeCompare(right.resourceId)),
        byproducts: [...definition.byproducts].sort((left, right) => left.resourceId.localeCompare(right.resourceId)),
        wasteOutputs: [...definition.wasteOutputs].sort((left, right) => left.resourceId.localeCompare(right.resourceId)),
        requiredBuildingIds: [...definition.requiredBuildingIds].sort(),
        requiredResearchIds: [...definition.requiredResearchIds].sort(),
        requiredWorkforceRoles: [...definition.requiredWorkforceRoles].sort()
      })),
      manufacturingRecipeDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.manufacturingRecipeDefinitions].sort(byId).map((definition) => ({
        ...definition,
        inputItems: [...definition.inputItems].sort((left, right) => left.resourceId.localeCompare(right.resourceId)),
        outputItems: [...definition.outputItems].sort((left, right) => left.resourceId.localeCompare(right.resourceId)),
        byproducts: [...definition.byproducts].sort((left, right) => left.resourceId.localeCompare(right.resourceId)),
        wasteOutputs: [...definition.wasteOutputs].sort((left, right) => left.resourceId.localeCompare(right.resourceId)),
        requiredBuildingIds: [...definition.requiredBuildingIds].sort(),
        requiredResearchIds: [...definition.requiredResearchIds].sort(),
        requiredWorkforceRoles: [...definition.requiredWorkforceRoles].sort()
      })),
      productionChainDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.productionChainDefinitions].sort(byId).map((definition) => ({
        ...definition,
        stages: [...definition.stages].sort((left, right) => left.order - right.order).map((stage) => ({
          ...stage,
          inputResourceIds: [...stage.inputResourceIds].sort(),
          outputResourceIds: [...stage.outputResourceIds].sort(),
          nodeTypeIds: [...stage.nodeTypeIds].sort()
        })),
        storageRequirementIds: [...definition.storageRequirementIds].sort(),
        transportRequirementIds: [...definition.transportRequirementIds].sort(),
        bottleneckDefinitionIds: [...definition.bottleneckDefinitionIds].sort(),
        completionOutputResourceIds: [...definition.completionOutputResourceIds].sort()
      })),
      supplyDemandDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.supplyDemandDefinitions].sort(byId).map((definition) => ({
        ...definition,
        resourceClassIds: [...definition.resourceClassIds].sort(),
        affectedActionIds: [...definition.affectedActionIds].sort()
      })),
      economyPriorityDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.economyPriorityDefinitions].sort(byOrderThenId),
      economyConditionStateDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.economyConditionStateDefinitions].sort(byId),
      economyShortageReasonCodes: [...runtimeData.resourceEconomyLogisticsFramework.economyShortageReasonCodes].sort(byId),
      lossAndWastePolicies: [...runtimeData.resourceEconomyLogisticsFramework.lossAndWastePolicies].sort(byId).map((policy) => ({
        ...policy,
        appliesToResourceClasses: [...policy.appliesToResourceClasses].sort()
      })),
      recyclingPolicies: [...runtimeData.resourceEconomyLogisticsFramework.recyclingPolicies].sort(byId).map((policy) => ({
        ...policy,
        inputResourceClasses: [...policy.inputResourceClasses].sort()
      })),
      marketTradeIntegration: [...runtimeData.resourceEconomyLogisticsFramework.marketTradeIntegration].sort(byId).map((integration) => ({
        ...integration,
        locationScopeIds: [...integration.locationScopeIds].sort(),
        acceptedResourceClasses: [...integration.acceptedResourceClasses].sort(),
        storageDefinitionIds: [...integration.storageDefinitionIds].sort(),
        routeAccessIds: [...integration.routeAccessIds].sort(),
        transactionReasonCodeIds: [...integration.transactionReasonCodeIds].sort(),
        tradeActionIds: [...integration.tradeActionIds].sort()
      })),
      colonizationIntegration: {
        ...runtimeData.resourceEconomyLogisticsFramework.colonizationIntegration,
        colonyResourcePackageIds: [...runtimeData.resourceEconomyLogisticsFramework.colonizationIntegration.colonyResourcePackageIds].sort(),
        requiredRouteDefinitionIds: [...runtimeData.resourceEconomyLogisticsFramework.colonizationIntegration.requiredRouteDefinitionIds].sort(),
        requiredTransportModeIds: [...runtimeData.resourceEconomyLogisticsFramework.colonizationIntegration.requiredTransportModeIds].sort(),
        requiredPhaseIds: [...runtimeData.resourceEconomyLogisticsFramework.colonizationIntegration.requiredPhaseIds].sort()
      },
      populationIntegrationHooks: [...runtimeData.resourceEconomyLogisticsFramework.populationIntegrationHooks].sort(byId).map((hook) => ({
        ...hook,
        consumesResourceClasses: [...hook.consumesResourceClasses].sort(),
        provides: [...hook.provides].sort()
      })),
      buildingIntegrationHooks: [...runtimeData.resourceEconomyLogisticsFramework.buildingIntegrationHooks].sort(byId).map((hook) => ({
        ...hook,
        nodeTypeIds: [...hook.nodeTypeIds].sort(),
        providedCapabilities: [...hook.providedCapabilities].sort()
      })),
      actionIntegrationHooks: [...runtimeData.resourceEconomyLogisticsFramework.actionIntegrationHooks].sort(byId),
      identityIntegrationHooks: [...runtimeData.resourceEconomyLogisticsFramework.identityIntegrationHooks].sort((left, right) => left.notes.localeCompare(right.notes)).map((hook) => ({
        ...hook,
        alignmentIds: [...hook.alignmentIds].sort()
      })),
      progressionIntegrationHooks: [...runtimeData.resourceEconomyLogisticsFramework.progressionIntegrationHooks].sort(byId),
      aiAutomationRules: [...runtimeData.resourceEconomyLogisticsFramework.aiAutomationRules].sort(),
      economyLogisticsPresentationContract: [...runtimeData.resourceEconomyLogisticsFramework.economyLogisticsPresentationContract].sort(byId).map((contract) => ({
        ...contract,
        semanticFields: [...contract.semanticFields].sort()
      })),
      creativeProductionRequirements: [...runtimeData.resourceEconomyLogisticsFramework.creativeProductionRequirements].sort(byId),
      assetLibraryCategories: [...runtimeData.resourceEconomyLogisticsFramework.assetLibraryCategories].sort(byId).map((category) => ({
        ...category,
        groups: [...category.groups].sort()
      })),
      missingCanonicalDefinitions: [...runtimeData.resourceEconomyLogisticsFramework.missingCanonicalDefinitions].sort(byId).map((definition) => ({
        ...definition,
        referencedBy: [...definition.referencedBy].sort()
      })),
      provisionalBalanceValues: [...runtimeData.resourceEconomyLogisticsFramework.provisionalBalanceValues].sort(byId),
      validationRules: [...runtimeData.resourceEconomyLogisticsFramework.validationRules].sort()
    },
    missionExpeditionFramework: {
      ...runtimeData.missionExpeditionFramework,
      missionTypeDefinitions: [...runtimeData.missionExpeditionFramework.missionTypeDefinitions].sort(byId).map((definition) => ({
        ...definition,
        expeditionScopeIds: [...definition.expeditionScopeIds].sort(),
        defaultObjectiveTypeIds: [...definition.defaultObjectiveTypeIds].sort(),
        defaultRewardTypeIds: [...definition.defaultRewardTypeIds].sort(),
        requiredActionIds: [...definition.requiredActionIds].sort(),
        relatedSystemIds: [...definition.relatedSystemIds].sort()
      })),
      expeditionScopeDefinitions: [...runtimeData.missionExpeditionFramework.expeditionScopeDefinitions].sort(byId).map((definition) => ({
        ...definition,
        validTargetTypes: [...definition.validTargetTypes].sort(),
        requiredRouteDefinitionIds: [...definition.requiredRouteDefinitionIds].sort(),
        requiredTransportModeIds: [...definition.requiredTransportModeIds].sort(),
        hazardPolicyIds: [...definition.hazardPolicyIds].sort()
      })),
      missionLifecycleStateDefinitions: [...runtimeData.missionExpeditionFramework.missionLifecycleStateDefinitions].sort(byId).map((definition) => ({
        ...definition,
        allowedTransitions: [...definition.allowedTransitions].sort()
      })),
      expeditionLifecycleStateDefinitions: [...runtimeData.missionExpeditionFramework.expeditionLifecycleStateDefinitions].sort(byId).map((definition) => ({
        ...definition,
        allowedTransitions: [...definition.allowedTransitions].sort()
      })),
      missionObjectiveContractDefinitions: [...runtimeData.missionExpeditionFramework.missionObjectiveContractDefinitions].sort(byId).map((definition) => ({
        ...definition,
        targetTypes: [...definition.targetTypes].sort(),
        requiredActionIds: [...definition.requiredActionIds].sort(),
        requiredKnowledgeStates: [...definition.requiredKnowledgeStates].sort()
      })),
      missionRewardContractDefinitions: [...runtimeData.missionExpeditionFramework.missionRewardContractDefinitions].sort(byId).map((definition) => ({
        ...definition,
        allowedForMissionTypeIds: [...definition.allowedForMissionTypeIds].sort()
      })),
      missionTemplateDefinitions: [...runtimeData.missionExpeditionFramework.missionTemplateDefinitions].sort(byId).map((definition) => ({
        ...definition,
        objectiveTypeIds: [...definition.objectiveTypeIds].sort(),
        rewardTypeIds: [...definition.rewardTypeIds].sort(),
        prerequisiteResearchIds: [...definition.prerequisiteResearchIds].sort(),
        prerequisiteDiscoveryStateIds: [...definition.prerequisiteDiscoveryStateIds].sort()
      })),
      expeditionRequirementDefinitions: [...runtimeData.missionExpeditionFramework.expeditionRequirementDefinitions].sort(byId).map((definition) => ({
        ...definition,
        resourceIds: [...definition.resourceIds].sort(),
        actionIds: [...definition.actionIds].sort(),
        routeDefinitionIds: [...definition.routeDefinitionIds].sort(),
        transportModeIds: [...definition.transportModeIds].sort()
      })),
      expeditionRiskDefinitions: [...runtimeData.missionExpeditionFramework.expeditionRiskDefinitions].sort(byId).map((definition) => ({
        ...definition,
        appliesToScopeIds: [...definition.appliesToScopeIds].sort(),
        hazardProfileIds: [...definition.hazardProfileIds].sort(),
        failureCauseIds: [...definition.failureCauseIds].sort(),
        mitigationRequirementIds: [...definition.mitigationRequirementIds].sort()
      })),
      missionGenerationRules: [...runtimeData.missionExpeditionFramework.missionGenerationRules].sort(byId).map((rule) => ({
        ...rule,
        inputs: [...rule.inputs].sort(),
        rejectsWhen: [...rule.rejectsWhen].sort()
      })),
      integrationHooks: [...runtimeData.missionExpeditionFramework.integrationHooks].sort(byId).map((hook) => ({
        ...hook,
        referencedIds: [...hook.referencedIds].sort()
      })),
      aiAutomationRules: [...runtimeData.missionExpeditionFramework.aiAutomationRules].sort(),
      missionExpeditionPresentationContract: [...runtimeData.missionExpeditionFramework.missionExpeditionPresentationContract].sort(byId).map((contract) => ({
        ...contract,
        semanticFields: [...contract.semanticFields].sort()
      })),
      creativeProductionRequirements: [...runtimeData.missionExpeditionFramework.creativeProductionRequirements].sort(byId),
      assetLibraryCategories: [...runtimeData.missionExpeditionFramework.assetLibraryCategories].sort(byId).map((category) => ({
        ...category,
        groups: [...category.groups].sort()
      })),
      missingCanonicalDefinitions: [...runtimeData.missionExpeditionFramework.missingCanonicalDefinitions].sort(byId).map((definition) => ({
        ...definition,
        referencedBy: [...definition.referencedBy].sort()
      })),
      validationRules: [...runtimeData.missionExpeditionFramework.validationRules].sort()
    },
    dynamicEventFramework: {
      ...runtimeData.dynamicEventFramework,
      ownership: {
        studioOwns: [...runtimeData.dynamicEventFramework.ownership.studioOwns].sort(),
        gameOwns: [...runtimeData.dynamicEventFramework.ownership.gameOwns].sort()
      },
      populationSimulationIntegration: {
        ...runtimeData.dynamicEventFramework.populationSimulationIntegration,
        hooks: [...runtimeData.dynamicEventFramework.populationSimulationIntegration.hooks].sort()
      },
      eventCategoryDefinitions: [...runtimeData.dynamicEventFramework.eventCategoryDefinitions].sort(byId).map((definition) => ({
        ...definition,
        sourceSystemIds: [...definition.sourceSystemIds].sort()
      })),
      eventTypeDefinitions: [...runtimeData.dynamicEventFramework.eventTypeDefinitions].sort(byId),
      eventLifecycleStateDefinitions: [...runtimeData.dynamicEventFramework.eventLifecycleStateDefinitions].sort(byId).map((definition) => ({
        ...definition,
        allowedTransitions: [...definition.allowedTransitions].sort()
      })),
      eventDefinitions: [...runtimeData.dynamicEventFramework.eventDefinitions].sort(byId).map((definition) => ({
        ...definition,
        targetEntityTypes: [...definition.targetEntityTypes].sort(),
        triggerPolicyIds: [...definition.triggerPolicyIds].sort(),
        eligibilityIds: [...definition.eligibilityIds].sort(),
        phaseIds: [...definition.phaseIds].sort(),
        effectTypeIds: [...definition.effectTypeIds].sort(),
        choiceIds: [...definition.choiceIds].sort(),
        resolutionPolicyIds: [...definition.resolutionPolicyIds].sort(),
        failurePolicyIds: [...definition.failurePolicyIds].sort(),
        followUpEventIds: [...definition.followUpEventIds].sort(),
        missionHookTemplateIds: [...definition.missionHookTemplateIds].sort(),
        actionReferenceIds: [...definition.actionReferenceIds].sort(),
        identityInfluenceIds: [...definition.identityInfluenceIds].sort(),
        progressionMilestoneIds: [...definition.progressionMilestoneIds].sort()
      })),
      eventTriggerPolicies: [...runtimeData.dynamicEventFramework.eventTriggerPolicies].sort(byId).map((definition) => ({
        ...definition,
        sourceSystemIds: [...definition.sourceSystemIds].sort()
      })),
      eventEligibilityDefinitions: [...runtimeData.dynamicEventFramework.eventEligibilityDefinitions].sort(byId).map((definition) => ({
        ...definition,
        dependsOn: [...definition.dependsOn].sort(),
        blockerReasonCodes: [...definition.blockerReasonCodes].sort()
      })),
      eventProbabilityPolicies: [...runtimeData.dynamicEventFramework.eventProbabilityPolicies].sort(byId),
      eventDeterministicSeedPolicies: [...runtimeData.dynamicEventFramework.eventDeterministicSeedPolicies].sort(byId).map((definition) => ({
        ...definition,
        seedInputs: [...definition.seedInputs].sort()
      })),
      eventSeverityDefinitions: [...runtimeData.dynamicEventFramework.eventSeverityDefinitions].sort(byId),
      eventDurationClasses: [...runtimeData.dynamicEventFramework.eventDurationClasses].sort(byId),
      eventPhaseDefinitions: [...runtimeData.dynamicEventFramework.eventPhaseDefinitions].sort(byOrderThenId),
      eventEffectDefinitions: [...runtimeData.dynamicEventFramework.eventEffectDefinitions].sort(byId).map((definition) => ({
        ...definition,
        targetSystemIds: [...definition.targetSystemIds].sort()
      })),
      eventChoiceDefinitions: [...runtimeData.dynamicEventFramework.eventChoiceDefinitions].sort(byId).map((definition) => ({
        ...definition,
        actionIds: [...definition.actionIds].sort(),
        requirementReasonCodes: [...definition.requirementReasonCodes].sort(),
        outcomeEffectTypeIds: [...definition.outcomeEffectTypeIds].sort()
      })),
      eventResolutionPolicies: [...runtimeData.dynamicEventFramework.eventResolutionPolicies].sort(byId).map((definition) => ({
        ...definition,
        deterministicInputs: [...definition.deterministicInputs].sort()
      })),
      eventFailurePolicies: [...runtimeData.dynamicEventFramework.eventFailurePolicies].sort(byId).map((definition) => ({
        ...definition,
        reasonCodes: [...definition.reasonCodes].sort(),
        recoveryChoiceIds: [...definition.recoveryChoiceIds].sort(),
        missionHookIds: [...definition.missionHookIds].sort()
      })),
      eventChainDefinitions: [...runtimeData.dynamicEventFramework.eventChainDefinitions].sort(byId).map((definition) => ({
        ...definition,
        eventIds: [...definition.eventIds].sort(),
        branchEventIds: [...definition.branchEventIds].sort(),
        terminalEventIds: [...definition.terminalEventIds].sort()
      })),
      eventReasonCodes: [...runtimeData.dynamicEventFramework.eventReasonCodes].sort(byId),
      eventKnowledgeVisibility: [...runtimeData.dynamicEventFramework.eventKnowledgeVisibility].sort(byId),
      eventTimelineSignificancePolicies: [...runtimeData.dynamicEventFramework.eventTimelineSignificancePolicies].sort(byId),
      eventPresentationContract: [...runtimeData.dynamicEventFramework.eventPresentationContract].sort(byId).map((contract) => ({
        ...contract,
        semanticFields: [...contract.semanticFields].sort()
      })),
      offlinePolicies: [...runtimeData.dynamicEventFramework.offlinePolicies].sort(byId),
      aiAgentRules: [...runtimeData.dynamicEventFramework.aiAgentRules].sort(),
      creativeProductionRequirements: [...runtimeData.dynamicEventFramework.creativeProductionRequirements].sort(byId),
      assetLibraryCategories: [...runtimeData.dynamicEventFramework.assetLibraryCategories].sort(byId).map((category) => ({
        ...category,
        groups: [...category.groups].sort()
      })),
      encyclopediaSections: [...runtimeData.dynamicEventFramework.encyclopediaSections].sort(byId),
      provisionalBalanceValues: [...runtimeData.dynamicEventFramework.provisionalBalanceValues].sort(byId),
      missingCanonicalDefinitions: [...runtimeData.dynamicEventFramework.missingCanonicalDefinitions].sort(byId).map((definition) => ({
        ...definition,
        referencedBy: [...definition.referencedBy].sort()
      })),
      validationRules: [...runtimeData.dynamicEventFramework.validationRules].sort()
    },
    resources: [...runtimeData.resources].sort(byId),
    buildingTaxonomy: [...runtimeData.buildingTaxonomy].sort(byDisplayOrderThenId).map((family) => ({
      ...family,
      subcategories: [...family.subcategories].sort(byDisplayOrderThenId)
    })),
    buildingLibrary: [...runtimeData.buildingLibrary].sort(byId),
    buildingClassifications: [...runtimeData.buildingClassifications].sort(byId),
    upgradeCategories: [...runtimeData.upgradeCategories].sort(byOrderThenId),
    upgrades: [...runtimeData.upgrades].sort(byOrderThenId),
    upgradeTree: {
      ...runtimeData.upgradeTree,
      branches: [...runtimeData.upgradeTree.branches].sort(byOrderThenId),
      eraBands: [...runtimeData.upgradeTree.eraBands].sort(byOrderThenId),
      eraGates: [...runtimeData.upgradeTree.eraGates].sort(byId),
      futureCivilizations: [...runtimeData.upgradeTree.futureCivilizations].sort(byId),
      nodes: [...runtimeData.upgradeTree.nodes].sort(byId).map((node) => ({
        ...node,
        prerequisiteNodeIds: [...node.prerequisiteNodeIds].sort(),
        alignmentInfluences: [...node.alignmentInfluences].sort(byId),
        futureCivilizationInfluences: [...node.futureCivilizationInfluences].sort(byId),
        mutuallyExclusiveUpgradeIds: [...node.mutuallyExclusiveUpgradeIds].sort()
      })),
      edges: [...runtimeData.upgradeTree.edges].sort(byId),
      choiceGroups: [...runtimeData.upgradeTree.choiceGroups].sort(byId)
    },
    assets: [...runtimeData.assets].sort(byId),
    clientProfiles: {
      default: runtimeData.clientProfiles.default,
      roblox: runtimeData.clientProfiles.roblox,
      web: runtimeData.clientProfiles.web,
      unity: runtimeData.clientProfiles.unity,
      unreal: runtimeData.clientProfiles.unreal,
      godot: runtimeData.clientProfiles.godot,
      ios: runtimeData.clientProfiles.ios,
      android: runtimeData.clientProfiles.android
    }
  };
}

function withCanonicalEraDefinitions(runtimeData: GameRuntimeData): GameRuntimeData {
  const currentById = new Map(runtimeData.eras.map((era) => [era.id, era]));
  return {
    ...runtimeData,
    metadata: {
      ...runtimeData.metadata,
      contentVersion: Math.max(runtimeData.metadata.contentVersion, gameRuntimeContentVersion)
    },
    eras: canonicalEraDefinitions.map((definition, index) => {
      const current = currentById.get(definition.id);
      const fallbackDescription = civilizationAges.find((item) => stripAge(item.name) === stripAge(definition.displayName))?.description ?? `${definition.displayName} progression era.`;
      return {
        ...(current ?? {}),
        id: definition.id,
        index: index + 1,
        name: definition.name,
        displayName: definition.displayName,
        shortDisplayName: definition.shortDisplayName,
        description: current?.description ?? fallbackDescription,
        unlockRequirements: index === 0 ? { start: true } : { previousEraId: canonicalEraDefinitions[index - 1].id },
        iconKey: current?.iconKey ?? `era-${definition.id}`,
        artKey: current?.artKey ?? `era-${definition.id}`,
        themeKey: current?.themeKey ?? `theme-${definition.id}`,
        masteryRequirements: current?.masteryRequirements ?? {},
        tags: current?.tags ?? ["canonical", "runtime"]
      };
    })
  };
}

function validateCanonicalEraProgression(eras: EraDefinition[], issues: ImportIssue[], context: string) {
  const sortedEras = [...eras].sort(byOrderThenId);
  const expectedIds = canonicalEraDefinitions.map((era) => era.id);
  const duplicateIndexes = duplicateNumbers(eras.map((era) => era.index));

  if (eras.length !== canonicalEraDefinitions.length) {
    issues.push({
      severity: "error",
      code: "invalid_canonical_era_count",
      message: `${context} must contain exactly nine canonical eras.`,
      records: [`expected:${canonicalEraDefinitions.length}`, `received:${eras.length}`]
    });
  }

  if (duplicateIndexes.length) {
    issues.push({
      severity: "error",
      code: "duplicate_era_index",
      message: `${context} era indexes must be unique.`,
      records: duplicateIndexes.map(String)
    });
  }

  for (let index = 0; index < canonicalEraDefinitions.length; index += 1) {
    const expected = canonicalEraDefinitions[index];
    const era = sortedEras[index];
    const expectedIndex = index + 1;

    if (!era || era.id !== expected.id) {
      issues.push({
        severity: "error",
        code: "invalid_canonical_era_order",
        message: `${context} eras must follow the canonical progression order.`,
        records: [`position:${expectedIndex}`, `expected:${expected.id}`, `received:${era?.id ?? "(missing)"}`]
      });
      continue;
    }

    if (era.index !== expectedIndex) {
      issues.push({
        severity: "error",
        code: "invalid_era_index",
        message: `${context} era indexes must be sequential and one-based.`,
        records: [era.id, `expected:${expectedIndex}`, `received:${era.index}`]
      });
    }

    if (era.displayName !== expected.displayName || era.shortDisplayName !== expected.shortDisplayName) {
      issues.push({
        severity: "error",
        code: "invalid_era_display_metadata",
        message: `${context} era display metadata must match the canonical progression.`,
        records: [era.id]
      });
    }
  }

  const renaissanceIndex = sortedEras.findIndex((era) => era.id === "renaissance");
  if (renaissanceIndex !== 3 || sortedEras[2]?.id !== "medieval" || sortedEras[4]?.id !== "industrial") {
    issues.push({
      severity: "error",
      code: "invalid_renaissance_position",
      message: `${context} must place Renaissance immediately after Medieval and before Industrial.`,
      records: sortedEras.map((era) => era.id)
    });
  }

  const renaissance = eras.find((era) => era.id === "renaissance");
  if (!renaissance || renaissance.index !== 4 || renaissance.name !== "renaissance" || renaissance.displayName !== "Renaissance" || renaissance.shortDisplayName !== "Renaissance") {
    issues.push({
      severity: "error",
      code: "invalid_renaissance_record",
      message: `${context} Renaissance era record must use the canonical id, index, name, displayName, and shortDisplayName.`,
      records: renaissance ? [JSON.stringify({
        id: renaissance.id,
        index: renaissance.index,
        name: renaissance.name,
        displayName: renaissance.displayName,
        shortDisplayName: renaissance.shortDisplayName
      })] : ["renaissance"]
    });
  }

  const missingExpectedIds = expectedIds.filter((id) => !eras.some((era) => era.id === id));
  if (missingExpectedIds.length) {
    issues.push({
      severity: "error",
      code: "missing_canonical_eras",
      message: `${context} must include every canonical era.`,
      records: missingExpectedIds
    });
  }
}

function validateEraEconomyProfiles(runtimeData: Pick<GameRuntimeData, "eras" | "economyDefinitions" | "eraEconomyProfiles">, issues: ImportIssue[], context: string) {
  const eraIds = new Set(runtimeData.eras.map((era) => era.id));
  const economyIds = new Set(runtimeData.economyDefinitions.map((definition) => definition.id));
  const expectedFixedHud = [...primaryHudEconomyIds];
  const profileEraIds = new Set(runtimeData.eraEconomyProfiles.map((profile) => profile.eraId));
  const duplicateProfileIds = duplicateIds(runtimeData.eraEconomyProfiles);
  const expectedEraIds = canonicalEraDefinitions.map((era) => era.id);
  const missingProfiles = expectedEraIds.filter((eraIdValue) => !profileEraIds.has(eraIdValue));

  if (runtimeData.eraEconomyProfiles.length !== canonicalEraDefinitions.length) {
    issues.push({
      severity: "error",
      code: "invalid_era_economy_profile_count",
      message: `${context} must include one eraEconomyProfile per canonical era.`,
      records: [`expected:${canonicalEraDefinitions.length}`, `received:${runtimeData.eraEconomyProfiles.length}`]
    });
  }

  if (duplicateProfileIds.length) {
    issues.push({ severity: "error", code: "duplicate_era_economy_profile_id", message: `${context} eraEconomyProfiles must use unique IDs.`, records: duplicateProfileIds });
  }

  if (missingProfiles.length) {
    issues.push({ severity: "error", code: "missing_era_economy_profiles", message: `${context} is missing era economy profiles.`, records: missingProfiles });
  }

  for (const profile of runtimeData.eraEconomyProfiles) {
    if (!eraIds.has(profile.eraId)) {
      issues.push({ severity: "error", code: "era_economy_profile_era_missing", message: "eraEconomyProfile.eraId must resolve to a canonical era.", records: [profile.id, profile.eraId] });
    }
    if (!profile.primaryEconomyId) {
      issues.push({ severity: "error", code: "era_economy_primary_id_missing", message: "eraEconomyProfile.primaryEconomyId is required so clients do not infer the primary economy from manualClickTarget.", records: [profile.id] });
    }
    if (profile.primaryEconomyId && !economyIds.has(profile.primaryEconomyId)) {
      issues.push({ severity: "error", code: "era_economy_primary_id_invalid", message: "eraEconomyProfile.primaryEconomyId must resolve to a canonical economy definition.", records: [profile.id, profile.primaryEconomyId] });
    }
    if (profile.primaryEconomyId && profile.activePrimaryEconomyId && profile.primaryEconomyId !== profile.activePrimaryEconomyId) {
      issues.push({ severity: "error", code: "era_economy_primary_id_mismatch", message: "eraEconomyProfile.primaryEconomyId must match activePrimaryEconomyId during the v9 compatibility window.", records: [profile.id, profile.primaryEconomyId, profile.activePrimaryEconomyId] });
    }
    if (profile.primaryEconomyId && !profile.primaryEconomyIds.includes(profile.primaryEconomyId)) {
      issues.push({ severity: "error", code: "era_economy_primary_id_not_listed", message: "eraEconomyProfile.primaryEconomyId must also be listed in primaryEconomyIds.", records: [profile.id, profile.primaryEconomyId] });
    }
    if (!economyIds.has(profile.activePrimaryEconomyId)) {
      issues.push({ severity: "error", code: "era_economy_primary_missing", message: "eraEconomyProfile.activePrimaryEconomyId must resolve to a canonical economy definition.", records: [profile.id, profile.activePrimaryEconomyId] });
    }
    if (!profile.primaryEconomyIds.includes(profile.activePrimaryEconomyId)) {
      issues.push({ severity: "error", code: "era_economy_primary_not_listed", message: "The active primary economy must also be listed in primaryEconomyIds.", records: [profile.id, profile.activePrimaryEconomyId] });
    }

    const displayOverrideEconomyIds = Object.keys(profile.displayOverrides ?? {});
    const allReferencedEconomyIds = [profile.primaryEconomyId, profile.activePrimaryEconomyId, profile.manualClickTarget, ...profile.primaryEconomyIds, ...profile.secondaryEconomyIds, ...profile.fixedHudSlots, ...profile.visibleHudEconomyIds, ...profile.hudSlots.map((slot) => slot.economyId), ...displayOverrideEconomyIds].filter(isNonEmptyString);
    const unresolvedEconomyIds = allReferencedEconomyIds.filter((economyId) => !economyIds.has(economyId));
    if (unresolvedEconomyIds.length) {
      issues.push({ severity: "error", code: "era_economy_profile_economy_missing", message: "Era economy profile references must resolve to canonical economy definitions.", records: [profile.id, ...new Set(unresolvedEconomyIds)] });
    }

    const duplicateHudEconomyIds = profile.visibleHudEconomyIds.filter((economyId, index, ids) => ids.indexOf(economyId) !== index);
    if (duplicateHudEconomyIds.length) {
      issues.push({ severity: "error", code: "duplicate_era_hud_economy", message: "Era HUD economy IDs must be unique inside a profile.", records: [profile.id, ...duplicateHudEconomyIds] });
    }

    const hudSlotEconomyIds = profile.hudSlots.map((slot) => slot.economyId);
    if (hudSlotEconomyIds.join("|") !== profile.visibleHudEconomyIds.join("|")) {
      issues.push({ severity: "error", code: "era_hud_slots_do_not_match_profile", message: "Era HUD slots must match visibleHudEconomyIds in order.", records: [profile.id] });
    }
    if (profile.fixedHudSlots.join("|") !== expectedFixedHud.join("|") || profile.visibleHudEconomyIds.join("|") !== expectedFixedHud.join("|") || hudSlotEconomyIds.join("|") !== expectedFixedHud.join("|")) {
      issues.push({ severity: "error", code: "era_hud_slots_not_fixed", message: "Era economy profiles must preserve the fixed five-slot HUD order and must not reorder top-bar economies.", records: [profile.id, ...hudSlotEconomyIds] });
    }
    if (profile.hudSlots.length !== 5 || profile.fixedHudSlots.length !== 5 || profile.visibleHudEconomyIds.length !== 5) {
      issues.push({ severity: "error", code: "fixed_hud_slot_count_invalid", message: "Era economy profiles must expose exactly five fixed core HUD slots.", records: [profile.id] });
    }
    if (profile.visibilityRules.useEraHud !== false || profile.visibilityRules.fixedCoreHud !== true) {
      issues.push({ severity: "error", code: "era_hud_visibility_rule_invalid", message: "Era economy profiles must not own top-bar ordering; fixedCoreHud must be true.", records: [profile.id] });
    }

    const duplicateHudOrders = duplicateNumbers(profile.hudSlots.map((slot) => slot.order));
    if (duplicateHudOrders.length) {
      issues.push({ severity: "error", code: "duplicate_era_hud_slot_order", message: "Era HUD slot order values must be unique inside a profile.", records: [profile.id, ...duplicateHudOrders.map(String)] });
    }
  }
}

function validateEconomyDefaults(runtimeData: Pick<GameRuntimeData, "economyDefinitions" | "eraEconomyProfiles" | "balance">, issues: ImportIssue[], context: string) {
  const byId = new Map(runtimeData.economyDefinitions.map((definition) => [definition.id, definition]));
  const labor = byId.get("ECON-LABOR");
  const credits = byId.get("ECON-CREDITS");
  const population = byId.get("ECON-POPULATION");
  const research = byId.get("ECON-RESEARCH");
  const premiumCrystals = byId.get("ECON-PREMIUM-CRYSTALS");
  const civilizationPoints = byId.get("ECON-CIVILIZATION-POINTS");
  const survival = runtimeData.eraEconomyProfiles.find((profile) => profile.eraId === "survival");

  if (labor?.startingAmount !== 0) {
    issues.push({ severity: "error", code: "labor_starting_amount_invalid", message: `${context} ECON-LABOR must start at 0.`, records: [`received:${labor?.startingAmount ?? "missing"}`] });
  }
  if (labor?.manualClickTarget !== true) {
    issues.push({ severity: "error", code: "labor_click_target_invalid", message: `${context} ECON-LABOR must remain the manual click target.`, records: ["ECON-LABOR"] });
  }
  if (labor?.startingRate !== 1) {
    issues.push({ severity: "error", code: "labor_base_passive_rate_invalid", message: `${context} ECON-LABOR must publish the approved base passive Labor rate of +1/sec.`, records: [`received:${labor?.startingRate ?? "missing"}`] });
  }
  const laborIconKey = String(labor?.iconKey ?? "");
  const creditsIconKey = String(credits?.iconKey ?? "");
  const forbiddenLaborIconKeys = [creditsIconKey, "nature_leaf"].filter(Boolean);
  if (laborIconKey !== "economy_labor" || forbiddenLaborIconKeys.includes(laborIconKey)) {
    issues.push({ severity: "error", code: "labor_icon_key_invalid", message: `${context} ECON-LABOR must use its own labor icon key and must not use Credits or Nature icon semantics.`, records: [`labor:${labor?.iconKey ?? "missing"}`, `credits:${credits?.iconKey ?? "missing"}`] });
  }
  if (credits?.startingAmount !== 0 || credits?.startingRate !== 0 || credits?.manualClickTarget === true || credits?.iconKey !== "economy_credits") {
    issues.push({ severity: "error", code: "credits_starting_value_invalid", message: `${context} Credits must be visible from Survival but start at 0, have no passive Survival rate, and must not be the manual click economy.`, records: ["ECON-CREDITS"] });
  }
  if (population?.startingAmount !== 5 || runtimeData.balance.startingPopulation !== 5) {
    issues.push({ severity: "error", code: "population_starting_amount_invalid", message: `${context} Population must use the Survival starter default of 5.`, records: [`economy:${population?.startingAmount ?? "missing"}`, `balance:${runtimeData.balance.startingPopulation}`] });
  }
  if (population?.startingRate !== 0 || population?.spendable !== false || population?.premium !== false || population?.manualClickTarget === true) {
    issues.push({ severity: "error", code: "population_semantics_invalid", message: `${context} Population must be non-premium, non-clicked, non-spendable workforce capacity with no starting rate.`, records: ["ECON-POPULATION"] });
  }
  if (research?.startingAmount !== 0 || research?.startingRate !== 0) {
    issues.push({ severity: "error", code: "research_starting_value_invalid", message: `${context} ECON-RESEARCH must start at 0 with no starting rate.`, records: ["ECON-RESEARCH"] });
  }
  if (premiumCrystals?.startingAmount !== 0 || premiumCrystals?.startingRate !== 0) {
    issues.push({ severity: "error", code: "premium_crystals_starting_value_invalid", message: `${context} ECON-PREMIUM-CRYSTALS must start at 0 with no starting rate.`, records: ["ECON-PREMIUM-CRYSTALS"] });
  }
  if (civilizationPoints?.startingAmount !== 0 || civilizationPoints?.startingRate !== 0) {
    issues.push({ severity: "error", code: "civilization_points_starting_value_invalid", message: `${context} ECON-CIVILIZATION-POINTS must start at 0 with no starting rate.`, records: ["ECON-CIVILIZATION-POINTS"] });
  }
  if (survival?.primaryEconomyId !== "ECON-LABOR" || survival?.activePrimaryEconomyId !== "ECON-LABOR" || survival?.manualClickTarget !== "ECON-LABOR" || survival?.visibleHudEconomyIds.join("|") !== primaryHudEconomyIds.join("|")) {
    issues.push({ severity: "error", code: "survival_economy_profile_invalid", message: `${context} Survival must use Labor as primary/click economy and expose the fixed five-slot HUD including Credits in slot 2.`, records: [survival?.id ?? "missing_survival_profile"] });
  }
}

function validateResourceEconomyContracts(
  runtimeData: Pick<GameRuntimeData, "economyDefinitions" | "economyBehaviorContracts" | "eraEconomyProfiles" | "resourceProducerDefinitions" | "buildingResourceEffects" | "economyScopeRules" | "economyTransactionReasons" | "economyRateBreakdownDefinitions" | "offlineProgressionPolicies" | "economyCalculationRules">,
  issues: ImportIssue[],
  context: string
) {
  const economyIds = new Set(runtimeData.economyDefinitions.map((definition) => definition.id));
  const fiveHudIds = ["ECON-LABOR", "ECON-CREDITS", "ECON-POPULATION", "ECON-RESEARCH", "ECON-PREMIUM-CRYSTALS"];
  const contractByEconomy = new Map(runtimeData.economyBehaviorContracts.map((contract) => [contract.economyId, contract]));
  const producerIds = new Set(runtimeData.resourceProducerDefinitions.map((producer) => producer.id));
  const validScopes = new Set(["civilization", "galaxy", "sector", "system", "planet", "settlement"]);
  const validModes = new Set(["per_click", "per_second", "per_minute", "instant_grant", "capacity", "multiplier", "conversion"]);

  for (const economyId of fiveHudIds) {
    const contract = contractByEconomy.get(economyId);
    if (!contract) {
      issues.push({ severity: "error", code: "economy_behavior_contract_missing", message: `${context} must publish a behavior contract for every permanent HUD economy.`, records: [economyId] });
    }
  }

  if (runtimeData.economyBehaviorContracts.length !== fiveHudIds.length) {
    issues.push({ severity: "error", code: "economy_behavior_contract_count_invalid", message: `${context} must publish exactly five permanent HUD economy behavior contracts.`, records: [`received:${runtimeData.economyBehaviorContracts.length}`] });
  }

  const labor = contractByEconomy.get("ECON-LABOR");
  if (labor && (labor.behaviorType !== "produced_currency" || labor.basePassiveRate !== 1 || !labor.manualProduction.target || !labor.automatedProduction.aiAgentTarget || !labor.offlineProgressEligible || labor.canGoNegative)) {
    issues.push({ severity: "error", code: "labor_behavior_contract_invalid", message: "Labor contract must define manual click, +1/sec base passive, AI Agent target, offline eligibility, and non-negative balances.", records: ["ECON-LABOR"] });
  }

  const credits = contractByEconomy.get("ECON-CREDITS");
  if (credits && (credits.basePassiveRate !== 0 || credits.manualProduction.enabled || credits.automatedProduction.aiAgentTarget || credits.canGoNegative)) {
    issues.push({ severity: "error", code: "credits_behavior_contract_invalid", message: "Credits must not have default passive, manual click, AI Agent output, or negative balances.", records: ["ECON-CREDITS"] });
  }

  const population = contractByEconomy.get("ECON-POPULATION");
  if (population && (population.behaviorType !== "capacity_count" || population.startingAmount !== 5 || population.spendable || !population.integerOnly || !population.capacityResource || population.manualProduction.enabled)) {
    issues.push({ severity: "error", code: "population_behavior_contract_invalid", message: "Population must be integer capacity_count, start at 5, non-clicked, and non-spendable by default.", records: ["ECON-POPULATION"] });
  }

  const research = contractByEconomy.get("ECON-RESEARCH");
  if (research && (research.behaviorType !== "knowledge_currency" || research.basePassiveRate !== 0 || research.manualProduction.enabled || research.startingAmount !== 0)) {
    issues.push({ severity: "error", code: "research_behavior_contract_invalid", message: "Research must be a non-clicked knowledge currency with no default passive production.", records: ["ECON-RESEARCH"] });
  }

  const premium = contractByEconomy.get("ECON-PREMIUM-CRYSTALS");
  if (premium && (premium.behaviorType !== "premium_currency" || premium.basePassiveRate !== 0 || premium.offlineProgressEligible || premium.buildingProduction.enabled || !premium.purchaseProduction.serverAuthoritativeRequired || !premium.integerOnly)) {
    issues.push({ severity: "error", code: "premium_behavior_contract_invalid", message: "Premium Crystals must be integer premium currency with no generic passive/building/offline production and server-authoritative purchases.", records: ["ECON-PREMIUM-CRYSTALS"] });
  }

  for (const producer of runtimeData.resourceProducerDefinitions) {
    if (!economyIds.has(producer.economyId)) issues.push({ severity: "error", code: "producer_economy_missing", message: "Resource producer economyId must resolve.", records: [producer.id, producer.economyId] });
    if (!validScopes.has(producer.scope)) issues.push({ severity: "error", code: "producer_scope_invalid", message: "Resource producer scope is invalid.", records: [producer.id, producer.scope] });
    if (!validModes.has(producer.productionMode)) issues.push({ severity: "error", code: "producer_mode_invalid", message: "Resource producer productionMode is invalid.", records: [producer.id, producer.productionMode] });
    if (producer.economyId === "ECON-CREDITS" && producer.sourceType === "base_system") issues.push({ severity: "error", code: "credits_base_producer_forbidden", message: "Credits must not have a base_system passive fallback producer.", records: [producer.id] });
    if (producer.economyId === "ECON-PREMIUM-CRYSTALS" && (producer.sourceType === "building" || producer.offlineEligible)) issues.push({ severity: "error", code: "premium_unsafe_producer", message: "Premium Crystals must not use generic building or offline producers.", records: [producer.id] });
  }

  for (const effect of runtimeData.buildingResourceEffects) {
    if (!economyIds.has(effect.economyId)) issues.push({ severity: "error", code: "building_effect_economy_missing", message: "Building resource effects must reference canonical economy IDs.", records: [effect.id, effect.economyId] });
    if (!validScopes.has(effect.scope)) issues.push({ severity: "error", code: "building_effect_scope_invalid", message: "Building resource effect scope is invalid.", records: [effect.id, effect.scope] });
    if (!producerIds.has(`producer_${effect.id}`)) issues.push({ severity: "error", code: "building_effect_producer_missing", message: "Every building resource effect must have a matching producer definition.", records: [effect.id] });
    if (effect.economyId === "ECON-POPULATION" && !["capacity_increase", "instant_grant", "growth_rate"].includes(effect.effectKind)) issues.push({ severity: "error", code: "population_effect_kind_invalid", message: "Population building effects must distinguish capacity, grant, or growth.", records: [effect.id, effect.effectKind] });
  }

  for (const profile of runtimeData.eraEconomyProfiles) {
    if (profile.fixedHudSlots.join("|") !== fiveHudIds.join("|")) issues.push({ severity: "error", code: "era_contract_hud_order_invalid", message: "Era profiles must preserve fixed HUD order.", records: [profile.id] });
    if (!profile.permittedProducerSystems.length) issues.push({ severity: "error", code: "era_permitted_producers_missing", message: "Era profiles must declare permitted producer systems.", records: [profile.id] });
    const creditsOverride = profile.displayOverrides["ECON-CREDITS"];
    if (!creditsOverride?.displayName || !creditsOverride.iconKey) issues.push({ severity: "error", code: "credits_era_presentation_missing", message: "Every era profile must publish Credits presentation overrides without changing ECON-CREDITS.", records: [profile.id] });
  }

  for (const policy of runtimeData.offlineProgressionPolicies) {
    if (!economyIds.has(policy.economyId)) issues.push({ severity: "error", code: "offline_policy_economy_missing", message: "Offline policy economyId must resolve.", records: [policy.id, policy.economyId] });
  }
  const premiumOffline = runtimeData.offlineProgressionPolicies.find((policy) => policy.economyId === "ECON-PREMIUM-CRYSTALS");
  if (premiumOffline?.eligible) issues.push({ severity: "error", code: "premium_offline_forbidden", message: "Premium Crystals must never be eligible for generic offline progression.", records: [premiumOffline.id] });

  const premiumPurchaseReason = runtimeData.economyTransactionReasons.find((reason) => reason.id === "premium_purchase");
  if (!premiumPurchaseReason?.serverAuthoritativeRequired) issues.push({ severity: "error", code: "premium_purchase_reason_invalid", message: "Premium purchase transaction reason must require server authority.", records: ["premium_purchase"] });
  if (!runtimeData.economyRateBreakdownDefinitions.every((definition) => economyIds.has(definition.economyId))) issues.push({ severity: "error", code: "rate_breakdown_economy_missing", message: "Rate breakdown definitions must reference economy IDs.", records: runtimeData.economyRateBreakdownDefinitions.map((definition) => definition.id) });
  if (!runtimeData.economyCalculationRules.rounding.integerEconomyIds.includes("ECON-POPULATION") || !runtimeData.economyCalculationRules.rounding.integerEconomyIds.includes("ECON-PREMIUM-CRYSTALS")) {
    issues.push({ severity: "error", code: "integer_rounding_rules_missing", message: "Population and Premium Crystals must be integer-valued.", records: [runtimeData.economyCalculationRules.id] });
  }
}

function validateMobileClientProfiles(runtimeData: Pick<GameRuntimeData, "clientProfiles">, issues: ImportIssue[]) {
  const expectedHud = [...primaryHudEconomyIds];
  for (const profileName of ["ios", "android"] as const) {
    const profile = runtimeData.clientProfiles[profileName];
    if (!profile) {
      issues.push({ severity: "error", code: "mobile_profile_missing", message: `clientProfiles.${profileName} is required for mobile presentation exports.`, records: [profileName] });
      continue;
    }
    if (profile.platform !== profileName) {
      issues.push({ severity: "error", code: "mobile_profile_platform_invalid", message: "Mobile profile platform must match its profile key.", records: [profileName, String(profile.platform ?? "missing")] });
    }
    if (profile.orientation?.primary !== "landscape" || !profile.orientation?.supported.includes("landscape-left") || !profile.orientation?.supported.includes("landscape-right")) {
      issues.push({ severity: "error", code: "mobile_orientation_invalid", message: "Mobile gameplay profiles must define landscape-left and landscape-right support.", records: [profileName] });
    }
    if (!profile.safeAreaPolicy || profile.safeAreaPolicy.minimumEdgePadding < 16 || !profile.safeAreaPolicy.supportsCameraCutout || !profile.safeAreaPolicy.supportsHomeIndicator) {
      issues.push({ severity: "error", code: "mobile_safe_area_missing", message: "Mobile profiles must define notch/cutout/home-indicator safe-area metadata.", records: [profileName] });
    }
    if ((profile.supportedDeviceClasses?.length ?? 0) < 5 || !profile.supportedDeviceClasses?.some((item) => item.id === "phone_compact") || !profile.supportedDeviceClasses?.some((item) => item.id === "tablet_large")) {
      issues.push({ severity: "error", code: "mobile_device_classes_missing", message: "Mobile profiles must define phone and tablet presentation classes.", records: [profileName] });
    }
    if (!profile.touchProfile || profile.touchProfile.minimumTouchTarget < 44 || profile.touchProfile.touchPadding < 0) {
      issues.push({ severity: "error", code: "mobile_touch_profile_invalid", message: "Mobile profiles must define approved touch target and padding rules.", records: [profileName] });
    }
    if (!profile.hudProfile || profile.hudProfile.economyOrder.join("|") !== expectedHud.join("|") || profile.hudProfile.minimumTouchTarget < 44) {
      issues.push({ severity: "error", code: "mobile_hud_profile_invalid", message: "Mobile HUD profile must preserve fixed economy order and mobile touch targets.", records: [profileName, ...(profile.hudProfile?.economyOrder ?? [])] });
    }
    if (profile.primaryHudResources?.join("|") !== expectedHud.join("|") || profile.primaryHudSlots?.map((slot) => slot.economyId).join("|") !== expectedHud.join("|")) {
      issues.push({ severity: "error", code: "mobile_fixed_hud_order_invalid", message: "Mobile client profiles must inherit the canonical fixed HUD order.", records: [profileName, ...(profile.primaryHudResources ?? [])] });
    }
    if (!profile.assetDensityProfile || !profile.assetDensityProfile.requiredScales.includes("1x") || !profile.assetDensityProfile.requiredScales.includes("2x") || !profile.assetDensityProfile.requiredScales.includes("3x")) {
      issues.push({ severity: "error", code: "mobile_asset_density_missing", message: "Mobile profiles must define 1x/2x/3x asset density requirements.", records: [profileName] });
    }
    if (!profile.authenticationProfile || profile.authenticationProfile.accountDeletionTracked !== true || profile.authenticationProfile.secretsExported !== false) {
      issues.push({ severity: "error", code: "mobile_auth_profile_invalid", message: "Mobile auth profile must track account deletion and must not export secrets.", records: [profileName] });
    }
    if (!profile.purchaseProfile || profile.purchaseProfile.purchaseVerificationRequired !== true || profile.purchaseProfile.serverAuthoritative !== true || profile.purchaseProfile.secretsExported !== false) {
      issues.push({ severity: "error", code: "mobile_purchase_profile_invalid", message: "Mobile purchase profile must require verification and must not export store secrets.", records: [profileName] });
    }
    if ((profile.mobileAssetRequirements?.length ?? 0) < 8) {
      issues.push({ severity: "error", code: "mobile_asset_requirements_missing", message: "Mobile profiles must expose app brand/loading/store-art asset requirements.", records: [profileName] });
    }
    const serialized = JSON.stringify(profile);
    if (/\/Users\/|studio-private:\/\/|SUPABASE|SERVICE_ROLE|PRIVATE_KEY|clientSecret|apiKey|storeSecret/i.test(serialized)) {
      issues.push({ severity: "error", code: "mobile_profile_private_leak", message: "Mobile presentation profiles must not expose private paths, credentials, or secrets.", records: [profileName] });
    }
  }
}

function validateAiAgents(runtimeData: Pick<GameRuntimeData, "aiAgents" | "aiAgentVariants" | "aiAgentPersonalities" | "aiAgentAnimationProfiles" | "automationPresentation" | "defaultAiAgentId" | "aiAgentSaveSchema" | "assets">, issues: ImportIssue[]) {
  const agents = runtimeData.aiAgents;
  const agentIds = new Set(agents.map((agent) => agent.id));
  const variants = runtimeData.aiAgentVariants;
  const variantIds = new Set(variants.map((variant) => variant.id));
  const safePublishedArtKeys = new Set<string>(aiAgentSafePublishedDefaultArtKeys);
  const personalityIds = new Set(runtimeData.aiAgentPersonalities.map((personality) => personality.id));
  const animationProfileIds = new Set(runtimeData.aiAgentAnimationProfiles.map((profile) => profile.id));
  const assetsByKey = new Set(runtimeData.assets.flatMap((asset) => [asset.artKey, asset.iconKey].filter(Boolean) as string[]));
  const defaults = agents.filter((agent) => agent.defaultForNewPlayers);

  if (defaults.length !== 1) {
    issues.push({ severity: "error", code: "ai_agent_default_count_invalid", message: "Runtime must include exactly one default AI Agent.", records: defaults.map((agent) => agent.id) });
  }
  if (!agentIds.has(runtimeData.defaultAiAgentId)) {
    issues.push({ severity: "error", code: "ai_agent_default_missing", message: "defaultAiAgentId must resolve to an AI Agent.", records: [runtimeData.defaultAiAgentId] });
  }
  const defaultAgent = agents.find((agent) => agent.id === runtimeData.defaultAiAgentId);
  if (!defaultAgent || !defaultAgent.defaultForNewPlayers || defaultAgent.status !== "available" || defaultAgent.approvalState !== "approved" || defaultAgent.publishState !== "published") {
    issues.push({ severity: "error", code: "ai_agent_default_not_published", message: "Default AI Agent must be available, approved, published, and defaultForNewPlayers.", records: [runtimeData.defaultAiAgentId] });
  }
  if (runtimeData.aiAgentSaveSchema.selectedAiAgentIdDefault !== runtimeData.defaultAiAgentId || runtimeData.aiAgentSaveSchema.fields.selectedAiAgentId.default !== runtimeData.defaultAiAgentId) {
    issues.push({ severity: "error", code: "ai_agent_save_default_invalid", message: "AI Agent save schema must default selectedAiAgentId to defaultAiAgentId.", records: [runtimeData.aiAgentSaveSchema.id, runtimeData.defaultAiAgentId] });
  }
  if (!variantIds.has(defaultAiAgentVariantId)) {
    issues.push({ severity: "error", code: "ai_agent_default_variant_missing", message: "Runtime must publish the default AI Agent variant.", records: [defaultAiAgentVariantId] });
  }
  if (runtimeData.aiAgentSaveSchema.selectedAiAgentVariantIdDefault !== defaultAiAgentVariantId || runtimeData.aiAgentSaveSchema.fields.selectedAiAgentVariantId.default !== defaultAiAgentVariantId) {
    issues.push({ severity: "error", code: "ai_agent_variant_save_default_invalid", message: "AI Agent save schema must default selectedAiAgentVariantId to the default variant.", records: [runtimeData.aiAgentSaveSchema.id, defaultAiAgentVariantId] });
  }
  if (!runtimeData.aiAgentSaveSchema.fields.unlockedAiAgentIds.default.includes(runtimeData.defaultAiAgentId) || !runtimeData.aiAgentSaveSchema.fields.unlockedAiAgentVariantIds.default.includes(defaultAiAgentVariantId)) {
    issues.push({ severity: "error", code: "ai_agent_unlock_defaults_invalid", message: "New-player AI Agent unlock defaults must include the default agent and default variant.", records: [runtimeData.defaultAiAgentId, defaultAiAgentVariantId] });
  }
  if (runtimeData.automationPresentation.systemId !== "automation" || runtimeData.automationPresentation.displayName !== "AI Agent" || runtimeData.automationPresentation.powerLabel !== "Labor Assistance") {
    issues.push({ severity: "error", code: "automation_presentation_invalid", message: "Automation presentation must preserve automation system identity while exposing AI Agent labels.", records: [runtimeData.automationPresentation.id] });
  }

  for (const profile of runtimeData.aiAgentAnimationProfiles) {
    if (profile.visibleOnlyBehavior !== "pause_when_hidden") {
      issues.push({ severity: "error", code: "ai_agent_animation_visibility_invalid", message: "AI Agent blink profiles must pause when hidden for client performance.", records: [profile.id] });
    }
    for (const state of ["idle", "blink", "working", "thinking", "researching", "celebrating", "warning", "offline"] as const) {
      if (!profile.allowedStates.includes(state)) {
        issues.push({ severity: "error", code: "ai_agent_animation_state_missing", message: "AI Agent animation profile is missing a required visual state.", records: [profile.id, state] });
      }
    }
  }

  for (const agent of agents) {
    if (!personalityIds.has(agent.personalityId)) {
      issues.push({ severity: "error", code: "ai_agent_personality_missing", message: "AI Agent personalityId must resolve.", records: [agent.id, agent.personalityId] });
    }
    if (!animationProfileIds.has(agent.animationProfileId)) {
      issues.push({ severity: "error", code: "ai_agent_animation_profile_missing", message: "AI Agent animationProfileId must resolve.", records: [agent.id, agent.animationProfileId] });
    }
    if (Object.keys(agent.gameplayModifiers).length) {
      issues.push({ severity: "error", code: "ai_agent_gameplay_modifier_forbidden", message: "Cosmetic AI Agents must not define gameplay modifiers in v1.0.", records: [agent.id] });
    }
    if (!variantIds.has(agent.baseVariantId)) {
      issues.push({ severity: "error", code: "ai_agent_base_variant_missing", message: "AI Agent baseVariantId must resolve to a published variant.", records: [agent.id, agent.baseVariantId] });
    }
    for (const variantId of agent.availableVariantIds) {
      if (!variantIds.has(variantId)) {
        issues.push({ severity: "error", code: "ai_agent_available_variant_missing", message: "AI Agent availableVariantIds must resolve to published variants.", records: [agent.id, variantId] });
      }
    }
    if (agent.presentation.fallbackVariantId && !variantIds.has(agent.presentation.fallbackVariantId)) {
      issues.push({ severity: "error", code: "ai_agent_fallback_variant_missing", message: "AI Agent presentation fallbackVariantId must resolve.", records: [agent.id, agent.presentation.fallbackVariantId] });
    }
    const keyValues = [
      agent.headAssetKey,
      agent.eyesOpenAssetKey,
      agent.eyesBlinkAssetKey,
      agent.eyesClosedAssetKey,
      ...Object.values(agent.assetKeys).filter(Boolean),
      ...Object.values(agent.expressionAssets).filter(Boolean)
    ];
    for (const assetKey of keyValues) {
      if (!assetKey) {
        issues.push({ severity: "error", code: "ai_agent_asset_key_missing", message: "AI Agent asset keys must be populated or explicitly marked missing.", records: [agent.id] });
        continue;
      }
      if (!assetsByKey.has(assetKey) && !safePublishedArtKeys.has(assetKey) && agent.assetReadiness[assetKey] !== "missing") {
        issues.push({ severity: "error", code: "ai_agent_asset_reference_unresolved", message: "AI Agent asset keys must resolve to runtime assets or be explicitly marked missing.", records: [agent.id, assetKey] });
      }
    }
    const profile = runtimeData.aiAgentAnimationProfiles.find((item) => item.id === agent.animationProfileId);
    if (profile && (!agent.eyesOpenAssetKey || !agent.eyesBlinkAssetKey)) {
      issues.push({ severity: "error", code: "ai_agent_blink_assets_missing", message: "Blink animation profile requires valid open and blink asset keys.", records: [agent.id, profile.id] });
    }
  }

  for (const variant of variants) {
    if (!agentIds.has(variant.agentId)) {
      issues.push({ severity: "error", code: "ai_agent_variant_agent_missing", message: "AI Agent variant agentId must resolve to a published agent.", records: [variant.id, variant.agentId] });
    }
    if (variant.progressionMapping.cosmeticIdentity !== true || variant.progressionMapping.automationPowerSource !== "automation_upgrade_levels") {
      issues.push({ severity: "error", code: "ai_agent_variant_progression_invalid", message: "AI Agent variants must remain cosmetic and keep automation levels as the Labor Assistance power source.", records: [variant.id] });
    }
    for (const [slot, assetKey] of Object.entries(variant.assetKeys)) {
      if (!assetKey) {
        issues.push({ severity: "error", code: "ai_agent_variant_asset_key_missing", message: "AI Agent variant required asset keys must be populated.", records: [variant.id, slot] });
        continue;
      }
      if (!assetsByKey.has(assetKey) && !safePublishedArtKeys.has(assetKey)) {
        issues.push({ severity: "error", code: "ai_agent_variant_asset_reference_unresolved", message: "AI Agent variant asset keys must resolve to runtime assets.", records: [variant.id, slot, assetKey] });
      }
    }
    for (const [state, assetKey] of Object.entries(variant.safeFallbacks)) {
      if (assetKey && !assetsByKey.has(assetKey) && !safePublishedArtKeys.has(assetKey)) {
        issues.push({ severity: "error", code: "ai_agent_variant_fallback_unresolved", message: "AI Agent variant safe fallbacks must resolve to runtime assets.", records: [variant.id, state, assetKey] });
      }
    }
    const serialized = JSON.stringify(variant);
    if (/\/Users\/|studio-private:\/\/|\.psd|\.psb|\.ai|SUPABASE|SERVICE_ROLE|PRIVATE_KEY/i.test(serialized)) {
      issues.push({ severity: "error", code: "ai_agent_variant_private_leak", message: "AI Agent variants must not expose private paths, source masters, or credentials.", records: [variant.id] });
    }
  }
}

function validateBuildingTaxonomyRuntime(runtimeData: Pick<GameRuntimeData, "buildingTaxonomy" | "buildingLibrary" | "buildingClassifications">, issues: ImportIssue[]) {
  const familyIds = new Set(runtimeData.buildingTaxonomy.map((family) => family.id));
  const subcategoryIdsByFamily = new Map(runtimeData.buildingTaxonomy.map((family) => [family.id, new Set(family.subcategories.map((subcategory) => subcategory.id))]));
  const familyOrders = runtimeData.buildingTaxonomy.map((family) => family.displayOrder);
  const assignedBuildingIds = new Set<string>();
  const duplicateBuildingIds = new Set<string>();

  if (runtimeData.buildingTaxonomy.length !== 40) {
    issues.push({ severity: "error", code: "building_taxonomy_family_count", message: "Canonical runtime must publish exactly 40 building taxonomy families.", records: runtimeData.buildingTaxonomy.map((family) => family.id) });
  }
  if (runtimeData.buildingLibrary.length < 500) {
    issues.push({ severity: "error", code: "building_library_count", message: "Canonical runtime must publish at least 500 building library definitions for future-era scaffolding.", records: [`${runtimeData.buildingLibrary.length}`] });
  }
  if (new Set(familyOrders).size !== familyOrders.length) {
    issues.push({ severity: "error", code: "building_taxonomy_order_duplicate", message: "Building taxonomy families must have unique displayOrder values.", records: runtimeData.buildingTaxonomy.map((family) => family.id) });
  }
  for (const family of runtimeData.buildingTaxonomy) {
    if (family.subcategories.length < 2) {
      issues.push({ severity: "error", code: "building_taxonomy_subcategory_missing", message: "Every building taxonomy family must include multiple subcategories.", records: [family.id] });
    }
    const subcategoryOrders = family.subcategories.map((subcategory) => subcategory.displayOrder);
    if (new Set(subcategoryOrders).size !== subcategoryOrders.length) {
      issues.push({ severity: "error", code: "building_taxonomy_subcategory_order_duplicate", message: "Building taxonomy subcategory displayOrder values must be unique inside a family.", records: [family.id] });
    }
  }
  for (const definition of runtimeData.buildingLibrary) {
    const family = runtimeData.buildingTaxonomy.find((row) => row.id === definition.familyId);
    if (!familyIds.has(definition.familyId) || !family) {
      issues.push({ severity: "error", code: "building_library_family_missing", message: "Building library familyId must resolve to the canonical taxonomy.", records: [definition.id, definition.familyId] });
      continue;
    }
    if (!subcategoryIdsByFamily.get(definition.familyId)?.has(definition.subcategoryId)) {
      issues.push({ severity: "error", code: "building_library_subcategory_missing", message: "Building library subcategoryId must resolve inside its family.", records: [definition.id, definition.subcategoryId] });
    }
    if (!definition.visualAssetRequirements.length || !definition.animationRequirements.length || !definition.soundRequirements.length) {
      issues.push({ severity: "error", code: "building_library_asset_requirements_missing", message: "Building library entries must include visual, animation, and sound production requirements.", records: [definition.id] });
    }
  }
  for (const classification of runtimeData.buildingClassifications) {
    if (assignedBuildingIds.has(classification.buildingId)) duplicateBuildingIds.add(classification.buildingId);
    assignedBuildingIds.add(classification.buildingId);
    const family = runtimeData.buildingTaxonomy.find((row) => row.id === classification.primaryFamilyId);
    if (!familyIds.has(classification.primaryFamilyId) || !family) {
      issues.push({ severity: "error", code: "building_classification_family_missing", message: "Building primaryFamilyId must resolve to the canonical taxonomy.", records: [classification.id, classification.primaryFamilyId] });
      continue;
    }
    if (!family.subcategories.some((subcategory) => subcategory.id === classification.subcategoryId)) {
      issues.push({ severity: "error", code: "building_classification_subcategory_missing", message: "Building subcategoryId must resolve inside its primary family.", records: [classification.id, classification.subcategoryId] });
    }
  }
  if (duplicateBuildingIds.size) {
    issues.push({ severity: "error", code: "building_classification_duplicate", message: "Every building must have exactly one primary taxonomy classification.", records: [...duplicateBuildingIds] });
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function checksumFor(value: unknown) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function publicAsset(asset: AssetDefinition): AssetDefinition {
  const {
    sourceFileName: _sourceFileName,
    sourceExtension: _sourceExtension,
    mimeType: _mimeType,
    fileSizeBytes: _fileSizeBytes,
    storagePath: _storagePath,
    aliases: _aliases,
    tags: _tags,
    importedFrom: _importedFrom,
    importedAt: _importedAt,
    updatedAt: _updatedAt,
    variants: _variants,
    derivatives: _derivatives,
    usageReferences: _usageReferences,
    ...safeAsset
  } = asset;
  return {
    ...safeAsset,
    notes: "",
    platformMappings: {
      ...(asset.platformMappings.roblox?.assetId ? { roblox: { assetId: asset.platformMappings.roblox.assetId } } : {}),
      ...(asset.platformMappings.web?.path && !asset.platformMappings.web.path.includes("/Users/") && !asset.platformMappings.web.path.includes("studio-private://")
        ? {
            web: {
              path: asset.platformMappings.web.path,
              ...(asset.platformMappings.web.status ? { status: asset.platformMappings.web.status } : {}),
              ...(asset.platformMappings.web.publishedAt ? { publishedAt: asset.platformMappings.web.publishedAt } : {})
            }
          }
        : {})
    }
  };
}

function withPublicMetadata<T extends { metadata: RuntimeMetadata }>(
  payload: T,
  validationStatus: RuntimeMetadata["validationStatus"]
): T {
  const withoutChecksum = {
    ...payload,
    metadata: {
      ...payload.metadata,
      checksum: "",
      accessLevel: "public-published" as const,
      environment: "published",
      validationStatus
    }
  };
  return {
    ...withoutChecksum,
    metadata: {
      ...withoutChecksum.metadata,
      checksum: checksumFor(withoutChecksum)
    }
  };
}

export async function buildCanonicalRuntimeExportPayload(): Promise<CanonicalRuntimeExportPayload> {
  const sorted = sortRuntimeData(await getGameRuntimeData());
  const validation = validateGameRuntimeData(sorted);
  const safePayload: CanonicalRuntimeExportPayload = {
    ...sorted,
    assets: sorted.assets.map(publicAsset),
    identityRelationshipGraph: sorted.identityRelationshipGraph ? toIdentityRelationshipRuntimeExport(sorted.identityRelationshipGraph) : undefined
  };
  return withPublicMetadata(safePayload, validation.status);
}

export function validateGameRuntimeData(runtimeData: GameRuntimeData | CanonicalRuntimeExportPayload) {
  const issues: ImportIssue[] = [];
  const eraIds = new Set(runtimeData.eras.map((row) => row.id));
  const categoryIds = new Set(runtimeData.upgradeCategories.map((row) => row.id));
  const economyIds = new Set(runtimeData.economyDefinitions.map((row) => row.id));
  const resourceIds = new Set(runtimeData.resources.map((row) => row.id));
  const upgradeIds = new Set(runtimeData.upgrades.map((row) => row.id));

  for (const issue of validateEnvironmentComposerContract(runtimeData.environmentComposerContract)) {
    issues.push({
      severity: issue.severity,
      code: `environment_composer_${issue.code}`,
      message: issue.message,
      records: issue.records
    });
  }
  for (const issue of validateDesignLanguage(runtimeData.designLanguage).issues) {
    issues.push({ severity: issue.severity, code: `design_language_${issue.code}`, message: issue.message, records: issue.records });
  }
  for (const issue of validateComponentLibrary(runtimeData.componentLibrary).issues) {
    issues.push({ severity: issue.severity, code: `component_library_${issue.code}`, message: issue.message, records: issue.records });
  }
  for (const issue of validateScreenTemplateLibrary(runtimeData.screenTemplateLibrary).issues) {
    issues.push({ severity: issue.severity, code: `screen_template_library_${issue.code}`, message: issue.message, records: issue.records });
  }
  for (const issue of validateAssetProductionRuntimeManifest(runtimeData.assetProductionRuntime).issues) {
    issues.push({ severity: issue.severity, code: `asset_production_${issue.code}`, message: issue.message, records: issue.records });
  }
  const creatureValidation = validateCreatureSystem({
    species: runtimeData.species,
    occurrences: runtimeData.speciesOccurrences,
    resourceYields: runtimeData.speciesResourceYields,
    artProfiles: runtimeData.creatureArtProfiles,
    animationProfiles: runtimeData.creatureAnimationProfiles,
    audioProfiles: runtimeData.creatureAudioProfiles,
    contract: runtimeData.creatureGeneratorContract,
    resourceIds
  });
  for (const issue of creatureValidation.issues) {
    issues.push({ severity: issue.severity, code: `creature_${issue.code}`, message: issue.message, records: issue.records });
  }
  for (const message of validateSpeciesPlateRuntimeData(runtimeData.speciesPlates)) {
    issues.push({ severity: "error", code: "species_plate_runtime_invalid", message, records: ["speciesPlates"] });
  }
  if (!runtimeData.planetDetailScreen) {
    issues.push({ severity: "error", code: "planet_detail_screen_missing", message: "Planet Detail Screen runtime contract is required.", records: ["planetDetailScreen"] });
  } else {
    for (const message of validatePlanetDetailScreenContract(runtimeData.planetDetailScreen)) {
      issues.push({ severity: "error", code: "planet_detail_screen_invalid", message, records: ["planetDetailScreen"] });
    }
  }
  if (!runtimeData.civilizationOperationsDeck) {
    issues.push({ severity: "error", code: "civilization_operations_deck_missing", message: "Civilization Operations Deck runtime contract is required.", records: ["civilizationOperationsDeck"] });
  } else {
    for (const message of validateCivilizationOperationsDeckContract(runtimeData.civilizationOperationsDeck)) {
      issues.push({ severity: "error", code: "civilization_operations_deck_invalid", message, records: ["civilizationOperationsDeck"] });
    }
  }

  if (!runtimeData.metadata.schemaVersion) {
    issues.push({ severity: "error", code: "metadata_missing", message: "metadata.schemaVersion is required.", records: ["metadata"] });
  }
  if (!/^\d+\.\d+\.\d+$/.test(runtimeData.metadata.architectureVersion) || runtimeData.metadata.architectureVersion !== ARCHITECTURE_VERSION) {
    issues.push({ severity: "error", code: "metadata_architecture_version_invalid", message: "metadata.architectureVersion must be a valid semantic version matching the Architecture Workspace.", records: ["metadata", runtimeData.metadata.architectureVersion ?? "missing"] });
  }
  if (runtimeData.resourceTaxonomy.version !== ResourceService.taxonomyVersion || runtimeData.resourceTaxonomy.profileGenerationVersion !== ResourceService.profileGenerationVersion) {
    issues.push({ severity: "error", code: "resource_taxonomy_version_invalid", message: "Runtime resource taxonomy versions must match ResourceService.", records: [runtimeData.resourceTaxonomy.version, runtimeData.resourceTaxonomy.profileGenerationVersion] });
  }
  const runtimeElements = runtimeData.resources.filter((resource) => resource.primaryCategory === "Elements");
  const elementAtomicNumbers = runtimeElements.map((resource) => Number(resource.element?.atomic_number));
  const elementSymbols = runtimeElements.map((resource) => String(resource.element?.chemical_symbol ?? ""));
  if (runtimeElements.length !== 118 || new Set(elementAtomicNumbers).size !== 118 || new Set(elementSymbols).size !== 118) {
    issues.push({ severity: "error", code: "periodic_table_incomplete", message: "Runtime resources must contain exactly 118 uniquely numbered and symbolized elements.", records: runtimeElements.map((resource) => resource.id) });
  }
  const invalidMigrationReferences = runtimeData.resourceMigrations.flatMap((migration) => {
    const canonicalResourceId = typeof migration.canonical_resource_id === "string" ? migration.canonical_resource_id : "";
    return canonicalResourceId && !resourceIds.has(canonicalResourceId) ? [String(migration.legacy_resource_id ?? canonicalResourceId)] : [];
  });
  if (invalidMigrationReferences.length) {
    issues.push({ severity: "error", code: "resource_migration_reference_invalid", message: "Resource migrations reference missing canonical resource IDs.", records: invalidMigrationReferences });
  }

  for (const [moduleName, rows] of Object.entries({ eras: runtimeData.eras, economyDefinitions: runtimeData.economyDefinitions, economyBehaviorContracts: runtimeData.economyBehaviorContracts, eraEconomyProfiles: runtimeData.eraEconomyProfiles, resourceProducerDefinitions: runtimeData.resourceProducerDefinitions, buildingResourceEffects: runtimeData.buildingResourceEffects, economyScopeRules: runtimeData.economyScopeRules, economyTransactionReasons: runtimeData.economyTransactionReasons, economyRateBreakdownDefinitions: runtimeData.economyRateBreakdownDefinitions, offlineProgressionPolicies: runtimeData.offlineProgressionPolicies, inventoryResourceMetadata: runtimeData.inventoryResourceMetadata, aiAgents: runtimeData.aiAgents, aiAgentVariants: runtimeData.aiAgentVariants, discoveryCategories: runtimeData.discoveryCategories, discoveryPurposeCategories: runtimeData.discoveryPurposeCategories, discoveryRarities: runtimeData.discoveryRarities, discoveries: runtimeData.discoveries, discoveryCollections: runtimeData.discoveryCollections, discoveryChains: runtimeData.discoveryChains, resources: runtimeData.resources, buildingTaxonomy: runtimeData.buildingTaxonomy, buildingLibrary: runtimeData.buildingLibrary, buildingClassifications: runtimeData.buildingClassifications, upgradeCategories: runtimeData.upgradeCategories, upgrades: runtimeData.upgrades, assets: runtimeData.assets })) {
    const duplicates = duplicateIds(rows as Array<{ id: string }>);
    if (duplicates.length) {
      issues.push({ severity: "error", code: "duplicate_id", message: `${moduleName} contains duplicate IDs.`, records: duplicates });
    }
  }

  validateCanonicalEraProgression(runtimeData.eras, issues, "Canonical runtime");
  validateEraEconomyProfiles(runtimeData, issues, "Canonical runtime");
  validateEconomyDefaults(runtimeData, issues, "Canonical runtime");
  validateResourceEconomyContracts(runtimeData, issues, "Canonical runtime");
  issues.push(...validateLaborGenerationFramework(runtimeData.laborGenerationFramework));
  for (const message of validateCanonicalAiLibrary(runtimeData.aiLibrary).issues) {
    issues.push({ severity: "error", code: "ai_library_invalid", message, records: ["aiLibrary"] });
  }
  if (runtimeData.aiCategories.length !== aiLibraryCategories.length || runtimeData.aiRarity.length !== aiLibraryRarities.length) {
    issues.push({ severity: "error", code: "ai_library_catalog_invalid", message: "AI Library catalogs must match the canonical Foundations catalogs.", records: ["aiCategories", "aiRarity"] });
  }
  validateMobileClientProfiles(runtimeData, issues);
  if (!runtimeData.identityRelationshipGraph) {
    issues.push({ severity: "error", code: "identity_relationship_graph_missing", message: "Canonical runtime must include the identity and relationship graph.", records: ["identityRelationshipGraph"] });
  } else if ("systemOwnerId" in runtimeData.identityRelationshipGraph) {
    for (const issue of validateIdentityRelationshipGraph(runtimeData.identityRelationshipGraph)) {
      issues.push({ severity: issue.severity, code: `identity_relationship_${issue.code}`, message: issue.message, records: issue.records });
    }
  } else {
    const identityRecords = new Set(runtimeData.identityRelationshipGraph.records.map((record) => record.canonicalId));
    if (runtimeData.identityRelationshipGraph.status !== "Ready" || identityRecords.size !== runtimeData.identityRelationshipGraph.records.length) {
      issues.push({ severity: "error", code: "identity_relationship_runtime_invalid", message: "The published identity graph must be Ready and use unique canonical IDs.", records: [runtimeData.identityRelationshipGraph.id] });
    }
    const brokenRelationships = runtimeData.identityRelationshipGraph.relationships.filter((relationship) => !identityRecords.has(relationship.fromCanonicalId) || !identityRecords.has(relationship.toCanonicalId));
    if (brokenRelationships.length) {
      issues.push({ severity: "error", code: "identity_relationship_runtime_reference_invalid", message: "Published identity relationships must resolve canonical IDs.", records: brokenRelationships.map((relationship) => `${relationship.fromCanonicalId}:${relationship.toCanonicalId}`) });
    }
  }
  validateAiAgents(runtimeData, issues);
  const discoveryValidation = validateDiscoverySystem();
  for (const issue of discoveryValidation.issues) {
    issues.push({ severity: issue.severity, code: `discovery_${issue.code}`, message: issue.message, records: issue.records });
  }
  const universalRegistryValidation = validateUniversalDiscoveryRegistryContract();
  for (const issue of universalRegistryValidation.issues) {
    issues.push({ severity: issue.severity, code: `universal_discovery_registry_${issue.code}`, message: issue.message, records: issue.records });
  }
  for (const issue of validateGalaxyEnginePresentationContract(runtimeData.galaxyEngineContract)) {
    issues.push(issue);
  }
  for (const issue of validateTimeActionContract(runtimeData.timeActionContract)) {
    issues.push(issue);
  }
  for (const issue of validateActionSystem(runtimeData.actionSystem, runtimeData.timeActionContract)) {
    issues.push(issue);
  }
  for (const issue of validatePlanetOpportunityProfiles(runtimeData.planetOpportunityProfiles)) {
    issues.push(issue);
  }
  if (runtimeData.planetDeepDataFramework.schemaVersion !== PLANET_DEEP_DATA_SCHEMA_VERSION || !runtimeData.planetDeepDataFramework.planetTypeProfiles.length) {
    issues.push({ severity: "error", code: "planet_deep_data_framework_invalid", message: "Planet deep-data framework must expose a supported schema and existing Planet Type profiles.", records: ["planetDeepDataFramework"] });
  }
  if (runtimeData.planetDataScreenContract.id !== runtimeData.planetDeepDataFramework.dataScreenContract.id) {
    issues.push({ severity: "error", code: "planet_data_screen_contract_mismatch", message: "Planet Data Screen contract must match the canonical planet deep-data framework.", records: ["planetDataScreenContract"] });
  }
  const deepFrameworkInvalidResources = runtimeData.planetDeepDataFramework.resourceDistributionProfiles.flatMap((profile) =>
    profile.resourceRules.filter((rule) => !resourceIds.has(rule.resourceId)).map((rule) => rule.resourceId)
  );
  if (deepFrameworkInvalidResources.length) {
    issues.push({ severity: "error", code: "planet_deep_data_resource_invalid", message: "Planet resource distribution profiles reference missing canonical resources.", records: [...new Set(deepFrameworkInvalidResources)] });
  }
  for (const issue of validatePlanetExplorationProgression(runtimeData.planetExplorationProgression, runtimeData.timeActionContract)) {
    issues.push(issue);
  }
  for (const issue of validatePlanetDevelopmentFramework(runtimeData.planetDevelopmentFramework, new Set(runtimeData.actionSystem.actionDefinitions.map((action) => action.id)), new Set(runtimeData.planetOpportunityProfiles.map((profile) => profile.id)))) {
    issues.push(issue);
  }
  for (const issue of validateCivilizationProgressionFramework(runtimeData.civilizationProgressionFramework, new Set(runtimeData.actionSystem.actionDefinitions.map((action) => action.id)), runtimeData.planetDevelopmentFramework.id)) {
    issues.push(issue);
  }
  for (const issue of validateColonizationFramework(runtimeData.colonizationFramework, {
    actionIds: new Set(runtimeData.actionSystem.actionDefinitions.map((action) => action.id)),
    actionPhaseIds: new Set(runtimeData.actionSystem.actionPhaseTemplates.map((phase) => phase.id)),
    actionDurationIds: new Set(runtimeData.actionSystem.actionDurationDefinitions.map((duration) => duration.id)),
    resourceIds: new Set(runtimeData.resources.map((resource) => resource.id)),
    buildingIds: new Set(runtimeData.buildingLibrary.map((building) => building.id)),
    planetDevelopmentFrameworkId: runtimeData.planetDevelopmentFramework.id,
    civilizationProgressionFrameworkId: runtimeData.civilizationProgressionFramework.id,
    progressionMilestoneIds: new Set(runtimeData.civilizationProgressionFramework.civilizationMilestones.map((milestone) => milestone.id))
  })) {
    issues.push(issue);
  }
  for (const issue of validatePopulationSimulationFramework(runtimeData.populationSimulationFramework, {
    actionIds: new Set(runtimeData.actionSystem.actionDefinitions.map((action) => action.id)),
    buildingFamilyIds: new Set(runtimeData.buildingTaxonomy.map((family) => family.id)),
    colonizationFrameworkId: runtimeData.colonizationFramework.id,
    planetDevelopmentFrameworkId: runtimeData.planetDevelopmentFramework.id,
    civilizationProgressionFrameworkId: runtimeData.civilizationProgressionFramework.id,
    colonyTypeIds: new Set(runtimeData.colonizationFramework.colonyTypeDefinitions.map((type) => type.id)),
    progressionMilestoneIds: new Set(runtimeData.civilizationProgressionFramework.civilizationMilestones.map((milestone) => milestone.id))
  })) {
    issues.push(issue);
  }
  for (const issue of validateResourceEconomyLogisticsFramework(runtimeData.resourceEconomyLogisticsFramework, {
    resourceIds: new Set(runtimeData.resources.map((resource) => resource.id)),
    actionIds: new Set(runtimeData.actionSystem.actionDefinitions.map((action) => action.id)),
    actionPhaseIds: new Set(runtimeData.actionSystem.actionPhaseTemplates.map((phase) => phase.id)),
    actionDurationIds: new Set(runtimeData.actionSystem.actionDurationDefinitions.map((duration) => duration.id)),
    buildingIds: new Set(runtimeData.buildingLibrary.map((building) => building.id)),
    colonizationPackageIds: new Set(runtimeData.colonizationFramework.colonyResourcePackageDefinitions.map((item) => item.id)),
    colonizationPhaseIds: new Set(runtimeData.colonizationFramework.colonyProjectPhaseDefinitions.map((item) => item.id)),
    planetDevelopmentFrameworkId: runtimeData.planetDevelopmentFramework.id,
    civilizationProgressionFrameworkId: runtimeData.civilizationProgressionFramework.id,
    colonizationFrameworkId: runtimeData.colonizationFramework.id
  })) {
    issues.push(issue);
  }
  for (const issue of validateMissionExpeditionFramework(runtimeData.missionExpeditionFramework, {
    resourceIds: new Set(runtimeData.resources.map((resource) => resource.id)),
    actionIds: new Set(runtimeData.actionSystem.actionDefinitions.map((action) => action.id)),
    routeIds: new Set(runtimeData.resourceEconomyLogisticsFramework.logisticsRouteDefinitions.map((route) => route.id)),
    transportModeIds: new Set(runtimeData.resourceEconomyLogisticsFramework.transportModeDefinitions.map((transport) => transport.id))
  })) {
    issues.push(issue);
  }
  for (const issue of validateDynamicEventFramework(runtimeData.dynamicEventFramework, {
    actionIds: new Set(runtimeData.actionSystem.actionDefinitions.map((action) => action.id)),
    missionTemplateIds: new Set(runtimeData.missionExpeditionFramework.missionTemplateDefinitions.map((template) => template.id)),
    progressionMilestoneIds: new Set(runtimeData.civilizationProgressionFramework.civilizationMilestones.map((milestone) => milestone.id))
  })) {
    issues.push(issue);
  }
  validateBuildingTaxonomyRuntime(runtimeData, issues);
  const categoryPresentationValidation = validateUpgradeCategoryPresentation({ categories: runtimeData.upgradeCategories });
  for (const message of categoryPresentationValidation.issues) {
    issues.push({ severity: "error", code: "upgrade_category_presentation_invalid", message, records: runtimeData.upgradeCategories.map((category) => category.id) });
  }
  for (const issue of validateUpgradeTreeContract(runtimeData.upgradeTree, {
    upgrades: runtimeData.upgrades,
    eras: runtimeData.eras,
    alignmentIds: upgradeTreeAlignmentIds(civilizationAlignmentScores)
  })) {
    issues.push(issue);
  }

  const missingCategories = requiredCategoryIds.filter((id) => !categoryIds.has(id));
  if (missingCategories.length) {
    issues.push({ severity: "error", code: "missing_upgrade_categories", message: "The required upgrade categories must exist.", records: missingCategories });
  }

  for (const upgrade of runtimeData.upgrades) {
    if (!categoryIds.has(upgrade.categoryId)) {
      issues.push({ severity: "error", code: "upgrade_category_missing", message: "Upgrade category references must resolve.", records: [upgrade.id, upgrade.categoryId] });
    }
    if (!eraIds.has(upgrade.eraId)) {
      issues.push({ severity: "error", code: "upgrade_era_missing", message: "Upgrade era references must resolve.", records: [upgrade.id, upgrade.eraId] });
    }
    if (upgrade.costResourceId && !resourceIds.has(upgrade.costResourceId)) {
      issues.push({ severity: "error", code: "upgrade_resource_missing", message: "Upgrade cost resources must resolve to the Resource Catalog.", records: [upgrade.id, upgrade.costResourceId] });
    }
    if (upgrade.costEconomyId && !economyIds.has(upgrade.costEconomyId)) {
      issues.push({ severity: "error", code: "upgrade_economy_missing", message: "Upgrade cost economy IDs must resolve to canonical economy definitions.", records: [upgrade.id, upgrade.costEconomyId] });
    }
    for (const nextId of upgrade.nextUpgradeIds) {
      if (!upgradeIds.has(nextId)) {
        issues.push({ severity: "error", code: "next_upgrade_missing", message: "nextUpgradeIds must resolve.", records: [upgrade.id, nextId] });
      }
    }
  }

  const negativeBalance = Object.entries(runtimeData.balance)
    .filter(([, value]) => typeof value === "number" && value < 0)
    .map(([key]) => key);
  if (negativeBalance.length) {
    issues.push({ severity: "error", code: "negative_balance_value", message: "Balance values must be non-negative.", records: negativeBalance });
  }

  for (const [profileName, profile] of Object.entries(runtimeData.clientProfiles)) {
    if (profile.defaultUpgradeRowsVisible < 0 || profile.futureUpgradeTeaserCount < 0 || profile.lockedOpacity < 0 || profile.lockedOpacity > 1) {
      issues.push({ severity: "error", code: "invalid_client_profile", message: "Client profile fields must be valid.", records: [profileName] });
    }
    const eraNavigation = profile.eraNavigation;
    if (!eraNavigation) {
      issues.push({ severity: "error", code: "era_navigation_missing", message: "Client profiles must expose eraNavigation presentation intent.", records: [profileName] });
    } else {
      if (!supportedEraNavigationDashboardModes.includes(eraNavigation.dashboardMode)) {
        issues.push({ severity: "error", code: "invalid_era_navigation_mode", message: "eraNavigation.dashboardMode is not supported.", records: [profileName, eraNavigation.dashboardMode] });
      }
      if (!Number.isInteger(eraNavigation.visibleEraCount) || eraNavigation.visibleEraCount <= 0 || eraNavigation.visibleEraCount > runtimeData.eras.length) {
        issues.push({ severity: "error", code: "invalid_era_navigation_visible_count", message: "eraNavigation.visibleEraCount must be a positive integer no larger than the canonical era count.", records: [profileName, String(eraNavigation.visibleEraCount)] });
      }
      if (typeof eraNavigation.fullTimelineEnabled !== "boolean" || typeof eraNavigation.allowPrimaryHorizontalScroll !== "boolean") {
        issues.push({ severity: "error", code: "invalid_era_navigation_flags", message: "eraNavigation timeline and scroll flags must be boolean.", records: [profileName] });
      }
      const boundaryBehavior = eraNavigation.boundaryBehavior;
      if (boundaryBehavior) {
        for (const [key, value] of Object.entries(boundaryBehavior)) {
          if (!supportedEraNavigationBoundaryModes.includes(value)) {
            issues.push({ severity: "error", code: "invalid_era_navigation_boundary", message: "eraNavigation.boundaryBehavior values are not supported.", records: [profileName, key, value] });
          }
        }
      }
    }
    const slots = profile.primaryHudSlots ?? [];
    const hudIds = profile.primaryHudResources ?? [];
    const expectedFixedHud = [...primaryHudEconomyIds];
    const slotOrders = slots.map((slot) => slot.order);
    const duplicateHudOrders = duplicateNumbers(slotOrders);
    if (duplicateHudOrders.length) {
      issues.push({ severity: "error", code: "duplicate_hud_order", message: "HUD slot order values must be unique.", records: [profileName, ...duplicateHudOrders.map(String)] });
    }
    for (const economyId of hudIds) {
      if (!economyIds.has(economyId)) {
        issues.push({ severity: "error", code: "hud_economy_missing", message: "HUD resources must resolve to canonical economy definitions.", records: [profileName, economyId] });
      }
      if (resourceIds.has(economyId) || materialResourceIdsThatMustNotBeHud().has(economyId)) {
        issues.push({ severity: "error", code: "material_resource_in_hud", message: "Material resources must not be used as global HUD economy IDs.", records: [profileName, economyId] });
      }
    }
    for (const slot of slots) {
      if (!economyIds.has(slot.economyId)) {
        issues.push({ severity: "error", code: "hud_slot_economy_missing", message: "HUD slot economyId must resolve to canonical economy definitions.", records: [profileName, slot.id, slot.economyId] });
      }
    }
    if (hudIds.length !== 5 || slots.length !== 5) {
      issues.push({ severity: "error", code: "fixed_hud_count_invalid", message: "Client profiles must expose exactly five fixed core HUD slots.", records: [profileName, `resources:${hudIds.length}`, `slots:${slots.length}`] });
    }
    if (hudIds.join("|") !== expectedFixedHud.join("|") || slots.map((slot) => slot.economyId).join("|") !== expectedFixedHud.join("|")) {
      issues.push({ severity: "error", code: "fixed_hud_order_invalid", message: "Client profiles must preserve the approved fixed HUD order.", records: [profileName, ...hudIds] });
    }
    if (hudIds[0] !== "ECON-LABOR" || hudIds[1] !== "ECON-CREDITS") {
      issues.push({ severity: "error", code: "fixed_hud_labor_credits_order_invalid", message: "ECON-LABOR must be slot 1 and ECON-CREDITS must be slot 2.", records: [profileName, ...hudIds.slice(0, 2)] });
    }
  }

  const missingShortLabels = runtimeData.eras.filter((era) => !era.shortDisplayName);
  if (missingShortLabels.length) {
    issues.push({ severity: "error", code: "era_short_label_missing", message: "All eras must expose shortDisplayName for constrained client UI.", records: missingShortLabels.map((era) => era.id) });
  }

  for (const definition of runtimeData.economyDefinitions) {
    for (const key of ["startingAmount", "startingRate", "minimum"] as const) {
      if (!Number.isFinite(definition[key])) {
        issues.push({ severity: "error", code: "invalid_economy_number", message: "Economy starting values, rates, and minimums must be finite.", records: [definition.id, key] });
      }
    }
    if (definition.premium && !/premium/i.test(definition.id)) {
      issues.push({ severity: "warning", code: "premium_economy_marker", message: "Premium economy values should be explicitly identifiable.", records: [definition.id] });
    }
  }

  for (const asset of runtimeData.assets) {
    for (const [platform, mapping] of Object.entries(asset.platformMappings)) {
      for (const [field, value] of Object.entries(mapping ?? {})) {
        if (typeof value !== "string") {
          issues.push({ severity: "error", code: "invalid_asset_mapping", message: "Platform asset mappings must use strings.", records: [asset.id, platform, field] });
        }
      }
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    valid: errorCount === 0,
    status: errorCount ? "Blocked" as const : warningCount ? "Ready With Warnings" as const : "Ready" as const,
    errorCount,
    warningCount,
    checkedAt: new Date().toISOString(),
    issues
  };
}

export function buildRobloxRuntimePayload(runtimeData: GameRuntimeData | CanonicalRuntimeExportPayload): RobloxRuntimeExportPayload {
  const sourceGraph = runtimeData.identityRelationshipGraph as IdentityRelationshipGraph | IdentityRelationshipRuntimeExport | undefined;
  const identityRelationshipGraph = sourceGraph
    ? "systemOwnerId" in sourceGraph
      ? toIdentityRelationshipRuntimeExport(sourceGraph)
      : sourceGraph
    : undefined;
  const sorted = sortRuntimeData({ ...runtimeData, identityRelationshipGraph: undefined } as GameRuntimeData);
  const payload: RobloxRuntimeExportPayload = {
    metadata: {
      ...sorted.metadata,
      target: "roblox",
      sourceSchemaVersion: sorted.metadata.schemaVersion
    },
    eras: sorted.eras,
    economyDefinitions: sorted.economyDefinitions,
    economyBehaviorContracts: sorted.economyBehaviorContracts,
    eraEconomyProfiles: sorted.eraEconomyProfiles,
    economyUsageRelationships: sorted.economyUsageRelationships,
    inventoryResourceMetadata: sorted.inventoryResourceMetadata,
    resourceProducerDefinitions: sorted.resourceProducerDefinitions,
    buildingResourceEffects: sorted.buildingResourceEffects,
    economyScopeRules: sorted.economyScopeRules,
    economyTransactionReasons: sorted.economyTransactionReasons,
    economyRateBreakdownDefinitions: sorted.economyRateBreakdownDefinitions,
    offlineProgressionPolicies: sorted.offlineProgressionPolicies,
    economyCalculationRules: sorted.economyCalculationRules,
    laborGenerationFramework: sorted.laborGenerationFramework,
    aiLibrary: sorted.aiLibrary,
    aiCategories: sorted.aiCategories,
    aiRarity: sorted.aiRarity,
    aiPersonalityCatalog: sorted.aiPersonalityCatalog,
    aiVoiceCatalog: sorted.aiVoiceCatalog,
    aiAssignmentRoles: sorted.aiAssignmentRoles,
    aiAgents: sorted.aiAgents,
    aiAgentVariants: sorted.aiAgentVariants,
    aiAgentPersonalities: sorted.aiAgentPersonalities,
    aiAgentAnimationProfiles: sorted.aiAgentAnimationProfiles,
    automationPresentation: sorted.automationPresentation,
    defaultAiAgentId: sorted.defaultAiAgentId,
    aiAgentSaveSchema: sorted.aiAgentSaveSchema,
    discoveryCategories: sorted.discoveryCategories,
    discoveryPurposeCategories: sorted.discoveryPurposeCategories,
    discoveryRarities: sorted.discoveryRarities,
    discoveries: sorted.discoveries,
    discoveryCollections: sorted.discoveryCollections,
    discoveryChains: sorted.discoveryChains,
    discoveryMilestones: sorted.discoveryMilestones,
    discoveryPlayerCollectionSchema: sorted.discoveryPlayerCollectionSchema,
    universalDiscoveryRegistry: sorted.universalDiscoveryRegistry,
    galaxyEngineContract: sorted.galaxyEngineContract,
    timeActionContract: sorted.timeActionContract,
    actionSystem: sorted.actionSystem,
    planetOpportunityProfiles: sorted.planetOpportunityProfiles,
    planetDeepDataFramework: sorted.planetDeepDataFramework,
    planetDataScreenContract: sorted.planetDataScreenContract,
    planetExplorationProgression: sorted.planetExplorationProgression,
    planetDevelopmentFramework: sorted.planetDevelopmentFramework,
    civilizationProgressionFramework: sorted.civilizationProgressionFramework,
    colonizationFramework: sorted.colonizationFramework,
    populationSimulationFramework: sorted.populationSimulationFramework,
    resourceEconomyLogisticsFramework: sorted.resourceEconomyLogisticsFramework,
    missionExpeditionFramework: sorted.missionExpeditionFramework,
    dynamicEventFramework: sorted.dynamicEventFramework,
    environmentComposerContract: sorted.environmentComposerContract,
    designLanguage: sorted.designLanguage,
    componentLibrary: sorted.componentLibrary,
    screenTemplateLibrary: sorted.screenTemplateLibrary,
    assetProductionRuntime: sorted.assetProductionRuntime,
    identityRelationshipGraph,
    speciesCategories: sorted.speciesCategories,
    speciesTaxonomyFrameworks: sorted.speciesTaxonomyFrameworks,
    species: sorted.species,
    speciesOccurrences: sorted.speciesOccurrences,
    speciesResourceYields: sorted.speciesResourceYields,
    creatureArtProfiles: sorted.creatureArtProfiles,
    creatureAnimationProfiles: sorted.creatureAnimationProfiles,
    creatureAudioProfiles: sorted.creatureAudioProfiles,
    creatureGeneratorContract: sorted.creatureGeneratorContract,
    creaturePromptOutputTypes: sorted.creaturePromptOutputTypes,
    creaturePromptLifecycleStages: sorted.creaturePromptLifecycleStages,
    creaturePromptBatchActions: sorted.creaturePromptBatchActions,
    creaturePromptModelProfiles: sorted.creaturePromptModelProfiles,
    creaturePromptTypeTemplates: sorted.creaturePromptTypeTemplates,
    speciesPlates: sorted.speciesPlates,
    planetDetailScreen: sorted.planetDetailScreen ?? planetDetailScreenRuntimeContract,
    civilizationOperationsDeck: sorted.civilizationOperationsDeck ?? civilizationOperationsDeckContract,
    resources: sorted.resources,
    buildingTaxonomy: sorted.buildingTaxonomy,
    buildingLibrary: sorted.buildingLibrary,
    buildingClassifications: sorted.buildingClassifications,
    upgradeTabs: sorted.upgradeCategories.map((category) => ({
      ...category,
      tabId: category.id,
      label: category.displayName
    })),
    upgrades: sorted.upgrades.map((upgrade) => ({
      ...upgrade,
      tabId: upgrade.categoryId
    })),
    upgradeTree: sorted.upgradeTree,
    assets: sorted.assets.map(publicAsset).map((asset) => ({
      ...asset,
      robloxAssetId: asset.platformMappings.roblox?.assetId ?? null
    })),
    balance: sorted.balance,
    clientHints: sorted.clientProfiles.roblox ?? sorted.clientProfiles.default
  };
  const validation = validateRobloxRuntimePayload(payload);
  return withPublicMetadata(payload, validation.status);
}

export function validateRobloxRuntimePayload(payload: RobloxRuntimeExportPayload) {
  const issues: ImportIssue[] = [];
  const eraIds = new Set(payload.eras.map((era) => era.id));
  const resourceIds = new Set(payload.resources.map((resource) => resource.id));
  const economyIds = new Set(payload.economyDefinitions.map((definition) => definition.id));
  const tabIds = new Set(payload.upgradeTabs.map((tab) => tab.tabId));
  const upgradeIds = new Set(payload.upgrades.map((upgrade) => upgrade.id));

  if (!payload.metadata.schemaVersion) {
    issues.push({ severity: "error", code: "metadata_schema_missing", message: "metadata.schemaVersion is required.", records: ["metadata"] });
  }
  if (!/^\d+\.\d+\.\d+$/.test(payload.metadata.architectureVersion) || payload.metadata.architectureVersion !== ARCHITECTURE_VERSION) {
    issues.push({ severity: "error", code: "metadata_architecture_version_invalid", message: "Roblox metadata.architectureVersion must match the Architecture Workspace.", records: ["metadata", payload.metadata.architectureVersion ?? "missing"] });
  }
  if (!payload.metadata.contentVersion) {
    issues.push({ severity: "error", code: "metadata_version_missing", message: "metadata.contentVersion is required.", records: ["metadata"] });
  }
  if (!payload.identityRelationshipGraph || payload.identityRelationshipGraph.id !== "noveris-identity-relationships" || payload.identityRelationshipGraph.status !== "Ready") {
    issues.push({ severity: "error", code: "identity_relationship_graph_missing", message: "Roblox runtime requires the safe canonical identity and relationship graph.", records: ["identityRelationshipGraph"] });
  } else {
    const canonicalIds = new Set(payload.identityRelationshipGraph.records.map((record) => record.canonicalId));
    if (canonicalIds.size !== payload.identityRelationshipGraph.records.length) {
      issues.push({ severity: "error", code: "identity_relationship_duplicate_id", message: "Roblox identity records must use unique canonical IDs.", records: payload.identityRelationshipGraph.records.map((record) => record.canonicalId) });
    }
    const brokenRelationships = payload.identityRelationshipGraph.relationships.filter((relationship) => !canonicalIds.has(relationship.fromCanonicalId) || !canonicalIds.has(relationship.toCanonicalId));
    if (brokenRelationships.length) {
      issues.push({ severity: "error", code: "identity_relationship_broken_reference", message: "Roblox identity relationships must resolve canonical IDs.", records: brokenRelationships.map((relationship) => `${relationship.fromCanonicalId}:${relationship.toCanonicalId}`) });
    }
  }
  if (payload.upgradeTree.nodes.length !== payload.upgrades.length) {
    issues.push({ severity: "error", code: "roblox_upgrade_tree_incomplete", message: "Roblox upgrade tree must include every canonical upgrade.", records: [String(payload.upgradeTree.nodes.length), String(payload.upgrades.length)] });
  }
  for (const node of payload.upgradeTree.nodes) {
    if (!upgradeIds.has(node.upgradeId)) {
      issues.push({ severity: "error", code: "roblox_upgrade_tree_reference_missing", message: "Roblox upgrade tree node must resolve to an upgrade.", records: [node.id, node.upgradeId] });
    }
  }
  if (payload.upgradeTabs.length !== 4) {
    issues.push({ severity: "error", code: "invalid_upgrade_tab_count", message: "Roblox runtime payload must expose exactly four upgrade tabs.", records: payload.upgradeTabs.map((tab) => tab.tabId) });
  }
  for (const message of validateCanonicalAiLibrary(payload.aiLibrary).issues) {
    issues.push({ severity: "error", code: "ai_library_invalid", message, records: ["aiLibrary"] });
  }
  const tabPresentationValidation = validateUpgradeCategoryPresentation({ categories: payload.upgradeTabs.map((tab) => ({ id: tab.id, presentation: tab.presentation })) });
  for (const message of tabPresentationValidation.issues) {
    issues.push({ severity: "error", code: "upgrade_tab_presentation_invalid", message, records: payload.upgradeTabs.map((tab) => tab.tabId) });
  }
  validateCanonicalEraProgression(payload.eras, issues, "Roblox runtime");
  validateEraEconomyProfiles({
    eras: payload.eras,
    economyDefinitions: payload.economyDefinitions,
    eraEconomyProfiles: payload.eraEconomyProfiles
  }, issues, "Roblox runtime");
  validateEconomyDefaults({
    economyDefinitions: payload.economyDefinitions,
    eraEconomyProfiles: payload.eraEconomyProfiles,
    balance: payload.balance
  }, issues, "Roblox runtime");
  validateResourceEconomyContracts(payload, issues, "Roblox runtime");
  issues.push(...validateLaborGenerationFramework(payload.laborGenerationFramework));
  validateAiAgents(payload, issues);
  for (const issue of validateGalaxyEnginePresentationContract(payload.galaxyEngineContract)) {
    issues.push(issue);
  }
  for (const issue of validateTimeActionContract(payload.timeActionContract)) {
    issues.push(issue);
  }
  for (const issue of validateActionSystem(payload.actionSystem, payload.timeActionContract)) {
    issues.push(issue);
  }
  for (const issue of validatePlanetOpportunityProfiles(payload.planetOpportunityProfiles)) {
    issues.push(issue);
  }
  if (payload.planetDeepDataFramework.schemaVersion !== PLANET_DEEP_DATA_SCHEMA_VERSION || payload.planetDataScreenContract.id !== payload.planetDeepDataFramework.dataScreenContract.id) {
    issues.push({ severity: "error", code: "planet_deep_data_framework_invalid", message: "Roblox planet deep-data and Planet Data Screen contracts must match the canonical runtime.", records: ["planetDeepDataFramework", "planetDataScreenContract"] });
  }
  const invalidPlanetDistributionResources = payload.planetDeepDataFramework.resourceDistributionProfiles.flatMap((profile) =>
    profile.resourceRules.filter((rule) => !resourceIds.has(rule.resourceId)).map((rule) => rule.resourceId)
  );
  if (invalidPlanetDistributionResources.length) {
    issues.push({ severity: "error", code: "planet_deep_data_resource_invalid", message: "Roblox planet resource distributions reference missing resources.", records: [...new Set(invalidPlanetDistributionResources)] });
  }
  for (const issue of validatePlanetExplorationProgression(payload.planetExplorationProgression, payload.timeActionContract)) {
    issues.push(issue);
  }
  for (const issue of validatePlanetDevelopmentFramework(payload.planetDevelopmentFramework, new Set(payload.actionSystem.actionDefinitions.map((action) => action.id)), new Set(payload.planetOpportunityProfiles.map((profile) => profile.id)))) {
    issues.push(issue);
  }
  for (const issue of validateCivilizationProgressionFramework(payload.civilizationProgressionFramework, new Set(payload.actionSystem.actionDefinitions.map((action) => action.id)), payload.planetDevelopmentFramework.id)) {
    issues.push(issue);
  }
  for (const issue of validateColonizationFramework(payload.colonizationFramework, {
    actionIds: new Set(payload.actionSystem.actionDefinitions.map((action) => action.id)),
    actionPhaseIds: new Set(payload.actionSystem.actionPhaseTemplates.map((phase) => phase.id)),
    actionDurationIds: new Set(payload.actionSystem.actionDurationDefinitions.map((duration) => duration.id)),
    resourceIds: new Set(payload.resources.map((resource) => resource.id)),
    buildingIds: new Set(payload.buildingLibrary.map((building) => building.id)),
    planetDevelopmentFrameworkId: payload.planetDevelopmentFramework.id,
    civilizationProgressionFrameworkId: payload.civilizationProgressionFramework.id,
    progressionMilestoneIds: new Set(payload.civilizationProgressionFramework.civilizationMilestones.map((milestone) => milestone.id))
  })) {
    issues.push(issue);
  }
  for (const issue of validatePopulationSimulationFramework(payload.populationSimulationFramework, {
    actionIds: new Set(payload.actionSystem.actionDefinitions.map((action) => action.id)),
    buildingFamilyIds: new Set(payload.buildingTaxonomy.map((family) => family.id)),
    colonizationFrameworkId: payload.colonizationFramework.id,
    planetDevelopmentFrameworkId: payload.planetDevelopmentFramework.id,
    civilizationProgressionFrameworkId: payload.civilizationProgressionFramework.id,
    colonyTypeIds: new Set(payload.colonizationFramework.colonyTypeDefinitions.map((type) => type.id)),
    progressionMilestoneIds: new Set(payload.civilizationProgressionFramework.civilizationMilestones.map((milestone) => milestone.id))
  })) {
    issues.push(issue);
  }
  for (const issue of validateResourceEconomyLogisticsFramework(payload.resourceEconomyLogisticsFramework, {
    resourceIds: new Set(payload.resources.map((resource) => resource.id)),
    actionIds: new Set(payload.actionSystem.actionDefinitions.map((action) => action.id)),
    actionPhaseIds: new Set(payload.actionSystem.actionPhaseTemplates.map((phase) => phase.id)),
    actionDurationIds: new Set(payload.actionSystem.actionDurationDefinitions.map((duration) => duration.id)),
    buildingIds: new Set(payload.buildingLibrary.map((building) => building.id)),
    colonizationPackageIds: new Set(payload.colonizationFramework.colonyResourcePackageDefinitions.map((item) => item.id)),
    colonizationPhaseIds: new Set(payload.colonizationFramework.colonyProjectPhaseDefinitions.map((item) => item.id)),
    planetDevelopmentFrameworkId: payload.planetDevelopmentFramework.id,
    civilizationProgressionFrameworkId: payload.civilizationProgressionFramework.id,
    colonizationFrameworkId: payload.colonizationFramework.id
  })) {
    issues.push(issue);
  }
  for (const issue of validateMissionExpeditionFramework(payload.missionExpeditionFramework, {
    resourceIds: new Set(payload.resources.map((resource) => resource.id)),
    actionIds: new Set(payload.actionSystem.actionDefinitions.map((action) => action.id)),
    routeIds: new Set(payload.resourceEconomyLogisticsFramework.logisticsRouteDefinitions.map((route) => route.id)),
    transportModeIds: new Set(payload.resourceEconomyLogisticsFramework.transportModeDefinitions.map((transport) => transport.id))
  })) {
    issues.push(issue);
  }
  for (const issue of validateDynamicEventFramework(payload.dynamicEventFramework, {
    actionIds: new Set(payload.actionSystem.actionDefinitions.map((action) => action.id)),
    missionTemplateIds: new Set(payload.missionExpeditionFramework.missionTemplateDefinitions.map((template) => template.id)),
    progressionMilestoneIds: new Set(payload.civilizationProgressionFramework.civilizationMilestones.map((milestone) => milestone.id))
  })) {
    issues.push(issue);
  }
  for (const issue of validateEnvironmentComposerContract(payload.environmentComposerContract)) {
    issues.push({
      severity: issue.severity,
      code: `environment_composer_${issue.code}`,
      message: issue.message,
      records: issue.records
    });
  }
  for (const issue of validateDesignLanguage(payload.designLanguage).issues) {
    issues.push({ severity: issue.severity, code: `design_language_${issue.code}`, message: issue.message, records: issue.records });
  }
  for (const issue of validateComponentLibrary(payload.componentLibrary).issues) {
    issues.push({ severity: issue.severity, code: `component_library_${issue.code}`, message: issue.message, records: issue.records });
  }
  for (const issue of validateScreenTemplateLibrary(payload.screenTemplateLibrary).issues) {
    issues.push({ severity: issue.severity, code: `screen_template_library_${issue.code}`, message: issue.message, records: issue.records });
  }
  for (const issue of validateAssetProductionRuntimeManifest(payload.assetProductionRuntime).issues) {
    issues.push({ severity: issue.severity, code: `asset_production_${issue.code}`, message: issue.message, records: issue.records });
  }
  for (const message of validatePlanetDetailScreenContract(payload.planetDetailScreen)) {
    issues.push({ severity: "error", code: "planet_detail_screen_invalid", message, records: ["planetDetailScreen"] });
  }
  for (const message of validateCivilizationOperationsDeckContract(payload.civilizationOperationsDeck)) {
    issues.push({ severity: "error", code: "civilization_operations_deck_invalid", message, records: ["civilizationOperationsDeck"] });
  }
  validateBuildingTaxonomyRuntime(payload, issues);

  const duplicateTabs = duplicateIds(payload.upgradeTabs.map((tab) => ({ id: tab.tabId })));
  if (duplicateTabs.length) {
    issues.push({ severity: "error", code: "duplicate_tab_id", message: "Roblox upgrade tabs must have unique tabId values.", records: duplicateTabs });
  }

  for (const upgrade of payload.upgrades) {
    if (!tabIds.has(upgrade.tabId)) {
      issues.push({ severity: "error", code: "upgrade_tab_missing", message: "Every Roblox upgrade tabId must resolve to an upgrade tab.", records: [upgrade.id, upgrade.tabId] });
    }
    if (!eraIds.has(upgrade.eraId)) {
      issues.push({ severity: "error", code: "upgrade_era_missing", message: "Every Roblox upgrade eraId must resolve to an era.", records: [upgrade.id, upgrade.eraId] });
    }
    if (upgrade.costResourceId && !resourceIds.has(upgrade.costResourceId)) {
      issues.push({ severity: "error", code: "upgrade_resource_missing", message: "Every Roblox upgrade costResourceId must resolve to a resource.", records: [upgrade.id, upgrade.costResourceId] });
    }
    if (upgrade.costEconomyId && !economyIds.has(upgrade.costEconomyId)) {
      issues.push({ severity: "error", code: "upgrade_economy_missing", message: "Every Roblox upgrade costEconomyId must resolve to an economy definition.", records: [upgrade.id, upgrade.costEconomyId] });
    }
  }

  for (const resource of payload.resources) {
    if (resource.discoveredEraId && !eraIds.has(resource.discoveredEraId)) {
      issues.push({ severity: "error", code: "resource_discovery_era_missing", message: "Resource discoveredEraId must resolve to an era.", records: [resource.id, resource.discoveredEraId] });
    }
    if (resource.usableEraId && !eraIds.has(resource.usableEraId)) {
      issues.push({ severity: "error", code: "resource_usable_era_missing", message: "Resource usableEraId must resolve to an era.", records: [resource.id, resource.usableEraId] });
    }
  }

  for (const asset of payload.assets) {
    const mapping = asset.platformMappings.roblox;
    if (mapping && typeof mapping.assetId !== "string") {
      issues.push({ severity: "error", code: "invalid_roblox_asset_mapping", message: "Roblox asset mappings must use string assetId values.", records: [asset.id] });
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    valid: errorCount === 0,
    status: errorCount ? "Blocked" as const : warningCount ? "Ready With Warnings" as const : "Ready" as const,
    errorCount,
    warningCount,
    checkedAt: new Date().toISOString(),
    issues
  };
}

async function readImportStore(): Promise<ImportStore> {
  try {
    const raw = await readFile(importStorePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ImportStore>;
    return {
      appliedRuntimeData: parsed.appliedRuntimeData ?? null,
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    return { appliedRuntimeData: null, history: [] };
  }
}

async function writeImportStore(store: ImportStore) {
  await mkdir(path.dirname(importStorePath), { recursive: true });
  await writeFile(importStorePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function buildBaseGameRuntimeData(): Promise<GameRuntimeData> {
  const [data, importedAssets, productionOverrides] = await Promise.all([getGameData(), getAppliedGameArtAssets(), getAssetProductionRuntimeOverrides()]);
  const categories = new Map(defaultCategories().map((row) => [row.id, row]));
  const upgrades = data.upgrades.map(upgradeToRuntime);
  const upgradeTree = buildUpgradeTreeContract(data.upgrades, upgrades);
  const assets = [...data.assets.map(assetToRuntime), ...importedAssets].map((asset) => {
    const override = productionOverrides[asset.id];
    if (!override) return asset;
    return {
      ...asset,
      status: override.status ?? asset.status,
      productionStatus: override.productionStatus,
      approvalStatus: override.approvalStatus,
      platformMappings: {
        ...asset.platformMappings,
        ...override.platformMappings
      }
    };
  });
  const aiAgentModules = getAiAgentRuntimeModules();
  const economyBehaviorContracts = buildEconomyBehaviorContracts();
  const buildingResourceEffects = buildBuildingResourceEffects(data);
  const resourceProducerDefinitions = buildResourceProducerDefinitions(data);
  const creatureRuntime = buildCreatureRuntimeData();
  const speciesPlates = buildSpeciesPlateRuntimeData(creatureRuntime.species);

  for (const upgrade of upgrades) {
    if (!categories.has(upgrade.categoryId)) {
      categories.set(upgrade.categoryId, {
        id: upgrade.categoryId,
        displayName: display(upgrade.categoryId.replaceAll("-", " ")),
        description: "Imported or derived upgrade category.",
        order: categories.size + 1,
        unlockedAtGameStart: false,
        unlockRequirements: {},
        iconKey: `upgrade-category-${upgrade.categoryId}`,
        themeKey: `theme-${upgrade.categoryId}`,
        presentation: categoryPresentationFor(upgrade.categoryId)
      });
    }
  }

  const runtime = withCanonicalEraDefinitions({
    metadata: metadata(),
    eras: defaultEras(),
    economyDefinitions: canonicalEconomyDefinitions,
    economyBehaviorContracts,
    eraEconomyProfiles: buildEraEconomyProfiles(),
    economyUsageRelationships: buildEconomyUsageRelationships(data),
    inventoryResourceMetadata: buildInventoryResourceMetadata(data),
    resourceProducerDefinitions,
    buildingResourceEffects,
    economyScopeRules: buildEconomyScopeRules(),
    economyTransactionReasons: buildEconomyTransactionReasons(),
    economyRateBreakdownDefinitions: buildEconomyRateBreakdownDefinitions(),
    offlineProgressionPolicies: buildOfflineProgressionPolicies(),
    economyCalculationRules: buildEconomyCalculationRules(),
    laborGenerationFramework,
    aiLibrary: canonicalAiLibraryAgents,
    aiCategories: aiLibraryCategories,
    aiRarity: aiLibraryRarities.map((rarity) => ({ ...rarity })),
    aiPersonalityCatalog: [...aiLibraryPersonalities],
    aiVoiceCatalog: [...aiLibraryVoices],
    aiAssignmentRoles: [...aiLibraryAssignmentRoles],
    aiAgents: aiAgentModules.aiAgents,
    aiAgentVariants: aiAgentModules.aiAgentVariants,
    aiAgentPersonalities: aiAgentModules.aiAgentPersonalities,
    aiAgentAnimationProfiles: aiAgentModules.aiAgentAnimationProfiles,
    automationPresentation: aiAgentModules.automationPresentation,
    defaultAiAgentId: aiAgentModules.defaultAiAgentId,
    aiAgentSaveSchema: aiAgentModules.aiAgentSaveSchema,
    discoveryCategories: discoveryCategories.map((category) => ({ ...category, subcategories: category.subcategories.map((subcategory) => ({ ...subcategory })) })),
    discoveryPurposeCategories: discoveryPurposeCategories.map((category) => ({ ...category })),
    discoveryRarities: discoveryRarities.map((rarity) => ({ ...rarity })),
    discoveries: canonicalDiscoveries.map((discovery) => ({ ...discovery, assetProfile: { ...discovery.assetProfile, variants: [...discovery.assetProfile.variants] }, spawnRules: { ...discovery.spawnRules } })),
    discoveryCollections: discoveryCollections.map((collection) => ({ ...collection, discoveryIds: [...collection.discoveryIds] })),
    discoveryChains: discoveryChains.map((chain) => ({ ...chain, nodes: chain.nodes.map((node) => ({ ...node, unlocks: [...node.unlocks] })) })),
    discoveryMilestones: discoveryMilestones.map((milestone) => ({ ...milestone, categoryIds: [...milestone.categoryIds] })),
    discoveryPlayerCollectionSchema,
    universalDiscoveryRegistry: universalDiscoveryRegistryContract,
    galaxyEngineContract: galaxyEnginePresentationContract,
    timeActionContract,
    actionSystem: canonicalActionSystem,
    planetOpportunityProfiles: canonicalPlanetOpportunityProfiles,
    planetDeepDataFramework,
    planetDataScreenContract,
    planetExplorationProgression,
    planetDevelopmentFramework,
    civilizationProgressionFramework,
    colonizationFramework,
    populationSimulationFramework,
    resourceEconomyLogisticsFramework,
    missionExpeditionFramework,
    dynamicEventFramework,
    environmentComposerContract: environmentComposerRuntimeContract(),
    designLanguage: noverisDesignLanguage,
    componentLibrary: noverisComponentLibrary,
    screenTemplateLibrary: noverisScreenTemplateLibrary,
    assetProductionRuntime: buildAssetProductionRuntimeManifest(assets),
    ...creatureRuntime,
    speciesPlates,
    planetDetailScreen: planetDetailScreenRuntimeContract,
    civilizationOperationsDeck: civilizationOperationsDeckContract,
    resources: ResourceService.catalog.map(resourceToRuntime),
    resourceTaxonomy: { version: ResourceService.taxonomyVersion, profileGenerationVersion: ResourceService.profileGenerationVersion, primaryCategories: RESOURCE_PRIMARY_CATEGORIES, validationStatus: ResourceService.validate().status },
    resourceMigrations: ResourceService.migrations.map((migration) => ({ ...migration })),
    buildingTaxonomy: canonicalBuildingTaxonomy,
    buildingLibrary: canonicalBuildingLibrary,
    buildingClassifications: buildBuildingClassifications(data.buildings),
    upgradeCategories: [...categories.values()].sort((left, right) => left.order - right.order),
    upgrades,
    upgradeTree,
    assets,
    balance: gameConstantsBalance(data.game_constants),
    clientProfiles: defaultClientProfiles()
  });
  return {
    ...runtime,
    identityRelationshipGraph: buildIdentityRelationshipGraphFromRuntime({
      resources: runtime.resources as unknown as Array<Record<string, unknown>>,
      discoveries: runtime.discoveries as unknown as Array<Record<string, unknown>>,
      buildingLibrary: runtime.buildingLibrary as unknown as Array<Record<string, unknown>>,
      upgrades: runtime.upgrades as unknown as Array<Record<string, unknown>>,
      assets: runtime.assets as unknown as Array<Record<string, unknown>>,
      species: runtime.species as unknown as Array<Record<string, unknown>>,
      speciesOccurrences: runtime.speciesOccurrences as unknown as Array<Record<string, unknown>>,
      speciesPlates: runtime.speciesPlates as unknown as Array<Record<string, unknown>>,
      planetPrompts: data.planet_prompt_library as unknown as Array<Record<string, unknown>>,
      research: data.research as unknown as Array<Record<string, unknown>>,
      actionSystem: runtime.actionSystem as unknown as Record<string, unknown>,
      dynamicEventFramework: runtime.dynamicEventFramework as unknown as Record<string, unknown>,
      missionExpeditionFramework: runtime.missionExpeditionFramework as unknown as Record<string, unknown>,
      planetDeepDataFramework: runtime.planetDeepDataFramework as unknown as Record<string, unknown>,
      componentLibrary: runtime.componentLibrary as unknown as Record<string, unknown>,
      screenTemplateLibrary: runtime.screenTemplateLibrary as unknown as Record<string, unknown>,
      designLanguage: runtime.designLanguage as unknown as Record<string, unknown>
    })
  };
}

export async function getGameRuntimeData() {
  const [base, store] = await Promise.all([buildBaseGameRuntimeData(), readImportStore()]);
  if (!store.appliedRuntimeData) return base;

  const merged = withCanonicalEraDefinitions({
    ...base,
    ...store.appliedRuntimeData,
    metadata: {
      ...base.metadata,
      ...store.appliedRuntimeData.metadata,
      contentVersion: Math.max(store.appliedRuntimeData.metadata.contentVersion, gameRuntimeContentVersion),
      saveMigrationHints: base.metadata.saveMigrationHints
    },
    economyDefinitions: base.economyDefinitions,
    economyBehaviorContracts: base.economyBehaviorContracts,
    eraEconomyProfiles: base.eraEconomyProfiles,
    economyUsageRelationships: base.economyUsageRelationships,
    inventoryResourceMetadata: base.inventoryResourceMetadata,
    resourceProducerDefinitions: base.resourceProducerDefinitions,
    buildingResourceEffects: base.buildingResourceEffects,
    economyScopeRules: base.economyScopeRules,
    economyTransactionReasons: base.economyTransactionReasons,
    economyRateBreakdownDefinitions: base.economyRateBreakdownDefinitions,
    offlineProgressionPolicies: base.offlineProgressionPolicies,
    economyCalculationRules: base.economyCalculationRules,
    laborGenerationFramework: base.laborGenerationFramework,
    aiLibrary: base.aiLibrary,
    aiCategories: base.aiCategories,
    aiRarity: base.aiRarity,
    aiPersonalityCatalog: base.aiPersonalityCatalog,
    aiVoiceCatalog: base.aiVoiceCatalog,
    aiAssignmentRoles: base.aiAssignmentRoles,
    aiAgents: base.aiAgents,
    aiAgentVariants: base.aiAgentVariants,
    aiAgentPersonalities: base.aiAgentPersonalities,
    aiAgentAnimationProfiles: base.aiAgentAnimationProfiles,
    automationPresentation: base.automationPresentation,
    defaultAiAgentId: base.defaultAiAgentId,
    aiAgentSaveSchema: base.aiAgentSaveSchema,
    discoveryCategories: base.discoveryCategories,
    discoveryPurposeCategories: base.discoveryPurposeCategories,
    discoveryRarities: base.discoveryRarities,
    discoveries: base.discoveries,
    discoveryCollections: base.discoveryCollections,
    discoveryChains: base.discoveryChains,
    discoveryMilestones: base.discoveryMilestones,
    discoveryPlayerCollectionSchema: base.discoveryPlayerCollectionSchema,
    universalDiscoveryRegistry: base.universalDiscoveryRegistry,
    galaxyEngineContract: base.galaxyEngineContract,
    timeActionContract: base.timeActionContract,
    actionSystem: base.actionSystem,
    planetOpportunityProfiles: base.planetOpportunityProfiles,
    planetDeepDataFramework: base.planetDeepDataFramework,
    planetDataScreenContract: base.planetDataScreenContract,
    planetExplorationProgression: base.planetExplorationProgression,
    planetDevelopmentFramework: base.planetDevelopmentFramework,
    civilizationProgressionFramework: base.civilizationProgressionFramework,
    colonizationFramework: base.colonizationFramework,
    populationSimulationFramework: base.populationSimulationFramework,
    resourceEconomyLogisticsFramework: base.resourceEconomyLogisticsFramework,
    missionExpeditionFramework: base.missionExpeditionFramework,
    dynamicEventFramework: base.dynamicEventFramework,
    environmentComposerContract: base.environmentComposerContract,
    designLanguage: base.designLanguage,
    componentLibrary: base.componentLibrary,
    screenTemplateLibrary: base.screenTemplateLibrary,
    assetProductionRuntime: base.assetProductionRuntime,
    identityRelationshipGraph: base.identityRelationshipGraph,
    speciesCategories: base.speciesCategories,
    speciesTaxonomyFrameworks: base.speciesTaxonomyFrameworks,
    species: base.species,
    speciesOccurrences: base.speciesOccurrences,
    speciesResourceYields: base.speciesResourceYields,
    creatureArtProfiles: base.creatureArtProfiles,
    creatureAnimationProfiles: base.creatureAnimationProfiles,
    creatureAudioProfiles: base.creatureAudioProfiles,
    creatureGeneratorContract: base.creatureGeneratorContract,
    creaturePromptOutputTypes: base.creaturePromptOutputTypes,
    creaturePromptLifecycleStages: base.creaturePromptLifecycleStages,
    creaturePromptBatchActions: base.creaturePromptBatchActions,
    creaturePromptModelProfiles: base.creaturePromptModelProfiles,
    creaturePromptTypeTemplates: base.creaturePromptTypeTemplates,
    speciesPlates: base.speciesPlates,
    planetDetailScreen: base.planetDetailScreen,
    civilizationOperationsDeck: base.civilizationOperationsDeck,
    resourceTaxonomy: base.resourceTaxonomy,
    resourceMigrations: base.resourceMigrations,
    resources: base.resources,
    upgradeTree: base.upgradeTree,
    balance: {
      ...store.appliedRuntimeData.balance,
      startingPopulation: base.balance.startingPopulation
    }
  });
  return {
    ...merged,
    metadata: {
      ...merged.metadata,
      validationStatus: validateGameRuntimeData(merged).status
    }
  };
}

function normalizeImportedEras(payload: Record<string, unknown>, fallback: EraDefinition[]) {
  const rows = asArray(payload.eras);
  if (!rows.length) return fallback;

  return rows.map((item, index): EraDefinition => {
    const row = asRecord(item);
    const displayName = display(row.displayName ?? row.name, requiredEraNames[index] ?? "Era");
    const id = eraIdFor(row.id ?? displayName);
    return {
      id,
      index: asNumber(row.index ?? row.order, index + 1),
      name: display(row.name, stripAge(displayName)),
      displayName,
      shortDisplayName: display(row.shortDisplayName, stripAge(displayName)),
      description: display(row.description, `${displayName} progression era.`),
      unlockRequirements: asRecord(row.unlockRequirements),
      iconKey: display(row.iconKey, `era-${slug(displayName)}`),
      artKey: display(row.artKey, `era-${slug(displayName)}`),
      themeKey: display(row.themeKey, `theme-${slug(displayName)}`),
      masteryRequirements: asRecord(row.masteryRequirements),
      completionPercent: asNumber(row.completionPercent, 0),
      researchProgress: asNumber(row.researchProgress, 0),
      buildingProgress: asNumber(row.buildingProgress, 0),
      missingArtwork: asBoolean(row.missingArtwork, true),
      tags: asStringArray(row.tags)
    };
  });
}

function normalizeImportedCategories(payload: Record<string, unknown>, fallback: UpgradeCategory[]) {
  const rows = asArray(payload.upgradeCategories ?? payload.upgrade_tabs ?? payload.upgradeTabs);
  if (!rows.length) return fallback;

  return rows.map((item, index): UpgradeCategory => {
    const row = asRecord(item);
    const id = slug(display(row.id ?? row.tabId ?? row.name ?? row.displayName, `category-${index + 1}`));
    const presentation = asRecord(row.presentation);
    const defaults = categoryPresentationFor(id);
    return {
      id,
      displayName: display(row.displayName ?? row.name, id),
      description: display(row.description, "Imported upgrade category."),
      order: asNumber(row.order, index + 1),
      unlockedAtGameStart: asBoolean(row.unlockedAtGameStart, index === 0),
      unlockRequirements: asRecord(row.unlockRequirements),
      iconKey: display(row.iconKey, `upgrade-category-${id}`),
      themeKey: display(row.themeKey, `theme-${id}`),
      presentation: {
        backgroundArtKey: display(presentation.backgroundArtKey, defaults.backgroundArtKey),
        fallbackBackgroundArtKey: display(presentation.fallbackBackgroundArtKey, defaults.fallbackBackgroundArtKey),
        selectedTabArtKey: presentation.selectedTabArtKey ? display(presentation.selectedTabArtKey) : defaults.selectedTabArtKey,
        iconArtKey: presentation.iconArtKey ? display(presentation.iconArtKey) : defaults.iconArtKey
      }
    };
  });
}

function normalizeImportedUpgrades(payload: Record<string, unknown>, fallback: UpgradeDefinition[]) {
  const rows = asArray(payload.upgrades);
  if (!rows.length) return fallback;

  return rows.map((item, index): UpgradeDefinition => {
    const row = asRecord(item);
    const categoryId = slug(display(row.categoryId ?? row.tabId ?? row.type, "technology"));
    const eraIdValue = eraIdFor(row.eraId ?? row.era);
    return {
      id: display(row.id, `upgrade-${index + 1}`),
      categoryId,
      eraId: eraIdValue,
      chainId: display(row.chainId, slug(display(row.chain ?? row.tier ?? row.name, `chain-${index + 1}`))),
      order: asNumber(row.order, index + 1),
      name: display(row.name, `Upgrade ${index + 1}`),
      displayName: display(row.displayName ?? row.name, `Upgrade ${index + 1}`),
      description: display(row.description, "Imported upgrade."),
      iconKey: display(row.iconKey ?? row.icon_name, `upgrade-${slug(display(row.name, `upgrade-${index + 1}`))}`),
      defaultLevel: asNumber(row.defaultLevel, 0),
      maxLevel: Math.max(1, asNumber(row.maxLevel ?? row.max_level, 1)),
      baseCost: Math.max(0, asNumber(row.baseCost ?? row.base_cost, 0)),
      costResourceId: resolveResourceId(row.costResourceId ?? row.cost_resource),
      costGrowthRate: Math.max(1, asNumber(row.costGrowthRate ?? row.cost_multiplier, 1)),
      effectType: display(row.effectType ?? row.bonus_type, "modifier"),
      baseEffectValue: asNumber(row.baseEffectValue, parseEffectValue(row.bonus_value)),
      effectGrowthRate: asNumber(row.effectGrowthRate, 1),
      unlockRequirements: asRecord(row.unlockRequirements),
      nextUpgradeIds: asStringArray(row.nextUpgradeIds ?? row.next_upgrades),
      visibilityRules: { ...visibilityRulesFor(eraIdValue, index + 1), ...asRecord(row.visibilityRules) } as VisibilityRules,
      tags: asStringArray(row.tags)
    };
  });
}

function normalizeImportedAssets(payload: Record<string, unknown>, fallback: AssetDefinition[]) {
  const rows = asArray(payload.assets);
  if (!rows.length) return fallback;

  return rows.map((item, index): AssetDefinition => {
    const row = asRecord(item);
    const id = display(row.id, `asset-${index + 1}`);
    return {
      id,
      name: display(row.name, id),
      type: display(row.type, "image"),
      category: display(row.category, "runtime"),
      artKey: display(row.artKey, slug(display(row.name, id))),
      width: row.width == null ? null : asNumber(row.width, 0),
      height: row.height == null ? null : asNumber(row.height, 0),
      aspectRatio: row.aspectRatio == null ? null : String(row.aspectRatio),
      status: display(row.status, "imported"),
      notes: display(row.notes, ""),
      platformMappings: asRecord(row.platformMappings) as AssetDefinition["platformMappings"]
    };
  });
}

function normalizeBalance(payload: Record<string, unknown>, fallback: BalanceDefinition): BalanceDefinition {
  const row = asRecord(payload.balance);
  if (!Object.keys(row).length) return fallback;
  return {
    ...fallback,
    version: display(row.version, fallback.version),
    startingCivilizationEnergy: asNumber(row.startingCivilizationEnergy, fallback.startingCivilizationEnergy),
    startingCoins: asNumber(row.startingCoins, fallback.startingCoins),
    startingResearch: asNumber(row.startingResearch, fallback.startingResearch),
    startingPopulation: asNumber(row.startingPopulation, fallback.startingPopulation),
    baseClickPower: asNumber(row.baseClickPower, fallback.baseClickPower),
    baseAutoClickPower: asNumber(row.baseAutoClickPower, fallback.baseAutoClickPower),
    autosaveSeconds: asNumber(row.autosaveSeconds, fallback.autosaveSeconds),
    notes: display(row.notes, fallback.notes),
    environmentOverrides: asRecord(row.environmentOverrides) as BalanceDefinition["environmentOverrides"],
    difficultyProfileOverrides: asRecord(row.difficultyProfileOverrides) as BalanceDefinition["difficultyProfileOverrides"]
  };
}

function normalizeClientProfiles(payload: Record<string, unknown>, fallback: ClientProfiles): ClientProfiles {
  const profiles = asRecord(payload.clientProfiles ?? payload.clientHints);
  if (!Object.keys(profiles).length) return fallback;

  const mergeProfile = (key: keyof ClientProfiles): ClientProfile => {
    const incoming = asRecord(profiles[key]);
    const inherited = key === "default" ? fallback.default.eraNavigation : fallback[key].eraNavigation ?? fallback.default.eraNavigation;
    return {
      ...fallback[key],
      ...incoming,
      eraNavigation: resolveEraNavigationProfile({
        ...(inherited ?? {}),
        ...asRecord(incoming.eraNavigation)
      })
    };
  };
  return {
    default: mergeProfile("default"),
    roblox: mergeProfile("roblox"),
    web: mergeProfile("web"),
    unity: mergeProfile("unity"),
    unreal: mergeProfile("unreal"),
    godot: mergeProfile("godot"),
    ios: buildMobileClientProfile("ios", mergeProfile("ios")),
    android: buildMobileClientProfile("android", mergeProfile("android"))
  };
}

function normalizedImportRuntimeData(base: GameRuntimeData, request: RuntimeImportRequest, contentVersion: number): GameRuntimeData {
  const payload = asRecord(request.payload);
  return {
    metadata: metadata({
      contentVersion,
      importedFrom: request.importedFrom ?? request.sourceType ?? "pasted_json",
      sourceProject: request.sourceProject ?? display(asRecord(payload.metadata).sourceProject, "Project Genesis Prototype"),
      sourceFormat: request.sourceFormat ?? "json",
      environment: request.environment ?? "development"
    }),
    eras: normalizeImportedEras(payload, base.eras),
    economyDefinitions: base.economyDefinitions,
    economyBehaviorContracts: base.economyBehaviorContracts,
    eraEconomyProfiles: base.eraEconomyProfiles,
    economyUsageRelationships: base.economyUsageRelationships,
    inventoryResourceMetadata: base.inventoryResourceMetadata,
    resourceProducerDefinitions: base.resourceProducerDefinitions,
    buildingResourceEffects: base.buildingResourceEffects,
    economyScopeRules: base.economyScopeRules,
    economyTransactionReasons: base.economyTransactionReasons,
    economyRateBreakdownDefinitions: base.economyRateBreakdownDefinitions,
    offlineProgressionPolicies: base.offlineProgressionPolicies,
    economyCalculationRules: base.economyCalculationRules,
    laborGenerationFramework: base.laborGenerationFramework,
    discoveryCategories: base.discoveryCategories,
    discoveryPurposeCategories: base.discoveryPurposeCategories,
    discoveryRarities: base.discoveryRarities,
    discoveries: base.discoveries,
    discoveryCollections: base.discoveryCollections,
    discoveryChains: base.discoveryChains,
    discoveryMilestones: base.discoveryMilestones,
    discoveryPlayerCollectionSchema: base.discoveryPlayerCollectionSchema,
    universalDiscoveryRegistry: base.universalDiscoveryRegistry,
    galaxyEngineContract: base.galaxyEngineContract,
    timeActionContract: base.timeActionContract,
    actionSystem: base.actionSystem,
    planetOpportunityProfiles: base.planetOpportunityProfiles,
    planetDeepDataFramework: base.planetDeepDataFramework,
    planetDataScreenContract: base.planetDataScreenContract,
    planetExplorationProgression: base.planetExplorationProgression,
    planetDevelopmentFramework: base.planetDevelopmentFramework,
    civilizationProgressionFramework: base.civilizationProgressionFramework,
    colonizationFramework: base.colonizationFramework,
    populationSimulationFramework: base.populationSimulationFramework,
    resourceEconomyLogisticsFramework: base.resourceEconomyLogisticsFramework,
    missionExpeditionFramework: base.missionExpeditionFramework,
    dynamicEventFramework: base.dynamicEventFramework,
    environmentComposerContract: base.environmentComposerContract,
    designLanguage: base.designLanguage,
    componentLibrary: base.componentLibrary,
    screenTemplateLibrary: base.screenTemplateLibrary,
    assetProductionRuntime: base.assetProductionRuntime,
    speciesCategories: base.speciesCategories,
    speciesTaxonomyFrameworks: base.speciesTaxonomyFrameworks,
    species: base.species,
    speciesOccurrences: base.speciesOccurrences,
    speciesResourceYields: base.speciesResourceYields,
    creatureArtProfiles: base.creatureArtProfiles,
    creatureAnimationProfiles: base.creatureAnimationProfiles,
    creatureAudioProfiles: base.creatureAudioProfiles,
    creatureGeneratorContract: base.creatureGeneratorContract,
    creaturePromptOutputTypes: base.creaturePromptOutputTypes,
    creaturePromptLifecycleStages: base.creaturePromptLifecycleStages,
    creaturePromptBatchActions: base.creaturePromptBatchActions,
    creaturePromptModelProfiles: base.creaturePromptModelProfiles,
    creaturePromptTypeTemplates: base.creaturePromptTypeTemplates,
    speciesPlates: base.speciesPlates,
    planetDetailScreen: base.planetDetailScreen,
    civilizationOperationsDeck: base.civilizationOperationsDeck,
    resourceTaxonomy: base.resourceTaxonomy,
    resourceMigrations: base.resourceMigrations,
    resources: base.resources,
    buildingTaxonomy: base.buildingTaxonomy,
    buildingLibrary: base.buildingLibrary,
    buildingClassifications: base.buildingClassifications,
    upgradeCategories: normalizeImportedCategories(payload, base.upgradeCategories),
    upgrades: normalizeImportedUpgrades(payload, base.upgrades),
    upgradeTree: base.upgradeTree,
    assets: normalizeImportedAssets(payload, base.assets),
    balance: normalizeBalance(payload, base.balance),
    aiAgents: base.aiAgents,
    aiLibrary: base.aiLibrary,
    aiCategories: base.aiCategories,
    aiRarity: base.aiRarity,
    aiPersonalityCatalog: base.aiPersonalityCatalog,
    aiVoiceCatalog: base.aiVoiceCatalog,
    aiAssignmentRoles: base.aiAssignmentRoles,
    aiAgentVariants: base.aiAgentVariants,
    aiAgentPersonalities: base.aiAgentPersonalities,
    aiAgentAnimationProfiles: base.aiAgentAnimationProfiles,
    automationPresentation: base.automationPresentation,
    defaultAiAgentId: base.defaultAiAgentId,
    aiAgentSaveSchema: base.aiAgentSaveSchema,
    clientProfiles: normalizeClientProfiles(payload, base.clientProfiles)
  };
}

function compareRecords<T extends { id: string }>(moduleName: string, baseRows: T[], importedRows: T[], conflicts: ImportConflict[]) {
  const baseById = new Map(baseRows.map((row) => [row.id, row]));
  const newRecords: string[] = [];
  const updatedRecords: string[] = [];
  const unchangedRecords: string[] = [];

  for (const row of importedRows) {
    const existing = baseById.get(row.id);
    if (!existing) {
      newRecords.push(row.id);
      continue;
    }
    if (JSON.stringify(existing) === JSON.stringify(row)) {
      unchangedRecords.push(row.id);
      continue;
    }
    updatedRecords.push(row.id);
    for (const [field, importedValue] of Object.entries(row)) {
      const studioValue = (existing as Record<string, unknown>)[field];
      if (JSON.stringify(studioValue) !== JSON.stringify(importedValue) && importedValue !== "" && importedValue !== null && importedValue !== undefined) {
        conflicts.push({
          id: row.id,
          category: moduleName as ImportConflict["category"],
          field,
          studioValue,
          importedValue,
          recommendedResolution: moduleName === "resources" ? "keep_studio" : "merge"
        });
      }
    }
  }

  return { newRecords, updatedRecords, unchangedRecords };
}

export async function createImportPreview(request: RuntimeImportRequest = {}): Promise<ImportPreview> {
  const [base, store] = await Promise.all([buildBaseGameRuntimeData(), readImportStore()]);
  const contentVersion = Math.max(base.metadata.contentVersion, store.appliedRuntimeData?.metadata.contentVersion ?? 1) + 1;
  const normalized = normalizedImportRuntimeData(base, request, contentVersion);
  const validation = validateGameRuntimeData(normalized);
  normalized.metadata.validationStatus = validation.status;

  const conflicts: ImportConflict[] = [];
  const eraChanges = compareRecords("eras", base.eras, normalized.eras, conflicts);
  const resourceChanges = compareRecords("resources", base.resources, normalized.resources, conflicts);
  const categoryChanges = compareRecords("upgradeCategories", base.upgradeCategories, normalized.upgradeCategories, conflicts);
  const upgradeChanges = compareRecords("upgrades", base.upgrades, normalized.upgrades, conflicts);
  const assetChanges = compareRecords("assets", base.assets, normalized.assets, conflicts);
  const missingReferences = validation.issues.filter((issue) => /missing|resolve|reference/i.test(`${issue.code} ${issue.message}`));

  return {
    id: `runtime-import-${Date.now()}`,
    source: request.source ?? request.importedFrom ?? "Pasted JSON",
    sourceType: request.sourceType ?? "pasted_json",
    createdAt: new Date().toISOString(),
    validation,
    counts: {
      eras: normalized.eras.length,
      resources: normalized.resources.length,
      categories: normalized.upgradeCategories.length,
      upgrades: normalized.upgrades.length,
      assets: normalized.assets.length,
      balanceValues: 7,
      clientProfiles: Object.keys(normalized.clientProfiles).length
    },
    changes: {
      newRecords: {
        eras: eraChanges.newRecords,
        resources: resourceChanges.newRecords,
        upgradeCategories: categoryChanges.newRecords,
        upgrades: upgradeChanges.newRecords,
        assets: assetChanges.newRecords
      },
      updatedRecords: {
        eras: eraChanges.updatedRecords,
        resources: resourceChanges.updatedRecords,
        upgradeCategories: categoryChanges.updatedRecords,
        upgrades: upgradeChanges.updatedRecords,
        assets: assetChanges.updatedRecords
      },
      unchangedRecords: {
        eras: eraChanges.unchangedRecords,
        resources: resourceChanges.unchangedRecords,
        upgradeCategories: categoryChanges.unchangedRecords,
        upgrades: upgradeChanges.unchangedRecords,
        assets: assetChanges.unchangedRecords
      },
      conflicts,
      missingReferences
    },
    relationshipMap: relationshipMap(normalized),
    normalizedRuntimeData: normalized
  };
}

export async function applyImportPreview(request: RuntimeImportRequest = {}) {
  const preview = await createImportPreview(request);
  if (!preview.validation.valid) {
    return { ok: false as const, status: 409, preview };
  }

  const store = await readImportStore();
  const result: ImportResult = {
    importId: preview.id,
    source: preview.source,
    timestamp: new Date().toISOString(),
    schemaVersion: preview.normalizedRuntimeData.metadata.schemaVersion,
    recordsAdded: Object.values(preview.changes.newRecords).reduce((sum, rows) => sum + rows.length, 0),
    recordsUpdated: Object.values(preview.changes.updatedRecords).reduce((sum, rows) => sum + rows.length, 0),
    conflicts: preview.changes.conflicts.length,
    result: "applied"
  };

  await writeImportStore({
    appliedRuntimeData: preview.normalizedRuntimeData,
    history: [result, ...store.history].slice(0, 50)
  });

  return { ok: true as const, status: 200, preview, result };
}

export async function getRuntimeImportWorkspaceState() {
  const [runtimeData, store] = await Promise.all([getGameRuntimeData(), readImportStore()]);
  const validation = validateGameRuntimeData(runtimeData);
  return {
    runtimeData: { ...runtimeData, metadata: { ...runtimeData.metadata, validationStatus: validation.status } },
    validation,
    history: store.history,
    endpoint: "/api/export/game-runtime-data.json",
    previewEndpoint: "/api/game-runtime/import/preview",
    applyEndpoint: "/api/game-runtime/import/apply"
  };
}
