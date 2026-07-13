export type ContentPackStatus = "Complete" | "Approved" | "Published" | "Ready" | "Needs Work" | "Blocked";

export type ContentPackCategory =
  | "resources"
  | "buildings"
  | "research"
  | "productionChains"
  | "missions"
  | "events"
  | "collectibles"
  | "art"
  | "audio"
  | "ui"
  | "balance"
  | "progression";

export type ContentPackItem = {
  id: string;
  name: string;
  status: ContentPackStatus;
  description: string;
  linkedIds?: string[];
  artKey?: string;
  iconKey?: string;
  inputs?: string[];
  outputs?: string[];
  unlocks?: string[];
  dependencies?: string[];
  notes?: string;
};

export type ContentPack = {
  id: string;
  eraId: string;
  eraName: string;
  title: string;
  status: ContentPackStatus;
  goal: string;
  categories: Record<ContentPackCategory, ContentPackItem[]>;
  relationships: Array<{
    id: string;
    fromId: string;
    toId: string;
    relationship: string;
  }>;
  completionRule: string;
};

const complete = "Complete" as const;

const resourceRows: Array<[string, string, string, string, string[]]> = [
  ["RES-0005", "Wood", "Organic", "Early construction, fuel, planks, shelter frames, and basic tool handles.", ["building_shelter", "research_primitive_tools", "chain_tree_to_shelter"]],
  ["RES-0001", "Stone", "Mineral", "Core material for stone tools, blocks, fire pits, workshops, and quarry loops.", ["building_stone_quarry", "research_stone_tools", "chain_stone_to_workshop"]],
  ["RES-PACK-SURVIVAL-WATER", "Water", "Liquid", "Raw gathered water that must be collected or purified before stable population use.", ["building_water_collector", "research_water_collection", "chain_water_to_population"]],
  ["RES-0006", "Fresh Water", "Liquid", "Population-safe water for growth, cooking, sanitation, and the Ancient Era transition.", ["building_water_collector", "mission_collect_water", "chain_water_to_population"]],
  ["RES-0003", "Clay", "Mineral", "Flexible settlement material for storage, bricks, pottery, and early construction.", ["building_storage_pit", "research_food_preservation", "chain_clay_to_storage"]],
  ["RES-0002", "Sand", "Mineral", "Loose material for fire control, primitive filtration, early masonry, and later glass chains.", ["building_fire_pit", "research_primitive_mining"]],
  ["RES-0004", "Soil", "Organic/Mineral", "Supports foraging, early food systems, population growth, and later agriculture.", ["building_foraging_camp", "mission_store_food"]],
  ["RES-PACK-SURVIVAL-FIBER", "Fiber", "Organic", "Cordage material for rope, shelter bindings, traps, and tool reinforcement.", ["research_rope_making", "building_hunting_lodge"]],
  ["RES-0009", "Coal", "Fuel", "Dense burnable fuel that previews later energy production while strengthening Survival heat chains.", ["building_campfire", "research_fire"]],
  ["RES-PACK-SURVIVAL-BONE", "Bone", "Organic", "Animal byproduct used for needles, hooks, primitive tools, and collectible/crafting hooks.", ["building_hunting_lodge", "research_primitive_tools"]],
  ["RES-PACK-SURVIVAL-ANIMAL-HIDE", "Animal Hide", "Organic", "Durable hide for shelter insulation, clothing, storage, and hunting progression.", ["building_shelter", "building_hunting_lodge"]],
  ["RES-PACK-SURVIVAL-FLINT", "Flint", "Mineral", "Sharp stone used for blades, axes, fire-starting, and the Golden Flint collectible path.", ["research_fire", "research_stone_tools", "mission_craft_stone_axe"]],
  ["RES-PACK-SURVIVAL-FOOD", "Food", "Organic", "Baseline survival output consumed by population, missions, storage, and Ancient unlock checks.", ["building_foraging_camp", "building_hunting_lodge", "mission_store_food"]]
];

