import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getGameData, getRows } from "@/lib/data";
import type { AssetDefinition, PlatformAssetMappings } from "@/types/runtime";
import type { AssetRecord, GameData } from "@/types/schema";

export type GameArtImportSourceType = "roblox_project" | "web_game_project" | "unity_project" | "unreal_project" | "godot_project" | "generic_assets";
export type GameArtImportInputType = "folder_manifest" | "zip_archive" | "json_asset_manifest" | "direct_uploads" | "local_endpoint";
export type GameArtImportAction = "match_existing" | "create_new" | "replace_existing_file" | "add_as_variant" | "ignore" | "mark_placeholder";

export type GameArtImportIssue = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  records: string[];
};

export type GameArtImportFile = {
  filename?: string;
  name?: string;
  path?: string;
  url?: string;
  storagePath?: string;
  category?: string;
  type?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  artKey?: string;
  iconKey?: string;
  aliases?: string[];
  tags?: string[];
  robloxAssetId?: string;
  robloxAssetType?: string;
  webPath?: string;
  platformMappings?: PlatformAssetMappings;
  notes?: string;
};

export type GameArtImportRequest = {
  sourceProject?: string;
  sourceType?: GameArtImportSourceType;
  sourceRoot?: string;
  inputType?: GameArtImportInputType;
  files?: GameArtImportFile[];
  assets?: GameArtImportFile[];
};

export type GameArtImportPreviewItem = {
  id: string;
  filename: string;
  detectedType: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  fileSizeBytes: number;
  proposedCategory: string;
  proposedArtKey: string;
  proposedIconKey: string;
  matchedAssetId: string | null;
  matchedBy: string | null;
  duplicate: boolean;
  conflict: boolean;
  action: GameArtImportAction;
  sourceProject: string;
  status: AssetDefinition["status"];
  platformMappings: PlatformAssetMappings;
  warnings: string[];
  normalizedAsset: AssetDefinition;
};

export type GameArtImportPreview = {
  id: string;
  sourceProject: string;
  sourceType: GameArtImportSourceType;
  sourceRoot: string;
  inputType: GameArtImportInputType;
  importedAt: string;
  fileCount: number;
  matchedAssetCount: number;
  unmatchedFileCount: number;
  duplicateCount: number;
  warningCount: number;
  validation: {
    valid: boolean;
    status: "Ready" | "Ready With Warnings" | "Blocked";
    errorCount: number;
    warningCount: number;
    checkedAt: string;
    issues: GameArtImportIssue[];
  };
  items: GameArtImportPreviewItem[];
};

export type GameArtImportHistoryEntry = {
  importId: string;
  sourceProject: string;
  sourceType: GameArtImportSourceType;
  timestamp: string;
  importedFiles: number;
  matchedAssets: number;
  createdAssets: number;
  updatedAssets: number;
  ignoredFiles: number;
  conflicts: number;
  warnings: number;
  user: string;
};

type GameArtImportStore = {
  assets: AssetDefinition[];
  variants: Array<AssetDefinition & { parentAssetId: string; variantType: string }>;
  history: GameArtImportHistoryEntry[];
};

const importStorePath = process.env.PROJECT_GENESIS_GAME_ART_IMPORT_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_GAME_ART_IMPORT_STORE)
  : path.join(process.cwd(), "data", "game-art-imports.local.json");

const supportedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".mp3", ".wav", ".ogg"]);
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const audioExtensions = new Set([".mp3", ".wav", ".ogg"]);
const imageMimes = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const audioMimes = new Set(["audio/mpeg", "audio/wav", "audio/ogg", "audio/x-wav"]);

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function text(value: unknown, fallback = "") {
  const result = String(value ?? "").trim();
  return result || fallback;
}

function isAbsolutePrivatePath(value: string) {
  return /^\/Users\//.test(value) || /^\/Volumes\//.test(value) || /^[A-Za-z]:\\/.test(value);
}

function sanitizeSourceRoot(value: string) {
  if (!value) return "";
  return isAbsolutePrivatePath(value) ? "[local-source-redacted]" : value;
}

function extensionFor(filename: string) {
  return path.extname(filename).toLowerCase();
}

function fileNameFrom(input: GameArtImportFile) {
  const candidate = text(input.filename) || text(input.name) || text(input.path).split(/[\\/]/).pop() || text(input.url).split("/").pop();
  return candidate || "unnamed-asset";
}

