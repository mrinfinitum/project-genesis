import { handoffData } from "@/data/handoff";
import { PLANET_CLASS_MODEL, findPlanetClassByName, slugPlanetTaxonomyValue } from "@/lib/planets/class-model";
import { normalizePlanetResourceProfiles, type NormalizedPlanetResourceProfile } from "@/lib/resources/planet-resource-profiles";
import { ResourceService } from "@/lib/resources/service";
import type { GeneratedPlanet, PlanetResourceProfile } from "@/types/schema";
import {
  PLANET_DEEP_DATA_GENERATION_VERSION,
  PLANET_DEEP_DATA_SCHEMA_VERSION,
  type AtmosphereProfile,
  type BiomeProfile,
  type ClimateProfile,
  type GeologyProfile,
  type HazardProfile,
  type HydrosphereProfile,
  type PlanetDataScreenContract,
  type PlanetDeepData,
  type PlanetDeepDataFramework,
  type PlanetDiscoveryState,
  type PlanetFieldVisibility,
  type PlanetHazardOccurrence,
  type PlanetResourceDistributionProfile,
  type PlanetResourceOccurrence,
  type PlanetResourceSourceCategory,
  type PlanetTypeProfile,
  type PlanetValidationIssue,
  type ScientificValue,
  type SeasonCycleProfile,
  type WeatherProfile
} from "@/types/planet-deep-data";

const discoveryStates: PlanetDiscoveryState[] = [
  "unknown",
  "detected",
  "probed",
  "scanned",
  "surveyed",
  "explored",
  "catalogued",
  "colonized"
];

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function randomSource(seed: string) {
  let state = hash(seed) || 1;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

function between(random: () => number, minimum: number, maximum: number, precision = 2) {
  const value = minimum + random() * (maximum - minimum);
  return Number(value.toFixed(precision));
}

function integer(random: () => number, minimum: number, maximum: number) {
  return Math.floor(between(random, minimum, maximum + 0.999, 0));
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, value));
}

function pick<T>(values: readonly T[], random: () => number, fallback: T): T {
  return values[Math.floor(random() * values.length)] ?? fallback;
}

function typeId(className: string) {
  return `planet_type_${slugPlanetTaxonomyValue(className).replace(/-/g, "_")}`;
}

function profileId(prefix: string, value: string) {
  return `${prefix}_${slugPlanetTaxonomyValue(value).replace(/-/g, "_")}`;
}

function resourceIds(namesOrIds: string[]) {
  return [...new Set(namesOrIds.map((value) => ResourceService.resolveId(value)).filter((value): value is string => Boolean(value)))];
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry)) : [];
}

function measurement(value: number, unit: string, precision = 2, confidence = 0.86): ScientificValue {
  return {
    value: Number(value.toFixed(precision)),
    unit,
    displayValue: `${Number(value.toFixed(precision)).toLocaleString("en-US")} ${unit}`.trim(),
    confidence,
    estimated: confidence < 0.95,
    verified: confidence >= 0.95
  };
}

function classTraits(className: string) {
  const normalized = className.toLowerCase();
  return {
    gas: normalized === "gas giant",
    airless: ["dead", "void"].includes(normalized),
    hot: ["lava", "energy", "primordial"].includes(normalized),
    cold: normalized === "ice",
    wet: ["ocean", "terrestrial", "living", "bio"].includes(normalized),
    life: ["terrestrial", "ocean", "living", "bio"].includes(normalized),
    toxic: normalized === "toxic",
    artificial: normalized === "artificial",
    exotic: ["void", "energy", "primordial", "crystal", "ancient"].includes(normalized)
  };
}

const allTypeIds = PLANET_CLASS_MODEL.map((definition) => typeId(definition.name));

function compatibleTypes(names: string[]) {
  return names.map(typeId);
}

const breathableComposition = resourceIds(["Nitrogen", "Oxygen", "Argon", "Carbon Dioxide"]);
const volatileComposition = resourceIds(["Hydrogen", "Helium", "Methane", "Ammonia"]);
const toxicComposition = resourceIds(["Carbon Dioxide", "Sulfur", "Methane", "Ammonia"]);
const waterResourceId = ResourceService.resolveId("Water");
const methaneResourceId = ResourceService.resolveId("Methane");

export const canonicalAtmosphereProfiles: AtmosphereProfile[] = [
  {
    id: "atmosphere_airless",
    displayName: "Airless",
    family: "Vacuum",
    atmospherePresent: false,
    breathability: 0,
    toxicity: 0,
    corrosiveness: 0,
    pressureRange: [0, 0.01],
    compatiblePlanetTypeIds: compatibleTypes(["Dead", "Void", "Artificial"]),
    compositionResourceIds: []
  },
  {
    id: "atmosphere_temperate",
    displayName: "Temperate Nitrogen-Oxygen",
    family: "Breathable",
    atmospherePresent: true,
    breathability: 88,
    toxicity: 2,
    corrosiveness: 1,
    pressureRange: [0.65, 1.8],
    compatiblePlanetTypeIds: compatibleTypes(["Terrestrial", "Ocean", "Living", "Bio", "Ancient"]),
    compositionResourceIds: breathableComposition
  },
  {
    id: "atmosphere_thin",
    displayName: "Thin Carbon Dioxide",
    family: "Thin",
    atmospherePresent: true,
    breathability: 0,
    toxicity: 35,
    corrosiveness: 8,
    pressureRange: [0.02, 0.65],
    compatiblePlanetTypeIds: compatibleTypes(["Desert", "Ice", "Dead", "Primordial"]),
    compositionResourceIds: resourceIds(["Carbon Dioxide", "Nitrogen", "Argon"])
  },
  {
    id: "atmosphere_dense_toxic",
    displayName: "Dense Toxic",
    family: "Toxic",
    atmospherePresent: true,
    breathability: 0,
    toxicity: 92,
    corrosiveness: 68,
    pressureRange: [1.8, 92],
    compatiblePlanetTypeIds: compatibleTypes(["Toxic", "Lava", "Primordial"]),
    compositionResourceIds: toxicComposition
  },
  {
    id: "atmosphere_hydrogen_helium",
    displayName: "Hydrogen-Helium Envelope",
    family: "Gas Giant",
    atmospherePresent: true,
    breathability: 0,
    toxicity: 45,
    corrosiveness: 18,
    pressureRange: [10, 1000],
    compatiblePlanetTypeIds: compatibleTypes(["Gas Giant"]),
    compositionResourceIds: volatileComposition
  },
  {
    id: "atmosphere_exotic",
    displayName: "Exotic Energized Envelope",
    family: "Exotic",
    atmospherePresent: true,
    breathability: 0,
    toxicity: 74,
    corrosiveness: 52,
    pressureRange: [0.1, 140],
    compatiblePlanetTypeIds: compatibleTypes(["Crystal", "Energy", "Void", "Artificial"]),
    compositionResourceIds: resourceIds(["Ionized Gas", "Quantum Gas Trace", "Rare Gases", "Hydrogen"])
  }
];

export const canonicalClimateProfiles: ClimateProfile[] = [
  { id: "climate_temperate", displayName: "Temperate", classification: "Temperate", temperatureRange: [258, 315], humidityRange: [25, 85], precipitationRange: [30, 280], climateStabilityRange: [55, 95], compatiblePlanetTypeIds: compatibleTypes(["Terrestrial", "Ocean", "Living", "Bio", "Ancient"]) },
  { id: "climate_arid", displayName: "Arid", classification: "Arid", temperatureRange: [250, 345], humidityRange: [0, 28], precipitationRange: [0, 35], climateStabilityRange: [35, 82], compatiblePlanetTypeIds: compatibleTypes(["Desert", "Dead", "Artificial"]) },
  { id: "climate_cryogenic", displayName: "Cryogenic", classification: "Cryogenic", temperatureRange: [35, 258], humidityRange: [0, 60], precipitationRange: [0, 110], climateStabilityRange: [38, 88], compatiblePlanetTypeIds: compatibleTypes(["Ice", "Gas Giant", "Dead"]) },
  { id: "climate_infernal", displayName: "Infernal", classification: "Infernal", temperatureRange: [620, 2200], humidityRange: [0, 10], precipitationRange: [0, 25], climateStabilityRange: [10, 48], compatiblePlanetTypeIds: compatibleTypes(["Lava", "Energy", "Primordial"]) },
  { id: "climate_toxic", displayName: "Toxic Greenhouse", classification: "Toxic", temperatureRange: [285, 790], humidityRange: [5, 98], precipitationRange: [5, 420], climateStabilityRange: [15, 62], compatiblePlanetTypeIds: compatibleTypes(["Toxic", "Primordial"]) },
  { id: "climate_exotic", displayName: "Exotic Variable", classification: "Exotic", temperatureRange: [80, 1100], humidityRange: [0, 100], precipitationRange: [0, 300], climateStabilityRange: [5, 50], compatiblePlanetTypeIds: compatibleTypes(["Crystal", "Void", "Artificial", "Energy"]) }
];

const weatherSeeds: Array<[string, string, string, string | null, string[]]> = [
  ["clear", "Clear", "Calm", null, ["Terrestrial", "Ocean", "Desert", "Ice", "Dead", "Artificial", "Ancient"]],
  ["rain", "Rain", "Precipitation", "rain", ["Terrestrial", "Ocean", "Living", "Bio", "Ancient"]],
  ["blizzard", "Blizzard", "Cryogenic", "snow", ["Ice", "Ocean", "Dead"]],
  ["dust_storm", "Dust Storm", "Particulate", "dust", ["Desert", "Dead", "Primordial"]],
  ["electrical_storm", "Electrical Storm", "Electrical", "rain", ["Ocean", "Gas Giant", "Energy", "Toxic"]],
  ["acid_rain", "Acid Rain", "Corrosive", "acid", ["Toxic", "Lava"]],
  ["ashfall", "Ashfall", "Volcanic", "ash", ["Lava", "Primordial"]],
  ["radiation_storm", "Radiation Storm", "Radiation", null, ["Energy", "Void", "Dead", "Primordial"]],
  ["plasma_storm", "Plasma Storm", "Plasma", null, ["Energy", "Gas Giant", "Void"]],
  ["spore_bloom", "Spore Bloom", "Biological", "spores", ["Living", "Bio"]],
  ["magnetic_disturbance", "Magnetic Disturbance", "Magnetic", null, ["Crystal", "Artificial", "Energy"]]
];

