import { timeActionContract } from "@/lib/planets/exploration-progression";
import type { ActionDefinition, ActionQueueRule, ActionRequirement, ActionSystemCategory, ActionSystemContract, ActionSystemState, ActionTransfer, ImportIssue, TimeActionContract } from "@/types/runtime";

const categoryNames = [
  "Exploration",
  "Probe",
  "Survey",
  "Scan",
  "Catalog",
  "Analyze",
  "Research",
  "Build",
  "Upgrade",
  "Manufacture",
  "Mining",
  "Harvest",
  "Extraction",
  "Construction",
  "Colonization",
  "Terraforming",
  "Trade",
  "Travel",
  "Population",
  "AI",
  "Military",
  "Story",
  "Discovery",
  "Administration"
] as const;

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export const actionCategories: ActionSystemCategory[] = categoryNames.map((name, index) => ({
  id: slug(name),
  displayName: name,
  description: `${name} actions use the canonical Action System contract.`,
  displayOrder: index + 1,
  future: name === "Military"
}));

export const actionStates: ActionSystemState[] = [
  { id: "idle", displayName: "Idle", terminal: false, historyEvent: false, description: "Action is available but has not entered a queue." },
  { id: "queued", displayName: "Queued", terminal: false, historyEvent: true, description: "Action is waiting in a queue." },
  { id: "waiting", displayName: "Waiting", terminal: false, historyEvent: true, description: "Action is waiting on a prerequisite, reserved slot, or dependency." },
  { id: "preparing", displayName: "Preparing", terminal: false, historyEvent: true, description: "Action has begun setup work before active progress." },
  { id: "running", displayName: "Running", terminal: false, historyEvent: true, description: "Action is actively progressing over time." },
  { id: "paused", displayName: "Paused", terminal: false, historyEvent: true, description: "Action progress is suspended and can resume." },
  { id: "blocked", displayName: "Blocked", terminal: false, historyEvent: true, description: "Action cannot proceed until a blocking condition clears." },
  { id: "failed", displayName: "Failed", terminal: true, historyEvent: true, description: "Action ended unsuccessfully." },
  { id: "cancelled", displayName: "Cancelled", terminal: true, historyEvent: true, description: "Action was intentionally cancelled." },
  { id: "completed", displayName: "Completed", terminal: true, historyEvent: true, description: "Action completed and emitted rewards/events." },
  { id: "archived", displayName: "Archived", terminal: true, historyEvent: true, description: "Action history has been retained but removed from active views." }
];

export const actionQueueRules: ActionQueueRule[] = [
  { id: "queue_single", displayName: "Single Queue", queueScope: "single", supportsPriority: false, supportsParallelActions: false, notes: "One active action at a time." },
  { id: "queue_multiple", displayName: "Multiple Queue", queueScope: "multiple", supportsPriority: true, supportsParallelActions: true, notes: "Multiple actions may progress where systems allow parallelism." },
  { id: "queue_per_colony", displayName: "Per Colony Queue", queueScope: "per_colony", supportsPriority: true, supportsParallelActions: false, notes: "Each colony owns its local action queue." },
  { id: "queue_per_planet", displayName: "Per Planet Queue", queueScope: "per_planet", supportsPriority: true, supportsParallelActions: false, notes: "Each planet owns exploration/development action sequencing." },
  { id: "queue_global", displayName: "Global Queue", queueScope: "global", supportsPriority: true, supportsParallelActions: true, notes: "Civilization-wide actions share a global queue." },
  { id: "queue_priority", displayName: "Priority Queue", queueScope: "priority", supportsPriority: true, supportsParallelActions: true, notes: "Future queue mode for prioritized automation systems." }
];

const accelerationRules = [
  "Premium Crystals never unlock unavailable Actions.",
  "Premium Crystals may accelerate, reduce queue time, finish early when allowed, or reduce waiting.",
  "Research, AI Agents, automation, buildings, civilization bonuses, planet bonuses, and temporary events modify duration through explicit modifier IDs.",
  "Acceleration is observable and writes an action history event."
];

