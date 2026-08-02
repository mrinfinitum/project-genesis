import { ResourceService } from "@/lib/resources/service";

export const creatureFunctionalCategories = [
  "terrestrial",
  "aquatic",
  "aerial",
  "amphibious",
  "burrowing",
  "arboreal",
  "colonial",
  "parasitic",
  "symbiotic",
  "photosynthetic",
  "chemosynthetic",
  "energy-based",
  "crystalline",
  "silicon-based",
  "gaseous",
  "plasma-based",
  "artificial",
  "exotic"
] as const;

export const creatureHabitats = [
  "surface",
  "ocean",
  "freshwater",
  "atmospheric",
  "subterranean",
  "cavern",
  "volcanic",
  "polar",
  "orbital",
  "crystalline",
  "energy-field",
  "artificial-habitat"
] as const;

export const creatureEcologicalRoles = [
  "primary-producer",
  "grazer",
  "apex-predator",
  "scavenger",
  "decomposer",
  "pollinator",
  "seed-disperser",
  "filter-feeder",
  "parasite",
  "symbiote",
  "keystone-species",
  "ecosystem-engineer",
  "resource-producer",
  "indicator-species",
  "anomaly-host"
] as const;

export type CreatureFunctionalCategory = typeof creatureFunctionalCategories[number];
export type CreatureHabitat = typeof creatureHabitats[number];
export type CreatureEcologicalRole = typeof creatureEcologicalRoles[number];
export type CreatureGenerationMode = "scientific" | "cinematic" | "exotic" | "artificial";
export type SpeciesCanonStatus = "draft" | "review" | "approved" | "published";
export type SpeciesDiscoveryState = "unknown" | "detected" | "catalogued" | "studied" | "mastered";

export type SpeciesResourceYield = {
  resourceId: string;
  yieldType: "harvest" | "byproduct" | "research" | "discovery";
  rate: number;
  notes: string;
};

export type CreatureArtProfile = {
  id: string;
  speciesId: string;
  sourceMasterPath: string;
  previewPath: string | null;
  cardPath: string | null;
  heroPath: string | null;
  stateKeys: string[];
  derivativeProfile: "library_thumbnail" | "creature_card" | "creature_hero";
  status: "missing" | "source_only" | "preview_ready" | "approved" | "published";
};

export type CreatureAnimationProfile = {
  id: string;
  speciesId: string;
  idle: string;
  movement: string[];
  combat: string[];
  reproduction: string[];
  status: "planned" | "source_only" | "ready";
};

export type CreatureAudioProfile = {
  id: string;
  speciesId: string;
  calls: string[];
  ambience: string[];
  communication: string[];
  status: "planned" | "source_only" | "ready";
};

export type SpeciesOccurrence = {
  id: string;
  speciesId: string;
  planetId: string;
  biomeId: string;
  habitat: CreatureHabitat;
  abundance: "rare" | "uncommon" | "common" | "dominant";
  discoveryState: SpeciesDiscoveryState;
  spawnWeight: number;
  notes: string;
};

