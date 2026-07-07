import assetsRaw from "./json/Icons_Assets.json";
import buildingChainsRaw from "./json/Building_Chains.json";
import buildingRelationshipsRaw from "./json/Building_Relationships.json";
import buildingsRaw from "./json/Buildings.json";
import changelogRaw from "./json/Changelog.json";
import districtsRaw from "./json/Districts.json";
import featureFlagsRaw from "./json/Feature_Flags.json";
import gameConstantsRaw from "./json/Game_Constants.json";
import planetGenerationRaw from "./json/Planet_Generation.json";
import planetResourceProfilesRaw from "./json/Planet_Resource_Profiles.json";
import planetTraitsRaw from "./json/Planet_Traits.json";
import releaseNotesRaw from "./json/Release_Notes.json";
import resourceCatalogRaw from "./json/Resource_Catalog.json";
import researchBranchesRaw from "./json/Research_Branches.json";
import researchRaw from "./json/Research.json";
import unlockMatrixRaw from "./json/Unlock_Matrix.json";
import upgradesRaw from "./json/All_Upgrades.json";
import wondersRaw from "./json/Wonders.json";
import { planetSystemVariables } from "./planet-system";
import type {
  AssetRecord,
  Building,
  BuildingChain,
  BuildingRelationship,
  ChangelogEntry,
  CodexReadinessItem,
  ConceptualArtRecord,
  DashboardMetric,
  DataHealthCheck,
  District,
  FeatureFlag,
  GameConstant,
  GameData,
  GeneratedPlanet,
  PlanetResourceProfile,
  PlanetVariable,
  ProjectSystem,
  ProjectSystemHistory,
  ReleaseNote,
  ResearchBranch,
  ResearchNode,
  ResourceCatalogItem,
  UnlockMatrixRow,
  Upgrade,
  Wonder
} from "@/types/schema";

type RawRow = Record<string, unknown>;

function text(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function nullable(value: unknown) {
  const next = text(value).trim();
  return next ? next : null;
}

function number(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function boolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "yes", "enabled", "1"].includes(text(value).toLowerCase());
}

