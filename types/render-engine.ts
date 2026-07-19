export type RenderEngineStatus = "Valid" | "Warning" | "Invalid" | "Draft" | "Canonical" | "Canonical Draft" | "Deprecated" | "Pending Validation";

export type RenderEngineDefinition = {
  id: string;
  name: string;
  version: string;
  renderer: string;
  blenderVersion: string;
  primaryEngine: string;
  compatibleEngine: string;
  assetType: string;
  templateId: string;
  execution: string;
  studioResponsibility: string;
  blenderResponsibility: string;
  badges: string[];
};

export type RenderParameter = {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  status?: RenderEngineStatus;
  editable?: boolean;
  note?: string;
};

export type RenderColorStop = {
  name: string;
  position: number;
  hex: string;
};

export type RenderLayerDefinition = {
  id: "surface" | "clouds" | "atmosphereGlow" | "atmosphereVolume";
  order: number;
  layerName: string;
  objectName: string;
  materialProfile: string;
  scale: number;
  required: boolean;
  purpose: string;
  supportedRenderer: string;
  validationStatus: RenderEngineStatus;
  profileId: string;
};

export type RenderProfileBase = {
  id: string;
  category: string;
  status: RenderEngineStatus;
  renderer: string;
  supportedEngines: string[];
  objectName: string;
  objectScale: number;
  editableParameters: string[];
};

export type SurfaceRenderProfile = RenderProfileBase & {
  category: "Surface";
  geometry: string[];
  materialValues: {
    noiseTexture: { scale: number; detail: number; roughness: number };
    voronoiTexture: { scale: number; randomness: number };
    mix: { factor: number };
    colorRamp: { interpolation: string; darkStop: RenderColorStop; lightStop: RenderColorStop };
    bump: { strength: number; distance: number };
    principledBsdf: { roughness: number };
  };
  nodeFlow: string[];
};

export type CloudRenderProfile = RenderProfileBase & {
  category: "Clouds";
  materialValues: {
    noiseTexture: { scale: number; detail: number; roughness: number };
    colorRamp: { interpolation: string; blackStopPosition: number; whiteStopPosition: number };
    principledBsdf: { baseColor: string; roughness: number };
  };
  nodeFlow: string[];
};

export type AtmosphereGlowProfile = RenderProfileBase & {
  category: "Atmosphere Glow";
  implementation: string;
  purpose: string;
  warning: string;
  approvedParameters: RenderParameter[];
  nodeFlow: null;
};

export type AtmosphereVolumeProfile = RenderProfileBase & {
  category: "Atmosphere Volume";
  purpose: string;
  shader: string;
  approvedValues: { color: string; density: number; anisotropy: number };
  qualityModes: string[];
  defaultQuality: string;
  nodeFlow: string[];
};

export type RenderProfile = SurfaceRenderProfile | CloudRenderProfile | AtmosphereGlowProfile | AtmosphereVolumeProfile;

export type LightDefinition = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  purpose: string;
  fields: RenderParameter[];
};

export type LightingRigProfile = {
  id: string;
  title: string;
  lights: LightDefinition[];
};

export type CameraProfile = {
  id: string;
  name: string;
  objectName: string;
  lens: string;
  location: { x: string | number; y: string | number; z: string | number };
  targetFraming: string;
  status: RenderEngineStatus;
  editableFields: string[];
};

export type WorldProfile = {
  id: string;
  status: RenderEngineStatus;
  editableFields: string[];
};

export type CompositorProfile = {
  id: string;
  note: string;
  stages: Array<{ name: string; enabled: boolean }>;
};

export type RenderOutputProfile = {
  id: string;
  name: string;
  description: string;
  width: number | "Editable";
  height: number | "Editable";
  format: string;
  colorMode: string;
  bitDepth: string;
  compression: string;
  transparentBackground: boolean | "Optional";
  cameraProfile: string;
  lightingProfile: string;
  qualityProfile: string;
  outputPathPattern: string;
  metadataEnabled: boolean;
  enabled: boolean;
  status: RenderEngineStatus;
};

export type PlanetRenderContract = {
  schemaVersion: "1.0.0";
  rendererVersion: "1.0.0";
  renderer: "blender";
  blenderVersion: "5.2-lts";
  renderEngine: "eevee-next";
  assetType: "planet";
  planetId: string;
  templateId: "noveris-planet-renderer-v1";
  layers: {
    surface: Record<string, unknown>;
    clouds: Record<string, unknown>;
    atmosphereGlow: Record<string, unknown>;
    atmosphereVolume: Record<string, unknown>;
  };
  lighting: Record<string, unknown>;
  camera: Record<string, unknown>;
  world: Record<string, unknown>;
  compositor: Record<string, unknown>;
  output: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

export type RenderValidationIssue = {
  status: RenderEngineStatus;
  message: string;
  target: string;
};

export type RenderValidationResult = {
  status: RenderEngineStatus;
  issues: RenderValidationIssue[];
};
