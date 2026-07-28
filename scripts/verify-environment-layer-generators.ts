import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  buildEnvironmentLayerAssetRecord,
  buildEnvironmentLayerPrompt,
  calculateEnvironmentGeneratorProgress,
  defaultEnvironmentGeneratorControls,
  environmentArtStandard,
  environmentPaintingOpticalStandard,
  environmentGeneratorDefinitions,
  getEnvironmentGeneratorDefinition,
  migrateEnvironmentLayerAssetRecord,
  migrateEnvironmentLayerProgress,
  nextEnvironmentLayerFilename,
  starSystemAstronomicalMattePaintingPrompt,
  validateEnvironmentGeneratorDefinitions,
  type EnvironmentLayerProgress
} from "../lib/environment-layer-generators";

const projectRoot = process.cwd();
const expected = {
  universe: { count: 6, route: "/universe-layer-generator" },
  galaxy: { count: 10, route: "/galaxy-layer-generator" },
  sector: { count: 10, route: "/sector-layer-generator" },
  starSystem: { count: 8, route: "/star-system-layer-generator" }
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
    assert(
      layer.folder.startsWith("source-masters/environments/") ||
        layer.folder.startsWith("source-masters/galaxies/") ||
        layer.folder.startsWith("source-masters/galactic-regions/") ||
        layer.folder.startsWith("source-masters/star-systems/"),
      `${layer.id} source path escaped source-masters.`
    );
    assert(!path.isAbsolute(layer.folder) && !layer.folder.includes(".."), `${layer.id} source path must be repository-relative.`);
    assert(existsSync(path.join(projectRoot, "game-art", layer.folder, ".gitkeep")), `${layer.id} source folder is not represented.`);
    if (layer.output.transparency !== "opaque") {
      assert.match(layer.canonicalPrompt, /transparent/i, `${layer.id} must include transparency language.`);
    } else {
      assert.doesNotMatch(layer.canonicalPrompt, /transparent png-ready/i, `${layer.id} incorrectly requires transparent output.`);
      assert.match(layer.canonicalPrompt, /vignette/i, `${layer.id} base prompt must explicitly control vignette behavior.`);
      const generatedPrompt = buildEnvironmentLayerPrompt(layer, defaultEnvironmentGeneratorControls);
      assert.match(generatedPrompt, /tilt-shift lens appearance|tilt-shift-style depth treatment/i, `${layer.id} must inherit the tilt-shift lens treatment.`);
      assert.match(generatedPrompt, /no visible banding|do not create visible horizontal or vertical focus bands/i, `${layer.id} must prohibit visible center banding.`);
    }
  }
}

