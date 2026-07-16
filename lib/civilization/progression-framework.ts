import { canonicalActionSystem } from "@/lib/actions/action-system";
import { planetDevelopmentFramework } from "@/lib/planets/development-framework";
import type {
  CivilizationDevelopmentScoreBand,
  CivilizationMilestone,
  CivilizationProgressionDimension,
  CivilizationProgressionDimensionId,
  CivilizationProgressionFrameworkContract,
  CivilizationProgressionPresentationContract,
  CivilizationProgressionRequirementType,
  CivilizationProgressionStageId,
  CivilizationStage,
  CivilizationStageRequirement,
  ImportIssue
} from "@/types/runtime";

const calculationVersion = "civilization-progression-v1";

const canonicalSystemIds = new Set([
  "actions",
  "ai_agents",
  "colonies",
  "discovery",
  "economy",
  "exploration",
  "infrastructure",
  "logistics",
  "megastructures",
  "planet_development",
  "research",
  "trade",
  "travel",
  "universal_discovery_registry"
]);

function dimension(
  id: CivilizationProgressionDimensionId,
  displayName: string,
  description: string,
  sourceMetrics: CivilizationProgressionRequirementType[],
  weight: number,
  notes: string
): CivilizationProgressionDimension {
  return {
    id,
    displayName,
    description,
    calculationVersion,
    deterministic: true,
    sourceMetrics,
    weight,
    scoreRange: { min: 0, max: 100 },
    notes
  };
}

export const civilizationDevelopmentScores: CivilizationProgressionDimension[] = [
  dimension("civilization_age", "Civilization Age", "Canonical era/age position derived from published era progress, not XP.", ["research_count", "milestone"], 0.08, "Maps long-term era progress into the civilization wrapper."),
  dimension("civilization_stage", "Civilization Stage", "Highest resolved strategic stage from deterministic requirements.", ["milestone", "completed_action", "planet_development"], 0.08, "Stage is a requirement result; clients do not hand-pick it."),
  dimension("development_score", "Development Score", "Weighted civilization-wide maturity across all dimensions.", ["completed_actions", "colony_count", "research_count", "economy_threshold", "population_threshold", "infrastructure_threshold"], 0.14, "Aggregate score for summaries only; it is not XP."),
  dimension("scientific_advancement", "Scientific Advancement", "Research, analysis, surveys, probes, artifacts, and scientific infrastructure.", ["research_count", "completed_action", "discovery_count"], 0.12, "Driven by completed research and science Actions."),
  dimension("economic_development", "Economic Development", "Credits, trade, markets, production chains, and resource flow.", ["economy_threshold", "completed_action", "milestone"], 0.1, "Measures economic capacity without making currency alone the whole game."),
  dimension("industrial_capacity", "Industrial Capacity", "Construction, manufacturing, extraction, automation, and megaproject support.", ["infrastructure_threshold", "completed_actions", "planet_development"], 0.12, "Measures civilization build capacity and project throughput."),
  dimension("ecological_stewardship", "Ecological Stewardship", "Preservation, terraforming responsibility, living-world handling, and sustainability.", ["planet_development", "completed_action", "milestone"], 0.1, "Rewards preserve/designate/terraform choices without forcing colonization."),
  dimension("exploration_capacity", "Exploration Capacity", "Probe reach, survey depth, charted systems, discoveries, and travel range.", ["discovery_count", "completed_action", "logistics_threshold"], 0.12, "Connects the universe loop to civilization maturity."),
  dimension("population_maturity", "Population Maturity", "Population capacity, settlements, colonies, orbital habitats, and distribution.", ["population_threshold", "colony_count", "milestone"], 0.12, "Population is capacity and citizens/workforce, not spendable XP."),
  dimension("infrastructure_maturity", "Infrastructure Maturity", "Buildings, routes, orbital platforms, colonies, logistics, and support networks.", ["infrastructure_threshold", "logistics_threshold", "completed_actions"], 0.12, "Measures durable civilization systems rather than one-off unlocks.")
];

export const civilizationDevelopmentScoreBands: CivilizationDevelopmentScoreBand[] = [
  { id: "nascent", min: 0, max: 19, displayName: "Nascent", summary: "Early survival or scattered capability." },
  { id: "emerging", min: 20, max: 39, displayName: "Emerging", summary: "Stable local systems are forming." },
  { id: "established", min: 40, max: 59, displayName: "Established", summary: "Civilization systems are reliable and connected." },
  { id: "advanced", min: 60, max: 79, displayName: "Advanced", summary: "Civilization can coordinate complex multi-domain growth." },
  { id: "stellar", min: 80, max: 94, displayName: "Stellar", summary: "Civilization operates across worlds, systems, and large infrastructure." },
  { id: "ascendant", min: 95, max: 100, displayName: "Ascendant", summary: "Civilization has reached transformative scale and mastery." }
];

