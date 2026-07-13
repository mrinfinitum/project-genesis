import { ResourceService } from "@/lib/resources/service";
import type { GameData, ResourceCatalogItem } from "@/types/schema";
import type { EconomyUsageRelationships, EconomyValueDefinition, HudResourceSlot, InventoryResourceMetadata } from "@/types/runtime";

export const canonicalEconomyDefinitions: EconomyValueDefinition[] = [
  {
    id: "ECON-CREDITS",
    name: "credits",
    displayName: "Credits",
    description: "Primary spendable civilization currency used for upgrades, buildings, trade, boosts, and general progression costs.",
    valueType: "currency",
    category: "global_economy",
    iconKey: "economy_credits",
    color: "#facc15",
    formatting: { style: "compact", prefix: "", suffix: "", decimals: 0 },
    spendable: true,
    premium: false,
    startingAmount: 0,
    startingRate: 0,
    minimum: 0,
    maximum: null,
    visibility: "always",
    usage: ["upgrade costs", "building costs", "trade", "missions", "events", "progression rewards"],
    status: "canonical"
  },
  {
    id: "ECON-POPULATION",
    name: "population",
    displayName: "Population",
    description: "Civilization-wide population counter used for growth, workers, era unlocks, settlement scale, and progression checks.",
    valueType: "counter",
    category: "global_economy",
    iconKey: "economy_population",
    color: "#7dd3fc",
    formatting: { style: "compact", prefix: "", suffix: "", decimals: 0 },
    spendable: false,
    premium: false,
    startingAmount: 125,
    startingRate: 0,
    minimum: 0,
    maximum: null,
    visibility: "always",
    usage: ["era unlocks", "building requirements", "mission objectives", "progression rewards"],
    status: "canonical"
  },
  {
    id: "ECON-CIVILIZATION-ENERGY",
    name: "civilization_energy",
    displayName: "Civilization Energy",
    description: "Global energy and action economy used by automation, boosts, systems, and civilization-wide production pacing.",
    valueType: "currency",
    category: "global_economy",
    iconKey: "economy_civilization_energy",
    color: "#22d3ee",
    formatting: { style: "compact", prefix: "", suffix: "", decimals: 0 },
    spendable: true,
    premium: false,
    startingAmount: 0,
    startingRate: 0,
    minimum: 0,
    maximum: null,
    visibility: "always",
    usage: ["base click contribution", "automation contribution", "boosts", "events", "missions"],
    status: "canonical"
  },
  {
    id: "ECON-RESEARCH",
    name: "research",
    displayName: "Research",
    description: "Global research progress used for research unlocks, technology pacing, and science progression.",
    valueType: "currency",
    category: "global_economy",
    iconKey: "economy_research",
    color: "#a78bfa",
    formatting: { style: "compact", prefix: "", suffix: "", decimals: 0 },
    spendable: true,
    premium: false,
    startingAmount: 0,
    startingRate: 0,
    minimum: 0,
    maximum: null,
    visibility: "always",
    usage: ["research costs", "technology unlocks", "missions", "progression rewards"],
    status: "canonical"
  },
  {
    id: "ECON-PREMIUM-CRYSTALS",
    name: "premium_crystals",
    displayName: "Premium Crystals",
    description: "Explicit premium currency. It is globally visible only where premium/store UX is enabled and is never inferred from Quartz or other materials.",
    valueType: "currency",
    category: "global_economy",
    iconKey: "economy_premium_crystals",
    color: "#f0abfc",
    formatting: { style: "compact", prefix: "", suffix: "", decimals: 0 },
    spendable: true,
    premium: true,
    startingAmount: 0,
    startingRate: 0,
    minimum: 0,
    maximum: null,
    visibility: "premium_store",
    usage: ["premium boosts", "premium store"],
    status: "canonical"
  },
  {
    id: "ECON-CIVILIZATION-POINTS",
    name: "civilization_points",
    displayName: "Civilization Points",
    description: "Long-term meta-progression counter awarded by milestones, mastery, era progression, discoveries, and major achievements.",
    valueType: "counter",
    category: "global_economy",
    iconKey: "economy_civilization_points",
    color: "#34d399",
    formatting: { style: "compact", prefix: "", suffix: "", decimals: 0 },
    spendable: false,
    premium: false,
    startingAmount: 0,
    startingRate: 0,
    minimum: 0,
    maximum: null,
    visibility: "when_unlocked",
    usage: ["era mastery", "milestones", "progression rewards", "achievements"],
    status: "canonical"
  }
];

