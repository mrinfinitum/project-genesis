import { appendTimelineEvent, upsertDiscoveryJournalEntry } from "@/lib/explorer/discovery-log";
import { hashText, type FactionRecord } from "@/lib/factions/procedural";

export const colonyStatuses = ["planned", "founding", "active", "growing", "struggling", "abandoned"] as const;
export const colonyFocusOptions = ["Balanced", "Growth", "Mining", "Research", "Trade", "Defense"] as const;
export const colonyConditionValues = ["surplus", "balanced", "shortage", "critical"] as const;

export type ColonyStatus = (typeof colonyStatuses)[number];
export type ColonyFocus = (typeof colonyFocusOptions)[number];
export type ColonyCondition = (typeof colonyConditionValues)[number];
export type ConstructionStatus = "locked" | "available" | "planned" | "building" | "complete" | "paused";

export type ColonyLevelDefinition = {
  level: number;
  name: string;
  minimumPopulation: number;
  requiredInfrastructure: number;
  buildingSlots: number;
  productionModifier: number;
  defenseModifier: number;
  tradeModifier: number;
  researchModifier: number;
};

export type ColonyBuilding = {
  id: string;
  name: string;
  category: string;
  level: number;
  colonyId: string;
  constructionStatus: ConstructionStatus;
  constructionProgress: number;
  inputResourceIds: string[];
  outputResourceIds: string[];
  modifiers: Record<string, number>;
  requiredResearchIds: string[];
  description: string;
};

export type ColonyHistoryEvent = {
  id: string;
  eventType: "colony_founded" | "colony_renamed" | "building_started" | "building_completed" | "colony_level_increased" | "colony_shortage" | "colony_abandoned" | "colony_focus_changed" | "development_paused";
  title: string;
  description: string;
  timestamp: string;
};

export type ColonyRecord = {
  id: string;
  name: string;
  planetId: string;
  planetName: string;
  galaxyId: string;
  sectorId: string;
  starSystemId: string;
  ownerType: string;
  ownerFactionId?: string;
  ownerPlayerId?: string;
  population: number;
  populationCapacity: number;
  populationGrowthRate: number;
  colonyLevel: number;
  experience: number;
  experienceToNextLevel: number;
  morale: number;
  stability: number;
  habitabilityRating: number;
  productionRating: number;
  researchRating: number;
  defenseRating: number;
  tradeRating: number;
  infrastructureRating: number;
  energyProduced: number;
  energyConsumed: number;
  foodProduced: number;
  foodConsumed: number;
  housingCapacity: number;
  materialsProduced: number;
  materialsConsumed: number;
  resourceOutputIds: string[];
  resourceOutputRates: Record<string, number>;
  buildingIds: string[];
  activeProjectIds: string[];
  buildings: ColonyBuilding[];
  focus: ColonyFocus;
  foodStatus: ColonyCondition;
  energyStatus: ColonyCondition;
  housingStatus: ColonyCondition;
  materialsStatus: ColonyCondition;
  developmentPaused: boolean;
  foundedAt: string;
  lastUpdatedAt: string;
  status: ColonyStatus;
  description: string;
  history: ColonyHistoryEvent[];
};

export type ColonyContext = {
  planetId: string;
  planetName: string;
  galaxyId: string;
  sectorId: string;
  starSystemId: string;
  ownerType?: string;
  ownerFactionId?: string;
  ownerPlayerId?: string;
  planetClass?: string | null;
  biome?: string | null;
  rarity?: string | null;
  gravity?: string | null;
  atmosphere?: string | null;
  temperature?: string | null;
  resources?: string[];
  resourceIds?: string[];
  hazards?: string[];
  colonizable?: boolean;
  landable?: boolean;
  faction?: FactionRecord;
  completedResearchIds?: string[];
  foundedAt?: string;
};

export const COLONY_STORAGE_KEY = "project-genesis-colonies";
export const COLONIES_UPDATED_EVENT = "project-genesis-colonies-updated";

export const colonyLevelDefinitions: ColonyLevelDefinition[] = [
  { level: 1, name: "Outpost", minimumPopulation: 0, requiredInfrastructure: 0, buildingSlots: 3, productionModifier: 1, defenseModifier: 1, tradeModifier: 1, researchModifier: 1 },
  { level: 2, name: "Settlement", minimumPopulation: 1200, requiredInfrastructure: 25, buildingSlots: 5, productionModifier: 1.1, defenseModifier: 1.05, tradeModifier: 1.05, researchModifier: 1.05 },
  { level: 3, name: "Colony", minimumPopulation: 5000, requiredInfrastructure: 45, buildingSlots: 7, productionModifier: 1.25, defenseModifier: 1.15, tradeModifier: 1.15, researchModifier: 1.12 },
  { level: 4, name: "Developed Colony", minimumPopulation: 18000, requiredInfrastructure: 65, buildingSlots: 9, productionModifier: 1.45, defenseModifier: 1.28, tradeModifier: 1.3, researchModifier: 1.25 },
  { level: 5, name: "Planetary Capital", minimumPopulation: 65000, requiredInfrastructure: 82, buildingSlots: 12, productionModifier: 1.75, defenseModifier: 1.5, tradeModifier: 1.55, researchModifier: 1.45 },
  { level: 6, name: "Core World", minimumPopulation: 220000, requiredInfrastructure: 94, buildingSlots: 16, productionModifier: 2.15, defenseModifier: 1.85, tradeModifier: 1.9, researchModifier: 1.75 }
];