function requirement(
  id: string,
  stageId: CivilizationProgressionStageId,
  requirementType: CivilizationProgressionRequirementType,
  metricId: string,
  threshold: number | string,
  requiredIds: string[],
  dimensionIds: CivilizationProgressionDimensionId[],
  description: string,
  operator: CivilizationStageRequirement["operator"] = typeof threshold === "number" ? ">=" : "includes"
): CivilizationStageRequirement {
  return { id, stageId, requirementType, metricId, operator, threshold, requiredIds, dimensionIds, description };
}

export const civilizationStageRequirements: CivilizationStageRequirement[] = [
  requirement("stage_survival_start", "survival", "milestone", "start", "start", [], ["civilization_age", "civilization_stage"], "Civilization starts at Survival."),
  requirement("stage_settlement_first_camp", "settlement", "milestone", "first_camp_or_settlement", 1, ["first_colony"], ["population_maturity", "infrastructure_maturity"], "Create the first stable settlement, camp, or colony record."),
  requirement("stage_settlement_basic_research", "settlement", "research_count", "completed_research", 3, [], ["scientific_advancement"], "Complete enough foundational research to support settlement."),
  requirement("stage_planetary_first_colony", "planetary", "colony_count", "colonies", 1, ["first_colony"], ["population_maturity", "infrastructure_maturity"], "Own at least one active colony or equivalent planetary settlement."),
  requirement("stage_planetary_surveyed_body", "planetary", "planet_development", "surveyed_body_reports", 1, ["survey_planet"], ["exploration_capacity", "industrial_capacity"], "Complete at least one Planet Development Report."),
  requirement("stage_interplanetary_orbital", "interplanetary", "milestone", "first_orbital_colony", 1, ["first_orbital_colony"], ["exploration_capacity", "infrastructure_maturity"], "Establish an orbital or off-world infrastructure milestone."),
  requirement("stage_interplanetary_trade", "interplanetary", "milestone", "first_trade_route", 1, ["first_trade_route"], ["economic_development", "infrastructure_maturity"], "Create a durable trade/logistics route."),
  requirement("stage_interstellar_system_survey", "interstellar", "discovery_count", "surveyed_star_systems", 3, ["first_galaxy_survey"], ["exploration_capacity", "scientific_advancement"], "Survey multiple star systems through canonical exploration Actions."),
  requirement("stage_interstellar_population", "interstellar", "population_threshold", "population", 1000000, ["first_million_population"], ["population_maturity"], "Reach one million population capacity or citizens."),
  requirement("stage_galactic_sector_survey", "galactic", "discovery_count", "surveyed_galactic_sectors", 1, ["first_galaxy_survey"], ["exploration_capacity"], "Complete the first sector or galaxy-scale survey milestone."),
  requirement("stage_galactic_megastructure", "galactic", "milestone", "first_megastructure", 1, ["first_megastructure"], ["industrial_capacity", "infrastructure_maturity"], "Build the first megastructure-scale project."),
  requirement("stage_intergalactic_gate", "intergalactic", "milestone", "intergalactic_travel_unlocked", 1, ["first_intergalactic_route"], ["exploration_capacity", "scientific_advancement"], "Unlock intergalactic travel through research, logistics, and route Actions."),
  requirement("stage_intergalactic_identity", "intergalactic", "civilization_identity", "identity_milestones", 5, ["first_civilization_identity_milestone"], ["civilization_stage", "ecological_stewardship", "economic_development"], "Resolve enough identity milestones to support intergalactic society."),
  requirement("stage_ascendant_development", "ascendant", "infrastructure_threshold", "development_score", 95, ["first_ascendant_threshold"], ["development_score", "infrastructure_maturity"], "Reach ascendant development score without using XP."),
  requirement("stage_ascendant_mastery", "ascendant", "milestone", "mastered_civilization_systems", 6, ["first_ai_governor", "first_terraforming_project", "first_garden_world"], ["civilization_stage", "scientific_advancement", "ecological_stewardship"], "Master multiple civilization systems through completed canonical milestones.")
];