export const canonicalWeatherProfiles: WeatherProfile[] = weatherSeeds.map(([slug, displayName, family, precipitationType, classes], index) => ({
  id: `weather_${slug}`,
  displayName,
  family,
  description: `${displayName} is a canonical possible condition. Active weather state remains game-owned.`,
  intensityRange: [index === 0 ? 0 : 15, index === 0 ? 20 : 95],
  temperatureModifier: index === 0 ? [-2, 2] : [-18, 22],
  visibilityModifier: index === 0 ? [-2, 0] : [-75, -10],
  windSpeedRange: index === 0 ? [0, 18] : [12, 280],
  windDirectionBehavior: index === 0 ? "Locally variable" : "Profile-driven prevailing flow",
  precipitationType,
  precipitationRate: precipitationType ? [1, 180] : [0, 0],
  lightningFrequency: family === "Electrical" || family === "Plasma" ? 72 : 5,
  radiationLevel: family === "Radiation" || family === "Plasma" ? 84 : 3,
  toxicityLevel: family === "Corrosive" || family === "Biological" ? 78 : 2,
  damageType: index === 0 ? null : family.toLowerCase(),
  travelModifier: index === 0 ? 1 : 0.7,
  productionModifier: index === 0 ? 1 : 0.82,
  energyModifier: family === "Electrical" || family === "Plasma" ? 1.18 : 0.96,
  agricultureModifier: family === "Precipitation" ? 1.12 : family === "Corrosive" ? 0.35 : 0.92,
  creatureBehaviorModifier: index === 0 ? 1 : 0.75,
  settlementRisk: index === 0 ? 2 : 55,
  durationRange: index === 0 ? [2, 72] : [1, 36],
  transitionRules: index === 0 ? ["May transition into any compatible weather profile."] : ["Returns to Clear or another compatible profile."],
  compatiblePlanetTypeIds: compatibleTypes(classes),
  compatibleBiomeProfileIds: [],
  compatibleSeasonProfileIds: [],
  audioProfileId: null,
  particleProfileId: null,
  skyProfileId: null
}));

export const canonicalSeasonProfiles: SeasonCycleProfile[] = [
  {
    id: "season_none",
    displayName: "No Seasonal Cycle",
    cycleType: "None",
    compatiblePlanetTypeIds: allTypeIds,
    totalLength: 1,
    seasons: []
  },
  {
    id: "season_four",
    displayName: "Four Season Cycle",
    cycleType: "Four Season",
    compatiblePlanetTypeIds: compatibleTypes(["Terrestrial", "Ocean", "Living", "Bio", "Ancient"]),
    totalLength: 1,
    seasons: ["Vernal", "Estival", "Autumnal", "Hibernal"].map((name, index) => ({
      seasonId: `season_four_${name.toLowerCase()}`,
      displayName: name,
      order: index + 1,
      length: 0.25,
      startPoint: index * 0.25,
      endPoint: (index + 1) * 0.25,
      averageTemperature: 286 + (index === 1 ? 10 : index === 3 ? -12 : 0),
      temperatureRange: [255, 312],
      daylightLength: 12 + (index === 1 ? 3 : index === 3 ? -3 : 0),
      precipitation: 50,
      windConditions: "Variable",
      commonWeatherProfileIds: ["weather_clear", "weather_rain"],
      rareWeatherProfileIds: index === 3 ? ["weather_blizzard"] : ["weather_electrical_storm"],
      biomeModifiers: {},
      vegetationModifiers: { growth: index === 0 ? 1.2 : index === 3 ? 0.35 : 1 },
      migrationModifiers: { activity: index === 2 ? 1.2 : 1 },
      breedingModifiers: { activity: index === 0 ? 1.2 : 1 },
      resourceAvailabilityModifiers: {},
      agricultureModifier: index === 3 ? 0.55 : 1,
      solarEnergyModifier: index === 1 ? 1.15 : index === 3 ? 0.75 : 1,
      travelRiskModifier: index === 3 ? 1.2 : 1,
      hazardModifier: index === 3 ? 1.15 : 1,
      visualProfileId: null,
      audioProfileId: null
    }))
  },
  {
    id: "season_storm",
    displayName: "Storm Cycle",
    cycleType: "Storm",
    compatiblePlanetTypeIds: compatibleTypes(["Gas Giant", "Ocean", "Energy", "Toxic"]),
    totalLength: 1,
    seasons: ["Calm", "Rising", "Peak Storm", "Dissipation"].map((name, index) => ({
      seasonId: `season_storm_${index + 1}`,
      displayName: name,
      order: index + 1,
      length: 0.25,
      startPoint: index * 0.25,
      endPoint: (index + 1) * 0.25,
      averageTemperature: 240,
      temperatureRange: [90, 500],
      daylightLength: 12,
      precipitation: index === 2 ? 90 : 30,
      windConditions: index === 2 ? "Extreme" : "Variable",
      commonWeatherProfileIds: index === 2 ? ["weather_electrical_storm", "weather_plasma_storm"] : ["weather_clear"],
      rareWeatherProfileIds: ["weather_radiation_storm"],
      biomeModifiers: {},
      vegetationModifiers: {},
      migrationModifiers: {},
      breedingModifiers: {},
      resourceAvailabilityModifiers: { atmospheric: index === 2 ? 1.3 : 1 },
      agricultureModifier: 0.5,
      solarEnergyModifier: index === 2 ? 0.55 : 0.9,
      travelRiskModifier: index === 2 ? 1.8 : 1.1,
      hazardModifier: index === 2 ? 1.75 : 1,
      visualProfileId: null,
      audioProfileId: null
    }))
  },
  {
    id: "season_freeze_thaw",
    displayName: "Freeze-Thaw Cycle",
    cycleType: "Freeze-Thaw",
    compatiblePlanetTypeIds: compatibleTypes(["Ice", "Dead", "Primordial"]),
    totalLength: 1,
    seasons: ["Deep Freeze", "Thaw"].map((name, index) => ({
      seasonId: `season_freeze_thaw_${index + 1}`,
      displayName: name,
      order: index + 1,
      length: 0.5,
      startPoint: index * 0.5,
      endPoint: (index + 1) * 0.5,
      averageTemperature: index === 0 ? 170 : 258,
      temperatureRange: [80, 285],
      daylightLength: index === 0 ? 7 : 17,
      precipitation: index === 0 ? 15 : 50,
      windConditions: index === 0 ? "Katabatic" : "Variable",
      commonWeatherProfileIds: index === 0 ? ["weather_blizzard"] : ["weather_clear"],
      rareWeatherProfileIds: ["weather_electrical_storm"],
      biomeModifiers: {},
      vegetationModifiers: {},
      migrationModifiers: {},
      breedingModifiers: {},
      resourceAvailabilityModifiers: {},
      agricultureModifier: index === 0 ? 0.1 : 0.55,
      solarEnergyModifier: index === 0 ? 0.5 : 1,
      travelRiskModifier: index === 0 ? 1.5 : 1,
      hazardModifier: index === 0 ? 1.4 : 1,
      visualProfileId: null,
      audioProfileId: null
    }))
  }
];

export const canonicalBiomeProfiles: BiomeProfile[] = PLANET_CLASS_MODEL.flatMap((definition) =>
  definition.biomes.map((biome) => {
    const traits = classTraits(definition.name);
    return {
      id: profileId("biome", `${definition.name}_${biome}`),
      displayName: biome,
      family: definition.name,
      compatiblePlanetTypeIds: [typeId(definition.name)],
      temperatureRange: traits.hot ? [620, 2200] : traits.cold ? [35, 270] : traits.gas ? [60, 650] : [230, 340],
      humidityRange: traits.wet ? [35, 100] : [0, 45],
      waterAvailabilityRange: traits.wet ? [45, 100] : [0, 35],
      lifeComplexityRange: traits.life ? [25, 100] : [0, traits.exotic ? 40 : 15],
      defaultWeatherProfileIds: canonicalWeatherProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(typeId(definition.name))).map((profile) => profile.id)
    };
  })
);

export const canonicalGeologyProfiles: GeologyProfile[] = PLANET_CLASS_MODEL.map((definition) => {
  const traits = classTraits(definition.name);
  return {
    id: profileId("geology", definition.name),
    displayName: `${definition.name} Geology`,
    compatiblePlanetTypeIds: [typeId(definition.name)],
    coreType: traits.gas ? "Dense metallic-hydrogen core" : traits.artificial ? "Engineered core" : traits.hot ? "Active molten core" : "Differentiated rocky core",
    mantleType: traits.gas ? "Compressed fluid envelope" : traits.artificial ? "Engineered lattice" : "Silicate mantle",
    crustType: traits.gas ? "No solid surface" : traits.artificial ? "Engineered shell" : definition.name === "Ice" ? "Ice-rock crust" : "Rocky crust",
    tectonicActivityRange: traits.hot ? [65, 100] : traits.gas ? [0, 10] : [5, 78],
    volcanicActivityRange: traits.hot ? [72, 100] : traits.cold ? [5, 55] : [0, 70],
    seismicActivityRange: traits.hot ? [55, 100] : [2, 75],
    canonicalResourceIds: []
  };
});

