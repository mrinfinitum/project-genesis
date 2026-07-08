"use client";

import { useMemo, useState } from "react";
import { ChevronRight, CirclePlus, Eye, Orbit, Plus, Search, Sparkles, Star, Trash2, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_UNIVERSE_SEED } from "@/lib/universe/fallback-data";
import {
  generateCelestialBodies,
  generateGalaxy,
  generateSectors,
  generateStarSystems,
  generateUniverse,
  type CelestialBodyNode,
  type GalaxyNode,
  type SectorNode,
  type StarSystemNode
} from "@/lib/universe/generator";
import { cn } from "@/lib/utils";

type BodyCardState = CelestialBodyNode;

type StarSystemCardState = {
  system: StarSystemNode;
  bodies: BodyCardState[];
};

type SectorCardState = {
  sector: SectorNode;
  systems: StarSystemCardState[];
};

type GalaxyCardState = {
  galaxy: GalaxyNode;
  sectors: SectorCardState[];
};

const galaxyTypes = ["Any", "Spiral Galaxy", "Elliptical Galaxy", "Ring Galaxy", "Barred Spiral", "Irregular Galaxy", "Ancient Galaxy", "Nebula Cluster", "Void Galaxy", "Artificial Galaxy", "Harmony Galaxy"];
const galaxySizes = ["Any", "Small", "Medium", "Large"];
const sectorTypes = ["Any", "Core Worlds", "Civilized Space", "Outer Rim", "Ancient Expanse", "Nebula", "Frontier", "Deep Space", "Void Region", "Harmony Region", "Uncharted Space"];
const rarityOptions = ["Any", "Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic", "Relic", "Genesis"];
const starCountRules = ["Generated", "Single Star", "Binary", "Trinary"];

const rarityClasses: Record<string, string> = {
  Common: "border-white/40 text-white",
  Uncommon: "border-[#2ECC71]/70 text-[#2ECC71]",
  Rare: "border-[#3498DB]/70 text-[#3498DB]",
  Epic: "border-[#9B59B6]/80 text-[#9B59B6]",
  Legendary: "border-[#F39C12]/80 text-[#F39C12]",
  Mythic: "border-[#E74C3C]/80 text-[#E74C3C]",
  Relic: "border-[#FF3CAC]/80 text-[#FF3CAC]",
  Genesis: "border-[#FFD700]/90 text-[#FFD700]"
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function optionValue(value: string) {
  return value === "Any" || value === "Generated" ? null : value;
}

function applyGalaxyBias(galaxy: GalaxyNode, type: string, size: string): GalaxyNode {
  const nextSize = optionValue(size);

  return {
    ...galaxy,
    galaxy_type: optionValue(type) ?? galaxy.galaxy_type,
    galaxy_size: nextSize ?? galaxy.galaxy_size,
    sector_count: nextSize === "Small" ? 1000 : nextSize === "Medium" ? 5000 : nextSize === "Large" ? 20000 : galaxy.sector_count
  };
}

function applySectorBias(sector: SectorNode, sectorType: string, rarity: string): SectorNode {
  return {
    ...sector,
    sector_type: optionValue(sectorType) ?? sector.sector_type,
    sector_rarity: optionValue(rarity) ?? sector.sector_rarity
  };
}

function applySystemBias(system: StarSystemNode, rarity: string, starRule: string): StarSystemNode {
  const starCount = starRule === "Single Star" ? 1 : starRule === "Binary" ? 2 : starRule === "Trinary" ? 3 : system.star_count;

  return {
    ...system,
    system_rarity: optionValue(rarity) ?? system.system_rarity,
    star_count: starCount
  };
}

function toSystemState(system: StarSystemNode): StarSystemCardState {
  return { system, bodies: [] };
}

function toSectorState(sector: SectorNode): SectorCardState {
  return { sector, systems: [] };
}

function toGalaxyState(galaxy: GalaxyNode): GalaxyCardState {
  return { galaxy, sectors: [] };
}

function galaxyVisual(galaxy: GalaxyNode) {
  if (galaxy.galaxy_type.includes("Void")) return "from-fuchsia-950 via-slate-950 to-black";
  if (galaxy.galaxy_type.includes("Ancient")) return "from-amber-900/50 via-slate-950 to-black";
  if (galaxy.galaxy_type.includes("Artificial")) return "from-cyan-950 via-slate-950 to-black";
  if (galaxy.galaxy_type.includes("Harmony")) return "from-emerald-950 via-slate-950 to-black";
  return "from-cyan-950 via-indigo-950 to-black";
}

function sectorVisual(sector: SectorNode) {
  if (sector.sector_type.includes("Void")) return "from-fuchsia-950 via-slate-950 to-black";
  if (sector.sector_type.includes("Ancient")) return "from-amber-950 via-slate-950 to-black";
  if (sector.sector_type.includes("Nebula")) return "from-purple-950 via-indigo-950 to-black";
  if (sector.sector_type.includes("Civilized")) return "from-cyan-950 via-slate-950 to-black";
  return "from-sky-950 via-slate-950 to-black";
}

function systemVisual(system: StarSystemNode) {
  if (system.star_type.includes("Red")) return "from-red-950 via-slate-950 to-black";
  if (system.star_type.includes("Blue")) return "from-blue-950 via-slate-950 to-black";
  if (system.star_type.includes("White")) return "from-slate-700 via-slate-950 to-black";
  if (system.star_type.includes("Black Hole")) return "from-purple-950 via-black to-black";
  return "from-amber-950 via-slate-950 to-black";
}

function bodyVisual(body: CelestialBodyNode) {
  if (body.planet_class === "Gas Giant") return "from-emerald-950 via-slate-950 to-black";
  if (body.planet_class === "Lava") return "from-orange-950 via-slate-950 to-black";
  if (body.planet_class === "Ice") return "from-cyan-950 via-slate-950 to-black";
  if (body.celestial_body_type === "Moon") return "from-slate-700 via-slate-950 to-black";
  return "from-cyan-950 via-slate-950 to-black";
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em]", className)}>
      {children}
    </span>
  );
}

