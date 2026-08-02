import type { SpeciesPlateDomain, SpeciesPlateGroup, SpeciesPlatePanel, SpeciesPlatePreset, SpeciesPlateTemplate, SpeciesPlateVariationProfile } from "@/lib/species-plates/types";

const allLifeDomains: SpeciesPlateDomain[] = ["creature", "plant", "fungi", "microorganism", "exotic-life"];
const bounds = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

function panel(id: string, title: string, role: SpeciesPlatePanel["role"], order: number, targetBounds: SpeciesPlatePanel["targetBounds"], required = false, domain = allLifeDomains): SpeciesPlatePanel {
  return {
    id, title, domain, required, enabled: required, order, role, outputType: id.replaceAll("_", "-"), sourcePromptId: null, sourceAssetId: null, generatedAssetId: null,
    aspectRatio: `${targetBounds.width}:${targetBounds.height}`, targetBounds, safeBounds: bounds(targetBounds.x + 20, targetBounds.y + 20, Math.max(1, targetBounds.width - 40), Math.max(1, targetBounds.height - 40)),
    cameraProfileId: role === "orthographic" ? "orthographic-front" : "CAM_SPECIES_PLATE", lightingProfileId: "LIGHT_MUSEUM_SPECIMEN", backgroundProfileId: "species-plate",
    extractionMode: role === "environment" ? "context" : role === "anatomy" ? "study" : "isolated", transparentCompatible: role !== "environment", preserveScale: true, preserveAnatomy: true, preserveColor: true, preserveMaterials: true,
    allowVariant: role === "variant" || role === "lifecycle", validationStatus: "valid", productionStatus: "not_started", notes: "Canonical master panel; no labels, UI, borders, logos, or watermarks in generated art."
  };
}

const groups: SpeciesPlateGroup[] = [
  { id: "hero", title: "Hero", required: true, order: 1, layoutMode: "hero", gridColumns: 3, gap: 40, padding: 80, minPanels: 1, maxPanels: 3, panels: [panel("full_body", "Full Body", "hero", 1, bounds(950, 180, 2100, 1880), true), panel("main_portrait", "Main Portrait", "hero", 2, bounds(160, 180, 700, 820)), panel("silhouette", "Silhouette", "hero", 3, bounds(3140, 180, 700, 820))] },
  { id: "orthographic_views", title: "Orthographic Views", required: true, order: 2, layoutMode: "strip", gridColumns: 5, gap: 24, padding: 80, minPanels: 2, maxPanels: 5, panels: ["front", "side", "rear", "top", "bottom"].map((id, index) => panel(id, `${id[0].toUpperCase()}${id.slice(1)} View`, "orthographic", index + 1, bounds(160 + index * 750, 2140, 620, 520), index < 2)) },
  { id: "support_and_anatomy", title: "Support and Anatomy", required: false, order: 3, layoutMode: "grid", gridColumns: 5, gap: 24, padding: 80, minPanels: 0, maxPanels: 5, panels: ["skeleton_or_support_structure", "musculature_or_motion_system", "internal_anatomy", "external_anatomy", "cross_section"].map((id, index) => panel(id, id.replaceAll("_", " "), "anatomy", index + 1, bounds(160 + index * 750, 2740, 620, 480))) },
  { id: "lifecycle", title: "Lifecycle", required: false, order: 4, layoutMode: "strip", gridColumns: 5, gap: 24, padding: 80, minPanels: 0, maxPanels: 5, panels: ["reproductive_form", "juvenile", "adolescent", "adult", "elder", "terminal_or_dormant_state"].map((id, index) => panel(id, id.replaceAll("_", " "), "lifecycle", index + 1, bounds(160 + (index % 5) * 750, 3300 + Math.floor(index / 5) * 360, 620, 280))) },
  { id: "variants", title: "Variants", required: false, order: 5, layoutMode: "grid", gridColumns: 4, gap: 24, padding: 80, minPanels: 0, maxPanels: 8, panels: ["male", "female", "caste", "regional_variant", "seasonal_variant", "rare_variant", "domesticated_variant", "engineered_variant"].map((id, index) => panel(id, id.replaceAll("_", " "), "variant", index + 1, bounds(160 + (index % 4) * 930, 3260 + Math.floor(index / 4) * 190, 780, 150), false)) },
  { id: "reference_details", title: "Reference Details", required: false, order: 6, layoutMode: "grid", gridColumns: 5, gap: 24, padding: 80, minPanels: 0, maxPanels: 10, panels: ["eye_or_primary_sensor", "mouth_or_feeding_structure", "foot_claw_root_or_anchor", "skin_fur_scale_bark_or_surface", "wing_fin_leaf_or_collector", "horn_antler_branch_or_structural_detail", "tail_vine_or_extension", "material_swatches", "color_palette", "footprint_track_spore_or_growth_trace"].map((id, index) => panel(id, id.replaceAll("_", " "), "detail", index + 1, bounds(160 + (index % 5) * 750, 3640 + Math.floor(index / 5) * 140, 620, 100), false)) },
  { id: "scale_and_environment", title: "Scale and Environment", required: false, order: 7, layoutMode: "grid", gridColumns: 4, gap: 24, padding: 80, minPanels: 0, maxPanels: 4, panels: ["scale_comparison", "habitat_thumbnail", "biome_distribution_thumbnail", "planet_context_thumbnail"].map((id, index) => panel(id, id.replaceAll("_", " "), id === "scale_comparison" ? "scale" : "environment", index + 1, bounds(160 + index * 930, 3780, 780, 120), false, [...allLifeDomains, "comparative", "ecosystem"])) }
];