const automationRules = [
  "Every Action declares whether it can automate.",
  "AI Agent support is explicit per Action.",
  "Automation tier controls whether basic, advanced, or specialized automation can manage the Action.",
  "Automation never bypasses requirements."
];

function requirement(type: ActionRequirement["type"], id: string, condition: string, quantity: number | null = null): ActionRequirement {
  return { type, id, quantity, condition, blocking: true, notes: "Canonical action requirement." };
}

function transfer(type: ActionTransfer["type"], id: string, timing: ActionTransfer["timing"], quantity: number | null = null): ActionTransfer {
  return { type, id, quantity, timing, notes: "Canonical action transfer." };
}

function action(input: {
  id: string;
  displayName: string;
  category: string;
  entityType: ActionDefinition["entityType"];
  actionType: string;
  description: string;
  baseDurationSeconds: number;
  minimumDurationSeconds: number;
  maximumDurationSeconds: number;
  queueRuleId: string;
  queueScope: ActionDefinition["queueBehavior"]["queueScope"];
  requirements: ActionRequirement[];
  inputs?: ActionTransfer[];
  outputs: ActionTransfer[];
  canAutomate?: boolean;
  automationTier?: ActionDefinition["automation"]["automationTier"];
  aiAgentSupport?: boolean;
  discoveryPoints?: number;
  iconKey?: string;
}): ActionDefinition {
  return {
    id: input.id,
    displayName: input.displayName,
    category: input.category,
    description: input.description,
    entityType: input.entityType,
    actionType: input.actionType,
    requirements: input.requirements,
    inputs: input.inputs ?? [transfer("time", "time", "progress")],
    outputs: input.outputs,
    duration: {
      timeActionContractId: timeActionContract.id,
      baseDurationSeconds: input.baseDurationSeconds,
      minimumDurationSeconds: input.minimumDurationSeconds,
      maximumDurationSeconds: input.maximumDurationSeconds,
      estimatedCompletionRule: "estimatedCompletion = startedAt + adjustedRemainingDuration",
      progressRule: "progressPercent = elapsedAdjustedDuration / totalAdjustedDuration"
    },
    modifiers: {
      researchModifierIds: ["action_speed_research"],
      aiAgentModifierIds: input.aiAgentSupport === false ? [] : ["ai_agent_timer_assist"],
      automationModifierIds: input.canAutomate === false ? [] : ["automation_efficiency"],
      buildingModifierIds: ["specialized_building_bonus"],
      civilizationModifierIds: ["civilization_action_bonus"],
      planetModifierIds: input.entityType === "planet" || input.entityType === "colony" ? ["planet_opportunity_modifier"] : [],
      temporaryEventModifierIds: ["temporary_event_action_modifier"],
      premiumCrystalAcceleration: {
        allowed: true,
        policy: "accelerate_only",
        canUnlockUnavailableActions: false
      }
    },
    automation: {
      canAutomate: input.canAutomate ?? true,
      automationTier: input.automationTier ?? "basic",
      aiAgentSupport: input.aiAgentSupport ?? true,
      automationRules: input.canAutomate === false ? ["Manual confirmation required."] : ["Automation may queue and monitor this Action after requirements resolve."]
    },
    queueBehavior: {
      queueRuleId: input.queueRuleId,
      queueScope: input.queueScope,
      interruptible: true,
      prioritySupported: input.queueScope === "priority" || input.queueScope === "global" || input.queueScope === "per_colony" || input.queueScope === "per_planet",
      pauseSupported: true,
      cancelSupported: true
    },
    failureRules: ["insufficient_resources", "technology_lost", "target_destroyed", "cancelled", "interrupted", "blocked", "environmental_failure", "story_restriction"],
    completionRules: ["requirements_still_valid", "duration_complete", "completion_event_emitted", "history_record_written"],
    events: ["action_started", "action_progress", "action_completed", "action_cancelled", "action_failed", "action_blocked", "action_accelerated", "action_automated"],
    rewardProfile: {
      discoveryPoints: input.discoveryPoints ?? 0,
      rewardIds: input.outputs.map((output) => output.id),
      historyRecordRequired: true
    },
    history: {
      started: true,
      completed: true,
      cancelled: true,
      failed: true,
      accelerated: true,
      automated: true
    },
    presentation: {
      mode: "queue_card",
      iconKey: input.iconKey ?? `action_${input.id}`,
      statusBadge: "Action",
      completionAnimationKey: null,
      notes: "Studio publishes semantic presentation intent only. Clients own React, Roblox, or engine-specific rendering."
    }
  };
}

