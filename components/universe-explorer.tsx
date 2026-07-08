"use client";

import { useMemo, useState } from "react";
import { Copy, Orbit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateGalaxy,
  generateCelestialBodies,
  generateSectors,
  generateStars,
  generateStarSystems,
  generateUniverse,
  planetSubSeeds,
  type CelestialBodyNode,
  type GalaxyNode,
  type SectorNode,
  type StarSystemNode,
} from "@/lib/universe/generator";

const DEFAULT_UNIVERSE_SEED = "PROJECT-GENESIS-UNIVERSE";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Field({ label, value }: { label: string; value: string | number | boolean | null }) {
  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-slate-100">{String(value ?? "-")}</p>
    </div>
  );
}

function SeedLine({ label, value }: { label: string; value: string }) {
  async function copyValue() {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/35 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{label}</p>
        <p className="truncate font-mono text-xs text-slate-300">{value}</p>
      </div>
      <button
        type="button"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-cyan-300/20 text-cyan-100 transition hover:bg-cyan-400/10"
        onClick={copyValue}
        aria-label={`Copy ${label}`}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SelectableCard<T extends { id: string }>({
  item,
  active,
  onClick,
  title,
  subtitle,
  meta
}: {
  item: T;
  active: boolean;
  onClick: (item: T) => void;
  title: string;
  subtitle: string;
  meta: string;
}) {
  return (
    <button
      type="button"
      className={cx(
        "rounded-md border bg-[#07101e]/85 p-3 text-left transition hover:border-cyan-300/45",
        active ? "border-cyan-300/60 shadow-[0_0_24px_rgba(34,211,238,0.15)]" : "border-cyan-400/15"
      )}
      onClick={() => onClick(item)}
    >
      <p className="truncate text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 truncate font-mono text-xs text-slate-500">{subtitle}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-cyan-300">{meta}</p>
    </button>
  );
}

function BodyCard({
  body,
  active,
  onClick,
  parentName
}: {
  body: CelestialBodyNode;
  active: boolean;
  onClick: (body: CelestialBodyNode) => void;
  parentName: string | null;
}) {
  const labels = [
    body.is_starting_body ? "Starting World" : null,
    body.unlock_requirement !== "Start" ? `Locked until ${body.unlock_requirement}` : null,
    body.uses_orbital_gameplay ? "Orbital World" : null,
    !body.landable ? "Not Landable" : null,
    body.celestial_body_type === "Asteroid Belt" ? "Resource Field" : null
  ].filter(Boolean);

  return (
    <button
      type="button"
      className={cx(
        "rounded-md border bg-[#07101e]/85 p-3 text-left transition hover:border-cyan-300/45",
        active ? "border-cyan-300/60 shadow-[0_0_24px_rgba(34,211,238,0.15)]" : "border-cyan-400/15",
        parentName && "ml-4"
      )}
      onClick={() => onClick(body)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{body.name}</p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {body.celestial_body_type}
            {parentName ? ` of ${parentName}` : ""}
          </p>
        </div>
        {body.planet_rarity ? <span className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">{body.planet_rarity}</span> : null}
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-cyan-300">
        {[body.planet_class, body.planet_subclass].filter(Boolean).join(" / ") || body.unlock_requirement}
      </p>
      {labels.length ? <p className="mt-2 text-xs text-slate-400">{labels.join(" / ")}</p> : null}
    </button>
  );
}

function StoreOnlyCallout() {
  return (
    <section className="rounded-md border border-amber-300/20 bg-amber-300/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">Persistence Rule</p>
      <p className="mt-2 text-sm text-amber-50/90">
        The universe is not pre-generated. Store seeds, discovery state, and player changes only. Everything else is regenerated from deterministic child seeds.
      </p>
    </section>
  );
}

export function UniverseExplorer() {
  const [universeSeed, setUniverseSeed] = useState(DEFAULT_UNIVERSE_SEED);
  const [galaxyIndex, setGalaxyIndex] = useState(0);
  const [sectorIndex, setSectorIndex] = useState(0);
  const [systemIndex, setSystemIndex] = useState(0);
  const [planetIndex, setPlanetIndex] = useState(0);

  const universe = useMemo(() => generateUniverse(universeSeed), [universeSeed]);
  const galaxy = useMemo(() => generateGalaxy(universe.universe_seed, galaxyIndex), [universe.universe_seed, galaxyIndex]);
  const sectors = useMemo(() => generateSectors(galaxy, 24), [galaxy]);
  const selectedSector = sectors[Math.min(sectorIndex, sectors.length - 1)] ?? sectors[0];
  const systems = useMemo(() => generateStarSystems(selectedSector, 12), [selectedSector]);
  const selectedSystem = systems[Math.min(systemIndex, systems.length - 1)] ?? systems[0];
  const stars = useMemo(() => generateStars(selectedSystem), [selectedSystem]);
  const bodies = useMemo(() => generateCelestialBodies(selectedSystem), [selectedSystem]);
  const selectableBodies = bodies.filter((body) => body.celestial_body_type !== "Star");
  const selectedBody = selectableBodies[Math.min(planetIndex, selectableBodies.length - 1)] ?? selectableBodies[0];
  const subSeeds = selectedBody?.is_procedural ? planetSubSeeds(`${selectedSystem.system_seed}:${selectedBody.id}`) : {};

  function chooseSector(sector: SectorNode) {
    setSectorIndex(sectors.findIndex((item) => item.id === sector.id));
    setSystemIndex(0);
    setPlanetIndex(0);
  }

  function chooseSystem(system: StarSystemNode) {
    setSystemIndex(systems.findIndex((item) => item.id === system.id));
    setPlanetIndex(0);
  }

  function chooseBody(body: CelestialBodyNode) {
    setPlanetIndex(selectableBodies.findIndex((item) => item.id === body.id));
  }

  function chooseGalaxy(nextIndex: number) {
    setGalaxyIndex(Math.max(0, nextIndex));
    setSectorIndex(0);
    setSystemIndex(0);
    setPlanetIndex(0);
  }

  function copyPlanetSeed() {
    if (selectedBody) {
      navigator.clipboard.writeText(`${selectedSystem.system_seed}:${selectedBody.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Developer Tools</p>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-3xl font-bold text-white">Developer Seed Explorer</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Debug deterministic universe, galaxy, sector, star system, celestial body, and procedural sub-seeds outside the main authoring workflow.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(16rem,28rem)_8rem]">
            <input
              className="h-11 rounded-md border border-cyan-300/25 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/70"
              value={universeSeed}
              onChange={(event) => {
                setUniverseSeed(event.target.value);
                setSectorIndex(0);
                setSystemIndex(0);
                setPlanetIndex(0);
              }}
              placeholder="Universe seed"
            />
            <input
              className="h-11 rounded-md border border-cyan-300/25 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/70"
              value={galaxyIndex}
              onChange={(event) => chooseGalaxy(Number(event.target.value) || 0)}
              min={0}
              type="number"
              aria-label="Galaxy index"
            />
          </div>
        </div>
      </section>

      <StoreOnlyCallout />

      <section className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Universe</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{universe.name}</h3>
          <div className="mt-4 space-y-2">
            <SeedLine label="Universe Seed" value={universe.universe_seed} />
            <Field label="Universe ID" value={universe.id} />
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Galaxy</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{galaxy.name}</h3>
          <div className="mt-4 grid gap-2">
            <Field label="Type" value={galaxy.galaxy_type} />
            <Field label="Sector Count" value={galaxy.sector_count} />
            <SeedLine label="Galaxy Seed" value={galaxy.galaxy_seed} />
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Selected System</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{selectedSystem.system_name}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Field label="Rarity" value={selectedSystem.system_rarity} />
            <Field label="Danger" value={selectedSystem.danger_level} />
            <Field label="Stars" value={selectedSystem.star_count} />
            <Field label="Planets" value={selectedSystem.planet_count} />
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Selected Body</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{selectedBody.name}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Field label="Type" value={selectedBody.celestial_body_type} />
            <Field label="Orbit" value={selectedBody.orbit_position ?? "-"} />
            <Field label="Class" value={selectedBody.planet_class ?? "-"} />
            <Field label="Unlock" value={selectedBody.unlock_requirement} />
          </div>
          <Button className="mt-3 w-full" onClick={copyPlanetSeed} type="button">
            <Copy className="h-4 w-4" />
            Copy Body Seed
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1fr_1.1fr]">
        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            <h3 className="text-base font-semibold text-white">Choose Sector</h3>
          </div>
          <div className="mt-4 grid max-h-[28rem] gap-2 overflow-auto pr-1 sm:grid-cols-2 xl:grid-cols-1">
            {sectors.map((sector, index) => (
              <SelectableCard
                key={sector.id}
                item={sector}
                active={selectedSector.id === sector.id}
                onClick={chooseSector}
                title={`Sector ${index + 1}`}
                subtitle={`${sector.coordinates_x}, ${sector.coordinates_y}, ${sector.coordinates_z}`}
                meta={`${sector.system_count} systems`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <div className="flex items-center gap-2">
            <Orbit className="h-4 w-4 text-cyan-200" />
            <h3 className="text-base font-semibold text-white">Generate Star System</h3>
          </div>
          <div className="mt-4 grid max-h-[28rem] gap-2 overflow-auto pr-1">
            {systems.map((system) => (
              <SelectableCard
                key={system.id}
                item={system}
                active={selectedSystem.id === system.id}
                onClick={chooseSystem}
                title={system.system_name}
                subtitle={system.catalog_designation}
                meta={`${system.generation_type} / ${system.star_count} stars / ${system.planet_count} bodies`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <h3 className="text-base font-semibold text-white">Celestial Bodies</h3>
          <div className="mt-4 grid max-h-[28rem] gap-2 overflow-auto pr-1">
            {selectableBodies.map((body) => (
              <BodyCard
                key={body.id}
                body={body}
                active={selectedBody.id === body.id}
                onClick={chooseBody}
                parentName={body.parent_body_id ? bodies.find((item) => item.id === body.parent_body_id)?.name ?? null : null}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <h3 className="text-base font-semibold text-white">Generate Stars</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {stars.map((star) => (
              <div key={star.id} className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
                <p className="text-sm font-semibold text-white">{star.star_name}</p>
                <p className="mt-1 text-xs text-slate-400">{star.star_type}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Field label="Color" value={star.star_color} />
                  <Field label="Size" value={star.star_size} />
                  <Field label="Temp K" value={star.star_temperature} />
                  <Field label="Age" value={star.age} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-4">
          <h3 className="text-base font-semibold text-white">Inspect Body Sub-Seeds</h3>
          <p className="mt-1 text-sm text-slate-400">
            Fixed Sol bodies are handcrafted. Procedural bodies expose child seeds for downstream generation systems.
          </p>
          <div className="mt-4 grid gap-2 lg:grid-cols-2">
            <SeedLine label="Body Seed" value={`${selectedSystem.system_seed}:${selectedBody.id}`} />
            {Object.entries(subSeeds).map(([label, value]) => (
              <SeedLine key={label} label={label.replace(/-/g, " ")} value={value} />
            ))}
            {!selectedBody.is_procedural ? <Field label="Generation" value="Handcrafted fixed Sol record" /> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
