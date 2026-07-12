import { civilizationAges } from "@/data/civilization-identity";
import { getGameData } from "@/lib/data";
import {
  getAssetProductionState,
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
  | "Needs Roblox Mapping"
  | "Needs Web Publish";

export type EraArtRequirementCard = {
  id: string;
  eraId: string;
  eraName: string;
  group: EraArtGroup;
  assetName: string;
  canonicalAssetId: string;
  linkedObjectId: string;
  linkedObjectName: string;
  linkedObjectType: string;
  artKey: string;
  iconKey: string;
  requirementType: string;
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
  requiredDimensions: string;
  assignedArtist: string;
  dueDate: string;
  notes: string;
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
  };
  checklist: Array<Record<string, string | number | boolean>>;
};

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

function displayEraName(value: string) {
  return value.replace(/\s+age$/i, "");
}

function eraIdFor(value: string) {
  const normalized = slug(value);
  if (normalized === "space") return "space-age";
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

function sourceStatus(asset: ProductionAsset | null) {
  if (!asset?.sourceFiles.length) return "Missing";
  if (asset.sourceFiles.some((source) => [".psd", ".psb"].includes(source.extension))) return "PSD Uploaded";
  return "Source Uploaded";
}

function derivativeStatus(asset: ProductionAsset | null, derivativeType: string) {
  const derivative = asset?.derivatives.find((item) => item.derivativeType === derivativeType);
  if (!derivative) return "Missing";
  if (derivative.status.toLowerCase().includes("approved")) return "Approved";
  if (derivative.publishStatus === "published") return "Published";
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
  if (!asset.sourceFiles.length && !asset.derivatives.length) return "Missing";
  if (asset.productionStatus === "published" || asset.status.toLowerCase() === "published") return "Published";
  if (!asset.derivatives.some((derivative) => derivative.derivativeType === derivativeType)) return asset.sourceFiles.length ? "Source Uploaded" : "Missing";
  if (asset.status.toLowerCase() === "review") return "In Review";
  if (asset.approvalStatus === "approved") {
    if (required && !robloxMapping(asset)) return "Needs Roblox Mapping";
    if (required && !webMapping(asset)) return "Needs Web Publish";
    return "Approved";
  }
  return "Draft";
}

function isComplete(card: EraArtRequirementCard) {
  return ["Approved", "Published", "Needs Roblox Mapping", "Needs Web Publish"].includes(card.status);
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
  const preset = presetById(input.state, input.requirement.presetId);
  const derivative = asset?.derivatives.find((item) => item.derivativeType === input.requirement.derivativeType);
  const status = statusFor(asset, input.requirement.derivativeType, input.requirement.required);
  const source = asset?.sourceFiles.find((item) => item.isCurrent) ?? asset?.sourceFiles[0];
  return {
    id: `${input.eraId}:${input.group}:${input.linkedObjectType}:${input.linkedObjectId}:${input.requirement.derivativeType}`,
    eraId: input.eraId,
    eraName: input.eraName,
    group: input.group,
    assetName: asset?.name ?? input.fallbackName,
    canonicalAssetId: asset?.id ?? `asset_${assetSlug(input.key)}`,
    linkedObjectId: input.linkedObjectId,
    linkedObjectName: input.linkedObjectName,
    linkedObjectType: input.linkedObjectType,
    artKey: asset?.artKey || input.key,
    iconKey: asset?.iconKey || input.key,
    requirementType: input.requirement.derivativeType,
    required: input.requirement.required,
    priority: input.requirement.priority,
    dimensions: derivative?.width && derivative.height ? `${derivative.width} x ${derivative.height}` : preset ? `${preset.width} x ${preset.height}` : "TBD",
    format: derivative?.format || preset?.format || "TBD",
    aspectRatio: derivative?.aspectRatio || preset?.aspectRatio || "TBD",
    derivativePreset: preset?.name ?? input.requirement.presetId,
    sourcePsdStatus: sourceStatus(asset),
    sourceVersion: source?.versionLabel ?? "None",
    derivativeStatus: derivativeStatus(asset, input.requirement.derivativeType),
    approvalStatus: asset?.approvalStatus ?? "pending",
    publishStatus: derivative?.publishStatus ?? asset?.productionStatus ?? "missing",
    robloxMapping: robloxMapping(asset) || "Unmapped",
    webMapping: webMapping(asset) || "Unpublished",
    usageCount: asset?.usageReferences.length ?? 0,
    status,
    completionPercent: asset?.completionPercent ?? 0,
    previewUrl: derivative?.publicUrl || asset?.derivatives.find((item) => item.publicUrl)?.publicUrl || source?.previewUrl || "",
    assetId: asset?.id ?? null,
    requiredDimensions: preset ? `${preset.width} x ${preset.height}` : "TBD",
    assignedArtist: input.assignedArtist ?? "",
    dueDate: input.dueDate ?? "",
    notes: input.notes ?? ""
  };
}

function addProfileCards(cards: EraArtRequirementCard[], input: {
  state: AssetProductionState;
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

export async function getEraArtInventory(eraId: string): Promise<EraArtInventory | null> {
  const normalizedEraId = eraIdFor(eraId);
  const [state, data] = await Promise.all([getAssetProductionState(), getGameData()]);
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

  const requiredCards = cards.filter((card) => card.required);
  const optionalCards = cards.filter((card) => !card.required);
  const completedRequired = requiredCards.filter(isComplete);
  const completedOptional = optionalCards.filter(isComplete);
  const missingCards = cards.filter((card) => card.status === "Missing");
  const draftCards = cards.filter((card) => card.status === "Draft" || card.status === "Source Uploaded");
  const inReviewCards = cards.filter((card) => card.status === "In Review");
  const approvedCards = cards.filter((card) => card.status === "Approved" || card.status === "Needs Roblox Mapping" || card.status === "Needs Web Publish");
  const publishedCards = cards.filter((card) => card.status === "Published");
  const requiredCompletionPercent = requiredCards.length ? Math.round((completedRequired.length / requiredCards.length) * 100) : 100;
  const optionalCompletionPercent = optionalCards.length ? Math.round((completedOptional.length / optionalCards.length) * 100) : 100;
  const overallProductionCompletion = cards.length ? Math.round(((completedRequired.length + completedOptional.length) / cards.length) * 100) : 100;

  const groups = eraGroups.map((group) => {
    const groupCards = cards.filter((card) => card.group === group);
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
    cards,
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
      needsRobloxMapping: cards.filter((card) => card.status === "Needs Roblox Mapping" || card.robloxMapping === "Unmapped").length,
      needsWebPublish: cards.filter((card) => card.status === "Needs Web Publish" || card.webMapping === "Unpublished").length
    },
    checklist: cards.map((card) => ({
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
      notes: card.notes
    }))
  };
}

export async function getEraArtSummaryByEra() {
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
