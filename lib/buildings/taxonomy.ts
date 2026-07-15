import type { Building } from "@/types/schema";

export type BuildingTaxonomyFamily = {
  id: string;
  displayName: string;
  displayOrder: number;
  description: string;
  subcategories: Array<{
    id: string;
    displayName: string;
    displayOrder: number;
    aliases?: string[];
    buildingExamples?: string[];
  }>;
};

export type CanonicalBuildingDefinition = {
  id: string;
  displayName: string;
  familyId: string;
  familyName: string;
  subcategoryId: string;
  subcategoryName: string;
  era: string;
  tier: number;
  planetAvailability: string[];
  districtAvailability: string[];
  alignment: string[];
  populationEffects: string[];
  laborEffects: string[];
  creditEffects: string[];
  researchEffects: string[];
  power: {
    produces: string[];
    consumes: string[];
  };
  inputs: string[];
  outputs: string[];
  maintenance: string[];
  upgradePath: string[];
  dependencies: string[];
  unlockRequirements: string[];
  visualAssetRequirements: string[];
  animationRequirements: string[];
  soundRequirements: string[];
  status: "draft";
  tags: string[];
};

export type BuildingClassification = {
  id: string;
  buildingId: string;
  buildingName: string;
  primaryFamilyId: string;
  primaryFamilyName: string;
  subcategoryId: string;
  subcategoryName: string;
  legacyCategory: string;
  era: string;
  civilizationAvailability: string[];
  planetAvailability: string[];
  districtAvailability: string[];
  resourceProducerIds: string[];
  resourceConsumerIds: string[];
  populationEffects: {
    populationBonus: number;
    populationCapacity: number;
    populationGrowth: number;
  };
  researchEffects: {
    researchPerSecond: number;
    researchBonus: number;
  };
  workforceEffects: {
    laborRequirement: number;
    laborPerSecond: number;
  };
  unlockRequirements: {
    researchId: string | null;
    buildingId: string | null;
  };
  upgradePath: string;
  migrationConfidence: "legacy_category_map" | "subcategory_keyword" | "manual_review_required";
};

function sub(id: string, displayName: string, displayOrder: number, aliases: string[] = [], buildingExamples: string[] = []) {
  return { id, displayName, displayOrder, aliases, buildingExamples };
}

function family(id: string, displayName: string, displayOrder: number, description: string, subcategories: ReturnType<typeof sub>[]): BuildingTaxonomyFamily {
  return { id, displayName, displayOrder, description, subcategories };
}

export const canonicalBuildingTaxonomyVersion = "building-taxonomy-v2";
export const canonicalBuildingLibraryVersion = "building-library-v1";

