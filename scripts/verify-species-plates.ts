import { attachApprovedSpeciesPlateAssets, compileSpeciesPlatePrompt, createSpeciesPlateRecord, getSpeciesPlatePromptStaleness, sanitizeSpeciesPlateForRuntime, transitionSpeciesPlateStatus } from "../lib/species-plates/compiler";
import { speciesPlateAssetPackContract, speciesPlateLayoutManifest, speciesPlatePanelManifest, speciesPlateSliceManifest, validateSpeciesPlateAssetPack } from "../lib/species-plates/asset-pack";
import { resolveSpeciesPlatePreset, SPECIES_PLATE_MASTER_V1, speciesPlatePresets, speciesPlateVariationProfiles } from "../lib/species-plates/master-template";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

const source = { id: "species-plate-verification", displayName: "Verification Specimen", scientificName: "Specimen verificata", domain: "creature" as const, sourceVersion: "1.0.0", seed: "NOVERIS-SPECIES-PLATE-01", taxonomy: "Life · Vertebrate", archetypeId: "volume-ia-mammalian-grazer", variables: { Planet: "Noveris", Biome: "temperate", Gravity: "1 G" }, lockedFields: ["bodyPlan", "limbCount"], lockedValues: { limbCount: 4, bodyPlan: "quadruped" } };

const plate = createSpeciesPlateRecord(source);
const prompt = compileSpeciesPlatePrompt(source);
assert(SPECIES_PLATE_MASTER_V1.resolution[0] === 4000 && SPECIES_PLATE_MASTER_V1.resolution[1] === 4000, "Species plate master must be 4000x4000.");
assert(SPECIES_PLATE_MASTER_V1.groups.length === 7, "Species plate master must retain all seven layout groups.");
assert(speciesPlatePresets.length === 15, "All fifteen canonical plate presets are required.");
assert(speciesPlateVariationProfiles.length === 12, "All canonical species plate variation profiles are required.");
const botanicalPreset = resolveSpeciesPlatePreset("botanical-standard");
assert(botanicalPreset.templateId === SPECIES_PLATE_MASTER_V1.id && botanicalPreset.groups.length > 0, "Presets must inherit the canonical master template.");
assert(plate.panels.some((item) => item.id === "full_body" && item.required), "Full body hero panel is required.");
assert(prompt.requestedVersionCount === 4 && /4000\s*[x×]\s*4000/i.test(prompt.positivePrompt), "Compiler must preserve master resolution and default version count.");
assert(prompt.negativePrompt.includes("labels") && prompt.lockedFields.includes("limbCount"), "Compiler must enforce no-label and locked-canon rules.");
assert(!getSpeciesPlatePromptStaleness(source, prompt).stale, "Fresh plate prompt must not be stale.");
const changedSource = { ...source, displayName: "Changed Verification Specimen" };
const stale = getSpeciesPlatePromptStaleness(changedSource, prompt);
assert(stale.stale && stale.changedFields.includes("promptHash"), "Canonical record changes must mark an existing prompt stale with changed fields.");
const approved = attachApprovedSpeciesPlateAssets(plate, { approvedAssetId: "asset-species-plate-verification", previewAssetId: "asset-species-plate-preview", thumbnailAssetId: "asset-species-plate-thumbnail", extractedAssetIds: ["asset-full-body"] });
const published = transitionSpeciesPlateStatus(transitionSpeciesPlateStatus(approved, "extraction_pending"), "extracted");
assert(transitionSpeciesPlateStatus(published, "published").productionStatus === "published", "Approved species plates must follow the review and publish state machine.");
const exoticSource = { ...source, id: "exotic-specimen", domain: "exotic-life" as const, taxonomy: "Life · Exotic", archetypeId: undefined };
const exoticPrompt = compileSpeciesPlatePrompt(exoticSource, { presetId: "exotic-creature" });
assert(exoticPrompt.requestedVersionCount === 4 && exoticPrompt.promptVersion === "3.0.0" && exoticPrompt.canonicalData.source !== undefined, "Exotic life must retain its separate canonical source and four visual variations.");
const runtime = sanitizeSpeciesPlateForRuntime(plate);
assert(!JSON.stringify(runtime).includes("positivePrompt") && runtime.templateId === "SPECIES_PLATE_MASTER_V1", "Runtime plate references must remain sanitized.");
for (const panel of plate.panels) {
  assert(panel.targetBounds.x >= 0 && panel.targetBounds.y >= 0 && panel.targetBounds.x + panel.targetBounds.width <= 4000 && panel.targetBounds.y + panel.targetBounds.height <= 4000, `Panel must remain within the 4000 x 4000 canvas: ${panel.id}.`);
}
assert(validateSpeciesPlateAssetPack().length === 0, "Species plate export package must validate.");
const canonicalPanelCount = SPECIES_PLATE_MASTER_V1.groups.flatMap((group) => group.panels).length;
assert(speciesPlateAssetPackContract.slices.length === canonicalPanelCount, "Every canonical panel must publish a production slice.");
assert(!JSON.stringify(speciesPlateAssetPackContract).match(/source-masters|\.psd|positivePrompt|negativePrompt/i), "Species plate art-pack exports must remain private-authoring safe.");
assert(speciesPlateLayoutManifest.groups.length === 7 && speciesPlatePanelManifest.panels.length === canonicalPanelCount && speciesPlateSliceManifest.slices.length === canonicalPanelCount, "Layout, panel, and slice manifests must represent every canonical production panel.");
console.log(`Species plates verified: ${SPECIES_PLATE_MASTER_V1.groups.length} groups, ${plate.panels.length} panels, ${speciesPlatePresets.length} presets, ${speciesPlateAssetPackContract.slices.length} slices.`);
