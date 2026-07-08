"use client";

import { useMemo, useState } from "react";
import { Activity, Copy, Crosshair, Database, Filter, Map, Orbit, Radar, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateGalaxy,
  generateCelestialBodies,
  generateSectors,
  generateStarSystems,
  generateUniverse,
  planetSubSeeds,
  type SectorNode,
  type StarSystemNode
} from "@/lib/universe/generator";
import { cn } from "@/lib/utils";

const DEFAULT_UNIVERSE_SEED = "PROJECT-GENESIS-UNIVERSE";
const FILTERS = ["All", "Discovered", "Undiscovered", "Ancient", "Void", "Genesis", "Rich Resources", "High Danger"];

const sectorColors: Record<string, string> = {
  "Core Worlds": "border-cyan-200 bg-cyan-300",
  "Civilized Space": "border-sky-200 bg-sky-300",
  "Outer Rim": "border-blue-200 bg-blue-300",
  "Ancient Expanse": "border-amber-200 bg-amber-300",
  Nebula: "border-purple-200 bg-purple-400",
  Frontier: "border-teal-200 bg-teal-300",
  "Deep Space": "border-indigo-200 bg-indigo-400",
  "Void Region": "border-fuchsia-200 bg-fuchsia-950",
  "Harmony Region": "border-emerald-200 bg-emerald-300",
  "Uncharted Space": "border-slate-400 bg-slate-600"
};

const rarityColors: Record<string, string> = {
  Common: "text-white border-white/45",
  Uncommon: "text-[#2ECC71] border-[#2ECC71]/70",
  Rare: "text-[#3498DB] border-[#3498DB]/70",
  Epic: "text-[#9B59B6] border-[#9B59B6]/80",
  Legendary: "text-[#F39C12] border-[#F39C12]/80",
  Mythic: "text-[#E74C3C] border-[#E74C3C]/80",
  Relic: "text-[#FF3CAC] border-[#FF3CAC]/80",
  Genesis: "text-[#FFD700] border-[#FFD700]/90"
};

function statLabel(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function Field({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-semibold text-slate-100", tone)}>{value}</p>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em]", className)}>
      {children}
    </span>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  async function copyValue() {
    await navigator.clipboard.writeText(value);
  }

  return (
    <button
      type="button"
      onClick={copyValue}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-cyan-300/20 text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      <Copy className="h-4 w-4" />
    </button>
  );
}

function SeedRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{label}</p>
        <p className="truncate font-mono text-xs text-slate-300">{value}</p>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

function sectorMatchesFilter(sector: SectorNode, filter: string) {
  if (filter === "All") return true;
  if (filter === "Discovered") return sector.discovered;
  if (filter === "Undiscovered") return !sector.discovered;
  if (filter === "Ancient") return sector.sector_type === "Ancient Expanse" || sector.modifier === "Lost Civilization" || sector.modifier === "Ancient Trade Route";
  if (filter === "Void") return sector.sector_type === "Void Region" || sector.modifier === "Dark Matter Region";
  if (filter === "Genesis") return sector.sector_rarity === "Genesis";
  if (filter === "Rich Resources") return sector.modifier === "Rich Minerals" || sector.resource_signal === "Mineral Rich";
  if (filter === "High Danger") return sector.difficulty >= 70;
  return true;
}

function systemMatchesSearch(system: StarSystemNode, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [system.system_name, system.catalog_designation, system.system_rarity, system.resource_bias]
    .some((value) => value.toLowerCase().includes(normalized));
}

