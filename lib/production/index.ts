export type CopyFormat = "plain" | "markdown" | "json";

export type ProductionCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  status?: string;
  notes?: string;
};

export type AssetSpecification = {
  id: string;
  title: string;
  description: string;
  sourceFiles: string[];
  surfaceMaps: Array<{ name: string; resolution: string; format: string; required: boolean }>;
  renderOutputs: Array<{ name: string; resolution: string; format: string }>;
  metadata: string[];
};

export type BlenderTemplate = {
  id: string;
  title: string;
  description: string;
  supportedOutputs: string[];
  version: string;
  status: string;
  notes: string;
};

export type RenderPipeline = {
  id: string;
  title: string;
  description: string;
  steps: string[];
};

export type AiPromptStandard = {
  id: string;
  title: string;
  purpose: string;
  promptTemplate: string;
  negativePrompt: string;
  lighting: string;
  camera: string;
  aspectRatio: string;
  resolution: string;
  notes: string;
};

export type FileNamingGroup = {
  id: string;
  title: string;
  examples: string[];
};

export type ExportProfile = {
  id: string;
  title: string;
  description: string;
  output: string;
  notes: string;
};

export type RuntimeTarget = {
  id: string;
  title: string;
  resolution: string;
  useCase: string;
  notes: string;
};

export type ProductionChecklist = {
  id: string;
  title: string;
  tasks: string[];
};

export const productionHomeCards: ProductionCard[] = [
  { id: "asset-specifications", title: "Asset Specifications", description: "Reference requirements for source files, maps, renders, metadata, and runtime outputs.", href: "/production/asset-specifications" },
  { id: "blender-templates", title: "Blender Templates", description: "Master scene templates and supported render outputs for asset creation.", href: "/production/blender-templates" },
  { id: "render-pipelines", title: "Render Pipelines", description: "Visual production workflows from canonical records to game-ready assets.", href: "/production/render-pipelines" },
  { id: "ai-prompt-standards", title: "AI Prompt Standards", description: "Prompt structures for generating consistent production references.", href: "/production/ai-prompt-standards" },
  { id: "file-naming-standards", title: "File Naming Standards", description: "Canonical naming examples for source, map, render, and thumbnail files.", href: "/production/file-naming-standards" },
  { id: "export-profiles", title: "Export Profiles", description: "Recommended output profiles for tools, runtime formats, and future targets.", href: "/production/export-profiles" },
  { id: "runtime-targets", title: "Runtime Targets", description: "Recommended delivery resolutions for desktop, mobile, web, marketing, and more.", href: "/production/runtime-targets" },
  { id: "production-checklists", title: "Production Checklists", description: "Reusable QA checklists for asset production tasks.", href: "/production/checklists" },
  { id: "tools-utilities", title: "Tools & Utilities", description: "Reference list of production tools used by the project.", href: "/production/tools" }
];

export const assetSpecifications: AssetSpecification[] = [
  {
    id: "planet",
    title: "Planet",
    description: "Canonical planet asset package for source, surface maps, renders, runtime derivatives, and metadata.",
    sourceFiles: ["Planet.blend", "Planet.psd (optional)"],
    surfaceMaps: [
      { name: "Diffuse", resolution: "4096x2048", format: "PNG", required: true },
      { name: "Normal", resolution: "4096x2048", format: "PNG", required: true },
      { name: "Roughness", resolution: "4096x2048", format: "PNG", required: true },
      { name: "Clouds", resolution: "4096x2048", format: "PNG", required: true },
      { name: "Emission", resolution: "4096x2048", format: "PNG", required: false },
      { name: "Ambient Occlusion", resolution: "4096x2048", format: "PNG", required: false },
      { name: "Height", resolution: "4096x2048", format: "EXR", required: false }
    ],
    renderOutputs: [
      { name: "Hero", resolution: "4096x4096", format: "PNG" },
      { name: "Card", resolution: "2048x2048", format: "PNG" },
      { name: "Library", resolution: "1024x1024", format: "PNG" },
      { name: "Thumbnail", resolution: "512x512", format: "PNG" },
      { name: "Icon", resolution: "64x64", format: "PNG" },
      { name: "Runtime", resolution: "Runtime", format: "WebP" }
    ],
    metadata: ["planet.json", "planet_seed.json", "generation_log.txt"]
  },
  ...["moon", "star", "gas-giant", "asteroid", "comet", "nebula", "galaxy", "sector", "star-system", "building", "resource", "ship", "vehicle", "character", "ui-icon", "background", "video", "marketing-image"].map((id) => ({
    id,
    title: id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
    description: "Production specification shell. Detailed source, render, metadata, and runtime rules can be authored here.",
    sourceFiles: ["Source file pending"],
    surfaceMaps: [],
    renderOutputs: ["Hero", "Card", "Library", "Thumbnail"].map((name) => ({ name, resolution: "Pending", format: "Pending" })),
    metadata: ["metadata.json"]
  }))
];

