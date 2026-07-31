export const NANO_BANANA_2_COMPILER_VERSION = "1.0.0";
export const NANO_BANANA_2_LIBRARY_VERSION = "1.0.0";

export type VisualDomain = "creature" | "plant";
export type ValidationSeverity = "Structural Error" | "Canon Conflict" | "Scientific Plausibility Warning" | "Visual Consistency Warning" | "Missing Optional Data" | "Production Warning" | "Runtime Export Error";

export type CanonicalVisualRecord = {
  id: string;
  displayName: string;
  scientificName?: string;
  domain: VisualDomain;
  sourceVersion: string;
  seed: string;
  taxonomy: string;
  archetypeId: string;
  variables: Record<string, string | number | boolean | null | undefined>;
  lockedFields: string[];
  lockedValues: Record<string, unknown>;
};

export type VisualGrammar = {
  id: string;
  domain: VisualDomain | "shared";
  name: string;
  instructions: string;
  tags?: string[];
  exclusions?: string[];
  version: string;
  status: "approved";
};

export type VisualArchetype = VisualGrammar & {
  family: string;
  definition: string;
  structuralRules: string;
  movementOrGrowthRules: string;
  environmentalRules: string;
  ecologyRules: string;
  materialRules: string;
  silhouetteRules: string;
  variationRules: string;
  prohibitedChanges: string[];
  compatibleOutputTypes: string[];
  compatibleVariationProfiles: string[];
};

export type VariationProfile = VisualGrammar & {
  strength: "conservative" | "standard" | "exploratory" | "extreme-within-canon";
  requestedVersions: number;
  permittedFields: string[];
  prohibitedFields: string[];
  controls: Record<string, "locked" | "subtle" | "moderate" | "allowed">;
};

export type PromptIssue = { severity: ValidationSeverity; code: string; message: string };

export type PromptCompileOptions = {
  outputTypeId: string;
  variationProfileId?: string;
  versionCount?: 1 | 2 | 3 | 4 | 6 | 8;
  seed?: string;
  cameraProfileId?: string;
  lightingProfileId?: string;
  backgroundProfileId?: string;
  compositionProfileId?: string;
  authorOverrides?: Record<string, string>;
};

export type ResolvedVisualPrompt = {
  resolvedPromptId: string;
  canonicalId: string;
  modelProfileId: "nano-banana-2";
  compilerVersion: string;
  libraryVersion: string;
  promptVersion: string;
  sourceRecordVersion: string;
  sourceHash: string;
  sourceSnapshot: { canonicalRecordHash: string; grammarHash: string };
  promptHash: string;
  seed: string;
  archetypeId: string;
  outputTypeId: string;
  variationProfileId: string;
  cameraProfileId: string;
  lightingProfileId: string;
  backgroundProfileId: string;
  compositionProfileId: string;
  versionCount: number;
  positivePrompt: string;
  negativePrompt: string;
  combinedPrompt: string;
  compactPrompt: string;
  detailedPrompt: string;
  resolvedVariables: Record<string, string>;
  unresolvedVariables: string[];
  lockedFields: string[];
  validation: PromptIssue[];
  staleStatus: "current" | "stale";
  productionStatus: "draft" | "approved" | "rejected";
};

export type PromptStaleness = {
  stale: boolean;
  previousHash: string;
  currentHash: string;
  reason: "current" | "canonical_record_changed" | "compiler_or_grammar_changed";
  changedSourceFields: string[];
};

const list = (value: string) => value.split("|").map((item) => item.trim()).filter(Boolean);
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const hash = (value: string) => {
  let current = 2166136261;
  for (const character of value) current = Math.imul(current ^ character.charCodeAt(0), 16777619);
  return (current >>> 0).toString(16).padStart(8, "0");
};
const grammar = (id: string, domain: VisualGrammar["domain"], name: string, instructions: string, tags: string[] = [], exclusions: string[] = []): VisualGrammar => ({ id, domain, name, instructions, tags, exclusions, version: NANO_BANANA_2_LIBRARY_VERSION, status: "approved" });

export const nanoBanana2ModelProfile = {
  id: "nano-banana-2" as const,
  name: "Nano Banana 2",
  preferredPromptOrder: ["task", "versionCount", "identity", "archetype", "structure", "movement", "environment", "ecology", "materials", "lockedTraits", "variation", "output", "camera", "lighting", "background", "composition", "psd", "consistency", "negative"],
  promptVerbosity: "detailed with a compact copy variant",
  naturalLanguageStyle: "clear production-direction prose with explicit exclusions",
  phrases: {
    camera: "Camera:", lighting: "Lighting:", aspectRatio: "16:9", blackBackground: "pure black background for PSD extraction", transparentBackground: "transparent-compatible black background, preserve clean edge separation", referenceBoard: "ordered reference board with clean separation and no labels", orthographic: "true orthographic view with no perspective distortion", consistency: "preserve all locked canonical traits exactly", noText: "no text, watermark, logo, interface, border, or frame", variation: "vary only the permitted secondary traits", iteration: "produce each requested interpretation separately at consistent scale", editExisting: "future edit mode: preserve the supplied image composition while applying only approved deltas"
  },
  version: NANO_BANANA_2_LIBRARY_VERSION
};

