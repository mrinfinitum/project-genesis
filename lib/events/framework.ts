import { canonicalActionSystem } from "@/lib/actions/action-system";
import { colonizationFramework } from "@/lib/colonization/framework";
import { civilizationProgressionFramework } from "@/lib/civilization/progression-framework";
import { universalDiscoveryRegistryVersion } from "@/lib/discovery/universal-registry";
import { resourceEconomyLogisticsFramework } from "@/lib/economy/logistics-framework";
import { missionExpeditionFramework } from "@/lib/missions/framework";
import { planetDevelopmentFramework } from "@/lib/planets/development-framework";
import { populationSimulationFramework } from "@/lib/population/framework";
import type {
  DynamicEventCategoryDefinition,
  DynamicEventChainDefinition,
  DynamicEventChoiceDefinition,
  DynamicEventDefinition,
  DynamicEventEffectDefinition,
  DynamicEventFrameworkContract,
  DynamicEventKnowledgeVisibilityRule,
  DynamicEventLifecycleStateDefinition,
  DynamicEventMissingCanonicalDefinition,
  DynamicEventPhaseDefinition,
  DynamicEventPresentationContract,
  DynamicEventResolutionPolicyDefinition,
  DynamicEventSeverityDefinition,
  DynamicEventTimelineSignificancePolicy,
  DynamicEventTriggerPolicyDefinition,
  DynamicEventTypeDefinition,
  DynamicEventProbabilityPolicyDefinition,
  DynamicEventDeterministicSeedPolicy
} from "@/types/runtime";

type ValidationIssue = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  records: string[];
};

function issue(severity: ValidationIssue["severity"], code: string, message: string, records: string[] = []): ValidationIssue {
  return { severity, code, message, records };
}

const eventCategoryDefinitions: DynamicEventCategoryDefinition[] = [
  ["stellar", "Stellar", "Star-driven conditions such as flares, radiation, and unusual activity.", ["galaxy_engine", "planet_development"]],
  ["planetary", "Planetary", "Planet-scale conditions tied to hazards, opportunities, and development profiles.", ["planet_development"]],
  ["atmospheric", "Atmospheric", "Weather, pressure, storm, and atmospheric stability events.", ["planet_development"]],
  ["geological", "Geological", "Quakes, volcanism, deposits, collapse, and crustal instability.", ["planet_development", "resource_economy_logistics"]],
  ["biological", "Biological", "Lifeform, bloom, pathogen, and biosphere events.", ["discovery", "planet_development"]],
  ["ecological", "Ecological", "Preservation, terraforming, and ecosystem balance events.", ["planet_development", "civilization_identity"]],
  ["anomalous", "Anomalous", "Unknown, exotic, or physics-defying signals.", ["discovery", "universal_discovery_registry"]],
  ["discovery", "Discovery", "Events produced by discovery states, scans, and cataloguing.", ["discovery", "universal_discovery_registry"]],
  ["artifact", "Artifact", "Recovered item, relic, and containment events.", ["discovery", "encyclopedia"]],
  ["archaeology", "Archaeology", "Ruin activation, excavation, and ancient record events.", ["planet_development", "mission_expedition"]],
  ["colony", "Colony", "Settlement, colony stage, focus, and habitability events.", ["colonization"]],
  ["infrastructure", "Infrastructure", "Building, route, capacity, and maintenance events.", ["colonization", "resource_economy_logistics"]],
  ["population", "Population", "Population-facing hooks for workforce, migration, wellbeing, and evacuation.", [populationSimulationFramework.id]],
  ["economy", "Economy", "Market, cost, demand, and civilization value events.", ["resource_economy_logistics"]],
  ["logistics", "Logistics", "Route, shipment, transport, storage, and throughput events.", ["resource_economy_logistics"]],
  ["trade", "Trade", "Trade route, market access, and exchange opportunity events.", ["resource_economy_logistics", "mission_expedition"]],
  ["research", "Research", "Scientific, experiment, collaboration, and unlock events.", ["action_system", "encyclopedia"]],
  ["production", "Production", "Manufacturing, bottleneck, efficiency, and breakthrough events.", ["resource_economy_logistics"]],
  ["resource", "Resource", "Resource deposits, depletion, discovery, overflow, and scarcity events.", ["resource_catalog", "resource_economy_logistics"]],
  ["terraforming", "Terraforming", "Terraforming study, preservation, and staged change events.", ["planet_development"]],
  ["automation", "Automation", "Automation system proposals, faults, and breakthroughs.", ["action_system", "ai_agents"]],
  ["ai_agent", "AI Agent", "AI detection, recommendation, and safe automation events.", ["ai_agents"]],
  ["civilization", "Civilization", "Civilization-scale recognition, culture, and historical events.", ["civilization_identity"]],
  ["identity", "Identity", "Industrial, Eco, Scientific, Trade, and Automation influence events.", ["civilization_identity"]],
  ["progression", "Progression", "Stage transitions, milestones, and development score events.", ["civilization_progression"]],
  ["mission", "Mission", "Mission-generated or mission-modifying events.", ["mission_expedition"]],
  ["expedition", "Expedition", "Expedition risk, distress, phase, and return events.", ["mission_expedition"]],
  ["registry", "Registry", "First-discovery claim, attribution, and naming-opportunity events.", ["universal_discovery_registry"]],
  ["story", "Story", "Authored narrative hooks that still respect canonical conditions.", ["encyclopedia"]],
  ["opportunity", "Opportunity", "Positive optional openings that invite action without punishment.", ["action_system"]],
  ["crisis", "Crisis", "High urgency multi-system events that require response choices.", ["action_system", "mission_expedition"]],
  ["celebration", "Celebration", "Positive history, recognition, and milestone celebration events.", ["civilization_progression", "civilization_identity"]]
].map(([id, displayName, description, sourceSystemIds]) => ({ id, displayName, description, sourceSystemIds, presentationToken: `event_category_${id}` } as DynamicEventCategoryDefinition));

const eventTypeDefinitions: DynamicEventTypeDefinition[] = [
  ["ambient", "Ambient", "Background universe event with low urgency.", "trivial", "neutral"],
  ["informational", "Informational", "A knowledge or status update.", "minor", "neutral"],
  ["opportunity", "Opportunity", "Optional opening with meaningful upside.", "moderate", "positive"],
  ["beneficial", "Beneficial", "Positive event with limited downside.", "minor", "positive"],
  ["neutral", "Neutral", "Condition shift without moral or strategic bias.", "minor", "neutral"],
  ["disruptive", "Disruptive", "Operational friction or bottleneck.", "moderate", "negative"],
  ["hazardous", "Hazardous", "Hazard with potential damage or risk.", "major", "negative"],
  ["crisis", "Crisis", "High pressure event requiring response.", "severe", "negative"],
  ["milestone", "Milestone", "Progress recognition event.", "major", "positive"],
  ["discovery_triggered", "Discovery Triggered", "Triggered by discovery or knowledge changes.", "moderate", "mixed"],
  ["mission_triggered", "Mission Triggered", "Generated by mission state or mission completion.", "moderate", "mixed"],
  ["action_triggered", "Action Triggered", "Generated by canonical Action state.", "minor", "mixed"],
  ["colony_triggered", "Colony Triggered", "Generated by colony state.", "moderate", "mixed"],
  ["economy_triggered", "Economy Triggered", "Generated by economy state.", "moderate", "mixed"],
  ["logistics_triggered", "Logistics Triggered", "Generated by shipment, route, or storage state.", "moderate", "mixed"],
  ["identity_triggered", "Identity Triggered", "Generated by identity thresholds or trends.", "moderate", "mixed"],
  ["progression_triggered", "Progression Triggered", "Generated by stage or milestone changes.", "major", "positive"],
  ["story", "Story", "Narrative hook with canonical eligibility.", "moderate", "mixed"],
  ["chain", "Chain", "A sequenced event chain.", "major", "mixed"],
  ["branching", "Branching", "Choice-bearing event with multiple outcomes.", "major", "mixed"],
  ["recurring", "Recurring", "Repeatable event within a deterministic policy.", "minor", "mixed"],
  ["seasonal_future", "Seasonal Future", "Future seasonal event type placeholder.", "minor", "neutral"],
  ["global_future", "Global Future", "Future global event type placeholder.", "major", "mixed"]
].map(([id, displayName, description, defaultSeverityId, positiveBias]) => ({ id, displayName, description, defaultSeverityId, positiveBias, presentationToken: `event_type_${id}` } as DynamicEventTypeDefinition));

