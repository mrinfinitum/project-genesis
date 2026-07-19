import curiosityArtworkManifest from "@/data/curiosity-artwork-manifest.json";
import biologicalCuriosityPack from "@/data/curiosity-volume-01-biological.json";
import biologicalCuriosityTaxonomyPack from "@/data/curiosity-volume-01-biological-taxonomy.json";

export const discoveryRarities = [
  { id: "common", displayName: "Common", displayOrder: 1, defaultSpawnWeight: 1 },
  { id: "uncommon", displayName: "Uncommon", displayOrder: 2, defaultSpawnWeight: 0.35 },
  { id: "rare", displayName: "Rare", displayOrder: 3, defaultSpawnWeight: 0.08 },
  { id: "epic", displayName: "Epic", displayOrder: 4, defaultSpawnWeight: 0.015 },
  { id: "legendary", displayName: "Legendary", displayOrder: 5, defaultSpawnWeight: 0.0005 },
  { id: "mythic", displayName: "Mythic", displayOrder: 6, defaultSpawnWeight: 0.0001 },
  { id: "ancient", displayName: "Ancient", displayOrder: 7, defaultSpawnWeight: 0.00003 },
  { id: "unique", displayName: "Unique", displayOrder: 8, defaultSpawnWeight: 0.00001 }
] as const;

export type DiscoveryRarityId = typeof discoveryRarities[number]["id"];

export type DiscoveryCategoryId = string;

export type CuriositySubclass = {
  id: string;
  displayName: string;
  displayOrder: number;
  archived?: boolean;
};

export type CuriosityClass = {
  id: string;
  displayName: string;
  displayOrder: number;
  archived?: boolean;
  subclasses: CuriositySubclass[];
};

export type CuriosityCategory = {
  id: DiscoveryCategoryId;
  displayName: string;
  shortDisplayName: string;
  displayOrder: number;
  description: string;
  archived?: boolean;
  classes: CuriosityClass[];
};

export type CuriosityArtworkStatus = "missing" | "source_only" | "preview_ready" | "artwork_ready";

export type CuriosityArtworkMetadata = {
  curiosityId: string;
  slug: string;
  categoryId: string;
  classId: string;
  subclassId: string;
  relativeArtworkFolder: string;
  sourcePsdFilename: string | null;
  pngPath: string | null;
  webpPath: string | null;
  thumbnailPath: string | null;
  referenceFilenames: string[];
  metadataPath: string | null;
  prompt: string | null;
  negativePrompt: string | null;
  aiModel: string | null;
  generationNotes: string | null;
  artworkVersion: number;
  lastSyncedAt: string;
  status: CuriosityArtworkStatus;
};

type CuriosityArtworkManifest = {
  schemaVersion: string;
  generatedAt: string | null;
  sourceRoot: string | null;
  records: CuriosityArtworkMetadata[];
  reports: {
    matched: number;
    unmatchedFolders: string[];
    missingCuriosityRecords: string[];
    missingSourcePsd: string[];
    missingPreviewDerivatives: string[];
    duplicateMatches: string[];
    invalidClassificationPaths: string[];
  };
};

export const curiosityArtwork = curiosityArtworkManifest as CuriosityArtworkManifest;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function curiositySlug(record: Pick<DiscoveryRecord, "displayName" | "id">) {
  return slugify(record.displayName) || record.id.toLowerCase();
}

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
  slug?: string;
  volumeId?: string;
  volumeName?: string;
  displayName: string;
  categoryId: DiscoveryCategoryId;
  classId: string;
  subclassId: string;
  subcategoryId: string;
  scientificName: string;
  alternateNames?: string[];
  description: string;
  lore: string;
  scientificNotes?: string;
  civilizationNotes?: string;
  discoverySummary?: string;
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
  compatiblePlanetClasses?: string[];
  assetProfile: DiscoveryAssetProfile;
  promptProfile?: {
    masterPrompt?: string;
    prompt?: string;
    negativePrompt?: string;
    aiModel?: string;
    promptVersion?: number;
    referenceImages?: string[];
    generationNotes?: string;
    linkedPromptRecordId?: string;
  };
  publicationStatus: DiscoveryPublicationStatus;
  artworkStatus?: CuriosityArtworkStatus;
  canonicalVersion?: string;
  tags: string[];
};

function subclass(displayName: string, displayOrder: number): CuriositySubclass {
  return { id: slugify(displayName), displayName, displayOrder };
}

