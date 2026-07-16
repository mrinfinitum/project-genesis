import { canonicalActionSystem } from "@/lib/actions/action-system";
import { canonicalBuildingLibrary } from "@/lib/buildings/taxonomy";
import { civilizationProgressionFramework } from "@/lib/civilization/progression-framework";
import { planetDevelopmentFramework } from "@/lib/planets/development-framework";
import { ResourceService } from "@/lib/resources/service";
import type {
  CivilizationIdentityInfluenceProfile,
  ColonyCapabilityDefinition,
  ColonyCapabilityId,
  ColonyDevelopmentStage,
  ColonyDevelopmentStageId,
  ColonyFailurePolicy,
  ColonyFocusDefinition,
  ColonyFocusId,
  ColonyInitialStateTemplate,
  ColonyMaintenanceDefinition,
  ColonyOutcomeId,
  ColonyPopulationRequirementDefinition,
  ColonyPresentationContract,
  ColonyProjectPhaseDefinition,
  ColonyProjectPhaseId,
  ColonyResourcePackageDefinition,
  ColonyResourcePackageId,
  ColonyStarterSetDefinition,
  ColonyTransportRequirementDefinition,
  ColonyTypeDefinition,
  ColonyTypeId,
  ColonizationEligibilityDefinition,
  ColonizationFrameworkContract,
  ColonizationMissingCanonicalDefinition,
  ColonizationReasonCodeDefinition,
  ColonizationReasonCodeId,
  ColonizationRequirementReference,
  ImportIssue
} from "@/types/runtime";

const calculationVersion = "colonization-settlement-v1";

const actionIds = ["prepare_colony", "establish_colony", "transfer_resources", "construct_building", "upgrade_building", "travel_to_destination"] as const;
const standardSurfaceBodyClasses = ["Earth-like", "Ocean", "Forest", "Desert", "Frozen", "Volcanic", "Rocky", "Artificial", "Exotic", "Barren", "Dead", "Crystal", "Toxic", "Radioactive", "Inferno", "Ocean Moon", "Frozen Moon"];
const noSolidSurfaceBodyClasses = ["Gas Giant", "Ice Giant", "Asteroid Belt"];
const allBodyClasses = [...standardSurfaceBodyClasses, ...noSolidSurfaceBodyClasses];

function resource(name: string) {
  const id = ResourceService.resolveId(name);
  if (!id) throw new Error(`Missing canonical resource for ${name}.`);
  return id;
}

const resources = {
  water: resource("Fresh Water"),
  ice: resource("Water Ice"),
  iron: resource("Iron"),
  copper: resource("Copper"),
  titanium: resource("Titanium"),
  silicon: resource("Silicon"),
  solarEnergy: resource("Solar Energy"),
  organics: resource("Organic Compounds"),
  surveyData: resource("Survey Data"),
  rareMetals: resource("Rare Metals"),
  hydrogen: resource("Hydrogen"),
  helium: resource("Helium"),
  helium3: resource("Helium-3"),
  fusionFuel: resource("Fusion Fuel"),
  carbon: resource("Carbon")
};

function findBuilding(label: string, predicates: Array<(text: string) => boolean>) {
  const match = canonicalBuildingLibrary.find((building) => {
    const text = `${building.id} ${building.displayName} ${building.familyId} ${building.subcategoryId} ${building.tags.join(" ")}`.toLowerCase();
    return predicates.every((predicate) => predicate(text));
  });
  return match?.id ?? null;
}

const buildingByRole = {
  habitation: findBuilding("habitation", [(text) => text.includes("habitat") || text.includes("housing")]),
  lifeSupport: findBuilding("life support", [(text) => text.includes("life-support") || text.includes("breathing")]),
  power: findBuilding("power", [(text) => text.includes("power") || text.includes("solar")]),
  storage: findBuilding("storage", [(text) => text.includes("storage") || text.includes("warehouse") || text.includes("depot")]),
  communications: findBuilding("communications", [(text) => text.includes("communication") || text.includes("broadcast") || text.includes("signal")]),
  foodWater: findBuilding("food/water", [(text) => text.includes("farm") || text.includes("hydroponics") || text.includes("food")]),
  administration: findBuilding("administration", [(text) => text.includes("administration") || text.includes("town-hall")]),
  mining: findBuilding("mining", [(text) => text.includes("mine") || text.includes("quarry")]),
  processing: findBuilding("processing", [(text) => text.includes("refinery") || text.includes("factory")]),
  laboratory: findBuilding("laboratory", [(text) => text.includes("lab") || text.includes("research")]),
  docking: findBuilding("docking", [(text) => text.includes("dock") || text.includes("spaceport")]),
  medical: findBuilding("medical", [(text) => text.includes("medical") || text.includes("clinic")]),
  security: findBuilding("security", [(text) => text.includes("security") || text.includes("defense")]),
  automation: findBuilding("automation", [(text) => text.includes("automation") || text.includes("robotics")]),
  terraforming: findBuilding("terraforming", [(text) => text.includes("terraform") || text.includes("atmospheric")]),
  preserve: findBuilding("preserve", [(text) => text.includes("preserve") || text.includes("ecology") || text.includes("wildlife")]),
  trade: findBuilding("trade", [(text) => text.includes("trade") || text.includes("market") || text.includes("commerce")]),
  logistics: findBuilding("logistics", [(text) => text.includes("logistics") || text.includes("supply") || text.includes("depot")])
} as const;

function influence(alignmentIds: CivilizationIdentityInfluenceProfile["alignmentIds"], influenceTrigger: CivilizationIdentityInfluenceProfile["influenceTrigger"] = "operational_completion", influenceAmount = 3): CivilizationIdentityInfluenceProfile {
  return {
    alignmentIds,
    influenceTrigger,
    influenceAmount,
    notes: "Influence applies only when the referenced phase or operational completion is server-confirmed by the Game. Premium acceleration never changes influence amount."
  };
}

function requirement(type: ColonizationRequirementReference["type"], id: string, reasonCode: string, notes: string, quantity: number | null = null, required = true): ColonizationRequirementReference {
  return { type, id, quantity, required, reasonCode, notes };
}

function starterRole(role: string, buildingId: string | null, required = true, notes = "References the canonical Building Library when available.") {
  return { role, buildingId, required, notes };
}

const starterRoleSets: Record<string, ReturnType<typeof starterRole>[]> = {
  general: [
    starterRole("habitation", buildingByRole.habitation),
    starterRole("life_support", buildingByRole.lifeSupport),
    starterRole("power", buildingByRole.power),
    starterRole("storage", buildingByRole.storage),
    starterRole("communications", buildingByRole.communications),
    starterRole("food_water", buildingByRole.foodWater),
    starterRole("administration", buildingByRole.administration)
  ],
  mining: [
    starterRole("automated_mine", buildingByRole.mining),
    starterRole("processing", buildingByRole.processing),
    starterRole("storage", buildingByRole.storage),
    starterRole("power", buildingByRole.power),
    starterRole("logistics", buildingByRole.logistics),
    starterRole("habitation_or_robotic_control", buildingByRole.automation ?? buildingByRole.habitation)
  ],
  research: [
    starterRole("laboratory", buildingByRole.laboratory),
    starterRole("communications", buildingByRole.communications),
    starterRole("power", buildingByRole.power),
    starterRole("habitation", buildingByRole.habitation),
    starterRole("data_storage", buildingByRole.storage)
  ],
  orbital: [
    starterRole("orbital_habitat", buildingByRole.habitation),
    starterRole("docking", buildingByRole.docking),
    starterRole("life_support", buildingByRole.lifeSupport),
    starterRole("power", buildingByRole.power),
    starterRole("storage", buildingByRole.storage),
    starterRole("communications", buildingByRole.communications)
  ],
  preserve: [
    starterRole("preservation_station", buildingByRole.preserve),
    starterRole("laboratory", buildingByRole.laboratory),
    starterRole("communications", buildingByRole.communications),
    starterRole("life_support", buildingByRole.lifeSupport),
    starterRole("power", buildingByRole.power)
  ],
  trade: [
    starterRole("trade_port", buildingByRole.trade),
    starterRole("logistics", buildingByRole.logistics),
    starterRole("storage", buildingByRole.storage),
    starterRole("communications", buildingByRole.communications),
    starterRole("habitation", buildingByRole.habitation)
  ],
  automated: [
    starterRole("robotic_control", buildingByRole.automation),
    starterRole("power", buildingByRole.power),
    starterRole("storage", buildingByRole.storage),
    starterRole("communications", buildingByRole.communications),
    starterRole("maintenance_bay", buildingByRole.logistics)
  ]
};

function buildingIdsFor(setId: keyof typeof starterRoleSets) {
  return starterRoleSets[setId].map((item) => item.buildingId).filter((id): id is string => Boolean(id));
}

