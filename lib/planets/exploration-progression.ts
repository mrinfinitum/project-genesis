import type { ImportIssue, PlanetExplorationProgressionContract, PlanetExplorationStageId, PlanetExplorationTimedAction, TimeActionContract } from "@/types/runtime";

export const timeActionContract: TimeActionContract = {
  id: "time_action_contract_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-TIME-PRIMARY",
  decisionTitle: "Time Is the Primary Progression Resource",
  ownership: {
    studioOwns: [
      "canonical timing model",
      "action state machine",
      "duration and acceleration policy",
      "research, upgrade, AI Agent, building, automation, civilization, and Premium Crystal modifier slots",
      "validation rules"
    ],
    gameOwns: [
      "player action instances",
      "save records",
      "trusted timer execution",
      "server-authoritative purchases and acceleration settlement",
      "UI progress rendering"
    ]
  },
  stateMachine: ["idle", "queued", "preparing", "in_progress", "paused", "complete", "failed", "cancelled"],
  progressModel: {
    supportsProgressPercent: true,
    supportsRemainingTime: true,
    supportsEstimatedCompletion: true,
    supportsAccelerationSources: true,
    supportsCrystalAcceleration: true,
    completionEventRequired: true,
    deterministicClock: "game_server_or_trusted_client",
    offlineProgressPolicy: "allowed_when_action_allows"
  },
  accelerationPolicy: {
    premiumCrystals: {
      allowed: true,
      policy: "accelerate_only",
      canUnlockUnavailableActions: false,
      allowedUses: ["reduce_remaining_time", "complete_instantly_when_action_allows", "reduce_queue_time", "speed_automation", "reduce_probe_duration", "reduce_survey_duration", "speed_construction"]
    },
    researchModifierIds: ["probe_speed", "survey_speed", "colonization_speed", "terraform_speed", "mining_speed", "harvest_speed", "construction_speed", "automation_efficiency"],
    upgradeModifierIds: ["probe_speed_upgrade", "survey_speed_upgrade", "automation_efficiency_upgrade", "construction_speed_upgrade"],
    aiAgentModifierIds: ["ai_agent_timer_assist", "ai_agent_auto_probe", "ai_agent_auto_survey", "ai_agent_colony_management", "ai_agent_harvest_management"],
    buildingModifierIds: ["observatory_probe_speed", "survey_lab_speed", "spaceport_launch_queue", "automation_center_efficiency"],
    civilizationModifierIds: ["civilization_exploration_bonus", "civilization_logistics_bonus", "civilization_science_bonus"],
    automationModifierIds: ["automation_probe_management", "automation_survey_management", "automation_project_management"]
  },
  futureSystemScopes: ["research", "buildings", "exploration", "colonization", "mining", "terraforming", "manufacturing", "ship_construction", "expeditions", "discovery"],
  validationRules: [
    "Meaningful actions reference this contract unless explicitly marked instant.",
    "Premium Crystals accelerate progress but never bypass unavailable technology requirements.",
    "Action instances and player timers are Game-owned save/backend state.",
    "Studio publishes duration and modifier rules only."
  ]
};

const surveyOnlyFields = ["civilizationSuitabilityIndex", "strategicValueIndex", "planetNickname", "recommendedUses", "resourceRichness", "biomeDetails", "lifeforms", "ancientRuins", "discoveryOpportunities", "availableActions"];

