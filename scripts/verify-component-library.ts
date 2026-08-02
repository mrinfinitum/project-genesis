import assert from "node:assert/strict";
import { buildGameEngineExport } from "@/lib/export/game-engine";
import {
  COMPONENT_LIBRARY_ID,
  UNKNOWN_COMPONENT,
  buildUnityComponentLibraryExport,
  componentStates,
  noverisComponentLibrary,
  validateComponentLibrary,
  validateUnityComponentUsage
} from "@/lib/component-library";
import { DESIGN_LANGUAGE_VIOLATION } from "@/lib/design-language";
import { buildBaseGameRuntimeData, validateGameRuntimeData } from "@/lib/runtime/game-runtime";

async function main() {
  const validation = validateComponentLibrary();
  assert.equal(validation.status, "Ready", JSON.stringify(validation.issues));
  assert.equal(noverisComponentLibrary.id, COMPONENT_LIBRARY_ID);
  assert.ok(noverisComponentLibrary.components.length >= 60, "The canonical catalog should include the required component families.");
  assert.equal(new Set(noverisComponentLibrary.components.map((component) => component.id)).size, noverisComponentLibrary.components.length, "Component IDs must be unique.");
  assert.ok(noverisComponentLibrary.components.every((component) => component.states.length === componentStates.length), "Every component must expose canonical states.");
  assert.ok(noverisComponentLibrary.components.every((component) => component.variants.length && component.slots.length && component.animations.length && component.unityPrefabId), "Every component requires variants, slots, animations, and a Unity prefab ID.");

  const unity = buildUnityComponentLibraryExport();
  assert.equal(unity.componentLibrary.id, COMPONENT_LIBRARY_ID);
  assert.ok(unity.componentLibrary.components.every((component) => !Object.values(component.designTokens).flat().some((token) => /^#|^\d+px$/.test(token))), "Unity component exports must reference tokens rather than raw styling.");
  assert.equal(validateUnityComponentUsage({ componentId: "component.unknown" })[0]?.code, UNKNOWN_COMPONENT, "Unknown Unity components must be rejected.");
  assert.equal(validateUnityComponentUsage({ componentId: "component.button.primary", visualOverrides: { colors: ["#FF00FF"] } })[0]?.code, DESIGN_LANGUAGE_VIOLATION, "Direct Unity style overrides must be rejected.");

  const runtime = await buildBaseGameRuntimeData();
  assert.equal(validateGameRuntimeData(runtime).status, "Ready", "Canonical runtime must validate with the Component Library.");
  assert.equal(runtime.componentLibrary.version, noverisComponentLibrary.version);

  for (const target of ["generic", "roblox", "web", "unity", "unreal", "godot"] as const) {
    const payload = await buildGameEngineExport(target);
    assert.equal(payload.validation.status, "Ready", `${target} export must remain ready.`);
    assert.equal((payload.canonical as { component_library?: { version?: string } }).component_library?.version, noverisComponentLibrary.version, `${target} must export the Component Library.`);
  }

  console.log("Component Library verification passed.");
}

void main();
