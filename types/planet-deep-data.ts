export const PLANET_DEEP_DATA_SCHEMA_VERSION = "planet-deep-data-v1" as const;
export const PLANET_DEEP_DATA_GENERATION_VERSION = 1;

export type PlanetDiscoveryState =
  | "unknown"
  | "detected"
  | "probed"
  | "scanned"
  | "surveyed"
  | "explored"
  | "catalogued"
  | "colonized";

export type PlanetValidationSeverity =
  | "error"
  | "warning"
  | "scientific_plausibility"
  | "gameplay_balance"
  | "missing_optional_data";

export type PlanetValidationIssue = {
  severity: PlanetValidationSeverity;
  code: string;
  message: string;
  path: string;
  relatedIds: string[];
};

export type ScientificValue<T = number> = {
  value: T;
  unit: string;
  displayValue: string;
  confidence: number;
  estimated: boolean;
  verified: boolean;
};

export type PlanetFieldVisibility = {
  sectionId: string;
  requiredDiscoveryState: PlanetDiscoveryState;
  confidence: number;
  estimated: boolean;
  verified: boolean;
  hiddenReason: string | null;
  unlockResearchIds: string[];
};

export type PlanetTypeProfile = {
  canonicalId: string;
  displayName: string;
  description: string;
  family: string;
  subtype: string | null;
  rarity: string;
  tags: string[];
  defaultHabitabilityRange: [number, number];
  defaultGravityRange: [number, number];
  defaultTemperatureRange: [number, number];
  defaultPressureRange: [number, number];
  defaultAtmosphereProfileIds: string[];
  defaultClimateProfileIds: string[];
  allowedBiomeProfileIds: string[];
  allowedWeatherProfileIds: string[];
  allowedSeasonProfileIds: string[];
  allowedGeologyProfileIds: string[];
  allowedHydrosphereProfileIds: string[];
  allowedLifeComplexityRange: [number, number];
  allowedHazardProfileIds: string[];
  defaultResourceDistributionProfileIds: string[];
  planetMaterialProfileId: string;
  defaultPresentationProfileId: string;
  generationRules: Record<string, unknown>;
  validationRules: string[];
};

export type PlanetResourceDistributionRule = {
  resourceId: string;
  probability: number;
  abundanceRange: [number, number];
  richnessRange: [number, number];
  purityRange: [number, number];
  depthRange: [number, number];
  sourceCategories: PlanetResourceSourceCategory[];
};

export type PlanetResourceDistributionProfile = {
  profileId: string;
  displayName: string;
  compatiblePlanetTypeIds: string[];
  requiredTags: string[];
  excludedTags: string[];
  resourceRules: PlanetResourceDistributionRule[];
  distributionPatterns: string[];
  biomeAffinityRules: Record<string, number>;
  geologyAffinityRules: Record<string, number>;
  atmosphereAffinityRules: Record<string, number>;
  oceanAffinityRules: Record<string, number>;
  rarityWeights: Record<string, number>;
  reserveGenerationRules: Record<string, unknown>;
};

export type AtmosphereProfile = {
  id: string;
  displayName: string;
  family: string;
  atmospherePresent: boolean;
  breathability: number;
  toxicity: number;
  corrosiveness: number;
  pressureRange: [number, number];
  compatiblePlanetTypeIds: string[];
  compositionResourceIds: string[];
};

export type ClimateProfile = {
  id: string;
  displayName: string;
  classification: string;
  temperatureRange: [number, number];
  humidityRange: [number, number];
  precipitationRange: [number, number];
  climateStabilityRange: [number, number];
  compatiblePlanetTypeIds: string[];
};

export type WeatherProfile = {
  id: string;
  displayName: string;
  family: string;
  description: string;
  intensityRange: [number, number];
  temperatureModifier: [number, number];
  visibilityModifier: [number, number];
  windSpeedRange: [number, number];
  windDirectionBehavior: string;
  precipitationType: string | null;
  precipitationRate: [number, number];
  lightningFrequency: number;
  radiationLevel: number;
  toxicityLevel: number;
  damageType: string | null;
  travelModifier: number;
  productionModifier: number;
  energyModifier: number;
  agricultureModifier: number;
  creatureBehaviorModifier: number;
  settlementRisk: number;
  durationRange: [number, number];
  transitionRules: string[];
  compatiblePlanetTypeIds: string[];
  compatibleBiomeProfileIds: string[];
  compatibleSeasonProfileIds: string[];
  audioProfileId: string | null;
  particleProfileId: string | null;
  skyProfileId: string | null;
};

