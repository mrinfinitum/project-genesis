export type RuntimeMetadata = {
  schemaVersion: string;
  architectureVersion: string;
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
    previousDefault: number | string | null;
    currentDefault: number | string;
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
  manualClickTarget: string | null;
  primaryEconomyIds: string[];
  secondaryEconomyIds: string[];
  fixedHudSlots: string[];
  visibleHudEconomyIds: string[];
  hudSlots: HudResourceSlot[];
  displayOverrides: Record<string, { displayName: string; compactLabel?: string; description?: string }>;
  visibilityRules: {
    useEraHud: boolean;
    fixedCoreHud: boolean;
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

export type AiAgentVisualState = "idle" | "blink" | "working" | "thinking" | "researching" | "celebrating" | "warning" | "offline" | "sleeping" | "surprised";

export type AiAgentDefinition = {
  id: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  personalityId: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  unlockRequirements: RequirementMap;
  defaultForNewPlayers: boolean;
  eraAvailability: Record<string, { available: boolean; visualTheme: string; skinId?: string }>;
  colorTheme: { primary: string; secondary: string; accent: string };
  headAssetKey: string;
  eyesOpenAssetKey: string;
  eyesBlinkAssetKey: string;
  eyesClosedAssetKey: string;
  expressionAssets: Partial<Record<AiAgentVisualState, string>>;
  animationProfileId: string;
  dialogueProfileId: string;
  voiceProfileId: string | null;
  gameplayModifiers: Record<string, never>;
  automationPresentationId: string;
  mobilePresentation: {
    portraitSizeInPanel: number;
    touchTarget: number;
    reducedMotionDefault: boolean;
    blinkPerformanceTier: "low" | "standard" | "high";
    densityAssetSelection: Array<"1x" | "2x" | "3x">;
    safeAreaBehavior: string;
  };
  assetReadiness: Record<string, "missing" | "source_uploaded" | "approved" | "published">;
  status: "available" | "locked" | "retired";
  approvalState: "draft" | "needs_review" | "approved";
  publishState: "draft" | "published";
  aliases?: string[];
};

export type AiAgentPersonalityDefinition = {
  id: string;
  displayName: string;
  tone: string;
  shortDescription: string;
  dialogueStyle: string;
  preferredExpressions: AiAgentVisualState[];
  notificationStyle: string;
  futureVoiceProfile: string;
};

export type AiAgentAnimationProfileDefinition = {
  id: string;
  displayName: string;
  idleFrame: "eyesOpenAssetKey";
  blinkFrame: "eyesBlinkAssetKey";
  minIntervalMs: number;
  maxIntervalMs: number;
  blinkDurationMs: number;
  doubleBlinkChance: number;
  reducedMotionBehavior: "static_open";
};

export type AutomationPresentationDefinition = {
  id: string;
  systemId: string;
  displayName: "AI Agent";
  previousDisplayName: "Auto Click";
  powerLabel: "Labor Assistance";
  previousPowerLabel: "Auto Click Power";
  enabledLabel: "Agent Online";
  disabledLabel: "Agent Offline";
  preservedInternalIds: string[];
  notes: string;
};

export type AiAgentSaveSchemaDefinition = {
  id: string;
  selectedAiAgentIdDefault: string;
  fields: {
    selectedAiAgentId: { status: "active"; default: string; notes: string };
    selectedAiAgentSkinId: { status: "future"; default: null; notes: string };
    selectedEyeColorId: { status: "future"; default: null; notes: string };
    selectedPersonalityId: { status: "future"; default: null; notes: string };
  };
  migrationHints: Array<{ id: string; field: string; defaultValue: string; unknownIdBehavior: string; notes: string }>;
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
  platform?: "default" | "roblox" | "web" | "unity" | "unreal" | "godot" | "ios" | "android";
  orientation?: {
    primary: "landscape" | "portrait";
    supported: Array<"landscape-left" | "landscape-right" | "portrait" | "portrait-upside-down">;
    portraitAllowedScreens: string[];
    notes: string;
  };
  canonicalDesignSize?: { width: number; height: number; unit: "logical_px" };
  scalingMode?: string;
  supportedDeviceClasses?: MobileDeviceClass[];
  safeAreaPolicy?: MobileSafeAreaPolicy;
  hudProfile?: MobileHudProfile;
  navigationProfile?: Record<string, unknown>;
  touchProfile?: MobileTouchProfile;
  inputCapabilities?: Record<string, unknown>;
  typographyProfile?: Record<string, unknown>;
  effectsProfile?: Record<string, unknown>;
  assetDensityProfile?: MobileAssetDensityProfile;
  lifecycleProfile?: Record<string, unknown>;
  authenticationProfile?: Record<string, unknown>;
  purchaseProfile?: Record<string, unknown>;
  notificationProfile?: Record<string, unknown>;
  accessibilityProfile?: Record<string, unknown>;
  dashboardLayoutProfile?: Record<string, unknown>;
  mobileAssetRequirements?: MobileAssetRequirement[];
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

export type MobileDeviceClass = {
  id: "phone_compact" | "phone_standard" | "phone_large" | "tablet_standard" | "tablet_large";
  minimumLogicalWidth: number;
  minimumLogicalHeight: number;
  targetAspectRange: string;
  hudScale: number;
  typographyScale: number;
  touchScale: number;
  safeAreaPadding: { top: number; right: number; bottom: number; left: number };
  compactLayoutRules: string[];
};

export type MobileSafeAreaPolicy = {
  supportsTopInset: boolean;
  supportsRightInset: boolean;
  supportsBottomInset: boolean;
  supportsLeftInset: boolean;
  supportsCameraCutout: boolean;
  supportsRoundedCorners: boolean;
  supportsHomeIndicator: boolean;
  supportsAndroidDisplayCutouts: boolean;
  criticalControlSafeZone: string;
  decorativeOverflowAllowance: string;
  minimumEdgePadding: number;
  modalSafeBounds: string;
  bottomDrawerSafeOffset: number;
  topHudSafeOffset: number;
  notes: string;
};

export type MobileHudProfile = {
  economyOrder: string[];
  iconSize: number;
  valueSize: number;
  rateSize: number;
  slotWidth: number;
  slotCompression: "compact_numbers" | "icon_only_when_extreme";
  compactNumberFormatting: boolean;
  labelVisibility: "optional" | "visible" | "hidden";
  overflowBehavior: string;
  minimumTouchTarget: number;
  rightSideUtilitySpacing: number;
};

export type MobileTouchProfile = {
  minimumTouchTarget: number;
  touchPadding: number;
  tapFeedback: string;
  longPressBehavior: string;
  dragThreshold: number;
  swipeThreshold: number;
  doubleTapPolicy: string;
  hoverFallback: string;
  tooltipActivation: string;
  gestureConflictRules: string[];
};

export type MobileAssetDensityProfile = {
  requiredScales: Array<"1x" | "2x" | "3x">;
  preferredFormats: Array<"WebP" | "PNG" | "JPG" | "SVG">;
  sourcePolicy: string;
  lowResolutionPolicy: string;
  derivativeRules: Array<{ scale: "1x" | "2x" | "3x"; maxDimension: number; compression: string }>;
};

export type MobileAssetRequirement = {
  id: string;
  label: string;
  category: string;
  status: "Required" | "Pending Source Art" | "Ready" | "Blocked";
  requiredFor: Array<"ios" | "android" | "web">;
  notes: string;
};

export type ClientProfiles = {
  default: ClientProfile;
  roblox: ClientProfile;
  web: ClientProfile;
  unity: ClientProfile;
  unreal: ClientProfile;
  godot: ClientProfile;
  ios: ClientProfile;
  android: ClientProfile;
};

export type GameRuntimeData = {
  metadata: RuntimeMetadata;
  eras: EraDefinition[];
  economyDefinitions: EconomyValueDefinition[];
  eraEconomyProfiles: EraEconomyProfile[];
  economyUsageRelationships: EconomyUsageRelationships;
  inventoryResourceMetadata: InventoryResourceMetadata[];
  aiAgents: AiAgentDefinition[];
  aiAgentPersonalities: AiAgentPersonalityDefinition[];
  aiAgentAnimationProfiles: AiAgentAnimationProfileDefinition[];
  automationPresentation: AutomationPresentationDefinition;
  defaultAiAgentId: string;
  aiAgentSaveSchema: AiAgentSaveSchemaDefinition;
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
