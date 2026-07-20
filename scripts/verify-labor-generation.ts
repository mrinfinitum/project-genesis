import { canonicalActionSystem, validateActionSystem } from "@/lib/actions/action-system";
import { canonicalEconomyDefinitions } from "@/lib/economy/definitions";
import { laborGenerationFramework, validateLaborGenerationFramework } from "@/lib/economy/labor-generation";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, gameRuntimeContentVersion, validateGameRuntimeData } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const frameworkIssues = validateLaborGenerationFramework();
  assert(!frameworkIssues.some((issue) => issue.severity === "error"), frameworkIssues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
  assert(canonicalEconomyDefinitions.find((definition) => definition.id === "ECON-POPULATION")?.spendable === false, "Population must remain non-spendable workforce capacity.");
  assert(canonicalActionSystem.laborGenerationFrameworkId === laborGenerationFramework.id, "Action System must reference the Labor Generation Framework.");
  assert(!validateActionSystem().some((issue) => issue.severity === "error"), "Action System validation failed.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  const runtimeValidation = validateGameRuntimeData(runtime);
  assert(runtime.metadata.contentVersion === gameRuntimeContentVersion && gameRuntimeContentVersion === 36, "Runtime must publish Labor Generation Framework at contentVersion 36.");
  assert(runtime.laborGenerationFramework.id === laborGenerationFramework.id, "Canonical runtime is missing Labor Generation Framework.");
  assert(Boolean(runtime.metadata.checksum), "Canonical runtime checksum is missing.");
  assert(!runtimeValidation.issues.some((issue) => issue.severity === "error"), runtimeValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map(async (target) => ({ target, payload: await buildGameEngineExport(target) })));
  for (const { target, payload } of exports) {
    assert(payload.validation.status === "Ready", `${target} export is ${payload.validation.status}: ${payload.validation.issues.map((issue) => issue.message).join("; ")}`);
    assert(payload.canonical.labor_generation_framework.id === laborGenerationFramework.id, `${target} export is missing Labor Generation Framework.`);
  }

  console.log(JSON.stringify({
    status: "Ready",
    contentVersion: gameRuntimeContentVersion,
    checksum: runtime.metadata.checksum,
    frameworkVersion: laborGenerationFramework.version,
    sourceIds: laborGenerationFramework.sources.map((source) => source.id),
    actionSystemId: laborGenerationFramework.actionSystemId,
    engineExports: Object.fromEntries(exports.map(({ target, payload }) => [target, payload.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
