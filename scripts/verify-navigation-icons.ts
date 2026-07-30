import { access, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const expectedAssets = [
  "asset_buildings_icon",
  "asset_civilization_icon",
  "asset_events_icon",
  "asset_galaxy_icon",
  "asset_overview_icon",
  "asset_research_icon",
  "asset_spaceport_icon",
  "asset_upgrades_icon"
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const metadata = JSON.parse(
    await readFile(
      path.join(process.cwd(), "data", "navigation-icon-derivatives.json"),
      "utf8"
    )
  );
  const production = JSON.parse(
    await readFile(
      path.join(process.cwd(), "data", "asset-production.local.json"),
      "utf8"
    )
  );
  const imports = JSON.parse(
    await readFile(
      path.join(process.cwd(), "data", "game-art-imports.local.json"),
      "utf8"
    )
  );
  const serialized = JSON.stringify(metadata);
  assert(
    !/\/Users\/|source-masters|studio-private:\/\/|\.psd/i.test(serialized),
    "Navigation metadata leaks private source information."
  );
  assert(
    metadata.records.length === expectedAssets.length,
    `Expected ${expectedAssets.length} navigation icons, received ${metadata.records.length}.`
  );

  for (const assetId of expectedAssets) {
    const record = metadata.records.find(
      (candidate: { assetId: string }) => candidate.assetId === assetId
    );
    assert(record, `Missing navigation metadata for ${assetId}.`);
    assert(record.status === "published", `${assetId} is not published.`);
    const gamePng = record.derivatives.find(
      (candidate: { id: string }) => candidate.id === "game_png"
    );
    const preview = record.derivatives.find(
      (candidate: { id: string }) => candidate.id === "web_preview"
    );
    const thumbnail = record.derivatives.find(
      (candidate: { id: string }) =>
        candidate.id === "library_thumbnail"
    );
    assert(gamePng?.width === 512 && gamePng?.height === 512,
      `${assetId} game PNG is not 512x512.`);
    assert(preview && thumbnail, `${assetId} is missing preview derivatives.`);
    assert(
      gamePng.alpha.transparentPixelCount > 0,
      `${assetId} game PNG has no transparent pixels.`
    );
    const publicFile = path.join(process.cwd(), "public", gamePng.path);
    await access(publicFile);
    const image = await sharp(publicFile).metadata();
    assert(image.hasAlpha === true, `${assetId} game PNG has no alpha channel.`);

    const imported = imports.assets.find(
      (candidate: { id: string }) => candidate.id === assetId
    );
    assert(imported, `${assetId} is missing from the Asset Library registry.`);
    assert(
      imported.platformMappings?.web?.path === gamePng.path,
      `${assetId} Asset Library Web mapping is stale.`
    );

    const override = production.assets[assetId];
    assert(override, `${assetId} has no production record.`);
    assert(
      override.sourceFiles?.some(
        (source: { isCurrent: boolean; extension: string }) =>
          source.isCurrent && source.extension === ".psd"
      ),
      `${assetId} does not identify its PSD as the current private master.`
    );
  }

  console.log(`Navigation icon verification passed: ${expectedAssets.length} published PSD-backed icons.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
