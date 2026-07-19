import type {
  CameraProfile,
  CloudRenderProfile,
  CompositorProfile,
  LightingRigProfile,
  PlanetRenderContract,
  RenderEngineDefinition,
  RenderLayerDefinition,
  RenderOutputProfile,
  RenderParameter,
  RenderProfile,
  SurfaceRenderProfile,
  WorldProfile
} from "@/types/render-engine";

const notCalibrated = "Not yet calibrated";

export const noverisPlanetRenderEngine: RenderEngineDefinition = {
  id: "noveris-planet-renderer-v1",
  name: "NOVERIS Planet Render Engine",
  version: "1.0",
  renderer: "Blender",
  blenderVersion: "5.2 LTS",
  primaryEngine: "Eevee Next",
  compatibleEngine: "Cycles",
  assetType: "Planet",
  templateId: "noveris-planet-renderer-v1",
  execution: "External only",
  studioResponsibility: "Definitions, profiles, contracts, validation, versioning, and exports",
  blenderResponsibility: "Scene evaluation, node execution, rendering, and generated images",
  badges: ["Version 1.0", "Blender 5.2 LTS", "Eevee Next", "Canonical", "Studio Managed"]
};

export const planetRenderLayers: RenderLayerDefinition[] = [
  {
    id: "surface",
    order: 1,
    layerName: "Planet Surface",
    objectName: "Planet Surface",
    materialProfile: "Surface_Profile_Rock_v001",
    scale: 1.0,
    required: true,
    purpose: "Terrain, oceans, ice, roughness, relief, and the primary visible planetary appearance.",
    supportedRenderer: "Blender 5.2 LTS / Eevee Next / Cycles",
    validationStatus: "Canonical",
    profileId: "Surface_Profile_Rock_v001"
  },
  {
    id: "clouds",
    order: 2,
    layerName: "Cloud Sphere",
    objectName: "Cloud Sphere",
    materialProfile: "Cloud_Profile_v001",
    scale: 1.015,
    required: false,
    purpose: "Procedural cloud coverage, storms, weather bands, and atmospheric movement.",
    supportedRenderer: "Blender 5.2 LTS / Eevee Next / Cycles",
    validationStatus: "Canonical",
    profileId: "Cloud_Profile_v001"
  },
  {
    id: "atmosphereGlow",
    order: 3,
    layerName: "Atmosphere Glow",
    objectName: "Atmosphere Glow",
    materialProfile: "Atmosphere_Glow_Profile_v001",
    scale: 1.025,
    required: false,
    purpose: "Thin real-time atmospheric limb, edge glow, and silhouette separation.",
    supportedRenderer: "Blender 5.2 LTS / Eevee Next primary / Cycles compatible",
    validationStatus: "Pending Validation",
    profileId: "Atmosphere_Glow_Profile_v001"
  },
  {
    id: "atmosphereVolume",
    order: 4,
    layerName: "Atmosphere Volume",
    objectName: "Atmosphere Volume",
    materialProfile: "Atmosphere_Volume_Profile_v001",
    scale: 1.08,
    required: false,
    purpose: "Volumetric scattering, haze, density, and atmospheric depth.",
    supportedRenderer: "Blender 5.2 LTS / Eevee Next primary / Cycles compatible",
    validationStatus: "Canonical Draft",
    profileId: "Atmosphere_Volume_Profile_v001"
  } as RenderLayerDefinition
];

