export type PlanetRarityName = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Relic" | "Cosmic" | "Genesis";

export type PlanetRarityDefinition = {
  name: PlanetRarityName;
  color: string;
  spawnChance: number;
  discoveryPoints: [number, number];
  resourceCount: [number, number];
  traitCount: [number, number];
  ancientCivilizationChance: number;
  collectibleCount: [number, number];
  collectibleQuality: string;
  cardTreatment: string;
};

export type PlanetRarityWeights = Record<PlanetRarityName, number>;

export type PlanetClassRarityProfile = {
  planetClass: string;
  weights: PlanetRarityWeights;
  notes: string;
};

export type SystemRarityModifier = {
  systemRarity: PlanetRarityName;
  rarityShift: number;
  description: string;
};

export const PLANET_RARITIES: PlanetRarityDefinition[] = [
  {
    name: "Common",
    color: "#FFFFFF",
    spawnChance: 45,
    discoveryPoints: [100, 250],
    resourceCount: [5, 6],
    traitCount: [2, 2],
    ancientCivilizationChance: 0.05,
    collectibleCount: [2, 3],
    collectibleQuality: "Mostly Common",
    cardTreatment: "White Label"
  },
  {
    name: "Uncommon",
    color: "#2ECC71",
    spawnChance: 25,
    discoveryPoints: [250, 500],
    resourceCount: [6, 7],
    traitCount: [2, 3],
    ancientCivilizationChance: 0.1,
    collectibleCount: [2, 3],
    collectibleQuality: "Common / Uncommon",
    cardTreatment: "Green Label"
  },
  {
    name: "Rare",
    color: "#3498DB",
    spawnChance: 15,
    discoveryPoints: [500, 1000],
    resourceCount: [7, 8],
    traitCount: [3, 3],
    ancientCivilizationChance: 0.2,
    collectibleCount: [3, 4],
    collectibleQuality: "Rare",
    cardTreatment: "Blue Label"
  },
  {
    name: "Epic",
    color: "#9B59B6",
    spawnChance: 8,
    discoveryPoints: [1000, 2500],
    resourceCount: [8, 9],
    traitCount: [3, 4],
    ancientCivilizationChance: 0.35,
    collectibleCount: [3, 4],
    collectibleQuality: "Epic",
    cardTreatment: "Purple Label / Purple Glow"
  },
  {
    name: "Legendary",
    color: "#F39C12",
    spawnChance: 4,
    discoveryPoints: [2500, 6000],
    resourceCount: [9, 10],
    traitCount: [4, 4],
    ancientCivilizationChance: 0.6,
    collectibleCount: [4, 5],
    collectibleQuality: "Legendary",
    cardTreatment: "Orange Label / Orange Border / Orange Glow"
  },
  {
    name: "Mythic",
    color: "#E74C3C",
    spawnChance: 2,
    discoveryPoints: [6000, 15000],
    resourceCount: [10, 12],
    traitCount: [4, 5],
    ancientCivilizationChance: 0.8,
    collectibleCount: [4, 5],
    collectibleQuality: "Legendary / Mythic",
    cardTreatment: "Red Label / Red Border / Animated Glow"
  },
  {
    name: "Relic",
    color: "#FF3CAC",
    spawnChance: 0.8,
    discoveryPoints: [15000, 40000],
    resourceCount: [11, 13],
    traitCount: [5, 6],
    ancientCivilizationChance: 1,
    collectibleCount: [5, 6],
    collectibleQuality: "Mythic / Relic",
    cardTreatment: "Magenta Label / Magenta Border / Animated Pulse"
  },
  {
    name: "Cosmic",
    color: "#00E5FF",
    spawnChance: 0.18,
    discoveryPoints: [40000, 100000],
    resourceCount: [12, 14],
    traitCount: [6, 7],
    ancientCivilizationChance: 1,
    collectibleCount: [6, 7],
    collectibleQuality: "Relic / Cosmic",
    cardTreatment: "Cyan Label / Animated Cyan Border / Floating Energy Particles"
  },
  {
    name: "Genesis",
    color: "#FFD700",
    spawnChance: 0.02,
    discoveryPoints: [100000, 250000],
    resourceCount: [14, 15],
    traitCount: [7, 8],
    ancientCivilizationChance: 1,
    collectibleCount: [7, 8],
    collectibleQuality: "One-of-One",
    cardTreatment: "Gold Label / Animated Gold Border / Gold Shimmer"
  }
];

