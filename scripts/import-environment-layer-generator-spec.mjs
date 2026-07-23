import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath = process.argv[3] ?? "data/environment-layer-generator-definitions.json";

if (!inputPath) {
  throw new Error("Usage: node scripts/import-environment-layer-generator-spec.mjs <spec.txt> [output.json]");
}

const source = await readFile(inputPath, "utf8");
const sectionMarkers = [
  { id: "universe", heading: "UNIVERSE LAYER GENERATOR", route: "/universe-layer-generator" },
  { id: "galaxy", heading: "GALAXY LAYER GENERATOR", route: "/galaxy-layer-generator" },
  { id: "sector", heading: "SECTOR LAYER GENERATOR", route: "/sector-layer-generator" },
  { id: "starSystem", heading: "STAR SYSTEM LAYER GENERATOR", route: "/star-system-layer-generator" }
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseOutput(value) {
  const dimensions = value.match(/(\d+)\s*×\s*(\d+)/);
  const width = Number(dimensions?.[1] ?? 3840);
  const height = Number(dimensions?.[2] ?? 2160);
  const transparency = /transparent preferred/i.test(value)
    ? "preferred"
    : /transparent/i.test(value)
      ? "required"
      : "opaque";

  return {
    width,
    height,
    aspectRatio: /16:9/i.test(value) || width / height > 1.5 ? "16:9" : "1:1",
    transparency
  };
}

const definitions = sectionMarkers.map((marker, index) => {
  const start = source.indexOf(marker.heading);
  const end = index + 1 < sectionMarkers.length
    ? source.indexOf(sectionMarkers[index + 1].heading)
    : source.indexOf("PAGE CARD DESIGN", start);

  if (start < 0 || end < 0) {
    throw new Error(`Unable to locate ${marker.heading}.`);
  }

  const section = source.slice(start, end);
  const title = section.match(/Page title:\s*\n\s*([^\n]+)/)?.[1]?.trim();
  const sourceRoot = section.match(/Source root:\s*\n\s*([^\n]+)/)?.[1]?.trim();
  const layerPattern = /-{60}\s*\n(\d{2})\s+—\s+([^\n]+)\s*\n-{60}\s*\n\s*(?:Asset prefix|Prefix):\s*\n([^\n]+)\s*\n\s*Folder:\s*\n([^\n]+)\s*\n\s*Output:\s*\n([^\n]+)\s*\n\s*(?:Canonical prompt|Prompt):\s*\n([\s\S]*?)(?=\n-{60}|\n={60})/g;
  const layers = [];

  for (const match of section.matchAll(layerPattern)) {
    const number = Number(match[1]);
    const name = match[2].trim();
    const folder = match[4].trim();
    const folderName = folder.split("/").filter(Boolean).at(-1);
    const output = parseOutput(match[5].trim());
    const canonicalPrompt = match[6].trim();

    layers.push({
      id: `${marker.id}-${String(number).padStart(2, "0")}-${slugify(name)}`,
      number,
      name,
      layerType: slugify(name),
      prefix: match[3].trim(),
      folder,
      runtimeExportFolder: `source-masters/exports/web/environments/${marker.id === "starSystem" ? "star-system" : marker.id}/${folderName}/`,
      output,
      purpose: canonicalPrompt.split(/\n\s*\n/)[0],
      canonicalPrompt
    });
  }

  if (!title || !sourceRoot || layers.length === 0) {
    throw new Error(`Incomplete generator definition for ${marker.heading}.`);
  }

  return {
    id: marker.id,
    name: title,
    route: marker.route,
    sourceRoot,
    layers
  };
});

await writeFile(
  path.resolve(outputPath),
  `${JSON.stringify({ schemaVersion: "1.0.0", definitions }, null, 2)}\n`
);

console.log(`Wrote ${definitions.length} environment generator definitions and ${definitions.reduce((sum, row) => sum + row.layers.length, 0)} layers to ${outputPath}.`);
