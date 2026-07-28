import definitionsJson from "@/data/environment-layer-generator-definitions.json";

export const environmentGeneratorStatuses = [
  "not_started",
  "prompt_copied",
  "generated",
  "psd_saved",
  "exported",
  "registered",
  "approved",
  "needs_revision"
] as const;

export type EnvironmentGeneratorStatus = (typeof environmentGeneratorStatuses)[number];
export type EnvironmentGeneratorId = "universe" | "galaxy" | "sector" | "starSystem";
export type TransparencyRequirement = "opaque" | "preferred" | "required";

export type EnvironmentLayerDefinition = {
  id: string;
  number: number;
  name: string;
  layerType: string;
  prefix: string;
  folder: string;
  runtimeExportFolder: string;
  output: {
    width: number;
    height: number;
    aspectRatio: string;
    transparency: TransparencyRequirement;
  };
  purpose: string;
  canonicalPrompt: string;
};

export type EnvironmentGeneratorDefinition = {
  id: EnvironmentGeneratorId;
  name: string;
  route: string;
  sourceRoot: string;
  layers: EnvironmentLayerDefinition[];
};

export type EnvironmentGeneratorControls = {
  theme: string;
  palette: string;
  mood: string;
  primaryColorFamily: string;
  secondaryColorFamily: string;
  accentColorFamily: string;
  density: string;
  brightness: string;
  negativeSpacePreference: string;
  centralSafeZonePercentage: number;
  masterResolution: string;
  runtimeExportResolution: string;
  aspectRatio: string;
  transparencyRequirement: string;
  styleNotes: string;
  additionalExclusions: string;
};

export type EnvironmentLayerProgress = {
  status: EnvironmentGeneratorStatus;
  editablePromptAdditions: string;
  filenameSuffix: string;
  previewRelativePath: string;
  notes: string;
};

