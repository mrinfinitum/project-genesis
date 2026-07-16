import { ARCHITECTURE_VERSION } from "@/lib/architecture/version";

type EraNavigationHints = {
  dashboardMode?: string;
  visibleEraCount?: number;
  fullTimelineEnabled?: boolean;
  allowPrimaryHorizontalScroll?: boolean;
  boundaryBehavior?: {
    firstEraMode?: string;
    middleEraMode?: string;
    lastEraMode?: string;
  };
};

type RuntimeClientProfile = {
  eraNavigation?: EraNavigationHints;
  primaryHudResources?: string[];
  primaryHudSlots?: Array<{ economyId: string; order: number; showRate: boolean; compactLabel: string; premium: boolean }>;
};

type RuntimePayload = {
  metadata?: { schemaVersion?: string; architectureVersion?: string; universalDiscoveryRegistryVersion?: string; galaxyEngineContractVersion?: string; contentVersion?: number; checksum?: string; accessLevel?: string; validationStatus?: string; saveMigrationHints?: Array<{ id: string; targetId: string; previousDefault: unknown; currentDefault: unknown }> };
  eras?: Array<{ id: string; index?: number; name?: string; displayName?: string; shortDisplayName?: string }>;
  economyDefinitions?: Array<{ id: string; iconKey?: string; startingAmount?: number; startingRate?: number; premium?: boolean; spendable?: boolean; manualClickTarget?: boolean; playerFacingHelpText?: string }>;
  eraEconomyProfiles?: Array<{ id: string; eraId: string; eraIndex: number; primaryEconomyId: string; activePrimaryEconomyId: string; manualClickTarget?: string | null; primaryEconomyIds: string[]; secondaryEconomyIds: string[]; fixedHudSlots: string[]; visibleHudEconomyIds: string[]; hudSlots: Array<{ economyId: string; order: number }>; displayOverrides?: Record<string, { displayName?: string }>; visibilityRules?: { useEraHud?: boolean; fixedCoreHud?: boolean; creditsVisible?: boolean } }>;
  economyBehaviorContracts?: Array<{ economyId: string; behaviorType?: string; startingAmount?: number; basePassiveRate?: number; manualProduction?: { enabled?: boolean; target?: boolean; baseAmount?: number }; automatedProduction?: { enabled?: boolean; aiAgentTarget?: boolean }; buildingProduction?: { enabled?: boolean; producerDefinitionIds?: string[] }; purchaseProduction?: { enabled?: boolean; serverAuthoritative?: boolean; serverAuthoritativeRequired?: boolean }; spendable?: boolean; capacityResource?: boolean; premiumResource?: boolean; canGoNegative?: boolean; capPolicy?: { type?: string; notes?: string }; offlineProgressEligible?: boolean; validationRules?: string[] }>;
  resourceProducerDefinitions?: Array<{ id: string; economyId: string; sourceType?: string; productionMode?: string; baseRate?: number; baseAmount?: number; scope?: string; buildingEffectId?: string }>;
  buildingResourceEffects?: Array<{ id: string; buildingId: string; economyId: string; effectType?: string; amount?: number; ratePerSecond?: number; scope?: string }>;
  economyScopeRules?: Array<{ id: string; economyId?: string; appliesToEconomyIds?: string[]; scope?: string }>;
  economyTransactionReasons?: Array<{ id: string; economyId: string; operation?: string; sourceTypes?: string[]; allowNegativeDelta?: boolean; serverAuthoritativeRequired?: boolean }>;
  economyRateBreakdownDefinitions?: Array<{ id: string; economyId: string; producerDefinitionIds?: string[] }>;
  offlineProgressionPolicies?: Array<{ economyId: string; eligible?: boolean; producerDefinitionIds?: string[] }>;
  economyCalculationRules?: { rounding?: { integerEconomyIds?: string[] }; multiplierOrder?: string[] };
  economyUsageRelationships?: { unresolved?: Array<unknown> };
  inventoryResourceMetadata?: Array<{ resourceId: string; classification?: string }>;
  resources?: Array<{ id: string }>;
  discoveryCategories?: Array<{ id: string; subcategories?: Array<{ id: string }> }>;
  discoveryRarities?: Array<{ id: string }>;
  discoveries?: Array<{ id: string; categoryId: string; subcategoryId: string; rarity: string; spawnWeight: number }>;
  discoveryCollections?: Array<{ id: string; discoveryIds: string[] }>;
  discoveryChains?: Array<{ id: string; nodes: Array<{ discoveryId: string }> }>;
  discoveryPlayerCollectionSchema?: { studioOwnership?: string };
  universalDiscoveryRegistry?: { version?: string; entityTypes?: Array<{ id: string }>; milestones?: Array<{ id: string }>; liveDataPolicy?: string };
  galaxyEngineContract?: {
    version?: string;
    semanticZoom?: Array<{ id: string }>;
    technologyGates?: Array<{ id: string; unlockedZoom?: string[]; maximumViewDistance?: number; maximumProbeDistance?: number; maximumTravelDistance?: number }>;
    knowledgeVisibility?: Array<{ id: string; unknownDisplayName?: string; canShowName?: boolean; canShowRegistry?: boolean; canShowResources?: boolean; canShowBodyCount?: boolean; canShowDiscoveries?: boolean }>;
    presentationClasses?: Array<{ id: string; assetRoleIds?: string[] }>;
    platformRenderingProfiles?: Array<{ id: string; recommendationOnly?: boolean }>;
    assetRoles?: Array<{ id: string; fallbackRuleId?: string }>;
    proceduralFallbackRules?: Array<{ id: string; appliesToClassIds?: string[] }>;
  };
  timeActionContract?: {
    id?: string;
    version?: string;
    stateMachine?: string[];
    progressModel?: {
      supportsProgressPercent?: boolean;
      supportsRemainingTime?: boolean;
      supportsEstimatedCompletion?: boolean;
      supportsAccelerationSources?: boolean;
      supportsCrystalAcceleration?: boolean;
      completionEventRequired?: boolean;
    };
    accelerationPolicy?: {
      premiumCrystals?: {
        allowed?: boolean;
        policy?: string;
        canUnlockUnavailableActions?: boolean;
        allowedUses?: string[];
      };
      researchModifierIds?: string[];
      aiAgentModifierIds?: string[];
      buildingModifierIds?: string[];
      automationModifierIds?: string[];
      civilizationModifierIds?: string[];
    };
    futureSystemScopes?: string[];
  };
  actionSystem?: {
    id?: string;
    version?: string;
    timeActionContractId?: string;
    actionCategories?: Array<{ id: string }>;
    actionStates?: Array<{ id: string; terminal?: boolean; historyEvent?: boolean; allowedTransitions?: string[]; resumable?: boolean; presentationToken?: string }>;
    actionDefinitions?: Array<{
      id: string;
      displayName?: string;
      category?: string;
      requirements?: Array<{ reasonCode?: string }>;
      outputs?: unknown[];
      duration?: { timeActionContractId?: string; durationDefinitionId?: string; baseDurationSeconds?: number; minimumDurationSeconds?: number; maximumDurationSeconds?: number; phaseTemplateIds?: string[] };
      modifiers?: { premiumCrystalAcceleration?: { policy?: string; canUnlockUnavailableActions?: boolean } };
      automation?: { automationRules?: string[]; premiumSpendPermission?: string; automationPolicyId?: string };
      queueBehavior?: { queueRuleId?: string };
      concurrency?: { concurrencyPolicyId?: string };
      phases?: string[];
      history?: { started?: boolean; completed?: boolean; cancelled?: boolean; failed?: boolean; accelerated?: boolean; automated?: boolean };
      events?: string[];
      publicationStatus?: string;
    }>;
    actionQueueRules?: Array<{ id: string }>;
    actionDurationDefinitions?: Array<{ id: string }>;
    actionPhaseTemplates?: Array<{ id: string }>;
    actionAccelerationPolicies?: Array<{ id: string; serverAuthoritativeBalance?: boolean; serverCalculatedCost?: boolean; idempotencyRequired?: boolean; minimumDurationClamp?: boolean; canBypassRequirements?: boolean }>;
    actionAutomationPolicies?: Array<{ id: string; premiumSpendPermission?: string }>;
    actionEventDefinitions?: Array<{ id: string }>;
    actionPresentationContracts?: Array<{ id: string; rendererIndependent?: boolean }>;
    accelerationRules?: string[];
    automationRules?: string[];
    actionPresentation?: unknown[];
  };
  planetOpportunityProfiles?: Array<{
    id: string;
    planetClass?: string;
    suitability?: Record<string, number>;
    eligibility?: Record<string, boolean>;
    hazardProfile?: Record<string, number>;
    recommendedUses?: { primaryUse?: string; secondaryUse?: string; optionalUse?: string };
    recommendedActions?: string[];
  }>;
  planetExplorationProgression?: {
    id?: string;
    version?: string;
    timeActionContractId?: string;
    pipeline?: Array<{ id: string; order?: number; requiredActionIds?: string[] }>;
    visibilityRules?: Array<{
      stageId: string;
      canShowCivilizationSuitabilityIndex?: boolean;
      canShowStrategicValueIndex?: boolean;
      canShowNickname?: boolean;
      canShowRecommendedUses?: boolean;
      canShowAvailableActions?: boolean;
      hiddenDisplayName?: string;
    }>;
    timedActions?: Array<{
      id: string;
      timeActionContractId?: string;
      fromStageId?: string;
      toStageId?: string;
      baseDurationSeconds?: number;
      minimumDurationSeconds?: number;
      maximumDurationSeconds?: number;
      requiresSurveyComplete?: boolean;
      researchModifierIds?: string[];
      aiAgentModifierIds?: string[];
      premiumCrystalAcceleration?: { enabled?: boolean; unlocksUnavailableActions?: boolean; policy?: string };
    }>;
    nicknameRules?: Array<{ id: string; revealStageId?: string }>;
  };
  planetDevelopmentFramework?: {
    id?: string;
    actionSystemId?: string;
    calculationVersion?: string;
    knowledgeLifecycle?: Array<{ id: string; allowedTransitions?: string[]; terminal?: boolean }>;
    visibilityMatrix?: Array<{ stateId: string; canShowCsi?: boolean; canShowSvi?: boolean; canShowNickname?: boolean; canShowRecommendations?: boolean; canShowValidDevelopmentActions?: boolean }>;
    csiBands?: Array<{ id: string; min: number; max: number }>;
    sviBands?: Array<{ id: string; min: number; max: number }>;
    opportunityArchetypes?: Array<{ id: string; recommendedActionIds?: string[] }>;
    actionReferences?: Array<{ actionId: string; requiredSurveyComplete?: boolean }>;
    developmentProfiles?: Array<{
      id: string;
      sourceOpportunityProfileId?: string;
      csi?: { value?: number; bandId?: string };
      svi?: { value?: number; bandId?: string };
      capabilities?: { surfaceColonization?: string };
      validActionIds?: string[];
      blockedActionReasons?: Array<{ actionId?: string; reasonCode?: string }>;
    }>;
    assetRequirements?: unknown[];
  };
  upgradeCategories?: Array<{ id: string }>;
  upgrades?: Array<{ id: string; categoryId?: string; tabId?: string; eraId?: string; costResourceId?: string | null; costEconomyId?: string | null }>;
  aiAgents?: Array<{ id: string; defaultForNewPlayers?: boolean; baseVariantId?: string; availableVariantIds?: string[]; assetKeys?: Record<string, string>; gameplayModifiers?: Record<string, unknown> }>;
  aiAgentVariants?: Array<{ id: string; agentId?: string; assetKeys?: Record<string, string>; progressionMapping?: { cosmeticIdentity?: boolean; automationPowerSource?: string } }>;
  aiAgentPersonalities?: Array<{ id: string }>;
  aiAgentAnimationProfiles?: Array<{ id: string; visibleOnlyBehavior?: string; allowedStates?: string[] }>;
  automationPresentation?: { displayName?: string; powerLabel?: string; systemId?: string };
  defaultAiAgentId?: string;
  aiAgentSaveSchema?: { selectedAiAgentIdDefault?: string; selectedAiAgentVariantIdDefault?: string; fields?: { selectedAiAgentId?: { default?: string }; selectedAiAgentVariantId?: { default?: string }; unlockedAiAgentIds?: { default?: string[] }; unlockedAiAgentVariantIds?: { default?: string[] } } };
  clientProfiles?: {
    default?: RuntimeClientProfile;
    roblox?: RuntimeClientProfile;
    web?: RuntimeClientProfile;
    unity?: RuntimeClientProfile;
    unreal?: RuntimeClientProfile;
    godot?: RuntimeClientProfile;
  };
  balance?: { startingPopulation?: number; startingCoins?: number };
};

