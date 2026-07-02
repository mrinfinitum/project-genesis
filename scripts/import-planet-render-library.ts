import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { getCompositeImageData, initializeCanvas, readPsd } from "ag-psd";
import { loadEnvConfig } from "@next/env";
import type { PlanetRenderLibraryRecord } from "@/types/schema";

loadEnvConfig(process.cwd());

initializeCanvas(
  () => {
    throw new Error("Canvas rendering is not available in this script.");
  },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }) as ImageData
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_ASSET_BUCKET || "project-genesis-assets";
const apply = process.argv.includes("--apply");
const sourceArg = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "planet-render-library";
const sourceRoot = path.resolve(process.cwd(), sourceArg);

type PlanetRenderMetadata = Partial<Omit<PlanetRenderLibraryRecord, "created_at" | "updated_at">>;

const supabase =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
    : null;

function slug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "planet-render";
}

function assetId(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "planet_render";
}

function titleize(input: string) {
  return input
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function contentTypeFor(filename: string) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".psd")) return "image/vnd.adobe.photoshop";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";

  return "application/octet-stream";
}

function isImage(filename: string) {
  return /\.(png|jpe?g|webp|psd)$/i.test(filename);
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

function inferResolution(filename: string, metadata: PlanetRenderMetadata) {
  const fromMeta = Number(metadata.resolution || metadata.width || metadata.height);
  if (Number.isFinite(fromMeta) && fromMeta > 0) {
    return Math.round(fromMeta);
  }

  const match = filename.match(/(?:^|[^0-9])([1-9][0-9]{2,4})(?:x\1)?(?:[^0-9]|$)/i);
  return match ? Number(match[1]) : 4096;
}

function inferValue(parts: string[], options: string[]) {
  const lowerParts = parts.map((part) => part.toLowerCase());
  return options.find((option) => lowerParts.some((part) => part.includes(option.toLowerCase()))) ?? "";
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
  const buffer = await sharp(toEightBitRgba(imageData.data, width, height), {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png()
    .toBuffer();

  return { buffer, width, height };
}

async function renderAssetFor(file: string, metadata: PlanetRenderMetadata) {
  const filename = path.basename(file);

  if (filename.toLowerCase().endsWith(".psd")) {
    const rendered = await psdToPngBuffer(file);
    return {
      buffer: rendered.buffer,
      width: Number(metadata.width ?? rendered.width),
      height: Number(metadata.height ?? rendered.height),
      filename: `${path.parse(filename).name}.png`,
      contentType: "image/png",
      sourceBuffer: await readFile(file),
      sourceFilename: filename,
      sourceContentType: contentTypeFor(filename)
    };
  }

  const buffer = await readFile(file);
  const imageMetadata = await sharp(buffer).metadata();
  return {
    buffer,
    width: Number(metadata.width ?? imageMetadata.width ?? 4096),
    height: Number(metadata.height ?? imageMetadata.height ?? imageMetadata.width ?? 4096),
    filename,
    contentType: contentTypeFor(filename),
    sourceBuffer: null as Buffer | null,
    sourceFilename: "",
    sourceContentType: ""
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

async function readMetadata(file: string): Promise<PlanetRenderMetadata> {
  const parsed = path.parse(file);
  const sidecars = [path.join(parsed.dir, `${parsed.name}.json`), path.join(parsed.dir, "metadata.json")];

  for (const sidecar of sidecars) {
    try {
      return JSON.parse(await readFile(sidecar, "utf8")) as PlanetRenderMetadata;
    } catch {
      // Sidecar metadata is optional.
    }
  }

  return {};
}

async function publicUrlFor(storagePath: string) {
  if (!supabase) {
    return "";
  }

  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

async function main() {
  const rootStat = await stat(sourceRoot).catch(() => null);

  if (!rootStat?.isDirectory()) {
    console.log(`No planet render folder found at ${sourceRoot}`);
    console.log("Usage: npm run import:planet-renders -- ./planet-renders --apply");
    return;
  }

  if (apply && !supabase) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing planet renders.");
  }

  const files = await walkFiles(sourceRoot);
  const rows: PlanetRenderLibraryRecord[] = [];

  for (const file of files) {
    const metadata = await readMetadata(file);
    const relativePath = path.relative(sourceRoot, file);
    const asset = await renderAssetFor(file, metadata);
    const filename = asset.filename;
    const pathParts = relativePath.split(path.sep).map((part) => part.replace(/\.[^/.]+$/, ""));
    const id = String(metadata.id ?? assetId(path.parse(filename).name));
    const storagePath = String(metadata.storage_path ?? `planet-render-library/${id}/${filename}`);
    const sourceStoragePath =
      asset.sourceBuffer && asset.sourceFilename ? `planet-render-library/${id}/source/${asset.sourceFilename}` : "";
    const resolution = inferResolution(filename, metadata);
    const width = Number(metadata.width ?? asset.width ?? resolution);
    const height = Number(metadata.height ?? asset.height ?? resolution);
    const fileUrl = String(metadata.file_url ?? (await publicUrlFor(storagePath)));
    const sourceFileUrl = sourceStoragePath ? await publicUrlFor(sourceStoragePath) : "";
    const inferredBiome = inferValue(pathParts, ["Ocean", "Desert", "Ice", "Lava", "Volcanic", "Crystal", "Toxic", "Void", "Forest", "Jungle", "Swamp", "Cyber", "Artificial"]);
    const inferredClass = inferValue(pathParts, ["Ocean World", "Desert World", "Ice World", "Volcanic World", "Crystal World", "Toxic World", "Void World", "Gas Giant", "Terrestrial"]);

    const row: PlanetRenderLibraryRecord = {
      id,
      name: String(metadata.name ?? titleize(path.parse(filename).name)),
      file_url: fileUrl,
      storage_path: storagePath,
      thumbnail_url: String(metadata.thumbnail_url ?? ""),
      planet_class: String(metadata.planet_class ?? inferredClass),
      biome: String(metadata.biome ?? inferredBiome),
      atmosphere: String(metadata.atmosphere ?? inferValue(pathParts, ["Dense", "Thin", "Toxic", "Ionized", "Methane"])),
      climate: String(metadata.climate ?? inferValue(pathParts, ["Temperate", "Arid", "Frozen", "Tropical", "Storm", "Barren"])),
      color_family: String(metadata.color_family ?? inferValue(pathParts, ["Blue", "Green", "Red", "Orange", "Purple", "Cyan", "White", "Black"])),
      has_rings: Boolean(metadata.has_rings ?? /ring/i.test(relativePath)),
      water_level: String(metadata.water_level ?? inferValue(pathParts, ["High", "Medium", "Low"])),
      cloud_level: String(metadata.cloud_level ?? inferValue(pathParts, ["High", "Medium", "Low"])),
      tags: asList(metadata.tags ?? pathParts.join(",")),
      hazards: asList(metadata.hazards),
      traits: asList(metadata.traits),
      image_variants: metadata.image_variants ?? [
        {
          size: resolution,
          width,
          height,
          url: fileUrl,
          path: storagePath,
          filename
        }
      ],
      rarity: String(metadata.rarity ?? "common"),
      resolution,
      width,
      height,
      usage_count: Number(metadata.usage_count ?? 0),
      status: metadata.status ?? "Ready",
      notes: String(
        metadata.notes ??
          (sourceStoragePath
            ? `Source PSD: ${sourceStoragePath}${sourceFileUrl ? `\nSource PSD URL: ${sourceFileUrl}` : ""}`
            : "")
      ),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    rows.push(row);
    console.log(`${apply ? "Importing" : "Would import"} ${relativePath} -> ${row.id}`);

    if (apply && supabase) {
      const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, asset.buffer, {
        contentType: asset.contentType,
        upsert: true
      });

      if (uploadError) {
        throw new Error(`${storagePath}: ${uploadError.message}`);
      }

      if (sourceStoragePath && asset.sourceBuffer) {
        const { error: sourceUploadError } = await supabase.storage.from(bucket).upload(sourceStoragePath, asset.sourceBuffer, {
          contentType: asset.sourceContentType,
          upsert: true
        });

        if (sourceUploadError) {
          const warning = `Source PSD upload skipped: ${sourceUploadError.message}`;
          row.notes = row.notes ? `${row.notes}\n${warning}` : warning;
          console.warn(`${sourceStoragePath}: ${warning}`);
        }
      }
    }
  }

  if (apply && supabase && rows.length) {
    const { error } = await supabase.from("planet_render_library").upsert(rows);

    if (error) {
      throw error;
    }
  }

  console.log(`${apply ? "Imported" : "Dry run found"} ${rows.length} planet render${rows.length === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
