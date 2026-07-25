"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Download, ImageIcon, Orbit, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanonicalIndex } from "@/components/ui/workspace";
import { PlanetDeepDataEditor, type PlanetDetailTabId } from "@/components/planet-deep-data-editor";
import { PLANET_CLASS_MODEL } from "@/lib/planets/class-model";
import { normalizePlanetRarity } from "@/lib/planets/rarity";
import { hasLockedPlanetRender } from "@/lib/planets/render-lock";
import { ResourceService } from "@/lib/resources/service";
import type { GeneratedPlanet } from "@/types/schema";

type PlanetImageVariant = NonNullable<GeneratedPlanet["image_variants"]>[number];
const autoRenderProceduralPlanets = process.env.NEXT_PUBLIC_AUTO_RENDER_PROCEDURAL_PLANETS === "true";
const fixedSolSeedPrefix = "PROJECT-GENESIS-UNIVERSE:milky-way:local-bubble:sol";
const planetClassOptions = [
  { label: "Any class", value: "" },
  ...PLANET_CLASS_MODEL.map((planetClass) => ({ label: planetClass.name, value: planetClass.name }))
];

function asList(values: string[] | null | undefined) {
  return Array.isArray(values) ? values.filter(Boolean) : [];
}

function listText(values: string[] | null | undefined) {
  return asList(values).join(", ");
}

function displayResourceNames(row: GeneratedPlanet) {
  return row.resourceIds?.length ? ResourceService.namesForIds(row.resourceIds) : asList(row.resources);
}