export type SeasonDefinition = {
  seasonId: string;
  displayName: string;
  order: number;
  length: number;
  startPoint: number;
  endPoint: number;
  averageTemperature: number;
  temperatureRange: [number, number];
  daylightLength: number;
  precipitation: number;
  windConditions: string;
  commonWeatherProfileIds: string[];
  rareWeatherProfileIds: string[];
  biomeModifiers: Record<string, number>;
  vegetationModifiers: Record<string, number>;
  migrationModifiers: Record<string, number>;
  breedingModifiers: Record<string, number>;
  resourceAvailabilityModifiers: Record<string, number>;
  agricultureModifier: number;
  solarEnergyModifier: number;
  travelRiskModifier: number;
  hazardModifier: number;
  visualProfileId: string | null;
  audioProfileId: string | null;
};

export type SeasonCycleProfile = {
  id: string;
  displayName: string;
  cycleType: string;
  compatiblePlanetTypeIds: string[];
  totalLength: number;
  seasons: SeasonDefinition[];
};

export type BiomeProfile = {
  id: string;
  displayName: string;
  family: string;
  compatiblePlanetTypeIds: string[];
  temperatureRange: [number, number];
  humidityRange: [number, number];
  waterAvailabilityRange: [number, number];
  lifeComplexityRange: [number, number];
  defaultWeatherProfileIds: string[];
};

export type GeologyProfile = {
  id: string;
  displayName: string;
  compatiblePlanetTypeIds: string[];
  coreType: string;
  mantleType: string;
  crustType: string;
  tectonicActivityRange: [number, number];
  volcanicActivityRange: [number, number];
  seismicActivityRange: [number, number];
  canonicalResourceIds: string[];
};

export type HydrosphereProfile = {
  id: string;
  displayName: string;
  compatiblePlanetTypeIds: string[];
  waterPresent: boolean;
  surfaceCoverageRange: [number, number];
  dominantLiquidResourceId: string | null;
  dissolvedResourceIds: string[];
  salinityRange: [number, number];
  acidityRange: [number, number];
};

export type HazardProfile = {
  id: string;
  displayName: string;
  family: string;
  severityRange: [number, number];
  frequency: string;
  geographicScope: string;
  seasonalModifiers: Record<string, number>;
  biomeModifiers: Record<string, number>;
  damageType: string;
  exposureThreshold: number;
  protectionRequirements: string[];
  countermeasureResearchIds: string[];
  countermeasureEquipmentIds: string[];
  travelPenalty: number;
  settlementPenalty: number;
  extractionPenalty: number;
  warningIconId: string | null;
  visualEffectProfileId: string | null;
  compatiblePlanetTypeIds: string[];
};

export type PlanetResourceSourceCategory =
  | "surface"
  | "subsurface"
  | "atmospheric"
  | "oceanic"
  | "biological"
  | "geothermal"
  | "crystalline"
  | "radioactive"
  | "exotic"
  | "artificial"
  | "salvage"
  | "renewable";

export type PlanetResourceOccurrence = {
  occurrenceId: string;
  planetId: string;
  resourceId: string;
  sourceCategory: PlanetResourceSourceCategory;
  discoveryState: PlanetDiscoveryState;
  confidence: number;
  abundance: number;
  richness: number;
  purity: number;
  estimatedReserves: number;
  reserveUnit: string;
  minimumDepth: number;
  maximumDepth: number;
  accessibility: number;
  distributionPattern: string;
  depositCountEstimate: number;
  extractionDifficulty: number;
  environmentalRisk: number;
  hazardLevel: number;
  biomeIds: string[];
  regionIds: string[];
  latitudeRange: [number, number];
  elevationRange: [number, number];
  requiredResearchIds: string[];
  requiredTechnologyIds: string[];
  requiredEquipmentIds: string[];
  renewability: string;
  regenerationRate: number;
  depletionState: string;
  currentExtractionModifier: number;
  strategicValueModifier: number;
  marketValueModifier: number;
  knownDepositIds: string[];
  notes: string;
};

