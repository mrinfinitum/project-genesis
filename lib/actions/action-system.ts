import { timeActionContract } from "@/lib/planets/exploration-progression";
import type {
  ActionAccelerationPolicy,
  ActionAutomationPolicy,
  ActionDefinition,
  ActionDurationDefinition,
  ActionEventDefinition,
  ActionFailureCause,
  ActionPhaseTemplate,
  ActionPresentation,
  ActionPresentationContract,
  ActionQueueRule,
  ActionRequirement,
  ActionSystemCategory,
  ActionSystemContract,
  ActionSystemState,
  ActionTransfer,
  ImportIssue,
  TimeActionContract
} from "@/types/runtime";

const actionCategoryIds = [
  "exploration",
  "probe",
  "scan",
  "survey",
  "catalog",
  "discovery",
  "analysis",
  "archaeology",
  "research",
  "construction",
  "building",
  "upgrade",
  "manufacturing",
  "mining",
  "harvesting",
  "extraction",
  "colonization",
  "terraforming",
  "logistics",
  "resource_transfer",
  "population",
  "trade",
  "travel",
  "ai_automation",
  "repair",
  "administration",
  "story",
  "future_military"
] as const;

const modifierOrder = [
  "base_duration",
  "target_environment_modifiers",
  "distance_logistics_modifiers",
  "research_modifiers",
  "building_upgrade_modifiers",
  "civilization_identity_modifiers",
  "ai_agent_automation_modifiers",
  "temporary_modifiers",
  "premium_acceleration",
  "minimum_duration_clamp"
];

const presentationContractIds = [
  "ActionCard",
  "ActionQueue",
  "ActionProgress",
  "ActionPhaseStepper",
  "ActionRequirementList",
  "ActionInputSummary",
  "ActionOutputSummary",
  "ActionModifierBreakdown",
  "ActionAccelerationPrompt",
  "ActionCompletionNotification",
  "ActionHistoryEntry"
] as const;