function colonyType(input: {
  id: ColonyTypeId;
  displayName: string;
  description: string;
  supportedBodyClasses?: string[];
  prohibitedBodyClasses?: string[];
  capabilities: ColonyCapabilityId[];
  technologies: string[];
  starterSet: keyof typeof starterRoleSets;
  resources: string[];
  population: number;
  workforce: number;
  logistics: number;
  focus: ColonyFocusId;
  identity: CivilizationIdentityInfluenceProfile;
  progressionStage: string;
  milestoneIds?: string[];
  actions?: string[];
  status?: ColonyTypeDefinition["publicationStatus"];
}): ColonyTypeDefinition {
  const progressionRequirements = [
    requirement("progression_stage", input.progressionStage, "progression_stage_locked", `Requires civilization progression stage ${input.progressionStage}.`),
    ...input.milestoneIds?.map((id) => requirement("progression_milestone", id, "progression_stage_locked", `Contributes to or depends on milestone ${id}.`, null, false)) ?? []
  ];
  return {
    id: input.id,
    displayName: input.displayName,
    description: input.description,
    supportedBodyClasses: input.supportedBodyClasses ?? standardSurfaceBodyClasses,
    prohibitedBodyClasses: input.prohibitedBodyClasses ?? noSolidSurfaceBodyClasses,
    requiredCapabilityStates: input.capabilities,
    requiredTechnologies: input.technologies,
    requiredBuildings: buildingIdsFor(input.starterSet),
    requiredResources: input.resources,
    requiredPopulation: input.population,
    requiredWorkforce: input.workforce,
    requiredLogistics: input.logistics,
    phaseTemplateId: "colonization_project_standard",
    defaultDevelopmentFocus: input.focus,
    civilizationIdentityInfluence: input.identity,
    progressionRequirements,
    allowedActionIds: input.actions ?? [...actionIds],
    publicationStatus: input.status ?? "approved"
  };
}

export const colonizationEligibilityDefinitions: ColonizationEligibilityDefinition[] = [
  { id: "unavailable", displayName: "Unavailable", order: 1, canStartProject: false, blocksActionStart: true, description: "The body or requested colony type cannot currently be evaluated as a project target." },
  { id: "currently_locked", displayName: "Currently Locked", order: 2, canStartProject: false, blocksActionStart: true, description: "The concept is valid, but technology, stage, logistics, or population gates are unmet." },
  { id: "technically_possible", displayName: "Technically Possible", order: 3, canStartProject: true, blocksActionStart: false, description: "A project can begin if the player accepts risk, cost, and duration." },
  { id: "supported", displayName: "Supported", order: 4, canStartProject: true, blocksActionStart: false, description: "The target and civilization state support this colony type." },
  { id: "recommended", displayName: "Recommended", order: 5, canStartProject: true, blocksActionStart: false, description: "The target profile strongly matches this colony type." },
  { id: "restricted", displayName: "Restricted", order: 6, canStartProject: false, blocksActionStart: true, description: "Policy, preservation, hazard, or quarantine rules restrict this project." },
  { id: "prohibited", displayName: "Prohibited", order: 7, canStartProject: false, blocksActionStart: true, description: "The project is not legal or physically viable for this body and colony type." }
];

export const colonizationReasonCodes: ColonizationReasonCodeDefinition[] = [
  { id: "no_solid_surface", displayName: "No Solid Surface", severity: "blocker", description: "Surface colony types cannot be placed on no-solid-surface bodies.", recommendedResolution: "Choose orbital, floating, automated, fuel depot, or harvest-oriented options." },
  { id: "insufficient_technology", displayName: "Insufficient Technology", severity: "blocker", description: "Required research, travel, habitation, or life support technology is missing.", recommendedResolution: "Complete the relevant research or unlock progression stage." },
  { id: "insufficient_population", displayName: "Insufficient Population", severity: "blocker", description: "Available founding population or specialists are below requirement.", recommendedResolution: "Increase population capacity or choose automated options." },
  { id: "insufficient_logistics", displayName: "Insufficient Logistics", severity: "blocker", description: "Transport, range, cargo, supply, or route capacity is insufficient.", recommendedResolution: "Build logistics infrastructure, ships, or routes." },
  { id: "protected_ecology", displayName: "Protected Ecology", severity: "blocker", description: "Ecological policy or preservation status prevents settlement.", recommendedResolution: "Choose preservation, research, catalog, or policy review actions." },
  { id: "precursor_quarantine", displayName: "Precursor Quarantine", severity: "blocker", description: "Ancient, alien, or story quarantine blocks settlement.", recommendedResolution: "Resolve archaeology/story requirements before settlement." },
  { id: "extreme_hazard", displayName: "Extreme Hazard", severity: "blocker", description: "Hazard rating exceeds support technology.", recommendedResolution: "Upgrade shielding, life support, or select robotic/orbital alternatives." },
  { id: "no_habitation_support", displayName: "No Habitation Support", severity: "blocker", description: "Life support and habitat prerequisites are missing.", recommendedResolution: "Allocate life support modules and habitat starter set." },
  { id: "missing_colony_ship", displayName: "Missing Colony Ship", severity: "blocker", description: "Required transport class is not available.", recommendedResolution: "Create or unlock the canonical transport definition." },
  { id: "missing_resource_allocation", displayName: "Missing Resource Allocation", severity: "blocker", description: "The selected resource package is incomplete.", recommendedResolution: "Allocate the required package before project start." },
  { id: "progression_stage_locked", displayName: "Progression Stage Locked", severity: "blocker", description: "Civilization progression stage is too early.", recommendedResolution: "Complete required actions, milestones, research, and infrastructure." }
];

const colonyCapabilityRows: Array<[ColonyCapabilityId, string, string, string[]]> = [
  ["habitation", "Habitation", "Keeps population physically present and safe.", ["population", "housing", "morale"]],
  ["extraction", "Extraction", "Extracts raw resources from surfaces, belts, atmospheres, or subsurface deposits.", ["economy", "resource_output", "logistics"]],
  ["processing", "Processing", "Turns raw inputs into useful intermediate products.", ["economy", "production_chains"]],
  ["manufacturing", "Manufacturing", "Supports fabrication and build throughput.", ["buildings", "upgrades", "missions"]],
  ["research", "Research", "Supports scientific output and discovery analysis.", ["research", "discovery", "planet_development"]],
  ["trade", "Trade", "Connects markets, commerce, and route value.", ["markets", "trade_routes"]],
  ["storage", "Storage", "Holds allocated packages and local outputs.", ["inventory", "logistics"]],
  ["ship_support", "Ship Support", "Provides docking, fuel, repair, and transit services.", ["travel", "logistics"]],
  ["population_growth", "Population Growth", "Allows citizens/workforce capacity to mature.", ["population", "civilization_progression"]],
  ["terraforming", "Terraforming", "Supports long-term environmental transformation.", ["planet_development", "research"]],
  ["preservation", "Preservation", "Protects living worlds or restricted ecology.", ["identity", "planet_development"]],
  ["defense_security", "Defense / Security", "Provides safety, resilience, and future conflict hooks.", ["events", "missions"]],
  ["tourism", "Tourism", "Creates visitor, morale, culture, and trade value.", ["economy", "identity"]],
  ["automation", "Automation", "Substitutes robotic/AI work for population-heavy operations.", ["ai_agents", "economy"]],
  ["diplomacy", "Diplomacy", "Supports faction, civilization, and policy interactions.", ["factions", "identity"]],
  ["education", "Education", "Improves specialist and workforce maturity.", ["population", "research"]],
  ["healthcare", "Healthcare", "Protects population and stabilizes long-term growth.", ["population", "maintenance"]]
];

export const colonyCapabilityDefinitions: ColonyCapabilityDefinition[] = colonyCapabilityRows.map(([id, displayName, description, inputsToFutureSystems]) => ({ id, displayName, description, inputsToFutureSystems }));

