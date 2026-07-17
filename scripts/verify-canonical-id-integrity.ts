import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];

function assertUniqueIds(label: string, records: Array<{ id?: string } | null | undefined>) {
  const ids = records.map((record) => record?.id).filter(Boolean) as string[];
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert(duplicates.length === 0, `${label} has duplicate IDs: ${[...new Set(duplicates)].join(", ")}`);
  for (const id of ids) assert(!/\s/.test(id), `${label} ID contains whitespace: ${id}`);
}

async function main() {
  const [runtime, ...exports] = await Promise.all([
    buildCanonicalRuntimeExportPayload(),
    ...targets.map((target) => buildGameEngineExport(target))
  ]);
  assertUniqueIds("actions", runtime.actionSystem.actionDefinitions);
  assertUniqueIds("resources", runtime.resources);
  assertUniqueIds("buildings", runtime.buildingLibrary);
  assertUniqueIds("discoveries", runtime.discoveries);
  assertUniqueIds("discovery categories", runtime.discoveryCategories);
  assertUniqueIds("colony types", runtime.colonizationFramework.colonyTypeDefinitions);
  assertUniqueIds("population roles", runtime.populationSimulationFramework.populationWorkforceRoleDefinitions);
  assertUniqueIds("missions", runtime.missionExpeditionFramework.missionTemplateDefinitions);
  assertUniqueIds("event definitions", runtime.dynamicEventFramework.eventDefinitions);
  assertUniqueIds("civilization stages", runtime.civilizationProgressionFramework.civilizationStages);
  assertUniqueIds("assets", runtime.assets);
  for (const payload of exports) {
    assert(payload.validation.status === "Ready", `${payload.target} export must remain Ready.`);
    assert((payload.canonical.action_system.actionDefinitions?.length ?? 0) === runtime.actionSystem.actionDefinitions.length, `${payload.target} action count parity failed.`);
    assert((payload.canonical.population_simulation_framework.populationWorkforceRoleDefinitions?.length ?? 0) === runtime.populationSimulationFramework.populationWorkforceRoleDefinitions.length, `${payload.target} population role count parity failed.`);
  }
  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    domains: {
      actions: runtime.actionSystem.actionDefinitions.length,
      resources: runtime.resources.length,
      buildings: runtime.buildingLibrary.length,
      discoveries: runtime.discoveries.length,
      colonyTypes: runtime.colonizationFramework.colonyTypeDefinitions.length,
      populationRoles: runtime.populationSimulationFramework.populationWorkforceRoleDefinitions.length,
      missions: runtime.missionExpeditionFramework.missionTemplateDefinitions.length,
      events: runtime.dynamicEventFramework.eventDefinitions.length,
      assets: runtime.assets.length
    },
    exports: Object.fromEntries(exports.map((payload, index) => [targets[index], payload.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
