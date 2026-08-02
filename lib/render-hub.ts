import { noverisDesignLanguage } from "@/lib/design-language";
import { renderProviderRegistry } from "@/lib/assets/asset-production-system";
import type { ProductionAsset } from "@/lib/assets/asset-production";

export const RENDER_HUB_ID = "noveris-render-hub";
export const RENDER_HUB_VERSION = "1.0.0";

export type RenderHubProvider = {
  id: string;
  displayName: string;
  status: "available" | "configured" | "planned";
  promptFormat: "plain_text" | "structured" | "workflow";
  supportsReferenceImages: boolean;
  supportsNegativePrompt: boolean;
  supportsBatch: boolean;
  supportsSeed: boolean;
  supportsResolution: boolean;
  supportsAspectRatio: boolean;
  supportsImageEditing: boolean;
  supportsUpscaling: boolean;
  supportsVariations: boolean;
  supportsTransparent: boolean;
  supportedModels: string[];
  promptSyntax: string;
  promptLimits: { recommendedCharacters: number; maximumCharacters: number };
  supportedResolutions: string[];
  supportedAspectRatios: string[];
  recommendedSettings: string[];
  providerNotes: string;
};

const providerEnhancements: Record<string, Pick<RenderHubProvider, "supportsImageEditing" | "supportsVariations" | "supportsTransparent" | "supportedModels" | "promptSyntax" | "promptLimits" | "recommendedSettings" | "providerNotes">> = {
  "freepik-flux": {
    supportsImageEditing: true,
    supportsVariations: true,
    supportsTransparent: false,
    supportedModels: ["Flux"],
    promptSyntax: "positive_prompt + negative_prompt + aspect_ratio + quality + optional reference images",
    promptLimits: { recommendedCharacters: 900, maximumCharacters: 1800 },
    recommendedSettings: ["16:9 for environments", "3:2 for subject studies", "Use reference images only when composition must be preserved"],
    providerNotes: "Use concise production direction and explicit negative prompt exclusions."
  },
  "nano-banana-2": {
    supportsImageEditing: true,
    supportsVariations: true,
    supportsTransparent: true,
    supportedModels: ["Nano Banana 2"],
    promptSyntax: "natural-language positive_prompt + negative_prompt + seed + output profile + optional reference images",
    promptLimits: { recommendedCharacters: 1100, maximumCharacters: 2200 },
    recommendedSettings: ["Use a fixed seed for controlled variations", "Use transparent output only for isolated extraction assets", "Keep canonical traits explicit"],
    providerNotes: "Preferred for canonical visual studies and PSD-oriented source production."
  },
  "openai-images": {
    supportsImageEditing: true,
    supportsVariations: false,
    supportsTransparent: true,
    supportedModels: ["OpenAI Images"],
    promptSyntax: "single image_prompt + optional reference images + size + quality + transparent background request",
    promptLimits: { recommendedCharacters: 1000, maximumCharacters: 2400 },
    recommendedSettings: ["Use one focused visual summary", "Specify the intended size", "Use transparent output only for isolated assets"],
    providerNotes: "Use direct visual language and avoid provider-specific workflow instructions."
  },
  comfyui: {
    supportsImageEditing: true,
    supportsVariations: true,
    supportsTransparent: true,
    supportedModels: ["Local checkpoint", "Workflow-defined model"],
    promptSyntax: "workflow + positive_prompt + negative_prompt + checkpoint + seed + resolution + reference image nodes",
    promptLimits: { recommendedCharacters: 1400, maximumCharacters: 3000 },
    recommendedSettings: ["Persist checkpoint selection with render history", "Persist seed with every render", "Use workflow version IDs"],
    providerNotes: "Local workflow settings are private Studio production metadata."
  },
  "future-provider": {
    supportsImageEditing: false,
    supportsVariations: false,
    supportsTransparent: false,
    supportedModels: [],
    promptSyntax: "provider adapter required",
    promptLimits: { recommendedCharacters: 900, maximumCharacters: 1800 },
    recommendedSettings: ["Configure the adapter before dispatching any render request"],
    providerNotes: "Reserved for future provider adapters."
  },
  "legacy-import": {
    supportsImageEditing: false,
    supportsVariations: false,
    supportsTransparent: false,
    supportedModels: [],
    promptSyntax: "no render dispatch",
    promptLimits: { recommendedCharacters: 0, maximumCharacters: 0 },
    recommendedSettings: ["Use only for pre-existing imported assets"],
    providerNotes: "Legacy imports retain source provenance without retroactive prompt fabrication."
  }
};