export const colonyTypeDefinitions: ColonyTypeDefinition[] = [
  colonyType({ id: "primary_colony", displayName: "Primary Colony", description: "A full civilization anchor on a high-suitability world.", capabilities: ["habitation", "population_growth", "storage", "trade", "education", "healthcare"], technologies: ["colonization", "life_support"], starterSet: "general", resources: [resources.water, resources.iron, resources.copper, resources.silicon, resources.organics, resources.solarEnergy], population: 5000, workforce: 1200, logistics: 80, focus: "balanced", identity: influence(["Industry", "Technology"], "operational_completion", 5), progressionStage: "planetary", milestoneIds: ["first_colony"] }),
  colonyType({ id: "secondary_colony", displayName: "Secondary Colony", description: "A smaller durable settlement connected to an existing civilization network.", capabilities: ["habitation", "storage", "trade"], technologies: ["colonization"], starterSet: "general", resources: [resources.water, resources.iron, resources.copper, resources.organics], population: 1200, workforce: 350, logistics: 55, focus: "balanced", identity: influence(["Industry"], "operational_completion", 3), progressionStage: "planetary" }),
  colonyType({ id: "frontier_colony", displayName: "Frontier Colony", description: "A rugged settlement for viable but imperfect worlds.", capabilities: ["habitation", "storage", "ship_support"], technologies: ["frontier_habitation", "colonization"], starterSet: "general", resources: [resources.water, resources.iron, resources.titanium, resources.solarEnergy], population: 800, workforce: 300, logistics: 60, focus: "population_growth", identity: influence(["Industry", "Nature"], "operational_completion", 3), progressionStage: "planetary", milestoneIds: ["first_colony"] }),
  colonyType({ id: "mining_colony", displayName: "Mining Colony", description: "A settlement optimized for extraction and processing.", capabilities: ["extraction", "processing", "storage", "ship_support"], technologies: ["automated_extraction", "colonization"], starterSet: "mining", resources: [resources.iron, resources.copper, resources.titanium, resources.solarEnergy], population: 400, workforce: 240, logistics: 65, focus: "mining", identity: influence(["Industry"], "operational_completion", 4), progressionStage: "planetary", milestoneIds: ["first_specialized_colony"] }),
  colonyType({ id: "research_colony", displayName: "Research Colony", description: "A settlement dedicated to science, anomalies, and planetary study.", capabilities: ["research", "storage", "education"], technologies: ["planet_survey", "research_station"], starterSet: "research", resources: [resources.surveyData, resources.silicon, resources.copper, resources.solarEnergy], population: 300, workforce: 120, logistics: 55, focus: "research", identity: influence(["Technology"], "operational_completion", 4), progressionStage: "planetary", milestoneIds: ["first_specialized_colony"] }),
  colonyType({ id: "agricultural_colony", displayName: "Agricultural Colony", description: "A settlement focused on food, water, ecology, and population support.", capabilities: ["habitation", "population_growth", "preservation"], technologies: ["agriculture", "colonization"], starterSet: "general", resources: [resources.water, resources.organics, resources.carbon, resources.solarEnergy], population: 900, workforce: 280, logistics: 45, focus: "agriculture", identity: influence(["Nature", "Industry"], "operational_completion", 4), progressionStage: "planetary", milestoneIds: ["first_specialized_colony"] }),
  colonyType({ id: "industrial_colony", displayName: "Industrial Colony", description: "A settlement for manufacturing, refining, and infrastructure output.", capabilities: ["manufacturing", "processing", "extraction", "storage"], technologies: ["industrial_workforce", "colonization"], starterSet: "mining", resources: [resources.iron, resources.copper, resources.titanium, resources.silicon, resources.rareMetals], population: 1500, workforce: 700, logistics: 85, focus: "industry", identity: influence(["Industry", "Corporate"], "operational_completion", 5), progressionStage: "interplanetary", milestoneIds: ["first_specialized_colony"] }),
  colonyType({ id: "trade_colony", displayName: "Trade Colony", description: "A settlement at strategic logistics and market crossroads.", capabilities: ["trade", "storage", "ship_support", "diplomacy"], technologies: ["trade_networks", "colonization"], starterSet: "trade", resources: [resources.water, resources.copper, resources.silicon, resources.surveyData], population: 700, workforce: 220, logistics: 90, focus: "trade", identity: influence(["Corporate"], "operational_completion", 4), progressionStage: "interplanetary", milestoneIds: ["first_trade_route"] }),
  colonyType({ id: "logistics_hub", displayName: "Logistics Hub", description: "A support settlement for routes, supplies, ships, and expansion.", capabilities: ["storage", "ship_support", "trade"], technologies: ["logistics_networks"], starterSet: "trade", resources: [resources.iron, resources.copper, resources.titanium, resources.fusionFuel], population: 250, workforce: 150, logistics: 100, focus: "logistics", identity: influence(["Corporate", "Industry"], "operational_completion", 3), progressionStage: "interplanetary" }),
  colonyType({ id: "orbital_colony", displayName: "Orbital Colony", description: "A colony in orbit rather than on a surface.", supportedBodyClasses: allBodyClasses, prohibitedBodyClasses: [], capabilities: ["habitation", "ship_support", "storage", "trade"], technologies: ["orbital_habitation", "space_construction"], starterSet: "orbital", resources: [resources.iron, resources.titanium, resources.silicon, resources.fusionFuel, resources.helium3], population: 1000, workforce: 450, logistics: 95, focus: "orbital_infrastructure", identity: influence(["Technology", "Industry"], "operational_completion", 5), progressionStage: "interplanetary", milestoneIds: ["first_orbital_colony"] }),
  colonyType({ id: "floating_colony", displayName: "Floating Colony", description: "A platform colony for atmospheres, oceans, and gas-giant layers.", supportedBodyClasses: ["Ocean", "Gas Giant", "Ice Giant", "Toxic", "Radioactive", "Exotic"], prohibitedBodyClasses: ["Asteroid Belt"], capabilities: ["habitation", "extraction", "research"], technologies: ["floating_habitats", "atmospheric_platforms"], starterSet: "orbital", resources: [resources.titanium, resources.silicon, resources.hydrogen, resources.helium], population: 600, workforce: 260, logistics: 90, focus: "energy", identity: influence(["Technology", "Nature"], "operational_completion", 4), progressionStage: "interplanetary", milestoneIds: ["first_specialized_colony"] }),
  colonyType({ id: "subsurface_colony", displayName: "Subsurface Colony", description: "A protected settlement below hazardous or frozen surfaces.", supportedBodyClasses: ["Frozen", "Volcanic", "Rocky", "Barren", "Dead", "Toxic", "Radioactive", "Inferno", "Frozen Moon"], capabilities: ["habitation", "extraction", "storage", "defense_security"], technologies: ["subsurface_habitation", "environmental_shielding"], starterSet: "general", resources: [resources.iron, resources.titanium, resources.water, resources.solarEnergy], population: 500, workforce: 220, logistics: 70, focus: "balanced", identity: influence(["Industry", "Technology"], "operational_completion", 3), progressionStage: "planetary" }),
  colonyType({ id: "fuel_depot", displayName: "Fuel Depot", description: "A ship support and refueling node near volatile or route-rich bodies.", supportedBodyClasses: allBodyClasses, prohibitedBodyClasses: [], capabilities: ["ship_support", "storage", "trade"], technologies: ["fuel_processing", "logistics_networks"], starterSet: "trade", resources: [resources.hydrogen, resources.helium, resources.helium3, resources.fusionFuel], population: 80, workforce: 50, logistics: 80, focus: "energy", identity: influence(["Corporate", "Industry"], "operational_completion", 3), progressionStage: "interplanetary" }),
  colonyType({ id: "archaeological_outpost", displayName: "Archaeological Outpost", description: "A small protected field station around ruins, artifacts, or precursor sites.", capabilities: ["research", "preservation", "storage"], technologies: ["archaeology", "planet_survey"], starterSet: "research", resources: [resources.surveyData, resources.silicon, resources.water, resources.solarEnergy], population: 90, workforce: 45, logistics: 45, focus: "archaeology", identity: influence(["Technology", "Nature"], "operational_completion", 3), progressionStage: "planetary", milestoneIds: ["first_specialized_colony"] }),
  colonyType({ id: "preservation_station", displayName: "Preservation Station", description: "A non-extractive station that protects ecology, anomalies, or living worlds.", supportedBodyClasses: allBodyClasses, prohibitedBodyClasses: [], capabilities: ["preservation", "research", "tourism"], technologies: ["preservation_protocols", "planet_survey"], starterSet: "preserve", resources: [resources.surveyData, resources.water, resources.organics, resources.solarEnergy], population: 120, workforce: 60, logistics: 50, focus: "preservation", identity: influence(["Nature", "Technology"], "operational_completion", 4), progressionStage: "planetary" }),
  colonyType({ id: "terraforming_base", displayName: "Terraforming Base", description: "A long-duration settlement that supports staged terraforming work.", supportedBodyClasses: standardSurfaceBodyClasses.filter((bodyClass) => !["Earth-like", "Forest"].includes(bodyClass)), prohibitedBodyClasses: noSolidSurfaceBodyClasses, capabilities: ["terraforming", "research", "habitation", "storage"], technologies: ["terraforming_study", "environmental_engineering"], starterSet: "general", resources: [resources.water, resources.ice, resources.carbon, resources.titanium, resources.solarEnergy], population: 500, workforce: 260, logistics: 85, focus: "terraforming", identity: influence(["Nature", "Technology", "Industry"], "operational_completion", 5), progressionStage: "interplanetary", milestoneIds: ["first_terraforming_project"] }),
  colonyType({ id: "automated_outpost", displayName: "Automated Outpost", description: "A low-population robotic settlement for hazardous or distant targets.", supportedBodyClasses: allBodyClasses, prohibitedBodyClasses: [], capabilities: ["automation", "extraction", "storage", "research"], technologies: ["robotics", "ai_automation"], starterSet: "automated", resources: [resources.silicon, resources.copper, resources.titanium, resources.solarEnergy], population: 0, workforce: 20, logistics: 60, focus: "automation", identity: influence(["Cyber", "Industry"], "operational_completion", 4), progressionStage: "interplanetary", milestoneIds: ["first_specialized_colony"], actions: ["prepare_colony", "establish_colony", "transfer_resources", "construct_building", "travel_to_destination"] })
];

export const colonizationResolverContract: ColonizationFrameworkContract["resolverContract"] = {
  id: "resolveColonizationEligibility",
  deterministic: true,
  inputFields: ["celestialBody", "planetOpportunityProfile", "colonyType", "civilizationProgression", "civilizationIdentity", "research", "buildings", "resources", "logistics", "population", "preservationRules"],
  returnFields: ["eligibilityState", "validColonyTypes", "blockers", "warnings", "requirements", "recommendedColonyTypes", "projectedDuration", "projectedResourceDemand"],
  evaluationOrder: ["body_class", "opportunity_profile", "preservation_policy", "technology", "progression", "population", "logistics", "resources", "starter_buildings", "identity_modifiers", "recommendation_score"],
  notes: "Pure deterministic resolver contract. The Game supplies player state and executes Actions; Studio publishes rules and stable reason codes only."
};

