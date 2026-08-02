import {
  ASSET_PRODUCTION_SYSTEM_ID,
  ASSET_PRODUCTION_SYSTEM_VERSION,
  buildAssetProductionCatalog,
  buildAssetProductionRuntimeManifest,
  createAssetProductionRecord,
  renderProviderRegistry,
  searchAssetProductionRecords,
  transitionAssetProductionRecord,
  validateAssetProductionRuntimeManifest,
  type AssetProductionRecordSource
} from "@/lib/assets/asset-production-system";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildBaseGameRuntimeData } from "@/lib/runtime/game-runtime";
import type { AssetDefinition } from "@/types/runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectThrow(action: () => void, message: string) {
  try {
    action();
  } catch {
    return;
  }
  throw new Error(message);
}

const prompt = {
  id: "prompt-planet-hero-v1",
  version: "1.0.0",
  positivePrompt: "A quiet terrestrial planet for NOVERIS.",
  negativePrompt: "No text or UI.",
  combinedPrompt: "A quiet terrestrial planet for NOVERIS. Negative: No text or UI.",
  promptHash: "prompt-12345678",
  providerId: "nano-banana-2",
  generatedAt: "2026-08-02T00:00:00.000Z"
};

const source: AssetProductionRecordSource = {
  id: "asset-planet-hero-test",
  name: "Planet Hero Test",
  type: "image",
  category: "Planet",
  artKey: "planet_hero_test",
  productionStatus: "planned",
  approvalStatus: "pending",
  previewUrl: "/generated-assets/planets/planet-hero-test.png",
  thumbnailUrl: "/generated-assets/planets/planet-hero-test-thumb.webp",
  sourceMasterId: "master-planet-hero-test",
  runtimeTargets: ["unity", "web"],
  usageReferences: [{ type: "planet", id: "planet-test", name: "Planet Test" }],
  prompt,
  createdAt: "2026-08-02T00:00:00.000Z",
  updatedAt: "2026-08-02T00:00:00.000Z"
};

async function main() {
  const providers = new Set(renderProviderRegistry.map((provider) => provider.providerId));
  for (const providerId of ["freepik-flux", "nano-banana-2", "openai-images", "comfyui", "future-provider"]) {
    assert(providers.has(providerId), `Missing render provider: ${providerId}.`);
  }

  let record = createAssetProductionRecord(source);
  for (const nextStatus of ["awaiting_prompt", "prompt_ready", "queued", "rendering", "generated", "awaiting_review", "approved", "published"] as const) {
    record = transitionAssetProductionRecord(record, nextStatus, "verification", `Move record to ${nextStatus}.`);
  }
  assert(record.productionStatus === "published" && record.approvalStatus === "approved", "Approved lifecycle did not publish correctly.");
  assert(record.history.length === 9, "Lifecycle history did not preserve every transition.");

  const catalog = buildAssetProductionCatalog([source]);
  assert(catalog.id === ASSET_PRODUCTION_SYSTEM_ID && catalog.version === ASSET_PRODUCTION_SYSTEM_VERSION, "Asset production catalog contract is invalid.");
  assert(searchAssetProductionRecords([record], "planet test").length === 1, "Asset production search does not index display names.");
  assert(searchAssetProductionRecords([record], "nano-banana").length === 1, "Asset production search does not index providers.");

  const missingPrompt: AssetProductionRecordSource = { ...source, id: "asset-missing-prompt", productionStatus: "queued", status: "queued", renderProvider: "nano-banana-2", prompt: undefined };
  const duplicateCatalog = buildAssetProductionCatalog([source, { ...source }]);
  assert(duplicateCatalog.validation.issues.some((issue) => issue.code === "duplicate_asset"), "Duplicate asset validation is missing.");
  assert(buildAssetProductionCatalog([missingPrompt]).validation.issues.some((issue) => issue.code === "missing_prompt"), "Missing prompt validation is missing.");
  expectThrow(() => transitionAssetProductionRecord({ ...record, productionStatus: "approved", status: "approved", approvalStatus: "pending" }, "published", "verification", "Should fail."), "Unapproved publication was accepted.");

  const publicAsset: AssetDefinition = {
    id: "asset-runtime-test",
    name: "Runtime Test Asset",
    type: "image",
    category: "Planet",
    artKey: "runtime_test_asset",
    width: 1024,
    height: 576,
    aspectRatio: "16:9",
    status: "published",
    notes: "",
    productionStatus: "published",
    approvalStatus: "approved",
    previewUrl: "/generated-assets/runtime-test.png",
    sourceFileName: "runtime-test.psd",
    platformMappings: { unity: { addressableKey: "Assets/Generated/runtime-test.png" } }
  };
  const runtimeManifest = buildAssetProductionRuntimeManifest([publicAsset]);
  const runtimeValidation = validateAssetProductionRuntimeManifest(runtimeManifest);
  assert(runtimeValidation.valid, `Runtime manifest is invalid: ${runtimeValidation.issues.map((issue) => issue.code).join(", ")}`);
  assert(!JSON.stringify(runtimeManifest).match(/source-masters|\/Users\/|positivePrompt|negativePrompt|combinedPrompt|history/i), "Runtime manifest leaked production-only data.");

  const runtime = await buildBaseGameRuntimeData();
  const baseValidation = validateAssetProductionRuntimeManifest(runtime.assetProductionRuntime);
  assert(baseValidation.valid, `Canonical runtime asset production manifest is invalid: ${baseValidation.issues.map((issue) => issue.code).join(", ")}`);

  for (const target of ["roblox", "unity", "unreal", "godot", "web", "generic"] as EngineTarget[]) {
    const payload = await buildGameEngineExport(target);
    const assetProductionRuntime = payload.canonical.asset_production_runtime;
    assert(assetProductionRuntime?.id === ASSET_PRODUCTION_SYSTEM_ID, `${target} export is missing the Asset Production runtime module.`);
    assert(validateAssetProductionRuntimeManifest(assetProductionRuntime).valid, `${target} export has an invalid Asset Production runtime module.`);
  }

  console.log("Asset Production System verification passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
