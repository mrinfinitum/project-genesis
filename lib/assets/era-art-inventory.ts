import { civilizationAges } from "@/data/civilization-identity";
import { getGameData } from "@/lib/data";
import {
  getAssetProductionState,
  getAssetProductionRequirementMetadata,
  requirementProfiles,
  type AssetDerivativePreset,
  type AssetProductionState,
  type ProductionAsset
} from "@/lib/assets/asset-production";

type RequirementPriority = "low" | "medium" | "high" | "critical";

export type EraArtGroup =
  | "Era Identity"
  | "Research"
  | "Buildings"
  | "Resources"
  | "Events"
  | "Missions"
  | "UI"
  | "Audio/Video";

export type EraArtStatus =
  | "Missing"
  | "Source Uploaded"
  | "Draft"
  | "In Review"
  | "Approved"
  | "Published"
  | "Source Ready"
  | "Derivative Ready"
  | "Needs Review"
  | "Roblox Ready"
  | "Web Ready"
  | "Complete"
  | "Needs Roblox Mapping"
  | "Needs Web Publish";

export type EraArtRequirementCard = {
  id: string;
  eraId: string;
  eraName: string;
  group: EraArtGroup;
  assetName: string;
  canonicalAssetId: string;
  linkedAssetId: string | null;
  linkedObjectId: string;
  linkedObjectName: string;
  linkedObjectType: string;
  artKey: string;
  iconKey: string;
  requirementType: string;
  derivativeType: string;
  requirementProfileId: string;
  required: boolean;
  priority: RequirementPriority;
  dimensions: string;
  format: string;
  aspectRatio: string;
  derivativePreset: string;
  sourcePsdStatus: string;
  sourceVersion: string;
  derivativeStatus: string;
  approvalStatus: string;
  publishStatus: string;
  robloxMapping: string;
  webMapping: string;
  usageCount: number;
  status: EraArtStatus;
  completionPercent: number;
  previewUrl: string;
  assetId: string | null;
  latestDerivativeId: string;
  requiredDimensions: string;
  assignedArtist: string;
  dueDate: string;
  notes: string;
  currentSourceFilename: string;
  currentSourceFileId: string;
  sourceType: string;
  sourceVersionCount: number;
  previewStatus: string;
  derivativeCount: number;
  productionNotes: string;
  latestUpdateAt: string;
  engineReadiness: {
    web: string;
    roblox: string;
    unity: string;
    unreal: string;
    godot: string;
  };
  usageReferences: Array<{ type: string; id: string; name: string }>;
  readinessStage: string;
  dashboardPriorityGroup: string;
  placeholder: boolean;
};

export type EraArtInventory = {
  era: {
    id: string;
    eraNumber: number;
    name: string;
    displayName: string;
    shortDisplayName: string;
    description: string;
  };
  cards: EraArtRequirementCard[];
  groups: Array<{ group: EraArtGroup; total: number; required: number; complete: number; missing: number; draft: number; approved: number; published: number }>;
  summary: {
    completionPercent: number;
    artReadinessStatus: string;
    requiredAssetCount: number;
    completedAssetCount: number;
    missingAssetCount: number;
    draftCount: number;
    inReviewCount: number;
    approvedCount: number;
    publishedCount: number;
    requiredComplete: number;
    optionalComplete: number;
    optionalAssetCount: number;
    requiredCompletionPercent: number;
    optionalCompletionPercent: number;
    overallProductionCompletion: number;
    needsRobloxMapping: number;
    needsWebPublish: number;
    requiredLinkedCount: number;
    derivativeReadyCount: number;
    mappingIncompleteCount: number;
    placeholderCount: number;
  };
  checklist: Array<Record<string, string | number | boolean>>;
};

export type EraArtSummaryByEra = Record<string, {
  required: number;
  complete: number;
  missing: number;
  inReview: number;
  published: number;
  needsMapping: number;
  status: string;
}>;