export type EnvironmentLayerAssetRecord = {
  assetId: string;
  displayName: string;
  environmentType: EnvironmentGeneratorId;
  layerNumber: number;
  layerType: string;
  prefix: string;
  sourceRelativePath: string;
  previewRelativePath: string;
  runtimeExportRelativePath: string;
  dimensions: string;
  aspectRatio: string;
  transparency: TransparencyRequirement;
  themeTags: string[];
  paletteTags: string[];
  status: EnvironmentGeneratorStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export const environmentArtStandard = {
  id: "noveris-environment-art-standard",
  version: "1.0.0",
  referenceImagePath: "/images/environment-art-standard/noveris-environment-art-standard-v1.png",
  referenceImageSha256: "90ae71750a1d77212797abe6d53db3d34313361965c8b55cc5f936290a68f0f1",
  philosophy: "The environment creates wonder through realism, restraint, silence, scale, and negative space. Never through spectacle.",
  visualHierarchy: ["Gameplay", "Star", "Planets", "Interactive Elements", "Environment"],
  backgroundOccupancy: {
    artworkMinimumPercent: 10,
    artworkMaximumPercent: 15,
    quietMinimumPercent: 85,
    quietMaximumPercent: 90
  },
  starDensity: {
    tinyPercent: 98,
    mediumPercent: 1.5,
    brightPercent: 0.5
  },
  molecularCloudQualities: ["small", "fragmented", "subtle", "low contrast", "irregular", "partially dissolved"],
  requirements: [
    "Large uninterrupted negative space",
    "Extremely restrained molecular clouds",
    "Mostly tiny stars with very few bright stars",
    "Natural stellar density",
    "Restrained tilt-shift lens depth without a miniature effect",
    "Continuous focus transition with no visible banding through the center",
    "No obvious framing or wallpaper composition",
    "No fantasy appearance or exaggerated nebula",
    "No artificial vignette",
    "No large continuous dust bands",
    "No decorative effects"
  ],
  reviewChecklist: [
    "Large negative space dominates the image",
    "Center remains open",
    "Molecular clouds remain subtle",
    "No obvious focal point",
    "Bright stars remain rare",
    "Tilt-shift depth remains subtle and natural",
    "No visible center banding or hard focus seam",
    "No wallpaper composition",
    "No artificial vignette",
    "No fantasy appearance",
    "Environment supports gameplay",
    "Image feels scientifically believable"
  ]
} as const;

export const starSystemAstronomicalMattePaintingPrompt = {
  id: "star_system_astronomical_matte_painting_v1",
  version: "1.2",
  status: "LOCKED",
  approved: true,
  canonical: true,
  layerId: "starSystem-01-environment-painting",
  quietMode: {
    enabled: true,
    description: [
      "Prioritize restraint over spectacle.",
      "Choose the quieter, darker, more scientifically believable composition.",
      "Reduce visual clutter.",
      "Reduce bright stars.",
      "Preserve negative space."
    ],
    depthTreatment: "Use an extremely subtle tilt-shift-style selective focus falloff only in remote edge detail. Preserve astronomical scale; never create a miniature effect. Keep the focus transition continuous with no visible banding or focus seam through the center."
  }
} as const;

export const environmentPaintingOpticalStandard =
  "Apply a restrained tilt-shift lens appearance using only a subtle, continuous depth-of-field transition in remote edge detail. Keep the central gameplay area naturally sharp and visually uninterrupted. No visible banding may appear in or across the center. Do not create horizontal or vertical focus bands, a central blur band, hard focus seams, abrupt sharp-to-soft zones, or a miniature/toy effect.";

export const commonEnvironmentPromptFooter =
  "This is a reusable production asset, not concept art. Do not include text, logos, borders, frames, user interface elements, planets, spacecraft, orbit lines, or unrelated celestial objects unless explicitly requested for this layer. Preserve generous negative space and avoid obvious repeated patterns, artificial vignette, circular edge shading, radial falloff, lens distortion, and generated texture artifacts.";

export const transparentEnvironmentPromptFooter =
  "Isolate only the requested visual element. Preserve large transparent areas. No solid background. Output as a clean transparent PNG-ready composition.";

export const environmentArtDirection =
  "Premium NOVERIS science-fiction illustration; artist-directed HD-2D layered artwork; cinematic but restrained, painterly, elegant, uncluttered, with strong negative space, a readable central gameplay area, and one controlled focal hierarchy.";

export const defaultEnvironmentGeneratorControls: EnvironmentGeneratorControls = {
  theme: "Deep Frontier",
  palette: "Midnight sapphire, restrained cyan, muted violet",
  mood: "Ancient, quiet, immense",
  primaryColorFamily: "Deep navy",
  secondaryColorFamily: "Muted violet",
  accentColorFamily: "Pale cyan",
  density: "Restrained",
  brightness: "Low to medium",
  negativeSpacePreference: "Generous",
  centralSafeZonePercentage: 50,
  masterResolution: "3840 x 2160",
  runtimeExportResolution: "1920 x 1080",
  aspectRatio: "16:9",
  transparencyRequirement: "Follow canonical layer requirement",
  styleNotes: "",
  additionalExclusions: ""
};

export const environmentGeneratorDefinitions =
  definitionsJson.definitions as EnvironmentGeneratorDefinition[];

const legacyStarSystemAtmosphereLayerIds = [
  "starSystem-01-far-stars",
  "starSystem-02-mid-stars",
  "starSystem-03-rear-nebula",
  "starSystem-04-front-nebula",
  "starSystem-05-haze",
  "starSystem-06-space-dust"
] as const;

const legacyStarSystemAtmosphereTypes = new Set([
  "far-stars",
  "mid-stars",
  "rear-nebula",
  "front-nebula",
  "haze",
  "space-dust"
]);

const progressStatusRank: Record<EnvironmentGeneratorStatus, number> = {
  not_started: 0,
  prompt_copied: 1,
  generated: 2,
  psd_saved: 3,
  exported: 4,
  registered: 5,
  approved: 6,
  needs_revision: 7
};

export function getEnvironmentGeneratorDefinition(id: EnvironmentGeneratorId) {
  const definition = environmentGeneratorDefinitions.find((row) => row.id === id);
  if (!definition) {
    throw new Error(`Unknown environment generator: ${id}`);
  }
  return definition;
}

export function migrateEnvironmentLayerProgress(
  environmentType: EnvironmentGeneratorId,
  progress: Record<string, EnvironmentLayerProgress>
) {
  if (environmentType !== "starSystem") return progress;

  const targetId = "starSystem-01-environment-painting";
  const legacyRows = legacyStarSystemAtmosphereLayerIds
    .map((id) => progress[id])
    .filter((row): row is EnvironmentLayerProgress => Boolean(row));
  const current = progress[targetId];
  if (!current && !legacyRows.length) return progress;

  const rows = [current, ...legacyRows].filter((row): row is EnvironmentLayerProgress => Boolean(row));
  const uniqueText = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))].join("\n\n");
  const migrated: Record<string, EnvironmentLayerProgress> = { ...progress };
  for (const id of legacyStarSystemAtmosphereLayerIds) delete migrated[id];
  migrated[targetId] = {
    status: rows.reduce(
      (best, row) => progressStatusRank[row.status] > progressStatusRank[best] ? row.status : best,
      "not_started" as EnvironmentGeneratorStatus
    ),
    editablePromptAdditions: uniqueText(rows.map((row) => row.editablePromptAdditions)),
    filenameSuffix: current?.filenameSuffix || rows.find((row) => row.filenameSuffix.trim())?.filenameSuffix || "MidnightSapphire",
    previewRelativePath: current?.previewRelativePath || rows.find((row) => row.previewRelativePath.trim())?.previewRelativePath || "",
    notes: uniqueText(rows.map((row) => row.notes))
  };
  return migrated;
}

