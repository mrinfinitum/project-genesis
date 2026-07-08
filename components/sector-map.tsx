"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Database, Radio, Radar, Rocket, Satellite, Search, ShieldAlert, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateGalaxy,
  generateSectors,
  generateStarSystems,
  generateUniverse,
  hashSeed,
  type DiscoveryState,
  type StarSystemNode
} from "@/lib/universe/generator";
import { DEFAULT_UNIVERSE_SEED } from "@/lib/universe/fallback-data";
import { cn } from "@/lib/utils";

const stateMeta: Record<DiscoveryState, { label: string; className: string; dot: string }> = {
  Undetected: {
    label: "Hidden",
    className: "border-slate-800 text-slate-600",
    dot: "bg-slate-700/30"
  },
  Detected: {
    label: "Unknown Signal",
    className: "border-slate-500/50 text-slate-300",
    dot: "bg-slate-300 shadow-[0_0_18px_rgba(226,232,240,0.35)]"
  },
  Probed: {
    label: "Probed",
    className: "border-blue-300/60 text-blue-200",
    dot: "bg-blue-300 shadow-[0_0_18px_rgba(147,197,253,0.45)]"
  },
  Scanned: {
    label: "Scanned",
    className: "border-violet-300/60 text-violet-200",
    dot: "bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.45)]"
  },
  Visited: {
    label: "Visited",
    className: "border-cyan-300/70 text-cyan-100",
    dot: "bg-cyan-300 shadow-[0_0_22px_rgba(103,232,249,0.55)]"
  },
  Surveyed: {
    label: "Surveyed",
    className: "border-emerald-300/70 text-emerald-100",
    dot: "bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,0.55)]"
  },
  Colonized: {
    label: "Colonized",
    className: "border-amber-300/80 text-amber-100",
    dot: "bg-amber-300 shadow-[0_0_26px_rgba(252,211,77,0.75)]"
  }
};

const stateOrder: DiscoveryState[] = ["Detected", "Probed", "Scanned", "Visited", "Surveyed", "Colonized"];

function systemPosition(system: StarSystemNode) {
  if (system.starting_system) {
    return { left: "50%", top: "50%" };
  }

  const hash = hashSeed(system.system_seed);
  const x = 8 + (hash % 84);
  const y = 10 + (Math.floor(hash / 97) % 80);
  return { left: `${x}%`, top: `${y}%` };
}

function visibleName(system: StarSystemNode) {
  if (system.discovery_state === "Detected") return "Unknown Signal";
  if (system.discovery_state === "Probed") return system.catalog_designation;
  return system.system_name;
}

function previewRows(system: StarSystemNode) {
  switch (system.discovery_state) {
    case "Detected":
      return [
        ["Signal", "Faint stellar anomaly"],
        ["Catalog", "Unassigned"],
        ["Next Action", "Launch Probe"]
      ];
    case "Probed":
      return [
        ["Catalog", system.catalog_designation],
        ["Star Signature", system.known_star_signature ?? "Rough spectral read"],
        ["Bodies", `${system.estimated_celestial_body_count_min}-${system.estimated_celestial_body_count_max}`],
        ["Danger", `~${system.estimated_danger_level ?? "Unknown"}`]
      ];
    case "Scanned":
      return [
        ["System", system.system_name],
        ["Stars", system.star_count],
        ["Bodies", system.planet_count],
        ["Rarity", system.system_rarity],
        ["Modifier", system.resource_bias]
      ];
    case "Visited":
    case "Surveyed":
    case "Colonized":
      return [
        ["System", system.system_name],
        ["Star Type", system.star_type ?? "Unknown"],
        ["Bodies", system.planet_count],
        ["Danger", system.danger_level],
        ["Status", stateMeta[system.discovery_state].label]
      ];
    default:
      return [];
  }
}

function actionFor(system: StarSystemNode) {
  if (system.discovery_state === "Detected") return "Launch Probe";
  if (system.discovery_state === "Probed") return "Run Spectral Scan";
  if (system.discovery_state === "Scanned") return "Dispatch Expedition";
  if (system.discovery_state === "Visited") return "Open System Map";
  if (system.discovery_state === "Surveyed") return "Review Survey";
  if (system.discovery_state === "Colonized") return "Manage System";
  return "Scan Sector";
}

