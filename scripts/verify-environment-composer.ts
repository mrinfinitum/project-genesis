import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import {
  environmentComposerContractVersion,
  environmentComposerRuntimeContract,
  validateEnvironmentComposerContract
} from "@/lib/environment-composer";
import {
  buildCanonicalRuntimeExportPayload,
  buildRobloxRuntimePayload,
  gameRuntimeContentVersion,
  validateGameRuntimeData,
  validateRobloxRuntimePayload
} from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const contract = environmentComposerRuntimeContract();
  const contractIssues = validateEnvironmentComposerContract(contract);
  const contractErrors = contractIssues.filter((issue) => issue.severity === "error");
  assert(contractErrors.length === 0, contractErrors.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
  assert(contract.environmentTypes.length === 8, "Environment Composer must publish exactly eight canonical environment types.");
  assert(contract.profiles.length === contract.environmentTypes.length, "Every environment type must resolve one default profile.");
  assert(contract.layerTrees.star_system.length >= 10, "Star System requires the canonical layered authoring tree.");
  assert(contract.profiles.find((profile) => profile.environmentTypeId === "star_system")?.layers.length === 16, "Star System default profile must publish the canonical 16-layer stack.");
  assert(contract.runtimeRules.publishesReferencesOnly && !contract.runtimeRules.embedsTextures && contract.runtimeRules.clientsOwnRendering, "Runtime ownership boundary is invalid.");

  const serialized = JSON.stringify(contract);
  for (const forbidden of ["/Users/", "studio-private://", ".psd", ".psb", "data:image/", "base64,"]) {
    assert(!serialized.includes(forbidden), `Environment runtime leaks forbidden private or embedded data: ${forbidden}`);
  }

  const runtime = await buildCanonicalRuntimeExportPayload();
  const runtimeValidation = validateGameRuntimeData(runtime);
  assert(gameRuntimeContentVersion >= 53, "Environment Composer requires contentVersion 53 or newer.");
  assert(runtime.metadata.validationStatus === "Ready" && runtimeValidation.status === "Ready", runtimeValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
  assert(runtime.environmentComposerContract.version === environmentComposerContractVersion, "Canonical runtime is missing the current Environment Composer contract.");

  const roblox = buildRobloxRuntimePayload(runtime);
  const robloxValidation = validateRobloxRuntimePayload(roblox);
  assert(robloxValidation.status === "Ready", robloxValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
  assert(roblox.environmentComposerContract.version === environmentComposerContractVersion, "Roblox runtime is missing Environment Composer.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map(async (target) => ({ target, payload: await buildGameEngineExport(target) })));
  for (const { target, payload } of exports) {
    assert(payload.validation.status === "Ready", `${target} export is ${payload.validation.status}.`);
    assert(payload.canonical.environment_composer_contract.version === environmentComposerContractVersion, `${target} export is missing Environment Composer.`);
    const exported = JSON.stringify(payload.canonical.environment_composer_contract);
    assert(!/\/Users\/|studio-private:\/\/|\.psd|\.psb|data:image\/|base64,/i.test(exported), `${target} export leaks private source or embedded texture data.`);
  }

  console.log(JSON.stringify({
    status: "Ready",
    contentVersion: runtime.metadata.contentVersion,
    checksum: runtime.metadata.checksum,
    contractVersion: environmentComposerContractVersion,
    environmentTypes: contract.environmentTypes.length,
    layerAssets: contract.layerAssets.length,
    themes: contract.themes.length,
    profiles: contract.profiles.length,
    engineExports: Object.fromEntries(exports.map(({ target, payload }) => [target, payload.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