export const actionDefinitions: ActionDefinition[] = [
  action({
    id: "action_send_probe",
    displayName: "Send Probe",
    category: "probe",
    entityType: "planet",
    actionType: "send_probe",
    description: "Send a probe to reveal basic planetary characteristics.",
    baseDurationSeconds: 1800,
    minimumDurationSeconds: 300,
    maximumDurationSeconds: 7200,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("knowledge_state", "detected", "Target body must be detected.")],
    outputs: [transfer("knowledge", "planet_basic_characteristics", "completion"), transfer("discovery", "probe_discovery_progress", "completion", 1)],
    discoveryPoints: 5
  }),
  action({
    id: "action_survey_planet",
    displayName: "Survey Planet",
    category: "survey",
    entityType: "planet",
    actionType: "survey_planet",
    description: "Survey a probed planet to reveal CSI, SVI, nickname, recommended uses, resources, biome details, lifeforms, ruins, and actions.",
    baseDurationSeconds: 7200,
    minimumDurationSeconds: 900,
    maximumDurationSeconds: 28800,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("knowledge_state", "probed", "Target body must be probed.")],
    outputs: [transfer("knowledge", "planet_full_evaluation", "completion"), transfer("discovery", "survey_discovery_progress", "completion", 1)],
    discoveryPoints: 15
  }),
  action({
    id: "action_colonize_planet",
    displayName: "Colonize Planet",
    category: "colonization",
    entityType: "planet",
    actionType: "colonize_planet",
    description: "Create a colony on an eligible surveyed planet.",
    baseDurationSeconds: 86400,
    minimumDurationSeconds: 14400,
    maximumDurationSeconds: 604800,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("research", "colonization", "Colonization research must be unlocked."), requirement("knowledge_state", "surveyed", "Planet must be surveyed."), requirement("ownership", "claim_or_access", "Player or civilization must be allowed to colonize.")],
    inputs: [transfer("economy", "ECON-LABOR", "start", 100), transfer("resource", "materials", "progress", null), transfer("time", "time", "progress")],
    outputs: [transfer("colony", "new_colony", "completion"), transfer("infrastructure", "founding_infrastructure", "completion")]
  }),
  action({
    id: "action_build_colony",
    displayName: "Build Colony",
    category: "construction",
    entityType: "colony",
    actionType: "build_colony",
    description: "Develop initial settlement infrastructure into an active colony.",
    baseDurationSeconds: 43200,
    minimumDurationSeconds: 7200,
    maximumDurationSeconds: 259200,
    queueRuleId: "queue_per_colony",
    queueScope: "per_colony",
    requirements: [requirement("ownership", "colony_site", "Colony site must be controlled."), requirement("population", "available_population", "Population must be available.", 1)],
    inputs: [transfer("economy", "ECON-LABOR", "progress", 75), transfer("time", "time", "progress")],
    outputs: [transfer("infrastructure", "colony_core", "completion")]
  }),
  action({
    id: "action_build_mining_outpost",
    displayName: "Build Mining Outpost",
    category: "mining",
    entityType: "planet",
    actionType: "build_mining_outpost",
    description: "Create a mining outpost on a surveyed world or body with mining suitability.",
    baseDurationSeconds: 28800,
    minimumDurationSeconds: 3600,
    maximumDurationSeconds: 172800,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("knowledge_state", "surveyed", "Planet must be surveyed."), requirement("planet_class", "supportsMining", "Opportunity profile must support mining.")],
    inputs: [transfer("economy", "ECON-LABOR", "progress", 50), transfer("time", "time", "progress")],
    outputs: [transfer("infrastructure", "mining_outpost", "completion"), transfer("resource", "mining_output", "completion")]
  }),
  action({
    id: "action_build_research_station",
    displayName: "Build Research Station",
    category: "research",
    entityType: "planet",
    actionType: "build_research_station",
    description: "Build a station to convert planetary science potential into research output.",
    baseDurationSeconds: 43200,
    minimumDurationSeconds: 7200,
    maximumDurationSeconds: 259200,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("knowledge_state", "surveyed", "Planet must be surveyed."), requirement("planet_class", "supportsResearchStations", "Opportunity profile must support research stations.")],
    outputs: [transfer("infrastructure", "research_station", "completion"), transfer("research", "planetary_research_output", "completion")]
  }),
  action({
    id: "action_build_orbital_refinery",
    displayName: "Build Orbital Refinery",
    category: "extraction",
    entityType: "planet",
    actionType: "build_orbital_refinery",
    description: "Construct orbital infrastructure for refining harvested planetary output.",
    baseDurationSeconds: 57600,
    minimumDurationSeconds: 10800,
    maximumDurationSeconds: 345600,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("technology", "orbital_infrastructure", "Orbital infrastructure technology must be available."), requirement("planet_class", "supportsOrbitalPlatforms", "Opportunity profile must support orbital platforms.")],
    outputs: [transfer("infrastructure", "orbital_refinery", "completion"), transfer("resource", "refined_output", "completion")]
  }),
  action({
    id: "action_build_gas_harvest_platform",
    displayName: "Gas Harvest Platform",
    category: "harvest",
    entityType: "planet",
    actionType: "build_gas_harvest_platform",
    description: "Build a platform for gas giant or volatile harvesting.",
    baseDurationSeconds: 57600,
    minimumDurationSeconds: 10800,
    maximumDurationSeconds: 345600,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("planet_class", "supportsHarvesting", "Opportunity profile must support harvesting."), requirement("knowledge_state", "surveyed", "Planet must be surveyed.")],
    outputs: [transfer("infrastructure", "gas_harvest_platform", "completion"), transfer("resource", "volatile_output", "completion")]
  }),
  action({
    id: "action_terraform_planet",
    displayName: "Terraform Planet",
    category: "terraforming",
    entityType: "planet",
    actionType: "terraform_planet",
    description: "Begin long-form terraforming on an eligible planet.",
    baseDurationSeconds: 604800,
    minimumDurationSeconds: 86400,
    maximumDurationSeconds: 5184000,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("research", "terraforming", "Terraforming research must be unlocked."), requirement("planet_class", "supportsTerraforming", "Opportunity profile must support terraforming.")],
    outputs: [transfer("infrastructure", "terraforming_project", "completion"), transfer("knowledge", "terraforming_progress", "completion")]
  }),
  action({
    id: "action_research_technology",
    displayName: "Research Technology",
    category: "research",
    entityType: "research",
    actionType: "research_technology",
    description: "Advance a research node over time using research output and prerequisites.",
    baseDurationSeconds: 14400,
    minimumDurationSeconds: 1800,
    maximumDurationSeconds: 604800,
    queueRuleId: "queue_global",
    queueScope: "global",
    requirements: [requirement("research", "prerequisite_research", "Prerequisite research must be complete.")],
    inputs: [transfer("economy", "ECON-RESEARCH", "progress", null), transfer("time", "time", "progress")],
    outputs: [transfer("research", "completed_research", "completion")]
  }),
  action({
    id: "action_construct_building",
    displayName: "Construct Building",
    category: "build",
    entityType: "building",
    actionType: "construct_building",
    description: "Construct a building from canonical building definitions.",
    baseDurationSeconds: 7200,
    minimumDurationSeconds: 900,
    maximumDurationSeconds: 259200,
    queueRuleId: "queue_per_colony",
    queueScope: "per_colony",
    requirements: [requirement("building", "building_definition", "Building definition must exist."), requirement("ownership", "build_location", "Build location must be owned or available.")],
    inputs: [transfer("economy", "ECON-LABOR", "progress", null), transfer("resource", "construction_materials", "progress", null)],
    outputs: [transfer("building", "constructed_building", "completion")]
  }),
  action({
    id: "action_upgrade_building",
    displayName: "Upgrade Building",
    category: "upgrade",
    entityType: "building",
    actionType: "upgrade_building",
    description: "Upgrade an existing building using its canonical upgrade path.",
    baseDurationSeconds: 10800,
    minimumDurationSeconds: 1200,
    maximumDurationSeconds: 345600,
    queueRuleId: "queue_per_colony",
    queueScope: "per_colony",
    requirements: [requirement("building", "existing_building", "Building must exist."), requirement("research", "upgrade_research", "Required upgrade research must be complete.")],
    inputs: [transfer("economy", "ECON-LABOR", "progress", null), transfer("resource", "upgrade_materials", "progress", null)],
    outputs: [transfer("building", "upgraded_building", "completion")]
  }),
  action({
    id: "action_manufacture_goods",
    displayName: "Manufacture Goods",
    category: "manufacture",
    entityType: "resource",
    actionType: "manufacture_goods",
    description: "Convert inputs into manufactured goods through a production chain.",
    baseDurationSeconds: 3600,
    minimumDurationSeconds: 300,
    maximumDurationSeconds: 86400,
    queueRuleId: "queue_per_colony",
    queueScope: "per_colony",
    requirements: [requirement("building", "manufacturing_building", "A valid manufacturing building must exist.")],
    inputs: [transfer("resource", "production_inputs", "progress", null), transfer("time", "time", "progress")],
    outputs: [transfer("resource", "manufactured_goods", "completion")]
  }),
  action({
    id: "action_create_trade_route",
    displayName: "Create Trade Route",
    category: "trade",
    entityType: "trade_route",
    actionType: "create_trade_route",
    description: "Create a trade route between valid markets.",
    baseDurationSeconds: 7200,
    minimumDurationSeconds: 900,
    maximumDurationSeconds: 172800,
    queueRuleId: "queue_global",
    queueScope: "global",
    requirements: [requirement("technology", "trade_routes", "Trade route technology must be available."), requirement("ownership", "market_access", "Origin and destination markets must be accessible.")],
    outputs: [transfer("trade_route", "new_trade_route", "completion")]
  }),
  action({
    id: "action_fleet_travel",
    displayName: "Fleet Travel",
    category: "travel",
    entityType: "fleet",
    actionType: "fleet_travel",
    description: "Move a fleet through unlocked travel ranges.",
    baseDurationSeconds: 10800,
    minimumDurationSeconds: 600,
    maximumDurationSeconds: 604800,
    queueRuleId: "queue_global",
    queueScope: "global",
    requirements: [requirement("technology", "travel_range", "Destination must be inside unlocked travel range."), requirement("resource", "fuel", "Required fuel must be available.", null)],
    inputs: [transfer("resource", "fuel", "start", null), transfer("time", "time", "progress")],
    outputs: [transfer("knowledge", "fleet_arrival", "completion")]
  }),
  action({
    id: "action_analyze_artifact",
    displayName: "Analyze Artifact",
    category: "analyze",
    entityType: "artifact",
    actionType: "analyze_artifact",
    description: "Analyze a discovered artifact for knowledge, research, or story outcomes.",
    baseDurationSeconds: 14400,
    minimumDurationSeconds: 1800,
    maximumDurationSeconds: 259200,
    queueRuleId: "queue_global",
    queueScope: "global",
    requirements: [requirement("discovery", "artifact_discovered", "Artifact must be discovered.")],
    outputs: [transfer("knowledge", "artifact_analysis", "completion"), transfer("research", "artifact_research", "completion")]
  }),
  action({
    id: "action_excavate_ruins",
    displayName: "Excavate Ruins",
    category: "discovery",
    entityType: "planet",
    actionType: "excavate_ruins",
    description: "Excavate ruins discovered through planet survey.",
    baseDurationSeconds: 43200,
    minimumDurationSeconds: 7200,
    maximumDurationSeconds: 604800,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("discovery", "ancient_ruins", "Ancient ruins must be discovered."), requirement("knowledge_state", "surveyed", "Planet must be surveyed.")],
    outputs: [transfer("artifact", "excavated_artifacts", "completion"), transfer("discovery", "ruin_discovery_progress", "completion", 1)],
    discoveryPoints: 20
  }),
  action({
    id: "action_planet_catalog",
    displayName: "Planet Catalog",
    category: "catalog",
    entityType: "planet",
    actionType: "planet_catalog",
    description: "Catalog a surveyed planet without selecting development.",
    baseDurationSeconds: 600,
    minimumDurationSeconds: 60,
    maximumDurationSeconds: 3600,
    queueRuleId: "queue_per_planet",
    queueScope: "per_planet",
    requirements: [requirement("knowledge_state", "surveyed", "Planet must be surveyed.")],
    outputs: [transfer("discovery", "catalog_record", "completion", 1), transfer("knowledge", "planet_catalog_entry", "completion")],
    canAutomate: false,
    automationTier: "none",
    aiAgentSupport: false,
    discoveryPoints: 10
  }),
  action({
    id: "action_harvest_resources",
    displayName: "Harvest Resources",
    category: "harvest",
    entityType: "resource",
    actionType: "harvest_resources",
    description: "Harvest resources from eligible planets, colonies, or infrastructure.",
    baseDurationSeconds: 3600,
    minimumDurationSeconds: 300,
    maximumDurationSeconds: 86400,
    queueRuleId: "queue_multiple",
    queueScope: "multiple",
    requirements: [requirement("resource", "harvestable_resource", "A harvestable resource must be available.")],
    inputs: [transfer("time", "time", "progress")],
    outputs: [transfer("resource", "harvested_resources", "completion")]
  }),
  action({
    id: "action_move_population",
    displayName: "Move Population",
    category: "population",
    entityType: "civilization",
    actionType: "move_population",
    description: "Move population between eligible owned locations.",
    baseDurationSeconds: 1800,
    minimumDurationSeconds: 300,
    maximumDurationSeconds: 172800,
    queueRuleId: "queue_global",
    queueScope: "global",
    requirements: [requirement("population", "available_population", "Population must be available."), requirement("ownership", "destination_access", "Destination must be accessible.")],
    inputs: [transfer("population", "population_source", "start", null), transfer("time", "time", "progress")],
    outputs: [transfer("population", "population_destination", "completion")]
  }),
  action({
    id: "action_move_labor",
    displayName: "Move Labor",
    category: "population",
    entityType: "civilization",
    actionType: "move_labor",
    description: "Reassign labor/workforce capacity between eligible queues or locations.",
    baseDurationSeconds: 900,
    minimumDurationSeconds: 60,
    maximumDurationSeconds: 86400,
    queueRuleId: "queue_global",
    queueScope: "global",
    requirements: [requirement("labor", "available_labor", "Labor or workforce must be available.")],
    inputs: [transfer("economy", "ECON-LABOR", "start", null), transfer("time", "time", "progress")],
    outputs: [transfer("knowledge", "labor_assignment_updated", "completion")]
  }),
  action({
    id: "action_upgrade_ai_agent",
    displayName: "Upgrade AI Agent",
    category: "ai",
    entityType: "ai_agent",
    actionType: "upgrade_ai_agent",
    description: "Upgrade the AI Agent's automation support through canonical AI/automation progression.",
    baseDurationSeconds: 7200,
    minimumDurationSeconds: 900,
    maximumDurationSeconds: 172800,
    queueRuleId: "queue_global",
    queueScope: "global",
    requirements: [requirement("ai_agent", "unlocked_ai_agent", "AI Agent must be unlocked."), requirement("research", "automation_research", "Required automation research must be complete.")],
    inputs: [transfer("economy", "ECON-RESEARCH", "progress", null), transfer("time", "time", "progress")],
    outputs: [transfer("knowledge", "ai_agent_upgrade", "completion")]
  })
];