const colonyProjectPhaseRows: Array<[ColonyProjectPhaseId, string, number, string, string, string[], string[], string[], string[], number, string[], string, string[], string]> = [
  ["planning", "Planning", 1, "planning", "duration_project", ["progression_stage"], [], [], [], 0, [], "unspent_inputs_refunded", ["project_scope_locked"], "Planning"],
  ["site_selection", "Site Selection", 2, "survey", "duration_project", ["survey_complete"], ["survey_data"], [], ["survey_team"], 5, ["target_invalid"], "unspent_inputs_refunded", ["site_selected"], "Site"],
  ["resource_allocation", "Resource Allocation", 3, "allocation", "duration_project", ["resource_package_selected"], ["structural_materials", "energy", "water", "life_support"], [], [], 20, ["insufficient_resources"], "unspent_inputs_refunded", ["resources_reserved"], "Resources"],
  ["population_assignment", "Population Assignment", 4, "allocation", "duration_project", ["population_available"], [], ["founding_population"], ["assigned_workforce"], 10, ["requirements_changed"], "full_if_not_started_partial_if_started", ["population_manifest_locked"], "Population"],
  ["transport_preparation", "Transport Preparation", 5, "transport", "duration_project", ["transport_available"], ["fuel", "cargo"], ["colonists"], ["crew"], 30, ["insufficient_logistics"], "unspent_inputs_refunded", ["transport_manifest_ready"], "Transport Prep"],
  ["transit", "Transit", 6, "travel", "duration_colony", ["route_available"], ["fuel"], ["colonists"], ["crew"], 45, ["environmental_failure", "target_invalid"], "partial", ["transport_arrived"], "Transit"],
  ["landing_or_orbital_insertion", "Landing / Orbital Insertion", 7, "travel", "duration_project", ["target_access"], ["fuel"], ["colonists"], ["crew"], 35, ["environmental_failure"], "partial", ["landing_zone_confirmed"], "Insertion"],
  ["site_preparation", "Site Preparation", 8, "preparation", "duration_project", ["site_selected"], ["construction_materials"], [], ["workforce"], 30, ["environmental_failure"], "unspent_inputs_refunded", ["site_prepared"], "Site Prep"],
  ["initial_habitat_construction", "Initial Habitat Construction", 9, "construction", "duration_colony", ["starter_set_available"], ["structural_materials", "machinery"], [], ["engineers"], 40, ["environmental_failure", "insufficient_resources"], "partial", ["initial_habitats_online"], "Habitat"],
  ["life_support_activation", "Life Support Activation", 10, "commissioning", "duration_project", ["life_support_modules"], ["water", "energy"], ["colonists"], ["engineers"], 35, ["environmental_failure"], "partial", ["life_support_online"], "Life Support"],
  ["infrastructure_commissioning", "Infrastructure Commissioning", 11, "commissioning", "duration_project", ["starter_buildings_online"], ["energy", "communications"], [], ["engineers"], 30, ["requirements_changed"], "retain_if_resumable", ["infrastructure_commissioned"], "Commission"],
  ["operational", "Operational", 12, "completion", "duration_colony", ["final_server_verification"], [], [], [], 0, [], "none", ["initial_colony_template_created", "timeline_event_requested", "milestone_check_requested"], "Operational"]
];

export const colonyProjectPhaseDefinitions: ColonyProjectPhaseDefinition[] = colonyProjectPhaseRows.map(([id, displayName, order, canonicalActionPhaseId, durationDefinitionId, requirementIds, resourceInputRoles, populationInputRoles, workforceInputRoles, logisticsCapacityRequired, failureConditionIds, cancellationPolicy, completionEffects, presentationLabel]) => ({
  id,
  displayName,
  order,
  canonicalActionPhaseId,
  durationDefinitionId,
  requirementIds,
  resourceInputRoles,
  populationInputRoles,
  workforceInputRoles,
  logisticsCapacityRequired,
  failureConditionIds,
  cancellationPolicy,
  completionEffects,
  presentationLabel
}));

const colonyTransportRequirementRows: Array<[string, string, ColonyTypeId[], string | null, string | null, string | null, ColonyTransportRequirementDefinition["status"], string]> = [
  ["colony_ship", "Colony Ship", ["primary_colony", "secondary_colony", "frontier_colony", "orbital_colony", "floating_colony", "subsurface_colony", "terraforming_base"], null, null, null, "missing_canonical_definition", "Transport System must define colony ship class before Game can instantiate this requirement."],
  ["cargo_ship", "Cargo Ship", colonyTypeDefinitions.map((type) => type.id), null, null, null, "missing_canonical_definition", "Cargo transport is a future canonical Transport System definition."],
  ["orbital_tug", "Orbital Tug", ["orbital_colony", "fuel_depot", "logistics_hub"], null, buildingByRole.docking, null, "resolved", "Resolved through orbital dock infrastructure until a Transport System exists."],
  ["atmospheric_transport", "Atmospheric Transport", ["floating_colony", "primary_colony", "secondary_colony", "frontier_colony"], null, null, null, "missing_canonical_definition", "Atmospheric transport class is not yet canonical."],
  ["automated_construction_fleet", "Automated Construction Fleet", ["automated_outpost", "mining_colony", "industrial_colony"], null, buildingByRole.automation, null, "resolved", "Automation building references robotic construction support."],
  ["survey_vessel", "Survey Vessel", ["research_colony", "archaeological_outpost", "preservation_station"], null, null, resources.surveyData, "resolved", "Uses Survey Data as canonical input until ship classes are formalized."],
  ["life_support_modules", "Life-Support Modules", colonyTypeDefinitions.map((type) => type.id).filter((id) => id !== "automated_outpost"), null, buildingByRole.lifeSupport, resources.water, "resolved", "Resolved by Life Support building references and water allocation."],
  ["habitat_modules", "Habitat Modules", colonyTypeDefinitions.map((type) => type.id).filter((id) => id !== "automated_outpost"), null, buildingByRole.habitation, resources.titanium, "resolved", "Resolved by habitat building references and structural material allocation."],
  ["food_reserves", "Food Reserves", colonyTypeDefinitions.map((type) => type.id).filter((id) => id !== "automated_outpost"), null, buildingByRole.foodWater, resources.organics, "resolved", "Organic Compounds represent food/biological reserves until Food is a dedicated economy/resource."],
  ["water_reserves", "Water Reserves", colonyTypeDefinitions.map((type) => type.id), null, null, resources.water, "resolved", "Fresh Water is the canonical water resource."],
  ["construction_materials", "Construction Materials", colonyTypeDefinitions.map((type) => type.id), null, buildingByRole.storage, resources.iron, "resolved", "Iron is the minimum structural material; packages add titanium/copper/silicon."],
  ["energy_systems", "Energy Systems", colonyTypeDefinitions.map((type) => type.id), null, buildingByRole.power, resources.solarEnergy, "resolved", "Solar Energy is the canonical baseline energy input."],
  ["medical_systems", "Medical Systems", colonyTypeDefinitions.map((type) => type.id).filter((id) => id !== "automated_outpost"), null, buildingByRole.medical, resources.organics, "resolved", "Medical infrastructure resolves to Health & Medicine building references."]
];

export const colonyTransportRequirementDefinitions: ColonyTransportRequirementDefinition[] = colonyTransportRequirementRows.map(([id, displayName, requiredForColonyTypeIds, canonicalAssetKey, canonicalBuildingId, canonicalResourceId, status, notes]) => ({
  id,
  displayName,
  requiredForColonyTypeIds,
  canonicalAssetKey,
  canonicalBuildingId,
  canonicalResourceId,
  status,
  notes
}));

function packageDefinition(id: ColonyResourcePackageId, displayName: string, multiplier: number, recommendedForColonyTypeIds: ColonyTypeId[], extraInputs: ColonyResourcePackageDefinition["resourceInputs"] = []): ColonyResourcePackageDefinition {
  const baseInputs = [
    { role: "structural_materials", resourceId: resources.iron, quantity: 1000 * multiplier, required: true },
    { role: "energy_systems", resourceId: resources.solarEnergy, quantity: 500 * multiplier, required: true },
    { role: "food", resourceId: resources.organics, quantity: 300 * multiplier, required: true },
    { role: "water", resourceId: resources.water, quantity: 400 * multiplier, required: true },
    { role: "life_support", resourceId: resources.water, quantity: 250 * multiplier, required: true },
    { role: "machinery", resourceId: resources.copper, quantity: 250 * multiplier, required: true },
    { role: "storage", resourceId: resources.titanium, quantity: 150 * multiplier, required: true },
    { role: "communications", resourceId: resources.silicon, quantity: 120 * multiplier, required: true },
    { role: "medical_equipment", resourceId: resources.organics, quantity: 80 * multiplier, required: true }
  ];
  return {
    id,
    displayName,
    description: `${displayName} colonization allocation package.`,
    resourceInputs: [...baseInputs, ...extraInputs].map((input) => ({ ...input, quantity: Math.round(input.quantity) })),
    transportRequirementIds: colonyTransportRequirementDefinitions.filter((requirementItem) => requirementItem.requiredForColonyTypeIds.some((typeId) => recommendedForColonyTypeIds.includes(typeId))).map((requirementItem) => requirementItem.id),
    recommendedForColonyTypeIds,
    projectedDurationModifier: id === "accelerated" ? 0.75 : id === "minimum_viable" ? 1.25 : id === "automated" ? 1.05 : 1,
    notes: "Quantities are balancing contracts only. The Game owns live allocation, reservation, and transfer records."
  };
}