const creatureFamilies: Array<[string, string, string]> = [
  ["volume-ia-mammalian", "Mammalian Creatures", "Apex Predator|Pack Predator|Ambush Predator|Grazer|Browser|Omnivore|Burrowing Mammal|Arboreal Mammal|Desert Mammal|Polar Mammal|Semi-Aquatic Mammal|Fully Aquatic Mammal|Flying Mammal|High-Gravity Mammal|Low-Gravity Mammal|Domesticated Mammal|Colossal Mammal|Micro Mammal|Mountain Mammal|Forest Mammal|Jungle Mammal|Grassland Mammal|Wetland Mammal|Cave Mammal|Nocturnal Mammal|Migratory Mammal|Working Mammal|Companion Mammal|Pack Animal|Ancient Mammal|Extinct Mammal|Mutated Mammal|Engineered Mammal|Biomechanical Mammal|Synthetic Mammal"],
  ["volume-ib-avian", "Avian and Flying Creatures", "Apex Raptor|Pack Hunter|Ambush Flyer|Forest Glider|Soaring Hunter|Thermal Soarer|High-Altitude Flyer|Hovering Nectar Feeder|Scavenger|Carrion Specialist|Marsh Wader|River Hunter|Coastal Flyer|Ocean Skimmer|Deep-Ocean Surface Hunter|Cliff-Nesting Flyer|Canopy Flyer|Cave Flyer|Desert Flyer|Polar Flyer|Mountain Flyer|Low-Gravity Flyer|High-Gravity Flyer|Bioluminescent Flyer|Nocturnal Flyer|Floating Atmospheric Organism|Winged Megafauna|Winged Microfauna|Crystal Flyer|Silicon Flyer|Energy Flyer|Gas Flyer|Plasma Flyer|Biomechanical Flyer|Synthetic Flyer|Engineered Flyer"],
  ["volume-ic-reptilian", "Reptilian and Dinosaurian Creatures", "Terrestrial Reptile|Arboreal Reptile|Burrowing Reptile|Desert Reptile|Polar Reptile|Aquatic Reptile|Semi-Aquatic Reptile|Gliding Reptile|Apex Reptilian Predator|Herd Reptilian Herbivore|Armored Reptile|Venomous Reptile|Constricting Reptile|Dinosaurian Predator|Dinosaurian Herbivore|Dinosaurian Omnivore|Feathered Dinosaurian|Colossal Dinosaurian|Micro Dinosaurian|High-Gravity Reptile|Low-Gravity Reptile|Cave Reptile|Volcanic Reptile|Crystal Reptile|Silicon Reptile|Biomechanical Reptile|Synthetic Reptile"],
  ["volume-id-amphibian", "Amphibian Creatures", "Terrestrial Amphibian|Aquatic Amphibian|Semi-Aquatic Amphibian|Arboreal Amphibian|Burrowing Amphibian|Cave Amphibian|Swamp Amphibian|River Amphibian|Polar Amphibian|Desert Amphibian|Toxic Amphibian|Camouflaged Amphibian|Giant Amphibian|Micro Amphibian|High-Gravity Amphibian|Low-Gravity Amphibian|Bioluminescent Amphibian|Crystal Amphibian|Synthetic Amphibian"],
  ["volume-ie-aquatic", "Fishlike and Aquatic Creatures", "Pelagic Fishlike|Reef Fishlike|Deep-Ocean Fishlike|Abyssal Predator|Filter Feeder|Schooling Fishlike|Solitary Hunter|Bottom Dweller|River Fishlike|Coastal Fishlike|Polar Fishlike|Volcanic-Vent Fishlike|Armored Fishlike|Electric Fishlike|Bioluminescent Fishlike|Giant Aquatic Creature|Micro Aquatic Creature|Low-Gravity Aquatic Creature|High-Pressure Aquatic Creature|Crystal Aquatic Creature|Silicon Aquatic Creature|Synthetic Aquatic Creature"],
  ["volume-if-arthropods", "Arthropods, Insectoids and Arachnids", "Ground Arthropod|Flying Insectoid|Burrowing Arthropod|Arboreal Arthropod|Aquatic Arthropod|Swarming Insectoid|Pollinating Insectoid|Predator Insectoid|Herbivore Insectoid|Parasitoid|Colony Insectoid|Hive Insectoid|Web-Building Arachnid|Ambush Arachnid|Scavenger Arachnid|Desert Arthropod|Polar Arthropod|Cave Arthropod|Giant Arthropod|Micro Arthropod|Crystal Arthropod|Silicon Arthropod|Biomechanical Arthropod|Synthetic Arthropod"],
  ["volume-ig-molluscoids", "Crustaceans, Molluscoids and Cephalopods", "Coastal Crustacean|Deep-Ocean Crustacean|River Crustacean|Burrowing Crustacean|Armored Crustacean|Giant Crustacean|Soft-Bodied Molluscoid|Shelled Molluscoid|Grazing Molluscoid|Predatory Molluscoid|Floating Molluscoid|Intelligent Cephalopod|Ambush Cephalopod|Reef Cephalopod|Deep-Ocean Cephalopod|Colonial Molluscoid|Crystal Molluscoid|Synthetic Cephalopod"],
  ["volume-ih-radial", "Wormlike, Jellyform and Echinoderm-Like Creatures", "Burrowing Wormlike|Aquatic Wormlike|Parasitic Wormlike|Giant Wormlike|Micro Wormlike|Floating Jellyform|Deep-Ocean Jellyform|Atmospheric Jellyform|Predatory Jellyform|Colonial Jellyform|Benthic Echinoderm-Like|Filter-Feeding Echinoderm-Like|Armored Echinoderm-Like|Radial Predator|Crystal Jellyform|Energy Jellyform"],
  ["volume-ii-scale", "Megafauna, Microfauna and Colonial Organisms", "Terrestrial Megafauna|Aquatic Megafauna|Aerial Megafauna|Subterranean Megafauna|Filter-Feeding Megafauna|Ecosystem-Engineer Megafauna|Microfauna Predator|Microfauna Grazer|Microfauna Decomposer|Colonial Superorganism|Modular Colony Creature|Reef-Building Colony|Hive Superorganism|Symbiotic Composite|Distributed Organism"],
  ["volume-iii-exotic", "Exotic Biological Life", "Silicon-Based Creature|Crystal Creature|Mineral Creature|Sulfur-Based Creature|Methane-Based Creature|Ammonia-Based Creature|Cryogenic Creature|Radiotrophic Creature|Geothermal Creature|Vacuum-Adapted Creature|Orbital Organism|Symbiotic Composite|Mycelial Animal Analog"],
  ["volume-iv-energy", "Energy and Field-Based Life", "Plasma Life|Gas Life|Energy Life|Electromagnetic Life|Photonic Life|Quantum Life|Atmospheric Field Organism|Stellar-Corona Organism|Magnetospheric Organism|Radiation-Field Organism"],
  ["volume-v-artificial", "Artificial Life", "Biomechanical Organism|Synthetic Organism|Robotic Organism|Nanite Colony|Engineered Organism|Artificial-Life Organism|AI Organism|Self-Assembling Organism|Modular Machine Species|Adaptive Terraforming Organism"]
];

