export const discoveryRarities = [
  { id: "common", displayName: "Common", displayOrder: 1, defaultSpawnWeight: 1 },
  { id: "uncommon", displayName: "Uncommon", displayOrder: 2, defaultSpawnWeight: 0.35 },
  { id: "rare", displayName: "Rare", displayOrder: 3, defaultSpawnWeight: 0.08 },
  { id: "epic", displayName: "Epic", displayOrder: 4, defaultSpawnWeight: 0.015 },
  { id: "legendary", displayName: "Legendary", displayOrder: 5, defaultSpawnWeight: 0.0005 },
  { id: "mythic", displayName: "Mythic", displayOrder: 6, defaultSpawnWeight: 0.0001 },
  { id: "unique", displayName: "Unique", displayOrder: 7, defaultSpawnWeight: 0.00001 }
] as const;

export type DiscoveryRarityId = typeof discoveryRarities[number]["id"];

export type DiscoveryCategoryId =
  | "artifacts"
  | "lifeforms"
  | "alien-technology"
  | "science"
  | "space-phenomena"
  | "signals"
  | "anomalies"
  | "ruins"
  | "rare-matter"
  | "special";

export type DiscoveryPublicationStatus = "draft" | "approved" | "published" | "hidden";

export type DiscoverySpawnRule = {
  galaxy?: string[];
  sector?: string[];
  starSystem?: string[];
  planetClass?: string[];
  planetSubclass?: string[];
  biome?: string[];
  atmosphere?: string[];
  gravity?: string[];
  temperature?: string[];
  weather?: string[];
  civilizationPresence?: "none" | "possible" | "required";
  settlementPresence?: "none" | "possible" | "required";
  ancientRuins?: "none" | "possible" | "required";
  pointsOfInterest?: string[];
  planetAge?: string[];
  waterCoverage?: string[];
  volcanism?: string[];
  orbit?: string[];
  starType?: string[];
  planetAlignment?: string[];
  requiredResearchIds?: string[];
  requiredEquipmentIds?: string[];
  minimumProgress?: number;
  maximumProgress?: number;
  specialEvents?: string[];
};

export type DiscoveryAssetProfile = {
  icon: string;
  inventoryThumbnail: string;
  card: string;
  hero: string;
  detailIllustration: string;
  worldRender: string;
  discoveryAnimation: string;
  scanAnimation: string;
  sound: string;
  narration: string;
  video: string;
  variants: string[];
};

export type DiscoveryRecord = {
  id: string;
  displayName: string;
  categoryId: DiscoveryCategoryId;
  subcategoryId: string;
  scientificName: string;
  description: string;
  lore: string;
  rarity: DiscoveryRarityId;
  spawnWeight: number;
  discoveryXp: number;
  creditsValue: number;
  researchValue: number;
  tradeValue: number;
  unlocks: string[];
  relatedResearchIds: string[];
  relatedBuildingIds: string[];
  relatedResourceIds: string[];
  relatedPlanetIds: string[];
  relatedCivilizationIds: string[];
  relatedLifeformIds: string[];
  requiredEquipmentIds: string[];
  requiredScanLevel: number;
  spawnRules: DiscoverySpawnRule;
  assetProfile: DiscoveryAssetProfile;
  publicationStatus: DiscoveryPublicationStatus;
  tags: string[];
};