function curiosityClass(displayName: string, displayOrder: number, subclasses: string[]): CuriosityClass {
  return { id: slugify(displayName), displayName, displayOrder, subclasses: subclasses.map((item, index) => subclass(item, index + 1)) };
}

function curiosityCategory(displayName: string, displayOrder: number, description: string, classes: Array<[string, string[]]>, shortDisplayName = displayName): CuriosityCategory {
  return {
    id: slugify(displayName),
    displayName,
    shortDisplayName,
    displayOrder,
    description,
    classes: classes.map(([className, subclasses], index) => curiosityClass(className, index + 1, subclasses))
  };
}

type ImportedBiologicalCuriosity = {
  canonical_id: string;
  name: string;
  scientific_name: string;
  category: string;
  class: string;
  subclass: string;
  rarity: string;
  compatible_planet_classes: string[];
  description: string;
  art_prompt: string;
  status: string;
  artwork_status: string;
  source_psd: string;
  preview_image: string;
  tags: string[];
};

type ImportedBiologicalPack = {
  schemaVersion: number;
  volume: number;
  title: string;
  recordCount: number;
  raritySystem: string[];
  records: ImportedBiologicalCuriosity[];
};

type ImportedBiologicalTaxonomyPack = {
  schemaVersion: number;
  taxonomy: Record<string, Record<string, string[]>>;
};

export const biologicalCuriosityVolume = biologicalCuriosityPack as ImportedBiologicalPack;
export const biologicalCuriosityTaxonomy = biologicalCuriosityTaxonomyPack as ImportedBiologicalTaxonomyPack;

const biologicalCategoryAliases: Record<string, string> = {
  Flora: "biological-flora",
  Fauna: "fauna",
  "Organic Materials": "organic-materials",
  "Fossils and Preserved Life": "fossils-and-preserved-life"
};

function importedCategoryId(category: string) {
  return biologicalCategoryAliases[category] ?? slugify(category);
}

function importedRarity(value: string): DiscoveryRarityId {
  const normalized = slugify(value);
  return discoveryRarities.some((rarity) => rarity.id === normalized) ? normalized as DiscoveryRarityId : "common";
}

function importedPublicationStatus(value: string): DiscoveryPublicationStatus {
  const normalized = slugify(value);
  if (["approved", "published", "hidden"].includes(normalized)) return normalized as DiscoveryPublicationStatus;
  return "draft";
}

function importedArtworkStatus(value: string): CuriosityArtworkStatus {
  const normalized = slugify(value);
  if (normalized.includes("ready")) return "artwork_ready";
  if (normalized.includes("preview")) return "preview_ready";
  if (normalized.includes("source")) return "source_only";
  return "missing";
}

function raritySpawnWeight(rarityId: DiscoveryRarityId) {
  return discoveryRarities.find((rarity) => rarity.id === rarityId)?.defaultSpawnWeight ?? 1;
}

function rarityDiscoveryXp(rarityId: DiscoveryRarityId) {
  const rarity = discoveryRarities.find((item) => item.id === rarityId);
  return (rarity?.displayOrder ?? 1) * 25;
}