const plantFamilies: Array<[string, string, string]> = [
  ["volume-pa-trees", "Trees", "Temperate Forest Tree|Rainforest Canopy Tree|Deciduous Tree|Evergreen Conifer|Mangrove|Swamp Tree|Desert Tree|Water-Storage Tree|Polar Tree|Volcanic Tree|Mountain Tree|High-Gravity Tree|Low-Gravity Tree|Cave Tree|Giant Tree|Ancient Tree|Extinct Tree|Crystal Tree|Silicon Tree|Mineral Tree|Energy Tree|Gas Tree|Plasma Tree|Biomechanical Tree|Synthetic Tree|Robotic Tree|Nanite Tree|Terraforming Tree"],
  ["volume-pb-ground-cover", "Shrubs, Bushes and Ground Cover", "Temperate Shrub|Desert Shrub|Polar Shrub|Swamp Shrub|Thorn Bush|Flowering Bush|Fruit Bush|Medicinal Shrub|Poisonous Shrub|Ground Cover|Creeping Ground Cover|Mat-Forming Flora|Soil-Stabilizing Flora|High-Gravity Ground Cover|Low-Gravity Ground Cover|Crystal Shrub|Synthetic Shrub"],
  ["volume-pc-flowers", "Flowers and Pollinators", "Flowering Plant|Pollinator-Specialist Flower|Wind-Pollinated Flower|Water-Pollinated Flower|Self-Pollinating Flower|Nocturnal Flower|Bioluminescent Flower|Desert Flower|Polar Flower|Rainforest Flower|Aquatic Flower|Carnivorous Flower|Parasitic Flower|Giant Flower|Micro Flower|Crystal Flower|Energy Flower|Synthetic Flower"],
  ["volume-pd-ground-flora", "Grasses, Ferns, Mosses and Lichens", "Grass-Analog|Tall Grass|Grazing Grass|Seed Grass|Fire-Adapted Grass|Polar Grass|Aquatic Grass|Fern-Analog|Tree Fern|Cave Fern|Moss-Analog|Cushion Moss|Aquatic Moss|Lichen-Analog|Crustose Lichen|Foliose Lichen|Branching Lichen|Crystal Moss|Synthetic Ground Flora"],
  ["volume-pe-vines", "Vines, Epiphytes and Climbing Flora", "Climbing Vine|Twining Vine|Hooked Vine|Adhesive Vine|Strangler Vine|Epiphyte|Canopy Epiphyte|Water-Catching Epiphyte|Parasitic Vine|Symbiotic Vine|Flowering Vine|Fruit Vine|Low-Gravity Vine|Crystal Vine|Synthetic Vine"],
  ["volume-pf-aquatic", "Aquatic Plants", "Submerged Aquatic Plant|Floating Aquatic Plant|River Plant|Wetland Plant|Coastal Plant|Deep-Water Plant|Seaweed-Analog|Kelp-Analog|Reef Flora|Polar Aquatic Flora|Hydrothermal Flora|Methane-Lake Flora|Ammonia-Ocean Flora|Crystal Aquatic Flora|Synthetic Aquatic Flora"],
  ["volume-pg-extremophytes", "Succulents, Cacti and Extremophytes", "Succulent|Cactus-Analog|Water-Storage Flora|Salt-Tolerant Flora|Heat-Resistant Flora|Cryogenic Flora|Radiation-Resistant Flora|Acid-Tolerant Flora|Alkaline-Tolerant Flora|Volcanic Flora|Cave Extremophyte|Vacuum-Adapted Flora|Orbital Flora"],
  ["volume-ph-symbiotic", "Carnivorous, Parasitic and Symbiotic Plants", "Snap-Trap Plant|Pitfall Plant|Adhesive-Trap Plant|Suction-Trap Plant|Active Carnivorous Plant|Parasitic Plant|Root Parasite|Stem Parasite|Mycoheterotrophic Plant|Symbiotic Plant|Animal-Symbiotic Plant|Mineral-Symbiotic Plant|Synthetic-Symbiotic Flora"],
  ["volume-pii-fungi", "Fungi and Mycelial Life", "Mushroom-Form Fungus|Shelf Fungus|Puff Fungus|Spore Tower Fungus|Mycelial Colony|Parasitic Fungus|Symbiotic Fungus|Aquatic Fungus|Cave Fungus|Polar Fungus|Desert Fungus|Giant Fungus|Micro Fungus|Crystal Fungus|Energy Fungus|Synthetic Fungus"],
  ["volume-piii-exotic", "Exotic Flora", "Crystal Flora|Silicon Flora|Mineral Flora|Plasma Flora|Gas Flora|Energy Flora|Electromagnetic Flora|Photonic Flora|Radiotrophic Flora|Cryogenic Flora|Methane-Based Flora|Ammonia-Based Flora|Sulfur-Based Flora|Geothermal Flora|Vacuum Flora|Orbital Flora"],
  ["volume-piv-artificial", "Artificial and Engineered Flora", "Biomechanical Flora|Synthetic Flora|Robotic Flora|Nanite Flora|Engineered Crop|Terraforming Flora|Atmosphere-Processing Flora|Soil-Restoration Flora|Water-Retention Flora|Radiation-Shielding Flora|Industrial Fiber Plant|Biofuel Plant|Medicinal Crop|Food Crop|Companion Crop"],
  ["volume-pv-ancient", "Giant, Ancient and Extinct Flora", "Giant Flora|Ancient Living Flora|Fossil Flora|Extinct Tree|Extinct Flower|Extinct Aquatic Flora|Planetary Keystone Flora|Forest Superorganism|Colonial Flora|Mobile Seed Organism"]
];

