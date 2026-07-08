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
  exploration_scope_unlocked: string | null;
  travel_tier: string | null;
  space_system_unlocked: string | null;
  requires_previous_space_research: boolean;
  unlock_summary: string;
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

export type ResourceCatalogItem = {
  id: string;
  resource_name: string;
  category: string;
  rarity: string;
  rarity_color: string;
  discovery_tier: string;
  earth_available: string;
  first_unlock_requirement: string;
  typical_planet_classes: string[];
  primary_uses: string[];
  base_trade_value: number;
  stack_size: number;
  description: string;
  science_lore_notes: string;
  codex_implementation_notes: string;
  created_at: string;
  updated_at: string;
};

export type UniverseRecord = {
  id: string;
  universe_seed: string;
  name: string;
  created_at: string;
};

export type GenerationMetadataRecord = {
  seed?: string | null;
  generation_parent_seed?: string | null;
  generation_index?: number | null;
  generation_version?: string | null;
  is_fixed?: boolean | null;
  is_procedural?: boolean | null;
};

export type GalaxyRecord = {
  id: string;
  universe_id: string;
  universe_seed: string | null;
  galaxy_seed: string;
  name: string;
  galaxy_type: string;
  galaxy_size: string;
  sector_count: number;
  created_at: string;
} & GenerationMetadataRecord;

export type SectorRecord = {
  id: string;
  galaxy_id: string;
  sector_seed: string;
  sector_name: string;
  coordinates_x: number;
  coordinates_y: number;
  coordinates_z: number;
  sector_type: string;
  sector_rarity: string;
  system_count: number;
  difficulty: number;
  discovery_value: number;
  discovery_level: string;
  modifier: string;
  resource_signal: string;
  colonized_worlds: number;
  discovered: boolean;
  discovered_at: string | null;
  created_at: string;
} & GenerationMetadataRecord;

export type StarSystemRecord = {
  id: string;
  sector_id: string;
  system_seed: string;
  system_name: string;
  catalog_designation: string;
  system_type: string;
  system_role: string;
  generation_type: string;
  system_rarity: string;
  star_count: number;
  planet_count: number;
  primary_star: string | null;
  star_type: string | null;
  resource_bias: string;
  danger_level: number;
  starting_system: boolean;
  is_procedural: boolean;
  discovery_state: string;
  detected_at: string | null;
  probed_at: string | null;
  scanned_at: string | null;
  visited_at: string | null;
  surveyed_at: string | null;
  colonized_at: string | null;
  estimated_planet_count_min: number | null;
  estimated_planet_count_max: number | null;
  estimated_celestial_body_count_min: number | null;
  estimated_celestial_body_count_max: number | null;
  estimated_danger_level: number | null;
  known_star_signature: string | null;
  probe_data: Record<string, unknown>;
  scan_data: Record<string, unknown>;
  discovered: boolean;
  discovered_at: string | null;
  created_at: string;
} & GenerationMetadataRecord;

export type SystemProbeRecord = {
  id: string;
  system_id: string;
  probe_type: string;
  launched_at: string | null;
  arrival_at: string | null;
  status: Status;
  scan_quality: number;
  revealed_data: Record<string, unknown>;
  notes: string | null;
};

export type StarRecord = {
  id: string;
  system_id: string;
  star_seed: string;
  star_name: string;
  star_type: string;
  star_size: string;
  star_temperature: number;
  star_color: string;
  luminosity: number;
  age: string;
  created_at: string;
} & GenerationMetadataRecord;

export type UniversePlanetRecord = {
  id: string;
  system_id: string;
  planet_seed: string;
  planet_name: string;
  orbit_position: number;
  planet_rarity: string;
  planet_class: string;
  planet_subclass: string;
  discovered: boolean;
  discovered_at: string | null;
  renamed_to: string | null;
  colonized: boolean;
  terraform_level: number;
  resources_mined: Record<string, number>;
  buildings_built: string[];
  collectibles_found: string[];
  expeditions_completed: string[];
  created_at: string;
  updated_at: string;
} & GenerationMetadataRecord;

