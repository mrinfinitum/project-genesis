import { NextResponse } from "next/server";
import { getGameData } from "@/lib/data";
import { discoveryJournalSchema, sampleDiscoveryJournal, sampleTimelineEvents, timelineEventSchema } from "@/lib/explorer/discovery-log";
import { colonyBuildingTemplates, colonyFocusDefinitions, colonyLevelDefinitions, colonySchema, createColonyRecord, generateFallbackColonies, type ColonyBuilding, type ColonyRecord } from "@/lib/colonies/procedural";
import { buildEconomyState, economySchemas, priceClamps, type MarketRecord, type ResourceListing, type TradeOpportunity, type TradeRoute } from "@/lib/economy/trade";
import { generateFaction, generateFallbackFactions, type FactionRecord } from "@/lib/factions/procedural";
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
  economy_schemas: typeof economySchemas;
  pricing_rules: ReturnType<typeof buildEconomyState>["pricingRules"];
  market_level_definitions: ReturnType<typeof buildEconomyState>["marketLevelDefinitions"];
  economy: Array<Record<string, unknown>>;
  factions: FactionRecord[];
  missions: Array<Record<string, unknown>>;
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
    economy_schemas: economySchemas,
    pricing_rules: economyState.pricingRules,
    market_level_definitions: economyState.marketLevelDefinitions,
    economy: [
      {
        id: "economy_canonical_summary",
        status: "canonical",
        markets: economyState.markets.length,
        tradeRoutes: economyState.tradeRoutes.length,
        tradeOpportunities: economyState.tradeOpportunities.length,
        pricingRule: economyState.pricingRules.formula
      }
    ],
    factions,
    missions: placeholderModule("missions")
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
    tradeRoutesByMarket
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
    const missing = rows.map((row, index) => ({ row, index })).filter(({ row }) => !row?.id || typeof row.id !== "string");
    if (missing.length) {
      addIssue(issues, "error", "missing_id", `${moduleName} has records without stable string IDs.`, missing.map(({ index }) => `${moduleName}[${index}]`));
    }

    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const row of rows) {
      const id = typeof row?.id === "string" ? row.id : "";
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
    economy: "Markets, resource listings, trade routes, and opportunities are engine-agnostic canonical data. Pricing uses ResourceService base trade values and deterministic modifiers.",
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
    economy_schemas: modules.economy_schemas,
    pricing_rules: modules.pricing_rules,
    market_level_definitions: modules.market_level_definitions,
    economy: modules.economy,
    factions: modules.factions,
    missions: modules.missions
  };
}

function targetArtifacts(target: EngineTarget, modules: CanonicalModules) {
  if (target === "roblox") {
    return {
      "ResourceCatalogModule.lua": `local ResourceCatalog = ${luaValue(modules.resource_catalog)}\n\nreturn ResourceCatalog\n`,
      "ResearchUnlockModule.lua": `local ResearchUnlocks = ${luaValue({ research: modules.research, unlocks: modules.unlock_matrix })}\n\nreturn ResearchUnlocks\n`,
      "UniverseDataModule.lua": `local UniverseData = ${luaValue({ galaxies: modules.galaxies, sectors: modules.sectors, starSystems: modules.star_systems, planets: modules.planets, celestialBodies: modules.celestial_bodies, factions: modules.factions, colonies: modules.colonies, colonyBuildings: modules.colony_buildings, colonyLevels: modules.colony_level_definitions, colonyFocus: modules.colony_focus_definitions, markets: modules.markets, tradeRoutes: modules.trade_routes, tradeOpportunities: modules.trade_opportunities })}\n\nreturn UniverseData\n`,
      "ApiService.lua": "local HttpService = game:GetService(\"HttpService\")\n\nlocal ApiService = {}\nApiService.BaseUrl = \"https://your-studio-host.example.com/api/export\"\n\nfunction ApiService.FetchGeneric()\n  local response = HttpService:GetAsync(ApiService.BaseUrl .. \"/generic\")\n  return HttpService:JSONDecode(response)\nend\n\nreturn ApiService\n"
    };
  }

  if (target === "web") {
    return {
      "project-genesis.types.ts": "export type GenesisId = string;\n\nexport interface GenesisResource { id: GenesisId; resource_name: string; category: string; rarity: string; }\nexport interface GenesisResearchNode { id: GenesisId; name: string; era: string; status: string; }\nexport interface GenesisFaction { id: GenesisId; name: string; type: string; disposition: string; homeStarSystemId: GenesisId; controlledPlanetIds: GenesisId[]; }\nexport interface GenesisColonyBuilding { id: GenesisId; name: string; category: string; colonyId: GenesisId; constructionStatus: string; modifiers: Record<string, number>; }\nexport interface GenesisColony { id: GenesisId; name: string; planetId: GenesisId; starSystemId: GenesisId; population: number; populationCapacity: number; populationGrowthRate: number; colonyLevel: number; focus: string; status: string; resourceOutputIds: GenesisId[]; resourceOutputRates: Record<string, number>; buildingIds: GenesisId[]; }\nexport interface GenesisMarketListing { resourceId: GenesisId; basePrice: number; currentPrice: number; supply: number; demand: number; priceTrend: string; availability: string; }\nexport interface GenesisMarket { id: GenesisId; name: string; marketType: string; colonyId?: GenesisId; childMarketIds: GenesisId[]; resourceListings: GenesisMarketListing[]; tradeVolume: number; prosperity: number; security: number; }\nexport interface GenesisTradeRoute { id: GenesisId; originMarketId: GenesisId; destinationMarketId: GenesisId; resourceIds: GenesisId[]; profitability: number; risk: number; status: string; }\nexport interface GenesisExportPayload { target: string; canonical: Record<string, unknown>; relationshipMap: Record<string, unknown>; }\n",
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
