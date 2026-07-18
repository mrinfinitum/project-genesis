import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  batchJobs,
  formatRenderContract,
  formatRenderOutput,
  formatRenderProfile,
  formatRendererTemplate,
  futureIntegrations,
  globalRendererSettings,
  planetRenderContractFields,
  planetRendererDetail,
  renderHomeCards,
  renderOutputs,
  renderPipelineSteps,
  renderProfiles,
  renderQueueStatuses,
  rendererTemplates
} from "../lib/render";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertFile(path: string) {
  assert(existsSync(join(root, path)), `Missing file: ${path}`);
}

const routeFiles = [
  "app/render/page.tsx",
  "app/render/templates/page.tsx",
  "app/render/templates/[templateId]/page.tsx",
  "app/render/queue/page.tsx",
  "app/render/profiles/page.tsx",
  "app/render/contracts/page.tsx",
  "app/render/outputs/page.tsx",
  "app/render/settings/page.tsx",
  "app/render/batch-jobs/page.tsx",
  "app/render/integrations/page.tsx"
];

for (const file of routeFiles) assertFile(file);
assertFile("components/production/render-contract-detail.tsx");
assertFile("lib/render/index.ts");

const nav = read("components/app-shell.tsx");
assert(nav.includes('id: "render"'), "Render nav group missing.");
assert(nav.includes('href: "/render"'), "Render nav route missing.");
assert(nav.includes('label: "Render"'), "Render nav label missing.");

assert(renderHomeCards.length === 8, `Expected 8 render home cards, received ${renderHomeCards.length}.`);
assert(rendererTemplates.length === 8, `Expected 8 renderer templates, received ${rendererTemplates.length}.`);
assert(rendererTemplates.some((template) => template.id === "planet-renderer"), "Planet Renderer template missing.");
assert(planetRendererDetail.masterBlendFile === "Planet_Master.blend", "Planet Renderer master blend file mismatch.");
assert(planetRendererDetail.futureBlenderIntegration.includes("No Blender execution"), "Future Blender integration must remain placeholder-only.");
assert(planetRenderContractFields.length === 26, `Expected 26 planet render contract fields, received ${planetRenderContractFields.length}.`);

for (const path of [
  "planet.seed",
  "planet.rotation",
  "planet.radius",
  "planet.scale",
  "surface.type",
  "surface.hue",
  "surface.saturation",
  "surface.value",
  "surface.oceanCoverage",
  "surface.mountainStrength",
  "clouds.enabled",
  "clouds.density",
  "clouds.rotation",
  "clouds.height",
  "clouds.brightness",
  "atmosphere.enabled",
  "atmosphere.color",
  "atmosphere.density",
  "atmosphere.glow",
  "lighting.temperature",
  "lighting.intensity",
  "lighting.nightLights",
  "rings.enabled",
  "rings.size",
  "rings.brightness",
  "moons.count"
]) {
  assert(planetRenderContractFields.some((field) => field.path === path), `Missing render contract field: ${path}`);
}

assert(renderProfiles.length === 8, `Expected 8 render profiles, received ${renderProfiles.length}.`);
assert(renderOutputs.length === 14, `Expected 14 render outputs, received ${renderOutputs.length}.`);
assert(renderQueueStatuses.join(",") === "Pending,Queued,Rendering,Complete,Failed", "Render queue statuses mismatch.");
assert(globalRendererSettings.length === 8, "Global renderer settings must include 8 placeholders.");
assert(batchJobs.length === 4, "Batch jobs must include 4 disabled placeholders.");
assert(batchJobs.every((job) => job.status === "Disabled Placeholder"), "Batch jobs must remain disabled placeholders.");
assert(futureIntegrations.length === 6, "Future integrations must include 6 targets.");
assert(renderPipelineSteps.join(" -> ") === "Planet Record -> Render Contract -> Renderer Template -> Render Queue -> Renderer -> Outputs -> Asset Library -> Game", "Render pipeline steps mismatch.");

const plainContract = formatRenderContract("plain");
assert(plainContract.includes("Planet Render Contract"), "Plain render contract heading missing.");
assert(plainContract.includes("- planet.seed — string"), "Plain render contract field missing.");
const markdownContract = formatRenderContract("markdown");
assert(markdownContract.startsWith("# Planet Render Contract"), "Markdown render contract heading missing.");
const jsonContract = formatRenderContract("json");
JSON.parse(jsonContract);
assert(JSON.parse(jsonContract).id === "planet-render-contract", "JSON render contract id mismatch.");

assert(formatRendererTemplate(rendererTemplates[0]).includes("Output Types"), "Template copy text missing output types.");
assert(formatRenderProfile(renderProfiles[0]).includes("Compression:"), "Render profile copy text missing compression.");
assert(formatRenderOutput(renderOutputs[0]).includes("Runtime Usage:"), "Render output copy text missing runtime usage.");

const renderFiles = [
  ...routeFiles,
  "components/production/render-contract-detail.tsx",
  "lib/render/index.ts"
].map(read).join("\n");
assert(renderFiles.includes("ProductionCopyButton"), "Render pages must use the existing Production copy component.");
assert(!renderFiles.includes("child_process"), "Render workspace must not launch subprocesses.");
assert(!renderFiles.includes("spawn("), "Render workspace must not spawn external commands.");
assert(!renderFiles.includes("exec("), "Render workspace must not execute external commands.");

console.log(JSON.stringify({
  status: "ok",
  routes: routeFiles.length,
  homeCards: renderHomeCards.length,
  templates: rendererTemplates.length,
  contractFields: planetRenderContractFields.length,
  profiles: renderProfiles.length,
  outputs: renderOutputs.length,
  queueStatuses: renderQueueStatuses.length,
  settings: globalRendererSettings.length,
  batchJobs: batchJobs.length,
  futureIntegrations: futureIntegrations.length,
  copyFormats: ["plain", "markdown", "json"],
  implementation: "documentation-only"
}, null, 2));
