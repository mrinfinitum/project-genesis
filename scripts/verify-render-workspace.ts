import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CANONICAL_SURFACE_PROFILE_ID,
  blenderFieldMappings,
  canonicalSurfaceShaderContract,
  duplicateSurfaceProfile,
  surfaceShaderModules
} from "@/lib/render-engine/canonical-render-engine";
import { validateSurfaceProfile } from "@/lib/render-engine/render-validation";
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
    "app/render/integrations/page.tsx",
    "app/api/export/render-surface-profiles.json/route.ts",
    "app/api/render/surface-profiles/[profileId]/route.ts"
  ];
  for (const file of routeFiles) assertFile(file);
  assertFile("types/render-engine.ts");
  assertFile("lib/render-engine/canonical-render-engine.ts");
  assertFile("lib/render-engine/render-validation.ts");
  assertFile("components/render-engine/planet-render-engine-workspace.tsx");

  const renderPage = read("app/render/page.tsx");
  const workspace = read("components/render-engine/planet-render-engine-workspace.tsx");
  const nav = read("components/app-shell.tsx");
  const exportRoute = read("app/api/export/render-surface-profiles.json/route.ts");
  const profileRoute = read("app/api/render/surface-profiles/[profileId]/route.ts");
  const subrouteText = routeFiles.slice(1, 11).map(read).join("\n");
  const runtimeBefore = await buildCanonicalRuntimeExportPayload();

  assert(nav.includes('href: "/render"') && nav.includes('label: "Render"'), "Existing Render navigation route must be preserved.");
  assert(renderPage.includes("PlanetRenderEngineWorkspace"), "/render must render the NOVERIS Render Engine workspace.");
  assert(subrouteText.includes('redirect("/render")'), "Old Render subroutes must redirect to the new canonical Render workspace.");
  assert(workspace.includes("NOVERIS Render Engine"), "Render workspace title missing.");
  assert(workspace.includes("Surface Shader Editor"), "Surface Shader Editor label missing.");
  assert(workspace.includes("Renderer Contract Ready"), "Renderer Contract Ready status missing.");
  assert(workspace.includes("External Blender execution is not connected"), "No-execution message missing.");
  assert(!workspace.includes("Send to Blender"), "Workspace must not expose a Send to Blender action.");
  assert(!workspace.includes("fake queue") && !workspace.includes("Batch Jobs") && !workspace.includes("Future Integrations"), "Old placeholder Render content must not appear in the new workspace.");
  assert(!workspace.includes("child_process") && !workspace.includes("spawn(") && !workspace.includes("exec("), "Render workspace must not execute Blender, Python, or subprocesses.");

  assert(canonicalSurfaceShaderContract.profileId === CANONICAL_SURFACE_PROFILE_ID, "Canonical surface profile ID mismatch.");
  assert(canonicalSurfaceShaderContract.profileName === "Surface Profile Earth v001", "Canonical profile name mismatch.");
  assert(canonicalSurfaceShaderContract.renderer === "blender", "Renderer mismatch.");
  assert(canonicalSurfaceShaderContract.rendererVersion === "5.2-lts", "Renderer version mismatch.");
  assert(canonicalSurfaceShaderContract.status === "Ready", "Seed profile status must be Ready.");
  assert(canonicalSurfaceShaderContract.blenderMapping.objectName === "Planet Surface", "Blender object mapping mismatch.");
  assert(canonicalSurfaceShaderContract.blenderMapping.materialName === "Surface_Profile_Earth_v001", "Blender material mapping mismatch.");

  assert(surfaceShaderModules.map((module) => module.title).join("|") === "Coordinates|Planet Generation|Terrain Generation|Elevation|Land Material|Ocean Material|Surface Detail|Output", "Surface pipeline module order mismatch.");
  assert(surfaceShaderModules.length === 8, `Expected 8 modules, received ${surfaceShaderModules.length}.`);
  assert(surfaceShaderModules.every((module) => module.status === "Ready"), "Seed modules must be Ready.");
  assert(surfaceShaderModules.some((module) => module.id === "landMaterial" && module.parameters.some((parameter) => parameter.key === "terrainColorStops")), "Land Material color ramp editor contract missing.");
  assert(surfaceShaderModules.some((module) => module.id === "output" && module.parameters.every((parameter) => parameter.readonly)), "Output module must be mostly read-only.");

  const profile = canonicalSurfaceShaderContract;
  assert(profile.coordinates.coordinateSource === "generated" && profile.coordinates.mappingType === "point", "Coordinate defaults mismatch.");
  assert(profile.coordinates.scale.join("/") === "1/1/1", "Coordinate scale defaults mismatch.");
  assert(profile.planetGeneration.scale === 1.5 && profile.planetGeneration.detail === 0.5 && profile.planetGeneration.roughness === 0.35, "Planet generation defaults mismatch.");
  assert(profile.planetGeneration.seaLevel.fromMin === 0.3 && profile.planetGeneration.seaLevel.fromMax === 0.7, "Sea level defaults mismatch.");
  assert(profile.planetGeneration.continentMask.interpolation === "constant" && profile.planetGeneration.continentMask.blackPosition === 0.46 && profile.planetGeneration.continentMask.whitePosition === 0.47, "Continent mask defaults mismatch.");
  assert(profile.terrainGeneration.scale === 8 && profile.terrainGeneration.blendMode === "multiply" && profile.terrainGeneration.blendFactor === 0.35, "Terrain defaults mismatch.");
  assert(profile.elevation.mountainScale === 24 && profile.elevation.mountainDetail === 8 && profile.elevation.blendMode === "add", "Elevation defaults mismatch.");
  assert(profile.landMaterial.colorStops.length === 3 && profile.landMaterial.colorStops[0].color === "#365C2C" && profile.landMaterial.colorStops[2].label === "Mountain Stone", "Land color stops mismatch.");
  assert(profile.oceanMaterial.baseColor === "#0F4D8A" && profile.oceanMaterial.roughness === 0.03 && profile.oceanMaterial.ior === 1.333, "Ocean material defaults mismatch.");
  assert(profile.surfaceDetail.normalStrength === 0.15 && profile.surfaceDetail.normalDistance === 0.1, "Surface detail defaults mismatch.");
  assert(profile.output.mixFactorSource === "continentMask" && profile.output.target === "surface", "Output defaults mismatch.");

  const validation = validateSurfaceProfile(profile);
  assert(validation.status === "Ready", `Canonical render validation must be Ready; received ${validation.status}: ${validation.issues.map((issue) => issue.message).join("; ")}`);

  const invalidScale = structuredClone(profile);
  invalidScale.coordinates.scale = [1, 0, 1];
  assert(validateSurfaceProfile(invalidScale).status === "Error", "Zero coordinate scale must fail validation.");

  const invalidRamp = structuredClone(profile);
  invalidRamp.landMaterial.colorStops = [
    { position: 0.8, color: "#FFFFFF", label: "Late" },
    { position: 0.2, color: "#000000", label: "Early" }
  ];
  assert(validateSurfaceProfile(invalidRamp).status === "Error", "Unordered color stops must fail validation.");

  const duplicate = duplicateSurfaceProfile(profile);
  assert(duplicate.profileId === `${profile.profileId}_copy` && duplicate.status === "Draft", "Profile duplication contract mismatch.");

  assert(blenderFieldMappings.some((row) => row.studioField === "continentScale" && row.blenderNode === "Continent Noise" && row.blenderSocket === "Scale"), "Continent scale Blender mapping missing.");
  assert(blenderFieldMappings.some((row) => row.studioField === "terrainNormalStrength" && row.blenderNode === "Terrain Normals" && row.blenderSocket === "Strength"), "Terrain normal Blender mapping missing.");
  assert(exportRoute.includes("profiles: [profile]") && exportRoute.includes("validateSurfaceProfile"), "Surface profile export route must return sanitized validated profiles.");
  assert(profileRoute.includes("RENDER_SURFACE_PROFILE_NOT_FOUND") && profileRoute.includes("profileId !== profile.profileId"), "Profile endpoint must return a safe not-found envelope.");

  const runtimeAfter = await buildCanonicalRuntimeExportPayload();
  assert(runtimeBefore.metadata.schemaVersion === runtimeAfter.metadata.schemaVersion, "Render replacement must not change runtime schemaVersion.");
  assert(runtimeBefore.metadata.contentVersion === runtimeAfter.metadata.contentVersion, "Render replacement must not change contentVersion.");

  console.log(JSON.stringify({
    status: "ok",
    route: "/render",
    exportRoute: "/api/export/render-surface-profiles.json",
    profileRoute: "/api/render/surface-profiles/surface_profile_earth_v001",
    profileId: profile.profileId,
    renderer: profile.renderer,
    rendererVersion: profile.rendererVersion,
    modules: surfaceShaderModules.length,
    fields: surfaceShaderModules.reduce((total, module) => total + module.parameters.length, 0),
    blenderMappings: blenderFieldMappings.length,
    validation: validation.status,
    runtimeSchemaVersion: runtimeAfter.metadata.schemaVersion,
    contentVersion: runtimeAfter.metadata.contentVersion,
    oldRenderSubroutesRedirected: 10
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