export const canonicalHydrosphereProfiles: HydrosphereProfile[] = [
  { id: "hydrosphere_none", displayName: "No Stable Hydrosphere", compatiblePlanetTypeIds: compatibleTypes(["Desert", "Crystal", "Dead", "Void", "Lava", "Artificial", "Energy"]), waterPresent: false, surfaceCoverageRange: [0, 2], dominantLiquidResourceId: null, dissolvedResourceIds: [], salinityRange: [0, 0], acidityRange: [7, 7] },
  { id: "hydrosphere_water", displayName: "Water Hydrosphere", compatiblePlanetTypeIds: compatibleTypes(["Terrestrial", "Ocean", "Ice", "Living", "Bio", "Ancient"]), waterPresent: Boolean(waterResourceId), surfaceCoverageRange: [5, 100], dominantLiquidResourceId: waterResourceId, dissolvedResourceIds: resourceIds(["Chemical Salts", "Organic Compounds"]), salinityRange: [0.1, 12], acidityRange: [5.5, 9.2] },
  { id: "hydrosphere_hydrocarbon", displayName: "Hydrocarbon Seas", compatiblePlanetTypeIds: compatibleTypes(["Toxic", "Ice", "Primordial"]), waterPresent: false, surfaceCoverageRange: [2, 70], dominantLiquidResourceId: methaneResourceId, dissolvedResourceIds: resourceIds(["Hydrocarbons", "Ammonia"]), salinityRange: [0, 6], acidityRange: [1.5, 10] },
  { id: "hydrosphere_atmospheric", displayName: "Atmospheric Fluid Layers", compatiblePlanetTypeIds: compatibleTypes(["Gas Giant"]), waterPresent: false, surfaceCoverageRange: [0, 0], dominantLiquidResourceId: ResourceService.resolveId("Hydrogen"), dissolvedResourceIds: volatileComposition, salinityRange: [0, 0], acidityRange: [0, 14] }
];

export const canonicalHazardProfiles: HazardProfile[] = [
  ["radiation", "Radiation Exposure", "Radiation", ["Dead", "Energy", "Void", "Primordial"]],
  ["extreme_heat", "Extreme Heat", "Thermal", ["Lava", "Toxic", "Primordial"]],
  ["extreme_cold", "Extreme Cold", "Thermal", ["Ice", "Dead", "Gas Giant"]],
  ["corrosive_atmosphere", "Corrosive Atmosphere", "Chemical", ["Toxic", "Lava"]],
  ["violent_storms", "Violent Storms", "Weather", ["Gas Giant", "Ocean", "Energy"]],
  ["tectonic_instability", "Tectonic Instability", "Geological", ["Lava", "Primordial", "Terrestrial"]],
  ["biological_exposure", "Biological Exposure", "Biological", ["Living", "Bio"]],
  ["exotic_instability", "Exotic Instability", "Exotic", ["Void", "Energy", "Crystal"]],
  ["vacuum", "Vacuum Exposure", "Atmospheric", ["Dead", "Void", "Artificial"]]
].map(([slug, displayName, family, classes]) => ({
  id: `hazard_${slug as string}`,
  displayName: displayName as string,
  family: family as string,
  severityRange: [20, 100] as [number, number],
  frequency: "Variable",
  geographicScope: "Regional to global",
  seasonalModifiers: {},
  biomeModifiers: {},
  damageType: String(family).toLowerCase(),
  exposureThreshold: 25,
  protectionRequirements: [`${displayName} protection`],
  countermeasureResearchIds: [],
  countermeasureEquipmentIds: [],
  travelPenalty: 0.25,
  settlementPenalty: 0.35,
  extractionPenalty: 0.2,
  warningIconId: null,
  visualEffectProfileId: null,
  compatiblePlanetTypeIds: compatibleTypes(classes as string[])
}));

function atmosphereFor(className: string) {
  const planetTypeId = typeId(className);
  return canonicalAtmosphereProfiles.find((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)) ?? canonicalAtmosphereProfiles[0];
}

function climateFor(className: string) {
  const planetTypeId = typeId(className);
  return canonicalClimateProfiles.find((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)) ?? canonicalClimateProfiles[0];
}

function seasonFor(className: string) {
  const planetTypeId = typeId(className);
  return canonicalSeasonProfiles.find((profile) => profile.id !== "season_none" && profile.compatiblePlanetTypeIds.includes(planetTypeId)) ?? canonicalSeasonProfiles[0];
}

function hydrosphereFor(className: string) {
  const planetTypeId = typeId(className);
  return canonicalHydrosphereProfiles.find((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)) ?? canonicalHydrosphereProfiles[0];
}

function abundanceRangeForProfile(profile: NormalizedPlanetResourceProfile | undefined): [number, number] {
  return profile ? [profile.abundanceRange.min, profile.abundanceRange.max] : [15, 85];
}

export function buildPlanetResourceDistributionProfiles(
  profiles: PlanetResourceProfile[] = handoffData.planet_resource_profiles as PlanetResourceProfile[]
): PlanetResourceDistributionProfile[] {
  return normalizePlanetResourceProfiles(profiles).map((profile) => {
    const ids = [...new Set([...profile.primaryResourceIds, ...profile.secondaryResourceIds, ...profile.rareResourceIds, ...profile.exoticResourceIds])];
    const abundanceRange = abundanceRangeForProfile(profile);
    return {
      profileId: `resource_distribution_${profile.id}`,
      displayName: `${profile.planetType} Resource Distribution`,
      compatiblePlanetTypeIds: [typeId(profile.planetType)],
      requiredTags: [profile.planetType],
      excludedTags: [],
      resourceRules: ids.map((resourceId, index) => ({
        resourceId,
        probability: index < profile.primaryResourceIds.length ? 0.9 : index < profile.primaryResourceIds.length + profile.secondaryResourceIds.length ? 0.65 : 0.25,
        abundanceRange,
        richnessRange: [20, 95],
        purityRange: [0.2, 0.92],
        depthRange: [0, 240],
        sourceCategories: ["surface", "subsurface"]
      })),
      distributionPatterns: ["scattered", "layered", "veins", "basins", "regional"],
      biomeAffinityRules: {},
      geologyAffinityRules: {},
      atmosphereAffinityRules: {},
      oceanAffinityRules: {},
      rarityWeights: { common: 1, uncommon: 0.65, rare: 0.3, exotic: 0.08 },
      reserveGenerationRules: {
        deterministic: true,
        seedInputs: ["planet.seed", "planet.id", "planetTypeId", "resourceId", "generationVersion"]
      }
    };
  });
}

const defaultResourceDistributionProfiles = buildPlanetResourceDistributionProfiles();

export const canonicalPlanetTypeProfiles: PlanetTypeProfile[] = PLANET_CLASS_MODEL.map((definition) => {
  const traits = classTraits(definition.name);
  const planetTypeId = typeId(definition.name);
  return {
    canonicalId: planetTypeId,
    displayName: definition.name,
    description: `${definition.name} is an existing canonical Planet Type extended with reusable deep-data defaults and constraints.`,
    family: traits.gas ? "Giant" : traits.artificial ? "Artificial" : traits.exotic ? "Exotic" : "Planetary",
    subtype: null,
    rarity: definition.spawnTier,
    tags: [
      definition.landable ? "landable" : "non-landable",
      definition.colonizable ? "colonizable" : "non-colonizable",
      definition.usesOrbitalGameplay ? "orbital-gameplay" : "surface-gameplay"
    ],
    defaultHabitabilityRange: traits.life ? [45, 95] : definition.colonizable ? [10, 68] : [0, 20],
    defaultGravityRange: traits.gas ? [1.4, 3.4] : [0.15, 1.85],
    defaultTemperatureRange: traits.hot ? [620, 2200] : traits.cold ? [35, 270] : traits.gas ? [60, 650] : [220, 360],
    defaultPressureRange: atmosphereFor(definition.name).pressureRange,
    defaultAtmosphereProfileIds: canonicalAtmosphereProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)).map((profile) => profile.id),
    defaultClimateProfileIds: canonicalClimateProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)).map((profile) => profile.id),
    allowedBiomeProfileIds: canonicalBiomeProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)).map((profile) => profile.id),
    allowedWeatherProfileIds: canonicalWeatherProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)).map((profile) => profile.id),
    allowedSeasonProfileIds: canonicalSeasonProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)).map((profile) => profile.id),
    allowedGeologyProfileIds: canonicalGeologyProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)).map((profile) => profile.id),
    allowedHydrosphereProfileIds: canonicalHydrosphereProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)).map((profile) => profile.id),
    allowedLifeComplexityRange: traits.life ? [15, 100] : [0, traits.exotic ? 30 : 10],
    allowedHazardProfileIds: canonicalHazardProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)).map((profile) => profile.id),
    defaultResourceDistributionProfileIds: defaultResourceDistributionProfiles
      .filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId))
      .map((profile) => profile.profileId),
    planetMaterialProfileId: profileId("planet_material", definition.name),
    defaultPresentationProfileId: profileId("planet_presentation", definition.name),
    generationRules: {
      spawnWeight: definition.spawnWeight,
      subclasses: definition.subclasses,
      biomes: definition.biomes,
      usesSurfaceGeneration: definition.usesSurfaceGeneration,
      usesOrbitalGameplay: definition.usesOrbitalGameplay
    },
    validationRules: [
      "Individual values must remain within type ranges unless explicitly overridden.",
      "Resource IDs must resolve through ResourceService.",
      "Live weather and player state are not canonical Studio content."
    ]
  };
});

