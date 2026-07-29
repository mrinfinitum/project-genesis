import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generatePsdGameDerivatives } from "@/lib/assets/psd-game-derivatives";

const sources = [
  { id: "biome-environment", filename: "biome-enviroment.psd", displayName: "Biome Environment" },
  { id: "creatures-life", filename: "creatures-life.psd", displayName: "Creatures & Life" },
  { id: "resources", filename: "resources.psd", displayName: "Resources" },
  { id: "weather-climate", filename: "weather-climate.psd", displayName: "Weather & Climate" }
] as const;

const sourceRoot = path.join(process.cwd(), "source-masters", "ui", "screens", "planet-detail");
const publicRoot = path.join(process.cwd(), "public", "generated", "game-assets", "ui", "screens", "planet-detail");
const publicBase = "/generated/game-assets/ui/screens/planet-detail";
const metadataPath = path.join(process.cwd(), "data", "planet-detail-screen-derivatives.json");

async function main() {
  await mkdir(publicRoot, { recursive: true });
  const records = [];

  for (const source of sources) {
    const buffer = await readFile(path.join(sourceRoot, source.filename));
    const generated = await generatePsdGameDerivatives(buffer, {
      basename: source.id,
      alphaPolicy: "remove_edge_white_matte",
      requireTransparentPixels: true
    });
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

    records.push({
      id: source.id,
      displayName: source.displayName,
      status: "published",
      source: generated.source,
      derivatives
    });
    console.log(`${source.id}: ${generated.source.width}x${generated.source.height}`);
  }

  await writeFile(
    metadataPath,
    `${JSON.stringify({ schemaVersion: "psd-game-derivatives-v2", records }, null, 2)}\n`
  );
  console.log(`Wrote ${metadataPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
