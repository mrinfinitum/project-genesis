import { getArchitectureState } from "@/lib/architecture";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];

async function main() {
  const [state, runtime, ...exports] = await Promise.all([
    getArchitectureState(),
    buildCanonicalRuntimeExportPayload(),
    ...targets.map((target) => buildGameEngineExport(target))
  ]);
  const inventory = state.coreArchitectureAudit.runtimeRootFieldInventory;
  const inventoryByField = new Map(inventory.map((field) => [field.fieldName, field]));
  for (const field of Object.keys(runtime)) {
    assert(inventoryByField.has(field), `Runtime root field ${field} is missing from architecture inventory.`);
  }
  for (const field of inventory) {
    assert(field.ownerModule, `Runtime field ${field.fieldName} is missing ownerModule.`);
    assert(field.version, `Runtime field ${field.fieldName} is missing version.`);
    assert(field.missingVerifier === false, `Runtime field ${field.fieldName} is marked as missing verifier coverage.`);
  }
  for (const payload of exports) {
    assert(payload.validation.status === "Ready", `${payload.target} export must remain Ready.`);
    assert(payload.metadata.contentVersion === runtime.metadata.contentVersion, `${payload.target} export contentVersion must match runtime.`);
  }
  const rootSizes = Object.entries(runtime).map(([field, value]) => ({ field, bytes: Buffer.byteLength(JSON.stringify(value)) })).sort((a, b) => b.bytes - a.bytes);
  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    rootFieldCount: Object.keys(runtime).length,
    inventoriedFields: inventory.length,
    largestRootFields: rootSizes.slice(0, 8),
    engineExports: Object.fromEntries(exports.map((payload, index) => [targets[index], payload.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