export const blenderTemplates: BlenderTemplate[] = [
  { id: "planet-master", title: "Planet_Master.blend", description: "Master procedural planet scene template.", supportedOutputs: ["Hero", "Card", "Library", "Thumbnail", "Icon"], version: "v1.0", status: "Reference", notes: "Use for spherical planets and terrestrial variants." },
  { id: "moon-master", title: "Moon_Master.blend", description: "Moon and small body scene template.", supportedOutputs: ["Hero", "Card", "Library", "Thumbnail"], version: "v1.0", status: "Reference", notes: "Use for rocky, frozen, and airless moons." },
  { id: "star-master", title: "Star_Master.blend", description: "Star emission and corona render template.", supportedOutputs: ["Hero", "Card", "Library", "Thumbnail"], version: "v1.0", status: "Reference", notes: "Use controlled bloom and preserve alpha passes where useful." },
  { id: "gasgiant-master", title: "GasGiant_Master.blend", description: "Gas giant banding, storms, and ring-support template.", supportedOutputs: ["Hero", "Card", "Library", "Thumbnail"], version: "v1.0", status: "Reference", notes: "Supports atmosphere and ring variants." },
  { id: "building-master", title: "Building_Master.blend", description: "Civilization building card and hero render template.", supportedOutputs: ["Hero", "Card", "Icon"], version: "v1.0", status: "Reference", notes: "Use era and class material variants." }
];

export const renderPipelines: RenderPipeline[] = [
  {
    id: "planet-render-pipeline",
    title: "Planet Render Pipeline",
    description: "Canonical planet render handoff from Studio record to runtime-ready assets.",
    steps: ["Planet Record", "Planet Seed", "Planet_Master.blend", "Render Queue", "Hero Render", "Runtime Assets", "Asset Library", "Game"]
  }
];

export const aiPromptStandards: AiPromptStandard[] = [
  {
    id: "planet-prompt-standard",
    title: "Planet Prompt Standard",
    purpose: "Generate visual reference concepts for planet production.",
    promptTemplate: "A cinematic NOVERIS planet asset reference for {planet_name}, showing {planet_class}, {atmosphere}, {surface_features}, high readability for game asset production.",
    negativePrompt: "No text, no UI, no watermark, no generic stock composition, no cropped subject.",
    lighting: "Cinematic directional light with clear silhouette and readable surface forms.",
    camera: "Three-quarter orbital view unless the asset role specifies card, icon, or surface detail.",
    aspectRatio: "1:1 for planet renders; 16:9 for hero and environment references.",
    resolution: "Use highest available generation size, then derive approved runtime sizes.",
    notes: "Prompt standards are references only. Final game assets are approved through Production and Asset Library."
  }
];

export const fileNamingGroups: FileNamingGroup[] = [
  {
    id: "planet-earth",
    title: "Planet Earth",
    examples: [
      "planet_earth_diffuse.png",
      "planet_earth_normal.png",
      "planet_earth_roughness.png",
      "planet_earth_clouds.png",
      "planet_earth_hero.png",
      "planet_earth_thumb.png",
      "planet_earth.blend",
      "planet_earth.psd"
    ]
  }
];

export const exportProfiles: ExportProfile[] = [
  { id: "blender", title: "Blender", description: "Source production profile.", output: ".blend", notes: "Keep source files private." },
  { id: "photoshop", title: "Photoshop", description: "Layered source and paint-over profile.", output: ".psd / .psb", notes: "Do not publish source masters directly." },
  { id: "webp", title: "WebP", description: "Runtime web image profile.", output: ".webp", notes: "Use for public runtime derivatives where appropriate." },
  { id: "png", title: "PNG", description: "Lossless transparent or source derivative profile.", output: ".png", notes: "Use when alpha or lossless detail is required." },
  { id: "runtime", title: "Runtime", description: "Game-consumable derivative profile.", output: "Optimized public paths", notes: "No local source paths." },
  { id: "future-unreal", title: "Future Unreal", description: "Future Unreal import target.", output: "TBD", notes: "Reference only." },
  { id: "future-unity", title: "Future Unity", description: "Future Unity import target.", output: "TBD", notes: "Reference only." },
  { id: "future-roblox", title: "Future Roblox", description: "Future Roblox asset target.", output: "TBD", notes: "Reference only." }
];

export const runtimeTargets: RuntimeTarget[] = [
  { id: "desktop", title: "Desktop", resolution: "High and ultra derivatives", useCase: "Primary desktop gameplay", notes: "Balance quality and runtime memory." },
  { id: "mobile", title: "Mobile", resolution: "Reduced texture tier", useCase: "Phone and tablet gameplay", notes: "Prefer smaller derivatives and readable silhouettes." },
  { id: "marketing", title: "Marketing", resolution: "4K source derivative", useCase: "Storefront, trailers, and press", notes: "Not used directly by runtime." },
  { id: "steam", title: "Steam", resolution: "Steam-ready crops", useCase: "Store capsules and screenshots", notes: "Future profile." },
  { id: "web", title: "Web", resolution: "WebP and PNG fallbacks", useCase: "Web client and browser previews", notes: "Public safe paths only." },
  { id: "future-console", title: "Future Console", resolution: "TBD", useCase: "Future platform work", notes: "Reference only." }
];