function milestone(
  id: string,
  displayName: string,
  category: CivilizationMilestone["category"],
  description: string,
  requirementIds: string[],
  contributesToDimensionIds: CivilizationProgressionDimensionId[],
  unlockedSystemIds: string[],
  importance: CivilizationMilestone["importance"] = "high"
): CivilizationMilestone {
  return {
    id,
    displayName,
    category,
    description,
    requirementIds,
    contributesToDimensionIds,
    unlockedSystemIds,
    importance,
    deterministic: true,
    presentation: {
      iconKey: `milestone_${id}`,
      badgeKey: `badge_${id}`,
      timelineEventType: `civilization_${id}`
    }
  };
}

export const civilizationMilestones: CivilizationMilestone[] = [
  milestone("first_colony", "First Colony", "colony", "First permanent colony, camp, or settlement establishes durable civilization growth.", ["stage_settlement_first_camp", "stage_planetary_first_colony"], ["population_maturity", "infrastructure_maturity"], ["colonies"]),
  milestone("first_orbital_colony", "First Orbital Colony", "orbit", "Permanent orbital presence begins interplanetary civilization.", ["stage_interplanetary_orbital"], ["exploration_capacity", "infrastructure_maturity"], ["travel", "colonies"]),
  milestone("first_trade_route", "First Trade Route", "trade", "First durable trade route connects economy, logistics, and expansion.", ["stage_interplanetary_trade"], ["economic_development", "infrastructure_maturity"], ["trade", "economy"]),
  milestone("first_garden_world", "First Garden World", "planet_development", "First high-CSI living world is surveyed, preserved, or responsibly developed.", ["stage_ascendant_mastery"], ["ecological_stewardship", "population_maturity"], ["planet_development"], "legendary"),
  milestone("first_terraforming_project", "First Terraforming Project", "planet_development", "Terraforming begins as a long-term stewardship and science project.", ["stage_ascendant_mastery"], ["ecological_stewardship", "scientific_advancement"], ["planet_development"], "legendary"),
  milestone("first_ai_governor", "First AI Governor", "ai_agent", "AI-assisted governance becomes part of civilization-scale operations.", ["stage_ascendant_mastery"], ["infrastructure_maturity", "scientific_advancement"], ["ai_agents"], "legendary"),
  milestone("first_megastructure", "First Megastructure", "megastructure", "Civilization coordinates megastructure-scale construction.", ["stage_galactic_megastructure"], ["industrial_capacity", "infrastructure_maturity"], ["megastructures"], "legendary"),
  milestone("first_million_population", "First Million Population", "population", "Civilization reaches one million people or workforce capacity.", ["stage_interstellar_population"], ["population_maturity", "economic_development"], ["economy"], "high"),
  milestone("first_galaxy_survey", "First Galaxy Survey", "exploration", "First galaxy or sector-scale survey turns exploration into civilization strategy.", ["stage_interstellar_system_survey", "stage_galactic_sector_survey"], ["exploration_capacity", "scientific_advancement"], ["exploration", "universal_discovery_registry"], "legendary"),
  milestone("first_civilization_identity_milestone", "First Civilization Identity Milestone", "identity", "Civilization identity becomes an explicit progression signal.", ["stage_intergalactic_identity"], ["civilization_stage", "ecological_stewardship", "economic_development"], ["actions"], "medium"),
  milestone("first_intergalactic_route", "First Intergalactic Route", "exploration", "Intergalactic travel becomes possible through technology and logistics.", ["stage_intergalactic_gate"], ["exploration_capacity", "scientific_advancement", "infrastructure_maturity"], ["travel"], "legendary"),
  milestone("first_ascendant_threshold", "First Ascendant Threshold", "identity", "Civilization reaches ascendant-level maturity across multiple deterministic dimensions.", ["stage_ascendant_development"], ["development_score", "civilization_stage"], ["actions"], "legendary")
];

function stage(
  id: CivilizationProgressionStageId,
  displayName: string,
  order: number,
  description: string,
  requirementIds: string[],
  unlockedSystemIds: string[],
  recommendedGameplay: string[],
  availableActionIds: string[],
  milestoneIds: string[]
): CivilizationStage {
  return {
    id,
    displayName,
    order,
    description,
    requirementIds,
    unlockedSystemIds,
    recommendedGameplay,
    availableActionIds,
    milestoneIds,
    presentation: {
      iconKey: `civilization_stage_${id}`,
      artKey: `civilization_stage_${id}`,
      themeKey: `theme_civilization_stage_${id}`,
      badgeKey: `badge_civilization_stage_${id}`
    }
  };
}

