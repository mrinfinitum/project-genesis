import { NextResponse } from "next/server";
import { handoffData } from "@/data/handoff";
import { generatePlanet } from "@/lib/planets/generator";
import { getRows, upsertRow } from "@/lib/data";
import type { GeneratedPlanet, PlanetVariable } from "@/types/schema";

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

  return fallback;
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
    const body = (await request.json().catch(() => ({}))) as { seed?: string };
    const [rules, existingRows] = await Promise.all([getRows("planets"), getRows("generated_planets")]);
    const ruleRows = rules.length ? rules : handoffData.planets;
    const planet = generatePlanet(ruleRows as PlanetVariable[], existingRows.length, body.seed);
    const row = await upsertRow("generated_planets", planet as unknown as Record<string, unknown>);

    return NextResponse.json({ row: row as GeneratedPlanet }, { status: 201 });
  } catch (error) {
    const message = errorMessage(error, "Could not generate planet.");
    const hint = message.includes("generated_planets") ? `${message} Run supabase/migrations/202607011735_add_generated_planets.sql in Supabase.` : message;
    return NextResponse.json({ error: hint }, { status: 500 });
  }
}
