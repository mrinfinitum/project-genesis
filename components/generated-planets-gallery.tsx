"use client";

import { useMemo, useState } from "react";
import { Orbit, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeneratedPlanet } from "@/types/schema";

function asList(values: string[] | null | undefined) {
  return Array.isArray(values) ? values.filter(Boolean) : [];
}

function listText(values: string[] | null | undefined) {
  return asList(values).join(", ");
}

function statEntries(value: Record<string, string | number>) {
  return Object.entries(value ?? {});
}

function planetSearchText(row: GeneratedPlanet) {
  return [
    row.name,
    row.seed,
    row.galaxy_sector,
    row.star_system,
    row.star_type,
    row.planet_class,
    row.primary_biome,
    row.climate,
    row.atmosphere,
    row.temperature,
    row.gravity,
    row.ancient_civilization,
    row.ruins,
    row.story,
    ...asList(row.resources),
    ...asList(row.hazards),
    ...asList(row.traits),
    ...asList(row.collectible_pools),
    ...asList(row.event_pool)
  ]
    .join(" ")
    .toLowerCase();
}

function detailPill(label: string, value: string | number | boolean) {
  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{String(value)}</p>
    </div>
  );
}

async function readPayload<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: text.slice(0, 220) } as T;
  }
}

export function GeneratedPlanetsGallery({ initialRows }: { initialRows: GeneratedPlanet[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlanet, setSelectedPlanet] = useState<GeneratedPlanet | null>(null);

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return rows;
    }

    return rows.filter((row) => planetSearchText(row).includes(search));
  }, [query, rows]);

  async function refreshRows() {
    try {
      const response = await fetch("/api/planets");
      const payload = await readPayload<{ rows?: GeneratedPlanet[]; error?: string }>(response);

      if (!response.ok) {
        setError(payload.error ?? "Could not load planets.");
        return;
      }

      setRows(payload.rows ?? []);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load planets.");
    }
  }

  async function generateNewPlanet() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/planets", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          seed: seed.trim() || undefined
        })
      });
      const payload = await readPayload<{ row?: GeneratedPlanet; error?: string }>(response);

      if (!response.ok) {
        setError(payload.error ?? "Could not generate planet.");
        return;
      }

      setSeed("");
      await refreshRows();
      setSelectedPlanet(payload.row ?? null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not generate planet.");
    } finally {
      setLoading(false);
    }
  }

  async function deletePlanet(row: GeneratedPlanet) {
    if (!window.confirm(`Delete ${row.name}?`)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/planets/${encodeURIComponent(row.id)}`, {
        method: "DELETE"
      });
      const payload = await readPayload<{ error?: string }>(response);

      if (!response.ok) {
        setError(payload.error ?? "Could not delete planet.");
        return;
      }

      if (selectedPlanet?.id === row.id) {
        setSelectedPlanet(null);
      }

      await refreshRows();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not delete planet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Procedural Worlds</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Planets</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Generated planet cards with persistent seeds, discovery stats, resources, hazards, traits, economy, science, colonization, and story output.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="h-10 min-w-64 rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
            placeholder="Optional seed"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
          />
          <Button className="h-10" disabled={loading} onClick={generateNewPlanet} type="button">
            <Plus className="h-4 w-4" />
            {loading ? "Generating..." : "Generate Planet"}
          </Button>
        </div>
      </section>

      <div className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          placeholder="Search planets"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {error ? <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredRows.map((row) => (
          <article
            key={row.id}
            className="group cursor-pointer overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/85 shadow-glow transition hover:-translate-y-0.5 hover:border-cyan-300/45"
            onClick={() => setSelectedPlanet(row)}
          >
            <div className="border-b border-cyan-300/10 bg-slate-950/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{row.planet_class}</p>
                  <h3 className="mt-2 text-xl font-bold text-white">{row.name}</h3>
                  <p className="mt-1 font-mono text-xs text-slate-500">{row.seed}</p>
                </div>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-md border border-red-300/20 text-red-200 opacity-80 transition hover:bg-red-400/10 group-hover:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    deletePlanet(row);
                  }}
                  disabled={loading}
                  aria-label="Delete planet"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-2">
                {detailPill("Biome", row.primary_biome)}
                {detailPill("Star", row.star_type)}
                {detailPill("Atmosphere", row.atmosphere)}
                {detailPill("Gravity", row.gravity)}
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-300">{row.story}</p>
              <div className="space-y-2 text-xs text-slate-400">
                <p>
                  <span className="text-slate-500">Resources:</span> {listText(row.resources)}
                </p>
                <p>
                  <span className="text-slate-500">Traits:</span> {listText(row.traits)}
                </p>
                <p>
                  <span className="text-slate-500">Hazards:</span> {listText(row.hazards)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">{row.discovery_points} discovery pts</span>
                <span className="rounded border border-blue-300/20 bg-blue-400/10 px-2 py-1 text-xs text-blue-100">{row.completion_percent}% complete</span>
                <span className="rounded border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-100">TL {row.terraform_level}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!filteredRows.length ? (
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-8 text-center text-sm text-slate-400 shadow-glow">
          No generated planets yet.
        </div>
      ) : null}

      {selectedPlanet ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 p-4 backdrop-blur-md" onClick={() => setSelectedPlanet(null)}>
          <section
            className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-md border border-cyan-300/20 bg-[#07101e] shadow-glow"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-cyan-300/15 bg-[#07101e]/95 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{selectedPlanet.planet_class}</p>
                <h3 className="mt-2 text-3xl font-bold text-white">{selectedPlanet.name}</h3>
                <p className="mt-1 font-mono text-xs text-slate-500">{selectedPlanet.seed}</p>
              </div>
              <Button className="h-9 w-9 px-0" onClick={() => setSelectedPlanet(null)} type="button">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-5 p-5 xl:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <p className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-200">{selectedPlanet.story}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {detailPill("Sector", selectedPlanet.galaxy_sector)}
                  {detailPill("System", selectedPlanet.star_system)}
                  {detailPill("Orbit", selectedPlanet.orbit_position)}
                  {detailPill("Star Type", selectedPlanet.star_type)}
                  {detailPill("Distance", selectedPlanet.distance_from_star)}
                  {detailPill("Orbit Speed", selectedPlanet.orbit_speed)}
                  {detailPill("Biome", selectedPlanet.primary_biome)}
                  {detailPill("Climate", selectedPlanet.climate)}
                  {detailPill("Atmosphere", selectedPlanet.atmosphere)}
                  {detailPill("Temperature", selectedPlanet.temperature)}
                  {detailPill("Gravity", selectedPlanet.gravity)}
                  {detailPill("Water", selectedPlanet.water_coverage)}
                  {detailPill("Moons", selectedPlanet.moons)}
                  {detailPill("Flora", selectedPlanet.flora)}
                  {detailPill("Fauna", selectedPlanet.fauna)}
                  {detailPill("Ancients", selectedPlanet.ancient_civilization)}
                  {detailPill("Ruins", selectedPlanet.ruins)}
                  {detailPill("Colonized", selectedPlanet.colonized)}
                </div>
              </div>
              <div className="space-y-4">
                {[
                  ["Resources", selectedPlanet.resources],
                  ["Hazards", selectedPlanet.hazards],
                  ["Traits", selectedPlanet.traits],
                  ["Modifiers", selectedPlanet.modifiers],
                  ["Collectibles", selectedPlanet.collectible_pools],
                  ["Weather", selectedPlanet.weather],
                  ["Events", selectedPlanet.event_pool]
                ].map(([label, values]) => (
                  <div key={label as string} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{label as string}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {asList(values as string[]).map((value) => (
                        <span key={value} className="rounded border border-slate-600/70 bg-slate-900 px-2 py-1 text-xs text-slate-200">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {[
                  ["Colonization", selectedPlanet.colonization],
                  ["Science", selectedPlanet.science],
                  ["Economy", selectedPlanet.economy],
                  ["Visual Theme", selectedPlanet.visual_theme]
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{label as string}</p>
                    <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      {statEntries(value as Record<string, string | number>).map(([key, stat]) => (
                        <div key={key}>
                          <dt className="text-slate-500">{key}</dt>
                          <dd className="mt-1 text-slate-200">{stat}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