function compactText(values: string[] | null | undefined) {
  return asList(values).join(" ").toLowerCase();
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function placeholderStyle(row: GeneratedPlanet): CSSProperties {
  const identityText = [
    row.planet_class,
    row.planet_subclass,
    row.primary_biome,
    row.climate,
    row.atmosphere
  ]
    .join(" ")
    .toLowerCase();
  const detailText = [
    row.temperature,
    displayResourceNames(row).join(" ").toLowerCase(),
    compactText(row.hazards),
    compactText(row.traits),
    compactText(row.weather)
  ]
    .join(" ")
    .toLowerCase();
  const hue = hashString(`${row.id}:${row.seed}`) % 360;
  let colors = [`hsl(${hue} 72% 64%)`, `hsl(${(hue + 55) % 360} 70% 34%)`, "rgb(15 23 42)"];

  if (hasAny(identityText, ["ocean", "aquatic", "water", "reef"])) {
    colors = ["rgb(120 238 255)", "rgb(34 118 190)", "rgb(14 33 74)"];
  } else if (hasAny(identityText, ["harmony", "garden", "forest", "jungle", "swamp", "living", "grassland"])) {
    colors = ["rgb(115 255 195)", "rgb(39 153 99)", "rgb(14 58 56)"];
  } else if (hasAny(identityText, ["crystal", "quantum", "ionized"])) {
    colors = ["rgb(138 245 255)", "rgb(157 91 255)", "rgb(34 32 88)"];
  } else if (hasAny(identityText, ["void", "rift", "corruption", "shadow"])) {
    colors = ["rgb(217 89 255)", "rgb(65 41 111)", "rgb(10 12 31)"];
  } else if (hasAny(identityText, ["cyber", "machine", "artificial", "urban", "tech"])) {
    colors = ["rgb(95 232 255)", "rgb(78 88 109)", "rgb(15 23 42)"];
  } else if (hasAny(identityText, ["ice", "frozen", "snow", "glacier", "tundra"])) {
    colors = ["rgb(231 250 255)", "rgb(92 190 238)", "rgb(23 60 97)"];
  } else if (hasAny(identityText, ["desert", "arid", "dust", "canyon", "dune"])) {
    colors = ["rgb(248 210 122)", "rgb(181 111 49)", "rgb(64 35 24)"];
  } else if (hasAny(identityText, ["lava", "volcanic", "magma", "inferno"])) {
    colors = ["rgb(255 147 55)", "rgb(157 50 30)", "rgb(35 12 16)"];
  } else if (hasAny(identityText, ["toxic", "acid", "radiation", "methane"])) {
    colors = ["rgb(186 255 77)", "rgb(60 153 88)", "rgb(31 48 44)"];
  } else if (hasAny(detailText, ["crystal", "quantum", "rare crystal"])) {
    colors = ["rgb(135 235 255)", "rgb(116 91 224)", "rgb(24 35 80)"];
  } else if (hasAny(detailText, ["void", "rift", "dark matter", "corruption"])) {
    colors = ["rgb(183 96 255)", "rgb(67 47 125)", "rgb(11 12 33)"];
  } else if (hasAny(detailText, ["lava", "volcanic", "extreme heat", "ash"])) {
    colors = ["rgb(255 152 70)", "rgb(163 70 38)", "rgb(42 18 20)"];
  } else if (hasAny(detailText, ["ice", "frozen", "snow", "blizzard", "extreme cold"])) {
    colors = ["rgb(231 250 255)", "rgb(92 190 238)", "rgb(23 60 97)"];
  } else if (hasAny(detailText, ["desert", "arid", "dust", "sandstorm", "canyon"])) {
    colors = ["rgb(248 210 122)", "rgb(181 111 49)", "rgb(64 35 24)"];
  } else if (hasAny(detailText, ["toxic", "acid", "radiation", "methane"])) {
    colors = ["rgb(186 255 77)", "rgb(60 153 88)", "rgb(31 48 44)"];
  } else if (hasAny(detailText, ["forest", "jungle", "swamp", "living", "biomass"])) {
    colors = ["rgb(104 255 185)", "rgb(44 153 80)", "rgb(15 54 52)"];
  }

  return {
    background: `radial-gradient(circle at 30% 24%, rgba(255,255,255,0.8), ${colors[0]} 18%, ${colors[1]} 54%, ${colors[2]} 80%)`,
    boxShadow: `0 0 42px color-mix(in srgb, ${colors[0]} 28%, transparent)`
  };
}

function statEntries(value: Record<string, string | number>) {
  return Object.entries(value ?? {});
}

function imageVariants(row: GeneratedPlanet) {
  return Array.isArray(row.image_variants) ? row.image_variants : [];
}

function isFixedSolPlanet(row: GeneratedPlanet) {
  return row.id.startsWith("fixed-sol-") || row.seed.startsWith(fixedSolSeedPrefix);
}

function largestVariant(row: GeneratedPlanet) {
  const variants = imageVariants(row);
  return variants.reduce<PlanetImageVariant | null>((current, next) => (!current || next.size > current.size ? next : current), null);
}

function secondaryArtworkUrl(row: GeneratedPlanet) {
  return row.surface_landscape_image_url ?? "";
}

function planetSearchText(row: GeneratedPlanet) {
  return [
    row.name,
    row.seed,
    row.galaxy_sector,
    row.star_system,
    row.star_type,
    row.planet_class,
    row.planet_subclass,
    row.primary_biome,
    row.climate,
    row.atmosphere,
    row.temperature,
    row.gravity,
    row.ancient_civilization,
    row.ruins,
    row.story,
    ...displayResourceNames(row),
    ...asList(row.hazards),
    ...asList(row.traits),
    ...asList(row.anomalies),
    ...asList(row.collectible_pools),
    ...asList(row.event_pool)
  ]
    .join(" ")
    .toLowerCase();
}

function planetWorldLabel(row: GeneratedPlanet) {
  return row.planet_subclass ? row.planet_class || "Planet" : row.primary_biome || row.planet_class || "Planet";
}

function planetBiomeLabel(row: GeneratedPlanet) {
  return row.planet_class || row.primary_biome || "Planet";
}

function planetSubclassLabel(row: GeneratedPlanet) {
  if (row.planet_subclass) {
    return row.planet_subclass;
  }

  if (row.primary_biome && row.primary_biome !== row.planet_class) {
    return row.primary_biome;
  }

  return "General";
}

function isGasGiant(row: GeneratedPlanet) {
  return row.planet_class === "Gas Giant" || row.uses_orbital_gameplay;
}

function planetInteractionLabel(row: GeneratedPlanet) {
  return isGasGiant(row) ? "ORBITAL WORLD" : planetWorldLabel(row);
}

function fixedSolRelation(row: GeneratedPlanet) {
  if (!isFixedSolPlanet(row)) return "";

  const type = asList(row.traits).find((value) => ["Planet", "Moon", "Dwarf Planet"].includes(value)) ?? "Planet";
  if (type === "Moon" && row.distance_from_star.startsWith("Moon of")) {
    return row.distance_from_star;
  }

  return `${type} of Sol`;
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

function withAlpha(hex: string, alpha: string) {
  return /^#[0-9a-f]{6}$/i.test(hex) ? `${hex}${alpha}` : hex;
}

function rarityAnimationClass(row: GeneratedPlanet) {
  const rarity = normalizePlanetRarity(row.rarity);

  if (rarity.name === "Genesis") return "rarity-shimmer";
  if (rarity.name === "Cosmic") return "rarity-cosmic";
  if (rarity.name === "Relic") return "rarity-pulse";
  if (rarity.name === "Mythic") return "rarity-glow";

  return "";
}

function planetCardStyle(row: GeneratedPlanet): CSSProperties {
  const rarity = normalizePlanetRarity(row.rarity);

  if (rarity.name === "Common" || rarity.name === "Uncommon" || rarity.name === "Rare") {
    return {
      borderColor: withAlpha(rarity.color, rarity.name === "Common" ? "26" : "66")
    };
  }

  return {
    borderColor: withAlpha(rarity.color, "AA"),
    boxShadow: `0 0 26px ${withAlpha(rarity.color, rarity.name === "Legendary" ? "30" : "45")}, inset 0 0 0 1px ${withAlpha(rarity.color, "22")}`
  };
}

function rarityBadge(row: GeneratedPlanet, size: "compact" | "detail" = "compact") {
  const rarity = normalizePlanetRarity(row.rarity);
  const isCommon = rarity.name === "Common";

  return (
    <span
      className={[
        "inline-flex w-fit items-center rounded border font-bold uppercase leading-none",
        size === "detail" ? "px-3 py-1.5 text-xs tracking-[0.2em]" : "px-2 py-1 text-[0.58rem] tracking-[0.16em]",
        rarityAnimationClass(row)
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderColor: withAlpha(rarity.color, isCommon ? "55" : "AA"),
        backgroundColor: withAlpha(rarity.color, isCommon ? "10" : "1F"),
        color: rarity.color,
        boxShadow: isCommon ? undefined : `0 0 18px ${withAlpha(rarity.color, "28")}`
      }}
      title={`${rarity.name} rarity - ${rarity.spawnChance}% spawn chance`}
    >
      {rarity.name}
    </span>
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
  const [selectedPlanetClass, setSelectedPlanetClass] = useState("");
  const [planetSubclass, setPlanetSubclass] = useState("");
  const [loading, setLoading] = useState(false);
  const [renderingPlanetId, setRenderingPlanetId] = useState("");
  const [renderingMode, setRenderingMode] = useState<"procedural" | "ai" | "">("");
  const [variantMenuPlanetId, setVariantMenuPlanetId] = useState("");
  const [error, setError] = useState("");
  const [selectedPlanet, setSelectedPlanet] = useState<GeneratedPlanet | null>(null);
  const [selectedPlanetTab, setSelectedPlanetTab] = useState<PlanetDetailTabId>("overview");
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return rows;
    }

    return rows.filter((row) => planetSearchText(row).includes(search));
  }, [query, rows]);
  const indexItems = useMemo(() => {
    const renderedCount = rows.filter((row) => Boolean(largestVariant(row) || row.image_url)).length;
    const classCount = new Set(rows.map((row) => row.planet_class).filter(Boolean)).size;
    const solBodyCount = rows.filter(isFixedSolPlanet).length;

    return [
      { label: "Records", value: rows.length.toLocaleString(), detail: "generated bodies" },
      { label: "Shown", value: filteredRows.length.toLocaleString(), detail: "current filter" },
      { label: "Rendered", value: renderedCount.toLocaleString(), detail: "art linked" },
      { label: "Classes", value: classCount.toLocaleString(), detail: solBodyCount ? `${solBodyCount} Sol bodies` : "planet classes" }
    ];
  }, [filteredRows.length, rows]);
  const selectedPlanetClassDefinition = useMemo(
    () => PLANET_CLASS_MODEL.find((planetClass) => planetClass.name === selectedPlanetClass) ?? null,
    [selectedPlanetClass]
  );
  const subBiomeOptions = useMemo(
    () => [
      {
        label: selectedPlanetClassDefinition ? `Any ${selectedPlanetClassDefinition.name}` : "Choose class first",
        value: ""
      },
      ...(selectedPlanetClassDefinition?.subclasses.map((subclass) => ({ label: subclass, value: subclass })) ?? [])
    ],
    [selectedPlanetClassDefinition]
  );

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

  function openPlanet(row: GeneratedPlanet) {
    setSelectedPlanet(row);
    setSelectedPlanetTab("overview");
  }

  function closePlanet() {
    setSelectedPlanet(null);
    setSelectedPlanetTab("overview");
  }

  async function savePlanetDeepData(deepPlanetData: NonNullable<GeneratedPlanet["deepPlanetData"]>) {
    if (!selectedPlanet) return;
    const response = await fetch(`/api/planets/${encodeURIComponent(selectedPlanet.id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deepPlanetData })
    });
    const payload = await readPayload<{ row?: GeneratedPlanet; error?: string; issues?: unknown[] }>(response);
    if (!response.ok || !payload.row) {
      throw new Error(payload.error ?? "Could not save planet deep data.");
    }
    setRows((currentRows) => currentRows.map((row) => row.id === payload.row!.id ? payload.row! : row));
    setSelectedPlanet(payload.row);
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
          seed: seed.trim() || undefined,
          planetClass: selectedPlanetClass || undefined,
          planetSubclass: planetSubclass || undefined
        })
      });
      const payload = await readPayload<{ row?: GeneratedPlanet; error?: string }>(response);

      if (!response.ok) {
        setError(payload.error || `Could not generate planet (${response.status}).`);
        return;
      }

      setSeed("");

      if (payload.row) {
        setRows((currentRows) => [payload.row!, ...currentRows.filter((current) => current.id !== payload.row!.id)]);
        openPlanet(payload.row);
        if (!hasLockedPlanetRender(payload.row) && autoRenderProceduralPlanets) {
          void renderPlanet(payload.row, "procedural", { openVariantMenu: false });
        }
      } else {
        await refreshRows();
        closePlanet();
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError || "Could not generate planet."));
    } finally {
      setLoading(false);
    }
  }

  async function deletePlanet(row: GeneratedPlanet) {
    if (isFixedSolPlanet(row)) {
      setError("Fixed Sol System planets are part of the canonical universe seed and cannot be deleted.");
      return;
    }

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
        closePlanet();
      }

      await refreshRows();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not delete planet.");
    } finally {
      setLoading(false);
    }
  }

  async function renderPlanet(row: GeneratedPlanet, mode: "procedural" | "ai", options: { openVariantMenu?: boolean } = {}) {
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
        if (options.openVariantMenu ?? true) {
          setVariantMenuPlanetId(row.id);
        }
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Universe Workflow</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Planets</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Generate, preview, validate, and lock persistent planet cards with stats, resources, artwork, and story output.
          </p>
        </div>
        <div className="grid w-full gap-2 sm:grid-cols-[minmax(8rem,12rem)_minmax(10rem,1fr)_minmax(11rem,1fr)_minmax(11rem,13rem)] xl:w-auto xl:min-w-[58rem]">
          <input
            className="h-10 min-w-0 rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
            placeholder="Optional seed"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
          />
          <select
            className="h-10 min-w-0 rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-cyan-300/60"
            value={selectedPlanetClass}
            onChange={(event) => {
              setSelectedPlanetClass(event.target.value);
              setPlanetSubclass("");
            }}
            aria-label="Generation planet class"
          >
            {planetClassOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 min-w-0 rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-55"
            value={planetSubclass}
            onChange={(event) => setPlanetSubclass(event.target.value)}
            disabled={!selectedPlanetClassDefinition}
            aria-label="Generation sub-biome"
          >
            {subBiomeOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button className="h-10 w-full whitespace-nowrap px-4 text-sm font-semibold" disabled={loading} onClick={generateNewPlanet} type="button">
            <Plus className="h-4 w-4" />
            {loading ? "Generating..." : "Generate Planet"}
          </Button>
        </div>
      </section>

      <CanonicalIndex
        title="Planet Library"
        description="Generated canonical celestial records. Cards stay focused on browsing; detailed seeds, resources, and render controls open from the record."
        items={indexItems}
      />

      <div className="flex flex-col gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 sm:flex-row sm:items-center">
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
          const renderLocked = hasLockedPlanetRender(row);
          const fixedSolPlanet = isFixedSolPlanet(row);

          return (
            <article
              key={row.id}
              className={["group cursor-pointer overflow-hidden rounded-md border bg-[#07101e]/85 shadow-glow transition hover:-translate-y-0.5", rarityAnimationClass(row)]
                .filter(Boolean)
                .join(" ")}
              style={planetCardStyle(row)}
              onClick={() => openPlanet(row)}
            >
              <div className="relative grid h-36 place-items-center overflow-hidden border-b border-cyan-300/10 bg-black p-4">
                {heroVariant || row.image_url ? (
                  <img
                    className="h-28 max-h-full w-28 max-w-full object-contain"
                    src={heroVariant?.url ?? row.image_url ?? ""}
                    alt={`${row.name} planet render`}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border border-cyan-300/25" style={placeholderStyle(row)} />
                )}
                {fixedSolPlanet && !heroVariant && !row.image_url ? (
                  <span className="absolute left-3 top-3 rounded border border-amber-200/30 bg-black/70 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Placeholder Artwork
                  </span>
                ) : null}
              </div>
              <div className="border-b border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-300">{planetInteractionLabel(row)}</p>
                    <h3 className="mt-1 truncate text-base font-bold text-white">{row.name}</h3>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                      <span className="min-w-0 truncate font-mono text-xs text-slate-500">{row.seed}</span>
                      {fixedSolPlanet ? (
                        <span className="rounded border border-amber-200/30 bg-amber-200/10 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-amber-100">
                          Fixed Sol Body
                        </span>
                      ) : null}
                      {rarityBadge(row)}
                    </div>
                    {fixedSolPlanet ? <p className="mt-1 text-xs font-semibold text-slate-400">{fixedSolRelation(row)}</p> : null}
                  </div>
                  <div className="relative flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-md border border-cyan-300/20 text-cyan-100 opacity-80 transition hover:bg-cyan-400/10 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={(event) => {
                        event.stopPropagation();
                        renderPlanet(row, "procedural");
                      }}
                      disabled={Boolean(renderingPlanetId) || renderLocked || fixedSolPlanet}
                      aria-label="Render procedural planet image"
                      title={fixedSolPlanet ? "Fixed Sol planets use uploaded library artwork" : renderLocked ? "Planet render is locked" : "Render procedural planet image"}
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
                      disabled={Boolean(renderingPlanetId) || renderLocked || fixedSolPlanet}
                      aria-label="Render AI hero planet image"
                      title={fixedSolPlanet ? "Fixed Sol planets use uploaded library artwork" : renderLocked ? "Planet render is locked" : "Render AI hero planet image"}
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
                      disabled={loading || fixedSolPlanet}
                      aria-label={fixedSolPlanet ? "Fixed Sol planet cannot be deleted" : "Delete planet"}
                      title={fixedSolPlanet ? "Fixed Sol planet cannot be deleted" : "Delete planet"}
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
                <div className="grid grid-cols-3 gap-2">
                  {compactPill("Biome", planetBiomeLabel(row))}
                  {compactPill("Subclass", planetSubclassLabel(row))}
                  {isGasGiant(row) ? compactPill("Slots", row.orbital_slot_count || 0) : compactPill("Gravity", row.gravity)}
                </div>
                <p className="line-clamp-2 text-xs leading-5 text-slate-300">{row.story}</p>
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="truncate">
                    <span className="text-slate-500">Resources:</span> {listText(displayResourceNames(row))}
                  </p>
                  <p className="truncate">
                    <span className="text-slate-500">{isGasGiant(row) ? "Hazards:" : "Traits:"}</span> {isGasGiant(row) ? listText(row.hazards) : listText(row.traits)}
                  </p>
                </div>
                {isGasGiant(row) ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-cyan-100">Survey Atmosphere</span>
                    <span className="rounded border border-blue-300/20 bg-blue-400/10 px-2 py-1 text-blue-100">Deploy Harvester</span>
                  </div>
                ) : null}
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 p-4 backdrop-blur-md" onClick={closePlanet}>
          <section
            className={["max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-md border bg-[#07101e] shadow-glow", rarityAnimationClass(selectedPlanet)]
              .filter(Boolean)
              .join(" ")}
            style={planetCardStyle(selectedPlanet)}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-cyan-300/15 bg-[#07101e]/95 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{planetInteractionLabel(selectedPlanet)}</p>
                  {rarityBadge(selectedPlanet, "detail")}
                </div>
                <h3 className="mt-2 text-3xl font-bold text-white">{selectedPlanet.name}</h3>
                <p className="mt-1 font-mono text-xs text-slate-500">{selectedPlanet.seed}</p>
              </div>
              <Button className="h-9 w-9 px-0" onClick={closePlanet} type="button">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PlanetDeepDataEditor
              planet={selectedPlanet}
              activeTab={selectedPlanetTab}
              onTabChange={setSelectedPlanetTab}
              onSave={savePlanetDeepData}
            />
            {selectedPlanetTab === "overview" ? <div className="grid gap-5 p-5 xl:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <div className="relative grid aspect-square max-h-[64vh] place-items-center overflow-hidden rounded-md border border-cyan-300/10 bg-black p-6">
                  {largestVariant(selectedPlanet) || selectedPlanet.image_url ? (
                    <img
                      className="h-[88%] w-[88%] object-contain"
                      src={largestVariant(selectedPlanet)?.url ?? selectedPlanet.image_url ?? ""}
                      alt={`${selectedPlanet.name} planet render`}
                    />
                  ) : (
                    <div className="h-56 w-56 rounded-full border border-cyan-300/25" style={placeholderStyle(selectedPlanet)} />
                  )}
                  {renderingPlanetId === selectedPlanet.id ? (
                    <p className="absolute bottom-5 rounded border border-cyan-300/20 bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                      Rendering procedural PNG
                    </p>
                  ) : null}
                  {isFixedSolPlanet(selectedPlanet) && !largestVariant(selectedPlanet) && !selectedPlanet.image_url ? (
                    <p className="absolute left-5 top-5 rounded border border-amber-200/30 bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
                      Placeholder Artwork
                    </p>
                  ) : null}
                </div>
                <p className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-200">{selectedPlanet.story}</p>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Surface Landscape</p>
                      <p className="mt-1 text-xs text-slate-400">High-resolution surface landscape view.</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    {secondaryArtworkUrl(selectedPlanet) ? (
                      <button
                        type="button"
                        className="block w-full overflow-hidden rounded-md bg-black text-left"
                        onClick={() =>
                          setLightboxImage({
                            url: secondaryArtworkUrl(selectedPlanet),
                            alt: `${selectedPlanet.name} surface landscape`
                          })
                        }
                      >
                        <img
                          className="h-auto w-full object-contain"
                          src={secondaryArtworkUrl(selectedPlanet)}
                          alt={`${selectedPlanet.name} surface landscape`}
                        />
                      </button>
                    ) : (
                      <div className="grid aspect-video place-items-center rounded-md bg-black">
                        <div className="flex flex-col items-center gap-2 text-center text-slate-500">
                          <ImageIcon className="h-8 w-8 text-cyan-200/50" />
                          <p className="text-xs">No surface landscape render yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {detailPill("Sector", selectedPlanet.galaxy_sector)}
                  {detailPill("System", selectedPlanet.star_system)}
                  {detailPill("Orbit", selectedPlanet.orbit_position)}
                  {detailPill("Star Type", selectedPlanet.star_type)}
                  {detailPill("Distance", selectedPlanet.distance_from_star)}
                  {detailPill("Orbit Speed", selectedPlanet.orbit_speed)}
                  {detailPill("Rarity", normalizePlanetRarity(selectedPlanet.rarity).name)}
                  {detailPill("Biome", planetBiomeLabel(selectedPlanet))}
                  {detailPill("Subclass", planetSubclassLabel(selectedPlanet))}
                  {detailPill("Climate", selectedPlanet.climate)}
                  {detailPill("Atmosphere", selectedPlanet.atmosphere)}
                  {detailPill("Temperature", selectedPlanet.temperature)}
                  {detailPill("Gravity", selectedPlanet.gravity)}
                  {isGasGiant(selectedPlanet) ? detailPill("Landable", "No") : detailPill("Water", selectedPlanet.water_coverage)}
                  {detailPill("Moons", selectedPlanet.moons)}
                  {isGasGiant(selectedPlanet) ? detailPill("Interaction", "Orbital Harvesting") : detailPill("Flora", selectedPlanet.flora)}
                  {isGasGiant(selectedPlanet) ? detailPill("Hazard Level", selectedPlanet.gas_giant_hazard_level || 0) : detailPill("Fauna", selectedPlanet.fauna)}
                  {detailPill("Ancients", selectedPlanet.ancient_civilization)}
                  {detailPill("Ruins", selectedPlanet.ruins)}
                  {isGasGiant(selectedPlanet) ? detailPill("Orbital Slots", selectedPlanet.orbital_slot_count || 0) : detailPill("Colonized", selectedPlanet.colonized)}
                </div>
                {isGasGiant(selectedPlanet) ? (
                  <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Orbital Resource Loop</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {detailPill("Harvest Rate", `${selectedPlanet.atmospheric_harvest_rate || 0}/cycle`)}
                      {detailPill("Platform Slots", selectedPlanet.orbital_slot_count || 0)}
                      {detailPill("Surface Exploration", "Disabled")}
                      {detailPill("Terrain Generation", "Disabled")}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="space-y-4">
                {[
                  [isGasGiant(selectedPlanet) ? "Atmospheric Resources" : "Resources", displayResourceNames(selectedPlanet)],
                  ["Hazards", selectedPlanet.hazards],
                  ["Traits", selectedPlanet.traits],
                  ...(isGasGiant(selectedPlanet)
                    ? [
                        ["Orbital Structures", selectedPlanet.orbital_platforms_built],
                        ["Required Technology", selectedPlanet.required_technology],
                        ["Transport Options", selectedPlanet.resource_transport_options]
                      ] as [string, string[]][]
                    : []),
                  ["Anomalies", selectedPlanet.anomalies],
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
            </div> : null}
          </section>
        </div>
      ) : null}
      {lightboxImage ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/95 p-4" onClick={() => setLightboxImage(null)}>
          <Button
            className="absolute right-4 top-4 h-9 w-9 px-0"
            onClick={(event) => {
              event.stopPropagation();
              setLightboxImage(null);
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
          <img
            className="max-h-[92vh] max-w-[96vw] object-contain"
            src={lightboxImage.url}
            alt={lightboxImage.alt}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