const pipeline: PlanetExplorationProgressionContract["pipeline"] = [
  {
    id: "unknown",
    order: 1,
    displayName: "Unknown",
    description: "Nothing is known. The object is represented as ??? and an unknown body.",
    requiredActionIds: [],
    revealedFields: ["hiddenDisplayName"],
    hiddenFields: ["name", "registry", "resources", "planetClass", ...surveyOnlyFields],
    nextStageIds: ["detected"]
  },
  {
    id: "detected",
    order: 2,
    displayName: "Detected",
    description: "A planet-like body exists. The player sees approximate position, distance, and an unknown icon; no CSI, nickname, or recommended uses.",
    requiredActionIds: [],
    revealedFields: ["approximatePosition", "distance", "unknownIcon"],
    hiddenFields: ["name", "civilizationSuitabilityIndex", "strategicValueIndex", "planetNickname", "recommendedUses", "availableActions"],
    nextStageIds: ["probed"]
  },
  {
    id: "probed",
    order: 3,
    displayName: "Probed",
    description: "Probe data reveals basic planetary characteristics while keeping evaluation data hidden.",
    requiredActionIds: ["planet_probe"],
    revealedFields: ["planetClass", "basicAtmosphere", "gravity", "temperature", "basicHazards", "estimatedResources"],
    hiddenFields: surveyOnlyFields,
    nextStageIds: ["surveyed"]
  },
  {
    id: "surveyed",
    order: 4,
    displayName: "Surveyed",
    description: "Survey completion reveals the full opportunity evaluation and unlocks player decision actions.",
    requiredActionIds: ["planet_survey"],
    revealedFields: surveyOnlyFields,
    hiddenFields: [],
    nextStageIds: ["evaluated"]
  },
  {
    id: "evaluated",
    order: 5,
    displayName: "Evaluated",
    description: "The player can compare the planet opportunity profile and select a development path.",
    requiredActionIds: ["planet_evaluate"],
    revealedFields: ["allSurveyedFields", "developmentOptions"],
    hiddenFields: [],
    nextStageIds: ["selected_for_development"]
  },
  {
    id: "selected_for_development",
    order: 6,
    displayName: "Selected for Development",
    description: "A strategic path has been selected, such as colonization, mining, research, preservation, or catalog-only.",
    requiredActionIds: ["planet_select_development"],
    revealedFields: ["selectedDevelopmentIntent", "projectRequirements"],
    hiddenFields: [],
    nextStageIds: ["active_project"]
  },
  {
    id: "active_project",
    order: 7,
    displayName: "Active Project",
    description: "The selected time-gated project is queued, preparing, in progress, or paused.",
    requiredActionIds: ["planet_start_project"],
    revealedFields: ["projectProgress", "remainingTime", "accelerationSources"],
    hiddenFields: [],
    nextStageIds: ["complete"]
  },
  {
    id: "complete",
    order: 8,
    displayName: "Complete",
    description: "The selected project is complete and emits its canonical completion event/rewards.",
    requiredActionIds: [],
    revealedFields: ["completionEvent", "completionRewards"],
    hiddenFields: [],
    nextStageIds: []
  }
];

const visibilityRules: PlanetExplorationProgressionContract["visibilityRules"] = [
  {
    stageId: "unknown",
    canShowName: false,
    canShowApproximatePosition: false,
    canShowDistance: false,
    canShowUnknownIcon: true,
    canShowPlanetClass: false,
    canShowBasicAtmosphere: false,
    canShowGravity: false,
    canShowTemperature: false,
    canShowBasicHazards: false,
    canShowEstimatedResources: false,
    canShowCivilizationSuitabilityIndex: false,
    canShowStrategicValueIndex: false,
    canShowNickname: false,
    canShowRecommendedUses: false,
    canShowResourceRichness: false,
    canShowBiomeDetails: false,
    canShowLifeforms: false,
    canShowAncientRuins: false,
    canShowDiscoveryOpportunities: false,
    canShowAvailableActions: false,
    hiddenDisplayName: "???"
  },
  {
    stageId: "detected",
    canShowName: false,
    canShowApproximatePosition: true,
    canShowDistance: true,
    canShowUnknownIcon: true,
    canShowPlanetClass: false,
    canShowBasicAtmosphere: false,
    canShowGravity: false,
    canShowTemperature: false,
    canShowBasicHazards: false,
    canShowEstimatedResources: false,
    canShowCivilizationSuitabilityIndex: false,
    canShowStrategicValueIndex: false,
    canShowNickname: false,
    canShowRecommendedUses: false,
    canShowResourceRichness: false,
    canShowBiomeDetails: false,
    canShowLifeforms: false,
    canShowAncientRuins: false,
    canShowDiscoveryOpportunities: false,
    canShowAvailableActions: false,
    hiddenDisplayName: "???"
  },
  {
    stageId: "probed",
    canShowName: true,
    canShowApproximatePosition: true,
    canShowDistance: true,
    canShowUnknownIcon: false,
    canShowPlanetClass: true,
    canShowBasicAtmosphere: true,
    canShowGravity: true,
    canShowTemperature: true,
    canShowBasicHazards: true,
    canShowEstimatedResources: true,
    canShowCivilizationSuitabilityIndex: false,
    canShowStrategicValueIndex: false,
    canShowNickname: false,
    canShowRecommendedUses: false,
    canShowResourceRichness: false,
    canShowBiomeDetails: false,
    canShowLifeforms: false,
    canShowAncientRuins: false,
    canShowDiscoveryOpportunities: false,
    canShowAvailableActions: false,
    hiddenDisplayName: "???"
  },
  ...(["surveyed", "evaluated", "selected_for_development", "active_project", "complete"] as PlanetExplorationStageId[]).map((stageId) => ({
    stageId,
    canShowName: true,
    canShowApproximatePosition: true,
    canShowDistance: true,
    canShowUnknownIcon: false,
    canShowPlanetClass: true,
    canShowBasicAtmosphere: true,
    canShowGravity: true,
    canShowTemperature: true,
    canShowBasicHazards: true,
    canShowEstimatedResources: true,
    canShowCivilizationSuitabilityIndex: true,
    canShowStrategicValueIndex: true,
    canShowNickname: true,
    canShowRecommendedUses: true,
    canShowResourceRichness: true,
    canShowBiomeDetails: true,
    canShowLifeforms: true,
    canShowAncientRuins: true,
    canShowDiscoveryOpportunities: true,
    canShowAvailableActions: true,
    hiddenDisplayName: "???" as const
  }))
];