function StatChip({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="min-w-0 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-semibold text-slate-100", tone)}>{value}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  min?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/65"
      />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-300/65"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-cyan-300/60" /> : null}
          <span className={index === items.length - 1 ? "text-cyan-100" : ""}>{item}</span>
        </span>
      ))}
    </div>
  );
}

function GeneratorShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
        <h1 className="mt-3 text-5xl font-bold text-white">{title}</h1>
        <p className="mt-3 max-w-5xl text-lg text-slate-300">{description}</p>
      </section>
      {children}
    </div>
  );
}

function GeneratorPanel({ children }: { children: React.ReactNode }) {
  return <section className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">{children}</section>;
}

function DeleteButton({ label, onDelete }: { label: string; onDelete: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onDelete();
      }}
      className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-md border border-red-300/25 bg-slate-950/70 text-red-100 transition hover:border-red-300/70 hover:bg-red-500/20"
      aria-label={`Delete ${label}`}
      title={`Delete ${label}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function CardImage({ variant, icon: Icon, label }: { variant: string; icon: React.ElementType; label: string }) {
  return (
    <div className={cn("relative h-56 overflow-hidden rounded-t-md bg-gradient-to-br", variant)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(103,232,249,0.35),transparent_12%),radial-gradient(circle_at_42%_56%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_60%_45%,rgba(147,51,234,0.25),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:34px_34px] opacity-70" />
      <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/25 bg-black/35 shadow-[0_0_45px_rgba(34,211,238,0.2)]">
        <Icon className="h-11 w-11 text-cyan-100/85" />
      </div>
      <p className="absolute bottom-4 left-5 text-[0.65rem] font-black uppercase tracking-[0.24em] text-cyan-100/75">{label}</p>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-6 text-sm font-semibold text-slate-400">{children}</div>;
}

function BodyCard({ body, onDelete }: { body: BodyCardState; onDelete: () => void }) {
  return (
    <article className="relative overflow-hidden rounded-md border border-cyan-300/15 bg-genesis-panel/95">
      <DeleteButton label={body.name} onDelete={onDelete} />
      <CardImage variant={bodyVisual(body)} icon={body.celestial_body_type === "Moon" ? Orbit : Star} label={body.celestial_body_type} />
      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{body.planet_class ?? body.celestial_body_type}</p>
          <h4 className="mt-2 truncate text-2xl font-bold text-white">{body.name}</h4>
          <p className="mt-1 truncate font-mono text-xs text-slate-500">
            {body.parent_body_id ? `Moon of ${body.orbit_parent}` : body.orbit_parent ? `Orbits ${body.orbit_parent}` : "Primary body"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatChip label="Subclass" value={body.planet_subclass ?? "None"} />
          <StatChip label="Rarity" value={body.planet_rarity ?? "Body"} tone={rarityClasses[body.planet_rarity ?? ""]?.split(" ")[1]} />
          <StatChip label="Biome" value={body.biome ?? "Unknown"} />
          <StatChip label="Gravity" value={body.gravity ?? "Unknown"} />
        </div>
        <div className="flex flex-wrap gap-2">
          {body.landable ? <Badge className="border-emerald-300/45 text-emerald-100">Landable</Badge> : <Badge className="border-amber-300/45 text-amber-100">Not Landable</Badge>}
          {body.uses_orbital_gameplay ? <Badge className="border-cyan-300/45 text-cyan-100">Orbital World</Badge> : null}
        </div>
      </div>
    </article>
  );
}

function StarSystemCard({
  card,
  open,
  onOpen,
  onGenerateBodies,
  onAddBody,
  onDelete,
  onDeleteBody
}: {
  card: StarSystemCardState;
  open: boolean;
  onOpen: () => void;
  onGenerateBodies: () => void;
  onAddBody: () => void;
  onDelete: () => void;
  onDeleteBody: (bodyId: string) => void;
}) {
  const { system, bodies } = card;
  const nonStarBodies = bodies.filter((body) => body.celestial_body_type !== "Star");
  const planetCount = nonStarBodies.filter((body) => body.celestial_body_type === "Planet").length;
  const beltCount = nonStarBodies.filter((body) => body.celestial_body_type === "Asteroid Belt").length;
  const gasGiants = nonStarBodies.filter((body) => body.planet_class === "Gas Giant").length;
  const habitableZone = system.starting_system ? "Known" : system.danger_level < 45 ? "Likely" : system.danger_level < 75 ? "Unstable" : "Hostile";
  const resourceValue = system.system_rarity === "Common" ? "Standard" : system.resource_bias;

  return (
    <article
      className={cn("relative cursor-pointer overflow-hidden rounded-md border bg-genesis-panel/95 transition hover:border-cyan-300/55 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)]", open ? "border-cyan-300/65" : "border-cyan-400/15")}
      onClick={onOpen}
    >
      <DeleteButton label={system.system_name} onDelete={onDelete} />
      <CardImage variant={systemVisual(system)} icon={Star} label="Star System" />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge className={rarityClasses[system.system_rarity] ?? "border-cyan-300/25 text-cyan-100"}>{system.system_rarity}</Badge>
          <Badge className="border-cyan-300/30 text-cyan-100">{system.discovery_state}</Badge>
          {system.starting_system ? <Badge className="border-emerald-300/45 text-emerald-100">Starting</Badge> : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{system.star_type}</p>
          <h3 className="mt-2 truncate text-3xl font-bold text-white">{system.system_name}</h3>
          <p className="mt-1 font-mono text-sm text-slate-500">{system.catalog_designation}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
          <StatChip label="Star Class" value={system.star_type} />
          <StatChip label="Planets" value={planetCount || system.planet_count} />
          <StatChip label="Belts" value={beltCount} />
          <StatChip label="Habitable Zone" value={habitableZone} />
          <StatChip label="Danger" value={system.danger_level} tone={system.danger_level > 70 ? "text-red-200" : "text-slate-100"} />
          <StatChip label="Resource Value" value={resourceValue} />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
          <Eye className="h-4 w-4" />
          Open / View System
        </div>
      </div>
      {open ? (
        <div className="space-y-4 border-t border-cyan-300/15 p-5" onClick={(event) => event.stopPropagation()}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumbs items={["Sector", system.system_name, "Celestial Bodies"]} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={onGenerateBodies}>
                <Sparkles className="h-4 w-4" />
                Generate Planets
              </Button>
              <Button type="button" onClick={onAddBody} className="border-slate-600 bg-slate-900/70 text-slate-100">
                <CirclePlus className="h-4 w-4" />
                Add Planet
              </Button>
            </div>
          </div>
          {nonStarBodies.length ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {nonStarBodies.map((body) => (
                <BodyCard key={body.id} body={body} onDelete={() => onDeleteBody(body.id)} />
              ))}
            </div>
          ) : (
            <EmptyState>No planets yet. Generate planets to populate this star system.</EmptyState>
          )}
          {gasGiants ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{gasGiants} orbital resource worlds detected.</p> : null}
        </div>
      ) : null}
    </article>
  );
}

function SectorCard({
  card,
  open,
  onOpen,
  onGenerateSystems,
  onAddSystem,
  onDelete,
  onDeleteSystem,
  onGenerateBodies,
  onAddBody,
  onDeleteBody,
  openSystemId,
  setOpenSystemId
}: {
  card: SectorCardState;
  open: boolean;
  onOpen: () => void;
  onGenerateSystems: () => void;
  onAddSystem: () => void;
  onDelete: () => void;
  onDeleteSystem: (systemId: string) => void;
  onGenerateBodies: (systemId: string) => void;
  onAddBody: (systemId: string) => void;
  onDeleteBody: (systemId: string, bodyId: string) => void;
  openSystemId: string | null;
  setOpenSystemId: (systemId: string | null) => void;
}) {
  const { sector, systems } = card;
  const discoveryState = sector.discovered ? "Discovered" : sector.discovery_level;

  return (
    <article
      className={cn("relative cursor-pointer overflow-hidden rounded-md border bg-genesis-panel/95 transition hover:border-cyan-300/55 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)]", open ? "border-cyan-300/65" : "border-cyan-400/15")}
      onClick={onOpen}
    >
      <DeleteButton label={sector.sector_name} onDelete={onDelete} />
      <CardImage variant={sectorVisual(sector)} icon={Waypoints} label="Sector" />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge className={rarityClasses[sector.sector_rarity] ?? "border-cyan-300/25 text-cyan-100"}>{sector.sector_rarity}</Badge>
          <Badge className="border-cyan-300/25 text-cyan-100">{discoveryState}</Badge>
          <Badge className="border-emerald-300/35 text-emerald-100">Ready</Badge>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{sector.sector_type}</p>
          <h3 className="mt-2 truncate text-3xl font-bold text-white">{sector.sector_name}</h3>
          <p className="mt-1 font-mono text-sm text-slate-500">{sector.sector_seed}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
          <StatChip label="Coordinates" value={`${sector.coordinates_x}, ${sector.coordinates_y}, ${sector.coordinates_z}`} />
          <StatChip label="Difficulty" value={sector.difficulty} tone={sector.difficulty > 70 ? "text-red-200" : "text-slate-100"} />
          <StatChip label="Systems" value={systems.length || sector.system_count} />
          <StatChip label="Resource Bias" value={sector.resource_signal} />
          <StatChip label="Discovery Value" value={formatNumber(sector.discovery_value)} />
          <StatChip label="Modifier" value={sector.modifier} />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
          <Eye className="h-4 w-4" />
          Open / View Sector
        </div>
      </div>
      {open ? (
        <div className="space-y-4 border-t border-cyan-300/15 p-5" onClick={(event) => event.stopPropagation()}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumbs items={["Galaxy", sector.sector_name, "Star Systems"]} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={onGenerateSystems}>
                <Sparkles className="h-4 w-4" />
                Generate Star Systems
              </Button>
              <Button type="button" onClick={onAddSystem} className="border-slate-600 bg-slate-900/70 text-slate-100">
                <CirclePlus className="h-4 w-4" />
                Add Star System
              </Button>
            </div>
          </div>
          {systems.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {systems.map((systemCard) => (
                <StarSystemCard
                  key={systemCard.system.id}
                  card={systemCard}
                  open={openSystemId === systemCard.system.id}
                  onOpen={() => setOpenSystemId(openSystemId === systemCard.system.id ? null : systemCard.system.id)}
                  onDelete={() => onDeleteSystem(systemCard.system.id)}
                  onGenerateBodies={() => onGenerateBodies(systemCard.system.id)}
                  onAddBody={() => onAddBody(systemCard.system.id)}
                  onDeleteBody={(bodyId) => onDeleteBody(systemCard.system.id, bodyId)}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No star systems yet. Generate star systems to populate this sector.</EmptyState>
          )}
        </div>
      ) : null}
    </article>
  );
}

function GalaxyCard({
  card,
  open,
  onOpen,
  onGenerateSectors,
  onAddSector,
  onDelete,
  onDeleteSector,
  onGenerateSystems,
  onAddSystem,
  onDeleteSystem,
  onGenerateBodies,
  onAddBody,
  onDeleteBody,
  openSectorId,
  setOpenSectorId,
  openSystemId,
  setOpenSystemId
}: {
  card: GalaxyCardState;
  open: boolean;
  onOpen: () => void;
  onGenerateSectors: () => void;
  onAddSector: () => void;
  onDelete: () => void;
  onDeleteSector: (sectorId: string) => void;
  onGenerateSystems: (sectorId: string) => void;
  onAddSystem: (sectorId: string) => void;
  onDeleteSystem: (sectorId: string, systemId: string) => void;
  onGenerateBodies: (sectorId: string, systemId: string) => void;
  onAddBody: (sectorId: string, systemId: string) => void;
  onDeleteBody: (sectorId: string, systemId: string, bodyId: string) => void;
  openSectorId: string | null;
  setOpenSectorId: (sectorId: string | null) => void;
  openSystemId: string | null;
  setOpenSystemId: (systemId: string | null) => void;
}) {
  const { galaxy, sectors } = card;
  const discovered = sectors.filter((sector) => sector.sector.discovered).length;
  const discoveryPercent = sectors.length ? Math.round((discovered / sectors.length) * 100) : 0;
  const avgSystems = sectors.length ? Math.round(sectors.reduce((total, sector) => total + (sector.systems.length || sector.sector.system_count), 0) / sectors.length) : 0;
  const estimatedSystems = avgSystems * galaxy.sector_count;
  const estimatedBodies = estimatedSystems * 7;
  const rarityBias = sectors.find((sector) => ["Genesis", "Relic", "Mythic"].includes(sector.sector.sector_rarity))?.sector.sector_rarity ?? galaxy.galaxy_type;

  return (
    <article
      className={cn("relative cursor-pointer overflow-hidden rounded-md border bg-genesis-panel/95 transition hover:border-cyan-300/55 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)]", open ? "border-cyan-300/65" : "border-cyan-400/15")}
      onClick={onOpen}
    >
      <DeleteButton label={galaxy.name} onDelete={onDelete} />
      <CardImage variant={galaxyVisual(galaxy)} icon={LayersIcon} label="Galaxy" />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge className="border-cyan-300/35 text-cyan-100">{galaxy.galaxy_type}</Badge>
          <Badge className="border-emerald-300/35 text-emerald-100">Ready</Badge>
          {galaxy.is_fixed ? <Badge className="border-amber-300/45 text-amber-100">Starting</Badge> : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{galaxy.galaxy_size}</p>
          <h3 className="mt-2 truncate text-3xl font-bold text-white">{galaxy.name}</h3>
          <p className="mt-1 font-mono text-sm text-slate-500">{galaxy.galaxy_seed}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          <StatChip label="Rarity Bias" value={rarityBias} />
          <StatChip label="Discovery" value={`${discoveryPercent}%`} tone="text-cyan-200" />
          <StatChip label="Starting Sector" value={sectors[0]?.sector.sector_name ?? "None"} />
          <StatChip label="Sector Count" value={formatNumber(galaxy.sector_count)} />
          <StatChip label="Star Systems Est." value={estimatedSystems ? formatNumber(estimatedSystems) : "Pending"} />
          <StatChip label="Bodies Est." value={estimatedBodies ? formatNumber(estimatedBodies) : "Pending"} />
          <StatChip label="Generated Sectors" value={sectors.length} />
          <StatChip label="Generated Systems" value={sectors.reduce((total, sector) => total + sector.systems.length, 0)} />
        </div>
        {sectors.length ? (
          <div className="flex flex-wrap gap-2">
            {sectors.slice(0, 5).map((sector) => (
              <span key={sector.sector.id} className="rounded-md border border-cyan-300/15 bg-slate-950/45 px-2 py-1 text-xs font-semibold text-slate-300">
                {sector.sector.sector_name}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
          <Eye className="h-4 w-4" />
          Open / View Galaxy
        </div>
      </div>
      {open ? (
        <div className="space-y-4 border-t border-cyan-300/15 p-5" onClick={(event) => event.stopPropagation()}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumbs items={["Universe", galaxy.name, "Sectors"]} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={onGenerateSectors}>
                <Sparkles className="h-4 w-4" />
                Generate Sectors
              </Button>
              <Button type="button" onClick={onAddSector} className="border-slate-600 bg-slate-900/70 text-slate-100">
                <CirclePlus className="h-4 w-4" />
                Add Sector
              </Button>
            </div>
          </div>
          {sectors.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {sectors.map((sectorCard) => (
                <SectorCard
                  key={sectorCard.sector.id}
                  card={sectorCard}
                  open={openSectorId === sectorCard.sector.id}
                  onOpen={() => setOpenSectorId(openSectorId === sectorCard.sector.id ? null : sectorCard.sector.id)}
                  onDelete={() => onDeleteSector(sectorCard.sector.id)}
                  onGenerateSystems={() => onGenerateSystems(sectorCard.sector.id)}
                  onAddSystem={() => onAddSystem(sectorCard.sector.id)}
                  onDeleteSystem={(systemId) => onDeleteSystem(sectorCard.sector.id, systemId)}
                  onGenerateBodies={(systemId) => onGenerateBodies(sectorCard.sector.id, systemId)}
                  onAddBody={(systemId) => onAddBody(sectorCard.sector.id, systemId)}
                  onDeleteBody={(systemId, bodyId) => onDeleteBody(sectorCard.sector.id, systemId, bodyId)}
                  openSystemId={openSystemId}
                  setOpenSystemId={setOpenSystemId}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No sectors yet. Generate sectors to populate this galaxy.</EmptyState>
          )}
        </div>
      ) : null}
    </article>
  );
}

function LayersIcon(props: React.ComponentProps<typeof Waypoints>) {
  return <Waypoints {...props} />;
}

export function GalaxyGeneratorWorkflow() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [count, setCount] = useState(2);
  const [type, setType] = useState("Any");
  const [size, setSize] = useState("Any");
  const [galaxies, setGalaxies] = useState<GalaxyCardState[]>([]);
  const [openGalaxyId, setOpenGalaxyId] = useState<string | null>(null);
  const [openSectorId, setOpenSectorId] = useState<string | null>(null);
  const [openSystemId, setOpenSystemId] = useState<string | null>(null);
  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);

  function generateGalaxyCards() {
    const next = Array.from({ length: Math.max(1, count) }, (_, index) => {
      const galaxy = generateGalaxy(universe.universe_seed, index);
      return toGalaxyState(galaxy.is_fixed ? galaxy : applyGalaxyBias(galaxy, type, size));
    });
    setGalaxies(next);
    setOpenGalaxyId(next[0]?.galaxy.id ?? null);
    setOpenSectorId(null);
    setOpenSystemId(null);
  }

  function updateGalaxy(galaxyId: string, updater: (card: GalaxyCardState) => GalaxyCardState) {
    setGalaxies((current) => current.map((card) => (card.galaxy.id === galaxyId ? updater(card) : card)));
  }

  function generateSectorsForGalaxy(galaxyId: string, append = false) {
    updateGalaxy(galaxyId, (card) => {
      const startIndex = append ? card.sectors.length : 0;
      const generated = generateSectors(card.galaxy, Math.min(card.galaxy.sector_count, startIndex + 6)).slice(startIndex, startIndex + 6).map(toSectorState);
      return { ...card, sectors: append ? [...card.sectors, ...generated] : generated };
    });
  }

  function generateSystemsForSector(galaxyId: string, sectorId: string, append = false) {
    updateGalaxy(galaxyId, (galaxyCard) => ({
      ...galaxyCard,
      sectors: galaxyCard.sectors.map((sectorCard) => {
        if (sectorCard.sector.id !== sectorId) return sectorCard;
        const startIndex = append ? sectorCard.systems.length : 0;
        const generated = generateStarSystems(sectorCard.sector, Math.min(sectorCard.sector.system_count, startIndex + 6)).slice(startIndex, startIndex + 6).map(toSystemState);
        return { ...sectorCard, systems: append ? [...sectorCard.systems, ...generated] : generated };
      })
    }));
  }

  function generateBodiesForSystem(galaxyId: string, sectorId: string, systemId: string, append = false) {
    updateGalaxy(galaxyId, (galaxyCard) => ({
      ...galaxyCard,
      sectors: galaxyCard.sectors.map((sectorCard) => ({
        ...sectorCard,
        systems: sectorCard.sector.id === sectorId
          ? sectorCard.systems.map((systemCard) => {
              if (systemCard.system.id !== systemId) return systemCard;
              const bodies = generateCelestialBodies(systemCard.system).filter((body) => body.celestial_body_type !== "Star");
              return { ...systemCard, bodies: append ? [...systemCard.bodies, ...bodies.slice(systemCard.bodies.length, systemCard.bodies.length + 1)] : bodies };
            })
          : sectorCard.systems
      }))
    }));
  }

  function deleteGalaxy(galaxyId: string) {
    const galaxy = galaxies.find((card) => card.galaxy.id === galaxyId);
    if (!galaxy || !window.confirm(`Delete ${galaxy.galaxy.name} and all generated sectors/star systems inside it?`)) return;
    setGalaxies((current) => current.filter((card) => card.galaxy.id !== galaxyId));
  }

  function deleteSector(galaxyId: string, sectorId: string) {
    const galaxy = galaxies.find((card) => card.galaxy.id === galaxyId);
    const sector = galaxy?.sectors.find((card) => card.sector.id === sectorId);
    if (!sector || !window.confirm(`Delete ${sector.sector.sector_name} and all generated star systems inside it?`)) return;
    updateGalaxy(galaxyId, (card) => ({ ...card, sectors: card.sectors.filter((item) => item.sector.id !== sectorId) }));
  }

  function deleteSystem(galaxyId: string, sectorId: string, systemId: string) {
    const galaxy = galaxies.find((card) => card.galaxy.id === galaxyId);
    const sector = galaxy?.sectors.find((card) => card.sector.id === sectorId);
    const system = sector?.systems.find((card) => card.system.id === systemId);
    if (!system || !window.confirm(`Delete ${system.system.system_name} and all generated planets/bodies inside it?`)) return;
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((item) => (item.sector.id === sectorId ? { ...item, systems: item.systems.filter((systemCard) => systemCard.system.id !== systemId) } : item))
    }));
  }

  function deleteBody(galaxyId: string, sectorId: string, systemId: string, bodyId: string) {
    updateGalaxy(galaxyId, (card) => ({
      ...card,
      sectors: card.sectors.map((sector) => ({
        ...sector,
        systems: sector.sector.id === sectorId
          ? sector.systems.map((system) => (system.system.id === systemId ? { ...system, bodies: system.bodies.filter((body) => body.id !== bodyId) } : system))
          : sector.systems
      }))
    }));
  }

  return (
    <GeneratorShell eyebrow="Universe Workflow" title="Galaxy Generator" description="Generate visual galaxy cards, drill into sectors, and shape the content hierarchy before it moves into the game app.">
      <GeneratorPanel>
        <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_9rem_13rem_12rem_auto] lg:items-end">
          <TextInput label="Universe Seed" value={universeSeed} onChange={setUniverseSeed} placeholder="PROJECT-GENESIS-UNIVERSE" />
          <TextInput label="Galaxy Count" value={count} onChange={(value) => setCount(Math.max(1, Number(value) || 1))} type="number" min={1} />
          <SelectInput label="Galaxy Type" value={type} options={galaxyTypes} onChange={setType} />
          <SelectInput label="Galaxy Size" value={size} options={galaxySizes} onChange={setSize} />
          <Button type="button" onClick={generateGalaxyCards} className="h-11 px-5">
            <Plus className="h-4 w-4" />
            Generate Galaxies
          </Button>
        </div>
      </GeneratorPanel>

      {galaxies.length ? (
        <section className="grid gap-5 2xl:grid-cols-2">
          {galaxies.map((card) => (
            <GalaxyCard
              key={card.galaxy.id}
              card={card}
              open={openGalaxyId === card.galaxy.id}
              onOpen={() => setOpenGalaxyId(openGalaxyId === card.galaxy.id ? null : card.galaxy.id)}
              onDelete={() => deleteGalaxy(card.galaxy.id)}
              onGenerateSectors={() => generateSectorsForGalaxy(card.galaxy.id)}
              onAddSector={() => generateSectorsForGalaxy(card.galaxy.id, true)}
              onDeleteSector={(sectorId) => deleteSector(card.galaxy.id, sectorId)}
              onGenerateSystems={(sectorId) => generateSystemsForSector(card.galaxy.id, sectorId)}
              onAddSystem={(sectorId) => generateSystemsForSector(card.galaxy.id, sectorId, true)}
              onDeleteSystem={(sectorId, systemId) => deleteSystem(card.galaxy.id, sectorId, systemId)}
              onGenerateBodies={(sectorId, systemId) => generateBodiesForSystem(card.galaxy.id, sectorId, systemId)}
              onAddBody={(sectorId, systemId) => generateBodiesForSystem(card.galaxy.id, sectorId, systemId, true)}
              onDeleteBody={(sectorId, systemId, bodyId) => deleteBody(card.galaxy.id, sectorId, systemId, bodyId)}
              openSectorId={openSectorId}
              setOpenSectorId={setOpenSectorId}
              openSystemId={openSystemId}
              setOpenSystemId={setOpenSystemId}
            />
          ))}
        </section>
      ) : (
        <EmptyState>No galaxies yet. Generate galaxies to begin the universe hierarchy.</EmptyState>
      )}
    </GeneratorShell>
  );
}

export function SectorGeneratorWorkflow() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [galaxyIndex, setGalaxyIndex] = useState(0);
  const [count, setCount] = useState(8);
  const [sectorType, setSectorType] = useState("Any");
  const [rarity, setRarity] = useState("Any");
  const [cards, setCards] = useState<SectorCardState[]>([]);
  const [openSectorId, setOpenSectorId] = useState<string | null>(null);
  const [openSystemId, setOpenSystemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const galaxy = useMemo(() => generateGalaxy(universe.universe_seed, galaxyIndex), [galaxyIndex, universe.universe_seed]);

  function generateSectorCards() {
    const next = generateSectors(galaxy, Math.max(1, count)).map((sector) => toSectorState(sector.is_fixed ? sector : applySectorBias(sector, sectorType, rarity)));
    setCards(next);
    setOpenSectorId(next[0]?.sector.id ?? null);
    setOpenSystemId(null);
  }

  function updateSector(sectorId: string, updater: (card: SectorCardState) => SectorCardState) {
    setCards((current) => current.map((card) => (card.sector.id === sectorId ? updater(card) : card)));
  }

  function generateSystems(sectorId: string, append = false) {
    updateSector(sectorId, (card) => {
      const startIndex = append ? card.systems.length : 0;
      const generated = generateStarSystems(card.sector, Math.min(card.sector.system_count, startIndex + 6)).slice(startIndex, startIndex + 6).map(toSystemState);
      return { ...card, systems: append ? [...card.systems, ...generated] : generated };
    });
  }

  function generateBodies(sectorId: string, systemId: string, append = false) {
    updateSector(sectorId, (sectorCard) => ({
      ...sectorCard,
      systems: sectorCard.systems.map((systemCard) => {
        if (systemCard.system.id !== systemId) return systemCard;
        const bodies = generateCelestialBodies(systemCard.system).filter((body) => body.celestial_body_type !== "Star");
        return { ...systemCard, bodies: append ? [...systemCard.bodies, ...bodies.slice(systemCard.bodies.length, systemCard.bodies.length + 1)] : bodies };
      })
    }));
  }

  const visibleCards = cards.filter((card) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [card.sector.sector_name, card.sector.sector_type, card.sector.resource_signal, card.sector.modifier].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <GeneratorShell eyebrow="Universe Workflow" title="Sector Generator" description="Generate sector cards, drill into their star systems, and curate what belongs in the selected galaxy.">
      <GeneratorPanel>
        <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_9rem_9rem_13rem_11rem_auto] lg:items-end">
          <TextInput label="Universe Seed" value={universeSeed} onChange={setUniverseSeed} placeholder="PROJECT-GENESIS-UNIVERSE" />
          <TextInput label="Galaxy" value={galaxyIndex} onChange={(value) => setGalaxyIndex(Math.max(0, Number(value) || 0))} type="number" min={0} />
          <TextInput label="Sectors" value={count} onChange={(value) => setCount(Math.max(1, Number(value) || 1))} type="number" min={1} />
          <SelectInput label="Sector Bias" value={sectorType} options={sectorTypes} onChange={setSectorType} />
          <SelectInput label="Rarity Bias" value={rarity} options={rarityOptions} onChange={setRarity} />
          <Button type="button" onClick={generateSectorCards} className="h-11 px-5">
            <Plus className="h-4 w-4" />
            Generate Sectors
          </Button>
        </div>
      </GeneratorPanel>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-14 w-full rounded-md border border-cyan-300/15 bg-genesis-panel/90 pl-12 pr-4 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
          placeholder={`Search sectors in ${galaxy.name}`}
        />
      </div>

      {visibleCards.length ? (
        <section className="grid gap-5 2xl:grid-cols-2">
          {visibleCards.map((card) => (
            <SectorCard
              key={card.sector.id}
              card={card}
              open={openSectorId === card.sector.id}
              onOpen={() => setOpenSectorId(openSectorId === card.sector.id ? null : card.sector.id)}
              onDelete={() => {
                if (window.confirm(`Delete ${card.sector.sector_name} and all generated star systems inside it?`)) {
                  setCards((current) => current.filter((item) => item.sector.id !== card.sector.id));
                }
              }}
              onGenerateSystems={() => generateSystems(card.sector.id)}
              onAddSystem={() => generateSystems(card.sector.id, true)}
              onDeleteSystem={(systemId) => {
                const system = card.systems.find((item) => item.system.id === systemId);
                if (!system || !window.confirm(`Delete ${system.system.system_name} and all generated planets/bodies inside it?`)) return;
                updateSector(card.sector.id, (sectorCard) => ({ ...sectorCard, systems: sectorCard.systems.filter((item) => item.system.id !== systemId) }));
              }}
              onGenerateBodies={(systemId) => generateBodies(card.sector.id, systemId)}
              onAddBody={(systemId) => generateBodies(card.sector.id, systemId, true)}
              onDeleteBody={(systemId, bodyId) =>
                updateSector(card.sector.id, (sectorCard) => ({
                  ...sectorCard,
                  systems: sectorCard.systems.map((system) => (system.system.id === systemId ? { ...system, bodies: system.bodies.filter((body) => body.id !== bodyId) } : system))
                }))
              }
              openSystemId={openSystemId}
              setOpenSystemId={setOpenSystemId}
            />
          ))}
        </section>
      ) : (
        <EmptyState>No sectors yet. Generate sectors to populate this galaxy.</EmptyState>
      )}
    </GeneratorShell>
  );
}

export function StarSystemGeneratorWorkflow() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [galaxyIndex, setGalaxyIndex] = useState(0);
  const [sectorIndex, setSectorIndex] = useState(0);
  const [count, setCount] = useState(8);
  const [rarity, setRarity] = useState("Any");
  const [starRule, setStarRule] = useState("Generated");
  const [cards, setCards] = useState<StarSystemCardState[]>([]);
  const [openSystemId, setOpenSystemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const galaxy = useMemo(() => generateGalaxy(universe.universe_seed, galaxyIndex), [galaxyIndex, universe.universe_seed]);
  const sector = useMemo(() => generateSectors(galaxy, Math.max(sectorIndex + 1, 1))[sectorIndex] ?? generateSectors(galaxy, 1)[0], [galaxy, sectorIndex]);

  function generateSystemCards() {
    const next = generateStarSystems(sector, Math.max(1, count)).map((system) => toSystemState(system.is_fixed ? system : applySystemBias(system, rarity, starRule)));
    setCards(next);
    setOpenSystemId(next[0]?.system.id ?? null);
  }

  function updateSystem(systemId: string, updater: (card: StarSystemCardState) => StarSystemCardState) {
    setCards((current) => current.map((card) => (card.system.id === systemId ? updater(card) : card)));
  }

  function generateBodies(systemId: string, append = false) {
    updateSystem(systemId, (card) => {
      const bodies = generateCelestialBodies(card.system).filter((body) => body.celestial_body_type !== "Star");
      return { ...card, bodies: append ? [...card.bodies, ...bodies.slice(card.bodies.length, card.bodies.length + 1)] : bodies };
    });
  }

  const visibleCards = cards.filter((card) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [card.system.system_name, card.system.catalog_designation, card.system.system_rarity, card.system.star_type, card.system.resource_bias].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <GeneratorShell eyebrow="Universe Workflow" title="Star System Generator" description="Generate collectible star-system cards, then open them to populate planets, moons, belts, and orbital worlds.">
      <GeneratorPanel>
        <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_8rem_8rem_9rem_11rem_11rem_auto] lg:items-end">
          <TextInput label="Universe Seed" value={universeSeed} onChange={setUniverseSeed} placeholder="PROJECT-GENESIS-UNIVERSE" />
          <TextInput label="Galaxy" value={galaxyIndex} onChange={(value) => setGalaxyIndex(Math.max(0, Number(value) || 0))} type="number" min={0} />
          <TextInput label="Sector" value={sectorIndex} onChange={(value) => setSectorIndex(Math.max(0, Number(value) || 0))} type="number" min={0} />
          <TextInput label="Systems" value={count} onChange={(value) => setCount(Math.max(1, Number(value) || 1))} type="number" min={1} />
          <SelectInput label="Rarity Bias" value={rarity} options={rarityOptions} onChange={setRarity} />
          <SelectInput label="Star Rules" value={starRule} options={starCountRules} onChange={setStarRule} />
          <Button type="button" onClick={generateSystemCards} className="h-11 px-5">
            <Plus className="h-4 w-4" />
            Generate Star Systems
          </Button>
        </div>
      </GeneratorPanel>

      <div className="rounded-md border border-cyan-300/15 bg-slate-950/35 p-4">
        <Breadcrumbs items={["Universe", galaxy.name, sector.sector_name]} />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-14 w-full rounded-md border border-cyan-300/15 bg-genesis-panel/90 pl-12 pr-4 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
          placeholder={`Search star systems in ${sector.sector_name}`}
        />
      </div>

      {visibleCards.length ? (
        <section className="grid gap-5 2xl:grid-cols-2">
          {visibleCards.map((card) => (
            <StarSystemCard
              key={card.system.id}
              card={card}
              open={openSystemId === card.system.id}
              onOpen={() => setOpenSystemId(openSystemId === card.system.id ? null : card.system.id)}
              onDelete={() => {
                if (window.confirm(`Delete ${card.system.system_name} and all generated planets/bodies inside it?`)) {
                  setCards((current) => current.filter((item) => item.system.id !== card.system.id));
                }
              }}
              onGenerateBodies={() => generateBodies(card.system.id)}
              onAddBody={() => generateBodies(card.system.id, true)}
              onDeleteBody={(bodyId) => updateSystem(card.system.id, (systemCard) => ({ ...systemCard, bodies: systemCard.bodies.filter((body) => body.id !== bodyId) }))}
            />
          ))}
        </section>
      ) : (
        <EmptyState>No star systems yet. Generate star systems to populate this sector.</EmptyState>
      )}
    </GeneratorShell>
  );
}
