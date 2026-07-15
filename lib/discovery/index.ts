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
  | "flora"
  | "fauna"
  | "living-systems"
  | "elements"
  | "rare-matter"
  | "exotic-matter"
  | "artifacts"
  | "ancient-alien-technology"
  | "ruins"
  | "signals"
  | "anomalies";

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
    id: "flora",
    displayName: "Flora",
    shortDisplayName: "Flora",
    displayOrder: 1,
    description: "Plantlike discoveries including mosses, fungal flora, aquatic flora, and exotic growths.",
    subcategories: [
      { id: "bioluminescent-flora", displayName: "Bioluminescent Flora", displayOrder: 1 },
      { id: "fungal-flora", displayName: "Fungal Flora", displayOrder: 2 },
      { id: "aquatic-flora", displayName: "Aquatic Flora", displayOrder: 3 },
      { id: "carnivorous-flora", displayName: "Carnivorous Flora", displayOrder: 4 },
      { id: "crystalline-flora", displayName: "Crystalline Flora", displayOrder: 5 }
    ]
  },
  {
    id: "fauna",
    displayName: "Fauna",
    shortDisplayName: "Fauna",
    displayOrder: 2,
    description: "Animal, aerial, aquatic, passive, predatory, and burrowing lifeform discoveries.",
    subcategories: [
      { id: "flying-species", displayName: "Flying Species", displayOrder: 1 },
      { id: "aquatic-life", displayName: "Aquatic Life", displayOrder: 2 },
      { id: "predators", displayName: "Predators", displayOrder: 3 },
      { id: "passive-species", displayName: "Passive Species", displayOrder: 4 },
      { id: "burrowing-species", displayName: "Burrowing Species", displayOrder: 5 }
    ]
  },
  {
    id: "living-systems",
    displayName: "Living Systems",
    shortDisplayName: "Living",
    displayOrder: 3,
    description: "Planet-scale biological networks, ecosystem intelligences, and living infrastructure.",
    subcategories: [
      { id: "mycelial-networks", displayName: "Mycelial Networks", displayOrder: 1 },
      { id: "planetary-intelligences", displayName: "Planetary Intelligences", displayOrder: 2 },
      { id: "ecosystem-networks", displayName: "Ecosystem Networks", displayOrder: 3 },
      { id: "living-machines", displayName: "Living Machines", displayOrder: 4 }
    ]
  },
  {
    id: "elements",
    displayName: "Elements",
    shortDisplayName: "Elements",
    displayOrder: 4,
    description: "Elemental, isotopic, mineral-vein, and atmospheric discoveries used by science and production.",
    subcategories: [
      { id: "cryogenic-deposits", displayName: "Cryogenic Deposits", displayOrder: 1 },
      { id: "isotopes", displayName: "Isotopes", displayOrder: 2 },
      { id: "mineral-veins", displayName: "Mineral Veins", displayOrder: 3 },
      { id: "atmospheric-elements", displayName: "Atmospheric Elements", displayOrder: 4 },
      { id: "fusion-fuels", displayName: "Fusion Fuels", displayOrder: 5 }
    ]
  },
  {
    id: "rare-matter",
    displayName: "Rare Matter",
    shortDisplayName: "Rare Matter",
    displayOrder: 5,
    description: "Rare crystals, energetic minerals, and high-value matter discoveries.",
    subcategories: [
      { id: "energy-crystals", displayName: "Energy Crystals", displayOrder: 1 },
      { id: "rare-crystals", displayName: "Rare Crystals", displayOrder: 2 },
      { id: "exotic-minerals", displayName: "Exotic Minerals", displayOrder: 3 },
      { id: "sensor-materials", displayName: "Sensor Materials", displayOrder: 4 }
    ]
  },
  {
    id: "exotic-matter",
    displayName: "Exotic Matter",
    shortDisplayName: "Exotic",
    displayOrder: 6,
    description: "Dark, quantum, gravitational, and containment-gated matter discoveries.",
    subcategories: [
      { id: "umbral-condensates", displayName: "Umbral Condensates", displayOrder: 1 },
      { id: "dark-matter", displayName: "Dark Matter", displayOrder: 2 },
      { id: "quantum-matter", displayName: "Quantum Matter", displayOrder: 3 },
      { id: "gravitational-matter", displayName: "Gravitational Matter", displayOrder: 4 }
    ]
  },
  {
    id: "artifacts",
    displayName: "Artifacts",
    shortDisplayName: "Artifacts",
    displayOrder: 7,
    description: "Collectible relics, legendary objects, ancient machines, and story-rich civilizational remains.",
    subcategories: [
      { id: "relics", displayName: "Relics", displayOrder: 1 },
      { id: "civilizational-relics", displayName: "Civilizational Relics", displayOrder: 2 },
      { id: "legendary-artifacts", displayName: "Legendary Artifacts", displayOrder: 3 },
      { id: "ancient-machines", displayName: "Ancient Machines", displayOrder: 4 }
    ]
  },
  {
    id: "ancient-alien-technology",
    displayName: "Ancient Alien Technology",
    shortDisplayName: "Alien Tech",
    displayOrder: 8,
    description: "Precursor technology, memory systems, non-human engineering, and decoded alien machines.",
    subcategories: [
      { id: "memory-lattices", displayName: "Memory Lattices", displayOrder: 1 },
      { id: "precursor-technology", displayName: "Precursor Technology", displayOrder: 2 },
      { id: "ancient-alien-technology", displayName: "Ancient Alien Technology", displayOrder: 3 },
      { id: "decoded-machines", displayName: "Decoded Machines", displayOrder: 4 }
    ]
  },
  {
    id: "ruins",
    displayName: "Ruins",
    shortDisplayName: "Ruins",
    displayOrder: 9,
    description: "Ancient ruins, precursor archives, vaults, abandoned colonies, and underground sites.",
    subcategories: [
      { id: "precursor-archives", displayName: "Precursor Archives", displayOrder: 1 },
      { id: "vaults", displayName: "Vaults", displayOrder: 2 },
      { id: "ancient-ruins", displayName: "Ancient Ruins", displayOrder: 3 },
      { id: "underground-sites", displayName: "Underground Sites", displayOrder: 4 },
      { id: "abandoned-colonies", displayName: "Abandoned Colonies", displayOrder: 5 }
    ]
  },
  {
    id: "signals",
    displayName: "Signals",
    shortDisplayName: "Signals",
    displayOrder: 10,
    description: "Unknown signals, deep-space anomalies, beacon trails, and first-contact hooks.",
    subcategories: [
      { id: "unknown-signals", displayName: "Unknown Signals", displayOrder: 1 },
      { id: "deep-space-anomalies", displayName: "Deep Space Anomalies", displayOrder: 2 },
      { id: "signal-triangulation", displayName: "Signal Triangulation", displayOrder: 3 },
      { id: "transmission-echoes", displayName: "Transmission Echoes", displayOrder: 4 },
      { id: "first-contact", displayName: "First Contact", displayOrder: 5 }
    ]
  },
  {
    id: "anomalies",
    displayName: "Anomalies",
    shortDisplayName: "Anomalies",
    displayOrder: 11,
    description: "Planetary, spatial, biological, and temporal anomalies that do not yet fit stable catalog classes.",
    subcategories: [
      { id: "planetary-anomalies", displayName: "Planetary Anomalies", displayOrder: 1 },
      { id: "space-anomalies", displayName: "Space Anomalies", displayOrder: 2 },
      { id: "biological-anomalies", displayName: "Biological Anomalies", displayOrder: 3 },
      { id: "temporal-anomalies", displayName: "Temporal Anomalies", displayOrder: 4 }
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
    id: "DISC-FLORA-LUMEN-MOSS",
    displayName: "Lumen Moss",
    categoryId: "flora",
    subcategoryId: "bioluminescent-flora",
    scientificName: "Luminophyta Noctis",
    description: "A glowing moss that converts trace geothermal radiation into soft blue bioluminescence.",
    lore: "Survey teams first noticed Lumen Moss when cave walls began to pulse softly after a geothermal tremor. Its light is weak, but stable enough to guide explorers through sealed underground habitats.",
    rarity: "common",
    spawnWeight: 0.72,
    discoveryXp: 10,
    creditsValue: 30,
    researchValue: 45,
    tradeValue: 25,
    unlocks: ["collectible_lumen_moss_sample"],
    relatedResearchIds: ["planet_scan", "planetary_ecology"],
    relatedBuildingIds: ["xenobotany-lab"],
    relatedResourceIds: ["resource_biomass", "resource_water"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["bioscanner_basic"],
    requiredScanLevel: 1,
    spawnRules: { biome: ["caves", "temperate-forest", "underground"], weather: ["humidity>60"], waterCoverage: ["moderate", "high"], pointsOfInterest: ["geothermal-vents", "subsurface-caverns"], requiredResearchIds: ["planet_scan"], specialEvents: ["clustered-spawn"] },
    assetProfile: assetProfile("flora_lumen_moss"),
    publicationStatus: "published",
    tags: ["flora", "bioluminescent", "collectible", "clustered", "habitat-art"]
  },
  {
    id: "DISC-FAUNA-AEROVALE-SKIMMER",
    displayName: "Aerovale Skimmer",
    categoryId: "fauna",
    subcategoryId: "flying-species",
    scientificName: "Aerovala membranis",
    description: "A graceful aerial organism that rides atmospheric currents using translucent wing membranes.",
    lore: "Skimmers rarely land. They fold themselves into cliffside mist, then unfold at dawn to follow warm coastal updrafts in long ribboning schools.",
    rarity: "uncommon",
    spawnWeight: 0.22,
    discoveryXp: 35,
    creditsValue: 160,
    researchValue: 90,
    tradeValue: 120,
    unlocks: ["observation_aerovale_skimmer", "dna_sample_aerovale_skimmer"],
    relatedResearchIds: ["planet_scan", "xenobiology"],
    relatedBuildingIds: ["field-biology-station"],
    relatedResourceIds: ["resource_biomass"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: ["DISC-FLORA-LUMEN-MOSS"],
    requiredEquipmentIds: ["bioscanner_basic", "atmospheric_sampler"],
    requiredScanLevel: 2,
    spawnRules: { biome: ["canyons", "coastal", "grasslands"], gravity: ["low"], atmosphere: ["breathable", "dense"], weather: ["steady-winds", "coastal-updrafts"], requiredResearchIds: ["planet_scan"], specialEvents: ["observation", "dna-sample"] },
    assetProfile: assetProfile("fauna_aerovale_skimmer"),
    publicationStatus: "published",
    tags: ["fauna", "flying", "observation", "dna-sample", "low-gravity"]
  },
  {
    id: "DISC-LIVING-MYCELIAL-WORLDNET",
    displayName: "Mycelial World-Net",
    categoryId: "living-systems",
    subcategoryId: "mycelial-networks",
    scientificName: "Mycelia Unitas Planetae",
    description: "A planetary fungal intelligence linking thousands of organisms into one biological communication network.",
    lore: "The World-Net does not speak in words. It reroutes nutrients, modifies blooms, and changes animal migration paths in response to questions asked with patient instruments.",
    rarity: "epic",
    spawnWeight: 0.012,
    discoveryXp: 220,
    creditsValue: 12000,
    researchValue: 8400,
    tradeValue: 18000,
    unlocks: ["research_planetary_ecology", "research_xenobiology", "worldnet_observation_protocol"],
    relatedResearchIds: ["planetary_ecology", "xenobiology"],
    relatedBuildingIds: ["planetary-ecology-center"],
    relatedResourceIds: ["resource_biomass", "resource_water"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: ["DISC-FLORA-LUMEN-MOSS", "DISC-FAUNA-AEROVALE-SKIMMER"],
    requiredEquipmentIds: ["bioscanner_advanced", "ecology_probe"],
    requiredScanLevel: 4,
    spawnRules: { planetClass: ["terrestrial", "garden", "oceanic"], biome: ["fungal-forest", "temperate-forest", "jungle"], waterCoverage: ["moderate", "high"], requiredResearchIds: ["planetary_ecology", "xenobiology"], minimumProgress: 20, specialEvents: ["one-per-eligible-planet"] },
    assetProfile: assetProfile("living_mycelial_worldnet"),
    publicationStatus: "published",
    tags: ["living-system", "planetary-intelligence", "fungal", "one-per-planet"]
  },
  {
    id: "DISC-ELEMENT-HELIUM3-ICEVEIN",
    displayName: "Helium-3 Ice Vein",
    categoryId: "elements",
    subcategoryId: "cryogenic-deposits",
    scientificName: "Helium-3 Cryovenarum",
    description: "A cryogenic isotope vein trapped inside old ice strata and useful for advanced fusion energy.",
    lore: "The vein glitters like trapped dawn beneath ancient ice. Early prospectors call it quiet fire: too cold to touch, too valuable to ignore.",
    rarity: "uncommon",
    spawnWeight: 0.18,
    discoveryXp: 40,
    creditsValue: 420,
    researchValue: 130,
    tradeValue: 900,
    unlocks: ["fusion_fuel_survey"],
    relatedResearchIds: ["resource_scan", "fusion"],
    relatedBuildingIds: ["cryogenic-extractor"],
    relatedResourceIds: ["resource_helium3", "resource_ice", "resource_energy"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["resource_scanner_basic"],
    requiredScanLevel: 2,
    spawnRules: { planetClass: ["frozen", "icy-moon", "asteroid"], temperature: ["cryogenic"], pointsOfInterest: ["ice-veins", "shadowed-craters"], requiredResearchIds: ["resource_scan"], specialEvents: ["fusion-energy-link"] },
    assetProfile: assetProfile("element_helium3_icevein"),
    publicationStatus: "published",
    tags: ["element", "helium-3", "fusion", "energy", "ice"]
  },
  {
    id: "DISC-MINERAL-VESPER-CRYSTAL",
    displayName: "Vesper Crystal",
    categoryId: "rare-matter",
    subcategoryId: "energy-crystals",
    scientificName: "Vesperite Electrum",
    description: "A crystal capable of storing extraordinary electromagnetic energy.",
    lore: "Vesper Crystal hums after sunset, holding the charge of an entire storm in a lattice no larger than a clenched fist.",
    rarity: "rare",
    spawnWeight: 0.055,
    discoveryXp: 80,
    creditsValue: 2800,
    researchValue: 900,
    tradeValue: 5600,
    unlocks: ["vesper_crystal_storage_study"],
    relatedResearchIds: ["energy_storage", "sensors"],
    relatedBuildingIds: ["advanced-sensor-array"],
    relatedResourceIds: ["resource_crystal", "resource_energy"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["resource_scanner_focused"],
    requiredScanLevel: 3,
    spawnRules: { planetClass: ["rocky", "mountain", "desert"], biome: ["highlands", "crystal-fields", "storm-plains"], weather: ["electrical-storms"], volcanism: ["low", "moderate"], requiredResearchIds: ["resource_scan"], specialEvents: ["trade-good", "sensor-material"] },
    assetProfile: assetProfile("mineral_vesper_crystal"),
    publicationStatus: "published",
    tags: ["rare-matter", "energy-storage", "sensors", "trade"]
  },
  {
    id: "DISC-EXOTIC-UMBRAL-CONDENSATE",
    displayName: "Umbral Condensate",
    categoryId: "exotic-matter",
    subcategoryId: "umbral-condensates",
    scientificName: "Umbra Condensata",
    description: "A legendary condensate found only near extreme gravity wells and stabilized artificial worlds.",
    lore: "It beads against containment glass as if falling inward toward a center that is not in the room.",
    rarity: "legendary",
    spawnWeight: 0.0005,
    discoveryXp: 360,
    creditsValue: 90000,
    researchValue: 22000,
    tradeValue: 180000,
    unlocks: ["quantum_containment_protocol"],
    relatedResearchIds: ["quantum_containment"],
    relatedBuildingIds: ["quantum-containment-lab"],
    relatedResourceIds: ["resource_dark_matter", "resource_quantum_crystal"],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["quantum_containment_probe"],
    requiredScanLevel: 6,
    spawnRules: { planetClass: ["artificial-world"], starType: ["black-hole", "neutron-star"], orbit: ["inner", "accretion-edge"], requiredResearchIds: ["quantum_containment"], minimumProgress: 55, specialEvents: ["extreme-gravity", "containment-required"] },
    assetProfile: assetProfile("exotic_umbral_condensate"),
    publicationStatus: "published",
    tags: ["exotic-matter", "legendary", "quantum-containment", "black-hole"]
  },
  {
    id: "DISC-ARTIFACT-SILENT-SUN-ORRERY",
    displayName: "Orrery of the Silent Sun",
    categoryId: "artifacts",
    subcategoryId: "legendary-artifacts",
    scientificName: "Machina Solaris Silentii",
    description: "An ancient mechanical model depicting a star system absent from all modern charts.",
    lore: "The orrery turns even when sealed in vacuum. One missing planet completes an orbit every thirteen days, and no telescope has yet found its star.",
    rarity: "legendary",
    spawnWeight: 0.0007,
    discoveryXp: 420,
    creditsValue: 110000,
    researchValue: 30000,
    tradeValue: 210000,
    unlocks: ["silent_sun_archaeology_thread", "future_story_silent_sun"],
    relatedResearchIds: ["archaeology", "ancient_civilizations"],
    relatedBuildingIds: ["archaeology-lab"],
    relatedResourceIds: [],
    relatedPlanetIds: [],
    relatedCivilizationIds: ["precursor"],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["archaeology_scanner"],
    requiredScanLevel: 5,
    spawnRules: { ancientRuins: "required", planetAge: ["ancient"], pointsOfInterest: ["sealed-vault", "observatory-ruin"], requiredResearchIds: ["archaeology"], minimumProgress: 35, specialEvents: ["future-story"] },
    assetProfile: assetProfile("artifact_silent_sun_orrery"),
    publicationStatus: "published",
    tags: ["artifact", "archaeology", "ancient-civilization", "future-story"]
  },
  {
    id: "DISC-ALIENTECH-PRECURSOR-MEMORY-LATTICE",
    displayName: "Precursor Memory Lattice",
    categoryId: "ancient-alien-technology",
    subcategoryId: "memory-lattices",
    scientificName: "Lattice Memoriam Praecursor",
    description: "A crystalline computational matrix preserving fragmented memories of an extinct civilization.",
    lore: "The lattice does not store data as records. It remembers pressure, fear, translation errors, and the final temperature of a city that no longer exists.",
    rarity: "mythic",
    spawnWeight: 0.0001,
    discoveryXp: 640,
    creditsValue: 0,
    researchValue: 75000,
    tradeValue: 0,
    unlocks: ["memory_lattice_dormant", "memory_lattice_damaged", "memory_lattice_decoded", "memory_lattice_integrated"],
    relatedResearchIds: ["xenoarchaeology", "ancient_civilizations", "quantum_containment"],
    relatedBuildingIds: ["xenoarchive"],
    relatedResourceIds: ["resource_crystal", "resource_quantum_crystal"],
    relatedPlanetIds: [],
    relatedCivilizationIds: ["precursor"],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["xenolinguistic_ai", "quantum_reader"],
    requiredScanLevel: 7,
    spawnRules: { ancientRuins: "required", pointsOfInterest: ["echo-vault", "precursor-archive"], requiredResearchIds: ["xenoarchaeology"], minimumProgress: 70, specialEvents: ["dormant", "damaged", "decoded", "integrated"] },
    assetProfile: assetProfile("alientech_precursor_memory_lattice"),
    publicationStatus: "published",
    tags: ["alien-technology", "precursor", "mythic", "memory", "states"]
  },
  {
    id: "DISC-RUINS-ECHO-VAULT",
    displayName: "Echo Vault",
    categoryId: "ruins",
    subcategoryId: "precursor-archives",
    scientificName: "Archivum Resonans",
    description: "An underground precursor archive whose walls replay electromagnetic echoes of ancient events.",
    lore: "Inside the vault, footsteps return as voices. A lamp raised too high reveals cities, evacuation routes, and faces that vanish when directly observed.",
    rarity: "epic",
    spawnWeight: 0.01,
    discoveryXp: 260,
    creditsValue: 26000,
    researchValue: 12000,
    tradeValue: 0,
    unlocks: ["echo_vault_artifact_search", "echo_vault_lost_data", "DISC-ALIENTECH-PRECURSOR-MEMORY-LATTICE"],
    relatedResearchIds: ["archaeology", "xenoarchaeology"],
    relatedBuildingIds: ["archaeology-lab", "xenoarchive"],
    relatedResourceIds: [],
    relatedPlanetIds: [],
    relatedCivilizationIds: ["precursor"],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["harmonic_scanner", "archaeology_scanner"],
    requiredScanLevel: 5,
    spawnRules: { ancientRuins: "required", biome: ["underground", "caves"], pointsOfInterest: ["precursor-archive", "sealed-vault"], requiredResearchIds: ["archaeology"], minimumProgress: 45, specialEvents: ["artifact-cache", "alien-technology-cache", "lost-data"] },
    assetProfile: assetProfile("ruins_echo_vault"),
    publicationStatus: "published",
    tags: ["ruins", "vault", "precursor", "artifacts", "lost-data"]
  },
  {
    id: "DISC-ANOMALY-PALE-CHORUS",
    displayName: "The Pale Chorus",
    categoryId: "signals",
    subcategoryId: "deep-space-anomalies",
    scientificName: "Chorus Pallidus",
    description: "A repeating signal heard simultaneously across multiple star systems.",
    lore: "No receiver hears the same melody twice, but every decoded interval points inward, toward a triangulation no known map was built to display.",
    rarity: "unique",
    spawnWeight: 0.00001,
    discoveryXp: 1000,
    creditsValue: 0,
    researchValue: 100000,
    tradeValue: 0,
    unlocks: ["unknown_signal", "pale_chorus", "signal_triangulation", "DISC-RUINS-ECHO-VAULT", "DISC-ALIENTECH-PRECURSOR-MEMORY-LATTICE", "future_story"],
    relatedResearchIds: ["deep_space_signals", "signal_triangulation", "xenoarchaeology"],
    relatedBuildingIds: ["deep-space-listening-array"],
    relatedResourceIds: [],
    relatedPlanetIds: [],
    relatedCivilizationIds: ["precursor"],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["deep_space_receiver", "triangulation_array"],
    requiredScanLevel: 7,
    spawnRules: { starSystem: ["multiple"], requiredResearchIds: ["deep_space_signals"], minimumProgress: 65, specialEvents: ["unknown-signal", "pale-chorus", "signal-triangulation"] },
    assetProfile: assetProfile("anomaly_pale_chorus"),
    publicationStatus: "published",
    tags: ["signal", "unique", "story-chain", "deep-space-anomaly", "pale-chorus"]
  }
];

export const discoveryCollections = [
  { id: "primitive-biology", displayName: "Primitive Biology", discoveryIds: ["DISC-FLORA-LUMEN-MOSS", "DISC-FAUNA-AEROVALE-SKIMMER"], milestoneType: "launch" },
  { id: "planetary-flora", displayName: "Planetary Flora", discoveryIds: ["DISC-FLORA-LUMEN-MOSS"], milestoneType: "launch" },
  { id: "planetary-fauna", displayName: "Planetary Fauna", discoveryIds: ["DISC-FAUNA-AEROVALE-SKIMMER"], milestoneType: "launch" },
  { id: "rare-matter", displayName: "Rare Matter", discoveryIds: ["DISC-ELEMENT-HELIUM3-ICEVEIN", "DISC-MINERAL-VESPER-CRYSTAL", "DISC-EXOTIC-UMBRAL-CONDENSATE"], milestoneType: "launch" },
  { id: "artifacts", displayName: "Artifacts", discoveryIds: ["DISC-ARTIFACT-SILENT-SUN-ORRERY", "DISC-RUINS-ECHO-VAULT"], milestoneType: "story" },
  { id: "alien-technology", displayName: "Alien Technology", discoveryIds: ["DISC-ALIENTECH-PRECURSOR-MEMORY-LATTICE", "DISC-RUINS-ECHO-VAULT", "DISC-ARTIFACT-SILENT-SUN-ORRERY"], milestoneType: "story" },
  { id: "living-systems", displayName: "Living Systems", discoveryIds: ["DISC-LIVING-MYCELIAL-WORLDNET"], milestoneType: "expansion" },
  { id: "signals", displayName: "Signals", discoveryIds: ["DISC-ANOMALY-PALE-CHORUS"], milestoneType: "story" }
] as const;

export const discoveryChains = [
  {
    id: "discovery_chain_pale_chorus",
    displayName: "Pale Chorus Signal Chain",
    nodes: [
      { order: 1, discoveryId: "DISC-ANOMALY-PALE-CHORUS", unlocks: ["unknown_signal", "signal_triangulation", "DISC-RUINS-ECHO-VAULT"] },
      { order: 2, discoveryId: "DISC-RUINS-ECHO-VAULT", unlocks: ["DISC-ALIENTECH-PRECURSOR-MEMORY-LATTICE"] },
      { order: 3, discoveryId: "DISC-ALIENTECH-PRECURSOR-MEMORY-LATTICE", unlocks: ["future_story"] }
    ]
  },
  {
    id: "discovery_chain_planetary_biology",
    displayName: "Planetary Biology Chain",
    nodes: [
      { order: 1, discoveryId: "DISC-FLORA-LUMEN-MOSS", unlocks: ["DISC-FAUNA-AEROVALE-SKIMMER"] },
      { order: 2, discoveryId: "DISC-FAUNA-AEROVALE-SKIMMER", unlocks: ["DISC-LIVING-MYCELIAL-WORLDNET"] },
      { order: 3, discoveryId: "DISC-LIVING-MYCELIAL-WORLDNET", unlocks: ["research_planetary_ecology", "research_xenobiology"] }
    ]
  },
  {
    id: "discovery_chain_energy_matter",
    displayName: "Energy Matter Chain",
    nodes: [
      { order: 1, discoveryId: "DISC-ELEMENT-HELIUM3-ICEVEIN", unlocks: ["DISC-MINERAL-VESPER-CRYSTAL"] },
      { order: 2, discoveryId: "DISC-MINERAL-VESPER-CRYSTAL", unlocks: ["DISC-EXOTIC-UMBRAL-CONDENSATE"] },
      { order: 3, discoveryId: "DISC-EXOTIC-UMBRAL-CONDENSATE", unlocks: ["quantum_containment_protocol"] }
    ]
  }
] as const;

export const discoveryMilestones = [
  { id: "alpha-discovery-core", displayName: "Alpha Discovery Core", milestoneType: "alpha", categoryIds: ["flora", "fauna", "elements", "rare-matter", "signals"], targetCount: 120 },
  { id: "beta-living-worlds", displayName: "Beta Living Worlds", milestoneType: "beta", categoryIds: ["flora", "fauna", "living-systems"], targetCount: 400 },
  { id: "launch-discovery-catalog", displayName: "Launch Discovery Catalog", milestoneType: "launch", categoryIds: ["flora", "fauna", "living-systems", "elements", "rare-matter", "artifacts", "ruins"], targetCount: 1200 },
  { id: "story-precursor-thread", displayName: "Story Precursor Thread", milestoneType: "story", categoryIds: ["signals", "ruins", "artifacts", "ancient-alien-technology"], targetCount: 90 },
  { id: "hidden-exotic-matter", displayName: "Hidden Exotic Matter", milestoneType: "hidden", categoryIds: ["exotic-matter"], targetCount: 60 },
  { id: "unique-signals", displayName: "Unique Signals", milestoneType: "developer", categoryIds: ["signals", "anomalies"], targetCount: 25 }
] as const;

export const discoveryPlayerCollectionSchema = {
  id: "discovery_player_collection_schema_v1",
  owner: "game",
  studioOwnership: "canonical_definitions_only",
  studioRule: "Studio publishes canonical discovery objects only. Player completion, discovered counts, journal state, and scan progress belong to the game client/save service.",
  futureStats: [
    { categoryId: "flora", example: "142 / 900" },
    { categoryId: "fauna", example: "381 / 2400" },
    { categoryId: "living-systems", example: "18 / 90" },
    { categoryId: "rare-matter", example: "118 / 118" },
    { categoryId: "ancient-alien-technology", example: "29 / 300" }
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