export const productionChecklists: ProductionChecklist[] = [
  { id: "planet", title: "Planet", tasks: ["Metadata complete", "Diffuse exported", "Normal exported", "Roughness exported", "Clouds exported", "Hero render complete", "Thumbnail complete", "Runtime WebP created", "QA passed", "Published"] },
  { id: "building", title: "Building", tasks: ["Source file linked", "Era style checked", "Card render complete", "Icon complete", "Runtime derivative created", "QA passed", "Published"] },
  { id: "ship", title: "Ship", tasks: ["Silhouette approved", "Source model linked", "Hero render complete", "Card render complete", "Runtime derivative created", "QA passed", "Published"] },
  { id: "ui", title: "UI", tasks: ["Component role confirmed", "Icon/background exported", "States reviewed", "Runtime derivative created", "QA passed", "Published"] },
  { id: "marketing", title: "Marketing", tasks: ["Composition approved", "Copy-safe export created", "Crop variants created", "QA passed", "Published"] }
];

export const toolsAndUtilities: ProductionCard[] = [
  { id: "blender", title: "Blender", description: "3D source creation and render scene authoring.", href: "/production/tools#blender" },
  { id: "photoshop", title: "Photoshop", description: "Layered paint-over and source art refinement.", href: "/production/tools#photoshop" },
  { id: "illustrator", title: "Illustrator", description: "Vector source art and icon work.", href: "/production/tools#illustrator" },
  { id: "higgsfield", title: "Higgsfield", description: "AI-assisted motion and visual exploration.", href: "/production/tools#higgsfield" },
  { id: "topaz", title: "Topaz", description: "Upscale and image enhancement utility.", href: "/production/tools#topaz" },
  { id: "substance", title: "Substance", description: "Material authoring and texture workflow.", href: "/production/tools#substance" },
  { id: "future-additions", title: "Future Additions", description: "Reserved for future production tools.", href: "/production/tools#future-additions" }
];

export function formatAssetSpecification(spec: AssetSpecification, format: CopyFormat) {
  if (format === "json") {
    return JSON.stringify(spec, null, 2);
  }

  const title = `${spec.title} Asset Specification`;
  const sourceFiles = spec.sourceFiles.map((item) => `- ${item}`).join("\n");
  const surfaceMaps = spec.surfaceMaps.length
    ? spec.surfaceMaps.map((item) => `- ${item.name} — ${item.resolution.replace("x", "×")} — ${item.format} — ${item.required ? "Required" : "Optional"}`).join("\n")
    : "- Pending";
  const renderOutputs = spec.renderOutputs.map((item) => `- ${formatRenderOutputLine(item)}`).join("\n");
  const metadata = spec.metadata.map((item) => `- ${item}`).join("\n");

  if (format === "markdown") {
    return `# ${title}\n\n## Source Files\n${sourceFiles}\n\n## Surface Maps\n${surfaceMaps}\n\n## Render Outputs\n${renderOutputs}\n\n## Metadata\n${metadata}`;
  }

  return `${title}\n\nSource Files\n${sourceFiles}\n\nSurface Maps\n${surfaceMaps}\n\nRender Outputs\n${renderOutputs}\n\nMetadata\n${metadata}`;
}

export function formatRenderOutputLine(item: AssetSpecification["renderOutputs"][number]) {
  if (/^runtime$/i.test(item.name) && /^runtime$/i.test(item.resolution)) {
    return `${item.name} — ${item.format}`;
  }
  return `${item.name} — ${item.resolution.replace("x", "×")} — ${item.format}`;
}

export function formatSection(title: string, lines: string[], format: CopyFormat) {
  if (format === "json") {
    return JSON.stringify({ title, items: lines }, null, 2);
  }
  const prefix = format === "markdown" ? `## ${title}` : title;
  return `${prefix}\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

export function formatPipeline(pipeline: RenderPipeline) {
  return pipeline.steps.join("\n→ ");
}

export function formatPromptStandard(prompt: AiPromptStandard, format: CopyFormat) {
  if (format === "json") return JSON.stringify(prompt, null, 2);
  const heading = format === "markdown" ? `# ${prompt.title}` : prompt.title;
  return [
    heading,
    "",
    `Purpose: ${prompt.purpose}`,
    "",
    "Prompt Template",
    prompt.promptTemplate,
    "",
    "Negative Prompt",
    prompt.negativePrompt,
    "",
    `Lighting: ${prompt.lighting}`,
    `Camera: ${prompt.camera}`,
    `Aspect Ratio: ${prompt.aspectRatio}`,
    `Resolution: ${prompt.resolution}`,
    "",
    `Notes: ${prompt.notes}`
  ].join("\n");
}

export function formatChecklist(checklist: ProductionChecklist) {
  return checklist.tasks.map((task) => `- [ ] ${task}`).join("\n");
}
