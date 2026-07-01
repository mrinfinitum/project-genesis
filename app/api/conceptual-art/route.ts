import { mkdir, writeFile } from "fs/promises";
import nodePath from "path";
import { NextResponse } from "next/server";
import { getRows, upsertRow } from "@/lib/data";
import { createSupabaseAdminClient, getAssetBucketName, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const runtime = "nodejs";

const allowedExtensions = new Set(["psd", "png", "jpg", "jpeg", "webp", "gif", "tif", "tiff", "bmp", "pdf"]);

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
  const bucket = getAssetBucketName();
  const storagePath = `conceptual-art/${id}/${now.replace(/[:.]/g, "-")}-${safeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = contentTypeFor(file.name, file.type);

  let fileUrl = "";

  if (!hasSupabaseServerConfig()) {
    const localRoot = nodePath.join(process.cwd(), "public", "uploads", bucket);
    const localPath = nodePath.join(localRoot, storagePath);
    await mkdir(nodePath.dirname(localPath), { recursive: true });
    await writeFile(localPath, buffer);
    fileUrl = `/uploads/${bucket}/${storagePath}`;
  } else {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
      contentType,
      upsert: true
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    fileUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
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
    status: "Uploaded",
    notes: String(formData.get("notes") ?? "").trim(),
    created_at: now
  });

  return NextResponse.json({ row }, { status: 201 });
}
