import { canonicalActionSystem } from "@/lib/actions/action-system";
import { canonicalPlanetOpportunityProfiles } from "@/lib/planets/opportunity-profiles";
import type {
  ImportIssue,
  PlanetDevelopmentActionReference,
  PlanetDevelopmentArchetype,
  PlanetDevelopmentAssetRequirement,
  PlanetDevelopmentCapabilities,
  PlanetDevelopmentCapabilityState,
  PlanetDevelopmentFrameworkContract,
  PlanetDevelopmentHazards,
  PlanetDevelopmentKnowledgeState,
  PlanetDevelopmentKnowledgeStateId,
  PlanetDevelopmentOpportunityScores,
  PlanetDevelopmentPresentationContract,
  PlanetDevelopmentProfile,
  PlanetDevelopmentProjectPhase,
  PlanetDevelopmentScoreBand,
  PlanetDevelopmentVisibilityRule,
  PlanetOpportunityProfile
} from "@/types/runtime";

const calculationVersion = "planet-development-v1";
const surveyHiddenStates: PlanetDevelopmentKnowledgeStateId[] = ["unknown", "detected", "probe_queued", "probing", "probed", "survey_queued", "surveying"];
const postSurveyStates: PlanetDevelopmentKnowledgeStateId[] = ["surveyed", "analyzed", "catalogued", "development_selected", "development_active", "operational", "preserved", "abandoned"];

function state(input: Omit<PlanetDevelopmentKnowledgeState, "canShowCsi" | "canShowSvi" | "canShowNickname" | "canShowRecommendations" | "canShowDevelopmentActions">): PlanetDevelopmentKnowledgeState {
  const surveyed = postSurveyStates.includes(input.id);
  return {
    ...input,
    canShowCsi: surveyed,
    canShowSvi: surveyed,
    canShowNickname: surveyed,
    canShowRecommendations: surveyed,
    canShowDevelopmentActions: surveyed
  };
}

export const planetDevelopmentKnowledgeLifecycle: PlanetDevelopmentKnowledgeState[] = [
  state({ id: "unknown", displayName: "Unknown", order: 1, allowedTransitions: ["detected"], terminal: false, notes: "Only ??? and an unknown marker may be shown." }),
  state({ id: "detected", displayName: "Detected", order: 2, allowedTransitions: ["probe_queued"], terminal: false, notes: "Object exists with approximate signal only." }),
  state({ id: "probe_queued", displayName: "Probe Queued", order: 3, allowedTransitions: ["probing", "abandoned"], terminal: false, notes: "Probe action is queued through the Canonical Action System." }),
  state({ id: "probing", displayName: "Probing", order: 4, allowedTransitions: ["probed", "abandoned"], terminal: false, notes: "Probe action is preparing or in progress." }),
  state({ id: "probed", displayName: "Probed", order: 5, allowedTransitions: ["survey_queued", "catalogued", "abandoned"], terminal: false, notes: "Broad body class and basic hazard/resource signals are visible; CSI/SVI remain hidden." }),
  state({ id: "survey_queued", displayName: "Survey Queued", order: 6, allowedTransitions: ["surveying", "abandoned"], terminal: false, notes: "Survey action is queued." }),
  state({ id: "surveying", displayName: "Surveying", order: 7, allowedTransitions: ["surveyed", "abandoned"], terminal: false, notes: "Survey action is preparing or in progress." }),
  state({ id: "surveyed", displayName: "Surveyed", order: 8, allowedTransitions: ["analyzed", "catalogued", "development_selected", "preserved", "abandoned"], terminal: false, notes: "Full Planet Development Report may be revealed." }),
  state({ id: "analyzed", displayName: "Analyzed", order: 9, allowedTransitions: ["catalogued", "development_selected", "preserved", "abandoned"], terminal: false, notes: "Analysis can refine recommendations without changing the canonical report definition." }),
  state({ id: "catalogued", displayName: "Catalogued", order: 10, allowedTransitions: ["development_selected", "preserved", "abandoned"], terminal: false, notes: "Catalog-only discovery remains a valid outcome." }),
  state({ id: "development_selected", displayName: "Development Selected", order: 11, allowedTransitions: ["development_active", "preserved", "abandoned"], terminal: false, notes: "A valid development path has been selected." }),
  state({ id: "development_active", displayName: "Development Active", order: 12, allowedTransitions: ["operational", "preserved", "abandoned"], terminal: false, notes: "A canonical action-driven project is active in the Game." }),
  state({ id: "operational", displayName: "Operational", order: 13, allowedTransitions: ["preserved", "abandoned"], terminal: false, notes: "Completed development is operating." }),
  state({ id: "preserved", displayName: "Preserved", order: 14, allowedTransitions: ["abandoned"], terminal: true, notes: "Body is intentionally protected or left undeveloped." }),
  state({ id: "abandoned", displayName: "Abandoned", order: 15, allowedTransitions: [], terminal: true, notes: "Body or project has been abandoned while history remains Game-owned." })
];

