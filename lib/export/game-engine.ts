import { NextResponse } from "next/server";
import { defaultAiAgentVariantId, getAiAgentRuntimeModules } from "@/lib/ai-agents";
import { aiLibraryAssignmentRoles, aiLibraryCategories, aiLibraryPersonalities, aiLibraryRarities, aiLibraryVoices, canonicalAiLibraryAgents, validateCanonicalAiLibrary } from "@/lib/ai-agents/foundations";
import { canonicalActionSystem, validateActionSystem } from "@/lib/actions/action-system";
import { ARCHITECTURE_VERSION } from "@/lib/architecture/version";
import { civilizationOperationsDeckContract, validateCivilizationOperationsDeckContract } from "@/lib/assets/civilization-operations-deck";
import { planetDetailScreenRuntimeContract, validatePlanetDetailScreenContract } from "@/lib/assets/planet-detail-screen";
import { buildBuildingClassifications, canonicalBuildingLibrary, canonicalBuildingTaxonomy } from "@/lib/buildings/taxonomy";
import { civilizationProgressionFramework, validateCivilizationProgressionFramework } from "@/lib/civilization/progression-framework";
import { colonizationFramework, validateColonizationFramework } from "@/lib/colonization/framework";
import { getGameData } from "@/lib/data";
import { canonicalDiscoveries, discoveryCategories, discoveryChains, discoveryCollections, discoveryMilestones, discoveryPlayerCollectionSchema, discoveryRarities, validateDiscoverySystem } from "@/lib/discovery";
import { universalDiscoveryRegistryContract, validateUniversalDiscoveryRegistryContract } from "@/lib/discovery/universal-registry";
import { discoveryJournalSchema, sampleDiscoveryJournal, sampleTimelineEvents, timelineEventSchema } from "@/lib/explorer/discovery-log";
import { colonyBuildingTemplates, colonyFocusDefinitions, colonyLevelDefinitions, colonySchema, createColonyRecord, generateFallbackColonies, type ColonyBuilding, type ColonyRecord } from "@/lib/colonies/procedural";
import {
  buildBuildingResourceEffects,
  buildEconomyBehaviorContracts,
  buildEconomyCalculationRules,
  buildEconomyRateBreakdownDefinitions,
  buildEconomyScopeRules,
  buildEconomyTransactionReasons,
  buildEconomyUsageRelationships,
  buildEraEconomyProfiles,
  buildInventoryResourceMetadata,
  buildOfflineProgressionPolicies,
  buildPrimaryHudSlots,
  buildResourceProducerDefinitions,
  canonicalEconomyDefinitions,
  primaryHudEconomyIds
} from "@/lib/economy/definitions";
import { laborGenerationFramework, validateLaborGenerationFramework } from "@/lib/economy/labor-generation";
import { resourceEconomyLogisticsFramework, validateResourceEconomyLogisticsFramework } from "@/lib/economy/logistics-framework";
import { dynamicEventFramework, validateDynamicEventFramework } from "@/lib/events/framework";
import { environmentComposerRuntimeContract, validateEnvironmentComposerContract } from "@/lib/environment-composer";
import { buildUnityDesignLanguageExport, noverisDesignLanguage, validateDesignLanguage } from "@/lib/design-language";
import { buildUnityComponentLibraryExport, noverisComponentLibrary, validateComponentLibrary } from "@/lib/component-library";
import { buildUnityScreenTemplateExport, noverisScreenTemplateLibrary, validateScreenTemplateLibrary } from "@/lib/screen-template-library";
import { buildEconomyState, economySchemas, priceClamps, type MarketRecord, type ResourceListing, type TradeOpportunity, type TradeRoute } from "@/lib/economy/trade";
import { generateFaction, generateFallbackFactions, type FactionRecord } from "@/lib/factions/procedural";
import { missionExpeditionFramework, validateMissionExpeditionFramework } from "@/lib/missions/framework";
import { planetExplorationProgression, timeActionContract, validatePlanetExplorationProgression, validateTimeActionContract } from "@/lib/planets/exploration-progression";
import { planetDevelopmentFramework, validatePlanetDevelopmentFramework } from "@/lib/planets/development-framework";
import { canonicalPlanetOpportunityProfiles, resolvePlanetOpportunityProfileId, validatePlanetOpportunityProfiles } from "@/lib/planets/opportunity-profiles";
import { buildPlanetDeepDataFramework, ensurePlanetDeepData, planetDataScreenContract, validatePlanetDeepData } from "@/lib/planets/deep-data";
import { withFixedSolGeneratedPlanets } from "@/lib/planets/fixed-sol-planets";
import { populationSimulationFramework, validatePopulationSimulationFramework } from "@/lib/population/framework";
import { defaultEraNavigationProfile, engineEraNavigationOverrides, resolveEraNavigationProfile, supportedEraNavigationBoundaryModes, supportedEraNavigationDashboardModes } from "@/lib/runtime/client-profiles";
import { galaxyEngineContractVersion, galaxyEnginePresentationContract, validateGalaxyEnginePresentationContract } from "@/lib/runtime/galaxy-engine-contract";
import { buildMobileClientProfile, mobileAssetRequirements } from "@/lib/runtime/mobile-client-profiles";
import { gameRuntimeContentVersion, gameRuntimeSchemaVersion } from "@/lib/runtime/game-runtime";
import {
  generateMissionBundle,
  missionDifficulties,
  missionGenerationMetadata,
  missionSchemas,
  missionStatuses,
  missionTypes,
  objectiveTypes,
  rewardTypes,
  type MissionObjective,
  type MissionRecord,
  type MissionReward
} from "@/lib/missions/procedural";
import { getLocalBubbleSystems, generatedCelestialBodyRows, generatedStarSystemRows } from "@/lib/universe/fallback-data";
import { normalizePlanetResourceProfiles, validatePlanetResourceProfiles } from "@/lib/resources/planet-resource-profiles";
import { ResourceService } from "@/lib/resources/service";
import { buildCreatureRuntimeData } from "@/lib/life/creature-system";
import { speciesPlateAssetPackContract, validateSpeciesPlateAssetPack } from "@/lib/species-plates/asset-pack";
import { buildSpeciesPlateRuntimeData, validateSpeciesPlateRuntimeData } from "@/lib/species-plates/runtime";
import type { GameData, GeneratedPlanet, PlanetResourceProfile } from "@/types/schema";

export type EngineTarget = "roblox" | "unity" | "unreal" | "godot" | "web" | "generic";

type ExportIssueSeverity = "error" | "warning" | "info";

export type ExportValidationIssue = {
  severity: ExportIssueSeverity;
  code: string;
  message: string;
  records: string[];
};

export type EngineTargetConfig = {
  id: EngineTarget;
  label: string;
  format: string;
  endpoint: string;
  folderStructure: string[];
  generatedModules: string[];
  schemaMapping: string[];
  apiNotes: string[];
};

const targetConfigs: Record<EngineTarget, EngineTargetConfig> = {
  roblox: {
    id: "roblox",
    label: "Roblox / Lua",
    format: "Lua ModuleScripts plus JSON-compatible Studio data",
    endpoint: "/api/export/roblox",
    folderStructure: ["ReplicatedStorage/ProjectGenesis/Data", "ReplicatedStorage/ProjectGenesis/Services", "ServerScriptService/ProjectGenesis"],
    generatedModules: ["ResourceCatalogModule", "ResearchUnlockModule", "DiscoveryCatalogModule", "UniversalDiscoveryRegistryContract", "SpeciesPlateModule", "DesignLanguageModule", "ComponentLibraryModule", "ScreenTemplateLibraryModule", "UniverseDataModule", "ApiService"],
    schemaMapping: ["resource_catalog -> ResourceCatalogModule", "research + unlock_matrix -> ResearchUnlockModule", "discoveries + discovery_categories -> DiscoveryCatalogModule", "universal_discovery_registry -> UniversalDiscoveryRegistryContract", "screen_template_library -> ScreenTemplateLibraryModule", "colonization_framework + population_simulation_framework + resource_economy_logistics_framework + mission_expedition_framework + dynamic_event_framework -> UniverseDataModule", "galaxies/sectors/star_systems/planets/factions -> UniverseDataModule"],
    apiNotes: ["Roblox consumes Studio/API data; it is not the primary data generator.", "Use HttpService against the Generic JSON API for live sync workflows."]
  },
  unity: {
    id: "unity",
    label: "Unity / C#",
    format: "C# models, ScriptableObject guidance, and JSON import payloads",
    endpoint: "/api/export/unity",
    folderStructure: ["Assets/ProjectGenesis/Data", "Assets/ProjectGenesis/Scripts/Generated", "Assets/ProjectGenesis/ScriptableObjects"],
    generatedModules: ["ResourceCatalog.cs", "ResearchUnlocks.cs", "NoverisDesignLanguage.json", "NoverisComponentLibrary.json", "NoverisScreenTemplateLibrary.json", "UniverseLoader.cs"],
    schemaMapping: ["resource_catalog -> ResourceDefinition", "research + unlock_matrix -> ResearchUnlockDefinition", "screen_template_library -> NoverisScreenTemplateLibrary.json", "discoveries -> DiscoveryDefinition", "universe + factions -> UniverseData"],
    apiNotes: ["Import JSON at build time or pull from the Generic JSON API at runtime.", "ScriptableObjects should cache imported data, not replace Studio ownership."]
  },
  unreal: {
    id: "unreal",
    label: "Unreal / JSON DataTables",
    format: "JSON/DataTable-ready rows plus C++/Blueprint struct definitions",
    endpoint: "/api/export/unreal",
    folderStructure: ["Content/ProjectGenesis/Data", "Source/ProjectGenesis/Public/Generated", "Source/ProjectGenesis/Private/Loaders"],
    generatedModules: ["ResourceCatalog", "ResearchUnlockTable", "NoverisDesignLanguage.json", "NoverisComponentLibrary.json", "NoverisScreenTemplateLibrary.json", "UniverseData"],
    schemaMapping: ["resource_catalog -> FGenesisResourceRow", "unlock_matrix -> FGenesisResearchUnlockRow", "screen_template_library -> NoverisScreenTemplateLibrary.json", "discoveries -> FGenesisDiscoveryRow", "universe + factions -> FGenesisUniverseData"],
    apiNotes: ["Use DataTables for static builds or HTTP JSON for live tools.", "Structs mirror Studio IDs and relationships."]
  },
  godot: {
    id: "godot",
    label: "Godot / GDScript",
    format: "JSON exports with GDScript loader templates",
    endpoint: "/api/export/godot",
    folderStructure: ["res://project_genesis/data", "res://project_genesis/loaders", "res://project_genesis/autoload"],
    generatedModules: ["ResourceCatalog.gd", "ResearchUnlocks.gd", "NoverisDesignLanguage.json", "NoverisComponentLibrary.json", "NoverisScreenTemplateLibrary.json", "UniverseLoader.gd"],
    schemaMapping: ["resource_catalog -> ResourceCatalog.gd", "research + unlock_matrix -> ResearchUnlocks.gd", "screen_template_library -> NoverisScreenTemplateLibrary.json", "discoveries -> DiscoveryCatalog.gd", "universe + factions -> UniverseLoader.gd"],
    apiNotes: ["Load local JSON with FileAccess or fetch Studio exports with HTTPRequest.", "Keep gameplay rules in exported JSON, not duplicated GDScript tables."]
  },
  web: {
    id: "web",
    label: "Web Game / TypeScript",
    format: "TypeScript interfaces, JSON exports, API client, and store examples",
    endpoint: "/api/export/web",
    folderStructure: ["src/project-genesis/data", "src/project-genesis/api", "src/project-genesis/store"],
    generatedModules: ["project-genesis.types.ts", "NoverisDesignLanguage.json", "NoverisComponentLibrary.json", "NoverisScreenTemplateLibrary.json", "projectGenesisClient.ts", "projectGenesisStore.ts"],
    schemaMapping: ["canonical payload -> TypeScript interfaces", "screen_template_library -> NoverisScreenTemplateLibrary.json", "discoveries -> normalized discovery codex store", "factions -> normalized faction store", "endpoint references -> API client", "relationship map -> normalized store"],
    apiNotes: ["Use this target for browser games, tools, previews, and local editor clients.", "Zustand/Redux examples consume normalized canonical data."]
  },
  generic: {
    id: "generic",
    label: "Generic JSON API",
    format: "Clean normalized JSON, schema notes, and ID relationship map",
    endpoint: "/api/export/generic",
    folderStructure: ["project-genesis/data", "project-genesis/schema", "project-genesis/integration"],
    generatedModules: ["canonical-data.json", "design-language.json", "component-library.json", "screen-template-library.json", "schema-notes.json", "relationship-map.json"],
    schemaMapping: ["All targets consume the same canonical modules.", "screen_template_library -> semantic hierarchy, component, asset-role, and layout-mode contract.", "Engine-specific exports derive from this payload."],
    apiNotes: ["Use as the foundation for every other engine target.", "No engine-specific syntax is included in the canonical data."]
  }
};

const targetOrder: EngineTarget[] = ["roblox", "unity", "unreal", "godot", "web", "generic"];

