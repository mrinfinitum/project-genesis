import { auditCivilizationOperationsSources } from "@/lib/assets/civilization-operations-deck-server";
import {
  CIVILIZATION_OPERATIONS_VERSION,
  buildCivilizationOperationsArtpackDescriptor,
  civilizationOperationsDeckContract,
  validateCivilizationOperationsDeckContract
} from "@/lib/assets/civilization-operations-deck";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import {
  buildCanonicalRuntimeExportPayload,
  buildRobloxRuntimePayload,
  gameRuntimeContentVersion
} from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const contractIssues = validateCivilizationOperationsDeckContract();
  assert(contractIssues.length === 0, contractIssues.join("\n"));
  assert(civilizationOperationsDeckContract.children.length === 4, "Operations Deck must contain four child regions.");
  assert(civilizationOperationsDeckContract.assets.length === 28, "Operations Deck must publish 28 production asset definitions.");
  assert(civilizationOperationsDeckContract.assets.every((asset) => asset.status === "Source Master Pending"), "Missing masters must remain visible as Source Master Pending.");
  assert(civilizationOperationsDeckContract.bounds.x === 232, "Operations Deck must align with the canonical main workspace.");
  assert(civilizationOperationsDeckContract.bounds.width === 1622, "Operations Deck must match the canonical main workspace width.");
  assert(civilizationOperationsDeckContract.exportProfile.presentationProfiles.length === 4, "All responsive profiles are required.");

  const audit = await auditCivilizationOperationsSources();
  assert(audit.summary.sourceSlots === 9, "Expected nine source-master production folders.");
  assert(audit.summary.pendingAssets === 28, "All assets should remain pending until approved masters and slices exist.");

  const serialized = JSON.stringify(civilizationOperationsDeckContract);
  assert(!/\/Users\/|source-masters|studio-private:\/\/|\.psd|\.psb/i.test(serialized), "Sanitized Operations Deck contract leaks private source data.");

  const descriptor = buildCivilizationOperationsArtpackDescriptor();
  assert(descriptor.files["CivilizationOperationsDeck/CivilizationOperationsDeck.manifest.json"], "Artpack descriptor is missing the screen-region manifest.");
  assert(descriptor.files["CivilizationOperationsDeck/sprites/index.json"].length === 28, "Artpack sprite index is incomplete.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(gameRuntimeContentVersion >= 61, "Operations Deck publication requires contentVersion 61 or newer.");
  assert(runtime.metadata.validationStatus === "Ready", `Canonical runtime is ${runtime.metadata.validationStatus}.`);
  assert(runtime.civilizationOperationsDeck?.version === CIVILIZATION_OPERATIONS_VERSION, "Canonical runtime is missing the Operations Deck.");

  const roblox = buildRobloxRuntimePayload(runtime);
  assert(roblox.civilizationOperationsDeck.version === CIVILIZATION_OPERATIONS_VERSION, "Roblox runtime is missing the Operations Deck.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map(async (target) => ({ target, payload: await buildGameEngineExport(target) })));
  for (const { target, payload } of exports) {
    assert(payload.validation.status === "Ready", `${target} export is ${payload.validation.status}.`);
    assert(payload.canonical.civilization_operations_deck.version === CIVILIZATION_OPERATIONS_VERSION, `${target} export is missing the Operations Deck.`);
    assert(!/\/Users\/|source-masters|studio-private:\/\/|\.psd|\.psb/i.test(JSON.stringify(payload.canonical.civilization_operations_deck)), `${target} export leaks private source data.`);
  }

  console.log(JSON.stringify({
    status: "Ready",
    contentVersion: runtime.metadata.contentVersion,
    checksum: runtime.metadata.checksum,
    contractVersion: CIVILIZATION_OPERATIONS_VERSION,
    sourceFolders: audit.summary.sourceSlots,
    sourceMastersPresent: audit.summary.sourceMastersPresent,
    readyAssets: audit.summary.readyAssets,
    pendingAssets: audit.summary.pendingAssets,
    finalLogicalBounds: civilizationOperationsDeckContract.bounds,
    finalMasterBounds: civilizationOperationsDeckContract.masterBounds,
    engineExports: Object.fromEntries(exports.map(({ target, payload }) => [target, payload.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