export const canonicalBuildingTaxonomy: BuildingTaxonomyFamily[] = [
  family("population-housing", "Population & Housing", 1, "Population capacity, settlement housing, residential growth, and orbital habitation.", [
    sub("shelters", "Shelters", 1, ["tent", "hut"], ["Tent", "Lean-To Shelter", "Log Cabin", "Emergency Bunker"]),
    sub("housing", "Housing", 2, ["house", "home"], ["House", "Townhouse", "Apartment Block", "High Rise"]),
    sub("advanced-habitats", "Advanced Habitats", 3, ["habitat"], ["Dome Habitat", "Arcology", "Orbital Habitat", "Ring Habitat"]),
    sub("population-services", "Population Services", 4, ["population"])
  ]),
  family("agriculture-food", "Agriculture & Food", 2, "Food production, farming chains, livestock, hydroponics, and synthetic nutrition.", [
    sub("farms", "Farms", 1, ["field"], ["Farm", "Irrigated Farm", "Mechanized Farm", "Automated Farm"]),
    sub("livestock", "Livestock", 2, ["ranch"], ["Ranch", "Pasture", "Dairy Complex", "Bio-Herding Station"]),
    sub("hydroponics", "Hydroponics", 3, ["greenhouse"], ["Greenhouse", "Hydroponics Bay", "Vertical Farm", "Orbital Grow Deck"]),
    sub("food-labs", "Food Labs", 4, ["protein"], ["Food Lab", "Protein Synthesizer", "Nutrient Printer", "Biomass Kitchen"])
  ]),
  family("resource-extraction", "Resource Extraction", 3, "Mining, quarrying, drilling, harvesting, and planetary or asteroid extraction.", [
    sub("mines", "Mines", 1, ["mine", "quarry"], ["Quarry", "Iron Mine", "Deep Mine", "Automated Mine"]),
    sub("wells-drills", "Wells & Drills", 2, ["oil", "gas"], ["Water Well", "Oil Derrick", "Gas Rig", "Cryo Drill"]),
    sub("rare-materials", "Rare Materials", 3, ["crystal"], ["Crystal Mine", "Rare Earth Pit", "Exotic Matter Tap", "Void Mineral Bore"]),
    sub("asteroid-extraction", "Asteroid Extraction", 4, ["asteroid"], ["Asteroid Claim", "Asteroid Mine", "Ore Tug Depot", "Belt Harvester"])
  ]),
  family("manufacturing", "Manufacturing", 4, "Workshops, crafting, refining, assembly, fabrication, and matter production.", [
    sub("workshops", "Workshops", 1, ["workshop", "craft"], ["Workshop", "Stone Workshop", "Forge", "Machine Shop"]),
    sub("factories", "Factories", 2, ["factory"], ["Factory", "Assembly Plant", "Automated Factory", "Smart Factory"]),
    sub("fabricators", "Fabricators", 3, ["fabrication"], ["Fabricator", "Nanofactory", "Matter Assembler", "Molecular Printer"]),
    sub("refineries", "Refineries", 4, ["refinery"], ["Smelter", "Oil Refinery", "Chemical Refinery", "Plasma Refinery"])
  ]),
  family("heavy-industry", "Heavy Industry", 5, "Steel, chemicals, vehicle plants, heavy machinery, and industrial complexes.", [
    sub("steelworks", "Steelworks", 1, ["steel"], ["Bloomery", "Steel Mill", "Alloy Foundry", "Orbital Foundry"]),
    sub("chemicals", "Chemicals", 2, ["chemical"], ["Apothecary Works", "Chemical Plant", "Polymer Complex", "Catalyst Array"]),
    sub("vehicle-plants", "Vehicle Plants", 3, ["vehicle"], ["Cartwright Yard", "Motor Works", "Aerospace Plant", "Gravcraft Plant"]),
    sub("industrial-complexes", "Industrial Complexes", 4, ["industrial"])
  ]),
  family("utilities", "Utilities", 6, "Water, waste, heating, emergency services, and civil utility networks.", [
    sub("water", "Water", 1, ["aqueduct"], ["Well House", "Aqueduct", "Water Treatment Plant", "Atmospheric Condenser"]),
    sub("waste", "Waste", 2, ["sewage"], ["Compost Yard", "Sewer Works", "Recycling Center", "Matter Reclaimer"]),
    sub("thermal", "Thermal", 3, ["heating"], ["Hearth Network", "District Heating", "Thermal Grid", "Climate Exchange"]),
    sub("emergency-utilities", "Emergency Utilities", 4)
  ]),
  family("energy", "Energy", 7, "Power generation, storage, distribution, and advanced civilization energy systems.", [
    sub("primitive-energy", "Primitive Energy", 1, ["campfire"], ["Campfire", "Charcoal Kiln", "Windmill", "Water Wheel"]),
    sub("power-plants", "Power Plants", 2, ["plant"], ["Steam Plant", "Coal Plant", "Solar Farm", "Fusion Reactor"]),
    sub("energy-storage", "Energy Storage", 3, ["battery"], ["Battery Bank", "Grid Storage", "Supercapacitor Array", "Zero-Point Cell"]),
    sub("advanced-reactors", "Advanced Reactors", 4, ["reactor"], ["Antimatter Reactor", "Quantum Reactor", "Dark Energy Tap", "Stellar Core Relay"])
  ]),
  family("transportation", "Transportation", 8, "Roads, rail, ports, airports, transit, and mobility networks.", [
    sub("roads", "Roads", 1, ["road"], ["Trail Network", "Road", "Highway", "Smart Road Grid"]),
    sub("rail", "Rail", 2, ["train"], ["Rail Yard", "Steam Rail", "Maglev Station", "Vacuum Rail"]),
    sub("ports", "Ports", 3, ["harbor"], ["Dock", "Harbor", "Cargo Port", "Oceanic Transfer Hub"]),
    sub("air-transit", "Air Transit", 4, ["airport"], ["Balloon Port", "Airfield", "Airport", "Aerospace Terminal"])
  ]),
  family("logistics", "Logistics", 9, "Warehousing, delivery, supply chains, pipelines, depots, and inventory routing.", [
    sub("storage", "Storage", 1, ["warehouse"], ["Granary", "Warehouse", "Distribution Center", "Autonomous Depot"]),
    sub("supply-routes", "Supply Routes", 2, ["supply"], ["Cart Route", "Supply Depot", "Freight Exchange", "Intermodal Hub"]),
    sub("pipelines", "Pipelines", 3, ["pipeline"], ["Irrigation Ditch", "Pipeline", "Resource Conduit", "Orbital Transfer Line"]),
    sub("automation-logistics", "Automation Logistics", 4, ["drone"])
  ]),
  family("commerce", "Commerce", 10, "Markets, retail, trade centers, corporate offices, and consumer services.", [
    sub("markets", "Markets", 1, ["market"], ["Market", "Trading Post", "Grand Bazaar", "Planetary Exchange"]),
    sub("retail", "Retail", 2, ["store"], ["General Store", "Shopping Arcade", "Commercial Mall", "Virtual Market Hall"]),
    sub("corporate", "Corporate", 3, ["corporate"], ["Guild Office", "Corporate HQ", "MegaCorp Campus", "Stellar Holding Tower"]),
    sub("services", "Services", 4)
  ]),
  family("finance", "Finance", 11, "Banks, exchanges, treasuries, investment systems, and economic institutions.", [
    sub("banks", "Banks", 1, ["bank"], ["Mint", "Bank", "Reserve Bank", "Interstellar Bank"]),
    sub("exchanges", "Exchanges", 2, ["stock"], ["Counting House", "Stock Exchange", "Commodity Exchange", "Galactic Exchange"]),
    sub("treasury", "Treasury", 3, ["tax"], ["Tax Office", "Treasury", "Central Ledger", "Quantum Ledger"]),
    sub("insurance-risk", "Insurance & Risk", 4)
  ]),
  family("research-education", "Research & Education", 12, "Learning, laboratories, universities, observatories, and specialized research facilities.", [
    sub("schools", "Schools", 1, ["school"], ["Schoolhouse", "Academy", "Public School", "Virtual Learning Grid"]),
    sub("libraries", "Libraries", 2, ["library"], ["Archive", "Library", "Grand Library", "Knowledge Vault"]),
    sub("laboratories", "Laboratories", 3, ["lab"], ["Research Lab", "Advanced Lab", "AI Institute", "Quantum Research Center"]),
    sub("universities", "Universities", 4, ["university"], ["College", "University", "Research University", "Stellar University"])
  ]),
  family("government", "Government", 13, "Administration, law, diplomacy, policy, and civic authority.", [
    sub("administration", "Administration", 1, ["town hall"], ["Council Fire", "Town Hall", "City Hall", "Planetary Administration"]),
    sub("law", "Law", 2, ["court"], ["Elder Circle", "Courthouse", "Justice Center", "Interstellar Tribunal"]),
    sub("diplomacy", "Diplomacy", 3, ["embassy"], ["Envoy Camp", "Embassy", "Diplomatic Quarter", "Galactic Consulate"]),
    sub("policy", "Policy", 4)
  ]),
  family("health-medicine", "Health & Medicine", 14, "Clinics, hospitals, biotech, emergency care, and population health.", [
    sub("clinics", "Clinics", 1, ["clinic"], ["Healer Hut", "Clinic", "Medical Office", "Remote Med Pod"]),
    sub("hospitals", "Hospitals", 2, ["hospital"], ["Infirmary", "Hospital", "Medical Center", "Planetary Hospital"]),
    sub("biotech", "Biotech", 3, ["bio"], ["Herbalist Garden", "Biotech Lab", "Gene Clinic", "Regeneration Center"]),
    sub("public-health", "Public Health", 4)
  ]),
  family("culture", "Culture", 15, "Arts, museums, monuments, heritage, media, and public identity.", [
    sub("museums", "Museums", 1, ["museum"], ["Relic Hall", "Museum", "World Museum", "Civilization Archive"]),
    sub("monuments", "Monuments", 2, ["monument"], ["Standing Stone", "Monument", "National Memorial", "Planetary Monument"]),
    sub("arts", "Arts", 3, ["theater"], ["Story Circle", "Theater", "Arts Center", "Holo Arts Forum"]),
    sub("media", "Media", 4)
  ]),
  family("recreation", "Recreation", 16, "Parks, sports, entertainment, leisure, and morale support.", [
    sub("parks", "Parks", 1, ["park"], ["Commons", "Park", "Botanical Park", "Sky Garden"]),
    sub("sports", "Sports", 2, ["arena"], ["Training Field", "Arena", "Stadium", "Gravity Arena"]),
    sub("entertainment", "Entertainment", 3, ["entertainment"], ["Tavern", "Cinema", "Entertainment Dome", "Immersion Theater"]),
    sub("leisure-districts", "Leisure Districts", 4)
  ]),
  family("security", "Security", 17, "Policing, surveillance, emergency response, civil defense, and internal order.", [
    sub("police", "Police", 1, ["police"], ["Watch Post", "Police Station", "Security Precinct", "Autonomous Security Hub"]),
    sub("surveillance", "Surveillance", 2, ["sensor"], ["Lookout", "Sensor Tower", "Monitoring Grid", "Predictive Watch Network"]),
    sub("emergency-response", "Emergency Response", 3, ["fire"], ["Fire Watch", "Fire Station", "Emergency Center", "Disaster AI Center"]),
    sub("civil-defense", "Civil Defense", 4)
  ]),
  family("military-defense", "Military / Defense", 18, "Military bases, fortifications, planetary shields, orbital defense, and fleet support.", [
    sub("fortifications", "Fortifications", 1, ["wall"], ["Palisade", "Fort", "Bunker Network", "Planetary Bastion"]),
    sub("bases", "Bases", 2, ["military"], ["Barracks", "Military Base", "Command Center", "Fleet Command"]),
    sub("defense-grids", "Defense Grids", 3, ["defense"], ["Watchtower", "Defense Grid", "Shield Network", "Orbital Defense Grid"]),
    sub("fleet-support", "Fleet Support", 4)
  ]),
  family("environment", "Environment", 19, "Climate, pollution control, restoration, carbon systems, and environmental safety.", [
    sub("pollution-control", "Pollution Control", 1, ["pollution"], ["Clean Pit", "Filter Plant", "Scrubber Complex", "Atmospheric Purifier"]),
    sub("climate-control", "Climate Control", 2, ["climate"], ["Wind Break", "Weather Station", "Climate Center", "Weather Control Array"]),
    sub("restoration", "Restoration", 3, ["restoration"], ["Replanting Camp", "Restoration Site", "Rewilding Zone", "Planet Repair Node"]),
    sub("carbon-systems", "Carbon Systems", 4)
  ]),
  family("ecology", "Ecology", 20, "Forestry, wildlife, preserves, biodiversity, oceans, and biosphere management.", [
    sub("forestry", "Forestry", 1, ["forest"], ["Woodlot", "Managed Forest", "Carbon Forest", "World Tree Preserve"]),
    sub("wildlife", "Wildlife", 2, ["wildlife"], ["Animal Shelter", "Wildlife Preserve", "Biodome", "Xeno Preserve"]),
    sub("biospheres", "Biospheres", 3, ["biosphere"], ["Nature Dome", "Biosphere", "Closed Ecology Lab", "Planetary Biosphere"]),
    sub("ocean-ecology", "Ocean Ecology", 4)
  ]),
  family("space-infrastructure", "Space Infrastructure", 21, "Launch systems, spaceports, mission control, shipyards, and exploration support.", [
    sub("launch-sites", "Launch Sites", 1, ["launch"], ["Launch Pad", "Rocket Range", "Orbital Launch Complex", "Mass Driver"]),
    sub("spaceports", "Spaceports", 2, ["spaceport"], ["Spaceport", "Orbital Terminal", "Interplanetary Port", "Stellar Port"]),
    sub("mission-control", "Mission Control", 3, ["mission"], ["Mission Control", "Flight Center", "Deep Space Command", "Explorer HQ"]),
    sub("shipyards", "Shipyards", 4, ["shipyard"], ["Dry Dock", "Orbital Shipyard", "Fleet Yard", "Stellar Shipworks"])
  ]),
  family("planetary-infrastructure", "Planetary Infrastructure", 22, "Planet-scale infrastructure, shields, elevators, resource grids, and global works.", [
    sub("planetary-grids", "Planetary Grids", 1, ["grid"], ["Survey Grid", "Utility Grid", "Planetary Grid", "World Grid"]),
    sub("space-elevators", "Space Elevators", 2, ["elevator"], ["Tether Anchor", "Space Elevator", "Orbital Tether", "Skyhook Network"]),
    sub("planetary-shields", "Planetary Shields", 3, ["shield"], ["Storm Wall", "Shield Station", "Planetary Shield", "Aegis Envelope"]),
    sub("global-works", "Global Works", 4)
  ]),
  family("orbital-infrastructure", "Orbital Infrastructure", 23, "Orbital rings, docks, stations, arrays, habitats, and satellite infrastructure.", [
    sub("stations", "Stations", 1, ["station"], ["Orbital Station", "Trade Station", "Science Station", "Habitat Station"]),
    sub("orbital-docks", "Orbital Docks", 2, ["dock"], ["Orbital Dock", "Cargo Dock", "Repair Dock", "Fleet Dock"]),
    sub("orbital-rings", "Orbital Rings", 3, ["ring"], ["Ring Segment", "Orbital Ring", "Transit Ring", "Industrial Ring"]),
    sub("satellite-arrays", "Satellite Arrays", 4)
  ]),
  family("megastructures", "Megastructures", 24, "Dyson systems, ringworlds, stellar engineering, gateways, and endgame construction.", [
    sub("dyson-systems", "Dyson Systems", 1, ["dyson"], ["Dyson Collector", "Dyson Swarm", "Dyson Sphere", "Stellar Shell"]),
    sub("ringworlds", "Ringworlds", 2, ["ringworld"], ["Ring Habitat", "Ringworld Segment", "Ringworld", "Halo World"]),
    sub("stellar-engineering", "Stellar Engineering", 3, ["stellar"], ["Stellar Mirror", "Stellar Forge", "Star Lifter", "Star Engine"]),
    sub("cosmic-gates", "Cosmic Gates", 4, ["gateway"], ["Jump Gate", "Quantum Gate", "Wormhole Anchor", "Galactic Gate"])
  ]),
  family("wonders", "Wonders", 25, "Unique civic, ancient, planetary, space, and civilization wonders.", [
    sub("ancient-wonders", "Ancient Wonders", 1, ["wonder"], ["Great Monument", "Hanging Gardens", "Grand Library Wonder", "Colossus"]),
    sub("civic-wonders", "Civic Wonders", 2, ["civic"], ["World Parliament", "Peace Spire", "Unity Plaza", "Civilization Forum"]),
    sub("planetary-wonders", "Planetary Wonders", 3, ["planetary"], ["World Garden", "Planetary Archive", "Ocean Crown", "Sky Citadel"]),
    sub("space-wonders", "Space Wonders", 4)
  ]),
  family("religious-spiritual", "Religious / Spiritual", 26, "Temples, shrines, pilgrimage, ideology, ritual, and spiritual identity.", [
    sub("shrines", "Shrines", 1, ["shrine"], ["Shrine", "Sacred Grove", "Memorial Shrine", "Star Shrine"]),
    sub("temples", "Temples", 2, ["temple"], ["Temple", "Cathedral", "Great Temple", "Void Chapel"]),
    sub("pilgrimage", "Pilgrimage", 3, ["pilgrim"], ["Pilgrim Camp", "Pilgrimage Road", "Sanctuary City", "Celestial Pilgrimage Port"]),
    sub("ideology-centers", "Ideology Centers", 4)
  ]),
  family("tourism", "Tourism", 27, "Hotels, resorts, attractions, heritage tourism, space tourism, and galactic destinations.", [
    sub("lodging", "Lodging", 1, ["hotel"], ["Inn", "Hotel", "Resort", "Orbital Hotel"]),
    sub("attractions", "Attractions", 2, ["attraction"], ["Fairground", "Theme Park", "Wonder Park", "Zero-G Attraction"]),
    sub("heritage-tourism", "Heritage Tourism", 3, ["heritage"], ["Heritage Trail", "Historic District", "Civilization Museum", "Living History Dome"]),
    sub("space-tourism", "Space Tourism", 4)
  ]),
  family("communications", "Communications", 28, "Messengers, radio, broadcast, quantum relays, and interstellar communication.", [
    sub("messaging", "Messaging", 1, ["messenger"], ["Courier Post", "Postal Office", "Signal Office", "Autonomous Dispatch"]),
    sub("broadcast", "Broadcast", 2, ["radio"], ["Town Crier Platform", "Radio Tower", "Broadcast Center", "Holo Broadcast Hub"]),
    sub("relays", "Relays", 3, ["relay"], ["Signal Relay", "Satellite Relay", "Quantum Relay", "Interstellar Relay"]),
    sub("networks", "Networks", 4)
  ]),
  family("data-computing", "Data & Computing", 29, "Archives, computers, data centers, simulation systems, and civic compute.", [
    sub("archives", "Archives", 1, ["archive"], ["Clay Archive", "Paper Archive", "Digital Archive", "Memory Vault"]),
    sub("data-centers", "Data Centers", 2, ["data"], ["Records Office", "Data Center", "Cloud Campus", "Planetary Data Core"]),
    sub("simulation", "Simulation", 3, ["simulation"], ["Planning Room", "Simulation Lab", "Virtual Twin Center", "Reality Modeler"]),
    sub("compute-grids", "Compute Grids", 4)
  ]),
  family("robotics-automation", "Robotics & Automation", 30, "Robotics, drones, automation, autonomous industry, and service machines.", [
    sub("robotics", "Robotics", 1, ["robot"], ["Clockwork Workshop", "Robotics Lab", "Android Factory", "Synthetic Labor Hub"]),
    sub("drones", "Drones", 2, ["drone"], ["Courier Drone Pad", "Drone Depot", "Autonomous Yard", "Swarm Hangar"]),
    sub("automation", "Automation", 3, ["automation"], ["Water Timer", "Automation Center", "Factory AI Node", "Civil Automation Core"]),
    sub("service-machines", "Service Machines", 4)
  ]),
  family("ai-infrastructure", "AI Infrastructure", 31, "AI cores, cognition systems, agent infrastructure, and governance AI.", [
    sub("ai-cores", "AI Cores", 1, ["ai"], ["Logic Room", "AI Core", "Cognitive Core", "Planetary Mind"]),
    sub("agent-systems", "Agent Systems", 2, ["agent"], ["Clerk Automaton", "Agent Dock", "AI Agent Studio", "Companion Network"]),
    sub("governance-ai", "Governance AI", 3, ["governance"], ["Advisor Room", "Policy AI", "Civic Mind", "Galactic Governance AI"]),
    sub("sentience-safeguards", "Sentience Safeguards", 4)
  ]),
  family("quantum-technology", "Quantum Technology", 32, "Quantum labs, storage, relays, gates, computing, and civilization-scale quantum systems.", [
    sub("quantum-labs", "Quantum Labs", 1, ["quantum"], ["Optics Lab", "Quantum Lab", "Quantum Research Center", "Quantum Singularity Lab"]),
    sub("quantum-computing", "Quantum Computing", 2, ["qubit"], ["Qubit Workshop", "Quantum Computer", "Quantum Compute Campus", "Reality Processor"]),
    sub("quantum-relays", "Quantum Relays", 3, ["entanglement"], ["Entanglement Bench", "Quantum Relay", "Instant Signal Array", "Galactic Entangler"]),
    sub("quantum-gates", "Quantum Gates", 4)
  ]),
  family("nano-technology", "Nano Technology", 33, "Nanomaterials, nanofabrication, microfactories, and molecular systems.", [
    sub("nanomaterials", "Nanomaterials", 1, ["nano"], ["Fine Tools Bench", "Nanomaterial Lab", "Programmable Matter Plant", "Adaptive Matter Forge"]),
    sub("microfactories", "Microfactories", 2, ["micro"], ["Precision Workshop", "Microfactory", "Nano Assembly Floor", "Self-Replicating Plant"]),
    sub("molecular-systems", "Molecular Systems", 3, ["molecular"], ["Glass Lab", "Molecular Printer", "Molecular Foundry", "Atomic Layout Grid"]),
    sub("smart-materials", "Smart Materials", 4)
  ]),
  family("terraforming", "Terraforming", 34, "Atmosphere, water, weather, climate, geology, and biosphere transformation.", [
    sub("atmosphere", "Atmosphere", 1, ["atmosphere"], ["Smoke Stack", "Atmospheric Processor", "Air Seeder", "Sky Engine"]),
    sub("water-worlding", "Water Worlding", 2, ["water"], ["Canal Works", "Ocean Seeder", "Hydrosphere Plant", "World Ocean Engine"]),
    sub("weather-control", "Weather Control", 3, ["weather"], ["Weather Station", "Cloud Seeder", "Weather Control Array", "Climate Orbital"]),
    sub("geological-control", "Geological Control", 4)
  ]),
  family("colonial-development", "Colonial Development", 35, "Outposts, colony hubs, frontier services, and settlement growth.", [
    sub("outposts", "Outposts", 1, ["outpost"], ["Survey Camp", "Frontier Outpost", "Colony Outpost", "Stellar Outpost"]),
    sub("colony-hubs", "Colony Hubs", 2, ["colony"], ["Settlement Core", "Colony Hub", "Colonial Capital", "Core World Hub"]),
    sub("frontier-services", "Frontier Services", 3, ["frontier"], ["Supply Tent", "Frontier Office", "Colonial Services Center", "Settler Network"]),
    sub("expansion-planning", "Expansion Planning", 4)
  ]),
  family("planetary-support", "Planetary Support", 36, "Life support, hazard control, habitability, planetary logistics, and emergency support.", [
    sub("life-support", "Life Support", 1, ["life support"], ["Breathing Shelter", "Life Support Plant", "Planetary Life Grid", "Closed-Loop Support Core"]),
    sub("hazard-control", "Hazard Control", 2, ["hazard"], ["Storm Shelter", "Hazard Control Center", "Radiation Shield Grid", "Anomaly Containment Grid"]),
    sub("habitability", "Habitability", 3, ["habitability"], ["Camp Hearth", "Habitability Station", "Comfort Network", "World Comfort Core"]),
    sub("planetary-emergency", "Planetary Emergency", 4)
  ]),
  family("interstellar-logistics", "Interstellar Logistics", 37, "Jump logistics, stellar depots, convoy systems, and interstellar supply chains.", [
    sub("stellar-depots", "Stellar Depots", 1, ["depot"], ["Waystation", "Stellar Depot", "Fleet Supply Hub", "Galactic Depot"]),
    sub("convoys", "Convoys", 2, ["convoy"], ["Caravan Yard", "Convoy Office", "Stellar Convoy Hub", "Automated Convoy Grid"]),
    sub("jump-logistics", "Jump Logistics", 3, ["jump"], ["Beacon Camp", "Jump Logistics Center", "Jump Gate Yard", "Quantum Route Office"]),
    sub("deep-supply", "Deep Supply", 4)
  ]),
  family("trade-networks", "Trade Networks", 38, "Trade routes, market networks, customs, brokers, and cross-civilization commerce.", [
    sub("trade-routes", "Trade Routes", 1, ["trade route"], ["Trade Route Post", "Route Office", "Trade Corridor Hub", "Galactic Trade Lane"]),
    sub("customs", "Customs", 2, ["customs"], ["Gate Toll", "Customs House", "Planetary Customs", "Interstellar Customs Grid"]),
    sub("brokers", "Brokers", 3, ["broker"], ["Broker Stall", "Trade Broker Office", "Corporate Broker Tower", "Galactic Brokerage"]),
    sub("market-networks", "Market Networks", 4)
  ]),
  family("science-specializations", "Science Specializations", 39, "Focused research branches including astronomy, biology, geology, physics, and xeno studies.", [
    sub("astronomy", "Astronomy", 1, ["observatory"], ["Star Watch", "Observatory", "Deep Sky Observatory", "Extragalactic Array"]),
    sub("biology", "Biology", 2, ["biology"], ["Herbal Lab", "Biology Lab", "Genomics Institute", "Xeno Biology Lab"]),
    sub("geology", "Geology", 3, ["geology"], ["Rock Survey Camp", "Geology Lab", "Planetary Geology Center", "Core Sample Array"]),
    sub("xeno-studies", "Xeno Studies", 4, ["alien", "xeno"], ["Artifact Tent", "Xeno Studies Lab", "Alien Relic Institute", "Precursor Archive"])
  ]),
  family("civilization-special-projects", "Civilization Special Projects", 40, "Scenario, seasonal, alien, endgame, civic, and civilization-scale special projects.", [
    sub("public-works", "Public Works", 1, ["public works"], ["Public Works Yard", "National Works Office", "Planetary Works Bureau", "Civilization Works Core"]),
    sub("special-projects", "Special Projects", 2, ["special"], ["Project Camp", "Special Project Office", "Civilization Project Lab", "Galactic Initiative Center"]),
    sub("scenario-projects", "Scenario Projects", 3, ["scenario"], ["Quest Site", "Scenario Facility", "Seasonal Workshop", "Developer Test Site"]),
    sub("alien-artifacts", "Alien Artifacts", 4, ["artifact"], ["Relic Cache", "Artifact Vault", "Precursor Interface", "Ancient Machine"])
  ])
];