export const planetDataScreenContract: PlanetDataScreenContract = {
  id: "planet-data-screen-v1",
  version: "1.0.0",
  layoutOwner: "game-client",
  contentOwner: "studio",
  sections: [
    ["overview", "Overview", "planet", "detected", ["identity.overallHabitability", "identity.resourceRating", "identity.dangerRating"]],
    ["environment", "Environment", "atmosphere", "probed", ["atmosphere.surfacePressure", "hydrosphere.surfaceWaterCoverage"]],
    ["climate", "Climate", "cloud-sun", "scanned", ["climate.averageGlobalTemperature", "climate.stormFrequency"]],
    ["biomes", "Biomes", "trees", "scanned", ["biomes.coveragePercentage"]],
    ["resources", "Resources", "gem", "surveyed", ["resourceOccurrences.abundance", "resourceOccurrences.estimatedReserves"]],
    ["life", "Life", "dna", "explored", ["life.estimatedSpeciesCount", "life.biodiversityIndex"]],
    ["geology", "Geology", "mountain", "surveyed", ["geology.tectonicActivity", "geology.mineralDiversity"]],
    ["civilization", "Civilization", "city", "colonized", ["civilizationSummary.population", "civilizationSummary.economicOutput"]],
    ["exploration", "Exploration", "radar", "detected", ["exploration.estimatedSurveyHours", "discoveries.surveyCompletion"]],
    ["history", "History", "history", "catalogued", ["history.historicalEventIds"]]
  ].map(([sectionId, displayName, iconId, requiredDiscoveryState, summaryMetrics], index) => ({
    sectionId: String(sectionId),
    displayName: String(displayName),
    iconId: String(iconId),
    sortOrder: index + 1,
    requiredDiscoveryState: requiredDiscoveryState as PlanetDiscoveryState,
    visible: true,
    summaryMetrics: summaryMetrics as string[],
    rows: [],
    charts: [],
    progressIndicators: [],
    warnings: [],
    relatedEntityIds: []
  }))
};

function visibility(sectionId: string, requiredDiscoveryState: PlanetDiscoveryState): PlanetFieldVisibility {
  return {
    sectionId,
    requiredDiscoveryState,
    confidence: 0.85,
    estimated: true,
    verified: false,
    hiddenReason: null,
    unlockResearchIds: []
  };
}

function normalizeDiscoveryState(value: string | undefined): PlanetDiscoveryState {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "undiscovered") return "unknown";
  if (normalized === "charted") return "surveyed";
  if (discoveryStates.includes(normalized as PlanetDiscoveryState)) return normalized as PlanetDiscoveryState;
  return "scanned";
}

function composition(profile: AtmosphereProfile, random: () => number) {
  if (!profile.compositionResourceIds.length) return [];
  const weights = profile.compositionResourceIds.map(() => between(random, 0.2, 1, 4));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let used = 0;
  return profile.compositionResourceIds.map((resourceId, index) => {
    const percentage = index === weights.length - 1 ? Number((100 - used).toFixed(3)) : Number(((weights[index] / total) * 100).toFixed(3));
    used += percentage;
    return { resourceId, percentage, confidence: 0.82, notes: "" };
  });
}

function sourceCategoryForPlanet(className: string, resourceId: string): PlanetResourceSourceCategory {
  const resource = ResourceService.getById(resourceId);
  const category = String(resource?.category ?? "").toLowerCase();
  const normalizedClass = className.toLowerCase();
  if (normalizedClass === "gas giant" || category.includes("gas")) return "atmospheric";
  if (normalizedClass === "ocean" || category.includes("liquid") || category.includes("ice")) return "oceanic";
  if (normalizedClass === "living" || normalizedClass === "bio" || category.includes("organic") || category.includes("biological")) return "biological";
  if (normalizedClass === "crystal" || category.includes("crystal")) return "crystalline";
  if (normalizedClass === "artificial" || category.includes("manufactured") || category.includes("synthetic")) return "artificial";
  if (normalizedClass === "energy") return "renewable";
  if (normalizedClass === "lava" || normalizedClass === "primordial") return "geothermal";
  if (category.includes("radioactive") || category.includes("isotope")) return "radioactive";
  if (normalizedClass === "void" || category.includes("exotic")) return "exotic";
  return "subsurface";
}

export function createPlanetResourceOccurrence(
  planetId: string,
  planetTypeName: string,
  resourceId: string,
  seed: string,
  index = 0,
  biomeIds: string[] = []
): PlanetResourceOccurrence {
  const canonicalResourceId = ResourceService.resolveId(resourceId);
  if (!canonicalResourceId) throw new Error(`Invalid resource ID in planet resource occurrence: ${resourceId} does not exist in resource_catalog.`);
  const random = randomSource(`${seed}:${planetId}:${canonicalResourceId}:${index}:${PLANET_DEEP_DATA_GENERATION_VERSION}`);
  const sourceCategory = sourceCategoryForPlanet(planetTypeName, canonicalResourceId);
  const abundance = between(random, 12, 96);
  const purity = between(random, 0.18, 0.94, 3);
  const minimumDepth = sourceCategory === "atmospheric" || sourceCategory === "oceanic" || sourceCategory === "surface" ? 0 : integer(random, 2, 80);
  const maximumDepth = minimumDepth + integer(random, 20, 420);
  return {
    occurrenceId: `${planetId}:resource:${canonicalResourceId}`,
    planetId,
    resourceId: canonicalResourceId,
    sourceCategory,
    discoveryState: "surveyed",
    confidence: between(random, 0.62, 0.98, 3),
    abundance,
    richness: between(random, 15, 98),
    purity,
    estimatedReserves: Math.round(abundance * purity * between(random, 250000, 1400000, 0)),
    reserveUnit: "units",
    minimumDepth,
    maximumDepth,
    accessibility: between(random, 10, 95),
    distributionPattern: pick(["scattered", "layered", "veins", "basins", "regional", "global trace"], random, "scattered"),
    depositCountEstimate: integer(random, 1, 240),
    extractionDifficulty: between(random, 5, 95),
    environmentalRisk: between(random, 0, 95),
    hazardLevel: between(random, 0, 100),
    biomeIds,
    regionIds: [],
    latitudeRange: [integer(random, -90, -5), integer(random, 5, 90)],
    elevationRange: [integer(random, -12000, 0), integer(random, 100, 12000)],
    requiredResearchIds: [],
    requiredTechnologyIds: [],
    requiredEquipmentIds: [],
    renewability: sourceCategory === "biological" || sourceCategory === "renewable" ? "renewable" : "non-renewable",
    regenerationRate: sourceCategory === "biological" || sourceCategory === "renewable" ? between(random, 0.01, 2) : 0,
    depletionState: "untouched",
    currentExtractionModifier: 1,
    strategicValueModifier: between(random, 0.7, 1.8),
    marketValueModifier: between(random, 0.7, 1.8),
    knownDepositIds: [],
    notes: ""
  };
}

function mergeAuthoringOverrides(generated: PlanetDeepData, current?: PlanetDeepData): PlanetDeepData {
  if (!current) return generated;
  const next = structuredClone(generated);
  const lockedSections = current.overrides?.lockedSections ?? [];
  for (const section of lockedSections) {
    if (section in current && section in next) {
      (next as unknown as Record<string, unknown>)[section] = structuredClone((current as unknown as Record<string, unknown>)[section]);
    }
  }
  next.overrides = structuredClone(current.overrides ?? generated.overrides);
  for (const [path, value] of Object.entries(next.overrides.values ?? {})) {
    setPath(next as unknown as Record<string, unknown>, path, structuredClone(value));
  }
  for (const path of next.overrides.lockedFields ?? []) {
    const currentValue = getPath(current as unknown as Record<string, unknown>, path);
    if (currentValue !== undefined) setPath(next as unknown as Record<string, unknown>, path, structuredClone(currentValue));
  }
  return next;
}

function getPath(root: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((value, part) => (value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined), root);
}

function setPath(root: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".").filter(Boolean);
  let cursor = root;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = value;
      return;
    }
    const next = cursor[part];
    if (!next || typeof next !== "object" || Array.isArray(next)) cursor[part] = {};
    cursor = cursor[part] as Record<string, unknown>;
  });
}

