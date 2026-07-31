import { compileNanoBanana2Prompt, getNanoBanana2PromptStaleness, type CanonicalVisualRecord } from "@/lib/visual-production/nano-banana-2";
import { SPECIES_PLATE_MASTER_V1, resolveSpeciesPlatePreset, speciesPlateDomainMappings, speciesPlatePromptTemplate, speciesPlateVariationProfiles } from "@/lib/species-plates/master-template";
import type { SpeciesPlateDomain, SpeciesPlateProductionStatus, SpeciesPlateRecord, SpeciesPlateValidationIssue } from "@/lib/species-plates/types";

export const SPECIES_PLATE_COMPILER_VERSION = "1.0.0";

export type SpeciesPlateSource = {
  id: string;
  displayName: string;
  scientificName?: string;
  domain: SpeciesPlateDomain;
  sourceVersion: string;
  seed: string;
  taxonomy: string;
  archetypeId?: string;
  variables: Record<string, string | number | boolean | null | undefined>;
  lockedFields: string[];
  lockedValues: Record<string, unknown>;
};

export type ResolvedSpeciesPlatePrompt = {
  speciesPlateId: string;
  canonicalRecordId: string;
  templateId: string;
  templateVersion: string;
  presetId: string;
  compilerVersion: string;
  modelProfileId: "nano-banana-2";
  requestedVersionCount: number;
  seed: string;
  positivePrompt: string;
  negativePrompt: string;
  combinedPrompt: string;
  compactPrompt: string;
  detailedPrompt: string;
  resolvedVariables: Record<string, string>;
  unresolvedVariables: string[];
  lockedFields: string[];
  promptHash: string;
  staleStatus: "current" | "stale";
  validation: SpeciesPlateValidationIssue[];
};

const stringHash = (value: string) => {
  let current = 2166136261;
  for (const character of value) current = Math.imul(current ^ character.charCodeAt(0), 16777619);
  return (current >>> 0).toString(16).padStart(8, "0");
};

const compilerDomain = (domain: SpeciesPlateDomain): "creature" | "plant" => domain === "creature" ? "creature" : "plant";
const defaultArchetype = (domain: "creature" | "plant") => domain === "creature" ? "volume-ia-mammalian-grazer" : "volume-pa-trees-temperate-forest-tree";

export function createSpeciesPlateRecord(source: SpeciesPlateSource, presetId = source.domain === "creature" ? "creature-standard" : "botanical-standard"): SpeciesPlateRecord {
  const resolvedPreset = resolveSpeciesPlatePreset(presetId);
  const panels = resolvedPreset.groups.flatMap((group) => group.panels).filter((item) => item.domain.includes(source.domain)).map((item) => ({ ...item, targetBounds: { ...item.targetBounds }, safeBounds: { ...item.safeBounds } }));
  return { id: `species-plate-${source.id}`, canonicalRecordId: source.id, domain: source.domain, templateId: SPECIES_PLATE_MASTER_V1.id, templateVersion: SPECIES_PLATE_MASTER_V1.version, presetId, generationSeed: source.seed, sourcePromptId: null, promptHash: null, approvedAssetId: null, previewAssetId: null, thumbnailAssetId: null, extractedAssetIds: [], reviewNotes: null, productionStatus: "awaiting_prompt", panels, createdAt: "deterministic-build", updatedAt: "deterministic-build" };
}

const productionTransitions: Record<SpeciesPlateProductionStatus, SpeciesPlateProductionStatus[]> = {
  not_started: ["awaiting_prompt", "blocked"], awaiting_prompt: ["prompt_ready", "blocked"], prompt_ready: ["generating", "stale", "blocked"], generating: ["generated", "blocked"], generated: ["awaiting_review", "revision_required", "blocked"], awaiting_review: ["approved", "rejected", "revision_required"], approved: ["extraction_pending", "stale"], rejected: ["awaiting_prompt"], revision_required: ["awaiting_prompt", "generating"], extraction_pending: ["extracted", "blocked"], extracted: ["published", "revision_required"], published: ["stale"], stale: ["awaiting_prompt", "generating"], blocked: ["awaiting_prompt"]
};

export function transitionSpeciesPlateStatus(plate: SpeciesPlateRecord, nextStatus: SpeciesPlateProductionStatus, reviewNotes: string | null = plate.reviewNotes) {
  if (!productionTransitions[plate.productionStatus].includes(nextStatus)) throw new Error(`Invalid species plate status transition: ${plate.productionStatus} -> ${nextStatus}.`);
  if (["approved", "extracted", "published"].includes(nextStatus) && !plate.approvedAssetId) throw new Error("An approved asset ID is required before a species plate can advance to approved output states.");
  return { ...plate, productionStatus: nextStatus, reviewNotes, updatedAt: "deterministic-build" };
}

export function attachApprovedSpeciesPlateAssets(plate: SpeciesPlateRecord, assets: { approvedAssetId: string; previewAssetId?: string; thumbnailAssetId?: string; extractedAssetIds?: string[] }) {
  return { ...plate, approvedAssetId: assets.approvedAssetId, previewAssetId: assets.previewAssetId ?? null, thumbnailAssetId: assets.thumbnailAssetId ?? null, extractedAssetIds: assets.extractedAssetIds ?? [], productionStatus: "approved" as const, updatedAt: "deterministic-build" };
}

