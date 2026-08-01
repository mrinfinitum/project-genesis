import type { ProductionAsset } from "@/lib/assets/asset-production";

export const canonicalAssetStatuses = [
  "planned",
  "awaiting_prompt",
  "prompt_ready",
  "generating",
  "generated",
  "awaiting_review",
  "approved",
  "rejected",
  "revision_required",
  "extraction_pending",
  "extracted",
  "exported",
  "published",
  "stale",
  "blocked",
  "missing",
  "deprecated"
] as const;

export type CanonicalAssetStatus = (typeof canonicalAssetStatuses)[number];

export const canonicalAssetCategories = [
  "background",
  "planet",
  "star",
  "moon",
  "galaxy",
  "creature",
  "plant",
  "fungus",
  "microorganism",
  "species_plate",
  "botanical_plate",
  "icon",
  "hud",
  "navigation_icon",
  "screen_art",
  "material",
  "texture",
  "animation_reference",
  "loading_art",
  "encyclopedia_art",
  "discovery_art",
  "prompt_pack",
  "source_master",
  "other"
] as const;

export type CanonicalAssetCategory = (typeof canonicalAssetCategories)[number];

export type AssetProductionRecord = {
  id: string;
  canonicalOwnerId: string | null;
  category: CanonicalAssetCategory;
  subcategory: string;
  displayName: string;
  description: string;
  status: CanonicalAssetStatus;
  sourceMasterId: string | null;
  sourceMasterPath: string | null;
  approvedAssetId: string | null;
  previewAssetId: string | null;
  thumbnailAssetId: string | null;
  promptId: string | null;
  promptVersion: string | null;
  generationSeed: string | null;
  checksum: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  format: string | null;
  runtimeRole: string;
  runtimeTargets: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  staleReason: string | null;
  metadata: Record<string, unknown>;
};

