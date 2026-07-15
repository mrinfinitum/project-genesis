import { getAiAgentLibraryState } from "@/lib/ai-agents";
import { getComponentLibraryState } from "@/lib/component-library";
import { getScreenDesignerState } from "@/lib/screen-designer";
import type { AssetProductionState, MissingAssetRequirement, ProductionAsset } from "@/lib/assets/asset-production";
import type { VisualPreviewReport } from "@/lib/assets/visual-previews";

export type AssetLibraryCategoryId =
  | "top-hud"
  | "left-navigation"
  | "upgrade-categories"
  | "research-ui"
  | "buildings-ui"
  | "galaxy-ui"
  | "planet-ui"
  | "settings-ui"
  | "login-ui"
  | "loading-ui"
  | "ai-agents"
  | "icons"
  | "backgrounds"
  | "illustrations"
  | "animations"
  | "audio"
  | "video"
  | "unmapped";

export type AssetLibraryInventoryStatus =
  | "published"
  | "approved"
  | "uploaded"
  | "needs_review"
  | "missing"
  | "processing"
  | "invalid"
  | "deprecated"
  | "unmapped";

export type AssetLibraryReference = {
  type: "screen" | "component" | "visual_builder" | "ai_agent" | "upgrade_category" | "runtime" | "asset_registry" | "missing_requirement";
  id: string;
  name: string;
  href: string;
};

export type AssetLibraryInventoryItem = {
  id: string;
  semanticAssetKey: string;
  displayName: string;
  categoryId: AssetLibraryCategoryId;
  categoryPath: string;
  role: string;
  sourceType: "asset_registry" | "screen_requirement" | "component_requirement" | "visual_builder_placeholder" | "ai_agent_requirement" | "upgrade_category_asset" | "runtime_reference" | "missing_requirement";
  status: AssetLibraryInventoryStatus;
  previewUrl: string | null;
  sourceAssetId: string | null;
  requirementId: string | null;
  referencedByScreens: AssetLibraryReference[];
  referencedByComponents: AssetLibraryReference[];
  referencedByPlaceholders: AssetLibraryReference[];
  platformReadiness: {
    web: "ready" | "missing" | "pending";
    roblox: "ready" | "missing" | "pending";
    ios: "ready" | "missing" | "pending";
    android: "ready" | "missing" | "pending";
  };
  requiredDimensions: string;
  currentDimensions: string;
  actions: string[];
  sortOrder: number;
};

export type AssetLibraryCategorySummary = {
  id: AssetLibraryCategoryId;
  label: string;
  total: number;
  published: number;
  approved: number;
  uploaded: number;
  needsReview: number;
  missing: number;
  invalid: number;
  unmapped: number;
  screenReferences: number;
  componentReferences: number;
  placeholderReferences: number;
};

export type AssetLibraryInventoryIndex = {
  items: AssetLibraryInventoryItem[];
  categorySummaries: Record<AssetLibraryCategoryId, AssetLibraryCategorySummary>;
  unmappedAssets: AssetLibraryInventoryItem[];
  duplicateSemanticKeys: Array<{ semanticAssetKey: string; itemIds: string[] }>;
  defaultFilter: "all";
  generatedAt: string;
};

const categoryLabels: Record<AssetLibraryCategoryId, string> = {
  "top-hud": "Top HUD",
  "left-navigation": "Left Navigation",
  "upgrade-categories": "Upgrade Categories",
  "research-ui": "Research UI",
  "buildings-ui": "Buildings UI",
  "galaxy-ui": "Galaxy UI",
  "planet-ui": "Planet UI",
  "settings-ui": "Settings UI",
  "login-ui": "Login UI",
  "loading-ui": "Loading UI",
  "ai-agents": "AI Agents",
  icons: "Icons",
  backgrounds: "Backgrounds",
  illustrations: "Illustrations",
  animations: "Animations",
  audio: "Audio",
  video: "Video",
  unmapped: "Unmapped"
};

