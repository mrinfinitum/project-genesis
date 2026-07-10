"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Check, CirclePause, Hammer, Pencil, Search, Shield, Sparkles, Trash2, TrendingUp, Waypoints } from "lucide-react";
import { marketForColony, readEconomyState } from "@/lib/economy/trade";
import { recordMissionProgress } from "@/lib/missions/procedural";
import { ResourceService } from "@/lib/resources/service";
import {
  COLONIES_UPDATED_EVENT,
  abandonColony,
  addColonyBuilding,
  colonyBuildingTemplates,
  colonyFocusOptions,
  colonyLevelDefinitions,
  completeColonyBuilding,
  generateFallbackColonies,
  readDiscoveredColonies,
  renameColony,
  setColonyFocus,
  setDevelopmentPaused,
  upsertDiscoveredColony,
  upgradeColonyBuilding,
  type ColonyBuilding,
  type ColonyFocus,
  type ColonyRecord
} from "@/lib/colonies/procedural";

type ColonyTab = "overview" | "needs" | "economy" | "buildings" | "development" | "history";

function badgeClass(value: string) {
  if (/critical|shortage|struggling|abandoned|locked/i.test(value)) return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  if (/surplus|growing|active|complete|player/i.test(value)) return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  if (/planned|building|paused/i.test(value)) return "border-amber-300/35 bg-amber-400/10 text-amber-100";
  return "border-cyan-300/35 bg-cyan-400/10 text-cyan-100";
}

function levelName(level: number) {
  return colonyLevelDefinitions.find((definition) => definition.level === level)?.name ?? `Level ${level}`;
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-100">{value}</p>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  return <span className={`rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${badgeClass(value)}`}>{value}</span>;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-900">
      <div className="h-full rounded-full bg-cyan-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function ColonyCard({ colony, selected, onSelect }: { colony: ColonyRecord; selected: boolean; onSelect: () => void }) {
  const nextLevelProgress = Math.min(100, Math.round((colony.experience / Math.max(1, colony.experienceToNextLevel)) * 100));
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-md border bg-[#07101e]/85 p-4 text-left shadow-glow transition hover:border-cyan-300/55 ${selected ? "border-cyan-300/65" : "border-cyan-300/15"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge value={colony.status} />
            <Badge value={colony.focus} />
          </div>
          <h2 className="mt-3 truncate text-2xl font-black text-white">{colony.name}</h2>
          <p className="mt-1 font-mono text-xs text-slate-500">{colony.id}</p>
        </div>
        <Building2 className="h-6 w-6 shrink-0 text-cyan-200" />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{colony.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniStat label="Population" value={colony.population.toLocaleString()} />
        <MiniStat label="Level" value={levelName(colony.colonyLevel)} />
        <MiniStat label="Growth" value={`${(colony.populationGrowthRate * 100).toFixed(2)}% / day`} />
        <MiniStat label="Stability" value={colony.stability} />
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>Next Level</span>
          <span>{nextLevelProgress}%</span>
        </div>
        <ProgressBar value={nextLevelProgress} />
      </div>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BuildingRow({ building, onComplete, onUpgrade }: { building: ColonyBuilding; onComplete: () => void; onUpgrade: () => void }) {
  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge value={building.category} />
            <Badge value={building.constructionStatus} />
          </div>
          <h4 className="mt-2 text-lg font-black text-white">{building.name} L{building.level}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-300">{building.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {building.constructionStatus !== "complete" ? (
            <button type="button" onClick={onComplete} className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-300/35 bg-emerald-400/10 px-3 text-sm font-bold text-emerald-100">
              <Check className="h-4 w-4" />
              Complete
            </button>
          ) : null}
          <button type="button" onClick={onUpgrade} className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-400/10 px-3 text-sm font-bold text-cyan-100">
            <TrendingUp className="h-4 w-4" />
            Upgrade
          </button>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>Construction</span>
          <span>{building.constructionProgress}%</span>
        </div>
        <ProgressBar value={building.constructionProgress} />
      </div>
    </div>
  );
}