export const colonyFocusDefinitions: Record<ColonyFocus, Record<string, number>> = {
  Balanced: { populationGrowthRate: 1, productionRating: 1, researchRating: 1, defenseRating: 1, tradeRating: 1 },
  Growth: { populationGrowthRate: 1.35, foodProduced: 1.15, housingCapacity: 1.1, productionRating: 0.92, defenseRating: 0.95 },
  Mining: { productionRating: 1.35, materialsProduced: 1.3, tradeRating: 1.08, researchRating: 0.9 },
  Research: { researchRating: 1.4, energyConsumed: 1.12, productionRating: 0.92 },
  Trade: { tradeRating: 1.45, productionRating: 1.08, defenseRating: 0.92 },
  Defense: { defenseRating: 1.45, stability: 1.08, tradeRating: 0.92, productionRating: 0.95 }
};

export const colonyBuildingTemplates = [
  {
    id: "building_habitat",
    name: "Habitat",
    category: "Housing",
    inputResourceIds: ["resource_energy", "resource_materials"],
    outputResourceIds: ["colony_housing"],
    modifiers: { housingCapacity: 1800, morale: 3, infrastructureRating: 5 },
    requiredResearchIds: [],
    description: "Adds protected living space and raises population capacity."
  },
  {
    id: "building_farm",
    name: "Farm",
    category: "Food",
    inputResourceIds: ["resource_energy", "resource_water"],
    outputResourceIds: ["colony_food"],
    modifiers: { foodProduced: 180, morale: 2, infrastructureRating: 4 },
    requiredResearchIds: ["resource_scan"],
    description: "Produces food from local biomass, hydroponics, or controlled agriculture."
  },
  {
    id: "building_power_plant",
    name: "Power Plant",
    category: "Energy",
    inputResourceIds: ["resource_materials"],
    outputResourceIds: ["colony_energy"],
    modifiers: { energyProduced: 240, productionRating: 4, infrastructureRating: 6 },
    requiredResearchIds: [],
    description: "Provides reliable energy for settlement growth and industrial expansion."
  },
  {
    id: "building_mine",
    name: "Mine",
    category: "Production",
    inputResourceIds: ["colony_energy"],
    outputResourceIds: ["resource_materials"],
    modifiers: { materialsProduced: 160, productionRating: 8, tradeRating: 3, infrastructureRating: 5 },
    requiredResearchIds: ["resource_scan"],
    description: "Extracts local resources and feeds colony construction projects."
  },
  {
    id: "building_research_lab",
    name: "Research Lab",
    category: "Research",
    inputResourceIds: ["colony_energy"],
    outputResourceIds: ["colony_research"],
    modifiers: { researchRating: 12, energyConsumed: 35, infrastructureRating: 5 },
    requiredResearchIds: ["planet_scan"],
    description: "Turns discoveries and local conditions into research output."
  },
  {
    id: "building_trade_port",
    name: "Trade Port",
    category: "Trade",
    inputResourceIds: ["colony_energy"],
    outputResourceIds: ["colony_trade"],
    modifiers: { tradeRating: 12, housingCapacity: 400, infrastructureRating: 6 },
    requiredResearchIds: ["system_scan"],
    description: "Connects the colony to orbital commerce and route logistics."
  },
  {
    id: "building_defense_grid",
    name: "Defense Grid",
    category: "Defense",
    inputResourceIds: ["colony_energy", "resource_materials"],
    outputResourceIds: ["colony_security"],
    modifiers: { defenseRating: 14, stability: 5, energyConsumed: 40, infrastructureRating: 7 },
    requiredResearchIds: ["claim_planet"],
    description: "Adds perimeter security, orbital alerts, and emergency shelters."
  },
  {
    id: "building_storage_facility",
    name: "Storage Facility",
    category: "Logistics",
    inputResourceIds: ["resource_materials"],
    outputResourceIds: ["colony_storage"],
    modifiers: { materialsProduced: 35, productionRating: 3, tradeRating: 5, infrastructureRating: 5 },
    requiredResearchIds: [],
    description: "Improves reserves, logistics, and resource throughput."
  }
] as const;