export const colonyResourcePackageDefinitions: ColonyResourcePackageDefinition[] = [
  packageDefinition("minimum_viable", "Minimum Viable Package", 0.65, ["frontier_colony", "automated_outpost", "fuel_depot"]),
  packageDefinition("standard", "Standard Package", 1, ["primary_colony", "secondary_colony", "research_colony", "trade_colony", "logistics_hub"]),
  packageDefinition("accelerated", "Accelerated Package", 1.45, ["primary_colony", "industrial_colony", "terraforming_base"], [
    { role: "advanced_machinery", resourceId: resources.titanium, quantity: 450, required: true },
    { role: "rare_metals", resourceId: resources.rareMetals, quantity: 120, required: true }
  ]),
  packageDefinition("specialized", "Specialized Package", 1.1, ["mining_colony", "agricultural_colony", "archaeological_outpost", "preservation_station", "floating_colony", "subsurface_colony"], [
    { role: "research_equipment", resourceId: resources.surveyData, quantity: 250, required: false },
    { role: "mining_equipment", resourceId: resources.titanium, quantity: 300, required: false },
    { role: "security_equipment", resourceId: resources.rareMetals, quantity: 80, required: false }
  ]),
  packageDefinition("automated", "Automated Package", 1.2, ["automated_outpost", "mining_colony", "fuel_depot"], [
    { role: "robotic_workforce", resourceId: resources.silicon, quantity: 700, required: true },
    { role: "population_transport", resourceId: resources.fusionFuel, quantity: 160, required: false }
  ])
];

export const colonyPopulationRequirementDefinitions: ColonyPopulationRequirementDefinition[] = colonyTypeDefinitions.map((type) => ({
  id: `${type.id}_population_requirements`,
  colonyTypeId: type.id,
  minimumFoundingPopulation: type.requiredPopulation,
  minimumAssignedWorkforce: type.requiredWorkforce,
  specialistsRequired: type.id.includes("research") ? ["scientists", "engineers"] : type.id.includes("mining") ? ["engineers", "logistics_staff"] : type.id.includes("preservation") ? ["scientists", "ecologists"] : ["engineers"],
  engineersRequired: Math.max(0, Math.ceil(type.requiredWorkforce * 0.08)),
  scientistsRequired: type.requiredCapabilityStates.includes("research") || type.requiredCapabilityStates.includes("preservation") ? Math.max(1, Math.ceil(type.requiredWorkforce * 0.08)) : 0,
  logisticsStaffRequired: Math.max(1, Math.ceil(type.requiredLogistics * 0.1)),
  automationSubstitutionPolicy: type.id === "automated_outpost" ? "Robotic workforce can replace founding population but not logistics verification." : "Automation can reduce assigned workforce after the required AI/research hooks resolve.",
  aiAgentSupport: type.defaultDevelopmentFocus === "automation" || type.requiredCapabilityStates.includes("automation"),
  roboticWorkforceSupport: type.id === "automated_outpost" || type.requiredCapabilityStates.includes("automation")
}));

export const colonyStarterSetDefinitions: ColonyStarterSetDefinition[] = colonyTypeDefinitions.map((type) => {
  const setKey = type.id === "mining_colony" || type.id === "industrial_colony" ? "mining"
    : type.id === "research_colony" || type.id === "archaeological_outpost" ? "research"
      : type.id === "orbital_colony" || type.id === "floating_colony" || type.id === "fuel_depot" ? "orbital"
        : type.id === "preservation_station" ? "preserve"
          : type.id === "trade_colony" || type.id === "logistics_hub" ? "trade"
            : type.id === "automated_outpost" ? "automated"
              : "general";
  const buildingRoles = starterRoleSets[setKey];
  return {
    id: `${type.id}_starter_set`,
    colonyTypeId: type.id,
    displayName: `${type.displayName} Starter Set`,
    buildingRoles,
    missingBuildingRoles: buildingRoles.filter((role) => !role.buildingId && role.required).map((role) => role.role)
  };
});

export const colonyInitialStateTemplates: ColonyInitialStateTemplate[] = colonyTypeDefinitions.map((type) => {
  const populationRequirement = colonyPopulationRequirementDefinitions.find((item) => item.colonyTypeId === type.id);
  return {
    id: `${type.id}_initial_state`,
    colonyTypeId: type.id,
    operationalStatus: "operational",
    foundingPopulation: populationRequirement?.minimumFoundingPopulation ?? type.requiredPopulation,
    populationCapacity: Math.max(type.requiredPopulation * 2, type.requiredPopulation + 250),
    assignedWorkforce: populationRequirement?.minimumAssignedWorkforce ?? type.requiredWorkforce,
    lifeSupportCapacity: type.id === "automated_outpost" ? 25 : Math.max(type.requiredPopulation * 1.2, 100),
    storageCapacity: type.requiredLogistics * 100,
    energyCapacity: Math.max(100, type.requiredLogistics * 12),
    foodWaterBalance: type.id === "agricultural_colony" ? "surplus" : "balanced",
    logisticsAccess: type.id === "orbital_colony" || type.id === "fuel_depot" || type.id === "logistics_hub" ? "orbital" : type.requiredLogistics >= 85 ? "interplanetary" : "local",
    firstBuildingSetId: `${type.id}_starter_set`,
    settlementFocus: type.defaultDevelopmentFocus,
    growthPolicy: type.requiredPopulation === 0 ? "automation_first_no_population_growth" : "controlled_growth_until_stability_confirmed",
    hazardModifierIds: ["temperature", "radiation", "atmosphere", "pressure", "gravity", "weather", "geology", "biology", "anomalies", "accessibility"],
    maintenanceCategoryIds: ["life_support", "structural_integrity", "energy", "food", "water", "medical", "logistics", "environmental_shielding", "automation_upkeep"],
    civilizationIdentityEffects: type.civilizationIdentityInfluence,
    progressionContributionIds: type.progressionRequirements.filter((item) => item.type === "progression_milestone").map((item) => item.id)
  };
});

const colonyDevelopmentStageRows: Array<[ColonyDevelopmentStageId, string, number, number, number, string, ColonyCapabilityId[]]> = [
  ["founding_outpost", "Founding Outpost", 1, 1, 0, "operational", ["habitation", "storage"]],
  ["established_outpost", "Established Outpost", 2, 50, 2, "stability_50", ["habitation", "storage", "ship_support"]],
  ["settlement", "Settlement", 3, 500, 4, "population_500", ["population_growth", "trade"]],
  ["developed_settlement", "Developed Settlement", 4, 2500, 8, "infrastructure_40", ["processing", "education", "healthcare"]],
  ["town", "Town", 5, 10000, 12, "stability_65", ["manufacturing", "trade"]],
  ["city", "City", 6, 50000, 18, "economy_50", ["diplomacy", "tourism"]],
  ["major_city", "Major City", 7, 250000, 28, "logistics_65", ["defense_security", "research"]],
  ["planetary_capital", "Planetary Capital", 8, 1000000, 40, "first_planetary_capital", ["diplomacy", "education", "healthcare"]],
  ["orbital_metropolis", "Orbital Metropolis", 9, 500000, 35, "first_orbital_colony", ["ship_support", "trade", "storage"]],
  ["megacity", "Megacity", 10, 5000000, 60, "infrastructure_80", ["manufacturing", "diplomacy", "healthcare"]],
  ["specialized_world", "Specialized World", 11, 1000000, 45, "first_specialized_colony", ["extraction", "research", "terraforming", "preservation"]],
  ["mature_colony", "Mature Colony", 12, 10000000, 70, "first_self_sustaining_colony", ["population_growth", "education", "healthcare", "trade"]]
];

export const colonyDevelopmentStages: ColonyDevelopmentStage[] = colonyDevelopmentStageRows.map(([id, displayName, order, population, buildings, requirementId, capabilities]) => ({
  id,
  displayName,
  order,
  requirements: [
    { type: "population", id: "population_capacity", threshold: population, notes: "Population is citizen/workforce capacity, not spendable currency." },
    { type: "buildings", id: "canonical_building_count", threshold: buildings, notes: "Buildings must resolve through the canonical Building Library." },
    { type: "progression_or_milestone", id: String(requirementId), threshold: 1, notes: "The Game resolves player-specific completed milestone/action state." }
  ],
  unlockedCapabilityIds: capabilities,
  presentationKey: `colony_stage_${id}`,
  notes: "Development stage is requirement-based and deterministic. It is not XP."
}));

