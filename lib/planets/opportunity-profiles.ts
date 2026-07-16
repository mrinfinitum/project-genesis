import type { ImportIssue, PlanetOpportunityAction, PlanetOpportunityEligibility, PlanetOpportunityHazardProfile, PlanetOpportunityProfile, PlanetOpportunitySuitability } from "@/types/runtime";

type OpportunityClassInput = {
  id?: string;
  planet_class?: string | null;
  planet_subclass?: string | null;
  primary_biome?: string | null;
  biome?: string | null;
  celestial_body_type?: string | null;
  hazards?: string[] | null;
  resources?: string[] | null;
};

type ProfileInput = {
  key: string;
  planetClass: string;
  displayName: string;
  aliases?: string[];
  description: string;
  suitability: PlanetOpportunitySuitability;
  eligibility: PlanetOpportunityEligibility;
  hazardProfile: PlanetOpportunityHazardProfile;
  preservationStatus: PlanetOpportunityProfile["preservationStatus"];
  recommendedUses: PlanetOpportunityProfile["recommendedUses"];
  recommendedActions: PlanetOpportunityAction[];
  notes: string;
};

const allActions: PlanetOpportunityAction[] = ["Survey", "Catalog", "Bookmark"];

const eligibilityDefaults: PlanetOpportunityEligibility = {
  supportsColonization: false,
  supportsMining: true,
  supportsHarvesting: false,
  supportsOrbitalPlatforms: true,
  supportsTerraforming: false,
  supportsPreservation: false,
  supportsTourism: false,
  supportsMilitary: false,
  supportsResearchStations: true,
  supportsRefueling: false
};

function profile(input: ProfileInput): PlanetOpportunityProfile {
  return {
    id: `planet_opportunity_${input.key}`,
    planetClass: input.planetClass,
    displayName: input.displayName,
    aliases: input.aliases ?? [],
    description: input.description,
    suitability: input.suitability,
    eligibility: input.eligibility,
    hazardProfile: input.hazardProfile,
    preservationStatus: input.preservationStatus,
    recommendedUses: input.recommendedUses,
    recommendedActions: [...new Set([...input.recommendedActions, ...allActions])],
    notes: input.notes
  };
}

function eligibility(overrides: Partial<PlanetOpportunityEligibility>): PlanetOpportunityEligibility {
  return { ...eligibilityDefaults, ...overrides };
}

function scores(values: PlanetOpportunitySuitability): PlanetOpportunitySuitability {
  return values;
}

function hazards(values: PlanetOpportunityHazardProfile): PlanetOpportunityHazardProfile {
  return values;
}

