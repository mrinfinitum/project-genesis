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
  civilizationProgressionFramework?: {
    id?: string;
    actionSystemId?: string;
    planetDevelopmentFrameworkId?: string;
    civilizationIdentitySource?: string;
    calculationVersion?: string;
    progressionPolicy?: { xpAllowed?: boolean; deterministic?: boolean; playerInstancesExported?: boolean };
    developmentScores?: Array<{ id: string; calculationVersion?: string; deterministic?: boolean; scoreRange?: { min?: number; max?: number } }>;
    scoreBands?: Array<{ id: string; min: number; max: number }>;
    civilizationStages?: Array<{ id: string; order?: number; requirementIds?: string[]; unlockedSystemIds?: string[]; availableActionIds?: string[]; milestoneIds?: string[] }>;
    civilizationStageRequirements?: Array<{ id: string; stageId?: string; requirementType?: string; requiredIds?: string[]; dimensionIds?: string[] }>;
    civilizationMilestones?: Array<{ id: string; deterministic?: boolean; requirementIds?: string[]; contributesToDimensionIds?: string[]; unlockedSystemIds?: string[] }>;
    civilizationProgressionPresentation?: Array<{ id: string; rendererIndependent?: boolean; semanticFields?: string[] }>;
  };
  colonizationFramework?: {
    id?: string;
    actionSystemId?: string;
    planetDevelopmentFrameworkId?: string;
    civilizationProgressionFrameworkId?: string;
    activePlayerStatePolicy?: {
      exportsActiveColonies?: boolean;
      exportsProjectQueues?: boolean;
      exportsTimestamps?: boolean;
      exportsPlayerPopulationAssignments?: boolean;
      exportsTransferredResources?: boolean;
    };
    resolverContract?: { id?: string; deterministic?: boolean; inputFields?: string[]; returnFields?: string[] };
    colonyTypeDefinitions?: Array<{ id: string; supportedBodyClasses?: string[]; prohibitedBodyClasses?: string[]; requiredResources?: string[]; requiredBuildings?: string[]; allowedActionIds?: string[]; defaultDevelopmentFocus?: string; civilizationIdentityInfluence?: { alignmentIds?: string[] } }>;
    colonizationEligibilityDefinitions?: Array<{ id: string; canStartProject?: boolean; blocksActionStart?: boolean }>;
    colonizationReasonCodes?: Array<{ id: string }>;
    colonyProjectPhaseDefinitions?: Array<{ id: string; canonicalActionPhaseId?: string; durationDefinitionId?: string }>;
    colonyTransportRequirementDefinitions?: Array<{ id: string; status?: string; requiredForColonyTypeIds?: string[]; canonicalBuildingId?: string | null; canonicalResourceId?: string | null }>;
    colonyResourcePackageDefinitions?: Array<{ id: string; resourceInputs?: Array<{ role: string; resourceId: string; quantity: number }>; transportRequirementIds?: string[]; recommendedForColonyTypeIds?: string[] }>;
    colonyPopulationRequirementDefinitions?: Array<{ id: string; colonyTypeId?: string; minimumFoundingPopulation?: number; minimumAssignedWorkforce?: number }>;
    colonyInitialStateTemplates?: Array<{ id: string; colonyTypeId?: string; operationalStatus?: string; firstBuildingSetId?: string; hazardModifierIds?: string[]; maintenanceCategoryIds?: string[] }>;
    colonyDevelopmentStages?: Array<{ id: string; requirements?: unknown[] }>;
    colonyFocusDefinitions?: Array<{ id: string; recommendedActionIds?: string[] }>;
    colonyStarterSetDefinitions?: Array<{ id: string; colonyTypeId?: string; buildingRoles?: Array<{ role: string; buildingId?: string | null }> }>;
    colonyCapabilityDefinitions?: Array<{ id: string }>;
    colonyMaintenanceDefinitions?: Array<{ id: string; category?: string }>;
    colonyFailurePolicies?: Array<{ id: string; historicalRecord?: boolean }>;
    colonyPresentationContract?: Array<{ id: string; rendererIndependent?: boolean }>;
    creativeProductionRequirements?: Array<{ id: string; category?: string }>;
    assetLibraryCategories?: Array<{ id: string; groups?: string[] }>;
    missingCanonicalDefinitions?: Array<{ id: string; type?: string }>;
  };
  resourceEconomyLogisticsFramework?: {
    id?: string;
    architectureDecisionId?: string;
    activePlayerStatePolicy?: Record<string, boolean | undefined>;
    resourceFlowDefinitions?: Array<{ id: string; resourceId?: string; sourceNodeTypes?: string[]; destinationNodeTypes?: string[]; storageDefinitionIds?: string[]; transportModeIds?: string[]; lossPolicyId?: string; wastePolicyId?: string }>;
    economyNodeTypeDefinitions?: Array<{ id: string; routeCompatibility?: string[]; buildingReferences?: string[] }>;
    resourceExtractionDefinitions?: Array<{ id: string; actionId?: string; durationDefinitionId?: string; buildingRequirementIds?: string[]; byproductResourceIds?: string[]; wastePolicyId?: string }>;
    resourceStorageDefinitions?: Array<{ id: string; lossPolicyId?: string; buildingReferenceIds?: string[] }>;
    transportModeDefinitions?: Array<{ id: string; supportedRouteScopes?: string[]; fuelRequirementIds?: string[]; actionIds?: string[]; lossPolicyId?: string }>;
    logisticsRouteDefinitions?: Array<{ id: string; sourceNodeRequirements?: string[]; destinationNodeRequirements?: string[]; validTransportModeIds?: string[]; routeActionIds?: string[]; throughput?: number; capacity?: number; deterministic?: boolean; queuePolicyId?: string }>;
    shipmentStateDefinitions?: Array<{ id: string; allowedTransitions?: string[]; terminal?: boolean }>;
    throughputDefinitions?: Array<{ id: string; bounded?: boolean; capacityConstraintIds?: string[] }>;
    capacityConstraintDefinitions?: Array<{ id: string }>;
    processingRecipeDefinitions?: Array<{ id: string; inputItems?: Array<{ resourceId: string }>; outputItems?: Array<{ resourceId: string }>; byproducts?: Array<{ resourceId: string }>; wasteOutputs?: Array<{ resourceId: string; policyId?: string }>; requiredBuildingIds?: string[]; durationDefinitionId?: string; actionId?: string }>;
    manufacturingRecipeDefinitions?: Array<{ id: string; inputItems?: Array<{ resourceId: string }>; outputItems?: Array<{ resourceId: string }>; byproducts?: Array<{ resourceId: string }>; wasteOutputs?: Array<{ resourceId: string; policyId?: string }>; requiredBuildingIds?: string[]; durationDefinitionId?: string; actionId?: string }>;
    productionChainDefinitions?: Array<{ id: string; stages?: Array<{ recipeId?: string; inputResourceIds?: string[]; outputResourceIds?: string[]; nodeTypeIds?: string[] }>; storageRequirementIds?: string[]; transportRequirementIds?: string[]; bottleneckDefinitionIds?: string[] }>;
    supplyDemandDefinitions?: Array<{ id: string; priorityId?: string; affectedActionIds?: string[] }>;
    economyPriorityDefinitions?: Array<{ id: string }>;
    economyConditionStateDefinitions?: Array<{ id: string; reasonCode?: string; blocksActionStart?: boolean }>;
    economyShortageReasonCodes?: Array<{ id: string; stateId?: string }>;
    lossAndWastePolicies?: Array<{ id: string }>;
    recyclingPolicies?: Array<{ id: string; actionId?: string; wastePolicyId?: string }>;
    marketTradeIntegration?: Array<{ id: string; gameOwnsOrders?: boolean; tradeActionIds?: string[] }>;
    colonizationIntegration?: { colonyResourcePackageIds?: string[]; requiredRouteDefinitionIds?: string[]; requiredTransportModeIds?: string[]; requiredPhaseIds?: string[] };
    actionIntegrationHooks?: Array<{ id: string; actionId?: string; required?: boolean }>;
    economyLogisticsPresentationContract?: Array<{ id: string; rendererIndependent?: boolean }>;
    provisionalBalanceValues?: Array<{ id: string }>;
    missingCanonicalDefinitions?: Array<{ id: string; type?: string }>;
  };
  missionExpeditionFramework?: {
    id?: string;
    architectureDecisionId?: string;
    activePlayerStatePolicy?: Record<string, boolean | undefined>;
    missionTypeDefinitions?: Array<{ id: string; expeditionScopeIds?: string[]; defaultObjectiveTypeIds?: string[]; defaultRewardTypeIds?: string[]; requiredActionIds?: string[] }>;
    expeditionScopeDefinitions?: Array<{ id: string; requiredRouteDefinitionIds?: string[]; requiredTransportModeIds?: string[] }>;
    missionLifecycleStateDefinitions?: Array<{ id: string; allowedTransitions?: string[]; terminal?: boolean }>;
    expeditionLifecycleStateDefinitions?: Array<{ id: string; allowedTransitions?: string[]; missionStateHint?: string; terminal?: boolean }>;
    missionObjectiveContractDefinitions?: Array<{ id: string; requiredActionIds?: string[] }>;
    missionRewardContractDefinitions?: Array<{ id: string; allowedForMissionTypeIds?: string[]; gameOwnsClaimState?: boolean }>;
    missionTemplateDefinitions?: Array<{ id: string; missionTypeId?: string; expeditionScopeId?: string; objectiveTypeIds?: string[]; rewardTypeIds?: string[] }>;
    expeditionRequirementDefinitions?: Array<{ id: string; resourceIds?: string[]; actionIds?: string[]; routeDefinitionIds?: string[]; transportModeIds?: string[]; gameOwnsAssignmentState?: boolean }>;
    expeditionRiskDefinitions?: Array<{ id: string; appliesToScopeIds?: string[]; mitigationRequirementIds?: string[] }>;
    integrationHooks?: Array<{ id: string; referencedIds?: string[]; required?: boolean }>;
    missionExpeditionPresentationContract?: Array<{ id: string; rendererIndependent?: boolean }>;
    creativeProductionRequirements?: Array<{ id: string; category?: string }>;
    assetLibraryCategories?: Array<{ id: string; groups?: string[] }>;
    missingCanonicalDefinitions?: Array<{ id: string; type?: string }>;
  };
  dynamicEventFramework?: {
    id?: string;
    architectureDecisionId?: string;
    populationSimulationIntegration?: { implemented?: boolean; hookOnly?: boolean; populationSimulationFrameworkId?: string; dependencyGap?: string; hooks?: string[] };
    activePlayerStatePolicy?: Record<string, boolean | undefined>;
    eventCategoryDefinitions?: Array<{ id: string; sourceSystemIds?: string[] }>;
    eventTypeDefinitions?: Array<{ id: string }>;
    eventLifecycleStateDefinitions?: Array<{ id: string; allowedTransitions?: string[]; terminal?: boolean }>;
    eventDefinitions?: Array<{ id: string; categoryId?: string; eventTypeId?: string; triggerPolicyIds?: string[]; eligibilityIds?: string[]; probabilityPolicyId?: string; deterministicSeedPolicyId?: string; severityId?: string; durationClassId?: string; phaseIds?: string[]; effectTypeIds?: string[]; choiceIds?: string[]; resolutionPolicyIds?: string[]; failurePolicyIds?: string[]; followUpEventIds?: string[]; missionHookTemplateIds?: string[]; actionReferenceIds?: string[]; timelineSignificanceId?: string; publicDescription?: string }>;
    eventTriggerPolicies?: Array<{ id: string; canonicalReasonCode?: string; protectedResolutionRequired?: boolean }>;
    eventEligibilityDefinitions?: Array<{ id: string; blockerReasonCodes?: string[]; knowledgeSafe?: boolean }>;
    eventProbabilityPolicies?: Array<{ id: string; deterministic?: boolean }>;
    eventDeterministicSeedPolicies?: Array<{ id: string; forbidsUncontrolledRandom?: boolean; seedInputs?: string[] }>;
    eventSeverityDefinitions?: Array<{ id: string }>;
    eventDurationClasses?: Array<{ id: string }>;
    eventPhaseDefinitions?: Array<{ id: string; defaultDurationClassId?: string }>;
    eventEffectDefinitions?: Array<{ id: string; studioMutatesPlayerState?: boolean }>;
    eventChoiceDefinitions?: Array<{ id: string; actionIds?: string[]; outcomeEffectTypeIds?: string[]; timelinePolicyId?: string; irreversible?: boolean; requiresPlayerConfirmation?: boolean }>;
    eventResolutionPolicies?: Array<{ id: string; gameOwnsResolvedOutcome?: boolean; protectedOutcome?: boolean }>;
    eventFailurePolicies?: Array<{ id: string; recoveryChoiceIds?: string[]; missionHookIds?: string[] }>;
    eventChainDefinitions?: Array<{ id: string; eventIds?: string[]; branchEventIds?: string[]; terminalEventIds?: string[] }>;
    eventReasonCodes?: Array<{ id: string; blocker?: boolean }>;
    eventKnowledgeVisibility?: Array<{ id: string; knowledgeStateId?: string; canShowName?: boolean; canShowResources?: boolean; canShowArtifacts?: boolean; canShowLifeforms?: boolean; fallbackText?: string }>;
    eventTimelineSignificancePolicies?: Array<{ id: string; createsTimelineDefinition?: boolean }>;
    eventPresentationContract?: Array<{ id: string; rendererIndependent?: boolean }>;
    offlinePolicies?: Array<{ id: string; behavior?: string }>;
    aiAgentRules?: string[];
    creativeProductionRequirements?: Array<{ id: string; category?: string }>;
    assetLibraryCategories?: Array<{ id: string; groups?: string[] }>;
    encyclopediaSections?: Array<{ id: string }>;
    provisionalBalanceValues?: Array<{ id: string }>;
    missingCanonicalDefinitions?: Array<{ id: string; type?: string }>;
  };
  populationSimulationFramework?: {
    id?: string;
    architectureDecisionId?: string;
    activePlayerStatePolicy?: Record<string, boolean | undefined>;
    populationCategoryDefinitions?: Array<{ id: string; kind?: string }>;
    populationLifeStageDefinitions?: Array<{ id: string }>;
    populationWorkforceRoleDefinitions?: Array<{ id: string }>;
    populationSpecialistRoleDefinitions?: Array<{ id: string }>;
    populationGrowthDefinitions?: Array<{ id: string }>;
    populationCapacityDefinitions?: Array<{ id: string }>;
    populationNeedDefinitions?: Array<{ id: string }>;
    populationWellbeingBands?: Array<{ id: string }>;
    populationMigrationDefinitions?: Array<{ id: string }>;
    workforceAssignmentDefinitions?: Array<{ id: string }>;
    automationSubstitutionPolicies?: Array<{ id: string }>;
    populationShortageReasonCodes?: Array<{ id: string }>;
    populationPresentationContract?: Array<{ id: string; rendererIndependent?: boolean }>;
  };
  upgradeCategories?: Array<{ id: string }>;
  upgrades?: Array<{ id: string; categoryId?: string; tabId?: string; eraId?: string; costResourceId?: string | null; costEconomyId?: string | null }>;
  buildingLibrary?: Array<{ id: string }>;
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