const eventLifecycleStateDefinitions: DynamicEventLifecycleStateDefinition[] = [
  { id: "hidden", displayName: "Hidden", terminal: false, playerVisible: false, allowedTransitions: ["eligible"], presentationToken: "event_hidden" },
  { id: "eligible", displayName: "Eligible", terminal: false, playerVisible: false, allowedTransitions: ["pending", "cancelled"], presentationToken: "event_eligible" },
  { id: "pending", displayName: "Pending", terminal: false, playerVisible: false, allowedTransitions: ["triggered", "expired", "cancelled"], presentationToken: "event_pending" },
  { id: "triggered", displayName: "Triggered", terminal: false, playerVisible: true, allowedTransitions: ["revealed", "active"], presentationToken: "event_triggered" },
  { id: "revealed", displayName: "Revealed", terminal: false, playerVisible: true, allowedTransitions: ["active", "awaiting_choice", "expired"], presentationToken: "event_revealed" },
  { id: "active", displayName: "Active", terminal: false, playerVisible: true, allowedTransitions: ["awaiting_choice", "resolving", "expired", "failed", "cancelled"], presentationToken: "event_active" },
  { id: "awaiting_choice", displayName: "Awaiting Choice", terminal: false, playerVisible: true, allowedTransitions: ["resolving", "expired", "cancelled"], presentationToken: "event_choice" },
  { id: "resolving", displayName: "Resolving", terminal: false, playerVisible: true, allowedTransitions: ["resolved", "failed", "archived"], presentationToken: "event_resolving" },
  { id: "resolved", displayName: "Resolved", terminal: true, playerVisible: true, allowedTransitions: ["archived"], presentationToken: "event_resolved" },
  { id: "expired", displayName: "Expired", terminal: true, playerVisible: true, allowedTransitions: ["archived"], presentationToken: "event_expired" },
  { id: "failed", displayName: "Failed", terminal: true, playerVisible: true, allowedTransitions: ["archived"], presentationToken: "event_failed" },
  { id: "cancelled", displayName: "Cancelled", terminal: true, playerVisible: true, allowedTransitions: ["archived"], presentationToken: "event_cancelled" },
  { id: "archived", displayName: "Archived", terminal: true, playerVisible: false, allowedTransitions: [], presentationToken: "event_archived" }
];

const triggerIds = [
  "time_elapsed", "action_started", "action_completed", "action_failed", "mission_started", "mission_completed", "expedition_phase", "discovery_state_changed", "knowledge_state_changed", "registry_claim", "colony_stage_changed", "colony_focus_changed", "colony_shortage", "colony_surplus", "population_threshold", "wellbeing_threshold", "resource_threshold", "storage_capacity_threshold", "route_disruption", "shipment_state_changed", "production_bottleneck", "research_completed", "building_constructed", "building_failed", "identity_threshold", "identity_trend", "progression_stage", "milestone_completed", "hazard_threshold", "celestial_condition", "anomaly_detected", "random_window_with_conditions", "story_hook", "manual_authorized"
] as const;

const eventTriggerPolicies: DynamicEventTriggerPolicyDefinition[] = triggerIds.map((id) => ({
  id,
  displayName: id.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "),
  sourceSystemIds: id.includes("mission") || id.includes("expedition") ? ["mission_expedition"] : id.includes("resource") || id.includes("route") || id.includes("shipment") || id.includes("storage") || id.includes("production") ? ["resource_economy_logistics"] : id.includes("colony") ? ["colonization"] : id.includes("identity") ? ["civilization_identity"] : id.includes("progression") || id.includes("milestone") ? ["civilization_progression"] : id.includes("discovery") || id.includes("knowledge") || id.includes("registry") ? ["discovery", "universal_discovery_registry"] : id.includes("action") ? ["action_system"] : ["runtime"],
  canonicalReasonCode: `event_trigger_${id}`,
  protectedResolutionRequired: ["registry_claim", "mission_completed", "expedition_phase", "shipment_state_changed", "manual_authorized"].includes(id),
  notes: "Canonical trigger contract. The Game evaluates live state and owns active Event instances."
}));

const eventEligibilityDefinitions = [
  { id: "known_target", displayName: "Known Target", dependsOn: ["knowledge_state", "target_type"], blockerReasonCodes: ["target_unknown", "knowledge_locked"], cooldownPolicy: "none", knowledgeSafe: true, notes: "Do not reveal hidden target identity until visibility allows it." },
  { id: "colony_operational", displayName: "Colony Operational", dependsOn: ["colony_stage", "colony_status"], blockerReasonCodes: ["colony_missing", "colony_not_operational"], cooldownPolicy: "per_colony", knowledgeSafe: true, notes: "Requires a Game-owned colony instance." },
  { id: "logistics_pressure", displayName: "Logistics Pressure", dependsOn: ["route_access", "storage_state", "shipment_state"], blockerReasonCodes: ["route_missing", "shipment_unavailable"], cooldownPolicy: "per_route", knowledgeSafe: true, notes: "Used by shortage, delay, and route events." },
  { id: "discovery_signal", displayName: "Discovery Signal", dependsOn: ["discovery_state", "scan_level", "registry_state"], blockerReasonCodes: ["signal_hidden", "scan_required"], cooldownPolicy: "once_per_target", knowledgeSafe: true, notes: "Supports anomaly, artifact, and rare matter events." },
  { id: "identity_trend_present", displayName: "Identity Trend Present", dependsOn: ["civilization_identity", "identity_trend"], blockerReasonCodes: ["identity_threshold_missing"], cooldownPolicy: "per_civilization", knowledgeSafe: true, notes: "Choices may influence identity only through approved hooks." },
  { id: "progression_transition", displayName: "Progression Transition", dependsOn: ["civilization_stage", "milestone"], blockerReasonCodes: ["stage_requirement_missing"], cooldownPolicy: "once_per_civilization", knowledgeSafe: true, notes: "Recognition only; does not duplicate progression logic." },
  { id: "population_hook_available", displayName: "Population Hook Available", dependsOn: [populationSimulationFramework.id], blockerReasonCodes: [], cooldownPolicy: "population_simulation_framework", knowledgeSafe: true, notes: "Population Simulation Framework is published; Dynamic Events use its hooks without owning live population state." }
];

