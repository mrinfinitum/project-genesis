import type { AssetDerivativeRecord, MissingAssetRequirement, ProductionAsset, SourceFileRecord } from "@/lib/assets/asset-production";
import type { ComponentDesignRecord } from "@/lib/component-library";
import type { ScreenDesignRecord } from "@/lib/screen-designer";

export type PreviewSize = "tiny" | "small" | "card" | "large" | "hero" | "fullscreen";
export type PreviewMode = "thumbnail" | "card" | "hero" | "icon" | "panel" | "screenshot" | "state_comparison" | "variant_grid" | "before_after" | "overlay_comparison";
export type PreviewStatus = "Missing" | "Pending Generation" | "Generated" | "Stale" | "Needs Review" | "Approved" | "Published" | "Error";

export type VisualPreview = {
  id: string;
  objectId: string;
  objectType: string;
  title: string;
  status: PreviewStatus;
  mode: PreviewMode;
  size: PreviewSize;
  url: string;
  alt: string;
  source: "approved_primary_preview" | "approved_derivative" | "current_derivative" | "source_preview" | "web_mapping" | "studio_preview" | "missing";
  mimeType: "image" | "video" | "audio" | "svg" | "unknown";
  width: number | null;
  height: number | null;
  format: string;
  sourceVersion: string;
  approvalStatus: string;
  publishStatus: string;
  dimensionsLabel: string;
  metadata: Array<{ label: string; value: string | number }>;
  requirement?: {
    label: string;
    dimensions: string;
    format: string;
    required: boolean;
    actionHref: string;
    actionLabel: string;
  };
  safeForPublicRuntime: boolean;
  sanitized: boolean;
  staleReason?: string;
};

export type VisualPreviewReport = {
  totalVisualRecords: number;
  previewReady: number;
  previewMissing: number;
  previewStale: number;
  approvedPreview: number;
  publishedPreview: number;
  lowResolution: number;
  missingScreenshotReferences: number;
  parityReferencesMissing: number;
  issues: Array<{ id: string; objectType: string; title: string; status: PreviewStatus; action: string }>;
};

export const previewDerivativePresets = [
  { id: "preview_tiny_64_webp", name: "Preview Tiny", width: 64, height: 64, format: "WebP", notes: "64x64 thumbnail. Never upscale beyond source." },
  { id: "preview_small_128_webp", name: "Preview Small", width: 128, height: 128, format: "WebP", notes: "128x128 thumbnail. Use PNG when alpha is required." },
  { id: "preview_card_256_webp", name: "Preview Card", width: 256, height: 256, format: "WebP", notes: "Card preview, source-aspect constrained when needed." },
  { id: "preview_grid_512_webp", name: "Preview Grid", width: 512, height: 512, format: "WebP", notes: "Grid preview with 512px max edge." },
  { id: "preview_large_1024_webp", name: "Preview Large", width: 1024, height: 1024, format: "WebP", notes: "Large preview with 1024px max edge." },
  { id: "screen_preview_960x540_webp", name: "Screen Preview 960", width: 960, height: 540, format: "WebP", notes: "16:9 screen preview." },
  { id: "screen_preview_1440x810_webp", name: "Screen Preview 1440", width: 1440, height: 810, format: "WebP", notes: "16:9 screen preview." },
  { id: "screen_preview_1920x1080_webp", name: "Screen Preview 1920", width: 1920, height: 1080, format: "WebP", notes: "Full HD screen preview." },
  { id: "panel_preview_1024_webp", name: "Panel Preview", width: 1024, height: 0, format: "WebP", notes: "Preserve native aspect ratio, max width 1024." }
] as const;

const forbiddenPreviewPrefixes = [/^\/Users\//i, /^\/Volumes\//i, /^[A-Za-z]:\\/i, /^studio-private:\/\//i, /^rbxassetid:\/\//i];
const approvedDerivativeStatuses = new Set(["approved", "published"]);
const staleStatuses = new Set(["stale", "archived"]);

export function sanitizePreviewUrl(value: unknown) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  if (forbiddenPreviewPrefixes.some((pattern) => pattern.test(url))) return "";
  if (/token=|signature=|expires=/i.test(url)) return "";
  return url;
}

