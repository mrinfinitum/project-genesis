import { PLANET_CLASS_MODEL } from "@/lib/planets/class-model";
import { generatePlanetRarity } from "@/lib/planets/rarity";
import { normalizeResourceNames, ResourceService, resourceNames } from "@/lib/resources/service";
import { generateUniqueVisualSignature, generateVisualSignature, type ProceduralVisualSignature } from "@/lib/universe/visual-signatures";

type RandomSource = () => number;

export const SEED_GENERATION_VERSION = "seeded-cascade-v1";

export type GenerationMetadata = {
  seed: string;
  generation_parent_seed: string | null;
  generation_index: number;
  generation_version: string;
  is_fixed?: boolean;
  is_procedural?: boolean;
};

export type UniverseNode = {
  id: string;
  universe_seed: string;
  name: string;
  created_at: string;
  visual_signature?: ProceduralVisualSignature;
};

export type GalaxyNode = {
  id: string;
  universe_id: string;
  galaxy_seed: string;
  name: string;
  galaxy_type: string;
  galaxy_size: string;
  visual_signature?: ProceduralVisualSignature;
  sector_count: number;
  seed?: string;
  generation_parent_seed?: string | null;
  generation_index?: number;
  generation_version?: string;
  is_fixed?: boolean;
  is_procedural?: boolean;
  is_unlocked?: boolean;
  is_unlimited?: boolean;
  discovery_state?: string;
  discoveryState?: string;
  discoveryPoints?: number;
  discoveredAt?: string | null;
  discoveredBy?: string;
  scanProgress?: number;
  isClaimable?: boolean;
  isColonizable?: boolean;
  discovery_percent_display?: string;
  generated_sector_count?: number;
  generated_system_count?: number;
  generated_planet_count?: number;
  discovered_sector_count?: number;
  discovered_system_count?: number;
  discovered_planet_count?: number;
  sector_ids?: string[];
  galaxy_dna?: {
    age: string;
    metallicity: string;
    civilizationDensity: string;
    anomalyDensity: string;
    resourceRichness: string;
    hostility: string;
    terraformDifficulty: string;
    technologyLevel: string;
    dominantStarTypes: string[];
    rarePhenomena: string[];
    earthlikeWorldChance: string;
    ruinChance: string;
    blackHoleChance: string;
  };
};

export type SectorNode = {
  id: string;
  galaxy_id: string;
  sector_seed: string;
  sector_name: string;
  coordinates_x: number;
  coordinates_y: number;
  coordinates_z: number;
  sector_type: string;
  sector_rarity: string;
  system_count: number;
  difficulty: number;
  discovery_value: number;
  discovery_level: string;
  modifier: string;
  resource_signal: string;
  colonized_worlds: number;
  discovered: boolean;
  discovered_at: string | null;
  visual_signature?: ProceduralVisualSignature;
  discoveryState?: string;
  discoveryPoints?: number;
  discoveredAt?: string | null;
  discoveredBy?: string;
  scanProgress?: number;
  isClaimable?: boolean;
  isColonizable?: boolean;
  seed?: string;
  generation_parent_seed?: string | null;
  generation_index?: number;
  generation_version?: string;
  is_fixed?: boolean;
  is_procedural?: boolean;
};

export type StarSystemNode = {
  id: string;
  sector_id: string;
  system_seed: string;
  system_name: string;
  catalog_designation: string;
  system_type: string;
  system_role: string;
  generation_type: string;
  system_rarity: string;
  star_count: number;
  planet_count: number;
  primary_star: string;
  star_type: string;
  resource_bias: string;
  danger_level: number;
  starting_system: boolean;
  is_procedural: boolean;
  discovery_state: DiscoveryState;
  discoveryState?: string;
  discoveryPoints?: number;
  discoveredAt?: string | null;
  discoveredBy?: string;
  scanProgress?: number;
  isClaimable?: boolean;
  isColonizable?: boolean;
  detected_at: string | null;
  probed_at: string | null;
  scanned_at: string | null;
  visited_at: string | null;
  surveyed_at: string | null;
  colonized_at: string | null;
  estimated_planet_count_min: number | null;
  estimated_planet_count_max: number | null;
  estimated_celestial_body_count_min: number | null;
  estimated_celestial_body_count_max: number | null;
  estimated_danger_level: number | null;
  known_star_signature: string | null;
  visual_signature?: ProceduralVisualSignature;
  probe_data: Record<string, unknown>;
  scan_data: Record<string, unknown>;
  discovered: boolean;
  discovered_at: string | null;
  seed?: string;
  generation_parent_seed?: string | null;
  generation_index?: number;
  generation_version?: string;
  is_fixed?: boolean;
};

export type DiscoveryState = "Undetected" | "Detected" | "Probed" | "Scanned" | "Visited" | "Surveyed" | "Colonized";

export type StarNode = {
  id: string;
  system_id: string;
  star_seed: string;
  star_name: string;
  star_type: string;
  star_size: string;
  star_temperature: number;
  star_color: string;
  luminosity: number;
  age: string;
  seed?: string;
  generation_parent_seed?: string | null;
  generation_index?: number;
  generation_version?: string;
  is_fixed?: boolean;
  is_procedural?: boolean;
};

export type UniversePlanetNode = {
  id: string;
  system_id: string;
  planet_seed: string;
  planet_name: string;
  orbit_position: number;
  planet_rarity: string;
  planet_class: string;
  planet_subclass: string;
  colonized: boolean;
  terraform_level: number;
  seed?: string;
  generation_parent_seed?: string | null;
  generation_index?: number;
  generation_version?: string;
  is_fixed?: boolean;
  is_procedural?: boolean;
};

export type CelestialBodyNode = {
  id: string;
  system_id: string;
  parent_body_id: string | null;
  name: string;
  celestial_body_type: string;
  planet_class: string | null;
  planet_subclass: string | null;
  planet_rarity: string | null;
  biome: string | null;
  atmosphere: string | null;
  gravity: string | null;
  orbit_position: number | null;
  orbit_parent: string | null;
  landable: boolean;
  colonizable: boolean;
  colonizable_status: string;
  uses_orbital_gameplay: boolean;
  is_fixed: boolean;
  is_starting_body: boolean;
  is_procedural: boolean;
  unlock_requirement: string;
  discoveryState?: string;
  discoveryPoints?: number;
  discoveredAt?: string | null;
  discoveredBy?: string;
  scanProgress?: number;
  isClaimable?: boolean;
  isColonizable?: boolean;
  resources: string[];
  notes: string;
  scientific_profile?: Record<string, unknown>;
  seed?: string;
  generation_parent_seed?: string | null;
  generation_index?: number;
  generation_version?: string;
};

export const PLANET_SUB_SEED_KEYS = [
  "class",
  "subclass",
  "biome",
  "climate",
  "atmosphere",
  "temperature",
  "gravity",
  "water-coverage",
  "terrain",
  "color-palette",
  "resources",
  "resource-density",
  "traits",
  "hazards",
  "weather",
  "anomalies",
  "ancient-civilization",
  "ruins",
  "flora",
  "fauna",
  "collectibles",
  "discovery",
  "story"
];