export function migrateEnvironmentLayerAssetRecord(
  record: EnvironmentLayerAssetRecord
): EnvironmentLayerAssetRecord {
  if (record.environmentType !== "starSystem") return record;

  const definition = getEnvironmentGeneratorDefinition("starSystem");
  const layer = legacyStarSystemAtmosphereTypes.has(record.layerType)
    ? definition.layers.find((row) => row.layerType === "environment-painting")
    : definition.layers.find((row) => row.layerType === record.layerType);
  if (!layer) return record;

  const sourceFilename = record.sourceRelativePath.split("/").at(-1) ?? "";
  const runtimeFilename = record.runtimeExportRelativePath.split("/").at(-1) ?? "";
  return {
    ...record,
    layerNumber: layer.number,
    layerType: layer.layerType,
    prefix: layer.prefix,
    sourceRelativePath: sourceFilename ? `${layer.folder}${sourceFilename}` : record.sourceRelativePath,
    runtimeExportRelativePath: runtimeFilename
      ? `${layer.runtimeExportFolder}${runtimeFilename}`
      : record.runtimeExportRelativePath,
    dimensions: `${layer.output.width}x${layer.output.height}`,
    aspectRatio: layer.output.aspectRatio,
    transparency: layer.output.transparency
  };
}

export function extractFixedExclusions(prompt: string) {
  return prompt
    .split(/\n\s*\n/)
    .map((row) => row.trim())
    .filter((row) => /^(no\b|do not\b|avoid\b)/i.test(row));
}

export function buildEnvironmentLayerPrompt(
  layer: EnvironmentLayerDefinition,
  controls: EnvironmentGeneratorControls,
  additions = ""
) {
  if (layer.id === starSystemAstronomicalMattePaintingPrompt.layerId) {
    return layer.canonicalPrompt;
  }

  const artistDirection = [
    "Artist direction:",
    environmentArtDirection,
    `Theme: ${controls.theme}.`,
    `Palette: ${controls.palette}.`,
    `Mood: ${controls.mood}.`,
    `Color hierarchy: ${controls.primaryColorFamily} primary, ${controls.secondaryColorFamily} secondary, ${controls.accentColorFamily} accent.`,
    `Density: ${controls.density}. Brightness: ${controls.brightness}. Negative space: ${controls.negativeSpacePreference}.`,
    `Keep the central ${controls.centralSafeZonePercentage}% suitable for gameplay and navigation.`,
    `Master resolution: ${controls.masterResolution}. Runtime target: ${controls.runtimeExportResolution}. Aspect ratio: ${controls.aspectRatio}.`,
    `Transparency: ${controls.transparencyRequirement}.`
  ];
  if (controls.styleNotes.trim()) artistDirection.push(`Additional style notes: ${controls.styleNotes.trim()}`);
  if (additions.trim()) artistDirection.push(`Layer-specific additions: ${additions.trim()}`);
  if (controls.additionalExclusions.trim()) artistDirection.push(`Additional exclusions: ${controls.additionalExclusions.trim()}`);

  return [
    layer.canonicalPrompt,
    artistDirection.join("\n"),
    layer.output.transparency === "opaque" ? environmentPaintingOpticalStandard : "",
    commonEnvironmentPromptFooter,
    layer.output.transparency === "opaque" ? "" : transparentEnvironmentPromptFooter
  ]
    .filter(Boolean)
    .join("\n\n");
}

function safeFilenamePart(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join("") || "Untitled";
}

export function nextEnvironmentLayerFilename(
  prefix: string,
  suffix: string,
  existingPaths: string[]
) {
  const used = new Set(
    existingPaths
      .map((value) => value.split("/").at(-1) ?? "")
      .map((value) => value.match(new RegExp(`^${prefix}_(\\d{3})_`, "i"))?.[1])
      .filter(Boolean)
      .map(Number)
  );
  let index = 1;
  while (used.has(index)) index += 1;
  return `${prefix}_${String(index).padStart(3, "0")}_${safeFilenamePart(suffix)}.psd`;
}