export const discoveryCategories: Array<{
  id: DiscoveryCategoryId;
  displayName: string;
  shortDisplayName: string;
  displayOrder: number;
  description: string;
  subcategories: Array<{ id: string; displayName: string; displayOrder: number }>;
}> = [
  {
    id: "artifacts",
    displayName: "Artifacts",
    shortDisplayName: "Artifacts",
    displayOrder: 1,
    description: "Collectible relics, civilizational remains, and story-rich objects.",
    subcategories: [
      { id: "relics", displayName: "Relics", displayOrder: 1 },
      { id: "civilizational-relics", displayName: "Civilizational Relics", displayOrder: 2 },
      { id: "legendary-artifacts", displayName: "Legendary Artifacts", displayOrder: 3 }
    ]
  },
  {
    id: "lifeforms",
    displayName: "Lifeforms",
    shortDisplayName: "Lifeforms",
    displayOrder: 2,
    description: "Animals, plants, microbial life, fungi, aquatic species, flying species, predators, passive species, intelligent species, ancient species, and extinct species.",
    subcategories: [
      { id: "animals", displayName: "Animals", displayOrder: 1 },
      { id: "plants", displayName: "Plants", displayOrder: 2 },
      { id: "microbial-life", displayName: "Microbial Life", displayOrder: 3 },
      { id: "fungi", displayName: "Fungi", displayOrder: 4 },
      { id: "aquatic-life", displayName: "Aquatic Life", displayOrder: 5 },
      { id: "flying-life", displayName: "Flying Life", displayOrder: 6 },
      { id: "predators", displayName: "Predators", displayOrder: 7 },
      { id: "passive-species", displayName: "Passive Species", displayOrder: 8 },
      { id: "intelligent-species", displayName: "Intelligent Species", displayOrder: 9 },
      { id: "ancient-species", displayName: "Ancient Species", displayOrder: 10 },
      { id: "extinct-species", displayName: "Extinct Species", displayOrder: 11 }
    ]
  },
  {
    id: "alien-technology",
    displayName: "Alien Technology",
    shortDisplayName: "Alien Tech",
    displayOrder: 3,
    description: "Ancient alien technology, precursor machines, living machines, and non-human engineering.",
    subcategories: [
      { id: "ancient-alien-technology", displayName: "Ancient Alien Technology", displayOrder: 1 },
      { id: "precursor-technology", displayName: "Precursor Technology", displayOrder: 2 },
      { id: "living-machines", displayName: "Living Machines", displayOrder: 3 }
    ]
  },
  {
    id: "science",
    displayName: "Science",
    shortDisplayName: "Science",
    displayOrder: 4,
    description: "Elements, compounds, isotopes, minerals, crystals, samples, and energy signatures.",
    subcategories: [
      { id: "elements", displayName: "Elements", displayOrder: 1 },
      { id: "compounds", displayName: "Compounds", displayOrder: 2 },
      { id: "isotopes", displayName: "Isotopes", displayOrder: 3 },
      { id: "minerals", displayName: "Minerals", displayOrder: 4 },
      { id: "crystals", displayName: "Crystals", displayOrder: 5 },
      { id: "energy-signatures", displayName: "Energy Signatures", displayOrder: 6 },
      { id: "atmospheric-samples", displayName: "Atmospheric Samples", displayOrder: 7 },
      { id: "water-samples", displayName: "Water Samples", displayOrder: 8 },
      { id: "soil-samples", displayName: "Soil Samples", displayOrder: 9 },
      { id: "biological-samples", displayName: "Biological Samples", displayOrder: 10 }
    ]
  },
  {
    id: "rare-matter",
    displayName: "Rare Matter",
    shortDisplayName: "Rare Matter",
    displayOrder: 5,
    description: "Rare matter, dark matter, exotic matter, and quantum matter discoveries.",
    subcategories: [
      { id: "rare-matter", displayName: "Rare Matter", displayOrder: 1 },
      { id: "dark-matter", displayName: "Dark Matter", displayOrder: 2 },
      { id: "exotic-matter", displayName: "Exotic Matter", displayOrder: 3 },
      { id: "quantum-matter", displayName: "Quantum Matter", displayOrder: 4 }
    ]
  },
  {
    id: "space-phenomena",
    displayName: "Space Phenomena",
    shortDisplayName: "Space",
    displayOrder: 6,
    description: "Asteroids, comets, nebulae, black holes, pulsars, wormholes, derelicts, abandoned stations, and orbital debris.",
    subcategories: [
      { id: "asteroids", displayName: "Asteroids", displayOrder: 1 },
      { id: "comets", displayName: "Comets", displayOrder: 2 },
      { id: "nebulae", displayName: "Nebulae", displayOrder: 3 },
      { id: "black-holes", displayName: "Black Holes", displayOrder: 4 },
      { id: "pulsars", displayName: "Pulsars", displayOrder: 5 },
      { id: "wormholes", displayName: "Wormholes", displayOrder: 6 },
      { id: "derelict-ships", displayName: "Derelict Ships", displayOrder: 7 },
      { id: "abandoned-stations", displayName: "Abandoned Stations", displayOrder: 8 },
      { id: "orbital-debris", displayName: "Orbital Debris", displayOrder: 9 }
    ]
  },
  {
    id: "signals",
    displayName: "Signals",
    shortDisplayName: "Signals",
    displayOrder: 7,
    description: "Unknown signals, transmissions, beacon trails, and first-contact hooks.",
    subcategories: [
      { id: "unknown-signals", displayName: "Unknown Signals", displayOrder: 1 },
      { id: "first-contact", displayName: "First Contact", displayOrder: 2 }
    ]
  },
  {
    id: "anomalies",
    displayName: "Anomalies",
    shortDisplayName: "Anomalies",
    displayOrder: 8,
    description: "Planetary, spatial, biological, and temporal anomalies.",
    subcategories: [
      { id: "planetary-anomalies", displayName: "Planetary Anomalies", displayOrder: 1 },
      { id: "space-anomalies", displayName: "Space Anomalies", displayOrder: 2 },
      { id: "biological-anomalies", displayName: "Biological Anomalies", displayOrder: 3 }
    ]
  },
  {
    id: "ruins",
    displayName: "Ruins",
    shortDisplayName: "Ruins",
    displayOrder: 9,
    description: "Ancient ruins, alien structures, abandoned colonies, and lost infrastructure.",
    subcategories: [
      { id: "ancient-ruins", displayName: "Ancient Ruins", displayOrder: 1 },
      { id: "alien-structures", displayName: "Alien Structures", displayOrder: 2 },
      { id: "abandoned-colonies", displayName: "Abandoned Colonies", displayOrder: 3 }
    ]
  },
  {
    id: "special",
    displayName: "Special",
    shortDisplayName: "Special",
    displayOrder: 10,
    description: "Unique objects, legendary discoveries, developer events, seasonal discoveries, story discoveries, hidden records, and expansion-pack discoveries.",
    subcategories: [
      { id: "unique-objects", displayName: "Unique Objects", displayOrder: 1 },
      { id: "developer-events", displayName: "Developer Events", displayOrder: 2 },
      { id: "seasonal-discoveries", displayName: "Seasonal Discoveries", displayOrder: 3 },
      { id: "story-discoveries", displayName: "Story Discoveries", displayOrder: 4 }
    ]
  }
];

