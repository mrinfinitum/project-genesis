import assetsRaw from "./json/Icons_Assets.json";
import buildingChainsRaw from "./json/Building_Chains.json";
import buildingRelationshipsRaw from "./json/Building_Relationships.json";
import buildingsRaw from "./json/Buildings.json";
import changelogRaw from "./json/Changelog.json";
import districtsRaw from "./json/Districts.json";
import featureFlagsRaw from "./json/Feature_Flags.json";
import gameConstantsRaw from "./json/Game_Constants.json";
import planetGenerationRaw from "./json/Planet_Generation.json";
import planetTraitsRaw from "./json/Planet_Traits.json";
import releaseNotesRaw from "./json/Release_Notes.json";
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
  ConceptualArtRecord,
  District,
  FeatureFlag,
  GameConstant,
  GameData,
  PlanetVariable,
  ReleaseNote,
  ResearchBranch,
  ResearchNode,
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
  release_notes: handoffReleaseNotes,
  changelog: handoffChangelog
};
