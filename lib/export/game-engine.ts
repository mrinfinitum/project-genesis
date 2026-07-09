import { NextResponse } from "next/server";
import { getGameData } from "@/lib/data";
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
    schemaMapping: ["resource_catalog -> ResourceCatalogModule", "research + unlock_matrix -> ResearchUnlockModule", "galaxies/sectors/star_systems/planets -> UniverseDataModule"],
    apiNotes: ["Roblox consumes Studio/API data; it is not the primary data generator.", "Use HttpService against the Generic JSON API for live sync workflows."]
  },
  unity: {
    id: "unity",
    label: "Unity / C#",
    format: "C# models, ScriptableObject guidance, and JSON import payloads",
    endpoint: "/api/export/unity",
    folderStructure: ["Assets/ProjectGenesis/Data", "Assets/ProjectGenesis/Scripts/Generated", "Assets/ProjectGenesis/ScriptableObjects"],
    generatedModules: ["ResourceCatalog.cs", "ResearchUnlocks.cs", "UniverseLoader.cs"],
    schemaMapping: ["resource_catalog -> ResourceDefinition", "research + unlock_matrix -> ResearchUnlockDefinition", "universe data -> UniverseData"],
    apiNotes: ["Import JSON at build time or pull from the Generic JSON API at runtime.", "ScriptableObjects should cache imported data, not replace Studio ownership."]
  },
  unreal: {
    id: "unreal",
    label: "Unreal / JSON DataTables",
    format: "JSON/DataTable-ready rows plus C++/Blueprint struct definitions",
    endpoint: "/api/export/unreal",
    folderStructure: ["Content/ProjectGenesis/Data", "Source/ProjectGenesis/Public/Generated", "Source/ProjectGenesis/Private/Loaders"],
    generatedModules: ["ResourceCatalog", "ResearchUnlockTable", "UniverseData"],
    schemaMapping: ["resource_catalog -> FGenesisResourceRow", "unlock_matrix -> FGenesisResearchUnlockRow", "universe data -> FGenesisUniverseData"],
    apiNotes: ["Use DataTables for static builds or HTTP JSON for live tools.", "Structs mirror Studio IDs and relationships."]
  },
  godot: {
    id: "godot",
    label: "Godot / GDScript",
    format: "JSON exports with GDScript loader templates",
    endpoint: "/api/export/godot",
    folderStructure: ["res://project_genesis/data", "res://project_genesis/loaders", "res://project_genesis/autoload"],
    generatedModules: ["ResourceCatalog.gd", "ResearchUnlocks.gd", "UniverseLoader.gd"],
    schemaMapping: ["resource_catalog -> ResourceCatalog.gd", "research + unlock_matrix -> ResearchUnlocks.gd", "universe data -> UniverseLoader.gd"],
    apiNotes: ["Load local JSON with FileAccess or fetch Studio exports with HTTPRequest.", "Keep gameplay rules in exported JSON, not duplicated GDScript tables."]
  },
  web: {
    id: "web",
    label: "Web Game / TypeScript",
    format: "TypeScript interfaces, JSON exports, API client, and store examples",
    endpoint: "/api/export/web",
    folderStructure: ["src/project-genesis/data", "src/project-genesis/api", "src/project-genesis/store"],
    generatedModules: ["project-genesis.types.ts", "projectGenesisClient.ts", "projectGenesisStore.ts"],
    schemaMapping: ["canonical payload -> TypeScript interfaces", "endpoint references -> API client", "relationship map -> normalized store"],
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
  planets: GameData["generated_planets"];
  planet_rules: GameData["planets"];
  celestial_bodies: GameData["celestial_bodies"];
  colonies: Array<Record<string, unknown>>;
  economy: Array<Record<string, unknown>>;
  factions: Array<Record<string, unknown>>;
  missions: Array<Record<string, unknown>>;
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

function buildCanonicalModules(data: GameData): CanonicalModules {
  const localBubble = getLocalBubbleSystems(24);
  const starSystems = data.star_systems.length ? data.star_systems : (generatedStarSystemRows(24) as GameData["star_systems"]);
  const galaxies = [localBubble.galaxy];
  const sectors = ensureSectorsForSystems(localBubble.galaxy, localBubble.sector, starSystems);
  const celestialBodies = data.celestial_bodies.length ? data.celestial_bodies : (generatedCelestialBodyRows(5) as GameData["celestial_bodies"]);

  return {
    resource_catalog: ResourceService.catalog,
    planet_resource_profiles: validatePlanetResourceProfiles(data.planet_resource_profiles as PlanetResourceProfile[]),
    research: data.research,
    unlock_matrix: data.unlock_matrix,
    galaxies,
    sectors,
    star_systems: starSystems,
    planets: data.generated_planets,
    planet_rules: data.planets,
    celestial_bodies: celestialBodies,
    colonies: placeholderModule("colonies"),
    economy: placeholderModule("economy"),
    factions: placeholderModule("factions"),
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

  return {
    sectorsByGalaxy,
    systemsBySector,
    bodiesBySystem,
    planetsBySystem
  };
}

function planetSystemReference(planet: GeneratedPlanet, starSystems: GameData["star_systems"]) {
  const record = planet as GeneratedPlanet & { starSystemId?: string; star_system_id?: string };
  if (record.starSystemId) return record.starSystemId;
  if (record.star_system_id) return record.star_system_id;
  return starSystems.find((system) => system.system_name === planet.star_system || system.id === planet.star_system)?.id ?? "";
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
    addIssue(issues, "warning", "planet_parent_missing", "Some generated planets do not include a resolvable star system link.", planetsMissingSystems.map((row) => row.id));
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
    celestial_bodies: modules.celestial_bodies,
    colonies: modules.colonies,
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
      "UniverseDataModule.lua": `local UniverseData = ${luaValue({ galaxies: modules.galaxies, sectors: modules.sectors, starSystems: modules.star_systems, planets: modules.planets, celestialBodies: modules.celestial_bodies })}\n\nreturn UniverseData\n`,
      "ApiService.lua": "local HttpService = game:GetService(\"HttpService\")\n\nlocal ApiService = {}\nApiService.BaseUrl = \"https://your-studio-host.example.com/api/export\"\n\nfunction ApiService.FetchGeneric()\n  local response = HttpService:GetAsync(ApiService.BaseUrl .. \"/generic\")\n  return HttpService:JSONDecode(response)\nend\n\nreturn ApiService\n"
    };
  }

  if (target === "web") {
    return {
      "project-genesis.types.ts": "export type GenesisId = string;\n\nexport interface GenesisResource { id: GenesisId; resource_name: string; category: string; rarity: string; }\nexport interface GenesisResearchNode { id: GenesisId; name: string; era: string; status: string; }\nexport interface GenesisExportPayload { target: string; canonical: Record<string, unknown>; relationshipMap: Record<string, unknown>; }\n",
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
