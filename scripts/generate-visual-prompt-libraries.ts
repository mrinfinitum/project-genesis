import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type PromptRecord = {
  id: string;
  title: string;
  category: "creature" | "plant-life";
  subcategory: string;
  outputType: string;
  imageModel: "Nano Banana 2";
  styleProfile: string;
  cameraProfile: string;
  lightingProfile: string;
  prompt: string;
  negativePrompt: string;
  variables: string[];
  tags: string[];
  version: "1.0.0";
};

type LibraryConfig = {
  folder: string;
  packageId: string;
  packageName: string;
  category: PromptRecord["category"];
  styleProfile: string;
  archetypes: string[];
  outputs: string[];
  variables: string[];
  cameras: Array<{ id: string; displayName: string; intent: string }>;
  lighting: Array<{ id: string; displayName: string; intent: string }>;
  negativePrompts: string[];
  plateFilename: string;
  plateProfiles: Array<{ id: string; displayName: string; assets: string[] }>;
  baseSubject: string;
  anatomy: string;
  material: string;
  adaptations: string;
  isolatedOutputs: Set<string>;
  interchangeContract?: {
    archetypeFile: string;
    outputTypesFile: string;
    schemaFile: string;
    promptLibraryFile: string;
    promptLibraryJsonlFile: string;
    promptLibraryCsvFile: string;
    cameraProfilesFile: string;
    lightingProfilesFile: string;
    styleProfilesFile: string;
    promptVariablesFile: string;
    negativePromptsFile: string;
    catalogFile: string;
    readmeFile: string;
    importPromptFile: string;
  };
};

const root = path.join(process.cwd(), "data", "visual-prompt-libraries");
const VERSION = "1.0.0";
const MODEL = "Nano Banana 2" as const;
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const title = (value: string) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

const creatureOutputs = [
  "Full Body", "Portrait", "Head", "Three Quarter", "Front", "Rear", "Side", "Turnaround", "Skeleton", "Musculature", "Anatomy", "Cross Section", "Habitat", "Behavior", "Feeding", "Sleeping", "Running", "Walking", "Jumping", "Attack", "Defense", "Discovery Scan", "Species Plate", "Reference Board", "Animation Sheet", "Silhouette", "Scale Comparison", "Icon", "Card", "Loading Artwork", "Encyclopedia Artwork", "Juvenile", "Adult", "Elder", "Male", "Female", "Variant"
];

const plantOutputs = [
  "Whole Plant", "Portrait", "Front View", "Rear View", "Side View", "Top View", "Bottom View", "Orthographic Turnaround", "Roots", "Leaves", "Stem", "Trunk", "Bark", "Branch Structure", "Flowers", "Fruit", "Seeds", "Spores", "Cross Section", "Internal Anatomy", "Growth Stages", "Seasonal Variants", "Habitat Scene", "Forest Composition", "Biome Composition", "Agricultural Field", "Harvest Ready", "Botanical Plate", "Reference Board", "Silhouette", "Scale Comparison", "Icon", "Card", "Loading Artwork", "Discovery Scan", "Encyclopedia Artwork", "PSD Extraction"
];