function list(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(text).filter(Boolean);
  }

  return text(value)
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function dedupePlanetVariables(rows: PlanetVariable[]) {
  const seen = new Set<string>();
  const deduped: PlanetVariable[] = [];

  for (const row of rows) {
    const key = `${row.category.toLowerCase()}::${row.value.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(row);
    }
  }

  return deduped;
}

const researchNameToId = new Map((researchRaw as RawRow[]).map((row) => [text(row.Research), text(row.ID)]));
const districtNameToId = new Map((districtsRaw as RawRow[]).map((row) => [text(row.District), text(row.ID)]));

export const handoffResearchBranches: ResearchBranch[] = (researchBranchesRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  name: text(row.Branch),
  purpose: text(row["Branch Purpose"])
}));

export const handoffResearch: ResearchNode[] = (researchRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  branch_id: text(row["Branch ID"]),
  era: text(row.Era),
  era_order: number(row["Era Order"]),
  node_order: number(row["Node Order"]),
  name: text(row.Research),
  design_purpose: text(row["Design Purpose"]),
  primary_unlock_type: text(row["Primary Unlock Type"]),
  unlocks: list(row.Unlocks),
  gameplay_effect: text(row["Gameplay Effect"]),
  prerequisite_id: nullable(row["Prerequisite ID"]),
  cost_experimental: number(row["Cost Experimental"]),
  research_time: text(row["Research Time"]),
  related_systems: list(row["Related Systems"]),
  icon_name: text(row["Icon Name"]),
  asset_id: nullable(row["Asset ID"]),
  status: text(row.Status),
  notes: text(row.Notes)
}));

export const handoffDistricts: District[] = (districtsRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  name: text(row.District),
  purpose: text(row.Purpose),
  primary_buildings: list(row["Primary Buildings"]),
  primary_stat: text(row["Primary Stat"]),
  bonus: text(row.Bonus),
  unlock_research: nullable(row["Unlock Research"]),
  civilization: text(row.Civilization),
  priority: Number.isFinite(Number(row.Priority)) ? number(row.Priority) : 0
}));

export const handoffBuildings: Building[] = (buildingsRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  era: text(row.Era),
  civilization: text(row.Civilization),
  category: text(row.Category),
  name: text(row.Building),
  description: text(row.Description),
  cost_credits: number(row["Cost Credits"]),
  cost_labor: number(row["Cost Labor"]),
  cost_experimental: number(row["Cost Experimental"]),
  construction_time: text(row["Construction Time"]),
  income_credits_sec: number(row["Income Credits/sec"]),
  income_labor_sec: number(row["Income Labor/sec"]),
  income_experimental_sec: number(row["Income Experimental/sec"]),
  population_bonus: number(row["Population Bonus"]),
  labor_requirement: number(row["Labor Requirement"]),
  building_size: text(row["Building Size"]),
  district_id: districtNameToId.get(text(row.District)) ?? null,
  unlock_research_id: researchNameToId.get(text(row["Unlock Research"])) ?? null,
  unlock_building: nullable(row["Unlock Building"]),
  visual_evolution: text(row["Visual Evolution"]),
  upgrade_chain: text(row["Upgrade Chain"]),
  wonder: text(row.Wonder),
  icon_name: text(row["Icon Name"]),
  model_name: text(row["Model Name"]),
  asset_id: nullable(row["Asset ID"]),
  notes: text(row.Notes)
}));

export const handoffUnlockMatrix: UnlockMatrixRow[] = (unlockMatrixRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  source_type: text(row["Source Type"]),
  source_id: text(row["Source ID"]),
  source_name: text(row["Source Name"]),
  source_branch: text(row["Source Branch"]),
  source_era: text(row["Source Era"]),
  unlock_type: text(row["Unlock Type"]),
  unlock_name: text(row["Unlock Name"]),
  unlock_id: nullable(row["Unlock ID"]),
  implementation_status: text(row["Implementation Status"]),
  notes: text(row.Notes)
}));

export const handoffWonders: Wonder[] = (wondersRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  name: text(row.Wonder),
  civilization: text(row.Civilization),
  unlock_research_id: nullable(row["Unlock Research ID"]),
  civilization_id: nullable(row["Civilization ID"]),
  primary_bonus_type: text(row["Primary Bonus Type"]),
  bonuses: list(row.Bonuses),
  requirements: list(row.Requirements),
  construction_cost: text(row["Construction Cost"]),
  construction_time: text(row["Construction Time"]),
  icon_name: text(row["Icon Name"]),
  model_name: text(row["Model Name"]),
  status: text(row.Status),
  notes: text(row.Notes)
}));

export const handoffUpgrades: Upgrade[] = (upgradesRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  type: text(row.Tab),
  civilization: text(row.Civilization),
  era: text(row.Era),
  name: text(row.Upgrade),
  tier: text(row.Tier),
  max_level: number(row["Max Level"]),
  unlock_level: number(row["Unlock Level"]),
  cost_resource: text(row["Cost Resource"]),
  base_cost: number(row["Base Cost"]),
  cost_multiplier: number(row["Cost Multiplier"]),
  bonus_type: text(row["Bonus Type"]),
  bonus_value: text(row["Bonus Value"]),
  description: text(row.Description),
  icon_name: text(row["Icon Name"]),
  asset_id: nullable(row["Asset ID"]),
  notes: text(row.Notes)
}));

export const handoffBuildingRelationships: BuildingRelationship[] = (buildingRelationshipsRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  building_id: text(row["Building ID"]),
  building: text(row.Building),
  era: text(row.Era),
  civilization: text(row.Civilization),
  category: text(row.Category),
  district_id: nullable(row["District ID"]),
  district: text(row.District),
  chain_id: nullable(row["Chain ID"]),
  unlock_research: nullable(row["Unlock Research"]),
  unlock_research_id: nullable(row["Unlock Research ID"]),
  primary_upgrade_dependency: nullable(row["Primary Upgrade Dependency"]),
  primary_upgrade_id: nullable(row["Primary Upgrade ID"]),
  wonder_id: nullable(row["Wonder ID"]),
  implementation_status: text(row["Implementation Status"]),
  notes: text(row.Notes)
}));

export const handoffBuildingChains: BuildingChain[] = (buildingChainsRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  chain: text(row.Chain),
  district: text(row.District),
  level_1: text(row["Level 1"]),
  level_2: text(row["Level 2"]),
  level_3: text(row["Level 3"]),
  level_4: text(row["Level 4"]),
  level_5: text(row["Level 5"]),
  gameplay_role: text(row["Gameplay Role"]),
  research_progression: text(row["Research Progression"])
}));

export const handoffGameConstants: GameConstant[] = (gameConstantsRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  constant: text(row.Constant),
  value: row.Value as string | number | boolean,
  description: text(row.Description)
}));

export const handoffFeatureFlags: FeatureFlag[] = (featureFlagsRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  feature: text(row.Feature),
  enabled: boolean(row.Enabled),
  launch_phase: text(row["Launch Phase"]),
  notes: text(row.Notes)
}));

export const handoffAssets: AssetRecord[] = (assetsRaw as RawRow[]).map((row) => ({
  id: text(row.ID),
  name: text(row.Asset || row.Name || row.ID),
  type: text(row.Type),
  category: text(row.Category),
  prompt: text(row.Prompt),
  file_url: text(row["File URL"]),
  source_file_url: text(row["Source File URL"]),
  source_file_type: text(row["Source File Type"]),
  parent_asset_id: nullable(row["Parent Asset ID"]),
  slice_name: text(row["Slice Name"]),
  roblox_asset_id: text(row["Roblox Asset ID"]),
  export_status: text(row["Export Status"]),
  status: text(row.Status || "Draft"),
  notes: text(row.Notes)
}));

export const handoffConceptualArt: ConceptualArtRecord[] = [];
export const handoffGeneratedPlanets: GeneratedPlanet[] = [];

const handoffPlanetGeneration: PlanetVariable[] = (planetGenerationRaw as RawRow[]).map((row) => ({
    id: text(row.ID),
    category: text(row.Category) === "Biome" ? "Primary Biome" : text(row.Category),
    value: text(row.Value),
    description: text(row.Description),
    generation_rule: text(row["Generation Rule"]),
    frequency: "",
    weight: 0,
    min_value: 0,
    max_value: 0,
    biome_tags: [],
    resource_tags: [],
    status: "Draft",
    notes: ""
  }));

const handoffPlanetTraits: PlanetVariable[] = (planetTraitsRaw as RawRow[]).map((row) => ({
    id: text(row.ID),
    category: "Trait",
    value: text(row.Trait),
    description: text(row.Description),
    generation_rule: text(row["Generation Rule"]),
    frequency: text(row.Frequency),
    weight: 0,
    min_value: 0,
    max_value: 0,
    biome_tags: [],
    resource_tags: [],
    status: "Draft",
    notes: ""
  }));

export const handoffPlanets: PlanetVariable[] = dedupePlanetVariables([...planetSystemVariables, ...handoffPlanetGeneration, ...handoffPlanetTraits]);

export const handoffPlanetResourceProfiles: PlanetResourceProfile[] = (planetResourceProfilesRaw as RawRow[]).map((row) => {
  const planetClass = text(row["Planet Class"]);
  const subclass = text(row.Subclass);

  return {
    id: `planet-resource-${slug(planetClass)}-${slug(subclass)}`,
    planet_class: planetClass,
    subclass,
    discovery_tier: text(row["Discovery Tier"]),
    colonizable: text(row.Colonizable),
    mining_difficulty: number(row["Mining Difficulty 1-10"]),
    resource_density: text(row["Resource Density"]),
    planet_rarity_bias: text(row["Planet Rarity Bias"]),
    guaranteed_resources: list(row["Guaranteed Resources"]),
    common_resources: list(row["Common Resources"]),
    rare_resources: list(row["Rare Resources"]),
    exotic_resources: list(row["Exotic Resources"]),
    scientific_notes: text(row["Scientific / Design Notes"]),
    created_at: "2026-07-06T00:00:00.000Z",
    updated_at: "2026-07-06T00:00:00.000Z"
  };
});

export const handoffResourceCatalog: ResourceCatalogItem[] = (resourceCatalogRaw as RawRow[]).map((row) => ({
  id: text(row["Resource ID"]),
  resource_name: text(row["Resource Name"]),
  category: text(row.Category),
  rarity: text(row.Rarity),
  rarity_color: text(row["Rarity Color"]),
  discovery_tier: text(row["Discovery Tier"]),
  earth_available: text(row["Earth Available"]),
  first_unlock_requirement: text(row["First Unlock / Requirement"]),
  typical_planet_classes: list(row["Typical Planet Classes"]),
  primary_uses: list(row["Primary Uses"]),
  base_trade_value: number(row["Base Trade Value"]),
  stack_size: number(row["Stack Size"]),
  description: text(row.Description),
  science_lore_notes: text(row["Science / Lore Notes"]),
  codex_implementation_notes: text(row["Codex Implementation Notes"]),
  created_at: "2026-07-06T00:00:00.000Z",
  updated_at: "2026-07-06T00:00:00.000Z"
}));

export const handoffReleaseNotes: ReleaseNote[] = (releaseNotesRaw as RawRow[]).map((row, index) => ({
  id: `release-note-${index + 1}`,
  version: text(row.Item) === "Version" ? text(row.Value) : "2.2 Sprint 2",
  release_name: text(row.Item),
  purpose: text(row.Value),
  notes: "",
  created_at: "2026-06-30T00:00:00.000Z"
}));

export const handoffChangelog: ChangelogEntry[] = (changelogRaw as RawRow[]).map((row, index) => ({
  id: `changelog-${index + 1}`,
  version: text(row.Version),
  sheet_or_table: text(row.Sheet),
  change_type: text(row["Change Type"]),
  change_summary: text(row["Change Summary"]),
  created_at: "2026-06-30T00:00:00.000Z"
}));

const projectSystemSeeds = [
  ["universe", "Universe", "Core Foundation", "Deterministic universe architecture, root seeds, and world rules.", "Orbit", 5, 0, "Draft universe seed schema and galaxy root identifiers.", "Critical"],
  ["galaxy", "Galaxy", "Core Foundation", "Galaxy map, sectors, regions, and traversal layer.", "Compass", 10, 0, "Build sector tables and connect explorer output.", "Critical"],
  ["star-systems", "Star Systems", "Core Foundation", "Generated star systems, orbital slots, and stellar metadata.", "Sun", 15, 0, "Create persistent star system generation tables.", "High"],
  ["seeds", "Seeds", "Core Foundation", "Root seed rules for repeatable generation.", "Fingerprint", 20, 0, "Lock seed format for planets, systems, and sectors.", "High"],
  ["exports", "Exports", "Core Foundation", "Codex and Roblox-ready JSON export surface.", "Download", 70, 12, "Add universe and resource profile exports.", "Medium"],
  ["planet-classes", "Planet Classes", "Planet Generation", "Main planet classes and landability rules.", "CircleDot", 78, 16, "Audit gas giant orbital-only behavior.", "High"],
  ["planet-subclasses", "Planet Subclasses", "Planet Generation", "Second-level planet subclasses and art matching.", "Layers", 62, 48, "Finish subclass-to-render-library mapping.", "High"],
  ["planet-rarity", "Planet Rarity", "Planet Generation", "Rarity rolls, discovery point bands, and card treatment.", "Gem", 85, 9, "Expose rarity weights in generation docs.", "Medium"],
  ["planet-resources", "Planet Resources", "Planet Generation", "Planet resource profiles and resource catalog links.", "Database", 65, 92, "Resolve unknown resource names in profiles.", "Critical"],
  ["planet-prompt-library", "Planet Prompt Library", "Planet Generation", "Copy-ready image prompts for external render workflows.", "Palette", 55, 54, "Trim duplicate wording in subclass prompt blocks.", "Medium"],
  ["planet-art-assets", "Planet Art Assets", "Planet Generation", "PSD and PNG planet render library.", "Image", 32, 9, "Import the next batch of biome render files.", "High"],
  ["resources", "Resources", "Gameplay Database", "Canonical resource catalog, usage, rarity, and planet availability.", "Pickaxe", 90, 140, "Attach resource IDs to planet profile outputs.", "High"],
  ["research", "Research", "Gameplay Database", "Research nodes, branches, eras, and unlock logic.", "FlaskConical", 100, 150, "Lock v1 research module export.", "Medium"],
  ["buildings", "Buildings", "Gameplay Database", "Buildings, costs, unlocks, production, and art references.", "Building2", 75, 118, "Fill missing unlock research references.", "High"],
  ["upgrades", "Upgrades", "Gameplay Database", "Progression upgrades, tiers, and assets.", "TrendingUp", 70, 96, "Attach final source PSD files.", "Medium"],
  ["unlock-matrix", "Unlock Matrix", "Gameplay Database", "Research-to-content unlock relationships.", "GitBranch", 68, 180, "Map orphan unlock names to IDs.", "High"],
  ["districts", "Districts", "Gameplay Database", "District definitions, bonuses, and priority.", "Map", 72, 10, "Connect district IDs to building records.", "Medium"],
  ["wonders", "Wonders", "Gameplay Database", "Civilization wonders and special bonuses.", "Landmark", 58, 6, "Complete wonder requirements and art refs.", "Medium"],
  ["ancient-civilizations", "Ancient Civilizations", "Galaxy Content", "Ancient civilization pools for planet history.", "Scroll", 35, 0, "Create first civilization relic set.", "Medium"],
  ["planet-traits", "Planet Traits", "Galaxy Content", "Trait pools, modifiers, and surface hooks.", "Sparkles", 45, 0, "Normalize trait effect naming.", "Medium"],
  ["anomalies", "Anomalies", "Galaxy Content", "Rare planet and system anomalies.", "Atom", 28, 0, "Define anomaly rarity and output effects.", "Low"],
  ["hazards", "Hazards", "Galaxy Content", "Environmental and orbital hazard catalog.", "TriangleAlert", 52, 0, "Split surface hazards from orbital hazards.", "Medium"],
  ["expeditions", "Expeditions", "Galaxy Content", "Exploration outcomes and expedition events.", "Rocket", 18, 0, "Draft expedition reward tables.", "Low"],
  ["collectibles", "Collectibles", "Galaxy Content", "Collectible pools, museums, and discovery rewards.", "Archive", 20, 0, "Create resource-linked collectible sets.", "Medium"],
  ["assets", "Assets", "Production", "Game art assets, PSD sources, exports, and Roblox IDs.", "Package", 15, 36, "Upload source PSDs for priority gameplay icons.", "High"],
  ["tasks", "Tasks", "Production", "Production task planning and implementation handoffs.", "ListChecks", 40, 0, "Convert dashboard next steps into task records.", "Medium"],
  ["release-notes", "Release Notes", "Production", "Versioned release notes and milestone notes.", "FileText", 50, 4, "Add Sprint 0 universe foundation notes.", "Low"],
  ["changelog", "Changelog", "Production", "Tracked content and schema changes.", "History", 60, 18, "Summarize planet generation rewrite changes.", "Low"],
  ["codex-handoffs", "Codex Handoffs", "Production", "Codex-ready export packages and implementation briefs.", "Bot", 42, 5, "Package resource catalog v2 for Roblox modules.", "High"]
] as const;

export const handoffProjectSystems: ProjectSystem[] = projectSystemSeeds.map((row) => {
  const [id, name, groupName, description, icon, completion, completeRecords, nextAction, priority] = row;
  const totalRecords = completeRecords || Math.max(8, Math.round(completion * 1.6));
  const complete = completeRecords || Math.round((totalRecords * completion) / 100);
  const missing = Math.max(0, Math.round((totalRecords - complete) * 0.22));
  const needsReview = Math.max(0, Math.round((totalRecords - complete) * 0.35));
  const blocked = priority === "Critical" ? 2 : priority === "High" ? 1 : 0;

  return {
    id,
    name,
    group_name: groupName,
    description,
    icon,
    status: completion >= 90 ? "Complete" : blocked ? "Needs Review" : "In Progress",
    completion_percent: completion,
    total_records: totalRecords,
    complete_records: complete,
    draft_records: Math.max(0, totalRecords - complete - needsReview),
    needs_review_records: needsReview,
    missing_required_fields: missing,
    blocked_records: blocked,
    codex_ready_count: completion >= 70 ? Math.max(1, Math.round(complete / 25)) : 0,
    last_updated: "2026-07-06T00:00:00.000Z",
    next_action: nextAction,
    priority,
    notes: ""
  };
});

export const handoffProjectSystemHistory: ProjectSystemHistory[] = handoffProjectSystems.flatMap((system) =>
  [28, 21, 14, 7, 0].map((daysAgo, index) => {
    const completion = Math.max(0, system.completion_percent - (4 - index) * 5);
    return {
      id: `${system.id}-history-${index + 1}`,
      system_id: system.id,
      date: new Date(Date.UTC(2026, 6, 6 - daysAgo)).toISOString(),
      completion_percent: completion,
      total_records: system.total_records,
      complete_records: Math.round((system.total_records * completion) / 100),
      needs_review_records: system.needs_review_records,
      missing_required_fields: system.missing_required_fields,
      notes: "Seeded trend sample."
    };
  })
);

export const handoffDataHealthChecks: DataHealthCheck[] = [
  {
    id: "health-planet-resource-unknowns",
    system: "Planet Resources",
    issue: "Planet resource profiles contain unknown resource names",
    severity: "Critical",
    affected_count: 18,
    description: "Several generated profile rows reference resource labels that need canonical resource IDs.",
    recommended_action: "Normalize profile resources against the Resource Catalog v2 table.",
    resolved: false,
    created_at: "2026-07-06T00:00:00.000Z",
    resolved_at: null
  },
  {
    id: "health-building-unlocks",
    system: "Buildings",
    issue: "Buildings missing unlock research",
    severity: "High",
    affected_count: 14,
    description: "Some building records are not connected to research unlock IDs.",
    recommended_action: "Review building unlock fields and map them to research node IDs.",
    resolved: false,
    created_at: "2026-07-06T00:00:00.000Z",
    resolved_at: null
  },
  {
    id: "health-research-unlock-matrix",
    system: "Research",
    issue: "Research nodes missing unlock matrix rows",
    severity: "Medium",
    affected_count: 9,
    description: "Research nodes marked ready should have matching unlock matrix records.",
    recommended_action: "Generate matrix rows for ready research nodes without unlock coverage.",
    resolved: false,
    created_at: "2026-07-06T00:00:00.000Z",
    resolved_at: null
  },
  {
    id: "health-asset-files",
    system: "Assets",
    issue: "Assets missing file URLs",
    severity: "High",
    affected_count: 22,
    description: "Priority art records still need source or generated file URLs.",
    recommended_action: "Upload source PSDs and regenerate exported PNG variants.",
    resolved: false,
    created_at: "2026-07-06T00:00:00.000Z",
    resolved_at: null
  },
  {
    id: "health-planet-prompts",
    system: "Planet Prompt Library",
    issue: "Planet art prompts missing subclass mapping",
    severity: "Medium",
    affected_count: 11,
    description: "Some prompt library entries do not line up with current class/subclass folders.",
    recommended_action: "Sync prompt library rows with planet-renders folder names.",
    resolved: false,
    created_at: "2026-07-06T00:00:00.000Z",
    resolved_at: null
  }
];

export const handoffCodexReadinessItems: CodexReadinessItem[] = [
  {
    id: "codex-resource-catalog-v1",
    title: "Resource Catalog v1.0",
    system: "Resources",
    status: "Ready",
    description: "Canonical resource definitions are ready for Roblox module generation.",
    related_tables: ["resource_catalog", "planet_resource_profiles"],
    export_path: "/api/export/resource_catalog.json",
    priority: "High",
    created_at: "2026-07-06T00:00:00.000Z",
    notes: "Use for resource constants and economy references."
  },
  {
    id: "codex-planet-resource-profiles-v2",
    title: "Planet Resource Profiles v2.0",
    system: "Planet Resources",
    status: "Needs Review",
    description: "Profile data is structurally ready but needs resource ID normalization.",
    related_tables: ["planet_resource_profiles", "resource_catalog"],
    export_path: "/api/export/planet_resource_profiles.json",
    priority: "Critical",
    created_at: "2026-07-06T00:00:00.000Z",
    notes: "Blocker for deterministic planet resource generation."
  },
  {
    id: "codex-research-unlocks",
    title: "Research Unlock Matrix",
    system: "Research",
    status: "In Progress",
    description: "Research and unlock matrix can be exported for Lua unlock modules.",
    related_tables: ["research", "unlock_matrix"],
    export_path: "/api/export/research.json",
    priority: "High",
    created_at: "2026-07-06T00:00:00.000Z",
    notes: "Needs final orphan unlock review."
  }
];

export const handoffDashboardMetrics: DashboardMetric[] = [
  { id: "metric-current-sprint", metric_name: "Current Sprint", metric_value: "Sprint 0 Universe Foundation", metric_group: "hero", display_order: 1, updated_at: "2026-07-06T00:00:00.000Z" },
  { id: "metric-database-version", metric_name: "Database Version", metric_value: "v0.4.0", metric_group: "hero", display_order: 2, updated_at: "2026-07-06T00:00:00.000Z" },
  { id: "metric-ready-for-codex", metric_name: "Ready for Codex", metric_value: "3", metric_group: "hero", display_order: 3, updated_at: "2026-07-06T00:00:00.000Z" }
];

export const handoffData: GameData = {
  research_branches: handoffResearchBranches,
  research: handoffResearch,
  buildings: handoffBuildings,
  unlock_matrix: handoffUnlockMatrix,
  districts: handoffDistricts,
  wonders: handoffWonders,
  upgrades: handoffUpgrades,
  building_relationships: handoffBuildingRelationships,
  building_chains: handoffBuildingChains,
  game_constants: handoffGameConstants,
  feature_flags: handoffFeatureFlags,
  assets: handoffAssets,
  conceptual_art: handoffConceptualArt,
  planets: handoffPlanets,
  planet_resource_profiles: handoffPlanetResourceProfiles,
  resource_catalog: handoffResourceCatalog,
  generated_planets: handoffGeneratedPlanets,
  planet_render_library: [],
  release_notes: handoffReleaseNotes,
  changelog: handoffChangelog,
  project_systems: handoffProjectSystems,
  project_system_history: handoffProjectSystemHistory,
  data_health_checks: handoffDataHealthChecks,
  codex_readiness_items: handoffCodexReadinessItems,
  dashboard_metrics: handoffDashboardMetrics
};
