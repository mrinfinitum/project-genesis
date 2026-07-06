import { PLANET_CLASS_MODEL } from "@/lib/planets/class-model";
import { rollPlanetRarity } from "@/lib/planets/rarity";

type RandomSource = () => number;

export type UniverseNode = {
  id: string;
  universe_seed: string;
  name: string;
  created_at: string;
};

export type GalaxyNode = {
  id: string;
  universe_id: string;
  galaxy_seed: string;
  name: string;
  galaxy_type: string;
  sector_count: number;
};

export type SectorNode = {
  id: string;
  galaxy_id: string;
  sector_seed: string;
  coordinates_x: number;
  coordinates_y: number;
  coordinates_z: number;
  system_count: number;
};

export type StarSystemNode = {
  id: string;
  sector_id: string;
  system_seed: string;
  system_name: string;
  catalog_designation: string;
  system_rarity: string;
  star_count: number;
  planet_count: number;
  resource_bias: string;
  danger_level: number;
  discovered: boolean;
  discovered_at: string | null;
};

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

const galaxyTypes = ["Spiral", "Barred Spiral", "Elliptical", "Irregular", "Ring", "Lenticular", "Dwarf", "Ancient Core"];
const systemRarities = ["Common", "Common", "Common", "Uncommon", "Uncommon", "Rare", "Epic", "Legendary"];
const resourceBiases = ["Balanced", "Mineral Rich", "Organic", "Ancient Relic", "Energy", "Volatile", "Crystal", "Industrial"];
const starTypes = ["Red Dwarf", "Yellow Main Sequence", "Blue Giant", "White Dwarf", "Orange Dwarf", "Neutron Star", "Binary Pair", "Black Hole"];
const starSizes = ["Dwarf", "Standard", "Large", "Giant", "Supergiant", "Collapsed"];
const starColors = ["Red", "Orange", "Yellow", "White", "Blue", "Violet", "Cyan"];
const namePrefixes = ["Astra", "Nova", "Vega", "Orion", "Elios", "Kyra", "Vanta", "Lyra", "Solan", "Iris", "Nexa", "Verd"];
const nameSuffixes = ["Prime", "Reach", "Veil", "Fall", "Thia", "Ara", "Ion", "Mere", "Os", "Dor"];

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

export function generateUniverse(universeSeed: string, name = "Genesis Universe"): UniverseNode {
  const seed = universeSeed.trim() || "PROJECT-GENESIS-UNIVERSE";

  return {
    id: `universe-${slug(seed)}`,
    universe_seed: seed,
    name,
    created_at: "derived"
  };
}

export function generateGalaxy(universeSeed: string, galaxyIndex = 0): GalaxyNode {
  const galaxySeed = deriveSeed(universeSeed, "galaxy", galaxyIndex);
  const random = seededRandom(galaxySeed);

  return {
    id: `galaxy-${galaxyIndex}-${hashSeed(galaxySeed).toString(16)}`,
    universe_id: `universe-${slug(universeSeed)}`,
    galaxy_seed: galaxySeed,
    name: generatedName(galaxySeed, "galaxy"),
    galaxy_type: pick(galaxyTypes, random, "Spiral"),
    sector_count: numericRange(random, 36, 144)
  };
}

export function generateSector(galaxy: GalaxyNode, sectorIndex: number): SectorNode {
  const sectorSeed = deriveSeed(galaxy.galaxy_seed, "sector", sectorIndex);
  const random = seededRandom(sectorSeed);

  return {
    id: `sector-${sectorIndex}-${hashSeed(sectorSeed).toString(16)}`,
    galaxy_id: galaxy.id,
    sector_seed: sectorSeed,
    coordinates_x: numericRange(random, -999, 999),
    coordinates_y: numericRange(random, -999, 999),
    coordinates_z: numericRange(random, -999, 999),
    system_count: numericRange(random, 4, 28)
  };
}

export function generateSectors(galaxy: GalaxyNode, limit = 24) {
  const count = Math.min(galaxy.sector_count, limit);
  return Array.from({ length: count }, (_, index) => generateSector(galaxy, index));
}

export function generateStarSystem(sector: SectorNode, systemIndex: number): StarSystemNode {
  const systemSeed = deriveSeed(sector.sector_seed, "system", systemIndex);
  const random = seededRandom(systemSeed);
  const rarity = pick(systemRarities, random, "Common");

  return {
    id: `system-${systemIndex}-${hashSeed(systemSeed).toString(16)}`,
    sector_id: sector.id,
    system_seed: systemSeed,
    system_name: generatedName(systemSeed, "system"),
    catalog_designation: `PG-${Math.abs(sector.coordinates_x)}.${Math.abs(sector.coordinates_y)}.${systemIndex + 1}`,
    system_rarity: rarity,
    star_count: numericRange(random, rarity === "Legendary" ? 2 : 1, rarity === "Common" ? 1 : 3),
    planet_count: numericRange(random, 1, rarity === "Common" ? 6 : 12),
    resource_bias: pick(resourceBiases, random, "Balanced"),
    danger_level: numericRange(random, 1, rarity === "Common" ? 45 : 100),
    discovered: false,
    discovered_at: null
  };
}

export function generateStarSystems(sector: SectorNode, limit = 12) {
  const count = Math.min(sector.system_count, limit);
  return Array.from({ length: count }, (_, index) => generateStarSystem(sector, index));
}

export function generateStar(system: StarSystemNode, starIndex: number): StarNode {
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
    age: `${numericRange(random, 1, 13)}.${numericRange(random, 0, 9)}b years`
  };
}

export function generateStars(system: StarSystemNode) {
  return Array.from({ length: system.star_count }, (_, index) => generateStar(system, index));
}

export function generateUniversePlanet(system: StarSystemNode, planetIndex: number): UniversePlanetNode {
  const planetSeed = deriveSeed(system.system_seed, "planet", planetIndex);
  const random = seededRandom(planetSeed);
  const rarity = rollPlanetRarity(seededRandom(deriveSeed(planetSeed, "rarity")));
  const planetClass = pickWeightedPlanetClass(seededRandom(deriveSeed(planetSeed, "class")));
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
    terraform_level: 0
  };
}

export function generateUniversePlanets(system: StarSystemNode) {
  return Array.from({ length: system.planet_count }, (_, index) => generateUniversePlanet(system, index));
}
