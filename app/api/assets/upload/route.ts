import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import nodePath from "path";
import { getRows, upsertRow } from "@/lib/data";
import { createSupabaseAdminClient, getAssetBucketName, hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { TableName } from "@/types/schema";

export const runtime = "nodejs";

const supportedSourceExtensions = new Set([".psd", ".psb", ".ai", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".tiff", ".tif", ".pdf", ".blend", ".zip", ".mp3", ".wav", ".ogg", ".mp4", ".mov"]);

function safeFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "asset.png";
}

function fileBaseName(filename: string) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9 _-]+/g, " ").trim() || "Source PSD";
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function extensionFor(filename: string) {
  const match = filename.match(/\.[^.]+$/);
  return match?.[0]?.toLowerCase() ?? "";
}

function sourceTableFor(value: string) {
  return value === "upgrades" || value === "buildings" || value === "research" ? value : "assets";
}

function sourceTableHasAssetId(value: string) {
  return value === "upgrades" || value === "buildings" || value === "research";
}

function assetCategoryFor(sourceTable: string, uploadKind: string) {
  if (uploadKind === "source") {
    return "Source Artwork";
  }

  if (sourceTable === "upgrades") {
    return "Upgrade Icon";
  }

  if (sourceTable === "buildings") {
    return "Building Render";
  }

  if (sourceTable === "research") {
    return "Research Icon";
  }

  return "Asset";
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  return Boolean(value && typeof value === "object" && "arrayBuffer" in value && "name" in value && "type" in value);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const sourceTable = String(formData.get("source_table") ?? "assets").trim();
  const sourceId = String(formData.get("source_id") ?? "").trim();
  const requestedAssetId = String(formData.get("asset_id") ?? "").trim();
  const uploadKind = String(formData.get("upload_kind") ?? "export").trim();

  if (!sourceId && !requestedAssetId && uploadKind !== "source") {
    return NextResponse.json({ error: "source_id or asset_id is required." }, { status: 400 });
  }

  if (!isFileLike(file)) {
    return NextResponse.json({ error: "PNG file is required." }, { status: 400 });
  }

  const filename = file.name.toLowerCase();
  const extension = extensionFor(filename);
  const isPng = filename.endsWith(".png") && file.type === "image/png";

  if (uploadKind === "source" && !supportedSourceExtensions.has(extension)) {
    return NextResponse.json({ error: "Source format is not supported yet." }, { status: 400 });
  }

  if (uploadKind !== "source" && !isPng) {
    return NextResponse.json({ error: "Only PNG files are supported for game-ready export uploads." }, { status: 400 });
  }

  const bucket = getAssetBucketName();
  const safeSourceTable = sourceTableFor(sourceTable);
  const generatedSourceId = `asset-source-${Date.now()}-${safeId(fileBaseName(file.name).toLowerCase())}`;
  const assetId = requestedAssetId || (safeSourceTable === "assets" ? sourceId || generatedSourceId : `asset-${safeSourceTable}-${safeId(sourceId)}`);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const storagePath = uploadKind === "source"
    ? `game-assets/source/${safeId(safeSourceTable)}/${safeId(assetId)}/${timestamp}-${safeFilename(file.name)}`
    : `${assetId}/exports/${timestamp}-${safeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const assetName = String(formData.get("asset_name") ?? file.name).trim() || file.name;
  const buildAssetPatch = (fileUrl: string) =>
    uploadKind === "source"
      ? {
          source_file_url: fileUrl,
          source_file_type: extension.replace(".", "").toUpperCase(),
          export_status: "Source Uploaded",
          status: "Source Uploaded"
        }
      : {
          file_url: fileUrl,
          export_status: "PNG Uploaded",
          status: "Uploaded"
        };

  if (!hasSupabaseServerConfig()) {
    const localRoot = uploadKind === "source"
      ? nodePath.join(process.cwd(), ".local-data", "private-assets")
      : nodePath.join(process.cwd(), "public", "uploads", bucket);
    const localPath = nodePath.join(localRoot, storagePath);
    await mkdir(nodePath.dirname(localPath), { recursive: true });
    await writeFile(localPath, buffer);

    const fileUrl = uploadKind === "source" ? `studio-private://assets/${storagePath}` : `/uploads/${bucket}/${storagePath}`;
    const existingAssets = await getRows("assets");
    const existingAsset = existingAssets.find((row) => row.id === assetId) ?? {};
    const assetRow = await upsertRow("assets", {
      ...existingAsset,
      id: assetId,
      name: uploadKind === "source" ? fileBaseName(file.name) : assetName,
      type: uploadKind === "source" ? "PSD Source" : "Image",
      category: assetCategoryFor(safeSourceTable, uploadKind),
      prompt: "",
      roblox_asset_id: "",
      ...buildAssetPatch(fileUrl),
      notes: `${uploadKind === "source" ? "Source PSD" : "PNG export"} uploaded locally from ${safeSourceTable}${sourceId ? `:${sourceId}` : ""}.`
    });

    if (sourceTableHasAssetId(safeSourceTable) && sourceId) {
      const sourceRows = await getRows(safeSourceTable as TableName);
      const existingSourceRow = sourceRows.find((row) => row.id === sourceId) ?? { id: sourceId };
      const row = await upsertRow(safeSourceTable as TableName, {
        ...existingSourceRow,
        asset_id: assetId
      });

      return NextResponse.json({
        file_url: uploadKind === "source" ? undefined : fileUrl,
        source_file_url: uploadKind === "source" ? fileUrl : undefined,
        asset_id: assetId,
        storage: "local",
        path: storagePath,
        row
      });
    }

    return NextResponse.json({
      file_url: uploadKind === "source" ? undefined : fileUrl,
      source_file_url: uploadKind === "source" ? fileUrl : undefined,
      asset_id: assetId,
      storage: "local",
      path: storagePath,
      row: assetRow
    });
  }

  const supabase = createSupabaseAdminClient();
  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: true
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = uploadKind === "source" ? { data: { publicUrl: `studio-private://supabase/${bucket}/${storagePath}` } } : supabase.storage.from(bucket).getPublicUrl(storagePath);
  const fileUrl = publicUrlData.publicUrl;

  const { error: assetUpsertError } = await supabase.from("assets").upsert({
    id: assetId,
    name: uploadKind === "source" ? fileBaseName(file.name) : assetName,
    type: uploadKind === "source" ? "PSD Source" : "Image",
    category: assetCategoryFor(safeSourceTable, uploadKind),
    prompt: "",
    roblox_asset_id: "",
    ...buildAssetPatch(fileUrl),
    notes: `${uploadKind === "source" ? "Source PSD" : "PNG export"} uploaded from ${safeSourceTable}${sourceId ? `:${sourceId}` : ""}.`
  });

  if (assetUpsertError) {
    return NextResponse.json({ error: assetUpsertError.message, file_url: fileUrl, path: storagePath }, { status: 500 });
  }

  if (sourceTableHasAssetId(safeSourceTable) && sourceId) {
    const { data: row, error: updateError } = await supabase.from(safeSourceTable).update({ asset_id: assetId }).eq("id", sourceId).select("*").single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message, file_url: fileUrl, asset_id: assetId, path: storagePath }, { status: 500 });
    }

    return NextResponse.json({
      file_url: uploadKind === "source" ? undefined : fileUrl,
      source_file_url: uploadKind === "source" ? fileUrl : undefined,
      asset_id: assetId,
      path: storagePath,
      row
    });
  }

  const { data: row, error: updateError } = await supabase.from("assets").select("*").eq("id", assetId).single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message, file_url: fileUrl, path: storagePath }, { status: 500 });
  }

  return NextResponse.json({ file_url: fileUrl, source_file_url: uploadKind === "source" ? fileUrl : undefined, asset_id: assetId, path: storagePath, row });
}
