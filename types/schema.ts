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
  | "upgrades"
  | "building_relationships"
  | "building_chains"
  | "game_constants"
  | "feature_flags";
