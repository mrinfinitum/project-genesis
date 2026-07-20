import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getGameData } from "@/lib/data";
import { generatePlanet } from "@/lib/planets/generator";
import { PLANET_CLASS_MODEL } from "@/lib/planets/class-model";
import {
  PLANET_CLASS_RARITY_PROFILES,
  PLANET_RARITIES,
  SYSTEM_RARITY_MODIFIERS
} from "@/lib/planets/rarity";
import { planetGenerationRuleRows, planetaryRulesDisplayRows } from "@/lib/planets/rule-rows";
import {
  normalizePlanetResourceProfiles,
  validatePlanetResourceProfiles
} from "@/lib/resources/planet-resource-profiles";
import { ResourceService } from "@/lib/resources/service";
import {
  PLANET_SUB_SEED_KEYS,
  SEED_GENERATION_VERSION,
  deriveSeed,
  hashSeed,
  planetSubSeeds
} from "@/lib/universe/generator";

const OUTPUT_PATH = path.join(process.cwd(), "handoffs", "project-genesis-planet-resource-seed-handoff.json");
const EXAMPLE_SEED = "PROJECT-GENESIS-HANDOFF:planet:resource-example:0";

function countBy<T>(items: T[], keyFor: (item: T) => string) {
  return Object.fromEntries(
    [...items.reduce((counts, item) => {
      const key = keyFor(item) || "Unspecified";
      counts.set(key, (counts.get(key) ?? 0) + 1);
      return counts;
    }, new Map<string, number>()).entries()].sort(([left], [right]) => left.localeCompare(right))
  );
}

