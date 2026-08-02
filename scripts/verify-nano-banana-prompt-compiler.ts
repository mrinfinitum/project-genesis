import { readFile } from "node:fs/promises";
import path from "node:path";
import { backgroundProfiles, cameraProfiles, compileNanoBanana2Prompt, compileNanoBanana2PromptBatch, compileNanoBanana2VariationSet, compositionProfiles, creatureArchetypes, environmentalAdaptationProfiles, exportPromptPack, getNanoBanana2PromptStaleness, isNanoBanana2PromptStale, lightingProfiles, materialProfiles, plantArchetypes, productionOutputs, sanitizeVisualPromptForRuntime, validateNanoBananaVisualPrompt, variationProfiles, type CanonicalVisualRecord } from "../lib/visual-production/nano-banana-2";
import { compileCelestialBodyVisualPrompt, compileEnvironmentVisualPrompt, compileGalacticRegionVisualPrompt, compileGalaxyVisualPrompt, compilePlanetVisualPrompt, compileStarSystemVisualPrompt } from "../lib/visual-production/celestial-prompt-compiler";
import { canonicalSpecies, compileCreaturePrompt, validateCreaturePrompt } from "../lib/life/creature-system";
import { compileSpeciesPlatePrompt } from "../lib/species-plates/compiler";

const root = path.join(process.cwd(), "data", "visual-production", "nano-banana-2");
const fixture: CanonicalVisualRecord = {
  id: "species-verification-raptor", displayName: "Verification Raptor", scientificName: "Aves verificata", domain: "creature", sourceVersion: "1.0.0", seed: "NOVERIS-VERIFY-01", taxonomy: "Life · Aves", archetypeId: "volume-ib-avian-apex-raptor", variables: { Planet: "Noveris", Biome: "alpine", Gravity: "1.0 G", Atmosphere: "oxygen-bearing", Climate: "cool", Wind: "moderate", "Air Density": "1.0", "Wing Type": "feathered", "Wing Span": "3.1 m", "Feather Type": "contour", Diet: "carnivore", Behavior: "soaring hunter", "Primary Material": "feathers", "Color Palette": "slate and ivory", "Distinctive Features": "split crest" }, lockedFields: ["anatomy.limbs", "anatomy.wingCount", "Planet", "Biome", "Gravity", "Atmosphere", "Distinctive Features"], lockedValues: { limbCount: 4, wingCount: 2 }
};

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function assertVisualOnly(prompt: { visualPrompt: string; negativePrompt: string; combinedPrompt: string }) {
  const text = prompt.visualPrompt;
  assert(!/[{}]|canonical id|source-master|source master|studio ingestion|runtime export|seed|locked values|resolved variables/i.test(text), "Image prompt leaked canonical or authoring data.");
  assert(/no text/i.test(text) && /watermark/i.test(text), "Image prompt must exclude text and watermarks.");
  assert(prompt.combinedPrompt.includes("NEGATIVE / EXCLUDE:"), "Combined prompt must use the v3 negative delimiter.");
  assert(!validateNanoBananaVisualPrompt(prompt).some((issue) => issue.severity === "Structural Error"), "Visual prompt must pass structural safety validation.");
}

