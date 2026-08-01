import galacticRegionDerivativeData from "@/data/galactic-region-environment-painting-derivatives.json";
import starSystemDerivativeData from "@/data/star-system-environment-painting-derivatives.json";
import type { CanonicalAssetStatus } from "@/lib/production/asset-model";

export const backgroundContextTypes = [
  "universe",
  "galaxy",
  "galactic_region",
  "star_system",
  "planet_orbit",
  "planet_surface",
  "civilization_command",
  "research",
  "skill_tree",
  "discovery",
  "encyclopedia",
  "mission",
  "event",
  "settlement",
  "colony",
  "loading",
  "menu",
  "generic_space"
] as const;

export type BackgroundContextType = (typeof backgroundContextTypes)[number];

export type BackgroundRecord = {
  id: string;
  name: string;
  contextType: BackgroundContextType;
  canonicalOwnerId: string | null;
  environmentType: string;
  visualTheme: string;
  aspectRatio: "16:10" | "16:9" | string;
  masterWidth: number;
  masterHeight: number;
  cropPolicy: "cover" | "contain";
  focalPoint: { x: number; y: number };
  safeAreas: Array<{ id: string; x: number; y: number; width: number; height: number }>;
  modelProfileId: string;
  promptId: string | null;
  approvedAssetId: string | null;
  approvedAssetReference: string | null;
  previewAssetId: string | null;
  previewAssetReference: string | null;
  thumbnailAssetId: string | null;
  thumbnailAssetReference: string | null;
  sourceMasterId: string | null;
  productionStatus: CanonicalAssetStatus;
  runtimeRole: "background";
  runtimeTargets: string[];
  version: number;
  staleStatus: "current" | "stale";
  checksum: string | null;
  metadata: Record<string, unknown>;
};

export type BackgroundPromptInput = {
  contextType: BackgroundContextType;
  canonicalOwnerId?: string;
  ownerName?: string;
  environment?: string;
  starType?: string;
  atmosphere?: string;
  visualPalette?: string;
  nebulaDensity?: "none" | "very-low" | "low";
  dustDensity?: "none" | "very-low" | "low";
  starDensity?: "sparse" | "natural";
  brightness?: "very-dark" | "dark";
  contrast?: "low" | "restrained";
  focalPoint?: string;
  artDirection?: string;
  prohibitedElements?: string[];
};

export const defaultBackgroundAuthoringProfile = {
  id: "background-authoring-default-v1",
  modelProfileId: "nano-banana-2",
  masterWidth: 3840,
  masterHeight: 2400,
  aspectRatio: "16:10" as const,
  cropPolicy: "cover" as const,
  displayIntent: "decorative only",
  interactiveObjectsAllowed: false
};

const safeAreas = [{ id: "canonical-hud", x: 0.04, y: 0.04, width: 0.92, height: 0.92 }];

type Derivative = { id: string; path: string; width: number; height: number; checksum: string };

function derivative(record: { derivatives: readonly Derivative[] }, id: string) {
  return record.derivatives.find((item) => item.id === id) ?? null;
}

