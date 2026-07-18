export const RENDER_LIBRARY_SCHEMA_VERSION = 1;

export const renderProfileCategories = ["Surface", "Clouds", "Atmosphere", "Lighting", "Camera", "Background", "Moons", "Rings", "Output"] as const;
export const renderProfileStatuses = ["Draft", "Review", "Approved", "Deprecated", "Archived"] as const;
export const renderProfileEngines = ["Blender", "Generic", "Roblox", "Web", "Unity", "Unreal", "Godot"] as const;

export type RenderProfileCategory = (typeof renderProfileCategories)[number];
export type RenderProfileStatus = (typeof renderProfileStatuses)[number];
export type RenderProfileEngine = (typeof renderProfileEngines)[number];
export type RenderValueType = "boolean" | "integer" | "float" | "string" | "enum" | "color" | "vector3";

export type RenderNumericValue = {
  type: "number";
  parameter: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  precision: number;
  description: string;
  studioExposed: boolean;
  blenderTarget: string;
};

export type RenderStringValue = {
  type: "string";
  parameter: string;
  value: string | boolean;
  unit: string;
  description: string;
  studioExposed: boolean;
  blenderTarget: string;
};

export type RenderColorValue = {
  type: "color";
  parameter: string;
  hex: string;
  rgb: [number, number, number];
  linearRgb?: [number, number, number];
  description: string;
  studioExposed: boolean;
  blenderTarget: string;
};

export type RenderColorRampValue = {
  type: "colorRamp";
  parameter: string;
  interpolation: string;
  stops: Array<{
    name: string;
    position: number;
    hex: string;
    rgb: [number, number, number];
  }>;
  description: string;
  studioExposed: boolean;
  blenderTarget: string;
};

export type RenderVector3Value = {
  type: "vector3";
  parameter: string;
  value: [number, number, number];
  unit: string;
  min: number;
  max: number;
  step: number;
  precision: number;
  description: string;
  studioExposed: boolean;
  blenderTarget: string;
};

export type RenderProfileValue = RenderNumericValue | RenderStringValue | RenderColorValue | RenderColorRampValue | RenderVector3Value;

export type RenderNode = {
  nodeId: string;
  nodeType: string;
  displayName: string;
  settings: Record<string, string | number | boolean>;
  inputs: string[];
  outputs: string[];
  positionHint: string;
  notes: string;
};

export type RenderNodeConnection = {
  fromNode: string;
  fromSocket: string;
  toNode: string;
  toSocket: string;
};

export type RenderNodeGraph = {
  nodes: RenderNode[];
  connections: RenderNodeConnection[];
};

export type RenderStudioContractEntry = {
  key: string;
  label: string;
  type: RenderValueType;
  defaultValue: string | number | boolean | [number, number, number];
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
  description: string;
  required: boolean;
  blenderTarget: string;
  studioEditable: boolean;
  runtimePublished: boolean;
};

export type RenderProfile = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: RenderProfileCategory;
  version: string;
  status: RenderProfileStatus;
  engine: RenderProfileEngine;
  renderer: string;
  objectName: string;
  materialName: string;
  blenderVersion: string;
  colorManagement: {
    viewTransform: string;
    look: string;
    exposure: number;
    gamma: number;
  };
  values: Record<string, RenderProfileValue[]>;
  nodeGraph: RenderNodeGraph;
  studioContract: RenderStudioContractEntry[];
  implementationNotes: string[];
  validationNotes: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type RenderLibraryValidationIssue = {
  profileId: string;
  field: string;
  message: string;
};

export type RenderLibraryValidationResult = {
  valid: boolean;
  issues: RenderLibraryValidationIssue[];
};

function rgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16)) as [number, number, number];
}