export function SectorMap() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<DiscoveryState | "All">("All");
  const [selectedId, setSelectedId] = useState("system-sol");

  const universe = useMemo(() => generateUniverse(DEFAULT_UNIVERSE_SEED), []);
  const galaxy = useMemo(() => generateGalaxy(universe.universe_seed, 0), [universe.universe_seed]);
  const sector = useMemo(() => generateSectors(galaxy, 1)[0], [galaxy]);
  const systems = useMemo(() => generateStarSystems(sector, 24), [sector]);
  const visibleSystems = useMemo(
    () =>
      systems.filter((system) => {
        if (system.discovery_state === "Undetected") return false;
        if (stateFilter !== "All" && system.discovery_state !== stateFilter) return false;
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return [system.system_name, system.catalog_designation, system.discovery_state, system.star_type, system.system_rarity]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      }),
    [search, stateFilter, systems]
  );
  const selectedSystem = systems.find((system) => system.id === selectedId) ?? visibleSystems[0] ?? systems[0];

  async function copySectorExport() {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          universe,
          galaxy,
          sector,
          visible_systems: visibleSystems,
          selected_system: selectedSystem,
          discovery_flow: ["Undetected", "Detected", "Probed", "Scanned", "Visited", "Surveyed", "Colonized"]
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Universe Discovery</p>
          <h1 className="mt-3 text-5xl font-bold text-white">Sector Map</h1>
          <p className="mt-3 max-w-4xl text-lg text-slate-300">
            Discovery-state map for nearby star systems. Unknown systems stay hidden until a detector, probe, scan, or expedition reveals them.
          </p>
        </div>
        <Button type="button" onClick={copySectorExport}>
          <Database className="h-4 w-4" />
          Export Sector
        </Button>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="overflow-hidden rounded-md border border-cyan-400/15 bg-genesis-panel/90">
          <div className="flex flex-col gap-3 border-b border-cyan-400/15 p-4 lg:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-md border border-cyan-300/20 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
                placeholder="Search known signals"
              />
            </label>
            <select
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value as DiscoveryState | "All")}
              className="h-11 rounded-md border border-cyan-300/20 bg-slate-950/65 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
            >
              <option value="All">All visible states</option>
              {stateOrder.map((state) => (
                <option key={state} value={state}>
                  {stateMeta[state].label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative h-[40rem] overflow-hidden bg-[#030712]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_60%)]" />
            <div className="absolute left-4 top-4 rounded-md border border-cyan-300/15 bg-slate-950/75 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">
              {sector.sector_name}
            </div>

            {visibleSystems.map((system) => {
              const active = system.id === selectedSystem.id;
              const meta = stateMeta[system.discovery_state];
              const size = system.starting_system ? "h-6 w-6" : system.discovery_state === "Detected" ? "h-3 w-3" : "h-4 w-4";

              return (
                <button
                  key={system.id}
                  type="button"
                  onClick={() => setSelectedId(system.id)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 text-left"
                  style={systemPosition(system)}
                >
                  <span className={cn("block rounded-full border border-white/30", size, meta.dot, active && "ring-4 ring-cyan-300/30")} />
                  <span
                    className={cn(
                      "mt-2 hidden max-w-40 rounded-md border bg-slate-950/80 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] backdrop-blur group-hover:block",
                      active && "block",
                      meta.className
                    )}
                  >
                    {visibleName(system)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-md border border-cyan-400/15 bg-genesis-panel/95 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">System Preview</p>
              <h2 className="mt-2 text-3xl font-bold text-white">{visibleName(selectedSystem)}</h2>
              <p className="mt-1 font-mono text-sm text-slate-500">{selectedSystem.catalog_designation}</p>
            </div>
            <span className={cn("rounded-md border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]", stateMeta[selectedSystem.discovery_state].className)}>
              {stateMeta[selectedSystem.discovery_state].label}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {previewRows(selectedSystem).map(([label, value]) => (
              <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2">
            <Button type="button">
              {selectedSystem.discovery_state === "Detected" ? <Satellite className="h-4 w-4" /> : <Radar className="h-4 w-4" />}
              {actionFor(selectedSystem)}
            </Button>
            {["Visited", "Surveyed", "Colonized"].includes(selectedSystem.discovery_state) ? (
              <Link
                href="/star-system-map"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-900/70 px-3 text-sm font-medium text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/10"
              >
                <Rocket className="h-4 w-4" />
                Open Star System Map
              </Link>
            ) : null}
          </div>

          <div className="mt-6 space-y-3 border-t border-cyan-300/10 pt-5">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Radio className="h-4 w-4 text-cyan-200" />
              Probe flow: detect, probe, scan, visit, survey, colonize.
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ShieldAlert className="h-4 w-4 text-amber-200" />
              Danger is approximate until scan data is available.
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Activity className="h-4 w-4 text-emerald-200" />
              Sol is the fixed colonized home system.
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Star className="h-4 w-4 text-cyan-200" />
              Undetected systems are intentionally hidden from this map.
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