async function main() {
  const first = compileNanoBanana2Prompt(fixture, { outputTypeId: "creature-full-body-production-render", variationProfileId: "standard", versionCount: 2, seed: fixture.seed });
  const second = compileNanoBanana2Prompt(fixture, { outputTypeId: "creature-full-body-production-render", variationProfileId: "standard", versionCount: 2, seed: fixture.seed });
  assert(first.promptHash === second.promptHash, "Prompt compilation must be deterministic.");
  assert(first.promptVersion === "3.0.0", "Prompt compiler must publish v3.0.0.");
  assertVisualOnly(first);
  assert(first.canonicalData.id === fixture.id && !first.visualPrompt.includes(fixture.id), "Canonical data must remain separate from the image prompt.");
  assert(!isNanoBanana2PromptStale(fixture, first), "Freshly compiled prompt must not be stale.");
  assert(getNanoBanana2PromptStaleness(fixture, first).reason === "current", "Fresh prompts must report a current staleness reason.");
  assert(isNanoBanana2PromptStale({ ...fixture, variables: { ...fixture.variables, Biome: "coastal" } }, first), "Changed canonical data must mark a prompt stale.");
  const sanitized = sanitizeVisualPromptForRuntime(first);
  assert(!JSON.stringify(sanitized).includes(first.visualPrompt), "Sanitized runtime data must not include authoring prompt text.");
  const pack = exportPromptPack(first);
  assert(pack.json.includes(first.promptHash) && pack.jsonl.includes(first.canonicalId) && pack.csv.includes("canonicalId") && pack.markdown.includes("Visual Prompt") && pack.text.includes("NEGATIVE / EXCLUDE"), "All prompt pack export formats must be available.");
  const lockedOverride = compileNanoBanana2Prompt(fixture, { outputTypeId: "creature-full-body-production-render", authorOverrides: { Planet: "Different world" } });
  assert(!lockedOverride.visualPrompt.includes("Different world"), "Locked author overrides must be ignored.");
  assert(lockedOverride.validation.some((issue) => issue.code === "override_locked_field"), "Locked author overrides must be reported.");
  const invalidReference = compileNanoBanana2Prompt(fixture, { outputTypeId: "creature-full-body-production-render", cameraProfileId: "not-a-camera" });
  assert(invalidReference.validation.some((issue) => issue.code === "invalid_camera_reference"), "Invalid profile references must be reported.");
  assert(compileNanoBanana2VariationSet(fixture, { outputTypeId: "creature-full-body-production-render", seed: fixture.seed }).length === 15, "A complete variation set must include every canonical variation profile.");
  assert(compileNanoBanana2PromptBatch([fixture], { outputTypeId: "creature-full-body-production-render" }).validation.length === 0, "A valid prompt batch must have no duplicate IDs.");
  for (const visual of [
    compileGalaxyVisualPrompt({ category: "Spiral Galaxy", subclass: "Grand Design", displayName: "Grand Design Spiral", prompt: "calm, broad spiral structure" }),
    compileGalacticRegionVisualPrompt({ category: "Milky Way Region", subclass: "Orion Spur", displayName: "Orion Spur", prompt: "calm local stellar neighborhood" }),
    compileStarSystemVisualPrompt({ systemClass: "Main Sequence", subclass: "Sol Analog", displayName: "Sol Analog", systemPrompt: "a stable yellow star with rocky inner worlds and outer giants" }),
    compileStarSystemVisualPrompt({ systemClass: "Main Sequence", subclass: "Sol Analog", displayName: "Sol Analog", systemPrompt: "a stable yellow star with rocky inner worlds and outer giants" }, "environment-painting"),
    compileEnvironmentVisualPrompt({ contextType: "star_system", ownerName: "Sol", environment: "quiet deep space" }),
    compilePlanetVisualPrompt({ planetClass: "Terrestrial", planetSubclass: "Cold Ocean", visualSummary: "pale ice fields, dark basalt continents, and thin silver cloud bands" }),
    compilePlanetVisualPrompt({ planetClass: "Terrestrial", planetSubclass: "Forest", visualSummary: "dense green continents, shallow inland seas, and a humid blue atmosphere" }, "surface"),
    compileCelestialBodyVisualPrompt({ displayName: "Sol", bodyType: "Star", bodyClass: "G-type Yellow", visualSummary: "a calm yellow photosphere with restrained coronal structure" })
  ]) assertVisualOnly(visual);
  const plantPrompt = compileNanoBanana2Prompt({ ...fixture, id: "species-verification-tree", displayName: "Verification Tree", domain: "plant", archetypeId: "volume-pa-trees-temperate-forest-tree", taxonomy: "Flora · Trees" }, { outputTypeId: "plant-whole-plant-production-render" });
  assertVisualOnly(plantPrompt);
  const creaturePrompt = compileCreaturePrompt(canonicalSpecies[0], { modelProfileId: "nano-banana-2" });
  assertVisualOnly(creaturePrompt);
  assert(creaturePrompt.promptVersion === "3.0.0" && creaturePrompt.canonicalData.id === canonicalSpecies[0].id && !creaturePrompt.visualPrompt.includes(canonicalSpecies[0].id), "Creature prompt must expose a v3 visual-only prompt beside canonical data.");
  assert(validateCreaturePrompt(creaturePrompt, canonicalSpecies[0]).status !== "Blocked", "Creature v3 prompt must satisfy its visual contract.");
  const platePrompt = compileSpeciesPlatePrompt({ id: "plate-verification-tree", displayName: "Verification Tree", domain: "plant", sourceVersion: "1.0.0", seed: "NOVERIS-PLATE-VERIFY", taxonomy: "Flora · Trees", archetypeId: "volume-pa-trees-temperate-forest-tree", variables: { Planet: "Noveris", Biome: "temperate forest" }, lockedFields: ["identity"], lockedValues: { growthForm: "tree" } });
  assertVisualOnly(platePrompt);
  assert(platePrompt.promptVersion === "3.0.0" && platePrompt.resolvedVisualVariables !== undefined, "Species plate prompts must expose the v3 metadata contract.");
  assert(creatureArchetypes.length === 245 && plantArchetypes.length === 195, "All canonical creature and plant roadmap archetypes must be represented exactly once.");
  assert(variationProfiles.length === 15, "All fifteen canonical variation profiles must be represented.");
  for (const catalog of [creatureArchetypes, plantArchetypes, productionOutputs, cameraProfiles, lightingProfiles, backgroundProfiles, compositionProfiles, materialProfiles, environmentalAdaptationProfiles, variationProfiles]) assert(new Set(catalog.map((item) => item.id)).size === catalog.length, "Grammar catalog IDs must be unique.");
  const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8")) as { validationStatus?: string; modelProfileId?: string };
  assert(manifest.validationStatus === "Ready" && manifest.modelProfileId === "nano-banana-2", "Generated compiler manifest is invalid.");
  console.log(`Nano Banana 2 v3 prompt compiler verified: ${creatureArchetypes.length} creature archetypes, ${plantArchetypes.length} plant archetypes, and celestial visual prompts.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