type CanonicalModules = {
  resource_catalog: typeof ResourceService.catalog;
  resource_taxonomy: {
    version: typeof ResourceService.taxonomyVersion;
    profileGenerationVersion: typeof ResourceService.profileGenerationVersion;
    validationStatus: ReturnType<typeof ResourceService.validate>["status"];
  };
  resource_migrations: typeof ResourceService.migrations;
  planet_resource_profiles: ReturnType<typeof normalizePlanetResourceProfiles>;
  research: GameData["research"];
  building_taxonomy: typeof canonicalBuildingTaxonomy;
  building_library: typeof canonicalBuildingLibrary;
  building_classifications: ReturnType<typeof buildBuildingClassifications>;
  unlock_matrix: GameData["unlock_matrix"];
  galaxies: Array<Record<string, unknown>>;
  sectors: Array<Record<string, unknown>>;
  star_systems: GameData["star_systems"];
  planets: ExportGeneratedPlanet[];
  unassigned_planets: ExportUnassignedPlanet[];
  planet_rules: GameData["planets"];
  planet_deep_data_framework: ReturnType<typeof buildPlanetDeepDataFramework>;
  planet_data_screen_contract: typeof planetDataScreenContract;
  celestial_bodies: ExportCelestialBody[];
  planet_opportunity_profiles: typeof canonicalPlanetOpportunityProfiles;
  species_categories: ReturnType<typeof buildCreatureRuntimeData>["speciesCategories"];
  species_taxonomy_frameworks: ReturnType<typeof buildCreatureRuntimeData>["speciesTaxonomyFrameworks"];
  species: ReturnType<typeof buildCreatureRuntimeData>["species"];
  species_occurrences: ReturnType<typeof buildCreatureRuntimeData>["speciesOccurrences"];
  species_resource_yields: Array<ReturnType<typeof buildCreatureRuntimeData>["speciesResourceYields"][number] & { id: string }>;
  creature_art_profiles: ReturnType<typeof buildCreatureRuntimeData>["creatureArtProfiles"];
  creature_animation_profiles: ReturnType<typeof buildCreatureRuntimeData>["creatureAnimationProfiles"];
  creature_audio_profiles: ReturnType<typeof buildCreatureRuntimeData>["creatureAudioProfiles"];
  creature_generator_contract: ReturnType<typeof buildCreatureRuntimeData>["creatureGeneratorContract"];
  creature_prompt_output_types: ReturnType<typeof buildCreatureRuntimeData>["creaturePromptOutputTypes"];
  creature_prompt_lifecycle_stages: ReturnType<typeof buildCreatureRuntimeData>["creaturePromptLifecycleStages"];
  creature_prompt_batch_actions: ReturnType<typeof buildCreatureRuntimeData>["creaturePromptBatchActions"];
  creature_prompt_model_profiles: ReturnType<typeof buildCreatureRuntimeData>["creaturePromptModelProfiles"];
  creature_prompt_type_templates: ReturnType<typeof buildCreatureRuntimeData>["creaturePromptTypeTemplates"];
  species_plates: ReturnType<typeof buildSpeciesPlateRuntimeData>;
  species_plate_asset_pack: typeof speciesPlateAssetPackContract;
  discovery_journal: typeof sampleDiscoveryJournal;
  timeline_events: typeof sampleTimelineEvents;
  explorer_schemas: Array<Record<string, unknown>>;
  colonies: ColonyRecord[];
  colony_buildings: ColonyBuilding[];
  colony_level_definitions: Array<(typeof colonyLevelDefinitions)[number] & { id: string }>;
  colony_focus_definitions: typeof colonyFocusDefinitions;
  colony_building_templates: typeof colonyBuildingTemplates;
  markets: MarketRecord[];
  resource_listings: Array<ResourceListing & { id: string; marketId: string }>;
  trade_routes: TradeRoute[];
  trade_opportunities: TradeOpportunity[];
  economy_definitions: typeof canonicalEconomyDefinitions;
  economy_behavior_contracts: ReturnType<typeof buildEconomyBehaviorContracts>;
  resource_producer_definitions: ReturnType<typeof buildResourceProducerDefinitions>;
  building_resource_effects: ReturnType<typeof buildBuildingResourceEffects>;
  economy_scope_rules: ReturnType<typeof buildEconomyScopeRules>;
  economy_transaction_reasons: ReturnType<typeof buildEconomyTransactionReasons>;
  economy_rate_breakdown_definitions: ReturnType<typeof buildEconomyRateBreakdownDefinitions>;
  offline_progression_policies: ReturnType<typeof buildOfflineProgressionPolicies>;
  economy_calculation_rules: ReturnType<typeof buildEconomyCalculationRules>;
  labor_generation_framework: typeof laborGenerationFramework;
  era_economy_profiles: ReturnType<typeof buildEraEconomyProfiles>;
  hud_profile: Array<ReturnType<typeof buildPrimaryHudSlots>[number]>;
  primary_hud_resources: string[];
  era_navigation_profiles: Array<{ id: string; profileName: string; eraNavigation: ReturnType<typeof resolveEraNavigationProfile>; inheritsFrom: string | null; notes: string }>;
  client_profiles: Record<string, unknown>;
  mobile_asset_requirements: typeof mobileAssetRequirements;
  ai_library: typeof canonicalAiLibraryAgents;
  ai_categories: typeof aiLibraryCategories;
  ai_rarity: Array<(typeof aiLibraryRarities)[number]>;
  ai_personality_catalog: string[];
  ai_voice_catalog: string[];
  ai_assignment_roles: string[];
  ai_agents: ReturnType<typeof getAiAgentRuntimeModules>["aiAgents"];
  ai_agent_variants: ReturnType<typeof getAiAgentRuntimeModules>["aiAgentVariants"];
  ai_agent_personalities: ReturnType<typeof getAiAgentRuntimeModules>["aiAgentPersonalities"];
  ai_agent_animation_profiles: ReturnType<typeof getAiAgentRuntimeModules>["aiAgentAnimationProfiles"];
  automation_presentation: ReturnType<typeof getAiAgentRuntimeModules>["automationPresentation"];
  default_ai_agent_id: string;
  ai_agent_save_schema: ReturnType<typeof getAiAgentRuntimeModules>["aiAgentSaveSchema"];
  discovery_categories: typeof discoveryCategories;
  discovery_rarities: typeof discoveryRarities;
  discoveries: typeof canonicalDiscoveries;
  discovery_collections: Array<Omit<(typeof discoveryCollections)[number], "discoveryIds"> & { discoveryIds: string[] }>;
  discovery_chains: Array<Omit<(typeof discoveryChains)[number], "nodes"> & { nodes: Array<{ order: number; discoveryId: string; unlocks: string[] }> }>;
  discovery_milestones: Array<Omit<(typeof discoveryMilestones)[number], "categoryIds"> & { categoryIds: string[] }>;
  discovery_player_collection_schema: typeof discoveryPlayerCollectionSchema;
  universal_discovery_registry: typeof universalDiscoveryRegistryContract;
  galaxy_engine_contract: typeof galaxyEnginePresentationContract;
  time_action_contract: typeof timeActionContract;
  action_system: typeof canonicalActionSystem;
  planet_exploration_progression: typeof planetExplorationProgression;
  planet_development_framework: typeof planetDevelopmentFramework;
  civilization_progression_framework: typeof civilizationProgressionFramework;
  colonization_framework: typeof colonizationFramework;
  population_simulation_framework: typeof populationSimulationFramework;
  resource_economy_logistics_framework: typeof resourceEconomyLogisticsFramework;
  mission_expedition_framework: typeof missionExpeditionFramework;
  dynamic_event_framework: typeof dynamicEventFramework;
  environment_composer_contract: ReturnType<typeof environmentComposerRuntimeContract>;
  design_language: typeof noverisDesignLanguage;
  component_library: typeof noverisComponentLibrary;
  screen_template_library: typeof noverisScreenTemplateLibrary;
  planet_detail_screen: typeof planetDetailScreenRuntimeContract;
  civilization_operations_deck: typeof civilizationOperationsDeckContract;
  economy_usage_relationships: ReturnType<typeof buildEconomyUsageRelationships>;
  inventory_resource_metadata: ReturnType<typeof buildInventoryResourceMetadata>;
  economy_schemas: typeof economySchemas;
  pricing_rules: ReturnType<typeof buildEconomyState>["pricingRules"];
  market_level_definitions: ReturnType<typeof buildEconomyState>["marketLevelDefinitions"];
  economy: Array<Record<string, unknown>>;
  factions: FactionRecord[];
  missions: MissionRecord[];
  mission_objectives: MissionObjective[];
  mission_rewards: MissionReward[];
  mission_type_definitions: Array<{ id: string; missionType: string }>;
  mission_status_definitions: Array<{ id: string; status: string }>;
  mission_difficulty_definitions: Array<{ id: string; difficulty: string }>;
  mission_objective_type_definitions: Array<{ id: string; objectiveType: string }>;
  mission_reward_type_definitions: Array<{ id: string; rewardType: string }>;
  mission_generation_metadata: Array<{ id: string; metadata: typeof missionGenerationMetadata }>;
  mission_schemas: Array<{ id: string; schemas: typeof missionSchemas }>;
};

type ExportGeneratedPlanet = GeneratedPlanet & {
  galaxyId: string;
  galaxyName: string;
  sectorId: string;
  sectorName: string;
  starSystemId: string;
  starSystemName: string;
  galaxy_id: string;
  sector_id: string;
  star_system_id: string;
  orbitIndex: number;
  parentStarClass: string;
  parentStarSeed: string;
  generatedName: string;
  displayName: string;
  opportunityProfileId: string;
  opportunity_profile_id: string;
};

type ExportUnassignedPlanet = GeneratedPlanet & {
  export_status: "unassigned";
  unassigned_reason: string;
};

type ExportCelestialBody = GameData["celestial_bodies"][number] & {
  generatedName: string;
  displayName: string;
  opportunityProfileId: string;
  opportunity_profile_id: string;
};

export function getEngineTargets() {
  return targetOrder.map((target) => targetConfigs[target]);
}

export function getEngineTargetConfig(target: EngineTarget) {
  return targetConfigs[target];
}

function placeholderModule(name: string) {
  return [
    {
      id: `${name}_placeholder`,
      status: "placeholder",
      notes: `${name} data is reserved for Studio-owned canonical records. Engine exports must consume this module when populated.`
    }
  ];
}

function uniqueById<T extends Record<string, unknown>>(rows: T[]) {
  const byId = new Map<string, T>();
  for (const row of rows) {
    const id = typeof row.id === "string" ? row.id : "";
    if (id && !byId.has(id)) byId.set(id, row);
  }
  return [...byId.values()];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function ensureSectorsForSystems(baseGalaxy: Record<string, unknown>, baseSector: Record<string, unknown>, starSystems: GameData["star_systems"]) {
  const sectors = uniqueById([baseSector]);
  const sectorIds = new Set(sectors.map((sector) => String(sector.id)));
  const galaxyId = String(baseGalaxy.id);

  for (const system of starSystems) {
    if (!system.sector_id || sectorIds.has(system.sector_id)) continue;
    sectors.push({
      id: system.sector_id,
      galaxy_id: galaxyId,
      sector_seed: `${system.sector_id}-seed`,
      sector_name: system.sector_id,
      sector_type: "Export Placeholder",
      sector_rarity: "Derived",
      system_count: starSystems.filter((candidate) => candidate.sector_id === system.sector_id).length,
      discovered: false,
      is_procedural: true,
      generation_version: "engine-export-v1"
    });
    sectorIds.add(system.sector_id);
  }

  return sectors;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function galaxyName(galaxy: Record<string, unknown>) {
  return asString(galaxy.name) || asString(galaxy.galaxy_name) || String(galaxy.id);
}

function systemReferenceCandidates(planet: GeneratedPlanet) {
  return [planet.starSystemId, planet.star_system_id, planet.star_system].filter(Boolean) as string[];
}

function findUnambiguousStarSystem(planet: GeneratedPlanet, starSystems: GameData["star_systems"]) {
  for (const candidate of systemReferenceCandidates(planet)) {
    const matches = starSystems.filter((system) => system.id === candidate || system.system_name === candidate);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) return null;
  }

  return null;
}

function normalizeExportPlanets(
  planets: GameData["generated_planets"],
  galaxies: Array<Record<string, unknown>>,
  sectors: Array<Record<string, unknown>>,
  starSystems: GameData["star_systems"],
  resourceProfiles: PlanetResourceProfile[]
) {
  const galaxyById = new Map(galaxies.map((galaxy) => [String(galaxy.id), galaxy]));
  const sectorById = new Map(sectors.map((sector) => [String(sector.id), sector]));
  const assigned: ExportGeneratedPlanet[] = [];
  const unassigned: ExportUnassignedPlanet[] = [];

  for (const planet of planets) {
    const system = findUnambiguousStarSystem(planet, starSystems);
    if (!system) {
      unassigned.push({
        ...planet,
        deepPlanetData: ensurePlanetDeepData(planet, resourceProfiles),
        export_status: "unassigned",
        unassigned_reason: "No unambiguous star system parent could be resolved from starSystemId, star_system_id, or star_system."
      });
      continue;
    }

    const sector = sectorById.get(system.sector_id);
    if (!sector) {
      unassigned.push({
        ...planet,
        deepPlanetData: ensurePlanetDeepData(planet, resourceProfiles),
        export_status: "unassigned",
        unassigned_reason: `Resolved star system ${system.id} but its sector ${system.sector_id} is not exported.`
      });
      continue;
    }

    const galaxy = galaxyById.get(String(sector.galaxy_id));
    if (!galaxy) {
      unassigned.push({
        ...planet,
        deepPlanetData: ensurePlanetDeepData(planet, resourceProfiles),
        export_status: "unassigned",
        unassigned_reason: `Resolved sector ${String(sector.id)} but its galaxy ${String(sector.galaxy_id)} is not exported.`
      });
      continue;
    }

    const sectorName = asString(sector.sector_name) || String(sector.id);
    const orbitIndex = Number(planet.orbitIndex ?? planet.orbit_position) || 0;
    const starType = system.star_type ?? planet.star_type ?? "Unknown";

    const namedPlanet = planet as GeneratedPlanet & { generatedName?: string; displayName?: string };

    assigned.push({
      ...planet,
      galaxyId: String(galaxy.id),
      galaxyName: galaxyName(galaxy),
      sectorId: String(sector.id),
      sectorName,
      starSystemId: system.id,
      starSystemName: system.system_name,
      galaxy_id: String(galaxy.id),
      sector_id: String(sector.id),
      star_system_id: system.id,
      galaxy_sector: sectorName,
      star_system: system.system_name,
      orbit_position: orbitIndex,
      orbitIndex,
      star_type: starType,
      parentStarClass: starType,
      parentStarSeed: system.system_seed,
      generatedName: namedPlanet.generatedName ?? planet.name,
      displayName: namedPlanet.displayName ?? planet.name,
      opportunityProfileId: resolvePlanetOpportunityProfileId(planet),
      opportunity_profile_id: resolvePlanetOpportunityProfileId(planet),
      deepPlanetData: ensurePlanetDeepData(planet, resourceProfiles)
    });
  }

  return { assigned, unassigned };
}

function buildExportFactions(
  galaxies: Array<Record<string, unknown>>,
  sectors: Array<Record<string, unknown>>,
  starSystems: GameData["star_systems"],
  planets: ExportGeneratedPlanet[]
) {
  const sectorById = new Map(sectors.map((sector) => [String(sector.id), sector]));
  const factions = new Map<string, FactionRecord>();

  for (const system of starSystems.slice(0, 36)) {
    const sector = sectorById.get(system.sector_id);
    if (!sector) continue;
    const faction = generateFaction({
      galaxyId: String(sector.galaxy_id),
      sectorId: String(sector.id),
      starSystemId: system.id,
      systemName: system.system_name,
      rarity: system.system_rarity,
      resourceBias: system.resource_bias,
      dangerLevel: system.danger_level
    });
    if (faction) factions.set(faction.id, faction);
  }

  for (const planet of planets.slice(0, 48)) {
    const faction = generateFaction({
      galaxyId: planet.galaxyId,
      sectorId: planet.sectorId,
      starSystemId: planet.starSystemId,
      planetId: planet.id,
      systemName: planet.starSystemName,
      planetName: planet.displayName || planet.name,
      rarity: planet.rarity,
      resourceBias: planet.resourceIds?.[0] ?? planet.resources?.[0],
      dangerLevel: planet.planet_class === "Lava" || planet.planet_class === "Void" ? 75 : 25
    });
    if (faction) factions.set(faction.id, faction);
  }

  if (!factions.size && galaxies.length) return generateFallbackFactions();
  return [...factions.values()];
}

function buildExportColonies(planets: ExportGeneratedPlanet[], factions: FactionRecord[]) {
  const factionByPlanet = new Map(factions.flatMap((faction) => faction.controlledPlanetIds.map((planetId) => [planetId, faction] as const)));
  const colonies = planets
    .filter((planet) => planet.colonized || planet.isColonizable || planet.colonizable || /earth|terran|temperate|ocean|garden/i.test(`${planet.name} ${planet.planet_class} ${planet.primary_biome}`))
    .slice(0, 24)
    .map((planet) => {
      const faction = factionByPlanet.get(planet.id);
      return createColonyRecord({
        planetId: planet.id,
        planetName: planet.displayName || planet.name,
        galaxyId: planet.galaxyId,
        sectorId: planet.sectorId,
        starSystemId: planet.starSystemId,
        ownerType: faction ? "faction" : "player",
        ownerFactionId: faction?.id,
        planetClass: planet.planet_class,
        biome: planet.primary_biome,
        rarity: planet.rarity,
        resources: planet.resources,
        resourceIds: planet.resourceIds,
        hazards: planet.hazards,
        colonizable: planet.colonized || planet.isColonizable,
        landable: true,
        faction,
        foundedAt: "derived"
      });
    });

  return colonies.length ? colonies : generateFallbackColonies();
}

function buildCanonicalModules(data: GameData): CanonicalModules {
  const localBubble = getLocalBubbleSystems(24);
  const starSystems = data.star_systems.length ? data.star_systems : (generatedStarSystemRows(24) as GameData["star_systems"]);
  const galaxies = [localBubble.galaxy];
  const sectors = ensureSectorsForSystems(localBubble.galaxy, localBubble.sector, starSystems);
  const celestialBodies = data.celestial_bodies.length ? data.celestial_bodies : (generatedCelestialBodyRows(5) as GameData["celestial_bodies"]);
  const exportPlanets = withFixedSolGeneratedPlanets(data.generated_planets, data.planet_render_library);
  const normalizedPlanets = normalizeExportPlanets(exportPlanets, galaxies, sectors, starSystems, data.planet_resource_profiles as PlanetResourceProfile[]);
  const factions = buildExportFactions(galaxies, sectors, starSystems, normalizedPlanets.assigned);
  const colonies = buildExportColonies(normalizedPlanets.assigned, factions);
  const economyState = buildEconomyState(colonies, factions, [], "derived");
  const buildingResourceEffects = buildBuildingResourceEffects(data);
  const aiAgentModules = getAiAgentRuntimeModules();
  const missionBundle = generateMissionBundle({
    missionSeed: "project-genesis-export-missions-v1",
    galaxies,
    sectors,
    starSystems,
    planets: normalizedPlanets.assigned,
    celestialBodies,
    factions,
    colonies,
    markets: economyState.markets,
    tradeRoutes: economyState.tradeRoutes,
    research: data.research,
    generatedAt: "derived"
  });
  const creatureRuntime = buildCreatureRuntimeData();
  const speciesPlates = buildSpeciesPlateRuntimeData(creatureRuntime.species);

  return {
    resource_catalog: ResourceService.catalog,
    resource_taxonomy: {
      version: ResourceService.taxonomyVersion,
      profileGenerationVersion: ResourceService.profileGenerationVersion,
      validationStatus: ResourceService.validate().status
    },
    resource_migrations: ResourceService.migrations,
    planet_resource_profiles: validatePlanetResourceProfiles(data.planet_resource_profiles as PlanetResourceProfile[]),
    research: data.research,
    building_taxonomy: canonicalBuildingTaxonomy,
    building_library: canonicalBuildingLibrary,
    building_classifications: buildBuildingClassifications(data.buildings),
    unlock_matrix: data.unlock_matrix,
    galaxies: galaxies.map((galaxy) => ({ ...galaxy, generatedName: galaxyName(galaxy), displayName: galaxyName(galaxy) })),
    sectors: sectors.map((sector) => ({ ...sector, generatedName: asString(sector.sector_name) || String(sector.id), displayName: asString(sector.sector_name) || String(sector.id) })),
    star_systems: starSystems.map((system) => ({ ...system, generatedName: system.system_name, displayName: system.system_name })),
    planets: normalizedPlanets.assigned,
    unassigned_planets: normalizedPlanets.unassigned,
    planet_rules: data.planets,
    planet_deep_data_framework: buildPlanetDeepDataFramework(data.planet_resource_profiles as PlanetResourceProfile[]),
    planet_data_screen_contract: planetDataScreenContract,
    celestial_bodies: celestialBodies.map((body) => ({
      ...body,
      generatedName: body.name,
      displayName: body.name,
      opportunityProfileId: resolvePlanetOpportunityProfileId(body),
      opportunity_profile_id: resolvePlanetOpportunityProfileId(body)
    })),
    planet_opportunity_profiles: canonicalPlanetOpportunityProfiles,
    species_categories: creatureRuntime.speciesCategories,
    species_taxonomy_frameworks: creatureRuntime.speciesTaxonomyFrameworks,
    species: creatureRuntime.species,
    species_occurrences: creatureRuntime.speciesOccurrences,
    species_resource_yields: creatureRuntime.speciesResourceYields.map((yieldRecord) => ({
      ...yieldRecord,
      id: `species-yield-${yieldRecord.speciesId}-${yieldRecord.resourceId}-${yieldRecord.yieldType}`
    })),
    creature_art_profiles: creatureRuntime.creatureArtProfiles,
    creature_animation_profiles: creatureRuntime.creatureAnimationProfiles,
    creature_audio_profiles: creatureRuntime.creatureAudioProfiles,
    creature_generator_contract: creatureRuntime.creatureGeneratorContract,
    creature_prompt_output_types: creatureRuntime.creaturePromptOutputTypes,
    creature_prompt_lifecycle_stages: creatureRuntime.creaturePromptLifecycleStages,
    creature_prompt_batch_actions: creatureRuntime.creaturePromptBatchActions,
    creature_prompt_model_profiles: creatureRuntime.creaturePromptModelProfiles,
    creature_prompt_type_templates: creatureRuntime.creaturePromptTypeTemplates,
    species_plates: speciesPlates,
    species_plate_asset_pack: speciesPlateAssetPackContract,
    discovery_journal: sampleDiscoveryJournal,
    timeline_events: sampleTimelineEvents,
    explorer_schemas: [
      {
        id: "discovery_journal_schema",
        module: "discovery_journal",
        playerSpecific: true,
        staticExportRule: "Static exports include schema and sample mock data only. Runtime/player journal data remains client or save scoped.",
        fields: discoveryJournalSchema
      },
      {
        id: "timeline_events_schema",
        module: "timeline_events",
        playerSpecific: true,
        staticExportRule: "Static exports include schema and sample mock data only. Runtime/player timeline data remains client or save scoped.",
        fields: timelineEventSchema
      },
      {
        id: "colony_management_schema",
        module: "colonies",
        playerSpecific: false,
        staticExportRule: "Static exports include canonical colony state, starter buildings, level definitions, focus definitions, and relationship maps.",
        fields: colonySchema
      }
    ],
    colonies,
    colony_buildings: colonies.flatMap((colony) => colony.buildings),
    colony_level_definitions: colonyLevelDefinitions.map((definition) => ({ id: `colony_level_${definition.level}`, ...definition })),
    colony_focus_definitions: colonyFocusDefinitions,
    colony_building_templates: colonyBuildingTemplates,
    markets: economyState.markets,
    resource_listings: economyState.markets.flatMap((market) => market.resourceListings.map((listing) => ({ ...listing, id: `${market.id}-${listing.resourceId}`, marketId: market.id }))),
    trade_routes: economyState.tradeRoutes,
    trade_opportunities: economyState.tradeOpportunities,
    economy_definitions: canonicalEconomyDefinitions,
    economy_behavior_contracts: buildEconomyBehaviorContracts(),
    resource_producer_definitions: buildResourceProducerDefinitions(data),
    building_resource_effects: buildingResourceEffects,
    economy_scope_rules: buildEconomyScopeRules(),
    economy_transaction_reasons: buildEconomyTransactionReasons(),
    economy_rate_breakdown_definitions: buildEconomyRateBreakdownDefinitions(),
    offline_progression_policies: buildOfflineProgressionPolicies(),
    economy_calculation_rules: buildEconomyCalculationRules(),
    labor_generation_framework: laborGenerationFramework,
    era_economy_profiles: buildEraEconomyProfiles(),
    hud_profile: buildPrimaryHudSlots(),
    primary_hud_resources: [...primaryHudEconomyIds],
    era_navigation_profiles: [
      {
        id: "era_navigation_default",
        profileName: "default",
        eraNavigation: defaultEraNavigationProfile,
        inheritsFrom: null,
        notes: "Studio-owned engine-agnostic navigation intent. Clients own layout and rendering."
      },
      ...Object.entries(engineEraNavigationOverrides).map(([profileName, overrides]) => ({
        id: `era_navigation_${profileName}`,
        profileName,
        eraNavigation: resolveEraNavigationProfile(overrides),
        inheritsFrom: "default",
        notes: "Engine override inherits unspecified eraNavigation fields from clientProfiles.default."
      }))
    ],
    client_profiles: (() => {
      const baseProfile = {
        defaultUpgradeRowsVisible: 6,
        futureUpgradeTeaserCount: 3,
        showUnknownUpgradeSlots: true,
        lockedOpacity: 0.55,
        availableGlowEnabled: true,
        primaryHudResources: [...primaryHudEconomyIds],
        primaryHudSlots: buildPrimaryHudSlots(),
        eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.web)
      };
      return {
        default: {
          ...baseProfile,
          defaultUpgradeRowsVisible: 4,
          futureUpgradeTeaserCount: 2,
          lockedOpacity: 0.45,
          eraNavigation: defaultEraNavigationProfile
        },
        web: baseProfile,
        ios: buildMobileClientProfile("ios", baseProfile),
        android: buildMobileClientProfile("android", baseProfile)
      };
    })(),
    mobile_asset_requirements: mobileAssetRequirements,
    ai_library: canonicalAiLibraryAgents,
    ai_categories: aiLibraryCategories,
    ai_rarity: aiLibraryRarities.map((rarity) => ({ ...rarity })),
    ai_personality_catalog: [...aiLibraryPersonalities],
    ai_voice_catalog: [...aiLibraryVoices],
    ai_assignment_roles: [...aiLibraryAssignmentRoles],
    ai_agents: aiAgentModules.aiAgents,
    ai_agent_variants: aiAgentModules.aiAgentVariants,
    ai_agent_personalities: aiAgentModules.aiAgentPersonalities,
    ai_agent_animation_profiles: aiAgentModules.aiAgentAnimationProfiles,
    automation_presentation: aiAgentModules.automationPresentation,
    default_ai_agent_id: aiAgentModules.defaultAiAgentId,
    ai_agent_save_schema: aiAgentModules.aiAgentSaveSchema,
    discovery_categories: discoveryCategories,
    discovery_rarities: discoveryRarities,
    discoveries: canonicalDiscoveries,
    discovery_collections: discoveryCollections.map((collection) => ({ ...collection, discoveryIds: [...collection.discoveryIds] })),
    discovery_chains: discoveryChains.map((chain) => ({
      ...chain,
      nodes: chain.nodes.map((node) => ({
        ...node,
        unlocks: [...node.unlocks]
      }))
    })),
    discovery_milestones: discoveryMilestones.map((milestone) => ({ ...milestone, categoryIds: [...milestone.categoryIds] })),
    discovery_player_collection_schema: discoveryPlayerCollectionSchema,
    universal_discovery_registry: universalDiscoveryRegistryContract,
    galaxy_engine_contract: galaxyEnginePresentationContract,
    time_action_contract: timeActionContract,
    action_system: canonicalActionSystem,
    planet_exploration_progression: planetExplorationProgression,
    planet_development_framework: planetDevelopmentFramework,
    civilization_progression_framework: civilizationProgressionFramework,
    colonization_framework: colonizationFramework,
    population_simulation_framework: populationSimulationFramework,
    resource_economy_logistics_framework: resourceEconomyLogisticsFramework,
    mission_expedition_framework: missionExpeditionFramework,
    dynamic_event_framework: dynamicEventFramework,
    environment_composer_contract: environmentComposerRuntimeContract(),
    design_language: noverisDesignLanguage,
    component_library: noverisComponentLibrary,
    screen_template_library: noverisScreenTemplateLibrary,
    planet_detail_screen: planetDetailScreenRuntimeContract,
    civilization_operations_deck: civilizationOperationsDeckContract,
    economy_usage_relationships: buildEconomyUsageRelationships(data),
    inventory_resource_metadata: buildInventoryResourceMetadata(data),
    economy_schemas: economySchemas,
    pricing_rules: economyState.pricingRules,
    market_level_definitions: economyState.marketLevelDefinitions,
    economy: [
      {
        id: "economy_canonical_summary",
        status: "canonical",
        globalEconomyDefinitions: canonicalEconomyDefinitions.length,
        behaviorContracts: buildEconomyBehaviorContracts().length,
        resourceProducers: buildResourceProducerDefinitions(data).length,
        buildingResourceEffects: buildingResourceEffects.length,
        primaryHudResources: [...primaryHudEconomyIds],
        eraEconomyProfiles: buildEraEconomyProfiles().length,
        markets: economyState.markets.length,
        tradeRoutes: economyState.tradeRoutes.length,
        tradeOpportunities: economyState.tradeOpportunities.length,
        pricingRule: economyState.pricingRules.formula
      }
    ],
    factions,
    missions: missionBundle.missions,
    mission_objectives: missionBundle.objectives,
    mission_rewards: missionBundle.rewards,
    mission_type_definitions: missionTypes.map((missionType) => ({ id: `mission_type_${missionType.toLowerCase()}`, missionType })),
    mission_status_definitions: missionStatuses.map((status) => ({ id: `mission_status_${status}`, status })),
    mission_difficulty_definitions: missionDifficulties.map((difficulty) => ({ id: `mission_difficulty_${difficulty}`, difficulty })),
    mission_objective_type_definitions: objectiveTypes.map((objectiveType) => ({ id: `mission_objective_type_${objectiveType}`, objectiveType })),
    mission_reward_type_definitions: rewardTypes.map((rewardType) => ({ id: `mission_reward_type_${rewardType}`, rewardType })),
    mission_generation_metadata: [{ id: "mission_generation_metadata_v1", metadata: missionGenerationMetadata }],
    mission_schemas: [{ id: "mission_schemas_v1", schemas: missionSchemas }]
  };
}

