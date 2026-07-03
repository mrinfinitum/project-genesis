import type { GeneratedPlanet, PlanetRenderLibraryRecord } from "@/types/schema";

type MatchResult = {
  render: PlanetRenderLibraryRecord;
  score: number;
  reasons: string[];
};

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalize(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function tokens(value: string | null | undefined) {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function asList(values: string[] | null | undefined) {
  return Array.isArray(values) ? values.map(normalize).filter(Boolean) : [];
}

function includesToken(haystack: string, needle: string) {
  const left = normalize(haystack);
  const right = normalize(needle);
  return Boolean(left && right && (left === right || left.includes(right) || right.includes(left)));
}

const VISUAL_FAMILIES = [
  ["volcanic", "lava", "magma", "molten", "basalt", "obsidian", "ash"],
  ["swamp", "marsh", "bog", "wetland", "algae"],
  ["ocean", "water", "aquatic", "archipelago", "coral"],
  ["ice", "frozen", "glacier", "snow", "arctic"],
  ["desert", "dune", "arid", "canyon", "mesa"],
  ["forest", "jungle", "lush", "rainforest"],
  ["toxic", "acid", "sulfur", "radioactive", "chemical"],
  ["crystal", "quartz", "geode", "prism"],
  ["void", "shadow", "corrupted", "anomaly"],
  ["cyber", "machine", "artificial", "city", "construct"],
  ["barren", "rocky", "cratered", "moonlike"],
  ["gas", "jovian", "storm", "striped"]
];

function visualFamily(value: string | null | undefined) {
  const valueTokens = tokens(value);
  return VISUAL_FAMILIES.find((family) => family.some((alias) => valueTokens.some((token) => token === alias || token.includes(alias) || alias.includes(token))));
}

function sameVisualFamily(left: string | null | undefined, right: string | null | undefined) {
  const leftFamily = visualFamily(left);
  const rightFamily = visualFamily(right);
  return Boolean(leftFamily && rightFamily && leftFamily === rightFamily);
}

function hasCompatibleVisualFamily(planet: GeneratedPlanet, render: PlanetRenderLibraryRecord) {
  const planetFamily = visualFamily(planet.primary_biome);
  const renderFamily = visualFamily(render.biome);

  if (!planetFamily) {
    return true;
  }

  return Boolean(renderFamily && planetFamily === renderFamily);
}

function listOverlap(left: string[] | null | undefined, right: string[] | null | undefined) {
  const leftTokens = new Set(asList(left).flatMap(tokens));
  return asList(right).filter((value) => tokens(value).some((token) => leftTokens.has(token)));
}

function planetWantsRings(planet: GeneratedPlanet) {
  const text = [
    planet.planet_class,
    planet.primary_biome,
    planet.moons,
    planet.atmosphere,
    ...asList(planet.traits),
    ...asList(planet.modifiers)
  ]
    .join(" ")
    .toLowerCase();

  return /ring|gas|jovian|saturn|moon|floating|magnetic/.test(text);
}

function waterLevelFor(planet: GeneratedPlanet) {
  const parsed = Number.parseFloat(planet.water_coverage);
  const text = normalize(`${planet.planet_class} ${planet.primary_biome}`);

  if (text.includes("ocean") || text.includes("water") || text.includes("coral")) {
    return "high";
  }

  if (Number.isFinite(parsed)) {
    if (parsed >= 65) return "high";
    if (parsed <= 20) return "low";
  }

  if (text.includes("desert") || text.includes("lava") || text.includes("volcanic") || text.includes("ice")) {
    return "low";
  }

  return "medium";
}

function cloudLevelFor(planet: GeneratedPlanet) {
  const text = normalize(`${planet.atmosphere} ${planet.climate} ${asList(planet.weather).join(" ")}`);

  if (/dense|storm|rain|blizzard|cloud|haze|mist/.test(text)) {
    return "high";
  }

  if (/thin|none|arid|dry|desert/.test(text)) {
    return "low";
  }

  return "medium";
}

function scoreRender(planet: GeneratedPlanet, render: PlanetRenderLibraryRecord): MatchResult {
  let score = 0;
  const reasons: string[] = [];
  const renderStatus = normalize(render.status);

  if (renderStatus && !["ready", "available", "approved"].includes(renderStatus)) {
    return { render, score: -999, reasons: ["not-ready"] };
  }

  if (includesToken(planet.planet_class, render.planet_class)) {
    score += 34;
    reasons.push("class");
  }

  if (includesToken(planet.primary_biome, render.biome) || sameVisualFamily(planet.primary_biome, render.biome)) {
    score += 42;
    reasons.push("biome");
  }

  if (includesToken(planet.atmosphere, render.atmosphere)) {
    score += 14;
    reasons.push("atmosphere");
  }

  if (includesToken(planet.climate, render.climate)) {
    score += 10;
    reasons.push("climate");
  }

  const wantsRings = planetWantsRings(planet);
  if (render.has_rings === wantsRings) {
    score += wantsRings ? 18 : 8;
    reasons.push(wantsRings ? "rings" : "no-rings");
  } else if (render.has_rings) {
    score -= 10;
  }

  if (normalize(render.water_level) === waterLevelFor(planet)) {
    score += 10;
    reasons.push("water");
  }

  if (normalize(render.cloud_level) === cloudLevelFor(planet)) {
    score += 8;
    reasons.push("clouds");
  }

  const tagHits = listOverlap(render.tags, [
    planet.planet_class,
    planet.primary_biome,
    planet.climate,
    planet.atmosphere,
    ...asList(planet.resources),
    ...asList(planet.hazards),
    ...asList(planet.traits),
    ...asList(planet.weather)
  ]);
  score += Math.min(30, tagHits.length * 5);
  reasons.push(...tagHits.slice(0, 4).map((tag) => `tag:${tag}`));

  const hazardHits = listOverlap(render.hazards, planet.hazards);
  score += Math.min(16, hazardHits.length * 4);

  const traitHits = listOverlap(render.traits, planet.traits);
  score += Math.min(16, traitHits.length * 4);

  score -= Math.min(14, Math.max(0, Number(render.usage_count) || 0) * 0.75);

  return { render, score, reasons };
}

export function matchPlanetRender(planet: GeneratedPlanet, renders: PlanetRenderLibraryRecord[], minScore = 36) {
  const scored = renders
    .filter((render) => render.file_url && render.storage_path)
    .filter((render) => hasCompatibleVisualFamily(planet, render))
    .map((render) => scoreRender(planet, render))
    .filter((match) => match.score >= minScore)
    .sort((left, right) => right.score - left.score);

  if (!scored.length) {
    return null;
  }

  const bestScore = scored[0].score;
  const topCluster = scored.filter((match) => match.score >= bestScore - 12).slice(0, 8);
  const selectedIndex = hashString(`${planet.seed}:${planet.name}:${bestScore}`) % topCluster.length;
  return topCluster[selectedIndex];
}

export function imageVariantsFromRender(render: PlanetRenderLibraryRecord) {
  if (Array.isArray(render.image_variants) && render.image_variants.length) {
    return render.image_variants;
  }

  return [
    {
      size: render.resolution || render.width || 4096,
      width: render.width || render.resolution || 4096,
      height: render.height || render.resolution || 4096,
      url: render.file_url,
      path: render.storage_path,
      filename: render.storage_path.split("/").at(-1) ?? `${render.id}.png`
    }
  ];
}