export const renderHubProviders: RenderHubProvider[] = renderProviderRegistry
  .filter((provider) => provider.providerId !== "legacy-import")
  .map((provider) => {
    const enhancement = providerEnhancements[provider.providerId] || providerEnhancements["future-provider"];
    return {
      id: provider.providerId,
      displayName: provider.displayName,
      status: provider.status,
      promptFormat: provider.promptFormat,
      supportsReferenceImages: provider.supportsReferenceImages,
      supportsNegativePrompt: provider.supportsNegativePrompt,
      supportsBatch: provider.supportsBatch,
      supportsSeed: provider.supportsSeed,
      supportsResolution: provider.supportedResolutions.length > 0,
      supportsAspectRatio: provider.supportedAspectRatios.length > 0,
      supportsUpscaling: provider.supportsUpscaling,
      ...enhancement,
      supportedResolutions: [...provider.supportedResolutions],
      supportedAspectRatios: [...provider.supportedAspectRatios]
    };
  });

export type PromptTemplate = {
  id: string;
  version: string;
  displayName: string;
  assetType: string;
  positiveDirection: string;
  negativeRules: string[];
  outputTypes: string[];
};

const template = (assetType: string, outputTypes: string[], positiveDirection: string, negativeRules: string[] = []) => ({
  id: `template-${assetType.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
  version: RENDER_HUB_VERSION,
  displayName: `${assetType} Prompt Template`,
  assetType,
  positiveDirection,
  negativeRules: ["no text", "no watermark", "no logo", "no UI", "no border", "no frame", ...negativeRules],
  outputTypes
});

export const renderHubPromptTemplates: PromptTemplate[] = [
  template("Background", ["16:9 environment painting", "16:10 environment painting"], "Create a quiet, realistic NOVERIS environment painting with restrained depth, broad negative space, and no competing focal point.", ["no planet", "no sun", "no spacecraft", "no decorative nebula"]),
  template("Galaxy", ["16:9 environment painting"], "Create a sparse, scientifically plausible NOVERIS galactic environment painting with the center kept quiet for future interactive content.", ["no recognizable Milky Way", "no bright central focal point"]),
  template("Galactic Region", ["16:9 environment painting"], "Create a calm NOVERIS galactic-region environment painting that suggests scale without crowding future gameplay."),
  template("Star System", ["16:9 environment painting", "star-system card"], "Create a quiet NOVERIS star-system environment painting with an open center for a future star, planets, orbit lines, and interface."),
  template("Planet", ["planet hero", "planet card", "surface study"], "Create a premium NOVERIS planetary study with clear physical identity, scientifically plausible material detail, and a readable silhouette."),
  template("Creature", ["species render", "species plate", "card art"], "Create a complete NOVERIS creature production study that preserves anatomy, scale, ecology, and a recognizable silhouette."),
  template("Plant", ["botanical render", "botanical plate", "card art"], "Create a complete NOVERIS botanical production study that preserves growth architecture, ecological function, and material detail."),
  template("Species Plate", ["species plate", "reference board"], "Create a structured NOVERIS species reference plate with clear separated study regions and no labels embedded in the image."),
  template("HUD", ["transparent UI asset", "panel treatment"], "Create an isolated NOVERIS HUD production asset with disciplined geometry, clean edge separation, and transparent-compatible output."),
  template("Icon", ["transparent icon source"], "Create an isolated NOVERIS icon source with a clean silhouette, controlled visual weight, and transparent-compatible output."),
  template("Card", ["card illustration", "card backplate"], "Create a NOVERIS card production asset with clear hierarchy, quiet composition, and usable safe space for future text."),
  template("Loading Screen", ["16:9 loading illustration"], "Create a quiet NOVERIS loading illustration that preserves broad negative space and supports interface overlays."),
  template("Material Study", ["material study", "texture reference"], "Create a NOVERIS material study focused on physically plausible surface response, structure, and controlled lighting."),
  template("Animation Reference", ["animation reference sheet"], "Create a NOVERIS animation reference study with readable motion phases, stable proportions, and no embedded labels.")
];

export type RenderHubCanonicalRecord = {
  id: string;
  displayName: string;
  version: string;
  assetType: string;
  assetRole: string;
  assetCategory: string;
  visualDescription: string;
  generationSeed: string | null;
  providerId: string;
  sourceMasterId: string | null;
  previewUrl: string | null;
  runtimeTargets: string[];
  approvalStatus: string;
  productionStatus: string;
  history: Array<{ id: string; eventType: string; timestamp: string; note: string }>;
};

export type CompiledRenderPrompt = {
  id: string;
  canonicalRecordId: string;
  canonicalRecordVersion: string;
  promptTemplateId: string;
  promptTemplateVersion: string;
  providerId: string;
  providerProfileVersion: string;
  outputType: string;
  visualSummary: string;
  positivePrompt: string;
  negativePrompt: string;
  combinedPrompt: string;
  metadata: { assetType: string; assetRole: string; assetCategory: string; designLanguageId: string; designLanguageVersion: string; generationSeed: string | null; aspectRatio: string; resolution: string };
  promptHash: string;
  estimatedLength: number;
  validation: RenderHubValidationIssue[];
};

export type RenderHubValidationIssue = { severity: "error" | "warning"; code: string; message: string; recordIds: string[] };
export type RenderQueueStatus = "queued" | "rendering" | "completed" | "failed" | "cancelled";

export type RenderHubQueueItem = {
  id: string;
  status: RenderQueueStatus;
  canonicalRecordId: string;
  promptId: string;
  providerId: string;
  generatedAssetId: string | null;
  updatedAt: string;
};

export type RenderHubCatalog = {
  id: typeof RENDER_HUB_ID;
  version: typeof RENDER_HUB_VERSION;
  providers: RenderHubProvider[];
  templates: PromptTemplate[];
  records: RenderHubCanonicalRecord[];
  prompts: CompiledRenderPrompt[];
  queue: RenderHubQueueItem[];
  validation: RenderHubValidationIssue[];
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `rh-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function cleanVisualText(value: string) {
  return value
    .replace(/[{}\[\]"]/g, " ")
    .replace(/(?:^|\s)(?:id|createdAt|updatedAt|status|schema|repository|implementation)\s*[:=][^,.;\n]*/gi, " ")
    .replace(/(?:\/Users\/|source-masters|studio-private:|return specification|implementation instructions)/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 360);
}

function fallbackVisualSummary(record: RenderHubCanonicalRecord) {
  const noun = record.assetType.toLowerCase();
  if (/planet/i.test(record.assetType)) return `A large ${record.assetCategory.toLowerCase()} planet with distinct terrain, atmosphere, and material character suited to the NOVERIS universe.`;
  if (/creature|plant|species/i.test(record.assetType)) return `A complete ${noun} production study with a readable silhouette, grounded anatomy, and a believable ecological role.`;
  if (/background|galaxy|region|system/i.test(record.assetType)) return `A quiet ${noun} environment with broad negative space and subtle scientifically plausible depth.`;
  return `A premium NOVERIS ${noun} with a clear role, restrained composition, and production-ready visual hierarchy.`;
}

export function summarizeCanonicalRecord(record: RenderHubCanonicalRecord) {
  const cleaned = cleanVisualText(record.visualDescription);
  return cleaned || fallbackVisualSummary(record);
}

function templateFor(assetType: string) {
  return renderHubPromptTemplates.find((templateItem) => templateItem.assetType.toLowerCase() === assetType.toLowerCase())
    || renderHubPromptTemplates.find((templateItem) => templateItem.assetType === "Background")!;
}

function outputSpec(outputType: string) {
  const transparent = /transparent|icon|hud/i.test(outputType);
  if (transparent) return { aspectRatio: "1:1", resolution: "2048x2048", transparent };
  if (/16:10/.test(outputType)) return { aspectRatio: "16:10", resolution: "3840x2400", transparent: false };
  if (/16:9|loading|environment/.test(outputType)) return { aspectRatio: "16:9", resolution: "3840x2160", transparent: false };
  return { aspectRatio: "3:2", resolution: "1536x1024", transparent: false };
}

export function compileRenderPrompt(record: RenderHubCanonicalRecord, options: { providerId?: string; outputType?: string } = {}): CompiledRenderPrompt {
  const providerId = options.providerId || record.providerId || "nano-banana-2";
  const provider = renderHubProviders.find((item) => item.id === providerId) || renderHubProviders.find((item) => item.id === "future-provider")!;
  const promptTemplate = templateFor(record.assetType);
  const outputType = options.outputType || promptTemplate.outputTypes[0];
  const output = outputSpec(outputType);
  const visualSummary = summarizeCanonicalRecord(record);
  const positivePrompt = [promptTemplate.positiveDirection, visualSummary, noverisDesignLanguage.promptProfile.prompt, `Output: ${outputType}, ${output.resolution}, ${output.aspectRatio}${output.transparent ? ", transparent-compatible output" : ""}.`].join(" ");
  const negativePrompt = [...promptTemplate.negativeRules, "no raw JSON", "no database fields", "no repository instructions", "no source paths", "no implementation instructions"].join(", ");
  const combinedPrompt = `POSITIVE PROMPT:\n${positivePrompt}\n\nNEGATIVE PROMPT:\n${negativePrompt}`;
  const metadata = { assetType: record.assetType, assetRole: record.assetRole, assetCategory: record.assetCategory, designLanguageId: noverisDesignLanguage.id, designLanguageVersion: noverisDesignLanguage.version, generationSeed: record.generationSeed, aspectRatio: output.aspectRatio, resolution: output.resolution };
  const promptHash = stableHash(JSON.stringify({ canonicalRecordId: record.id, canonicalRecordVersion: record.version, template: promptTemplate, provider: provider.id, outputType, visualSummary, designLanguageVersion: noverisDesignLanguage.version }));
  const provisional: CompiledRenderPrompt = {
    id: `prompt-${record.id}-${promptHash}`,
    canonicalRecordId: record.id,
    canonicalRecordVersion: record.version,
    promptTemplateId: promptTemplate.id,
    promptTemplateVersion: promptTemplate.version,
    providerId: provider.id,
    providerProfileVersion: RENDER_HUB_VERSION,
    outputType,
    visualSummary,
    positivePrompt,
    negativePrompt,
    combinedPrompt,
    metadata,
    promptHash,
    estimatedLength: combinedPrompt.length,
    validation: []
  };
  return { ...provisional, validation: validateCompiledRenderPrompt(provisional) };
}

export function validateCompiledRenderPrompt(prompt: CompiledRenderPrompt): RenderHubValidationIssue[] {
  const issues: RenderHubValidationIssue[] = [];
  const provider = renderHubProviders.find((item) => item.id === prompt.providerId);
  if (!provider) issues.push({ severity: "error", code: "unknown_provider", message: "The prompt references an unknown render provider.", recordIds: [prompt.canonicalRecordId] });
  if (provider && prompt.estimatedLength > provider.promptLimits.maximumCharacters) issues.push({ severity: "error", code: "prompt_too_long", message: `${provider.displayName} supports at most ${provider.promptLimits.maximumCharacters} prompt characters.`, recordIds: [prompt.canonicalRecordId] });
  if (provider && prompt.estimatedLength > provider.promptLimits.recommendedCharacters) issues.push({ severity: "warning", code: "prompt_over_recommended_length", message: `Prompt is longer than the ${provider.displayName} recommended length.`, recordIds: [prompt.canonicalRecordId] });
  if (/\{\s*"|\[\s*\{|"(?:id|createdAt|updatedAt|status)"\s*:/i.test(prompt.combinedPrompt)) issues.push({ severity: "error", code: "raw_json", message: "A compiled prompt contains raw JSON or schema-shaped data.", recordIds: [prompt.canonicalRecordId] });
  if (/source-masters|\/Users\/|studio-private:|repository instructions|return specification|implementation instructions/i.test(`${prompt.visualSummary}\n${prompt.positivePrompt}`)) issues.push({ severity: "error", code: "private_or_instructional_content", message: "A compiled prompt contains private source information or non-render instructions.", recordIds: [prompt.canonicalRecordId] });
  if (!prompt.visualSummary || prompt.visualSummary.length < 24) issues.push({ severity: "error", code: "missing_visual_summary", message: "A concise visual summary is required before compilation.", recordIds: [prompt.canonicalRecordId] });
  if (provider && prompt.metadata.aspectRatio && !provider.supportsAspectRatio) issues.push({ severity: "warning", code: "provider_aspect_ratio_unverified", message: `${provider.displayName} has no confirmed aspect-ratio support.`, recordIds: [prompt.canonicalRecordId] });
  if (provider && /transparent/i.test(prompt.outputType) && !provider.supportsTransparent) issues.push({ severity: "error", code: "transparent_output_unsupported", message: `${provider.displayName} does not support transparent output.`, recordIds: [prompt.canonicalRecordId] });
  if (provider && provider.supportedResolutions.length && !provider.supportedResolutions.includes(prompt.metadata.resolution)) {
    issues.push({ severity: "warning", code: "provider_resolution_unverified", message: `${provider.displayName} does not list ${prompt.metadata.resolution} as a supported resolution.`, recordIds: [prompt.canonicalRecordId] });
  }
  if (provider && provider.supportsAspectRatio && provider.supportedAspectRatios.length && !provider.supportedAspectRatios.includes(prompt.metadata.aspectRatio)) {
    issues.push({ severity: "warning", code: "provider_aspect_ratio_unverified", message: `${provider.displayName} does not list ${prompt.metadata.aspectRatio} as a supported aspect ratio.`, recordIds: [prompt.canonicalRecordId] });
  }
  return issues;
}

function assetToCanonicalRecord(asset: ProductionAsset): RenderHubCanonicalRecord {
  const preview = asset.derivatives.find((item) => item.publicUrl)?.publicUrl || asset.variants.find((item) => item.publicUrl)?.publicUrl || asset.sourceFiles.find((item) => item.previewUrl)?.previewUrl || null;
  const providerId = /freepik flux/i.test(asset.notes)
    ? "freepik-flux"
    : /openai images/i.test(asset.notes)
      ? "openai-images"
      : /comfyui/i.test(asset.notes)
        ? "comfyui"
        : "nano-banana-2";
  return {
    id: asset.id,
    displayName: asset.name,
    version: "1.0.0",
    assetType: asset.type || "Background",
    assetRole: asset.category || "visual",
    assetCategory: asset.category || "Uncategorized",
    visualDescription: asset.description || asset.notes,
    generationSeed: null,
    providerId,
    sourceMasterId: asset.currentMasterSourceId,
    previewUrl: preview,
    runtimeTargets: Object.keys(asset.platformMappings || {}),
    approvalStatus: asset.approvalStatus,
    productionStatus: asset.productionStatus,
    history: asset.historyEvents.map((event) => ({ id: event.id, eventType: event.eventType, timestamp: event.timestamp, note: event.notes || event.title || event.eventType }))
  };
}

function queueStatus(status: string): RenderQueueStatus {
  if (/rendering|processing/i.test(status)) return "rendering";
  if (/published|approved|generated|complete/i.test(status)) return "completed";
  if (/rejected|failed/i.test(status)) return "failed";
  if (/cancel/i.test(status)) return "cancelled";
  return "queued";
}

export function buildRenderHubCatalogFromCanonicalRecords(inputRecords: RenderHubCanonicalRecord[]): RenderHubCatalog {
  const records = [...inputRecords].sort((left, right) => left.displayName.localeCompare(right.displayName) || left.id.localeCompare(right.id));
  const prompts = records.map((record) => compileRenderPrompt(record));
  const queue = records.map((record, index) => ({ id: `render-${record.id}`, status: queueStatus(record.productionStatus), canonicalRecordId: record.id, promptId: prompts[index].id, providerId: prompts[index].providerId, generatedAssetId: /approved|published|generated/i.test(record.productionStatus) ? record.id : null, updatedAt: record.history.at(-1)?.timestamp || "2026-08-02T00:00:00.000Z" }));
  const validation = prompts.flatMap((prompt) => prompt.validation);
  const duplicateHashes = prompts.filter((prompt, index) => prompts.findIndex((candidate) => candidate.promptHash === prompt.promptHash) !== index);
  if (duplicateHashes.length) validation.push({ severity: "warning", code: "duplicate_prompt", message: "Multiple canonical records resolved to an identical prompt hash and should be reviewed before dispatch.", recordIds: [...new Set(duplicateHashes.map((prompt) => prompt.canonicalRecordId))] });
  return { id: RENDER_HUB_ID, version: RENDER_HUB_VERSION, providers: renderHubProviders.map((provider) => ({ ...provider, supportedModels: [...provider.supportedModels], supportedResolutions: [...provider.supportedResolutions], supportedAspectRatios: [...provider.supportedAspectRatios], recommendedSettings: [...provider.recommendedSettings] })), templates: renderHubPromptTemplates.map((item) => ({ ...item, negativeRules: [...item.negativeRules], outputTypes: [...item.outputTypes] })), records, prompts, queue, validation };
}

export function buildRenderHubCatalog(assets: ProductionAsset[]): RenderHubCatalog {
  return buildRenderHubCatalogFromCanonicalRecords(assets.map(assetToCanonicalRecord));
}

export function buildProviderDispatchPacket(prompt: CompiledRenderPrompt) {
  const provider = renderHubProviders.find((item) => item.id === prompt.providerId);
  return {
    providerId: prompt.providerId,
    promptFormat: provider?.promptFormat || "plain_text",
    positivePrompt: prompt.positivePrompt,
    negativePrompt: provider?.supportsNegativePrompt ? prompt.negativePrompt : null,
    combinedPrompt: provider?.supportsNegativePrompt ? null : prompt.combinedPrompt,
    generationSeed: provider?.supportsSeed ? prompt.metadata.generationSeed : null,
    resolution: prompt.metadata.resolution,
    aspectRatio: prompt.metadata.aspectRatio,
    referenceImages: provider?.supportsReferenceImages ? [] : undefined,
    promptHash: prompt.promptHash
  };
}

export function rollbackCompiledPrompt(prompt: CompiledRenderPrompt, priorPrompt: CompiledRenderPrompt) {
  if (prompt.canonicalRecordId !== priorPrompt.canonicalRecordId) throw new Error("Prompt rollback requires history for the same canonical record.");
  return { ...priorPrompt, id: `${priorPrompt.id}-rollback`, promptHash: stableHash(`${priorPrompt.promptHash}:rollback:${prompt.promptHash}`) };
}

export function buildRuntimePublicationCheck(catalog: RenderHubCatalog) {
  const approved = catalog.records.filter((record) => /approved|published/i.test(record.approvalStatus));
  return approved.map((record) => ({ assetId: record.id, runtimeKey: record.id, preview: record.previewUrl, version: record.version }));
}
