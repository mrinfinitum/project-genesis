import { appendTimelineEvent } from "@/lib/explorer/discovery-log";
import { generateFallbackColonies, readDiscoveredColonies, type ColonyRecord } from "@/lib/colonies/procedural";
import { hashText, type FactionRecord } from "@/lib/factions/procedural";
import { ResourceService } from "@/lib/resources/service";

export type PriceTrend = "falling" | "stable" | "rising" | "volatile";
export type Availability = "abundant" | "available" | "limited" | "scarce" | "critical";
export type MarketType = "colony" | "star_system" | "sector";
export type TradeRouteStatus = "proposed" | "active" | "disrupted" | "blockaded" | "inactive";

export type ResourceListing = {
  resourceId: string;
  basePrice: number;
  currentPrice: number;
  supply: number;
  demand: number;
  stock: number;
  stockCapacity: number;
  productionRate: number;
  consumptionRate: number;
  importRate: number;
  exportRate: number;
  priceTrend: PriceTrend;
  availability: Availability;
  lastUpdatedAt: string;
};

export type MarketRecord = {
  id: string;
  name: string;
  marketType: MarketType;
  galaxyId: string;
  sectorId: string;
  starSystemId?: string;
  planetId?: string;
  colonyId?: string;
  ownerFactionId?: string;
  parentMarketId?: string;
  childMarketIds: string[];
  resourceListings: ResourceListing[];
  tradeVolume: number;
  prosperity: number;
  stability: number;
  security: number;
  taxRate: number;
  tariffRate: number;
  createdAt: string;
  updatedAt: string;
};

export type TradeRoute = {
  id: string;
  name: string;
  originMarketId: string;
  destinationMarketId: string;
  originColonyId?: string;
  destinationColonyId?: string;
  resourceIds: string[];
  capacity: number;
  distance: number;
  risk: number;
  profitability: number;
  securityLevel: number;
  ownerFactionId?: string;
  status: TradeRouteStatus;
  createdAt: string;
  updatedAt: string;
};

export type TradeOpportunity = {
  id: string;
  resourceId: string;
  originMarketId: string;
  destinationMarketId: string;
  buyPrice: number;
  sellPrice: number;
  estimatedProfit: number;
  distance: number;
  risk: number;
  expiresAt: string;
  refreshKey: string;
};

export type EconomyState = {
  markets: MarketRecord[];
  tradeRoutes: TradeRoute[];
  tradeOpportunities: TradeOpportunity[];
  pricingRules: typeof pricingRuleMetadata;
  marketLevelDefinitions: typeof marketLevelDefinitions;
  generatedAt: string;
};

export const ECONOMY_STORAGE_KEY = "project-genesis-economy-state";
export const ECONOMY_UPDATED_EVENT = "project-genesis-economy-updated";

export const priceClamps = { min: 1, max: 5000 };

export const marketLevelDefinitions = [
  { id: "market_level_colony", marketType: "colony", name: "Colony Market", scope: "Local colony supply and demand" },
  { id: "market_level_star_system", marketType: "star_system", name: "Star System Market", scope: "Aggregates colony and station markets within a star system" },
  { id: "market_level_sector", marketType: "sector", name: "Sector Market", scope: "Aggregates connected star system markets inside a sector" }
] as const;

export const pricingRuleMetadata = {
  sourceOfTruth: "ResourceService.catalog",
  formula: "currentPrice = basePrice * scarcityModifier * demandModifier * rarityModifier * securityModifier * factionModifier * focusModifier",
  clamps: priceClamps,
  deterministicInputs: ["resource catalog", "stored market state", "colony production", "colony consumption", "faction type", "colony focus", "security", "elapsed time bucket"]
};

export const economySchemas = {
  market: "MarketRecord",
  resourceListing: "ResourceListing",
  tradeRoute: "TradeRoute",
  tradeOpportunity: "TradeOpportunity"
};

const specialResourceMap = new Map<string, string>([
  ["colony_food", "RES-0190"],
  ["food", "RES-0190"],
  ["colony_energy", "RES-0189"],
  ["resource_energy", "RES-0189"],
  ["energy", "RES-0189"],
  ["colony_housing", "RES-0027"],
  ["housing", "RES-0027"],
  ["resource_materials", "RES-0027"],
  ["colony_storage", "RES-0027"],
  ["materials", "RES-0027"],
  ["colony_research", "RES-0192"],
  ["research", "RES-0192"],
  ["colony_trade", "RES-0193"],
  ["trade", "RES-0193"],
  ["colony_security", "RES-0183"],
  ["security", "RES-0183"],
  ["resource_biomass", "RES-0190"]
]);

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)));
}

