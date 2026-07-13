import { NextResponse } from "next/server";
import { getGameData } from "@/lib/data";
import { discoveryJournalSchema, sampleDiscoveryJournal, sampleTimelineEvents, timelineEventSchema } from "@/lib/explorer/discovery-log";
import { colonyBuildingTemplates, colonyFocusDefinitions, colonyLevelDefinitions, colonySchema, createColonyRecord, generateFallbackColonies, type ColonyBuilding, type ColonyRecord } from "@/lib/colonies/procedural";
import { buildEconomyUsageRelationships, buildEraEconomyProfiles, buildInventoryResourceMetadata, buildPrimaryHudSlots, canonicalEconomyDefinitions, primaryHudEconomyIds } from "@/lib/economy/definitions";
import { buildEconomyState, economySchemas, priceClamps, type MarketRecord, type ResourceListing, type TradeOpportunity, type TradeRoute } from "@/lib/economy/trade";
import { generateFaction, generateFallbackFactions, type FactionRecord } from "@/lib/factions/procedural";
import { defaultEraNavigationProfile, engineEraNavigationOverrides, resolveEraNavigationProfile, supportedEraNavigationBoundaryModes, supportedEraNavigationDashboardModes } from "@/lib/runtime/client-profiles";
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
    generatedModules: ["ResourceCatalogModule", "ResearchUnlockModule", "UniverseDataModule", "ApiService"],
    schemaMapping: ["resource_catalog -> ResourceCatalogModule", "research + unlock_matrix -> ResearchUnlockModule", "galaxies/sectors/star_systems/planets/factions -> UniverseDataModule"],
    apiNotes: ["Roblox consumes Studio/API data; it is not the primary data generator.", "Use HttpService against the Generic JSON API for live sync workflows."]
  },
  unity: {
    id: "unity",
    label: "Unity / C#",
    format: "C# models, ScriptableObject guidance, and JSON import payloads",
    endpoint: "/api/export/unity",
    folderStructure: ["Assets/ProjectGenesis/Data", "Assets/ProjectGenesis/Scripts/Generated", "Assets/ProjectGenesis/ScriptableObjects"],
    generatedModules: ["ResourceCatalog.cs", "ResearchUnlocks.cs", "UniverseLoader.cs"],
    schemaMapping: ["resource_catalog -> ResourceDefinition", "research + unlock_matrix -> ResearchUnlockDefinition", "universe + factions -> UniverseData"],
    apiNotes: ["Import JSON at build time or pull from the Generic JSON API at runtime.", "ScriptableObjects should cache imported data, not replace Studio ownership."]
  },
  unreal: {
    id: "unreal",
    label: "Unreal / JSON DataTables",
    format: "JSON/DataTable-ready rows plus C++/Blueprint struct definitions",
    endpoint: "/api/export/unreal",
    folderStructure: ["Content/ProjectGenesis/Data", "Source/ProjectGenesis/Public/Generated", "Source/ProjectGenesis/Private/Loaders"],
    generatedModules: ["ResourceCatalog", "ResearchUnlockTable", "UniverseData"],
    schemaMapping: ["resource_catalog -> FGenesisResourceRow", "unlock_matrix -> FGenesisResearchUnlockRow", "universe + factions -> FGenesisUniverseData"],
    apiNotes: ["Use DataTables for static builds or HTTP JSON for live tools.", "Structs mirror Studio IDs and relationships."]
  },
  godot: {
    id: "godot",
    label: "Godot / GDScript",
    format: "JSON exports with GDScript loader templates",
    endpoint: "/api/export/godot",
    folderStructure: ["res://project_genesis/data", "res://project_genesis/loaders", "res://project_genesis/autoload"],
    generatedModules: ["ResourceCatalog.gd", "ResearchUnlocks.gd", "UniverseLoader.gd"],
    schemaMapping: ["resource_catalog -> ResourceCatalog.gd", "research + unlock_matrix -> ResearchUnlocks.gd", "universe + factions -> UniverseLoader.gd"],
    apiNotes: ["Load local JSON with FileAccess or fetch Studio exports with HTTPRequest.", "Keep gameplay rules in exported JSON, not duplicated GDScript tables."]
  },
  web: {
    id: "web",
    label: "Web Game / TypeScript",
    format: "TypeScript interfaces, JSON exports, API client, and store examples",
    endpoint: "/api/export/web",
    folderStructure: ["src/project-genesis/data", "src/project-genesis/api", "src/project-genesis/store"],
    generatedModules: ["project-genesis.types.ts", "projectGenesisClient.ts", "projectGenesisStore.ts"],
    schemaMapping: ["canonical payload -> TypeScript interfaces", "factions -> normalized faction store", "endpoint references -> API client", "relationship map -> normalized store"],
    apiNotes: ["Use this target for browser games, tools, previews, and local editor clients.", "Zustand/Redux examples consume normalized canonical data."]
  },
  generic: {
    id: "generic",
    label: "Generic JSON API",
    format: "Clean normalized JSON, schema notes, and ID relationship map",
    endpoint: "/api/export/generic",
    folderStructure: ["project-genesis/data", "project-genesis/schema", "project-genesis/integration"],
    generatedModules: ["canonical-data.json", "schema-notes.json", "relationship-map.json"],
    schemaMapping: ["All targets consume the same canonical modules.", "Engine-specific exports derive from this payload."],
    apiNotes: ["Use as the foundation for every other engine target.", "No engine-specific syntax is included in the canonical data."]
  }
};

