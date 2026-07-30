import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generatePsdGameDerivatives } from "@/lib/assets/psd-game-derivatives";

const sourcePath = path.join(
  process.cwd(),
  "source-masters",
  "ui",
  "navigation",
  "ui-panel-side-menu.psd"
);
const publicRoot = path.join(
  process.cwd(),
  "public",
  "generated",
  "game-assets",
  "ui",
  "navigation"
);
const publicBase = "/generated/game-assets/ui/navigation";
const metadataPath = path.join(
  process.cwd(),
  "data",
  "navigation-background-derivative.json"
);

async function main() {
  const source = await readFile(sourcePath);
  const generated = await generatePsdGameDerivatives(source, {
    basename: "ui-panel-side-menu",
    gameOutput: { width: 640, height: 3160, fit: "inside" },
    previewOutput: { width: 320, height: 1580, fit: "inside" },
    thumbnailOutput: { width: 128, height: 632, fit: "inside" },
    alphaPolicy: "preserve"
  });

  await mkdir(publicRoot, { recursive: true });
  const derivatives = [];

  for (const item of generated.derivatives) {
    await writeFile(path.join(publicRoot, item.filename), item.buffer);
    derivatives.push({
      id: item.id,
      path: `${publicBase}/${item.filename}`,
      format: item.format,
      mimeType: item.mimeType,
      width: item.width,
      height: item.height,
      bytes: item.bytes,
      checksum: item.checksum,
      alpha: item.alpha
    });
  }

  await writeFile(
    metadataPath,
    `${JSON.stringify({
      schemaVersion: "navigation-background-derivative-v1",
      assetId: "asset_ui_panel_side_menu",
      artKey: "ui_panel_side_menu",
      displayName: "Studio Left Navigation Background",
      status: "published",
      source: {
        width: generated.source.width,
        height: generated.source.height,
        checksum: generated.source.checksum
      },
      derivatives
    }, null, 2)}\n`
  );

  console.log(
    `Navigation background: ${generated.source.width}x${generated.source.height} -> ${derivatives[0].width}x${derivatives[0].height}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