export const PLANET_CLASS_RARITY_PROFILES: PlanetClassRarityProfile[] = [
  {
    planetClass: "Terrestrial",
    weights: { Common: 55, Uncommon: 25, Rare: 12, Epic: 5, Legendary: 2, Mythic: 0.8, Relic: 0.18, Cosmic: 0.019, Genesis: 0.001 },
    notes: "Foundational rocky worlds favor Common and Uncommon, with rare high-value outliers."
  },
  {
    planetClass: "Ocean",
    weights: { Common: 45, Uncommon: 25, Rare: 17, Epic: 8, Legendary: 3, Mythic: 1.3, Relic: 0.55, Cosmic: 0.14, Genesis: 0.01 },
    notes: "Ocean worlds skew slightly richer than terrestrial worlds because water and biosphere hooks increase value."
  },
  {
    planetClass: "Desert",
    weights: { Common: 50, Uncommon: 25, Rare: 15, Epic: 6, Legendary: 2.5, Mythic: 1, Relic: 0.35, Cosmic: 0.13, Genesis: 0.02 },
    notes: "Desert worlds remain common but can roll memorable rare mineral or ancient variants."
  },
  {
    planetClass: "Ice",
    weights: { Common: 42, Uncommon: 25, Rare: 18, Epic: 9, Legendary: 3.5, Mythic: 1.5, Relic: 0.75, Cosmic: 0.23, Genesis: 0.02 },
    notes: "Ice worlds have stronger rare/exotic odds because cryo resources and hidden oceans matter."
  },
  {
    planetClass: "Lava",
    weights: { Common: 30, Uncommon: 25, Rare: 22, Epic: 12, Legendary: 6, Mythic: 3, Relic: 1.3, Cosmic: 0.65, Genesis: 0.05 },
    notes: "Lava worlds are dangerous and resource-rich, so their curve starts higher."
  },
  {
    planetClass: "Gas Giant",
    weights: { Common: 45, Uncommon: 25, Rare: 16, Epic: 8, Legendary: 4, Mythic: 1.4, Relic: 0.45, Cosmic: 0.14, Genesis: 0.01 },
    notes: "Gas giants are frequent orbital resource worlds with occasional high-value fuel systems."
  },
  {
    planetClass: "Crystal",
    weights: { Common: 15, Uncommon: 25, Rare: 30, Epic: 15, Legendary: 10, Mythic: 3, Relic: 1.5, Cosmic: 0.45, Genesis: 0.05 },
    notes: "Crystal worlds naturally favor Rare and Epic discoveries."
  },
  {
    planetClass: "Toxic",
    weights: { Common: 28, Uncommon: 24, Rare: 22, Epic: 14, Legendary: 7, Mythic: 3, Relic: 1.4, Cosmic: 0.55, Genesis: 0.05 },
    notes: "Toxic worlds skew toward higher-risk, higher-reward discoveries."
  },
  {
    planetClass: "Artificial",
    weights: { Common: 8, Uncommon: 15, Rare: 28, Epic: 22, Legendary: 15, Mythic: 7, Relic: 3.5, Cosmic: 1.3, Genesis: 0.2 },
    notes: "Artificial worlds strongly favor rare technological and legendary outcomes."
  },
  {
    planetClass: "Living",
    weights: { Common: 5, Uncommon: 12, Rare: 23, Epic: 25, Legendary: 18, Mythic: 10, Relic: 5, Cosmic: 1.7, Genesis: 0.3 },
    notes: "Living planets are inherently unusual and favor Epic through Mythic outcomes."
  },
  {
    planetClass: "Bio",
    weights: { Common: 6, Uncommon: 14, Rare: 24, Epic: 24, Legendary: 17, Mythic: 9, Relic: 4, Cosmic: 1.7, Genesis: 0.3 },
    notes: "Bio worlds behave like living worlds with slightly broader mid-tier odds."
  },
  {
    planetClass: "Ancient",
    weights: { Common: 4, Uncommon: 8, Rare: 18, Epic: 22, Legendary: 24, Mythic: 12, Relic: 9, Cosmic: 2.5, Genesis: 0.5 },
    notes: "Ancient worlds are biased toward Legendary and Relic discoveries."
  },
  {
    planetClass: "Energy",
    weights: { Common: 3, Uncommon: 7, Rare: 17, Epic: 22, Legendary: 25, Mythic: 14, Relic: 8, Cosmic: 3.2, Genesis: 0.8 },
    notes: "Energy worlds skew strongly high because they drive late-game systems."
  },
  {
    planetClass: "Primordial",
    weights: { Common: 2, Uncommon: 5, Rare: 13, Epic: 20, Legendary: 24, Mythic: 18, Relic: 11, Cosmic: 5.5, Genesis: 1.5 },
    notes: "Primordial worlds are rare universe-history discoveries with strong high-tier odds."
  },
  {
    planetClass: "Void",
    weights: { Common: 2, Uncommon: 5, Rare: 10, Epic: 20, Legendary: 25, Mythic: 20, Relic: 12, Cosmic: 5, Genesis: 1 },
    notes: "Void worlds heavily favor Mythic, Relic, and Cosmic discoveries while still allowing common anomalies."
  }
];

