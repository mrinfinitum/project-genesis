import type { AssetDerivativeRecord, MissingAssetRequirement, ProductionAsset, SourceFileRecord } from "@/lib/assets/asset-production";

type ScreenPreviewRecord = {
  screenId: string;
  displayName: string;
  referenceViewport: string;
  references: Array<{ source: string; approvalStatus: string; type: string; viewport: string; date: string }>;
  assetRequirements: Array<{ linkedAssetId?: string | null; artKey?: string; iconKey?: string; id: string; label: string; required: boolean; status: string }>;
  componentSpecs: Array<{ assetOverride?: string | null; assetKeys?: string[] }>;
};

type ComponentPreviewRecord = {
  componentId: string;
  displayName: string;
  references: Array<{ source: string; approvalStatus: string; type: string; viewport: string; version: number; width?: number | null; height?: number | null; format?: string; captureSource?: string; checksum?: string }>;
  assetKeys: Array<{ linkedAssetId?: string | null; assetKey: string; label: string }>;
  variants: unknown[];
  states: Array<{ required: boolean; designed: boolean }>;
};

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
  source: "approved_primary_preview" | "approved_derivative" | "thumbnail" | "generated_preview" | "source_preview" | "web_mapping" | "roblox_png" | "source_png" | "studio_preview" | "placeholder" | "missing";
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
const genericPreviewTokens = new Set([
  "asset",
  "art",
  "arts",
  "background",
  "card",
  "cards",
  "dashboard",
  "frame",
  "hero",
  "icon",
  "icons",
  "image",
  "node",
  "panel",
  "preview",
  "screen",
  "state",
  "states",
  "ui",
  "visual"
]);

const previewAliasMap: Record<string, string[]> = {
  building_cards: ["buildings_icon", "upgrade_panel_structure"],
  button_primary_frame: ["upgrade_button", "top_bar_hex_button"],
  dashboard_auto_button_off: ["auto_button_off"],
  dashboard_auto_button_on: ["auto_button_on"],
  dashboard_auto_ring: ["auto_robot_circle", "auto_robot_icon"],
  dashboard_click_button: ["click_button"],
  dashboard_click_ring: ["click_ring_outer", "click_ring_middle", "click_ring_inner"],
  dashboard_era_lock_icon: ["critical_star_icon", "era_progression_hex"],
  dashboard_era_node_frame: ["era_progression_hex"],
  dashboard_hero: ["dashboard_background", "city_preview"],
  dashboard_nav_background: ["sidebar_frame"],
  discovery_icons: ["overview_icon", "trophy_icon", "galaxy_icon"],
  earth_background: ["city_preview", "dashboard_background"],
  economy_counter_icon: ["credits_icon", "population_icon", "civilization_energy_icon", "civilization_points_icon"],
  era_hero_art: ["era_progression_hex", "dashboard_background"],
  era_navigation_icons: ["era_progression_hex"],
  event_art: ["active_event_panel", "event_activate_button", "events_icon"],
  galaxy_map_art: ["galaxy_icon"],
  production_icons: ["resource_management", "financial_planning", "buildings_icon"],
  research_category_icons: ["research_icon"],
  research_empty_state: ["research_icon"],
  research_node_frame: ["upgrade_button", "era_progression_hex"],
  resource_icons: ["credits_icon", "population_icon", "civilization_energy_icon", "civilization_points_icon"],
  settings_icons: ["settings_icon"],
  sol_body_art: ["galaxy_icon", "spaceport_icon"],
  spaceport_hero: ["spaceport_icon"],
  upgrade_icons: ["upgrades_icon"]
};

function previewAliasesFor(key: string) {
  const direct = previewAliasMap[key];
  if (direct) return direct;
  const entry = Object.entries(previewAliasMap).find(([aliasKey]) => normalizePreviewKey(aliasKey) === key);
  return entry?.[1] ?? [];
}

export function sanitizePreviewUrl(value: unknown) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  if (forbiddenPreviewPrefixes.some((pattern) => pattern.test(url))) return "";
  if (/token=|signature=|expires=/i.test(url)) return "";
  return url;
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function normalizePreviewKey(value: unknown) {
  return text(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^asset_/, "")
    .replace(/^icon_/, "")
    .replace(/^ui_/, "")
    .replace(/^dashboard_/, "")
    .replace(/_asset$/, "")
    .replace(/_art$/, "")
    .replace(/_image$/, "")
    .replace(/_visual$/, "")
    .replace(/^_+|_+$/g, "");
}

function previewTokens(value: unknown) {
  return normalizePreviewKey(value).split("_").filter((token) => token && !genericPreviewTokens.has(token));
}

function expandedPreviewKeys(keys: Array<string | null | undefined>) {
  const expanded = new Set<string>();
  for (const raw of keys) {
    const key = normalizePreviewKey(raw);
    if (!key) continue;
    expanded.add(key);
    for (const alias of previewAliasesFor(key)) expanded.add(normalizePreviewKey(alias));
  }
  return [...expanded];
}