export const canonicalPlanetOpportunityProfiles: PlanetOpportunityProfile[] = [
  profile({
    key: "earth_like",
    planetClass: "Earth-like",
    displayName: "Earth-like",
    aliases: ["Terrestrial", "Earthlike", "Continental", "Garden World"],
    description: "Balanced life-bearing or life-ready worlds with strong settlement, research, tourism, and trade potential.",
    suitability: scores({ colonization: 95, mining: 55, harvesting: 72, scientificResearch: 72, archaeology: 38, orbitalInfrastructure: 70, tradeHub: 91, tourism: 84, terraforming: 0, military: 55, danger: 18, environmentalHazard: 16 }),
    eligibility: eligibility({ supportsColonization: true, supportsHarvesting: true, supportsPreservation: true, supportsTourism: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 12, radiation: 10, storms: 22, gravity: 15, atmosphere: 8, hostility: 14, environmentalRisk: 16 }),
    preservationStatus: "encouraged",
    recommendedUses: { primaryUse: "Colonization", secondaryUse: "Trade Hub", optionalUse: "Tourism" },
    recommendedActions: ["Colonize", "Research", "Survey"],
    notes: "High opportunity does not force colonization; preserve and tourism remain valid strategic paths."
  }),
  profile({
    key: "ocean",
    planetClass: "Ocean",
    displayName: "Ocean",
    aliases: ["Deep Ocean", "Island World", "Archipelago", "Coral World"],
    description: "Water-rich worlds suited to biosphere research, harvesting, tourism, and specialized settlements.",
    suitability: scores({ colonization: 78, mining: 34, harvesting: 88, scientificResearch: 80, archaeology: 30, orbitalInfrastructure: 58, tradeHub: 64, tourism: 88, terraforming: 16, military: 35, danger: 32, environmentalHazard: 34 }),
    eligibility: eligibility({ supportsColonization: true, supportsHarvesting: true, supportsPreservation: true, supportsTourism: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 18, radiation: 12, storms: 62, gravity: 18, atmosphere: 18, hostility: 22, environmentalRisk: 34 }),
    preservationStatus: "encouraged",
    recommendedUses: { primaryUse: "Research Station", secondaryUse: "Bio Harvesting", optionalUse: "Tourism" },
    recommendedActions: ["Colonize", "Harvest", "Research"],
    notes: "Ocean worlds favor biology, climate, and tourism opportunities over raw extraction."
  }),
  profile({
    key: "forest",
    planetClass: "Forest",
    displayName: "Forest",
    aliases: ["Living", "Living Planet", "Bio", "Bio Planet", "World Tree", "Savanna", "Swamp", "Riverlands"],
    description: "Biologically rich worlds with excellent preservation, harvesting, tourism, and research value.",
    suitability: scores({ colonization: 82, mining: 28, harvesting: 92, scientificResearch: 86, archaeology: 42, orbitalInfrastructure: 50, tradeHub: 62, tourism: 90, terraforming: 8, military: 28, danger: 28, environmentalHazard: 26 }),
    eligibility: eligibility({ supportsColonization: true, supportsHarvesting: true, supportsPreservation: true, supportsTourism: true, supportsResearchStations: true }),
    hazardProfile: hazards({ temperature: 18, radiation: 10, storms: 34, gravity: 16, atmosphere: 14, hostility: 30, environmentalRisk: 26 }),
    preservationStatus: "encouraged",
    recommendedUses: { primaryUse: "Preservation", secondaryUse: "Biological Research", optionalUse: "Tourism" },
    recommendedActions: ["Research", "Harvest", "Catalog"],
    notes: "Living and biological generator classes resolve here unless a more specific profile is introduced later."
  }),
  profile({
    key: "desert",
    planetClass: "Desert",
    displayName: "Desert",
    aliases: ["Dunes", "Canyon", "Salt Flats", "Mesa", "Dust Basin", "Oasis"],
    description: "Dry worlds with moderate settlement potential, strong solar/refueling infrastructure, and resilient mining operations.",
    suitability: scores({ colonization: 56, mining: 66, harvesting: 18, scientificResearch: 52, archaeology: 58, orbitalInfrastructure: 62, tradeHub: 46, tourism: 42, terraforming: 62, military: 50, danger: 44, environmentalHazard: 48 }),
    eligibility: eligibility({ supportsColonization: true, supportsOrbitalPlatforms: true, supportsTerraforming: true, supportsTourism: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 58, radiation: 35, storms: 42, gravity: 24, atmosphere: 38, hostility: 38, environmentalRisk: 48 }),
    preservationStatus: "optional",
    recommendedUses: { primaryUse: "Mining Outpost", secondaryUse: "Terraforming Candidate", optionalUse: "Solar Refueling" },
    recommendedActions: ["Mine", "Research", "Colonize"],
    notes: "Desert worlds invite choices between rugged settlement, mining, and terraforming."
  }),
  profile({
    key: "frozen",
    planetClass: "Frozen",
    displayName: "Frozen",
    aliases: ["Ice", "Glacial", "Snow World", "Blue Ice", "Polar"],
    description: "Cold worlds with strong ice/resource extraction, cryo-science, and selective terraforming potential.",
    suitability: scores({ colonization: 46, mining: 62, harvesting: 38, scientificResearch: 70, archaeology: 34, orbitalInfrastructure: 56, tradeHub: 32, tourism: 30, terraforming: 72, military: 42, danger: 48, environmentalHazard: 56 }),
    eligibility: eligibility({ supportsColonization: true, supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsTerraforming: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 86, radiation: 24, storms: 38, gravity: 24, atmosphere: 48, hostility: 44, environmentalRisk: 56 }),
    preservationStatus: "optional",
    recommendedUses: { primaryUse: "Cryo Research", secondaryUse: "Ice Mining", optionalUse: "Terraforming Candidate" },
    recommendedActions: ["Research", "Mine", "Survey"],
    notes: "Frozen worlds are useful even when colonization is a long-term option."
  }),
  profile({
    key: "volcanic",
    planetClass: "Volcanic",
    displayName: "Volcanic",
    aliases: ["Lava", "Ash World", "Basalt World", "Obsidian", "Sulfur Basin"],
    description: "Geologically active worlds with high mining, research, and industrial energy potential.",
    suitability: scores({ colonization: 22, mining: 88, harvesting: 34, scientificResearch: 78, archaeology: 30, orbitalInfrastructure: 68, tradeHub: 28, tourism: 18, terraforming: 32, military: 56, danger: 78, environmentalHazard: 84 }),
    eligibility: eligibility({ supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsTerraforming: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 92, radiation: 42, storms: 54, gravity: 32, atmosphere: 74, hostility: 76, environmentalRisk: 84 }),
    preservationStatus: "not_applicable",
    recommendedUses: { primaryUse: "Deep Mining", secondaryUse: "Geothermal Industry", optionalUse: "Scientific Station" },
    recommendedActions: ["Mine", "Research", "Probe"],
    notes: "Volcanic worlds are opportunity-rich without being settlement-first."
  }),
  profile({
    key: "rocky",
    planetClass: "Rocky",
    displayName: "Rocky",
    aliases: ["Rock Desert", "Highlands", "Badlands", "Airless", "Crater Fields"],
    description: "Stable rocky bodies suited to mining, orbital logistics, military infrastructure, and survey work.",
    suitability: scores({ colonization: 38, mining: 82, harvesting: 16, scientificResearch: 48, archaeology: 28, orbitalInfrastructure: 74, tradeHub: 34, tourism: 16, terraforming: 44, military: 68, danger: 36, environmentalHazard: 44 }),
    eligibility: eligibility({ supportsMining: true, supportsOrbitalPlatforms: true, supportsTerraforming: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 44, radiation: 46, storms: 14, gravity: 34, atmosphere: 70, hostility: 40, environmentalRisk: 44 }),
    preservationStatus: "optional",
    recommendedUses: { primaryUse: "Mining Base", secondaryUse: "Orbital Logistics", optionalUse: "Defense Platform" },
    recommendedActions: ["Mine", "Survey", "Probe"],
    notes: "Rocky bodies make strong infrastructure anchors even when habitats are limited."
  }),
  profile({
    key: "gas_giant",
    planetClass: "Gas Giant",
    displayName: "Gas Giant",
    aliases: ["Banded", "Storm Giant", "Metallic Giant", "Amber Giant", "Emerald Giant", "Striped Giant", "Cyclone Giant"],
    description: "Massive atmospheric planets with exceptional gas harvesting, orbital industry, research, and refueling opportunities.",
    suitability: scores({ colonization: 0, mining: 98, harvesting: 100, scientificResearch: 65, archaeology: 0, orbitalInfrastructure: 95, tradeHub: 70, tourism: 10, terraforming: 0, military: 62, danger: 72, environmentalHazard: 88 }),
    eligibility: eligibility({ supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 50, radiation: 58, storms: 96, gravity: 90, atmosphere: 98, hostility: 78, environmentalRisk: 88 }),
    preservationStatus: "not_applicable",
    recommendedUses: { primaryUse: "Gas Harvesting", secondaryUse: "Orbital Refinery", optionalUse: "Scientific Station" },
    recommendedActions: ["Harvest", "Research", "Probe"],
    notes: "Gas giants explicitly do not support colonization, but remain high-value strategic bodies."
  }),
  profile({
    key: "ice_giant",
    planetClass: "Ice Giant",
    displayName: "Ice Giant",
    aliases: ["Ice Giant", "Cryo Giant", "Methane Giant"],
    description: "Outer-system giants with strong volatile harvesting, refueling, orbital industry, and atmospheric science value.",
    suitability: scores({ colonization: 0, mining: 86, harvesting: 96, scientificResearch: 72, archaeology: 0, orbitalInfrastructure: 90, tradeHub: 58, tourism: 12, terraforming: 0, military: 56, danger: 66, environmentalHazard: 82 }),
    eligibility: eligibility({ supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 84, radiation: 50, storms: 84, gravity: 82, atmosphere: 96, hostility: 70, environmentalRisk: 82 }),
    preservationStatus: "not_applicable",
    recommendedUses: { primaryUse: "Volatile Harvesting", secondaryUse: "Refueling Depot", optionalUse: "Atmospheric Research" },
    recommendedActions: ["Harvest", "Research", "Probe"],
    notes: "Resolved from Gas Giant records whose subclass or biome indicates Ice Giant."
  }),
  profile({
    key: "artificial",
    planetClass: "Artificial",
    displayName: "Artificial",
    aliases: ["Machine World", "Cyber Planet", "Forge World", "Arcology World", "AI Core", "Data Sphere", "Defense World"],
    description: "Constructed or machine-shaped worlds with powerful infrastructure, research, trade, and military potential.",
    suitability: scores({ colonization: 64, mining: 62, harvesting: 40, scientificResearch: 88, archaeology: 58, orbitalInfrastructure: 94, tradeHub: 88, tourism: 36, terraforming: 10, military: 86, danger: 58, environmentalHazard: 46 }),
    eligibility: eligibility({ supportsColonization: true, supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 34, radiation: 42, storms: 12, gravity: 28, atmosphere: 36, hostility: 68, environmentalRisk: 46 }),
    preservationStatus: "restricted",
    recommendedUses: { primaryUse: "Research Complex", secondaryUse: "Trade Hub", optionalUse: "Defense Network" },
    recommendedActions: ["Research", "Survey", "Catalog"],
    notes: "Artificial worlds should be handled as strategic infrastructure records, not generic settlement targets."
  }),
  profile({
    key: "exotic",
    planetClass: "Exotic",
    displayName: "Exotic",
    aliases: ["Void", "Void World", "Energy", "Energy World", "Primordial", "Ancient", "Ancient World", "Quantum Rift", "Singularity World"],
    description: "Rare anomalous worlds with high research, preservation, archaeology, and special-project potential.",
    suitability: scores({ colonization: 18, mining: 50, harvesting: 54, scientificResearch: 98, archaeology: 84, orbitalInfrastructure: 58, tradeHub: 30, tourism: 46, terraforming: 4, military: 52, danger: 82, environmentalHazard: 86 }),
    eligibility: eligibility({ supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsPreservation: true, supportsTourism: true, supportsMilitary: true, supportsResearchStations: true }),
    hazardProfile: hazards({ temperature: 66, radiation: 88, storms: 76, gravity: 72, atmosphere: 80, hostility: 88, environmentalRisk: 86 }),
    preservationStatus: "restricted",
    recommendedUses: { primaryUse: "Scientific Station", secondaryUse: "Anomaly Preservation", optionalUse: "Archaeology" },
    recommendedActions: ["Research", "Catalog", "Probe"],
    notes: "Exotic bodies should tempt study and preservation before extraction."
  }),
  profile({
    key: "barren",
    planetClass: "Barren",
    displayName: "Barren",
    aliases: ["Dust Planet", "Lifeless", "Grey World", "Broken World"],
    description: "Sparse worlds with practical mining, outpost, refueling, and orbital construction value.",
    suitability: scores({ colonization: 24, mining: 72, harvesting: 8, scientificResearch: 34, archaeology: 22, orbitalInfrastructure: 70, tradeHub: 24, tourism: 6, terraforming: 54, military: 58, danger: 34, environmentalHazard: 52 }),
    eligibility: eligibility({ supportsMining: true, supportsOrbitalPlatforms: true, supportsTerraforming: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 54, radiation: 58, storms: 10, gravity: 30, atmosphere: 86, hostility: 38, environmentalRisk: 52 }),
    preservationStatus: "optional",
    recommendedUses: { primaryUse: "Mining Outpost", secondaryUse: "Orbital Platform", optionalUse: "Terraforming Candidate" },
    recommendedActions: ["Mine", "Survey", "Ignore"],
    notes: "Barren does not mean useless; it just shifts value away from biosphere paths."
  }),
  profile({
    key: "dead",
    planetClass: "Dead",
    displayName: "Dead",
    aliases: ["Dead World", "Airless Dead", "Ruined Dead World"],
    description: "Formerly active or lifeless worlds suited to survey, archaeology, mining, and cautious restoration.",
    suitability: scores({ colonization: 18, mining: 68, harvesting: 6, scientificResearch: 52, archaeology: 70, orbitalInfrastructure: 62, tradeHub: 20, tourism: 8, terraforming: 42, military: 46, danger: 42, environmentalHazard: 60 }),
    eligibility: eligibility({ supportsMining: true, supportsOrbitalPlatforms: true, supportsTerraforming: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 58, radiation: 64, storms: 12, gravity: 30, atmosphere: 90, hostility: 48, environmentalRisk: 60 }),
    preservationStatus: "optional",
    recommendedUses: { primaryUse: "Archaeological Survey", secondaryUse: "Resource Extraction", optionalUse: "Restoration Study" },
    recommendedActions: ["Research", "Mine", "Catalog"],
    notes: "Dead worlds often carry historical or geological value even without settlement suitability."
  }),
  profile({
    key: "crystal",
    planetClass: "Crystal",
    displayName: "Crystal",
    aliases: ["Crystal Forest", "Crystal Desert", "Crystal Caverns", "Prismatic", "Quartz Peaks", "Amethyst", "Emerald Crystal", "Sapphire Crystal"],
    description: "Mineral-rich worlds with strong extraction, tourism, research, and preservation tension.",
    suitability: scores({ colonization: 46, mining: 92, harvesting: 32, scientificResearch: 74, archaeology: 46, orbitalInfrastructure: 56, tradeHub: 54, tourism: 72, terraforming: 18, military: 44, danger: 42, environmentalHazard: 48 }),
    eligibility: eligibility({ supportsColonization: true, supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsPreservation: true, supportsTourism: true, supportsMilitary: true, supportsResearchStations: true }),
    hazardProfile: hazards({ temperature: 40, radiation: 46, storms: 34, gravity: 28, atmosphere: 42, hostility: 46, environmentalRisk: 48 }),
    preservationStatus: "encouraged",
    recommendedUses: { primaryUse: "Crystal Mining", secondaryUse: "Scientific Survey", optionalUse: "Protected Tourism" },
    recommendedActions: ["Mine", "Research", "Catalog"],
    notes: "Crystal worlds intentionally support both extraction and preservation choices."
  }),
  profile({
    key: "toxic",
    planetClass: "Toxic",
    displayName: "Toxic",
    aliases: ["Acid World", "Sulfur World", "Poison Swamp", "Corrosive", "Chemical Seas", "Industrial Wasteland"],
    description: "Hostile chemical worlds with strong research, harvesting, and specialized industry value.",
    suitability: scores({ colonization: 16, mining: 62, harvesting: 72, scientificResearch: 82, archaeology: 24, orbitalInfrastructure: 62, tradeHub: 22, tourism: 4, terraforming: 58, military: 54, danger: 86, environmentalHazard: 92 }),
    eligibility: eligibility({ supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsTerraforming: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 56, radiation: 44, storms: 58, gravity: 26, atmosphere: 96, hostility: 92, environmentalRisk: 92 }),
    preservationStatus: "restricted",
    recommendedUses: { primaryUse: "Chemical Harvesting", secondaryUse: "Hazard Research", optionalUse: "Remote Industry" },
    recommendedActions: ["Harvest", "Research", "Probe"],
    notes: "Toxic worlds are high-opportunity but should remain dangerous and specialized."
  }),
  profile({
    key: "radioactive",
    planetClass: "Radioactive",
    displayName: "Radioactive",
    aliases: ["Radiant", "Ion World", "Charged", "Electromagnetic", "Quantum Storm"],
    description: "Radiation-heavy bodies with energy research, rare extraction, and remote platform value.",
    suitability: scores({ colonization: 8, mining: 74, harvesting: 64, scientificResearch: 90, archaeology: 18, orbitalInfrastructure: 66, tradeHub: 20, tourism: 2, terraforming: 18, military: 60, danger: 92, environmentalHazard: 94 }),
    eligibility: eligibility({ supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 64, radiation: 100, storms: 66, gravity: 34, atmosphere: 70, hostility: 94, environmentalRisk: 94 }),
    preservationStatus: "restricted",
    recommendedUses: { primaryUse: "Energy Research", secondaryUse: "Remote Extraction", optionalUse: "Military Sensor Platform" },
    recommendedActions: ["Research", "Probe", "Mine"],
    notes: "Radioactive profiles are resolved from energy and radiation-heavy classes or hazards."
  }),
  profile({
    key: "inferno",
    planetClass: "Inferno",
    displayName: "Inferno",
    aliases: ["Firestorm", "Magma Ocean", "Molten Core", "Inferno World"],
    description: "Extreme heat worlds with rare geothermal, mining, and hazard-research opportunities.",
    suitability: scores({ colonization: 0, mining: 90, harvesting: 48, scientificResearch: 84, archaeology: 14, orbitalInfrastructure: 72, tradeHub: 12, tourism: 0, terraforming: 8, military: 58, danger: 98, environmentalHazard: 100 }),
    eligibility: eligibility({ supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 100, radiation: 58, storms: 82, gravity: 36, atmosphere: 88, hostility: 98, environmentalRisk: 100 }),
    preservationStatus: "not_applicable",
    recommendedUses: { primaryUse: "Geothermal Extraction", secondaryUse: "Hazard Research", optionalUse: "Orbital Industry" },
    recommendedActions: ["Mine", "Research", "Probe"],
    notes: "Inferno is the extreme volcanic subclass profile."
  }),
  profile({
    key: "ocean_moon",
    planetClass: "Ocean Moon",
    displayName: "Ocean Moon",
    aliases: ["Moon Ocean", "Subsurface Ocean Moon", "Frozen Ocean Moon"],
    description: "Moon-scale ocean bodies suited to research, harvesting, preservation, and orbital support.",
    suitability: scores({ colonization: 42, mining: 36, harvesting: 76, scientificResearch: 88, archaeology: 22, orbitalInfrastructure: 80, tradeHub: 36, tourism: 58, terraforming: 22, military: 34, danger: 38, environmentalHazard: 44 }),
    eligibility: eligibility({ supportsColonization: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsPreservation: true, supportsTourism: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 54, radiation: 42, storms: 20, gravity: 48, atmosphere: 64, hostility: 36, environmentalRisk: 44 }),
    preservationStatus: "encouraged",
    recommendedUses: { primaryUse: "Ocean Research", secondaryUse: "Orbital Support", optionalUse: "Protected Outpost" },
    recommendedActions: ["Research", "Harvest", "Catalog"],
    notes: "Ocean moon resolves before generic Ocean when the body type is moon."
  }),
  profile({
    key: "frozen_moon",
    planetClass: "Frozen Moon",
    displayName: "Frozen Moon",
    aliases: ["Ice Moon", "Glacial Moon", "Cryovolcanic Moon"],
    description: "Cold moons suited to ice extraction, refueling, science stations, and low-footprint outposts.",
    suitability: scores({ colonization: 32, mining: 64, harvesting: 52, scientificResearch: 74, archaeology: 20, orbitalInfrastructure: 82, tradeHub: 28, tourism: 20, terraforming: 24, military: 42, danger: 44, environmentalHazard: 54 }),
    eligibility: eligibility({ supportsColonization: true, supportsMining: true, supportsHarvesting: true, supportsOrbitalPlatforms: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 88, radiation: 46, storms: 18, gravity: 52, atmosphere: 78, hostility: 42, environmentalRisk: 54 }),
    preservationStatus: "optional",
    recommendedUses: { primaryUse: "Ice Mining", secondaryUse: "Refueling Depot", optionalUse: "Cryo Research" },
    recommendedActions: ["Mine", "Research", "Probe"],
    notes: "Frozen moons often become support nodes rather than population centers."
  }),
  profile({
    key: "asteroid_belt",
    planetClass: "Asteroid Belt",
    displayName: "Asteroid Belt",
    aliases: ["Asteroid", "Belt", "Debris Field"],
    description: "Distributed bodies with strong mining, orbital industry, refueling, and navigation-control value.",
    suitability: scores({ colonization: 0, mining: 96, harvesting: 22, scientificResearch: 46, archaeology: 16, orbitalInfrastructure: 88, tradeHub: 48, tourism: 4, terraforming: 0, military: 64, danger: 54, environmentalHazard: 62 }),
    eligibility: eligibility({ supportsMining: true, supportsOrbitalPlatforms: true, supportsMilitary: true, supportsResearchStations: true, supportsRefueling: true }),
    hazardProfile: hazards({ temperature: 46, radiation: 50, storms: 4, gravity: 78, atmosphere: 100, hostility: 54, environmentalRisk: 62 }),
    preservationStatus: "not_applicable",
    recommendedUses: { primaryUse: "Asteroid Mining", secondaryUse: "Orbital Industry", optionalUse: "Refueling Depot" },
    recommendedActions: ["Mine", "Survey", "Bookmark"],
    notes: "Asteroid belts are canonical celestial bodies only when generated as body records."
  })
];