export const surfaceProfileRock: SurfaceRenderProfile = {
  id: "Surface_Profile_Rock_v001",
  category: "Surface",
  status: "Canonical",
  renderer: "Blender 5.2 LTS",
  supportedEngines: ["Eevee Next", "Cycles"],
  objectName: "Planet Surface",
  objectScale: 1.0,
  geometry: ["UV Sphere or Icosphere", "Shade Smooth enabled", "Subdivision Surface viewport level: 2", "Subdivision Surface render level: 2"],
  materialValues: {
    noiseTexture: { scale: 8.0, detail: 2.0, roughness: 0.5 },
    voronoiTexture: { scale: 12.0, randomness: 1.0 },
    mix: { factor: 0.25 },
    colorRamp: {
      interpolation: "Linear",
      darkStop: { name: "Dark stop", position: 0.35, hex: "#4B4742" },
      lightStop: { name: "Light stop", position: 0.72, hex: "#CFC8BE" }
    },
    bump: { strength: 0.18, distance: 0.1 },
    principledBsdf: { roughness: 0.8 }
  },
  nodeFlow: [
    "Noise Texture + Voronoi Texture -> Mix -> ColorRamp -> Principled BSDF Base Color",
    "Noise Texture -> Bump Height -> Principled BSDF Normal"
  ],
  editableParameters: [
    "surfaceNoiseScale",
    "surfaceNoiseDetail",
    "surfaceNoiseRoughness",
    "surfaceVoronoiScale",
    "surfaceVoronoiRandomness",
    "surfaceMixFactor",
    "surfaceDarkColor",
    "surfaceDarkPosition",
    "surfaceLightColor",
    "surfaceLightPosition",
    "surfaceBumpStrength",
    "surfaceBumpDistance",
    "surfaceRoughness"
  ]
};

export const cloudProfile: CloudRenderProfile = {
  id: "Cloud_Profile_v001",
  category: "Clouds",
  status: "Canonical",
  renderer: "Blender 5.2 LTS",
  supportedEngines: ["Eevee Next", "Cycles"],
  objectName: "Cloud Sphere",
  objectScale: 1.015,
  materialValues: {
    noiseTexture: { scale: 12.0, detail: 2.0, roughness: 0.5 },
    colorRamp: { interpolation: "Linear", blackStopPosition: 0.42, whiteStopPosition: 0.58 },
    principledBsdf: { baseColor: "#FFFFFF", roughness: 1.0 }
  },
  nodeFlow: [
    "Noise Texture -> ColorRamp -> Mix Shader Factor",
    "Transparent BSDF -> Mix Shader input 1",
    "Principled BSDF -> Mix Shader input 2",
    "Mix Shader -> Material Output Surface"
  ],
  editableParameters: [
    "cloudEnabled",
    "cloudScale",
    "cloudNoiseScale",
    "cloudNoiseDetail",
    "cloudNoiseRoughness",
    "cloudThresholdLow",
    "cloudThresholdHigh",
    "cloudColor",
    "cloudRoughness",
    "cloudOpacity",
    "cloudRotationSpeed"
  ]
};

const glowParams: RenderParameter[] = [
  { key: "atmosphereGlowEnabled", label: "Atmosphere Glow Enabled", value: true },
  { key: "atmosphereGlowColor", label: "Atmosphere Glow Color", value: "#6FB8FF" },
  { key: "atmosphereGlowStrength", label: "Atmosphere Glow Strength", value: 1.5 },
  { key: "atmosphereGlowScale", label: "Atmosphere Glow Scale", value: 1.025 },
  { key: "atmosphereGlowFalloff", label: "Atmosphere Glow Falloff", value: 0.5 },
  { key: "atmosphereGlowInnerThreshold", label: "Atmosphere Glow Inner Threshold", value: 0.65 },
  { key: "atmosphereGlowOuterThreshold", label: "Atmosphere Glow Outer Threshold", value: 0.95 },
  { key: "renderMethod", label: "Render Method", value: "Blended" },
  { key: "backfaceCullingCamera", label: "Backface Culling Camera", value: false },
  { key: "transparentShadows", label: "Transparent Shadows", value: true },
  { key: "thicknessMode", label: "Thickness Mode", value: "Sphere" }
];

export const atmosphereGlowProfile: RenderProfile = {
  id: "Atmosphere_Glow_Profile_v001",
  category: "Atmosphere Glow",
  status: "Pending Validation",
  renderer: "Blender 5.2 LTS",
  supportedEngines: ["Eevee Next", "Cycles"],
  objectName: "Atmosphere Glow",
  objectScale: 1.025,
  implementation: "Surface shader",
  purpose: "Fast real-time atmospheric edge glow and silhouette separation.",
  warning: "Final Blender 5.2 node implementation remains under validation. Canonical parameters are approved, but the final node graph must not be labeled Ready until validated in Blender.",
  approvedParameters: glowParams,
  nodeFlow: null,
  editableParameters: glowParams.map((param) => param.key)
};