function titleFromKey(value: string) {
  return value.replace(/^asset_/, "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function keyForAsset(asset: ProductionAsset) {
  return asset.artKey || asset.iconKey || asset.id.replace(/^asset_/, "");
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function roleFor(category?: string, key = "", label = "") {
  const text = `${category ?? ""} ${key} ${label}`.toLowerCase();
  if (/audio|sound|music|voice/.test(text)) return "Audio";
  if (/video|cinematic|movie/.test(text)) return "Video";
  if (/animation|blink|idle/.test(text)) return "Animation";
  if (/icon|button|node|counter|crystal|labor|credits|population|research/.test(text)) return "Icon";
  if (/panel|frame|row|tab|drawer|modal/.test(text)) return "Panel";
  if (/background|hero|splash|loading|workspace/.test(text)) return "Background";
  return "Artwork";
}

function categoryFor(input: { key: string; label: string; role: string; screenId?: string; componentId?: string; sourceType?: string }): AssetLibraryCategoryId {
  const text = `${input.key} ${input.label} ${input.role} ${input.screenId ?? ""} ${input.componentId ?? ""} ${input.sourceType ?? ""}`.toLowerCase();
  if (/audio|sound|music|voice/.test(text)) return "audio";
  if (/video|cinematic|movie/.test(text)) return "video";
  if (/animation|blink_animation|idle_animation/.test(text)) return "animations";
  if (/ai[_ -]?agent|auto_robot|robot/.test(text)) return "ai-agents";
  if (/top[_ -]?hud|hud|economy_|premium|civilization_identity|calendar|trophy/.test(text) || ["TopHudBar", "HudEconomySlot", "EconomyCounter", "PremiumCurrencyBalance", "UtilityIconButton"].some((id) => input.componentId === id)) return "top-hud";
  if (/left[_ -]?navigation|side[_ -]?navigation|nav[_ -]?rail|overview_icon|spaceport_icon/.test(text)) return "left-navigation";
  if (/research/.test(text)) return "research-ui";
  if (/building/.test(text)) return "buildings-ui";
  if (/upgrade|workforce|industry|science|technology/.test(text)) return "upgrade-categories";
  if (/galaxy|spaceport/.test(text)) return "galaxy-ui";
  if (/planet|earth|sol|biome|celestial/.test(text)) return "planet-ui";
  if (/settings|account|cloud|save[_ -]?conflict|toggle|slider/.test(text)) return "settings-ui";
  if (/login|signup|forgot|reset|welcome/.test(text)) return "login-ui";
  if (/loading|launch|splash|wordmark/.test(text)) return "loading-ui";
  if (input.role === "Icon") return "icons";
  if (input.role === "Background") return "backgrounds";
  if (input.role === "Animation") return "animations";
  return "unmapped";
}

function statusForAsset(asset: ProductionAsset): AssetLibraryInventoryStatus {
  if (asset.productionStatus === "published" || asset.status.toLowerCase() === "published") return "published";
  if (asset.approvalStatus === "approved") return "approved";
  if (asset.productionStatus === "processing") return "processing";
  if (asset.sourceFiles.length) return "uploaded";
  if (asset.qualityIssues.length) return "invalid";
  return "unmapped";
}

function statusForRequirement(status: string): AssetLibraryInventoryStatus {
  const normalized = status.toLowerCase();
  if (normalized === "ready" || normalized === "published") return "published";
  if (normalized.includes("approval")) return "needs_review";
  if (normalized.includes("upload") || normalized.includes("missing") || normalized.includes("pending") || normalized.includes("placeholder")) return "missing";
  return "needs_review";
}

function readinessFromAsset(asset?: ProductionAsset | null) {
  const mappings = asset?.platformMappings ?? {};
  return {
    web: mappings.web ? "ready" as const : asset ? "pending" as const : "missing" as const,
    roblox: mappings.roblox ? "ready" as const : asset ? "pending" as const : "missing" as const,
    ios: mappings.ios ? "ready" as const : asset ? "pending" as const : "missing" as const,
    android: mappings.android ? "ready" as const : asset ? "pending" as const : "missing" as const
  };
}

function currentDimensions(asset?: ProductionAsset | null) {
  const source = asset?.sourceFiles.find((item) => item.isCurrent) ?? asset?.sourceFiles[0];
  if (source?.width && source.height) return `${source.width}x${source.height}`;
  const derivative = asset?.derivatives[0];
  if (derivative?.width && derivative.height) return `${derivative.width}x${derivative.height}`;
  return "Pending inspection";
}

function requiredDimensionsFor(role: string, key: string) {
  const text = `${role} ${key}`.toLowerCase();
  if (/background|hero|workspace|panel/.test(text)) return "3244x1804";
  if (/icon|button|node/.test(text)) return "512x512";
  if (/animation|agent/.test(text)) return "64/96/128/256/512/1024";
  return "Defined by requirement";
}

function findAsset(assetsByKey: Map<string, ProductionAsset>, key: string) {
  return assetsByKey.get(normalizeKey(key)) ?? null;
}

function mergeReference(target: AssetLibraryReference[], reference: AssetLibraryReference) {
  if (!target.some((item) => item.type === reference.type && item.id === reference.id)) {
    target.push(reference);
  }
}

export async function buildAssetLibraryInventory(input: {
  assets: ProductionAsset[];
  missingRequirements: MissingAssetRequirement[];
  upgradeCategoryAssets: AssetProductionState["upgradeCategoryAssets"];
  visualPreviewReport: VisualPreviewReport;
}): Promise<AssetLibraryInventoryIndex> {
  const [screenState, componentState, aiAgentState] = await Promise.all([
    getScreenDesignerState(),
    getComponentLibraryState(),
    getAiAgentLibraryState({ assets: input.assets } as AssetProductionState)
  ]);
  const assetsByKey = new Map<string, ProductionAsset>();
  for (const asset of input.assets) {
    for (const key of [asset.id, asset.artKey, asset.iconKey, ...asset.aliases]) {
      if (key) assetsByKey.set(normalizeKey(key), asset);
    }
  }

  const itemsByKey = new Map<string, AssetLibraryInventoryItem>();
  let sortOrder = 0;
  function upsert(params: {
    semanticAssetKey: string;
    displayName: string;
    categoryId?: AssetLibraryCategoryId;
    role: string;
    sourceType: AssetLibraryInventoryItem["sourceType"];
    status: AssetLibraryInventoryStatus;
    sourceAssetId?: string | null;
    requirementId?: string | null;
    previewUrl?: string | null;
    requiredDimensions?: string;
    currentDimensions?: string;
    reference?: AssetLibraryReference;
  }) {
    const key = normalizeKey(params.semanticAssetKey);
    const asset = params.sourceAssetId ? input.assets.find((item) => item.id === params.sourceAssetId) : findAsset(assetsByKey, key);
    const categoryId = params.categoryId ?? categoryFor({ key, label: params.displayName, role: params.role, sourceType: params.sourceType });
    const existing = itemsByKey.get(key);
    if (existing) {
      existing.status = existing.status === "published" ? existing.status : params.status === "published" ? "published" : existing.status === "approved" ? existing.status : params.status;
      existing.sourceAssetId ||= params.sourceAssetId ?? asset?.id ?? null;
      existing.requirementId ||= params.requirementId ?? null;
      existing.previewUrl ||= params.previewUrl ?? null;
      if (params.reference) {
        if (params.reference.type === "screen") mergeReference(existing.referencedByScreens, params.reference);
        else if (params.reference.type === "component") mergeReference(existing.referencedByComponents, params.reference);
        else mergeReference(existing.referencedByPlaceholders, params.reference);
      }
      return existing;
    }

    const item: AssetLibraryInventoryItem = {
      id: `asset-library-${key}`,
      semanticAssetKey: key,
      displayName: params.displayName || titleFromKey(key),
      categoryId,
      categoryPath: `Asset Library / ${categoryLabels[categoryId]}`,
      role: params.role,
      sourceType: params.sourceType,
      status: params.status,
      previewUrl: params.previewUrl ?? null,
      sourceAssetId: params.sourceAssetId ?? asset?.id ?? null,
      requirementId: params.requirementId ?? null,
      referencedByScreens: [],
      referencedByComponents: [],
      referencedByPlaceholders: [],
      platformReadiness: readinessFromAsset(asset),
      requiredDimensions: params.requiredDimensions ?? requiredDimensionsFor(params.role, key),
      currentDimensions: params.currentDimensions ?? currentDimensions(asset),
      actions: ["Upload Asset", "Replace", "Open Inspector", "Usage", "History", "Generate Derivatives", "Approve", "Publish"],
      sortOrder: sortOrder++
    };
    if (params.reference) {
      if (params.reference.type === "screen") item.referencedByScreens.push(params.reference);
      else if (params.reference.type === "component") item.referencedByComponents.push(params.reference);
      else item.referencedByPlaceholders.push(params.reference);
    }
    itemsByKey.set(key, item);
    return item;
  }

  for (const asset of input.assets) {
    const key = keyForAsset(asset);
    const role = roleFor(asset.category, key, asset.name);
    upsert({
      semanticAssetKey: key,
      displayName: asset.name,
      categoryId: categoryFor({ key, label: asset.name, role, sourceType: "asset_registry" }),
      role,
      sourceType: "asset_registry",
      status: statusForAsset(asset),
      sourceAssetId: asset.id,
      previewUrl: asset.derivatives[0]?.publicUrl ?? asset.sourceFiles.find((source) => source.previewUrl)?.previewUrl ?? null,
      currentDimensions: currentDimensions(asset),
      reference: { type: "asset_registry", id: asset.id, name: asset.name, href: `/assets/${encodeURIComponent(asset.id)}` }
    });
  }

  for (const record of screenState.records) {
    for (const requirement of record.assetRequirements) {
      const key = requirement.artKey ?? requirement.iconKey ?? requirement.id;
      const role = roleFor(requirement.category, key, requirement.label);
      upsert({
        semanticAssetKey: key,
        displayName: requirement.label,
        categoryId: categoryFor({ key, label: requirement.label, role, screenId: record.screenId, sourceType: "screen_requirement" }),
        role,
        sourceType: "screen_requirement",
        status: statusForRequirement(requirement.status),
        sourceAssetId: findAsset(assetsByKey, key)?.id ?? null,
        requirementId: `${record.screenId}:${requirement.id}`,
        reference: { type: "screen", id: record.screenId, name: record.displayName, href: `/screen-designer/${encodeURIComponent(record.screenId)}` }
      });
    }
    for (const component of record.componentSpecs) {
      for (const key of component.assetKeys ?? []) {
        const role = roleFor("placeholder", key, component.displayName);
        upsert({
          semanticAssetKey: key,
          displayName: `${component.displayName} asset`,
          categoryId: categoryFor({ key, label: component.displayName, role, screenId: record.screenId, componentId: component.componentLibraryId, sourceType: "visual_builder_placeholder" }),
          role,
          sourceType: "visual_builder_placeholder",
          status: findAsset(assetsByKey, key) ? "uploaded" : "missing",
          sourceAssetId: findAsset(assetsByKey, key)?.id ?? null,
          requirementId: `${record.screenId}:${component.id}:${key}`,
          reference: { type: "visual_builder", id: `${record.screenId}:${component.id}`, name: `${record.displayName} / ${component.displayName}`, href: `/screen-designer/${encodeURIComponent(record.screenId)}` }
        });
      }
    }
  }

  for (const record of componentState.records) {
    for (const requirement of record.assetKeys) {
      const role = roleFor(record.category, requirement.assetKey, requirement.label);
      upsert({
        semanticAssetKey: requirement.assetKey,
        displayName: requirement.label,
        categoryId: categoryFor({ key: requirement.assetKey, label: requirement.label, role, componentId: record.componentId, sourceType: "component_requirement" }),
        role,
        sourceType: "component_requirement",
        status: statusForRequirement(requirement.status),
        sourceAssetId: requirement.linkedAssetId ?? findAsset(assetsByKey, requirement.assetKey)?.id ?? null,
        requirementId: `${record.componentId}:${requirement.id}`,
        reference: { type: "component", id: record.componentId, name: record.displayName, href: `/component-library/${encodeURIComponent(record.componentId)}` }
      });
    }
  }

  for (const missing of input.missingRequirements) {
    const key = missing.artKey || missing.iconKey || missing.id;
    const role = roleFor(missing.requiredDerivative, key, missing.objectName);
    upsert({
      semanticAssetKey: key,
      displayName: missing.objectName,
      categoryId: categoryFor({ key, label: missing.objectName, role, sourceType: "missing_requirement" }),
      role,
      sourceType: "missing_requirement",
      status: missing.currentStatus === "published" ? "published" : "missing",
      sourceAssetId: findAsset(assetsByKey, key)?.id ?? null,
      requirementId: missing.id,
      reference: { type: "missing_requirement", id: missing.id, name: missing.objectName, href: `/asset-library?section=missing&requirement=${encodeURIComponent(missing.id)}` }
    });
  }

  for (const record of input.upgradeCategoryAssets) {
    upsert({
      semanticAssetKey: record.semanticAssetKey,
      displayName: record.displayName,
      categoryId: "upgrade-categories",
      role: "Background",
      sourceType: "upgrade_category_asset",
      status: record.status === "published" ? "published" : record.approvalStatus === "approved" ? "approved" : record.sourceFile ? "uploaded" : "missing",
      sourceAssetId: record.assetId,
      requirementId: `upgrade-category:${record.categoryId}`,
      previewUrl: record.currentBackgroundPreview ?? null,
      requiredDimensions: `${record.expectedDimensions.masterWidth}x${record.expectedDimensions.masterHeight}`,
      currentDimensions: record.dimensions ? `${record.dimensions.width}x${record.dimensions.height}` : "Pending inspection",
      reference: { type: "upgrade_category", id: record.categoryId, name: record.displayName, href: `/asset-library?section=upgrade-categories` }
    });
  }

  for (const agent of aiAgentState.records) {
    for (const slot of agent.artworkSlots) {
      upsert({
        semanticAssetKey: slot.artKey,
        displayName: `${agent.displayName} ${slot.label}`,
        categoryId: slot.kind.includes("animation") ? "animations" : "ai-agents",
        role: slot.kind.includes("animation") ? "Animation" : "AI Agent Art",
        sourceType: "ai_agent_requirement",
        status: slot.status === "Published" ? "published" : slot.status === "Approved" ? "approved" : slot.status === "Needs Review" ? "needs_review" : "missing",
        sourceAssetId: slot.linkedAssetId ?? findAsset(assetsByKey, slot.artKey)?.id ?? null,
        requirementId: `${agent.id}:${slot.id}`,
        previewUrl: slot.preview.url ?? null,
        requiredDimensions: slot.preferredDimensions,
        reference: { type: "ai_agent", id: `${agent.id}:${slot.id}`, name: `${agent.displayName} / ${slot.label}`, href: `/ai-agents?agent=${encodeURIComponent(agent.id)}` }
      });
    }
  }

  for (const issue of input.visualPreviewReport.issues) {
    if (issue.status !== "Missing" && issue.status !== "Pending Generation") continue;
    const key = issue.id;
    upsert({
      semanticAssetKey: key,
      displayName: issue.title,
      categoryId: categoryFor({ key, label: issue.title, role: "Placeholder", sourceType: "visual_builder_placeholder" }),
      role: "Placeholder",
      sourceType: "visual_builder_placeholder",
      status: "missing",
      requirementId: issue.id,
      reference: { type: "visual_builder", id: issue.id, name: `${issue.title} / ${issue.action}`, href: "/asset-library?section=missing" }
    });
  }

  const items = [...itemsByKey.values()].sort((left, right) => left.categoryId.localeCompare(right.categoryId) || left.status.localeCompare(right.status) || left.sortOrder - right.sortOrder);
  const categorySummaries = Object.fromEntries((Object.keys(categoryLabels) as AssetLibraryCategoryId[]).map((id) => {
    const rows = items.filter((item) => item.categoryId === id);
    const uniqueScreenReferences = new Set(rows.flatMap((item) => item.referencedByScreens.map((reference) => reference.id))).size;
    const uniqueComponentReferences = new Set(rows.flatMap((item) => item.referencedByComponents.map((reference) => reference.id))).size;
    const uniquePlaceholderReferences = new Set(rows.flatMap((item) => item.referencedByPlaceholders.map((reference) => reference.id))).size;
    return [id, {
      id,
      label: categoryLabels[id],
      total: rows.length,
      published: rows.filter((item) => item.status === "published").length,
      approved: rows.filter((item) => item.status === "approved").length,
      uploaded: rows.filter((item) => item.status === "uploaded").length,
      needsReview: rows.filter((item) => item.status === "needs_review").length,
      missing: rows.filter((item) => item.status === "missing").length,
      invalid: rows.filter((item) => item.status === "invalid").length,
      unmapped: rows.filter((item) => item.status === "unmapped").length,
      screenReferences: uniqueScreenReferences,
      componentReferences: uniqueComponentReferences,
      placeholderReferences: uniquePlaceholderReferences
    }];
  })) as Record<AssetLibraryCategoryId, AssetLibraryCategorySummary>;

  const duplicateSemanticKeys = [...items.reduce((map, item) => {
    const rows = map.get(item.semanticAssetKey) ?? [];
    rows.push(item.id);
    map.set(item.semanticAssetKey, rows);
    return map;
  }, new Map<string, string[]>())].filter(([, rows]) => rows.length > 1).map(([semanticAssetKey, itemIds]) => ({ semanticAssetKey, itemIds }));

  return {
    items,
    categorySummaries,
    unmappedAssets: items.filter((item) => item.categoryId === "unmapped" || item.status === "unmapped"),
    duplicateSemanticKeys,
    defaultFilter: "all",
    generatedAt: new Date().toISOString()
  };
}