function assetProfile(id: string): DiscoveryAssetProfile {
  return {
    icon: `discovery_${id}_icon`,
    inventoryThumbnail: `discovery_${id}_thumbnail`,
    card: `discovery_${id}_card`,
    hero: `discovery_${id}_hero`,
    detailIllustration: `discovery_${id}_detail`,
    worldRender: `discovery_${id}_world_render`,
    discoveryAnimation: `discovery_${id}_discovery_animation`,
    scanAnimation: `discovery_${id}_scan_animation`,
    sound: `discovery_${id}_sound`,
    narration: `discovery_${id}_narration`,
    video: `discovery_${id}_video`,
    variants: []
  };
}

export const canonicalDiscoveries: DiscoveryRecord[] = [
  {
    id: "discovery_unknown_signal_echo_01",
    displayName: "Unknown Signal Echo",
    categoryId: "signals",
    subcategoryId: "unknown-signals",
    scientificName: "Signalis ignotus echo-01",
    description: "A repeating non-random signal pattern detected at the edge of a scanned star system.",
    lore: "The first echo is never loud. It is patient, waiting for a civilization advanced enough to hear it.",
    rarity: "uncommon",
    spawnWeight: 0.18,
    discoveryXp: 45,
    creditsValue: 120,
    researchValue: 25,
    tradeValue: 0,
    unlocks: ["discovery_chain_precursor_signal"],
    relatedResearchIds: ["system_scan"],
    relatedBuildingIds: [],
    relatedResourceIds: [],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["scanner_basic"],
    requiredScanLevel: 1,
    spawnRules: { starSystem: ["any"], requiredResearchIds: ["system_scan"], minimumProgress: 0, maximumProgress: 60, specialEvents: ["first-contact-hook"] },
    assetProfile: assetProfile("unknown_signal_echo_01"),
    publicationStatus: "draft",
    tags: ["signal", "first-contact", "chain-start"]
  },
  {
    id: "discovery_precursor_quantum_core",
    displayName: "Precursor Quantum Core",
    categoryId: "alien-technology",
    subcategoryId: "precursor-technology",
    scientificName: "Machina praecursoris quantum",
    description: "A stable ancient core that appears to preserve quantum-state instructions across deep time.",
    lore: "Its casing predates every known civilization signature, but the core still waits for a command it recognizes.",
    rarity: "legendary",
    spawnWeight: 0.0005,
    discoveryXp: 2500,
    creditsValue: 90000,
    researchValue: 12000,
    tradeValue: 175000,
    unlocks: ["research_fusion_technology"],
    relatedResearchIds: ["intergalactic_travel"],
    relatedBuildingIds: ["quantum-research-center"],
    relatedResourceIds: ["resource_dark_matter", "resource_quantum_crystal"],
    relatedPlanetIds: [],
    relatedCivilizationIds: ["precursor"],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["scanner_deep_quantum"],
    requiredScanLevel: 5,
    spawnRules: { ancientRuins: "required", requiredResearchIds: ["intergalactic_travel"], planetAge: ["ancient"], minimumProgress: 45, specialEvents: ["precursor-chain"] },
    assetProfile: assetProfile("precursor_quantum_core"),
    publicationStatus: "draft",
    tags: ["precursor", "quantum", "legendary"]
  },
  {
    id: "discovery_glassreef_megafauna",
    displayName: "Glassreef Megafauna",
    categoryId: "lifeforms",
    subcategoryId: "aquatic-life",
    scientificName: "Vitreoriffa colossus",
    description: "A massive translucent aquatic lifeform whose body filters mineral-rich water into crystalline reef structures.",
    lore: "Colonies report that the reef sings during storms, vibrating through entire ocean basins.",
    rarity: "rare",
    spawnWeight: 0.04,
    discoveryXp: 650,
    creditsValue: 4500,
    researchValue: 1800,
    tradeValue: 9000,
    unlocks: ["biological_sample_glassreef"],
    relatedResearchIds: ["planet_scan"],
    relatedBuildingIds: ["marine-research-lab"],
    relatedResourceIds: ["resource_water", "resource_crystal"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["bioscanner_aquatic"],
    requiredScanLevel: 3,
    spawnRules: { planetClass: ["Ocean", "Earthlike"], biome: ["Ocean", "Coral Reef"], waterCoverage: ["high"], weather: ["storm"], requiredResearchIds: ["planet_scan"] },
    assetProfile: assetProfile("glassreef_megafauna"),
    publicationStatus: "draft",
    tags: ["lifeform", "aquatic", "megafauna"]
  },
  {
    id: "discovery_shadow_bloom_fungi",
    displayName: "Shadow Bloom Fungi",
    categoryId: "lifeforms",
    subcategoryId: "fungi",
    scientificName: "Mycota umbraviva",
    description: "Bioluminescent fungal networks that grow only in mineral caves below tidally locked twilight zones.",
    lore: "The mycelium reacts to observation, dimming when scanned and brightening once left alone.",
    rarity: "uncommon",
    spawnWeight: 0.12,
    discoveryXp: 90,
    creditsValue: 450,
    researchValue: 160,
    tradeValue: 600,
    unlocks: ["biological_sample_shadow_bloom"],
    relatedResearchIds: ["planet_scan"],
    relatedBuildingIds: [],
    relatedResourceIds: ["resource_biomass"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["bioscanner_basic"],
    requiredScanLevel: 2,
    spawnRules: { biome: ["Cave", "Twilight"], atmosphere: ["thin", "breathable"], planetAlignment: ["tidal-locked"], requiredResearchIds: ["planet_scan"] },
    assetProfile: assetProfile("shadow_bloom_fungi"),
    publicationStatus: "draft",
    tags: ["fungi", "biological", "cave"]
  },
  {
    id: "discovery_dark_matter_filament",
    displayName: "Dark Matter Filament",
    categoryId: "rare-matter",
    subcategoryId: "dark-matter",
    scientificName: "Materia obscura filamentum",
    description: "A stable dark-matter filament visible only through gravitational lensing and exotic sensor interference.",
    lore: "The filament bends navigation predictions by a fraction of a heartbeat, enough to reveal routes no map had drawn.",
    rarity: "epic",
    spawnWeight: 0.01,
    discoveryXp: 1400,
    creditsValue: 20000,
    researchValue: 6000,
    tradeValue: 40000,
    unlocks: ["exotic_matter_study"],
    relatedResearchIds: ["resource_scan"],
    relatedBuildingIds: ["quantum-observatory"],
    relatedResourceIds: ["resource_dark_matter"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["gravitic_lens_array"],
    requiredScanLevel: 4,
    spawnRules: { starType: ["neutron", "black-hole-adjacent"], orbit: ["outer"], requiredResearchIds: ["resource_scan"], minimumProgress: 20 },
    assetProfile: assetProfile("dark_matter_filament"),
    publicationStatus: "draft",
    tags: ["dark-matter", "science", "navigation"]
  },
  {
    id: "discovery_orbital_derelict_arc",
    displayName: "Orbital Derelict Arc",
    categoryId: "space-phenomena",
    subcategoryId: "derelict-ships",
    scientificName: "Navis relicta arcus",
    description: "A curved derelict vessel segment in stable orbit, possibly part of a ship larger than any current civilization can build.",
    lore: "The hull has no bridge, no engine room, and no crew quarters. It may have been a rib, not a ship.",
    rarity: "rare",
    spawnWeight: 0.035,
    discoveryXp: 800,
    creditsValue: 6000,
    researchValue: 2400,
    tradeValue: 14000,
    unlocks: ["derelict_salvage_protocol"],
    relatedResearchIds: ["system_scan"],
    relatedBuildingIds: ["orbital-dock"],
    relatedResourceIds: ["resource_titanium", "resource_copper"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["ship_scanner"],
    requiredScanLevel: 3,
    spawnRules: { orbit: ["stable", "outer"], settlementPresence: "none", requiredResearchIds: ["system_scan"], specialEvents: ["salvage"] },
    assetProfile: assetProfile("orbital_derelict_arc"),
    publicationStatus: "draft",
    tags: ["derelict", "salvage", "space"]
  },
  {
    id: "discovery_sapphire_soil_sample",
    displayName: "Sapphire Soil Sample",
    categoryId: "science",
    subcategoryId: "soil-samples",
    scientificName: "Solum sapphirinum",
    description: "A mineral-heavy soil sample containing bright blue crystalline grains and unusual conductivity.",
    lore: "Early explorers mistook the sample for gem dust until it pulsed under a live current.",
    rarity: "common",
    spawnWeight: 0.75,
    discoveryXp: 20,
    creditsValue: 80,
    researchValue: 10,
    tradeValue: 120,
    unlocks: [],
    relatedResearchIds: ["planet_scan"],
    relatedBuildingIds: [],
    relatedResourceIds: ["resource_silicon", "resource_crystal"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["sample_kit_basic"],
    requiredScanLevel: 1,
    spawnRules: { planetClass: ["Rocky", "Desert", "Mountain"], biome: ["Desert", "Highlands"], requiredResearchIds: ["planet_scan"] },
    assetProfile: assetProfile("sapphire_soil_sample"),
    publicationStatus: "draft",
    tags: ["sample", "soil", "mineral"]
  },
  {
    id: "discovery_subsurface_ruin_gate",
    displayName: "Subsurface Ruin Gate",
    categoryId: "ruins",
    subcategoryId: "ancient-ruins",
    scientificName: "Porta subterranea antiqua",
    description: "A buried gate structure that opens into a non-local chamber when exposed to specific harmonic frequencies.",
    lore: "The gate was not built to keep people out. It was built to keep a memory intact.",
    rarity: "epic",
    spawnWeight: 0.008,
    discoveryXp: 1600,
    creditsValue: 25000,
    researchValue: 7500,
    tradeValue: 50000,
    unlocks: ["ancient_ruins_excavation"],
    relatedResearchIds: ["archaeology_protocols"],
    relatedBuildingIds: ["archaeology-lab"],
    relatedResourceIds: [],
    relatedPlanetIds: [],
    relatedCivilizationIds: ["precursor"],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["harmonic_scanner"],
    requiredScanLevel: 4,
    spawnRules: { ancientRuins: "required", planetAge: ["ancient"], pointsOfInterest: ["buried-structure"], requiredResearchIds: ["planet_scan"] },
    assetProfile: assetProfile("subsurface_ruin_gate"),
    publicationStatus: "draft",
    tags: ["ruins", "precursor", "artifact-chain"]
  },
  {
    id: "discovery_solar_crown_anomaly",
    displayName: "Solar Crown Anomaly",
    categoryId: "anomalies",
    subcategoryId: "space-anomalies",
    scientificName: "Corona solis anomala",
    description: "A persistent star-adjacent anomaly that emits stable data-like pulses from within lethal solar winds.",
    lore: "Every pulse repeats the same mathematical greeting in a different base.",
    rarity: "mythic",
    spawnWeight: 0.0001,
    discoveryXp: 6000,
    creditsValue: 200000,
    researchValue: 50000,
    tradeValue: 0,
    unlocks: ["stellar_anomaly_research"],
    relatedResearchIds: ["intergalactic_travel"],
    relatedBuildingIds: ["stellar-observatory"],
    relatedResourceIds: ["resource_solar_plasma"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["stellar_shielded_probe"],
    requiredScanLevel: 6,
    spawnRules: { starType: ["G", "K", "binary"], weather: ["solar-storm"], requiredResearchIds: ["intergalactic_travel"], specialEvents: ["stellar-anomaly"] },
    assetProfile: assetProfile("solar_crown_anomaly"),
    publicationStatus: "hidden",
    tags: ["anomaly", "stellar", "mythic"]
  },
  {
    id: "discovery_first_contact_cipher",
    displayName: "First Contact Cipher",
    categoryId: "special",
    subcategoryId: "story-discoveries",
    scientificName: "Clavis primae contactus",
    description: "A story discovery representing the first successful translation of an intelligent non-human message.",
    lore: "The message is short: We have been hoping you would arrive with questions instead of weapons.",
    rarity: "unique",
    spawnWeight: 0.00001,
    discoveryXp: 10000,
    creditsValue: 0,
    researchValue: 75000,
    tradeValue: 0,
    unlocks: ["first_contact_protocol"],
    relatedResearchIds: ["intergalactic_travel"],
    relatedBuildingIds: ["diplomatic-corps"],
    relatedResourceIds: [],
    relatedPlanetIds: [],
    relatedCivilizationIds: ["unknown_intelligence"],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["xenolinguistic_ai"],
    requiredScanLevel: 7,
    spawnRules: { civilizationPresence: "required", requiredResearchIds: ["intergalactic_travel"], minimumProgress: 70, specialEvents: ["first-contact"] },
    assetProfile: assetProfile("first_contact_cipher"),
    publicationStatus: "hidden",
    tags: ["story", "unique", "first-contact"]
  }
];

export const discoveryCollections = [
  { id: "ancient-civilizations", displayName: "Ancient Civilizations", discoveryIds: ["discovery_precursor_quantum_core", "discovery_subsurface_ruin_gate"], milestoneType: "expansion" },
  { id: "rare-crystals", displayName: "Rare Crystals", discoveryIds: ["discovery_sapphire_soil_sample"], milestoneType: "launch" },
  { id: "ocean-life", displayName: "Ocean Life", discoveryIds: ["discovery_glassreef_megafauna"], milestoneType: "launch" },
  { id: "precursor-technology", displayName: "Precursor Technology", discoveryIds: ["discovery_unknown_signal_echo_01", "discovery_precursor_quantum_core", "discovery_subsurface_ruin_gate"], milestoneType: "expansion" },
  { id: "legendary-artifacts", displayName: "Legendary Artifacts", discoveryIds: ["discovery_precursor_quantum_core"], milestoneType: "hidden" },
  { id: "first-contact", displayName: "First Contact", discoveryIds: ["discovery_unknown_signal_echo_01", "discovery_first_contact_cipher"], milestoneType: "story" },
  { id: "megafauna", displayName: "Megafauna", discoveryIds: ["discovery_glassreef_megafauna"], milestoneType: "seasonal" },
  { id: "exotic-matter", displayName: "Exotic Matter", discoveryIds: ["discovery_dark_matter_filament"], milestoneType: "beta" }
] as const;

export const discoveryChains = [
  {
    id: "discovery_chain_precursor_signal",
    displayName: "Precursor Signal Chain",
    nodes: [
      { order: 1, discoveryId: "discovery_unknown_signal_echo_01", unlocks: ["discovery_subsurface_ruin_gate"] },
      { order: 2, discoveryId: "discovery_subsurface_ruin_gate", unlocks: ["discovery_precursor_quantum_core"] },
      { order: 3, discoveryId: "discovery_precursor_quantum_core", unlocks: ["research_fusion_technology"] }
    ]
  },
  {
    id: "discovery_chain_first_contact",
    displayName: "First Contact Chain",
    nodes: [
      { order: 1, discoveryId: "discovery_unknown_signal_echo_01", unlocks: ["discovery_first_contact_cipher"] },
      { order: 2, discoveryId: "discovery_first_contact_cipher", unlocks: ["first_contact_protocol"] }
    ]
  }
] as const;

export const discoveryMilestones = [
  { id: "alpha-discovery-core", displayName: "Alpha Discovery Core", milestoneType: "alpha", categoryIds: ["artifacts", "science", "signals"], targetCount: 120 },
  { id: "beta-lifeforms", displayName: "Beta Lifeforms", milestoneType: "beta", categoryIds: ["lifeforms"], targetCount: 400 },
  { id: "launch-codex", displayName: "Launch Discovery Codex", milestoneType: "launch", categoryIds: ["artifacts", "lifeforms", "science", "space-phenomena", "signals", "anomalies", "ruins"], targetCount: 1200 },
  { id: "seasonal-signals", displayName: "Seasonal Signals", milestoneType: "seasonal", categoryIds: ["signals", "special"], targetCount: 90 },
  { id: "hidden-precursors", displayName: "Hidden Precursors", milestoneType: "hidden", categoryIds: ["alien-technology", "special"], targetCount: 60 },
  { id: "developer-events", displayName: "Developer Events", milestoneType: "developer", categoryIds: ["special"], targetCount: 25 }
] as const;

export const discoveryPlayerCollectionSchema = {
  id: "discovery_player_collection_schema_v1",
  owner: "game",
  studioOwnership: "canonical_definitions_only",
  studioRule: "Studio publishes canonical discovery objects only. Player completion, discovered counts, journal state, and scan progress belong to the game client/save service.",
  futureStats: [
    { categoryId: "artifacts", example: "142 / 900" },
    { categoryId: "lifeforms", example: "381 / 2400" },
    { categoryId: "science", example: "118 / 118" },
    { categoryId: "alien-technology", example: "29 / 300" },
    { categoryId: "anomalies", example: "18 / 90" }
  ]
};

export function validateDiscoverySystem() {
  const issues: Array<{ severity: "error" | "warning"; code: string; message: string; records: string[] }> = [];
  const categoryIds = new Set(discoveryCategories.map((category) => category.id));
  const rarityIds = new Set(discoveryRarities.map((rarity) => rarity.id));
  const discoveryIds = new Set<string>();
  const duplicateDiscoveryIds = new Set<string>();
  const categoryOrders = new Set<number>();

  for (const category of discoveryCategories) {
    if (categoryOrders.has(category.displayOrder)) {
      issues.push({ severity: "error", code: "duplicate_category_order", message: "Discovery categories must have unique display orders.", records: [category.id] });
    }
    categoryOrders.add(category.displayOrder);
    if (!category.subcategories.length) {
      issues.push({ severity: "error", code: "category_missing_subcategories", message: "Discovery categories must define at least one subcategory.", records: [category.id] });
    }
  }

  for (const discovery of canonicalDiscoveries) {
    if (discoveryIds.has(discovery.id)) duplicateDiscoveryIds.add(discovery.id);
    discoveryIds.add(discovery.id);
    if (!categoryIds.has(discovery.categoryId)) issues.push({ severity: "error", code: "invalid_category", message: "Every discovery must belong to a valid category.", records: [discovery.id, discovery.categoryId] });
    const category = discoveryCategories.find((item) => item.id === discovery.categoryId);
    if (!category?.subcategories.some((item) => item.id === discovery.subcategoryId)) issues.push({ severity: "error", code: "invalid_subcategory", message: "Every discovery must belong to a valid subcategory.", records: [discovery.id, discovery.subcategoryId] });
    if (!rarityIds.has(discovery.rarity)) issues.push({ severity: "error", code: "invalid_rarity", message: "Every discovery must use a valid rarity.", records: [discovery.id, discovery.rarity] });
    if (!(discovery.spawnWeight > 0)) issues.push({ severity: "error", code: "invalid_spawn_weight", message: "Discovery spawn weight must be greater than zero.", records: [discovery.id] });
    if (!discovery.assetProfile.icon || !discovery.assetProfile.card || !discovery.assetProfile.hero) issues.push({ severity: "error", code: "asset_profile_missing", message: "Every discovery must define required asset profile keys.", records: [discovery.id] });
  }

  if (duplicateDiscoveryIds.size) issues.push({ severity: "error", code: "duplicate_discovery_id", message: "Discovery IDs must be unique.", records: [...duplicateDiscoveryIds] });
  for (const collection of discoveryCollections) {
    const missing = collection.discoveryIds.filter((id) => !discoveryIds.has(id));
    if (missing.length) issues.push({ severity: "error", code: "collection_missing_discovery", message: "Discovery collections must reference canonical discoveries.", records: [collection.id, ...missing] });
  }
  for (const chain of discoveryChains) {
    const missing = chain.nodes.map((node) => node.discoveryId).filter((id) => !discoveryIds.has(id));
    if (missing.length) issues.push({ severity: "error", code: "chain_missing_discovery", message: "Discovery chains must reference canonical discoveries.", records: [chain.id, ...missing] });
  }

  return {
    status: issues.some((issue) => issue.severity === "error") ? "Blocked" as const : issues.length ? "Ready With Warnings" as const : "Ready" as const,
    issues
  };
}