function timedAction(input: Omit<PlanetExplorationTimedAction, "timeActionContractId" | "premiumCrystalAcceleration" | "progressStages"> & Partial<Pick<PlanetExplorationTimedAction, "premiumCrystalAcceleration" | "progressStages">>): PlanetExplorationTimedAction {
  return {
    timeActionContractId: timeActionContract.id,
    progressStages: input.progressStages ?? ["queued", "preparing", "in_progress", "complete"],
    premiumCrystalAcceleration: input.premiumCrystalAcceleration ?? {
      enabled: true,
      unlocksUnavailableActions: false,
      policy: "reduce_remaining_time"
    },
    ...input
  };
}

const timedActions: PlanetExplorationTimedAction[] = [
  timedAction({
    id: "planet_probe",
    displayName: "Probe Planet",
    category: "probe",
    description: "Send a probe to reveal basic planetary characteristics. Probe requires time and cannot reveal CSI, SVI, nickname, recommended uses, or actions.",
    fromStageId: "detected",
    toStageId: "probed",
    baseDurationSeconds: 1800,
    minimumDurationSeconds: 300,
    maximumDurationSeconds: 7200,
    researchModifierIds: ["probe_speed"],
    buildingModifierIds: ["observatory_probe_speed", "spaceport_launch_queue"],
    aiAgentModifierIds: ["ai_agent_timer_assist", "ai_agent_auto_probe"],
    automationModifierIds: ["automation_probe_management"],
    civilizationModifierIds: ["civilization_exploration_bonus"],
    completionRewards: ["basic_planet_data", "discovery_points_probe"],
    requiresSurveyComplete: false,
    validOpportunityActions: ["Probe"],
    notes: "Probe output intentionally stops short of planet evaluation."
  }),
  timedAction({
    id: "planet_survey",
    displayName: "Survey Planet",
    category: "survey",
    description: "Run a deeper survey to reveal the full Opportunity Profile evaluation, including CSI, SVI, nickname, recommended uses, and valid actions.",
    fromStageId: "probed",
    toStageId: "surveyed",
    baseDurationSeconds: 7200,
    minimumDurationSeconds: 900,
    maximumDurationSeconds: 28800,
    researchModifierIds: ["survey_speed"],
    buildingModifierIds: ["survey_lab_speed", "observatory_probe_speed"],
    aiAgentModifierIds: ["ai_agent_timer_assist", "ai_agent_auto_survey"],
    automationModifierIds: ["automation_survey_management"],
    civilizationModifierIds: ["civilization_science_bonus", "civilization_exploration_bonus"],
    completionRewards: ["full_planet_evaluation", "discovery_points_survey"],
    requiresSurveyComplete: false,
    validOpportunityActions: ["Survey"],
    notes: "Survey completion is the canonical reveal boundary for CSI, SVI, nickname, recommendations, and actions."
  }),
  timedAction({
    id: "planet_evaluate",
    displayName: "Evaluate Planet",
    category: "decision",
    description: "Review the surveyed Opportunity Profile before selecting a development path.",
    fromStageId: "surveyed",
    toStageId: "evaluated",
    baseDurationSeconds: 0,
    minimumDurationSeconds: 0,
    maximumDurationSeconds: 0,
    researchModifierIds: [],
    buildingModifierIds: [],
    aiAgentModifierIds: [],
    automationModifierIds: [],
    civilizationModifierIds: [],
    premiumCrystalAcceleration: { enabled: false, unlocksUnavailableActions: false, policy: "reduce_remaining_time" },
    progressStages: ["idle", "complete"],
    completionRewards: ["development_options_available"],
    requiresSurveyComplete: true,
    validOpportunityActions: ["Catalog", "Bookmark", "Ignore"],
    notes: "This is intentionally instant because it represents a player decision screen, not work being performed."
  }),
  timedAction({
    id: "planet_select_development",
    displayName: "Select Development Path",
    category: "decision",
    description: "Choose a strategic use such as colonization, mining, research, orbital refinery, preservation, catalog-only, or ignore.",
    fromStageId: "evaluated",
    toStageId: "selected_for_development",
    baseDurationSeconds: 0,
    minimumDurationSeconds: 0,
    maximumDurationSeconds: 0,
    researchModifierIds: [],
    buildingModifierIds: [],
    aiAgentModifierIds: [],
    automationModifierIds: [],
    civilizationModifierIds: [],
    premiumCrystalAcceleration: { enabled: false, unlocksUnavailableActions: false, policy: "reduce_remaining_time" },
    progressStages: ["idle", "complete"],
    completionRewards: ["development_path_selected"],
    requiresSurveyComplete: true,
    validOpportunityActions: ["Colonize", "Mine", "Harvest", "Research", "Catalog", "Bookmark", "Ignore"],
    notes: "Selecting an intent is instant; executing the selected project is time-gated."
  }),
  timedAction({
    id: "planet_start_project",
    displayName: "Start Planet Project",
    category: "development",
    description: "Begin the selected planet project. Every meaningful development path is time-gated.",
    fromStageId: "selected_for_development",
    toStageId: "active_project",
    baseDurationSeconds: 14400,
    minimumDurationSeconds: 1800,
    maximumDurationSeconds: 172800,
    researchModifierIds: ["colonization_speed", "terraform_speed", "mining_speed", "harvest_speed", "construction_speed"],
    buildingModifierIds: ["spaceport_launch_queue", "automation_center_efficiency"],
    aiAgentModifierIds: ["ai_agent_timer_assist", "ai_agent_colony_management", "ai_agent_harvest_management"],
    automationModifierIds: ["automation_project_management"],
    civilizationModifierIds: ["civilization_logistics_bonus", "civilization_science_bonus"],
    completionRewards: ["project_active", "completion_event_on_finish"],
    requiresSurveyComplete: true,
    validOpportunityActions: ["Colonize", "Mine", "Harvest", "Research", "Catalog", "Bookmark", "Ignore"],
    notes: "Clients select the exact project subtype from surveyed opportunity actions; Studio owns timing policy."
  })
];

