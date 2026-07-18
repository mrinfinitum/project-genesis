import type { CopyFormat, ProductionCard } from "@/lib/production";

export type RendererTemplate = {
  id: string;
  name: string;
  version: string;
  description: string;
  status: string;
  renderer: string;
  outputTypes: string[];
};

export type RenderContractField = {
  path: string;
  type: string;
  description: string;
};

export type RenderProfile = {
  id: string;
  title: string;
  resolution: string;
  format: string;
  compression: string;
  lod: string;
  maps: string[];
};

export type RenderOutputDefinition = {
  id: string;
  title: string;
  resolution: string;
  format: string;
  purpose: string;
  runtimeUsage: string;
};

export const renderHomeCards: ProductionCard[] = [
  { id: "renderer-templates", title: "Renderer Templates", description: "Renderer template contracts for planets, moons, stars, buildings, ships, and future render engines.", href: "/render/templates" },
  { id: "render-queue", title: "Render Queue", description: "Status-only queue board for future external render work.", href: "/render/queue" },
  { id: "render-profiles", title: "Render Profiles", description: "Resolution, format, compression, LOD, and map recommendations.", href: "/render/profiles" },
  { id: "renderer-contracts", title: "Renderer Contracts", description: "Copy-ready parameter contracts for external render engines.", href: "/render/contracts" },
  { id: "render-outputs", title: "Render Outputs", description: "Canonical output definitions for renders, maps, metadata, and runtime assets.", href: "/render/outputs" },
  { id: "renderer-settings", title: "Renderer Settings", description: "Global placeholder settings for future renderer integrations.", href: "/render/settings" },
  { id: "batch-jobs", title: "Batch Jobs", description: "Disabled future actions for rendering selected, missing, updated, or all assets.", href: "/render/batch-jobs" },
  { id: "future-integrations", title: "Future Integrations", description: "External renderer and engine integration notes.", href: "/render/integrations" }
];

export const rendererTemplates: RendererTemplate[] = [
  { id: "planet-renderer", name: "Planet Renderer", version: "v1.0", description: "Future renderer template for planet assets and surface-map driven outputs.", status: "Contract Only", renderer: "Future NOVERIS Render Engine", outputTypes: ["Hero Render", "Card Render", "Library Render", "Thumbnail", "Icon", "Runtime Assets", "Surface Maps"] },
  { id: "moon-renderer", name: "Moon Renderer", version: "v1.0", description: "Future renderer template for moons and small rocky bodies.", status: "Contract Only", renderer: "Future NOVERIS Render Engine", outputTypes: ["Hero Render", "Card Render", "Library Render", "Thumbnail"] },
  { id: "star-renderer", name: "Star Renderer", version: "v1.0", description: "Future renderer template for stellar bodies, corona, glow, and star class presentation.", status: "Contract Only", renderer: "Future NOVERIS Render Engine", outputTypes: ["Hero Render", "Card Render", "Icon", "Emission Pass"] },
  { id: "gas-giant-renderer", name: "Gas Giant Renderer", version: "v1.0", description: "Future renderer template for banded giants, storms, atmosphere, and rings.", status: "Contract Only", renderer: "Future NOVERIS Render Engine", outputTypes: ["Hero Render", "Card Render", "Library Render", "Cloud Map"] },
  { id: "nebula-renderer", name: "Nebula Renderer", version: "v1.0", description: "Future renderer template for large-scale spatial cloud and background assets.", status: "Contract Only", renderer: "Future NOVERIS Render Engine", outputTypes: ["Background", "Hero Render", "Library Render"] },
  { id: "asteroid-renderer", name: "Asteroid Renderer", version: "v1.0", description: "Future renderer template for asteroid belts and individual asteroid bodies.", status: "Contract Only", renderer: "Future NOVERIS Render Engine", outputTypes: ["Hero Render", "Card Render", "Library Render", "Diffuse Map", "Normal Map"] },
  { id: "building-renderer", name: "Building Renderer", version: "v1.0", description: "Future renderer template for civilization building assets.", status: "Contract Only", renderer: "Future NOVERIS Render Engine", outputTypes: ["Hero Render", "Card Render", "Icon"] },
  { id: "ship-renderer", name: "Ship Renderer", version: "v1.0", description: "Future renderer template for ships and vehicles.", status: "Contract Only", renderer: "Future NOVERIS Render Engine", outputTypes: ["Hero Render", "Card Render", "Icon"] }
];