function moduleCount(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function buildRelationshipMap(modules: CanonicalModules) {
  const sectorsByGalaxy: Record<string, string[]> = {};
  const systemsBySector: Record<string, string[]> = {};
  const bodiesBySystem: Record<string, string[]> = {};
  const planetsBySystem: Record<string, string[]> = {};
  const resourcesByPlanet: Record<string, string[]> = {};
  const biomesByPlanet: Record<string, string[]> = {};
  const hazardsByPlanet: Record<string, string[]> = {};
  const factionsBySystem: Record<string, string[]> = {};
  const coloniesByPlanet: Record<string, string[]> = {};
  const coloniesBySystem: Record<string, string[]> = {};
  const colonyBuildingsByColony: Record<string, string[]> = {};
  const marketsByColony: Record<string, string[]> = {};
  const marketsBySystem: Record<string, string[]> = {};
  const marketsBySector: Record<string, string[]> = {};
  const listingsByMarket: Record<string, string[]> = {};
  const tradeRoutesByMarket: Record<string, string[]> = {};
  const objectivesByMission: Record<string, string[]> = {};
  const rewardsByMission: Record<string, string[]> = {};
  const missionsByFaction: Record<string, string[]> = {};
  const missionsByColony: Record<string, string[]> = {};
  const missionsByMarket: Record<string, string[]> = {};
  const missionsByTradeRoute: Record<string, string[]> = {};
  const missionsBySystem: Record<string, string[]> = {};
  const buildingLibraryByFamily: Record<string, string[]> = {};
  const buildingLibraryBySubcategory: Record<string, string[]> = {};
  const buildingClassificationsByFamily: Record<string, string[]> = {};
  const buildingClassificationsBySubcategory: Record<string, string[]> = {};
  const discoveriesByCategory: Record<string, string[]> = {};
  const discoveriesBySubcategory: Record<string, string[]> = {};
  const discoveriesByRarity: Record<string, string[]> = {};
  const discoveriesByCollection: Record<string, string[]> = {};
  const discoveryChainNodes: Record<string, string[]> = {};
  const economyUsage: Record<string, Record<string, string[]>> = {};

  for (const sector of modules.sectors) {
    const galaxyId = String(sector.galaxy_id ?? "");
    if (!galaxyId) continue;
    sectorsByGalaxy[galaxyId] = [...(sectorsByGalaxy[galaxyId] ?? []), String(sector.id)];
  }

  for (const system of modules.star_systems) {
    systemsBySector[system.sector_id] = [...(systemsBySector[system.sector_id] ?? []), system.id];
  }

  for (const body of modules.celestial_bodies) {
    bodiesBySystem[body.system_id] = [...(bodiesBySystem[body.system_id] ?? []), body.id];
  }

  for (const planet of modules.planets) {
    const systemId = planetSystemReference(planet, modules.star_systems);
    resourcesByPlanet[planet.id] = planet.deepPlanetData?.resourceOccurrences.map((occurrence) => occurrence.resourceId) ?? [];
    biomesByPlanet[planet.id] = planet.deepPlanetData?.biomes.map((occurrence) => occurrence.biomeProfileId) ?? [];
    hazardsByPlanet[planet.id] = planet.deepPlanetData?.hazards.map((occurrence) => occurrence.hazardProfileId) ?? [];
    if (!systemId) continue;
    planetsBySystem[systemId] = [...(planetsBySystem[systemId] ?? []), planet.id];
  }

  for (const faction of modules.factions) {
    factionsBySystem[faction.homeStarSystemId] = [...(factionsBySystem[faction.homeStarSystemId] ?? []), faction.id];
  }

  for (const colony of modules.colonies) {
    coloniesByPlanet[colony.planetId] = [...(coloniesByPlanet[colony.planetId] ?? []), colony.id];
    coloniesBySystem[colony.starSystemId] = [...(coloniesBySystem[colony.starSystemId] ?? []), colony.id];
    colonyBuildingsByColony[colony.id] = colony.buildings.map((building) => building.id);
  }

  for (const market of modules.markets) {
    if (market.colonyId) marketsByColony[market.colonyId] = [...(marketsByColony[market.colonyId] ?? []), market.id];
    if (market.starSystemId) marketsBySystem[market.starSystemId] = [...(marketsBySystem[market.starSystemId] ?? []), market.id];
    marketsBySector[market.sectorId] = [...(marketsBySector[market.sectorId] ?? []), market.id];
    listingsByMarket[market.id] = market.resourceListings.map((listing) => `${market.id}-${listing.resourceId}`);
  }

  for (const route of modules.trade_routes) {
    tradeRoutesByMarket[route.originMarketId] = [...(tradeRoutesByMarket[route.originMarketId] ?? []), route.id];
    tradeRoutesByMarket[route.destinationMarketId] = [...(tradeRoutesByMarket[route.destinationMarketId] ?? []), route.id];
  }

  for (const objective of modules.mission_objectives) {
    objectivesByMission[objective.missionId] = [...(objectivesByMission[objective.missionId] ?? []), objective.id];
  }

  for (const reward of modules.mission_rewards) {
    rewardsByMission[reward.missionId] = [...(rewardsByMission[reward.missionId] ?? []), reward.id];
  }

  for (const mission of modules.missions) {
    if (mission.issuingFactionId) missionsByFaction[mission.issuingFactionId] = [...(missionsByFaction[mission.issuingFactionId] ?? []), mission.id];
    if (mission.targetFactionId && mission.targetFactionId !== mission.issuingFactionId) missionsByFaction[mission.targetFactionId] = [...(missionsByFaction[mission.targetFactionId] ?? []), mission.id];
    if (mission.colonyId) missionsByColony[mission.colonyId] = [...(missionsByColony[mission.colonyId] ?? []), mission.id];
    if (mission.marketId) missionsByMarket[mission.marketId] = [...(missionsByMarket[mission.marketId] ?? []), mission.id];
    if (mission.tradeRouteId) missionsByTradeRoute[mission.tradeRouteId] = [...(missionsByTradeRoute[mission.tradeRouteId] ?? []), mission.id];
    if (mission.starSystemId) missionsBySystem[mission.starSystemId] = [...(missionsBySystem[mission.starSystemId] ?? []), mission.id];
  }

  for (const [relationshipType, rows] of Object.entries(modules.economy_usage_relationships)) {
    if (rows && typeof rows === "object" && !Array.isArray(rows)) {
      economyUsage[relationshipType] = rows as Record<string, string[]>;
    }
  }

  for (const definition of modules.building_library) {
    buildingLibraryByFamily[definition.familyId] = [...(buildingLibraryByFamily[definition.familyId] ?? []), definition.id];
    const key = `${definition.familyId}/${definition.subcategoryId}`;
    buildingLibraryBySubcategory[key] = [...(buildingLibraryBySubcategory[key] ?? []), definition.id];
  }

  for (const classification of modules.building_classifications) {
    buildingClassificationsByFamily[classification.primaryFamilyId] = [...(buildingClassificationsByFamily[classification.primaryFamilyId] ?? []), classification.buildingId];
    const key = `${classification.primaryFamilyId}/${classification.subcategoryId}`;
    buildingClassificationsBySubcategory[key] = [...(buildingClassificationsBySubcategory[key] ?? []), classification.buildingId];
  }

  for (const discovery of modules.discoveries) {
    discoveriesByCategory[discovery.categoryId] = [...(discoveriesByCategory[discovery.categoryId] ?? []), discovery.id];
    discoveriesBySubcategory[`${discovery.categoryId}/${discovery.subcategoryId}`] = [...(discoveriesBySubcategory[`${discovery.categoryId}/${discovery.subcategoryId}`] ?? []), discovery.id];
    discoveriesByRarity[discovery.rarity] = [...(discoveriesByRarity[discovery.rarity] ?? []), discovery.id];
  }

  for (const collection of modules.discovery_collections) {
    discoveriesByCollection[collection.id] = [...collection.discoveryIds];
  }

  for (const chain of modules.discovery_chains) {
    discoveryChainNodes[chain.id] = chain.nodes.map((node) => node.discoveryId);
  }

  return {
    sectorsByGalaxy,
    systemsBySector,
    bodiesBySystem,
    planetsBySystem,
    resourcesByPlanet,
    biomesByPlanet,
    hazardsByPlanet,
    factionsBySystem,
    coloniesByPlanet,
    coloniesBySystem,
    colonyBuildingsByColony,
    marketsByColony,
    marketsBySystem,
    marketsBySector,
    listingsByMarket,
    tradeRoutesByMarket,
    objectivesByMission,
    rewardsByMission,
    missionsByFaction,
    missionsByColony,
    missionsByMarket,
    missionsByTradeRoute,
    missionsBySystem,
    buildingLibraryByFamily,
    buildingLibraryBySubcategory,
    buildingClassificationsByFamily,
    buildingClassificationsBySubcategory,
    discoveriesByCategory,
    discoveriesBySubcategory,
    discoveriesByRarity,
    discoveriesByCollection,
    discoveryChainNodes,
    economyUsage
  };
}

function planetSystemReference(planet: GeneratedPlanet, starSystems: GameData["star_systems"]) {
  if (planet.starSystemId) return planet.starSystemId;
  if (planet.star_system_id) return planet.star_system_id;
  return starSystems.find((system) => system.system_name === planet.star_system || system.id === planet.star_system)?.id ?? "";
}

function planetSectorReference(planet: GeneratedPlanet) {
  return planet.sectorId ?? planet.sector_id ?? "";
}

function planetGalaxyReference(planet: GeneratedPlanet) {
  return planet.galaxyId ?? planet.galaxy_id ?? "";
}

function addIssue(issues: ExportValidationIssue[], severity: ExportIssueSeverity, code: string, message: string, records: string[] = []) {
  issues.push({ severity, code, message, records });
}

function validateStableIds(issues: ExportValidationIssue[], modules: CanonicalModules) {
  for (const [moduleName, rows] of Object.entries(modules)) {
    if (!Array.isArray(rows)) continue;
    const objectRows = rows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object" && !Array.isArray(row));
    if (!objectRows.length) continue;
    const idFor = (row: Record<string, unknown>) => moduleName === "ai_library" ? row.ai_id : moduleName === "species_plates" ? row.speciesPlateId : row.id;
    const missing = objectRows.map((row, index) => ({ row, index })).filter(({ row }) => typeof idFor(row) !== "string");
    if (missing.length) {
      addIssue(issues, "error", "missing_id", `${moduleName} has records without stable string IDs.`, missing.map(({ index }) => `${moduleName}[${index}]`));
    }

    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const row of objectRows) {
      const value = idFor(row);
      const id = typeof value === "string" ? value : "";
      if (!id) continue;
      if (seen.has(id)) duplicates.add(id);
      seen.add(id);
    }
    if (duplicates.size) {
      addIssue(issues, "error", "duplicate_id", `${moduleName} has duplicate IDs.`, [...duplicates]);
    }
  }
}

