export const plantLifeCategories = ["flora", "fungi", "coral", "mosses", "trees", "flowers", "seeds", "spores"] as const;
export const plantLifeHabitats = ["surface", "wetland", "ocean", "cave", "canopy", "tundra", "desert"] as const;
export const plantLifeGrowthPatterns = ["groundcover", "rooted", "branching", "colonial", "vining", "spore-forming"] as const;

export type PlantLifeCategory = (typeof plantLifeCategories)[number];
export type PlantLifeHabitat = (typeof plantLifeHabitats)[number];
export type PlantLifeGrowthPattern = (typeof plantLifeGrowthPatterns)[number];

export type PlantLifeDraft = {
  id: string;
  displayName: string;
  seed: string;
  category: PlantLifeCategory;
  habitat: PlantLifeHabitat;
  growthPattern: PlantLifeGrowthPattern;
  ecologicalRole: string;
  canonStatus: "draft";
  authoringBoundary: string;
};

const nameParts: Record<PlantLifeCategory, string[]> = {
  flora: ["Lumen", "Verdant", "Aurora", "Sable"],
  fungi: ["Mycel", "Spore", "Veil", "Pale"],
  coral: ["Reef", "Tide", "Azure", "Glass"],
  mosses: ["Dew", "Stone", "Morrow", "Quiet"],
  trees: ["World", "Crown", "Hearth", "Silver"],
  flowers: ["Dawn", "Star", "Ember", "Moon"],
  seeds: ["Origin", "First", "Genesis", "Drift"],
  spores: ["Cloud", "Dust", "Echo", "Mist"]
};

function hashSeed(value: string) {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function titleCase(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function generatePlantLifeDraft(seed: string, options: { category?: PlantLifeCategory; habitat?: PlantLifeHabitat; growthPattern?: PlantLifeGrowthPattern } = {}): PlantLifeDraft {
  const normalizedSeed = seed.trim() || "NOVERIS-PLANT-001";
  const hash = hashSeed(normalizedSeed);
  const category = options.category ?? plantLifeCategories[hash % plantLifeCategories.length];
  const habitat = options.habitat ?? plantLifeHabitats[(hash >>> 4) % plantLifeHabitats.length];
  const growthPattern = options.growthPattern ?? plantLifeGrowthPatterns[(hash >>> 8) % plantLifeGrowthPatterns.length];
  const part = nameParts[category][(hash >>> 12) % nameParts[category].length];
  const displayName = `${part} ${titleCase(category.replace(/s$/, ""))}`;
  return {
    id: `plant-draft-${normalizedSeed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    displayName,
    seed: normalizedSeed,
    category,
    habitat,
    growthPattern,
    ecologicalRole: habitat === "ocean" ? "Primary habitat-forming producer" : "Local ecological producer",
    canonStatus: "draft",
    authoringBoundary: "Studio owns the definition and approved references. The Game owns runtime growth, spawning, and player state."
  };
}
