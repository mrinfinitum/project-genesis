import { getArchitectureState } from "@/lib/architecture";
import { assertNoPlayerStateLeak } from "@/lib/architecture/core-audit";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, getGameRuntimeData } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];

async function main() {
  const [state, runtime, rawRuntime, ...exports] = await Promise.all([
    getArchitectureState(),
    buildCanonicalRuntimeExportPayload(),
    getGameRuntimeData(),
    ...targets.map((target) => buildGameEngineExport(target))
  ]);
  const roblox = buildRobloxRuntimePayload(rawRuntime);
  assertNoPlayerStateLeak("Canonical runtime", runtime);
  assertNoPlayerStateLeak("Roblox runtime", roblox);
  for (const payload of exports) {
    assert(payload.validation.status === "Ready", `${payload.target} export must remain Ready.`);
    assertNoPlayerStateLeak(`${payload.target} engine export`, payload);
    assert(!Object.prototype.hasOwnProperty.call(payload.canonical, "architecture"), `${payload.target} export must not include Architecture Workspace content.`);
  }
  const backendRows = state.coreArchitectureAudit.ownershipMatrix.filter((row) => row.canonicalOwner.includes("Backend"));
  assert(backendRows.length >= 5, "Architecture audit must document backend-owned state domains.");
  console.log(JSON.stringify({
    ok: true,
    contentVersion: runtime.metadata.contentVersion,
    prohibitedFieldCount: state.coreArchitectureAudit.prohibitedPlayerStateFields.length,
    backendOwnedDomains: backendRows.map((row) => row.domain),
    engineExports: Object.fromEntries(exports.map((payload, index) => [targets[index], payload.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
