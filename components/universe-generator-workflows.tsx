"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Database,
  Download,
  ExternalLink,
  Layers3,
  Orbit,
  Plus,
  RadioTower,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Waypoints
} from "lucide-react";
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

const galaxyTypes = ["Any", "Spiral Galaxy", "Elliptical Galaxy", "Ring Galaxy", "Barred Spiral", "Irregular Galaxy", "Ancient Galaxy", "Nebula Cluster", "Void Galaxy", "Artificial Galaxy", "Harmony Galaxy"];
const galaxySizes = ["Any", "Small", "Medium", "Large", "Starting Galaxy"];
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

async function copyJson(value: unknown) {
  await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
}

function exportJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em]", className)}>
      {children}
    </span>
  );
}

function Spec({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="min-w-0 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
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

function SelectInput({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
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

function ToggleInput({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex h-full min-h-11 items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/45 px-3">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-cyan-300" />
      <span className="text-sm font-semibold text-slate-200">{label}</span>
    </label>
  );
}

function ValidationBadge({ status }: { status: "Ready" | "Review" | "Blocked" }) {
  const className =
    status === "Ready"
      ? "border-emerald-300/50 text-emerald-100"
      : status === "Review"
        ? "border-amber-300/55 text-amber-100"
        : "border-red-300/60 text-red-100";

  return (
    <Badge className={className}>
      {status === "Ready" ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />}
      {status}
    </Badge>
  );
}

function ActionButton({ icon: Icon, children, onClick }: { icon: React.ElementType; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-cyan-300/20 bg-slate-950/35 px-3 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
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

function GeneratorShell({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
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

function systemBodyStats(system: StarSystemNode) {
  const bodies = generateCelestialBodies(system);
  const nonStarBodies = bodies.filter((body) => body.celestial_body_type !== "Star");
  return {
    bodies,
    nonStarBodies,
    planets: nonStarBodies.filter((body) => body.celestial_body_type === "Planet").length,
    moons: nonStarBodies.filter((body) => body.celestial_body_type === "Moon").length,
    belts: nonStarBodies.filter((body) => body.celestial_body_type === "Asteroid Belt").length,
    gasGiants: nonStarBodies.filter((body) => body.planet_class === "Gas Giant").length
  };
}

function statusForGalaxy(galaxy: GalaxyNode, sectors: SectorNode[]) {
  if (!galaxy.name || !galaxy.galaxy_seed) return "Blocked";
  if (!sectors.length || galaxy.sector_count < sectors.length) return "Review";
  return "Ready";
}

function statusForSector(sector: SectorNode, systems: StarSystemNode[]) {
  if (!sector.sector_name || !sector.sector_seed) return "Blocked";
  if (!systems.length || sector.discovery_level === "Unknown") return "Review";
  return "Ready";
}

function statusForSystem(system: StarSystemNode, bodies: CelestialBodyNode[]) {
  if (!system.system_name || !system.system_seed) return "Blocked";
  if (!bodies.length || system.discovery_state === "Undetected") return "Review";
  return "Ready";
}

function BodyCard({ body }: { body: CelestialBodyNode }) {
  const isGasGiant = body.planet_class === "Gas Giant";
  const relation = body.celestial_body_type === "Moon" && body.orbit_parent ? `Moon of ${body.orbit_parent}` : body.orbit_parent ? `Orbits ${body.orbit_parent}` : "Primary body";
  const payload = { body, prompt_rules: { show_orbit_prompt: true, show_landscape_prompt: body.landable && !isGasGiant } };

  return (
    <article className="rounded-md border border-cyan-300/12 bg-slate-950/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{body.celestial_body_type}</p>
          <h4 className="mt-2 truncate text-xl font-bold text-white">{body.name}</h4>
          <p className="mt-1 truncate text-xs text-slate-500">{relation}</p>
        </div>
        <Badge className={rarityClasses[body.planet_rarity ?? ""] ?? "border-cyan-300/25 text-cyan-100"}>{body.planet_rarity ?? "Body"}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Spec label="Class" value={body.planet_class ?? body.celestial_body_type} />
        <Spec label="Subclass" value={body.planet_subclass ?? "None"} />
        <Spec label="Biome" value={body.biome ?? "Unknown"} />
        <Spec label="Gravity" value={body.gravity ?? "Unknown"} />
        <Spec label="Landable" value={body.landable ? "Yes" : "No"} tone={body.landable ? "text-emerald-100" : "text-amber-100"} />
        <Spec label="Artwork" value={body.is_fixed ? "Placeholder" : "Generated"} />
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">{body.notes}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {body.resources.slice(0, 5).map((resource) => (
          <span key={resource} className="rounded-md border border-cyan-300/15 bg-slate-950/55 px-2 py-1 text-xs font-semibold text-slate-300">
            {resource}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton icon={Copy} onClick={() => copyJson(payload)}>
          Full Planet Prompt
        </ActionButton>
        {body.landable && !isGasGiant ? (
          <ActionButton icon={Copy} onClick={() => copyJson({ ...payload, prompt_type: "Surface Landscape" })}>
            Landscape Prompt
          </ActionButton>
        ) : null}
        {isGasGiant ? (
          <Badge className="border-cyan-300/35 text-cyan-100">
            <RadioTower className="mr-1.5 h-3.5 w-3.5" />
            Orbital World
          </Badge>
        ) : null}
      </div>
    </article>
  );
}

function StarSystemCard({
  system,
  open,
  onOpen,
  showBodies = true
}: {
  system: StarSystemNode;
  open: boolean;
  onOpen: () => void;
  showBodies?: boolean;
}) {
  const stats = systemBodyStats(system);
  const validation = statusForSystem(system, stats.bodies);
  const payload = { star_system: system, celestial_bodies: stats.bodies };

  return (
    <article className={cn("rounded-md border bg-genesis-panel/95", open ? "border-cyan-300/55 shadow-[0_0_28px_rgba(34,211,238,0.12)]" : "border-cyan-400/15")}>
      <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={rarityClasses[system.system_rarity] ?? "border-cyan-300/25 text-cyan-100"}>{system.system_rarity}</Badge>
              <ValidationBadge status={validation} />
              {system.starting_system ? <Badge className="border-emerald-300/45 text-emerald-100">Starting System</Badge> : null}
            </div>
            <h3 className="mt-3 text-3xl font-bold text-white">{system.system_name}</h3>
            <p className="mt-1 font-mono text-sm text-slate-500">{system.catalog_designation}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={ExternalLink} onClick={onOpen}>
              Open System
            </ActionButton>
            <ActionButton icon={Sparkles} onClick={onOpen}>
              Generate Celestial Bodies
            </ActionButton>
            <ActionButton icon={Copy} onClick={() => copyJson(payload)}>
              Copy JSON
            </ActionButton>
            <ActionButton icon={Download} onClick={() => exportJson(`${system.catalog_designation.toLowerCase()}-system.json`, payload)}>
              Export
            </ActionButton>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4 xl:grid-cols-5">
          <Spec label="Star Count" value={system.star_count} />
          <Spec label="Star Type" value={system.star_type} />
          <Spec label="Bodies" value={stats.nonStarBodies.length} />
          <Spec label="Planets" value={stats.planets} />
          <Spec label="Moons" value={stats.moons} />
          <Spec label="Belts" value={stats.belts} />
          <Spec label="Gas Giants" value={stats.gasGiants} />
          <Spec label="Discovery" value={system.discovery_state} />
          <Spec label="Danger" value={system.danger_level} tone={system.danger_level > 70 ? "text-red-200" : "text-slate-100"} />
          <Spec label="Resource Bias" value={system.resource_bias} />
        </div>
      </div>
      {open && showBodies ? (
        <div className="border-t border-cyan-300/15 p-5">
          <Breadcrumbs items={["Universe", "Selected Sector", system.system_name]} />
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {stats.nonStarBodies.map((body) => (
              <BodyCard key={body.id} body={body} />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function SectorCard({
  sector,
  systems,
  open,
  onOpen,
  showSystems = true
}: {
  sector: SectorNode;
  systems: StarSystemNode[];
  open: boolean;
  onOpen: () => void;
  showSystems?: boolean;
}) {
  const validation = statusForSector(sector, systems);
  const discoveryState = sector.discovered ? "Discovered" : sector.discovery_level;
  const payload = { sector, star_systems: systems };

  return (
    <article className={cn("rounded-md border bg-genesis-panel/95", open ? "border-cyan-300/55 shadow-[0_0_28px_rgba(34,211,238,0.12)]" : "border-cyan-400/15")}>
      <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={rarityClasses[sector.sector_rarity] ?? "border-cyan-300/25 text-cyan-100"}>{sector.sector_rarity}</Badge>
              <ValidationBadge status={validation} />
              <Badge className="border-cyan-300/25 text-cyan-100">{discoveryState}</Badge>
            </div>
            <h3 className="mt-3 text-3xl font-bold text-white">{sector.sector_name}</h3>
            <p className="mt-1 font-mono text-sm text-slate-500">{sector.sector_seed}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={ExternalLink} onClick={onOpen}>
              Open Sector
            </ActionButton>
            <ActionButton icon={Sparkles} onClick={onOpen}>
              Generate Star Systems
            </ActionButton>
            <ActionButton icon={Copy} onClick={() => copyJson(payload)}>
              Copy JSON
            </ActionButton>
            <ActionButton icon={Download} onClick={() => exportJson(`${sector.id}-sector.json`, payload)}>
              Export
            </ActionButton>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Spec label="Sector Type" value={sector.sector_type} />
          <Spec label="Coordinates" value={`${sector.coordinates_x}, ${sector.coordinates_y}, ${sector.coordinates_z}`} />
          <Spec label="System Count" value={sector.system_count} />
          <Spec label="Difficulty" value={sector.difficulty} tone={sector.difficulty > 70 ? "text-red-200" : "text-slate-100"} />
          <Spec label="Discovery Value" value={formatNumber(sector.discovery_value)} />
          <Spec label="Resource Bias" value={sector.resource_signal} />
          <Spec label="Modifiers" value={sector.modifier} />
          <Spec label="Colonized Worlds" value={sector.colonized_worlds} />
        </div>
      </div>
      {open && showSystems ? (
        <div className="space-y-4 border-t border-cyan-300/15 p-5">
          <Breadcrumbs items={["Universe", "Selected Galaxy", sector.sector_name]} />
          {systems.map((system, index) => (
            <StarSystemCard key={system.id} system={system} open={index === 0} onOpen={() => undefined} showBodies={false} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function GalaxyCard({
  galaxy,
  sectors,
  open,
  onOpen
}: {
  galaxy: GalaxyNode;
  sectors: SectorNode[];
  open: boolean;
  onOpen: () => void;
}) {
  const validation = statusForGalaxy(galaxy, sectors);
  const discovered = sectors.filter((sector) => sector.discovered).length;
  const discoveryPercent = sectors.length ? Math.round((discovered / sectors.length) * 100) : 0;
  const avgSystems = sectors.length ? Math.round(sectors.reduce((total, sector) => total + sector.system_count, 0) / sectors.length) : 0;
  const estimatedSystems = avgSystems * galaxy.sector_count;
  const estimatedBodies = estimatedSystems * 7;
  const specialBias = sectors.find((sector) => ["Genesis", "Relic", "Mythic"].includes(sector.sector_rarity))?.sector_rarity ?? galaxy.galaxy_type;
  const payload = { galaxy, sectors };

  return (
    <article className={cn("rounded-md border bg-genesis-panel/95", open ? "border-cyan-300/55 shadow-[0_0_28px_rgba(34,211,238,0.12)]" : "border-cyan-400/15")}>
      <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-cyan-300/35 text-cyan-100">{galaxy.galaxy_type}</Badge>
              <ValidationBadge status={validation} />
              {galaxy.is_fixed ? <Badge className="border-emerald-300/45 text-emerald-100">Starting Galaxy</Badge> : null}
            </div>
            <h3 className="mt-3 text-3xl font-bold text-white">{galaxy.name}</h3>
            <p className="mt-1 font-mono text-sm text-slate-500">{galaxy.galaxy_seed}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={ExternalLink} onClick={onOpen}>
              Open Galaxy
            </ActionButton>
            <ActionButton icon={Sparkles} onClick={onOpen}>
              Generate Sectors
            </ActionButton>
            <ActionButton icon={Copy} onClick={() => copyJson(payload)}>
              Copy JSON
            </ActionButton>
            <ActionButton icon={Download} onClick={() => exportJson(`${galaxy.id}-galaxy.json`, payload)}>
              Export
            </ActionButton>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Spec label="Galaxy Size" value={galaxy.galaxy_size} />
          <Spec label="Sector Count" value={formatNumber(galaxy.sector_count)} />
          <Spec label="Starting Sector" value={sectors[0]?.sector_name ?? "None"} />
          <Spec label="Discovery" value={`${discoveryPercent}%`} tone="text-cyan-200" />
          <Spec label="Rarity Bias" value={specialBias} />
          <Spec label="Star Systems Est." value={formatNumber(estimatedSystems)} />
          <Spec label="Bodies Est." value={formatNumber(estimatedBodies)} />
          <Spec label="Generated Preview" value={`${sectors.length} sectors`} />
        </div>
      </div>
      {open ? (
        <div className="space-y-4 border-t border-cyan-300/15 p-5">
          <Breadcrumbs items={["Universe", galaxy.name]} />
          {sectors.map((sector) => {
            const systems = generateStarSystems(sector, Math.min(6, sector.system_count));
            return <SectorCard key={sector.id} sector={sector} systems={systems} open={false} onOpen={() => undefined} showSystems={false} />;
          })}
        </div>
      ) : null}
    </article>
  );
}

export function GalaxyGeneratorWorkflow() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [count, setCount] = useState(2);
  const [type, setType] = useState("Any");
  const [size, setSize] = useState("Any");
  const [includeStarting, setIncludeStarting] = useState(true);
  const [generatedAt, setGeneratedAt] = useState(1);
  const [openId, setOpenId] = useState<string | null>("galaxy-milky-way");
  const [commitMessage, setCommitMessage] = useState<string | null>(null);

  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const galaxies = useMemo(() => {
    void generatedAt;
    const start = includeStarting ? 0 : 1;
    return Array.from({ length: Math.max(1, count) }, (_, index) => applyGalaxyBias(generateGalaxy(universe.universe_seed, start + index), type, size));
  }, [count, generatedAt, includeStarting, size, type, universe.universe_seed]);

  async function commitGeneratedSet() {
    setCommitMessage(null);
    const response = await fetch("/api/universe/cascade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "galaxy", seed: universe.universe_seed, galaxyIndex: includeStarting ? 0 : 1, sectorIndex: 0, systemIndex: 0 })
    });
    setCommitMessage(response.ok ? "Committed first generated galaxy cascade." : "Could not commit generated galaxy cascade.");
  }

  return (
    <GeneratorShell
      eyebrow="Universe Workflow"
      title="Galaxy Generator"
      description="Generate galaxy records as card-based content packages, then drill into sector composition for export into the game app."
    >
      <GeneratorPanel>
        <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_9rem_13rem_12rem_13rem_auto_auto] lg:items-end">
          <TextInput label="Universe Seed" value={universeSeed} onChange={setUniverseSeed} placeholder="PROJECT-GENESIS-UNIVERSE" />
          <TextInput label="Galaxy Count" value={count} onChange={(value) => setCount(Math.max(1, Number(value) || 1))} type="number" min={1} />
          <SelectInput label="Galaxy Type" value={type} options={galaxyTypes} onChange={setType} />
          <SelectInput label="Galaxy Size" value={size} options={galaxySizes} onChange={setSize} />
          <ToggleInput label="Starting Galaxy" checked={includeStarting} onChange={setIncludeStarting} />
          <Button type="button" onClick={() => setGeneratedAt((value) => value + 1)} className="h-11 px-5">
            <Plus className="h-4 w-4" />
            Generate Galaxies
          </Button>
          <Button type="button" onClick={commitGeneratedSet} className="h-11 border-slate-600 bg-slate-900/70 text-slate-100">
            <Database className="h-4 w-4" />
            Commit Generated Set
          </Button>
        </div>
        {commitMessage ? <p className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100">{commitMessage}</p> : null}
      </GeneratorPanel>

      <section className="space-y-4">
        {galaxies.map((galaxy) => {
          const sectors = generateSectors(galaxy, Math.min(8, galaxy.sector_count));
          return <GalaxyCard key={galaxy.id} galaxy={galaxy} sectors={sectors} open={openId === galaxy.id} onOpen={() => setOpenId(openId === galaxy.id ? null : galaxy.id)} />;
        })}
      </section>
    </GeneratorShell>
  );
}

export function SectorGeneratorWorkflow() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [galaxyIndex, setGalaxyIndex] = useState(0);
  const [count, setCount] = useState(8);
  const [sectorType, setSectorType] = useState("Any");
  const [rarity, setRarity] = useState("Any");
  const [includeLocalBubble, setIncludeLocalBubble] = useState(true);
  const [generatedAt, setGeneratedAt] = useState(1);
  const [openId, setOpenId] = useState<string | null>("sector-local-bubble");
  const [search, setSearch] = useState("");

  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const galaxy = useMemo(() => generateGalaxy(universe.universe_seed, galaxyIndex), [galaxyIndex, universe.universe_seed]);
  const sectors = useMemo(() => {
    void generatedAt;
    const raw = generateSectors(galaxy, Math.max(1, count + (includeLocalBubble ? 0 : 1)));
    return raw
      .filter((sector) => includeLocalBubble || !sector.is_fixed)
      .slice(0, Math.max(1, count))
      .map((sector) => applySectorBias(sector, sectorType, rarity));
  }, [count, galaxy, generatedAt, includeLocalBubble, rarity, sectorType]);
  const visibleSectors = sectors.filter((sector) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [sector.sector_name, sector.sector_type, sector.sector_rarity, sector.resource_signal, sector.modifier].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <GeneratorShell
      eyebrow="Universe Workflow"
      title="Sector Generator"
      description="Generate sector cards for a selected galaxy, inspect their star-system payloads, and export the hierarchy for runtime use."
    >
      <GeneratorPanel>
        <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_9rem_9rem_13rem_11rem_13rem_auto] lg:items-end">
          <TextInput label="Universe Seed" value={universeSeed} onChange={setUniverseSeed} placeholder="PROJECT-GENESIS-UNIVERSE" />
          <TextInput label="Galaxy" value={galaxyIndex} onChange={(value) => setGalaxyIndex(Math.max(0, Number(value) || 0))} type="number" min={0} />
          <TextInput label="Sectors" value={count} onChange={(value) => setCount(Math.max(1, Number(value) || 1))} type="number" min={1} />
          <SelectInput label="Sector Bias" value={sectorType} options={sectorTypes} onChange={setSectorType} />
          <SelectInput label="Rarity Bias" value={rarity} options={rarityOptions} onChange={setRarity} />
          <ToggleInput label="Include Local Bubble" checked={includeLocalBubble} onChange={setIncludeLocalBubble} />
          <Button type="button" onClick={() => setGeneratedAt((value) => value + 1)} className="h-11 px-5">
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

      <section className="space-y-4">
        {visibleSectors.map((sector) => {
          const systems = generateStarSystems(sector, Math.min(8, sector.system_count));
          return <SectorCard key={sector.id} sector={sector} systems={systems} open={openId === sector.id} onOpen={() => setOpenId(openId === sector.id ? null : sector.id)} />;
        })}
      </section>
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
  const [includeSol, setIncludeSol] = useState(true);
  const [generatedAt, setGeneratedAt] = useState(1);
  const [openId, setOpenId] = useState<string | null>("system-sol");
  const [search, setSearch] = useState("");

  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const galaxy = useMemo(() => generateGalaxy(universe.universe_seed, galaxyIndex), [galaxyIndex, universe.universe_seed]);
  const sector = useMemo(() => generateSectors(galaxy, Math.max(sectorIndex + 1, 1))[sectorIndex] ?? generateSectors(galaxy, 1)[0], [galaxy, sectorIndex]);
  const systems = useMemo(() => {
    void generatedAt;
    const raw = generateStarSystems(sector, Math.max(1, count + (includeSol ? 0 : 1)));
    return raw
      .filter((system) => includeSol || !system.is_fixed)
      .slice(0, Math.max(1, count))
      .map((system) => applySystemBias(system, rarity, starRule));
  }, [count, generatedAt, includeSol, rarity, sector, starRule]);
  const visibleSystems = systems.filter((system) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [system.system_name, system.catalog_designation, system.system_rarity, system.star_type, system.resource_bias].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <GeneratorShell
      eyebrow="Universe Workflow"
      title="Star System Generator"
      description="Generate star-system cards for a selected sector, then open each system to review its celestial bodies as nested cards."
    >
      <GeneratorPanel>
        <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_8rem_8rem_9rem_11rem_11rem_11rem_auto] lg:items-end">
          <TextInput label="Universe Seed" value={universeSeed} onChange={setUniverseSeed} placeholder="PROJECT-GENESIS-UNIVERSE" />
          <TextInput label="Galaxy" value={galaxyIndex} onChange={(value) => setGalaxyIndex(Math.max(0, Number(value) || 0))} type="number" min={0} />
          <TextInput label="Sector" value={sectorIndex} onChange={(value) => setSectorIndex(Math.max(0, Number(value) || 0))} type="number" min={0} />
          <TextInput label="Systems" value={count} onChange={(value) => setCount(Math.max(1, Number(value) || 1))} type="number" min={1} />
          <SelectInput label="Rarity Bias" value={rarity} options={rarityOptions} onChange={setRarity} />
          <SelectInput label="Star Rules" value={starRule} options={starCountRules} onChange={setStarRule} />
          <ToggleInput label="Include Sol" checked={includeSol} onChange={setIncludeSol} />
          <Button type="button" onClick={() => setGeneratedAt((value) => value + 1)} className="h-11 px-5">
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

      <section className="space-y-4">
        {visibleSystems.map((system) => (
          <StarSystemCard key={system.id} system={system} open={openId === system.id} onOpen={() => setOpenId(openId === system.id ? null : system.id)} />
        ))}
      </section>
    </GeneratorShell>
  );
}