function validateResourceReferences(issues: ExportValidationIssue[], modules: CanonicalModules) {
  try {
    validatePlanetResourceProfiles(modules.planet_resource_profiles as unknown as PlanetResourceProfile[]);
  } catch (error) {
    addIssue(issues, "error", "invalid_resource_profile_id", error instanceof Error ? error.message : "Planet resource profile validation failed.");
  }

  for (const planet of modules.planets) {
    const ids = planet.resourceIds ?? [];
    const invalid = ids.filter((id) => !ResourceService.getById(id));
    if (invalid.length) {
      addIssue(issues, "error", "invalid_planet_resource_id", `${planet.id} references resource IDs that do not exist in resource_catalog.`, invalid);
    }
  }
}

function validateUnlocks(issues: ExportValidationIssue[], modules: CanonicalModules) {
  const researchIds = new Set(modules.research.map((row) => row.id));
  const orphanSources = modules.unlock_matrix.filter((row) => row.source_type?.toLowerCase().includes("research") && row.source_id && !researchIds.has(row.source_id));

  if (orphanSources.length) {
    addIssue(issues, "error", "orphan_unlock_source", "unlock_matrix contains research source IDs that do not exist in research.", orphanSources.map((row) => row.id));
  }
}

function validateBuildingTaxonomy(issues: ExportValidationIssue[], modules: CanonicalModules) {
  if (modules.building_taxonomy.length !== 40) {
    addIssue(issues, "error", "building_taxonomy_family_count", "Building taxonomy must export exactly 40 primary families.", modules.building_taxonomy.map((family) => family.id));
  }
  if (modules.building_library.length < 500) {
    addIssue(issues, "error", "building_library_count", "Building library must export at least 500 scaffoldable building definitions.", [`${modules.building_library.length}`]);
  }
  const familyIds = new Set(modules.building_taxonomy.map((family) => family.id));
  const subcategoryIdsByFamily = new Map(modules.building_taxonomy.map((family) => [family.id, new Set(family.subcategories.map((subcategory) => subcategory.id))]));
  const orders = modules.building_taxonomy.map((family) => family.displayOrder);
  if (new Set(orders).size !== orders.length) {
    addIssue(issues, "error", "building_taxonomy_order_duplicate", "Building taxonomy display orders must be unique.", modules.building_taxonomy.map((family) => family.id));
  }
  for (const family of modules.building_taxonomy) {
    if (family.subcategories.length < 2) {
      addIssue(issues, "error", "building_taxonomy_subcategory_missing", "Every building taxonomy family must include multiple subcategories.", [family.id]);
    }
  }
  for (const definition of modules.building_library) {
    const family = modules.building_taxonomy.find((row) => row.id === definition.familyId);
    if (!familyIds.has(definition.familyId) || !family) {
      addIssue(issues, "error", "building_library_family_missing", "Building library familyId must resolve to building_taxonomy.", [definition.id, definition.familyId]);
      continue;
    }
    if (!subcategoryIdsByFamily.get(definition.familyId)?.has(definition.subcategoryId)) {
      addIssue(issues, "error", "building_library_subcategory_missing", "Building library subcategoryId must resolve inside its family.", [definition.id, definition.subcategoryId]);
    }
    if (!definition.visualAssetRequirements.length || !definition.animationRequirements.length || !definition.soundRequirements.length) {
      addIssue(issues, "error", "building_library_requirements_missing", "Building library definitions must include visual, animation, and sound requirements.", [definition.id]);
    }
  }
  const classifiedBuildingIds = new Set<string>();
  const duplicateBuildingIds = new Set<string>();
  for (const classification of modules.building_classifications) {
    if (classifiedBuildingIds.has(classification.buildingId)) duplicateBuildingIds.add(classification.buildingId);
    classifiedBuildingIds.add(classification.buildingId);
    const family = modules.building_taxonomy.find((row) => row.id === classification.primaryFamilyId);
    if (!familyIds.has(classification.primaryFamilyId) || !family) {
      addIssue(issues, "error", "building_classification_family_missing", "Building classification primaryFamilyId must resolve to building_taxonomy.", [classification.id, classification.primaryFamilyId]);
      continue;
    }
    if (!family.subcategories.some((subcategory) => subcategory.id === classification.subcategoryId)) {
      addIssue(issues, "error", "building_classification_subcategory_missing", "Building classification subcategoryId must resolve inside its primary family.", [classification.id, classification.subcategoryId]);
    }
  }
  if (duplicateBuildingIds.size) {
    addIssue(issues, "error", "building_classification_duplicate", "Every building must export exactly one primary taxonomy classification.", [...duplicateBuildingIds]);
  }
}

function validateHierarchy(issues: ExportValidationIssue[], modules: CanonicalModules) {
  const galaxyIds = new Set(modules.galaxies.map((row) => String(row.id)));
  const sectorIds = new Set(modules.sectors.map((row) => String(row.id)));
  const systemIds = new Set(modules.star_systems.map((row) => row.id));

  const sectorsMissingGalaxies = modules.sectors.filter((row) => !galaxyIds.has(String(row.galaxy_id)));
  if (sectorsMissingGalaxies.length) {
    addIssue(issues, "error", "sector_parent_missing", "Some sectors do not link to an exported galaxy.", sectorsMissingGalaxies.map((row) => String(row.id)));
  }

  const systemsMissingSectors = modules.star_systems.filter((row) => !sectorIds.has(row.sector_id));
  if (systemsMissingSectors.length) {
    addIssue(issues, "error", "system_parent_missing", "Some star systems do not link to an exported sector.", systemsMissingSectors.map((row) => row.id));
  }

  const bodiesMissingSystems = modules.celestial_bodies.filter((row) => !systemIds.has(row.system_id));
  if (bodiesMissingSystems.length) {
    addIssue(issues, "error", "body_parent_missing", "Some celestial bodies do not link to an exported star system.", bodiesMissingSystems.map((row) => row.id));
  }

  const planetsMissingSystems = modules.planets.filter((row) => !planetSystemReference(row, modules.star_systems));
  if (planetsMissingSystems.length) {
    addIssue(issues, "error", "planet_parent_missing", "Some exported planets do not include a resolvable star system link.", planetsMissingSystems.map((row) => row.id));
  }

  const planetsMissingSectors = modules.planets.filter((row) => !sectorIds.has(planetSectorReference(row)));
  if (planetsMissingSectors.length) {
    addIssue(issues, "error", "planet_sector_missing", "Some exported planets do not include a resolvable sector link.", planetsMissingSectors.map((row) => row.id));
  }

  const planetsMissingGalaxies = modules.planets.filter((row) => !galaxyIds.has(planetGalaxyReference(row)));
  if (planetsMissingGalaxies.length) {
    addIssue(issues, "error", "planet_galaxy_missing", "Some exported planets do not include a resolvable galaxy link.", planetsMissingGalaxies.map((row) => row.id));
  }

  const coloniesMissingPlanets = modules.colonies.filter((row) => !row.planetId);
  if (coloniesMissingPlanets.length) {
    addIssue(issues, "error", "colony_planet_missing", "Some colonies do not include a planet link.", coloniesMissingPlanets.map((row) => row.id));
  }

  const coloniesMissingSystems = modules.colonies.filter((row) => !systemIds.has(row.starSystemId));
  if (coloniesMissingSystems.length) {
    addIssue(issues, "error", "colony_system_missing", "Some colonies do not link to an exported star system.", coloniesMissingSystems.map((row) => row.id));
  }

  const coloniesMissingSectors = modules.colonies.filter((row) => !sectorIds.has(row.sectorId));
  if (coloniesMissingSectors.length) {
    addIssue(issues, "error", "colony_sector_missing", "Some colonies do not link to an exported sector.", coloniesMissingSectors.map((row) => row.id));
  }

  const coloniesMissingGalaxies = modules.colonies.filter((row) => !galaxyIds.has(row.galaxyId));
  if (coloniesMissingGalaxies.length) {
    addIssue(issues, "error", "colony_galaxy_missing", "Some colonies do not link to an exported galaxy.", coloniesMissingGalaxies.map((row) => row.id));
  }
}

function validatePlanetOpportunities(issues: ExportValidationIssue[], modules: CanonicalModules) {
  const profileIds = new Set(modules.planet_opportunity_profiles.map((profile) => profile.id));
  const validationIssues = validatePlanetOpportunityProfiles(modules.planet_opportunity_profiles, [...modules.planets, ...modules.celestial_bodies]);

  for (const issue of validationIssues) {
    issues.push({
      severity: issue.severity,
      code: issue.code,
      message: issue.message,
      records: issue.records
    });
  }

  const planetsMissingProfiles = modules.planets.filter((planet) => !profileIds.has(planet.opportunityProfileId));
  if (planetsMissingProfiles.length) {
    addIssue(issues, "error", "planet_opportunity_profile_missing", "Every generated planet must reference a valid Planet Opportunity Profile.", planetsMissingProfiles.map((planet) => planet.id));
  }

  const bodiesMissingProfiles = modules.celestial_bodies.filter((body) => !profileIds.has(body.opportunityProfileId));
  if (bodiesMissingProfiles.length) {
    addIssue(issues, "error", "celestial_body_opportunity_profile_missing", "Every generated celestial body must reference a valid Planet Opportunity Profile.", bodiesMissingProfiles.map((body) => body.id));
  }
}

function validatePlanetDeepDataExport(issues: ExportValidationIssue[], modules: CanonicalModules) {
  const resourceIds = new Set(modules.resource_catalog.map((resource) => resource.id));
  const planetTypeIds = new Set(modules.planet_deep_data_framework.planetTypeProfiles.map((profile) => profile.canonicalId));

  if (modules.planet_data_screen_contract.id !== modules.planet_deep_data_framework.dataScreenContract.id) {
    addIssue(issues, "error", "planet_data_screen_contract_mismatch", "Planet Data Screen contract must match the canonical deep-data framework.");
  }

  for (const distribution of modules.planet_deep_data_framework.resourceDistributionProfiles) {
    const invalidResources = distribution.resourceRules.filter((rule) => !resourceIds.has(rule.resourceId)).map((rule) => rule.resourceId);
    if (invalidResources.length) {
      addIssue(issues, "error", "planet_distribution_resource_missing", `Resource distribution profile ${distribution.profileId} references missing resources.`, invalidResources);
    }
    const invalidTypes = distribution.compatiblePlanetTypeIds.filter((id) => !planetTypeIds.has(id));
    if (invalidTypes.length) {
      addIssue(issues, "error", "planet_distribution_type_missing", `Resource distribution profile ${distribution.profileId} references missing Planet Types.`, invalidTypes);
    }
  }

  for (const planet of modules.planets) {
    if (!planet.deepPlanetData) {
      addIssue(issues, "error", "planet_deep_data_missing", `Planet ${planet.id} has no deep planetary data.`, [planet.id]);
      continue;
    }
    for (const issue of validatePlanetDeepData(planet.deepPlanetData)) {
      addIssue(
        issues,
        issue.severity === "error" ? "error" : issue.severity === "missing_optional_data" ? "info" : "warning",
        issue.code,
        issue.message,
        [planet.id, ...issue.relatedIds]
      );
    }
  }
}

function validatePlanetExploration(issues: ExportValidationIssue[], modules: CanonicalModules) {
  for (const issue of validateTimeActionContract(modules.time_action_contract)) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  for (const issue of validateActionSystem(modules.action_system, modules.time_action_contract)) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  for (const issue of validatePlanetExplorationProgression(modules.planet_exploration_progression, modules.time_action_contract)) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  for (const issue of validatePlanetDevelopmentFramework(modules.planet_development_framework, new Set(modules.action_system.actionDefinitions.map((action) => action.id)), new Set(modules.planet_opportunity_profiles.map((profile) => profile.id)))) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  for (const issue of validateCivilizationProgressionFramework(modules.civilization_progression_framework, new Set(modules.action_system.actionDefinitions.map((action) => action.id)), modules.planet_development_framework.id)) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
}

