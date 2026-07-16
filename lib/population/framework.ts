import { canonicalActionSystem } from "@/lib/actions/action-system";
import { canonicalBuildingTaxonomy } from "@/lib/buildings/taxonomy";
import { civilizationProgressionFramework } from "@/lib/civilization/progression-framework";
import { colonizationFramework } from "@/lib/colonization/framework";
import { planetDevelopmentFramework } from "@/lib/planets/development-framework";
import type {
  AutomationSubstitutionPolicyDefinition,
  ImportIssue,
  PopulationCapacityDefinition,
  PopulationCategoryDefinition,
  PopulationEducationDefinition,
  PopulationGrowthDefinition,
  PopulationLifeStageDefinition,
  PopulationMigrationDefinition,
  PopulationNeedDefinition,
  PopulationShortageReasonCodeId,
  PopulationSimulationFrameworkContract,
  PopulationSpecialistRoleDefinition,
  PopulationWellbeingBandDefinition,
  PopulationWorkforceRoleDefinition,
  WorkforceAssignmentDefinition
} from "@/types/runtime";

const calculationVersion = "population-simulation-v1";

function titleFromId(id: string) {
  return id.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

const demographicCategoryIds = ["children", "adolescents", "adults", "seniors", "visitors", "tourists", "temporary_contractors"] as const;
const workforceCategoryIds = ["workers", "engineers", "scientists", "researchers", "farmers", "miners", "industrial_workers", "logistics_workers", "traders", "administrators", "explorers", "colonists", "medical_staff", "educators", "security_personnel", "robotic_workers", "ai_workers"] as const;

export const populationCategoryDefinitions: PopulationCategoryDefinition[] = [
  ...demographicCategoryIds.map((id) => ({
    id,
    displayName: titleFromId(id),
    kind: (id === "visitors" || id === "tourists" || id === "temporary_contractors" ? "visitor_role" : "demographic_cohort") as PopulationCategoryDefinition["kind"],
    description: `${titleFromId(id)} are tracked as a population cohort, not a currency.`,
    lifeStageIds: (id === "children" ? ["child"] : id === "adolescents" ? ["adolescent"] : id === "seniors" ? ["senior"] : id === "visitors" || id === "tourists" || id === "temporary_contractors" ? ["temporary_resident"] : ["adult"]) as PopulationLifeStageDefinition["id"][],
    workforceRoleIds: [],
    specialistRoleIds: [],
    gameOwnsLiveCount: true as const,
    notes: "Studio publishes category semantics only. The Game owns live counts."
  })),
  ...workforceCategoryIds.map((id) => ({
    id,
    displayName: titleFromId(id),
    kind: (id === "robotic_workers" || id === "ai_workers" ? "synthetic_role" : "workforce_role") as PopulationCategoryDefinition["kind"],
    description: `${titleFromId(id)} represent assignable workforce capacity.`,
    lifeStageIds: (id === "robotic_workers" || id === "ai_workers" ? ["synthetic", "non_biological"] : ["adult"]) as PopulationLifeStageDefinition["id"][],
    workforceRoleIds: roleIdsForCategory(id),
    specialistRoleIds: [],
    gameOwnsLiveCount: true as const,
    notes: "Workforce roles remain separate from demographic cohorts."
  }))
];

function roleIdsForCategory(id: string): PopulationWorkforceRoleDefinition["id"][] {
  const map: Record<string, PopulationWorkforceRoleDefinition["id"][]> = {
    workers: ["general_labor", "maintenance", "construction"],
    engineers: ["engineering", "energy", "automation_management"],
    scientists: ["science"],
    researchers: ["science", "education"],
    farmers: ["agriculture"],
    miners: ["mining"],
    industrial_workers: ["manufacturing"],
    logistics_workers: ["logistics"],
    traders: ["trade"],
    administrators: ["administration"],
    explorers: ["exploration"],
    colonists: ["general_labor", "construction", "maintenance"],
    medical_staff: ["healthcare"],
    educators: ["education"],
    security_personnel: ["security"],
    robotic_workers: ["mining", "manufacturing", "maintenance", "construction", "energy"],
    ai_workers: ["automation_management", "administration", "logistics", "science"]
  };
  return map[id] ?? [];
}

export const populationLifeStageDefinitions: PopulationLifeStageDefinition[] = [
  { id: "child", displayName: "Child", workforceEligible: false, educationEligible: true, migrationEligible: true, participatesInGrowth: false, consumptionModifier: 0.65, healthcareNeed: "medium", housingNeed: "supported", notes: "Dependent cohort; contributes to future workforce through education." },
  { id: "adolescent", displayName: "Adolescent", workforceEligible: false, educationEligible: true, migrationEligible: true, participatesInGrowth: false, consumptionModifier: 0.85, healthcareNeed: "medium", housingNeed: "standard", notes: "Training-focused cohort." },
  { id: "adult", displayName: "Adult", workforceEligible: true, educationEligible: true, migrationEligible: true, participatesInGrowth: true, consumptionModifier: 1, healthcareNeed: "medium", housingNeed: "standard", notes: "Primary biological workforce cohort." },
  { id: "senior", displayName: "Senior", workforceEligible: false, educationEligible: false, migrationEligible: true, participatesInGrowth: false, consumptionModifier: 0.9, healthcareNeed: "high", housingNeed: "supported", notes: "Dependent cohort with elevated healthcare needs." },
  { id: "synthetic", displayName: "Synthetic", workforceEligible: true, educationEligible: true, migrationEligible: true, participatesInGrowth: false, consumptionModifier: 0.45, healthcareNeed: "synthetic", housingNeed: "synthetic_bay", notes: "Robotic or synthetic population. Growth follows manufacturing/deployment policy." },
  { id: "non_biological", displayName: "Non-Biological", workforceEligible: true, educationEligible: true, migrationEligible: true, participatesInGrowth: false, consumptionModifier: 0.35, healthcareNeed: "synthetic", housingNeed: "synthetic_bay", notes: "AI or non-biological workforce presence." },
  { id: "temporary_resident", displayName: "Temporary Resident", workforceEligible: false, educationEligible: false, migrationEligible: true, participatesInGrowth: false, consumptionModifier: 1.1, healthcareNeed: "temporary", housingNeed: "temporary", notes: "Visitors, tourists, and contractors use temporary capacity." }
];

function workforceRole(
  id: PopulationWorkforceRoleDefinition["id"],
  skillClass: PopulationWorkforceRoleDefinition["skillClass"],
  educationTierIds: string[],
  buildingFamilies: string[],
  substitutionPolicyIds: PopulationWorkforceRoleDefinition["substitutionPolicyIds"],
  shortageReasonCodeIds: PopulationWorkforceRoleDefinition["shortageReasonCodeIds"],
  identityRelationshipIds: string[]
): PopulationWorkforceRoleDefinition {
  return {
    id,
    displayName: titleFromId(id),
    skillClass,
    educationTierIds,
    supportedBuildingFamilyIds: buildingFamilies,
    productivityProfileId: `productivity_${id}`,
    substitutionPolicyIds,
    shortageReasonCodeIds,
    identityRelationshipIds,
    notes: "Definitions describe role requirements and substitution policy. Live assignments remain Game-owned."
  };
}

export const populationWorkforceRoleDefinitions: PopulationWorkforceRoleDefinition[] = [
  workforceRole("general_labor", "general", ["basic"], ["population-housing", "manufacturing"], ["partial_substitution"], ["labor_shortage"], ["Industry"]),
  workforceRole("engineering", "technical", ["technical", "advanced"], ["energy", "utilities"], ["supervision_required"], ["specialist_shortage"], ["Technology"]),
  workforceRole("science", "scientific", ["advanced", "specialist"], ["research-education"], ["specialist_only"], ["specialist_shortage"], ["Scientific"]),
  workforceRole("agriculture", "technical", ["basic", "technical"], ["agriculture-food"], ["partial_substitution"], ["food_shortage", "labor_shortage"], ["Nature"]),
  workforceRole("mining", "hazard", ["technical"], ["resource-extraction"], ["synthetic_preferred", "partial_substitution"], ["labor_shortage"], ["Industry"]),
  workforceRole("manufacturing", "technical", ["technical"], ["manufacturing"], ["partial_substitution", "synthetic_preferred"], ["labor_shortage"], ["Industry"]),
  workforceRole("logistics", "logistics", ["technical"], ["logistics", "transportation"], ["partial_substitution"], ["migration_pressure"], ["Trade"]),
  workforceRole("trade", "logistics", ["basic", "technical"], ["commerce"], ["partial_substitution"], ["unemployment"], ["Trade"]),
  workforceRole("administration", "civic", ["advanced"], ["government"], ["supervision_required"], ["specialist_shortage"], ["Corporate"]),
  workforceRole("healthcare", "civic", ["advanced", "specialist"], ["health-medicine"], ["specialist_only", "biological_required"], ["healthcare_shortage"], ["Eco"]),
  workforceRole("education", "civic", ["advanced", "specialist"], ["research-education"], ["supervision_required"], ["education_shortage"], ["Scientific"]),
  workforceRole("exploration", "hazard", ["technical", "advanced"], ["space-infrastructure"], ["partial_substitution"], ["labor_shortage"], ["Exploration"]),
  workforceRole("archaeology", "scientific", ["advanced", "specialist"], ["research-education", "culture"], ["specialist_only"], ["specialist_shortage"], ["Scientific"]),
  workforceRole("terraforming", "scientific", ["specialist", "elite"], ["environment", "ecology"], ["specialist_only"], ["specialist_shortage"], ["Eco", "Scientific"]),
  workforceRole("automation_management", "technical", ["advanced", "synthetic_training"], ["robotics-automation", "ai-infrastructure"], ["supervision_required"], ["specialist_shortage"], ["Automation"]),
  workforceRole("security", "hazard", ["technical"], ["security", "military-defense"], ["partial_substitution", "synthetic_preferred"], ["labor_shortage"], ["Security"]),
  workforceRole("hospitality", "service", ["basic"], ["recreation", "commerce"], ["partial_substitution"], ["labor_shortage"], ["Trade"]),
  workforceRole("maintenance", "technical", ["basic", "technical"], ["utilities"], ["partial_substitution"], ["labor_shortage"], ["Industry"]),
  workforceRole("construction", "technical", ["basic", "technical"], ["colonial-development", "planetary-infrastructure"], ["partial_substitution", "synthetic_preferred"], ["labor_shortage"], ["Industry"]),
  workforceRole("energy", "technical", ["technical", "advanced"], ["energy"], ["supervision_required"], ["life_support_shortage"], ["Technology"])
];

function specialist(id: string, baseWorkforceRoleId: PopulationSpecialistRoleDefinition["baseWorkforceRoleId"], research: string[], buildings: string[], actions: string[], identity: string[]): PopulationSpecialistRoleDefinition {
  return {
    id,
    displayName: titleFromId(id),
    baseWorkforceRoleId,
    educationTierIds: ["specialist", "elite"],
    requiredResearchIds: research,
    requiredBuildingFamilyIds: buildings,
    supportedActionIds: actions,
    identityRelationshipIds: identity,
    missingSourceDefinitionIds: research.map((researchId) => `research:${researchId}`),
    notes: "Specialist role contract only. Missing research/building details are reported as source-definition gaps rather than duplicated here."
  };
}

export const populationSpecialistRoleDefinitions: PopulationSpecialistRoleDefinition[] = [
  specialist("xenobiologist", "science", ["xenobiology"], ["research-education"], ["analyze_anomaly", "survey_planet"], ["Scientific", "Eco"]),
  specialist("planetary_scientist", "science", ["planetary_science"], ["research-education"], ["survey_planet", "begin_terraforming_study"], ["Scientific"]),
  specialist("archaeologist", "archaeology", ["archaeology"], ["research-education", "culture"], ["excavate_ruin", "analyze_artifact"], ["Scientific"]),
  specialist("quantum_researcher", "science", ["quantum_research"], ["research-education"], ["conduct_research"], ["Scientific", "Technology"]),
  specialist("ai_engineer", "automation_management", ["ai_systems"], ["robotics-automation", "ai-infrastructure"], ["deploy_robotic_workforce"], ["Automation", "Technology"]),
  specialist("logistics_coordinator", "logistics", ["logistics_networks"], ["transportation", "logistics"], ["transfer_population", "transport_colonists", "transfer_resources"], ["Trade"]),
  specialist("terraforming_specialist", "terraforming", ["terraforming"], ["environment", "ecology"], ["begin_terraforming_study", "terraform_planet_stage"], ["Eco", "Scientific"]),
  specialist("orbital_engineer", "engineering", ["orbital_engineering"], ["orbital-infrastructure"], ["build_orbital_refinery"], ["Technology"]),
  specialist("medical_specialist", "healthcare", ["medicine"], ["health-medicine"], ["establish_healthcare_program"], ["Eco"]),
  specialist("ecological_planner", "terraforming", ["ecological_planning"], ["environment", "ecology"], ["designate_preserve"], ["Eco"]),
  specialist("trade_negotiator", "trade", ["interstellar_trade"], ["commerce"], ["establish_trade_route"], ["Trade"]),
  specialist("artifact_analyst", "archaeology", ["artifact_analysis"], ["research-education"], ["analyze_artifact"], ["Scientific"])
];

export const demographicStateSchema = {
  id: "population_demographic_state_schema" as const,
  gameOwned: true as const,
  fields: [
    "total_population", "biological_population", "synthetic_population", "working_age_population", "dependent_population", "assigned_workforce", "unassigned_workforce", "specialist_population", "visitor_population", "tourist_population", "population_capacity", "housing_capacity", "healthcare_capacity", "education_capacity", "food_support_capacity", "water_support_capacity", "life_support_capacity"
  ].map((id) => ({ id, displayName: titleFromId(id), valueType: "integer" as const, description: "Game-owned demographic value declared by the Studio schema." }))
};

export const populationGrowthDefinitions: PopulationGrowthDefinition[] = [
  { id: "biological_base_growth", displayName: "Biological Base Growth", deterministic: true, calculationVersion, inputs: ["current_population", "housing", "food", "water", "healthcare", "education", "stability", "habitability", "csi", "hazards", "colony_stage", "colony_focus", "civilization_identity"], formula: "baseRate * capacityPressure * wellbeingModifier * habitabilityModifier * hazardPenalty * identityModifier", clamps: { minGrowthRate: -0.05, maxGrowthRate: 0.08 }, outputs: ["population_growth_rate", "projected_population"], notes: "No random per-render growth; clients calculate from stored state and elapsed time." },
  { id: "capacity_pressure", displayName: "Capacity Pressure", deterministic: true, calculationVersion, inputs: ["total_population", "population_capacity", "housing_capacity", "life_support_capacity"], formula: "min(1, availableCapacity / max(1,totalPopulation)) with overcapacity penalties", clamps: { minGrowthRate: -0.1, maxGrowthRate: 0.03 }, outputs: ["capacity_modifier", "overcapacity_warning"], notes: "Prevents growth when support capacity is exhausted." },
  { id: "synthetic_growth_policy", displayName: "Synthetic Growth Policy", deterministic: true, calculationVersion, inputs: ["robotic_capacity", "ai_workers", "manufacturing_capacity", "research_unlocks", "automation_policy"], formula: "deploymentRate from canonical actions and manufacturing capacity", clamps: { minGrowthRate: 0, maxGrowthRate: 0.12 }, outputs: ["synthetic_population_delta"], notes: "Synthetic population grows through actions/manufacturing, not biological growth." },
  { id: "migration_pressure_growth", displayName: "Migration Pressure Growth", deterministic: true, calculationVersion, inputs: ["immigration", "emigration", "destination_capacity", "policy", "travel_time", "hazard_checks"], formula: "approvedImmigration - requiredEmigration after logistics and capacity checks", clamps: { minGrowthRate: -0.2, maxGrowthRate: 0.2 }, outputs: ["net_migration_delta"], notes: "Migration requires logistics, travel time, and policy validation." }
];

export const populationCapacityDefinitions: PopulationCapacityDefinition[] = [
  { id: "surface_habitation", displayName: "Surface Habitation", capacityType: "surface_habitation", sourceTypes: ["buildings", "colony_stage", "infrastructure", "atmosphere", "gravity"], constraintIds: ["housing", "life_support", "hazards"], notes: "Default settlement capacity for survivable surfaces." },
  { id: "orbital_habitation", displayName: "Orbital Habitation", capacityType: "orbital_habitation", sourceTypes: ["orbital_platforms", "life_support", "logistics"], constraintIds: ["energy", "water", "transport"], notes: "Population capacity away from planetary surfaces." },
  { id: "subsurface_habitation", displayName: "Subsurface Habitation", capacityType: "subsurface_habitation", sourceTypes: ["subsurface_buildings", "hazard_shelter"], constraintIds: ["energy", "life_support"], notes: "Capacity for hostile or protected surfaces." },
  { id: "floating_habitation", displayName: "Floating Habitation", capacityType: "floating_habitation", sourceTypes: ["floating_colonies", "atmospheric_platforms"], constraintIds: ["storms", "gravity", "life_support"], notes: "Gas-giant, ocean, and cloud-city capacity." },
  { id: "temporary_habitation", displayName: "Temporary Habitation", capacityType: "temporary_habitation", sourceTypes: ["visitor_ports", "expedition_camps"], constraintIds: ["safety", "transport"], notes: "Visitor, tourist, contractor, and expedition capacity." },
  { id: "robotic_capacity", displayName: "Robotic Capacity", capacityType: "robotic_capacity", sourceTypes: ["automation_bays", "manufacturing", "maintenance"], constraintIds: ["energy", "repair_parts"], notes: "Synthetic worker storage and support." },
  { id: "visitor_capacity", displayName: "Visitor Capacity", capacityType: "visitor_capacity", sourceTypes: ["tourism", "trade_ports", "diplomatic_sites"], constraintIds: ["safety", "transport", "hospitality"], notes: "Non-permanent population capacity." }
];

export const populationNeedDefinitions: PopulationNeedDefinition[] = [
  ["food", "critical", ["growth", "health", "retention"], "food_shortage"],
  ["water", "critical", ["growth", "health", "retention"], "water_shortage"],
  ["housing", "critical", ["growth", "migration", "wellbeing"], "housing_shortage"],
  ["energy", "high", ["life_support", "productivity"], "life_support_shortage"],
  ["healthcare", "high", ["health", "growth", "retention"], "healthcare_shortage"],
  ["education", "medium", ["specialists", "productivity"], "education_shortage"],
  ["safety", "high", ["migration", "retention"], "evacuation_required"],
  ["employment", "medium", ["wellbeing", "productivity"], "unemployment"],
  ["environment", "medium", ["wellbeing", "growth"], null],
  ["recreation", "low", ["wellbeing", "tourism"], null],
  ["social_stability", "high", ["retention", "future_unrest_hooks"], "migration_pressure"],
  ["transportation", "medium", ["migration", "trade", "employment"], "migration_pressure"],
  ["communication", "low", ["administration", "education"], null],
  ["purpose", "medium", ["wellbeing", "retention"], null],
  ["autonomy", "medium", ["wellbeing", "identity"], null]
].map(([id, criticality, affects, shortageReasonCodeId]) => ({
  id: id as string,
  displayName: titleFromId(String(id)),
  criticality: criticality as PopulationNeedDefinition["criticality"],
  affects: affects as string[],
  shortageReasonCodeId: shortageReasonCodeId as PopulationNeedDefinition["shortageReasonCodeId"],
  notes: "Need definitions influence deterministic growth, productivity, migration, health, retention, and future unrest hooks."
}));

export const populationWellbeingBands: PopulationWellbeingBandDefinition[] = [
  { id: "critical", displayName: "Critical", min: 0, max: 19, migrationEffect: "forced_emigration", growthEffect: "decline", productivityEffect: "severe_penalty", unrestHook: "critical_unrest_future_hook", notes: "Survival support is failing." },
  { id: "unstable", displayName: "Unstable", min: 20, max: 39, migrationEffect: "high_emigration", growthEffect: "negative", productivityEffect: "major_penalty", unrestHook: "unrest_future_hook", notes: "Population retention is at risk." },
  { id: "strained", displayName: "Strained", min: 40, max: 59, migrationEffect: "minor_emigration", growthEffect: "reduced", productivityEffect: "minor_penalty", unrestHook: "strain_warning", notes: "Basic needs are uneven." },
  { id: "stable", displayName: "Stable", min: 60, max: 74, migrationEffect: "neutral", growthEffect: "normal", productivityEffect: "normal", unrestHook: "none", notes: "Population systems are functional." },
  { id: "thriving", displayName: "Thriving", min: 75, max: 89, migrationEffect: "immigration_bonus", growthEffect: "positive", productivityEffect: "bonus", unrestHook: "none", notes: "Population wants to stay and grow." },
  { id: "exceptional", displayName: "Exceptional", min: 90, max: 100, migrationEffect: "strong_immigration_bonus", growthEffect: "optimal", productivityEffect: "major_bonus", unrestHook: "none", notes: "A model society or specialist magnet." }
];

export const populationEducationDefinitions: PopulationEducationDefinition[] = [
  { id: "basic", displayName: "Basic Education", tier: "basic", capacitySourceTypes: ["schools", "family_support"], trainingDurationActionId: "establish_education_program", eligibleRoleIds: ["general_labor", "agriculture", "hospitality"], specialistConversionRoleIds: [], buildingDependencyIds: ["research-education"], researchDependencyIds: [], identityModifierIds: ["Scientific"], notes: "Foundational literacy and workforce readiness." },
  { id: "technical", displayName: "Technical Education", tier: "technical", capacitySourceTypes: ["technical_schools"], trainingDurationActionId: "train_specialist", eligibleRoleIds: ["engineering", "mining", "manufacturing", "logistics", "maintenance", "construction", "energy"], specialistConversionRoleIds: [], buildingDependencyIds: ["research-education"], researchDependencyIds: ["technical_training"], identityModifierIds: ["Industry", "Technology"], notes: "Enables skilled operational workforce." },
  { id: "advanced", displayName: "Advanced Education", tier: "advanced", capacitySourceTypes: ["universities"], trainingDurationActionId: "train_specialist", eligibleRoleIds: ["science", "administration", "healthcare", "education", "exploration"], specialistConversionRoleIds: [], buildingDependencyIds: ["research-education"], researchDependencyIds: ["advanced_education"], identityModifierIds: ["Scientific"], notes: "Prepares high-skill and civic roles." },
  { id: "specialist", displayName: "Specialist Education", tier: "specialist", capacitySourceTypes: ["specialist_institutes"], trainingDurationActionId: "train_specialist", eligibleRoleIds: ["archaeology", "terraforming", "automation_management"], specialistConversionRoleIds: populationSpecialistRoleDefinitions.map((role) => role.id), buildingDependencyIds: ["research-education"], researchDependencyIds: ["specialist_training"], identityModifierIds: ["Scientific", "Automation"], notes: "Converts eligible workers into named specialist roles." },
  { id: "elite", displayName: "Elite Education", tier: "elite", capacitySourceTypes: ["elite_academies"], trainingDurationActionId: "train_specialist", eligibleRoleIds: ["science", "terraforming", "automation_management"], specialistConversionRoleIds: ["quantum_researcher", "terraforming_specialist", "ai_engineer"], buildingDependencyIds: ["research-education"], researchDependencyIds: ["elite_academies"], identityModifierIds: ["Scientific", "Technology"], notes: "Late-stage advanced specialist pipeline." },
  { id: "synthetic_training", displayName: "Synthetic Training", tier: "synthetic_training", capacitySourceTypes: ["simulation_cores", "ai_training"], trainingDurationActionId: "deploy_robotic_workforce", eligibleRoleIds: ["automation_management", "logistics", "science", "manufacturing"], specialistConversionRoleIds: ["ai_engineer", "logistics_coordinator"], buildingDependencyIds: ["robotics-automation", "ai-infrastructure"], researchDependencyIds: ["ai_systems"], identityModifierIds: ["Automation"], notes: "Training and configuring synthetic workers." }
];

export const populationMigrationDefinitions: PopulationMigrationDefinition[] = [
  "internal_reassignment", "colony_to_colony", "planetary_migration", "orbital_migration", "interplanetary_migration", "interstellar_migration", "refugee_migration", "specialist_relocation", "colonist_transport", "temporary_worker_transfer", "visitor_travel"
].map((id) => ({
  id: id as PopulationMigrationDefinition["id"],
  displayName: titleFromId(id),
  actionIds: id === "internal_reassignment" ? ["reassign_workforce"] : id === "colonist_transport" ? ["transport_colonists", "travel_to_destination"] : ["transfer_population", "travel_to_destination"],
  logisticsRequired: true,
  transportCapacityRequired: true,
  distanceRule: "Resolved by canonical logistics route and technology gate.",
  travelTimeRule: "Travel time uses Time Action Contract and transport mode.",
  destinationCapacityCheck: true,
  policyCheck: true,
  hazardCheck: true,
  notes: "Population never teleports. Migration is action/logistics/time gated."
}));

export const workforceAssignmentDefinitions: WorkforceAssignmentDefinition[] = [
  "auto_assignment", "manual_assignment", "priority_assignment", "minimum_staffing", "target_staffing", "specialist_required", "automation_substitution", "shortage", "surplus", "reserve_pool"
].map((id) => ({
  id: id as WorkforceAssignmentDefinition["id"],
  displayName: titleFromId(id),
  targetScopes: ["colony", "building", "project", "extraction", "research", "logistics", "trade", "terraforming", "exploration"],
  actionIds: id === "auto_assignment" ? ["assign_workforce"] : id === "manual_assignment" ? ["assign_workforce", "reassign_workforce"] : id === "automation_substitution" ? ["deploy_robotic_workforce"] : ["assign_workforce", "reassign_workforce"],
  gameOwnsAssignments: true,
  notes: "Assignment mode definition only. The Game owns live assignment maps and queues."
}));

export const automationSubstitutionPolicies: AutomationSubstitutionPolicyDefinition[] = [
  { id: "no_substitution", displayName: "No Substitution", allowedWorkerCategoryIds: [], maxCoveragePercent: 0, requiresSupervisor: false, canBypassTechnology: false, canBypassSpecialists: false, canBypassCosts: false, canBypassPremiumPermissions: false, dangerousWorkEligible: false, notes: "Biological or specialist work is required." },
  { id: "partial_substitution", displayName: "Partial Substitution", allowedWorkerCategoryIds: ["robotic_workers", "ai_workers"], maxCoveragePercent: 50, requiresSupervisor: true, canBypassTechnology: false, canBypassSpecialists: false, canBypassCosts: false, canBypassPremiumPermissions: false, dangerousWorkEligible: true, notes: "Automation may reduce labor demand but not erase requirements." },
  { id: "full_substitution", displayName: "Full Substitution", allowedWorkerCategoryIds: ["robotic_workers", "ai_workers"], maxCoveragePercent: 100, requiresSupervisor: false, canBypassTechnology: false, canBypassSpecialists: false, canBypassCosts: false, canBypassPremiumPermissions: false, dangerousWorkEligible: true, notes: "Only where canonical roles allow fully automated operation." },
  { id: "specialist_only", displayName: "Specialist Only", allowedWorkerCategoryIds: [], maxCoveragePercent: 0, requiresSupervisor: false, canBypassTechnology: false, canBypassSpecialists: false, canBypassCosts: false, canBypassPremiumPermissions: false, dangerousWorkEligible: false, notes: "Named specialist requirement cannot be replaced." },
  { id: "supervision_required", displayName: "Supervision Required", allowedWorkerCategoryIds: ["robotic_workers", "ai_workers"], maxCoveragePercent: 80, requiresSupervisor: true, canBypassTechnology: false, canBypassSpecialists: false, canBypassCosts: false, canBypassPremiumPermissions: false, dangerousWorkEligible: true, notes: "Automation works under trained human/specialist oversight." },
  { id: "biological_required", displayName: "Biological Required", allowedWorkerCategoryIds: [], maxCoveragePercent: 0, requiresSupervisor: false, canBypassTechnology: false, canBypassSpecialists: false, canBypassCosts: false, canBypassPremiumPermissions: false, dangerousWorkEligible: false, notes: "Sensitive care, diplomacy, or identity work needs biological staff." },
  { id: "synthetic_preferred", displayName: "Synthetic Preferred", allowedWorkerCategoryIds: ["robotic_workers", "ai_workers"], maxCoveragePercent: 90, requiresSupervisor: true, canBypassTechnology: false, canBypassSpecialists: false, canBypassCosts: false, canBypassPremiumPermissions: false, dangerousWorkEligible: true, notes: "Hazardous work prioritizes robotic/synthetic labor after unlocks." }
];

export const populationShortageReasonCodes = ([
  "labor_shortage", "specialist_shortage", "housing_shortage", "food_shortage", "water_shortage", "healthcare_shortage", "education_shortage", "life_support_shortage", "overcapacity", "unemployment", "population_decline", "migration_pressure", "evacuation_required"
] as PopulationShortageReasonCodeId[]).map((id) => ({ id, displayName: titleFromId(id), blocker: !["unemployment", "migration_pressure"].includes(id), severity: ["evacuation_required", "life_support_shortage", "food_shortage", "water_shortage"].includes(id) ? "critical" as const : "warning" as const, notes: "Canonical reason code for population readiness, growth, and event hooks." }));

export const colonyIntegration = colonizationFramework.colonyPopulationRequirementDefinitions.map((requirement) => ({
  id: `population_${requirement.colonyTypeId}`,
  colonyTypeId: requirement.colonyTypeId,
  minimumViablePopulation: requirement.minimumFoundingPopulation,
  targetFoundingPopulation: Math.max(requirement.minimumFoundingPopulation * 2, requirement.minimumFoundingPopulation + 25),
  workforceRoleRequirements: [
    { roleId: "general_labor" as const, minimum: Math.max(0, Math.floor(requirement.minimumFoundingPopulation * 0.35)), target: Math.max(0, Math.floor(Math.max(requirement.minimumFoundingPopulation * 2, requirement.minimumFoundingPopulation + 25) * 0.4)) },
    { roleId: "maintenance" as const, minimum: requirement.minimumFoundingPopulation > 0 ? 1 : 0, target: Math.max(requirement.minimumFoundingPopulation * 2, requirement.minimumFoundingPopulation + 25) > 50 ? 5 : 0 }
  ],
  specialistRoleRequirements: requirement.specialistsRequired,
  initialCapacity: Math.max(requirement.minimumFoundingPopulation * 3, requirement.minimumFoundingPopulation + 50),
  growthProfileId: requirement.minimumFoundingPopulation === 0 ? "synthetic_growth_policy" : "biological_base_growth",
  automationSupportPolicyIds: (requirement.minimumFoundingPopulation === 0 ? ["full_substitution", "synthetic_preferred"] : ["partial_substitution", "supervision_required"]) as AutomationSubstitutionPolicyDefinition["id"][],
  notes: "Population integration wraps existing colonization requirements without duplicating colony type definitions."
}));

export const buildingIntegrationHooks = [
  ["population-housing", 250, ["general_labor"], [], 0, 0, 0, "surface_habitation"],
  ["health-medicine", null, ["healthcare"], ["medical_specialist"], 0, 100, 0, null],
  ["research-education", null, ["education"], [], 100, 0, 0, null],
  ["agriculture-food", null, ["agriculture"], [], 0, 0, 0, null],
  ["energy", null, ["energy", "engineering"], [], 0, 0, 0, null],
  ["logistics", null, ["logistics"], ["logistics_coordinator"], 0, 0, 25, null],
  ["science-specializations", null, ["science"], ["planetary_scientist"], 50, 0, 0, null],
  ["robotics-automation", null, ["automation_management"], ["ai_engineer"], 0, 0, 0, "robotic_capacity"]
].map(([buildingFamilyId, populationCapacity, workforceDemandRoleIds, specialistDemandRoleIds, educationCapacity, healthcareCapacity, visitorCapacity, housingType]) => ({
  id: `population_building_${buildingFamilyId}`,
  buildingFamilyId: buildingFamilyId as string,
  populationCapacity: populationCapacity as number | null,
  workforceDemandRoleIds: workforceDemandRoleIds as PopulationWorkforceRoleDefinition["id"][],
  specialistDemandRoleIds: specialistDemandRoleIds as string[],
  educationCapacity: educationCapacity as number | null,
  healthcareCapacity: healthcareCapacity as number | null,
  visitorCapacity: visitorCapacity as number | null,
  housingType: housingType as string | null,
  automationPolicyIds: ["partial_substitution", "supervision_required"] as AutomationSubstitutionPolicyDefinition["id"][],
  productivityEffect: "Workforce demand and support capacity influence deterministic productivity.",
  missingDefinition: !canonicalBuildingTaxonomy.some((family) => family.id === buildingFamilyId),
  notes: "Building family hook only. Individual building instances remain Game-owned."
}));

export const populationSimulationFramework: PopulationSimulationFrameworkContract = {
  id: "population_simulation_framework_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-POPULATION-STRUCTURED-SIMULATION",
  actionSystemId: canonicalActionSystem.id,
  planetDevelopmentFrameworkId: planetDevelopmentFramework.id,
  civilizationProgressionFrameworkId: civilizationProgressionFramework.id,
  colonizationFrameworkId: colonizationFramework.id,
  calculationVersion,
  ownership: {
    studioOwns: ["population categories", "life stages", "workforce roles", "specialist roles", "growth definitions", "capacity definitions", "needs", "wellbeing bands", "education tiers", "migration contracts", "workforce assignment definitions", "automation substitution policies", "presentation contracts", "runtime publication"],
    gameOwns: ["player population values", "live colony demographics", "assignments", "migration instances", "timestamps", "queues", "save/cloud state", "UI rendering"]
  },
  activePlayerStatePolicy: {
    exportsPlayerPopulationValues: false,
    exportsLiveColonyDemographics: false,
    exportsAssignments: false,
    exportsMigrationInstances: false,
    exportsTimestamps: false,
    exportsQueues: false,
    exportsSaveState: false
  },
  populationCategoryDefinitions,
  populationLifeStageDefinitions,
  populationWorkforceRoleDefinitions,
  populationSpecialistRoleDefinitions,
  demographicStateSchema,
  populationGrowthDefinitions,
  populationCapacityDefinitions,
  populationNeedDefinitions,
  populationWellbeingBands,
  populationEducationDefinitions,
  populationMigrationDefinitions,
  workforceAssignmentDefinitions,
  automationSubstitutionPolicies,
  populationShortageReasonCodes,
  colonyIntegration,
  buildingIntegrationHooks,
  economyResourceHooks: [
    { id: "population_consumes_support_resources", targetSystemId: "resource_economy_logistics", referencedIds: ["food", "water", "energy", "manufactured"], notes: "Population may consume support resources through the logistics/economy framework." },
    { id: "population_produces_civilization_outputs", targetSystemId: "economy", referencedIds: ["ECON-LABOR", "ECON-RESEARCH"], notes: "Population may produce labor, research, administration, trade activity, culture, and specialist output." }
  ],
  civilizationIdentityIntegration: [
    { id: "population_identity_industry", targetSystemId: "civilization_identity", referencedIds: ["Industry"], notes: "Industry affects productivity and manufacturing workforce." },
    { id: "population_identity_eco", targetSystemId: "civilization_identity", referencedIds: ["Eco"], notes: "Eco affects wellbeing and sustainable growth." },
    { id: "population_identity_scientific", targetSystemId: "civilization_identity", referencedIds: ["Scientific"], notes: "Scientific affects education and specialists." },
    { id: "population_identity_trade", targetSystemId: "civilization_identity", referencedIds: ["Trade"], notes: "Trade affects migration and visitors." },
    { id: "population_identity_automation", targetSystemId: "civilization_identity", referencedIds: ["Automation"], notes: "Automation affects synthetic workforce and substitution." }
  ],
  civilizationProgressionIntegration: [
    { id: "population_progression_thresholds", targetSystemId: "civilization_progression", referencedIds: ["first_million_population"], notes: "Population thresholds feed deterministic progression milestones." },
    { id: "population_progression_self_sustaining_colony", targetSystemId: "civilization_progression", referencedIds: ["first_colony"], notes: "Self-sustaining colony hooks integrate with settlement and planetary stages." }
  ],
  actionSystemIntegration: [
    { id: "population_actions", targetSystemId: "actions", referencedIds: ["assign_workforce", "reassign_workforce", "train_specialist", "retrain_population", "transfer_population", "transport_colonists", "expand_housing", "establish_education_program", "establish_healthcare_program", "deploy_robotic_workforce"], notes: "Population uses the Canonical Action System and does not create a second timer engine." }
  ],
  populationPresentationContract: [
    "PopulationSummary", "PopulationComposition", "DemographicBreakdown", "WorkforceBreakdown", "WorkforceAssignmentPanel", "PopulationCapacityGauge", "NeedsAndWellbeingPanel", "PopulationGrowthForecast", "MigrationSummary", "SpecialistRequirement", "AutomationSubstitutionSummary", "PopulationShortageAlert", "ColonyPopulationReadiness"
  ].map((id) => ({ id, displayName: id.replace(/([A-Z])/g, " $1").trim(), rendererIndependent: true, semanticFields: ["id", "displayName", "state", "requirements", "capacity", "wellbeing", "shortages"], notes: "Renderer-independent semantic contract. Clients own layout." } as PopulationSimulationFrameworkContract["populationPresentationContract"][number])),
  creativeProductionRequirements: ["Demographics", "Workforce", "Specialists", "Needs", "Wellbeing", "Migration", "Education", "Healthcare", "Capacity", "Automation", "Shortage States"].map((displayName) => ({ id: `population_${displayName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`, displayName, category: "Population", status: "required", notes: "Reference screenshot and asset requirement only. Do not create fake full game screens." })),
  assetLibraryCategories: [
    { id: "population", displayName: "Population", groups: ["Demographics", "Workforce", "Specialists", "Needs", "Wellbeing", "Migration", "Education", "Healthcare", "Capacity", "Automation", "Shortages"], notes: "Canonical asset grouping for population presentation." }
  ],
  missingSourceDefinitions: [
    { id: "population_encyclopedia_entries", type: "encyclopedia_entry", displayName: "Population Encyclopedia Entries", referencedBy: ["Population", "Workforce", "Migration", "Education"], severity: "info", recommendedOwner: "Encyclopedia", notes: "Runtime publishes contracts; authored encyclopedia copy can follow." },
    { id: "specialist_research_source_records", type: "research", displayName: "Specialist Research Source Records", referencedBy: populationSpecialistRoleDefinitions.map((role) => role.id), severity: "info", recommendedOwner: "Research", notes: "Specialists reference future or existing research concepts without duplicating research records." }
  ],
  validationRules: [
    "Population categories, life stages, workforce roles, specialist roles, needs, capacities, education tiers, migration types, assignment definitions, automation policies, and shortage codes must be unique and stable.",
    "Demographic cohorts must remain separate from workforce roles.",
    "Growth definitions must be deterministic and versioned.",
    "Migration must require canonical Actions, logistics, transport capacity, distance, travel time, destination capacity, policy checks, and hazard checks.",
    "Automation may reduce labor demand but may not bypass technology, specialist requirements, costs, or premium permissions.",
    "Colony and building integrations reference existing canonical frameworks rather than duplicating them.",
    "Studio exports no live player population values, assignments, migration instances, timestamps, queues, saves, private notes, or source paths."
  ]
};

function issue(severity: ImportIssue["severity"], code: string, message: string, records: string[] = []): ImportIssue {
  return { severity, code, message, records };
}

function duplicates(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export function validatePopulationSimulationFramework(
  framework: PopulationSimulationFrameworkContract = populationSimulationFramework,
  context: {
    actionIds?: Set<string>;
    buildingFamilyIds?: Set<string>;
    colonizationFrameworkId?: string;
    planetDevelopmentFrameworkId?: string;
    civilizationProgressionFrameworkId?: string;
    colonyTypeIds?: Set<string>;
    progressionMilestoneIds?: Set<string>;
  } = {}
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const actionIds = context.actionIds ?? new Set(canonicalActionSystem.actionDefinitions.map((action) => action.id));
  const buildingFamilyIds = context.buildingFamilyIds ?? new Set(canonicalBuildingTaxonomy.map((family) => family.id));
  const colonyTypeIds = context.colonyTypeIds ?? new Set(colonizationFramework.colonyTypeDefinitions.map((type) => type.id));
  const progressionMilestoneIds = context.progressionMilestoneIds ?? new Set(civilizationProgressionFramework.civilizationMilestones.map((milestone) => milestone.id));
  const categoryIds = new Set(framework.populationCategoryDefinitions.map((definition) => definition.id));
  const lifeStageIds = new Set(framework.populationLifeStageDefinitions.map((definition) => definition.id));
  const roleIds = new Set(framework.populationWorkforceRoleDefinitions.map((definition) => definition.id));
  const specialistIds = new Set(framework.populationSpecialistRoleDefinitions.map((definition) => definition.id));
  const educationIds = new Set(framework.populationEducationDefinitions.map((definition) => definition.id));
  const substitutionIds = new Set(framework.automationSubstitutionPolicies.map((definition) => definition.id));
  const shortageIds = new Set(framework.populationShortageReasonCodes.map((definition) => definition.id));

  if (framework.actionSystemId !== canonicalActionSystem.id) issues.push(issue("error", "population_action_system_missing", "Population Simulation must reference the Canonical Action System.", [framework.actionSystemId]));
  if (framework.planetDevelopmentFrameworkId !== (context.planetDevelopmentFrameworkId ?? planetDevelopmentFramework.id)) issues.push(issue("error", "population_planet_development_missing", "Population Simulation must reference Planet Development.", [framework.planetDevelopmentFrameworkId]));
  if (framework.civilizationProgressionFrameworkId !== (context.civilizationProgressionFrameworkId ?? civilizationProgressionFramework.id)) issues.push(issue("error", "population_progression_missing", "Population Simulation must reference Civilization Progression.", [framework.civilizationProgressionFrameworkId]));
  if (framework.colonizationFrameworkId !== (context.colonizationFrameworkId ?? colonizationFramework.id)) issues.push(issue("error", "population_colonization_missing", "Population Simulation must reference Colonization.", [framework.colonizationFrameworkId]));

  if (Object.values(framework.activePlayerStatePolicy).some(Boolean)) issues.push(issue("error", "population_player_state_exported", "Population Simulation must not export player population state.", [framework.id]));

  for (const [label, ids] of Object.entries({
    categories: framework.populationCategoryDefinitions.map((definition) => definition.id),
    lifeStages: framework.populationLifeStageDefinitions.map((definition) => definition.id),
    workforceRoles: framework.populationWorkforceRoleDefinitions.map((definition) => definition.id),
    specialistRoles: framework.populationSpecialistRoleDefinitions.map((definition) => definition.id),
    growthDefinitions: framework.populationGrowthDefinitions.map((definition) => definition.id),
    capacityDefinitions: framework.populationCapacityDefinitions.map((definition) => definition.id),
    needDefinitions: framework.populationNeedDefinitions.map((definition) => definition.id),
    wellbeingBands: framework.populationWellbeingBands.map((definition) => definition.id),
    educationDefinitions: framework.populationEducationDefinitions.map((definition) => definition.id),
    migrationDefinitions: framework.populationMigrationDefinitions.map((definition) => definition.id),
    assignmentDefinitions: framework.workforceAssignmentDefinitions.map((definition) => definition.id),
    substitutionPolicies: framework.automationSubstitutionPolicies.map((definition) => definition.id),
    shortageCodes: framework.populationShortageReasonCodes.map((definition) => definition.id)
  })) {
    const duplicateIds = duplicates(ids);
    if (duplicateIds.length) issues.push(issue("error", `duplicate_population_${label}`, `${label} must use unique IDs.`, duplicateIds));
  }

  for (const required of ["children", "adolescents", "adults", "seniors", "workers", "robotic_workers", "ai_workers", "visitors", "tourists"]) if (!categoryIds.has(required)) issues.push(issue("error", "population_category_missing", "Required population category missing.", [required]));
  for (const required of ["child", "adolescent", "adult", "senior", "synthetic", "non_biological", "temporary_resident"] as const) if (!lifeStageIds.has(required)) issues.push(issue("error", "population_life_stage_missing", "Required life stage missing.", [required]));
  for (const required of ["general_labor", "engineering", "science", "agriculture", "mining", "manufacturing", "logistics", "trade", "administration", "healthcare", "education", "exploration", "archaeology", "terraforming", "automation_management", "security", "hospitality", "maintenance", "construction", "energy"] as const) if (!roleIds.has(required)) issues.push(issue("error", "population_workforce_role_missing", "Required workforce role missing.", [required]));
  for (const required of ["food", "water", "housing", "energy", "healthcare", "education", "safety", "employment", "environment", "recreation", "social_stability", "transportation", "communication", "purpose", "autonomy"]) if (!framework.populationNeedDefinitions.some((definition) => definition.id === required)) issues.push(issue("error", "population_need_missing", "Required population need missing.", [required]));

  const demographicWithRole = framework.populationCategoryDefinitions.filter((definition) => definition.kind === "demographic_cohort" && (definition.workforceRoleIds.length || definition.specialistRoleIds.length));
  if (demographicWithRole.length) issues.push(issue("error", "demographic_workforce_mixed", "Demographic cohorts must remain separate from workforce roles.", demographicWithRole.map((definition) => definition.id)));

  for (const category of framework.populationCategoryDefinitions) {
    for (const stageId of category.lifeStageIds) if (!lifeStageIds.has(stageId)) issues.push(issue("error", "category_life_stage_missing", "Population category life stage must resolve.", [category.id, stageId]));
    for (const roleId of category.workforceRoleIds) if (!roleIds.has(roleId)) issues.push(issue("error", "category_workforce_role_missing", "Population category workforce role must resolve.", [category.id, roleId]));
    for (const specialistId of category.specialistRoleIds) if (!specialistIds.has(specialistId)) issues.push(issue("error", "category_specialist_role_missing", "Population category specialist role must resolve.", [category.id, specialistId]));
  }

  for (const role of framework.populationWorkforceRoleDefinitions) {
    for (const tierId of role.educationTierIds) if (!educationIds.has(tierId)) issues.push(issue("error", "role_education_missing", "Workforce role education tier must resolve.", [role.id, tierId]));
    for (const familyId of role.supportedBuildingFamilyIds) if (!buildingFamilyIds.has(familyId)) issues.push(issue("warning", "role_building_family_gap", "Workforce role references a building family not yet in taxonomy.", [role.id, familyId]));
    for (const policyId of role.substitutionPolicyIds) if (!substitutionIds.has(policyId)) issues.push(issue("error", "role_substitution_policy_missing", "Workforce role substitution policy must resolve.", [role.id, policyId]));
    for (const shortageId of role.shortageReasonCodeIds) if (!shortageIds.has(shortageId)) issues.push(issue("error", "role_shortage_code_missing", "Workforce role shortage code must resolve.", [role.id, shortageId]));
  }

  for (const specialistRole of framework.populationSpecialistRoleDefinitions) {
    if (!roleIds.has(specialistRole.baseWorkforceRoleId)) issues.push(issue("error", "specialist_base_role_missing", "Specialist base workforce role must resolve.", [specialistRole.id, specialistRole.baseWorkforceRoleId]));
    for (const actionId of specialistRole.supportedActionIds) if (!actionIds.has(actionId)) issues.push(issue("error", "specialist_action_missing", "Specialist supported Action must resolve.", [specialistRole.id, actionId]));
  }

  for (const growth of framework.populationGrowthDefinitions) {
    if (!growth.deterministic || growth.calculationVersion !== calculationVersion) issues.push(issue("error", "population_growth_not_deterministic", "Population growth definitions must be deterministic and versioned.", [growth.id]));
    if (!growth.inputs.length || !growth.outputs.length || !growth.formula) issues.push(issue("error", "population_growth_incomplete", "Population growth definitions must publish inputs, formula, and outputs.", [growth.id]));
  }

  for (const migration of framework.populationMigrationDefinitions) {
    if (!migration.logisticsRequired || !migration.transportCapacityRequired || !migration.destinationCapacityCheck || !migration.policyCheck || !migration.hazardCheck) issues.push(issue("error", "population_migration_not_gated", "Migration must require logistics, transport, capacity, policy, and hazard checks.", [migration.id]));
    for (const actionId of migration.actionIds) if (!actionIds.has(actionId)) issues.push(issue("error", "population_migration_action_missing", "Migration Action must resolve.", [migration.id, actionId]));
  }

  for (const assignment of framework.workforceAssignmentDefinitions) {
    if (!assignment.gameOwnsAssignments) issues.push(issue("error", "population_assignment_state_not_game_owned", "The Game must own live workforce assignments.", [assignment.id]));
    for (const actionId of assignment.actionIds) if (!actionIds.has(actionId)) issues.push(issue("error", "population_assignment_action_missing", "Workforce assignment Action must resolve.", [assignment.id, actionId]));
  }

  for (const policy of framework.automationSubstitutionPolicies) {
    for (const categoryId of policy.allowedWorkerCategoryIds) if (!categoryIds.has(categoryId)) issues.push(issue("error", "automation_worker_category_missing", "Automation worker category must resolve.", [policy.id, categoryId]));
    if (policy.canBypassTechnology || policy.canBypassSpecialists || policy.canBypassCosts || policy.canBypassPremiumPermissions) issues.push(issue("error", "automation_bypass_invalid", "Automation may not bypass technology, specialists, costs, or premium permissions.", [policy.id]));
  }

  for (const integration of framework.colonyIntegration) {
    if (!colonyTypeIds.has(integration.colonyTypeId)) issues.push(issue("error", "population_colony_type_missing", "Population colony integration must reference an existing colony type.", [integration.id, integration.colonyTypeId]));
    if (!framework.populationGrowthDefinitions.some((growth) => growth.id === integration.growthProfileId)) issues.push(issue("error", "population_colony_growth_missing", "Population colony growth profile must resolve.", [integration.id, integration.growthProfileId]));
    for (const requirement of integration.workforceRoleRequirements) if (!roleIds.has(requirement.roleId)) issues.push(issue("error", "population_colony_workforce_role_missing", "Population colony workforce role must resolve.", [integration.id, requirement.roleId]));
  }

  for (const hook of framework.buildingIntegrationHooks) {
    if (!buildingFamilyIds.has(hook.buildingFamilyId) && !hook.missingDefinition) issues.push(issue("error", "population_building_family_missing", "Building integration hook must resolve or be explicitly reported as missing.", [hook.id, hook.buildingFamilyId]));
    for (const roleId of hook.workforceDemandRoleIds) if (!roleIds.has(roleId)) issues.push(issue("error", "population_building_workforce_role_missing", "Building workforce role hook must resolve.", [hook.id, roleId]));
    for (const policyId of hook.automationPolicyIds) if (!substitutionIds.has(policyId)) issues.push(issue("error", "population_building_automation_policy_missing", "Building automation policy must resolve.", [hook.id, policyId]));
  }

  for (const hook of framework.civilizationProgressionIntegration) {
    for (const id of hook.referencedIds) if (!progressionMilestoneIds.has(id)) issues.push(issue("info", "population_progression_future_hook", "Population progression hook references a future or broad milestone.", [hook.id, id]));
  }

  for (const contract of framework.populationPresentationContract) {
    if (!contract.rendererIndependent || !contract.semanticFields.length) issues.push(issue("error", "population_presentation_contract_invalid", "Population presentation contracts must be renderer-independent and semantic.", [contract.id]));
  }

  if (/currentPopulationValue|livePopulationCount|activePopulationAssignment|migrationStartedAt|migrationCompletedAt|queueInstance|saveId|cloudSaveId|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework))) {
    issues.push(issue("error", "population_runtime_leak", "Population runtime must not expose player state, private paths, timestamps, queues, or saves.", [framework.id]));
  }

  return issues;
}