function migratedRecord(input: {
  id: string;
  name: string;
  contextType: "star_system" | "galactic_region";
  ownerId: string | null;
  sourceWidth: number;
  sourceHeight: number;
  sourceChecksum: string;
  derivatives: readonly Derivative[];
}): BackgroundRecord {
  const game = derivative(input, "game_png");
  const preview = derivative(input, "web_preview");
  const thumbnail = derivative(input, "library_thumbnail");
  const published = Boolean(input.ownerId && game && preview && thumbnail);
  return {
    id: `background-${input.contextType.replace("_", "-")}-${input.id}`,
    name: input.name,
    contextType: input.contextType,
    canonicalOwnerId: input.ownerId,
    environmentType: input.contextType === "star_system" ? "deep-space" : "galactic-structure",
    visualTheme: "noveris-restrained-space",
    aspectRatio: game ? `${game.width}:${game.height}` : `${input.sourceWidth}:${input.sourceHeight}`,
    masterWidth: input.sourceWidth,
    masterHeight: input.sourceHeight,
    cropPolicy: "cover",
    focalPoint: { x: 0.5, y: 0.5 },
    safeAreas,
    modelProfileId: "nano-banana-2",
    promptId: `prompt-${input.contextType.replace("_", "-")}-environment-v1`,
    approvedAssetId: published ? `asset-${input.contextType.replace("_", "-")}-environment-painting-${input.id}` : null,
    approvedAssetReference: published ? game?.path ?? null : null,
    previewAssetId: preview ? `preview-${input.contextType.replace("_", "-")}-${input.id}` : null,
    previewAssetReference: preview?.path ?? null,
    thumbnailAssetId: thumbnail ? `thumbnail-${input.contextType.replace("_", "-")}-${input.id}` : null,
    thumbnailAssetReference: thumbnail?.path ?? null,
    sourceMasterId: `source-master-${input.contextType.replace("_", "-")}-${input.id}`,
    productionStatus: published ? "published" : game ? "extracted" : "extraction_pending",
    runtimeRole: "background",
    runtimeTargets: published ? ["unity", "web", "roblox", "unreal", "godot", "generic"] : [],
    version: 1,
    staleStatus: "current",
    checksum: game?.checksum ?? input.sourceChecksum,
    metadata: {
      migratedFrom: input.contextType === "star_system" ? "star-system-backgrounds-v1" : "galactic-region-environment-paintings-v1",
      flatComposite: true,
      interactiveObjectsBakedIn: false,
      legacyLayerMetadataRetainedForAuditOnly: true
    }
  };
}

const starSystemBackgrounds = starSystemDerivativeData.records
  .filter((record) => record.status === "published")
  .map((record) => migratedRecord({
    id: record.id,
    name: record.displayName,
    contextType: "star_system",
    ownerId: record.systemId,
    sourceWidth: record.source.width,
    sourceHeight: record.source.height,
    sourceChecksum: record.source.checksum,
    derivatives: record.derivatives
  }));

const galacticRegionBackgrounds = galacticRegionDerivativeData.records
  .filter((record) => record.status === "published")
  .map((record) => migratedRecord({
    id: record.id,
    name: record.displayName,
    contextType: "galactic_region",
    ownerId: record.galacticRegionId,
    sourceWidth: record.source.width,
    sourceHeight: record.source.height,
    sourceChecksum: record.source.checksum,
    derivatives: record.derivatives
  }));

const galaxySourceMasterIds = ["0001", "0003", "0004", "0005", "0006", "0007", "0008", "milky-way"];
const galaxyBackgrounds: BackgroundRecord[] = galaxySourceMasterIds.map((id) => ({
  id: `background-galaxy-${id}`,
  name: id === "milky-way" ? "Milky Way Environment Painting" : `${id} Galaxy Environment Painting`,
  contextType: "galaxy",
  canonicalOwnerId: id === "milky-way" ? "galaxy-milky-way" : null,
  environmentType: "deep-space",
  visualTheme: "noveris-restrained-space",
  aspectRatio: defaultBackgroundAuthoringProfile.aspectRatio,
  masterWidth: defaultBackgroundAuthoringProfile.masterWidth,
  masterHeight: defaultBackgroundAuthoringProfile.masterHeight,
  cropPolicy: defaultBackgroundAuthoringProfile.cropPolicy,
  focalPoint: { x: 0.5, y: 0.5 },
  safeAreas,
  modelProfileId: defaultBackgroundAuthoringProfile.modelProfileId,
  promptId: "prompt-galaxy-environment-v1",
  approvedAssetId: null,
  approvedAssetReference: null,
  previewAssetId: null,
  previewAssetReference: null,
  thumbnailAssetId: null,
  thumbnailAssetReference: null,
  sourceMasterId: `source-master-galaxy-${id}`,
  productionStatus: "extraction_pending",
  runtimeRole: "background",
  runtimeTargets: [],
  version: 1,
  staleStatus: "current",
  checksum: null,
  metadata: {
    sourceMasterKnown: true,
    flatComposite: true,
    approvedDerivativeMissing: true,
    interactiveObjectsBakedIn: false
  }
}));