export function generatePlanetDeepData(
  planet: GeneratedPlanet,
  profiles: PlanetResourceProfile[] = handoffData.planet_resource_profiles as PlanetResourceProfile[],
  current?: PlanetDeepData
): PlanetDeepData {
  const planetClassName = String(planet.planet_class ?? "Terrestrial");
  const definition = findPlanetClassByName(planetClassName) ?? PLANET_CLASS_MODEL[0];
  const planetSubclass = String(planet.planet_subclass ?? planet.primary_biome ?? definition.subclasses[0] ?? definition.name);
  const planetResources = stringList(planet.resourceIds).length ? stringList(planet.resourceIds) : stringList(planet.resources);
  const planetTraits = stringList(planet.traits);
  const planetAnomalies = stringList(planet.anomalies);
  const planetTypeId = typeId(definition.name);
  const typeProfile = canonicalPlanetTypeProfiles.find((profile) => profile.canonicalId === planetTypeId) ?? canonicalPlanetTypeProfiles[0];
  const traits = classTraits(definition.name);
  const random = randomSource(`${planet.seed}:${planet.id}:${planetTypeId}:${PLANET_DEEP_DATA_GENERATION_VERSION}`);
  const atmosphereProfile = atmosphereFor(definition.name);
  const climateProfile = climateFor(definition.name);
  const hydrosphereProfile = hydrosphereFor(definition.name);
  const geologyProfile = canonicalGeologyProfiles.find((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId)) ?? canonicalGeologyProfiles[0];
  const seasonProfile = seasonFor(definition.name);
  const candidateBiomes = canonicalBiomeProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId));
  const selectedBiome = candidateBiomes.find((profile) => profile.displayName.toLowerCase() === planetSubclass.toLowerCase()) ?? candidateBiomes[0];
  const climateAverage = between(random, climateProfile.temperatureRange[0], climateProfile.temperatureRange[1]);
  const gravityEarth = between(random, typeProfile.defaultGravityRange[0], typeProfile.defaultGravityRange[1]);
  const radiusKm = traits.gas ? between(random, 24500, 78000) : between(random, 1700, 14500);
  const density = traits.gas ? between(random, 0.55, 2.2) : between(random, 2.1, 8.4);
  const massEarth = Number((gravityEarth * Math.pow(radiusKm / 6371, 2)).toFixed(4));
  const waterCoverage = between(random, hydrosphereProfile.surfaceCoverageRange[0], hydrosphereProfile.surfaceCoverageRange[1]);
  const pressure = atmosphereProfile.atmospherePresent ? between(random, atmosphereProfile.pressureRange[0], atmosphereProfile.pressureRange[1]) : 0;
  const weatherProfileIds = canonicalWeatherProfiles
    .filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId))
    .slice(0, Math.max(1, Math.min(4, planet.weather?.length || 2)))
    .map((profile) => profile.id);
  const biomeOccurrenceId = `${planet.id}:biome:${selectedBiome?.id ?? "none"}`;
  const biomes = selectedBiome
    ? [{
        occurrenceId: biomeOccurrenceId,
        planetId: planet.id,
        biomeProfileId: selectedBiome.id,
        displayNameOverride: planet.primary_biome && planet.primary_biome !== definition.name ? planet.primary_biome : null,
        coveragePercentage: 100,
        latitudeRange: [-90, 90] as [number, number],
        elevationRange: [-12000, 12000] as [number, number],
        temperatureRange: selectedBiome.temperatureRange,
        humidityRange: selectedBiome.humidityRange,
        precipitationRange: climateProfile.precipitationRange,
        soilTypeIds: [],
        waterAvailability: between(random, selectedBiome.waterAvailabilityRange[0], selectedBiome.waterAvailabilityRange[1]),
        vegetationDensity: traits.life ? between(random, 25, 98) : between(random, 0, 12),
        faunaDensity: traits.life ? between(random, 12, 92) : between(random, 0, 5),
        resourceModifiers: {},
        hazardLevel: between(random, traits.hot || traits.toxic ? 55 : 5, traits.hot || traits.toxic ? 100 : 70),
        travelDifficulty: between(random, 10, 90),
        settlementSuitability: definition.colonizable ? between(random, 20, 95) : 0,
        agricultureSuitability: traits.life ? between(random, 20, 95) : between(random, 0, 20),
        weatherProfileIds,
        ambientAudioProfileId: null,
        presentationProfileId: typeProfile.defaultPresentationProfileId,
        discoveryState: normalizeDiscoveryState(planet.discoveryState),
        discoveryProgress: clamp(planet.scanProgress ?? planet.completion_percent ?? 0)
      }]
    : [];
  const canonicalPlanetResourceIds = [...new Set(planetResources.map((id) => ResourceService.resolveId(id)).filter((id): id is string => Boolean(id)))];
  const resourceOccurrences = canonicalPlanetResourceIds.map((resourceId, index) => createPlanetResourceOccurrence(planet.id, definition.name, resourceId, planet.seed, index, biomes.map((biome) => biome.occurrenceId)));
  const allowedHazards = canonicalHazardProfiles.filter((profile) => profile.compatiblePlanetTypeIds.includes(planetTypeId));
  const hazards: PlanetHazardOccurrence[] = allowedHazards.slice(0, Math.max(1, Math.min(4, planet.hazards?.length || 1))).map((profile, index) => ({
    occurrenceId: `${planet.id}:hazard:${profile.id}`,
    planetId: planet.id,
    hazardProfileId: profile.id,
    severity: between(random, profile.severityRange[0], profile.severityRange[1]),
    distribution: index === 0 ? "global" : "regional",
    biomeOccurrenceIds: biomes.map((biome) => biome.occurrenceId),
    seasonalModifiers: {},
    discoveryState: "probed",
    confidence: between(random, 0.68, 0.98, 3)
  }));
  const atmosphereSafety = atmosphereProfile.breathability ? clamp(atmosphereProfile.breathability - atmosphereProfile.toxicity * 0.25) : 5;
  const temperatureSafety = clamp(100 - Math.abs(climateAverage - 288) * 0.34);
  const radiationSafety = clamp(100 - (hazards.find((occurrence) => occurrence.hazardProfileId === "hazard_radiation")?.severity ?? 8));
  const waterAvailability = hydrosphereProfile.waterPresent ? clamp(waterCoverage + 20) : 5;
  const resourceSupport = resourceOccurrences.length ? clamp(resourceOccurrences.reduce((sum, occurrence) => sum + occurrence.abundance, 0) / resourceOccurrences.length) : 0;
  const gravityCompatibility = clamp(100 - Math.abs(gravityEarth - 1) * 65);
  const weatherRisk = clamp(hazards.find((occurrence) => occurrence.hazardProfileId === "hazard_violent_storms")?.severity ?? 15);
  const geologicalRisk = clamp(Math.max(geologyProfile.tectonicActivityRange[0], geologyProfile.volcanicActivityRange[0]));
  const overallHabitability = clamp((atmosphereSafety + temperatureSafety + radiationSafety + waterAvailability + gravityCompatibility + resourceSupport + (definition.colonizable ? 75 : 5)) / 7);
  const estimatedSpeciesCount = traits.life ? integer(random, 1200, definition.name === "Living" || definition.name === "Bio" ? 2500000 : 250000) : integer(random, 0, traits.exotic ? 140 : 4);
  const moonCount = Number.parseInt(String(planet.moons), 10) || 0;
  const confidence = 0.86;

  const generated: PlanetDeepData = {
    schemaVersion: PLANET_DEEP_DATA_SCHEMA_VERSION,
    generationVersion: PLANET_DEEP_DATA_GENERATION_VERSION,
    planetId: planet.id,
    planetTypeId,
    identity: {
      scientificDesignation: `${planet.starSystemName ?? planet.star_system}-${planet.orbitIndex ?? planet.orbit_position}`,
      discoveryName: planet.name,
      originalName: planet.name,
      generationSeed: planet.seed,
      generationVersion: PLANET_DEEP_DATA_GENERATION_VERSION,
      rarity: planet.rarity,
      strategicImportance: clamp(resourceSupport * 0.7 + (definition.colonizable ? 25 : 5)),
      scientificImportance: clamp((traits.exotic ? 70 : 30) + between(random, 0, 30)),
      biodiversityRating: clamp(estimatedSpeciesCount > 0 ? Math.log10(estimatedSpeciesCount + 1) * 16 : 0),
      resourceRating: resourceSupport,
      dangerRating: hazards.length ? Math.max(...hazards.map((occurrence) => occurrence.severity)) : 5,
      overallHabitability,
      surveyCompletion: clamp(planet.scanProgress ?? planet.completion_percent ?? 0),
      catalogCompletion: normalizeDiscoveryState(planet.discoveryState) === "catalogued" ? 100 : clamp((planet.scanProgress ?? planet.completion_percent ?? 0) * 0.65)
    },
    classification: {
      family: typeProfile.family,
      className: definition.name,
      subclassName: planet.planet_subclass,
      biomeName: planet.primary_biome,
      tags: [...typeProfile.tags, ...planetTraits.map(slugPlanetTaxonomyValue)]
    },
    orbital: {
      radius: measurement(radiusKm, "km", 1, confidence),
      diameter: measurement(radiusKm * 2, "km", 1, confidence),
      circumference: measurement(2 * Math.PI * radiusKm, "km", 1, confidence),
      mass: measurement(massEarth, "Earth masses", 4, confidence),
      density: measurement(density, "g/cm3", 3, confidence),
      volume: measurement((4 / 3) * Math.PI * Math.pow(radiusKm, 3), "km3", 0, confidence),
      surfaceArea: measurement(4 * Math.PI * Math.pow(radiusKm, 2), "km2", 0, confidence),
      gravity: measurement(gravityEarth, "g", 3, confidence),
      escapeVelocity: measurement(11.186 * Math.sqrt(Math.max(massEarth, 0.001) / Math.max(radiusKm / 6371, 0.001)), "km/s", 2, confidence),
      axialTilt: measurement(between(random, 0, 52), "deg", 2, confidence),
      rotationPeriod: measurement(between(random, traits.gas ? 8 : 10, traits.gas ? 22 : 240), "hours", 2, confidence),
      dayLength: measurement(between(random, traits.gas ? 8 : 10, traits.gas ? 22 : 240), "hours", 2, confidence),
      orbitalPeriod: measurement(between(random, 25, 24000), "days", 2, confidence),
      yearLength: measurement(between(random, 25, 24000), "days", 2, confidence),
      orbitalDistance: measurement(between(random, 0.18, 48), "AU", 3, confidence),
      eccentricity: measurement(between(random, 0, 0.48), "ratio", 4, confidence),
      inclination: measurement(between(random, 0, 18), "deg", 2, confidence),
      periapsis: measurement(between(random, 0.1, 30), "AU", 3, confidence),
      apoapsis: measurement(between(random, 0.2, 60), "AU", 3, confidence),
      tidalLockState: pick(["unlocked", "resonant", "tidally locked"], random, "unlocked"),
      magneticFieldStrength: measurement(between(random, 0, traits.gas ? 18 : 2.5), "Earth fields", 3, confidence),
      magnetosphereRadius: measurement(between(random, 0, traits.gas ? 140 : 18), "planet radii", 2, confidence),
      radiationExposure: measurement(between(random, 0.01, traits.exotic ? 140 : 20), "mSv/day", 3, confidence),
      planetAge: measurement(between(random, 0.2, 12.8), "Gyr", 2, confidence),
      internalHeat: measurement(between(random, 0.01, traits.hot ? 4 : 0.8), "W/m2", 3, confidence),
      moonCount,
      ringSystem: planetAnomalies.includes("Planetary Rings") || traits.gas ? "present" : "none detected",
      impactFrequency: between(random, 0.1, 85)
    },
    physical: {
      materialProfileId: typeProfile.planetMaterialProfileId,
      internalStructure: geologyProfile.coreType,
      surfaceCompositionResourceIds: resourceOccurrences.filter((occurrence) => occurrence.sourceCategory === "surface" || occurrence.sourceCategory === "subsurface").map((occurrence) => occurrence.resourceId),
      albedo: between(random, 0.04, traits.cold ? 0.88 : 0.62, 3),
      thermalInertia: between(random, 5, 95),
      magneticActivity: between(random, 0, 100)
    },
    atmosphere: {
      profileId: atmosphereProfile.id,
      atmospherePresent: atmosphereProfile.atmospherePresent,
      atmosphereType: atmosphereProfile.displayName,
      surfacePressure: measurement(pressure, "bar", 3, confidence),
      atmosphericDensity: measurement(pressure * between(random, 0.7, 1.4), "kg/m3", 3, confidence),
      scaleHeight: measurement(atmosphereProfile.atmospherePresent ? between(random, 4, traits.gas ? 180 : 22) : 0, "km", 2, confidence),
      visibility: atmosphereProfile.atmospherePresent ? between(random, 10, 100) : 100,
      breathability: atmosphereProfile.breathability,
      corrosiveness: atmosphereProfile.corrosiveness,
      toxicity: atmosphereProfile.toxicity,
      radioactivity: traits.exotic ? between(random, 10, 85) : between(random, 0, 12),
      greenhouseStrength: traits.toxic ? between(random, 65, 100) : between(random, 0, 55),
      ozoneProtection: atmosphereProfile.breathability ? between(random, 35, 95) : between(random, 0, 20),
      aerosolDensity: between(random, 0, 100),
      dustDensity: traits.hot || definition.name === "Desert" ? between(random, 45, 100) : between(random, 0, 35),
      cloudDensity: traits.wet || traits.gas ? between(random, 45, 100) : between(random, 0, 45),
      cloudAltitude: measurement(atmosphereProfile.atmospherePresent ? between(random, 1, traits.gas ? 220 : 24) : 0, "km", 2, confidence),
      upperAtmosphereTemperature: measurement(climateAverage - between(random, 15, 110), "K", 1, confidence),
      lowerAtmosphereTemperature: measurement(climateAverage + between(random, -5, 18), "K", 1, confidence),
      windShear: between(random, 0, traits.gas ? 100 : 75),
      electricalActivity: traits.gas || definition.name === "Energy" ? between(random, 55, 100) : between(random, 0, 45),
      auroraIntensity: between(random, 0, 100),
      soundTransmission: atmosphereProfile.atmospherePresent ? between(random, 10, 100) : 0,
      skyColor: planet.visual_theme?.Sky ?? "Black",
      sunsetColor: planet.visual_theme?.Fog ?? "None",
      composition: composition(atmosphereProfile, random)
    },
    climate: {
      profileId: climateProfile.id,
      climateClassification: climateProfile.classification,
      averageGlobalTemperature: measurement(climateAverage, "K", 1, confidence),
      minimumTemperature: measurement(climateProfile.temperatureRange[0], "K", 1, confidence),
      maximumTemperature: measurement(climateProfile.temperatureRange[1], "K", 1, confidence),
      equatorialTemperature: measurement(climateAverage + between(random, 5, 45), "K", 1, confidence),
      temperateTemperature: measurement(climateAverage, "K", 1, confidence),
      polarTemperature: measurement(climateAverage - between(random, 15, 90), "K", 1, confidence),
      daySideTemperature: measurement(climateAverage + between(random, 5, 65), "K", 1, confidence),
      nightSideTemperature: measurement(climateAverage - between(random, 5, 85), "K", 1, confidence),
      oceanTemperature: measurement(hydrosphereProfile.waterPresent ? climateAverage - between(random, 0, 18) : 0, "K", 1, confidence),
      undergroundTemperature: measurement(climateAverage + between(random, 5, traits.hot ? 800 : 140), "K", 1, confidence),
      temperatureVariability: between(random, 2, 95),
      greenhouseEffect: traits.toxic ? between(random, 65, 100) : between(random, 0, 60),
      climateStability: between(random, climateProfile.climateStabilityRange[0], climateProfile.climateStabilityRange[1]),
      iceCoverage: traits.cold ? between(random, 45, 100) : between(random, 0, 30),
      snowCoverage: traits.cold ? between(random, 25, 95) : between(random, 0, 20),
      desertCoverage: definition.name === "Desert" ? between(random, 70, 100) : between(random, 0, 45),
      averageHumidity: between(random, climateProfile.humidityRange[0], climateProfile.humidityRange[1]),
      annualPrecipitation: measurement(between(random, climateProfile.precipitationRange[0], climateProfile.precipitationRange[1]), "cm/year", 1, confidence),
      evaporationRate: between(random, 0, 100),
      stormFrequency: weatherProfileIds.length > 1 ? between(random, 10, 95) : between(random, 0, 20),
      climateTrend: pick(["stable", "warming", "cooling", "cyclic", "irregular"], random, "stable"),
      longTermWarmingRate: between(random, 0, 0.35, 4),
      longTermCoolingRate: between(random, 0, 0.35, 4),
      climateCycleLength: measurement(between(random, 5, 100000), "years", 1, confidence)
    },
    weatherProfileIds,
    seasonCycle: { profileId: seasonProfile.id, currentCanonicalPhase: null, seasons: seasonProfile.seasons },
    hydrosphere: {
      profileId: hydrosphereProfile.id,
      waterPresent: hydrosphereProfile.waterPresent,
      surfaceWaterCoverage: waterCoverage,
      oceanCount: hydrosphereProfile.waterPresent ? integer(random, 1, 12) : 0,
      oceanAverageDepth: measurement(hydrosphereProfile.waterPresent ? between(random, 0.2, 35) : 0, "km", 2, confidence),
      deepestOcean: measurement(hydrosphereProfile.waterPresent ? between(random, 1, 120) : 0, "km", 2, confidence),
      freshwaterAvailability: hydrosphereProfile.waterPresent ? between(random, 0, 85) : 0,
      iceCoverage: traits.cold ? between(random, 40, 100) : between(random, 0, 35),
      undergroundWater: hydrosphereProfile.waterPresent ? between(random, 5, 95) : 0,
      atmosphericWater: hydrosphereProfile.waterPresent ? between(random, 0.1, 35) : 0,
      dominantLiquidResourceId: hydrosphereProfile.dominantLiquidResourceId,
      dissolvedResourceIds: hydrosphereProfile.dissolvedResourceIds,
      salinity: between(random, hydrosphereProfile.salinityRange[0], hydrosphereProfile.salinityRange[1]),
      acidity: between(random, hydrosphereProfile.acidityRange[0], hydrosphereProfile.acidityRange[1]),
      averageOceanTemperature: measurement(hydrosphereProfile.waterPresent ? climateAverage - between(random, 0, 15) : 0, "K", 1, confidence),
      tidalStrength: between(random, 0, 100),
      currentStrength: between(random, 0, 100),
      aquaticHabitability: hydrosphereProfile.waterPresent && traits.life ? between(random, 35, 100) : 0,
      contaminationLevel: traits.toxic ? between(random, 55, 100) : between(random, 0, 35)
    },
    biomes,
    resourceOccurrences,
    speciesOccurrences: [],
    life: {
      estimatedSpeciesCount,
      discoveredSpeciesCount: Math.floor(estimatedSpeciesCount * clamp(planet.completion_percent ?? 0) / 100),
      endemicSpeciesCount: traits.life ? Math.floor(estimatedSpeciesCount * between(random, 0.2, 0.85)) : 0,
      extinctSpeciesCount: traits.life ? integer(random, 0, Math.max(1, Math.floor(estimatedSpeciesCount * 0.05))) : 0,
      dominantLifeformId: null,
      sapientSpeciesCount: planet.ancient_civilization && planet.ancient_civilization !== "None" ? 1 : 0,
      megafaunaCount: traits.life ? integer(random, 0, 240) : 0,
      microbialDiversity: traits.life ? between(random, 35, 100) : between(random, 0, 12),
      biodiversityIndex: traits.life ? between(random, 35, 100) : between(random, 0, 8),
      ecologicalStability: traits.life ? between(random, 25, 98) : 0,
      foodWebComplexity: traits.life ? between(random, 25, 100) : 0,
      invasiveSpeciesCount: 0,
      extinctionRisk: traits.life ? between(random, 0, 75) : 0
    },
    geology: {
      profileId: geologyProfile.id,
      coreType: geologyProfile.coreType,
      mantleType: geologyProfile.mantleType,
      crustType: geologyProfile.crustType,
      crustThickness: measurement(traits.gas ? 0 : between(random, 3, 120), "km", 2, confidence),
      plateCount: traits.gas ? 0 : integer(random, 0, 28),
      tectonicActivity: between(random, geologyProfile.tectonicActivityRange[0], geologyProfile.tectonicActivityRange[1]),
      volcanicActivity: between(random, geologyProfile.volcanicActivityRange[0], geologyProfile.volcanicActivityRange[1]),
      seismicActivity: between(random, geologyProfile.seismicActivityRange[0], geologyProfile.seismicActivityRange[1]),
      erosionRate: between(random, 0, 100),
      impactCraters: integer(random, 0, 500000),
      mountainCoverage: traits.gas ? 0 : between(random, 0, 65),
      canyonCoverage: traits.gas ? 0 : between(random, 0, 55),
      caveDensity: traits.gas ? 0 : between(random, 0, 80),
      lavaFieldCoverage: traits.hot ? between(random, 35, 100) : between(random, 0, 25),
      glacierCoverage: traits.cold ? between(random, 40, 100) : between(random, 0, 20),
      permafrostCoverage: traits.cold ? between(random, 30, 100) : between(random, 0, 20),
      soilTypeIds: [],
      mineralDiversity: resourceOccurrences.length ? clamp(resourceOccurrences.length * 8 + between(random, 0, 30)) : between(random, 0, 20),
      geologicalAge: measurement(between(random, 0.05, 12.5), "Gyr", 2, confidence),
      continentCount: hydrosphereProfile.waterPresent ? integer(random, 0, 14) : integer(random, 1, 22),
      oceanCount: hydrosphereProfile.waterPresent ? integer(random, 1, 12) : 0,
      highestPoint: measurement(traits.gas ? 0 : between(random, 1, 32), "km", 2, confidence),
      lowestPoint: measurement(traits.gas ? 0 : -between(random, 0.2, 18), "km", 2, confidence),
      deepestOcean: measurement(hydrosphereProfile.waterPresent ? between(random, 1, 120) : 0, "km", 2, confidence),
      longestRiver: measurement(hydrosphereProfile.waterPresent ? between(random, 0, 22000) : 0, "km", 0, confidence),
      largestDesert: measurement(traits.gas ? 0 : between(random, 0, 120000000), "km2", 0, confidence),
      largestForest: measurement(traits.life ? between(random, 0, 150000000) : 0, "km2", 0, confidence),
      largestGlacier: measurement(traits.cold ? between(random, 0, 180000000) : 0, "km2", 0, confidence),
      compositionResourceIds: resourceOccurrences.map((occurrence) => occurrence.resourceId)
    },
    hazards,
    habitability: {
      overall: overallHabitability,
      atmosphereSafety,
      temperatureSafety,
      radiationSafety,
      gravityCompatibility,
      waterAvailability,
      foodPotential: traits.life ? between(random, 30, 95) : between(random, 0, 15),
      soilFertility: traits.life ? between(random, 25, 95) : between(random, 0, 15),
      diseaseRisk: traits.life ? between(random, 5, 80) : 0,
      predatorRisk: traits.life ? between(random, 0, 75) : 0,
      weatherRisk,
      geologicalRisk,
      resourceSupport,
      settlementViability: definition.colonizable ? clamp(overallHabitability * 0.75 + resourceSupport * 0.25) : 0,
      terraformingPotential: definition.colonizable ? clamp(100 - overallHabitability * 0.45) : 0,
      scoringInputs: { atmosphereSafety, temperatureSafety, radiationSafety, gravityCompatibility, waterAvailability, resourceSupport, weatherRisk, geologicalRisk },
      explanation: [
        `Atmosphere safety contributes ${Math.round(atmosphereSafety)} points.`,
        `Temperature safety contributes ${Math.round(temperatureSafety)} points.`,
        `Canonical resource support contributes ${Math.round(resourceSupport)} points.`,
        definition.colonizable ? "The existing Planet Type permits colonization." : "The existing Planet Type does not permit surface colonization."
      ]
    },
    civilizationSummary: {
      currentOwnerFactionId: null,
      population: 0,
      settlementCount: planet.colonized ? 1 : 0,
      capitalSettlementId: null,
      factionInfluence: 0,
      economicOutput: Number(planet.economy?.["Trade Value"] ?? 0),
      researchOutput: Number(planet.science?.["Research Bonus"] ?? 0),
      foodOutput: Number(planet.economy?.["Agriculture Value"] ?? 0),
      energyOutput: 0,
      defenseRating: 0,
      tradeRouteIds: [],
      activeMissionIds: [],
      activeEventIds: [],
      ruinDiscoveryIds: [],
      archaeologicalSiteIds: [],
      historicalEventIds: [],
      terraformingHistoryIds: [],
      colonizationHistoryIds: []
    },
    exploration: {
      recommendedSurveyActions: ["probe", "scan", "survey", "catalog"],
      estimatedSurveyHours: integer(random, 4, traits.gas || traits.exotic ? 240 : 80),
      unexploredRegionCount: integer(random, 2, 80),
      knownLandmarkIds: []
    },
    discoveries: {
      discoveryIds: [],
      anomalyIds: planetAnomalies.map((anomaly) => slugPlanetTaxonomyValue(anomaly)),
      surveyCompletion: clamp(planet.scanProgress ?? planet.completion_percent ?? 0),
      catalogCompletion: normalizeDiscoveryState(planet.discoveryState) === "catalogued" ? 100 : clamp((planet.scanProgress ?? planet.completion_percent ?? 0) * 0.65)
    },
    history: {
      historicalEventIds: [],
      colonizationHistoryIds: [],
      terraformingHistoryIds: [],
      summary: planet.story
    },
    simulationRules: {
      profileVersion: PLANET_DEEP_DATA_SCHEMA_VERSION,
      deterministic: true,
      liveStateOwner: "game-client",
      persistenceOwner: "player-persistence",
      canonicalOwner: "studio"
    },
    discoveryVisibility: [
      visibility("identity", "detected"),
      visibility("orbital", "detected"),
      visibility("atmosphere", "probed"),
      visibility("climate", "probed"),
      visibility("weather", "scanned"),
      visibility("biomes", "scanned"),
      visibility("resources", "surveyed"),
      visibility("geology", "surveyed"),
      visibility("seasons", "surveyed"),
      visibility("habitability", "surveyed"),
      visibility("life", "explored"),
      visibility("civilization", "colonized"),
      visibility("history", "catalogued")
    ],
    presentation: {
      presentationProfileId: typeProfile.defaultPresentationProfileId,
      summary: `${planet.name} is a ${planetSubclass.toLowerCase()} ${definition.name.toLowerCase()} with ${resourceOccurrences.length} canonical resource occurrences and ${Math.round(overallHabitability)}% resolved habitability.`,
      highlightMetricIds: ["identity.overallHabitability", "identity.resourceRating", "identity.dangerRating", "life.biodiversityIndex"],
      warningSeverity: hazards.some((occurrence) => occurrence.severity >= 85) ? "warning" : null
    },
    overrides: current?.overrides ?? { lockedSections: [], lockedFields: [], values: {} }
  };

  return mergeAuthoringOverrides(generated, current);
}

