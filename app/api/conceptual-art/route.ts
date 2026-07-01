import { mkdir, writeFile } from "fs/promises";
import nodePath from "path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getCompositeImageData, initializeCanvas, readPsd } from "ag-psd";
import { getRows, upsertRow } from "@/lib/data";
import { createSupabaseAdminClient, getAssetBucketName, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const runtime = "nodejs";

const allowedExtensions = new Set(["psd", "png", "jpg", "jpeg", "webp", "gif", "tif", "tiff", "bmp", "pdf"]);
const browserPreviewTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp"]);

initializeCanvas(
  () => {
    throw new Error("Canvas rendering is not available in this server route.");
  },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }) as ImageData
);

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "concept";
}

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "concept-art";
}

function fileBaseName(filename: string) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "Concept Art";
}

function fileExtension(filename: string) {
  return filename.toLowerCase().split(".").pop() ?? "";
}

function contentTypeFor(filename: string, fallback: string) {
  const extension = fileExtension(filename);

  if (extension === "psd") {
    return "image/vnd.adobe.photoshop";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  if (extension === "gif") {
    return "image/gif";
  }

  if (extension === "tif" || extension === "tiff") {
    return "image/tiff";
  }

  if (extension === "bmp") {
    return "image/bmp";
  }

  if (extension === "pdf") {
    return "application/pdf";
  }

  return fallback || "application/octet-stream";
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  return Boolean(value && typeof value === "object" && "arrayBuffer" in value && "name" in value && "type" in value && "size" in value);
}

function sortRows(rows: Record<string, unknown>[]) {
  return [...rows].sort((left, right) => String(right.created_at ?? "").localeCompare(String(left.created_at ?? "")));
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

async function psdPreviewPng(buffer: Buffer) {
  const psd = readPsd(buffer, {
    useImageData: true,
    skipLayerImageData: true,
    skipThumbnail: true,
    throwForMissingFeatures: false
  });
  const imageData = psd.imageData ?? getCompositeImageData(psd);

  if (!imageData?.data) {
    throw new Error("This PSD does not include readable composite image data. Re-save it from Photoshop with compatibility enabled.");
  }

  const width = imageData.width || psd.width;
  const height = imageData.height || psd.height;
  const rgba = toEightBitRgba(imageData.data, width, height);

  return sharp(rgba, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .resize({
      width: 1800,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true
    })
    .png()
    .toBuffer();
}

async function writeStoredBuffer(storagePath: string, buffer: Buffer, contentType: string) {
  const bucket = getAssetBucketName();

  if (!hasSupabaseServerConfig()) {
    const localRoot = nodePath.join(process.cwd(), "public", "uploads", bucket);
    const localPath = nodePath.join(localRoot, storagePath);
    await mkdir(nodePath.dirname(localPath), { recursive: true });
    await writeFile(localPath, buffer);
    return `/uploads/${bucket}/${storagePath}`;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: true
  });

  if (error) {
    throw new Error(error.message);
  }

  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

export async function GET() {
  const rows = await getRows("conceptual_art");
  return NextResponse.json({ rows: sortRows(rows) });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!isFileLike(file)) {
    return NextResponse.json({ error: "A concept art file is required." }, { status: 400 });
  }

  const extension = fileExtension(file.name);

  if (!allowedExtensions.has(extension)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const name = String(formData.get("name") ?? "").trim() || fileBaseName(file.name);
  const id = `concept-${Date.now()}-${safeId(name)}`;
  const storagePath = `conceptual-art/${id}/${now.replace(/[:.]/g, "-")}-${safeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = contentTypeFor(file.name, file.type);
  let fileUrl = "";
  let previewUrl = "";
  let previewStoragePath = "";

  try {
    fileUrl = await writeStoredBuffer(storagePath, buffer, contentType);

    if (browserPreviewTypes.has(contentType)) {
      previewUrl = fileUrl;
      previewStoragePath = storagePath;
    } else if (extension === "psd") {
      previewStoragePath = `conceptual-art/${id}/preview/${now.replace(/[:.]/g, "-")}-${safeId(name)}.png`;
      previewUrl = await writeStoredBuffer(previewStoragePath, await psdPreviewPng(buffer), "image/png");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const row = await upsertRow("conceptual_art", {
    id,
    name,
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    file_url: fileUrl,
    file_name: file.name,
    file_type: contentType,
    file_size: file.size,
    storage_path: storagePath,
    preview_url: previewUrl,
    preview_storage_path: previewStoragePath,
    status: "Uploaded",
    notes: String(formData.get("notes") ?? "").trim(),
    created_at: now
  });

  return NextResponse.json({ row }, { status: 201 });
}
