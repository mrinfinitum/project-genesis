import type { PlantLifeDraft } from "@/lib/life/plant-system";
import type { SpeciesRecord } from "@/lib/life/creature-system";
import type { SpeciesPlateSource } from "@/lib/species-plates/compiler";

export function speciesPlateSourceFromCreature(species: SpeciesRecord): SpeciesPlateSource {
  return {
    id: species.id, displayName: species.displayName, scientificName: species.scientificName, domain: species.taxonomy.domain === "exotic" ? "exotic-life" : "creature", sourceVersion: species.generationVersion, seed: species.seed,
    taxonomy: [species.taxonomy.kingdom, species.taxonomy.phylum, species.taxonomy.class].filter(Boolean).join(" · "), archetypeId: undefined,
    variables: { Planet: species.originPlanetId, Biome: species.originBiomeId, Habitats: species.habitats.join(", "), EcologicalRole: species.ecologicalRoles.join(", "), BodyPlan: species.appearance.bodyPlan, Symmetry: species.appearance.symmetry, Locomotion: species.appearance.locomotion.join(", "), Coloration: species.appearance.coloration.join(", "), DistinctiveFeatures: species.appearance.distinguishingFeatures.join(", "), Limbs: species.anatomy.limbs, Materials: species.physiology.adaptations.join(", "), Lifecycle: species.lifecycleStages.join(", ") },
    lockedFields: ["identity", "taxonomy", "bodyPlan", "symmetry", "limbCount", "planet", "biome", "lockedColor", "distinctiveFeatures", "lifeStage"], lockedValues: { bodyPlan: species.appearance.bodyPlan, symmetry: species.appearance.symmetry, limbCount: species.anatomy.limbs, color: species.appearance.coloration, features: species.appearance.distinguishingFeatures, lifecycle: species.lifecycleStages }
  };
}

export function speciesPlateSourceFromPlant(plant: PlantLifeDraft): SpeciesPlateSource {
  return {
    id: plant.id, displayName: plant.displayName, scientificName: undefined, domain: plant.category === "fungi" ? "fungi" : "plant", sourceVersion: "plant-life-generator-v1", seed: plant.seed, taxonomy: `Life · ${plant.category} · ${plant.growthPattern}`,
    variables: { Category: plant.category, Habitat: plant.habitat, GrowthPattern: plant.growthPattern, EcologicalRole: plant.ecologicalRole },
    lockedFields: ["identity", "taxonomy", "rootOrBranchCount", "reproduction", "materials", "distinctiveFeatures", "lifeStage"], lockedValues: { category: plant.category, habitat: plant.habitat, growthPattern: plant.growthPattern }
  };
}