export const primaryHudEconomyIds = [
  "ECON-CREDITS",
  "ECON-POPULATION",
  "ECON-CIVILIZATION-ENERGY",
  "ECON-RESEARCH",
  "ECON-PREMIUM-CRYSTALS"
] as const;

const economyAliasEntries = [
  ["credits", "ECON-CREDITS"],
  ["coins", "ECON-CREDITS"],
  ["coin", "ECON-CREDITS"],
  ["money", "ECON-CREDITS"],
  ["cash", "ECON-CREDITS"],
  ["population", "ECON-POPULATION"],
  ["pop", "ECON-POPULATION"],
  ["labor", "ECON-POPULATION"],
  ["workforce", "ECON-POPULATION"],
  ["civilization energy", "ECON-CIVILIZATION-ENERGY"],
  ["energy", "ECON-CIVILIZATION-ENERGY"],
  ["civilization points", "ECON-CIVILIZATION-POINTS"],
  ["civ points", "ECON-CIVILIZATION-POINTS"],
  ["research", "ECON-RESEARCH"],
  ["experimental", "ECON-RESEARCH"],
  ["science", "ECON-RESEARCH"],
  ["premium crystals", "ECON-PREMIUM-CRYSTALS"],
  ["premium", "ECON-PREMIUM-CRYSTALS"],
  ["crystals", "ECON-PREMIUM-CRYSTALS"]
] as const;

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const economyIds = new Set(canonicalEconomyDefinitions.map((definition) => definition.id));
const economyAliases = new Map<string, string>(economyAliasEntries.map(([alias, id]) => [normalize(alias), id]));

export function resolveEconomyId(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (economyIds.has(text)) return text;
  return economyAliases.get(normalize(text)) ?? null;
}

export function isEconomyId(value: string) {
  return economyIds.has(value);
}