function exactNumber(parameter: string, value: number, blenderTarget: string, options: Partial<Omit<RenderNumericValue, "type" | "parameter" | "value" | "blenderTarget">> = {}): RenderNumericValue {
  return {
    type: "number",
    parameter,
    value,
    unit: "none",
    min: 0,
    max: 1,
    step: 0.01,
    precision: 2,
    description: `${parameter} exact Blender value.`,
    studioExposed: true,
    blenderTarget,
    ...options
  };
}

function exactString(parameter: string, value: string | boolean, blenderTarget: string, description = `${parameter} exact Blender value.`): RenderStringValue {
  return { type: "string", parameter, value, unit: "none", description, studioExposed: true, blenderTarget };
}

function exactColor(parameter: string, hex: string, blenderTarget: string, description = `${parameter} exact Blender color.`): RenderColorValue {
  return { type: "color", parameter, hex, rgb: rgb(hex), description, studioExposed: true, blenderTarget };
}

function contract(entry: Omit<RenderStudioContractEntry, "required" | "studioEditable" | "runtimePublished" | "description"> & { description?: string }): RenderStudioContractEntry {
  return {
    required: true,
    studioEditable: true,
    runtimePublished: false,
    description: entry.description ?? `${entry.label} exposed to Studio authoring only.`,
    ...entry
  };
}

