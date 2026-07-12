import { createHash } from "node:crypto";
import { getGameData } from "@/lib/data";
import { getGameArtImportWorkspaceState, getMergedAssetLibraryRows } from "@/lib/assets/game-art-import";

type Row = Record<string, unknown>;

export type AssetProductionStatus =
  | "not_started"
  | "source_uploaded"
  | "processing"
  | "derivatives_ready"
  | "mapping_required"
  | "ready_to_publish"
  | "published"
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
};

export type AssetDerivativePreset = {
  id: string;
  name: string;
  category: string;
  derivativeType: string;
  width: number;
  height: number;
  aspectRatio: string;
  format: "PNG" | "WebP" | "JPG" | "SVG";
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
};

export type AssetProductionState = {
  assets: ProductionAsset[];
  sourceFiles: SourceFileRecord[];
  generatedAssets: ProductionAsset[];
  publishedAssets: ProductionAsset[];
  missingRequirements: MissingAssetRequirement[];
  processingJobs: ProcessingJobRecord[];
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
  { id: "era_banner", name: "Era Banner", category: "eras", derivativeType: "banner", width: 1920, height: 640, aspectRatio: "3:1", format: "WebP", required: true },
  { id: "loading_screen", name: "Loading Screen", category: "ui", derivativeType: "loading", width: 1920, height: 1080, aspectRatio: "16:9", format: "WebP", required: false }
];

export const requirementProfiles: AssetRequirementProfile[] = [
  { id: "planet_requirement_profile", objectType: "planet", label: "Planet", requirements: requirements(["planet_icon", "planet_card", "planet_hero"], "high") },
  { id: "resource_requirement_profile", objectType: "resource", label: "Resource", requirements: requirements(["resource_icon", "resource_card"], "medium") },
  { id: "building_requirement_profile", objectType: "building", label: "Building", requirements: requirements(["building_card", "building_hero"], "high") },
  { id: "research_requirement_profile", objectType: "research", label: "Research", requirements: requirements(["research_icon", "research_card"], "medium") },
  { id: "era_requirement_profile", objectType: "era", label: "Era", requirements: requirements(["era_banner"], "high") },
  { id: "galaxy_requirement_profile", objectType: "galaxy", label: "Galaxy", requirements: requirements(["planet_card", "planet_hero"], "medium") },
  { id: "sector_requirement_profile", objectType: "sector", label: "Sector", requirements: requirements(["planet_card", "planet_hero"], "medium") },
  { id: "star_system_requirement_profile", objectType: "star_system", label: "Star System", requirements: requirements(["planet_card", "planet_hero"], "medium") },
  { id: "ui_requirement_profile", objectType: "ui", label: "UI", requirements: requirements(["loading_screen"], "low") }
];

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
    status: text(row.status, "draft")
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

function productionAssetFor(row: Row, usage: Awaited<ReturnType<typeof getMergedAssetLibraryRows>>["usage"]): ProductionAsset {
  const sourceFile = sourceFileFor(row);
  const sourceFiles = sourceFile ? [sourceFile] : [];
  const derivative = derivativeFor(row, sourceFile?.id ?? null);
  const derivatives = derivative ? [derivative] : [];
  const profile = profileForCategory(rowCategory(row));
  const readiness = completion(profile, derivatives);
  const status = text(row.status ?? row.export_status, "draft");

  return {
    id: text(row.id),
    name: text(row.name, text(row.id)),
    type: text(row.type, "image"),
    category: text(row.category, "game-assets"),
    artKey: artKeyFor(row),
    iconKey: iconKeyFor(row),
    audioKey: text(row.audio_key ?? row.audioKey),
    modelKey: text(row.model_key ?? row.modelKey),
    description: text(row.description ?? row.prompt),
    status,
    productionStatus: productionStatusFor(row, sourceFiles, derivatives, readiness.missing),
    approvalStatus: approvalStatusFor(row),
    sourceFiles,
    variants: derivatives,
    derivatives,
    platformMappings: (row.platform_mappings ?? row.platformMappings ?? {}) as Record<string, unknown>,
    usageReferences: usageForAsset(row, usage),
    requirementProfileId: profile.id,
    tags: list(row.tags),
    aliases: list(row.aliases),
    notes: text(row.notes),
    completionPercent: readiness.percent,
    missingRequirements: readiness.missing,
    createdAt: text(row.created_at ?? row.imported_at),
    updatedAt: text(row.updated_at ?? row.imported_at),
    approvedAt: text(row.approved_at),
    publishedAt: text(row.published_at)
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
  const [{ rows, usage }, data, importState] = await Promise.all([getMergedAssetLibraryRows(), getGameData(), getGameArtImportWorkspaceState()]);
  const assets = rows.map((row) => productionAssetFor(row, usage)).sort((left, right) => left.name.localeCompare(right.name));
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
      const missing = missingForRecord({ objectType: category, objectId: record.id, objectName: record.name, key: record.key, profile, assets });
      missingRequirements.push(...missing);
      return { missing };
    });
    return auditRows(category, checked, profile);
  });

  const processingJobs = processingJobsFor(assets);
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
    importHistory: importState.history,
    derivativePresets,
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
