import assert from "node:assert/strict";
import { buildGameEngineExport } from "@/lib/export/game-engine";
import {
  SCREEN_TEMPLATE_LIBRARY_ID,
  UNKNOWN_SCREEN_TEMPLATE_ASSET_ROLE,
  UNKNOWN_SCREEN_TEMPLATE_COMPONENT,
  buildUnityScreenTemplateExport,
  noverisScreenTemplateLibrary,
  screenLayoutModes,
  validateScreenTemplateLibrary,
  validateUnityScreenTemplateUsage
} from "@/lib/screen-template-library";
import { buildBaseGameRuntimeData, validateGameRuntimeData } from "@/lib/runtime/game-runtime";

async function main() {
  const validation = validateScreenTemplateLibrary();
  assert.equal(validation.status, "Ready", JSON.stringify(validation.issues));
  assert.equal(noverisScreenTemplateLibrary.id, SCREEN_TEMPLATE_LIBRARY_ID);
  assert.equal(noverisScreenTemplateLibrary.templates.length, 23, "The canonical Screen Template Library must contain exactly 23 screen contracts.");
  assert.equal(new Set(noverisScreenTemplateLibrary.templates.map((template) => template.id)).size, noverisScreenTemplateLibrary.templates.length, "Screen template IDs must be unique.");
  assert.ok(noverisScreenTemplateLibrary.templates.every((template) => template.requiredComponents.length && template.layoutRegions.length && template.assetSlots.length && template.runtimeContracts.length), "Every screen template must define components, regions, assets, and runtime contracts.");
  assert.ok(noverisScreenTemplateLibrary.templates.every((template) => screenLayoutModes.every((mode) => template.layoutModes.includes(mode))), "Every screen template must declare all canonical layout modes.");

  const unity = buildUnityScreenTemplateExport();
  assert.equal(unity.screenTemplateLibrary.id, SCREEN_TEMPLATE_LIBRARY_ID);
  assert.equal(JSON.stringify(unity).match(/\"(?:coordinates|anchors|screenPositions|layoutPositions)\"\s*:/i), null, "Unity export must not include layout coordinates or anchors.");
  assert.equal(validateUnityScreenTemplateUsage({ screenTemplateId: "screen.planet-detail", componentIds: ["component.unknown"] })[0]?.code, UNKNOWN_SCREEN_TEMPLATE_COMPONENT, "Undeclared Unity components must be rejected.");
  assert.equal(validateUnityScreenTemplateUsage({ screenTemplateId: "screen.planet-detail", assetRoleIds: ["asset.unknown"] })[0]?.code, UNKNOWN_SCREEN_TEMPLATE_ASSET_ROLE, "Undeclared Unity asset roles must be rejected.");

  const invalid = structuredClone(noverisScreenTemplateLibrary);
  invalid.templates[0].layoutRegions.push({ ...invalid.templates[0].layoutRegions[0] });
  assert.ok(validateScreenTemplateLibrary(invalid).issues.some((issue) => issue.code === "duplicate_region"), "Duplicate semantic regions must fail validation.");

  const runtime = await buildBaseGameRuntimeData();
  assert.equal(validateGameRuntimeData(runtime).status, "Ready", "Canonical runtime must validate with the Screen Template Library.");
  assert.equal(runtime.screenTemplateLibrary.version, noverisScreenTemplateLibrary.version);

  for (const target of ["generic", "roblox", "web", "unity", "unreal", "godot"] as const) {
    const payload = await buildGameEngineExport(target);
    assert.equal(payload.validation.status, "Ready", `${target} export must remain ready.`);
    assert.equal((payload.canonical as { screen_template_library?: { version?: string } }).screen_template_library?.version, noverisScreenTemplateLibrary.version, `${target} must export the Screen Template Library.`);
  }

  console.log("Screen Template Library verification passed.");
}

void main();
