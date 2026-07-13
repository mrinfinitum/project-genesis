export type RuntimeMetadata = {
  schemaVersion: string;
  contentVersion: number;
  checksum: string;
  accessLevel: "studio-internal" | "public-published";
  importedAt: string;
  importedFrom: string;
  sourceProject: string;
  sourceFormat: string;
  environment: string;
  validationStatus: "Ready" | "Ready With Warnings" | "Blocked";
  saveMigrationHints?: Array<{
    id: string;
    targetId: string;
    field: string;
    previousDefault: number;
    currentDefault: number;
    applyOnlyWhen: string;
    preserveRule: string;
    introducedContentVersion: number;
    notes: string;
  }>;
};

export type RequirementMap = Record<string, unknown>;

export type EraDefinition = {
  id: string;
  index: number;
  name: string;
  displayName: string;
  shortDisplayName?: string;
  description: string;
  unlockRequirements: RequirementMap;
  iconKey: string;
  artKey: string;
  themeKey: string;
  masteryRequirements: RequirementMap;
  completionPercent?: number;
  researchProgress?: number;
  buildingProgress?: number;
  missingArtwork?: boolean;
  tags: string[];
};

export type ResourceDefinition = {
  id: string;
  name: string;
  displayName: string;
  resourceClass: string;
  category: string;
  rarity: string;
  iconKey: string;
  artKey: string;
  color: string;
  description: string;
  discoveredEraId: string;
  usableEraId: string;
  tradable: boolean;
  tags: string[];
};

export type UpgradeCategory = {
  id: string;
  displayName: string;
  description: string;
  order: number;
  unlockedAtGameStart: boolean;
  unlockRequirements: RequirementMap;
  iconKey: string;
  themeKey: string;
};

export type VisibilityRules = {
  defaultState: "available" | "locked_discovered" | "unknown";
  revealRequirements: RequirementMap;
  availableRequirements: RequirementMap;
  hideUntilEraId: string | null;
  showTeaser: boolean;
  teaserOrder: number;
};

export type UpgradeDefinition = {
  id: string;
  categoryId: string;
  eraId: string;
  chainId: string;
  order: number;
  name: string;
  displayName: string;
  description: string;
  iconKey: string;
  defaultLevel: number;
  maxLevel: number;
  baseCost: number;
  costResourceId: string | null;
  costEconomyId?: string | null;
  costGrowthRate: number;
  effectType: string;
  baseEffectValue: number;
  effectGrowthRate: number;
  unlockRequirements: RequirementMap;
  nextUpgradeIds: string[];
  visibilityRules: VisibilityRules;
  tags: string[];
};

export type EconomyValueDefinition = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  playerFacingHelpText?: string;
  valueType: "currency" | "counter" | "rate" | "capacity";
  category: "global_economy";
  iconKey: string;
  color: string;
  formatting: {
    style: "integer" | "decimal" | "compact" | "percent";
    prefix?: string;
    suffix?: string;
    decimals: number;
  };
  spendable: boolean;
  premium: boolean;
  startingAmount: number;
  startingRate: number;
  minimum: number;
  maximum: number | null;
  visibility: "always" | "when_unlocked" | "premium_store";
  usage: string[];
  semantics?: string[];
  manualClickTarget?: boolean;
  progressionRelevant?: boolean;
  supportsCaps?: boolean;
  status: "canonical" | "draft" | "deprecated";
};

export type HudResourceSlot = {
  id: string;
  economyId: string;
  order: number;
  showRate: boolean;
  compactLabel: string;
  iconKey: string;
  formatting: EconomyValueDefinition["formatting"];
  premium: boolean;
};

export type EraEconomyProfile = {
  id: string;
  eraId: string;
  eraIndex: number;
  primaryEconomyId: string;
  activePrimaryEconomyId: string;
  primaryEconomyIds: string[];
  secondaryEconomyIds: string[];
  visibleHudEconomyIds: string[];
  hudSlots: HudResourceSlot[];
  displayOverrides: Record<string, { displayName: string; compactLabel?: string; description?: string }>;
  visibilityRules: {
    useEraHud: boolean;
    creditsVisible: boolean;
    materialResourcesInHud: boolean;
    notes: string;
  };
  notes: string;
};

export type EconomyUsageRelationships = {
  upgradeCosts: Record<string, string[]>;
  buildingCosts: Record<string, string[]>;
  researchCosts: Record<string, string[]>;
  eraUnlocks: Record<string, string[]>;
  boosts: Record<string, string[]>;
  missions: Record<string, string[]>;
  events: Record<string, string[]>;
  progressionRewards: Record<string, string[]>;
  unresolved: Array<{ sourceType: string; sourceId: string; value: string; reason: string }>;
};

export type InventoryResourceMetadata = {
  id: string;
  resourceId: string;
  displayName: string;
  classification: "inventory_resource";
  productionSources: string[];
  consumptionUses: string[];
  storageRules: {
    stackSize: number;
    storageLimit: number | null;
    unavailableReason?: string;
  };
  buildingRelationships: string[];
  researchRelationships: string[];
  planetAvailability: string[];
  eraAvailability: string[];
  relationshipStatus: "resolved" | "partial" | "unavailable";
};

