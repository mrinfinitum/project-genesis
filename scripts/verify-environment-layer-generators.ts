import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  buildEnvironmentLayerAssetRecord,
  buildEnvironmentLayerPrompt,
  calculateEnvironmentGeneratorProgress,
  defaultEnvironmentGeneratorControls,
  environmentGeneratorDefinitions,
  getEnvironmentGeneratorDefinition,
  nextEnvironmentLayerFilename,
  validateEnvironmentGeneratorDefinitions,
  type EnvironmentLayerProgress
} from "../lib/environment-layer-generators";

const projectRoot = process.cwd();
const expected = {
  universe: { count: 6, route: "/universe-layer-generator" },
  galaxy: { count: 10, route: "/galaxy-layer-generator" },
  sector: { count: 10, route: "/sector-layer-generator" },
  starSystem: { count: 13, route: "/star-system-layer-generator" }
} as const;

assert.equal(environmentGeneratorDefinitions.length, 4, "Four dedicated environment definitions are required.");
assert.deepEqual(validateEnvironmentGeneratorDefinitions(), [], "Canonical environment definitions must validate.");

for (const [id, contract] of Object.entries(expected)) {
  const definition = getEnvironmentGeneratorDefinition(id as keyof typeof expected);
  assert.equal(definition.route, contract.route, `${id} route must remain canonical.`);
  assert.equal(definition.layers.length, contract.count, `${id} layer count is incorrect.`);
  assert.equal(new Set(definition.layers.map((row) => row.number)).size, definition.layers.length, `${id} layer numbers must be unique.`);
  assert.equal(new Set(definition.layers.map((row) => row.prefix)).size, definition.layers.length, `${id} prefixes must be unique.`);
  assert(existsSync(path.join(projectRoot, "app", contract.route.slice(1), "page.tsx")), `${contract.route} page is missing.`);

  for (const layer of definition.layers) {
    assert(layer.canonicalPrompt.trim().length > 40, `${layer.id} must provide a full prompt.`);
    assert(layer.folder.startsWith("source-masters/environments/"), `${layer.id} source path escaped source-masters.`);
    assert(!path.isAbsolute(layer.folder) && !layer.folder.includes(".."), `${layer.id} source path must be repository-relative.`);
    assert(existsSync(path.join(projectRoot, "game-art", layer.folder, ".gitkeep")), `${layer.id} source folder is not represented.`);
    if (layer.output.transparency !== "opaque") {
      assert.match(layer.canonicalPrompt, /transparent/i, `${layer.id} must include transparency language.`);
    } else {
      assert.doesNotMatch(layer.canonicalPrompt, /transparent png-ready/i, `${layer.id} incorrectly requires transparent output.`);
      assert.match(layer.canonicalPrompt, /vignette/i, `${layer.id} base prompt must explicitly control vignette behavior.`);
    }
  }
}

const starSystem = getEnvironmentGeneratorDefinition("starSystem");
const firstLayer = starSystem.layers[0];
const finishedPrompt = buildEnvironmentLayerPrompt(firstLayer, defaultEnvironmentGeneratorControls);
assert.doesNotMatch(finishedPrompt, /Copy Prompt|Copy Filename|Copy PSD Folder|[{"]assetId["}]/, "Copied prompt must exclude UI labels and JSON.");
assert.match(finishedPrompt, /reusable production asset/i, "Copied prompt must include the common production footer.");

assert.equal(
  nextEnvironmentLayerFilename("FS", "Deep Void", ["source-masters/environments/star-system/01_far-stars/FS_001_Midnight.psd", "FS_002_Blue.psd"]),
  "FS_003_DeepVoid.psd",
  "Filename generation must skip existing indexes."
);

const layerProgress: Record<string, EnvironmentLayerProgress> = {
  [firstLayer.id]: {
    status: "approved",
    editablePromptAdditions: "",
    filenameSuffix: "DeepVoid",
    previewRelativePath: "public/previews/fs-001.webp",
    notes: ""
  }
};
const record = buildEnvironmentLayerAssetRecord({
  definition: starSystem,
  layer: firstLayer,
  filename: "FS_001_DeepVoid.psd",
  previewRelativePath: "public/previews/fs-001.webp",
  status: "approved",
  notes: "Approved test record.",
  controls: defaultEnvironmentGeneratorControls,
  now: "2026-07-22T00:00:00.000Z"
});
assert.equal(record.environmentType, "starSystem");
assert.equal(record.layerNumber, 1);
assert.equal(record.sourceRelativePath, "source-masters/environments/star-system/01_far-stars/FS_001_DeepVoid.psd");
assert.equal(record.runtimeExportRelativePath, "source-masters/exports/web/environments/star-system/01_far-stars/FS_001_DeepVoid.webp");
assert(!record.sourceRelativePath.startsWith("/"), "Registration metadata cannot contain absolute paths.");

const progress = calculateEnvironmentGeneratorProgress(starSystem, layerProgress, [record]);
assert.equal(progress.started, 1);
assert.equal(progress.approved, 1);
assert.equal(progress.psdSaved, 1);
assert.equal(progress.registered, 1);

const planetPage = readFileSync(path.join(projectRoot, "app/planet-generation/page.tsx"), "utf8");
assert.match(planetPage, /PlanetGenerationLibrary/, "Planet Generator must remain on its established implementation.");

console.log(JSON.stringify({
  status: "Ready",
  definitions: environmentGeneratorDefinitions.length,
  layers: Object.fromEntries(environmentGeneratorDefinitions.map((row) => [row.id, row.layers.length])),
  sourceRoot: "source-masters",
  planetGenerator: "unchanged"
}, null, 2));
