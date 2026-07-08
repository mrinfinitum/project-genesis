"use client";

import { useMemo, useState } from "react";
import { Database, Orbit, RadioTower, Rocket, Search, ShieldAlert, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateCelestialBodies,
  generateGalaxy,
  generateSectors,
  generateStars,
  generateStarSystems,
  generateUniverse,
  hashSeed,
  type CelestialBodyNode,
  type StarSystemNode
} from "@/lib/universe/generator";
import { DEFAULT_UNIVERSE_SEED } from "@/lib/universe/fallback-data";
import { cn } from "@/lib/utils";

const bodyColors: Record<string, string> = {
  Star: "bg-amber-200 shadow-[0_0_38px_rgba(252,211,77,0.7)]",
  Planet: "bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.35)]",
  Moon: "bg-slate-300",
  "Dwarf Planet": "bg-violet-300",
  "Asteroid Belt": "bg-orange-300",
  "Orbital Platform": "bg-emerald-300"
};

function accessibleSystems(systems: StarSystemNode[]) {
  return systems.filter((system) => ["Visited", "Surveyed", "Colonized"].includes(system.discovery_state));
}

function radiusForBody(body: CelestialBodyNode) {
  if (body.celestial_body_type === "Moon") return "h-3 w-3";
  if (body.planet_class === "Gas Giant") return "h-7 w-7";
  if (body.celestial_body_type === "Dwarf Planet") return "h-4 w-4";
  if (body.celestial_body_type === "Asteroid Belt") return "h-2 w-24 rounded-none";
  return "h-5 w-5";
}

function bodyAngle(body: CelestialBodyNode, fallbackIndex: number) {
  return ((hashSeed(`${body.id}:${fallbackIndex}`) % 360) * Math.PI) / 180;
}

function bodyPosition(body: CelestialBodyNode, index: number, parent?: { x: number; y: number }) {
  if (body.celestial_body_type === "Moon" && parent) {
    const angle = bodyAngle(body, index);
    const distance = 8 + (hashSeed(body.id) % 6);
    return {
      x: parent.x + Math.cos(angle) * distance,
      y: parent.y + Math.sin(angle) * distance
    };
  }

  const orbit = body.orbit_position ?? index + 1;
  const distance = Math.min(42, 8 + orbit * 4.2);
  const angle = bodyAngle(body, index);
  return {
    x: 50 + Math.cos(angle) * distance,
    y: 50 + Math.sin(angle) * distance
  };
}

function bodySummary(body: CelestialBodyNode) {
  if (body.planet_class === "Gas Giant") {
    return "Orbital Resource World";
  }

  if (body.celestial_body_type === "Asteroid Belt") {
    return "Resource Field";
  }

  return body.colonizable_status;
}

function BodyChip({ body, active, onClick }: { body: CelestialBodyNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border p-3 text-left transition",
        active ? "border-cyan-300/70 bg-cyan-300/10" : "border-cyan-300/10 bg-slate-950/45 hover:border-cyan-300/35"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{body.name}</p>
          <p className="mt-1 text-xs text-slate-500">{body.celestial_body_type}</p>
        </div>
        <span className="rounded border border-cyan-300/20 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-cyan-200">
          {bodySummary(body)}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{body.notes}</p>
    </button>
  );
}