const profileById = new Map(canonicalPlanetOpportunityProfiles.map((item) => [item.id, item]));
const aliasToProfileId = new Map<string, string>();

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

for (const item of canonicalPlanetOpportunityProfiles) {
  for (const alias of [item.planetClass, item.displayName, ...item.aliases]) {
    aliasToProfileId.set(normalize(alias), item.id);
  }
}

function textFor(input: OpportunityClassInput) {
  return [
    input.celestial_body_type,
    input.planet_class,
    input.planet_subclass,
    input.primary_biome,
    input.biome,
    ...(Array.isArray(input.hazards) ? input.hazards : []),
    ...(Array.isArray(input.resources) ? input.resources : [])
  ].join(" ");
}

export function resolvePlanetOpportunityProfileId(input: OpportunityClassInput): string {
  const normalizedType = normalize(input.celestial_body_type);
  const normalizedClass = normalize(input.planet_class);
  const normalizedSubclass = normalize(input.planet_subclass);
  const normalizedBiome = normalize(input.primary_biome ?? input.biome);
  const text = normalize(textFor(input));

  if (normalizedType.includes("asteroid") || normalizedClass.includes("asteroid") || normalizedSubclass.includes("asteroid") || text.includes("debris_field")) {
    return "planet_opportunity_asteroid_belt";
  }
  if (normalizedType.includes("moon") && (text.includes("ocean") || text.includes("coral") || text.includes("abyssal"))) {
    return "planet_opportunity_ocean_moon";
  }
  if (normalizedType.includes("moon") && (text.includes("ice") || text.includes("frozen") || text.includes("glacial") || text.includes("cryo"))) {
    return "planet_opportunity_frozen_moon";
  }
  if (normalizedClass === "gas_giant" && (normalizedSubclass.includes("ice") || normalizedBiome.includes("ice"))) {
    return "planet_opportunity_ice_giant";
  }
  if (text.includes("radioactive") || text.includes("radiation") || text.includes("radiant") || text.includes("ion") || text.includes("charged")) {
    return "planet_opportunity_radioactive";
  }
  if (text.includes("inferno") || text.includes("firestorm") || text.includes("magma_ocean") || text.includes("molten_core")) {
    return "planet_opportunity_inferno";
  }
  if (normalizedClass === "dead" && (normalizedSubclass.includes("barren") || normalizedBiome.includes("barren") || text.includes("airless"))) {
    return "planet_opportunity_barren";
  }

  for (const candidate of [normalizedClass, normalizedSubclass, normalizedBiome]) {
    const profileId = aliasToProfileId.get(candidate);
    if (profileId) return profileId;
  }

  return "planet_opportunity_barren";
}

