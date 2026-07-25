import { NextResponse } from "next/server";
import { handoffData } from "@/data/handoff";
import { generatePlanet } from "@/lib/planets/generator";
import { getRows, upsertRow } from "@/lib/data";
import { withFixedSolGeneratedPlanets } from "@/lib/planets/fixed-sol-planets";
import { imageVariantsFromRender, matchPlanetRender } from "@/lib/planets/render-library";
import { hasLockedPlanetRender } from "@/lib/planets/render-lock";
import { ensurePlanetDeepData } from "@/lib/planets/deep-data";
import { planetGenerationRuleRows } from "@/lib/planets/rule-rows";
import type { GeneratedPlanet, PlanetRenderLibraryRecord, PlanetResourceProfile, PlanetVariable } from "@/types/schema";

export const runtime = "nodejs";

function sortRows(rows: Record<string, unknown>[]) {
  return [...rows].sort((left, right) => String(right.created_at ?? "").localeCompare(String(left.created_at ?? "")));
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      return String(error);
    }
  }

  return fallback;
}

function isMissingGeneratedPlanetOptionalColumn(error: unknown) {
  const message = errorMessage(error, "");
  return message.includes("generated_planets") && /(resource_ids|deep_planet_data|image_(url|prompt|status|variants)|orbit_view_(prompt|image_url)|surface_landscape_(prompt|image_url|status|notes)|rarity|planet_subclass|anomalies|colonizable|landable|surface_exploration|terrain_generation|uses_orbital_gameplay|orbital_slot_count|orbital_platforms_built|atmospheric_harvest_rate|gas_giant_hazard_level|required_technology|resource_transport_options)/.test(message);
}

function unsupportedGeneratedPlanetColumn(error: unknown) {
  const message = errorMessage(error, "");
  const match =
    message.match(/'([^']+)' column/) ??
    message.match(/column generated_planets\.([a-z_]+) does not exist/) ??
    message.match(/Could not find the ([a-z_]+) column/);

  return match?.[1] ?? "";
}

async function upsertGeneratedPlanet(planet: GeneratedPlanet) {
  const row = { ...(planet as unknown as Record<string, unknown>) };
  if (planet.resourceIds) {
    row.resource_ids = planet.resourceIds;
    delete row.resourceIds;
  }
  if (planet.deepPlanetData) {
    row.deep_planet_data = planet.deepPlanetData;
    delete row.deepPlanetData;
  }
  const unsupportedColumns = new Set([
    "resource_ids",
    "deep_planet_data",
    "image_url",
    "image_prompt",
    "image_status",
    "image_variants",
    "orbit_view_prompt",
    "orbit_view_image_url",
    "surface_landscape_prompt",
    "surface_landscape_image_url",
    "surface_landscape_status",
    "surface_landscape_notes",
    "rarity",
    "planet_subclass",
    "anomalies",
    "colonizable",
    "landable",
    "surface_exploration",
    "terrain_generation",
    "uses_orbital_gameplay",
    "orbital_slot_count",
    "orbital_platforms_built",
    "atmospheric_harvest_rate",
    "gas_giant_hazard_level",
    "required_technology",
    "resource_transport_options"
  ]);

  for (let attempt = 0; attempt < unsupportedColumns.size + 1; attempt += 1) {
    try {
      return await upsertRow("generated_planets", row);
    } catch (error) {
      const column = unsupportedGeneratedPlanetColumn(error);

      if (!isMissingGeneratedPlanetOptionalColumn(error) || !unsupportedColumns.has(column) || !(column in row)) {
        throw error;
      }

      delete row[column];
    }
  }

  return upsertRow("generated_planets", row);
}

function hydrateGeneratedPlanet(row: GeneratedPlanet & { resource_ids?: string[] }) {
  const hydrated = {
    ...row,
    resourceIds: row.resourceIds ?? row.resource_ids,
    deepPlanetData: row.deepPlanetData ?? row.deep_planet_data
  } as GeneratedPlanet;
  hydrated.deepPlanetData = ensurePlanetDeepData(hydrated);
  return hydrated;
}