function mimeTypeFor(url: string, format = ""): VisualPreview["mimeType"] {
  const value = `${url} ${format}`.toLowerCase();
  if (/\.(mp4|mov|webm)\b/.test(value)) return "video";
  if (/\.(mp3|wav|ogg)\b/.test(value)) return "audio";
  if (/\.(svg)\b/.test(value) || format.toLowerCase() === "svg") return "svg";
  if (/\.(png|jpe?g|webp|gif|bmp)\b/.test(value) || /png|jpe?g|webp|gif/.test(format.toLowerCase())) return "image";
  return "unknown";
}

function dimensionsLabel(width: number | null | undefined, height: number | null | undefined) {
  return width && height ? `${width}x${height}` : "Dimensions pending";
}

function statusForDerivative(derivative: AssetDerivativeRecord): PreviewStatus {
  if (derivative.staleSince || derivative.derivativeStatus === "stale" || derivative.publishStatus === "stale") return "Stale";
  if (derivative.publishStatus === "published" || derivative.status === "published") return "Published";
  if (derivative.approvalStatus === "approved") return "Approved";
  if (derivative.status === "failed" || derivative.derivativeStatus === "failed") return "Error";
  if (derivative.status === "processing" || derivative.derivativeStatus === "generating") return "Pending Generation";
  return "Generated";
}

function statusForSource(source: SourceFileRecord): PreviewStatus {
  if (source.previewStatus === "ready") return source.isPrimaryPreview ? "Approved" : "Generated";
  if (source.previewStatus === "failed") return "Error";
  if (source.previewStatus === "manual_required") return "Pending Generation";
  return "Missing";
}

function previewFromDerivative(asset: ProductionAsset, derivative: AssetDerivativeRecord, source: VisualPreview["source"], size: PreviewSize, mode: PreviewMode): VisualPreview {
  const url = sanitizePreviewUrl(derivative.publicUrl || derivative.storagePath);
  return {
    id: `${asset.id}:${derivative.id}`,
    objectId: asset.id,
    objectType: asset.category || asset.type || "asset",
    title: asset.name,
    status: statusForDerivative(derivative),
    mode,
    size,
    url,
    alt: `${asset.name} ${derivative.derivativeType} preview`,
    source,
    mimeType: mimeTypeFor(url, derivative.format),
    width: derivative.width,
    height: derivative.height,
    format: derivative.format || "Unknown",
    sourceVersion: asset.sourceFiles.find((item) => item.id === derivative.sourceFileId)?.versionLabel ?? "Derivative",
    approvalStatus: derivative.approvalStatus ?? asset.approvalStatus,
    publishStatus: derivative.publishStatus ?? asset.productionStatus,
    dimensionsLabel: dimensionsLabel(derivative.width, derivative.height),
    metadata: [
      { label: "Asset", value: asset.name },
      { label: "Source", value: source.replaceAll("_", " ") },
      { label: "Derivative", value: derivative.derivativeType },
      { label: "Status", value: statusForDerivative(derivative) },
      { label: "Format", value: derivative.format || "Unknown" }
    ],
    safeForPublicRuntime: source === "approved_derivative" || source === "web_mapping",
    sanitized: !url,
    staleReason: derivative.staleReason
  };
}