export const planetExplorationProgression: PlanetExplorationProgressionContract = {
  id: "planet_exploration_progression_v1",
  version: "1.0.0",
  timeActionContractId: timeActionContract.id,
  ownership: {
    studioOwns: ["pipeline stages", "visibility gates", "timed action definitions", "nickname reveal rules", "duration and modifier references"],
    gameOwns: ["player progression state", "active action instances", "save persistence", "timer execution", "purchase settlement", "UI rendering"]
  },
  pipeline,
  visibilityRules,
  timedActions,
  nicknameRules: [
    { id: "nickname_garden_world", nickname: "Garden World", priority: 100, profileSignals: ["planet_opportunity_earth_like", "colonization>=85", "tourism>=70"], revealStageId: "surveyed" },
    { id: "nickname_mining_giant", nickname: "Mining Giant", priority: 90, profileSignals: ["mining>=85", "orbitalInfrastructure>=70"], revealStageId: "surveyed" },
    { id: "nickname_scientific_paradise", nickname: "Scientific Paradise", priority: 85, profileSignals: ["scientificResearch>=85", "danger<50"], revealStageId: "surveyed" },
    { id: "nickname_ocean_frontier", nickname: "Ocean Frontier", priority: 80, profileSignals: ["planet_opportunity_ocean", "colonization>=60"], revealStageId: "surveyed" },
    { id: "nickname_orbital_refinery_candidate", nickname: "Orbital Refinery Candidate", priority: 78, profileSignals: ["planet_opportunity_gas_giant", "planet_opportunity_ice_giant", "harvesting>=90"], revealStageId: "surveyed" },
    { id: "nickname_crystal_world", nickname: "Crystal World", priority: 74, profileSignals: ["planet_opportunity_crystal"], revealStageId: "surveyed" },
    { id: "nickname_industrial_powerhouse", nickname: "Industrial Powerhouse", priority: 70, profileSignals: ["mining>=70", "tradeHub>=60", "orbitalInfrastructure>=70"], revealStageId: "surveyed" },
    { id: "nickname_fuel_depot", nickname: "Fuel Depot", priority: 68, profileSignals: ["supportsRefueling", "harvesting>=70"], revealStageId: "surveyed" },
    { id: "nickname_ancient_graveyard", nickname: "Ancient Graveyard", priority: 66, profileSignals: ["archaeology>=75", "danger>=60"], revealStageId: "surveyed" },
    { id: "nickname_research_haven", nickname: "Research Haven", priority: 64, profileSignals: ["scientificResearch>=75", "supportsResearchStations"], revealStageId: "surveyed" },
    { id: "nickname_preservation_world", nickname: "Preservation World", priority: 62, profileSignals: ["supportsPreservation", "harvesting>=70"], revealStageId: "surveyed" },
    { id: "nickname_dead_but_valuable", nickname: "Dead but Valuable", priority: 60, profileSignals: ["planet_opportunity_dead", "mining>=60"], revealStageId: "surveyed" },
    { id: "nickname_frozen_frontier", nickname: "Frozen Frontier", priority: 58, profileSignals: ["planet_opportunity_frozen", "planet_opportunity_frozen_moon"], revealStageId: "surveyed" },
    { id: "nickname_living_laboratory", nickname: "Living Laboratory", priority: 56, profileSignals: ["planet_opportunity_forest", "scientificResearch>=75"], revealStageId: "surveyed" }
  ],
  validationRules: [
    "CSI is hidden until Surveyed.",
    "Strategic Value Index is hidden until Surveyed.",
    "Planet nickname is hidden until Surveyed.",
    "Recommended uses and actions are hidden until Surveyed.",
    "Actions that advance development require surveyed data unless explicitly marked as decision-only.",
    "Every exploration action references time_action_contract_v1.",
    "Premium Crystals accelerate only and never bypass unavailable technology requirements.",
    "Research, buildings, AI Agents, automation, and civilization bonuses modify duration through explicit modifier IDs."
  ]
};

