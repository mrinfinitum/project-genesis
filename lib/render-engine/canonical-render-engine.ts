import type {
  RenderBlenderMapping,
  RenderFieldMapping,
  RenderParameterDefinition,
  RenderSurfaceModule,
  RenderSurfaceModuleId,
  RenderSurfaceProfile
} from "@/types/render-engine";

export const SURFACE_SHADER_SCHEMA_VERSION = "1.0.0" as const;
export const SURFACE_SHADER_RENDERER = "blender" as const;
export const SURFACE_SHADER_RENDERER_VERSION = "5.2-lts" as const;
export const CANONICAL_SURFACE_PROFILE_ID = "surface_profile_earth_v001";
export const CANONICAL_SURFACE_PROFILE_NAME = "Surface Profile Earth v001";
export const CANONICAL_SURFACE_MODIFIED_AT = "2026-07-18T00:00:00.000Z";

export const blenderMapping: RenderBlenderMapping = {
  objectName: "Planet Surface",
  materialName: "Surface_Profile_Earth_v001",
  nodes: {
    coordinates: "Planet Coordinates",
    mapping: "Planet Mapping",
    continentNoise: "Continent Noise",
    seaLevel: "Sea Level",
    continentMask: "Continent Mask",
    terrainDetail: "Terrain Detail Noise",
    terrainBlend: "Terrain Blend",
    mountainNoise: "Mountain Noise",
    elevationBlend: "Elevation Blend",
    elevation: "Elevation",
    terrainColor: "Terrain Color",
    landMaterial: "Land Material",
    oceanMaterial: "Ocean Material",
    terrainNormals: "Terrain Normals",
    surfaceMix: "Surface Mix",
    surfaceOutput: "Surface Output"
  }
};

const enumOptions = (defaultValue: string, options: string[], label: string, key: string): RenderParameterDefinition => ({
  key,
  label,
  type: "enum",
  defaultValue,
  options
});

const numberField = (key: string, label: string, defaultValue: number, min?: number, max?: number): RenderParameterDefinition => ({
  key,
  label,
  type: "number",
  defaultValue,
  min,
  max
});

const booleanField = (key: string, label: string, defaultValue: boolean): RenderParameterDefinition => ({
  key,
  label,
  type: "boolean",
  defaultValue
});

const readonlyField = (key: string, label: string, defaultValue: string): RenderParameterDefinition => ({
  key,
  label,
  type: "readonly",
  defaultValue,
  readonly: true
});