async function main() {
  const data = await getGameData();
  const resourceCatalog = [...ResourceService.catalog].sort((left, right) => left.id.localeCompare(right.id));
  const normalizedProfiles = validatePlanetResourceProfiles(data.planet_resource_profiles)
    .sort((left, right) => left.id.localeCompare(right.id));
  const generationRules = planetGenerationRuleRows(data.planets, data.planets)
    .sort((left, right) => left.category.localeCompare(right.category) || left.value.localeCompare(right.value) || left.id.localeCompare(right.id));
  const canonicalRuleReferenceRows = planetaryRulesDisplayRows(data.planets, data.planets)
    .sort((left, right) => left.category.localeCompare(right.category) || left.value.localeCompare(right.value) || left.id.localeCompare(right.id));
  const samplePlanet = generatePlanet(data.planets, 0, EXAMPLE_SEED, {
    systemRarity: "Rare",
    resourceProfiles: data.planet_resource_profiles
  });
  const exampleSystemSeed = deriveSeed("PROJECT-GENESIS-UNIVERSE:galaxy:0", "system", 0);
  const examplePlanetSeed = deriveSeed(exampleSystemSeed, "planet", 0);

  const handoff = {
    metadata: {
      documentId: "project-genesis-planet-resource-seed-handoff",
      documentVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      purpose: "Full canonical handoff for ChatGPT review of deterministic planet generation, resource selection, rarity, and seed behavior.",
      sourceOfTruth: "Project Genesis Studio",
      resourceCatalogPolicy: "ResourceService.catalog is authoritative. Gameplay stores stable resource IDs and resolves display data through ResourceService.",
      generationVersion: SEED_GENERATION_VERSION,
      sourceFiles: [
        "lib/resources/service.ts",
        "lib/resources/planet-resource-profiles.ts",
        "lib/planets/generator.ts",
        "lib/planets/rarity.ts",
        "lib/planets/class-model.ts",
        "lib/planets/rule-rows.ts",
        "lib/universe/generator.ts",
        "types/schema.ts"
      ],
      publicReferenceEndpoints: [
        "/api/export/resource_catalog.json",
        "/api/export/planet_resource_profiles.json",
        "/api/export/game-runtime-data.json"
      ]
    },
    executiveSummary: {
      resourceCatalogCount: resourceCatalog.length,
      normalizedPlanetResourceProfileCount: normalizedProfiles.length,
      planetClassCount: PLANET_CLASS_MODEL.length,
      planetSubclassCount: PLANET_CLASS_MODEL.reduce((total, item) => total + item.subclasses.length, 0),
      planetRarityTierCount: PLANET_RARITIES.length,
      planetClassRarityProfileCount: PLANET_CLASS_RARITY_PROFILES.length,
      systemRarityModifierCount: SYSTEM_RARITY_MODIFIERS.length,
      planetClassesUsingDefaultRarityCurve: PLANET_CLASS_MODEL
        .filter((planetClass) => !PLANET_CLASS_RARITY_PROFILES.some((profile) => profile.planetClass === planetClass.name))
        .map((planetClass) => planetClass.name),
      systemRaritiesUsingCommonModifierFallback: PLANET_RARITIES
        .filter((rarity) => !SYSTEM_RARITY_MODIFIERS.some((modifier) => modifier.systemRarity === rarity.name))
        .map((rarity) => rarity.name),
      generationRuleCount: generationRules.length,
      canonicalRuleReferenceRowCount: canonicalRuleReferenceRows.length,
      resourceRarityDistribution: countBy(resourceCatalog, (resource) => resource.rarity),
      resourceCategoryDistribution: countBy(resourceCatalog, (resource) => resource.category),
      resourceDiscoveryTierDistribution: countBy(resourceCatalog, (resource) => resource.discovery_tier),
      profilePlanetTypeDistribution: countBy(normalizedProfiles, (profile) => profile.planetType),
      deterministicGuarantee: "The same explicit seed, options, canonical rules, resource profiles, and generation version produce the same generated planet and resource ID ordering.",
      importantSeedCaveat: "generatePlanet uses a timestamp fallback only when requestedSeed is omitted. Production callers requiring replayable output must always provide and persist an explicit seed.",
      saveCompatibilityRule: "Resource IDs and generation_version are persistent contracts. Never rename, recycle, or reinterpret an existing ID without an explicit migration."
    },
    resourceSystemContract: {
      canonicalStorage: "GeneratedPlanet.resourceIds",
      displayOnlyCompatibilityField: "GeneratedPlanet.resources",
      displayResolution: "ResourceService.namesForIds(resourceIds)",
      acceptedProfileInputs: [
        "primaryResourceIds / primary_resource_ids / guaranteed_resources",
        "secondaryResourceIds / secondary_resource_ids / common_resources",
        "rareResourceIds / rare_resource_ids / rare_resources",
        "exoticResourceIds / exotic_resource_ids / exotic_resources"
      ],
      profileMatchPrecedence: [
        "planet_class + subclass exact match",
        "subclass exact match",
        "planet_class exact match",
        "fallback planet generation Resource rule pool"
      ],
      weightedSelection: {
        primaryCount: { min: 2, max: 4 },
        secondaryCount: { min: 1, max: 4 },
        rareCount: { min: 0, max: 2, minimumPlanetRarityRank: 3, minimumPlanetRarity: "Rare" },
        exoticCount: { min: 0, max: 1, minimumPlanetRarityRank: 5, minimumPlanetRarity: "Legendary" },
        noDuplicates: true,
        baseBucketWeights: { primary: 100, secondary: 65, rare: 32, exotic: 12 },
        resourceRarityWeightBonus: { common: 12, uncommon: 8, rare: 4, exotic: 2, fallback: 6 },
        formula: "selectionWeight = bucketBaseWeight + resourceRarityWeightBonus; each draw is weighted without replacement",
        fallbackBehavior: "After bucket draws, the combined candidate pool fills any unmet primary + secondary target. If no profile result exists, fallback resource rule IDs are used."
      },
      gasGiantOverride: {
        enabledForPlanetClass: "Gas Giant",
        totalResourceCount: { min: 3, max: 6 },
        behavior: "Subclass-specific guaranteed/common/rare/exotic atmospheric resources override normalized profile selection. Rare candidates unlock at Rare; exotic candidates unlock at Legendary.",
        gameplayModel: "Non-landable orbital harvesting with atmospheric harvest rate, platform slots, hazards, required technology, and transport options."
      },
      abundanceAndDifficulty: {
        abundanceRangeSource: "profile.abundanceRange or density-label normalization",
        densityMappings: {
          "Very Rich / Exotic": { min: 70, max: 100 },
          "Rich / Abundant": { min: 55, max: 90 },
          "Moderate / Balanced / Atmospheric": { min: 35, max: 75 },
          "Sparse / Trace / Low": { min: 5, max: 45 },
          default: { min: 20, max: 65 }
        },
        miningDifficulty: "profile miningDifficultyModifier, otherwise deterministic integer 1-10",
        refinementDifficulty: "profile refinementDifficultyModifier; legacy default is max(1, round(mining_difficulty * 0.8))"
      },
      validation: [
        "Every profile resource reference must resolve to ResourceService.catalog.",
        "Display names are migrated through ResourceService.resolveId; normalized output stores IDs.",
        "Duplicate IDs within the same profile bucket are rejected.",
        "Invalid casing that resembles an ID but does not exactly resolve is rejected.",
        "Every canonical planet class must have at least one resource profile.",
        "Invalid references throw: Invalid resource ID in planet_resource_profiles: [value] does not exist in resource_catalog."
      ]
    },
    seedSystemContract: {
      generationVersion: SEED_GENERATION_VERSION,
      hash: {
        algorithm: "32-bit FNV-1a-style hash",
        initialState: 2166136261,
        perCharacter: "hash ^= UTF-16 code unit; hash = Math.imul(hash, 16777619)",
        output: "unsigned 32-bit integer"
      },
      pseudoRandomGenerator: {
        algorithm: "32-bit linear congruential generator",
        initialState: "hashSeed(seed), or 1 when hash is zero",
        recurrence: "state = Math.imul(1664525, state) + 1013904223",
        output: "(state >>> 0) / 4294967296"
      },
      hierarchy: [
        { level: "Universe", seed: "caller-provided universe seed; blank becomes PROJECT-GENESIS-UNIVERSE" },
        { level: "Galaxy", seed: "deriveSeed(universeSeed, 'galaxy', galaxyIndex); Milky Way index 0 retains fixed canonical handling" },
        { level: "Sector", seed: "deriveSeed(galaxySeed, 'sector', sectorIndex)" },
        { level: "Star System", seed: "deriveSeed(sectorSeed, 'system', systemIndex)" },
        { level: "Star", seed: "deriveSeed(systemSeed, 'star', starIndex)" },
        { level: "Planet", seed: "deriveSeed(systemSeed, 'planet', planetIndex)" }
      ],
      deriveSeedFormat: "${parentSeed}:${scope}${optionalColonIndex}:${hashSeed(fullPrefix).toString(36)}",
      planetSubSeedKeys: PLANET_SUB_SEED_KEYS,
      planetSubSeedPurpose: "Universe cascade isolates independent planet properties so adding a new roll does not reorder unrelated deterministic results when sub-seeds are used consistently.",
      standalonePlanetGenerator: {
        explicitSeed: "requestedSeed.trim()",
        omittedSeedFallback: "PG-${Date.now()}-${existingCount + 1}",
        mainStream: "seededRandom(seed) supplies class, subclass, rule-pool fields, counts, weighted resources, names, and narrative details in stable call order.",
        rarityStream: "seededRandom(`${seed}:rarity:${planetClass}:${systemRarity}`)",
        persistenceRequirements: ["seed", "generation_version", "planet_class", "planet_subclass", "rarity", "resourceIds", "parent seed and hierarchy IDs when assigned"]
      },
      deterministicInputs: [
        "explicit planet seed",
        "planet class or class roll",
        "planet subclass or subclass roll",
        "primary biome override",
        "parent star-system rarity",
        "planet generation rules",
        "normalized planet resource profiles",
        "canonical Resource Catalog",
        "generation version"
      ],
      examples: {
        hashExample: { seed: EXAMPLE_SEED, hash: hashSeed(EXAMPLE_SEED) },
        systemSeed: exampleSystemSeed,
        planetSeed: examplePlanetSeed,
        planetSubSeeds: planetSubSeeds(examplePlanetSeed)
      }
    },
    generatedPlanetResourceOutput: {
      authoritativeFields: {
        resourceIds: "Stable canonical IDs used by gameplay, saves, exports, economy, mining, crafting, and trading.",
        resources: "Resolved display names retained for UI/backward compatibility; not authoritative gameplay references."
      },
      sampleSeed: EXAMPLE_SEED,
      sampleSystemRarity: "Rare",
      sampleGeneratedPlanet: samplePlanet
    },
    planetRarityDefinitions: PLANET_RARITIES,
    planetClassRarityProfiles: PLANET_CLASS_RARITY_PROFILES,
    systemRarityModifiers: SYSTEM_RARITY_MODIFIERS,
    planetClassDefinitions: PLANET_CLASS_MODEL,
    normalizedPlanetResourceProfiles: normalizedProfiles,
    resourceCatalog,
    planetGenerationRulePool: generationRules,
    canonicalPlanetRuleReferenceRows: canonicalRuleReferenceRows,
    schemaFieldReference: {
      resourceCatalogItem: Object.keys(resourceCatalog[0] ?? {}),
      normalizedPlanetResourceProfile: Object.keys(normalizedProfiles[0] ?? {}),
      generatedPlanet: Object.keys(samplePlanet)
    },
    integrity: {
      resourceIdsUnique: new Set(resourceCatalog.map((resource) => resource.id)).size === resourceCatalog.length,
      resourceNamesUniqueCaseInsensitive: new Set(resourceCatalog.map((resource) => resource.resource_name.trim().toLowerCase())).size === resourceCatalog.length,
      profilesValidated: normalizePlanetResourceProfiles(data.planet_resource_profiles).length === normalizedProfiles.length,
      everyPlanetClassHasProfile: PLANET_CLASS_MODEL.every((planetClass) => normalizedProfiles.some((profile) => profile.planetType.trim().toLowerCase() === planetClass.name.toLowerCase())),
      sampleResourceIdsResolve: (samplePlanet.resourceIds ?? []).every((id) => Boolean(ResourceService.getById(id)))
    }
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(handoff, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ output: path.relative(process.cwd(), OUTPUT_PATH), ...handoff.executiveSummary, integrity: handoff.integrity }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
