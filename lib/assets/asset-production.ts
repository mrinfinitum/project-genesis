import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getGameData } from "@/lib/data";
import { applyGameArtImport, getGameArtImportWorkspaceState, getMergedAssetLibraryRows } from "@/lib/assets/game-art-import";

type Row = Record<string, unknown>;

export type AssetProductionStatus =
  | "not_started"
  | "source_uploaded"
  | "in_progress"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "processing"
  | "derivatives_ready"
  | "mapping_required"
  | "ready_to_publish"
  | "published"
  | "blocked"
  | "error";

export type AssetApprovalStatus = "pending" | "approved" | "changes_requested" | "rejected";

export type SourceFileRecord = {
  id: string;
  assetId: string;
  filename: string;
  extension: string;
  mimeType: string;
  storagePath: string;
  fileSizeBytes: number;
  checksum: string;
  version: number;
  versionLabel: string;
  uploadedAt: string;
  uploadedBy: string;
  isCurrent: boolean;
  archived?: boolean;
  previewUrl?: string;
  previewStatus?: "ready" | "missing" | "failed" | "manual_required";
  width?: number | null;
  height?: number | null;
  notes: string;
};

export type AssetDerivativeRecord = {
  id: string;
  assetId: string;
  sourceFileId: string | null;
  derivativeType: string;
  format: string;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  quality: number | null;
  storagePath: string;
  publicUrl: string;
  checksum: string;
  generatedAt: string;
  generationMethod: string;
  status: string;
  approvalStatus?: AssetApprovalStatus;
  publishStatus?: "draft" | "ready" | "published" | "stale" | "archived";
  platformMappings?: Record<string, unknown>;
  archived?: boolean;
  staleSince?: string;
};

export type AssetDerivativePreset = {
  id: string;
  name: string;
  category: string;
  derivativeType: string;
  width: number;
  height: number;
  aspectRatio: string;
  format: "PNG" | "WebP" | "JPG" | "SVG" | "MP3" | "WAV" | "OGG" | "MP4";
  quality?: number;
  cropMode?: "contain" | "cover" | "crop" | "manual";
  focalPoint?: string;
  transparentBackground?: boolean;
  engineTargets?: string[];
  notes?: string;
  archived?: boolean;
  updatedAt?: string;
  required: boolean;
};

export type AssetRequirementProfile = {
  id: string;
  objectType: string;
  label: string;
  requirements: Array<{
    derivativeType: string;
    required: boolean;
    presetId: string;
    priority: "low" | "medium" | "high" | "critical";
  }>;
};

export type MissingAssetRequirement = {
  id: string;
  objectType: string;
  objectId: string;
  objectName: string;
  requiredDerivative: string;
  currentStatus: "missing" | "partial" | "draft" | "review" | "approved" | "published";
  priority: "low" | "medium" | "high" | "critical";
  linkedCanonicalRecord: string;
  artKey: string;
  iconKey: string;
  assignedArtist: string;
  dueDate: string;
  completionPercent: number;
};

export type ProcessingJobRecord = {
  id: string;
  assetId: string;
  sourceFileId: string | null;
  presetId: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string;
  retryCount: number;
};

export type ProductionTaskRecord = {
  id: string;
  requirementId: string;
  era: string;
  linkedObject: string;
  requirementType: string;
  dimensions: string;
  format: string;
  priority: MissingAssetRequirement["priority"];
  assignedArtist: string;
  dueDate: string;
  assetLink: string;
  sourceUploadLink: string;
  status: "open" | "in_progress" | "in_review" | "complete" | "cancelled";
  createdAt: string;
  updatedAt: string;
  notes: string;
};

export type ProductionAsset = {
  id: string;
  name: string;
  type: string;
  category: string;
  artKey: string;
  iconKey: string;
  audioKey: string;
  modelKey: string;
  description: string;
  status: string;
  productionStatus: AssetProductionStatus;
  approvalStatus: AssetApprovalStatus;
  reviewEvents: AssetReviewEvent[];
  sourceFiles: SourceFileRecord[];
  variants: AssetDerivativeRecord[];
  derivatives: AssetDerivativeRecord[];
  platformMappings: Record<string, unknown>;
  usageReferences: Array<{ type: string; id: string; name: string }>;
  requirementProfileId: string;
  tags: string[];
  aliases: string[];
  notes: string;
  completionPercent: number;
  missingRequirements: string[];
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
  publishedAt: string;
  publishBlockers: string[];
  optionalMissingRequirements: string[];
  historyEvents: AssetHistoryEvent[];
};

export type AssetProductionState = {
  assets: ProductionAsset[];
  sourceFiles: SourceFileRecord[];
  generatedAssets: ProductionAsset[];
  publishedAssets: ProductionAsset[];
  missingRequirements: MissingAssetRequirement[];
  processingJobs: ProcessingJobRecord[];
  productionTasks: ProductionTaskRecord[];
  importHistory: Awaited<ReturnType<typeof getGameArtImportWorkspaceState>>["history"];
  derivativePresets: AssetDerivativePreset[];
  requirementProfiles: AssetRequirementProfile[];
  audit: Array<{
    category: string;
    recordsRequiringAssets: number;
    completeAssetSets: number;
    partialAssetSets: number;
    missingAssetSets: number;
    totalRequiredDerivatives: number;
  }>;
  dashboard: {
    totalAssets: number;
    sourceFilesUploaded: number;
    derivativesComplete: number;
    awaitingReview: number;
    approved: number;
    published: number;
    missingAssets: number;
    failedProcessingJobs: number;
    engineMappingsIncomplete: number;
  };
};

export type AssetReviewEvent = {
  id: string;
  assetId: string;
  action: "submit_review" | "approve" | "request_changes" | "reject" | "publish" | "unpublish";
  reviewer: string;
  timestamp: string;
  notes: string;
  approvedSourceVersionId?: string;
  approvedDerivativeIds?: string[];
  publicationTargets?: string[];
  adminOverride?: boolean;
};

export type AssetHistoryEvent = {
  id: string;
  assetId: string;
  eventType: string;
  title: string;
  timestamp: string;
  notes: string;
};

type AssetProductionOverride = {
  sourceFiles?: SourceFileRecord[];
  derivatives?: AssetDerivativeRecord[];
  platformMappings?: Record<string, unknown>;
  requirementProfileId?: string;
  status?: string;
  productionStatus?: AssetProductionStatus;
  approvalStatus?: AssetApprovalStatus;
  approvedAt?: string;
  publishedAt?: string;
  reviewEvents?: AssetReviewEvent[];
  historyEvents?: AssetHistoryEvent[];
};