export function ensurePlanetDeepData(planet: GeneratedPlanet, profiles?: PlanetResourceProfile[]) {
  const current = planet.deepPlanetData ?? planet.deep_planet_data;
  return generatePlanetDeepData(planet, profiles, current);
}

export function validatePlanetDeepData(data: PlanetDeepData): PlanetValidationIssue[] {
  const issues: PlanetValidationIssue[] = [];
  const typeProfile = canonicalPlanetTypeProfiles.find((profile) => profile.canonicalId === data.planetTypeId);
  const researchIds = new Set(handoffData.research.map((research) => research.id));
  const weatherById = new Map(canonicalWeatherProfiles.map((profile) => [profile.id, profile]));
  const validProfileReference = <T extends { id: string; compatiblePlanetTypeIds: string[] }>(
    value: T | undefined,
    kind: string,
    path: string
  ) => {
    if (!value) {
      issues.push({ severity: "error", code: `invalid_${kind}_profile`, message: `${titleFromValidationKind(kind)} profile does not exist.`, path, relatedIds: [] });
      return;
    }
    if (!value.compatiblePlanetTypeIds.includes(data.planetTypeId)) {
      issues.push({ severity: "warning", code: `incompatible_${kind}_profile`, message: `${value.id} is not compatible with ${data.planetTypeId}.`, path, relatedIds: [value.id, data.planetTypeId] });
    }
  };
  if (!typeProfile) issues.push({ severity: "error", code: "invalid_planet_type", message: `Planet Type ${data.planetTypeId} does not exist.`, path: "planetTypeId", relatedIds: [data.planetTypeId] });
  validProfileReference(canonicalAtmosphereProfiles.find((profile) => profile.id === data.atmosphere.profileId), "atmosphere", "atmosphere.profileId");
  validProfileReference(canonicalClimateProfiles.find((profile) => profile.id === data.climate.profileId), "climate", "climate.profileId");
  validProfileReference(canonicalHydrosphereProfiles.find((profile) => profile.id === data.hydrosphere.profileId), "hydrosphere", "hydrosphere.profileId");
  validProfileReference(canonicalGeologyProfiles.find((profile) => profile.id === data.geology.profileId), "geology", "geology.profileId");

  const seenResources = new Set<string>();
  const seenOccurrences = new Set<string>();
  for (const occurrence of data.resourceOccurrences) {
    if (!ResourceService.getById(occurrence.resourceId)) {
      issues.push({ severity: "error", code: "invalid_resource_id", message: `Invalid resource ID in planet resource occurrence: ${occurrence.resourceId} does not exist in resource_catalog.`, path: `resourceOccurrences.${occurrence.occurrenceId}.resourceId`, relatedIds: [occurrence.resourceId] });
    }
    if (seenOccurrences.has(occurrence.occurrenceId)) {
      issues.push({ severity: "error", code: "duplicate_resource_occurrence_id", message: `Occurrence ID ${occurrence.occurrenceId} is duplicated.`, path: "resourceOccurrences", relatedIds: [occurrence.occurrenceId] });
    }
    seenOccurrences.add(occurrence.occurrenceId);
    if (seenResources.has(occurrence.resourceId)) {
      issues.push({ severity: "error", code: "duplicate_resource_occurrence", message: `Resource ${occurrence.resourceId} occurs more than once on ${data.planetId}.`, path: "resourceOccurrences", relatedIds: [occurrence.resourceId] });
    }
    seenResources.add(occurrence.resourceId);
    if (occurrence.minimumDepth > occurrence.maximumDepth) {
      issues.push({ severity: "error", code: "invalid_depth_range", message: `Minimum depth exceeds maximum depth for ${occurrence.resourceId}.`, path: `resourceOccurrences.${occurrence.occurrenceId}`, relatedIds: [occurrence.resourceId] });
    }
    for (const researchId of occurrence.requiredResearchIds) {
      if (!researchIds.has(researchId)) {
        issues.push({ severity: "error", code: "orphan_resource_research_requirement", message: `Resource occurrence ${occurrence.occurrenceId} references missing research ${researchId}.`, path: `resourceOccurrences.${occurrence.occurrenceId}.requiredResearchIds`, relatedIds: [researchId] });
      }
    }
  }

  const atmosphereTotal = data.atmosphere.composition.reduce((total, entry) => total + entry.percentage, 0);
  if (data.atmosphere.atmospherePresent && Math.abs(atmosphereTotal - 100) > 0.01) {
    issues.push({ severity: "error", code: "invalid_atmosphere_total", message: `Atmosphere composition totals ${atmosphereTotal.toFixed(3)}%, expected 100%.`, path: "atmosphere.composition", relatedIds: [] });
  }
  for (const entry of data.atmosphere.composition) {
    if (!ResourceService.getById(entry.resourceId)) {
      issues.push({ severity: "error", code: "invalid_atmosphere_resource", message: `Atmosphere composition resource ${entry.resourceId} does not exist.`, path: "atmosphere.composition", relatedIds: [entry.resourceId] });
    }
  }

  const biomeCoverage = data.biomes.reduce((total, occurrence) => total + occurrence.coveragePercentage, 0);
  if (biomeCoverage > 100.001) {
    issues.push({ severity: "error", code: "biome_coverage_exceeded", message: `Biome coverage is ${biomeCoverage.toFixed(2)}%, above 100%.`, path: "biomes", relatedIds: data.biomes.map((occurrence) => occurrence.biomeProfileId) });
  }
  for (const occurrence of data.biomes) {
    const profile = canonicalBiomeProfiles.find((candidate) => candidate.id === occurrence.biomeProfileId);
    if (!profile) {
      issues.push({ severity: "error", code: "invalid_biome_profile", message: `Biome profile ${occurrence.biomeProfileId} does not exist.`, path: "biomes", relatedIds: [occurrence.biomeProfileId] });
    } else if (!profile.compatiblePlanetTypeIds.includes(data.planetTypeId)) {
      issues.push({ severity: "warning", code: "incompatible_biome", message: `Biome ${occurrence.biomeProfileId} is not a default for ${data.planetTypeId}.`, path: "biomes", relatedIds: [occurrence.biomeProfileId, data.planetTypeId] });
    }
    for (const weatherProfileId of occurrence.weatherProfileIds) {
      if (!weatherById.has(weatherProfileId)) {
        issues.push({ severity: "error", code: "invalid_biome_weather_profile", message: `Biome occurrence ${occurrence.occurrenceId} references missing weather ${weatherProfileId}.`, path: `biomes.${occurrence.occurrenceId}.weatherProfileIds`, relatedIds: [weatherProfileId] });
      }
    }
  }

  for (const weatherProfileId of data.weatherProfileIds) {
    const weather = weatherById.get(weatherProfileId);
    if (!weather) {
      issues.push({ severity: "error", code: "invalid_weather_profile", message: `Weather profile ${weatherProfileId} does not exist.`, path: "weatherProfileIds", relatedIds: [weatherProfileId] });
    } else if (!weather.compatiblePlanetTypeIds.includes(data.planetTypeId)) {
      issues.push({ severity: "warning", code: "weather_planet_type_mismatch", message: `Weather ${weatherProfileId} is incompatible with ${data.planetTypeId}.`, path: "weatherProfileIds", relatedIds: [weatherProfileId, data.planetTypeId] });
    }
  }

  const seasonLength = data.seasonCycle.seasons.reduce((total, season) => total + season.length, 0);
  if (data.seasonCycle.seasons.length && Math.abs(seasonLength - 1) > 0.001) {
    issues.push({ severity: "error", code: "season_duration_mismatch", message: `Season lengths total ${seasonLength}, expected 1 canonical cycle.`, path: "seasonCycle.seasons", relatedIds: [] });
  }
  for (const season of data.seasonCycle.seasons) {
    for (const weatherProfileId of [...season.commonWeatherProfileIds, ...season.rareWeatherProfileIds]) {
      if (!weatherById.has(weatherProfileId)) {
        issues.push({ severity: "error", code: "invalid_season_weather_profile", message: `Season ${season.seasonId} references missing weather ${weatherProfileId}.`, path: `seasonCycle.${season.seasonId}`, relatedIds: [weatherProfileId] });
      }
    }
  }

  for (const occurrence of data.hazards) {
    if (!canonicalHazardProfiles.some((profile) => profile.id === occurrence.hazardProfileId)) {
      issues.push({ severity: "error", code: "invalid_hazard_profile", message: `Hazard profile ${occurrence.hazardProfileId} does not exist.`, path: "hazards", relatedIds: [occurrence.hazardProfileId] });
    }
  }

  for (const occurrence of data.speciesOccurrences) {
    if (!occurrence.speciesId) {
      issues.push({ severity: "error", code: "missing_species_id", message: `Species occurrence ${occurrence.occurrenceId} has no canonical species ID.`, path: `speciesOccurrences.${occurrence.occurrenceId}.speciesId`, relatedIds: [] });
    }
    if (!data.atmosphere.atmospherePresent && occurrence.populationEstimate > 0 && !["synthetic", "exotic"].includes(occurrence.nativeStatus.toLowerCase())) {
      issues.push({ severity: "scientific_plausibility", code: "species_atmosphere_mismatch", message: `Species ${occurrence.speciesId} has a population on an airless planet without a synthetic or exotic override.`, path: `speciesOccurrences.${occurrence.occurrenceId}`, relatedIds: [occurrence.speciesId] });
    }
  }

  for (const visibility of data.discoveryVisibility) {
    if (!discoveryStates.includes(visibility.requiredDiscoveryState)) {
      issues.push({ severity: "error", code: "invalid_discovery_visibility_state", message: `Visibility section ${visibility.sectionId} uses invalid state ${visibility.requiredDiscoveryState}.`, path: `discoveryVisibility.${visibility.sectionId}`, relatedIds: [] });
    }
    if (visibility.confidence < 0 || visibility.confidence > 1) {
      issues.push({ severity: "error", code: "invalid_visibility_confidence", message: `Visibility confidence for ${visibility.sectionId} must be between 0 and 1.`, path: `discoveryVisibility.${visibility.sectionId}.confidence`, relatedIds: [] });
    }
    for (const researchId of visibility.unlockResearchIds) {
      if (!researchIds.has(researchId)) {
        issues.push({ severity: "error", code: "orphan_visibility_research_requirement", message: `Visibility section ${visibility.sectionId} references missing research ${researchId}.`, path: `discoveryVisibility.${visibility.sectionId}.unlockResearchIds`, relatedIds: [researchId] });
      }
    }
  }

  validateScientificValues(data, issues);
  if (data.atmosphere.surfacePressure.value > 1000 && data.climate.averageGlobalTemperature.value < 40) {
    issues.push({ severity: "scientific_plausibility", code: "temperature_pressure_mismatch", message: "Extreme atmospheric pressure combined with near-absolute-zero temperature requires an explicit scientific override.", path: "atmosphere.surfacePressure", relatedIds: [] });
  }
  if (!data.presentation.presentationProfileId) {
    issues.push({ severity: "error", code: "missing_presentation_profile", message: "Planet presentation profile is missing.", path: "presentation.presentationProfileId", relatedIds: [] });
  }
  if (!data.orbital.radius.displayValue || !data.climate.averageGlobalTemperature.displayValue) {
    issues.push({ severity: "error", code: "missing_runtime_display_value", message: "Required formatted runtime display values are missing.", path: "orbital", relatedIds: [] });
  }
  if (data.climate.averageGlobalTemperature.value < 0) {
    issues.push({ severity: "scientific_plausibility", code: "invalid_temperature", message: "Temperature cannot be below absolute zero.", path: "climate.averageGlobalTemperature", relatedIds: [] });
  }
  return issues;
}

