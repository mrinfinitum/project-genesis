import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { civilizationAges } from "@/data/civilization-identity";
import { getAppliedGameArtAssets } from "@/lib/assets/game-art-import";
import { getGameData } from "@/lib/data";
import { ResourceService } from "@/lib/resources/service";
import type { GameData, ResourceCatalogItem, Upgrade } from "@/types/schema";
import type {
  AssetDefinition,
  BalanceDefinition,
  ClientProfile,
  ClientProfiles,
  EraDefinition,
  GameRuntimeData,
  ImportConflict,
  ImportIssue,
  ImportPreview,
  ImportResult,
  ResourceDefinition,
  RuntimeMetadata,
  UpgradeCategory,
  UpgradeDefinition,
  VisibilityRules
} from "@/types/runtime";

export const gameRuntimeSchemaVersion = "game-runtime-v1";

export type CanonicalRuntimeExportPayload = GameRuntimeData;

export type RobloxRuntimeExportPayload = {
  metadata: RuntimeMetadata & { target: "roblox"; sourceSchemaVersion: string };
  eras: EraDefinition[];
  resources: ResourceDefinition[];
  upgradeTabs: Array<UpgradeCategory & { tabId: string; label: string }>;
  upgrades: Array<UpgradeDefinition & { tabId: string }>;
  assets: Array<AssetDefinition & { robloxAssetId: string | null }>;
  balance: BalanceDefinition;
  clientHints: ClientProfile;
};

type ImportStore = {
  appliedRuntimeData: GameRuntimeData | null;
  history: ImportResult[];
};

type ImportSourceType = ImportPreview["sourceType"];

export type RuntimeImportRequest = {
  sourceType?: ImportSourceType;
  source?: string;
  importedFrom?: string;
  sourceProject?: string;
  sourceFormat?: string;
  environment?: string;
  payload?: unknown;
};

const importStorePath = process.env.PROJECT_GENESIS_RUNTIME_IMPORT_STORE
  ? path.resolve(process.env.PROJECT_GENESIS_RUNTIME_IMPORT_STORE)
  : path.join(process.cwd(), "data", "game-runtime-imports.local.json");

const requiredEraNames = ["Survival", "Ancient", "Medieval", "Industrial", "Modern", "Space Age", "Interstellar", "Galactic"];
const requiredCategoryIds = ["workforce", "industry", "science", "technology"];
const legacyEraAliases = new Map<string, string>([
  ["survival", "survival"],
  ["village", "ancient"],
  ["town", "medieval"],
  ["industrial", "industrial"],
  ["industrial-empire", "industrial"],
  ["modern", "modern"],
  ["metropolis-prime", "modern"],
  ["future-core", "space-age"],
  ["cyberpunk-megacity", "interstellar"],
  ["high-tech-singularity", "interstellar"],
  ["eco-green-utopia", "galactic"],
  ["harmony-ascendant", "galactic"]
]);

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripAge(value: string) {
  return value.replace(/\s+age$/i, "").trim();
}

function display(value: unknown, fallback = "Untitled") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: unknown) {
  return asArray(value).map((item) => String(item)).filter(Boolean);
}

