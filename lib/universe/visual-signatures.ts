export const VISUAL_SIGNATURE_VERSION = "visual-signature-v1";
export const VISUAL_SIGNATURE_CONTRACT_VERSION = "1.0.0";

export type VisualSemanticLevel = "universe" | "galaxy" | "sector" | "system";

export type ProceduralVisualSignature = {
  signatureVersion: string; seed: string; semanticLevel: VisualSemanticLevel; archetypeId: string; paletteId: string;
  primaryHue: number; secondaryHue: number; accentHue: number; coreTemperature: number; backgroundTemperature: number;
  saturation: number; contrast: number; exposure: number; luminosity: number; bloomIntensity: number; coreBrightness: number;
  haloStrength: number; vignetteStrength: number; stellarDensity: number; stellarClustering: number; brightStarFrequency: number;
  giantStarFrequency: number; dustDensity: number; dustGrainScale: number; nebulaDensity: number; nebulaOpacity: number;
  nebulaScale: number; nebulaTurbulence: number; nebulaFilamentStrength: number; voidFrequency: number; voidScale: number;
  armCount: number; armTightness: number; armAsymmetry: number; barStrength: number; coreRadius: number; ellipticity: number;
  rotation: number; routeCurvature: number; routeDensity: number; gridVisibility: number; fogDensity: number; fogContrast: number;
  fogHueBias: number; parallaxStrength: number; twinkleStrength: number; ambientMotionSpeed: number; anomalyFrequency: number;
  landmarkBias: number; compositionOffsetX: number; compositionOffsetY: number; visualSalt: string; attemptIndex: number; fingerprint: string;
};

export type VisualOverride = Partial<Omit<ProceduralVisualSignature, "signatureVersion" | "seed" | "semanticLevel" | "visualSalt" | "attemptIndex" | "fingerprint">> & {
  luminosityMultiplier?: number; bloomMultiplier?: number; stellarDensityMultiplier?: number; nebulaDensityMultiplier?: number;
  dustDensityMultiplier?: number; lightingProfileId?: string; nebulaProfileId?: string; dustProfileId?: string; fogProfileId?: string; routeProfileId?: string;
  landmarkDirectives?: string[]; notes?: string;
};

export type VisualProfile = {
  id: string; displayName: string; description: string; validSemanticLevels: VisualSemanticLevel[];
  parameterRanges: Record<string, [number, number]>; weight: number; compatibilityTags: string[]; incompatibilityTags: string[];
  parentAffinity: [number, number]; runtimeStatus: "published"; contentVersion: number;
};

export const paletteFamilies = [
  ["palette_cyan_amber", "Cyan / Deep Blue / Warm Amber", 190, 220, 38],
  ["palette_indigo_gold", "Indigo / Violet / Pale Gold", 235, 275, 48],
  ["palette_emerald_white", "Teal / Emerald / White", 178, 145, 205],
  ["palette_crimson_amber", "Crimson / Magenta / Amber", 350, 320, 32],
  ["palette_cobalt_ice", "Cobalt / Silver / Ice Blue", 220, 205, 192],
  ["palette_bronze_cream", "Bronze / Rust / Cream", 28, 14, 48],
  ["palette_turquoise_lavender", "Turquoise / Lavender / White", 174, 268, 210],
  ["palette_navy_orange", "Deep Navy / Orange / Cyan", 225, 24, 188]
].map(([id, displayName, primaryHue, secondaryHue, accentHue]) => ({ id, displayName, primaryHue, secondaryHue, accentHue })) as Array<{ id: string; displayName: string; primaryHue: number; secondaryHue: number; accentHue: number }>;

const profile = (id: string, displayName: string, levels: VisualSemanticLevel[], ranges: Record<string, [number, number]>, tags: string[] = []): VisualProfile => ({
  id, displayName, description: `${displayName} canonical procedural presentation profile.`, validSemanticLevels: levels,
  parameterRanges: ranges, weight: 1, compatibilityTags: tags, incompatibilityTags: [], parentAffinity: [0.2, 0.6], runtimeStatus: "published", contentVersion: 1
});