const creatureConfig: LibraryConfig = {
  folder: "volume-ia-mammalian-creatures",
  packageId: "NOVERIS_Visual_Prompt_Library_Volume_IA_Mammalian_Creatures",
  packageName: "NOVERIS Visual Prompt Library Volume IA Mammalian Creatures",
  category: "creature",
  styleProfile: "NOVERIS Scientific Realism",
  archetypes: [
    "Apex Predator", "Pack Predator", "Ambush Predator", "Herbivore", "Grazer", "Browser", "Omnivore", "Burrowing Mammal", "Arboreal Mammal", "Mountain Mammal", "Desert Mammal", "Polar Mammal", "Jungle Mammal", "Forest Mammal", "Grassland Mammal", "Wetland Mammal", "Semi Aquatic Mammal", "Fully Aquatic Mammal", "Flying Mammal", "Low Gravity Mammal", "High Gravity Mammal", "Crystal Mammal", "Silicon Mammal", "Bioluminescent Mammal", "Cave Mammal", "Domesticated Mammal", "Working Mammal", "Pack Animal", "Companion Mammal", "Colossal Mammal", "Micro Mammal", "Ancient Mammal", "Extinct Mammal", "Mutated Mammal", "Engineered Mammal", "Biomechanical Mammal", "Synthetic Mammal"
  ],
  outputs: creatureOutputs,
  variables: ["SpeciesName", "ScientificName", "Planet", "Biome", "Gravity", "Atmosphere", "Climate", "BodyPlan", "Diet", "Behavior", "PrimaryMaterial", "ColorPalette", "DistinctiveFeatures", "Rarity"],
  cameras: [
    { id: "portrait", displayName: "Portrait", intent: "eye-level portrait framing with clear facial anatomy" },
    { id: "orthographic-front", displayName: "Orthographic Front", intent: "true front orthographic reference with no perspective distortion" },
    { id: "orthographic-side", displayName: "Orthographic Side", intent: "true side orthographic reference with no perspective distortion" },
    { id: "orthographic-rear", displayName: "Orthographic Rear", intent: "true rear orthographic reference with no perspective distortion" },
    { id: "three-quarter", displayName: "Three Quarter", intent: "three-quarter full-body specimen view with grounded posture" },
    { id: "top", displayName: "Top", intent: "top-down anatomical reference" },
    { id: "bottom", displayName: "Bottom", intent: "underside anatomical reference" },
    { id: "macro", displayName: "Macro", intent: "controlled macro study of material and anatomy" },
    { id: "habitat-wide", displayName: "Habitat Wide", intent: "restrained wide habitat composition with the subject readable" },
    { id: "reference-sheet", displayName: "Reference Sheet", intent: "neutral production reference-sheet framing" }
  ],
  lighting: [
    { id: "soft-studio", displayName: "Soft Studio", intent: "soft neutral studio lighting, neutral white balance, readable materials" },
    { id: "soft-rim", displayName: "Soft Rim", intent: "soft studio key with a restrained rim light for silhouette separation" },
    { id: "museum-specimen", displayName: "Museum Specimen", intent: "museum-quality specimen illumination without dramatic shadows" },
    { id: "habitat-natural", displayName: "Habitat Natural", intent: "natural low-contrast environmental illumination with no focal flare" }
  ],
  negativePrompts: ["text", "watermark", "logo", "UI", "frame", "cropped subject", "duplicate limbs", "duplicate heads", "incorrect anatomy", "random wings", "random horns", "armor", "weapons", "cartoon", "anime", "oversaturation", "motion blur", "low resolution", "compression artifacts", "floating body parts"],
  plateFilename: "species_plate_profiles.json",
  plateProfiles: [{ id: "mammalian-species-plate", displayName: "Mammalian Species Plate", assets: ["full body", "portrait", "front", "rear", "side", "skeleton", "footprint", "juvenile", "adult", "elder", "male", "female", "habitat", "scale comparison", "silhouette", "materials"] }],
  baseSubject: "canonical mammalian creature {{SpeciesName}}, scientific name {{ScientificName}}, {{BodyPlan}} body plan",
  anatomy: "believable mammalian anatomy, balanced skeleton, functional joint placement, correct center of mass, coherent musculature, species-consistent limbs and posture",
  material: "{{PrimaryMaterial}} materials, {{ColorPalette}} palette, premium physically based surface detail",
  adaptations: "adapted to {{Planet}}, {{Biome}}, {{Gravity}} gravity, {{Atmosphere}} atmosphere, {{Climate}} climate; diet {{Diet}}, behavior {{Behavior}}, distinctive features {{DistinctiveFeatures}}, rarity {{Rarity}}",
  isolatedOutputs: new Set(["Full Body", "Portrait", "Head", "Three Quarter", "Front", "Rear", "Side", "Turnaround", "Skeleton", "Musculature", "Anatomy", "Cross Section", "Discovery Scan", "Species Plate", "Reference Board", "Animation Sheet", "Silhouette", "Scale Comparison", "Icon", "Card", "Loading Artwork", "Encyclopedia Artwork", "Juvenile", "Adult", "Elder", "Male", "Female", "Variant"])
};

