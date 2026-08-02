import type { AssetDefinition } from "@/types/runtime";

export const ASSET_PRODUCTION_SYSTEM_ID = "noveris-asset-production";
export const ASSET_PRODUCTION_SYSTEM_VERSION = "1.0.0";

export const assetProductionAssetTypes = [
  "Background",
  "Galaxy",
  "Galactic Region",
  "Star System",
  "Planet",
  "Moon",
  "Star",
  "Creature",
  "Plant",
  "Fungus",
  "Species Plate",
  "Botanical Plate",
  "Planet Detail",
  "HUD",
  "Icon",
  "Card",
  "Loading Screen",
  "Research Illustration",
  "Mission Illustration",
  "Discovery Illustration",
  "Material Study",
  "Animation Reference",
  "PSD Extraction"
] as const;

export type AssetProductionAssetType = (typeof assetProductionAssetTypes)[number];

export const assetProductionStatuses = [
  "planned",
  "awaiting_prompt",
  "prompt_ready",
  "queued",
  "rendering",
  "generated",
  "awaiting_review",
  "approved",
  "rejected",
  "revision_required",
  "published",
  "stale",
  "deprecated"
] as const;

export type CanonicalAssetProductionStatus = (typeof assetProductionStatuses)[number];
export type CanonicalApprovalStatus = "pending" | "approved" | "rejected" | "revision_required";

export type RenderProviderDefinition = {
  providerId: string;
  displayName: string;
  promptFormat: "plain_text" | "structured" | "workflow";
  supportedResolutions: string[];
  supportedAspectRatios: string[];
  supportsReferenceImages: boolean;
  supportsBatch: boolean;
  supportsSeed: boolean;
  supportsNegativePrompt: boolean;
  supportsUpscaling: boolean;
  status: "available" | "configured" | "planned";
};

export const renderProviderRegistry: RenderProviderDefinition[] = [
  {
    providerId: "freepik-flux",
    displayName: "Freepik Flux",
    promptFormat: "plain_text",
    supportedResolutions: ["1024x1024", "1536x1024", "2048x1152"],
    supportedAspectRatios: ["1:1", "16:9", "3:2", "4:3"],
    supportsReferenceImages: true,
    supportsBatch: true,
    supportsSeed: true,
    supportsNegativePrompt: true,
    supportsUpscaling: true,
    status: "available"
  },
  {
    providerId: "nano-banana-2",
    displayName: "Nano Banana 2",
    promptFormat: "plain_text",
    supportedResolutions: ["1024x1024", "1536x1024", "2048x1152", "3840x2160"],
    supportedAspectRatios: ["1:1", "16:9", "3:2", "4:3"],
    supportsReferenceImages: true,
    supportsBatch: true,
    supportsSeed: true,
    supportsNegativePrompt: true,
    supportsUpscaling: true,
    status: "configured"
  },
  {
    providerId: "openai-images",
    displayName: "OpenAI Images",
    promptFormat: "structured",
    supportedResolutions: ["1024x1024", "1536x1024", "1024x1536"],
    supportedAspectRatios: ["1:1", "3:2", "2:3"],
    supportsReferenceImages: true,
    supportsBatch: false,
    supportsSeed: false,
    supportsNegativePrompt: false,
    supportsUpscaling: false,
    status: "available"
  },
  {
    providerId: "comfyui",
    displayName: "ComfyUI",
    promptFormat: "workflow",
    supportedResolutions: ["1024x1024", "1536x1024", "2048x1152", "3840x2160"],
    supportedAspectRatios: ["1:1", "16:9", "3:2", "4:3", "9:16"],
    supportsReferenceImages: true,
    supportsBatch: true,
    supportsSeed: true,
    supportsNegativePrompt: true,
    supportsUpscaling: true,
    status: "configured"
  },
  {
    providerId: "future-provider",
    displayName: "Future Providers",
    promptFormat: "structured",
    supportedResolutions: [],
    supportedAspectRatios: [],
    supportsReferenceImages: false,
    supportsBatch: false,
    supportsSeed: false,
    supportsNegativePrompt: false,
    supportsUpscaling: false,
    status: "planned"
  },
  {
    providerId: "legacy-import",
    displayName: "Legacy Import",
    promptFormat: "plain_text",
    supportedResolutions: [],
    supportedAspectRatios: [],
    supportsReferenceImages: false,
    supportsBatch: false,
    supportsSeed: false,
    supportsNegativePrompt: false,
    supportsUpscaling: false,
    status: "configured"
  }
];

