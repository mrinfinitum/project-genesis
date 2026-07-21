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
  resourceType?: string;
  primaryCategory?: string;
  subcategory?: string;
  secondaryCategories?: Array<{
    primary_category: string;
    subcategory: string;
  }>;
  recipeIds?: string[];
  producedByIds?: string[];
  consumedByIds?: string[];
  harvestedFromDiscoveryIds?: string[];
  element?: Record<string, unknown>;
  availability?: Record<string, unknown>;
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

export type DiscoveryPurposeCategoryDefinition = {
  id: string;
  displayName: string;
  displayOrder: number;
};

export type DiscoveryDefinition = {
  id: string;
  displayName: string;
  categoryId: string;
  subcategoryId: string;
  purposeCategoryId?: string;
  purposeSubcategoryId?: string;
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
  harvestedResourceIds?: string[];
  relatedAiIds?: string[];
  relatedSpeciesIds?: string[];
  relatedStructureIds?: string[];
  civilizationUnlockIds?: string[];
  codexEntryId?: string;
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

export type LaborGenerationSource = {
  id: "manual_labor" | "ai_assisted_labor" | "workforce_labor";
  displayName: string;
  economyId: "ECON-LABOR";
  productionMode: "per_click" | "per_second" | "assigned_capacity";
  producerIds: string[];
  offlineEligible: boolean;
  unlockRule: string;
  formula: string;
  modifierIds: string[];
  notes: string;
};

export type LaborGenerationFramework = {
  id: "labor_generation_framework_v1";
  version: "1.1.0";
  architectureDecisionId: "ARCH-DECISION-LABOR-FIRST-ECONOMY";
  economyId: "ECON-LABOR";
  populationEconomyId: "ECON-POPULATION";
  actionSystemId: "canonical_action_system_v1";
  ownership: { studioOwns: string[]; gameOwns: string[] };
  sources: LaborGenerationSource[];
  workforceConversion: {
    stages: Array<"population" | "eligible_workforce" | "available_workforce_labor" | "assigned_labor">;
    populationSpendable: false;
    formula: string;
    assignmentRule: string;
  };
  availableLaborFormula: string;
  modifiers: Array<{ id: string; sourceSystem: string; appliesTo: string[]; operation: "add" | "multiply" | "reduce_requirement" | "increase_capacity"; notes: string }>;
  upgradeEffects: Array<{ id: string; appliesTo: string; operation: "add" | "multiply" | "reduce_requirement" | "increase_capacity"; notes: string }>;
  progressionPhases: Array<{ id: "early" | "mid" | "late"; primarySources: LaborGenerationSource["id"][]; playerRole: string; flow: string[] }>;
  integrationSystems: string[];
  saveContract: { storedBy: "game"; fields: string[]; migrationRules: string[] };
  validationRules: string[];
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

export type CanonicalAiLibraryAgent = {
  ai_id: string;
  name: string;
  codename: string;
  volume: 1;
  volume_title: "Foundations";
  library_index: number;
  ai_type: string;
  category: string;
  subcategory: string;
  rarity: string;
  rarity_rank: number;
  drop_weight: number;
  origin: string;
  discovery_method: string;
  activation_method: string;
  base_labor_per_second: number;
  base_click_labor_bonus: number;
  offline_generation_multiplier: number;
  experience_rate_multiplier: number;
  level_growth_multiplier: number;
  upgrade_cost_growth_multiplier: number;
  starting_level: number;
  max_level: number;
  evolution_id: string;
  evolution_name: string;
  special_effect_type: string;
  special_effect_value: number;
  primary_function: string;
  secondary_function: string;
  personality_primary: string;
  personality_secondary: string;
  voice_style: string;
  unique_traits: string[];
  description: string;
  lore: string;
  dialogue_examples: string[];
  memory_fragment_1: string;
  memory_fragment_2: string;
  memory_fragment_3: string;
  portrait_prompt: string;
  visual_theme: string;
  hud_display_name: string;
  hud_stat_label: string;
  can_be_active: boolean;
  active_slot_limit: number;
  supports_offline_generation: boolean;
  runtime_status: string;
  content_version: number;
  schema_version: string;
  tags: string[];
  library_sort: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
  volume_id: "ai-volume-01-foundations";
  collection: string;
  category_id: string;
  assignment_roles: string[];
  runtime_metadata: {
    schemaVersion: string;
    runtimeEnabled: boolean;
    status: "canonical";
    localizationKey: string;
    portraitArtKey: string;
  };
};

export type AiLibraryCategoryDefinition = {
  id: string;
  displayName: string;
  subcategory: string;
  subcategories: string[];
  purpose: string;
  primaryFunction: string;
  secondaryFunctions: string[];
  assignments: string[];
  bonuses: { labor: number; action: number; building: number; research: number; colony: number; automation: number };
  theme: string;
};

export type AiLibraryRarityDefinition = {
  id: string;
  displayName: string;
  order: number;
  volumeOneAllowed: boolean;
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

export type PlanetDevelopmentKnowledgeStateId = "unknown" | "detected" | "probe_queued" | "probing" | "probed" | "survey_queued" | "surveying" | "surveyed" | "analyzed" | "catalogued" | "development_selected" | "development_active" | "operational" | "preserved" | "abandoned";

export type PlanetDevelopmentKnowledgeState = {
  id: PlanetDevelopmentKnowledgeStateId;
  displayName: string;
  order: number;
  allowedTransitions: PlanetDevelopmentKnowledgeStateId[];
  canShowCsi: boolean;
  canShowSvi: boolean;
  canShowNickname: boolean;
  canShowRecommendations: boolean;
  canShowDevelopmentActions: boolean;
  terminal: boolean;
  notes: string;
};

export type PlanetDevelopmentVisibilityRule = {
  stateId: PlanetDevelopmentKnowledgeStateId;
  hiddenDisplayName: "???";
  canShowObjectExists: boolean;
  canShowApproximateLocation: boolean;
  canShowDistance: boolean;
  canShowUnresolvedSignal: boolean;
  canShowBroadBodyClass: boolean;
  canShowApproximateAtmosphere: boolean;
  canShowApproximateGravity: boolean;
  canShowTemperatureBand: boolean;
  canShowBasicHazards: boolean;
  canShowPreliminaryResourceSignals: boolean;
  canShowCsi: boolean;
  canShowSvi: boolean;
  canShowNickname: boolean;
  canShowOpportunityScores: boolean;
  canShowCapabilities: boolean;
  canShowRestrictions: boolean;
  canShowRecommendations: boolean;
  canShowFullResources: boolean;
  canShowLifeforms: boolean;
  canShowRuinsDiscoveries: boolean;
  canShowValidDevelopmentActions: boolean;
};

export type PlanetDevelopmentScoreBand = {
  id: string;
  min: number;
  max: number;
  label: string;
  starRating: number;
  summary: string;
};

export type PlanetDevelopmentOpportunityScores = {
  colonization: number;
  mining: number;
  resourceHarvesting: number;
  scientificResearch: number;
  archaeology: number;
  orbitalInfrastructure: number;
  energyProduction: number;
  tradeHub: number;
  tourism: number;
  terraforming: number;
  preservation: number;
  strategicSecurity: number;
  logistics: number;
  habitationSupport: number;
};

export type PlanetDevelopmentCapabilityState = "unavailable" | "currently_locked" | "technically_possible" | "supported" | "recommended" | "restricted" | "prohibited";

export type PlanetDevelopmentCapabilities = {
  surfaceColonization: PlanetDevelopmentCapabilityState;
  orbitalColonization: PlanetDevelopmentCapabilityState;
  subsurfaceColonization: PlanetDevelopmentCapabilityState;
  floatingColonization: PlanetDevelopmentCapabilityState;
  mining: PlanetDevelopmentCapabilityState;
  harvesting: PlanetDevelopmentCapabilityState;
  research: PlanetDevelopmentCapabilityState;
  archaeology: PlanetDevelopmentCapabilityState;
  orbitalPlatforms: PlanetDevelopmentCapabilityState;
  trade: PlanetDevelopmentCapabilityState;
  tourism: PlanetDevelopmentCapabilityState;
  terraforming: PlanetDevelopmentCapabilityState;
  preservation: PlanetDevelopmentCapabilityState;
  refueling: PlanetDevelopmentCapabilityState;
  automatedExtraction: PlanetDevelopmentCapabilityState;
  humanPresence: PlanetDevelopmentCapabilityState;
  roboticPresence: PlanetDevelopmentCapabilityState;
};

export type PlanetDevelopmentHazards = {
  temperature: number;
  radiation: number;
  toxicity: number;
  pressure: number;
  gravity: number;
  weather: number;
  geology: number;
  biology: number;
  electromagneticActivity: number;
  anomalies: number;
  accessibility: number;
  overallDanger: number;
};

export type PlanetDevelopmentArchetype = {
  id: string;
  displayName: string;
  summary: string;
  qualifyingRules: string[];
  priority: number;
  presentationToken: string;
  recommendedActionIds: string[];
};

export type PlanetDevelopmentActionReference = {
  actionId: string;
  intent: string;
  requiredSurveyComplete: boolean;
};

export type PlanetDevelopmentBlockedActionReason = {
  actionId: string;
  reasonCode: string;
  description: string;
};

export type PlanetDevelopmentProfile = {
  id: string;
  ownerBodyId: string;
  sourceOpportunityProfileId: string;
  calculationVersion: string;
  csi: {
    value: number;
    bandId: string;
    label: string;
    starRating: number;
    summary: string;
    advantages: string[];
    limitingFactors: string[];
    version: string;
  };
  svi: {
    value: number;
    bandId: string;
    label: string;
    starRating: number;
    summary: string;
    advantages: string[];
    limitingFactors: string[];
    version: string;
  };
  opportunityScores: PlanetDevelopmentOpportunityScores;
  opportunityArchetypeId: string;
  capabilities: PlanetDevelopmentCapabilities;
  restrictions: string[];
  hazards: PlanetDevelopmentHazards;
  recommendedUses: PlanetOpportunityRecommendedUses;
  validActionIds: string[];
  blockedActionReasons: PlanetDevelopmentBlockedActionReason[];
  visibilityProfile: "survey_required";
  validationStatus: "Ready" | "Ready With Warnings" | "Blocked";
};

export type PlanetDevelopmentProjectPhase = {
  id: string;
  displayName: string;
  order: number;
  actionPhaseTemplateId: string;
  requirementTypes: ActionRequirement["type"][];
  notes: string;
};

export type PlanetDevelopmentPresentationContract = {
  id: "PlanetDevelopmentReport" | "CivilizationSuitabilityGauge" | "StrategicValueGauge" | "OpportunityScoreBar" | "RecommendedUseCard" | "HazardIndicator" | "CapabilityBadge" | "RestrictionBadge" | "PlanetKnowledgeProgress" | "ProbeProgress" | "SurveyProgress" | "DevelopmentProjectSummary";
  displayName: string;
  visibleBeforeSurvey: boolean;
  rendererIndependent: true;
  notes: string;
};

export type PlanetDevelopmentAssetRequirement = {
  id: string;
  displayName: string;
  category: "badge" | "icon" | "state" | "reveal" | "project" | "phase";
  status: "required" | "planned";
  notes: string;
};

export type PlanetDevelopmentFrameworkContract = {
  id: "planet_development_framework_v1";
  version: "1.0.0";
  architectureDecisionId: "ARCH-DECISION-PLANET-DEVELOPMENT-FRAMEWORK";
  actionSystemId: ActionSystemContract["id"];
  planetOpportunityProfileVersion: "1.0.0";
  calculationVersion: string;
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  knowledgeLifecycle: PlanetDevelopmentKnowledgeState[];
  visibilityMatrix: PlanetDevelopmentVisibilityRule[];
  csiBands: PlanetDevelopmentScoreBand[];
  sviBands: PlanetDevelopmentScoreBand[];
  opportunityArchetypes: PlanetDevelopmentArchetype[];
  bodyClassBaselines: Array<{ id: string; bodyClass: string; opportunityProfileId: string; notes: string }>;
  actionReferences: PlanetDevelopmentActionReference[];
  developmentProjectPhases: PlanetDevelopmentProjectPhase[];
  presentationContracts: PlanetDevelopmentPresentationContract[];
  assetRequirements: PlanetDevelopmentAssetRequirement[];
  developmentProfiles: PlanetDevelopmentProfile[];
  validationRules: string[];
};

export type CivilizationProgressionStageId = "survival" | "settlement" | "planetary" | "interplanetary" | "interstellar" | "galactic" | "intergalactic" | "ascendant";

export type CivilizationProgressionDimensionId =
  | "civilization_age"
  | "civilization_stage"
  | "development_score"
  | "scientific_advancement"
  | "economic_development"
  | "industrial_capacity"
  | "ecological_stewardship"
  | "exploration_capacity"
  | "population_maturity"
  | "infrastructure_maturity";

export type CivilizationProgressionRequirementType =
  | "completed_action"
  | "completed_actions"
  | "colony_count"
  | "discovery_count"
  | "research_count"
  | "economy_threshold"
  | "logistics_threshold"
  | "population_threshold"
  | "infrastructure_threshold"
  | "civilization_identity"
  | "planet_development"
  | "milestone";

export type CivilizationProgressionDimension = {
  id: CivilizationProgressionDimensionId;
  displayName: string;
  description: string;
  calculationVersion: string;
  deterministic: true;
  sourceMetrics: CivilizationProgressionRequirementType[];
  weight: number;
  scoreRange: { min: 0; max: 100 };
  notes: string;
};

export type CivilizationDevelopmentScoreBand = {
  id: string;
  min: number;
  max: number;
  displayName: string;
  summary: string;
};

export type CivilizationStageRequirement = {
  id: string;
  stageId: CivilizationProgressionStageId;
  requirementType: CivilizationProgressionRequirementType;
  metricId: string;
  operator: ">=" | "==" | "includes";
  threshold: number | string;
  requiredIds: string[];
  dimensionIds: CivilizationProgressionDimensionId[];
  description: string;
};

export type CivilizationMilestone = {
  id: string;
  displayName: string;
  category: "colony" | "orbit" | "trade" | "planet_development" | "research" | "ai_agent" | "megastructure" | "population" | "exploration" | "identity";
  description: string;
  requirementIds: string[];
  contributesToDimensionIds: CivilizationProgressionDimensionId[];
  unlockedSystemIds: string[];
  importance: "low" | "medium" | "high" | "legendary";
  deterministic: true;
  presentation: {
    iconKey: string;
    badgeKey: string;
    timelineEventType: string;
  };
};

export type CivilizationStage = {
  id: CivilizationProgressionStageId;
  displayName: string;
  order: number;
  description: string;
  requirementIds: string[];
  unlockedSystemIds: string[];
  recommendedGameplay: string[];
  availableActionIds: string[];
  milestoneIds: string[];
  presentation: {
    iconKey: string;
    artKey: string;
    themeKey: string;
    badgeKey: string;
  };
};

export type CivilizationProgressionPresentationContract = {
  id: "CivilizationStageBadge" | "CivilizationProgressionSummary" | "DevelopmentScoreRadar" | "MilestoneTimeline" | "StageRequirementList" | "CivilizationAgeLabel" | "ProgressionDimensionBreakdown";
  displayName: string;
  rendererIndependent: true;
  semanticFields: string[];
  notes: string;
};

export type CivilizationProgressionFrameworkContract = {
  id: "civilization_progression_framework_v1";
  version: "1.0.0";
  architectureDecisionId: "ARCH-DECISION-CIVILIZATION-PROGRESSION-FRAMEWORK";
  actionSystemId: ActionSystemContract["id"];
  planetDevelopmentFrameworkId: PlanetDevelopmentFrameworkContract["id"];
  civilizationIdentitySource: "civilization_identity";
  calculationVersion: string;
  progressionPolicy: {
    xpAllowed: false;
    deterministic: true;
    playerInstancesExported: false;
  };
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  developmentScores: CivilizationProgressionDimension[];
  scoreBands: CivilizationDevelopmentScoreBand[];
  civilizationStages: CivilizationStage[];
  civilizationStageRequirements: CivilizationStageRequirement[];
  civilizationMilestones: CivilizationMilestone[];
  civilizationProgressionPresentation: CivilizationProgressionPresentationContract[];
  validationRules: string[];
};

export type ColonyTypeId =
  | "primary_colony"
  | "secondary_colony"
  | "frontier_colony"
  | "mining_colony"
  | "research_colony"
  | "agricultural_colony"
  | "industrial_colony"
  | "trade_colony"
  | "logistics_hub"
  | "orbital_colony"
  | "floating_colony"
  | "subsurface_colony"
  | "fuel_depot"
  | "archaeological_outpost"
  | "preservation_station"
  | "terraforming_base"
  | "automated_outpost";

export type ColonizationEligibilityState = "unavailable" | "currently_locked" | "technically_possible" | "supported" | "recommended" | "restricted" | "prohibited";

export type ColonizationReasonCodeId =
  | "no_solid_surface"
  | "insufficient_technology"
  | "insufficient_population"
  | "insufficient_logistics"
  | "protected_ecology"
  | "precursor_quarantine"
  | "extreme_hazard"
  | "no_habitation_support"
  | "missing_colony_ship"
  | "missing_resource_allocation"
  | "progression_stage_locked";

export type ColonyProjectPhaseId =
  | "planning"
  | "site_selection"
  | "resource_allocation"
  | "population_assignment"
  | "transport_preparation"
  | "transit"
  | "landing_or_orbital_insertion"
  | "site_preparation"
  | "initial_habitat_construction"
  | "life_support_activation"
  | "infrastructure_commissioning"
  | "operational";

export type ColonyResourcePackageId = "minimum_viable" | "standard" | "accelerated" | "specialized" | "automated";

export type ColonyDevelopmentStageId =
  | "founding_outpost"
  | "established_outpost"
  | "settlement"
  | "developed_settlement"
  | "town"
  | "city"
  | "major_city"
  | "planetary_capital"
  | "orbital_metropolis"
  | "megacity"
  | "specialized_world"
  | "mature_colony";

export type ColonyFocusId =
  | "balanced"
  | "population_growth"
  | "mining"
  | "industry"
  | "research"
  | "agriculture"
  | "trade"
  | "logistics"
  | "preservation"
  | "archaeology"
  | "energy"
  | "orbital_infrastructure"
  | "terraforming"
  | "automation";

export type ColonyCapabilityId =
  | "habitation"
  | "extraction"
  | "processing"
  | "manufacturing"
  | "research"
  | "trade"
  | "storage"
  | "ship_support"
  | "population_growth"
  | "terraforming"
  | "preservation"
  | "defense_security"
  | "tourism"
  | "automation"
  | "diplomacy"
  | "education"
  | "healthcare";

export type ColonyOutcomeId = "completed" | "paused" | "blocked" | "failed" | "cancelled" | "abandoned" | "decommissioned" | "evacuated";

export type ColonizationRequirementReference = {
  type: "technology" | "building" | "resource" | "population" | "workforce" | "logistics" | "progression_stage" | "progression_milestone" | "action" | "identity" | "policy" | "transport";
  id: string;
  quantity: number | null;
  required: boolean;
  reasonCode: string;
  notes: string;
};

export type CivilizationIdentityInfluenceProfile = {
  alignmentIds: Array<"Industry" | "Technology" | "Cyber" | "Nature" | "Corporate">;
  influenceTrigger: "phase_completion" | "operational_completion";
  influenceAmount: number;
  notes: string;
};

export type ColonyTypeDefinition = {
  id: ColonyTypeId;
  displayName: string;
  description: string;
  supportedBodyClasses: string[];
  prohibitedBodyClasses: string[];
  requiredCapabilityStates: ColonyCapabilityId[];
  requiredTechnologies: string[];
  requiredBuildings: string[];
  requiredResources: string[];
  requiredPopulation: number;
  requiredWorkforce: number;
  requiredLogistics: number;
  phaseTemplateId: "colonization_project_standard";
  defaultDevelopmentFocus: ColonyFocusId;
  civilizationIdentityInfluence: CivilizationIdentityInfluenceProfile;
  progressionRequirements: ColonizationRequirementReference[];
  allowedActionIds: string[];
  publicationStatus: "approved" | "planned" | "draft";
};

export type ColonizationEligibilityDefinition = {
  id: ColonizationEligibilityState;
  displayName: string;
  order: number;
  canStartProject: boolean;
  blocksActionStart: boolean;
  description: string;
};

export type ColonizationReasonCodeDefinition = {
  id: ColonizationReasonCodeId;
  displayName: string;
  severity: "blocker" | "warning" | "info";
  description: string;
  recommendedResolution: string;
};

export type ColonizationResolverContract = {
  id: "resolveColonizationEligibility";
  deterministic: true;
  inputFields: string[];
  returnFields: string[];
  evaluationOrder: string[];
  notes: string;
};

export type ColonyProjectPhaseDefinition = {
  id: ColonyProjectPhaseId;
  displayName: string;
  order: number;
  canonicalActionPhaseId: string;
  durationDefinitionId: string;
  requirementIds: string[];
  resourceInputRoles: string[];
  populationInputRoles: string[];
  workforceInputRoles: string[];
  logisticsCapacityRequired: number;
  failureConditionIds: string[];
  cancellationPolicy: string;
  completionEffects: string[];
  presentationLabel: string;
};

export type ColonyTransportRequirementDefinition = {
  id: string;
  displayName: string;
  requiredForColonyTypeIds: ColonyTypeId[];
  canonicalAssetKey: string | null;
  canonicalBuildingId: string | null;
  canonicalResourceId: string | null;
  status: "resolved" | "missing_canonical_definition";
  notes: string;
};

export type ColonyResourcePackageDefinition = {
  id: ColonyResourcePackageId;
  displayName: string;
  description: string;
  resourceInputs: Array<{ role: string; resourceId: string; quantity: number; required: boolean }>;
  transportRequirementIds: string[];
  recommendedForColonyTypeIds: ColonyTypeId[];
  projectedDurationModifier: number;
  notes: string;
};

export type ColonyPopulationRequirementDefinition = {
  id: string;
  colonyTypeId: ColonyTypeId;
  minimumFoundingPopulation: number;
  minimumAssignedWorkforce: number;
  specialistsRequired: string[];
  engineersRequired: number;
  scientistsRequired: number;
  logisticsStaffRequired: number;
  automationSubstitutionPolicy: string;
  aiAgentSupport: boolean;
  roboticWorkforceSupport: boolean;
};

export type ColonyInitialStateTemplate = {
  id: string;
  colonyTypeId: ColonyTypeId;
  operationalStatus: "planned" | "operational";
  foundingPopulation: number;
  populationCapacity: number;
  assignedWorkforce: number;
  lifeSupportCapacity: number;
  storageCapacity: number;
  energyCapacity: number;
  foodWaterBalance: "surplus" | "balanced" | "shortage";
  logisticsAccess: "local" | "orbital" | "interplanetary" | "interstellar";
  firstBuildingSetId: string;
  settlementFocus: ColonyFocusId;
  growthPolicy: string;
  hazardModifierIds: string[];
  maintenanceCategoryIds: string[];
  civilizationIdentityEffects: CivilizationIdentityInfluenceProfile;
  progressionContributionIds: string[];
};

export type ColonyDevelopmentStage = {
  id: ColonyDevelopmentStageId;
  displayName: string;
  order: number;
  requirements: Array<{ type: string; id: string; threshold: number | string; notes: string }>;
  unlockedCapabilityIds: ColonyCapabilityId[];
  presentationKey: string;
  notes: string;
};

export type ColonyFocusDefinition = {
  id: ColonyFocusId;
  displayName: string;
  description: string;
  recommendedBuildingRoles: string[];
  resourcePriorityRoles: string[];
  workforcePriority: string;
  growthModifiers: Record<string, number>;
  identityInfluence: CivilizationIdentityInfluenceProfile;
  recommendedActionIds: string[];
};

export type ColonyStarterSetDefinition = {
  id: string;
  colonyTypeId: ColonyTypeId;
  displayName: string;
  buildingRoles: Array<{ role: string; buildingId: string | null; required: boolean; notes: string }>;
  missingBuildingRoles: string[];
};

export type ColonyCapabilityDefinition = {
  id: ColonyCapabilityId;
  displayName: string;
  description: string;
  inputsToFutureSystems: string[];
};

export type ColonyMaintenanceDefinition = {
  id: string;
  displayName: string;
  category: "hazard_modifier" | "maintenance_category";
  formulaHook: string;
  affectedCapabilityIds: ColonyCapabilityId[];
  notes: string;
};

export type ColonyFailurePolicy = {
  id: ColonyOutcomeId;
  displayName: string;
  refundPolicy: string;
  resourceRecovery: string;
  populationRecovery: string;
  remainingInfrastructure: string;
  historicalRecord: boolean;
  identityInfluence: CivilizationIdentityInfluenceProfile | null;
  timelineEventType: string;
  restartRequirements: string[];
};

export type ColonyPresentationContract = {
  id:
    | "ColonizationEligibilityPanel"
    | "ColonyTypeCard"
    | "ColonyResourcePackage"
    | "ColonyPopulationRequirement"
    | "ColonyProjectTimeline"
    | "ColonyPhaseStepper"
    | "ColonyStarterSet"
    | "ColonyCapabilitySummary"
    | "ColonyOperationalReport"
    | "ColonyGrowthStage"
    | "ColonyFocusSelector"
    | "ColonyFailureSummary"
    | "ColonyAbandonmentSummary";
  displayName: string;
  rendererIndependent: true;
  semanticFields: string[];
  notes: string;
};

export type ColonizationMissingCanonicalDefinition = {
  id: string;
  type: "building" | "resource" | "transport" | "progression_milestone" | "asset";
  displayName: string;
  referencedBy: string[];
  severity: "warning" | "info";
  recommendedOwner: "Building Library" | "Resource Catalog" | "Asset Library" | "Civilization Progression" | "Transport System";
  notes: string;
};

export type ColonizationFrameworkContract = {
  id: "colonization_settlement_framework_v1";
  version: "1.0.0";
  architectureDecisionId: "ARCH-DECISION-COLONIZATION-MULTI-STAGE-PROJECT";
  actionSystemId: ActionSystemContract["id"];
  planetDevelopmentFrameworkId: PlanetDevelopmentFrameworkContract["id"];
  civilizationProgressionFrameworkId: CivilizationProgressionFrameworkContract["id"];
  civilizationIdentitySource: "civilization_identity";
  calculationVersion: string;
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  activePlayerStatePolicy: {
    exportsActiveColonies: false;
    exportsProjectQueues: false;
    exportsTimestamps: false;
    exportsPlayerPopulationAssignments: false;
    exportsTransferredResources: false;
  };
  resolverContract: ColonizationResolverContract;
  colonyTypeDefinitions: ColonyTypeDefinition[];
  colonizationEligibilityDefinitions: ColonizationEligibilityDefinition[];
  colonizationReasonCodes: ColonizationReasonCodeDefinition[];
  colonyProjectPhaseDefinitions: ColonyProjectPhaseDefinition[];
  colonyTransportRequirementDefinitions: ColonyTransportRequirementDefinition[];
  colonyResourcePackageDefinitions: ColonyResourcePackageDefinition[];
  colonyPopulationRequirementDefinitions: ColonyPopulationRequirementDefinition[];
  colonyInitialStateTemplates: ColonyInitialStateTemplate[];
  colonyDevelopmentStages: ColonyDevelopmentStage[];
  colonyFocusDefinitions: ColonyFocusDefinition[];
  colonyStarterSetDefinitions: ColonyStarterSetDefinition[];
  colonyCapabilityDefinitions: ColonyCapabilityDefinition[];
  colonyMaintenanceDefinitions: ColonyMaintenanceDefinition[];
  colonyFailurePolicies: ColonyFailurePolicy[];
  colonyPresentationContract: ColonyPresentationContract[];
  creativeProductionRequirements: Array<{ id: string; displayName: string; category: string; status: "required" | "planned"; notes: string }>;
  assetLibraryCategories: Array<{ id: string; displayName: string; groups: string[]; notes: string }>;
  missingCanonicalDefinitions: ColonizationMissingCanonicalDefinition[];
  validationRules: string[];
};

export type EconomyLogisticsResourceClass =
  | "metal"
  | "mineral"
  | "volatile"
  | "gas"
  | "liquid"
  | "energy"
  | "organic"
  | "biological"
  | "chemical"
  | "manufactured"
  | "data"
  | "artifact"
  | "fuel"
  | "food"
  | "water"
  | "waste"
  | "exotic"
  | "general";

export type EconomyNodeTypeId =
  | "extraction_site"
  | "mining_outpost"
  | "gas_harvest_platform"
  | "ocean_harvest_platform"
  | "agricultural_site"
  | "research_site"
  | "archaeological_site"
  | "storage_depot"
  | "warehouse"
  | "orbital_storage"
  | "refinery"
  | "processing_plant"
  | "factory"
  | "manufacturing_complex"
  | "colony"
  | "city"
  | "trade_hub"
  | "logistics_hub"
  | "refueling_station"
  | "spaceport"
  | "orbital_port"
  | "fleet"
  | "expedition"
  | "terraforming_project"
  | "recycling_center"
  | "waste_site"
  | "market"
  | "distribution_center";

export type ResourceLocationScopeId = "celestial_body" | "colony" | "settlement" | "building" | "storage_node" | "fleet" | "route" | "sector" | "star_system" | "civilization" | "market" | "project";
export type ResourceExtractionDefinitionId = "surface_mining" | "deep_core_mining" | "automated_mining" | "asteroid_mining" | "atmospheric_harvesting" | "ocean_harvesting" | "ice_extraction" | "geothermal_extraction" | "biological_harvesting" | "rare_matter_extraction" | "artifact_recovery" | "archaeological_recovery" | "stellar_energy_collection" | "salvage";
export type ResourceStorageDefinitionId = "raw_material_storage" | "bulk_storage" | "liquid_storage" | "gas_storage" | "cryogenic_storage" | "hazardous_storage" | "biological_storage" | "artifact_storage" | "scientific_sample_storage" | "energy_storage" | "food_storage" | "water_storage" | "orbital_storage" | "mobile_storage" | "fleet_cargo" | "secure_vault";
export type TransportModeDefinitionId = "surface_transport" | "pipeline" | "conveyor" | "orbital_lift" | "cargo_shuttle" | "cargo_ship" | "colony_ship" | "tanker" | "freighter" | "automated_drone" | "interplanetary_freighter" | "interstellar_freighter" | "gateway_transfer" | "trade_convoy" | "expedition_transport" | "emergency_transport";
export type LogisticsRouteDefinitionId = "local_supply_route" | "colony_internal_route" | "surface_to_orbit" | "orbital_to_surface" | "interplanetary_route" | "interstellar_route" | "trade_route" | "fuel_route" | "research_sample_route" | "artifact_secure_route" | "colonization_supply_route" | "terraforming_supply_route" | "emergency_route";
export type ShipmentStateId = "planned" | "reserving" | "loading" | "queued" | "departing" | "in_transit" | "delayed" | "rerouted" | "arrived" | "unloading" | "completed" | "lost" | "damaged" | "cancelled";
export type ThroughputDefinitionId = "extraction" | "storage" | "loading" | "unloading" | "transport" | "processing" | "manufacturing" | "distribution" | "consumption" | "recycling";
export type CapacityConstraintId = "node_capacity" | "route_capacity" | "transport_capacity" | "port_capacity" | "workforce_capacity" | "energy_capacity" | "storage_capacity" | "queue_capacity";
export type EconomyLogisticsPriorityId = "critical" | "essential" | "operational" | "growth" | "strategic" | "optional" | "luxury";
export type EconomyConditionStateId = "severe_shortage" | "shortage" | "constrained" | "balanced" | "surplus" | "oversupply" | "blocked_storage" | "transport_bottleneck" | "processing_bottleneck" | "workforce_bottleneck" | "energy_bottleneck" | "route_disruption";
export type EconomyLossPolicyId = "transport_loss" | "hazard_damage" | "spoilage" | "evaporation" | "contamination" | "theft_security_loss" | "accident_loss" | "storage_degradation" | "manufacturing_waste" | "recycling_recovery" | "disposal";
export type EconomyRecipeCategoryId = "refining" | "smelting" | "chemical_processing" | "biological_processing" | "food_processing" | "construction_materials" | "electronics" | "robotics" | "ship_components" | "scientific_equipment" | "terraforming_materials" | "energy_products" | "consumer_goods" | "artifact_processing" | "recycling";
export type MarketTradeScopeId = "locally_exchanged" | "civilization_traded" | "interplanetary_traded" | "interstellar_traded" | "restricted" | "protected" | "non_tradable" | "unique" | "contraband_future";

export type EconomyLogisticsIdentityInfluenceProfile = {
  alignmentIds: Array<"Industry" | "Technology" | "Cyber" | "Nature" | "Corporate" | "Trade" | "Automation" | "Scientific" | "Eco">;
  influenceTrigger: "action_completion" | "route_completion" | "production_chain_completion" | "shortage_resolved" | "waste_recycled";
  influenceAmount: number;
  notes: string;
};

export type EconomyNodeTypeDefinition = {
  id: EconomyNodeTypeId;
  displayName: string;
  supportedResourceClasses: EconomyLogisticsResourceClass[];
  inputCapacity: number;
  outputCapacity: number;
  storageCapacity: number;
  throughput: number;
  workforceRequirement: number;
  energyRequirement: number;
  buildingReferences: string[];
  automationSupport: "none" | "assisted" | "full";
  hazardConstraints: string[];
  routeCompatibility: LogisticsRouteDefinitionId[];
  presentationToken: string;
  status: "approved" | "provisional";
};

export type ResourceLocationScopeDefinition = {
  id: ResourceLocationScopeId;
  displayName: string;
  resourceStateSchema: {
    locationId: string;
    resourceId: string;
    availableQuantity: number;
    reservedQuantity: number;
    inTransitQuantity: number;
    damagedQuantity: number;
    wasteQuantity: number;
    capacity: number;
    lastUpdatedAt: string;
  };
  gameOwnsValues: true;
  studioPublishesSchemaOnly: true;
  notes: string;
};

export type ResourceExtractionDefinition = {
  id: ResourceExtractionDefinitionId;
  displayName: string;
  actionId: string;
  eligibleBodyClasses: string[];
  eligibleResourceClasses: EconomyLogisticsResourceClass[];
  buildingRequirementIds: string[];
  technologyRequirementIds: string[];
  workforceRequirement: number;
  equipmentRequirementIds: string[];
  energyRequirement: number;
  baseOutput: number;
  durationDefinitionId: string;
  depletionPolicyId: string;
  hazardModifierIds: string[];
  byproductResourceIds: string[];
  wastePolicyId: EconomyLossPolicyId;
  identityInfluence: EconomyLogisticsIdentityInfluenceProfile;
  status: "approved" | "provisional";
};

export type ResourceStorageDefinition = {
  id: ResourceStorageDefinitionId;
  displayName: string;
  supportedResourceClasses: EconomyLogisticsResourceClass[];
  capacityUnits: number;
  hazardRequirements: string[];
  environmentalRequirements: string[];
  lossPolicyId: EconomyLossPolicyId;
  buildingReferenceIds: string[];
  upgradeReferenceIds: string[];
  automationSupport: "none" | "assisted" | "full";
  status: "approved" | "provisional";
};

export type TransportModeDefinition = {
  id: TransportModeDefinitionId;
  displayName: string;
  supportedRouteScopes: LogisticsRouteDefinitionId[];
  cargoClasses: EconomyLogisticsResourceClass[];
  capacity: number;
  speedClass: "slow" | "standard" | "fast" | "instant_gate";
  fuelRequirementIds: string[];
  technologyRequirementIds: string[];
  buildingPortRequirementIds: string[];
  workforceOrAutomationRequirement: string;
  hazardTolerance: string[];
  lossPolicyId: EconomyLossPolicyId;
  maintenanceHooks: string[];
  actionIds: string[];
  presentationToken: string;
  status: "approved" | "provisional";
};

export type LogisticsRouteDefinition = {
  id: LogisticsRouteDefinitionId;
  displayName: string;
  sourceNodeRequirements: EconomyNodeTypeId[];
  destinationNodeRequirements: EconomyNodeTypeId[];
  validTransportModeIds: TransportModeDefinitionId[];
  maximumDistancePolicy: string;
  travelTimePolicy: string;
  throughput: number;
  capacity: number;
  priority: EconomyLogisticsPriorityId;
  hazardModifierIds: string[];
  escortSecurityHooks: string[];
  fuelCostPolicy: string;
  routeActionIds: string[];
  failureRetryPolicy: string;
  queuePolicyId: string;
  deterministic: true;
};

export type ShipmentInstanceSchema = {
  shipmentId: string;
  routeDefinitionId: LogisticsRouteDefinitionId;
  sourceNodeId: string;
  destinationNodeId: string;
  transportModeId: TransportModeDefinitionId;
  cargo: Array<{ resourceId: string; quantity: number; reservedQuantity: number }>;
  reservedAt: string;
  departedAt: string | null;
  estimatedArrivalAt: string | null;
  arrivedAt: string | null;
  state: ShipmentStateId;
  capacityUsed: number;
  fuelCost: Array<{ resourceId: string; quantity: number }>;
  hazardSnapshot: Record<string, unknown>;
  idempotencyKey: string;
  createdFromContentVersion: number;
};

export type ShipmentStateDefinition = {
  id: ShipmentStateId;
  displayName: string;
  terminal: boolean;
  cargoLocation: "source" | "transport" | "destination" | "lost" | "cancelled";
  allowedTransitions: ShipmentStateId[];
  presentationToken: string;
};

export type ThroughputDefinition = {
  id: ThroughputDefinitionId;
  displayName: string;
  supportedModes: Array<"per-minute" | "per-hour" | "per-cycle" | "per-Action" | "batch" | "continuous">;
  defaultMode: "per-minute" | "per-hour" | "per-cycle" | "per-Action" | "batch" | "continuous";
  capacityConstraintIds: CapacityConstraintId[];
  formula: string;
  bounded: true;
};

export type CapacityConstraintDefinition = {
  id: CapacityConstraintId;
  displayName: string;
  appliesTo: string[];
  hardLimit: boolean;
  notes: string;
};

export type EconomyRecipeDefinition = {
  id: string;
  displayName: string;
  categoryId: EconomyRecipeCategoryId;
  inputItems: Array<{ resourceId: string; quantity: number }>;
  outputItems: Array<{ resourceId: string; quantity: number }>;
  byproducts: Array<{ resourceId: string; quantity: number }>;
  wasteOutputs: Array<{ resourceId: string; quantity: number; policyId: EconomyLossPolicyId }>;
  requiredBuildingIds: string[];
  requiredResearchIds: string[];
  requiredWorkforceRoles: string[];
  energyRequirement: number;
  durationDefinitionId: string;
  actionId: string;
  batchSize: number;
  automationPolicyId: string;
  qualityPolicyId: string;
  status: "approved" | "provisional" | "draft";
  provisionalBalance: boolean;
};

export type ProductionChainDefinition = {
  id: string;
  displayName: string;
  stages: Array<{ order: number; inputResourceIds: string[]; outputResourceIds: string[]; recipeId: string; nodeTypeIds: EconomyNodeTypeId[] }>;
  storageRequirementIds: ResourceStorageDefinitionId[];
  transportRequirementIds: TransportModeDefinitionId[];
  bottleneckDefinitionIds: EconomyConditionStateId[];
  completionOutputResourceIds: string[];
  presentationSummary: string;
  status: "approved" | "provisional";
};

export type SupplyDemandDefinition = {
  id: string;
  displayName: string;
  type: "supply" | "demand";
  sourceType: "population" | "buildings" | "colonies" | "construction_projects" | "research" | "manufacturing" | "fleets" | "terraforming" | "trade" | "expeditions" | "maintenance" | "extraction" | "production" | "recycling" | "salvage" | "rewards" | "imports";
  resourceClassIds: EconomyLogisticsResourceClass[];
  priorityId: EconomyLogisticsPriorityId;
  affectedActionIds: string[];
  notes: string;
};

export type EconomyPriorityDefinition = {
  id: EconomyLogisticsPriorityId;
  displayName: string;
  order: number;
  canBlockActions: boolean;
  notes: string;
};

export type EconomyConditionStateDefinition = {
  id: EconomyConditionStateId;
  displayName: string;
  severity: "critical" | "warning" | "neutral" | "positive";
  reasonCode: string;
  blocksActionStart: boolean;
  presentationToken: string;
};

export type EconomyLossWastePolicy = {
  id: EconomyLossPolicyId;
  displayName: string;
  appliesToResourceClasses: EconomyLogisticsResourceClass[];
  deterministicFormula: string;
  producesWaste: boolean;
  recoveryPolicyId: string | null;
  version: string;
};

export type RecyclingPolicyDefinition = {
  id: string;
  displayName: string;
  inputResourceClasses: EconomyLogisticsResourceClass[];
  recoveredResourceClass: EconomyLogisticsResourceClass;
  recoveryRate: number;
  actionId: string;
  wastePolicyId: EconomyLossPolicyId;
};

export type ResourceFlowDefinition = {
  id: string;
  resourceId: string;
  resourceClass: EconomyLogisticsResourceClass;
  sourceNodeTypes: EconomyNodeTypeId[];
  destinationNodeTypes: EconomyNodeTypeId[];
  extractionDefinitionId: ResourceExtractionDefinitionId | null;
  storageDefinitionIds: ResourceStorageDefinitionId[];
  transportModeIds: TransportModeDefinitionId[];
  processingRecipeIds: string[];
  manufacturingRecipeIds: string[];
  consumptionProfileIds: string[];
  lossPolicyId: EconomyLossPolicyId;
  wastePolicyId: EconomyLossPolicyId;
  recyclingPolicyId: string | null;
  marketEligibility: MarketTradeScopeId[];
  tradeEligibility: MarketTradeScopeId[];
  hazardProfileId: string;
  presentationProfileId: string;
  status: "approved" | "provisional";
};

export type MarketTradeIntegrationDefinition = {
  id: string;
  nodeTypeId: EconomyNodeTypeId;
  locationScopeIds: ResourceLocationScopeId[];
  acceptedResourceClasses: EconomyLogisticsResourceClass[];
  storageDefinitionIds: ResourceStorageDefinitionId[];
  routeAccessIds: LogisticsRouteDefinitionId[];
  pricePolicyId: string;
  transactionReasonCodeIds: string[];
  tradeActionIds: string[];
  listingSchema: Record<string, string>;
  gameOwnsOrders: true;
};

export type EconomyLogisticsPresentationContract = {
  id:
    | "EconomyOverview"
    | "ResourceFlowGraph"
    | "SupplyDemandSummary"
    | "StorageCapacityPanel"
    | "ShipmentCard"
    | "ShipmentTimeline"
    | "RouteSummary"
    | "LogisticsNetworkView"
    | "ProductionChainView"
    | "RecipeCard"
    | "BottleneckAlert"
    | "ShortageAlert"
    | "SurplusIndicator"
    | "MarketSummary"
    | "RecyclingSummary"
    | "ColonySupplyReadiness"
    | "ProjectSupplyChecklist";
  displayName: string;
  rendererIndependent: true;
  semanticFields: string[];
  notes: string;
};

export type ResourceEconomyLogisticsMissingCanonicalDefinition = {
  id: string;
  type: "resource" | "building" | "action" | "progression_milestone" | "asset" | "recipe";
  displayName: string;
  referencedBy: string[];
  severity: "warning" | "info";
  recommendedOwner: "Resource Catalog" | "Building Library" | "Action System" | "Civilization Progression" | "Asset Library" | "Economy Designer";
  notes: string;
};

export type ResourceEconomyLogisticsFrameworkContract = {
  id: "resource_economy_logistics_framework_v1";
  version: "1.0.0";
  architectureDecisionId: "ARCH-DECISION-RESOURCE-ECONOMY-LOGISTICS-NETWORK";
  actionSystemId: ActionSystemContract["id"];
  planetDevelopmentFrameworkId: PlanetDevelopmentFrameworkContract["id"];
  civilizationProgressionFrameworkId: CivilizationProgressionFrameworkContract["id"];
  colonizationFrameworkId: ColonizationFrameworkContract["id"];
  civilizationIdentitySource: "civilization_identity";
  calculationVersion: string;
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  activePlayerStatePolicy: {
    exportsPlayerInventories: false;
    exportsLiveStockpiles: false;
    exportsActiveShipments: false;
    exportsRouteInstances: false;
    exportsMarketOrders: false;
    exportsTimestamps: false;
    exportsQueueInstances: false;
    exportsTransportAssignments: false;
  };
  auditSummary: Array<{ id: string; source: string; status: "integrated" | "referenced" | "reported"; notes: string }>;
  resourceFlowDefinitions: ResourceFlowDefinition[];
  economyNodeTypeDefinitions: EconomyNodeTypeDefinition[];
  resourceLocationScopes: ResourceLocationScopeDefinition[];
  resourceExtractionDefinitions: ResourceExtractionDefinition[];
  resourceStorageDefinitions: ResourceStorageDefinition[];
  transportModeDefinitions: TransportModeDefinition[];
  logisticsRouteDefinitions: LogisticsRouteDefinition[];
  shipmentInstanceSchema: ShipmentInstanceSchema;
  shipmentStateDefinitions: ShipmentStateDefinition[];
  throughputDefinitions: ThroughputDefinition[];
  capacityConstraintDefinitions: CapacityConstraintDefinition[];
  processingRecipeDefinitions: EconomyRecipeDefinition[];
  manufacturingRecipeDefinitions: EconomyRecipeDefinition[];
  productionChainDefinitions: ProductionChainDefinition[];
  supplyDemandDefinitions: SupplyDemandDefinition[];
  economyPriorityDefinitions: EconomyPriorityDefinition[];
  economyConditionStateDefinitions: EconomyConditionStateDefinition[];
  economyShortageReasonCodes: Array<{ id: string; stateId: EconomyConditionStateId; displayName: string; blocksActionStart: boolean; recommendedResolution: string }>;
  lossAndWastePolicies: EconomyLossWastePolicy[];
  recyclingPolicies: RecyclingPolicyDefinition[];
  marketTradeIntegration: MarketTradeIntegrationDefinition[];
  colonizationIntegration: {
    colonyResourcePackageIds: ColonyResourcePackageId[];
    requiredRouteDefinitionIds: LogisticsRouteDefinitionId[];
    requiredTransportModeIds: TransportModeDefinitionId[];
    requiredPhaseIds: ColonyProjectPhaseId[];
    rule: string;
  };
  populationIntegrationHooks: Array<{ id: string; consumesResourceClasses: EconomyLogisticsResourceClass[]; provides: string[]; notes: string }>;
  buildingIntegrationHooks: Array<{ id: string; buildingFamilyId: string; nodeTypeIds: EconomyNodeTypeId[]; providedCapabilities: string[]; missingCoverage: boolean }>;
  actionIntegrationHooks: Array<{ id: string; actionId: string; purpose: string; required: boolean }>;
  identityIntegrationHooks: EconomyLogisticsIdentityInfluenceProfile[];
  progressionIntegrationHooks: Array<{ id: string; milestoneId: string; status: "resolved" | "missing_canonical_definition"; notes: string }>;
  aiAutomationRules: string[];
  economyLogisticsPresentationContract: EconomyLogisticsPresentationContract[];
  creativeProductionRequirements: Array<{ id: string; displayName: string; category: "Economy & Logistics"; status: "required" | "planned"; notes: string }>;
  assetLibraryCategories: Array<{ id: string; displayName: string; groups: string[]; notes: string }>;
  missingCanonicalDefinitions: ResourceEconomyLogisticsMissingCanonicalDefinition[];
  provisionalBalanceValues: Array<{ id: string; field: string; value: number | string; reason: string }>;
  validationRules: string[];
};

export type MissionExpeditionTypeId =
  | "exploration"
  | "survey"
  | "research"
  | "colonization"
  | "logistics"
  | "trade"
  | "rescue"
  | "archaeology"
  | "diplomacy"
  | "security";

export type ExpeditionScopeId = "local" | "planetary" | "orbital" | "interplanetary" | "interstellar" | "galactic";
export type MissionLifecycleStateId = "locked" | "available" | "accepted" | "preparing" | "in_progress" | "ready_to_complete" | "completed" | "failed" | "expired" | "abandoned";
export type ExpeditionLifecycleStateId = "draft" | "planned" | "assembling" | "launch_ready" | "en_route" | "operating" | "returning" | "completed" | "failed" | "recalled" | "lost";
export type MissionObjectiveContractId =
  | "scan_sector"
  | "scan_star_system"
  | "scan_planet"
  | "survey_body"
  | "discover_resource"
  | "discover_faction"
  | "chart_location"
  | "claim_planet"
  | "colonize_planet"
  | "establish_colony"
  | "construct_building"
  | "produce_resource"
  | "deliver_resource"
  | "establish_trade_route"
  | "stabilize_market"
  | "resolve_shortage"
  | "escort_route"
  | "survey_anomaly"
  | "analyze_artifact"
  | "complete_research";
export type MissionRewardContractId = "discovery_points" | "credits" | "resource" | "research_points" | "research_unlock" | "faction_reputation" | "colony_bonus" | "trade_access" | "unique_item" | "title" | "collectible" | "civilization_influence";
export type MissionDifficultyContractId = "trivial" | "easy" | "moderate" | "hard" | "extreme" | "legendary";

export type MissionExpeditionTypeDefinition = {
  id: MissionExpeditionTypeId;
  displayName: string;
  description: string;
  expeditionScopeIds: ExpeditionScopeId[];
  defaultObjectiveTypeIds: MissionObjectiveContractId[];
  defaultRewardTypeIds: MissionRewardContractId[];
  requiredActionIds: string[];
  relatedSystemIds: string[];
  presentationToken: string;
  status: "approved" | "provisional";
};

export type ExpeditionScopeDefinition = {
  id: ExpeditionScopeId;
  displayName: string;
  minimumTechnologyGateId: string;
  validTargetTypes: string[];
  requiredRouteDefinitionIds: LogisticsRouteDefinitionId[];
  requiredTransportModeIds: TransportModeDefinitionId[];
  maximumDistancePolicy: string;
  durationPolicyId: string;
  hazardPolicyIds: string[];
  status: "approved" | "provisional";
};

export type MissionLifecycleStateDefinition = {
  id: MissionLifecycleStateId;
  displayName: string;
  terminal: boolean;
  playerVisible: boolean;
  allowedTransitions: MissionLifecycleStateId[];
  presentationToken: string;
};

export type ExpeditionLifecycleStateDefinition = {
  id: ExpeditionLifecycleStateId;
  displayName: string;
  terminal: boolean;
  allowedTransitions: ExpeditionLifecycleStateId[];
  missionStateHint: MissionLifecycleStateId;
  presentationToken: string;
};

export type MissionObjectiveContractDefinition = {
  id: MissionObjectiveContractId;
  displayName: string;
  targetTypes: string[];
  requiredActionIds: string[];
  requiredKnowledgeStates: string[];
  progressSource: "action_completion" | "discovery_event" | "resource_delivery" | "construction_completion" | "research_completion" | "market_event" | "manual_game_event";
  deterministicProgressKey: string;
  validationRule: string;
};

export type MissionRewardContractDefinition = {
  id: MissionRewardContractId;
  displayName: string;
  rewardSource: "economy" | "resource_catalog" | "research" | "faction" | "colony" | "trade" | "discovery" | "encyclopedia" | "identity";
  gameOwnsClaimState: true;
  allowedForMissionTypeIds: MissionExpeditionTypeId[];
  validationRule: string;
};

export type MissionTemplateDefinition = {
  id: string;
  displayName: string;
  missionTypeId: MissionExpeditionTypeId;
  expeditionScopeId: ExpeditionScopeId;
  difficultyId: MissionDifficultyContractId;
  objectiveTypeIds: MissionObjectiveContractId[];
  rewardTypeIds: MissionRewardContractId[];
  prerequisiteResearchIds: string[];
  prerequisiteDiscoveryStateIds: string[];
  targetSelectionRule: string;
  deterministicSeedRule: string;
  repeatPolicy: "once" | "repeatable" | "daily" | "event_limited";
  expirationPolicy: "none" | "time_limited_game_owned" | "event_window_game_owned";
  status: "approved" | "provisional";
};

export type ExpeditionRequirementDefinition = {
  id: string;
  displayName: string;
  requirementType: "crew" | "vehicle" | "resource" | "fuel" | "supply" | "equipment" | "technology" | "route" | "knowledge" | "logistics_capacity";
  resourceIds: string[];
  actionIds: string[];
  routeDefinitionIds: LogisticsRouteDefinitionId[];
  transportModeIds: TransportModeDefinitionId[];
  minimumQuantity: number;
  gameOwnsAssignmentState: true;
  notes: string;
};

export type ExpeditionRiskDefinition = {
  id: string;
  displayName: string;
  appliesToScopeIds: ExpeditionScopeId[];
  hazardProfileIds: string[];
  failureCauseIds: string[];
  mitigationRequirementIds: string[];
  deterministicFormula: string;
  status: "approved" | "provisional";
};

export type MissionExpeditionIntegrationHook = {
  id: string;
  systemId: "action_system" | "planet_development" | "civilization_identity" | "civilization_progression" | "colonization" | "resource_economy_logistics" | "discovery" | "universal_discovery_registry" | "encyclopedia";
  referencedIds: string[];
  contractRule: string;
  required: boolean;
};

export type MissionExpeditionPresentationContract = {
  id:
    | "MissionBoard"
    | "MissionCard"
    | "MissionDetail"
    | "ObjectiveChecklist"
    | "RewardSummary"
    | "ExpeditionPlanner"
    | "ExpeditionLoadout"
    | "ExpeditionTimeline"
    | "RiskSummary"
    | "MissionCompletion"
    | "MissionHistory";
  displayName: string;
  rendererIndependent: true;
  semanticFields: string[];
  notes: string;
};

export type MissionExpeditionMissingCanonicalDefinition = {
  id: string;
  type: "resource" | "building" | "action" | "research" | "progression_milestone" | "asset" | "encyclopedia_entry";
  displayName: string;
  referencedBy: string[];
  severity: "warning" | "info";
  recommendedOwner: "Resource Catalog" | "Building Library" | "Action System" | "Research" | "Civilization Progression" | "Asset Library" | "Encyclopedia";
  notes: string;
};

export type MissionExpeditionFrameworkContract = {
  id: "mission_expedition_framework_v1";
  version: "1.0.0";
  architectureDecisionId: "ARCH-DECISION-MISSION-EXPEDITION-FRAMEWORK";
  actionSystemId: ActionSystemContract["id"];
  planetDevelopmentFrameworkId: PlanetDevelopmentFrameworkContract["id"];
  civilizationProgressionFrameworkId: CivilizationProgressionFrameworkContract["id"];
  colonizationFrameworkId: ColonizationFrameworkContract["id"];
  resourceEconomyLogisticsFrameworkId: ResourceEconomyLogisticsFrameworkContract["id"];
  universalDiscoveryRegistryVersion: string;
  calculationVersion: string;
  ownership: {
    studioOwns: string[];
    gameOwns: string[];
  };
  activePlayerStatePolicy: {
    exportsAcceptedMissions: false;
    exportsActiveExpeditions: false;
    exportsObjectiveProgress: false;
    exportsRewardClaims: false;
    exportsCrewAssignments: false;
    exportsTimestamps: false;
    exportsPlayerMissionHistory: false;
  };
  missionTypeDefinitions: MissionExpeditionTypeDefinition[];
  expeditionScopeDefinitions: ExpeditionScopeDefinition[];
  missionLifecycleStateDefinitions: MissionLifecycleStateDefinition[];
  expeditionLifecycleStateDefinitions: ExpeditionLifecycleStateDefinition[];
  missionObjectiveContractDefinitions: MissionObjectiveContractDefinition[];
  missionRewardContractDefinitions: MissionRewardContractDefinition[];
  missionTemplateDefinitions: MissionTemplateDefinition[];
  expeditionRequirementDefinitions: ExpeditionRequirementDefinition[];
  expeditionRiskDefinitions: ExpeditionRiskDefinition[];
  missionGenerationRules: Array<{ id: string; displayName: string; deterministic: true; inputs: string[]; rejectsWhen: string[]; notes: string }>;
  missionInstanceSchema: Record<string, string>;
  expeditionInstanceSchema: Record<string, string>;
  integrationHooks: MissionExpeditionIntegrationHook[];
  aiAutomationRules: string[];
  missionExpeditionPresentationContract: MissionExpeditionPresentationContract[];
  creativeProductionRequirements: Array<{ id: string; displayName: string; category: "Missions & Expeditions"; status: "required" | "planned"; notes: string }>;
  assetLibraryCategories: Array<{ id: string; displayName: string; groups: string[]; notes: string }>;
  missingCanonicalDefinitions: MissionExpeditionMissingCanonicalDefinition[];
  validationRules: string[];
};

export type DynamicEventPublicationStatus = "approved" | "provisional" | "draft";
export type DynamicEventCategoryId =
  | "stellar"
  | "planetary"
  | "atmospheric"
  | "geological"
  | "biological"
  | "ecological"
  | "anomalous"
  | "discovery"
  | "artifact"
  | "archaeology"
  | "colony"
  | "infrastructure"
  | "population"
  | "economy"
  | "logistics"
  | "trade"
  | "research"
  | "production"
  | "resource"
  | "terraforming"
  | "automation"
  | "ai_agent"
  | "civilization"
  | "identity"
  | "progression"
  | "mission"
  | "expedition"
  | "registry"
  | "story"
  | "opportunity"
  | "crisis"
  | "celebration";
export type DynamicEventTypeId =
  | "ambient"
  | "informational"
  | "opportunity"
  | "beneficial"
  | "neutral"
  | "disruptive"
  | "hazardous"
  | "crisis"
  | "milestone"
  | "discovery_triggered"
  | "mission_triggered"
  | "action_triggered"
  | "colony_triggered"
  | "economy_triggered"
  | "logistics_triggered"
  | "identity_triggered"
  | "progression_triggered"
  | "story"
  | "chain"
  | "branching"
  | "recurring"
  | "seasonal_future"
  | "global_future";
export type DynamicEventLifecycleStateId = "hidden" | "eligible" | "pending" | "triggered" | "revealed" | "active" | "awaiting_choice" | "resolving" | "resolved" | "expired" | "failed" | "cancelled" | "archived";
export type DynamicEventTriggerPolicyId =
  | "time_elapsed"
  | "action_started"
  | "action_completed"
  | "action_failed"
  | "mission_started"
  | "mission_completed"
  | "expedition_phase"
  | "discovery_state_changed"
  | "knowledge_state_changed"
  | "registry_claim"
  | "colony_stage_changed"
  | "colony_focus_changed"
  | "colony_shortage"
  | "colony_surplus"
  | "population_threshold"
  | "wellbeing_threshold"
  | "resource_threshold"
  | "storage_capacity_threshold"
  | "route_disruption"
  | "shipment_state_changed"
  | "production_bottleneck"
  | "research_completed"
  | "building_constructed"
  | "building_failed"
  | "identity_threshold"
  | "identity_trend"
  | "progression_stage"
  | "milestone_completed"
  | "hazard_threshold"
  | "celestial_condition"
  | "anomaly_detected"
  | "random_window_with_conditions"
  | "story_hook"
  | "manual_authorized";
export type DynamicEventProbabilityPolicyId = "guaranteed" | "weighted" | "threshold_based" | "windowed" | "escalating_chance" | "diminishing_chance" | "cooldown_based" | "chain_dependent" | "once_per_target" | "once_per_civilization" | "recurring" | "event_pool_selection";
export type DynamicEventSeverityId = "trivial" | "minor" | "moderate" | "major" | "severe" | "critical" | "civilization_defining";
export type DynamicEventDurationClassId = "instant_resolution" | "short_window" | "timed" | "persistent_until_resolved" | "multi_phase" | "recurring_window" | "permanent_historical";
export type DynamicEventPhaseId = "warning" | "onset" | "escalation" | "peak" | "response" | "stabilization" | "aftermath" | "resolved";
export type DynamicEventEffectTypeId =
  | "duration_modifier"
  | "action_speed_modifier"
  | "action_cost_modifier"
  | "resource_output_modifier"
  | "resource_consumption_modifier"
  | "storage_modifier"
  | "route_modifier"
  | "shipment_risk_modifier"
  | "production_modifier"
  | "research_modifier"
  | "colony_capacity_modifier"
  | "colony_stability_modifier"
  | "hazard_modifier"
  | "knowledge_reveal"
  | "discovery_opportunity"
  | "mission_generation"
  | "expedition_generation"
  | "building_damage_hook"
  | "building_bonus_hook"
  | "population_growth_hook"
  | "migration_hook"
  | "wellbeing_hook"
  | "identity_influence"
  | "progression_progress"
  | "market_modifier"
  | "temporary_unlock"
  | "permanent_unlock"
  | "timeline_entry"
  | "encyclopedia_reveal"
  | "registry_hook";
export type DynamicEventChoiceId = "investigate" | "ignore" | "evacuate" | "repair" | "reinforce" | "exploit" | "preserve" | "research" | "quarantine" | "trade" | "automate" | "manually_intervene" | "reroute" | "abandon" | "rescue" | "share_discovery" | "secure_artifact" | "donate_artifact" | "begin_mission" | "deploy_expedition";
export type DynamicEventResolutionPolicyId = "automatic" | "choice_based" | "action_based" | "mission_based" | "timed" | "threshold_based" | "multi_stage" | "server_authoritative" | "deterministic_roll" | "weighted_outcome";
export type DynamicEventTimelineSignificanceId = "not_recorded" | "local_record" | "colony_record" | "civilization_record" | "galactic_record";

export type PopulationCategoryKind = "demographic_cohort" | "workforce_role" | "specialist_role" | "synthetic_role" | "visitor_role";
export type PopulationLifeStageId = "child" | "adolescent" | "adult" | "senior" | "synthetic" | "non_biological" | "temporary_resident";
export type PopulationWorkforceRoleId = "general_labor" | "engineering" | "science" | "agriculture" | "mining" | "manufacturing" | "logistics" | "trade" | "administration" | "healthcare" | "education" | "exploration" | "archaeology" | "terraforming" | "automation_management" | "security" | "hospitality" | "maintenance" | "construction" | "energy";
export type PopulationAutomationPolicyId = "no_substitution" | "partial_substitution" | "full_substitution" | "specialist_only" | "supervision_required" | "biological_required" | "synthetic_preferred";
export type PopulationWellbeingBandId = "critical" | "unstable" | "strained" | "stable" | "thriving" | "exceptional";
export type PopulationMigrationTypeId = "internal_reassignment" | "colony_to_colony" | "planetary_migration" | "orbital_migration" | "interplanetary_migration" | "interstellar_migration" | "refugee_migration" | "specialist_relocation" | "colonist_transport" | "temporary_worker_transfer" | "visitor_travel";
export type WorkforceAssignmentModeId = "auto_assignment" | "manual_assignment" | "priority_assignment" | "minimum_staffing" | "target_staffing" | "specialist_required" | "automation_substitution" | "shortage" | "surplus" | "reserve_pool";
export type PopulationShortageReasonCodeId = "labor_shortage" | "specialist_shortage" | "housing_shortage" | "food_shortage" | "water_shortage" | "healthcare_shortage" | "education_shortage" | "life_support_shortage" | "overcapacity" | "unemployment" | "population_decline" | "migration_pressure" | "evacuation_required";

export type PopulationCategoryDefinition = { id: string; displayName: string; kind: PopulationCategoryKind; description: string; lifeStageIds: PopulationLifeStageId[]; workforceRoleIds: PopulationWorkforceRoleId[]; specialistRoleIds: string[]; gameOwnsLiveCount: true; notes: string };
export type PopulationLifeStageDefinition = { id: PopulationLifeStageId; displayName: string; workforceEligible: boolean; educationEligible: boolean; migrationEligible: boolean; participatesInGrowth: boolean; consumptionModifier: number; healthcareNeed: "low" | "medium" | "high" | "synthetic" | "temporary"; housingNeed: "standard" | "supported" | "synthetic_bay" | "temporary"; notes: string };
export type PopulationWorkforceRoleDefinition = { id: PopulationWorkforceRoleId; displayName: string; skillClass: "general" | "technical" | "scientific" | "logistics" | "civic" | "hazard" | "service"; educationTierIds: string[]; supportedBuildingFamilyIds: string[]; productivityProfileId: string; substitutionPolicyIds: PopulationAutomationPolicyId[]; shortageReasonCodeIds: PopulationShortageReasonCodeId[]; identityRelationshipIds: string[]; notes: string };
export type PopulationSpecialistRoleDefinition = { id: string; displayName: string; baseWorkforceRoleId: PopulationWorkforceRoleId; educationTierIds: string[]; requiredResearchIds: string[]; requiredBuildingFamilyIds: string[]; supportedActionIds: string[]; identityRelationshipIds: string[]; missingSourceDefinitionIds: string[]; notes: string };
export type PopulationDemographicStateSchema = { id: "population_demographic_state_schema"; gameOwned: true; fields: Array<{ id: string; displayName: string; valueType: "integer" | "number" | "map"; description: string }> };
export type PopulationGrowthDefinition = { id: string; displayName: string; deterministic: true; calculationVersion: string; inputs: string[]; formula: string; clamps: { minGrowthRate: number; maxGrowthRate: number }; outputs: string[]; notes: string };
export type PopulationCapacityDefinition = { id: string; displayName: string; capacityType: "surface_habitation" | "orbital_habitation" | "subsurface_habitation" | "floating_habitation" | "temporary_habitation" | "robotic_capacity" | "visitor_capacity"; sourceTypes: string[]; constraintIds: string[]; notes: string };
export type PopulationNeedDefinition = { id: string; displayName: string; criticality: "critical" | "high" | "medium" | "low"; affects: string[]; shortageReasonCodeId: PopulationShortageReasonCodeId | null; notes: string };
export type PopulationWellbeingBandDefinition = { id: PopulationWellbeingBandId; displayName: string; min: number; max: number; migrationEffect: string; growthEffect: string; productivityEffect: string; unrestHook: string; notes: string };
export type PopulationEducationDefinition = { id: string; displayName: string; tier: "basic" | "technical" | "advanced" | "specialist" | "elite" | "synthetic_training"; capacitySourceTypes: string[]; trainingDurationActionId: string; eligibleRoleIds: PopulationWorkforceRoleId[]; specialistConversionRoleIds: string[]; buildingDependencyIds: string[]; researchDependencyIds: string[]; identityModifierIds: string[]; notes: string };
export type PopulationMigrationDefinition = { id: PopulationMigrationTypeId; displayName: string; actionIds: string[]; logisticsRequired: true; transportCapacityRequired: true; distanceRule: string; travelTimeRule: string; destinationCapacityCheck: true; policyCheck: true; hazardCheck: true; notes: string };
export type WorkforceAssignmentDefinition = { id: WorkforceAssignmentModeId; displayName: string; targetScopes: Array<"colony" | "building" | "project" | "extraction" | "research" | "logistics" | "trade" | "terraforming" | "exploration">; actionIds: string[]; gameOwnsAssignments: true; notes: string };
export type AutomationSubstitutionPolicyDefinition = { id: PopulationAutomationPolicyId; displayName: string; allowedWorkerCategoryIds: string[]; maxCoveragePercent: number; requiresSupervisor: boolean; canBypassTechnology: false; canBypassSpecialists: false; canBypassCosts: false; canBypassPremiumPermissions: false; dangerousWorkEligible: boolean; notes: string };
export type PopulationColonyIntegrationDefinition = { id: string; colonyTypeId: string; minimumViablePopulation: number; targetFoundingPopulation: number; workforceRoleRequirements: Array<{ roleId: PopulationWorkforceRoleId; minimum: number; target: number }>; specialistRoleRequirements: string[]; initialCapacity: number; growthProfileId: string; automationSupportPolicyIds: PopulationAutomationPolicyId[]; notes: string };
export type PopulationBuildingIntegrationHook = { id: string; buildingFamilyId: string; populationCapacity: number | null; workforceDemandRoleIds: PopulationWorkforceRoleId[]; specialistDemandRoleIds: string[]; educationCapacity: number | null; healthcareCapacity: number | null; visitorCapacity: number | null; housingType: string | null; automationPolicyIds: PopulationAutomationPolicyId[]; productivityEffect: string; missingDefinition: boolean; notes: string };
export type PopulationIntegrationHook = { id: string; targetSystemId: string; referencedIds: string[]; notes: string };
export type PopulationPresentationContract = { id: "PopulationSummary" | "PopulationComposition" | "DemographicBreakdown" | "WorkforceBreakdown" | "WorkforceAssignmentPanel" | "PopulationCapacityGauge" | "NeedsAndWellbeingPanel" | "PopulationGrowthForecast" | "MigrationSummary" | "SpecialistRequirement" | "AutomationSubstitutionSummary" | "PopulationShortageAlert" | "ColonyPopulationReadiness"; displayName: string; rendererIndependent: true; semanticFields: string[]; notes: string };
export type PopulationMissingSourceDefinition = { id: string; type: "action" | "building" | "research" | "specialist_source" | "asset" | "encyclopedia_entry"; displayName: string; referencedBy: string[]; severity: "warning" | "info"; recommendedOwner: "Action System" | "Building Library" | "Research" | "Population Simulation" | "Asset Library" | "Encyclopedia"; notes: string };
export type PopulationSimulationFrameworkContract = {
  id: "population_simulation_framework_v1";
  version: "1.0.0";
  architectureDecisionId: "ARCH-DECISION-POPULATION-STRUCTURED-SIMULATION";
  actionSystemId: ActionSystemContract["id"];
  planetDevelopmentFrameworkId: PlanetDevelopmentFrameworkContract["id"];
  civilizationProgressionFrameworkId: CivilizationProgressionFrameworkContract["id"];
  colonizationFrameworkId: ColonizationFrameworkContract["id"];
  calculationVersion: string;
  ownership: { studioOwns: string[]; gameOwns: string[] };
  activePlayerStatePolicy: { exportsPlayerPopulationValues: false; exportsLiveColonyDemographics: false; exportsAssignments: false; exportsMigrationInstances: false; exportsTimestamps: false; exportsQueues: false; exportsSaveState: false };
  populationCategoryDefinitions: PopulationCategoryDefinition[];
  populationLifeStageDefinitions: PopulationLifeStageDefinition[];
  populationWorkforceRoleDefinitions: PopulationWorkforceRoleDefinition[];
  populationSpecialistRoleDefinitions: PopulationSpecialistRoleDefinition[];
  demographicStateSchema: PopulationDemographicStateSchema;
  populationGrowthDefinitions: PopulationGrowthDefinition[];
  populationCapacityDefinitions: PopulationCapacityDefinition[];
  populationNeedDefinitions: PopulationNeedDefinition[];
  populationWellbeingBands: PopulationWellbeingBandDefinition[];
  populationEducationDefinitions: PopulationEducationDefinition[];
  populationMigrationDefinitions: PopulationMigrationDefinition[];
  workforceAssignmentDefinitions: WorkforceAssignmentDefinition[];
  automationSubstitutionPolicies: AutomationSubstitutionPolicyDefinition[];
  populationShortageReasonCodes: Array<{ id: PopulationShortageReasonCodeId; displayName: string; blocker: boolean; severity: "warning" | "critical"; notes: string }>;
  colonyIntegration: PopulationColonyIntegrationDefinition[];
  buildingIntegrationHooks: PopulationBuildingIntegrationHook[];
  economyResourceHooks: PopulationIntegrationHook[];
  civilizationIdentityIntegration: PopulationIntegrationHook[];
  civilizationProgressionIntegration: PopulationIntegrationHook[];
  actionSystemIntegration: PopulationIntegrationHook[];
  populationPresentationContract: PopulationPresentationContract[];
  creativeProductionRequirements: Array<{ id: string; displayName: string; category: "Population"; status: "required" | "planned"; notes: string }>;
  assetLibraryCategories: Array<{ id: string; displayName: string; groups: string[]; notes: string }>;
  missingSourceDefinitions: PopulationMissingSourceDefinition[];
  validationRules: string[];
};

export type DynamicEventCategoryDefinition = { id: DynamicEventCategoryId; displayName: string; description: string; sourceSystemIds: string[]; presentationToken: string };
export type DynamicEventTypeDefinition = { id: DynamicEventTypeId; displayName: string; description: string; defaultSeverityId: DynamicEventSeverityId; positiveBias: "positive" | "neutral" | "negative" | "mixed"; presentationToken: string };
export type DynamicEventLifecycleStateDefinition = { id: DynamicEventLifecycleStateId; displayName: string; terminal: boolean; playerVisible: boolean; allowedTransitions: DynamicEventLifecycleStateId[]; presentationToken: string };
export type DynamicEventTriggerPolicyDefinition = { id: DynamicEventTriggerPolicyId; displayName: string; sourceSystemIds: string[]; canonicalReasonCode: string; protectedResolutionRequired: boolean; notes: string };
export type DynamicEventEligibilityDefinition = { id: string; displayName: string; dependsOn: string[]; blockerReasonCodes: string[]; cooldownPolicy: string; knowledgeSafe: boolean; notes: string };
export type DynamicEventProbabilityPolicyDefinition = { id: DynamicEventProbabilityPolicyId; displayName: string; deterministic: true; balanceStatus: "approved" | "provisional"; notes: string };
export type DynamicEventDeterministicSeedPolicy = { id: string; displayName: string; seedInputs: Array<"universeSeed" | "targetCanonicalId" | "civilizationId" | "eventDefinitionId" | "timeBucket" | "contentVersion" | "priorEventCount">; forbidsUncontrolledRandom: true; notes: string };
export type DynamicEventSeverityDefinition = { id: DynamicEventSeverityId; displayName: string; urgency: number; notificationPriority: number; allowedEffectMagnitude: string; acknowledgementPolicy: string; missionGenerationEligible: boolean; historicalSignificance: DynamicEventTimelineSignificanceId; presentationToken: string };
export type DynamicEventPhaseDefinition = { id: DynamicEventPhaseId; displayName: string; order: number; defaultDurationClassId: DynamicEventDurationClassId; notes: string };
export type DynamicEventEffectDefinition = { id: DynamicEventEffectTypeId; displayName: string; targetSystemIds: string[]; studioMutatesPlayerState: false; protectedResolutionRequired: boolean; notes: string };
export type DynamicEventChoiceDefinition = { id: DynamicEventChoiceId; displayName: string; actionIds: string[]; requirementReasonCodes: string[]; outcomeEffectTypeIds: DynamicEventEffectTypeId[]; irreversible: boolean; requiresPlayerConfirmation: boolean; timelinePolicyId: DynamicEventTimelineSignificanceId; notes: string };
export type DynamicEventResolutionPolicyDefinition = { id: DynamicEventResolutionPolicyId; displayName: string; protectedOutcome: boolean; gameOwnsResolvedOutcome: true; deterministicInputs: string[]; notes: string };
export type DynamicEventFailurePolicyDefinition = { id: string; displayName: string; reasonCodes: string[]; recoveryChoiceIds: DynamicEventChoiceId[]; missionHookIds: string[]; notes: string };
export type DynamicEventKnowledgeVisibilityRule = { id: string; knowledgeStateId: string; canShowName: boolean; canShowTargetRegistry: boolean; canShowResources: boolean; canShowArtifacts: boolean; canShowLifeforms: boolean; fallbackText: "???" | "Unknown" | "Signal Detected"; notes: string };
export type DynamicEventTimelineSignificancePolicy = { id: DynamicEventTimelineSignificanceId; displayName: string; createsTimelineDefinition: boolean; scope: string; notes: string };
export type DynamicEventDefinition = {
  id: string;
  displayName: string;
  publicDescription: string;
  hiddenDescriptionPolicy: string;
  categoryId: DynamicEventCategoryId;
  eventTypeId: DynamicEventTypeId;
  sourceSystemId: string;
  targetEntityTypes: string[];
  triggerPolicyIds: DynamicEventTriggerPolicyId[];
  eligibilityIds: string[];
  probabilityPolicyId: DynamicEventProbabilityPolicyId;
  deterministicSeedPolicyId: string;
  severityId: DynamicEventSeverityId;
  durationClassId: DynamicEventDurationClassId;
  phaseIds: DynamicEventPhaseId[];
  effectTypeIds: DynamicEventEffectTypeId[];
  choiceIds: DynamicEventChoiceId[];
  resolutionPolicyIds: DynamicEventResolutionPolicyId[];
  failurePolicyIds: string[];
  followUpEventIds: string[];
  missionHookTemplateIds: string[];
  actionReferenceIds: string[];
  identityInfluenceIds: string[];
  progressionMilestoneIds: string[];
  presentationProfileId: string;
  timelineSignificanceId: DynamicEventTimelineSignificanceId;
  publicationStatus: DynamicEventPublicationStatus;
  provisionalBalance: true;
};
export type DynamicEventChainDefinition = { id: string; displayName: string; eventIds: string[]; branchEventIds: string[]; terminalEventIds: string[]; deterministicChainRule: string; notes: string };
export type DynamicEventPresentationContract = { id: "EventCard" | "EventNotification" | "EventDetail" | "EventChoicePanel" | "EventSeverityBadge" | "EventPhaseStepper" | "EventTimer" | "EventEffectSummary" | "EventRequirementSummary" | "EventResolutionReport" | "EventChainProgress" | "EventHistoryEntry" | "EventMissionLink" | "EventTimelineSignificance" | "KnowledgeSafeEventPreview"; displayName: string; rendererIndependent: true; semanticFields: string[]; notes: string };
export type DynamicEventMissingCanonicalDefinition = { id: string; type: "action" | "population_framework" | "asset" | "encyclopedia_entry" | "progression_milestone"; displayName: string; referencedBy: string[]; severity: "warning" | "info"; recommendedOwner: "Action System" | "Population Simulation" | "Asset Library" | "Encyclopedia" | "Civilization Progression"; notes: string };
export type DynamicEventFrameworkContract = {
  id: "dynamic_event_framework_v1";
  version: "1.0.0";
  architectureDecisionId: "ARCH-DECISION-DYNAMIC-EVENT-FRAMEWORK";
  actionSystemId: ActionSystemContract["id"];
  planetDevelopmentFrameworkId: PlanetDevelopmentFrameworkContract["id"];
  civilizationProgressionFrameworkId: CivilizationProgressionFrameworkContract["id"];
  colonizationFrameworkId: ColonizationFrameworkContract["id"];
  resourceEconomyLogisticsFrameworkId: ResourceEconomyLogisticsFrameworkContract["id"];
  missionExpeditionFrameworkId: MissionExpeditionFrameworkContract["id"];
  universalDiscoveryRegistryVersion: string;
  populationSimulationIntegration: { implemented: boolean; hookOnly: boolean; populationSimulationFrameworkId?: PopulationSimulationFrameworkContract["id"]; dependencyGap?: "Population Simulation Framework"; hooks: string[] };
  ownership: { studioOwns: string[]; gameOwns: string[] };
  activePlayerStatePolicy: {
    exportsActiveEventInstances: false;
    exportsTimestamps: false;
    exportsCurrentModifiers: false;
    exportsSelectedChoices: false;
    exportsGeneratedPlayerParameters: false;
    exportsResolvedOutcomes: false;
    exportsPlayerEventHistory: false;
  };
  eventCategoryDefinitions: DynamicEventCategoryDefinition[];
  eventTypeDefinitions: DynamicEventTypeDefinition[];
  eventLifecycleStateDefinitions: DynamicEventLifecycleStateDefinition[];
  eventDefinitions: DynamicEventDefinition[];
  eventTriggerPolicies: DynamicEventTriggerPolicyDefinition[];
  eventEligibilityDefinitions: DynamicEventEligibilityDefinition[];
  eventProbabilityPolicies: DynamicEventProbabilityPolicyDefinition[];
  eventDeterministicSeedPolicies: DynamicEventDeterministicSeedPolicy[];
  eventSeverityDefinitions: DynamicEventSeverityDefinition[];
  eventDurationClasses: Array<{ id: DynamicEventDurationClassId; displayName: string; actionDurationReference: string | null; notes: string }>;
  eventPhaseDefinitions: DynamicEventPhaseDefinition[];
  eventEffectDefinitions: DynamicEventEffectDefinition[];
  eventChoiceDefinitions: DynamicEventChoiceDefinition[];
  eventResolutionPolicies: DynamicEventResolutionPolicyDefinition[];
  eventFailurePolicies: DynamicEventFailurePolicyDefinition[];
  eventChainDefinitions: DynamicEventChainDefinition[];
  eventReasonCodes: Array<{ id: string; displayName: string; sourceSystemId: string; blocker: boolean; notes: string }>;
  eventKnowledgeVisibility: DynamicEventKnowledgeVisibilityRule[];
  eventTimelineSignificancePolicies: DynamicEventTimelineSignificancePolicy[];
  eventPresentationContract: DynamicEventPresentationContract[];
  offlinePolicies: Array<{ id: string; displayName: string; behavior: "progress" | "pause" | "resolve_server_authoritative" | "defer_choice" | "expire" | "require_reconnect"; notes: string }>;
  aiAgentRules: string[];
  creativeProductionRequirements: Array<{ id: string; displayName: string; category: "Dynamic Events"; status: "required" | "planned"; notes: string }>;
  assetLibraryCategories: Array<{ id: string; displayName: string; groups: string[]; notes: string }>;
  encyclopediaSections: Array<{ id: string; displayName: string; status: "active" | "planned"; notes: string }>;
  provisionalBalanceValues: Array<{ id: string; displayName: string; value: string; notes: string }>;
  missingCanonicalDefinitions: DynamicEventMissingCanonicalDefinition[];
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
  laborGenerationFrameworkId: LaborGenerationFramework["id"];
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
  laborGenerationFramework: LaborGenerationFramework;
  aiLibrary: CanonicalAiLibraryAgent[];
  aiCategories: AiLibraryCategoryDefinition[];
  aiRarity: AiLibraryRarityDefinition[];
  aiPersonalityCatalog: string[];
  aiVoiceCatalog: string[];
  aiAssignmentRoles: string[];
  aiAgents: AiAgentDefinition[];
  aiAgentVariants: AiAgentVariantDefinition[];
  aiAgentPersonalities: AiAgentPersonalityDefinition[];
  aiAgentAnimationProfiles: AiAgentAnimationProfileDefinition[];
  automationPresentation: AutomationPresentationDefinition;
  defaultAiAgentId: string;
  aiAgentSaveSchema: AiAgentSaveSchemaDefinition;
  discoveryCategories: DiscoveryCategoryDefinition[];
  discoveryPurposeCategories: DiscoveryPurposeCategoryDefinition[];
  discoveryRarities: DiscoveryRarityDefinition[];
  discoveries: DiscoveryDefinition[];
  discoveryCollections: DiscoveryCollectionDefinition[];
  discoveryChains: DiscoveryChainDefinition[];
  discoveryMilestones: Array<Record<string, unknown>>;
  discoveryPlayerCollectionSchema: Record<string, unknown>;
  universalDiscoveryRegistry: Record<string, unknown>;
  resources: ResourceDefinition[];
  resourceTaxonomy: { version: string; profileGenerationVersion: string; primaryCategories: readonly string[]; validationStatus: string };
  resourceMigrations: Array<Record<string, unknown>>;
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
  planetDevelopmentFramework: PlanetDevelopmentFrameworkContract;
  civilizationProgressionFramework: CivilizationProgressionFrameworkContract;
  colonizationFramework: ColonizationFrameworkContract;
  populationSimulationFramework: PopulationSimulationFrameworkContract;
  resourceEconomyLogisticsFramework: ResourceEconomyLogisticsFrameworkContract;
  missionExpeditionFramework: MissionExpeditionFrameworkContract;
  dynamicEventFramework: DynamicEventFrameworkContract;
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
