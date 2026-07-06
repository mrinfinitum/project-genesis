import { handoffData } from "@/data/handoff";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createSupabaseAdminClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import { editableTables } from "@/lib/tables";
import type { GameData, TableName } from "@/types/schema";

type DataTableName = keyof GameData;

const mutableFallback = new Map<DataTableName, Record<string, unknown>[]>();
const localDataDir = path.join(process.cwd(), ".local-data");

async function persistFallbackRows(table: DataTableName, rows: Record<string, unknown>[]) {
  await mkdir(localDataDir, { recursive: true });
  await writeFile(path.join(localDataDir, `${table}.json`), JSON.stringify(rows, null, 2));
}

async function getFallbackRows(table: DataTableName) {
  if (!mutableFallback.has(table)) {
    try {
      const localJson = await readFile(path.join(localDataDir, `${table}.json`), "utf8");
      mutableFallback.set(table, JSON.parse(localJson) as Record<string, unknown>[]);
    } catch {
      mutableFallback.set(table, [...((handoffData[table] as Record<string, unknown>[] | undefined) ?? [])]);
    }
  }

  return mutableFallback.get(table) ?? [];
}

async function getRowsFromSupabaseOrFallback(table: DataTableName) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    console.error(`Supabase read failed for ${table}; using bundled fallback data.`, error.message);
    return getFallbackRows(table);
  }

  return data ?? [];
}

export function isEditableTable(table: string): table is TableName {
  return editableTables.includes(table as TableName);
}

export async function getRows(table: TableName) {
  if (!hasSupabaseServerConfig()) {
    return getFallbackRows(table);
  }

  return getRowsFromSupabaseOrFallback(table);
}