function validateCivilizationProgressionFramework(payload: RuntimePayload | RobloxPayload, label: string) {
  const framework = payload.civilizationProgressionFramework;
  const actionIds = new Set(payload.actionSystem?.actionDefinitions?.map((action) => action.id) ?? []);
  const expectedStages = ["survival", "settlement", "planetary", "interplanetary", "interstellar", "galactic", "intergalactic", "ascendant"];
  const stageIds = new Set(framework?.civilizationStages?.map((stage) => stage.id) ?? []);
  const dimensionIds = new Set(framework?.developmentScores?.map((dimension) => dimension.id) ?? []);
  const requirementIds = new Set(framework?.civilizationStageRequirements?.map((requirement) => requirement.id) ?? []);
  const milestoneIds = (framework?.civilizationMilestones ?? []).map((milestone) => milestone.id);
  const canonicalSystems = new Set(["actions", "ai_agents", "colonies", "discovery", "economy", "exploration", "infrastructure", "logistics", "megastructures", "planet_development", "research", "trade", "travel", "universal_discovery_registry"]);

  assert(framework?.id === "civilization_progression_framework_v1", `${label} must publish civilization_progression_framework_v1.`);
  assert(framework?.actionSystemId === payload.actionSystem?.id, `${label} Civilization Progression Framework must reference Action System.`);
  assert(framework?.planetDevelopmentFrameworkId === payload.planetDevelopmentFramework?.id, `${label} Civilization Progression Framework must reference Planet Development Framework.`);
  assert(framework?.civilizationIdentitySource === "civilization_identity", `${label} Civilization Progression Framework must reference Civilization Identity.`);
  assert(framework?.progressionPolicy?.xpAllowed === false, `${label} Civilization Progression must explicitly forbid XP.`);
  assert(framework?.progressionPolicy?.deterministic === true, `${label} Civilization Progression must be deterministic.`);
  assert(framework?.progressionPolicy?.playerInstancesExported === false, `${label} Civilization Progression must not export player instances.`);
  assert((framework?.developmentScores?.length ?? 0) === 10, `${label} must publish ten civilization development dimensions.`);
  assert((framework?.scoreBands?.length ?? 0) >= 6, `${label} must publish development score bands.`);
  assert(framework?.civilizationStages?.map((stage) => stage.id).join("|") === expectedStages.join("|"), `${label} civilization stage order is invalid.`);
  assert((framework?.civilizationMilestones?.length ?? 0) >= 10, `${label} must publish milestone definitions.`);
  assert((framework?.civilizationProgressionPresentation?.length ?? 0) >= 7, `${label} must publish progression presentation contracts.`);

  const duplicateMilestones = milestoneIds.filter((id, index) => milestoneIds.indexOf(id) !== index);
  assert(!duplicateMilestones.length, `${label} milestone IDs must be unique: ${duplicateMilestones.join(", ")}.`);
  for (const required of ["first_colony", "first_orbital_colony", "first_trade_route", "first_garden_world", "first_terraforming_project", "first_ai_governor", "first_megastructure", "first_million_population", "first_galaxy_survey", "first_civilization_identity_milestone"]) {
    assert(milestoneIds.includes(required), `${label} is missing progression milestone ${required}.`);
  }

  for (const dimension of framework?.developmentScores ?? []) {
    assert(dimension.calculationVersion === framework?.calculationVersion, `${label} dimension ${dimension.id} calculation version mismatch.`);
    assert(dimension.deterministic === true, `${label} dimension ${dimension.id} must be deterministic.`);
    assert(dimension.scoreRange?.min === 0 && dimension.scoreRange.max === 100, `${label} dimension ${dimension.id} must be normalized 0-100.`);
  }
  for (const requirement of framework?.civilizationStageRequirements ?? []) {
    assert(Boolean(requirement.stageId && stageIds.has(requirement.stageId)), `${label} requirement ${requirement.id} stage does not resolve.`);
    for (const dimensionId of requirement.dimensionIds ?? []) {
      assert(dimensionIds.has(dimensionId), `${label} requirement ${requirement.id} dimension ${dimensionId} does not resolve.`);
    }
    if (requirement.requirementType === "completed_action") {
      for (const actionId of requirement.requiredIds ?? []) {
        assert(actionIds.has(actionId), `${label} requirement ${requirement.id} action ${actionId} does not resolve.`);
      }
    }
  }
  for (const stage of framework?.civilizationStages ?? []) {
    for (const requirementId of stage.requirementIds ?? []) {
      assert(requirementIds.has(requirementId), `${label} stage ${stage.id} requirement ${requirementId} does not resolve.`);
    }
    for (const actionId of stage.availableActionIds ?? []) {
      assert(actionIds.has(actionId), `${label} stage ${stage.id} action ${actionId} does not resolve.`);
    }
    for (const systemId of stage.unlockedSystemIds ?? []) {
      assert(canonicalSystems.has(systemId), `${label} stage ${stage.id} system ${systemId} is not canonical.`);
    }
  }
  for (const milestone of framework?.civilizationMilestones ?? []) {
    assert(milestone.deterministic === true, `${label} milestone ${milestone.id} must be deterministic.`);
    for (const requirementId of milestone.requirementIds ?? []) {
      assert(requirementIds.has(requirementId), `${label} milestone ${milestone.id} requirement ${requirementId} does not resolve.`);
    }
    for (const dimensionId of milestone.contributesToDimensionIds ?? []) {
      assert(dimensionIds.has(dimensionId), `${label} milestone ${milestone.id} dimension ${dimensionId} does not resolve.`);
    }
    for (const systemId of milestone.unlockedSystemIds ?? []) {
      assert(canonicalSystems.has(systemId), `${label} milestone ${milestone.id} system ${systemId} is not canonical.`);
    }
  }
  for (const presentation of framework?.civilizationProgressionPresentation ?? []) {
    assert(presentation.rendererIndependent === true, `${label} presentation ${presentation.id} must be renderer-independent.`);
    assert((presentation.semanticFields?.length ?? 0) > 0, `${label} presentation ${presentation.id} must publish semantic fields.`);
  }
  assert(!/experiencePoints|rpgLevel|currentStage|completedMilestoneIds|playerProgression|playerBalances|\/Users\//i.test(JSON.stringify(framework)), `${label} Civilization Progression Framework leaked XP, player state, or private paths.`);
}

function validateColonizationFramework(payload: RuntimePayload | RobloxPayload, label: string) {
  const framework = payload.colonizationFramework;
  const actionIds = new Set(payload.actionSystem?.actionDefinitions?.map((action) => action.id) ?? []);
  const phaseIds = new Set(payload.actionSystem?.actionPhaseTemplates?.map((phase) => phase.id) ?? []);
  const durationIds = new Set(payload.actionSystem?.actionDurationDefinitions?.map((duration) => duration.id) ?? []);
  const resourceIds = new Set(payload.resources?.map((resource) => resource.id) ?? []);
  const buildingIds = new Set(payload.buildingLibrary?.map((building) => building.id) ?? []);
  const colonyTypeIds = new Set(framework?.colonyTypeDefinitions?.map((type) => type.id) ?? []);
  const focusIds = new Set(framework?.colonyFocusDefinitions?.map((focus) => focus.id) ?? []);
  const capabilityIds = new Set(framework?.colonyCapabilityDefinitions?.map((capability) => capability.id) ?? []);
  const noSolidSurface = new Set(["Gas Giant", "Ice Giant", "Asteroid Belt"]);

  assert(framework?.id === "colonization_settlement_framework_v1", `${label} must publish colonization_settlement_framework_v1.`);
  assert(framework?.actionSystemId === payload.actionSystem?.id, `${label} Colonization Framework must reference Action System.`);
  assert(framework?.planetDevelopmentFrameworkId === payload.planetDevelopmentFramework?.id, `${label} Colonization Framework must reference Planet Development Framework.`);
  assert(framework?.civilizationProgressionFrameworkId === payload.civilizationProgressionFramework?.id, `${label} Colonization Framework must reference Civilization Progression Framework.`);
  assert(framework?.activePlayerStatePolicy?.exportsActiveColonies === false, `${label} must not export active player colonies.`);
  assert(framework?.activePlayerStatePolicy?.exportsProjectQueues === false, `${label} must not export project queues.`);
  assert(framework?.activePlayerStatePolicy?.exportsTimestamps === false, `${label} must not export timestamps.`);
  assert(framework?.activePlayerStatePolicy?.exportsPlayerPopulationAssignments === false, `${label} must not export player population assignments.`);
  assert(framework?.activePlayerStatePolicy?.exportsTransferredResources === false, `${label} must not export transferred resources.`);
  assert(framework?.resolverContract?.id === "resolveColonizationEligibility", `${label} resolver contract missing.`);
  assert(framework?.resolverContract?.deterministic === true, `${label} resolver must be deterministic.`);
  assert((framework?.resolverContract?.inputFields?.length ?? 0) >= 10, `${label} resolver input fields are incomplete.`);
  assert((framework?.resolverContract?.returnFields?.length ?? 0) >= 7, `${label} resolver return fields are incomplete.`);

  assert((framework?.colonyTypeDefinitions?.length ?? 0) === 17, `${label} must publish 17 colony types.`);
  assert((framework?.colonizationEligibilityDefinitions?.length ?? 0) === 7, `${label} must publish seven eligibility states.`);
  assert((framework?.colonizationReasonCodes?.length ?? 0) >= 11, `${label} must publish canonical colonization reason codes.`);
  assert((framework?.colonyProjectPhaseDefinitions?.length ?? 0) === 12, `${label} must publish 12 colonization phases.`);
  assert((framework?.colonyResourcePackageDefinitions?.length ?? 0) === 5, `${label} must publish five resource packages.`);
  assert((framework?.colonyPopulationRequirementDefinitions?.length ?? 0) === 17, `${label} must publish population requirements for each type.`);
  assert((framework?.colonyInitialStateTemplates?.length ?? 0) === 17, `${label} must publish initial state templates for each type.`);
  assert((framework?.colonyDevelopmentStages?.length ?? 0) === 12, `${label} must publish 12 colony development stages.`);
  assert((framework?.colonyFocusDefinitions?.length ?? 0) === 14, `${label} must publish 14 colony focuses.`);
  assert((framework?.colonyPresentationContract?.length ?? 0) === 13, `${label} must publish 13 presentation contracts.`);

  for (const required of ["primary_colony", "secondary_colony", "frontier_colony", "mining_colony", "research_colony", "agricultural_colony", "industrial_colony", "trade_colony", "logistics_hub", "orbital_colony", "floating_colony", "subsurface_colony", "fuel_depot", "archaeological_outpost", "preservation_station", "terraforming_base", "automated_outpost"]) {
    assert(colonyTypeIds.has(required), `${label} is missing colony type ${required}.`);
  }
  for (const required of ["no_solid_surface", "insufficient_technology", "insufficient_population", "insufficient_logistics", "protected_ecology", "precursor_quarantine", "extreme_hazard", "no_habitation_support", "missing_colony_ship", "missing_resource_allocation", "progression_stage_locked"]) {
    assert(framework?.colonizationReasonCodes?.some((reason) => reason.id === required), `${label} is missing colonization reason code ${required}.`);
  }
  for (const required of ["planning", "site_selection", "resource_allocation", "population_assignment", "transport_preparation", "transit", "landing_or_orbital_insertion", "site_preparation", "initial_habitat_construction", "life_support_activation", "infrastructure_commissioning", "operational"]) {
    assert(framework?.colonyProjectPhaseDefinitions?.some((phase) => phase.id === required), `${label} is missing colonization phase ${required}.`);
  }
  for (const phase of framework?.colonyProjectPhaseDefinitions ?? []) {
    assert(phase.canonicalActionPhaseId && phaseIds.has(phase.canonicalActionPhaseId), `${label} phase ${phase.id} action phase does not resolve.`);
    assert(phase.durationDefinitionId && durationIds.has(phase.durationDefinitionId), `${label} phase ${phase.id} duration does not resolve.`);
  }

  const nonSurfaceOptions = ["orbital_colony", "floating_colony", "fuel_depot", "preservation_station", "automated_outpost"];
  for (const type of framework?.colonyTypeDefinitions ?? []) {
    for (const actionId of type.allowedActionIds ?? []) {
      assert(actionIds.has(actionId), `${label} colony type ${type.id} action ${actionId} does not resolve.`);
    }
    assert(type.defaultDevelopmentFocus && focusIds.has(type.defaultDevelopmentFocus), `${label} colony type ${type.id} focus does not resolve.`);
    for (const resourceId of type.requiredResources ?? []) {
      assert(resourceIds.has(resourceId), `${label} colony type ${type.id} resource ${resourceId} does not resolve.`);
    }
    for (const buildingId of type.requiredBuildings ?? []) {
      assert(buildingIds.has(buildingId), `${label} colony type ${type.id} building ${buildingId} does not resolve.`);
    }
    if (!nonSurfaceOptions.includes(type.id)) {
      assert((type.supportedBodyClasses ?? []).every((bodyClass) => !noSolidSurface.has(bodyClass)), `${label} surface colony type ${type.id} supports no-solid-surface body.`);
    }
    for (const alignmentId of type.civilizationIdentityInfluence?.alignmentIds ?? []) {
      assert(["Industry", "Technology", "Cyber", "Nature", "Corporate"].includes(alignmentId), `${label} colony type ${type.id} identity alignment ${alignmentId} does not resolve.`);
    }
  }
  for (const typeId of nonSurfaceOptions) {
    const type = framework?.colonyTypeDefinitions?.find((candidate) => candidate.id === typeId);
    assert(type?.supportedBodyClasses?.some((bodyClass) => noSolidSurface.has(bodyClass)), `${label} ${typeId} must support no-solid-surface bodies.`);
  }

  for (const packageDefinition of framework?.colonyResourcePackageDefinitions ?? []) {
    assert((packageDefinition.resourceInputs?.length ?? 0) >= 9, `${label} package ${packageDefinition.id} has incomplete inputs.`);
    for (const input of packageDefinition.resourceInputs ?? []) {
      assert(resourceIds.has(input.resourceId), `${label} package ${packageDefinition.id} resource ${input.resourceId} does not resolve.`);
      assert(Number.isFinite(input.quantity) && input.quantity > 0, `${label} package ${packageDefinition.id} input ${input.role} quantity is invalid.`);
    }
  }
  for (const starterSet of framework?.colonyStarterSetDefinitions ?? []) {
    assert(starterSet.colonyTypeId && colonyTypeIds.has(starterSet.colonyTypeId), `${label} starter set ${starterSet.id} colony type does not resolve.`);
    for (const role of starterSet.buildingRoles ?? []) {
      if (role.buildingId) assert(buildingIds.has(role.buildingId), `${label} starter set ${starterSet.id} building ${role.buildingId} does not resolve.`);
    }
  }
  for (const template of framework?.colonyInitialStateTemplates ?? []) {
    assert(template.colonyTypeId && colonyTypeIds.has(template.colonyTypeId), `${label} initial template ${template.id} colony type does not resolve.`);
    assert(template.operationalStatus === "operational", `${label} initial template ${template.id} must be operational after completion.`);
    assert((template.hazardModifierIds?.length ?? 0) >= 5, `${label} initial template ${template.id} must include hazard hooks.`);
    assert((template.maintenanceCategoryIds?.length ?? 0) >= 5, `${label} initial template ${template.id} must include maintenance hooks.`);
  }
  for (const focus of framework?.colonyFocusDefinitions ?? []) {
    for (const actionId of focus.recommendedActionIds ?? []) {
      assert(actionIds.has(actionId), `${label} focus ${focus.id} action ${actionId} does not resolve.`);
    }
  }
  for (const stage of framework?.colonyDevelopmentStages ?? []) {
    assert((stage.requirements?.length ?? 0) >= 3, `${label} development stage ${stage.id} must publish deterministic requirements.`);
  }
  for (const policy of framework?.colonyFailurePolicies ?? []) {
    assert(policy.historicalRecord === true, `${label} failure policy ${policy.id} must preserve history.`);
  }
  for (const contract of framework?.colonyPresentationContract ?? []) {
    assert(contract.rendererIndependent === true, `${label} presentation contract ${contract.id} must be renderer-independent.`);
  }
  assert(framework?.creativeProductionRequirements?.some((item) => item.category === "Colonization & Settlements"), `${label} must publish Creative Production colonization requirements.`);
  assert(framework?.assetLibraryCategories?.some((category) => category.id === "colonization_settlements" && (category.groups?.length ?? 0) >= 8), `${label} must publish Asset Library colonization category.`);
  assert(framework?.missingCanonicalDefinitions?.some((item) => item.type === "transport"), `${label} must report missing transport canonical definitions.`);
  assert(!/activePlayerColony|activeColonyInstance|projectStartedAt|projectCompletedAt|queueContents|livePlayerPopulation|assignedPlayerPopulation|liveTransferredResources|saveId|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} Colonization Framework leaked player state or private paths.`);
}

function validateResourceEconomyLogisticsFramework(payload: RuntimePayload | RobloxPayload, label: string) {
  const framework = payload.resourceEconomyLogisticsFramework;
  const resourceIds = new Set(payload.resources?.map((resource) => resource.id) ?? []);
  const actionIds = new Set(payload.actionSystem?.actionDefinitions?.map((action) => action.id) ?? []);
  const durationIds = new Set(payload.actionSystem?.actionDurationDefinitions?.map((duration) => duration.id) ?? []);
  const buildingIds = new Set(payload.buildingLibrary?.map((building) => building.id) ?? []);
  const nodeIds = new Set(framework?.economyNodeTypeDefinitions?.map((node) => node.id) ?? []);
  const storageIds = new Set(framework?.resourceStorageDefinitions?.map((storage) => storage.id) ?? []);
  const transportIds = new Set(framework?.transportModeDefinitions?.map((transport) => transport.id) ?? []);
  const routeIds = new Set(framework?.logisticsRouteDefinitions?.map((route) => route.id) ?? []);
  const policyIds = new Set(framework?.lossAndWastePolicies?.map((policy) => policy.id) ?? []);
  const recipeIds = new Set([...(framework?.processingRecipeDefinitions ?? []), ...(framework?.manufacturingRecipeDefinitions ?? [])].map((recipe) => recipe.id));
  const conditionIds = new Set(framework?.economyConditionStateDefinitions?.map((condition) => condition.id) ?? []);
  const priorityIds = new Set(framework?.economyPriorityDefinitions?.map((priority) => priority.id) ?? []);
  const shipmentStateIds = new Set(framework?.shipmentStateDefinitions?.map((state) => state.id) ?? []);
  const packageIds = new Set(payload.colonizationFramework?.colonyResourcePackageDefinitions?.map((item) => item.id) ?? []);
  const colonyPhaseIds = new Set(payload.colonizationFramework?.colonyProjectPhaseDefinitions?.map((item) => item.id) ?? []);

  assert(framework?.id === "resource_economy_logistics_framework_v1", `${label} must publish resource_economy_logistics_framework_v1.`);
  assert(framework?.architectureDecisionId === "ARCH-DECISION-RESOURCE-ECONOMY-LOGISTICS-NETWORK", `${label} Resource Economy & Logistics architecture decision mismatch.`);
  assert(framework?.activePlayerStatePolicy && Object.values(framework.activePlayerStatePolicy).every((value) => value === false), `${label} must not export player economy/logistics state.`);
  assert((framework?.resourceFlowDefinitions?.length ?? 0) === resourceIds.size, `${label} must publish exactly one resource flow per Resource Catalog item.`);
  assert((framework?.economyNodeTypeDefinitions?.length ?? 0) === 28, `${label} must publish 28 economy node types.`);
  assert((framework?.resourceExtractionDefinitions?.length ?? 0) === 14, `${label} must publish 14 extraction definitions.`);
  assert((framework?.resourceStorageDefinitions?.length ?? 0) === 16, `${label} must publish 16 storage definitions.`);
  assert((framework?.transportModeDefinitions?.length ?? 0) === 16, `${label} must publish 16 transport modes.`);
  assert((framework?.logisticsRouteDefinitions?.length ?? 0) === 13, `${label} must publish 13 route definitions.`);
  assert((framework?.shipmentStateDefinitions?.length ?? 0) === 14, `${label} must publish 14 shipment states.`);
  assert((framework?.throughputDefinitions ?? []).every((throughput) => throughput.bounded === true), `${label} throughput definitions must be bounded.`);
  assert((framework?.marketTradeIntegration ?? []).every((market) => market.gameOwnsOrders === true), `${label} market orders must remain Game-owned.`);

  for (const flow of framework?.resourceFlowDefinitions ?? []) {
    assert(flow.resourceId && resourceIds.has(flow.resourceId), `${label} flow ${flow.id} resource does not resolve.`);
    for (const id of [...flow.sourceNodeTypes ?? [], ...flow.destinationNodeTypes ?? []]) assert(nodeIds.has(id), `${label} flow ${flow.id} node ${id} does not resolve.`);
    for (const id of flow.storageDefinitionIds ?? []) assert(storageIds.has(id), `${label} flow ${flow.id} storage ${id} does not resolve.`);
    for (const id of flow.transportModeIds ?? []) assert(transportIds.has(id), `${label} flow ${flow.id} transport ${id} does not resolve.`);
    assert(flow.lossPolicyId && policyIds.has(flow.lossPolicyId), `${label} flow ${flow.id} loss policy does not resolve.`);
    assert(flow.wastePolicyId && policyIds.has(flow.wastePolicyId), `${label} flow ${flow.id} waste policy does not resolve.`);
  }
  for (const extraction of framework?.resourceExtractionDefinitions ?? []) {
    assert(extraction.actionId && actionIds.has(extraction.actionId), `${label} extraction ${extraction.id} action does not resolve.`);
    assert(extraction.durationDefinitionId && durationIds.has(extraction.durationDefinitionId), `${label} extraction ${extraction.id} duration does not resolve.`);
    for (const id of extraction.buildingRequirementIds ?? []) assert(buildingIds.has(id), `${label} extraction ${extraction.id} building ${id} does not resolve.`);
    for (const id of extraction.byproductResourceIds ?? []) assert(resourceIds.has(id), `${label} extraction ${extraction.id} byproduct ${id} does not resolve.`);
    assert(extraction.wastePolicyId && policyIds.has(extraction.wastePolicyId), `${label} extraction ${extraction.id} waste policy does not resolve.`);
  }
  for (const transport of framework?.transportModeDefinitions ?? []) {
    for (const id of transport.supportedRouteScopes ?? []) assert(routeIds.has(id), `${label} transport ${transport.id} route ${id} does not resolve.`);
    for (const id of transport.fuelRequirementIds ?? []) assert(resourceIds.has(id), `${label} transport ${transport.id} fuel ${id} does not resolve.`);
    for (const id of transport.actionIds ?? []) assert(actionIds.has(id), `${label} transport ${transport.id} action ${id} does not resolve.`);
    assert(transport.lossPolicyId && policyIds.has(transport.lossPolicyId), `${label} transport ${transport.id} loss policy does not resolve.`);
  }
  for (const route of framework?.logisticsRouteDefinitions ?? []) {
    assert(route.deterministic === true, `${label} route ${route.id} must be deterministic.`);
    assert((route.throughput ?? 0) > 0 && (route.capacity ?? 0) > 0, `${label} route ${route.id} must have bounded positive throughput and capacity.`);
    assert(route.queuePolicyId === "queue_logistics", `${label} route ${route.id} must use queue_logistics.`);
    for (const id of [...route.sourceNodeRequirements ?? [], ...route.destinationNodeRequirements ?? []]) assert(nodeIds.has(id), `${label} route ${route.id} node ${id} does not resolve.`);
    for (const id of route.validTransportModeIds ?? []) assert(transportIds.has(id), `${label} route ${route.id} transport ${id} does not resolve.`);
    for (const id of route.routeActionIds ?? []) assert(actionIds.has(id), `${label} route ${route.id} action ${id} does not resolve.`);
  }
  for (const state of framework?.shipmentStateDefinitions ?? []) {
    for (const id of state.allowedTransitions ?? []) assert(shipmentStateIds.has(id), `${label} shipment state ${state.id} transition ${id} does not resolve.`);
  }
  for (const recipe of [...framework?.processingRecipeDefinitions ?? [], ...framework?.manufacturingRecipeDefinitions ?? []]) {
    for (const item of [...recipe.inputItems ?? [], ...recipe.outputItems ?? [], ...recipe.byproducts ?? [], ...recipe.wasteOutputs ?? []]) assert(resourceIds.has(item.resourceId), `${label} recipe ${recipe.id} resource ${item.resourceId} does not resolve.`);
    for (const id of recipe.requiredBuildingIds ?? []) assert(buildingIds.has(id), `${label} recipe ${recipe.id} building ${id} does not resolve.`);
    assert(recipe.actionId && actionIds.has(recipe.actionId), `${label} recipe ${recipe.id} action does not resolve.`);
    assert(recipe.durationDefinitionId && durationIds.has(recipe.durationDefinitionId), `${label} recipe ${recipe.id} duration does not resolve.`);
  }
  for (const chain of framework?.productionChainDefinitions ?? []) {
    for (const stage of chain.stages ?? []) {
      assert(stage.recipeId && recipeIds.has(stage.recipeId), `${label} chain ${chain.id} recipe ${stage.recipeId} does not resolve.`);
      for (const id of [...stage.inputResourceIds ?? [], ...stage.outputResourceIds ?? []]) assert(resourceIds.has(id), `${label} chain ${chain.id} resource ${id} does not resolve.`);
      for (const id of stage.nodeTypeIds ?? []) assert(nodeIds.has(id), `${label} chain ${chain.id} node ${id} does not resolve.`);
    }
    for (const id of chain.storageRequirementIds ?? []) assert(storageIds.has(id), `${label} chain ${chain.id} storage ${id} does not resolve.`);
    for (const id of chain.transportRequirementIds ?? []) assert(transportIds.has(id), `${label} chain ${chain.id} transport ${id} does not resolve.`);
    for (const id of chain.bottleneckDefinitionIds ?? []) assert(conditionIds.has(id), `${label} chain ${chain.id} bottleneck ${id} does not resolve.`);
  }
  for (const definition of framework?.supplyDemandDefinitions ?? []) {
    assert(definition.priorityId && priorityIds.has(definition.priorityId), `${label} supply/demand ${definition.id} priority does not resolve.`);
    for (const id of definition.affectedActionIds ?? []) assert(actionIds.has(id), `${label} supply/demand ${definition.id} action ${id} does not resolve.`);
  }
  for (const shortage of framework?.economyShortageReasonCodes ?? []) assert(shortage.stateId && conditionIds.has(shortage.stateId), `${label} shortage reason ${shortage.id} state does not resolve.`);
  for (const policy of framework?.recyclingPolicies ?? []) {
    assert(policy.actionId && actionIds.has(policy.actionId), `${label} recycling policy ${policy.id} action does not resolve.`);
    assert(policy.wastePolicyId && policyIds.has(policy.wastePolicyId), `${label} recycling policy ${policy.id} waste policy does not resolve.`);
  }
  for (const market of framework?.marketTradeIntegration ?? []) for (const id of market.tradeActionIds ?? []) assert(actionIds.has(id), `${label} market ${market.id} action ${id} does not resolve.`);
  for (const id of framework?.colonizationIntegration?.colonyResourcePackageIds ?? []) assert(packageIds.has(id), `${label} colonization package ${id} does not resolve.`);
  for (const id of framework?.colonizationIntegration?.requiredPhaseIds ?? []) assert(colonyPhaseIds.has(id), `${label} colonization phase ${id} does not resolve.`);
  for (const id of framework?.colonizationIntegration?.requiredRouteDefinitionIds ?? []) assert(routeIds.has(id), `${label} colonization route ${id} does not resolve.`);
  for (const id of framework?.colonizationIntegration?.requiredTransportModeIds ?? []) assert(transportIds.has(id), `${label} colonization transport ${id} does not resolve.`);
  for (const hook of framework?.actionIntegrationHooks ?? []) if (hook.required) assert(hook.actionId && actionIds.has(hook.actionId), `${label} action hook ${hook.id} does not resolve.`);
  assert(framework?.colonizationIntegration?.requiredRouteDefinitionIds?.includes("colonization_supply_route"), `${label} colonization supply route missing.`);
  assert(!/"(?:playerInventories|activeShipments|marketOrders|liveStockpiles|routeInstances|transportAssignments)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} Resource Economy & Logistics Framework leaked player state or private paths.`);
}