export const planetRenderContractFields: RenderContractField[] = [
  { path: "planet.seed", type: "string", description: "Stable procedural seed." },
  { path: "planet.rotation", type: "number", description: "Planet rotation in degrees." },
  { path: "planet.radius", type: "number", description: "Canonical radius value." },
  { path: "planet.scale", type: "number", description: "Render scale multiplier." },
  { path: "surface.type", type: "string", description: "Surface material archetype." },
  { path: "surface.hue", type: "number", description: "Surface hue control." },
  { path: "surface.saturation", type: "number", description: "Surface saturation control." },
  { path: "surface.value", type: "number", description: "Surface value/brightness control." },
  { path: "surface.oceanCoverage", type: "number", description: "Ocean coverage percentage." },
  { path: "surface.mountainStrength", type: "number", description: "Mountain displacement strength." },
  { path: "clouds.enabled", type: "boolean", description: "Cloud layer toggle." },
  { path: "clouds.density", type: "number", description: "Cloud opacity/density control." },
  { path: "clouds.rotation", type: "number", description: "Cloud layer rotation." },
  { path: "clouds.height", type: "number", description: "Cloud shell height." },
  { path: "clouds.brightness", type: "number", description: "Cloud brightness control." },
  { path: "atmosphere.enabled", type: "boolean", description: "Atmosphere toggle." },
  { path: "atmosphere.color", type: "string", description: "Atmosphere color." },
  { path: "atmosphere.density", type: "number", description: "Atmosphere density." },
  { path: "atmosphere.glow", type: "number", description: "Atmospheric glow strength." },
  { path: "lighting.temperature", type: "number", description: "Lighting temperature." },
  { path: "lighting.intensity", type: "number", description: "Lighting intensity." },
  { path: "lighting.nightLights", type: "boolean", description: "Night-light city emission toggle." },
  { path: "rings.enabled", type: "boolean", description: "Ring system toggle." },
  { path: "rings.size", type: "number", description: "Ring size multiplier." },
  { path: "rings.brightness", type: "number", description: "Ring brightness control." },
  { path: "moons.count", type: "number", description: "Expected moon count for presentation." }
];

export const planetRendererDetail = {
  rendererVersion: "v1.0",
  masterBlendFile: "Planet_Master.blend",
  supportedOutputs: ["Hero Render", "Card Render", "Library Render", "Thumbnail", "Icon", "Runtime WebP"],
  supportedParameters: planetRenderContractFields.map((field) => field.path),
  supportedMaps: ["Diffuse Map", "Normal Map", "Roughness Map", "Cloud Map", "Emission Map", "Height Map", "AO Map"],
  supportedRuntimeAssets: ["Hero", "Card", "Library", "Thumbnail", "Icon", "Runtime WebP", "Metadata"],
  futureBlenderIntegration: "Placeholder only. No Blender execution or Python subprocess integration is implemented in this task."
};

export const renderProfiles: RenderProfile[] = [
  { id: "desktop", title: "Desktop", resolution: "2048-4096", format: "WebP/PNG", compression: "Balanced", lod: "High", maps: ["Diffuse", "Normal", "Roughness", "Clouds"] },
  { id: "mobile", title: "Mobile", resolution: "512-2048", format: "WebP", compression: "High", lod: "Medium", maps: ["Diffuse", "Clouds"] },
  { id: "marketing", title: "Marketing", resolution: "4096+", format: "PNG", compression: "Lossless", lod: "Ultra", maps: ["Full render set"] },
  { id: "steam", title: "Steam", resolution: "Store crops", format: "PNG/JPG", compression: "Store-ready", lod: "High", maps: ["Hero", "Background"] },
  { id: "website", title: "Website", resolution: "Responsive", format: "WebP/AVIF", compression: "Optimized", lod: "Medium", maps: ["Hero", "Thumbnail"] },
  { id: "future-roblox", title: "Future Roblox", resolution: "TBD", format: "TBD", compression: "TBD", lod: "TBD", maps: ["TBD"] },
  { id: "future-unity", title: "Future Unity", resolution: "TBD", format: "TBD", compression: "TBD", lod: "TBD", maps: ["TBD"] },
  { id: "future-unreal", title: "Future Unreal", resolution: "TBD", format: "TBD", compression: "TBD", lod: "TBD", maps: ["TBD"] }
];