export {};

type RobloxPayload = RuntimePayload & {
  upgradeTabs?: Array<{ tabId: string }>;
  clientHints?: RuntimeClientProfile;
};

const baseUrl = process.env.PROJECT_GENESIS_STUDIO_URL ?? "http://127.0.0.1:3000";
const token = process.env.PROJECT_GENESIS_EXPORT_TOKEN;

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNoArchitectureLeak(label: string, payload: unknown) {
  const text = JSON.stringify(payload);
  assert(!/"sections"\s*:/.test(text), `${label} leaked Architecture sections.`);
  assert(!/"decisions"\s*:/.test(text), `${label} leaked Architecture decisions.`);
  assert(!/"decisionLog"\s*:/.test(text), `${label} leaked Architecture decision log.`);
  assert(!/"outstandingDecisions"\s*:/.test(text), `${label} leaked outstanding Architecture decisions.`);
  assert(!/\/Users\/|studio-private:\/\/|SERVICE_ROLE|PRIVATE_KEY|clientSecret|apiKey|databaseUrl/i.test(text), `${label} leaked a private path or secret marker.`);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<{ status: number; payload: T; headers: Headers }> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {})
    }
  });
  const text = await response.text();
  let payload = {} as T;
  try {
    payload = (text ? JSON.parse(text) : {}) as T;
  } catch {
    payload = { body: text } as T;
  }
  return { status: response.status, payload, headers: response.headers };
}

function authHeaders(): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {};
}

function validateRuntimeReferences(payload: RuntimePayload) {
  const eraIds = new Set((payload.eras ?? []).map((era) => era.id));
  const resourceIds = new Set((payload.resources ?? []).map((resource) => resource.id));
  const economyIds = new Set((payload.economyDefinitions ?? []).map((definition) => definition.id));
  const categoryIds = new Set((payload.upgradeCategories ?? []).map((category) => category.id));

  for (const upgrade of payload.upgrades ?? []) {
    if (upgrade.categoryId) assert(categoryIds.has(upgrade.categoryId), `Upgrade ${upgrade.id} has unresolved categoryId ${upgrade.categoryId}.`);
    if (upgrade.eraId) assert(eraIds.has(upgrade.eraId), `Upgrade ${upgrade.id} has unresolved eraId ${upgrade.eraId}.`);
    if (upgrade.costResourceId) assert(resourceIds.has(upgrade.costResourceId), `Upgrade ${upgrade.id} has unresolved costResourceId ${upgrade.costResourceId}.`);
    if (upgrade.costEconomyId) assert(economyIds.has(upgrade.costEconomyId), `Upgrade ${upgrade.id} has unresolved costEconomyId ${upgrade.costEconomyId}.`);
  }
}

function validateAiAgentRuntime(payload: RuntimePayload | RobloxPayload, label: string) {
  const agents = payload.aiAgents ?? [];
  const variants = payload.aiAgentVariants ?? [];
  const agentIds = new Set(agents.map((agent) => agent.id));
  const variantIds = new Set(variants.map((variant) => variant.id));
  const defaultAgentId = "AI-AGENT-DEFAULT";
  const defaultVariantId = "AI-VARIANT-DEFAULT-T1";

  assert(agents.length >= 1, `${label} must publish aiAgents.`);
  assert(variants.length >= 1, `${label} must publish aiAgentVariants.`);
  assert(payload.defaultAiAgentId === defaultAgentId, `${label} defaultAiAgentId must be ${defaultAgentId}.`);
  assert(agentIds.has(defaultAgentId), `${label} default AI Agent is missing.`);
  assert(variantIds.has(defaultVariantId), `${label} default AI Agent variant is missing.`);
  assert((payload.aiAgentPersonalities?.length ?? 0) >= 8, `${label} must publish AI Agent personalities.`);
  assert((payload.aiAgentAnimationProfiles?.length ?? 0) >= 1, `${label} must publish AI Agent animation profiles.`);
  assert(payload.automationPresentation?.systemId === "automation", `${label} automationPresentation must remain linked to automation.`);
  assert(payload.automationPresentation?.powerLabel === "Labor Assistance", `${label} automationPresentation must expose Labor Assistance.`);
  assert(payload.aiAgentSaveSchema?.selectedAiAgentIdDefault === defaultAgentId, `${label} selectedAiAgentId default is invalid.`);
  assert(payload.aiAgentSaveSchema?.selectedAiAgentVariantIdDefault === defaultVariantId, `${label} selectedAiAgentVariantId default is invalid.`);
  assert(payload.aiAgentSaveSchema?.fields?.unlockedAiAgentIds?.default?.includes(defaultAgentId), `${label} new-player unlockedAiAgentIds must include default agent.`);
  assert(payload.aiAgentSaveSchema?.fields?.unlockedAiAgentVariantIds?.default?.includes(defaultVariantId), `${label} new-player unlockedAiAgentVariantIds must include default variant.`);

  const defaultAgent = agents.find((agent) => agent.id === defaultAgentId);
  const defaultVariant = variants.find((variant) => variant.id === defaultVariantId);
  assert(defaultAgent?.defaultForNewPlayers === true, `${label} default AI Agent must be defaultForNewPlayers.`);
  assert(defaultAgent?.baseVariantId === defaultVariantId, `${label} default AI Agent baseVariantId must resolve to default variant.`);
  assert(defaultAgent?.availableVariantIds?.includes(defaultVariantId), `${label} default AI Agent availableVariantIds must include default variant.`);
  assert(defaultAgent?.assetKeys?.open === "auto_robot_icon", `${label} default AI Agent open asset must use imported robot art.`);
  assert(defaultAgent?.assetKeys?.blink === "auto_robot_blink_icon", `${label} default AI Agent blink asset must use imported robot art.`);
  assert(defaultVariant?.agentId === defaultAgentId, `${label} default AI Agent variant must resolve to default agent.`);
  assert(defaultVariant?.assetKeys?.head === "auto_robot_circle", `${label} default AI Agent variant head asset must use imported robot art.`);
  assert(defaultVariant?.assetKeys?.open === "auto_robot_icon", `${label} default AI Agent variant open asset must use imported robot art.`);
  assert(defaultVariant?.assetKeys?.blink === "auto_robot_blink_icon", `${label} default AI Agent variant blink asset must use imported robot art.`);
  assert(defaultVariant?.progressionMapping?.cosmeticIdentity === true, `${label} AI Agent variants must be cosmetic.`);
  assert(defaultVariant?.progressionMapping?.automationPowerSource === "automation_upgrade_levels", `${label} AI Agent variants must not own automation power.`);

  for (const agent of agents) {
    assert(!agent.gameplayModifiers || Object.keys(agent.gameplayModifiers).length === 0, `${label} ${agent.id} must not define gameplay modifiers.`);
    assert(agent.baseVariantId && variantIds.has(agent.baseVariantId), `${label} ${agent.id} has unresolved baseVariantId ${agent.baseVariantId ?? "(missing)"}.`);
    for (const variantId of agent.availableVariantIds ?? []) {
      assert(variantIds.has(variantId), `${label} ${agent.id} has unresolved availableVariantId ${variantId}.`);
    }
  }
  for (const variant of variants) {
    assert(variant.agentId && agentIds.has(variant.agentId), `${label} ${variant.id} has unresolved agentId ${variant.agentId ?? "(missing)"}.`);
  }
}

function validateDiscoveryRuntime(payload: RuntimePayload | RobloxPayload, label: string) {
  const categories = payload.discoveryCategories ?? [];
  const rarities = payload.discoveryRarities ?? [];
  const discoveries = payload.discoveries ?? [];
  const categoryIds = new Set(categories.map((category) => category.id));
  const rarityIds = new Set(rarities.map((rarity) => rarity.id));
  const discoveryIds = new Set(discoveries.map((discovery) => discovery.id));

  assert(categories.length >= 8, `${label} must publish discoveryCategories.`);
  assert(rarities.length === 7, `${label} must publish the seven canonical discovery rarity tiers.`);
  assert(discoveries.length >= 10, `${label} must publish canonical discoveries.`);
  assert(payload.universalDiscoveryRegistry?.version === "1.0.0", `${label} must publish universalDiscoveryRegistry version 1.0.0.`);
  assert((payload.universalDiscoveryRegistry?.entityTypes?.length ?? 0) >= 14, `${label} must publish universal registry eligible entity types.`);
  assert((payload.universalDiscoveryRegistry?.milestones?.length ?? 0) === 10, `${label} must publish universal registry milestone definitions.`);
  assert(payload.universalDiscoveryRegistry?.liveDataPolicy?.includes("Live registry records"), `${label} must state live registry records come from Game APIs.`);
  assert((payload.discoveryCollections?.length ?? 0) >= 6, `${label} must publish discoveryCollections.`);
  assert((payload.discoveryChains?.length ?? 0) >= 2, `${label} must publish discoveryChains.`);
  assert(payload.discoveryPlayerCollectionSchema?.studioOwnership === "canonical_definitions_only", `${label} must mark player discovery collection state as game-owned.`);
  for (const discovery of discoveries) {
    const category = categories.find((item) => item.id === discovery.categoryId);
    assert(categoryIds.has(discovery.categoryId), `${label} discovery ${discovery.id} has unresolved categoryId ${discovery.categoryId}.`);
    assert(category?.subcategories?.some((subcategory) => subcategory.id === discovery.subcategoryId), `${label} discovery ${discovery.id} has unresolved subcategoryId ${discovery.subcategoryId}.`);
    assert(rarityIds.has(discovery.rarity), `${label} discovery ${discovery.id} has unresolved rarity ${discovery.rarity}.`);
    assert(discovery.spawnWeight > 0, `${label} discovery ${discovery.id} must have positive spawnWeight.`);
  }
  for (const collection of payload.discoveryCollections ?? []) {
    for (const discoveryId of collection.discoveryIds) {
      assert(discoveryIds.has(discoveryId), `${label} discovery collection ${collection.id} references missing discovery ${discoveryId}.`);
    }
  }
  for (const chain of payload.discoveryChains ?? []) {
    for (const node of chain.nodes) {
      assert(discoveryIds.has(node.discoveryId), `${label} discovery chain ${chain.id} references missing discovery ${node.discoveryId}.`);
    }
  }
}

