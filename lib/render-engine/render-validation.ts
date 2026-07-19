import { surfaceShaderModules } from "@/lib/render-engine/canonical-render-engine";
import type {
  RenderContractValidationResult,
  RenderSurfaceModuleId,
  RenderSurfaceProfile,
  RenderValidationIssue
} from "@/types/render-engine";

function isFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function isHex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function issue(severity: RenderValidationIssue["severity"], moduleId: RenderSurfaceModuleId | "profile", field: string, message: string): RenderValidationIssue {
  return { severity, moduleId, field, message };
}

function assertFiniteTriplet(values: unknown[], moduleId: RenderSurfaceModuleId, field: string, issues: RenderValidationIssue[]) {
  values.forEach((value, index) => {
    if (!isFiniteNumber(value)) issues.push(issue("error", moduleId, `${field}[${index}]`, `${field} values must be finite numbers.`));
  });
}

function assertRange(value: number, min: number, max: number, moduleId: RenderSurfaceModuleId, field: string, issues: RenderValidationIssue[]) {
  if (!isFiniteNumber(value) || value < min || value > max) {
    issues.push(issue("error", moduleId, field, `${field} must be between ${min} and ${max}.`));
  }
}

export function validateSurfaceProfile(profile: RenderSurfaceProfile): RenderContractValidationResult {
  const issues: RenderValidationIssue[] = [];
  const moduleStatuses = Object.fromEntries(surfaceShaderModules.map((module) => [module.id, "Ready"])) as RenderContractValidationResult["moduleStatuses"];

  if (profile.schemaVersion !== "1.0.0") issues.push(issue("error", "profile", "schemaVersion", "Surface shader schemaVersion must be 1.0.0."));
  if (profile.renderer !== "blender") issues.push(issue("error", "profile", "renderer", "Renderer must be blender."));
  if (profile.rendererVersion !== "5.2-lts") issues.push(issue("error", "profile", "rendererVersion", "Renderer version must be 5.2-lts."));
  if (!profile.profileId) issues.push(issue("error", "profile", "profileId", "Profile ID is required."));
  if (!profile.profileName) issues.push(issue("error", "profile", "profileName", "Profile name is required."));

  if (!["generated", "object"].includes(profile.coordinates.coordinateSource)) issues.push(issue("error", "coordinates", "coordinateSource", "Unsupported coordinate source."));
  if (!["point", "texture", "vector", "normal"].includes(profile.coordinates.mappingType)) issues.push(issue("error", "coordinates", "mappingType", "Unsupported mapping type."));
  assertFiniteTriplet(profile.coordinates.location, "coordinates", "location", issues);
  assertFiniteTriplet(profile.coordinates.rotation, "coordinates", "rotation", issues);
  assertFiniteTriplet(profile.coordinates.scale, "coordinates", "scale", issues);
  profile.coordinates.scale.forEach((value, index) => {
    if (value === 0) issues.push(issue("error", "coordinates", `scale[${index}]`, "Scale values cannot be 0."));
  });

  if (profile.planetGeneration.seaLevel.fromMin >= profile.planetGeneration.seaLevel.fromMax) {
    issues.push(issue("error", "planetGeneration", "seaLevel", "Sea Level From Min must be lower than From Max."));
  }
  assertRange(profile.planetGeneration.continentMask.blackPosition, 0, 1, "planetGeneration", "continentMask.blackPosition", issues);
  assertRange(profile.planetGeneration.continentMask.whitePosition, 0, 1, "planetGeneration", "continentMask.whitePosition", issues);
  if (profile.planetGeneration.continentMask.blackPosition > profile.planetGeneration.continentMask.whitePosition) {
    issues.push(issue("error", "planetGeneration", "continentMask", "Continent mask black position must be less than or equal to white position."));
  }
  if (profile.planetGeneration.continentMask.whitePosition - profile.planetGeneration.continentMask.blackPosition > 0.18) {
    issues.push(issue("warning", "planetGeneration", "continentMask", "Continent mask transition is very wide."));
  }
  if (profile.planetGeneration.scale <= 0) issues.push(issue("error", "planetGeneration", "scale", "Continent scale must be greater than 0."));

  if (profile.terrainGeneration.scale <= 0) issues.push(issue("error", "terrainGeneration", "scale", "Terrain scale must be greater than 0."));
  assertRange(profile.terrainGeneration.blendFactor, 0, 1, "terrainGeneration", "blendFactor", issues);
  if (Math.abs(profile.terrainGeneration.scale - profile.planetGeneration.scale) < 0.75) {
    issues.push(issue("warning", "terrainGeneration", "scale", "Terrain scale is close to continent scale."));
  }

  if (profile.elevation.mountainScale <= 0) issues.push(issue("error", "elevation", "mountainScale", "Mountain scale must be greater than 0."));
  if (profile.elevation.fromMin >= profile.elevation.fromMax) {
    issues.push(issue("error", "elevation", "range", "Elevation From Min must be lower than From Max."));
  }
  assertRange(profile.elevation.blendFactor, 0, 1, "elevation", "blendFactor", issues);

  if (profile.landMaterial.colorStops.length < 2) {
    issues.push(issue("error", "landMaterial", "colorStops", "Land Material requires at least two color stops."));
  }
  profile.landMaterial.colorStops.forEach((stop, index, stops) => {
    assertRange(stop.position, 0, 1, "landMaterial", `colorStops[${index}].position`, issues);
    if (!isHex(stop.color)) issues.push(issue("error", "landMaterial", `colorStops[${index}].color`, `Invalid HEX color: ${stop.color}`));
    if (index > 0 && stop.position < stops[index - 1].position) {
      issues.push(issue("error", "landMaterial", "colorStops", "Color stop positions must be ordered."));
    }
  });
  assertRange(profile.landMaterial.roughness, 0, 1, "landMaterial", "roughness", issues);

  if (!isHex(profile.oceanMaterial.baseColor)) issues.push(issue("error", "oceanMaterial", "baseColor", `Invalid HEX color: ${profile.oceanMaterial.baseColor}`));
  assertRange(profile.oceanMaterial.roughness, 0, 1, "oceanMaterial", "roughness", issues);
  if (profile.oceanMaterial.ior <= 1) issues.push(issue("error", "oceanMaterial", "ior", "Ocean IOR must be greater than 1."));
  if (profile.oceanMaterial.roughness > 0.25) issues.push(issue("warning", "oceanMaterial", "roughness", "Ocean roughness is unusually high."));

  if (profile.surfaceDetail.normalStrength < 0) issues.push(issue("error", "surfaceDetail", "normalStrength", "Normal strength cannot be negative."));
  if (profile.surfaceDetail.normalDistance < 0) issues.push(issue("error", "surfaceDetail", "normalDistance", "Normal distance cannot be negative."));
  if (profile.surfaceDetail.normalStrength > 0.85) issues.push(issue("warning", "surfaceDetail", "normalStrength", "Normal strength may produce exaggerated relief."));

  if (profile.output.mixFactorSource !== "continentMask") issues.push(issue("error", "output", "mixFactorSource", "Output mix factor must use continentMask."));
  if (profile.output.landShaderSource !== "landMaterial") issues.push(issue("error", "output", "landShaderSource", "Output land shader source must be landMaterial."));
  if (profile.output.oceanShaderSource !== "oceanMaterial") issues.push(issue("error", "output", "oceanShaderSource", "Output ocean shader source must be oceanMaterial."));
  if (profile.output.target !== "surface") issues.push(issue("error", "output", "target", "Surface output target must be surface."));

  for (const validationIssue of issues) {
    if (validationIssue.moduleId !== "profile") {
      moduleStatuses[validationIssue.moduleId] = validationIssue.severity === "error" ? "Error" : "Warning";
    }
  }

  const hasErrors = issues.some((row) => row.severity === "error");
  const hasWarnings = issues.some((row) => row.severity === "warning");

  return {
    status: hasErrors ? "Error" : hasWarnings ? "Warning" : "Ready",
    issues,
    moduleStatuses
  };
}