export type SpeciesRecord = {
  id: string;
  displayName: string;
  scientificName: string;
  canonStatus: SpeciesCanonStatus;
  generatedName: string;
  seed: string;
  generationVersion: string;
  originPlanetId: string | null;
  originBiomeId: string | null;
  taxonomy: {
    domain: "life" | "artificial" | "exotic";
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  functionalCategories: CreatureFunctionalCategory[];
  habitats: CreatureHabitat[];
  ecologicalRoles: CreatureEcologicalRole[];
  appearance: {
    bodyPlan: string;
    symmetry: string;
    sizeRange: [number, number];
    massRange: [number, number];
    locomotion: string[];
    coloration: string[];
    distinguishingFeatures: string[];
  };
  anatomy: {
    limbs: number;
    appendages: string[];
    sensorySystems: string[];
    feedingStructures: string[];
    defensiveStructures: string[];
  };
  physiology: {
    metabolism: string;
    respiration: string;
    temperatureRegulation: string;
    lifespanYears: [number, number];
    regeneration: string;
    adaptations: string[];
  };
  compatibility: {
    gravityRange: [number, number];
    temperatureRangeC: [number, number];
    atmosphereTypes: string[];
    waterRequirement: "none" | "trace" | "required";
  };
  behavior: {
    activityCycle: string;
    socialStructure: string;
    intelligence: string;
    temperament: string;
    migration: string;
    communication: string[];
  };
  ecology: {
    diet: string[];
    predatorSpeciesIds: string[];
    preySpeciesIds: string[];
    symbioticSpeciesIds: string[];
    ecologicalImpact: string;
    populationControls: string[];
  };
  reproduction: {
    strategy: string;
    maturityYears: number;
    gestationOrIncubationDays: number;
    offspringRange: [number, number];
    seasonal: boolean;
  };
  lifecycleStages: string[];
  intelligence: {
    level: string;
    toolUse: boolean;
    languagePotential: boolean;
    civilizationPotential: boolean;
  };
  hazards: {
    dangerRating: "low" | "moderate" | "high" | "extreme";
    venomous: boolean;
    territorial: boolean;
    diseaseRisk: string;
    environmentalThreats: string[];
  };
  domestication: {
    possible: boolean;
    difficulty: string;
    uses: string[];
  };
  resourceYields: SpeciesResourceYield[];
  discoveryRules: {
    requiredStates: SpeciesDiscoveryState[];
    scanDifficulty: number;
    researchTags: string[];
  };
  variants: string[];
  artProfileId: string;
  animationProfileId: string;
  audioProfileId: string;
  confidence: "speculative" | "derived" | "observed" | "canonical";
  notes: string;
};

export type CreatureGeneratorContract = {
  id: "creature_generator_v1";
  schemaVersion: "1.0.0";
  generationVersion: "creature-generation-v1";
  ownership: { studioOwns: string[]; gameOwns: string[]; playerStateLivesIn: string };
  supportedModes: CreatureGenerationMode[];
  authoringSections: string[];
  lockableFields: string[];
  requiredReferences: string[];
  artPipeline: { sourceRoot: string; allowedMasters: string[]; derivativeProfiles: string[]; publishPolicy: string };
  negativeRules: string[];
};

export type CreatureValidationIssue = { severity: "error" | "warning"; code: string; message: string; records: string[] };
export type CreatureSystemValidation = { status: "Ready" | "Ready With Warnings" | "Blocked"; issues: CreatureValidationIssue[] };

const resourceId = (name: string) => ResourceService.resolveId(name) ?? `UNRESOLVED:${name}`;

export const creatureGeneratorContract: CreatureGeneratorContract = {
  id: "creature_generator_v1",
  schemaVersion: "1.0.0",
  generationVersion: "creature-generation-v1",
  ownership: {
    studioOwns: ["species definitions", "taxonomy", "ecology", "behavior", "resource yields", "discovery rules", "art references", "runtime publication"],
    gameOwns: ["spawned instances", "simulation", "movement runtime", "combat runtime", "rendering"],
    playerStateLivesIn: "Supabase"
  },
  supportedModes: ["scientific", "cinematic", "exotic", "artificial"],
  authoringSections: ["identity", "taxonomy", "body plan", "anatomy", "physiology", "compatibility", "movement", "behavior", "ecology", "reproduction", "intelligence", "hazards", "domestication", "yields", "discovery", "variants", "art", "animation", "audio", "validation", "runtime"],
  lockableFields: ["generationMode", "seed", "bodyPlan", "functionalCategory", "habitat", "ecologicalRole", "rarity"],
  requiredReferences: ["planet", "biome", "resource_catalog", "discovery", "research"],
  artPipeline: {
    sourceRoot: "source-masters/life/creatures",
    allowedMasters: ["PNG", "PSD", "PSB", "TIFF", "SVG"],
    derivativeProfiles: ["library_thumbnail", "creature_card", "creature_hero", "game_runtime"],
    publishPolicy: "Never publish private source-master paths or player-specific state. Approve derivatives before runtime publication."
  },
  negativeRules: ["no player state", "no runtime spawn instances", "no duplicated resource definitions", "no unresolved taxonomy IDs", "no invented planet or biome links"]
};

const starterSpecies = [
  { id: "species-verdant-stag", name: "Verdant Stag", scientific: "Cervus viridans", category: "terrestrial" as const, habitat: "surface" as const, role: "grazer" as const, bodyPlan: "large quadruped", planet: "fixed-sol-earth", biome: "temperate-forest", colors: ["moss green", "warm umber"], resources: [[resourceId("Organic Compounds"), "byproduct"] as const] },
  { id: "species-skysail-glider", name: "Skysail Glider", scientific: "Aves velaris", category: "aerial" as const, habitat: "atmospheric" as const, role: "indicator-species" as const, bodyPlan: "membranous flier", planet: "fixed-sol-earth", biome: "temperate-forest", colors: ["cloud white", "deep teal"], resources: [[resourceId("Survey Data"), "research"] as const] },
  { id: "species-stoneback-grazer", name: "Stoneback Grazer", scientific: "Saxum herbivora", category: "terrestrial" as const, habitat: "surface" as const, role: "ecosystem-engineer" as const, bodyPlan: "armored megafauna", planet: "fixed-sol-earth", biome: "mountain", colors: ["basalt gray", "lichen gold"], resources: [[resourceId("Organic Compounds"), "harvest"] as const] }
];

type StarterSpeciesInput = {
  id: string;
  name: string;
  scientific: string;
  category: CreatureFunctionalCategory;
  habitat: CreatureHabitat;
  role: CreatureEcologicalRole;
  bodyPlan: string;
  planet: string;
  biome: string;
  colors: string[];
  resources: ReadonlyArray<readonly [string, SpeciesResourceYield["yieldType"]]>;
};

function starterRecord(input: StarterSpeciesInput): SpeciesRecord {
  const artProfileId = `${input.id}-art`;
  return {
    id: input.id, displayName: input.name, scientificName: input.scientific, canonStatus: "draft", generatedName: input.name,
    seed: `NOVERIS-LIFE:${input.id}`, generationVersion: creatureGeneratorContract.generationVersion, originPlanetId: input.planet, originBiomeId: input.biome,
    taxonomy: { domain: "life", kingdom: "animalia", phylum: "chordata", class: "canonical-life", order: "planetary-fauna", family: input.category, genus: input.name.toLowerCase().replaceAll(" ", "-"), species: input.id },
    functionalCategories: [input.category], habitats: [input.habitat], ecologicalRoles: [input.role],
    appearance: { bodyPlan: input.bodyPlan, symmetry: "bilateral", sizeRange: [0.8, 2.4], massRange: [12, 420], locomotion: [input.category === "aerial" ? "flight" : "quadrupedal locomotion"], coloration: input.colors, distinguishingFeatures: ["environmental camouflage", "species-specific silhouette"] },
    anatomy: { limbs: input.category === "aerial" ? 2 : 4, appendages: ["sensory antennae"], sensorySystems: ["vision", "olfaction", "vibration"], feedingStructures: ["specialized dentition"], defensiveStructures: ["protective hide"] },
    physiology: { metabolism: "oxygen-respiring heterotroph", respiration: "pulmonary", temperatureRegulation: "endothermic", lifespanYears: [8, 42], regeneration: "limited tissue repair", adaptations: ["seasonal adaptation", "local pressure tolerance"] },
    compatibility: { gravityRange: [0.65, 1.35], temperatureRangeC: [-20, 42], atmosphereTypes: ["breathable", "oxygen-bearing"], waterRequirement: "required" },
    behavior: { activityCycle: "diurnal", socialStructure: "small groups", intelligence: "instinctive", temperament: "non-aggressive unless threatened", migration: "local seasonal movement", communication: ["vocalization", "scent", "body language"] },
    ecology: { diet: ["flora", "organic matter"], predatorSpeciesIds: [], preySpeciesIds: [], symbioticSpeciesIds: [], ecologicalImpact: "Contributes to a stable terrestrial food web.", populationControls: ["food availability", "predation", "habitat capacity"] },
    reproduction: { strategy: "sexual reproduction", maturityYears: 3, gestationOrIncubationDays: 240, offspringRange: [1, 4], seasonal: true }, lifecycleStages: ["juvenile", "adult", "elder"],
    intelligence: { level: "animal", toolUse: false, languagePotential: false, civilizationPotential: false },
    hazards: { dangerRating: "low", venomous: false, territorial: true, diseaseRisk: "low", environmentalThreats: ["defensive charge"] },
    domestication: { possible: true, difficulty: "moderate", uses: ["companionship", "ecological stewardship"] },
    resourceYields: input.resources.map(([id, yieldType]) => ({ resourceId: id, yieldType, rate: 1, notes: "Starter yield profile; tune through canonical authoring." })),
    discoveryRules: { requiredStates: ["detected", "catalogued"], scanDifficulty: 28, researchTags: ["biology", "ecology"] }, variants: ["juvenile", "seasonal"], artProfileId, animationProfileId: `${input.id}-animation`, audioProfileId: `${input.id}-audio`, confidence: "derived", notes: "Starter canonical species record for Creature Generator authoring; not a player instance."
  };
}

export const canonicalSpecies: SpeciesRecord[] = starterSpecies.map(starterRecord);
export const canonicalSpeciesOccurrences: SpeciesOccurrence[] = canonicalSpecies.map((species, index) => ({ id: `${species.id}-occurrence-earth`, speciesId: species.id, planetId: species.originPlanetId!, biomeId: species.originBiomeId!, habitat: species.habitats[0], abundance: index === 0 ? "common" : "uncommon", discoveryState: "catalogued", spawnWeight: index === 0 ? 0.35 : 0.18, notes: "Canonical occurrence reference; runtime instances are owned by the Game." }));
export const creatureArtProfiles: CreatureArtProfile[] = canonicalSpecies.map((species) => ({ id: species.artProfileId, speciesId: species.id, sourceMasterPath: `source-masters/life/creatures/species/${species.id}/art`, previewPath: null, cardPath: null, heroPath: null, stateKeys: ["idle", "alert", "feeding", "movement"], derivativeProfile: "creature_card", status: "missing" }));
export const creatureAnimationProfiles: CreatureAnimationProfile[] = canonicalSpecies.map((species) => ({ id: species.animationProfileId, speciesId: species.id, idle: "idle", movement: ["walk", "turn"], combat: ["defend"], reproduction: ["courtship"], status: "planned" }));
export const creatureAudioProfiles: CreatureAudioProfile[] = canonicalSpecies.map((species) => ({ id: species.audioProfileId, speciesId: species.id, calls: ["species-call"], ambience: ["habitat-ambience"], communication: ["alarm", "contact"], status: "planned" }));

function hash(seed: string) { let value = 2166136261; for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619); return value >>> 0; }
function pick<T>(items: readonly T[], seed: string) { return items[hash(seed) % items.length]; }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export function generateSpeciesDraft(seed: string, options: { generationMode?: CreatureGenerationMode; functionalCategory?: CreatureFunctionalCategory; habitat?: CreatureHabitat; ecologicalRole?: CreatureEcologicalRole } = {}): SpeciesRecord {
  const mode = options.generationMode ?? "scientific";
  const category = options.functionalCategory ?? pick(creatureFunctionalCategories, seed);
  const habitat = options.habitat ?? pick(creatureHabitats, `${seed}:habitat`);
  const role = options.ecologicalRole ?? pick(creatureEcologicalRoles, `${seed}:role`);
  const wordA = pick(["Aural", "Cinder", "Lumen", "Pale", "Verdant", "Vesper", "Nexa", "Stone"], `${seed}:a`);
  const wordB = pick(["Stag", "Drifter", "Glider", "Bloom", "Crawler", "Maw", "Skein", "Grazer"], `${seed}:b`);
  const id = `species-${slug(wordA)}-${slug(wordB)}-${hash(seed).toString(16).slice(0, 6)}`;
  const base = starterRecord({ id, name: `${wordA} ${wordB}`, scientific: `${slug(wordA)} ${slug(wordB)}`, category, habitat, role, bodyPlan: mode === "artificial" ? "modular synthetic chassis" : `${category} lifeform`, planet: "", biome: "", colors: ["deep umber", "muted cyan"], resources: [[resourceId("Organic Compounds"), "research"] as const] });
  return { ...base, canonStatus: "draft", originPlanetId: null, originBiomeId: null, confidence: "speculative", notes: `Deterministic preview generated from seed ${seed}. Apply to create a canonical authored record.` };
}