const plantConfig: LibraryConfig = {
  folder: "volume-ib-plant-life",
  packageId: "NOVERIS_Visual_Prompt_Library_Volume_IB_Plant_Life",
  packageName: "NOVERIS Visual Prompt Library Volume IB Plant Life",
  category: "plant-life",
  styleProfile: "NOVERIS Botanical Scientific Realism",
  archetypes: [
    "Temperate Forest Tree", "Rainforest Tree", "Conifer", "Deciduous Tree", "Alien Tree", "Canopy Tree", "Mangrove", "Swamp Tree", "Desert Tree", "Polar Tree", "Volcanic Tree", "High Gravity Tree", "Low Gravity Tree", "Shrub", "Bush", "Ground Cover", "Grass", "Fern", "Moss", "Lichen", "Flowering Plant", "Pollinator Flower", "Succulent", "Cactus", "Carnivorous Plant", "Aquatic Plant", "Floating Plant", "River Plant", "Deep Water Plant", "Seaweed", "Kelp", "Fungi", "Giant Mushroom", "Shelf Fungus", "Mycelial Colony", "Coral Flora", "Crystal Flora", "Silicon Flora", "Mineral Flora", "Energy Flora", "Gas Flora", "Plasma Flora", "Photonic Flora", "Electromagnetic Flora", "Radiotrophic Flora", "Cryogenic Flora", "Methane Flora", "Ammonia Flora", "Sulfur Flora", "Biomechanical Flora", "Synthetic Flora", "Robotic Flora", "Nanite Flora", "Terraforming Flora", "Engineered Crop", "Companion Crop", "Medicinal Plant", "Poisonous Plant", "Fiber Plant", "Fruit Plant", "Seed Plant", "Spore Plant", "Giant Flora", "Microflora", "Ancient Flora", "Extinct Flora"
  ],
  outputs: plantOutputs,
  variables: ["PlantName", "ScientificName", "Planet", "PlanetType", "Biome", "Climate", "Season", "Gravity", "Atmosphere", "Temperature", "Humidity", "Soil Chemistry", "Water Requirement", "Growth Pattern", "Leaf Type", "Flower Type", "Fruit Type", "Seed Type", "Root Type", "Color Palette", "Distinctive Features", "Rarity"],
  cameras: [
    { id: "portrait", displayName: "Portrait", intent: "portrait specimen composition with the full botanical silhouette readable" },
    { id: "orthographic-front", displayName: "Orthographic Front", intent: "true front orthographic botanical reference" },
    { id: "orthographic-side", displayName: "Orthographic Side", intent: "true side orthographic botanical reference" },
    { id: "orthographic-rear", displayName: "Orthographic Rear", intent: "true rear orthographic botanical reference" },
    { id: "three-quarter", displayName: "Three Quarter", intent: "three-quarter specimen view preserving growth habit" },
    { id: "top", displayName: "Top", intent: "top-down foliage and canopy reference" },
    { id: "bottom", displayName: "Bottom", intent: "underside and root-system reference" },
    { id: "macro", displayName: "Macro", intent: "controlled macro botanical material study" },
    { id: "leaf-closeup", displayName: "Leaf Closeup", intent: "leaf venation and attachment closeup" },
    { id: "flower-closeup", displayName: "Flower Closeup", intent: "reproductive flower structure closeup" },
    { id: "fruit-closeup", displayName: "Fruit Closeup", intent: "fruit structure closeup" },
    { id: "seed-closeup", displayName: "Seed Closeup", intent: "seed morphology closeup" },
    { id: "root-closeup", displayName: "Root Closeup", intent: "root-system structure closeup" },
    { id: "habitat-wide", displayName: "Habitat Wide", intent: "restrained habitat composition that preserves ecological scale" },
    { id: "forest-wide", displayName: "Forest Wide", intent: "restrained forest composition with realistic spacing" },
    { id: "reference-board", displayName: "Reference Board", intent: "neutral botanical reference-board composition" }
  ],
  lighting: [
    { id: "soft-neutral-studio", displayName: "Soft Neutral Studio", intent: "soft neutral studio lighting and physically believable botanical materials" },
    { id: "soft-rim", displayName: "Soft Rim", intent: "soft neutral studio key with a restrained rim light for silhouette separation" },
    { id: "museum-specimen", displayName: "Museum Specimen", intent: "museum specimen lighting with readable leaf, bark, root, and reproductive detail" },
    { id: "habitat-natural", displayName: "Habitat Natural", intent: "natural low-contrast habitat illumination with no dramatic shadows" }
  ],
  negativePrompts: ["text", "watermark", "logo", "frame", "UI", "cropped subject", "floating roots", "floating branches", "incorrect leaf arrangement", "duplicate trunks", "duplicate flowers", "duplicate fruit", "cartoon", "anime", "oversaturated colors", "motion blur", "low resolution", "compression artifacts", "plastic materials", "fantasy glowing unless canonical"],
  plateFilename: "botanical_plate_profiles.json",
  plateProfiles: [{ id: "botanical-production-plate", displayName: "Botanical Production Plate", assets: ["entire plant", "portrait", "front", "rear", "side", "roots", "leaves", "flowers", "fruit", "seeds", "cross section", "growth stages", "seasonal variants", "habitat thumbnail", "silhouette", "scale comparison", "material closeups"] }],
  baseSubject: "canonical plant-life specimen {{PlantName}}, scientific name {{ScientificName}}, {{Growth Pattern}} growth pattern",
  anatomy: "botanically coherent roots {{Root Type}}, {{Leaf Type}} leaves, branching and stem structure, {{Flower Type}} flowers, {{Fruit Type}} fruit, {{Seed Type}} seeds, correct reproductive structures",
  material: "physically based botanical materials, {{Color Palette}} color palette, readable bark, leaf, root, and reproductive detail",
  adaptations: "native to {{Planet}} ({{PlanetType}}), {{Biome}}, {{Climate}}, {{Season}} season, {{Gravity}} gravity, {{Atmosphere}} atmosphere, {{Temperature}} temperature, {{Humidity}} humidity, {{Soil Chemistry}} soil chemistry, water requirement {{Water Requirement}}, distinctive features {{Distinctive Features}}, rarity {{Rarity}}",
  isolatedOutputs: new Set(["Whole Plant", "Portrait", "Front View", "Rear View", "Side View", "Top View", "Bottom View", "Orthographic Turnaround", "Roots", "Leaves", "Stem", "Trunk", "Bark", "Branch Structure", "Flowers", "Fruit", "Seeds", "Spores", "Cross Section", "Internal Anatomy", "Growth Stages", "Seasonal Variants", "Harvest Ready", "Botanical Plate", "Reference Board", "Silhouette", "Scale Comparison", "Icon", "Card", "Loading Artwork", "Discovery Scan", "Encyclopedia Artwork", "PSD Extraction"])
};

const avianOutputs = [
  "Full Body", "Portrait", "Head Study", "Front View", "Side View", "Rear View", "Top View", "Bottom View", "Orthographic Turnaround", "Wing Spread", "Folded Wings", "Skeleton", "Musculature", "Internal Anatomy", "Feather Study", "Foot Study", "Beak Study", "Eye Study", "Lifecycle", "Variants", "Behavior", "Perching", "Takeoff", "Landing", "Gliding", "Powered Flight", "Hunting", "Feeding", "Sleeping", "Discovery Scan", "Habitat Scene", "Species Plate", "Reference Board", "Animation Sheet", "Scale Comparison", "Silhouette", "UI Icon", "Card Artwork", "Loading Artwork", "Encyclopedia Artwork", "PSD Extraction Board"
];