function previewFromSource(asset: ProductionAsset, source: SourceFileRecord, previewSource: VisualPreview["source"], size: PreviewSize, mode: PreviewMode): VisualPreview {
  const url = sanitizePreviewUrl(source.previewUrl);
  return {
    id: `${asset.id}:${source.id}`,
    objectId: asset.id,
    objectType: asset.category || asset.type || "asset",
    title: asset.name,
    status: statusForSource(source),
    mode,
    size,
    url,
    alt: `${asset.name} source preview`,
    source: previewSource,
    mimeType: mimeTypeFor(url, source.mimeType),
    width: source.width ?? null,
    height: source.height ?? null,
    format: source.masterFormat ?? (source.extension.replace(".", "").toUpperCase() || "Source"),
    sourceVersion: source.versionLabel,
    approvalStatus: asset.approvalStatus,
    publishStatus: asset.productionStatus,
    dimensionsLabel: dimensionsLabel(source.width, source.height),
    metadata: [
      { label: "Asset", value: asset.name },
      { label: "Source Version", value: source.versionLabel },
      { label: "Preview", value: source.previewStatus ?? "missing" },
      { label: "Format", value: source.masterFormat ?? (source.extension || "Unknown") }
    ],
    safeForPublicRuntime: false,
    sanitized: !url
  };
}

function missingPreview(input: {
  objectId: string;
  objectType: string;
  title: string;
  size: PreviewSize;
  mode: PreviewMode;
  requirement?: VisualPreview["requirement"];
  metadata?: VisualPreview["metadata"];
}): VisualPreview {
  return {
    id: `${input.objectType}:${input.objectId}:missing-preview`,
    objectId: input.objectId,
    objectType: input.objectType,
    title: input.title,
    status: "Missing",
    mode: input.mode,
    size: input.size,
    url: "",
    alt: `${input.title} missing preview`,
    source: "missing",
    mimeType: "unknown",
    width: null,
    height: null,
    format: input.requirement?.format ?? "Preview required",
    sourceVersion: "No current preview",
    approvalStatus: "missing",
    publishStatus: "missing",
    dimensionsLabel: input.requirement?.dimensions ?? "Preview required",
    metadata: input.metadata ?? [],
    requirement: input.requirement,
    safeForPublicRuntime: false,
    sanitized: true
  };
}

export function resolveProductionAssetPreview(asset: ProductionAsset, options: { size?: PreviewSize; mode?: PreviewMode } = {}): VisualPreview {
  const size = options.size ?? "card";
  const mode = options.mode ?? "thumbnail";
  const approvedPrimarySource = asset.sourceFiles.find((source) => source.isPrimaryPreview && sanitizePreviewUrl(source.previewUrl) && source.previewStatus === "ready");
  if (approvedPrimarySource) return previewFromSource(asset, approvedPrimarySource, "approved_primary_preview", size, mode);

  const approvedDerivative = asset.derivatives.find((derivative) => sanitizePreviewUrl(derivative.publicUrl || derivative.storagePath) && approvedDerivativeStatuses.has(String(derivative.approvalStatus ?? derivative.publishStatus ?? derivative.status).toLowerCase()) && !staleStatuses.has(String(derivative.derivativeStatus ?? derivative.publishStatus).toLowerCase()));
  if (approvedDerivative) return previewFromDerivative(asset, approvedDerivative, "approved_derivative", size, mode);

  const currentDerivative = asset.derivatives.find((derivative) => sanitizePreviewUrl(derivative.publicUrl || derivative.storagePath) && !derivative.staleSince && !staleStatuses.has(String(derivative.derivativeStatus ?? derivative.publishStatus).toLowerCase()));
  if (currentDerivative) return previewFromDerivative(asset, currentDerivative, "current_derivative", size, mode);

  const currentSource = asset.sourceFiles.find((source) => source.isCurrent && sanitizePreviewUrl(source.previewUrl)) ?? asset.sourceFiles.find((source) => sanitizePreviewUrl(source.previewUrl));
  if (currentSource) return previewFromSource(asset, currentSource, "source_preview", size, mode);

  const webMapping = asset.platformMappings?.web && typeof asset.platformMappings.web === "object" ? asset.platformMappings.web as { path?: unknown } : null;
  const webUrl = sanitizePreviewUrl(webMapping?.path);
  if (webUrl) {
    return {
      ...missingPreview({ objectId: asset.id, objectType: asset.category || "asset", title: asset.name, size, mode }),
      status: "Published",
      url: webUrl,
      source: "web_mapping",
      mimeType: mimeTypeFor(webUrl),
      approvalStatus: asset.approvalStatus,
      publishStatus: "published",
      safeForPublicRuntime: true,
      sanitized: false
    };
  }

  return missingPreview({
    objectId: asset.id,
    objectType: asset.category || asset.type || "asset",
    title: asset.name,
    size,
    mode,
    requirement: {
      label: asset.missingRequirements[0] ?? "Preview thumbnail",
      dimensions: "256x256 or source-aspect constrained",
      format: "WebP or PNG",
      required: true,
      actionHref: `/assets/${encodeURIComponent(asset.id)}?tab=previews`,
      actionLabel: asset.sourceFiles.length ? "Generate Preview" : "Upload Source"
    },
    metadata: [
      { label: "Asset", value: asset.name },
      { label: "Status", value: asset.productionStatus },
      { label: "Requirement", value: asset.missingRequirements[0] ?? "preview" }
    ]
  });
}

