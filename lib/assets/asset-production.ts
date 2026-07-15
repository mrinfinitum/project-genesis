import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { getGameData, getRows } from "@/lib/data";
import { buildAssetLibraryInventory, type AssetLibraryInventoryIndex } from "@/lib/assets/asset-library-inventory";
import { applyGameArtImport, getGameArtImportWorkspaceState, getMergedAssetLibraryRows, upsertAppliedGameArtAssets } from "@/lib/assets/game-art-import";
import { buildVisualPreviewReport, previewDerivativePresets, type VisualPreviewReport } from "@/lib/assets/visual-previews";
import { buildEncyclopediaAssetRequirements } from "@/lib/encyclopedia";
import { resolveUpgradeCategoryAssetStatus, upgradeCategoryAssetRecords, upgradeCategoryBackgroundDerivativePresetIds, upgradeCategoryBackgroundDimensions } from "@/lib/upgrades/category-presentation";
import type { AssetDefinition } from "@/types/runtime";

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
  isPrimaryPreview?: boolean;
  masterFormat?: "PSD" | "PSB" | "AI" | "SVG" | "TIFF" | "Raster" | "Audio" | "Video" | "Unknown";
  sourceRole?: "master" | "preview" | "legacy_derivative" | "reference";
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
  staleReason?: string;
  presetId?: string;
  cropMode?: string;
  focalPoint?: string;
  derivativeStatus?: "current" | "stale" | "generating" | "failed" | "published";
  safeArea?: string;
  padding?: string;
  alignment?: string;
  scale?: "1x" | "2x" | "3x" | "4x" | "4k";
  outputProfileId?: string;
  alphaRequired?: boolean;
  verification?: {
    dimensionsCorrect: boolean;
    alphaCorrect: boolean;
    fileSizeChecked: boolean;
    hashChecked: boolean;
    sourceMasterId: string | null;
    notes: string[];
  };
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
  profileGroup?: string;
  scale?: "1x" | "2x" | "3x" | "4x" | "4k";
  sourcePolicy?: "master_only" | "vector_or_master" | "audio" | "video";
  safeArea?: string;
  padding?: string;
  alignment?: string;
  outputRole?: "ui_icon" | "game_card" | "hero_art" | "loading_screen" | "button" | "thumbnail" | "engine" | "marketing" | "story";
  webOptimized?: boolean;
  robloxReady?: boolean;
};

export type AssetDerivativeProfile = {
  id: string;
  label: string;
  description: string;
  presetIds: string[];
  engineTargets: string[];
  masterFormats: string[];
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
  queueLabel?: "Pending" | "Rendering" | "Completed" | "Failed" | "Cancelled";
  requestedOutputs?: string[];
  sourcePolicy?: "master_only" | "vector_or_master" | "audio" | "video";
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
  masterSourceStatus: "missing" | "current" | "legacy_raster" | "multiple_current" | "source_missing";
  currentMasterSourceId: string | null;
  derivativeCompleteness: {
    required: number;
    current: number;
    stale: number;
    missing: number;
    published: number;
  };
  qualityIssues: AssetQualityIssue[];
};

export type AssetQualityIssueCode =
  | "using_1x_asset"
  | "needs_2x"
  | "needs_4k"
  | "upscaled"
  | "missing_master"
  | "missing_hero"
  | "missing_thumbnail"
  | "stale_derivative"
  | "manual_png_source";

export type AssetQualityIssue = {
  id: string;
  assetId: string;
  severity: "low" | "medium" | "high" | "critical";
  code: AssetQualityIssueCode;
  title: string;
  detail: string;
  recommendedAction: string;
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
  derivativeProfiles: AssetDerivativeProfile[];
  requirementProfiles: AssetRequirementProfile[];
  upgradeCategoryAssets: ReturnType<typeof resolveUpgradeCategoryAssetStatus>;
  assetQualityReport: {
    totalIssues: number;
    using1xAsset: number;
    needs2x: number;
    needs4k: number;
    upscaled: number;
    missingMaster: number;
    missingHero: number;
    missingThumbnail: number;
    staleDerivatives: number;
    manualPngSources: number;
    issues: AssetQualityIssue[];
  };
  visualPreviewReport: VisualPreviewReport;
  assetLibraryInventory: AssetLibraryInventoryIndex;
  robloxManifestReports: RobloxArtManifestImportReport[];
  webPublishReports: RobloxArtWebPublishReport[];
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
    masterSourcesCurrent: number;
    missingMasterSources: number;
    staleDerivatives: number;
    qualityIssues: number;
    visualRecords: number;
    previewReady: number;
    previewMissing: number;
    previewStale: number;
    approvedPreview: number;
    publishedPreview: number;
    lowResolutionPreviews: number;
  };
};

export type RobloxArtManifestAsset = {
  id?: string;
  name?: string;
  category?: string;
  usage?: string[];
  robloxAssetId?: string | number | null;
  robloxUri?: string;
  sourceFile?: string | null;
  artKey?: string | null;
  iconKey?: string | null;
  width?: number | null;
  height?: number | null;
  status?: string;
  instances?: Array<{ path?: string; property?: string }>;
};

export type RobloxArtManifest = {
  schemaVersion?: string;
  generatedAt?: string;
  sourceRoot?: string;
  summary?: Record<string, number>;
  assets?: RobloxArtManifestAsset[];
  unusedManifestEntries?: Array<Record<string, unknown>>;
  unusedLocalSourceFiles?: string[];
  brokenEmptyReferences?: Array<Record<string, unknown>>;
  audioReferencesExcluded?: Array<Record<string, unknown>>;
};

export type RobloxArtManifestImportReport = {
  id: string;
  schemaVersion: string;
  importedAt: string;
  generatedAt: string;
  sourceProject: string;
  sourceRoot: string;
  manifestPath: string;
  importedAssets: number;
  matchedAssets: number;
  newAssets: number;
  duplicateAssets: number;
  sourceFilesCreated: number;
  robloxOnlyAssets: number;
  placeholderAssets: Array<{ asset: string; usage: string; replacementRequired: string }>;
  unusedStudioAssets: Array<{ id: string; name: string; artKey: string; reason: string; action: "merge" | "archive" | "ignore" }>;
  unusedLocalFiles: Array<{ path: string; action: "merge" | "archive" | "ignore" }>;
  missingSourceFiles?: Array<{ assetId: string; sourceFile: string; reason: string }>;
  assetsNeedingWebPublication?: Array<{ assetId: string; artKey: string; sourceFile: string }>;
  conflicts: Array<{ assetId: string; artKey: string; existingRobloxAssetId: string; incomingRobloxAssetId: string; resolution: string }>;
  matched: Array<{ manifestId: string; assetId: string; matchedBy: string; robloxAssetId: string }>;
  created: Array<{ manifestId: string; assetId: string; artKey: string; robloxAssetId: string }>;
  updatedEraCompletion: Array<{ eraId: string; completionPercent: number; status: string }>;
  updatedProductionDashboard: {
    totalAssets: number;
    sourceFilesUploaded: number;
    missingAssets: number;
    engineMappingsIncomplete: number;
  };
  notes: string[];
};

export type RobloxArtWebPublishReport = {
  id: string;
  publishedAt: string;
  sourceRoot: string;
  webMappingsCreated: number;
  dashboardAssetsWebReady: number;
  dashboardAssetsTotal: number;
  missingWebDerivatives: Array<{ assetId: string; artKey: string; reason: string; robloxAssetId: string }>;
  placeholders: Array<{ asset: string; usage: string; replacementRequired: string }>;
  sourceMissingTasks: Array<{ taskId: string; assetId: string; title: string }>;
  placeholderTasks: Array<{ taskId: string; title: string; usage: string }>;
  unresolvedConflicts: RobloxArtManifestImportReport["conflicts"];
  dashboardReadiness: Array<{ assetId: string; artKey: string; category: string; priorityGroup: string; webReady: boolean; path: string; reason: string }>;
  copiedFiles: Array<{ assetId: string; from: string; to: string; publicPath: string; width: number | null; height: number | null; mimeType: string }>;
  skippedFiles: Array<{ assetId: string; sourceFile: string; reason: string }>;
  contentVersion: number;
  notes: string[];
};

export type AssetReviewEvent = {
  id: string;
  assetId: string;
  action: "submit_review" | "approve" | "request_changes" | "reject" | "publish" | "unpublish" | "reopen";
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
  notes?: string;
  approvedAt?: string;
  publishedAt?: string;
  reviewEvents?: AssetReviewEvent[];
  historyEvents?: AssetHistoryEvent[];
};