const avianConfig: LibraryConfig = {
  folder: "volume-ib-avian-flying-creatures",
  packageId: "NOVERIS_Visual_Prompt_Library_Volume_IB_Avian_Flying_Creatures",
  packageName: "NOVERIS Visual Prompt Library Volume IB Avian Flying Creatures",
  category: "creature",
  styleProfile: "NOVERIS Scientific Realism",
  archetypes: [
    "Apex Raptor", "Pack Hunter", "Forest Glider", "Soaring Hunter", "High Altitude Flyer", "Hovering Nectar Feeder", "Scavenger", "Carrion Specialist", "Marsh Wader", "River Hunter", "Coastal Flyer", "Ocean Skimmer", "Deep Ocean Surface Hunter", "Cliff Nesting Flyer", "Canopy Flyer", "Cave Flyer", "Desert Flyer", "Polar Flyer", "Mountain Flyer", "Low Gravity Flyer", "High Gravity Flyer", "Bioluminescent Flyer", "Nocturnal Flyer", "Thermal Soarer", "Floating Atmospheric Organism", "Winged Megafauna", "Winged Microfauna", "Crystal Flyer", "Silicon Flyer", "Energy Flyer", "Gas Flyer", "Plasma Flyer", "Biomechanical Flyer", "Synthetic Flyer", "Engineered Flyer"
  ],
  outputs: avianOutputs,
  variables: ["SpeciesName", "ScientificName", "Planet", "Biome", "Gravity", "Atmosphere", "Climate", "Wind", "Air Density", "Wing Type", "Wing Span", "Feather Type", "Diet", "Behavior", "Primary Material", "Color Palette", "Distinctive Features"],
  cameras: [
    { id: "portrait", displayName: "Portrait", intent: "eye-level portrait framing with clear facial, eye, and beak anatomy" },
    { id: "orthographic-front", displayName: "Orthographic Front", intent: "true front orthographic reference with no perspective distortion" },
    { id: "orthographic-side", displayName: "Orthographic Side", intent: "true side orthographic reference with no perspective distortion" },
    { id: "orthographic-rear", displayName: "Orthographic Rear", intent: "true rear orthographic reference with no perspective distortion" },
    { id: "orthographic-top", displayName: "Orthographic Top", intent: "true top orthographic reference for silhouette and wing geometry" },
    { id: "orthographic-bottom", displayName: "Orthographic Bottom", intent: "true underside orthographic reference for flight and landing anatomy" },
    { id: "three-quarter", displayName: "Three Quarter", intent: "three-quarter full-body specimen view with the complete flight silhouette readable" },
    { id: "wing-detail", displayName: "Wing Detail", intent: "controlled wing-detail view showing feather architecture, lift surfaces, and attachment points" },
    { id: "macro-feather", displayName: "Macro Feather", intent: "controlled macro study of feather microstructure and physically based surface materials" },
    { id: "habitat-wide", displayName: "Habitat Wide", intent: "restrained habitat composition with believable aerial scale and clear subject readability" },
    { id: "reference-board", displayName: "Reference Board", intent: "neutral museum production reference-board framing" }
  ],
  lighting: [
    { id: "neutral-studio", displayName: "Neutral Studio", intent: "soft neutral studio lighting, neutral white balance, and readable feather materials" },
    { id: "museum-specimen", displayName: "Museum Specimen", intent: "museum-quality specimen illumination without dramatic shadows" },
    { id: "habitat-natural", displayName: "Habitat Natural", intent: "natural low-contrast environmental illumination with no focal flare" },
    { id: "discovery-scan", displayName: "Discovery Scan", intent: "restrained scientific scanning illumination that preserves anatomy and surface readability" }
  ],
  negativePrompts: ["text", "watermark", "frame", "logo", "UI", "cropped subject", "duplicate wings", "incorrect feather count", "impossible wing loading", "incorrect anatomy", "fantasy armor", "weapons", "cartoon", "anime", "oversaturated colors", "motion blur", "low resolution", "compression artifacts", "angel wings", "fantasy dragons", "Earth bird default"],
  plateFilename: "avian-species-plate-profiles.json",
  plateProfiles: [{ id: "avian-flying-species-plate", displayName: "Avian and Flying Creature Species Plate", assets: ["full body", "portrait", "front", "rear", "side", "top", "bottom", "skeleton", "wing anatomy", "foot", "beak", "juvenile", "adult", "male", "female", "variants", "habitat", "scale comparison", "silhouette", "material studies"] }],
  baseSubject: "canonical NOVERIS avian or flying creature {{SpeciesName}}, scientific name {{ScientificName}}, {{Wing Type}} wings with a {{Wing Span}} wingspan",
  anatomy: "scientifically believable flight anatomy: wing size that supports body mass, wing loading appropriate to {{Gravity}} gravity and {{Air Density}} air density, functional muscle attachment, balanced skeleton, correct center of gravity, feather architecture {{Feather Type}}, lift generation, leg placement for takeoff and landing, and mechanically plausible landing control",
  material: "{{Primary Material}} materials, {{Color Palette}} palette, premium physically based feather and surface rendering",
  adaptations: "adapted to {{Planet}}, {{Biome}}, {{Gravity}} gravity, {{Atmosphere}} atmosphere, {{Climate}} climate, {{Wind}} wind, and {{Air Density}} air density; diet {{Diet}}, behavior {{Behavior}}, distinctive features {{Distinctive Features}}",
  isolatedOutputs: new Set(["Full Body", "Portrait", "Head Study", "Front View", "Side View", "Rear View", "Top View", "Bottom View", "Orthographic Turnaround", "Wing Spread", "Folded Wings", "Skeleton", "Musculature", "Internal Anatomy", "Feather Study", "Foot Study", "Beak Study", "Eye Study", "Lifecycle", "Variants", "Species Plate", "Reference Board", "Animation Sheet", "Scale Comparison", "Silhouette", "UI Icon", "Card Artwork", "Loading Artwork", "Encyclopedia Artwork", "PSD Extraction Board"]),
  interchangeContract: {
    archetypeFile: "avian-archetypes.json",
    outputTypesFile: "output-types.json",
    schemaFile: "prompt-record.schema.json",
    promptLibraryFile: "prompt-library.json",
    promptLibraryJsonlFile: "prompt-library.jsonl",
    promptLibraryCsvFile: "prompt-library.csv",
    cameraProfilesFile: "camera-profiles.json",
    lightingProfilesFile: "lighting-profiles.json",
    styleProfilesFile: "style-profiles.json",
    promptVariablesFile: "prompt-variables.json",
    negativePromptsFile: "negative-prompt-library.json",
    catalogFile: "PROMPT_CATALOG.md",
    readmeFile: "README.md",
    importPromptFile: "CODEX_IMPORT_PROMPT.txt"
  }
};