function visibility(stateId: PlanetDevelopmentKnowledgeStateId): PlanetDevelopmentVisibilityRule {
  const detected = !["unknown"].includes(stateId);
  const probed = !["unknown", "detected", "probe_queued", "probing"].includes(stateId);
  const surveyed = postSurveyStates.includes(stateId);
  return {
    stateId,
    hiddenDisplayName: "???",
    canShowObjectExists: detected,
    canShowApproximateLocation: detected,
    canShowDistance: detected,
    canShowUnresolvedSignal: detected && !probed,
    canShowBroadBodyClass: probed,
    canShowApproximateAtmosphere: probed,
    canShowApproximateGravity: probed,
    canShowTemperatureBand: probed,
    canShowBasicHazards: probed,
    canShowPreliminaryResourceSignals: probed,
    canShowCsi: surveyed,
    canShowSvi: surveyed,
    canShowNickname: surveyed,
    canShowOpportunityScores: surveyed,
    canShowCapabilities: surveyed,
    canShowRestrictions: surveyed,
    canShowRecommendations: surveyed,
    canShowFullResources: surveyed,
    canShowLifeforms: surveyed,
    canShowRuinsDiscoveries: surveyed,
    canShowValidDevelopmentActions: surveyed
  };
}

export const planetDevelopmentVisibilityMatrix = planetDevelopmentKnowledgeLifecycle.map((item) => visibility(item.id));

export const csiBands: PlanetDevelopmentScoreBand[] = [
  { id: "exceptional", min: 90, max: 100, label: "Exceptional", starRating: 5, summary: "Strong sustained civilization suitability." },
  { id: "excellent", min: 75, max: 89, label: "Excellent", starRating: 4, summary: "Excellent development potential with manageable limits." },
  { id: "viable", min: 60, max: 74, label: "Viable", starRating: 3, summary: "Can support civilization with focused planning." },
  { id: "challenging", min: 40, max: 59, label: "Challenging", starRating: 2, summary: "Useful but constrained for habitation." },
  { id: "severely_limited", min: 20, max: 39, label: "Severely Limited", starRating: 1, summary: "Development should usually avoid population-first paths." },
  { id: "uninhabitable", min: 0, max: 19, label: "Uninhabitable", starRating: 0, summary: "No meaningful sustained habitation without extraordinary intervention." }
];

export const sviBands: PlanetDevelopmentScoreBand[] = [
  { id: "legendary_value", min: 90, max: 100, label: "Legendary Value", starRating: 5, summary: "Major strategic value beyond habitation." },
  { id: "high_value", min: 75, max: 89, label: "High Value", starRating: 4, summary: "Strong strategic, scientific, industrial, or logistical value." },
  { id: "valuable", min: 60, max: 74, label: "Valuable", starRating: 3, summary: "Worth developing for at least one major role." },
  { id: "situational", min: 40, max: 59, label: "Situational", starRating: 2, summary: "Useful when it fits a specific plan or route." },
  { id: "low_value", min: 20, max: 39, label: "Low Value", starRating: 1, summary: "Limited strategic value outside cataloging or niche needs." },
  { id: "minimal_value", min: 0, max: 19, label: "Minimal Value", starRating: 0, summary: "Usually catalog-only unless future content changes its value." }
];

