import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { getCompositeImageData, initializeCanvas, readPsd } from "ag-psd";
import { loadEnvConfig } from "@next/env";
import { inferPlanetTaxonomyFromPathParts } from "@/lib/planets/class-model";
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
const overwrite = process.argv.includes("--overwrite") || process.argv.includes("--force");
const uploadPsdSources = process.argv.includes("--upload-psd-source");
const sourceArg = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "planet-render-library";
const sourceRoot = path.resolve(process.cwd(), sourceArg);

type PlanetRenderMetadata = Partial<Omit<PlanetRenderLibraryRecord, "created_at" | "updated_at">>;
type CompanionKind = "landscape" | "orbital";
type RenderAsset = Awaited<ReturnType<typeof renderAssetFor>>;
type CompanionUpload = {
  file: string;
  kind: CompanionKind;
  baseId: string;
  metadata: PlanetRenderMetadata;
};

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

function companionInfoForFilename(filename: string): { kind: CompanionKind; baseName: string } | null {
  const name = path.parse(filename).name;
  const normalized = name.toLowerCase();
  const numberedMatch = normalized.match(/(?:_|-)(surface_landscape|landscape|surface|orbital_platform|orbital|platform)(?:_|-)([0-9]+)$/i);

  if (numberedMatch?.index !== undefined) {
    const token = numberedMatch[1];
    const number = numberedMatch[2];
    const kind: CompanionKind = /orbital|platform/i.test(token) ? "orbital" : "landscape";
    const baseName = `${name.slice(0, numberedMatch.index)}_${number}`;
    return { kind, baseName };
  }

  const patterns: Array<{ kind: CompanionKind; pattern: RegExp }> = [
    { kind: "landscape", pattern: /(?:_|-)(?:surface_)?landscape$/i },
    { kind: "landscape", pattern: /(?:_|-)surface$/i },
    { kind: "orbital", pattern: /(?:_|-)(?:orbital|orbital_platform|platform)$/i }
  ];

  for (const item of patterns) {
    if (item.pattern.test(normalized)) {
      const baseName = name.replace(item.pattern, "");
      return { kind: item.kind, baseName };
    }
  }

  return null;
}

function baseRenderIdFor(file: string, metadata: PlanetRenderMetadata) {
  const filenameInfo = companionInfoForFilename(path.basename(file));
  return String(metadata.id ?? assetId(filenameInfo?.baseName ?? path.parse(file).name));
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
  const lowerParts = parts.map((part) => slug(part));
  return (
    options.find((option) => {
      const lowerOption = slug(option);
      return lowerParts.some((part) => part.includes(lowerOption) || lowerOption.includes(part));
    }) ?? ""
  );
}

function taxonomyForPath(parts: string[]) {
  return inferPlanetTaxonomyFromPathParts(parts);
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

function isWhiteBackgroundPixel(data: Buffer, pixelOffset: number) {
  const alpha = data[pixelOffset + 3];
  if (alpha <= 8) {
    return true;
  }

  const red = data[pixelOffset];
  const green = data[pixelOffset + 1];
  const blue = data[pixelOffset + 2];
  const brightest = Math.max(red, green, blue);
  const darkest = Math.min(red, green, blue);

  return alpha > 0 && darkest >= 225 && brightest - darkest <= 35;
}

function removeEdgeWhiteBackground(data: Buffer, width: number, height: number) {
  const output = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  function enqueue(x: number, y: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const index = y * width + x;
    if (visited[index]) {
      return;
    }

    const pixelOffset = index * 4;
    if (!isWhiteBackgroundPixel(output, pixelOffset)) {
      return;
    }

    visited[index] = 1;
    queue.push(index);
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    const x = index % width;
    const y = Math.floor(index / width);
    const pixelOffset = index * 4;
    output[pixelOffset + 3] = 0;

    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  return output;
}

function trimTransparentPixels(data: Buffer, width: number, height: number) {
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 8) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < left || bottom < top) {
    return { data, width, height };
  }

  const nextWidth = right - left + 1;
  const nextHeight = bottom - top + 1;
  const nextData = Buffer.alloc(nextWidth * nextHeight * 4);

  for (let y = 0; y < nextHeight; y += 1) {
    const sourceStart = ((top + y) * width + left) * 4;
    const sourceEnd = sourceStart + nextWidth * 4;
    data.copy(nextData, y * nextWidth * 4, sourceStart, sourceEnd);
  }

  return { data: nextData, width: nextWidth, height: nextHeight };
}