function assetSearchValues(asset: ProductionAsset) {
  return [
    asset.id,
    asset.name,
    asset.artKey,
    asset.iconKey,
    asset.category,
    asset.type,
    ...asset.aliases,
    ...asset.tags,
    ...asset.usageReferences.flatMap((usage) => [usage.id, usage.name, usage.type])
  ].filter(Boolean);
}

function previewUrlForWebMapping(asset: ProductionAsset) {
  const mapping = asset.platformMappings?.web;
  if (typeof mapping === "string") return sanitizePreviewUrl(mapping);
  if (mapping && typeof mapping === "object") {
    const record = mapping as { path?: unknown; url?: unknown; publicUrl?: unknown; fileUrl?: unknown };
    return sanitizePreviewUrl(record.path ?? record.url ?? record.publicUrl ?? record.fileUrl);
  }
  return "";
}

function inferredRobloxPngUrl(asset: ProductionAsset) {
  const webUrl = previewUrlForWebMapping(asset);
  if (webUrl) return webUrl;
  const hasRobloxMapping = Boolean(asset.platformMappings?.roblox);
  if (!hasRobloxMapping) return "";
  return sanitizePreviewUrl(`/assets/game-art/${asset.id}/${asset.id}.png`);
}

export function findAssetForPreviewKeys(assets: ProductionAsset[] | undefined, keys: Array<string | null | undefined>) {
  const expandedKeys = expandedPreviewKeys(keys);
  if (!assets?.length || !expandedKeys.length) return null;

  const indexed = assets.map((asset) => {
    const values = assetSearchValues(asset);
    const normalized = new Set(values.map(normalizePreviewKey).filter(Boolean));
    return { asset, normalized, tokenSets: values.map(previewTokens).filter((tokens) => tokens.length) };
  });

  for (const key of expandedKeys) {
    const exact = indexed.find((item) => item.normalized.has(key));
    if (exact) return exact.asset;
  }

  let best: { asset: ProductionAsset; score: number } | null = null;
  for (const key of expandedKeys) {
    const keyTokens = previewTokens(key);
    if (!keyTokens.length) continue;
    for (const item of indexed) {
      const score = Math.max(
        ...item.tokenSets.map((tokens) => {
          const overlap = keyTokens.filter((token) => tokens.includes(token)).length;
          if (!overlap) return 0;
          const coverage = overlap / Math.max(1, keyTokens.length);
          const reverseCoverage = overlap / Math.max(1, tokens.length);
          return Math.round((coverage * 60) + (reverseCoverage * 30) + overlap);
        })
      );
      if (score >= 45 && (!best || score > best.score)) best = { asset: item.asset, score };
    }
  }

  return best?.asset ?? null;
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

function previewFromUrl(input: {
  asset: ProductionAsset;
  url: string;
  source: VisualPreview["source"];
  status: PreviewStatus;
  size: PreviewSize;
  mode: PreviewMode;
  format?: string;
  sourceVersion?: string;
  safeForPublicRuntime?: boolean;
}): VisualPreview {
  return {
    id: `${input.asset.id}:${input.source}`,
    objectId: input.asset.id,
    objectType: input.asset.category || input.asset.type || "asset",
    title: input.asset.name,
    status: input.status,
    mode: input.mode,
    size: input.size,
    url: input.url,
    alt: `${input.asset.name} ${input.source.replaceAll("_", " ")} preview`,
    source: input.source,
    mimeType: mimeTypeFor(input.url, input.format),
    width: null,
    height: null,
    format: input.format ?? (input.url.split(".").pop()?.split("?")[0]?.toUpperCase() ?? "PNG"),
    sourceVersion: input.sourceVersion ?? input.source.replaceAll("_", " "),
    approvalStatus: input.asset.approvalStatus,
    publishStatus: input.source === "web_mapping" || input.source === "roblox_png" ? "published" : input.asset.productionStatus,
    dimensionsLabel: "Dimensions pending",
    metadata: [
      { label: "Asset", value: input.asset.name },
      { label: "Source", value: input.source.replaceAll("_", " ") },
      { label: "artKey", value: input.asset.artKey || input.asset.id }
    ],
    safeForPublicRuntime: input.safeForPublicRuntime ?? (input.source === "web_mapping" || input.source === "roblox_png"),
    sanitized: !input.url
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

  const thumbnail = asset.derivatives.find((derivative) => {
    const derivativeType = String(derivative.derivativeType ?? "").toLowerCase();
    const presetId = String(derivative.presetId ?? "").toLowerCase();
    return sanitizePreviewUrl(derivative.publicUrl || derivative.storagePath)
      && !derivative.staleSince
      && !staleStatuses.has(String(derivative.derivativeStatus ?? derivative.publishStatus).toLowerCase())
      && (derivativeType === "thumbnail" || derivativeType === "icon" || derivativeType === "card" || presetId.includes("thumbnail") || presetId.includes("preview"));
  });
  if (thumbnail) return previewFromDerivative(asset, thumbnail, "thumbnail", size, mode);

  const currentDerivative = asset.derivatives.find((derivative) => sanitizePreviewUrl(derivative.publicUrl || derivative.storagePath) && !derivative.staleSince && !staleStatuses.has(String(derivative.derivativeStatus ?? derivative.publishStatus).toLowerCase()));
  if (currentDerivative) return previewFromDerivative(asset, currentDerivative, "generated_preview", size, mode);

  const webUrl = previewUrlForWebMapping(asset);
  if (webUrl) return previewFromUrl({ asset, url: webUrl, source: "web_mapping", status: "Published", size, mode });

  const robloxPng = inferredRobloxPngUrl(asset);
  if (robloxPng) return previewFromUrl({ asset, url: robloxPng, source: "roblox_png", status: "Published", size, mode, format: "PNG", sourceVersion: "Imported Roblox PNG" });

  const currentSource = asset.sourceFiles.find((source) => source.isCurrent && sanitizePreviewUrl(source.previewUrl)) ?? asset.sourceFiles.find((source) => sanitizePreviewUrl(source.previewUrl));
  if (currentSource) return previewFromSource(asset, currentSource, currentSource.masterFormat === "Raster" ? "source_png" : "source_preview", size, mode);

  const fallback = missingPreview({
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
  return {
    ...fallback,
    status: asset.platformMappings?.roblox ? "Pending Generation" : "Missing",
    source: asset.platformMappings?.roblox ? "placeholder" : "missing",
    sourceVersion: asset.platformMappings?.roblox ? "Roblox mapping present; Web preview/source required" : fallback.sourceVersion
  };
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
      actionHref: "/asset-library?upload=asset",
      actionLabel: "Create Asset"
    },
    metadata: [
      { label: "artKey", value: requirement.artKey },
      { label: "Priority", value: requirement.priority },
      { label: "Status", value: requirement.currentStatus }
    ]
  });
}

export function resolveScreenPreview(record: ScreenPreviewRecord, assets?: ProductionAsset[]): VisualPreview {
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
  for (const requirement of record.assetRequirements) {
    const linkedAsset = findAssetForPreviewKeys(assets, [requirement.linkedAssetId, requirement.artKey, requirement.iconKey, requirement.id, requirement.label]);
    if (!linkedAsset) continue;
    const preview = resolveProductionAssetPreview(linkedAsset, { size: "large", mode: "screenshot" });
    if (preview.url) return { ...preview, objectId: record.screenId, objectType: "screen", title: record.displayName };
  }
  const linkedAsset = findAssetForPreviewKeys(assets, [
    ...record.componentSpecs.flatMap((item) => [item.assetOverride, ...(item.assetKeys ?? [])]),
    record.screenId,
    record.displayName
  ]);
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
      actionHref: "/asset-library?upload=asset",
      actionLabel: "Add Preview Asset"
    },
    metadata: [
      { label: "Screen", value: record.screenId },
      { label: "Missing Assets", value: record.assetRequirements.filter((item) => item.required && item.status !== "Ready").length }
    ]
  });
}

