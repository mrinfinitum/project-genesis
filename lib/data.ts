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

async function getRowsFromSupabaseOrFallback(table: DataTableName, allowFallback = true) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    if (!allowFallback) {
      throw new Error(`Authoritative Supabase read failed for ${table}: ${error.message}`);
    }
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

export async function getGameData(options: { requireSupabase?: boolean } = {}): Promise<GameData> {
  if (!hasSupabaseServerConfig()) {
    if (options.requireSupabase) {
      throw new Error("Authoritative runtime publication requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
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
      starSystems,
      celestialBodies,
      systemProbes,
      generatedPlanets,
      planetPromptLibrary,
      planetRenderLibrary,
      projectSystems,
      projectSystemHistory,
      dataHealthChecks,
      codexReadinessItems,
      dashboardMetrics,
      codexTasks,
      civilizationIdentity,
      civilizationAlignmentScores,
      civilizationAlignmentHistory,
      civilizationMilestones,
      civilizationUnlockedMilestones,
      civilizationTitles,
      civilizationBonuses
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
      getFallbackRows("star_systems"),
      getFallbackRows("celestial_bodies"),
      getFallbackRows("system_probes"),
      getFallbackRows("generated_planets"),
      getFallbackRows("planet_prompt_library"),
      getFallbackRows("planet_render_library"),
      getFallbackRows("project_systems"),
      getFallbackRows("project_system_history"),
      getFallbackRows("data_health_checks"),
      getFallbackRows("codex_readiness_items"),
      getFallbackRows("dashboard_metrics"),
      getFallbackRows("codex_tasks"),
      getFallbackRows("civilization_identity"),
      getFallbackRows("civilization_alignment_scores"),
      getFallbackRows("civilization_alignment_history"),
      getFallbackRows("civilization_milestones"),
      getFallbackRows("civilization_unlocked_milestones"),
      getFallbackRows("civilization_titles"),
      getFallbackRows("civilization_bonuses")
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
      star_systems: starSystems as GameData["star_systems"],
      celestial_bodies: celestialBodies as GameData["celestial_bodies"],
      system_probes: systemProbes as GameData["system_probes"],
      generated_planets: generatedPlanets as GameData["generated_planets"],
      planet_prompt_library: planetPromptLibrary as GameData["planet_prompt_library"],
      planet_render_library: planetRenderLibrary as GameData["planet_render_library"],
      project_systems: projectSystems as GameData["project_systems"],
      project_system_history: projectSystemHistory as GameData["project_system_history"],
      data_health_checks: dataHealthChecks as GameData["data_health_checks"],
      codex_readiness_items: codexReadinessItems as GameData["codex_readiness_items"],
      dashboard_metrics: dashboardMetrics as GameData["dashboard_metrics"],
      codex_tasks: codexTasks as GameData["codex_tasks"],
      civilization_identity: civilizationIdentity as GameData["civilization_identity"],
      civilization_alignment_scores: civilizationAlignmentScores as GameData["civilization_alignment_scores"],
      civilization_alignment_history: civilizationAlignmentHistory as GameData["civilization_alignment_history"],
      civilization_milestones: civilizationMilestones as GameData["civilization_milestones"],
      civilization_unlocked_milestones: civilizationUnlockedMilestones as GameData["civilization_unlocked_milestones"],
      civilization_titles: civilizationTitles as GameData["civilization_titles"],
      civilization_bonuses: civilizationBonuses as GameData["civilization_bonuses"]
    };
  }

  const readSourceRows = (table: DataTableName) => getRowsFromSupabaseOrFallback(table, !options.requireSupabase);
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
    starSystems,
    celestialBodies,
    systemProbes,
    generatedPlanets,
    planetPromptLibrary,
    planetRenderLibrary,
    releaseNotes,
    changelog,
    projectSystems,
    projectSystemHistory,
    dataHealthChecks,
    codexReadinessItems,
    dashboardMetrics,
    codexTasks,
    civilizationIdentity,
    civilizationAlignmentScores,
    civilizationAlignmentHistory,
    civilizationMilestones,
    civilizationUnlockedMilestones,
    civilizationTitles,
    civilizationBonuses
  ] = await Promise.all([
    readSourceRows("research_branches"),
    readSourceRows("research"),
    readSourceRows("buildings"),
    readSourceRows("unlock_matrix"),
    readSourceRows("districts"),
    readSourceRows("wonders"),
    readSourceRows("upgrades"),
    readSourceRows("building_relationships"),
    readSourceRows("building_chains"),
    readSourceRows("game_constants"),
    readSourceRows("feature_flags"),
    readSourceRows("assets"),
    readSourceRows("conceptual_art"),
    readSourceRows("planets"),
    readSourceRows("planet_resource_profiles"),
    readSourceRows("resource_catalog"),
    readSourceRows("star_systems"),
    readSourceRows("celestial_bodies"),
    readSourceRows("system_probes"),
    readSourceRows("generated_planets"),
    readSourceRows("planet_prompt_library"),
    readSourceRows("planet_render_library"),
    readSourceRows("release_notes"),
    readSourceRows("changelog"),
    readSourceRows("project_systems"),
    readSourceRows("project_system_history"),
    readSourceRows("data_health_checks"),
    readSourceRows("codex_readiness_items"),
    readSourceRows("dashboard_metrics"),
    readSourceRows("codex_tasks"),
    readSourceRows("civilization_identity"),
    readSourceRows("civilization_alignment_scores"),
    readSourceRows("civilization_alignment_history"),
    readSourceRows("civilization_milestones"),
    readSourceRows("civilization_unlocked_milestones"),
    readSourceRows("civilization_titles"),
    readSourceRows("civilization_bonuses")
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
    star_systems: starSystems as GameData["star_systems"],
    celestial_bodies: celestialBodies as GameData["celestial_bodies"],
    system_probes: systemProbes as GameData["system_probes"],
    generated_planets: generatedPlanets as GameData["generated_planets"],
    planet_prompt_library: planetPromptLibrary as GameData["planet_prompt_library"],
    planet_render_library: planetRenderLibrary as GameData["planet_render_library"],
    release_notes: releaseNotes as GameData["release_notes"],
    changelog: changelog as GameData["changelog"],
    project_systems: projectSystems as GameData["project_systems"],
    project_system_history: projectSystemHistory as GameData["project_system_history"],
    data_health_checks: dataHealthChecks as GameData["data_health_checks"],
    codex_readiness_items: codexReadinessItems as GameData["codex_readiness_items"],
    dashboard_metrics: dashboardMetrics as GameData["dashboard_metrics"],
    codex_tasks: codexTasks as GameData["codex_tasks"],
    civilization_identity: civilizationIdentity as GameData["civilization_identity"],
    civilization_alignment_scores: civilizationAlignmentScores as GameData["civilization_alignment_scores"],
    civilization_alignment_history: civilizationAlignmentHistory as GameData["civilization_alignment_history"],
    civilization_milestones: civilizationMilestones as GameData["civilization_milestones"],
    civilization_unlocked_milestones: civilizationUnlockedMilestones as GameData["civilization_unlocked_milestones"],
    civilization_titles: civilizationTitles as GameData["civilization_titles"],
    civilization_bonuses: civilizationBonuses as GameData["civilization_bonuses"]
  };
}