function mimeFor(extension: string, provided?: string) {
  if (provided) return provided;
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".wav") return "audio/wav";
  if (extension === ".ogg") return "audio/ogg";
  return "application/octet-stream";
}

function typeFor(extension: string, provided?: string) {
  if (provided) return provided;
  if (imageExtensions.has(extension)) return extension === ".svg" ? "icon" : "image";
  if (audioExtensions.has(extension)) return "audio";
  return "unknown";
}

function categoryFor(filename: string, provided?: string) {
  if (provided) return provided;
  const normalized = slug(filename);
  if (normalized.includes("planet")) return "planets";
  if (normalized.includes("resource")) return "resources";
  if (normalized.includes("building")) return "buildings";
  if (normalized.includes("research")) return "research";
  if (normalized.includes("era")) return "eras";
  if (normalized.includes("background") || normalized.includes("bg")) return "backgrounds";
  if (normalized.includes("ui") || normalized.includes("button")) return "ui";
  if (audioExtensions.has(extensionFor(filename))) return "audio";
  return "game-assets";
}

function aspectRatio(width?: number, height?: number) {
  if (!width || !height) return null;
  const gcd = (left: number, right: number): number => (right ? gcd(right, left % right) : left);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function storagePathFor(category: string, assetId: string, filename: string) {
  return `game-assets/${slug(category)}/${assetId}/${fileNameFrom({ filename })}`;
}

function publicPreviewUrl(input: GameArtImportFile) {
  const url = text(input.url);
  if (!url || isAbsolutePrivatePath(url)) return "";
  return url;
}

function mergePlatformMappings(input: GameArtImportFile): PlatformAssetMappings {
  const mappings: PlatformAssetMappings = { ...(input.platformMappings ?? {}) };
  const webPath = text(input.webPath);
  const robloxAssetId = text(input.robloxAssetId);

  if (webPath && !isAbsolutePrivatePath(webPath)) mappings.web = { path: webPath };
  if (robloxAssetId) mappings.roblox = { assetId: robloxAssetId, assetType: text(input.robloxAssetType), notes: text(input.notes) };
  if (mappings.web?.path && isAbsolutePrivatePath(mappings.web.path)) delete mappings.web;

  return mappings;
}

function importedAssetId(artKey: string) {
  return `asset_${artKey}`;
}

function rowArtKey(row: Record<string, unknown>) {
  return text(row.artKey ?? row.art_key) || slug(text(row.name ?? row.id));
}

function rowIconKey(row: Record<string, unknown>) {
  return text(row.iconKey ?? row.icon_key);
}

function aliasesFor(row: Record<string, unknown>) {
  const value = row.aliases;
  if (Array.isArray(value)) return value.map(String);
  return text(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function robloxAssetIdFor(row: Record<string, unknown>) {
  const platformMappings = (row.platformMappings ?? row.platform_mappings) as PlatformAssetMappings | undefined;
  return text(row.robloxAssetId ?? row.roblox_asset_id ?? platformMappings?.roblox?.assetId);
}

async function readStore(): Promise<GameArtImportStore> {
  try {
    const raw = await readFile(importStorePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<GameArtImportStore>;
    return {
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      variants: Array.isArray(parsed.variants) ? parsed.variants : [],
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    return { assets: [], variants: [], history: [] };
  }
}

async function writeStore(store: GameArtImportStore) {
  await mkdir(path.dirname(importStorePath), { recursive: true });
  await writeFile(importStorePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function matchImportedAsset(input: { id: string; artKey: string; iconKey: string; filename: string; platformMappings: PlatformAssetMappings }, existingRows: Record<string, unknown>[]) {
  const normalizedFilename = slug(input.filename.replace(extensionFor(input.filename), ""));
  const robloxAssetId = text(input.platformMappings.roblox?.assetId);
  const checks: Array<[string, (row: Record<string, unknown>) => boolean]> = [
    ["exact_art_key", (row) => rowArtKey(row) === input.artKey],
    ["exact_icon_key", (row) => Boolean(input.iconKey) && rowIconKey(row) === input.iconKey],
    ["canonical_asset_id", (row) => text(row.id) === input.id],
    ["filename_alias", (row) => aliasesFor(row).some((alias) => slug(alias) === normalizedFilename)],
    ["normalized_filename", (row) => slug(text(row.name ?? row.id)) === normalizedFilename],
    ["roblox_asset_mapping", (row) => Boolean(robloxAssetId) && robloxAssetIdFor(row) === robloxAssetId]
  ];

  for (const [matchedBy, predicate] of checks) {
    const match = existingRows.find(predicate);
    if (match) return { matchedAssetId: text(match.id), matchedBy };
  }

  return { matchedAssetId: null, matchedBy: null };
}

function normalizeFile(input: GameArtImportFile, request: GameArtImportRequest, existingRows: Record<string, unknown>[], seenArtKeys: Set<string>): GameArtImportPreviewItem {
  const filename = fileNameFrom(input);
  const extension = extensionFor(filename);
  const mimeType = mimeFor(extension, input.mimeType);
  const detectedType = typeFor(extension, input.type);
  const proposedCategory = categoryFor(filename, input.category);
  const proposedArtKey = text(input.artKey) || slug(filename.replace(extension, ""));
  const proposedIconKey = text(input.iconKey) || (proposedArtKey.includes("icon") ? proposedArtKey : "");
  const id = importedAssetId(proposedArtKey);
  const duplicate = seenArtKeys.has(proposedArtKey);
  seenArtKeys.add(proposedArtKey);
  const platformMappings = mergePlatformMappings(input);
  const match = matchImportedAsset({ id, artKey: proposedArtKey, iconKey: proposedIconKey, filename, platformMappings }, existingRows);
  const warnings: string[] = [];

  if (!supportedExtensions.has(extension)) warnings.push(`Unsupported extension ${extension || "(none)"}.`);
  if (!imageMimes.has(mimeType) && !audioMimes.has(mimeType)) warnings.push(`Unsupported MIME type ${mimeType}.`);
  if (imageExtensions.has(extension) && (!input.width || !input.height)) warnings.push("Image dimensions are missing.");
  if (text(input.path) && isAbsolutePrivatePath(text(input.path))) warnings.push("Private local source path was redacted.");
  if (duplicate) warnings.push("Duplicate proposed artKey in this import.");

  const status: AssetDefinition["status"] = text(input.robloxAssetId) && !publicPreviewUrl(input) ? "missing" : "draft";
  const normalizedAsset: AssetDefinition = {
    id,
    name: text(input.name, filename.replace(extension, "")),
    type: detectedType,
    category: proposedCategory,
    artKey: proposedArtKey,
    iconKey: proposedIconKey || undefined,
    sourceFileName: filename,
    sourceExtension: extension,
    mimeType,
    width: input.width ?? null,
    height: input.height ?? null,
    aspectRatio: aspectRatio(input.width, input.height),
    fileSizeBytes: input.fileSizeBytes ?? 0,
    status,
    notes: text(input.notes),
    previewUrl: publicPreviewUrl(input),
    storagePath: storagePathFor(proposedCategory, id, filename),
    platformMappings,
    aliases: input.aliases ?? [filename],
    tags: [...new Set([request.sourceType ?? "generic_assets", proposedCategory, detectedType, ...(input.tags ?? [])].filter(Boolean))],
    importedFrom: request.sourceProject ?? "Unknown Project",
    importedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    id: createHash("sha1").update(`${filename}:${proposedArtKey}`).digest("hex").slice(0, 12),
    filename,
    detectedType,
    mimeType,
    width: normalizedAsset.width,
    height: normalizedAsset.height,
    aspectRatio: normalizedAsset.aspectRatio,
    fileSizeBytes: normalizedAsset.fileSizeBytes ?? 0,
    proposedCategory,
    proposedArtKey,
    proposedIconKey,
    matchedAssetId: match.matchedAssetId,
    matchedBy: match.matchedBy,
    duplicate,
    conflict: Boolean(match.matchedAssetId && match.matchedBy !== "exact_art_key"),
    action: match.matchedAssetId ? "match_existing" : status === "missing" ? "mark_placeholder" : "create_new",
    sourceProject: request.sourceProject ?? "Unknown Project",
    status,
    platformMappings: normalizedAsset.platformMappings,
    warnings,
    normalizedAsset
  };
}

function validatePreviewItems(items: GameArtImportPreviewItem[]) {
  const issues: GameArtImportIssue[] = [];
  const artKeys = new Map<string, string[]>();
  const iconKeys = new Map<string, string[]>();

  for (const item of items) {
    artKeys.set(item.proposedArtKey, [...(artKeys.get(item.proposedArtKey) ?? []), item.filename]);
    if (item.proposedIconKey) iconKeys.set(item.proposedIconKey, [...(iconKeys.get(item.proposedIconKey) ?? []), item.filename]);

    if (!imageMimes.has(item.mimeType) && !audioMimes.has(item.mimeType)) {
      issues.push({ severity: "error", code: "unsupported_mime_type", message: "Imported asset MIME type is not supported.", records: [item.filename, item.mimeType] });
    }
    if (!supportedExtensions.has(extensionFor(item.filename))) {
      issues.push({ severity: "error", code: "unsupported_extension", message: "Imported asset extension is not supported.", records: [item.filename] });
    }
    if (item.status !== "missing" && item.normalizedAsset.storagePath && isAbsolutePrivatePath(item.normalizedAsset.storagePath)) {
      issues.push({ severity: "error", code: "private_storage_path", message: "Storage paths must be Studio-managed, not absolute local paths.", records: [item.filename] });
    }
    for (const warning of item.warnings) {
      issues.push({ severity: warning.startsWith("Unsupported") ? "error" : "warning", code: "asset_import_warning", message: warning, records: [item.filename] });
    }
  }

  for (const [artKey, filenames] of artKeys) {
    if (filenames.length > 1) issues.push({ severity: "error", code: "duplicate_art_key", message: "artKey values must be unique.", records: [artKey, ...filenames] });
  }
  for (const [iconKey, filenames] of iconKeys) {
    if (filenames.length > 1) issues.push({ severity: "warning", code: "duplicate_icon_key", message: "iconKey values should be unique.", records: [iconKey, ...filenames] });
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    valid: errorCount === 0,
    status: errorCount ? "Blocked" as const : warningCount ? "Ready With Warnings" as const : "Ready" as const,
    errorCount,
    warningCount,
    checkedAt: new Date().toISOString(),
    issues
  };
}

export async function createGameArtImportPreview(request: GameArtImportRequest = {}): Promise<GameArtImportPreview> {
  const files = [...(request.files ?? []), ...(request.assets ?? [])];
  const [legacyAssets, store] = await Promise.all([getRows("assets"), readStore()]);
  const existingRows = [...legacyAssets, ...store.assets] as Record<string, unknown>[];
  const seenArtKeys = new Set<string>();
  const items = files.map((file) => normalizeFile(file, request, existingRows, seenArtKeys));
  const validation = validatePreviewItems(items);
  const matchedAssetCount = items.filter((item) => item.matchedAssetId).length;
  const duplicateCount = items.filter((item) => item.duplicate).length;

  return {
    id: `game-art-import-${Date.now()}`,
    sourceProject: request.sourceProject ?? "Unknown Project",
    sourceType: request.sourceType ?? "generic_assets",
    sourceRoot: sanitizeSourceRoot(request.sourceRoot ?? ""),
    inputType: request.inputType ?? "json_asset_manifest",
    importedAt: new Date().toISOString(),
    fileCount: items.length,
    matchedAssetCount,
    unmatchedFileCount: items.length - matchedAssetCount,
    duplicateCount,
    warningCount: validation.warningCount,
    validation,
    items
  };
}

export async function applyGameArtImport(request: GameArtImportRequest = {}) {
  const preview = await createGameArtImportPreview(request);
  if (!preview.validation.valid) return { ok: false as const, status: 409, preview };

  const store = await readStore();
  const byId = new Map(store.assets.map((asset) => [asset.id, asset]));
  let createdAssets = 0;
  let updatedAssets = 0;
  let ignoredFiles = 0;

  for (const item of preview.items) {
    if (item.action === "ignore") {
      ignoredFiles += 1;
      continue;
    }
    const existing = byId.get(item.normalizedAsset.id);
    byId.set(item.normalizedAsset.id, { ...(existing ?? {}), ...item.normalizedAsset, updatedAt: new Date().toISOString() });
    if (existing) updatedAssets += 1;
    else createdAssets += 1;
  }

  const historyEntry: GameArtImportHistoryEntry = {
    importId: preview.id,
    sourceProject: preview.sourceProject,
    sourceType: preview.sourceType,
    timestamp: new Date().toISOString(),
    importedFiles: preview.fileCount,
    matchedAssets: preview.matchedAssetCount,
    createdAssets,
    updatedAssets,
    ignoredFiles,
    conflicts: preview.items.filter((item) => item.conflict).length,
    warnings: preview.warningCount,
    user: "studio"
  };

  await writeStore({
    assets: [...byId.values()].sort((left, right) => left.id.localeCompare(right.id)),
    variants: store.variants,
    history: [historyEntry, ...store.history].slice(0, 50)
  });

  return { ok: true as const, status: 200, preview, result: historyEntry };
}

export async function getAppliedGameArtAssets() {
  return (await readStore()).assets;
}

export async function upsertAppliedGameArtAssets(
  assets: AssetDefinition[],
  history?: Omit<GameArtImportHistoryEntry, "importId" | "timestamp" | "user"> & Partial<Pick<GameArtImportHistoryEntry, "importId" | "timestamp" | "user">>
) {
  const store = await readStore();
  const byId = new Map(store.assets.map((asset) => [asset.id, asset]));
  let createdAssets = 0;
  let updatedAssets = 0;
  const now = new Date().toISOString();

  for (const asset of assets) {
    const existing = byId.get(asset.id);
    byId.set(asset.id, {
      ...(existing ?? {}),
      ...asset,
      platformMappings: {
        ...(existing?.platformMappings ?? {}),
        ...asset.platformMappings
      },
      aliases: [...new Set([...(existing?.aliases ?? []), ...(asset.aliases ?? [])].filter(Boolean))],
      tags: [...new Set([...(existing?.tags ?? []), ...(asset.tags ?? [])].filter(Boolean))],
      usageReferences: [...(existing?.usageReferences ?? []), ...(asset.usageReferences ?? [])]
        .filter((item, index, rows) => rows.findIndex((candidate) => candidate.type === item.type && candidate.id === item.id && candidate.name === item.name) === index),
      importedAt: existing?.importedAt ?? asset.importedAt ?? now,
      updatedAt: now
    });
    if (existing) updatedAssets += 1;
    else createdAssets += 1;
  }

  const historyEntry: GameArtImportHistoryEntry | null = history ? {
    importId: history.importId ?? `game-art-import-${Date.now()}`,
    sourceProject: history.sourceProject,
    sourceType: history.sourceType,
    timestamp: history.timestamp ?? now,
    importedFiles: history.importedFiles,
    matchedAssets: history.matchedAssets,
    createdAssets: history.createdAssets ?? createdAssets,
    updatedAssets: history.updatedAssets ?? updatedAssets,
    ignoredFiles: history.ignoredFiles,
    conflicts: history.conflicts,
    warnings: history.warnings,
    user: history.user ?? "studio"
  } : null;

  await writeStore({
    assets: [...byId.values()].sort((left, right) => left.id.localeCompare(right.id)),
    variants: store.variants,
    history: historyEntry ? [historyEntry, ...store.history].slice(0, 50) : store.history
  });

  return { createdAssets, updatedAssets };
}

function legacyAssetToLibraryRow(asset: AssetRecord): Record<string, unknown> {
  const artKey = slug(asset.name || asset.id);
  return {
    ...asset,
    art_key: artKey,
    icon_key: asset.slice_name || "",
    source_project: "Project Genesis Studio",
    source_file_name: asset.file_url?.split("/").pop() || asset.name,
    preview_url: asset.file_url,
    storage_path: "",
    platform_mappings: {
      ...(asset.file_url ? { web: { path: asset.file_url } } : {}),
      ...(asset.roblox_asset_id ? { roblox: { assetId: asset.roblox_asset_id } } : {})
    },
    aliases: [asset.name, asset.slice_name].filter(Boolean),
    tags: [asset.type, asset.category].filter(Boolean),
    imported_from: "Legacy Asset Table",
    usage_count: 0
  };
}

function importedAssetToLibraryRow(asset: AssetDefinition, usageCount = 0): Record<string, unknown> {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    category: asset.category,
    prompt: asset.notes,
    file_url: asset.previewUrl ?? "",
    source_file_url: "",
    source_file_type: asset.sourceExtension ?? "",
    parent_asset_id: "",
    slice_name: asset.iconKey ?? "",
    roblox_asset_id: asset.platformMappings.roblox?.assetId ?? "",
    export_status: asset.status,
    status: asset.status,
    notes: asset.notes,
    art_key: asset.artKey,
    icon_key: asset.iconKey ?? "",
    source_project: asset.importedFrom ?? "",
    source_file_name: asset.sourceFileName ?? "",
    source_extension: asset.sourceExtension ?? "",
    mime_type: asset.mimeType ?? "",
    dimensions: asset.width && asset.height ? `${asset.width}x${asset.height}` : "",
    aspect_ratio: asset.aspectRatio ?? "",
    file_size_bytes: asset.fileSizeBytes ?? 0,
    preview_url: asset.previewUrl ?? "",
    storage_path: asset.storagePath ?? "",
    platform_mappings: asset.platformMappings,
    usage_references: asset.usageReferences ?? [],
    aliases: asset.aliases ?? [],
    tags: asset.tags ?? [],
    imported_from: asset.importedFrom ?? "",
    imported_at: asset.importedAt ?? "",
    updated_at: asset.updatedAt ?? "",
    usage_count: usageCount
  };
}

export function buildAssetUsageIndexes(data: GameData, importedAssets: AssetDefinition[]) {
  const assetUsageByArtKey: Record<string, Array<{ type: string; id: string; name: string }>> = {};
  const assetUsageByIconKey: Record<string, Array<{ type: string; id: string; name: string }>> = {};
  const assetUsageByPlatform: Record<string, string[]> = {};

  const addArt = (key: string, usage: { type: string; id: string; name: string }) => {
    if (!key) return;
    assetUsageByArtKey[key] = [...(assetUsageByArtKey[key] ?? []), usage];
  };
  const addIcon = (key: string, usage: { type: string; id: string; name: string }) => {
    if (!key) return;
    assetUsageByIconKey[key] = [...(assetUsageByIconKey[key] ?? []), usage];
  };

  for (const asset of importedAssets) {
    for (const platform of Object.keys(asset.platformMappings)) {
      assetUsageByPlatform[platform] = [...(assetUsageByPlatform[platform] ?? []), asset.id];
    }
  }

  for (const row of data.research) addIcon(row.icon_name, { type: "research", id: row.id, name: row.name });
  for (const row of data.upgrades) addIcon(row.icon_name, { type: "upgrade", id: row.id, name: row.name });
  for (const row of data.buildings) {
    addIcon(row.icon_name, { type: "building", id: row.id, name: row.name });
    addArt(row.model_name, { type: "building", id: row.id, name: row.name });
  }
  for (const row of data.wonders) {
    addIcon(row.icon_name, { type: "wonder", id: row.id, name: row.name });
    addArt(row.model_name, { type: "wonder", id: row.id, name: row.name });
  }
  for (const row of data.generated_planets) {
    addArt(row.image_url ?? "", { type: "planet", id: row.id, name: row.name });
    addArt(row.orbit_view_image_url ?? "", { type: "planet", id: row.id, name: row.name });
  }

  return { assetUsageByArtKey, assetUsageByIconKey, assetUsageByPlatform };
}

export async function getGameArtImportWorkspaceState() {
  const store = await readStore();
  return {
    history: store.history,
    assetCount: store.assets.length,
    missingCount: store.assets.filter((asset) => asset.status === "missing").length,
    endpoint: "/api/game-art/import/preview",
    applyEndpoint: "/api/game-art/import/apply"
  };
}

export async function getMergedAssetLibraryRows() {
  const [legacyAssets, importedAssets, data] = await Promise.all([getRows("assets"), getAppliedGameArtAssets(), getGameData()]);
  const usage = buildAssetUsageIndexes(data, importedAssets);
  const usageCountFor = (asset: AssetDefinition) => (usage.assetUsageByArtKey[asset.artKey]?.length ?? 0) + (asset.iconKey ? usage.assetUsageByIconKey[asset.iconKey]?.length ?? 0 : 0);
  return {
    rows: [
      ...(legacyAssets as AssetRecord[]).map(legacyAssetToLibraryRow),
      ...importedAssets.map((asset) => importedAssetToLibraryRow(asset, usageCountFor(asset)))
    ],
    usage,
    importedAssets
  };
}
