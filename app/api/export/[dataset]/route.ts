import { NextResponse } from "next/server";
import { getAiAgentLibraryRuntimeExports } from "@/lib/ai-agents";
import { getGameData } from "@/lib/data";
import { toCsv } from "@/lib/export/csv";
import { getGameRuntimeData, validateGameRuntimeData } from "@/lib/runtime/game-runtime";
import { normalizePlanetResourceProfiles, validatePlanetResourceProfiles } from "@/lib/resources/planet-resource-profiles";
import { ResourceService } from "@/lib/resources/service";
import { editableTables } from "@/lib/tables";
import type { PlanetResourceProfile } from "@/types/schema";

type Params = {
  params: Promise<{ dataset: string }>;
};

const jsonDatasets = new Set([
  "all",
  "game-data",
  "game_runtime_data",
  "game-runtime-data",
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
  "resource_migrations",
  "resource-migrations",
  "resource_taxonomy",
  "resource-taxonomy",
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
  "ai_agents",
  "ai-agents",
  "ai_library",
  "ai-library",
  "ai_categories",
  "ai-categories",
  "ai_rarity",
  "ai-rarity",
  "ai_personality_catalog",
  "ai-personality-catalog",
  "ai_voice_catalog",
  "ai-voice-catalog",
  "ai_assignment_roles",
  "ai-assignment-roles",
  "forgotten_terminals",
  "forgotten-terminals",
  "memory_fragments",
  "memory-fragments",
  "ai_relationships",
  "ai-relationships",
  "dialogue_packs",
  "dialogue-packs",
  "research.json",
  "game_runtime_data.json",
  "game-runtime-data.json",
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
  "resource_migrations.json",
  "resource-migrations.json",
  "resource_taxonomy.json",
  "resource-taxonomy.json",
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
  "civilization-bonuses.json",
  "ai_agents.json",
  "ai-agents.json",
  "ai_library.json",
  "ai-library.json",
  "ai_categories.json",
  "ai-categories.json",
  "ai_rarity.json",
  "ai-rarity.json",
  "ai_personality_catalog.json",
  "ai-personality-catalog.json",
  "ai_voice_catalog.json",
  "ai-voice-catalog.json",
  "ai_assignment_roles.json",
  "ai-assignment-roles.json",
  "forgotten_terminals.json",
  "forgotten-terminals.json",
  "memory_fragments.json",
  "memory-fragments.json",
  "ai_relationships.json",
  "ai-relationships.json",
  "dialogue_packs.json",
  "dialogue-packs.json"
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
    return NextResponse.json({
      ...data,
      resource_catalog: ResourceService.catalog,
      planet_resource_profiles: normalizePlanetResourceProfiles(data.planet_resource_profiles as PlanetResourceProfile[])
    });
  }

  if (normalized === "game_runtime_data") {
    const runtimeData = await getGameRuntimeData();
    return NextResponse.json({
      ...runtimeData,
      validation: validateGameRuntimeData(runtimeData)
    });
  }

  if (["ai_library", "ai_categories", "ai_rarity", "ai_personality_catalog", "ai_voice_catalog", "ai_assignment_roles", "ai_agents", "forgotten_terminals", "memory_fragments", "ai_relationships", "dialogue_packs"].includes(normalized)) {
    const exports = await getAiAgentLibraryRuntimeExports();
    return NextResponse.json(exports[normalized as keyof typeof exports]);
  }

  if (normalized === "resource_migrations") return NextResponse.json(ResourceService.migrations);
  if (normalized === "resource_taxonomy") return NextResponse.json({ version: ResourceService.taxonomyVersion, profileGenerationVersion: ResourceService.profileGenerationVersion, validation: ResourceService.validate() });

  if (!jsonDatasets.has(dataset) || !(normalized in data)) {
    return NextResponse.json({ error: "Unknown export dataset." }, { status: 404 });
  }

  if (normalized === "planet_resource_profiles") {
    return NextResponse.json(validatePlanetResourceProfiles(data.planet_resource_profiles as PlanetResourceProfile[]));
  }

  if (normalized === "resource_catalog") {
    return NextResponse.json(ResourceService.catalog);
  }

  return NextResponse.json(data[normalized as keyof typeof data]);
}