export type PlatformAssetMappings = {
  web?: { path: string; status?: string; publishedAt?: string };
  roblox?: { assetId: string; assetType?: string; notes?: string; status?: string; publishedAt?: string };
  unity?: { addressableKey: string; status?: string };
  unreal?: { assetPath: string; status?: string };
  godot?: { resourcePath: string; status?: string };
};

export type AssetSourceFileDefinition = {
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

export type AssetDerivativeDefinition = {
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

export type AssetDefinition = {
  id: string;
  name: string;
  type: "image" | "icon" | "audio" | "video" | "animation" | "model" | string;
  category: string;
  artKey: string;
  iconKey?: string;
  audioKey?: string;
  modelKey?: string;
  description?: string;
  productionStatus?: string;
  approvalStatus?: string;
  variants?: AssetDerivativeDefinition[];
  derivatives?: AssetDerivativeDefinition[];
  usageReferences?: Array<{ type: string; id: string; name: string }>;
  requirementProfileId?: string;
  sourceFileName?: string;
  sourceExtension?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  status: string;
  notes: string;
  previewUrl?: string;
  storagePath?: string;
  aliases?: string[];
  tags?: string[];
  importedFrom?: string;
  importedAt?: string;
  updatedAt?: string;
  platformMappings: PlatformAssetMappings;
};

export type BalanceDefinition = {
  version: string;
  startingCivilizationEnergy: number;
  startingCoins: number;
  startingResearch: number;
  startingPopulation: number;
  baseClickPower: number;
  baseAutoClickPower: number;
  autosaveSeconds: number;
  notes: string;
  environmentOverrides: Record<string, Partial<Omit<BalanceDefinition, "environmentOverrides" | "difficultyProfileOverrides">>>;
  difficultyProfileOverrides: Record<string, Partial<Omit<BalanceDefinition, "environmentOverrides" | "difficultyProfileOverrides">>>;
};

export type ClientProfile = {
  defaultUpgradeRowsVisible: number;
  futureUpgradeTeaserCount: number;
  showUnknownUpgradeSlots: boolean;
  lockedOpacity: number;
  availableGlowEnabled: boolean;
  primaryHudResources?: string[];
  primaryHudSlots?: HudResourceSlot[];
  eraNavigation?: EraNavigationProfile;
};

export type EraNavigationProfile = {
  dashboardMode: "current_journey" | "compact_timeline" | "full_timeline";
  visibleEraCount: number;
  fullTimelineEnabled: boolean;
  allowPrimaryHorizontalScroll: boolean;
  boundaryBehavior?: {
    firstEraMode: "current_and_next";
    middleEraMode: "previous_current_next";
    lastEraMode: "previous_and_current";
  };
};

export type ClientProfiles = {
  default: ClientProfile;
  roblox: ClientProfile;
  web: ClientProfile;
  unity: ClientProfile;
  unreal: ClientProfile;
  godot: ClientProfile;
};

export type GameRuntimeData = {
  metadata: RuntimeMetadata;
  eras: EraDefinition[];
  economyDefinitions: EconomyValueDefinition[];
  eraEconomyProfiles: EraEconomyProfile[];
  economyUsageRelationships: EconomyUsageRelationships;
  inventoryResourceMetadata: InventoryResourceMetadata[];
  resources: ResourceDefinition[];
  upgradeCategories: UpgradeCategory[];
  upgrades: UpgradeDefinition[];
  assets: AssetDefinition[];
  balance: BalanceDefinition;
  clientProfiles: ClientProfiles;
};

export type ImportIssue = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  records: string[];
};

export type ImportConflict = {
  id: string;
  category: keyof Pick<GameRuntimeData, "eras" | "resources" | "upgradeCategories" | "upgrades" | "assets"> | "balance" | "clientProfiles";
  field: string;
  studioValue: unknown;
  importedValue: unknown;
  recommendedResolution: "keep_studio" | "use_imported" | "merge" | "skip";
};

export type ImportPreview = {
  id: string;
  source: string;
  sourceType: "json_file" | "local_endpoint" | "pasted_json" | "existing_project_migration";
  createdAt: string;
  validation: {
    valid: boolean;
    status: "Ready" | "Ready With Warnings" | "Blocked";
    errorCount: number;
    warningCount: number;
    checkedAt: string;
    issues: ImportIssue[];
  };
  counts: {
    eras: number;
    resources: number;
    categories: number;
    upgrades: number;
    assets: number;
    balanceValues: number;
    clientProfiles: number;
  };
  changes: {
    newRecords: Record<string, string[]>;
    updatedRecords: Record<string, string[]>;
    unchangedRecords: Record<string, string[]>;
    conflicts: ImportConflict[];
    missingReferences: ImportIssue[];
  };
  relationshipMap: {
    upgradesByCategory: Record<string, string[]>;
    upgradesByEra: Record<string, string[]>;
    nextUpgradesByUpgrade: Record<string, string[]>;
    assetsByKey: Record<string, string>;
  };
  normalizedRuntimeData: GameRuntimeData;
};

export type ImportResult = {
  importId: string;
  source: string;
  timestamp: string;
  schemaVersion: string;
  recordsAdded: number;
  recordsUpdated: number;
  conflicts: number;
  result: "applied" | "blocked";
};
