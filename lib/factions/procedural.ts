export const factionTypes = [
  "Human Colony",
  "Alien Civilization",
  "Mining Guild",
  "Trade Coalition",
  "Pirate Clan",
  "Scientific Order",
  "Ancient Remnant",
  "AI Collective",
  "Independent Settlement"
] as const;

export type FactionType = (typeof factionTypes)[number];

export type FactionRecord = {
  id: string;
  name: string;
  type: FactionType;
  government: string;
  alignment: string;
  disposition: string;
  technologyLevel: string;
  economyType: string;
  militaryStrength: string;
  homeGalaxyId: string;
  homeSectorId: string;
  homeStarSystemId: string;
  homePlanetId?: string;
  controlledSystemIds: string[];
  controlledPlanetIds: string[];
  relationshipTags: string[];
  discoveryState: string;
  description: string;
};

export type FactionContext = {
  galaxyId: string;
  sectorId: string;
  starSystemId: string;
  planetId?: string;
  systemName: string;
  planetName?: string;
  rarity?: string;
  resourceBias?: string;
  dangerLevel?: number;
};

export const FACTION_STORAGE_KEY = "project-genesis-discovered-factions";
export const FACTIONS_UPDATED_EVENT = "project-genesis-factions-updated";

const governments = ["Council", "Directorate", "Concord", "Syndicate", "Collective", "Freehold", "Protectorate", "Covenant", "Remnant Court"];
const alignments = ["Exploration", "Commerce", "Science", "Industry", "Harmony", "Expansion", "Isolation", "Predation", "Preservation"];
const dispositions = ["Friendly", "Neutral", "Cautious", "Competitive", "Hostile", "Secretive", "Protective"];
const technologyLevels = ["Industrial", "Modern", "Future", "Interstellar", "Galactic", "Ancient", "Unknown"];
const economyTypes = ["Mining", "Trade", "Research", "Relic Salvage", "Agrarian", "Manufacturing", "Energy", "Information"];
const militaryStrengths = ["None", "Militia", "Patrol", "Fleet", "Fortified", "Overwhelming", "Unknown"];
const namePrefixes = ["Astra", "Helio", "Nova", "Orion", "Vela", "Kairo", "Eidolon", "Meridian", "Obsidian", "Aurora", "Zenith", "Cinder"];
const nameSuffixes = ["Accord", "Compact", "Guild", "Union", "Clade", "Order", "Sovereignty", "Ring", "Consortium", "Hold", "Assembly", "Remnant"];

export function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function pick<T>(seed: string, values: readonly T[]) {
  return values[hashText(seed) % values.length];
}

function factionChance(context: FactionContext) {
  const rarityBonus = ["Rare", "Epic", "Legendary", "Mythic", "Relic", "Genesis"].includes(context.rarity ?? "") ? 18 : 0;
  const dangerBonus = (context.dangerLevel ?? 0) >= 65 ? 10 : 0;
  const roll = hashText(`${context.starSystemId}:${context.planetId ?? "system"}:faction-roll`) % 100;
  return roll < 32 + rarityBonus + dangerBonus;
}

export function generateFaction(context: FactionContext): FactionRecord | null {
  if (!factionChance(context)) return null;

  const homeId = context.planetId ?? context.starSystemId;
  const type = pick(`${homeId}:type`, factionTypes);
  const prefix = pick(`${homeId}:prefix`, namePrefixes);
  const suffix = pick(`${homeId}:suffix`, nameSuffixes);
  const government = pick(`${homeId}:government`, governments);
  const alignment = pick(`${homeId}:alignment`, alignments);
  const disposition = pick(`${homeId}:disposition`, dispositions);
  const technologyLevel = pick(`${homeId}:technology`, technologyLevels);
  const economyType = pick(`${homeId}:economy`, economyTypes);
  const militaryStrength = type === "Pirate Clan" ? "Fleet" : pick(`${homeId}:military`, militaryStrengths);
  const name = `${prefix} ${suffix}`;
  const location = context.planetName ?? context.systemName;

  return {
    id: `faction-${slug(`${homeId}-${type}-${name}`)}`,
    name,
    type,
    government,
    alignment,
    disposition,
    technologyLevel,
    economyType,
    militaryStrength,
    homeGalaxyId: context.galaxyId,
    homeSectorId: context.sectorId,
    homeStarSystemId: context.starSystemId,
    homePlanetId: context.planetId,
    controlledSystemIds: [context.starSystemId],
    controlledPlanetIds: context.planetId ? [context.planetId] : [],
    relationshipTags: [alignment, disposition, economyType, type],
    discoveryState: "detected",
    description: `${name} is a ${disposition.toLowerCase()} ${type.toLowerCase()} centered on ${location}, with ${technologyLevel.toLowerCase()} technology and a ${economyType.toLowerCase()} economy.`
  };
}

export function generateFallbackFactions() {
  return [
    {
      id: "faction-sol-scientific-order",
      name: "Aurora Order",
      type: "Scientific Order",
      government: "Council",
      alignment: "Science",
      disposition: "Friendly",
      technologyLevel: "Future",
      economyType: "Research",
      militaryStrength: "Patrol",
      homeGalaxyId: "galaxy-milky-way",
      homeSectorId: "sector-local-bubble",
      homeStarSystemId: "system-sol",
      homePlanetId: "planet-earth",
      controlledSystemIds: ["system-sol"],
      controlledPlanetIds: ["planet-earth"],
      relationshipTags: ["Science", "Friendly", "Research", "Starting Civilization"],
      discoveryState: "charted",
      description: "Aurora Order is a sample faction export row for Project Genesis faction schemas and discovery integration."
    }
  ] satisfies FactionRecord[];
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readDiscoveredFactions() {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FACTION_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as FactionRecord[]) : [];
  } catch {
    return [];
  }
}

export function upsertDiscoveredFaction(faction: FactionRecord) {
  if (!canUseStorage()) return faction;
  const current = readDiscoveredFactions();
  const next = current.some((row) => row.id === faction.id) ? current.map((row) => (row.id === faction.id ? faction : row)) : [faction, ...current];
  window.localStorage.setItem(FACTION_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(FACTIONS_UPDATED_EVENT));
  return faction;
}
