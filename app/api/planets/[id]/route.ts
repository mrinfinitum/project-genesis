import { NextResponse } from "next/server";
import { deleteRow, getRows, upsertRow } from "@/lib/data";
import { ensurePlanetDeepData, validatePlanetDeepData } from "@/lib/planets/deep-data";
import { fixedSolGeneratedPlanets, isFixedSolGeneratedPlanet } from "@/lib/planets/fixed-sol-planets";
import type { GeneratedPlanet } from "@/types/schema";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Planet ID is required." }, { status: 400 });
  }

  if (isFixedSolGeneratedPlanet({ id, seed: id })) {
    return NextResponse.json({ error: "Fixed Sol System planets cannot be deleted from the canonical universe seed." }, { status: 400 });
  }

  try {
    await deleteRow("generated_planets", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete planet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Planet ID is required." }, { status: 400 });
  }

  try {
    const patch = (await request.json().catch(() => ({}))) as Partial<GeneratedPlanet>;
    const rows = (await getRows("generated_planets")) as GeneratedPlanet[];
    const existing = rows.find((row) => row.id === id) ?? fixedSolGeneratedPlanets().find((row) => row.id === id);

    if (!existing) {
      return NextResponse.json({ error: "Planet not found." }, { status: 404 });
    }

    const allowedKeys = new Set([
      "orbit_view_prompt",
      "orbit_view_image_url",
      "surface_landscape_prompt",
      "surface_landscape_image_url",
      "surface_landscape_status",
      "surface_landscape_notes",
      "image_url",
      "image_prompt",
      "image_status",
      "deepPlanetData"
    ]);
    const cleanPatch = Object.fromEntries(Object.entries(patch).filter(([key]) => allowedKeys.has(key)));
    if (patch.deepPlanetData) {
      const validationIssues = validatePlanetDeepData(patch.deepPlanetData);
      const errors = validationIssues.filter((issue) => issue.severity === "error");
      if (errors.length) {
        return NextResponse.json(
          { error: "Planet deep data failed validation.", issues: validationIssues },
          { status: 400 }
        );
      }
      cleanPatch.deep_planet_data = patch.deepPlanetData;
      delete cleanPatch.deepPlanetData;
    }
    const row = await upsertRow("generated_planets", {
      ...existing,
      ...cleanPatch
    });

    const savedPlanet = { ...existing, ...row, deepPlanetData: (row.deep_planet_data ?? patch.deepPlanetData ?? existing.deep_planet_data) } as GeneratedPlanet;
    savedPlanet.deepPlanetData = ensurePlanetDeepData(savedPlanet);
    return NextResponse.json({ row: savedPlanet });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update planet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
