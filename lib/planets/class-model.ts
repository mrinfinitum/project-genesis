export type PlanetClassDefinition = {
  name: string;
  aliases?: string[];
  spawnTier: "Very Common" | "Common" | "Uncommon" | "Rare" | "Extremely Rare";
  spawnWeight: number;
  colonizationDifficulty: number;
  subclasses: string[];
  biomes: string[];
};

export const PLANET_CLASS_MODEL: PlanetClassDefinition[] = [
  {
    name: "Terrestrial",
    spawnTier: "Very Common",
    spawnWeight: 22,
    colonizationDifficulty: 1,
    subclasses: ["Earthlike", "Continental", "Highlands", "Supercontinent"],
    biomes: ["Forest", "Grassland", "Swamp", "Mountain", "Highlands", "Continental"]
  },
  {
    name: "Ocean",
    spawnTier: "Very Common",
    spawnWeight: 11,
    colonizationDifficulty: 2,
    subclasses: ["Deep Ocean", "Island World", "Archipelago", "Storm Ocean"],
    biomes: ["Ocean", "Coral", "Island", "Archipelago", "Storm Ocean"]
  },
  {
    name: "Desert",
    spawnTier: "Very Common",
    spawnWeight: 12,
    colonizationDifficulty: 2,
    subclasses: ["Dunes", "Canyon", "Salt Flats", "Rock Desert"],
    biomes: ["Desert", "Canyon", "Dunes", "Salt Flats", "Rock Desert"]
  },
  {
    name: "Ice",
    spawnTier: "Very Common",
    spawnWeight: 11,
    colonizationDifficulty: 3,
    subclasses: ["Glacial", "Frozen Ocean", "Snow World", "Cryovolcanic"],
    biomes: ["Frozen", "Tundra", "Glacier", "Frozen Ocean", "Cryovolcanic"]
  },
  {
    name: "Lava",
    spawnTier: "Common",
    spawnWeight: 7,
    colonizationDifficulty: 4,
    subclasses: ["Volcanic", "Molten Core", "Ash World", "Basalt World"],
    biomes: ["Volcanic", "Magma", "Ash Fields", "Basalt", "Molten"]
  },
  {
    name: "Gas Giant",
    spawnTier: "Very Common",
    spawnWeight: 10,
    colonizationDifficulty: 5,
    subclasses: ["Banded", "Storm Giant", "Ice Giant", "Metallic Giant"],
    biomes: ["Gas Bands", "Storm Layers", "Ice Clouds", "Metallic Clouds"]
  },
  {
    name: "Crystal",
    spawnTier: "Common",
    spawnWeight: 5,
    colonizationDifficulty: 3,
    subclasses: ["Crystal Forest", "Crystal Desert", "Crystal Caverns", "Prismatic"],
    biomes: ["Crystal", "Crystal Forest", "Crystal Desert", "Crystal Caverns", "Prismatic Fields"]
  },
  {
    name: "Toxic",
    spawnTier: "Common",
    spawnWeight: 6,
    colonizationDifficulty: 4,
    subclasses: ["Acid World", "Sulfur World", "Poison Swamp", "Corrosive"],
    biomes: ["Acid Swamp", "Sulfur Flats", "Poison Swamp", "Corrosive Wastes"]
  },
  {
    name: "Artificial",
    spawnTier: "Uncommon",
    spawnWeight: 4,
    colonizationDifficulty: 4,
    subclasses: ["Cyber Planet", "Machine World", "Arcology World", "Forge World"],
    biomes: ["Urban Ruins", "Mechanical", "Cyber Grid", "Arcology", "Forge"]
  },
  {
    name: "Void",
    aliases: ["Void World"],
    spawnTier: "Extremely Rare",
    spawnWeight: 0.15,
    colonizationDifficulty: 5,
    subclasses: ["Dark Void", "Quantum Rift", "Entropy World", "Singularity World"],
    biomes: ["Void", "Dark Rift", "Quantum Rift", "Entropy Field", "Singularity"]
  },
  {
    name: "Living Planet",
    spawnTier: "Rare",
    spawnWeight: 2,
    colonizationDifficulty: 5,
    subclasses: ["Living Forest", "Living Ocean", "Organic World", "Symbiotic World"],
    biomes: ["Living Forest", "Living Ocean", "Organic", "Symbiotic", "Root Network"]
  },
  {
    name: "Bio Planet",
    spawnTier: "Rare",
    spawnWeight: 1.5,
    colonizationDifficulty: 5,
    subclasses: ["Mutated", "Bioluminescent", "Hive World", "Genetic World"],
    biomes: ["Mutated Jungle", "Bioluminescent Forest", "Hive", "Genetic Garden"]
  },
  {
    name: "Ancient World",
    aliases: ["Ancient"],
    spawnTier: "Uncommon",
    spawnWeight: 3,
    colonizationDifficulty: 4,
    subclasses: ["Temple World", "Lost Civilization", "Ruined Empire", "Archaeological"],
    biomes: ["Temple Ruins", "Lost City", "Ruined Empire", "Archaeological Dig", "Megalithic"]
  },
  {
    name: "Energy World",
    spawnTier: "Rare",
    spawnWeight: 1,
    colonizationDifficulty: 5,
    subclasses: ["Plasma", "Electromagnetic", "Storm World", "Radiant"],
    biomes: ["Plasma", "Electromagnetic", "Storm", "Radiant", "Lightning"]
  },
  {
    name: "Primordial World",
    spawnTier: "Extremely Rare",
    spawnWeight: 0.35,
    colonizationDifficulty: 5,
    subclasses: ["Proto World", "Young Planet", "Ancient Core", "Unformed"],
    biomes: ["Proto Crust", "Young Ocean", "Ancient Core", "Unformed Terrain"]
  },
  {
    name: "Dead World",
    aliases: ["Dead"],
    spawnTier: "Uncommon",
    spawnWeight: 4,
    colonizationDifficulty: 3,
    subclasses: ["Barren", "Dust Planet", "Impact World", "Lifeless"],
    biomes: ["Barren", "Dust", "Impact Craters", "Lifeless Rock"]
  }
];