function cameraFor(config: LibraryConfig, outputType: string) {
  const output = outputType.toLowerCase();
  if (output.includes("front")) return config.cameras.find((item) => item.id === "orthographic-front")!;
  if (output.includes("rear")) return config.cameras.find((item) => item.id === "orthographic-rear")!;
  if (output.includes("side")) return config.cameras.find((item) => item.id === "orthographic-side")!;
  if (output.includes("top")) return config.cameras.find((item) => item.id === "top" || item.id === "orthographic-top")!;
  if (output.includes("bottom")) return config.cameras.find((item) => item.id === "bottom" || item.id === "orthographic-bottom")!;
  if (output.includes("portrait") || output.includes("head")) return config.cameras.find((item) => item.id === "portrait")!;
  if (output.includes("habitat")) return config.cameras.find((item) => item.id === "habitat-wide")!;
  if (output.includes("forest")) return config.cameras.find((item) => item.id === "forest-wide") ?? config.cameras.find((item) => item.id === "habitat-wide")!;
  if (output.includes("reference") || output.includes("plate")) return config.cameras.find((item) => item.id.includes("reference"))!;
  if (output.includes("wing")) return config.cameras.find((item) => item.id === "wing-detail") ?? config.cameras.find((item) => item.id === "macro")!;
  if (output.includes("feather")) return config.cameras.find((item) => item.id === "macro-feather") ?? config.cameras.find((item) => item.id === "macro")!;
  if (output.includes("foot") || output.includes("beak") || output.includes("eye")) return config.cameras.find((item) => item.id === "macro-feather") ?? config.cameras.find((item) => item.id === "macro")!;
  if (output.includes("leaf")) return config.cameras.find((item) => item.id === "leaf-closeup") ?? config.cameras.find((item) => item.id === "macro")!;
  if (output.includes("flower")) return config.cameras.find((item) => item.id === "flower-closeup") ?? config.cameras.find((item) => item.id === "macro")!;
  if (output.includes("fruit")) return config.cameras.find((item) => item.id === "fruit-closeup") ?? config.cameras.find((item) => item.id === "macro")!;
  if (output.includes("seed") || output.includes("spore")) return config.cameras.find((item) => item.id === "seed-closeup") ?? config.cameras.find((item) => item.id === "macro")!;
  if (output.includes("root")) return config.cameras.find((item) => item.id === "root-closeup") ?? config.cameras.find((item) => item.id === "macro")!;
  if (output.includes("three")) return config.cameras.find((item) => item.id === "three-quarter")!;
  return config.cameras.find((item) => item.id === "three-quarter") ?? config.cameras[0];
}

function outputIntent(outputType: string) {
  const output = outputType.toLowerCase();
  if (output.includes("plate")) return "compose an ordered museum production plate showing the requested studies with clean separation and no labels";
  if (output.includes("reference")) return "compose a neutral reference board with the requested production studies, clean separation, and no labels";
  if (output.includes("turnaround")) return "show a production turnaround with consistent scale, grounded orientation, and no labels";
  if (output.includes("animation")) return "show a production animation reference sheet with consistent anatomy and no labels";
  if (output.includes("habitat") || output.includes("forest") || output.includes("biome") || output.includes("agricultural")) return "show a restrained ecologically plausible environment that supports rather than competes with the subject";
  if (output.includes("loading")) return "compose a clean cinematic production image with safe negative space and a readable subject";
  if (output.includes("icon")) return "compose a compact readable silhouette suitable for icon extraction";
  if (output.includes("card") || output.includes("encyclopedia") || output.includes("discovery")) return "compose a readable subject-forward production illustration with safe margins";
  return `create a precise ${outputType.toLowerCase()} production study with the complete requested subject visible`;
}