function validateGalaxyEngineContract(payload: RuntimePayload | RobloxPayload, label: string) {
  const contract = payload.galaxyEngineContract;
  assert(contract, `${label} must publish galaxyEngineContract.`);
  assert(contract?.version === "1.0.0", `${label} galaxyEngineContract version must be 1.0.0.`);

  const zoomIds = new Set(contract?.semanticZoom?.map((item) => item.id) ?? []);
  const gateIds = new Set(contract?.technologyGates?.map((item) => item.id) ?? []);
  const knowledgeIds = new Set(contract?.knowledgeVisibility?.map((item) => item.id) ?? []);
  const classIds = new Set(contract?.presentationClasses?.map((item) => item.id) ?? []);
  const roleIds = new Set(contract?.assetRoles?.map((item) => item.id) ?? []);
  const fallbackIds = new Set(contract?.proceduralFallbackRules?.map((item) => item.id) ?? []);

  for (const id of ["galaxy", "sector", "star_system"]) {
    assert(zoomIds.has(id), `${label} galaxyEngineContract is missing semantic zoom ${id}.`);
  }
  assert(!zoomIds.has("region") && !zoomIds.has("cluster"), `${label} galaxyEngineContract must not add Region or Cluster zoom layers.`);
  for (const id of ["survival", "planetary", "interplanetary", "interstellar", "galactic", "intergalactic"]) {
    assert(gateIds.has(id), `${label} galaxyEngineContract is missing technology gate ${id}.`);
  }
  for (const id of ["unknown", "detected", "probed", "scanned", "charted", "explored", "colonized", "mastered"]) {
    assert(knowledgeIds.has(id), `${label} galaxyEngineContract is missing knowledge state ${id}.`);
  }
  const unknown = contract?.knowledgeVisibility?.find((item) => item.id === "unknown");
  assert(unknown?.unknownDisplayName === "???", `${label} unknown objects must display ???.`);
  assert(unknown?.canShowName === false && unknown?.canShowRegistry === false && unknown?.canShowResources === false && unknown?.canShowBodyCount === false && unknown?.canShowDiscoveries === false, `${label} unknown objects must hide all knowledge fields.`);
  for (const id of ["galaxy", "sector", "star", "planet", "moon", "asteroid_belt"]) {
    assert(classIds.has(id), `${label} galaxyEngineContract is missing presentation class ${id}.`);
  }
  for (const id of ["desktop_ultra", "desktop_high", "desktop_medium", "steam", "iphone", "ipad", "android_phone", "android_tablet", "reduced"]) {
    assert(contract?.platformRenderingProfiles?.some((profile) => profile.id === id && profile.recommendationOnly === true), `${label} platform rendering profile ${id} must exist and remain recommendation-only.`);
  }
  for (const id of ["galaxy", "sector", "star", "planet", "moon", "navigation", "probe", "travel", "unknown", "selection"]) {
    assert(roleIds.has(id), `${label} galaxyEngineContract is missing asset role ${id}.`);
  }
  for (const gate of contract?.technologyGates ?? []) {
    for (const zoom of gate.unlockedZoom ?? []) {
      assert(zoomIds.has(zoom), `${label} technology gate ${gate.id} references missing zoom ${zoom}.`);
    }
    assert((gate.maximumViewDistance ?? 0) >= (gate.maximumProbeDistance ?? 0) && (gate.maximumProbeDistance ?? 0) >= (gate.maximumTravelDistance ?? 0), `${label} technology gate ${gate.id} distances must be view >= probe >= travel.`);
  }
  for (const presentationClass of contract?.presentationClasses ?? []) {
    for (const roleId of presentationClass.assetRoleIds ?? []) {
      assert(roleIds.has(roleId), `${label} presentation class ${presentationClass.id} references missing asset role ${roleId}.`);
    }
  }
  for (const role of contract?.assetRoles ?? []) {
    assert(role.fallbackRuleId && fallbackIds.has(role.fallbackRuleId), `${label} asset role ${role.id} references missing fallback rule ${role.fallbackRuleId ?? "(missing)"}.`);
  }
  for (const fallback of contract?.proceduralFallbackRules ?? []) {
    for (const classId of fallback.appliesToClassIds ?? []) {
      assert(classIds.has(classId), `${label} fallback rule ${fallback.id} references missing presentation class ${classId}.`);
    }
  }
  const forbiddenConfigKeys = /"(?:threeJsConfig|reactThreeFiberConfig|cameraConfig|shaderConfig|lightingRig|controlScheme|rendererSettings)"\s*:/i;
  assert(!forbiddenConfigKeys.test(JSON.stringify(contract)), `${label} galaxyEngineContract leaked renderer implementation config.`);
}

function validatePlanetOpportunityProfiles(payload: RuntimePayload | RobloxPayload, label: string) {
  const profiles = payload.planetOpportunityProfiles ?? [];
  const ids = new Set(profiles.map((profile) => profile.id));
  const expectedIds = [
    "planet_opportunity_earth_like",
    "planet_opportunity_ocean",
    "planet_opportunity_forest",
    "planet_opportunity_desert",
    "planet_opportunity_frozen",
    "planet_opportunity_volcanic",
    "planet_opportunity_rocky",
    "planet_opportunity_gas_giant",
    "planet_opportunity_ice_giant",
    "planet_opportunity_artificial",
    "planet_opportunity_exotic",
    "planet_opportunity_barren",
    "planet_opportunity_dead",
    "planet_opportunity_crystal",
    "planet_opportunity_toxic",
    "planet_opportunity_radioactive",
    "planet_opportunity_inferno",
    "planet_opportunity_ocean_moon",
    "planet_opportunity_frozen_moon",
    "planet_opportunity_asteroid_belt"
  ];

  assert(profiles.length === expectedIds.length, `${label} must publish exactly ${expectedIds.length} Planet Opportunity Profiles; received ${profiles.length}.`);
  for (const id of expectedIds) {
    assert(ids.has(id), `${label} is missing Planet Opportunity Profile ${id}.`);
  }
  for (const profile of profiles) {
    for (const [key, value] of Object.entries(profile.suitability ?? {})) {
      assert(Number.isFinite(value) && value >= 0 && value <= 100, `${label} ${profile.id} suitability ${key} must be normalized 0-100.`);
    }
    for (const [key, value] of Object.entries(profile.hazardProfile ?? {})) {
      assert(Number.isFinite(value) && value >= 0 && value <= 100, `${label} ${profile.id} hazard ${key} must be normalized 0-100.`);
    }
    assert(Boolean(profile.recommendedUses?.primaryUse), `${label} ${profile.id} must publish primaryUse.`);
    assert(Boolean(profile.recommendedUses?.secondaryUse), `${label} ${profile.id} must publish secondaryUse.`);
    assert(Boolean(profile.recommendedUses?.optionalUse), `${label} ${profile.id} must publish optionalUse.`);
    assert((profile.recommendedActions?.length ?? 0) > 0, `${label} ${profile.id} must publish recommended player actions.`);
  }

  const gasGiant = profiles.find((profile) => profile.id === "planet_opportunity_gas_giant");
  assert(gasGiant?.eligibility?.supportsColonization === false, `${label} Gas Giant must not support colonization.`);
  assert(gasGiant?.suitability?.mining === 98, `${label} Gas Giant mining suitability must remain 98.`);
  assert(gasGiant?.suitability?.harvesting === 100, `${label} Gas Giant harvesting suitability must remain 100.`);
  const earthLike = profiles.find((profile) => profile.id === "planet_opportunity_earth_like");
  assert(earthLike?.eligibility?.supportsColonization === true, `${label} Earth-like must support colonization.`);
  assert(earthLike?.suitability?.colonization === 95, `${label} Earth-like colonization suitability must remain 95.`);
}

