export type Status = string;

export type ResearchBranch = {
  id: string;
  name: string;
  purpose: string;
};

export type ResearchNode = {
  id: string;
  branch_id: string;
  era: string;
  era_order: number;
  node_order: number;
  name: string;
  design_purpose: string;
  primary_unlock_type: string;
  unlocks: string[];
  gameplay_effect: string;
  prerequisite_id: string | null;
  cost_experimental: number;
  research_time: string;
  related_systems: string[];
  icon_name: string;
  asset_id: string | null;
  status: Status;
  notes: string;
};

export type Building = {
  id: string;
  era: string;
  civilization: string;
  category: string;
  name: string;
  description: string;
  cost_credits: number;
  cost_labor: number;
  cost_experimental: number;
  construction_time: string;
  income_credits_sec: number;
  income_labor_sec: number;
  income_experimental_sec: number;
  population_bonus: number;
  labor_requirement: number;
  building_size: string;
  district_id: string | null;
  unlock_research_id: string | null;
  unlock_building: string | null;
  visual_evolution: string;
  upgrade_chain: string;
  wonder: string;
  icon_name: string;
  model_name: string;
  asset_id: string | null;
  notes: string;
};

export type UnlockMatrixRow = {
  id: string;
  source_type: string;
  source_id: string;
  source_name: string;
  source_branch: string;
  source_era: string;
  unlock_type: string;
  unlock_name: string;
  unlock_id: string | null;
  implementation_status: Status;
  notes: string;
};

export type District = {
  id: string;
  name: string;
  purpose: string;
  primary_buildings: string[];
  primary_stat: string;
  bonus: string;
  unlock_research: string | null;
  civilization: string;
  priority: number;
};

export type Wonder = {
  id: string;
  name: string;
  civilization: string;
  unlock_research_id: string | null;
  civilization_id: string | null;
  primary_bonus_type: string;
  bonuses: string[];
  requirements: string[];
  construction_cost: string;
  construction_time: string;
  icon_name: string;
  model_name: string;
  status: Status;
  notes: string;
};

export type AssetRecord = {
  id: string;
  name: string;
  type: string;
  category: string;
  prompt: string;
  file_url: string;
  source_file_url: string;
  source_file_type: string;
  parent_asset_id: string | null;
  slice_name: string;
  roblox_asset_id: string;
  export_status: string;
  status: Status;
  notes: string;
};

export type ConceptualArtRecord = {
  id: string;
  name: string;
  category: string;
  description: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  preview_url: string;
  preview_storage_path: string;
  status: Status;
  notes: string;
  created_at: string;
};

export type PlanetVariable = {
  id: string;
  category: string;
  value: string;
  description: string;
  generation_rule: string;
  frequency: string;
  weight: number;
  min_value: number;
  max_value: number;
  biome_tags: string[];
  resource_tags: string[];
  status: Status;
  notes: string;
};

export type PlanetResourceProfile = {
  id: string;
  planet_class: string;
  subclass: string;
  discovery_tier: string;
  colonizable: string;
  mining_difficulty: number;
  resource_density: string;
  planet_rarity_bias: string;
  guaranteed_resources: string[];
  common_resources: string[];
  rare_resources: string[];
  exotic_resources: string[];
  scientific_notes: string;
  created_at: string;
  updated_at: string;
};

export type GeneratedPlanet = {
  id: string;
  seed: string;
  name: string;
  galaxy_sector: string;
  star_system: string;
  orbit_position: number;
  discovery_order: number;
  rarity: string;
  star_type: string;
  distance_from_star: string;
  orbit_speed: string;
  planet_class: string;
  planet_subclass: string;
  primary_biome: string;
  climate: string;
  atmosphere: string;
  temperature: string;
  gravity: string;
  water_coverage: string;
  moons: string;
  resources: string[];
  flora: string;
  fauna: string;
  ancient_civilization: string;
  ruins: string;
  hazards: string[];
  traits: string[];
  anomalies: string[];
  modifiers: string[];
  collectible_pools: string[];
  visual_theme: Record<string, string>;
  weather: string[];
  colonization: Record<string, string | number>;
  science: Record<string, string | number>;
  economy: Record<string, string | number>;
  event_pool: string[];
  story: string;
  colonized: boolean;
  terraform_level: number;
  discovery_points: number;
  completion_percent: number;
  image_url: string | null;
  image_prompt: string | null;
  image_status: string | null;
  image_variants: Array<{
    size: number;
    width: number;
    height: number;
    url: string;
    path: string;
    filename: string;
  }> | null;
  created_at: string;
  notes: string;
};

