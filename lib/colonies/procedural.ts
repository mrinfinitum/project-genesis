import { hashText, type FactionRecord } from "@/lib/factions/procedural";

export const colonyStatuses = ["planned", "founding", "active", "growing", "struggling", "abandoned"] as const;

export type ColonyStatus = (typeof colonyStatuses)[number];

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
  colonyLevel: number;
  morale: number;
  stability: number;
  productionRating: number;
  researchRating: number;
  defenseRating: number;
  tradeRating: number;
  resourceOutputIds: string[];
  foundedAt: string;
  status: ColonyStatus;
  description: string;
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
  resources?: string[];
  resourceIds?: string[];
  hazards?: string[];
  colonizable?: boolean;
  landable?: boolean;
  faction?: FactionRecord;
  foundedAt?: string;
};

export const COLONY_STORAGE_KEY = "project-genesis-colonies";
export const COLONIES_UPDATED_EVENT = "project-genesis-colonies-updated";

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function resourceOutputIds(context: ColonyContext) {
  const ids = context.resourceIds?.length ? context.resourceIds : (context.resources ?? []).map((resource) => (resource.startsWith("resource_") ? resource : `resource_${slug(resource)}`));
  return [...new Set(ids.filter(Boolean))].slice(0, 6);
}

function clamp(value: number, min = 1, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function habitabilityScore(context: ColonyContext) {
  const text = `${context.planetClass ?? ""} ${context.biome ?? ""}`.toLowerCase();
  let score = context.colonizable || context.landable ? 62 : 30;
  if (/earth|terran|temperate|ocean|garden|forest|wetland/i.test(text)) score += 24;
  if (/ice|desert|tundra|barren|dead/i.test(text)) score -= 10;
  if (/lava|void|toxic|gas|storm|radiation/i.test(text)) score -= 26;
  return clamp(score);
}

function rarityScore(rarity?: string | null) {
  if (!rarity) return 42;
  if (/genesis|mythic|relic|legendary/i.test(rarity)) return 92;
  if (/epic|rare/i.test(rarity)) return 74;
  if (/uncommon/i.test(rarity)) return 56;
  return 42;
}

function hazardPenalty(context: ColonyContext) {
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

export function createColonyRecord(context: ColonyContext): ColonyRecord {
  const seed = `${context.starSystemId}:${context.planetId}:colony`;
  const habitability = habitabilityScore(context);
  const resources = resourceScore(context);
  const rarity = rarityScore(context.rarity);
  const hazards = hazardPenalty(context);
  const foundedAt = context.foundedAt ?? new Date().toISOString();
  const status: ColonyStatus = habitability >= 70 ? "growing" : hazards >= 30 ? "struggling" : "active";
  const population = Math.max(120, Math.round((habitability * 175 + (hashText(seed) % 2400)) / 10) * 10);
  const colonyLevel = habitability >= 80 || rarity >= 80 ? 2 : 1;
  const name = `${context.planetName} Colony`;
  const outputs = resourceOutputIds(context);

  return {
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
    colonyLevel,
    morale: clamp(54 + Math.floor(habitability / 4) - Math.floor(hazards / 5)),
    stability: clamp(70 + Math.floor(habitability / 5) - hazards),
    productionRating: resources,
    researchRating: clamp(32 + Math.floor(rarity / 2) + (context.resourceIds?.length ?? 0) * 3),
    defenseRating: defenseScore(context),
    tradeRating: clamp(30 + Math.floor(rarity / 2) + (context.resources?.length ?? 0) * 5),
    resourceOutputIds: outputs,
    foundedAt,
    status,
    description: `${name} is a ${status} ${context.ownerType ?? "player"} settlement founded on ${context.planetName}. Habitability, resources, hazards, and local faction presence determine its starting ratings.`
  };
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

export function readDiscoveredColonies() {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COLONY_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as ColonyRecord[]) : [];
  } catch {
    return [];
  }
}

export function upsertDiscoveredColony(colony: ColonyRecord) {
  if (!canUseStorage()) return colony;
  const current = readDiscoveredColonies();
  const next = current.some((row) => row.id === colony.id) ? current.map((row) => (row.id === colony.id ? colony : row)) : [colony, ...current];
  window.localStorage.setItem(COLONY_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(COLONIES_UPDATED_EVENT));
  return colony;
}