export const colonySchema = {
  populationCapacity: "number",
  populationGrowthRate: "number",
  experience: "number",
  experienceToNextLevel: "number",
  habitabilityRating: "number",
  infrastructureRating: "number",
  energyProduced: "number",
  energyConsumed: "number",
  foodProduced: "number",
  foodConsumed: "number",
  housingCapacity: "number",
  materialsProduced: "number",
  materialsConsumed: "number",
  resourceOutputRates: "Record<string, number>",
  buildingIds: "string[]",
  activeProjectIds: "string[]",
  buildings: "ColonyBuilding[]",
  focus: "Balanced | Growth | Mining | Research | Trade | Defense",
  conditions: "foodStatus | energyStatus | housingStatus | materialsStatus"
};

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function clamp(value: number, min = 1, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function stableTimestamp(value?: string) {
  return value ?? new Date().toISOString();
}

function resourceOutputIds(context: ColonyContext) {
  const ids = context.resourceIds?.length ? context.resourceIds : (context.resources ?? []).map((resource) => (resource.startsWith("resource_") ? resource : `resource_${slug(resource)}`));
  return [...new Set(ids.filter(Boolean))].slice(0, 6);
}

function habitabilityScore(context: ColonyContext) {
  const text = `${context.planetClass ?? ""} ${context.biome ?? ""} ${context.atmosphere ?? ""} ${context.temperature ?? ""} ${context.gravity ?? ""}`.toLowerCase();
  let score = context.colonizable || context.landable ? 62 : 30;
  if (/earth|terran|temperate|ocean|garden|forest|wetland|breathable/i.test(text)) score += 24;
  if (/standard|normal|mild/i.test(text)) score += 8;
  if (/ice|desert|tundra|barren|dead|thin|low gravity|high gravity/i.test(text)) score -= 10;
  if (/lava|void|toxic|gas|storm|radiation|extreme|crushing/i.test(text)) score -= 26;
  return clamp(score);
}

function rarityScore(rarity?: string | null) {
  if (!rarity) return 42;
  if (/genesis|mythic|relic|legendary/i.test(rarity)) return 92;
  if (/epic|rare/i.test(rarity)) return 74;
  if (/uncommon/i.test(rarity)) return 56;
  return 42;
}

function hazardPenalty(context: Pick<ColonyContext, "planetClass" | "hazards">) {
  const hazardText = [context.planetClass, ...(context.hazards ?? [])].join(" ").toLowerCase();
  let penalty = (context.hazards?.length ?? 0) * 5;
  if (/lava|void|toxic|radiation|storm|hazard|unstable/i.test(hazardText)) penalty += 22;
  return penalty;
}

function resourceScore(context: ColonyContext) {
  return clamp(((context.resourceIds?.length || context.resources?.length || 1) * 14) + rarityScore(context.rarity) / 3);
}

function defenseScore(context: ColonyContext) {
  const faction = context.faction;
  let score = 38 + Math.floor(rarityScore(context.rarity) / 8);
  if (faction?.militaryStrength && /fleet|fortified|overwhelming/i.test(faction.militaryStrength)) score += 28;
  if (faction?.disposition && /hostile|competitive|pirate/i.test(`${faction.disposition} ${faction.type}`)) score += 12;
  if (faction?.disposition && /friendly|protective/i.test(faction.disposition)) score += 8;
  return clamp(score);
}

function condition(produced: number, consumed: number, capacityMode = false): ColonyCondition {
  if (capacityMode) {
    if (produced <= consumed * 0.85) return "critical";
    if (produced <= consumed) return "shortage";
    if (produced >= consumed * 1.3) return "surplus";
    return "balanced";
  }
  if (consumed <= 0 || produced >= consumed * 1.25) return "surplus";
  if (produced >= consumed) return "balanced";
  if (produced >= consumed * 0.75) return "shortage";
  return "critical";
}

function conditionPenalty(...values: ColonyCondition[]) {
  return values.reduce((sum, value) => sum + (value === "critical" ? 18 : value === "shortage" ? 8 : value === "surplus" ? -3 : 0), 0);
}

function focusMultiplier(focus: ColonyFocus, key: string) {
  return colonyFocusDefinitions[focus][key] ?? 1;
}

function levelDefinition(level: number) {
  return colonyLevelDefinitions.find((definition) => definition.level === level) ?? colonyLevelDefinitions[0];
}

function nextLevelDefinition(level: number) {
  return colonyLevelDefinitions.find((definition) => definition.level === level + 1) ?? null;
}

function createHistoryEvent(colonyId: string, eventType: ColonyHistoryEvent["eventType"], title: string, description: string, timestamp = new Date().toISOString()): ColonyHistoryEvent {
  return {
    id: `history-${slug(`${colonyId}-${eventType}-${timestamp}`)}`,
    eventType,
    title,
    description,
    timestamp
  };
}

function starterBuildings(colonyId: string, habitability: number, completedResearchIds: string[] = []) {
  const starting = ["building_habitat", "building_power_plant", habitability >= 50 ? "building_farm" : "building_storage_facility"];
  return starting.map((templateId, index) => createBuildingRecord(colonyId, templateId, completedResearchIds, index < 2 ? "complete" : "available", `starter-${index}`));
}

export function createBuildingRecord(colonyId: string, templateId: string, completedResearchIds: string[] = [], status?: ConstructionStatus, instanceKey = "primary"): ColonyBuilding {
  const template = colonyBuildingTemplates.find((building) => building.id === templateId) ?? colonyBuildingTemplates[0];
  const unlocked = template.requiredResearchIds.every((researchId) => completedResearchIds.includes(researchId));
  const constructionStatus = status ?? (unlocked ? "planned" : "locked");
  return {
    id: `${colonyId}-${template.id}-${slug(instanceKey)}`,
    name: template.name,
    category: template.category,
    level: 1,
    colonyId,
    constructionStatus,
    constructionProgress: constructionStatus === "complete" ? 100 : 0,
    inputResourceIds: [...template.inputResourceIds],
    outputResourceIds: [...template.outputResourceIds],
    modifiers: { ...template.modifiers },
    requiredResearchIds: [...template.requiredResearchIds],
    description: template.description
  };
}

function applyBuildingModifiers(colony: ColonyRecord) {
  const completeBuildings = colony.buildings.filter((building) => building.constructionStatus === "complete");
  const modifier = completeBuildings.reduce<Record<string, number>>((sum, building) => {
    for (const [key, value] of Object.entries(building.modifiers)) {
      sum[key] = (sum[key] ?? 0) + value * Math.max(1, building.level);
    }
    return sum;
  }, {});
  return modifier;
}

function calculateGrowthRate(colony: ColonyRecord) {
  const food = condition(colony.foodProduced, colony.foodConsumed);
  const energy = condition(colony.energyProduced, colony.energyConsumed);
  const housing = condition(colony.housingCapacity, colony.population, true);
  const materials = condition(colony.materialsProduced, colony.materialsConsumed);
  const penalties = conditionPenalty(food, energy, housing, materials);
  const moraleFactor = colony.morale / 100;
  const stabilityFactor = colony.stability / 100;
  const habitabilityFactor = colony.habitabilityRating / 100;
  const focusFactor = focusMultiplier(colony.focus, "populationGrowthRate");
  const base = (0.006 + habitabilityFactor * 0.018) * moraleFactor * stabilityFactor * focusFactor;
  if (colony.status === "abandoned" || colony.developmentPaused) return 0;
  return Number(Math.max(-0.02, base - penalties / 4200).toFixed(4));
}

function recalculateColony(colony: ColonyRecord): ColonyRecord {
  const modifiers = applyBuildingModifiers(colony);
  const level = levelDefinition(colony.colonyLevel);
  const baseFoodProduced = Math.round((colony.habitabilityRating * 3.2 + (modifiers.foodProduced ?? 0)) * focusMultiplier(colony.focus, "foodProduced"));
  const baseEnergyProduced = Math.round((150 + colony.infrastructureRating * 2 + (modifiers.energyProduced ?? 0)) * focusMultiplier(colony.focus, "energyProduced"));
  const baseHousing = Math.round((colony.populationCapacity + (modifiers.housingCapacity ?? 0)) * focusMultiplier(colony.focus, "housingCapacity"));
  const foodConsumed = Math.ceil(colony.population / 100);
  const energyConsumed = Math.ceil(colony.population / 135 + (modifiers.energyConsumed ?? 0)) * focusMultiplier(colony.focus, "energyConsumed");
  const materialsProduced = Math.round((colony.resourceOutputIds.length * 24 + (modifiers.materialsProduced ?? 0)) * focusMultiplier(colony.focus, "materialsProduced"));
  const materialsConsumed = Math.ceil(colony.population / 240);
  const foodStatus = condition(baseFoodProduced, foodConsumed);
  const energyStatus = condition(baseEnergyProduced, energyConsumed);
  const housingStatus = condition(baseHousing, colony.population, true);
  const materialsStatus = condition(materialsProduced, materialsConsumed);
  const penalties = conditionPenalty(foodStatus, energyStatus, housingStatus, materialsStatus);
  const morale = clamp((colony.morale + (modifiers.morale ?? 0)) - Math.max(0, penalties / 4), 1, 100);
  const stability = clamp((colony.stability + (modifiers.stability ?? 0)) - Math.max(0, penalties / 5), 1, 100);
  const infrastructureRating = clamp(colony.infrastructureRating + (modifiers.infrastructureRating ?? 0), 1, 100);
  const productionRating = clamp((colony.productionRating + (modifiers.productionRating ?? 0)) * level.productionModifier * focusMultiplier(colony.focus, "productionRating") - penalties / 5);
  const researchRating = clamp((colony.researchRating + (modifiers.researchRating ?? 0)) * level.researchModifier * focusMultiplier(colony.focus, "researchRating") - penalties / 8);
  const defenseRating = clamp((colony.defenseRating + (modifiers.defenseRating ?? 0)) * level.defenseModifier * focusMultiplier(colony.focus, "defenseRating"));
  const tradeRating = clamp((colony.tradeRating + (modifiers.tradeRating ?? 0)) * level.tradeModifier * focusMultiplier(colony.focus, "tradeRating") - penalties / 7);
  const resourceOutputRates = Object.fromEntries(colony.resourceOutputIds.map((resourceId, index) => [resourceId, Math.max(1, Math.round((productionRating / 18) * (index === 0 ? 1.3 : 1)))]));
  const populationGrowthRate = calculateGrowthRate({
    ...colony,
    foodProduced: baseFoodProduced,
    foodConsumed,
    energyProduced: baseEnergyProduced,
    energyConsumed: Math.round(energyConsumed),
    housingCapacity: baseHousing,
    materialsProduced,
    materialsConsumed,
    foodStatus,
    energyStatus,
    housingStatus,
    materialsStatus,
    morale,
    stability
  });

  return {
    ...colony,
    populationCapacity: baseHousing,
    housingCapacity: baseHousing,
    foodProduced: baseFoodProduced,
    foodConsumed,
    energyProduced: baseEnergyProduced,
    energyConsumed: Math.round(energyConsumed),
    materialsProduced,
    materialsConsumed,
    foodStatus,
    energyStatus,
    housingStatus,
    materialsStatus,
    morale,
    stability,
    infrastructureRating,
    productionRating,
    researchRating,
    defenseRating,
    tradeRating,
    resourceOutputRates,
    populationGrowthRate,
    buildingIds: colony.buildings.map((building) => building.id),
    activeProjectIds: colony.buildings.filter((building) => building.constructionStatus === "building" || building.constructionStatus === "planned").map((building) => building.id)
  };
}

export function advanceColonyGrowth(colony: ColonyRecord, now = new Date()): ColonyRecord {
  const normalized = normalizeColony(colony);
  if (normalized.status === "abandoned") return normalized;
  const lastUpdated = Date.parse(normalized.lastUpdatedAt);
  const elapsedMs = Number.isFinite(lastUpdated) ? Math.max(0, now.getTime() - lastUpdated) : 0;
  const elapsedDays = elapsedMs / 86400000;
  if (elapsedDays < 0.01) return recalculateColony(normalized);
  const seededVariance = ((hashText(`${normalized.id}:${Math.floor(elapsedDays)}:growth`) % 9) - 4) / 1000;
  const growthRate = normalized.populationGrowthRate + seededVariance;
  const populationDelta = Math.round(normalized.population * growthRate * elapsedDays);
  const population = Math.round(clampNumber(normalized.population + populationDelta, 0, normalized.populationCapacity));
  const experience = normalized.experience + Math.max(1, Math.round(elapsedDays * (normalized.productionRating + normalized.researchRating + normalized.tradeRating) / 3));
  const next = recalculateColony({ ...normalized, population, experience, lastUpdatedAt: now.toISOString() });
  return maybeLevelUp(next);
}

export function maybeLevelUp(colony: ColonyRecord): ColonyRecord {
  const nextDefinition = nextLevelDefinition(colony.colonyLevel);
  if (!nextDefinition) return colony;
  const canLevel = colony.population >= nextDefinition.minimumPopulation && colony.infrastructureRating >= nextDefinition.requiredInfrastructure && colony.experience >= colony.experienceToNextLevel;
  if (!canLevel) return colony;
  const next: ColonyRecord = {
    ...colony,
    colonyLevel: nextDefinition.level,
    experience: colony.experience - colony.experienceToNextLevel,
    experienceToNextLevel: Math.round(colony.experienceToNextLevel * 1.65),
    history: [
      createHistoryEvent(colony.id, "colony_level_increased", `${colony.name} Reached ${nextDefinition.name}`, `${colony.name} advanced to level ${nextDefinition.level}: ${nextDefinition.name}.`),
      ...colony.history
    ]
  };
  return recalculateColony(next);
}

export function createColonyRecord(context: ColonyContext): ColonyRecord {
  const seed = `${context.starSystemId}:${context.planetId}:colony`;
  const habitability = habitabilityScore(context);
  const resources = resourceScore(context);
  const rarity = rarityScore(context.rarity);
  const hazards = hazardPenalty(context);
  const foundedAt = stableTimestamp(context.foundedAt);
  const status: ColonyStatus = habitability >= 70 ? "growing" : hazards >= 30 ? "struggling" : "active";
  const population = Math.max(120, Math.round((habitability * 175 + (hashText(seed) % 2400)) / 10) * 10);
  const colonyLevel = habitability >= 80 || rarity >= 80 ? 2 : 1;
  const name = `${context.planetName} Colony`;
  const outputs = resourceOutputIds(context);
  const populationCapacity = Math.max(population + 600, Math.round(population * 1.8));
  const buildings = starterBuildings(`colony-${slug(`${context.planetId}-${name}`)}`, habitability, context.completedResearchIds);
  const base: ColonyRecord = {
    id: `colony-${slug(`${context.planetId}-${name}`)}`,
    name,
    planetId: context.planetId,
    planetName: context.planetName,
    galaxyId: context.galaxyId,
    sectorId: context.sectorId,
    starSystemId: context.starSystemId,
    ownerType: context.ownerType ?? "player",
    ownerFactionId: context.ownerFactionId ?? context.faction?.id,
    ownerPlayerId: context.ownerPlayerId ?? "studio-explorer",
    population,
    populationCapacity,
    populationGrowthRate: 0,
    colonyLevel,
    experience: Math.round(population / 5),
    experienceToNextLevel: colonyLevel * 1200,
    morale: clamp(54 + Math.floor(habitability / 4) - Math.floor(hazards / 5)),
    stability: clamp(70 + Math.floor(habitability / 5) - hazards),
    habitabilityRating: habitability,
    productionRating: resources,
    researchRating: clamp(32 + Math.floor(rarity / 2) + (context.resourceIds?.length ?? 0) * 3),
    defenseRating: defenseScore(context),
    tradeRating: clamp(30 + Math.floor(rarity / 2) + (context.resources?.length ?? 0) * 5),
    infrastructureRating: clamp(18 + buildings.length * 6 + Math.floor(habitability / 8)),
    energyProduced: 0,
    energyConsumed: 0,
    foodProduced: 0,
    foodConsumed: 0,
    housingCapacity: populationCapacity,
    materialsProduced: 0,
    materialsConsumed: 0,
    resourceOutputIds: outputs,
    resourceOutputRates: {},
    buildingIds: buildings.map((building) => building.id),
    activeProjectIds: [],
    buildings,
    focus: "Balanced",
    foodStatus: "balanced",
    energyStatus: "balanced",
    housingStatus: "balanced",
    materialsStatus: "balanced",
    developmentPaused: false,
    foundedAt,
    lastUpdatedAt: foundedAt,
    status,
    description: `${name} is a ${status} player settlement founded on ${context.planetName}. Habitability, resources, hazards, and local faction presence determine its starting ratings.`,
    history: [createHistoryEvent(`colony-${slug(`${context.planetId}-${name}`)}`, "colony_founded", `${name} Founded`, `${name} was founded on ${context.planetName}.`, foundedAt)]
  };
  return recalculateColony(base);
}

export function normalizeColony(input: Partial<ColonyRecord> & Pick<ColonyRecord, "id" | "name" | "planetId" | "planetName" | "galaxyId" | "sectorId" | "starSystemId">): ColonyRecord {
  const foundedAt = input.foundedAt ?? "derived";
  const fallback = createColonyRecord({
    planetId: input.planetId,
    planetName: input.planetName,
    galaxyId: input.galaxyId,
    sectorId: input.sectorId,
    starSystemId: input.starSystemId,
    resources: input.resourceOutputIds,
    resourceIds: input.resourceOutputIds,
    foundedAt
  });
  return recalculateColony({
    ...fallback,
    ...input,
    ownerType: input.ownerType ?? fallback.ownerType,
    populationCapacity: input.populationCapacity ?? input.housingCapacity ?? fallback.populationCapacity,
    populationGrowthRate: input.populationGrowthRate ?? fallback.populationGrowthRate,
    experience: input.experience ?? fallback.experience,
    experienceToNextLevel: input.experienceToNextLevel ?? fallback.experienceToNextLevel,
    habitabilityRating: input.habitabilityRating ?? fallback.habitabilityRating,
    infrastructureRating: input.infrastructureRating ?? fallback.infrastructureRating,
    energyProduced: input.energyProduced ?? fallback.energyProduced,
    energyConsumed: input.energyConsumed ?? fallback.energyConsumed,
    foodProduced: input.foodProduced ?? fallback.foodProduced,
    foodConsumed: input.foodConsumed ?? fallback.foodConsumed,
    housingCapacity: input.housingCapacity ?? input.populationCapacity ?? fallback.housingCapacity,
    materialsProduced: input.materialsProduced ?? fallback.materialsProduced,
    materialsConsumed: input.materialsConsumed ?? fallback.materialsConsumed,
    resourceOutputRates: input.resourceOutputRates ?? fallback.resourceOutputRates,
    buildingIds: input.buildingIds ?? fallback.buildingIds,
    activeProjectIds: input.activeProjectIds ?? fallback.activeProjectIds,
    buildings: input.buildings?.length ? input.buildings : fallback.buildings,
    focus: input.focus ?? "Balanced",
    foodStatus: input.foodStatus ?? fallback.foodStatus,
    energyStatus: input.energyStatus ?? fallback.energyStatus,
    housingStatus: input.housingStatus ?? fallback.housingStatus,
    materialsStatus: input.materialsStatus ?? fallback.materialsStatus,
    developmentPaused: input.developmentPaused ?? false,
    lastUpdatedAt: input.lastUpdatedAt ?? foundedAt,
    history: input.history?.length ? input.history : fallback.history
  });
}

export function generateFallbackColonies() {
  return [
    createColonyRecord({
      planetId: "planet-earth",
      planetName: "Earth",
      galaxyId: "galaxy-milky-way",
      sectorId: "sector-local-bubble",
      starSystemId: "system-sol",
      planetClass: "Terran",
      biome: "Temperate",
      gravity: "Standard",
      atmosphere: "Breathable",
      temperature: "Mild",
      rarity: "Starting",
      resources: ["Water", "Iron", "Copper", "Biomass"],
      resourceIds: ["resource_water", "resource_iron", "resource_copper", "resource_biomass"],
      colonizable: true,
      landable: true,
      foundedAt: "derived"
    })
  ];
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readRawColonies() {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COLONY_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as ColonyRecord[]) : [];
  } catch {
    return [];
  }
}