const galaxyTypes = [
  "Spiral Galaxy",
  "Elliptical Galaxy",
  "Ring Galaxy",
  "Barred Spiral",
  "Irregular Galaxy",
  "Ancient Galaxy",
  "Nebula Cluster",
  "Void Galaxy",
  "Artificial Galaxy",
  "Harmony Galaxy"
];
const galaxySizes = [
  { name: "Small", sectors: 1000, weight: 8 },
  { name: "Medium", sectors: 5000, weight: 12 },
  { name: "Large", sectors: 20000, weight: 18 },
  { name: "Massive", sectors: 100000, weight: 22 },
  { name: "Infinite", sectors: 100000, weight: 40 }
];
const sectorTypes = [
  "Core Worlds",
  "Civilized Space",
  "Outer Rim",
  "Ancient Expanse",
  "Nebula",
  "Frontier",
  "Deep Space",
  "Void Region",
  "Harmony Region",
  "Uncharted Space"
];
const sectorRarities = [
  { name: "Common", weight: 55 },
  { name: "Uncommon", weight: 22 },
  { name: "Rare", weight: 12 },
  { name: "Epic", weight: 6 },
  { name: "Legendary", weight: 3 },
  { name: "Mythic", weight: 1 },
  { name: "Relic", weight: 0.8 },
  { name: "Genesis", weight: 0.2 }
];
const discoveryLevels = ["Unknown", "Detected", "Scanned", "Surveyed", "Explored", "Colonized", "Mastered"];
const sectorModifiers = [
  "Stable Corridor",
  "Rich Minerals",
  "Ancient Trade Route",
  "Dark Matter Region",
  "Nebula",
  "Pirate Territory",
  "Harmony Beacon",
  "Quantum Storms",
  "High Radiation",
  "Lost Civilization"
];
const systemRarities = ["Common", "Common", "Common", "Uncommon", "Uncommon", "Rare", "Epic", "Legendary"];
const resourceBiases = ["Balanced", "Mineral Rich", "Organic", "Ancient Relic", "Energy", "Volatile", "Crystal", "Industrial"];
const starTypes = ["Red Dwarf", "Yellow Main Sequence", "Blue Giant", "White Dwarf", "Orange Dwarf", "Neutron Star", "Binary Pair", "Black Hole"];
const starSizes = ["Dwarf", "Standard", "Large", "Giant", "Supergiant", "Collapsed"];
const starColors = ["Red", "Orange", "Yellow", "White", "Blue", "Violet", "Cyan"];
const namePrefixes = ["Astra", "Nova", "Vega", "Orion", "Elios", "Kyra", "Vanta", "Lyra", "Solan", "Iris", "Nexa", "Verd"];
const nameSuffixes = ["Prime", "Reach", "Veil", "Fall", "Thia", "Ara", "Ion", "Mere", "Os", "Dor"];
export const DISCOVERY_STATES: DiscoveryState[] = ["Undetected", "Detected", "Probed", "Scanned", "Visited", "Surveyed", "Colonized"];

const SOL_GALAXY_ID = "galaxy-milky-way";
const SOL_SECTOR_ID = "sector-local-bubble";
const SOL_SYSTEM_ID = "system-sol";
const SOL_SYSTEM_SEED = "PROJECT-GENESIS-UNIVERSE:milky-way:local-bubble:sol";

export const SOL_UNLOCK_PROGRESSION = [
  { unlock: "Start", bodies: ["Earth"] },
  { unlock: "Lunar Exploration", bodies: ["Moon"] },
  { unlock: "Planetary Exploration", bodies: ["Mercury", "Venus", "Mars"] },
  { unlock: "Asteroid Mining", bodies: ["Asteroid Belt"] },
  { unlock: "Gas Giant Harvesting", bodies: ["Jupiter", "Saturn"] },
  { unlock: "Outer Moon Exploration", bodies: ["Europa", "Ganymede", "Titan", "Enceladus"] },
  { unlock: "Deep Space Communications", bodies: ["Uranus", "Neptune", "Pluto"] },
  { unlock: "Interstellar Navigation", bodies: ["Nearby procedural star systems"] }
];

type SolMoonInput = {
  parentId: string;
  parentName: string;
  name: string;
  planetClass?: string;
  planetSubclass?: string;
  rarity?: string;
  biome?: string;
  atmosphere?: string;
  gravity?: string;
  resources?: string[];
  notes?: string;
  unlockRequirement?: string;
};