export type CelestialBodyRecord = {
  id: string;
  system_id: string;
  parent_body_id: string | null;
  name: string;
  celestial_body_type: string;
  planet_class: string | null;
  planet_subclass: string | null;
  planet_rarity: string | null;
  biome: string | null;
  atmosphere: string | null;
  gravity: string | null;
  orbit_position: number | null;
  orbit_parent: string | null;
  landable: boolean;
  colonizable: boolean;
  colonizable_status: string;
  uses_orbital_gameplay: boolean;
  is_fixed: boolean;
  is_starting_body: boolean;
  is_procedural: boolean;
  unlock_requirement: string | null;
  resources: string[];
  orbit_view_prompt: string | null;
  orbit_view_image_url: string | null;
  surface_landscape_prompt: string | null;
  surface_landscape_image_url: string | null;
  surface_landscape_status: string | null;
  surface_landscape_notes: string | null;
  hero_discovery_prompt: string | null;
  hero_discovery_image_url: string | null;
  hero_discovery_status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
} & GenerationMetadataRecord;

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
  colonizable: boolean;
  landable: boolean;
  surface_exploration: boolean;
  terrain_generation: boolean;
  uses_orbital_gameplay: boolean;
  orbital_slot_count: number;
  orbital_platforms_built: string[];
  atmospheric_harvest_rate: number;
  gas_giant_hazard_level: number;
  required_technology: string[];
  resource_transport_options: string[];
  colonized: boolean;
  terraform_level: number;
  discovery_points: number;
  completion_percent: number;
  orbit_view_prompt: string | null;
  orbit_view_image_url: string | null;
  surface_landscape_prompt: string | null;
  surface_landscape_image_url: string | null;
  surface_landscape_status: string | null;
  surface_landscape_notes: string | null;
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