function validateEconomy(issues: ExportValidationIssue[], modules: CanonicalModules) {
  const marketIds = new Set(modules.markets.map((market) => market.id));
  const colonyIds = new Set(modules.colonies.map((colony) => colony.id));
  const economyIds = new Set(modules.economy_definitions.map((definition) => definition.id));
  const duplicateEconomyIds = modules.economy_definitions.map((definition) => definition.id).filter((id, index, ids) => ids.indexOf(id) !== index);
  const hudOrders = modules.hud_profile.map((slot) => slot.order);
  const duplicateHudOrders = hudOrders.filter((order, index, orders) => orders.indexOf(order) !== index);

  if (duplicateEconomyIds.length) {
    addIssue(issues, "error", "duplicate_economy_id", "Economy definitions must use unique IDs.", duplicateEconomyIds);
  }

  const invalidEconomyNumbers = modules.economy_definitions.filter((definition) => !Number.isFinite(definition.startingAmount) || !Number.isFinite(definition.startingRate) || !Number.isFinite(definition.minimum));
  if (invalidEconomyNumbers.length) {
    addIssue(issues, "error", "invalid_economy_number", "Economy starting amounts, rates, and minimums must be finite.", invalidEconomyNumbers.map((definition) => definition.id));
  }

  const labor = modules.economy_definitions.find((definition) => definition.id === "ECON-LABOR");
  const credits = modules.economy_definitions.find((definition) => definition.id === "ECON-CREDITS");
  const population = modules.economy_definitions.find((definition) => definition.id === "ECON-POPULATION");
  const research = modules.economy_definitions.find((definition) => definition.id === "ECON-RESEARCH");
  const premiumCrystals = modules.economy_definitions.find((definition) => definition.id === "ECON-PREMIUM-CRYSTALS");
  const civilizationPoints = modules.economy_definitions.find((definition) => definition.id === "ECON-CIVILIZATION-POINTS");

  if (labor?.startingAmount !== 0 || labor?.startingRate !== 1 || labor?.manualClickTarget !== true) {
    addIssue(issues, "error", "labor_click_economy_invalid", "ECON-LABOR must start at 0, publish +1/sec base passive Labor, and remain the manual click economy.", ["ECON-LABOR"]);
  }

  const laborIconKey = String(labor?.iconKey ?? "");
  const creditsIconKey = String(credits?.iconKey ?? "");
  const forbiddenLaborIconKeys = [creditsIconKey, "nature_leaf"].filter(Boolean);
  if (laborIconKey !== "economy_labor" || forbiddenLaborIconKeys.includes(laborIconKey)) {
    addIssue(issues, "error", "labor_icon_key_invalid", "ECON-LABOR must use economy_labor and must not use the Credits coin or Nature icon.", ["ECON-LABOR"]);
  }

  if (credits?.startingAmount !== 0 || credits?.startingRate !== 0 || credits?.manualClickTarget === true || credits?.iconKey !== "economy_credits") {
    addIssue(issues, "error", "credits_default_invalid", "ECON-CREDITS must start at 0, have no passive Survival rate, use economy_credits, and must not be the click target.", ["ECON-CREDITS"]);
  }

  if (population?.startingAmount !== 5 || population?.startingRate !== 0 || population?.spendable !== false || population?.premium !== false || population?.manualClickTarget === true) {
    addIssue(issues, "error", "population_default_invalid", "ECON-POPULATION must start at 5 and remain non-spendable, non-premium, non-clicked workforce capacity.", ["ECON-POPULATION"]);
  }

  if (research?.startingAmount !== 0 || research?.startingRate !== 0) {
    addIssue(issues, "error", "research_starting_value_invalid", "ECON-RESEARCH must start at 0 with no starting rate.", ["ECON-RESEARCH"]);
  }

  if (premiumCrystals?.startingAmount !== 0 || premiumCrystals?.startingRate !== 0) {
    addIssue(issues, "error", "premium_crystals_starting_value_invalid", "ECON-PREMIUM-CRYSTALS must start at 0 with no starting rate.", ["ECON-PREMIUM-CRYSTALS"]);
  }

  if (civilizationPoints?.startingAmount !== 0 || civilizationPoints?.startingRate !== 0) {
    addIssue(issues, "error", "civilization_points_starting_value_invalid", "ECON-CIVILIZATION-POINTS must start at 0 with no starting rate.", ["ECON-CIVILIZATION-POINTS"]);
  }

  const premiumWithoutMarker = modules.economy_definitions.filter((definition) => definition.premium && !/premium/i.test(definition.id));
  if (premiumWithoutMarker.length) {
    addIssue(issues, "warning", "premium_economy_marker", "Premium economy values should be explicitly marked.", premiumWithoutMarker.map((definition) => definition.id));
  }

  const unresolvedHudIds = modules.primary_hud_resources.filter((economyId) => !economyIds.has(economyId));
  if (unresolvedHudIds.length) {
    addIssue(issues, "error", "hud_economy_missing", "Primary HUD resources must resolve to economy definitions.", unresolvedHudIds);
  }

  const invalidHudSlots = modules.hud_profile.filter((slot) => !economyIds.has(slot.economyId));
  if (invalidHudSlots.length) {
    addIssue(issues, "error", "hud_slot_economy_missing", "HUD slot economy IDs must resolve to economy definitions.", invalidHudSlots.map((slot) => slot.id));
  }

  if (duplicateHudOrders.length) {
    addIssue(issues, "error", "duplicate_hud_order", "HUD slot order must be unique.", duplicateHudOrders.map(String));
  }

  const expectedFixedHud = [...primaryHudEconomyIds];
  if (modules.primary_hud_resources.join("|") !== expectedFixedHud.join("|") || modules.hud_profile.map((slot) => slot.economyId).join("|") !== expectedFixedHud.join("|")) {
    addIssue(issues, "error", "fixed_hud_order_invalid", "Primary HUD resources must use the approved fixed five-slot order.", modules.primary_hud_resources);
  }

  const materialHudIds = modules.primary_hud_resources.filter((id) => Boolean(ResourceService.getById(id)) || /stone|wood|water|quartz|clay|sand|soil|coal/i.test(id));
  if (materialHudIds.length) {
    addIssue(issues, "error", "material_resource_in_hud", "Material resources must not be used as global HUD currencies.", materialHudIds);
  }

  const fiveHudIds = [...primaryHudEconomyIds];
  const contractByEconomy = new Map(modules.economy_behavior_contracts.map((contract) => [contract.economyId, contract]));
  const missingContracts = fiveHudIds.filter((economyId) => !contractByEconomy.has(economyId));
  if (missingContracts.length || modules.economy_behavior_contracts.length !== fiveHudIds.length) {
    addIssue(issues, "error", "economy_behavior_contracts_invalid", "Exports must include exactly one behavior contract for each permanent HUD economy.", missingContracts.length ? missingContracts : [`received:${modules.economy_behavior_contracts.length}`]);
  }
  const laborContract = contractByEconomy.get("ECON-LABOR");
  if (!laborContract?.manualProduction.target || laborContract.basePassiveRate !== 1 || !laborContract.automatedProduction.aiAgentTarget) {
    addIssue(issues, "error", "labor_contract_invalid", "Labor contract must define manual click, +1/sec base passive, and AI Agent Labor Assistance target.", ["ECON-LABOR"]);
  }
  const creditsContract = contractByEconomy.get("ECON-CREDITS");
  if (creditsContract?.basePassiveRate !== 0 || creditsContract?.manualProduction.enabled || creditsContract?.automatedProduction.aiAgentTarget) {
    addIssue(issues, "error", "credits_contract_invalid", "Credits contract must not define passive fallback, manual click, or AI Agent production.", ["ECON-CREDITS"]);
  }
  const populationContract = contractByEconomy.get("ECON-POPULATION");
  if (populationContract?.startingAmount !== 5 || !populationContract.integerOnly || populationContract.spendable || !populationContract.capacityResource) {
    addIssue(issues, "error", "population_contract_invalid", "Population contract must start at 5, be integer-only, capacity-focused, and non-spendable by default.", ["ECON-POPULATION"]);
  }
  const researchContract = contractByEconomy.get("ECON-RESEARCH");
  if (researchContract?.basePassiveRate !== 0 || researchContract?.manualProduction.enabled || researchContract?.startingAmount !== 0) {
    addIssue(issues, "error", "research_contract_invalid", "Research contract must start at 0 and avoid default/manual production.", ["ECON-RESEARCH"]);
  }
  const premiumContract = contractByEconomy.get("ECON-PREMIUM-CRYSTALS");
  if (premiumContract?.basePassiveRate !== 0 || premiumContract?.offlineProgressEligible || premiumContract?.buildingProduction.enabled || !premiumContract?.purchaseProduction.serverAuthoritativeRequired) {
    addIssue(issues, "error", "premium_contract_invalid", "Premium Crystals contract must forbid generic passive/building/offline production and require server-authoritative purchases.", ["ECON-PREMIUM-CRYSTALS"]);
  }

  const producerIds = new Set(modules.resource_producer_definitions.map((producer) => producer.id));
  for (const effect of modules.building_resource_effects) {
    if (!economyIds.has(effect.economyId)) addIssue(issues, "error", "building_resource_effect_economy_missing", "Building resource effects must reference valid economy IDs.", [effect.id, effect.economyId]);
    if (!producerIds.has(`producer_${effect.id}`)) addIssue(issues, "error", "building_resource_effect_producer_missing", "Building resource effects must have matching producer definitions.", [effect.id]);
    if (effect.economyId === "ECON-POPULATION" && !["capacity_increase", "instant_grant", "growth_rate"].includes(effect.effectKind)) addIssue(issues, "error", "population_effect_ambiguous", "Population building effects must distinguish capacity, grant, or growth.", [effect.id]);
  }
  for (const producer of modules.resource_producer_definitions) {
    if (!economyIds.has(producer.economyId)) addIssue(issues, "error", "resource_producer_economy_missing", "Resource producers must reference valid economy IDs.", [producer.id, producer.economyId]);
    if (producer.economyId === "ECON-CREDITS" && producer.sourceType === "base_system") addIssue(issues, "error", "credits_base_producer_forbidden", "Credits must not have a base passive producer.", [producer.id]);
    if (producer.economyId === "ECON-PREMIUM-CRYSTALS" && (producer.sourceType === "building" || producer.offlineEligible)) addIssue(issues, "error", "premium_unsafe_producer", "Premium Crystals must not have building or offline producers.", [producer.id]);
  }

  const expectedEraIds = ["survival", "ancient", "medieval", "renaissance", "industrial", "modern", "space-age", "interstellar", "galactic"];
  const profileEraIds = new Set(modules.era_economy_profiles.map((profile) => profile.eraId));
  const missingEraProfiles = expectedEraIds.filter((eraId) => !profileEraIds.has(eraId));
  if (modules.era_economy_profiles.length !== expectedEraIds.length || missingEraProfiles.length) {
    addIssue(issues, "error", "era_economy_profiles_missing", "Engine exports must include one era economy profile per canonical era.", missingEraProfiles.length ? missingEraProfiles : [`received:${modules.era_economy_profiles.length}`]);
  }
  for (const profile of modules.era_economy_profiles) {
    if (!profile.primaryEconomyId) {
      addIssue(issues, "error", "era_economy_primary_id_missing", "Era economy profiles must export primaryEconomyId explicitly.", [profile.id]);
    }
    if (profile.primaryEconomyId && profile.primaryEconomyId !== profile.activePrimaryEconomyId) {
      addIssue(issues, "error", "era_economy_primary_id_mismatch", "primaryEconomyId must match activePrimaryEconomyId.", [profile.id, profile.primaryEconomyId, profile.activePrimaryEconomyId]);
    }
    if (profile.primaryEconomyId && !profile.primaryEconomyIds.includes(profile.primaryEconomyId)) {
      addIssue(issues, "error", "era_economy_primary_id_not_listed", "primaryEconomyId must be listed in primaryEconomyIds.", [profile.id, profile.primaryEconomyId]);
    }
    const referencedEconomyIds = [profile.primaryEconomyId, profile.activePrimaryEconomyId, profile.manualClickTarget, ...profile.primaryEconomyIds, ...profile.secondaryEconomyIds, ...profile.fixedHudSlots, ...profile.visibleHudEconomyIds, ...profile.hudSlots.map((slot) => slot.economyId), ...Object.keys(profile.displayOverrides ?? {})].filter(isNonEmptyString);
    const unresolved = referencedEconomyIds.filter((economyId) => !economyIds.has(economyId));
    if (unresolved.length) {
      addIssue(issues, "error", "era_economy_profile_reference_missing", "Era economy profile references must resolve to economy definitions.", [profile.id, ...new Set(unresolved)]);
    }
    if (profile.hudSlots.map((slot) => slot.economyId).join("|") !== profile.visibleHudEconomyIds.join("|")) {
      addIssue(issues, "error", "era_economy_hud_slots_mismatch", "Era economy profile HUD slots must match visibleHudEconomyIds.", [profile.id]);
    }
    if (profile.fixedHudSlots.join("|") !== expectedFixedHud.join("|") || profile.visibleHudEconomyIds.join("|") !== expectedFixedHud.join("|") || profile.hudSlots.map((slot) => slot.economyId).join("|") !== expectedFixedHud.join("|")) {
      addIssue(issues, "error", "era_fixed_hud_order_invalid", "Era economy profiles must preserve the fixed five-slot HUD order.", [profile.id]);
    }
    if (profile.visibilityRules.useEraHud !== false || profile.visibilityRules.fixedCoreHud !== true) {
      addIssue(issues, "error", "era_hud_rule_invalid", "Era profiles must not reorder the fixed core HUD.", [profile.id]);
    }
    if (!profile.permittedProducerSystems.length) {
      addIssue(issues, "error", "era_producer_systems_missing", "Era profiles must declare permitted producer systems.", [profile.id]);
    }
    const creditsOverride = profile.displayOverrides["ECON-CREDITS"];
    if (!creditsOverride?.displayName || !creditsOverride.iconKey) {
      addIssue(issues, "error", "credits_presentation_override_missing", "Every era must declare Credits presentation overrides while preserving ECON-CREDITS.", [profile.id]);
    }
  }

  const survivalProfile = modules.era_economy_profiles.find((profile) => profile.eraId === "survival");
  if (survivalProfile?.primaryEconomyId !== "ECON-LABOR" || survivalProfile?.activePrimaryEconomyId !== "ECON-LABOR" || survivalProfile?.manualClickTarget !== "ECON-LABOR" || survivalProfile?.visibleHudEconomyIds.join("|") !== expectedFixedHud.join("|")) {
    addIssue(issues, "error", "survival_economy_profile_invalid", "Survival must use Labor as primary/click economy and expose the fixed five-slot HUD including Credits in slot 2.", [survivalProfile?.id ?? "missing_survival_profile"]);
  }

  const invalidListings = modules.resource_listings.filter((listing) => !ResourceService.getById(listing.resourceId));
  if (invalidListings.length) {
    addIssue(issues, "error", "invalid_market_resource_id", "Some market resource listings reference resources outside resource_catalog.", invalidListings.map((listing) => listing.id));
  }

  const negativeListings = modules.resource_listings.filter((listing) => [listing.basePrice, listing.currentPrice, listing.supply, listing.demand, listing.stock, listing.stockCapacity].some((value) => value < 0));
  if (negativeListings.length) {
    addIssue(issues, "error", "negative_market_listing_value", "Some market listings contain negative price, supply, demand, or stock values.", negativeListings.map((listing) => listing.id));
  }

  const outOfClamp = modules.resource_listings.filter((listing) => listing.currentPrice < priceClamps.min || listing.currentPrice > priceClamps.max);
  if (outOfClamp.length) {
    addIssue(issues, "error", "market_price_out_of_bounds", "Some market listings have currentPrice outside configured clamps.", outOfClamp.map((listing) => listing.id));
  }

  const brokenMarketParents = modules.markets.filter((market) => market.parentMarketId && !marketIds.has(market.parentMarketId));
  if (brokenMarketParents.length) {
    addIssue(issues, "error", "market_parent_missing", "Some markets reference missing parent markets.", brokenMarketParents.map((market) => market.id));
  }

  const brokenMarketChildren = modules.markets.filter((market) => market.childMarketIds.some((childId) => !marketIds.has(childId)));
  if (brokenMarketChildren.length) {
    addIssue(issues, "error", "market_child_missing", "Some markets reference missing child markets.", brokenMarketChildren.map((market) => market.id));
  }

  const brokenRoutes = modules.trade_routes.filter((route) => !marketIds.has(route.originMarketId) || !marketIds.has(route.destinationMarketId));
  if (brokenRoutes.length) {
    addIssue(issues, "error", "trade_route_market_missing", "Some trade routes reference missing markets.", brokenRoutes.map((route) => route.id));
  }

  const coloniesWithoutMarkets = modules.colonies.filter((colony) => !modules.markets.some((market) => market.colonyId === colony.id));
  if (coloniesWithoutMarkets.length) {
    addIssue(issues, "error", "colony_market_missing", "Some colonies do not have a linked colony market.", coloniesWithoutMarkets.map((colony) => colony.id));
  }

  const marketsWithBadColonies = modules.markets.filter((market) => market.colonyId && !colonyIds.has(market.colonyId));
  if (marketsWithBadColonies.length) {
    addIssue(issues, "error", "market_colony_missing", "Some colony markets reference missing colonies.", marketsWithBadColonies.map((market) => market.id));
  }
}

function validateEraNavigationProfiles(issues: ExportValidationIssue[], modules: CanonicalModules) {
  const canonicalEraCount = 9;
  const defaultProfile = modules.era_navigation_profiles.find((profile) => profile.profileName === "default");
  if (!defaultProfile) {
    addIssue(issues, "error", "era_navigation_default_missing", "Engine exports must include the default era navigation profile.");
  }

  for (const profile of modules.era_navigation_profiles) {
    const eraNavigation = profile.eraNavigation;
    if (!supportedEraNavigationDashboardModes.includes(eraNavigation.dashboardMode)) {
      addIssue(issues, "error", "era_navigation_mode_invalid", "Era navigation dashboardMode is not supported.", [`${profile.profileName}:${eraNavigation.dashboardMode}`]);
    }
    if (!Number.isInteger(eraNavigation.visibleEraCount) || eraNavigation.visibleEraCount <= 0 || eraNavigation.visibleEraCount > canonicalEraCount) {
      addIssue(issues, "error", "era_navigation_visible_count_invalid", "Era navigation visibleEraCount must be a positive integer no larger than the canonical era count.", [`${profile.profileName}:${eraNavigation.visibleEraCount}`]);
    }
    if (typeof eraNavigation.fullTimelineEnabled !== "boolean" || typeof eraNavigation.allowPrimaryHorizontalScroll !== "boolean") {
      addIssue(issues, "error", "era_navigation_flags_invalid", "Era navigation timeline and scroll flags must be boolean.", [profile.profileName]);
    }
    const boundaryBehavior = eraNavigation.boundaryBehavior;
    if (!boundaryBehavior) {
      addIssue(issues, "error", "era_navigation_boundary_missing", "Era navigation profiles must include boundary behavior hints.", [profile.profileName]);
      continue;
    }
    for (const [key, value] of Object.entries(boundaryBehavior)) {
      if (!supportedEraNavigationBoundaryModes.includes(value)) {
        addIssue(issues, "error", "era_navigation_boundary_invalid", "Era navigation boundary behavior is not supported.", [`${profile.profileName}:${key}:${value}`]);
      }
    }
  }
}