function asNumber(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function eraId(value: string) {
  const base = stripAge(value);
  if (/^space$/i.test(base)) return "space-age";
  return slug(base);
}

function eraIdFor(value: unknown) {
  const text = display(value, "Survival");
  const normalized = slug(text).replace(/^era-/, "");
  const canonicalCandidate = normalized.endsWith("-age") && normalized !== "space-age" ? normalized.replace(/-age$/, "") : normalized;
  const aliased = legacyEraAliases.get(canonicalCandidate);
  if (aliased) return aliased;
  const known = requiredEraNames.find((name) => slug(name) === canonicalCandidate || slug(stripAge(name)) === canonicalCandidate || slug(`${stripAge(name)} Age`) === canonicalCandidate);
  return known ? eraId(known) : eraId(text);
}

function resourceClass(resource: ResourceCatalogItem) {
  const category = resource.category.toLowerCase();
  if (/gas|chemical|compound|volatile|organic/.test(category)) return "Compound";
  if (/energy|exotic|ancient|data/.test(category)) return "Special";
  if (/metal|mineral|crystal|ice|planetary/.test(category)) return "Material";
  return "Material";
}

function eraForResource(resource: ResourceCatalogItem) {
  const tier = resource.discovery_tier.toLowerCase();
  if (tier.includes("earth")) return "survival";
  if (tier.includes("planet")) return "modern";
  if (tier.includes("space")) return "space-age";
  if (tier.includes("interstellar") || tier.includes("deep")) return "interstellar";
  if (tier.includes("galactic") || tier.includes("genesis")) return "galactic";
  return "survival";
}

function resourceToRuntime(resource: ResourceCatalogItem): ResourceDefinition {
  const discoveredEraId = eraForResource(resource);
  return {
    id: resource.id,
    name: resource.resource_name,
    displayName: resource.resource_name,
    resourceClass: resourceClass(resource),
    category: resource.category,
    rarity: resource.rarity,
    iconKey: `resource-${slug(resource.resource_name)}`,
    artKey: `resource-${slug(resource.resource_name)}`,
    color: resource.rarity_color,
    description: resource.description,
    discoveredEraId,
    usableEraId: discoveredEraId,
    tradable: Number(resource.base_trade_value) > 0,
    tags: [...new Set([resource.category, resource.rarity, resource.discovery_tier, ...resource.primary_uses, ...resource.typical_planet_classes].filter(Boolean))]
  };
}

function defaultEras(): EraDefinition[] {
  return requiredEraNames.map((name, index) => {
    const age = civilizationAges.find((item) => stripAge(item.name) === stripAge(name));
    const id = eraId(name);
    return {
      id,
      index: index + 1,
      name: stripAge(name),
      displayName: name,
      description: age?.description ?? `${name} progression era.`,
      unlockRequirements: index === 0 ? { start: true } : { previousEraId: eraId(requiredEraNames[index - 1]) },
      iconKey: `era-${id}`,
      artKey: `era-${id}`,
      themeKey: `theme-${id}`,
      masteryRequirements: {},
      tags: ["canonical", "runtime"]
    };
  });
}

function defaultCategories(): UpgradeCategory[] {
  return [
    ["workforce", "Workforce", "Population, labor, carrying capacity, and manual productivity."],
    ["industry", "Industry", "Materials, manufacturing, production chains, and infrastructure."],
    ["science", "Science", "Research output, discovery speed, and analysis capability."],
    ["technology", "Technology", "Automation, tools, unlock speed, and advanced systems."]
  ].map(([id, displayName, description], index) => ({
    id,
    displayName,
    description,
    order: index + 1,
    unlockedAtGameStart: index === 0,
    unlockRequirements: index === 0 ? { start: true } : {},
    iconKey: `upgrade-category-${id}`,
    themeKey: `theme-${id}`
  }));
}

function defaultProfile(overrides: Partial<ClientProfile> = {}): ClientProfile {
  return {
    defaultUpgradeRowsVisible: 4,
    futureUpgradeTeaserCount: 2,
    showUnknownUpgradeSlots: true,
    lockedOpacity: 0.45,
    availableGlowEnabled: true,
    ...overrides
  };
}

function defaultClientProfiles(): ClientProfiles {
  return {
    default: defaultProfile(),
    roblox: defaultProfile(),
    web: defaultProfile({ defaultUpgradeRowsVisible: 6, futureUpgradeTeaserCount: 3, lockedOpacity: 0.55 }),
    unity: defaultProfile({ defaultUpgradeRowsVisible: 5 }),
    unreal: defaultProfile({ defaultUpgradeRowsVisible: 5 }),
    godot: defaultProfile({ defaultUpgradeRowsVisible: 5 })
  };
}

function parseEffectValue(value: unknown) {
  if (typeof value === "number") return value;
  const match = String(value ?? "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function resolveResourceId(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text || text === "None" || text === "-") return null;
  return ResourceService.resolveId(text);
}

function visibilityRulesFor(eraIdValue: string, order: number): VisibilityRules {
  return {
    defaultState: order <= 1 ? "available" : "locked_discovered",
    revealRequirements: {},
    availableRequirements: { eraId: eraIdValue },
    hideUntilEraId: order > 6 ? eraIdValue : null,
    showTeaser: order > 1,
    teaserOrder: order
  };
}

function upgradeCategoryId(value: unknown) {
  const id = slug(display(value, "technology"));
  if (id.includes("labor") || id.includes("work")) return "workforce";
  if (id.includes("industry") || id.includes("production") || id.includes("build")) return "industry";
  if (id.includes("science") || id.includes("research")) return "science";
  if (id.includes("tech") || id.includes("tool")) return "technology";
  return id || "technology";
}

function upgradeToRuntime(upgrade: Upgrade, index: number): UpgradeDefinition {
  const categoryId = upgradeCategoryId(upgrade.type);
  const era = eraIdFor(upgrade.era);
  return {
    id: upgrade.id,
    categoryId,
    eraId: era,
    chainId: slug(upgrade.tier || upgrade.name || upgrade.id) || upgrade.id,
    order: index + 1,
    name: upgrade.name,
    displayName: upgrade.name,
    description: upgrade.description,
    iconKey: upgrade.icon_name || `upgrade-${slug(upgrade.name)}`,
    defaultLevel: 0,
    maxLevel: Math.max(1, Number(upgrade.max_level) || 1),
    baseCost: Math.max(0, Number(upgrade.base_cost) || 0),
    costResourceId: resolveResourceId(upgrade.cost_resource),
    costGrowthRate: Math.max(1, Number(upgrade.cost_multiplier) || 1),
    effectType: upgrade.bonus_type || "modifier",
    baseEffectValue: parseEffectValue(upgrade.bonus_value),
    effectGrowthRate: 1,
    unlockRequirements: Number(upgrade.unlock_level) > 0 ? { civilizationLevel: upgrade.unlock_level } : { start: true },
    nextUpgradeIds: [],
    visibilityRules: visibilityRulesFor(era, index + 1),
    tags: [...new Set([upgrade.type, upgrade.civilization, upgrade.era, upgrade.tier].filter(Boolean))]
  };
}

function assetToRuntime(asset: GameData["assets"][number]): AssetDefinition {
  const webPath = asset.file_url || "";
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type || "image",
    category: asset.category,
    artKey: slug(asset.name || asset.id),
    width: null,
    height: null,
    aspectRatio: null,
    status: asset.status || asset.export_status || "draft",
    notes: asset.notes || "",
    platformMappings: {
      ...(webPath ? { web: { path: webPath } } : {}),
      ...(asset.roblox_asset_id ? { roblox: { assetId: asset.roblox_asset_id } } : {})
    }
  };
}

function gameConstantsBalance(constants: GameData["game_constants"]): BalanceDefinition {
  const byKey = new Map(constants.map((row) => [slug(row.constant), row.value]));
  return {
    version: "balance-v1",
    startingCivilizationEnergy: asNumber(byKey.get("starting-civilization-energy"), 0),
    startingCoins: asNumber(byKey.get("starting-coins"), 0),
    startingResearch: asNumber(byKey.get("starting-research"), 0),
    startingPopulation: asNumber(byKey.get("starting-population"), 125),
    baseClickPower: asNumber(byKey.get("base-click-power"), 1),
    baseAutoClickPower: asNumber(byKey.get("base-auto-click-power"), 0),
    autosaveSeconds: asNumber(byKey.get("autosave-seconds"), 30),
    notes: "Canonical runtime balance derived from Studio game_constants with safe defaults.",
    environmentOverrides: {},
    difficultyProfileOverrides: {}
  };
}

function metadata(overrides: Partial<RuntimeMetadata> = {}): RuntimeMetadata {
  return {
    schemaVersion: gameRuntimeSchemaVersion,
    contentVersion: 1,
    checksum: "",
    accessLevel: "studio-internal",
    importedAt: new Date().toISOString(),
    importedFrom: "existing_project_migration",
    sourceProject: "Project Genesis Studio",
    sourceFormat: "studio",
    environment: "development",
    validationStatus: "Ready",
    ...overrides
  };
}

function relationshipMap(runtimeData: GameRuntimeData) {
  const upgradesByCategory: Record<string, string[]> = {};
  const upgradesByEra: Record<string, string[]> = {};
  const nextUpgradesByUpgrade: Record<string, string[]> = {};
  const assetsByKey: Record<string, string> = {};

  for (const upgrade of runtimeData.upgrades) {
    upgradesByCategory[upgrade.categoryId] = [...(upgradesByCategory[upgrade.categoryId] ?? []), upgrade.id];
    upgradesByEra[upgrade.eraId] = [...(upgradesByEra[upgrade.eraId] ?? []), upgrade.id];
    nextUpgradesByUpgrade[upgrade.id] = upgrade.nextUpgradeIds;
  }

  for (const asset of runtimeData.assets) {
    assetsByKey[asset.artKey] = asset.id;
  }

  return { upgradesByCategory, upgradesByEra, nextUpgradesByUpgrade, assetsByKey };
}

function duplicateIds<T extends { id: string }>(rows: T[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.id)) duplicates.add(row.id);
    seen.add(row.id);
  }
  return [...duplicates];
}

