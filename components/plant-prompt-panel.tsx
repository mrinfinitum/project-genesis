"use client";

import { NanoBananaPromptPanel } from "@/components/nano-banana-prompt-panel";
import type { PlantLifeDraft } from "@/lib/life/plant-system";
import type { CanonicalVisualRecord } from "@/lib/visual-production/nano-banana-2";

function plantArchetypeId(plant: PlantLifeDraft) {
  const category = plant.category;
  if (category === "trees") return "volume-pa-trees-temperate-forest-tree";
  if (category === "flowers") return "volume-pc-flowers-flowering-plant";
  if (category === "fungi" || category === "spores") return "volume-pii-fungi-mushroom-form-fungus";
  if (category === "mosses") return "volume-pd-ground-flora-moss-analog";
  if (category === "coral") return "volume-pf-aquatic-reef-flora";
  if (category === "seeds") return "volume-pc-flowers-flowering-plant";
  return "volume-pb-ground-cover-ground-cover";
}

export function plantPromptRecord(plant: PlantLifeDraft): CanonicalVisualRecord {
  return {
    id: plant.id,
    displayName: plant.displayName,
    scientificName: undefined,
    domain: "plant",
    sourceVersion: "plant-generation-v1",
    seed: plant.seed,
    taxonomy: `${plant.category} · ${plant.growthPattern}`,
    archetypeId: plantArchetypeId(plant),
    variables: { Planet: "", Biome: plant.habitat, Climate: plant.habitat, Gravity: "unassigned", Atmosphere: "unassigned", GrowthPattern: plant.growthPattern, EcologicalRole: plant.ecologicalRole, PrimaryMaterial: plant.category, ColorPalette: "unassigned", DistinctiveFeatures: plant.growthPattern },
    lockedFields: ["category", "habitat", "growthPattern", "ecologicalRole", "seed"],
    lockedValues: { category: plant.category, habitat: plant.habitat, growthPattern: plant.growthPattern, ecologicalRole: plant.ecologicalRole, seed: plant.seed }
  };
}

export function PlantPromptPanel({ plant }: { plant: PlantLifeDraft }) {
  return <NanoBananaPromptPanel record={plantPromptRecord(plant)} domain="plant" />;
}