export type PlanetBiomeOccurrence = {
  occurrenceId: string;
  planetId: string;
  biomeProfileId: string;
  displayNameOverride: string | null;
  coveragePercentage: number;
  latitudeRange: [number, number];
  elevationRange: [number, number];
  temperatureRange: [number, number];
  humidityRange: [number, number];
  precipitationRange: [number, number];
  soilTypeIds: string[];
  waterAvailability: number;
  vegetationDensity: number;
  faunaDensity: number;
  resourceModifiers: Record<string, number>;
  hazardLevel: number;
  travelDifficulty: number;
  settlementSuitability: number;
  agricultureSuitability: number;
  weatherProfileIds: string[];
  ambientAudioProfileId: string | null;
  presentationProfileId: string | null;
  discoveryState: PlanetDiscoveryState;
  discoveryProgress: number;
};

export type PlanetSpeciesOccurrence = {
  occurrenceId: string;
  planetId: string;
  speciesId: string;
  nativeStatus: string;
  endemicStatus: boolean;
  discoveryState: PlanetDiscoveryState;
  discoveredBy: string | null;
  discoveryDate: string | null;
  populationEstimate: number;
  populationTrend: string;
  conservationStatus: string;
  biomeOccurrenceIds: string[];
  climateToleranceOverride: string | null;
  seasonalBehavior: string;
  migrationPattern: string;
  ecologicalRole: string;
  predatorSpeciesIds: string[];
  preySpeciesIds: string[];
  symbioticSpeciesIds: string[];
  domesticationStatus: string;
  localHazardLevel: number;
  localResourceYieldModifier: number;
};

export type PlanetHazardOccurrence = {
  occurrenceId: string;
  planetId: string;
  hazardProfileId: string;
  severity: number;
  distribution: string;
  biomeOccurrenceIds: string[];
  seasonalModifiers: Record<string, number>;
  discoveryState: PlanetDiscoveryState;
  confidence: number;
};

export type PlanetIdentityProfile = {
  scientificDesignation: string;
  discoveryName: string;
  originalName: string;
  generationSeed: string;
  generationVersion: number;
  rarity: string;
  strategicImportance: number;
  scientificImportance: number;
  biodiversityRating: number;
  resourceRating: number;
  dangerRating: number;
  overallHabitability: number;
  surveyCompletion: number;
  catalogCompletion: number;
};

export type PlanetOrbitalProfile = {
  radius: ScientificValue;
  diameter: ScientificValue;
  circumference: ScientificValue;
  mass: ScientificValue;
  density: ScientificValue;
  volume: ScientificValue;
  surfaceArea: ScientificValue;
  gravity: ScientificValue;
  escapeVelocity: ScientificValue;
  axialTilt: ScientificValue;
  rotationPeriod: ScientificValue;
  dayLength: ScientificValue;
  orbitalPeriod: ScientificValue;
  yearLength: ScientificValue;
  orbitalDistance: ScientificValue;
  eccentricity: ScientificValue;
  inclination: ScientificValue;
  periapsis: ScientificValue;
  apoapsis: ScientificValue;
  tidalLockState: string;
  magneticFieldStrength: ScientificValue;
  magnetosphereRadius: ScientificValue;
  radiationExposure: ScientificValue;
  planetAge: ScientificValue;
  internalHeat: ScientificValue;
  moonCount: number;
  ringSystem: string;
  impactFrequency: number;
};

export type ResolvedAtmosphereProfile = {
  profileId: string;
  atmospherePresent: boolean;
  atmosphereType: string;
  surfacePressure: ScientificValue;
  atmosphericDensity: ScientificValue;
  scaleHeight: ScientificValue;
  visibility: number;
  breathability: number;
  corrosiveness: number;
  toxicity: number;
  radioactivity: number;
  greenhouseStrength: number;
  ozoneProtection: number;
  aerosolDensity: number;
  dustDensity: number;
  cloudDensity: number;
  cloudAltitude: ScientificValue;
  upperAtmosphereTemperature: ScientificValue;
  lowerAtmosphereTemperature: ScientificValue;
  windShear: number;
  electricalActivity: number;
  auroraIntensity: number;
  soundTransmission: number;
  skyColor: string;
  sunsetColor: string;
  composition: Array<{ resourceId: string; percentage: number; confidence: number; notes: string }>;
};