export const backgroundLibraryRecords: BackgroundRecord[] = [
  ...galaxyBackgrounds,
  ...galacticRegionBackgrounds,
  ...starSystemBackgrounds
].sort((left, right) => left.contextType.localeCompare(right.contextType) || left.name.localeCompare(right.name, undefined, { numeric: true }));

export function compileBackgroundPrompt(input: BackgroundPromptInput) {
  const prohibited = [
    "central selectable objects",
    "planets",
    "interactive stars",
    "orbit paths",
    "labels",
    "text",
    "UI",
    "frames",
    "HUD",
    "buttons",
    "gameplay indicators",
    "discovery markers",
    "baked-in data",
    ...(input.prohibitedElements ?? [])
  ];
  const identity = input.ownerName || input.canonicalOwnerId
    ? `The canonical owner is ${input.ownerName ?? input.canonicalOwnerId}.`
    : "This is a reusable unassigned production background.";
  return [
    `Create a premium flat ${input.contextType.replaceAll("_", " ")} background for a NOVERIS game screen using Nano Banana 2.`,
    identity,
    "Use a 2D face-on atlas presentation. The image is decorative only; Unity will overlay every interactive and data-bearing element.",
    `Environment: ${input.environment ?? "quiet deep space"}. Star type: ${input.starType ?? "not baked into the image"}. Atmosphere: ${input.atmosphere ?? "none"}.`,
    `Palette: ${input.visualPalette ?? "dark restrained navy-black with subtle cool variation"}. Nebula density: ${input.nebulaDensity ?? "very-low"}. Dust density: ${input.dustDensity ?? "very-low"}. Star density: ${input.starDensity ?? "sparse"}.`,
    `Brightness: ${input.brightness ?? "very-dark"}. Contrast: ${input.contrast ?? "low"}. Preserve visual calm and broad negative space.`,
    `Focal-point intent: ${input.focalPoint ?? "no focal object; preserve the central gameplay field"}. Preserve safe areas for the canonical HUD.`,
    input.artDirection ?? "Use subtle nebulosity, faint dust structures, and mostly tiny restrained stars. Keep bright areas minimal.",
    "No vignette. No visible blur band or hard focus transition. Any depth falloff must be subtle and optically continuous.",
    `Do not include: ${prohibited.join(", ")}.`,
    `Master resolution ${defaultBackgroundAuthoringProfile.masterWidth} x ${defaultBackgroundAuthoringProfile.masterHeight}. Aspect ratio ${defaultBackgroundAuthoringProfile.aspectRatio}.`,
    "Suitable as a flat Unity screen background."
  ].join("\n\n");
}

export function validateBackgroundRecords(records: BackgroundRecord[] = backgroundLibraryRecords) {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) issues.push(`Duplicate background ID: ${record.id}`);
    ids.add(record.id);
    if (!backgroundContextTypes.includes(record.contextType)) issues.push(`Invalid context type: ${record.id}`);
    if (record.masterWidth <= 0 || record.masterHeight <= 0) issues.push(`Invalid resolution: ${record.id}`);
    if (!record.cropPolicy) issues.push(`Missing crop policy: ${record.id}`);
    if (!record.safeAreas.length) issues.push(`Missing safe area: ${record.id}`);
    if (record.metadata.interactiveObjectsBakedIn === true) issues.push(`Interactive objects baked into background metadata: ${record.id}`);
    if (record.productionStatus === "published" && (!record.canonicalOwnerId || !record.approvedAssetReference || !record.checksum)) {
      issues.push(`Published background is incomplete: ${record.id}`);
    }
  }
  return issues;
}