function validateAiAgentModules(issues: ExportValidationIssue[], modules: CanonicalModules) {
  for (const message of validateCanonicalAiLibrary(modules.ai_library).issues) {
    issues.push({ severity: "error", code: "ai_library_invalid", message, records: ["ai_library"] });
  }
  const agentIds = new Set(modules.ai_agents.map((agent) => agent.id));
  const variantIds = new Set(modules.ai_agent_variants.map((variant) => variant.id));
  const personalityIds = new Set(modules.ai_agent_personalities.map((personality) => personality.id));
  const animationProfileIds = new Set(modules.ai_agent_animation_profiles.map((profile) => profile.id));
  const defaults = modules.ai_agents.filter((agent) => agent.defaultForNewPlayers);

  if (defaults.length !== 1) {
    addIssue(issues, "error", "ai_agent_default_count_invalid", "Engine exports must include exactly one default AI Agent.", defaults.map((agent) => agent.id));
  }
  if (!agentIds.has(modules.default_ai_agent_id)) {
    addIssue(issues, "error", "ai_agent_default_missing", "default_ai_agent_id must resolve to ai_agents.", [modules.default_ai_agent_id]);
  }
  const defaultAgent = modules.ai_agents.find((agent) => agent.id === modules.default_ai_agent_id);
  if (!defaultAgent || defaultAgent.status !== "available" || defaultAgent.approvalState !== "approved" || defaultAgent.publishState !== "published") {
    addIssue(issues, "error", "ai_agent_default_not_published", "Default AI Agent must be available, approved, and published.", [modules.default_ai_agent_id]);
  }
  if (modules.automation_presentation.systemId !== "automation" || modules.automation_presentation.displayName !== "AI Agent") {
    addIssue(issues, "error", "automation_presentation_invalid", "Automation presentation aliases must preserve the automation system while using AI Agent labels.", [modules.automation_presentation.id]);
  }
  if (modules.ai_agent_save_schema.selectedAiAgentIdDefault !== modules.default_ai_agent_id) {
    addIssue(issues, "error", "ai_agent_save_default_invalid", "AI Agent save schema default must resolve to the default AI Agent.", [modules.ai_agent_save_schema.id, modules.default_ai_agent_id]);
  }
  if (!variantIds.has(defaultAiAgentVariantId)) {
    addIssue(issues, "error", "ai_agent_default_variant_missing", "Engine exports must include the default AI Agent variant.", [defaultAiAgentVariantId]);
  }
  if (modules.ai_agent_save_schema.selectedAiAgentVariantIdDefault !== defaultAiAgentVariantId) {
    addIssue(issues, "error", "ai_agent_variant_save_default_invalid", "AI Agent save schema default must resolve to the default AI Agent variant.", [modules.ai_agent_save_schema.id, defaultAiAgentVariantId]);
  }

  for (const agent of modules.ai_agents) {
    if (!personalityIds.has(agent.personalityId)) {
      addIssue(issues, "error", "ai_agent_personality_missing", "AI Agent personality references must resolve.", [agent.id, agent.personalityId]);
    }
    if (!animationProfileIds.has(agent.animationProfileId)) {
      addIssue(issues, "error", "ai_agent_animation_missing", "AI Agent animation profile references must resolve.", [agent.id, agent.animationProfileId]);
    }
    if (Object.keys(agent.gameplayModifiers).length) {
      addIssue(issues, "error", "ai_agent_gameplay_modifier_forbidden", "AI Agents must not contain gameplay modifiers in v1.0.", [agent.id]);
    }
    if (!variantIds.has(agent.baseVariantId)) {
      addIssue(issues, "error", "ai_agent_base_variant_missing", "AI Agent baseVariantId must resolve.", [agent.id, agent.baseVariantId]);
    }
    for (const variantId of agent.availableVariantIds) {
      if (!variantIds.has(variantId)) addIssue(issues, "error", "ai_agent_available_variant_missing", "AI Agent availableVariantIds must resolve.", [agent.id, variantId]);
    }
    if (!agent.headAssetKey || !agent.eyesOpenAssetKey || !agent.eyesBlinkAssetKey || !agent.eyesClosedAssetKey) {
      addIssue(issues, "error", "ai_agent_required_asset_keys_missing", "AI Agents must include head, open-eye, blink, and offline/closed-eye asset keys.", [agent.id]);
    }
  }

  for (const variant of modules.ai_agent_variants) {
    if (!agentIds.has(variant.agentId)) {
      addIssue(issues, "error", "ai_agent_variant_agent_missing", "AI Agent variant agentId must resolve.", [variant.id, variant.agentId]);
    }
    if (variant.progressionMapping.cosmeticIdentity !== true || variant.progressionMapping.automationPowerSource !== "automation_upgrade_levels") {
      addIssue(issues, "error", "ai_agent_variant_progression_invalid", "AI Agent variants must remain cosmetic and use automation upgrade levels for Labor Assistance strength.", [variant.id]);
    }
    if (!variant.assetKeys.head || !variant.assetKeys.open || !variant.assetKeys.blink || !variant.assetKeys.offline) {
      addIssue(issues, "error", "ai_agent_variant_assets_missing", "AI Agent variants must include head, open, blink, and offline asset keys.", [variant.id]);
    }
  }
}

function missionTargetExists(targetType: string, targetId: string, modules: CanonicalModules) {
  const type = targetType.toLowerCase();
  const galaxyIds = new Set(modules.galaxies.map((row) => String(row.id)));
  const sectorIds = new Set(modules.sectors.map((row) => String(row.id)));
  const systemIds = new Set(modules.star_systems.map((row) => row.id));
  const planetIds = new Set([...modules.planets.map((row) => row.id), ...modules.celestial_bodies.map((row) => row.id)]);
  const colonyIds = new Set(modules.colonies.map((row) => row.id));
  const marketIds = new Set(modules.markets.map((row) => row.id));
  const tradeRouteIds = new Set(modules.trade_routes.map((row) => row.id));
  const factionIds = new Set(modules.factions.map((row) => row.id));
  const researchIds = new Set(modules.research.map((row) => row.id));
  const buildingIds = new Set([...modules.colony_buildings.map((row) => row.id), ...modules.colony_building_templates.map((row) => row.id)]);

  if (type === "galaxy") return galaxyIds.has(targetId);
  if (type === "sector") return sectorIds.has(targetId);
  if (type === "star_system") return systemIds.has(targetId);
  if (type === "planet" || type === "celestial_body") return planetIds.has(targetId);
  if (type === "colony") return colonyIds.has(targetId);
  if (type === "market") return marketIds.has(targetId);
  if (type === "trade_route") return tradeRouteIds.has(targetId);
  if (type === "faction") return factionIds.has(targetId);
  if (type === "research") return researchIds.has(targetId);
  if (type === "resource") return Boolean(ResourceService.getById(targetId));
  if (type === "building") return buildingIds.has(targetId);

  return galaxyIds.has(targetId) || sectorIds.has(targetId) || systemIds.has(targetId) || planetIds.has(targetId) || colonyIds.has(targetId) || marketIds.has(targetId) || tradeRouteIds.has(targetId) || factionIds.has(targetId) || researchIds.has(targetId) || buildingIds.has(targetId) || Boolean(ResourceService.getById(targetId));
}

function validateMissions(issues: ExportValidationIssue[], modules: CanonicalModules) {
  const missionIds = new Set(modules.missions.map((mission) => mission.id));
  const objectiveIds = new Set(modules.mission_objectives.map((objective) => objective.id));
  const rewardIds = new Set(modules.mission_rewards.map((reward) => reward.id));
  const factionIds = new Set(modules.factions.map((faction) => faction.id));
  const colonyIds = new Set(modules.colonies.map((colony) => colony.id));
  const marketIds = new Set(modules.markets.map((market) => market.id));
  const tradeRouteIds = new Set(modules.trade_routes.map((route) => route.id));
  const systemIds = new Set(modules.star_systems.map((system) => system.id));
  const planetIds = new Set([...modules.planets.map((planet) => planet.id), ...modules.celestial_bodies.map((body) => body.id)]);
  const researchIds = new Set(modules.research.map((row) => row.id));

  const objectivesMissingMissions = modules.mission_objectives.filter((objective) => !missionIds.has(objective.missionId));
  if (objectivesMissingMissions.length) {
    addIssue(issues, "error", "mission_objective_parent_missing", "Some mission objectives reference missing missions.", objectivesMissingMissions.map((objective) => objective.id));
  }

  const rewardsMissingMissions = modules.mission_rewards.filter((reward) => !missionIds.has(reward.missionId));
  if (rewardsMissingMissions.length) {
    addIssue(issues, "error", "mission_reward_parent_missing", "Some mission rewards reference missing missions.", rewardsMissingMissions.map((reward) => reward.id));
  }

  const missionsMissingObjectives = modules.missions.filter((mission) => mission.objectiveIds.some((objectiveId) => !objectiveIds.has(objectiveId)));
  if (missionsMissingObjectives.length) {
    addIssue(issues, "error", "mission_objective_missing", "Some missions reference missing objective IDs.", missionsMissingObjectives.map((mission) => mission.id));
  }

  const missionsMissingRewards = modules.missions.filter((mission) => mission.rewardIds.some((rewardId) => !rewardIds.has(rewardId)));
  if (missionsMissingRewards.length) {
    addIssue(issues, "error", "mission_reward_missing", "Some missions reference missing reward IDs.", missionsMissingRewards.map((mission) => mission.id));
  }

  const badObjectiveTargets = modules.mission_objectives.filter((objective) => !missionTargetExists(objective.targetType, objective.targetId, modules));
  if (badObjectiveTargets.length) {
    addIssue(issues, "error", "mission_objective_target_missing", "Some mission objectives reference missing targets.", badObjectiveTargets.map((objective) => `${objective.id}:${objective.targetId}`));
  }

  const badMissionLinks = modules.missions.filter(
    (mission) =>
      (mission.issuingFactionId && !factionIds.has(mission.issuingFactionId)) ||
      (mission.targetFactionId && !factionIds.has(mission.targetFactionId)) ||
      (mission.colonyId && !colonyIds.has(mission.colonyId)) ||
      (mission.marketId && !marketIds.has(mission.marketId)) ||
      (mission.tradeRouteId && !tradeRouteIds.has(mission.tradeRouteId)) ||
      (mission.starSystemId && !systemIds.has(mission.starSystemId)) ||
      (mission.planetId && !planetIds.has(mission.planetId)) ||
      mission.prerequisiteResearchIds.some((researchId) => !researchIds.has(researchId))
  );
  if (badMissionLinks.length) {
    addIssue(issues, "error", "mission_link_missing", "Some missions reference missing factions, locations, markets, routes, planets, or research prerequisites.", badMissionLinks.map((mission) => mission.id));
  }

  const badRewards = modules.mission_rewards.filter((reward) => (reward.resourceId && !ResourceService.getById(reward.resourceId)) || (reward.researchId && !researchIds.has(reward.researchId)) || (reward.factionId && !factionIds.has(reward.factionId)));
  if (badRewards.length) {
    addIssue(issues, "error", "mission_reward_target_missing", "Some mission rewards reference missing resource, research, or faction IDs.", badRewards.map((reward) => reward.id));
  }

  const completedIncomplete = modules.missions.filter((mission) => mission.status === "completed" && modules.mission_objectives.some((objective) => objective.missionId === mission.id && !objective.optional && !objective.completed));
  if (completedIncomplete.length) {
    addIssue(issues, "error", "mission_completed_with_incomplete_objectives", "Some completed missions still have incomplete required objectives.", completedIncomplete.map((mission) => mission.id));
  }

  const rewardsClaimedEarly = modules.missions.filter((mission) => mission.rewardsClaimed && mission.status !== "completed");
  if (rewardsClaimedEarly.length) {
    addIssue(issues, "error", "mission_rewards_claimed_before_completion", "Some missions have rewards claimed before completion.", rewardsClaimedEarly.map((mission) => mission.id));
  }
}

function validateTargetSchema(issues: ExportValidationIssue[], target: EngineTarget) {
  const config = getEngineTargetConfig(target);
  if (!config.generatedModules.length || !config.schemaMapping.length) {
    addIssue(issues, "error", "target_schema_missing", `${config.label} is missing generated module or schema mapping metadata.`);
  }
}

function validateDiscovery(issues: ExportValidationIssue[], modules: CanonicalModules) {
  const validation = validateDiscoverySystem();
  for (const issue of validation.issues) {
    addIssue(issues, issue.severity, `discovery_${issue.code}`, issue.message, issue.records);
  }
  const registryValidation = validateUniversalDiscoveryRegistryContract();
  for (const issue of registryValidation.issues) {
    addIssue(issues, issue.severity, `universal_discovery_registry_${issue.code}`, issue.message, issue.records);
  }
  const discoveryIds = new Set(modules.discoveries.map((discovery) => discovery.id));
  const categoryIds = new Set(modules.discovery_categories.map((category) => category.id));
  const badCategoryLinks = modules.discoveries.filter((discovery) => !categoryIds.has(discovery.categoryId));
  if (badCategoryLinks.length) {
    addIssue(issues, "error", "discovery_category_missing", "Discoveries must reference canonical discovery categories.", badCategoryLinks.map((discovery) => discovery.id));
  }
  const badCollectionLinks = modules.discovery_collections.flatMap((collection) => collection.discoveryIds.filter((id) => !discoveryIds.has(id)).map((id) => `${collection.id}:${id}`));
  if (badCollectionLinks.length) {
    addIssue(issues, "error", "discovery_collection_link_missing", "Discovery collections must reference canonical discovery IDs.", badCollectionLinks);
  }
}

function validateArchitectureVersion(issues: ExportValidationIssue[]) {
  if (!/^\d+\.\d+\.\d+$/.test(ARCHITECTURE_VERSION)) {
    addIssue(issues, "error", "architecture_version_invalid", "Architecture version must be a semantic version.");
  }
}

function validateResourceTaxonomyExport(issues: ExportValidationIssue[], modules: CanonicalModules) {
  const serviceValidation = ResourceService.validate();
  for (const message of serviceValidation.errors) addIssue(issues, "error", "resource_taxonomy_invalid", message);
  for (const message of serviceValidation.warnings) addIssue(issues, "warning", "resource_taxonomy_warning", message);
  if (modules.resource_taxonomy.version !== ResourceService.taxonomyVersion || modules.resource_taxonomy.profileGenerationVersion !== ResourceService.profileGenerationVersion) {
    addIssue(issues, "error", "resource_taxonomy_version_mismatch", "Export taxonomy versions must match ResourceService.");
  }
  const resourceIds = new Set(modules.resource_catalog.map((resource) => resource.id));
  const invalidMigrations = modules.resource_migrations.filter((migration) => migration.canonical_resource_id && !resourceIds.has(migration.canonical_resource_id));
  if (invalidMigrations.length) {
    addIssue(issues, "error", "resource_migration_reference_invalid", "Resource migrations must resolve to active canonical resources.", invalidMigrations.map((migration) => migration.legacy_resource_id));
  }
}