function archetypesFor(domain: VisualDomain, families: Array<[string, string, string]>): VisualArchetype[] {
  return families.flatMap(([familyId, family, names]) => list(names).map((name) => {
    const flying = /fly|raptor|soar|glider|wing|atmospheric/i.test(name);
    const plant = domain === "plant";
    return {
      ...grammar(`${familyId}-${slug(name)}`, domain, name, `${name} canonical visual grammar`, [familyId, slug(name)]),
      family,
      definition: `${name} is a canonical ${plant ? "plant-life" : "creature"} archetype whose visual interpretation remains subordinate to locked record data.`,
      structuralRules: plant ? "Preserve locked growth architecture, root or anchor system, reproductive structures, and collector surfaces." : flying ? "Preserve locked body mass, wing count, wing loading, lift surfaces, skeletal balance, muscle attachments, center of gravity, and landing anatomy." : "Preserve locked body plan, symmetry, limb count, support system, sensory structures, and center of mass.",
      movementOrGrowthRules: plant ? "Show only growth, dormancy, or reproductive behavior consistent with canonical structure and ecology." : flying ? "Show takeoff, flight, gliding, or landing only when mechanically supported by the locked morphology and environment." : "Show locomotion only when compatible with locked anatomy, habitat, and environmental adaptations.",
      environmentalRules: "Resolve planet, biome, gravity, atmosphere, climate, and pressure from canonical variables. Never invent a conflicting environment.",
      ecologyRules: "Preserve locked diet, role, behavior, lifecycle, rarity, sapience, and domestication state.",
      materialRules: plant ? "Resolve biologically or materially appropriate plant tissue from locked material variables." : "Resolve biologically or materially appropriate surfaces from locked material variables.",
      silhouetteRules: "Keep the canonical silhouette class recognizable at a glance and never introduce unrelated anatomy.",
      variationRules: "Permit only secondary variation explicitly authorized by the selected variation profile.",
      prohibitedChanges: ["canonical anatomy", "planet", "biome", "gravity adaptation", "atmospheric adaptation", "locked materials", "locked coloration", "distinctive features", "canonical rarity"],
      compatibleOutputTypes: [],
      compatibleVariationProfiles: []
    };
  }));
}

export const creatureArchetypes = archetypesFor("creature", creatureFamilies);
export const plantArchetypes = archetypesFor("plant", plantFamilies);
export const visualArchetypes = [...creatureArchetypes, ...plantArchetypes];

const creatureOutputs = "Full Body Production Render|Portrait|Head Study|Orthographic Front|Orthographic Side|Orthographic Rear|Orthographic Top|Orthographic Bottom|Turnaround Sheet|Skeleton or Support Structure|Musculature|Internal Anatomy|External Anatomy|Scale Comparison|Lifecycle Sheet|Juvenile|Adult|Elder|Reproductive Form|Sex or Morph Variants|Regional Variants|Seasonal Variants|Behavior Sheet|Locomotion Sheet|Feeding|Resting|Social Behavior|Defensive Behavior|Attack Behavior|Native Habitat Scene|Discovery Scan|Species Plate|Reference Board|Animation Reference Sheet|UI Icon Source|Encyclopedia Artwork|Card Artwork|Loading Artwork|PSD Extraction Board";
const plantOutputs = "Whole Plant Production Render|Botanical Portrait|Orthographic Front|Orthographic Side|Orthographic Rear|Orthographic Top|Root or Anchor System|Stem or Trunk|Branch Architecture|Bark or Surface Tissue|Leaves or Collector Structures|Flower or Reproductive Structure|Fruit or Storage Body|Seed|Spore|Germination|Cross Section|Internal Anatomy|Growth Stages|Seasonal Variants|Stress and Dormancy States|Habitat Composition|Forest Composition|Biome Vegetation Set|Agricultural Field|Harvest-Ready State|Discovery Scan|Botanical Plate|Reference Board|Scale Comparison|Silhouette|UI Icon Source|Encyclopedia Artwork|Card Artwork|Loading Artwork|PSD Extraction Board";
const outputGrammar = (domain: VisualDomain, value: string): VisualGrammar => {
  const id = `${domain}-${slug(value)}`;
  const isolated = /render|portrait|study|orthographic|turnaround|skeleton|musculature|anatomy|comparison|plate|board|icon|extraction|silhouette|seed|spore|cross section|stem|branch|bark|leaves|flower|fruit/i.test(value);
  return grammar(id, domain, value, isolated ? "Use a complete isolated production study with clean subject boundaries, consistent scale, and no labels." : "Use an ecological composition only where it supports the canonical subject and leaves the subject readable.", [isolated ? "isolated" : "environmental"]);
};
export const productionOutputs = [...list(creatureOutputs).map((value) => outputGrammar("creature", value)), ...list(plantOutputs).map((value) => outputGrammar("plant", value))];