export const atmosphereVolumeProfile: RenderProfile = {
  id: "Atmosphere_Volume_Profile_v001",
  category: "Atmosphere Volume",
  status: "Canonical Draft",
  renderer: "Blender 5.2 LTS",
  supportedEngines: ["Eevee Next", "Cycles"],
  objectName: "Atmosphere Volume",
  objectScale: 1.08,
  purpose: "Optional volumetric scattering, haze, density, and atmospheric depth.",
  shader: "Principled Volume",
  approvedValues: { color: "#6FB8FF", density: 0.02, anisotropy: 0.3 },
  qualityModes: ["Disabled", "Preview", "Standard", "Hero"],
  defaultQuality: "Preview",
  nodeFlow: ["Principled Volume -> Material Output Volume"],
  editableParameters: [
    "atmosphereVolumeEnabled",
    "atmosphereVolumeColor",
    "atmosphereVolumeDensity",
    "atmosphereVolumeAnisotropy",
    "atmosphereVolumeScale",
    "atmosphereVolumeEmissionStrength",
    "atmosphereVolumeAbsorptionColor",
    "atmosphereVolumeQuality"
  ]
};

export const layerProfiles: RenderProfile[] = [surfaceProfileRock, cloudProfile, atmosphereGlowProfile, atmosphereVolumeProfile];

function uncalibratedField(key: string): RenderParameter {
  return { key, label: key, value: notCalibrated, status: "Draft", editable: true };
}

export const lightingRig: LightingRigProfile = {
  id: "three-light-planet-rig",
  title: "Three-Light Planet Rig",
  lights: [
    { id: "sun-key", name: "SUN KEY", type: "Sun", required: true, purpose: "Primary directional illumination", fields: ["keyEnabled", "keyEnergy", "keyAngle", "keyColor", "keyRotationX", "keyRotationY", "keyRotationZ"].map(uncalibratedField) },
    { id: "fill-light", name: "FILL LIGHT", type: "Area", required: false, purpose: "Controls shadow-side detail", fields: ["fillEnabled", "fillEnergy", "fillSize", "fillColor", "fillRotationX", "fillRotationY", "fillRotationZ"].map(uncalibratedField) },
    { id: "rim-light", name: "RIM LIGHT", type: "Area", required: false, purpose: "Adds silhouette separation and a controlled edge accent", fields: ["rimEnabled", "rimEnergy", "rimSize", "rimColor", "rimRotationX", "rimRotationY", "rimRotationZ"].map(uncalibratedField) }
  ]
};

const cameraFields = ["cameraProfileId", "cameraName", "lens", "locationX", "locationY", "locationZ", "rotationX", "rotationY", "rotationZ", "frameFillPercent", "resolutionWidth", "resolutionHeight", "enabled", "status"];

export const cameraProfiles: CameraProfile[] = [
  { id: "hero-camera", name: "Hero Camera", objectName: "Planet Camera", lens: "80 mm", location: { x: 0, y: -8, z: 0 }, targetFraming: "Planet fills approximately 75-80% of the frame.", status: "Canonical Draft", editableFields: cameraFields },
  ...["Card Camera", "Encyclopedia Camera", "Thumbnail Camera", "Cinematic Camera"].map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    objectName: notCalibrated,
    lens: notCalibrated,
    location: { x: notCalibrated, y: notCalibrated, z: notCalibrated },
    targetFraming: notCalibrated,
    status: "Draft" as const,
    editableFields: cameraFields
  }))
];

export const worldProfile: WorldProfile = {
  id: "Background_Profile_Space_v001",
  status: "Draft",
  editableFields: ["backgroundColor", "backgroundStrength", "starFieldEnabled", "starDensity", "starBrightness", "nebulaEnabled", "nebulaOpacity", "environmentTexture", "environmentRotation", "transparentBackground", "compositorBackgroundEnabled"]
};

export const compositorProfile: CompositorProfile = {
  id: "planet-compositor-v1",
  note: "Configuration only - compositor execution does not occur inside Studio.",
  stages: [
    { name: "Color Management", enabled: true },
    { name: "Glare", enabled: false },
    { name: "Bloom", enabled: false },
    { name: "Vignette", enabled: false },
    { name: "Contrast", enabled: true },
    { name: "Sharpen", enabled: false },
    { name: "Depth Treatment", enabled: false },
    { name: "Transparent Output", enabled: true }
  ]
};