export const galaxyArchetypes = ["grand_design_spiral", "flocculent_spiral", "barred_spiral", "ring_galaxy", "lenticular_galaxy", "elliptical_galaxy", "irregular_galaxy", "interacting_pair", "diffuse_dwarf_galaxy", "compact_ancient_galaxy"].map((id) => profile(id, id.replaceAll("_", " "), ["galaxy"], { armCount: [0, 6], ellipticity: [0.05, 0.92] }, ["galaxy"]));
export const sectorArchetypes = ["dense_stellar_nursery", "blue_white_young_cluster", "old_amber_starfield", "violet_ionized_nebula", "dark_molecular_cloud", "sparse_frontier_void", "dust_rich_galactic_lane", "supernova_remnant_region", "globular_like_cluster", "anomalous_luminous_field", "calm_habitable_corridor", "hazardous_radiation_basin"].map((id) => profile(id, id.replaceAll("_", " "), ["sector"], { stellarDensity: [0.08, 0.95], nebulaDensity: [0, 0.9] }, ["sector"]));
export const starSystemArchetypes = ["warm_golden_single_star", "cool_blue_white_system", "red_dwarf_system", "binary_system", "trinary_system", "giant_star_system", "compact_remnant_system", "dusty_proto_system", "luminous_young_system", "ancient_quiet_system", "nebula_embedded_system", "anomaly_touched_system"].map((id) => profile(id, id.replaceAll("_", " "), ["system"], { stellarDensity: [0.05, 0.75], luminosity: [0.12, 1] }, ["system"]));

export const stellarDensityProfiles = [profile("density_sparse", "Sparse", ["galaxy", "sector", "system"], { stellarDensity: [0.08, 0.3] }), profile("density_balanced", "Balanced", ["galaxy", "sector", "system"], { stellarDensity: [0.3, 0.65] }), profile("density_dense", "Dense", ["galaxy", "sector", "system"], { stellarDensity: [0.65, 0.95] })];
export const lightingProfiles = [profile("light_cool", "Cool Luminous", ["galaxy", "sector", "system"], { luminosity: [0.35, 0.85], bloomIntensity: [0.08, 0.4] }), profile("light_warm", "Warm Core", ["galaxy", "sector", "system"], { luminosity: [0.25, 0.8], bloomIntensity: [0.05, 0.35] })];
export const nebulaProfiles = [profile("nebula_clear", "Clear", ["galaxy", "sector", "system"], { nebulaDensity: [0, 0.2] }), profile("nebula_filament", "Filament", ["galaxy", "sector", "system"], { nebulaDensity: [0.25, 0.75], nebulaFilamentStrength: [0.4, 0.95] })];
export const dustVoidProfiles = [profile("dust_clean", "Clean Space", ["galaxy", "sector", "system"], { dustDensity: [0, 0.25], voidFrequency: [0.05, 0.3] }), profile("dust_lane", "Dust and Void Lanes", ["galaxy", "sector", "system"], { dustDensity: [0.35, 0.85], voidFrequency: [0.2, 0.65] })];
export const fogProfiles = [profile("fog_navigation", "Navigation Fog", ["galaxy", "sector", "system"], { fogDensity: [0.12, 0.58], fogContrast: [0.35, 0.85] })];
export const routeProfiles = [profile("route_flowing", "Flowing Routes", ["galaxy", "sector", "system"], { routeCurvature: [0.25, 0.8], routeDensity: [0.1, 0.65] }), profile("route_sparse", "Sparse Routes", ["galaxy", "sector", "system"], { routeCurvature: [0.05, 0.45], routeDensity: [0.02, 0.25] })];

export const visualDeviceProfiles = [
  ["desktop_high", 24000, 1200, 240, 6, 9000, 4, 3, 800, 1400], ["desktop_balanced", 14000, 700, 150, 4, 5000, 3, 2, 500, 800],
  ["mobile_high", 7000, 350, 80, 3, 2400, 2, 1, 240, 360], ["mobile_balanced", 4000, 220, 52, 2, 1400, 1, 1, 140, 220],
  ["mobile_low", 1800, 120, 32, 1, 600, 0, 0, 70, 100]
].map(([id, backgroundStarCount, instancedNavigationNodes, activeLabels, nebulaOctaves, dustParticles, fogComplexity, bloomPasses, activeRouteSegments, probeTrailParticles]) => ({ id, backgroundStarCount, instancedNavigationNodes, activeLabels, nebulaOctaves, dustParticles, fogComplexity, bloomPasses, activeRouteSegments, probeTrailParticles, recommendationOnly: true as const }));

