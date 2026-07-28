import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { generatePsdGameDerivatives } from "@/lib/assets/psd-game-derivatives";
import { MILKY_WAY_GALACTIC_REGIONS } from "@/lib/universe/generator";

const sourceRoot = path.join(process.cwd(), "source-masters", "galactic-regions", "environment-painting");
const publicRoot = path.join(process.cwd(), "public", "generated", "game-assets", "galactic-regions");
const publicBase = "/generated/game-assets/galactic-regions";
const metadataPath = path.join(process.cwd(), "data", "galactic-region-environment-painting-derivatives.json");

type PaintingRecord = {
  id: string;
  galacticRegionId: string | null;
  sequence: number | null;
  displayName: string;
  status: "published" | "duplicate";
  duplicateOf: string | null;
  source: { width: number; height: number; checksum: string; bytes: number };
  derivatives: Array<{
    id: string;
    path: string;
    format: string;
    mimeType: string;
    width: number;
    height: number;
    bytes: number;
    checksum: string;
  }>;
};

function title(value: string) {
  return value.split("-").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}

function assignPaintings(records: PaintingRecord[], priorAssignments: Map<string, string>) {
  const validRegionIds = new Set<string>(MILKY_WAY_GALACTIC_REGIONS.map((region) => region.id));
  const claimed = new Set<string>();
  const sorted = [...records].sort((left, right) => {
    if (left.id === "orion-spur") return -1;
    if (right.id === "orion-spur") return 1;
    return left.id.localeCompare(right.id, undefined, { numeric: true });
  });

  for (const record of sorted) {
    if (record.status !== "published") {
      record.galacticRegionId = null;
      continue;
    }
    const preferred = record.id === "orion-spur" ? "sector-local-bubble" : priorAssignments.get(record.id);
    if (preferred && validRegionIds.has(preferred) && !claimed.has(preferred)) {
      record.galacticRegionId = preferred;
      claimed.add(preferred);
    } else {
      record.galacticRegionId = null;
    }
  }

  const remainingRegionIds = MILKY_WAY_GALACTIC_REGIONS
    .map((region) => region.id)
    .filter((regionId) => !claimed.has(regionId));
  for (const record of sorted) {
    if (record.status !== "published" || record.galacticRegionId) continue;
    const regionId = remainingRegionIds.shift();
    if (!regionId) break;
    record.galacticRegionId = regionId;
    claimed.add(regionId);
  }

  return records;
}

async function readExistingRecords() {
  try {
    const parsed = JSON.parse(await readFile(metadataPath, "utf8")) as { records?: PaintingRecord[] };
    return parsed.records ?? [];
  } catch {
    return [];
  }
}

async function writeMetadata(records: PaintingRecord[]) {
  await writeFile(
    metadataPath,
    `${JSON.stringify({ schemaVersion: "galactic-region-environment-paintings-v1", records }, null, 2)}\n`
  );
  console.log(`Wrote ${metadataPath}`);
}

async function main() {
  const existingRecords = await readExistingRecords();
  const priorAssignments = new Map(
    existingRecords
      .filter((record) => record.galacticRegionId)
      .map((record) => [record.id, record.galacticRegionId as string])
  );
  if (process.argv.includes("--assign-only")) {
    await writeMetadata(assignPaintings(existingRecords, priorAssignments));
    return;
  }

  const filenames = (await readdir(sourceRoot))
    .filter((filename) => /^environment-painting-[a-z0-9-]+\.psd$/i.test(filename))
    .sort();
  if (!filenames.length) {
    throw new Error(`No Galactic Region environment paintings found in ${sourceRoot}.`);
  }

  const records: PaintingRecord[] = [];
  const checksumOwners = new Map<string, string>();
  for (const filename of filenames) {
    const paintingId = filename.replace(/^environment-painting-/i, "").replace(/\.psd$/i, "");
    const basename = `environment-painting-${paintingId}`;
    const outputRoot = path.join(publicRoot, paintingId, "environment-painting");
    const outputBase = `${publicBase}/${paintingId}/environment-painting`;
    await mkdir(outputRoot, { recursive: true });

    const sourceBuffer = await readFile(path.join(sourceRoot, filename));
    const generated = await generatePsdGameDerivatives(sourceBuffer, {
      basename,
      gameOutput: { width: 3840, height: 2160, fit: "cover" },
      previewOutput: { width: 1600, height: 900, fit: "cover" },
      thumbnailOutput: { width: 512, height: 288, fit: "cover" }
    });
    const derivatives = [];
    for (const item of generated.derivatives) {
      await writeFile(path.join(outputRoot, item.filename), item.buffer);
      derivatives.push({
        id: item.id,
        path: `${outputBase}/${item.filename}`,
        format: item.format,
        mimeType: item.mimeType,
        width: item.width,
        height: item.height,
        bytes: item.bytes,
        checksum: item.checksum
      });
    }

    const gamePng = generated.derivatives.find((item) => item.id === "game_png");
    if (!gamePng) throw new Error(`${filename} did not produce a game PNG.`);
    const duplicateOf = checksumOwners.get(gamePng.checksum) ?? null;
    if (!duplicateOf) checksumOwners.set(gamePng.checksum, paintingId);
    records.push({
      id: paintingId,
      galacticRegionId: paintingId === "orion-spur" ? "sector-local-bubble" : null,
      sequence: /^\d+$/.test(paintingId) ? Number(paintingId) : null,
      displayName: `${title(paintingId)} Environment Painting`,
      status: duplicateOf ? "duplicate" : "published",
      duplicateOf,
      source: generated.source,
      derivatives
    });
    console.log(duplicateOf ? `${paintingId}: duplicate of ${duplicateOf}` : `${paintingId}: generated`);
  }

  await writeMetadata(assignPaintings(records, priorAssignments));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