function validatePlanetExplorationProgression(payload: RuntimePayload | RobloxPayload, label: string) {
  const timeContract = payload.timeActionContract;
  const progression = payload.planetExplorationProgression;
  const expectedPipeline = ["unknown", "detected", "probed", "surveyed", "evaluated", "selected_for_development", "active_project", "complete"];

  assert(timeContract?.id === "time_action_contract_v1", `${label} must publish time_action_contract_v1.`);
  assert(timeContract?.version === "1.0.0", `${label} Time Action Contract version must be 1.0.0.`);
  for (const state of ["idle", "queued", "preparing", "in_progress", "paused", "complete", "failed", "cancelled"]) {
    assert(timeContract?.stateMachine?.includes(state), `${label} Time Action Contract is missing state ${state}.`);
  }
  assert(timeContract?.progressModel?.supportsProgressPercent === true, `${label} Time Action Contract must support progress percent.`);
  assert(timeContract?.progressModel?.supportsRemainingTime === true, `${label} Time Action Contract must support remaining time.`);
  assert(timeContract?.progressModel?.supportsEstimatedCompletion === true, `${label} Time Action Contract must support estimated completion.`);
  assert(timeContract?.progressModel?.supportsAccelerationSources === true, `${label} Time Action Contract must support acceleration sources.`);
  assert(timeContract?.progressModel?.supportsCrystalAcceleration === true, `${label} Time Action Contract must support crystal acceleration.`);
  assert(timeContract?.progressModel?.completionEventRequired === true, `${label} Time Action Contract must require completion events.`);
  assert(timeContract?.accelerationPolicy?.premiumCrystals?.allowed === true, `${label} Premium Crystal acceleration must be explicitly allowed.`);
  assert(timeContract?.accelerationPolicy?.premiumCrystals?.policy === "accelerate_only", `${label} Premium Crystals must accelerate only.`);
  assert(timeContract?.accelerationPolicy?.premiumCrystals?.canUnlockUnavailableActions === false, `${label} Premium Crystals must not unlock unavailable actions.`);
  for (const key of ["researchModifierIds", "aiAgentModifierIds", "buildingModifierIds", "automationModifierIds", "civilizationModifierIds"] as const) {
    assert((timeContract?.accelerationPolicy?.[key]?.length ?? 0) > 0, `${label} Time Action Contract is missing ${key}.`);
  }
  for (const scope of ["research", "buildings", "exploration", "colonization", "mining", "terraforming", "manufacturing", "ship_construction", "expeditions", "discovery"]) {
    assert(timeContract?.futureSystemScopes?.includes(scope), `${label} Time Action Contract is missing future system scope ${scope}.`);
  }

  assert(progression?.id === "planet_exploration_progression_v1", `${label} must publish planet_exploration_progression_v1.`);
  assert(progression?.timeActionContractId === "time_action_contract_v1", `${label} planet exploration progression must reference time_action_contract_v1.`);
  assert(progression?.pipeline?.map((stage) => stage.id).join("|") === expectedPipeline.join("|"), `${label} planet exploration pipeline is invalid: ${progression?.pipeline?.map((stage) => stage.id).join(", ")}.`);
  const stageIds = new Set(progression?.pipeline?.map((stage) => stage.id) ?? []);
  for (const rule of progression?.visibilityRules ?? []) {
    assert(stageIds.has(rule.stageId), `${label} visibility rule references missing stage ${rule.stageId}.`);
    if (["unknown", "detected", "probed"].includes(rule.stageId)) {
      assert(rule.canShowCivilizationSuitabilityIndex === false, `${label} CSI must be hidden at ${rule.stageId}.`);
      assert(rule.canShowStrategicValueIndex === false, `${label} SVI must be hidden at ${rule.stageId}.`);
      assert(rule.canShowNickname === false, `${label} nickname must be hidden at ${rule.stageId}.`);
      assert(rule.canShowRecommendedUses === false, `${label} recommended uses must be hidden at ${rule.stageId}.`);
      assert(rule.canShowAvailableActions === false, `${label} actions must be hidden at ${rule.stageId}.`);
    }
  }
  const surveyed = progression?.visibilityRules?.find((rule) => rule.stageId === "surveyed");
  assert(surveyed?.canShowCivilizationSuitabilityIndex === true, `${label} Surveyed must reveal CSI.`);
  assert(surveyed?.canShowStrategicValueIndex === true, `${label} Surveyed must reveal SVI.`);
  assert(surveyed?.canShowNickname === true, `${label} Surveyed must reveal nickname.`);
  assert(surveyed?.canShowRecommendedUses === true, `${label} Surveyed must reveal recommended uses.`);
  assert(surveyed?.canShowAvailableActions === true, `${label} Surveyed must reveal available actions.`);

  for (const action of progression?.timedActions ?? []) {
    assert(action.timeActionContractId === "time_action_contract_v1", `${label} action ${action.id} must reference Time Action Contract.`);
    assert(action.fromStageId && stageIds.has(action.fromStageId), `${label} action ${action.id} has unresolved fromStageId ${action.fromStageId ?? "(missing)"}.`);
    assert(action.toStageId && stageIds.has(action.toStageId), `${label} action ${action.id} has unresolved toStageId ${action.toStageId ?? "(missing)"}.`);
    assert((action.baseDurationSeconds ?? -1) >= (action.minimumDurationSeconds ?? 0), `${label} action ${action.id} base duration is below minimum.`);
    assert((action.baseDurationSeconds ?? 0) <= (action.maximumDurationSeconds ?? Number.POSITIVE_INFINITY), `${label} action ${action.id} base duration is above maximum.`);
    assert(action.premiumCrystalAcceleration?.unlocksUnavailableActions === false, `${label} action ${action.id} Premium Crystals must not unlock unavailable actions.`);
    if (!["planet_evaluate", "planet_select_development"].includes(action.id)) {
      assert((action.baseDurationSeconds ?? 0) > 0, `${label} action ${action.id} must be time-gated.`);
    }
    if (["planet_start_project", "planet_evaluate", "planet_select_development"].includes(action.id)) {
      assert(action.requiresSurveyComplete === true, `${label} action ${action.id} must require Survey completion.`);
    }
    if (["planet_probe", "planet_survey", "planet_start_project"].includes(action.id)) {
      assert((action.researchModifierIds?.length ?? 0) > 0, `${label} action ${action.id} must publish research duration modifiers.`);
      assert((action.aiAgentModifierIds?.length ?? 0) > 0, `${label} action ${action.id} must publish AI Agent duration modifiers.`);
    }
  }
  for (const actionId of ["planet_probe", "planet_survey", "planet_start_project"]) {
    assert(progression?.timedActions?.some((action) => action.id === actionId), `${label} is missing required exploration action ${actionId}.`);
  }
  for (const rule of progression?.nicknameRules ?? []) {
    assert(rule.revealStageId === "surveyed", `${label} nickname rule ${rule.id} must reveal only at Surveyed.`);
  }
}

