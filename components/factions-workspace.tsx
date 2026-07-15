"use client";

import { useEffect, useMemo, useState } from "react";
import { Shield, Sparkles, Swords, Waypoints } from "lucide-react";
import { FACTIONS_UPDATED_EVENT, generateFallbackFactions, readDiscoveredFactions, type FactionRecord } from "@/lib/factions/procedural";
import { WorkspaceBadge as Badge, WorkspaceHeader, WorkspaceSearchBar, WorkspaceStatTile as StatTile, workspaceBadgeClass } from "@/components/ui/workspace";

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
            <Badge value={faction.type} />
            <Badge value={faction.disposition} />
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
      <WorkspaceHeader
        eyebrow="Living Universe Layer"
        title="Factions"
        description="Procedurally discovered colonies, guilds, coalitions, remnants, clans, orders, and alien civilizations tied to the existing galaxy hierarchy."
        stats={[
          { label: "Tracked Factions", value: factions.length },
          { label: "Controlled Systems", value: new Set(factions.flatMap((faction) => faction.controlledSystemIds)).size },
          { label: "Controlled Planets", value: new Set(factions.flatMap((faction) => faction.controlledPlanetIds)).size },
          { label: "Faction Types", value: Object.keys(countsByType).length }
        ]}
      />

      <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search factions" />

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
                  <span key={tag} className={`rounded-md border px-2.5 py-1 text-xs font-bold ${workspaceBadgeClass(tag)}`}>{tag}</span>
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
            Factions are generated from deterministic system and planet seeds, then logged to the Discovery Library and Universe Timeline when found.
          </div>
        </aside>
      </section>
    </main>
  );
}