export const legacyBuildingCategoryMapping: Record<string, { familyId: string; subcategoryId: string; notes: string }> = {
  residential: { familyId: "population-housing", subcategoryId: "housing", notes: "Legacy Residential maps to population capacity and housing." },
  production: { familyId: "manufacturing", subcategoryId: "workshops", notes: "Legacy Production maps to workshops/manufacturing production." },
  utility: { familyId: "utilities", subcategoryId: "emergency-utilities", notes: "Legacy Utility maps to utility services until refined." },
  research: { familyId: "research-education", subcategoryId: "laboratories", notes: "Legacy Research maps to research and education facilities." },
  commercial: { familyId: "commerce", subcategoryId: "markets", notes: "Legacy Commercial maps to markets and commerce." },
  culture: { familyId: "culture", subcategoryId: "museums", notes: "Legacy Culture maps to culture facilities." },
  government: { familyId: "government", subcategoryId: "administration", notes: "Legacy Government maps to administration." },
  space: { familyId: "space-infrastructure", subcategoryId: "spaceports", notes: "Legacy Space maps to space infrastructure." },
  specialization: { familyId: "civilization-special-projects", subcategoryId: "public-works", notes: "Legacy Specialization maps to civilization special projects until manually refined." }
};

const keywordSubcategoryRules: Array<{ pattern: RegExp; familyId: string; subcategoryId: string }> = [
  { pattern: /shelter|hut|tent|cabin/i, familyId: "population-housing", subcategoryId: "shelters" },
  { pattern: /house|home|apartment|residence|boarding/i, familyId: "population-housing", subcategoryId: "housing" },
  { pattern: /habitat|arcology/i, familyId: "population-housing", subcategoryId: "advanced-habitats" },
  { pattern: /farm|field|crop/i, familyId: "agriculture-food", subcategoryId: "farms" },
  { pattern: /ranch|pen|livestock|animal/i, familyId: "agriculture-food", subcategoryId: "livestock" },
  { pattern: /greenhouse|hydroponic/i, familyId: "agriculture-food", subcategoryId: "hydroponics" },
  { pattern: /mine|quarry|mining/i, familyId: "resource-extraction", subcategoryId: "mines" },
  { pattern: /oil|gas|drill/i, familyId: "resource-extraction", subcategoryId: "wells-drills" },
  { pattern: /crystal|rare earth|exotic/i, familyId: "resource-extraction", subcategoryId: "rare-materials" },
  { pattern: /workshop|forge|craft/i, familyId: "manufacturing", subcategoryId: "workshops" },
  { pattern: /factory|manufactur|assembly/i, familyId: "manufacturing", subcategoryId: "factories" },
  { pattern: /refin|smelt/i, familyId: "manufacturing", subcategoryId: "refineries" },
  { pattern: /steel|alloy/i, familyId: "heavy-industry", subcategoryId: "steelworks" },
  { pattern: /electronic|vehicle|machine/i, familyId: "heavy-industry", subcategoryId: "vehicle-plants" },
  { pattern: /road|bridge/i, familyId: "transportation", subcategoryId: "roads" },
  { pattern: /power|generator|plant|reactor/i, familyId: "energy", subcategoryId: "power-plants" },
  { pattern: /school/i, familyId: "research-education", subcategoryId: "schools" },
  { pattern: /library/i, familyId: "research-education", subcategoryId: "libraries" },
  { pattern: /lab|laboratory/i, familyId: "research-education", subcategoryId: "laboratories" },
  { pattern: /university/i, familyId: "research-education", subcategoryId: "universities" },
  { pattern: /observatory/i, familyId: "science-specializations", subcategoryId: "astronomy" },
  { pattern: /market|store|shop/i, familyId: "commerce", subcategoryId: "markets" },
  { pattern: /bank|exchange/i, familyId: "finance", subcategoryId: "banks" },
  { pattern: /town hall|city hall|administration/i, familyId: "government", subcategoryId: "administration" },
  { pattern: /court/i, familyId: "government", subcategoryId: "law" },
  { pattern: /clinic|hospital|medical/i, familyId: "health-medicine", subcategoryId: "clinics" },
  { pattern: /park/i, familyId: "recreation", subcategoryId: "parks" },
  { pattern: /museum|monument/i, familyId: "culture", subcategoryId: "museums" },
  { pattern: /police|security/i, familyId: "security", subcategoryId: "police" },
  { pattern: /tower|watch|defense|military/i, familyId: "military-defense", subcategoryId: "defense-grids" },
  { pattern: /launch/i, familyId: "space-infrastructure", subcategoryId: "launch-sites" },
  { pattern: /spaceport/i, familyId: "space-infrastructure", subcategoryId: "spaceports" },
  { pattern: /shipyard/i, familyId: "space-infrastructure", subcategoryId: "shipyards" },
  { pattern: /terraform|atmosphere|weather/i, familyId: "terraforming", subcategoryId: "atmosphere" },
  { pattern: /ruin|archae/i, familyId: "wonders", subcategoryId: "ancient-wonders" },
  { pattern: /alien|xeno|artifact/i, familyId: "science-specializations", subcategoryId: "xeno-studies" },
  { pattern: /forest|nature|wildlife|carbon|pollution/i, familyId: "environment", subcategoryId: "restoration" }
];