function writeColonies(colonies: ColonyRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(COLONY_STORAGE_KEY, JSON.stringify(colonies));
  window.dispatchEvent(new CustomEvent(COLONIES_UPDATED_EVENT));
}

function syncJournal(colony: ColonyRecord) {
  upsertDiscoveryJournalEntry({
    objectId: colony.id,
    objectType: "colony",
    objectName: colony.name,
    generatedName: `${colony.planetName} Colony`,
    displayName: colony.name,
    discoveryState: colony.status === "abandoned" ? "explored" : "colonized",
    discoveredAt: colony.foundedAt,
    discoveredBy: colony.ownerPlayerId ?? "Studio Explorer",
    discoveryPoints: Math.max(400, colony.colonyLevel * 250 + Math.round(colony.population / 80)),
    galaxyId: colony.galaxyId,
    sectorId: colony.sectorId,
    starSystemId: colony.starSystemId,
    rarity: levelDefinition(colony.colonyLevel).name,
    tags: ["Colony", colony.status, colony.focus, levelDefinition(colony.colonyLevel).name],
    notes: colony.description
  });
}

function syncTimeline(colony: ColonyRecord, event: ColonyHistoryEvent) {
  appendTimelineEvent({
    eventType: event.eventType,
    title: event.title,
    description: event.description,
    timestamp: event.timestamp,
    galaxyId: colony.galaxyId,
    sectorId: colony.sectorId,
    starSystemId: colony.starSystemId,
    planetId: colony.planetId,
    relatedObjectId: colony.id,
    relatedObjectType: "colony",
    importance: event.eventType === "colony_abandoned" || event.eventType === "colony_level_increased" ? "high" : "medium"
  });
}

