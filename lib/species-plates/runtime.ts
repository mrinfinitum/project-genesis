import type { SpeciesRecord } from "@/lib/life/creature-system";
import { speciesPlateSourceFromCreature } from "@/lib/species-plates/adapters";
import { compileSpeciesPlatePrompt, createSpeciesPlateRecord, sanitizeSpeciesPlateForRuntime } from "@/lib/species-plates/compiler";
import { SPECIES_PLATE_MASTER_V1 } from "@/lib/species-plates/master-template";

export type SpeciesPlateRuntimeReference = ReturnType<typeof sanitizeSpeciesPlateForRuntime>;

export function buildSpeciesPlateRuntimeData(species: SpeciesRecord[]): SpeciesPlateRuntimeReference[] {
  return species.map((record) => {
    const source = speciesPlateSourceFromCreature(record);
    const plate = createSpeciesPlateRecord(source);
    const prompt = compileSpeciesPlatePrompt(source);
    return sanitizeSpeciesPlateForRuntime({ ...plate, sourcePromptId: prompt.speciesPlateId, promptHash: prompt.promptHash });
  }).sort((left, right) => left.speciesPlateId.localeCompare(right.speciesPlateId));
}

export function validateSpeciesPlateRuntimeData(plates: SpeciesPlateRuntimeReference[]) {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const plate of plates) {
    if (ids.has(plate.speciesPlateId)) issues.push(`Duplicate species plate ID: ${plate.speciesPlateId}.`);
    ids.add(plate.speciesPlateId);
    if (plate.templateId !== SPECIES_PLATE_MASTER_V1.id || plate.templateVersion !== SPECIES_PLATE_MASTER_V1.version) issues.push(`Species plate ${plate.speciesPlateId} does not resolve the canonical master template.`);
    if (!plate.generationSeed || !plate.promptHash || !plate.sourcePromptId) issues.push(`Species plate ${plate.speciesPlateId} is missing deterministic provenance.`);
    if (JSON.stringify(plate).match(/positivePrompt|negativePrompt|source-masters|unresolvedVariables|rejected/i)) issues.push(`Species plate ${plate.speciesPlateId} leaks private authoring data.`);
  }
  return issues;
}
