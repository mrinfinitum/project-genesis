import { readdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type PlanetSidecarMetadata = {
  planet_class: string;
  biome: string;
  atmosphere: string;
  climate: string;
  color_family: string;
  has_rings: boolean;
  water_level: string;
  cloud_level: string;
  tags: string[];
  hazards: string[];
  traits: string[];
  rarity: string;
  resolution: number;
  status: string;
  notes: string;
};

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_PLANET_METADATA_MODEL || "gpt-4.1-mini";
const write = process.argv.includes("--write");
const overwrite = process.argv.includes("--overwrite");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.replace("--limit=", "")) : Number.POSITIVE_INFINITY;
const sourceArg = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "planet-renders";
const sourceRoot = path.resolve(process.cwd(), sourceArg);

function isImage(filename: string) {
  return /\.(png|jpe?g|webp)$/i.test(filename);
}

function mimeType(filename: string) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";

  return "application/octet-stream";
}

function sidecarPathFor(file: string) {
  const parsed = path.parse(file);
  return path.join(parsed.dir, `${parsed.name}.json`);
}

function parseJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace < 0 || lastBrace < firstBrace) {
    throw new Error(`Could not find JSON object in model response: ${text.slice(0, 160)}`);
  }

  return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as Partial<PlanetSidecarMetadata>;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asBoolean(value: unknown) {
  return value === true || String(value).toLowerCase() === "true";
}

function asList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeMetadata(raw: Partial<PlanetSidecarMetadata>, resolution: number): PlanetSidecarMetadata {
  return {
    planet_class: asString(raw.planet_class, "Unknown World"),
    biome: asString(raw.biome, "Unknown"),
    atmosphere: asString(raw.atmosphere, "Unknown"),
    climate: asString(raw.climate, "Unknown"),
    color_family: asString(raw.color_family, "Unknown"),
    has_rings: asBoolean(raw.has_rings),
    water_level: asString(raw.water_level, "medium").toLowerCase(),
    cloud_level: asString(raw.cloud_level, "medium").toLowerCase(),
    tags: asList(raw.tags).slice(0, 16),
    hazards: asList(raw.hazards).slice(0, 8),
    traits: asList(raw.traits).slice(0, 8),
    rarity: asString(raw.rarity, "common").toLowerCase(),
    resolution,
    status: "Ready",
    notes: asString(raw.notes)
  };
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walkFiles(entryPath);
      }

      return entry.isFile() && isImage(entry.name) ? [entryPath] : [];
    })
  );

  return files.flat();
}

async function imagePayload(file: string) {
  const metadata = await sharp(file).metadata();
  const width = metadata.width ?? 4096;
  const height = metadata.height ?? width;
  const resolution = Math.max(width, height);
  const preview = await sharp(file)
    .resize({ width: 768, height: 768, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();

  return {
    dataUrl: `data:image/png;base64,${preview.toString("base64")}`,
    resolution
  };
}

async function describeImage(file: string): Promise<PlanetSidecarMetadata> {
  if (!apiKey) {
    throw new Error("Set OPENAI_API_KEY in .env.local before describing planet renders.");
  }

  const { dataUrl, resolution } = await imagePayload(file);
  const relativePath = path.relative(sourceRoot, file).split(path.sep).join("/");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Analyze this isolated planet render for a game asset library.",
                "Return only a compact JSON object with these keys:",
                "planet_class, biome, atmosphere, climate, color_family, has_rings, water_level, cloud_level, tags, hazards, traits, rarity, notes.",
                "Use only visible evidence from the image plus filename/folder hints.",
                "Allowed water_level and cloud_level values: low, medium, high.",
                "Allowed rarity values: common, uncommon, rare, epic, legendary.",
                "Keep tags short and useful for matching generated planet metadata.",
                `Filename and folder path: ${relativePath}`
              ].join(" ")
            },
            {
              type: "input_image",
              image_url: dataUrl
            }
          ]
        }
      ]
    })
  });

  const payload = (await response.json().catch(() => ({}))) as { output_text?: string; error?: { message?: string } };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `OpenAI request failed with ${response.status}`);
  }

  if (!payload.output_text) {
    throw new Error("OpenAI response did not include output_text.");
  }

  return normalizeMetadata(parseJsonObject(payload.output_text), resolution);
}

async function main() {
  const rootStat = await stat(sourceRoot).catch(() => null);

  if (!rootStat?.isDirectory()) {
    console.log(`No planet render folder found at ${sourceRoot}`);
    console.log("Usage: npm run describe:planet-renders -- ./planet-renders --write");
    return;
  }

  const files = (await walkFiles(sourceRoot)).sort().slice(0, Number.isFinite(limit) ? limit : undefined);

  for (const file of files) {
    const sidecarPath = sidecarPathFor(file);
    const existing = await stat(sidecarPath).catch(() => null);

    if (existing && !overwrite) {
      console.log(`Skipping existing ${path.relative(sourceRoot, sidecarPath)}`);
      continue;
    }

    const metadata = await describeImage(file);
    const json = `${JSON.stringify(metadata, null, 2)}\n`;
    console.log(`${write ? "Writing" : "Would write"} ${path.relative(sourceRoot, sidecarPath)}`);
    console.log(json);

    if (write) {
      await writeFile(sidecarPath, json);
    }
  }

  console.log(`${write ? "Wrote" : "Dry run described"} sidecar metadata for ${files.length} image${files.length === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
