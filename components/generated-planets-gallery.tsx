"use client";

import { useMemo, useState } from "react";
import { Download, Orbit, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeneratedPlanet } from "@/types/schema";

type PlanetImageVariant = NonNullable<GeneratedPlanet["image_variants"]>[number];

function asList(values: string[] | null | undefined) {
  return Array.isArray(values) ? values.filter(Boolean) : [];
}

function listText(values: string[] | null | undefined) {
  return asList(values).join(", ");
}

function statEntries(value: Record<string, string | number>) {
  return Object.entries(value ?? {});
}

function imageVariants(row: GeneratedPlanet) {
  return Array.isArray(row.image_variants) ? row.image_variants : [];
}

function largestVariant(row: GeneratedPlanet) {
  const variants = imageVariants(row);
  return variants.reduce<PlanetImageVariant | null>((current, next) => (!current || next.size > current.size ? next : current), null);
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

function compactPill(label: string, value: string | number | boolean) {
  return (
    <div className="min-w-0 rounded border border-cyan-300/10 bg-slate-950/45 px-2 py-1.5">
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-xs font-medium text-slate-100">{String(value)}</p>
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

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function GeneratedPlanetsGallery({ initialRows }: { initialRows: GeneratedPlanet[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [renderingPlanetId, setRenderingPlanetId] = useState("");
  const [renderingMode, setRenderingMode] = useState<"procedural" | "ai" | "">("");
  const [variantMenuPlanetId, setVariantMenuPlanetId] = useState("");
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
        setError(payload.error || `Could not generate planet (${response.status}).`);
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

  async function renderPlanet(row: GeneratedPlanet, mode: "procedural" | "ai") {
    setRenderingPlanetId(row.id);
    setRenderingMode(mode);
    setVariantMenuPlanetId("");
    setError("");

    try {
      const endpoint = mode === "procedural" ? "render-procedural" : "render";
      const response = await fetch(`/api/planets/${encodeURIComponent(row.id)}/${endpoint}`, {
        method: "POST"
      });
      const payload = await readPayload<{ row?: GeneratedPlanet; error?: string }>(response);

      if (!response.ok) {
        setError(payload.error ?? `Could not render ${mode === "procedural" ? "procedural" : "AI"} planet image.`);
        return;
      }

      if (payload.row) {
        setRows((currentRows) => currentRows.map((current) => (current.id === row.id ? payload.row! : current)));
        setSelectedPlanet((current) => (current?.id === row.id ? payload.row! : current));
        setVariantMenuPlanetId(row.id);
      } else {
        await refreshRows();
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : `Could not render ${mode === "procedural" ? "procedural" : "AI"} planet image.`);
    } finally {
      setRenderingPlanetId("");
      setRenderingMode("");
    }
  }

  async function downloadVariant(variant: PlanetImageVariant) {
    try {
      const response = await fetch(variant.url);

      if (!response.ok) {
        throw new Error(`Could not download image (${response.status}).`);
      }

      downloadBlob(variant.filename, await response.blob());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not download image.");
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredRows.map((row) => {
          const heroVariant = largestVariant(row);
          const variants = imageVariants(row);

          return (
            <article
              key={row.id}
              className="group cursor-pointer overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/85 shadow-glow transition hover:-translate-y-0.5 hover:border-cyan-300/45"
              onClick={() => setSelectedPlanet(row)}
            >
              <div className="grid h-36 place-items-center border-b border-cyan-300/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),rgba(2,6,23,0.2)_42%,rgba(2,6,23,0.78)_75%)] p-4">
                {heroVariant || row.image_url ? (
                  <img className="h-full w-full object-contain" src={heroVariant?.url ?? row.image_url ?? ""} alt={`${row.name} planet render`} />
                ) : (
                  <div className="h-24 w-24 rounded-full border border-cyan-300/25 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.72),rgba(34,211,238,0.38)_24%,rgba(59,130,246,0.2)_52%,rgba(15,23,42,0.95)_76%)] shadow-[0_0_42px_rgba(34,211,238,0.18)]" />
                )}
              </div>
              <div className="border-b border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-300">{row.planet_class}</p>
                    <h3 className="mt-1 truncate text-base font-bold text-white">{row.name}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-500">{row.seed}</p>
                  </div>
                  <div className="relative flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-md border border-cyan-300/20 text-cyan-100 opacity-80 transition hover:bg-cyan-400/10 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={(event) => {
                        event.stopPropagation();
                        renderPlanet(row, "procedural");
                      }}
                      disabled={Boolean(renderingPlanetId)}
                      aria-label="Render procedural planet image"
                      title="Render procedural planet image"
                    >
                      <Orbit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-md border border-cyan-300/20 text-cyan-100 opacity-80 transition hover:bg-cyan-400/10 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={(event) => {
                        event.stopPropagation();
                        renderPlanet(row, "ai");
                      }}
                      disabled={Boolean(renderingPlanetId)}
                      aria-label="Render AI hero planet image"
                      title="Render AI hero planet image"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-md border border-cyan-300/20 text-cyan-100 opacity-80 transition hover:bg-cyan-400/10 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={(event) => {
                        event.stopPropagation();
                        setVariantMenuPlanetId((current) => (current === row.id ? "" : row.id));
                      }}
                      disabled={!variants.length}
                      aria-label="Download planet image variants"
                      title="Download planet image variants"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-md border border-red-300/20 text-red-200 opacity-80 transition hover:bg-red-400/10 group-hover:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        deletePlanet(row);
                      }}
                      disabled={loading}
                      aria-label="Delete planet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {variantMenuPlanetId === row.id ? (
                      <div className="absolute right-0 top-11 z-20 grid w-44 gap-1 rounded-md border border-cyan-300/20 bg-slate-950 p-2 shadow-glow">
                        {variants.map((variant) => (
                          <button
                            key={variant.size}
                            type="button"
                            className="rounded px-3 py-2 text-left text-xs font-semibold text-slate-200 transition hover:bg-cyan-300/10 hover:text-cyan-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              downloadVariant(variant);
                            }}
                          >
                            {variant.size} x {variant.size}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                {renderingPlanetId === row.id ? (
                  <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                    {renderingMode === "ai" ? "Rendering AI PNG variants..." : "Rendering procedural PNG variants..."}
                  </p>
                ) : null}
              </div>
              <div className="space-y-3 p-3">
                <div className="grid grid-cols-2 gap-2">
                  {compactPill("Biome", row.primary_biome)}
                  {compactPill("Gravity", row.gravity)}
                </div>
                <p className="line-clamp-2 text-xs leading-5 text-slate-300">{row.story}</p>
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="truncate">
                    <span className="text-slate-500">Resources:</span> {listText(row.resources)}
                  </p>
                  <p className="truncate">
                    <span className="text-slate-500">Traits:</span> {listText(row.traits)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">{row.discovery_points} discovery pts</span>
                </div>
              </div>
            </article>
          );
        })}
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
                <div className="grid aspect-square max-h-[64vh] place-items-center rounded-md border border-cyan-300/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),rgba(2,6,23,0.82)_68%)] p-6">
                  {largestVariant(selectedPlanet) || selectedPlanet.image_url ? (
                    <img
                      className="h-full w-full object-contain"
                      src={largestVariant(selectedPlanet)?.url ?? selectedPlanet.image_url ?? ""}
                      alt={`${selectedPlanet.name} planet render`}
                    />
                  ) : (
                    <div className="h-56 w-56 rounded-full border border-cyan-300/25 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.72),rgba(34,211,238,0.38)_24%,rgba(59,130,246,0.2)_52%,rgba(15,23,42,0.95)_76%)] shadow-[0_0_56px_rgba(34,211,238,0.18)]" />
                  )}
                </div>
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
