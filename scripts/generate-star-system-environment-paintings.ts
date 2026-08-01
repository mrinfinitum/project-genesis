import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { generatePsdGameDerivatives } from "@/lib/assets/psd-game-derivatives";
import { generateGalaxy, generateSector, generateStarSystems, generateUniverse } from "@/lib/universe/generator";

const sourceRoot = path.join(process.cwd(), "source-masters", "backgrounds", "star-systems");
const publicRoot = path.join(process.cwd(), "public", "generated", "game-assets", "star-systems");
const publicBase = "/generated/game-assets/star-systems";
const metadataPath = path.join(process.cwd(), "data", "star-system-environment-painting-derivatives.json");

function title(value: string) {
  return value.split("-").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}

type PaintingRecord = {
  id: string;
  systemId: string | null;
  sequence: number | null;
  displayName: string;
  status: string;
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

function currentGeneratedSystemIds() {
  const universe = generateUniverse("PROJECT-GENESIS-UNIVERSE");
  const galaxy = generateGalaxy(universe.universe_seed, 0);
  const sector = generateSector(galaxy, 0);
  return generateStarSystems(sector, 12).map((system) => system.id);
}

function assignPaintings(records: PaintingRecord[], priorAssignments: Map<string, string>) {
  const availableSystemIds = currentGeneratedSystemIds();
  const validSystemIds = new Set(availableSystemIds);
  const claimed = new Set<string>();
  const sorted = [...records].sort((left, right) => {
    if (left.id === "sol") return -1;
    if (right.id === "sol") return 1;
    return left.id.localeCompare(right.id, undefined, { numeric: true });
  });

  for (const record of sorted) {
    if (record.status !== "published") {
      record.systemId = null;
      continue;
    }
    const preferred = record.id === "sol" ? "system-sol" : priorAssignments.get(record.id);
    if (preferred && validSystemIds.has(preferred) && !claimed.has(preferred)) {
      record.systemId = preferred;
      claimed.add(preferred);
    } else {
      record.systemId = null;
    }
  }

  for (const record of sorted) {
    if (record.status !== "published" || record.systemId) continue;
    const nextSystemId = availableSystemIds.find((systemId) => !claimed.has(systemId));
    if (!nextSystemId) break;
    record.systemId = nextSystemId;
    claimed.add(nextSystemId);
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
    `${JSON.stringify({ schemaVersion: "star-system-environment-paintings-v1", records }, null, 2)}\n`
  );
  console.log(`Wrote ${metadataPath}`);
}

async function main() {
  const existingRecords = await readExistingRecords();
  const priorAssignments = new Map(
    existingRecords
      .filter((record) => record.systemId)
      .map((record) => [record.id, record.systemId as string])
  );
  if (process.argv.includes("--assign-only")) {
    await writeMetadata(assignPaintings(existingRecords, priorAssignments));
    return;
  }

  const filenames = (await readdir(sourceRoot))
    .filter((filename) => /^star-system-background-[a-z0-9-]+\.psd$/i.test(filename))
    .sort();
  if (!filenames.length) {
    throw new Error(`No star-system-background-<system>.psd masters found in ${sourceRoot}.`);
  }
  const records = [];
  const checksumOwners = new Map<string, string>();

  for (const filename of filenames) {
    const systemSlug = filename.replace(/^star-system-background-/i, "").replace(/\.psd$/i, "");
    const basename = `environment-painting-${systemSlug}`;
    const outputRoot = path.join(publicRoot, systemSlug, "environment-painting");
    const outputBase = `${publicBase}/${systemSlug}/environment-painting`;
    await mkdir(outputRoot, { recursive: true });

    const sourcePath = path.join(sourceRoot, filename);
    const sourceBuffer = await readFile(sourcePath);
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
    if (!duplicateOf) checksumOwners.set(gamePng.checksum, systemSlug);

    records.push({
      id: systemSlug,
      systemId: systemSlug === "sol" ? "system-sol" : null,
      sequence: /^\d+$/.test(systemSlug) ? Number(systemSlug) : null,
      displayName: `${title(systemSlug)} Environment Painting`,
      status: duplicateOf ? "duplicate" : "published",
      duplicateOf,
      source: generated.source,
      derivatives
    });
    console.log(
      duplicateOf
        ? `${systemSlug}: duplicate composite of ${duplicateOf}; generated but not assignable`
        : `${systemSlug}: ${generated.source.width}x${generated.source.height} PSD -> 3840x2160 game PNG`
    );
  }

  await writeMetadata(assignPaintings(records, priorAssignments));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
