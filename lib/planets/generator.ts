import type { GeneratedPlanet, PlanetVariable } from "@/types/schema";

type RandomSource = () => number;

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

export function generatePlanet(rules: PlanetVariable[], existingCount: number, requestedSeed?: string): GeneratedPlanet {
  const seed = requestedSeed?.trim() || `PG-${Date.now()}-${existingCount + 1}`;
  const random = seededRandom(seed);
  const planetClass = pickRule(rules, "Planet Class", random, "Terrestrial");
  const primaryBiome = pickRule(rules, "Primary Biome", random, "Forest");
  const ancientCivilization = pickRule(rules, "Ancient Civilization", random, "None");
  const ruins = pickRule(rules, "Ruins", random, "None");
  const traits = pickMany(rules, "Trait", random, 2, 5);
  const resources = pickMany(rules, "Resource", random, 5, 15);
  const hazards = pickMany(rules, "Hazard", random, 2, 6);
  const collectiblePools = pickMany(rules, "Collectible Pool", random, 2, 5);
  const eventPool = pickMany(rules, "Event Pool", random, 2, 5);
  const name = planetName(seed, random, planetClass);
  const artifact = collectiblePools[0] ?? "Planet Relic";
  const resource = resources[0] ?? "Stone";
  const trait = traits[0] ?? "Terraformable";
  const civilizationFragment = ancientCivilization === "None" ? "unknown explorers" : ancientCivilization.toLowerCase();

  return {
    id: `generated-planet-${slug(name)}-${hashSeed(seed).toString(16)}`,
    seed,
    name,
    galaxy_sector: `Sector ${String.fromCharCode(65 + numericRange(random, 0, 5))}-${numericRange(random, 1, 99)}`,
    star_system: `${pick(["Helio", "Aster", "Nova", "Kepler", "Vega", "Orbis"], random, "Helio")}-${numericRange(random, 100, 999)}`,
    orbit_position: numericRange(random, 1, 9),
    discovery_order: existingCount + 1,
    star_type: pickRule(rules, "Star Type", random, "Yellow Star"),
    distance_from_star: pickRule(rules, "Distance From Star", random, "Habitable"),
    orbit_speed: pickRule(rules, "Orbit Speed", random, "Normal"),
    planet_class: planetClass,
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
    modifiers: pickMany(rules, "Modifier", random, 1, 4),
    collectible_pools: collectiblePools,
    visual_theme: visualTheme(random, primaryBiome, planetClass),
    weather: pickMany(rules, "Weather", random, 1, 4),
    colonization: metricMap(["Difficulty", "Population Capacity", "Construction Modifier", "Food Modifier", "Power Modifier", "Expansion Modifier", "Terraform Cost"], random, 1, 100),
    science: metricMap(["Research Bonus", "Discovery Bonus", "Artifact Bonus", "Ancient Knowledge", "Rare Research", "Technology Chance"], random, 0, 100),
    economy: metricMap(["Trade Value", "Mining Value", "Agriculture Value", "Industry Value", "Tourism Value", "Collectible Value"], random, 0, 100),
    event_pool: eventPool,
    story: `${name} is a ${planetClass.toLowerCase()} shaped by ${primaryBiome.toLowerCase()} regions and ${trait.toLowerCase()}. ${civilizationFragment} left traces near ${ruins.toLowerCase()} sites, where ${artifact.toLowerCase()} and ${resource.toLowerCase()} continue to draw explorers despite ${hazards.slice(0, 2).join(" and ").toLowerCase() || "unknown hazards"}.`,
    colonized: false,
    terraform_level: 0,
    discovery_points: numericRange(random, 25, 500),
    completion_percent: numericRange(random, 0, 12),
    image_url: null,
    image_prompt: null,
    image_status: "Not Rendered",
    image_variants: [],
    created_at: new Date().toISOString(),
    notes: ""
  };
}
