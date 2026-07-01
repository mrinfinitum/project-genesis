import { handoffData } from "@/data/handoff";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createSupabaseAdminClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import { editableTables } from "@/lib/tables";
import type { GameData, TableName } from "@/types/schema";

const mutableFallback = new Map<TableName, Record<string, unknown>[]>();
const localDataDir = path.join(process.cwd(), ".local-data");

async function persistFallbackRows(table: TableName, rows: Record<string, unknown>[]) {
  await mkdir(localDataDir, { recursive: true });
  await writeFile(path.join(localDataDir, `${table}.json`), JSON.stringify(rows, null, 2));
}

async function getFallbackRows(table: TableName) {
  if (!mutableFallback.has(table)) {
    try {
      const localJson = await readFile(path.join(localDataDir, `${table}.json`), "utf8");
      mutableFallback.set(table, JSON.parse(localJson) as Record<string, unknown>[]);
    } catch {
      mutableFallback.set(table, [...(handoffData[table] as Record<string, unknown>[])]);
    }
  }

  return mutableFallback.get(table) ?? [];
}

export function isEditableTable(table: string): table is TableName {
  return editableTables.includes(table as TableName);
}

export async function getRows(table: TableName) {
  if (!hasSupabaseServerConfig()) {
    return getFallbackRows(table);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    throw error;
  }

  return data ?? [];
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
      assets
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
      getFallbackRows("assets")
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
      assets: assets as GameData["assets"]
    };
  }

  const supabase = createSupabaseAdminClient();
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
    releaseNotes,
    changelog
  ] = await Promise.all([
    supabase.from("research_branches").select("*"),
    supabase.from("research").select("*"),
    supabase.from("buildings").select("*"),
    supabase.from("unlock_matrix").select("*"),
    supabase.from("districts").select("*"),
    supabase.from("wonders").select("*"),
    supabase.from("upgrades").select("*"),
    supabase.from("building_relationships").select("*"),
    supabase.from("building_chains").select("*"),
    supabase.from("game_constants").select("*"),
    supabase.from("feature_flags").select("*"),
    supabase.from("assets").select("*"),
    supabase.from("release_notes").select("*"),
    supabase.from("changelog").select("*")
  ]);

  const responses = [
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
    releaseNotes,
    changelog
  ];
  const failed = responses.find((response) => response.error);
  if (failed?.error) {
    throw failed.error;
  }

  return {
    research_branches: researchBranches.data ?? [],
    research: research.data ?? [],
    buildings: buildings.data ?? [],
    unlock_matrix: unlockMatrix.data ?? [],
    districts: districts.data ?? [],
    wonders: wonders.data ?? [],
    upgrades: upgrades.data ?? [],
    building_relationships: buildingRelationships.data ?? [],
    building_chains: buildingChains.data ?? [],
    game_constants: gameConstants.data ?? [],
    feature_flags: featureFlags.data ?? [],
    assets: assets.data ?? [],
    release_notes: releaseNotes.data ?? [],
    changelog: changelog.data ?? []
  };
}
