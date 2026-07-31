import { compileSpeciesPlatePrompt, createSpeciesPlateRecord, getSpeciesPlatePromptStaleness, sanitizeSpeciesPlateForRuntime } from "../lib/species-plates/compiler";
import { SPECIES_PLATE_MASTER_V1, speciesPlatePresets, speciesPlateVariationProfiles } from "../lib/species-plates/master-template";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

const source = { id: "species-plate-verification", displayName: "Verification Specimen", scientificName: "Specimen verificata", domain: "creature" as const, sourceVersion: "1.0.0", seed: "NOVERIS-SPECIES-PLATE-01", taxonomy: "Life · Vertebrate", archetypeId: "volume-ia-mammalian-grazer", variables: { Planet: "Noveris", Biome: "temperate", Gravity: "1 G" }, lockedFields: ["bodyPlan", "limbCount"], lockedValues: { limbCount: 4, bodyPlan: "quadruped" } };

const plate = createSpeciesPlateRecord(source);
const prompt = compileSpeciesPlatePrompt(source);
assert(SPECIES_PLATE_MASTER_V1.resolution[0] === 4000 && SPECIES_PLATE_MASTER_V1.resolution[1] === 4000, "Species plate master must be 4000x4000.");
assert(SPECIES_PLATE_MASTER_V1.groups.length === 7, "Species plate master must retain all seven layout groups.");
assert(speciesPlatePresets.length === 15, "All fifteen canonical plate presets are required.");
assert(speciesPlateVariationProfiles.length === 12, "All canonical species plate variation profiles are required.");
assert(plate.panels.some((item) => item.id === "full_body" && item.required), "Full body hero panel is required.");
assert(prompt.requestedVersionCount === 4 && prompt.positivePrompt.includes("4000x4000"), "Compiler must preserve master resolution and default version count.");
assert(prompt.negativePrompt.includes("labels") && prompt.lockedFields.includes("limbCount"), "Compiler must enforce no-label and locked-canon rules.");
assert(!getSpeciesPlatePromptStaleness(source, prompt).stale, "Fresh plate prompt must not be stale.");
const runtime = sanitizeSpeciesPlateForRuntime(plate);
assert(!JSON.stringify(runtime).includes("positivePrompt") && runtime.templateId === "SPECIES_PLATE_MASTER_V1", "Runtime plate references must remain sanitized.");
console.log(`Species plates verified: ${SPECIES_PLATE_MASTER_V1.groups.length} groups, ${plate.panels.length} panels, ${speciesPlatePresets.length} presets.`);