export function readDiscoveredColonies() {
  return readRawColonies().map((colony) => advanceColonyGrowth(normalizeColony(colony)));
}

export function upsertDiscoveredColony(colony: ColonyRecord) {
  const normalized = advanceColonyGrowth(normalizeColony(colony));
  if (!canUseStorage()) return normalized;
  const current = readDiscoveredColonies();
  const next = current.some((row) => row.id === normalized.id) ? current.map((row) => (row.id === normalized.id ? normalized : row)) : [normalized, ...current];
  writeColonies(next);
  syncJournal(normalized);
  const foundedEvent = normalized.history.find((event) => event.eventType === "colony_founded");
  if (foundedEvent && !current.some((row) => row.id === normalized.id)) syncTimeline(normalized, foundedEvent);
  return normalized;
}

export function updateStoredColony(colonyId: string, updater: (colony: ColonyRecord) => ColonyRecord, timelineEvent?: ColonyHistoryEvent) {
  const current = readDiscoveredColonies();
  const generatedEvents: ColonyHistoryEvent[] = [];
  const next = current.map((colony) => {
    if (colony.id !== colonyId) return colony;
    const existingEventIds = new Set(colony.history.map((event) => event.id));
    const updated = advanceColonyGrowth(updater(colony));
    const shortage = [updated.foodStatus, updated.energyStatus, updated.housingStatus, updated.materialsStatus].some((status) => status === "shortage" || status === "critical");
    const shortageEvent = shortage && !updated.history.some((event) => event.eventType === "colony_shortage")
      ? createHistoryEvent(colony.id, "colony_shortage", "Colony Shortage", `${updated.name} reported a ${[updated.foodStatus, updated.energyStatus, updated.housingStatus, updated.materialsStatus].filter((status) => status === "shortage" || status === "critical").join(", ")} condition.`)
      : null;
    const withExplicitEvent = timelineEvent ? { ...updated, history: [timelineEvent, ...updated.history.filter((event) => event.id !== timelineEvent.id)] } : updated;
    const withShortage = shortageEvent ? { ...withExplicitEvent, history: [shortageEvent, ...withExplicitEvent.history] } : withExplicitEvent;
    generatedEvents.push(...withShortage.history.filter((event) => !existingEventIds.has(event.id)));
    return withShortage;
  });
  writeColonies(next);
  const updated = next.find((colony) => colony.id === colonyId);
  if (updated) {
    syncJournal(updated);
    for (const event of generatedEvents) syncTimeline(updated, event);
  }
  return updated;
}