export const curiosityCategories: CuriosityCategory[] = [
  curiosityCategory("Biological Flora", 1, "Plantlike curiosities including mosses, fungi, trees, vines, flowers, groundcover, seeds, spores, and reef growth.", [
    ["Mosses", ["Bioluminescent Mosses", "Aquatic Mosses", "Crystalline Mosses", "Parasitic Mosses", "Thermal Mosses", "Spore-Bearing Mosses", "Frozen Mosses", "Metallic Mosses"]],
    ["Fungi", ["Cap Fungi", "Shelf Fungi", "Mycelial Networks", "Parasitic Fungi", "Bioluminescent Fungi", "Giant Fungi", "Aquatic Fungi", "Crystal Fungi"]],
    ["Trees", ["Canopy Trees", "Crystal Trees", "Thermal Trees", "Aquatic Trees", "Desert Trees", "Fungal Trees", "Ancient Trees", "Metallic Trees"]],
    ["Vines", ["Climbing Vines", "Carnivorous Vines", "Parasitic Vines", "Bioluminescent Vines", "Aquatic Vines", "Thorned Vines", "Floating Vines", "Mineral-Rooted Vines"]],
    ["Flowers", ["Bioluminescent Flowers", "Carnivorous Flowers", "Aquatic Flowers", "Crystalline Flowers", "Thermal Flowers", "Wind-Pollinated Flowers", "Desert Flowers", "Nocturnal Flowers"]],
    ["Groundcover", ["Grasses", "Reeds", "Groundcover", "Floating Vegetation", "Mineral-Rooted Vegetation", "Spore Fields", "Succulents", "Creeping Mats"]],
    ["Seeds and Spores", ["Seeds", "Spores", "Pods", "Pollen Clusters", "Dormant Growth Cores", "Winged Seeds", "Crystal Seeds", "Thermal Spores"]],
    ["Coral and Reef Life", ["Mineral Coral", "Living Coral", "Bioluminescent Coral", "Thermal Reef Growth", "Floating Coral", "Deep-Sea Coral", "Crystal Reef Growth", "Symbiotic Coral"]]
  ], "Flora"),
  curiosityCategory("Fauna", 2, "Animal, aerial, aquatic, predatory, passive, symbiotic, and parasitic lifeform curiosities.", [
    ["Terrestrial Creatures", ["Small Terrestrial", "Large Terrestrial", "Burrowing", "Herding", "Solitary", "Armored", "Climbing", "Cave-Dwelling"]],
    ["Aerial Creatures", ["Winged", "Gliding", "Floating", "Atmospheric", "Swarming", "High-Altitude", "Storm-Dwelling", "Nocturnal Flyers"]],
    ["Aquatic Creatures", ["Shallow-Water", "Deep-Ocean", "Reef-Dwelling", "Amphibious", "Filter-Feeding", "Leviathan", "Abyssal", "River-Dwelling"]],
    ["Arthropods and Invertebrates", ["Insects", "Arachnid Forms", "Crustacean Forms", "Wormlike Forms", "Mollusk Forms", "Colonial Organisms", "Hive Organisms", "Gelatinous Forms"]],
    ["Predators", ["Ambush Predators", "Pursuit Predators", "Pack Predators", "Aquatic Predators", "Aerial Predators", "Parasitic Predators", "Burrowing Predators", "Apex Predators"]],
    ["Herbivores and Grazers", ["Grazers", "Browsers", "Filter Feeders", "Nectar Feeders", "Mineral Feeders", "Fungivores", "Seed Feeders", "Canopy Feeders"]],
    ["Symbiotic and Parasitic Life", ["Symbiotic", "Parasitic", "Host-Bound", "Colony-Bound", "Mutualistic", "Commensal", "Brood Parasites", "Cleaning Organisms"]],
    ["Microfauna", ["Microscopic Swimmers", "Soil Microfauna", "Atmospheric Microfauna", "Thermal Microfauna", "Cryogenic Microfauna", "Radiotrophic Microfauna", "Crystal-Dwelling Microfauna", "Biofilm Colonies"]]
  ]),
  curiosityCategory("Intelligent Lifeforms", 3, "Primitive, advanced, ancient, and unknown intelligences discovered through survey and exploration.", [
    ["Primitive Lifeforms", ["Tribal", "Nomadic", "Tool-Using", "Aquatic", "Subterranean", "Hive-Based"]],
    ["Advanced Lifeforms", ["Industrial", "Spacefaring", "Synthetic", "Psionic", "Collective Intelligence", "Post-Biological"]],
    ["Ancient Lifeforms", ["Precursor Species", "Dormant Species", "Extinct Species", "Preserved Species", "Ascended Species"]],
    ["Unknown Intelligence", ["Unclassified Organisms", "Signal-Based Intelligence", "Distributed Intelligence", "Planetary Intelligence", "Machine-Life Hybrids"]]
  ], "Lifeforms"),
  curiosityCategory("Minerals", 4, "Mineral, crystal, superconductive, optical, and exotic geological curiosities.", [
    ["Common Minerals", ["Silicates", "Carbonates", "Sulfides", "Oxides", "Salts", "Clays"]],
    ["Rare Minerals", ["Rare Crystals", "Radioactive Minerals", "Piezoelectric Minerals", "Superconductive Minerals", "Optical Minerals"]],
    ["Exotic Minerals", ["Gravity-Reactive Minerals", "Quantum Minerals", "Phase-Shifted Minerals", "Energy-Storing Minerals", "Time-Anomalous Minerals"]],
    ["Crystal Formations", ["Single Crystals", "Crystal Clusters", "Crystal Caverns", "Floating Crystals", "Living Crystals", "Resonant Crystals"]]
  ]),
  curiosityCategory("Ores and Elements", 5, "Industrial, precious, radioactive, atmospheric, and exotic elemental curiosities.", [
    ["Industrial Ores", ["Iron-Bearing", "Copper-Bearing", "Aluminum-Bearing", "Nickel-Bearing", "Titanium-Bearing", "Chromium-Bearing"]],
    ["Precious Ores", ["Gold-Bearing", "Silver-Bearing", "Platinum-Group", "Gem-Bearing"]],
    ["Radioactive Ores", ["Uranium-Bearing", "Thorium-Bearing", "Exotic Isotopes"]],
    ["Atmospheric Elements", ["Noble Gases", "Reactive Gases", "Fuel Gases", "Exotic Atmospheric Compounds"]],
    ["Exotic Elements", ["Stable Superheavy Elements", "Metastable Elements", "Alien Alloys", "Unknown Elements"]]
  ], "Elements"),
  curiosityCategory("Organic Materials", 6, "Biological samples, useful organics, and hazardous organic compounds.", [
    ["Biological Samples", ["Tissue Samples", "Sap", "Venom", "Blood Analogues", "Chitin", "Bone Analogues", "Neural Tissue", "Reproductive Samples"]],
    ["Useful Organics", ["Medicinal Compounds", "Nutrient Compounds", "Fibers", "Resins", "Oils", "Enzymes", "Pigments", "Adhesives"]],
    ["Hazardous Organics", ["Toxins", "Pathogens", "Spores", "Parasites", "Corrosive Secretions", "Neuroactive Compounds", "Hallucinogens", "Mutagens"]],
    ["Biopolymers", ["Elastic Biopolymers", "Armor Biopolymers", "Conductive Biopolymers", "Transparent Biopolymers", "Self-Healing Biopolymers", "Thermal Biopolymers", "Cryogenic Biopolymers", "Memory Biopolymers"]]
  ], "Organics"),
  curiosityCategory("Fossils and Preserved Life", 7, "Fossil, frozen, amber-preserved, and trace evidence of extinct or dormant life.", [
    ["Flora Fossils", ["Petrified Plants", "Seed Fossils", "Spore Fossils", "Root Networks", "Leaf Impressions", "Pollen Beds", "Fossilized Reefs", "Ancient Growth Rings"]],
    ["Fauna Fossils", ["Skeletons", "Shells", "Imprints", "Amber-Preserved Organisms", "Frozen Organisms", "Mineralized Carapaces", "Egg Fossils", "Mass Fossil Beds"]],
    ["Intelligent-Life Fossils", ["Remains", "Burial Sites", "Genetic Archives", "Preserved Specimens", "Cranial Fossils", "Tool-Bearing Remains", "Ritual Interments", "Cloned Remnants"]],
    ["Trace Fossils", ["Tracks", "Burrows", "Nests", "Feeding Marks", "Colony Imprints", "Migration Trails", "Molt Layers", "Coprolite Deposits"]]
  ], "Fossils"),
  curiosityCategory("Ancient Relics", 8, "Civilian, scientific, religious, military, and cultural relics from prior civilizations.", [
    ["Civilian Relics", ["Tools", "Household Objects", "Navigation Devices", "Records", "Currency", "Art Objects"]],
    ["Scientific Relics", ["Instruments", "Data Archives", "Research Devices", "Samples", "Observatories"]],
    ["Religious Relics", ["Idols", "Ceremonial Objects", "Shrines", "Tablets", "Crowns", "Totems"]],
    ["Military Relics", ["Armor", "Weapons", "Defense Systems", "Command Devices", "Fleet Markers"]],
    ["Cultural Relics", ["Music Devices", "Memory Objects", "Artifacts of Governance", "Games", "Symbols", "Language Stones"]]
  ], "Relics"),
  curiosityCategory("Alien Technology", 9, "Alien computation, power, navigation, communication, terraforming, fabrication, and unidentified machines.", [
    ["Computation", ["AI Cores", "Quantum Processors", "Neural Interfaces", "Data Crystals", "Memory Lattices"]],
    ["Power Systems", ["Energy Cores", "Fusion Systems", "Antimatter Systems", "Zero-Point Systems", "Unknown Power Devices"]],
    ["Navigation", ["Star Maps", "Navigation Cores", "Dimensional Compasses", "Jump Calculators", "Orbital Keys"]],
    ["Communication", ["Signal Beacons", "Language Devices", "Long-Range Transmitters", "Quantum Communicators", "Thought Interfaces"]],
    ["Terraforming", ["Atmosphere Devices", "Climate Regulators", "Biosphere Seeders", "Ocean Processors", "Planetary Stabilizers"]],
    ["Fabrication", ["Molecular Forges", "Replicators", "Nanite Systems", "Material Printers", "Assembly Cores"]],
    ["Unknown Technology", ["Unidentified Devices", "Inactive Machines", "Sealed Systems", "Impossible Mechanisms", "Fragmentary Technology"]]
  ], "Alien Tech"),
  curiosityCategory("Energy Sources", 10, "Natural, exotic, biological, and artificial energy-source curiosities.", [
    ["Natural Energy", ["Geothermal", "Solar-Absorbing", "Chemical", "Radioactive", "Magnetic"]],
    ["Exotic Energy", ["Plasma", "Quantum", "Dark Energy", "Vacuum Energy", "Gravitational Energy", "Neutrino Energy"]],
    ["Biological Energy", ["Bioelectric Organisms", "Energy-Producing Flora", "Symbiotic Power Sources", "Living Batteries"]],
    ["Artificial Energy", ["Power Cells", "Ancient Reactors", "Energy Capsules", "Stored Plasma", "Unknown Energy Devices"]]
  ], "Energy"),
  curiosityCategory("Ruins and Structures", 11, "Settlement, scientific, religious, industrial, and unknown structures discovered through exploration.", [
    ["Settlements", ["Villages", "Cities", "Colonies", "Subterranean Settlements", "Floating Settlements"]],
    ["Scientific Structures", ["Laboratories", "Observatories", "Archives", "Test Sites", "Research Stations"]],
    ["Religious Structures", ["Temples", "Shrines", "Monuments", "Burial Structures", "Pilgrimage Sites"]],
    ["Industrial Structures", ["Mines", "Factories", "Refineries", "Power Plants", "Fabrication Complexes"]],
    ["Unknown Structures", ["Monoliths", "Vaults", "Sealed Chambers", "Geometric Complexes", "Impossible Architecture"]]
  ], "Ruins"),
  curiosityCategory("Unknown Objects", 12, "Unknown materials, devices, biological objects, signals, and anomalous objects.", [
    ["Unknown Materials", ["Unclassified Solids", "Unclassified Liquids", "Unclassified Gases", "Phase-Variable Matter", "Self-Organizing Matter"]],
    ["Unknown Devices", ["Sealed Devices", "Inactive Devices", "Responsive Devices", "Signal-Producing Devices", "Self-Repairing Devices"]],
    ["Unknown Biological Objects", ["Eggs", "Cocoons", "Spores", "Dormant Organisms", "Biological Capsules"]],
    ["Unknown Signals", ["Radio Signals", "Gravitational Signals", "Quantum Signals", "Biological Signals", "Repeating Patterns"]],
    ["Anomalous Objects", ["Floating Objects", "Time-Displaced Objects", "Impossible Geometry", "Dimensional Fragments", "Reality-Distorting Objects"]]
  ], "Unknown")
];

