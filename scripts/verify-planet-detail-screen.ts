import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { auditPlanetDetailScreenSources } from "@/lib/assets/planet-detail-screen-server";
import {
  PLANET_DETAIL_SCREEN_VERSION,
  buildPlanetDetailArtpackDescriptor,
  planetDetailScreenRuntimeContract,
  validatePlanetDetailScreenContract
} from "@/lib/assets/planet-detail-screen";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import {
  buildCanonicalRuntimeExportPayload,
  buildRobloxRuntimePayload,
  gameRuntimeContentVersion
} from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const contractIssues = validatePlanetDetailScreenContract();
  assert(contractIssues.length === 0, contractIssues.join("\n"));
  assert(planetDetailScreenRuntimeContract.slices.length === 25, "Planet Detail Screen must publish 25 canonical slices.");
  assert(planetDetailScreenRuntimeContract.manifest.assets.planetHero === "sprites/PlanetHero_Backplate.png", "Planet Hero manifest mapping is invalid.");
  assert(planetDetailScreenRuntimeContract.referenceResolution.join("x") === "1536x1024", "Reference resolution must remain 1536 x 1024.");

  const audit = await auditPlanetDetailScreenSources();
  assert(audit.summary.sourceCount === 4, "Expected four canonical Planet Detail Screen source PSDs.");
  assert(audit.summary.sourceFilesPresent === 4, `Expected all four source PSDs, found ${audit.summary.sourceFilesPresent}.`);
  assert(audit.sources.every((source) => source.derivativeStatus === "Published"), "Every Planet Detail PSD must have published game derivatives.");
  assert(audit.sources.every((source) => source.gamePngPath && source.previewPath && source.thumbnailPath), "Every Planet Detail PSD derivative set must be complete.");
  for (const source of audit.sources) {
    const gamePngPath = path.join(process.cwd(), "public", source.gamePngPath!);
    const gamePng = sharp(await readFile(gamePngPath));
    const metadata = await gamePng.metadata();
    assert(metadata.format === "png", `${source.id} game derivative is not PNG.`);
    assert(metadata.width === source.width && metadata.height === source.height, `${source.id} game PNG must retain native PSD dimensions.`);
    assert(metadata.hasAlpha === true, `${source.id} game PNG must retain an alpha channel.`);
    const alpha = await sharp(await readFile(gamePngPath)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let transparentPixelCount = 0;
    for (let offset = 3; offset < alpha.data.length; offset += alpha.info.channels) {
      if (alpha.data[offset] === 0) transparentPixelCount += 1;
    }
    assert(transparentPixelCount > 0, `${source.id} game PNG must contain transparent edge pixels.`);
  }

  const publicContract = JSON.stringify(planetDetailScreenRuntimeContract);
  assert(!/\/Users\/|source-masters|studio-private:\/\/|\.psd|\.psb/i.test(publicContract), "Public Planet Detail Screen contract leaks private source data.");

  const descriptor = buildPlanetDetailArtpackDescriptor();
  assert(descriptor.files["PlanetDetailScreen/PlanetDetailScreen.manifest.json"], "Artpack descriptor is missing its screen manifest.");
  assert(descriptor.files["PlanetDetailScreen/sprites/index.json"].length === 25, "Artpack sprite index is incomplete.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(gameRuntimeContentVersion >= 58, "PSD game derivative publication requires contentVersion 58 or newer.");
  assert(runtime.metadata.validationStatus === "Ready", `Canonical runtime is ${runtime.metadata.validationStatus}.`);
  assert(runtime.planetDetailScreen?.version === PLANET_DETAIL_SCREEN_VERSION, "Canonical runtime is missing Planet Detail Screen.");

  const roblox = buildRobloxRuntimePayload(runtime);
  assert(roblox.planetDetailScreen.version === PLANET_DETAIL_SCREEN_VERSION, "Roblox runtime is missing Planet Detail Screen.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map(async (target) => ({ target, payload: await buildGameEngineExport(target) })));
  for (const { target, payload } of exports) {
    assert(payload.validation.status === "Ready", `${target} export is ${payload.validation.status}.`);
    assert(payload.canonical.planet_detail_screen.version === PLANET_DETAIL_SCREEN_VERSION, `${target} export is missing Planet Detail Screen.`);
    assert(!/\/Users\/|source-masters|studio-private:\/\/|\.psd|\.psb/i.test(JSON.stringify(payload.canonical.planet_detail_screen)), `${target} export leaks private source data.`);
  }

  console.log(JSON.stringify({
    status: "Ready",
    contentVersion: runtime.metadata.contentVersion,
    checksum: runtime.metadata.checksum,
    contractVersion: PLANET_DETAIL_SCREEN_VERSION,
    sourceFiles: audit.summary.sourceFilesPresent,
    slices: audit.summary.sliceCount,
    mappedSlices: audit.summary.mappedSlices,
    pendingSourceMappings: audit.summary.pendingSlices,
    gameReadyPsdSources: audit.sources.filter((source) => source.derivativeStatus === "Published").length,
    transparentPsdSources: planetDetailScreenRuntimeContract.sourceArtwork.filter((source) => source.transparentPixelCount > 0).length,
    engineExports: Object.fromEntries(exports.map(({ target, payload }) => [target, payload.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