function titleFromId(id: string) {
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const actionCategories: ActionSystemCategory[] = actionCategoryIds.map((id, index) => ({
  id,
  displayName: id === "future_military" ? "Future Military" : titleFromId(id),
  description: `${titleFromId(id)} actions use the shared canonical Action System contract.`,
  displayOrder: index + 1,
  future: id === "future_military"
}));

export const actionStates: ActionSystemState[] = [
  {
    id: "unavailable",
    displayName: "Unavailable",
    terminal: false,
    historyEvent: false,
    allowedTransitions: ["ready", "archived"],
    resumable: false,
    queueBehavior: "not_queueable",
    progressBehavior: "none",
    presentationToken: "locked",
    description: "Action exists but requirements, knowledge, ownership, range, or story gates are not satisfied."
  },
  {
    id: "ready",
    displayName: "Ready",
    terminal: false,
    historyEvent: false,
    allowedTransitions: ["queued", "preparing", "archived"],
    resumable: false,
    queueBehavior: "queueable",
    progressBehavior: "none",
    presentationToken: "ready",
    description: "Action is available and can be started or queued."
  },
  {
    id: "queued",
    displayName: "Queued",
    terminal: false,
    historyEvent: true,
    allowedTransitions: ["waiting", "preparing", "cancelled"],
    resumable: true,
    queueBehavior: "queueable",
    progressBehavior: "pending",
    presentationToken: "queued",
    description: "Action is waiting in an eligible queue."
  },
  {
    id: "waiting",
    displayName: "Waiting",
    terminal: false,
    historyEvent: true,
    allowedTransitions: ["preparing", "blocked", "cancelled"],
    resumable: true,
    queueBehavior: "queueable",
    progressBehavior: "pending",
    presentationToken: "waiting",
    description: "Action is queued but waiting on capacity, dependency, travel window, or server verification."
  },
  {
    id: "preparing",
    displayName: "Preparing",
    terminal: false,
    historyEvent: true,
    allowedTransitions: ["in_progress", "paused", "blocked", "cancelled"],
    resumable: true,
    queueBehavior: "active",
    progressBehavior: "time_based",
    presentationToken: "preparing",
    description: "Action has begun setup work before active execution."
  },
  {
    id: "in_progress",
    displayName: "In Progress",
    terminal: false,
    historyEvent: true,
    allowedTransitions: ["paused", "blocked", "completed", "failed", "cancelled"],
    resumable: true,
    queueBehavior: "active",
    progressBehavior: "time_based",
    presentationToken: "active",
    description: "Action is actively progressing over authoritative time."
  },
  {
    id: "paused",
    displayName: "Paused",
    terminal: false,
    historyEvent: true,
    allowedTransitions: ["in_progress", "blocked", "cancelled"],
    resumable: true,
    queueBehavior: "suspended",
    progressBehavior: "held",
    presentationToken: "paused",
    description: "Action progress is suspended and may resume."
  },
  {
    id: "blocked",
    displayName: "Blocked",
    terminal: false,
    historyEvent: true,
    allowedTransitions: ["waiting", "in_progress", "failed", "cancelled"],
    resumable: true,
    queueBehavior: "suspended",
    progressBehavior: "held",
    presentationToken: "blocked",
    description: "Action cannot proceed until a blocking condition clears."
  },
  {
    id: "completed",
    displayName: "Completed",
    terminal: true,
    historyEvent: true,
    allowedTransitions: ["archived"],
    resumable: false,
    queueBehavior: "terminal",
    progressBehavior: "terminal",
    presentationToken: "complete",
    description: "Action completed and emitted canonical completion effects."
  },
  {
    id: "failed",
    displayName: "Failed",
    terminal: true,
    historyEvent: true,
    allowedTransitions: ["archived"],
    resumable: false,
    queueBehavior: "terminal",
    progressBehavior: "terminal",
    presentationToken: "failed",
    description: "Action ended unsuccessfully."
  },
  {
    id: "cancelled",
    displayName: "Cancelled",
    terminal: true,
    historyEvent: true,
    allowedTransitions: ["archived"],
    resumable: false,
    queueBehavior: "terminal",
    progressBehavior: "terminal",
    presentationToken: "cancelled",
    description: "Action was intentionally cancelled."
  },
  {
    id: "archived",
    displayName: "Archived",
    terminal: true,
    historyEvent: true,
    allowedTransitions: [],
    resumable: false,
    queueBehavior: "terminal",
    progressBehavior: "terminal",
    presentationToken: "archived",
    description: "Action history is retained by the Game and removed from active action views."
  }
];

export const actionDurationDefinitions: ActionDurationDefinition[] = [
  { id: "duration_probe_short", displayName: "Probe Short", baseDurationSeconds: 1800, minimumDurationSeconds: 300, maximumDurationSeconds: 7200, offlinePolicy: "eligible_with_authoritative_elapsed_time", modifierPolicy: "canonical_modifier_order", accelerationPolicy: "protected_premium_acceleration", startPolicy: "reserve_inputs_on_start", completionPolicy: "emit_completion_effects_once", authoritativeTimePolicy: "game_server_authoritative" },
  { id: "duration_standard", displayName: "Standard Action", baseDurationSeconds: 7200, minimumDurationSeconds: 900, maximumDurationSeconds: 28800, offlinePolicy: "eligible_with_authoritative_elapsed_time", modifierPolicy: "canonical_modifier_order", accelerationPolicy: "protected_premium_acceleration", startPolicy: "reserve_inputs_on_start", completionPolicy: "emit_completion_effects_once", authoritativeTimePolicy: "game_server_authoritative" },
  { id: "duration_project", displayName: "Project", baseDurationSeconds: 43200, minimumDurationSeconds: 3600, maximumDurationSeconds: 259200, offlinePolicy: "eligible_with_authoritative_elapsed_time", modifierPolicy: "canonical_modifier_order", accelerationPolicy: "protected_premium_acceleration", startPolicy: "reserve_inputs_on_start", completionPolicy: "emit_completion_effects_once", authoritativeTimePolicy: "game_server_authoritative" },
  { id: "duration_colony", displayName: "Colony Foundation", baseDurationSeconds: 86400, minimumDurationSeconds: 14400, maximumDurationSeconds: 604800, offlinePolicy: "eligible_with_authoritative_elapsed_time", modifierPolicy: "canonical_modifier_order", accelerationPolicy: "protected_premium_acceleration", startPolicy: "reserve_inputs_on_start", completionPolicy: "emit_completion_effects_once", authoritativeTimePolicy: "game_server_authoritative" },
  { id: "duration_terraforming", displayName: "Terraforming Stage", baseDurationSeconds: 604800, minimumDurationSeconds: 86400, maximumDurationSeconds: 2592000, offlinePolicy: "eligible_with_authoritative_elapsed_time", modifierPolicy: "canonical_modifier_order", accelerationPolicy: "limited_protected_acceleration", startPolicy: "reserve_inputs_on_start", completionPolicy: "emit_completion_effects_once", authoritativeTimePolicy: "game_server_authoritative" }
];

export const actionPhaseTemplates: ActionPhaseTemplate[] = [
  { id: "planning", displayName: "Planning", order: 1, progressWeight: 5, canPause: true, canFail: false },
  { id: "allocation", displayName: "Allocation", order: 2, progressWeight: 10, canPause: true, canFail: true },
  { id: "preparation", displayName: "Preparation", order: 3, progressWeight: 10, canPause: true, canFail: true },
  { id: "transport", displayName: "Transport", order: 4, progressWeight: 10, canPause: true, canFail: true },
  { id: "travel", displayName: "Travel", order: 5, progressWeight: 20, canPause: true, canFail: true },
  { id: "scanning", displayName: "Scanning", order: 6, progressWeight: 25, canPause: true, canFail: true },
  { id: "survey", displayName: "Survey", order: 7, progressWeight: 30, canPause: true, canFail: true },
  { id: "construction", displayName: "Construction", order: 8, progressWeight: 45, canPause: true, canFail: true },
  { id: "commissioning", displayName: "Commissioning", order: 9, progressWeight: 15, canPause: true, canFail: true },
  { id: "stabilization", displayName: "Stabilization", order: 10, progressWeight: 15, canPause: true, canFail: true },
  { id: "return", displayName: "Return", order: 11, progressWeight: 10, canPause: true, canFail: true },
  { id: "completion", displayName: "Completion", order: 12, progressWeight: 5, canPause: false, canFail: false }
];

export const actionQueueRules: ActionQueueRule[] = [
  { id: "queue_global", displayName: "Global Queue", queueScope: "global", maxConcurrency: 3, capacitySource: "civilization_action_capacity", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["global_project"], notes: "Civilization-wide action queue." },
  { id: "queue_civilization", displayName: "Civilization Queue", queueScope: "civilization", maxConcurrency: 2, capacitySource: "civilization_project_slots", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["civilization_project"], notes: "Civilization identity, administration, and milestone queue." },
  { id: "queue_colony", displayName: "Colony Queue", queueScope: "colony", maxConcurrency: 2, capacitySource: "colony_project_slots", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["colony_development"], notes: "Each colony owns local construction and development actions." },
  { id: "queue_planet", displayName: "Planet Queue", queueScope: "planet", maxConcurrency: 1, capacitySource: "planet_action_slot", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["planet_surface"], notes: "Planet-level survey, development, and preservation actions." },
  { id: "queue_research", displayName: "Research Queue", queueScope: "research", maxConcurrency: 1, capacitySource: "research_slots", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["research_focus"], notes: "Research actions progress through canonical research slots." },
  { id: "queue_construction", displayName: "Construction Queue", queueScope: "construction", maxConcurrency: 2, capacitySource: "construction_slots", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["construction"], notes: "Buildings, outposts, orbital platforms, and infrastructure." },
  { id: "queue_probe", displayName: "Probe Queue", queueScope: "probe", maxConcurrency: 3, capacitySource: "probe_capacity", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["probe"], notes: "Probe launch, travel, and scan sequencing." },
  { id: "queue_survey", displayName: "Survey Queue", queueScope: "survey", maxConcurrency: 2, capacitySource: "survey_team_capacity", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["survey"], notes: "Survey, catalog, analysis, and archaeological actions." },
  { id: "queue_manufacturing", displayName: "Manufacturing Queue", queueScope: "manufacturing", maxConcurrency: 2, capacitySource: "manufacturing_slots", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["manufacturing"], notes: "Manufacturing and item production actions." },
  { id: "queue_logistics", displayName: "Logistics Queue", queueScope: "logistics", maxConcurrency: 3, capacitySource: "logistics_capacity", supportsReorder: true, supportsPriority: true, supportsPause: true, supportsCancel: true, autoStart: true, conflictGroups: ["logistics"], notes: "Transfer, trade route, travel, and supply actions." }
];

export const actionAccelerationPolicies: ActionAccelerationPolicy[] = [
  { id: "acceleration_fixed_reduction", displayName: "Fixed Reduction", accelerationType: "fixed_reduction", serverAuthoritativeBalance: true, serverCalculatedCost: true, approvedTransactionReasonCodes: ["premium_action_acceleration"], idempotencyRequired: true, minimumDurationClamp: true, canBypassRequirements: false },
  { id: "acceleration_percentage_reduction", displayName: "Percentage Reduction", accelerationType: "percentage_reduction", serverAuthoritativeBalance: true, serverCalculatedCost: true, approvedTransactionReasonCodes: ["premium_action_acceleration"], idempotencyRequired: true, minimumDurationClamp: true, canBypassRequirements: false },
  { id: "acceleration_speed_multiplier", displayName: "Temporary Speed Multiplier", accelerationType: "temporary_speed_multiplier", serverAuthoritativeBalance: true, serverCalculatedCost: true, approvedTransactionReasonCodes: ["premium_action_speed_multiplier"], idempotencyRequired: true, minimumDurationClamp: true, canBypassRequirements: false },
  { id: "acceleration_instant_completion", displayName: "Eligible Instant Completion", accelerationType: "eligible_instant_completion", serverAuthoritativeBalance: true, serverCalculatedCost: true, approvedTransactionReasonCodes: ["premium_action_instant_completion"], idempotencyRequired: true, minimumDurationClamp: true, canBypassRequirements: false }
];

export const actionAutomationPolicies: ActionAutomationPolicy[] = [
  { id: "automation_manual", displayName: "Manual Only", aiAgentRequirement: "none", autoQueue: false, autoStart: false, autoRepeat: false, playerConfirmation: "always", premiumSpendPermission: "never" },
  { id: "automation_basic_ai", displayName: "Basic AI Assistance", aiAgentRequirement: "any_unlocked_ai_agent", autoQueue: true, autoStart: false, autoRepeat: false, playerConfirmation: "start_required", premiumSpendPermission: "never" },
  { id: "automation_advanced_ai", displayName: "Advanced AI Automation", aiAgentRequirement: "automation_capable_ai_agent", autoQueue: true, autoStart: true, autoRepeat: false, playerConfirmation: "policy_required", premiumSpendPermission: "never" },
  { id: "automation_repeatable_ai", displayName: "Repeatable AI Automation", aiAgentRequirement: "specialized_ai_agent", autoQueue: true, autoStart: true, autoRepeat: true, playerConfirmation: "policy_required", premiumSpendPermission: "explicit_player_authorization" }
];

export const actionFailureCauses: ActionFailureCause[] = [
  { id: "insufficient_resources", displayName: "Insufficient Resources", refundPolicy: "unspent_inputs_refunded", retainedProgressPolicy: "progress_lost" },
  { id: "requirements_changed", displayName: "Requirements Changed", refundPolicy: "unspent_inputs_refunded", retainedProgressPolicy: "retain_if_resumable" },
  { id: "target_invalid", displayName: "Target Invalid", refundPolicy: "full_if_not_started_partial_if_started", retainedProgressPolicy: "progress_lost" },
  { id: "environmental_failure", displayName: "Environmental Failure", refundPolicy: "partial", retainedProgressPolicy: "retain_if_repairable" },
  { id: "server_verification_failed", displayName: "Server Verification Failed", refundPolicy: "full", retainedProgressPolicy: "progress_lost" },
  { id: "player_cancelled", displayName: "Player Cancelled", refundPolicy: "unspent_inputs_refunded", retainedProgressPolicy: "retain_by_policy" }
];

export const actionEventDefinitions: ActionEventDefinition[] = [
  "created",
  "queued",
  "started",
  "phase_started",
  "paused",
  "resumed",
  "blocked",
  "accelerated",
  "automated",
  "completed",
  "failed",
  "cancelled",
  "reward_claimed"
].map((id) => ({ id: `action_${id}`, displayName: titleFromId(id), gameOwnsPlayerHistory: true }));

export const actionPresentationContracts: ActionPresentationContract[] = presentationContractIds.map((id) => ({
  id,
  displayName: id.replace(/([A-Z])/g, " $1").trim(),
  rendererIndependent: true,
  semanticFields: ["actionId", "state", "requirements", "inputs", "outputs", "duration", "phases", "modifiers"],
  notes: "Studio publishes semantic presentation intent only. Clients own coordinates, React, Roblox UI, animation, and rendering."
}));

export const actionPresentation: ActionPresentation[] = [
  { mode: "queue_card", iconKey: "action_queue_card", statusBadge: "Action", completionAnimationKey: null, notes: "Default card treatment for queued and available actions." },
  { mode: "linear_progress", iconKey: "action_linear_progress", statusBadge: "Progress", completionAnimationKey: null, notes: "Renderer-independent progress bar intent." },
  { mode: "circular_progress", iconKey: "action_circular_progress", statusBadge: "Progress", completionAnimationKey: null, notes: "Renderer-independent compact progress intent." },
  { mode: "countdown", iconKey: "action_countdown", statusBadge: "Timer", completionAnimationKey: null, notes: "Display remaining authoritative duration." },
  { mode: "status_badge", iconKey: "action_status_badge", statusBadge: "Status", completionAnimationKey: null, notes: "Compact status token for action lists and history." }
];

const durationById = new Map(actionDurationDefinitions.map((duration) => [duration.id, duration]));

function requirement(type: ActionRequirement["type"], id: string, condition: string, quantity: number | null = null): ActionRequirement {
  return {
    type,
    id,
    quantity,
    condition,
    blocking: true,
    reasonCode: `requires_${type}_${id}`.replace(/[^a-z0-9_]+/gi, "_").toLowerCase(),
    notes: "Canonical action requirement. The Game evaluates player-specific state and reports this reason code on failure."
  };
}

function transfer(type: ActionTransfer["type"], id: string, timing: ActionTransfer["timing"], quantity: number | null = null): ActionTransfer {
  const isInput = timing !== "completion";
  return {
    type,
    id,
    quantity,
    timing,
    reservationBehavior: isInput ? "reserve_on_start" : "none",
    consumptionBehavior: isInput ? "consume_over_time" : "none",
    cancellationRefund: isInput ? "unspent_only" : "none",
    phaseBehavior: timing === "start" ? "start_phase" : timing === "progress" ? "progress_phases" : "completion_phase",
    notes: "Canonical transfer contract. The Game applies player-specific quantities and persistence."
  };
}

function action(input: {
  id: string;
  displayName: string;
  category: string;
  entityType: ActionDefinition["entityType"];
  targetTypes?: string[];
  description: string;
  durationDefinitionId: string;
  queueRuleId: string;
  requirements: ActionRequirement[];
  inputs?: ActionTransfer[];
  outputs: ActionTransfer[];
  phaseTemplateIds?: string[];
  automationPolicyId?: string;
  canAutomate?: boolean;
  aiAgentSupport?: boolean;
  discoveryPoints?: number;
  publicationStatus?: ActionDefinition["publicationStatus"];
  related?: Partial<ActionDefinition["relatedCanonicalContent"]>;
}): ActionDefinition {
  const duration = durationById.get(input.durationDefinitionId);
  if (!duration) throw new Error(`Unknown action duration definition ${input.durationDefinitionId}.`);
  const queue = actionQueueRules.find((rule) => rule.id === input.queueRuleId);
  if (!queue) throw new Error(`Unknown action queue rule ${input.queueRuleId}.`);
  const automationPolicyId = input.automationPolicyId ?? (input.canAutomate === false ? "automation_manual" : "automation_basic_ai");
  const automationPolicy = actionAutomationPolicies.find((policy) => policy.id === automationPolicyId);
  if (!automationPolicy) throw new Error(`Unknown action automation policy ${automationPolicyId}.`);
  const phaseTemplateIds = input.phaseTemplateIds ?? ["planning", "allocation", "preparation", "completion"];
  return {
    id: input.id,
    displayName: input.displayName,
    category: input.category,
    description: input.description,
    targetTypes: input.targetTypes ?? [input.entityType],
    entityType: input.entityType,
    actionType: input.id,
    requirements: input.requirements,
    inputs: input.inputs ?? [transfer("time", "time", "progress")],
    outputs: input.outputs,
    duration: {
      timeActionContractId: timeActionContract.id,
      durationDefinitionId: duration.id,
      baseDurationSeconds: duration.baseDurationSeconds,
      minimumDurationSeconds: duration.minimumDurationSeconds,
      maximumDurationSeconds: duration.maximumDurationSeconds,
      offlinePolicy: duration.offlinePolicy,
      modifierPolicy: duration.modifierPolicy,
      accelerationPolicy: duration.accelerationPolicy,
      startPolicy: duration.startPolicy,
      completionPolicy: duration.completionPolicy,
      authoritativeTimePolicy: duration.authoritativeTimePolicy,
      phaseTemplateIds,
      estimatedCompletionRule: "estimatedCompletion = authoritativeStartedAt + adjustedRemainingDuration",
      progressRule: "progressPercent = elapsedAdjustedDuration / totalAdjustedDuration"
    },
    phases: phaseTemplateIds,
    modifiers: {
      modifierOrder,
      researchModifierIds: ["action_speed_research"],
      aiAgentModifierIds: input.aiAgentSupport === false ? [] : ["ai_agent_timer_assist"],
      automationModifierIds: input.canAutomate === false ? [] : ["automation_efficiency"],
      buildingModifierIds: ["specialized_building_bonus"],
      civilizationModifierIds: ["civilization_identity_action_bonus"],
      planetModifierIds: input.entityType === "planet" || input.entityType === "celestial_body" || input.entityType === "colony" ? ["planet_opportunity_modifier", "environmental_hazard_modifier"] : [],
      temporaryEventModifierIds: ["temporary_event_action_modifier"],
      premiumCrystalAcceleration: {
        allowed: true,
        policy: "accelerate_only",
        canUnlockUnavailableActions: false
      }
    },
    automation: {
      canAutomate: input.canAutomate ?? automationPolicy.id !== "automation_manual",
      automationTier: automationPolicy.id === "automation_repeatable_ai" ? "specialized" : automationPolicy.id === "automation_advanced_ai" ? "advanced" : automationPolicy.id === "automation_basic_ai" ? "basic" : "none",
      aiAgentSupport: input.aiAgentSupport ?? automationPolicy.id !== "automation_manual",
      automationPolicyId,
      autoQueue: automationPolicy.autoQueue,
      autoStart: automationPolicy.autoStart,
      autoRepeat: automationPolicy.autoRepeat,
      playerConfirmationRequired: automationPolicy.playerConfirmation !== "none",
      premiumSpendPermission: automationPolicy.premiumSpendPermission,
      automationRules: [
        "Automation never bypasses canonical requirements.",
        "AI Agents cannot spend Premium Crystals without explicit player authorization.",
        `Uses ${automationPolicy.displayName}.`
      ]
    },
    queueBehavior: {
      queueRuleId: queue.id,
      queueScope: queue.queueScope,
      interruptible: true,
      prioritySupported: queue.supportsPriority,
      pauseSupported: queue.supportsPause,
      cancelSupported: queue.supportsCancel
    },
    concurrency: {
      concurrencyPolicyId: queue.id,
      conflictGroupIds: queue.conflictGroups,
      maxConcurrentTargets: queue.maxConcurrency
    },
    failureRules: actionFailureCauses.map((cause) => cause.id),
    cancellationRules: {
      allowed: true,
      refundPolicy: "unspent_inputs_refunded",
      retainedProgressPolicy: "retain_by_action_policy"
    },
    completionRules: ["requirements_revalidated", "duration_complete", "completion_effects_emitted_once", "history_event_written_by_game"],
    events: actionEventDefinitions.map((event) => event.id),
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
      iconKey: `action_${input.id}`,
      statusBadge: titleFromId(input.category),
      completionAnimationKey: null,
      notes: "Renderer-independent presentation intent. The Game owns concrete UI implementation."
    },
    relatedCanonicalContent: {
      researchIds: input.related?.researchIds ?? [],
      buildingIds: input.related?.buildingIds ?? [],
      resourceIds: input.related?.resourceIds ?? [],
      economyIds: input.related?.economyIds ?? [],
      discoveryIds: input.related?.discoveryIds ?? [],
      planetOpportunityProfileIds: input.related?.planetOpportunityProfileIds ?? []
    },
    publicationStatus: input.publicationStatus ?? "approved"
  };
}