export type ResolvedClimateProfile = {
  profileId: string;
  climateClassification: string;
  averageGlobalTemperature: ScientificValue;
  minimumTemperature: ScientificValue;
  maximumTemperature: ScientificValue;
  equatorialTemperature: ScientificValue;
  temperateTemperature: ScientificValue;
  polarTemperature: ScientificValue;
  daySideTemperature: ScientificValue;
  nightSideTemperature: ScientificValue;
  oceanTemperature: ScientificValue;
  undergroundTemperature: ScientificValue;
  temperatureVariability: number;
  greenhouseEffect: number;
  climateStability: number;
  iceCoverage: number;
  snowCoverage: number;
  desertCoverage: number;
  averageHumidity: number;
  annualPrecipitation: ScientificValue;
  evaporationRate: number;
  stormFrequency: number;
  climateTrend: string;
  longTermWarmingRate: number;
  longTermCoolingRate: number;
  climateCycleLength: ScientificValue;
};

export type ResolvedHydrosphereProfile = {
  profileId: string;
  waterPresent: boolean;
  surfaceWaterCoverage: number;
  oceanCount: number;
  oceanAverageDepth: ScientificValue;
  deepestOcean: ScientificValue;
  freshwaterAvailability: number;
  iceCoverage: number;
  undergroundWater: number;
  atmosphericWater: number;
  dominantLiquidResourceId: string | null;
  dissolvedResourceIds: string[];
  salinity: number;
  acidity: number;
  averageOceanTemperature: ScientificValue;
  tidalStrength: number;
  currentStrength: number;
  aquaticHabitability: number;
  contaminationLevel: number;
};

export type ResolvedGeologyProfile = {
  profileId: string;
  coreType: string;
  mantleType: string;
  crustType: string;
  crustThickness: ScientificValue;
  plateCount: number;
  tectonicActivity: number;
  volcanicActivity: number;
  seismicActivity: number;
  erosionRate: number;
  impactCraters: number;
  mountainCoverage: number;
  canyonCoverage: number;
  caveDensity: number;
  lavaFieldCoverage: number;
  glacierCoverage: number;
  permafrostCoverage: number;
  soilTypeIds: string[];
  mineralDiversity: number;
  geologicalAge: ScientificValue;
  continentCount: number;
  oceanCount: number;
  highestPoint: ScientificValue;
  lowestPoint: ScientificValue;
  deepestOcean: ScientificValue;
  longestRiver: ScientificValue;
  largestDesert: ScientificValue;
  largestForest: ScientificValue;
  largestGlacier: ScientificValue;
  compositionResourceIds: string[];
};

export type PlanetHabitabilityProfile = {
  overall: number;
  atmosphereSafety: number;
  temperatureSafety: number;
  radiationSafety: number;
  gravityCompatibility: number;
  waterAvailability: number;
  foodPotential: number;
  soilFertility: number;
  diseaseRisk: number;
  predatorRisk: number;
  weatherRisk: number;
  geologicalRisk: number;
  resourceSupport: number;
  settlementViability: number;
  terraformingPotential: number;
  scoringInputs: Record<string, number>;
  explanation: string[];
};

export type PlanetLifeSummary = {
  estimatedSpeciesCount: number;
  discoveredSpeciesCount: number;
  endemicSpeciesCount: number;
  extinctSpeciesCount: number;
  dominantLifeformId: string | null;
  sapientSpeciesCount: number;
  megafaunaCount: number;
  microbialDiversity: number;
  biodiversityIndex: number;
  ecologicalStability: number;
  foodWebComplexity: number;
  invasiveSpeciesCount: number;
  extinctionRisk: number;
};