export const discoveryVisibilityMatrix = [
  ["unknown", false, false, false, false, false, false, false, false, false], ["detected", true, false, false, false, false, false, false, false, false],
  ["probed", true, true, false, true, false, false, false, false, false], ["scanned", true, true, false, true, true, false, true, false, false],
  ["surveyed", true, true, true, true, true, true, true, true, false], ["explored", true, true, true, true, true, true, true, true, false],
  ["catalogued", true, true, true, true, true, true, true, true, false], ["colonized", true, true, true, true, true, true, true, true, true]
].map(([id, name, classification, resources, childCounts, hazards, discoveries, routes, registry, ownership]) => ({ id, unknownDisplayName: "???", canShowName: name, canShowClassification: classification, canShowResources: resources, canShowChildCounts: childCounts, canShowHazards: hazards, canShowDiscoveries: discoveries, canShowRoutes: routes, canShowRegistry: registry, canShowOwnership: ownership }));

const hash32 = (value: string) => { let hash = 2166136261; for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); } return hash >>> 0; };
const randomSource = (seed: string) => { let state = hash32(seed) || 1; return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; }; };
const q = (value: number) => Math.round(value * 10000) / 10000;
const between = (random: () => number, min: number, max: number) => q(min + random() * (max - min));
const circularHue = (value: number) => ((Math.round(value) % 360) + 360) % 360;
const blend = (own: number, parent: number | undefined, inheritance: number) => parent === undefined ? own : q(parent * inheritance + own * (1 - inheritance));
const pick = <T>(values: T[], random: () => number) => values[Math.min(values.length - 1, Math.floor(random() * values.length))];
const signatureNumericKeys = ["saturation", "contrast", "exposure", "luminosity", "bloomIntensity", "coreBrightness", "haloStrength", "vignetteStrength", "stellarDensity", "stellarClustering", "brightStarFrequency", "giantStarFrequency", "dustDensity", "dustGrainScale", "nebulaDensity", "nebulaOpacity", "nebulaScale", "nebulaTurbulence", "nebulaFilamentStrength", "voidFrequency", "voidScale", "armTightness", "armAsymmetry", "barStrength", "coreRadius", "ellipticity", "routeCurvature", "routeDensity", "gridVisibility", "fogDensity", "fogContrast", "parallaxStrength", "twinkleStrength", "ambientMotionSpeed", "anomalyFrequency", "landmarkBias"] as const;
const generatedRange = (key: (typeof signatureNumericKeys)[number]): [number, number] => {
  if (key === "exposure") return [-0.2, 0.3];
  if (key === "bloomIntensity") return [0.04, 0.72];
  if (key === "luminosity") return [0.14, 0.96];
  return [0.04, 0.96];
};

export type VisualSignatureInput = { universeSeed: string; generationVersion: string; visualSignatureVersion?: string; semanticLevel: VisualSemanticLevel; canonicalObjectId: string; parentSignature?: ProceduralVisualSignature; visualSalt?: string; attemptIndex?: number; override?: VisualOverride };

export function visualFingerprint(signature: Omit<ProceduralVisualSignature, "fingerprint">) {
  const compact = [signature.archetypeId, signature.paletteId, signature.primaryHue, signature.secondaryHue, signature.luminosity, signature.stellarDensity, signature.nebulaDensity, signature.dustDensity, signature.routeCurvature, signature.compositionOffsetX, signature.compositionOffsetY].join("|");
  return hash32(compact).toString(16).padStart(8, "0");
}