type MissingRequirementOverride = {
  id: string;
  objectType?: string;
  objectId?: string;
  objectName?: string;
  requiredDerivative?: string;
  currentStatus?: MissingAssetRequirement["currentStatus"];
  linkedCanonicalRecord?: string;
  artKey?: string;
  iconKey?: string;
  completionPercent?: number;
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
  robloxManifestReports?: RobloxArtManifestImportReport[];
  webPublishReports?: RobloxArtWebPublishReport[];
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

const masterSourceExtensions = new Set([".psd", ".psb", ".ai", ".svg", ".tiff", ".tif"]);
const rasterSourceExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function preset(
  id: string,
  name: string,
  profileGroup: string,
  derivativeType: string,
  width: number,
  height: number,
  aspectRatio: string,
  format: AssetDerivativePreset["format"],
  options: Partial<AssetDerivativePreset> = {}
): AssetDerivativePreset {
  return {
    id,
    name,
    category: options.category ?? profileGroup,
    derivativeType,
    width,
    height,
    aspectRatio,
    format,
    quality: options.quality ?? (format === "JPG" ? 88 : format === "WebP" ? 92 : undefined),
    cropMode: options.cropMode ?? (aspectRatio === "1:1" ? "cover" : "contain"),
    focalPoint: options.focalPoint ?? "center",
    transparentBackground: options.transparentBackground ?? ["PNG", "WebP", "SVG"].includes(format),
    engineTargets: options.engineTargets ?? ["web"],
    notes: options.notes,
    required: options.required ?? false,
    profileGroup,
    scale: options.scale,
    sourcePolicy: options.sourcePolicy ?? "master_only",
    safeArea: options.safeArea ?? "center 90%",
    padding: options.padding ?? "0",
    alignment: options.alignment ?? "center",
    outputRole: options.outputRole,
    webOptimized: options.webOptimized ?? format === "WebP",
    robloxReady: options.robloxReady ?? false
  };
}

const psdV3DerivativePresets: AssetDerivativePreset[] = [
  ...[64, 96, 128, 256, 512, 1024].map((size) =>
    preset(`ai_agent_${size}_png`, `AI Agent ${size} PNG`, "ai_agents", `ai_agent_${size}`, size, size, "1:1", "PNG", {
      category: "ai_agents",
      outputRole: "ui_icon",
      engineTargets: ["web", "roblox", "unity", "unreal", "godot"],
      robloxReady: size <= 1024,
      required: true,
      scale: size >= 1024 ? "4x" : size >= 512 ? "2x" : "1x",
      transparentBackground: true,
      notes: "Transparent AI agent portrait/expression derivative generated from layered PNG or PSD source."
    })
  ),
  ...[64, 96, 128, 256, 512, 1024, 2048].flatMap((size) => [
    preset(`ui_icon_${size}_png`, `UI Icon ${size} PNG`, "ui_icons", "icon", size, size, "1:1", "PNG", { outputRole: "ui_icon", engineTargets: ["roblox", "unity", "unreal", "godot"], robloxReady: true, required: size === 256, scale: size >= 1024 ? "4x" : size >= 512 ? "2x" : "1x" }),
    preset(`ui_icon_${size}_webp`, `UI Icon ${size} WebP`, "ui_icons", "icon", size, size, "1:1", "WebP", { outputRole: "ui_icon", engineTargets: ["web"], required: size === 512, scale: size >= 1024 ? "4x" : size >= 512 ? "2x" : "1x" })
  ]),
  ...[512, 768, 1024, 2048].flatMap((size) => [
    preset(`game_card_${size}_png`, `Game Card ${size} PNG`, "game_cards", "card", size, size, "1:1", "PNG", { outputRole: "game_card", engineTargets: ["roblox", "unity", "unreal", "godot"], robloxReady: true, required: size === 1024, scale: size >= 2048 ? "4x" : size >= 1024 ? "2x" : "1x" }),
    preset(`game_card_${size}_webp`, `Game Card ${size} WebP`, "game_cards", "card", size, size, "1:1", "WebP", { outputRole: "game_card", engineTargets: ["web"], required: size === 1024, scale: size >= 2048 ? "4x" : size >= 1024 ? "2x" : "1x" })
  ]),
  ...[
    [1280, 720],
    [1600, 900],
    [1920, 1080],
    [2560, 1440],
    [3840, 2160]
  ].flatMap(([width, height]) => [
    preset(`hero_${width}x${height}_webp`, `Hero Art ${width}x${height} WebP`, "hero_art", "hero", width, height, "16:9", "WebP", { outputRole: "hero_art", engineTargets: ["web"], required: width === 1920, scale: width >= 3840 ? "4k" : width >= 2560 ? "4x" : "2x" }),
    preset(`hero_${width}x${height}_png`, `Hero Art ${width}x${height} PNG`, "hero_art", "hero", width, height, "16:9", "PNG", { outputRole: "hero_art", engineTargets: ["roblox", "unity", "unreal", "godot"], robloxReady: width <= 2048, scale: width >= 3840 ? "4k" : width >= 2560 ? "4x" : "2x" }),
    preset(`hero_${width}x${height}_jpg`, `Hero Art ${width}x${height} JPEG`, "hero_art", "hero", width, height, "16:9", "JPG", { outputRole: "hero_art", engineTargets: ["marketing"], transparentBackground: false, scale: width >= 3840 ? "4k" : width >= 2560 ? "4x" : "2x" })
  ]),
  ...[
    [1920, 1080],
    [2560, 1440],
    [3840, 2160]
  ].flatMap(([width, height]) => [
    preset(`loading_${width}x${height}_webp`, `Loading Screen ${width}x${height} WebP`, "loading_screens", "loading", width, height, "16:9", "WebP", { outputRole: "loading_screen", required: width === 1920, scale: width >= 3840 ? "4k" : width >= 2560 ? "4x" : "2x" }),
    preset(`loading_${width}x${height}_png`, `Loading Screen ${width}x${height} PNG`, "loading_screens", "loading", width, height, "16:9", "PNG", { outputRole: "loading_screen", engineTargets: ["roblox", "unity", "unreal", "godot"], scale: width >= 3840 ? "4k" : width >= 2560 ? "4x" : "2x" })
  ]),
  ...["normal", "hover", "pressed", "disabled", "locked", "active", "selected"].flatMap((variant) =>
    [1, 2, 3].map((scale) => preset(`button_${variant}_${scale}x_png`, `Button ${variant} ${scale}x`, "buttons", `button_${variant}`, 256 * scale, 96 * scale, "8:3", "PNG", { outputRole: "button", scale: `${scale}x` as AssetDerivativePreset["scale"], engineTargets: ["web", "roblox", "unity", "unreal", "godot"], robloxReady: true, transparentBackground: true }))
  ),
  ...[128, 256, 512].flatMap((size) => [
    preset(`thumbnail_${size}_webp`, `Thumbnail ${size} WebP`, "thumbnails", "thumbnail", size, size, "1:1", "WebP", { outputRole: "thumbnail", required: size === 256 }),
    preset(`thumbnail_${size}_png`, `Thumbnail ${size} PNG`, "thumbnails", "thumbnail", size, size, "1:1", "PNG", { outputRole: "thumbnail", engineTargets: ["roblox", "unity", "unreal", "godot"], robloxReady: true })
  ]),
  ...[
    ["viewport_1366x768", 1366, 768],
    ["viewport_1600x900", 1600, 900],
    ["viewport_1920x1080", 1920, 1080],
    ["viewport_2560x1440", 2560, 1440],
    ["viewport_3440x1440", 3440, 1440],
    ["viewport_3840x2160", 3840, 2160]
  ].map(([id, width, height]) => preset(`${id}_webp`, `Game Viewport ${width}x${height}`, "viewport_profiles", "viewport", Number(width), Number(height), `${width}:${height}`, "WebP", { outputRole: "hero_art", engineTargets: ["web"], scale: Number(width) >= 3840 ? "4k" : Number(width) >= 2560 ? "4x" : "2x" })),
  preset("roblox_png_1024", "Roblox PNG 1024", "engine_outputs", "roblox", 1024, 1024, "1:1", "PNG", { outputRole: "engine", engineTargets: ["roblox"], robloxReady: true, required: false }),
  preset("web_responsive_webp_2x", "Web Responsive WebP 2x", "engine_outputs", "web", 2048, 2048, "source", "WebP", { outputRole: "engine", engineTargets: ["web"], scale: "2x" }),
  preset("unity_sprite_atlas_png", "Unity Sprite Atlas PNG", "engine_outputs", "unity", 2048, 2048, "1:1", "PNG", { outputRole: "engine", engineTargets: ["unity"], transparentBackground: true }),
  preset("unreal_ui_texture_png", "Unreal UI Texture PNG", "engine_outputs", "unreal", 2048, 2048, "1:1", "PNG", { outputRole: "engine", engineTargets: ["unreal"], transparentBackground: true }),
  preset("godot_import_ready_png", "Godot Import Ready PNG", "engine_outputs", "godot", 2048, 2048, "1:1", "PNG", { outputRole: "engine", engineTargets: ["godot"], transparentBackground: true }),
  preset("marketing_steam_capsule", "Steam Capsule", "marketing", "steam_capsule", 616, 353, "616:353", "JPG", { outputRole: "marketing", engineTargets: ["marketing"], transparentBackground: false }),
  preset("marketing_epic_capsule", "Epic Capsule", "marketing", "epic_capsule", 1920, 1080, "16:9", "JPG", { outputRole: "marketing", engineTargets: ["marketing"], transparentBackground: false }),
  preset("marketing_website_hero", "Website Hero", "marketing", "website_hero", 2560, 1440, "16:9", "WebP", { outputRole: "marketing", engineTargets: ["marketing", "web"] }),
  preset("marketing_social_square", "Social Square", "marketing", "social_square", 1080, 1080, "1:1", "JPG", { outputRole: "marketing", engineTargets: ["marketing"], transparentBackground: false }),
  preset("marketing_social_story", "Social Story", "marketing", "social_story", 1080, 1920, "9:16", "JPG", { outputRole: "marketing", engineTargets: ["marketing"], transparentBackground: false }),
  preset("marketing_youtube_thumbnail", "YouTube Thumbnail", "marketing", "youtube_thumbnail", 1280, 720, "16:9", "JPG", { outputRole: "marketing", engineTargets: ["marketing"], transparentBackground: false }),
  preset("marketing_discord_banner", "Discord Banner", "marketing", "discord_banner", 960, 540, "16:9", "WebP", { outputRole: "marketing", engineTargets: ["marketing"] }),
  preset("storybook_preview_webp", "Storybook Preview", "storybook", "storybook", 1440, 900, "16:10", "WebP", { outputRole: "story", engineTargets: ["storybook", "web"] })
];

const productionStorePath = process.env.PROJECT_GENESIS_ASSET_PRODUCTION_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_ASSET_PRODUCTION_STORE)
  : path.join(process.cwd(), "data", "asset-production.local.json");

