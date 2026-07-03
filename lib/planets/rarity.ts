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

export function normalizePlanetRarity(value: string | null | undefined) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return PLANET_RARITIES.find((rarity) => rarity.name.toLowerCase() === normalized) ?? PLANET_RARITIES[0];
}

export function rollPlanetRarity(random: () => number) {
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