function validateEngineExport(target: EngineTarget, modules: CanonicalModules) {
  const issues: ExportValidationIssue[] = [];
  validateArchitectureVersion(issues);
  for (const issue of validateDesignLanguage(modules.design_language).issues) {
    addIssue(issues, issue.severity, `design_language_${issue.code}`, issue.message, issue.records);
  }
  for (const issue of validateComponentLibrary(modules.component_library).issues) {
    addIssue(issues, issue.severity, `component_library_${issue.code}`, issue.message, issue.records);
  }
  for (const issue of validateScreenTemplateLibrary(modules.screen_template_library).issues) {
    addIssue(issues, issue.severity, `screen_template_library_${issue.code}`, issue.message, issue.records);
  }
  validateResourceTaxonomyExport(issues, modules);
  validateStableIds(issues, modules);
  validateResourceReferences(issues, modules);
  validateUnlocks(issues, modules);
  validateBuildingTaxonomy(issues, modules);
  validateHierarchy(issues, modules);
  validatePlanetOpportunities(issues, modules);
  validatePlanetDeepDataExport(issues, modules);
  validatePlanetExploration(issues, modules);
  for (const issue of validateColonizationFramework(modules.colonization_framework, {
    actionIds: new Set(modules.action_system.actionDefinitions.map((action) => action.id)),
    actionPhaseIds: new Set(modules.action_system.actionPhaseTemplates.map((phase) => phase.id)),
    actionDurationIds: new Set(modules.action_system.actionDurationDefinitions.map((duration) => duration.id)),
    resourceIds: new Set(modules.resource_catalog.map((resource) => resource.id)),
    buildingIds: new Set(modules.building_library.map((building) => building.id)),
    planetDevelopmentFrameworkId: modules.planet_development_framework.id,
    civilizationProgressionFrameworkId: modules.civilization_progression_framework.id,
    progressionMilestoneIds: new Set(modules.civilization_progression_framework.civilizationMilestones.map((milestone) => milestone.id))
  })) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  for (const issue of validatePopulationSimulationFramework(modules.population_simulation_framework, {
    actionIds: new Set(modules.action_system.actionDefinitions.map((action) => action.id)),
    buildingFamilyIds: new Set(modules.building_taxonomy.map((family) => family.id)),
    colonizationFrameworkId: modules.colonization_framework.id,
    planetDevelopmentFrameworkId: modules.planet_development_framework.id,
    civilizationProgressionFrameworkId: modules.civilization_progression_framework.id,
    colonyTypeIds: new Set(modules.colonization_framework.colonyTypeDefinitions.map((type) => type.id)),
    progressionMilestoneIds: new Set(modules.civilization_progression_framework.civilizationMilestones.map((milestone) => milestone.id))
  })) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  for (const issue of validateResourceEconomyLogisticsFramework(modules.resource_economy_logistics_framework, {
    resourceIds: new Set(modules.resource_catalog.map((resource) => resource.id)),
    actionIds: new Set(modules.action_system.actionDefinitions.map((action) => action.id)),
    actionPhaseIds: new Set(modules.action_system.actionPhaseTemplates.map((phase) => phase.id)),
    actionDurationIds: new Set(modules.action_system.actionDurationDefinitions.map((duration) => duration.id)),
    buildingIds: new Set(modules.building_library.map((building) => building.id)),
    colonizationPackageIds: new Set(modules.colonization_framework.colonyResourcePackageDefinitions.map((item) => item.id)),
    colonizationPhaseIds: new Set(modules.colonization_framework.colonyProjectPhaseDefinitions.map((item) => item.id)),
    planetDevelopmentFrameworkId: modules.planet_development_framework.id,
    civilizationProgressionFrameworkId: modules.civilization_progression_framework.id,
    colonizationFrameworkId: modules.colonization_framework.id
  })) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  for (const issue of validateMissionExpeditionFramework(modules.mission_expedition_framework, {
    resourceIds: new Set(modules.resource_catalog.map((resource) => resource.id)),
    actionIds: new Set(modules.action_system.actionDefinitions.map((action) => action.id)),
    routeIds: new Set(modules.resource_economy_logistics_framework.logisticsRouteDefinitions.map((route) => route.id)),
    transportModeIds: new Set(modules.resource_economy_logistics_framework.transportModeDefinitions.map((transport) => transport.id))
  })) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  for (const issue of validateDynamicEventFramework(modules.dynamic_event_framework, {
    actionIds: new Set(modules.action_system.actionDefinitions.map((action) => action.id)),
    missionTemplateIds: new Set(modules.mission_expedition_framework.missionTemplateDefinitions.map((template) => template.id)),
    progressionMilestoneIds: new Set(modules.civilization_progression_framework.civilizationMilestones.map((milestone) => milestone.id))
  })) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  for (const issue of validateEnvironmentComposerContract(modules.environment_composer_contract)) {
    addIssue(issues, issue.severity, `environment_composer_${issue.code}`, issue.message, issue.records);
  }
  for (const message of validatePlanetDetailScreenContract(modules.planet_detail_screen)) {
    addIssue(issues, "error", "planet_detail_screen_invalid", message, ["planet_detail_screen"]);
  }
  for (const message of validateCivilizationOperationsDeckContract(modules.civilization_operations_deck)) {
    addIssue(issues, "error", "civilization_operations_deck_invalid", message, ["civilization_operations_deck"]);
  }
  for (const message of validateSpeciesPlateRuntimeData(modules.species_plates)) {
    addIssue(issues, "error", "species_plate_runtime_invalid", message, ["species_plates"]);
  }
  for (const message of validateSpeciesPlateAssetPack(modules.species_plate_asset_pack)) {
    addIssue(issues, "error", "species_plate_asset_pack_invalid", message, ["species_plate_asset_pack"]);
  }
  validateEconomy(issues, modules);
  for (const issue of validateLaborGenerationFramework(modules.labor_generation_framework)) {
    addIssue(issues, issue.severity, issue.code, issue.message, issue.records);
  }
  validateEraNavigationProfiles(issues, modules);
  validateMissions(issues, modules);
  validateAiAgentModules(issues, modules);
  validateDiscovery(issues, modules);
  for (const issue of validateGalaxyEnginePresentationContract(modules.galaxy_engine_contract)) {
    issues.push({
      severity: issue.severity,
      code: issue.code,
      message: issue.message,
      records: issue.records
    });
  }
  validateTargetSchema(issues, target);

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return {
    valid: errorCount === 0,
    status: errorCount ? "Blocked" : warningCount ? "Ready With Warnings" : "Ready",
    errorCount,
    warningCount,
    checkedAt: new Date().toISOString(),
    checklist: [
      "stable IDs",
      "no duplicate IDs",
      "no orphan unlocks",
      "building taxonomy classifications resolve",
      "no invalid resource IDs",
      "parent/child links exist",
      "schema matches selected engine target",
      "planets link to star systems",
      "planets link to sectors",
      "planets link to galaxies",
      "planet opportunity profiles resolve",
      "celestial body opportunity profiles resolve",
      "planet opportunity scores are normalized",
      "time action contract resolves",
      "canonical action system resolves",
      "action definitions publish requirements, outputs, queue rules, history, and automation",
      "planet exploration actions reference time action contract",
      "CSI, SVI, nickname, recommendations, and actions stay hidden until Surveyed",
      "Premium Crystals accelerate only and do not unlock unavailable actions",
      "colonization framework resolves",
      "colony types reference canonical actions, resources, and buildings",
      "no-solid-surface bodies use non-surface colony options",
      "active player colony state is excluded",
      "colonies link to planets",
      "colonies link to star systems",
      "colonies link to sectors",
      "colonies link to galaxies",
      "market resource IDs exist",
      "market parent/child links resolve",
      "trade route market links resolve",
      "colonies connect to markets",
      "market prices are non-negative and clamped",
      "economy IDs are unique",
      "HUD economy IDs resolve",
      "HUD order is unique",
      "starting amounts and rates are finite",
      "premium values are explicitly marked",
      "material resources are excluded from HUD",
      "era navigation profiles resolve",
      "era navigation boundary behavior is supported",
      "dashboard era count does not exceed canonical eras",
      "mission objectives link to missions",
      "mission rewards link to missions",
      "mission targets resolve",
      "mission faction/resource/research links resolve",
      "completed missions have completed objectives",
      "mission rewards are claimed only once",
      "AI Agent variants resolve to published agents",
      "AI Agent cosmetic variants do not alter automation strength",
      "species plate runtime references are sanitized",
      "species plate asset pack slice definitions remain private-authoring safe",
      "discovery categories have display order",
      "discovery rarities are valid",
      "discovery spawn rules are canonical",
      "discovery collections and chains resolve",
      "universal discovery registry contract is sanitized",
      "universal discovery registry exports no live claim records",
      "galaxy engine presentation contract is sanitized",
      "technology gates resolve semantic zoom levels",
      "knowledge visibility states resolve",
      "platform rendering profiles are recommendations only",
      "environment composition assets and layer references resolve",
      "environment exports contain references only and no private source paths",
      "client rendering remains client-owned",
      "star systems link to sectors",
      "sectors link to galaxies",
      "architectureVersion is sanitized semantic metadata only"
    ],
    issues
  };
}

function exportMetadata(validationStatus: ReturnType<typeof validateEngineExport>["status"]) {
  return {
    architectureVersion: ARCHITECTURE_VERSION,
    universalDiscoveryRegistryVersion: universalDiscoveryRegistryContract.version,
    galaxyEngineContractVersion,
    runtimeVersion: gameRuntimeSchemaVersion,
    contentVersion: gameRuntimeContentVersion,
    validationStatus
  };
}

function schemaNotes(target: EngineTarget) {
  const config = getEngineTargetConfig(target);
  return {
    target: config.label,
    sourceOfTruth: "Project Genesis Studio",
    rule: "Engine targets consume exported data or API data. Gameplay rules must not fork by engine.",
    ids: "IDs are stable and should be treated as save-compatible identifiers.",
    resources: "Resource display data must be resolved through resource_catalog/ResourceService.",
    hierarchy: "Preserve Galaxy -> Sector -> Star System -> Planet. Do not add Region or Cluster layers.",
    environmentComposer: "Environment Composer publishes ordered layers, semantic asset references, themes, and artistic constraints. It never embeds textures or private PSD paths, and clients retain rendering ownership.",
    componentLibrary: "The NOVERIS Component Library publishes component contracts, token references, animation references, state variants, slots, screen usage, and prefab identifiers. Engines own rendering and must report unknown component IDs or style overrides as contract violations.",
    screenTemplateLibrary: "The NOVERIS Screen Template Library publishes semantic screen hierarchy, required components, asset roles, layout modes, and runtime contracts. Engine clients own coordinates, anchors, rendering, animation, interaction, and player state.",
    planetDeepData: "Planet records extend the existing canonical Planet root with deterministic profile references, scientific values, resource/biome/species/hazard occurrences, discovery visibility, and author locks. Resource IDs resolve through resource_catalog. Live weather, simulation ticks, and player-specific state remain client-owned.",
    planetOpportunities: "Planet Opportunity Profiles define strategic uses, suitability scores, capabilities, hazards, and valid player actions. Planets and celestial bodies reference opportunityProfileId; clients do not invent these values.",
    planetExploration: "Planet Exploration Progression defines the Unknown -> Detected -> Probed -> Surveyed -> Evaluated -> Selected -> Active Project -> Complete pipeline. CSI, SVI, nickname, recommended uses, and actions are hidden until Surveyed. Timed actions reference the shared Time Action Contract.",
    planetDevelopment: "Planet Development Framework defines the post-survey report contract: knowledge lifecycle, visibility matrix, CSI/SVI bands, opportunity archetypes, valid actions, blocked reasons, hazards, project phases, and presentation intent. Active player projects remain Game-owned.",
    civilizationProgression: "Civilization Progression Framework defines deterministic non-XP civilization stages, development dimensions, stage requirements, milestones, and presentation intent. Player progression instances remain Game-owned.",
    colonization: "Colonization & Settlement Framework defines colony types, eligibility, reason codes, Action-driven phases, resource packages, population/workforce hooks, starter sets, development stages, focuses, capabilities, maintenance hooks, and failure policies. Active player colonies, queues, timestamps, and allocations remain Game-owned.",
    timeActions: "Time Action Contract defines the shared action state machine, progress model, acceleration policy, and modifier families. Premium Crystals accelerate progress only and never bypass technology requirements.",
    actions: "Canonical Action System defines gameplay actions, categories, states, queues, requirements, inputs, outputs, modifiers, automation, history, and presentation intent. Future systems must use this framework instead of separate timer systems.",
    colonies: "Colony state, growth inputs, buildings, levels, and focus definitions are canonical Studio data shared by every engine target.",
    economy: "Global economy definitions, Labor Generation Framework, behavior contracts, producer definitions, building resource effects, scope rules, ledger reason codes, offline policies, and HUD slots are engine-agnostic canonical data. HUD slots use economy IDs only; inventory materials stay in resource_catalog.",
    eraNavigation: "Studio owns navigation intent only. Dashboards should use current_journey with compact labels; clients own layout and rendering. The full Civilization Timeline remains the all-era view.",
    missions: "Missions, objectives, rewards, statuses, and generation metadata are deterministic canonical Studio data. Engine targets consume mission state and report progress back through objective IDs.",
    discovery: "Discovery categories, rarities, canonical discoverable records, spawn rules, collections, chains, and asset profiles are Studio-owned. Player collection completion stays game/save scoped.",
    universalDiscoveryRegistry: "Universal Discovery Registry metadata is a static contract for stable object IDs, first-discovery milestones, naming/moderation, attribution/privacy, backend/API handoff, and presentation states. Studio exports no live discovery claims.",
    aiAgents: "AI Agents are cosmetic/presentation companions layered over the existing automation mechanic. ai_agent_variants describe selectable visual skins only; stable automation IDs remain unchanged and clients use automation_presentation aliases for labels.",
    mapping: config.schemaMapping
  };
}