type MissingRequirementOverride = {
  id: string;
  assignedArtist?: string;
  dueDate?: string;
  priority?: MissingAssetRequirement["priority"];
  notRequired?: boolean;
  requirementProfileId?: string;
  productionNotes?: string;
  status?: AssetProductionStatus | "missing";
  approvalStatus?: AssetApprovalStatus;
  publishStatus?: "draft" | "ready" | "published" | "stale" | "archived";
  assetId?: string;
};

type AssetProductionStore = {
  assets: Record<string, AssetProductionOverride>;
  derivativePresets: AssetDerivativePreset[];
  missingRequirements: Record<string, MissingRequirementOverride>;
  processingJobs: ProcessingJobRecord[];
  productionTasks: ProductionTaskRecord[];
};

export type AssetProductionActionInput = {
  action: string;
  assetId?: string;
  sourceFileId?: string;
  derivativeId?: string;
  presetId?: string;
  missingRequirementId?: string;
  reviewer?: string;
  notes?: string;
  adminOverride?: boolean;
  payload?: Record<string, unknown>;
};

const productionStorePath = process.env.PROJECT_GENESIS_ASSET_PRODUCTION_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_ASSET_PRODUCTION_STORE)
  : path.join(process.cwd(), "data", "asset-production.local.json");

export const derivativePresets: AssetDerivativePreset[] = [
  { id: "planet_icon", name: "Planet Icon", category: "planets", derivativeType: "icon", width: 256, height: 256, aspectRatio: "1:1", format: "PNG", required: true },
  { id: "planet_card", name: "Planet Card", category: "planets", derivativeType: "card", width: 1024, height: 1024, aspectRatio: "1:1", format: "WebP", required: true },
  { id: "planet_hero", name: "Planet Hero", category: "planets", derivativeType: "hero", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: true },
  { id: "resource_icon", name: "Resource Icon", category: "resources", derivativeType: "icon", width: 256, height: 256, aspectRatio: "1:1", format: "PNG", required: true },
  { id: "resource_card", name: "Resource Card", category: "resources", derivativeType: "card", width: 768, height: 768, aspectRatio: "1:1", format: "WebP", required: false },
  { id: "building_card", name: "Building Card", category: "buildings", derivativeType: "card", width: 1024, height: 1024, aspectRatio: "1:1", format: "WebP", required: true },
  { id: "building_hero", name: "Building Hero", category: "buildings", derivativeType: "hero", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: false },
  { id: "research_icon", name: "Research Icon", category: "research", derivativeType: "icon", width: 256, height: 256, aspectRatio: "1:1", format: "PNG", required: true },
  { id: "research_card", name: "Research Card", category: "research", derivativeType: "card", width: 768, height: 768, aspectRatio: "1:1", format: "WebP", required: false },
  { id: "era_icon", name: "Era Icon", category: "eras", derivativeType: "icon", width: 256, height: 256, aspectRatio: "1:1", format: "PNG", required: true },
  { id: "era_banner", name: "Era Banner", category: "eras", derivativeType: "banner", width: 1920, height: 640, aspectRatio: "3:1", format: "WebP", required: true },
  { id: "era_background", name: "Era Background", category: "eras", derivativeType: "background", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: true },
  { id: "era_hero", name: "Era Hero", category: "eras", derivativeType: "hero", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: true },
  { id: "era_timeline_card", name: "Timeline Card Art", category: "eras", derivativeType: "timeline", width: 1280, height: 720, aspectRatio: "16:9", format: "WebP", required: true },
  { id: "loading_screen", name: "Loading Screen", category: "ui", derivativeType: "loading", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: false },
  { id: "era_loading_screen", name: "Era Loading Screen", category: "eras", derivativeType: "loading", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: false },
  { id: "era_transition_art", name: "Era Transition Art", category: "eras", derivativeType: "transition", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: false },
  { id: "era_music", name: "Era Music", category: "eras", derivativeType: "music", width: 0, height: 0, aspectRatio: "audio", format: "MP3", required: false },
  { id: "era_ambient_audio", name: "Era Ambient Audio", category: "eras", derivativeType: "ambient", width: 0, height: 0, aspectRatio: "audio", format: "OGG", required: false },
  { id: "era_cinematic", name: "Era Cinematic", category: "eras", derivativeType: "cinematic", width: 1920, height: 1080, aspectRatio: "16:9", format: "MP4", required: false }
];

export const requirementProfiles: AssetRequirementProfile[] = [
  { id: "planet_requirement_profile", objectType: "planet", label: "Planet", requirements: requirements(["planet_icon", "planet_card", "planet_hero"], "high") },
  { id: "resource_requirement_profile", objectType: "resource", label: "Resource", requirements: requirements(["resource_icon", "resource_card"], "medium") },
  { id: "building_requirement_profile", objectType: "building", label: "Building", requirements: requirements(["building_card", "building_hero"], "high") },
  { id: "research_requirement_profile", objectType: "research", label: "Research", requirements: requirements(["research_icon", "research_card"], "medium") },
  { id: "era_requirement_profile", objectType: "era", label: "Era", requirements: requirements(["era_icon", "era_banner", "era_background", "era_hero", "era_timeline_card", "era_loading_screen", "era_transition_art", "era_music", "era_ambient_audio", "era_cinematic"], "high") },
  { id: "galaxy_requirement_profile", objectType: "galaxy", label: "Galaxy", requirements: requirements(["planet_card", "planet_hero"], "medium") },
  { id: "sector_requirement_profile", objectType: "sector", label: "Sector", requirements: requirements(["planet_card", "planet_hero"], "medium") },
  { id: "star_system_requirement_profile", objectType: "star_system", label: "Star System", requirements: requirements(["planet_card", "planet_hero"], "medium") },
  { id: "ui_requirement_profile", objectType: "ui", label: "UI", requirements: requirements(["loading_screen"], "low") }
];