export const opportunityArchetypes: PlanetDevelopmentArchetype[] = [
  { id: "garden_world", displayName: "Garden World", summary: "Prime colonization, tourism, and trade candidate.", qualifyingRules: ["colonization >= 90"], priority: 100, presentationToken: "garden", recommendedActionIds: ["prepare_colony", "establish_colony", "catalog_planet"] },
  { id: "frontier_colony", displayName: "Frontier Colony", summary: "Viable but imperfect colony candidate.", qualifyingRules: ["colonization >= 60"], priority: 80, presentationToken: "frontier", recommendedActionIds: ["prepare_colony", "establish_colony"] },
  { id: "ocean_frontier", displayName: "Ocean Frontier", summary: "Water-rich frontier with research and harvesting value.", qualifyingRules: ["resourceHarvesting >= 70", "scientificResearch >= 70"], priority: 78, presentationToken: "ocean", recommendedActionIds: ["build_ocean_harvest_platform", "build_research_station"] },
  { id: "mining_giant", displayName: "Mining Giant", summary: "Extraction-first target with exceptional mining value.", qualifyingRules: ["mining >= 90"], priority: 85, presentationToken: "mine", recommendedActionIds: ["build_mining_outpost", "deploy_automated_extraction"] },
  { id: "industrial_powerhouse", displayName: "Industrial Powerhouse", summary: "High extraction and orbital industry potential.", qualifyingRules: ["mining >= 75", "orbitalInfrastructure >= 70"], priority: 76, presentationToken: "industry", recommendedActionIds: ["build_mining_outpost", "build_orbital_refinery"] },
  { id: "scientific_paradise", displayName: "Scientific Paradise", summary: "Exceptional scientific value.", qualifyingRules: ["scientificResearch >= 90"], priority: 82, presentationToken: "science", recommendedActionIds: ["build_research_station", "analyze_anomaly"] },
  { id: "research_haven", displayName: "Research Haven", summary: "Strong research target with manageable constraints.", qualifyingRules: ["scientificResearch >= 75"], priority: 72, presentationToken: "research", recommendedActionIds: ["build_research_station"] },
  { id: "living_laboratory", displayName: "Living Laboratory", summary: "Life-bearing or biologically complex study target.", qualifyingRules: ["preservation >= 70", "scientificResearch >= 70"], priority: 74, presentationToken: "bio", recommendedActionIds: ["build_research_station", "designate_preserve"] },
  { id: "orbital_refinery_candidate", displayName: "Orbital Refinery Candidate", summary: "Excellent orbital infrastructure candidate.", qualifyingRules: ["orbitalInfrastructure >= 85"], priority: 70, presentationToken: "orbital", recommendedActionIds: ["build_orbital_refinery"] },
  { id: "fuel_depot", displayName: "Fuel Depot", summary: "Strong refueling and logistics target.", qualifyingRules: ["logistics >= 70"], priority: 64, presentationToken: "fuel", recommendedActionIds: ["build_gas_harvest_platform", "establish_trade_route"] },
  { id: "crystal_world", displayName: "Crystal World", summary: "Rare mineral, tourism, and scientific opportunity.", qualifyingRules: ["profile contains Crystal"], priority: 69, presentationToken: "crystal", recommendedActionIds: ["build_mining_outpost", "build_research_station"] },
  { id: "frozen_research_outpost", displayName: "Frozen Research Outpost", summary: "Cold-world research and resource support target.", qualifyingRules: ["temperature hazard high", "scientificResearch >= 65"], priority: 58, presentationToken: "frozen", recommendedActionIds: ["build_research_station", "build_mining_outpost"] },
  { id: "ancient_graveyard", displayName: "Ancient Graveyard", summary: "Archaeology and artifact value.", qualifyingRules: ["archaeology >= 65"], priority: 73, presentationToken: "ancient", recommendedActionIds: ["build_archaeological_camp", "excavate_ruin"] },
  { id: "archaeological_treasure", displayName: "Archaeological Treasure", summary: "High-value ruin or artifact target.", qualifyingRules: ["archaeology >= 80"], priority: 84, presentationToken: "artifact", recommendedActionIds: ["build_archaeological_camp", "excavate_ruin", "analyze_artifact"] },
  { id: "protected_living_world", displayName: "Protected Living World", summary: "Preservation path can outrank extraction.", qualifyingRules: ["preservation >= 80"], priority: 88, presentationToken: "preserve", recommendedActionIds: ["designate_preserve", "catalog_planet"] },
  { id: "dead_but_valuable", displayName: "Dead But Valuable", summary: "Low habitation with useful extraction, archaeology, or infrastructure value.", qualifyingRules: ["colonization < 30", "SVI >= 45"], priority: 55, presentationToken: "dead_value", recommendedActionIds: ["catalog_planet", "build_mining_outpost"] },
  { id: "terraforming_candidate", displayName: "Terraforming Candidate", summary: "Poor current habitation but meaningful future restoration potential.", qualifyingRules: ["terraforming >= 55"], priority: 62, presentationToken: "terraform", recommendedActionIds: ["begin_terraforming_study", "terraform_planet_stage"] },
  { id: "trade_crossroads", displayName: "Trade Crossroads", summary: "Strong trade route and market position.", qualifyingRules: ["tradeHub >= 75"], priority: 66, presentationToken: "trade", recommendedActionIds: ["establish_trade_route"] },
  { id: "logistics_hub", displayName: "Logistics Hub", summary: "Useful as a travel, refueling, or route-support node.", qualifyingRules: ["logistics >= 75"], priority: 60, presentationToken: "logistics", recommendedActionIds: ["transfer_resources", "travel_to_destination"] },
  { id: "strategic_outpost", displayName: "Strategic Outpost", summary: "Security or position matters more than population.", qualifyingRules: ["strategicSecurity >= 65"], priority: 59, presentationToken: "strategic", recommendedActionIds: ["build_orbital_refinery", "catalog_planet"] },
  { id: "catalog_only", displayName: "Catalog Only", summary: "Best treated as a discovery record for now.", qualifyingRules: ["all opportunity scores low or restrictions dominate"], priority: 1, presentationToken: "catalog", recommendedActionIds: ["catalog_planet"] }
];

export const actionReferences: PlanetDevelopmentActionReference[] = [
  { actionId: "send_probe", intent: "Probe launch", requiredSurveyComplete: false },
  { actionId: "probe_travel", intent: "Probe travel", requiredSurveyComplete: false },
  { actionId: "probe_scan", intent: "Probe scan", requiredSurveyComplete: false },
  { actionId: "survey_planet", intent: "Survey", requiredSurveyComplete: false },
  { actionId: "catalog_planet", intent: "Catalog discovery", requiredSurveyComplete: true },
  { actionId: "prepare_colony", intent: "Prepare colony", requiredSurveyComplete: true },
  { actionId: "establish_colony", intent: "Establish colony", requiredSurveyComplete: true },
  { actionId: "build_mining_outpost", intent: "Mining", requiredSurveyComplete: true },
  { actionId: "deploy_automated_extraction", intent: "Automated extraction", requiredSurveyComplete: true },
  { actionId: "build_gas_harvest_platform", intent: "Gas harvesting", requiredSurveyComplete: true },
  { actionId: "build_ocean_harvest_platform", intent: "Ocean harvesting", requiredSurveyComplete: true },
  { actionId: "build_research_station", intent: "Research", requiredSurveyComplete: true },
  { actionId: "build_archaeological_camp", intent: "Archaeology", requiredSurveyComplete: true },
  { actionId: "excavate_ruin", intent: "Excavation", requiredSurveyComplete: true },
  { actionId: "build_orbital_refinery", intent: "Orbital industry", requiredSurveyComplete: true },
  { actionId: "establish_trade_route", intent: "Trade", requiredSurveyComplete: true },
  { actionId: "designate_preserve", intent: "Preservation", requiredSurveyComplete: true },
  { actionId: "begin_terraforming_study", intent: "Terraforming study", requiredSurveyComplete: true },
  { actionId: "terraform_planet_stage", intent: "Terraforming stage", requiredSurveyComplete: true }
];

