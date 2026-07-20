import curiosityArtworkManifest from "@/data/curiosity-artwork-manifest.json";
import biologicalCuriosityPack from "@/data/curiosity-volume-01-biological.json";
import biologicalCuriosityTaxonomyPack from "@/data/curiosity-volume-01-biological-taxonomy.json";
import faunaCuriosityPack from "@/data/curiosity-volume-02-fauna.json";
import faunaCuriosityTaxonomyPack from "@/data/curiosity-volume-02-fauna-taxonomy.json";
import geologicalCuriosityPack from "@/data/curiosity-volume-03-geological.json";
import geologicalCuriosityTaxonomyPack from "@/data/curiosity-volume-03-geological-taxonomy.json";
import ancientRelicsCuriosityPack from "@/data/curiosity-volume-04-ancient-relics.json";
import ancientRelicsCuriosityTaxonomyPack from "@/data/curiosity-volume-04-ancient-relics-taxonomy.json";
import alienTechnologyCuriosityPack from "@/data/curiosity-volume-05-alien-technology.json";
import alienTechnologyCuriosityTaxonomyPack from "@/data/curiosity-volume-05-alien-technology-taxonomy.json";
import ruinsStructuresCuriosityPack from "@/data/curiosity-volume-06-ruins-and-structures.json";
import ruinsStructuresCuriosityTaxonomyPack from "@/data/curiosity-volume-06-ruins-and-structures-taxonomy.json";
import energyPhenomenaCuriosityPack from "@/data/curiosity-volume-07-energy-phenomena.json";
import energyPhenomenaCuriosityTaxonomyPack from "@/data/curiosity-volume-07-energy-phenomena-taxonomy.json";
import anomaliesCuriosityPack from "@/data/curiosity-volume-08-anomalies.json";
import anomaliesCuriosityTaxonomyPack from "@/data/curiosity-volume-08-anomalies-taxonomy.json";
import unknownObjectsCuriosityPack from "@/data/curiosity-volume-09-unknown-objects.json";
import unknownObjectsCuriosityTaxonomyPack from "@/data/curiosity-volume-09-unknown-objects-taxonomy.json";

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