export const surfaceShaderModules: RenderSurfaceModule[] = [
  {
    id: "coordinates",
    title: "Coordinates",
    status: "Ready",
    responsibility: "Shared coordinate system for procedural textures.",
    blenderNodes: ["Planet Coordinates", "Planet Mapping"],
    parameters: [
      enumOptions("generated", ["generated", "object"], "Coordinate Source", "coordinateSource"),
      enumOptions("point", ["point", "texture", "vector", "normal"], "Mapping Type", "mappingType"),
      numberField("locationX", "Location X", 0),
      numberField("locationY", "Location Y", 0),
      numberField("locationZ", "Location Z", 0),
      numberField("rotationX", "Rotation X", 0),
      numberField("rotationY", "Rotation Y", 0),
      numberField("rotationZ", "Rotation Z", 0),
      numberField("scaleX", "Scale X", 1),
      numberField("scaleY", "Scale Y", 1),
      numberField("scaleZ", "Scale Z", 1)
    ]
  },
  {
    id: "planetGeneration",
    title: "Planet Generation",
    status: "Ready",
    responsibility: "Large-scale land/ocean distribution and coastline threshold.",
    blenderNodes: ["Continent Noise", "Sea Level", "Continent Mask"],
    parameters: [
      enumOptions("fBM", ["fBM"], "Continent Noise Type", "continentNoiseType"),
      enumOptions("3D", ["3D"], "Continent Dimensions", "continentDimensions"),
      booleanField("continentNormalize", "Normalize", true),
      numberField("continentScale", "Continent Scale", 1.5, 0.1, 100),
      numberField("continentDetail", "Continent Detail", 0.5, 0, 15),
      numberField("continentRoughness", "Continent Roughness", 0.35, 0, 1),
      numberField("continentLacunarity", "Continent Lacunarity", 2, 0, 10),
      numberField("continentDistortion", "Continent Distortion", 0, 0, 10),
      numberField("seaLevelFromMin", "Sea Level From Min", 0.3),
      numberField("seaLevelFromMax", "Sea Level From Max", 0.7),
      numberField("seaLevelToMin", "Sea Level To Min", 0),
      numberField("seaLevelToMax", "Sea Level To Max", 1),
      booleanField("seaLevelClamp", "Sea Level Clamp", true),
      enumOptions("constant", ["constant", "linear", "ease"], "Continent Mask Interpolation", "continentMaskInterpolation"),
      numberField("continentMaskBlackPosition", "Continent Mask Black Position", 0.46, 0, 1),
      numberField("continentMaskWhitePosition", "Continent Mask White Position", 0.47, 0, 1)
    ]
  },
  {
    id: "terrainGeneration",
    title: "Terrain Generation",
    status: "Ready",
    responsibility: "Medium-scale terrain variation within continents.",
    blenderNodes: ["Terrain Detail Noise", "Terrain Blend"],
    parameters: [
      enumOptions("fBM", ["fBM"], "Terrain Noise Type", "terrainNoiseType"),
      enumOptions("3D", ["3D"], "Terrain Dimensions", "terrainDimensions"),
      booleanField("terrainNormalize", "Normalize", true),
      numberField("terrainScale", "Terrain Scale", 8, 0.1, 100),
      numberField("terrainDetail", "Terrain Detail", 2, 0, 15),
      numberField("terrainRoughness", "Terrain Roughness", 0.5, 0, 1),
      numberField("terrainLacunarity", "Terrain Lacunarity", 2, 0, 10),
      numberField("terrainDistortion", "Terrain Distortion", 0, 0, 10),
      enumOptions("multiply", ["multiply", "add", "mix"], "Terrain Blend Mode", "terrainBlendMode"),
      numberField("terrainBlendFactor", "Terrain Blend Factor", 0.35, 0, 1),
      booleanField("terrainClampResult", "Clamp Result", false),
      booleanField("terrainClampFactor", "Clamp Factor", true)
    ]
  },
  {
    id: "elevation",
    title: "Elevation",
    status: "Ready",
    responsibility: "High-frequency mountain structure and final elevation remap.",
    blenderNodes: ["Mountain Noise", "Elevation Blend", "Elevation"],
    parameters: [
      enumOptions("fBM", ["fBM"], "Mountain Noise Type", "mountainNoiseType"),
      enumOptions("3D", ["3D"], "Mountain Dimensions", "mountainDimensions"),
      booleanField("mountainNormalize", "Mountain Normalize", true),
      numberField("mountainScale", "Mountain Scale", 24, 0.1, 100),
      numberField("mountainDetail", "Mountain Detail", 8, 0, 15),
      numberField("mountainRoughness", "Mountain Roughness", 0.65, 0, 1),
      numberField("mountainLacunarity", "Mountain Lacunarity", 2, 0, 10),
      numberField("mountainDistortion", "Mountain Distortion", 0, 0, 10),
      enumOptions("add", ["add", "multiply", "mix"], "Elevation Blend Mode", "elevationBlendMode"),
      numberField("elevationBlendFactor", "Elevation Blend Factor", 0.2, 0, 1),
      numberField("elevationFromMin", "Elevation From Min", 0.2),
      numberField("elevationFromMax", "Elevation From Max", 0.8),
      numberField("elevationToMin", "Elevation To Min", 0),
      numberField("elevationToMax", "Elevation To Max", 1),
      booleanField("elevationClamp", "Elevation Clamp", true)
    ]
  },
  {
    id: "landMaterial",
    title: "Land Material",
    status: "Ready",
    responsibility: "Maps elevation to a stylized Earth-like land palette and land shading.",
    blenderNodes: ["Terrain Color", "Land Material"],
    parameters: [
      enumOptions("linear", ["linear", "constant", "ease"], "Terrain Color Interpolation", "terrainColorInterpolation"),
      {
        key: "terrainColorStops",
        label: "Terrain Color Stops",
        type: "colorStops",
        defaultValue: [
          { position: 0.1, color: "#365C2C", label: "Lowland Green" },
          { position: 0.55, color: "#6F664E", label: "Highland Earth" },
          { position: 0.9, color: "#D8D3C6", label: "Mountain Stone" }
        ]
      },
      numberField("landMetallic", "Land Metallic", 0, 0, 1),
      numberField("landRoughness", "Land Roughness", 0.82, 0, 1),
      numberField("landIOR", "Land IOR", 1.5, 1, 3),
      numberField("landAlpha", "Land Alpha", 1, 0, 1)
    ]
  },
  {
    id: "oceanMaterial",
    title: "Ocean Material",
    status: "Ready",
    responsibility: "Water color and physically inspired surface response.",
    blenderNodes: ["Ocean Material"],
    parameters: [
      { key: "oceanBaseColor", label: "Ocean Base Color", type: "color", defaultValue: "#0F4D8A" },
      numberField("oceanMetallic", "Ocean Metallic", 0, 0, 1),
      numberField("oceanRoughness", "Ocean Roughness", 0.03, 0, 1),
      numberField("oceanIOR", "Ocean IOR", 1.333, 1, 3),
      numberField("oceanAlpha", "Ocean Alpha", 1, 0, 1)
    ]
  },
  {
    id: "surfaceDetail",
    title: "Surface Detail",
    status: "Ready",
    responsibility: "Converts elevation into lighting-visible relief.",
    blenderNodes: ["Terrain Normals"],
    parameters: [
      numberField("terrainNormalStrength", "Terrain Normal Strength", 0.15, 0, 1),
      numberField("terrainNormalDistance", "Terrain Normal Distance", 0.1, 0, 10),
      booleanField("terrainNormalInvert", "Terrain Normal Invert", false),
      numberField("terrainNormalFilterWidth", "Terrain Normal Filter Width", 0.1, 0, 10),
      booleanField("applyNormalsToLand", "Apply Normals To Land", true),
      booleanField("applyNormalsToOcean", "Apply Normals To Ocean", true)
    ]
  },
  {
    id: "output",
    title: "Output",
    status: "Ready",
    responsibility: "Combines land and ocean shaders using the continent mask and publishes the final surface shader.",
    blenderNodes: ["Surface Mix", "Surface Output"],
    parameters: [
      readonlyField("surfaceMixFactorSource", "Surface Mix Factor Source", "continentMask"),
      readonlyField("landShaderSource", "Land Shader Source", "landMaterial"),
      readonlyField("oceanShaderSource", "Ocean Shader Source", "oceanMaterial"),
      readonlyField("surfaceOutputTarget", "Surface Output Target", "surface")
    ]
  }
];