function luaValue(value: unknown, indent = 0): string {
  const pad = " ".repeat(indent);
  const nextPad = " ".repeat(indent + 2);
  if (value === null || value === undefined) return "nil";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (!value.length) return "{}";
    return `{\n${value.map((item) => `${nextPad}${luaValue(item, indent + 2)}`).join(",\n")}\n${pad}}`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return "{}";
    return `{\n${entries.map(([key, item]) => `${nextPad}[${JSON.stringify(key)}] = ${luaValue(item, indent + 2)}`).join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(String(value));
}

function compactModules(modules: CanonicalModules) {
  return {
    resource_catalog: modules.resource_catalog,
    resource_taxonomy: modules.resource_taxonomy,
    resource_migrations: modules.resource_migrations,
    planet_resource_profiles: modules.planet_resource_profiles,
    research: modules.research,
    building_taxonomy: modules.building_taxonomy,
    building_library: modules.building_library,
    building_classifications: modules.building_classifications,
    unlock_matrix: modules.unlock_matrix,
    galaxies: modules.galaxies,
    sectors: modules.sectors,
    star_systems: modules.star_systems,
    planets: modules.planets,
    unassigned_planets: modules.unassigned_planets,
    celestial_bodies: modules.celestial_bodies,
    planet_opportunity_profiles: modules.planet_opportunity_profiles,
    species_categories: modules.species_categories,
    species_taxonomy_frameworks: modules.species_taxonomy_frameworks,
    species: modules.species,
    species_occurrences: modules.species_occurrences,
    species_resource_yields: modules.species_resource_yields,
    creature_art_profiles: modules.creature_art_profiles,
    creature_animation_profiles: modules.creature_animation_profiles,
    creature_audio_profiles: modules.creature_audio_profiles,
    creature_generator_contract: modules.creature_generator_contract,
    component_library: modules.component_library,
    screen_template_library: modules.screen_template_library,
    creature_prompt_output_types: modules.creature_prompt_output_types,
    creature_prompt_lifecycle_stages: modules.creature_prompt_lifecycle_stages,
    creature_prompt_batch_actions: modules.creature_prompt_batch_actions,
    creature_prompt_model_profiles: modules.creature_prompt_model_profiles,
    creature_prompt_type_templates: modules.creature_prompt_type_templates,
    species_plates: modules.species_plates,
    species_plate_asset_pack: modules.species_plate_asset_pack,
    planet_deep_data_framework: modules.planet_deep_data_framework,
    planet_data_screen_contract: modules.planet_data_screen_contract,
    time_action_contract: modules.time_action_contract,
    action_system: modules.action_system,
    planet_exploration_progression: modules.planet_exploration_progression,
    planet_development_framework: modules.planet_development_framework,
    civilization_progression_framework: modules.civilization_progression_framework,
    colonization_framework: modules.colonization_framework,
    population_simulation_framework: modules.population_simulation_framework,
    resource_economy_logistics_framework: modules.resource_economy_logistics_framework,
    mission_expedition_framework: modules.mission_expedition_framework,
    dynamic_event_framework: modules.dynamic_event_framework,
    environment_composer_contract: modules.environment_composer_contract,
    design_language: modules.design_language,
    planet_detail_screen: modules.planet_detail_screen,
    civilization_operations_deck: modules.civilization_operations_deck,
    discovery_journal: modules.discovery_journal,
    timeline_events: modules.timeline_events,
    explorer_schemas: modules.explorer_schemas,
    colonies: modules.colonies,
    colony_buildings: modules.colony_buildings,
    colony_level_definitions: modules.colony_level_definitions,
    colony_focus_definitions: modules.colony_focus_definitions,
    colony_building_templates: modules.colony_building_templates,
    markets: modules.markets,
    resource_listings: modules.resource_listings,
    trade_routes: modules.trade_routes,
    trade_opportunities: modules.trade_opportunities,
    economy_definitions: modules.economy_definitions,
    economy_behavior_contracts: modules.economy_behavior_contracts,
    resource_producer_definitions: modules.resource_producer_definitions,
    building_resource_effects: modules.building_resource_effects,
    economy_scope_rules: modules.economy_scope_rules,
    economy_transaction_reasons: modules.economy_transaction_reasons,
    economy_rate_breakdown_definitions: modules.economy_rate_breakdown_definitions,
    offline_progression_policies: modules.offline_progression_policies,
    economy_calculation_rules: modules.economy_calculation_rules,
    labor_generation_framework: modules.labor_generation_framework,
    era_economy_profiles: modules.era_economy_profiles,
    hud_profile: modules.hud_profile,
    primary_hud_resources: modules.primary_hud_resources,
    era_navigation_profiles: modules.era_navigation_profiles,
    client_profiles: modules.client_profiles,
    mobile_asset_requirements: modules.mobile_asset_requirements,
    ai_library: modules.ai_library,
    ai_categories: modules.ai_categories,
    ai_rarity: modules.ai_rarity,
    ai_personality_catalog: modules.ai_personality_catalog,
    ai_voice_catalog: modules.ai_voice_catalog,
    ai_assignment_roles: modules.ai_assignment_roles,
    ai_agents: modules.ai_agents,
    ai_agent_variants: modules.ai_agent_variants,
    ai_agent_personalities: modules.ai_agent_personalities,
    ai_agent_animation_profiles: modules.ai_agent_animation_profiles,
    automation_presentation: modules.automation_presentation,
    default_ai_agent_id: modules.default_ai_agent_id,
    ai_agent_save_schema: modules.ai_agent_save_schema,
    discovery_categories: modules.discovery_categories,
    discovery_rarities: modules.discovery_rarities,
    discoveries: modules.discoveries,
    discovery_collections: modules.discovery_collections,
    discovery_chains: modules.discovery_chains,
    discovery_milestones: modules.discovery_milestones,
    discovery_player_collection_schema: modules.discovery_player_collection_schema,
    universal_discovery_registry: modules.universal_discovery_registry,
    galaxy_engine_contract: modules.galaxy_engine_contract,
    economy_usage_relationships: modules.economy_usage_relationships,
    inventory_resource_metadata: modules.inventory_resource_metadata,
    economy_schemas: modules.economy_schemas,
    pricing_rules: modules.pricing_rules,
    market_level_definitions: modules.market_level_definitions,
    economy: modules.economy,
    factions: modules.factions,
    missions: modules.missions,
    mission_objectives: modules.mission_objectives,
    mission_rewards: modules.mission_rewards,
    mission_type_definitions: modules.mission_type_definitions,
    mission_status_definitions: modules.mission_status_definitions,
    mission_difficulty_definitions: modules.mission_difficulty_definitions,
    mission_objective_type_definitions: modules.mission_objective_type_definitions,
    mission_reward_type_definitions: modules.mission_reward_type_definitions,
    mission_generation_metadata: modules.mission_generation_metadata,
    mission_schemas: modules.mission_schemas
  };
}

function targetArtifacts(target: EngineTarget, modules: CanonicalModules) {
  if (target === "roblox") {
    return {
      "ResourceCatalogModule.lua": `local ResourceCatalog = ${luaValue(modules.resource_catalog)}\n\nreturn ResourceCatalog\n`,
      "EconomyDefinitionsModule.lua": `local EconomyDefinitions = ${luaValue({ economyDefinitions: modules.economy_definitions, laborGenerationFramework: modules.labor_generation_framework, economyBehaviorContracts: modules.economy_behavior_contracts, resourceProducerDefinitions: modules.resource_producer_definitions, buildingResourceEffects: modules.building_resource_effects, economyScopeRules: modules.economy_scope_rules, transactionReasons: modules.economy_transaction_reasons, rateBreakdowns: modules.economy_rate_breakdown_definitions, offlinePolicies: modules.offline_progression_policies, calculationRules: modules.economy_calculation_rules, eraEconomyProfiles: modules.era_economy_profiles, hudProfile: modules.hud_profile, primaryHudResources: modules.primary_hud_resources })}\n\nreturn EconomyDefinitions\n`,
      "AIAgentModule.lua": `local AIAgents = ${luaValue({ library: modules.ai_library, categories: modules.ai_categories, rarity: modules.ai_rarity, personalityCatalog: modules.ai_personality_catalog, voiceCatalog: modules.ai_voice_catalog, assignmentRoles: modules.ai_assignment_roles, aiAgents: modules.ai_agents, aiAgentVariants: modules.ai_agent_variants, personalities: modules.ai_agent_personalities, animationProfiles: modules.ai_agent_animation_profiles, automationPresentation: modules.automation_presentation, defaultAiAgentId: modules.default_ai_agent_id, defaultAiAgentVariantId, saveSchema: modules.ai_agent_save_schema })}\n\nreturn AIAgents\n`,
      "DiscoveryCatalogModule.lua": `local DiscoveryCatalog = ${luaValue({ categories: modules.discovery_categories, rarities: modules.discovery_rarities, discoveries: modules.discoveries, collections: modules.discovery_collections, chains: modules.discovery_chains })}\n\nreturn DiscoveryCatalog\n`,
      "SpeciesPlateModule.lua": `local SpeciesPlates = ${luaValue({ plates: modules.species_plates, assetPack: modules.species_plate_asset_pack })}\n\nreturn SpeciesPlates\n`,
      "UniversalDiscoveryRegistryContract.lua": `local UniversalDiscoveryRegistryContract = ${luaValue(modules.universal_discovery_registry)}\n\nreturn UniversalDiscoveryRegistryContract\n`,
      "EraNavigationProfileModule.lua": `local EraNavigationProfiles = ${luaValue(modules.era_navigation_profiles)}\n\nreturn EraNavigationProfiles\n`,
      "DesignLanguageModule.lua": `local DesignLanguage = ${luaValue(modules.design_language)}\n\nreturn DesignLanguage\n`,
      "ComponentLibraryModule.lua": `local ComponentLibrary = ${luaValue(buildUnityComponentLibraryExport(modules.component_library).componentLibrary)}\n\nreturn ComponentLibrary\n`,
      "ScreenTemplateLibraryModule.lua": `local ScreenTemplateLibrary = ${luaValue(buildUnityScreenTemplateExport(modules.screen_template_library).screenTemplateLibrary)}\n\nreturn ScreenTemplateLibrary\n`,
      "ResearchUnlockModule.lua": `local ResearchUnlocks = ${luaValue({ research: modules.research, unlocks: modules.unlock_matrix })}\n\nreturn ResearchUnlocks\n`,
      "UniverseDataModule.lua": `local UniverseData = ${luaValue({ galaxies: modules.galaxies, sectors: modules.sectors, starSystems: modules.star_systems, planets: modules.planets, celestialBodies: modules.celestial_bodies, planetOpportunityProfiles: modules.planet_opportunity_profiles, planetDeepDataFramework: modules.planet_deep_data_framework, planetDataScreenContract: modules.planet_data_screen_contract, timeActionContract: modules.time_action_contract, actionSystem: modules.action_system, planetExplorationProgression: modules.planet_exploration_progression, planetDevelopmentFramework: modules.planet_development_framework, civilizationProgressionFramework: modules.civilization_progression_framework, colonizationFramework: modules.colonization_framework, populationSimulationFramework: modules.population_simulation_framework, resourceEconomyLogisticsFramework: modules.resource_economy_logistics_framework, missionExpeditionFramework: modules.mission_expedition_framework, dynamicEventFramework: modules.dynamic_event_framework, factions: modules.factions, colonies: modules.colonies, colonyBuildings: modules.colony_buildings, colonyLevels: modules.colony_level_definitions, colonyFocus: modules.colony_focus_definitions, markets: modules.markets, tradeRoutes: modules.trade_routes, tradeOpportunities: modules.trade_opportunities, missions: modules.missions, missionObjectives: modules.mission_objectives, missionRewards: modules.mission_rewards })}\n\nreturn UniverseData\n`,
      "ApiService.lua": "local HttpService = game:GetService(\"HttpService\")\n\nlocal ApiService = {}\nApiService.BaseUrl = \"https://your-studio-host.example.com/api/export\"\n\nfunction ApiService.FetchGeneric()\n  local response = HttpService:GetAsync(ApiService.BaseUrl .. \"/generic\")\n  return HttpService:JSONDecode(response)\nend\n\nreturn ApiService\n"
    };
  }

  if (target === "web") {
    return {
      "NoverisDesignLanguage.json": modules.design_language,
      "NoverisComponentLibrary.json": buildUnityComponentLibraryExport(modules.component_library),
      "NoverisScreenTemplateLibrary.json": buildUnityScreenTemplateExport(modules.screen_template_library),
      "project-genesis.types.ts": "export type GenesisId = string;\n\nexport interface GenesisResource { id: GenesisId; resource_name: string; category: string; rarity: string; }\nexport interface GenesisSpeciesPlate { speciesPlateId: GenesisId; templateId: string; templateVersion: string; approvedAssetId: GenesisId | null; previewAssetId: GenesisId | null; thumbnailAssetId: GenesisId | null; extractedAssetIds: GenesisId[]; discoveryVisibilityRules: Record<string, unknown>; sourcePromptId: GenesisId | null; promptHash: string; generationSeed: string; productionStatus: string; }\nexport interface GenesisEraNavigationProfile { dashboardMode: 'current_journey' | 'compact_timeline' | 'full_timeline'; visibleEraCount: number; fullTimelineEnabled: boolean; allowPrimaryHorizontalScroll: boolean; boundaryBehavior: { firstEraMode: string; middleEraMode: string; lastEraMode: string }; }\nexport interface GenesisTimeActionContract { id: GenesisId; stateMachine: string[]; accelerationPolicy: Record<string, unknown>; progressModel: Record<string, unknown>; }\nexport interface GenesisPlanetExplorationProgression { id: GenesisId; timeActionContractId: GenesisId; pipeline: Array<{ id: string; order: number; displayName: string }>; visibilityRules: Array<Record<string, unknown>>; timedActions: Array<Record<string, unknown>>; }\nexport interface GenesisColonizationFramework { id: GenesisId; colonyTypeDefinitions: Array<Record<string, unknown>>; colonyProjectPhaseDefinitions: Array<Record<string, unknown>>; colonyResourcePackageDefinitions: Array<Record<string, unknown>>; }\nexport interface GenesisResourceEconomyLogisticsFramework { id: GenesisId; resourceFlowDefinitions: Array<Record<string, unknown>>; economyNodeTypeDefinitions: Array<Record<string, unknown>>; logisticsRouteDefinitions: Array<Record<string, unknown>>; shipmentStateDefinitions: Array<Record<string, unknown>>; productionChainDefinitions: Array<Record<string, unknown>>; }\nexport interface GenesisMissionExpeditionFramework { id: GenesisId; missionTypeDefinitions: Array<Record<string, unknown>>; expeditionScopeDefinitions: Array<Record<string, unknown>>; missionTemplateDefinitions: Array<Record<string, unknown>>; missionObjectiveContractDefinitions: Array<Record<string, unknown>>; missionRewardContractDefinitions: Array<Record<string, unknown>>; }\nexport interface GenesisDynamicEventFramework { id: GenesisId; eventCategoryDefinitions: Array<Record<string, unknown>>; eventTypeDefinitions: Array<Record<string, unknown>>; eventDefinitions: Array<Record<string, unknown>>; eventChainDefinitions: Array<Record<string, unknown>>; eventChoiceDefinitions: Array<Record<string, unknown>>; }\nexport interface GenesisDiscovery { id: GenesisId; displayName: string; categoryId: GenesisId; subcategoryId: GenesisId; rarity: string; spawnWeight: number; discoveryXp: number; requiredScanLevel: number; assetProfile: Record<string, string>; }\nexport interface GenesisAiAgent { id: GenesisId; displayName: string; shortDisplayName: string; personalityId: GenesisId; defaultForNewPlayers: boolean; baseVariantId: GenesisId; availableVariantIds: GenesisId[]; headAssetKey: string; eyesOpenAssetKey: string; eyesBlinkAssetKey: string; eyesClosedAssetKey: string; }\nexport interface GenesisAiAgentVariant { id: GenesisId; agentId: GenesisId; displayName: string; tier: number; variantType: string; assetKeys: Record<string, string>; unlockText: string; }\nexport interface GenesisResearchNode { id: GenesisId; name: string; era: string; status: string; }\nexport interface GenesisFaction { id: GenesisId; name: string; type: string; disposition: string; homeStarSystemId: GenesisId; controlledPlanetIds: GenesisId[]; }\nexport interface GenesisColonyBuilding { id: GenesisId; name: string; category: string; colonyId: GenesisId; constructionStatus: string; modifiers: Record<string, number>; }\nexport interface GenesisColony { id: GenesisId; name: string; planetId: GenesisId; starSystemId: GenesisId; population: number; populationCapacity: number; populationGrowthRate: number; colonyLevel: number; focus: string; status: string; resourceOutputIds: GenesisId[]; resourceOutputRates: Record<string, number>; buildingIds: GenesisId[]; }\nexport interface GenesisMarketListing { resourceId: GenesisId; basePrice: number; currentPrice: number; supply: number; demand: number; priceTrend: string; availability: string; }\nexport interface GenesisMarket { id: GenesisId; name: string; marketType: string; colonyId?: GenesisId; childMarketIds: GenesisId[]; resourceListings: GenesisMarketListing[]; tradeVolume: number; prosperity: number; security: number; }\nexport interface GenesisTradeRoute { id: GenesisId; originMarketId: GenesisId; destinationMarketId: GenesisId; resourceIds: GenesisId[]; profitability: number; risk: number; status: string; }\nexport interface GenesisMissionObjective { id: GenesisId; missionId: GenesisId; objectiveType: string; targetId: GenesisId; targetCount: number; currentCount: number; completed: boolean; }\nexport interface GenesisMission { id: GenesisId; title: string; missionType: string; status: string; difficulty: string; objectiveIds: GenesisId[]; rewardIds: GenesisId[]; rewardsClaimed: boolean; tracked: boolean; }\nexport interface GenesisExportPayload { target: string; canonical: Record<string, unknown>; relationshipMap: Record<string, unknown>; }\n",
      "projectGenesisClient.ts": "export async function fetchProjectGenesisExport(target = 'generic') {\n  const response = await fetch(`/api/export/${target}`);\n  if (!response.ok) throw new Error(`Project Genesis export failed: ${response.status}`);\n  return response.json();\n}\n",
      "projectGenesisStore.ts": "import { create } from 'zustand';\n\ntype GenesisStore = { data: unknown | null; setData: (data: unknown) => void };\nexport const useGenesisStore = create<GenesisStore>((set) => ({ data: null, setData: (data) => set({ data }) }));\n"
    };
  }

  if (target === "unity") {
    return {
      "NoverisDesignLanguage.json": buildUnityDesignLanguageExport(modules.design_language),
      "NoverisComponentLibrary.json": buildUnityComponentLibraryExport(modules.component_library),
      "NoverisScreenTemplateLibrary.json": buildUnityScreenTemplateExport(modules.screen_template_library),
      "ResourceCatalog.cs": "using System;\n\n[Serializable]\npublic class ResourceCatalogEntry { public string id; public string resource_name; public string category; public string rarity; }\n",
      "ResearchUnlocks.cs": "using System;\n\n[Serializable]\npublic class ResearchUnlockRow { public string id; public string source_id; public string unlock_type; public string unlock_name; }\n",
      "UniverseLoader.cs": "using UnityEngine;\n\npublic class UniverseLoader : MonoBehaviour { public TextAsset projectGenesisJson; }\n",
      "ScriptableObjectGuidance.md": "Create ScriptableObjects from imported JSON for editor convenience. Keep Project Genesis Studio as the authoritative source."
    };
  }

  if (target === "unreal") {
    return {
      "NoverisDesignLanguage.json": modules.design_language,
      "NoverisComponentLibrary.json": buildUnityComponentLibraryExport(modules.component_library),
      "NoverisScreenTemplateLibrary.json": buildUnityScreenTemplateExport(modules.screen_template_library),
      "GenesisResourceStruct.h": "USTRUCT(BlueprintType)\nstruct FGenesisResourceRow { GENERATED_BODY() UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Id; UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ResourceName; };\n",
      "ResearchUnlockTable.md": "Import unlock_matrix as a DataTable keyed by stable id. Keep source_id and unlock_id as FString references.",
      "UniverseData.md": "Import galaxies, sectors, star_systems, planets, and celestial_bodies as JSON or DataTables. Preserve parent IDs."
    };
  }

  if (target === "godot") {
    return {
      "NoverisDesignLanguage.json": modules.design_language,
      "NoverisComponentLibrary.json": buildUnityComponentLibraryExport(modules.component_library),
      "NoverisScreenTemplateLibrary.json": buildUnityScreenTemplateExport(modules.screen_template_library),
      "ResourceCatalog.gd": "extends Node\n\nvar resources := {}\n\nfunc load_catalog(payload: Dictionary) -> void:\n\tresources = payload.get(\"canonical\", {}).get(\"resource_catalog\", {})\n",
      "ResearchUnlocks.gd": "extends Node\n\nfunc unlock_rows(payload: Dictionary) -> Array:\n\treturn payload.get(\"canonical\", {}).get(\"unlock_matrix\", [])\n",
      "UniverseLoader.gd": "extends Node\n\nfunc load_universe(payload: Dictionary) -> Dictionary:\n\treturn payload.get(\"canonical\", {})\n"
    };
  }

  return {
    "canonical-data.json": compactModules(modules),
    "design-language.json": modules.design_language,
    "component-library.json": buildUnityComponentLibraryExport(modules.component_library),
    "screen-template-library.json": buildUnityScreenTemplateExport(modules.screen_template_library),
    "schema-notes.json": schemaNotes("generic"),
    "relationship-map.json": buildRelationshipMap(modules)
  };
}

export async function buildGameEngineExport(target: EngineTarget) {
  const data = await getGameData();
  const config = getEngineTargetConfig(target);
  const modules = buildCanonicalModules(data);
  const relationshipMap = buildRelationshipMap(modules);
  const validation = validateEngineExport(target, modules);
  const canonical = compactModules(modules);

  return {
    generatedAt: new Date().toISOString(),
    studio: "Project Genesis Studio",
    metadata: exportMetadata(validation.status),
    target: config,
    summary: {
      sourceOfTruth: "Project Genesis Studio",
      engineAgnostic: true,
      moduleCounts: Object.fromEntries(Object.entries(canonical).map(([key, value]) => [key, moduleCount(value)])),
      existingRoutesPreserved: ["/api/export/resource_catalog.json", "/api/export/planet_resource_profiles.json", "/api/export/research.json"]
    },
    validation,
    schemaNotes: schemaNotes(target),
    relationshipMap,
    canonical,
    artifacts: targetArtifacts(target, modules),
    integrationInstructions: {
      rule: "Consume exported Studio/API data. Do not fork gameplay rules inside the engine target.",
      endpoint: config.endpoint,
      folderStructure: config.folderStructure,
      generatedModules: config.generatedModules,
      apiNotes: config.apiNotes
    }
  };
}

export async function createEngineExportResponse(request: Request, target: EngineTarget) {
  const payload = await buildGameEngineExport(target);
  const url = new URL(request.url);
  const headers: HeadersInit = {};

  if (url.searchParams.get("download") === "1") {
    headers["content-disposition"] = `attachment; filename="project-genesis-${target}-export.json"`;
  }

  return NextResponse.json(payload, { headers });
}