export function curiositySlug(record: Pick<DiscoveryRecord, "displayName" | "id"> & { slug?: string }) {
  return record.slug ?? (slugify(record.displayName) || record.id.toLowerCase());
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
  sourceSlug?: string;
  volumeId?: string;
  volumeName?: string;
  displayName: string;
  categoryId: DiscoveryCategoryId;
  classId: string;
  subclassId: string;
  subcategoryId: string;
  scientificName: string;
  catalogName?: string;
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
  requiredResearchLevel?: number;
  discoveryLocation?: string;
  recoveryMethod?: string;
  condition?: string;
  surveyMethod?: string;
  scale?: string;
  operationalState?: string;
  objectState?: string;
  phenomenonState?: string;
  measurementMethod?: string;
  hazardLevel?: string;
  energyIntensity?: number;
  anomalyIntensity?: number;
  unknownSignature?: number;
  durationSeconds?: number;
  spatialVariancePercent?: number;
  temporalVariancePercent?: number;
  realityDistortionPercent?: number;
  observationConfidencePercent?: number;
  functionConfidencePercent?: number;
  realityVariancePercent?: number;
  powerSignature?: number;
  stabilityPercent?: number;
  reverseEngineeringProgressPercent?: number;
  containmentRequirement?: string;
  estimatedAgeYears?: number;
  originConfidencePercent?: number;
  translationProgressPercent?: number;
  integrityPercent?: number;
  structuralIntegrityPercent?: number;
  accessibleAreaPercent?: number;
  mappingProgressPercent?: number;
  museumValue?: number;
  culturalValue?: number;
  historicalValue?: number;
  architecturalValue?: number;
  technologicalValue?: number;
  strategicValue?: number;
  energyValue?: number;
  anomalyValue?: number;
  mysteryValue?: number;
  scientificValue?: number;
  collectionValue?: number;
  repeatable?: boolean;
  maximumKnownInstances?: number;
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

function mergeClassDefinitions(...groups: Array<Array<[string, string[]]>>) {
  const merged = new Map<string, string[]>();
  for (const group of groups) {
    for (const [className, subclasses] of group) {
      const current = merged.get(className) ?? [];
      merged.set(className, [...new Set([...current, ...subclasses])]);
    }
  }
  return [...merged.entries()];
}

type ImportedCuriosity = {
  canonical_id: string;
  name: string;
  slug?: string;
  scientific_name?: string;
  catalog_name?: string;
  category: string;
  class: string;
  subclass: string;
  rarity: string;
  compatible_planet_classes: string[];
  description: string;
  discovery_location?: string;
  collection_method?: string;
  recovery_method?: string;
  condition?: string;
  survey_method?: string;
  scale?: string;
  operational_state?: string;
  object_state?: string;
  phenomenon_state?: string;
  measurement_method?: string;
  hazard_level?: string;
  energy_intensity?: number;
  anomaly_intensity?: number;
  unknown_signature?: number;
  duration_seconds?: number;
  spatial_variance_percent?: number;
  temporal_variance_percent?: number;
  reality_distortion_percent?: number;
  observation_confidence_percent?: number;
  function_confidence_percent?: number;
  reality_variance_percent?: number;
  power_signature?: number;
  stability_percent?: number;
  reverse_engineering_progress_percent?: number;
  containment_requirement?: string;
  estimated_age_years?: number;
  origin_confidence_percent?: number;
  translation_progress_percent?: number;
  integrity_percent?: number;
  structural_integrity_percent?: number;
  accessible_area_percent?: number;
  mapping_progress_percent?: number;
  discovery_chance?: number;
  required_scan_level?: number;
  required_research_level?: number;
  research_xp?: number;
  research_value?: number;
  trade_value?: number;
  museum_value?: number;
  cultural_value?: number;
  historical_value?: number;
  architectural_value?: number;
  technological_value?: number;
  strategic_value?: number;
  energy_value?: number;
  anomaly_value?: number;
  mystery_value?: number;
  scientific_value?: number;
  collection_value?: number;
  repeatable?: boolean;
  maximum_known_instances?: number;
  art_prompt: string;
  negative_prompt?: string;
  status: string;
  artwork_status: string;
  source_psd: string;
  preview_image?: string;
  preview_png?: string;
  preview_webp?: string;
  thumbnail_webp?: string;
  tags: string[];
};

type ImportedCuriosityPack = {
  schemaVersion: number;
  packId?: string;
  volumeId?: string;
  volume?: number;
  title: string;
  version?: string;
  recordCount: number;
  raritySystem: string[];
  records: ImportedCuriosity[];
};

type ImportedCuriosityTaxonomyPack = {
  schemaVersion: number;
  taxonomy: Record<string, Record<string, string[]>>;
};

type CuriosityVolumeImportConfig = {
  volumeId: string;
  defaultTag: string;
  defaultResearchIds: string[];
  defaultEquipmentIds: string[];
  specialEvent: string;
  generationNotes: string;
};

export const biologicalCuriosityVolume = biologicalCuriosityPack as ImportedCuriosityPack;
export const biologicalCuriosityTaxonomy = biologicalCuriosityTaxonomyPack as ImportedCuriosityTaxonomyPack;
export const faunaCuriosityVolume = faunaCuriosityPack as ImportedCuriosityPack;
export const faunaCuriosityTaxonomy = faunaCuriosityTaxonomyPack as ImportedCuriosityTaxonomyPack;
export const geologicalCuriosityVolume = geologicalCuriosityPack as ImportedCuriosityPack;
export const geologicalCuriosityTaxonomy = geologicalCuriosityTaxonomyPack as ImportedCuriosityTaxonomyPack;
export const ancientRelicsCuriosityVolume = ancientRelicsCuriosityPack as ImportedCuriosityPack;
export const ancientRelicsCuriosityTaxonomy = ancientRelicsCuriosityTaxonomyPack as ImportedCuriosityTaxonomyPack;
export const alienTechnologyCuriosityVolume = alienTechnologyCuriosityPack as ImportedCuriosityPack;
export const alienTechnologyCuriosityTaxonomy = alienTechnologyCuriosityTaxonomyPack as ImportedCuriosityTaxonomyPack;
export const ruinsStructuresCuriosityVolume = ruinsStructuresCuriosityPack as ImportedCuriosityPack;
export const ruinsStructuresCuriosityTaxonomy = ruinsStructuresCuriosityTaxonomyPack as ImportedCuriosityTaxonomyPack;
export const energyPhenomenaCuriosityVolume = energyPhenomenaCuriosityPack as ImportedCuriosityPack;
export const energyPhenomenaCuriosityTaxonomy = energyPhenomenaCuriosityTaxonomyPack as ImportedCuriosityTaxonomyPack;
export const anomaliesCuriosityVolume = anomaliesCuriosityPack as ImportedCuriosityPack;
export const anomaliesCuriosityTaxonomy = anomaliesCuriosityTaxonomyPack as ImportedCuriosityTaxonomyPack;
export const unknownObjectsCuriosityVolume = unknownObjectsCuriosityPack as ImportedCuriosityPack;
export const unknownObjectsCuriosityTaxonomy = unknownObjectsCuriosityTaxonomyPack as ImportedCuriosityTaxonomyPack;

const biologicalCategoryAliases: Record<string, string> = {
  Flora: "biological-flora",
  Fauna: "fauna",
  "Organic Materials": "organic-materials",
  "Fossils and Preserved Life": "fossils-and-preserved-life"
};

function importedCategoryId(category: string) {
  return biologicalCategoryAliases[category] ?? slugify(category);
}

function importedVolumeNumber(pack: ImportedCuriosityPack) {
  if (typeof pack.volume === "number") return pack.volume;
  const match = pack.volumeId?.match(/volume-(\d+)/);
  return match ? Number(match[1]) : 0;
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
    ["Terrestrial Creatures", ["Small Terrestrial", "Large Terrestrial", "Burrowing", "Climbing", "Herding", "Solitary", "Armored", "Cave-Dwelling", "Desert-Dwelling", "Tundra-Dwelling"]],
    ["Aerial Creatures", ["Winged", "Gliding", "Floating", "Atmospheric", "Swarming", "High-Altitude", "Storm-Dwelling", "Nocturnal Flyers", "Pollinators", "Aerial Predators"]],
    ["Aquatic Creatures", ["Shallow-Water", "Deep-Ocean", "Reef-Dwelling", "River-Dwelling", "Amphibious", "Filter-Feeding", "Abyssal", "Leviathan", "Gelatinous", "Shell-Bearing"]],
    ["Arthropods and Invertebrates", ["Insects", "Arachnid Forms", "Crustacean Forms", "Wormlike Forms", "Mollusk Forms", "Hive Organisms", "Colonial Organisms", "Gelatinous Forms", "Burrowing Invertebrates", "Parasitic Invertebrates"]],
    ["Predators", ["Ambush Predators", "Pursuit Predators", "Pack Predators", "Aquatic Predators", "Aerial Predators", "Parasitic Predators", "Burrowing Predators", "Venomous Predators", "Camouflaged Predators", "Apex Predators", "Nocturnal Predators"]],
    ["Herbivores and Grazers", ["Grazers", "Browsers", "Filter Feeders", "Nectar Feeders", "Mineral Feeders", "Fungivores", "Seed Feeders", "Canopy Feeders", "Forest Herbivores", "Desert Herbivores", "Aquatic Herbivores"]],
    ["Symbiotic and Parasitic Life", ["Symbiotic", "Parasitic", "Host-Bound", "Colony-Bound", "Mutualistic", "Commensal", "Brood Parasites", "Cleaning Organisms", "Root Symbionts", "Coral Symbionts", "Hive Symbionts"]],
    ["Microfauna", ["Microscopic Swimmers", "Soil Microfauna", "Atmospheric Microfauna", "Aquatic Microfauna", "Thermal Microfauna", "Cryogenic Microfauna", "Radiotrophic Microfauna", "Crystal-Dwelling Microfauna", "Biofilm Colonies", "Magnetic Microfauna", "Symbiotic Microfauna"]]
  ]),
  curiosityCategory("Geological", 3, "Minerals, ores, crystals, gems, rock formations, and exotic planetary materials discovered through survey and sampling.", [
    ["Minerals", ["Silicate Minerals", "Carbonate Minerals", "Sulfide Minerals", "Oxide Minerals", "Halide Minerals", "Phosphate Minerals", "Sulfate Minerals", "Native Elements", "Clay Minerals", "Hydrated Minerals"]],
    ["Ores", ["Ferrous Ores", "Copper Ores", "Nickel Ores", "Titanium Ores", "Aluminum Ores", "Rare-Earth Ores", "Radioactive Ores", "Precious-Metal Ores", "Volatile-Rich Ores", "Exotic-Metal Ores"]],
    ["Crystals", ["Prismatic Crystals", "Luminescent Crystals", "Piezoelectric Crystals", "Thermal Crystals", "Cryogenic Crystals", "Magnetic Crystals", "Resonant Crystals", "Photonic Crystals", "Plasma-Grown Crystals", "Quantum Crystals"]],
    ["Gems", ["Transparent Gems", "Opaque Gems", "Iridescent Gems", "Biogenic Gems", "Meteoric Gems", "Pressure-Formed Gems", "Volcanic Gems", "Oceanic Gems", "Polar Gems", "Exotic Gems"]],
    ["Igneous Formations", ["Basaltic Formations", "Granitic Formations", "Obsidian Fields", "Lava Tubes", "Caldera Deposits", "Magma Chambers", "Pyroclastic Beds", "Volcanic Glass", "Mantle Uplifts", "Impact-Melt Formations"]],
    ["Sedimentary Formations", ["Layered Sandstone", "Carbonate Reefs", "Evaporite Beds", "Shale Deposits", "Deltaic Deposits", "Aeolian Dunes", "Glacial Deposits", "Chemical Sediments", "Organic Sediments", "Deep-Basin Deposits"]],
    ["Metamorphic Formations", ["Slate Formations", "Schist Formations", "Gneiss Formations", "Marble Formations", "Quartzite Formations", "Serpentinite Formations", "High-Pressure Facies", "Contact Metamorphic Zones", "Shear-Zone Rocks", "Shock-Metamorphic Rocks"]],
    ["Exotic Planetary Materials", ["Superdense Matter", "Negative-Mass Minerals", "Phase-Shifted Stone", "Dark-Matter Inclusions", "Gravitic Materials", "Temporal Deposits", "Vacuum Condensates", "Dimensional Fragments", "Neutron-Rich Matter", "Unknown Geological Matter"]]
  ]),
  curiosityCategory("Intelligent Lifeforms", 4, "Primitive, advanced, ancient, and unknown intelligences discovered through survey and exploration.", [
    ["Primitive Lifeforms", ["Tribal", "Nomadic", "Tool-Using", "Aquatic", "Subterranean", "Hive-Based"]],
    ["Advanced Lifeforms", ["Industrial", "Spacefaring", "Synthetic", "Psionic", "Collective Intelligence", "Post-Biological"]],
    ["Ancient Lifeforms", ["Precursor Species", "Dormant Species", "Extinct Species", "Preserved Species", "Ascended Species"]],
    ["Unknown Intelligence", ["Unclassified Organisms", "Signal-Based Intelligence", "Distributed Intelligence", "Planetary Intelligence", "Machine-Life Hybrids"]]
  ], "Lifeforms"),
  curiosityCategory("Minerals", 5, "Mineral, crystal, superconductive, optical, and exotic geological curiosities.", [
    ["Common Minerals", ["Silicates", "Carbonates", "Sulfides", "Oxides", "Salts", "Clays"]],
    ["Rare Minerals", ["Rare Crystals", "Radioactive Minerals", "Piezoelectric Minerals", "Superconductive Minerals", "Optical Minerals"]],
    ["Exotic Minerals", ["Gravity-Reactive Minerals", "Quantum Minerals", "Phase-Shifted Minerals", "Energy-Storing Minerals", "Time-Anomalous Minerals"]],
    ["Crystal Formations", ["Single Crystals", "Crystal Clusters", "Crystal Caverns", "Floating Crystals", "Living Crystals", "Resonant Crystals"]]
  ]),
  curiosityCategory("Ores and Elements", 6, "Industrial, precious, radioactive, atmospheric, and exotic elemental curiosities.", [
    ["Industrial Ores", ["Iron-Bearing", "Copper-Bearing", "Aluminum-Bearing", "Nickel-Bearing", "Titanium-Bearing", "Chromium-Bearing"]],
    ["Precious Ores", ["Gold-Bearing", "Silver-Bearing", "Platinum-Group", "Gem-Bearing"]],
    ["Radioactive Ores", ["Uranium-Bearing", "Thorium-Bearing", "Exotic Isotopes"]],
    ["Atmospheric Elements", ["Noble Gases", "Reactive Gases", "Fuel Gases", "Exotic Atmospheric Compounds"]],
    ["Exotic Elements", ["Stable Superheavy Elements", "Metastable Elements", "Alien Alloys", "Unknown Elements"]]
  ], "Elements"),
  curiosityCategory("Organic Materials", 7, "Biological samples, useful organics, and hazardous organic compounds.", [
    ["Biological Samples", ["Tissue Samples", "Sap", "Venom", "Blood Analogues", "Chitin", "Bone Analogues", "Neural Tissue", "Reproductive Samples"]],
    ["Useful Organics", ["Medicinal Compounds", "Nutrient Compounds", "Fibers", "Resins", "Oils", "Enzymes", "Pigments", "Adhesives"]],
    ["Hazardous Organics", ["Toxins", "Pathogens", "Spores", "Parasites", "Corrosive Secretions", "Neuroactive Compounds", "Hallucinogens", "Mutagens"]],
    ["Biopolymers", ["Elastic Biopolymers", "Armor Biopolymers", "Conductive Biopolymers", "Transparent Biopolymers", "Self-Healing Biopolymers", "Thermal Biopolymers", "Cryogenic Biopolymers", "Memory Biopolymers"]]
  ], "Organics"),
  curiosityCategory("Fossils and Preserved Life", 8, "Fossil, frozen, amber-preserved, and trace evidence of extinct or dormant life.", [
    ["Flora Fossils", ["Petrified Plants", "Seed Fossils", "Spore Fossils", "Root Networks", "Leaf Impressions", "Pollen Beds", "Fossilized Reefs", "Ancient Growth Rings"]],
    ["Fauna Fossils", ["Skeletons", "Shells", "Imprints", "Amber-Preserved Organisms", "Frozen Organisms", "Mineralized Carapaces", "Egg Fossils", "Mass Fossil Beds"]],
    ["Intelligent-Life Fossils", ["Remains", "Burial Sites", "Genetic Archives", "Preserved Specimens", "Cranial Fossils", "Tool-Bearing Remains", "Ritual Interments", "Cloned Remnants"]],
    ["Trace Fossils", ["Tracks", "Burrows", "Nests", "Feeding Marks", "Colony Imprints", "Migration Trails", "Molt Layers", "Coprolite Deposits"]]
  ], "Fossils"),
  curiosityCategory("Ancient Relics", 9, "Recovered civilian, scientific, religious, military, cultural, ceremonial, machine, and knowledge artifacts from prior civilizations.", [
    ["Civilian Artifacts", ["Domestic Implements", "Trade Tokens", "Personal Adornments", "Household Devices", "Children's Objects", "Travel Implements", "Food Preparation Tools", "Communication Keepsakes", "Civic Identification", "Everyday Containers"]],
    ["Scientific Artifacts", ["Astronomical Instruments", "Biological Instruments", "Geological Instruments", "Medical Instruments", "Analytical Devices", "Measurement Standards", "Experimental Chambers", "Research Samples", "Data Recording Devices", "Field Survey Tools"]],
    ["Religious Relics", ["Prayer Objects", "Sacred Icons", "Pilgrimage Tokens", "Funerary Objects", "Temple Implements", "Prophetic Devices", "Ancestral Relics", "Ritual Texts", "Sacrificial Implements", "Celestial Worship Objects"]],
    ["Military Relics", ["Defensive Equipment", "Command Insignia", "Field Instruments", "Ceremonial Arms", "Armor Fragments", "Fortification Components", "Unit Standards", "Strategic Tablets", "Veteran Keepsakes", "Siege Mechanisms"]],
    ["Cultural Objects", ["Musical Instruments", "Performance Masks", "Sculptural Fragments", "Painted Tablets", "Storytelling Devices", "Festival Objects", "Language Stones", "Culinary Heritage Objects", "Games and Puzzles", "Architectural Ornament"]],
    ["Ceremonial Objects", ["Coronation Regalia", "Diplomatic Gifts", "Oath Objects", "Coming-of-Age Tokens", "Marriage Relics", "Harvest Ceremony Objects", "Founding Relics", "Victory Commemorations", "Mourning Objects", "Cosmic Cycle Relics"]],
    ["Ancient Machines", ["Mechanical Calculators", "Automata", "Energy Regulators", "Navigation Engines", "Terraforming Components", "Fabrication Devices", "Environmental Controllers", "Memory Engines", "Signal Beacons", "Unknown Machines"]],
    ["Lost Knowledge", ["Encoded Tablets", "Star Maps", "Medical Archives", "Engineering Schematics", "Philosophical Records", "Legal Codes", "Historical Chronicles", "Agricultural Archives", "Language Archives", "Forbidden Records"]]
  ], "Relics"),
  curiosityCategory("Alien Technology", 10, "Recovered alien computing, intelligence, navigation, communication, energy, terraforming, fabrication, and unknown technology systems.", [
    ["Computing Systems", ["Quantum Processors", "Photonic Computers", "Biological Computers", "Crystal Logic Arrays", "Distributed Cores", "Probabilistic Engines", "Memory Lattices", "Simulation Cores", "Encrypted Archives", "Unknown Computing Devices"]],
    ["Artificial Intelligence", ["Cognitive Cores", "Autonomous Agents", "Collective Minds", "Predictive Intelligences", "Caretaker Systems", "Strategic Intelligences", "Creative Intelligences", "Sentient Archives", "Dormant Machine Minds", "Unknown AI Constructs"]],
    ["Navigation Technology", ["Star Mapping Devices", "Gravitational Compasses", "Slipstream Calculators", "Wormhole Navigators", "Temporal Navigation Devices", "Dimensional Positioning Systems", "Orbital Guidance Units", "Deep-Space Beacons", "Hazard Prediction Systems", "Unknown Navigation Devices"]],
    ["Communications", ["Quantum Communicators", "Subspace Transmitters", "Long-Range Beacons", "Neural Interfaces", "Translation Engines", "Signal Amplifiers", "Encrypted Relay Nodes", "Holographic Projectors", "Emergency Broadcasters", "Unknown Communication Devices"]],
    ["Energy Systems", ["Fusion Reactors", "Antimatter Containment", "Zero-Point Generators", "Solar Harvesters", "Geothermal Converters", "Plasma Regulators", "Quantum Batteries", "Dark-Energy Collectors", "Exotic Fuel Cells", "Unknown Energy Devices"]],
    ["Terraforming Technology", ["Atmospheric Processors", "Climate Regulators", "Oceanic Seeders", "Soil Reconstruction Units", "Magnetosphere Generators", "Biosphere Catalysts", "Weather Control Systems", "Radiation Scrubbers", "Ecological Balancers", "Unknown Terraforming Devices"]],
    ["Fabrication Systems", ["Molecular Assemblers", "Nanoforges", "Matter Printers", "Crystal Fabricators", "Biological Fabricators", "Automated Foundries", "Construction Swarms", "Repair Systems", "Resource Reclaimers", "Unknown Fabrication Devices"]],
    ["Unknown Technology", ["Phase-Shifted Devices", "Temporal Machines", "Dimensional Engines", "Reality Editing Devices", "Gravitic Constructs", "Vacuum Mechanisms", "Neutron Devices", "Causality Engines", "Self-Replicating Machines", "Unclassifiable Technology"]]
  ], "Alien Tech"),
  curiosityCategory("Energy Sources", 11, "Natural, exotic, biological, and artificial energy-source curiosities.", [
    ["Natural Energy", ["Geothermal", "Solar-Absorbing", "Chemical", "Radioactive", "Magnetic"]],
    ["Exotic Energy", ["Plasma", "Quantum", "Dark Energy", "Vacuum Energy", "Gravitational Energy", "Neutrino Energy"]],
    ["Biological Energy", ["Bioelectric Organisms", "Energy-Producing Flora", "Symbiotic Power Sources", "Living Batteries"]],
    ["Artificial Energy", ["Power Cells", "Ancient Reactors", "Energy Capsules", "Stored Plasma", "Unknown Energy Devices"]]
  ], "Energy"),
  curiosityCategory("Ruins & Structures", 12, "Settlement, city, laboratory, temple, observatory, industrial, military, and megastructure sites discovered through exploration.", [
    ["Settlements", ["Village Ruins", "Agricultural Settlements", "Mining Settlements", "Coastal Settlements", "Desert Settlements", "Tundra Settlements", "Subterranean Settlements", "Canopy Settlements", "Floating Settlements", "Abandoned Outposts"]],
    ["Cities", ["Walled Cities", "Vertical Cities", "Arcology Ruins", "Canal Cities", "Underground Cities", "Crater Cities", "Crystal Cities", "Machine Cities", "Ocean Cities", "Planetary Capitals"]],
    ["Laboratories", ["Biological Laboratories", "Geological Laboratories", "Energy Laboratories", "Quantum Laboratories", "Medical Laboratories", "Terraforming Laboratories", "AI Research Facilities", "Atmospheric Laboratories", "Deep-Space Laboratories", "Restricted Research Sites"]],
    ["Temples", ["Solar Temples", "Lunar Temples", "Ancestral Shrines", "Pilgrimage Complexes", "Funerary Temples", "Machine Temples", "Ocean Temples", "Mountain Sanctuaries", "Celestial Observance Halls", "Forbidden Sanctums"]],
    ["Observatories", ["Optical Observatories", "Radio Observatories", "Gravitational Observatories", "Neutrino Observatories", "Solar Observatories", "Deep-Space Arrays", "Temporal Observatories", "Dimensional Observatories", "Planetary Survey Stations", "Unknown Observation Sites"]],
    ["Industrial Complexes", ["Foundries", "Refineries", "Fabrication Plants", "Power Stations", "Mining Complexes", "Orbital Shipyards", "Resource Processing Hubs", "Automated Factories", "Waste Reclamation Sites", "Planetary Megafactories"]],
    ["Military Installations", ["Fortresses", "Watchtowers", "Command Bunkers", "Planetary Defense Sites", "Orbital Defense Platforms", "Training Grounds", "Armories", "Naval Bases", "Missile Complexes", "Abandoned War Citadels"]],
    ["Megastructures", ["Ringworld Segments", "Dyson Infrastructure", "Space Elevators", "Orbital Habitats", "World Engines", "Planetary Shields", "Stellar Gates", "Atmospheric Towers", "Planet-Spanning Networks", "Unknown Megastructures"]]
  ], "Ruins"),
  curiosityCategory(
    "Energy Phenomena",
    13,
    "Stellar, plasma, geothermal, electromagnetic, quantum, dark, exotic, and living energy phenomena detected through scientific survey.",
    Object.entries(energyPhenomenaCuriosityTaxonomy.taxonomy["Energy Phenomena"] ?? {})
  ),
  curiosityCategory(
    "Anomalies",
    14,
    "Spatial, temporal, gravitational, quantum, dimensional, energetic, biological, and reality-distortion anomalies documented through advanced survey.",
    Object.entries(anomaliesCuriosityTaxonomy.taxonomy.Anomalies ?? {})
  ),
  curiosityCategory("Unknown Objects", 15, "Unknown materials, devices, organisms, signals, structures, containers, artifacts, and unclassified discoveries whose origin or function remains unresolved.", mergeClassDefinitions([
    ["Unknown Materials", ["Unclassified Solids", "Unclassified Liquids", "Unclassified Gases", "Phase-Variable Matter", "Self-Organizing Matter"]],
    ["Unknown Devices", ["Sealed Devices", "Inactive Devices", "Responsive Devices", "Signal-Producing Devices", "Self-Repairing Devices"]],
    ["Unknown Biological Objects", ["Eggs", "Cocoons", "Spores", "Dormant Organisms", "Biological Capsules"]],
    ["Unknown Signals", ["Radio Signals", "Gravitational Signals", "Quantum Signals", "Biological Signals", "Repeating Patterns"]],
    ["Anomalous Objects", ["Floating Objects", "Time-Displaced Objects", "Impossible Geometry", "Dimensional Fragments", "Reality-Distorting Objects"]]
  ], Object.entries(unknownObjectsCuriosityTaxonomy.taxonomy["Unknown Objects"] ?? {})), "Unknown")
];