function nowIso() {
  return new Date().toISOString();
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function resolveEconomyResourceId(resourceId: string) {
  if (ResourceService.getById(resourceId)) return resourceId;
  const normalized = resourceId.toLowerCase().trim();
  const special = specialResourceMap.get(normalized);
  if (special && ResourceService.getById(special)) return special;
  const stripped = normalized.replace(/^resource_/, "").replace(/^colony_/, "").replace(/_/g, " ");
  return ResourceService.resolveId(stripped) ?? null;
}

function rarityModifier(rarity: string) {
  if (/exotic|mythic|genesis|relic/i.test(rarity)) return 2.15;
  if (/rare|legendary|epic/i.test(rarity)) return 1.55;
  if (/uncommon/i.test(rarity)) return 1.18;
  return 1;
}

function factionMarketModifiers(faction?: FactionRecord | null) {
  if (!faction) return { stability: 0, security: 0, trade: 0, risk: 0, price: 1 };
  if (faction.type === "Trade Coalition") return { stability: 12, security: 4, trade: 24, risk: -8, price: 0.96 };
  if (faction.type === "Mining Guild") return { stability: 4, security: 2, trade: 8, risk: 0, price: 0.92 };
  if (faction.type === "Pirate Clan") return { stability: -18, security: -24, trade: -10, risk: 32, price: 1.24 };
  if (faction.type === "Scientific Order") return { stability: 8, security: 4, trade: 6, risk: -2, price: 1.08 };
  if (faction.type === "AI Collective") return { stability: 16, security: 10, trade: 10, risk: -10, price: 0.9 };
  if (faction.type === "Ancient Remnant") return { stability: -4, security: 8, trade: 18, risk: 12, price: 1.35 };
  return { stability: 0, security: 0, trade: 0, risk: 0, price: 1 };
}

function focusPriceModifier(focus: ColonyRecord["focus"]) {
  if (focus === "Mining") return 0.9;
  if (focus === "Research") return 1.12;
  if (focus === "Trade") return 0.95;
  if (focus === "Defense") return 1.08;
  if (focus === "Growth") return 1.06;
  return 1;
}

function availabilityFor(stockRatio: number, supply: number, demand: number): Availability {
  if (stockRatio < 0.12 || demand > supply * 2.2) return "critical";
  if (stockRatio < 0.28 || demand > supply * 1.45) return "scarce";
  if (stockRatio < 0.45 || demand > supply * 1.1) return "limited";
  if (stockRatio > 0.75 && supply > demand * 1.25) return "abundant";
  return "available";
}

function trendFor(supply: number, demand: number, security: number): PriceTrend {
  if (security < 35 && Math.abs(demand - supply) > 8) return "volatile";
  if (demand > supply * 1.2) return "rising";
  if (supply > demand * 1.35) return "falling";
  return "stable";
}

function listing(resourceId: string, input: {
  supply: number;
  demand: number;
  productionRate: number;
  consumptionRate: number;
  security: number;
  faction?: FactionRecord | null;
  focus?: ColonyRecord["focus"];
  importRate?: number;
  exportRate?: number;
  updatedAt: string;
}): ResourceListing | null {
  const canonicalId = resolveEconomyResourceId(resourceId);
  if (!canonicalId) return null;
  const resource = ResourceService.getById(canonicalId);
  if (!resource) return null;
  const basePrice = Math.max(1, resource.base_trade_value || 1);
  const stockCapacity = Math.max(50, Math.round((input.supply + input.demand + 10) * 12));
  const stock = clamp(input.supply * 8 - input.demand * 4 + stockCapacity * 0.35, 0, stockCapacity);
  const stockRatio = stock / Math.max(1, stockCapacity);
  const scarcityModifier = stockRatio < 0.2 ? 2.25 : stockRatio < 0.45 ? 1.45 : stockRatio > 0.8 ? 0.78 : 1;
  const demandModifier = Math.max(0.7, Math.min(2.2, (input.demand + 8) / Math.max(8, input.supply)));
  const securityModifier = input.security < 35 ? 1.22 : input.security > 75 ? 0.94 : 1;
  const factionModifier = factionMarketModifiers(input.faction).price;
  const currentPrice = clamp(basePrice * scarcityModifier * demandModifier * rarityModifier(resource.rarity) * securityModifier * factionModifier * focusPriceModifier(input.focus ?? "Balanced"), priceClamps.min, priceClamps.max);

  return {
    resourceId: canonicalId,
    basePrice,
    currentPrice,
    supply: Math.max(0, Math.round(input.supply)),
    demand: Math.max(0, Math.round(input.demand)),
    stock,
    stockCapacity,
    productionRate: Math.max(0, Math.round(input.productionRate)),
    consumptionRate: Math.max(0, Math.round(input.consumptionRate)),
    importRate: Math.max(0, Math.round(input.importRate ?? 0)),
    exportRate: Math.max(0, Math.round(input.exportRate ?? 0)),
    priceTrend: trendFor(input.supply, input.demand, input.security),
    availability: availabilityFor(stockRatio, input.supply, input.demand),
    lastUpdatedAt: input.updatedAt
  };
}

function mergeListings(listings: ResourceListing[], updatedAt: string, security: number): ResourceListing[] {
  const grouped = new Map<string, ResourceListing[]>();
  for (const row of listings) grouped.set(row.resourceId, [...(grouped.get(row.resourceId) ?? []), row]);
  return [...grouped.entries()].map(([resourceId, rows]) => listing(resourceId, {
    supply: rows.reduce((sum, row) => sum + row.supply, 0),
    demand: rows.reduce((sum, row) => sum + row.demand, 0),
    productionRate: rows.reduce((sum, row) => sum + row.productionRate, 0),
    consumptionRate: rows.reduce((sum, row) => sum + row.consumptionRate, 0),
    importRate: rows.reduce((sum, row) => sum + row.importRate, 0),
    exportRate: rows.reduce((sum, row) => sum + row.exportRate, 0),
    security,
    updatedAt
  })).filter((row): row is ResourceListing => Boolean(row));
}

function colonyMarket(colony: ColonyRecord, factions: FactionRecord[], updatedAt: string): MarketRecord {
  const faction = colony.ownerFactionId ? factions.find((row) => row.id === colony.ownerFactionId) ?? null : null;
  const factionModifiers = factionMarketModifiers(faction);
  const security = clamp(colony.defenseRating + factionModifiers.security);
  const outputs = Object.entries(colony.resourceOutputRates).map(([resourceId, rate]) => listing(resourceId, {
    supply: rate + colony.productionRating / 5,
    demand: Math.max(1, colony.materialsConsumed / Math.max(1, colony.resourceOutputIds.length)),
    productionRate: rate,
    consumptionRate: Math.max(1, colony.materialsConsumed / Math.max(1, colony.resourceOutputIds.length)),
    security,
    faction,
    focus: colony.focus,
    exportRate: Math.max(0, rate - 2),
    updatedAt
  })).filter((row): row is ResourceListing => Boolean(row));
  const needs = [
    ["colony_food", colony.foodProduced, colony.foodConsumed],
    ["colony_energy", colony.energyProduced, colony.energyConsumed],
    ["colony_housing", colony.housingCapacity / 100, colony.population / 100],
    ["resource_materials", colony.materialsProduced, colony.materialsConsumed]
  ].map(([resourceId, supply, demand]) => listing(String(resourceId), {
    supply: Number(supply),
    demand: Number(demand),
    productionRate: Number(supply),
    consumptionRate: Number(demand),
    security,
    faction,
    focus: colony.focus,
    importRate: Math.max(0, Number(demand) - Number(supply)),
    updatedAt
  })).filter((row): row is ResourceListing => Boolean(row));
  const resourceListings = mergeListings([...outputs, ...needs], updatedAt, security);
  const shortageCount = resourceListings.filter((row) => row.availability === "critical" || row.availability === "scarce").length;

  return {
    id: `market-colony-${slug(colony.id)}`,
    name: `${colony.name} Market`,
    marketType: "colony",
    galaxyId: colony.galaxyId,
    sectorId: colony.sectorId,
    starSystemId: colony.starSystemId,
    planetId: colony.planetId,
    colonyId: colony.id,
    ownerFactionId: colony.ownerFactionId,
    parentMarketId: `market-system-${slug(colony.starSystemId)}`,
    childMarketIds: [],
    resourceListings,
    tradeVolume: clamp(colony.tradeRating + resourceListings.length * 5 + factionModifiers.trade, 0, 9999),
    prosperity: clamp((colony.morale + colony.stability + colony.tradeRating) / 3 - shortageCount * 8),
    stability: clamp(colony.stability + factionModifiers.stability),
    security,
    taxRate: clamp(6 + colony.colonyLevel, 0, 30),
    tariffRate: clamp(4 + shortageCount * 2, 0, 35),
    createdAt: colony.foundedAt,
    updatedAt
  };
}

function aggregateMarket(type: "star_system" | "sector", id: string, children: MarketRecord[], updatedAt: string): MarketRecord {
  const first = children[0];
  const security = clamp(children.reduce((sum, market) => sum + market.security, 0) / Math.max(1, children.length));
  const resourceListings = mergeListings(children.flatMap((market) => market.resourceListings), updatedAt, security);
  return {
    id: `market-${type === "star_system" ? "system" : "sector"}-${slug(id)}`,
    name: `${id} ${type === "star_system" ? "System" : "Sector"} Market`,
    marketType: type,
    galaxyId: first?.galaxyId ?? "galaxy-milky-way",
    sectorId: type === "sector" ? id : first?.sectorId ?? "sector-local-bubble",
    starSystemId: type === "star_system" ? id : undefined,
    childMarketIds: children.map((market) => market.id),
    parentMarketId: type === "star_system" ? `market-sector-${slug(first?.sectorId ?? "sector-local-bubble")}` : undefined,
    resourceListings,
    tradeVolume: children.reduce((sum, market) => sum + market.tradeVolume, 0),
    prosperity: clamp(children.reduce((sum, market) => sum + market.prosperity, 0) / Math.max(1, children.length)),
    stability: clamp(children.reduce((sum, market) => sum + market.stability, 0) / Math.max(1, children.length)),
    security,
    taxRate: type === "sector" ? 3 : 5,
    tariffRate: type === "sector" ? 6 : 5,
    createdAt: "derived",
    updatedAt
  };
}

export function buildMarketsFromColonies(colonies: ColonyRecord[], factions: FactionRecord[] = [], updatedAt = nowIso()): MarketRecord[] {
  const colonyMarkets = colonies.filter((colony) => colony.status !== "abandoned").map((colony) => colonyMarket(colony, factions, updatedAt));
  const systemMarkets = [...new Set(colonyMarkets.map((market) => market.starSystemId).filter(Boolean) as string[])].map((systemId) => aggregateMarket("star_system", systemId, colonyMarkets.filter((market) => market.starSystemId === systemId), updatedAt));
  const sectorMarkets = [...new Set(colonyMarkets.map((market) => market.sectorId))].map((sectorId) => aggregateMarket("sector", sectorId, systemMarkets.filter((market) => market.sectorId === sectorId), updatedAt));
  return [...colonyMarkets, ...systemMarkets, ...sectorMarkets];
}

export function generateTradeOpportunities(markets: MarketRecord[], updatedAt = nowIso()): TradeOpportunity[] {
  const colonyMarkets = markets.filter((market) => market.marketType === "colony");
  const opportunities: TradeOpportunity[] = [];
  for (const origin of colonyMarkets) {
    for (const destination of colonyMarkets) {
      if (origin.id === destination.id) continue;
      for (const originListing of origin.resourceListings.filter((row) => row.availability === "abundant" || row.supply > row.demand * 1.2)) {
        const destinationListing = destination.resourceListings.find((row) => row.resourceId === originListing.resourceId);
        if (!destinationListing || destinationListing.currentPrice <= originListing.currentPrice * 1.2) continue;
        const distance = 1 + (hashText(`${origin.id}:${destination.id}:distance`) % 12);
        const risk = clamp((100 - origin.security + 100 - destination.security) / 3 + distance * 2);
        const estimatedProfit = Math.round((destinationListing.currentPrice - originListing.currentPrice) * Math.max(1, Math.min(originListing.exportRate + 1, 20)) - risk);
        if (estimatedProfit <= 0) continue;
        const id = `trade-opportunity-${slug(`${origin.id}-${destination.id}-${originListing.resourceId}`)}`;
        opportunities.push({
          id,
          resourceId: originListing.resourceId,
          originMarketId: origin.id,
          destinationMarketId: destination.id,
          buyPrice: originListing.currentPrice,
          sellPrice: destinationListing.currentPrice,
          estimatedProfit,
          distance,
          risk,
          expiresAt: updatedAt === "derived" ? "derived" : new Date(Date.parse(updatedAt) + 86400000).toISOString(),
          refreshKey: `${origin.id}:${destination.id}:${originListing.resourceId}:${Math.floor(hashText(updatedAt) / 1000)}`
        });
      }
    }
  }
  if (!opportunities.length) {
    for (const origin of colonyMarkets) {
      const destination = markets.find((market) => market.id === origin.parentMarketId);
      const originListing = origin.resourceListings.find((row) => row.exportRate > 0 || row.supply >= row.demand) ?? origin.resourceListings[0];
      if (!destination || !originListing) continue;
      const distance = 1 + (hashText(`${origin.id}:${destination.id}:parent-distance`) % 4);
      const risk = clamp((100 - origin.security + 100 - destination.security) / 4 + distance);
      const sellPrice = Math.min(priceClamps.max, Math.round(originListing.currentPrice * 1.25 + 10));
      const estimatedProfit = Math.max(1, Math.round((sellPrice - originListing.currentPrice) * Math.max(1, originListing.exportRate || 4) - risk / 2));
      opportunities.push({
        id: `trade-opportunity-${slug(`${origin.id}-${destination.id}-${originListing.resourceId}`)}`,
        resourceId: originListing.resourceId,
        originMarketId: origin.id,
        destinationMarketId: destination.id,
        buyPrice: originListing.currentPrice,
        sellPrice,
        estimatedProfit,
        distance,
        risk,
        expiresAt: updatedAt === "derived" ? "derived" : new Date(Date.parse(updatedAt) + 86400000).toISOString(),
        refreshKey: `${origin.id}:${destination.id}:${originListing.resourceId}:parent:${Math.floor(hashText(updatedAt) / 1000)}`
      });
    }
  }
  return opportunities.sort((left, right) => right.estimatedProfit - left.estimatedProfit).slice(0, 24);
}

export function createTradeRoute(opportunity: TradeOpportunity, ownerFactionId?: string): TradeRoute {
  const id = `trade-route-${slug(`${opportunity.originMarketId}-${opportunity.destinationMarketId}-${opportunity.resourceId}`)}`;
  return {
    id,
    name: `${ResourceService.nameForId(opportunity.resourceId)} Route`,
    originMarketId: opportunity.originMarketId,
    destinationMarketId: opportunity.destinationMarketId,
    resourceIds: [opportunity.resourceId],
    capacity: Math.max(10, Math.round(opportunity.estimatedProfit / 8)),
    distance: opportunity.distance,
    risk: opportunity.risk,
    profitability: opportunity.estimatedProfit,
    securityLevel: clamp(100 - opportunity.risk),
    ownerFactionId,
    status: opportunity.risk > 75 ? "disrupted" : "active",
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

export function buildEconomyState(colonies: ColonyRecord[] = generateFallbackColonies(), factions: FactionRecord[] = [], persistedRoutes: TradeRoute[] = [], updatedAt = nowIso()): EconomyState {
  const markets = buildMarketsFromColonies(colonies, factions, updatedAt);
  const opportunities = generateTradeOpportunities(markets, updatedAt);
  const tradeRoutes = persistedRoutes.length ? persistedRoutes : opportunities.slice(0, 3).map((opportunity) => createTradeRoute(opportunity));
  return {
    markets,
    tradeRoutes,
    tradeOpportunities: opportunities,
    pricingRules: pricingRuleMetadata,
    marketLevelDefinitions,
    generatedAt: updatedAt
  };
}

export function readEconomyState() {
  if (!canUseStorage()) return buildEconomyState();
  const colonies = readDiscoveredColonies();
  const sourceColonies = colonies.length ? colonies : generateFallbackColonies();
  try {
    const persisted = JSON.parse(window.localStorage.getItem(ECONOMY_STORAGE_KEY) ?? "{}") as Partial<EconomyState>;
    return buildEconomyState(sourceColonies, [], persisted.tradeRoutes ?? [], nowIso());
  } catch {
    return buildEconomyState(sourceColonies, [], [], nowIso());
  }
}

export function writeEconomyState(state: EconomyState) {
  if (!canUseStorage()) return state;
  window.localStorage.setItem(ECONOMY_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(ECONOMY_UPDATED_EVENT));
  return state;
}

export function createStoredTradeRoute(opportunity: TradeOpportunity) {
  const current = readEconomyState();
  const route = createTradeRoute(opportunity);
  const next = { ...current, tradeRoutes: current.tradeRoutes.some((row) => row.id === route.id) ? current.tradeRoutes : [route, ...current.tradeRoutes] };
  writeEconomyState(next);
  appendTimelineEvent({
    eventType: "trade_route_created",
    title: `${route.name} Created`,
    description: `A trade route was created from ${route.originMarketId} to ${route.destinationMarketId}.`,
    relatedObjectId: route.id,
    relatedObjectType: "trade_route",
    importance: route.profitability > 500 ? "high" : "medium"
  });
  return route;
}

export function marketForColony(state: EconomyState, colonyId: string) {
  return state.markets.find((market) => market.colonyId === colonyId);
}