export const discoveryCategories = curiosityCategories.map((category) => ({
  id: category.id,
  displayName: category.displayName,
  shortDisplayName: category.shortDisplayName,
  displayOrder: category.displayOrder,
  description: category.description,
  subcategories: category.classes.flatMap((item) => item.subclasses)
}));

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

const coreDiscoveryRecords: DiscoveryRecord[] = [
  {
    id: "DISC-FLORA-LUMEN-MOSS",
    slug: "lumen-moss",
    displayName: "Lumen Moss",
    categoryId: "biological-flora",
    classId: "mosses",
    subclassId: "bioluminescent-mosses",
    subcategoryId: "bioluminescent-mosses",
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
    slug: "aerovale-skimmer",
    displayName: "Aerovale Skimmer",
    categoryId: "fauna",
    classId: "aerial-creatures",
    subclassId: "gliding",
    subcategoryId: "gliding",
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
    slug: "mycelial-world-net",
    displayName: "Mycelial World-Net",
    categoryId: "biological-flora",
    classId: "fungi",
    subclassId: "mycelial-networks",
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
    slug: "helium-3-ice-vein",
    displayName: "Helium-3 Ice Vein",
    categoryId: "ores-and-elements",
    classId: "atmospheric-elements",
    subclassId: "fuel-gases",
    subcategoryId: "fuel-gases",
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
    slug: "vesper-crystal",
    displayName: "Vesper Crystal",
    categoryId: "minerals",
    classId: "exotic-minerals",
    subclassId: "energy-storing-minerals",
    subcategoryId: "energy-storing-minerals",
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
    slug: "umbral-condensate",
    displayName: "Umbral Condensate",
    categoryId: "unknown-objects",
    classId: "anomalous-objects",
    subclassId: "dimensional-fragments",
    subcategoryId: "dimensional-fragments",
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
    slug: "orrery-of-the-silent-sun",
    displayName: "Orrery of the Silent Sun",
    categoryId: "ancient-relics",
    classId: "scientific-relics",
    subclassId: "observatories",
    subcategoryId: "observatories",
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
    slug: "precursor-memory-lattice",
    displayName: "Precursor Memory Lattice",
    categoryId: "alien-technology",
    classId: "computation",
    subclassId: "memory-lattices",
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
    slug: "echo-vault",
    displayName: "Echo Vault",
    categoryId: "ruins-and-structures",
    classId: "scientific-structures",
    subclassId: "archives",
    subcategoryId: "archives",
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
    slug: "the-pale-chorus",
    displayName: "The Pale Chorus",
    categoryId: "unknown-objects",
    classId: "unknown-signals",
    subclassId: "repeating-patterns",
    subcategoryId: "repeating-patterns",
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

function importedBiologicalRecord(record: ImportedBiologicalCuriosity): DiscoveryRecord {
  const rarity = importedRarity(record.rarity);
  const slug = slugify(record.name);
  const categoryId = importedCategoryId(record.category);
  const classId = slugify(record.class);
  const subclassId = slugify(record.subclass);
  const compatiblePlanetClasses = record.compatible_planet_classes.map(slugify).filter(Boolean);
  const tags = Array.from(new Set([
    "biological",
    record.category,
    record.class,
    record.subclass,
    rarity,
    ...record.tags
  ].map(slugify).filter(Boolean)));

  return {
    id: record.canonical_id,
    slug,
    volumeId: "biological",
    volumeName: biologicalCuriosityVolume.title,
    displayName: record.name,
    categoryId,
    classId,
    subclassId,
    subcategoryId: subclassId,
    scientificName: record.scientific_name,
    description: record.description,
    lore: record.description,
    discoverySummary: `${record.name} is a ${record.rarity.toLowerCase()} biological curiosity cataloged in ${record.class} / ${record.subclass}.`,
    rarity,
    spawnWeight: raritySpawnWeight(rarity),
    discoveryXp: rarityDiscoveryXp(rarity),
    creditsValue: rarityDiscoveryXp(rarity) * 12,
    researchValue: rarityDiscoveryXp(rarity) * 8,
    tradeValue: rarityDiscoveryXp(rarity) * 10,
    unlocks: [],
    relatedResearchIds: ["planet_scan", "planetary_ecology"],
    relatedBuildingIds: [],
    relatedResourceIds: [],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: ["bioscanner_basic"],
    requiredScanLevel: Math.max(1, Math.min(8, discoveryRarities.find((item) => item.id === rarity)?.displayOrder ?? 1)),
    compatiblePlanetClasses,
    spawnRules: {
      planetClass: compatiblePlanetClasses,
      requiredResearchIds: ["planet_scan"],
      specialEvents: ["biological-curiosity-volume-01"]
    },
    assetProfile: assetProfile(`bio_${slugify(record.canonical_id)}`),
    promptProfile: {
      prompt: record.art_prompt,
      masterPrompt: record.art_prompt,
      promptVersion: biologicalCuriosityVolume.schemaVersion,
      generationNotes: "Imported from NOVERIS Curiosity Codex Volume I: Biological Curiosities."
    },
    publicationStatus: importedPublicationStatus(record.status),
    artworkStatus: importedArtworkStatus(record.artwork_status),
    canonicalVersion: `volume-${biologicalCuriosityVolume.volume}.schema-${biologicalCuriosityVolume.schemaVersion}`,
    tags
  };
}

export const biologicalCuriosityRecords = biologicalCuriosityVolume.records.map(importedBiologicalRecord);

export const biologicalCuriosityNavigation = Object.entries(biologicalCuriosityTaxonomy.taxonomy).map(([categoryName, classes], categoryIndex) => ({
  id: importedCategoryId(categoryName),
  sourceCategoryName: categoryName,
  displayName: categoryName,
  displayOrder: categoryIndex + 1,
  classes: Object.entries(classes).map(([className, subclasses], classIndex) => ({
    id: slugify(className),
    displayName: className,
    displayOrder: classIndex + 1,
    subclasses: subclasses.map((subclassName, subclassIndex) => ({
      id: slugify(subclassName),
      displayName: subclassName,
      displayOrder: subclassIndex + 1
    }))
  }))
}));

export const canonicalDiscoveries: DiscoveryRecord[] = [
  ...coreDiscoveryRecords,
  ...biologicalCuriosityRecords
];

export function getCuriositiesByVolume(volumeId: string) {
  return canonicalDiscoveries.filter((record) => record.volumeId === volumeId);
}

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
  { id: "alpha-discovery-core", displayName: "Alpha Curiosity Core", milestoneType: "alpha", categoryIds: ["biological-flora", "fauna", "ores-and-elements", "minerals", "unknown-objects"], targetCount: 120 },
  { id: "beta-living-worlds", displayName: "Beta Living Worlds", milestoneType: "beta", categoryIds: ["biological-flora", "fauna", "intelligent-lifeforms"], targetCount: 400 },
  { id: "launch-discovery-catalog", displayName: "Launch Curiosity Catalog", milestoneType: "launch", categoryIds: ["biological-flora", "fauna", "minerals", "ores-and-elements", "ancient-relics", "ruins-and-structures"], targetCount: 1200 },
  { id: "story-precursor-thread", displayName: "Story Precursor Thread", milestoneType: "story", categoryIds: ["unknown-objects", "ruins-and-structures", "ancient-relics", "alien-technology"], targetCount: 90 },
  { id: "hidden-exotic-matter", displayName: "Hidden Exotic Matter", milestoneType: "hidden", categoryIds: ["unknown-objects", "energy-sources"], targetCount: 60 },
  { id: "unique-signals", displayName: "Unique Signals", milestoneType: "developer", categoryIds: ["unknown-objects"], targetCount: 25 }
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

export function getCuriosityClassification(record: Pick<DiscoveryRecord, "categoryId" | "classId" | "subclassId">) {
  const category = curiosityCategories.find((item) => item.id === record.categoryId) ?? null;
  const classRecord = category?.classes.find((item) => item.id === record.classId) ?? null;
  const subclassRecord = classRecord?.subclasses.find((item) => item.id === record.subclassId) ?? null;
  return { category, classRecord, subclassRecord };
}

export function getCuriosityArtwork(record: Pick<DiscoveryRecord, "id" | "displayName">) {
  const slug = curiositySlug(record);
  return curiosityArtwork.records.find((item) => item.curiosityId === record.id || item.slug === slug) ?? null;
}

export function validateDiscoverySystem() {
  const issues: Array<{ severity: "error" | "warning"; code: string; message: string; records: string[] }> = [];
  const categoryIds = new Set(discoveryCategories.map((category) => category.id));
  const rarityIds = new Set(discoveryRarities.map((rarity) => rarity.id));
  const discoveryIds = new Set<string>();
  const duplicateDiscoveryIds = new Set<string>();
  const curiositySlugs = new Set<string>();
  const duplicateCuriositySlugs = new Set<string>();
  const categoryOrders = new Set<number>();

  for (const category of curiosityCategories) {
    if (categoryOrders.has(category.displayOrder)) {
      issues.push({ severity: "error", code: "duplicate_category_order", message: "Curiosity categories must have unique display orders.", records: [category.id] });
    }
    categoryOrders.add(category.displayOrder);
    if (!category.classes.length) {
      issues.push({ severity: "error", code: "category_missing_classes", message: "Curiosity categories must define at least one class.", records: [category.id] });
    }
    const classIds = new Set<string>();
    for (const classRecord of category.classes) {
      if (classIds.has(classRecord.id)) issues.push({ severity: "error", code: "duplicate_class_slug", message: "Curiosity classes must be unique inside a category.", records: [category.id, classRecord.id] });
      classIds.add(classRecord.id);
      if (!classRecord.subclasses.length) issues.push({ severity: "error", code: "class_missing_subclasses", message: "Curiosity classes must define at least one subclass.", records: [category.id, classRecord.id] });
      const subclassIds = new Set<string>();
      for (const subclassRecord of classRecord.subclasses) {
        if (subclassIds.has(subclassRecord.id)) issues.push({ severity: "error", code: "duplicate_subclass_slug", message: "Curiosity subclasses must be unique inside a class.", records: [category.id, classRecord.id, subclassRecord.id] });
        subclassIds.add(subclassRecord.id);
      }
    }
  }

  for (const discovery of canonicalDiscoveries) {
    if (discoveryIds.has(discovery.id)) duplicateDiscoveryIds.add(discovery.id);
    discoveryIds.add(discovery.id);
    const slug = curiositySlug(discovery);
    if (curiositySlugs.has(slug)) duplicateCuriositySlugs.add(slug);
    curiositySlugs.add(slug);
    if (!categoryIds.has(discovery.categoryId)) issues.push({ severity: "error", code: "invalid_category", message: "Every curiosity must belong to a valid category.", records: [discovery.id, discovery.categoryId] });
    const { classRecord, subclassRecord } = getCuriosityClassification(discovery);
    if (!classRecord) issues.push({ severity: "error", code: "invalid_class", message: "Every curiosity must belong to a valid class.", records: [discovery.id, discovery.classId] });
    if (!subclassRecord) issues.push({ severity: "error", code: "invalid_subclass", message: "Every curiosity must belong to a valid subclass.", records: [discovery.id, discovery.subclassId] });
    if (discovery.subcategoryId !== discovery.subclassId) issues.push({ severity: "warning", code: "legacy_subcategory_alias_mismatch", message: "Legacy subcategory alias should match the canonical subclass.", records: [discovery.id, discovery.subcategoryId, discovery.subclassId] });
    if (!rarityIds.has(discovery.rarity)) issues.push({ severity: "error", code: "invalid_rarity", message: "Every curiosity must use a valid rarity.", records: [discovery.id, discovery.rarity] });
    if (!(discovery.spawnWeight > 0)) issues.push({ severity: "error", code: "invalid_spawn_weight", message: "Curiosity spawn weight must be greater than zero.", records: [discovery.id] });
    if (!discovery.assetProfile.icon || !discovery.assetProfile.card || !discovery.assetProfile.hero) issues.push({ severity: "error", code: "asset_profile_missing", message: "Every curiosity must define required asset profile keys.", records: [discovery.id] });
  }

  if (duplicateDiscoveryIds.size) issues.push({ severity: "error", code: "duplicate_discovery_id", message: "Curiosity IDs must be unique.", records: [...duplicateDiscoveryIds] });
  if (duplicateCuriositySlugs.size) issues.push({ severity: "error", code: "duplicate_curiosity_slug", message: "Curiosity slugs must be unique.", records: [...duplicateCuriositySlugs] });
  for (const collection of discoveryCollections) {
    const missing = collection.discoveryIds.filter((id) => !discoveryIds.has(id));
    if (missing.length) issues.push({ severity: "error", code: "collection_missing_discovery", message: "Curiosity collections must reference canonical curiosities.", records: [collection.id, ...missing] });
  }
  for (const chain of discoveryChains) {
    const missing = chain.nodes.map((node) => node.discoveryId).filter((id) => !discoveryIds.has(id));
    if (missing.length) issues.push({ severity: "error", code: "chain_missing_discovery", message: "Curiosity chains must reference canonical curiosities.", records: [chain.id, ...missing] });
  }
  for (const record of curiosityArtwork.records) {
    const match = canonicalDiscoveries.find((discovery) => discovery.id === record.curiosityId || curiositySlug(discovery) === record.slug);
    if (!match) {
      issues.push({ severity: "warning", code: "artwork_missing_curiosity", message: "Curiosity artwork manifest contains a record that does not match a canonical curiosity.", records: [record.curiosityId || record.slug] });
      continue;
    }
    if (record.status === "artwork_ready" && !record.thumbnailPath && !record.webpPath && !record.pngPath) {
      issues.push({ severity: "warning", code: "artwork_missing_preview", message: "Curiosity artwork marked ready should include a browser preview derivative.", records: [match.id] });
    }
  }

  return {
    status: issues.some((issue) => issue.severity === "error") ? "Blocked" as const : issues.length ? "Ready With Warnings" as const : "Ready" as const,
    issues
  };
}