export function buildPrimaryHudSlots(): HudResourceSlot[] {
  const byId = new Map(canonicalEconomyDefinitions.map((definition) => [definition.id, definition]));
  return primaryHudEconomyIds.map((economyId, index) => {
    const definition = byId.get(economyId);
    if (!definition) throw new Error(`Missing economy definition for HUD slot ${economyId}.`);
    return {
      id: `hud_slot_${index + 1}_${economyId.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      economyId,
      order: index + 1,
      showRate: economyId !== "ECON-POPULATION" && economyId !== "ECON-PREMIUM-CRYSTALS",
      compactLabel: definition.displayName === "Civilization Energy" ? "Energy" : definition.displayName,
      iconKey: definition.iconKey,
      formatting: definition.formatting,
      premium: definition.premium
    };
  });
}

function relationshipPush(map: Record<string, string[]>, economyId: string | null, sourceId: string) {
  if (!economyId) return;
  map[economyId] = [...(map[economyId] ?? []), sourceId];
}

export function buildEconomyUsageRelationships(data: GameData): EconomyUsageRelationships {
  const unresolved: EconomyUsageRelationships["unresolved"] = [];
  const upgradeCosts: Record<string, string[]> = {};
  const buildingCosts: Record<string, string[]> = {};
  const researchCosts: Record<string, string[]> = {};
  const eraUnlocks: Record<string, string[]> = {};

  for (const upgrade of data.upgrades) {
    const economyId = resolveEconomyId(upgrade.cost_resource);
    relationshipPush(upgradeCosts, economyId, upgrade.id);
    if (!economyId && upgrade.cost_resource && !ResourceService.resolveId(upgrade.cost_resource)) {
      unresolved.push({ sourceType: "upgrade", sourceId: upgrade.id, value: upgrade.cost_resource, reason: "Cost does not resolve to an economy definition or Resource Catalog ID." });
    }
  }

  for (const building of data.buildings) {
    if (Number(building.cost_credits) > 0) relationshipPush(buildingCosts, "ECON-CREDITS", building.id);
    if (Number(building.cost_labor) > 0) relationshipPush(buildingCosts, "ECON-POPULATION", building.id);
    if (Number(building.cost_experimental) > 0) relationshipPush(buildingCosts, "ECON-RESEARCH", building.id);
    if (Number(building.population_bonus) > 0) relationshipPush(eraUnlocks, "ECON-POPULATION", building.id);
  }

  for (const research of data.research) {
    if (Number(research.cost_experimental) > 0) relationshipPush(researchCosts, "ECON-RESEARCH", research.id);
  }

  return {
    upgradeCosts,
    buildingCosts,
    researchCosts,
    eraUnlocks,
    boosts: { "ECON-CIVILIZATION-ENERGY": ["boosts_reserved_for_runtime"] },
    missions: {},
    events: {},
    progressionRewards: {
      "ECON-CIVILIZATION-POINTS": ["era_mastery", "major_milestones"],
      "ECON-RESEARCH": ["research_missions"],
      "ECON-CREDITS": ["trade_missions"]
    },
    unresolved
  };
}

function inventoryRelationshipStatus(metadata: InventoryResourceMetadata) {
  const count = [
    metadata.productionSources.length,
    metadata.consumptionUses.length,
    metadata.buildingRelationships.length,
    metadata.researchRelationships.length,
    metadata.planetAvailability.length,
    metadata.eraAvailability.length
  ].filter(Boolean).length;
  return count >= 3 ? "resolved" : count > 0 ? "partial" : "unavailable";
}

export function buildInventoryResourceMetadata(data: GameData): InventoryResourceMetadata[] {
  const resourceNames = new Map(ResourceService.catalog.map((resource) => [resource.id, resource.resource_name]));
  const relationshipRows = data.building_relationships;

  return ResourceService.catalog.map((resource: ResourceCatalogItem) => {
    const name = resource.resource_name;
    const productionSources = [
      ...relationshipRows.filter((row) => row.building.toLowerCase().includes(name.toLowerCase())).map((row) => row.building),
      ...resource.primary_uses.filter((use) => /generated|produced|production|harvest|mining|gather/i.test(use))
    ];
    const consumptionUses = resource.primary_uses.filter(Boolean);
    const buildingRelationships = relationshipRows
      .filter((row) => [row.building, row.category, row.chain_id, row.unlock_research].some((value) => String(value ?? "").toLowerCase().includes(name.toLowerCase())))
      .map((row) => row.id);
    const researchRelationships = data.research
      .filter((row) => [row.name, row.gameplay_effect, row.unlock_summary, row.design_purpose, ...row.unlocks].some((value) => String(value ?? "").toLowerCase().includes(name.toLowerCase())))
      .map((row) => row.id);
    const planetAvailability = resource.typical_planet_classes.filter(Boolean);
    const eraAvailability = [resource.discovery_tier, resource.first_unlock_requirement].filter(Boolean);
    const metadata: InventoryResourceMetadata = {
      id: `inventory_${resource.id}`,
      resourceId: resource.id,
      displayName: resourceNames.get(resource.id) ?? resource.resource_name,
      classification: "inventory_resource",
      productionSources: [...new Set(productionSources)],
      consumptionUses: [...new Set(consumptionUses)],
      storageRules: {
        stackSize: Number(resource.stack_size) || 9999,
        storageLimit: null,
        unavailableReason: "Per-player storage limits are not canonical yet; clients should use stackSize until save-specific limits exist."
      },
      buildingRelationships: [...new Set(buildingRelationships)],
      researchRelationships: [...new Set(researchRelationships)],
      planetAvailability,
      eraAvailability,
      relationshipStatus: "unavailable"
    };
    metadata.relationshipStatus = inventoryRelationshipStatus(metadata);
    return metadata;
  });
}

export function materialResourceIdsThatMustNotBeHud() {
  return new Set(["RES-0001", "RES-0002", "RES-0003", "RES-0004", "RES-0005", "RES-0006", "RES-0009"]);
}