export const renderProfilesLibrary: RenderProfile[] = [
  {
    id: "render-profile-surface-rock-v001",
    slug: "surface-profile-rock-v001",
    name: "Surface Profile — Rock v001",
    description: "Canonical procedural rocky-planet surface baseline using Noise, Voronoi, Mix, ColorRamp, Bump, and Principled BSDF.",
    category: "Surface",
    version: "v001",
    status: "Draft",
    engine: "Blender",
    renderer: "NOVERIS Planet Renderer",
    objectName: "Planet Surface",
    materialName: "Surface_Profile_Rock_v001",
    blenderVersion: "5.2 LTS",
    colorManagement: { viewTransform: "Filmic", look: "Medium High Contrast", exposure: 0, gamma: 1 },
    values: {
      "Noise Texture": [
        exactString("dimensions", "3D", "Noise Texture.Dimensions"),
        exactString("type", "fBM", "Noise Texture.Type"),
        exactString("normalize", true, "Noise Texture.Normalize"),
        exactNumber("scale", 8.0, "Noise Texture.Scale", { min: 1, max: 100, step: 1, precision: 1 }),
        exactNumber("detail", 2.0, "Noise Texture.Detail", { min: 0, max: 15, step: 0.1, precision: 1 }),
        exactNumber("roughness", 0.5, "Noise Texture.Roughness"),
        exactNumber("lacunarity", 2.0, "Noise Texture.Lacunarity", { min: 0, max: 10, step: 0.1, precision: 1 }),
        exactNumber("distortion", 0.0, "Noise Texture.Distortion", { min: 0, max: 10, step: 0.1, precision: 1 })
      ],
      "Voronoi Texture": [
        exactString("dimensions", "3D", "Voronoi Texture.Dimensions"),
        exactString("feature", "F1", "Voronoi Texture.Feature"),
        exactString("distanceMetric", "Euclidean", "Voronoi Texture.Distance Metric"),
        exactString("normalize", false, "Voronoi Texture.Normalize"),
        exactNumber("scale", 12.0, "Voronoi Texture.Scale", { min: 1, max: 100, step: 1, precision: 1 }),
        exactNumber("detail", 0.0, "Voronoi Texture.Detail", { min: 0, max: 15, step: 0.1, precision: 1 }),
        exactNumber("roughness", 0.5, "Voronoi Texture.Roughness"),
        exactNumber("lacunarity", 2.0, "Voronoi Texture.Lacunarity", { min: 0, max: 10, step: 0.1, precision: 1 }),
        exactNumber("randomness", 1.0, "Voronoi Texture.Randomness")
      ],
      "Mix Color": [
        exactString("dataType", "Color", "Mix Color.Data Type"),
        exactString("blendMode", "Mix", "Mix Color.Blend Mode"),
        exactString("clampResult", false, "Mix Color.Clamp Result"),
        exactString("clampFactor", true, "Mix Color.Clamp Factor"),
        exactNumber("factor", 0.25, "Mix Color.Factor")
      ],
      ColorRamp: [
        {
          type: "colorRamp",
          parameter: "rock_ramp",
          interpolation: "Linear",
          stops: [
            { name: "Dark Rock", position: 0.35, hex: "#4B4742", rgb: rgb("#4B4742") },
            { name: "Light Rock", position: 0.72, hex: "#CFC8BE", rgb: rgb("#CFC8BE") }
          ],
          description: "Rock surface tonal ramp.",
          studioExposed: true,
          blenderTarget: "ColorRamp.Elements"
        }
      ],
      "Principled BSDF": [
        exactString("baseColor", "driven by ColorRamp", "Principled BSDF.Base Color"),
        exactNumber("metallic", 0.0, "Principled BSDF.Metallic"),
        exactNumber("roughness", 0.8, "Principled BSDF.Roughness"),
        exactNumber("ior", 1.5, "Principled BSDF.IOR", { min: 1, max: 3, step: 0.01, precision: 2 }),
        exactNumber("alpha", 1.0, "Principled BSDF.Alpha")
      ],
      Bump: [
        exactString("invert", false, "Bump.Invert"),
        exactNumber("strength", 0.18, "Bump.Strength"),
        exactNumber("distance", 0.1, "Bump.Distance", { unit: "blender units" }),
        exactNumber("filterWidth", 0.1, "Bump.Filter Width", { unit: "px" })
      ]
    },
    nodeGraph: {
      nodes: [
        { nodeId: "noise_texture", nodeType: "ShaderNodeTexNoise", displayName: "Noise Texture", settings: { dimensions: "3D", type: "fBM", scale: 8.0 }, inputs: ["Vector"], outputs: ["Factor", "Color"], positionHint: "left:0 top:0", notes: "Primary broad rocky surface noise." },
        { nodeId: "voronoi_texture", nodeType: "ShaderNodeTexVoronoi", displayName: "Voronoi Texture", settings: { feature: "F1", distanceMetric: "Euclidean", scale: 12.0 }, inputs: ["Vector"], outputs: ["Distance", "Color"], positionHint: "left:0 top:220", notes: "Fracture and cell variation source." },
        { nodeId: "mix_color", nodeType: "ShaderNodeMix", displayName: "Mix Color", settings: { dataType: "Color", factor: 0.25 }, inputs: ["A", "B", "Factor"], outputs: ["Result"], positionHint: "left:260 top:80", notes: "Blends noise and Voronoi color." },
        { nodeId: "color_ramp", nodeType: "ShaderNodeValToRGB", displayName: "ColorRamp", settings: { interpolation: "Linear" }, inputs: ["Factor"], outputs: ["Color"], positionHint: "left:520 top:80", notes: "Maps blended values to rock colors." },
        { nodeId: "bump", nodeType: "ShaderNodeBump", displayName: "Bump", settings: { strength: 0.18, distance: 0.1 }, inputs: ["Height"], outputs: ["Normal"], positionHint: "left:520 top:300", notes: "Surface normal detail." },
        { nodeId: "principled_bsdf", nodeType: "ShaderNodeBsdfPrincipled", displayName: "Principled BSDF", settings: { metallic: 0, roughness: 0.8, ior: 1.5 }, inputs: ["Base Color", "Normal"], outputs: ["BSDF"], positionHint: "left:780 top:120", notes: "Final surface shader." },
        { nodeId: "material_output", nodeType: "ShaderNodeOutputMaterial", displayName: "Material Output", settings: {}, inputs: ["Surface"], outputs: [], positionHint: "left:1040 top:120", notes: "Required material output." }
      ],
      connections: [
        { fromNode: "noise_texture", fromSocket: "Color", toNode: "mix_color", toSocket: "A" },
        { fromNode: "voronoi_texture", fromSocket: "Color", toNode: "mix_color", toSocket: "B" },
        { fromNode: "mix_color", fromSocket: "Result", toNode: "color_ramp", toSocket: "Factor" },
        { fromNode: "color_ramp", fromSocket: "Color", toNode: "principled_bsdf", toSocket: "Base Color" },
        { fromNode: "noise_texture", fromSocket: "Factor", toNode: "bump", toSocket: "Height" },
        { fromNode: "bump", fromSocket: "Normal", toNode: "principled_bsdf", toSocket: "Normal" },
        { fromNode: "principled_bsdf", fromSocket: "BSDF", toNode: "material_output", toSocket: "Surface" }
      ]
    },
    studioContract: [
      contract({ key: "rock_scale", label: "Rock Scale", type: "float", defaultValue: 8.0, min: 1, max: 100, step: 1, precision: 1, unit: "none", blenderTarget: "Noise Texture.Scale" }),
      contract({ key: "fracture_scale", label: "Fracture Scale", type: "float", defaultValue: 12.0, min: 1, max: 100, step: 1, precision: 1, unit: "none", blenderTarget: "Voronoi Texture.Scale" }),
      contract({ key: "fracture_mix", label: "Fracture Mix", type: "float", defaultValue: 0.25, min: 0, max: 1, step: 0.01, precision: 2, unit: "ratio", blenderTarget: "Mix Color.Factor" }),
      contract({ key: "roughness", label: "Roughness", type: "float", defaultValue: 0.8, min: 0, max: 1, step: 0.01, precision: 2, unit: "ratio", blenderTarget: "Principled BSDF.Roughness" }),
      contract({ key: "bump_strength", label: "Bump Strength", type: "float", defaultValue: 0.18, min: 0, max: 1, step: 0.01, precision: 2, unit: "ratio", blenderTarget: "Bump.Strength" }),
      contract({ key: "bump_distance", label: "Bump Distance", type: "float", defaultValue: 0.1, min: 0, max: 1, step: 0.01, precision: 2, unit: "blender units", blenderTarget: "Bump.Distance" }),
      contract({ key: "dark_rock_color", label: "Dark Rock Color", type: "color", defaultValue: "#4B4742", blenderTarget: "ColorRamp.Dark Rock" }),
      contract({ key: "light_rock_color", label: "Light Rock Color", type: "color", defaultValue: "#CFC8BE", blenderTarget: "ColorRamp.Light Rock" })
    ],
    implementationNotes: ["Select Planet Surface.", "Confirm Surface_Profile_Rock_v001 material.", "Add Noise, Voronoi, Mix, ColorRamp, Bump, Principled BSDF, and Material Output nodes.", "Apply exact ColorRamp positions and HEX colors.", "Connect sockets exactly as documented.", "Confirm Blender 5.2 LTS before saving."],
    validationNotes: ["Runtime publication is disabled.", "ColorRamp stops must remain ordered.", "Material Output Surface connection is required."],
    tags: ["rock", "surface", "planet", "procedural", "blender"],
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z"
  },
  {
    id: "render-profile-cloud-v001",
    slug: "cloud-profile-v001",
    name: "Cloud Profile v001",
    description: "Canonical first procedural cloud layer using Noise, ColorRamp, Transparent BSDF, Principled BSDF, and Mix Shader.",
    category: "Clouds",
    version: "v001",
    status: "Draft",
    engine: "Blender",
    renderer: "NOVERIS Planet Renderer",
    objectName: "Cloud Sphere",
    materialName: "Cloud_Profile_v001",
    blenderVersion: "5.2 LTS",
    colorManagement: { viewTransform: "Filmic", look: "Medium High Contrast", exposure: 0, gamma: 1 },
    values: {
      "Cloud Sphere": [
        { type: "vector3", parameter: "scale", value: [1.015, 1.015, 1.015], unit: "object scale", min: 1, max: 2, step: 0.001, precision: 3, description: "Cloud shell scale.", studioExposed: true, blenderTarget: "Cloud Sphere.Scale" }
      ],
      "Noise Texture": [
        exactString("dimensions", "3D", "Noise Texture.Dimensions"),
        exactString("type", "fBM", "Noise Texture.Type"),
        exactString("normalize", true, "Noise Texture.Normalize"),
        exactNumber("scale", 12.0, "Noise Texture.Scale", { min: 1, max: 100, step: 1, precision: 1 }),
        exactNumber("detail", 2.0, "Noise Texture.Detail", { min: 0, max: 15, step: 0.1, precision: 1 }),
        exactNumber("roughness", 0.5, "Noise Texture.Roughness"),
        exactNumber("lacunarity", 2.0, "Noise Texture.Lacunarity", { min: 0, max: 10, step: 0.1, precision: 1 }),
        exactNumber("distortion", 0.0, "Noise Texture.Distortion", { min: 0, max: 10, step: 0.1, precision: 1 })
      ],
      ColorRamp: [
        {
          type: "colorRamp",
          parameter: "cloud_threshold_ramp",
          interpolation: "Linear",
          stops: [
            { name: "Transparent", position: 0.42, hex: "#000000", rgb: rgb("#000000") },
            { name: "Cloud", position: 0.58, hex: "#FFFFFF", rgb: rgb("#FFFFFF") }
          ],
          description: "Cloud opacity threshold ramp.",
          studioExposed: true,
          blenderTarget: "ColorRamp.Elements"
        }
      ],
      "Transparent BSDF": [exactColor("color", "#FFFFFF", "Transparent BSDF.Color")],
      "Principled BSDF": [
        exactColor("baseColor", "#FFFFFF", "Principled BSDF.Base Color"),
        exactNumber("metallic", 0.0, "Principled BSDF.Metallic"),
        exactNumber("roughness", 1.0, "Principled BSDF.Roughness"),
        exactNumber("ior", 1.5, "Principled BSDF.IOR", { min: 1, max: 3, step: 0.01, precision: 2 }),
        exactNumber("alpha", 1.0, "Principled BSDF.Alpha")
      ],
      "Mix Shader": [exactString("factor", "driven by ColorRamp", "Mix Shader.Factor")]
    },
    nodeGraph: {
      nodes: [
        { nodeId: "noise_texture", nodeType: "ShaderNodeTexNoise", displayName: "Noise Texture", settings: { dimensions: "3D", type: "fBM", scale: 12.0 }, inputs: ["Vector"], outputs: ["Factor", "Color"], positionHint: "left:0 top:0", notes: "Primary cloud mask source." },
        { nodeId: "color_ramp", nodeType: "ShaderNodeValToRGB", displayName: "ColorRamp", settings: { interpolation: "Linear" }, inputs: ["Factor"], outputs: ["Color"], positionHint: "left:260 top:0", notes: "Thresholds transparent/cloud regions." },
        { nodeId: "transparent_bsdf", nodeType: "ShaderNodeBsdfTransparent", displayName: "Transparent BSDF", settings: { color: "#FFFFFF" }, inputs: ["Color"], outputs: ["BSDF"], positionHint: "left:520 top:-80", notes: "Transparent layer shader." },
        { nodeId: "principled_bsdf", nodeType: "ShaderNodeBsdfPrincipled", displayName: "Principled BSDF", settings: { baseColor: "#FFFFFF", roughness: 1.0 }, inputs: ["Base Color"], outputs: ["BSDF"], positionHint: "left:520 top:120", notes: "Visible cloud shader." },
        { nodeId: "mix_shader", nodeType: "ShaderNodeMixShader", displayName: "Mix Shader", settings: { factor: "driven by ColorRamp" }, inputs: ["Factor", "Shader 1", "Shader 2"], outputs: ["Shader"], positionHint: "left:780 top:0", notes: "Mixes transparency and cloud surface." },
        { nodeId: "material_output", nodeType: "ShaderNodeOutputMaterial", displayName: "Material Output", settings: {}, inputs: ["Surface"], outputs: [], positionHint: "left:1040 top:0", notes: "Required material output." }
      ],
      connections: [
        { fromNode: "noise_texture", fromSocket: "Factor", toNode: "color_ramp", toSocket: "Factor" },
        { fromNode: "color_ramp", fromSocket: "Color", toNode: "mix_shader", toSocket: "Factor" },
        { fromNode: "transparent_bsdf", fromSocket: "BSDF", toNode: "mix_shader", toSocket: "Shader 1" },
        { fromNode: "principled_bsdf", fromSocket: "BSDF", toNode: "mix_shader", toSocket: "Shader 2" },
        { fromNode: "mix_shader", fromSocket: "Shader", toNode: "material_output", toSocket: "Surface" }
      ]
    },
    studioContract: [
      contract({ key: "cloud_scale", label: "Cloud Scale", type: "float", defaultValue: 12.0, min: 1, max: 100, step: 1, precision: 1, blenderTarget: "Noise Texture.Scale" }),
      contract({ key: "cloud_detail", label: "Cloud Detail", type: "float", defaultValue: 2.0, min: 0, max: 15, step: 0.1, precision: 1, blenderTarget: "Noise Texture.Detail" }),
      contract({ key: "cloud_roughness", label: "Cloud Roughness", type: "float", defaultValue: 0.5, min: 0, max: 1, step: 0.01, precision: 2, blenderTarget: "Noise Texture.Roughness" }),
      contract({ key: "cloud_threshold_low", label: "Cloud Threshold Low", type: "float", defaultValue: 0.42, min: 0, max: 1, step: 0.01, precision: 2, blenderTarget: "ColorRamp.Transparent.Position" }),
      contract({ key: "cloud_threshold_high", label: "Cloud Threshold High", type: "float", defaultValue: 0.58, min: 0, max: 1, step: 0.01, precision: 2, blenderTarget: "ColorRamp.Cloud.Position" }),
      contract({ key: "cloud_color", label: "Cloud Color", type: "color", defaultValue: "#FFFFFF", blenderTarget: "Principled BSDF.Base Color" }),
      contract({ key: "cloud_roughness_surface", label: "Cloud Surface Roughness", type: "float", defaultValue: 1.0, min: 0, max: 1, step: 0.01, precision: 2, blenderTarget: "Principled BSDF.Roughness" }),
      contract({ key: "cloud_shell_scale", label: "Cloud Shell Scale", type: "vector3", defaultValue: [1.015, 1.015, 1.015], blenderTarget: "Cloud Sphere.Scale" })
    ],
    implementationNotes: ["Select Cloud Sphere.", "Confirm Cloud_Profile_v001 material.", "Add Noise, ColorRamp, Transparent BSDF, Principled BSDF, Mix Shader, and Material Output nodes.", "Apply exact cloud threshold positions.", "Connect sockets exactly as documented.", "Confirm object scale is 1.015 on X, Y, and Z.", "Save in Blender 5.2 LTS."],
    validationNotes: ["Runtime publication is disabled.", "ColorRamp threshold stops must remain ordered.", "Material Output Surface connection is required."],
    tags: ["clouds", "planet", "procedural", "blender", "atmosphere"],
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z"
  }
];