export const renderOutputs: RenderOutputProfile[] = [
  { id: "planet-hero", name: "Planet Hero", description: "High resolution transparent hero render.", width: 2048, height: 2048, format: "PNG", colorMode: "RGBA", bitDepth: "16-bit", compression: "Lossless", transparentBackground: true, cameraProfile: "hero-camera", lightingProfile: lightingRig.id, qualityProfile: "Hero", outputPathPattern: "renders/{planetId}/hero.png", metadataEnabled: true, enabled: true, status: "Canonical" },
  { id: "planet-card", name: "Planet Card", description: "Square card render for libraries.", width: 1024, height: 1024, format: "PNG", colorMode: "RGBA", bitDepth: "8-bit", compression: "Lossless", transparentBackground: true, cameraProfile: "card-camera", lightingProfile: lightingRig.id, qualityProfile: "Standard", outputPathPattern: "renders/{planetId}/card.png", metadataEnabled: true, enabled: true, status: "Canonical" },
  { id: "planet-thumbnail", name: "Planet Thumbnail", description: "Small square thumbnail.", width: 512, height: 512, format: "PNG", colorMode: "RGBA", bitDepth: "8-bit", compression: "Lossless", transparentBackground: true, cameraProfile: "thumbnail-camera", lightingProfile: lightingRig.id, qualityProfile: "Preview", outputPathPattern: "renders/{planetId}/thumbnail.png", metadataEnabled: true, enabled: true, status: "Canonical" },
  { id: "planet-encyclopedia", name: "Planet Encyclopedia", description: "Wide encyclopedia artwork.", width: 1600, height: 900, format: "PNG", colorMode: "RGBA", bitDepth: "8-bit", compression: "Lossless", transparentBackground: "Optional", cameraProfile: "encyclopedia-camera", lightingProfile: lightingRig.id, qualityProfile: "Standard", outputPathPattern: "renders/{planetId}/encyclopedia.png", metadataEnabled: true, enabled: true, status: "Draft" },
  { id: "planet-transparent-png", name: "Planet Transparent PNG", description: "Editable transparent PNG output.", width: "Editable", height: "Editable", format: "PNG", colorMode: "RGBA", bitDepth: "8-bit", compression: "Lossless", transparentBackground: true, cameraProfile: "hero-camera", lightingProfile: lightingRig.id, qualityProfile: "Custom", outputPathPattern: "renders/{planetId}/transparent.png", metadataEnabled: true, enabled: true, status: "Draft" },
  { id: "planet-runtime-preview", name: "Planet Runtime Preview", description: "Runtime-friendly transparent preview.", width: 1024, height: 1024, format: "WEBP", colorMode: "RGBA", bitDepth: "8-bit", compression: "Web optimized", transparentBackground: true, cameraProfile: "card-camera", lightingProfile: lightingRig.id, qualityProfile: "Preview", outputPathPattern: "renders/{planetId}/runtime-preview.webp", metadataEnabled: true, enabled: true, status: "Canonical" }
];

export const canonicalPlanetRenderContract: PlanetRenderContract = {
  schemaVersion: "1.0.0",
  rendererVersion: "1.0.0",
  renderer: "blender",
  blenderVersion: "5.2-lts",
  renderEngine: "eevee-next",
  assetType: "planet",
  planetId: "",
  templateId: "noveris-planet-renderer-v1",
  layers: {
    surface: surfaceProfileRock,
    clouds: cloudProfile,
    atmosphereGlow: atmosphereGlowProfile,
    atmosphereVolume: atmosphereVolumeProfile
  },
  lighting: lightingRig,
  camera: cameraProfiles[0],
  world: worldProfile,
  compositor: compositorProfile,
  output: renderOutputs[0],
  metadata: {
    studioManaged: true,
    execution: "external-only",
    blenderExecutionEnabled: false,
    lastUpdatedAt: "2026-07-18T00:00:00.000Z"
  }
};

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}
