import { generatePlanet } from "@/lib/planets/generator";
import type { GeneratedPlanet, PlanetResourceProfile, PlanetVariable } from "@/types/schema";

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