function hasTransparentNeighbor(data: Buffer, width: number, height: number, x: number, y: number) {
  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (!offsetX && !offsetY) {
        continue;
      }

      const nextX = x + offsetX;
      const nextY = y + offsetY;

      if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) {
        return true;
      }

      if (data[(nextY * width + nextX) * 4 + 3] <= 8) {
        return true;
      }
    }
  }

  return false;
}

function removeLightMatteFringe(data: Buffer, width: number, height: number) {
  let output = Buffer.from(data);

  for (let pass = 0; pass < 3; pass += 1) {
    const next = Buffer.from(output);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixelOffset = (y * width + x) * 4;
        const alpha = output[pixelOffset + 3];

        if (alpha <= 8 || !hasTransparentNeighbor(output, width, height, x, y)) {
          continue;
        }

        const red = output[pixelOffset];
        const green = output[pixelOffset + 1];
        const blue = output[pixelOffset + 2];
        const brightest = Math.max(red, green, blue);
        const darkest = Math.min(red, green, blue);
        const average = (red + green + blue) / 3;
        const isNeutralFringe = brightest - darkest <= 70 && average >= 105;

        if (!isNeutralFringe) {
          continue;
        }

        const nextAlpha = pass === 0 ? 0 : Math.min(alpha, 96);
        next[pixelOffset] = Math.round(red * 0.45);
        next[pixelOffset + 1] = Math.round(green * 0.45);
        next[pixelOffset + 2] = Math.round(blue * 0.45);
        next[pixelOffset + 3] = nextAlpha;
      }
    }

    output = next;
  }

  return output;
}

function softenSilhouetteEdge(data: Buffer, width: number, height: number) {
  let output = Buffer.from(data);
  const transparentPasses = 5;
  const featherPasses = 4;

  for (let pass = 0; pass < transparentPasses + featherPasses; pass += 1) {
    const next = Buffer.from(output);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixelOffset = (y * width + x) * 4;
        const alpha = output[pixelOffset + 3];

        if (alpha <= 8 || !hasTransparentNeighbor(output, width, height, x, y)) {
          continue;
        }

        if (pass < transparentPasses) {
          next[pixelOffset + 3] = 0;
          continue;
        }

        const featherIndex = pass - transparentPasses;
        const alphaScales = [0.28, 0.45, 0.64, 0.82];
        const colorScales = [0.34, 0.44, 0.58, 0.76];
        const alphaScale = alphaScales[featherIndex] ?? 0.82;
        const colorScale = colorScales[featherIndex] ?? 0.76;

        next[pixelOffset] = Math.round(output[pixelOffset] * colorScale);
        next[pixelOffset + 1] = Math.round(output[pixelOffset + 1] * colorScale);
        next[pixelOffset + 2] = Math.round(output[pixelOffset + 2] * colorScale);
        next[pixelOffset + 3] = Math.round(alpha * alphaScale);
      }
    }

    output = next;
  }

  return output;
}

function blendOuterPlanetLimb(data: Buffer, width: number, height: number) {
  const output = Buffer.from(data);
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < left || bottom < top) {
    return output;
  }

  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const radiusX = Math.max(1, (right - left + 1) / 2);
  const radiusY = Math.max(1, (bottom - top + 1) / 2);

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const pixelOffset = (y * width + x) * 4;
      const alpha = data[pixelOffset + 3];

      if (alpha <= 8) {
        continue;
      }

      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

      if (distance < 0.948) {
        continue;
      }

      const edgeAmount = Math.min(1, Math.max(0, (distance - 0.948) / 0.052));
      const colorScale = 1 - edgeAmount * 0.74;
      const alphaScale = 1 - edgeAmount * 0.18;

      output[pixelOffset] = Math.round(data[pixelOffset] * colorScale);
      output[pixelOffset + 1] = Math.round(data[pixelOffset + 1] * colorScale);
      output[pixelOffset + 2] = Math.round(data[pixelOffset + 2] * colorScale);
      output[pixelOffset + 3] = Math.round(alpha * alphaScale);
    }
  }

  return output;
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
  const rgba = blendOuterPlanetLimb(
    softenSilhouetteEdge(
      removeLightMatteFringe(removeEdgeWhiteBackground(toEightBitRgba(imageData.data, width, height), width, height), width, height),
      width,
      height
    ),
    width,
    height
  );
  const trimmed = trimTransparentPixels(rgba, width, height);
  const buffer = await sharp(trimmed.data, {
    raw: {
      width: trimmed.width,
      height: trimmed.height,
      channels: 4
    }
  })
    .png()
    .toBuffer();

  return { buffer, width: trimmed.width, height: trimmed.height };
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