export function GalaxyCommandCenter() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [galaxyIndex, setGalaxyIndex] = useState(0);
  const [sectorIndex, setSectorIndex] = useState(0);
  const [systemIndex, setSystemIndex] = useState(0);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const galaxy = useMemo(() => generateGalaxy(universe.universe_seed, galaxyIndex), [universe.universe_seed, galaxyIndex]);
  const sectors = useMemo(() => generateSectors(galaxy, 64), [galaxy]);
  const visibleSectors = useMemo(() => sectors.filter((sector) => sectorMatchesFilter(sector, filter)), [filter, sectors]);
  const selectedSector = sectors[Math.min(sectorIndex, sectors.length - 1)] ?? sectors[0];
  const systems = useMemo(() => generateStarSystems(selectedSector, 18), [selectedSector]);
  const visibleSystems = useMemo(() => systems.filter((system) => systemMatchesSearch(system, query)), [query, systems]);
  const selectedSystem = systems[Math.min(systemIndex, systems.length - 1)] ?? systems[0];
  const bodies = useMemo(() => generateCelestialBodies(selectedSystem), [selectedSystem]);
  const systemBodies = bodies.filter((body) => body.celestial_body_type !== "Star");
  const discoveredSectors = sectors.filter((sector) => sector.discovered).length;
  const colonizedWorlds = sectors.reduce((total, sector) => total + sector.colonized_worlds, 0);
  const discoveryPoints = sectors.filter((sector) => sector.discovered).reduce((total, sector) => total + sector.discovery_value, 0);
  const discoveryPercent = ((discoveredSectors / galaxy.sector_count) * 100).toFixed(3);

  function chooseSector(sector: SectorNode) {
    setSectorIndex(sectors.findIndex((item) => item.id === sector.id));
    setSystemIndex(0);
  }

  function chooseSystem(system: StarSystemNode) {
    setSystemIndex(systems.findIndex((item) => item.id === system.id));
  }

  async function copyGalaxyExport() {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          universe,
          galaxy,
          selected_sector: selectedSector,
          selected_system: selectedSystem,
          celestial_bodies: bodies,
          persistence_rule: "Store only seeds, discovery state, player changes, and colonies. Regenerate everything else from deterministic child seeds."
        },
        null,
        2
      )
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Galaxy Control</p>
          <h1 className="mt-3 text-5xl font-bold text-white">Galaxy</h1>
          <p className="mt-3 max-w-4xl text-lg text-slate-300">
            Sector-level procedural galaxy view for exploration, discovery state, star system generation, and seed inspection.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(16rem,26rem)_8rem]">
          <input
            className="h-12 rounded-md border border-cyan-300/25 bg-slate-950/65 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/70"
            value={universeSeed}
            onChange={(event) => {
              setUniverseSeed(event.target.value);
              setSectorIndex(0);
              setSystemIndex(0);
            }}
            placeholder="Universe seed"
          />
          <input
            className="h-12 rounded-md border border-cyan-300/25 bg-slate-950/65 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/70"
            value={galaxyIndex}
            onChange={(event) => {
              setGalaxyIndex(Math.max(0, Number(event.target.value) || 0));
              setSectorIndex(0);
              setSystemIndex(0);
            }}
            min={0}
            type="number"
            aria-label="Galaxy index"
          />
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-6">
        <Field label="Galaxy Name" value={galaxy.name} />
        <Field label="Current Sector" value={selectedSector.sector_name} />
        <Field label="Current System" value={selectedSystem.system_name} />
        <Field label="Discovery" value={`${discoveryPercent}%`} tone="text-cyan-200" />
        <Field label="Colonized Worlds" value={colonizedWorlds} />
        <Field label="Discovery Points" value={statLabel(discoveryPoints)} tone="text-amber-200" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90">
          <div className="flex flex-col gap-4 border-b border-cyan-400/15 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-cyan-200" />
                <h2 className="text-lg font-semibold text-white">Sector Map</h2>
              </div>
              <p className="mt-1 text-sm text-slate-400">The map shows sectors, not every star. Unknown sectors stay dark until detected or discovered.</p>
            </div>
            <Button type="button" onClick={copyGalaxyExport}>
              <Database className="h-4 w-4" />
              Copy Export
            </Button>
          </div>

          <div className="relative min-h-[34rem] overflow-hidden bg-[#030712]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.09)_1px,transparent_1px)] bg-[size:52px_52px] opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_62%)]" />
            {visibleSectors.map((sector) => {
              const active = sector.id === selectedSector.id;
              const x = ((sector.coordinates_x + 999) / 1998) * 100;
              const y = ((sector.coordinates_y + 999) / 1998) * 100;
              const isCurrent = sector.discovered && sector.id === sectors[0]?.id;
              const color = sectorColors[sector.sector_type] ?? sectorColors["Uncharted Space"];

              return (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => chooseSector(sector)}
                  className={cn(
                    "absolute grid place-items-center rounded-full border text-[0.62rem] font-black transition",
                    sector.discovered || sector.discovery_level === "Detected" ? color : "border-slate-700 bg-slate-950",
                    active && "z-10 scale-125 shadow-[0_0_28px_rgba(34,211,238,0.45)]",
                    isCurrent && "ring-2 ring-white/80",
                    sector.sector_rarity === "Genesis" && "shadow-[0_0_28px_rgba(255,215,0,0.45)]"
                  )}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: sector.discovered ? 20 : 14,
                    height: sector.discovered ? 20 : 14,
                    transform: "translate(-50%, -50%)"
                  }}
                  title={`${sector.sector_name} / ${sector.sector_type} / ${sector.discovery_level}`}
                >
                  {isCurrent ? "★" : sector.sector_type === "Ancient Expanse" ? "◇" : sector.sector_rarity === "Genesis" ? "⬢" : ""}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 border-t border-cyan-400/15 p-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Galaxy Type" value={galaxy.galaxy_type} />
            <Field label="Galaxy Size" value={galaxy.galaxy_size} />
            <Field label="Sector Count" value={statLabel(galaxy.sector_count)} />
            <Field label="Generated Nodes" value={visibleSectors.length} />
          </div>
        </div>

        <aside className="space-y-4 rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-cyan-200" />
            <h2 className="text-lg font-semibold text-white">Sector Details</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{selectedSector.sector_type}</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{selectedSector.sector_name}</h3>
              <p className="mt-1 font-mono text-xs text-slate-500">{selectedSector.sector_seed}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={rarityColors[selectedSector.sector_rarity]}>{selectedSector.sector_rarity}</Badge>
              <Badge className="border-cyan-300/40 text-cyan-100">{selectedSector.discovery_level}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Systems" value={selectedSector.system_count} />
              <Field label="Difficulty" value={selectedSector.difficulty} tone={selectedSector.difficulty >= 70 ? "text-red-200" : "text-slate-100"} />
              <Field label="Discovery Value" value={statLabel(selectedSector.discovery_value)} />
              <Field label="Colonized" value={selectedSector.colonized_worlds} />
              <Field label="Modifier" value={selectedSector.modifier} />
              <Field label="Resources" value={selectedSector.resource_signal} />
            </div>
            <SeedRow label="Sector Seed" value={selectedSector.sector_seed} />
          </div>
        </aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-[19rem_minmax(0,1fr)_24rem]">
        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-200" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          <div className="mt-4 grid gap-2">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm font-semibold transition",
                  filter === item
                    ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
                    : "border-cyan-400/10 bg-slate-950/25 text-slate-400 hover:border-cyan-300/35 hover:text-white"
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50/90">
            Store only galaxy seed, discovered sectors, discovered systems, colonies, and player changes. Regenerate the rest.
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90">
          <div className="flex flex-col gap-3 border-b border-cyan-400/15 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Orbit className="h-4 w-4 text-cyan-200" />
              <h2 className="text-lg font-semibold text-white">Star Systems</h2>
            </div>
            <div className="relative min-w-0 md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                className="h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/55 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search systems, catalog IDs..."
              />
            </div>
          </div>
          <div className="grid max-h-[32rem] gap-2 overflow-auto p-4 md:grid-cols-2 2xl:grid-cols-3">
            {visibleSystems.map((system) => (
              <button
                key={system.id}
                type="button"
                onClick={() => chooseSystem(system)}
                className={cn(
                  "rounded-md border bg-slate-950/35 p-3 text-left transition hover:border-cyan-300/45",
                  system.id === selectedSystem.id ? "border-cyan-300/65 shadow-[0_0_24px_rgba(34,211,238,0.12)]" : "border-cyan-300/10"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-white">{system.system_name}</p>
                    <p className="mt-1 font-mono text-xs text-slate-500">{system.catalog_designation}</p>
                  </div>
                  <Badge className={rarityColors[system.system_rarity]}>{system.system_rarity}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
                  <span>{system.star_count} stars</span>
                  <span>{system.planet_count} bodies</span>
                  <span>{system.danger_level} danger</span>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-cyan-300">
                  {system.starting_system ? "Starting System / Handcrafted" : system.resource_bias}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-cyan-200" />
            <h2 className="text-lg font-semibold text-white">System Detail</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Field label="System" value={selectedSystem.system_name} />
            <Field label="Catalog ID" value={selectedSystem.catalog_designation} />
            <Field label="System Type" value={selectedSystem.system_type} />
            <Field label="Generation" value={selectedSystem.generation_type} />
            <Field label="Danger" value={selectedSystem.danger_level} />
            <SeedRow label="System Seed" value={selectedSystem.system_seed} />
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">Celestial Bodies</p>
              <div className="mt-3 space-y-2">
                {systemBodies.map((body) => (
                  <div key={body.id} className="rounded-md border border-cyan-300/10 bg-slate-950/40 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">{body.name}</p>
                      <span className={cn("text-xs font-bold", rarityColors[body.planet_rarity ?? ""]?.split(" ")[0])}>
                        {body.planet_rarity ?? body.celestial_body_type}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {body.orbit_parent ? `${body.orbit_parent} / ` : ""}
                      {body.orbit_position ? `Orbit ${body.orbit_position} / ` : ""}
                      {body.celestial_body_type} / {[body.planet_class, body.planet_subclass].filter(Boolean).join(" / ") || "System Feature"}
                    </p>
                    <p className="mt-1 truncate text-xs text-cyan-200/80">
                      {body.is_starting_body ? "Starting World / " : ""}
                      {body.uses_orbital_gameplay ? "Orbital World / Atmospheric Harvesting / " : ""}
                      {body.landable ? "Landable" : "Not Landable"} / Locked until {body.unlock_requirement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-200" />
            <h2 className="text-lg font-semibold text-white">Generation Pipeline</h2>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {["Universe Seed", "Galaxy Seed", "Sector Seeds", "Star System Seeds", "Celestial Body Seeds"].map((step, index) => (
              <div key={step} className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Step {index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            <h2 className="text-lg font-semibold text-white">Developer Seeds</h2>
          </div>
          <div className="mt-4 grid gap-2 lg:grid-cols-2">
            <SeedRow label="Universe Seed" value={universe.universe_seed} />
            <SeedRow label="Galaxy Seed" value={galaxy.galaxy_seed} />
            <SeedRow label="Sector Seed" value={selectedSector.sector_seed} />
            <SeedRow label="System Seed" value={selectedSystem.system_seed} />
            {systemBodies[0] ? <SeedRow label="First Body Seed" value={`${selectedSystem.system_seed}:${systemBodies[0].id}`} /> : null}
            {systemBodies[0]?.is_procedural ? <SeedRow label="First Body Class Seed" value={planetSubSeeds(`${selectedSystem.system_seed}:${systemBodies[0].id}`).class} /> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
