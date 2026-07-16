export type RuntimeMetadata = {
  schemaVersion: string;
  architectureVersion: string;
  universalDiscoveryRegistryVersion?: string;
  galaxyEngineContractVersion?: string;
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

export type DiscoveryRarityDefinition = {
  id: string;
  displayName: string;
  displayOrder: number;
  defaultSpawnWeight: number;
};

export type DiscoveryCategoryDefinition = {
  id: string;
  displayName: string;
  shortDisplayName: string;
  displayOrder: number;
  description: string;
  subcategories: Array<{ id: string; displayName: string; displayOrder: number }>;
};

export type DiscoveryDefinition = {
  id: string;
  displayName: string;
  categoryId: string;
  subcategoryId: string;
  scientificName: string;
  description: string;
  lore: string;
  rarity: string;
  spawnWeight: number;
  discoveryXp: number;
  creditsValue: number;
  researchValue: number;
  tradeValue: number;
  unlocks: string[];
  relatedResearchIds: string[];
  relatedBuildingIds: string[];
  relatedResourceIds: string[];
  relatedPlanetIds: string[];
  relatedCivilizationIds: string[];
  relatedLifeformIds: string[];
  requiredEquipmentIds: string[];
  requiredScanLevel: number;
  spawnRules: Record<string, unknown>;
  assetProfile: Record<string, unknown>;
  publicationStatus: string;
  tags: string[];
};

export type DiscoveryCollectionDefinition = {
  id: string;
  displayName: string;
  discoveryIds: string[];
  milestoneType: string;
};

export type DiscoveryChainDefinition = {
  id: string;
  displayName: string;
  nodes: Array<{ order: number; discoveryId: string; unlocks: string[] }>;
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
  presentation: {
    backgroundArtKey: string;
    fallbackBackgroundArtKey: string;
    selectedTabArtKey: string | null;
    iconArtKey: string | null;
  };
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

export type BuildingTaxonomyFamily = {
  id: string;
  displayName: string;
  displayOrder: number;
  description: string;
  subcategories: Array<{
    id: string;
    displayName: string;
    displayOrder: number;
    aliases?: string[];
    buildingExamples?: string[];
  }>;
};

export type CanonicalBuildingDefinition = {
  id: string;
  displayName: string;
  familyId: string;
  familyName: string;
  subcategoryId: string;
  subcategoryName: string;
  era: string;
  tier: number;
  planetAvailability: string[];
  districtAvailability: string[];
  alignment: string[];
  populationEffects: string[];
  laborEffects: string[];
  creditEffects: string[];
  researchEffects: string[];
  power: {
    produces: string[];
    consumes: string[];
  };
  inputs: string[];
  outputs: string[];
  maintenance: string[];
  upgradePath: string[];
  dependencies: string[];
  unlockRequirements: string[];
  visualAssetRequirements: string[];
  animationRequirements: string[];
  soundRequirements: string[];
  status: "draft";
  tags: string[];
};

export type BuildingClassification = {
  id: string;
  buildingId: string;
  buildingName: string;
  primaryFamilyId: string;
  primaryFamilyName: string;
  subcategoryId: string;
  subcategoryName: string;
  legacyCategory: string;
  era: string;
  civilizationAvailability: string[];
  planetAvailability: string[];
  districtAvailability: string[];
  resourceProducerIds: string[];
  resourceConsumerIds: string[];
  populationEffects: {
    populationBonus: number;
    populationCapacity: number;
    populationGrowth: number;
  };
  researchEffects: {
    researchPerSecond: number;
    researchBonus: number;
  };
  workforceEffects: {
    laborRequirement: number;
    laborPerSecond: number;
  };
  unlockRequirements: {
    researchId: string | null;
    buildingId: string | null;
  };
  upgradePath: string;
  migrationConfidence: "legacy_category_map" | "subcategory_keyword" | "manual_review_required";
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

export type EconomyBehaviorType = "produced_currency" | "capacity_count" | "knowledge_currency" | "premium_currency";
export type EconomyScope = "civilization" | "galaxy" | "sector" | "system" | "planet" | "settlement";
export type ResourceProducerSourceType = "base_system" | "manual_click" | "ai_agent" | "building" | "upgrade" | "research" | "settlement" | "planet" | "colony" | "trade_route" | "mission" | "event" | "discovery" | "entitlement";
export type ResourceProductionMode = "per_click" | "per_second" | "per_minute" | "instant_grant" | "capacity" | "multiplier" | "conversion";

export type EconomyBehaviorContract = {
  id: string;
  economyId: string;
  behaviorType: EconomyBehaviorType;
  startingAmount: number;
  basePassiveRate: number;
  manualProduction: { enabled: boolean; baseClick: number; target: boolean; formula: string };
  automatedProduction: { enabled: boolean; aiAgentTarget: boolean; formula: string };
  buildingProduction: { enabled: boolean; requiresStructuredEffects: boolean; allowedModes: ResourceProductionMode[] };
  eventProduction: { enabled: boolean; allowedSourceTypes: ResourceProducerSourceType[] };
  discoveryProduction: { enabled: boolean; allowedSourceTypes: ResourceProducerSourceType[] };
  purchaseProduction: { enabled: boolean; serverAuthoritativeRequired: boolean; allowedSourceTypes: ResourceProducerSourceType[] };
  spendable: boolean;
  capacityResource: boolean;
  premiumResource: boolean;
  canGoNegative: boolean;
  integerOnly: boolean;
  capPolicy: { type: "none" | "capacity_bound" | "local_capacity"; notes: string };
  offlineProgressEligible: boolean;
  displayProfile: { stableId: string; defaultDisplayName: string; defaultIconKey: string; eraOverrideRule: string };
  validationRules: string[];
  saveBehavior: { storedInPlayerSave: boolean; migrationNotes: string[] };
  notes: string;
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
  displayOverrides: Record<string, { displayName: string; shortDisplayName?: string; compactLabel?: string; iconKey?: string; description?: string; formatting?: EconomyValueDefinition["formatting"] }>;
  permittedProducerSystems: string[];
  visibilityRules: {
    useEraHud: boolean;
    fixedCoreHud: boolean;
    creditsVisible: boolean;
    materialResourcesInHud: boolean;
    notes: string;
  };
  notes: string;
};

export type ResourceProducerDefinition = {
  id: string;
  sourceType: ResourceProducerSourceType;
  sourceId: string;
  economyId: string;
  scope: EconomyScope;
  productionMode: ResourceProductionMode;
  baseAmount: number;
  intervalSeconds: number | null;
  requirements: Record<string, unknown>;
  staffing: { populationRequired: number; assignedWorkforceRequired: number; notes: string };
  powerCost: number;
  inputCosts: Array<{ economyId?: string; resourceId?: string; amount: number }>;
  multipliers: Array<{ id: string; appliesTo: string; mode: "additive" | "multiplicative"; value: number; sourceType: string }>;
  offlineEligible: boolean;
  activeConditions: string[];
  notes: string;
};

export type BuildingResourceEffect = {
  id: string;
  buildingId: string;
  buildingName: string;
  economyId: string;
  scope: EconomyScope;
  effectKind: "production" | "capacity_increase" | "instant_grant" | "growth_rate" | "multiplier" | "requirement";
  productionMode: ResourceProductionMode;
  amount: number;
  intervalSeconds: number | null;
  displayText: string;
  staffingRequirement: number;
  eraId: string;
  sourceField: string;
  notes: string;
};

export type EconomyScopeRule = {
  id: string;
  scope: EconomyScope;
  rollupBehavior: "rolls_to_civilization" | "local_only" | "conditional_transfer";
  appliesToEconomyIds: string[];
  doubleCountingRule: string;
  notes: string;
};

export type EconomyTransactionReason = {
  id: string;
  economyId: string;
  operation: "grant" | "produce" | "spend" | "refund" | "transfer" | "adjust" | "purchase" | "discover";
  sourceTypes: ResourceProducerSourceType[];
  serverAuthoritativeRequired: boolean;
  playerHistoryOwnedBy: "game";
  notes: string;
};

export type EconomyRateBreakdownDefinition = {
  id: string;
  economyId: string;
  labels: Array<{ id: string; displayName: string; sourceTypes: ResourceProducerSourceType[]; operation: "add" | "multiply" }>;
  formula: string;
  displayRule: string;
};

export type OfflineProgressionPolicy = {
  id: string;
  economyId: string;
  eligible: boolean;
  maximumOfflineSeconds: number;
  producerEligibility: string;
  capBehavior: string;
  suspendedConditions: string[];
  deterministicOrder: string[];
};

export type EconomyCalculationRules = {
  id: string;
  multiplierOrder: string[];
  multiplierStacking: { sourceSpecific: "multiplicative"; civilizationWide: "multiplicative"; eventBoosts: "multiplicative"; additiveBonuses: "add_before_multiply" };
  rounding: {
    internalPrecision: number;
    displayPrecision: number;
    integerEconomyIds: string[];
    roundingMode: "floor_for_spend_checks_round_for_display";
    maximumSafeValueStrategy: string;
    serializationFormat: "decimal_string_or_number";
  };
  laborFormula: { perSecond: string; perClick: string; notes: string };
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
  baseVariantId: string;
  availableVariantIds: string[];
  assetKeys: {
    open: string;
    blink: string;
    offline: string;
    working?: string;
    thinking?: string;
    warning?: string;
    celebration?: string;
  };
  presentation: {
    portraitShape: "circle" | "hex" | "square";
    preferredPanelMode: "compact" | "profile" | "dialogue";
    colorTheme: { primary: string; secondary: string; accent: string };
    fallbackVariantId: string;
  };
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

export type AiAgentVariantDefinition = {
  id: string;
  agentId: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  tier: number;
  variantType: "base" | "era" | "premium" | "event" | "achievement";
  unlockRequirements: RequirementMap;
  unlockText: string;
  progressionMapping: {
    cosmeticIdentity: boolean;
    automationPowerSource: "automation_upgrade_levels";
    notes: string;
  };
  assetKeys: {
    head: string;
    open: string;
    blink: string;
    offline: string;
    working?: string;
    thinking?: string;
    warning?: string;
    celebration?: string;
  };
  safeFallbacks: Partial<Record<AiAgentVisualState | "head", string>>;
  platformReadiness: {
    web: "ready" | "missing";
    roblox: "ready" | "missing";
    ios: "ready" | "missing";
    android: "ready" | "missing";
    preview: "ready" | "missing";
    transparency: "required";
  };
  status: "available" | "locked" | "retired";
  approvalState: "draft" | "needs_review" | "approved";
  publishState: "draft" | "published";
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
  visibleOnlyBehavior: "pause_when_hidden";
  allowedStates: AiAgentVisualState[];
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
  selectedAiAgentVariantIdDefault: string;
  fields: {
    selectedAiAgentId: { status: "active"; default: string; notes: string };
    selectedAiAgentVariantId: { status: "active"; default: string; notes: string };
    unlockedAiAgentIds: { status: "player_owned"; default: string[]; notes: string };
    unlockedAiAgentVariantIds: { status: "player_owned"; default: string[]; notes: string };
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

export type GalaxySemanticZoomLevel = {
  id: "galaxy" | "sector" | "star_system";
  displayName: string;
  hierarchyLevel: number;
  canonicalEntityType: "galaxy" | "sector" | "star_system";
  parentEntityType: "universe" | "galaxy" | "sector";
  childEntityTypes: string[];
  defaultKnowledgeState: GalaxyKnowledgeStateId;
  navigationIntent: string;
  labelBehavior: string;
};

export type GalaxyTechnologyGate = {
  id: "survival" | "planetary" | "interplanetary" | "interstellar" | "galactic" | "intergalactic";
  displayName: string;
  requiredResearchIds: string[];
  unlockedZoom: Array<GalaxySemanticZoomLevel["id"]>;
  unlockedInteractions: string[];
  maximumViewDistance: number;
  maximumProbeDistance: number;
  maximumTravelDistance: number;
  distanceUnit: "au" | "light_years" | "galactic_index";
  notes: string;
};

export type GalaxyKnowledgeStateId = "unknown" | "detected" | "probed" | "scanned" | "charted" | "explored" | "colonized" | "mastered";

export type GalaxyKnowledgeVisibilityRule = {
  id: GalaxyKnowledgeStateId;
  displayName: string;
  order: number;
  unknownDisplayName: "???";
  canShowName: boolean;
  canShowRegistry: boolean;
  canShowResources: boolean;
  canShowBodyCount: boolean;
  canShowDiscoveries: boolean;
  canShowTravelRoutes: boolean;
  notes: string;
};

export type GalaxyPresentationClass = {
  id: "galaxy" | "sector" | "star" | "planet" | "moon" | "asteroid_belt";
  displayName: string;
  presentationClass: string;
  proceduralAllowed: boolean;
  heroArtRequired: boolean;
  supportsAtmosphere: boolean;
  supportsClouds: boolean;
  supportsRings: boolean;
  lodIntent: "macro" | "regional" | "stellar" | "orbital" | "belt";
  assetRoleIds: string[];
  notes: string;
};

export type GalaxyPlatformRenderingProfile = {
  id: "desktop_ultra" | "desktop_high" | "desktop_medium" | "steam" | "iphone" | "ipad" | "android_phone" | "android_tablet" | "reduced";
  displayName: string;
  platform: "desktop" | "steam" | "ios" | "android" | "accessibility";
  renderScale: number;
  lod: "ultra" | "high" | "medium" | "mobile" | "reduced";
  textureTier: "ultra" | "high" | "medium" | "mobile" | "low";
  particleDensity: number;
  bloom: boolean;
  nebula: boolean;
  clouds: boolean;
  atmosphere: boolean;
  labelBudget: number;
  recommendationOnly: true;
  notes: string;
};

export type GalaxyEngineAssetRole = {
  id: "galaxy" | "sector" | "star" | "planet" | "moon" | "navigation" | "probe" | "travel" | "unknown" | "selection";
  displayName: string;
  category: "celestial" | "navigation" | "interaction" | "state";
  semanticAssetKey: string;
  requiredFor: string[];
  fallbackRuleId: string;
};

export type GalaxyProceduralFallbackRule = {
  id: string;
  appliesToClassIds: GalaxyPresentationClass["id"][];
  fallbackMode: "procedural_shader" | "procedural_icon" | "neutral_silhouette" | "label_only";
  allowedWhenArtMissing: boolean;
  clientOwnsImplementation: true;
  notes: string;
};

export type GalaxyEnginePresentationContract = {
  id: "galaxy_engine_presentation_contract";
  version: "1.0.0";
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  semanticZoom: GalaxySemanticZoomLevel[];
  technologyGates: GalaxyTechnologyGate[];
  knowledgeVisibility: GalaxyKnowledgeVisibilityRule[];
  presentationClasses: GalaxyPresentationClass[];
  platformRenderingProfiles: GalaxyPlatformRenderingProfile[];
  assetRoles: GalaxyEngineAssetRole[];
  proceduralFallbackRules: GalaxyProceduralFallbackRule[];
  validationRules: string[];
};

export type PlanetOpportunitySuitability = {
  colonization: number;
  mining: number;
  harvesting: number;
  scientificResearch: number;
  archaeology: number;
  orbitalInfrastructure: number;
  tradeHub: number;
  tourism: number;
  terraforming: number;
  military: number;
  danger: number;
  environmentalHazard: number;
};

export type PlanetOpportunityEligibility = {
  supportsColonization: boolean;
  supportsMining: boolean;
  supportsHarvesting: boolean;
  supportsOrbitalPlatforms: boolean;
  supportsTerraforming: boolean;
  supportsPreservation: boolean;
  supportsTourism: boolean;
  supportsMilitary: boolean;
  supportsResearchStations: boolean;
  supportsRefueling: boolean;
};

export type PlanetOpportunityHazardProfile = {
  temperature: number;
  radiation: number;
  storms: number;
  gravity: number;
  atmosphere: number;
  hostility: number;
  environmentalRisk: number;
};

export type PlanetOpportunityRecommendedUses = {
  primaryUse: string;
  secondaryUse: string;
  optionalUse: string;
};

export type PlanetOpportunityAction = "Colonize" | "Mine" | "Harvest" | "Research" | "Survey" | "Catalog" | "Probe" | "Bookmark" | "Ignore";

export type PlanetOpportunityProfile = {
  id: string;
  planetClass: string;
  displayName: string;
  aliases: string[];
  description: string;
  suitability: PlanetOpportunitySuitability;
  eligibility: PlanetOpportunityEligibility;
  hazardProfile: PlanetOpportunityHazardProfile;
  preservationStatus: "encouraged" | "optional" | "restricted" | "not_applicable";
  recommendedUses: PlanetOpportunityRecommendedUses;
  recommendedActions: PlanetOpportunityAction[];
  notes: string;
};

export type TimeActionState = "idle" | "queued" | "preparing" | "in_progress" | "paused" | "complete" | "failed" | "cancelled";

export type TimeActionProgressModel = {
  supportsProgressPercent: boolean;
  supportsRemainingTime: boolean;
  supportsEstimatedCompletion: boolean;
  supportsAccelerationSources: boolean;
  supportsCrystalAcceleration: boolean;
  completionEventRequired: boolean;
  deterministicClock: "game_server_or_trusted_client";
  offlineProgressPolicy: "allowed_when_action_allows" | "not_allowed";
};

export type TimeActionAccelerationPolicy = {
  premiumCrystals: {
    allowed: boolean;
    policy: "accelerate_only";
    canUnlockUnavailableActions: false;
    allowedUses: string[];
  };
  researchModifierIds: string[];
  upgradeModifierIds: string[];
  aiAgentModifierIds: string[];
  buildingModifierIds: string[];
  civilizationModifierIds: string[];
  automationModifierIds: string[];
};

export type TimeActionContract = {
  id: "time_action_contract_v1";
  version: "1.0.0";
  architectureDecisionId: "ARCH-DECISION-TIME-PRIMARY";
  decisionTitle: "Time Is the Primary Progression Resource";
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  stateMachine: TimeActionState[];
  progressModel: TimeActionProgressModel;
  accelerationPolicy: TimeActionAccelerationPolicy;
  futureSystemScopes: string[];
  validationRules: string[];
};

export type PlanetExplorationStageId = "unknown" | "detected" | "probed" | "surveyed" | "evaluated" | "selected_for_development" | "active_project" | "complete";

export type PlanetExplorationVisibilityRule = {
  stageId: PlanetExplorationStageId;
  canShowName: boolean;
  canShowApproximatePosition: boolean;
  canShowDistance: boolean;
  canShowUnknownIcon: boolean;
  canShowPlanetClass: boolean;
  canShowBasicAtmosphere: boolean;
  canShowGravity: boolean;
  canShowTemperature: boolean;
  canShowBasicHazards: boolean;
  canShowEstimatedResources: boolean;
  canShowCivilizationSuitabilityIndex: boolean;
  canShowStrategicValueIndex: boolean;
  canShowNickname: boolean;
  canShowRecommendedUses: boolean;
  canShowResourceRichness: boolean;
  canShowBiomeDetails: boolean;
  canShowLifeforms: boolean;
  canShowAncientRuins: boolean;
  canShowDiscoveryOpportunities: boolean;
  canShowAvailableActions: boolean;
  hiddenDisplayName: "???";
};

export type PlanetExplorationStage = {
  id: PlanetExplorationStageId;
  order: number;
  displayName: string;
  description: string;
  requiredActionIds: string[];
  revealedFields: string[];
  hiddenFields: string[];
  nextStageIds: PlanetExplorationStageId[];
};

export type PlanetExplorationTimedAction = {
  id: string;
  displayName: string;
  category: "probe" | "survey" | "decision" | "development";
  description: string;
  timeActionContractId: TimeActionContract["id"];
  fromStageId: PlanetExplorationStageId;
  toStageId: PlanetExplorationStageId;
  baseDurationSeconds: number;
  minimumDurationSeconds: number;
  maximumDurationSeconds: number;
  researchModifierIds: string[];
  buildingModifierIds: string[];
  aiAgentModifierIds: string[];
  automationModifierIds: string[];
  civilizationModifierIds: string[];
  premiumCrystalAcceleration: {
    enabled: boolean;
    unlocksUnavailableActions: false;
    policy: "reduce_remaining_time" | "complete_instantly_when_allowed" | "speed_automation";
  };
  progressStages: string[];
  completionRewards: string[];
  requiresSurveyComplete: boolean;
  validOpportunityActions: PlanetOpportunityAction[];
  notes: string;
};

export type PlanetNicknameRule = {
  id: string;
  nickname: string;
  priority: number;
  profileSignals: string[];
  revealStageId: "surveyed";
};

export type PlanetExplorationProgressionContract = {
  id: "planet_exploration_progression_v1";
  version: "1.0.0";
  timeActionContractId: TimeActionContract["id"];
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  pipeline: PlanetExplorationStage[];
  visibilityRules: PlanetExplorationVisibilityRule[];
  timedActions: PlanetExplorationTimedAction[];
  nicknameRules: PlanetNicknameRule[];
  validationRules: string[];
};

export type ActionSystemCategory = {
  id: string;
  displayName: string;
  description: string;
  displayOrder: number;
  future: boolean;
};

export type ActionSystemState = {
  id: "unavailable" | "ready" | "queued" | "waiting" | "preparing" | "in_progress" | "paused" | "blocked" | "completed" | "failed" | "cancelled" | "archived";
  displayName: string;
  terminal: boolean;
  historyEvent: boolean;
  allowedTransitions: string[];
  resumable: boolean;
  queueBehavior: "not_queueable" | "queueable" | "active" | "suspended" | "terminal";
  progressBehavior: "none" | "pending" | "time_based" | "held" | "terminal";
  presentationToken: string;
  description: string;
};

export type ActionRequirement = {
  type: "research" | "technology" | "building" | "resource" | "credits" | "labor" | "population" | "workforce" | "equipment" | "ai_agent" | "discovery_state" | "planet_knowledge" | "ownership" | "range" | "location" | "target_class" | "target_environment" | "civilization_milestone" | "civilization_identity" | "action_dependency" | "queue_capacity" | "server_verification" | "preservation_restriction" | "story_gate";
  id: string;
  quantity: number | null;
  condition: string;
  blocking: boolean;
  reasonCode: string;
  notes: string;
};

export type ActionTransfer = {
  type: "resource" | "credits" | "labor" | "population" | "fuel" | "artifact" | "material" | "energy" | "logistics" | "transport_capacity" | "time" | "project_slot" | "research" | "discovery_points" | "knowledge" | "discovery_state" | "building" | "colony" | "infrastructure" | "route" | "unlock" | "notification" | "follow_up_action" | "civilization_identity";
  id: string;
  quantity: number | null;
  timing: "start" | "progress" | "completion";
  reservationBehavior: "none" | "reserve_on_queue" | "reserve_on_start";
  consumptionBehavior: "none" | "consume_on_start" | "consume_over_time" | "consume_on_completion";
  cancellationRefund: "none" | "full" | "partial" | "unspent_only";
  phaseBehavior: "all_phases" | "start_phase" | "progress_phases" | "completion_phase";
  notes: string;
};

export type ActionDuration = {
  timeActionContractId: TimeActionContract["id"];
  durationDefinitionId: string;
  baseDurationSeconds: number;
  minimumDurationSeconds: number;
  maximumDurationSeconds: number;
  offlinePolicy: string;
  modifierPolicy: string;
  accelerationPolicy: string;
  startPolicy: string;
  completionPolicy: string;
  authoritativeTimePolicy: string;
  phaseTemplateIds: string[];
  estimatedCompletionRule: string;
  progressRule: string;
};

export type ActionModifiers = {
  modifierOrder: string[];
  researchModifierIds: string[];
  aiAgentModifierIds: string[];
  automationModifierIds: string[];
  buildingModifierIds: string[];
  civilizationModifierIds: string[];
  planetModifierIds: string[];
  temporaryEventModifierIds: string[];
  premiumCrystalAcceleration: {
    allowed: boolean;
    policy: "accelerate_only";
    canUnlockUnavailableActions: false;
  };
};

export type ActionAutomation = {
  canAutomate: boolean;
  automationTier: "none" | "basic" | "advanced" | "specialized" | "future";
  aiAgentSupport: boolean;
  automationPolicyId: string;
  autoQueue: boolean;
  autoStart: boolean;
  autoRepeat: boolean;
  playerConfirmationRequired: boolean;
  premiumSpendPermission: "never" | "explicit_player_authorization";
  automationRules: string[];
};

export type ActionQueueBehavior = {
  queueRuleId: string;
  queueScope: "global" | "civilization" | "colony" | "planet" | "research" | "construction" | "probe" | "survey" | "manufacturing" | "logistics" | "future";
  interruptible: boolean;
  prioritySupported: boolean;
  pauseSupported: boolean;
  cancelSupported: boolean;
};

export type ActionPresentation = {
  mode: "circular_progress" | "linear_progress" | "countdown" | "queue_card" | "status_badge";
  iconKey: string;
  statusBadge: string;
  completionAnimationKey: string | null;
  notes: string;
};

export type ActionDefinition = {
  id: string;
  displayName: string;
  category: string;
  description: string;
  targetTypes: string[];
  entityType: "planet" | "celestial_body" | "colony" | "building" | "research" | "resource" | "trade_route" | "fleet" | "artifact" | "ai_agent" | "civilization" | "route" | "destination";
  actionType: string;
  requirements: ActionRequirement[];
  inputs: ActionTransfer[];
  outputs: ActionTransfer[];
  duration: ActionDuration;
  phases: string[];
  modifiers: ActionModifiers;
  automation: ActionAutomation;
  queueBehavior: ActionQueueBehavior;
  concurrency: {
    concurrencyPolicyId: string;
    conflictGroupIds: string[];
    maxConcurrentTargets: number;
  };
  failureRules: string[];
  cancellationRules: {
    allowed: boolean;
    refundPolicy: string;
    retainedProgressPolicy: string;
  };
  completionRules: string[];
  events: string[];
  rewardProfile: {
    discoveryPoints: number;
    rewardIds: string[];
    historyRecordRequired: boolean;
  };
  history: {
    started: boolean;
    completed: boolean;
    cancelled: boolean;
    failed: boolean;
    accelerated: boolean;
    automated: boolean;
  };
  presentation: ActionPresentation;
  relatedCanonicalContent: {
    researchIds: string[];
    buildingIds: string[];
    resourceIds: string[];
    economyIds: string[];
    discoveryIds: string[];
    planetOpportunityProfileIds: string[];
  };
  publicationStatus: "approved" | "provisional" | "draft";
};

export type ActionQueueRule = {
  id: string;
  displayName: string;
  queueScope: ActionQueueBehavior["queueScope"];
  maxConcurrency: number;
  capacitySource: string;
  supportsReorder: boolean;
  supportsPriority: boolean;
  supportsPause: boolean;
  supportsCancel: boolean;
  autoStart: boolean;
  conflictGroups: string[];
  notes: string;
};

export type ActionDurationDefinition = {
  id: string;
  displayName: string;
  baseDurationSeconds: number;
  minimumDurationSeconds: number;
  maximumDurationSeconds: number;
  offlinePolicy: string;
  modifierPolicy: string;
  accelerationPolicy: string;
  startPolicy: string;
  completionPolicy: string;
  authoritativeTimePolicy: string;
};

export type ActionPhaseTemplate = {
  id: string;
  displayName: string;
  order: number;
  progressWeight: number;
  canPause: boolean;
  canFail: boolean;
};

export type ActionAccelerationPolicy = {
  id: string;
  displayName: string;
  accelerationType: "fixed_reduction" | "percentage_reduction" | "temporary_speed_multiplier" | "eligible_instant_completion";
  serverAuthoritativeBalance: boolean;
  serverCalculatedCost: boolean;
  approvedTransactionReasonCodes: string[];
  idempotencyRequired: boolean;
  minimumDurationClamp: boolean;
  canBypassRequirements: false;
};

export type ActionAutomationPolicy = {
  id: string;
  displayName: string;
  aiAgentRequirement: string;
  autoQueue: boolean;
  autoStart: boolean;
  autoRepeat: boolean;
  playerConfirmation: string;
  premiumSpendPermission: "never" | "explicit_player_authorization";
};

export type ActionFailureCause = {
  id: string;
  displayName: string;
  refundPolicy: string;
  retainedProgressPolicy: string;
};

export type ActionEventDefinition = {
  id: string;
  displayName: string;
  gameOwnsPlayerHistory: boolean;
};

export type ActionPresentationContract = {
  id: "ActionCard" | "ActionQueue" | "ActionProgress" | "ActionPhaseStepper" | "ActionRequirementList" | "ActionInputSummary" | "ActionOutputSummary" | "ActionModifierBreakdown" | "ActionAccelerationPrompt" | "ActionCompletionNotification" | "ActionHistoryEntry";
  displayName: string;
  rendererIndependent: boolean;
  semanticFields: string[];
  notes: string;
};

export type ActionSystemContract = {
  id: "canonical_action_system_v1";
  version: "1.0.0";
  architectureDecisionId: "ARCH-DECISION-CANONICAL-ACTION-FRAMEWORK";
  timeActionContractId: TimeActionContract["id"];
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  actionCategories: ActionSystemCategory[];
  actionStates: ActionSystemState[];
  actionDefinitions: ActionDefinition[];
  actionQueueRules: ActionQueueRule[];
  actionDurationDefinitions: ActionDurationDefinition[];
  actionPhaseTemplates: ActionPhaseTemplate[];
  actionAccelerationPolicies: ActionAccelerationPolicy[];
  actionAutomationPolicies: ActionAutomationPolicy[];
  actionFailureCauses: ActionFailureCause[];
  actionEventDefinitions: ActionEventDefinition[];
  actionPresentationContracts: ActionPresentationContract[];
  accelerationRules: string[];
  automationRules: string[];
  actionPresentation: ActionPresentation[];
  validationRules: string[];
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
  economyBehaviorContracts: EconomyBehaviorContract[];
  eraEconomyProfiles: EraEconomyProfile[];
  economyUsageRelationships: EconomyUsageRelationships;
  inventoryResourceMetadata: InventoryResourceMetadata[];
  resourceProducerDefinitions: ResourceProducerDefinition[];
  buildingResourceEffects: BuildingResourceEffect[];
  economyScopeRules: EconomyScopeRule[];
  economyTransactionReasons: EconomyTransactionReason[];
  economyRateBreakdownDefinitions: EconomyRateBreakdownDefinition[];
  offlineProgressionPolicies: OfflineProgressionPolicy[];
  economyCalculationRules: EconomyCalculationRules;
  aiAgents: AiAgentDefinition[];
  aiAgentVariants: AiAgentVariantDefinition[];
  aiAgentPersonalities: AiAgentPersonalityDefinition[];
  aiAgentAnimationProfiles: AiAgentAnimationProfileDefinition[];
  automationPresentation: AutomationPresentationDefinition;
  defaultAiAgentId: string;
  aiAgentSaveSchema: AiAgentSaveSchemaDefinition;
  discoveryCategories: DiscoveryCategoryDefinition[];
  discoveryRarities: DiscoveryRarityDefinition[];
  discoveries: DiscoveryDefinition[];
  discoveryCollections: DiscoveryCollectionDefinition[];
  discoveryChains: DiscoveryChainDefinition[];
  discoveryMilestones: Array<Record<string, unknown>>;
  discoveryPlayerCollectionSchema: Record<string, unknown>;
  universalDiscoveryRegistry: Record<string, unknown>;
  resources: ResourceDefinition[];
  timeActionContract: TimeActionContract;
  actionSystem: ActionSystemContract;
  buildingTaxonomy: BuildingTaxonomyFamily[];
  buildingLibrary: CanonicalBuildingDefinition[];
  buildingClassifications: BuildingClassification[];
  upgradeCategories: UpgradeCategory[];
  upgrades: UpgradeDefinition[];
  assets: AssetDefinition[];
  balance: BalanceDefinition;
  galaxyEngineContract: GalaxyEnginePresentationContract;
  planetOpportunityProfiles: PlanetOpportunityProfile[];
  planetExplorationProgression: PlanetExplorationProgressionContract;
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
