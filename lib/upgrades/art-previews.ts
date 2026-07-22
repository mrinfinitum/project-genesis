import type { MissingAssetRequirement, ProductionAsset } from "@/lib/assets/asset-production";
import { resolveProductionAssetPreview, sanitizePreviewUrl, type PreviewSize, type VisualPreview } from "@/lib/assets/visual-previews";
import type { Upgrade } from "@/types/schema";

export type UpgradeArtMatchStatus = "matched" | "missing" | "ambiguous";

export type UpgradeArtCandidate = {
  assetId: string;
  name: string;
  artKey: string;
  iconKey: string;
  reason: string;
  score: number;
};

export type UpgradeLinkedAsset = {
  id: string;
  name: string;
  category: string;
  artKey: string;
  iconKey: string;
  approvalStatus: string;
  productionStatus: string;
  sourceFileCount: number;
  derivativeCount: number;
  usageCount: number;
  currentSourceVersion: string;
  latestDerivative: string;
  webMappingStatus: string;
  robloxMappingStatus: string;
};

export type UpgradeArtResolution = {
  upgradeId: string;
  displayName: string;
  artKey: string;
  iconKey: string;
  linkedAssetId: string | null;
  previewStatus: VisualPreview["status"];
  resolvedPreviewUrl: string;
  resolutionSource: string;
  missingReason: string;
  matchStatus: UpgradeArtMatchStatus;
  preview: VisualPreview;
  asset: UpgradeLinkedAsset | null;
  candidates: UpgradeArtCandidate[];
  missingRequirement: MissingAssetRequirement | null;
  hasSource: boolean;
  hasPreview: boolean;
  hasThumbnail: boolean;
  hasApprovedPreview: boolean;
  hasWebMapping: boolean;
  hasRobloxMapping: boolean;
  hasHeroPreview: boolean;
  hasCardPreview: boolean;
};

export type UpgradeArtStats = {
  total: number;
  matched: number;
  missing: number;
  ambiguous: number;
  previewReady: number;
  approved: number;
  published: number;
  webReady: number;
  robloxReady: number;
  lowResolution: number;
  placeholderOnly: number;
};

export type UpgradeArtReport = {
  generatedAt: string;
  items: UpgradeArtResolution[];
  stats: UpgradeArtStats;
};

