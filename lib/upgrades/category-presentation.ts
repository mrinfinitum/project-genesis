import type { ProductionAsset } from "@/lib/assets/asset-production";

export const upgradeCategoryIds = ["workforce", "industry", "science", "technology"] as const;
export type UpgradeCategoryId = typeof upgradeCategoryIds[number];

export type UpgradeCategoryPresentation = {
  backgroundArtKey: string;
  fallbackBackgroundArtKey: string;
  selectedTabArtKey: string | null;
  iconArtKey: string | null;
};

export type UpgradeCategoryAssetRecord = {
  categoryId: UpgradeCategoryId;
  displayName: string;
  groupPath: ["UI", "Dashboard", "Upgrade Categories"];
  role: "Category Background";
  semanticAssetKey: string;
  fallbackArtKey: string;
  sourcePolicy: string;
  expectedDimensions: {
    masterWidth: number;
    masterHeight: number;
    rendered4kBounds: { x: number; y: number; width: number; height: number };
    derived1080Bounds: { x: number; y: number; width: number; height: number };
    contentSafeRegion: { x: number; y: number; width: number; height: number };
    tabRegion: { x: number; y: number; width: number; height: number };
    rowOrigin: { x: number; y: number };
    cropMode: "cover";
    registrationPoint: "top-left";
    alphaBehavior: "preserve";
  };
  derivativeRequirements: string[];
  acceptedSourceFormats: string[];
  transparencyRequired: boolean;
  uploadDefaults: {
    assetRole: "Category Background";
    approvalState: "Needs Review";
    sourceVersion: 1;
  };
};

const displayNames: Record<UpgradeCategoryId, string> = {
  workforce: "Workforce",
  industry: "Industry",
  science: "Science",
  technology: "Technology"
};

export const upgradeCategoryBackgroundKeys: Record<UpgradeCategoryId, string> = {
  workforce: "upgrade_panel_workforce_background",
  industry: "upgrade_panel_industry_background",
  science: "upgrade_panel_science_background",
  technology: "upgrade_panel_technology_background"
};

export const upgradeCategorySelectedTabKeys: Record<UpgradeCategoryId, string> = {
  workforce: "upgrade_tab_workforce_selected",
  industry: "upgrade_tab_industry_selected",
  science: "upgrade_tab_science_selected",
  technology: "upgrade_tab_technology_selected"
};

export const upgradeCategoryIconKeys: Record<UpgradeCategoryId, string> = {
  workforce: "upgrade_category_workforce_icon",
  industry: "upgrade_category_industry_icon",
  science: "upgrade_category_science_icon",
  technology: "upgrade_category_technology_icon"
};

export const upgradePanelSharedFallbackArtKey = "upgrade_panel_shared_background";

export const upgradeCategoryBackgroundDimensions = {
  masterWidth: 3244,
  masterHeight: 1804,
  rendered4kBounds: { x: 464, y: 260, width: 3244, height: 1804 },
  derived1080Bounds: { x: 232, y: 130, width: 1622, height: 902 },
  contentSafeRegion: { x: 96, y: 120, width: 3052, height: 1564 },
  tabRegion: { x: 72, y: 64, width: 1220, height: 180 },
  rowOrigin: { x: 112, y: 322 },
  cropMode: "cover" as const,
  registrationPoint: "top-left" as const,
  alphaBehavior: "preserve" as const
};

export const upgradeCategoryBackgroundDerivativePresetIds = [
  "upgrade_category_master_preview",
  "upgrade_category_background_4k_png",
  "upgrade_category_background_1440_webp",
  "upgrade_category_background_1080_webp",
  "upgrade_category_background_720_webp",
  "upgrade_category_background_web_runtime",
  "upgrade_category_background_roblox_png",
  "upgrade_category_background_ios_phone_png",
  "upgrade_category_background_ios_tablet_png",
  "upgrade_category_background_android_phone_png",
  "upgrade_category_background_android_tablet_png",
  "upgrade_category_background_thumbnail"
] as const;

export const uploadUpgradeCategoryBackgroundAction = {
  label: "Upload Upgrade Category Background",
  requiredFields: ["Category", "Asset Role", "Source File", "Source Version", "Notes", "Approval State"],
  autoPopulatedFields: ["semantic asset key", "canonical category ID", "expected dimensions", "transparency requirement", "derivative requirements"]
};

export function categoryPresentationFor(categoryId: string): UpgradeCategoryPresentation {
  const id = upgradeCategoryIds.includes(categoryId as UpgradeCategoryId) ? categoryId as UpgradeCategoryId : "technology";
  return {
    backgroundArtKey: upgradeCategoryBackgroundKeys[id],
    fallbackBackgroundArtKey: upgradePanelSharedFallbackArtKey,
    selectedTabArtKey: null,
    iconArtKey: null
  };
}