export type AssetProductionPrompt = {
  id: string;
  version: string;
  positivePrompt: string;
  negativePrompt: string;
  combinedPrompt: string;
  promptHash: string;
  providerId: string;
  generatedAt: string;
};

export type AssetProductionHistoryEvent = {
  id: string;
  eventType: "created" | "prompt_updated" | "queued" | "generated" | "approved" | "rejected" | "published" | "rolled_back" | "status_changed";
  timestamp: string;
  actor: string;
  previousStatus: CanonicalAssetProductionStatus | null;
  status: CanonicalAssetProductionStatus;
  note: string;
  reason?: string;
};

export type AssetProductionRecord = {
  id: string;
  version: string;
  status: CanonicalAssetProductionStatus;
  canonicalOwnerId: string;
  assetType: AssetProductionAssetType;
  assetCategory: string;
  assetRole: string;
  promptId: string | null;
  promptVersion: string | null;
  renderProvider: string;
  generationSeed: string | null;
  sourceMasterId: string | null;
  approvedAssetId: string | null;
  previewAssetId: string | null;
  thumbnailAssetId: string | null;
  runtimeTargets: string[];
  productionStatus: CanonicalAssetProductionStatus;
  approvalStatus: CanonicalApprovalStatus;
  history: AssetProductionHistoryEvent[];
  createdAt: string;
  updatedAt: string;
  displayName: string;
  runtimeKey: string;
  previewUrl: string | null;
  thumbnailUrl: string | null;
  checksum: string;
  usage: Array<{ type: string; id: string; name: string }>;
  prompt: AssetProductionPrompt | null;
};

export type AssetProductionRecordSource = {
  id: string;
  name?: string;
  type?: string;
  category?: string;
  artKey?: string;
  status?: string;
  productionStatus?: string;
  approvalStatus?: string;
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
  checksum?: string;
  sourceMasterId?: string | null;
  hasSourceMaster?: boolean;
  runtimeTargets?: string[];
  platformMappings?: Record<string, unknown>;
  usageReferences?: Array<{ type: string; id: string; name: string }>;
  createdAt?: string;
  updatedAt?: string;
  generationSeed?: string | null;
  renderProvider?: string;
  prompt?: AssetProductionPrompt | null;
  history?: AssetProductionHistoryEvent[];
};

export type AssetProductionValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  records: string[];
};

export type AssetProductionValidation = {
  valid: boolean;
  status: "Ready" | "Ready With Warnings" | "Blocked";
  issues: AssetProductionValidationIssue[];
};

export type AssetProductionCatalog = {
  id: typeof ASSET_PRODUCTION_SYSTEM_ID;
  version: typeof ASSET_PRODUCTION_SYSTEM_VERSION;
  records: AssetProductionRecord[];
  renderProviders: RenderProviderDefinition[];
  lifecycle: readonly CanonicalAssetProductionStatus[];
  previewModes: ["fit", "fill", "transparent", "black", "zoom", "compare_previous", "compare_approved"];
  searchFields: ["asset", "owner", "provider", "status", "category", "screen", "planet", "creature", "prompt"];
  validation: AssetProductionValidation;
};

export type AssetProductionRuntimeAsset = {
  id: string;
  version: string;
  runtimeKey: string;
  preview: string | null;
  thumbnail: string | null;
  checksum: string;
  runtimeTargets: string[];
};

