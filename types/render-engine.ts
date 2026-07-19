export type RenderModuleStatus = "Ready" | "Warning" | "Error" | "Incomplete";

export type RenderProfileStatus = "Draft" | "Validating" | "Ready" | "Archived";

export type RenderParameterType = "number" | "enum" | "boolean" | "text" | "color" | "colorStops" | "readonly";

export type RenderColorStop = {
  position: number;
  color: string;
  label: string;
};

export type RenderParameterDefinition = {
  key: string;
  label: string;
  type: RenderParameterType;
  defaultValue: number | string | boolean | RenderColorStop[];
  min?: number;
  max?: number;
  options?: string[];
  readonly?: boolean;
};

export type RenderSurfaceModuleId =
  | "coordinates"
  | "planetGeneration"
  | "terrainGeneration"
  | "elevation"
  | "landMaterial"
  | "oceanMaterial"
  | "surfaceDetail"
  | "output";

export type RenderSurfaceModule = {
  id: RenderSurfaceModuleId;
  title: string;
  status: RenderModuleStatus;
  responsibility: string;
  blenderNodes: string[];
  parameters: RenderParameterDefinition[];
};

export type RenderCoordinatesContract = {
  coordinateSource: "generated" | "object";
  mappingType: "point" | "texture" | "vector" | "normal";
  location: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

export type RenderPlanetGenerationContract = {
  continentNoiseType: string;
  continentDimensions: string;
  normalize: boolean;
  scale: number;
  detail: number;
  roughness: number;
  lacunarity: number;
  distortion: number;
  seaLevel: {
    fromMin: number;
    fromMax: number;
    toMin: number;
    toMax: number;
    clamp: boolean;
  };
  continentMask: {
    interpolation: "constant" | "linear" | "ease";
    blackPosition: number;
    whitePosition: number;
  };
};

export type RenderTerrainGenerationContract = {
  noiseType: string;
  dimensions: string;
  normalize: boolean;
  scale: number;
  detail: number;
  roughness: number;
  lacunarity: number;
  distortion: number;
  blendMode: "multiply" | "add" | "mix";
  blendFactor: number;
  clampResult: boolean;
  clampFactor: boolean;
};

export type RenderElevationContract = {
  mountainNoiseType: string;
  mountainDimensions: string;
  mountainNormalize: boolean;
  mountainScale: number;
  mountainDetail: number;
  mountainRoughness: number;
  mountainLacunarity: number;
  mountainDistortion: number;
  blendMode: "add" | "multiply" | "mix";
  blendFactor: number;
  fromMin: number;
  fromMax: number;
  toMin: number;
  toMax: number;
  clamp: boolean;
};

export type RenderLandMaterialContract = {
  colorInterpolation: "linear" | "constant" | "ease";
  colorStops: RenderColorStop[];
  metallic: number;
  roughness: number;
  ior: number;
  alpha: number;
};

export type RenderOceanMaterialContract = {
  baseColor: string;
  metallic: number;
  roughness: number;
  ior: number;
  alpha: number;
};

export type RenderSurfaceDetailContract = {
  normalStrength: number;
  normalDistance: number;
  normalInvert: boolean;
  normalFilterWidth: number;
  applyToLand: boolean;
  applyToOcean: boolean;
};

export type RenderOutputContract = {
  mixFactorSource: "continentMask";
  landShaderSource: "landMaterial";
  oceanShaderSource: "oceanMaterial";
  target: "surface";
};

export type RenderBlenderMapping = {
  objectName: string;
  materialName: string;
  nodes: Record<string, string>;
};

export type RenderSurfaceProfile = {
  schemaVersion: "1.0.0";
  renderer: "blender";
  rendererVersion: "5.2-lts";
  profileId: string;
  profileName: string;
  profileType: "planet_surface";
  status: RenderProfileStatus;
  modifiedAt: string;
  coordinates: RenderCoordinatesContract;
  planetGeneration: RenderPlanetGenerationContract;
  terrainGeneration: RenderTerrainGenerationContract;
  elevation: RenderElevationContract;
  landMaterial: RenderLandMaterialContract;
  oceanMaterial: RenderOceanMaterialContract;
  surfaceDetail: RenderSurfaceDetailContract;
  output: RenderOutputContract;
  blenderMapping: RenderBlenderMapping;
};

export type RenderFieldMapping = {
  studioField: string;
  blenderObject: string;
  blenderMaterial: string;
  blenderNode: string;
  blenderSocket: string;
};

export type RenderValidationIssue = {
  severity: "error" | "warning" | "recommendation";
  moduleId: RenderSurfaceModuleId | "profile";
  field?: string;
  message: string;
};

export type RenderContractValidationResult = {
  status: "Ready" | "Warning" | "Error";
  issues: RenderValidationIssue[];
  moduleStatuses: Record<RenderSurfaceModuleId, RenderModuleStatus>;
};