export const cameraProfiles = [
  ["three-quarter-studio", "Three-Quarter Studio", "three-quarter studio view with the complete silhouette readable"], ["portrait", "Portrait", "eye-level portrait framing with anatomy readable"], ["orthographic-front", "Orthographic Front", "true front orthographic view with no perspective distortion"], ["orthographic-side", "Orthographic Side", "true side orthographic view with no perspective distortion"], ["orthographic-rear", "Orthographic Rear", "true rear orthographic view with no perspective distortion"], ["orthographic-top", "Orthographic Top", "true top orthographic view with no perspective distortion"], ["orthographic-bottom", "Orthographic Bottom", "true underside orthographic view with no perspective distortion"], ["macro-detail", "Macro Detail", "controlled macro detail with no crop ambiguity"], ["material-closeup", "Material Closeup", "controlled material closeup with physically based surface readability"], ["wing-detail", "Wing Detail", "wing attachment, feather architecture, lift surface, and joint detail"], ["leaf-detail", "Leaf Detail", "leaf, collector surface, and venation detail"], ["root-detail", "Root Detail", "root or anchor system detail"], ["habitat-wide", "Habitat Wide", "restrained wide habitat composition"], ["ecosystem-wide", "Ecosystem Wide", "wide ecosystem composition with the canonical subject retained"], ["reference-board", "Reference Board", "ordered neutral production reference board"], ["species-plate", "Species Plate", "ordered species plate with consistent studies"], ["botanical-plate", "Botanical Plate", "ordered botanical plate with consistent studies"], ["scale-comparison", "Scale Comparison", "neutral comparative scale framing"], ["discovery-scan", "Discovery Scan", "evidence-oriented scientific documentation framing"]
].map(([id, name, instructions]) => grammar(id, "shared", name, instructions));

export const lightingProfiles = ["Neutral Studio|soft neutral studio lighting, natural white balance, and readable material separation", "Museum Specimen|museum-quality specimen lighting without dramatic shadows", "Soft Product Reference|soft product reference illumination with restrained separation", "Anatomical Reference|even anatomical reference illumination with no hidden structures", "Material Study|controlled raking material light without stylized glare", "Native Habitat Day|restrained natural habitat daylight", "Native Habitat Low Light|low-light habitat illumination with no false focal flare", "Underwater Natural|plausible underwater natural light", "Cave Natural|subtle cave light with geological context", "Polar Natural|cool restrained polar daylight", "Desert Natural|restrained desert light with readable form", "Volcanic Natural|heat-aware volcanic light without fantasy glow", "Discovery Scan|restrained scientific scan illumination", "Transparent-Extraction Compatible|even clean extraction lighting with preserved edge separation"].map((value) => { const [name, instructions] = value.split("|"); return grammar(slug(name), "shared", name, instructions); });

export const backgroundProfiles = ["Pure Black|pure black background for isolated PSD source-master extraction", "Dark Charcoal|dark charcoal background with no horizon or visual distraction", "Transparent-Compatible Black|transparent-compatible black background with clean edges", "Neutral Gray|neutral gray studio field for material readability", "Scientific White|scientific white board only when explicitly requested", "Native Habitat|canonical native habitat only", "Underwater Habitat|canonical underwater habitat only", "Atmospheric Habitat|canonical atmospheric habitat only", "Cave Habitat|canonical cave habitat only", "Forest Habitat|canonical forest habitat only", "Desert Habitat|canonical desert habitat only", "Polar Habitat|canonical polar habitat only", "Volcanic Habitat|canonical volcanic habitat only", "Reference Board|neutral reference board field", "Species Plate|neutral species plate field", "Botanical Plate|neutral botanical plate field"].map((value) => { const [name, instructions] = value.split("|"); return grammar(slug(name), "shared", name, instructions); });

export const compositionProfiles = [
  ["isolated-production", "Isolated Production", "center the complete subject with generous extraction margin and no environmental competition"],
  ["hero-three-quarter", "Hero Three-Quarter", "show a clear three-quarter silhouette with balanced negative space and no clipped anatomy"],
  ["habitat-observational", "Habitat Observational", "place the canonical subject naturally within its habitat while retaining immediate silhouette readability"],
  ["scientific-documentation", "Scientific Documentation", "prioritize measurement clarity, visual evidence, and unobstructed morphology"],
  ["comparison-board", "Comparison Board", "arrange the requested studies consistently with clean separation and no labels"],
  ["ecosystem-composition", "Ecosystem Composition", "show ecological context while keeping the requested subject as the unambiguous primary read"]
].map(([id, name, instructions]) => grammar(id, "shared", name, instructions));

export const materialProfiles = ["fur|hair|quills|feathers|scales|skin|membrane|chitin|shell|bone|keratin|soft tissue|gelatinous tissue|mineral tissue|crystal tissue|silicon tissue|metallic synthetic tissue|biomechanical interface|energy structure|plasma boundary|gas membrane", "bark|wood|stem tissue|leaf tissue|waxy surface|succulent tissue|thorn|root tissue|flower petal|fruit skin|seed shell|spore surface|fungal cap|mycelium|mineral tissue|crystal tissue|synthetic plant tissue|biomechanical plant interface|energy collector|gas membrane"].flatMap((values, index) => list(values).map((name) => grammar(`${index === 0 ? "creature" : "plant"}-${slug(name)}`, index === 0 ? "creature" : "plant", name, `physically based ${name} with believable structure, roughness, translucency, and age detail`)));

export const environmentalAdaptationProfiles = list("high gravity|low gravity|extreme heat|extreme cold|high pressure|low pressure|vacuum|high radiation|high humidity|extreme aridity|salt water|fresh water|deep ocean|cave darkness|dense atmosphere|thin atmosphere|methane atmosphere|ammonia environment|sulfur environment|volcanic terrain|polar terrain|desert terrain|forest canopy|open grassland|swamp|orbital environment").map((name) => grammar(slug(name), "shared", name, `show only canonical ${name} adaptations with scientifically plausible structural consequences`));

const variationDefinitions: Array<[string, string, VariationProfile["strength"], number]> = [
  ["conservative", "Conservative", "conservative", 1], ["standard", "Standard", "standard", 2], ["exploratory", "Exploratory", "exploratory", 4], ["extreme-within-canon", "Extreme Within Canon", "extreme-within-canon", 4], ["regional-variant", "Regional Variant", "standard", 2], ["seasonal-variant", "Seasonal Variant", "standard", 2], ["sex-or-morph-variant", "Sex or Morph Variant", "standard", 2], ["juvenile-variant", "Juvenile Variant", "conservative", 1], ["elder-variant", "Elder Variant", "conservative", 1], ["rare-color-variant", "Rare Color Variant", "conservative", 2], ["mutation-variant", "Mutation Variant", "exploratory", 2], ["domesticated-variant", "Domesticated Variant", "conservative", 2], ["engineered-variant", "Engineered Variant", "standard", 2], ["environmental-stress-variant", "Environmental-Stress Variant", "standard", 2], ["biome-adaptation-variant", "Biome Adaptation Variant", "standard", 2]
];

