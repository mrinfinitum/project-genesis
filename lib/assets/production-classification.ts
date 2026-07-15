import { upgradeCategoryAssetRecords, upgradeCategoryIds } from "@/lib/upgrades/category-presentation";
import type { AssetProductionState } from "@/lib/assets/asset-production";
import type { GameData } from "@/types/schema";

export type ProductionClassMode = "canonical_class" | "group" | "none";
export type ProductionClassConfidence = "explicit_canonical_reference" | "linked_canonical_record" | "semantic_role_mapping" | "reviewed_manual_assignment" | "unclassified";

export type ProductionClassDefinition = {
  classId: string;
  displayName: string;
  displayOrder: number;
  mode: ProductionClassMode;
  description?: string;
};

export type ProductionItemClassification = {
  classId: string;
  displayName: string;
  assetRole: string;
  confidence: ProductionClassConfidence;
};

export type ProductionClassSummary<TItem> = ProductionClassDefinition & {
  itemCount: number;
  missingCount: number;
  publishedCount: number;
  needsReviewCount: number;
  topBlocker: TItem | null;
};

type InventoryItem = AssetProductionState["assetLibraryInventory"]["items"][number];

const sharedClass: ProductionClassDefinition = {
  classId: "shared",
  displayName: "Shared / Global",
  displayOrder: 900,
  mode: "canonical_class",
  description: "Reusable shell, fallback, button, card, and common UI assets."
};

const unclassifiedClass: ProductionClassDefinition = {
  classId: "unclassified",
  displayName: "Unclassified",
  displayOrder: 999,
  mode: "canonical_class",
  description: "Items that need a canonical link, reviewed class assignment, or shared/global marking."
};

const topHudGroups: ProductionClassDefinition[] = [
  { classId: "shell", displayName: "Shell", displayOrder: 1, mode: "group" },
  { classId: "economy-icons", displayName: "Economy Icons", displayOrder: 2, mode: "group" },
  { classId: "identity", displayName: "Identity", displayOrder: 3, mode: "group" },
  { classId: "utility-buttons", displayName: "Utility Buttons", displayOrder: 4, mode: "group" },
  { classId: "interaction-states", displayName: "Interaction States", displayOrder: 5, mode: "group" },
  { ...unclassifiedClass, mode: "group" }
];

const navigationGroups: ProductionClassDefinition[] = [
  { classId: "shell", displayName: "Shell", displayOrder: 1, mode: "group" },
  { classId: "navigation-icons", displayName: "Navigation Icons", displayOrder: 2, mode: "group" },
  { classId: "selected-state", displayName: "Selected State", displayOrder: 3, mode: "group" },
  { classId: "inactive-state", displayName: "Inactive State", displayOrder: 4, mode: "group" },
  { classId: "badges-indicators", displayName: "Badges / Indicators", displayOrder: 5, mode: "group" },
  { ...unclassifiedClass, mode: "group" }
];

