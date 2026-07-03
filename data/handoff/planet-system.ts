import type { PlanetVariable } from "@/types/schema";
import {
  PLANET_ANOMALIES,
  planetBiomeRows,
  planetClassNames,
  planetClassSpawnRows,
  planetColonizationDifficultyRows,
  planetSubclassRows
} from "@/lib/planets/class-model";

type PlanetVariableInput = {
  category: string;
  values: string[];
  description: string;
  generation_rule: string;
  frequency?: string;
  weight?: number;
  min_value?: number;
  max_value?: number;
  biome_tags?: string[];
  resource_tags?: string[];
  status?: string;
  notes?: string;
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function variableRows(input: PlanetVariableInput): PlanetVariable[] {
  return input.values.map((value) => ({
    id: `planet-${slug(input.category)}-${slug(value)}`,
    category: input.category,
    value,
    description: input.description,
    generation_rule: input.generation_rule,
    frequency: input.frequency ?? "",
    weight: input.weight ?? 0,
    min_value: input.min_value ?? 0,
    max_value: input.max_value ?? 0,
    biome_tags: input.biome_tags ?? [],
    resource_tags: input.resource_tags ?? [],
    status: input.status ?? "Draft",
    notes: input.notes ?? ""
  }));
}

function planetClassSpawnWeightRows(): PlanetVariable[] {
  return planetClassSpawnRows().map((row) => ({
    id: `planet-class-spawn-weight-${slug(row.planetClass)}`,
    category: "Planet Class Spawn Weight",
    value: row.planetClass,
    description: "Independent weighted chance for selecting the fundamental planet class after rarity is rolled.",
    generation_rule: "Planet rarity and planet class are independent. Every rarity can combine with every class unless a future explicit restriction is added.",
    frequency: row.tier,
    weight: row.weight,
    min_value: 0,
    max_value: 100,
    biome_tags: [],
    resource_tags: [],
    status: "Active",
    notes: `${row.weight}% class spawn weight.`
  }));
}

function planetClassColonizationDifficultyRows(): PlanetVariable[] {
  return planetColonizationDifficultyRows().map((row) => ({
    id: `planet-class-colonization-difficulty-${slug(row.planetClass)}`,
    category: "Planet Class Colonization Difficulty",
    value: row.planetClass,
    description: "Baseline colonization difficulty determined by planet class.",
    generation_rule: "Class difficulty sets the baseline colonization Difficulty score before other modifiers are applied.",
    frequency: `${row.difficulty}/5`,
    weight: row.difficulty,
    min_value: row.difficulty,
    max_value: row.difficulty,
    biome_tags: [],
    resource_tags: [],
    status: "Active",
    notes: `${row.difficulty} out of 5 difficulty.`
  }));
}

export const planetSystemVariables: PlanetVariable[] = [
  ...variableRows({
    category: "Objective",
    values: ["Unique Seed", "Procedural Galaxy", "No Handcrafted Planets", "Permanent Discovery Record"],
    description: "Core planet generation objective for Project Genesis.",
    generation_rule: "Every discovered planet is generated from a unique seed and permanently stored."
  }),
  ...variableRows({
    category: "Planet Data Field",
    values: ["Planet ID", "Planet Seed", "Planet Name", "Galaxy Sector", "Star System", "Orbit Position", "Planet Class", "Planet Subclass", "Primary Biome", "Planet Anomalies", "Discovery Order", "Colonized", "Terraform Level", "Discovery Points"],
    description: "Canonical stored fields for a generated planet record.",
    generation_rule: "Persist these fields for every discovered planet."
  }),
  ...variableRows({
    category: "Star Type",
    values: ["Red Dwarf", "Yellow Star", "Blue Giant", "White Dwarf", "Binary Star", "Neutron Star", "Pulsar", "Black Hole"],
    description: "Star type pool for procedural star systems.",
    generation_rule: "Planet seed selects a star type before orbit and climate modifiers are applied."
  }),
  ...variableRows({
    category: "Distance From Star",
    values: ["Very Close", "Close", "Habitable", "Far", "Frozen"],
    description: "Orbital distance band used for temperature, water, and habitability modifiers.",
    generation_rule: "Distance from star modifies temperature, water coverage, hazards, and colonization difficulty."
  }),
  ...variableRows({
    category: "Orbit Speed",
    values: ["Slow", "Normal", "Fast"],
    description: "Orbit speed variable for star system identity and simulation hooks.",
    generation_rule: "Orbit speed is derived from star type, orbit position, and planet class."
  }),
  ...variableRows({
    category: "Planet Class",
    values: planetClassNames(),
    description: "Fundamental world type used to drive visual identity, rules, resource pools, and story tone.",
    generation_rule: "Planet rarity rolls first, then planet class is selected before subclass, biome, atmosphere, resources, anomalies, and story."
  }),
  ...planetClassSpawnWeightRows(),
  ...planetClassColonizationDifficultyRows(),
  ...variableRows({
    category: "Planet Subclass",
    values: planetSubclassRows().map((row) => row.subclass),
    description: "Major variation within a planet class.",
    generation_rule: "Subclass is selected after planet class and before biome. Rings are not subclasses; rings are generated as planet anomalies."
  }),
  ...variableRows({
    category: "Primary Biome",
    values: planetBiomeRows().map((row) => row.biome),
    description: "Primary biome pool used by planet generation.",
    generation_rule: "Biome is constrained by planet class and subclass, then climate and atmosphere apply modifiers."
  }),
  ...variableRows({
    category: "Planet Anomaly",
    values: PLANET_ANOMALIES,
    description: "Rare procedural modifier that can add visual identity, gameplay hooks, and story complexity.",
    generation_rule: "Anomalies are selected after traits. Planetary Rings now live here and can appear on many compatible planet classes."
  }),
  ...variableRows({
    category: "Climate",
    values: ["Temperate", "Tropical", "Humid", "Dry", "Frozen", "Arid", "Stormy", "Acidic", "Radioactive"],
    description: "Climate variable used for weather, hazards, flora, fauna, and colonization difficulty.",
    generation_rule: "Climate is derived from star distance, atmosphere, biome, and planet class."
  }),
  ...variableRows({
    category: "Atmosphere",
    values: ["Breathable", "Thin", "Dense", "Toxic", "Methane", "Hydrogen", "Artificial", "Ionized", "None"],
    description: "Atmospheric composition and density pool.",
    generation_rule: "Atmosphere modifies colonization difficulty, weather, hazards, flora, fauna, and visual sky settings."
  }),
  ...variableRows({
    category: "Temperature",
    values: ["Frozen", "Cold", "Cool", "Temperate", "Warm", "Hot", "Extreme"],
    description: "Temperature band used by generation and colonization simulation.",
    generation_rule: "Temperature is derived from star distance, atmosphere, water coverage, and planet class."
  }),
  ...variableRows({
    category: "Gravity",
    values: ["Very Low", "Low", "Standard", "High", "Extreme"],
    description: "Gravity band used for gameplay, traversal, fauna, and colonization modifiers.",
    generation_rule: "Gravity is derived from planet class, mass, and procedural traits."
  }),
  ...variableRows({
    category: "Water Coverage",
    values: ["0%", "10%", "25%", "50%", "75%", "90%", "100%"],
    description: "Planet surface water coverage pool.",
    generation_rule: "Water coverage is constrained by biome, temperature, atmosphere, and planet class."
  }),
  ...variableRows({
    category: "Moons",
    values: ["0", "1", "2", "3", "4", "5+"],
    description: "Moon count pool for generated planet records.",
    generation_rule: "Moon count is selected from class, orbit position, star type, and seed."
  }),
  ...variableRows({
    category: "Resource",
    values: ["Stone", "Iron", "Copper", "Coal", "Oil", "Gold", "Titanium", "Lithium", "Silicon", "Uranium", "Crystal", "Rare Crystal", "Ancient Alloy", "Dark Matter", "Exotic Matter", "Quantum Ore", "Living Biomass", "Alien Organics"],
    description: "Resource pool available to planet generation.",
    generation_rule: "Each planet receives 5-15 resources, modified by class, biome, traits, and ancient civilization.",
    min_value: 5,
    max_value: 15
  }),
  ...variableRows({
    category: "Flora",
    values: ["None", "Sparse", "Normal", "Dense", "Alien Forest", "Crystal Forest", "Giant Trees", "Floating Plants", "Bioluminescent", "Carnivorous", "Living Vines"],
    description: "Flora density and type pool.",
    generation_rule: "Flora is constrained by biome, climate, atmosphere, water coverage, and hazards."
  }),
  ...variableRows({
    category: "Fauna",
    values: ["None", "Passive", "Neutral", "Aggressive", "Predator", "Flying", "Aquatic", "Ancient", "Mechanical", "Hive", "Colossal", "Legendary"],
    description: "Fauna behavior and rarity pool.",
    generation_rule: "Fauna is derived from biome, flora, water coverage, ancient civilization, and hazard profile."
  }),
  ...variableRows({
    category: "Ancient Civilization",
    values: ["None", "Primitive", "Industrial", "Technological", "Alien Empire", "Machine Civilization", "Metropolis Civilization", "Ancient AI", "Harmony Civilization", "Void Civilization"],
    description: "Ancient civilization layer used for story, ruins, artifacts, and collectibles.",
    generation_rule: "Ancient civilization can modify ruins, event pools, collectible pools, and hidden narrative fragments."
  }),
  ...variableRows({
    category: "Ruins",
    values: ["None", "Village", "Temple", "City", "Megacity", "Underground", "Laboratory", "Factory", "Arcology", "Spaceport"],
    description: "Ruin type pool for exploration and collectible hooks.",
    generation_rule: "Ruin type is selected from ancient civilization, planet class, biome, and story seed."
  }),
  ...variableRows({
    category: "Hazard",
    values: ["Radiation", "Acid Rain", "Meteor Storms", "Earthquakes", "Lava", "Extreme Cold", "Extreme Heat", "Tornadoes", "Sandstorms", "Flooding", "Wildlife", "Disease", "Energy Storms", "Magnetic Storms", "Void Corruption"],
    description: "Planet hazard pool.",
    generation_rule: "Each planet receives 2-6 hazards, modified by class, climate, atmosphere, weather, and traits.",
    min_value: 2,
    max_value: 6
  }),
  ...variableRows({
    category: "Trait",
    values: ["Rich Minerals", "Crystal Growth", "Dense Forest", "Ancient Ruins", "Living Planet", "Terraformable", "Heavy Gravity", "Low Gravity", "Magnetic Core", "High Radiation", "Frozen Core", "Energy Storms", "Ancient Battlefield", "Abandoned Colony", "Massive Caves", "Floating Mountains", "Bioluminescent", "Ancient Tree", "Machine Hive", "Quantum Rift", "Mega Ruins", "Perfect Climate", "Resource Rich", "Resource Poor", "Ancient Library", "World Ocean", "Deep Core", "Floating Cities"],
    description: "Procedural planet trait pool.",
    generation_rule: "Each planet receives 2-5 traits that modify resources, hazards, collectibles, visuals, story, and economy.",
    min_value: 2,
    max_value: 5
  }),
  ...variableRows({
    category: "Modifier",
    values: ["+25% Mining", "+50% Farming", "+100% Crystal Spawn", "Rare Creatures", "Legendary Creatures", "Ancient Artifacts", "High Population", "Fast Construction", "Cheap Buildings", "Research Bonus", "Energy Bonus", "Trade Bonus"],
    description: "Gameplay modifier examples generated by traits, class, resources, and civilization history.",
    generation_rule: "Modifiers directly affect gameplay outputs and should be derived from generated planet variables."
  }),
  ...variableRows({
    category: "Collectible Pool",
    values: ["Alien Creatures", "Artifacts", "Lost Technology", "Fossils", "Alien Eggs", "Terraforming Seeds", "Crystal Formations", "Planet Relics", "Ancient AI Fragments", "Ship Components"],
    description: "Collectible pool candidates for generated planets.",
    generation_rule: "Each planet generates collectible pools from class, biome, ancient civilization, ruins, traits, resources, hazards, and events."
  }),
  ...variableRows({
    category: "Visual Theme",
    values: ["Sky Color", "Ground Color", "Fog Color", "Water Color", "Cloud Density", "Lighting", "Aurora", "Vegetation Color", "Rock Color"],
    description: "Visual theme fields generated for planet presentation.",
    generation_rule: "Visual fields are derived from class, biome, climate, atmosphere, water, weather, and traits."
  }),
  ...variableRows({
    category: "Weather",
    values: ["Sunny", "Cloudy", "Rain", "Snow", "Blizzard", "Thunderstorm", "Acid Rain", "Meteor Shower", "Solar Storm", "Aurora", "Dust Storm", "Ash Fall", "Crystal Rain"],
    description: "Weather pool for planet generation and events.",
    generation_rule: "Weather is derived from climate, atmosphere, star distance, hazards, and planet class."
  }),
  ...variableRows({
    category: "Colonization",
    values: ["Difficulty", "Population Capacity", "Construction Modifier", "Food Modifier", "Power Modifier", "Expansion Modifier", "Terraform Cost"],
    description: "Colonization variables computed for each planet.",
    generation_rule: "Colonization values are derived from class, gravity, atmosphere, hazards, resources, weather, and terraformability."
  }),
  ...variableRows({
    category: "Science",
    values: ["Research Bonus", "Discovery Bonus", "Artifact Bonus", "Ancient Knowledge", "Rare Research", "Technology Chance"],
    description: "Science and discovery outputs generated per planet.",
    generation_rule: "Science variables are driven by ruins, ancient civilization, collectibles, traits, and story seed."
  }),
  ...variableRows({
    category: "Economy",
    values: ["Trade Value", "Mining Value", "Agriculture Value", "Industry Value", "Tourism Value", "Collectible Value"],
    description: "Economy values generated per planet.",
    generation_rule: "Economy variables are derived from resources, traits, modifiers, class, colonization difficulty, and collectible pools."
  }),
  ...variableRows({
    category: "Event Pool",
    values: ["Ancient Signal", "Meteor Impact", "Alien Nest", "Crystal Bloom", "Lost Colony", "Machine Awakening", "Volcano", "Flood", "Disease", "Trade Opportunity", "Pirates", "Harmony Beacon", "Void Portal"],
    description: "Planet event pool candidates.",
    generation_rule: "Event pools are generated from class, biome, ancient civilization, ruins, traits, hazards, economy, and story state."
  }),
  ...variableRows({
    category: "Discovery Journal",
    values: ["Date Found", "Player", "Colonized", "Terraform Level", "Artifacts Found", "Species Found", "Museum Progress", "Discovery Points", "Completion %"],
    description: "Permanent discovery journal fields stored per discovered planet.",
    generation_rule: "Discovery journal tracks player progress after the planet is generated."
  }),
  ...variableRows({
    category: "Story Component",
    values: ["Planet Class", "Planet Subclass", "Biome", "Anomalies", "Ancient Civilization", "Ruins", "Traits", "Resources", "Hazards", "Collectibles", "Events"],
    description: "Inputs used to assemble hidden procedural planet narratives.",
    generation_rule: "Narrative fragments are assembled from generated variables to make every planet feel historical and discoverable."
  }),
  ...variableRows({
    category: "Design Philosophy",
    values: ["History", "Mysteries", "Valuable Discoveries", "Worth Colonizing", "Worth Revisiting", "Never Another Forest Planet"],
    description: "Design goals for procedural exploration.",
    generation_rule: "Generation should make each planet feel like a distinct place with history, mystery, value, and revisit potential."
  })
];