const colonyFocusRows: Array<[ColonyFocusId, string, string[], string[], string, Record<string, number>, CivilizationIdentityInfluenceProfile, string[]]> = [
  ["balanced", "Balanced", ["habitation", "storage", "communications"], ["water", "energy", "materials"], "generalist", { growth: 1, production: 1 }, influence(["Industry", "Technology"], "phase_completion", 1), ["construct_building", "upgrade_building"]],
  ["population_growth", "Population Growth", ["habitation", "food_water", "medical"], ["water", "food", "life_support"], "civilian_support", { growth: 1.2, production: 0.9 }, influence(["Nature"], "phase_completion", 1), ["construct_building", "upgrade_building"]],
  ["mining", "Mining", ["automated_mine", "processing", "storage"], ["materials", "energy"], "engineers", { extraction: 1.25, research: 0.85 }, influence(["Industry"], "phase_completion", 1), ["build_mining_outpost", "transfer_resources"]],
  ["industry", "Industry", ["processing", "power", "storage"], ["materials", "machinery", "energy"], "engineers", { production: 1.25, growth: 0.9 }, influence(["Industry", "Corporate"], "phase_completion", 1), ["construct_building", "upgrade_building"]],
  ["research", "Research", ["laboratory", "communications", "data_storage"], ["survey_data", "energy"], "scientists", { research: 1.3, production: 0.85 }, influence(["Technology"], "phase_completion", 1), ["conduct_research", "survey_planet"]],
  ["agriculture", "Agriculture", ["food_water", "habitation"], ["water", "organics"], "agricultural_workers", { growth: 1.15, stability: 1.1 }, influence(["Nature", "Industry"], "phase_completion", 1), ["construct_building"]],
  ["trade", "Trade", ["trade_port", "logistics", "storage"], ["communications", "fuel"], "logistics_staff", { trade: 1.3, production: 0.9 }, influence(["Corporate"], "phase_completion", 1), ["establish_trade_route", "transfer_resources"]],
  ["logistics", "Logistics", ["logistics", "docking", "storage"], ["fuel", "materials"], "logistics_staff", { logistics: 1.35 }, influence(["Corporate", "Industry"], "phase_completion", 1), ["transfer_resources", "travel_to_destination"]],
  ["preservation", "Preservation", ["preservation_station", "laboratory"], ["survey_data", "water"], "scientists", { preservation: 1.35, extraction: 0.4 }, influence(["Nature", "Technology"], "phase_completion", 1), ["designate_preserve", "survey_planet"]],
  ["archaeology", "Archaeology", ["laboratory", "communications"], ["survey_data", "energy"], "scientists", { research: 1.2 }, influence(["Technology"], "phase_completion", 1), ["excavate_ruin", "analyze_artifact"]],
  ["energy", "Energy", ["power", "fuel_depot"], ["hydrogen", "helium3", "solar_energy"], "engineers", { energy: 1.35 }, influence(["Industry", "Technology"], "phase_completion", 1), ["transfer_resources"]],
  ["orbital_infrastructure", "Orbital Infrastructure", ["orbital_habitat", "docking", "ship_support"], ["titanium", "fuel"], "engineers", { logistics: 1.25, trade: 1.1 }, influence(["Technology", "Industry"], "phase_completion", 1), ["construct_building", "travel_to_destination"]],
  ["terraforming", "Terraforming", ["terraforming", "laboratory", "power"], ["water", "carbon", "energy"], "scientists", { terraforming: 1.35, stability: 0.9 }, influence(["Nature", "Technology", "Industry"], "phase_completion", 1), ["begin_terraforming_study", "terraform_planet_stage"]],
  ["automation", "Automation", ["robotic_control", "power", "communications"], ["silicon", "copper", "energy"], "robotic_workforce", { automation: 1.4, populationNeed: 0.4 }, influence(["Cyber", "Industry"], "phase_completion", 1), ["deploy_automated_extraction", "construct_building"]]
];

export const colonyFocusDefinitions: ColonyFocusDefinition[] = colonyFocusRows.map(([id, displayName, recommendedBuildingRoles, resourcePriorityRoles, workforcePriority, growthModifiers, identityInfluence, recommendedActionIds]) => ({
  id,
  displayName,
  description: `${displayName} colony focus affects recommended buildings, resource priorities, workforce priority, and action recommendations without changing planet CSI/SVI.`,
  recommendedBuildingRoles,
  resourcePriorityRoles,
  workforcePriority,
  growthModifiers,
  identityInfluence,
  recommendedActionIds
}));

export const colonyMaintenanceDefinitions: ColonyMaintenanceDefinition[] = [
  ...["temperature", "radiation", "atmosphere", "pressure", "gravity", "weather", "geology", "biology", "anomalies", "accessibility"].map((id) => ({
    id,
    displayName: id.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase()),
    category: "hazard_modifier" as const,
    formulaHook: `hazard.${id} adjusts phase duration, maintenance load, and failure chance through the Action System modifier order.`,
    affectedCapabilityIds: ["habitation", "population_growth", "storage"] as ColonyCapabilityId[],
    notes: "Studio publishes the hook; the Game resolves live player/project values."
  })),
  ...["life_support", "structural_integrity", "energy", "food", "water", "medical", "logistics", "environmental_shielding", "automation_upkeep"].map((id) => ({
    id,
    displayName: id.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase()),
    category: "maintenance_category" as const,
    formulaHook: `maintenance.${id} contributes to operating status and future upkeep systems.`,
    affectedCapabilityIds: id === "automation_upkeep" ? ["automation"] as ColonyCapabilityId[] : ["habitation", "storage"] as ColonyCapabilityId[],
    notes: "Definition only. No live consumption simulation is stored in Studio."
  }))
];

export const colonyFailurePolicies: ColonyFailurePolicy[] = ([
  ["completed", "Completed", "none", "none", "population_assigned_to_colony", "initial_template_created", true, null, "colony_project_completed", []],
  ["paused", "Paused", "none", "reserved_inputs_held", "population_manifest_held", "partial_infrastructure_retained", true, null, "colony_project_paused", ["resume_requirements_revalidated"]],
  ["blocked", "Blocked", "none", "reserved_inputs_held", "population_manifest_held", "partial_infrastructure_retained", true, null, "colony_project_blocked", ["clear_blocker_reason_codes"]],
  ["failed", "Failed", "partial", "recover_unspent_and_salvageable_inputs", "recover_survivors_by_policy", "damaged_infrastructure_recorded", true, influence(["Industry"], "phase_completion", -1), "colony_project_failed", ["new_site_review", "resource_reallocation"]],
  ["cancelled", "Cancelled", "unspent_inputs_refunded", "unspent_inputs_returned", "population_manifest_released", "started_infrastructure_archived", true, null, "colony_project_cancelled", ["start_new_project"]],
  ["abandoned", "Abandoned", "none", "salvage_by_policy", "evacuation_required_if_population_present", "abandoned_site_history_preserved", true, influence(["Nature", "Corporate"], "phase_completion", -1), "colony_abandoned", ["abandonment_confirmation", "evacuation_or_decommission_plan"]],
  ["decommissioned", "Decommissioned", "salvage", "recover_structural_materials_by_policy", "population_reassigned_by_game", "decommissioned_record_preserved", true, null, "colony_decommissioned", ["decommission_plan_completed"]],
  ["evacuated", "Evacuated", "partial", "critical_assets_recovered", "population_evacuated_by_game", "evacuated_site_record_preserved", true, influence(["Technology"], "phase_completion", -1), "colony_evacuated", ["safe_destination", "transport_capacity"]]
] as const).map(([id, displayName, refundPolicy, resourceRecovery, populationRecovery, remainingInfrastructure, historicalRecord, identityInfluence, timelineEventType, restartRequirements]) => ({
  id: id as ColonyOutcomeId,
  displayName,
  refundPolicy,
  resourceRecovery,
  populationRecovery,
  remainingInfrastructure,
  historicalRecord,
  identityInfluence,
  timelineEventType,
  restartRequirements: [...restartRequirements]
}));

export const colonyPresentationContract: ColonyPresentationContract[] = [
  "ColonizationEligibilityPanel",
  "ColonyTypeCard",
  "ColonyResourcePackage",
  "ColonyPopulationRequirement",
  "ColonyProjectTimeline",
  "ColonyPhaseStepper",
  "ColonyStarterSet",
  "ColonyCapabilitySummary",
  "ColonyOperationalReport",
  "ColonyGrowthStage",
  "ColonyFocusSelector",
  "ColonyFailureSummary",
  "ColonyAbandonmentSummary"
].map((id) => ({
  id: id as ColonyPresentationContract["id"],
  displayName: id.replace(/([A-Z])/g, " $1").trim(),
  rendererIndependent: true,
  semanticFields: ["colonyTypeId", "eligibilityState", "reasonCodes", "phaseIds", "resourcePackageId", "populationRequirements", "starterSetId", "focusId", "stageId", "outcomeId"],
  notes: "Semantic contract only. Studio does not define final screens, React layout, Roblox UI, or active project state."
}));

const missingProgressionMilestones = ["first_specialized_colony", "first_planetary_capital", "first_self_sustaining_colony", "first_multi_planet_civilization", "first_interstellar_colony"];

export const missingCanonicalDefinitions: ColonizationMissingCanonicalDefinition[] = [
  ...colonyTransportRequirementDefinitions
    .filter((item) => item.status === "missing_canonical_definition")
    .map((item) => ({
      id: item.id,
      type: "transport" as const,
      displayName: item.displayName,
      referencedBy: item.requiredForColonyTypeIds,
      severity: "warning" as const,
      recommendedOwner: "Transport System" as const,
      notes: item.notes
    })),
  ...missingProgressionMilestones.map((id) => ({
    id,
    type: "progression_milestone" as const,
    displayName: id.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase()),
    referencedBy: colonyTypeDefinitions.filter((type) => type.progressionRequirements.some((requirementItem) => requirementItem.id === id)).map((type) => type.id),
    severity: "info" as const,
    recommendedOwner: "Civilization Progression" as const,
    notes: "Referenced as future colonization milestone integration. It is reported here rather than duplicated in the colonization framework."
  }))
];