export const derivativePresets: AssetDerivativePreset[] = [
  ...previewDerivativePresets.map((item) => preset(item.id, item.name, "visual_previews", "preview", item.width, item.height, item.height ? `${item.width}:${item.height}` : "source", item.format, { outputRole: "thumbnail", required: item.id === "preview_card_256_webp", notes: item.notes, webOptimized: item.format === "WebP" })),
  preset("upgrade_category_master_preview", "Upgrade Category Master Preview", "upgrade_category_backgrounds", "master_preview", upgradeCategoryBackgroundDimensions.masterWidth, upgradeCategoryBackgroundDimensions.masterHeight, `${upgradeCategoryBackgroundDimensions.masterWidth}:${upgradeCategoryBackgroundDimensions.masterHeight}`, "PNG", { required: true, category: "ui", engineTargets: ["web"], notes: "Studio-only master preview for category geometry review." }),
  preset("upgrade_category_background_4k_png", "Upgrade Category Background 4K", "upgrade_category_backgrounds", "background_4k", upgradeCategoryBackgroundDimensions.masterWidth, upgradeCategoryBackgroundDimensions.masterHeight, `${upgradeCategoryBackgroundDimensions.masterWidth}:${upgradeCategoryBackgroundDimensions.masterHeight}`, "PNG", { required: true, category: "ui", engineTargets: ["web", "roblox"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left" }),
  preset("upgrade_category_background_1440_webp", "Upgrade Category Background 1440", "upgrade_category_backgrounds", "background_1440", 2163, 1203, "2163:1203", "WebP", { required: true, category: "ui", engineTargets: ["web"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left", webOptimized: true }),
  preset("upgrade_category_background_1080_webp", "Upgrade Category Background 1080", "upgrade_category_backgrounds", "background_1080", upgradeCategoryBackgroundDimensions.derived1080Bounds.width, upgradeCategoryBackgroundDimensions.derived1080Bounds.height, `${upgradeCategoryBackgroundDimensions.derived1080Bounds.width}:${upgradeCategoryBackgroundDimensions.derived1080Bounds.height}`, "WebP", { required: true, category: "ui", engineTargets: ["web"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left", webOptimized: true }),
  preset("upgrade_category_background_720_webp", "Upgrade Category Background 720", "upgrade_category_backgrounds", "background_720", 1081, 601, "1081:601", "WebP", { required: false, category: "ui", engineTargets: ["web"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left", webOptimized: true }),
  preset("upgrade_category_background_web_runtime", "Upgrade Category Web Runtime", "upgrade_category_backgrounds", "web_runtime", 1622, 902, "1622:902", "WebP", { required: true, category: "ui", engineTargets: ["web"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left", webOptimized: true }),
  preset("upgrade_category_background_roblox_png", "Upgrade Category Roblox PNG", "upgrade_category_backgrounds", "roblox", 1622, 902, "1622:902", "PNG", { required: true, category: "ui", engineTargets: ["roblox"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left", robloxReady: true }),
  preset("upgrade_category_background_ios_phone_png", "Upgrade Category iOS Phone", "upgrade_category_backgrounds", "ios_phone", 778, 433, "778:433", "PNG", { required: true, category: "ui", engineTargets: ["ios"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left" }),
  preset("upgrade_category_background_ios_tablet_png", "Upgrade Category iOS Tablet", "upgrade_category_backgrounds", "ios_tablet", 1152, 641, "1152:641", "PNG", { required: true, category: "ui", engineTargets: ["ios"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left" }),
  preset("upgrade_category_background_android_phone_png", "Upgrade Category Android Phone", "upgrade_category_backgrounds", "android_phone", 762, 424, "762:424", "PNG", { required: true, category: "ui", engineTargets: ["android"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left" }),
  preset("upgrade_category_background_android_tablet_png", "Upgrade Category Android Tablet", "upgrade_category_backgrounds", "android_tablet", 1152, 641, "1152:641", "PNG", { required: true, category: "ui", engineTargets: ["android"], cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left" }),
  preset("upgrade_category_background_thumbnail", "Upgrade Category Thumbnail", "upgrade_category_backgrounds", "thumbnail", 512, 285, "512:285", "WebP", { required: true, category: "ui", engineTargets: ["web"], outputRole: "thumbnail", cropMode: "cover", safeArea: "workspace content safe region", alignment: "top-left", webOptimized: true }),
  { id: "planet_icon", name: "Planet Icon", category: "planets", derivativeType: "icon", width: 256, height: 256, aspectRatio: "1:1", format: "PNG", required: true },
  { id: "planet_card", name: "Planet Card", category: "planets", derivativeType: "card", width: 1024, height: 1024, aspectRatio: "1:1", format: "WebP", required: true },
  { id: "planet_hero", name: "Planet Hero", category: "planets", derivativeType: "hero", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: true },
  { id: "resource_icon", name: "Resource Icon", category: "resources", derivativeType: "icon", width: 256, height: 256, aspectRatio: "1:1", format: "PNG", required: true },
  { id: "resource_card", name: "Resource Card", category: "resources", derivativeType: "card", width: 768, height: 768, aspectRatio: "1:1", format: "WebP", required: false },
  { id: "building_card", name: "Building Card", category: "buildings", derivativeType: "card", width: 1024, height: 1024, aspectRatio: "1:1", format: "WebP", required: true },
  { id: "building_hero", name: "Building Hero", category: "buildings", derivativeType: "hero", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: false },
  { id: "research_icon", name: "Research Icon", category: "research", derivativeType: "icon", width: 256, height: 256, aspectRatio: "1:1", format: "PNG", required: true },
  { id: "research_card", name: "Research Card", category: "research", derivativeType: "card", width: 768, height: 768, aspectRatio: "1:1", format: "WebP", required: false },
  { id: "encyclopedia_icon", name: "Encyclopedia Icon", category: "encyclopedia", derivativeType: "encyclopedia_icon", width: 512, height: 512, aspectRatio: "1:1", format: "PNG", required: true, outputRole: "ui_icon", engineTargets: ["web", "roblox", "ios", "android"], notes: "Canonical entry icon for encyclopedia and future Galactopedia surfaces." },
  { id: "encyclopedia_card", name: "Encyclopedia Card", category: "encyclopedia", derivativeType: "encyclopedia_card", width: 1200, height: 675, aspectRatio: "16:9", format: "WebP", required: true, outputRole: "game_card", engineTargets: ["web", "roblox", "ios", "android"], notes: "Compact entry card artwork for encyclopedia browsers." },
  { id: "encyclopedia_hero", name: "Encyclopedia Hero", category: "encyclopedia", derivativeType: "encyclopedia_hero", width: 3840, height: 2160, aspectRatio: "16:9", format: "WebP", required: false, outputRole: "hero_art", engineTargets: ["web", "roblox", "ios", "android"], notes: "Large lore/detail hero artwork for approved encyclopedia entries." },
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
  { id: "era_cinematic", name: "Era Cinematic", category: "eras", derivativeType: "cinematic", width: 1920, height: 1080, aspectRatio: "16:9", format: "MP4", required: false },
  ...psdV3DerivativePresets
];

export const derivativeProfiles: AssetDerivativeProfile[] = [
  {
    id: "ai_agents",
    label: "AI Agents",
    description: "Transparent head, eye, expression, idle, and blink derivatives for AI Agent Library records at 64 through 1024 pixels.",
    presetIds: psdV3DerivativePresets.filter((item) => item.profileGroup === "ai_agents").map((item) => item.id),
    engineTargets: ["roblox", "web", "unity", "unreal", "godot"],
    masterFormats: ["PSD", "PNG"]
  },
  {
    id: "ui_icons",
    label: "UI Icons",
    description: "Icon derivatives from one master source at 64 through 2048 pixels in PNG and WebP.",
    presetIds: psdV3DerivativePresets.filter((item) => item.profileGroup === "ui_icons").map((item) => item.id),
    engineTargets: ["roblox", "web", "unity", "unreal", "godot"],
    masterFormats: ["PSD", "PSB", "AI", "SVG", "TIFF"]
  },
  {
    id: "game_cards",
    label: "Game Cards",
    description: "Square card artwork for gameplay surfaces, inventory, cards, and Roblox-ready image exports.",
    presetIds: psdV3DerivativePresets.filter((item) => item.profileGroup === "game_cards").map((item) => item.id),
    engineTargets: ["roblox", "web", "unity", "unreal", "godot"],
    masterFormats: ["PSD", "PSB", "AI", "SVG", "TIFF"]
  },
  {
    id: "hero_loading_viewports",
    label: "Hero, Loading, and Viewports",
    description: "16:9 and viewport-sized derivatives including 4K outputs regenerated from master files.",
    presetIds: psdV3DerivativePresets.filter((item) => ["hero_art", "loading_screens", "viewport_profiles"].includes(item.profileGroup ?? "")).map((item) => item.id),
    engineTargets: ["roblox", "web", "unity", "unreal", "godot", "marketing"],
    masterFormats: ["PSD", "PSB", "AI", "SVG", "TIFF"]
  },
  {
    id: "buttons_and_states",
    label: "Buttons and States",
    description: "Transparent 1x/2x/3x button derivatives for normal, hover, pressed, disabled, locked, active, and selected variants.",
    presetIds: psdV3DerivativePresets.filter((item) => item.profileGroup === "buttons").map((item) => item.id),
    engineTargets: ["roblox", "web", "unity", "unreal", "godot"],
    masterFormats: ["PSD", "PSB", "AI", "SVG", "TIFF"]
  },
  {
    id: "upgrade_category_backgrounds",
    label: "Upgrade Category Backgrounds",
    description: "Four canonical upgrade panel backgrounds for Workforce, Industry, Science, and Technology. All outputs share one registration point, safe region, alpha behavior, and crop mode.",
    presetIds: [...upgradeCategoryBackgroundDerivativePresetIds],
    engineTargets: ["roblox", "web", "ios", "android"],
    masterFormats: ["PSD", "PSB", "PNG", "TIFF", "SVG"]
  },
  {
    id: "marketing_storybook",
    label: "Marketing and Storybook",
    description: "Steam, Epic, website, social, YouTube, Discord, and Storybook preview derivatives from the same master.",
    presetIds: psdV3DerivativePresets.filter((item) => ["marketing", "storybook"].includes(item.profileGroup ?? "")).map((item) => item.id),
    engineTargets: ["marketing", "storybook", "web"],
    masterFormats: ["PSD", "PSB", "AI", "SVG", "TIFF"]
  }
];

export const requirementProfiles: AssetRequirementProfile[] = [
  { id: "planet_requirement_profile", objectType: "planet", label: "Planet", requirements: requirements(["planet_icon", "planet_card", "planet_hero"], "high") },
  { id: "resource_requirement_profile", objectType: "resource", label: "Resource", requirements: requirements(["resource_icon", "resource_card"], "medium") },
  { id: "building_requirement_profile", objectType: "building", label: "Building", requirements: requirements(["building_card", "building_hero"], "high") },
  { id: "research_requirement_profile", objectType: "research", label: "Research", requirements: requirements(["research_icon", "research_card"], "medium") },
  { id: "era_requirement_profile", objectType: "era", label: "Era", requirements: requirements(["era_icon", "era_banner", "era_background", "era_hero", "era_timeline_card", "era_loading_screen", "era_transition_art", "era_music", "era_ambient_audio", "era_cinematic"], "high") },
  { id: "upgrade_category_background_requirement_profile", objectType: "upgrade_category", label: "Upgrade Category Background", requirements: requirements([...upgradeCategoryBackgroundDerivativePresetIds], "critical") },
  { id: "galaxy_requirement_profile", objectType: "galaxy", label: "Galaxy", requirements: requirements(["planet_card", "planet_hero"], "medium") },
  { id: "sector_requirement_profile", objectType: "sector", label: "Sector", requirements: requirements(["planet_card", "planet_hero"], "medium") },
  { id: "star_system_requirement_profile", objectType: "star_system", label: "Star System", requirements: requirements(["planet_card", "planet_hero"], "medium") },
  { id: "ui_requirement_profile", objectType: "ui", label: "UI", requirements: requirements(["loading_screen"], "low") },
  { id: "encyclopedia_requirement_profile", objectType: "encyclopedia", label: "Encyclopedia", requirements: requirements(["encyclopedia_icon", "encyclopedia_card", "encyclopedia_hero"], "medium") },
  { id: "ai_agent_requirement_profile", objectType: "ai_agent", label: "AI Agent", requirements: requirements(["ai_agent_64_png", "ai_agent_96_png", "ai_agent_128_png", "ai_agent_256_png", "ai_agent_512_png", "ai_agent_1024_png"], "high") }
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
      productionTasks: Array.isArray(parsed.productionTasks) ? parsed.productionTasks : [],
      robloxManifestReports: Array.isArray(parsed.robloxManifestReports) ? parsed.robloxManifestReports : [],
      webPublishReports: Array.isArray(parsed.webPublishReports) ? parsed.webPublishReports : []
    };
  } catch {
    return { assets: {}, derivativePresets: [], missingRequirements: {}, processingJobs: [], productionTasks: [], robloxManifestReports: [], webPublishReports: [] };
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

function masterFormatFor(extension: string): SourceFileRecord["masterFormat"] {
  if (extension === ".psd") return "PSD";
  if (extension === ".psb") return "PSB";
  if (extension === ".ai") return "AI";
  if (extension === ".svg") return "SVG";
  if (extension === ".tiff" || extension === ".tif") return "TIFF";
  if (rasterSourceExtensions.has(extension)) return "Raster";
  if ([".mp3", ".wav", ".ogg"].includes(extension)) return "Audio";
  if (extension === ".mp4") return "Video";
  return "Unknown";
}

function sourceRoleFor(extension: string): SourceFileRecord["sourceRole"] {
  return masterSourceExtensions.has(extension) ? "master" : rasterSourceExtensions.has(extension) ? "legacy_derivative" : "reference";
}

function derivativeStatusFor(derivative: AssetDerivativeRecord): NonNullable<AssetDerivativeRecord["derivativeStatus"]> {
  if (derivative.staleSince || derivative.publishStatus === "stale") return "stale";
  if (derivative.status === "queued" || derivative.status === "processing") return "generating";
  if (derivative.status === "failed" || derivative.status === "error") return "failed";
  if (derivative.publishStatus === "published" || derivative.status === "published") return "published";
  return "current";
}

function presetForDerivative(derivative: AssetDerivativeRecord) {
  return derivativePresets.find((preset) => preset.id === derivative.presetId)
    ?? derivativePresets.find((preset) => preset.derivativeType === derivative.derivativeType && (!derivative.width || preset.width === derivative.width) && (!derivative.height || preset.height === derivative.height))
    ?? derivativePresets.find((preset) => preset.derivativeType === derivative.derivativeType);
}

function verificationForDerivative(derivative: AssetDerivativeRecord, source: SourceFileRecord | undefined, preset?: AssetDerivativePreset): NonNullable<AssetDerivativeRecord["verification"]> {
  const notes: string[] = [];
  const dimensionsCorrect = !preset || !preset.width || !preset.height || (derivative.width === preset.width && derivative.height === preset.height);
  if (!dimensionsCorrect) notes.push(`Expected ${preset?.width}x${preset?.height}, received ${derivative.width ?? "?"}x${derivative.height ?? "?"}.`);
  const alphaCorrect = !(preset?.transparentBackground || derivative.alphaRequired) || ["PNG", "WebP", "SVG"].includes(derivative.format);
  if (!alphaCorrect) notes.push("Derivative requires alpha but format may not preserve transparency.");
  if (source?.width && derivative.width && derivative.width > source.width && source.masterFormat === "Raster") notes.push("Derivative appears larger than raster source and may be upscaled.");
  return {
    dimensionsCorrect,
    alphaCorrect,
    fileSizeChecked: derivative.storagePath.length > 0 || derivative.publicUrl.length > 0,
    hashChecked: Boolean(derivative.checksum),
    sourceMasterId: source?.sourceRole === "master" ? source.id : null,
    notes
  };
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
  const masterFormat = masterFormatFor(extension);

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
    notes: text(row.notes),
    masterFormat,
    sourceRole: sourceRoleFor(extension)
  };
}

function derivativeFor(row: Row, sourceFileId: string | null): AssetDerivativeRecord | null {
  const publicUrl = text(row.preview_url ?? row.file_url);
  const storagePath = text(row.storage_path);
  if (!publicUrl && !storagePath) return null;

  const derivativeType = iconKeyFor(row) ? "icon" : "card";
  const preset = derivativePresets.find((item) => item.derivativeType === derivativeType && item.width === (numeric(String(row.dimensions ?? "").split("x")[0]) || item.width))
    ?? derivativePresets.find((item) => item.derivativeType === derivativeType);
  const record: AssetDerivativeRecord = {
    id: `derivative_${text(row.id)}_${hash(publicUrl || storagePath)}`,
    assetId: text(row.id),
    sourceFileId,
    derivativeType,
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
    archived: false,
    derivativeStatus: "current",
    safeArea: preset?.safeArea,
    padding: preset?.padding,
    alignment: preset?.alignment,
    scale: preset?.scale,
    outputProfileId: preset?.profileGroup,
    alphaRequired: preset?.transparentBackground
  };
  return {
    ...record,
    derivativeStatus: derivativeStatusFor(record),
    verification: verificationForDerivative(record, undefined, preset)
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
  const manifestUsage = Array.isArray(row.usage_references)
    ? row.usage_references
        .map((item) => item && typeof item === "object" ? item as Record<string, unknown> : null)
        .filter(Boolean)
        .map((item) => ({ type: text(item!.type, "roblox"), id: text(item!.id, text(item!.name)), name: text(item!.name, text(item!.id)) }))
    : [];
  return [...(usage.assetUsageByArtKey[art] ?? []), ...(icon ? usage.assetUsageByIconKey[icon] ?? [] : []), ...manifestUsage]
    .filter((item, index, rows) => rows.findIndex((candidate) => candidate.type === item.type && candidate.id === item.id && candidate.name === item.name) === index);
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

function normalizeSource(source: SourceFileRecord): SourceFileRecord {
  const extension = source.extension || extensionFor(source.filename);
  const masterFormat = source.masterFormat ?? masterFormatFor(extension);
  return {
    ...source,
    extension,
    masterFormat,
    sourceRole: source.sourceRole ?? sourceRoleFor(extension)
  };
}

function normalizeDerivative(derivative: AssetDerivativeRecord, sources: SourceFileRecord[]): AssetDerivativeRecord {
  const preset = presetForDerivative(derivative);
  const source = sources.find((item) => item.id === derivative.sourceFileId) ?? sources.find((item) => item.isCurrent);
  const record: AssetDerivativeRecord = {
    ...derivative,
    derivativeStatus: derivative.derivativeStatus ?? derivativeStatusFor(derivative),
    safeArea: derivative.safeArea ?? preset?.safeArea,
    padding: derivative.padding ?? preset?.padding,
    alignment: derivative.alignment ?? preset?.alignment,
    scale: derivative.scale ?? preset?.scale,
    outputProfileId: derivative.outputProfileId ?? preset?.profileGroup,
    alphaRequired: derivative.alphaRequired ?? preset?.transparentBackground
  };
  return {
    ...record,
    derivativeStatus: derivativeStatusFor(record),
    verification: derivative.verification ?? verificationForDerivative(record, source, preset)
  };
}

function currentMasterSource(sourceFiles: SourceFileRecord[]) {
  return sourceFiles.find((source) => source.isCurrent && source.sourceRole === "master" && !source.archived)
    ?? sourceFiles.find((source) => source.sourceRole === "master" && !source.archived)
    ?? null;
}

function masterSourceStatus(sourceFiles: SourceFileRecord[]): ProductionAsset["masterSourceStatus"] {
  const activeSources = sourceFiles.filter((source) => !source.archived);
  const currentSources = activeSources.filter((source) => source.isCurrent);
  if (!activeSources.length) return "missing";
  if (currentSources.length > 1) return "multiple_current";
  if (currentSources.some((source) => source.sourceRole === "master")) return "current";
  if (activeSources.some((source) => source.sourceRole === "master")) return "current";
  if (currentSources.some((source) => source.sourceRole === "legacy_derivative") || activeSources.some((source) => source.sourceRole === "legacy_derivative")) return "legacy_raster";
  return "source_missing";
}

function derivativeCompleteness(profile: AssetRequirementProfile, derivatives: AssetDerivativeRecord[]): ProductionAsset["derivativeCompleteness"] {
  const requiredTypes = new Set(profile.requirements.filter((requirement) => requirement.required).map((requirement) => requirement.derivativeType));
  const requiredDerivatives = derivatives.filter((derivative) => requiredTypes.has(derivative.derivativeType));
  const current = requiredDerivatives.filter((derivative) => derivativeStatusFor(derivative) === "current" || derivativeStatusFor(derivative) === "published").length;
  const stale = requiredDerivatives.filter((derivative) => derivativeStatusFor(derivative) === "stale").length;
  const published = requiredDerivatives.filter((derivative) => derivativeStatusFor(derivative) === "published").length;
  return {
    required: requiredTypes.size,
    current,
    stale,
    missing: Math.max(0, requiredTypes.size - new Set(requiredDerivatives.map((derivative) => derivative.derivativeType)).size),
    published
  };
}

function qualityIssue(input: {
  assetId: string;
  code: AssetQualityIssueCode;
  severity: AssetQualityIssue["severity"];
  title: string;
  detail: string;
  recommendedAction: string;
}): AssetQualityIssue {
  return {
    id: `quality_${input.assetId}_${input.code}`,
    ...input
  };
}

function qualityIssuesFor(assetId: string, profile: AssetRequirementProfile, sourceFiles: SourceFileRecord[], derivatives: AssetDerivativeRecord[]): AssetQualityIssue[] {
  const issues: AssetQualityIssue[] = [];
  const master = currentMasterSource(sourceFiles);
  const currentSource = sourceFiles.find((source) => source.isCurrent) ?? sourceFiles[0];
  const derivativeTypes = new Set(derivatives.map((derivative) => derivative.derivativeType));
  const largestDerivative = Math.max(0, ...derivatives.map((derivative) => derivative.width ?? 0));

  if (!master) {
    issues.push(qualityIssue({
      assetId,
      code: "missing_master",
      severity: "critical",
      title: "Missing PSD-centric master",
      detail: "No current PSD/PSB/AI/SVG/TIFF master source is linked to this asset.",
      recommendedAction: "Upload one canonical master source and regenerate derivatives from it."
    }));
  }

  if (currentSource?.sourceRole === "legacy_derivative") {
    issues.push(qualityIssue({
      assetId,
      code: "manual_png_source",
      severity: "high",
      title: "Manual raster source in use",
      detail: `${currentSource.filename} is a raster file and should become a generated derivative, not the master.`,
      recommendedAction: "Replace the current source with a PSD/PSB/AI/SVG/TIFF master."
    }));
  }

  if (derivatives.some((derivative) => derivativeStatusFor(derivative) === "stale")) {
    issues.push(qualityIssue({
      assetId,
      code: "stale_derivative",
      severity: "high",
      title: "Stale derivative",
      detail: "One or more derivatives were generated before the current master version.",
      recommendedAction: "Regenerate stale outputs from the current master source."
    }));
  }

  if (profile.requirements.some((requirement) => ["hero", "background", "banner", "loading"].includes(requirement.derivativeType)) && !["hero", "background", "banner", "loading"].some((type) => derivativeTypes.has(type))) {
    issues.push(qualityIssue({
      assetId,
      code: "missing_hero",
      severity: "medium",
      title: "Missing hero-scale output",
      detail: "This asset profile expects hero, background, banner, or loading artwork.",
      recommendedAction: "Generate the required hero/loading derivative profile from the master."
    }));
  }

  if (!["thumbnail", "icon", "card"].some((type) => derivativeTypes.has(type))) {
    issues.push(qualityIssue({
      assetId,
      code: "missing_thumbnail",
      severity: "medium",
      title: "Missing thumbnail/card output",
      detail: "No compact preview derivative exists for inventory, cards, dashboards, or asset review.",
      recommendedAction: "Generate thumbnail, icon, or card derivatives from the master."
    }));
  }

  if (derivatives.some((derivative) => (derivative.width ?? 0) <= 128) && largestDerivative <= 128) {
    issues.push(qualityIssue({
      assetId,
      code: "using_1x_asset",
      severity: "medium",
      title: "Only 1x output available",
      detail: "This asset has only low-resolution derivatives.",
      recommendedAction: "Generate 2x and larger outputs from the master."
    }));
  }

  if (derivatives.length && largestDerivative < 512) {
    issues.push(qualityIssue({
      assetId,
      code: "needs_2x",
      severity: "medium",
      title: "Needs 2x output",
      detail: "No derivative of at least 512px wide is available.",
      recommendedAction: "Generate a 2x Web/engine derivative from the master."
    }));
  }

  if (profile.requirements.some((requirement) => ["hero", "background", "loading"].includes(requirement.derivativeType)) && largestDerivative > 0 && largestDerivative < 3840) {
    issues.push(qualityIssue({
      assetId,
      code: "needs_4k",
      severity: "low",
      title: "Needs 4K output",
      detail: "Hero/loading artwork has no 4K derivative.",
      recommendedAction: "Generate 3840x2160 output directly from the master."
    }));
  }

  if (currentSource?.masterFormat === "Raster" && derivatives.some((derivative) => currentSource.width && derivative.width && derivative.width > currentSource.width)) {
    issues.push(qualityIssue({
      assetId,
      code: "upscaled",
      severity: "critical",
      title: "Upscaled derivative risk",
      detail: "A derivative is larger than the raster source it came from.",
      recommendedAction: "Regenerate from the original PSD/vector master; do not upscale generated PNGs."
    }));
  }

  return issues;
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
    .map(normalizeSource)
    .filter((source) => !source.archived)
    .sort((left, right) => right.version - left.version);
  const derivative = derivativeFor(row, sourceFile?.id ?? null);
  const derivatives = [...(derivative ? [derivative] : []), ...(override.derivatives ?? [])]
    .map((item) => normalizeDerivative(item, sourceFiles))
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
  const masterStatus = masterSourceStatus(sourceFiles);
  const masterSource = currentMasterSource(sourceFiles);
  const completeness = derivativeCompleteness(profile, derivatives);
  const qualityIssues = qualityIssuesFor(assetId, profile, sourceFiles, derivatives);

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
    notes: text(override.notes ?? row.notes),
    completionPercent: readiness.percent,
    missingRequirements: readiness.missing,
    createdAt: text(row.created_at ?? row.imported_at),
    updatedAt: text(row.updated_at ?? row.imported_at),
    approvedAt: override.approvedAt ?? text(row.approved_at),
    publishedAt: override.publishedAt ?? text(row.published_at),
    publishBlockers,
    optionalMissingRequirements: optionalMissing,
    historyEvents: override.historyEvents ?? [],
    masterSourceStatus: masterStatus,
    currentMasterSourceId: masterSource?.id ?? null,
    derivativeCompleteness: completeness,
    qualityIssues
  };
}

function canonicalRequirementsByObject() {
  return {
    planets: requirementProfiles.find((profile) => profile.objectType === "planet")!,
    resources: requirementProfiles.find((profile) => profile.objectType === "resource")!,
    buildings: requirementProfiles.find((profile) => profile.objectType === "building")!,
    research: requirementProfiles.find((profile) => profile.objectType === "research")!,
    upgrades: requirementProfiles.find((profile) => profile.objectType === "research")!,
    upgrade_category: requirementProfiles.find((profile) => profile.objectType === "upgrade_category")!,
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
          retryCount: 0,
          queueLabel: "Pending" as const,
          requestedOutputs: preset ? [`${preset.name} ${preset.width}x${preset.height} ${preset.format}`] : [derivativeType],
          sourcePolicy: preset?.sourcePolicy ?? "master_only" as const
        };
      })
    );
}

function normalizeProcessingJob(job: ProcessingJobRecord): ProcessingJobRecord {
  const preset = derivativePresets.find((item) => item.id === job.presetId);
  return {
    ...job,
    queueLabel: job.queueLabel ?? (job.status === "processing" ? "Rendering" : job.status === "completed" ? "Completed" : job.status === "failed" ? "Failed" : job.status === "cancelled" ? "Cancelled" : "Pending"),
    requestedOutputs: job.requestedOutputs ?? (preset ? [`${preset.name} ${preset.width}x${preset.height} ${preset.format}`] : [job.presetId]),
    sourcePolicy: job.sourcePolicy ?? preset?.sourcePolicy ?? "master_only"
  };
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

export async function getAssetProductionState(options: { includeEncyclopediaRequirements?: boolean } = {}): Promise<AssetProductionState> {
  const includeEncyclopediaRequirements = options.includeEncyclopediaRequirements ?? true;
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
    upgrade_category: upgradeCategoryAssetRecords.map((record) => ({ id: record.categoryId, name: record.displayName, key: record.semanticAssetKey })),
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
  if (includeEncyclopediaRequirements) {
    const encyclopediaRequirements = buildEncyclopediaAssetRequirements(data, assets).map((requirement) => ({
      id: `missing_encyclopedia_${requirement.entryId}_${requirement.role}`,
      objectType: `encyclopedia_${requirement.entityType}`,
      objectId: requirement.entryId,
      objectName: requirement.displayName,
      requiredDerivative: `encyclopedia_${requirement.role}`,
      currentStatus: "missing" as const,
      priority: requirement.priority,
      linkedCanonicalRecord: requirement.canonicalRecordId,
      artKey: requirement.semanticAssetKey,
      iconKey: requirement.role === "icon" ? requirement.semanticAssetKey : "",
      assignedArtist: "",
      dueDate: "",
      completionPercent: 0
    })).filter((item) => !(store.missingRequirements[item.id]?.notRequired));
    missingRequirements.push(...encyclopediaRequirements.map((item) => ({ ...item, ...(store.missingRequirements[item.id] ?? {}) })) as MissingAssetRequirement[]);
  }
  const existingMissingRequirementIds = new Set(missingRequirements.map((item) => item.id));
  missingRequirements.push(...Object.values(store.missingRequirements).filter((item) => item.id && item.objectType && item.objectName && !existingMissingRequirementIds.has(item.id)) as MissingAssetRequirement[]);

  const processingJobs = [...processingJobsFor(assets), ...store.processingJobs]
    .filter((job, index, rows) => rows.findIndex((item) => item.id === job.id) === index)
    .map(normalizeProcessingJob);
  const sourceFiles = assets.flatMap((asset) => asset.sourceFiles);
  const generatedAssets = assets.filter((asset) => asset.derivatives.length);
  const publishedAssets = assets.filter((asset) => asset.productionStatus === "published" || asset.status.toLowerCase() === "published");
  const qualityIssues = assets.flatMap((asset) => asset.qualityIssues);
  const staleDerivativeCount = assets.reduce((sum, asset) => sum + asset.derivativeCompleteness.stale, 0);
  const visualPreviewReport = buildVisualPreviewReport({ assets, missingRequirements });
  const upgradeCategoryAssets = resolveUpgradeCategoryAssetStatus(assets);
  const sortedMissingRequirements = missingRequirements.sort((left, right) => left.objectType.localeCompare(right.objectType) || left.objectName.localeCompare(right.objectName));
  const assetLibraryInventory = await buildAssetLibraryInventory({ assets, missingRequirements: sortedMissingRequirements, upgradeCategoryAssets, visualPreviewReport });

  return {
    assets,
    sourceFiles,
    generatedAssets,
    publishedAssets,
    missingRequirements: sortedMissingRequirements,
    processingJobs,
    productionTasks: store.productionTasks,
    importHistory: importState.history,
    derivativePresets: presets,
    derivativeProfiles,
    requirementProfiles,
    upgradeCategoryAssets,
    assetQualityReport: {
      totalIssues: qualityIssues.length,
      using1xAsset: qualityIssues.filter((issue) => issue.code === "using_1x_asset").length,
      needs2x: qualityIssues.filter((issue) => issue.code === "needs_2x").length,
      needs4k: qualityIssues.filter((issue) => issue.code === "needs_4k").length,
      upscaled: qualityIssues.filter((issue) => issue.code === "upscaled").length,
      missingMaster: qualityIssues.filter((issue) => issue.code === "missing_master").length,
      missingHero: qualityIssues.filter((issue) => issue.code === "missing_hero").length,
      missingThumbnail: qualityIssues.filter((issue) => issue.code === "missing_thumbnail").length,
      staleDerivatives: qualityIssues.filter((issue) => issue.code === "stale_derivative").length,
      manualPngSources: qualityIssues.filter((issue) => issue.code === "manual_png_source").length,
      issues: qualityIssues.sort((left, right) => {
        const severityRank = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityRank[left.severity] - severityRank[right.severity] || left.title.localeCompare(right.title);
      })
    },
    visualPreviewReport,
    assetLibraryInventory,
    robloxManifestReports: store.robloxManifestReports ?? [],
    webPublishReports: store.webPublishReports ?? [],
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
      engineMappingsIncomplete: assets.filter((asset) => !Object.keys(asset.platformMappings).length).length,
      masterSourcesCurrent: assets.filter((asset) => asset.masterSourceStatus === "current").length,
      missingMasterSources: assets.filter((asset) => asset.masterSourceStatus !== "current").length,
      staleDerivatives: staleDerivativeCount,
      qualityIssues: qualityIssues.length,
      visualRecords: visualPreviewReport.totalVisualRecords,
      previewReady: visualPreviewReport.previewReady,
      previewMissing: visualPreviewReport.previewMissing,
      previewStale: visualPreviewReport.previewStale,
      approvedPreview: visualPreviewReport.approvedPreview,
      publishedPreview: visualPreviewReport.publishedPreview,
      lowResolutionPreviews: visualPreviewReport.lowResolution
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

function safeRobloxAssetId(value: unknown) {
  try {
    return normalizedRobloxAssetId(value);
  } catch {
    return "";
  }
}

function platformRobloxId(row: Row) {
  const mappings = (row.platform_mappings ?? row.platformMappings ?? {}) as Record<string, Record<string, unknown> | undefined>;
  return safeRobloxAssetId(row.roblox_asset_id ?? row.robloxAssetId ?? mappings.roblox?.assetId);
}

function manifestArtKey(asset: RobloxArtManifestAsset) {
  return text(asset.artKey) || slug(text(asset.name ?? asset.id));
}

function manifestIconKey(asset: RobloxArtManifestAsset) {
  return text(asset.iconKey);
}

function manifestAssetId(asset: RobloxArtManifestAsset) {
  return text(asset.id) || assetIdForArtKey(manifestArtKey(asset));
}

function normalizedSourceFilename(value: unknown) {
  return slug(text(value).split(/[\\/]/).pop() ?? "");
}

function manifestUsageReferences(asset: RobloxArtManifestAsset) {
  const usage = (asset.usage ?? []).map((item) => ({ type: usageType(item), id: item, name: item }));
  const instances = (asset.instances ?? []).map((item) => ({
    type: "roblox_instance",
    id: text(item.path),
    name: [text(item.path), text(item.property)].filter(Boolean).join(" / ")
  }));
  return [...usage, ...instances].filter((item) => item.id || item.name);
}

function usageType(value: string) {
  const normalized = slug(value);
  if (normalized.includes("era")) return "Era";
  if (normalized.includes("resource")) return "Resource";
  if (normalized.includes("building")) return "Building";
  if (normalized.includes("research") || normalized.includes("upgrade") || normalized.includes("technology")) return "Research";
  if (normalized.includes("mission")) return "Mission";
  if (normalized.includes("planet")) return "Planet";
  if (normalized.includes("event")) return "Event";
  if (normalized.includes("hud") || normalized.includes("ui") || normalized.includes("dashboard") || normalized.includes("topbar")) return "UI";
  return "Roblox";
}

function derivativeTypeForManifest(asset: RobloxArtManifestAsset) {
  const category = slug(text(asset.category));
  const key = slug(`${asset.artKey ?? ""} ${asset.name ?? ""}`);
  if (category.includes("icon") || key.includes("icon") || (Number(asset.width) <= 256 && Number(asset.height) <= 256)) return "icon";
  if (category.includes("button") || key.includes("button")) return "button";
  if (category.includes("banner")) return "banner";
  if (category.includes("background") || key.includes("background")) return "background";
  if (category.includes("panel") || key.includes("panel")) return "card";
  return "card";
}

function sourceRecordForManifest(assetId: string, asset: RobloxArtManifestAsset, now: string, existing: SourceFileRecord[]) {
  const sourceFile = text(asset.sourceFile);
  if (!sourceFile) return null;
  const filename = sourceFile.split(/[\\/]/).pop() || sourceFile;
  const extension = extensionFor(filename);
  const existingMatch = existing.find((source) => source.storagePath === sourceFile || source.filename === filename);
  if (existingMatch) return { record: { ...existingMatch, isCurrent: true }, created: false };
  const record: SourceFileRecord = {
    id: `source_${assetId}_${hash(sourceFile)}`,
    assetId,
    filename,
    extension,
    mimeType: mimeFor(extension),
    storagePath: sourceFile,
    fileSizeBytes: 0,
    checksum: hash(sourceFile),
    version: existing.length ? Math.max(...existing.map((source) => source.version)) + 1 : 1,
    versionLabel: existing.length ? `v${Math.max(...existing.map((source) => source.version)) + 1}` : "v1",
    uploadedAt: now,
    uploadedBy: "roblox-manifest",
    isCurrent: true,
    archived: false,
    previewUrl: "",
    previewStatus: "missing",
    width: Number(asset.width) || null,
    height: Number(asset.height) || null,
    notes: "Imported from Roblox art manifest. Source file exists in the Roblox project and needs Studio-managed Web derivative publishing.",
    masterFormat: masterFormatFor(extension),
    sourceRole: sourceRoleFor(extension)
  };
  return { record, created: true };
}

function derivativeForManifest(assetId: string, asset: RobloxArtManifestAsset, sourceFileId: string | null, robloxAssetId: string, now: string): AssetDerivativeRecord {
  const width = Number(asset.width) || null;
  const height = Number(asset.height) || null;
  const derivativeType = derivativeTypeForManifest(asset);
  const preset = derivativePresets.find((item) => item.derivativeType === derivativeType && (!width || item.width === width) && (!height || item.height === height))
    ?? derivativePresets.find((item) => item.derivativeType === derivativeType);
  const record: AssetDerivativeRecord = {
    id: `derivative_${assetId}_roblox_${hash(robloxAssetId)}`,
    assetId,
    sourceFileId,
    derivativeType,
    format: "PNG",
    width,
    height,
    aspectRatio: width && height ? `${width}:${height}` : null,
    quality: null,
    storagePath: robloxAssetId,
    publicUrl: robloxAssetId,
    checksum: hash(robloxAssetId),
    generatedAt: now,
    generationMethod: "roblox_manifest_import",
    status: "imported",
    approvalStatus: "pending",
    publishStatus: "draft",
    platformMappings: { roblox: { assetId: robloxAssetId } },
    archived: false,
    derivativeStatus: "current",
    safeArea: preset?.safeArea,
    padding: preset?.padding,
    alignment: preset?.alignment,
    scale: preset?.scale,
    outputProfileId: preset?.profileGroup,
    alphaRequired: true
  };
  return { ...record, verification: verificationForDerivative(record, undefined, preset) };
}

const webPublishableExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const blockedSourceExtensions = new Set([".psd", ".psb", ".ai"]);

function safePublicFilename(assetId: string, source: SourceFileRecord) {
  const extension = source.extension || extensionFor(source.filename) || ".png";
  return `${slug(assetId)}${extension.toLowerCase()}`;
}

function webDerivativeType(assetId: string, source: SourceFileRecord) {
  const key = slug(`${assetId} ${source.filename}`);
  if (key.includes("icon") || (Number(source.width) <= 256 && Number(source.height) <= 256)) return "icon";
  if (key.includes("button")) return "button";
  if (key.includes("background")) return "background";
  return "web";
}

function dashboardPriorityGroup(assetId: string, category: string, usageReferences: Array<{ type: string; id: string; name: string }>) {
  const haystack = slug([assetId, category, ...usageReferences.flatMap((usage) => [usage.type, usage.id, usage.name])].join(" "));
  if (/civilization|crest|identity/.test(haystack)) return "civilization crest";
  if (/dashboard|hero|background/.test(haystack)) return "dashboard hero";
  if (/topbar|resource|credits|population|research|energy/.test(haystack)) return "top HUD resource icons";
  if (/menu|navigation|sidebar|overview|buildings|events|galaxy|spaceport|upgrades/.test(haystack)) return "navigation icons";
  if (/click|ring|interface|hand/.test(haystack)) return "click interface";
  if (/auto|automation|robot/.test(haystack)) return "automation icon";
  if (/critical|star/.test(haystack)) return "critical star";
  if (/era|progression|hex/.test(haystack)) return "era nodes/icons";
  if (/upgrade|technology|science/.test(haystack)) return "upgrade icons";
  if (/event/.test(haystack)) return "event art";
  if (/alignment/.test(haystack)) return "alignment icons";
  if (/boost/.test(haystack)) return "boost icons";
  if (/panel|frame|decorative|hud/.test(haystack)) return "panel decorative art";
  return "";
}

function webPublishedDerivative(input: {
  assetId: string;
  source: SourceFileRecord;
  publicPath: string;
  diskPath: string;
  now: string;
}): AssetDerivativeRecord {
  const derivativeType = webDerivativeType(input.assetId, input.source);
  const preset = derivativePresets.find((item) => item.derivativeType === derivativeType && (!input.source.width || item.width === input.source.width) && (!input.source.height || item.height === input.source.height))
    ?? derivativePresets.find((item) => item.derivativeType === derivativeType);
  const record: AssetDerivativeRecord = {
    id: `derivative_${input.assetId}_web_${hash(input.publicPath)}`,
    assetId: input.assetId,
    sourceFileId: input.source.id,
    derivativeType,
    format: input.source.extension.replace(".", "").toUpperCase() || "PNG",
    width: input.source.width ?? null,
    height: input.source.height ?? null,
    aspectRatio: input.source.width && input.source.height ? `${input.source.width}:${input.source.height}` : null,
    quality: null,
    storagePath: input.diskPath,
    publicUrl: input.publicPath,
    checksum: hash(input.publicPath),
    generatedAt: input.now,
    generationMethod: "web_derivative_publish",
    status: "approved",
    approvalStatus: "approved",
    publishStatus: "published",
    platformMappings: { web: { path: input.publicPath } },
    archived: false,
    derivativeStatus: "published",
    safeArea: preset?.safeArea,
    padding: preset?.padding,
    alignment: preset?.alignment,
    scale: preset?.scale,
    outputProfileId: preset?.profileGroup,
    alphaRequired: preset?.transparentBackground
  };
  return { ...record, verification: verificationForDerivative(record, input.source, preset) };
}

function taskExists(tasks: ProductionTaskRecord[], id: string) {
  return tasks.some((task) => task.id === id || task.requirementId === id);
}

function replacementTask(input: { id: string; title: string; linkedObject: string; notes: string; priority?: MissingAssetRequirement["priority"] }): ProductionTaskRecord {
  const now = new Date().toISOString();
  return {
    id: input.id,
    requirementId: input.id,
    era: "Dashboard",
    linkedObject: input.linkedObject,
    requirementType: "web-art",
    dimensions: "TBD",
    format: "PNG/WebP",
    priority: input.priority ?? "high",
    assignedArtist: "",
    dueDate: "",
    assetLink: "/asset-library?section=missing",
    sourceUploadLink: "/asset-library?upload=asset",
    status: "open",
    createdAt: now,
    updatedAt: now,
    notes: input.notes
  };
}

export async function publishImportedRobloxArtForWeb(options: { sourceRoot?: string; publicRoot?: string } = {}) {
  const now = new Date().toISOString();
  const sourceRoot = path.resolve(options.sourceRoot ?? path.join(process.cwd(), "Roblox"));
  const publicRoot = path.resolve(options.publicRoot ?? path.join(process.cwd(), "public", "assets", "roblox-art"));
  const store = await readProductionStore();
  const latestManifestReport = store.robloxManifestReports?.[0];
  const copiedFiles: RobloxArtWebPublishReport["copiedFiles"] = [];
  const skippedFiles: RobloxArtWebPublishReport["skippedFiles"] = [];
  const missingWebDerivatives: RobloxArtWebPublishReport["missingWebDerivatives"] = [];
  const dashboardReadiness: RobloxArtWebPublishReport["dashboardReadiness"] = [];
  const sourceMissingTasks: RobloxArtWebPublishReport["sourceMissingTasks"] = [];
  const placeholderTasks: RobloxArtWebPublishReport["placeholderTasks"] = [];
  const assetRows = Object.entries(store.assets).sort(([left], [right]) => left.localeCompare(right));

  for (const [assetId, override] of assetRows) {
    const robloxAssetId = safeRobloxAssetId((override.platformMappings?.roblox as Record<string, unknown> | undefined)?.assetId);
    if (!robloxAssetId) continue;

    const currentSource = (override.sourceFiles ?? []).find((source) => source.isCurrent && !source.archived) ?? (override.sourceFiles ?? []).find((source) => !source.archived);
    if (!currentSource) {
      missingWebDerivatives.push({ assetId, artKey: assetId.replace(/^asset_/, ""), reason: "Source Missing", robloxAssetId });
      const taskId = `task_source_missing_${assetId}`;
      if (!taskExists(store.productionTasks, taskId)) {
        const title = `Create source art for ${assetId}`;
        const task = replacementTask({
          id: taskId,
          title,
          linkedObject: assetId,
          notes: "Roblox-ID-only asset requires source art before Web publishing.",
          priority: "critical"
        });
        store.productionTasks.push(task);
        sourceMissingTasks.push({ taskId, assetId, title });
      }
      continue;
    }

    const extension = currentSource.extension || extensionFor(currentSource.filename);
    if (blockedSourceExtensions.has(extension) || !webPublishableExtensions.has(extension)) {
      skippedFiles.push({ assetId, sourceFile: currentSource.storagePath, reason: `Unsupported Web publish format ${extension || "(none)"}` });
      missingWebDerivatives.push({ assetId, artKey: assetId.replace(/^asset_/, ""), reason: "Web Derivative Missing", robloxAssetId });
      continue;
    }

    const sourcePath = path.resolve(sourceRoot, currentSource.storagePath);
    let sourceStat;
    try {
      sourceStat = await stat(sourcePath);
    } catch {
      skippedFiles.push({ assetId, sourceFile: currentSource.storagePath, reason: "Source file not found under configured Roblox source root." });
      missingWebDerivatives.push({ assetId, artKey: assetId.replace(/^asset_/, ""), reason: "Source file missing", robloxAssetId });
      continue;
    }
    if (!sourceStat.isFile()) {
      skippedFiles.push({ assetId, sourceFile: currentSource.storagePath, reason: "Source path is not a file." });
      missingWebDerivatives.push({ assetId, artKey: assetId.replace(/^asset_/, ""), reason: "Source path is not a file", robloxAssetId });
      continue;
    }

    const filename = safePublicFilename(assetId, currentSource);
    const outputDir = path.join(publicRoot, assetId);
    const outputPath = path.join(outputDir, filename);
    const publicPath = `/assets/roblox-art/${assetId}/${filename}`;
    await mkdir(outputDir, { recursive: true });
    await copyFile(sourcePath, outputPath);

    const webDerivative = webPublishedDerivative({ assetId, source: currentSource, publicPath, diskPath: path.relative(process.cwd(), outputPath), now });
    const historyEvents = override.historyEvents ?? [];
    const hasPublishedHistory = historyEvents.some((event) => event.eventType === "web_derivative_published" && event.notes === publicPath);
    saveAssetOverride(store, assetId, {
      derivatives: (override.derivatives ?? []).filter((derivative) => derivative.id !== webDerivative.id).concat(webDerivative),
      platformMappings: {
        ...(override.platformMappings ?? {}),
        web: { path: publicPath, status: "published", publishedAt: now }
      },
      status: "web_published",
      productionStatus: "published",
      approvalStatus: "approved",
      publishedAt: now,
      historyEvents: hasPublishedHistory
        ? historyEvents
        : [
            productionEvent(assetId, "web_derivative_published", "Published Web derivative from Roblox art source", publicPath),
            ...historyEvents
          ]
    });
    copiedFiles.push({
      assetId,
      from: currentSource.storagePath,
      to: path.relative(process.cwd(), outputPath),
      publicPath,
      width: currentSource.width ?? null,
      height: currentSource.height ?? null,
      mimeType: currentSource.mimeType
    });
  }

  for (const placeholder of latestManifestReport?.placeholderAssets ?? []) {
    const taskId = `task_placeholder_${hash(`${placeholder.usage}:${placeholder.replacementRequired}`)}`;
    if (!taskExists(store.productionTasks, taskId)) {
      const title = `Replace placeholder art: ${placeholder.usage || placeholder.asset}`;
      const task = replacementTask({
        id: taskId,
        title,
        linkedObject: placeholder.usage || placeholder.asset,
        notes: placeholder.replacementRequired,
        priority: "high"
      });
      store.productionTasks.push(task);
      placeholderTasks.push({ taskId, title, usage: placeholder.usage });
    }
  }

  await writeProductionStore(store);
  const state = await getAssetProductionState();
  for (const asset of state.assets.filter((asset) => asset.platformMappings.roblox)) {
    const priorityGroup = dashboardPriorityGroup(asset.id, asset.category, asset.usageReferences);
    if (!priorityGroup) continue;
    const webPath = (asset.platformMappings.web as Record<string, unknown> | undefined)?.path;
    const webReady = typeof webPath === "string" && webPath.startsWith("/assets/roblox-art/");
    dashboardReadiness.push({
      assetId: asset.id,
      artKey: asset.artKey,
      category: asset.category,
      priorityGroup,
      webReady,
      path: webReady ? webPath : "",
      reason: webReady ? "Published Web derivative" : asset.sourceFiles.length ? "Web derivative missing" : "Source missing"
    });
  }

  const report: RobloxArtWebPublishReport = {
    id: `roblox-web-publish-${Date.now()}`,
    publishedAt: now,
    sourceRoot: privatePath(sourceRoot) ? "[external-roblox-source-root]" : sourceRoot,
    webMappingsCreated: copiedFiles.length,
    dashboardAssetsWebReady: dashboardReadiness.filter((item) => item.webReady).length,
    dashboardAssetsTotal: dashboardReadiness.length,
    missingWebDerivatives,
    placeholders: latestManifestReport?.placeholderAssets ?? [],
    sourceMissingTasks,
    placeholderTasks,
    unresolvedConflicts: latestManifestReport?.conflicts ?? [],
    dashboardReadiness,
    copiedFiles,
    skippedFiles,
    contentVersion: 4,
    notes: [
      "Published PNG/JPG/WebP/SVG Roblox art sources as public Studio Web derivatives.",
      "Roblox IDs were preserved and not modified.",
      "PSD/PSB/AI/private source masters are not published."
    ]
  };

  const nextStore = await readProductionStore();
  nextStore.webPublishReports = [report, ...(nextStore.webPublishReports ?? [])].slice(0, 20);
  await writeProductionStore(nextStore);
  return report;
}

function assetDefinitionForManifest(assetId: string, asset: RobloxArtManifestAsset, robloxAssetId: string, sourceProject: string, now: string): AssetDefinition {
  const artKey = manifestArtKey(asset);
  const iconKey = manifestIconKey(asset);
  const width = Number(asset.width) || null;
  const height = Number(asset.height) || null;
  const sourceFile = text(asset.sourceFile);
  return {
    id: assetId,
    name: text(asset.name, artKey.replaceAll("_", " ")),
    type: "image",
    category: text(asset.category, "roblox-art"),
    artKey,
    iconKey: iconKey || undefined,
    sourceFileName: undefined,
    sourceExtension: undefined,
    mimeType: "image/png",
    width,
    height,
    aspectRatio: width && height ? `${width}:${height}` : null,
    fileSizeBytes: 0,
    status: sourceFile ? "mapped" : "source_missing",
    notes: sourceFile ? "Imported from Roblox art manifest. Web publish is pending." : "Imported from Roblox art manifest as Roblox-ID-only; source file is missing.",
    previewUrl: robloxAssetId,
    storagePath: "",
    platformMappings: {
      roblox: { assetId: robloxAssetId, status: "mapped", publishedAt: now },
      ...(sourceFile ? { web: { path: "", status: "Needs Web Publish", sourceFile } as unknown as AssetDefinition["platformMappings"]["web"] } : {})
    },
    usageReferences: manifestUsageReferences(asset),
    aliases: [...new Set([manifestAssetId(asset), text(asset.name), text(asset.sourceFile)].filter(Boolean))],
    tags: [...new Set(["roblox_manifest", text(asset.category), ...((asset.usage ?? []).map(usageType))].filter(Boolean))],
    importedFrom: sourceProject,
    importedAt: now,
    updatedAt: now
  };
}

function matchRobloxManifestAsset(asset: RobloxArtManifestAsset, rows: Row[]) {
  const artKey = slug(manifestArtKey(asset));
  const iconKey = slug(manifestIconKey(asset));
  const robloxAssetId = safeRobloxAssetId(asset.robloxUri ?? asset.robloxAssetId);
  const canonicalIds = new Set([manifestAssetId(asset), assetIdForArtKey(manifestArtKey(asset))].map(slug));
  const sourceFilename = normalizedSourceFilename(asset.sourceFile);
  const checks: Array<[string, (row: Row) => boolean]> = [
    ["canonical artKey", (row) => slug(artKeyFor(row)) === artKey],
    ["iconKey", (row) => Boolean(iconKey) && slug(iconKeyFor(row)) === iconKey],
    ["existing Roblox asset ID", (row) => Boolean(robloxAssetId) && platformRobloxId(row) === robloxAssetId],
    ["canonical asset ID", (row) => canonicalIds.has(slug(text(row.id)))],
    ["normalized source filename", (row) => Boolean(sourceFilename) && normalizedSourceFilename(row.source_file_name ?? row.sourceFileName ?? row.storage_path ?? row.file_url ?? row.preview_url) === sourceFilename]
  ];

  for (const [matchedBy, predicate] of checks) {
    const match = rows.find(predicate);
    if (match) return { assetId: text(match.id), matchedBy, row: match };
  }

  return null;
}

export async function importRobloxArtManifest(manifest: RobloxArtManifest, options: { manifestPath?: string; sourceProject?: string; sourceRoot?: string; previewOnly?: boolean } = {}) {
  const now = new Date().toISOString();
  const store = await readProductionStore();
  const [{ rows }, legacyAssets] = await Promise.all([getMergedAssetLibraryRows(), getRows("assets")]);
  const legacyAssetIds = new Set((legacyAssets as Row[]).map((row) => text(row.id)));
  const manifestAssets = manifest.assets ?? [];
  const importedDefinitions: AssetDefinition[] = [];
  const matched: RobloxArtManifestImportReport["matched"] = [];
  const created: RobloxArtManifestImportReport["created"] = [];
  const conflicts: RobloxArtManifestImportReport["conflicts"] = [];
  const notes: string[] = [];
  const missingSourceFiles: NonNullable<RobloxArtManifestImportReport["missingSourceFiles"]> = [];
  const assetsNeedingWebPublication: NonNullable<RobloxArtManifestImportReport["assetsNeedingWebPublication"]> = [];
  const seenAssetIds = new Set<string>();
  let matchedAssets = 0;
  let newAssets = 0;
  let duplicateAssets = 0;
  let sourceFilesCreated = 0;
  let robloxOnlyAssets = 0;

  for (const manifestAsset of manifestAssets) {
    const robloxAssetId = safeRobloxAssetId(manifestAsset.robloxUri ?? manifestAsset.robloxAssetId);
    if (!robloxAssetId) {
      notes.push(`Skipped ${manifestAsset.id ?? manifestAsset.name ?? "unknown"} because it has no Roblox asset ID.`);
      continue;
    }

    const match = matchRobloxManifestAsset(manifestAsset, rows);
    const assetId = match?.assetId ?? assetIdForArtKey(manifestArtKey(manifestAsset));
    const wasDuplicate = seenAssetIds.has(assetId);
    if (wasDuplicate) duplicateAssets += 1;
    seenAssetIds.add(assetId);

    if (match) {
      matchedAssets += 1;
      matched.push({ manifestId: manifestAssetId(manifestAsset), assetId, matchedBy: match.matchedBy, robloxAssetId });
    } else if (!wasDuplicate) {
      newAssets += 1;
      created.push({ manifestId: manifestAssetId(manifestAsset), assetId, artKey: manifestArtKey(manifestAsset), robloxAssetId });
    }

    const override = assetOverrideFor(store, assetId);
    const existingRobloxId = safeRobloxAssetId((override.platformMappings?.roblox as Record<string, unknown> | undefined)?.assetId ?? platformRobloxId(match?.row ?? {}));
    const mappingConflict = existingRobloxId && existingRobloxId !== robloxAssetId;
    const sourceResult = sourceRecordForManifest(assetId, manifestAsset, now, override.sourceFiles ?? []);
    const manifestSourceFile = text(manifestAsset.sourceFile);
    if (manifestSourceFile) {
      const manifestSourceRoot = text(options.sourceRoot) || text(manifest.sourceRoot);
      const candidateSourcePath = path.resolve(manifestSourceRoot || process.cwd(), manifestSourceFile);
      try {
        const sourceStats = await stat(candidateSourcePath);
        if (!sourceStats.isFile()) {
          missingSourceFiles.push({ assetId, sourceFile: manifestSourceFile, reason: "Source path is not a file." });
        }
      } catch {
        missingSourceFiles.push({ assetId, sourceFile: manifestSourceFile, reason: "Source file not found." });
      }
    }
    const sourceFiles = sourceResult
      ? (override.sourceFiles ?? []).map((source) => ({ ...source, isCurrent: false })).filter((source) => source.id !== sourceResult.record.id).concat(sourceResult.record)
      : override.sourceFiles ?? [];
    const sourceFileId = sourceResult?.record.id ?? null;
    if (sourceResult?.created) sourceFilesCreated += 1;
    if (!text(manifestAsset.sourceFile)) robloxOnlyAssets += 1;

    const incomingDerivative = derivativeForManifest(assetId, manifestAsset, sourceFileId, robloxAssetId, now);
    const derivatives = (override.derivatives ?? []).filter((derivative) => derivative.id !== incomingDerivative.id).concat(incomingDerivative);
    const nextPlatformMappings = { ...(override.platformMappings ?? {}) };

    if (mappingConflict) {
      conflicts.push({
        assetId,
        artKey: manifestArtKey(manifestAsset),
        existingRobloxAssetId: existingRobloxId,
        incomingRobloxAssetId: robloxAssetId,
        resolution: "Kept existing mapping; incoming Roblox ID requires review."
      });
    } else {
      nextPlatformMappings.roblox = { assetId: robloxAssetId, status: "mapped", publishedAt: now };
    }

    if (text(manifestAsset.sourceFile) && !(nextPlatformMappings.web as Record<string, unknown> | undefined)?.path) {
      nextPlatformMappings.web = { path: "", status: "Needs Web Publish", sourceFile: text(manifestAsset.sourceFile) };
    }
    if (text(manifestAsset.sourceFile) && !(nextPlatformMappings.web as Record<string, unknown> | undefined)?.path) {
      assetsNeedingWebPublication.push({ assetId, artKey: manifestArtKey(manifestAsset), sourceFile: text(manifestAsset.sourceFile) });
    }

    const webMapping = nextPlatformMappings.web as Record<string, unknown> | undefined;
    const webPath = text(webMapping?.path);
    const hasPublishedWebMapping = Boolean(webPath);
    const historyEvents = override.historyEvents ?? [];
    const hasImportHistory = historyEvents.some((event) => event.eventType === "roblox_manifest_imported" && event.notes === robloxAssetId);

    saveAssetOverride(store, assetId, {
      sourceFiles,
      derivatives,
      platformMappings: nextPlatformMappings,
      productionStatus: hasPublishedWebMapping ? (override.productionStatus ?? "published") : text(manifestAsset.sourceFile) ? "mapping_required" : "blocked",
      status: hasPublishedWebMapping ? (override.status ?? "web_published") : text(manifestAsset.sourceFile) ? "mapped" : "source_missing",
      notes: [
        text(override.notes),
        "Imported from Roblox art manifest.",
        text(manifestAsset.sourceFile) ? "Source Uploaded; Web publish pending." : "Source Missing; Roblox-ID-only asset."
      ].filter(Boolean).join("\n"),
      historyEvents: hasImportHistory
        ? historyEvents
        : [
            productionEvent(assetId, "roblox_manifest_imported", "Imported Roblox art manifest mapping", robloxAssetId),
            ...historyEvents
          ]
    });

    if (!legacyAssetIds.has(assetId)) {
      importedDefinitions.push(assetDefinitionForManifest(assetId, manifestAsset, robloxAssetId, options.sourceProject ?? "Project Genesis Roblox", now));
    }
  }

  const history = options.previewOnly
    ? {
        createdAssets: importedDefinitions.length,
        updatedAssets: matchedAssets
      }
    : await upsertAppliedGameArtAssets(importedDefinitions, {
    sourceProject: options.sourceProject ?? "Project Genesis Roblox",
    sourceType: "roblox_project",
    importedFiles: manifestAssets.length,
    matchedAssets,
    createdAssets: newAssets,
    updatedAssets: matchedAssets,
    ignoredFiles: 0,
    conflicts: conflicts.length,
    warnings: (manifest.brokenEmptyReferences?.length ?? 0) + robloxOnlyAssets
  });

  const placeholderAssets = (manifest.brokenEmptyReferences ?? []).map((item) => ({
    asset: text(item.assetId, "0"),
    usage: [text(item.key), text(item.path), text(item.property)].filter(Boolean).join(" / "),
    replacementRequired: text(item.reason, "replacement required")
  }));
  const unusedStudioAssets = (manifest.unusedManifestEntries ?? []).map((item) => ({
    id: text(item.id),
    name: text(item.name),
    artKey: text(item.artKey),
    reason: text(item.reason, "unused Studio asset record"),
    action: "ignore" as const
  }));
  const unusedLocalFiles = (manifest.unusedLocalSourceFiles ?? []).map((sourcePath) => ({ path: sourcePath, action: "ignore" as const }));

  store.robloxManifestReports = [{
    id: `roblox-art-import-${Date.now()}`,
    schemaVersion: text(manifest.schemaVersion, "unknown"),
    importedAt: now,
    generatedAt: text(manifest.generatedAt),
    sourceProject: options.sourceProject ?? "Project Genesis Roblox",
    sourceRoot: text(manifest.sourceRoot, "Roblox"),
    manifestPath: privatePath(options.manifestPath ?? "") ? "[external-roblox-art-manifest]" : options.manifestPath ?? "",
    importedAssets: manifestAssets.length,
    matchedAssets,
    newAssets,
    duplicateAssets,
    sourceFilesCreated,
    robloxOnlyAssets,
    placeholderAssets,
    unusedStudioAssets,
    unusedLocalFiles,
    missingSourceFiles,
    assetsNeedingWebPublication,
    conflicts,
    matched,
    created,
    updatedEraCompletion: [],
    updatedProductionDashboard: {
      totalAssets: 0,
      sourceFilesUploaded: 0,
      missingAssets: 0,
      engineMappingsIncomplete: 0
    },
    notes: [
      `Upserted ${importedDefinitions.length} imported asset library records (${history.createdAssets} created, ${history.updatedAssets} updated).`,
      ...notes
    ]
  }, ...(options.previewOnly ? [] : store.robloxManifestReports ?? [])].slice(0, 20);

  if (options.previewOnly) {
    return store.robloxManifestReports[0];
  }

  await writeProductionStore(store);
  const state = await getAssetProductionState();
  store.robloxManifestReports[0].updatedProductionDashboard = {
    totalAssets: state.dashboard.totalAssets,
    sourceFilesUploaded: state.dashboard.sourceFilesUploaded,
    missingAssets: state.dashboard.missingAssets,
    engineMappingsIncomplete: state.dashboard.engineMappingsIncomplete
  };
  await writeProductionStore(store);

  return store.robloxManifestReports[0];
}

export async function previewRobloxArtManifestImport(manifest: RobloxArtManifest, options: { manifestPath?: string; sourceProject?: string; sourceRoot?: string } = {}) {
  return importRobloxArtManifest(manifest, { ...options, previewOnly: true });
}

function sourceVersion(input: AssetProductionActionInput, currentVersions: SourceFileRecord[]): SourceFileRecord {
  const payload = input.payload ?? {};
  const filename = text(payload.filename, "source-art.psd");
  const extension = extensionFor(filename) || text(payload.extension, ".psd");
  const version = currentVersions.length ? Math.max(...currentVersions.map((item) => item.version)) + 1 : 1;
  const masterFormat = masterFormatFor(extension);
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
    notes: text(input.notes ?? payload.notes),
    masterFormat,
    sourceRole: sourceRoleFor(extension)
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
  const preset = activePresets({ assets: {}, derivativePresets: [], missingRequirements: {}, processingJobs: [], productionTasks: [] }).find((item) => item.id === text(payload.presetId))
    ?? derivativePresets.find((item) => item.derivativeType === derivativeType && (!width || item.width === width) && (!height || item.height === height))
    ?? derivativePresets.find((item) => item.derivativeType === derivativeType);
  const source = currentSources.find((item) => item.id === text(payload.sourceFileId)) ?? currentSources.find((item) => item.isCurrent);
  const record: AssetDerivativeRecord = {
    id: text(input.derivativeId) || `derivative_${input.assetId}_${derivativeType}_${Date.now()}`,
    assetId: text(input.assetId),
    sourceFileId: text(payload.sourceFileId) || source?.id || null,
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
    archived: false,
    presetId: text(payload.presetId),
    cropMode: text(payload.cropMode),
    focalPoint: text(payload.focalPoint),
    derivativeStatus: "current",
    safeArea: text(payload.safeArea, preset?.safeArea),
    padding: text(payload.padding, preset?.padding),
    alignment: text(payload.alignment, preset?.alignment),
    scale: (text(payload.scale, preset?.scale) as AssetDerivativeRecord["scale"]),
    outputProfileId: text(payload.outputProfileId, preset?.profileGroup),
    alphaRequired: typeof payload.alphaRequired === "boolean" ? payload.alphaRequired : preset?.transparentBackground
  };
  return {
    ...record,
    derivativeStatus: derivativeStatusFor(record),
    verification: verificationForDerivative(record, source, preset)
  };
}

function staleDerivativesForSourceChange(derivatives: AssetDerivativeRecord[], currentSourceFileId: string, reason: string, timestamp: string): AssetDerivativeRecord[] {
  return derivatives.map((derivative) => {
    if (derivative.archived || derivative.sourceFileId === currentSourceFileId) return derivative;
    return {
      ...derivative,
      publishStatus: derivative.publishStatus === "published" ? derivative.publishStatus : "stale" as const,
      staleSince: derivative.staleSince ?? timestamp,
      staleReason: reason
    };
  });
}

function processingJob(input: {
  assetId: string;
  sourceFileId: string | null;
  presetId: string;
  status?: ProcessingJobRecord["status"];
  progress?: number;
  errorMessage?: string;
}) {
  const preset = derivativePresets.find((item) => item.id === input.presetId);
  return {
    id: `job_${input.assetId}_${input.presetId}_${Date.now()}_${hash(`${input.sourceFileId}:${input.presetId}`)}`,
    assetId: input.assetId,
    sourceFileId: input.sourceFileId,
    presetId: input.presetId,
    status: input.status ?? "queued",
    progress: input.progress ?? 0,
    startedAt: null,
    completedAt: null,
    errorMessage: input.errorMessage ?? "",
    retryCount: 0,
    queueLabel: input.status === "processing" ? "Rendering" : input.status === "completed" ? "Completed" : input.status === "failed" ? "Failed" : input.status === "cancelled" ? "Cancelled" : "Pending",
    requestedOutputs: preset ? [`${preset.name} ${preset.width}x${preset.height} ${preset.format}`] : [input.presetId],
    sourcePolicy: preset?.sourcePolicy ?? "master_only"
  } satisfies ProcessingJobRecord;
}

export async function applyAssetProductionAction(input: AssetProductionActionInput) {
  const store = await readProductionStore();
  const assetId = text(input.assetId);
  const now = new Date().toISOString();

  if (!assetId && !input.action.startsWith("preset.") && !input.action.startsWith("queue.") && !input.action.startsWith("missing.") && !input.action.startsWith("requirement.") && !input.action.startsWith("task.") && !input.action.startsWith("bulk.") && input.action !== "roblox_manifest.import" && input.action !== "roblox_manifest.import.preview" && input.action !== "roblox_web.publish") {
    throw new Error("assetId is required for this production action.");
  }

  if (input.action === "roblox_manifest.import") {
    const payload = input.payload ?? {};
    const manifest = payload.manifest as RobloxArtManifest | undefined;
    if (!manifest || typeof manifest !== "object") throw new Error("A Roblox art manifest payload is required.");
    return importRobloxArtManifest(manifest, {
      manifestPath: text(payload.manifestPath),
      sourceProject: text(payload.sourceProject, "Project Genesis Roblox"),
      sourceRoot: text(payload.sourceRoot)
    });
  }

  if (input.action === "roblox_manifest.import.preview") {
    const payload = input.payload ?? {};
    const manifest = payload.manifest as RobloxArtManifest | undefined;
    if (!manifest || typeof manifest !== "object") throw new Error("A Roblox art manifest payload is required.");
    return previewRobloxArtManifestImport(manifest, {
      manifestPath: text(payload.manifestPath),
      sourceProject: text(payload.sourceProject, "Project Genesis Roblox"),
      sourceRoot: text(payload.sourceRoot)
    });
  }

  if (input.action === "roblox_web.publish") {
    const sourceRoot = text(input.payload?.sourceRoot);
    const publicRoot = text(input.payload?.publicRoot);
    return publishImportedRobloxArtForWeb({
      sourceRoot: sourceRoot || undefined,
      publicRoot: publicRoot || undefined
    });
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
      updatedAt: now,
      profileGroup: text(payload.profileGroup, existing?.profileGroup),
      scale: (text(payload.scale, existing?.scale) as AssetDerivativePreset["scale"]),
      sourcePolicy: (text(payload.sourcePolicy, existing?.sourcePolicy ?? "master_only") as AssetDerivativePreset["sourcePolicy"]),
      safeArea: text(payload.safeArea, existing?.safeArea ?? "center 90%"),
      padding: text(payload.padding, existing?.padding ?? "0"),
      alignment: text(payload.alignment, existing?.alignment ?? "center"),
      outputRole: (text(payload.outputRole, existing?.outputRole) as AssetDerivativePreset["outputRole"]),
      webOptimized: typeof payload.webOptimized === "boolean" ? payload.webOptimized : existing?.webOptimized,
      robloxReady: typeof payload.robloxReady === "boolean" ? payload.robloxReady : existing?.robloxReady
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
        if (input.action === "queue.retry") return { ...job, status: "queued", queueLabel: "Pending" as const, progress: 0, errorMessage: "", retryCount: job.retryCount + 1 };
        if (input.action === "queue.cancel") return { ...job, status: "cancelled", queueLabel: "Cancelled" as const, completedAt: now };
        if (input.action === "queue.reprocess") return { ...job, status: "queued", queueLabel: "Pending" as const, progress: 0, startedAt: null, completedAt: null, errorMessage: "", retryCount: job.retryCount + 1 };
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
      derivatives: staleDerivativesForSourceChange(derivatives, next.id, "New source version uploaded", now),
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
      derivatives: staleDerivativesForSourceChange(derivatives, sourceFileId, input.action === "source.restore" ? "Source version restored" : "Current source version changed", now),
      historyEvents: [productionEvent(assetId, input.action, input.action === "source.restore" ? "Restored source version" : "Changed current source version", input.notes), ...historyEvents]
    });
  }

  if (input.action === "source.archive") {
    const sourceFileId = text(input.sourceFileId);
    if (!sourceFileId) throw new Error("sourceFileId is required.");
    const activeSources = sourceFiles.filter((source) => !source.archived);
    const targetSource = activeSources.find((source) => source.id === sourceFileId);
    if (!targetSource) throw new Error("Source version was not found.");
    const remainingStoredSources = activeSources.filter((source) => source.id !== sourceFileId && source.storagePath);
    if (targetSource.storagePath && remainingStoredSources.length === 0) {
      throw new Error("Cannot archive the only stored source version.");
    }
    saveAssetOverride(store, assetId, {
      sourceFiles: sourceFiles.map((source) => source.id === sourceFileId ? { ...source, archived: true, isCurrent: false } : source),
      historyEvents: [productionEvent(assetId, "source_archived", "Archived source version", input.notes), ...historyEvents]
    });
  }

  if (input.action === "source.preview") {
    const sourceFileId = text(input.sourceFileId);
    const primary = Boolean(input.payload?.isPrimaryPreview);
    const previewUrl = text(input.payload?.previewUrl);
    saveAssetOverride(store, assetId, {
      sourceFiles: sourceFiles.map((source) => source.id === sourceFileId
        ? { ...source, previewUrl, previewStatus: previewUrl ? "ready" : "missing", isPrimaryPreview: previewUrl ? primary || source.isPrimaryPreview : false }
        : primary ? { ...source, isPrimaryPreview: false } : source),
      historyEvents: [productionEvent(assetId, "source_preview_uploaded", "Uploaded source preview", input.notes), ...historyEvents]
    });
  }

  if (input.action === "source.notes") {
    const sourceFileId = text(input.sourceFileId);
    saveAssetOverride(store, assetId, {
      sourceFiles: sourceFiles.map((source) => source.id === sourceFileId ? { ...source, notes: text(input.notes ?? input.payload?.notes, source.notes) } : source),
      historyEvents: [productionEvent(assetId, "source_notes_updated", "Updated source notes", input.notes), ...historyEvents]
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

  if (input.action === "derivative.reprocess_stale" || input.action === "derivative.generate" || input.action === "preview.regenerate") {
    const currentSource = sourceFiles.find((source) => source.isCurrent) ?? sourceFiles[0] ?? null;
    const presetId = text(input.presetId ?? input.payload?.presetId ?? input.payload?.derivativeType, "manual_derivative");
    const selectedDerivativeId = text(input.derivativeId);
    const jobs = [...store.processingJobs, processingJob({ assetId, sourceFileId: currentSource?.id ?? null, presetId })];
    store.processingJobs = jobs;
    if (selectedDerivativeId) {
      saveAssetOverride(store, assetId, {
        derivatives: derivatives.map((derivative) => derivative.id === selectedDerivativeId ? { ...derivative, status: "queued", staleReason: derivative.staleReason || "Queued for reprocess" } : derivative),
        historyEvents: [productionEvent(assetId, input.action, "Queued derivative processing", input.notes), ...historyEvents]
      });
    } else {
      saveAssetOverride(store, assetId, {
        historyEvents: [productionEvent(assetId, input.action, "Queued derivative processing", input.notes), ...historyEvents]
      });
    }
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
    if (action === "publish") {
      const asset = await getProductionAsset(assetId);
      if (asset?.publishBlockers.length && !input.adminOverride) {
        throw new Error(`Cannot publish: ${asset.publishBlockers.join(", ")}`);
      }
    }
    saveAssetOverride(store, assetId, {
      approvalStatus,
      status: action === "publish" ? "published" : action === "submit_review" ? "review" : action === "reopen" ? "draft" : approvalStatus,
      productionStatus: action === "publish" ? "published" : action === "reopen" ? "in_progress" : override.productionStatus,
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

  if (input.action === "mapping.unity" || input.action === "mapping.unreal" || input.action === "mapping.godot") {
    const target = input.action.replace("mapping.", "");
    const key = text(input.payload?.path ?? input.payload?.key);
    if (!key) throw new Error(`${target} mapping path/key is required.`);
    if (target === "unity" && /\s/.test(key)) throw new Error("Unity addressable keys cannot contain spaces.");
    if (target === "unreal" && !key.startsWith("/")) throw new Error("Unreal asset paths should start with /.");
    if (target === "godot" && !key.startsWith("res://")) throw new Error("Godot resource paths should start with res://.");
    saveAssetOverride(store, assetId, {
      platformMappings: { ...(override.platformMappings ?? {}), [target]: { path: key, status: "mapped", updatedAt: now, notes: text(input.notes ?? input.payload?.notes) } },
      historyEvents: [productionEvent(assetId, `${target}_mapped`, `Mapped ${target} asset`, key), ...historyEvents]
    });
  }

  await writeProductionStore(store);
  return { ok: true, action: input.action, assetId };
}