export function resolveComponentPreview(record: ComponentPreviewRecord, assets?: ProductionAsset[]): VisualPreview {
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
      width: reference.width ?? null,
      height: reference.height ?? null,
      format: reference.format ?? "Studio reference",
      dimensionsLabel: reference.width && reference.height ? `${reference.width}x${reference.height}` : reference.viewport,
      metadata: [
        { label: "Target", value: reference.type },
        { label: "Viewport", value: reference.viewport },
        { label: "Version", value: reference.version },
        ...(reference.captureSource ? [{ label: "Capture", value: reference.captureSource }] : []),
        ...(reference.checksum ? [{ label: "Checksum", value: reference.checksum.slice(0, 12) }] : [])
      ],
      sanitized: false
    };
  }
  const linkedAsset = findAssetForPreviewKeys(assets, [
    ...record.assetKeys.flatMap((item) => [item.linkedAssetId, item.assetKey, item.label]),
    record.componentId,
    record.displayName
  ]);
  if (linkedAsset) return { ...resolveProductionAssetPreview(linkedAsset, { size: "card", mode: "variant_grid" }), objectId: record.componentId, objectType: "component", title: record.displayName };
  const fallback = missingPreview({
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
      actionHref: "/asset-library?upload=asset",
      actionLabel: "Add Preview Asset"
    },
    metadata: [
      { label: "Component", value: record.componentId },
      { label: "Variants", value: record.variants.length },
      { label: "Missing States", value: record.states.filter((item) => item.required && !item.designed).length }
    ]
  });
  return record.assetKeys.length
    ? fallback
    : {
        ...fallback,
        status: "Pending Generation",
        source: "placeholder",
        sourceVersion: "Component screenshot pending",
        requirement: {
          ...fallback.requirement!,
          actionLabel: "Generate Component Preview"
        }
      };
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