export const relatedRenderSystems = [
  { id: "clouds", label: "Clouds", status: "Not configured", note: "Read-only contract summary only. Surface Shader Editor does not author cloud shaders yet." },
  { id: "atmosphereGlow", label: "Atmosphere Glow", status: "Not configured", note: "Future renderer contract. No fake production functionality is attached." },
  { id: "atmosphereVolume", label: "Atmosphere Volume", status: "Not configured", note: "Future renderer contract. No fake production functionality is attached." },
  { id: "lighting", label: "Lighting", status: "Summary", note: "Game/Blender own lighting execution. Studio may later author lighting contracts." },
  { id: "camera", label: "Camera", status: "Summary", note: "Game/Blender own cameras. Studio stores presentation intent only." },
  { id: "background", label: "Background", status: "Not configured", note: "No placeholder backgrounds are generated here." },
  { id: "moons", label: "Moons", status: "Not configured", note: "Moon render profiles will use their own contracts later." },
  { id: "rings", label: "Rings", status: "Not configured", note: "Ring shader contracts are not configured." },
  { id: "compositor", label: "Compositor", status: "Summary", note: "External compositor execution is not connected." }
];

export const canonicalSurfaceShaderContract: RenderSurfaceProfile = {
  schemaVersion: SURFACE_SHADER_SCHEMA_VERSION,
  renderer: SURFACE_SHADER_RENDERER,
  rendererVersion: SURFACE_SHADER_RENDERER_VERSION,
  profileId: CANONICAL_SURFACE_PROFILE_ID,
  profileName: CANONICAL_SURFACE_PROFILE_NAME,
  profileType: "planet_surface",
  status: "Ready",
  modifiedAt: CANONICAL_SURFACE_MODIFIED_AT,
  coordinates: {
    coordinateSource: "generated",
    mappingType: "point",
    location: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  planetGeneration: {
    continentNoiseType: "fBM",
    continentDimensions: "3D",
    normalize: true,
    scale: 1.5,
    detail: 0.5,
    roughness: 0.35,
    lacunarity: 2,
    distortion: 0,
    seaLevel: { fromMin: 0.3, fromMax: 0.7, toMin: 0, toMax: 1, clamp: true },
    continentMask: { interpolation: "constant", blackPosition: 0.46, whitePosition: 0.47 }
  },
  terrainGeneration: {
    noiseType: "fBM",
    dimensions: "3D",
    normalize: true,
    scale: 8,
    detail: 2,
    roughness: 0.5,
    lacunarity: 2,
    distortion: 0,
    blendMode: "multiply",
    blendFactor: 0.35,
    clampResult: false,
    clampFactor: true
  },
  elevation: {
    mountainNoiseType: "fBM",
    mountainDimensions: "3D",
    mountainNormalize: true,
    mountainScale: 24,
    mountainDetail: 8,
    mountainRoughness: 0.65,
    mountainLacunarity: 2,
    mountainDistortion: 0,
    blendMode: "add",
    blendFactor: 0.2,
    fromMin: 0.2,
    fromMax: 0.8,
    toMin: 0,
    toMax: 1,
    clamp: true
  },
  landMaterial: {
    colorInterpolation: "linear",
    colorStops: [
      { position: 0.1, color: "#365C2C", label: "Lowland Green" },
      { position: 0.55, color: "#6F664E", label: "Highland Earth" },
      { position: 0.9, color: "#D8D3C6", label: "Mountain Stone" }
    ],
    metallic: 0,
    roughness: 0.82,
    ior: 1.5,
    alpha: 1
  },
  oceanMaterial: {
    baseColor: "#0F4D8A",
    metallic: 0,
    roughness: 0.03,
    ior: 1.333,
    alpha: 1
  },
  surfaceDetail: {
    normalStrength: 0.15,
    normalDistance: 0.1,
    normalInvert: false,
    normalFilterWidth: 0.1,
    applyToLand: true,
    applyToOcean: true
  },
  output: {
    mixFactorSource: "continentMask",
    landShaderSource: "landMaterial",
    oceanShaderSource: "oceanMaterial",
    target: "surface"
  },
  blenderMapping
};

export const blenderFieldMappings: RenderFieldMapping[] = [
  { studioField: "coordinateSource", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Planet Coordinates", blenderSocket: "Source" },
  { studioField: "mappingType", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Planet Mapping", blenderSocket: "Type" },
  { studioField: "location", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Planet Mapping", blenderSocket: "Location" },
  { studioField: "rotation", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Planet Mapping", blenderSocket: "Rotation" },
  { studioField: "scale", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Planet Mapping", blenderSocket: "Scale" },
  { studioField: "continentScale", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Continent Noise", blenderSocket: "Scale" },
  { studioField: "continentDetail", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Continent Noise", blenderSocket: "Detail" },
  { studioField: "continentRoughness", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Continent Noise", blenderSocket: "Roughness" },
  { studioField: "seaLevel", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Sea Level", blenderSocket: "Map Range" },
  { studioField: "continentMask", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Continent Mask", blenderSocket: "ColorRamp" },
  { studioField: "terrainScale", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Terrain Detail Noise", blenderSocket: "Scale" },
  { studioField: "terrainBlendFactor", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Terrain Blend", blenderSocket: "Factor" },
  { studioField: "mountainScale", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Mountain Noise", blenderSocket: "Scale" },
  { studioField: "elevationBlendFactor", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Elevation Blend", blenderSocket: "Factor" },
  { studioField: "elevation", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Elevation", blenderSocket: "Map Range" },
  { studioField: "terrainColorStops", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Terrain Color", blenderSocket: "ColorRamp" },
  { studioField: "landRoughness", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Land Material", blenderSocket: "Roughness" },
  { studioField: "oceanBaseColor", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Ocean Material", blenderSocket: "Base Color" },
  { studioField: "oceanRoughness", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Ocean Material", blenderSocket: "Roughness" },
  { studioField: "terrainNormalStrength", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Terrain Normals", blenderSocket: "Strength" },
  { studioField: "terrainNormalDistance", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Terrain Normals", blenderSocket: "Distance" },
  { studioField: "surfaceMixFactorSource", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Surface Mix", blenderSocket: "Factor" },
  { studioField: "surfaceOutputTarget", blenderObject: "Planet Surface", blenderMaterial: "Surface_Profile_Earth_v001", blenderNode: "Surface Output", blenderSocket: "Surface" }
];

export function cloneSurfaceProfile(profile: RenderSurfaceProfile = canonicalSurfaceShaderContract): RenderSurfaceProfile {
  return JSON.parse(JSON.stringify(profile)) as RenderSurfaceProfile;
}

export function createSurfaceProfile(profileId: string, profileName: string): RenderSurfaceProfile {
  return {
    ...cloneSurfaceProfile(canonicalSurfaceShaderContract),
    profileId,
    profileName,
    status: "Draft",
    modifiedAt: new Date().toISOString()
  };
}

export function duplicateSurfaceProfile(profile: RenderSurfaceProfile): RenderSurfaceProfile {
  return {
    ...cloneSurfaceProfile(profile),
    profileId: `${profile.profileId}_copy`,
    profileName: `${profile.profileName} Copy`,
    status: "Draft",
    modifiedAt: new Date().toISOString()
  };
}

export function resetSurfaceModule(profile: RenderSurfaceProfile, moduleId: RenderSurfaceModuleId): RenderSurfaceProfile {
  const canonical = canonicalSurfaceShaderContract;
  const next = cloneSurfaceProfile(profile);
  next.modifiedAt = new Date().toISOString();
  next[moduleId] = cloneSurfaceProfile(canonical)[moduleId] as never;
  return next;
}

export function getModuleContract(profile: RenderSurfaceProfile, moduleId: RenderSurfaceModuleId) {
  return profile[moduleId];
}

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function minifyJson(value: unknown) {
  return JSON.stringify(value);
}