export const variationProfiles: VariationProfile[] = variationDefinitions.map(([id, name, strength, requestedVersions]) => ({ ...grammar(id, "shared", name, `Apply ${name.toLowerCase()} only within the permitted secondary visual range.`), strength, requestedVersions, permittedFields: ["secondary proportions", "markings", "surface detail", "minor ornamentation", "natural individual variation", "pose", "composition"], prohibitedFields: ["canonical ID", "taxonomy", "body-plan family", "symmetry", "limb count", "wing count", "head count", "root type", "major branch architecture", "planet", "biome", "gravity adaptation", "atmospheric adaptation", "required materials", "locked coloration", "defining features", "life stage", "sapience status", "domestication status", "canonical rarity"], controls: { silhouette: "locked", coloration: id === "rare-color-variant" ? "allowed" : "subtle", material: "locked", proportions: "subtle", ornamentation: "moderate", surfaceDetail: "moderate", environmentalWear: "moderate", pose: "allowed", composition: "allowed" } }));

export const psdProductionRules = grammar("psd-production", "shared", "PSD Production Rules", "Keep the complete subject inside frame, use clean silhouette separation, avoid crop ambiguity, no text or labels, no embedded UI, preserve material boundaries, and compose for layered PSD or PSB extraction.");
export const sharedNegativePrompts = ["text", "watermark", "logo", "UI", "frame", "border", "cropped subject", "duplicate anatomy", "incorrect limb count", "incorrect wing count", "incorrect root type", "impossible gravity adaptation", "impossible atmosphere adaptation", "fantasy armor", "weapons", "cartoon", "anime", "oversaturated colors", "motion blur", "low resolution", "compression artifacts"];
const domainNegatives: Record<VisualDomain, string[]> = { creature: ["humanoid posture", "generic monster anatomy", "incompatible skeleton"], plant: ["floating roots", "duplicate trunks", "incompatible reproductive structures"] };

function byId<T extends { id: string }>(items: T[], id: string | undefined, fallback: T) { return items.find((item) => item.id === id) ?? fallback; }
function variableValue(value: unknown) { return value === null || value === undefined || value === "" ? undefined : Array.isArray(value) ? value.join(", ") : String(value); }
function resolveVariables(record: CanonicalVisualRecord, overrides: Record<string, string> = {}) {
  const blockedOverrideKeys = Object.keys(overrides).filter((key) => record.lockedFields.includes(key));
  const safeOverrides = Object.fromEntries(Object.entries(overrides).filter(([key]) => !blockedOverrideKeys.includes(key)));
  const values = { CanonicalId: record.id, DisplayName: record.displayName, ScientificName: record.scientificName ?? "", Taxonomy: record.taxonomy, ...Object.fromEntries(Object.entries(record.variables).map(([key, value]) => [key, variableValue(value) ?? ""])), ...safeOverrides };
  return { values: Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "")), unresolved: Object.entries(values).filter(([, value]) => value === "").map(([key]) => key), blockedOverrideKeys };
}
function defaultOutput(domain: VisualDomain) { return productionOutputs.find((item) => item.domain === domain && /production render/i.test(item.name)) ?? productionOutputs.find((item) => item.domain === domain)!; }
function defaultCamera(output: VisualGrammar) { return /orthographic/i.test(output.name) ? byId(cameraProfiles, "orthographic-side", cameraProfiles[0]) : /plate/i.test(output.name) ? byId(cameraProfiles, output.domain === "plant" ? "botanical-plate" : "species-plate", cameraProfiles[0]) : /habitat|composition/i.test(output.name) ? byId(cameraProfiles, "habitat-wide", cameraProfiles[0]) : byId(cameraProfiles, "three-quarter-studio", cameraProfiles[0]); }
function defaultLighting(output: VisualGrammar) { return /discovery/i.test(output.name) ? byId(lightingProfiles, "discovery-scan", lightingProfiles[0]) : /habitat|composition/i.test(output.name) ? byId(lightingProfiles, "native-habitat-day", lightingProfiles[0]) : byId(lightingProfiles, "museum-specimen", lightingProfiles[0]); }
function defaultBackground(output: VisualGrammar) { return /habitat|composition/i.test(output.name) ? byId(backgroundProfiles, "native-habitat", backgroundProfiles[0]) : byId(backgroundProfiles, "pure-black", backgroundProfiles[0]); }
function defaultComposition(output: VisualGrammar) { return /habitat|composition/i.test(output.name) ? byId(compositionProfiles, "habitat-observational", compositionProfiles[0]) : /plate|board/i.test(output.name) ? byId(compositionProfiles, "comparison-board", compositionProfiles[0]) : byId(compositionProfiles, "isolated-production", compositionProfiles[0]); }

function invalidReferenceIssue(kind: string, requestedId: string | undefined, available: { id: string }[]): PromptIssue | undefined {
  if (!requestedId || available.some((item) => item.id === requestedId)) return undefined;
  return { severity: "Structural Error", code: `invalid_${kind}_reference`, message: `Invalid ${kind} reference: ${requestedId}.` };
}

