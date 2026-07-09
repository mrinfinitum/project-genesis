"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Shield, Sparkles, Swords, Waypoints } from "lucide-react";
import { FACTIONS_UPDATED_EVENT, generateFallbackFactions, readDiscoveredFactions, type FactionRecord } from "@/lib/factions/procedural";

function badgeClass(value: string) {
  if (/pirate|hostile|overwhelming|ancient|remnant/i.test(value)) return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  if (/friendly|science|trade|coalition|order/i.test(value)) return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
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

function FactionCard({ faction, selected, onSelect }: { faction: FactionRecord; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-md border bg-[#07101e]/85 p-4 text-left shadow-glow transition hover:border-cyan-300/55 ${selected ? "border-cyan-300/65" : "border-cyan-300/15"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${badgeClass(faction.type)}`}>{faction.type}</span>
            <span className={`rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${badgeClass(faction.disposition)}`}>{faction.disposition}</span>
          </div>
          <h2 className="mt-3 text-2xl font-black text-white">{faction.name}</h2>
          <p className="mt-1 font-mono text-xs text-slate-500">{faction.id}</p>
        </div>
        <Shield className="h-6 w-6 text-cyan-200" />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{faction.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-2">
          <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Government</p>
          <p className="mt-1 text-sm font-bold text-slate-100">{faction.government}</p>
        </div>
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-2">
          <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Military</p>
          <p className="mt-1 text-sm font-bold text-slate-100">{faction.militaryStrength}</p>
        </div>
      </div>
    </button>
  );
}

export function FactionsWorkspace() {
  const [factions, setFactions] = useState<FactionRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      const rows = readDiscoveredFactions();
      setFactions(rows.length ? rows : generateFallbackFactions());
      setSelectedId((current) => current ?? rows[0]?.id ?? generateFallbackFactions()[0]?.id ?? null);
    }

    refresh();
    window.addEventListener(FACTIONS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(FACTIONS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = factions.filter((faction) => {
    const haystack = [faction.name, faction.type, faction.government, faction.alignment, faction.disposition, faction.economyType, faction.description, faction.relationshipTags.join(" ")].join(" ").toLowerCase();
    return !query.trim() || haystack.includes(query.toLowerCase());
  });
  const selected = factions.find((faction) => faction.id === selectedId) ?? filtered[0];
  const countsByType = useMemo(() => factions.reduce<Record<string, number>>((counts, faction) => ({ ...counts, [faction.type]: (counts[faction.type] ?? 0) + 1 }), {}), [factions]);

  return (
    <main className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_28rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Living Universe Layer</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white">Factions</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">Procedurally discovered colonies, guilds, coalitions, remnants, clans, orders, and alien civilizations tied to the existing galaxy hierarchy.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatTile label="Tracked Factions" value={factions.length} />
          <StatTile label="Controlled Systems" value={new Set(factions.flatMap((faction) => faction.controlledSystemIds)).size} />
          <StatTile label="Controlled Planets" value={new Set(factions.flatMap((faction) => faction.controlledPlanetIds)).size} />
          <StatTile label="Faction Types" value={Object.keys(countsByType).length} />
        </div>
      </section>

      <div className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Search factions" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((faction) => (
            <FactionCard key={faction.id} faction={faction} selected={selected?.id === faction.id} onSelect={() => setSelectedId(faction.id)} />
          ))}
        </div>
        <aside className="space-y-4 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Faction Detail</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{selected.name}</h2>
                </div>
                <Waypoints className="h-6 w-6 text-cyan-200" />
              </div>
              <p className="text-sm leading-6 text-slate-300">{selected.description}</p>
              <div className="grid gap-2">
                {[
                  ["Alignment", selected.alignment],
                  ["Technology", selected.technologyLevel],
                  ["Economy", selected.economyType],
                  ["Home System", selected.homeStarSystemId],
                  ["Home Planet", selected.homePlanetId ?? "System-based"],
                  ["Discovery", selected.discoveryState]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-100">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {selected.relationshipTags.map((tag) => (
                  <span key={tag} className={`rounded-md border px-2.5 py-1 text-xs font-bold ${badgeClass(tag)}`}>{tag}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-4 text-sm font-semibold leading-6 text-amber-100">
              Scan sectors, star systems, or planets to discover live faction records.
            </div>
          )}
          <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-cyan-200" />
              <h3 className="text-lg font-black text-white">Type Mix</h3>
            </div>
            <div className="mt-3 grid gap-2">
              {Object.entries(countsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between rounded-md border border-cyan-300/10 bg-[#07101e]/80 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-300">{type}</span>
                  <span className="text-sm font-black text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-100">
            <Sparkles className="mb-2 h-5 w-5" />
            Factions are generated from deterministic system and planet seeds, then logged to the Discovery Journal and Universe Timeline when found.
          </div>
        </aside>
      </section>
    </main>
  );
}
