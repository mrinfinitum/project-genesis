import { NextResponse } from "next/server";
import { getGameData } from "@/lib/data";
import { toCsv } from "@/lib/export/csv";
import { editableTables } from "@/lib/tables";

type Params = {
  params: Promise<{ dataset: string }>;
};

const jsonDatasets = new Set([
  "all",
  "game-data",
  "research",
  "buildings",
  "unlock_matrix",
  "unlock-matrix",
  "wonders",
  "districts",
  "upgrades",
  "building_relationships",
  "building-relationships",
  "building_chains",
  "game_constants",
  "feature_flags",
  "planets",
  "planetary-rules",
  "generated_planets",
  "generated-planets",
  "research.json",
  "buildings.json",
  "unlock_matrix.json",
  "unlock-matrix.json",
  "wonders.json",
  "districts.json",
  "upgrades.json",
  "building_relationships.json",
  "building-relationships.json",
  "building_chains.json",
  "game_constants.json",
  "feature_flags.json",
  "planets.json",
  "planetary-rules.json",
  "generated_planets.json",
  "generated-planets.json"
]);

function normalizeDataset(dataset: string) {
  const withoutExtension = dataset.replace(".json", "");
  if (withoutExtension === "game-data") {
    return "all";
  }

  if (withoutExtension === "planetary-rules") {
    return "planets";
  }

  return withoutExtension.replace(/-/g, "_");
}

export async function GET(request: Request, { params }: Params) {
  const { dataset } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? (dataset.endsWith(".json") ? "json" : "json");
  const normalized = normalizeDataset(dataset);
  const data = await getGameData();

  if (format === "csv" && editableTables.includes(normalized as never)) {
    const csv = toCsv(data[normalized as keyof typeof data] as Record<string, unknown>[]);
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${normalized}.csv"`
      }
    });
  }

  if (normalized === "all") {
    return NextResponse.json(data);
  }

  if (!jsonDatasets.has(dataset) || !(normalized in data)) {
    return NextResponse.json({ error: "Unknown export dataset." }, { status: 404 });
  }

  return NextResponse.json(data[normalized as keyof typeof data]);
}