export const SPECIES_PLATE_MASTER_V1: SpeciesPlateTemplate = {
  id: "SPECIES_PLATE_MASTER_V1", recordType: "species_plate_template", version: "1.0.0", status: "canonical", displayName: "NOVERIS Species Plate Master", description: "The canonical scientific reference-board contract for NOVERIS life records.", domain: "multi-domain", outputType: "scientific-reference-board", modelProfile: "nano-banana-2", resolution: [4000, 4000], aspectRatio: "1:1", background: "pure-black", modelProfileId: "nano-banana-2", styleProfileId: "STYLE_NOVERIS_SCIENTIFIC_REALISM", cameraProfileId: "CAM_SPECIES_PLATE", lightingProfileId: "LIGHT_MUSEUM_SPECIMEN", defaultVersionCount: 4, psdFriendly: true, generateMultipleVersions: true, anatomyChangesAllowed: false, materialChangesAllowed: false, backgroundChangesAllowed: false, naturalVariationAllowed: true, groups,
  promptRules: ["Use the canonical source record and generation seed.", "Keep locked anatomy, materials, identity, taxonomy, and planet context fixed.", "Use clean separations and no labels, UI, borders, logos, frames, or watermarks."],
  validationRules: ["Every enabled required panel must resolve.", "All panel bounds must remain inside the 4000 x 4000 canvas.", "Only compatible domain substitutions may be used.", "Approved runtime records may contain asset references but never prompts or source-master paths."],
  negativePromptProfile: ["labels", "diagram callouts", "invented anatomy", "inconsistent scale", "touching subjects", "occluded anatomy", "watermarks", "logos"],
  sourceMasterRules: ["Keep PSD masters private under the canonical species-plates source-master root.", "Maintain a source manifest per plate.", "Store approved and rejected work separately."],
  exportFormats: ["png", "webp", "artpack", "manifest"],
  runtimeSanitization: ["approved asset IDs", "preview and thumbnail asset IDs", "extracted asset IDs", "template version", "prompt hash", "generation seed", "production status", "visibility-safe discovery rules"],
  createdAt: "2026-07-31", updatedAt: "2026-07-31"
};

export const speciesPlateDomainMappings: Record<SpeciesPlateDomain, Record<string, string>> = {
  creature: {}, plant: { skeleton_or_support_structure: "root_or_anchor_system", musculature_or_motion_system: "growth_or_transport_system", foot_claw_root_or_anchor: "root_or_anchor", wing_fin_leaf_or_collector: "leaf_or_collector", footprint_track_spore_or_growth_trace: "growth_trace" }, fungi: { skeleton_or_support_structure: "support_lattice", musculature_or_motion_system: "growth_network", reproductive_form: "propagation_event", foot_claw_root_or_anchor: "mycelial_anchor", footprint_track_spore_or_growth_trace: "spore_trace" }, microorganism: { skeleton_or_support_structure: "support_lattice", musculature_or_motion_system: "motion_field", internal_anatomy: "energy_circulation", external_anatomy: "containment_boundary", footprint_track_spore_or_growth_trace: "field_trace" }, "exotic-life": { skeleton_or_support_structure: "support_lattice", musculature_or_motion_system: "motion_field", internal_anatomy: "energy_circulation", external_anatomy: "containment_boundary", reproductive_form: "propagation_event", foot_claw_root_or_anchor: "anchor_field", footprint_track_spore_or_growth_trace: "field_trace" }, comparative: {}, ecosystem: {}
};

type SpeciesPlatePresetDefinition = [
  id: string,
  displayName: string,
  domain: SpeciesPlateDomain,
  enabledGroupIds: string[]
];