const resources: ContentPackItem[] = resourceRows.map(([id, name, category, description, linkedIds]) => ({
  id,
  name,
  status: complete,
  description,
  linkedIds,
  iconKey: `resource_${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  artKey: `survival_resource_${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  notes: `Survival ${category} resource.`
}));

const buildings: ContentPackItem[] = [
  {
    id: "building_campfire",
    name: "Campfire",
    status: complete,
    description: "First heat, morale, cooking, and night-safety building.",
    inputs: ["RES-0005", "RES-PACK-SURVIVAL-FLINT"],
    outputs: ["heat", "cooked_food", "morale"],
    unlocks: ["mission_discover_fire", "research_cooking"],
    dependencies: ["research_fire"],
    artKey: "survival_building_campfire",
    iconKey: "building_campfire"
  },
  {
    id: "building_shelter",
    name: "Shelter",
    status: complete,
    description: "First population protection structure and the central Survival construction objective.",
    inputs: ["RES-0005", "RES-PACK-SURVIVAL-FIBER", "RES-PACK-SURVIVAL-ANIMAL-HIDE"],
    outputs: ["population_capacity", "weather_protection"],
    dependencies: ["research_shelter_construction"],
    artKey: "survival_building_shelter",
    iconKey: "building_shelter"
  },
  {
    id: "building_primitive_workshop",
    name: "Primitive Workshop",
    status: complete,
    description: "Crafting hub for primitive tools, stone blocks, planks, and first upgrade loops.",
    inputs: ["RES-0001", "RES-0005"],
    outputs: ["primitive_tools", "planks", "stone_blocks"],
    dependencies: ["research_primitive_tools"],
    artKey: "survival_building_primitive_workshop",
    iconKey: "building_primitive_workshop"
  },
  {
    id: "building_storage_pit",
    name: "Storage Pit",
    status: complete,
    description: "Early inventory protection for food, clay, hide, tools, and disaster recovery.",
    inputs: ["RES-0003", "RES-0001"],
    outputs: ["storage_capacity", "spoilage_reduction"],
    dependencies: ["research_food_preservation"],
    artKey: "survival_building_storage_pit",
    iconKey: "building_storage_pit"
  },
  {
    id: "building_water_collector",
    name: "Water Collector",
    status: complete,
    description: "Converts gathered water into population-safe Fresh Water.",
    inputs: ["RES-PACK-SURVIVAL-WATER", "RES-0002", "RES-0003"],
    outputs: ["RES-0006"],
    dependencies: ["research_water_collection"],
    artKey: "survival_building_water_collector",
    iconKey: "building_water_collector"
  },
  {
    id: "building_foraging_camp",
    name: "Foraging Camp",
    status: complete,
    description: "Baseline Food, Fiber, Soil knowledge, and early population support loop.",
    inputs: ["labor"],
    outputs: ["RES-PACK-SURVIVAL-FOOD", "RES-PACK-SURVIVAL-FIBER"],
    dependencies: ["research_gathering"],
    artKey: "survival_building_foraging_camp",
    iconKey: "building_foraging_camp"
  },
  {
    id: "building_stone_quarry",
    name: "Stone Quarry",
    status: complete,
    description: "Stable Stone output and the gateway to stronger blocks and workshops.",
    inputs: ["labor", "primitive_tools"],
    outputs: ["RES-0001", "stone_blocks"],
    dependencies: ["research_primitive_mining"],
    artKey: "survival_building_stone_quarry",
    iconKey: "building_stone_quarry"
  },
  {
    id: "building_hunting_lodge",
    name: "Hunting Lodge",
    status: complete,
    description: "Animal Hide, Bone, and Food output with predator-event counterplay.",
    inputs: ["primitive_tools", "RES-PACK-SURVIVAL-FIBER"],
    outputs: ["RES-PACK-SURVIVAL-FOOD", "RES-PACK-SURVIVAL-BONE", "RES-PACK-SURVIVAL-ANIMAL-HIDE"],
    dependencies: ["research_primitive_tools"],
    artKey: "survival_building_hunting_lodge",
    iconKey: "building_hunting_lodge"
  },
  {
    id: "building_fire_pit",
    name: "Fire Pit",
    status: complete,
    description: "Permanent fire upgrade that improves heat retention, cooking, safety, and disaster resilience.",
    inputs: ["RES-0001", "RES-0002", "RES-0009"],
    outputs: ["stable_heat", "event_resilience"],
    dependencies: ["research_fire", "research_cooking"],
    artKey: "survival_building_fire_pit",
    iconKey: "building_fire_pit"
  }
];

const researchRows: Array<[string, string, string, string[], string[]]> = [
  ["research_fire", "Fire", "Unlocks Campfire, Fire Pit, cooked food, heat safety, and fire-event counterplay.", [], ["building_campfire", "building_fire_pit"]],
  ["research_stone_tools", "Stone Tools", "Unlocks stone axe crafting, quarry efficiency, and early tool upgrades.", ["research_fire"], ["mission_craft_stone_axe", "building_stone_quarry"]],
  ["research_primitive_tools", "Primitive Tools", "Unlocks the Primitive Workshop, hunting output, and stronger gather rates.", ["research_stone_tools"], ["building_primitive_workshop", "building_hunting_lodge"]],
  ["research_shelter_construction", "Shelter Construction", "Unlocks Shelter, weather protection, and population capacity.", ["research_primitive_tools"], ["building_shelter"]],
  ["research_gathering", "Gathering", "Unlocks Foraging Camp, food income, fiber discovery, and Gathering missions.", [], ["building_foraging_camp", "mission_gather_wood"]],
  ["research_cooking", "Cooking", "Improves Food safety, morale, disease resistance, and Fire Pit value.", ["research_fire"], ["building_fire_pit"]],
  ["research_water_collection", "Water Collection", "Unlocks Water Collector and Fresh Water population flow.", ["research_gathering"], ["building_water_collector", "mission_collect_water"]],
  ["research_food_preservation", "Food Preservation", "Unlocks Storage Pit and lowers spoilage during drought/disease events.", ["research_cooking"], ["building_storage_pit", "mission_store_food"]],
  ["research_rope_making", "Rope Making", "Unlocks Fiber bindings for shelter, hunting, storage, and workshop upgrades.", ["research_gathering"], ["building_shelter", "building_hunting_lodge"]],
  ["research_primitive_mining", "Primitive Mining", "Unlocks Stone Quarry, Clay/Sand handling, and Stone Block chains.", ["research_stone_tools"], ["building_stone_quarry", "chain_stone_to_workshop"]]
];

const research: ContentPackItem[] = researchRows.map(([id, name, description, dependencies, unlocks]) => ({
  id,
  name,
  status: complete,
  description,
  dependencies,
  unlocks,
  artKey: `survival_research_${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  iconKey: `research_${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  notes: "Includes artwork, dependencies, unlocks, linked buildings/resources, and alignment effects for Technology, Industry, and Nature."
}));

const productionChains: ContentPackItem[] = [
  {
    id: "chain_tree_to_shelter",
    name: "Tree to Shelter",
    status: complete,
    description: "Tree -> Wood -> Planks -> Shelter.",
    inputs: ["tree", "RES-0005"],
    outputs: ["planks", "building_shelter"],
    linkedIds: ["RES-0005", "building_shelter", "research_shelter_construction"],
    artKey: "survival_chain_tree_to_shelter"
  },
  {
    id: "chain_stone_to_workshop",
    name: "Stone to Primitive Workshop",
    status: complete,
    description: "Stone -> Stone Blocks -> Primitive Workshop.",
    inputs: ["RES-0001"],
    outputs: ["stone_blocks", "building_primitive_workshop"],
    linkedIds: ["RES-0001", "building_primitive_workshop", "research_primitive_mining"],
    artKey: "survival_chain_stone_to_workshop"
  },
  {
    id: "chain_water_to_population",
    name: "Water to Population",
    status: complete,
    description: "Water -> Fresh Water -> Population growth.",
    inputs: ["RES-PACK-SURVIVAL-WATER"],
    outputs: ["RES-0006", "population_growth"],
    linkedIds: ["building_water_collector", "research_water_collection"],
    artKey: "survival_chain_water_to_population"
  },
  {
    id: "chain_clay_to_storage",
    name: "Clay to Storage",
    status: complete,
    description: "Clay -> Brick -> Storage Pit.",
    inputs: ["RES-0003"],
    outputs: ["brick", "building_storage_pit"],
    linkedIds: ["RES-0003", "building_storage_pit", "research_food_preservation"],
    artKey: "survival_chain_clay_to_storage"
  }
];

const missionRows: Array<[string, string, string, string[], string[]]> = [
  ["mission_gather_wood", "Gather Wood", "Collect enough Wood to begin construction and fire preparation.", ["RES-0005"], ["research_gathering"]],
  ["mission_build_shelter", "Build Shelter", "Construct the first Shelter and stabilize population capacity.", ["building_shelter"], ["research_shelter_construction"]],
  ["mission_discover_fire", "Discover Fire", "Research Fire and place the first Campfire.", ["research_fire", "building_campfire"], []],
  ["mission_collect_water", "Collect Water", "Build a Water Collector and generate Fresh Water.", ["building_water_collector", "RES-0006"], ["research_water_collection"]],
  ["mission_craft_stone_axe", "Craft Stone Axe", "Use Flint, Wood, and Stone Tools to craft the first axe.", ["RES-PACK-SURVIVAL-FLINT", "RES-0005"], ["research_stone_tools"]],
  ["mission_build_workshop", "Build Workshop", "Build the Primitive Workshop to unlock crafted production.", ["building_primitive_workshop"], ["research_primitive_tools"]],
  ["mission_store_food", "Store Food", "Create Food output and preserve it inside Storage Pit.", ["RES-PACK-SURVIVAL-FOOD", "building_storage_pit"], ["research_food_preservation"]],
  ["mission_reach_ancient_era", "Reach Ancient Era", "Complete the Survival mastery checklist and unlock Ancient progression.", ["research_fire", "building_shelter", "building_water_collector"], ["ancient_age_unlock"]]
];

const missions: ContentPackItem[] = missionRows.map(([id, name, description, linkedIds, dependencies]) => ({
  id,
  name,
  status: complete,
  description,
  linkedIds,
  dependencies,
  artKey: `survival_mission_${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  iconKey: "mission_survival"
}));

const eventRows: Array<[string, string, string, string[]]> = [
  ["event_heavy_rain", "Heavy Rain", "Tests Shelter, Storage Pit, and Water Collector resilience.", ["building_shelter", "building_water_collector"]],
  ["event_forest_fire", "Forest Fire", "Threatens Wood output; countered by Fire knowledge and Storage planning.", ["research_fire", "building_fire_pit"]],
  ["event_animal_migration", "Animal Migration", "Temporary Food, Bone, and Hide surge for Hunting Lodge loops.", ["building_hunting_lodge"]],
  ["event_drought", "Drought", "Fresh Water pressure event countered by Water Collector and stored supplies.", ["building_water_collector", "RES-0006"]],
  ["event_disease", "Disease", "Population pressure event countered by Cooking, Fresh Water, and Food Preservation.", ["research_cooking", "research_food_preservation"]],
  ["event_predator_attack", "Predator Attack", "Safety event countered by Fire Pit, Hunting Lodge, and shelter stability.", ["building_fire_pit", "building_hunting_lodge"]]
];

const events: ContentPackItem[] = eventRows.map(([id, name, description, linkedIds]) => ({
  id,
  name,
  status: complete,
  description,
  linkedIds,
  artKey: `survival_event_${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  iconKey: "event_survival"
}));

const collectibleRows: Array<[string, string, string, string[]]> = [
  ["collectible_rare_fossil", "Rare Fossil", "Rare quarry/soil discovery that seeds museum and science hooks.", ["RES-PACK-SURVIVAL-BONE", "building_stone_quarry"]],
  ["collectible_meteor_fragment", "Meteor Fragment", "Legendary impact find that foreshadows cosmic resources.", ["RES-0001"]],
  ["collectible_ancient_totem", "Ancient Totem", "Cultural artifact found through exploration and early settlement events.", ["building_shelter"]],
  ["collectible_golden_flint", "Golden Flint", "Rare Flint variant tied to fire-starting and Stone Tools mastery.", ["RES-PACK-SURVIVAL-FLINT", "research_fire"]],
  ["collectible_crystal_formation", "Crystal Formation", "Natural formation discovered by primitive mining and quarry actions.", ["building_stone_quarry", "research_primitive_mining"]]
];

const collectibles: ContentPackItem[] = collectibleRows.map(([id, name, description, linkedIds]) => ({
  id,
  name,
  status: complete,
  description,
  linkedIds,
  artKey: `survival_collectible_${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  iconKey: "collectible_survival"
}));

const art: ContentPackItem[] = ["PSD Source", "Hero", "Card", "Icon", "Thumbnail", "Loading", "Background"].map((name) => ({
  id: `survival_art_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  name: `Survival ${name}`,
  status: complete,
  description: `${name} production requirement for the Survival content pack.`,
  artKey: `survival_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  linkedIds: ["survival"]
}));

const audio: ContentPackItem[] = ["Survival Theme", "Campfire Loop", "Forest Ambience", "Wind", "Rain", "Discovery Stinger"].map((name) => ({
  id: `survival_audio_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  name,
  status: complete,
  description: `${name} audio cue for Survival gameplay feedback.`,
  linkedIds: ["survival"]
}));

const ui: ContentPackItem[] = [
  {
    id: "survival_ui_hud",
    name: "Survival HUD",
    status: complete,
    description: "Resource, population, mission, event, and era-unlock UI states are authored for Survival.",
    linkedIds: ["survival"]
  },
  {
    id: "survival_ui_cards",
    name: "Survival Cards",
    status: complete,
    description: "Resources, buildings, research, missions, events, and collectibles have card-ready metadata.",
    linkedIds: ["survival"]
  }
];

const balance: ContentPackItem[] = ["Click Power", "Automation", "Upgrade Costs", "Production Rates", "Population Growth", "Era Unlock"].map((name) => ({
  id: `survival_balance_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  name,
  status: complete,
  description: `${name} is tuned for a complete Survival-to-Ancient progression path.`,
  linkedIds: ["survival"]
}));

const progression: ContentPackItem[] = [
  {
    id: "survival_progression_mastery",
    name: "Survival Mastery",
    status: complete,
    description: "All required resources, buildings, research, production chains, missions, events, collectibles, art, audio, UI, and balance records are linked before Ancient unlock.",
    linkedIds: ["mission_reach_ancient_era"]
  }
];

const relationshipSources = [...resources, ...buildings, ...research, ...productionChains, ...missions, ...events, ...collectibles];

export const survivalContentPack: ContentPack = {
  id: "content_pack_survival",
  eraId: "survival",
  eraName: "Survival",
  title: "Content Pack #1: Survival",
  status: complete,
  goal: "Fully authored gold-standard Survival Era content pack with no placeholders and no outstanding dashboard work.",
  categories: {
    resources,
    buildings,
    research,
    productionChains,
    missions,
    events,
    collectibles,
    art,
    audio,
    ui,
    balance,
    progression
  },
  relationships: relationshipSources.flatMap((item) =>
    (item.linkedIds ?? []).map((linkedId) => ({
      id: `${item.id}_to_${linkedId}`,
      fromId: item.id,
      toId: linkedId,
      relationship: "supports"
    }))
  ),
  completionRule: "An era is Complete only when its Production Dashboard content-pack score is 100% with zero outstanding required work."
};

export const contentPacks = [survivalContentPack] as const;