export function getRenderProfileBySlug(slug: string) {
  return renderProfilesLibrary.find((profile) => profile.slug === slug || profile.id === slug);
}

export function renderProfileJson(profile: RenderProfile) {
  return JSON.stringify({
    schemaVersion: RENDER_LIBRARY_SCHEMA_VERSION,
    profileId: profile.slug,
    renderer: profile.renderer,
    engine: profile.engine,
    blenderVersion: profile.blenderVersion,
    category: profile.category,
    objectName: profile.objectName,
    materialName: profile.materialName,
    values: profile.values,
    nodeGraph: profile.nodeGraph,
    studioContract: profile.studioContract
  }, null, 2);
}

export function allRenderProfilesJson(profiles: RenderProfile[] = renderProfilesLibrary) {
  return JSON.stringify({ schemaVersion: RENDER_LIBRARY_SCHEMA_VERSION, profiles }, null, 2);
}

export function renderProfileExactValuesText(profile: RenderProfile) {
  return Object.entries(profile.values).flatMap(([group, values]) => [
    group,
    ...values.map((value) => {
      if (value.type === "number") return `- ${value.parameter}: ${value.value} ${value.unit} (${value.blenderTarget})`;
      if (value.type === "color") return `- ${value.parameter}: ${value.hex} rgb(${value.rgb.join(", ")}) (${value.blenderTarget})`;
      if (value.type === "colorRamp") return `- ${value.parameter}: ${value.stops.map((stop) => `${stop.name} ${stop.position} ${stop.hex}`).join(" / ")} (${value.blenderTarget})`;
      if (value.type === "vector3") return `- ${value.parameter}: ${value.value.join(", ")} ${value.unit} (${value.blenderTarget})`;
      return `- ${value.parameter}: ${String(value.value)} (${value.blenderTarget})`;
    })
  ]).join("\n");
}