const presetDefinitions: SpeciesPlatePresetDefinition[] = [
  ["creature-standard", "Creature Standard", "creature", ["hero", "orthographic_views", "support_and_anatomy", "lifecycle", "reference_details", "scale_and_environment"]],
  ["flying-creature", "Flying Creature", "creature", ["hero", "orthographic_views", "support_and_anatomy", "lifecycle", "reference_details", "scale_and_environment"]],
  ["aquatic-creature", "Aquatic Creature", "creature", ["hero", "orthographic_views", "support_and_anatomy", "lifecycle", "reference_details", "scale_and_environment"]],
  ["colonial-creature", "Colonial Creature", "creature", ["hero", "orthographic_views", "lifecycle", "variants", "reference_details", "scale_and_environment"]],
  ["exotic-creature", "Exotic Creature", "exotic-life", ["hero", "orthographic_views", "support_and_anatomy", "lifecycle", "reference_details", "scale_and_environment"]],
  ["artificial-creature", "Artificial Creature", "creature", ["hero", "orthographic_views", "support_and_anatomy", "variants", "reference_details", "scale_and_environment"]],
  ["botanical-standard", "Botanical Standard", "plant", ["hero", "orthographic_views", "support_and_anatomy", "lifecycle", "reference_details", "scale_and_environment"]],
  ["tree", "Tree", "plant", ["hero", "orthographic_views", "support_and_anatomy", "lifecycle", "reference_details", "scale_and_environment"]],
  ["flower", "Flower", "plant", ["hero", "orthographic_views", "lifecycle", "reference_details", "scale_and_environment"]],
  ["aquatic-flora", "Aquatic Flora", "plant", ["hero", "orthographic_views", "support_and_anatomy", "lifecycle", "reference_details", "scale_and_environment"]],
  ["fungal", "Fungal", "fungi", ["hero", "orthographic_views", "support_and_anatomy", "lifecycle", "reference_details", "scale_and_environment"]],
  ["microbial", "Microbial", "microorganism", ["hero", "orthographic_views", "support_and_anatomy", "lifecycle", "reference_details"]],
  ["fossil", "Fossil", "comparative", ["hero", "orthographic_views", "support_and_anatomy", "reference_details", "scale_and_environment"]],
  ["comparative", "Comparative", "comparative", ["hero", "orthographic_views", "variants", "reference_details", "scale_and_environment"]],
  ["planet-ecosystem", "Planet Ecosystem", "ecosystem", ["hero", "lifecycle", "variants", "scale_and_environment"]]
];
export const speciesPlatePresets: SpeciesPlatePreset[] = presetDefinitions.map(([id, displayName, domain, enabledGroupIds]) => ({ id, displayName, domain, enabledGroupIds, enabledPanelIds: groups.filter((group) => enabledGroupIds.includes(group.id)).flatMap((group) => group.panels.map((item) => item.id)), notes: "Start from the canonical master; only compatible panels are enabled." }));

export function resolveSpeciesPlatePreset(presetId: string) {
  const preset = speciesPlatePresets.find((item) => item.id === presetId);
  if (!preset) throw new Error(`Unknown species plate preset: ${presetId}`);
  return {
    ...preset,
    templateId: SPECIES_PLATE_MASTER_V1.id,
    templateVersion: SPECIES_PLATE_MASTER_V1.version,
    groups: SPECIES_PLATE_MASTER_V1.groups
      .filter((group) => preset.enabledGroupIds.includes(group.id))
      .map((group) => ({ ...group, panels: group.panels.filter((panel) => preset.enabledPanelIds.includes(panel.id)) }))
  };
}

const locked = ["identity", "taxonomy", "bodyPlan", "symmetry", "limbCount", "wingCount", "headCount", "rootOrBranchCount", "reproduction", "planet", "biome", "materials", "lockedColor", "distinctiveFeatures", "lifeStage"];
const variationDefinitions: Array<[string, string, string, string[]]> = [
  ["strict-canon", "Strict Canon", "strict", []], ["conservative", "Conservative", "conservative", ["minor surface variation"]], ["standard", "Standard", "standard", ["natural secondary variation"]], ["regional-variant", "Regional Variant", "variant", ["regional coloration", "environmental wear"]], ["seasonal-variant", "Seasonal Variant", "variant", ["seasonal coat or foliage"]], ["sex-or-morph", "Sex or Morph", "variant", ["approved sex or morph attributes"]], ["juvenile", "Juvenile", "variant", ["juvenile proportions", "approved lifecycle state"]], ["elder", "Elder", "variant", ["elder surface and posture"]], ["domesticated", "Domesticated", "variant", ["approved domestication traits"]], ["engineered", "Engineered", "variant", ["approved engineered traits"]], ["rare-color", "Rare Color", "variant", ["approved rare coloration only"]], ["environmental-stress", "Environmental Stress", "variant", ["environmental stress response"]]
];
export const speciesPlateVariationProfiles: SpeciesPlateVariationProfile[] = variationDefinitions.map(([id, displayName, strength, allowedChanges]) => ({ id, displayName, strength: strength as SpeciesPlateVariationProfile["strength"], allowedChanges, lockedFields: locked }));

export const speciesPlatePromptTemplate = "Create a premium NOVERIS scientific reference plate on a pure black 4000 x 4000 field. Show a clear hero specimen with separated supporting studies, generous negative space, coherent scale, and clean extraction-ready edges. No text, labels, watermark, logo, interface, border, frame, arrows, or decorative treatment. Generate {{versionCount}} visually coherent interpretations with only subtle secondary variation.";
