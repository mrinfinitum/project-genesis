"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Search, Shield, Sparkles, Waypoints } from "lucide-react";
import { COLONIES_UPDATED_EVENT, generateFallbackColonies, readDiscoveredColonies, type ColonyRecord } from "@/lib/colonies/procedural";

function badgeClass(value: string) {
  if (/struggling|abandoned|pirate|hostile/i.test(value)) return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  if (/growing|active|player|friendly/i.test(value)) return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  return "border-cyan-300/35 bg-cyan-400/10 text-cyan-100";
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
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-2">
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-100">{value}</p>
    </div>
  );
}

function ColonyCard({ colony, selected, onSelect }: { colony: ColonyRecord; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-md border bg-[#07101e]/85 p-4 text-left shadow-glow transition hover:border-cyan-300/55 ${selected ? "border-cyan-300/65" : "border-cyan-300/15"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${badgeClass(colony.status)}`}>{colony.status}</span>
            <span className={`rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${badgeClass(colony.ownerType)}`}>{colony.ownerType}</span>
          </div>
          <h2 className="mt-3 text-2xl font-black text-white">{colony.name}</h2>
          <p className="mt-1 font-mono text-xs text-slate-500">{colony.id}</p>
        </div>
        <Building2 className="h-6 w-6 text-cyan-200" />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{colony.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniStat label="Population" value={colony.population.toLocaleString()} />
        <MiniStat label="Level" value={colony.colonyLevel} />
        <MiniStat label="Production" value={colony.productionRating} />
        <MiniStat label="Stability" value={colony.stability} />
      </div>
    </button>
  );
}

export function ColoniesWorkspace() {
  const [colonies, setColonies] = useState<ColonyRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      const rows = readDiscoveredColonies();
      const fallback = generateFallbackColonies();
      const next = rows.length ? rows : fallback;
      setColonies(next);
      setSelectedId((current) => current ?? next[0]?.id ?? null);
    }

    refresh();
    window.addEventListener(COLONIES_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(COLONIES_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = colonies.filter((colony) => {
    const haystack = [colony.name, colony.planetName, colony.status, colony.ownerType, colony.description, colony.resourceOutputIds.join(" ")].join(" ").toLowerCase();
    return !query.trim() || haystack.includes(query.toLowerCase());
  });
  const selected = colonies.find((colony) => colony.id === selectedId) ?? filtered[0];
  const totals = useMemo(
    () => ({
      population: colonies.reduce((sum, colony) => sum + colony.population, 0),
      production: Math.round(colonies.reduce((sum, colony) => sum + colony.productionRating, 0) / Math.max(1, colonies.length)),
      defense: Math.round(colonies.reduce((sum, colony) => sum + colony.defenseRating, 0) / Math.max(1, colonies.length)),
      systems: new Set(colonies.map((colony) => colony.starSystemId)).size
    }),
    [colonies]
  );

  return (
    <main className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_28rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Ownership Layer</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white">Colonies</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">Claimed worlds become durable colony records linked back to planets, star systems, sectors, galaxies, journal entries, and export modules.</p>
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

      <section className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((colony) => (
            <ColonyCard key={colony.id} colony={colony} selected={selected?.id === colony.id} onSelect={() => setSelectedId(colony.id)} />
          ))}
        </div>
        <aside className="space-y-4 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Colony Detail</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{selected.name}</h2>
                </div>
                <Waypoints className="h-6 w-6 text-cyan-200" />
              </div>
              <p className="text-sm leading-6 text-slate-300">{selected.description}</p>
              <div className="grid gap-2">
                {[
                  ["Planet", selected.planetName],
                  ["Status", selected.status],
                  ["Owner", selected.ownerFactionId ?? selected.ownerPlayerId ?? selected.ownerType],
                  ["Morale", selected.morale],
                  ["Research", selected.researchRating],
                  ["Trade", selected.tradeRating],
                  ["Defense", selected.defenseRating],
                  ["Founded", selected.foundedAt]
                ].map(([label, value]) => (
                  <MiniStat key={label} label={String(label)} value={value} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {selected.resourceOutputIds.length ? selected.resourceOutputIds.map((resourceId) => (
                  <span key={resourceId} className="rounded-md border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-100">{resourceId}</span>
                )) : <span className="text-sm font-semibold text-slate-500">No resource outputs linked yet.</span>}
              </div>
            </>
          ) : (
            <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-4 text-sm font-semibold leading-6 text-amber-100">
              Colonize eligible scanned worlds to create live colony records.
            </div>
          )}
          <div className="rounded-md border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-100">
            <Sparkles className="mb-2 h-5 w-5" />
            Colony stats are generated from habitability, resources, rarity, hazards, and faction presence, then preserved for journal, timeline, and engine export workflows.
          </div>
          <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-200" />
              <h3 className="text-lg font-black text-white">Defense Average</h3>
            </div>
            <p className="mt-3 text-3xl font-black text-white">{totals.defense}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
