import { NextResponse } from "next/server";
import { generatePlanet } from "@/lib/planets/generator";
import { getRows, upsertRow } from "@/lib/data";
import type { GeneratedPlanet, PlanetVariable } from "@/types/schema";

export const runtime = "nodejs";

function sortRows(rows: Record<string, unknown>[]) {
  return [...rows].sort((left, right) => String(right.created_at ?? "").localeCompare(String(left.created_at ?? "")));
}

export async function GET() {
  const rows = await getRows("generated_planets");
  return NextResponse.json({ rows: sortRows(rows) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { seed?: string };
  const [rules, existingRows] = await Promise.all([getRows("planets"), getRows("generated_planets")]);
  const planet = generatePlanet(rules as PlanetVariable[], existingRows.length, body.seed);
  const row = await upsertRow("generated_planets", planet as unknown as Record<string, unknown>);

  return NextResponse.json({ row: row as GeneratedPlanet }, { status: 201 });
}
