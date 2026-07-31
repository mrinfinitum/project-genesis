"use client";

import { NanoBananaPromptPanel } from "@/components/nano-banana-prompt-panel";
import type { CanonicalVisualRecord } from "@/lib/visual-production/nano-banana-2";
import type { SpeciesRecord } from "@/lib/life/creature-system";

function creatureArchetypeId(species: SpeciesRecord) {
  if (species.functionalCategories.includes("aerial")) return "volume-ib-avian-soaring-hunter";
  if (species.functionalCategories.includes("aquatic")) return "volume-ie-aquatic-pelagic-fishlike";
  if (species.functionalCategories.includes("artificial")) return "volume-v-artificial-engineered-organism";
  if (species.functionalCategories.includes("silicon-based")) return "volume-iii-exotic-silicon-based-creature";
  return "volume-ia-mammalian-grazer";
}

export function creaturePromptRecord(species: SpeciesRecord): CanonicalVisualRecord {
  return {
    id: species.id,
    displayName: species.displayName,
    scientificName: species.scientificName,
    domain: "creature",
    sourceVersion: species.generationVersion,
    seed: species.seed,
    taxonomy: `${species.taxonomy.kingdom} · ${species.taxonomy.class} · ${species.taxonomy.family}`,
    archetypeId: creatureArchetypeId(species),
    variables: {
      Planet: species.originPlanetId,
      Biome: species.originBiomeId,
      Gravity: `${species.compatibility.gravityRange.join("–")} G`,
      Atmosphere: species.compatibility.atmosphereTypes.join(", "),
      Climate: `${species.compatibility.temperatureRangeC.join("–")} Celsius`,
      BodyPlan: species.appearance.bodyPlan,
      Diet: species.ecology.diet.join(", "),
      Behavior: `${species.behavior.temperament}, ${species.behavior.activityCycle}`,
      PrimaryMaterial: `${species.physiology.metabolism}, ${species.physiology.respiration}`,
      ColorPalette: species.appearance.coloration.join(", "),
      DistinctiveFeatures: species.appearance.distinguishingFeatures.join(", ")
    },
    lockedFields: ["taxonomy", "appearance.bodyPlan", "appearance.symmetry", "anatomy.limbs", "anatomy.appendages", "habitats", "compatibility", "appearance.coloration", "appearance.distinguishingFeatures", "lifecycleStages", "intelligence.level", "canonStatus"],
    lockedValues: { taxonomy: species.taxonomy, appearance: species.appearance, anatomy: species.anatomy, habitats: species.habitats, compatibility: species.compatibility, lifecycleStages: species.lifecycleStages, intelligence: species.intelligence, canonStatus: species.canonStatus }
  };
}

export function CreaturePromptPanel({ species, availableSpecies: _availableSpecies }: { species: SpeciesRecord; availableSpecies?: SpeciesRecord[] }) {
  return <NanoBananaPromptPanel record={creaturePromptRecord(species)} domain="creature" />;
}
