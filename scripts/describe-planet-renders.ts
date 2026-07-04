import { readdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getCompositeImageData, initializeCanvas, readPsd } from "ag-psd";
import { loadEnvConfig } from "@next/env";
import { inferPlanetTaxonomyFromPathParts } from "@/lib/planets/class-model";

loadEnvConfig(process.cwd());

initializeCanvas(
  () => {
    throw new Error("Canvas rendering is not available in this script.");
  },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }) as ImageData
);

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

type OpenAiResponsePayload = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
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
  return /\.(png|jpe?g|webp|psd)$/i.test(filename);
}

function toEightBitRgba(data: Uint8Array | Uint8ClampedArray | Uint16Array | Float32Array, width: number, height: number) {
  if (data instanceof Uint16Array) {
    const rgba = Buffer.alloc(width * height * 4);
    for (let index = 0; index < rgba.length; index += 1) {
      rgba[index] = Math.round(data[index] / 257);
    }
    return rgba;
  }

  if (data instanceof Float32Array) {
    const rgba = Buffer.alloc(width * height * 4);
    for (let index = 0; index < rgba.length; index += 1) {
      rgba[index] = Math.max(0, Math.min(255, Math.round(data[index] * 255)));
    }
    return rgba;
  }

  return Buffer.from(data);
}

async function psdToPngBuffer(file: string) {
  const psd = readPsd(await readFile(file), {
    useImageData: true,
    skipLayerImageData: true,
    skipThumbnail: true,
    throwForMissingFeatures: false
  });
  const imageData = psd.imageData ?? getCompositeImageData(psd);

  if (!imageData?.data) {
    throw new Error(`${file}: PSD does not include readable composite image data. Re-save it from Photoshop with compatibility enabled.`);
  }

  const width = imageData.width || psd.width;
  const height = imageData.height || psd.height;

  return sharp(toEightBitRgba(imageData.data, width, height), {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png()
    .toBuffer();
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

function outputTextFrom(payload: OpenAiResponsePayload) {
  if (payload.output_text) {
    return payload.output_text;
  }

  const nestedText = payload.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .find((text): text is string => Boolean(text));

  return nestedText ?? "";
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

function titleize(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function pathPartsFor(file: string) {
  return path
    .relative(sourceRoot, file)
    .split(path.sep)
    .map((part) => part.replace(/\.[^/.]+$/, ""));
}

function taxonomyForPath(file: string) {
  return inferPlanetTaxonomyFromPathParts(pathPartsFor(file));
}

function applyPathTaxonomy(metadata: PlanetSidecarMetadata, file: string): PlanetSidecarMetadata {
  const taxonomy = taxonomyForPath(file);

  if (!taxonomy) {
    return metadata;
  }

  const tags = [...new Set([taxonomy.planetClass.name, taxonomy.subclass, ...metadata.tags].filter((tag): tag is string => Boolean(tag)))];

  return {
    ...metadata,
    planet_class: taxonomy.planetClass.name,
    biome: taxonomy.subclass ?? metadata.biome,
    tags
  };
}

function inferFromPath(file: string, resolution: number, error?: unknown): PlanetSidecarMetadata {
  const relativePath = path.relative(sourceRoot, file).toLowerCase();
  const tokens = relativePath.split(/[^a-z0-9]+/).filter(Boolean);
  const taxonomy = taxonomyForPath(file);
  const includes = (values: string[]) => values.find((value) => tokens.includes(value.toLowerCase())) ?? "";
  const biome = includes(["ocean", "lava", "volcanic", "ice", "frozen", "desert", "toxic", "gas", "alien", "crater", "barren", "city", "cyberpunk", "forest", "jungle"]);
  const variant = includes(["temperate", "volcanic", "frozen", "arid", "acidic", "amber", "purple", "barren", "cyberpunk"]);
  const colorFamily =
    biome === "lava" || biome === "volcanic"
      ? "Orange"
      : biome === "ice" || biome === "frozen"
        ? "White"
        : biome === "desert"
          ? "Gold"
          : biome === "toxic"
            ? "Green"
            : biome === "ocean"
              ? "Blue"
              : "Unknown";
  const planetClass =
    biome === "gas"
      ? "Gas Giant"
      : biome === "lava" || biome === "volcanic"
        ? "Volcanic World"
        : biome === "ice" || biome === "frozen"
          ? "Ice World"
          : biome === "desert"
            ? "Desert World"
            : biome === "ocean"
              ? "Ocean World"
              : biome
                ? `${titleize(biome)} World`
                : "Unknown World";
  const notes = error instanceof Error ? `AI metadata fallback from filename. Original error: ${error.message}` : "AI metadata fallback from filename.";

  return applyPathTaxonomy(normalizeMetadata(
    {
      planet_class: taxonomy?.planetClass.name ?? planetClass,
      biome: taxonomy?.subclass ?? titleize(biome || "Unknown"),
      atmosphere: "Unknown",
      climate: titleize(variant || "Unknown"),
      color_family: colorFamily,
      has_rings: tokens.includes("ring") || tokens.includes("ringed"),
      water_level: biome === "ocean" ? "high" : biome === "desert" || biome === "lava" || biome === "volcanic" ? "low" : "medium",
      cloud_level: "medium",
      tags: [...new Set(tokens.filter((token) => token !== "planet" && token !== "psd" && !/^\d+$/.test(token)))].slice(0, 16),
      hazards: biome === "lava" || biome === "volcanic" ? ["Extreme Heat", "Lava Flows"] : [],
      traits: variant ? [titleize(variant)] : [],
      rarity: "common",
      notes
    },
    resolution
  ), file);
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
  const imageBuffer = file.toLowerCase().endsWith(".psd") ? await psdToPngBuffer(file) : await readFile(file);
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width ?? 4096;
  const height = metadata.height ?? width;
  const resolution = Math.max(width, height);
  const preview = await sharp(imageBuffer)
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

  const payload = (await response.json().catch(() => ({}))) as OpenAiResponsePayload;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `OpenAI request failed with ${response.status}`);
  }

  const outputText = outputTextFrom(payload);

  if (!outputText) {
    throw new Error("OpenAI response did not include output_text.");
  }

  return normalizeMetadata(parseJsonObject(outputText), resolution);
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

    const { resolution } = await imagePayload(file);
    let metadata: PlanetSidecarMetadata;

    try {
      metadata = applyPathTaxonomy(await describeImage(file), file);
    } catch (error) {
      metadata = inferFromPath(file, resolution, error);
    }

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