export const canonicalActionSystem: ActionSystemContract = {
  id: "canonical_action_system_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-CANONICAL-ACTION-FRAMEWORK",
  timeActionContractId: timeActionContract.id,
  ownership: {
    studioOwns: ["action definitions", "categories", "state machine", "queue rules", "duration contract references", "requirements schema", "inputs/outputs schema", "modifier slots", "automation rules", "presentation intent"],
    gameOwns: ["active action instances", "player queues", "save records", "server-authoritative progress", "runtime UI rendering", "purchase settlement"]
  },
  actionCategories,
  actionStates,
  actionDefinitions,
  actionQueueRules,
  accelerationRules,
  automationRules,
  actionPresentation: [
    { mode: "circular_progress", iconKey: "action_progress_circle", statusBadge: "Progress", completionAnimationKey: null, notes: "Useful for compact active actions." },
    { mode: "linear_progress", iconKey: "action_progress_bar", statusBadge: "Progress", completionAnimationKey: null, notes: "Useful for long-running task rows." },
    { mode: "countdown", iconKey: "action_countdown", statusBadge: "Time", completionAnimationKey: null, notes: "Displays remaining time." },
    { mode: "queue_card", iconKey: "action_queue_card", statusBadge: "Queued", completionAnimationKey: null, notes: "Displays queue ownership and status." },
    { mode: "status_badge", iconKey: "action_status_badge", statusBadge: "Status", completionAnimationKey: null, notes: "Compact state treatment." }
  ],
  validationRules: [
    "Every Action has an ID, duration, requirements, outputs, state machine, history, queue rules, and automation metadata.",
    "Every Action references time_action_contract_v1.",
    "Every Action uses the canonical Action state machine.",
    "Premium Crystals accelerate only and never bypass requirements.",
    "Studio publishes presentation intent but no React, Roblox, or engine rendering code."
  ]
};