export function compileNanoBanana2Prompt(record: CanonicalVisualRecord, options: PromptCompileOptions): ResolvedVisualPrompt {
  const archetype = byId(visualArchetypes, record.archetypeId, visualArchetypes.find((item) => item.domain === record.domain)!);
  const output = byId(productionOutputs.filter((item) => item.domain === record.domain), options.outputTypeId, defaultOutput(record.domain));
  const variation = byId(variationProfiles, options.variationProfileId, variationProfiles[0]);
  const camera = byId(cameraProfiles, options.cameraProfileId, defaultCamera(output));
  const lighting = byId(lightingProfiles, options.lightingProfileId, defaultLighting(output));
  const background = byId(backgroundProfiles, options.backgroundProfileId, defaultBackground(output));
  const composition = byId(compositionProfiles, options.compositionProfileId, defaultComposition(output));
  const versionCount = options.versionCount ?? variation.requestedVersions;
  const seed = options.seed ?? record.seed;
  const variables = resolveVariables(record, options.authorOverrides);
  const issues: PromptIssue[] = [];
  if (!record.id) issues.push({ severity: "Structural Error", code: "missing_canonical_id", message: "Canonical ID is required." });
  if (!record.archetypeId || !visualArchetypes.some((item) => item.id === record.archetypeId)) issues.push({ severity: "Structural Error", code: "missing_archetype", message: "A valid archetype is required." });
  const invalidReferences = [
    invalidReferenceIssue("output", options.outputTypeId, productionOutputs.filter((item) => item.domain === record.domain)),
    invalidReferenceIssue("variation_profile", options.variationProfileId, variationProfiles),
    invalidReferenceIssue("camera", options.cameraProfileId, cameraProfiles),
    invalidReferenceIssue("lighting", options.lightingProfileId, lightingProfiles),
    invalidReferenceIssue("background", options.backgroundProfileId, backgroundProfiles),
    invalidReferenceIssue("composition", options.compositionProfileId, compositionProfiles)
  ].filter(Boolean) as PromptIssue[];
  issues.push(...invalidReferences);
  if (archetype.domain !== record.domain) issues.push({ severity: "Structural Error", code: "invalid_archetype_domain", message: "The selected archetype does not match the canonical record domain." });
  if (versionCount !== 1 && versionCount !== 2 && versionCount !== 3 && versionCount !== 4 && versionCount !== 6 && versionCount !== 8) issues.push({ severity: "Structural Error", code: "invalid_version_count", message: "Version count must be 1, 2, 3, 4, 6, or 8." });
  if (variables.unresolved.length) issues.push({ severity: "Missing Optional Data", code: "unresolved_variables", message: `Unresolved variables: ${variables.unresolved.join(", ")}.` });
  if (variables.blockedOverrideKeys.length) issues.push({ severity: "Canon Conflict", code: "override_locked_field", message: `Author overrides cannot replace locked canonical fields: ${variables.blockedOverrideKeys.join(", ")}.` });
  const identity = `Canonical ${record.domain} “${record.displayName}”${record.scientificName ? `, scientific name ${record.scientificName}` : ""}, canonical ID ${record.id}, taxonomy ${record.taxonomy}.`;
  const variableSentence = Object.entries(variables.values).filter(([key]) => !["CanonicalId", "DisplayName", "ScientificName", "Taxonomy"].includes(key)).map(([key, value]) => `${key}: ${value}`).join("; ");
  const variationInstruction = `Create ${versionCount} clearly different but canon-compliant interpretation${versionCount === 1 ? "" : "s"}. ${nanoBanana2ModelProfile.phrases.variation}: ${variation.permittedFields.join(", ")}. Never alter ${variation.prohibitedFields.join(", ")}.`;
  const lockedValueSentence = Object.entries(record.lockedValues).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("; ");
  const detailed = [`Create a premium NOVERIS ${output.name.toLowerCase()} for ${nanoBanana2ModelProfile.name}.`, `Requested task: ${output.instructions}`, `Canonical identity: ${identity}`, `Archetype: ${archetype.definition} ${archetype.structuralRules} ${archetype.movementOrGrowthRules}`, `Environment and ecology: ${archetype.environmentalRules} ${archetype.ecologyRules}`, `Resolved canonical variables: ${variableSentence || "no optional variables resolved"}.`, `Materials: ${archetype.materialRules}`, `Locked traits: ${record.lockedFields.join(", ") || "none declared"}. Locked values: ${lockedValueSentence || "none declared"}. ${nanoBanana2ModelProfile.phrases.consistency}.`, variationInstruction, `Camera: ${camera.instructions}.`, `Lighting: ${lighting.instructions}.`, `Background: ${background.instructions}.`, `Composition: ${composition.instructions}.`, `PSD production: ${psdProductionRules.instructions}`, `${nanoBanana2ModelProfile.phrases.noText}. ${nanoBanana2ModelProfile.phrases.iteration}.`].join(" ");
  const compact = [`${output.name}: ${record.displayName}`, archetype.name, archetype.structuralRules, variableSentence, `Camera ${camera.name}`, `lighting ${lighting.name}`, `background ${background.name}`, `composition ${composition.name}`, variationInstruction, psdProductionRules.instructions, nanoBanana2ModelProfile.phrases.noText].filter(Boolean).join(", ");
  const negative = [...sharedNegativePrompts, ...domainNegatives[record.domain], ...archetype.prohibitedChanges, ...(archetype.exclusions ?? [])].join(", ");
  if (detailed.length < 240) issues.push({ severity: "Production Warning", code: "prompt_too_short", message: "The resolved detailed prompt is unexpectedly short." });
  if (!negative.trim()) issues.push({ severity: "Production Warning", code: "missing_negative_prompt", message: "A negative prompt is required." });
  if (!detailed.includes(nanoBanana2ModelProfile.phrases.noText)) issues.push({ severity: "Production Warning", code: "missing_no_text_instruction", message: "The no-text instruction is required." });
  if (!detailed.includes(psdProductionRules.instructions)) issues.push({ severity: "Production Warning", code: "missing_psd_rules", message: "PSD production rules are required." });
  const canonicalRecordHash = hash(JSON.stringify(record));
  const grammarHash = hash(JSON.stringify({ output, archetype, camera, lighting, background, composition, variation, psd: psdProductionRules, negatives: sharedNegativePrompts, model: nanoBanana2ModelProfile, compiler: NANO_BANANA_2_COMPILER_VERSION, library: NANO_BANANA_2_LIBRARY_VERSION }));
  const sourceHash = hash(JSON.stringify({ canonicalRecordHash, grammarHash, versionCount, seed }));
  return { resolvedPromptId: `resolved-${record.id}-${output.id}-${sourceHash}`, canonicalId: record.id, modelProfileId: "nano-banana-2", compilerVersion: NANO_BANANA_2_COMPILER_VERSION, libraryVersion: NANO_BANANA_2_LIBRARY_VERSION, promptVersion: NANO_BANANA_2_LIBRARY_VERSION, sourceRecordVersion: record.sourceVersion, sourceHash, sourceSnapshot: { canonicalRecordHash, grammarHash }, promptHash: hash(`${detailed}\n${negative}`), seed, archetypeId: archetype.id, outputTypeId: output.id, variationProfileId: variation.id, cameraProfileId: camera.id, lightingProfileId: lighting.id, backgroundProfileId: background.id, compositionProfileId: composition.id, versionCount, positivePrompt: detailed, negativePrompt: negative, combinedPrompt: `${detailed}\n\nNEGATIVE PROMPT\n${negative}`, compactPrompt: compact, detailedPrompt: detailed, resolvedVariables: variables.values, unresolvedVariables: variables.unresolved, lockedFields: record.lockedFields, validation: issues, staleStatus: "current", productionStatus: "draft" };
}