export const civilizationStages: CivilizationStage[] = [
  stage("survival", "Survival", 1, "Small groups preserve life, unlock basic Actions, and begin knowledge gathering.", ["stage_survival_start"], ["actions", "research", "economy"], ["Gather Labor", "Complete basic research", "Build first shelters"], ["conduct_research", "construct_building"], [],),
  stage("settlement", "Settlement", 2, "Population, research, and infrastructure stabilize into a local civilization.", ["stage_settlement_first_camp", "stage_settlement_basic_research"], ["colonies", "infrastructure"], ["Found the first settlement", "Increase Population capacity", "Build durable production"], ["conduct_research", "construct_building", "prepare_colony", "establish_colony"], ["first_colony"]),
  stage("planetary", "Planetary", 3, "Civilization manages a planet through surveys, colonies, and resource systems.", ["stage_planetary_first_colony", "stage_planetary_surveyed_body"], ["planet_development", "discovery"], ["Survey planets", "Choose development paths", "Balance extraction and preservation"], ["send_probe", "probe_scan", "survey_planet", "catalog_planet", "build_research_station", "build_mining_outpost"], ["first_colony"]),
  stage("interplanetary", "Interplanetary", 4, "Civilization expands through orbital infrastructure, trade, and multi-body logistics.", ["stage_interplanetary_orbital", "stage_interplanetary_trade"], ["travel", "trade", "logistics"], ["Build orbital infrastructure", "Create routes", "Harvest non-colonized bodies"], ["build_orbital_refinery", "establish_trade_route", "build_gas_harvest_platform", "build_ocean_harvest_platform"], ["first_orbital_colony", "first_trade_route"]),
  stage("interstellar", "Interstellar", 5, "Civilization reaches multiple star systems through probes, ships, and population scale.", ["stage_interstellar_system_survey", "stage_interstellar_population"], ["exploration", "universal_discovery_registry"], ["Survey nearby systems", "Scale population", "Create multi-system logistics"], ["send_probe", "probe_travel", "probe_scan", "survey_planet", "travel_to_destination"], ["first_million_population"]),
  stage("galactic", "Galactic", 6, "Civilization coordinates sector-scale exploration, megastructures, and galactic infrastructure.", ["stage_galactic_sector_survey", "stage_galactic_megastructure"], ["megastructures", "travel"], ["Survey sectors", "Construct megastructures", "Coordinate galaxy-scale economy"], ["construct_building", "transfer_resources", "establish_trade_route", "travel_to_destination"], ["first_galaxy_survey", "first_megastructure"]),
  stage("intergalactic", "Intergalactic", 7, "Civilization bridges galaxies through technology, logistics, and identity maturity.", ["stage_intergalactic_gate", "stage_intergalactic_identity"], ["travel", "universal_discovery_registry"], ["Unlock intergalactic travel", "Stabilize civilization identity", "Preserve continuity across galaxies"], ["conduct_research", "travel_to_destination", "transfer_resources", "establish_trade_route"], ["first_intergalactic_route", "first_civilization_identity_milestone"]),
  stage("ascendant", "Ascendant", 8, "Civilization reaches transformative maturity without XP or RPG levels.", ["stage_ascendant_development", "stage_ascendant_mastery"], ["actions", "ai_agents", "planet_development"], ["Master stewardship", "Operate at civilization scale", "Choose long-term legacy"], ["designate_preserve", "begin_terraforming_study", "terraform_planet_stage", "construct_building"], ["first_ai_governor", "first_terraforming_project", "first_garden_world", "first_ascendant_threshold"])
];

export const civilizationProgressionPresentation: CivilizationProgressionPresentationContract[] = [
  { id: "CivilizationStageBadge", displayName: "Civilization Stage Badge", rendererIndependent: true, semanticFields: ["stageId", "displayName", "order", "badgeKey"], notes: "Compact stage identity without RPG level language." },
  { id: "CivilizationProgressionSummary", displayName: "Civilization Progression Summary", rendererIndependent: true, semanticFields: ["resolvedStage", "nextEligibleStage", "dimensionScores", "requirements"], notes: "Summary uses deterministic dimensions and requirement states." },
  { id: "DevelopmentScoreRadar", displayName: "Development Score Radar", rendererIndependent: true, semanticFields: ["dimensionIds", "scoreBands", "normalizedScores"], notes: "Clients render score breakdowns; Studio owns meanings." },
  { id: "MilestoneTimeline", displayName: "Milestone Timeline", rendererIndependent: true, semanticFields: ["milestoneIds", "importance", "timelineEventType"], notes: "Milestone instances remain Game-owned; Studio exports definitions." },
  { id: "StageRequirementList", displayName: "Stage Requirement List", rendererIndependent: true, semanticFields: ["requirementIds", "operator", "threshold", "requiredIds"], notes: "Requirements explain why a stage is available or blocked." },
  { id: "CivilizationAgeLabel", displayName: "Civilization Age Label", rendererIndependent: true, semanticFields: ["eraId", "ageLabel", "stageId"], notes: "Age labels derive from canonical eras and identity data." },
  { id: "ProgressionDimensionBreakdown", displayName: "Progression Dimension Breakdown", rendererIndependent: true, semanticFields: ["dimensionId", "sourceMetrics", "calculationVersion"], notes: "No XP bars; use domain scores and concrete evidence." }
];