const eventProbabilityPolicies: DynamicEventProbabilityPolicyDefinition[] = [
  "guaranteed", "weighted", "threshold_based", "windowed", "escalating_chance", "diminishing_chance", "cooldown_based", "chain_dependent", "once_per_target", "once_per_civilization", "recurring", "event_pool_selection"
].map((id) => ({ id, displayName: id.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "), deterministic: true, balanceStatus: "provisional", notes: "Probability uses deterministic seed policies and provisional balance values; no uncontrolled Math.random semantics." } as DynamicEventProbabilityPolicyDefinition));

const eventDeterministicSeedPolicies: DynamicEventDeterministicSeedPolicy[] = [
  { id: "seed_target_time_bucket", displayName: "Target Time Bucket", seedInputs: ["universeSeed", "targetCanonicalId", "eventDefinitionId", "timeBucket", "contentVersion"], forbidsUncontrolledRandom: true, notes: "Default repeatable target event seed." },
  { id: "seed_civilization_history", displayName: "Civilization History", seedInputs: ["universeSeed", "civilizationId", "eventDefinitionId", "contentVersion", "priorEventCount"], forbidsUncontrolledRandom: true, notes: "Used by identity, progression, and civilization events." },
  { id: "seed_chain_step", displayName: "Chain Step", seedInputs: ["universeSeed", "targetCanonicalId", "eventDefinitionId", "timeBucket", "contentVersion", "priorEventCount"], forbidsUncontrolledRandom: true, notes: "Used by event chains and branching resolution." }
];

const eventSeverityDefinitions: DynamicEventSeverityDefinition[] = [
  ["trivial", "Trivial", 1, 1, "cosmetic or informational", "silent_or_log_only", false, "not_recorded"],
  ["minor", "Minor", 2, 2, "small local modifier", "toast_optional", false, "local_record"],
  ["moderate", "Moderate", 3, 3, "bounded operational modifier", "notification", true, "colony_record"],
  ["major", "Major", 4, 4, "important colony or route modifier", "acknowledge", true, "civilization_record"],
  ["severe", "Severe", 5, 5, "large temporary modifier or protected risk", "acknowledge_required", true, "civilization_record"],
  ["critical", "Critical", 6, 6, "critical crisis modifier requiring protected resolution", "modal_or_priority_notification", true, "galactic_record"],
  ["civilization_defining", "Civilization Defining", 7, 7, "historical civilization-wide effect", "historical_acknowledgement", true, "galactic_record"]
].map(([id, displayName, urgency, notificationPriority, allowedEffectMagnitude, acknowledgementPolicy, missionGenerationEligible, historicalSignificance]) => ({ id, displayName, urgency, notificationPriority, allowedEffectMagnitude, acknowledgementPolicy, missionGenerationEligible, historicalSignificance, presentationToken: `event_severity_${id}` } as DynamicEventSeverityDefinition));

const eventDurationClasses = [
  { id: "instant_resolution", displayName: "Instant Resolution", actionDurationReference: null, notes: "Resolves at trigger or server acknowledgement." },
  { id: "short_window", displayName: "Short Window", actionDurationReference: "duration_short", notes: "Short response window; Game owns timestamp." },
  { id: "timed", displayName: "Timed", actionDurationReference: "duration_standard", notes: "Uses canonical Action duration semantics where applicable." },
  { id: "persistent_until_resolved", displayName: "Persistent Until Resolved", actionDurationReference: null, notes: "Persists until Game-owned conditions resolve." },
  { id: "multi_phase", displayName: "Multi Phase", actionDurationReference: "duration_project", notes: "Moves through warning/onset/response/aftermath phases." },
  { id: "recurring_window", displayName: "Recurring Window", actionDurationReference: null, notes: "Evaluated in deterministic windows." },
  { id: "permanent_historical", displayName: "Permanent Historical", actionDurationReference: null, notes: "Creates history or registry/timeline significance only." }
] as DynamicEventFrameworkContract["eventDurationClasses"];

const eventPhaseDefinitions: DynamicEventPhaseDefinition[] = [
  ["warning", "Warning", 1, "short_window"],
  ["onset", "Onset", 2, "timed"],
  ["escalation", "Escalation", 3, "timed"],
  ["peak", "Peak", 4, "timed"],
  ["response", "Response", 5, "persistent_until_resolved"],
  ["stabilization", "Stabilization", 6, "timed"],
  ["aftermath", "Aftermath", 7, "short_window"],
  ["resolved", "Resolved", 8, "instant_resolution"]
].map(([id, displayName, order, defaultDurationClassId]) => ({ id, displayName, order, defaultDurationClassId, notes: "Renderer-independent phase contract." } as DynamicEventPhaseDefinition));

const effectIds = [
  "duration_modifier", "action_speed_modifier", "action_cost_modifier", "resource_output_modifier", "resource_consumption_modifier", "storage_modifier", "route_modifier", "shipment_risk_modifier", "production_modifier", "research_modifier", "colony_capacity_modifier", "colony_stability_modifier", "hazard_modifier", "knowledge_reveal", "discovery_opportunity", "mission_generation", "expedition_generation", "building_damage_hook", "building_bonus_hook", "population_growth_hook", "migration_hook", "wellbeing_hook", "identity_influence", "progression_progress", "market_modifier", "temporary_unlock", "permanent_unlock", "timeline_entry", "encyclopedia_reveal", "registry_hook"
] as const;

const eventEffectDefinitions: DynamicEventEffectDefinition[] = effectIds.map((id) => ({
  id,
  displayName: id.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "),
  targetSystemIds: id.includes("population") || id.includes("migration") || id.includes("wellbeing") ? [populationSimulationFramework.id] : id.includes("mission") || id.includes("expedition") ? ["mission_expedition"] : id.includes("resource") || id.includes("route") || id.includes("shipment") || id.includes("storage") || id.includes("production") || id.includes("market") ? ["resource_economy_logistics"] : id.includes("identity") ? ["civilization_identity"] : id.includes("progression") ? ["civilization_progression"] : id.includes("knowledge") || id.includes("discovery") || id.includes("registry") ? ["discovery", "universal_discovery_registry"] : ["action_system"],
  studioMutatesPlayerState: false,
  protectedResolutionRequired: ["building_damage_hook", "permanent_unlock", "registry_hook", "mission_generation", "expedition_generation"].includes(id),
  notes: "Effect contract only. The Game resolves active modifiers and player state."
}));

const eventChoiceDefinitions: DynamicEventChoiceDefinition[] = [
  { id: "investigate", displayName: "Investigate", actionIds: ["probe_scan", "survey_planet", "analyze_anomaly"], requirementReasonCodes: ["requires_knowledge_access"], outcomeEffectTypeIds: ["knowledge_reveal", "discovery_opportunity"], irreversible: false, requiresPlayerConfirmation: false, timelinePolicyId: "local_record", notes: "Investigate without revealing hidden results early." },
  { id: "ignore", displayName: "Ignore", actionIds: [], requirementReasonCodes: [], outcomeEffectTypeIds: ["timeline_entry"], irreversible: false, requiresPlayerConfirmation: false, timelinePolicyId: "not_recorded", notes: "No immediate action." },
  { id: "evacuate", displayName: "Evacuate", actionIds: ["transfer_resources", "travel_to_destination"], requirementReasonCodes: ["requires_population_framework"], outcomeEffectTypeIds: ["migration_hook", "wellbeing_hook"], irreversible: true, requiresPlayerConfirmation: true, timelinePolicyId: "colony_record", notes: "Population hook only until Population Simulation exists." },
  { id: "repair", displayName: "Repair", actionIds: ["construct_building"], requirementReasonCodes: ["requires_repair_action_future"], outcomeEffectTypeIds: ["building_bonus_hook", "colony_stability_modifier"], irreversible: false, requiresPlayerConfirmation: false, timelinePolicyId: "local_record", notes: "Uses construction hook until a dedicated repair Action is added." },
  { id: "reinforce", displayName: "Reinforce", actionIds: ["construct_building", "transfer_resources"], requirementReasonCodes: ["requires_resources"], outcomeEffectTypeIds: ["hazard_modifier", "colony_stability_modifier"], irreversible: false, requiresPlayerConfirmation: false, timelinePolicyId: "local_record", notes: "Strengthen defenses or capacity." },
  { id: "exploit", displayName: "Exploit", actionIds: ["deploy_automated_extraction", "build_mining_outpost"], requirementReasonCodes: ["requires_development_eligibility"], outcomeEffectTypeIds: ["resource_output_modifier", "identity_influence"], irreversible: false, requiresPlayerConfirmation: true, timelinePolicyId: "colony_record", notes: "Economic opportunity with possible identity influence." },
  { id: "preserve", displayName: "Preserve", actionIds: ["designate_preserve"], requirementReasonCodes: ["requires_preservation_eligibility"], outcomeEffectTypeIds: ["identity_influence", "progression_progress"], irreversible: false, requiresPlayerConfirmation: true, timelinePolicyId: "civilization_record", notes: "Preservation branch." },
  { id: "research", displayName: "Research", actionIds: ["conduct_research", "analyze_artifact"], requirementReasonCodes: ["requires_research_access"], outcomeEffectTypeIds: ["research_modifier", "encyclopedia_reveal"], irreversible: false, requiresPlayerConfirmation: false, timelinePolicyId: "local_record", notes: "Research response." },
  { id: "quarantine", displayName: "Quarantine", actionIds: ["transfer_resources"], requirementReasonCodes: ["requires_population_framework"], outcomeEffectTypeIds: ["wellbeing_hook", "route_modifier"], irreversible: true, requiresPlayerConfirmation: true, timelinePolicyId: "colony_record", notes: "Population/route hook only." },
  { id: "trade", displayName: "Trade", actionIds: ["establish_trade_route", "transfer_resources"], requirementReasonCodes: ["requires_market_access"], outcomeEffectTypeIds: ["market_modifier", "route_modifier"], irreversible: false, requiresPlayerConfirmation: false, timelinePolicyId: "local_record", notes: "Trade response." },
  { id: "automate", displayName: "Automate", actionIds: ["deploy_automated_extraction"], requirementReasonCodes: ["requires_ai_policy"], outcomeEffectTypeIds: ["production_modifier", "identity_influence"], irreversible: false, requiresPlayerConfirmation: true, timelinePolicyId: "local_record", notes: "AI may recommend but not choose irreversible branches." },
  { id: "manually_intervene", displayName: "Manually Intervene", actionIds: ["transfer_resources"], requirementReasonCodes: ["requires_player_confirmation"], outcomeEffectTypeIds: ["action_speed_modifier"], irreversible: false, requiresPlayerConfirmation: true, timelinePolicyId: "local_record", notes: "Explicit player intervention." },
  { id: "reroute", displayName: "Reroute", actionIds: ["reroute_shipment", "transfer_resources"], requirementReasonCodes: ["requires_route_access"], outcomeEffectTypeIds: ["route_modifier", "shipment_risk_modifier"], irreversible: false, requiresPlayerConfirmation: false, timelinePolicyId: "local_record", notes: "Uses existing logistics Action." },
  { id: "abandon", displayName: "Abandon", actionIds: [], requirementReasonCodes: ["requires_irreversible_confirmation"], outcomeEffectTypeIds: ["timeline_entry"], irreversible: true, requiresPlayerConfirmation: true, timelinePolicyId: "colony_record", notes: "Abandon response hook only; Game owns active state." },
  { id: "rescue", displayName: "Rescue", actionIds: ["travel_to_destination", "create_shipment", "unload_shipment"], requirementReasonCodes: ["requires_route_access"], outcomeEffectTypeIds: ["mission_generation", "wellbeing_hook"], irreversible: false, requiresPlayerConfirmation: true, timelinePolicyId: "colony_record", notes: "Creates rescue mission/expedition hooks." },
  { id: "share_discovery", displayName: "Share Discovery", actionIds: ["catalog_planet"], requirementReasonCodes: ["requires_registry_access"], outcomeEffectTypeIds: ["registry_hook", "timeline_entry"], irreversible: true, requiresPlayerConfirmation: true, timelinePolicyId: "civilization_record", notes: "Registry claim remains backend-owned." },
  { id: "secure_artifact", displayName: "Secure Artifact", actionIds: ["analyze_artifact", "create_shipment"], requirementReasonCodes: ["requires_artifact_access"], outcomeEffectTypeIds: ["registry_hook", "mission_generation"], irreversible: false, requiresPlayerConfirmation: true, timelinePolicyId: "civilization_record", notes: "Artifact containment branch." },
  { id: "donate_artifact", displayName: "Donate Artifact", actionIds: ["analyze_artifact"], requirementReasonCodes: ["requires_artifact_access"], outcomeEffectTypeIds: ["identity_influence", "encyclopedia_reveal"], irreversible: true, requiresPlayerConfirmation: true, timelinePolicyId: "civilization_record", notes: "Lore/civilization branch." },
  { id: "begin_mission", displayName: "Begin Mission", actionIds: [], requirementReasonCodes: ["requires_mission_eligibility"], outcomeEffectTypeIds: ["mission_generation"], irreversible: false, requiresPlayerConfirmation: true, timelinePolicyId: "local_record", notes: "Uses Mission & Expedition Framework; does not duplicate mission definitions." },
  { id: "deploy_expedition", displayName: "Deploy Expedition", actionIds: ["travel_to_destination"], requirementReasonCodes: ["requires_expedition_eligibility"], outcomeEffectTypeIds: ["expedition_generation"], irreversible: false, requiresPlayerConfirmation: true, timelinePolicyId: "colony_record", notes: "Expedition instance remains Game-owned." }
];

const eventResolutionPolicies: DynamicEventResolutionPolicyDefinition[] = [
  ["automatic", "Automatic", false, ["triggerId", "targetId"]],
  ["choice_based", "Choice Based", false, ["choiceId", "targetId", "eventId"]],
  ["action_based", "Action Based", false, ["actionCompletionId", "eventId"]],
  ["mission_based", "Mission Based", true, ["missionId", "eventId"]],
  ["timed", "Timed", false, ["timeBucket", "eventId"]],
  ["threshold_based", "Threshold Based", true, ["thresholdId", "targetId"]],
  ["multi_stage", "Multi Stage", true, ["chainId", "phaseId", "eventId"]],
  ["server_authoritative", "Server Authoritative", true, ["serverEventId", "eventId"]],
  ["deterministic_roll", "Deterministic Roll", true, ["seedPolicyId", "targetId", "contentVersion"]],
  ["weighted_outcome", "Weighted Outcome", true, ["seedPolicyId", "weightTableId", "targetId"]]
].map(([id, displayName, protectedOutcome, deterministicInputs]) => ({ id, displayName, protectedOutcome, gameOwnsResolvedOutcome: true, deterministicInputs, notes: "Resolution policy only; Game owns selected outcomes and protected server validation." } as DynamicEventResolutionPolicyDefinition));

const eventFailurePolicies: DynamicEventFrameworkContract["eventFailurePolicies"] = [
  { id: "expire_without_response", displayName: "Expire Without Response", reasonCodes: ["event_expired", "choice_window_elapsed"], recoveryChoiceIds: ["begin_mission"], missionHookIds: ["template_research_sample_return"], notes: "Can generate recovery mission if eligible." },
  { id: "resolve_to_damage_hook", displayName: "Resolve To Damage Hook", reasonCodes: ["protected_resolution_failed", "hazard_peak_reached"], recoveryChoiceIds: ["repair", "rescue"], missionHookIds: ["template_colony_supply_run"], notes: "Damage is a hook; Game owns exact active state." },
  { id: "defer_until_reconnect", displayName: "Defer Until Reconnect", reasonCodes: ["server_verification_required"], recoveryChoiceIds: ["manually_intervene"], missionHookIds: [], notes: "Protected outcomes wait for authoritative resolution." }
];

const eventKnowledgeVisibility: DynamicEventKnowledgeVisibilityRule[] = [
  { id: "event_unknown", knowledgeStateId: "unknown", canShowName: false, canShowTargetRegistry: false, canShowResources: false, canShowArtifacts: false, canShowLifeforms: false, fallbackText: "???", notes: "No hidden object details." },
  { id: "event_detected", knowledgeStateId: "detected", canShowName: false, canShowTargetRegistry: false, canShowResources: false, canShowArtifacts: false, canShowLifeforms: false, fallbackText: "Signal Detected", notes: "Silhouette or signal only." },
  { id: "event_probed", knowledgeStateId: "probed", canShowName: true, canShowTargetRegistry: false, canShowResources: false, canShowArtifacts: false, canShowLifeforms: false, fallbackText: "Unknown", notes: "Basic target name allowed." },
  { id: "event_scanned", knowledgeStateId: "scanned", canShowName: true, canShowTargetRegistry: true, canShowResources: true, canShowArtifacts: false, canShowLifeforms: false, fallbackText: "Unknown", notes: "Scanned data allowed." },
  { id: "event_charted", knowledgeStateId: "charted", canShowName: true, canShowTargetRegistry: true, canShowResources: true, canShowArtifacts: true, canShowLifeforms: false, fallbackText: "Unknown", notes: "Charted discoveries may show artifact hints." },
  { id: "event_explored", knowledgeStateId: "explored", canShowName: true, canShowTargetRegistry: true, canShowResources: true, canShowArtifacts: true, canShowLifeforms: true, fallbackText: "Unknown", notes: "Full public preview allowed." }
];

const eventTimelineSignificancePolicies: DynamicEventTimelineSignificancePolicy[] = [
  { id: "not_recorded", displayName: "Not Recorded", createsTimelineDefinition: false, scope: "none", notes: "No timeline entry." },
  { id: "local_record", displayName: "Local Record", createsTimelineDefinition: true, scope: "local object", notes: "May appear in local history." },
  { id: "colony_record", displayName: "Colony Record", createsTimelineDefinition: true, scope: "colony or route", notes: "Colony or logistics history." },
  { id: "civilization_record", displayName: "Civilization Record", createsTimelineDefinition: true, scope: "civilization", notes: "Civilization timeline definition." },
  { id: "galactic_record", displayName: "Galactic Record", createsTimelineDefinition: true, scope: "universal registry", notes: "Civilization-defining or registry-relevant record." }
];

function eventDefinition(input: Partial<DynamicEventDefinition> & Pick<DynamicEventDefinition, "id" | "displayName" | "categoryId" | "eventTypeId" | "triggerPolicyIds" | "effectTypeIds" | "choiceIds">): DynamicEventDefinition {
  return {
    publicDescription: `${input.displayName} has been detected by canonical conditions.`,
    hiddenDescriptionPolicy: "Use knowledge-safe text until target visibility allows deeper details.",
    sourceSystemId: input.categoryId,
    targetEntityTypes: ["civilization"],
    eligibilityIds: ["known_target"],
    probabilityPolicyId: "weighted",
    deterministicSeedPolicyId: "seed_target_time_bucket",
    severityId: "moderate",
    durationClassId: "timed",
    phaseIds: ["warning", "onset", "response", "resolved"],
    resolutionPolicyIds: ["choice_based", "server_authoritative"],
    failurePolicyIds: ["expire_without_response"],
    followUpEventIds: [],
    missionHookTemplateIds: [],
    actionReferenceIds: [],
    identityInfluenceIds: [],
    progressionMilestoneIds: [],
    presentationProfileId: "EventCard",
    timelineSignificanceId: "local_record",
    publicationStatus: "provisional",
    provisionalBalance: true,
    ...input
  };
}

const eventDefinitions: DynamicEventDefinition[] = [
  eventDefinition({ id: "elevated_stellar_activity", displayName: "Elevated Stellar Activity", categoryId: "stellar", eventTypeId: "ambient", triggerPolicyIds: ["celestial_condition"], effectTypeIds: ["hazard_modifier", "research_modifier"], choiceIds: ["investigate", "ignore"], followUpEventIds: ["solar_flare_warning"], actionReferenceIds: ["probe_scan"], severityId: "minor" }),
  eventDefinition({ id: "solar_flare_warning", displayName: "Solar Flare Warning", categoryId: "stellar", eventTypeId: "hazardous", triggerPolicyIds: ["hazard_threshold", "random_window_with_conditions"], effectTypeIds: ["hazard_modifier", "mission_generation"], choiceIds: ["reinforce", "research", "ignore"], followUpEventIds: ["peak_solar_flare"], missionHookTemplateIds: ["template_research_sample_return"], actionReferenceIds: ["conduct_research"], severityId: "major", durationClassId: "multi_phase" }),
  eventDefinition({ id: "peak_solar_flare", displayName: "Peak Solar Flare", categoryId: "stellar", eventTypeId: "crisis", triggerPolicyIds: ["time_elapsed"], effectTypeIds: ["building_damage_hook", "research_modifier", "timeline_entry"], choiceIds: ["repair", "research"], followUpEventIds: ["solar_science_followup"], severityId: "severe", timelineSignificanceId: "civilization_record" }),
  eventDefinition({ id: "solar_science_followup", displayName: "Solar Science Follow-Up", categoryId: "research", eventTypeId: "mission_triggered", triggerPolicyIds: ["mission_completed"], effectTypeIds: ["mission_generation", "research_modifier"], choiceIds: ["begin_mission", "research"], missionHookTemplateIds: ["template_research_sample_return"], severityId: "moderate" }),
  eventDefinition({ id: "stellar_radiation_surge", displayName: "Stellar Radiation Surge", categoryId: "stellar", eventTypeId: "disruptive", triggerPolicyIds: ["celestial_condition"], effectTypeIds: ["hazard_modifier", "action_cost_modifier"], choiceIds: ["reinforce", "reroute"], severityId: "major" }),
  eventDefinition({ id: "unusual_star_activity", displayName: "Unusual Star Activity", categoryId: "stellar", eventTypeId: "informational", triggerPolicyIds: ["celestial_condition"], effectTypeIds: ["discovery_opportunity", "research_modifier"], choiceIds: ["investigate", "begin_mission"], severityId: "minor" }),
  eventDefinition({ id: "meteor_activity", displayName: "Meteor Activity", categoryId: "planetary", eventTypeId: "hazardous", triggerPolicyIds: ["hazard_threshold"], effectTypeIds: ["hazard_modifier", "resource_output_modifier"], choiceIds: ["investigate", "reinforce"], severityId: "moderate" }),
  eventDefinition({ id: "geological_instability", displayName: "Geological Instability", categoryId: "geological", eventTypeId: "disruptive", triggerPolicyIds: ["hazard_threshold", "celestial_condition"], effectTypeIds: ["production_modifier", "hazard_modifier"], choiceIds: ["research", "repair"], severityId: "major" }),
  eventDefinition({ id: "atmospheric_superstorm", displayName: "Atmospheric Superstorm", categoryId: "atmospheric", eventTypeId: "crisis", triggerPolicyIds: ["hazard_threshold"], effectTypeIds: ["route_modifier", "colony_stability_modifier"], choiceIds: ["evacuate", "reinforce", "quarantine"], severityId: "severe" }),
  eventDefinition({ id: "rare_biological_bloom", displayName: "Rare Biological Bloom", categoryId: "biological", eventTypeId: "opportunity", triggerPolicyIds: ["discovery_state_changed"], effectTypeIds: ["discovery_opportunity", "research_modifier"], choiceIds: ["research", "preserve", "exploit"], severityId: "moderate", timelineSignificanceId: "civilization_record" }),
  eventDefinition({ id: "weak_signal_detected", displayName: "Weak Signal Detected", categoryId: "anomalous", eventTypeId: "discovery_triggered", triggerPolicyIds: ["anomaly_detected"], effectTypeIds: ["knowledge_reveal"], choiceIds: ["investigate", "ignore"], followUpEventIds: ["unknown_signal_intensifies"], severityId: "minor" }),
  eventDefinition({ id: "unknown_signal_intensifies", displayName: "Unknown Signal Intensifies", categoryId: "discovery", eventTypeId: "chain", triggerPolicyIds: ["time_elapsed", "knowledge_state_changed"], effectTypeIds: ["mission_generation", "discovery_opportunity"], choiceIds: ["begin_mission", "deploy_expedition"], followUpEventIds: ["artifact_resonance"], missionHookTemplateIds: ["template_archaeological_recovery"], severityId: "moderate" }),
  eventDefinition({ id: "artifact_resonance", displayName: "Artifact Resonance", categoryId: "artifact", eventTypeId: "branching", triggerPolicyIds: ["mission_completed"], effectTypeIds: ["registry_hook", "encyclopedia_reveal"], choiceIds: ["secure_artifact", "donate_artifact", "research"], followUpEventIds: ["ancient_ruin_activation"], severityId: "major", timelineSignificanceId: "civilization_record" }),
  eventDefinition({ id: "ancient_ruin_activation", displayName: "Ancient Ruin Activation", categoryId: "archaeology", eventTypeId: "story", triggerPolicyIds: ["action_completed"], effectTypeIds: ["discovery_opportunity", "mission_generation", "registry_hook"], choiceIds: ["secure_artifact", "begin_mission"], missionHookTemplateIds: ["template_archaeological_recovery"], severityId: "major" }),
  eventDefinition({ id: "rare_matter_signature", displayName: "Rare Matter Signature", categoryId: "resource", eventTypeId: "opportunity", triggerPolicyIds: ["discovery_state_changed"], effectTypeIds: ["resource_output_modifier", "mission_generation"], choiceIds: ["investigate", "exploit", "preserve"], severityId: "moderate" }),
  eventDefinition({ id: "colony_supply_pressure", displayName: "Colony Supply Pressure", categoryId: "colony", eventTypeId: "colony_triggered", triggerPolicyIds: ["colony_shortage"], effectTypeIds: ["resource_consumption_modifier", "mission_generation"], choiceIds: ["reroute", "trade", "automate"], followUpEventIds: ["critical_shortage"], missionHookTemplateIds: ["template_colony_supply_run"], severityId: "moderate" }),
  eventDefinition({ id: "critical_shortage", displayName: "Critical Shortage", categoryId: "colony", eventTypeId: "crisis", triggerPolicyIds: ["resource_threshold", "storage_capacity_threshold"], effectTypeIds: ["colony_stability_modifier", "wellbeing_hook"], choiceIds: ["reroute", "trade", "evacuate", "rescue"], followUpEventIds: ["shortage_stabilized", "shortage_crisis"], severityId: "critical", resolutionPolicyIds: ["choice_based", "server_authoritative", "threshold_based"] }),
  eventDefinition({ id: "shortage_stabilized", displayName: "Shortage Stabilized", categoryId: "celebration", eventTypeId: "beneficial", triggerPolicyIds: ["shipment_state_changed"], effectTypeIds: ["timeline_entry", "progression_progress"], choiceIds: ["share_discovery"], severityId: "minor" }),
  eventDefinition({ id: "shortage_crisis", displayName: "Shortage Crisis", categoryId: "crisis", eventTypeId: "crisis", triggerPolicyIds: ["time_elapsed"], effectTypeIds: ["colony_stability_modifier", "mission_generation"], choiceIds: ["rescue", "abandon"], severityId: "critical", timelineSignificanceId: "civilization_record" }),
  eventDefinition({ id: "life_support_efficiency_gain", displayName: "Life Support Efficiency Gain", categoryId: "infrastructure", eventTypeId: "beneficial", triggerPolicyIds: ["building_constructed"], effectTypeIds: ["resource_consumption_modifier", "colony_capacity_modifier"], choiceIds: ["automate", "research"], severityId: "minor" }),
  eventDefinition({ id: "habitat_capacity_warning", displayName: "Habitat Capacity Warning", categoryId: "population", eventTypeId: "informational", triggerPolicyIds: ["population_threshold"], effectTypeIds: ["colony_capacity_modifier", "population_growth_hook"], choiceIds: ["reinforce", "begin_mission"], severityId: "moderate" }),
  eventDefinition({ id: "specialist_shortage", displayName: "Specialist Shortage", categoryId: "population", eventTypeId: "disruptive", triggerPolicyIds: ["wellbeing_threshold", "population_threshold"], effectTypeIds: ["production_modifier", "wellbeing_hook"], choiceIds: ["trade", "automate", "begin_mission"], severityId: "moderate" }),
  eventDefinition({ id: "route_disruption", displayName: "Route Disruption", categoryId: "logistics", eventTypeId: "logistics_triggered", triggerPolicyIds: ["route_disruption"], effectTypeIds: ["route_modifier", "shipment_risk_modifier"], choiceIds: ["reroute", "repair", "rescue"], severityId: "major" }),
  eventDefinition({ id: "shipment_delayed", displayName: "Shipment Delayed", categoryId: "logistics", eventTypeId: "disruptive", triggerPolicyIds: ["shipment_state_changed"], effectTypeIds: ["shipment_risk_modifier", "timeline_entry"], choiceIds: ["reroute", "manually_intervene"], severityId: "minor" }),
  eventDefinition({ id: "storage_near_capacity", displayName: "Storage Near Capacity", categoryId: "economy", eventTypeId: "informational", triggerPolicyIds: ["storage_capacity_threshold"], effectTypeIds: ["storage_modifier", "market_modifier"], choiceIds: ["trade", "reroute"], severityId: "minor" }),
  eventDefinition({ id: "production_breakthrough", displayName: "Production Breakthrough", categoryId: "production", eventTypeId: "beneficial", triggerPolicyIds: ["production_bottleneck", "action_completed"], effectTypeIds: ["production_modifier", "identity_influence"], choiceIds: ["automate", "share_discovery"], severityId: "moderate" }),
  eventDefinition({ id: "resource_vein_depletion", displayName: "Resource Vein Depletion", categoryId: "resource", eventTypeId: "disruptive", triggerPolicyIds: ["resource_threshold"], effectTypeIds: ["resource_output_modifier", "mission_generation"], choiceIds: ["begin_mission", "exploit"], severityId: "moderate" }),
  eventDefinition({ id: "unexpected_resource_deposit", displayName: "Unexpected Resource Deposit", categoryId: "resource", eventTypeId: "opportunity", triggerPolicyIds: ["anomaly_detected"], effectTypeIds: ["resource_output_modifier", "discovery_opportunity"], choiceIds: ["investigate", "exploit", "preserve"], severityId: "moderate" }),
  eventDefinition({ id: "scientific_breakthrough", displayName: "Scientific Breakthrough", categoryId: "research", eventTypeId: "beneficial", triggerPolicyIds: ["research_completed"], effectTypeIds: ["research_modifier", "encyclopedia_reveal"], choiceIds: ["share_discovery", "research"], severityId: "major", timelineSignificanceId: "civilization_record" }),
  eventDefinition({ id: "experiment_anomaly", displayName: "Experiment Anomaly", categoryId: "research", eventTypeId: "branching", triggerPolicyIds: ["action_completed"], effectTypeIds: ["research_modifier", "hazard_modifier"], choiceIds: ["quarantine", "research", "ignore"], severityId: "major" }),
  eventDefinition({ id: "research_collaboration_opportunity", displayName: "Research Collaboration Opportunity", categoryId: "research", eventTypeId: "opportunity", triggerPolicyIds: ["identity_threshold"], effectTypeIds: ["research_modifier", "identity_influence"], choiceIds: ["trade", "research"], severityId: "minor" }),
  eventDefinition({ id: "ai_optimization_proposal", displayName: "AI Optimization Proposal", categoryId: "ai_agent", eventTypeId: "opportunity", triggerPolicyIds: ["production_bottleneck"], effectTypeIds: ["production_modifier", "identity_influence"], choiceIds: ["automate", "manually_intervene", "ignore"], followUpEventIds: ["ai_efficiency_outcome"], severityId: "minor" }),
  eventDefinition({ id: "ai_efficiency_outcome", displayName: "AI Efficiency Outcome", categoryId: "automation", eventTypeId: "beneficial", triggerPolicyIds: ["action_completed"], effectTypeIds: ["action_speed_modifier", "identity_influence"], choiceIds: ["share_discovery"], severityId: "minor" }),
  eventDefinition({ id: "automation_fault", displayName: "Automation Fault", categoryId: "automation", eventTypeId: "disruptive", triggerPolicyIds: ["action_failed"], effectTypeIds: ["production_modifier", "building_damage_hook"], choiceIds: ["repair", "manually_intervene"], severityId: "moderate" }),
  eventDefinition({ id: "autonomous_system_breakthrough", displayName: "Autonomous System Breakthrough", categoryId: "automation", eventTypeId: "beneficial", triggerPolicyIds: ["research_completed"], effectTypeIds: ["permanent_unlock", "identity_influence"], choiceIds: ["automate", "share_discovery"], severityId: "major" }),
  eventDefinition({ id: "identity_milestone_recognition", displayName: "Identity Milestone Recognition", categoryId: "identity", eventTypeId: "milestone", triggerPolicyIds: ["identity_threshold"], effectTypeIds: ["identity_influence", "timeline_entry"], choiceIds: ["share_discovery"], severityId: "major", timelineSignificanceId: "civilization_record" }),
  eventDefinition({ id: "first_colony_celebration", displayName: "First Colony Celebration", categoryId: "celebration", eventTypeId: "milestone", triggerPolicyIds: ["milestone_completed"], effectTypeIds: ["progression_progress", "timeline_entry"], choiceIds: ["share_discovery"], severityId: "major", timelineSignificanceId: "civilization_record" }),
  eventDefinition({ id: "progression_stage_transition", displayName: "Progression Stage Transition", categoryId: "progression", eventTypeId: "progression_triggered", triggerPolicyIds: ["progression_stage"], effectTypeIds: ["progression_progress", "timeline_entry"], choiceIds: ["share_discovery"], severityId: "civilization_defining", timelineSignificanceId: "galactic_record" }),
  eventDefinition({ id: "expedition_distress_signal", displayName: "Expedition Distress Signal", categoryId: "expedition", eventTypeId: "mission_triggered", triggerPolicyIds: ["expedition_phase"], effectTypeIds: ["mission_generation", "expedition_generation"], choiceIds: ["rescue", "reroute"], missionHookTemplateIds: ["template_colony_supply_run"], severityId: "major" }),
  eventDefinition({ id: "lost_probe_signal", displayName: "Lost Probe Signal", categoryId: "mission", eventTypeId: "mission_triggered", triggerPolicyIds: ["action_failed"], effectTypeIds: ["mission_generation", "discovery_opportunity"], choiceIds: ["begin_mission", "ignore"], missionHookTemplateIds: ["template_first_planetary_survey"], severityId: "minor" }),
  eventDefinition({ id: "recovery_opportunity", displayName: "Recovery Opportunity", categoryId: "opportunity", eventTypeId: "opportunity", triggerPolicyIds: ["mission_completed"], effectTypeIds: ["mission_generation", "resource_output_modifier"], choiceIds: ["begin_mission", "deploy_expedition"], severityId: "moderate" })
];

const eventChainDefinitions: DynamicEventChainDefinition[] = [
  { id: "solar_activity_chain", displayName: "Solar Activity Chain", eventIds: ["elevated_stellar_activity", "solar_flare_warning", "peak_solar_flare", "solar_science_followup"], branchEventIds: ["stellar_radiation_surge"], terminalEventIds: ["solar_science_followup"], deterministicChainRule: "stellarSeed + starId + chainStep + contentVersion", notes: "Warning, response, peak, resolution, and scientific follow-up." },
  { id: "ancient_signal_chain", displayName: "Ancient Signal Chain", eventIds: ["weak_signal_detected", "unknown_signal_intensifies", "artifact_resonance", "ancient_ruin_activation"], branchEventIds: ["rare_matter_signature"], terminalEventIds: ["ancient_ruin_activation"], deterministicChainRule: "signalSeed + discoveryId + chainStep + contentVersion", notes: "Signal, probe opportunity, mission, artifact/anomaly, registry/timeline hook." },
  { id: "colony_shortage_chain", displayName: "Colony Shortage Chain", eventIds: ["colony_supply_pressure", "critical_shortage", "shortage_stabilized"], branchEventIds: ["shortage_crisis"], terminalEventIds: ["shortage_stabilized", "shortage_crisis"], deterministicChainRule: "colonyId + shortageReasonCode + chainStep + contentVersion", notes: "Supply pressure, critical shortage, response choices, stabilization or crisis, recovery mission." },
  { id: "ai_optimization_chain", displayName: "AI Optimization Chain", eventIds: ["ai_optimization_proposal", "ai_efficiency_outcome"], branchEventIds: ["automation_fault", "autonomous_system_breakthrough"], terminalEventIds: ["ai_efficiency_outcome", "automation_fault", "autonomous_system_breakthrough"], deterministicChainRule: "aiAgentId + productionNodeId + chainStep + contentVersion", notes: "AI recommendation, review, outcome, identity effect, and future AI hook." }
];

const eventPresentationContract: DynamicEventPresentationContract[] = [
  "EventCard", "EventNotification", "EventDetail", "EventChoicePanel", "EventSeverityBadge", "EventPhaseStepper", "EventTimer", "EventEffectSummary", "EventRequirementSummary", "EventResolutionReport", "EventChainProgress", "EventHistoryEntry", "EventMissionLink", "EventTimelineSignificance", "KnowledgeSafeEventPreview"
].map((id) => ({ id, displayName: id.replace(/([A-Z])/g, " $1").trim(), rendererIndependent: true, semanticFields: ["id", "displayName", "status", "severity", "knowledgeVisibility", "choices"], notes: "Renderer-independent semantic contract only. Clients own final UI." } as DynamicEventPresentationContract));

const missingCanonicalDefinitions: DynamicEventMissingCanonicalDefinition[] = [
  { id: "dedicated_repair_action", type: "action", displayName: "Dedicated Repair Action", referencedBy: ["repair choice", "building damage hooks"], severity: "info", recommendedOwner: "Action System", notes: "Current framework uses construct_building as a canonical repair-adjacent hook." },
  { id: "dedicated_evacuation_action", type: "action", displayName: "Dedicated Evacuation Action", referencedBy: ["evacuate choice"], severity: "info", recommendedOwner: "Action System", notes: "Population evacuation currently uses transfer_population and travel_to_destination; a dedicated Action can follow if design requires it." },
  { id: "dynamic_event_art", type: "asset", displayName: "Dynamic Event Art", referencedBy: ["Creative Production", "Asset Library"], severity: "info", recommendedOwner: "Asset Library", notes: "Do not create fake game screens or final art." },
  { id: "event_encyclopedia_entries", type: "encyclopedia_entry", displayName: "Event Encyclopedia Entries", referencedBy: ["Encyclopedia"], severity: "info", recommendedOwner: "Encyclopedia", notes: "Sections are declared; authored entries can follow." }
];

export const dynamicEventFramework: DynamicEventFrameworkContract = {
  id: "dynamic_event_framework_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-DYNAMIC-EVENT-FRAMEWORK",
  actionSystemId: canonicalActionSystem.id,
  planetDevelopmentFrameworkId: planetDevelopmentFramework.id,
  civilizationProgressionFrameworkId: civilizationProgressionFramework.id,
  colonizationFrameworkId: colonizationFramework.id,
  resourceEconomyLogisticsFrameworkId: resourceEconomyLogisticsFramework.id,
  missionExpeditionFrameworkId: missionExpeditionFramework.id,
  universalDiscoveryRegistryVersion,
  populationSimulationIntegration: {
    implemented: true,
    hookOnly: false,
    populationSimulationFrameworkId: populationSimulationFramework.id,
    hooks: ["population_growth_hook", "migration_hook", "wellbeing_hook", "evacuation_choice", "specialist_shortage", "capacity_warning"]
  },
  ownership: {
    studioOwns: ["event definitions", "categories and types", "lifecycle states", "trigger policies", "eligibility rules", "probability policies", "deterministic seed policies", "severity bands", "phases and durations", "effects", "choices", "outcomes", "failure and recovery policies", "event chains", "Action references", "Mission/Expedition hooks", "Identity and Progression hooks", "presentation contracts", "runtime publication"],
    gameOwns: ["active player event instances", "timestamps", "current modifiers", "selected choices", "generated player-specific parameters", "resolved outcomes", "save/cloud persistence", "UI", "notifications", "protected server-authoritative resolution"]
  },
  activePlayerStatePolicy: {
    exportsActiveEventInstances: false,
    exportsTimestamps: false,
    exportsCurrentModifiers: false,
    exportsSelectedChoices: false,
    exportsGeneratedPlayerParameters: false,
    exportsResolvedOutcomes: false,
    exportsPlayerEventHistory: false
  },
  eventCategoryDefinitions,
  eventTypeDefinitions,
  eventLifecycleStateDefinitions,
  eventDefinitions,
  eventTriggerPolicies,
  eventEligibilityDefinitions,
  eventProbabilityPolicies,
  eventDeterministicSeedPolicies,
  eventSeverityDefinitions,
  eventDurationClasses,
  eventPhaseDefinitions,
  eventEffectDefinitions,
  eventChoiceDefinitions,
  eventResolutionPolicies,
  eventFailurePolicies,
  eventChainDefinitions,
  eventReasonCodes: [
    { id: "target_unknown", displayName: "Target Unknown", sourceSystemId: "knowledge", blocker: true, notes: "Knowledge-safe blocker." },
    { id: "knowledge_locked", displayName: "Knowledge Locked", sourceSystemId: "knowledge", blocker: true, notes: "Do not leak hidden data." },
    { id: "route_missing", displayName: "Route Missing", sourceSystemId: "resource_economy_logistics", blocker: true, notes: "Route must resolve before logistics event responses." },
    { id: "shipment_unavailable", displayName: "Shipment Unavailable", sourceSystemId: "resource_economy_logistics", blocker: true, notes: "No live shipment instance is exported." },
    { id: "population_framework_required", displayName: "Population Framework Required", sourceSystemId: populationSimulationFramework.id, blocker: true, notes: "Population-facing events require the published Population Simulation Framework." },
    { id: "server_verification_required", displayName: "Server Verification Required", sourceSystemId: "game_backend", blocker: true, notes: "Protected outcome cannot be resolved by untrusted clients." }
  ],
  eventKnowledgeVisibility,
  eventTimelineSignificancePolicies,
  eventPresentationContract,
  offlinePolicies: [
    { id: "offline_progress_safe", displayName: "Progress While Offline", behavior: "progress", notes: "Only for non-protected deterministic timers." },
    { id: "offline_pause_choice", displayName: "Pause For Choice", behavior: "defer_choice", notes: "Choice events wait for reconnect/player review." },
    { id: "offline_server_resolution", displayName: "Server Resolution Required", behavior: "resolve_server_authoritative", notes: "Protected outcomes require server authority." },
    { id: "offline_expire_window", displayName: "Expire Window", behavior: "expire", notes: "Events may expire using Game-owned timestamps." },
    { id: "offline_reconnect_required", displayName: "Reconnect Required", behavior: "require_reconnect", notes: "Use for registry, reward, and irreversible outcomes." }
  ],
  aiAgentRules: [
    "AI Agents may detect Events, recommend responses, summarize consequences, and automate approved low-risk responses.",
    "AI Agents may not choose irreversible branches without explicit player permission.",
    "AI Agents may not spend Premium Crystals automatically.",
    "AI Agents may not reveal hidden information or alter canonical probability policies."
  ],
  creativeProductionRequirements: [
    { id: "event_category_icons", displayName: "Event Category Icons", category: "Dynamic Events", status: "required", notes: "Category icon family for all Dynamic Event categories." },
    { id: "event_severity_badges", displayName: "Event Severity Badges", category: "Dynamic Events", status: "required", notes: "Seven severity bands from trivial to civilization-defining." },
    { id: "event_phase_art", displayName: "Event Phase Art", category: "Dynamic Events", status: "planned", notes: "Warning/onset/peak/response/aftermath visuals." },
    { id: "event_reference_screens", displayName: "Event Reference Screenshots", category: "Dynamic Events", status: "planned", notes: "Reference screenshot workflow only; Studio does not fabricate game screens." }
  ],
  assetLibraryCategories: [
    { id: "dynamic_events", displayName: "Dynamic Events", groups: ["Categories", "Severity", "Lifecycle", "Phases", "Choices", "Stellar", "Planetary", "Colony", "Logistics", "Discovery", "AI", "Celebration"], notes: "Canonical asset grouping for event presentation." }
  ],
  encyclopediaSections: [
    { id: "event_categories", displayName: "Event Categories", status: "active", notes: "Canonical categories." },
    { id: "event_types", displayName: "Event Types", status: "active", notes: "Canonical type taxonomy." },
    { id: "event_chains", displayName: "Notable Event Chains", status: "active", notes: "Solar Activity, Ancient Signal, Colony Shortage, and AI Optimization chains." },
    { id: "civilization_defining_events", displayName: "Civilization Defining Events", status: "planned", notes: "Authored encyclopedia entries can follow." }
  ],
  provisionalBalanceValues: [
    { id: "base_event_window_hours", displayName: "Base Event Window Hours", value: "24", notes: "Provisional; Game may tune per platform after validation." },
    { id: "minor_event_weight", displayName: "Minor Event Weight", value: "1.0", notes: "Provisional deterministic weighting." },
    { id: "crisis_event_cooldown_days", displayName: "Crisis Event Cooldown Days", value: "7", notes: "Provisional anti-punishment pacing." },
    { id: "positive_event_floor", displayName: "Positive Event Floor", value: "at least one opportunity/beneficial candidate per pool where eligible", notes: "Prevents every event pool from becoming punitive." }
  ],
  missingCanonicalDefinitions,
  validationRules: [
    "Event IDs must be unique and stable.",
    "Categories, types, lifecycle transitions, triggers, probability policies, severity, effects, choices, and resolution policies must resolve.",
    "Event choices may only reference canonical Actions.",
    "Mission hooks must resolve to Mission & Expedition templates.",
    "Knowledge-safe previews must not reveal hidden names, resources, artifacts, lifeforms, registry attribution, or recommendations.",
    "Dynamic Events must not export active player event instances, timestamps, live modifiers, selected choices, generated parameters, resolved outcomes, or player event history.",
    "All six engine exports must publish the same framework."
  ]
};

export function validateDynamicEventFramework(
  framework: DynamicEventFrameworkContract = dynamicEventFramework,
  options: {
    actionIds?: Set<string>;
    missionTemplateIds?: Set<string>;
    progressionMilestoneIds?: Set<string>;
  } = {}
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const actionIds = options.actionIds ?? new Set(canonicalActionSystem.actionDefinitions.map((action) => action.id));
  const missionTemplateIds = options.missionTemplateIds ?? new Set(missionExpeditionFramework.missionTemplateDefinitions.map((template) => template.id));
  const categoryIds = new Set(framework.eventCategoryDefinitions.map((definition) => definition.id));
  const typeIds = new Set(framework.eventTypeDefinitions.map((definition) => definition.id));
  const lifecycleStateIds = new Set(framework.eventLifecycleStateDefinitions.map((definition) => definition.id));
  const triggerIds = new Set(framework.eventTriggerPolicies.map((definition) => definition.id));
  const eligibilityIds = new Set(framework.eventEligibilityDefinitions.map((definition) => definition.id));
  const probabilityIds = new Set(framework.eventProbabilityPolicies.map((definition) => definition.id));
  const seedPolicyIds = new Set(framework.eventDeterministicSeedPolicies.map((definition) => definition.id));
  const severityIds = new Set(framework.eventSeverityDefinitions.map((definition) => definition.id));
  const durationClassIds = new Set(framework.eventDurationClasses.map((definition) => definition.id));
  const phaseIds = new Set(framework.eventPhaseDefinitions.map((definition) => definition.id));
  const effectIds = new Set(framework.eventEffectDefinitions.map((definition) => definition.id));
  const choiceIds = new Set(framework.eventChoiceDefinitions.map((definition) => definition.id));
  const resolutionIds = new Set(framework.eventResolutionPolicies.map((definition) => definition.id));
  const failurePolicyIds = new Set(framework.eventFailurePolicies.map((definition) => definition.id));
  const eventIds = new Set(framework.eventDefinitions.map((definition) => definition.id));
  const timelineIds = new Set(framework.eventTimelineSignificancePolicies.map((definition) => definition.id));

  const duplicates = (values: string[]) => values.filter((value, index) => values.indexOf(value) !== index);
  const duplicateEventIds = duplicates(framework.eventDefinitions.map((definition) => definition.id));
  if (duplicateEventIds.length) issues.push(issue("error", "duplicate_event_id", "Dynamic Event definitions contain duplicate IDs.", duplicateEventIds));

  if (framework.actionSystemId !== canonicalActionSystem.id) issues.push(issue("error", "invalid_action_system_reference", "Dynamic Event Framework action system reference does not resolve.", [framework.actionSystemId]));
  if (framework.planetDevelopmentFrameworkId !== planetDevelopmentFramework.id) issues.push(issue("error", "invalid_planet_development_reference", "Dynamic Event Framework planet development reference does not resolve.", [framework.planetDevelopmentFrameworkId]));
  if (framework.civilizationProgressionFrameworkId !== civilizationProgressionFramework.id) issues.push(issue("error", "invalid_progression_reference", "Dynamic Event Framework progression reference does not resolve.", [framework.civilizationProgressionFrameworkId]));
  if (framework.colonizationFrameworkId !== colonizationFramework.id) issues.push(issue("error", "invalid_colonization_reference", "Dynamic Event Framework colonization reference does not resolve.", [framework.colonizationFrameworkId]));
  if (framework.resourceEconomyLogisticsFrameworkId !== resourceEconomyLogisticsFramework.id) issues.push(issue("error", "invalid_logistics_reference", "Dynamic Event Framework logistics reference does not resolve.", [framework.resourceEconomyLogisticsFrameworkId]));
  if (framework.missionExpeditionFrameworkId !== missionExpeditionFramework.id) issues.push(issue("error", "invalid_mission_reference", "Dynamic Event Framework mission reference does not resolve.", [framework.missionExpeditionFrameworkId]));
  if (framework.populationSimulationIntegration.implemented !== true || framework.populationSimulationIntegration.hookOnly !== false || framework.populationSimulationIntegration.populationSimulationFrameworkId !== populationSimulationFramework.id) issues.push(issue("error", "invalid_population_integration_policy", "Dynamic Events must integrate with the published Population Simulation Framework without owning live player population state."));

  for (const state of framework.eventLifecycleStateDefinitions) {
    for (const transition of state.allowedTransitions) if (!lifecycleStateIds.has(transition)) issues.push(issue("error", "invalid_lifecycle_transition", `${state.id} transition ${transition} does not resolve.`, [state.id, transition]));
  }
  for (const phase of framework.eventPhaseDefinitions) if (!durationClassIds.has(phase.defaultDurationClassId)) issues.push(issue("error", "invalid_phase_duration", `${phase.id} duration class does not resolve.`, [phase.id, phase.defaultDurationClassId]));
  for (const choice of framework.eventChoiceDefinitions) {
    for (const actionId of choice.actionIds) if (!actionIds.has(actionId)) issues.push(issue("error", "invalid_choice_action", `${choice.id} action ${actionId} does not resolve.`, [choice.id, actionId]));
    for (const effectId of choice.outcomeEffectTypeIds) if (!effectIds.has(effectId)) issues.push(issue("error", "invalid_choice_effect", `${choice.id} effect ${effectId} does not resolve.`, [choice.id, effectId]));
    if (!timelineIds.has(choice.timelinePolicyId)) issues.push(issue("error", "invalid_choice_timeline_policy", `${choice.id} timeline policy does not resolve.`, [choice.id, choice.timelinePolicyId]));
  }
  for (const failurePolicy of framework.eventFailurePolicies) {
    for (const choiceId of failurePolicy.recoveryChoiceIds) if (!choiceIds.has(choiceId)) issues.push(issue("error", "invalid_failure_recovery_choice", `${failurePolicy.id} recovery choice ${choiceId} does not resolve.`, [failurePolicy.id, choiceId]));
    for (const templateId of failurePolicy.missionHookIds) if (!missionTemplateIds.has(templateId)) issues.push(issue("error", "invalid_failure_mission_hook", `${failurePolicy.id} mission hook ${templateId} does not resolve.`, [failurePolicy.id, templateId]));
  }
  for (const event of framework.eventDefinitions) {
    if (!categoryIds.has(event.categoryId)) issues.push(issue("error", "invalid_event_category", `${event.id} category ${event.categoryId} does not resolve.`, [event.id, event.categoryId]));
    if (!typeIds.has(event.eventTypeId)) issues.push(issue("error", "invalid_event_type", `${event.id} type ${event.eventTypeId} does not resolve.`, [event.id, event.eventTypeId]));
    for (const triggerId of event.triggerPolicyIds) if (!triggerIds.has(triggerId)) issues.push(issue("error", "invalid_event_trigger", `${event.id} trigger ${triggerId} does not resolve.`, [event.id, triggerId]));
    for (const eligibilityId of event.eligibilityIds) if (!eligibilityIds.has(eligibilityId)) issues.push(issue("error", "invalid_event_eligibility", `${event.id} eligibility ${eligibilityId} does not resolve.`, [event.id, eligibilityId]));
    if (!probabilityIds.has(event.probabilityPolicyId)) issues.push(issue("error", "invalid_event_probability", `${event.id} probability ${event.probabilityPolicyId} does not resolve.`, [event.id, event.probabilityPolicyId]));
    if (!seedPolicyIds.has(event.deterministicSeedPolicyId)) issues.push(issue("error", "invalid_event_seed_policy", `${event.id} seed policy ${event.deterministicSeedPolicyId} does not resolve.`, [event.id, event.deterministicSeedPolicyId]));
    if (!severityIds.has(event.severityId)) issues.push(issue("error", "invalid_event_severity", `${event.id} severity ${event.severityId} does not resolve.`, [event.id, event.severityId]));
    if (!durationClassIds.has(event.durationClassId)) issues.push(issue("error", "invalid_event_duration", `${event.id} duration ${event.durationClassId} does not resolve.`, [event.id, event.durationClassId]));
    for (const phaseId of event.phaseIds) if (!phaseIds.has(phaseId)) issues.push(issue("error", "invalid_event_phase", `${event.id} phase ${phaseId} does not resolve.`, [event.id, phaseId]));
    for (const effectId of event.effectTypeIds) if (!effectIds.has(effectId)) issues.push(issue("error", "invalid_event_effect", `${event.id} effect ${effectId} does not resolve.`, [event.id, effectId]));
    for (const choiceId of event.choiceIds) if (!choiceIds.has(choiceId)) issues.push(issue("error", "invalid_event_choice", `${event.id} choice ${choiceId} does not resolve.`, [event.id, choiceId]));
    for (const resolutionId of event.resolutionPolicyIds) if (!resolutionIds.has(resolutionId)) issues.push(issue("error", "invalid_event_resolution", `${event.id} resolution ${resolutionId} does not resolve.`, [event.id, resolutionId]));
    for (const failureId of event.failurePolicyIds) if (!failurePolicyIds.has(failureId)) issues.push(issue("error", "invalid_event_failure_policy", `${event.id} failure policy ${failureId} does not resolve.`, [event.id, failureId]));
    for (const followUpEventId of event.followUpEventIds) if (!eventIds.has(followUpEventId)) issues.push(issue("error", "invalid_follow_up_event", `${event.id} follow-up ${followUpEventId} does not resolve.`, [event.id, followUpEventId]));
    for (const templateId of event.missionHookTemplateIds) if (!missionTemplateIds.has(templateId)) issues.push(issue("error", "invalid_event_mission_hook", `${event.id} mission hook ${templateId} does not resolve.`, [event.id, templateId]));
    for (const actionId of event.actionReferenceIds) if (!actionIds.has(actionId)) issues.push(issue("error", "invalid_event_action_reference", `${event.id} action reference ${actionId} does not resolve.`, [event.id, actionId]));
    if (!timelineIds.has(event.timelineSignificanceId)) issues.push(issue("error", "invalid_event_timeline_policy", `${event.id} timeline policy ${event.timelineSignificanceId} does not resolve.`, [event.id, event.timelineSignificanceId]));
  }
  for (const chain of framework.eventChainDefinitions) {
    const seen = new Set<string>();
    for (const eventId of chain.eventIds) {
      if (!eventIds.has(eventId)) issues.push(issue("error", "invalid_chain_event", `${chain.id} event ${eventId} does not resolve.`, [chain.id, eventId]));
      if (seen.has(eventId)) issues.push(issue("error", "invalid_chain_cycle", `${chain.id} repeats ${eventId} in its main path.`, [chain.id, eventId]));
      seen.add(eventId);
    }
    for (const eventId of [...chain.branchEventIds, ...chain.terminalEventIds]) if (!eventIds.has(eventId)) issues.push(issue("error", "invalid_chain_event", `${chain.id} event ${eventId} does not resolve.`, [chain.id, eventId]));
  }
  if (!framework.eventKnowledgeVisibility.some((rule) => rule.knowledgeStateId === "unknown" && !rule.canShowName && !rule.canShowResources && rule.fallbackText === "???")) {
    issues.push(issue("error", "knowledge_safety_missing_unknown_rule", "Dynamic Events must hide unknown targets behind ???."));
  }
  if (!framework.aiAgentRules.some((rule) => /may not choose irreversible/i.test(rule))) issues.push(issue("error", "unsafe_ai_event_automation", "AI Agent rules must forbid irreversible choices without permission."));
  if (!framework.eventProbabilityPolicies.every((policy) => policy.deterministic)) issues.push(issue("error", "non_deterministic_probability_policy", "All event probability policies must be deterministic."));
  if (!framework.eventDeterministicSeedPolicies.every((policy) => policy.forbidsUncontrolledRandom)) issues.push(issue("error", "uncontrolled_random_allowed", "Seed policies must forbid uncontrolled random semantics."));
  if (!/"exportsActiveEventInstances":false/.test(JSON.stringify(framework.activePlayerStatePolicy))) issues.push(issue("error", "missing_event_state_policy", "Dynamic Event player state policy is incomplete."));
  if (/"(?:activeEventInstances|currentModifiers|selectedChoices|generatedPlayerParameters|resolvedOutcomes|playerEventHistory)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework))) {
    issues.push(issue("error", "dynamic_event_private_or_player_state_leak", "Dynamic Event Framework leaked player state or private paths."));
  }
  return issues;
}