export function buildCreatureRuntimeData() {
  return { speciesCategories: [...creatureFunctionalCategories], speciesTaxonomyFrameworks: ["biological-taxonomy", "functional-type", "planetary-ecology-role"], species: canonicalSpecies, speciesOccurrences: canonicalSpeciesOccurrences, speciesResourceYields: canonicalSpecies.flatMap((species) => species.resourceYields.map((yieldRecord) => ({ speciesId: species.id, ...yieldRecord }))), creatureArtProfiles, creatureAnimationProfiles, creatureAudioProfiles, creatureGeneratorContract, creaturePromptOutputTypes: [...creaturePromptOutputTypes], creaturePromptLifecycleStages: [...creaturePromptLifecycleStages], creaturePromptBatchActions: [...creaturePromptBatchActions], creaturePromptModelProfiles: creaturePromptModelProfiles.map((profile) => ({ ...profile, order: [...profile.order] })), creaturePromptTypeTemplates: { biological: [...creaturePromptTypeTemplates.biological], habitat: [...creaturePromptTypeTemplates.habitat], exotic: [...creaturePromptTypeTemplates.exotic], intelligence: [...creaturePromptTypeTemplates.intelligence], lifecycle: [...creaturePromptTypeTemplates.lifecycle] } };
}

export function validateCreatureSystem(input: { species: SpeciesRecord[]; occurrences: SpeciesOccurrence[]; resourceYields?: Array<{ resourceId: string; speciesId: string }>; artProfiles: CreatureArtProfile[]; animationProfiles: CreatureAnimationProfile[]; audioProfiles: CreatureAudioProfile[]; contract: CreatureGeneratorContract; resourceIds?: Iterable<string> }): CreatureSystemValidation {
  const issues: CreatureValidationIssue[] = [];
  const speciesIds = new Set(input.species.map((species) => species.id));
  const resourceIds = input.resourceIds ? new Set(input.resourceIds) : null;
  const duplicate = (values: string[]) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
  const duplicates = duplicate(input.species.map((species) => species.id));
  if (duplicates.length) issues.push({ severity: "error", code: "duplicate_species_id", message: "Species IDs must be unique.", records: duplicates });
  for (const species of input.species) {
    if (!species.displayName || !species.seed || !species.taxonomy.class) issues.push({ severity: "error", code: "species_identity_missing", message: "Species records require a name, seed, and taxonomy.", records: [species.id] });
    if (!species.functionalCategories.every((value) => creatureFunctionalCategories.includes(value))) issues.push({ severity: "error", code: "functional_category_invalid", message: "Species functional categories must use the canonical catalog.", records: [species.id] });
    for (const yieldRecord of species.resourceYields) if (resourceIds && !resourceIds.has(yieldRecord.resourceId)) issues.push({ severity: "error", code: "species_resource_missing", message: "Species resource yields must resolve through ResourceService.", records: [species.id, yieldRecord.resourceId] });
    for (const id of [species.artProfileId, species.animationProfileId, species.audioProfileId]) if (!id) issues.push({ severity: "error", code: "species_profile_missing", message: "Species must reference art, animation, and audio profiles.", records: [species.id] });
  }
  for (const occurrence of input.occurrences) if (!speciesIds.has(occurrence.speciesId)) issues.push({ severity: "error", code: "occurrence_species_missing", message: "Species occurrences must resolve to species records.", records: [occurrence.id, occurrence.speciesId] });
  if (input.contract.ownership.playerStateLivesIn !== "Supabase") issues.push({ severity: "error", code: "player_state_ownership_invalid", message: "Player creature state must remain outside Studio runtime data.", records: ["creatureGeneratorContract"] });
  const profileIds = new Set(input.artProfiles.map((profile) => profile.speciesId));
  for (const species of input.species) if (!profileIds.has(species.id)) issues.push({ severity: "error", code: "art_profile_species_missing", message: "Every species requires an art profile record.", records: [species.id] });
  const status = issues.some((issue) => issue.severity === "error") ? "Blocked" : issues.length ? "Ready With Warnings" : "Ready";
  return { status, issues };
}