export function buildEnvironmentLayerAssetRecord(input: {
  definition: EnvironmentGeneratorDefinition;
  layer: EnvironmentLayerDefinition;
  filename: string;
  previewRelativePath: string;
  status: EnvironmentGeneratorStatus;
  notes: string;
  controls: EnvironmentGeneratorControls;
  now?: string;
}): EnvironmentLayerAssetRecord {
  const now = input.now ?? new Date().toISOString();
  const baseName = input.filename.replace(/\.psd$/i, "");
  return {
    assetId: `environment-${input.definition.id}-${baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    displayName: `${input.layer.name} - ${baseName}`,
    environmentType: input.definition.id,
    layerNumber: input.layer.number,
    layerType: input.layer.layerType,
    prefix: input.layer.prefix,
    sourceRelativePath: `${input.layer.folder}${input.filename}`,
    previewRelativePath: input.previewRelativePath.trim(),
    runtimeExportRelativePath: `${input.layer.runtimeExportFolder}${baseName}.webp`,
    dimensions: `${input.layer.output.width}x${input.layer.output.height}`,
    aspectRatio: input.layer.output.aspectRatio,
    transparency: input.layer.output.transparency,
    themeTags: [input.controls.theme].filter(Boolean),
    paletteTags: [
      input.controls.palette,
      input.controls.primaryColorFamily,
      input.controls.secondaryColorFamily,
      input.controls.accentColorFamily
    ].filter(Boolean),
    status: input.status,
    notes: input.notes.trim(),
    createdAt: now,
    updatedAt: now
  };
}

export function calculateEnvironmentGeneratorProgress(
  definition: EnvironmentGeneratorDefinition,
  progress: Record<string, EnvironmentLayerProgress>,
  assets: EnvironmentLayerAssetRecord[]
) {
  const rows = definition.layers.map((layer) => progress[layer.id]?.status ?? "not_started");
  const started = rows.filter((status) => status !== "not_started").length;
  const approved = rows.filter((status) => status === "approved").length;
  const needsRevision = rows.filter((status) => status === "needs_revision").length;
  const psdSaved = rows.filter((status) => ["psd_saved", "exported", "registered", "approved"].includes(status)).length;
  const exported = rows.filter((status) => ["exported", "registered", "approved"].includes(status)).length;
  const registered = assets.filter((asset) => asset.environmentType === definition.id).length;
  const missingPreviews = definition.layers.filter((layer) => !progress[layer.id]?.previewRelativePath.trim()).length;
  const approvedExports = rows.filter((status) => status === "approved").length;

  return {
    total: definition.layers.length,
    started,
    approved,
    needsRevision,
    notStarted: rows.length - started,
    psdSaved,
    exported,
    registered,
    missingPreviews,
    missingApprovedExports: rows.length - approvedExports
  };
}

export function validateEnvironmentGeneratorDefinitions() {
  const issues: string[] = [];
  const expectedIds: EnvironmentGeneratorId[] = ["universe", "galaxy", "sector", "starSystem"];

  if (environmentGeneratorDefinitions.length !== 4) issues.push("Exactly four environment generator definitions are required.");
  for (const id of expectedIds) {
    const definition = environmentGeneratorDefinitions.find((row) => row.id === id);
    if (!definition) {
      issues.push(`Missing ${id} generator definition.`);
      continue;
    }
    const numbers = definition.layers.map((layer) => layer.number);
    const prefixes = definition.layers.map((layer) => layer.prefix.toLowerCase());
    if (new Set(numbers).size !== numbers.length) issues.push(`${id} has duplicate layer numbers.`);
    if (new Set(prefixes).size !== prefixes.length) issues.push(`${id} has duplicate layer prefixes.`);
    for (const layer of definition.layers) {
      if (!layer.canonicalPrompt.trim()) issues.push(`${layer.id} is missing its canonical prompt.`);
      const validSourcePath = layer.folder.startsWith("source-masters/environments/")
        || layer.folder.startsWith("source-masters/galaxies/")
        || layer.folder.startsWith("source-masters/galactic-regions/")
        || layer.folder.startsWith("source-masters/star-systems/");
      if (!validSourcePath) issues.push(`${layer.id} has an invalid source path.`);
      if (layer.folder.startsWith("/") || layer.folder.includes("..")) issues.push(`${layer.id} emits an unsafe source path.`);
      if (layer.output.transparency !== "opaque" && !/transparent/i.test(layer.canonicalPrompt)) {
        issues.push(`${layer.id} is transparent but lacks transparency language.`);
      }
      if (layer.output.transparency === "opaque" && /transparent png-ready/i.test(layer.canonicalPrompt)) {
        issues.push(`${layer.id} is opaque but requires transparent output.`);
      }
    }
  }
  return issues;
}
