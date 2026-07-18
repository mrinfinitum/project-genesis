import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import {
  allRenderProfilesJson,
  getRenderProfileBySlug,
  renderProfileCategories,
  renderProfileChecklist,
  renderProfileExactValuesText,
  renderProfileJson,
  renderProfilesLibrary,
  renderProfileSpecification,
  renderProfileStatuses,
  validateRenderProfiles,
  type RenderProfile
} from "@/lib/production/render-library";

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

function valueGroup(profile: RenderProfile, group: string) {
  const values = profile.values[group];
  assert(values, `Missing value group: ${group}`);
  return values;
}

function findValue(profile: RenderProfile, group: string, parameter: string) {
  const value = valueGroup(profile, group).find((item) => item.parameter === parameter);
  assert(value, `Missing value: ${group}.${parameter}`);
  return value;
}

function cloneProfiles() {
  return JSON.parse(JSON.stringify(renderProfilesLibrary)) as RenderProfile[];
}

async function main() {
  assertFile("app/production/render-library/page.tsx");
  assertFile("app/production/render-library/[profileId]/page.tsx");
  assertFile("components/production/render-library-workspace.tsx");
  assertFile("lib/production/render-library.ts");
  assertFile("docs/production/render-library.md");

  const nav = read("components/app-shell.tsx");
  const production = read("lib/production/index.ts");
  const workspace = read("components/production/render-library-workspace.tsx");
  const docs = read("docs/production/render-library.md");
  const runtimeBefore = await buildCanonicalRuntimeExportPayload();

  assert(nav.includes('href: "/production/render-library"') && nav.includes('label: "Render Library"'), "Production navigation must include Render Library.");
  assert(production.includes('href: "/production/render-library"'), "Production workspace must link to Render Library.");
  assert(workspace.includes("Search profiles") && workspace.includes("Create Profile"), "Render Library home must open into a searchable library browser.");
  assert(workspace.includes("Duplicate") && workspace.includes("Archive") && workspace.includes("Edit"), "Render Library browser must expose duplicate, archive, and edit actions.");
  assert(workspace.includes("Copy Spec") && workspace.includes("Copy JSON") && workspace.includes("Copy Blender") && workspace.includes("Copy Contract"), "Render Library must expose required clipboard copy actions.");
  assert(workspace.includes("Copy Exact Values") && workspace.includes("Copy HEX") && workspace.includes("Copy Profile JSON"), "Detail view must expose section, color, and JSON copy actions.");
  assert(workspace.includes("ProductionCopyButton"), "Clipboard actions must use the shared Production copy button with visible feedback.");
  assert(workspace.includes("setProfiles") && workspace.includes("duplicateProfile") && workspace.includes("archiveProfile"), "Duplicate and archive actions must be implemented.");
  assert(!workspace.includes("child_process") && !workspace.includes("spawn(") && !workspace.includes("exec("), "Render Library must not launch Blender or subprocesses.");

  assert(renderProfileCategories.join(",") === "Surface,Clouds,Atmosphere,Lighting,Camera,Background,Moons,Rings,Output", "Render profile categories mismatch.");
  assert(renderProfileStatuses.join(",") === "Draft,Review,Approved,Deprecated,Archived", "Render profile statuses mismatch.");
  assert(renderProfilesLibrary.length === 2, `Expected 2 seeded profiles, received ${renderProfilesLibrary.length}.`);

  const surface = getRenderProfileBySlug("surface-profile-rock-v001");
  const clouds = getRenderProfileBySlug("cloud-profile-v001");
  assert(surface, "Seeded Surface Profile Rock missing.");
  assert(clouds, "Seeded Cloud Profile missing.");
  assert(surface.name === "Surface Profile — Rock v001", "Surface profile name mismatch.");
  assert(surface.category === "Surface" && surface.status === "Draft" && surface.engine === "Blender", "Surface profile metadata mismatch.");
  assert(surface.materialName === "Surface_Profile_Rock_v001" && surface.blenderVersion === "5.2 LTS", "Surface Blender metadata mismatch.");
  assert(clouds.category === "Clouds" && clouds.objectName === "Cloud Sphere" && clouds.materialName === "Cloud_Profile_v001", "Cloud profile metadata mismatch.");

  const rockScale = findValue(surface, "Noise Texture", "scale");
  assert(rockScale.type === "number" && rockScale.value === 8.0 && rockScale.blenderTarget === "Noise Texture.Scale", "Rock noise scale mismatch.");
  const fractureScale = findValue(surface, "Voronoi Texture", "scale");
  assert(fractureScale.type === "number" && fractureScale.value === 12.0, "Rock Voronoi scale mismatch.");
  const rockRamp = findValue(surface, "ColorRamp", "rock_ramp");
  assert(rockRamp.type === "colorRamp" && rockRamp.stops[0].position === 0.35 && rockRamp.stops[0].hex === "#4B4742" && rockRamp.stops[1].position === 0.72 && rockRamp.stops[1].hex === "#CFC8BE", "Rock ColorRamp exact values mismatch.");
  const bumpStrength = findValue(surface, "Bump", "strength");
  assert(bumpStrength.type === "number" && bumpStrength.value === 0.18, "Rock bump strength mismatch.");

  const cloudScale = findValue(clouds, "Noise Texture", "scale");
  assert(cloudScale.type === "number" && cloudScale.value === 12.0, "Cloud noise scale mismatch.");
  const cloudRamp = findValue(clouds, "ColorRamp", "cloud_threshold_ramp");
  assert(cloudRamp.type === "colorRamp" && cloudRamp.stops[0].position === 0.42 && cloudRamp.stops[1].position === 0.58 && cloudRamp.stops[1].hex === "#FFFFFF", "Cloud ColorRamp exact values mismatch.");
  const shellScale = findValue(clouds, "Cloud Sphere", "scale");
  assert(shellScale.type === "vector3" && shellScale.value.join(",") === "1.015,1.015,1.015", "Cloud shell scale mismatch.");

  assert(validateRenderProfiles().valid, "Seeded Render Library profiles must validate.");
  assert(surface.nodeGraph.connections.some((connection) => connection.toNode === "material_output" && connection.toSocket === "Surface"), "Surface Material Output connection missing.");
  assert(clouds.nodeGraph.connections.some((connection) => connection.toNode === "material_output" && connection.toSocket === "Surface"), "Cloud Material Output connection missing.");
  assert(surface.studioContract.every((entry) => entry.runtimePublished === false), "Surface contract must not publish runtime fields.");
  assert(clouds.studioContract.every((entry) => entry.runtimePublished === false), "Cloud contract must not publish runtime fields.");

  const duplicateProfiles = cloneProfiles();
  duplicateProfiles.push({ ...duplicateProfiles[0] });
  assert(!validateRenderProfiles(duplicateProfiles).valid, "Validator must catch duplicate profile IDs and slugs.");
  const invalidHexProfiles = cloneProfiles();
  const invalidRamp = invalidHexProfiles[0].values.ColorRamp[0];
  assert(invalidRamp.type === "colorRamp", "Expected ColorRamp fixture.");
  invalidRamp.stops[0].hex = "not-a-hex";
  assert(validateRenderProfiles(invalidHexProfiles).issues.some((issue) => issue.message.includes("Invalid HEX")), "Validator must catch invalid HEX values.");
  const invalidRuntimeProfiles = cloneProfiles();
  invalidRuntimeProfiles[0].studioContract[0].runtimePublished = true;
  assert(validateRenderProfiles(invalidRuntimeProfiles).issues.some((issue) => issue.message.includes("runtime")), "Validator must reject runtimePublished=true.");
  const invalidNodeProfiles = cloneProfiles();
  invalidNodeProfiles[0].nodeGraph.connections = [];
  assert(validateRenderProfiles(invalidNodeProfiles).issues.some((issue) => issue.message.includes("Material Output")), "Validator must catch missing Material Output connection.");

  const surfaceJson = JSON.parse(renderProfileJson(surface));
  assert(surfaceJson.schemaVersion === 1 && surfaceJson.profileId === "surface-profile-rock-v001" && surfaceJson.engine === "Blender", "Single profile JSON export shape mismatch.");
  assert(JSON.parse(allRenderProfilesJson()).profiles.length === 2, "All profiles JSON export shape mismatch.");
  assert(renderProfileSpecification(surface).includes("Surface Profile") && renderProfileSpecification(surface).includes("Exact Values"), "Specification copy text incomplete.");
  assert(renderProfileExactValuesText(clouds).includes("cloud_threshold_ramp"), "Exact values copy text incomplete.");
  assert(renderProfileChecklist(clouds).includes("Confirm object scale"), "Blender checklist copy text incomplete.");

  assert(docs.includes("Runtime Isolation") && docs.includes("Blender 5.2 LTS") && docs.includes("Clipboard Workflow"), "Render Library documentation incomplete.");

  const runtimeAfter = await buildCanonicalRuntimeExportPayload();
  assert(runtimeBefore.metadata.schemaVersion === runtimeAfter.metadata.schemaVersion, "Render Library must not change runtimeVersion.");
  assert(runtimeBefore.metadata.contentVersion === runtimeAfter.metadata.contentVersion, "Render Library must not change contentVersion.");
  assert(runtimeAfter.metadata.validationStatus === "Ready", "Runtime validation must remain Ready.");

  console.log(JSON.stringify({
    status: "ok",
    route: "/production/render-library",
    detailRoutes: renderProfilesLibrary.map((profile) => `/production/render-library/${profile.slug}`),
    profiles: renderProfilesLibrary.length,
    categories: renderProfileCategories.length,
    seededProfiles: renderProfilesLibrary.map((profile) => profile.slug),
    validation: "Ready",
    runtimeVersion: runtimeAfter.metadata.schemaVersion,
    contentVersion: runtimeAfter.metadata.contentVersion,
    runtimeChanged: false,
    clipboardCoverage: ["specification", "exactValues", "json", "blenderChecklist", "studioContract", "individualValues", "hexColors", "blenderTargets"]
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