const eraGroups: EraArtGroup[] = ["Era Identity", "Research", "Buildings", "Resources", "Events", "Missions", "UI", "Audio/Video"];

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\s+age$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function assetSlug(value: string) {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function normalizedKey(value: string) {
  return assetSlug(value).replace(/^(asset|icon|research|technology|resource|building|ui|dashboard|hud)_+/, "");
}

function displayEraName(value: string) {
  return value.replace(/\s+age$/i, "");
}

function eraIdFor(value: string) {
  const normalized = slug(value);
  if (normalized === "space") return "space-age";
  if (normalized === "village") return "ancient";
  if (normalized === "town") return "medieval";
  if (normalized === "city") return "renaissance";
  return normalized;
}

function profileFor(objectType: string) {
  return requirementProfiles.find((profile) => profile.objectType === objectType) ?? requirementProfiles.find((profile) => profile.objectType === "ui")!;
}

function presetById(state: AssetProductionState, presetId: string): AssetDerivativePreset | undefined {
  return state.derivativePresets.find((preset) => preset.id === presetId);
}

function assetForKey(assets: ProductionAsset[], key: string) {
  const normalized = assetSlug(key);
  return assets.find((asset) =>
    [asset.id, asset.artKey, asset.iconKey, asset.audioKey, asset.modelKey, ...asset.aliases]
      .filter(Boolean)
      .some((candidate) => assetSlug(candidate) === normalized)
  ) ?? null;
}

function keyMatchesAsset(asset: ProductionAsset, keys: Array<string | null | undefined>) {
  const assetKeys = [asset.id, asset.artKey, asset.iconKey, asset.audioKey, asset.modelKey, ...asset.aliases]
    .filter(Boolean)
    .map((value) => assetSlug(String(value)));
  const assetCoreKeys = assetKeys.map(normalizedKey);
  return keys.filter(Boolean).some((key) => {
    const normalized = assetSlug(String(key));
    const core = normalizedKey(String(key));
    return assetKeys.includes(normalized)
      || assetCoreKeys.includes(core)
      || assetCoreKeys.some((assetKey) => assetKey && core && (assetKey.endsWith(core) || core.endsWith(assetKey)));
  });
}

function bestDerivative(asset: ProductionAsset | null, requestedType?: string) {
  if (!asset) return null;
  const active = asset.derivatives.filter((derivative) => !derivative.archived);
  return active.find((derivative) => derivative.derivativeType === requestedType && derivative.approvalStatus === "approved" && derivative.publishStatus === "published")
    ?? active.find((derivative) => derivative.derivativeType === requestedType && derivative.approvalStatus === "approved")
    ?? active.find((derivative) => derivative.derivativeType === requestedType)
    ?? active.find((derivative) => derivative.approvalStatus === "approved" && derivative.publishStatus === "published")
    ?? active.find((derivative) => derivative.approvalStatus === "approved")
    ?? active[0]
    ?? null;
}

function sourceStatus(asset: ProductionAsset | null) {
  if (!asset?.sourceFiles.length) return "Missing";
  if (asset.sourceFiles.some((source) => [".psd", ".psb"].includes(source.extension))) return "PSD Uploaded";
  return "Source Uploaded";
}

function derivativeStatus(asset: ProductionAsset | null, derivativeType: string) {
  const derivative = bestDerivative(asset, derivativeType);
  if (!derivative) return "Missing";
  if (derivative.publishStatus === "published") return "Published";
  if (derivative.status.toLowerCase().includes("approved") || derivative.approvalStatus === "approved") return "Approved";
  return derivative.status || "Draft";
}

function webMapping(asset: ProductionAsset | null) {
  const mapping = asset?.platformMappings.web as { path?: string; status?: string } | undefined;
  return mapping?.path ?? mapping?.status ?? "";
}

function robloxMapping(asset: ProductionAsset | null) {
  const mapping = asset?.platformMappings.roblox as { assetId?: string; status?: string } | undefined;
  return mapping?.assetId ?? mapping?.status ?? "";
}

function statusFor(asset: ProductionAsset | null, derivativeType: string, required: boolean): EraArtStatus {
  if (!asset) return "Missing";
  if (!asset.sourceFiles.length) return "Missing";
  const derivative = bestDerivative(asset, derivativeType);
  if (!derivative) return asset.sourceFiles.length ? "Source Ready" : "Missing";
  const derivativeApproved = derivative.approvalStatus === "approved" || derivative.status.toLowerCase().includes("approved");
  const hasRoblox = Boolean(robloxMapping(asset));
  const hasWeb = Boolean(webMapping(asset));
  if (derivativeApproved && derivative.publishStatus === "published" && hasRoblox && hasWeb) return "Complete";
  if (asset.productionStatus === "published" || asset.status.toLowerCase() === "published") return "Published";
  if (asset.status.toLowerCase() === "review") return "In Review";
  if (!derivativeApproved) return "Needs Review";
  if (required && !hasRoblox) return "Needs Roblox Mapping";
  if (required && !hasWeb) return "Needs Web Publish";
  if (hasRoblox && !hasWeb) return "Roblox Ready";
  if (hasWeb && !hasRoblox) return "Web Ready";
  if (asset.approvalStatus === "approved" || derivativeApproved) {
    return "Approved";
  }
  return "Draft";
}

function statusLabel(value: string): EraArtStatus {
  if (value === "source_uploaded") return "Source Uploaded";
  if (value === "in_review") return "In Review";
  if (value === "approved") return "Approved";
  if (value === "published") return "Published";
  if (value === "changes_requested" || value === "in_progress" || value === "not_started") return "Draft";
  return "Missing";
}

function isComplete(card: EraArtRequirementCard) {
  return ["Approved", "Published", "Complete", "Roblox Ready", "Web Ready"].includes(card.status);
}

function resourceEraId(discoveryTier: string) {
  const tier = discoveryTier.toLowerCase();
  if (tier.includes("earth")) return "survival";
  if (tier.includes("planet")) return "modern";
  if (tier.includes("space")) return "space-age";
  if (tier.includes("interstellar") || tier.includes("deep")) return "interstellar";
  if (tier.includes("galactic") || tier.includes("genesis")) return "galactic";
  return "survival";
}

function cardFromRequirement(input: {
  state: AssetProductionState;
  metadata: Awaited<ReturnType<typeof getAssetProductionRequirementMetadata>>;
  eraId: string;
  eraName: string;
  group: EraArtGroup;
  linkedObjectId: string;
  linkedObjectName: string;
  linkedObjectType: string;
  key: string;
  fallbackName: string;
  requirement: { derivativeType: string; required: boolean; presetId: string; priority: RequirementPriority };
  assignedArtist?: string;
  dueDate?: string;
  notes?: string;
}): EraArtRequirementCard {
  const asset = assetForKey(input.state.assets, input.key);
  const cardId = `${input.eraId}:${input.group}:${input.linkedObjectType}:${input.linkedObjectId}:${input.requirement.derivativeType}`;
  const override = input.metadata.missingRequirements[cardId];
  const assignedAsset = override?.assetId ? input.state.assets.find((item) => item.id === override.assetId) ?? null : null;
  const resolvedAsset = assignedAsset ?? asset;
  const preset = presetById(input.state, input.requirement.presetId);
  const derivative = bestDerivative(resolvedAsset, input.requirement.derivativeType);
  const baseStatus = statusFor(resolvedAsset, input.requirement.derivativeType, input.requirement.required);
  const status = override?.status ? statusLabel(override.status) : baseStatus;
  const source = resolvedAsset?.sourceFiles.find((item) => item.isCurrent) ?? resolvedAsset?.sourceFiles[0];
  const sourceType = source?.extension ? source.extension.replace(".", "").toUpperCase() : "None";
  const sourceVersionCount = resolvedAsset?.sourceFiles.length ?? 0;
  const previewStatus = source?.previewStatus ?? (source?.previewUrl ? "ready" : "missing");
  const platformMappings = resolvedAsset?.platformMappings ?? {};
  const mappingStatus = (target: string) => platformMappings[target] ? "Ready" : input.requirement.required ? "Missing" : "Optional";
  return {
    id: cardId,
    eraId: input.eraId,
    eraName: input.eraName,
    group: input.group,
    assetName: resolvedAsset?.name ?? input.fallbackName,
    canonicalAssetId: resolvedAsset?.id ?? `asset_${assetSlug(input.key)}`,
    linkedAssetId: resolvedAsset?.id ?? null,
    linkedObjectId: input.linkedObjectId,
    linkedObjectName: input.linkedObjectName,
    linkedObjectType: input.linkedObjectType,
    artKey: resolvedAsset?.artKey || input.key,
    iconKey: resolvedAsset?.iconKey || input.key,
    requirementType: input.requirement.derivativeType,
    derivativeType: input.requirement.derivativeType,
    requirementProfileId: profileFor(input.linkedObjectType).id,
    required: input.requirement.required,
    priority: override?.priority ?? input.requirement.priority,
    dimensions: derivative?.width && derivative.height ? `${derivative.width} x ${derivative.height}` : preset ? `${preset.width} x ${preset.height}` : "TBD",
    format: derivative?.format || preset?.format || "TBD",
    aspectRatio: derivative?.aspectRatio || preset?.aspectRatio || "TBD",
    derivativePreset: preset?.name ?? input.requirement.presetId,
    sourcePsdStatus: sourceStatus(resolvedAsset),
    sourceVersion: source?.versionLabel ?? "None",
    derivativeStatus: derivativeStatus(resolvedAsset, input.requirement.derivativeType),
    approvalStatus: override?.approvalStatus ?? resolvedAsset?.approvalStatus ?? "pending",
    publishStatus: override?.publishStatus ?? derivative?.publishStatus ?? resolvedAsset?.productionStatus ?? "missing",
    robloxMapping: robloxMapping(resolvedAsset) || "Unmapped",
    webMapping: webMapping(resolvedAsset) || "Unpublished",
    usageCount: resolvedAsset?.usageReferences.length ?? 0,
    status,
    completionPercent: resolvedAsset?.completionPercent ?? 0,
    previewUrl: derivative?.publicUrl || resolvedAsset?.derivatives.find((item) => item.publicUrl)?.publicUrl || source?.previewUrl || "",
    assetId: resolvedAsset?.id ?? null,
    latestDerivativeId: derivative?.id ?? "",
    requiredDimensions: preset ? `${preset.width} x ${preset.height}` : "TBD",
    assignedArtist: override?.assignedArtist ?? input.assignedArtist ?? "",
    dueDate: override?.dueDate ?? input.dueDate ?? "",
    notes: override?.productionNotes ?? input.notes ?? "",
    currentSourceFilename: source?.filename ?? "No source",
    currentSourceFileId: source?.id ?? "",
    sourceType,
    sourceVersionCount,
    previewStatus,
    derivativeCount: resolvedAsset?.derivatives.length ?? 0,
    productionNotes: override?.productionNotes ?? input.notes ?? "",
    latestUpdateAt: resolvedAsset?.updatedAt || source?.uploadedAt || derivative?.generatedAt || "",
    engineReadiness: {
      web: mappingStatus("web"),
      roblox: mappingStatus("roblox"),
      unity: mappingStatus("unity"),
      unreal: mappingStatus("unreal"),
      godot: mappingStatus("godot")
    },
    usageReferences: resolvedAsset?.usageReferences ?? [],
    readinessStage: status,
    dashboardPriorityGroup: "",
    placeholder: false
  };
}

function addProfileCards(cards: EraArtRequirementCard[], input: {
  state: AssetProductionState;
  metadata: Awaited<ReturnType<typeof getAssetProductionRequirementMetadata>>;
  eraId: string;
  eraName: string;
  group: EraArtGroup;
  objectType: string;
  objectId: string;
  objectName: string;
  key: string;
  profileObjectType: string;
  fallbackPrefix?: string;
}) {
  const profile = profileFor(input.profileObjectType);
  for (const requirement of profile.requirements) {
    cards.push(cardFromRequirement({
      state: input.state,
      metadata: input.metadata,
      eraId: input.eraId,
      eraName: input.eraName,
      group: input.group,
      linkedObjectId: input.objectId,
      linkedObjectName: input.objectName,
      linkedObjectType: input.objectType,
      key: input.key,
      fallbackName: `${input.fallbackPrefix ?? input.objectName} ${requirement.derivativeType}`,
      requirement
    }));
  }
}

type ReconciledArtTarget = {
  eraId: string;
  group: EraArtGroup;
  linkedObjectId: string;
  linkedObjectName: string;
  linkedObjectType: string;
  requirementProfileId: string;
  requirementType: string;
  required: boolean;
  priority: RequirementPriority;
  dashboardPriorityGroup: string;
};

function importedAssetGroup(asset: ProductionAsset): EraArtGroup {
  const haystack = assetSlug([asset.category, asset.artKey, ...asset.usageReferences.flatMap((usage) => [usage.type, usage.id, usage.name])].join(" "));
  if (haystack.includes("event")) return "Events";
  if (haystack.includes("mission")) return "Missions";
  if (haystack.includes("resource")) return "Resources";
  if (haystack.includes("building")) return "Buildings";
  if (haystack.includes("research") || haystack.includes("upgrade") || haystack.includes("technology")) return "Research";
  return "UI";
}

function dashboardPriorityGroup(asset: ProductionAsset) {
  const haystack = assetSlug([asset.id, asset.artKey, asset.category, ...asset.usageReferences.flatMap((usage) => [usage.type, usage.id, usage.name])].join(" "));
  if (/civilization|crest|identity/.test(haystack)) return "civilization crest";
  if (/dashboard|hero|background/.test(haystack)) return "hero artwork";
  if (/top_bar|topbar|resource|credits|population|research|energy/.test(haystack)) return "HUD icons";
  if (/menu|navigation|sidebar|overview|buildings|events|galaxy|spaceport|upgrades|settings/.test(haystack)) return "navigation icons";
  if (/click|ring|interface|hand/.test(haystack)) return "click art";
  if (/auto|automation|robot/.test(haystack)) return "automation art";
  if (/critical|star/.test(haystack)) return "critical art";
  if (/era|progression|hex/.test(haystack)) return "era rail";
  if (/upgrade|technology|science/.test(haystack)) return "upgrade icons";
  if (/event/.test(haystack)) return "event art";
  if (/alignment/.test(haystack)) return "alignment icons";
  if (/boost/.test(haystack)) return "boost art";
  if (/panel|frame|decorative|hud/.test(haystack)) return "panel artwork";
  return "";
}

function importedRequirementType(asset: ProductionAsset) {
  const derivative = bestDerivative(asset);
  if (derivative?.derivativeType) return derivative.derivativeType;
  const category = assetSlug(asset.category);
  if (category.includes("icon")) return "icon";
  if (category.includes("button")) return "button";
  if (category.includes("panel")) return "card";
  if (category.includes("background")) return "background";
  return "card";
}

function requirementPresetFor(type: string) {
  if (type === "icon" || type === "button") return "research_icon";
  if (type === "background") return "era_background";
  if (type === "banner") return "era_banner";
  if (type === "hero") return "era_hero";
  return "research_card";
}

function canonicalArtTargets(asset: ProductionAsset, data: Awaited<ReturnType<typeof getGameData>>): ReconciledArtTarget[] {
  const targets: ReconciledArtTarget[] = [];
  const requirementType = importedRequirementType(asset);
  const priorityGroup = dashboardPriorityGroup(asset);
  const add = (target: Omit<ReconciledArtTarget, "requirementType" | "required" | "priority" | "dashboardPriorityGroup"> & Partial<Pick<ReconciledArtTarget, "required" | "priority" | "dashboardPriorityGroup">>) => {
    const key = `${target.eraId}:${target.group}:${target.linkedObjectType}:${target.linkedObjectId}:${requirementType}`;
    if (targets.some((item) => `${item.eraId}:${item.group}:${item.linkedObjectType}:${item.linkedObjectId}:${item.requirementType}` === key)) return;
    targets.push({
      ...target,
      requirementType,
      required: target.required ?? true,
      priority: target.priority ?? "high",
      dashboardPriorityGroup: target.dashboardPriorityGroup ?? priorityGroup
    });
  };

  for (const row of data.research) {
    const record = row as unknown as Record<string, string | null | undefined>;
    if (!keyMatchesAsset(asset, [row.id, row.icon_name, record.asset_id])) continue;
    add({
      eraId: eraIdFor(row.era),
      group: "Research",
      linkedObjectId: row.id,
      linkedObjectName: row.name,
      linkedObjectType: "research",
      requirementProfileId: "research_requirement_profile"
    });
  }

  for (const row of data.upgrades) {
    const record = row as unknown as Record<string, string | null | undefined>;
    if (!keyMatchesAsset(asset, [row.id, row.icon_name, record.asset_id])) continue;
    add({
      eraId: eraIdFor(row.era),
      group: "Research",
      linkedObjectId: row.id,
      linkedObjectName: row.name,
      linkedObjectType: "upgrade",
      requirementProfileId: "research_requirement_profile"
    });
  }

  for (const row of data.buildings) {
    const record = row as unknown as Record<string, string | null | undefined>;
    if (!keyMatchesAsset(asset, [row.id, row.icon_name, row.model_name, record.asset_id])) continue;
    add({
      eraId: eraIdFor(row.era),
      group: "Buildings",
      linkedObjectId: row.id,
      linkedObjectName: row.name,
      linkedObjectType: "building",
      requirementProfileId: "building_requirement_profile"
    });
  }

  for (const row of data.resource_catalog) {
    const record = row as unknown as Record<string, string | null | undefined>;
    if (!keyMatchesAsset(asset, [row.id, row.resource_name, record.icon_key, record.iconKey, record.art_key, record.artKey])) continue;
    add({
      eraId: resourceEraId(row.discovery_tier),
      group: "Resources",
      linkedObjectId: row.id,
      linkedObjectName: row.resource_name,
      linkedObjectType: "resource",
      requirementProfileId: "resource_requirement_profile"
    });
  }

  if (!targets.length && asset.platformMappings.roblox) {
    const usage = asset.usageReferences.find((item) => item.id || item.name);
    const group = importedAssetGroup(asset);
    add({
      eraId: "survival",
      group,
      linkedObjectId: usage?.id || asset.artKey,
      linkedObjectName: usage?.name || asset.name,
      linkedObjectType: group === "Events" ? "event" : group === "Missions" ? "mission" : group === "Resources" ? "resource" : group === "Buildings" ? "building" : group === "Research" ? "upgrade" : "ui",
      requirementProfileId: group === "Research" ? "research_requirement_profile" : group === "Resources" ? "resource_requirement_profile" : group === "Buildings" ? "building_requirement_profile" : "ui_requirement_profile",
      required: Boolean(priorityGroup),
      priority: priorityGroup ? "high" : "medium"
    });
  }

  return targets;
}

function cardFromImportedAsset(input: {
  state: AssetProductionState;
  metadata: Awaited<ReturnType<typeof getAssetProductionRequirementMetadata>>;
  asset: ProductionAsset;
  target: ReconciledArtTarget;
  eraName: string;
}): EraArtRequirementCard {
  const derivative = bestDerivative(input.asset, input.target.requirementType);
  const preset = presetById(input.state, requirementPresetFor(input.target.requirementType));
  const cardId = `${input.target.eraId}:Imported Roblox Art:${input.target.linkedObjectType}:${input.target.linkedObjectId}:${input.asset.id}:${input.target.requirementType}`;
  const override = input.metadata.missingRequirements[cardId];
  const status = override?.status ? statusLabel(override.status) : statusFor(input.asset, input.target.requirementType, input.target.required);
  const source = input.asset.sourceFiles.find((item) => item.isCurrent) ?? input.asset.sourceFiles[0];
  const sourceType = source?.extension ? source.extension.replace(".", "").toUpperCase() : "None";
  const previewStatus = source?.previewStatus ?? (source?.previewUrl ? "ready" : "missing");
  const platformMappings = input.asset.platformMappings ?? {};
  const mappingStatus = (target: string) => platformMappings[target] ? "Ready" : input.target.required ? "Missing" : "Optional";
  return {
    id: cardId,
    eraId: input.target.eraId,
    eraName: input.eraName,
    group: input.target.group,
    assetName: input.asset.name,
    canonicalAssetId: input.asset.id,
    linkedAssetId: input.asset.id,
    linkedObjectId: input.target.linkedObjectId,
    linkedObjectName: input.target.linkedObjectName,
    linkedObjectType: input.target.linkedObjectType,
    artKey: input.asset.artKey,
    iconKey: input.asset.iconKey || input.asset.artKey,
    requirementType: input.target.requirementType,
    derivativeType: input.target.requirementType,
    requirementProfileId: input.target.requirementProfileId,
    required: input.target.required,
    priority: override?.priority ?? input.target.priority,
    dimensions: derivative?.width && derivative.height ? `${derivative.width} x ${derivative.height}` : preset ? `${preset.width} x ${preset.height}` : "TBD",
    format: derivative?.format || preset?.format || "TBD",
    aspectRatio: derivative?.aspectRatio || preset?.aspectRatio || "TBD",
    derivativePreset: preset?.name ?? input.target.requirementType,
    sourcePsdStatus: sourceStatus(input.asset),
    sourceVersion: source?.versionLabel ?? "None",
    derivativeStatus: derivativeStatus(input.asset, input.target.requirementType),
    approvalStatus: override?.approvalStatus ?? input.asset.approvalStatus ?? "pending",
    publishStatus: override?.publishStatus ?? derivative?.publishStatus ?? input.asset.productionStatus ?? "missing",
    robloxMapping: robloxMapping(input.asset) || "Unmapped",
    webMapping: webMapping(input.asset) || "Unpublished",
    usageCount: input.asset.usageReferences.length,
    status,
    completionPercent: isComplete({ status } as EraArtRequirementCard) ? 100 : input.asset.completionPercent,
    previewUrl: derivative?.publicUrl || input.asset.derivatives.find((item) => item.publicUrl)?.publicUrl || source?.previewUrl || "",
    assetId: input.asset.id,
    latestDerivativeId: derivative?.id ?? "",
    requiredDimensions: preset ? `${preset.width} x ${preset.height}` : "TBD",
    assignedArtist: override?.assignedArtist ?? "",
    dueDate: override?.dueDate ?? "",
    notes: override?.productionNotes ?? "Reconciled from imported Roblox art manifest usage.",
    currentSourceFilename: source?.filename ?? "No source",
    currentSourceFileId: source?.id ?? "",
    sourceType,
    sourceVersionCount: input.asset.sourceFiles.length,
    previewStatus,
    derivativeCount: input.asset.derivatives.length,
    productionNotes: override?.productionNotes ?? "Reconciled from imported Roblox art manifest usage.",
    latestUpdateAt: input.asset.updatedAt || source?.uploadedAt || derivative?.generatedAt || "",
    engineReadiness: {
      web: mappingStatus("web"),
      roblox: mappingStatus("roblox"),
      unity: mappingStatus("unity"),
      unreal: mappingStatus("unreal"),
      godot: mappingStatus("godot")
    },
    usageReferences: input.asset.usageReferences,
    readinessStage: status,
    dashboardPriorityGroup: input.target.dashboardPriorityGroup,
    placeholder: false
  };
}

function cardFromPlaceholder(input: {
  placeholder: { asset: string; usage: string; replacementRequired: string };
  eraId: string;
  eraName: string;
}): EraArtRequirementCard {
  const linkedObjectId = input.placeholder.usage || input.placeholder.asset || "placeholder";
  return {
    id: `${input.eraId}:Placeholder:${linkedObjectId}:${assetSlug(input.placeholder.replacementRequired)}`,
    eraId: input.eraId,
    eraName: input.eraName,
    group: "UI",
    assetName: `Placeholder replacement: ${linkedObjectId}`,
    canonicalAssetId: "rbxassetid://0",
    linkedAssetId: null,
    linkedObjectId,
    linkedObjectName: linkedObjectId,
    linkedObjectType: "placeholder",
    artKey: "placeholder",
    iconKey: "placeholder",
    requirementType: "replacement",
    derivativeType: "replacement",
    requirementProfileId: "ui_requirement_profile",
    required: true,
    priority: "high",
    dimensions: "TBD",
    format: "PNG/WebP",
    aspectRatio: "TBD",
    derivativePreset: "Replacement Art",
    sourcePsdStatus: "Missing",
    sourceVersion: "None",
    derivativeStatus: "Missing",
    approvalStatus: "pending",
    publishStatus: "missing",
    robloxMapping: "Placeholder",
    webMapping: "Unpublished",
    usageCount: input.placeholder.usage ? 1 : 0,
    status: "Missing",
    completionPercent: 0,
    previewUrl: "",
    assetId: null,
    latestDerivativeId: "",
    requiredDimensions: "TBD",
    assignedArtist: "",
    dueDate: "",
    notes: input.placeholder.replacementRequired,
    currentSourceFilename: "No source",
    currentSourceFileId: "",
    sourceType: "None",
    sourceVersionCount: 0,
    previewStatus: "missing",
    derivativeCount: 0,
    productionNotes: input.placeholder.replacementRequired,
    latestUpdateAt: "",
    engineReadiness: {
      web: "Missing",
      roblox: "Placeholder",
      unity: "Missing",
      unreal: "Missing",
      godot: "Missing"
    },
    usageReferences: input.placeholder.usage ? [{ type: "placeholder", id: input.placeholder.usage, name: input.placeholder.usage }] : [],
    readinessStage: "Missing",
    dashboardPriorityGroup: "replacement needed",
    placeholder: true
  };
}

export async function getEraArtInventory(eraId: string): Promise<EraArtInventory | null> {
  const normalizedEraId = eraIdFor(eraId);
  const [state, data, metadata] = await Promise.all([getAssetProductionState(), getGameData(), getAssetProductionRequirementMetadata()]);
  const eraIndex = civilizationAges.findIndex((era) => eraIdFor(era.name) === normalizedEraId);
  const era = civilizationAges[eraIndex];
  if (!era) return null;

  const eraName = normalizedEraId === "space-age" ? "Space Age" : displayEraName(era.name);
  const cards: EraArtRequirementCard[] = [];
  const eraProfile = profileFor("era");
  const eraKey = `${normalizedEraId}_era`;

  for (const requirement of eraProfile.requirements) {
    const group: EraArtGroup = ["music", "ambient", "cinematic"].includes(requirement.derivativeType) ? "Audio/Video" : "Era Identity";
    cards.push(cardFromRequirement({
      state,
      metadata,
      eraId: normalizedEraId,
      eraName,
      group,
      linkedObjectId: normalizedEraId,
      linkedObjectName: eraName,
      linkedObjectType: "era",
      key: eraKey,
      fallbackName: `${eraName} ${requirement.derivativeType}`,
      requirement
    }));
  }

  const researchRows = data.research.filter((row) => eraIdFor(row.era) === normalizedEraId);
  for (const row of researchRows) {
    addProfileCards(cards, {
      state,
      metadata,
      eraId: normalizedEraId,
      eraName,
      group: "Research",
      objectType: "research",
      objectId: row.id,
      objectName: row.name,
      key: row.icon_name || row.id,
      profileObjectType: "research"
    });
  }

  const buildingRows = data.buildings.filter((row) => eraIdFor(row.era) === normalizedEraId);
  for (const row of buildingRows) {
    addProfileCards(cards, {
      state,
      metadata,
      eraId: normalizedEraId,
      eraName,
      group: "Buildings",
      objectType: "building",
      objectId: row.id,
      objectName: row.name,
      key: row.model_name || row.icon_name || row.id,
      profileObjectType: "building"
    });
  }

  const resourceRows = data.resource_catalog.filter((row) => resourceEraId(row.discovery_tier) === normalizedEraId);
  for (const row of resourceRows) {
    addProfileCards(cards, {
      state,
      metadata,
      eraId: normalizedEraId,
      eraName,
      group: "Resources",
      objectType: "resource",
      objectId: row.id,
      objectName: row.resource_name,
      key: row.id,
      profileObjectType: "resource"
    });
  }

  const uiRequirements = [
    { derivativeType: "hud", required: false, presetId: "era_icon", priority: "medium" as const, label: "Era HUD Treatment" },
    { derivativeType: "badge", required: true, presetId: "era_icon", priority: "high" as const, label: "Era Badge" },
    { derivativeType: "progression-node", required: true, presetId: "era_timeline_card", priority: "high" as const, label: "Progression Node Art" },
    { derivativeType: "locked-state", required: false, presetId: "era_timeline_card", priority: "medium" as const, label: "Locked State Art" },
    { derivativeType: "active-era-treatment", required: true, presetId: "era_timeline_card", priority: "high" as const, label: "Active Era Treatment" }
  ];
  for (const requirement of uiRequirements) {
    cards.push(cardFromRequirement({
      state,
      metadata,
      eraId: normalizedEraId,
      eraName,
      group: "UI",
      linkedObjectId: `${normalizedEraId}-${requirement.derivativeType}`,
      linkedObjectName: requirement.label,
      linkedObjectType: "ui",
      key: `${normalizedEraId}_${assetSlug(requirement.derivativeType)}`,
      fallbackName: `${eraName} ${requirement.label}`,
      requirement
    }));
  }

  for (const group of ["Events", "Missions"] as EraArtGroup[]) {
    const base = group === "Events" ? "event" : "mission";
    const groupRequirements = [
      { derivativeType: "card", required: false, presetId: "research_card", priority: "medium" as const },
      { derivativeType: "banner", required: false, presetId: "era_banner", priority: "medium" as const },
      { derivativeType: "icon", required: false, presetId: "research_icon", priority: "medium" as const }
    ];
    for (const requirement of groupRequirements) {
      cards.push(cardFromRequirement({
        state,
        metadata,
        eraId: normalizedEraId,
        eraName,
        group,
        linkedObjectId: `${normalizedEraId}-${base}-${requirement.derivativeType}`,
        linkedObjectName: `${eraName} ${group.slice(0, -1)} ${requirement.derivativeType}`,
        linkedObjectType: base,
        key: `${normalizedEraId}_${base}_${requirement.derivativeType}`,
        fallbackName: `${eraName} ${group.slice(0, -1)} ${requirement.derivativeType}`,
        requirement
      }));
    }
  }

  const reconciledCards = new Map<string, EraArtRequirementCard>();
  const eraNamesById = new Map(civilizationAges.map((item) => [eraIdFor(item.name), eraIdFor(item.name) === "space-age" ? "Space Age" : displayEraName(item.name)]));
  for (const asset of state.assets.filter((item) => item.platformMappings.roblox)) {
    for (const target of canonicalArtTargets(asset, data)) {
      if (target.eraId !== normalizedEraId) continue;
      const card = cardFromImportedAsset({
        state,
        metadata,
        asset,
        target,
        eraName: eraNamesById.get(target.eraId) ?? eraName
      });
      reconciledCards.set(card.id, card);
    }
  }
  cards.push(...reconciledCards.values());

  if (normalizedEraId === "survival") {
    for (const placeholder of state.robloxManifestReports[0]?.placeholderAssets ?? []) {
      cards.push(cardFromPlaceholder({ placeholder, eraId: normalizedEraId, eraName }));
    }
  }

  const activeCards = cards.filter((card) => !metadata.missingRequirements[card.id]?.notRequired);
  const requiredCards = activeCards.filter((card) => card.required);
  const optionalCards = activeCards.filter((card) => !card.required);
  const completedRequired = requiredCards.filter(isComplete);
  const completedOptional = optionalCards.filter(isComplete);
  const missingCards = activeCards.filter((card) => card.status === "Missing");
  const draftCards = activeCards.filter((card) => card.status === "Draft" || card.status === "Source Uploaded");
  const inReviewCards = activeCards.filter((card) => card.status === "In Review");
  const approvedCards = activeCards.filter((card) => card.status === "Approved" || card.status === "Needs Roblox Mapping" || card.status === "Needs Web Publish");
  const publishedCards = activeCards.filter((card) => card.status === "Published");
  const linkedCards = activeCards.filter((card) => card.linkedAssetId);
  const derivativeReadyCards = activeCards.filter((card) => !["Missing", "Source Uploaded", "Source Ready"].includes(card.status) && card.derivativeStatus !== "Missing");
  const mappingIncompleteCards = activeCards.filter((card) => card.required && (card.status === "Needs Roblox Mapping" || card.status === "Needs Web Publish" || card.robloxMapping === "Unmapped" || card.webMapping === "Unpublished"));
  const placeholderCards = activeCards.filter((card) => card.placeholder);
  const requiredCompletionPercent = requiredCards.length ? Math.round((completedRequired.length / requiredCards.length) * 100) : 100;
  const optionalCompletionPercent = optionalCards.length ? Math.round((completedOptional.length / optionalCards.length) * 100) : 100;
  const overallProductionCompletion = activeCards.length ? Math.round(((completedRequired.length + completedOptional.length) / activeCards.length) * 100) : 100;

  const groups = eraGroups.map((group) => {
    const groupCards = activeCards.filter((card) => card.group === group);
    return {
      group,
      total: groupCards.length,
      required: groupCards.filter((card) => card.required).length,
      complete: groupCards.filter(isComplete).length,
      missing: groupCards.filter((card) => card.status === "Missing").length,
      draft: groupCards.filter((card) => card.status === "Draft" || card.status === "Source Uploaded").length,
      approved: groupCards.filter((card) => ["Approved", "Needs Roblox Mapping", "Needs Web Publish"].includes(card.status)).length,
      published: groupCards.filter((card) => card.status === "Published").length
    };
  });

  return {
    era: {
      id: normalizedEraId,
      eraNumber: eraIndex + 1,
      name: eraName,
      displayName: eraName,
      shortDisplayName: eraName === "Space Age" ? "Space" : eraName,
      description: era.description
    },
    cards: activeCards,
    groups,
    summary: {
      completionPercent: requiredCompletionPercent,
      artReadinessStatus: requiredCompletionPercent === 100 ? "Ready" : missingCards.length ? "Needs Art" : "In Production",
      requiredAssetCount: requiredCards.length,
      completedAssetCount: completedRequired.length,
      missingAssetCount: missingCards.length,
      draftCount: draftCards.length,
      inReviewCount: inReviewCards.length,
      approvedCount: approvedCards.length,
      publishedCount: publishedCards.length,
      requiredComplete: completedRequired.length,
      optionalComplete: completedOptional.length,
      optionalAssetCount: optionalCards.length,
      requiredCompletionPercent,
      optionalCompletionPercent,
      overallProductionCompletion,
      needsRobloxMapping: activeCards.filter((card) => card.status === "Needs Roblox Mapping" || card.robloxMapping === "Unmapped").length,
      needsWebPublish: activeCards.filter((card) => card.status === "Needs Web Publish" || card.webMapping === "Unpublished").length,
      requiredLinkedCount: requiredCards.filter((card) => card.linkedAssetId).length,
      derivativeReadyCount: derivativeReadyCards.length,
      mappingIncompleteCount: mappingIncompleteCards.length,
      placeholderCount: placeholderCards.length
    },
    checklist: activeCards.map((card) => ({
      era: eraName,
      group: card.group,
      linkedObject: `${card.linkedObjectType}:${card.linkedObjectId}`,
      assetRequirement: card.assetName,
      required: card.required,
      dimensions: card.requiredDimensions,
      format: card.format,
      status: card.status,
      sourceStatus: card.sourcePsdStatus,
      approvalStatus: card.approvalStatus,
      robloxMapping: card.robloxMapping,
      webMapping: card.webMapping,
      assignedArtist: card.assignedArtist,
      dueDate: card.dueDate,
      notes: card.notes,
      currentSourceFilename: card.currentSourceFilename,
      sourceVersionCount: card.sourceVersionCount,
      derivativeCount: card.derivativeCount,
      engineReadiness: JSON.stringify(card.engineReadiness),
      linkedAssetId: card.linkedAssetId ?? "",
      requirementProfileId: card.requirementProfileId,
      dashboardPriorityGroup: card.dashboardPriorityGroup,
      readinessStage: card.readinessStage,
      placeholder: card.placeholder
    }))
  };
}

export async function getEraArtSummaryByEra(): Promise<EraArtSummaryByEra> {
  const inventories = await Promise.all(civilizationAges.map((era) => getEraArtInventory(eraIdFor(era.name))));
  return Object.fromEntries(inventories.filter(Boolean).map((inventory) => [
    inventory!.era.id,
    {
      required: inventory!.summary.requiredAssetCount,
      complete: inventory!.summary.requiredComplete,
      missing: inventory!.summary.missingAssetCount,
      inReview: inventory!.summary.inReviewCount,
      published: inventory!.summary.publishedCount,
      needsMapping: inventory!.summary.needsRobloxMapping + inventory!.summary.needsWebPublish,
      status: inventory!.summary.artReadinessStatus
    }
  ]));
}