export function compileSpeciesPlatePrompt(source: SpeciesPlateSource, options: { presetId?: string; variationProfileId?: string; versionCount?: 1 | 2 | 3 | 4 | 6 | 8; seed?: string } = {}): ResolvedSpeciesPlatePrompt {
  const domain = compilerDomain(source.domain);
  const variation = speciesPlateVariationProfiles.find((item) => item.id === options.variationProfileId) ?? speciesPlateVariationProfiles.find((item) => item.id === "standard")!;
  const record: CanonicalVisualRecord = { id: source.id, displayName: source.displayName, scientificName: source.scientificName, domain, sourceVersion: source.sourceVersion, seed: options.seed ?? source.seed, taxonomy: source.taxonomy, archetypeId: source.archetypeId ?? defaultArchetype(domain), variables: source.variables, lockedFields: [...new Set([...source.lockedFields, ...variation.lockedFields])], lockedValues: source.lockedValues };
  const base = compileNanoBanana2Prompt(record, { outputTypeId: domain === "creature" ? "creature-species-plate" : "plant-botanical-plate", variationProfileId: variation.id === "strict-canon" ? "conservative" : variation.id === "standard" ? "standard" : "conservative", versionCount: options.versionCount ?? 4, seed: record.seed, cameraProfileId: "species-plate", lightingProfileId: "museum-specimen", backgroundProfileId: "pure-black", compositionProfileId: "comparison-board" });
  const domainTerminology = Object.entries(speciesPlateDomainMappings[source.domain]).map(([generic, mapped]) => `${generic.replaceAll("_", " ")} is represented as ${mapped.replaceAll("_", " ")}`).join("; ");
  const panelInstruction = SPECIES_PLATE_MASTER_V1.groups.map((group) => `${group.title}: ${group.panels.filter((item) => item.domain.includes(source.domain)).map((item) => item.title).join(", ") || "not applicable"}`).join(". ");
  const detailed = `${speciesPlatePromptTemplate.replace("{{versionCount}}", String(base.versionCount))} Canonical subject: ${source.displayName}${source.scientificName ? ` (${source.scientificName})` : ""}. Template ${SPECIES_PLATE_MASTER_V1.id} v${SPECIES_PLATE_MASTER_V1.version}. Panel plan: ${panelInstruction}. Domain substitutions: ${domainTerminology || "none"}. ${base.detailedPrompt}`;
  const negative = `${base.negativePrompt}, incompatible panels, touching subjects, occluded anatomy, invented anatomy, inconsistent scale, labels, diagram callouts`;
  const validation: SpeciesPlateValidationIssue[] = base.validation.map((issue) => ({ severity: issue.severity === "Structural Error" || issue.severity === "Canon Conflict" ? issue.severity : issue.severity === "Missing Optional Data" ? "Missing Optional Data" : "Visual Consistency Warning", code: issue.code, message: issue.message }));
  if (!source.id) validation.push({ severity: "Structural Error", code: "missing_canonical_record", message: "A canonical life record is required for a species plate." });
  if (!source.seed) validation.push({ severity: "Production Error", code: "missing_seed", message: "A deterministic generation seed is required." });
  if (base.versionCount !== 4 && !options.versionCount) validation.push({ severity: "Production Error", code: "invalid_default_version_count", message: "The master plate defaults to four variations." });
  const promptHash = stringHash(`${detailed}\n${negative}`);
  return { speciesPlateId: `species-plate-${source.id}`, canonicalRecordId: source.id, templateId: SPECIES_PLATE_MASTER_V1.id, templateVersion: SPECIES_PLATE_MASTER_V1.version, presetId: options.presetId ?? (source.domain === "creature" ? "creature-standard" : "botanical-standard"), compilerVersion: SPECIES_PLATE_COMPILER_VERSION, modelProfileId: "nano-banana-2", requestedVersionCount: base.versionCount, seed: base.seed, positivePrompt: detailed, negativePrompt: negative, combinedPrompt: `${detailed}\n\nNEGATIVE PROMPT\n${negative}`, compactPrompt: `NOVERIS species plate: ${source.displayName}, ${source.taxonomy}, 4000x4000 pure black museum reference board, preserve locked canon, ${base.compactPrompt}`, detailedPrompt: detailed, resolvedVariables: base.resolvedVariables, unresolvedVariables: base.unresolvedVariables, lockedFields: record.lockedFields, promptHash, staleStatus: "current", validation };
}

export function getSpeciesPlatePromptStaleness(source: SpeciesPlateSource, prompt: ResolvedSpeciesPlatePrompt) {
  const current = compileSpeciesPlatePrompt(source, { presetId: prompt.presetId, versionCount: prompt.requestedVersionCount as 1 | 2 | 3 | 4 | 6 | 8, seed: prompt.seed });
  const stale = current.promptHash !== prompt.promptHash;
  return { stale, currentPromptHash: current.promptHash, reason: stale ? "canonical_record_or_template_changed" : "current", changedFields: stale ? ["canonicalSource", "templateVersion", "promptHash"] : [] };
}

export function sanitizeSpeciesPlateForRuntime(plate: SpeciesPlateRecord) {
  return { speciesPlateId: plate.id, templateId: plate.templateId, templateVersion: plate.templateVersion, approvedAssetId: plate.approvedAssetId, previewAssetId: plate.previewAssetId, thumbnailAssetId: plate.thumbnailAssetId, extractedAssetIds: plate.extractedAssetIds, discoveryVisibilityRules: { defaultState: "unknown" }, sourcePromptId: plate.sourcePromptId, promptHash: plate.promptHash, generationSeed: plate.generationSeed, productionStatus: plate.productionStatus };
}
