import { PLANET_CLASS_MODEL } from "@/lib/planets/class-model";
import { ResourceService } from "@/lib/resources/service";
import type { PlanetResourceProfile } from "@/types/schema";

export type NormalizedPlanetResourceProfile = {
  id: string;
  planetType: string;
  biome: string;
  subclass: string;
  rarityBias: string;
  primaryResourceIds: string[];
  secondaryResourceIds: string[];
  rareResourceIds: string[];
  exoticResourceIds: string[];
  resourceWeights: Record<string, number>;
  abundanceRange: { min: number; max: number };
  miningDifficultyModifier: number;
  refinementDifficultyModifier: number;
  notes: string;
  debugResourceNames: {
    primary: string[];
    secondary: string[];
    rare: string[];
    exotic: string[];
  };
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function asList(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function profileBucket(profile: PlanetResourceProfile, camelKey: keyof PlanetResourceProfile, snakeKey: keyof PlanetResourceProfile, legacyKey: keyof PlanetResourceProfile) {
  return asList((profile[camelKey] as string[] | undefined) ?? (profile[snakeKey] as string[] | undefined) ?? (profile[legacyKey] as string[] | undefined));
}

function resolveBucket(profile: PlanetResourceProfile, bucketName: string, values: string[]) {
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const value of values) {
    const id = ResourceService.resolveId(value);

    if (!id || !ResourceService.getById(id)) {
      throw new Error(`Invalid resource ID in planet_resource_profiles: ${value} does not exist in resource_catalog.`);
    }

    if (value !== id && value.toLowerCase() === id.toLowerCase()) {
      throw new Error(`Invalid resource ID in planet_resource_profiles: ${value} does not exist in resource_catalog.`);
    }

    if (seen.has(id)) {
      if (value === id) {
        throw new Error(`Duplicate resource ID in planet_resource_profiles: ${id} appears more than once in ${profile.id}.${bucketName}.`);
      }
      continue;
    }

    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

function abundanceRange(resourceDensity: string) {
  const density = resourceDensity.toLowerCase();
  if (density.includes("very rich") || density.includes("exotic")) return { min: 70, max: 100 };
  if (density.includes("rich") || density.includes("abundant")) return { min: 55, max: 90 };
  if (density.includes("moderate") || density.includes("balanced") || density.includes("atmospheric")) return { min: 35, max: 75 };
  if (density.includes("sparse") || density.includes("trace") || density.includes("low")) return { min: 5, max: 45 };
  return { min: 20, max: 65 };
}

function resourceWeight(id: string, bucket: "primary" | "secondary" | "rare" | "exotic") {
  const resource = ResourceService.getById(id);
  const rarity = resource?.rarity.toLowerCase() ?? "";
  const bucketWeight = bucket === "primary" ? 100 : bucket === "secondary" ? 65 : bucket === "rare" ? 32 : 12;
  const rarityWeight = rarity.includes("common") ? 12 : rarity.includes("uncommon") ? 8 : rarity.includes("rare") ? 4 : rarity.includes("exotic") ? 2 : 6;
  return bucketWeight + rarityWeight;
}

function buildResourceWeights(profile: Pick<NormalizedPlanetResourceProfile, "primaryResourceIds" | "secondaryResourceIds" | "rareResourceIds" | "exoticResourceIds">) {
  return Object.fromEntries([
    ...profile.primaryResourceIds.map((id) => [id, resourceWeight(id, "primary")]),
    ...profile.secondaryResourceIds.map((id) => [id, resourceWeight(id, "secondary")]),
    ...profile.rareResourceIds.map((id) => [id, resourceWeight(id, "rare")]),
    ...profile.exoticResourceIds.map((id) => [id, resourceWeight(id, "exotic")])
  ]);
}

export function normalizePlanetResourceProfile(profile: PlanetResourceProfile): NormalizedPlanetResourceProfile {
  const primaryResourceIds = resolveBucket(profile, "primaryResourceIds", profileBucket(profile, "primaryResourceIds", "primary_resource_ids", "guaranteed_resources"));
  const secondaryResourceIds = resolveBucket(profile, "secondaryResourceIds", profileBucket(profile, "secondaryResourceIds", "secondary_resource_ids", "common_resources"));
  const rareResourceIds = resolveBucket(profile, "rareResourceIds", profileBucket(profile, "rareResourceIds", "rare_resource_ids", "rare_resources"));
  const exoticResourceIds = resolveBucket(profile, "exoticResourceIds", profileBucket(profile, "exoticResourceIds", "exotic_resource_ids", "exotic_resources"));
  const normalizedBase = {
    primaryResourceIds,
    secondaryResourceIds,
    rareResourceIds,
    exoticResourceIds
  };

  return {
    id: profile.id,
    planetType: profile.planetType ?? profile.planet_class,
    biome: profile.biome ?? profile.planet_class,
    subclass: profile.subclass,
    rarityBias: profile.rarityBias ?? profile.planet_rarity_bias,
    ...normalizedBase,
    resourceWeights: profile.resourceWeights ?? profile.resource_weights ?? buildResourceWeights(normalizedBase),
    abundanceRange: profile.abundanceRange ?? profile.abundance_range ?? abundanceRange(profile.resource_density),
    miningDifficultyModifier: profile.miningDifficultyModifier ?? profile.mining_difficulty_modifier ?? profile.mining_difficulty,
    refinementDifficultyModifier: profile.refinementDifficultyModifier ?? profile.refinement_difficulty_modifier ?? Math.max(1, Math.round((profile.mining_difficulty || 1) * 0.8)),
    notes: profile.notes ?? profile.scientific_notes,
    debugResourceNames: {
      primary: ResourceService.namesForIds(primaryResourceIds),
      secondary: ResourceService.namesForIds(secondaryResourceIds),
      rare: ResourceService.namesForIds(rareResourceIds),
      exotic: ResourceService.namesForIds(exoticResourceIds)
    }
  };
}

export function normalizePlanetResourceProfiles(profiles: PlanetResourceProfile[]) {
  return profiles.map(normalizePlanetResourceProfile);
}

export function validatePlanetResourceProfiles(profiles: PlanetResourceProfile[]) {
  const normalizedProfiles = normalizePlanetResourceProfiles(profiles);
  const profileKeys = new Set(normalizedProfiles.map((profile) => normalizeKey(profile.planetType)));
  const missingPlanetTypes = PLANET_CLASS_MODEL.map((planetClass) => planetClass.name).filter((planetType) => !profileKeys.has(normalizeKey(planetType)));

  if (missingPlanetTypes.length) {
    throw new Error(`Missing planet_resource_profiles for planet types: ${missingPlanetTypes.join(", ")}.`);
  }

  return normalizedProfiles;
}

export function resourceNamesForIds(ids: string[]) {
  return ResourceService.namesForIds(ids);
}