export type PlanetRenderLibraryRecord = {
  id: string;
  name: string;
  file_url: string;
  storage_path: string;
  thumbnail_url: string;
  planet_class: string;
  biome: string;
  atmosphere: string;
  climate: string;
  color_family: string;
  has_rings: boolean;
  water_level: string;
  cloud_level: string;
  tags: string[];
  hazards: string[];
  traits: string[];
  image_variants: Array<{
    size: number;
    width: number;
    height: number;
    url: string;
    path: string;
    filename: string;
  }>;
  rarity: string;
  resolution: number;
  width: number;
  height: number;
  usage_count: number;
  status: Status;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type Upgrade = {
  id: string;
  type: string;
  civilization: string;
  era: string;
  name: string;
  tier: string;
  max_level: number;
  unlock_level: number;
  cost_resource: string;
  base_cost: number;
  cost_multiplier: number;
  bonus_type: string;
  bonus_value: string;
  description: string;
  icon_name: string;
  asset_id: string | null;
  notes: string;
};

export type BuildingRelationship = {
  id: string;
  building_id: string;
  building: string;
  era: string;
  civilization: string;
  category: string;
  district_id: string | null;
  district: string;
  chain_id: string | null;
  unlock_research: string | null;
  unlock_research_id: string | null;
  primary_upgrade_dependency: string | null;
  primary_upgrade_id: string | null;
  wonder_id: string | null;
  implementation_status: Status;
  notes: string;
};

export type BuildingChain = {
  id: string;
  chain: string;
  district: string;
  level_1: string;
  level_2: string;
  level_3: string;
  level_4: string;
  level_5: string;
  gameplay_role: string;
  research_progression: string;
};

export type GameConstant = {
  id: string;
  constant: string;
  value: string | number | boolean;
  description: string;
};

export type FeatureFlag = {
  id: string;
  feature: string;
  enabled: boolean;
  launch_phase: string;
  notes: string;
};

export type ReleaseNote = {
  id: string;
  version: string;
  release_name: string;
  purpose: string;
  notes: string;
  created_at: string;
};

export type ChangelogEntry = {
  id: string;
  version: string;
  sheet_or_table: string;
  change_type: string;
  change_summary: string;
  created_at: string;
};

export type GameData = {
  research_branches: ResearchBranch[];
  research: ResearchNode[];
  buildings: Building[];
  unlock_matrix: UnlockMatrixRow[];
  districts: District[];
  wonders: Wonder[];
  upgrades: Upgrade[];
  building_relationships: BuildingRelationship[];
  building_chains: BuildingChain[];
  game_constants: GameConstant[];
  feature_flags: FeatureFlag[];
  assets: AssetRecord[];
  conceptual_art: ConceptualArtRecord[];
  planets: PlanetVariable[];
  planet_resource_profiles: PlanetResourceProfile[];
  generated_planets: GeneratedPlanet[];
  planet_render_library: PlanetRenderLibraryRecord[];
  release_notes: ReleaseNote[];
  changelog: ChangelogEntry[];
};

export type TableName =
  | "research"
  | "buildings"
  | "unlock_matrix"
  | "districts"
  | "wonders"
  | "assets"
  | "conceptual_art"
  | "planets"
  | "planet_resource_profiles"
  | "generated_planets"
  | "planet_render_library"
  | "upgrades"
  | "building_relationships"
  | "building_chains"
  | "game_constants"
  | "feature_flags";