export const renderOutputs: RenderOutputDefinition[] = [
  { id: "hero-render", title: "Hero Render", resolution: "4096x4096", format: "PNG", purpose: "High-impact presentation image.", runtimeUsage: "Hero/detail screens where approved." },
  { id: "card-render", title: "Card Render", resolution: "2048x2048", format: "PNG/WebP", purpose: "Card browsing image.", runtimeUsage: "Card UIs and library tiles." },
  { id: "library-render", title: "Library Render", resolution: "1024x1024", format: "WebP", purpose: "Studio and client library browsing.", runtimeUsage: "Generated-record libraries." },
  { id: "thumbnail", title: "Thumbnail", resolution: "512x512", format: "WebP", purpose: "Fast preview.", runtimeUsage: "Small lists and pickers." },
  { id: "icon", title: "Icon", resolution: "64x64", format: "PNG/WebP", purpose: "Small symbolic representation.", runtimeUsage: "HUD, buttons, compact labels." },
  { id: "background", title: "Background", resolution: "16:9 variants", format: "WebP/PNG", purpose: "Backdrop and panel imagery.", runtimeUsage: "Screens and panels where approved." },
  { id: "diffuse-map", title: "Diffuse Map", resolution: "4096x2048", format: "PNG", purpose: "Surface color map.", runtimeUsage: "Future renderer/material input." },
  { id: "normal-map", title: "Normal Map", resolution: "4096x2048", format: "PNG", purpose: "Surface normal detail.", runtimeUsage: "Future renderer/material input." },
  { id: "roughness-map", title: "Roughness Map", resolution: "4096x2048", format: "PNG", purpose: "Surface roughness detail.", runtimeUsage: "Future renderer/material input." },
  { id: "cloud-map", title: "Cloud Map", resolution: "4096x2048", format: "PNG", purpose: "Cloud layer map.", runtimeUsage: "Future renderer/material input." },
  { id: "emission-map", title: "Emission Map", resolution: "4096x2048", format: "PNG", purpose: "Emission/night lights.", runtimeUsage: "Future renderer/material input." },
  { id: "height-map", title: "Height Map", resolution: "4096x2048", format: "EXR", purpose: "Displacement height data.", runtimeUsage: "Future renderer/material input." },
  { id: "ao-map", title: "AO Map", resolution: "4096x2048", format: "PNG", purpose: "Ambient occlusion data.", runtimeUsage: "Future renderer/material input." },
  { id: "metadata", title: "Metadata", resolution: "n/a", format: "JSON/TXT", purpose: "Render provenance and source metadata.", runtimeUsage: "Studio reference and future automation." }
];

export const renderQueueStatuses = ["Pending", "Queued", "Rendering", "Complete", "Failed"] as const;

export const globalRendererSettings = [
  { label: "Default Renderer", value: "Future NOVERIS Render Engine" },
  { label: "Preferred Resolution", value: "2048 card / 4096 hero" },
  { label: "Preferred Output", value: "WebP runtime derivatives" },
  { label: "Default Background", value: "Transparent or approved scene background" },
  { label: "Lighting Preset", value: "Studio cinematic key light" },
  { label: "Future Blender Path", value: "Placeholder" },
  { label: "Future Python Path", value: "Placeholder" },
  { label: "Future Render Farm", value: "Placeholder" }
];

export const batchJobs = ["Render Selected", "Render Missing", "Render Updated", "Render All"].map((title) => ({
  id: title.toLowerCase().replaceAll(" ", "-"),
  title,
  status: "Disabled Placeholder",
  description: "Future batch rendering action. No backend or rendering implementation exists yet."
}));

export const futureIntegrations = ["Blender", "Unreal", "Unity", "Godot", "Roblox", "Houdini"].map((title) => ({
  id: title.toLowerCase(),
  title,
  purpose: `Future ${title} integration reference.`,
  status: "Future",
  futureApi: "Not implemented"
}));

export const renderPipelineSteps = ["Planet Record", "Render Contract", "Renderer Template", "Render Queue", "Renderer", "Outputs", "Asset Library", "Game"];

export function formatRenderContract(format: CopyFormat) {
  if (format === "json") {
    return JSON.stringify({ id: "planet-render-contract", fields: planetRenderContractFields }, null, 2);
  }
  const lines = planetRenderContractFields.map((field) => `- ${field.path} — ${field.type} — ${field.description}`);
  if (format === "markdown") {
    return `# Planet Render Contract\n\n${lines.join("\n")}`;
  }
  return `Planet Render Contract\n\n${lines.join("\n")}`;
}

export function formatRendererTemplate(template: RendererTemplate) {
  return `${template.name}\nVersion: ${template.version}\nStatus: ${template.status}\nRenderer: ${template.renderer}\n\n${template.description}\n\nOutput Types\n- ${template.outputTypes.join("\n- ")}`;
}

export function formatRenderProfile(profile: RenderProfile) {
  return `${profile.title}\nResolution: ${profile.resolution}\nFormat: ${profile.format}\nCompression: ${profile.compression}\nLOD: ${profile.lod}\nMaps: ${profile.maps.join(", ")}`;
}

export function formatRenderOutput(output: RenderOutputDefinition) {
  return `${output.title}\nResolution: ${output.resolution}\nFormat: ${output.format}\nPurpose: ${output.purpose}\nRuntime Usage: ${output.runtimeUsage}`;
}