function validatePlanetDevelopmentFramework(payload: RuntimePayload | RobloxPayload, label: string) {
  const framework = payload.planetDevelopmentFramework;
  const actionIds = new Set(payload.actionSystem?.actionDefinitions?.map((action) => action.id) ?? []);
  const opportunityProfileIds = new Set(payload.planetOpportunityProfiles?.map((profile) => profile.id) ?? []);
  const preSurveyStates = ["unknown", "detected", "probe_queued", "probing", "probed", "survey_queued", "surveying"];

  assert(framework?.id === "planet_development_framework_v1", `${label} must publish planet_development_framework_v1.`);
  assert(framework?.actionSystemId === payload.actionSystem?.id, `${label} Planet Development Framework must reference Action System.`);
  assert((framework?.knowledgeLifecycle?.length ?? 0) >= 15, `${label} Planet Development Framework must publish knowledge lifecycle.`);
  assert((framework?.visibilityMatrix?.length ?? 0) >= 15, `${label} Planet Development Framework must publish visibility matrix.`);
  assert((framework?.csiBands?.length ?? 0) === 6, `${label} Planet Development Framework must publish six CSI bands.`);
  assert((framework?.sviBands?.length ?? 0) === 6, `${label} Planet Development Framework must publish six SVI bands.`);
  assert((framework?.opportunityArchetypes?.length ?? 0) >= 20, `${label} Planet Development Framework must publish opportunity archetypes.`);
  assert((framework?.developmentProfiles?.length ?? 0) === (payload.planetOpportunityProfiles?.length ?? -1), `${label} Development Profile count must match opportunity profiles.`);
  assert((framework?.assetRequirements?.length ?? 0) >= 8, `${label} Planet Development Framework must publish asset requirements.`);

  const detected = framework?.knowledgeLifecycle?.find((state) => state.id === "detected");
  assert(!(detected?.allowedTransitions ?? []).includes("operational"), `${label} must not allow detected -> operational.`);
  assert(!(detected?.allowedTransitions ?? []).includes("preserved"), `${label} must not allow detected -> preserved.`);

  for (const rule of framework?.visibilityMatrix ?? []) {
    if (preSurveyStates.includes(rule.stateId)) {
      assert(!rule.canShowCsi && !rule.canShowSvi && !rule.canShowNickname && !rule.canShowRecommendations && !rule.canShowValidDevelopmentActions, `${label} ${rule.stateId} leaks survey-only Planet Development fields.`);
    }
  }

  for (const reference of framework?.actionReferences ?? []) {
    assert(actionIds.has(reference.actionId), `${label} Planet Development action ${reference.actionId} must resolve to Action System.`);
  }
  for (const archetype of framework?.opportunityArchetypes ?? []) {
    for (const actionId of archetype.recommendedActionIds ?? []) {
      assert(actionIds.has(actionId), `${label} archetype ${archetype.id} references unresolved action ${actionId}.`);
    }
  }

  const csiBands = new Set(framework?.csiBands?.map((band) => band.id) ?? []);
  const sviBands = new Set(framework?.sviBands?.map((band) => band.id) ?? []);
  for (const profile of framework?.developmentProfiles ?? []) {
    assert(profile.sourceOpportunityProfileId && opportunityProfileIds.has(profile.sourceOpportunityProfileId), `${label} ${profile.id} source Opportunity Profile does not resolve.`);
    assert((profile.csi?.value ?? -1) >= 0 && (profile.csi?.value ?? 101) <= 100, `${label} ${profile.id} CSI out of range.`);
    assert((profile.svi?.value ?? -1) >= 0 && (profile.svi?.value ?? 101) <= 100, `${label} ${profile.id} SVI out of range.`);
    assert(Boolean(profile.csi?.bandId && csiBands.has(profile.csi.bandId)), `${label} ${profile.id} CSI band does not resolve.`);
    assert(Boolean(profile.svi?.bandId && sviBands.has(profile.svi.bandId)), `${label} ${profile.id} SVI band does not resolve.`);
    for (const actionId of profile.validActionIds ?? []) {
      assert(actionIds.has(actionId), `${label} ${profile.id} valid action ${actionId} does not resolve.`);
    }
    assert((profile.blockedActionReasons ?? []).every((reason) => Boolean(reason.reasonCode)), `${label} ${profile.id} has blocked action without reason.`);
  }
  const gasGiant = framework?.developmentProfiles?.find((profile) => profile.sourceOpportunityProfileId === "planet_opportunity_gas_giant");
  assert(gasGiant?.capabilities?.surfaceColonization === "prohibited", `${label} Gas Giant must prohibit surface colonization.`);
  assert(gasGiant?.blockedActionReasons?.some((reason) => reason.actionId === "establish_colony" && reason.reasonCode === "blocked_no_solid_surface"), `${label} Gas Giant colony block reason missing.`);
  assert(!/activePlayerProject|startedAt|completedAt|queueContents|playerBalances|\/Users\//i.test(JSON.stringify(framework)), `${label} Planet Development Framework leaked player state or private paths.`);
}

function validateActionSystem(payload: RuntimePayload | RobloxPayload, label: string) {
  const timeContract = payload.timeActionContract;
  const actionSystem = payload.actionSystem;
  const expectedStates = ["unavailable", "ready", "queued", "waiting", "preparing", "in_progress", "paused", "blocked", "completed", "failed", "cancelled", "archived"];
  const requiredActions = ["send_probe", "probe_travel", "probe_scan", "survey_planet", "catalog_planet", "analyze_anomaly", "analyze_artifact", "excavate_ruin", "prepare_colony", "establish_colony", "build_mining_outpost", "deploy_automated_extraction", "build_gas_harvest_platform", "build_ocean_harvest_platform", "build_research_station", "build_archaeological_camp", "build_orbital_refinery", "designate_preserve", "begin_terraforming_study", "terraform_planet_stage", "conduct_research", "construct_building", "upgrade_building", "manufacture_item", "transfer_resources", "establish_trade_route", "travel_to_destination"];
  const queueIds = new Set(actionSystem?.actionQueueRules?.map((rule) => rule.id) ?? []);
  const categoryIds = new Set(actionSystem?.actionCategories?.map((category) => category.id) ?? []);
  const durationIds = new Set(actionSystem?.actionDurationDefinitions?.map((duration) => duration.id) ?? []);
  const phaseIds = new Set(actionSystem?.actionPhaseTemplates?.map((phase) => phase.id) ?? []);
  const automationPolicyIds = new Set(actionSystem?.actionAutomationPolicies?.map((policy) => policy.id) ?? []);
  const eventIds = new Set(actionSystem?.actionEventDefinitions?.map((event) => event.id) ?? []);

  assert(actionSystem?.id === "canonical_action_system_v1", `${label} must publish canonical_action_system_v1.`);
  assert(actionSystem?.version === "1.0.0", `${label} Action System version must be 1.0.0.`);
  assert(actionSystem?.timeActionContractId === timeContract?.id, `${label} Action System must reference Time Action Contract.`);
  assert(actionSystem?.actionStates?.map((state) => state.id).join("|") === expectedStates.join("|"), `${label} Action System state machine is invalid.`);
  assert((actionSystem?.actionCategories?.length ?? 0) >= 28, `${label} Action System must publish all action categories.`);
  assert((actionSystem?.actionDefinitions?.length ?? 0) >= requiredActions.length, `${label} Action System must publish starter gameplay actions.`);
  assert((actionSystem?.actionQueueRules?.length ?? 0) >= 10, `${label} Action System must publish queue rules.`);
  assert((actionSystem?.actionDurationDefinitions?.length ?? 0) >= 5, `${label} Action System must publish duration definitions.`);
  assert((actionSystem?.actionPhaseTemplates?.length ?? 0) >= 12, `${label} Action System must publish phase templates.`);
  assert((actionSystem?.actionAccelerationPolicies?.length ?? 0) === 4, `${label} Action System must publish protected acceleration policies.`);
  assert((actionSystem?.actionPresentationContracts?.length ?? 0) >= 11, `${label} Action System must publish presentation contracts.`);
  assert((actionSystem?.accelerationRules?.length ?? 0) > 0, `${label} Action System must publish acceleration rules.`);
  assert((actionSystem?.automationRules?.length ?? 0) > 0, `${label} Action System must publish automation rules.`);
  assert((actionSystem?.actionPresentation?.length ?? 0) >= 5, `${label} Action System must publish presentation intent.`);

  const actionIds = new Set(actionSystem?.actionDefinitions?.map((action) => action.id) ?? []);
  for (const actionId of requiredActions) {
    assert(actionIds.has(actionId), `${label} Action System is missing ${actionId}.`);
  }
  for (const state of actionSystem?.actionStates ?? []) {
    assert((state.allowedTransitions?.length ?? 0) > 0 || state.id === "archived", `${label} ${state.id} must publish transition metadata.`);
    assert(Boolean(state.presentationToken), `${label} ${state.id} must publish a presentation token.`);
  }
  for (const policy of actionSystem?.actionAccelerationPolicies ?? []) {
    assert(policy.serverAuthoritativeBalance === true, `${label} ${policy.id} must require server-authoritative balance.`);
    assert(policy.serverCalculatedCost === true, `${label} ${policy.id} must require server-calculated cost.`);
    assert(policy.idempotencyRequired === true, `${label} ${policy.id} must require idempotency.`);
    assert(policy.minimumDurationClamp === true, `${label} ${policy.id} must enforce minimum duration clamp.`);
    assert(policy.canBypassRequirements === false, `${label} ${policy.id} must not bypass requirements.`);
  }
  for (const contract of actionSystem?.actionPresentationContracts ?? []) {
    assert(contract.rendererIndependent === true, `${label} ${contract.id} must be renderer-independent.`);
  }

  for (const action of actionSystem?.actionDefinitions ?? []) {
    assert(Boolean(action.id && action.displayName), `${label} Action missing identity.`);
    assert(!action.id.startsWith("action_"), `${label} ${action.id} must use canonical unprefixed IDs.`);
    assert(Boolean(action.category && categoryIds.has(action.category)), `${label} ${action.id} category does not resolve.`);
    assert((action.requirements?.length ?? 0) > 0, `${label} ${action.id} is missing requirements.`);
    assert(action.requirements?.every((requirement) => Boolean(requirement.reasonCode)), `${label} ${action.id} requirements must publish reason codes.`);
    assert((action.outputs?.length ?? 0) > 0, `${label} ${action.id} is missing outputs.`);
    assert(action.duration?.timeActionContractId === timeContract?.id, `${label} ${action.id} duration must reference Time Action Contract.`);
    assert(Boolean(action.duration?.durationDefinitionId && durationIds.has(action.duration.durationDefinitionId)), `${label} ${action.id} duration definition does not resolve.`);
    assert((action.duration?.baseDurationSeconds ?? 0) > 0, `${label} ${action.id} must be time based.`);
    assert((action.duration?.baseDurationSeconds ?? -1) >= (action.duration?.minimumDurationSeconds ?? 0), `${label} ${action.id} duration is below minimum.`);
    assert((action.duration?.baseDurationSeconds ?? 0) <= (action.duration?.maximumDurationSeconds ?? Number.POSITIVE_INFINITY), `${label} ${action.id} duration is above maximum.`);
    assert((action.phases?.length ?? 0) > 0, `${label} ${action.id} must publish phases.`);
    for (const phaseId of action.phases ?? []) {
      assert(phaseIds.has(phaseId), `${label} ${action.id} has unresolved phase ${phaseId}.`);
    }
    assert(Boolean(action.queueBehavior?.queueRuleId && queueIds.has(action.queueBehavior.queueRuleId)), `${label} ${action.id} queue rule does not resolve.`);
    assert(Boolean(action.concurrency?.concurrencyPolicyId && queueIds.has(action.concurrency.concurrencyPolicyId)), `${label} ${action.id} concurrency policy does not resolve.`);
    assert(Boolean(action.automation?.automationPolicyId && automationPolicyIds.has(action.automation.automationPolicyId)), `${label} ${action.id} automation policy does not resolve.`);
    assert((action.automation?.automationRules?.length ?? 0) > 0, `${label} ${action.id} is missing automation rules.`);
    assert(action.automation?.premiumSpendPermission === "never" || action.automation?.premiumSpendPermission === "explicit_player_authorization", `${label} ${action.id} has unsafe Premium Crystal automation permission.`);
    assert(action.modifiers?.premiumCrystalAcceleration?.policy === "accelerate_only", `${label} ${action.id} Premium Crystal policy must be accelerate_only.`);
    assert(action.modifiers?.premiumCrystalAcceleration?.canUnlockUnavailableActions === false, `${label} ${action.id} Premium Crystals must not unlock unavailable actions.`);
    assert(action.history?.started === true && action.history.completed === true && action.history.cancelled === true && action.history.failed === true && action.history.accelerated === true && action.history.automated === true, `${label} ${action.id} must publish complete history coverage.`);
    assert(action.events?.includes("action_started") && action.events.includes("action_completed"), `${label} ${action.id} must publish started/completed events.`);
    for (const eventId of action.events ?? []) {
      assert(eventIds.has(eventId), `${label} ${action.id} has unresolved event ${eventId}.`);
    }
    assert(action.publicationStatus === "approved" || action.publicationStatus === "provisional", `${label} ${action.id} must be approved or provisional.`);
  }
}

function validateEconomy(payload: RuntimePayload | RobloxPayload, label: string) {
  const economyDefinitions = payload.economyDefinitions ?? [];
  const economyIds = new Set(economyDefinitions.map((definition) => definition.id));
  const materialIds = new Set((payload.resources ?? []).map((resource) => resource.id));
  const profile = "clientHints" in payload ? payload.clientHints : payload.clientProfiles?.default;
  const expectedHud = ["ECON-LABOR", "ECON-CREDITS", "ECON-POPULATION", "ECON-RESEARCH", "ECON-PREMIUM-CRYSTALS"];
  const hud = profile?.primaryHudResources ?? [];
  const slots = profile?.primaryHudSlots ?? [];
  const slotOrders = slots.map((slot) => slot.order);
  const labor = economyDefinitions.find((definition) => definition.id === "ECON-LABOR");
  const credits = economyDefinitions.find((definition) => definition.id === "ECON-CREDITS");

  assert(economyDefinitions.length >= 9, `${label} must include canonical economy definitions.`);
  for (const id of ["ECON-LABOR", "ECON-TRADE", "ECON-INFLUENCE", "ECON-CIVILIZATION-ENERGY", "ECON-CREDITS", "ECON-RESEARCH", "ECON-POPULATION", "ECON-CIVILIZATION-POINTS", "ECON-PREMIUM-CRYSTALS"]) {
    assert(economyIds.has(id), `${label} is missing economy definition ${id}.`);
  }
  assert(hud.join("|") === expectedHud.join("|"), `${label} primaryHudResources order is incorrect: ${hud.join(", ")}.`);
  assert(slots.length === expectedHud.length, `${label} must include slot metadata for every primary HUD economy ID.`);
  assert(new Set(slotOrders).size === slotOrders.length, `${label} HUD slot order values must be unique.`);
  assert(slots.every((slot) => economyIds.has(slot.economyId)), `${label} HUD slot economy IDs must resolve.`);
  assert(slots.map((slot) => slot.economyId).join("|") === expectedHud.join("|"), `${label} primaryHudSlots order is incorrect: ${slots.map((slot) => slot.economyId).join(", ")}.`);
  assert(hud.every((id) => economyIds.has(id) && !materialIds.has(id)), `${label} HUD IDs must resolve only to economy definitions, not material resources.`);
  assert(economyDefinitions.every((definition) => Number.isFinite(definition.startingAmount) && Number.isFinite(definition.startingRate)), `${label} economy starting amounts and rates must be finite.`);
  assert(economyDefinitions.find((definition) => definition.id === "ECON-PREMIUM-CRYSTALS")?.premium === true, `${label} Premium Crystals must be explicitly premium.`);
  assert(labor?.startingAmount === 0, `${label} Labor must start at 0.`);
  assert(labor?.manualClickTarget === true, `${label} Labor must remain the manual click target.`);
  assert(labor?.iconKey === "economy_labor", `${label} Labor must use economy_labor.`);
  assert(labor?.iconKey !== credits?.iconKey, `${label} Labor and Credits must not share an icon key.`);
  assert(labor?.iconKey !== "nature_leaf", `${label} Labor must not use the Nature leaf icon key.`);
  assert(credits?.startingAmount === 0, `${label} Credits must start at 0.`);
  assert(credits?.startingRate === 0, `${label} Credits must not passively generate at start.`);
  assert(credits?.manualClickTarget !== true, `${label} Credits must not be the manual click target.`);
  assert(credits?.iconKey === "economy_credits", `${label} Credits must use economy_credits.`);
  const population = economyDefinitions.find((definition) => definition.id === "ECON-POPULATION");
  assert(population?.startingAmount === 5, `${label} Population must start at 5.`);
  assert(population?.startingRate === 0, `${label} Population must not have a starting rate.`);
  assert(population?.spendable === false, `${label} Population must not be spendable.`);
  assert(population?.premium === false, `${label} Population must not be premium.`);
  assert(population?.manualClickTarget !== true, `${label} Population must not be the manual click target.`);
  assert(Boolean(population?.playerFacingHelpText), `${label} Population must include player-facing help text.`);
  assert(economyDefinitions.find((definition) => definition.id === "ECON-RESEARCH")?.startingAmount === 0, `${label} Research must start at 0.`);
  assert(economyDefinitions.find((definition) => definition.id === "ECON-PREMIUM-CRYSTALS")?.startingAmount === 0, `${label} Premium Crystals must start at 0.`);
  assert(economyDefinitions.find((definition) => definition.id === "ECON-CIVILIZATION-POINTS")?.startingAmount === 0, `${label} Civilization Points must start at 0.`);
  assert(payload.balance?.startingPopulation === 5, `${label} balance.startingPopulation must be 5.`);
  assert(payload.balance?.startingCoins === 0, `${label} balance.startingCoins must be 0.`);
  assert(payload.metadata?.saveMigrationHints?.some((hint) => hint.id === "migration_population_default_125_to_5" && hint.targetId === "ECON-POPULATION" && hint.previousDefault === 125 && hint.currentDefault === 5), `${label} must expose the Population default migration hint.`);
  assert((payload.inventoryResourceMetadata?.length ?? 0) > 0, `${label} must include inventory resource metadata for the resources screen.`);
  assert(payload.inventoryResourceMetadata?.every((row) => row.classification === "inventory_resource"), `${label} inventory metadata must be classified as inventory_resource.`);
  if (!("clientHints" in payload)) {
    for (const profileName of ["roblox", "web", "unity", "unreal", "godot"] as const) {
      const engineProfile = payload.clientProfiles?.[profileName];
      assert(engineProfile?.primaryHudResources?.join("|") === expectedHud.join("|"), `${label} ${profileName} must inherit the fixed HUD resource order.`);
      assert(engineProfile?.primaryHudSlots?.map((slot) => slot.economyId).join("|") === expectedHud.join("|"), `${label} ${profileName} must inherit the fixed HUD slot order.`);
    }
  }
}

function validateEraEconomyProfiles(payload: RuntimePayload | RobloxPayload, label: string) {
  const profiles = payload.eraEconomyProfiles ?? [];
  const economyIds = new Set((payload.economyDefinitions ?? []).map((definition) => definition.id));
  const fixedHud = ["ECON-LABOR", "ECON-CREDITS", "ECON-POPULATION", "ECON-RESEARCH", "ECON-PREMIUM-CRYSTALS"];
  const expected = [
    ["survival", ["ECON-LABOR"], ["ECON-POPULATION"]],
    ["ancient", ["ECON-LABOR"], ["ECON-POPULATION", "ECON-RESEARCH"]],
    ["medieval", ["ECON-LABOR"], ["ECON-POPULATION", "ECON-RESEARCH"]],
    ["renaissance", ["ECON-LABOR", "ECON-TRADE", "ECON-POPULATION", "ECON-RESEARCH"], []],
    ["industrial", ["ECON-CREDITS", "ECON-POPULATION", "ECON-RESEARCH", "ECON-LABOR"], []],
    ["modern", ["ECON-CREDITS", "ECON-RESEARCH", "ECON-POPULATION"], []],
    ["space-age", ["ECON-CIVILIZATION-ENERGY", "ECON-RESEARCH", "ECON-POPULATION"], []],
    ["interstellar", ["ECON-CIVILIZATION-POINTS", "ECON-RESEARCH"], []],
    ["galactic", ["ECON-CIVILIZATION-POINTS", "ECON-INFLUENCE", "ECON-RESEARCH"], []]
  ] as const;

  assert(profiles.length === expected.length, `${label} must include one eraEconomyProfile per canonical era; received ${profiles.length}.`);
  for (const [index, [eraId, primary, secondary]] of expected.entries()) {
    const profile = profiles.find((item) => item.eraId === eraId);
    assert(profile, `${label} is missing era economy profile for ${eraId}.`);
    if (!profile) throw new Error(`${label} is missing era economy profile for ${eraId}.`);
    assert(profile.eraIndex === index + 1, `${label} ${eraId} era economy profile has invalid eraIndex.`);
    assert(profile.primaryEconomyId === primary[0], `${label} ${eraId} primaryEconomyId is invalid.`);
    assert(profile.activePrimaryEconomyId === primary[0], `${label} ${eraId} active primary economy is invalid.`);
    assert(profile.primaryEconomyId === profile.activePrimaryEconomyId, `${label} ${eraId} primaryEconomyId must match activePrimaryEconomyId.`);
    assert(profile.primaryEconomyIds.join("|") === primary.join("|"), `${label} ${eraId} primary economy IDs are invalid: ${profile.primaryEconomyIds.join(", ")}.`);
    assert(profile.secondaryEconomyIds.join("|") === secondary.join("|"), `${label} ${eraId} secondary economy IDs are invalid: ${profile.secondaryEconomyIds.join(", ")}.`);
    assert(profile.fixedHudSlots.join("|") === fixedHud.join("|"), `${label} ${eraId} fixed HUD slots are invalid: ${profile.fixedHudSlots.join(", ")}.`);
    assert(profile.visibleHudEconomyIds.join("|") === fixedHud.join("|"), `${label} ${eraId} visible HUD IDs must preserve fixed order: ${profile.visibleHudEconomyIds.join(", ")}.`);
    assert(profile.hudSlots.map((slot) => slot.economyId).join("|") === fixedHud.join("|"), `${label} ${eraId} HUD slots do not match fixed HUD IDs.`);
    assert(profile.visibilityRules?.useEraHud === false && profile.visibilityRules?.fixedCoreHud === true && profile.visibilityRules?.creditsVisible === true, `${label} ${eraId} visibility rules must preserve fixed core HUD behavior.`);
    if (eraId === "survival") {
      assert(profile.manualClickTarget === "ECON-LABOR", `${label} Survival manualClickTarget must be ECON-LABOR.`);
    }
    for (const economyId of Object.keys(profile.displayOverrides ?? {})) {
      assert(economyIds.has(economyId), `${label} ${eraId} display override economy ID does not resolve: ${economyId}.`);
    }
    for (const economyId of [profile.primaryEconomyId, profile.activePrimaryEconomyId, profile.manualClickTarget, ...profile.primaryEconomyIds, ...profile.secondaryEconomyIds, ...profile.fixedHudSlots, ...profile.visibleHudEconomyIds].filter(isNonEmptyString)) {
      assert(economyIds.has(economyId), `${label} ${eraId} economy ID does not resolve: ${economyId}.`);
    }
  }
  const laborLabels = Object.fromEntries(profiles.map((profile) => [profile.eraId, profile.displayOverrides?.["ECON-LABOR"]?.displayName]));
  assert(laborLabels.survival === "Labor", `${label} Survival Labor display override is missing.`);
  assert(laborLabels.medieval === "Workforce", `${label} Medieval Labor display override must be Workforce.`);
  assert(laborLabels.industrial === "Industrial Workforce", `${label} Industrial Labor display override must be Industrial Workforce.`);
  assert(laborLabels.modern === "Human Capital", `${label} Modern Labor display override must be Human Capital.`);
  assert(laborLabels.interstellar === "Civilization Output", `${label} Interstellar Labor display override must be Civilization Output.`);
  assert(laborLabels.galactic === "Galactic Output", `${label} Galactic Labor display override must be Galactic Output.`);
}

function validateResourceEconomyContracts(payload: RuntimePayload | RobloxPayload, label: string) {
  const fixedHud = ["ECON-LABOR", "ECON-CREDITS", "ECON-POPULATION", "ECON-RESEARCH", "ECON-PREMIUM-CRYSTALS"];
  const economyIds = new Set((payload.economyDefinitions ?? []).map((definition) => definition.id));
  const contracts = payload.economyBehaviorContracts ?? [];
  const producers = payload.resourceProducerDefinitions ?? [];
  const buildingEffects = payload.buildingResourceEffects ?? [];
  const producerIds = new Set(producers.map((producer) => producer.id));
  const buildingEffectIds = new Set(buildingEffects.map((effect) => effect.id));
  const contractById = new Map(contracts.map((contract) => [contract.economyId, contract]));

  assert(contracts.length === fixedHud.length, `${label} must publish exactly five HUD economy behavior contracts.`);
  for (const economyId of fixedHud) {
    const contract = contractById.get(economyId);
    assert(contract, `${label} is missing economy behavior contract ${economyId}.`);
    assert(economyIds.has(economyId), `${label} economy behavior contract ${economyId} does not resolve to an economy definition.`);
    assert(contract?.canGoNegative === false, `${label} ${economyId} must not go negative.`);
    assert(Array.isArray(contract?.validationRules) && (contract?.validationRules?.length ?? 0) > 0, `${label} ${economyId} must publish validation rules.`);
  }

  const labor = contractById.get("ECON-LABOR");
  assert(labor?.behaviorType === "produced_currency", `${label} Labor contract must be produced_currency.`);
  assert(labor?.startingAmount === 0, `${label} Labor contract startingAmount must be 0.`);
  assert(labor?.basePassiveRate === 1, `${label} Labor contract basePassiveRate must be 1.`);
  assert(labor?.manualProduction?.enabled === true, `${label} Labor contract must enable manual production.`);
  assert(labor?.automatedProduction?.enabled === true && labor.automatedProduction.aiAgentTarget === true, `${label} Labor contract must allow AI Agent automation separately.`);
  assert(labor?.buildingProduction?.enabled === true, `${label} Labor contract must allow canonical building production.`);
  assert(labor?.offlineProgressEligible === true, `${label} Labor contract must allow offline progression.`);
  assert(labor?.spendable === true, `${label} Labor contract must be spendable.`);

  const credits = contractById.get("ECON-CREDITS");
  assert(credits?.behaviorType === "produced_currency", `${label} Credits contract must be produced_currency.`);
  assert(credits?.startingAmount === 0, `${label} Credits contract startingAmount must be 0.`);
  assert(credits?.basePassiveRate === 0, `${label} Credits must not have default passive production.`);
  assert(credits?.manualProduction?.enabled === false, `${label} Credits must not enable manual click production.`);
  assert(credits?.spendable === true, `${label} Credits contract must be spendable.`);

  const population = contractById.get("ECON-POPULATION");
  assert(population?.behaviorType === "capacity_count", `${label} Population contract must be capacity_count.`);
  assert(population?.startingAmount === 5, `${label} Population contract startingAmount must be 5.`);
  assert(population?.manualProduction?.enabled === false, `${label} Population must not be manually clicked.`);
  assert(population?.spendable === false, `${label} Population must not be spendable.`);
  assert(population?.capacityResource === true, `${label} Population must be marked as a capacity resource.`);
  assert(population?.capPolicy?.type === "capacity_bound", `${label} Population must use capacity-bound policy.`);

  const research = contractById.get("ECON-RESEARCH");
  assert(research?.behaviorType === "knowledge_currency", `${label} Research contract must be knowledge_currency.`);
  assert(research?.startingAmount === 0 && research?.basePassiveRate === 0, `${label} Research must start at 0 with no default passive production.`);
  assert(research?.manualProduction?.enabled === false, `${label} Research must not be manually clicked.`);

  const premium = contractById.get("ECON-PREMIUM-CRYSTALS");
  assert(premium?.behaviorType === "premium_currency", `${label} Premium Crystals contract must be premium_currency.`);
  assert(premium?.startingAmount === 0 && premium?.basePassiveRate === 0, `${label} Premium Crystals must start at 0 with no default passive production.`);
  assert(premium?.premiumResource === true, `${label} Premium Crystals must be marked premium.`);
  assert(premium?.buildingProduction?.enabled === false, `${label} Premium Crystals must not have building production.`);
  assert(premium?.offlineProgressEligible === false, `${label} Premium Crystals must not allow offline production.`);
  assert(premium?.purchaseProduction?.enabled === true && (premium.purchaseProduction.serverAuthoritative === true || premium.purchaseProduction.serverAuthoritativeRequired === true), `${label} purchased Premium Crystals must be server-authoritative.`);

  assert(producers.some((producer) => producer.id === "producer_labor_base_passive" && producer.economyId === "ECON-LABOR" && producer.productionMode === "per_second" && producer.baseAmount === 1), `${label} must publish Labor base passive producer.`);
  assert(producers.some((producer) => producer.id === "producer_labor_manual_click" && producer.economyId === "ECON-LABOR" && producer.productionMode === "per_click"), `${label} must publish Labor manual click producer.`);
  assert(producers.some((producer) => producer.id === "producer_labor_ai_agent_assistance" && producer.economyId === "ECON-LABOR" && producer.sourceType === "ai_agent"), `${label} must publish Labor AI Agent producer.`);
  assert(!producers.some((producer) => producer.economyId === "ECON-CREDITS" && producer.sourceType === "system_base" && (producer.baseRate ?? 0) > 0), `${label} must not publish a default Credits passive producer.`);
  assert(!producers.some((producer) => producer.economyId === "ECON-PREMIUM-CRYSTALS" && ["building", "system_base", "ai_agent"].includes(String(producer.sourceType))), `${label} must not publish generic Premium Crystal producers.`);
  assert(buildingEffects.length > 0, `${label} must publish structured building resource effects.`);
  for (const effect of buildingEffects) {
    assert(economyIds.has(effect.economyId), `${label} building effect ${effect.id} has unresolved economyId ${effect.economyId}.`);
    assert(effect.economyId !== "ECON-PREMIUM-CRYSTALS", `${label} building effect ${effect.id} must not produce Premium Crystals.`);
  }
  for (const producer of producers) {
    assert(economyIds.has(producer.economyId), `${label} producer ${producer.id} has unresolved economyId ${producer.economyId}.`);
    if (producer.buildingEffectId) {
      assert(buildingEffectIds.has(producer.buildingEffectId), `${label} producer ${producer.id} has unresolved buildingEffectId ${producer.buildingEffectId}.`);
    }
  }
  for (const producerId of contracts.flatMap((contract) => contract.buildingProduction?.producerDefinitionIds ?? [])) {
    assert(producerIds.has(producerId), `${label} contract references unresolved producer ${producerId}.`);
  }
  for (const economyId of fixedHud) {
    assert(payload.economyScopeRules?.some((rule) => rule.economyId === economyId || rule.appliesToEconomyIds?.includes(economyId)), `${label} ${economyId} is missing scope rules.`);
    assert(payload.economyTransactionReasons?.some((reason) => reason.economyId === economyId), `${label} ${economyId} is missing transaction reason codes.`);
    assert(payload.economyRateBreakdownDefinitions?.some((definition) => definition.economyId === economyId), `${label} ${economyId} is missing rate breakdown definitions.`);
    assert(payload.offlineProgressionPolicies?.some((policy) => policy.economyId === economyId), `${label} ${economyId} is missing offline policy.`);
  }
  assert(payload.economyTransactionReasons?.some((reason) => reason.economyId === "ECON-PREMIUM-CRYSTALS" && reason.operation === "purchase" && reason.sourceTypes?.includes("entitlement") && reason.serverAuthoritativeRequired === true), `${label} Premium Crystals must include safe purchase transaction reason.`);
  assert(payload.economyCalculationRules?.rounding?.integerEconomyIds?.includes("ECON-POPULATION"), `${label} calculation rules must keep Population integer-rounded.`);
  assert(payload.economyCalculationRules?.rounding?.integerEconomyIds?.includes("ECON-PREMIUM-CRYSTALS"), `${label} calculation rules must keep Premium Crystals integer-rounded.`);
  assert((payload.economyCalculationRules?.multiplierOrder?.length ?? 0) > 0, `${label} must publish deterministic multiplier order.`);
}

function validateEraNavigation(payload: RuntimePayload | RobloxPayload, label: string) {
  const eras = payload.eras ?? [];
  const eraNames = eras.map((era) => era.displayName ?? era.id);
  const expectedIds = ["survival", "ancient", "medieval", "renaissance", "industrial", "modern", "space-age", "interstellar", "galactic"];
  const eraNavigation = "clientHints" in payload ? payload.clientHints?.eraNavigation : payload.clientProfiles?.default?.eraNavigation;
  const supportedModes = new Set(["current_journey", "compact_timeline", "full_timeline"]);
  const supportedBoundaryModes = new Set(["current_and_next", "previous_current_next", "previous_and_current"]);

  assert(eras.length === 9, `${label} payload must include exactly nine eras; received ${eras.length}.`);
  assert(eraNames.join("|") === "Survival|Ancient|Medieval|Renaissance|Industrial|Modern|Space Age|Interstellar|Galactic", `${label} eras are not in canonical order: ${eraNames.join(", ")}.`);
  assert(eras.map((era) => era.id).join("|") === expectedIds.join("|"), `${label} era IDs are not in canonical order: ${eras.map((era) => era.id).join(", ")}.`);
  assert(eras.every((era, index) => era.index === index + 1), `${label} era indexes must be unique, sequential, and one-based.`);
  assert(eras[3]?.id === "renaissance", `${label} payload is missing Renaissance at position 4.`);
  assert(eras[3]?.index === 4 && eras[3]?.name === "renaissance" && eras[3]?.displayName === "Renaissance" && eras[3]?.shortDisplayName === "Renaissance", `${label} Renaissance record is not canonical.`);
  assert(eras[2]?.id === "medieval" && eras[4]?.id === "industrial", `${label} Renaissance must immediately follow Medieval and precede Industrial.`);
  assert(eras.every((era) => era.shortDisplayName), `${label} every era must expose shortDisplayName.`);
  assert(eras.map((era) => `${era.id}:${era.shortDisplayName}`).join("|") === "survival:Survival|ancient:Ancient|medieval:Medieval|renaissance:Renaissance|industrial:Industrial|modern:Modern|space-age:Space|interstellar:Interstellar|galactic:Galactic", `${label} shortDisplayName values are not canonical.`);
  assert(supportedModes.has(String(eraNavigation?.dashboardMode)), `${label} eraNavigation.dashboardMode is not supported.`);
  assert(eraNavigation?.dashboardMode === "current_journey", `${label} eraNavigation.dashboardMode must be current_journey.`);
  assert(Number.isInteger(eraNavigation?.visibleEraCount) && (eraNavigation?.visibleEraCount ?? 0) > 0 && (eraNavigation?.visibleEraCount ?? 0) <= eras.length, `${label} eraNavigation.visibleEraCount must be a positive integer no larger than era count.`);
  assert(eraNavigation?.visibleEraCount === 3, `${label} eraNavigation.visibleEraCount must be 3.`);
  assert(eraNavigation?.fullTimelineEnabled === true, `${label} eraNavigation.fullTimelineEnabled must be true.`);
  assert(eraNavigation?.allowPrimaryHorizontalScroll === false, `${label} eraNavigation.allowPrimaryHorizontalScroll must be false.`);
  assert(eraNavigation?.boundaryBehavior?.firstEraMode === "current_and_next", `${label} boundary firstEraMode must be current_and_next.`);
  assert(eraNavigation?.boundaryBehavior?.middleEraMode === "previous_current_next", `${label} boundary middleEraMode must be previous_current_next.`);
  assert(eraNavigation?.boundaryBehavior?.lastEraMode === "previous_and_current", `${label} boundary lastEraMode must be previous_and_current.`);
  for (const value of Object.values(eraNavigation?.boundaryBehavior ?? {})) {
    assert(supportedBoundaryModes.has(String(value)), `${label} boundary behavior value is not supported: ${value}.`);
  }

  if (!("clientHints" in payload)) {
    for (const profileName of ["roblox", "web", "unity", "unreal", "godot"] as const) {
      const profileNavigation = payload.clientProfiles?.[profileName]?.eraNavigation;
      assert(profileNavigation?.visibleEraCount === 3, `${label} ${profileName} eraNavigation override must inherit visibleEraCount 3.`);
      assert(profileNavigation?.dashboardMode === "current_journey", `${label} ${profileName} eraNavigation must inherit dashboardMode.`);
      assert(profileNavigation?.boundaryBehavior?.middleEraMode === "previous_current_next", `${label} ${profileName} eraNavigation must inherit boundary behavior.`);
    }
  }
}

function validateRobloxReferences(payload: RobloxPayload) {
  const eraIds = new Set((payload.eras ?? []).map((era) => era.id));
  const resourceIds = new Set((payload.resources ?? []).map((resource) => resource.id));
  const economyIds = new Set((payload.economyDefinitions ?? []).map((definition) => definition.id));
  const tabIds = new Set((payload.upgradeTabs ?? []).map((tab) => tab.tabId));

  assert(payload.upgradeTabs?.length === 4, `Expected exactly four Roblox upgrade tabs; received ${payload.upgradeTabs?.length ?? 0}.`);

  for (const upgrade of payload.upgrades ?? []) {
    assert(upgrade.tabId && tabIds.has(upgrade.tabId), `Upgrade ${upgrade.id} has unresolved tabId ${upgrade.tabId ?? "(missing)"}.`);
    assert(upgrade.eraId && eraIds.has(upgrade.eraId), `Upgrade ${upgrade.id} has unresolved eraId ${upgrade.eraId ?? "(missing)"}.`);
    if (upgrade.costResourceId) assert(resourceIds.has(upgrade.costResourceId), `Upgrade ${upgrade.id} has unresolved costResourceId ${upgrade.costResourceId}.`);
    if (upgrade.costEconomyId) assert(economyIds.has(upgrade.costEconomyId), `Upgrade ${upgrade.id} has unresolved costEconomyId ${upgrade.costEconomyId}.`);
  }
}

async function main() {
  const canonical = await requestJson<RuntimePayload>("/api/export/game-runtime-data.json");
  const roblox = await requestJson<RobloxPayload>("/api/export/roblox-game-data.json");
  const authenticatedCanonical = await requestJson<RuntimePayload>("/api/export/game-runtime-data.json", { headers: authHeaders() });
  const authenticatedRoblox = await requestJson<RobloxPayload>("/api/export/roblox-game-data.json", { headers: authHeaders() });
  const anonymousPublicMutation = await requestJson<Record<string, unknown>>("/api/export/roblox-game-data.json", { method: "POST" });
  const anonymousImportMutation = await requestJson<Record<string, unknown>>("/api/game-runtime/import/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({})
  });
  const anonymousAdmin = await requestJson<Record<string, unknown>>("/api/admin/users");

  assert(canonical.status === 200, `Canonical route returned ${canonical.status}.`);
  assert(roblox.status === 200, `Roblox route returned ${roblox.status}.`);
  assert(authenticatedCanonical.status === 200, `Authenticated canonical route returned ${authenticatedCanonical.status}.`);
  assert(authenticatedRoblox.status === 200, `Authenticated Roblox route returned ${authenticatedRoblox.status}.`);
  assert(anonymousPublicMutation.status >= 400, `Anonymous public route mutation was not rejected; received ${anonymousPublicMutation.status}.`);
  assert(anonymousImportMutation.status >= 400, `Anonymous import mutation was not rejected; received ${anonymousImportMutation.status}.`);
  assert(anonymousAdmin.status >= 400 || anonymousAdmin.status === 307 || anonymousAdmin.status === 308, `Anonymous admin route was not protected; received ${anonymousAdmin.status}.`);
  assert(canonical.payload.metadata?.schemaVersion, "Canonical metadata.schemaVersion is missing.");
  assert(canonical.payload.metadata?.architectureVersion === ARCHITECTURE_VERSION, "Canonical metadata.architectureVersion must match the Architecture Workspace.");
  assert(canonical.payload.metadata?.universalDiscoveryRegistryVersion === "1.0.0", "Canonical metadata.universalDiscoveryRegistryVersion must be 1.0.0.");
  assert(canonical.payload.metadata?.galaxyEngineContractVersion === "1.0.0", "Canonical metadata.galaxyEngineContractVersion must be 1.0.0.");
  assert(canonical.payload.metadata?.contentVersion, "Canonical metadata.contentVersion is missing.");
  assert(canonical.payload.metadata?.checksum, "Canonical metadata.checksum is missing.");
  assert(canonical.payload.metadata?.accessLevel === "public-published", "Canonical accessLevel must be public-published.");
  assert(canonical.payload.metadata?.validationStatus, "Canonical validation status is missing.");
  assert(roblox.payload.metadata?.schemaVersion, "Roblox metadata.schemaVersion is missing.");
  assert(roblox.payload.metadata?.architectureVersion === ARCHITECTURE_VERSION, "Roblox metadata.architectureVersion must match the Architecture Workspace.");
  assert(roblox.payload.metadata?.universalDiscoveryRegistryVersion === "1.0.0", "Roblox metadata.universalDiscoveryRegistryVersion must be 1.0.0.");
  assert(roblox.payload.metadata?.galaxyEngineContractVersion === "1.0.0", "Roblox metadata.galaxyEngineContractVersion must be 1.0.0.");
  assert(roblox.payload.metadata?.contentVersion, "Roblox metadata.contentVersion is missing.");
  assert(roblox.payload.metadata?.checksum, "Roblox metadata.checksum is missing.");
  assert(roblox.payload.metadata?.accessLevel === "public-published", "Roblox accessLevel must be public-published.");
  assert(roblox.payload.metadata?.validationStatus, "Roblox validation status is missing.");
  assert((canonical.payload.eras?.length ?? 0) > 0, "Canonical payload must include at least one era.");
  assert((canonical.payload.metadata?.contentVersion ?? 0) >= 26, "Canonical contentVersion must be at least 26 after Planet Development Framework.");
  assert((roblox.payload.metadata?.contentVersion ?? 0) >= 26, "Roblox contentVersion must be at least 26 after Planet Development Framework.");

  validateEraNavigation(canonical.payload, "Canonical");
  validateEraNavigation(roblox.payload, "Roblox");
  validateEconomy(canonical.payload, "Canonical");
  validateEconomy(roblox.payload, "Roblox");
  validateEraEconomyProfiles(canonical.payload, "Canonical");
  validateEraEconomyProfiles(roblox.payload, "Roblox");
  validateResourceEconomyContracts(canonical.payload, "Canonical");
  validateResourceEconomyContracts(roblox.payload, "Roblox");
  validateAiAgentRuntime(canonical.payload, "Canonical");
  validateAiAgentRuntime(roblox.payload, "Roblox");
  validateDiscoveryRuntime(canonical.payload, "Canonical");
  validateDiscoveryRuntime(roblox.payload, "Roblox");
  validateGalaxyEngineContract(canonical.payload, "Canonical");
  validateGalaxyEngineContract(roblox.payload, "Roblox");
  validatePlanetOpportunityProfiles(canonical.payload, "Canonical");
  validatePlanetOpportunityProfiles(roblox.payload, "Roblox");
  validateActionSystem(canonical.payload, "Canonical");
  validateActionSystem(roblox.payload, "Roblox");
  validatePlanetExplorationProgression(canonical.payload, "Canonical");
  validatePlanetExplorationProgression(roblox.payload, "Roblox");
  validatePlanetDevelopmentFramework(canonical.payload, "Canonical");
  validatePlanetDevelopmentFramework(roblox.payload, "Roblox");
  validateRuntimeReferences(canonical.payload);
  validateRobloxReferences(roblox.payload);
  assertNoArchitectureLeak("Canonical runtime", canonical.payload);
  assertNoArchitectureLeak("Roblox runtime", roblox.payload);

  console.log(JSON.stringify({
    canonical: {
      status: canonical.status,
      schemaVersion: canonical.payload.metadata?.schemaVersion,
      architectureVersion: canonical.payload.metadata?.architectureVersion,
      universalDiscoveryRegistryVersion: canonical.payload.metadata?.universalDiscoveryRegistryVersion,
      metadataGalaxyEngineContractVersion: canonical.payload.metadata?.galaxyEngineContractVersion,
      contentVersion: canonical.payload.metadata?.contentVersion,
      checksum: canonical.payload.metadata?.checksum,
      accessLevel: canonical.payload.metadata?.accessLevel,
      validationStatus: canonical.payload.metadata?.validationStatus,
      cacheControl: canonical.headers.get("cache-control"),
      eraCount: canonical.payload.eras?.length ?? 0,
      economyDefinitionCount: canonical.payload.economyDefinitions?.length ?? 0,
      eraEconomyProfileCount: canonical.payload.eraEconomyProfiles?.length ?? 0,
      economyBehaviorContractCount: canonical.payload.economyBehaviorContracts?.length ?? 0,
      resourceProducerCount: canonical.payload.resourceProducerDefinitions?.length ?? 0,
      buildingResourceEffectCount: canonical.payload.buildingResourceEffects?.length ?? 0,
      primaryHudResources: canonical.payload.clientProfiles?.default?.primaryHudResources ?? [],
      aiAgentCount: canonical.payload.aiAgents?.length ?? 0,
      aiAgentVariantCount: canonical.payload.aiAgentVariants?.length ?? 0,
      discoveryCategoryCount: canonical.payload.discoveryCategories?.length ?? 0,
      discoveryCount: canonical.payload.discoveries?.length ?? 0,
      universalRegistryEntityTypeCount: canonical.payload.universalDiscoveryRegistry?.entityTypes?.length ?? 0,
      galaxyEngineContractVersion: canonical.payload.galaxyEngineContract?.version,
      semanticZoomCount: canonical.payload.galaxyEngineContract?.semanticZoom?.length ?? 0,
      technologyGateCount: canonical.payload.galaxyEngineContract?.technologyGates?.length ?? 0,
      knowledgeStateCount: canonical.payload.galaxyEngineContract?.knowledgeVisibility?.length ?? 0,
      platformRenderingProfileCount: canonical.payload.galaxyEngineContract?.platformRenderingProfiles?.length ?? 0,
      planetOpportunityProfileCount: canonical.payload.planetOpportunityProfiles?.length ?? 0,
      timeActionContractId: canonical.payload.timeActionContract?.id,
      actionSystemId: canonical.payload.actionSystem?.id,
      actionDefinitionCount: canonical.payload.actionSystem?.actionDefinitions?.length ?? 0,
      planetExplorationStageCount: canonical.payload.planetExplorationProgression?.pipeline?.length ?? 0,
      planetExplorationActionCount: canonical.payload.planetExplorationProgression?.timedActions?.length ?? 0,
      planetDevelopmentProfileCount: canonical.payload.planetDevelopmentFramework?.developmentProfiles?.length ?? 0,
      resourceCount: canonical.payload.resources?.length ?? 0,
      upgradeCount: canonical.payload.upgrades?.length ?? 0
    },
    roblox: {
      status: roblox.status,
      schemaVersion: roblox.payload.metadata?.schemaVersion,
      architectureVersion: roblox.payload.metadata?.architectureVersion,
      universalDiscoveryRegistryVersion: roblox.payload.metadata?.universalDiscoveryRegistryVersion,
      metadataGalaxyEngineContractVersion: roblox.payload.metadata?.galaxyEngineContractVersion,
      contentVersion: roblox.payload.metadata?.contentVersion,
      checksum: roblox.payload.metadata?.checksum,
      accessLevel: roblox.payload.metadata?.accessLevel,
      validationStatus: roblox.payload.metadata?.validationStatus,
      cacheControl: roblox.headers.get("cache-control"),
      eraCount: roblox.payload.eras?.length ?? 0,
      economyDefinitionCount: roblox.payload.economyDefinitions?.length ?? 0,
      eraEconomyProfileCount: roblox.payload.eraEconomyProfiles?.length ?? 0,
      economyBehaviorContractCount: roblox.payload.economyBehaviorContracts?.length ?? 0,
      resourceProducerCount: roblox.payload.resourceProducerDefinitions?.length ?? 0,
      buildingResourceEffectCount: roblox.payload.buildingResourceEffects?.length ?? 0,
      primaryHudResources: roblox.payload.clientHints?.primaryHudResources ?? [],
      aiAgentCount: roblox.payload.aiAgents?.length ?? 0,
      aiAgentVariantCount: roblox.payload.aiAgentVariants?.length ?? 0,
      discoveryCategoryCount: roblox.payload.discoveryCategories?.length ?? 0,
      discoveryCount: roblox.payload.discoveries?.length ?? 0,
      universalRegistryEntityTypeCount: roblox.payload.universalDiscoveryRegistry?.entityTypes?.length ?? 0,
      galaxyEngineContractVersion: roblox.payload.galaxyEngineContract?.version,
      semanticZoomCount: roblox.payload.galaxyEngineContract?.semanticZoom?.length ?? 0,
      technologyGateCount: roblox.payload.galaxyEngineContract?.technologyGates?.length ?? 0,
      knowledgeStateCount: roblox.payload.galaxyEngineContract?.knowledgeVisibility?.length ?? 0,
      platformRenderingProfileCount: roblox.payload.galaxyEngineContract?.platformRenderingProfiles?.length ?? 0,
      planetOpportunityProfileCount: roblox.payload.planetOpportunityProfiles?.length ?? 0,
      timeActionContractId: roblox.payload.timeActionContract?.id,
      actionSystemId: roblox.payload.actionSystem?.id,
      actionDefinitionCount: roblox.payload.actionSystem?.actionDefinitions?.length ?? 0,
      planetExplorationStageCount: roblox.payload.planetExplorationProgression?.pipeline?.length ?? 0,
      planetExplorationActionCount: roblox.payload.planetExplorationProgression?.timedActions?.length ?? 0,
      planetDevelopmentProfileCount: roblox.payload.planetDevelopmentFramework?.developmentProfiles?.length ?? 0,
      resourceCount: roblox.payload.resources?.length ?? 0,
      upgradeTabCount: roblox.payload.upgradeTabs?.length ?? 0,
      upgradeCount: roblox.payload.upgrades?.length ?? 0
    },
    protection: {
      authenticatedCanonicalStatus: authenticatedCanonical.status,
      authenticatedRobloxStatus: authenticatedRoblox.status,
      anonymousPublicMutationStatus: anonymousPublicMutation.status,
      anonymousImportMutationStatus: anonymousImportMutation.status,
      anonymousAdminStatus: anonymousAdmin.status
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
