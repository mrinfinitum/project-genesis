"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, BadgeDollarSign, LineChart, Plus, Shield, TrendingDown, TrendingUp } from "lucide-react";
import { ResourceService } from "@/lib/resources/service";
import { COLONIES_UPDATED_EVENT } from "@/lib/colonies/procedural";
import { ECONOMY_UPDATED_EVENT, createStoredTradeRoute, readEconomyState, type EconomyState, type MarketRecord, type ResourceListing } from "@/lib/economy/trade";
import { recordMissionProgress } from "@/lib/missions/procedural";
import { WorkspaceBadge as Badge, WorkspaceHeader, WorkspacePanel as Section, WorkspaceSearchBar, WorkspaceStatTile as StatTile, WorkspaceTabs } from "@/components/ui/workspace";

type EconomyTab = "overview" | "markets" | "prices" | "routes" | "opportunities";
const economyTabs: EconomyTab[] = ["overview", "markets", "prices", "routes", "opportunities"];

function resourceName(id: string) {
  return ResourceService.nameForId(id);
}

function listingSignal(listings: ResourceListing[], availability: string[]) {
  return listings.filter((listing) => availability.includes(listing.availability)).length;
}

function MarketCard({ market, selected, onSelect }: { market: MarketRecord; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={`rounded-md border bg-[#07101e]/85 p-4 text-left shadow-glow transition hover:border-cyan-300/55 ${selected ? "border-cyan-300/65" : "border-cyan-300/15"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge value={market.marketType.replace("_", " ")} />
            <Badge value={market.security < 40 ? "High Risk" : "Secure"} />
          </div>
          <h2 className="mt-3 truncate text-2xl font-black text-white">{market.name}</h2>
          <p className="mt-1 font-mono text-xs text-slate-500">{market.id}</p>
        </div>
        <BadgeDollarSign className="h-6 w-6 shrink-0 text-cyan-200" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatTile label="Listings" value={market.resourceListings.length} />
        <StatTile label="Volume" value={market.tradeVolume} />
        <StatTile label="Prosperity" value={market.prosperity} />
        <StatTile label="Security" value={market.security} />
      </div>
    </button>
  );
}

export function EconomyWorkspace() {
  const [state, setState] = useState<EconomyState>(() => readEconomyState());
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<EconomyTab>("overview");
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);

  function refresh() {
    const next = readEconomyState();
    setState(next);
    setSelectedMarketId((current) => current ?? next.markets[0]?.id ?? null);
  }

  useEffect(() => {
    refresh();
    window.addEventListener(ECONOMY_UPDATED_EVENT, refresh);
    window.addEventListener(COLONIES_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(ECONOMY_UPDATED_EVENT, refresh);
      window.removeEventListener(COLONIES_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filteredMarkets = state.markets.filter((market) => {
    const haystack = [market.name, market.id, market.marketType, market.sectorId, market.starSystemId, market.colonyId].join(" ").toLowerCase();
    return !query.trim() || haystack.includes(query.toLowerCase());
  });
  const selectedMarket = state.markets.find((market) => market.id === selectedMarketId) ?? filteredMarkets[0];
  const allListings = useMemo(() => state.markets.flatMap((market) => market.resourceListings.map((listing) => ({ market, listing }))), [state.markets]);
  const totals = useMemo(() => {
    const shortages = state.markets.reduce((sum, market) => sum + listingSignal(market.resourceListings, ["critical", "scarce"]), 0);
    const surpluses = state.markets.reduce((sum, market) => sum + listingSignal(market.resourceListings, ["abundant"]), 0);
    return {
      markets: state.markets.length,
      volume: state.markets.reduce((sum, market) => sum + market.tradeVolume, 0),
      routes: state.tradeRoutes.filter((route) => route.status === "active").length,
      shortages,
      surpluses,
      valuable: [...allListings].sort((left, right) => right.listing.currentPrice - left.listing.currentPrice).slice(0, 5)
    };
  }, [allListings, state.markets, state.tradeRoutes]);

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Canonical Economy Layer"
        title="Economy & Trade"
        description="Colony production and upkeep become market supply, demand, prices, shortages, surpluses, routes, and trade opportunities."
        stats={[
          { label: "Markets", value: totals.markets },
          { label: "Trade Volume", value: totals.volume },
          { label: "Active Routes", value: totals.routes },
          { label: "Shortages", value: totals.shortages }
        ]}
      />

      <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search markets, systems, colonies" />

      <WorkspaceTabs tabs={economyTabs} active={tab} onChange={setTab} />

      {tab === "overview" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Section title="Most Valuable Resources">
            <div className="grid gap-2">
              {totals.valuable.map(({ market, listing }) => (
                <div key={`${market.id}-${listing.resourceId}`} className="flex items-center justify-between rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2">
                  <div>
                    <p className="text-sm font-black text-white">{resourceName(listing.resourceId)}</p>
                    <p className="text-xs text-slate-500">{market.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-cyan-100">{listing.currentPrice}</p>
                    <Badge value={listing.availability} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Pricing Rules">
            <div className="grid gap-3">
              <p className="text-sm leading-6 text-slate-300">{state.pricingRules.formula}</p>
              <StatTile label="Min Price" value={state.pricingRules.clamps.min} />
              <StatTile label="Max Price" value={state.pricingRules.clamps.max} />
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "markets" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(0,1.25fr)]">
          <div className="grid content-start gap-4">
            {filteredMarkets.map((market) => <MarketCard key={market.id} market={market} selected={selectedMarket?.id === market.id} onSelect={() => setSelectedMarketId(market.id)} />)}
          </div>
          {selectedMarket ? (
            <Section title={selectedMarket.name}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label="Prosperity" value={selectedMarket.prosperity} />
                <StatTile label="Stability" value={selectedMarket.stability} />
                <StatTile label="Security" value={selectedMarket.security} />
                <StatTile label="Tax" value={`${selectedMarket.taxRate}%`} />
              </div>
              <div className="mt-4 grid gap-2">
                {selectedMarket.resourceListings.map((listing) => (
                  <div key={listing.resourceId} className="grid gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 md:grid-cols-[1fr_repeat(5,6rem)] md:items-center">
                    <span className="font-bold text-white">{resourceName(listing.resourceId)}</span>
                    <span className="text-sm text-slate-300">Price {listing.currentPrice}</span>
                    <span className="text-sm text-slate-300">Supply {listing.supply}</span>
                    <span className="text-sm text-slate-300">Demand {listing.demand}</span>
                    <Badge value={listing.priceTrend} />
                    <Badge value={listing.availability} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}
        </div>
      ) : null}

      {tab === "prices" ? (
        <Section title="Resource Prices">
          <div className="grid gap-2">
            {allListings.slice(0, 80).map(({ market, listing }) => (
              <div key={`${market.id}-${listing.resourceId}`} className="grid gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 md:grid-cols-[1fr_repeat(7,6rem)] md:items-center">
                <span className="font-bold text-white">{resourceName(listing.resourceId)}</span>
                <span className="text-sm text-slate-400">{market.name}</span>
                <span className="text-sm text-slate-300">{listing.currentPrice}</span>
                <span className="text-sm text-slate-500">base {listing.basePrice}</span>
                <span className="text-sm text-slate-300">S {listing.supply}</span>
                <span className="text-sm text-slate-300">D {listing.demand}</span>
                <Badge value={listing.priceTrend} />
                <Badge value={listing.availability} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {tab === "routes" ? (
        <Section title="Trade Routes">
          <div className="grid gap-3">
            {state.tradeRoutes.map((route) => (
              <div key={route.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge value={route.status} />
                      <Badge value={route.risk > 60 ? "High Risk" : "Managed Risk"} />
                    </div>
                    <h4 className="mt-2 text-xl font-black text-white">{route.name}</h4>
                    <p className="mt-1 text-sm text-slate-400">{route.originMarketId} → {route.destinationMarketId}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <StatTile label="Capacity" value={route.capacity} />
                    <StatTile label="Profit" value={route.profitability} />
                    <StatTile label="Risk" value={route.risk} />
                    <StatTile label="Security" value={route.securityLevel} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {tab === "opportunities" ? (
        <Section title="Trade Opportunities">
          <div className="grid gap-3">
            {state.tradeOpportunities.map((opportunity) => (
              <div key={opportunity.refreshKey} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {opportunity.sellPrice > opportunity.buyPrice ? <TrendingUp className="h-5 w-5 text-emerald-200" /> : <TrendingDown className="h-5 w-5 text-rose-200" />}
                      <h4 className="text-xl font-black text-white">{resourceName(opportunity.resourceId)}</h4>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{opportunity.originMarketId} → {opportunity.destinationMarketId}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <StatTile label="Buy" value={opportunity.buyPrice} />
                    <StatTile label="Sell" value={opportunity.sellPrice} />
                    <StatTile label="Profit" value={opportunity.estimatedProfit} />
                    <StatTile label="Distance" value={opportunity.distance} />
                    <StatTile label="Risk" value={opportunity.risk} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const route = createStoredTradeRoute(opportunity);
                      recordMissionProgress({ objectiveType: "establish_trade_route", targetId: route.id, targetType: "trade_route" });
                      recordMissionProgress({ objectiveType: "deliver_resource", targetId: opportunity.resourceId, targetType: "resource", locationId: route.id });
                      refresh();
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-300/35 bg-emerald-400/10 px-3 text-sm font-bold text-emerald-100"
                  >
                    <Plus className="h-4 w-4" />
                    Create Route
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-100">
          <ArrowRightLeft className="mb-2 h-5 w-5" />
          Surplus markets feed shortage markets through deterministic trade opportunities.
        </div>
        <div className="rounded-md border border-cyan-300/15 bg-cyan-400/10 p-4 text-sm font-semibold leading-6 text-cyan-100">
          <LineChart className="mb-2 h-5 w-5" />
          Prices use Resource Catalog base values, rarity, scarcity, demand, security, factions, and colony focus.
        </div>
        <div className="rounded-md border border-violet-300/15 bg-violet-400/10 p-4 text-sm font-semibold leading-6 text-violet-100">
          <Shield className="mb-2 h-5 w-5" />
          Route risk reflects market security, distance, and faction modifiers.
        </div>
      </section>
    </main>
  );
}
