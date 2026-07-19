import {
  cameraProfiles,
  layerProfiles,
  planetRenderLayers,
  renderOutputs,
  noverisPlanetRenderEngine
} from "@/lib/render-engine/canonical-render-engine";
import type { PlanetRenderContract, RenderValidationIssue, RenderValidationResult } from "@/types/render-engine";

function hex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function issue(status: RenderValidationIssue["status"], target: string, message: string): RenderValidationIssue {
  return { status, target, message };
}

export function validatePlanetRenderContract(contract: PlanetRenderContract): RenderValidationResult {
  const issues: RenderValidationIssue[] = [];
  const profileIds = new Set<string>();
  const cameraIds = new Set(cameraProfiles.map((profile) => profile.id));
  const outputIds = new Set(renderOutputs.map((output) => output.id));

  for (const profile of layerProfiles) {
    if (profileIds.has(profile.id)) issues.push(issue("Invalid", profile.id, `Duplicate profile ID: ${profile.id}`));
    profileIds.add(profile.id);
  }

  const surface = planetRenderLayers.find((layer) => layer.id === "surface");
  const clouds = planetRenderLayers.find((layer) => layer.id === "clouds");
  const glow = planetRenderLayers.find((layer) => layer.id === "atmosphereGlow");
  const volume = planetRenderLayers.find((layer) => layer.id === "atmosphereVolume");

  if (surface?.scale !== 1) issues.push(issue("Invalid", "Planet Surface", "Planet Surface scale must equal 1.000."));
  if (!clouds || clouds.scale <= 1) issues.push(issue("Invalid", "Cloud Sphere", "Cloud Sphere scale must be greater than 1.000."));
  if (!glow || !clouds || glow.scale <= clouds.scale) issues.push(issue("Invalid", "Atmosphere Glow", "Atmosphere Glow scale must be greater than Cloud Sphere scale."));
  if (!volume || !glow || volume.scale <= glow.scale) issues.push(issue("Invalid", "Atmosphere Volume", "Atmosphere Volume scale must be greater than Atmosphere Glow scale."));

  for (const layer of planetRenderLayers) {
    if (!layer.profileId) issues.push(issue("Invalid", layer.layerName, "Required profile ID must exist."));
    if (!layer.objectName) issues.push(issue("Invalid", layer.layerName, "Required object name must exist."));
  }

  const surfaceProfile = layerProfiles.find((profile) => profile.id === "Surface_Profile_Rock_v001");
  if (surfaceProfile?.category === "Surface") {
    const ramp = surfaceProfile.materialValues.colorRamp;
    for (const stop of [ramp.darkStop, ramp.lightStop]) {
      if (!hex(stop.hex)) issues.push(issue("Invalid", surfaceProfile.id, `Invalid HEX color: ${stop.hex}`));
      if (stop.position < 0 || stop.position > 1) issues.push(issue("Invalid", surfaceProfile.id, "ColorRamp positions must be between 0 and 1."));
    }
  }

  const cloudProfile = layerProfiles.find((profile) => profile.id === "Cloud_Profile_v001");
  if (cloudProfile?.category === "Clouds") {
    const ramp = cloudProfile.materialValues.colorRamp;
    if (ramp.blackStopPosition < 0 || ramp.blackStopPosition > 1 || ramp.whiteStopPosition < 0 || ramp.whiteStopPosition > 1) {
      issues.push(issue("Invalid", cloudProfile.id, "ColorRamp positions must be between 0 and 1."));
    }
    if (!hex(cloudProfile.materialValues.principledBsdf.baseColor)) issues.push(issue("Invalid", cloudProfile.id, "Cloud base color must be a valid HEX color."));
  }

  const volumeProfile = layerProfiles.find((profile) => profile.id === "Atmosphere_Volume_Profile_v001");
  if (volumeProfile?.category === "Atmosphere Volume") {
    if (!hex(volumeProfile.approvedValues.color)) issues.push(issue("Invalid", volumeProfile.id, "Atmosphere volume color must be a valid HEX color."));
    if (volumeProfile.approvedValues.density < 0) issues.push(issue("Invalid", volumeProfile.id, "Density cannot be negative."));
  }

  for (const output of renderOutputs) {
    if ((typeof output.width === "number" && (!Number.isInteger(output.width) || output.width <= 0)) || (typeof output.height === "number" && (!Number.isInteger(output.height) || output.height <= 0))) {
      issues.push(issue("Invalid", output.id, "Render dimensions must be positive integers."));
    }
    if (!cameraIds.has(output.cameraProfile)) issues.push(issue("Invalid", output.id, `Referenced camera profile does not exist: ${output.cameraProfile}`));
    if (!outputIds.has(output.id)) issues.push(issue("Invalid", output.id, "Referenced output profile must exist."));
  }

  if (contract.blenderVersion !== "5.2-lts") issues.push(issue("Warning", "blenderVersion", "Unsupported renderer versions must produce warnings."));
  if (contract.metadata.blenderExecutionEnabled !== false) issues.push(issue("Invalid", "execution", "Actual render execution must remain disabled."));

  if (noverisPlanetRenderEngine.execution !== "External only") {
    issues.push(issue("Invalid", "execution", "External renderer execution must remain disabled."));
  }

  const hasInvalid = issues.some((row) => row.status === "Invalid");
  const hasWarning = issues.some((row) => row.status === "Warning" || row.status === "Pending Validation");
  return { status: hasInvalid ? "Invalid" : hasWarning ? "Warning" : "Valid", issues };
}
