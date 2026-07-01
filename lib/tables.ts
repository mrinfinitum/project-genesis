import type { TableName } from "@/types/schema";

export type FieldType = "text" | "number" | "textarea" | "array" | "status" | "boolean";

export type FieldConfig = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
};

export type TableConfig = {
  table: TableName;
  title: string;
  description: string;
  statusKey?: string;
  eraKey?: string;
  typeKey?: string;
  searchKeys: string[];
  columns: string[];
  fields: FieldConfig[];
};

export const tableConfigs: Record<TableName, TableConfig> = {
  research: {
    table: "research",
    title: "Research",
    description: "Technology tree nodes, costs, prerequisites, and gameplay unlocks.",
    statusKey: "status",
    eraKey: "era",
    searchKeys: ["name", "era", "design_purpose", "gameplay_effect"],
    columns: ["name", "era", "primary_unlock_type", "cost_experimental", "research_time", "asset_id", "status"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "branch_id", label: "Branch ID", required: true },
      { key: "era", label: "Era", required: true },
      { key: "era_order", label: "Era Order", type: "number" },
      { key: "node_order", label: "Node Order", type: "number" },
      { key: "name", label: "Name", required: true },
      { key: "design_purpose", label: "Design Purpose", type: "textarea" },
      { key: "primary_unlock_type", label: "Primary Unlock Type" },
      { key: "unlocks", label: "Unlocks", type: "array" },
      { key: "gameplay_effect", label: "Gameplay Effect", type: "textarea" },
      { key: "prerequisite_id", label: "Prerequisite ID" },
      { key: "cost_experimental", label: "Experimental Cost", type: "number" },
      { key: "research_time", label: "Research Time", type: "number" },
      { key: "related_systems", label: "Related Systems", type: "array" },
      { key: "icon_name", label: "Icon Name" },
      { key: "asset_id", label: "Asset ID" },
      { key: "status", label: "Status", type: "status" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  buildings: {
    table: "buildings",
    title: "Buildings",
    description: "Buildable city content, costs, income, district links, and asset references.",
    eraKey: "era",
    searchKeys: ["name", "civilization", "category", "description"],
    columns: ["name", "era", "civilization", "category", "cost_credits", "construction_time"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "era", label: "Era" },
      { key: "civilization", label: "Civilization" },
      { key: "category", label: "Category" },
      { key: "name", label: "Name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "cost_credits", label: "Credit Cost", type: "number" },
      { key: "cost_labor", label: "Labor Cost", type: "number" },
      { key: "cost_experimental", label: "Experimental Cost", type: "number" },
      { key: "construction_time", label: "Construction Time", type: "number" },
      { key: "income_credits_sec", label: "Credits / Sec", type: "number" },
      { key: "income_labor_sec", label: "Labor / Sec", type: "number" },
      { key: "income_experimental_sec", label: "Experimental / Sec", type: "number" },
      { key: "population_bonus", label: "Population Bonus", type: "number" },
      { key: "labor_requirement", label: "Labor Requirement", type: "number" },
      { key: "building_size", label: "Building Size" },
      { key: "district_id", label: "District ID" },
      { key: "unlock_research_id", label: "Unlock Research ID" },
      { key: "unlock_building", label: "Unlock Building" },
      { key: "visual_evolution", label: "Visual Evolution", type: "textarea" },
      { key: "upgrade_chain", label: "Upgrade Chain" },
      { key: "wonder", label: "Wonder" },
      { key: "icon_name", label: "Icon Name" },
      { key: "model_name", label: "Model Name" },
      { key: "asset_id", label: "Asset ID" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  unlock_matrix: {
    table: "unlock_matrix",
    title: "Unlock Matrix",
    description: "Canonical relationship map from research sources to content unlocks.",
    statusKey: "implementation_status",
    eraKey: "source_era",
    searchKeys: ["source_name", "source_branch", "unlock_name", "unlock_type"],
    columns: ["source_name", "source_branch", "source_era", "unlock_type", "unlock_name", "implementation_status"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "source_type", label: "Source Type" },
      { key: "source_id", label: "Source ID" },
      { key: "source_name", label: "Source Name" },
      { key: "source_branch", label: "Source Branch" },
      { key: "source_era", label: "Source Era" },
      { key: "unlock_type", label: "Unlock Type" },
      { key: "unlock_name", label: "Unlock Name" },
      { key: "unlock_id", label: "Unlock ID" },
      { key: "implementation_status", label: "Status", type: "status" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  districts: {
    table: "districts",
    title: "Districts",
    description: "City layout zones, primary stat identities, bonuses, and civilization hooks.",
    searchKeys: ["name", "purpose", "civilization", "primary_stat"],
    columns: ["name", "civilization", "primary_stat", "priority", "bonus"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "name", label: "Name", required: true },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "primary_buildings", label: "Primary Buildings", type: "array" },
      { key: "primary_stat", label: "Primary Stat" },
      { key: "bonus", label: "Bonus", type: "textarea" },
      { key: "unlock_research", label: "Unlock Research" },
      { key: "civilization", label: "Civilization" },
      { key: "priority", label: "Priority", type: "number" }
    ]
  },
  wonders: {
    table: "wonders",
    title: "Wonders",
    description: "Civilization-defining prestige structures and global modifiers.",
    statusKey: "status",
    searchKeys: ["name", "civilization", "primary_bonus_type"],
    columns: ["name", "civilization", "primary_bonus_type", "construction_cost", "status"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "name", label: "Name", required: true },
      { key: "civilization", label: "Civilization" },
      { key: "unlock_research_id", label: "Unlock Research ID" },
      { key: "civilization_id", label: "Civilization ID" },
      { key: "primary_bonus_type", label: "Primary Bonus Type" },
      { key: "bonuses", label: "Bonuses", type: "array" },
      { key: "requirements", label: "Requirements", type: "array" },
      { key: "construction_cost", label: "Construction Cost", type: "number" },
      { key: "construction_time", label: "Construction Time", type: "number" },
      { key: "icon_name", label: "Icon Name" },
      { key: "model_name", label: "Model Name" },
      { key: "status", label: "Status", type: "status" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  assets: {
    table: "assets",
    title: "Assets",
    description: "Art prompts, Roblox asset IDs, file URLs, and production status.",
    statusKey: "status",
    searchKeys: ["name", "type", "category", "prompt"],
    columns: ["name", "type", "category", "source_file_type", "export_status", "roblox_asset_id", "status"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "name", label: "Name", required: true },
      { key: "type", label: "Type" },
      { key: "category", label: "Category" },
      { key: "prompt", label: "Prompt", type: "textarea" },
      { key: "source_file_type", label: "Source File Type" },
      { key: "parent_asset_id", label: "Parent Asset ID" },
      { key: "slice_name", label: "Slice Name" },
      { key: "roblox_asset_id", label: "Roblox Asset ID" },
      { key: "export_status", label: "Export Status" },
      { key: "status", label: "Status", type: "status" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  conceptual_art: {
    table: "conceptual_art",
    title: "Conceptual Art",
    description: "Reference art, source files, mood explorations, and production concepts.",
    statusKey: "status",
    searchKeys: ["name", "category", "description", "file_name", "notes"],
    columns: ["name", "category", "file_type", "file_size", "status", "created_at"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "name", label: "Name", required: true },
      { key: "category", label: "Category" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "file_url", label: "File URL" },
      { key: "file_name", label: "File Name" },
      { key: "file_type", label: "File Type" },
      { key: "file_size", label: "File Size", type: "number" },
      { key: "storage_path", label: "Storage Path" },
      { key: "status", label: "Status", type: "status" },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "created_at", label: "Created At" }
    ]
  },
  planets: {
    table: "planets",
    title: "Planetary Rules",
    description: "Procedural planet generation variables, biome pools, trait rules, resources, hazards, and tuning weights.",
    statusKey: "status",
    typeKey: "category",
    searchKeys: ["category", "value", "description", "generation_rule", "frequency", "notes"],
    columns: ["category", "value", "generation_rule", "frequency", "weight", "status"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "category", label: "Category", required: true },
      { key: "value", label: "Value", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "generation_rule", label: "Generation Rule", type: "textarea" },
      { key: "frequency", label: "Frequency" },
      { key: "weight", label: "Weight", type: "number" },
      { key: "min_value", label: "Min Value", type: "number" },
      { key: "max_value", label: "Max Value", type: "number" },
      { key: "biome_tags", label: "Biome Tags", type: "array" },
      { key: "resource_tags", label: "Resource Tags", type: "array" },
      { key: "status", label: "Status", type: "status" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  generated_planets: {
    table: "generated_planets",
    title: "Generated Planets",
    description: "Persisted procedural planets generated from planetary rules.",
    searchKeys: ["name", "seed", "galaxy_sector", "star_system", "planet_class", "primary_biome", "story"],
    columns: ["name", "planet_class", "primary_biome", "star_type", "discovery_points", "completion_percent"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "seed", label: "Seed", required: true },
      { key: "name", label: "Name", required: true },
      { key: "galaxy_sector", label: "Galaxy Sector" },
      { key: "star_system", label: "Star System" },
      { key: "orbit_position", label: "Orbit Position", type: "number" },
      { key: "discovery_order", label: "Discovery Order", type: "number" },
      { key: "star_type", label: "Star Type" },
      { key: "planet_class", label: "Planet Class" },
      { key: "primary_biome", label: "Primary Biome" },
      { key: "climate", label: "Climate" },
      { key: "atmosphere", label: "Atmosphere" },
      { key: "resources", label: "Resources", type: "array" },
      { key: "hazards", label: "Hazards", type: "array" },
      { key: "traits", label: "Traits", type: "array" },
      { key: "story", label: "Story", type: "textarea" },
      { key: "colonized", label: "Colonized", type: "boolean" },
      { key: "terraform_level", label: "Terraform Level", type: "number" },
      { key: "discovery_points", label: "Discovery Points", type: "number" },
      { key: "completion_percent", label: "Completion %", type: "number" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  upgrades: {
    table: "upgrades",
    title: "Upgrades",
    description: "Repeatable and level-based progression improvements across workforce, industry, science, and technology.",
    eraKey: "era",
    typeKey: "type",
    searchKeys: ["name", "type", "civilization", "bonus_type", "description"],
    columns: ["name", "type", "era", "tier", "max_level", "bonus_type", "bonus_value", "asset_id"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "type", label: "Type" },
      { key: "civilization", label: "Civilization" },
      { key: "era", label: "Era" },
      { key: "name", label: "Upgrade", required: true },
      { key: "tier", label: "Tier" },
      { key: "max_level", label: "Max Level", type: "number" },
      { key: "unlock_level", label: "Unlock Level", type: "number" },
      { key: "cost_resource", label: "Cost Resource" },
      { key: "base_cost", label: "Base Cost", type: "number" },
      { key: "cost_multiplier", label: "Cost Multiplier", type: "number" },
      { key: "bonus_type", label: "Bonus Type" },
      { key: "bonus_value", label: "Bonus Value" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "icon_name", label: "Icon Name" },
      { key: "asset_id", label: "Asset ID" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  building_relationships: {
    table: "building_relationships",
    title: "Building Relationships",
    description: "Sprint 2 mapping between buildings, districts, research prerequisites, upgrade dependencies, and wonders.",
    statusKey: "implementation_status",
    eraKey: "era",
    searchKeys: ["building", "district", "unlock_research", "primary_upgrade_dependency", "civilization"],
    columns: ["building", "era", "district", "unlock_research", "primary_upgrade_dependency", "implementation_status"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "building_id", label: "Building ID" },
      { key: "building", label: "Building" },
      { key: "era", label: "Era" },
      { key: "civilization", label: "Civilization" },
      { key: "category", label: "Category" },
      { key: "district_id", label: "District ID" },
      { key: "district", label: "District" },
      { key: "chain_id", label: "Chain ID" },
      { key: "unlock_research", label: "Unlock Research" },
      { key: "unlock_research_id", label: "Unlock Research ID" },
      { key: "primary_upgrade_dependency", label: "Primary Upgrade Dependency" },
      { key: "primary_upgrade_id", label: "Primary Upgrade ID" },
      { key: "wonder_id", label: "Wonder ID" },
      { key: "implementation_status", label: "Status", type: "status" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  building_chains: {
    table: "building_chains",
    title: "Building Chains",
    description: "Named building progression chains grouped by district and research path.",
    searchKeys: ["chain", "district", "gameplay_role", "research_progression"],
    columns: ["chain", "district", "level_1", "level_2", "level_3", "level_4", "level_5"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "chain", label: "Chain", required: true },
      { key: "district", label: "District" },
      { key: "level_1", label: "Level 1" },
      { key: "level_2", label: "Level 2" },
      { key: "level_3", label: "Level 3" },
      { key: "level_4", label: "Level 4" },
      { key: "level_5", label: "Level 5" },
      { key: "gameplay_role", label: "Gameplay Role", type: "textarea" },
      { key: "research_progression", label: "Research Progression", type: "textarea" }
    ]
  },
  game_constants: {
    table: "game_constants",
    title: "Game Constants",
    description: "Shared tuning constants consumed by game systems and export generation.",
    searchKeys: ["constant", "description"],
    columns: ["constant", "value", "description"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "constant", label: "Constant", required: true },
      { key: "value", label: "Value" },
      { key: "description", label: "Description", type: "textarea" }
    ]
  },
  feature_flags: {
    table: "feature_flags",
    title: "Feature Flags",
    description: "Launch-phase controls for enabling, disabling, and sequencing major game systems.",
    searchKeys: ["feature", "launch_phase", "notes"],
    columns: ["feature", "enabled", "launch_phase", "notes"],
    fields: [
      { key: "id", label: "ID", required: true },
      { key: "feature", label: "Feature", required: true },
      { key: "enabled", label: "Enabled", type: "boolean" },
      { key: "launch_phase", label: "Launch Phase" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  }
};

export const editableTables = Object.keys(tableConfigs) as TableName[];