export const colonizationFramework: ColonizationFrameworkContract = {
  id: "colonization_settlement_framework_v1",
  version: "1.0.0",
  architectureDecisionId: "ARCH-DECISION-COLONIZATION-MULTI-STAGE-PROJECT",
  actionSystemId: canonicalActionSystem.id,
  planetDevelopmentFrameworkId: planetDevelopmentFramework.id,
  civilizationProgressionFrameworkId: civilizationProgressionFramework.id,
  civilizationIdentitySource: "civilization_identity",
  calculationVersion,
  ownership: {
    studioOwns: ["colony type definitions", "eligibility states", "reason codes", "deterministic resolver contract", "phase contracts", "resource packages", "population hooks", "initial state templates", "development stages", "focus definitions", "starter building references", "capability definitions", "hazard and maintenance hooks", "failure policies", "presentation intent", "runtime publication"],
    gameOwns: ["player colony instances", "active projects", "queues", "timestamps", "transferred resources", "population assignments", "settlement growth state", "UI rendering", "save/cloud persistence", "server-authoritative action completion"]
  },
  activePlayerStatePolicy: {
    exportsActiveColonies: false,
    exportsProjectQueues: false,
    exportsTimestamps: false,
    exportsPlayerPopulationAssignments: false,
    exportsTransferredResources: false
  },
  resolverContract: colonizationResolverContract,
  colonyTypeDefinitions,
  colonizationEligibilityDefinitions,
  colonizationReasonCodes,
  colonyProjectPhaseDefinitions,
  colonyTransportRequirementDefinitions,
  colonyResourcePackageDefinitions,
  colonyPopulationRequirementDefinitions,
  colonyInitialStateTemplates,
  colonyDevelopmentStages,
  colonyFocusDefinitions,
  colonyStarterSetDefinitions,
  colonyCapabilityDefinitions,
  colonyMaintenanceDefinitions,
  colonyFailurePolicies,
  colonyPresentationContract,
  creativeProductionRequirements: [
    "colony type icons",
    "colonization eligibility states",
    "colony project phases",
    "transport/colony ship roles",
    "starter building roles",
    "operational colony states",
    "growth stage badges",
    "focus icons",
    "failure/abandonment states",
    "orbital colony presentation",
    "surface colony presentation",
    "automated outpost presentation"
  ].map((displayName) => ({
    id: `colonization_${displayName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`,
    displayName,
    category: "Colonization & Settlements",
    status: "required",
    notes: "Production requirement only. Do not fabricate final art or game screens in Studio."
  })),
  assetLibraryCategories: [
    {
      id: "colonization_settlements",
      displayName: "Colonization & Settlements",
      groups: ["Colony Types", "Project Phases", "Transport", "Starter Infrastructure", "Colony Focus", "Growth Stages", "Operational States", "Failure States"],
      notes: "Generated planets remain in Planet Library; settlement assets attach to colonization definitions or colony records."
    }
  ],
  missingCanonicalDefinitions,
  validationRules: [
    "Colonization is Action-driven and does not create instant colonies.",
    "Every colony type must reference valid canonical Actions.",
    "Every project phase must resolve to an Action phase template and duration definition.",
    "Resource packages must reference canonical Resource Catalog IDs.",
    "Starter building IDs must resolve or be explicitly reported as missing canonical definitions.",
    "Gas giants, ice giants, and asteroid belts cannot use surface-only colony types.",
    "No-solid-surface bodies must support orbital, floating, automated, fuel depot, or similar non-surface options.",
    "Protected worlds may prohibit settlement and recommend preservation or catalog-only actions.",
    "Initial state templates are definitions only; player instances remain Game-owned.",
    "Civilization Identity and Progression integrations reference canonical systems without duplicating them.",
    "Studio exports no active player state, timestamps, queues, live resources, private notes, or source paths."
  ]
};