const detectedBody = requirement("discovery_state", "detected", "Target object must be detected.");
const probedBody = requirement("planet_knowledge", "probed", "Target object must be probed.");
const scannedBody = requirement("planet_knowledge", "scanned", "Target object must be scanned.");
const chartedBody = requirement("planet_knowledge", "charted", "Target object must be charted.");
const serverVerified = requirement("server_verification", "authoritative_action_start", "Game server must verify action start.");

export const actionDefinitions: ActionDefinition[] = [
  action({ id: "send_probe", displayName: "Send Probe", category: "probe", entityType: "celestial_body", targetTypes: ["planet", "moon", "asteroid_belt", "star_system"], description: "Send a probe to a detected target.", durationDefinitionId: "duration_probe_short", queueRuleId: "queue_probe", requirements: [detectedBody, requirement("technology", "probe_launch", "Probe launch technology or starter capability is required."), serverVerified], outputs: [transfer("knowledge", "probe_destination_locked", "completion"), transfer("discovery_points", "probe_launched", "completion", 5)], phaseTemplateIds: ["planning", "allocation", "travel", "completion"], discoveryPoints: 5 }),
  action({ id: "probe_travel", displayName: "Probe Travel", category: "travel", entityType: "celestial_body", targetTypes: ["planet", "moon", "asteroid_belt", "star_system"], description: "Resolve probe travel time, range, and logistics.", durationDefinitionId: "duration_probe_short", queueRuleId: "queue_probe", requirements: [requirement("range", "within_probe_range", "Target must be within probe range."), serverVerified], inputs: [transfer("fuel", "probe_fuel", "progress"), transfer("time", "time", "progress")], outputs: [transfer("knowledge", "probe_arrived", "completion")], phaseTemplateIds: ["travel", "completion"], discoveryPoints: 5 }),
  action({ id: "probe_scan", displayName: "Probe Scan", category: "scan", entityType: "celestial_body", targetTypes: ["planet", "moon", "asteroid_belt"], description: "Run a probe scan to reveal baseline registry and opportunity signals.", durationDefinitionId: "duration_probe_short", queueRuleId: "queue_probe", requirements: [probedBody, serverVerified], outputs: [transfer("knowledge", "basic_scan_result", "completion"), transfer("discovery_state", "scanned", "completion"), transfer("discovery_points", "probe_scan", "completion", 10)], phaseTemplateIds: ["scanning", "completion"], discoveryPoints: 10 }),
  action({ id: "survey_planet", displayName: "Survey Planet", category: "survey", entityType: "planet", description: "Survey a scanned planet to reveal richer classifications, resources, and opportunities.", durationDefinitionId: "duration_standard", queueRuleId: "queue_survey", requirements: [scannedBody, requirement("research", "planet_survey", "Planet survey capability must be unlocked."), serverVerified], outputs: [transfer("knowledge", "planet_survey_report", "completion"), transfer("discovery_state", "charted", "completion"), transfer("discovery_points", "planet_survey", "completion", 20)], phaseTemplateIds: ["planning", "survey", "completion"], discoveryPoints: 20 }),
  action({ id: "catalog_planet", displayName: "Catalog Planet", category: "catalog", entityType: "planet", description: "Add a surveyed planet to the canonical player catalog.", durationDefinitionId: "duration_standard", queueRuleId: "queue_survey", requirements: [chartedBody, serverVerified], outputs: [transfer("knowledge", "catalog_entry", "completion"), transfer("discovery_points", "catalog_planet", "completion", 15)], phaseTemplateIds: ["planning", "survey", "completion"], discoveryPoints: 15 }),
  action({ id: "analyze_anomaly", displayName: "Analyze Anomaly", category: "analysis", entityType: "celestial_body", description: "Analyze an anomaly discovered during scans or surveys.", durationDefinitionId: "duration_standard", queueRuleId: "queue_survey", requirements: [requirement("planet_knowledge", "anomaly_detected", "A detected anomaly is required."), serverVerified], outputs: [transfer("knowledge", "anomaly_analysis", "completion"), transfer("research", "anomaly_research", "completion"), transfer("discovery_points", "anomaly_analysis", "completion", 25)], phaseTemplateIds: ["planning", "scanning", "survey", "completion"], discoveryPoints: 25 }),
  action({ id: "analyze_artifact", displayName: "Analyze Artifact", category: "analysis", entityType: "artifact", description: "Analyze a recovered artifact for research, story, or civilization identity effects.", durationDefinitionId: "duration_standard", queueRuleId: "queue_research", requirements: [requirement("resource", "artifact", "A recovered artifact is required.", 1), serverVerified], outputs: [transfer("knowledge", "artifact_analysis", "completion"), transfer("research", "artifact_research", "completion"), transfer("civilization_identity", "artifact_influence", "completion")], phaseTemplateIds: ["planning", "allocation", "survey", "completion"], related: { resourceIds: ["artifact"] } }),
  action({ id: "excavate_ruin", displayName: "Excavate Ruin", category: "archaeology", entityType: "planet", description: "Excavate ancient ruins on an eligible surveyed body.", durationDefinitionId: "duration_project", queueRuleId: "queue_survey", requirements: [requirement("planet_knowledge", "ruins_identified", "Ruins must be identified."), requirement("technology", "archaeology", "Archaeology capability is required."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("time", "time", "progress")], outputs: [transfer("artifact", "excavated_artifact", "completion"), transfer("knowledge", "ruin_record", "completion"), transfer("discovery_points", "ruin_excavation", "completion", 40)], phaseTemplateIds: ["planning", "allocation", "survey", "return", "completion"], discoveryPoints: 40 }),
  action({ id: "prepare_colony", displayName: "Prepare Colony", category: "colonization", entityType: "planet", description: "Prepare an eligible planet for colony establishment.", durationDefinitionId: "duration_project", queueRuleId: "queue_planet", requirements: [requirement("research", "colonization", "Colonization research is required."), requirement("ownership", "claim_or_access", "Civilization must be allowed to develop this planet."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("material", "colony_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("infrastructure", "prepared_colony_site", "completion")], phaseTemplateIds: ["planning", "allocation", "preparation", "stabilization", "completion"], related: { economyIds: ["ECON-LABOR"] } }),
  action({ id: "establish_colony", displayName: "Establish Colony", category: "colonization", entityType: "planet", description: "Found a colony from a prepared colony site.", durationDefinitionId: "duration_colony", queueRuleId: "queue_colony", requirements: [requirement("action_dependency", "prepare_colony", "Prepare Colony must be completed."), requirement("population", "available_population", "Population must be available.", 1), serverVerified], inputs: [transfer("population", "population_assignment", "start", 1), transfer("labor", "ECON-LABOR", "progress"), transfer("time", "time", "progress")], outputs: [transfer("colony", "new_colony", "completion"), transfer("discovery_state", "colonized", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "commissioning", "stabilization", "completion"], related: { economyIds: ["ECON-LABOR", "ECON-POPULATION"] } }),
  action({ id: "build_mining_outpost", displayName: "Build Mining Outpost", category: "mining", entityType: "planet", description: "Build a mining outpost on a body with mining suitability.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("target_class", "supports_mining", "Opportunity profile must support mining."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("material", "construction_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("building", "mining_outpost", "completion"), transfer("resource", "mining_output", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "commissioning", "completion"] }),
  action({ id: "deploy_automated_extraction", displayName: "Deploy Automated Extraction", category: "extraction", entityType: "planet", description: "Deploy automated extraction infrastructure where permitted.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("ai_agent", "automation_capable_ai_agent", "Automation-capable AI Agent or system is required."), requirement("technology", "automated_extraction", "Automated extraction technology is required."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("energy", "civilization_energy", "progress"), transfer("time", "time", "progress")], outputs: [transfer("infrastructure", "automated_extraction", "completion"), transfer("resource", "automated_resource_output", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "commissioning", "completion"], automationPolicyId: "automation_advanced_ai" }),
  action({ id: "build_gas_harvest_platform", displayName: "Build Gas Harvest Platform", category: "harvesting", entityType: "planet", targetTypes: ["gas_giant", "ice_giant"], description: "Build orbital gas harvesting infrastructure around eligible giants.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("target_class", "supports_harvesting", "Target must support atmospheric harvesting."), serverVerified], inputs: [transfer("material", "orbital_platform_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("building", "gas_harvest_platform", "completion"), transfer("resource", "gas_harvest_output", "completion")], phaseTemplateIds: ["planning", "allocation", "transport", "construction", "commissioning", "completion"] }),
  action({ id: "build_ocean_harvest_platform", displayName: "Build Ocean Harvest Platform", category: "harvesting", entityType: "planet", targetTypes: ["ocean_world", "ocean_moon"], description: "Build ocean harvesting infrastructure on eligible ocean worlds.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("target_environment", "ocean", "Target must have ocean harvesting potential."), serverVerified], inputs: [transfer("material", "harvest_platform_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("building", "ocean_harvest_platform", "completion"), transfer("resource", "ocean_harvest_output", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "commissioning", "completion"] }),
  action({ id: "build_research_station", displayName: "Build Research Station", category: "research", entityType: "planet", description: "Build a research station on a high-value scientific body.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("target_class", "supports_research_station", "Target must support research stations."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("material", "research_station_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("building", "research_station", "completion"), transfer("research", "research_station_output", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "commissioning", "completion"] }),
  action({ id: "build_archaeological_camp", displayName: "Build Archaeological Camp", category: "archaeology", entityType: "planet", description: "Build a field camp to support ruin and artifact work.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("planet_knowledge", "archaeology_site_identified", "Archaeological site must be identified."), serverVerified], inputs: [transfer("material", "camp_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("building", "archaeological_camp", "completion"), transfer("knowledge", "archaeology_operations_enabled", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "completion"] }),
  action({ id: "build_orbital_refinery", displayName: "Build Orbital Refinery", category: "construction", entityType: "planet", description: "Build an orbital refinery for extraction and trade processing.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("technology", "orbital_industry", "Orbital industry technology is required."), serverVerified], inputs: [transfer("material", "orbital_refinery_materials", "progress"), transfer("energy", "civilization_energy", "progress"), transfer("time", "time", "progress")], outputs: [transfer("building", "orbital_refinery", "completion"), transfer("infrastructure", "orbital_industry", "completion")], phaseTemplateIds: ["planning", "allocation", "transport", "construction", "commissioning", "completion"] }),
  action({ id: "designate_preserve", displayName: "Designate Preserve", category: "administration", entityType: "planet", description: "Protect a body from extraction-heavy development.", durationDefinitionId: "duration_standard", queueRuleId: "queue_planet", requirements: [requirement("preservation_restriction", "eligible_for_preserve", "Target must be eligible for preservation."), serverVerified], outputs: [transfer("knowledge", "preserve_designation", "completion"), transfer("civilization_identity", "preservation_influence", "completion")], phaseTemplateIds: ["planning", "completion"], canAutomate: false, aiAgentSupport: false }),
  action({ id: "begin_terraforming_study", displayName: "Begin Terraforming Study", category: "terraforming", entityType: "planet", description: "Study terraforming feasibility before long-term terraforming stages.", durationDefinitionId: "duration_project", queueRuleId: "queue_research", requirements: [requirement("technology", "terraforming", "Terraforming technology is required."), requirement("target_class", "supports_terraforming", "Target must support terraforming study."), serverVerified], inputs: [transfer("research", "terraforming_research_focus", "progress"), transfer("time", "time", "progress")], outputs: [transfer("knowledge", "terraforming_study", "completion")], phaseTemplateIds: ["planning", "survey", "completion"] }),
  action({ id: "terraform_planet_stage", displayName: "Terraform Planet Stage", category: "terraforming", entityType: "planet", description: "Complete one canonical stage of terraforming.", durationDefinitionId: "duration_terraforming", queueRuleId: "queue_planet", requirements: [requirement("action_dependency", "begin_terraforming_study", "Terraforming Study must be complete."), requirement("server_verification", "authoritative_long_action", "Server must verify long-action eligibility."), serverVerified], inputs: [transfer("energy", "civilization_energy", "progress"), transfer("material", "terraforming_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("infrastructure", "terraforming_stage_complete", "completion"), transfer("knowledge", "terraforming_progress", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "stabilization", "completion"], publicationStatus: "provisional" }),
  action({ id: "conduct_research", displayName: "Conduct Research", category: "research", entityType: "research", description: "Progress a canonical research project.", durationDefinitionId: "duration_standard", queueRuleId: "queue_research", requirements: [requirement("queue_capacity", "research_slot_available", "A research slot must be available."), serverVerified], inputs: [transfer("research", "research_focus", "progress"), transfer("time", "time", "progress")], outputs: [transfer("unlock", "research_unlock", "completion"), transfer("notification", "research_complete", "completion")], phaseTemplateIds: ["planning", "allocation", "completion"], related: { economyIds: ["ECON-RESEARCH"] } }),
  action({ id: "construct_building", displayName: "Construct Building", category: "building", entityType: "building", description: "Construct a canonical building record where allowed.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("building", "buildable_definition", "Building definition must be available."), requirement("location", "valid_build_site", "A valid build site is required."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("material", "building_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("building", "constructed_building", "completion"), transfer("notification", "building_complete", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "commissioning", "completion"] }),
  action({ id: "upgrade_building", displayName: "Upgrade Building", category: "upgrade", entityType: "building", description: "Upgrade an existing building through the canonical upgrade system.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("building", "owned_upgradeable_building", "An owned upgradeable building is required."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("material", "upgrade_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("building", "upgraded_building", "completion"), transfer("notification", "building_upgrade_complete", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "commissioning", "completion"] }),
  action({ id: "manufacture_item", displayName: "Manufacture Item", category: "manufacturing", entityType: "resource", description: "Manufacture an item or good from canonical inputs.", durationDefinitionId: "duration_standard", queueRuleId: "queue_manufacturing", requirements: [requirement("building", "manufacturing_capacity", "Manufacturing capacity is required."), serverVerified], inputs: [transfer("material", "manufacturing_inputs", "progress"), transfer("time", "time", "progress")], outputs: [transfer("resource", "manufactured_output", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "completion"], automationPolicyId: "automation_advanced_ai" }),
  action({ id: "assign_workforce", displayName: "Assign Workforce", category: "population", entityType: "colony", description: "Assign available workforce to a colony, building, project, or reserve pool.", durationDefinitionId: "duration_standard", queueRuleId: "queue_colony", requirements: [requirement("population", "available_workforce", "Available workforce is required.", 1), serverVerified], inputs: [transfer("population", "available_workforce", "start", 1), transfer("time", "time", "progress")], outputs: [transfer("population", "assigned_workforce", "completion", 1), transfer("notification", "workforce_assigned", "completion")], phaseTemplateIds: ["planning", "allocation", "completion"], related: { economyIds: ["ECON-POPULATION"] } }),
  action({ id: "reassign_workforce", displayName: "Reassign Workforce", category: "population", entityType: "colony", description: "Move existing workforce from one eligible assignment to another without deleting population.", durationDefinitionId: "duration_standard", queueRuleId: "queue_colony", requirements: [requirement("workforce", "assigned_workforce", "Existing assigned workforce is required.", 1), serverVerified], inputs: [transfer("population", "assigned_workforce", "start", 1), transfer("time", "time", "progress")], outputs: [transfer("population", "reassigned_workforce", "completion", 1), transfer("notification", "workforce_reassigned", "completion")], phaseTemplateIds: ["planning", "allocation", "completion"], related: { economyIds: ["ECON-POPULATION"] } }),
  action({ id: "train_specialist", displayName: "Train Specialist", category: "population", entityType: "colony", description: "Train eligible workforce into a canonical specialist role.", durationDefinitionId: "duration_project", queueRuleId: "queue_research", requirements: [requirement("workforce", "eligible_worker", "An eligible worker is required.", 1), requirement("building", "education_capacity", "Education or training capacity is required."), serverVerified], inputs: [transfer("population", "trainee", "start", 1), transfer("research", "training_curriculum", "progress"), transfer("time", "time", "progress")], outputs: [transfer("population", "specialist_worker", "completion", 1), transfer("notification", "specialist_trained", "completion")], phaseTemplateIds: ["planning", "allocation", "survey", "completion"], related: { economyIds: ["ECON-POPULATION", "ECON-RESEARCH"] } }),
  action({ id: "retrain_population", displayName: "Retrain Population", category: "population", entityType: "colony", description: "Retrain workforce between compatible canonical roles.", durationDefinitionId: "duration_project", queueRuleId: "queue_research", requirements: [requirement("workforce", "eligible_worker", "An eligible worker is required.", 1), requirement("building", "training_capacity", "Training capacity is required."), serverVerified], inputs: [transfer("population", "worker_retraining", "start", 1), transfer("time", "time", "progress")], outputs: [transfer("population", "retrained_worker", "completion", 1), transfer("notification", "population_retrained", "completion")], phaseTemplateIds: ["planning", "allocation", "completion"], related: { economyIds: ["ECON-POPULATION"] } }),
  action({ id: "transfer_population", displayName: "Transfer Population", category: "population", entityType: "route", description: "Move population through a canonical logistics route with travel time and destination capacity checks.", durationDefinitionId: "duration_standard", queueRuleId: "queue_logistics", requirements: [requirement("population", "transferable_population", "Transferable population is required.", 1), requirement("queue_capacity", "transport_capacity", "Transport capacity is required."), serverVerified], inputs: [transfer("population", "population_manifest", "start", 1), transfer("transport_capacity", "passenger_capacity", "progress"), transfer("time", "time", "progress")], outputs: [transfer("population", "arrived_population", "completion", 1), transfer("notification", "population_transfer_complete", "completion")], phaseTemplateIds: ["planning", "allocation", "transport", "completion"], related: { economyIds: ["ECON-POPULATION"] }, automationPolicyId: "automation_advanced_ai" }),
  action({ id: "transport_colonists", displayName: "Transport Colonists", category: "population", entityType: "route", description: "Transport founding colonists to a prepared colony destination.", durationDefinitionId: "duration_colony", queueRuleId: "queue_logistics", requirements: [requirement("action_dependency", "prepare_colony", "Prepared colony site is required."), requirement("population", "founding_colonists", "Founding colonists are required.", 1), requirement("queue_capacity", "colonist_transport_capacity", "Colonist transport capacity is required."), serverVerified], inputs: [transfer("population", "colonist_manifest", "start", 1), transfer("fuel", "colonist_transport_fuel", "progress"), transfer("time", "time", "progress")], outputs: [transfer("population", "arrived_colonists", "completion", 1), transfer("notification", "colonists_arrived", "completion")], phaseTemplateIds: ["planning", "allocation", "transport", "completion"], related: { economyIds: ["ECON-POPULATION"] }, automationPolicyId: "automation_advanced_ai" }),
  action({ id: "expand_housing", displayName: "Expand Housing", category: "population", entityType: "building", description: "Increase supported housing or habitation capacity through canonical construction.", durationDefinitionId: "duration_project", queueRuleId: "queue_construction", requirements: [requirement("building", "housing_definition", "A housing or habitat definition is required."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("material", "housing_materials", "progress"), transfer("time", "time", "progress")], outputs: [transfer("population", "housing_capacity", "completion"), transfer("notification", "housing_expanded", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "commissioning", "completion"], related: { economyIds: ["ECON-LABOR", "ECON-POPULATION"] } }),
  action({ id: "establish_education_program", displayName: "Establish Education Program", category: "population", entityType: "colony", description: "Create training and education capacity for workforce progression.", durationDefinitionId: "duration_project", queueRuleId: "queue_research", requirements: [requirement("building", "education_capacity", "Education infrastructure is required."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("research", "education_curriculum", "progress"), transfer("time", "time", "progress")], outputs: [transfer("population", "education_capacity", "completion"), transfer("notification", "education_program_established", "completion")], phaseTemplateIds: ["planning", "allocation", "completion"], related: { economyIds: ["ECON-LABOR", "ECON-RESEARCH"] } }),
  action({ id: "establish_healthcare_program", displayName: "Establish Healthcare Program", category: "population", entityType: "colony", description: "Create healthcare capacity for growth, retention, and wellbeing.", durationDefinitionId: "duration_project", queueRuleId: "queue_colony", requirements: [requirement("building", "healthcare_capacity", "Healthcare infrastructure is required."), serverVerified], inputs: [transfer("labor", "ECON-LABOR", "progress"), transfer("material", "medical_supplies", "progress"), transfer("time", "time", "progress")], outputs: [transfer("population", "healthcare_capacity", "completion"), transfer("notification", "healthcare_program_established", "completion")], phaseTemplateIds: ["planning", "allocation", "commissioning", "completion"], related: { economyIds: ["ECON-LABOR", "ECON-POPULATION"] } }),
  action({ id: "deploy_robotic_workforce", displayName: "Deploy Robotic Workforce", category: "ai_automation", entityType: "colony", description: "Deploy robotic or AI-supported workforce where automation substitution is permitted.", durationDefinitionId: "duration_project", queueRuleId: "queue_manufacturing", requirements: [requirement("technology", "robotic_workforce", "Robotic workforce technology is required."), requirement("building", "automation_capacity", "Automation capacity is required."), serverVerified], inputs: [transfer("material", "robotic_components", "progress"), transfer("energy", "civilization_energy", "progress"), transfer("time", "time", "progress")], outputs: [transfer("population", "robotic_workers", "completion"), transfer("notification", "robotic_workforce_deployed", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "commissioning", "completion"], related: { economyIds: ["ECON-POPULATION"] }, automationPolicyId: "automation_advanced_ai" }),
  action({ id: "create_shipment", displayName: "Create Shipment", category: "logistics", entityType: "route", description: "Reserve cargo, route capacity, and transport mode for a Game-owned shipment instance.", durationDefinitionId: "duration_standard", queueRuleId: "queue_logistics", requirements: [requirement("queue_capacity", "logistics_route_capacity", "A valid route with free capacity is required."), serverVerified], inputs: [transfer("resource", "shipment_reserved_cargo", "start"), transfer("transport_capacity", "shipment_capacity", "start"), transfer("time", "time", "progress")], outputs: [transfer("route", "planned_shipment", "completion")], phaseTemplateIds: ["planning", "allocation", "completion"], automationPolicyId: "automation_advanced_ai" }),
  action({ id: "load_shipment", displayName: "Load Shipment", category: "logistics", entityType: "route", description: "Load reserved cargo into an eligible transport without creating or destroying resources.", durationDefinitionId: "duration_standard", queueRuleId: "queue_logistics", requirements: [requirement("action_dependency", "create_shipment", "Shipment must be planned and reserved."), requirement("queue_capacity", "loading_capacity", "Loading capacity is required."), serverVerified], inputs: [transfer("resource", "reserved_cargo", "start"), transfer("transport_capacity", "loading_capacity", "progress"), transfer("time", "time", "progress")], outputs: [transfer("route", "loaded_shipment", "completion")], phaseTemplateIds: ["allocation", "preparation", "completion"], automationPolicyId: "automation_advanced_ai" }),
  action({ id: "unload_shipment", displayName: "Unload Shipment", category: "logistics", entityType: "route", description: "Unload delivered cargo into destination storage, applying canonical loss and capacity rules.", durationDefinitionId: "duration_standard", queueRuleId: "queue_logistics", requirements: [requirement("action_dependency", "transfer_resources", "Shipment must arrive before unloading."), requirement("queue_capacity", "destination_storage_capacity", "Destination storage capacity is required."), serverVerified], inputs: [transfer("resource", "arrived_cargo", "start"), transfer("transport_capacity", "unloading_capacity", "progress"), transfer("time", "time", "progress")], outputs: [transfer("resource", "stored_delivered_cargo", "completion")], phaseTemplateIds: ["allocation", "completion"], automationPolicyId: "automation_advanced_ai" }),
  action({ id: "process_resource", displayName: "Process Resource", category: "manufacturing", entityType: "resource", description: "Run a canonical processing recipe through an eligible processing node.", durationDefinitionId: "duration_standard", queueRuleId: "queue_manufacturing", requirements: [requirement("building", "processing_capacity", "Processing capacity is required."), requirement("resource", "recipe_inputs", "Recipe inputs must be reserved."), serverVerified], inputs: [transfer("resource", "processing_inputs", "start"), transfer("energy", "processing_energy", "progress"), transfer("time", "time", "progress")], outputs: [transfer("resource", "processed_outputs", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "completion"], automationPolicyId: "automation_advanced_ai" }),
  action({ id: "recycle_resource", displayName: "Recycle Resource", category: "manufacturing", entityType: "resource", description: "Recover useful outputs from waste, damaged goods, or recyclable materials.", durationDefinitionId: "duration_standard", queueRuleId: "queue_manufacturing", requirements: [requirement("building", "recycling_capacity", "Recycling capacity is required."), requirement("resource", "recyclable_inputs", "Recyclable inputs must be available."), serverVerified], inputs: [transfer("resource", "recycling_inputs", "start"), transfer("energy", "recycling_energy", "progress"), transfer("time", "time", "progress")], outputs: [transfer("resource", "recovered_outputs", "completion"), transfer("resource", "recycling_waste", "completion")], phaseTemplateIds: ["planning", "allocation", "construction", "completion"], automationPolicyId: "automation_advanced_ai" }),
  action({ id: "reroute_shipment", displayName: "Reroute Shipment", category: "logistics", entityType: "route", description: "Change a delayed or disrupted shipment to another eligible route without bypassing travel time.", durationDefinitionId: "duration_standard", queueRuleId: "queue_logistics", requirements: [requirement("action_dependency", "create_shipment", "An active shipment must exist in Game-owned state."), requirement("queue_capacity", "alternate_route_capacity", "An alternate route with capacity is required."), serverVerified], inputs: [transfer("route", "active_shipment_route", "start"), transfer("logistics", "reroute_planning", "progress"), transfer("time", "time", "progress")], outputs: [transfer("route", "rerouted_shipment", "completion")], phaseTemplateIds: ["planning", "allocation", "transport", "completion"], automationPolicyId: "automation_advanced_ai" }),
  action({ id: "transfer_resources", displayName: "Transfer Resources", category: "resource_transfer", entityType: "route", description: "Move resources through a canonical logistics route.", durationDefinitionId: "duration_standard", queueRuleId: "queue_logistics", requirements: [requirement("queue_capacity", "route_capacity", "A route with available logistics capacity is required."), serverVerified], inputs: [transfer("resource", "transfer_payload", "start"), transfer("transport_capacity", "logistics_capacity", "progress"), transfer("time", "time", "progress")], outputs: [transfer("resource", "delivered_payload", "completion")], phaseTemplateIds: ["planning", "allocation", "transport", "completion"], automationPolicyId: "automation_advanced_ai" }),
  action({ id: "establish_trade_route", displayName: "Establish Trade Route", category: "trade", entityType: "trade_route", description: "Create a persistent trade route between eligible endpoints.", durationDefinitionId: "duration_project", queueRuleId: "queue_logistics", requirements: [requirement("technology", "trade_routes", "Trade route technology or feature unlock is required."), requirement("location", "valid_trade_endpoints", "Two valid endpoints are required."), serverVerified], inputs: [transfer("credits", "ECON-CREDITS", "start"), transfer("logistics", "route_planning", "progress"), transfer("time", "time", "progress")], outputs: [transfer("route", "trade_route", "completion"), transfer("notification", "trade_route_established", "completion")], phaseTemplateIds: ["planning", "allocation", "transport", "completion"], related: { economyIds: ["ECON-CREDITS"] } }),
  action({ id: "travel_to_destination", displayName: "Travel To Destination", category: "travel", entityType: "destination", targetTypes: ["planet", "star_system", "sector", "galaxy"], description: "Travel to an eligible destination using current technology gates.", durationDefinitionId: "duration_standard", queueRuleId: "queue_logistics", requirements: [requirement("range", "within_travel_range", "Destination must be within travel range."), requirement("technology", "travel_gate", "Required travel technology gate must be unlocked."), serverVerified], inputs: [transfer("fuel", "travel_fuel", "progress"), transfer("time", "time", "progress")], outputs: [transfer("knowledge", "arrival_context", "completion"), transfer("notification", "arrival_complete", "completion")], phaseTemplateIds: ["planning", "allocation", "travel", "completion"] })
];

export const accelerationRules = [
  "Premium Crystals never unlock unavailable Actions or bypass requirements.",
  "Premium Crystal acceleration requires server-authoritative balance checks.",
  "Acceleration costs are calculated by the server with approved transaction reason codes.",
  "Acceleration requests must be idempotent.",
  "Acceleration applies before the minimum-duration clamp and cannot reduce below the policy minimum."
];

export const automationRules = [
  "Automation eligibility is declared per Action Definition.",
  "AI Agent support is explicit and references reusable automation policies.",
  "Automation may queue, start, or repeat only when the policy allows it.",
  "AI Agents must never spend Premium Crystals without explicit player authorization.",
  "Automation never bypasses canonical requirements."
];

export const canonicalActionSystem: ActionSystemContract = {
  id: "canonical_action_system_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-CANONICAL-ACTION-FRAMEWORK",
  timeActionContractId: timeActionContract.id,
  laborGenerationFrameworkId: "labor_generation_framework_v1",
  ownership: {
    studioOwns: [
      "Action definitions",
      "Action categories",
      "requirements",
      "inputs",
      "outputs",
      "duration definitions",
      "modifier order",
      "queue and concurrency rules",
      "automation and acceleration policies",
      "failure and completion rules",
      "event definitions",
      "presentation intent",
      "runtime publication"
    ],
    gameOwns: [
      "player Action instances",
      "active timers",
      "queue contents",
      "timestamps",
      "local and cloud persistence",
      "player decisions",
      "server-authoritative protected transactions",
      "UI rendering",
      "notifications",
      "player action history entries"
    ]
  },
  actionCategories,
  actionStates,
  actionDefinitions,
  actionQueueRules,
  actionDurationDefinitions,
  actionPhaseTemplates,
  actionAccelerationPolicies,
  actionAutomationPolicies,
  actionFailureCauses,
  actionEventDefinitions,
  actionPresentationContracts,
  accelerationRules,
  automationRules,
  actionPresentation,
  validationRules: [
    "Every Action Definition must use a stable canonical ID.",
    "Every Action Definition must reference a canonical category, duration definition, queue rule, automation policy, phase template, and Time Action Contract.",
    "Every Action requirement must provide a canonical reasonCode.",
    "Premium Crystal acceleration must never bypass requirements.",
    "Studio must not publish player active action instances, queue contents, balances, timestamps, or history entries.",
    "Renderer-specific layout coordinates and client implementation code are not part of this runtime contract."
  ]
};

function issue(severity: ImportIssue["severity"], code: string, message: string, records: string[] = []): ImportIssue {
  return { severity, code, message, records };
}

export function validateActionSystem(system: ActionSystemContract = canonicalActionSystem, timeContract: TimeActionContract = timeActionContract): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const categoryIds = new Set(system.actionCategories.map((category) => category.id));
  const stateIds = new Set(system.actionStates.map((state) => state.id));
  const queueIds = new Set(system.actionQueueRules.map((queue) => queue.id));
  const durationIds = new Set(system.actionDurationDefinitions.map((duration) => duration.id));
  const phaseIds = new Set(system.actionPhaseTemplates.map((phase) => phase.id));
  const automationPolicyIds = new Set(system.actionAutomationPolicies.map((policy) => policy.id));
  const eventIds = new Set(system.actionEventDefinitions.map((event) => event.id));
  const requiredStates = ["unavailable", "ready", "queued", "waiting", "preparing", "in_progress", "paused", "blocked", "completed", "failed", "cancelled", "archived"];
  const requiredActions = ["send_probe", "probe_travel", "probe_scan", "survey_planet", "catalog_planet", "analyze_anomaly", "analyze_artifact", "excavate_ruin", "prepare_colony", "establish_colony", "build_mining_outpost", "deploy_automated_extraction", "build_gas_harvest_platform", "build_ocean_harvest_platform", "build_research_station", "build_archaeological_camp", "build_orbital_refinery", "designate_preserve", "begin_terraforming_study", "terraform_planet_stage", "conduct_research", "construct_building", "upgrade_building", "manufacture_item", "assign_workforce", "reassign_workforce", "train_specialist", "retrain_population", "transfer_population", "transport_colonists", "expand_housing", "establish_education_program", "establish_healthcare_program", "deploy_robotic_workforce", "create_shipment", "load_shipment", "unload_shipment", "process_resource", "recycle_resource", "reroute_shipment", "transfer_resources", "establish_trade_route", "travel_to_destination"];

  if (system.id !== "canonical_action_system_v1") issues.push(issue("error", "invalid_action_system_id", "Canonical Action System ID is invalid."));
  if (system.timeActionContractId !== timeContract.id) issues.push(issue("error", "invalid_time_action_contract", "Action System must reference the canonical Time Action Contract."));
  if (system.laborGenerationFrameworkId !== "labor_generation_framework_v1") issues.push(issue("error", "invalid_labor_generation_framework", "Action System must reference the canonical Labor Generation Framework."));
  if (system.architectureDecisionId !== "ARCH-DECISION-CANONICAL-ACTION-FRAMEWORK") issues.push(issue("error", "missing_architecture_decision", "Action System must reference the accepted architecture decision."));
  for (const categoryId of actionCategoryIds) {
    if (!categoryIds.has(categoryId)) issues.push(issue("error", "missing_action_category", `Missing action category ${categoryId}.`, [categoryId]));
  }
  if (system.actionStates.map((state) => state.id).join("|") !== requiredStates.join("|")) {
    issues.push(issue("error", "invalid_action_state_order", "Action states must match the canonical state list and order.", system.actionStates.map((state) => state.id)));
  }
  for (const state of system.actionStates) {
    for (const transition of state.allowedTransitions) {
      if (!stateIds.has(transition as ActionSystemState["id"])) issues.push(issue("error", "invalid_state_transition", `${state.id} transitions to unknown state ${transition}.`, [state.id, transition]));
    }
    if (state.terminal && state.resumable) issues.push(issue("error", "terminal_state_resumable", `${state.id} is terminal but marked resumable.`, [state.id]));
  }
  for (const actionId of requiredActions) {
    if (!system.actionDefinitions.some((actionItem) => actionItem.id === actionId)) {
      issues.push(issue("error", "missing_required_action", `Missing required canonical action ${actionId}.`, [actionId]));
    }
  }
  for (const actionItem of system.actionDefinitions) {
    if (!categoryIds.has(actionItem.category)) issues.push(issue("error", "invalid_action_category", `${actionItem.id} references unknown category ${actionItem.category}.`, [actionItem.id]));
    if (actionItem.duration.timeActionContractId !== timeContract.id) issues.push(issue("error", "invalid_action_time_contract", `${actionItem.id} must reference Time Action Contract.`, [actionItem.id]));
    if (!durationIds.has(actionItem.duration.durationDefinitionId)) issues.push(issue("error", "invalid_duration_definition", `${actionItem.id} references unknown duration definition.`, [actionItem.id]));
    if (actionItem.duration.baseDurationSeconds <= 0 || actionItem.duration.minimumDurationSeconds <= 0 || actionItem.duration.maximumDurationSeconds < actionItem.duration.minimumDurationSeconds) issues.push(issue("error", "invalid_action_duration", `${actionItem.id} has invalid duration bounds.`, [actionItem.id]));
    if (!queueIds.has(actionItem.queueBehavior.queueRuleId)) issues.push(issue("error", "invalid_queue_rule", `${actionItem.id} references unknown queue rule.`, [actionItem.id]));
    if (!automationPolicyIds.has(actionItem.automation.automationPolicyId)) issues.push(issue("error", "invalid_automation_policy", `${actionItem.id} references unknown automation policy.`, [actionItem.id]));
    for (const phaseId of actionItem.phases) {
      if (!phaseIds.has(phaseId)) issues.push(issue("error", "invalid_phase_template", `${actionItem.id} references unknown phase ${phaseId}.`, [actionItem.id, phaseId]));
    }
    for (const eventId of actionItem.events) {
      if (!eventIds.has(eventId)) issues.push(issue("error", "invalid_action_event", `${actionItem.id} references unknown event ${eventId}.`, [actionItem.id, eventId]));
    }
    if (actionItem.requirements.length === 0) issues.push(issue("error", "missing_action_requirements", `${actionItem.id} must declare requirements.`, [actionItem.id]));
    for (const requirementItem of actionItem.requirements) {
      if (!requirementItem.reasonCode) issues.push(issue("error", "missing_requirement_reason_code", `${actionItem.id} has a requirement without reasonCode.`, [actionItem.id, requirementItem.id]));
    }
    if (actionItem.outputs.length === 0) issues.push(issue("error", "missing_action_outputs", `${actionItem.id} must declare outputs.`, [actionItem.id]));
    if (actionItem.modifiers.modifierOrder.join("|") !== modifierOrder.join("|")) issues.push(issue("error", "invalid_modifier_order", `${actionItem.id} does not use canonical modifier order.`, [actionItem.id]));
    if (actionItem.modifiers.premiumCrystalAcceleration.policy !== "accelerate_only" || actionItem.modifiers.premiumCrystalAcceleration.canUnlockUnavailableActions !== false) {
      issues.push(issue("error", "invalid_premium_acceleration", `${actionItem.id} Premium Crystal acceleration can only accelerate and must not bypass requirements.`, [actionItem.id]));
    }
    if (actionItem.automation.premiumSpendPermission !== "never" && actionItem.automation.premiumSpendPermission !== "explicit_player_authorization") {
      issues.push(issue("error", "invalid_premium_spend_permission", `${actionItem.id} has invalid automation Premium Crystal permission.`, [actionItem.id]));
    }
    if (!actionItem.history.started || !actionItem.history.completed || !actionItem.history.cancelled || !actionItem.history.failed || !actionItem.history.accelerated || !actionItem.history.automated) {
      issues.push(issue("error", "incomplete_history_contract", `${actionItem.id} must declare all canonical history events.`, [actionItem.id]));
    }
  }
  for (const policy of system.actionAccelerationPolicies) {
    if (!policy.serverAuthoritativeBalance || !policy.serverCalculatedCost || !policy.idempotencyRequired || !policy.minimumDurationClamp || policy.canBypassRequirements !== false) {
      issues.push(issue("error", "unsafe_acceleration_policy", `${policy.id} must be server-authoritative, idempotent, clamped, and never bypass requirements.`, [policy.id]));
    }
  }
  for (const policy of system.actionAutomationPolicies) {
    if (policy.premiumSpendPermission !== "never" && policy.premiumSpendPermission !== "explicit_player_authorization") {
      issues.push(issue("error", "unsafe_automation_policy", `${policy.id} has invalid premium-spend permission.`, [policy.id]));
    }
  }
  for (const contract of system.actionPresentationContracts) {
    if (!contract.rendererIndependent) issues.push(issue("error", "renderer_specific_presentation", `${contract.id} must stay renderer-independent.`, [contract.id]));
  }
  return issues;
}
