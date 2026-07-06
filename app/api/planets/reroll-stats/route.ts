import { NextResponse } from "next/server";
import { handoffData } from "@/data/handoff";
import { getRows, upsertRow } from "@/lib/data";
import { generatedPlanetStorageRow, rerollPlanetStats } from "@/lib/planets/reroll";
import type { GeneratedPlanet, PlanetResourceProfile, PlanetVariable } from "@/types/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

function sortRows(rows: GeneratedPlanet[]) {
  return [...rows].sort((left, right) => String(right.created_at ?? "").localeCompare(String(left.created_at ?? "")));
}

export async function POST() {
  try {
    const [rows, rules, resourceProfiles] = await Promise.all([
      getRows("generated_planets"),
      getRows("planets"),
      getRows("planet_resource_profiles")
    ]);
    const existingRows = rows as GeneratedPlanet[];
    const ruleRows = (rules.length ? rules : handoffData.planets) as PlanetVariable[];
    const profileRows = (resourceProfiles.length ? resourceProfiles : handoffData.planet_resource_profiles) as PlanetResourceProfile[];
    const savedRows: GeneratedPlanet[] = [];
    const failures: Array<{ id: string; name: string; error: string }> = [];

    for (const existing of existingRows) {
      try {
        const row = rerollPlanetStats(existing, ruleRows, profileRows, Math.max(0, Number(existing.discovery_order || savedRows.length + 1) - 1));
        const saved = await upsertRow("generated_planets", generatedPlanetStorageRow(row));
        savedRows.push({ ...row, ...saved } as GeneratedPlanet);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown reroll error.";
        failures.push({ id: existing.id, name: existing.name, error: message });
        console.error(`Planet reroll failed for ${existing.id}`, error);
      }
    }

    return NextResponse.json({ rows: sortRows(savedRows), count: savedRows.length, failures }, { status: failures.length ? 207 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reroll planet stats.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