export function validateColonizationFramework(
  framework: ColonizationFrameworkContract = colonizationFramework,
  context: {
    actionIds?: Set<string>;
    actionPhaseIds?: Set<string>;
    actionDurationIds?: Set<string>;
    resourceIds?: Set<string>;
    buildingIds?: Set<string>;
    planetDevelopmentFrameworkId?: string;
    civilizationProgressionFrameworkId?: string;
    identityAlignmentIds?: Set<string>;
    progressionMilestoneIds?: Set<string>;
  } = {}
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const actionIdSet = context.actionIds ?? new Set(canonicalActionSystem.actionDefinitions.map((action) => action.id));
  const phaseIdSet = context.actionPhaseIds ?? new Set(canonicalActionSystem.actionPhaseTemplates.map((phase) => phase.id));
  const durationIdSet = context.actionDurationIds ?? new Set(canonicalActionSystem.actionDurationDefinitions.map((duration) => duration.id));
  const resourceIdSet = context.resourceIds ?? new Set(ResourceService.catalog.map((item) => item.id));
  const buildingIdSet = context.buildingIds ?? new Set(canonicalBuildingLibrary.map((building) => building.id));
  const identityIds = context.identityAlignmentIds ?? new Set(["Industry", "Technology", "Cyber", "Nature", "Corporate"]);
  const milestoneIds = context.progressionMilestoneIds ?? new Set(civilizationProgressionFramework.civilizationMilestones.map((milestone) => milestone.id));
  const colonyTypeIds = new Set(framework.colonyTypeDefinitions.map((type) => type.id));
  const focusIds = new Set(framework.colonyFocusDefinitions.map((focus) => focus.id));
  const capabilityIds = new Set(framework.colonyCapabilityDefinitions.map((capability) => capability.id));
  const starterSetIds = new Set(framework.colonyStarterSetDefinitions.map((starterSet) => starterSet.id));
  const reasonIds = new Set(framework.colonizationReasonCodes.map((reason) => reason.id));
  const phaseIds = framework.colonyProjectPhaseDefinitions.map((phase) => phase.id);
  const duplicatePhases = phaseIds.filter((id, index) => phaseIds.indexOf(id) !== index);
  const requiredTypeIds: ColonyTypeId[] = ["primary_colony", "secondary_colony", "frontier_colony", "mining_colony", "research_colony", "agricultural_colony", "industrial_colony", "trade_colony", "logistics_hub", "orbital_colony", "floating_colony", "subsurface_colony", "fuel_depot", "archaeological_outpost", "preservation_station", "terraforming_base", "automated_outpost"];
  const requiredPhaseIds: ColonyProjectPhaseId[] = ["planning", "site_selection", "resource_allocation", "population_assignment", "transport_preparation", "transit", "landing_or_orbital_insertion", "site_preparation", "initial_habitat_construction", "life_support_activation", "infrastructure_commissioning", "operational"];
  const requiredFocusIds: ColonyFocusId[] = ["balanced", "population_growth", "mining", "industry", "research", "agriculture", "trade", "logistics", "preservation", "archaeology", "energy", "orbital_infrastructure", "terraforming", "automation"];
  const requiredOutcomeIds: ColonyOutcomeId[] = ["completed", "paused", "blocked", "failed", "cancelled", "abandoned", "decommissioned", "evacuated"];

  if (framework.actionSystemId !== canonicalActionSystem.id) {
    issues.push({ severity: "error", code: "colonization_action_system_missing", message: "Colonization Framework must reference the Canonical Action System.", records: [framework.actionSystemId] });
  }
  if (framework.planetDevelopmentFrameworkId !== (context.planetDevelopmentFrameworkId ?? planetDevelopmentFramework.id)) {
    issues.push({ severity: "error", code: "colonization_planet_development_missing", message: "Colonization Framework must reference the Planet Development Framework.", records: [framework.planetDevelopmentFrameworkId] });
  }
  if (framework.civilizationProgressionFrameworkId !== (context.civilizationProgressionFrameworkId ?? civilizationProgressionFramework.id)) {
    issues.push({ severity: "error", code: "colonization_progression_missing", message: "Colonization Framework must reference the Civilization Progression Framework.", records: [framework.civilizationProgressionFrameworkId] });
  }
  if (framework.activePlayerStatePolicy.exportsActiveColonies || framework.activePlayerStatePolicy.exportsProjectQueues || framework.activePlayerStatePolicy.exportsTimestamps || framework.activePlayerStatePolicy.exportsPlayerPopulationAssignments || framework.activePlayerStatePolicy.exportsTransferredResources) {
    issues.push({ severity: "error", code: "colonization_player_state_policy_invalid", message: "Colonization Framework must not export active player colony/project state.", records: [framework.id] });
  }

  for (const required of requiredTypeIds) {
    if (!colonyTypeIds.has(required)) {
      issues.push({ severity: "error", code: "colonization_type_missing", message: "Required colony type is missing.", records: [required] });
    }
  }
  for (const required of requiredPhaseIds) {
    if (!framework.colonyProjectPhaseDefinitions.some((phase) => phase.id === required)) {
      issues.push({ severity: "error", code: "colonization_phase_missing", message: "Required colony project phase is missing.", records: [required] });
    }
  }
  for (const required of requiredFocusIds) {
    if (!focusIds.has(required)) {
      issues.push({ severity: "error", code: "colonization_focus_missing", message: "Required colony focus is missing.", records: [required] });
    }
  }
  for (const required of requiredOutcomeIds) {
    if (!framework.colonyFailurePolicies.some((policy) => policy.id === required)) {
      issues.push({ severity: "error", code: "colonization_failure_policy_missing", message: "Required colony outcome policy is missing.", records: [required] });
    }
  }
  for (const required of ["no_solid_surface", "insufficient_technology", "insufficient_population", "insufficient_logistics", "protected_ecology", "precursor_quarantine", "extreme_hazard", "no_habitation_support", "missing_colony_ship", "missing_resource_allocation", "progression_stage_locked"] as ColonizationReasonCodeId[]) {
    if (!reasonIds.has(required)) {
      issues.push({ severity: "error", code: "colonization_reason_code_missing", message: "Required colonization reason code is missing.", records: [required] });
    }
  }
  if (duplicatePhases.length) {
    issues.push({ severity: "error", code: "colonization_duplicate_phase", message: "Colony project phase IDs must be unique.", records: duplicatePhases });
  }

  for (const type of framework.colonyTypeDefinitions) {
    for (const actionId of type.allowedActionIds) {
      if (!actionIdSet.has(actionId)) {
        issues.push({ severity: "error", code: "colonization_action_missing", message: "Colony type action references must resolve.", records: [type.id, actionId] });
      }
    }
    if (!focusIds.has(type.defaultDevelopmentFocus)) {
      issues.push({ severity: "error", code: "colonization_default_focus_missing", message: "Colony type default focus must resolve.", records: [type.id, type.defaultDevelopmentFocus] });
    }
    for (const capabilityId of type.requiredCapabilityStates) {
      if (!capabilityIds.has(capabilityId)) {
        issues.push({ severity: "error", code: "colonization_capability_missing", message: "Colony type capability must resolve.", records: [type.id, capabilityId] });
      }
    }
    for (const resourceId of type.requiredResources) {
      if (!resourceIdSet.has(resourceId)) {
        issues.push({ severity: "error", code: "colonization_type_resource_missing", message: "Colony type required resource must resolve to Resource Catalog.", records: [type.id, resourceId] });
      }
    }
    for (const buildingId of type.requiredBuildings) {
      if (!buildingIdSet.has(buildingId)) {
        issues.push({ severity: "error", code: "colonization_type_building_missing", message: "Colony type required building must resolve to Building Library.", records: [type.id, buildingId] });
      }
    }
    for (const alignmentId of type.civilizationIdentityInfluence.alignmentIds) {
      if (!identityIds.has(alignmentId)) {
        issues.push({ severity: "error", code: "colonization_identity_missing", message: "Civilization Identity influence must resolve to an alignment.", records: [type.id, alignmentId] });
      }
    }
    for (const requirementItem of type.progressionRequirements) {
      if (requirementItem.type === "progression_milestone" && requirementItem.required && !milestoneIds.has(requirementItem.id)) {
        issues.push({ severity: "error", code: "colonization_progression_milestone_missing", message: "Required progression milestone must resolve.", records: [type.id, requirementItem.id] });
      }
    }
    const overlapsNoSolid = noSolidSurfaceBodyClasses.some((bodyClass) => type.supportedBodyClasses.includes(bodyClass));
    if (overlapsNoSolid && !["orbital_colony", "floating_colony", "fuel_depot", "preservation_station", "automated_outpost"].includes(type.id)) {
      issues.push({ severity: "error", code: "colonization_surface_type_on_no_solid_body", message: "Gas giants, ice giants, and asteroid belts cannot use surface colony types.", records: [type.id] });
    }
  }

  const noSolidOptions = framework.colonyTypeDefinitions.filter((type) => noSolidSurfaceBodyClasses.some((bodyClass) => type.supportedBodyClasses.includes(bodyClass))).map((type) => type.id);
  for (const requiredOption of ["orbital_colony", "floating_colony", "automated_outpost", "fuel_depot"] as ColonyTypeId[]) {
    if (!noSolidOptions.includes(requiredOption)) {
      issues.push({ severity: "error", code: "colonization_no_solid_option_missing", message: "No-solid-surface bodies must have non-surface options.", records: [requiredOption] });
    }
  }

  for (const phase of framework.colonyProjectPhaseDefinitions) {
    if (!phaseIdSet.has(phase.canonicalActionPhaseId)) {
      issues.push({ severity: "error", code: "colonization_action_phase_missing", message: "Colony project phase must resolve to Action phase template.", records: [phase.id, phase.canonicalActionPhaseId] });
    }
    if (!durationIdSet.has(phase.durationDefinitionId)) {
      issues.push({ severity: "error", code: "colonization_duration_missing", message: "Colony project phase duration must resolve to Action duration definition.", records: [phase.id, phase.durationDefinitionId] });
    }
  }

  for (const packageDefinitionItem of framework.colonyResourcePackageDefinitions) {
    for (const input of packageDefinitionItem.resourceInputs) {
      if (!resourceIdSet.has(input.resourceId)) {
        issues.push({ severity: "error", code: "colonization_package_resource_missing", message: "Colony package resources must resolve to Resource Catalog.", records: [packageDefinitionItem.id, input.role, input.resourceId] });
      }
    }
    for (const typeId of packageDefinitionItem.recommendedForColonyTypeIds) {
      if (!colonyTypeIds.has(typeId)) {
        issues.push({ severity: "error", code: "colonization_package_type_missing", message: "Colony package recommended type must resolve.", records: [packageDefinitionItem.id, typeId] });
      }
    }
  }

  for (const transport of framework.colonyTransportRequirementDefinitions) {
    for (const typeId of transport.requiredForColonyTypeIds) {
      if (!colonyTypeIds.has(typeId)) {
        issues.push({ severity: "error", code: "colonization_transport_type_missing", message: "Transport requirement colony type must resolve.", records: [transport.id, typeId] });
      }
    }
    if (transport.canonicalBuildingId && !buildingIdSet.has(transport.canonicalBuildingId)) {
      issues.push({ severity: "error", code: "colonization_transport_building_missing", message: "Transport building reference must resolve.", records: [transport.id, transport.canonicalBuildingId] });
    }
    if (transport.canonicalResourceId && !resourceIdSet.has(transport.canonicalResourceId)) {
      issues.push({ severity: "error", code: "colonization_transport_resource_missing", message: "Transport resource reference must resolve.", records: [transport.id, transport.canonicalResourceId] });
    }
  }

  for (const starterSet of framework.colonyStarterSetDefinitions) {
    if (!colonyTypeIds.has(starterSet.colonyTypeId)) {
      issues.push({ severity: "error", code: "colonization_starter_type_missing", message: "Starter set colony type must resolve.", records: [starterSet.id, starterSet.colonyTypeId] });
    }
    for (const role of starterSet.buildingRoles) {
      if (role.buildingId && !buildingIdSet.has(role.buildingId)) {
        issues.push({ severity: "error", code: "colonization_starter_building_missing", message: "Starter set building must resolve to Building Library.", records: [starterSet.id, role.role, role.buildingId] });
      }
    }
  }

  for (const template of framework.colonyInitialStateTemplates) {
    if (!colonyTypeIds.has(template.colonyTypeId)) {
      issues.push({ severity: "error", code: "colonization_template_type_missing", message: "Initial colony template type must resolve.", records: [template.id, template.colonyTypeId] });
    }
    if (!starterSetIds.has(template.firstBuildingSetId)) {
      issues.push({ severity: "error", code: "colonization_template_starter_missing", message: "Initial colony template starter set must resolve.", records: [template.id, template.firstBuildingSetId] });
    }
  }

  for (const focus of framework.colonyFocusDefinitions) {
    for (const actionId of focus.recommendedActionIds) {
      if (!actionIdSet.has(actionId)) {
        issues.push({ severity: "error", code: "colonization_focus_action_missing", message: "Colony focus action recommendation must resolve.", records: [focus.id, actionId] });
      }
    }
    for (const alignmentId of focus.identityInfluence.alignmentIds) {
      if (!identityIds.has(alignmentId)) {
        issues.push({ severity: "error", code: "colonization_focus_identity_missing", message: "Focus identity influence must resolve.", records: [focus.id, alignmentId] });
      }
    }
  }

  for (const stage of framework.colonyDevelopmentStages) {
    for (const capabilityId of stage.unlockedCapabilityIds) {
      if (!capabilityIds.has(capabilityId)) {
        issues.push({ severity: "error", code: "colonization_stage_capability_missing", message: "Colony development stage capability must resolve.", records: [stage.id, capabilityId] });
      }
    }
  }

  const serialized = JSON.stringify(framework);
  if (/activePlayerColony|activeColonyInstance|projectStartedAt|projectCompletedAt|queueContents|livePlayerPopulation|assignedPlayerPopulation|liveTransferredResources|saveId|\/Users\/|studio-private:\/\//i.test(serialized)) {
    issues.push({ severity: "error", code: "colonization_player_state_or_private_path_leak", message: "Colonization Framework must not export player state, queues, timestamps, live resources, private notes, or private paths.", records: [framework.id] });
  }

  return issues;
}