export function ColoniesWorkspace() {
  const [colonies, setColonies] = useState<ColonyRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<ColonyTab>("overview");

  function refresh() {
    const rows = readDiscoveredColonies();
    const next = rows.length ? rows : generateFallbackColonies();
    setColonies(next);
    setSelectedId((current) => current ?? next[0]?.id ?? null);
  }

  useEffect(() => {
    refresh();
    window.addEventListener(COLONIES_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(COLONIES_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = colonies.filter((colony) => {
    const haystack = [colony.name, colony.planetName, colony.status, colony.ownerType, colony.focus, colony.description, colony.resourceOutputIds.join(" ")].join(" ").toLowerCase();
    return !query.trim() || haystack.includes(query.toLowerCase());
  });
  const selected = colonies.find((colony) => colony.id === selectedId) ?? filtered[0];
  const economyState = useMemo(() => readEconomyState(), [colonies]);
  const localMarket = selected ? marketForColony(economyState, selected.id) : undefined;
  const connectedRoutes = localMarket ? economyState.tradeRoutes.filter((route) => route.originMarketId === localMarket.id || route.destinationMarketId === localMarket.id) : [];
  const totals = useMemo(
    () => ({
      population: colonies.reduce((sum, colony) => sum + colony.population, 0),
      production: Math.round(colonies.reduce((sum, colony) => sum + colony.productionRating, 0) / Math.max(1, colonies.length)),
      defense: Math.round(colonies.reduce((sum, colony) => sum + colony.defenseRating, 0) / Math.max(1, colonies.length)),
      systems: new Set(colonies.map((colony) => colony.starSystemId)).size
    }),
    [colonies]
  );

  function ensureStored(colony: ColonyRecord) {
    if (!readDiscoveredColonies().some((row) => row.id === colony.id)) upsertDiscoveredColony(colony);
  }

  function runAction(action: (colony: ColonyRecord) => ColonyRecord | undefined) {
    if (!selected) return;
    ensureStored(selected);
    const updated = action(selected);
    refresh();
    if (updated) setSelectedId(updated.id);
  }

  return (
    <main className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_28rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Colony Management Layer</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white">Colonies</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">Manage claimed worlds as persistent settlements with deterministic growth, needs, buildings, focus, history, and export-ready state.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatTile label="Tracked Colonies" value={colonies.length} />
          <StatTile label="Population" value={totals.population.toLocaleString()} />
          <StatTile label="Avg Production" value={totals.production} />
          <StatTile label="Systems Held" value={totals.systems} />
        </div>
      </section>

      <div className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Search colonies" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(0,1.25fr)]">
        <div className="grid content-start gap-4">
          {filtered.map((colony) => (
            <ColonyCard key={colony.id} colony={colony} selected={selected?.id === colony.id} onSelect={() => setSelectedId(colony.id)} />
          ))}
        </div>

        {selected ? (
          <div className="space-y-4">
            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge value={selected.status} />
                    <Badge value={levelName(selected.colonyLevel)} />
                    <Badge value={selected.focus} />
                  </div>
                  <h2 className="mt-3 text-4xl font-black text-white">{selected.name}</h2>
                  <p className="mt-2 font-mono text-xs text-slate-500">{selected.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => runAction((colony) => renameColony(colony.id, window.prompt("Rename colony", colony.name)?.trim() || colony.name))} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-400/10 px-3 text-sm font-bold text-cyan-100">
                    <Pencil className="h-4 w-4" />
                    Rename
                  </button>
                  <button type="button" onClick={() => runAction((colony) => setDevelopmentPaused(colony.id, !colony.developmentPaused))} className="inline-flex h-10 items-center gap-2 rounded-md border border-amber-300/30 bg-amber-400/10 px-3 text-sm font-bold text-amber-100">
                    <CirclePause className="h-4 w-4" />
                    {selected.developmentPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Abandon ${selected.name}? This preserves colony history but marks the colony abandoned.`)) runAction((colony) => abandonColony(colony.id));
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-300/35 bg-rose-400/10 px-3 text-sm font-bold text-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Abandon
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{selected.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {colonyFocusOptions.map((focus) => (
                  <button
                    key={focus}
                    type="button"
                    onClick={() => runAction((colony) => setColonyFocus(colony.id, focus as ColonyFocus))}
                    className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${selected.focus === focus ? "border-cyan-200 bg-cyan-300/20 text-white" : "border-cyan-300/20 bg-slate-950/45 text-slate-300 hover:border-cyan-300/50"}`}
                  >
                    {focus}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-2">
              {(["overview", "needs", "economy", "buildings", "development", "history"] as ColonyTab[]).map((item) => (
                <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-md px-3 py-2 text-sm font-bold capitalize transition ${tab === item ? "bg-cyan-300/20 text-white" : "text-slate-400 hover:bg-cyan-300/10 hover:text-slate-100"}`}>
                  {item}
                </button>
              ))}
            </div>

            {tab === "overview" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <Section title="Overview">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniStat label="Planet" value={selected.planetName} />
                    <MiniStat label="Population" value={`${selected.population.toLocaleString()} / ${selected.populationCapacity.toLocaleString()}`} />
                    <MiniStat label="Growth Rate" value={`${(selected.populationGrowthRate * 100).toFixed(2)}% / day`} />
                    <MiniStat label="Habitability" value={selected.habitabilityRating} />
                    <MiniStat label="Morale" value={selected.morale} />
                    <MiniStat label="Stability" value={selected.stability} />
                  </div>
                </Section>
                <Section title="Outputs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniStat label="Production" value={selected.productionRating} />
                    <MiniStat label="Research" value={selected.researchRating} />
                    <MiniStat label="Defense" value={selected.defenseRating} />
                    <MiniStat label="Trade" value={selected.tradeRating} />
                    <MiniStat label="Infrastructure" value={selected.infrastructureRating} />
                    <MiniStat label="Buildings" value={`${selected.buildings.length} / ${colonyLevelDefinitions[selected.colonyLevel - 1]?.buildingSlots ?? 0}`} />
                  </div>
                </Section>
              </div>
            ) : null}

            {tab === "needs" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <Section title="Needs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniStat label="Food" value={`${selected.foodProduced} / ${selected.foodConsumed}`} />
                    <MiniStat label="Food Status" value={selected.foodStatus} />
                    <MiniStat label="Energy" value={`${selected.energyProduced} / ${selected.energyConsumed}`} />
                    <MiniStat label="Energy Status" value={selected.energyStatus} />
                    <MiniStat label="Housing" value={`${selected.housingCapacity} / ${selected.population}`} />
                    <MiniStat label="Housing Status" value={selected.housingStatus} />
                    <MiniStat label="Materials" value={`${selected.materialsProduced} / ${selected.materialsConsumed}`} />
                    <MiniStat label="Materials Status" value={selected.materialsStatus} />
                  </div>
                </Section>
                <Section title="Resource Output">
                  <div className="grid gap-2">
                    {Object.entries(selected.resourceOutputRates).map(([resourceId, rate]) => (
                      <div key={resourceId} className="flex items-center justify-between rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2">
                        <span className="text-sm font-bold text-slate-200">{resourceId}</span>
                        <span className="text-sm font-black text-cyan-100">{rate}/cycle</span>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            ) : null}

            {tab === "economy" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <Section title="Local Market">
                  {localMarket ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MiniStat label="Market" value={localMarket.name} />
                      <MiniStat label="Trade Volume" value={localMarket.tradeVolume} />
                      <MiniStat label="Prosperity" value={localMarket.prosperity} />
                      <MiniStat label="Security" value={localMarket.security} />
                      <MiniStat label="Tax" value={`${localMarket.taxRate}%`} />
                      <MiniStat label="Tariff" value={`${localMarket.tariffRate}%`} />
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">No market connected yet.</p>
                  )}
                </Section>
                <Section title="Exports / Imports">
                  {localMarket ? (
                    <div className="grid gap-2">
                      {localMarket.resourceListings.slice(0, 8).map((listing) => (
                        <div key={listing.resourceId} className="grid gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 sm:grid-cols-[1fr_5rem_5rem_6rem] sm:items-center">
                          <span className="font-bold text-white">{ResourceService.nameForId(listing.resourceId)}</span>
                          <span className="text-sm text-slate-300">S {listing.supply}</span>
                          <span className="text-sm text-slate-300">D {listing.demand}</span>
                          <Badge value={listing.availability} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Section>
                <Section title="Top Prices">
                  {localMarket ? (
                    <div className="grid gap-2">
                      {[...localMarket.resourceListings].sort((left, right) => right.currentPrice - left.currentPrice).slice(0, 6).map((listing) => (
                        <div key={listing.resourceId} className="flex items-center justify-between rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2">
                          <span className="text-sm font-bold text-slate-200">{ResourceService.nameForId(listing.resourceId)}</span>
                          <span className="text-sm font-black text-cyan-100">{listing.currentPrice}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Section>
                <Section title="Connected Trade Routes">
                  {connectedRoutes.length ? (
                    <div className="grid gap-2">
                      {connectedRoutes.map((route) => (
                        <div key={route.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-black text-white">{route.name}</span>
                            <Badge value={route.status} />
                          </div>
                          <p className="mt-2 text-sm text-slate-400">Profit {route.profitability} · Risk {route.risk} · Capacity {route.capacity}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">No trade routes connected to this colony market yet.</p>
                  )}
                </Section>
              </div>
            ) : null}

            {tab === "buildings" ? (
              <div className="grid gap-4">
                <Section title="Add Building">
                  <div className="grid gap-3 md:grid-cols-2">
                    {colonyBuildingTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() =>
                          runAction((colony) => {
                            const next = addColonyBuilding(colony.id, template.id);
                            recordMissionProgress({ objectiveType: "construct_building", targetId: template.id, targetType: "building", locationId: colony.id });
                            return next;
                          })
                        }
                        className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-3 text-left transition hover:border-cyan-300/50"
                      >
                        <div className="flex items-center gap-2">
                          <Hammer className="h-4 w-4 text-cyan-200" />
                          <span className="font-black text-white">{template.name}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </Section>
                <Section title="Current Buildings">
                  <div className="grid gap-3">
                    {selected.buildings.map((building) => (
                      <BuildingRow
                        key={building.id}
                        building={building}
                        onComplete={() =>
                          runAction((colony) => {
                            const next = completeColonyBuilding(colony.id, building.id);
                            recordMissionProgress({ objectiveType: "construct_building", targetId: building.id, targetType: "building", locationId: colony.id });
                            return next;
                          })
                        }
                        onUpgrade={() => runAction((colony) => upgradeColonyBuilding(colony.id, building.id))}
                      />
                    ))}
                  </div>
                </Section>
              </div>
            ) : null}

            {tab === "development" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <Section title="Level Requirements">
                  <div className="grid gap-3">
                    {colonyLevelDefinitions.map((definition) => (
                      <div key={definition.level} className={`rounded-md border p-3 ${selected.colonyLevel >= definition.level ? "border-emerald-300/20 bg-emerald-400/10" : "border-cyan-300/10 bg-slate-950/45"}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-white">{definition.level}. {definition.name}</span>
                          <span className="text-xs font-bold text-slate-400">{definition.buildingSlots} slots</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">Population {definition.minimumPopulation.toLocaleString()} · Infrastructure {definition.requiredInfrastructure}</p>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Current Projects">
                  {selected.activeProjectIds.length ? (
                    <div className="grid gap-2">
                      {selected.activeProjectIds.map((projectId) => <MiniStat key={projectId} label="Project" value={projectId} />)}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">No active projects.</p>
                  )}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      <span>Experience</span>
                      <span>{selected.experience} / {selected.experienceToNextLevel}</span>
                    </div>
                    <ProgressBar value={(selected.experience / Math.max(1, selected.experienceToNextLevel)) * 100} />
                  </div>
                </Section>
              </div>
            ) : null}

            {tab === "history" ? (
              <Section title="History">
                <div className="grid gap-3">
                  {selected.history.map((event) => (
                    <div key={event.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-black text-white">{event.title}</h4>
                        <Badge value={event.eventType.replaceAll("_", " ")} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{event.description}</p>
                      <p className="mt-2 font-mono text-xs text-slate-500">{event.timestamp}</p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        ) : (
          <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-4 text-sm font-semibold leading-6 text-amber-100">
            Colonize eligible scanned worlds to create live colony records.
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-100">
          <Sparkles className="mb-2 h-5 w-5" />
          Growth is deterministic from colony state, elapsed time, planet factors, needs, focus, and buildings.
        </div>
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-200" />
            <h3 className="text-lg font-black text-white">Defense Average</h3>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totals.defense}</p>
        </div>
      </section>
    </main>
  );
}
