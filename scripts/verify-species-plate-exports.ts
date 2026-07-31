import { buildGameEngineExport, type EngineTarget } from "../lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload, validateGameRuntimeData, validateRobloxRuntimePayload } from "../lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];

async function main() {
  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(validateGameRuntimeData(runtime).valid, "Canonical runtime must validate before species plate export verification.");
  assert(runtime.speciesPlates.length > 0, "Canonical runtime must publish species plate references.");
  assert(!JSON.stringify(runtime.speciesPlates).match(/positivePrompt|negativePrompt|source-masters|\.psd|\/Users\//i), "Canonical runtime species plates must not leak private authoring data.");

  const robloxRuntime = buildRobloxRuntimePayload(runtime);
  assert(validateRobloxRuntimePayload(robloxRuntime).valid, "Roblox runtime must validate with species plate references.");
  assert(robloxRuntime.speciesPlates.length === runtime.speciesPlates.length, "Roblox runtime must preserve canonical species plate references.");

  for (const target of targets) {
    const payload = await buildGameEngineExport(target);
    const canonical = payload.canonical as Record<string, unknown>;
    const plates = canonical.species_plates;
    assert(Array.isArray(plates) && plates.length === runtime.speciesPlates.length, `${target} export must include every canonical species plate reference.`);
    assert(!JSON.stringify(plates).match(/positivePrompt|negativePrompt|source-masters|\.psd|\/Users\//i), `${target} export leaks private species plate authoring data.`);
    const speciesPlateErrors = payload.validation.issues.filter((issue) => issue.severity === "error" && issue.code.includes("species_plate"));
    assert(speciesPlateErrors.length === 0, `${target} export has species plate validation failures: ${speciesPlateErrors.map((issue) => issue.code).join(", ")}`);
  }

  console.log(`Species plate exports verified: ${runtime.speciesPlates.length} runtime references across ${targets.length} engine targets.`);
}

void main();