export function renderProfileChecklist(profile: RenderProfile) {
  return [
    `Blender setup checklist — ${profile.name}`,
    `- Select object: ${profile.objectName}`,
    `- Confirm material: ${profile.materialName}`,
    "- Add required nodes",
    "- Apply exact values",
    "- Apply exact ColorRamp positions",
    "- Apply exact HEX colors",
    "- Connect exact sockets",
    "- Confirm Material Output",
    "- Confirm viewport mode",
    "- Confirm object scale",
    `- Save Blender version: ${profile.blenderVersion}`,
    "",
    ...profile.implementationNotes.map((note) => `- ${note}`)
  ].join("\n");
}

export function renderProfileStudioContractText(profile: RenderProfile) {
  return profile.studioContract.map((entry) => [
    `${entry.key}`,
    `  label: ${entry.label}`,
    `  type: ${entry.type}`,
    `  defaultValue: ${Array.isArray(entry.defaultValue) ? entry.defaultValue.join(", ") : entry.defaultValue}`,
    `  blenderTarget: ${entry.blenderTarget}`,
    `  studioEditable: ${entry.studioEditable}`,
    `  runtimePublished: ${entry.runtimePublished}`
  ].join("\n")).join("\n\n");
}

export function renderProfileSpecification(profile: RenderProfile) {
  return [
    profile.name,
    `Slug: ${profile.slug}`,
    `Category: ${profile.category}`,
    `Version: ${profile.version}`,
    `Status: ${profile.status}`,
    `Renderer: ${profile.renderer}`,
    `Engine: ${profile.engine}`,
    `Object: ${profile.objectName}`,
    `Material: ${profile.materialName}`,
    `Blender: ${profile.blenderVersion}`,
    "",
    profile.description,
    "",
    "Exact Values",
    renderProfileExactValuesText(profile),
    "",
    "Studio Contract",
    renderProfileStudioContractText(profile),
    "",
    "Implementation Notes",
    profile.implementationNotes.map((note) => `- ${note}`).join("\n")
  ].join("\n");
}