export const creaturePromptOutputTypes = [
  "full-body-creature", "creature-portrait", "side-view", "front-view", "rear-view", "three-quarter-view", "turnaround-sheet", "anatomy-diagram", "skeleton-diagram", "scale-comparison", "silhouette", "creature-icon", "creature-card", "encyclopedia-image", "discovery-scan", "habitat-scene", "nest", "egg", "tracks", "fossil", "juvenile", "adult", "elder", "male-variant", "female-variant", "sexless-variant", "seasonal-variant", "regional-variant", "biome-variant", "rare-variant", "domesticated-variant", "engineered-variant", "synthetic-variant", "animation-reference-sheet"
] as const;

export const creaturePromptLifecycleStages = ["juvenile", "adult", "elder"] as const;
export const creaturePromptBatchActions = [
  "all-visual-prompts", "portrait-prompts", "full-body-prompts", "turnaround-prompts", "lifecycle-prompts", "variant-prompts", "habitat-prompts", "discovery-prompts", "icon-prompts", "selected-species", "planet-fauna", "biome-fauna", "export-prompt-pack"
] as const;

export type CreaturePromptBatchAction = typeof creaturePromptBatchActions[number];

export type CreaturePromptOutputType = typeof creaturePromptOutputTypes[number];
export type CreaturePromptMode = "compact" | "detailed";
export type CreaturePromptModel = "nano-banana-2" | "openai-image" | "midjourney-style" | "stable-diffusion-style" | "generic-image-model";

export type CreaturePromptModelProfile = {
  id: CreaturePromptModel;
  displayName: string;
  wordingStyle: string;
  promptLength: "compact" | "detailed";
  negativePromptFormat: "separate" | "weighted" | "natural-language";
  cameraPhrase: string;
  aspectRatioPhrase: string;
  transparencyPhrase: string;
  noTextPhrase: string;
  anatomyConsistencyPhrase: string;
  styleStrengthPhrase: string;
  order: string[];
};

export type CreaturePromptRecord = {
  speciesId: string;
  speciesName: string;
  outputType: CreaturePromptOutputType;
  modelProfileId: CreaturePromptModel;
  presetId: string;
  mode: CreaturePromptMode;
  seed: string;
  canonicalData: Record<string, unknown>;
  visualSummary: string;
  visualPrompt: string;
  positivePrompt: string;
  negativePrompt: string;
  combinedPrompt: string;
  aspectRatio: string;
  transparentBackground: boolean;
  sourceFields: string[];
  lockedFields: string[];
  sourceHash: string;
  sourceRecordVersion: string;
  generatorVersion: string;
  promptVersion: "3.0.0";
  staleStatus: "current";
  tokenEstimate: number;
};

export type CreaturePromptValidation = {
  status: "Ready" | "Ready With Warnings" | "Blocked";
  issues: CreatureValidationIssue[];
};

const biologicalPromptRules: Record<string, string> = {
  mammalian: "believable musculature, weight-bearing anatomy, coherent fur or skin direction, functional joints, realistic center of mass",
  avian: "plausible wing loading, layered feathers, functional beak and feet, flight or ground adaptations consistent with mass",
  aquatic: "hydrodynamic body, plausible fins or propulsion, pressure and depth adaptations, no terrestrial limbs unless amphibious",
  "high-gravity": "low center of mass, reinforced limbs, compact body, dense skeletal support",
  "low-gravity": "elongated limbs or buoyant anatomy, reduced structural mass, controlled low-gravity movement adaptations",
  "crystal-life": "coherent mineral growth, repeated lattice logic, no random gemstone pile, clear locomotion or sessile logic",
  "gas-life": "atmospheric buoyancy, membrane or field containment, no unsupported solid skeleton",
  "plasma-life": "coherent energy boundary, readable silhouette, environmental interaction, no generic fire monster",
  biomechanical: "integrated organic and mechanical anatomy, believable interface between systems, no pasted-on armor",
  synthetic: "intentionally manufactured morphology, clear locomotion, functional sensor placement, no generic humanoid robot default"
};

const earthLikePromptRules: Record<string, string> = {
  mammalian: biologicalPromptRules.mammalian,
  avian: biologicalPromptRules.avian,
  reptilian: "coherent scales, thermoregulation, functional claws or grasping structures, believable reptilian locomotion",
  amphibian: "moisture-compatible skin, metamorphic life history, functional limbs, plausible land and water transition",
  fishlike: "hydrodynamic body, fin-driven propulsion, gill or equivalent respiration, pressure-compatible anatomy",
  arthropod: "segmented exoskeleton, jointed appendages, load-bearing articulation, coherent molting logic",
  insectoid: "segmented body, functional antennae, articulated limbs, believable small-scale musculature",
  arachnid: "eight-leg or canonically specified limb plan, articulated exoskeleton, sensory hairs, grounded center of mass",
  crustacean: "segmented shell, jointed walking or swimming limbs, pressure and salinity adaptation",
  molluscoid: "soft-body support, muscular hydrostat logic, functional mantle or shell structures",
  cephalopod: "distributed sensory systems, flexible tentacle control, hydrostatic body mechanics",
  wormlike: "segmented or coherent elongated body, peristaltic movement, functional sensory gradient",
  jellyform: "transparent or translucent hydrostatic body, radial propulsion, delicate but readable silhouette",
  "echinoderm-like": "radial symmetry, tube-foot logic, water-vascular movement, coherent surface structure",
  dinosaurian: "reptilian skeletal logic, species-appropriate center of mass, functional gait, restrained integument",
  megafauna: "large-scale weight-bearing anatomy, load-distributed joints, environmental scale cues",
  microfauna: "small-scale anatomy, surface-tension or microhabitat logic, readable enlarged field-guide presentation",
  microorganism: "microscopic structure, membrane or colony logic, no unsupported macroscopic anatomy",
  "colonial-organism": "multiple coordinated units with shared ecological function, no single generic humanoid body"
};