function validateMissionExpeditionFramework(payload: RuntimePayload | RobloxPayload, label: string) {
  const framework = payload.missionExpeditionFramework;
  const resourceIds = new Set(payload.resources?.map((resource) => resource.id) ?? []);
  const actionIds = new Set(payload.actionSystem?.actionDefinitions?.map((action) => action.id) ?? []);
  const routeIds = new Set(payload.resourceEconomyLogisticsFramework?.logisticsRouteDefinitions?.map((route) => route.id) ?? []);
  const transportIds = new Set(payload.resourceEconomyLogisticsFramework?.transportModeDefinitions?.map((transport) => transport.id) ?? []);
  const missionTypeIds = new Set(framework?.missionTypeDefinitions?.map((definition) => definition.id) ?? []);
  const scopeIds = new Set(framework?.expeditionScopeDefinitions?.map((definition) => definition.id) ?? []);
  const objectiveIds = new Set(framework?.missionObjectiveContractDefinitions?.map((definition) => definition.id) ?? []);
  const rewardIds = new Set(framework?.missionRewardContractDefinitions?.map((definition) => definition.id) ?? []);
  const missionStateIds = new Set(framework?.missionLifecycleStateDefinitions?.map((definition) => definition.id) ?? []);
  const expeditionStateIds = new Set(framework?.expeditionLifecycleStateDefinitions?.map((definition) => definition.id) ?? []);
  const requirementIds = new Set(framework?.expeditionRequirementDefinitions?.map((definition) => definition.id) ?? []);

  assert(framework?.id === "mission_expedition_framework_v1", `${label} must publish mission_expedition_framework_v1.`);
  assert(framework?.architectureDecisionId === "ARCH-DECISION-MISSION-EXPEDITION-FRAMEWORK", `${label} Mission & Expedition architecture decision mismatch.`);
  assert(framework?.activePlayerStatePolicy && Object.values(framework.activePlayerStatePolicy).every((value) => value === false), `${label} must not export player mission/expedition state.`);
  assert((framework?.missionTypeDefinitions?.length ?? 0) === 10, `${label} must publish 10 mission type definitions.`);
  assert((framework?.expeditionScopeDefinitions?.length ?? 0) === 6, `${label} must publish 6 expedition scopes.`);
  assert((framework?.missionLifecycleStateDefinitions?.length ?? 0) === 10, `${label} must publish 10 mission lifecycle states.`);
  assert((framework?.expeditionLifecycleStateDefinitions?.length ?? 0) === 11, `${label} must publish 11 expedition lifecycle states.`);
  assert((framework?.missionObjectiveContractDefinitions?.length ?? 0) === 20, `${label} must publish 20 mission objective contracts.`);
  assert((framework?.missionRewardContractDefinitions?.length ?? 0) === 12, `${label} must publish 12 mission reward contracts.`);
  assert((framework?.missionTemplateDefinitions?.length ?? 0) === 6, `${label} must publish 6 mission templates.`);
  assert((framework?.expeditionRequirementDefinitions?.length ?? 0) === 5, `${label} must publish 5 expedition requirements.`);
  assert((framework?.expeditionRiskDefinitions?.length ?? 0) === 3, `${label} must publish 3 expedition risks.`);
  assert((framework?.integrationHooks?.length ?? 0) === 9, `${label} must publish integration hooks for dependent systems.`);

  for (const type of framework?.missionTypeDefinitions ?? []) {
    for (const id of type.expeditionScopeIds ?? []) assert(scopeIds.has(id), `${label} mission type ${type.id} scope ${id} does not resolve.`);
    for (const id of type.defaultObjectiveTypeIds ?? []) assert(objectiveIds.has(id), `${label} mission type ${type.id} objective ${id} does not resolve.`);
    for (const id of type.defaultRewardTypeIds ?? []) assert(rewardIds.has(id), `${label} mission type ${type.id} reward ${id} does not resolve.`);
    for (const id of type.requiredActionIds ?? []) assert(actionIds.has(id), `${label} mission type ${type.id} action ${id} does not resolve.`);
  }
  for (const scope of framework?.expeditionScopeDefinitions ?? []) {
    for (const id of scope.requiredRouteDefinitionIds ?? []) assert(routeIds.has(id), `${label} expedition scope ${scope.id} route ${id} does not resolve.`);
    for (const id of scope.requiredTransportModeIds ?? []) assert(transportIds.has(id), `${label} expedition scope ${scope.id} transport ${id} does not resolve.`);
  }
  for (const state of framework?.missionLifecycleStateDefinitions ?? []) for (const id of state.allowedTransitions ?? []) assert(missionStateIds.has(id), `${label} mission state ${state.id} transition ${id} does not resolve.`);
  for (const state of framework?.expeditionLifecycleStateDefinitions ?? []) {
    assert(state.missionStateHint && missionStateIds.has(state.missionStateHint), `${label} expedition state ${state.id} mission hint does not resolve.`);
    for (const id of state.allowedTransitions ?? []) assert(expeditionStateIds.has(id), `${label} expedition state ${state.id} transition ${id} does not resolve.`);
  }
  for (const objective of framework?.missionObjectiveContractDefinitions ?? []) for (const id of objective.requiredActionIds ?? []) assert(actionIds.has(id), `${label} objective ${objective.id} action ${id} does not resolve.`);
  for (const reward of framework?.missionRewardContractDefinitions ?? []) {
    assert(reward.gameOwnsClaimState === true, `${label} reward ${reward.id} claim state must be Game-owned.`);
    for (const id of reward.allowedForMissionTypeIds ?? []) assert(missionTypeIds.has(id), `${label} reward ${reward.id} mission type ${id} does not resolve.`);
  }
  for (const template of framework?.missionTemplateDefinitions ?? []) {
    assert(template.missionTypeId && missionTypeIds.has(template.missionTypeId), `${label} template ${template.id} mission type does not resolve.`);
    assert(template.expeditionScopeId && scopeIds.has(template.expeditionScopeId), `${label} template ${template.id} scope does not resolve.`);
    for (const id of template.objectiveTypeIds ?? []) assert(objectiveIds.has(id), `${label} template ${template.id} objective ${id} does not resolve.`);
    for (const id of template.rewardTypeIds ?? []) assert(rewardIds.has(id), `${label} template ${template.id} reward ${id} does not resolve.`);
  }
  for (const requirement of framework?.expeditionRequirementDefinitions ?? []) {
    assert(requirement.gameOwnsAssignmentState === true, `${label} requirement ${requirement.id} assignment state must be Game-owned.`);
    for (const id of requirement.resourceIds ?? []) assert(resourceIds.has(id) || id.startsWith("ECON-"), `${label} requirement ${requirement.id} resource ${id} does not resolve.`);
    for (const id of requirement.actionIds ?? []) assert(actionIds.has(id), `${label} requirement ${requirement.id} action ${id} does not resolve.`);
    for (const id of requirement.routeDefinitionIds ?? []) assert(routeIds.has(id), `${label} requirement ${requirement.id} route ${id} does not resolve.`);
    for (const id of requirement.transportModeIds ?? []) assert(transportIds.has(id), `${label} requirement ${requirement.id} transport ${id} does not resolve.`);
  }
  for (const risk of framework?.expeditionRiskDefinitions ?? []) {
    for (const id of risk.appliesToScopeIds ?? []) assert(scopeIds.has(id), `${label} risk ${risk.id} scope ${id} does not resolve.`);
    for (const id of risk.mitigationRequirementIds ?? []) assert(requirementIds.has(id), `${label} risk ${risk.id} mitigation requirement ${id} does not resolve.`);
  }
  for (const hook of framework?.integrationHooks ?? []) if (hook.required) assert((hook.referencedIds?.length ?? 0) > 0, `${label} integration hook ${hook.id} must have references.`);
  for (const contract of framework?.missionExpeditionPresentationContract ?? []) assert(contract.rendererIndependent === true, `${label} presentation contract ${contract.id} must be renderer-independent.`);
  assert(framework?.creativeProductionRequirements?.some((item) => item.category === "Missions & Expeditions"), `${label} must publish Creative Production mission requirements.`);
  assert(framework?.assetLibraryCategories?.some((category) => category.id === "missions_expeditions" && (category.groups?.length ?? 0) >= 7), `${label} must publish Asset Library mission category.`);
  assert(!/"(?:acceptedMissionRecords|activeExpeditionRecords|objectiveProgressRecords|rewardClaimRecords|crewAssignmentRecords|playerMissionHistoryRecords)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} Mission & Expedition Framework leaked player state or private paths.`);
}

function validateDynamicEventFramework(payload: RuntimePayload | RobloxPayload, label: string) {
  const framework = payload.dynamicEventFramework;
  const populationFramework = payload.populationSimulationFramework;
  const actionIds = new Set(payload.actionSystem?.actionDefinitions?.map((action) => action.id) ?? []);
  const missionTemplateIds = new Set(payload.missionExpeditionFramework?.missionTemplateDefinitions?.map((template) => template.id) ?? []);
  const categoryIds = new Set(framework?.eventCategoryDefinitions?.map((definition) => definition.id) ?? []);
  const typeIds = new Set(framework?.eventTypeDefinitions?.map((definition) => definition.id) ?? []);
  const lifecycleIds = new Set(framework?.eventLifecycleStateDefinitions?.map((definition) => definition.id) ?? []);
  const triggerIds = new Set(framework?.eventTriggerPolicies?.map((definition) => definition.id) ?? []);
  const eligibilityIds = new Set(framework?.eventEligibilityDefinitions?.map((definition) => definition.id) ?? []);
  const probabilityIds = new Set(framework?.eventProbabilityPolicies?.map((definition) => definition.id) ?? []);
  const seedPolicyIds = new Set(framework?.eventDeterministicSeedPolicies?.map((definition) => definition.id) ?? []);
  const severityIds = new Set(framework?.eventSeverityDefinitions?.map((definition) => definition.id) ?? []);
  const durationIds = new Set(framework?.eventDurationClasses?.map((definition) => definition.id) ?? []);
  const phaseIds = new Set(framework?.eventPhaseDefinitions?.map((definition) => definition.id) ?? []);
  const effectIds = new Set(framework?.eventEffectDefinitions?.map((definition) => definition.id) ?? []);
  const choiceIds = new Set(framework?.eventChoiceDefinitions?.map((definition) => definition.id) ?? []);
  const resolutionIds = new Set(framework?.eventResolutionPolicies?.map((definition) => definition.id) ?? []);
  const failureIds = new Set(framework?.eventFailurePolicies?.map((definition) => definition.id) ?? []);
  const eventIds = new Set(framework?.eventDefinitions?.map((definition) => definition.id) ?? []);
  const timelineIds = new Set(framework?.eventTimelineSignificancePolicies?.map((definition) => definition.id) ?? []);

  assert(framework?.id === "dynamic_event_framework_v1", `${label} must publish dynamic_event_framework_v1.`);
  assert(framework?.architectureDecisionId === "ARCH-DECISION-DYNAMIC-EVENT-FRAMEWORK", `${label} Dynamic Event architecture decision mismatch.`);
  assert(framework?.populationSimulationIntegration?.implemented === true, `${label} must integrate with Population Simulation.`);
  assert(framework?.populationSimulationIntegration?.hookOnly === false, `${label} must not publish population hooks as future-only.`);
  assert(framework?.populationSimulationIntegration?.populationSimulationFrameworkId === populationFramework?.id, `${label} must reference the published Population Simulation Framework.`);
  assert(framework?.activePlayerStatePolicy && Object.values(framework.activePlayerStatePolicy).every((value) => value === false), `${label} must not export active Event player state.`);
  assert((framework?.eventCategoryDefinitions?.length ?? 0) === 32, `${label} must publish 32 event categories.`);
  assert((framework?.eventTypeDefinitions?.length ?? 0) === 23, `${label} must publish 23 event types.`);
  assert((framework?.eventLifecycleStateDefinitions?.length ?? 0) === 13, `${label} must publish 13 lifecycle states.`);
  assert((framework?.eventDefinitions?.length ?? 0) >= 40, `${label} must publish starter Dynamic Event library.`);
  assert((framework?.eventTriggerPolicies?.length ?? 0) === 34, `${label} must publish 34 trigger policies.`);
  assert((framework?.eventProbabilityPolicies?.length ?? 0) === 12, `${label} must publish 12 probability policies.`);
  assert((framework?.eventSeverityDefinitions?.length ?? 0) === 7, `${label} must publish 7 severity bands.`);
  assert((framework?.eventEffectDefinitions?.length ?? 0) === 30, `${label} must publish 30 effect definitions.`);
  assert((framework?.eventChoiceDefinitions?.length ?? 0) === 20, `${label} must publish 20 event choices.`);
  assert((framework?.eventChainDefinitions?.length ?? 0) === 4, `${label} must publish 4 event chains.`);

  for (const state of framework?.eventLifecycleStateDefinitions ?? []) for (const id of state.allowedTransitions ?? []) assert(lifecycleIds.has(id), `${label} event state ${state.id} transition ${id} does not resolve.`);
  for (const trigger of framework?.eventTriggerPolicies ?? []) assert(trigger.canonicalReasonCode?.startsWith("event_trigger_"), `${label} trigger ${trigger.id} must use canonical reason code.`);
  for (const policy of framework?.eventProbabilityPolicies ?? []) assert(policy.deterministic === true, `${label} probability policy ${policy.id} must be deterministic.`);
  for (const policy of framework?.eventDeterministicSeedPolicies ?? []) assert(policy.forbidsUncontrolledRandom === true, `${label} seed policy ${policy.id} must forbid uncontrolled random.`);
  for (const phase of framework?.eventPhaseDefinitions ?? []) assert(phase.defaultDurationClassId && durationIds.has(phase.defaultDurationClassId), `${label} phase ${phase.id} duration class does not resolve.`);
  for (const effect of framework?.eventEffectDefinitions ?? []) assert(effect.studioMutatesPlayerState === false, `${label} effect ${effect.id} must not mutate player state in Studio.`);
  for (const choice of framework?.eventChoiceDefinitions ?? []) {
    for (const id of choice.actionIds ?? []) assert(actionIds.has(id), `${label} choice ${choice.id} action ${id} does not resolve.`);
    for (const id of choice.outcomeEffectTypeIds ?? []) assert(effectIds.has(id), `${label} choice ${choice.id} effect ${id} does not resolve.`);
    assert(choice.timelinePolicyId && timelineIds.has(choice.timelinePolicyId), `${label} choice ${choice.id} timeline policy does not resolve.`);
    if (choice.irreversible) assert(choice.requiresPlayerConfirmation === true, `${label} irreversible choice ${choice.id} must require confirmation.`);
  }
  for (const resolution of framework?.eventResolutionPolicies ?? []) assert(resolution.gameOwnsResolvedOutcome === true, `${label} resolution ${resolution.id} must keep outcomes Game-owned.`);
  for (const failure of framework?.eventFailurePolicies ?? []) {
    for (const id of failure.recoveryChoiceIds ?? []) assert(choiceIds.has(id), `${label} failure ${failure.id} choice ${id} does not resolve.`);
    for (const id of failure.missionHookIds ?? []) assert(missionTemplateIds.has(id), `${label} failure ${failure.id} mission hook ${id} does not resolve.`);
  }
  for (const event of framework?.eventDefinitions ?? []) {
    assert(event.categoryId && categoryIds.has(event.categoryId), `${label} event ${event.id} category does not resolve.`);
    assert(event.eventTypeId && typeIds.has(event.eventTypeId), `${label} event ${event.id} type does not resolve.`);
    for (const id of event.triggerPolicyIds ?? []) assert(triggerIds.has(id), `${label} event ${event.id} trigger ${id} does not resolve.`);
    for (const id of event.eligibilityIds ?? []) assert(eligibilityIds.has(id), `${label} event ${event.id} eligibility ${id} does not resolve.`);
    assert(event.probabilityPolicyId && probabilityIds.has(event.probabilityPolicyId), `${label} event ${event.id} probability policy does not resolve.`);
    assert(event.deterministicSeedPolicyId && seedPolicyIds.has(event.deterministicSeedPolicyId), `${label} event ${event.id} seed policy does not resolve.`);
    assert(event.severityId && severityIds.has(event.severityId), `${label} event ${event.id} severity does not resolve.`);
    assert(event.durationClassId && durationIds.has(event.durationClassId), `${label} event ${event.id} duration does not resolve.`);
    for (const id of event.phaseIds ?? []) assert(phaseIds.has(id), `${label} event ${event.id} phase ${id} does not resolve.`);
    for (const id of event.effectTypeIds ?? []) assert(effectIds.has(id), `${label} event ${event.id} effect ${id} does not resolve.`);
    for (const id of event.choiceIds ?? []) assert(choiceIds.has(id), `${label} event ${event.id} choice ${id} does not resolve.`);
    for (const id of event.resolutionPolicyIds ?? []) assert(resolutionIds.has(id), `${label} event ${event.id} resolution ${id} does not resolve.`);
    for (const id of event.failurePolicyIds ?? []) assert(failureIds.has(id), `${label} event ${event.id} failure policy ${id} does not resolve.`);
    for (const id of event.followUpEventIds ?? []) assert(eventIds.has(id), `${label} event ${event.id} follow-up ${id} does not resolve.`);
    for (const id of event.missionHookTemplateIds ?? []) assert(missionTemplateIds.has(id), `${label} event ${event.id} mission hook ${id} does not resolve.`);
    for (const id of event.actionReferenceIds ?? []) assert(actionIds.has(id), `${label} event ${event.id} action ${id} does not resolve.`);
  }
  for (const chain of framework?.eventChainDefinitions ?? []) {
    const mainPath = new Set<string>();
    for (const id of chain.eventIds ?? []) {
      assert(eventIds.has(id), `${label} chain ${chain.id} event ${id} does not resolve.`);
      assert(!mainPath.has(id), `${label} chain ${chain.id} repeats ${id}.`);
      mainPath.add(id);
    }
    for (const id of [...chain.branchEventIds ?? [], ...chain.terminalEventIds ?? []]) assert(eventIds.has(id), `${label} chain ${chain.id} branch/terminal event ${id} does not resolve.`);
  }
  const unknown = framework?.eventKnowledgeVisibility?.find((rule) => rule.knowledgeStateId === "unknown");
  assert(unknown?.canShowName === false && unknown.canShowResources === false && unknown.canShowArtifacts === false && unknown.canShowLifeforms === false && unknown.fallbackText === "???", `${label} unknown knowledge rule must hide details behind ???.`);
  for (const contract of framework?.eventPresentationContract ?? []) assert(contract.rendererIndependent === true, `${label} presentation contract ${contract.id} must be renderer-independent.`);
  assert(framework?.creativeProductionRequirements?.some((item) => item.category === "Dynamic Events"), `${label} must publish Creative Production Dynamic Events requirements.`);
  assert(framework?.assetLibraryCategories?.some((category) => category.id === "dynamic_events"), `${label} must publish Asset Library Dynamic Events category.`);
  assert(!/"(?:activeEventInstances|currentModifiers|selectedChoices|generatedPlayerParameters|resolvedOutcomes|playerEventHistory)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} Dynamic Event Framework leaked player state or private paths.`);
}

function validatePopulationSimulationFramework(payload: RuntimePayload | RobloxPayload, label: string) {
  const framework = payload.populationSimulationFramework;
  assert(framework?.id === "population_simulation_framework_v1", `${label} must publish population_simulation_framework_v1.`);
  assert(framework?.architectureDecisionId === "ARCH-DECISION-POPULATION-STRUCTURED-SIMULATION", `${label} Population Simulation architecture decision mismatch.`);
  assert(framework?.activePlayerStatePolicy && Object.values(framework.activePlayerStatePolicy).every((value) => value === false), `${label} must not export live player population state.`);
  assert((framework?.populationCategoryDefinitions?.length ?? 0) >= 24, `${label} must publish canonical population categories.`);
  assert((framework?.populationLifeStageDefinitions?.length ?? 0) === 7, `${label} must publish 7 life stages.`);
  assert((framework?.populationWorkforceRoleDefinitions?.length ?? 0) === 20, `${label} must publish 20 workforce roles.`);
  assert((framework?.populationSpecialistRoleDefinitions?.length ?? 0) === 12, `${label} must publish 12 specialist roles.`);
  assert((framework?.populationGrowthDefinitions?.length ?? 0) >= 4, `${label} must publish deterministic growth definitions.`);
  assert((framework?.populationCapacityDefinitions?.length ?? 0) === 7, `${label} must publish 7 capacity definitions.`);
  assert((framework?.populationNeedDefinitions?.length ?? 0) === 15, `${label} must publish 15 needs.`);
  assert((framework?.populationWellbeingBands?.length ?? 0) === 6, `${label} must publish 6 wellbeing bands.`);
  assert((framework?.populationMigrationDefinitions?.length ?? 0) === 11, `${label} must publish 11 migration types.`);
  assert((framework?.workforceAssignmentDefinitions?.length ?? 0) === 10, `${label} must publish 10 workforce assignment modes.`);
  assert((framework?.automationSubstitutionPolicies?.length ?? 0) === 7, `${label} must publish 7 automation substitution policies.`);
  assert((framework?.populationShortageReasonCodes?.length ?? 0) === 13, `${label} must publish 13 shortage reason codes.`);
  assert((framework?.populationPresentationContract?.length ?? 0) >= 13, `${label} must publish population presentation contracts.`);
  assert(!/"(?:currentPopulationValue|livePopulationCount|activePopulationAssignment|migrationStartedAt|migrationCompletedAt|queueInstance|saveId|cloudSaveId)"\s*:|\/Users\/|studio-private:\/\//i.test(JSON.stringify(framework)), `${label} Population Simulation Framework leaked player state or private paths.`);
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
  assert((canonical.payload.metadata?.contentVersion ?? 0) >= 32, "Canonical contentVersion must be at least 32 after Population Simulation Framework.");
  assert((roblox.payload.metadata?.contentVersion ?? 0) >= 32, "Roblox contentVersion must be at least 32 after Population Simulation Framework.");

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
  validateCivilizationProgressionFramework(canonical.payload, "Canonical");
  validateCivilizationProgressionFramework(roblox.payload, "Roblox");
  validateColonizationFramework(canonical.payload, "Canonical");
  validateColonizationFramework(roblox.payload, "Roblox");
  validateResourceEconomyLogisticsFramework(canonical.payload, "Canonical");
  validateResourceEconomyLogisticsFramework(roblox.payload, "Roblox");
  validateMissionExpeditionFramework(canonical.payload, "Canonical");
  validateMissionExpeditionFramework(roblox.payload, "Roblox");
  validatePopulationSimulationFramework(canonical.payload, "Canonical");
  validatePopulationSimulationFramework(roblox.payload, "Roblox");
  validateDynamicEventFramework(canonical.payload, "Canonical");
  validateDynamicEventFramework(roblox.payload, "Roblox");
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
      civilizationStageCount: canonical.payload.civilizationProgressionFramework?.civilizationStages?.length ?? 0,
      civilizationMilestoneCount: canonical.payload.civilizationProgressionFramework?.civilizationMilestones?.length ?? 0,
      resourceFlowCount: canonical.payload.resourceEconomyLogisticsFramework?.resourceFlowDefinitions?.length ?? 0,
      logisticsRouteCount: canonical.payload.resourceEconomyLogisticsFramework?.logisticsRouteDefinitions?.length ?? 0,
      transportModeCount: canonical.payload.resourceEconomyLogisticsFramework?.transportModeDefinitions?.length ?? 0,
      shipmentStateCount: canonical.payload.resourceEconomyLogisticsFramework?.shipmentStateDefinitions?.length ?? 0,
      missionTypeCount: canonical.payload.missionExpeditionFramework?.missionTypeDefinitions?.length ?? 0,
      expeditionScopeCount: canonical.payload.missionExpeditionFramework?.expeditionScopeDefinitions?.length ?? 0,
      missionTemplateCount: canonical.payload.missionExpeditionFramework?.missionTemplateDefinitions?.length ?? 0,
      dynamicEventCount: canonical.payload.dynamicEventFramework?.eventDefinitions?.length ?? 0,
      dynamicEventCategoryCount: canonical.payload.dynamicEventFramework?.eventCategoryDefinitions?.length ?? 0,
      dynamicEventChainCount: canonical.payload.dynamicEventFramework?.eventChainDefinitions?.length ?? 0,
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
      civilizationStageCount: roblox.payload.civilizationProgressionFramework?.civilizationStages?.length ?? 0,
      civilizationMilestoneCount: roblox.payload.civilizationProgressionFramework?.civilizationMilestones?.length ?? 0,
      resourceFlowCount: roblox.payload.resourceEconomyLogisticsFramework?.resourceFlowDefinitions?.length ?? 0,
      logisticsRouteCount: roblox.payload.resourceEconomyLogisticsFramework?.logisticsRouteDefinitions?.length ?? 0,
      transportModeCount: roblox.payload.resourceEconomyLogisticsFramework?.transportModeDefinitions?.length ?? 0,
      shipmentStateCount: roblox.payload.resourceEconomyLogisticsFramework?.shipmentStateDefinitions?.length ?? 0,
      missionTypeCount: roblox.payload.missionExpeditionFramework?.missionTypeDefinitions?.length ?? 0,
      expeditionScopeCount: roblox.payload.missionExpeditionFramework?.expeditionScopeDefinitions?.length ?? 0,
      missionTemplateCount: roblox.payload.missionExpeditionFramework?.missionTemplateDefinitions?.length ?? 0,
      dynamicEventCount: roblox.payload.dynamicEventFramework?.eventDefinitions?.length ?? 0,
      dynamicEventCategoryCount: roblox.payload.dynamicEventFramework?.eventCategoryDefinitions?.length ?? 0,
      dynamicEventChainCount: roblox.payload.dynamicEventFramework?.eventChainDefinitions?.length ?? 0,
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