export const civilizationProgressionFramework: CivilizationProgressionFrameworkContract = {
  id: "civilization_progression_framework_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-CIVILIZATION-PROGRESSION-FRAMEWORK",
  actionSystemId: canonicalActionSystem.id,
  planetDevelopmentFrameworkId: planetDevelopmentFramework.id,
  civilizationIdentitySource: "civilization_identity",
  calculationVersion,
  progressionPolicy: {
    xpAllowed: false,
    deterministic: true,
    playerInstancesExported: false
  },
  ownership: {
    studioOwns: ["progression dimensions", "stage definitions", "milestone definitions", "stage requirements", "score bands", "presentation intent", "validation rules", "runtime publication"],
    gameOwns: ["current player stage", "completed milestone instances", "completed action history", "current dimension values", "save records", "server verification", "UI rendering"]
  },
  developmentScores: civilizationDevelopmentScores,
  scoreBands: civilizationDevelopmentScoreBands,
  civilizationStages,
  civilizationStageRequirements,
  civilizationMilestones,
  civilizationProgressionPresentation,
  validationRules: [
    "Civilization progression must not use XP or RPG-style levels.",
    "Every stage requirement must resolve to a stage and published dimension.",
    "Every milestone ID must be unique and deterministic.",
    "Every available action must resolve to the Canonical Action System.",
    "Unlocked systems must reference approved canonical system IDs.",
    "Planet-development requirements must reference the Planet Development Framework.",
    "Studio exports definitions only; player progression instances remain Game-owned."
  ]
};