export type AssetProductionRuntimeManifest = {
  id: typeof ASSET_PRODUCTION_SYSTEM_ID;
  version: typeof ASSET_PRODUCTION_SYSTEM_VERSION;
  status: "Ready" | "Blocked";
  assets: AssetProductionRuntimeAsset[];
  publishingPolicy: "approved-assets-only";
  sourceOfTruth: "Project Genesis Studio";
};

const systemDate = "2026-08-02T00:00:00.000Z";

function lightweightHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `ap-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function isStatus(value: string | undefined): value is CanonicalAssetProductionStatus {
  return Boolean(value && assetProductionStatuses.includes(value as CanonicalAssetProductionStatus));
}

function normalizeStatus(source: AssetProductionRecordSource): CanonicalAssetProductionStatus {
  const explicit = source.productionStatus || source.status;
  if (isStatus(explicit)) return explicit;
  if (source.approvalStatus === "rejected") return "rejected";
  if (source.approvalStatus === "changes_requested") return "revision_required";
  if (source.approvalStatus === "approved" && source.status === "published") return "published";
  if (source.approvalStatus === "approved") return "approved";
  if (source.status === "published") return "published";
  if (source.status === "in_review") return "awaiting_review";
  if (source.status === "processing" || source.productionStatus === "processing") return "rendering";
  if (source.status === "derivatives_ready") return "generated";
  if (source.hasSourceMaster || source.sourceMasterId) return "awaiting_prompt";
  return "planned";
}

function normalizeApprovalStatus(source: AssetProductionRecordSource, status: CanonicalAssetProductionStatus): CanonicalApprovalStatus {
  if (source.approvalStatus === "approved" || status === "approved" || status === "published") return "approved";
  if (source.approvalStatus === "rejected" || status === "rejected") return "rejected";
  if (source.approvalStatus === "changes_requested" || status === "revision_required") return "revision_required";
  return "pending";
}

function normalizeAssetType(source: AssetProductionRecordSource): AssetProductionAssetType {
  const value = `${source.type || ""} ${source.category || ""} ${source.name || ""}`.toLowerCase();
  const matches: Array<[RegExp, AssetProductionAssetType]> = [
    [/galactic region|sector/, "Galactic Region"],
    [/star system/, "Star System"],
    [/species plate/, "Species Plate"],
    [/botanical plate/, "Botanical Plate"],
    [/planet detail/, "Planet Detail"],
    [/loading/, "Loading Screen"],
    [/research/, "Research Illustration"],
    [/mission/, "Mission Illustration"],
    [/discovery/, "Discovery Illustration"],
    [/material/, "Material Study"],
    [/animation/, "Animation Reference"],
    [/psd|extraction/, "PSD Extraction"],
    [/galaxy/, "Galaxy"],
    [/planet/, "Planet"],
    [/moon/, "Moon"],
    [/star/, "Star"],
    [/creature|fauna/, "Creature"],
    [/plant|flora|tree|moss/, "Plant"],
    [/fung/, "Fungus"],
    [/hud/, "HUD"],
    [/icon/, "Icon"],
    [/card/, "Card"],
    [/background|environment/, "Background"]
  ];
  return matches.find(([pattern]) => pattern.test(value))?.[1] ?? "Background";
}

function publicUrl(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/") || /^https:\/\//.test(value)) return value;
  return null;
}

function runtimeTargets(source: AssetProductionRecordSource) {
  if (source.runtimeTargets?.length) return [...new Set(source.runtimeTargets)].sort();
  return Object.keys(source.platformMappings || {}).filter((target) => target !== "source").sort();
}

export function createAssetProductionRecord(source: AssetProductionRecordSource): AssetProductionRecord {
  const status = normalizeStatus(source);
  const approvalStatus = normalizeApprovalStatus(source, status);
  const previewUrl = publicUrl(source.previewUrl);
  const thumbnailUrl = publicUrl(source.thumbnailUrl) || previewUrl;
  const sourceMasterId = source.sourceMasterId || (source.hasSourceMaster ? `${source.id}:source-master` : null);
  const usage = source.usageReferences || [];
  const canonicalOwnerId = usage[0]?.id || source.id;
  const approved = approvalStatus === "approved";
  const checksum = source.checksum || lightweightHash(`${source.id}:${source.artKey || source.name || "asset"}`);

  return {
    id: source.id,
    version: "1.0.0",
    status,
    canonicalOwnerId,
    assetType: normalizeAssetType(source),
    assetCategory: source.category || "Uncategorized",
    assetRole: source.type || "visual",
    promptId: source.prompt?.id || null,
    promptVersion: source.prompt?.version || null,
    renderProvider: source.prompt?.providerId || source.renderProvider || "legacy-import",
    generationSeed: source.generationSeed || null,
    sourceMasterId,
    approvedAssetId: approved ? source.id : null,
    previewAssetId: previewUrl ? `${source.id}:preview` : null,
    thumbnailAssetId: thumbnailUrl ? `${source.id}:thumbnail` : null,
    runtimeTargets: runtimeTargets(source),
    productionStatus: status,
    approvalStatus,
    history: source.history || [{
      id: `${source.id}:created`,
      eventType: "created",
      timestamp: source.createdAt || systemDate,
      actor: "studio",
      previousStatus: null,
      status,
      note: "Canonical production record established from the Studio Asset Registry."
    }],
    createdAt: source.createdAt || systemDate,
    updatedAt: source.updatedAt || systemDate,
    displayName: source.name || source.artKey || source.id,
    runtimeKey: source.artKey || source.id,
    previewUrl,
    thumbnailUrl,
    checksum,
    usage,
    prompt: source.prompt || null
  };
}

export function validateAssetProductionCatalog(records: AssetProductionRecord[]): AssetProductionValidation {
  const issues: AssetProductionValidationIssue[] = [];
  const ids = new Set<string>();
  const providerIds = new Set(renderProviderRegistry.map((provider) => provider.providerId));

  for (const record of records) {
    if (ids.has(record.id)) {
      issues.push({ severity: "error", code: "duplicate_asset", message: `Duplicate asset production record: ${record.id}.`, records: [record.id] });
    }
    ids.add(record.id);
    if (!record.canonicalOwnerId) {
      issues.push({ severity: "error", code: "missing_owner", message: `${record.id} is missing a canonical owner.`, records: [record.id] });
    }
    if (!providerIds.has(record.renderProvider)) {
      issues.push({ severity: "error", code: "missing_provider", message: `${record.id} references an unknown render provider.`, records: [record.id] });
    }
    const requiresPrompt = ["prompt_ready", "queued", "rendering", "generated", "awaiting_review"].includes(record.productionStatus) && record.renderProvider !== "legacy-import";
    if (requiresPrompt && !record.promptId) {
      issues.push({ severity: "error", code: "missing_prompt", message: `${record.id} requires a canonical prompt before it can move through rendering.`, records: [record.id] });
    }
    if (["approved", "published"].includes(record.productionStatus) && !record.sourceMasterId) {
      issues.push({ severity: "error", code: "missing_source_master", message: `${record.id} cannot be approved or published without a source master.`, records: [record.id] });
    }
    if (["approved", "published"].includes(record.productionStatus) && !record.previewAssetId) {
      issues.push({ severity: "error", code: "missing_preview", message: `${record.id} cannot be approved or published without a preview.`, records: [record.id] });
    }
    if (record.productionStatus === "published" && record.approvalStatus !== "approved") {
      issues.push({ severity: "error", code: "unapproved_publication", message: `${record.id} is published without approval.`, records: [record.id] });
    }
    if (record.productionStatus === "published" && !record.runtimeTargets.length) {
      issues.push({ severity: "error", code: "missing_runtime_asset", message: `${record.id} is published without a runtime target.`, records: [record.id] });
    }
    if (record.productionStatus === "stale") {
      issues.push({ severity: "warning", code: "stale_render", message: `${record.id} requires a current render or review.`, records: [record.id] });
    }
  }

  const hasErrors = issues.some((issue) => issue.severity === "error");
  const hasWarnings = issues.some((issue) => issue.severity === "warning");
  return { valid: !hasErrors, status: hasErrors ? "Blocked" : hasWarnings ? "Ready With Warnings" : "Ready", issues };
}

export function buildAssetProductionCatalog(sources: AssetProductionRecordSource[]): AssetProductionCatalog {
  const records = sources.map(createAssetProductionRecord).sort((left, right) => left.displayName.localeCompare(right.displayName) || left.id.localeCompare(right.id));
  return {
    id: ASSET_PRODUCTION_SYSTEM_ID,
    version: ASSET_PRODUCTION_SYSTEM_VERSION,
    records,
    renderProviders: renderProviderRegistry.map((provider) => ({ ...provider, supportedResolutions: [...provider.supportedResolutions], supportedAspectRatios: [...provider.supportedAspectRatios] })),
    lifecycle: assetProductionStatuses,
    previewModes: ["fit", "fill", "transparent", "black", "zoom", "compare_previous", "compare_approved"],
    searchFields: ["asset", "owner", "provider", "status", "category", "screen", "planet", "creature", "prompt"],
    validation: validateAssetProductionCatalog(records)
  };
}

const lifecycleTransitions: Record<CanonicalAssetProductionStatus, CanonicalAssetProductionStatus[]> = {
  planned: ["awaiting_prompt", "deprecated"],
  awaiting_prompt: ["prompt_ready", "deprecated"],
  prompt_ready: ["queued", "revision_required", "deprecated"],
  queued: ["rendering", "revision_required", "deprecated"],
  rendering: ["generated", "revision_required", "stale"],
  generated: ["awaiting_review", "revision_required", "stale"],
  awaiting_review: ["approved", "rejected", "revision_required", "stale"],
  approved: ["published", "revision_required", "stale", "deprecated"],
  rejected: ["revision_required", "deprecated"],
  revision_required: ["awaiting_prompt", "queued", "deprecated"],
  published: ["stale", "deprecated"],
  stale: ["awaiting_prompt", "queued", "awaiting_review", "deprecated"],
  deprecated: []
};

export function transitionAssetProductionRecord(record: AssetProductionRecord, nextStatus: CanonicalAssetProductionStatus, actor: string, note: string, reason?: string): AssetProductionRecord {
  if (!lifecycleTransitions[record.productionStatus].includes(nextStatus)) {
    throw new Error(`Invalid production transition: ${record.productionStatus} -> ${nextStatus}.`);
  }
  if (nextStatus === "published" && record.approvalStatus !== "approved") {
    throw new Error("Only approved assets can be published.");
  }
  const timestamp = new Date().toISOString();
  const eventType: AssetProductionHistoryEvent["eventType"] = nextStatus === "approved" ? "approved" : nextStatus === "rejected" ? "rejected" : nextStatus === "published" ? "published" : nextStatus === "generated" ? "generated" : "status_changed";
  return {
    ...record,
    status: nextStatus,
    productionStatus: nextStatus,
    approvalStatus: nextStatus === "approved" || nextStatus === "published" ? "approved" : nextStatus === "rejected" ? "rejected" : nextStatus === "revision_required" ? "revision_required" : record.approvalStatus,
    updatedAt: timestamp,
    history: [...record.history, { id: `${record.id}:${timestamp}`, eventType, timestamp, actor, previousStatus: record.productionStatus, status: nextStatus, note, reason }]
  };
}

export function searchAssetProductionRecords(records: AssetProductionRecord[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return records;
  return records.filter((record) => {
    const searchable = [
      record.id,
      record.displayName,
      record.canonicalOwnerId,
      record.renderProvider,
      record.status,
      record.assetCategory,
      record.assetType,
      record.promptId || "",
      ...record.usage.flatMap((usage) => [usage.type, usage.id, usage.name])
    ].join(" ").toLowerCase();
    return searchable.includes(normalized);
  });
}

function safeRuntimePath(value: string | null) {
  if (!value || /(^file:|\/Users\/|source-masters|studio-private:|private)/i.test(value)) return null;
  return publicUrl(value);
}

export function buildAssetProductionRuntimeManifest(assets: AssetDefinition[]): AssetProductionRuntimeManifest {
  const sources = assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    category: asset.category,
    artKey: asset.artKey,
    status: asset.status,
    productionStatus: asset.productionStatus,
    approvalStatus: asset.approvalStatus,
    previewUrl: safeRuntimePath(asset.previewUrl || null),
    thumbnailUrl: safeRuntimePath(asset.previewUrl || null),
    checksum: lightweightHash(`${asset.id}:${asset.artKey}:${asset.updatedAt || asset.status}`),
    sourceMasterId: asset.sourceFileName ? `${asset.id}:source-master` : null,
    runtimeTargets: Object.keys(asset.platformMappings || {}),
    platformMappings: asset.platformMappings,
    usageReferences: asset.usageReferences?.map((usage) => ({ type: usage.type, id: usage.id, name: usage.name })) || []
  }));
  const records = buildAssetProductionCatalog(sources).records;
  const runtimeAssets = records
    .filter((record) => record.approvalStatus === "approved" && ["approved", "published"].includes(record.productionStatus))
    .map((record) => ({
      id: record.approvedAssetId || record.id,
      version: record.version,
      runtimeKey: record.runtimeKey,
      preview: safeRuntimePath(record.previewUrl),
      thumbnail: safeRuntimePath(record.thumbnailUrl),
      checksum: record.checksum,
      runtimeTargets: record.runtimeTargets
    }))
    .sort((left, right) => left.runtimeKey.localeCompare(right.runtimeKey) || left.id.localeCompare(right.id));

  const manifest: AssetProductionRuntimeManifest = {
    id: ASSET_PRODUCTION_SYSTEM_ID,
    version: ASSET_PRODUCTION_SYSTEM_VERSION,
    status: "Ready",
    assets: runtimeAssets,
    publishingPolicy: "approved-assets-only",
    sourceOfTruth: "Project Genesis Studio"
  };
  return { ...manifest, status: validateAssetProductionRuntimeManifest(manifest).valid ? "Ready" : "Blocked" };
}

export function validateAssetProductionRuntimeManifest(manifest: AssetProductionRuntimeManifest): AssetProductionValidation {
  const issues: AssetProductionValidationIssue[] = [];
  const ids = new Set<string>();
  if (manifest.id !== ASSET_PRODUCTION_SYSTEM_ID || manifest.version !== ASSET_PRODUCTION_SYSTEM_VERSION) {
    issues.push({ severity: "error", code: "runtime_contract", message: "Asset production runtime manifest has an invalid contract identifier or version.", records: [manifest.id] });
  }
  for (const asset of manifest.assets) {
    if (ids.has(asset.id)) issues.push({ severity: "error", code: "runtime_duplicate_asset", message: `Duplicate runtime asset: ${asset.id}.`, records: [asset.id] });
    ids.add(asset.id);
    if (!asset.runtimeKey || !asset.checksum) issues.push({ severity: "error", code: "runtime_asset_invalid", message: `${asset.id} is missing a runtime key or checksum.`, records: [asset.id] });
    const serialized = JSON.stringify(asset);
    if (/source-masters|\/Users\/|studio-private:|positivePrompt|negativePrompt|combinedPrompt|history|approval/i.test(serialized)) {
      issues.push({ severity: "error", code: "runtime_private_data", message: `${asset.id} exposes production-only fields in runtime data.`, records: [asset.id] });
    }
  }
  const hasErrors = issues.some((issue) => issue.severity === "error");
  return { valid: !hasErrors, status: hasErrors ? "Blocked" : "Ready", issues };
}

export function buildUnityAssetProductionRuntimeExport(manifest: AssetProductionRuntimeManifest) {
  return {
    assetProductionRuntime: {
      ...manifest,
      unity: {
        manifest: "NoverisAssetProductionRuntime.json",
        loadingRule: "Load only approved Studio-published assets by runtimeKey.",
        sourceMasterAccess: false
      }
    }
  };
}