const habitatPromptRules: Record<string, string> = {
  terrestrial: "grounded weight-bearing contact and surface locomotion",
  aquatic: "water movement, pressure adaptation, and buoyancy",
  amphibious: "coherent transition between water and land movement",
  aerial: "mass-appropriate lift, aerodynamic surfaces, and stable flight posture",
  gliding: "controlled gliding surfaces without unsupported powered flight",
  arboreal: "grasping structures and balance adapted to branches",
  burrowing: "reinforced digging structures and compact tunnel movement",
  subterranean: "low-light sensory systems and confined-space navigation",
  "cave-dwelling": "cave-scale locomotion, low-light sensing, and mineral surfaces",
  atmospheric: "buoyancy and lift through the stated atmosphere",
  floating: "suspension or buoyant anatomy with readable silhouette",
  "deep-ocean": "high-pressure adaptation, darkness, and depth-appropriate propulsion",
  coastal: "intertidal movement and changing salinity",
  riverine: "current-aware swimming and riverbank movement",
  polar: "cold-weather insulation and low-light seasonal adaptation",
  desert: "heat management, water conservation, and open terrain movement",
  volcanic: "heat resistance and ash or gas tolerance",
  cryogenic: "cryogenic stability and low-temperature materials",
  "high-gravity": biologicalPromptRules["high-gravity"],
  "low-gravity": biologicalPromptRules["low-gravity"],
  "vacuum-adapted": "vacuum-safe materials and no unsupported atmospheric respiration",
  orbital: "microgravity movement, anchoring behavior, and orbital lighting"
};

const exoticPromptRules: Record<string, string> = {
  "silicon-based": "silicon chemistry, mineral-compatible anatomy, and no mammalian defaults",
  "crystal-life": biologicalPromptRules["crystal-life"],
  "mineral-life": "coherent mineral physiology and functional growth structures",
  "plasma-life": biologicalPromptRules["plasma-life"],
  "gas-life": biologicalPromptRules["gas-life"],
  "energy-life": "readable energy morphology with controlled boundaries, not generic fire",
  "electromagnetic-life": "electromagnetic field organization and environmental interaction",
  "photonic-life": "light-structured form with coherent silhouette and controlled luminosity",
  "quantum-life": "subtle probability-linked form while retaining an inspectable silhouette",
  "radiotrophic-life": "radiation-adapted structures with restrained glow",
  "cryogenic-life": "stable cryogenic surfaces and low-temperature physiology",
  "sulfur-based": "sulfur chemistry and plausible corrosive-environment adaptations",
  "methane-based": "methane-compatible biochemistry and low-temperature behavior",
  "ammonia-based": "ammonia-compatible biochemistry and cold atmospheric adaptation",
  "hive-organism": "distributed colony logic and coordinated bodies rather than a single humanoid",
  "distributed-organism": "networked biological logic with clear functional nodes",
  "symbiotic-colony": "mutually dependent organisms with visible functional roles",
  "mycelial-organism": "branching mycelial growth, spore logic, and colony intelligence",
  "biomechanical-life": biologicalPromptRules.biomechanical,
  "synthetic-life": biologicalPromptRules.synthetic,
  "robotic-organism": "manufactured morphology with functional sensors and no default humanoid robot",
  "nanite-colony": "coherent swarm silhouette and readable aggregate behavior",
  "engineered-organism": "intentional designed anatomy with functional adaptations",
  "artificial-life-organism": "artificial biology with coherent anatomy and non-human defaults",
  "ai-organism": "machine intelligence expressed through an original non-humanoid body plan"
};

export const creaturePromptTypeTemplates = {
  biological: [...new Set([...creatureFunctionalCategories, ...Object.keys(earthLikePromptRules), ...Object.keys(biologicalPromptRules)])],
  habitat: [...new Set([...creatureHabitats, ...Object.keys(habitatPromptRules)])],
  exotic: Object.keys(exoticPromptRules),
  intelligence: ["non-sapient", "pre-sapient", "sapient", "hive-intelligence", "collective-intelligence", "machine-intelligence"],
  lifecycle: [...creaturePromptLifecycleStages]
} as const;

export const creaturePromptModelProfiles: CreaturePromptModelProfile[] = [
  { id: "nano-banana-2", displayName: "Nano Banana 2", wordingStyle: "clear visual instruction", promptLength: "detailed", negativePromptFormat: "separate", cameraPhrase: "cinematic three-quarter field-guide camera", aspectRatioPhrase: "16:9", transparencyPhrase: "opaque neutral background", noTextPhrase: "no text or lettering", anatomyConsistencyPhrase: "preserve all stated anatomy exactly", styleStrengthPhrase: "premium realistic concept production", order: ["output", "identity", "type", "body", "anatomy", "scale", "surface", "color", "adaptations", "movement", "ecology", "planet", "camera", "lighting", "background", "style", "technical"] },
  { id: "openai-image", displayName: "OpenAI Image Generation", wordingStyle: "natural-language production brief", promptLength: "detailed", negativePromptFormat: "natural-language", cameraPhrase: "clear editorial camera framing", aspectRatioPhrase: "wide 16:9 composition", transparencyPhrase: "transparent background when requested", noTextPhrase: "do not include text, labels, or UI", anatomyConsistencyPhrase: "maintain anatomy and locked traits", styleStrengthPhrase: "scientifically plausible premium realism", order: ["output", "identity", "type", "body", "anatomy", "scale", "surface", "color", "adaptations", "movement", "ecology", "planet", "camera", "lighting", "background", "style", "technical"] },
  { id: "midjourney-style", displayName: "Midjourney-style", wordingStyle: "compressed cinematic descriptors", promptLength: "compact", negativePromptFormat: "weighted", cameraPhrase: "cinematic field-guide framing", aspectRatioPhrase: "--ar 16:9", transparencyPhrase: "dark neutral backdrop", noTextPhrase: "--no text watermark UI", anatomyConsistencyPhrase: "anatomy locked, species-consistent", styleStrengthPhrase: "premium cinematic realism", order: ["output", "identity", "type", "body", "anatomy", "scale", "surface", "color", "adaptations", "movement", "ecology", "planet", "camera", "lighting", "background", "style", "technical"] },
  { id: "stable-diffusion-style", displayName: "Stable Diffusion-style", wordingStyle: "weighted descriptive tags", promptLength: "detailed", negativePromptFormat: "separate", cameraPhrase: "three-quarter orthographic field-guide view", aspectRatioPhrase: "wide aspect ratio 16:9", transparencyPhrase: "transparent background if requested", noTextPhrase: "no text, no watermark, no interface", anatomyConsistencyPhrase: "anatomy consistency, correct limb count", styleStrengthPhrase: "high detail scientific realism", order: ["output", "identity", "type", "body", "anatomy", "scale", "surface", "color", "adaptations", "movement", "ecology", "planet", "camera", "lighting", "background", "style", "technical"] },
  { id: "generic-image-model", displayName: "Generic Image Model", wordingStyle: "portable plain-language prompt", promptLength: "detailed", negativePromptFormat: "separate", cameraPhrase: "readable camera composition", aspectRatioPhrase: "16:9", transparencyPhrase: "use a transparent background when specified", noTextPhrase: "no text, labels, logos, or interface", anatomyConsistencyPhrase: "do not alter locked anatomy", styleStrengthPhrase: "premium scientifically plausible realism", order: ["output", "identity", "type", "body", "anatomy", "scale", "surface", "color", "adaptations", "movement", "ecology", "planet", "camera", "lighting", "background", "style", "technical"] }
];