export function validateActionSystem(system: ActionSystemContract = canonicalActionSystem, timeContract: TimeActionContract = timeActionContract): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const categoryIds = new Set(system.actionCategories.map((category) => category.id));
  const queueRuleIds = new Set(system.actionQueueRules.map((rule) => rule.id));
  const stateIds = system.actionStates.map((state) => state.id);
  const expectedStates = ["idle", "queued", "waiting", "preparing", "running", "paused", "blocked", "failed", "cancelled", "completed", "archived"];

  if (system.timeActionContractId !== timeContract.id) {
    issues.push({ severity: "error", code: "action_system_time_contract_missing", message: "Action System must reference the shared Time Action Contract.", records: [system.id, system.timeActionContractId] });
  }

  if (stateIds.join("|") !== expectedStates.join("|")) {
    issues.push({ severity: "error", code: "action_state_machine_invalid", message: "Action System state machine must match the canonical state order.", records: stateIds });
  }

  for (const category of categoryNames) {
    const id = slug(category);
    if (!categoryIds.has(id)) {
      issues.push({ severity: "error", code: "action_category_missing", message: "Action System is missing a required category.", records: [id] });
    }
  }

  const duplicateActionIds = actionDefinitions.map((definition) => definition.id).filter((id, index, ids) => ids.indexOf(id) !== index);
  if (duplicateActionIds.length) {
    issues.push({ severity: "error", code: "duplicate_action_id", message: "Action definitions must use unique IDs.", records: duplicateActionIds });
  }

  for (const definition of system.actionDefinitions) {
    if (!definition.id || !definition.displayName) {
      issues.push({ severity: "error", code: "action_identity_missing", message: "Every Action needs an ID and displayName.", records: [definition.id || "(missing)"] });
    }
    if (!categoryIds.has(definition.category)) {
      issues.push({ severity: "error", code: "action_category_invalid", message: "Action category must resolve.", records: [definition.id, definition.category] });
    }
    if (definition.duration.timeActionContractId !== timeContract.id) {
      issues.push({ severity: "error", code: "action_time_contract_missing", message: "Every Action duration must reference Time Action Contract.", records: [definition.id, definition.duration.timeActionContractId] });
    }
    if (definition.duration.baseDurationSeconds <= 0 || definition.duration.baseDurationSeconds < definition.duration.minimumDurationSeconds || definition.duration.baseDurationSeconds > definition.duration.maximumDurationSeconds) {
      issues.push({ severity: "error", code: "action_duration_invalid", message: "Action duration must be positive and within min/max bounds.", records: [definition.id] });
    }
    if (!definition.requirements.length) {
      issues.push({ severity: "error", code: "action_requirements_missing", message: "Every Action must publish requirements.", records: [definition.id] });
    }
    if (!definition.outputs.length) {
      issues.push({ severity: "error", code: "action_outputs_missing", message: "Every Action must publish outputs.", records: [definition.id] });
    }
    if (!queueRuleIds.has(definition.queueBehavior.queueRuleId)) {
      issues.push({ severity: "error", code: "action_queue_rule_missing", message: "Action queueBehavior.queueRuleId must resolve.", records: [definition.id, definition.queueBehavior.queueRuleId] });
    }
    if (definition.modifiers.premiumCrystalAcceleration.policy !== "accelerate_only" || definition.modifiers.premiumCrystalAcceleration.canUnlockUnavailableActions !== false) {
      issues.push({ severity: "error", code: "action_premium_policy_invalid", message: "Premium Crystals must accelerate only and never unlock unavailable Actions.", records: [definition.id] });
    }
    if (!definition.events.includes("action_started") || !definition.events.includes("action_completed")) {
      issues.push({ severity: "error", code: "action_events_missing", message: "Action events must include started and completed events.", records: [definition.id] });
    }
    if (!definition.history.started || !definition.history.completed || !definition.history.cancelled || !definition.history.failed || !definition.history.accelerated || !definition.history.automated) {
      issues.push({ severity: "error", code: "action_history_missing", message: "Action history must track started, completed, cancelled, failed, accelerated, and automated states.", records: [definition.id] });
    }
    if (!definition.automation.automationRules.length) {
      issues.push({ severity: "error", code: "action_automation_missing", message: "Every Action must publish automation rules.", records: [definition.id] });
    }
  }

  for (const id of ["action_send_probe", "action_survey_planet", "action_colonize_planet", "action_build_colony", "action_build_mining_outpost", "action_build_research_station", "action_build_orbital_refinery", "action_build_gas_harvest_platform", "action_terraform_planet", "action_research_technology", "action_construct_building", "action_upgrade_building", "action_manufacture_goods", "action_create_trade_route", "action_fleet_travel", "action_analyze_artifact", "action_excavate_ruins", "action_planet_catalog"]) {
    if (!system.actionDefinitions.some((definition) => definition.id === id)) {
      issues.push({ severity: "error", code: "required_gameplay_action_missing", message: "Action System is missing a required gameplay action.", records: [id] });
    }
  }

  return issues;
}