const ignoredNamePrefixes = [/^icon_/i, /^asset_/i, /^upgrade_/i, /^ui_/i];
const iconContextPrefixes = ["icon_workforce_", "icon_science_", "icon_economy_", "icon_civilization_", "icon_technology_", "icon_upgrade_", "workforce_", "science_", "economy_", "civilization_", "technology_", "upgrade_"];
const privateLeakPatterns = [/^\/Users\//i, /^\/Volumes\//i, /^[A-Za-z]:\\/i, /^studio-private:\/\//i, /token=|signature=|expires=/i];

function text(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeUpgradeArtKey(value: unknown) {
  let normalized = text(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  for (const prefix of ignoredNamePrefixes) normalized = normalized.replace(prefix, "");
  return normalized.replace(/^_+|_+$/g, "");
}

function iconKeyWithoutContext(value: unknown) {
  const normalized = normalizeUpgradeArtKey(value);
  return iconContextPrefixes.reduce((current, prefix) => current.startsWith(prefix) ? current.slice(prefix.length) : current, normalized);
}

function filenameStem(value: unknown) {
  return normalizeUpgradeArtKey(text(value).split(/[\\/]/).pop() ?? "");
}

function assetValues(asset: ProductionAsset) {
  return [
    asset.id,
    asset.name,
    asset.artKey,
    asset.iconKey,
    ...asset.aliases,
    ...asset.tags,
    ...asset.sourceFiles.map((source) => source.filename),
    ...asset.usageReferences.flatMap((usage) => [usage.id, usage.name, usage.type])
  ].filter(Boolean).map(String);
}

function usageMatches(asset: ProductionAsset, upgrade: Upgrade) {
  return asset.usageReferences.some((usage) =>
    usage.type === "upgrade" &&
    (text(usage.id) === upgrade.id || normalizeUpgradeArtKey(usage.name) === normalizeUpgradeArtKey(upgrade.name))
  );
}

function hasMapping(asset: ProductionAsset, platform: string) {
  return Boolean(asset.platformMappings?.[platform]);
}

function derivativeUrl(asset: ProductionAsset, derivativeType: RegExp) {
  return asset.derivatives.some((derivative) => {
    const url = sanitizePreviewUrl(derivative.publicUrl || derivative.storagePath);
    return Boolean(url) && !derivative.staleSince && derivativeType.test(String(derivative.derivativeType ?? derivative.presetId ?? ""));
  });
}

function hasPrimaryPreview(asset: ProductionAsset) {
  return asset.sourceFiles.some((source) => source.isPrimaryPreview && source.previewStatus === "ready" && sanitizePreviewUrl(source.previewUrl));
}

function hasAnySourcePreview(asset: ProductionAsset) {
  return asset.sourceFiles.some((source) => sanitizePreviewUrl(source.previewUrl));
}

function hasApprovedDerivative(asset: ProductionAsset) {
  return asset.derivatives.some((derivative) =>
    sanitizePreviewUrl(derivative.publicUrl || derivative.storagePath) &&
    !derivative.staleSince &&
    /approved|published/i.test(`${derivative.approvalStatus ?? ""} ${derivative.publishStatus ?? ""} ${derivative.status ?? ""}`)
  );
}

function lowResolutionPreview(preview: VisualPreview) {
  return Boolean(preview.url) && preview.width !== null && preview.height !== null && (preview.width < 128 || preview.height < 128);
}

function isPrivateUrl(value: string) {
  return privateLeakPatterns.some((pattern) => pattern.test(value));
}

function safeMappingStatus(asset: ProductionAsset, platform: string) {
  const mapping = asset.platformMappings?.[platform];
  if (!mapping) return "Missing";
  if (typeof mapping === "string") return mapping ? "Mapped" : "Missing";
  if (mapping && typeof mapping === "object") {
    const record = mapping as Record<string, unknown>;
    return text(record.status ?? record.assetId ?? record.path ?? record.url) ? "Mapped" : "Mapped";
  }
  return "Mapped";
}

function assetSummary(asset: ProductionAsset): UpgradeLinkedAsset {
  const currentSource = asset.sourceFiles.find((source) => source.isCurrent) ?? asset.sourceFiles[0];
  const latestDerivative = asset.derivatives.find((derivative) => !derivative.staleSince) ?? asset.derivatives[0];
  return {
    id: asset.id,
    name: asset.name,
    category: asset.category,
    artKey: asset.artKey,
    iconKey: asset.iconKey,
    approvalStatus: asset.approvalStatus,
    productionStatus: asset.productionStatus,
    sourceFileCount: asset.sourceFiles.length,
    derivativeCount: asset.derivatives.length,
    usageCount: asset.usageReferences.length,
    currentSourceVersion: currentSource?.versionLabel ?? "No source",
    latestDerivative: latestDerivative ? `${latestDerivative.derivativeType} / ${latestDerivative.format}` : "No derivative",
    webMappingStatus: safeMappingStatus(asset, "web"),
    robloxMappingStatus: safeMappingStatus(asset, "roblox")
  };
}

function dedupeCandidates(candidates: UpgradeArtCandidate[]) {
  const map = new Map<string, UpgradeArtCandidate>();
  for (const candidate of candidates) {
    const current = map.get(candidate.assetId);
    if (!current || candidate.score > current.score) map.set(candidate.assetId, candidate);
  }
  return [...map.values()].sort((left, right) => right.score - left.score || left.assetId.localeCompare(right.assetId));
}

type UpgradeArtAssetIndexEntry = {
  asset: ProductionAsset;
  assetId: string;
  artKey: string;
  assetIconKey: string;
  assetName: string;
  values: Set<string>;
  isUpgradeAsset: boolean;
};

function buildUpgradeArtAssetIndex(assets: ProductionAsset[]): UpgradeArtAssetIndexEntry[] {
  return assets.map((asset) => ({
    asset,
    assetId: normalizeUpgradeArtKey(asset.id),
    artKey: normalizeUpgradeArtKey(asset.artKey),
    assetIconKey: normalizeUpgradeArtKey(asset.iconKey),
    assetName: normalizeUpgradeArtKey(asset.name),
    values: new Set(assetValues(asset).flatMap((value) => [normalizeUpgradeArtKey(value), filenameStem(value), iconKeyWithoutContext(value)]).filter(Boolean)),
    isUpgradeAsset: /upgrade/i.test(`${asset.category} ${asset.type}`)
  }));
}

function candidatesForUpgrade(upgrade: Upgrade, assetIndex: UpgradeArtAssetIndexEntry[]) {
  const upgradeId = normalizeUpgradeArtKey(upgrade.id);
  const nameKey = normalizeUpgradeArtKey(upgrade.name);
  const iconKey = normalizeUpgradeArtKey(upgrade.icon_name);
  const iconStem = iconKeyWithoutContext(upgrade.icon_name);
  const linkedAssetId = normalizeUpgradeArtKey(upgrade.asset_id ?? "");
  const candidates: UpgradeArtCandidate[] = [];

  for (const entry of assetIndex) {
    const { asset, assetId, artKey, assetIconKey, assetName, values } = entry;
    const usageMatch = usageMatches(asset, upgrade);
    const upgradeAssetCategory = entry.isUpgradeAsset || usageMatch;

    const push = (reason: string, score: number) => candidates.push({ assetId: asset.id, name: asset.name, artKey: asset.artKey, iconKey: asset.iconKey, reason, score });

    if (linkedAssetId && assetId === linkedAssetId) push("canonical asset_id", 110);
    if (usageMatch) push("manifest usage reference", 100);
    if (iconKey && (assetIconKey === iconKey || artKey === iconKey || values.has(iconKey))) push("exact iconKey", 95);
    if (upgradeId && values.has(upgradeId)) push("upgrade ID reference", 88);
    if (nameKey && upgradeAssetCategory && (assetName === nameKey || artKey === nameKey || assetIconKey === nameKey || values.has(nameKey))) push("exact upgrade display name", 82);
    if (iconStem && upgradeAssetCategory && (artKey === iconStem || assetIconKey === iconStem || assetName === iconStem || values.has(iconStem))) push("normalized icon filename match", 76);
  }

  return dedupeCandidates(candidates);
}

function missingRequirementFor(upgrade: Upgrade): MissingAssetRequirement {
  const artKey = iconKeyWithoutContext(upgrade.icon_name) || normalizeUpgradeArtKey(upgrade.name);
  return {
    id: `upgrade:${upgrade.id}:icon`,
    objectType: "upgrade",
    objectId: upgrade.id,
    objectName: upgrade.name,
    requiredDerivative: "upgrade_icon",
    currentStatus: "missing",
    priority: "high",
    linkedCanonicalRecord: `upgrades:${upgrade.id}`,
    artKey,
    iconKey: text(upgrade.icon_name) || `icon_upgrade_${artKey}`,
    assignedArtist: "",
    dueDate: "",
    completionPercent: 0
  };
}

function missingPreviewFor(upgrade: Upgrade, reason: string, size: PreviewSize, candidates: UpgradeArtCandidate[] = []): VisualPreview {
  const requirement = missingRequirementFor(upgrade);
  return {
    id: `upgrade:${upgrade.id}:missing-preview`,
    objectId: upgrade.id,
    objectType: "upgrade",
    title: upgrade.name,
    status: candidates.length > 1 ? "Needs Review" : "Missing",
    mode: "icon",
    size,
    url: "",
    alt: `${upgrade.name} upgrade icon missing`,
    source: candidates.length > 1 ? "placeholder" : "missing",
    mimeType: "unknown",
    width: null,
    height: null,
    format: "PNG or WebP",
    sourceVersion: reason,
    approvalStatus: candidates.length > 1 ? "needs_review" : "missing",
    publishStatus: "missing",
    dimensionsLabel: "128, 256, 512 preview set",
    metadata: [
      { label: "Upgrade", value: upgrade.id },
      { label: "iconKey", value: upgrade.icon_name || requirement.iconKey },
      { label: "Reason", value: reason },
      ...(candidates.length ? [{ label: "Candidates", value: candidates.length }] : [])
    ],
    requirement: {
      label: "Upgrade icon art",
      dimensions: "128x128, 256x256, 512x512 card preview",
      format: "PNG/WebP with alpha when needed",
      required: true,
      actionHref: "/assets/missing",
      actionLabel: candidates.length > 1 ? "Review Candidates" : "Create Upgrade Icon"
    },
    safeForPublicRuntime: false,
    sanitized: true
  };
}

function retargetPreview(preview: VisualPreview, upgrade: Upgrade): VisualPreview {
  const safeUrl = sanitizePreviewUrl(preview.url);
  return {
    ...preview,
    id: `upgrade:${upgrade.id}:${preview.id}`,
    objectId: upgrade.id,
    objectType: "upgrade",
    title: upgrade.name,
    url: safeUrl,
    alt: `${upgrade.name} upgrade icon preview`,
    sanitized: !safeUrl,
    safeForPublicRuntime: preview.safeForPublicRuntime && !isPrivateUrl(safeUrl),
    metadata: [
      { label: "Upgrade", value: upgrade.id },
      { label: "Era", value: upgrade.era },
      { label: "Tier", value: upgrade.tier },
      { label: "Upgrade iconKey", value: upgrade.icon_name || "missing" },
      ...preview.metadata
    ]
  };
}

function resolveUpgradeArtPreviewFromIndex(upgrade: Upgrade, assets: ProductionAsset[], assetIndex: UpgradeArtAssetIndexEntry[], options: { size?: PreviewSize } = {}): UpgradeArtResolution {
  const size = options.size ?? "card";
  const candidates = candidatesForUpgrade(upgrade, assetIndex);
  const topScore = candidates[0]?.score ?? 0;
  const topCandidates = candidates.filter((candidate) => candidate.score === topScore);
  const iconKey = text(upgrade.icon_name);
  const artKey = iconKeyWithoutContext(iconKey) || normalizeUpgradeArtKey(upgrade.name);

  if (topCandidates.length > 1 && topScore < 100) {
    const preview = missingPreviewFor(upgrade, "Ambiguous asset candidates require review", size, topCandidates);
    return {
      upgradeId: upgrade.id,
      displayName: upgrade.name,
      artKey,
      iconKey,
      linkedAssetId: null,
      previewStatus: preview.status,
      resolvedPreviewUrl: "",
      resolutionSource: "needs_review",
      missingReason: "Multiple possible assets matched this upgrade at the same confidence.",
      matchStatus: "ambiguous",
      preview,
      asset: null,
      candidates: topCandidates,
      missingRequirement: missingRequirementFor(upgrade),
      hasSource: false,
      hasPreview: false,
      hasThumbnail: false,
      hasApprovedPreview: false,
      hasWebMapping: false,
      hasRobloxMapping: false,
      hasHeroPreview: false,
      hasCardPreview: false
    };
  }

  const asset = topCandidates[0] ? assets.find((item) => item.id === topCandidates[0].assetId) ?? null : null;
  if (!asset) {
    const preview = missingPreviewFor(upgrade, "No exact asset, usage, iconKey, or normalized filename match", size);
    return {
      upgradeId: upgrade.id,
      displayName: upgrade.name,
      artKey,
      iconKey,
      linkedAssetId: null,
      previewStatus: preview.status,
      resolvedPreviewUrl: "",
      resolutionSource: "missing-art placeholder",
      missingReason: "No linked upgrade art asset was found.",
      matchStatus: "missing",
      preview,
      asset: null,
      candidates,
      missingRequirement: missingRequirementFor(upgrade),
      hasSource: false,
      hasPreview: false,
      hasThumbnail: false,
      hasApprovedPreview: false,
      hasWebMapping: false,
      hasRobloxMapping: false,
      hasHeroPreview: false,
      hasCardPreview: false
    };
  }

  const preview = retargetPreview(resolveProductionAssetPreview(asset, { size, mode: "icon" }), upgrade);
  const hasSource = asset.sourceFiles.length > 0;
  const hasPreview = Boolean(preview.url) || hasAnySourcePreview(asset);
  const hasThumbnail = derivativeUrl(asset, /thumbnail|preview|icon/i);
  const hasApprovedPreview = hasPrimaryPreview(asset) || hasApprovedDerivative(asset);
  const hasWebMapping = hasMapping(asset, "web");
  const hasRobloxMapping = hasMapping(asset, "roblox");

  return {
    upgradeId: upgrade.id,
    displayName: upgrade.name,
    artKey: asset.artKey || artKey,
    iconKey: asset.iconKey || iconKey,
    linkedAssetId: asset.id,
    previewStatus: preview.status,
    resolvedPreviewUrl: preview.url,
    resolutionSource: topCandidates[0]?.reason ?? preview.source,
    missingReason: preview.url ? "" : "Linked asset exists but has no usable preview derivative or public mapping.",
    matchStatus: preview.url ? "matched" : "missing",
    preview,
    asset: assetSummary(asset),
    candidates,
    missingRequirement: preview.url ? null : missingRequirementFor(upgrade),
    hasSource,
    hasPreview,
    hasThumbnail,
    hasApprovedPreview,
    hasWebMapping,
    hasRobloxMapping,
    hasHeroPreview: derivativeUrl(asset, /hero/i),
    hasCardPreview: derivativeUrl(asset, /card|grid|preview/i),
  };
}

export function resolveUpgradeArtPreview(upgrade: Upgrade, assets: ProductionAsset[], options: { size?: PreviewSize } = {}): UpgradeArtResolution {
  return resolveUpgradeArtPreviewFromIndex(upgrade, assets, buildUpgradeArtAssetIndex(assets), options);
}

export function buildUpgradeArtReport(upgrades: Upgrade[], assets: ProductionAsset[], options: { size?: PreviewSize } = {}): UpgradeArtReport {
  const assetIndex = buildUpgradeArtAssetIndex(assets);
  const items = upgrades.map((upgrade) => resolveUpgradeArtPreviewFromIndex(upgrade, assets, assetIndex, options));
  const stats: UpgradeArtStats = {
    total: items.length,
    matched: items.filter((item) => item.matchStatus === "matched").length,
    missing: items.filter((item) => item.matchStatus === "missing").length,
    ambiguous: items.filter((item) => item.matchStatus === "ambiguous").length,
    previewReady: items.filter((item) => Boolean(item.resolvedPreviewUrl)).length,
    approved: items.filter((item) => /approved/i.test(item.preview.approvalStatus)).length,
    published: items.filter((item) => item.preview.status === "Published" || /published/i.test(item.preview.publishStatus)).length,
    webReady: items.filter((item) => item.hasWebMapping).length,
    robloxReady: items.filter((item) => item.hasRobloxMapping).length,
    lowResolution: items.filter((item) => lowResolutionPreview(item.preview)).length,
    placeholderOnly: items.filter((item) => item.preview.source === "placeholder" || item.preview.source === "missing").length
  };
  return { generatedAt: new Date().toISOString(), items, stats };
}

export function printableUpgradeArtAudit(report: UpgradeArtReport) {
  return report.items.map((item) => ({
    upgradeId: item.upgradeId,
    displayName: item.displayName,
    artKey: item.artKey,
    iconKey: item.iconKey,
    linkedAssetId: item.linkedAssetId,
    previewStatus: item.previewStatus,
    resolvedPreviewUrl: item.resolvedPreviewUrl,
    resolutionSource: item.resolutionSource,
    missingReason: item.missingReason
  }));
}
