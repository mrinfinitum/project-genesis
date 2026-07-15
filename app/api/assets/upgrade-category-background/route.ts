import { mkdir, writeFile } from "node:fs/promises";
import nodePath from "node:path";
import { NextResponse } from "next/server";
import { getRows, upsertRow } from "@/lib/data";
import { createSupabaseAdminClient, getAssetBucketName, hasSupabaseServerConfig } from "@/lib/supabase/server";
import { upgradeCategoryAssetRecords, upgradeCategoryIds, type UpgradeCategoryId } from "@/lib/upgrades/category-presentation";

export const runtime = "nodejs";

const allowedExtensions = new Set([".png", ".psd", ".psb", ".tiff", ".tif", ".svg"]);

function extensionFor(filename: string) {
  const match = filename.match(/\.[^.]+$/);
  return match?.[0]?.toLowerCase() ?? "";
}

function safeFilename(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "upgrade-category-background.png";
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  return Boolean(value && typeof value === "object" && "arrayBuffer" in value && "name" in value && "type" in value);
}

function rowForCategory(categoryId: string) {
  if (!upgradeCategoryIds.includes(categoryId as UpgradeCategoryId)) return null;
  return upgradeCategoryAssetRecords.find((record) => record.categoryId === categoryId) ?? null;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const categoryId = String(formData.get("categoryId") ?? formData.get("category") ?? "").trim().toLowerCase();
  const file = formData.get("file");
  const notes = String(formData.get("notes") ?? "").trim();
  const approvalState = String(formData.get("approvalState") ?? "Needs Review").trim() || "Needs Review";
  const sourceVersion = Number(formData.get("sourceVersion") ?? 1) || 1;
  const categoryRecord = rowForCategory(categoryId);

  if (!categoryRecord) {
    return NextResponse.json({ error: "categoryId must be one of workforce, industry, science, technology." }, { status: 400 });
  }
  if (!isFileLike(file)) {
    return NextResponse.json({ error: "Source File is required." }, { status: 400 });
  }
  const extension = extensionFor(file.name);
  if (!allowedExtensions.has(extension)) {
    return NextResponse.json({ error: "Upgrade category backgrounds must be PNG, PSD, PSB, TIFF, or safe SVG." }, { status: 400 });
  }

  const bucket = getAssetBucketName();
  const assetId = categoryRecord.semanticAssetKey;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const storagePath = `game-assets/source/ui/dashboard/upgrade-categories/${safeId(categoryId)}/v${sourceVersion}/${timestamp}-${safeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const sourceFileType = extension.replace(".", "").toUpperCase();
  const assetPatch = {
    id: assetId,
    name: `${categoryRecord.displayName} Upgrade Category Background`,
    type: sourceFileType === "PNG" ? "Image Source" : `${sourceFileType} Source`,
    category: "Upgrade Category Background",
    prompt: "",
    roblox_asset_id: "",
    art_key: categoryRecord.semanticAssetKey,
    icon_key: "",
    source_file_type: sourceFileType,
    export_status: approvalState,
    status: approvalState,
    notes: [
      `Group: UI > Dashboard > Upgrade Categories.`,
      `Category: ${categoryRecord.categoryId}.`,
      `Role: ${categoryRecord.role}.`,
      `Required master size: ${categoryRecord.expectedDimensions.masterWidth}x${categoryRecord.expectedDimensions.masterHeight}.`,
      `Derivative requirements: ${categoryRecord.derivativeRequirements.join(", ")}.`,
      notes
    ].filter(Boolean).join(" ")
  };

  if (!hasSupabaseServerConfig()) {
    const localRoot = nodePath.join(process.cwd(), ".local-data", "private-assets");
    const localPath = nodePath.join(localRoot, storagePath);
    await mkdir(nodePath.dirname(localPath), { recursive: true });
    await writeFile(localPath, buffer);
    const sourceUrl = `studio-private://assets/${storagePath}`;
    const existingAssets = await getRows("assets");
    const existingAsset = existingAssets.find((row) => row.id === assetId) ?? {};
    const row = await upsertRow("assets", {
      ...existingAsset,
      ...assetPatch,
      source_file_url: sourceUrl
    });
    return NextResponse.json({ asset_id: assetId, categoryId, semanticAssetKey: categoryRecord.semanticAssetKey, source_file_url: sourceUrl, storage: "local", path: storagePath, row });
  }

  const supabase = createSupabaseAdminClient();
  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }
  const sourceUrl = `studio-private://supabase/${bucket}/${storagePath}`;
  const { error } = await supabase.from("assets").upsert({
    ...assetPatch,
    source_file_url: sourceUrl
  });
  if (error) {
    return NextResponse.json({ error: error.message, asset_id: assetId, path: storagePath }, { status: 500 });
  }
  const { data: row } = await supabase.from("assets").select("*").eq("id", assetId).single();
  return NextResponse.json({ asset_id: assetId, categoryId, semanticAssetKey: categoryRecord.semanticAssetKey, source_file_url: sourceUrl, path: storagePath, row });
}

