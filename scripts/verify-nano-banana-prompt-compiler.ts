import { readFile } from "node:fs/promises";
import path from "node:path";
import { backgroundProfiles, cameraProfiles, compileNanoBanana2Prompt, compileNanoBanana2PromptBatch, compileNanoBanana2VariationSet, compositionProfiles, creatureArchetypes, environmentalAdaptationProfiles, exportPromptPack, getNanoBanana2PromptStaleness, isNanoBanana2PromptStale, lightingProfiles, materialProfiles, plantArchetypes, productionOutputs, sanitizeVisualPromptForRuntime, variationProfiles, type CanonicalVisualRecord } from "../lib/visual-production/nano-banana-2";

const root = path.join(process.cwd(), "data", "visual-production", "nano-banana-2");
const fixture: CanonicalVisualRecord = {
  id: "species-verification-raptor", displayName: "Verification Raptor", scientificName: "Aves verificata", domain: "creature", sourceVersion: "1.0.0", seed: "NOVERIS-VERIFY-01", taxonomy: "Life · Aves", archetypeId: "volume-ib-avian-apex-raptor", variables: { Planet: "Noveris", Biome: "alpine", Gravity: "1.0 G", Atmosphere: "oxygen-bearing", Climate: "cool", Wind: "moderate", "Air Density": "1.0", "Wing Type": "feathered", "Wing Span": "3.1 m", "Feather Type": "contour", Diet: "carnivore", Behavior: "soaring hunter", "Primary Material": "feathers", "Color Palette": "slate and ivory", "Distinctive Features": "split crest" }, lockedFields: ["anatomy.limbs", "anatomy.wingCount", "Planet", "Biome", "Gravity", "Atmosphere", "Distinctive Features"], lockedValues: { limbCount: 4, wingCount: 2 }
};

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

async function main() {
  const first = compileNanoBanana2Prompt(fixture, { outputTypeId: "creature-full-body-production-render", variationProfileId: "standard", versionCount: 2, seed: fixture.seed });
  const second = compileNanoBanana2Prompt(fixture, { outputTypeId: "creature-full-body-production-render", variationProfileId: "standard", versionCount: 2, seed: fixture.seed });
  assert(first.promptHash === second.promptHash, "Prompt compilation must be deterministic.");
  assert(first.positivePrompt.includes("preserve all locked canonical traits exactly"), "Positive prompt must carry locked-canon language.");
  assert(first.positivePrompt.includes("wingCount: 2"), "Positive prompt must include locked canonical values.");
  assert(first.negativePrompt.includes("incorrect wing count"), "Negative prompt must include shared anatomy exclusions.");
  assert(first.validation.length === 0, "Complete fixture must compile without validation issues.");
  assert(!isNanoBanana2PromptStale(fixture, first), "Freshly compiled prompt must not be stale.");
  assert(getNanoBanana2PromptStaleness(fixture, first).reason === "current", "Fresh prompts must report a current staleness reason.");
  assert(isNanoBanana2PromptStale({ ...fixture, variables: { ...fixture.variables, Biome: "coastal" } }, first), "Changed canonical data must mark a prompt stale.");
  const sanitized = sanitizeVisualPromptForRuntime(first);
  assert(!JSON.stringify(sanitized).includes(first.positivePrompt), "Sanitized runtime data must not include authoring prompt text.");
  const pack = exportPromptPack(first);
  assert(pack.json.includes(first.promptHash) && pack.jsonl.includes(first.canonicalId) && pack.csv.includes("canonicalId") && pack.markdown.includes("Positive Prompt") && pack.text.includes("NEGATIVE PROMPT"), "All prompt pack export formats must be available.");
  const lockedOverride = compileNanoBanana2Prompt(fixture, { outputTypeId: "creature-full-body-production-render", authorOverrides: { Planet: "Different world" } });
  assert(!lockedOverride.positivePrompt.includes("Planet: Different world"), "Locked author overrides must be ignored, not applied.");
  assert(lockedOverride.validation.some((issue) => issue.code === "override_locked_field"), "Locked author overrides must be reported.");
  const invalidReference = compileNanoBanana2Prompt(fixture, { outputTypeId: "creature-full-body-production-render", cameraProfileId: "not-a-camera" });
  assert(invalidReference.validation.some((issue) => issue.code === "invalid_camera_reference"), "Invalid profile references must be reported.");
  assert(compileNanoBanana2VariationSet(fixture, { outputTypeId: "creature-full-body-production-render", seed: fixture.seed }).length === 15, "A complete variation set must include every canonical variation profile.");
  assert(compileNanoBanana2PromptBatch([fixture], { outputTypeId: "creature-full-body-production-render" }).validation.length === 0, "A valid prompt batch must have no duplicate IDs.");
  assert(creatureArchetypes.length === 245 && plantArchetypes.length === 195, "All canonical creature and plant roadmap archetypes must be represented exactly once.");
  assert(variationProfiles.length === 15, "All fifteen canonical variation profiles must be represented.");
  for (const catalog of [creatureArchetypes, plantArchetypes, productionOutputs, cameraProfiles, lightingProfiles, backgroundProfiles, compositionProfiles, materialProfiles, environmentalAdaptationProfiles, variationProfiles]) assert(new Set(catalog.map((item) => item.id)).size === catalog.length, "Grammar catalog IDs must be unique.");
  const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8")) as { validationStatus?: string; modelProfileId?: string };
  assert(manifest.validationStatus === "Ready" && manifest.modelProfileId === "nano-banana-2", "Generated compiler manifest is invalid.");
  console.log(`Nano Banana 2 prompt compiler verified: ${creatureArchetypes.length} creature archetypes, ${plantArchetypes.length} plant archetypes, ${productionOutputs.length} outputs.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
