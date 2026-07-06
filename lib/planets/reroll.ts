import { generatePlanet } from "@/lib/planets/generator";
import type { GeneratedPlanet, PlanetResourceProfile, PlanetVariable } from "@/types/schema";

const generatedPlanetStorageKeys = [
  "id",
  "seed",
  "name",
  "galaxy_sector",
  "star_system",
  "orbit_position",
  "discovery_order",
  "rarity",
  "star_type",
  "distance_from_star",
  "orbit_speed",
  "planet_class",
  "planet_subclass",
  "primary_biome",
  "climate",
  "atmosphere",
  "temperature",
  "gravity",
  "water_coverage",
  "moons",
  "resources",
  "flora",
  "fauna",
  "ancient_civilization",
  "ruins",
  "hazards",
  "traits",
  "anomalies",
  "modifiers",
  "collectible_pools",
  "visual_theme",
  "weather",
  "colonization",
  "science",
  "economy",
  "event_pool",
  "story",
  "colonized",
  "terraform_level",
  "discovery_points",
  "completion_percent",
  "image_url",
  "image_prompt",
  "image_status",
  "image_variants",
  "created_at",
  "notes"
] as const;

function renderNotes(existing: GeneratedPlanet, nextNotes: string) {
  const existingNotes = existing.notes ?? "";

  if (!existingNotes) {
    return nextNotes;
  }

  if (existingNotes.includes("Matched planet render library asset") || existingNotes.includes("Rendered procedural") || existingNotes.includes("Rendered AI")) {
    return [nextNotes, existingNotes].filter(Boolean).join("\n");
  }

  return nextNotes || existingNotes;
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function generatedPlanetStorageRow(row: GeneratedPlanet) {
  const normalized = {
    ...row,
    resources: arrayValue(row.resources),
    hazards: arrayValue(row.hazards),
    traits: arrayValue(row.traits),
    anomalies: arrayValue(row.anomalies),
    modifiers: arrayValue(row.modifiers),
    collectible_pools: arrayValue(row.collectible_pools),
    visual_theme: objectValue(row.visual_theme),
    weather: arrayValue(row.weather),
    colonization: objectValue(row.colonization),
    science: objectValue(row.science),
    economy: objectValue(row.economy),
    event_pool: arrayValue(row.event_pool),
    image_variants: arrayValue(row.image_variants)
  };

  return Object.fromEntries(generatedPlanetStorageKeys.map((key) => [key, normalized[key]]));
}

export function rerollPlanetStats(
  existing: GeneratedPlanet,
  rules: PlanetVariable[],
  resourceProfiles: PlanetResourceProfile[],
  existingCount: number
) {
  const rerolled = generatePlanet(rules, existingCount, existing.seed, {
    planetClass: existing.planet_class,
    planetSubclass: existing.planet_subclass,
    primaryBiome: existing.primary_biome,
    resourceProfiles
  });

  return {
    ...rerolled,
    id: existing.id,
    seed: existing.seed,
    name: existing.name,
    discovery_order: existing.discovery_order,
    planet_class: existing.planet_class || rerolled.planet_class,
    planet_subclass: existing.planet_subclass || rerolled.planet_subclass,
    primary_biome: existing.primary_biome || rerolled.primary_biome,
    colonized: existing.colonized,
    terraform_level: existing.terraform_level,
    image_url: existing.image_url,
    image_prompt: existing.image_prompt,
    image_status: existing.image_status,
    image_variants: existing.image_variants,
    created_at: existing.created_at,
    notes: renderNotes(existing, rerolled.notes)
  } satisfies GeneratedPlanet;
}