function solBodyId(name: string) {
  return `body-${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}

function solMoon({
  parentId,
  parentName,
  name,
  planetClass = "Dead",
  planetSubclass = "Airless",
  rarity = "Common",
  biome = "Regolith",
  atmosphere = "Trace",
  gravity = "Low",
  resources = resourceNames(["RES-0041", "RES-0027", "RES-0051"]),
  notes = "Fixed Sol system moon.",
  unlockRequirement = "Outer Moon Exploration"
}: SolMoonInput): CelestialBodyNode {
  return {
    id: solBodyId(name),
    system_id: SOL_SYSTEM_ID,
    parent_body_id: parentId,
    name,
    celestial_body_type: "Moon",
    planet_class: planetClass,
    planet_subclass: planetSubclass,
    planet_rarity: rarity,
    biome,
    atmosphere,
    gravity,
    orbit_position: null,
    orbit_parent: parentName,
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: unlockRequirement,
    resources: normalizeResourceNames(resources),
    notes
  };
}

const MARS_MOONS: CelestialBodyNode[] = [
  solMoon({
    parentId: "body-mars",
    parentName: "Mars",
    name: "Phobos",
    planetClass: "Dead",
    planetSubclass: "Captured Asteroid",
    biome: "Cratered Rock",
    gravity: "Very Low",
    resources: resourceNames(["RES-0042", "RES-0023", "RES-0010", "RES-0027"]),
    unlockRequirement: "Planetary Exploration",
    notes: "Inner Martian moon suited for early orbital logistics and asteroid-mining practice."
  }),
  solMoon({
    parentId: "body-mars",
    parentName: "Mars",
    name: "Deimos",
    planetClass: "Dead",
    planetSubclass: "Captured Asteroid",
    biome: "Dusty Rock",
    gravity: "Very Low",
    resources: resourceNames(["RES-0042", "RES-0021", "RES-0027"]),
    unlockRequirement: "Planetary Exploration",
    notes: "Outer Martian moon with low-gravity staging potential."
  })
];

const JUPITER_ADDITIONAL_MOONS: CelestialBodyNode[] = [
  solMoon({
    parentId: "body-jupiter",
    parentName: "Jupiter",
    name: "Io",
    planetClass: "Lava",
    planetSubclass: "Volcanic",
    rarity: "Rare",
    biome: "Sulfur Lava Fields",
    atmosphere: "Thin Sulfur",
    gravity: "Low",
    resources: resourceNames(["RES-0015", "RES-0027", "RES-0163", "RES-0183"]),
    notes: "Hyper-volcanic moon shaped by tidal heating."
  }),
  solMoon({
    parentId: "body-jupiter",
    parentName: "Jupiter",
    name: "Callisto",
    planetClass: "Ice",
    planetSubclass: "Cratered Ice",
    rarity: "Uncommon",
    biome: "Ancient Ice Crust",
    atmosphere: "Trace",
    gravity: "Low",
    resources: resourceNames(["RES-0041", "RES-0027", "RES-0190"]),
    notes: "Heavily cratered outer Galilean moon with stable colony potential."
  })
];

const SATURN_ADDITIONAL_MOONS: CelestialBodyNode[] = [
  solMoon({ parentId: "body-saturn", parentName: "Saturn", name: "Mimas", planetClass: "Ice", planetSubclass: "Cratered Ice", biome: "Impact Basin", resources: resourceNames(["RES-0041", "RES-0027"]), notes: "Small icy moon dominated by a massive impact basin." }),
  solMoon({ parentId: "body-saturn", parentName: "Saturn", name: "Tethys", planetClass: "Ice", planetSubclass: "Fractured Ice", biome: "Ice Trenches", resources: resourceNames(["RES-0041", "RES-0179", "RES-0027"]), notes: "Icy moon with long fracture systems." }),
  solMoon({ parentId: "body-saturn", parentName: "Saturn", name: "Dione", planetClass: "Ice", planetSubclass: "Glacial", biome: "Ice Cliffs", resources: resourceNames(["RES-0041", "RES-0027", "RES-0190"]), notes: "Icy moon with bright cliff networks." }),
  solMoon({ parentId: "body-saturn", parentName: "Saturn", name: "Rhea", planetClass: "Ice", planetSubclass: "Cratered Ice", biome: "Ancient Ice Plains", resources: resourceNames(["RES-0041", "RES-0027"]), notes: "Large icy moon with broad cratered plains." }),
  solMoon({ parentId: "body-saturn", parentName: "Saturn", name: "Iapetus", planetClass: "Ice", planetSubclass: "Two-Tone Ice", rarity: "Uncommon", biome: "Dark Ridge", resources: resourceNames(["RES-0041", "RES-0190", "RES-0027"]), notes: "Two-toned moon with a dramatic equatorial ridge." }),
  solMoon({ parentId: "body-saturn", parentName: "Saturn", name: "Hyperion", planetClass: "Dead", planetSubclass: "Porous Rock", biome: "Chaotic Craters", gravity: "Very Low", resources: resourceNames(["RES-0021", "RES-0041", "RES-0027"]), notes: "Irregular porous moon with chaotic rotation." }),
  solMoon({ parentId: "body-saturn", parentName: "Saturn", name: "Phoebe", planetClass: "Dead", planetSubclass: "Captured Asteroid", biome: "Dark Craters", gravity: "Very Low", resources: resourceNames(["RES-0021", "RES-0041", "RES-0051"]), notes: "Captured outer moon with dark primitive material." })
];

const URANUS_MAJOR_MOONS: CelestialBodyNode[] = [
  solMoon({ parentId: "body-uranus", parentName: "Uranus", name: "Miranda", planetClass: "Ice", planetSubclass: "Fractured Ice", rarity: "Uncommon", biome: "Patchwork Cliffs", resources: resourceNames(["RES-0041", "RES-0027", "RES-0179"]), notes: "Uranian moon with extreme fractured terrain." }),
  solMoon({ parentId: "body-uranus", parentName: "Uranus", name: "Ariel", planetClass: "Ice", planetSubclass: "Canyon Ice", biome: "Ice Canyons", resources: resourceNames(["RES-0041", "RES-0045", "RES-0027"]), notes: "Bright icy moon cut by canyons." }),
  solMoon({ parentId: "body-uranus", parentName: "Uranus", name: "Umbriel", planetClass: "Ice", planetSubclass: "Dark Ice", biome: "Ancient Dark Ice", resources: resourceNames(["RES-0041", "RES-0190", "RES-0027"]), notes: "Dark ancient icy moon." }),
  solMoon({ parentId: "body-uranus", parentName: "Uranus", name: "Titania", planetClass: "Ice", planetSubclass: "Glacial", rarity: "Uncommon", biome: "Ice Faults", resources: resourceNames(["RES-0041", "RES-0027", "RES-0179"]), notes: "Largest Uranian moon with broad fault valleys." }),
  solMoon({ parentId: "body-uranus", parentName: "Uranus", name: "Oberon", planetClass: "Ice", planetSubclass: "Cratered Ice", biome: "Cratered Ice Plains", resources: resourceNames(["RES-0041", "RES-0027", "RES-0190"]), notes: "Outer major moon of Uranus with ancient crater fields." })
];

const NEPTUNE_MAJOR_MOONS: CelestialBodyNode[] = [
  solMoon({
    parentId: "body-neptune",
    parentName: "Neptune",
    name: "Triton",
    planetClass: "Ice",
    planetSubclass: "Cryovolcanic",
    rarity: "Rare",
    biome: "Nitrogen Geysers",
    atmosphere: "Thin Nitrogen",
    gravity: "Low",
    resources: resourceNames(["RES-0045", "RES-0044", "RES-0041", "RES-0047"]),
    notes: "Captured Kuiper-belt moon with active nitrogen geysers."
  }),
  solMoon({ parentId: "body-neptune", parentName: "Neptune", name: "Nereid", planetClass: "Ice", planetSubclass: "Captured Ice", biome: "Outer Ice Rock", gravity: "Very Low", resources: resourceNames(["RES-0041", "RES-0027", "RES-0190"]), notes: "Distant irregular Neptunian moon." }),
  solMoon({ parentId: "body-neptune", parentName: "Neptune", name: "Proteus", planetClass: "Dead", planetSubclass: "Irregular Rock", biome: "Dark Craters", gravity: "Very Low", resources: resourceNames(["RES-0027", "RES-0041", "RES-0051"]), notes: "Large irregular inner moon of Neptune." })
];

const PLUTO_MOONS: CelestialBodyNode[] = [
  solMoon({ parentId: "body-pluto", parentName: "Pluto", name: "Charon", planetClass: "Ice", planetSubclass: "Binary Ice", rarity: "Uncommon", biome: "Frozen Canyons", atmosphere: "None", gravity: "Very Low", resources: resourceNames(["RES-0041", "RES-0179", "RES-0044"]), notes: "Pluto's largest moon and binary companion." }),
  solMoon({ parentId: "body-pluto", parentName: "Pluto", name: "Nix", planetClass: "Ice", planetSubclass: "Small Ice", biome: "Outer Ice", atmosphere: "None", gravity: "Very Low", resources: resourceNames(["RES-0041", "RES-0044"]), notes: "Small icy moon of Pluto." }),
  solMoon({ parentId: "body-pluto", parentName: "Pluto", name: "Hydra", planetClass: "Ice", planetSubclass: "Small Ice", biome: "Outer Ice", atmosphere: "None", gravity: "Very Low", resources: resourceNames(["RES-0041", "RES-0044"]), notes: "Small outer icy moon of Pluto." }),
  solMoon({ parentId: "body-pluto", parentName: "Pluto", name: "Kerberos", planetClass: "Ice", planetSubclass: "Small Ice", biome: "Outer Ice", atmosphere: "None", gravity: "Very Low", resources: resourceNames(["RES-0041", "RES-0190"]), notes: "Small dark icy moon of Pluto." }),
  solMoon({ parentId: "body-pluto", parentName: "Pluto", name: "Styx", planetClass: "Ice", planetSubclass: "Small Ice", biome: "Outer Ice", atmosphere: "None", gravity: "Very Low", resources: resourceNames(["RES-0041", "RES-0044"]), notes: "Small outer moon of Pluto." })
];

const ADDITIONAL_SOL_DWARF_PLANETS: CelestialBodyNode[] = [
  {
    id: "body-ceres",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Ceres",
    celestial_body_type: "Dwarf Planet",
    planet_class: "Ice",
    planet_subclass: "Cryovolcanic",
    planet_rarity: "Uncommon",
    biome: "Hydrated Cratered Plains",
    atmosphere: "Transient Exosphere",
    gravity: "Very Low",
    orbit_position: null,
    orbit_parent: "Sol",
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Asteroid Mining",
    resources: resourceNames(["RES-0041", "RES-0182", "RES-0027", "RES-0190"]),
    notes: "IAU-recognized dwarf planet in the main asteroid belt with water ice, hydrated minerals, salts, and evidence for brines."
  },
  {
    id: "body-haumea",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Haumea",
    celestial_body_type: "Dwarf Planet",
    planet_class: "Ice",
    planet_subclass: "Fractured Ice",
    planet_rarity: "Rare",
    biome: "Rapid-Rotation Ice",
    atmosphere: "None Confirmed",
    gravity: "Very Low",
    orbit_position: null,
    orbit_parent: "Sol",
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Deep Space Communications",
    resources: resourceNames(["RES-0041", "RES-0027"]),
    notes: "IAU-recognized rapidly rotating elongated dwarf planet with a water-ice-rich surface and a narrow ring."
  },
  {
    id: "body-makemake",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Makemake",
    celestial_body_type: "Dwarf Planet",
    planet_class: "Ice",
    planet_subclass: "Polar",
    planet_rarity: "Rare",
    biome: "Methane Frost",
    atmosphere: "None Confirmed",
    gravity: "Very Low",
    orbit_position: null,
    orbit_parent: "Sol",
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Deep Space Communications",
    resources: resourceNames(["RES-0044", "RES-0045", "RES-0041"]),
    notes: "IAU-recognized Kuiper Belt dwarf planet with methane, ethane, and probable nitrogen-bearing surface ices."
  },
  {
    id: "body-eris",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Eris",
    celestial_body_type: "Dwarf Planet",
    planet_class: "Ice",
    planet_subclass: "Polar",
    planet_rarity: "Rare",
    biome: "Distant Methane Ice",
    atmosphere: "Frozen / None Present",
    gravity: "Very Low",
    orbit_position: null,
    orbit_parent: "Sol",
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Deep Space Communications",
    resources: resourceNames(["RES-0044", "RES-0045", "RES-0041"]),
    notes: "IAU-recognized distant dwarf planet with a bright methane-ice-rich surface and highly inclined eccentric orbit."
  }
];

const SOL_REFERENCE_REGIONS: CelestialBodyNode[] = [
  {
    id: "body-kuiper-belt",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Kuiper Belt",
    celestial_body_type: "Small Body Region",
    planet_class: null,
    planet_subclass: "Trans-Neptunian Disk",
    planet_rarity: "Uncommon",
    biome: "Icy Minor Bodies",
    atmosphere: "None",
    gravity: "Microgravity",
    orbit_position: null,
    orbit_parent: "Sol",
    landable: false,
    colonizable: false,
    colonizable_status: "Not Colonizable",
    uses_orbital_gameplay: true,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Deep Space Communications",
    resources: resourceNames(["RES-0041", "RES-0044", "RES-0045", "RES-0179", "RES-0190"]),
    notes: "Canonical circumstellar disk of icy minor bodies beyond Neptune; not forced into the Planet schema."
  },
  {
    id: "body-oort-cloud",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Oort Cloud",
    celestial_body_type: "Small Body Region",
    planet_class: null,
    planet_subclass: "Distant Spherical Comet Reservoir",
    planet_rarity: "Rare",
    biome: "Distant Icy Comets",
    atmosphere: "None",
    gravity: "Microgravity",
    orbit_position: null,
    orbit_parent: "Sol",
    landable: false,
    colonizable: false,
    colonizable_status: "Not Colonizable",
    uses_orbital_gameplay: true,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Interstellar Navigation",
    resources: resourceNames(["RES-0041", "RES-0044", "RES-0045", "RES-0179", "RES-0190"]),
    notes: "Model-supported distant comet reservoir marking the outermost gravitational domain of Sol; confidence is lower than directly observed belts."
  }
];

const SOL_CELESTIAL_BODIES: CelestialBodyNode[] = [
  {
    id: "body-sol",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: null,
    name: "Sol",
    celestial_body_type: "Star",
    planet_class: null,
    planet_subclass: null,
    planet_rarity: null,
    biome: null,
    atmosphere: null,
    gravity: null,
    orbit_position: null,
    orbit_parent: null,
    landable: false,
    colonizable: false,
    colonizable_status: "Not Colonizable",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Start",
    resources: resourceNames(["RES-0189"]),
    notes: "The home star of humanity.",
    scientific_profile: {
      schemaVersion: "sol-star-profile-v1",
      stellarClassification: "G2 V yellow main-sequence star",
      massKg: 1.9885e30,
      radiusKm: 695700,
      luminosityW: 3.828e26,
      effectiveTemperatureK: 5772,
      coreTemperatureK: 1.57e7,
      ageGyr: 4.568,
      metallicityDex: 0,
      rotationBehavior: "Differential rotation; approximately 25 days at the equator and 35 days near the poles.",
      activityCycleYears: 11,
      solarWind: "Variable magnetized plasma flowing through the heliosphere.",
      flareBehavior: "Magnetic active regions produce flares and coronal mass ejections.",
      radiation: "Electromagnetic and particle radiation varies with the solar activity cycle.",
      conservativeHabitableZoneAu: [0.95, 1.67],
      frostLineAu: 2.7,
      systemFormationAgeGyr: 4.568,
      canonicalPlanetCount: 8,
      canonicalDwarfPlanetCount: 5,
      majorRegionIds: ["body-asteroid-belt", "body-kuiper-belt", "body-oort-cloud"],
      heliosphere: "Solar-wind bubble bounded by termination shock, heliosheath, and heliopause.",
      presentationProfileId: "presentation_star_yellow_main_sequence",
      confidence: 0.96,
      estimatedFields: ["coreTemperatureK", "conservativeHabitableZoneAu", "frostLineAu"],
      sourceIds: ["nasa_planetary_science", "jpl_planetary_physical_parameters"]
    }
  },
  {
    id: "body-earth",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Earth",
    celestial_body_type: "Planet",
    planet_class: "Terrestrial",
    planet_subclass: "Earthlike",
    planet_rarity: "Common",
    biome: "Mixed",
    atmosphere: "Breathable",
    gravity: "Standard",
    orbit_position: 3,
    orbit_parent: "Sol",
    landable: true,
    colonizable: true,
    colonizable_status: "Already Colonized",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: true,
    is_procedural: false,
    unlock_requirement: "Start",
    resources: ResourceService.earthResourceNames(),
    notes: "Humanity's home world and the starting point of Project Genesis."
  },
  {
    id: "body-moon",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-earth",
    name: "Moon",
    celestial_body_type: "Moon",
    planet_class: "Dead",
    planet_subclass: "Airless",
    planet_rarity: "Common",
    biome: "Regolith",
    atmosphere: "None",
    gravity: "Low",
    orbit_position: null,
    orbit_parent: "Earth",
    landable: true,
    colonizable: true,
    colonizable_status: "Colonizable",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Lunar Exploration",
    resources: resourceNames(["RES-0049", "RES-0042", "RES-0031", "RES-0038"]),
    notes: "First off-world colony target."
  },
  {
    id: "body-mercury",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Mercury",
    celestial_body_type: "Planet",
    planet_class: "Dead",
    planet_subclass: "Barren",
    planet_rarity: "Common",
    biome: "Rocky",
    atmosphere: "Trace",
    gravity: "Low",
    orbit_position: 1,
    orbit_parent: "Sol",
    landable: true,
    colonizable: true,
    colonizable_status: "Late Game",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Planetary Exploration",
    resources: resourceNames(["RES-0010", "RES-0023", "RES-0027", "RES-0038"]),
    notes: "Harsh inner-world mining planet close to Sol."
  },
  {
    id: "body-venus",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Venus",
    celestial_body_type: "Planet",
    planet_class: "Toxic",
    planet_subclass: "Green Atmosphere",
    planet_rarity: "Rare",
    biome: "Volcanic Highlands",
    atmosphere: "Dense CO2",
    gravity: "High",
    orbit_position: 2,
    orbit_parent: "Sol",
    landable: false,
    colonizable: true,
    colonizable_status: "Terraforming Required",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Planetary Exploration",
    resources: resourceNames(["RES-0015", "RES-0182", "RES-0183", "RES-0031"]),
    notes: "Extreme heat and pressure. Major late-game terraforming candidate."
  },
  {
    id: "body-mars",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Mars",
    celestial_body_type: "Planet",
    planet_class: "Desert",
    planet_subclass: "Rock Desert",
    planet_rarity: "Common",
    biome: "Dust Basin",
    atmosphere: "Thin CO2",
    gravity: "Low",
    orbit_position: 4,
    orbit_parent: "Sol",
    landable: true,
    colonizable: true,
    colonizable_status: "Colonizable",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Planetary Exploration",
    resources: resourceNames(["RES-0010", "RES-0027", "RES-0041", "RES-0031"]),
    notes: "First major planetary colony target."
  },
  ...MARS_MOONS,
  {
    id: "body-asteroid-belt",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Asteroid Belt",
    celestial_body_type: "Asteroid Belt",
    planet_class: null,
    planet_subclass: "Asteroid Megabelt",
    planet_rarity: "Common",
    biome: null,
    atmosphere: "None",
    gravity: "Microgravity",
    orbit_position: null,
    orbit_parent: "Sol",
    landable: false,
    colonizable: false,
    colonizable_status: "Not Colonizable",
    uses_orbital_gameplay: true,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Asteroid Mining",
    resources: resourceNames(["RES-0010", "RES-0023", "RES-0025", "RES-0032", "RES-0034", "RES-0038"]),
    notes: "Resource field between Mars and Jupiter."
  },
  {
    id: "body-jupiter",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Jupiter",
    celestial_body_type: "Planet",
    planet_class: "Gas Giant",
    planet_subclass: "Storm Giant",
    planet_rarity: "Rare",
    biome: "Upper Atmosphere",
    atmosphere: "Hydrogen / Helium",
    gravity: "Extreme",
    orbit_position: 5,
    orbit_parent: "Sol",
    landable: false,
    colonizable: false,
    colonizable_status: "Not Colonizable",
    uses_orbital_gameplay: true,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Gas Giant Harvesting",
    resources: resourceNames(["RES-0177", "RES-0178", "RES-0049", "RES-0144", "RES-0050"]),
    notes: "First major orbital harvesting world."
  },
  ...JUPITER_ADDITIONAL_MOONS,
  {
    id: "body-europa",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-jupiter",
    name: "Europa",
    celestial_body_type: "Moon",
    planet_class: "Ice",
    planet_subclass: "Frozen Ocean",
    planet_rarity: "Rare",
    biome: "Ice Shell",
    atmosphere: "Trace",
    gravity: "Low",
    orbit_position: null,
    orbit_parent: "Jupiter",
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Outer Moon Exploration",
    resources: resourceNames(["RES-0041", "RES-0047", "RES-0179"]),
    notes: "Possible subsurface ocean world."
  },
  {
    id: "body-ganymede",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-jupiter",
    name: "Ganymede",
    celestial_body_type: "Moon",
    planet_class: "Ice",
    planet_subclass: "Glacial",
    planet_rarity: "Uncommon",
    biome: "Ice Plains",
    atmosphere: "Trace",
    gravity: "Low",
    orbit_position: null,
    orbit_parent: "Jupiter",
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Outer Moon Exploration",
    resources: resourceNames(["RES-0041", "RES-0010", "RES-0027"]),
    notes: "Large icy moon with colony potential."
  },
  {
    id: "body-saturn",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Saturn",
    celestial_body_type: "Planet",
    planet_class: "Gas Giant",
    planet_subclass: "Banded",
    planet_rarity: "Rare",
    biome: "Upper Atmosphere",
    atmosphere: "Hydrogen / Helium",
    gravity: "Extreme",
    orbit_position: 6,
    orbit_parent: "Sol",
    landable: false,
    colonizable: false,
    colonizable_status: "Not Colonizable",
    uses_orbital_gameplay: true,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Gas Giant Harvesting",
    resources: resourceNames(["RES-0177", "RES-0178", "RES-0049", "RES-0180"]),
    notes: "Orbital harvesting world with iconic rings."
  },
  {
    id: "body-titan",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-saturn",
    name: "Titan",
    celestial_body_type: "Moon",
    planet_class: "Toxic",
    planet_subclass: "Chemical Seas",
    planet_rarity: "Rare",
    biome: "Hydrocarbon Lakes",
    atmosphere: "Dense Nitrogen",
    gravity: "Low",
    orbit_position: null,
    orbit_parent: "Saturn",
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Outer Moon Exploration",
    resources: resourceNames(["RES-0180", "RES-0181", "RES-0045"]),
    notes: "Fuel economy and atmospheric chemistry world."
  },
  {
    id: "body-enceladus",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-saturn",
    name: "Enceladus",
    celestial_body_type: "Moon",
    planet_class: "Ice",
    planet_subclass: "Cryovolcanic",
    planet_rarity: "Rare",
    biome: "Ice Geysers",
    atmosphere: "Trace",
    gravity: "Very Low",
    orbit_position: null,
    orbit_parent: "Saturn",
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Outer Moon Exploration",
    resources: resourceNames(["RES-0041", "RES-0047", "RES-0190"]),
    notes: "Cryovolcanic research world."
  },
  ...SATURN_ADDITIONAL_MOONS,
  {
    id: "body-uranus",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Uranus",
    celestial_body_type: "Planet",
    planet_class: "Gas Giant",
    planet_subclass: "Ice Giant",
    planet_rarity: "Uncommon",
    biome: "Upper Atmosphere",
    atmosphere: "Hydrogen / Methane / Helium",
    gravity: "Extreme",
    orbit_position: 7,
    orbit_parent: "Sol",
    landable: false,
    colonizable: false,
    colonizable_status: "Not Colonizable",
    uses_orbital_gameplay: true,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Deep Space Communications",
    resources: resourceNames(["RES-0177", "RES-0180", "RES-0179", "RES-0178"]),
    notes: "Outer system ice giant."
  },
  ...URANUS_MAJOR_MOONS,
  {
    id: "body-neptune",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Neptune",
    celestial_body_type: "Planet",
    planet_class: "Gas Giant",
    planet_subclass: "Cyclone Giant",
    planet_rarity: "Rare",
    biome: "Upper Atmosphere",
    atmosphere: "Hydrogen / Helium / Methane",
    gravity: "Extreme",
    orbit_position: 8,
    orbit_parent: "Sol",
    landable: false,
    colonizable: false,
    colonizable_status: "Not Colonizable",
    uses_orbital_gameplay: true,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Deep Space Communications",
    resources: resourceNames(["RES-0177", "RES-0178", "RES-0144", "RES-0180"]),
    notes: "High-wind outer system gas giant."
  },
  ...NEPTUNE_MAJOR_MOONS,
  {
    id: "body-pluto",
    system_id: SOL_SYSTEM_ID,
    parent_body_id: "body-sol",
    name: "Pluto",
    celestial_body_type: "Dwarf Planet",
    planet_class: "Ice",
    planet_subclass: "Polar",
    planet_rarity: "Uncommon",
    biome: "Frozen Plains",
    atmosphere: "Thin Nitrogen",
    gravity: "Very Low",
    orbit_position: null,
    orbit_parent: "Sol",
    landable: true,
    colonizable: true,
    colonizable_status: "Future",
    uses_orbital_gameplay: false,
    is_fixed: true,
    is_starting_body: false,
    is_procedural: false,
    unlock_requirement: "Deep Space Communications",
    resources: resourceNames(["RES-0045", "RES-0044", "RES-0041"]),
    notes: "Edge of the starting Sol system."
  },
  ...PLUTO_MOONS,
  ...ADDITIONAL_SOL_DWARF_PLANETS,
  ...SOL_REFERENCE_REGIONS
];

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function deriveSeed(parentSeed: string, scope: string, index?: number) {
  const suffix = typeof index === "number" ? `:${index}` : "";
  return `${parentSeed}:${scope}${suffix}:${hashSeed(`${parentSeed}:${scope}${suffix}`).toString(36)}`;
}

export function deriveChildSeed(parentSeed: string, scope: string, index: number) {
  return deriveSeed(parentSeed, scope, index);
}

function generationMetadata(seed: string, parentSeed: string | null, generationIndex: number) {
  return {
    seed,
    generation_parent_seed: parentSeed,
    generation_index: generationIndex,
    generation_version: SEED_GENERATION_VERSION
  };
}

export function planetSubSeeds(planetSeed: string) {
  return Object.fromEntries(PLANET_SUB_SEED_KEYS.map((key) => [key, deriveSeed(planetSeed, key)]));
}

function seededRandom(seed: string): RandomSource {
  let state = hashSeed(seed) || 1;

  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) / 4294967296;
  };
}

function numericRange(random: RandomSource, min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

function pick<T>(values: T[], random: RandomSource, fallback: T) {
  if (!values.length) {
    return fallback;
  }

  return values[Math.floor(random() * values.length)] ?? fallback;
}

function pickWeighted<T extends { weight: number }>(values: T[], random: RandomSource, fallback: T) {
  const totalWeight = values.reduce((total, item) => total + item.weight, 0);
  let roll = random() * totalWeight;

  for (const item of values) {
    roll -= item.weight;
    if (roll <= 0) {
      return item;
    }
  }

  return fallback;
}

function pickWeightedPlanetClass(random: RandomSource) {
  const totalWeight = PLANET_CLASS_MODEL.reduce((total, item) => total + item.spawnWeight, 0);
  let roll = random() * totalWeight;

  for (const planetClass of PLANET_CLASS_MODEL) {
    roll -= planetClass.spawnWeight;
    if (roll <= 0) {
      return planetClass;
    }
  }

  return PLANET_CLASS_MODEL[0];
}

function generatedName(seed: string, kind: string) {
  const random = seededRandom(`${seed}:name:${kind}`);
  return `${pick(namePrefixes, random, "Astra")} ${pick(nameSuffixes, random, "Prime")}-${String(hashSeed(seed) % 997).padStart(3, "0")}`;
}

function discoveryStateForSystem(sector: SectorNode, systemIndex: number): DiscoveryState {
  if (sector.id === SOL_SECTOR_ID && systemIndex === 0) return "Colonized";
  if (!sector.discovered && sector.discovery_level === "Unknown") return "Undetected";
  if (systemIndex === 1) return "Visited";
  if (systemIndex === 2) return "Scanned";
  if (systemIndex === 3) return "Probed";
  if (systemIndex >= 4 && systemIndex <= 7) return "Detected";
  return "Undetected";
}

function discoveryTimestamps(state: DiscoveryState) {
  const detected = state !== "Undetected";
  const probed = ["Probed", "Scanned", "Visited", "Surveyed", "Colonized"].includes(state);
  const scanned = ["Scanned", "Visited", "Surveyed", "Colonized"].includes(state);
  const visited = ["Visited", "Surveyed", "Colonized"].includes(state);
  const surveyed = ["Surveyed", "Colonized"].includes(state);
  const colonized = state === "Colonized";

  return {
    detected_at: detected ? "derived" : null,
    probed_at: probed ? "derived" : null,
    scanned_at: scanned ? "derived" : null,
    visited_at: visited ? "derived" : null,
    surveyed_at: surveyed ? "derived" : null,
    colonized_at: colonized ? "derived" : null
  };
}

export function generateUniverse(universeSeed: string, name = "Genesis Universe"): UniverseNode {
  const seed = universeSeed.trim() || "PROJECT-GENESIS-UNIVERSE";

  return {
    id: `universe-${slug(seed)}`,
    universe_seed: seed,
    name,
    created_at: "derived",
    visual_signature: generateVisualSignature({ universeSeed: seed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "universe", canonicalObjectId: `universe-${slug(seed)}` })
  };
}

export function generateGalaxy(universeSeed: string, galaxyIndex = 0): GalaxyNode {
  if (galaxyIndex === 0) {
    return {
      id: SOL_GALAXY_ID,
      universe_id: `universe-${slug(universeSeed)}`,
      galaxy_seed: "PROJECT-GENESIS-UNIVERSE:milky-way",
      name: "Milky Way",
      galaxy_type: "Spiral Galaxy",
      galaxy_size: "Starting Galaxy",
      visual_signature: generateVisualSignature({ universeSeed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "galaxy", canonicalObjectId: SOL_GALAXY_ID, override: { archetypeId: "grand_design_spiral", paletteId: "palette_cyan_amber" } }),
      sector_count: 100000,
      is_fixed: true,
      is_procedural: false,
      ...generationMetadata("PROJECT-GENESIS-UNIVERSE:milky-way", universeSeed, galaxyIndex)
    };
  }

  const galaxySeed = deriveSeed(universeSeed, "galaxy", galaxyIndex);
  const random = seededRandom(galaxySeed);
  const galaxySize = pickWeighted(galaxySizes, random, galaxySizes[galaxySizes.length - 1]);
  const galaxyId = `galaxy-${galaxyIndex}-${hashSeed(galaxySeed).toString(16)}`;

  return {
    id: galaxyId,
    universe_id: `universe-${slug(universeSeed)}`,
    galaxy_seed: galaxySeed,
    name: generatedName(galaxySeed, "galaxy"),
    galaxy_type: pick(galaxyTypes, random, "Spiral"),
    galaxy_size: galaxySize.name,
    visual_signature: generateVisualSignature({ universeSeed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "galaxy", canonicalObjectId: galaxyId }),
    sector_count: galaxySize.sectors,
    is_fixed: false,
    is_procedural: true,
    ...generationMetadata(galaxySeed, universeSeed, galaxyIndex)
  };
}

export function generateSector(galaxy: GalaxyNode, sectorIndex: number): SectorNode {
  if (galaxy.id === SOL_GALAXY_ID && sectorIndex === 0) {
    return {
      id: SOL_SECTOR_ID,
      galaxy_id: galaxy.id,
      sector_seed: "PROJECT-GENESIS-UNIVERSE:milky-way:local-bubble",
      sector_name: "Local Bubble",
      coordinates_x: 0,
      coordinates_y: 0,
      coordinates_z: 0,
      sector_type: "Civilized Space",
      sector_rarity: "Common",
      system_count: 24,
      difficulty: 5,
      discovery_value: 100,
      discovery_level: "Scanned",
      modifier: "Starting Region",
      resource_signal: "Balanced",
      colonized_worlds: 1,
      discovered: true,
      discovered_at: "derived",
      visual_signature: generateVisualSignature({ universeSeed: galaxy.galaxy_seed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "sector", canonicalObjectId: SOL_SECTOR_ID, parentSignature: galaxy.visual_signature }),
      is_fixed: true,
      is_procedural: false,
      ...generationMetadata("PROJECT-GENESIS-UNIVERSE:milky-way:local-bubble", galaxy.galaxy_seed, sectorIndex)
    };
  }

  const sectorSeed = deriveSeed(galaxy.galaxy_seed, "sector", sectorIndex);
  const random = seededRandom(sectorSeed);
  const sectorRarity = pickWeighted(sectorRarities, random, sectorRarities[0]).name;
  const sectorType = pick(sectorTypes, random, "Uncharted Space");
  const discovered = sectorIndex === 0;
  const nearbyDetected = sectorIndex > 0 && sectorIndex < 6;
  const discoveryLevel = discovered ? "Scanned" : nearbyDetected ? "Detected" : "Unknown";
  const difficultyByRarity: Record<string, [number, number]> = {
    Common: [5, 28],
    Uncommon: [20, 42],
    Rare: [35, 60],
    Epic: [55, 78],
    Legendary: [72, 90],
    Mythic: [82, 96],
    Relic: [88, 100],
    Genesis: [96, 100]
  };
  const valueByRarity: Record<string, [number, number]> = {
    Common: [100, 300],
    Uncommon: [250, 650],
    Rare: [600, 1300],
    Epic: [1200, 3000],
    Legendary: [2500, 7000],
    Mythic: [6500, 15000],
    Relic: [14000, 40000],
    Genesis: [75000, 150000]
  };
  const [difficultyMin, difficultyMax] = difficultyByRarity[sectorRarity] ?? difficultyByRarity.Common;
  const [valueMin, valueMax] = valueByRarity[sectorRarity] ?? valueByRarity.Common;
  const sectorId = `sector-${sectorIndex}-${hashSeed(sectorSeed).toString(16)}`;

  return {
    id: sectorId,
    galaxy_id: galaxy.id,
    sector_seed: sectorSeed,
    sector_name: `${pick(namePrefixes, random, "Astra")} ${pick(["Reach", "Veil", "Expanse", "Frontier", "Basin", "Crown", "Drift"], random, "Reach")}-${String(sectorIndex + 1).padStart(3, "0")}`,
    coordinates_x: numericRange(random, -999, 999),
    coordinates_y: numericRange(random, -999, 999),
    coordinates_z: numericRange(random, -999, 999),
    sector_type: sectorType,
    sector_rarity: sectorRarity,
    system_count: numericRange(random, 20, 150),
    difficulty: numericRange(random, difficultyMin, difficultyMax),
    discovery_value: numericRange(random, valueMin, valueMax),
    discovery_level: discoveryLevel,
    modifier: pick(sectorModifiers, random, "Stable Corridor"),
    resource_signal: pick(resourceBiases, random, "Balanced"),
    colonized_worlds: discovered ? numericRange(random, 0, 3) : 0,
    discovered,
    discovered_at: discovered ? "derived" : null,
    visual_signature: generateVisualSignature({ universeSeed: galaxy.galaxy_seed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "sector", canonicalObjectId: sectorId, parentSignature: galaxy.visual_signature }),
    is_fixed: false,
    is_procedural: true,
    ...generationMetadata(sectorSeed, galaxy.galaxy_seed, sectorIndex)
  };
}

export function generateSectors(galaxy: GalaxyNode, limit = 24) {
  const count = Math.min(galaxy.sector_count, limit);
  const siblings: ProceduralVisualSignature[] = [];
  return Array.from({ length: count }, (_, index) => {
    const sector = generateSector(galaxy, index);
    if (!sector.is_fixed) sector.visual_signature = generateUniqueVisualSignature({ universeSeed: galaxy.galaxy_seed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "sector", canonicalObjectId: sector.id, parentSignature: galaxy.visual_signature }, siblings);
    if (sector.visual_signature) siblings.push(sector.visual_signature);
    return sector;
  });
}

export function generateStarSystem(sector: SectorNode, systemIndex: number): StarSystemNode {
  if (sector.id === SOL_SECTOR_ID && systemIndex === 0) {
    return {
      id: SOL_SYSTEM_ID,
      sector_id: sector.id,
      system_seed: SOL_SYSTEM_SEED,
      system_name: "Sol",
      catalog_designation: "SOL-0001",
      system_type: "Single Star System",
      system_role: "Starting System",
      generation_type: "Handcrafted",
      system_rarity: "Common",
      star_count: 1,
      planet_count: SOL_CELESTIAL_BODIES.filter((body) => body.celestial_body_type !== "Star").length,
      primary_star: "Sol",
      star_type: "Yellow Main Sequence",
      resource_bias: "Balanced",
      danger_level: 8,
      starting_system: true,
      is_procedural: false,
      discovery_state: "Colonized",
      ...discoveryTimestamps("Colonized"),
      estimated_planet_count_min: 15,
      estimated_planet_count_max: 15,
      estimated_celestial_body_count_min: 16,
      estimated_celestial_body_count_max: 16,
      estimated_danger_level: 8,
      known_star_signature: "Yellow Main Sequence",
      visual_signature: generateVisualSignature({ universeSeed: sector.sector_seed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "system", canonicalObjectId: SOL_SYSTEM_ID, parentSignature: sector.visual_signature, override: { archetypeId: "warm_golden_single_star" } }),
      probe_data: {
        interaction: "Starting system",
        status: "Fully known"
      },
      scan_data: {
        celestial_bodies: SOL_CELESTIAL_BODIES.length,
        handcrafted: true
      },
      discovered: true,
      discovered_at: "derived",
      is_fixed: true,
      ...generationMetadata(SOL_SYSTEM_SEED, sector.sector_seed, systemIndex)
    };
  }

  const systemSeed = deriveSeed(sector.sector_seed, "system", systemIndex);
  const random = seededRandom(systemSeed);
  const rarity = pick(systemRarities, random, "Common");
  const starType = pick(starTypes, seededRandom(deriveSeed(systemSeed, "primary-star")), "Yellow Main Sequence");
  const planetCount = numericRange(random, 1, rarity === "Common" ? 6 : 12);
  const dangerLevel = numericRange(random, 1, rarity === "Common" ? 45 : 100);
  const discoveryState = discoveryStateForSystem(sector, systemIndex);
  const estimatedPlanetMin = Math.max(1, planetCount - numericRange(random, 1, 3));
  const estimatedPlanetMax = planetCount + numericRange(random, 1, 4);
  const systemId = `system-${systemIndex}-${hashSeed(systemSeed).toString(16)}`;

  return {
    id: systemId,
    sector_id: sector.id,
    system_seed: systemSeed,
    system_name: generatedName(systemSeed, "system"),
    catalog_designation: `PG-${Math.abs(sector.coordinates_x)}.${Math.abs(sector.coordinates_y)}.${systemIndex + 1}`,
    system_type: "Procedural Star System",
    system_role: "Exploration Target",
    generation_type: "Procedural",
    system_rarity: rarity,
    star_count: numericRange(random, rarity === "Legendary" ? 2 : 1, rarity === "Common" ? 1 : 3),
    planet_count: planetCount,
    primary_star: "Procedural Primary",
    star_type: starType,
    resource_bias: pick(resourceBiases, random, "Balanced"),
    danger_level: dangerLevel,
    starting_system: false,
    is_procedural: true,
    discovery_state: discoveryState,
    ...discoveryTimestamps(discoveryState),
    estimated_planet_count_min: estimatedPlanetMin,
    estimated_planet_count_max: estimatedPlanetMax,
    estimated_celestial_body_count_min: estimatedPlanetMin + 1,
    estimated_celestial_body_count_max: estimatedPlanetMax + 2,
    estimated_danger_level: Math.max(1, Math.min(100, dangerLevel + numericRange(random, -10, 10))),
    known_star_signature: discoveryState === "Detected" ? "Unknown stellar signal" : starType,
    visual_signature: generateVisualSignature({ universeSeed: sector.sector_seed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "system", canonicalObjectId: systemId, parentSignature: sector.visual_signature }),
    probe_data: {
      probe_accuracy: discoveryState === "Probed" ? "Low" : ["Scanned", "Visited", "Surveyed", "Colonized"].includes(discoveryState) ? "Moderate" : "None",
      estimated_bodies: `${estimatedPlanetMin + 1}-${estimatedPlanetMax + 2}`
    },
    scan_data: {
      system_rarity: ["Scanned", "Visited", "Surveyed", "Colonized"].includes(discoveryState) ? rarity : null,
      resource_bias: ["Visited", "Surveyed", "Colonized"].includes(discoveryState) ? "Known after visit" : null
    },
    discovered: discoveryState !== "Undetected",
    discovered_at: discoveryState !== "Undetected" ? "derived" : null,
    is_fixed: false,
    ...generationMetadata(systemSeed, sector.sector_seed, systemIndex)
  };
}

export function generateStarSystems(sector: SectorNode, limit = 12) {
  const count = Math.min(sector.system_count, limit);
  const siblings: ProceduralVisualSignature[] = [];
  return Array.from({ length: count }, (_, index) => {
    const system = generateStarSystem(sector, index);
    if (!system.is_fixed) system.visual_signature = generateUniqueVisualSignature({ universeSeed: sector.sector_seed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "system", canonicalObjectId: system.id, parentSignature: sector.visual_signature }, siblings);
    if (system.visual_signature) siblings.push(system.visual_signature);
    return system;
  });
}

export function generateStar(system: StarSystemNode, starIndex: number): StarNode {
  if (system.id === SOL_SYSTEM_ID) {
    return {
      id: "star-sol",
      system_id: SOL_SYSTEM_ID,
      star_seed: `${SOL_SYSTEM_SEED}:star:sol`,
      star_name: "Sol",
      star_type: "Yellow Main Sequence",
      star_size: "Standard",
      star_temperature: 5772,
      star_color: "Yellow",
      luminosity: 100,
      age: "4.6b years",
      is_fixed: true,
      is_procedural: false,
      ...generationMetadata(`${SOL_SYSTEM_SEED}:star:sol`, system.system_seed, starIndex)
    };
  }

  const starSeed = deriveSeed(system.system_seed, "star", starIndex);
  const random = seededRandom(starSeed);
  const starType = pick(starTypes, random, "Yellow Main Sequence");

  return {
    id: `star-${starIndex}-${hashSeed(starSeed).toString(16)}`,
    system_id: system.id,
    star_seed: starSeed,
    star_name: generatedName(starSeed, "star"),
    star_type: starType,
    star_size: pick(starSizes, random, "Standard"),
    star_temperature: numericRange(random, 2600, starType === "Blue Giant" ? 30000 : 9000),
    star_color: pick(starColors, random, "Yellow"),
    luminosity: numericRange(random, 1, starType === "Black Hole" ? 20 : 500),
    age: `${numericRange(random, 1, 13)}.${numericRange(random, 0, 9)}b years`,
    is_fixed: false,
    is_procedural: true,
    ...generationMetadata(starSeed, system.system_seed, starIndex)
  };
}

export function generateStars(system: StarSystemNode) {
  return Array.from({ length: system.star_count }, (_, index) => generateStar(system, index));
}

function generatedCelestialBodyFromPlanet(system: StarSystemNode, planet: UniversePlanetNode): CelestialBodyNode {
  const bodyIndex = Math.max(0, planet.orbit_position - 1);

  return {
    id: `body-${planet.id}`,
    system_id: system.id,
    parent_body_id: null,
    name: planet.planet_name,
    celestial_body_type: "Planet",
    planet_class: planet.planet_class,
    planet_subclass: planet.planet_subclass,
    planet_rarity: planet.planet_rarity,
    biome: null,
    atmosphere: null,
    gravity: null,
    orbit_position: planet.orbit_position,
    orbit_parent: system.primary_star,
    landable: planet.planet_class !== "Gas Giant",
    colonizable: planet.planet_class !== "Gas Giant",
    colonizable_status: planet.planet_class === "Gas Giant" ? "Not Colonizable" : "Unknown",
    uses_orbital_gameplay: planet.planet_class === "Gas Giant",
    is_fixed: false,
    is_starting_body: false,
    is_procedural: true,
    unlock_requirement: "Interstellar Navigation",
    resources: [],
    notes: "Procedural celestial body derived from the system seed.",
    ...generationMetadata(planet.planet_seed, system.system_seed, bodyIndex)
  };
}

export function generateCelestialBodies(system: StarSystemNode): CelestialBodyNode[] {
  if (system.id === SOL_SYSTEM_ID) {
    return SOL_CELESTIAL_BODIES.map((body, index) => ({
      ...body,
      is_fixed: true,
      is_procedural: false,
      ...generationMetadata(deriveChildSeed(system.system_seed, "body", index), system.system_seed, index)
    }));
  }

  return generateUniversePlanets(system).map((planet) => generatedCelestialBodyFromPlanet(system, planet));
}

export function generateUniversePlanet(system: StarSystemNode, planetIndex: number): UniversePlanetNode {
  if (system.id === SOL_SYSTEM_ID) {
    const body = SOL_CELESTIAL_BODIES.filter((item) => item.celestial_body_type !== "Star")[planetIndex];
    if (body) {
      return {
        id: body.id.replace("body-", "planet-"),
        system_id: system.id,
        planet_seed: `${SOL_SYSTEM_SEED}:${slug(body.name)}`,
        planet_name: body.name,
        orbit_position: body.orbit_position ?? planetIndex + 1,
        planet_rarity: body.planet_rarity ?? "Common",
        planet_class: body.planet_class ?? body.celestial_body_type,
        planet_subclass: body.planet_subclass ?? body.celestial_body_type,
        colonized: body.colonizable_status === "Already Colonized",
        terraform_level: 0,
        is_fixed: true,
        is_procedural: false,
        ...generationMetadata(`${SOL_SYSTEM_SEED}:${slug(body.name)}`, system.system_seed, planetIndex)
      };
    }
  }

  const planetSeed = deriveSeed(system.system_seed, "planet", planetIndex);
  const planetClass = pickWeightedPlanetClass(seededRandom(deriveSeed(planetSeed, "class")));
  const rarity = generatePlanetRarity(seededRandom(deriveSeed(planetSeed, "rarity")), planetClass.name, system.system_rarity);
  const planetSubclass = pick(planetClass.subclasses, seededRandom(deriveSeed(planetSeed, "subclass")), planetClass.name);

  return {
    id: `planet-${planetIndex}-${hashSeed(planetSeed).toString(16)}`,
    system_id: system.id,
    planet_seed: planetSeed,
    planet_name: generatedName(planetSeed, "planet"),
    orbit_position: planetIndex + 1,
    planet_rarity: rarity.name,
    planet_class: planetClass.name,
    planet_subclass: planetSubclass,
    colonized: false,
    terraform_level: 0,
    is_fixed: false,
    is_procedural: true,
    ...generationMetadata(planetSeed, system.system_seed, planetIndex)
  };
}

export function generateUniversePlanets(system: StarSystemNode) {
  return Array.from({ length: system.planet_count }, (_, index) => generateUniversePlanet(system, index));
}