export type PlanetCivilizationSummary = {
  currentOwnerFactionId: string | null;
  population: number;
  settlementCount: number;
  capitalSettlementId: string | null;
  factionInfluence: number;
  economicOutput: number;
  researchOutput: number;
  foodOutput: number;
  energyOutput: number;
  defenseRating: number;
  tradeRouteIds: string[];
  activeMissionIds: string[];
  activeEventIds: string[];
  ruinDiscoveryIds: string[];
  archaeologicalSiteIds: string[];
  historicalEventIds: string[];
  terraformingHistoryIds: string[];
  colonizationHistoryIds: string[];
};

export type PlanetAuthoringOverrides = {
  lockedSections: string[];
  lockedFields: string[];
  values: Record<string, unknown>;
};

export type PlanetDeepData = {
  schemaVersion: typeof PLANET_DEEP_DATA_SCHEMA_VERSION;
  generationVersion: number;
  planetId: string;
  planetTypeId: string;
  identity: PlanetIdentityProfile;
  classification: {
    family: string;
    className: string;
    subclassName: string;
    biomeName: string;
    tags: string[];
  };
  orbital: PlanetOrbitalProfile;
  physical: {
    materialProfileId: string;
    internalStructure: string;
    surfaceCompositionResourceIds: string[];
    albedo: number;
    thermalInertia: number;
    magneticActivity: number;
  };
  atmosphere: ResolvedAtmosphereProfile;
  climate: ResolvedClimateProfile;
  weatherProfileIds: string[];
  seasonCycle: { profileId: string; currentCanonicalPhase: null; seasons: SeasonDefinition[] };
  hydrosphere: ResolvedHydrosphereProfile;
  biomes: PlanetBiomeOccurrence[];
  resourceOccurrences: PlanetResourceOccurrence[];
  speciesOccurrences: PlanetSpeciesOccurrence[];
  life: PlanetLifeSummary;
  geology: ResolvedGeologyProfile;
  hazards: PlanetHazardOccurrence[];
  habitability: PlanetHabitabilityProfile;
  civilizationSummary: PlanetCivilizationSummary;
  exploration: {
    recommendedSurveyActions: string[];
    estimatedSurveyHours: number;
    unexploredRegionCount: number;
    knownLandmarkIds: string[];
  };
  discoveries: {
    discoveryIds: string[];
    anomalyIds: string[];
    surveyCompletion: number;
    catalogCompletion: number;
  };
  history: {
    historicalEventIds: string[];
    colonizationHistoryIds: string[];
    terraformingHistoryIds: string[];
    summary: string;
  };
  simulationRules: {
    profileVersion: string;
    deterministic: true;
    liveStateOwner: "game-client";
    persistenceOwner: "player-persistence";
    canonicalOwner: "studio";
  };
  discoveryVisibility: PlanetFieldVisibility[];
  presentation: {
    presentationProfileId: string;
    summary: string;
    highlightMetricIds: string[];
    warningSeverity: PlanetValidationSeverity | null;
  };
  overrides: PlanetAuthoringOverrides;
};

export type PlanetDataScreenSection = {
  sectionId: string;
  displayName: string;
  iconId: string;
  sortOrder: number;
  requiredDiscoveryState: PlanetDiscoveryState;
  visible: boolean;
  summaryMetrics: string[];
  rows: string[];
  charts: string[];
  progressIndicators: string[];
  warnings: string[];
  relatedEntityIds: string[];
};

export type PlanetDataScreenContract = {
  id: "planet-data-screen-v1";
  version: "1.0.0";
  layoutOwner: "game-client";
  contentOwner: "studio";
  sections: PlanetDataScreenSection[];
};

export type PlanetDeepDataFramework = {
  schemaVersion: typeof PLANET_DEEP_DATA_SCHEMA_VERSION;
  generationVersion: number;
  planetTypeProfiles: PlanetTypeProfile[];
  resourceDistributionProfiles: PlanetResourceDistributionProfile[];
  atmosphereProfiles: AtmosphereProfile[];
  climateProfiles: ClimateProfile[];
  weatherProfiles: WeatherProfile[];
  seasonProfiles: SeasonCycleProfile[];
  biomeProfiles: BiomeProfile[];
  geologyProfiles: GeologyProfile[];
  hydrosphereProfiles: HydrosphereProfile[];
  hazardProfiles: HazardProfile[];
  discoveryStates: PlanetDiscoveryState[];
  validationRules: string[];
  dataScreenContract: PlanetDataScreenContract;
};