function byId<T extends { id: string }>(left: T, right: T) {
  return left.id.localeCompare(right.id);
}

function byOrderThenId<T extends { id: string; order?: number; index?: number }>(left: T, right: T) {
  return (left.order ?? left.index ?? 0) - (right.order ?? right.index ?? 0) || left.id.localeCompare(right.id);
}

function sortRuntimeData(runtimeData: GameRuntimeData): GameRuntimeData {
  return {
    ...runtimeData,
    eras: [...runtimeData.eras].sort(byOrderThenId),
    resources: [...runtimeData.resources].sort(byId),
    upgradeCategories: [...runtimeData.upgradeCategories].sort(byOrderThenId),
    upgrades: [...runtimeData.upgrades].sort(byOrderThenId),
    assets: [...runtimeData.assets].sort(byId),
    clientProfiles: {
      default: runtimeData.clientProfiles.default,
      roblox: runtimeData.clientProfiles.roblox,
      web: runtimeData.clientProfiles.web,
      unity: runtimeData.clientProfiles.unity,
      unreal: runtimeData.clientProfiles.unreal,
      godot: runtimeData.clientProfiles.godot
    }
  };
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function checksumFor(value: unknown) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function publicAsset(asset: AssetDefinition): AssetDefinition {
  const {
    sourceFileName: _sourceFileName,
    sourceExtension: _sourceExtension,
    mimeType: _mimeType,
    fileSizeBytes: _fileSizeBytes,
    storagePath: _storagePath,
    aliases: _aliases,
    tags: _tags,
    importedFrom: _importedFrom,
    importedAt: _importedAt,
    updatedAt: _updatedAt,
    variants: _variants,
    derivatives: _derivatives,
    usageReferences: _usageReferences,
    ...safeAsset
  } = asset;
  return {
    ...safeAsset,
    notes: "",
    platformMappings: {
      ...(asset.platformMappings.roblox?.assetId ? { roblox: { assetId: asset.platformMappings.roblox.assetId } } : {})
    }
  };
}

function withPublicMetadata<T extends GameRuntimeData | RobloxRuntimeExportPayload>(
  payload: T,
  validationStatus: RuntimeMetadata["validationStatus"]
): T {
  const withoutChecksum = {
    ...payload,
    metadata: {
      ...payload.metadata,
      checksum: "",
      accessLevel: "public-published" as const,
      environment: "published",
      validationStatus
    }
  };
  return {
    ...withoutChecksum,
    metadata: {
      ...withoutChecksum.metadata,
      checksum: checksumFor(withoutChecksum)
    }
  };
}

export async function buildCanonicalRuntimeExportPayload(): Promise<CanonicalRuntimeExportPayload> {
  const sorted = sortRuntimeData(await getGameRuntimeData());
  const safePayload = {
    ...sorted,
    assets: sorted.assets.map(publicAsset)
  };
  const validation = validateGameRuntimeData(safePayload);
  return withPublicMetadata(safePayload, validation.status);
}

export function validateGameRuntimeData(runtimeData: GameRuntimeData) {
  const issues: ImportIssue[] = [];
  const eraIds = new Set(runtimeData.eras.map((row) => row.id));
  const categoryIds = new Set(runtimeData.upgradeCategories.map((row) => row.id));
  const resourceIds = new Set(runtimeData.resources.map((row) => row.id));
  const upgradeIds = new Set(runtimeData.upgrades.map((row) => row.id));

  if (!runtimeData.metadata.schemaVersion) {
    issues.push({ severity: "error", code: "metadata_missing", message: "metadata.schemaVersion is required.", records: ["metadata"] });
  }

  for (const [moduleName, rows] of Object.entries({ eras: runtimeData.eras, resources: runtimeData.resources, upgradeCategories: runtimeData.upgradeCategories, upgrades: runtimeData.upgrades, assets: runtimeData.assets })) {
    const duplicates = duplicateIds(rows as Array<{ id: string }>);
    if (duplicates.length) {
      issues.push({ severity: "error", code: "duplicate_id", message: `${moduleName} contains duplicate IDs.`, records: duplicates });
    }
  }

  const missingEras = requiredEraNames.map(eraId).filter((id) => !eraIds.has(id));
  if (missingEras.length) {
    issues.push({ severity: "error", code: "missing_canonical_eras", message: "All canonical eras must be present.", records: missingEras });
  }

  const missingCategories = requiredCategoryIds.filter((id) => !categoryIds.has(id));
  if (missingCategories.length) {
    issues.push({ severity: "error", code: "missing_upgrade_categories", message: "The required upgrade categories must exist.", records: missingCategories });
  }

  for (const upgrade of runtimeData.upgrades) {
    if (!categoryIds.has(upgrade.categoryId)) {
      issues.push({ severity: "error", code: "upgrade_category_missing", message: "Upgrade category references must resolve.", records: [upgrade.id, upgrade.categoryId] });
    }
    if (!eraIds.has(upgrade.eraId)) {
      issues.push({ severity: "error", code: "upgrade_era_missing", message: "Upgrade era references must resolve.", records: [upgrade.id, upgrade.eraId] });
    }
    if (upgrade.costResourceId && !resourceIds.has(upgrade.costResourceId)) {
      issues.push({ severity: "error", code: "upgrade_resource_missing", message: "Upgrade cost resources must resolve to the Resource Catalog.", records: [upgrade.id, upgrade.costResourceId] });
    }
    for (const nextId of upgrade.nextUpgradeIds) {
      if (!upgradeIds.has(nextId)) {
        issues.push({ severity: "error", code: "next_upgrade_missing", message: "nextUpgradeIds must resolve.", records: [upgrade.id, nextId] });
      }
    }
  }

  const negativeBalance = Object.entries(runtimeData.balance)
    .filter(([, value]) => typeof value === "number" && value < 0)
    .map(([key]) => key);
  if (negativeBalance.length) {
    issues.push({ severity: "error", code: "negative_balance_value", message: "Balance values must be non-negative.", records: negativeBalance });
  }

  for (const [profileName, profile] of Object.entries(runtimeData.clientProfiles)) {
    if (profile.defaultUpgradeRowsVisible < 0 || profile.futureUpgradeTeaserCount < 0 || profile.lockedOpacity < 0 || profile.lockedOpacity > 1) {
      issues.push({ severity: "error", code: "invalid_client_profile", message: "Client profile fields must be valid.", records: [profileName] });
    }
  }

  for (const asset of runtimeData.assets) {
    for (const [platform, mapping] of Object.entries(asset.platformMappings)) {
      for (const [field, value] of Object.entries(mapping ?? {})) {
        if (typeof value !== "string") {
          issues.push({ severity: "error", code: "invalid_asset_mapping", message: "Platform asset mappings must use strings.", records: [asset.id, platform, field] });
        }
      }
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    valid: errorCount === 0,
    status: errorCount ? "Blocked" as const : warningCount ? "Ready With Warnings" as const : "Ready" as const,
    errorCount,
    warningCount,
    checkedAt: new Date().toISOString(),
    issues
  };
}

export function buildRobloxRuntimePayload(runtimeData: GameRuntimeData): RobloxRuntimeExportPayload {
  const sorted = sortRuntimeData(runtimeData);
  const payload: RobloxRuntimeExportPayload = {
    metadata: {
      ...sorted.metadata,
      target: "roblox",
      sourceSchemaVersion: sorted.metadata.schemaVersion
    },
    eras: sorted.eras,
    resources: sorted.resources,
    upgradeTabs: sorted.upgradeCategories.map((category) => ({
      ...category,
      tabId: category.id,
      label: category.displayName
    })),
    upgrades: sorted.upgrades.map((upgrade) => ({
      ...upgrade,
      tabId: upgrade.categoryId
    })),
    assets: sorted.assets.map(publicAsset).map((asset) => ({
      ...asset,
      robloxAssetId: asset.platformMappings.roblox?.assetId ?? null
    })),
    balance: sorted.balance,
    clientHints: sorted.clientProfiles.roblox ?? sorted.clientProfiles.default
  };
  const validation = validateRobloxRuntimePayload(payload);
  return withPublicMetadata(payload, validation.status);
}

export function validateRobloxRuntimePayload(payload: RobloxRuntimeExportPayload) {
  const issues: ImportIssue[] = [];
  const eraIds = new Set(payload.eras.map((era) => era.id));
  const resourceIds = new Set(payload.resources.map((resource) => resource.id));
  const tabIds = new Set(payload.upgradeTabs.map((tab) => tab.tabId));
  const assetKeys = new Set(payload.assets.flatMap((asset) => [asset.artKey, asset.id]));

  if (!payload.metadata.schemaVersion) {
    issues.push({ severity: "error", code: "metadata_schema_missing", message: "metadata.schemaVersion is required.", records: ["metadata"] });
  }
  if (!payload.metadata.contentVersion) {
    issues.push({ severity: "error", code: "metadata_version_missing", message: "metadata.contentVersion is required.", records: ["metadata"] });
  }
  if (payload.upgradeTabs.length !== 4) {
    issues.push({ severity: "error", code: "invalid_upgrade_tab_count", message: "Roblox runtime payload must expose exactly four upgrade tabs.", records: payload.upgradeTabs.map((tab) => tab.tabId) });
  }

  const duplicateTabs = duplicateIds(payload.upgradeTabs.map((tab) => ({ id: tab.tabId })));
  if (duplicateTabs.length) {
    issues.push({ severity: "error", code: "duplicate_tab_id", message: "Roblox upgrade tabs must have unique tabId values.", records: duplicateTabs });
  }

  for (const upgrade of payload.upgrades) {
    if (!tabIds.has(upgrade.tabId)) {
      issues.push({ severity: "error", code: "upgrade_tab_missing", message: "Every Roblox upgrade tabId must resolve to an upgrade tab.", records: [upgrade.id, upgrade.tabId] });
    }
    if (!eraIds.has(upgrade.eraId)) {
      issues.push({ severity: "error", code: "upgrade_era_missing", message: "Every Roblox upgrade eraId must resolve to an era.", records: [upgrade.id, upgrade.eraId] });
    }
    if (upgrade.costResourceId && !resourceIds.has(upgrade.costResourceId)) {
      issues.push({ severity: "error", code: "upgrade_resource_missing", message: "Every Roblox upgrade costResourceId must resolve to a resource.", records: [upgrade.id, upgrade.costResourceId] });
    }
    if (payload.assets.length && upgrade.iconKey && !assetKeys.has(upgrade.iconKey)) {
      issues.push({ severity: "warning", code: "upgrade_icon_unmapped", message: "Upgrade iconKey does not resolve to an exported Roblox asset mapping.", records: [upgrade.id, upgrade.iconKey] });
    }
  }

  for (const resource of payload.resources) {
    if (resource.discoveredEraId && !eraIds.has(resource.discoveredEraId)) {
      issues.push({ severity: "error", code: "resource_discovery_era_missing", message: "Resource discoveredEraId must resolve to an era.", records: [resource.id, resource.discoveredEraId] });
    }
    if (resource.usableEraId && !eraIds.has(resource.usableEraId)) {
      issues.push({ severity: "error", code: "resource_usable_era_missing", message: "Resource usableEraId must resolve to an era.", records: [resource.id, resource.usableEraId] });
    }
  }

  for (const asset of payload.assets) {
    const mapping = asset.platformMappings.roblox;
    if (mapping && typeof mapping.assetId !== "string") {
      issues.push({ severity: "error", code: "invalid_roblox_asset_mapping", message: "Roblox asset mappings must use string assetId values.", records: [asset.id] });
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    valid: errorCount === 0,
    status: errorCount ? "Blocked" as const : warningCount ? "Ready With Warnings" as const : "Ready" as const,
    errorCount,
    warningCount,
    checkedAt: new Date().toISOString(),
    issues
  };
}

async function readImportStore(): Promise<ImportStore> {
  try {
    const raw = await readFile(importStorePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ImportStore>;
    return {
      appliedRuntimeData: parsed.appliedRuntimeData ?? null,
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    return { appliedRuntimeData: null, history: [] };
  }
}

async function writeImportStore(store: ImportStore) {
  await mkdir(path.dirname(importStorePath), { recursive: true });
  await writeFile(importStorePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function buildBaseGameRuntimeData(): Promise<GameRuntimeData> {
  const [data, importedAssets] = await Promise.all([getGameData(), getAppliedGameArtAssets()]);
  const categories = new Map(defaultCategories().map((row) => [row.id, row]));
  const upgrades = data.upgrades.map(upgradeToRuntime);

  for (const upgrade of upgrades) {
    if (!categories.has(upgrade.categoryId)) {
      categories.set(upgrade.categoryId, {
        id: upgrade.categoryId,
        displayName: display(upgrade.categoryId.replaceAll("-", " ")),
        description: "Imported or derived upgrade category.",
        order: categories.size + 1,
        unlockedAtGameStart: false,
        unlockRequirements: {},
        iconKey: `upgrade-category-${upgrade.categoryId}`,
        themeKey: `theme-${upgrade.categoryId}`
      });
    }
  }

  return {
    metadata: metadata(),
    eras: defaultEras(),
    resources: ResourceService.catalog.map(resourceToRuntime),
    upgradeCategories: [...categories.values()].sort((left, right) => left.order - right.order),
    upgrades,
    assets: [...data.assets.map(assetToRuntime), ...importedAssets],
    balance: gameConstantsBalance(data.game_constants),
    clientProfiles: defaultClientProfiles()
  };
}

export async function getGameRuntimeData() {
  const [base, store] = await Promise.all([buildBaseGameRuntimeData(), readImportStore()]);
  if (!store.appliedRuntimeData) return base;

  return {
    ...base,
    ...store.appliedRuntimeData,
    metadata: {
      ...store.appliedRuntimeData.metadata,
      validationStatus: validateGameRuntimeData(store.appliedRuntimeData).status
    },
    resources: base.resources
  };
}

function normalizeImportedEras(payload: Record<string, unknown>, fallback: EraDefinition[]) {
  const rows = asArray(payload.eras);
  if (!rows.length) return fallback;

  return rows.map((item, index): EraDefinition => {
    const row = asRecord(item);
    const displayName = display(row.displayName ?? row.name, requiredEraNames[index] ?? "Era");
    const id = eraIdFor(row.id ?? displayName);
    return {
      id,
      index: asNumber(row.index ?? row.order, index + 1),
      name: display(row.name, stripAge(displayName)),
      displayName,
      description: display(row.description, `${displayName} progression era.`),
      unlockRequirements: asRecord(row.unlockRequirements),
      iconKey: display(row.iconKey, `era-${slug(displayName)}`),
      artKey: display(row.artKey, `era-${slug(displayName)}`),
      themeKey: display(row.themeKey, `theme-${slug(displayName)}`),
      masteryRequirements: asRecord(row.masteryRequirements),
      tags: asStringArray(row.tags)
    };
  });
}

function normalizeImportedCategories(payload: Record<string, unknown>, fallback: UpgradeCategory[]) {
  const rows = asArray(payload.upgradeCategories ?? payload.upgrade_tabs ?? payload.upgradeTabs);
  if (!rows.length) return fallback;

  return rows.map((item, index): UpgradeCategory => {
    const row = asRecord(item);
    const id = slug(display(row.id ?? row.tabId ?? row.name ?? row.displayName, `category-${index + 1}`));
    return {
      id,
      displayName: display(row.displayName ?? row.name, id),
      description: display(row.description, "Imported upgrade category."),
      order: asNumber(row.order, index + 1),
      unlockedAtGameStart: asBoolean(row.unlockedAtGameStart, index === 0),
      unlockRequirements: asRecord(row.unlockRequirements),
      iconKey: display(row.iconKey, `upgrade-category-${id}`),
      themeKey: display(row.themeKey, `theme-${id}`)
    };
  });
}

function normalizeImportedUpgrades(payload: Record<string, unknown>, fallback: UpgradeDefinition[]) {
  const rows = asArray(payload.upgrades);
  if (!rows.length) return fallback;

  return rows.map((item, index): UpgradeDefinition => {
    const row = asRecord(item);
    const categoryId = slug(display(row.categoryId ?? row.tabId ?? row.type, "technology"));
    const eraIdValue = eraIdFor(row.eraId ?? row.era);
    return {
      id: display(row.id, `upgrade-${index + 1}`),
      categoryId,
      eraId: eraIdValue,
      chainId: display(row.chainId, slug(display(row.chain ?? row.tier ?? row.name, `chain-${index + 1}`))),
      order: asNumber(row.order, index + 1),
      name: display(row.name, `Upgrade ${index + 1}`),
      displayName: display(row.displayName ?? row.name, `Upgrade ${index + 1}`),
      description: display(row.description, "Imported upgrade."),
      iconKey: display(row.iconKey ?? row.icon_name, `upgrade-${slug(display(row.name, `upgrade-${index + 1}`))}`),
      defaultLevel: asNumber(row.defaultLevel, 0),
      maxLevel: Math.max(1, asNumber(row.maxLevel ?? row.max_level, 1)),
      baseCost: Math.max(0, asNumber(row.baseCost ?? row.base_cost, 0)),
      costResourceId: resolveResourceId(row.costResourceId ?? row.cost_resource),
      costGrowthRate: Math.max(1, asNumber(row.costGrowthRate ?? row.cost_multiplier, 1)),
      effectType: display(row.effectType ?? row.bonus_type, "modifier"),
      baseEffectValue: asNumber(row.baseEffectValue, parseEffectValue(row.bonus_value)),
      effectGrowthRate: asNumber(row.effectGrowthRate, 1),
      unlockRequirements: asRecord(row.unlockRequirements),
      nextUpgradeIds: asStringArray(row.nextUpgradeIds ?? row.next_upgrades),
      visibilityRules: { ...visibilityRulesFor(eraIdValue, index + 1), ...asRecord(row.visibilityRules) } as VisibilityRules,
      tags: asStringArray(row.tags)
    };
  });
}

function normalizeImportedAssets(payload: Record<string, unknown>, fallback: AssetDefinition[]) {
  const rows = asArray(payload.assets);
  if (!rows.length) return fallback;

  return rows.map((item, index): AssetDefinition => {
    const row = asRecord(item);
    const id = display(row.id, `asset-${index + 1}`);
    return {
      id,
      name: display(row.name, id),
      type: display(row.type, "image"),
      category: display(row.category, "runtime"),
      artKey: display(row.artKey, slug(display(row.name, id))),
      width: row.width == null ? null : asNumber(row.width, 0),
      height: row.height == null ? null : asNumber(row.height, 0),
      aspectRatio: row.aspectRatio == null ? null : String(row.aspectRatio),
      status: display(row.status, "imported"),
      notes: display(row.notes, ""),
      platformMappings: asRecord(row.platformMappings) as AssetDefinition["platformMappings"]
    };
  });
}

function normalizeBalance(payload: Record<string, unknown>, fallback: BalanceDefinition): BalanceDefinition {
  const row = asRecord(payload.balance);
  if (!Object.keys(row).length) return fallback;
  return {
    ...fallback,
    version: display(row.version, fallback.version),
    startingCivilizationEnergy: asNumber(row.startingCivilizationEnergy, fallback.startingCivilizationEnergy),
    startingCoins: asNumber(row.startingCoins, fallback.startingCoins),
    startingResearch: asNumber(row.startingResearch, fallback.startingResearch),
    startingPopulation: asNumber(row.startingPopulation, fallback.startingPopulation),
    baseClickPower: asNumber(row.baseClickPower, fallback.baseClickPower),
    baseAutoClickPower: asNumber(row.baseAutoClickPower, fallback.baseAutoClickPower),
    autosaveSeconds: asNumber(row.autosaveSeconds, fallback.autosaveSeconds),
    notes: display(row.notes, fallback.notes),
    environmentOverrides: asRecord(row.environmentOverrides) as BalanceDefinition["environmentOverrides"],
    difficultyProfileOverrides: asRecord(row.difficultyProfileOverrides) as BalanceDefinition["difficultyProfileOverrides"]
  };
}

function normalizeClientProfiles(payload: Record<string, unknown>, fallback: ClientProfiles): ClientProfiles {
  const profiles = asRecord(payload.clientProfiles ?? payload.clientHints);
  if (!Object.keys(profiles).length) return fallback;

  const mergeProfile = (key: keyof ClientProfiles): ClientProfile => ({ ...fallback[key], ...asRecord(profiles[key]) });
  return {
    default: mergeProfile("default"),
    roblox: mergeProfile("roblox"),
    web: mergeProfile("web"),
    unity: mergeProfile("unity"),
    unreal: mergeProfile("unreal"),
    godot: mergeProfile("godot")
  };
}

function normalizedImportRuntimeData(base: GameRuntimeData, request: RuntimeImportRequest, contentVersion: number): GameRuntimeData {
  const payload = asRecord(request.payload);
  return {
    metadata: metadata({
      contentVersion,
      importedFrom: request.importedFrom ?? request.sourceType ?? "pasted_json",
      sourceProject: request.sourceProject ?? display(asRecord(payload.metadata).sourceProject, "Project Genesis Prototype"),
      sourceFormat: request.sourceFormat ?? "json",
      environment: request.environment ?? "development"
    }),
    eras: normalizeImportedEras(payload, base.eras),
    resources: base.resources,
    upgradeCategories: normalizeImportedCategories(payload, base.upgradeCategories),
    upgrades: normalizeImportedUpgrades(payload, base.upgrades),
    assets: normalizeImportedAssets(payload, base.assets),
    balance: normalizeBalance(payload, base.balance),
    clientProfiles: normalizeClientProfiles(payload, base.clientProfiles)
  };
}

function compareRecords<T extends { id: string }>(moduleName: string, baseRows: T[], importedRows: T[], conflicts: ImportConflict[]) {
  const baseById = new Map(baseRows.map((row) => [row.id, row]));
  const newRecords: string[] = [];
  const updatedRecords: string[] = [];
  const unchangedRecords: string[] = [];

  for (const row of importedRows) {
    const existing = baseById.get(row.id);
    if (!existing) {
      newRecords.push(row.id);
      continue;
    }
    if (JSON.stringify(existing) === JSON.stringify(row)) {
      unchangedRecords.push(row.id);
      continue;
    }
    updatedRecords.push(row.id);
    for (const [field, importedValue] of Object.entries(row)) {
      const studioValue = (existing as Record<string, unknown>)[field];
      if (JSON.stringify(studioValue) !== JSON.stringify(importedValue) && importedValue !== "" && importedValue !== null && importedValue !== undefined) {
        conflicts.push({
          id: row.id,
          category: moduleName as ImportConflict["category"],
          field,
          studioValue,
          importedValue,
          recommendedResolution: moduleName === "resources" ? "keep_studio" : "merge"
        });
      }
    }
  }

  return { newRecords, updatedRecords, unchangedRecords };
}

export async function createImportPreview(request: RuntimeImportRequest = {}): Promise<ImportPreview> {
  const [base, store] = await Promise.all([buildBaseGameRuntimeData(), readImportStore()]);
  const contentVersion = Math.max(base.metadata.contentVersion, store.appliedRuntimeData?.metadata.contentVersion ?? 1) + 1;
  const normalized = normalizedImportRuntimeData(base, request, contentVersion);
  const validation = validateGameRuntimeData(normalized);
  normalized.metadata.validationStatus = validation.status;

  const conflicts: ImportConflict[] = [];
  const eraChanges = compareRecords("eras", base.eras, normalized.eras, conflicts);
  const resourceChanges = compareRecords("resources", base.resources, normalized.resources, conflicts);
  const categoryChanges = compareRecords("upgradeCategories", base.upgradeCategories, normalized.upgradeCategories, conflicts);
  const upgradeChanges = compareRecords("upgrades", base.upgrades, normalized.upgrades, conflicts);
  const assetChanges = compareRecords("assets", base.assets, normalized.assets, conflicts);
  const missingReferences = validation.issues.filter((issue) => /missing|resolve|reference/i.test(`${issue.code} ${issue.message}`));

  return {
    id: `runtime-import-${Date.now()}`,
    source: request.source ?? request.importedFrom ?? "Pasted JSON",
    sourceType: request.sourceType ?? "pasted_json",
    createdAt: new Date().toISOString(),
    validation,
    counts: {
      eras: normalized.eras.length,
      resources: normalized.resources.length,
      categories: normalized.upgradeCategories.length,
      upgrades: normalized.upgrades.length,
      assets: normalized.assets.length,
      balanceValues: 7,
      clientProfiles: Object.keys(normalized.clientProfiles).length
    },
    changes: {
      newRecords: {
        eras: eraChanges.newRecords,
        resources: resourceChanges.newRecords,
        upgradeCategories: categoryChanges.newRecords,
        upgrades: upgradeChanges.newRecords,
        assets: assetChanges.newRecords
      },
      updatedRecords: {
        eras: eraChanges.updatedRecords,
        resources: resourceChanges.updatedRecords,
        upgradeCategories: categoryChanges.updatedRecords,
        upgrades: upgradeChanges.updatedRecords,
        assets: assetChanges.updatedRecords
      },
      unchangedRecords: {
        eras: eraChanges.unchangedRecords,
        resources: resourceChanges.unchangedRecords,
        upgradeCategories: categoryChanges.unchangedRecords,
        upgrades: upgradeChanges.unchangedRecords,
        assets: assetChanges.unchangedRecords
      },
      conflicts,
      missingReferences
    },
    relationshipMap: relationshipMap(normalized),
    normalizedRuntimeData: normalized
  };
}

export async function applyImportPreview(request: RuntimeImportRequest = {}) {
  const preview = await createImportPreview(request);
  if (!preview.validation.valid) {
    return { ok: false as const, status: 409, preview };
  }

  const store = await readImportStore();
  const result: ImportResult = {
    importId: preview.id,
    source: preview.source,
    timestamp: new Date().toISOString(),
    schemaVersion: preview.normalizedRuntimeData.metadata.schemaVersion,
    recordsAdded: Object.values(preview.changes.newRecords).reduce((sum, rows) => sum + rows.length, 0),
    recordsUpdated: Object.values(preview.changes.updatedRecords).reduce((sum, rows) => sum + rows.length, 0),
    conflicts: preview.changes.conflicts.length,
    result: "applied"
  };

  await writeImportStore({
    appliedRuntimeData: preview.normalizedRuntimeData,
    history: [result, ...store.history].slice(0, 50)
  });

  return { ok: true as const, status: 200, preview, result };
}

export async function getRuntimeImportWorkspaceState() {
  const [runtimeData, store] = await Promise.all([getGameRuntimeData(), readImportStore()]);
  const validation = validateGameRuntimeData(runtimeData);
  return {
    runtimeData: { ...runtimeData, metadata: { ...runtimeData.metadata, validationStatus: validation.status } },
    validation,
    history: store.history,
    endpoint: "/api/export/game-runtime-data.json",
    previewEndpoint: "/api/game-runtime/import/preview",
    applyEndpoint: "/api/game-runtime/import/apply"
  };
}
