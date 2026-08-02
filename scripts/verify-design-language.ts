import assert from "node:assert/strict";
import { buildGameEngineExport } from "@/lib/export/game-engine";
import { DESIGN_LANGUAGE_VIOLATION, buildUnityDesignLanguageExport, noverisDesignLanguage, validateDesignLanguage, validateDesignLanguageOverride } from "@/lib/design-language";
import { buildBaseGameRuntimeData, validateGameRuntimeData } from "@/lib/runtime/game-runtime";

async function main() {
  const contractValidation = validateDesignLanguage();
  assert.equal(contractValidation.status, "Ready", JSON.stringify(contractValidation.issues));
  assert.equal(new Set(noverisDesignLanguage.components.map((component) => component.id)).size, noverisDesignLanguage.components.length, "Components must be uniquely identified.");
  assert.ok(noverisDesignLanguage.components.every((component) => component.visualTokens.colors.length && component.visualTokens.typography.length), "Components must reference canonical visual tokens.");
  assert.equal(validateDesignLanguageOverride({ colors: ["#FF00FF"], spacing: [13], animations: ["linear"] })[0]?.code, DESIGN_LANGUAGE_VIOLATION, "Unknown visual values must be rejected.");
  const unity = buildUnityDesignLanguageExport();
  assert.equal(unity.export.format, "json");
  assert.equal(unity.designLanguage.id, "design-language");
  const runtime = await buildBaseGameRuntimeData();
  assert.equal(validateGameRuntimeData(runtime).status, "Ready", "Canonical runtime must validate with Design Language.");
  assert.equal(runtime.designLanguage.version, noverisDesignLanguage.version);
  for (const target of ["generic", "roblox", "web", "unity", "unreal", "godot"] as const) {
    const payload = await buildGameEngineExport(target);
    assert.equal(payload.validation.status, "Ready", `${target} export must remain ready.`);
    assert.equal((payload.canonical as { design_language?: { version?: string } }).design_language?.version, noverisDesignLanguage.version, `${target} must export the Design Language.`);
  }
  console.log("Design Language verification passed.");
}

void main();