function titleFromValidationKind(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function validateScientificValues(data: PlanetDeepData, issues: PlanetValidationIssue[]) {
  const visit = (value: unknown, path: string) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, `${path}.${index}`));
      return;
    }
    const record = value as Record<string, unknown>;
    if ("value" in record && "unit" in record && "displayValue" in record) {
      if (typeof record.value !== "number" || !Number.isFinite(record.value)) {
        issues.push({ severity: "error", code: "invalid_scientific_value", message: `Scientific value at ${path} must be finite.`, path, relatedIds: [] });
      }
      if (typeof record.unit !== "string" || !record.unit) {
        issues.push({ severity: "error", code: "invalid_scientific_unit", message: `Scientific value at ${path} requires a canonical unit.`, path, relatedIds: [] });
      }
      if (typeof record.displayValue !== "string" || !record.displayValue) {
        issues.push({ severity: "error", code: "missing_runtime_display_value", message: `Scientific value at ${path} requires a formatted display value.`, path, relatedIds: [] });
      }
      return;
    }
    for (const [key, nested] of Object.entries(record)) visit(nested, path ? `${path}.${key}` : key);
  };
  visit(data, "");
}

export function buildPlanetDeepDataFramework(
  profiles: PlanetResourceProfile[] = handoffData.planet_resource_profiles as PlanetResourceProfile[]
): PlanetDeepDataFramework {
  return {
    schemaVersion: PLANET_DEEP_DATA_SCHEMA_VERSION,
    generationVersion: PLANET_DEEP_DATA_GENERATION_VERSION,
    planetTypeProfiles: canonicalPlanetTypeProfiles,
    resourceDistributionProfiles: buildPlanetResourceDistributionProfiles(profiles),
    atmosphereProfiles: canonicalAtmosphereProfiles,
    climateProfiles: canonicalClimateProfiles,
    weatherProfiles: canonicalWeatherProfiles,
    seasonProfiles: canonicalSeasonProfiles,
    biomeProfiles: canonicalBiomeProfiles,
    geologyProfiles: canonicalGeologyProfiles,
    hydrosphereProfiles: canonicalHydrosphereProfiles,
    hazardProfiles: canonicalHazardProfiles,
    discoveryStates,
    validationRules: [
      "Every Planet must resolve one existing Planet Type.",
      "Every PlanetResourceOccurrence resourceId must resolve through ResourceService.",
      "Atmosphere composition totals must equal 100 percent.",
      "Biome coverage cannot exceed 100 percent.",
      "Season lengths must equal one canonical cycle.",
      "Live weather and player-specific state are never exported as canonical content.",
      "Author-locked fields and sections survive deterministic regeneration."
    ],
    dataScreenContract: planetDataScreenContract
  };
}

export const planetDeepDataFramework = buildPlanetDeepDataFramework();
