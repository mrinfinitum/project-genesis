import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  aiPromptStandards,
  assetSpecifications,
  blenderTemplates,
  exportProfiles,
  fileNamingGroups,
  formatAssetSpecification,
  formatChecklist,
  formatPipeline,
  formatPromptStandard,
  productionChecklists,
  productionHomeCards,
  renderPipelines,
  runtimeTargets,
  toolsAndUtilities
} from "../lib/production";

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
  "app/production/page.tsx",
  "app/production/asset-specifications/page.tsx",
  "app/production/asset-specifications/[assetType]/page.tsx",
  "app/production/blender-templates/page.tsx",
  "app/production/render-pipelines/page.tsx",
  "app/production/ai-prompt-standards/page.tsx",
  "app/production/file-naming-standards/page.tsx",
  "app/production/export-profiles/page.tsx",
  "app/production/runtime-targets/page.tsx",
  "app/production/checklists/page.tsx",
  "app/production/tools/page.tsx"
];

for (const file of routeFiles) assertFile(file);
assertFile("components/production/copy-button.tsx");
assertFile("components/production/production-components.tsx");
assertFile("components/production/asset-specification-detail.tsx");
assertFile("lib/production/index.ts");

const appShell = read("components/app-shell.tsx");
assert(appShell.includes('id: "production"'), "Production nav group missing.");
assert(appShell.includes('href: "/production"'), "Production nav route missing.");
assert(appShell.includes('label: "Production"'), "Production nav label missing.");

const homePage = read("app/production/page.tsx");
for (const card of productionHomeCards) {
  assert(homePage.includes("productionHomeCards"), "Production home must render cards from productionHomeCards.");
  assert(existsSync(join(root, card.href.replace(/^\//, "app/") + "/page.tsx")) || card.href === "/production/asset-specifications", `Production card route may be missing: ${card.href}`);
}

assert(assetSpecifications.length === 19, `Expected 19 asset specification cards, received ${assetSpecifications.length}.`);
assert(blenderTemplates.length === 5, `Expected 5 Blender templates, received ${blenderTemplates.length}.`);
assert(renderPipelines.length >= 1, "Expected at least one render pipeline.");
assert(aiPromptStandards.length >= 1, "Expected AI Prompt Standards structure.");
assert(fileNamingGroups[0]?.examples.includes("planet_earth_diffuse.png"), "File naming examples missing planet diffuse.");
assert(exportProfiles.length === 8, `Expected 8 export profiles, received ${exportProfiles.length}.`);
assert(runtimeTargets.length === 6, `Expected 6 runtime targets, received ${runtimeTargets.length}.`);
assert(productionChecklists.length === 5, `Expected 5 production checklists, received ${productionChecklists.length}.`);
assert(toolsAndUtilities.length === 7, `Expected 7 tools, received ${toolsAndUtilities.length}.`);

const planet = assetSpecifications.find((spec) => spec.id === "planet");
assert(planet, "Planet specification missing.");
const planetPlain = formatAssetSpecification(planet!, "plain");
assert(planetPlain.includes("Planet Asset Specification"), "Planet plain copy title missing.");
assert(planetPlain.includes("- Planet.blend"), "Planet source copy missing Planet.blend.");
assert(planetPlain.includes("- Diffuse — 4096×2048 — PNG — Required"), "Planet surface map copy is incorrect.");
assert(planetPlain.includes("- Runtime — WebP"), "Planet runtime output copy is incorrect.");
assert(planetPlain.includes("- generation_log.txt"), "Planet metadata copy missing generation log.");

const planetMarkdown = formatAssetSpecification(planet!, "markdown");
assert(planetMarkdown.startsWith("# Planet Asset Specification"), "Planet Markdown copy heading missing.");
assert(planetMarkdown.includes("## Surface Maps"), "Planet Markdown section missing.");

const planetJson = formatAssetSpecification(planet!, "json");
JSON.parse(planetJson);
assert(JSON.parse(planetJson).id === "planet", "Planet JSON copy id mismatch.");

const prompt = aiPromptStandards[0];
assert(formatPromptStandard(prompt, "plain").includes("Prompt Template"), "Prompt full copy missing template heading.");
assert(prompt.promptTemplate !== prompt.negativePrompt, "Prompt template and negative prompt must remain separate.");

const pipeline = renderPipelines[0];
assert(formatPipeline(pipeline).includes("Planet Record\n→ Planet Seed"), "Pipeline copy format must use arrow workflow.");

const checklist = productionChecklists.find((item) => item.id === "planet");
assert(checklist, "Planet checklist missing.");
assert(formatChecklist(checklist!).includes("- [ ] Metadata complete"), "Checklist copy must be Markdown checkbox format.");

const copyButton = read("components/production/copy-button.tsx");
assert(copyButton.includes("navigator.clipboard"), "Copy button must use Clipboard API.");
assert(copyButton.includes("document.execCommand"), "Copy button must include safe fallback.");
assert(copyButton.includes('aria-live="polite"'), "Copy button must expose live copied state.");
assert(copyButton.includes("Clipboard blocked. Select and copy manually."), "Copy failure fallback missing.");

const detail = read("components/production/asset-specification-detail.tsx");
assert(detail.includes("Copy as"), "Asset detail must support multiple copy formats.");
assert(detail.includes("Source Files"), "Section-level source copy missing.");
assert(detail.includes("Surface Maps"), "Section-level surface copy missing.");
assert(detail.includes("Render Outputs"), "Section-level render copy missing.");
assert(detail.includes("Metadata"), "Section-level metadata copy missing.");

const productionFiles = [
  ...routeFiles,
  "components/production/copy-button.tsx",
  "components/production/production-components.tsx",
  "components/production/asset-specification-detail.tsx",
  "lib/production/index.ts"
].map(read).join("\n");
assert(productionFiles.includes("ProductionCopyButton"), "Production copy buttons missing.");

console.log(JSON.stringify({
  status: "ok",
  routes: routeFiles.length,
  assetSpecifications: assetSpecifications.length,
  blenderTemplates: blenderTemplates.length,
  renderPipelines: renderPipelines.length,
  aiPromptStandards: aiPromptStandards.length,
  fileNamingGroups: fileNamingGroups.length,
  exportProfiles: exportProfiles.length,
  runtimeTargets: runtimeTargets.length,
  checklists: productionChecklists.length,
  tools: toolsAndUtilities.length,
  copyFormats: ["plain", "markdown", "json"],
  clipboardFallback: true,
  existingWorkspaceMutation: "nav entry only"
}, null, 2));
