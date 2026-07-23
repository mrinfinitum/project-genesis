import { NextResponse } from "next/server";
import { getRows, upsertRow } from "@/lib/data";
import {
  environmentGeneratorStatuses,
  getEnvironmentGeneratorDefinition,
  migrateEnvironmentLayerAssetRecord,
  type EnvironmentGeneratorId,
  type EnvironmentLayerAssetRecord
} from "@/lib/environment-layer-generators";

const metadataMarker = "ENVIRONMENT_LAYER_METADATA:";

function isSafeRelativePath(value: string, requiredRoot?: string) {
  if (!value) return true;
  if (value.startsWith("/") || value.includes("..") || /^[a-z]+:\/\//i.test(value) || /^[a-z]:\\/i.test(value)) return false;
  return !requiredRoot || value.startsWith(requiredRoot);
}

function parseRecord(row: Record<string, unknown>): EnvironmentLayerAssetRecord | null {
  const notes = String(row.notes ?? "");
  const markerIndex = notes.indexOf(metadataMarker);
  if (markerIndex < 0) return null;
  try {
    const parsed = JSON.parse(notes.slice(markerIndex + metadataMarker.length)) as EnvironmentLayerAssetRecord;
    return parsed.assetId ? migrateEnvironmentLayerAssetRecord(parsed) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const assets = await getRows("assets");
  const records = assets
    .map((row) => parseRecord(row as Record<string, unknown>))
    .filter((row): row is EnvironmentLayerAssetRecord => Boolean(row))
    .sort((left, right) => left.environmentType.localeCompare(right.environmentType) || left.layerNumber - right.layerNumber || left.assetId.localeCompare(right.assetId));
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const record = migrateEnvironmentLayerAssetRecord((await request.json()) as EnvironmentLayerAssetRecord);
  const errors: string[] = [];
  let definition;

  try {
    definition = getEnvironmentGeneratorDefinition(record.environmentType as EnvironmentGeneratorId);
  } catch {
    errors.push("environmentType does not resolve to a canonical generator.");
  }

  const layer = definition?.layers.find((row) => row.number === record.layerNumber && row.layerType === record.layerType);
  if (!layer) errors.push("layerNumber and layerType do not resolve within the selected environment.");
  if (!record.assetId?.trim()) errors.push("assetId is required.");
  if (!record.displayName?.trim()) errors.push("displayName is required.");
  if (!environmentGeneratorStatuses.includes(record.status)) errors.push("status is invalid.");
  if (!isSafeRelativePath(record.sourceRelativePath, definition?.sourceRoot)) errors.push("sourceRelativePath must remain under the canonical source-masters environment root.");
  if (!isSafeRelativePath(record.runtimeExportRelativePath, "source-masters/exports/")) errors.push("runtimeExportRelativePath must remain under source-masters/exports.");
  if (!isSafeRelativePath(record.previewRelativePath)) errors.push("previewRelativePath must be repository-relative.");
  if (/\.psd|\.psb/i.test(record.runtimeExportRelativePath)) errors.push("Runtime exports cannot reference PSD or PSB files.");

  if (errors.length) {
    return NextResponse.json({ error: "Invalid environment layer asset.", issues: errors }, { status: 400 });
  }

  const existingAssets = await getRows("assets");
  if (existingAssets.some((row) => row.id === record.assetId)) {
    return NextResponse.json(
      { error: `Asset ID already exists: ${record.assetId}. Choose a new filename suffix or index.` },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const canonicalRecord: EnvironmentLayerAssetRecord = {
    ...record,
    createdAt: record.createdAt || now,
    updatedAt: now
  };
  const sourceFilename = canonicalRecord.sourceRelativePath.split("/").at(-1) ?? "";

  const row = await upsertRow("assets", {
    id: canonicalRecord.assetId,
    name: canonicalRecord.displayName,
    type: "Environment Layer",
    category: "Environment Layer",
    art_key: canonicalRecord.assetId,
    icon_key: "",
    prompt: "",
    source_project: "Project Genesis Studio",
    source_file_name: sourceFilename,
    source_file_type: "PSD",
    mime_type: "image/vnd.adobe.photoshop",
    dimensions: canonicalRecord.dimensions,
    aspect_ratio: canonicalRecord.aspectRatio,
    preview_url: canonicalRecord.previewRelativePath,
    storage_path: canonicalRecord.runtimeExportRelativePath,
    platform_mappings: {},
    aliases: [],
    tags: [
      "environment-layer",
      canonicalRecord.environmentType,
      canonicalRecord.layerType,
      ...canonicalRecord.themeTags,
      ...canonicalRecord.paletteTags
    ],
    usage_count: 0,
    parent_asset_id: null,
    slice_name: canonicalRecord.layerType,
    roblox_asset_id: "",
    export_status: canonicalRecord.status,
    status: canonicalRecord.status,
    notes: `${metadataMarker}${JSON.stringify(canonicalRecord)}`
  });

  return NextResponse.json({ record: canonicalRecord, row }, { status: 201 });
}