async function readProductionStore(): Promise<AssetProductionStore> {
  try {
    const raw = await readFile(productionStorePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<AssetProductionStore>;
    return {
      assets: parsed.assets && typeof parsed.assets === "object" ? parsed.assets : {},
      derivativePresets: Array.isArray(parsed.derivativePresets) ? parsed.derivativePresets : [],
      missingRequirements: parsed.missingRequirements && typeof parsed.missingRequirements === "object" ? parsed.missingRequirements : {},
      processingJobs: Array.isArray(parsed.processingJobs) ? parsed.processingJobs : [],
      productionTasks: Array.isArray(parsed.productionTasks) ? parsed.productionTasks : []
    };
  } catch {
    return { assets: {}, derivativePresets: [], missingRequirements: {}, processingJobs: [], productionTasks: [] };
  }
}

async function writeProductionStore(store: AssetProductionStore) {
  await mkdir(path.dirname(productionStorePath), { recursive: true });
  await writeFile(productionStorePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function activePresets(store: AssetProductionStore) {
  const merged = new Map(derivativePresets.map((preset) => [preset.id, preset]));
  for (const preset of store.derivativePresets) {
    merged.set(preset.id, preset);
  }
  return [...merged.values()].filter((preset) => !preset.archived);
}

function productionEvent(assetId: string, eventType: string, title: string, notes = ""): AssetHistoryEvent {
  return {
    id: `history_${assetId}_${Date.now()}_${hash(`${eventType}:${notes}`)}`,
    assetId,
    eventType,
    title,
    timestamp: new Date().toISOString(),
    notes
  };
}

function assetOverrideFor(store: AssetProductionStore, assetId: string): AssetProductionOverride {
  return store.assets[assetId] ?? {};
}

function saveAssetOverride(store: AssetProductionStore, assetId: string, override: AssetProductionOverride) {
  store.assets[assetId] = {
    ...assetOverrideFor(store, assetId),
    ...override
  };
}

function requirements(presetIds: string[], priority: "low" | "medium" | "high" | "critical") {
  return presetIds.map((presetId) => {
    const preset = derivativePresets.find((item) => item.id === presetId);
    return {
      derivativeType: preset?.derivativeType ?? presetId,
      required: preset?.required ?? true,
      presetId,
      priority
    };
  });
}

function text(value: unknown, fallback = "") {
  const result = String(value ?? "").trim();
  return result || fallback;
}

function list(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return text(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function numeric(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function slug(value: string) {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function hash(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function assetIdForArtKey(artKey: string) {
  return `asset_${slug(artKey)}`;
}

function privatePath(value: string) {
  return /^\/Users\//.test(value) || /^\/Volumes\//.test(value) || /^[A-Za-z]:\\/.test(value);
}

function extensionFor(filename: string) {
  const match = filename.match(/\.[^.]+$/);
  return match?.[0]?.toLowerCase() ?? "";
}

function mimeFor(extension: string) {
  if (extension === ".psd") return "image/vnd.adobe.photoshop";
  if (extension === ".psb") return "image/vnd.adobe.photoshop";
  if (extension === ".ai") return "application/postscript";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".tiff" || extension === ".tif") return "image/tiff";
  if (extension === ".pdf") return "application/pdf";
  if (extension === ".blend") return "application/x-blender";
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".wav") return "audio/wav";
  if (extension === ".ogg") return "audio/ogg";
  if (extension === ".mp4") return "video/mp4";
  return "application/octet-stream";
}

function rowCategory(row: Row) {
  return slug(text(row.category, "game-assets"));
}

function artKeyFor(row: Row) {
  return text(row.art_key ?? row.artKey) || slug(text(row.name ?? row.id));
}

function iconKeyFor(row: Row) {
  return text(row.icon_key ?? row.iconKey ?? row.slice_name);
}

function sourceFileFor(row: Row): SourceFileRecord | null {
  const sourcePath = text(row.source_file_url);
  const sourceFilename = text(row.source_file_name) || sourcePath.split("/").pop() || "";

  if (!sourcePath && !sourceFilename) return null;

  const filename = sourceFilename || `${text(row.name ?? row.id)}-source`;
  const extension = text(row.source_file_type) ? `.${text(row.source_file_type).toLowerCase().replace(/^\./, "")}` : extensionFor(filename);
  const storagePath = privatePath(sourcePath) ? "[local-source-redacted]" : sourcePath;

  return {
    id: `source_${text(row.id)}_${hash(`${sourcePath}:${filename}`)}`,
    assetId: text(row.id),
    filename,
    extension,
    mimeType: mimeFor(extension),
    storagePath,
    fileSizeBytes: numeric(row.file_size_bytes),
    checksum: storagePath ? hash(storagePath) : "",
    version: 1,
    versionLabel: "v1",
    uploadedAt: text(row.imported_at ?? row.created_at ?? row.updated_at, ""),
    uploadedBy: "studio",
    isCurrent: true,
    archived: false,
    previewUrl: text(row.preview_url ?? row.file_url),
    previewStatus: text(row.preview_url ?? row.file_url) ? "ready" : extension === ".psd" || extension === ".psb" ? "manual_required" : "missing",
    width: numeric(String(row.dimensions ?? "").split("x")[0]) || null,
    height: numeric(String(row.dimensions ?? "").split("x")[1]) || null,
    notes: text(row.notes)
  };
}

function derivativeFor(row: Row, sourceFileId: string | null): AssetDerivativeRecord | null {
  const publicUrl = text(row.preview_url ?? row.file_url);
  const storagePath = text(row.storage_path);
  if (!publicUrl && !storagePath) return null;

  return {
    id: `derivative_${text(row.id)}_${hash(publicUrl || storagePath)}`,
    assetId: text(row.id),
    sourceFileId,
    derivativeType: iconKeyFor(row) ? "icon" : "card",
    format: extensionFor(publicUrl || storagePath).replace(".", "").toUpperCase() || "PNG",
    width: numeric(String(row.dimensions ?? "").split("x")[0]) || null,
    height: numeric(String(row.dimensions ?? "").split("x")[1]) || null,
    aspectRatio: text(row.aspect_ratio),
    quality: null,
    storagePath,
    publicUrl: privatePath(publicUrl) ? "" : publicUrl,
    checksum: hash(publicUrl || storagePath),
    generatedAt: text(row.imported_at ?? row.updated_at, ""),
    generationMethod: text(row.imported_from) ? "imported" : "manual_upload",
    status: text(row.status, "draft"),
    approvalStatus: approvalStatusFor(row),
    publishStatus: slug(text(row.status ?? row.export_status)).includes("published") ? "published" : "draft",
    platformMappings: (row.platform_mappings ?? row.platformMappings ?? {}) as Record<string, unknown>,
    archived: false
  };
}

function profileForCategory(category: string) {
  const normalized = slug(category);
  if (normalized.includes("resource")) return requirementProfiles.find((profile) => profile.objectType === "resource")!;
  if (normalized.includes("building")) return requirementProfiles.find((profile) => profile.objectType === "building")!;
  if (normalized.includes("research")) return requirementProfiles.find((profile) => profile.objectType === "research")!;
  if (normalized.includes("era")) return requirementProfiles.find((profile) => profile.objectType === "era")!;
  if (normalized.includes("planet")) return requirementProfiles.find((profile) => profile.objectType === "planet")!;
  return requirementProfiles.find((profile) => profile.objectType === "ui")!;
}

function productionStatusFor(row: Row, sourceFiles: SourceFileRecord[], derivatives: AssetDerivativeRecord[], missingRequirements: string[]): AssetProductionStatus {
  const status = slug(text(row.status ?? row.export_status));
  if (status.includes("published")) return "published";
  if (status.includes("error") || status.includes("failed")) return "error";
  if (!sourceFiles.length && !derivatives.length) return "not_started";
  if (sourceFiles.length && !derivatives.length) return "source_uploaded";
  if (missingRequirements.length) return "mapping_required";
  if (derivatives.length && sourceFiles.length) return "ready_to_publish";
  return "derivatives_ready";
}

function approvalStatusFor(row: Row): AssetApprovalStatus {
  const status = slug(text(row.approval_status ?? row.status ?? row.export_status));
  if (status.includes("approved") || status.includes("published")) return "approved";
  if (status.includes("change")) return "changes_requested";
  if (status.includes("reject")) return "rejected";
  return "pending";
}

function usageForAsset(row: Row, usage: Awaited<ReturnType<typeof getMergedAssetLibraryRows>>["usage"]) {
  const art = artKeyFor(row);
  const icon = iconKeyFor(row);
  return [...(usage.assetUsageByArtKey[art] ?? []), ...(icon ? usage.assetUsageByIconKey[icon] ?? [] : [])];
}

function completion(profile: AssetRequirementProfile, derivatives: AssetDerivativeRecord[]) {
  const required = profile.requirements.filter((requirement) => requirement.required);
  if (!required.length) return { percent: 100, missing: [] as string[] };
  const derivativeTypes = new Set(derivatives.map((item) => item.derivativeType));
  const missing = required.filter((requirement) => !derivativeTypes.has(requirement.derivativeType)).map((requirement) => requirement.derivativeType);
  return {
    percent: Math.round(((required.length - missing.length) / required.length) * 100),
    missing
  };
}

function profileById(profileId: string) {
  return requirementProfiles.find((profile) => profile.id === profileId) ?? profileForCategory(profileId);
}

function productionAssetFor(row: Row, usage: Awaited<ReturnType<typeof getMergedAssetLibraryRows>>["usage"], store: AssetProductionStore): ProductionAsset {
  const assetId = text(row.id);
  const override = assetOverrideFor(store, assetId);
  const sourceFile = sourceFileFor(row);
  const hasOverrideCurrentSource = Boolean(override.sourceFiles?.some((source) => source.isCurrent && !source.archived));
  const sourceFiles = [...(sourceFile ? [{ ...sourceFile, isCurrent: hasOverrideCurrentSource ? false : sourceFile.isCurrent }] : []), ...(override.sourceFiles ?? [])]
    .filter((source) => !source.archived)
    .sort((left, right) => right.version - left.version);
  const derivative = derivativeFor(row, sourceFile?.id ?? null);
  const derivatives = [...(derivative ? [derivative] : []), ...(override.derivatives ?? [])]
    .filter((item) => !item.archived)
    .sort((left, right) => left.derivativeType.localeCompare(right.derivativeType));
  const profile = override.requirementProfileId ? profileById(override.requirementProfileId) : profileForCategory(rowCategory(row));
  const readiness = completion(profile, derivatives);
  const optionalMissing = profile.requirements
    .filter((requirement) => !requirement.required && !derivatives.some((derivativeItem) => derivativeItem.derivativeType === requirement.derivativeType))
    .map((requirement) => requirement.derivativeType);
  const status = override.status ?? text(row.status ?? row.export_status, "draft");
  const approvalStatus = override.approvalStatus ?? approvalStatusFor(row);
  const productionStatus = override.productionStatus ?? productionStatusFor(row, sourceFiles, derivatives, readiness.missing);
  const platformMappings = {
    ...((row.platform_mappings ?? row.platformMappings ?? {}) as Record<string, unknown>),
    ...(override.platformMappings ?? {})
  };
  const approvedRequiredDerivatives = derivatives.filter((item) => item.approvalStatus === "approved" || item.status.toLowerCase().includes("approved"));
  const publishBlockers = readiness.missing.length
    ? readiness.missing.map((item) => `Missing required ${item}`)
    : approvedRequiredDerivatives.length < profile.requirements.filter((requirement) => requirement.required).length
      ? ["Required derivatives need approval before publishing"]
      : [];

  return {
    id: assetId,
    name: text(row.name, assetId),
    type: text(row.type, "image"),
    category: text(row.category, "game-assets"),
    artKey: artKeyFor(row),
    iconKey: iconKeyFor(row),
    audioKey: text(row.audio_key ?? row.audioKey),
    modelKey: text(row.model_key ?? row.modelKey),
    description: text(row.description ?? row.prompt),
    status,
    productionStatus,
    approvalStatus,
    reviewEvents: override.reviewEvents ?? [],
    sourceFiles,
    variants: derivatives,
    derivatives,
    platformMappings,
    usageReferences: usageForAsset(row, usage),
    requirementProfileId: profile.id,
    tags: list(row.tags),
    aliases: list(row.aliases),
    notes: text(row.notes),
    completionPercent: readiness.percent,
    missingRequirements: readiness.missing,
    createdAt: text(row.created_at ?? row.imported_at),
    updatedAt: text(row.updated_at ?? row.imported_at),
    approvedAt: override.approvedAt ?? text(row.approved_at),
    publishedAt: override.publishedAt ?? text(row.published_at),
    publishBlockers,
    optionalMissingRequirements: optionalMissing,
    historyEvents: override.historyEvents ?? []
  };
}

function canonicalRequirementsByObject() {
  return {
    planets: requirementProfiles.find((profile) => profile.objectType === "planet")!,
    resources: requirementProfiles.find((profile) => profile.objectType === "resource")!,
    buildings: requirementProfiles.find((profile) => profile.objectType === "building")!,
    research: requirementProfiles.find((profile) => profile.objectType === "research")!,
    upgrades: requirementProfiles.find((profile) => profile.objectType === "research")!,
    eras: requirementProfiles.find((profile) => profile.objectType === "era")!,
    celestial_bodies: requirementProfiles.find((profile) => profile.objectType === "planet")!
  };
}

function assetForKey(assets: ProductionAsset[], key: string) {
  const normalized = slug(key);
  return assets.find((asset) => slug(asset.artKey) === normalized || slug(asset.iconKey) === normalized || slug(asset.id) === normalized);
}

function missingForRecord(input: {
  objectType: string;
  objectId: string;
  objectName: string;
  key: string;
  profile: AssetRequirementProfile;
  assets: ProductionAsset[];
}): MissingAssetRequirement[] {
  const linked = assetForKey(input.assets, input.key);
  const missing = linked ? linked.missingRequirements : input.profile.requirements.filter((requirement) => requirement.required).map((requirement) => requirement.derivativeType);
  const currentStatus = !linked ? "missing" : linked.completionPercent >= 100 ? "published" : "partial";
  return missing.map((requiredDerivative) => ({
    id: `missing_${input.objectType}_${input.objectId}_${requiredDerivative}`,
    objectType: input.objectType,
    objectId: input.objectId,
    objectName: input.objectName,
    requiredDerivative,
    currentStatus,
    priority: input.profile.requirements.find((requirement) => requirement.derivativeType === requiredDerivative)?.priority ?? "medium",
    linkedCanonicalRecord: input.objectId,
    artKey: linked?.artKey ?? input.key,
    iconKey: linked?.iconKey ?? "",
    assignedArtist: "",
    dueDate: "",
    completionPercent: linked?.completionPercent ?? 0
  }));
}

function processingJobsFor(assets: ProductionAsset[]): ProcessingJobRecord[] {
  return assets
    .filter((asset) => asset.sourceFiles.length && asset.missingRequirements.length)
    .flatMap((asset) =>
      asset.missingRequirements.map((derivativeType) => {
        const preset = derivativePresets.find((item) => item.derivativeType === derivativeType && item.category === slug(asset.category)) ?? derivativePresets.find((item) => item.derivativeType === derivativeType);
        return {
          id: `job_${asset.id}_${derivativeType}`,
          assetId: asset.id,
          sourceFileId: asset.sourceFiles[0]?.id ?? null,
          presetId: preset?.id ?? derivativeType,
          status: "queued" as const,
          progress: 0,
          startedAt: null,
          completedAt: null,
          errorMessage: "",
          retryCount: 0
        };
      })
    );
}

function auditRows(label: string, records: Array<{ missing: MissingAssetRequirement[] }>, profile: AssetRequirementProfile) {
  const complete = records.filter((record) => !record.missing.length).length;
  const missing = records.filter((record) => record.missing.length === profile.requirements.filter((requirement) => requirement.required).length).length;
  return {
    category: label,
    recordsRequiringAssets: records.length,
    completeAssetSets: complete,
    partialAssetSets: records.length - complete - missing,
    missingAssetSets: missing,
    totalRequiredDerivatives: records.length * profile.requirements.filter((requirement) => requirement.required).length
  };
}

export async function getAssetProductionState(): Promise<AssetProductionState> {
  const [{ rows, usage }, data, importState, store] = await Promise.all([getMergedAssetLibraryRows(), getGameData(), getGameArtImportWorkspaceState(), readProductionStore()]);
  const assets = rows.map((row) => productionAssetFor(row, usage, store)).sort((left, right) => left.name.localeCompare(right.name));
  const presets = activePresets(store);
  const profiles = canonicalRequirementsByObject();
  const missingRequirements: MissingAssetRequirement[] = [];

  const groups = {
    resources: data.resource_catalog.map((row) => ({ id: row.id, name: row.resource_name, key: row.id.replace(/^resource_/, "resource_") })),
    research: data.research.map((row) => ({ id: row.id, name: row.name, key: row.icon_name || row.id })),
    buildings: data.buildings.map((row) => ({ id: row.id, name: row.name, key: row.model_name || row.icon_name || row.id })),
    planets: data.generated_planets.map((row) => ({ id: row.id, name: row.name, key: row.id })),
    celestial_bodies: data.celestial_bodies.map((row) => ({ id: row.id, name: row.name, key: row.id })),
    upgrades: data.upgrades.map((row) => ({ id: row.id, name: row.name, key: row.icon_name || row.id })),
    eras: Array.from(new Set(data.research.map((row) => row.era))).map((era) => ({ id: slug(era), name: era, key: `${slug(era)}_banner` }))
  };

  const audit = Object.entries(groups).map(([category, records]) => {
    const profile = profiles[category as keyof typeof profiles];
    const checked = records.map((record) => {
      const missing = missingForRecord({ objectType: category, objectId: record.id, objectName: record.name, key: record.key, profile, assets })
        .map((item) => ({ ...item, ...(store.missingRequirements[item.id] ?? {}) }))
        .filter((item) => !item.notRequired);
      missingRequirements.push(...missing as MissingAssetRequirement[]);
      return { missing };
    });
    return auditRows(category, checked, profile);
  });

  const processingJobs = [...processingJobsFor(assets), ...store.processingJobs]
    .filter((job, index, rows) => rows.findIndex((item) => item.id === job.id) === index);
  const sourceFiles = assets.flatMap((asset) => asset.sourceFiles);
  const generatedAssets = assets.filter((asset) => asset.derivatives.length);
  const publishedAssets = assets.filter((asset) => asset.productionStatus === "published" || asset.status.toLowerCase() === "published");

  return {
    assets,
    sourceFiles,
    generatedAssets,
    publishedAssets,
    missingRequirements: missingRequirements.sort((left, right) => left.objectType.localeCompare(right.objectType) || left.objectName.localeCompare(right.objectName)),
    processingJobs,
    productionTasks: store.productionTasks,
    importHistory: importState.history,
    derivativePresets: presets,
    requirementProfiles,
    audit,
    dashboard: {
      totalAssets: assets.length,
      sourceFilesUploaded: sourceFiles.length,
      derivativesComplete: assets.reduce((sum, asset) => sum + asset.derivatives.length, 0),
      awaitingReview: assets.filter((asset) => asset.approvalStatus === "pending" && asset.productionStatus !== "not_started").length,
      approved: assets.filter((asset) => asset.approvalStatus === "approved").length,
      published: publishedAssets.length,
      missingAssets: missingRequirements.length,
      failedProcessingJobs: processingJobs.filter((job) => job.status === "failed").length,
      engineMappingsIncomplete: assets.filter((asset) => !Object.keys(asset.platformMappings).length).length
    }
  };
}

export async function getAssetProductionRequirementMetadata() {
  const store = await readProductionStore();
  return {
    missingRequirements: store.missingRequirements,
    productionTasks: store.productionTasks
  };
}

export async function getProductionAsset(assetId: string) {
  const state = await getAssetProductionState();
  return state.assets.find((asset) => asset.id === assetId) ?? null;
}

export async function getProductionSourceFile(sourceFileId: string) {
  const state = await getAssetProductionState();
  for (const asset of state.assets) {
    const sourceFile = asset.sourceFiles.find((source) => source.id === sourceFileId);
    if (sourceFile) return sourceFile;
  }
  return null;
}

export async function getAssetProductionRuntimeOverrides() {
  const store = await readProductionStore();
  return Object.fromEntries(
    Object.entries(store.assets)
      .filter(([, override]) => override.platformMappings || override.status || override.productionStatus || override.approvalStatus)
      .map(([assetId, override]) => [
        assetId,
        {
          status: override.status ?? override.productionStatus,
          productionStatus: override.productionStatus,
          approvalStatus: override.approvalStatus,
          platformMappings: override.platformMappings ?? {}
        }
      ])
  );
}

function normalizedRobloxAssetId(value: unknown) {
  const raw = text(value);
  const digits = raw.replace(/^rbxassetid:\/\//, "").replace(/\D/g, "");
  if (!digits) {
    throw new Error("Roblox asset ID must include a numeric ID.");
  }
  return `rbxassetid://${digits}`;
}

function sourceVersion(input: AssetProductionActionInput, currentVersions: SourceFileRecord[]): SourceFileRecord {
  const payload = input.payload ?? {};
  const filename = text(payload.filename, "source-art.psd");
  const extension = extensionFor(filename) || text(payload.extension, ".psd");
  const version = currentVersions.length ? Math.max(...currentVersions.map((item) => item.version)) + 1 : 1;
  return {
    id: `source_${input.assetId}_${Date.now()}_${hash(filename)}`,
    assetId: text(input.assetId),
    filename,
    extension,
    mimeType: text(payload.mimeType, mimeFor(extension)),
    storagePath: text(payload.storagePath, "studio-private://pending-source-upload"),
    fileSizeBytes: numeric(payload.fileSizeBytes),
    checksum: text(payload.checksum) || hash(`${filename}:${Date.now()}`),
    version,
    versionLabel: text(payload.versionLabel, `v${version}`),
    uploadedAt: new Date().toISOString(),
    uploadedBy: text(payload.uploadedBy, "studio"),
    isCurrent: true,
    archived: false,
    previewUrl: text(payload.previewUrl),
    previewStatus: text(payload.previewUrl) ? "ready" : extension === ".psd" || extension === ".psb" ? "manual_required" : "missing",
    width: numeric(payload.width) || null,
    height: numeric(payload.height) || null,
    notes: text(input.notes ?? payload.notes)
  };
}

function derivativeRecord(input: AssetProductionActionInput, currentSources: SourceFileRecord[]): AssetDerivativeRecord {
  const payload = input.payload ?? {};
  const width = numeric(payload.width) || null;
  const height = numeric(payload.height) || null;
  const derivativeType = text(payload.derivativeType, "card");
  const format = text(payload.format, "PNG");
  const publicUrl = text(payload.publicUrl);
  const storagePath = text(payload.storagePath, publicUrl);
  return {
    id: text(input.derivativeId) || `derivative_${input.assetId}_${derivativeType}_${Date.now()}`,
    assetId: text(input.assetId),
    sourceFileId: text(payload.sourceFileId) || currentSources.find((source) => source.isCurrent)?.id || null,
    derivativeType,
    format,
    width,
    height,
    aspectRatio: width && height ? `${width}:${height}` : text(payload.aspectRatio),
    quality: numeric(payload.quality) || null,
    storagePath,
    publicUrl,
    checksum: text(payload.checksum) || hash(`${publicUrl}:${storagePath}:${Date.now()}`),
    generatedAt: new Date().toISOString(),
    generationMethod: text(payload.generationMethod, "manual_upload"),
    status: text(payload.status, "draft"),
    approvalStatus: "pending",
    publishStatus: "draft",
    platformMappings: {},
    archived: false
  };
}

export async function applyAssetProductionAction(input: AssetProductionActionInput) {
  const store = await readProductionStore();
  const assetId = text(input.assetId);
  const now = new Date().toISOString();

  if (!assetId && !input.action.startsWith("preset.") && !input.action.startsWith("queue.") && !input.action.startsWith("missing.") && !input.action.startsWith("requirement.") && !input.action.startsWith("task.") && !input.action.startsWith("bulk.")) {
    throw new Error("assetId is required for this production action.");
  }

  if (input.action === "requirement.create_asset") {
    const payload = input.payload ?? {};
    const artKey = slug(text(payload.artKey));
    if (!artKey) throw new Error("artKey is required.");
    const iconKey = slug(text(payload.iconKey, artKey));
    const proposedAssetId = text(payload.assetId) || assetIdForArtKey(artKey);
    const state = await getAssetProductionState();
    const existing = state.assets.find((asset) => asset.id === proposedAssetId || slug(asset.artKey) === artKey || slug(asset.iconKey) === iconKey);
    const missingRequirementId = text(input.missingRequirementId ?? payload.missingRequirementId);

    if (!existing) {
      const result = await applyGameArtImport({
        sourceProject: "Era Art Inventory",
        sourceType: "generic_assets",
        inputType: "json_asset_manifest",
        files: [{
          filename: `${artKey}.png`,
          name: text(payload.assetName, artKey.replaceAll("_", " ")),
          category: text(payload.category, "eras"),
          type: text(payload.assetType, "image"),
          artKey,
          iconKey,
          width: numeric(payload.width) || undefined,
          height: numeric(payload.height) || undefined,
          notes: text(payload.notes, "Created from Era Art requirement."),
          tags: ["era-art", text(payload.eraId), text(payload.linkedObjectType), text(payload.requirementType)].filter(Boolean)
        }]
      });
      if (!result.ok) throw new Error("Could not create asset record from requirement.");
    }

    if (missingRequirementId) {
      const existingMissing = store.missingRequirements[missingRequirementId] ?? { id: missingRequirementId };
      store.missingRequirements[missingRequirementId] = {
        ...existingMissing,
        assetId: existing?.id ?? proposedAssetId,
        status: existingMissing.status ?? "not_started",
        priority: (text(payload.priority, existingMissing.priority ?? "medium") as MissingAssetRequirement["priority"]),
        assignedArtist: text(payload.assignedArtist, existingMissing.assignedArtist),
        dueDate: text(payload.dueDate, existingMissing.dueDate),
        productionNotes: text(payload.productionNotes, existingMissing.productionNotes)
      };
      await writeProductionStore(store);
    }

    return { ok: true, action: input.action, assetId: existing?.id ?? proposedAssetId, existing: Boolean(existing) };
  }

  if (input.action.startsWith("preset.")) {
    const payload = input.payload ?? {};
    const presetId = text(input.presetId ?? payload.id) || `preset_${Date.now()}`;
    const existing = activePresets(store).find((preset) => preset.id === presetId);
    const nextPreset: AssetDerivativePreset = {
      id: presetId,
      name: text(payload.name, existing?.name ?? "New Preset"),
      category: text(payload.category, existing?.category ?? "game-assets"),
      derivativeType: text(payload.derivativeType, existing?.derivativeType ?? "card"),
      width: numeric(payload.width) || existing?.width || 1024,
      height: numeric(payload.height) || existing?.height || 1024,
      aspectRatio: text(payload.aspectRatio, existing?.aspectRatio ?? "1:1"),
      format: (text(payload.outputFormat ?? payload.format, existing?.format ?? "PNG") as AssetDerivativePreset["format"]),
      quality: numeric(payload.quality) || existing?.quality || 90,
      cropMode: (text(payload.cropMode, existing?.cropMode ?? "contain") as AssetDerivativePreset["cropMode"]),
      focalPoint: text(payload.focalPoint, existing?.focalPoint ?? "center"),
      transparentBackground: typeof payload.transparentBackground === "boolean" ? payload.transparentBackground : existing?.transparentBackground ?? true,
      engineTargets: Array.isArray(payload.engineTargets) ? payload.engineTargets.map(String) : existing?.engineTargets ?? ["web", "roblox"],
      notes: text(input.notes ?? payload.notes, existing?.notes ?? ""),
      archived: input.action === "preset.archive",
      required: typeof payload.required === "boolean" ? payload.required : existing?.required ?? true,
      updatedAt: now
    };
    store.derivativePresets = [...store.derivativePresets.filter((preset) => preset.id !== presetId), nextPreset].sort((left, right) => left.name.localeCompare(right.name));

    if (input.action === "preset.duplicate") {
      const duplicate = { ...nextPreset, id: `preset_${Date.now()}_${hash(nextPreset.id)}`, name: `${nextPreset.name} Copy`, updatedAt: now };
      store.derivativePresets.push(duplicate);
    }

    await writeProductionStore(store);
    return { ok: true, action: input.action, preset: nextPreset };
  }

  if (input.action.startsWith("missing.")) {
    const missingRequirementId = text(input.missingRequirementId);
    if (!missingRequirementId) throw new Error("missingRequirementId is required.");
    const existing = store.missingRequirements[missingRequirementId] ?? { id: missingRequirementId };
    store.missingRequirements[missingRequirementId] = {
      ...existing,
      assignedArtist: text(input.payload?.assignedArtist, existing.assignedArtist),
      dueDate: text(input.payload?.dueDate, existing.dueDate),
      priority: (text(input.payload?.priority, existing.priority ?? "medium") as MissingAssetRequirement["priority"]),
      notRequired: input.action === "missing.mark_not_required" ? true : existing.notRequired,
      requirementProfileId: text(input.payload?.requirementProfileId, existing.requirementProfileId),
      productionNotes: text(input.payload?.productionNotes ?? input.payload?.notes, existing.productionNotes),
      status: (text(input.payload?.status, existing.status ?? "missing") as MissingRequirementOverride["status"]),
      approvalStatus: (text(input.payload?.approvalStatus, existing.approvalStatus ?? "pending") as AssetApprovalStatus),
      publishStatus: (text(input.payload?.publishStatus, existing.publishStatus ?? "draft") as MissingRequirementOverride["publishStatus"]),
      assetId: text(input.payload?.assetId, existing.assetId)
    };
    await writeProductionStore(store);
    return { ok: true, action: input.action, missingRequirement: store.missingRequirements[missingRequirementId] };
  }

  if (input.action === "task.generate_missing") {
    const payload = input.payload ?? {};
    const requirements = Array.isArray(payload.requirements) ? payload.requirements as Record<string, unknown>[] : [];
    const ids = new Set(Array.isArray(payload.missingRequirementIds) ? payload.missingRequirementIds.map(String) : []);
    const requested = requirements.filter((requirement) => ids.size === 0 || ids.has(text(requirement.id)));
    const openTaskRequirementIds = new Set(store.productionTasks.filter((task) => !["complete", "cancelled"].includes(task.status)).map((task) => task.requirementId));
    const createdTasks: ProductionTaskRecord[] = [];

    for (const requirement of requested) {
      const requirementId = text(requirement.id);
      if (!requirementId || openTaskRequirementIds.has(requirementId)) continue;
      const task: ProductionTaskRecord = {
        id: `task_${requirementId}_${hash(`${requirementId}:${now}`)}`,
        requirementId,
        era: text(requirement.era),
        linkedObject: text(requirement.linkedObject),
        requirementType: text(requirement.requirementType),
        dimensions: text(requirement.dimensions),
        format: text(requirement.format),
        priority: (text(requirement.priority, "medium") as MissingAssetRequirement["priority"]),
        assignedArtist: text(requirement.assignedArtist),
        dueDate: text(requirement.dueDate),
        assetLink: text(requirement.assetLink),
        sourceUploadLink: text(requirement.sourceUploadLink),
        status: "open",
        createdAt: now,
        updatedAt: now,
        notes: text(requirement.notes)
      };
      store.productionTasks.push(task);
      createdTasks.push(task);
      openTaskRequirementIds.add(requirementId);
    }

    await writeProductionStore(store);
    return { ok: true, action: input.action, createdTasks, skippedDuplicates: requested.length - createdTasks.length };
  }

  if (input.action === "bulk.missing_update") {
    const payload = input.payload ?? {};
    const ids = Array.isArray(payload.missingRequirementIds) ? payload.missingRequirementIds.map(String) : [];
    for (const missingRequirementId of ids) {
      const existing = store.missingRequirements[missingRequirementId] ?? { id: missingRequirementId };
      store.missingRequirements[missingRequirementId] = {
        ...existing,
        assignedArtist: text(payload.assignedArtist, existing.assignedArtist),
        dueDate: text(payload.dueDate, existing.dueDate),
        priority: (text(payload.priority, existing.priority ?? "medium") as MissingAssetRequirement["priority"]),
        productionNotes: text(payload.productionNotes ?? payload.notes, existing.productionNotes),
        status: (text(payload.status, existing.status ?? "missing") as MissingRequirementOverride["status"]),
        approvalStatus: (text(payload.approvalStatus, existing.approvalStatus ?? "pending") as AssetApprovalStatus),
        publishStatus: (text(payload.publishStatus, existing.publishStatus ?? "draft") as MissingRequirementOverride["publishStatus"]),
        notRequired: payload.notRequired === true ? true : existing.notRequired
      };
    }
    await writeProductionStore(store);
    return { ok: true, action: input.action, updated: ids.length };
  }

  if (input.action.startsWith("queue.")) {
    const jobId = text(input.payload?.jobId);
    if (!jobId && input.action !== "queue.clear_completed") throw new Error("jobId is required.");
    if (input.action === "queue.clear_completed") {
      store.processingJobs = store.processingJobs.filter((job) => job.status !== "completed");
    } else {
      store.processingJobs = store.processingJobs.map((job) => {
        if (job.id !== jobId) return job;
        if (input.action === "queue.retry") return { ...job, status: "queued", progress: 0, errorMessage: "", retryCount: job.retryCount + 1 };
        if (input.action === "queue.cancel") return { ...job, status: "cancelled", completedAt: now };
        if (input.action === "queue.reprocess") return { ...job, status: "queued", progress: 0, startedAt: null, completedAt: null, errorMessage: "", retryCount: job.retryCount + 1 };
        return job;
      });
    }
    await writeProductionStore(store);
    return { ok: true, action: input.action };
  }

  const override = assetOverrideFor(store, assetId);
  const historyEvents = override.historyEvents ?? [];
  const sourceFiles = override.sourceFiles ?? [];
  const derivatives = override.derivatives ?? [];

  if (input.action === "source.upload_version") {
    const next = sourceVersion(input, sourceFiles);
    saveAssetOverride(store, assetId, {
      sourceFiles: sourceFiles.map((source) => ({ ...source, isCurrent: false })).concat(next),
      productionStatus: "source_uploaded",
      historyEvents: [productionEvent(assetId, "source_version_uploaded", `Uploaded ${next.versionLabel}`, input.notes), ...historyEvents]
    });
  }

  if (input.action === "source.set_current" || input.action === "source.restore") {
    const sourceFileId = text(input.sourceFileId);
    const allSources = sourceFiles.map((source) => ({ ...source, isCurrent: source.id === sourceFileId }));
    if (!allSources.some((source) => source.isCurrent)) throw new Error("Source version was not found.");
    saveAssetOverride(store, assetId, {
      sourceFiles: allSources,
      historyEvents: [productionEvent(assetId, input.action, "Changed current source version", input.notes), ...historyEvents]
    });
  }

  if (input.action === "source.archive") {
    const sourceFileId = text(input.sourceFileId);
    saveAssetOverride(store, assetId, {
      sourceFiles: sourceFiles.map((source) => source.id === sourceFileId ? { ...source, archived: true, isCurrent: false } : source),
      historyEvents: [productionEvent(assetId, "source_archived", "Archived source version", input.notes), ...historyEvents]
    });
  }

  if (input.action === "source.preview") {
    const sourceFileId = text(input.sourceFileId);
    saveAssetOverride(store, assetId, {
      sourceFiles: sourceFiles.map((source) => source.id === sourceFileId ? { ...source, previewUrl: text(input.payload?.previewUrl), previewStatus: "ready" } : source),
      historyEvents: [productionEvent(assetId, "source_preview_uploaded", "Uploaded source preview", input.notes), ...historyEvents]
    });
  }

  if (input.action === "derivative.upload" || input.action === "derivative.replace") {
    const nextDerivative = derivativeRecord(input, sourceFiles);
    saveAssetOverride(store, assetId, {
      derivatives: derivatives.filter((derivative) => derivative.id !== nextDerivative.id).concat(nextDerivative),
      productionStatus: "derivatives_ready",
      historyEvents: [productionEvent(assetId, input.action, `Saved ${nextDerivative.derivativeType} derivative`, input.notes), ...historyEvents]
    });
  }

  if (input.action === "derivative.approve" || input.action === "derivative.needs_changes" || input.action === "derivative.archive") {
    const derivativeId = text(input.derivativeId);
    saveAssetOverride(store, assetId, {
      derivatives: derivatives.map((derivative) => derivative.id === derivativeId
        ? {
            ...derivative,
            approvalStatus: input.action === "derivative.approve" ? "approved" : input.action === "derivative.needs_changes" ? "changes_requested" : derivative.approvalStatus,
            status: input.action === "derivative.approve" ? "approved" : input.action === "derivative.needs_changes" ? "changes_requested" : derivative.status,
            archived: input.action === "derivative.archive" ? true : derivative.archived
          }
        : derivative),
      historyEvents: [productionEvent(assetId, input.action, "Updated derivative review state", input.notes), ...historyEvents]
    });
  }

  if (input.action.startsWith("review.")) {
    const action = input.action.replace("review.", "") as AssetReviewEvent["action"];
    const reviewEvent: AssetReviewEvent = {
      id: `review_${assetId}_${Date.now()}`,
      assetId,
      action,
      reviewer: text(input.reviewer, "studio"),
      timestamp: now,
      notes: text(input.notes),
      approvedSourceVersionId: sourceFiles.find((source) => source.isCurrent)?.id,
      approvedDerivativeIds: derivatives.filter((derivative) => derivative.approvalStatus === "approved").map((derivative) => derivative.id),
      publicationTargets: Array.isArray(input.payload?.publicationTargets) ? input.payload.publicationTargets.map(String) : [],
      adminOverride: Boolean(input.adminOverride)
    };
    const approvalStatus: AssetApprovalStatus = action === "approve" || action === "publish" ? "approved" : action === "request_changes" ? "changes_requested" : action === "reject" ? "rejected" : "pending";
    saveAssetOverride(store, assetId, {
      approvalStatus,
      status: action === "publish" ? "published" : action === "submit_review" ? "review" : approvalStatus,
      productionStatus: action === "publish" ? "published" : override.productionStatus,
      approvedAt: action === "approve" ? now : override.approvedAt,
      publishedAt: action === "publish" ? now : override.publishedAt,
      reviewEvents: [reviewEvent, ...(override.reviewEvents ?? [])],
      historyEvents: [productionEvent(assetId, input.action, `Review action: ${action}`, input.notes), ...historyEvents]
    });
  }

  if (input.action === "mapping.web_publish") {
    const asset = await getProductionAsset(assetId);
    if (asset?.publishBlockers.length && !input.adminOverride) {
      throw new Error(`Cannot publish: ${asset.publishBlockers.join(", ")}`);
    }
    const derivativeId = text(input.derivativeId);
    const derivative = derivatives.find((item) => item.id === derivativeId) ?? asset?.derivatives.find((item) => item.id === derivativeId);
    const webPath = text(input.payload?.path, derivative?.publicUrl || derivative?.storagePath || "");
    if (!webPath) throw new Error("A public Web path is required.");
    saveAssetOverride(store, assetId, {
      platformMappings: { ...(override.platformMappings ?? {}), web: { path: webPath, status: "published", publishedAt: now } },
      derivatives: derivatives.map((item) => item.id === derivativeId ? { ...item, publishStatus: "published", platformMappings: { ...(item.platformMappings ?? {}), web: { path: webPath } } } : item),
      productionStatus: "published",
      publishedAt: now,
      historyEvents: [productionEvent(assetId, "web_published", "Published Web asset mapping", webPath), ...historyEvents]
    });
  }

  if (input.action === "mapping.roblox") {
    const robloxAssetId = normalizedRobloxAssetId(input.payload?.assetId);
    saveAssetOverride(store, assetId, {
      platformMappings: { ...(override.platformMappings ?? {}), roblox: { assetId: robloxAssetId, status: "mapped", publishedAt: now } },
      historyEvents: [productionEvent(assetId, "roblox_mapped", "Mapped Roblox asset ID", robloxAssetId), ...historyEvents]
    });
  }

  await writeProductionStore(store);
  return { ok: true, action: input.action, assetId };
}