function compileRecord(config: LibraryConfig, archetype: string, outputType: string): PromptRecord {
  const camera = cameraFor(config, outputType);
  const isolated = config.isolatedOutputs.has(outputType);
  const lightingId = config.interchangeContract && outputType.includes("Discovery Scan") ? "discovery-scan" : isolated ? "museum-specimen" : "habitat-natural";
  const lighting = config.lighting.find((item) => item.id === lightingId) ?? config.lighting[0];
  const background = isolated ? "pure black background, isolated subject, no ground plane unless required for anatomical contact" : "environment only where it supports the canonical habitat and composition";
  const prompt = [
    `Create a premium NOVERIS ${archetype.toLowerCase()} ${outputType.toLowerCase()} for Nano Banana 2.`,
    config.baseSubject,
    config.anatomy,
    config.adaptations,
    config.material,
    outputIntent(outputType),
    `Camera: ${camera.intent}. Lighting: ${lighting.intent}.`,
    `${background}.`,
    `${config.styleProfile}: museum quality, AAA realism, scientifically believable, clean readable silhouette, PSD-friendly layered extraction, production quality, no text.`
  ].join(" ");
  return {
    id: `${slug(config.packageId)}-${slug(archetype)}-${slug(outputType)}`,
    title: `${archetype} · ${outputType}`,
    category: config.category,
    subcategory: archetype,
    outputType,
    imageModel: MODEL,
    styleProfile: config.styleProfile,
    cameraProfile: camera.id,
    lightingProfile: lighting.id,
    prompt,
    negativePrompt: config.negativePrompts.join(", "),
    variables: config.variables,
    tags: [config.category, slug(archetype), slug(outputType), "nano-banana-2", "psd-production", "canonical-prompt"],
    version: VERSION
  };
}

function readme(config: LibraryConfig, count: number) {
  const variablesFile = config.interchangeContract?.promptVariablesFile ?? "prompt_variables.json";
  return `# ${config.packageName}\n\nThis canonical Visual Production Engine package contains ${count} production prompt records for ${MODEL}. It does not generate images or gameplay data.\n\n## Use\n\n1. Select a record by canonical subcategory and production output type.\n2. Substitute only the variables defined in \`${variablesFile}\` from canonical Studio data.\n3. Copy the compiled prompt and its paired negative prompt into ${MODEL}.\n4. Save the resulting editable PSD/PSB in \`source-masters/life/${config.category === "creature" ? "creatures" : "plants"}\`.\n5. Let Studio create reviewed PNG/WebP derivatives; clients consume published derivatives, never PSD masters.\n\n## Prompt guarantees\n\n- ${MODEL} is the only declared image model.\n- Isolated production studies use pure black backgrounds; only ecological composition outputs request environments.\n- Camera, lighting, negative prompts, and supported variables are explicitly declared.\n- Records preserve canonical identity through placeholders rather than inventing record data.\n\n## Versioning\n\nEach prompt is versioned independently through its \`version\` field. Recompile when a canonical source field changes; do not silently change a previously approved source-master record.\n`;
}

function importPrompt(config: LibraryConfig) {
  const variablesFile = config.interchangeContract?.promptVariablesFile ?? "prompt_variables.json";
  return `IMPORT ${config.packageId}\n\nImport the JSON files as a canonical Visual Production Engine package. Preserve prompt IDs and version 1.0.0.\n\nGenerator consumption:\n- Resolve a record by category=${config.category}, subcategory, and outputType.\n- Substitute only fields declared in ${variablesFile} from the canonical ${config.category === "creature" ? "species" : "plant"} record and its linked planet/biome data.\n- Reject unresolved or undeclared variables.\n- Present the positive and negative prompts as copyable Nano Banana 2 production prompts.\n- Track the prompt ID and version with any PSD source master and generated derivative.\n\nDo not use this package to create player state, spawned runtime instances, or non-canonical gameplay values.\n`;
}

