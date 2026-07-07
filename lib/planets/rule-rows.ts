import type { PlanetVariable } from "@/types/schema";

export const PLANET_GENERATION_RULE_CATEGORIES = [
  "Star Type",
  "Distance From Star",
  "Orbit Speed",
  "Climate",
  "Atmosphere",
  "Temperature",
  "Gravity",
  "Water Coverage",
  "Moons",
  "Flora",
  "Fauna",
  "Ancient Civilization",
  "Ruins",
  "Trait",
  "Hazard",
  "Modifier",
  "Collectible Pool",
  "Weather",
  "Event Pool",
  "Resource"
];

const PLANET_CANONICAL_GUIDE_CATEGORIES = [
  "Objective",
  "Generation Flow",
  "Planet Data Field",
  "Planet Class",
  "Planet Rarity",
  "Planet Class Rarity Profile",
  "System Rarity Modifier",
  "Planet Class Spawn Weight",
  "Planet Class Colonization Difficulty",
  "Planet Subclass",
  "Primary Biome",
  "Planet Anomaly"
];

function rowsForCategory(rows: PlanetVariable[], category: string) {
  return rows.filter((row) => row.category === category && row.value);
}

function liveOrFallbackRows(liveRows: PlanetVariable[], fallbackRows: PlanetVariable[], category: string) {
  const live = rowsForCategory(liveRows, category);
  return live.length ? live : rowsForCategory(fallbackRows, category);
}

export function planetGenerationRuleRows(liveRows: PlanetVariable[], fallbackRows: PlanetVariable[]) {
  return PLANET_GENERATION_RULE_CATEGORIES.flatMap((category) => liveOrFallbackRows(liveRows, fallbackRows, category));
}

export function planetaryRulesDisplayRows(liveRows: PlanetVariable[], fallbackRows: PlanetVariable[]) {
  const canonicalGuideRows = PLANET_CANONICAL_GUIDE_CATEGORIES.flatMap((category) => rowsForCategory(fallbackRows, category));
  const livePoolRows = planetGenerationRuleRows(liveRows, fallbackRows);

  return [...canonicalGuideRows, ...livePoolRows];
}