export const PLANET_ANOMALIES = [
  "Planetary Rings",
  "Twin Moons",
  "Binary Planet",
  "Floating Islands",
  "World Tree",
  "Planetwide Storm",
  "Crystal Spires",
  "Massive Canyon",
  "Megacity Ruins",
  "Planet Crack",
  "Orbital Debris",
  "Artificial Moon",
  "Dyson Fragments",
  "Ancient Beacon",
  "Void Rift",
  "Gravity Anomaly",
  "Magnetic Storm",
  "Quantum Distortion",
  "Planetary Halo",
  "Aurora",
  "Black Ocean",
  "Endless Lightning",
  "Crystal Rain",
  "Floating Mountains",
  "Living Roots",
  "Ancient Superstructure",
  "Planetary Shield",
  "Artificial Sun",
  "Colossal Crater",
  "Orbital Elevator"
];

export function findPlanetClassByBiome(biome: string) {
  const normalizedBiome = biome.trim().toLowerCase();

  return PLANET_CLASS_MODEL.find((planetClass) =>
    planetClass.biomes.some((candidate) => candidate.toLowerCase() === normalizedBiome)
  );
}

export function findPlanetClassByName(name: string) {
  const normalizedName = name.trim().toLowerCase();
  return PLANET_CLASS_MODEL.find((planetClass) =>
    planetClass.name.toLowerCase() === normalizedName ||
    planetClass.aliases?.some((alias) => alias.toLowerCase() === normalizedName)
  );
}

export function rollPlanetClass(random: () => number) {
  const totalWeight = PLANET_CLASS_MODEL.reduce((total, planetClass) => total + planetClass.spawnWeight, 0);
  const roll = random() * totalWeight;
  let cumulative = 0;

  for (const planetClass of PLANET_CLASS_MODEL) {
    cumulative += planetClass.spawnWeight;
    if (roll <= cumulative) {
      return planetClass;
    }
  }

  return PLANET_CLASS_MODEL[0];
}

export function planetClassNames() {
  return PLANET_CLASS_MODEL.map((planetClass) => planetClass.name);
}

export function planetSubclassRows() {
  return PLANET_CLASS_MODEL.flatMap((planetClass) =>
    planetClass.subclasses.map((subclass) => ({
      planetClass: planetClass.name,
      subclass
    }))
  );
}

export function planetBiomeRows() {
  return PLANET_CLASS_MODEL.flatMap((planetClass) =>
    planetClass.biomes.map((biome) => ({
      planetClass: planetClass.name,
      biome
    }))
  );
}

export function planetClassSpawnRows() {
  return PLANET_CLASS_MODEL.map((planetClass) => ({
    planetClass: planetClass.name,
    tier: planetClass.spawnTier,
    weight: planetClass.spawnWeight
  }));
}

export function planetColonizationDifficultyRows() {
  return PLANET_CLASS_MODEL.map((planetClass) => ({
    planetClass: planetClass.name,
    difficulty: planetClass.colonizationDifficulty
  }));
}