export function validateCivilizationProgressionFramework(
  framework: CivilizationProgressionFrameworkContract = civilizationProgressionFramework,
  actionIds = new Set(canonicalActionSystem.actionDefinitions.map((action) => action.id)),
  planetDevelopmentFrameworkId = planetDevelopmentFramework.id
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const stageIds = new Set(framework.civilizationStages.map((stageItem) => stageItem.id));
  const dimensionIds = new Set(framework.developmentScores.map((dimensionItem) => dimensionItem.id));
  const requirementIds = new Set(framework.civilizationStageRequirements.map((requirementItem) => requirementItem.id));
  const milestoneIds = framework.civilizationMilestones.map((milestoneItem) => milestoneItem.id);
  const duplicateMilestones = milestoneIds.filter((id, index) => milestoneIds.indexOf(id) !== index);
  const expectedStages: CivilizationProgressionStageId[] = ["survival", "settlement", "planetary", "interplanetary", "interstellar", "galactic", "intergalactic", "ascendant"];

  if (framework.actionSystemId !== canonicalActionSystem.id) {
    issues.push({ severity: "error", code: "civilization_progression_action_system_missing", message: "Civilization Progression Framework must reference the Canonical Action System.", records: [framework.actionSystemId] });
  }
  if (framework.planetDevelopmentFrameworkId !== planetDevelopmentFrameworkId) {
    issues.push({ severity: "error", code: "civilization_progression_planet_development_missing", message: "Civilization Progression Framework must reference the Planet Development Framework.", records: [framework.planetDevelopmentFrameworkId] });
  }
  if (framework.progressionPolicy.xpAllowed !== false || framework.progressionPolicy.deterministic !== true || framework.progressionPolicy.playerInstancesExported !== false) {
    issues.push({ severity: "error", code: "civilization_progression_policy_invalid", message: "Civilization progression must be deterministic, non-XP, and free of player instances.", records: [framework.id] });
  }

  const sortedStages = [...framework.civilizationStages].sort((left, right) => left.order - right.order);
  if (sortedStages.map((stageItem) => stageItem.id).join("|") !== expectedStages.join("|")) {
    issues.push({ severity: "error", code: "civilization_progression_stage_order_invalid", message: "Civilization stages must resolve in the canonical order.", records: sortedStages.map((stageItem) => stageItem.id) });
  }

  for (const dimensionItem of framework.developmentScores) {
    if (dimensionItem.calculationVersion !== framework.calculationVersion || dimensionItem.deterministic !== true || dimensionItem.scoreRange.min !== 0 || dimensionItem.scoreRange.max !== 100) {
      issues.push({ severity: "error", code: "civilization_progression_dimension_invalid", message: "Progression dimensions must be deterministic, versioned, and normalized 0-100.", records: [dimensionItem.id] });
    }
  }

  for (const requirementItem of framework.civilizationStageRequirements) {
    if (!stageIds.has(requirementItem.stageId)) {
      issues.push({ severity: "error", code: "civilization_progression_requirement_stage_missing", message: "Stage requirement must resolve to a stage.", records: [requirementItem.id, requirementItem.stageId] });
    }
    for (const dimensionId of requirementItem.dimensionIds) {
      if (!dimensionIds.has(dimensionId)) {
        issues.push({ severity: "error", code: "civilization_progression_requirement_dimension_missing", message: "Stage requirement dimensions must resolve.", records: [requirementItem.id, dimensionId] });
      }
    }
    if (requirementItem.requirementType === "completed_action") {
      for (const actionId of requirementItem.requiredIds) {
        if (!actionIds.has(actionId)) issues.push({ severity: "error", code: "civilization_progression_requirement_action_missing", message: "Action requirement IDs must resolve.", records: [requirementItem.id, actionId] });
      }
    }
  }

  for (const stageItem of framework.civilizationStages) {
    for (const requirementId of stageItem.requirementIds) {
      if (!requirementIds.has(requirementId)) {
        issues.push({ severity: "error", code: "civilization_progression_stage_requirement_missing", message: "Stage requirementIds must resolve.", records: [stageItem.id, requirementId] });
      }
    }
    for (const actionId of stageItem.availableActionIds) {
      if (!actionIds.has(actionId)) {
        issues.push({ severity: "error", code: "civilization_progression_stage_action_missing", message: "Stage availableActionIds must resolve to the Canonical Action System.", records: [stageItem.id, actionId] });
      }
    }
    for (const systemId of stageItem.unlockedSystemIds) {
      if (!canonicalSystemIds.has(systemId)) {
        issues.push({ severity: "error", code: "civilization_progression_stage_system_missing", message: "Stage unlocked systems must reference canonical system IDs.", records: [stageItem.id, systemId] });
      }
    }
  }

  if (duplicateMilestones.length) {
    issues.push({ severity: "error", code: "civilization_progression_milestone_duplicate", message: "Milestone IDs must be unique.", records: duplicateMilestones });
  }
  for (const milestoneItem of framework.civilizationMilestones) {
    if (milestoneItem.deterministic !== true) {
      issues.push({ severity: "error", code: "civilization_progression_milestone_not_deterministic", message: "Milestones must be deterministic definitions.", records: [milestoneItem.id] });
    }
    for (const requirementId of milestoneItem.requirementIds) {
      if (!requirementIds.has(requirementId)) {
        issues.push({ severity: "error", code: "civilization_progression_milestone_requirement_missing", message: "Milestone requirements must resolve.", records: [milestoneItem.id, requirementId] });
      }
    }
    for (const dimensionId of milestoneItem.contributesToDimensionIds) {
      if (!dimensionIds.has(dimensionId)) {
        issues.push({ severity: "error", code: "civilization_progression_milestone_dimension_missing", message: "Milestone dimensions must resolve.", records: [milestoneItem.id, dimensionId] });
      }
    }
    for (const systemId of milestoneItem.unlockedSystemIds) {
      if (!canonicalSystemIds.has(systemId)) {
        issues.push({ severity: "error", code: "civilization_progression_milestone_system_missing", message: "Milestone unlocked systems must reference canonical system IDs.", records: [milestoneItem.id, systemId] });
      }
    }
  }

  const serialized = JSON.stringify(framework);
  if (/experiencePoints|rpgLevel|currentStage|completedMilestoneIds|playerProgression|playerBalances|\/Users\//i.test(serialized)) {
    issues.push({ severity: "error", code: "civilization_progression_player_state_or_xp_leak", message: "Civilization Progression Framework must not export XP, player progression instances, balances, or private paths.", records: [framework.id] });
  }

  return issues;
}