export function resolveMissingRequirementPreview(requirement: MissingAssetRequirement, asset?: ProductionAsset | null): VisualPreview {
  if (asset) return resolveProductionAssetPreview(asset, { size: "card", mode: "card" });
  return missingPreview({
    objectId: requirement.objectId,
    objectType: requirement.objectType,
    title: requirement.objectName,
    size: "card",
    mode: "card",
    requirement: {
      label: requirement.requiredDerivative,
      dimensions: "Use linked requirement preset",
      format: "WebP / PNG",
      required: true,
      actionHref: "/game-art-import",
      actionLabel: "Create Asset"
    },
    metadata: [
      { label: "artKey", value: requirement.artKey },
      { label: "Priority", value: requirement.priority },
      { label: "Status", value: requirement.currentStatus }
    ]
  });
}

function findAssetForKeys(assets: ProductionAsset[] | undefined, keys: Array<string | undefined>) {
  const normalized = keys.filter(Boolean).map(String);
  if (!assets?.length || !normalized.length) return null;
  return assets.find((asset) => normalized.some((key) => asset.id === key || asset.artKey === key || asset.iconKey === key || asset.aliases.includes(key))) ?? null;
}

export function resolveScreenPreview(record: ScreenDesignRecord, assets?: ProductionAsset[]): VisualPreview {
  const reference = record.references.find((item) => sanitizePreviewUrl(item.source) && item.approvalStatus === "Approved")
    ?? record.references.find((item) => sanitizePreviewUrl(item.source));
  if (reference) {
    const url = sanitizePreviewUrl(reference.source);
    return {
      ...missingPreview({ objectId: record.screenId, objectType: "screen", title: record.displayName, size: "large", mode: "screenshot" }),
      status: reference.approvalStatus === "Approved" ? "Approved" : "Needs Review",
      url,
      source: "studio_preview",
      mimeType: mimeTypeFor(url),
      sourceVersion: reference.viewport,
      approvalStatus: reference.approvalStatus,
      publishStatus: "studio-only",
      dimensionsLabel: reference.viewport,
      metadata: [
        { label: "Target", value: reference.type },
        { label: "Viewport", value: reference.viewport },
        { label: "Date", value: reference.date }
      ],
      sanitized: false
    };
  }
  const linkedAsset = findAssetForKeys(assets, record.assetRequirements.flatMap((item) => [item.linkedAssetId, item.artKey, item.iconKey]));
  if (linkedAsset) return { ...resolveProductionAssetPreview(linkedAsset, { size: "large", mode: "screenshot" }), objectId: record.screenId, objectType: "screen", title: record.displayName };
  return missingPreview({
    objectId: record.screenId,
    objectType: "screen",
    title: record.displayName,
    size: "large",
    mode: "screenshot",
    requirement: {
      label: "Reference or implementation screenshot",
      dimensions: record.referenceViewport,
      format: "WebP / PNG",
      required: true,
      actionHref: `/screen-designer/${record.screenId}`,
      actionLabel: "Add Screenshot"
    },
    metadata: [
      { label: "Screen", value: record.screenId },
      { label: "Missing Assets", value: record.assetRequirements.filter((item) => item.required && item.status !== "Ready").length }
    ]
  });
}