export function validateTimeActionContract(contract: TimeActionContract = timeActionContract): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const requiredStates = ["idle", "queued", "preparing", "in_progress", "paused", "complete", "failed", "cancelled"];
  for (const state of requiredStates) {
    if (!contract.stateMachine.includes(state as TimeActionContract["stateMachine"][number])) {
      issues.push({ severity: "error", code: "time_action_state_missing", message: "Time Action Contract is missing a required state.", records: [state] });
    }
  }
  if (contract.accelerationPolicy.premiumCrystals.policy !== "accelerate_only" || contract.accelerationPolicy.premiumCrystals.canUnlockUnavailableActions !== false) {
    issues.push({ severity: "error", code: "premium_crystal_policy_invalid", message: "Premium Crystals must accelerate only and must not unlock unavailable actions.", records: [contract.id] });
  }
  for (const key of ["researchModifierIds", "aiAgentModifierIds", "buildingModifierIds", "automationModifierIds", "civilizationModifierIds"] as const) {
    if (!contract.accelerationPolicy[key].length) {
      issues.push({ severity: "error", code: "time_action_modifier_family_missing", message: "Time Action Contract must publish all required modifier families.", records: [key] });
    }
  }
  return issues;
}

export function validatePlanetExplorationProgression(
  contract: PlanetExplorationProgressionContract = planetExplorationProgression,
  timeContract: TimeActionContract = timeActionContract
): ImportIssue[] {
  const issues: ImportIssue[] = [...validateTimeActionContract(timeContract)];
  const stageIds = new Set(contract.pipeline.map((stage) => stage.id));
  const visibilityIds = new Set(contract.visibilityRules.map((rule) => rule.stageId));
  const expectedOrder: PlanetExplorationStageId[] = ["unknown", "detected", "probed", "surveyed", "evaluated", "selected_for_development", "active_project", "complete"];

  if (contract.timeActionContractId !== timeContract.id) {
    issues.push({ severity: "error", code: "planet_exploration_time_contract_missing", message: "Planet exploration progression must reference the shared Time Action Contract.", records: [contract.id, contract.timeActionContractId] });
  }
  if (contract.pipeline.map((stage) => stage.id).join("|") !== expectedOrder.join("|")) {
    issues.push({ severity: "error", code: "planet_exploration_pipeline_order_invalid", message: "Planet exploration pipeline must follow the canonical progression order.", records: contract.pipeline.map((stage) => stage.id) });
  }
  for (const stageId of expectedOrder) {
    if (!stageIds.has(stageId)) issues.push({ severity: "error", code: "planet_exploration_stage_missing", message: "Planet exploration progression is missing a stage.", records: [stageId] });
    if (!visibilityIds.has(stageId)) issues.push({ severity: "error", code: "planet_exploration_visibility_missing", message: "Planet exploration progression is missing visibility rules for a stage.", records: [stageId] });
  }

  const preSurveyRules = contract.visibilityRules.filter((rule) => ["unknown", "detected", "probed"].includes(rule.stageId));
  for (const rule of preSurveyRules) {
    if (rule.canShowCivilizationSuitabilityIndex || rule.canShowStrategicValueIndex || rule.canShowNickname || rule.canShowRecommendedUses || rule.canShowAvailableActions) {
      issues.push({ severity: "error", code: "planet_evaluation_revealed_too_early", message: "CSI, SVI, nickname, recommendations, and actions must remain hidden until Surveyed.", records: [rule.stageId] });
    }
  }
  const surveyed = contract.visibilityRules.find((rule) => rule.stageId === "surveyed");
  if (!surveyed?.canShowCivilizationSuitabilityIndex || !surveyed.canShowStrategicValueIndex || !surveyed.canShowNickname || !surveyed.canShowRecommendedUses || !surveyed.canShowAvailableActions) {
    issues.push({ severity: "error", code: "surveyed_evaluation_visibility_missing", message: "Surveyed stage must reveal CSI, SVI, nickname, recommendations, and actions.", records: ["surveyed"] });
  }

  for (const action of contract.timedActions) {
    if (action.timeActionContractId !== timeContract.id) {
      issues.push({ severity: "error", code: "exploration_action_time_contract_missing", message: "Every exploration action must reference the Time Action Contract.", records: [action.id, action.timeActionContractId] });
    }
    if (!stageIds.has(action.fromStageId) || !stageIds.has(action.toStageId)) {
      issues.push({ severity: "error", code: "exploration_action_stage_missing", message: "Exploration action stages must resolve to the pipeline.", records: [action.id, action.fromStageId, action.toStageId] });
    }
    if (action.baseDurationSeconds < action.minimumDurationSeconds || action.baseDurationSeconds > action.maximumDurationSeconds) {
      issues.push({ severity: "error", code: "exploration_action_duration_invalid", message: "Action base duration must be between minimum and maximum duration.", records: [action.id] });
    }
    if (action.premiumCrystalAcceleration.enabled && action.premiumCrystalAcceleration.unlocksUnavailableActions !== false) {
      issues.push({ severity: "error", code: "exploration_action_premium_policy_invalid", message: "Premium Crystal acceleration must not unlock unavailable actions.", records: [action.id] });
    }
    if (action.id !== "planet_evaluate" && action.id !== "planet_select_development" && action.baseDurationSeconds <= 0) {
      issues.push({ severity: "error", code: "exploration_action_not_time_gated", message: "Meaningful exploration and development actions must require time.", records: [action.id] });
    }
  }

  for (const actionId of ["planet_probe", "planet_survey", "planet_start_project"]) {
    const action = contract.timedActions.find((item) => item.id === actionId);
    if (!action) {
      issues.push({ severity: "error", code: "exploration_action_missing", message: "Planet exploration progression is missing a required timed action.", records: [actionId] });
    }
  }

  for (const rule of contract.nicknameRules) {
    if (rule.revealStageId !== "surveyed") {
      issues.push({ severity: "error", code: "nickname_revealed_before_survey", message: "Planet nicknames must not reveal before Surveyed.", records: [rule.id] });
    }
  }

  return issues;
}