function validHex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function validateRenderProfiles(profiles: RenderProfile[] = renderProfilesLibrary): RenderLibraryValidationResult {
  const issues: RenderLibraryValidationIssue[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const validCategories = new Set<string>(renderProfileCategories);
  const validStatuses = new Set<string>(renderProfileStatuses);

  for (const profile of profiles) {
    const add = (field: string, message: string) => issues.push({ profileId: profile.id || "unknown", field, message });
    if (seenIds.has(profile.id)) add("id", `Duplicate profile ID: ${profile.id}`);
    seenIds.add(profile.id);
    if (seenSlugs.has(profile.slug)) add("slug", `Duplicate slug: ${profile.slug}`);
    seenSlugs.add(profile.slug);
    if (!validStatuses.has(profile.status)) add("status", `Invalid status: ${profile.status}`);
    if (!validCategories.has(profile.category)) add("category", `Invalid category: ${profile.category}`);
    if (!profile.version) add("version", "Missing version.");
    if (!profile.objectName) add("objectName", "Missing objectName.");
    if (!profile.materialName) add("materialName", "Missing materialName.");

    for (const [group, values] of Object.entries(profile.values)) {
      for (const value of values) {
        if (!value.blenderTarget) add(`values.${group}.${value.parameter}`, "Missing Blender target.");
        if (value.type === "number") {
          if (value.value < value.min || value.value > value.max) add(`values.${group}.${value.parameter}`, "Numeric default outside min/max.");
          if (value.step <= 0) add(`values.${group}.${value.parameter}`, "Invalid step.");
        }
        if (value.type === "vector3") {
          if (value.value.some((part) => part < value.min || part > value.max)) add(`values.${group}.${value.parameter}`, "Vector default outside min/max.");
          if (value.step <= 0) add(`values.${group}.${value.parameter}`, "Invalid step.");
        }
        if (value.type === "color" && !validHex(value.hex)) add(`values.${group}.${value.parameter}`, `Invalid HEX: ${value.hex}`);
        if (value.type === "colorRamp") {
          let lastPosition = -Infinity;
          for (const stop of value.stops) {
            if (!validHex(stop.hex)) add(`values.${group}.${value.parameter}`, `Invalid HEX: ${stop.hex}`);
            if (stop.position < 0 || stop.position > 1) add(`values.${group}.${value.parameter}`, `ColorRamp position outside 0-1: ${stop.position}`);
            if (stop.position < lastPosition) add(`values.${group}.${value.parameter}`, "ColorRamp stops out of order.");
            lastPosition = stop.position;
          }
        }
      }
    }

    const nodeIds = new Set(profile.nodeGraph.nodes.map((node) => node.nodeId));
    const contractKeys = new Set<string>();
    for (const entry of profile.studioContract) {
      if (contractKeys.has(entry.key)) add("studioContract", `Duplicate Studio contract key: ${entry.key}`);
      contractKeys.add(entry.key);
      if (!entry.blenderTarget) add(`studioContract.${entry.key}`, "Missing Blender target.");
      if (entry.runtimePublished) add(`studioContract.${entry.key}`, "Render Library profiles must not publish to gameplay runtime.");
      if (typeof entry.defaultValue === "number" && typeof entry.min === "number" && typeof entry.max === "number" && (entry.defaultValue < entry.min || entry.defaultValue > entry.max)) {
        add(`studioContract.${entry.key}`, "Numeric default outside min/max.");
      }
      if (typeof entry.step === "number" && entry.step <= 0) add(`studioContract.${entry.key}`, "Invalid step.");
      if (entry.type === "color" && typeof entry.defaultValue === "string" && !validHex(entry.defaultValue)) add(`studioContract.${entry.key}`, `Invalid HEX: ${entry.defaultValue}`);
    }
    for (const connection of profile.nodeGraph.connections) {
      if (!nodeIds.has(connection.fromNode)) add("nodeGraph.connections", `Connection references missing fromNode: ${connection.fromNode}`);
      if (!nodeIds.has(connection.toNode)) add("nodeGraph.connections", `Connection references missing toNode: ${connection.toNode}`);
    }
    if (!profile.nodeGraph.connections.some((connection) => connection.toNode === "material_output" && connection.toSocket === "Surface")) {
      add("nodeGraph.connections", "Missing Material Output Surface connection.");
    }
  }

  return { valid: issues.length === 0, issues };
}