function normalizeId(value: string) {
  return value.trim().toLowerCase().replace(/^branch[_-]/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function title(value: string) {
  return value.replace(/^branch[_-]/, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function textFor(item: InventoryItem) {
  return [
    item.semanticAssetKey,
    item.displayName,
    item.role,
    item.categoryPath,
    item.requirementId ?? "",
    ...item.referencedByScreens.map((reference) => `${reference.type}:${reference.id}:${reference.name}`),
    ...item.referencedByComponents.map((reference) => `${reference.type}:${reference.id}:${reference.name}`),
    ...item.referencedByPlaceholders.map((reference) => `${reference.type}:${reference.id}:${reference.name}`)
  ].join(" ").toLowerCase();
}

function hasCanonicalMatch(item: InventoryItem, values: Array<string | null | undefined>) {
  const haystack = textFor(item);
  return values.filter(Boolean).some((value) => {
    const normalized = String(value).toLowerCase();
    return normalized.length > 2 && haystack.includes(normalized);
  });
}

function assetRoleFor(item: InventoryItem) {
  const text = textFor(item);
  if (/background|hero|workspace|screen|shell|fallback/.test(text)) return "Background";
  if (/icon|symbol|node|economy|labor|credits|population|research|crystal/.test(text)) return "Icon";
  if (/card|tile/.test(text)) return "Card";
  if (/button|control|cta|toggle/.test(text)) return "Button";
  if (/tab/.test(text)) return "Tab";
  if (/panel|drawer|modal|frame|rail|hud/.test(text)) return "Panel";
  if (/state|locked|selected|active|inactive|hover|pressed/.test(text)) return "State";
  if (/animation|blink|idle|motion/.test(text)) return "Animation";
  return item.role || "Artwork";
}

function topBlockerRank(item: InventoryItem) {
  const statusRank: Record<string, number> = { invalid: 0, missing: 1, needs_review: 2, uploaded: 3, processing: 4, approved: 5, unmapped: 6, published: 7, deprecated: 8 };
  const priority = /top hud|left navigation|dashboard|app shell|background|shell|category/.test(textFor(item)) ? 0 : 1;
  return priority * 20 + (statusRank[item.status] ?? 9);
}

function sortByClassOrder(left: ProductionClassDefinition, right: ProductionClassDefinition) {
  return left.displayOrder - right.displayOrder || left.displayName.localeCompare(right.displayName);
}

export function resolveProductionClasses(areaId: string, data: Pick<GameData, "research_branches" | "research" | "buildings">): ProductionClassDefinition[] {
  if (areaId === "upgrades") {
    const classes = upgradeCategoryAssetRecords.map((record, index) => ({
      classId: record.categoryId,
      displayName: record.displayName,
      displayOrder: index + 1,
      mode: "canonical_class" as const,
      description: "Canonical upgrade category published by Studio."
    }));
    return [...classes, sharedClass, unclassifiedClass].sort(sortByClassOrder);
  }

  if (areaId === "research") {
    const branchRows = data.research_branches.length
      ? data.research_branches
      : [...new Map(data.research.map((row) => [row.branch_id, { id: row.branch_id, name: title(row.branch_id), purpose: "" }])).values()];
    const classes = branchRows.map((branch, index) => ({
      classId: normalizeId(branch.id || branch.name),
      displayName: branch.name || title(branch.id),
      displayOrder: index + 1,
      mode: "canonical_class" as const,
      description: branch.purpose
    }));
    return [...classes, sharedClass, unclassifiedClass].sort(sortByClassOrder);
  }

  if (areaId === "buildings") {
    const seen = new Set<string>();
    const classes = data.buildings
      .map((building) => building.category)
      .filter(Boolean)
      .map((category) => ({ id: normalizeId(category), label: category }))
      .filter((category) => {
        if (seen.has(category.id)) return false;
        seen.add(category.id);
        return true;
      })
      .map((category, index) => ({
        classId: category.id,
        displayName: category.label,
        displayOrder: index + 1,
        mode: "canonical_class" as const,
        description: "Canonical building category from Studio building definitions."
      }));
    return [...classes, sharedClass, unclassifiedClass].sort(sortByClassOrder);
  }

  if (areaId === "top-hud") return topHudGroups;
  if (areaId === "left-navigation") return navigationGroups;
  return [];
}

function sharedByArea(areaId: string, item: InventoryItem) {
  const text = textFor(item);
  if (areaId === "upgrades") return /shared|fallback|card|button|tab|common|generic/.test(text);
  if (areaId === "research") return /screen shell|workspace|tree|detail|button|timeline|sidebar|connection|background|shared/.test(text);
  if (areaId === "buildings") return /workspace|header|category tab|cost row|requirement|button|locked|shared|shell/.test(text);
  return false;
}

function resolveTopHudGroup(item: InventoryItem): ProductionItemClassification {
  const text = textFor(item);
  if (/background|panel|shell|top_hud_background|resource panel/.test(text)) return { classId: "shell", displayName: "Shell", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  if (/economy|labor|credits|population|research|premium|crystal/.test(text)) return { classId: "economy-icons", displayName: "Economy Icons", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  if (/civilization|identity|crest|frame/.test(text)) return { classId: "identity", displayName: "Identity", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  if (/calendar|trophy|settings|add|button|plus/.test(text)) return { classId: "utility-buttons", displayName: "Utility Buttons", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  if (/active|inactive|hover|pressed|warning|state/.test(text)) return { classId: "interaction-states", displayName: "Interaction States", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  return { classId: "unclassified", displayName: "Unclassified", assetRole: assetRoleFor(item), confidence: "unclassified" };
}

function resolveNavigationGroup(item: InventoryItem): ProductionItemClassification {
  const text = textFor(item);
  if (/rail|background|shell/.test(text)) return { classId: "shell", displayName: "Shell", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  if (/icon|overview|spaceport|galaxy|planet|mission|economy|settings/.test(text)) return { classId: "navigation-icons", displayName: "Navigation Icons", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  if (/selected|active|current/.test(text)) return { classId: "selected-state", displayName: "Selected State", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  if (/inactive|locked|disabled/.test(text)) return { classId: "inactive-state", displayName: "Inactive State", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  if (/badge|indicator|count|progress/.test(text)) return { classId: "badges-indicators", displayName: "Badges / Indicators", assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
  return { classId: "unclassified", displayName: "Unclassified", assetRole: assetRoleFor(item), confidence: "unclassified" };
}

export function resolveAssetClass(item: InventoryItem, areaId: string, data: Pick<GameData, "research_branches" | "research" | "buildings" | "upgrades">): ProductionItemClassification {
  if (areaId === "top-hud") return resolveTopHudGroup(item);
  if (areaId === "left-navigation") return resolveNavigationGroup(item);

  if (areaId === "upgrades") {
    const explicit = item.referencedByPlaceholders.find((reference) => reference.type === "upgrade_category" && upgradeCategoryIds.includes(reference.id as typeof upgradeCategoryIds[number]));
    if (explicit) return { classId: explicit.id, displayName: title(explicit.id), assetRole: assetRoleFor(item), confidence: "explicit_canonical_reference" };
    for (const categoryId of upgradeCategoryIds) {
      const category = upgradeCategoryAssetRecords.find((record) => record.categoryId === categoryId);
      if (hasCanonicalMatch(item, [categoryId, category?.displayName, category?.semanticAssetKey])) {
        return { classId: categoryId, displayName: category?.displayName ?? title(categoryId), assetRole: assetRoleFor(item), confidence: "linked_canonical_record" };
      }
    }
    if (sharedByArea(areaId, item)) return { classId: "shared", displayName: sharedClass.displayName, assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
    const upgrade = data.upgrades.find((row) => hasCanonicalMatch(item, [row.id, row.name, row.icon_name, row.asset_id]));
    if (upgrade) {
      const classId = normalizeId(upgrade.type);
      return { classId, displayName: title(upgrade.type), assetRole: assetRoleFor(item), confidence: "linked_canonical_record" };
    }
  }

  if (areaId === "research") {
    const research = data.research.find((row) => hasCanonicalMatch(item, [row.id, row.name, row.icon_name, row.asset_id]));
    if (research) {
      const branch = data.research_branches.find((row) => normalizeId(row.id) === normalizeId(research.branch_id));
      return { classId: normalizeId(research.branch_id), displayName: branch?.name ?? title(research.branch_id), assetRole: assetRoleFor(item), confidence: "linked_canonical_record" };
    }
    if (sharedByArea(areaId, item)) return { classId: "shared", displayName: sharedClass.displayName, assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
    for (const branch of data.research_branches) {
      if (hasCanonicalMatch(item, [branch.id, branch.name])) {
        return { classId: normalizeId(branch.id), displayName: branch.name, assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
      }
    }
  }

  if (areaId === "buildings") {
    const building = data.buildings.find((row) => hasCanonicalMatch(item, [row.id, row.name, row.icon_name, row.model_name, row.asset_id]));
    if (building) {
      return { classId: normalizeId(building.category), displayName: building.category || "Buildings", assetRole: assetRoleFor(item), confidence: "linked_canonical_record" };
    }
    if (sharedByArea(areaId, item)) return { classId: "shared", displayName: sharedClass.displayName, assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
    const categories = [...new Set(data.buildings.map((row) => row.category).filter(Boolean))];
    for (const category of categories) {
      if (hasCanonicalMatch(item, [category])) return { classId: normalizeId(category), displayName: category, assetRole: assetRoleFor(item), confidence: "semantic_role_mapping" };
    }
  }

  return { classId: "unclassified", displayName: "Unclassified", assetRole: assetRoleFor(item), confidence: "unclassified" };
}

export function resolveProductionItemsForClass<TItem extends InventoryItem>(items: TItem[], areaId: string, classId: string, data: Pick<GameData, "research_branches" | "research" | "buildings" | "upgrades">) {
  if (classId === "all") return items;
  return items.filter((item) => resolveAssetClass(item, areaId, data).classId === classId);
}

export function resolveClassSummary<TItem extends InventoryItem>(classDefinition: ProductionClassDefinition, items: TItem[], areaId: string, data: Pick<GameData, "research_branches" | "research" | "buildings" | "upgrades">): ProductionClassSummary<TItem> {
  const classItems = resolveProductionItemsForClass(items, areaId, classDefinition.classId, data);
  const blockers = classItems
    .filter((item) => ["missing", "invalid", "needs_review", "unmapped"].includes(item.status))
    .sort((left, right) => topBlockerRank(left) - topBlockerRank(right) || left.displayName.localeCompare(right.displayName));
  return {
    ...classDefinition,
    itemCount: classItems.length,
    missingCount: classItems.filter((item) => item.status === "missing").length,
    publishedCount: classItems.filter((item) => item.status === "published").length,
    needsReviewCount: classItems.filter((item) => item.status === "needs_review").length,
    topBlocker: blockers[0] ?? null
  };
}

export function resolveProductionClassSummaries<TItem extends InventoryItem>(items: TItem[], areaId: string, data: Pick<GameData, "research_branches" | "research" | "buildings" | "upgrades">) {
  return resolveProductionClasses(areaId, data)
    .map((classDefinition) => resolveClassSummary(classDefinition, items, areaId, data))
    .filter((summary) => summary.itemCount > 0)
    .sort(sortByClassOrder);
}