export function getNanoBanana2PromptStaleness(record: CanonicalVisualRecord, prompt: ResolvedVisualPrompt): PromptStaleness {
  const current = compileNanoBanana2Prompt(record, { outputTypeId: prompt.outputTypeId, variationProfileId: prompt.variationProfileId, versionCount: prompt.versionCount as 1 | 2 | 3 | 4 | 6 | 8, seed: prompt.seed, cameraProfileId: prompt.cameraProfileId, lightingProfileId: prompt.lightingProfileId, backgroundProfileId: prompt.backgroundProfileId, compositionProfileId: prompt.compositionProfileId });
  if (current.sourceHash === prompt.sourceHash) return { stale: false, previousHash: prompt.sourceHash, currentHash: current.sourceHash, reason: "current", changedSourceFields: [] };
  const canonicalChanged = prompt.sourceSnapshot.canonicalRecordHash !== current.sourceSnapshot.canonicalRecordHash;
  return { stale: true, previousHash: prompt.sourceHash, currentHash: current.sourceHash, reason: canonicalChanged ? "canonical_record_changed" : "compiler_or_grammar_changed", changedSourceFields: canonicalChanged ? ["canonicalRecord"] : ["compilerOrGrammar"] };
}

export function isNanoBanana2PromptStale(record: CanonicalVisualRecord, prompt: ResolvedVisualPrompt) { return getNanoBanana2PromptStaleness(record, prompt).stale; }

export function compileNanoBanana2VariationSet(record: CanonicalVisualRecord, options: Omit<PromptCompileOptions, "variationProfileId" | "versionCount">) {
  return variationProfiles.map((variation) => compileNanoBanana2Prompt(record, { ...options, variationProfileId: variation.id, versionCount: variation.requestedVersions as 1 | 2 | 3 | 4 | 6 | 8 }));
}

export function compileNanoBanana2PromptBatch(records: CanonicalVisualRecord[], options: PromptCompileOptions) {
  const prompts = records.map((record) => compileNanoBanana2Prompt(record, options));
  const duplicateIds = prompts.map((prompt) => prompt.resolvedPromptId).filter((id, index, ids) => ids.indexOf(id) !== index);
  return { prompts, validation: duplicateIds.length ? [{ severity: "Structural Error" as const, code: "duplicate_resolved_prompt_id", message: `Duplicate resolved prompt IDs: ${[...new Set(duplicateIds)].join(", ")}.` }] : [] };
}
export function sanitizeVisualPromptForRuntime(prompt: ResolvedVisualPrompt) { return { generatedAssetId: null, sourcePromptId: prompt.resolvedPromptId, promptHash: prompt.promptHash, promptVersion: prompt.promptVersion, modelProfileId: prompt.modelProfileId, generationSeed: prompt.seed, variationProfileId: prompt.variationProfileId, productionStatus: prompt.productionStatus, approvedAssetReference: null }; }
export function exportPromptPack(prompt: ResolvedVisualPrompt) {
  const payload = { canonicalId: prompt.canonicalId, displayName: prompt.resolvedVariables.DisplayName, modelProfile: prompt.modelProfileId, archetype: prompt.archetypeId, outputType: prompt.outputTypeId, variationProfile: prompt.variationProfileId, versionCount: prompt.versionCount, seed: prompt.seed, positivePrompt: prompt.positivePrompt, negativePrompt: prompt.negativePrompt, combinedPrompt: prompt.combinedPrompt, resolvedVariables: prompt.resolvedVariables, lockedFields: prompt.lockedFields, compilerVersion: prompt.compilerVersion, promptVersion: prompt.promptVersion, generatedAt: "deterministic-build", staleStatus: prompt.staleStatus, promptHash: prompt.promptHash };
  const csv = [Object.keys(payload).join(","), Object.values(payload).map((value) => `"${JSON.stringify(value).replaceAll('"', '""')}"`).join(",")].join("\n");
  const markdown = `# ${payload.displayName} Nano Banana 2 Prompt Pack\n\n## Positive Prompt\n\n\`\`\`text\n${prompt.positivePrompt}\n\`\`\`\n\n## Negative Prompt\n\n\`\`\`text\n${prompt.negativePrompt}\n\`\`\`\n`;
  return { json: JSON.stringify(payload, null, 2), jsonl: JSON.stringify(payload), csv, markdown, text: prompt.combinedPrompt };
}