export const upgradeCategoryAssetRecords: UpgradeCategoryAssetRecord[] = upgradeCategoryIds.map((categoryId) => ({
  categoryId,
  displayName: displayNames[categoryId],
  groupPath: ["UI", "Dashboard", "Upgrade Categories"],
  role: "Category Background",
  semanticAssetKey: upgradeCategoryBackgroundKeys[categoryId],
  fallbackArtKey: upgradePanelSharedFallbackArtKey,
  sourcePolicy: "Upload one layered PSD/PSB master or full-resolution PNG master per category. All four category backgrounds must share dimensions, registration, safe region, alpha behavior, and crop mode.",
  expectedDimensions: upgradeCategoryBackgroundDimensions,
  derivativeRequirements: [...upgradeCategoryBackgroundDerivativePresetIds],
  acceptedSourceFormats: ["PNG", "PSD", "PSB", "TIFF", "SVG"],
  transparencyRequired: true,
  uploadDefaults: { assetRole: "Category Background", approvalState: "Needs Review", sourceVersion: 1 }
}));

export function resolveUpgradeCategoryAssetStatus(assets: ProductionAsset[]) {
  return upgradeCategoryAssetRecords.map((record) => {
    const candidates = assets.filter((asset) => {
      const values = new Set([
        asset.id,
        asset.artKey,
        asset.iconKey,
        asset.name,
        asset.platformMappings?.web && typeof asset.platformMappings.web === "object" ? String((asset.platformMappings.web as { path?: string }).path ?? "") : "",
        ...asset.usageReferences.map((usage) => `${usage.type}:${usage.id}`)
      ].filter(Boolean).map((value) => String(value)));
      return values.has(record.semanticAssetKey) || values.has(`upgrade_category:${record.categoryId}`);
    });
    const asset = candidates.find((item) => item.productionStatus === "published" || item.status.toLowerCase() === "published")
      ?? candidates.find((item) => item.approvalStatus === "approved")
      ?? candidates[0]
      ?? null;
    const derivatives = new Set(asset?.derivatives.map((derivative) => derivative.presetId || derivative.derivativeType) ?? []);
    const missingDerivatives = record.derivativeRequirements.filter((presetId) => !derivatives.has(presetId));
    const source = asset?.sourceFiles.find((file) => file.isCurrent) ?? asset?.sourceFiles[0] ?? null;
    return {
      ...record,
      assetId: asset?.id ?? null,
      currentBackgroundPreview: asset?.platformMappings.web && typeof asset.platformMappings.web === "object"
        ? ((asset.platformMappings.web as { path?: string }).path ?? null)
        : (asset?.derivatives.find((derivative) => derivative.publicUrl || derivative.storagePath)?.publicUrl ?? null),
      sourceFile: source ? { id: source.id, filename: source.filename, version: source.version, format: source.extension, width: source.width, height: source.height } : null,
      dimensions: source?.width && source.height ? { width: source.width, height: source.height } : null,
      approvalStatus: asset?.approvalStatus ?? "Missing",
      status: asset?.productionStatus ?? "missing",
      webReady: Boolean(asset?.platformMappings.web),
      robloxReady: Boolean(asset?.platformMappings.roblox),
      iosReady: Boolean(asset?.platformMappings.ios),
      androidReady: Boolean(asset?.platformMappings.android),
      missingDerivativeWarnings: missingDerivatives,
      geometryConsistent: source ? source.width === record.expectedDimensions.masterWidth && source.height === record.expectedDimensions.masterHeight : false
    };
  });
}

export function validateUpgradeCategoryPresentation(input: { categories: Array<{ id: string; presentation?: UpgradeCategoryPresentation }>; assets?: ProductionAsset[] }) {
  const issues: string[] = [];
  const categoryIds = new Set(input.categories.map((category) => category.id));
  for (const categoryId of upgradeCategoryIds) {
    if (!categoryIds.has(categoryId)) issues.push(`Missing canonical upgrade category: ${categoryId}.`);
  }
  const backgroundKeys = input.categories.map((category) => category.presentation?.backgroundArtKey).filter(Boolean) as string[];
  if (new Set(backgroundKeys).size !== backgroundKeys.length) issues.push("Upgrade category backgroundArtKey values must be unique.");
  for (const category of input.categories.filter((item) => upgradeCategoryIds.includes(item.id as UpgradeCategoryId))) {
    const expected = categoryPresentationFor(category.id);
    if (category.presentation?.backgroundArtKey !== expected.backgroundArtKey) issues.push(`${category.id} backgroundArtKey must be ${expected.backgroundArtKey}.`);
    if (category.presentation?.fallbackBackgroundArtKey !== expected.fallbackBackgroundArtKey) issues.push(`${category.id} fallbackBackgroundArtKey must be ${expected.fallbackBackgroundArtKey}.`);
  }
  if (input.assets) {
    const approved = resolveUpgradeCategoryAssetStatus(input.assets).filter((record) => record.approvalStatus === "approved" || record.status === "published");
    const dimensionKeys = new Set(approved.filter((record) => record.dimensions).map((record) => `${record.dimensions?.width}x${record.dimensions?.height}`));
    if (dimensionKeys.size > 1) issues.push("Approved upgrade category backgrounds must share exact dimensions.");
    for (const record of approved) {
      if (!record.geometryConsistent) issues.push(`${record.categoryId} approved background does not match required ${record.expectedDimensions.masterWidth}x${record.expectedDimensions.masterHeight} geometry.`);
    }
  }
  return { valid: issues.length === 0, issues };
}