export function resolveComponentPreview(record: ComponentDesignRecord, assets?: ProductionAsset[]): VisualPreview {
  const reference = record.references.find((item) => sanitizePreviewUrl(item.source) && item.approvalStatus === "Approved")
    ?? record.references.find((item) => sanitizePreviewUrl(item.source));
  if (reference) {
    const url = sanitizePreviewUrl(reference.source);
    return {
      ...missingPreview({ objectId: record.componentId, objectType: "component", title: record.displayName, size: "card", mode: "variant_grid" }),
      status: reference.approvalStatus === "Approved" ? "Approved" : "Needs Review",
      url,
      source: "studio_preview",
      mimeType: mimeTypeFor(url),
      sourceVersion: `v${reference.version}`,
      approvalStatus: reference.approvalStatus,
      publishStatus: "studio-only",
      dimensionsLabel: reference.viewport,
      metadata: [
        { label: "Target", value: reference.type },
        { label: "Viewport", value: reference.viewport },
        { label: "Version", value: reference.version }
      ],
      sanitized: false
    };
  }
  const linkedAsset = findAssetForKeys(assets, record.assetKeys.flatMap((item) => [item.linkedAssetId, item.assetKey]));
  if (linkedAsset) return { ...resolveProductionAssetPreview(linkedAsset, { size: "card", mode: "variant_grid" }), objectId: record.componentId, objectType: "component", title: record.displayName };
  return missingPreview({
    objectId: record.componentId,
    objectType: "component",
    title: record.displayName,
    size: "card",
    mode: "variant_grid",
    requirement: {
      label: "Component state preview",
      dimensions: "Default, hover, pressed, disabled",
      format: "WebP / PNG",
      required: true,
      actionHref: `/component-library/${record.componentId}`,
      actionLabel: "Add Preview"
    },
    metadata: [
      { label: "Component", value: record.componentId },
      { label: "Variants", value: record.variants.length },
      { label: "Missing States", value: record.states.filter((item) => item.required && !item.designed).length }
    ]
  });
}

export function buildVisualPreviewReport(input: {
  assets: ProductionAsset[];
  missingRequirements?: MissingAssetRequirement[];
  screenPreviews?: VisualPreview[];
  componentPreviews?: VisualPreview[];
}): VisualPreviewReport {
  const previews = [
    ...input.assets.map((asset) => resolveProductionAssetPreview(asset)),
    ...(input.missingRequirements ?? []).map((requirement) => resolveMissingRequirementPreview(requirement, null)),
    ...(input.screenPreviews ?? []),
    ...(input.componentPreviews ?? [])
  ];
  const issues = previews
    .filter((preview) => preview.status === "Missing" || preview.status === "Stale" || preview.status === "Error")
    .map((preview) => ({
      id: preview.id,
      objectType: preview.objectType,
      title: preview.title,
      status: preview.status,
      action: preview.requirement?.actionLabel ?? (preview.status === "Stale" ? "Regenerate Preview" : "Upload Preview")
    }));
  return {
    totalVisualRecords: previews.length,
    previewReady: previews.filter((preview) => preview.url && !["Missing", "Error"].includes(preview.status)).length,
    previewMissing: previews.filter((preview) => preview.status === "Missing").length,
    previewStale: previews.filter((preview) => preview.status === "Stale").length,
    approvedPreview: previews.filter((preview) => preview.status === "Approved").length,
    publishedPreview: previews.filter((preview) => preview.status === "Published").length,
    lowResolution: previews.filter((preview) => preview.width !== null && preview.width < 256).length,
    missingScreenshotReferences: previews.filter((preview) => preview.objectType === "screen" && preview.status === "Missing").length,
    parityReferencesMissing: previews.filter((preview) => ["screen", "component"].includes(preview.objectType) && preview.status === "Missing").length,
    issues
  };
}