export const SYSTEM_RARITY_MODIFIERS: SystemRarityModifier[] = [
  { systemRarity: "Common", rarityShift: 0, description: "No upward rarity pressure." },
  { systemRarity: "Uncommon", rarityShift: 0.05, description: "Small boost to higher planet rarity tiers." },
  { systemRarity: "Rare", rarityShift: 0.1, description: "Moderate boost to higher planet rarity tiers." },
  { systemRarity: "Epic", rarityShift: 0.18, description: "Noticeable boost to Epic and above planet outcomes." },
  { systemRarity: "Legendary", rarityShift: 0.3, description: "Strong boost to Legendary and above planet outcomes." },
  { systemRarity: "Mythic", rarityShift: 0.45, description: "Very strong boost to Mythic, Relic, Cosmic, and Genesis odds." },
  { systemRarity: "Relic", rarityShift: 0.6, description: "Major high-tier planet rarity pressure." },
  { systemRarity: "Genesis", rarityShift: 0.85, description: "Extreme high-tier pressure while preserving surprise rolls." }
];

export function normalizePlanetRarity(value: string | null | undefined) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return PLANET_RARITIES.find((rarity) => rarity.name.toLowerCase() === normalized) ?? PLANET_RARITIES[0];
}

function normalizeKey(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

export function getPlanetClassRarityProfile(planetClass: string | null | undefined) {
  const normalized = normalizeKey(planetClass);
  return PLANET_CLASS_RARITY_PROFILES.find((profile) => profile.planetClass.toLowerCase() === normalized) ?? null;
}

export function getSystemRarityModifier(systemRarity: string | null | undefined) {
  const rarity = normalizePlanetRarity(systemRarity);
  return SYSTEM_RARITY_MODIFIERS.find((modifier) => modifier.systemRarity === rarity.name) ?? SYSTEM_RARITY_MODIFIERS[0];
}

export function applySystemRarityShift(weights: PlanetRarityWeights, systemRarity: string | null | undefined): PlanetRarityWeights {
  const shift = getSystemRarityModifier(systemRarity).rarityShift;

  return {
    Common: weights.Common * Math.max(0.15, 1 - shift * 0.7),
    Uncommon: weights.Uncommon * Math.max(0.25, 1 - shift * 0.45),
    Rare: weights.Rare * (1 + shift * 0.35),
    Epic: weights.Epic * (1 + shift * 0.75),
    Legendary: weights.Legendary * (1 + shift * 1.2),
    Mythic: weights.Mythic * (1 + shift * 1.8),
    Relic: weights.Relic * (1 + shift * 2.4),
    Cosmic: weights.Cosmic * (1 + shift * 3.2),
    Genesis: weights.Genesis * (1 + shift * 4.5)
  };
}

export function rollWeightedPlanetRarity(random: () => number, weights: PlanetRarityWeights) {
  const total = PLANET_RARITIES.reduce((sum, rarity) => sum + Math.max(0, weights[rarity.name] ?? 0), 0);
  const roll = random() * (total || 100);
  let cumulative = 0;

  for (const rarity of PLANET_RARITIES) {
    cumulative += Math.max(0, weights[rarity.name] ?? 0);

    if (roll < cumulative) {
      return rarity;
    }
  }

  return PLANET_RARITIES[0];
}

export function generatePlanetRarity(random: () => number, planetClass: string | null | undefined, systemRarity = "Common") {
  const profile = getPlanetClassRarityProfile(planetClass);
  const weights = profile ? profile.weights : Object.fromEntries(PLANET_RARITIES.map((rarity) => [rarity.name, rarity.spawnChance])) as PlanetRarityWeights;
  return rollWeightedPlanetRarity(random, applySystemRarityShift(weights, systemRarity));
}

export function rollPlanetRarity(random: () => number, planetClass?: string, systemRarity = "Common") {
  if (planetClass) {
    return generatePlanetRarity(random, planetClass, systemRarity);
  }

  const roll = random() * 100;
  let cumulative = 0;

  for (const rarity of PLANET_RARITIES) {
    cumulative += rarity.spawnChance;

    if (roll < cumulative) {
      return rarity;
    }
  }

  return PLANET_RARITIES[0];
}