export type PlanetPromptLibraryRecord = {
  id: string;
  planet_id: string | null;
  planet_class: string;
  planet_subclass: string;
  prompt_type: "Orbit View" | "Surface Landscape" | "Hero Discovery" | string;
  aspect_ratio: "1:1" | "16:9" | "21:9" | string;
  reference_image_key: string;
  reference_image_url: string;
  prompt_text: string;
  image_url: string;
  status: Status;
  recommended_use: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type PlanetRenderLibraryRecord = {
  id: string;
  name: string;
  file_url: string;
  storage_path: string;
  thumbnail_url: string;
  landscape_image_url: string;
  landscape_storage_path: string;
  landscape_source_path: string;
  orbital_image_url: string;
  orbital_storage_path: string;
  orbital_source_path: string;
  fixed_sol_body: string;
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

export type ProjectSystem = {
  id: string;
  name: string;
  group_name: string;
  description: string;
  icon: string;
  status: Status;
  completion_percent: number;
  total_records: number;
  complete_records: number;
  draft_records: number;
  needs_review_records: number;
  missing_required_fields: number;
  blocked_records: number;
  codex_ready_count: number;
  last_updated: string;
  next_action: string;
  priority: string;
  notes: string;
};

export type ProjectSystemHistory = {
  id: string;
  system_id: string;
  date: string;
  completion_percent: number;
  total_records: number;
  complete_records: number;
  needs_review_records: number;
  missing_required_fields: number;
  notes: string;
};

export type DataHealthCheck = {
  id: string;
  system: string;
  issue: string;
  severity: string;
  affected_count: number;
  description: string;
  recommended_action: string;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
};

export type CodexReadinessItem = {
  id: string;
  title: string;
  system: string;
  status: Status;
  description: string;
  related_tables: string[];
  export_path: string;
  priority: string;
  created_at: string;
  notes: string;
};

export type DashboardMetric = {
  id: string;
  metric_name: string;
  metric_value: string;
  metric_group: string;
  display_order: number;
  updated_at: string;
};

export type CodexTask = {
  id: string;
  title: string;
  source_type: string;
  source_id: string;
  system: string;
  priority: string;
  status: Status;
  description: string;
  related_tables: string[];
  export_path: string;
  created_at: string;
  updated_at: string;
  notes: string;
};

export type CivilizationIdentity = {
  id: string;
  civilization_name: string;
  current_age: string;
  civilization_title: string;
  primary_alignment: string;
  secondary_alignment: string;
  emerging_alignment: string;
  future_prediction: string;
  population: number;
  total_discovery_points: number;
  total_colonized_worlds: number;
  total_wonders_built: number;
  total_milestones_unlocked: number;
  created_at: string;
  updated_at: string;
  notes: string;
};

export type CivilizationAlignmentScore = {
  id: string;
  civilization_id: string;
  alignment_name: string;
  score: number;
  bonus_summary: string;
  last_changed_by: string;
  updated_at: string;
};

export type CivilizationAlignmentHistory = {
  id: string;
  civilization_id: string;
  alignment_name: string;
  previous_score: number;
  new_score: number;
  change_amount: number;
  source_type: string;
  source_id: string;
  reason: string;
  created_at: string;
};

export type CivilizationMilestone = {
  id: string;
  title: string;
  age: string;
  description: string;
  unlocked_by: string;
  icon: string;
  importance: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CivilizationUnlockedMilestone = {
  id: string;
  civilization_id: string;
  milestone_id: string;
  unlocked_at: string;
  source_type: string;
  source_id: string;
  notes: string;
};

export type CivilizationTitle = {
  id: string;
  title: string;
  description: string;
  required_age: string;
  primary_alignment: string;
  secondary_alignment: string;
  requirement_summary: string;
  bonus_summary: string;
  priority: number;
  created_at: string;
  updated_at: string;
};

export type CivilizationBonus = {
  id: string;
  civilization_id: string;
  bonus_name: string;
  bonus_type: string;
  bonus_value: string;
  source_type: string;
  source_id: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
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
  resource_catalog: ResourceCatalogItem[];
  star_systems: StarSystemRecord[];
  celestial_bodies: CelestialBodyRecord[];
  system_probes: SystemProbeRecord[];
  generated_planets: GeneratedPlanet[];
  planet_prompt_library: PlanetPromptLibraryRecord[];
  planet_render_library: PlanetRenderLibraryRecord[];
  release_notes: ReleaseNote[];
  changelog: ChangelogEntry[];
  project_systems: ProjectSystem[];
  project_system_history: ProjectSystemHistory[];
  data_health_checks: DataHealthCheck[];
  codex_readiness_items: CodexReadinessItem[];
  dashboard_metrics: DashboardMetric[];
  codex_tasks: CodexTask[];
  civilization_identity: CivilizationIdentity[];
  civilization_alignment_scores: CivilizationAlignmentScore[];
  civilization_alignment_history: CivilizationAlignmentHistory[];
  civilization_milestones: CivilizationMilestone[];
  civilization_unlocked_milestones: CivilizationUnlockedMilestone[];
  civilization_titles: CivilizationTitle[];
  civilization_bonuses: CivilizationBonus[];
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
  | "resource_catalog"
  | "star_systems"
  | "celestial_bodies"
  | "system_probes"
  | "generated_planets"
  | "planet_prompt_library"
  | "planet_render_library"
  | "upgrades"
  | "building_relationships"
  | "building_chains"
  | "game_constants"
  | "feature_flags"
  | "project_systems"
  | "project_system_history"
  | "data_health_checks"
  | "codex_readiness_items"
  | "dashboard_metrics"
  | "codex_tasks"
  | "civilization_identity"
  | "civilization_alignment_scores"
  | "civilization_alignment_history"
  | "civilization_milestones"
  | "civilization_unlocked_milestones"
  | "civilization_titles"
  | "civilization_bonuses";
