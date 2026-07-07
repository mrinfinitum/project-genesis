export type PlanetClassDefinition = {
  name: string;
  aliases?: string[];
  spawnTier: "Very Common" | "Common" | "Uncommon" | "Rare" | "Extremely Rare";
  spawnWeight: number;
  colonizationDifficulty: number;
  landable: boolean;
  colonizable: boolean;
  usesSurfaceGeneration: boolean;
  usesOrbitalGameplay: boolean;
  defaultInteractionType: string;
  subclasses: string[];
  biomes: string[];
};

export const PLANET_CLASS_MODEL: PlanetClassDefinition[] = [
  {
    name: "Terrestrial",
    spawnTier: "Very Common",
    spawnWeight: 22,
    colonizationDifficulty: 1,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Exploration",
    subclasses: ["Earthlike", "Continental", "Highlands", "Swamp", "Riverlands", "Badlands", "Savanna", "Alpine"],
    biomes: ["Earthlike", "Continental", "Highlands", "Swamp", "Riverlands", "Badlands", "Savanna", "Alpine"]
  },
  {
    name: "Ocean",
    spawnTier: "Very Common",
    spawnWeight: 11,
    colonizationDifficulty: 2,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Exploration",
    subclasses: ["Deep Ocean", "Island World", "Archipelago", "Storm Ocean", "Coral World", "Frozen Ocean", "Kelp Ocean", "Abyssal Ocean"],
    biomes: ["Deep Ocean", "Island World", "Archipelago", "Storm Ocean", "Coral World", "Frozen Ocean", "Kelp Ocean", "Abyssal Ocean"]
  },
  {
    name: "Desert",
    spawnTier: "Very Common",
    spawnWeight: 12,
    colonizationDifficulty: 2,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Exploration",
    subclasses: ["Dunes", "Canyon", "Salt Flats", "Rock Desert", "Mesa", "Dust Basin", "Black Desert", "Oasis"],
    biomes: ["Dunes", "Canyon", "Salt Flats", "Rock Desert", "Mesa", "Dust Basin", "Black Desert", "Oasis"]
  },
  {
    name: "Ice",
    spawnTier: "Very Common",
    spawnWeight: 11,
    colonizationDifficulty: 3,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Exploration",
    subclasses: ["Glacial", "Frozen Ocean", "Snow World", "Cryovolcanic", "Blue Ice", "Ice Canyons", "Polar", "Fractured Ice"],
    biomes: ["Glacial", "Frozen Ocean", "Snow World", "Cryovolcanic", "Blue Ice", "Ice Canyons", "Polar", "Fractured Ice"]
  },
  {
    name: "Lava",
    spawnTier: "Common",
    spawnWeight: 7,
    colonizationDifficulty: 4,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Exploration",
    subclasses: ["Volcanic", "Molten Core", "Ash World", "Basalt World", "Obsidian", "Firestorm", "Sulfur Basin", "Magma Ocean"],
    biomes: ["Volcanic", "Molten Core", "Ash World", "Basalt World", "Obsidian", "Firestorm", "Sulfur Basin", "Magma Ocean"]
  },
  {
    name: "Gas Giant",
    spawnTier: "Very Common",
    spawnWeight: 10,
    colonizationDifficulty: 5,
    landable: false,
    colonizable: false,
    usesSurfaceGeneration: false,
    usesOrbitalGameplay: true,
    defaultInteractionType: "Orbital Harvesting",
    subclasses: ["Banded", "Storm Giant", "Ice Giant", "Metallic Giant", "Amber Giant", "Emerald Giant", "Striped Giant", "Cyclone Giant"],
    biomes: ["Banded", "Storm Giant", "Ice Giant", "Metallic Giant", "Amber Giant", "Emerald Giant", "Striped Giant", "Cyclone Giant"]
  },
  {
    name: "Crystal",
    spawnTier: "Common",
    spawnWeight: 5,
    colonizationDifficulty: 3,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Exploration",
    subclasses: ["Crystal Forest", "Crystal Desert", "Crystal Caverns", "Prismatic", "Quartz Peaks", "Amethyst", "Emerald Crystal", "Sapphire Crystal"],
    biomes: ["Crystal Forest", "Crystal Desert", "Crystal Caverns", "Prismatic", "Quartz Peaks", "Amethyst", "Emerald Crystal", "Sapphire Crystal"]
  },
  {
    name: "Toxic",
    spawnTier: "Common",
    spawnWeight: 6,
    colonizationDifficulty: 4,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Exploration",
    subclasses: ["Acid World", "Sulfur World", "Poison Swamp", "Corrosive", "Green Atmosphere", "Purple Atmosphere", "Chemical Seas", "Industrial Wasteland"],
    biomes: ["Acid World", "Sulfur World", "Poison Swamp", "Corrosive", "Green Atmosphere", "Purple Atmosphere", "Chemical Seas", "Industrial Wasteland"]
  },
  {
    name: "Artificial",
    spawnTier: "Uncommon",
    spawnWeight: 4,
    colonizationDifficulty: 4,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Exploration",
    subclasses: ["Machine World", "Cyber Planet", "Forge World", "Arcology World", "AI Core", "Nanotech World", "Data Sphere", "Defense World"],
    biomes: ["Machine World", "Cyber Planet", "Forge World", "Arcology World", "AI Core", "Nanotech World", "Data Sphere", "Defense World"]
  },
  {
    name: "Void",
    aliases: ["Void World"],
    spawnTier: "Extremely Rare",
    spawnWeight: 0.15,
    colonizationDifficulty: 5,
    landable: true,
    colonizable: false,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Anomaly Survey",
    subclasses: ["Dark Void", "Quantum Rift", "Entropy World", "Singularity World", "Shadow World", "Event Horizon", "Negative Space", "Void Storms"],
    biomes: ["Dark Void", "Quantum Rift", "Entropy World", "Singularity World", "Shadow World", "Event Horizon", "Negative Space", "Void Storms"]
  },
  {
    name: "Living",
    aliases: ["Living Planet"],
    spawnTier: "Rare",
    spawnWeight: 2,
    colonizationDifficulty: 5,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Bio Survey",
    subclasses: ["Living Forest", "Living Ocean", "Organic World", "Symbiotic World", "World Tree", "Living Coral", "Breathing World", "Root Network"],
    biomes: ["Living Forest", "Living Ocean", "Organic World", "Symbiotic World", "World Tree", "Living Coral", "Breathing World", "Root Network"]
  },
  {
    name: "Bio",
    aliases: ["Bio Planet"],
    spawnTier: "Rare",
    spawnWeight: 1.5,
    colonizationDifficulty: 5,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Bio Survey",
    subclasses: ["Mutated", "Bioluminescent", "Hive World", "Genetic World", "Spore World", "Fungal World", "Parasite World", "Cellular"],
    biomes: ["Mutated", "Bioluminescent", "Hive World", "Genetic World", "Spore World", "Fungal World", "Parasite World", "Cellular"]
  },
  {
    name: "Ancient",
    aliases: ["Ancient World"],
    spawnTier: "Uncommon",
    spawnWeight: 3,
    colonizationDifficulty: 4,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Archaeological Survey",
    subclasses: ["Temple World", "Lost Civilization", "Ruined Empire", "Archaeological", "Ancient Battlefield", "Collapsed Arcology", "Relic World", "Forgotten Capital"],
    biomes: ["Temple World", "Lost Civilization", "Ruined Empire", "Archaeological", "Ancient Battlefield", "Collapsed Arcology", "Relic World", "Forgotten Capital"]
  },
  {
    name: "Energy",
    aliases: ["Energy World"],
    spawnTier: "Rare",
    spawnWeight: 1,
    colonizationDifficulty: 5,
    landable: true,
    colonizable: false,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Energy Survey",
    subclasses: ["Plasma World", "Electromagnetic", "Storm World", "Radiant", "Aurora", "Ion World", "Charged", "Quantum Storm"],
    biomes: ["Plasma World", "Electromagnetic", "Storm World", "Radiant", "Aurora", "Ion World", "Charged", "Quantum Storm"]
  },
  {
    name: "Primordial",
    aliases: ["Primordial World"],
    spawnTier: "Extremely Rare",
    spawnWeight: 0.35,
    colonizationDifficulty: 5,
    landable: true,
    colonizable: true,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Exploration",
    subclasses: ["Proto World", "Young Planet", "Ancient Core", "Unformed", "Cooling Crust", "Heavy Bombardment", "Proto Ocean", "Molten Crust"],
    biomes: ["Proto World", "Young Planet", "Ancient Core", "Unformed", "Cooling Crust", "Heavy Bombardment", "Proto Ocean", "Molten Crust"]
  },
  {
    name: "Dead",
    aliases: ["Dead World"],
    spawnTier: "Uncommon",
    spawnWeight: 4,
    colonizationDifficulty: 3,
    landable: true,
    colonizable: false,
    usesSurfaceGeneration: true,
    usesOrbitalGameplay: false,
    defaultInteractionType: "Surface Survey",
    subclasses: ["Barren", "Dust Planet", "Impact World", "Lifeless", "Airless", "Grey World", "Broken World", "Crater Fields"],
    biomes: ["Barren", "Dust Planet", "Impact World", "Lifeless", "Airless", "Grey World", "Broken World", "Crater Fields"]
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

export function slugPlanetTaxonomyValue(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function findPlanetClassByBiome(biome: string) {
  const normalizedBiome = biome.trim().toLowerCase();

  return PLANET_CLASS_MODEL.find((planetClass) =>
    planetClass.biomes.some((candidate) => candidate.toLowerCase() === normalizedBiome)
  );
}

export function findPlanetClassBySubclass(subclass: string) {
  const normalizedSubclass = subclass.trim().toLowerCase();

  return PLANET_CLASS_MODEL.find((planetClass) =>
    planetClass.subclasses.some((candidate) => candidate.toLowerCase() === normalizedSubclass)
  );
}

export function findPlanetClassByName(name: string) {
  const normalizedName = name.trim().toLowerCase();
  return PLANET_CLASS_MODEL.find((planetClass) =>
    planetClass.name.toLowerCase() === normalizedName ||
    planetClass.aliases?.some((alias) => alias.toLowerCase() === normalizedName)
  );
}

export function inferPlanetTaxonomyFromPathParts(parts: string[]) {
  const slugs = parts.map(slugPlanetTaxonomyValue).filter(Boolean);
  const includesSlug = (candidate: string) => slugs.some((part) => part === candidate || part.includes(candidate));

  for (const planetClass of PLANET_CLASS_MODEL) {
    const classSlugs = [planetClass.name, ...(planetClass.aliases ?? [])].map(slugPlanetTaxonomyValue);
    const classIndex = slugs.findIndex((part) => classSlugs.some((classSlug) => part === classSlug || part.includes(classSlug)));

    if (classIndex === -1) {
      continue;
    }

    const subclass = planetClass.subclasses.find((candidate) => {
      const subclassSlug = slugPlanetTaxonomyValue(candidate);
      return slugs.some((part, index) => index >= classIndex && (part === subclassSlug || part.includes(subclassSlug)));
    });

    return {
      planetClass,
      subclass
    };
  }

  for (const planetClass of PLANET_CLASS_MODEL) {
    const subclass = planetClass.subclasses.find((candidate) => includesSlug(slugPlanetTaxonomyValue(candidate)));

    if (subclass) {
      return {
        planetClass,
        subclass
      };
    }
  }

  return null;
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