export async function upsertRow(table: TableName, row: Record<string, unknown>) {
  if (!hasSupabaseServerConfig()) {
    const rows = await getFallbackRows(table);
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) {
      rows[index] = row;
    } else {
      rows.unshift(row);
    }
    await persistFallbackRows(table, rows);
    return row;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).upsert(row).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteRow(table: TableName, id: string) {
  if (!hasSupabaseServerConfig()) {
    const rows = await getFallbackRows(table);
    const index = rows.findIndex((item) => item.id === id);
    if (index >= 0) {
      rows.splice(index, 1);
      await persistFallbackRows(table, rows);
    }
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getGameData(): Promise<GameData> {
  if (!hasSupabaseServerConfig()) {
    const [
      research,
      buildings,
      unlockMatrix,
      districts,
      wonders,
      upgrades,
      buildingRelationships,
      buildingChains,
      gameConstants,
      featureFlags,
      assets,
      conceptualArt,
      planets,
      planetResourceProfiles,
      resourceCatalog,
      generatedPlanets,
      planetRenderLibrary,
      aiInbox,
      promptTemplates
    ] = await Promise.all([
      getFallbackRows("research"),
      getFallbackRows("buildings"),
      getFallbackRows("unlock_matrix"),
      getFallbackRows("districts"),
      getFallbackRows("wonders"),
      getFallbackRows("upgrades"),
      getFallbackRows("building_relationships"),
      getFallbackRows("building_chains"),
      getFallbackRows("game_constants"),
      getFallbackRows("feature_flags"),
      getFallbackRows("assets"),
      getFallbackRows("conceptual_art"),
      getFallbackRows("planets"),
      getFallbackRows("planet_resource_profiles"),
      getFallbackRows("resource_catalog"),
      getFallbackRows("generated_planets"),
      getFallbackRows("planet_render_library"),
      getFallbackRows("ai_inbox"),
      getFallbackRows("prompt_templates")
    ]);

    return {
      ...handoffData,
      research: research as GameData["research"],
      buildings: buildings as GameData["buildings"],
      unlock_matrix: unlockMatrix as GameData["unlock_matrix"],
      districts: districts as GameData["districts"],
      wonders: wonders as GameData["wonders"],
      upgrades: upgrades as GameData["upgrades"],
      building_relationships: buildingRelationships as GameData["building_relationships"],
      building_chains: buildingChains as GameData["building_chains"],
      game_constants: gameConstants as GameData["game_constants"],
      feature_flags: featureFlags as GameData["feature_flags"],
      assets: assets as GameData["assets"],
      conceptual_art: conceptualArt as GameData["conceptual_art"],
      planets: planets as GameData["planets"],
      planet_resource_profiles: planetResourceProfiles as GameData["planet_resource_profiles"],
      resource_catalog: resourceCatalog as GameData["resource_catalog"],
      generated_planets: generatedPlanets as GameData["generated_planets"],
      planet_render_library: planetRenderLibrary as GameData["planet_render_library"],
      ai_inbox: aiInbox as GameData["ai_inbox"],
      prompt_templates: promptTemplates as GameData["prompt_templates"]
    };
  }

  const [
    researchBranches,
    research,
    buildings,
    unlockMatrix,
    districts,
    wonders,
    upgrades,
    buildingRelationships,
    buildingChains,
    gameConstants,
    featureFlags,
    assets,
    conceptualArt,
    planets,
    planetResourceProfiles,
    resourceCatalog,
    generatedPlanets,
    planetRenderLibrary,
    aiInbox,
    promptTemplates,
    releaseNotes,
    changelog
  ] = await Promise.all([
    getRowsFromSupabaseOrFallback("research_branches"),
    getRowsFromSupabaseOrFallback("research"),
    getRowsFromSupabaseOrFallback("buildings"),
    getRowsFromSupabaseOrFallback("unlock_matrix"),
    getRowsFromSupabaseOrFallback("districts"),
    getRowsFromSupabaseOrFallback("wonders"),
    getRowsFromSupabaseOrFallback("upgrades"),
    getRowsFromSupabaseOrFallback("building_relationships"),
    getRowsFromSupabaseOrFallback("building_chains"),
    getRowsFromSupabaseOrFallback("game_constants"),
    getRowsFromSupabaseOrFallback("feature_flags"),
    getRowsFromSupabaseOrFallback("assets"),
    getRowsFromSupabaseOrFallback("conceptual_art"),
    getRowsFromSupabaseOrFallback("planets"),
    getRowsFromSupabaseOrFallback("planet_resource_profiles"),
    getRowsFromSupabaseOrFallback("resource_catalog"),
    getRowsFromSupabaseOrFallback("generated_planets"),
    getRowsFromSupabaseOrFallback("planet_render_library"),
    getRowsFromSupabaseOrFallback("ai_inbox"),
    getRowsFromSupabaseOrFallback("prompt_templates"),
    getRowsFromSupabaseOrFallback("release_notes"),
    getRowsFromSupabaseOrFallback("changelog")
  ]);

  return {
    research_branches: researchBranches as GameData["research_branches"],
    research: research as GameData["research"],
    buildings: buildings as GameData["buildings"],
    unlock_matrix: unlockMatrix as GameData["unlock_matrix"],
    districts: districts as GameData["districts"],
    wonders: wonders as GameData["wonders"],
    upgrades: upgrades as GameData["upgrades"],
    building_relationships: buildingRelationships as GameData["building_relationships"],
    building_chains: buildingChains as GameData["building_chains"],
    game_constants: gameConstants as GameData["game_constants"],
    feature_flags: featureFlags as GameData["feature_flags"],
    assets: assets as GameData["assets"],
    conceptual_art: conceptualArt as GameData["conceptual_art"],
    planets: planets as GameData["planets"],
    planet_resource_profiles: planetResourceProfiles as GameData["planet_resource_profiles"],
    resource_catalog: resourceCatalog as GameData["resource_catalog"],
    generated_planets: generatedPlanets as GameData["generated_planets"],
    planet_render_library: planetRenderLibrary as GameData["planet_render_library"],
    ai_inbox: aiInbox as GameData["ai_inbox"],
    prompt_templates: promptTemplates as GameData["prompt_templates"],
    release_notes: releaseNotes as GameData["release_notes"],
    changelog: changelog as GameData["changelog"]
  };
}
