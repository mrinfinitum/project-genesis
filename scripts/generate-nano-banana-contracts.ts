import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NANO_BANANA_2_COMPILER_VERSION, NANO_BANANA_2_LIBRARY_VERSION, backgroundProfiles, cameraProfiles, compositionProfiles, creatureArchetypes, environmentalAdaptationProfiles, lightingProfiles, materialProfiles, nanoBanana2ModelProfile, plantArchetypes, productionOutputs, psdProductionRules, sharedNegativePrompts, variationProfiles } from "../lib/visual-production/nano-banana-2";

const root = path.join(process.cwd(), "data", "visual-production", "nano-banana-2");
const files = {
  "model-profile.json": nanoBanana2ModelProfile,
  "creature-archetypes.json": creatureArchetypes,
  "plant-archetypes.json": plantArchetypes,
  "output-types.json": productionOutputs,
  "camera-profiles.json": cameraProfiles,
  "lighting-profiles.json": lightingProfiles,
  "background-profiles.json": backgroundProfiles,
  "composition-profiles.json": compositionProfiles,
  "material-profiles.json": materialProfiles,
  "environmental-adaptations.json": environmentalAdaptationProfiles,
  "variation-profiles.json": variationProfiles,
  "negative-prompts.json": { shared: sharedNegativePrompts },
  "psd-production-rules.json": psdProductionRules,
  "manifest.json": {
    id: "noveris_nano_banana_2_visual_prompt_compiler",
    compilerVersion: NANO_BANANA_2_COMPILER_VERSION,
    libraryVersion: NANO_BANANA_2_LIBRARY_VERSION,
    modelProfileId: "nano-banana-2",
    creatureArchetypeCount: creatureArchetypes.length,
    plantArchetypeCount: plantArchetypes.length,
    outputTypeCount: productionOutputs.length,
    compositionProfileCount: compositionProfiles.length,
    validationStatus: "Ready",
    runtimePolicy: "Studio-only full prompts. Runtime receives sanitized prompt provenance only.",
    migration: { volumeIA: "Preserved as a compatibility export and regression baseline in data/visual-prompt-libraries." }
  }
};

async function main() {
  await mkdir(root, { recursive: true });
  await Promise.all(Object.entries(files).map(([filename, contents]) => writeFile(path.join(root, filename), `${JSON.stringify(contents, null, 2)}\n`)));
  console.log(`Generated Nano Banana 2 contracts: ${creatureArchetypes.length} creature archetypes, ${plantArchetypes.length} plant archetypes, ${productionOutputs.length} output grammars.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