function cacheBustUrl(url: string, version: string) {
  if (!url) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${version}`;
}

function companionFields(kind: CompanionKind) {
  return kind === "landscape"
    ? {
        imageUrlKey: "landscape_image_url" as const,
        storagePathKey: "landscape_storage_path" as const,
        sourcePathKey: "landscape_source_path" as const,
        folder: "landscape"
      }
    : {
        imageUrlKey: "orbital_image_url" as const,
        storagePathKey: "orbital_storage_path" as const,
        sourcePathKey: "orbital_source_path" as const,
        folder: "orbital"
      };
}

async function uploadCompanionArtwork(companion: CompanionUpload, importVersion: string, existingRow?: PlanetRenderLibraryRecord) {
  if (!supabase) {
    return {};
  }

  const fields = companionFields(companion.kind);
  const existingUrl = String(existingRow?.[fields.imageUrlKey] ?? "");

  if (existingUrl && !overwrite) {
    console.log(`Skipping existing ${companion.kind} artwork for ${companion.baseId}. Use --overwrite to reprocess.`);
    return {};
  }

  const asset = await renderAssetFor(companion.file, companion.metadata);
  const storagePath = String(companion.metadata[fields.storagePathKey] ?? `planet-render-library/${companion.baseId}/${fields.folder}/${asset.filename}`);
  const sourceStoragePath =
    asset.sourceBuffer && asset.sourceFilename ? `planet-render-library/${companion.baseId}/${fields.folder}/source/${asset.sourceFilename}` : "";
  const fileUrl = String(companion.metadata[fields.imageUrlKey] ?? cacheBustUrl(await publicUrlFor(storagePath), importVersion));

  console.log(`${apply ? "Uploading" : "Would upload"} ${companion.kind} artwork ${path.relative(sourceRoot, companion.file)} -> ${companion.baseId}`);

  if (apply) {
    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, asset.buffer, {
      contentType: asset.contentType,
      upsert: true
    });

    if (uploadError) {
      throw new Error(`${storagePath}: ${uploadError.message}`);
    }

    if (sourceStoragePath && asset.sourceBuffer && uploadPsdSources) {
      const { error: sourceUploadError } = await supabase.storage.from(bucket).upload(sourceStoragePath, asset.sourceBuffer, {
        contentType: asset.sourceContentType,
        upsert: true
      });

      if (sourceUploadError) {
        console.warn(`${sourceStoragePath}: Source PSD upload skipped: ${sourceUploadError.message}`);
      }
    }
  }

  return {
    [fields.imageUrlKey]: fileUrl,
    [fields.storagePathKey]: storagePath,
    [fields.sourcePathKey]: sourceStoragePath
  };
}

async function syncGeneratedPlanetRenderUrls(rows: PlanetRenderLibraryRecord[]) {
  if (!supabase || !rows.length) {
    return;
  }

  const { data, error } = await supabase.from("generated_planets").select("*");

  if (error) {
    console.warn(`Generated planet image URL sync skipped: ${error.message}`);
    return;
  }

  const updates = (data ?? []).flatMap((planet) => {
    const matchingRender = rows.find((row) => {
      const variants = (Array.isArray(planet.image_variants) ? planet.image_variants : []) as Array<{ path?: unknown }>;
      const imageUrl = String(planet.image_url ?? "");

      return imageUrl.includes(row.storage_path) || variants.some((variant) => String(variant?.path ?? "") === row.storage_path);
    });

    if (!matchingRender) {
      return [];
    }

    return [
      {
        ...planet,
        image_url: matchingRender.file_url,
        image_variants: matchingRender.image_variants,
        surface_landscape_image_url:
          planet.uses_orbital_gameplay || planet.planet_class === "Gas Giant"
            ? matchingRender.orbital_image_url || matchingRender.landscape_image_url || planet.surface_landscape_image_url || ""
            : matchingRender.landscape_image_url || planet.surface_landscape_image_url || "",
        surface_landscape_status:
          matchingRender.landscape_image_url || matchingRender.orbital_image_url ? "Library Match" : planet.surface_landscape_status || "Not Started"
      }
    ];
  });

  if (!updates.length) {
    return;
  }

  const { error: updateError } = await supabase.from("generated_planets").upsert(updates);

  if (updateError) {
    console.warn(`Generated planet image URL sync skipped: ${updateError.message}`);
    return;
  }

  console.log(`Synced ${updates.length} generated planet image URL${updates.length === 1 ? "" : "s"}.`);
}

async function existingRenderRows() {
  if (!supabase) {
    return new Map<string, PlanetRenderLibraryRecord>();
  }

  const { data, error } = await supabase.from("planet_render_library").select("*");

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((row) => [String(row.id), row as PlanetRenderLibraryRecord]));
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
  const mainFiles: Array<{ file: string; metadata: PlanetRenderMetadata }> = [];
  const companionsByBaseId = new Map<string, CompanionUpload[]>();
  const rows: PlanetRenderLibraryRecord[] = [];
  const existingRowsById = apply ? await existingRenderRows() : new Map<string, PlanetRenderLibraryRecord>();
  const existingIds = new Set(existingRowsById.keys());
  const importVersion = Date.now().toString(36);
  const handledCompanionFiles = new Set<string>();
  let skippedExisting = 0;
  let companionUpdates = 0;

  for (const file of files) {
    const metadata = await readMetadata(file);
    const companionInfo = companionInfoForFilename(path.basename(file));

    if (companionInfo) {
      const baseId = baseRenderIdFor(file, metadata);
      companionsByBaseId.set(baseId, [
        ...(companionsByBaseId.get(baseId) ?? []),
        {
          file,
          kind: companionInfo.kind,
          baseId,
          metadata
        }
      ]);
      continue;
    }

    mainFiles.push({ file, metadata });
  }

  async function uploadCompanionsFor(baseId: string, existingRow?: PlanetRenderLibraryRecord) {
    const companions = companionsByBaseId.get(baseId) ?? [];
    const patch: Record<string, unknown> = {};

    for (const companion of companions) {
      const fields = await uploadCompanionArtwork(companion, importVersion, existingRow);
      Object.assign(patch, fields);
      handledCompanionFiles.add(companion.file);
    }

    return patch;
  }

  for (const { file, metadata } of mainFiles) {
    const relativePath = path.relative(sourceRoot, file);
    const preliminaryId = baseRenderIdFor(file, metadata);
    const existingRow = existingRowsById.get(preliminaryId);

    if (existingIds.has(preliminaryId) && !overwrite) {
      const companionPatch = await uploadCompanionsFor(preliminaryId, existingRow);
      if (Object.keys(companionPatch).length && existingRow) {
        rows.push({
          ...existingRow,
          ...companionPatch,
          updated_at: new Date().toISOString()
        });
        companionUpdates += 1;
      }
      skippedExisting += 1;
      continue;
    }

    const asset = await renderAssetFor(file, metadata);
    const filename = asset.filename;
    const pathParts = relativePath.split(path.sep).map((part) => part.replace(/\.[^/.]+$/, ""));
    const taxonomy = taxonomyForPath(pathParts);
    const id = preliminaryId;
    const storagePath = String(metadata.storage_path ?? `planet-render-library/${id}/${filename}`);
    const sourceStoragePath =
      asset.sourceBuffer && asset.sourceFilename ? `planet-render-library/${id}/source/${asset.sourceFilename}` : "";
    const resolution = inferResolution(filename, metadata);
    const width = Number(metadata.width ?? asset.width ?? resolution);
    const height = Number(metadata.height ?? asset.height ?? resolution);
    const fileUrl = String(metadata.file_url ?? cacheBustUrl(await publicUrlFor(storagePath), importVersion));
    const sourceFileUrl = sourceStoragePath ? await publicUrlFor(sourceStoragePath) : "";
    const inferredBiome = inferValue(pathParts, ["Ocean", "Desert", "Ice", "Lava", "Volcanic", "Crystal", "Toxic", "Void", "Forest", "Jungle", "Swamp", "Cyber", "Artificial", "Gas Giant"]);
    const inferredClass = inferValue(pathParts, ["Ocean", "Desert", "Ice", "Lava", "Crystal", "Toxic", "Void", "Gas Giant", "Terrestrial", "Artificial", "Bio", "Living", "Ancient", "Energy", "Primordial", "Dead"]);

    const row: PlanetRenderLibraryRecord = {
      id,
      name: String(metadata.name ?? titleize(path.parse(filename).name)),
      file_url: fileUrl,
      storage_path: storagePath,
      thumbnail_url: String(metadata.thumbnail_url ?? ""),
      landscape_image_url: String(metadata.landscape_image_url ?? ""),
      landscape_storage_path: String(metadata.landscape_storage_path ?? ""),
      landscape_source_path: String(metadata.landscape_source_path ?? ""),
      orbital_image_url: String(metadata.orbital_image_url ?? ""),
      orbital_storage_path: String(metadata.orbital_storage_path ?? ""),
      orbital_source_path: String(metadata.orbital_source_path ?? ""),
      planet_class: String(taxonomy?.planetClass.name ?? metadata.planet_class ?? inferredClass),
      biome: String(taxonomy?.subclass ?? metadata.biome ?? inferredBiome),
      atmosphere: String(metadata.atmosphere ?? inferValue(pathParts, ["Dense", "Thin", "Toxic", "Ionized", "Methane"])),
      climate: String(metadata.climate ?? inferValue(pathParts, ["Temperate", "Arid", "Frozen", "Tropical", "Storm", "Barren"])),
      color_family: String(metadata.color_family ?? inferValue(pathParts, ["Blue", "Green", "Red", "Orange", "Purple", "Cyan", "White", "Black"])),
      has_rings: Boolean(metadata.has_rings ?? /ring/i.test(relativePath)),
      water_level: String(metadata.water_level ?? inferValue(pathParts, ["High", "Medium", "Low"])),
      cloud_level: String(metadata.cloud_level ?? inferValue(pathParts, ["High", "Medium", "Low"])),
      tags: [...new Set([taxonomy?.planetClass.name, taxonomy?.subclass, ...asList(metadata.tags ?? pathParts.join(","))].filter((tag): tag is string => Boolean(tag)))],
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

      if (sourceStoragePath && asset.sourceBuffer && uploadPsdSources) {
        const { error: sourceUploadError } = await supabase.storage.from(bucket).upload(sourceStoragePath, asset.sourceBuffer, {
          contentType: asset.sourceContentType,
          upsert: true
        });

        if (sourceUploadError) {
          const warning = `Source PSD upload skipped: ${sourceUploadError.message}`;
          row.notes = row.notes ? `${row.notes}\n${warning}` : warning;
          console.warn(`${sourceStoragePath}: ${warning}`);
        }
      } else if (sourceStoragePath && asset.sourceBuffer) {
        const warning = "Source PSD upload skipped. Re-run with --upload-psd-source to try uploading the PSD source file.";
        row.notes = row.notes ? `${row.notes}\n${warning}` : warning;
      }
    }

    Object.assign(row, await uploadCompanionsFor(id, existingRow));
  }

  for (const [baseId, companions] of companionsByBaseId) {
    const existingRow = existingRowsById.get(baseId);
    const unhandled = companions.filter((companion) => !handledCompanionFiles.has(companion.file));

    if (!unhandled.length) {
      continue;
    }

    if (!existingRow) {
      console.warn(`Skipped ${unhandled.length} companion artwork file${unhandled.length === 1 ? "" : "s"} for ${baseId}: no base planet render exists.`);
      continue;
    }

    const patch: Record<string, unknown> = {};
    for (const companion of unhandled) {
      Object.assign(patch, await uploadCompanionArtwork(companion, importVersion, existingRow));
      handledCompanionFiles.add(companion.file);
    }

    if (Object.keys(patch).length) {
      rows.push({
        ...existingRow,
        ...patch,
        updated_at: new Date().toISOString()
      });
      companionUpdates += 1;
    }
  }

  if (apply && supabase && rows.length) {
    const { error } = await supabase.from("planet_render_library").upsert(rows);

    if (error) {
      throw error;
    }

    await syncGeneratedPlanetRenderUrls(rows);
  }

  const actionLabel = apply ? (overwrite ? "Imported/updated" : "Imported new") : "Dry run found";
  console.log(`${actionLabel} ${rows.length} planet render${rows.length === 1 ? "" : "s"}.`);

  if (skippedExisting) {
    console.log(`Skipped ${skippedExisting} existing planet render${skippedExisting === 1 ? "" : "s"}. Use --overwrite to reprocess existing files.`);
  }

  if (companionUpdates) {
    console.log(`Updated companion artwork for ${companionUpdates} planet render${companionUpdates === 1 ? "" : "s"}.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