export function renameColony(colonyId: string, name: string) {
  const timestamp = new Date().toISOString();
  return updateStoredColony(
    colonyId,
    (colony) => ({ ...colony, name, lastUpdatedAt: timestamp }),
    createHistoryEvent(colonyId, "colony_renamed", "Colony Renamed", `Colony renamed to ${name}.`, timestamp)
  );
}

export function setColonyFocus(colonyId: string, focus: ColonyFocus) {
  const timestamp = new Date().toISOString();
  return updateStoredColony(
    colonyId,
    (colony) => recalculateColony({ ...colony, focus, lastUpdatedAt: timestamp }),
    createHistoryEvent(colonyId, "colony_focus_changed", "Colony Focus Changed", `Colony focus changed to ${focus}.`, timestamp)
  );
}

export function setDevelopmentPaused(colonyId: string, paused: boolean) {
  const timestamp = new Date().toISOString();
  return updateStoredColony(
    colonyId,
    (colony) => ({ ...colony, developmentPaused: paused, lastUpdatedAt: timestamp }),
    createHistoryEvent(colonyId, "development_paused", paused ? "Development Paused" : "Development Resumed", paused ? "Colony development was paused." : "Colony development resumed.", timestamp)
  );
}

export function abandonColony(colonyId: string) {
  const timestamp = new Date().toISOString();
  return updateStoredColony(
    colonyId,
    (colony) => ({ ...colony, status: "abandoned", populationGrowthRate: 0, developmentPaused: true, lastUpdatedAt: timestamp }),
    createHistoryEvent(colonyId, "colony_abandoned", "Colony Abandoned", "The colony was abandoned and preserved in history.", timestamp)
  );
}