const legacyStatusMap: Record<string, CanonicalAssetStatus> = {
  not_started: "planned",
  source_uploaded: "extraction_pending",
  in_progress: "generating",
  in_review: "awaiting_review",
  changes_requested: "revision_required",
  approved: "approved",
  processing: "generating",
  derivatives_ready: "extracted",
  mapping_required: "extracted",
  ready_to_publish: "exported",
  published: "published",
  blocked: "blocked",
  error: "blocked",
  source_missing: "missing",
  missing: "missing",
  stale: "stale",
  deprecated: "deprecated"
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function canonicalStatus(asset: ProductionAsset): CanonicalAssetStatus {
  const candidate = text(asset.productionStatus || asset.status).toLowerCase();
  if (canonicalAssetStatuses.includes(candidate as CanonicalAssetStatus)) return candidate as CanonicalAssetStatus;
  return legacyStatusMap[candidate] ?? (asset.sourceFiles.length ? "extraction_pending" : "planned");
}

function canonicalCategory(asset: ProductionAsset): CanonicalAssetCategory {
  const source = [asset.category, asset.type, asset.artKey, ...asset.tags].join(" ").toLowerCase();
  const rules: Array<[CanonicalAssetCategory, RegExp]> = [
    ["navigation_icon", /navigation.*icon|nav.*icon/],
    ["species_plate", /species.?plate|creature.?plate/],
    ["botanical_plate", /botanical.?plate|plant.?plate/],
    ["microorganism", /microorganism|microbial|bacteria/],
    ["encyclopedia_art", /encyclopedia|codex/],
    ["discovery_art", /discovery|curiosity/],
    ["animation_reference", /animation/],
    ["loading_art", /loading/],
    ["screen_art", /screen|panel|backplate/],
    ["background", /background|environment.?painting/],
    ["planet", /planet/],
    ["moon", /moon/],
    ["galaxy", /galaxy/],
    ["star", /star/],
    ["creature", /creature|fauna|animal/],
    ["fungus", /fungus|fungi|mushroom/],
    ["plant", /plant|flora|tree|flower/],
    ["hud", /hud/],
    ["icon", /icon/],
    ["material", /material|alloy/],
    ["texture", /texture|surface/],
    ["prompt_pack", /prompt/],
    ["source_master", /source.?master|psd|psb/]
  ];
  return rules.find(([, pattern]) => pattern.test(source))?.[0] ?? "other";
}

function publicReference(asset: ProductionAsset, purpose: "approved" | "preview" | "thumbnail") {
  const candidates = asset.derivatives.filter((derivative) => !derivative.archived && derivative.publicUrl);
  if (purpose === "thumbnail") {
    return candidates.find((derivative) => /thumb|card/i.test(derivative.derivativeType))?.id ?? null;
  }
  if (purpose === "preview") {
    return candidates.find((derivative) => /preview|grid|card/i.test(derivative.derivativeType))?.id ?? candidates[0]?.id ?? null;
  }
  return candidates.find((derivative) => derivative.approvalStatus === "approved" || derivative.publishStatus === "published")?.id ?? null;
}

export function normalizeAssetProductionRecord(asset: ProductionAsset): AssetProductionRecord {
  const currentSource = asset.sourceFiles.find((source) => source.id === asset.currentMasterSourceId)
    ?? asset.sourceFiles.find((source) => source.isCurrent && !source.archived)
    ?? null;
  const approvedDerivative = asset.derivatives.find((derivative) => derivative.id === publicReference(asset, "approved")) ?? null;
  const dimensions = approvedDerivative ?? asset.derivatives.find((derivative) => derivative.width && derivative.height) ?? null;
  const runtimeTargets = Object.entries(asset.platformMappings)
    .filter(([, value]) => Boolean(value))
    .map(([target]) => target)
    .sort();
  const owner = asset.usageReferences[0];

  return {
    id: asset.id,
    canonicalOwnerId: owner?.id ?? null,
    category: canonicalCategory(asset),
    subcategory: text(asset.category) || "uncategorized",
    displayName: asset.name,
    description: asset.description,
    status: canonicalStatus(asset),
    sourceMasterId: currentSource?.id ?? null,
    sourceMasterPath: currentSource?.storagePath ?? null,
    approvedAssetId: approvedDerivative?.id ?? null,
    previewAssetId: publicReference(asset, "preview"),
    thumbnailAssetId: publicReference(asset, "thumbnail"),
    promptId: null,
    promptVersion: null,
    generationSeed: null,
    checksum: approvedDerivative?.checksum || currentSource?.checksum || null,
    width: dimensions?.width ?? currentSource?.width ?? null,
    height: dimensions?.height ?? currentSource?.height ?? null,
    aspectRatio: dimensions?.aspectRatio ?? (dimensions?.width && dimensions.height ? `${dimensions.width}:${dimensions.height}` : null),
    format: approvedDerivative?.format ?? currentSource?.extension ?? null,
    runtimeRole: owner?.type ?? asset.type ?? "decorative",
    runtimeTargets,
    version: currentSource?.version ?? 1,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    staleReason: approvedDerivative?.staleReason ?? null,
    metadata: {
      artKey: asset.artKey,
      iconKey: asset.iconKey,
      aliases: asset.aliases,
      tags: asset.tags,
      legacyProductionStatus: asset.productionStatus,
      completionPercent: asset.completionPercent
    }
  };
}

export function validateAssetProductionRecords(records: AssetProductionRecord[]) {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) issues.push(`Duplicate asset ID: ${record.id}`);
    ids.add(record.id);
    if (!canonicalAssetStatuses.includes(record.status)) issues.push(`Invalid status on ${record.id}`);
    if (!canonicalAssetCategories.includes(record.category)) issues.push(`Invalid category on ${record.id}`);
    if (record.status === "approved" && !record.approvedAssetId) issues.push(`Approved asset has no approved derivative: ${record.id}`);
    if (record.status === "published" && (!record.approvedAssetId || !record.runtimeTargets.length)) issues.push(`Published asset has no runtime reference: ${record.id}`);
    if ((record.width && !record.height) || (!record.width && record.height)) issues.push(`Incomplete dimensions on ${record.id}`);
  }
  return issues;
}
