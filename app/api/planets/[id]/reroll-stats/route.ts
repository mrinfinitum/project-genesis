import { NextResponse } from "next/server";
import { handoffData } from "@/data/handoff";
import { getRows, upsertRow } from "@/lib/data";
import { rerollPlanetStats } from "@/lib/planets/reroll";
import type { GeneratedPlanet, PlanetResourceProfile, PlanetVariable } from "@/types/schema";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Planet ID is required." }, { status: 400 });
  }

  try {
    const [rows, rules, resourceProfiles] = await Promise.all([
      getRows("generated_planets"),
      getRows("planets"),
      getRows("planet_resource_profiles")
    ]);
    const existingRows = rows as GeneratedPlanet[];
    const existing = existingRows.find((row) => row.id === id);

    if (!existing) {
      return NextResponse.json({ error: "Planet not found." }, { status: 404 });
    }

    const row = rerollPlanetStats(
      existing,
      (rules.length ? rules : handoffData.planets) as PlanetVariable[],
      (resourceProfiles.length ? resourceProfiles : handoffData.planet_resource_profiles) as PlanetResourceProfile[],
      Math.max(0, Number(existing.discovery_order || existingRows.length) - 1)
    );
    const saved = await upsertRow("generated_planets", row as unknown as Record<string, unknown>);

    return NextResponse.json({ row: { ...row, ...saved } as GeneratedPlanet });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reroll planet stats.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