export const discoveryCategories = curiosityCategories.map((category) => ({
  id: category.id,
  displayName: category.displayName,
  shortDisplayName: category.shortDisplayName,
  displayOrder: category.displayOrder,
  description: category.description,
  subcategories: category.classes.flatMap((item) => item.subclasses)
}));

const curiosityCategoryById = new Map(curiosityCategories.map((category) => [category.id, category]));

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
    classId: "scientific-artifacts",
    subclassId: "astronomical-instruments",
    subcategoryId: "astronomical-instruments",
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
    classId: "computing-systems",
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
    classId: "laboratories",
    subclassId: "restricted-research-sites",
    subcategoryId: "restricted-research-sites",
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

function importedCuriosityRecord(record: ImportedCuriosity, pack: ImportedCuriosityPack, config: CuriosityVolumeImportConfig): DiscoveryRecord {
  const rarity = importedRarity(record.rarity);
  const slug = config.volumeId === "ancient-relics" && record.slug
    ? record.slug
    : `${record.slug ?? slugify(record.name)}-${record.canonical_id.toLowerCase()}`;
  const categoryId = importedCategoryId(record.category);
  const classId = slugify(record.class);
  const subclassId = slugify(record.subclass);
  const compatiblePlanetClasses = (record.compatible_planet_classes ?? []).map(slugify).filter(Boolean);
  const scanLevelFromRarity = Math.max(1, Math.min(8, discoveryRarities.find((item) => item.id === rarity)?.displayOrder ?? 1));
  const scanLevel = record.required_scan_level ?? scanLevelFromRarity;
  const researchValue = record.research_value ?? rarityDiscoveryXp(rarity) * 8;
  const tradeValue = record.trade_value ?? rarityDiscoveryXp(rarity) * 10;
  const tags = Array.from(new Set([
    config.defaultTag,
    record.category,
    record.class,
    record.subclass,
    rarity,
    ...record.tags
  ].map(slugify).filter(Boolean)));

  return {
    id: record.canonical_id,
    slug,
    sourceSlug: record.slug,
    volumeId: config.volumeId,
    volumeName: pack.title,
    displayName: record.name,
    categoryId,
    classId,
    subclassId,
    subcategoryId: subclassId,
    scientificName: record.scientific_name ?? record.catalog_name ?? record.name,
    catalogName: record.catalog_name,
    description: record.description,
    lore: record.description,
    scientificNotes: record.discovery_location ? `Discovery location: ${record.discovery_location}. Recovery method: ${record.recovery_method ?? record.collection_method ?? "Unspecified"}. Hazard level: ${record.hazard_level ?? "Unspecified"}.` : undefined,
    discoverySummary: `${record.name} is a ${record.rarity.toLowerCase()} ${config.defaultTag} curiosity cataloged in ${record.class} / ${record.subclass}.`,
    rarity,
    spawnWeight: raritySpawnWeight(rarity),
    discoveryXp: rarityDiscoveryXp(rarity),
    creditsValue: record.collection_value ?? rarityDiscoveryXp(rarity) * 12,
    researchValue,
    tradeValue,
    unlocks: [],
    relatedResearchIds: config.defaultResearchIds,
    relatedBuildingIds: [],
    relatedResourceIds: [],
    relatedPlanetIds: [],
    relatedCivilizationIds: [],
    relatedLifeformIds: [],
    requiredEquipmentIds: config.defaultEquipmentIds,
    requiredScanLevel: scanLevel,
    requiredResearchLevel: record.required_research_level,
    discoveryLocation: record.discovery_location,
    recoveryMethod: record.recovery_method ?? record.collection_method,
    condition: record.condition,
    surveyMethod: record.survey_method,
    scale: record.scale,
    operationalState: record.operational_state,
    objectState: record.object_state,
    phenomenonState: record.phenomenon_state,
    measurementMethod: record.measurement_method,
    hazardLevel: record.hazard_level,
    energyIntensity: record.energy_intensity,
    anomalyIntensity: record.anomaly_intensity,
    unknownSignature: record.unknown_signature,
    durationSeconds: record.duration_seconds,
    spatialVariancePercent: record.spatial_variance_percent,
    temporalVariancePercent: record.temporal_variance_percent,
    realityDistortionPercent: record.reality_distortion_percent,
    observationConfidencePercent: record.observation_confidence_percent,
    functionConfidencePercent: record.function_confidence_percent,
    realityVariancePercent: record.reality_variance_percent,
    powerSignature: record.power_signature,
    stabilityPercent: record.stability_percent,
    reverseEngineeringProgressPercent: record.reverse_engineering_progress_percent,
    containmentRequirement: record.containment_requirement,
    estimatedAgeYears: record.estimated_age_years,
    originConfidencePercent: record.origin_confidence_percent,
    translationProgressPercent: record.translation_progress_percent,
    integrityPercent: record.integrity_percent,
    structuralIntegrityPercent: record.structural_integrity_percent,
    accessibleAreaPercent: record.accessible_area_percent,
    mappingProgressPercent: record.mapping_progress_percent,
    museumValue: record.museum_value,
    culturalValue: record.cultural_value,
    historicalValue: record.historical_value,
    architecturalValue: record.architectural_value,
    technologicalValue: record.technological_value,
    strategicValue: record.strategic_value,
    energyValue: record.energy_value,
    anomalyValue: record.anomaly_value,
    mysteryValue: record.mystery_value,
    scientificValue: record.scientific_value,
    collectionValue: record.collection_value,
    repeatable: record.repeatable,
    maximumKnownInstances: record.maximum_known_instances,
    compatiblePlanetClasses,
    spawnRules: {
      planetClass: compatiblePlanetClasses,
      requiredResearchIds: config.defaultResearchIds,
      requiredEquipmentIds: config.defaultEquipmentIds,
      specialEvents: [config.specialEvent]
    },
    assetProfile: assetProfile(`${config.defaultTag}_${slugify(record.canonical_id)}`),
    promptProfile: {
      prompt: record.art_prompt,
      masterPrompt: record.art_prompt,
      negativePrompt: record.negative_prompt,
      promptVersion: pack.schemaVersion,
      generationNotes: config.generationNotes
    },
    publicationStatus: importedPublicationStatus(record.status),
    artworkStatus: importedArtworkStatus(record.artwork_status),
    canonicalVersion: `volume-${importedVolumeNumber(pack)}.schema-${pack.schemaVersion}`,
    tags
  };
}

