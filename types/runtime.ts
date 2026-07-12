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
};

export type RequirementMap = Record<string, unknown>;

export type EraDefinition = {
  id: string;
  index: number;
  name: string;
  displayName: string;
  description: string;
  unlockRequirements: RequirementMap;
  iconKey: string;
  artKey: string;
  themeKey: string;
  masteryRequirements: RequirementMap;
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
  costGrowthRate: number;
  effectType: string;
  baseEffectValue: number;
  effectGrowthRate: number;
  unlockRequirements: RequirementMap;
  nextUpgradeIds: string[];
  visibilityRules: VisibilityRules;
  tags: string[];
};

export type PlatformAssetMappings = {
  web?: { path: string };
  roblox?: { assetId: string; assetType?: string; notes?: string };
  unity?: { addressableKey: string };
  unreal?: { assetPath: string };
  godot?: { resourcePath: string };
};

export type AssetDefinition = {
  id: string;
  name: string;
  type: "image" | "icon" | "audio" | "video" | "animation" | "model" | string;
  category: string;
  artKey: string;
  iconKey?: string;
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