const targetOrder: EngineTarget[] = ["roblox", "unity", "unreal", "godot", "web", "generic"];

type CanonicalModules = {
  resource_catalog: typeof ResourceService.catalog;
  planet_resource_profiles: ReturnType<typeof normalizePlanetResourceProfiles>;
  research: GameData["research"];
  unlock_matrix: GameData["unlock_matrix"];
  galaxies: Array<Record<string, unknown>>;
  sectors: Array<Record<string, unknown>>;
  star_systems: GameData["star_systems"];
  planets: ExportGeneratedPlanet[];
  unassigned_planets: ExportUnassignedPlanet[];
  planet_rules: GameData["planets"];
  celestial_bodies: GameData["celestial_bodies"];
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
  era_economy_profiles: ReturnType<typeof buildEraEconomyProfiles>;
  hud_profile: Array<ReturnType<typeof buildPrimaryHudSlots>[number]>;
  primary_hud_resources: string[];
  era_navigation_profiles: Array<{ id: string; profileName: string; eraNavigation: ReturnType<typeof resolveEraNavigationProfile>; inheritsFrom: string | null; notes: string }>;
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
};

type ExportUnassignedPlanet = GeneratedPlanet & {
  export_status: "unassigned";
  unassigned_reason: string;
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
  starSystems: GameData["star_systems"]
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
        export_status: "unassigned",
        unassigned_reason: "No unambiguous star system parent could be resolved from starSystemId, star_system_id, or star_system."
      });
      continue;
    }

    const sector = sectorById.get(system.sector_id);
    if (!sector) {
      unassigned.push({
        ...planet,
        export_status: "unassigned",
        unassigned_reason: `Resolved star system ${system.id} but its sector ${system.sector_id} is not exported.`
      });
      continue;
    }

    const galaxy = galaxyById.get(String(sector.galaxy_id));
    if (!galaxy) {
      unassigned.push({
        ...planet,
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
      displayName: namedPlanet.displayName ?? planet.name
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
  const normalizedPlanets = normalizeExportPlanets(data.generated_planets, galaxies, sectors, starSystems);
  const factions = buildExportFactions(galaxies, sectors, starSystems, normalizedPlanets.assigned);
  const colonies = buildExportColonies(normalizedPlanets.assigned, factions);
  const economyState = buildEconomyState(colonies, factions, [], "derived");
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

  return {
    resource_catalog: ResourceService.catalog,
    planet_resource_profiles: validatePlanetResourceProfiles(data.planet_resource_profiles as PlanetResourceProfile[]),
    research: data.research,
    unlock_matrix: data.unlock_matrix,
    galaxies: galaxies.map((galaxy) => ({ ...galaxy, generatedName: galaxyName(galaxy), displayName: galaxyName(galaxy) })),
    sectors: sectors.map((sector) => ({ ...sector, generatedName: asString(sector.sector_name) || String(sector.id), displayName: asString(sector.sector_name) || String(sector.id) })),
    star_systems: starSystems.map((system) => ({ ...system, generatedName: system.system_name, displayName: system.system_name })),
    planets: normalizedPlanets.assigned,
    unassigned_planets: normalizedPlanets.unassigned,
    planet_rules: data.planets,
    celestial_bodies: celestialBodies.map((body) => ({ ...body, generatedName: body.name, displayName: body.name })),
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

  return {
    sectorsByGalaxy,
    systemsBySector,
    bodiesBySystem,
    planetsBySystem,
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
    const missing = objectRows.map((row, index) => ({ row, index })).filter(({ row }) => typeof row.id !== "string");
    if (missing.length) {
      addIssue(issues, "error", "missing_id", `${moduleName} has records without stable string IDs.`, missing.map(({ index }) => `${moduleName}[${index}]`));
    }

    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const row of objectRows) {
      const id = typeof row.id === "string" ? row.id : "";
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

  if (labor?.startingAmount !== 0 || labor?.manualClickTarget !== true) {
    addIssue(issues, "error", "labor_click_economy_invalid", "ECON-LABOR must start at 0 and remain the manual click economy.", ["ECON-LABOR"]);
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

function validateEngineExport(target: EngineTarget, modules: CanonicalModules) {
  const issues: ExportValidationIssue[] = [];
  validateStableIds(issues, modules);
  validateResourceReferences(issues, modules);
  validateUnlocks(issues, modules);
  validateHierarchy(issues, modules);
  validateEconomy(issues, modules);
  validateEraNavigationProfiles(issues, modules);
  validateMissions(issues, modules);
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
      "no invalid resource IDs",
      "parent/child links exist",
      "schema matches selected engine target",
      "planets link to star systems",
      "planets link to sectors",
      "planets link to galaxies",
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
      "star systems link to sectors",
      "sectors link to galaxies"
    ],
    issues
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
    colonies: "Colony state, growth inputs, buildings, levels, and focus definitions are canonical Studio data shared by every engine target.",
    economy: "Global economy definitions, HUD slots, markets, resource listings, trade routes, and opportunities are engine-agnostic canonical data. HUD slots use economy IDs only; inventory materials stay in resource_catalog.",
    eraNavigation: "Studio owns navigation intent only. Dashboards should use current_journey with compact labels; clients own layout and rendering. The full Civilization Timeline remains the all-era view.",
    missions: "Missions, objectives, rewards, statuses, and generation metadata are deterministic canonical Studio data. Engine targets consume mission state and report progress back through objective IDs.",
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
    planet_resource_profiles: modules.planet_resource_profiles,
    research: modules.research,
    unlock_matrix: modules.unlock_matrix,
    galaxies: modules.galaxies,
    sectors: modules.sectors,
    star_systems: modules.star_systems,
    planets: modules.planets,
    unassigned_planets: modules.unassigned_planets,
    celestial_bodies: modules.celestial_bodies,
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
    era_economy_profiles: modules.era_economy_profiles,
    hud_profile: modules.hud_profile,
    primary_hud_resources: modules.primary_hud_resources,
    era_navigation_profiles: modules.era_navigation_profiles,
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
      "EconomyDefinitionsModule.lua": `local EconomyDefinitions = ${luaValue({ economyDefinitions: modules.economy_definitions, eraEconomyProfiles: modules.era_economy_profiles, hudProfile: modules.hud_profile, primaryHudResources: modules.primary_hud_resources })}\n\nreturn EconomyDefinitions\n`,
      "EraNavigationProfileModule.lua": `local EraNavigationProfiles = ${luaValue(modules.era_navigation_profiles)}\n\nreturn EraNavigationProfiles\n`,
      "ResearchUnlockModule.lua": `local ResearchUnlocks = ${luaValue({ research: modules.research, unlocks: modules.unlock_matrix })}\n\nreturn ResearchUnlocks\n`,
      "UniverseDataModule.lua": `local UniverseData = ${luaValue({ galaxies: modules.galaxies, sectors: modules.sectors, starSystems: modules.star_systems, planets: modules.planets, celestialBodies: modules.celestial_bodies, factions: modules.factions, colonies: modules.colonies, colonyBuildings: modules.colony_buildings, colonyLevels: modules.colony_level_definitions, colonyFocus: modules.colony_focus_definitions, markets: modules.markets, tradeRoutes: modules.trade_routes, tradeOpportunities: modules.trade_opportunities, missions: modules.missions, missionObjectives: modules.mission_objectives, missionRewards: modules.mission_rewards })}\n\nreturn UniverseData\n`,
      "ApiService.lua": "local HttpService = game:GetService(\"HttpService\")\n\nlocal ApiService = {}\nApiService.BaseUrl = \"https://your-studio-host.example.com/api/export\"\n\nfunction ApiService.FetchGeneric()\n  local response = HttpService:GetAsync(ApiService.BaseUrl .. \"/generic\")\n  return HttpService:JSONDecode(response)\nend\n\nreturn ApiService\n"
    };
  }

  if (target === "web") {
    return {
      "project-genesis.types.ts": "export type GenesisId = string;\n\nexport interface GenesisResource { id: GenesisId; resource_name: string; category: string; rarity: string; }\nexport interface GenesisEraNavigationProfile { dashboardMode: 'current_journey' | 'compact_timeline' | 'full_timeline'; visibleEraCount: number; fullTimelineEnabled: boolean; allowPrimaryHorizontalScroll: boolean; boundaryBehavior: { firstEraMode: string; middleEraMode: string; lastEraMode: string }; }\nexport interface GenesisResearchNode { id: GenesisId; name: string; era: string; status: string; }\nexport interface GenesisFaction { id: GenesisId; name: string; type: string; disposition: string; homeStarSystemId: GenesisId; controlledPlanetIds: GenesisId[]; }\nexport interface GenesisColonyBuilding { id: GenesisId; name: string; category: string; colonyId: GenesisId; constructionStatus: string; modifiers: Record<string, number>; }\nexport interface GenesisColony { id: GenesisId; name: string; planetId: GenesisId; starSystemId: GenesisId; population: number; populationCapacity: number; populationGrowthRate: number; colonyLevel: number; focus: string; status: string; resourceOutputIds: GenesisId[]; resourceOutputRates: Record<string, number>; buildingIds: GenesisId[]; }\nexport interface GenesisMarketListing { resourceId: GenesisId; basePrice: number; currentPrice: number; supply: number; demand: number; priceTrend: string; availability: string; }\nexport interface GenesisMarket { id: GenesisId; name: string; marketType: string; colonyId?: GenesisId; childMarketIds: GenesisId[]; resourceListings: GenesisMarketListing[]; tradeVolume: number; prosperity: number; security: number; }\nexport interface GenesisTradeRoute { id: GenesisId; originMarketId: GenesisId; destinationMarketId: GenesisId; resourceIds: GenesisId[]; profitability: number; risk: number; status: string; }\nexport interface GenesisMissionObjective { id: GenesisId; missionId: GenesisId; objectiveType: string; targetId: GenesisId; targetCount: number; currentCount: number; completed: boolean; }\nexport interface GenesisMission { id: GenesisId; title: string; missionType: string; status: string; difficulty: string; objectiveIds: GenesisId[]; rewardIds: GenesisId[]; rewardsClaimed: boolean; tracked: boolean; }\nexport interface GenesisExportPayload { target: string; canonical: Record<string, unknown>; relationshipMap: Record<string, unknown>; }\n",
      "projectGenesisClient.ts": "export async function fetchProjectGenesisExport(target = 'generic') {\n  const response = await fetch(`/api/export/${target}`);\n  if (!response.ok) throw new Error(`Project Genesis export failed: ${response.status}`);\n  return response.json();\n}\n",
      "projectGenesisStore.ts": "import { create } from 'zustand';\n\ntype GenesisStore = { data: unknown | null; setData: (data: unknown) => void };\nexport const useGenesisStore = create<GenesisStore>((set) => ({ data: null, setData: (data) => set({ data }) }));\n"
    };
  }

  if (target === "unity") {
    return {
      "ResourceCatalog.cs": "using System;\n\n[Serializable]\npublic class ResourceCatalogEntry { public string id; public string resource_name; public string category; public string rarity; }\n",
      "ResearchUnlocks.cs": "using System;\n\n[Serializable]\npublic class ResearchUnlockRow { public string id; public string source_id; public string unlock_type; public string unlock_name; }\n",
      "UniverseLoader.cs": "using UnityEngine;\n\npublic class UniverseLoader : MonoBehaviour { public TextAsset projectGenesisJson; }\n",
      "ScriptableObjectGuidance.md": "Create ScriptableObjects from imported JSON for editor convenience. Keep Project Genesis Studio as the authoritative source."
    };
  }

  if (target === "unreal") {
    return {
      "GenesisResourceStruct.h": "USTRUCT(BlueprintType)\nstruct FGenesisResourceRow { GENERATED_BODY() UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Id; UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ResourceName; };\n",
      "ResearchUnlockTable.md": "Import unlock_matrix as a DataTable keyed by stable id. Keep source_id and unlock_id as FString references.",
      "UniverseData.md": "Import galaxies, sectors, star_systems, planets, and celestial_bodies as JSON or DataTables. Preserve parent IDs."
    };
  }

  if (target === "godot") {
    return {
      "ResourceCatalog.gd": "extends Node\n\nvar resources := {}\n\nfunc load_catalog(payload: Dictionary) -> void:\n\tresources = payload.get(\"canonical\", {}).get(\"resource_catalog\", {})\n",
      "ResearchUnlocks.gd": "extends Node\n\nfunc unlock_rows(payload: Dictionary) -> Array:\n\treturn payload.get(\"canonical\", {}).get(\"unlock_matrix\", [])\n",
      "UniverseLoader.gd": "extends Node\n\nfunc load_universe(payload: Dictionary) -> Dictionary:\n\treturn payload.get(\"canonical\", {})\n"
    };
  }

  return {
    "canonical-data.json": compactModules(modules),
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