export const developmentProjectPhases: PlanetDevelopmentProjectPhase[] = [
  { id: "planning", displayName: "Planning", order: 1, actionPhaseTemplateId: "planning", requirementTypes: ["research", "technology", "server_verification"], notes: "Select canonical development path and validate requirements." },
  { id: "resource_allocation", displayName: "Resource Allocation", order: 2, actionPhaseTemplateId: "allocation", requirementTypes: ["resource", "credits", "labor", "population", "workforce", "equipment"], notes: "Reserve or consume project inputs according to the Action definition." },
  { id: "transportation", displayName: "Transportation", order: 3, actionPhaseTemplateId: "transport", requirementTypes: ["range", "location", "queue_capacity"], notes: "Move equipment, workforce, probes, or colony assets." },
  { id: "site_preparation", displayName: "Site Preparation", order: 4, actionPhaseTemplateId: "preparation", requirementTypes: ["target_class", "target_environment", "preservation_restriction"], notes: "Prepare safe surface, orbital, subsurface, floating, or remote-operation site." },
  { id: "construction", displayName: "Construction", order: 5, actionPhaseTemplateId: "construction", requirementTypes: ["building", "resource", "labor"], notes: "Build infrastructure through the Canonical Action System." },
  { id: "commissioning", displayName: "Commissioning", order: 6, actionPhaseTemplateId: "commissioning", requirementTypes: ["server_verification"], notes: "Verify output, links, ownership, and project effects." },
  { id: "stabilization", displayName: "Stabilization", order: 7, actionPhaseTemplateId: "stabilization", requirementTypes: ["workforce", "resource", "story_gate"], notes: "Stabilize hazards, workforce, logistics, energy inputs, and future operations." },
  { id: "operational", displayName: "Operational", order: 8, actionPhaseTemplateId: "completion", requirementTypes: ["server_verification"], notes: "Emit completion event and allow Game-owned operations to begin." }
];

export const presentationContracts: PlanetDevelopmentPresentationContract[] = [
  "PlanetDevelopmentReport",
  "CivilizationSuitabilityGauge",
  "StrategicValueGauge",
  "OpportunityScoreBar",
  "RecommendedUseCard",
  "HazardIndicator",
  "CapabilityBadge",
  "RestrictionBadge",
  "PlanetKnowledgeProgress",
  "ProbeProgress",
  "SurveyProgress",
  "DevelopmentProjectSummary"
].map((id) => ({
  id: id as PlanetDevelopmentPresentationContract["id"],
  displayName: id.replace(/([A-Z])/g, " $1").trim(),
  visibleBeforeSurvey: ["PlanetKnowledgeProgress", "ProbeProgress", "SurveyProgress"].includes(id),
  rendererIndependent: true,
  notes: "Studio publishes semantic display intent only; clients own layout and rendering."
}));

export const assetRequirements: PlanetDevelopmentAssetRequirement[] = [
  { id: "asset_csi_badges", displayName: "CSI badges", category: "badge", status: "planned", notes: "Civilization suitability rating badges." },
  { id: "asset_svi_badges", displayName: "SVI badges", category: "badge", status: "planned", notes: "Strategic value rating badges." },
  { id: "asset_opportunity_icons", displayName: "Opportunity icons", category: "icon", status: "planned", notes: "Icons for archetypes and recommended uses." },
  { id: "asset_hazard_icons", displayName: "Hazard icons", category: "icon", status: "planned", notes: "Temperature, radiation, toxicity, pressure, gravity, weather, geology, biology, EM, anomaly, and accessibility indicators." },
  { id: "asset_restriction_icons", displayName: "Restriction icons", category: "icon", status: "planned", notes: "Restriction and blocked-action reason badges." },
  { id: "asset_unknown_probe_survey_states", displayName: "Unknown/probe/survey states", category: "state", status: "planned", notes: "Knowledge-state visuals before survey completion." },
  { id: "asset_survey_reveal", displayName: "Survey reveal", category: "reveal", status: "planned", notes: "Post-survey reveal treatment." },
  { id: "asset_project_icons", displayName: "Development project icons", category: "project", status: "planned", notes: "Semantic project action icons." },
  { id: "asset_phase_markers", displayName: "Project phase markers", category: "phase", status: "planned", notes: "Planning through operational phase tokens." }
];