function fallbackFamily() {
  return canonicalBuildingTaxonomy.find((family) => family.id === "civilization-special-projects") ?? canonicalBuildingTaxonomy[canonicalBuildingTaxonomy.length - 1];
}

export function buildingTaxonomyFamily(familyId: string) {
  return canonicalBuildingTaxonomy.find((family) => family.id === familyId) ?? fallbackFamily();
}

export function buildingTaxonomySubcategory(familyId: string, subcategoryId: string) {
  const family = buildingTaxonomyFamily(familyId);
  return family.subcategories.find((subcategory) => subcategory.id === subcategoryId) ?? family.subcategories[0];
}

function normalizedLegacyCategory(category: string) {
  return category.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function semanticId(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function defaultBuildingExamples(displayName: string) {
  return [`${displayName} Site`, `${displayName} Facility`, `${displayName} Complex`, `${displayName} Network`];
}

function eraForTier(tier: number) {
  return ["survival", "ancient", "industrial", "space-age"][tier - 1] ?? "modern";
}

function buildCanonicalBuildingLibrary(): CanonicalBuildingDefinition[] {
  return canonicalBuildingTaxonomy.flatMap((familyRow) =>
    familyRow.subcategories.flatMap((subcategory) => {
      const examples = subcategory.buildingExamples?.length ? subcategory.buildingExamples : defaultBuildingExamples(subcategory.displayName);
      return examples.map((displayName, index) => ({
        id: `building_${familyRow.id}_${subcategory.id}_${semanticId(displayName)}`,
        displayName,
        familyId: familyRow.id,
        familyName: familyRow.displayName,
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.displayName,
        era: eraForTier(index + 1),
        tier: index + 1,
        planetAvailability: ["terrestrial", "colony", "specialized-world"],
        districtAvailability: [subcategory.id, familyRow.id],
        alignment: ["any"],
        populationEffects: familyRow.id === "population-housing" || familyRow.id === "health-medicine" ? ["capacity", "growth"] : [],
        laborEffects: familyRow.id === "manufacturing" || familyRow.id === "robotics-automation" ? ["labor-output"] : [],
        creditEffects: familyRow.id === "commerce" || familyRow.id === "finance" || familyRow.id === "trade-networks" ? ["trade-value"] : [],
        researchEffects: familyRow.id === "research-education" || familyRow.id === "science-specializations" ? ["research-output"] : [],
        power: {
          produces: familyRow.id === "energy" ? ["civilization-energy"] : [],
          consumes: familyRow.id === "manufacturing" || familyRow.id === "heavy-industry" || familyRow.id === "data-computing" ? ["civilization-energy"] : []
        },
        inputs: [],
        outputs: [familyRow.id, subcategory.id],
        maintenance: ["credits", "labor"],
        upgradePath: [],
        dependencies: [],
        unlockRequirements: [eraForTier(index + 1)],
        visualAssetRequirements: ["card_art", "workspace_background", "icon"],
        animationRequirements: ["idle", "working"],
        soundRequirements: ["select", "complete"],
        status: "draft" as const,
        tags: [familyRow.id, subcategory.id, `tier-${index + 1}`]
      }));
    })
  ).sort((left, right) => left.familyId.localeCompare(right.familyId) || left.subcategoryId.localeCompare(right.subcategoryId) || left.tier - right.tier || left.id.localeCompare(right.id));
}

export const canonicalBuildingLibrary = buildCanonicalBuildingLibrary();

export function classifyBuilding(building: Building): BuildingClassification {
  const haystack = `${building.name} ${building.description} ${building.category} ${building.notes} ${building.icon_name} ${building.model_name}`.toLowerCase();
  const keywordRule = keywordSubcategoryRules.find((rule) => rule.pattern.test(haystack));
  const legacy = legacyBuildingCategoryMapping[normalizedLegacyCategory(building.category)];
  const familyId = keywordRule?.familyId ?? legacy?.familyId ?? "civilization-special-projects";
  const subcategoryId = keywordRule?.subcategoryId ?? legacy?.subcategoryId ?? "scenario-projects";
  const family = buildingTaxonomyFamily(familyId);
  const subcategory = buildingTaxonomySubcategory(family.id, subcategoryId);
  const produces = [
    building.income_credits_sec > 0 ? "ECON-CREDITS" : null,
    building.income_labor_sec > 0 ? "ECON-LABOR" : null,
    building.income_experimental_sec > 0 ? "ECON-RESEARCH" : null
  ].filter((value): value is string => Boolean(value));
  const consumes = [
    building.cost_credits > 0 ? "ECON-CREDITS" : null,
    building.cost_labor > 0 ? "ECON-LABOR" : null,
    building.cost_experimental > 0 ? "ECON-RESEARCH" : null
  ].filter((value): value is string => Boolean(value));

  return {
    id: `building_classification_${building.id}`,
    buildingId: building.id,
    buildingName: building.name,
    primaryFamilyId: family.id,
    primaryFamilyName: family.displayName,
    subcategoryId: subcategory.id,
    subcategoryName: subcategory.displayName,
    legacyCategory: building.category,
    era: building.era,
    civilizationAvailability: building.civilization ? [building.civilization] : ["any"],
    planetAvailability: ["standard"],
    districtAvailability: building.district_id ? [building.district_id] : ["unassigned"],
    resourceProducerIds: produces,
    resourceConsumerIds: consumes,
    populationEffects: {
      populationBonus: building.population_bonus,
      populationCapacity: building.population_bonus,
      populationGrowth: 0
    },
    researchEffects: {
      researchPerSecond: building.income_experimental_sec,
      researchBonus: 0
    },
    workforceEffects: {
      laborRequirement: building.labor_requirement,
      laborPerSecond: building.income_labor_sec
    },
    unlockRequirements: {
      researchId: building.unlock_research_id,
      buildingId: building.unlock_building
    },
    upgradePath: building.upgrade_chain || "none",
    migrationConfidence: keywordRule ? "subcategory_keyword" : legacy ? "legacy_category_map" : "manual_review_required"
  };
}

export function buildBuildingClassifications(buildings: Building[]) {
  return buildings.map(classifyBuilding).sort((left, right) => {
    const leftFamily = buildingTaxonomyFamily(left.primaryFamilyId);
    const rightFamily = buildingTaxonomyFamily(right.primaryFamilyId);
    return leftFamily.displayOrder - rightFamily.displayOrder || left.subcategoryName.localeCompare(right.subcategoryName) || left.buildingName.localeCompare(right.buildingName);
  });
}

export function validateBuildingTaxonomy(buildings: Building[]) {
  const issues: Array<{ severity: "error" | "warning"; code: string; message: string; records: string[] }> = [];
  const familyIds = new Set(canonicalBuildingTaxonomy.map((family) => family.id));
  const orderValues = canonicalBuildingTaxonomy.map((family) => family.displayOrder);
  const classifications = buildBuildingClassifications(buildings);

  if (canonicalBuildingTaxonomy.length !== 40) {
    issues.push({ severity: "error", code: "building_taxonomy_family_count", message: "Canonical building taxonomy must define exactly 40 primary families.", records: [] });
  }
  if (canonicalBuildingLibrary.length < 500) {
    issues.push({ severity: "error", code: "building_library_count", message: "Canonical building library must provide at least 500 scaffoldable building definitions.", records: [] });
  }
  if (new Set(orderValues).size !== orderValues.length) {
    issues.push({ severity: "error", code: "building_taxonomy_order_duplicate", message: "Building taxonomy family display orders must be unique.", records: [] });
  }
  for (const family of canonicalBuildingTaxonomy) {
    if (family.subcategories.length < 2) {
      issues.push({ severity: "error", code: "building_taxonomy_subcategory_missing", message: `${family.displayName} must include multiple subcategories.`, records: [family.id] });
    }
    const orders = family.subcategories.map((subcategory) => subcategory.displayOrder);
    if (new Set(orders).size !== orders.length) {
      issues.push({ severity: "error", code: "building_taxonomy_subcategory_order_duplicate", message: `${family.displayName} subcategory display orders must be unique.`, records: [family.id] });
    }
  }

  const duplicateAssignments = classifications.filter((classification) => !familyIds.has(classification.primaryFamilyId));
  if (duplicateAssignments.length) {
    issues.push({ severity: "error", code: "building_taxonomy_family_invalid", message: "Some buildings resolve to a taxonomy family that does not exist.", records: duplicateAssignments.map((classification) => classification.buildingId) });
  }

  const missingAssignments = buildings.filter((building) => classifications.filter((classification) => classification.buildingId === building.id).length !== 1);
  if (missingAssignments.length) {
    issues.push({ severity: "error", code: "building_taxonomy_assignment_missing", message: "Every building must resolve to exactly one primary family.", records: missingAssignments.map((building) => building.id) });
  }

  const manualReview = classifications.filter((classification) => classification.migrationConfidence === "manual_review_required");
  if (manualReview.length) {
    issues.push({ severity: "warning", code: "building_taxonomy_manual_review", message: "Some buildings need reviewed manual taxonomy assignment.", records: manualReview.map((classification) => classification.buildingId) });
  }

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
    classifications
  };
}
