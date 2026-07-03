export type PlanetClassDefinition = {
  name: string;
  subclasses: string[];
  biomes: string[];
};

export const PLANET_CLASS_MODEL: PlanetClassDefinition[] = [
  {
    name: "Terrestrial",
    subclasses: ["Earthlike", "Continental", "Highlands", "Supercontinent"],
    biomes: ["Forest", "Grassland", "Swamp", "Mountain", "Highlands", "Continental"]
  },
  {
    name: "Ocean",
    subclasses: ["Deep Ocean", "Island World", "Archipelago", "Storm Ocean"],
    biomes: ["Ocean", "Coral", "Island", "Archipelago", "Storm Ocean"]
  },
  {
    name: "Desert",
    subclasses: ["Dunes", "Canyon", "Salt Flats", "Rock Desert"],
    biomes: ["Desert", "Canyon", "Dunes", "Salt Flats", "Rock Desert"]
  },
  {
    name: "Ice",
    subclasses: ["Glacial", "Frozen Ocean", "Snow World", "Cryovolcanic"],
    biomes: ["Frozen", "Tundra", "Glacier", "Frozen Ocean", "Cryovolcanic"]
  },
  {
    name: "Lava",
    subclasses: ["Volcanic", "Molten Core", "Ash World", "Basalt World"],
    biomes: ["Volcanic", "Magma", "Ash Fields", "Basalt", "Molten"]
  },
  {
    name: "Gas Giant",
    subclasses: ["Banded", "Storm Giant", "Ice Giant", "Metallic Giant"],
    biomes: ["Gas Bands", "Storm Layers", "Ice Clouds", "Metallic Clouds"]
  },
  {
    name: "Crystal",
    subclasses: ["Crystal Forest", "Crystal Desert", "Crystal Caverns", "Prismatic"],
    biomes: ["Crystal", "Crystal Forest", "Crystal Desert", "Crystal Caverns", "Prismatic Fields"]
  },
  {
    name: "Toxic",
    subclasses: ["Acid World", "Sulfur World", "Poison Swamp", "Corrosive"],
    biomes: ["Acid Swamp", "Sulfur Flats", "Poison Swamp", "Corrosive Wastes"]
  },
  {
    name: "Artificial",
    subclasses: ["Cyber Planet", "Machine World", "Arcology World", "Forge World"],
    biomes: ["Urban Ruins", "Mechanical", "Cyber Grid", "Arcology", "Forge"]
  },
  {
    name: "Void",
    subclasses: ["Dark Void", "Quantum Rift", "Entropy World", "Singularity World"],
    biomes: ["Void", "Dark Rift", "Quantum Rift", "Entropy Field", "Singularity"]
  },
  {
    name: "Living Planet",
    subclasses: ["Living Forest", "Living Ocean", "Organic World", "Symbiotic World"],
    biomes: ["Living Forest", "Living Ocean", "Organic", "Symbiotic", "Root Network"]
  },
  {
    name: "Bio Planet",
    subclasses: ["Mutated", "Bioluminescent", "Hive World", "Genetic World"],
    biomes: ["Mutated Jungle", "Bioluminescent Forest", "Hive", "Genetic Garden"]
  },
  {
    name: "Ancient World",
    subclasses: ["Temple World", "Lost Civilization", "Ruined Empire", "Archaeological"],
    biomes: ["Temple Ruins", "Lost City", "Ruined Empire", "Archaeological Dig", "Megalithic"]
  },
  {
    name: "Energy World",
    subclasses: ["Plasma", "Electromagnetic", "Storm World", "Radiant"],
    biomes: ["Plasma", "Electromagnetic", "Storm", "Radiant", "Lightning"]
  },
  {
    name: "Primordial World",
    subclasses: ["Proto World", "Young Planet", "Ancient Core", "Unformed"],
    biomes: ["Proto Crust", "Young Ocean", "Ancient Core", "Unformed Terrain"]
  },
  {
    name: "Dead World",
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
  return PLANET_CLASS_MODEL.find((planetClass) => planetClass.name.toLowerCase() === normalizedName);
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
