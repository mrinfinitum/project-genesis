import { canonicalActionSystem } from "@/lib/actions/action-system";
import { colonizationFramework } from "@/lib/colonization/framework";
import { civilizationProgressionFramework } from "@/lib/civilization/progression-framework";
import { universalDiscoveryRegistryVersion } from "@/lib/discovery/universal-registry";
import { resourceEconomyLogisticsFramework } from "@/lib/economy/logistics-framework";
import { planetDevelopmentFramework } from "@/lib/planets/development-framework";
import { ResourceService } from "@/lib/resources/service";
import type {
  ExpeditionRequirementDefinition,
  ExpeditionRiskDefinition,
  ExpeditionScopeDefinition,
  MissionExpeditionFrameworkContract,
  MissionExpeditionIntegrationHook,
  MissionExpeditionMissingCanonicalDefinition,
  MissionExpeditionPresentationContract,
  MissionExpeditionTypeDefinition,
  MissionLifecycleStateDefinition,
  MissionObjectiveContractDefinition,
  MissionRewardContractDefinition,
  MissionTemplateDefinition,
  ExpeditionLifecycleStateDefinition
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

function compactId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function resourceId(name: string) {
  const resolved = ResourceService.resolveId(name);
  if (resolved) return resolved;
  return `missing_resource_${compactId(name)}`;
}

const missionActionIds = [
  "send_probe",
  "probe_scan",
  "survey_planet",
  "catalog_planet",
  "analyze_anomaly",
  "analyze_artifact",
  "excavate_ruin",
  "prepare_colony",
  "establish_colony",
  "construct_building",
  "conduct_research",
  "create_shipment",
  "load_shipment",
  "unload_shipment",
  "transfer_resources",
  "establish_trade_route",
  "travel_to_destination"
];

const missionTypeDefinitions: MissionExpeditionTypeDefinition[] = [
  { id: "exploration", displayName: "Exploration", description: "Reveal, chart, and catalog unknown universe objects.", expeditionScopeIds: ["local", "planetary", "orbital", "interplanetary", "interstellar"], defaultObjectiveTypeIds: ["scan_sector", "scan_star_system", "scan_planet", "chart_location"], defaultRewardTypeIds: ["discovery_points", "collectible", "title"], requiredActionIds: ["send_probe", "probe_scan", "survey_planet", "catalog_planet"], relatedSystemIds: ["discovery", "universal_discovery_registry", "planet_development"], presentationToken: "mission_exploration", status: "approved" },
  { id: "survey", displayName: "Survey", description: "Produce deeper scans, development reports, and strategic recommendations.", expeditionScopeIds: ["planetary", "orbital", "interplanetary"], defaultObjectiveTypeIds: ["survey_body", "survey_anomaly", "discover_resource"], defaultRewardTypeIds: ["discovery_points", "research_points", "resource"], requiredActionIds: ["survey_planet", "analyze_anomaly"], relatedSystemIds: ["planet_development", "resource_economy_logistics"], presentationToken: "mission_survey", status: "approved" },
  { id: "research", displayName: "Research", description: "Convert discoveries, artifacts, and samples into science progress.", expeditionScopeIds: ["local", "planetary", "orbital"], defaultObjectiveTypeIds: ["complete_research", "analyze_artifact", "survey_anomaly"], defaultRewardTypeIds: ["research_points", "research_unlock", "civilization_influence"], requiredActionIds: ["conduct_research", "analyze_artifact"], relatedSystemIds: ["research", "encyclopedia", "civilization_identity"], presentationToken: "mission_research", status: "approved" },
  { id: "colonization", displayName: "Colonization", description: "Prepare and establish colonies through explicit resources, population, and logistics.", expeditionScopeIds: ["planetary", "orbital", "interplanetary", "interstellar"], defaultObjectiveTypeIds: ["claim_planet", "colonize_planet", "establish_colony", "deliver_resource"], defaultRewardTypeIds: ["colony_bonus", "title", "civilization_influence"], requiredActionIds: ["prepare_colony", "establish_colony", "create_shipment", "unload_shipment"], relatedSystemIds: ["colonization", "resource_economy_logistics", "civilization_progression"], presentationToken: "mission_colonization", status: "approved" },
  { id: "logistics", displayName: "Logistics", description: "Move resources, supplies, samples, and equipment through canonical routes.", expeditionScopeIds: ["local", "planetary", "orbital", "interplanetary", "interstellar"], defaultObjectiveTypeIds: ["deliver_resource", "resolve_shortage", "produce_resource"], defaultRewardTypeIds: ["credits", "resource", "trade_access"], requiredActionIds: ["create_shipment", "load_shipment", "transfer_resources", "unload_shipment"], relatedSystemIds: ["resource_economy_logistics", "economy"], presentationToken: "mission_logistics", status: "approved" },
  { id: "trade", displayName: "Trade", description: "Open markets, establish trade routes, and stabilize supply networks.", expeditionScopeIds: ["local", "planetary", "orbital", "interplanetary", "interstellar"], defaultObjectiveTypeIds: ["establish_trade_route", "stabilize_market", "deliver_resource"], defaultRewardTypeIds: ["credits", "trade_access", "faction_reputation"], requiredActionIds: ["establish_trade_route", "transfer_resources"], relatedSystemIds: ["economy", "resource_economy_logistics", "factions"], presentationToken: "mission_trade", status: "approved" },
  { id: "rescue", displayName: "Rescue", description: "Recover crews, damaged expeditions, or endangered colonies without inventing combat systems.", expeditionScopeIds: ["planetary", "orbital", "interplanetary", "interstellar"], defaultObjectiveTypeIds: ["deliver_resource", "escort_route", "resolve_shortage"], defaultRewardTypeIds: ["faction_reputation", "title", "civilization_influence"], requiredActionIds: ["travel_to_destination", "create_shipment", "unload_shipment"], relatedSystemIds: ["colonization", "resource_economy_logistics"], presentationToken: "mission_rescue", status: "provisional" },
  { id: "archaeology", displayName: "Archaeology", description: "Excavate ruins, recover artifacts, and publish discoveries into the encyclopedia.", expeditionScopeIds: ["planetary", "orbital", "interplanetary"], defaultObjectiveTypeIds: ["survey_anomaly", "analyze_artifact", "chart_location"], defaultRewardTypeIds: ["collectible", "research_points", "unique_item"], requiredActionIds: ["excavate_ruin", "analyze_artifact"], relatedSystemIds: ["discovery", "encyclopedia", "planet_development"], presentationToken: "mission_archaeology", status: "approved" },
  { id: "diplomacy", displayName: "Diplomacy", description: "Build faction trust and civilization relationships through non-combat objectives.", expeditionScopeIds: ["local", "planetary", "orbital", "interplanetary", "interstellar", "galactic"], defaultObjectiveTypeIds: ["discover_faction", "deliver_resource", "complete_research"], defaultRewardTypeIds: ["faction_reputation", "trade_access", "title"], requiredActionIds: ["travel_to_destination", "transfer_resources"], relatedSystemIds: ["factions", "civilization_identity"], presentationToken: "mission_diplomacy", status: "provisional" },
  { id: "security", displayName: "Security", description: "Protect routes, expeditions, and infrastructure through escort and risk mitigation hooks.", expeditionScopeIds: ["planetary", "orbital", "interplanetary", "interstellar"], defaultObjectiveTypeIds: ["escort_route", "resolve_shortage"], defaultRewardTypeIds: ["credits", "faction_reputation", "trade_access"], requiredActionIds: ["travel_to_destination", "transfer_resources"], relatedSystemIds: ["resource_economy_logistics", "factions"], presentationToken: "mission_security", status: "provisional" }
];

const expeditionScopeDefinitions: ExpeditionScopeDefinition[] = [
  { id: "local", displayName: "Local", minimumTechnologyGateId: "survival", validTargetTypes: ["civilization", "settlement", "building"], requiredRouteDefinitionIds: ["local_supply_route"], requiredTransportModeIds: ["surface_transport"], maximumDistancePolicy: "same settlement or local operating area", durationPolicyId: "duration_standard", hazardPolicyIds: ["low_operational_risk"], status: "approved" },
  { id: "planetary", displayName: "Planetary", minimumTechnologyGateId: "planetary", validTargetTypes: ["planet", "moon", "colony", "site"], requiredRouteDefinitionIds: ["colony_internal_route", "local_supply_route"], requiredTransportModeIds: ["surface_transport", "automated_drone"], maximumDistancePolicy: "same celestial body", durationPolicyId: "duration_project", hazardPolicyIds: ["environmental_risk"], status: "approved" },
  { id: "orbital", displayName: "Orbital", minimumTechnologyGateId: "interplanetary", validTargetTypes: ["orbit", "station", "moon", "asteroid_belt"], requiredRouteDefinitionIds: ["surface_to_orbit", "orbital_to_surface"], requiredTransportModeIds: ["orbital_lift", "cargo_shuttle"], maximumDistancePolicy: "same planetary orbit or local orbital lane", durationPolicyId: "duration_project", hazardPolicyIds: ["launch_window_risk", "orbital_debris_risk"], status: "approved" },
  { id: "interplanetary", displayName: "Interplanetary", minimumTechnologyGateId: "interplanetary", validTargetTypes: ["planet", "moon", "asteroid_belt", "star_system"], requiredRouteDefinitionIds: ["interplanetary_route"], requiredTransportModeIds: ["interplanetary_freighter", "cargo_ship", "expedition_transport"], maximumDistancePolicy: "same star system", durationPolicyId: "duration_colony", hazardPolicyIds: ["deep_space_risk", "fuel_risk"], status: "approved" },
  { id: "interstellar", displayName: "Interstellar", minimumTechnologyGateId: "interstellar", validTargetTypes: ["star_system", "sector"], requiredRouteDefinitionIds: ["interstellar_route"], requiredTransportModeIds: ["interstellar_freighter", "expedition_transport"], maximumDistancePolicy: "known reachable systems inside unlocked travel range", durationPolicyId: "duration_terraforming", hazardPolicyIds: ["navigation_risk", "supply_risk"], status: "approved" },
  { id: "galactic", displayName: "Galactic", minimumTechnologyGateId: "galactic", validTargetTypes: ["sector", "galaxy"], requiredRouteDefinitionIds: ["interstellar_route", "trade_route"], requiredTransportModeIds: ["interstellar_freighter", "gateway_transfer"], maximumDistancePolicy: "charted galactic network only", durationPolicyId: "duration_terraforming", hazardPolicyIds: ["network_disruption_risk"], status: "provisional" }
];

const missionLifecycleStateDefinitions: MissionLifecycleStateDefinition[] = [
  { id: "locked", displayName: "Locked", terminal: false, playerVisible: true, allowedTransitions: ["available"], presentationToken: "mission_locked" },
  { id: "available", displayName: "Available", terminal: false, playerVisible: true, allowedTransitions: ["accepted", "expired"], presentationToken: "mission_available" },
  { id: "accepted", displayName: "Accepted", terminal: false, playerVisible: true, allowedTransitions: ["preparing", "in_progress", "abandoned", "expired"], presentationToken: "mission_accepted" },
  { id: "preparing", displayName: "Preparing", terminal: false, playerVisible: true, allowedTransitions: ["in_progress", "abandoned", "failed"], presentationToken: "mission_preparing" },
  { id: "in_progress", displayName: "In Progress", terminal: false, playerVisible: true, allowedTransitions: ["ready_to_complete", "failed", "expired", "abandoned"], presentationToken: "mission_in_progress" },
  { id: "ready_to_complete", displayName: "Ready To Complete", terminal: false, playerVisible: true, allowedTransitions: ["completed", "expired"], presentationToken: "mission_ready" },
  { id: "completed", displayName: "Completed", terminal: true, playerVisible: true, allowedTransitions: [], presentationToken: "mission_completed" },
  { id: "failed", displayName: "Failed", terminal: true, playerVisible: true, allowedTransitions: [], presentationToken: "mission_failed" },
  { id: "expired", displayName: "Expired", terminal: true, playerVisible: true, allowedTransitions: [], presentationToken: "mission_expired" },
  { id: "abandoned", displayName: "Abandoned", terminal: true, playerVisible: true, allowedTransitions: [], presentationToken: "mission_abandoned" }
];

const expeditionLifecycleStateDefinitions: ExpeditionLifecycleStateDefinition[] = [
  { id: "draft", displayName: "Draft", terminal: false, allowedTransitions: ["planned"], missionStateHint: "available", presentationToken: "expedition_draft" },
  { id: "planned", displayName: "Planned", terminal: false, allowedTransitions: ["assembling", "recalled"], missionStateHint: "accepted", presentationToken: "expedition_planned" },
  { id: "assembling", displayName: "Assembling", terminal: false, allowedTransitions: ["launch_ready", "recalled"], missionStateHint: "preparing", presentationToken: "expedition_assembling" },
  { id: "launch_ready", displayName: "Launch Ready", terminal: false, allowedTransitions: ["en_route", "recalled"], missionStateHint: "preparing", presentationToken: "expedition_launch_ready" },
  { id: "en_route", displayName: "En Route", terminal: false, allowedTransitions: ["operating", "returning", "failed", "lost"], missionStateHint: "in_progress", presentationToken: "expedition_en_route" },
  { id: "operating", displayName: "Operating", terminal: false, allowedTransitions: ["returning", "failed", "lost"], missionStateHint: "in_progress", presentationToken: "expedition_operating" },
  { id: "returning", displayName: "Returning", terminal: false, allowedTransitions: ["completed", "failed", "lost"], missionStateHint: "ready_to_complete", presentationToken: "expedition_returning" },
  { id: "completed", displayName: "Completed", terminal: true, allowedTransitions: [], missionStateHint: "completed", presentationToken: "expedition_completed" },
  { id: "failed", displayName: "Failed", terminal: true, allowedTransitions: [], missionStateHint: "failed", presentationToken: "expedition_failed" },
  { id: "recalled", displayName: "Recalled", terminal: true, allowedTransitions: [], missionStateHint: "abandoned", presentationToken: "expedition_recalled" },
  { id: "lost", displayName: "Lost", terminal: true, allowedTransitions: [], missionStateHint: "failed", presentationToken: "expedition_lost" }
];

const missionObjectiveContractDefinitions: MissionObjectiveContractDefinition[] = [
  { id: "scan_sector", displayName: "Scan Sector", targetTypes: ["sector"], requiredActionIds: ["probe_scan"], requiredKnowledgeStates: ["detected"], progressSource: "action_completion", deterministicProgressKey: "sectorId", validationRule: "sector target must resolve and be within knowledge visibility rules" },
  { id: "scan_star_system", displayName: "Scan Star System", targetTypes: ["star_system"], requiredActionIds: ["probe_scan"], requiredKnowledgeStates: ["detected"], progressSource: "action_completion", deterministicProgressKey: "starSystemId", validationRule: "star system target must resolve to a sector" },
  { id: "scan_planet", displayName: "Scan Planet", targetTypes: ["planet", "moon", "celestial_body"], requiredActionIds: ["probe_scan"], requiredKnowledgeStates: ["probed"], progressSource: "action_completion", deterministicProgressKey: "celestialBodyId", validationRule: "body target must resolve to star system" },
  { id: "survey_body", displayName: "Survey Body", targetTypes: ["planet", "moon", "asteroid_belt"], requiredActionIds: ["survey_planet"], requiredKnowledgeStates: ["scanned"], progressSource: "action_completion", deterministicProgressKey: "celestialBodyId", validationRule: "survey action must produce a planet development report" },
  { id: "discover_resource", displayName: "Discover Resource", targetTypes: ["resource", "planet"], requiredActionIds: ["survey_planet"], requiredKnowledgeStates: ["scanned"], progressSource: "discovery_event", deterministicProgressKey: "resourceId", validationRule: "resource target must resolve in Resource Catalog" },
  { id: "discover_faction", displayName: "Discover Faction", targetTypes: ["faction", "civilization"], requiredActionIds: ["travel_to_destination"], requiredKnowledgeStates: ["detected"], progressSource: "discovery_event", deterministicProgressKey: "factionId", validationRule: "faction target must resolve when factions are present" },
  { id: "chart_location", displayName: "Chart Location", targetTypes: ["galaxy", "sector", "star_system", "planet"], requiredActionIds: ["catalog_planet"], requiredKnowledgeStates: ["charted"], progressSource: "action_completion", deterministicProgressKey: "locationId", validationRule: "location must use Galaxy -> Sector -> Star System -> Planet hierarchy" },
  { id: "claim_planet", displayName: "Claim Planet", targetTypes: ["planet"], requiredActionIds: ["catalog_planet"], requiredKnowledgeStates: ["charted"], progressSource: "manual_game_event", deterministicProgressKey: "planetId", validationRule: "claim eligibility remains Game-owned and server verified" },
  { id: "colonize_planet", displayName: "Colonize Planet", targetTypes: ["planet"], requiredActionIds: ["prepare_colony", "establish_colony"], requiredKnowledgeStates: ["surveyed"], progressSource: "action_completion", deterministicProgressKey: "planetId", validationRule: "colonization framework eligibility must pass" },
  { id: "establish_colony", displayName: "Establish Colony", targetTypes: ["colony", "planet"], requiredActionIds: ["establish_colony"], requiredKnowledgeStates: ["surveyed"], progressSource: "action_completion", deterministicProgressKey: "colonyId", validationRule: "colony must be created by Game after action completion" },
  { id: "construct_building", displayName: "Construct Building", targetTypes: ["building", "colony"], requiredActionIds: ["construct_building"], requiredKnowledgeStates: [], progressSource: "construction_completion", deterministicProgressKey: "buildingId", validationRule: "building must resolve in Building Library" },
  { id: "produce_resource", displayName: "Produce Resource", targetTypes: ["resource", "building"], requiredActionIds: ["manufacture_item", "process_resource"], requiredKnowledgeStates: [], progressSource: "resource_delivery", deterministicProgressKey: "resourceId", validationRule: "resource output must resolve in Resource Catalog" },
  { id: "deliver_resource", displayName: "Deliver Resource", targetTypes: ["resource", "route", "colony"], requiredActionIds: ["create_shipment", "load_shipment", "transfer_resources", "unload_shipment"], requiredKnowledgeStates: [], progressSource: "resource_delivery", deterministicProgressKey: "shipmentId", validationRule: "delivery is credited only after Game-owned shipment unloads" },
  { id: "establish_trade_route", displayName: "Establish Trade Route", targetTypes: ["trade_route", "market"], requiredActionIds: ["establish_trade_route"], requiredKnowledgeStates: [], progressSource: "action_completion", deterministicProgressKey: "tradeRouteId", validationRule: "route must resolve to valid markets and endpoints" },
  { id: "stabilize_market", displayName: "Stabilize Market", targetTypes: ["market"], requiredActionIds: ["transfer_resources"], requiredKnowledgeStates: [], progressSource: "market_event", deterministicProgressKey: "marketId", validationRule: "market stabilization event remains Game-owned" },
  { id: "resolve_shortage", displayName: "Resolve Shortage", targetTypes: ["market", "colony", "resource"], requiredActionIds: ["create_shipment", "unload_shipment"], requiredKnowledgeStates: [], progressSource: "market_event", deterministicProgressKey: "shortageId", validationRule: "shortage reason code must resolve in logistics framework" },
  { id: "escort_route", displayName: "Escort Route", targetTypes: ["route", "trade_route"], requiredActionIds: ["travel_to_destination"], requiredKnowledgeStates: [], progressSource: "manual_game_event", deterministicProgressKey: "routeId", validationRule: "security escort is a provisional non-combat hook" },
  { id: "survey_anomaly", displayName: "Survey Anomaly", targetTypes: ["anomaly", "discovery"], requiredActionIds: ["analyze_anomaly"], requiredKnowledgeStates: ["detected"], progressSource: "action_completion", deterministicProgressKey: "discoveryId", validationRule: "anomaly discovery must resolve or remain a Game-owned spawned event" },
  { id: "analyze_artifact", displayName: "Analyze Artifact", targetTypes: ["artifact", "discovery"], requiredActionIds: ["analyze_artifact"], requiredKnowledgeStates: ["scanned"], progressSource: "action_completion", deterministicProgressKey: "artifactId", validationRule: "artifact resource/discovery must resolve when static" },
  { id: "complete_research", displayName: "Complete Research", targetTypes: ["research"], requiredActionIds: ["conduct_research"], requiredKnowledgeStates: [], progressSource: "research_completion", deterministicProgressKey: "researchId", validationRule: "research target must resolve in canonical research" }
];

const missionRewardContractDefinitions: MissionRewardContractDefinition[] = [
  { id: "discovery_points", displayName: "Discovery Points", rewardSource: "discovery", gameOwnsClaimState: true, allowedForMissionTypeIds: ["exploration", "survey", "archaeology"], validationRule: "amount is computed by Game from completed objectives and canonical reward table" },
  { id: "credits", displayName: "Credits", rewardSource: "economy", gameOwnsClaimState: true, allowedForMissionTypeIds: ["logistics", "trade", "security", "rescue"], validationRule: "economy transaction reason must be mission_reward" },
  { id: "resource", displayName: "Resource", rewardSource: "resource_catalog", gameOwnsClaimState: true, allowedForMissionTypeIds: ["survey", "logistics", "trade"], validationRule: "resourceId must resolve through Resource Catalog" },
  { id: "research_points", displayName: "Research Points", rewardSource: "research", gameOwnsClaimState: true, allowedForMissionTypeIds: ["research", "survey", "archaeology"], validationRule: "research economy ID must resolve" },
  { id: "research_unlock", displayName: "Research Unlock", rewardSource: "research", gameOwnsClaimState: true, allowedForMissionTypeIds: ["research"], validationRule: "researchId must resolve before reward is offered" },
  { id: "faction_reputation", displayName: "Faction Reputation", rewardSource: "faction", gameOwnsClaimState: true, allowedForMissionTypeIds: ["trade", "rescue", "diplomacy", "security"], validationRule: "faction reputation value is Game-owned player state" },
  { id: "colony_bonus", displayName: "Colony Bonus", rewardSource: "colony", gameOwnsClaimState: true, allowedForMissionTypeIds: ["colonization", "rescue"], validationRule: "colony target must exist in Game-owned colony state" },
  { id: "trade_access", displayName: "Trade Access", rewardSource: "trade", gameOwnsClaimState: true, allowedForMissionTypeIds: ["trade", "diplomacy", "security"], validationRule: "market/trade unlock references canonical market scope only" },
  { id: "unique_item", displayName: "Unique Item", rewardSource: "resource_catalog", gameOwnsClaimState: true, allowedForMissionTypeIds: ["archaeology", "research"], validationRule: "unique item must be represented by resource or collectible definition before publication" },
  { id: "title", displayName: "Title", rewardSource: "identity", gameOwnsClaimState: true, allowedForMissionTypeIds: ["exploration", "colonization", "rescue", "diplomacy"], validationRule: "title metadata is cosmetic and does not alter canonical identity" },
  { id: "collectible", displayName: "Collectible", rewardSource: "discovery", gameOwnsClaimState: true, allowedForMissionTypeIds: ["exploration", "archaeology"], validationRule: "collectible must resolve through Discovery or future Collectible catalog" },
  { id: "civilization_influence", displayName: "Civilization Influence", rewardSource: "identity", gameOwnsClaimState: true, allowedForMissionTypeIds: ["research", "colonization", "rescue"], validationRule: "influence changes must use Civilization Identity hooks" }
];

const missionTemplateDefinitions: MissionTemplateDefinition[] = [
  { id: "template_first_planetary_survey", displayName: "First Planetary Survey", missionTypeId: "survey", expeditionScopeId: "planetary", difficultyId: "easy", objectiveTypeIds: ["scan_planet", "survey_body"], rewardTypeIds: ["discovery_points", "research_points"], prerequisiteResearchIds: [], prerequisiteDiscoveryStateIds: ["detected"], targetSelectionRule: "nearest detected celestial body with survey eligibility", deterministicSeedRule: "missionSeed + targetObjectId + templateId", repeatPolicy: "once", expirationPolicy: "none", status: "approved" },
  { id: "template_interplanetary_expedition", displayName: "Interplanetary Expedition", missionTypeId: "exploration", expeditionScopeId: "interplanetary", difficultyId: "moderate", objectiveTypeIds: ["scan_star_system", "scan_planet", "chart_location"], rewardTypeIds: ["discovery_points", "title"], prerequisiteResearchIds: ["system_scan"], prerequisiteDiscoveryStateIds: ["detected"], targetSelectionRule: "unexplored body in same star system within travel gate", deterministicSeedRule: "missionSeed + starSystemId + selectedBodyId", repeatPolicy: "repeatable", expirationPolicy: "none", status: "approved" },
  { id: "template_colony_supply_run", displayName: "Colony Supply Run", missionTypeId: "logistics", expeditionScopeId: "interplanetary", difficultyId: "moderate", objectiveTypeIds: ["deliver_resource", "resolve_shortage"], rewardTypeIds: ["credits", "colony_bonus"], prerequisiteResearchIds: ["colonization"], prerequisiteDiscoveryStateIds: [], targetSelectionRule: "colony or project with critical supply demand", deterministicSeedRule: "missionSeed + colonyId + shortageReasonCode", repeatPolicy: "repeatable", expirationPolicy: "time_limited_game_owned", status: "approved" },
  { id: "template_archaeological_recovery", displayName: "Archaeological Recovery", missionTypeId: "archaeology", expeditionScopeId: "planetary", difficultyId: "hard", objectiveTypeIds: ["survey_anomaly", "analyze_artifact"], rewardTypeIds: ["collectible", "research_points", "unique_item"], prerequisiteResearchIds: ["archaeology"], prerequisiteDiscoveryStateIds: ["scanned"], targetSelectionRule: "surveyed body with ruin or artifact signal", deterministicSeedRule: "missionSeed + discoveryId + artifactProfileId", repeatPolicy: "once", expirationPolicy: "none", status: "approved" },
  { id: "template_trade_route_commission", displayName: "Trade Route Commission", missionTypeId: "trade", expeditionScopeId: "interplanetary", difficultyId: "moderate", objectiveTypeIds: ["establish_trade_route", "deliver_resource"], rewardTypeIds: ["credits", "trade_access", "faction_reputation"], prerequisiteResearchIds: ["trade"], prerequisiteDiscoveryStateIds: [], targetSelectionRule: "two markets with complementary supply and demand", deterministicSeedRule: "missionSeed + originMarketId + destinationMarketId", repeatPolicy: "repeatable", expirationPolicy: "event_window_game_owned", status: "approved" },
  { id: "template_research_sample_return", displayName: "Research Sample Return", missionTypeId: "research", expeditionScopeId: "orbital", difficultyId: "moderate", objectiveTypeIds: ["discover_resource", "deliver_resource", "complete_research"], rewardTypeIds: ["research_points", "research_unlock"], prerequisiteResearchIds: ["planet_scan"], prerequisiteDiscoveryStateIds: ["scanned"], targetSelectionRule: "scanned body with scientific sample opportunity", deterministicSeedRule: "missionSeed + resourceId + researchId", repeatPolicy: "repeatable", expirationPolicy: "none", status: "approved" }
];

const expeditionRequirementDefinitions: ExpeditionRequirementDefinition[] = [
  { id: "expedition_crew", displayName: "Expedition Crew", requirementType: "crew", resourceIds: ["ECON-POPULATION"], actionIds: ["travel_to_destination"], routeDefinitionIds: [], transportModeIds: ["expedition_transport"], minimumQuantity: 1, gameOwnsAssignmentState: true, notes: "Population assignment is Game-owned and cannot be exported as live state." },
  { id: "expedition_fuel", displayName: "Expedition Fuel", requirementType: "fuel", resourceIds: [resourceId("Hydrogen"), resourceId("Fusion Fuel")], actionIds: ["travel_to_destination"], routeDefinitionIds: ["fuel_route"], transportModeIds: ["expedition_transport"], minimumQuantity: 1, gameOwnsAssignmentState: true, notes: "Fuel requirement references canonical resources; exact quantities are Game balance." },
  { id: "survey_equipment", displayName: "Survey Equipment", requirementType: "equipment", resourceIds: [resourceId("Survey Data"), resourceId("Silicon")], actionIds: ["survey_planet", "analyze_anomaly"], routeDefinitionIds: ["research_sample_route"], transportModeIds: ["cargo_shuttle", "expedition_transport"], minimumQuantity: 1, gameOwnsAssignmentState: true, notes: "Equipment loadout is schema-only until equipment catalog is approved." },
  { id: "colony_supply_package", displayName: "Colony Supply Package", requirementType: "supply", resourceIds: [resourceId("Fresh Water"), resourceId("Water Ice"), resourceId("Organic Compounds")], actionIds: ["create_shipment", "unload_shipment"], routeDefinitionIds: ["colonization_supply_route"], transportModeIds: ["colony_ship", "cargo_ship"], minimumQuantity: 1, gameOwnsAssignmentState: true, notes: "Uses colonization resource packages and logistics delivery hooks." },
  { id: "secure_artifact_transport", displayName: "Secure Artifact Transport", requirementType: "route", resourceIds: [], actionIds: ["create_shipment", "transfer_resources"], routeDefinitionIds: ["artifact_secure_route"], transportModeIds: ["cargo_shuttle", "expedition_transport"], minimumQuantity: 1, gameOwnsAssignmentState: true, notes: "Artifact custody is represented by Game-owned shipment and inventory state." }
];

const expeditionRiskDefinitions: ExpeditionRiskDefinition[] = [
  { id: "environmental_exposure", displayName: "Environmental Exposure", appliesToScopeIds: ["planetary"], hazardProfileIds: ["radiation", "storm", "temperature", "atmosphere"], failureCauseIds: ["hazard_exposure"], mitigationRequirementIds: ["survey_equipment"], deterministicFormula: "risk = targetHazardScore - mitigationScore + difficultyModifier", status: "approved" },
  { id: "deep_space_supply_risk", displayName: "Deep Space Supply Risk", appliesToScopeIds: ["interplanetary", "interstellar"], hazardProfileIds: ["fuel_risk", "supply_risk"], failureCauseIds: ["resource_shortage", "route_disruption"], mitigationRequirementIds: ["expedition_fuel"], deterministicFormula: "risk = distanceBand + supplyDemandPressure - logisticsReadiness", status: "approved" },
  { id: "artifact_containment_risk", displayName: "Artifact Containment Risk", appliesToScopeIds: ["planetary", "orbital", "interplanetary"], hazardProfileIds: ["secure", "fragile", "unknown"], failureCauseIds: ["contamination", "loss"], mitigationRequirementIds: ["secure_artifact_transport"], deterministicFormula: "risk = artifactRarityTier + hazardUnknownScore - containmentReadiness", status: "provisional" }
];

const integrationHooks: MissionExpeditionIntegrationHook[] = [
  { id: "mission_actions_use_canonical_action_system", systemId: "action_system", referencedIds: missionActionIds, contractRule: "Mission objectives progress from canonical Action completions or explicit Game-owned events.", required: true },
  { id: "mission_targets_use_planet_development", systemId: "planet_development", referencedIds: [planetDevelopmentFramework.id], contractRule: "Survey and development missions use Planet Development visibility and report contracts.", required: true },
  { id: "mission_identity_rewards_use_identity", systemId: "civilization_identity", referencedIds: ["Scientific", "Trade", "Eco", "Industry"], contractRule: "Mission influence rewards may affect identity through approved hooks only.", required: true },
  { id: "mission_progression_milestones_reported", systemId: "civilization_progression", referencedIds: ["first_expedition", "first_sample_return", "first_interstellar_expedition"], contractRule: "Mission milestones are reported until added to Civilization Progression.", required: false },
  { id: "mission_colonization_uses_colonization_framework", systemId: "colonization", referencedIds: [colonizationFramework.id], contractRule: "Colonization missions cannot bypass eligibility, phases, resource packages, or population requirements.", required: true },
  { id: "mission_logistics_use_resource_network", systemId: "resource_economy_logistics", referencedIds: [resourceEconomyLogisticsFramework.id, "colonization_supply_route", "research_sample_route", "artifact_secure_route"], contractRule: "Resource delivery, sample return, and supply missions require canonical routes, shipments, capacity, and unloading.", required: true },
  { id: "mission_discoveries_use_discovery_system", systemId: "discovery", referencedIds: ["discovery_categories", "discovery_rarities"], contractRule: "Discovery missions may reference discovery records but player found-state remains Game-owned.", required: true },
  { id: "mission_firsts_use_universal_registry", systemId: "universal_discovery_registry", referencedIds: [universalDiscoveryRegistryVersion], contractRule: "Eligible first discoveries must be verified by the Game backend registry.", required: true },
  { id: "mission_lore_links_use_encyclopedia", systemId: "encyclopedia", referencedIds: ["mission", "discovery", "faction"], contractRule: "Mission lore and handoff summaries may link to encyclopedia entries without requiring player-specific data.", required: false }
];

const missionExpeditionPresentationContract: MissionExpeditionPresentationContract[] = [
  { id: "MissionBoard", displayName: "Mission Board", rendererIndependent: true, semanticFields: ["availableMissions", "filters", "priority", "trackedMissionIds"], notes: "Board semantics only; clients own layout." },
  { id: "MissionCard", displayName: "Mission Card", rendererIndependent: true, semanticFields: ["missionType", "difficulty", "status", "title", "targetSummary", "rewardSummary"], notes: "Compact mission summary." },
  { id: "MissionDetail", displayName: "Mission Detail", rendererIndependent: true, semanticFields: ["description", "requirements", "objectives", "rewards", "history"], notes: "Detailed readable mission contract." },
  { id: "ObjectiveChecklist", displayName: "Objective Checklist", rendererIndependent: true, semanticFields: ["objectiveType", "target", "currentCount", "targetCount", "completed"], notes: "Game supplies player progress." },
  { id: "RewardSummary", displayName: "Reward Summary", rendererIndependent: true, semanticFields: ["rewardType", "amount", "claimState", "source"], notes: "Claim state remains Game-owned." },
  { id: "ExpeditionPlanner", displayName: "Expedition Planner", rendererIndependent: true, semanticFields: ["scope", "target", "route", "transport", "risk", "requirements"], notes: "Planner consumes canonical requirements and Game-owned availability." },
  { id: "ExpeditionLoadout", displayName: "Expedition Loadout", rendererIndependent: true, semanticFields: ["crew", "fuel", "supplies", "equipment", "capacity"], notes: "Assignments are not exported from Studio." },
  { id: "ExpeditionTimeline", displayName: "Expedition Timeline", rendererIndependent: true, semanticFields: ["state", "phases", "estimatedArrival", "returnPolicy"], notes: "Timestamps and active instance progress are Game-owned." },
  { id: "RiskSummary", displayName: "Risk Summary", rendererIndependent: true, semanticFields: ["riskIds", "mitigations", "failureCauses", "severity"], notes: "Clients render risk explanation without inventing rules." },
  { id: "MissionCompletion", displayName: "Mission Completion", rendererIndependent: true, semanticFields: ["completedObjectives", "earnedRewards", "followUpMissions", "timelineEvent"], notes: "Game writes completion history." },
  { id: "MissionHistory", displayName: "Mission History", rendererIndependent: true, semanticFields: ["eventType", "timestamp", "description", "relatedObject"], notes: "History schema is published, records are Game-owned." }
];

const missingCanonicalDefinitions: MissionExpeditionMissingCanonicalDefinition[] = [
  { id: "first_expedition", type: "progression_milestone", displayName: "First Expedition", referencedBy: ["integrationHooks"], severity: "info", recommendedOwner: "Civilization Progression", notes: "Reported for a future progression pass; this task does not fabricate progression milestones." },
  { id: "first_sample_return", type: "progression_milestone", displayName: "First Sample Return", referencedBy: ["integrationHooks"], severity: "info", recommendedOwner: "Civilization Progression", notes: "Reported for a future progression pass; this task does not fabricate progression milestones." },
  { id: "first_interstellar_expedition", type: "progression_milestone", displayName: "First Interstellar Expedition", referencedBy: ["integrationHooks"], severity: "info", recommendedOwner: "Civilization Progression", notes: "Reported for a future progression pass; this task does not fabricate progression milestones." },
  { id: "mission_board_art", type: "asset", displayName: "Mission Board Art", referencedBy: ["creativeProductionRequirements"], severity: "info", recommendedOwner: "Asset Library", notes: "Asset requirement only; no fake game screen is generated." },
  { id: "expedition_vehicle_catalog", type: "building", displayName: "Expedition Vehicle Catalog", referencedBy: ["expeditionRequirementDefinitions"], severity: "info", recommendedOwner: "Building Library", notes: "Vehicle/equipment catalog is future canonical content." }
];

export const missionExpeditionFramework: MissionExpeditionFrameworkContract = {
  id: "mission_expedition_framework_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-MISSION-EXPEDITION-FRAMEWORK",
  actionSystemId: "canonical_action_system_v1",
  planetDevelopmentFrameworkId: planetDevelopmentFramework.id,
  civilizationProgressionFrameworkId: civilizationProgressionFramework.id,
  colonizationFrameworkId: colonizationFramework.id,
  resourceEconomyLogisticsFrameworkId: resourceEconomyLogisticsFramework.id,
  universalDiscoveryRegistryVersion,
  calculationVersion: "mission-expedition-calculation-v1",
  ownership: {
    studioOwns: ["mission type contracts", "expedition scope contracts", "objective/reward contracts", "mission templates", "requirement definitions", "risk definitions", "generation rules", "presentation contracts", "runtime publication"],
    gameOwns: ["accepted missions", "active expeditions", "objective progress", "reward claims", "crew assignments", "loadouts", "timestamps", "mission history", "notifications", "save/cloud persistence"]
  },
  activePlayerStatePolicy: {
    exportsAcceptedMissions: false,
    exportsActiveExpeditions: false,
    exportsObjectiveProgress: false,
    exportsRewardClaims: false,
    exportsCrewAssignments: false,
    exportsTimestamps: false,
    exportsPlayerMissionHistory: false
  },
  missionTypeDefinitions,
  expeditionScopeDefinitions,
  missionLifecycleStateDefinitions,
  expeditionLifecycleStateDefinitions,
  missionObjectiveContractDefinitions,
  missionRewardContractDefinitions,
  missionTemplateDefinitions,
  expeditionRequirementDefinitions,
  expeditionRiskDefinitions,
  missionGenerationRules: [
    { id: "deterministic_seed_rule", displayName: "Deterministic Mission Seeds", deterministic: true, inputs: ["contentVersion", "missionSeed", "templateId", "targetObjectId", "issuingFactionId"], rejectsWhen: ["target is missing", "parent links are broken", "required system contract is unavailable"], notes: "The same canonical inputs generate the same mission candidates." },
    { id: "eligibility_rule", displayName: "Eligibility Rule", deterministic: true, inputs: ["completedResearchIds", "knowledgeState", "targetType", "scope", "routeAccess"], rejectsWhen: ["locked technology gate", "insufficient knowledge", "route unavailable"], notes: "Game evaluates player state against Studio contract." },
    { id: "no_duplicate_live_state_rule", displayName: "No Duplicate Live State", deterministic: true, inputs: ["templateId", "targetObjectId", "gameSaveMissionState"], rejectsWhen: ["mission already accepted and non-repeatable", "reward already claimed"], notes: "Studio publishes rule; Game owns live de-duplication." }
  ],
  missionInstanceSchema: {
    missionId: "stable generated mission id",
    templateId: "canonical mission template id",
    status: "MissionLifecycleStateId",
    objectiveProgress: "Game-owned objective progress values",
    acceptedAt: "Game-owned timestamp",
    completedAt: "Game-owned timestamp or null",
    rewardClaimState: "Game-owned reward claim record",
    createdFromContentVersion: "runtime content version that produced this mission"
  },
  expeditionInstanceSchema: {
    expeditionId: "Game-owned active expedition id",
    missionId: "related mission id",
    scopeId: "ExpeditionScopeId",
    targetId: "canonical target id",
    routeDefinitionId: "canonical logistics route id",
    transportModeId: "canonical transport mode id",
    crewAssignments: "Game-owned crew/loadout state",
    state: "ExpeditionLifecycleStateId",
    startedAt: "Game-owned timestamp",
    estimatedReturnAt: "Game-owned timestamp",
    createdFromContentVersion: "runtime content version that produced this expedition"
  },
  integrationHooks,
  aiAutomationRules: [
    "AI Agents may recommend eligible missions and expedition loadouts.",
    "AI Agents may not accept missions without player policy approval.",
    "AI Agents may not claim rewards, spend Premium Crystals, reveal hidden targets, bypass travel time, bypass logistics capacity, or create resources.",
    "AI Agents may help prioritize shipments and preparation actions through existing Action automation policies."
  ],
  missionExpeditionPresentationContract,
  creativeProductionRequirements: [
    { id: "mission_type_icons", displayName: "Mission Type Icons", category: "Missions & Expeditions", status: "required", notes: "Icons for exploration, survey, research, colony, logistics, trade, rescue, archaeology, diplomacy, and security." },
    { id: "expedition_scope_badges", displayName: "Expedition Scope Badges", category: "Missions & Expeditions", status: "required", notes: "Badges for local, planetary, orbital, interplanetary, interstellar, and galactic scopes." },
    { id: "risk_state_icons", displayName: "Risk State Icons", category: "Missions & Expeditions", status: "planned", notes: "Reusable icons for environmental, supply, navigation, and artifact containment risk." },
    { id: "mission_board_reference", displayName: "Mission Board Reference Screenshot", category: "Missions & Expeditions", status: "planned", notes: "Reference screenshot workflow only. Studio does not fabricate game screens." }
  ],
  assetLibraryCategories: [
    { id: "missions_expeditions", displayName: "Missions & Expeditions", groups: ["Mission Types", "Objective Icons", "Reward Icons", "Expedition Scopes", "Risk States", "Completion", "Reference Screens"], notes: "Canonical asset grouping for Mission & Expedition presentation." }
  ],
  missingCanonicalDefinitions,
  validationRules: [
    "Mission and expedition contracts must reference canonical actions.",
    "Mission templates must reference known mission types, scopes, objectives, and rewards.",
    "Expedition scopes must reference logistics routes and transport modes.",
    "Resource requirements must resolve through Resource Catalog.",
    "Mission state and expedition state transitions must resolve.",
    "Studio must not export accepted missions, active expeditions, objective progress, reward claims, crew assignments, timestamps, or player mission history.",
    "All six engine exports must publish the same framework."
  ]
};

export function validateMissionExpeditionFramework(
  framework: MissionExpeditionFrameworkContract = missionExpeditionFramework,
  options: {
    actionIds?: Set<string>;
    resourceIds?: Set<string>;
    routeIds?: Set<string>;
    transportModeIds?: Set<string>;
  } = {}
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const actionIds = options.actionIds ?? new Set(canonicalActionSystem.actionDefinitions.map((action) => action.id));
  const resourceIds = options.resourceIds ?? new Set(ResourceService.catalog.map((resource) => resource.id));
  const routeIds = options.routeIds ?? new Set(resourceEconomyLogisticsFramework.logisticsRouteDefinitions.map((route) => route.id));
  const transportModeIds = options.transportModeIds ?? new Set(resourceEconomyLogisticsFramework.transportModeDefinitions.map((transport) => transport.id));
  const missionTypeIds = new Set(framework.missionTypeDefinitions.map((definition) => definition.id));
  const scopeIds = new Set(framework.expeditionScopeDefinitions.map((definition) => definition.id));
  const objectiveIds = new Set(framework.missionObjectiveContractDefinitions.map((definition) => definition.id));
  const rewardIds = new Set(framework.missionRewardContractDefinitions.map((definition) => definition.id));
  const missionStateIds = new Set(framework.missionLifecycleStateDefinitions.map((definition) => definition.id));
  const expeditionStateIds = new Set(framework.expeditionLifecycleStateDefinitions.map((definition) => definition.id));

  if (framework.id !== "mission_expedition_framework_v1") issues.push(issue("error", "invalid_framework_id", "Mission & Expedition Framework id is not stable.", [framework.id]));
  if (framework.actionSystemId !== canonicalActionSystem.id) issues.push(issue("error", "invalid_action_system_reference", "Mission framework action system reference does not resolve.", [framework.actionSystemId]));
  if (framework.planetDevelopmentFrameworkId !== planetDevelopmentFramework.id) issues.push(issue("error", "invalid_planet_development_reference", "Mission framework planet development reference does not resolve.", [framework.planetDevelopmentFrameworkId]));
  if (framework.civilizationProgressionFrameworkId !== civilizationProgressionFramework.id) issues.push(issue("error", "invalid_civilization_progression_reference", "Mission framework civilization progression reference does not resolve.", [framework.civilizationProgressionFrameworkId]));
  if (framework.colonizationFrameworkId !== colonizationFramework.id) issues.push(issue("error", "invalid_colonization_reference", "Mission framework colonization reference does not resolve.", [framework.colonizationFrameworkId]));
  if (framework.resourceEconomyLogisticsFrameworkId !== resourceEconomyLogisticsFramework.id) issues.push(issue("error", "invalid_logistics_reference", "Mission framework logistics reference does not resolve.", [framework.resourceEconomyLogisticsFrameworkId]));

  for (const type of framework.missionTypeDefinitions) {
    for (const scopeId of type.expeditionScopeIds) if (!scopeIds.has(scopeId)) issues.push(issue("error", "invalid_mission_type_scope", `${type.id} scope ${scopeId} does not resolve.`, [type.id, scopeId]));
    for (const objectiveId of type.defaultObjectiveTypeIds) if (!objectiveIds.has(objectiveId)) issues.push(issue("error", "invalid_mission_type_objective", `${type.id} objective ${objectiveId} does not resolve.`, [type.id, objectiveId]));
    for (const rewardId of type.defaultRewardTypeIds) if (!rewardIds.has(rewardId)) issues.push(issue("error", "invalid_mission_type_reward", `${type.id} reward ${rewardId} does not resolve.`, [type.id, rewardId]));
    for (const actionId of type.requiredActionIds) if (!actionIds.has(actionId)) issues.push(issue("error", "invalid_mission_type_action", `${type.id} action ${actionId} does not resolve.`, [type.id, actionId]));
  }
  for (const scope of framework.expeditionScopeDefinitions) {
    for (const routeId of scope.requiredRouteDefinitionIds) if (!routeIds.has(routeId)) issues.push(issue("error", "invalid_scope_route", `${scope.id} route ${routeId} does not resolve.`, [scope.id, routeId]));
    for (const transportId of scope.requiredTransportModeIds) if (!transportModeIds.has(transportId)) issues.push(issue("error", "invalid_scope_transport", `${scope.id} transport ${transportId} does not resolve.`, [scope.id, transportId]));
  }
  for (const state of framework.missionLifecycleStateDefinitions) for (const transition of state.allowedTransitions) if (!missionStateIds.has(transition)) issues.push(issue("error", "invalid_mission_state_transition", `${state.id} transition ${transition} does not resolve.`, [state.id, transition]));
  for (const state of framework.expeditionLifecycleStateDefinitions) {
    if (!missionStateIds.has(state.missionStateHint)) issues.push(issue("error", "invalid_expedition_mission_hint", `${state.id} mission hint ${state.missionStateHint} does not resolve.`, [state.id, state.missionStateHint]));
    for (const transition of state.allowedTransitions) if (!expeditionStateIds.has(transition)) issues.push(issue("error", "invalid_expedition_state_transition", `${state.id} transition ${transition} does not resolve.`, [state.id, transition]));
  }
  for (const objective of framework.missionObjectiveContractDefinitions) for (const actionId of objective.requiredActionIds) if (!actionIds.has(actionId)) issues.push(issue("error", "invalid_objective_action", `${objective.id} action ${actionId} does not resolve.`, [objective.id, actionId]));
  for (const reward of framework.missionRewardContractDefinitions) for (const typeId of reward.allowedForMissionTypeIds) if (!missionTypeIds.has(typeId)) issues.push(issue("error", "invalid_reward_mission_type", `${reward.id} mission type ${typeId} does not resolve.`, [reward.id, typeId]));
  for (const template of framework.missionTemplateDefinitions) {
    if (!missionTypeIds.has(template.missionTypeId)) issues.push(issue("error", "invalid_template_type", `${template.id} type ${template.missionTypeId} does not resolve.`, [template.id, template.missionTypeId]));
    if (!scopeIds.has(template.expeditionScopeId)) issues.push(issue("error", "invalid_template_scope", `${template.id} scope ${template.expeditionScopeId} does not resolve.`, [template.id, template.expeditionScopeId]));
    for (const objectiveId of template.objectiveTypeIds) if (!objectiveIds.has(objectiveId)) issues.push(issue("error", "invalid_template_objective", `${template.id} objective ${objectiveId} does not resolve.`, [template.id, objectiveId]));
    for (const rewardId of template.rewardTypeIds) if (!rewardIds.has(rewardId)) issues.push(issue("error", "invalid_template_reward", `${template.id} reward ${rewardId} does not resolve.`, [template.id, rewardId]));
  }
  for (const requirement of framework.expeditionRequirementDefinitions) {
    for (const id of requirement.resourceIds) if (!resourceIds.has(id) && !id.startsWith("ECON-")) issues.push(issue("error", "invalid_requirement_resource", `${requirement.id} resource ${id} does not resolve.`, [requirement.id, id]));
    for (const actionId of requirement.actionIds) if (!actionIds.has(actionId)) issues.push(issue("error", "invalid_requirement_action", `${requirement.id} action ${actionId} does not resolve.`, [requirement.id, actionId]));
    for (const routeId of requirement.routeDefinitionIds) if (!routeIds.has(routeId)) issues.push(issue("error", "invalid_requirement_route", `${requirement.id} route ${routeId} does not resolve.`, [requirement.id, routeId]));
    for (const transportId of requirement.transportModeIds) if (!transportModeIds.has(transportId)) issues.push(issue("error", "invalid_requirement_transport", `${requirement.id} transport ${transportId} does not resolve.`, [requirement.id, transportId]));
  }
  for (const risk of framework.expeditionRiskDefinitions) {
    for (const scopeId of risk.appliesToScopeIds) if (!scopeIds.has(scopeId)) issues.push(issue("error", "invalid_risk_scope", `${risk.id} scope ${scopeId} does not resolve.`, [risk.id, scopeId]));
    for (const requirementId of risk.mitigationRequirementIds) if (!framework.expeditionRequirementDefinitions.some((requirement) => requirement.id === requirementId)) issues.push(issue("error", "invalid_risk_requirement", `${risk.id} requirement ${requirementId} does not resolve.`, [risk.id, requirementId]));
  }
  for (const hook of framework.integrationHooks) if (hook.required && !hook.referencedIds.length) issues.push(issue("error", "missing_integration_reference", `${hook.id} has no references.`, [hook.id]));
  if (!framework.aiAutomationRules.some((rule) => /may not claim rewards/i.test(rule))) issues.push(issue("error", "unsafe_ai_mission_automation", "AI mission automation rules must forbid reward claims."));
  if (!/exportsAcceptedMissions/.test(JSON.stringify(framework.activePlayerStatePolicy))) issues.push(issue("error", "missing_player_state_policy", "Mission player state policy is incomplete."));
  if (/"(?:acceptedMissionRecords|activeExpeditionRecords|objectiveProgressRecords|rewardClaimRecords|crewAssignmentRecords|playerMissionHistoryRecords)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework))) {
    issues.push(issue("error", "mission_private_or_player_state_leak", "Mission framework leaked player state or private paths."));
  }
  return issues;
}