export async function GET() {
  try {
    const [rows, renderLibrary] = await Promise.all([getRows("generated_planets"), getRows("planet_render_library").catch(() => [])]);
    const hydratedRows = withFixedSolGeneratedPlanets((rows as Array<GeneratedPlanet & { resource_ids?: string[] }>).map(hydrateGeneratedPlanet), renderLibrary as PlanetRenderLibraryRecord[])
      .map((planet) => ({ ...planet, deepPlanetData: ensurePlanetDeepData(planet) }));
    return NextResponse.json({ rows: sortRows(hydratedRows) });
  } catch (error) {
    const message = errorMessage(error, "Could not load generated planets.");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      seed?: string;
      planetClass?: string;
      planetSubclass?: string;
      primaryBiome?: string;
    };
    const [rules, resourceProfiles, existingRows, renderLibrary] = await Promise.all([
      getRows("planets"),
      getRows("planet_resource_profiles"),
      getRows("generated_planets"),
      getRows("planet_render_library")
    ]);
    const ruleRows = planetGenerationRuleRows(rules as PlanetVariable[], handoffData.planets);
    const profileRows = resourceProfiles.length ? resourceProfiles : handoffData.planet_resource_profiles;
    const planet = generatePlanet(ruleRows as PlanetVariable[], existingRows.length, body.seed, {
      planetClass: body.planetClass,
      planetSubclass: body.planetSubclass,
      primaryBiome: body.primaryBiome,
      resourceProfiles: profileRows as PlanetResourceProfile[]
    });
    const existingPlanet = (existingRows as Array<GeneratedPlanet & { resource_ids?: string[] }>).map(hydrateGeneratedPlanet).find((row) => row.id === planet.id);

    if (existingPlanet && hasLockedPlanetRender(existingPlanet)) {
      return NextResponse.json({ row: existingPlanet, preserved: true }, { status: 200 });
    }

    const renderMatch = matchPlanetRender(planet, renderLibrary as PlanetRenderLibraryRecord[]);
    const matchedSecondaryArtworkUrl = renderMatch
      ? planet.uses_orbital_gameplay || planet.planet_class === "Gas Giant"
        ? renderMatch.render.orbital_image_url || renderMatch.render.landscape_image_url || ""
        : renderMatch.render.landscape_image_url || ""
      : "";
    const planetWithLibraryRender = renderMatch
      ? {
          ...planet,
          image_url: renderMatch.render.file_url,
          orbit_view_image_url: renderMatch.render.file_url,
          surface_landscape_image_url: matchedSecondaryArtworkUrl || planet.surface_landscape_image_url,
          surface_landscape_status: matchedSecondaryArtworkUrl ? "Library Match" : planet.surface_landscape_status,
          image_prompt: `Matched pre-rendered planet library asset "${renderMatch.render.name}" with score ${Math.round(renderMatch.score)} (${renderMatch.reasons.join(", ")}).`,
          orbit_view_prompt: planet.orbit_view_prompt ?? planet.image_prompt,
          image_status: "Library Match",
          image_variants: imageVariantsFromRender(renderMatch.render),
          notes: `${planet.notes ? `${planet.notes}\n` : ""}Matched planet render library asset ${renderMatch.render.id}.`
        }
      : planet;
    let row: Record<string, unknown>;

    row = await upsertGeneratedPlanet(planetWithLibraryRender);

    if (renderMatch) {
      await upsertRow("planet_render_library", {
        ...renderMatch.render,
        usage_count: (Number(renderMatch.render.usage_count) || 0) + 1,
        updated_at: new Date().toISOString()
      }).catch((error) => {
        console.error("Planet render library usage update failed", error);
      });
    }

    const savedPlanet = { ...planetWithLibraryRender, ...row } as GeneratedPlanet;
    savedPlanet.deepPlanetData = ensurePlanetDeepData(savedPlanet);
    return NextResponse.json({ row: savedPlanet }, { status: 201 });
  } catch (error) {
    console.error("Planet generation failed", error);
    const message = errorMessage(error, "Could not generate planet.");
    const hint = message.includes("image_")
      ? `${message} Run supabase/migrations/202607011820_add_generated_planet_images.sql in Supabase.`
      : message.includes("generated_planets")
        ? `${message} Run supabase/migrations/202607011735_add_generated_planets.sql in Supabase.`
        : message;
    return NextResponse.json({ error: hint }, { status: 500 });
  }
}