const promptProfileById = new Map(creaturePromptModelProfiles.map((profile) => [profile.id, profile]));

const outputTypePromptRules: Partial<Record<CreaturePromptOutputType, string>> = {
  "full-body-creature": "show the complete body and all feet inside the frame",
  "creature-portrait": "prioritize head, face, sensory structures, and expression without changing anatomy",
  "side-view": "use a clean orthographic side profile",
  "front-view": "use a centered front-facing anatomical reference view",
  "rear-view": "use a centered rear anatomical reference view",
  "three-quarter-view": "use a readable three-quarter field-guide pose",
  "turnaround-sheet": "show consistent front, side, rear, and three-quarter views on one production sheet",
  "anatomy-diagram": "show labeled-free anatomical callouts and clear external structures",
  "skeleton-diagram": "show the species-consistent skeleton and preserve the canonical limb count",
  "scale-comparison": "show the creature beside a neutral human scale reference and habitat scale marker",
  silhouette: "show a high-contrast readable silhouette with species-defining proportions",
  "creature-icon": "create a compact transparent-background icon with a clear species silhouette and no text",
  "creature-card": "create a readable card illustration with safe margins and a clean subject separation",
  "encyclopedia-image": "create a restrained scientific encyclopedia plate with the subject clearly isolated",
  "discovery-scan": "create an evidence-oriented discovery scan with neutral documentation framing",
  "habitat-scene": "show the creature in its canonical habitat while keeping the body readable",
  nest: "show a biologically plausible nest or shelter consistent with the reproduction profile",
  egg: "show a biologically plausible egg or reproductive structure consistent with the species",
  tracks: "show identifiable tracks with scale and substrate appropriate to the species",
  fossil: "show a fossilized trace or preserved specimen without inventing incompatible anatomy",
  juvenile: "show the juvenile lifecycle stage while preserving the canonical body plan",
  adult: "show the mature adult lifecycle stage while preserving the canonical body plan",
  elder: "show the elder lifecycle stage with age-appropriate wear but no anatomy changes",
  "male-variant": "show a sex-specific variant only where the canonical record supports it",
  "female-variant": "show a sex-specific variant only where the canonical record supports it",
  "sexless-variant": "show a sexless presentation without inventing sex-specific anatomy",
  "seasonal-variant": "show seasonal changes limited to coloration, coat, behavior, or other canonical traits",
  "regional-variant": "show a regional variant that remains compatible with the source planet and biome",
  "biome-variant": "show a biome variant that remains compatible with the source habitat and ecology",
  "rare-variant": "show a rare variant with restrained, canonically plausible distinction",
  "domesticated-variant": "show domestication cues without changing the species anatomy or ecology",
  "engineered-variant": "show intentional engineering while preserving the locked species identity",
  "synthetic-variant": "show synthetic construction consistent with the canonical species profile",
  "animation-reference-sheet": "show a clean animation reference sheet with consistent key poses and proportions"
};

function promptSourceHash(species: SpeciesRecord) {
  return JSON.stringify({
    id: species.id,
    displayName: species.displayName,
    scientificName: species.scientificName,
    seed: species.seed,
    generationVersion: species.generationVersion,
    functionalCategories: species.functionalCategories,
    habitats: species.habitats,
    ecologicalRoles: species.ecologicalRoles,
    bodyPlan: species.appearance.bodyPlan,
    symmetry: species.appearance.symmetry,
    sizeRange: species.appearance.sizeRange,
    massRange: species.appearance.massRange,
    locomotion: species.appearance.locomotion,
    coloration: species.appearance.coloration,
    distinguishingFeatures: species.appearance.distinguishingFeatures,
    anatomy: species.anatomy,
    physiology: species.physiology,
    compatibility: species.compatibility,
    behavior: species.behavior,
    ecology: species.ecology,
    intelligence: species.intelligence,
    lifecycleStages: species.lifecycleStages,
    originPlanetId: species.originPlanetId,
    originBiomeId: species.originBiomeId
  });
}

function promptHash(species: SpeciesRecord, outputType: CreaturePromptOutputType, model: CreaturePromptModel, mode: CreaturePromptMode) {
  return `${outputType}:${model}:${mode}:${promptSourceHash(species)}`;
}

function promptOutputLabel(outputType: CreaturePromptOutputType) { return outputType.replaceAll("-", " "); }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }

function creatureVisualSummary(species: SpeciesRecord) {
  const categories = species.functionalCategories.map((category) => category.replaceAll("-", " ")).join(", ");
  const colors = species.appearance.coloration.join(", ");
  const features = species.appearance.distinguishingFeatures.slice(0, 3).join(", ");
  const locomotion = species.appearance.locomotion.slice(0, 2).join(" and ");
  const habitat = species.habitats.map((value) => value.replaceAll("-", " ")).join(" and ");
  return `${capitalize(categories)} creature with a ${species.appearance.symmetry} ${species.appearance.bodyPlan}, ${species.anatomy.limbs} limbs, ${species.anatomy.appendages.slice(0, 3).join(", ")}, ${colors} coloration, and ${features}. It is adapted for ${habitat} conditions and moves by ${locomotion || "a controlled natural gait"}.`;
}

