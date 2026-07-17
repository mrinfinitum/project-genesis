import { getArchitectureState } from "@/lib/architecture";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
const requiredCanonicalModules = ["action_system", "planet_development_framework", "colonization_framework", "population_simulation_framework", "resource_economy_logistics_framework", "mission_expedition_framework", "dynamic_event_framework"];

async function main() {
  const [state, runtime, ...exports] = await Promise.all([
    getArchitectureState(),
    buildCanonicalRuntimeExportPayload(),
    ...targets.map((target) => buildGameEngineExport(target))
  ]);
  for (const payload of exports) {
    assert(payload.validation.status === "Ready", `${payload.target} export must remain Ready.`);
    assert(payload.metadata.architectureVersion === state.architectureVersion.current, `${payload.target} architectureVersion mismatch.`);
    assert(payload.metadata.runtimeVersion === runtime.metadata.schemaVersion, `${payload.target} runtimeVersion mismatch.`);
    assert(payload.metadata.contentVersion === runtime.metadata.contentVersion, `${payload.target} contentVersion mismatch.`);
    for (const module of requiredCanonicalModules) {
      assert(Object.prototype.hasOwnProperty.call(payload.canonical, module), `${payload.target} export missing ${module}.`);
    }
  }
  const moduleParity = Object.fromEntries(requiredCanonicalModules.map((module) => [module, exports.every((payload) => Object.prototype.hasOwnProperty.call(payload.canonical, module))]));
  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    checksum: runtime.metadata.checksum,
    exports: Object.fromEntries(exports.map((payload, index) => [targets[index], payload.validation.status])),
    moduleParity
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