const starSystem = getEnvironmentGeneratorDefinition("starSystem");
const firstLayer = starSystem.layers[0];
const standardImage = path.join(projectRoot, "public", environmentArtStandard.referenceImagePath.replace(/^\//, ""));
assert(existsSync(standardImage), "The canonical Environment Art Standard reference image is missing.");
assert.equal(
  createHash("sha256").update(readFileSync(standardImage)).digest("hex"),
  environmentArtStandard.referenceImageSha256,
  "The canonical Environment Art Standard reference image checksum changed unexpectedly."
);
assert.deepEqual(environmentArtStandard.visualHierarchy, ["Gameplay", "Star", "Planets", "Interactive Elements", "Environment"]);
assert.deepEqual(environmentArtStandard.starDensity, { tinyPercent: 98, mediumPercent: 1.5, brightPercent: 0.5 });
assert.equal(starSystemAstronomicalMattePaintingPrompt.id, "star_system_astronomical_matte_painting_v1");
assert.equal(starSystemAstronomicalMattePaintingPrompt.version, "1.2");
assert.equal(starSystemAstronomicalMattePaintingPrompt.status, "LOCKED");
assert.equal(starSystemAstronomicalMattePaintingPrompt.approved, true);
assert.equal(starSystemAstronomicalMattePaintingPrompt.canonical, true);
assert.equal(starSystemAstronomicalMattePaintingPrompt.quietMode.enabled, true);
assert.deepEqual(
  starSystem.layers.map((layer) => layer.name),
  ["Environment Painting", "Light Rays", "Foreground Dust", "Ambient Particles", "Fog of War", "Orbit Style", "Asteroid Belt", "Selection Effects"],
  "Star System must use the canonical master-painting workflow."
);
assert.deepEqual(
  starSystem.layers.map((layer) => layer.number),
  [1, 2, 3, 4, 5, 6, 7, 8],
  "Star System layer numbers must be sequential."
);
assert.equal(firstLayer.id, "starSystem-01-environment-painting");
assert.equal(firstLayer.prefix, "EP");
assert.match(firstLayer.canonicalPrompt, /quiet deep space/i);
assert.match(firstLayer.canonicalPrompt, /Most stars should be extremely faint/i);
assert.match(firstLayer.canonicalPrompt, /molecular clouds/i);
assert.match(firstLayer.canonicalPrompt, /interstellar dust/i);
assert.match(firstLayer.canonicalPrompt, /cosmic haze/i);
assert.match(firstLayer.canonicalPrompt, /tilt-shift-style depth treatment/i);
assert.match(firstLayer.canonicalPrompt, /central blur bands/i);
assert.match(environmentPaintingOpticalStandard, /central gameplay area naturally sharp/i);
assert.match(firstLayer.canonicalPrompt, /recognizable Milky Way/i);
assert.doesNotMatch(
  starSystem.layers.map((layer) => layer.name).join(" "),
  /Far Stars|Mid Stars|Rear Nebula|Front Nebula|Space Dust/,
  "Retired standalone atmosphere layers cannot reappear."
);
const finishedPrompt = buildEnvironmentLayerPrompt(firstLayer, defaultEnvironmentGeneratorControls);
assert.doesNotMatch(finishedPrompt, /Copy Prompt|Copy Filename|Copy PSD Folder|[{"]assetId["}]/, "Copied prompt must exclude UI labels and JSON.");
assert.equal(finishedPrompt, firstLayer.canonicalPrompt, "The locked Copy Prompt output must exactly match the canonical prompt.");
assert.equal(
  buildEnvironmentLayerPrompt(firstLayer, { ...defaultEnvironmentGeneratorControls, theme: "Must not appear" }, "Must not appear"),
  firstLayer.canonicalPrompt,
  "Controls and editable additions must not alter the locked canonical prompt."
);
assert.equal(
  createHash("sha256").update(firstLayer.canonicalPrompt).digest("hex"),
  "7da3a6acea9f069b0f65616056dd172e7ceb0947203e3208ed02febe591d5f4f",
  "The production-locked prompt changed without an intentional version increment."
);
assert.match(finishedPrompt, /^Create a premium astronomical matte painting for the science-fiction game NOVERIS\./);
assert.match(finishedPrompt, /If this image could be mistaken for a desktop wallpaper, it is too visually busy\./);
assert.match(finishedPrompt, /3840×2160$/);

assert.equal(
  nextEnvironmentLayerFilename("EP", "Deep Void", ["source-masters/environments/star-system/01_environment-painting/EP_001_Midnight.psd", "EP_002_Blue.psd"]),
  "EP_003_DeepVoid.psd",
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
  filename: "EP_001_DeepVoid.psd",
  previewRelativePath: "public/previews/ep-001.webp",
  status: "approved",
  notes: "Approved test record.",
  controls: defaultEnvironmentGeneratorControls,
  now: "2026-07-22T00:00:00.000Z"
});
assert.equal(record.environmentType, "starSystem");
assert.equal(record.layerNumber, 1);
assert.equal(record.sourceRelativePath, "source-masters/star-systems/environment-painting/EP_001_DeepVoid.psd");
assert.equal(record.runtimeExportRelativePath, "source-masters/exports/web/star-systems/environment-painting/EP_001_DeepVoid.webp");
assert(!record.sourceRelativePath.startsWith("/"), "Registration metadata cannot contain absolute paths.");

const migratedProgress = migrateEnvironmentLayerProgress("starSystem", {
  "starSystem-01-far-stars": {
    status: "psd_saved",
    editablePromptAdditions: "Sparse blue-white stars.",
    filenameSuffix: "LegacyStars",
    previewRelativePath: "public/previews/legacy-stars.webp",
    notes: "Existing master."
  },
  "starSystem-03-rear-nebula": {
    status: "needs_revision",
    editablePromptAdditions: "Asymmetrical nebula.",
    filenameSuffix: "LegacyNebula",
    previewRelativePath: "",
    notes: "Needs atmosphere pass."
  }
});
assert.equal(migratedProgress["starSystem-01-environment-painting"].status, "needs_revision");
assert.equal(migratedProgress["starSystem-01-environment-painting"].previewRelativePath, "public/previews/legacy-stars.webp");
assert.match(migratedProgress["starSystem-01-environment-painting"].editablePromptAdditions, /Asymmetrical nebula/);
assert.equal(migratedProgress["starSystem-01-far-stars"], undefined);

const migratedRecord = migrateEnvironmentLayerAssetRecord({
  ...record,
  layerNumber: 7,
  layerType: "light-rays",
  prefix: "LR",
  sourceRelativePath: "source-masters/environments/star-system/07_light-rays/LR_001_Legacy.psd",
  runtimeExportRelativePath: "source-masters/exports/web/environments/star-system/07_light-rays/LR_001_Legacy.webp"
});
assert.equal(migratedRecord.layerNumber, 2);
assert.equal(migratedRecord.sourceRelativePath, "source-masters/environments/star-system/02_light-rays/LR_001_Legacy.psd");
assert.equal(migratedRecord.runtimeExportRelativePath, "source-masters/exports/web/environments/star-system/02_light-rays/LR_001_Legacy.webp");

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
