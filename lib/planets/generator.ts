import type { GeneratedPlanet, PlanetVariable } from "@/types/schema";
import { findPlanetClassByBiome, findPlanetClassByName, PLANET_ANOMALIES, PLANET_CLASS_MODEL, rollPlanetClass } from "@/lib/planets/class-model";
import { rollPlanetRarity } from "@/lib/planets/rarity";

type RandomSource = () => number;
type GeneratePlanetOptions = {
  primaryBiome?: string;
};

const colorWords = ["Cyan", "Amber", "Violet", "Emerald", "Silver", "Crimson", "Indigo", "Pearl", "Obsidian", "Azure"];
const lightWords = ["Low", "Soft", "Radiant", "Harsh", "Diffuse", "Prismatic", "Pale", "Neon"];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string): RandomSource {
  let state = hashSeed(seed) || 1;

  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) / 4294967296;
  };
}

function byCategory(rules: PlanetVariable[], category: string) {
  return rules.filter((rule) => rule.category === category && rule.value);
}

function pick(values: string[], random: RandomSource, fallback: string) {
  if (!values.length) {
    return fallback;
  }

  return values[Math.floor(random() * values.length)] ?? fallback;
}

function pickRule(rules: PlanetVariable[], category: string, random: RandomSource, fallback: string) {
  return pick(byCategory(rules, category).map((rule) => rule.value), random, fallback);
}

function pickRuleExcluding(rules: PlanetVariable[], category: string, random: RandomSource, fallback: string, excluded: string[] = []) {
  const excludedValues = new Set(excluded.map((value) => value.toLowerCase()));
  return pick(
    byCategory(rules, category)
      .map((rule) => rule.value)
      .filter((value) => !excludedValues.has(value.toLowerCase())),
    random,
    fallback
  );
}

function pickMany(rules: PlanetVariable[], category: string, random: RandomSource, min: number, max: number) {
  const values = [...new Set(byCategory(rules, category).map((rule) => rule.value))];
  const count = Math.min(values.length, min + Math.floor(random() * (max - min + 1)));
  const selected: string[] = [];

  while (selected.length < count && values.length) {
    const index = Math.floor(random() * values.length);
    const [value] = values.splice(index, 1);
    if (value) {
      selected.push(value);
    }
  }

  return selected;
}

function pickManyValues(values: string[], random: RandomSource, min: number, max: number) {
  const candidates = [...new Set(values.filter(Boolean))];
  const count = Math.min(candidates.length, min + Math.floor(random() * (max - min + 1)));
  const selected: string[] = [];

  while (selected.length < count && candidates.length) {
    const index = Math.floor(random() * candidates.length);
    const [value] = candidates.splice(index, 1);
    if (value) {
      selected.push(value);
    }
  }

  return selected;
}