export function resolvePlanetOpportunityProfile(input: OpportunityClassInput): PlanetOpportunityProfile {
  return profileById.get(resolvePlanetOpportunityProfileId(input)) ?? canonicalPlanetOpportunityProfiles[0];
}

export function validatePlanetOpportunityProfiles(
  profiles: PlanetOpportunityProfile[] = canonicalPlanetOpportunityProfiles,
  generatedBodies: OpportunityClassInput[] = []
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const profileIds = new Set<string>();
  const allRequestedClasses = ["Earth-like", "Ocean", "Forest", "Desert", "Frozen", "Volcanic", "Rocky", "Gas Giant", "Ice Giant", "Artificial", "Exotic", "Barren", "Dead", "Crystal", "Toxic", "Radioactive", "Inferno", "Ocean Moon", "Frozen Moon", "Asteroid Belt"];

  for (const item of profiles) {
    if (profileIds.has(item.id)) {
      issues.push({ severity: "error", code: "planet_opportunity_duplicate_profile", message: "Planet Opportunity Profile IDs must be unique.", records: [item.id] });
    }
    profileIds.add(item.id);
    for (const [key, value] of Object.entries(item.suitability)) {
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        issues.push({ severity: "error", code: "planet_opportunity_invalid_score", message: "Planet Opportunity suitability scores must be normalized 0-100.", records: [item.id, key, String(value)] });
      }
    }
    for (const [key, value] of Object.entries(item.hazardProfile)) {
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        issues.push({ severity: "error", code: "planet_opportunity_invalid_hazard", message: "Planet Opportunity hazard scores must be normalized 0-100.", records: [item.id, key, String(value)] });
      }
    }
    if (!item.recommendedUses.primaryUse || !item.recommendedUses.secondaryUse || !item.recommendedUses.optionalUse) {
      issues.push({ severity: "error", code: "planet_opportunity_missing_uses", message: "Planet Opportunity Profiles must publish primary, secondary, and optional uses.", records: [item.id] });
    }
    if (!item.recommendedActions.length) {
      issues.push({ severity: "error", code: "planet_opportunity_missing_actions", message: "Planet Opportunity Profiles must publish valid player actions.", records: [item.id] });
    }
  }

  for (const planetClass of allRequestedClasses) {
    const resolved = resolvePlanetOpportunityProfileId({ planet_class: planetClass });
    if (!profileIds.has(resolved)) {
      issues.push({ severity: "error", code: "planet_opportunity_class_unresolved", message: "Every requested planet class must resolve to a Planet Opportunity Profile.", records: [planetClass, resolved] });
    }
  }

  for (const body of generatedBodies) {
    const resolved = resolvePlanetOpportunityProfileId(body);
    if (!profileIds.has(resolved)) {
      issues.push({ severity: "error", code: "planet_opportunity_body_unresolved", message: "Every generated celestial body must resolve to a Planet Opportunity Profile.", records: [String((body as { id?: string }).id ?? "unknown"), resolved] });
    }
  }

  return issues;
}
