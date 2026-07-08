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
  "planet_resource_profiles",
  "planet-resource-profiles",
  "planet-resources",
  "resource_catalog",
  "resource-catalog",
  "resources",
  "generated_planets",
  "generated-planets",
  "planet_prompt_library",
  "planet-prompt-library",
  "planet_render_library",
  "planet-render-library",
  "civilization_identity",
  "civilization-identity",
  "civilization_alignment_scores",
  "civilization-alignment-scores",
  "civilization_alignment_history",
  "civilization-alignment-history",
  "civilization_milestones",
  "civilization-milestones",
  "civilization_unlocked_milestones",
  "civilization-unlocked-milestones",
  "civilization_titles",
  "civilization-titles",
  "civilization_bonuses",
  "civilization-bonuses",
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
  "planet_resource_profiles.json",
  "planet-resource-profiles.json",
  "planet-resources.json",
  "resource_catalog.json",
  "resource-catalog.json",
  "resources.json",
  "generated_planets.json",
  "generated-planets.json",
  "planet_prompt_library.json",
  "planet-prompt-library.json",
  "planet_render_library.json",
  "planet-render-library.json",
  "civilization_identity.json",
  "civilization-identity.json",
  "civilization_alignment_scores.json",
  "civilization-alignment-scores.json",
  "civilization_alignment_history.json",
  "civilization-alignment-history.json",
  "civilization_milestones.json",
  "civilization-milestones.json",
  "civilization_unlocked_milestones.json",
  "civilization-unlocked-milestones.json",
  "civilization_titles.json",
  "civilization-titles.json",
  "civilization_bonuses.json",
  "civilization-bonuses.json"
]);

function normalizeDataset(dataset: string) {
  const withoutExtension = dataset.replace(".json", "");
  if (withoutExtension === "game-data") {
    return "all";
  }

  if (withoutExtension === "planetary-rules") {
    return "planets";
  }

  if (withoutExtension === "planet-resources") {
    return "planet_resource_profiles";
  }

  if (withoutExtension === "resources") {
    return "resource_catalog";
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
