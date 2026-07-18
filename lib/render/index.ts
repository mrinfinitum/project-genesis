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

export type RendererParameterType = "Boolean" | "Integer" | "Float" | "String" | "Enum" | "Color" | "File" | "Vector2" | "Vector3";
export type RendererContractStatus = "Draft" | "Review" | "Approved" | "Deprecated";

export type RendererContractParameter = {
  key: string;
  displayName: string;
  description: string;
  type: RendererParameterType;
  defaultValue: string | number | boolean | Array<string | number>;
  minimum?: number;
  maximum?: number;
  required: boolean;
  unit?: string;
  enumOptions?: string[];
  rendererMapping: string;
  validation: string;
  notes: string;
};

export type RendererContractGroup = {
  id: string;
  name: string;
  parameters: RendererContractParameter[];
};

export type RendererContract = {
  id: string;
  name: string;
  version: string;
  status: RendererContractStatus;
  renderer: string;
  description: string;
  groups: RendererContractGroup[];
};

export type RendererContractValidationIssue = {
  key: string;
  message: string;
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

function parameter(
  key: string,
  type: RendererParameterType,
  description: string,
  defaultValue: RendererContractParameter["defaultValue"],
  options: Partial<Omit<RendererContractParameter, "key" | "type" | "description" | "defaultValue" | "displayName" | "required" | "rendererMapping" | "notes">> = {}
): RendererContractParameter {
  const displayName = key.split(".").pop()?.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? key;
  return {
    key,
    displayName,
    description,
    type,
    defaultValue,
    required: true,
    rendererMapping: `renderer.parameters.${key}`,
    validation: "Required default must match type and range.",
    notes: "Contract definition only. The Studio does not execute renderer code.",
    ...options
  };
}

export const planetRendererContract: RendererContract = {
  id: "planet-renderer-contract",
  name: "Planet Renderer Contract",
  version: "1.0.0",
  status: "Draft",
  renderer: "Any renderer / Blender-compatible adapter",
  description: "Schema-style contract describing what a future planet renderer expects. This does not perform rendering.",
  groups: [
    {
      id: "planet",
      name: "Planet",
      parameters: [
        parameter("planet.seed", "String", "Stable procedural seed.", "planet-seed"),
        parameter("planet.rotation", "Float", "Planet rotation in degrees.", 0, { minimum: 0, maximum: 360, unit: "degrees" }),
        parameter("planet.radius", "Float", "Canonical radius value.", 1, { minimum: 0.1, maximum: 100, unit: "earth radii" }),
        parameter("planet.scale", "Float", "Render scale multiplier.", 1, { minimum: 0.1, maximum: 10, unit: "multiplier" })
      ]
    },
    {
      id: "surface",
      name: "Surface",
      parameters: [
        parameter("surface.type", "Enum", "Surface material archetype.", "rocky", { enumOptions: ["rocky", "earthlike", "ocean", "desert", "frozen", "volcanic", "toxic", "crystal", "artificial"] }),
        parameter("surface.hue", "Float", "Surface hue control.", 180, { minimum: 0, maximum: 360, unit: "degrees" }),
        parameter("surface.saturation", "Float", "Surface saturation control.", 55, { minimum: 0, maximum: 100, unit: "%" }),
        parameter("surface.value", "Float", "Surface value/brightness control.", 60, { minimum: 0, maximum: 100, unit: "%" }),
        parameter("surface.oceanCoverage", "Float", "Ocean coverage percentage.", 35, { minimum: 0, maximum: 100, unit: "%" }),
        parameter("surface.mountainStrength", "Float", "Mountain displacement strength.", 0.35, { minimum: 0, maximum: 1, unit: "normalized" })
      ]
    },
    {
      id: "clouds",
      name: "Clouds",
      parameters: [
        parameter("clouds.enabled", "Boolean", "Cloud layer toggle.", true),
        parameter("clouds.density", "Float", "Cloud opacity/density control.", 0.45, { minimum: 0, maximum: 1, unit: "normalized" }),
        parameter("clouds.rotation", "Float", "Cloud layer rotation.", 0, { minimum: 0, maximum: 360, unit: "degrees" }),
        parameter("clouds.height", "Float", "Cloud shell height.", 1.03, { minimum: 1, maximum: 1.3, unit: "planet scale" }),
        parameter("clouds.brightness", "Float", "Cloud brightness control.", 0.8, { minimum: 0, maximum: 2, unit: "multiplier" })
      ]
    },
    {
      id: "atmosphere",
      name: "Atmosphere",
      parameters: [
        parameter("atmosphere.enabled", "Boolean", "Atmosphere toggle.", true),
        parameter("atmosphere.color", "Color", "Atmosphere color.", "#7dd3fc", { validation: "Required hex color in #RRGGBB format." }),
        parameter("atmosphere.density", "Float", "Atmosphere density.", 0.35, { minimum: 0, maximum: 1, unit: "normalized" }),
        parameter("atmosphere.glow", "Float", "Atmospheric glow strength.", 0.5, { minimum: 0, maximum: 2, unit: "multiplier" })
      ]
    },
    {
      id: "lighting",
      name: "Lighting",
      parameters: [
        parameter("lighting.temperature", "Integer", "Lighting temperature.", 6500, { minimum: 1000, maximum: 20000, unit: "kelvin" }),
        parameter("lighting.intensity", "Float", "Lighting intensity.", 1, { minimum: 0, maximum: 10, unit: "multiplier" }),
        parameter("lighting.nightLights", "Boolean", "Night-light city emission toggle.", false)
      ]
    },
    {
      id: "rings",
      name: "Rings",
      parameters: [
        parameter("rings.enabled", "Boolean", "Ring system toggle.", false),
        parameter("rings.size", "Float", "Ring size multiplier.", 1.5, { minimum: 0, maximum: 10, unit: "planet scale" }),
        parameter("rings.brightness", "Float", "Ring brightness control.", 0.7, { minimum: 0, maximum: 2, unit: "multiplier" })
      ]
    },
    {
      id: "moons",
      name: "Moons",
      parameters: [
        parameter("moons.count", "Integer", "Expected moon count for presentation.", 0, { minimum: 0, maximum: 24, unit: "moons" })
      ]
    },
    {
      id: "output",
      name: "Output",
      parameters: [
        parameter("output.profile", "Enum", "Named output profile.", "library", { enumOptions: ["hero", "card", "library", "thumbnail", "icon"] }),
        parameter("output.transparentBackground", "Boolean", "Render with transparent background.", false),
        parameter("output.fileFormat", "Enum", "Primary file format.", "webp", { enumOptions: ["png", "webp", "avif", "jpg"] })
      ]
    }
  ]
};

export const planetRenderContractFields: RenderContractField[] = planetRendererContract.groups.flatMap((group) =>
  group.parameters.map((field) => ({ path: field.key, type: field.type, description: field.description }))
);

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

function setNestedValue(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let current = target;
  for (const part of parts.slice(0, -1)) {
    const next = current[part];
    if (!next || typeof next !== "object" || Array.isArray(next)) current[part] = {};
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

function contractParameters(contract: RendererContract) {
  return contract.groups.flatMap((group) => group.parameters.map((parameter) => ({ group, parameter })));
}

function defaultMatchesType(parameter: RendererContractParameter) {
  const value = parameter.defaultValue;
  if (parameter.type === "Boolean") return typeof value === "boolean";
  if (parameter.type === "Integer") return typeof value === "number" && Number.isInteger(value);
  if (parameter.type === "Float") return typeof value === "number" && Number.isFinite(value);
  if (parameter.type === "String" || parameter.type === "Enum" || parameter.type === "Color" || parameter.type === "File") return typeof value === "string";
  if (parameter.type === "Vector2") return Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === "number");
  if (parameter.type === "Vector3") return Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === "number");
  return false;
}

export function rendererContractDefaults(contract: RendererContract = planetRendererContract) {
  const payload: Record<string, unknown> = {};
  for (const { parameter } of contractParameters(contract)) setNestedValue(payload, parameter.key, parameter.defaultValue);
  return payload;
}

export function validateRendererContract(contract: RendererContract = planetRendererContract) {
  const issues: RendererContractValidationIssue[] = [];
  const keyCounts = new Map<string, number>();

  for (const { group, parameter } of contractParameters(contract)) {
    const key = parameter.key.trim();
    keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
    if (!key.includes(".")) issues.push({ key, message: "Parameter key must use grouped dot notation." });
    if (parameter.required && (parameter.defaultValue === "" || parameter.defaultValue === null || typeof parameter.defaultValue === "undefined")) {
      issues.push({ key, message: "Required parameter is missing a default value." });
    }
    if (!defaultMatchesType(parameter)) issues.push({ key, message: `Default value does not match ${parameter.type}.` });
    if (typeof parameter.defaultValue === "number") {
      if (typeof parameter.minimum === "number" && parameter.defaultValue < parameter.minimum) issues.push({ key, message: "Default value is below minimum." });
      if (typeof parameter.maximum === "number" && parameter.defaultValue > parameter.maximum) issues.push({ key, message: "Default value is above maximum." });
      if (typeof parameter.minimum === "number" && typeof parameter.maximum === "number" && parameter.minimum > parameter.maximum) issues.push({ key, message: "Minimum cannot be greater than maximum." });
    }
    if (parameter.type === "Enum" && (!parameter.enumOptions?.length || !parameter.enumOptions.includes(String(parameter.defaultValue)))) {
      issues.push({ key, message: "Enum default must match one of the enum options." });
    }
    if (parameter.type === "Color" && typeof parameter.defaultValue === "string" && !/^#[0-9a-f]{6}$/i.test(parameter.defaultValue)) {
      issues.push({ key, message: "Color default must use #RRGGBB." });
    }
    if (parameter.rendererMapping.trim().length === 0) issues.push({ key, message: "Renderer mapping is required." });
    if (group.name.trim().length === 0) issues.push({ key, message: "Group name is required." });
  }

  for (const [key, count] of keyCounts) {
    if (count > 1) issues.push({ key, message: "Duplicate parameter key." });
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

export function rendererContractPayload(contract: RendererContract = planetRendererContract) {
  return {
    id: contract.id,
    name: contract.name,
    version: contract.version,
    status: contract.status,
    renderer: contract.renderer,
    description: contract.description,
    groups: contract.groups,
    defaults: rendererContractDefaults(contract),
    validation: validateRendererContract(contract)
  };
}

export function formatRendererContractEditor(format: CopyFormat, contract: RendererContract = planetRendererContract) {
  if (format === "json") return JSON.stringify(rendererContractPayload(contract), null, 2);
  const lines = contract.groups.flatMap((group) => [
    format === "markdown" ? `## ${group.name}` : group.name,
    ...group.parameters.map((parameter) => `- ${parameter.key} | ${parameter.type} | default: ${JSON.stringify(parameter.defaultValue)} | ${parameter.description}`)
  ]);
  if (format === "markdown") return `# ${contract.name}\n\nStatus: ${contract.status}\nRenderer: ${contract.renderer}\n\n${lines.join("\n")}`;
  return `${contract.name}\n\nStatus: ${contract.status}\nRenderer: ${contract.renderer}\n\n${lines.join("\n")}`;
}

export function formatRenderContract(format: CopyFormat) {
  if (format === "json") {
    return formatRendererContractEditor("json");
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