function promptCatalog(config: LibraryConfig, records: PromptRecord[]) {
  const sections = records.map((record) => `## ${record.title}\n\n- **ID:** \`${record.id}\`\n- **Camera:** ${record.cameraProfile}\n- **Lighting:** ${record.lightingProfile}\n\n### Prompt\n\n\`\`\`text\n${record.prompt}\n\`\`\`\n\n### Negative Prompt\n\n\`\`\`text\n${record.negativePrompt}\n\`\`\``);
  return `# ${config.packageName} Prompt Catalog\n\n${records.length} canonical ${MODEL} prompt records. Each record preserves the canonical variable contract and is ready to copy into the image workflow.\n\n${sections.join("\n\n")}`;
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function promptRecordSchema() {
  return {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    title: "NOVERIS Visual Prompt Record",
    type: "object",
    additionalProperties: false,
    required: ["id", "title", "category", "subcategory", "outputType", "imageModel", "styleProfile", "cameraProfile", "lightingProfile", "prompt", "negativePrompt", "variables", "tags", "version"],
    properties: {
      id: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
      category: { type: "string", minLength: 1 },
      subcategory: { type: "string", minLength: 1 },
      outputType: { type: "string", minLength: 1 },
      imageModel: { const: MODEL },
      styleProfile: { type: "string", minLength: 1 },
      cameraProfile: { type: "string", minLength: 1 },
      lightingProfile: { type: "string", minLength: 1 },
      prompt: { type: "string", minLength: 1 },
      negativePrompt: { type: "string", minLength: 1 },
      variables: { type: "array", items: { type: "string", minLength: 1 } },
      tags: { type: "array", items: { type: "string", minLength: 1 } },
      version: { const: VERSION }
    }
  };
}

function buildInterchangeFiles(config: LibraryConfig, records: PromptRecord[]) {
  const contract = config.interchangeContract;
  if (!contract) return [];
  const variables = config.variables.map((name) => ({ name, token: `{{${name}}}`, required: true, source: "canonical Studio record or linked canonical world data" }));
  const outputTypes = config.outputs.map((displayName) => ({ id: slug(displayName), displayName }));
  const archetypes = config.archetypes.map((displayName) => ({ id: slug(displayName), displayName, category: config.category, family: "avian-flying-creature" }));
  const styleProfiles = [{ id: slug(config.styleProfile), displayName: config.styleProfile, requirements: ["museum-quality presentation", "AAA production quality", "scientifically believable anatomy", "physically based materials", "premium feather rendering", "clean silhouette", "PSD extraction ready"] }];
  const csvHeaders = ["id", "title", "category", "subcategory", "outputType", "imageModel", "styleProfile", "cameraProfile", "lightingProfile", "prompt", "negativePrompt", "variables", "tags", "version"] as const;
  const csv = [csvHeaders.join(","), ...records.map((record) => csvHeaders.map((key) => {
    const value = record[key];
    return csvEscape(Array.isArray(value) ? value.join(" | ") : value);
  }).join(","))].join("\n");

  return [
    [contract.archetypeFile, JSON.stringify(archetypes, null, 2)],
    [contract.outputTypesFile, JSON.stringify(outputTypes, null, 2)],
    [contract.schemaFile, JSON.stringify(promptRecordSchema(), null, 2)],
    [contract.promptLibraryFile, JSON.stringify(records, null, 2)],
    [contract.promptLibraryJsonlFile, records.map((record) => JSON.stringify(record)).join("\n")],
    [contract.promptLibraryCsvFile, csv],
    [contract.cameraProfilesFile, JSON.stringify(config.cameras, null, 2)],
    [contract.lightingProfilesFile, JSON.stringify(config.lighting, null, 2)],
    [contract.styleProfilesFile, JSON.stringify(styleProfiles, null, 2)],
    [contract.promptVariablesFile, JSON.stringify(variables, null, 2)],
    [contract.negativePromptsFile, JSON.stringify({ default: config.negativePrompts }, null, 2)],
    [contract.catalogFile, promptCatalog(config, records)],
    [contract.readmeFile, readme(config, records.length)],
    [contract.importPromptFile, importPrompt(config)]
  ] as Array<[string, string]>;
}

function validate(config: LibraryConfig, records: PromptRecord[]) {
  const expected = config.archetypes.length * config.outputs.length;
  const ids = new Set<string>();
  const supportedVariables = new Set(config.variables);
  const errors: string[] = [];
  if (records.length !== expected) errors.push(`Expected ${expected} records, found ${records.length}.`);
  for (const record of records) {
    if (ids.has(record.id)) errors.push(`Duplicate prompt ID ${record.id}.`);
    ids.add(record.id);
    if (record.imageModel !== MODEL) errors.push(`${record.id} does not target ${MODEL}.`);
    if (!record.prompt || !record.negativePrompt || !record.cameraProfile || !record.lightingProfile) errors.push(`${record.id} is missing a production field.`);
    if (!record.prompt.includes("PSD-friendly") || !record.prompt.includes("Camera:") || !record.prompt.includes("Lighting:")) errors.push(`${record.id} is missing production composition rules.`);
    for (const variable of record.variables) if (!supportedVariables.has(variable)) errors.push(`${record.id} contains unsupported variable ${variable}.`);
  }
  if (errors.length) throw new Error(`${config.packageId} validation failed:\n${errors.slice(0, 20).join("\n")}`);
}

async function buildPackage(config: LibraryConfig) {
  const records = config.archetypes.flatMap((archetype) => config.outputs.map((outputType) => compileRecord(config, archetype, outputType)));
  validate(config, records);
  const directory = path.join(root, config.folder);
  await mkdir(directory, { recursive: true });
  const interchangeFiles = buildInterchangeFiles(config, records);
  const manifest = {
    id: config.packageId,
    volumeId: config.interchangeContract ? "VOLUME-IB" : undefined,
    displayName: config.packageName,
    packageVersion: VERSION,
    version: config.interchangeContract ? VERSION : undefined,
    engine: "Visual Production Engine",
    imageModel: MODEL,
    modelProfile: config.interchangeContract ? "nano-banana-2" : undefined,
    styleProfile: config.styleProfile,
    category: config.category,
    archetypeCount: config.archetypes.length,
    outputTypeCount: config.outputs.length,
    promptCount: records.length,
    promptRecordCount: config.interchangeContract ? records.length : undefined,
    files: config.interchangeContract
      ? ["manifest.json", ...interchangeFiles.map(([filename]) => filename)]
      : ["manifest.json", "prompt_library.json", "camera_profiles.json", "lighting_profiles.json", "negative_prompts.json", "render_profiles.json", config.plateFilename, "prompt_variables.json", "README.md", "IMPORT_PROMPT.txt"],
    validationStatus: "Ready"
  };
  const renderProfiles = [{ id: "nano-banana-2-production", imageModel: MODEL, styleProfile: config.styleProfile, defaultBackground: "pure black", onlyEnvironmentalOutputsUseEnvironment: true, extractionTarget: "layered PSD/PSB source master", outputPolicy: "Studio publishes approved game-ready derivatives only." }];
  const promptVariables = config.variables.map((name) => ({ name, token: `{{${name}}}`, required: true, source: "canonical Studio record or linked canonical world data" }));
  const writes = [writeFile(path.join(directory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)];
  if (config.interchangeContract) {
    writes.push(...interchangeFiles.map(([filename, contents]) => writeFile(path.join(directory, filename), `${contents}\n`)));
  } else {
    writes.push(
      writeFile(path.join(directory, "prompt_library.json"), `${JSON.stringify(records, null, 2)}\n`),
      writeFile(path.join(directory, "camera_profiles.json"), `${JSON.stringify(config.cameras, null, 2)}\n`),
      writeFile(path.join(directory, "lighting_profiles.json"), `${JSON.stringify(config.lighting, null, 2)}\n`),
      writeFile(path.join(directory, "negative_prompts.json"), `${JSON.stringify({ default: config.negativePrompts }, null, 2)}\n`),
      writeFile(path.join(directory, "render_profiles.json"), `${JSON.stringify(renderProfiles, null, 2)}\n`),
      writeFile(path.join(directory, config.plateFilename), `${JSON.stringify(config.plateProfiles, null, 2)}\n`),
      writeFile(path.join(directory, "prompt_variables.json"), `${JSON.stringify(promptVariables, null, 2)}\n`),
      writeFile(path.join(directory, "README.md"), readme(config, records.length)),
      writeFile(path.join(directory, "IMPORT_PROMPT.txt"), importPrompt(config))
    );
  }
  await Promise.all(writes);
  return { config, records };
}

async function verifyPackage(config: LibraryConfig) {
  const directory = path.join(root, config.folder);
  const promptsFile = config.interchangeContract?.promptLibraryFile ?? "prompt_library.json";
  const [manifestRaw, promptsRaw] = await Promise.all([readFile(path.join(directory, "manifest.json"), "utf8"), readFile(path.join(directory, promptsFile), "utf8")]);
  const manifest = JSON.parse(manifestRaw) as { promptCount?: number; promptRecordCount?: number; imageModel?: string; modelProfile?: string; validationStatus?: string };
  const records = JSON.parse(promptsRaw) as PromptRecord[];
  validate(config, records);
  if (manifest.promptCount !== records.length || manifest.imageModel !== MODEL || manifest.validationStatus !== "Ready" || (config.interchangeContract && (manifest.promptRecordCount !== records.length || manifest.modelProfile !== "nano-banana-2"))) throw new Error(`${config.packageId} manifest is inconsistent.`);
  if (!config.interchangeContract) for (const filename of ["camera_profiles.json", "lighting_profiles.json", "negative_prompts.json", "render_profiles.json", config.plateFilename, "prompt_variables.json", "README.md", "IMPORT_PROMPT.txt"]) await readFile(path.join(directory, filename), "utf8");
  if (config.interchangeContract) {
    const contract = config.interchangeContract;
    const required = [contract.archetypeFile, contract.outputTypesFile, contract.schemaFile, contract.promptLibraryFile, contract.promptLibraryJsonlFile, contract.promptLibraryCsvFile, contract.cameraProfilesFile, contract.lightingProfilesFile, contract.styleProfilesFile, contract.promptVariablesFile, contract.negativePromptsFile, contract.catalogFile, contract.readmeFile, contract.importPromptFile];
    for (const filename of required) await readFile(path.join(directory, filename), "utf8");
    const interchangeRecords = JSON.parse(await readFile(path.join(directory, contract.promptLibraryFile), "utf8")) as PromptRecord[];
    validate(config, interchangeRecords);
    const lines = (await readFile(path.join(directory, contract.promptLibraryJsonlFile), "utf8")).trim().split("\n");
    if (lines.length !== records.length) throw new Error(`${config.packageId} JSONL record count is inconsistent.`);
  }
  return records.length;
}

async function writeRegistry(packages: Array<{ config: LibraryConfig; records: PromptRecord[] }>) {
  const registry = {
    id: "noveris_visual_prompt_library_registry",
    version: VERSION,
    engine: "Visual Production Engine",
    packages: packages.map(({ config, records }) => ({
      id: config.packageId,
      displayName: config.packageName,
      category: config.category,
      packageVersion: VERSION,
      promptCount: records.length,
      manifestPath: `${config.folder}/manifest.json`,
      promptLibraryPath: `${config.folder}/${config.interchangeContract?.promptLibraryFile ?? "prompt_library.json"}`,
      validationStatus: "Ready"
    }))
  };
  await writeFile(path.join(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
}

async function verifyRegistry() {
  const registry = JSON.parse(await readFile(path.join(root, "registry.json"), "utf8")) as { packages?: Array<{ id: string; promptCount: number; validationStatus: string }> };
  const configs = [creatureConfig, plantConfig, avianConfig];
  if (!registry.packages || registry.packages.length !== configs.length) throw new Error("Visual prompt library registry must contain every canonical prompt package.");
  const expected = new Map(configs.map((config) => [config.packageId, config]));
  for (const item of registry.packages) {
    const config = expected.get(item.id);
    if (!config) throw new Error(`Visual prompt library registry contains an unknown package ${item.id}.`);
    if (item.promptCount !== config.archetypes.length * config.outputs.length || item.validationStatus !== "Ready") throw new Error(`Visual prompt library registry is inconsistent for ${item.id}.`);
  }
}

async function main() {
  const verifyOnly = process.argv.includes("--verify");
  if (verifyOnly) {
    const [creatures, plants, avians] = await Promise.all([verifyPackage(creatureConfig), verifyPackage(plantConfig), verifyPackage(avianConfig)]);
    await verifyRegistry();
    console.log(`Visual prompt libraries verified: ${creatures} mammalian prompts, ${plants} plant prompts, ${avians} avian prompts.`);
    return;
  }
  const [creatures, plants, avians] = await Promise.all([buildPackage(creatureConfig), buildPackage(plantConfig), buildPackage(avianConfig)]);
  await writeRegistry([creatures, plants, avians]);
  console.log(`Generated visual prompt libraries: ${creatures.records.length} mammalian prompts, ${plants.records.length} plant prompts, ${avians.records.length} avian prompts.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