function bandFor(value: number, bands: PlanetDevelopmentScoreBand[]) {
  return bands.find((band) => value >= band.min && value <= band.max) ?? bands[bands.length - 1];
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoresFrom(profile: PlanetOpportunityProfile): PlanetDevelopmentOpportunityScores {
  const preservation = profile.preservationStatus === "encouraged" ? 88 : profile.preservationStatus === "restricted" ? 72 : profile.preservationStatus === "optional" ? 48 : 8;
  return {
    colonization: profile.suitability.colonization,
    mining: profile.suitability.mining,
    resourceHarvesting: profile.suitability.harvesting,
    scientificResearch: profile.suitability.scientificResearch,
    archaeology: profile.suitability.archaeology,
    orbitalInfrastructure: profile.suitability.orbitalInfrastructure,
    energyProduction: clamp((profile.suitability.harvesting + profile.suitability.mining + profile.suitability.orbitalInfrastructure) / 3),
    tradeHub: profile.suitability.tradeHub,
    tourism: profile.suitability.tourism,
    terraforming: profile.suitability.terraforming,
    preservation,
    strategicSecurity: profile.suitability.military,
    logistics: clamp((profile.suitability.orbitalInfrastructure + profile.suitability.tradeHub + (profile.eligibility.supportsRefueling ? 80 : 20)) / 3),
    habitationSupport: profile.suitability.colonization
  };
}

function capability(enabled: boolean, score: number, prohibited = false): PlanetDevelopmentCapabilityState {
  if (prohibited) return "prohibited";
  if (!enabled) return "unavailable";
  if (score >= 80) return "recommended";
  if (score >= 55) return "supported";
  if (score >= 30) return "technically_possible";
  return "currently_locked";
}

function capabilitiesFor(profile: PlanetOpportunityProfile, scores: PlanetDevelopmentOpportunityScores): PlanetDevelopmentCapabilities {
  const noSolidSurface = /gas giant|ice giant|asteroid belt/i.test(profile.planetClass);
  return {
    surfaceColonization: capability(profile.eligibility.supportsColonization, scores.colonization, noSolidSurface),
    orbitalColonization: capability(profile.eligibility.supportsOrbitalPlatforms, scores.orbitalInfrastructure),
    subsurfaceColonization: capability(profile.eligibility.supportsColonization, scores.colonization - 10),
    floatingColonization: capability(/gas giant|ice giant/i.test(profile.planetClass), scores.orbitalInfrastructure),
    mining: capability(profile.eligibility.supportsMining, scores.mining),
    harvesting: capability(profile.eligibility.supportsHarvesting, scores.resourceHarvesting),
    research: capability(profile.eligibility.supportsResearchStations, scores.scientificResearch),
    archaeology: capability(scores.archaeology > 30, scores.archaeology),
    orbitalPlatforms: capability(profile.eligibility.supportsOrbitalPlatforms, scores.orbitalInfrastructure),
    trade: capability(scores.tradeHub > 30, scores.tradeHub),
    tourism: capability(profile.eligibility.supportsTourism, scores.tourism),
    terraforming: capability(profile.eligibility.supportsTerraforming, scores.terraforming),
    preservation: capability(profile.eligibility.supportsPreservation, scores.preservation, profile.preservationStatus === "restricted" && scores.colonization < 25),
    refueling: capability(profile.eligibility.supportsRefueling, scores.logistics),
    automatedExtraction: capability(profile.eligibility.supportsMining || profile.eligibility.supportsHarvesting, Math.max(scores.mining, scores.resourceHarvesting)),
    humanPresence: capability(profile.eligibility.supportsColonization || profile.eligibility.supportsResearchStations, Math.max(scores.colonization, scores.scientificResearch)),
    roboticPresence: capability(true, Math.max(scores.mining, scores.resourceHarvesting, scores.scientificResearch))
  };
}

function hazardsFor(profile: PlanetOpportunityProfile): PlanetDevelopmentHazards {
  return {
    temperature: profile.hazardProfile.temperature,
    radiation: profile.hazardProfile.radiation,
    toxicity: profile.hazardProfile.atmosphere,
    pressure: profile.hazardProfile.atmosphere,
    gravity: profile.hazardProfile.gravity,
    weather: profile.hazardProfile.storms,
    geology: profile.suitability.danger,
    biology: profile.hazardProfile.hostility,
    electromagneticActivity: profile.hazardProfile.radiation,
    anomalies: profile.suitability.scientificResearch > 85 ? 65 : 20,
    accessibility: clamp((profile.hazardProfile.gravity + profile.hazardProfile.atmosphere + profile.hazardProfile.environmentalRisk) / 3),
    overallDanger: profile.suitability.danger
  };
}

function restrictionsFor(profile: PlanetOpportunityProfile, capabilities: PlanetDevelopmentCapabilities) {
  const restrictions = new Set<string>();
  if (capabilities.surfaceColonization === "prohibited") restrictions.add("no_solid_surface");
  if (/gas giant|ice giant/i.test(profile.planetClass)) restrictions.add("crushing_pressure");
  if (profile.hazardProfile.temperature >= 80) restrictions.add("extreme_temperature");
  if (profile.hazardProfile.radiation >= 80) restrictions.add("radiation");
  if (profile.hazardProfile.atmosphere >= 80) restrictions.add(profile.planetClass === "Toxic" ? "corrosive_atmosphere" : "toxic_atmosphere");
  if (profile.hazardProfile.storms >= 80) restrictions.add("storms");
  if (profile.hazardProfile.gravity >= 80) restrictions.add("gravity");
  if (profile.preservationStatus === "encouraged") restrictions.add("protected_ecology");
  if (profile.preservationStatus === "restricted") restrictions.add("story_restriction");
  if (profile.suitability.archaeology >= 70) restrictions.add("protected_artifact_sites");
  if (profile.hazardProfile.hostility >= 80) restrictions.add("hostile_life");
  return [...restrictions];
}

function archetypeFor(profile: PlanetOpportunityProfile, scores: PlanetDevelopmentOpportunityScores) {
  if (profile.preservationStatus === "encouraged" && scores.preservation >= 80) return "protected_living_world";
  if (scores.colonization >= 90) return "garden_world";
  if (/crystal/i.test(profile.planetClass)) return "crystal_world";
  if (scores.archaeology >= 80) return "archaeological_treasure";
  if (scores.scientificResearch >= 90) return "scientific_paradise";
  if (scores.mining >= 90) return "mining_giant";
  if (scores.orbitalInfrastructure >= 85) return "orbital_refinery_candidate";
  if (scores.terraforming >= 55) return "terraforming_candidate";
  if (scores.tradeHub >= 75) return "trade_crossroads";
  if (scores.logistics >= 75) return "logistics_hub";
  if (scores.colonization >= 60) return "frontier_colony";
  if (scores.scientificResearch >= 75) return "research_haven";
  if (scores.mining >= 75 && scores.orbitalInfrastructure >= 70) return "industrial_powerhouse";
  if (scores.scientificResearch >= 65 && profile.hazardProfile.temperature >= 75) return "frozen_research_outpost";
  if (scores.strategicSecurity >= 65) return "strategic_outpost";
  if (scores.colonization < 30 && Math.max(scores.mining, scores.scientificResearch, scores.orbitalInfrastructure) >= 45) return "dead_but_valuable";
  return "catalog_only";
}

function validActionsFor(profile: PlanetOpportunityProfile, scores: PlanetDevelopmentOpportunityScores, capabilities: PlanetDevelopmentCapabilities) {
  const ids = new Set(["send_probe", "probe_travel", "probe_scan", "survey_planet", "catalog_planet"]);
  if (capabilities.surfaceColonization !== "prohibited" && profile.eligibility.supportsColonization && scores.colonization >= 30) {
    ids.add("prepare_colony");
    ids.add("establish_colony");
  }
  if (profile.eligibility.supportsMining && scores.mining >= 35) ids.add("build_mining_outpost");
  if ((profile.eligibility.supportsMining || profile.eligibility.supportsHarvesting) && Math.max(scores.mining, scores.resourceHarvesting) >= 60) ids.add("deploy_automated_extraction");
  if (/gas giant|ice giant/i.test(profile.planetClass) && profile.eligibility.supportsHarvesting) ids.add("build_gas_harvest_platform");
  if (/ocean/i.test(profile.planetClass) && profile.eligibility.supportsHarvesting) ids.add("build_ocean_harvest_platform");
  if (profile.eligibility.supportsResearchStations && scores.scientificResearch >= 40) ids.add("build_research_station");
  if (scores.archaeology >= 45) {
    ids.add("build_archaeological_camp");
    ids.add("excavate_ruin");
  }
  if (profile.eligibility.supportsOrbitalPlatforms && scores.orbitalInfrastructure >= 55) ids.add("build_orbital_refinery");
  if (scores.tradeHub >= 45 || scores.logistics >= 55) ids.add("establish_trade_route");
  if (profile.eligibility.supportsPreservation || profile.preservationStatus === "encouraged") ids.add("designate_preserve");
  if (profile.eligibility.supportsTerraforming && scores.terraforming >= 30) {
    ids.add("begin_terraforming_study");
    ids.add("terraform_planet_stage");
  }
  return [...ids];
}

function blockedReasonsFor(validActionIds: string[], profile: PlanetOpportunityProfile, capabilities: PlanetDevelopmentCapabilities) {
  const valid = new Set(validActionIds);
  return actionReferences
    .filter((reference) => !valid.has(reference.actionId))
    .map((reference) => {
      if (["prepare_colony", "establish_colony"].includes(reference.actionId) && capabilities.surfaceColonization === "prohibited") {
        return { actionId: reference.actionId, reasonCode: "blocked_no_solid_surface", description: "Surface colonization is blocked because this body has no solid surface." };
      }
      if (["prepare_colony", "establish_colony"].includes(reference.actionId) && profile.preservationStatus === "encouraged") {
        return { actionId: reference.actionId, reasonCode: "blocked_protected_ecology", description: "Colonization is blocked or discouraged by preservation priority until explicitly overridden by game rules." };
      }
      if (reference.actionId.includes("terraform") && !profile.eligibility.supportsTerraforming) {
        return { actionId: reference.actionId, reasonCode: "blocked_terraforming_not_supported", description: "Terraforming is not supported by this body class." };
      }
      return { actionId: reference.actionId, reasonCode: "blocked_low_suitability_or_missing_technology", description: "This action is not currently recommended by the canonical development profile." };
    });
}

function csiFor(profile: PlanetOpportunityProfile, scores: PlanetDevelopmentOpportunityScores) {
  return clamp((scores.colonization * 0.5) + (scores.habitationSupport * 0.2) + ((100 - profile.suitability.environmentalHazard) * 0.2) + (scores.logistics * 0.1));
}

function sviFor(scores: PlanetDevelopmentOpportunityScores) {
  return clamp(Math.max(scores.mining, scores.resourceHarvesting, scores.scientificResearch, scores.archaeology, scores.orbitalInfrastructure, scores.energyProduction, scores.tradeHub, scores.preservation, scores.strategicSecurity, scores.logistics));
}

function profileToDevelopment(profile: PlanetOpportunityProfile): PlanetDevelopmentProfile {
  const opportunityScores = scoresFrom(profile);
  const capabilities = capabilitiesFor(profile, opportunityScores);
  const hazards = hazardsFor(profile);
  const restrictions = restrictionsFor(profile, capabilities);
  const csiValue = csiFor(profile, opportunityScores);
  const sviValue = sviFor(opportunityScores);
  const csiBand = bandFor(csiValue, csiBands);
  const sviBand = bandFor(sviValue, sviBands);
  const validActionIds = validActionsFor(profile, opportunityScores, capabilities);
  return {
    id: `planet_development_${profile.id.replace(/^planet_opportunity_/, "")}`,
    ownerBodyId: `baseline_${profile.id.replace(/^planet_opportunity_/, "")}`,
    sourceOpportunityProfileId: profile.id,
    calculationVersion,
    csi: {
      value: csiValue,
      bandId: csiBand.id,
      label: csiBand.label,
      starRating: csiBand.starRating,
      summary: csiBand.summary,
      advantages: [
        opportunityScores.colonization >= 60 ? "habitation potential" : "",
        opportunityScores.logistics >= 60 ? "logistics support" : "",
        opportunityScores.tourism >= 70 ? "tourism appeal" : ""
      ].filter(Boolean),
      limitingFactors: [
        profile.suitability.environmentalHazard >= 70 ? "high environmental hazard" : "",
        capabilities.surfaceColonization === "prohibited" ? "no solid surface" : "",
        profile.hazardProfile.radiation >= 80 ? "radiation exposure" : ""
      ].filter(Boolean),
      version: calculationVersion
    },
    svi: {
      value: sviValue,
      bandId: sviBand.id,
      label: sviBand.label,
      starRating: sviBand.starRating,
      summary: sviBand.summary,
      advantages: [
        opportunityScores.mining >= 75 ? "high mining value" : "",
        opportunityScores.resourceHarvesting >= 75 ? "harvesting value" : "",
        opportunityScores.scientificResearch >= 75 ? "research value" : "",
        opportunityScores.orbitalInfrastructure >= 75 ? "orbital infrastructure value" : ""
      ].filter(Boolean),
      limitingFactors: restrictions.slice(0, 3),
      version: calculationVersion
    },
    opportunityScores,
    opportunityArchetypeId: archetypeFor(profile, opportunityScores),
    capabilities,
    restrictions,
    hazards,
    recommendedUses: profile.recommendedUses,
    validActionIds,
    blockedActionReasons: blockedReasonsFor(validActionIds, profile, capabilities),
    visibilityProfile: "survey_required",
    validationStatus: "Ready"
  };
}

export const planetDevelopmentProfiles = canonicalPlanetOpportunityProfiles.map(profileToDevelopment);

export const planetDevelopmentFramework: PlanetDevelopmentFrameworkContract = {
  id: "planet_development_framework_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-PLANET-DEVELOPMENT-FRAMEWORK",
  actionSystemId: canonicalActionSystem.id,
  planetOpportunityProfileVersion: "1.0.0",
  calculationVersion,
  ownership: {
    studioOwns: ["knowledge lifecycle", "visibility matrix", "CSI/SVI bands", "opportunity archetypes", "deterministic report resolver", "valid action references", "blocked action reasons", "project phase templates", "presentation intent", "asset requirements", "runtime publication"],
    gameOwns: ["active player projects", "project timers", "queue contents", "timestamps", "player resource balances", "player decisions", "server-authoritative completion", "UI rendering"]
  },
  knowledgeLifecycle: planetDevelopmentKnowledgeLifecycle,
  visibilityMatrix: planetDevelopmentVisibilityMatrix,
  csiBands,
  sviBands,
  opportunityArchetypes,
  bodyClassBaselines: canonicalPlanetOpportunityProfiles.map((profile) => ({ id: `baseline_${profile.id.replace(/^planet_opportunity_/, "")}`, bodyClass: profile.planetClass, opportunityProfileId: profile.id, notes: "Baseline resolves generated bodies before explicit overrides." })),
  actionReferences,
  developmentProjectPhases,
  presentationContracts,
  assetRequirements,
  developmentProfiles: planetDevelopmentProfiles,
  validationRules: [
    "CSI, SVI, nickname, recommendations, opportunity scores, full resources, and valid development actions are hidden before survey completion.",
    "Detected bodies cannot transition directly to operational, colonized, preserved, or abandoned outcomes without canonical intermediate states.",
    "Every valid development action must resolve to the Canonical Action System.",
    "Every blocked action must include a canonical reason code.",
    "Gas giants and no-solid-surface bodies must block surface colonization.",
    "Protected worlds may block colonization even with strong CSI.",
    "Studio exports definitions and report templates only; active player projects remain Game-owned."
  ]
};

export function validatePlanetDevelopmentFramework(
  framework: PlanetDevelopmentFrameworkContract = planetDevelopmentFramework,
  actionIds = new Set(canonicalActionSystem.actionDefinitions.map((action) => action.id)),
  opportunityProfileIds = new Set(canonicalPlanetOpportunityProfiles.map((profile) => profile.id))
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const lifecycleIds = new Set(framework.knowledgeLifecycle.map((item) => item.id));
  const archetypeIds = new Set(framework.opportunityArchetypes.map((item) => item.id));
  const csiBandIds = new Set(framework.csiBands.map((band) => band.id));
  const sviBandIds = new Set(framework.sviBands.map((band) => band.id));
  const directIllegalTargets = new Set(["operational", "preserved"]);

  if (framework.actionSystemId !== canonicalActionSystem.id) {
    issues.push({ severity: "error", code: "planet_development_action_system_missing", message: "Planet Development Framework must reference the Canonical Action System.", records: [framework.actionSystemId] });
  }
  for (const stateItem of framework.knowledgeLifecycle) {
    for (const transition of stateItem.allowedTransitions) {
      if (!lifecycleIds.has(transition)) {
        issues.push({ severity: "error", code: "planet_development_bad_transition", message: "Knowledge lifecycle transition must resolve.", records: [stateItem.id, transition] });
      }
    }
  }
  const detected = framework.knowledgeLifecycle.find((item) => item.id === "detected");
  if (detected?.allowedTransitions.some((transition) => directIllegalTargets.has(transition))) {
    issues.push({ severity: "error", code: "planet_development_direct_detected_to_outcome", message: "Detected cannot transition directly to operational or preserved outcomes.", records: detected.allowedTransitions });
  }
  for (const rule of framework.visibilityMatrix) {
    if (!lifecycleIds.has(rule.stateId)) {
      issues.push({ severity: "error", code: "planet_development_visibility_state_missing", message: "Visibility state must resolve to lifecycle.", records: [rule.stateId] });
    }
    if (surveyHiddenStates.includes(rule.stateId) && (rule.canShowCsi || rule.canShowSvi || rule.canShowNickname || rule.canShowRecommendations || rule.canShowOpportunityScores || rule.canShowValidDevelopmentActions)) {
      issues.push({ severity: "error", code: "planet_development_presurvey_leak", message: "CSI/SVI/nickname/recommendations/actions must be hidden before survey completion.", records: [rule.stateId] });
    }
  }
  for (const reference of framework.actionReferences) {
    if (!actionIds.has(reference.actionId)) {
      issues.push({ severity: "error", code: "planet_development_action_missing", message: "Planet Development action reference must resolve to the Canonical Action System.", records: [reference.actionId] });
    }
  }
  for (const archetype of framework.opportunityArchetypes) {
    for (const actionId of archetype.recommendedActionIds) {
      if (!actionIds.has(actionId)) {
        issues.push({ severity: "error", code: "planet_development_archetype_action_missing", message: "Archetype action references must resolve.", records: [archetype.id, actionId] });
      }
    }
  }
  for (const baseline of framework.bodyClassBaselines) {
    if (!opportunityProfileIds.has(baseline.opportunityProfileId)) {
      issues.push({ severity: "error", code: "planet_development_baseline_profile_missing", message: "Body class baseline must resolve to a Planet Opportunity Profile.", records: [baseline.id, baseline.opportunityProfileId] });
    }
  }
  for (const profile of framework.developmentProfiles) {
    if (!opportunityProfileIds.has(profile.sourceOpportunityProfileId)) {
      issues.push({ severity: "error", code: "planet_development_profile_source_missing", message: "Development profile must resolve to a Planet Opportunity Profile.", records: [profile.id, profile.sourceOpportunityProfileId] });
    }
    if (!csiBandIds.has(profile.csi.bandId) || !sviBandIds.has(profile.svi.bandId)) {
      issues.push({ severity: "error", code: "planet_development_band_missing", message: "CSI/SVI bands must resolve.", records: [profile.id, profile.csi.bandId, profile.svi.bandId] });
    }
    if (profile.csi.value < 0 || profile.csi.value > 100 || profile.svi.value < 0 || profile.svi.value > 100) {
      issues.push({ severity: "error", code: "planet_development_score_range", message: "CSI and SVI must be normalized 0-100.", records: [profile.id] });
    }
    if (!archetypeIds.has(profile.opportunityArchetypeId)) {
      issues.push({ severity: "error", code: "planet_development_archetype_missing", message: "Development profile archetype must resolve.", records: [profile.id, profile.opportunityArchetypeId] });
    }
    for (const actionId of profile.validActionIds) {
      if (!actionIds.has(actionId)) {
        issues.push({ severity: "error", code: "planet_development_valid_action_missing", message: "Valid action IDs must resolve.", records: [profile.id, actionId] });
      }
    }
    for (const blocked of profile.blockedActionReasons) {
      if (!blocked.reasonCode) {
        issues.push({ severity: "error", code: "planet_development_block_reason_missing", message: "Blocked actions must include reason codes.", records: [profile.id, blocked.actionId] });
      }
    }
    if (/gas_giant|ice_giant|asteroid_belt/.test(profile.id) && profile.capabilities.surfaceColonization !== "prohibited") {
      issues.push({ severity: "error", code: "planet_development_no_surface_colony", message: "No-solid-surface bodies must prohibit surface colonization.", records: [profile.id] });
    }
  }
  const serialized = JSON.stringify(framework);
  if (/activePlayerProject|startedAt|completedAt|queueContents|playerBalances|playerIdentity|\/Users\//i.test(serialized)) {
    issues.push({ severity: "error", code: "planet_development_player_state_leak", message: "Planet Development Framework must not export active player project state or private paths.", records: [framework.id] });
  }
  return issues;
}