export function addColonyBuilding(colonyId: string, templateId: string, completedResearchIds: string[] = []) {
  const timestamp = new Date().toISOString();
  return updateStoredColony(
    colonyId,
    (colony) => {
      const slots = levelDefinition(colony.colonyLevel).buildingSlots;
      if (colony.buildings.length >= slots) return colony;
      const building = createBuildingRecord(colony.id, templateId, completedResearchIds, "building", timestamp);
      return recalculateColony({ ...colony, buildings: [building, ...colony.buildings], lastUpdatedAt: timestamp });
    },
    createHistoryEvent(colonyId, "building_started", "Building Started", "A new colony building project was started.", timestamp)
  );
}

export function upgradeColonyBuilding(colonyId: string, buildingId: string) {
  const timestamp = new Date().toISOString();
  return updateStoredColony(
    colonyId,
    (colony) => recalculateColony({
      ...colony,
      buildings: colony.buildings.map((building) => (building.id === buildingId ? { ...building, level: building.level + 1, constructionStatus: "building", constructionProgress: 0 } : building)),
      lastUpdatedAt: timestamp
    }),
    createHistoryEvent(colonyId, "building_started", "Building Upgrade Started", "A colony building upgrade was started.", timestamp)
  );
}

export function completeColonyBuilding(colonyId: string, buildingId: string) {
  const timestamp = new Date().toISOString();
  return updateStoredColony(
    colonyId,
    (colony) => recalculateColony({
      ...colony,
      buildings: colony.buildings.map((building) => (building.id === buildingId ? { ...building, constructionStatus: "complete", constructionProgress: 100 } : building)),
      lastUpdatedAt: timestamp
    }),
    createHistoryEvent(colonyId, "building_completed", "Building Completed", "A colony building became operational.", timestamp)
  );
}