function cleanCreaturePrompt(value: string) {
  return value
    .replace(/\bcanonical\b/gi, "")
    .replace(/\blocked\b/gi, "defined")
    .replace(/\bproduction\b/gi, "visual")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function compileCreaturePrompt(species: SpeciesRecord, options: { outputType?: CreaturePromptOutputType; modelProfileId?: CreaturePromptModel; mode?: CreaturePromptMode; presetId?: string; transparentBackground?: boolean } = {}): CreaturePromptRecord {
  const outputType = options.outputType ?? "full-body-creature";
  const profile = promptProfileById.get(options.modelProfileId ?? "generic-image-model") ?? creaturePromptModelProfiles[4];
  const mode = options.mode ?? profile.promptLength;
  const habitatRule = species.habitats.map((habitat) => habitatPromptRules[habitat] ?? habitat).join(", ");
  const biologyRule = [...species.functionalCategories, ...species.ecologicalRoles].map((value) => biologicalPromptRules[value] ?? earthLikePromptRules[value] ?? exoticPromptRules[value] ?? habitatPromptRules[value] ?? value).join(", ");
  const outputRule = outputTypePromptRules[outputType] ?? "show a complete isolated subject with a readable silhouette";
  const visualSummary = creatureVisualSummary(species);
  const visualPrompt = cleanCreaturePrompt([
    `Create a premium NOVERIS visual of ${visualSummary}`,
    cleanCreaturePrompt(outputRule),
    `Preserve the ${species.appearance.bodyPlan}, ${species.appearance.symmetry} symmetry, ${species.anatomy.limbs} limbs, proportions, ${species.appearance.coloration.join(", ")} coloration, and defining features across the complete visible specimen.`,
    `Use scientifically plausible joints, musculature, support structures, sensory organs, feeding anatomy, and movement suited to ${habitatRule}. ${biologyRule}.`,
    "Use museum-quality scientific realism, soft neutral studio lighting, physically believable materials, a readable silhouette, generous negative space, and a pure black background with clean PSD-friendly separation.",
    `Use a ${profile.cameraPhrase}, 16:9 composition. No text, lettering, labels, watermark, logo, interface, border, frame, cropped anatomy, or visual clutter.`
  ].join(" "));
  const negativePrompt = [
    "humanoid posture", "fantasy armor", "clothing", "weapon", "extra limbs", "duplicated head", "malformed joints", "invented wings", "invented horns", "glowing eyes", "excessive bioluminescence", "oversaturated colors", "busy background", "text", "watermark", "UI border", "cropped feet", "anatomy contradiction", "planet incompatibility", "biome contradiction", "generic fantasy creature"
  ].join(profile.negativePromptFormat === "weighted" ? ", " : ", ");
  const sourceHash = promptHash(species, outputType, profile.id, mode);
  const combinedPrompt = `VISUAL PROMPT:\n${visualPrompt}\n\nNEGATIVE / EXCLUDE:\n${negativePrompt}`;
  return {
    speciesId: species.id,
    speciesName: species.displayName,
    outputType,
    modelProfileId: profile.id,
    presetId: options.presetId ?? "creature-visual-prompt",
    mode,
    seed: species.seed,
    canonicalData: {
      id: species.id,
      displayName: species.displayName,
      scientificName: species.scientificName,
      functionalCategories: species.functionalCategories,
      habitats: species.habitats,
      ecologicalRoles: species.ecologicalRoles,
      appearance: species.appearance,
      anatomy: species.anatomy,
      compatibility: species.compatibility,
      lifecycleStages: species.lifecycleStages
    },
    visualSummary,
    visualPrompt,
    positivePrompt: visualPrompt,
    negativePrompt,
    combinedPrompt,
    aspectRatio: "16:9",
    transparentBackground: Boolean(options.transparentBackground),
    sourceFields: ["displayName", "scientificName", "functionalCategories", "taxonomy", "appearance", "anatomy", "physiology", "compatibility", "behavior", "ecology", "intelligence", "lifecycleStages", "habitats", "originPlanetId", "originBiomeId"],
    lockedFields: ["seed", "anatomy.limbs", "appearance.bodyPlan", "functionalCategories", "habitats", "compatibility", "appearance.coloration", "lifecycleStages"],
    sourceHash,
    sourceRecordVersion: species.generationVersion,
    generatorVersion: creatureGeneratorContract.generationVersion,
    promptVersion: "3.0.0",
    staleStatus: "current",
    tokenEstimate: Math.ceil(`${visualPrompt} ${negativePrompt}`.split(/\s+/).length * 1.25)
  };
}

export function isCreaturePromptStale(species: SpeciesRecord, prompt: CreaturePromptRecord) {
  return prompt.sourceHash !== promptHash(species, prompt.outputType, prompt.modelProfileId, prompt.mode);
}

export function validateCreaturePrompt(prompt: CreaturePromptRecord, species: SpeciesRecord): CreaturePromptValidation {
  const issues: CreatureValidationIssue[] = [];
  const positive = prompt.visualPrompt.toLowerCase();
  const negative = prompt.negativePrompt.toLowerCase();
  if (!species.displayName || !species.scientificName) issues.push({ severity: "error", code: "prompt_species_identity_missing", message: "Prompt source species identity is incomplete.", records: [species.id] });
  if (!species.appearance.bodyPlan) issues.push({ severity: "error", code: "prompt_body_plan_missing", message: "Prompt source body plan is missing.", records: [species.id] });
  if (!creaturePromptOutputTypes.includes(prompt.outputType)) issues.push({ severity: "error", code: "prompt_output_type_unsupported", message: "Prompt output type is not in the canonical output catalog.", records: [prompt.outputType] });
  if (!promptProfileById.has(prompt.modelProfileId)) issues.push({ severity: "error", code: "prompt_model_profile_missing", message: "Prompt model profile is not in the canonical profile catalog.", records: [prompt.modelProfileId] });
  if (!positive.includes(String(species.anatomy.limbs))) issues.push({ severity: "error", code: "prompt_anatomy_missing", message: "Prompt does not preserve the canonical limb count.", records: [species.id] });
  if (!positive.includes(species.appearance.bodyPlan.toLowerCase())) issues.push({ severity: "error", code: "prompt_body_plan_contradiction", message: "Prompt does not preserve the canonical body plan.", records: [species.id] });
  if (!negative.includes("extra limbs") || !negative.includes("invented wings") || !negative.includes("invented horns") || !negative.includes("humanoid posture")) issues.push({ severity: "error", code: "prompt_anatomy_controls_missing", message: "Negative prompt must include extra-limb, wing, horn, and humanoid-posture controls.", records: [species.id] });
  if (!positive.match(/16:9|aspect|ratio/)) issues.push({ severity: "error", code: "prompt_scale_or_aspect_missing", message: "Prompt must include output aspect guidance.", records: [species.id] });
  if (!positive.match(/text|lettering|labels/i) && !negative.match(/text/i)) issues.push({ severity: "error", code: "prompt_no_text_missing", message: "Prompt must include no-text guidance.", records: [species.id] });
  if (prompt.outputType === "creature-icon" && !positive.match(/icon|silhouette|symbol/)) issues.push({ severity: "error", code: "prompt_icon_requirement_missing", message: "Creature icon prompts must include a canonical icon or silhouette requirement.", records: [species.id] });
  for (const color of species.appearance.coloration) if (!positive.includes(color.toLowerCase())) issues.push({ severity: "error", code: "prompt_locked_coloration_missing", message: "Prompt must preserve every locked canonical coloration.", records: [species.id, color] });
  if (/\b(canonical|schema|json|runtime export|source-master|studio ingestion|return|provide|write|list)\b/i.test(prompt.visualPrompt)) issues.push({ severity: "error", code: "prompt_non_visual_language", message: "Visual prompt contains non-image authoring language.", records: [species.id] });
  if (/```|\{\s*"|\[\s*\{/i.test(prompt.visualPrompt)) issues.push({ severity: "error", code: "prompt_raw_object", message: "Visual prompt must not contain raw structured data.", records: [species.id] });
  const visualWordCount = prompt.visualPrompt.split(/\s+/).filter(Boolean).length;
  const minWords = prompt.mode === "compact" ? 80 : 120;
  const maxWords = prompt.mode === "compact" ? 160 : 240;
  if (visualWordCount < minWords || visualWordCount > maxWords) issues.push({ severity: "error", code: "prompt_word_count", message: `Visual prompt must contain ${minWords}-${maxWords} words.`, records: [species.id] });
  if (species.functionalCategories.includes("aerial") && !positive.match(/flight|wing|aerial|air/)) issues.push({ severity: "error", code: "prompt_movement_contradiction", message: "Aerial species prompts must include flight-compatible movement guidance.", records: [species.id] });
  if (isCreaturePromptStale(species, prompt)) issues.push({ severity: "warning", code: "prompt_stale", message: "Prompt source fields changed; regenerate this prompt.", records: [species.id] });
  return { status: issues.some((issue) => issue.severity === "error") ? "Blocked" : issues.length ? "Ready With Warnings" : "Ready", issues };
}

const promptBatchOutputTypes: Record<Exclude<CreaturePromptBatchAction, "selected-species" | "planet-fauna" | "biome-fauna" | "export-prompt-pack">, CreaturePromptOutputType[]> = {
  "all-visual-prompts": [...creaturePromptOutputTypes],
  "portrait-prompts": ["creature-portrait"],
  "full-body-prompts": ["full-body-creature"],
  "turnaround-prompts": ["turnaround-sheet"],
  "lifecycle-prompts": ["juvenile", "adult", "elder"],
  "variant-prompts": ["male-variant", "female-variant", "sexless-variant", "seasonal-variant", "regional-variant", "biome-variant", "rare-variant", "domesticated-variant", "engineered-variant", "synthetic-variant"],
  "habitat-prompts": ["habitat-scene", "nest", "egg", "tracks", "fossil"],
  "discovery-prompts": ["encyclopedia-image", "discovery-scan"],
  "icon-prompts": ["creature-icon", "creature-card"]
};

export function generateCreaturePromptBatch(action: CreaturePromptBatchAction, species: SpeciesRecord[], options: { modelProfileId?: CreaturePromptModel; mode?: CreaturePromptMode } = {}) {
  const selected = action === "planet-fauna" ? species.filter((row) => row.originPlanetId) : action === "biome-fauna" ? species.filter((row) => row.originBiomeId) : species;
  const outputTypes = action === "selected-species" || action === "export-prompt-pack" || action === "planet-fauna" || action === "biome-fauna" ? [...creaturePromptOutputTypes] : promptBatchOutputTypes[action as keyof typeof promptBatchOutputTypes];
  return selected.flatMap((row) => outputTypes.map((outputType) => compileCreaturePrompt(row, { ...options, outputType })));
}

export function buildCreaturePromptBatchExport(action: CreaturePromptBatchAction, species: SpeciesRecord[], options: { modelProfileId?: CreaturePromptModel; mode?: CreaturePromptMode } = {}) {
  const records = generateCreaturePromptBatch(action, species, options);
  const markdown = [`# NOVERIS Creature Visual Prompt Batch`, ``].concat(records.flatMap((record) => [`## ${record.speciesName} · ${promptOutputLabel(record.outputType)}`, ``, record.combinedPrompt, ``])).join("\n");
  return { action, records, json: JSON.stringify({ action, generatorVersion: creatureGeneratorContract.generationVersion, records }, null, 2), markdown, text: records.map((record) => `${record.speciesName} · ${promptOutputLabel(record.outputType).toUpperCase()}\n${record.combinedPrompt}`).join("\n\n") };
}

export function buildCreaturePromptPack(species: SpeciesRecord, options: { modelProfileId?: CreaturePromptModel; mode?: CreaturePromptMode } = {}) {
  const records = creaturePromptOutputTypes.map((outputType) => compileCreaturePrompt(species, { ...options, outputType }));
  const markdown = [`# ${species.displayName} Visual Prompt Pack`, ``].concat(records.flatMap((record) => [`## ${promptOutputLabel(record.outputType)}`, ``, record.combinedPrompt, ``])).join("\n");
  return { speciesId: species.id, records, json: JSON.stringify({ speciesId: species.id, speciesName: species.displayName, generatorVersion: creatureGeneratorContract.generationVersion, seed: species.seed, records }, null, 2), markdown, text: records.map((record) => `${promptOutputLabel(record.outputType).toUpperCase()}\n${record.combinedPrompt}`).join("\n\n") };
}