export function StarSystemMap() {
  const [systemId, setSystemId] = useState("system-sol");
  const [bodyId, setBodyId] = useState("body-earth");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const universe = useMemo(() => generateUniverse(DEFAULT_UNIVERSE_SEED), []);
  const galaxy = useMemo(() => generateGalaxy(universe.universe_seed, 0), [universe.universe_seed]);
  const sector = useMemo(() => generateSectors(galaxy, 1)[0], [galaxy]);
  const systems = useMemo(() => accessibleSystems(generateStarSystems(sector, 24)), [sector]);
  const selectedSystem = systems.find((system) => system.id === systemId) ?? systems[0];
  const stars = useMemo(() => generateStars(selectedSystem), [selectedSystem]);
  const bodies = useMemo(() => generateCelestialBodies(selectedSystem), [selectedSystem]);
  const nonStarBodies = bodies.filter((body) => body.celestial_body_type !== "Star");
  const filteredBodies = nonStarBodies.filter((body) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return [body.name, body.celestial_body_type, body.planet_class, body.planet_subclass, body.unlock_requirement, body.resources.join(" ")]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized));
  });
  const selectedBody = bodies.find((body) => body.id === bodyId) ?? nonStarBodies[0];

  const bodyPositions = new Map<string, { x: number; y: number }>();
  nonStarBodies.forEach((body, index) => {
    const parent = body.parent_body_id ? bodyPositions.get(body.parent_body_id) : undefined;
    bodyPositions.set(body.id, bodyPosition(body, index, parent));
  });

  function chooseSystem(nextSystemId: string) {
    setSystemId(nextSystemId);
    const nextSystem = systems.find((system) => system.id === nextSystemId);
    const nextBodies = nextSystem ? generateCelestialBodies(nextSystem).filter((body) => body.celestial_body_type !== "Star") : [];
    setBodyId(nextBodies[0]?.id ?? "");
  }

  async function copySystemExport() {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          system: selectedSystem,
          stars,
          celestial_bodies: bodies,
          selected_body: selectedBody
        },
        null,
        2
      )
    );
  }

  async function saveSystemPreview() {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/universe/cascade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "star-system",
          seed: universe.universe_seed,
          galaxyIndex: 0,
          sectorIndex: 0,
          systemIndex: systems.findIndex((system) => system.id === selectedSystem.id)
        })
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save star system preview.");
      }

      setSaveMessage("Star system cascade saved.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Could not save star system preview.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">System Layout Preview</p>
          <h1 className="mt-3 text-5xl font-bold text-white">Star System Generator</h1>
          <p className="mt-3 max-w-4xl text-lg text-slate-300">
            Generate and inspect orbit layouts, moons, asteroid fields, and orbital resource worlds.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedSystem.id}
            onChange={(event) => chooseSystem(event.target.value)}
            className="h-11 min-w-64 rounded-md border border-cyan-300/20 bg-slate-950/65 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
          >
            {systems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.system_name}
              </option>
            ))}
          </select>
          <Button type="button" onClick={copySystemExport}>
            <Database className="h-4 w-4" />
            Export System
          </Button>
          <Button type="button" onClick={saveSystemPreview} disabled={saving}>
            <Database className="h-4 w-4" />
            {saving ? "Saving..." : "Save Preview"}
          </Button>
        </div>
      </section>

      {saveMessage ? <div className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100">{saveMessage}</div> : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="overflow-hidden rounded-md border border-cyan-400/15 bg-genesis-panel/90">
          <div className="grid gap-3 border-b border-cyan-400/15 p-4 sm:grid-cols-4">
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">System</p>
              <p className="mt-1 text-sm font-semibold text-white">{selectedSystem.system_name}</p>
            </div>
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Star Type</p>
              <p className="mt-1 text-sm font-semibold text-white">{selectedSystem.star_type}</p>
            </div>
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Bodies</p>
              <p className="mt-1 text-sm font-semibold text-white">{nonStarBodies.length}</p>
            </div>
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Discovery</p>
              <p className="mt-1 text-sm font-semibold text-cyan-200">{selectedSystem.discovery_state}</p>
            </div>
          </div>

          <div className="relative h-[44rem] overflow-hidden bg-[#030712]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:46px_46px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_62%)]" />
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((orbit) => (
              <span
                key={orbit}
                className="absolute left-1/2 top-1/2 rounded-full border border-cyan-300/10"
                style={{
                  width: `${orbit * 8.4}%`,
                  height: `${orbit * 8.4}%`,
                  transform: "translate(-50%, -50%)"
                }}
              />
            ))}
            <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-amber-200 shadow-[0_0_52px_rgba(252,211,77,0.75)]">
              <Star className="h-7 w-7 text-amber-950" />
            </div>
            <div className="absolute left-1/2 top-[calc(50%+2.75rem)] -translate-x-1/2 text-center">
              <p className="text-xs font-semibold text-white">{stars[0]?.star_name ?? selectedSystem.primary_star}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">{selectedSystem.star_type}</p>
            </div>

            {nonStarBodies.map((body, index) => {
              const position = bodyPositions.get(body.id) ?? { x: 50, y: 50 };
              const active = body.id === selectedBody?.id;
              const color = bodyColors[body.celestial_body_type] ?? bodyColors.Planet;

              return (
                <button
                  key={body.id}
                  type="button"
                  onClick={() => setBodyId(body.id)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 text-left"
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                >
                  <span className={cn("block rounded-full border border-white/25", radiusForBody(body), color, active && "ring-4 ring-cyan-300/30")} />
                  <span
                    className={cn(
                      "mt-2 hidden max-w-44 rounded-md border border-cyan-300/20 bg-slate-950/85 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur group-hover:block",
                      active && "block"
                    )}
                  >
                    {body.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/95 p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded-md border border-cyan-300/20 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
                placeholder="Search celestial bodies"
              />
            </label>
            <div className="mt-4 grid max-h-[23rem] gap-2 overflow-y-auto pr-1">
              {filteredBodies.map((body) => (
                <BodyChip key={body.id} body={body} active={body.id === selectedBody?.id} onClick={() => setBodyId(body.id)} />
              ))}
            </div>
          </div>

          {selectedBody ? (
            <div className="rounded-md border border-cyan-400/15 bg-genesis-panel/95 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{selectedBody.celestial_body_type}</p>
                  <h2 className="mt-2 text-3xl font-bold text-white">{selectedBody.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedBody.unlock_requirement}</p>
                </div>
                <span className="rounded-md border border-cyan-300/25 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                  {bodySummary(selectedBody)}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Class</p>
                  <p className="mt-1 text-sm font-semibold text-white">{selectedBody.planet_class ?? selectedBody.celestial_body_type}</p>
                </div>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Subclass</p>
                  <p className="mt-1 text-sm font-semibold text-white">{selectedBody.planet_subclass ?? "None"}</p>
                </div>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Gravity</p>
                  <p className="mt-1 text-sm font-semibold text-white">{selectedBody.gravity ?? "Unknown"}</p>
                </div>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Orbit</p>
                  <p className="mt-1 text-sm font-semibold text-white">{selectedBody.orbit_parent ?? "System"}</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-300">{selectedBody.notes}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {selectedBody.resources.map((resource) => (
                  <span key={resource} className="rounded-md border border-cyan-300/20 bg-slate-950/55 px-2.5 py-1 text-xs font-semibold text-slate-200">
                    {resource}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-2">
                {selectedBody.uses_orbital_gameplay ? (
                  <>
                    <Button type="button">
                      <RadioTower className="h-4 w-4" />
                      View Orbital Platforms
                    </Button>
                    <Button type="button" className="border-slate-600 bg-slate-900/70 text-slate-100 hover:border-cyan-300/50">
                      <Orbit className="h-4 w-4" />
                      Harvest Atmosphere
                    </Button>
                  </>
                ) : selectedBody.landable ? (
                  <Button type="button">
                    <Rocket className="h-4 w-4" />
                    Explore Surface
                  </Button>
                ) : (
                  <Button type="button" disabled>
                    <ShieldAlert className="h-4 w-4" />
                    Surface Not Available
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
