import { NextResponse } from "next/server";
import { handoffData } from "@/data/handoff";
import { generatePlanet } from "@/lib/planets/generator";
import { getRows, upsertRow } from "@/lib/data";
import { imageVariantsFromRender, matchPlanetRender } from "@/lib/planets/render-library";
import { hasLockedPlanetRender } from "@/lib/planets/render-lock";
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
  return message.includes("generated_planets") && /(image_(url|prompt|status|variants)|rarity|planet_subclass|anomalies)/.test(message);
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
  const unsupportedColumns = new Set(["image_url", "image_prompt", "image_status", "image_variants", "rarity", "planet_subclass", "anomalies"]);

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

export async function GET() {
  try {
    const rows = await getRows("generated_planets");
    return NextResponse.json({ rows: sortRows(rows) });
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
    const ruleRows = rules.length ? rules : handoffData.planets;
    const profileRows = resourceProfiles.length ? resourceProfiles : handoffData.planet_resource_profiles;
    const planet = generatePlanet(ruleRows as PlanetVariable[], existingRows.length, body.seed, {
      planetClass: body.planetClass,
      planetSubclass: body.planetSubclass,
      primaryBiome: body.primaryBiome,
      resourceProfiles: profileRows as PlanetResourceProfile[]
    });
    const existingPlanet = (existingRows as GeneratedPlanet[]).find((row) => row.id === planet.id);

    if (existingPlanet && hasLockedPlanetRender(existingPlanet)) {
      return NextResponse.json({ row: existingPlanet, preserved: true }, { status: 200 });
    }

    const renderMatch = matchPlanetRender(planet, renderLibrary as PlanetRenderLibraryRecord[]);
    const planetWithLibraryRender = renderMatch
      ? {
          ...planet,
          image_url: renderMatch.render.file_url,
          image_prompt: `Matched pre-rendered planet library asset "${renderMatch.render.name}" with score ${Math.round(renderMatch.score)} (${renderMatch.reasons.join(", ")}).`,
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

    return NextResponse.json({ row: { ...planetWithLibraryRender, ...row } as GeneratedPlanet }, { status: 201 });
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