function importedCuriosityNavigation(taxonomy: ImportedCuriosityTaxonomyPack) {
  return Object.entries(taxonomy.taxonomy).map(([categoryName, classes], categoryIndex) => ({
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
}

const biologicalImportConfig: CuriosityVolumeImportConfig = {
  volumeId: "biological",
  defaultTag: "biological",
  defaultResearchIds: ["planet_scan", "planetary_ecology"],
  defaultEquipmentIds: ["bioscanner_basic"],
  specialEvent: "biological-curiosity-volume-01",
  generationNotes: "Imported from NOVERIS Curiosity Codex Volume I: Biological Curiosities."
};

const faunaImportConfig: CuriosityVolumeImportConfig = {
  volumeId: "fauna",
  defaultTag: "fauna",
  defaultResearchIds: ["planet_scan", "xenobiology"],
  defaultEquipmentIds: ["bioscanner_basic", "field_sampler"],
  specialEvent: "fauna-curiosity-volume-02",
  generationNotes: "Imported from NOVERIS Curiosity Codex Volume II: Fauna Curiosities."
};

const geologicalImportConfig: CuriosityVolumeImportConfig = {
  volumeId: "geological",
  defaultTag: "geological",
  defaultResearchIds: ["planet_scan", "resource_scan", "geology"],
  defaultEquipmentIds: ["resource_scanner_basic", "geology_sampler"],
  specialEvent: "geological-curiosity-volume-03",
  generationNotes: "Imported from NOVERIS Curiosity Codex Volume III: Geological Curiosities."
};

const ancientRelicsImportConfig: CuriosityVolumeImportConfig = {
  volumeId: "ancient-relics",
  defaultTag: "ancient-relics",
  defaultResearchIds: ["planet_scan", "archaeology", "ancient_civilizations"],
  defaultEquipmentIds: ["archaeology_scanner", "recovery_probe"],
  specialEvent: "ancient-relics-curiosity-volume-04",
  generationNotes: "Imported from NOVERIS Curiosity Codex Volume IV: Ancient Relics."
};

const alienTechnologyImportConfig: CuriosityVolumeImportConfig = {
  volumeId: "alien-technology",
  defaultTag: "alien-technology",
  defaultResearchIds: ["planet_scan", "xenoarchaeology", "reverse_engineering"],
  defaultEquipmentIds: ["technology_scanner", "containment_probe"],
  specialEvent: "alien-technology-curiosity-volume-05",
  generationNotes: "Imported from NOVERIS Curiosity Codex Volume V: Alien Technology."
};

const ruinsStructuresImportConfig: CuriosityVolumeImportConfig = {
  volumeId: "ruins-and-structures",
  defaultTag: "ruins-and-structures",
  defaultResearchIds: ["planet_scan", "archaeology", "structural_analysis"],
  defaultEquipmentIds: ["structure_scanner", "survey_probe"],
  specialEvent: "ruins-structures-curiosity-volume-06",
  generationNotes: "Imported from NOVERIS Curiosity Codex Volume VI: Ruins & Structures."
};

const energyPhenomenaImportConfig: CuriosityVolumeImportConfig = {
  volumeId: "energy-phenomena",
  defaultTag: "energy-phenomena",
  defaultResearchIds: ["planet_scan", "energy_science", "advanced_sensors"],
  defaultEquipmentIds: ["energy_scanner", "quantum_sensor"],
  specialEvent: "energy-phenomena-curiosity-volume-07",
  generationNotes: "Imported from NOVERIS Curiosity Codex Volume VII: Energy Phenomena."
};

const anomaliesImportConfig: CuriosityVolumeImportConfig = {
  volumeId: "anomalies",
  defaultTag: "anomalies",
  defaultResearchIds: ["planet_scan", "anomaly_science", "advanced_sensors"],
  defaultEquipmentIds: ["anomaly_scanner", "quantum_sensor"],
  specialEvent: "anomalies-curiosity-volume-08",
  generationNotes: "Imported from NOVERIS Curiosity Codex Volume VIII: Anomalies."
};

const unknownObjectsImportConfig: CuriosityVolumeImportConfig = {
  volumeId: "unknown-objects",
  defaultTag: "unknown-objects",
  defaultResearchIds: ["planet_scan", "xenoarchaeology", "anomaly_science"],
  defaultEquipmentIds: ["unknown_object_scanner", "containment_probe"],
  specialEvent: "unknown-objects-curiosity-volume-09",
  generationNotes: "Imported from NOVERIS Curiosity Codex Volume IX: Unknown Objects."
};

export const biologicalCuriosityRecords = biologicalCuriosityVolume.records.map((record) => importedCuriosityRecord(record, biologicalCuriosityVolume, biologicalImportConfig));
export const faunaCuriosityRecords = faunaCuriosityVolume.records.map((record) => importedCuriosityRecord(record, faunaCuriosityVolume, faunaImportConfig));
export const geologicalCuriosityRecords = geologicalCuriosityVolume.records.map((record) => importedCuriosityRecord(record, geologicalCuriosityVolume, geologicalImportConfig));
export const ancientRelicsCuriosityRecords = ancientRelicsCuriosityVolume.records.map((record) => importedCuriosityRecord(record, ancientRelicsCuriosityVolume, ancientRelicsImportConfig));
export const alienTechnologyCuriosityRecords = alienTechnologyCuriosityVolume.records.map((record) => importedCuriosityRecord(record, alienTechnologyCuriosityVolume, alienTechnologyImportConfig));
export const ruinsStructuresCuriosityRecords = ruinsStructuresCuriosityVolume.records.map((record) => importedCuriosityRecord(record, ruinsStructuresCuriosityVolume, ruinsStructuresImportConfig));
export const energyPhenomenaCuriosityRecords = energyPhenomenaCuriosityVolume.records.map((record) => importedCuriosityRecord(record, energyPhenomenaCuriosityVolume, energyPhenomenaImportConfig));
export const anomaliesCuriosityRecords = anomaliesCuriosityVolume.records.map((record) => importedCuriosityRecord(record, anomaliesCuriosityVolume, anomaliesImportConfig));
export const unknownObjectsCuriosityRecords = unknownObjectsCuriosityVolume.records.map((record) => importedCuriosityRecord(record, unknownObjectsCuriosityVolume, unknownObjectsImportConfig));

export const biologicalCuriosityNavigation = importedCuriosityNavigation(biologicalCuriosityTaxonomy);
export const faunaCuriosityNavigation = importedCuriosityNavigation(faunaCuriosityTaxonomy);
export const geologicalCuriosityNavigation = importedCuriosityNavigation(geologicalCuriosityTaxonomy);
export const ancientRelicsCuriosityNavigation = importedCuriosityNavigation(ancientRelicsCuriosityTaxonomy);
export const alienTechnologyCuriosityNavigation = importedCuriosityNavigation(alienTechnologyCuriosityTaxonomy);
export const ruinsStructuresCuriosityNavigation = importedCuriosityNavigation(ruinsStructuresCuriosityTaxonomy);
export const energyPhenomenaCuriosityNavigation = importedCuriosityNavigation(energyPhenomenaCuriosityTaxonomy);
export const anomaliesCuriosityNavigation = importedCuriosityNavigation(anomaliesCuriosityTaxonomy);
export const unknownObjectsCuriosityNavigation = importedCuriosityNavigation(unknownObjectsCuriosityTaxonomy);

export const canonicalDiscoveries: DiscoveryRecord[] = [
  ...coreDiscoveryRecords,
  ...biologicalCuriosityRecords,
  ...faunaCuriosityRecords,
  ...geologicalCuriosityRecords,
  ...ancientRelicsCuriosityRecords,
  ...alienTechnologyCuriosityRecords,
  ...ruinsStructuresCuriosityRecords,
  ...energyPhenomenaCuriosityRecords,
  ...anomaliesCuriosityRecords,
  ...unknownObjectsCuriosityRecords
];

export const supportedCuriosityVolumeIds = ["biological", "fauna", "geological", "ancient-relics", "alien-technology", "ruins-and-structures", "energy-phenomena", "anomalies", "unknown-objects"] as const;
export type SupportedCuriosityVolumeId = typeof supportedCuriosityVolumeIds[number];

function discoveryFolderKey(record: Pick<DiscoveryRecord, "volumeId" | "categoryId" | "classId" | "subclassId">, depth: "volume" | "category" | "class" | "subclass") {
  if (!record.volumeId) return null;
  if (depth === "volume") return record.volumeId;
  if (!record.categoryId) return null;
  if (depth === "category") return [record.volumeId, record.categoryId].join(":");
  if (!record.classId) return null;
  if (depth === "class") return [record.volumeId, record.categoryId, record.classId].join(":");
  if (!record.subclassId) return null;
  return [record.volumeId, record.categoryId, record.classId, record.subclassId].join(":");
}

function buildDiscoveryFolderIndex(records: DiscoveryRecord[]) {
  const index = new Map<string, DiscoveryRecord[]>();

  for (const record of records) {
    for (const depth of ["volume", "category", "class", "subclass"] as const) {
      const key = discoveryFolderKey(record, depth);
      if (!key) continue;
      const bucket = index.get(key);
      if (bucket) bucket.push(record);
      else index.set(key, [record]);
    }
  }

  return index;
}

const discoveryRecordsByFolder = buildDiscoveryFolderIndex(canonicalDiscoveries);
const discoveryRecordsById = new Map(canonicalDiscoveries.map((record) => [record.id, record]));

export function getCuriositiesByVolume(volumeId: string) {
  return discoveryRecordsByFolder.get(volumeId) ?? [];
}

export function getCuriositiesByFolder(folder: string) {
  if (!folder || folder === "all") return canonicalDiscoveries;
  if (!supportedCuriosityVolumeIds.includes(folder.split(":")[0] as SupportedCuriosityVolumeId)) return canonicalDiscoveries;
  return discoveryRecordsByFolder.get(folder) ?? [];
}

export function getCuriosityById(id: string | null | undefined) {
  return id ? discoveryRecordsById.get(id) ?? null : null;
}

export function getCuriosityFolderCount(folder: string) {
  return getCuriositiesByFolder(folder).length;
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
  const category = curiosityCategoryById.get(record.categoryId) ?? null;
  const classRecord = category?.classes.find((item) => item.id === record.classId) ?? null;
  const subclassRecord = classRecord?.subclasses.find((item) => item.id === record.subclassId) ?? null;
  return { category, classRecord, subclassRecord };
}

const curiosityArtworkByCuriosityId = new Map(curiosityArtwork.records.map((record) => [record.curiosityId, record]));
const curiosityArtworkBySlug = new Map(curiosityArtwork.records.map((record) => [record.slug, record]));

export function getCuriosityArtwork(record: Pick<DiscoveryRecord, "id" | "displayName">) {
  const slug = curiositySlug(record);
  return curiosityArtworkByCuriosityId.get(record.id) ?? curiosityArtworkBySlug.get(slug) ?? null;
}

let discoveryValidationCache: ReturnType<typeof runDiscoverySystemValidation> | null = null;

export function validateDiscoverySystem() {
  discoveryValidationCache ??= runDiscoverySystemValidation();
  return discoveryValidationCache;
}

function runDiscoverySystemValidation() {
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
  const ancientRelicNames = ancientRelicsCuriosityRecords.map((record) => record.displayName.trim().toLowerCase());
  if (new Set(ancientRelicNames).size !== ancientRelicNames.length) {
    issues.push({ severity: "error", code: "duplicate_ancient_relic_name", message: "Volume IV curiosity names must be unique.", records: ancientRelicsCuriosityRecords.map((record) => record.displayName) });
  }
  if (ancientRelicsCuriosityRecords.length !== ancientRelicsCuriosityVolume.recordCount) {
    issues.push({ severity: "error", code: "ancient_relic_record_count", message: "Volume IV must load its declared canonical record count.", records: [String(ancientRelicsCuriosityRecords.length), String(ancientRelicsCuriosityVolume.recordCount)] });
  }
  if (ancientRelicsCuriosityRecords[0]?.id !== "REL-0001" || ancientRelicsCuriosityRecords.at(-1)?.id !== "REL-0600") {
    issues.push({ severity: "error", code: "ancient_relic_id_range", message: "Volume IV must preserve the REL-0001 through REL-0600 canonical range.", records: [ancientRelicsCuriosityRecords[0]?.id ?? "missing", ancientRelicsCuriosityRecords.at(-1)?.id ?? "missing"] });
  }
  const invalidUniqueRelics = ancientRelicsCuriosityRecords.filter((record) => record.rarity === "unique" && (record.maximumKnownInstances !== 1 || record.repeatable !== false));
  if (invalidUniqueRelics.length) {
    issues.push({ severity: "error", code: "ancient_relic_unique_contract", message: "Unique relics must be non-repeatable and limited to one known instance.", records: invalidUniqueRelics.map((record) => record.id) });
  }
  const alienTechnologyNames = alienTechnologyCuriosityRecords.map((record) => record.displayName.trim().toLowerCase());
  if (new Set(alienTechnologyNames).size !== alienTechnologyNames.length) {
    issues.push({ severity: "error", code: "duplicate_alien_technology_name", message: "Volume V curiosity names must be unique.", records: alienTechnologyCuriosityRecords.map((record) => record.displayName) });
  }
  if (alienTechnologyCuriosityRecords.length !== alienTechnologyCuriosityVolume.recordCount) {
    issues.push({ severity: "error", code: "alien_technology_record_count", message: "Volume V must load its declared canonical record count.", records: [String(alienTechnologyCuriosityRecords.length), String(alienTechnologyCuriosityVolume.recordCount)] });
  }
  if (alienTechnologyCuriosityRecords[0]?.id !== "TEC-0001" || alienTechnologyCuriosityRecords.at(-1)?.id !== "TEC-0600") {
    issues.push({ severity: "error", code: "alien_technology_id_range", message: "Volume V must preserve the TEC-0001 through TEC-0600 canonical range.", records: [alienTechnologyCuriosityRecords[0]?.id ?? "missing", alienTechnologyCuriosityRecords.at(-1)?.id ?? "missing"] });
  }
  const invalidUniqueTechnology = alienTechnologyCuriosityRecords.filter((record) => record.rarity === "unique" && (record.maximumKnownInstances !== 1 || record.repeatable !== false));
  if (invalidUniqueTechnology.length) {
    issues.push({ severity: "error", code: "alien_technology_unique_contract", message: "Unique alien technology must be non-repeatable and limited to one known instance.", records: invalidUniqueTechnology.map((record) => record.id) });
  }
  const ruinsStructuresNames = ruinsStructuresCuriosityRecords.map((record) => record.displayName.trim().toLowerCase());
  if (new Set(ruinsStructuresNames).size !== ruinsStructuresNames.length) {
    issues.push({ severity: "error", code: "duplicate_ruins_structures_name", message: "Volume VI curiosity names must be unique.", records: ruinsStructuresCuriosityRecords.map((record) => record.displayName) });
  }
  if (ruinsStructuresCuriosityRecords.length !== ruinsStructuresCuriosityVolume.recordCount) {
    issues.push({ severity: "error", code: "ruins_structures_record_count", message: "Volume VI must load its declared canonical record count.", records: [String(ruinsStructuresCuriosityRecords.length), String(ruinsStructuresCuriosityVolume.recordCount)] });
  }
  if (ruinsStructuresCuriosityRecords[0]?.id !== "STR-0001" || ruinsStructuresCuriosityRecords.at(-1)?.id !== "STR-0600") {
    issues.push({ severity: "error", code: "ruins_structures_id_range", message: "Volume VI must preserve the STR-0001 through STR-0600 canonical range.", records: [ruinsStructuresCuriosityRecords[0]?.id ?? "missing", ruinsStructuresCuriosityRecords.at(-1)?.id ?? "missing"] });
  }
  const invalidUniqueStructures = ruinsStructuresCuriosityRecords.filter((record) => record.rarity === "unique" && (record.maximumKnownInstances !== 1 || record.repeatable !== false));
  if (invalidUniqueStructures.length) {
    issues.push({ severity: "error", code: "ruins_structures_unique_contract", message: "Unique ruins and structures must be non-repeatable and limited to one known instance.", records: invalidUniqueStructures.map((record) => record.id) });
  }
  const energyPhenomenaNames = energyPhenomenaCuriosityRecords.map((record) => record.displayName.trim().toLowerCase());
  if (new Set(energyPhenomenaNames).size !== energyPhenomenaNames.length) {
    issues.push({ severity: "error", code: "duplicate_energy_phenomena_name", message: "Volume VII curiosity names must be unique.", records: energyPhenomenaCuriosityRecords.map((record) => record.displayName) });
  }
  if (energyPhenomenaCuriosityRecords.length !== energyPhenomenaCuriosityVolume.recordCount) {
    issues.push({ severity: "error", code: "energy_phenomena_record_count", message: "Volume VII must load its declared canonical record count.", records: [String(energyPhenomenaCuriosityRecords.length), String(energyPhenomenaCuriosityVolume.recordCount)] });
  }
  if (energyPhenomenaCuriosityRecords[0]?.id !== "ENG-0001" || energyPhenomenaCuriosityRecords.at(-1)?.id !== "ENG-0600") {
    issues.push({ severity: "error", code: "energy_phenomena_id_range", message: "Volume VII must preserve the ENG-0001 through ENG-0600 canonical range.", records: [energyPhenomenaCuriosityRecords[0]?.id ?? "missing", energyPhenomenaCuriosityRecords.at(-1)?.id ?? "missing"] });
  }
  const invalidUniqueEnergyPhenomena = energyPhenomenaCuriosityRecords.filter((record) => record.rarity === "unique" && (record.maximumKnownInstances !== 1 || record.repeatable !== false));
  if (invalidUniqueEnergyPhenomena.length) {
    issues.push({ severity: "error", code: "energy_phenomena_unique_contract", message: "Unique energy phenomena must be non-repeatable and limited to one known instance.", records: invalidUniqueEnergyPhenomena.map((record) => record.id) });
  }
  const incompleteEnergyPhenomena = energyPhenomenaCuriosityRecords.filter((record) => !record.measurementMethod || !record.phenomenonState || typeof record.energyIntensity !== "number" || typeof record.durationSeconds !== "number");
  if (incompleteEnergyPhenomena.length) {
    issues.push({ severity: "error", code: "energy_phenomena_measurement_contract", message: "Energy phenomena must preserve measurement method, state, intensity, and duration.", records: incompleteEnergyPhenomena.map((record) => record.id) });
  }
  const anomalyNames = anomaliesCuriosityRecords.map((record) => record.displayName.trim().toLowerCase());
  if (new Set(anomalyNames).size !== anomalyNames.length) {
    issues.push({ severity: "error", code: "duplicate_anomaly_name", message: "Volume VIII curiosity names must be unique.", records: anomaliesCuriosityRecords.map((record) => record.displayName) });
  }
  if (anomaliesCuriosityRecords.length !== anomaliesCuriosityVolume.recordCount) {
    issues.push({ severity: "error", code: "anomaly_record_count", message: "Volume VIII must load its declared canonical record count.", records: [String(anomaliesCuriosityRecords.length), String(anomaliesCuriosityVolume.recordCount)] });
  }
  if (anomaliesCuriosityRecords[0]?.id !== "ANO-0001" || anomaliesCuriosityRecords.at(-1)?.id !== "ANO-0600") {
    issues.push({ severity: "error", code: "anomaly_id_range", message: "Volume VIII must preserve the ANO-0001 through ANO-0600 canonical range.", records: [anomaliesCuriosityRecords[0]?.id ?? "missing", anomaliesCuriosityRecords.at(-1)?.id ?? "missing"] });
  }
  const invalidUniqueAnomalies = anomaliesCuriosityRecords.filter((record) => record.rarity === "unique" && (record.maximumKnownInstances !== 1 || record.repeatable !== false));
  if (invalidUniqueAnomalies.length) {
    issues.push({ severity: "error", code: "anomaly_unique_contract", message: "Unique anomalies must be non-repeatable and limited to one known instance.", records: invalidUniqueAnomalies.map((record) => record.id) });
  }
  const incompleteAnomalies = anomaliesCuriosityRecords.filter((record) => !record.measurementMethod || !record.phenomenonState || typeof record.anomalyIntensity !== "number" || typeof record.spatialVariancePercent !== "number" || typeof record.temporalVariancePercent !== "number" || typeof record.realityDistortionPercent !== "number" || typeof record.observationConfidencePercent !== "number" || typeof record.durationSeconds !== "number");
  if (incompleteAnomalies.length) {
    issues.push({ severity: "error", code: "anomaly_measurement_contract", message: "Anomalies must preserve measurement method, state, intensity, duration, spatial variance, temporal variance, reality distortion, and observation confidence.", records: incompleteAnomalies.map((record) => record.id) });
  }
  const unknownObjectNames = unknownObjectsCuriosityRecords.map((record) => record.displayName.trim().toLowerCase());
  if (new Set(unknownObjectNames).size !== unknownObjectNames.length) {
    issues.push({ severity: "error", code: "duplicate_unknown_object_name", message: "Volume IX curiosity names must be unique.", records: unknownObjectsCuriosityRecords.map((record) => record.displayName) });
  }
  if (unknownObjectsCuriosityRecords.length !== unknownObjectsCuriosityVolume.recordCount) {
    issues.push({ severity: "error", code: "unknown_object_record_count", message: "Volume IX must load its declared canonical record count.", records: [String(unknownObjectsCuriosityRecords.length), String(unknownObjectsCuriosityVolume.recordCount)] });
  }
  if (unknownObjectsCuriosityRecords[0]?.id !== "UNK-0001" || unknownObjectsCuriosityRecords.at(-1)?.id !== "UNK-0600") {
    issues.push({ severity: "error", code: "unknown_object_id_range", message: "Volume IX must preserve the UNK-0001 through UNK-0600 canonical range.", records: [unknownObjectsCuriosityRecords[0]?.id ?? "missing", unknownObjectsCuriosityRecords.at(-1)?.id ?? "missing"] });
  }
  const invalidUniqueUnknownObjects = unknownObjectsCuriosityRecords.filter((record) => record.rarity === "unique" && (record.maximumKnownInstances !== 1 || record.repeatable !== false));
  if (invalidUniqueUnknownObjects.length) {
    issues.push({ severity: "error", code: "unknown_object_unique_contract", message: "Unique unknown objects must be non-repeatable and limited to one known instance.", records: invalidUniqueUnknownObjects.map((record) => record.id) });
  }
  const incompleteUnknownObjects = unknownObjectsCuriosityRecords.filter((record) => !record.objectState || !record.recoveryMethod || typeof record.unknownSignature !== "number" || typeof record.originConfidencePercent !== "number" || typeof record.functionConfidencePercent !== "number" || typeof record.translationProgressPercent !== "number" || typeof record.realityVariancePercent !== "number");
  if (incompleteUnknownObjects.length) {
    issues.push({ severity: "error", code: "unknown_object_analysis_contract", message: "Unknown objects must preserve state, recovery method, signature, origin confidence, function confidence, translation progress, and reality variance.", records: incompleteUnknownObjects.map((record) => record.id) });
  }
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
