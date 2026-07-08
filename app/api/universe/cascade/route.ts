import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import {
  generateCelestialBodies,
  generateGalaxy,
  generateSector,
  generateStarSystem,
  restoreFixedSolSystem
} from "@/lib/universe/seeded-cascade";

type CascadeScope = "galaxy" | "sector" | "star-system" | "sol";

type CascadeRequest = {
  scope?: CascadeScope;
  seed?: string;
  galaxyIndex?: number;
  sectorIndex?: number;
  systemIndex?: number;
};

function timestamp(value: unknown) {
  if (value === "derived") return new Date().toISOString();
  return value;
}

function cleanRow<T extends Record<string, unknown>>(row: T) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      if (key.endsWith("_at") || key === "created_at" || key === "updated_at") {
        return [key, timestamp(value)];
      }
      return [key, value];
    })
  );
}

function omit<T extends Record<string, unknown>>(row: T, keys: string[]) {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !keys.includes(key)));
}

async function upsertMany(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).upsert(rows).select("*");

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return data ?? [];
}

export async function POST(request: Request) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json({ error: "Supabase is not configured for server-side saves." }, { status: 500 });
  }

  const body = (await request.json()) as CascadeRequest;
  const seed = body.seed?.trim() || "PROJECT-GENESIS-UNIVERSE";
  const galaxyIndex = Math.max(0, Number(body.galaxyIndex ?? 0) || 0);
  const sectorIndex = Math.max(0, Number(body.sectorIndex ?? 0) || 0);
  const systemIndex = Math.max(0, Number(body.systemIndex ?? 0) || 0);
  const scope = body.scope ?? "galaxy";

  try {
    if (scope === "sol") {
      const sol = restoreFixedSolSystem();
      await upsertMany("universes", [cleanRow(sol.universe)]);
      await upsertMany("galaxies", [cleanRow(sol.galaxy)]);
      await upsertMany("sectors", [cleanRow(sol.sector)]);
      await upsertMany("star_systems", [cleanRow(sol.star_system)]);
      await upsertMany("stars", sol.stars.map((star) => cleanRow(star)));
      await upsertMany("celestial_bodies", sol.celestial_bodies.map((row) => cleanRow(row)));

      return NextResponse.json({
        scope,
        saved: {
          universes: 1,
          galaxies: 1,
          sectors: 1,
          star_systems: 1,
          stars: sol.stars.length,
          celestial_bodies: sol.celestial_bodies.length
        }
      });
    }

    const galaxyPreview = generateGalaxy(seed, { galaxyIndex, sectorLimit: Math.max(sectorIndex + 1, 64) });
    const selectedSector = galaxyPreview.sectors[sectorIndex] ?? galaxyPreview.sectors[0];
    const sectorPreview = generateSector(seed, galaxyPreview.galaxy, { sectorIndex, systemLimit: Math.max(systemIndex + 1, 24) });
    const selectedSystem = sectorPreview.star_systems[systemIndex] ?? sectorPreview.star_systems[0];
    const systemPreview = generateStarSystem(seed, selectedSector, { systemIndex });
    const celestialBodies = generateCelestialBodies(seed, selectedSystem);

    if (scope === "galaxy") {
      await upsertMany("universes", [cleanRow(galaxyPreview.universe)]);
      await upsertMany("galaxies", [cleanRow(galaxyPreview.galaxy)]);
      await upsertMany("sectors", galaxyPreview.sectors.map((sector) => cleanRow(sector)));

      return NextResponse.json({
        scope,
        saved: { universes: 1, galaxies: 1, sectors: galaxyPreview.sectors.length }
      });
    }

    if (scope === "sector") {
      await upsertMany("universes", [cleanRow(galaxyPreview.universe)]);
      await upsertMany("galaxies", [cleanRow(galaxyPreview.galaxy)]);
      await upsertMany("sectors", [cleanRow(sectorPreview.sector)]);
      await upsertMany("star_systems", sectorPreview.star_systems.map((system) => cleanRow(system)));

      return NextResponse.json({
        scope,
        saved: { universes: 1, galaxies: 1, sectors: 1, star_systems: sectorPreview.star_systems.length }
      });
    }

    await upsertMany("universes", [cleanRow(galaxyPreview.universe)]);
    await upsertMany("galaxies", [cleanRow(galaxyPreview.galaxy)]);
    await upsertMany("sectors", [cleanRow(selectedSector)]);
    await upsertMany("star_systems", [cleanRow(systemPreview.star_system)]);
    await upsertMany("stars", systemPreview.stars.map((star) => cleanRow(star)));
    await upsertMany("celestial_bodies", celestialBodies.map((row) => cleanRow(omit(row, ["orbit_view_prompt", "surface_landscape_prompt", "hero_discovery_prompt"]))));

    return NextResponse.json({
      scope,
      saved: {
        universes: 1,
        galaxies: 1,
        sectors: 1,
        star_systems: 1,
        stars: systemPreview.stars.length,
        celestial_bodies: celestialBodies.length
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save seeded cascade.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
