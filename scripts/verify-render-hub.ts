import { buildBaseGameRuntimeData } from "@/lib/runtime/game-runtime";
import {
  buildProviderDispatchPacket,
  buildRenderHubCatalogFromCanonicalRecords,
  compileRenderPrompt,
  renderHubProviders,
  rollbackCompiledPrompt,
  validateCompiledRenderPrompt,
  type RenderHubCanonicalRecord
} from "@/lib/render-hub";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const record: RenderHubCanonicalRecord = {
  id: "planet-frostveil-test",
  displayName: "Frostveil",
  version: "1.0.0",
  assetType: "Planet",
  assetRole: "hero",
  assetCategory: "Frozen terrestrial",
  visualDescription: "Large frozen terrestrial planet with pale blue ice fields, basalt continents, a thin silver atmosphere, and one small moon.",
  generationSeed: "frostveil-0182",
  providerId: "nano-banana-2",
  sourceMasterId: "master-frostveil",
  previewUrl: "/generated-assets/planets/frostveil.webp",
  runtimeTargets: ["unity", "web"],
  approvalStatus: "approved",
  productionStatus: "approved",
  history: [{ id: "history-frostveil-created", eventType: "created", timestamp: "2026-08-02T00:00:00.000Z", note: "Canonical record created." }]
};

async function main() {
  const providerIds = new Set(renderHubProviders.map((provider) => provider.id));
  for (const providerId of ["freepik-flux", "nano-banana-2", "openai-images", "comfyui", "future-provider"]) {
    assert(providerIds.has(providerId), `Missing Render Hub provider ${providerId}.`);
  }

  const compiled = compileRenderPrompt(record);
  assert(compiled.visualSummary.includes("frozen terrestrial planet"), "Prompt compiler did not produce the canonical visual summary.");
  assert(compiled.positivePrompt.includes("Premium AAA science-fiction interface"), "Prompt compiler did not inherit the NOVERIS Design Language.");
  assert(!compiled.validation.some((issue) => issue.severity === "error"), `A valid prompt produced errors: ${compiled.validation.map((issue) => issue.code).join(", ")}`);

  const changedCanonicalVersion = compileRenderPrompt({ ...record, version: "1.0.1" });
  const changedProvider = compileRenderPrompt(record, { providerId: "openai-images" });
  const changedOutput = compileRenderPrompt(record, { outputType: "planet card" });
  assert(compiled.promptHash !== changedCanonicalVersion.promptHash, "Canonical version changes must invalidate the prompt hash.");
  assert(compiled.promptHash !== changedProvider.promptHash, "Provider changes must invalidate the prompt hash.");
  assert(compiled.promptHash !== changedOutput.promptHash, "Output type changes must invalidate the prompt hash.");

  const packet = buildProviderDispatchPacket(changedProvider);
  assert(packet.negativePrompt === null && typeof packet.combinedPrompt === "string", "OpenAI dispatch must use its single-prompt provider format.");
  const rollback = rollbackCompiledPrompt(changedCanonicalVersion, compiled);
  assert(rollback.promptHash !== compiled.promptHash && rollback.canonicalRecordId === record.id, "Prompt rollback did not preserve canonical history semantics.");

  const invalid = validateCompiledRenderPrompt({ ...compiled, combinedPrompt: '{"id":"database-record"}', estimatedLength: 23 });
  assert(invalid.some((issue) => issue.code === "raw_json"), "Prompt validation did not reject raw JSON.");

  const catalog = buildRenderHubCatalogFromCanonicalRecords([
    record,
    { ...record, id: "background-quiet-field", displayName: "Quiet Field", version: "1.0.0", assetType: "Background", assetRole: "environment", assetCategory: "Star System", visualDescription: "Quiet deep space with broad negative space and delicate distant molecular clouds.", approvalStatus: "pending", productionStatus: "queued", history: [{ id: "history-background-queued", eventType: "queued", timestamp: "2026-08-02T01:00:00.000Z", note: "Ready for provider dispatch." }] }
  ]);
  assert(catalog.prompts.length === 2 && catalog.queue.length === 2, "Render Hub catalog did not preserve prompt and queue records.");
  assert(catalog.queue.some((item) => item.status === "queued"), "Render queue did not preserve queued status.");
  assert(catalog.records[0].history.length > 0, "Prompt history was not retained.");

  const runtime = await buildBaseGameRuntimeData();
  const serializedRuntime = JSON.stringify(runtime.assetProductionRuntime);
  assert(!/positivePrompt|negativePrompt|combinedPrompt|renderProvider|source-masters|\/Users\//i.test(serializedRuntime), "Runtime export leaked prompt or private production data.");

  console.log("Render Hub verification passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