export function visualDistance(left: ProceduralVisualSignature, right: ProceduralVisualSignature) {
  const hue = Math.min(Math.abs(left.primaryHue - right.primaryHue), 360 - Math.abs(left.primaryHue - right.primaryHue)) / 180;
  const morphology = left.archetypeId === right.archetypeId ? 0 : 1;
  const values = [hue, Math.abs(left.luminosity - right.luminosity), Math.abs(left.stellarDensity - right.stellarDensity), (Math.abs(left.nebulaDensity - right.nebulaDensity) + Math.abs(left.dustDensity - right.dustDensity)) / 2, morphology, Math.abs(left.routeCurvature - right.routeCurvature), (Math.abs(left.compositionOffsetX - right.compositionOffsetX) + Math.abs(left.compositionOffsetY - right.compositionOffsetY)) / 2];
  return q(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function parentAffinity(child: ProceduralVisualSignature, parent: ProceduralVisualSignature) { return q(1 - visualDistance(child, parent)); }

export function generateVisualSignature(input: VisualSignatureInput): ProceduralVisualSignature {
  const visualSalt = input.visualSalt ?? "noveris_visual_identity";
  const attemptIndex = input.attemptIndex ?? 0;
  const signatureVersion = input.visualSignatureVersion ?? VISUAL_SIGNATURE_VERSION;
  const seed = [input.universeSeed, input.generationVersion, signatureVersion, input.semanticLevel, input.canonicalObjectId, visualSalt, attemptIndex].join(":");
  const random = randomSource(seed);
  const archetypes = input.semanticLevel === "galaxy" ? galaxyArchetypes : input.semanticLevel === "sector" ? sectorArchetypes : input.semanticLevel === "system" ? starSystemArchetypes : galaxyArchetypes;
  const palette = input.parentSignature && random() < 0.55 ? paletteFamilies.find((item) => item.id === input.parentSignature?.paletteId) ?? pick(paletteFamilies, random) : pick(paletteFamilies, random);
  const inheritance = input.semanticLevel === "sector" ? between(random, 0.35, 0.6) : input.semanticLevel === "system" ? between(random, 0.2, 0.45) : 0;
  const parent = input.parentSignature;
  const numeric = Object.fromEntries(signatureNumericKeys.map((key) => {
    const [minimum, maximum] = generatedRange(key);
    return [key, blend(between(random, minimum, maximum), parent?.[key], inheritance)];
  })) as Record<(typeof signatureNumericKeys)[number], number>;
  const base = {
    signatureVersion, seed, semanticLevel: input.semanticLevel, archetypeId: input.override?.archetypeId ?? pick(archetypes, random).id, paletteId: input.override?.paletteId ?? palette.id,
    primaryHue: circularHue(blend(palette.primaryHue + between(random, -18, 18), parent?.primaryHue, inheritance)), secondaryHue: circularHue(blend(palette.secondaryHue + between(random, -18, 18), parent?.secondaryHue, inheritance)), accentHue: circularHue(blend(palette.accentHue + between(random, -12, 12), parent?.accentHue, inheritance)),
    coreTemperature: blend(between(random, 2800, 14000), parent?.coreTemperature, inheritance), backgroundTemperature: blend(between(random, 1800, 9000), parent?.backgroundTemperature, inheritance),
    ...numeric, armCount: input.semanticLevel === "galaxy" ? Math.round(between(random, 0, 6)) : 0, rotation: between(random, 0, 360), fogHueBias: between(random, -32, 32), compositionOffsetX: between(random, -0.35, 0.35), compositionOffsetY: between(random, -0.35, 0.35), visualSalt, attemptIndex
  } as Omit<ProceduralVisualSignature, "fingerprint">;
  const override = input.override ?? {};
  const merged = { ...base, ...Object.fromEntries(Object.entries(override).filter(([key]) => key in base)) } as Omit<ProceduralVisualSignature, "fingerprint">;
  if (override.luminosityMultiplier) merged.luminosity = q(merged.luminosity * override.luminosityMultiplier);
  if (override.bloomMultiplier) merged.bloomIntensity = q(merged.bloomIntensity * override.bloomMultiplier);
  if (override.stellarDensityMultiplier) merged.stellarDensity = q(merged.stellarDensity * override.stellarDensityMultiplier);
  if (override.nebulaDensityMultiplier) merged.nebulaDensity = q(merged.nebulaDensity * override.nebulaDensityMultiplier);
  if (override.dustDensityMultiplier) merged.dustDensity = q(merged.dustDensity * override.dustDensityMultiplier);
  return { ...merged, fingerprint: visualFingerprint(merged) };
}

export function generateUniqueVisualSignature(input: VisualSignatureInput, siblings: ProceduralVisualSignature[], minimumDistance = 0.12) {
  let signature = generateVisualSignature(input);
  for (let attempt = 0; attempt < 8 && siblings.some((sibling) => visualDistance(signature, sibling) < minimumDistance); attempt += 1) signature = generateVisualSignature({ ...input, attemptIndex: attempt + 1 });
  return signature;
}

export function validateVisualSignature(signature: ProceduralVisualSignature) {
  const issues: Array<{ severity: "error" | "warning"; code: string; message: string }> = [];
  for (const key of signatureNumericKeys) if (signature[key] < (key === "exposure" ? -0.5 : 0) || signature[key] > 1.25) issues.push({ severity: "error", code: "visual_range_invalid", message: `${key} is outside its validated range.` });
  if (!signature.signatureVersion) issues.push({ severity: "error", code: "visual_version_missing", message: "visualSignatureVersion is required." });
  if (signature.bloomIntensity > 0.82) issues.push({ severity: "warning", code: "visual_bloom_excessive", message: "Bloom exceeds the authoring recommendation." });
  if (signature.luminosity < 0.1) issues.push({ severity: "warning", code: "visual_darkness_excessive", message: "Luminosity may be unreadable." });
  return issues;
}

export type LegacyVisualRecord = { id: string; seed: string; visual_signature?: ProceduralVisualSignature; visualSignatureVersion?: string };

export function migrateLegacyVisualRecord(record: LegacyVisualRecord, input: Omit<VisualSignatureInput, "canonicalObjectId" | "universeSeed">) {
  if (record.visual_signature?.signatureVersion === VISUAL_SIGNATURE_VERSION) return { record, migrated: false, preservedCanonicalId: true };
  return {
    record: { ...record, visualSignatureVersion: VISUAL_SIGNATURE_VERSION, visual_signature: generateVisualSignature({ ...input, universeSeed: record.seed, canonicalObjectId: record.id }) },
    migrated: true,
    preservedCanonicalId: true
  };
}

export const proceduralUniverseVisualContract = {
  id: "procedural_universe_visual_contract", version: VISUAL_SIGNATURE_CONTRACT_VERSION, visualSignatureVersion: VISUAL_SIGNATURE_VERSION,
  ownership: { studioOwns: ["seeds", "profiles", "bounds", "overrides", "validation", "sanitized contracts"], gameOwns: ["rendering", "camera", "fog masks", "probe state", "player discovery progression", "saves"] },
  deterministicRules: { prng: "xorshift32", hash: "FNV-1a-32", quantizationDecimals: 4, topologySalt: "topology", visualSalt: "noveris_visual_identity", uniquenessAttempts: 8, siblingMinimumDistance: 0.12, sectorParentInheritance: [0.35, 0.6], systemParentInheritance: [0.2, 0.45] },
  profileLibraries: { galaxyArchetypes, sectorArchetypes, starSystemArchetypes, paletteFamilies, stellarDensityProfiles, lightingProfiles, nebulaProfiles, dustVoidProfiles, fogProfiles, routeProfiles },
  authoringSchemas: {
    universeDefinition: ["universeId", "universeSeed", "generationVersion", "visualSignatureVersion", "defaultGenerationProfileId", "defaultVisualProfileId", "galaxyGenerationRules", "runtimeStatus"],
    galaxyDefinition: ["canonicalId", "parentUniverseId", "childIndex", "generationMode", "seedOverride", "galaxyArchetypeId", "approximateSectorCount", "spatialBounds", "visualOverride", "tags"],
    sectorDefinition: ["canonicalId", "parentGalaxyId", "childIndex", "generationMode", "seedOverride", "sectorArchetypeId", "approximateSystemCount", "spatialBounds", "visualOverride", "tags"],
    starSystemDefinition: ["canonicalId", "parentSectorId", "childIndex", "generationMode", "seedOverride", "systemArchetypeId", "starConfiguration", "bodyGenerationRules", "canonicalOrbitRules", "visualOverride", "tags"]
  },
  deviceProfiles: visualDeviceProfiles, discoveryVisibility: discoveryVisibilityMatrix,
  topologyDefinition: { hierarchy: ["universe", "galaxy", "sector", "star_system", "star", "planet", "moon", "asteroid_belt", "station", "anomaly"], materializeAllDescendants: false, generationMode: "on_demand" },
  overridePolicy: { optional: true, mergesOntoDeterministicDefaults: true, mayNotChangeCanonicalIds: true },
  validationRules: ["No Math.random for persistent visual identity.", "Visual-only version changes may not alter topology IDs.", "Player discovery, probe, camera, and save state are never published by Studio."]
} as const;

export type ProceduralUniverseVisualContract = typeof proceduralUniverseVisualContract;
