import { mkdir, readFile, writeFile } from "fs/promises";
import nodePath from "path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getCompositeImageData, initializeCanvas, readPsd } from "ag-psd";
import { getRows, upsertRow } from "@/lib/data";
import { createSupabaseAdminClient, getAssetBucketName, hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { TableName } from "@/types/schema";

export const runtime = "nodejs";

const upgradeIconSizes = [64, 96, 128, 160, 192, 256];
const buildingAssetSizes = [1024];
const researchAssetSizes = [1024];

initializeCanvas(
  () => {
    throw new Error("Canvas rendering is not available in this server route.");
  },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }) as ImageData
);

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "asset";
}

function normalizeSize(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(4096, Math.max(1, Math.round(parsed))) : null;
}

function sourceTableFor(value: string) {
  return value === "upgrades" || value === "buildings" || value === "research" ? value : "assets";
}

function sourceTableHasAssetId(value: string) {
  return value === "upgrades" || value === "buildings";
}

function defaultSizesForSource(sourceTable: string) {
  return sourceTable === "buildings" ? buildingAssetSizes : sourceTable === "research" ? researchAssetSizes : upgradeIconSizes;
}

function normalizeSizes(value: unknown, sourceTable: string) {
  const fallback = defaultSizesForSource(sourceTable);

  if (!Array.isArray(value)) {
    return fallback;
  }

  const sizes = value.map(normalizeSize).filter((size): size is number => Boolean(size));
  return sizes.length ? Array.from(new Set(sizes)) : fallback;
}

async function readStoredFile(fileUrl: string) {
  if (fileUrl.startsWith("/uploads/")) {
    return readFile(nodePath.join(process.cwd(), "public", fileUrl));
  }

  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Could not read source PSD (${response.status}).`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  throw new Error("Source PSD URL is not a supported local or remote file URL.");
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

function trimTransparentPixels(data: Buffer, width: number, height: number) {
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
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

function variantStoragePath(assetId: string, size: number) {
  return `${assetId}/exports/${size}x${size}.png`;
}

function variantFilename(assetName: string, size: number) {
  return `${safeFilename(assetName)}-${size}x${size}.png`;
}

function publicUrlForPath(storagePath: string) {
  const bucket = getAssetBucketName();

  if (!hasSupabaseServerConfig()) {
    return `/uploads/${bucket}/${storagePath}`;
  }

  return createSupabaseAdminClient().storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

async function writePngVariant(assetId: string, png: Buffer, size: number) {
  const bucket = getAssetBucketName();
  const storagePath = variantStoragePath(assetId, size);

  if (!hasSupabaseServerConfig()) {
    const localRoot = nodePath.join(process.cwd(), "public", "uploads", bucket);
    const localPath = nodePath.join(localRoot, storagePath);
    await mkdir(nodePath.dirname(localPath), { recursive: true });
    await writeFile(localPath, png);
    return { size, url: `/uploads/${bucket}/${storagePath}`, path: storagePath };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, png, {
    contentType: "image/png",
    upsert: true
  });

  if (error) {
    throw new Error(error.message);
  }

  return { size, url: supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl, path: storagePath };
}

async function resolveAsset(sourceTable: string, sourceId: string, requestedAssetId: string) {
  const safeSourceTable = sourceTableFor(sourceTable);
  const sourceRows = sourceId ? await getRows(safeSourceTable as TableName) : [];
  const sourceRow = sourceId ? sourceRows.find((row) => row.id === sourceId) : undefined;
  const assetId = requestedAssetId || String(sourceRow?.asset_id ?? "") || (safeSourceTable === "assets" ? sourceId : `asset-${safeSourceTable}-${safeId(sourceId)}`);

  if (!assetId) {
    throw new Error("No linked asset was found. Upload a source PSD first.");
  }

  const assets = await getRows("assets");
  const asset = assets.find((row) => row.id === assetId);

  return { safeSourceTable, sourceRow, assetId, asset };
}

function listVariantUrls(assetId: string, assetName: string, sizes: number[]) {
  return sizes.map((size) => ({
    size,
    width: size,
    height: size,
    url: publicUrlForPath(variantStoragePath(assetId, size)),
    filename: variantFilename(assetName, size)
  }));
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sourceTable = url.searchParams.get("source_table") ?? "assets";
    const sourceId = url.searchParams.get("source_id") ?? "";
    const requestedAssetId = url.searchParams.get("asset_id") ?? "";
    const { assetId, asset, sourceRow } = await resolveAsset(sourceTable, sourceId, requestedAssetId);
    const assetName = String(asset?.name ?? sourceRow?.name ?? assetId);

    return NextResponse.json({
      asset_id: assetId,
      variants: listVariantUrls(assetId, assetName, defaultSizesForSource(sourceTableFor(sourceTable)))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not list asset variants.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sourceTable = String(body.source_table ?? "assets").trim();
    const sourceId = String(body.source_id ?? "").trim();
    const requestedAssetId = String(body.asset_id ?? "").trim();
    const safeRequestSourceTable = sourceTableFor(sourceTable);
    const sizes = normalizeSizes(body.sizes, safeRequestSourceTable);

    if (!sourceId && !requestedAssetId) {
      return NextResponse.json({ error: "source_id or asset_id is required." }, { status: 400 });
    }

    const { safeSourceTable, sourceRow, assetId, asset } = await resolveAsset(safeRequestSourceTable, sourceId, requestedAssetId);
    const sourceFileUrl = String(asset?.source_file_url ?? "");

    if (!asset || !sourceFileUrl) {
      return NextResponse.json({ error: "Upload a source PSD before generating PNG variants." }, { status: 400 });
    }

    const psdBuffer = await readStoredFile(sourceFileUrl);
    const psd = readPsd(psdBuffer, {
      useImageData: true,
      skipLayerImageData: true,
      skipThumbnail: true,
      throwForMissingFeatures: false
    });
    const imageData = psd.imageData ?? getCompositeImageData(psd);

    if (!imageData?.data) {
      return NextResponse.json({ error: "This PSD does not include readable composite image data. Re-save it from Photoshop with compatibility enabled." }, { status: 422 });
    }

    const sourceWidth = imageData.width || psd.width;
    const sourceHeight = imageData.height || psd.height;
    const rgba = toEightBitRgba(imageData.data, sourceWidth, sourceHeight);
    const input = trimTransparentPixels(rgba, sourceWidth, sourceHeight);
    const variants = [];

    for (const size of sizes) {
      const png = await sharp(input.data, {
        raw: {
          width: input.width,
          height: input.height,
          channels: 4
        }
      })
        .resize({
          width: size,
          height: size,
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

      variants.push(await writePngVariant(assetId, png, size));
    }

    const largest = variants.reduce((current, next) => (next.size > current.size ? next : current), variants[0]);
    const row = await upsertRow("assets", {
      ...asset,
      id: assetId,
      file_url: largest?.url ?? asset.file_url,
      export_status: "Variants Generated",
      status: "Generated",
      notes: `${asset.notes ? `${asset.notes}\n` : ""}Generated transparent icon variants: ${sizes.map((size) => `${size}x${size}`).join(", ")}.`
    });

    if (sourceTableHasAssetId(safeSourceTable) && sourceId) {
      await upsertRow(safeSourceTable as TableName, {
        ...(sourceRow ?? { id: sourceId }),
        asset_id: assetId
      });
    }

    return NextResponse.json({
      asset_id: assetId,
      variants: variants.map((variant) => ({
        ...variant,
        filename: variantFilename(String(asset.name ?? sourceRow?.name ?? assetId), variant.size)
      })),
      row
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PNG variant generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
