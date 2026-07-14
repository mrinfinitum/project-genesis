import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { civilizationAges } from "@/data/civilization-identity";
import { defaultAiAgentId, getAiAgentRuntimeModules } from "@/lib/ai-agents";
import { getAssetProductionRuntimeOverrides } from "@/lib/assets/asset-production";
import { getAppliedGameArtAssets } from "@/lib/assets/game-art-import";
import { getGameData } from "@/lib/data";
import {
  buildEconomyUsageRelationships,
  buildEraEconomyProfiles,
  buildInventoryResourceMetadata,
  buildPrimaryHudSlots,
  canonicalEconomyDefinitions,
  isEconomyId,
  materialResourceIdsThatMustNotBeHud,
  primaryHudEconomyIds,
  resolveEconomyId
} from "@/lib/economy/definitions";
import { ResourceService } from "@/lib/resources/service";
import { engineEraNavigationOverrides, resolveEraNavigationProfile, supportedEraNavigationBoundaryModes, supportedEraNavigationDashboardModes } from "@/lib/runtime/client-profiles";
import { buildMobileClientProfile } from "@/lib/runtime/mobile-client-profiles";
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
export const gameRuntimeContentVersion = 12;

export type CanonicalRuntimeExportPayload = GameRuntimeData;

export type RobloxRuntimeExportPayload = {
  metadata: RuntimeMetadata & { target: "roblox"; sourceSchemaVersion: string };
  eras: EraDefinition[];
  economyDefinitions: GameRuntimeData["economyDefinitions"];
  eraEconomyProfiles: GameRuntimeData["eraEconomyProfiles"];
  economyUsageRelationships: GameRuntimeData["economyUsageRelationships"];
  inventoryResourceMetadata: GameRuntimeData["inventoryResourceMetadata"];
  aiAgents: GameRuntimeData["aiAgents"];
  aiAgentPersonalities: GameRuntimeData["aiAgentPersonalities"];
  aiAgentAnimationProfiles: GameRuntimeData["aiAgentAnimationProfiles"];
  automationPresentation: GameRuntimeData["automationPresentation"];
  defaultAiAgentId: GameRuntimeData["defaultAiAgentId"];
  aiAgentSaveSchema: GameRuntimeData["aiAgentSaveSchema"];
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

const canonicalEraDefinitions = [
  { id: "survival", name: "survival", displayName: "Survival", shortDisplayName: "Survival" },
  { id: "ancient", name: "ancient", displayName: "Ancient", shortDisplayName: "Ancient" },
  { id: "medieval", name: "medieval", displayName: "Medieval", shortDisplayName: "Medieval" },
  { id: "renaissance", name: "renaissance", displayName: "Renaissance", shortDisplayName: "Renaissance" },
  { id: "industrial", name: "industrial", displayName: "Industrial", shortDisplayName: "Industrial" },
  { id: "modern", name: "modern", displayName: "Modern", shortDisplayName: "Modern" },
  { id: "space-age", name: "space-age", displayName: "Space Age", shortDisplayName: "Space" },
  { id: "interstellar", name: "interstellar", displayName: "Interstellar", shortDisplayName: "Interstellar" },
  { id: "galactic", name: "galactic", displayName: "Galactic", shortDisplayName: "Galactic" }
] as const;
const requiredEraNames = canonicalEraDefinitions.map((era) => era.displayName);
const requiredCategoryIds = ["workforce", "industry", "science", "technology"];
const legacyEraAliases = new Map<string, string>([
  ["survival", "survival"],
  ["village", "ancient"],
  ["town", "medieval"],
  ["renaissance", "renaissance"],
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
  return canonicalEraDefinitions.map((definition, index) => {
    const age = civilizationAges.find((item) => stripAge(item.name) === stripAge(definition.displayName));
    return {
      id: definition.id,
      index: index + 1,
      name: definition.name,
      displayName: definition.displayName,
      shortDisplayName: definition.shortDisplayName,
      description: age?.description ?? `${definition.displayName} progression era.`,
      unlockRequirements: index === 0 ? { start: true } : { previousEraId: canonicalEraDefinitions[index - 1].id },
      iconKey: `era-${definition.id}`,
      artKey: `era-${definition.id}`,
      themeKey: `theme-${definition.id}`,
      masteryRequirements: {},
      completionPercent: index === 0 ? 100 : index === 1 ? 72 : index === 2 ? 38 : 0,
      researchProgress: index <= 2 ? Math.max(15, 100 - index * 28) : 0,
      buildingProgress: index <= 2 ? Math.max(10, 100 - index * 32) : 0,
      missingArtwork: true,
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
  const primaryHudSlots = buildPrimaryHudSlots();
  return {
    defaultUpgradeRowsVisible: 4,
    futureUpgradeTeaserCount: 2,
    showUnknownUpgradeSlots: true,
    lockedOpacity: 0.45,
    availableGlowEnabled: true,
    primaryHudResources: [...primaryHudEconomyIds],
    primaryHudSlots,
    eraNavigation: resolveEraNavigationProfile(),
    ...overrides
  };
}

function defaultClientProfiles(): ClientProfiles {
  const defaultClientProfile = defaultProfile();
  const webProfile = defaultProfile({ defaultUpgradeRowsVisible: 6, futureUpgradeTeaserCount: 3, lockedOpacity: 0.55, eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.web) });
  return {
    default: defaultClientProfile,
    roblox: defaultProfile({ eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.roblox) }),
    web: webProfile,
    unity: defaultProfile({ defaultUpgradeRowsVisible: 5, eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.unity) }),
    unreal: defaultProfile({ defaultUpgradeRowsVisible: 5, eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.unreal) }),
    godot: defaultProfile({ defaultUpgradeRowsVisible: 5, eraNavigation: resolveEraNavigationProfile(engineEraNavigationOverrides.godot) }),
    ios: buildMobileClientProfile("ios", webProfile),
    android: buildMobileClientProfile("android", webProfile)
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
  if (resolveEconomyId(text)) return null;
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
  const costEconomyId = resolveEconomyId(upgrade.cost_resource);
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
    costEconomyId,
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
  const economyById = new Map(canonicalEconomyDefinitions.map((definition) => [definition.id, definition]));
  const populationDefault = economyById.get("ECON-POPULATION")?.startingAmount ?? 5;
  return {
    version: "balance-v1",
    startingCivilizationEnergy: asNumber(byKey.get("starting-civilization-energy"), economyById.get("ECON-CIVILIZATION-ENERGY")?.startingAmount ?? 0),
    startingCoins: asNumber(byKey.get("starting-coins"), economyById.get("ECON-CREDITS")?.startingAmount ?? 0),
    startingResearch: asNumber(byKey.get("starting-research"), economyById.get("ECON-RESEARCH")?.startingAmount ?? 0),
    startingPopulation: asNumber(byKey.get("starting-population"), populationDefault),
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
    contentVersion: gameRuntimeContentVersion,
    checksum: "",
    accessLevel: "studio-internal",
    importedAt: "2026-07-12T00:00:00.000Z",
    importedFrom: "existing_project_migration",
    sourceProject: "Project Genesis Studio",
    sourceFormat: "studio",
    environment: "development",
    validationStatus: "Ready",
    saveMigrationHints: [
      {
        id: "migration_population_default_125_to_5",
        targetId: "ECON-POPULATION",
        field: "startingAmount",
        previousDefault: 125,
        currentDefault: 5,
        applyOnlyWhen: "A save has no activity/progression markers and Population exactly equals the old untouched starter default of 125.",
        preserveRule: "Preserve Population 125 or higher when the save has earned resources, completed research, built structures, manual changes, or any other sign of established play.",
        introducedContentVersion: 8,
        notes: "Population is citizen/workforce capacity, not a spendable manual-click currency. Clients should not silently reset established saves."
      },
      {
        id: "migration_selected_ai_agent_default",
        targetId: defaultAiAgentId,
        field: "selectedAiAgentId",
        previousDefault: null,
        currentDefault: defaultAiAgentId,
        applyOnlyWhen: "A save does not contain selectedAiAgentId.",
        preserveRule: "If a save contains an unknown selectedAiAgentId, clients should render the default AI Agent while preserving the unresolved value for diagnostics.",
        introducedContentVersion: 12,
        notes: "AI Agent is a cosmetic/presentation companion layer over the existing automation system."
      }
    ],
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

function duplicateNumbers(rows: number[]) {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  for (const row of rows) {
    if (seen.has(row)) duplicates.add(row);
    seen.add(row);
  }
  return [...duplicates];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
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
    economyDefinitions: [...runtimeData.economyDefinitions].sort(byId),
    eraEconomyProfiles: [...runtimeData.eraEconomyProfiles]
      .map((profile) => ({
        ...profile,
        primaryEconomyId: profile.primaryEconomyId ?? profile.activePrimaryEconomyId ?? profile.primaryEconomyIds[0]
      }))
      .sort((left, right) => left.eraIndex - right.eraIndex || left.eraId.localeCompare(right.eraId)),
    inventoryResourceMetadata: [...runtimeData.inventoryResourceMetadata].sort(byId),
    aiAgents: [...runtimeData.aiAgents].sort(byId),
    aiAgentPersonalities: [...runtimeData.aiAgentPersonalities].sort(byId),
    aiAgentAnimationProfiles: [...runtimeData.aiAgentAnimationProfiles].sort(byId),
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
      godot: runtimeData.clientProfiles.godot,
      ios: runtimeData.clientProfiles.ios,
      android: runtimeData.clientProfiles.android
    }
  };
}

function withCanonicalEraDefinitions(runtimeData: GameRuntimeData): GameRuntimeData {
  const currentById = new Map(runtimeData.eras.map((era) => [era.id, era]));
  return {
    ...runtimeData,
    metadata: {
      ...runtimeData.metadata,
      contentVersion: Math.max(runtimeData.metadata.contentVersion, gameRuntimeContentVersion)
    },
    eras: canonicalEraDefinitions.map((definition, index) => {
      const current = currentById.get(definition.id);
      const fallbackDescription = civilizationAges.find((item) => stripAge(item.name) === stripAge(definition.displayName))?.description ?? `${definition.displayName} progression era.`;
      return {
        ...(current ?? {}),
        id: definition.id,
        index: index + 1,
        name: definition.name,
        displayName: definition.displayName,
        shortDisplayName: definition.shortDisplayName,
        description: current?.description ?? fallbackDescription,
        unlockRequirements: index === 0 ? { start: true } : { previousEraId: canonicalEraDefinitions[index - 1].id },
        iconKey: current?.iconKey ?? `era-${definition.id}`,
        artKey: current?.artKey ?? `era-${definition.id}`,
        themeKey: current?.themeKey ?? `theme-${definition.id}`,
        masteryRequirements: current?.masteryRequirements ?? {},
        tags: current?.tags ?? ["canonical", "runtime"]
      };
    })
  };
}

function validateCanonicalEraProgression(eras: EraDefinition[], issues: ImportIssue[], context: string) {
  const sortedEras = [...eras].sort(byOrderThenId);
  const expectedIds = canonicalEraDefinitions.map((era) => era.id);
  const duplicateIndexes = duplicateNumbers(eras.map((era) => era.index));

  if (eras.length !== canonicalEraDefinitions.length) {
    issues.push({
      severity: "error",
      code: "invalid_canonical_era_count",
      message: `${context} must contain exactly nine canonical eras.`,
      records: [`expected:${canonicalEraDefinitions.length}`, `received:${eras.length}`]
    });
  }

  if (duplicateIndexes.length) {
    issues.push({
      severity: "error",
      code: "duplicate_era_index",
      message: `${context} era indexes must be unique.`,
      records: duplicateIndexes.map(String)
    });
  }

  for (let index = 0; index < canonicalEraDefinitions.length; index += 1) {
    const expected = canonicalEraDefinitions[index];
    const era = sortedEras[index];
    const expectedIndex = index + 1;

    if (!era || era.id !== expected.id) {
      issues.push({
        severity: "error",
        code: "invalid_canonical_era_order",
        message: `${context} eras must follow the canonical progression order.`,
        records: [`position:${expectedIndex}`, `expected:${expected.id}`, `received:${era?.id ?? "(missing)"}`]
      });
      continue;
    }

    if (era.index !== expectedIndex) {
      issues.push({
        severity: "error",
        code: "invalid_era_index",
        message: `${context} era indexes must be sequential and one-based.`,
        records: [era.id, `expected:${expectedIndex}`, `received:${era.index}`]
      });
    }

    if (era.displayName !== expected.displayName || era.shortDisplayName !== expected.shortDisplayName) {
      issues.push({
        severity: "error",
        code: "invalid_era_display_metadata",
        message: `${context} era display metadata must match the canonical progression.`,
        records: [era.id]
      });
    }
  }

  const renaissanceIndex = sortedEras.findIndex((era) => era.id === "renaissance");
  if (renaissanceIndex !== 3 || sortedEras[2]?.id !== "medieval" || sortedEras[4]?.id !== "industrial") {
    issues.push({
      severity: "error",
      code: "invalid_renaissance_position",
      message: `${context} must place Renaissance immediately after Medieval and before Industrial.`,
      records: sortedEras.map((era) => era.id)
    });
  }

  const renaissance = eras.find((era) => era.id === "renaissance");
  if (!renaissance || renaissance.index !== 4 || renaissance.name !== "renaissance" || renaissance.displayName !== "Renaissance" || renaissance.shortDisplayName !== "Renaissance") {
    issues.push({
      severity: "error",
      code: "invalid_renaissance_record",
      message: `${context} Renaissance era record must use the canonical id, index, name, displayName, and shortDisplayName.`,
      records: renaissance ? [JSON.stringify({
        id: renaissance.id,
        index: renaissance.index,
        name: renaissance.name,
        displayName: renaissance.displayName,
        shortDisplayName: renaissance.shortDisplayName
      })] : ["renaissance"]
    });
  }

  const missingExpectedIds = expectedIds.filter((id) => !eras.some((era) => era.id === id));
  if (missingExpectedIds.length) {
    issues.push({
      severity: "error",
      code: "missing_canonical_eras",
      message: `${context} must include every canonical era.`,
      records: missingExpectedIds
    });
  }
}

function validateEraEconomyProfiles(runtimeData: Pick<GameRuntimeData, "eras" | "economyDefinitions" | "eraEconomyProfiles">, issues: ImportIssue[], context: string) {
  const eraIds = new Set(runtimeData.eras.map((era) => era.id));
  const economyIds = new Set(runtimeData.economyDefinitions.map((definition) => definition.id));
  const expectedFixedHud = [...primaryHudEconomyIds];
  const profileEraIds = new Set(runtimeData.eraEconomyProfiles.map((profile) => profile.eraId));
  const duplicateProfileIds = duplicateIds(runtimeData.eraEconomyProfiles);
  const expectedEraIds = canonicalEraDefinitions.map((era) => era.id);
  const missingProfiles = expectedEraIds.filter((eraIdValue) => !profileEraIds.has(eraIdValue));

  if (runtimeData.eraEconomyProfiles.length !== canonicalEraDefinitions.length) {
    issues.push({
      severity: "error",
      code: "invalid_era_economy_profile_count",
      message: `${context} must include one eraEconomyProfile per canonical era.`,
      records: [`expected:${canonicalEraDefinitions.length}`, `received:${runtimeData.eraEconomyProfiles.length}`]
    });
  }

  if (duplicateProfileIds.length) {
    issues.push({ severity: "error", code: "duplicate_era_economy_profile_id", message: `${context} eraEconomyProfiles must use unique IDs.`, records: duplicateProfileIds });
  }

  if (missingProfiles.length) {
    issues.push({ severity: "error", code: "missing_era_economy_profiles", message: `${context} is missing era economy profiles.`, records: missingProfiles });
  }

  for (const profile of runtimeData.eraEconomyProfiles) {
    if (!eraIds.has(profile.eraId)) {
      issues.push({ severity: "error", code: "era_economy_profile_era_missing", message: "eraEconomyProfile.eraId must resolve to a canonical era.", records: [profile.id, profile.eraId] });
    }
    if (!profile.primaryEconomyId) {
      issues.push({ severity: "error", code: "era_economy_primary_id_missing", message: "eraEconomyProfile.primaryEconomyId is required so clients do not infer the primary economy from manualClickTarget.", records: [profile.id] });
    }
    if (profile.primaryEconomyId && !economyIds.has(profile.primaryEconomyId)) {
      issues.push({ severity: "error", code: "era_economy_primary_id_invalid", message: "eraEconomyProfile.primaryEconomyId must resolve to a canonical economy definition.", records: [profile.id, profile.primaryEconomyId] });
    }
    if (profile.primaryEconomyId && profile.activePrimaryEconomyId && profile.primaryEconomyId !== profile.activePrimaryEconomyId) {
      issues.push({ severity: "error", code: "era_economy_primary_id_mismatch", message: "eraEconomyProfile.primaryEconomyId must match activePrimaryEconomyId during the v9 compatibility window.", records: [profile.id, profile.primaryEconomyId, profile.activePrimaryEconomyId] });
    }
    if (profile.primaryEconomyId && !profile.primaryEconomyIds.includes(profile.primaryEconomyId)) {
      issues.push({ severity: "error", code: "era_economy_primary_id_not_listed", message: "eraEconomyProfile.primaryEconomyId must also be listed in primaryEconomyIds.", records: [profile.id, profile.primaryEconomyId] });
    }
    if (!economyIds.has(profile.activePrimaryEconomyId)) {
      issues.push({ severity: "error", code: "era_economy_primary_missing", message: "eraEconomyProfile.activePrimaryEconomyId must resolve to a canonical economy definition.", records: [profile.id, profile.activePrimaryEconomyId] });
    }
    if (!profile.primaryEconomyIds.includes(profile.activePrimaryEconomyId)) {
      issues.push({ severity: "error", code: "era_economy_primary_not_listed", message: "The active primary economy must also be listed in primaryEconomyIds.", records: [profile.id, profile.activePrimaryEconomyId] });
    }

    const displayOverrideEconomyIds = Object.keys(profile.displayOverrides ?? {});
    const allReferencedEconomyIds = [profile.primaryEconomyId, profile.activePrimaryEconomyId, profile.manualClickTarget, ...profile.primaryEconomyIds, ...profile.secondaryEconomyIds, ...profile.fixedHudSlots, ...profile.visibleHudEconomyIds, ...profile.hudSlots.map((slot) => slot.economyId), ...displayOverrideEconomyIds].filter(isNonEmptyString);
    const unresolvedEconomyIds = allReferencedEconomyIds.filter((economyId) => !economyIds.has(economyId));
    if (unresolvedEconomyIds.length) {
      issues.push({ severity: "error", code: "era_economy_profile_economy_missing", message: "Era economy profile references must resolve to canonical economy definitions.", records: [profile.id, ...new Set(unresolvedEconomyIds)] });
    }

    const duplicateHudEconomyIds = profile.visibleHudEconomyIds.filter((economyId, index, ids) => ids.indexOf(economyId) !== index);
    if (duplicateHudEconomyIds.length) {
      issues.push({ severity: "error", code: "duplicate_era_hud_economy", message: "Era HUD economy IDs must be unique inside a profile.", records: [profile.id, ...duplicateHudEconomyIds] });
    }

    const hudSlotEconomyIds = profile.hudSlots.map((slot) => slot.economyId);
    if (hudSlotEconomyIds.join("|") !== profile.visibleHudEconomyIds.join("|")) {
      issues.push({ severity: "error", code: "era_hud_slots_do_not_match_profile", message: "Era HUD slots must match visibleHudEconomyIds in order.", records: [profile.id] });
    }
    if (profile.fixedHudSlots.join("|") !== expectedFixedHud.join("|") || profile.visibleHudEconomyIds.join("|") !== expectedFixedHud.join("|") || hudSlotEconomyIds.join("|") !== expectedFixedHud.join("|")) {
      issues.push({ severity: "error", code: "era_hud_slots_not_fixed", message: "Era economy profiles must preserve the fixed five-slot HUD order and must not reorder top-bar economies.", records: [profile.id, ...hudSlotEconomyIds] });
    }
    if (profile.hudSlots.length !== 5 || profile.fixedHudSlots.length !== 5 || profile.visibleHudEconomyIds.length !== 5) {
      issues.push({ severity: "error", code: "fixed_hud_slot_count_invalid", message: "Era economy profiles must expose exactly five fixed core HUD slots.", records: [profile.id] });
    }
    if (profile.visibilityRules.useEraHud !== false || profile.visibilityRules.fixedCoreHud !== true) {
      issues.push({ severity: "error", code: "era_hud_visibility_rule_invalid", message: "Era economy profiles must not own top-bar ordering; fixedCoreHud must be true.", records: [profile.id] });
    }

    const duplicateHudOrders = duplicateNumbers(profile.hudSlots.map((slot) => slot.order));
    if (duplicateHudOrders.length) {
      issues.push({ severity: "error", code: "duplicate_era_hud_slot_order", message: "Era HUD slot order values must be unique inside a profile.", records: [profile.id, ...duplicateHudOrders.map(String)] });
    }
  }
}

function validateEconomyDefaults(runtimeData: Pick<GameRuntimeData, "economyDefinitions" | "eraEconomyProfiles" | "balance">, issues: ImportIssue[], context: string) {
  const byId = new Map(runtimeData.economyDefinitions.map((definition) => [definition.id, definition]));
  const labor = byId.get("ECON-LABOR");
  const credits = byId.get("ECON-CREDITS");
  const population = byId.get("ECON-POPULATION");
  const research = byId.get("ECON-RESEARCH");
  const premiumCrystals = byId.get("ECON-PREMIUM-CRYSTALS");
  const civilizationPoints = byId.get("ECON-CIVILIZATION-POINTS");
  const survival = runtimeData.eraEconomyProfiles.find((profile) => profile.eraId === "survival");

  if (labor?.startingAmount !== 0) {
    issues.push({ severity: "error", code: "labor_starting_amount_invalid", message: `${context} ECON-LABOR must start at 0.`, records: [`received:${labor?.startingAmount ?? "missing"}`] });
  }
  if (labor?.manualClickTarget !== true) {
    issues.push({ severity: "error", code: "labor_click_target_invalid", message: `${context} ECON-LABOR must remain the manual click target.`, records: ["ECON-LABOR"] });
  }
  const laborIconKey = String(labor?.iconKey ?? "");
  const creditsIconKey = String(credits?.iconKey ?? "");
  const forbiddenLaborIconKeys = [creditsIconKey, "nature_leaf"].filter(Boolean);
  if (laborIconKey !== "economy_labor" || forbiddenLaborIconKeys.includes(laborIconKey)) {
    issues.push({ severity: "error", code: "labor_icon_key_invalid", message: `${context} ECON-LABOR must use its own labor icon key and must not use Credits or Nature icon semantics.`, records: [`labor:${labor?.iconKey ?? "missing"}`, `credits:${credits?.iconKey ?? "missing"}`] });
  }
  if (credits?.startingAmount !== 0 || credits?.startingRate !== 0 || credits?.manualClickTarget === true || credits?.iconKey !== "economy_credits") {
    issues.push({ severity: "error", code: "credits_starting_value_invalid", message: `${context} Credits must be visible from Survival but start at 0, have no passive Survival rate, and must not be the manual click economy.`, records: ["ECON-CREDITS"] });
  }
  if (population?.startingAmount !== 5 || runtimeData.balance.startingPopulation !== 5) {
    issues.push({ severity: "error", code: "population_starting_amount_invalid", message: `${context} Population must use the Survival starter default of 5.`, records: [`economy:${population?.startingAmount ?? "missing"}`, `balance:${runtimeData.balance.startingPopulation}`] });
  }
  if (population?.startingRate !== 0 || population?.spendable !== false || population?.premium !== false || population?.manualClickTarget === true) {
    issues.push({ severity: "error", code: "population_semantics_invalid", message: `${context} Population must be non-premium, non-clicked, non-spendable workforce capacity with no starting rate.`, records: ["ECON-POPULATION"] });
  }
  if (research?.startingAmount !== 0 || research?.startingRate !== 0) {
    issues.push({ severity: "error", code: "research_starting_value_invalid", message: `${context} ECON-RESEARCH must start at 0 with no starting rate.`, records: ["ECON-RESEARCH"] });
  }
  if (premiumCrystals?.startingAmount !== 0 || premiumCrystals?.startingRate !== 0) {
    issues.push({ severity: "error", code: "premium_crystals_starting_value_invalid", message: `${context} ECON-PREMIUM-CRYSTALS must start at 0 with no starting rate.`, records: ["ECON-PREMIUM-CRYSTALS"] });
  }
  if (civilizationPoints?.startingAmount !== 0 || civilizationPoints?.startingRate !== 0) {
    issues.push({ severity: "error", code: "civilization_points_starting_value_invalid", message: `${context} ECON-CIVILIZATION-POINTS must start at 0 with no starting rate.`, records: ["ECON-CIVILIZATION-POINTS"] });
  }
  if (survival?.primaryEconomyId !== "ECON-LABOR" || survival?.activePrimaryEconomyId !== "ECON-LABOR" || survival?.manualClickTarget !== "ECON-LABOR" || survival?.visibleHudEconomyIds.join("|") !== primaryHudEconomyIds.join("|")) {
    issues.push({ severity: "error", code: "survival_economy_profile_invalid", message: `${context} Survival must use Labor as primary/click economy and expose the fixed five-slot HUD including Credits in slot 2.`, records: [survival?.id ?? "missing_survival_profile"] });
  }
}

function validateMobileClientProfiles(runtimeData: Pick<GameRuntimeData, "clientProfiles">, issues: ImportIssue[]) {
  const expectedHud = [...primaryHudEconomyIds];
  for (const profileName of ["ios", "android"] as const) {
    const profile = runtimeData.clientProfiles[profileName];
    if (!profile) {
      issues.push({ severity: "error", code: "mobile_profile_missing", message: `clientProfiles.${profileName} is required for mobile presentation exports.`, records: [profileName] });
      continue;
    }
    if (profile.platform !== profileName) {
      issues.push({ severity: "error", code: "mobile_profile_platform_invalid", message: "Mobile profile platform must match its profile key.", records: [profileName, String(profile.platform ?? "missing")] });
    }
    if (profile.orientation?.primary !== "landscape" || !profile.orientation?.supported.includes("landscape-left") || !profile.orientation?.supported.includes("landscape-right")) {
      issues.push({ severity: "error", code: "mobile_orientation_invalid", message: "Mobile gameplay profiles must define landscape-left and landscape-right support.", records: [profileName] });
    }
    if (!profile.safeAreaPolicy || profile.safeAreaPolicy.minimumEdgePadding < 16 || !profile.safeAreaPolicy.supportsCameraCutout || !profile.safeAreaPolicy.supportsHomeIndicator) {
      issues.push({ severity: "error", code: "mobile_safe_area_missing", message: "Mobile profiles must define notch/cutout/home-indicator safe-area metadata.", records: [profileName] });
    }
    if ((profile.supportedDeviceClasses?.length ?? 0) < 5 || !profile.supportedDeviceClasses?.some((item) => item.id === "phone_compact") || !profile.supportedDeviceClasses?.some((item) => item.id === "tablet_large")) {
      issues.push({ severity: "error", code: "mobile_device_classes_missing", message: "Mobile profiles must define phone and tablet presentation classes.", records: [profileName] });
    }
    if (!profile.touchProfile || profile.touchProfile.minimumTouchTarget < 44 || profile.touchProfile.touchPadding < 0) {
      issues.push({ severity: "error", code: "mobile_touch_profile_invalid", message: "Mobile profiles must define approved touch target and padding rules.", records: [profileName] });
    }
    if (!profile.hudProfile || profile.hudProfile.economyOrder.join("|") !== expectedHud.join("|") || profile.hudProfile.minimumTouchTarget < 44) {
      issues.push({ severity: "error", code: "mobile_hud_profile_invalid", message: "Mobile HUD profile must preserve fixed economy order and mobile touch targets.", records: [profileName, ...(profile.hudProfile?.economyOrder ?? [])] });
    }
    if (profile.primaryHudResources?.join("|") !== expectedHud.join("|") || profile.primaryHudSlots?.map((slot) => slot.economyId).join("|") !== expectedHud.join("|")) {
      issues.push({ severity: "error", code: "mobile_fixed_hud_order_invalid", message: "Mobile client profiles must inherit the canonical fixed HUD order.", records: [profileName, ...(profile.primaryHudResources ?? [])] });
    }
    if (!profile.assetDensityProfile || !profile.assetDensityProfile.requiredScales.includes("1x") || !profile.assetDensityProfile.requiredScales.includes("2x") || !profile.assetDensityProfile.requiredScales.includes("3x")) {
      issues.push({ severity: "error", code: "mobile_asset_density_missing", message: "Mobile profiles must define 1x/2x/3x asset density requirements.", records: [profileName] });
    }
    if (!profile.authenticationProfile || profile.authenticationProfile.accountDeletionTracked !== true || profile.authenticationProfile.secretsExported !== false) {
      issues.push({ severity: "error", code: "mobile_auth_profile_invalid", message: "Mobile auth profile must track account deletion and must not export secrets.", records: [profileName] });
    }
    if (!profile.purchaseProfile || profile.purchaseProfile.purchaseVerificationRequired !== true || profile.purchaseProfile.serverAuthoritative !== true || profile.purchaseProfile.secretsExported !== false) {
      issues.push({ severity: "error", code: "mobile_purchase_profile_invalid", message: "Mobile purchase profile must require verification and must not export store secrets.", records: [profileName] });
    }
    if ((profile.mobileAssetRequirements?.length ?? 0) < 8) {
      issues.push({ severity: "error", code: "mobile_asset_requirements_missing", message: "Mobile profiles must expose app brand/loading/store-art asset requirements.", records: [profileName] });
    }
    const serialized = JSON.stringify(profile);
    if (/\/Users\/|studio-private:\/\/|SUPABASE|SERVICE_ROLE|PRIVATE_KEY|clientSecret|apiKey|storeSecret/i.test(serialized)) {
      issues.push({ severity: "error", code: "mobile_profile_private_leak", message: "Mobile presentation profiles must not expose private paths, credentials, or secrets.", records: [profileName] });
    }
  }
}

function validateAiAgents(runtimeData: Pick<GameRuntimeData, "aiAgents" | "aiAgentPersonalities" | "aiAgentAnimationProfiles" | "automationPresentation" | "defaultAiAgentId" | "aiAgentSaveSchema" | "assets">, issues: ImportIssue[]) {
  const agents = runtimeData.aiAgents;
  const agentIds = new Set(agents.map((agent) => agent.id));
  const personalityIds = new Set(runtimeData.aiAgentPersonalities.map((personality) => personality.id));
  const animationProfileIds = new Set(runtimeData.aiAgentAnimationProfiles.map((profile) => profile.id));
  const assetsByKey = new Set(runtimeData.assets.flatMap((asset) => [asset.artKey, asset.iconKey].filter(Boolean) as string[]));
  const defaults = agents.filter((agent) => agent.defaultForNewPlayers);

  if (defaults.length !== 1) {
    issues.push({ severity: "error", code: "ai_agent_default_count_invalid", message: "Runtime must include exactly one default AI Agent.", records: defaults.map((agent) => agent.id) });
  }
  if (!agentIds.has(runtimeData.defaultAiAgentId)) {
    issues.push({ severity: "error", code: "ai_agent_default_missing", message: "defaultAiAgentId must resolve to an AI Agent.", records: [runtimeData.defaultAiAgentId] });
  }
  const defaultAgent = agents.find((agent) => agent.id === runtimeData.defaultAiAgentId);
  if (!defaultAgent || !defaultAgent.defaultForNewPlayers || defaultAgent.status !== "available" || defaultAgent.approvalState !== "approved" || defaultAgent.publishState !== "published") {
    issues.push({ severity: "error", code: "ai_agent_default_not_published", message: "Default AI Agent must be available, approved, published, and defaultForNewPlayers.", records: [runtimeData.defaultAiAgentId] });
  }
  if (runtimeData.aiAgentSaveSchema.selectedAiAgentIdDefault !== runtimeData.defaultAiAgentId || runtimeData.aiAgentSaveSchema.fields.selectedAiAgentId.default !== runtimeData.defaultAiAgentId) {
    issues.push({ severity: "error", code: "ai_agent_save_default_invalid", message: "AI Agent save schema must default selectedAiAgentId to defaultAiAgentId.", records: [runtimeData.aiAgentSaveSchema.id, runtimeData.defaultAiAgentId] });
  }
  if (runtimeData.automationPresentation.systemId !== "automation" || runtimeData.automationPresentation.displayName !== "AI Agent" || runtimeData.automationPresentation.powerLabel !== "Labor Assistance") {
    issues.push({ severity: "error", code: "automation_presentation_invalid", message: "Automation presentation must preserve automation system identity while exposing AI Agent labels.", records: [runtimeData.automationPresentation.id] });
  }

  for (const agent of agents) {
    if (!personalityIds.has(agent.personalityId)) {
      issues.push({ severity: "error", code: "ai_agent_personality_missing", message: "AI Agent personalityId must resolve.", records: [agent.id, agent.personalityId] });
    }
    if (!animationProfileIds.has(agent.animationProfileId)) {
      issues.push({ severity: "error", code: "ai_agent_animation_profile_missing", message: "AI Agent animationProfileId must resolve.", records: [agent.id, agent.animationProfileId] });
    }
    if (Object.keys(agent.gameplayModifiers).length) {
      issues.push({ severity: "error", code: "ai_agent_gameplay_modifier_forbidden", message: "Cosmetic AI Agents must not define gameplay modifiers in v1.0.", records: [agent.id] });
    }
    const keyValues = [
      agent.headAssetKey,
      agent.eyesOpenAssetKey,
      agent.eyesBlinkAssetKey,
      agent.eyesClosedAssetKey,
      ...Object.values(agent.expressionAssets).filter(Boolean)
    ];
    for (const assetKey of keyValues) {
      if (!assetKey) {
        issues.push({ severity: "error", code: "ai_agent_asset_key_missing", message: "AI Agent asset keys must be populated or explicitly marked missing.", records: [agent.id] });
        continue;
      }
      if (!assetsByKey.has(assetKey) && agent.assetReadiness[assetKey] !== "missing") {
        issues.push({ severity: "error", code: "ai_agent_asset_reference_unresolved", message: "AI Agent asset keys must resolve to runtime assets or be explicitly marked missing.", records: [agent.id, assetKey] });
      }
    }
    const profile = runtimeData.aiAgentAnimationProfiles.find((item) => item.id === agent.animationProfileId);
    if (profile && (!agent.eyesOpenAssetKey || !agent.eyesBlinkAssetKey)) {
      issues.push({ severity: "error", code: "ai_agent_blink_assets_missing", message: "Blink animation profile requires valid open and blink asset keys.", records: [agent.id, profile.id] });
    }
  }
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
      ...(asset.platformMappings.roblox?.assetId ? { roblox: { assetId: asset.platformMappings.roblox.assetId } } : {}),
      ...(asset.platformMappings.web?.path && !asset.platformMappings.web.path.includes("/Users/") && !asset.platformMappings.web.path.includes("studio-private://")
        ? {
            web: {
              path: asset.platformMappings.web.path,
              ...(asset.platformMappings.web.status ? { status: asset.platformMappings.web.status } : {}),
              ...(asset.platformMappings.web.publishedAt ? { publishedAt: asset.platformMappings.web.publishedAt } : {})
            }
          }
        : {})
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
  const economyIds = new Set(runtimeData.economyDefinitions.map((row) => row.id));
  const resourceIds = new Set(runtimeData.resources.map((row) => row.id));
  const upgradeIds = new Set(runtimeData.upgrades.map((row) => row.id));

  if (!runtimeData.metadata.schemaVersion) {
    issues.push({ severity: "error", code: "metadata_missing", message: "metadata.schemaVersion is required.", records: ["metadata"] });
  }

  for (const [moduleName, rows] of Object.entries({ eras: runtimeData.eras, economyDefinitions: runtimeData.economyDefinitions, eraEconomyProfiles: runtimeData.eraEconomyProfiles, inventoryResourceMetadata: runtimeData.inventoryResourceMetadata, resources: runtimeData.resources, upgradeCategories: runtimeData.upgradeCategories, upgrades: runtimeData.upgrades, assets: runtimeData.assets })) {
    const duplicates = duplicateIds(rows as Array<{ id: string }>);
    if (duplicates.length) {
      issues.push({ severity: "error", code: "duplicate_id", message: `${moduleName} contains duplicate IDs.`, records: duplicates });
    }
  }

  validateCanonicalEraProgression(runtimeData.eras, issues, "Canonical runtime");
  validateEraEconomyProfiles(runtimeData, issues, "Canonical runtime");
  validateEconomyDefaults(runtimeData, issues, "Canonical runtime");
  validateMobileClientProfiles(runtimeData, issues);
  validateAiAgents(runtimeData, issues);

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
    if (upgrade.costEconomyId && !economyIds.has(upgrade.costEconomyId)) {
      issues.push({ severity: "error", code: "upgrade_economy_missing", message: "Upgrade cost economy IDs must resolve to canonical economy definitions.", records: [upgrade.id, upgrade.costEconomyId] });
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
    const eraNavigation = profile.eraNavigation;
    if (!eraNavigation) {
      issues.push({ severity: "error", code: "era_navigation_missing", message: "Client profiles must expose eraNavigation presentation intent.", records: [profileName] });
    } else {
      if (!supportedEraNavigationDashboardModes.includes(eraNavigation.dashboardMode)) {
        issues.push({ severity: "error", code: "invalid_era_navigation_mode", message: "eraNavigation.dashboardMode is not supported.", records: [profileName, eraNavigation.dashboardMode] });
      }
      if (!Number.isInteger(eraNavigation.visibleEraCount) || eraNavigation.visibleEraCount <= 0 || eraNavigation.visibleEraCount > runtimeData.eras.length) {
        issues.push({ severity: "error", code: "invalid_era_navigation_visible_count", message: "eraNavigation.visibleEraCount must be a positive integer no larger than the canonical era count.", records: [profileName, String(eraNavigation.visibleEraCount)] });
      }
      if (typeof eraNavigation.fullTimelineEnabled !== "boolean" || typeof eraNavigation.allowPrimaryHorizontalScroll !== "boolean") {
        issues.push({ severity: "error", code: "invalid_era_navigation_flags", message: "eraNavigation timeline and scroll flags must be boolean.", records: [profileName] });
      }
      const boundaryBehavior = eraNavigation.boundaryBehavior;
      if (boundaryBehavior) {
        for (const [key, value] of Object.entries(boundaryBehavior)) {
          if (!supportedEraNavigationBoundaryModes.includes(value)) {
            issues.push({ severity: "error", code: "invalid_era_navigation_boundary", message: "eraNavigation.boundaryBehavior values are not supported.", records: [profileName, key, value] });
          }
        }
      }
    }
    const slots = profile.primaryHudSlots ?? [];
    const hudIds = profile.primaryHudResources ?? [];
    const expectedFixedHud = [...primaryHudEconomyIds];
    const slotOrders = slots.map((slot) => slot.order);
    const duplicateHudOrders = duplicateNumbers(slotOrders);
    if (duplicateHudOrders.length) {
      issues.push({ severity: "error", code: "duplicate_hud_order", message: "HUD slot order values must be unique.", records: [profileName, ...duplicateHudOrders.map(String)] });
    }
    for (const economyId of hudIds) {
      if (!economyIds.has(economyId)) {
        issues.push({ severity: "error", code: "hud_economy_missing", message: "HUD resources must resolve to canonical economy definitions.", records: [profileName, economyId] });
      }
      if (resourceIds.has(economyId) || materialResourceIdsThatMustNotBeHud().has(economyId)) {
        issues.push({ severity: "error", code: "material_resource_in_hud", message: "Material resources must not be used as global HUD economy IDs.", records: [profileName, economyId] });
      }
    }
    for (const slot of slots) {
      if (!economyIds.has(slot.economyId)) {
        issues.push({ severity: "error", code: "hud_slot_economy_missing", message: "HUD slot economyId must resolve to canonical economy definitions.", records: [profileName, slot.id, slot.economyId] });
      }
    }
    if (hudIds.length !== 5 || slots.length !== 5) {
      issues.push({ severity: "error", code: "fixed_hud_count_invalid", message: "Client profiles must expose exactly five fixed core HUD slots.", records: [profileName, `resources:${hudIds.length}`, `slots:${slots.length}`] });
    }
    if (hudIds.join("|") !== expectedFixedHud.join("|") || slots.map((slot) => slot.economyId).join("|") !== expectedFixedHud.join("|")) {
      issues.push({ severity: "error", code: "fixed_hud_order_invalid", message: "Client profiles must preserve the approved fixed HUD order.", records: [profileName, ...hudIds] });
    }
    if (hudIds[0] !== "ECON-LABOR" || hudIds[1] !== "ECON-CREDITS") {
      issues.push({ severity: "error", code: "fixed_hud_labor_credits_order_invalid", message: "ECON-LABOR must be slot 1 and ECON-CREDITS must be slot 2.", records: [profileName, ...hudIds.slice(0, 2)] });
    }
  }

  const missingShortLabels = runtimeData.eras.filter((era) => !era.shortDisplayName);
  if (missingShortLabels.length) {
    issues.push({ severity: "error", code: "era_short_label_missing", message: "All eras must expose shortDisplayName for constrained client UI.", records: missingShortLabels.map((era) => era.id) });
  }

  for (const definition of runtimeData.economyDefinitions) {
    for (const key of ["startingAmount", "startingRate", "minimum"] as const) {
      if (!Number.isFinite(definition[key])) {
        issues.push({ severity: "error", code: "invalid_economy_number", message: "Economy starting values, rates, and minimums must be finite.", records: [definition.id, key] });
      }
    }
    if (definition.premium && !/premium/i.test(definition.id)) {
      issues.push({ severity: "warning", code: "premium_economy_marker", message: "Premium economy values should be explicitly identifiable.", records: [definition.id] });
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
    economyDefinitions: sorted.economyDefinitions,
    eraEconomyProfiles: sorted.eraEconomyProfiles,
    economyUsageRelationships: sorted.economyUsageRelationships,
    inventoryResourceMetadata: sorted.inventoryResourceMetadata,
    aiAgents: sorted.aiAgents,
    aiAgentPersonalities: sorted.aiAgentPersonalities,
    aiAgentAnimationProfiles: sorted.aiAgentAnimationProfiles,
    automationPresentation: sorted.automationPresentation,
    defaultAiAgentId: sorted.defaultAiAgentId,
    aiAgentSaveSchema: sorted.aiAgentSaveSchema,
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
  const economyIds = new Set(payload.economyDefinitions.map((definition) => definition.id));
  const tabIds = new Set(payload.upgradeTabs.map((tab) => tab.tabId));

  if (!payload.metadata.schemaVersion) {
    issues.push({ severity: "error", code: "metadata_schema_missing", message: "metadata.schemaVersion is required.", records: ["metadata"] });
  }
  if (!payload.metadata.contentVersion) {
    issues.push({ severity: "error", code: "metadata_version_missing", message: "metadata.contentVersion is required.", records: ["metadata"] });
  }
  if (payload.upgradeTabs.length !== 4) {
    issues.push({ severity: "error", code: "invalid_upgrade_tab_count", message: "Roblox runtime payload must expose exactly four upgrade tabs.", records: payload.upgradeTabs.map((tab) => tab.tabId) });
  }
  validateCanonicalEraProgression(payload.eras, issues, "Roblox runtime");
  validateEraEconomyProfiles({
    eras: payload.eras,
    economyDefinitions: payload.economyDefinitions,
    eraEconomyProfiles: payload.eraEconomyProfiles
  }, issues, "Roblox runtime");
  validateEconomyDefaults({
    economyDefinitions: payload.economyDefinitions,
    eraEconomyProfiles: payload.eraEconomyProfiles,
    balance: payload.balance
  }, issues, "Roblox runtime");
  validateAiAgents(payload, issues);

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
    if (upgrade.costEconomyId && !economyIds.has(upgrade.costEconomyId)) {
      issues.push({ severity: "error", code: "upgrade_economy_missing", message: "Every Roblox upgrade costEconomyId must resolve to an economy definition.", records: [upgrade.id, upgrade.costEconomyId] });
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
  const [data, importedAssets, productionOverrides] = await Promise.all([getGameData(), getAppliedGameArtAssets(), getAssetProductionRuntimeOverrides()]);
  const categories = new Map(defaultCategories().map((row) => [row.id, row]));
  const upgrades = data.upgrades.map(upgradeToRuntime);
  const assets = [...data.assets.map(assetToRuntime), ...importedAssets].map((asset) => {
    const override = productionOverrides[asset.id];
    if (!override) return asset;
    return {
      ...asset,
      status: override.status ?? asset.status,
      productionStatus: override.productionStatus,
      approvalStatus: override.approvalStatus,
      platformMappings: {
        ...asset.platformMappings,
        ...override.platformMappings
      }
    };
  });
  const aiAgentModules = getAiAgentRuntimeModules();

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

  return withCanonicalEraDefinitions({
    metadata: metadata(),
    eras: defaultEras(),
    economyDefinitions: canonicalEconomyDefinitions,
    eraEconomyProfiles: buildEraEconomyProfiles(),
    economyUsageRelationships: buildEconomyUsageRelationships(data),
    inventoryResourceMetadata: buildInventoryResourceMetadata(data),
    aiAgents: aiAgentModules.aiAgents,
    aiAgentPersonalities: aiAgentModules.aiAgentPersonalities,
    aiAgentAnimationProfiles: aiAgentModules.aiAgentAnimationProfiles,
    automationPresentation: aiAgentModules.automationPresentation,
    defaultAiAgentId: aiAgentModules.defaultAiAgentId,
    aiAgentSaveSchema: aiAgentModules.aiAgentSaveSchema,
    resources: ResourceService.catalog.map(resourceToRuntime),
    upgradeCategories: [...categories.values()].sort((left, right) => left.order - right.order),
    upgrades,
    assets,
    balance: gameConstantsBalance(data.game_constants),
    clientProfiles: defaultClientProfiles()
  });
}

export async function getGameRuntimeData() {
  const [base, store] = await Promise.all([buildBaseGameRuntimeData(), readImportStore()]);
  if (!store.appliedRuntimeData) return base;

  const merged = withCanonicalEraDefinitions({
    ...base,
    ...store.appliedRuntimeData,
    metadata: {
      ...base.metadata,
      ...store.appliedRuntimeData.metadata,
      contentVersion: Math.max(store.appliedRuntimeData.metadata.contentVersion, gameRuntimeContentVersion),
      saveMigrationHints: base.metadata.saveMigrationHints
    },
    economyDefinitions: base.economyDefinitions,
    eraEconomyProfiles: base.eraEconomyProfiles,
    economyUsageRelationships: base.economyUsageRelationships,
    inventoryResourceMetadata: base.inventoryResourceMetadata,
    aiAgents: base.aiAgents,
    aiAgentPersonalities: base.aiAgentPersonalities,
    aiAgentAnimationProfiles: base.aiAgentAnimationProfiles,
    automationPresentation: base.automationPresentation,
    defaultAiAgentId: base.defaultAiAgentId,
    aiAgentSaveSchema: base.aiAgentSaveSchema,
    resources: base.resources,
    balance: {
      ...store.appliedRuntimeData.balance,
      startingPopulation: base.balance.startingPopulation
    }
  });
  return {
    ...merged,
    metadata: {
      ...merged.metadata,
      validationStatus: validateGameRuntimeData(merged).status
    }
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
      shortDisplayName: display(row.shortDisplayName, stripAge(displayName)),
      description: display(row.description, `${displayName} progression era.`),
      unlockRequirements: asRecord(row.unlockRequirements),
      iconKey: display(row.iconKey, `era-${slug(displayName)}`),
      artKey: display(row.artKey, `era-${slug(displayName)}`),
      themeKey: display(row.themeKey, `theme-${slug(displayName)}`),
      masteryRequirements: asRecord(row.masteryRequirements),
      completionPercent: asNumber(row.completionPercent, 0),
      researchProgress: asNumber(row.researchProgress, 0),
      buildingProgress: asNumber(row.buildingProgress, 0),
      missingArtwork: asBoolean(row.missingArtwork, true),
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

  const mergeProfile = (key: keyof ClientProfiles): ClientProfile => {
    const incoming = asRecord(profiles[key]);
    const inherited = key === "default" ? fallback.default.eraNavigation : fallback[key].eraNavigation ?? fallback.default.eraNavigation;
    return {
      ...fallback[key],
      ...incoming,
      eraNavigation: resolveEraNavigationProfile({
        ...(inherited ?? {}),
        ...asRecord(incoming.eraNavigation)
      })
    };
  };
  return {
    default: mergeProfile("default"),
    roblox: mergeProfile("roblox"),
    web: mergeProfile("web"),
    unity: mergeProfile("unity"),
    unreal: mergeProfile("unreal"),
    godot: mergeProfile("godot"),
    ios: buildMobileClientProfile("ios", mergeProfile("ios")),
    android: buildMobileClientProfile("android", mergeProfile("android"))
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
    economyDefinitions: base.economyDefinitions,
    eraEconomyProfiles: base.eraEconomyProfiles,
    economyUsageRelationships: base.economyUsageRelationships,
    inventoryResourceMetadata: base.inventoryResourceMetadata,
    resources: base.resources,
    upgradeCategories: normalizeImportedCategories(payload, base.upgradeCategories),
    upgrades: normalizeImportedUpgrades(payload, base.upgrades),
    assets: normalizeImportedAssets(payload, base.assets),
    balance: normalizeBalance(payload, base.balance),
    aiAgents: base.aiAgents,
    aiAgentPersonalities: base.aiAgentPersonalities,
    aiAgentAnimationProfiles: base.aiAgentAnimationProfiles,
    automationPresentation: base.automationPresentation,
    defaultAiAgentId: base.defaultAiAgentId,
    aiAgentSaveSchema: base.aiAgentSaveSchema,
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
