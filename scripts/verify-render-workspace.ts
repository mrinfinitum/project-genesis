import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  cameraProfiles,
  canonicalPlanetRenderContract,
  cloudProfile,
  compositorProfile,
  layerProfiles,
  lightingRig,
  noverisPlanetRenderEngine,
  planetRenderLayers,
  renderOutputs,
  surfaceProfileRock,
  worldProfile
} from "@/lib/render-engine/canonical-render-engine";
import { validatePlanetRenderContract } from "@/lib/render-engine/render-validation";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertFile(path: string) {
  assert(existsSync(join(root, path)), `Missing file: ${path}`);
}

async function main() {
  const routeFiles = [
    "app/render/page.tsx",
    "app/render/templates/page.tsx",
    "app/render/templates/[templateId]/page.tsx",
    "app/render/queue/page.tsx",
    "app/render/profiles/page.tsx",
    "app/render/contracts/page.tsx",
    "app/render/contracts/planet-renderer/page.tsx",
    "app/render/outputs/page.tsx",
    "app/render/settings/page.tsx",
    "app/render/batch-jobs/page.tsx",
    "app/render/integrations/page.tsx"
  ];
  for (const file of routeFiles) assertFile(file);
  assertFile("types/render-engine.ts");
  assertFile("lib/render-engine/canonical-render-engine.ts");
  assertFile("lib/render-engine/render-validation.ts");
  assertFile("components/render-engine/planet-render-engine-workspace.tsx");

  const renderPage = read("app/render/page.tsx");
  const workspace = read("components/render-engine/planet-render-engine-workspace.tsx");
  const nav = read("components/app-shell.tsx");
  const subrouteText = routeFiles.slice(1).map(read).join("\n");
  const runtimeBefore = await buildCanonicalRuntimeExportPayload();

  assert(nav.includes('href: "/render"') && nav.includes('label: "Render"'), "Existing Render navigation route must be preserved.");
  assert(renderPage.includes("PlanetRenderEngineWorkspace"), "/render must render the NOVERIS Planet Render Engine workspace.");
  assert(subrouteText.includes('redirect("/render")'), "Old Render subroutes must redirect to the new canonical Render workspace.");
  assert(!renderPage.includes("renderHomeCards"), "Old Render dashboard cards must be removed from /render.");
  assert(!workspace.includes("fake queue") && !workspace.includes("Batch Jobs") && !workspace.includes("Future Integrations"), "Old placeholder Render content must not appear in the new workspace.");
  assert(!workspace.includes("child_process") && !workspace.includes("spawn(") && !workspace.includes("exec("), "Render workspace must not execute Blender, Python, or subprocesses.");

  assert(noverisPlanetRenderEngine.name === "NOVERIS Planet Render Engine", "Renderer title mismatch.");
  assert(noverisPlanetRenderEngine.version === "1.0", "Renderer version mismatch.");
  assert(noverisPlanetRenderEngine.blenderVersion === "5.2 LTS", "Blender version mismatch.");
  assert(noverisPlanetRenderEngine.primaryEngine === "Eevee Next", "Primary render engine mismatch.");
  assert(noverisPlanetRenderEngine.execution === "External only", "Renderer execution must remain external only.");

  assert(planetRenderLayers.map((layer) => layer.layerName).join("|") === "Planet Surface|Cloud Sphere|Atmosphere Glow|Atmosphere Volume", "Planet layer order mismatch.");
  assert(planetRenderLayers[0].scale === 1 && planetRenderLayers[1].scale === 1.015 && planetRenderLayers[2].scale === 1.025 && planetRenderLayers[3].scale === 1.08, "Layer scale stack mismatch.");
  assert(planetRenderLayers[0].required && !planetRenderLayers[1].required && !planetRenderLayers[2].required && !planetRenderLayers[3].required, "Layer required/optional flags mismatch.");

  assert(layerProfiles.length === 4, `Expected four layer profiles, received ${layerProfiles.length}.`);
  assert(surfaceProfileRock.id === "Surface_Profile_Rock_v001" && surfaceProfileRock.status === "Canonical", "Surface profile metadata mismatch.");
  assert(surfaceProfileRock.materialValues.noiseTexture.scale === 8.0, "Surface noise scale mismatch.");
  assert(surfaceProfileRock.materialValues.noiseTexture.detail === 2.0, "Surface noise detail mismatch.");
  assert(surfaceProfileRock.materialValues.noiseTexture.roughness === 0.5, "Surface noise roughness mismatch.");
  assert(surfaceProfileRock.materialValues.voronoiTexture.scale === 12.0, "Surface Voronoi scale mismatch.");
  assert(surfaceProfileRock.materialValues.voronoiTexture.randomness === 1.0, "Surface Voronoi randomness mismatch.");
  assert(surfaceProfileRock.materialValues.mix.factor === 0.25, "Surface mix factor mismatch.");
  assert(surfaceProfileRock.materialValues.colorRamp.interpolation === "Linear", "Surface ColorRamp interpolation mismatch.");
  assert(surfaceProfileRock.materialValues.colorRamp.darkStop.position === 0.35 && surfaceProfileRock.materialValues.colorRamp.darkStop.hex === "#4B4742", "Surface dark stop mismatch.");
  assert(surfaceProfileRock.materialValues.colorRamp.lightStop.position === 0.72 && surfaceProfileRock.materialValues.colorRamp.lightStop.hex === "#CFC8BE", "Surface light stop mismatch.");
  assert(surfaceProfileRock.materialValues.bump.strength === 0.18 && surfaceProfileRock.materialValues.bump.distance === 0.1, "Surface bump values mismatch.");
  assert(surfaceProfileRock.materialValues.principledBsdf.roughness === 0.8, "Surface Principled BSDF roughness mismatch.");

  assert(cloudProfile.id === "Cloud_Profile_v001" && cloudProfile.status === "Canonical", "Cloud profile metadata mismatch.");
  assert(cloudProfile.materialValues.noiseTexture.scale === 12.0 && cloudProfile.materialValues.noiseTexture.detail === 2.0 && cloudProfile.materialValues.noiseTexture.roughness === 0.5, "Cloud noise values mismatch.");
  assert(cloudProfile.materialValues.colorRamp.blackStopPosition === 0.42 && cloudProfile.materialValues.colorRamp.whiteStopPosition === 0.58, "Cloud threshold values mismatch.");
  assert(cloudProfile.materialValues.principledBsdf.baseColor === "#FFFFFF" && cloudProfile.materialValues.principledBsdf.roughness === 1.0, "Cloud BSDF values mismatch.");

  const glow = layerProfiles.find((profile) => profile.id === "Atmosphere_Glow_Profile_v001");
  assert(glow?.status === "Pending Validation", "Atmosphere Glow must remain Pending Validation.");
  assert(workspace.includes("Final Blender 5.2 node implementation remains under validation"), "Atmosphere Glow warning must be displayed.");
  const volume = layerProfiles.find((profile) => profile.id === "Atmosphere_Volume_Profile_v001");
  assert(volume?.status === "Canonical Draft", "Atmosphere Volume must be Canonical Draft.");

  assert(lightingRig.title === "Three-Light Planet Rig" && lightingRig.lights.length === 3, "Lighting rig mismatch.");
  assert(lightingRig.lights.every((light) => light.fields.every((field) => field.value === "Not yet calibrated")), "Unapproved lighting fields must be Not yet calibrated.");
  assert(cameraProfiles.length === 5 && cameraProfiles[0].name === "Hero Camera" && cameraProfiles[0].lens === "80 mm", "Camera profiles mismatch.");
  assert(cameraProfiles[0].location.y === -8 && cameraProfiles[0].targetFraming.includes("75-80%"), "Hero Camera seeded values mismatch.");
  assert(worldProfile.id === "Background_Profile_Space_v001" && worldProfile.status === "Draft", "World profile mismatch.");
  assert(compositorProfile.note.includes("execution does not occur inside Studio"), "Compositor execution warning missing.");
  assert(renderOutputs.length === 6, `Expected six render outputs, received ${renderOutputs.length}.`);
  assert(renderOutputs.some((output) => output.id === "planet-runtime-preview" && output.format === "WEBP" && output.width === 1024), "Runtime preview output mismatch.");

  assert(canonicalPlanetRenderContract.schemaVersion === "1.0.0", "Render contract schemaVersion mismatch.");
  assert(canonicalPlanetRenderContract.templateId === "noveris-planet-renderer-v1", "Render contract templateId mismatch.");
  assert(canonicalPlanetRenderContract.metadata.blenderExecutionEnabled === false, "Render contract must keep Blender execution disabled.");
  assert(workspace.includes("Live JSON render contract editor") && workspace.includes("Reset to Canonical Defaults") && workspace.includes("Dirty Draft"), "Render Contract Editor controls missing.");
  assert(workspace.includes("Copy Full Render Contract") && workspace.includes("Download Full Render Contract JSON") && workspace.includes("Send to Blender"), "Export controls missing.");
  assert(workspace.includes("External renderer execution is not implemented"), "Send to Blender disabled tooltip/message missing.");

  const validation = validatePlanetRenderContract(canonicalPlanetRenderContract);
  assert(validation.status === "Valid", `Canonical render validation must be Valid; received ${validation.status}: ${validation.issues.map((issue) => issue.message).join("; ")}`);

  const runtimeAfter = await buildCanonicalRuntimeExportPayload();
  assert(runtimeBefore.metadata.schemaVersion === runtimeAfter.metadata.schemaVersion, "Render replacement must not change runtimeVersion.");
  assert(runtimeBefore.metadata.contentVersion === runtimeAfter.metadata.contentVersion, "Render replacement must not change contentVersion.");

  console.log(JSON.stringify({
    status: "ok",
    route: "/render",
    renderer: noverisPlanetRenderEngine.name,
    version: noverisPlanetRenderEngine.version,
    blenderVersion: noverisPlanetRenderEngine.blenderVersion,
    primaryEngine: noverisPlanetRenderEngine.primaryEngine,
    layers: planetRenderLayers.length,
    profiles: layerProfiles.length,
    cameras: cameraProfiles.length,
    outputs: renderOutputs.length,
    validation: validation.status,
    runtimeVersion: runtimeAfter.metadata.schemaVersion,
    contentVersion: runtimeAfter.metadata.contentVersion,
    oldRenderSubroutesRedirected: routeFiles.length - 1
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