function numericRange(random: RandomSource, min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

function planetName(seed: string, random: RandomSource, planetClass: string) {
  const prefixes = ["Astra", "Verd", "Nexa", "Orion", "Elios", "Kyra", "Vanta", "Lyra", "Solan", "Iris"];
  const suffixes = ["dor", "thia", "ara", "ion", "mere", "os", " Prime", " Reach", "veil", "fall"];
  const base = `${pick(prefixes, random, "Astra")}${pick(suffixes, random, "ion")}`;
  const code = String(hashSeed(`${seed}:${planetClass}`) % 997).padStart(3, "0");
  return `${base}-${code}`;
}

function visualTheme(random: RandomSource, biome: string, climate: string) {
  return {
    "Sky Color": pick(colorWords, random, "Cyan"),
    "Ground Color": biome,
    "Fog Color": pick(colorWords, random, "Silver"),
    "Water Color": pick(colorWords, random, "Azure"),
    "Cloud Density": pick(["None", "Sparse", "Broken", "Dense", "Layered"], random, "Broken"),
    Lighting: pick(lightWords, random, "Soft"),
    Aurora: pick(["None", "Faint", "Seasonal", "Persistent"], random, "Faint"),
    "Vegetation Color": climate,
    "Rock Color": pick(colorWords, random, "Obsidian")
  };
}

function metricMap(keys: string[], random: RandomSource, min = 0, max = 100) {
  return Object.fromEntries(keys.map((key) => [key, numericRange(random, min, max)]));
}

function colonizationDifficultyScore(stars: number, random: RandomSource) {
  const ranges: Record<number, [number, number]> = {
    1: [8, 24],
    2: [25, 44],
    3: [45, 64],
    4: [65, 84],
    5: [85, 100]
  };
  const [min, max] = ranges[stars] ?? ranges[3];
  return numericRange(random, min, max);
}

function articleFor(value: string) {
  return /^[aeiou]/i.test(value) ? "an" : "a";
}

function anomalyCountForRarity(rarityName: string): [number, number] {
  switch (rarityName) {
    case "Common":
      return [0, 1];
    case "Uncommon":
      return [0, 2];
    case "Rare":
      return [1, 2];
    case "Epic":
      return [1, 3];
    case "Legendary":
      return [2, 4];
    case "Mythic":
      return [3, 5];
    case "Relic":
    case "Cosmic":
    case "Genesis":
      return [4, 6];
    default:
      return [0, 1];
  }
}

export function generatePlanet(rules: PlanetVariable[], existingCount: number, requestedSeed?: string, options: GeneratePlanetOptions = {}): GeneratedPlanet {
  const seed = requestedSeed?.trim() || `PG-${Date.now()}-${existingCount + 1}`;
  const random = seededRandom(seed);
  const rarity = rollPlanetRarity(random);
  const forcedPrimaryBiome = options.primaryBiome?.trim();
  const forcedClass = forcedPrimaryBiome ? findPlanetClassByBiome(forcedPrimaryBiome) ?? findPlanetClassByName(forcedPrimaryBiome) : null;
  const planetClassDefinition = forcedClass ?? (forcedPrimaryBiome ? PLANET_CLASS_MODEL[0] : rollPlanetClass(random)) ?? PLANET_CLASS_MODEL[0];
  const planetClass = planetClassDefinition.name;
  const planetSubclass = pick(planetClassDefinition.subclasses, random, planetClass);
  const primaryBiome = forcedPrimaryBiome && !findPlanetClassByName(forcedPrimaryBiome)
    ? forcedPrimaryBiome
    : pick(planetClassDefinition.biomes, random, pickRule(rules, "Primary Biome", random, "Forest"));
  const anomalyRange = anomalyCountForRarity(rarity.name);
  const hasAncientCivilization = random() < rarity.ancientCivilizationChance;
  const ancientCivilization = hasAncientCivilization ? pickRuleExcluding(rules, "Ancient Civilization", random, "Ancient", ["None"]) : "None";
  const ruins = pickRule(rules, "Ruins", random, "None");
  const traits = pickMany(rules, "Trait", random, rarity.traitCount[0], rarity.traitCount[1]);
  const anomalies = pickManyValues(PLANET_ANOMALIES, random, anomalyRange[0], anomalyRange[1]);
  const resources = pickMany(rules, "Resource", random, rarity.resourceCount[0], rarity.resourceCount[1]);
  const hazards = pickMany(rules, "Hazard", random, 2, 6);
  const collectiblePools = pickMany(rules, "Collectible Pool", random, rarity.collectibleCount[0], rarity.collectibleCount[1]);
  const eventPool = pickMany(rules, "Event Pool", random, 2, 5);
  const name = planetName(seed, random, planetClass);
  const artifact = collectiblePools[0] ?? "Planet Relic";
  const resource = resources[0] ?? "Stone";
  const trait = traits[0] ?? "Terraformable";
  const civilizationFragment = ancientCivilization === "None" ? "unknown explorers" : ancientCivilization.toLowerCase();
  const worldIdentity = planetSubclass.toLowerCase().includes("world") ? planetSubclass : `${planetSubclass} ${planetClass}`;

  return {
    id: `generated-planet-${slug(name)}-${hashSeed(seed).toString(16)}`,
    seed,
    name,
    galaxy_sector: `Sector ${String.fromCharCode(65 + numericRange(random, 0, 5))}-${numericRange(random, 1, 99)}`,
    star_system: `${pick(["Helio", "Aster", "Nova", "Kepler", "Vega", "Orbis"], random, "Helio")}-${numericRange(random, 100, 999)}`,
    orbit_position: numericRange(random, 1, 9),
    discovery_order: existingCount + 1,
    rarity: rarity.name,
    star_type: pickRule(rules, "Star Type", random, "Yellow Star"),
    distance_from_star: pickRule(rules, "Distance From Star", random, "Habitable"),
    orbit_speed: pickRule(rules, "Orbit Speed", random, "Normal"),
    planet_class: planetClass,
    planet_subclass: planetSubclass,
    primary_biome: primaryBiome,
    climate: pickRule(rules, "Climate", random, "Temperate"),
    atmosphere: pickRule(rules, "Atmosphere", random, "Breathable"),
    temperature: pickRule(rules, "Temperature", random, "Temperate"),
    gravity: pickRule(rules, "Gravity", random, "Standard"),
    water_coverage: pickRule(rules, "Water Coverage", random, "50%"),
    moons: pickRule(rules, "Moons", random, "1"),
    resources,
    flora: pickRule(rules, "Flora", random, "Normal"),
    fauna: pickRule(rules, "Fauna", random, "Neutral"),
    ancient_civilization: ancientCivilization,
    ruins,
    hazards,
    traits,
    anomalies,
    modifiers: pickMany(rules, "Modifier", random, 1, 4),
    collectible_pools: collectiblePools,
    visual_theme: visualTheme(random, primaryBiome, planetClass),
    weather: pickMany(rules, "Weather", random, 1, 4),
    colonization: {
      Difficulty: colonizationDifficultyScore(planetClassDefinition.colonizationDifficulty, random),
      ...metricMap(["Population Capacity", "Construction Modifier", "Food Modifier", "Power Modifier", "Expansion Modifier", "Terraform Cost"], random, 1, 100)
    },
    science: metricMap(["Research Bonus", "Discovery Bonus", "Artifact Bonus", "Ancient Knowledge", "Rare Research", "Technology Chance"], random, 0, 100),
    economy: metricMap(["Trade Value", "Mining Value", "Agriculture Value", "Industry Value", "Tourism Value", "Collectible Value"], random, 0, 100),
    event_pool: eventPool,
    story: `${name} is ${articleFor(rarity.name)} ${rarity.name.toLowerCase()} ${worldIdentity.toLowerCase()} shaped by ${primaryBiome.toLowerCase()} regions and ${trait.toLowerCase()}. ${civilizationFragment} left traces near ${ruins.toLowerCase()} sites, where ${artifact.toLowerCase()} and ${resource.toLowerCase()} continue to draw explorers despite ${hazards.slice(0, 2).join(" and ").toLowerCase() || "unknown hazards"}${anomalies.length ? `, alongside anomalies like ${anomalies.slice(0, 2).join(" and ").toLowerCase()}` : ""}.`,
    colonized: false,
    terraform_level: 0,
    discovery_points: numericRange(random, rarity.discoveryPoints[0], rarity.discoveryPoints[1]),
    completion_percent: numericRange(random, 0, 12),
    image_url: null,
    image_prompt: null,
    image_status: "Not Rendered",
    image_variants: [],
    created_at: new Date().toISOString(),
    notes: ""
  };
}
