import type { ImportIssue, RuntimeStarSystemBackground, StarSystemBackgroundRecord, StarSystemBackgroundTemplateSpec, StarSystemVisualProfile } from "@/types/runtime";
import { generateSector, generateGalaxy, generateStarSystems, generateUniverse } from "@/lib/universe/generator";
import derivativeData from "@/data/star-system-environment-painting-derivatives.json";

export const starSystemBackgroundContractVersion = "1.0.0";
export const starSystemBackgroundGenerationVersion = 1;

export const starSystemBackgroundTemplateSpec: StarSystemBackgroundTemplateSpec = {
  id: "star_system_background_psd_template_v1",
  version: starSystemBackgroundContractVersion,
  displayName: "NOVERIS Star System Environment Painting PSD",
  sourceFormat: "psd",
  masterDesktop: {
    width: 7680,
    height: 4320,
    aspectRatio: "16:9",
    colorDepth: "16-bit RGB preferred",
    colorProfile: "sRGB or Display P3 converted consistently during export"
  },
  minimumDesktop: { width: 3840, height: 2160 },
  optionalMobile: {
    width: 2160,
    height: 3840,
    aspectRatio: "9:16",
    notes: "A portrait composition may be supplied, or the master PSD must declare a mobile-safe crop."
  },
  requiredLayerGroups: [
    "00_GUIDES_DO_NOT_EXPORT",
    "01_BACKGROUND_BASE",
    "02_NEBULA",
    "03_DUST_AND_STARS",
    "04_ATLAS_DECORATION_OPTIONAL",
    "05_FOG_MASKS_OPTIONAL",
    "99_NOTES_DO_NOT_EXPORT"
  ],
  guideLayers: ["STAR_CENTER_GUIDE", "STAR_EXCLUSION_ZONE", "DESKTOP_SAFE_ZONE", "MOBILE_SAFE_ZONE", "OVERSCAN_GUIDE"],
  forbiddenBakedContent: [
    "canonical sun or barycenter",
    "canonical planets",
    "canonical moons",
    "canonical orbit rings",
    "canonical stations",
    "canonical anomalies",
    "gameplay route lines",
    "destination labels",
    "selection frames",
    "fog openings tied to player state",
    "scanner pulses",
    "probe trails"
  ],
  derivativeTargets: [
    { id: "desktop_avif", format: "avif", width: 3840, height: 2160, publicRuntime: true },
    { id: "desktop_webp", format: "webp", width: 3840, height: 2160, publicRuntime: true },
    { id: "desktop_png", format: "png", width: 3840, height: 2160, publicRuntime: true },
    { id: "desktop_1440_webp", format: "webp", width: 2560, height: 1440, publicRuntime: true },
    { id: "mobile_webp", format: "webp", width: 2160, height: 3840, publicRuntime: true },
    { id: "mobile_png", format: "png", width: 2160, height: 3840, publicRuntime: true },
    { id: "review_preview", format: "webp", width: 1600, height: 900, publicRuntime: false },
    { id: "thumbnail", format: "webp", width: 512, height: 288, publicRuntime: false }
  ],
  validationLimitations: [
    "Full PSD layer parsing is marked unsupported until a server-side PSD parser or conversion service is attached.",
    "Bright-region conflict checks are represented as validation metadata and should be backed by luminance analysis when derivatives are generated."
  ]
};

const publicDerivativeBase = "/generated/game-assets/star-systems";

type PublicDerivative = StarSystemBackgroundRecord["derivatives"][number] & { publicPath: string; checksum: string };

function hasPublicDerivative(derivative: StarSystemBackgroundRecord["derivatives"][number] | undefined): derivative is PublicDerivative {
  return Boolean(derivative?.publicPath && derivative.checksum);
}

type EnvironmentPaintingDerivativeRow = (typeof derivativeData.records)[number];

function environmentPaintingDerivatives(record: EnvironmentPaintingDerivativeRow) {
  const gamePng = record.derivatives.find((row) => row.id === "game_png");
  const preview = record.derivatives.find((row) => row.id === "web_preview");
  const thumbnail = record.derivatives.find((row) => row.id === "library_thumbnail");
  if (!gamePng || !preview || !thumbnail) throw new Error(`${record.displayName} derivative set is incomplete.`);
  return [
    {
      targetId: "desktop_png",
      format: "png" as const,
      width: gamePng.width,
      height: gamePng.height,
      publicPath: gamePng.path,
      checksum: gamePng.checksum,
      status: "generated" as const
    },
    {
      targetId: "review_preview",
      format: "webp" as const,
      width: preview.width,
      height: preview.height,
      publicPath: preview.path,
      checksum: preview.checksum,
      status: "generated" as const
    },
    {
      targetId: "thumbnail",
      format: "webp" as const,
      width: thumbnail.width,
      height: thumbnail.height,
      publicPath: thumbnail.path,
      checksum: thumbnail.checksum,
      status: "generated" as const
    }
  ];
}

function assignedSystemId(record: EnvironmentPaintingDerivativeRow) {
  return record.systemId ?? undefined;
}

function buildEnvironmentPaintingRecord(record: EnvironmentPaintingDerivativeRow): StarSystemBackgroundRecord {
  const systemId = assignedSystemId(record);
  const canonicalId = record.id === "sol" ? "ssbg-sol-local-atlas" : `ssbg-environment-painting-${record.id}`;
  return {
    id: canonicalId,
    name: record.displayName,
    slug: record.id,
    status: "published",
    sourceFormat: "psd",
    sourceAssetId: record.id === "sol" ? "asset-ssbg-sol-local-atlas-source" : `asset-star-system-environment-painting-${record.id}`,
    sourceFilename: `environment-painting-${record.id}.psd`,
    sourceRevision: 1,
    runtimeRevision: 1,
    generationVersion: starSystemBackgroundGenerationVersion,
    assignedSystemIds: systemId ? [systemId] : [],
    compatiblePaletteIds: ["euclid-blue", "aurora-teal", "ancient-gold"],
    backgroundMode: "hybrid",
    fit: "cover",
    anchor: { x: 0.5, y: 0.5 },
    focalPoint: { x: 0.5, y: 0.5 },
    starExclusionZone: { x: 0.5, y: 0.5, radius: 0.12 },
    contentSafeZone: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
    mobileCrop: { x: 0.24, y: 0, width: 0.52, height: 1 },
    desktopCrop: { x: 0, y: 0, width: 1, height: 1 },
    blendMode: "screen",
    opacity: 1,
    colorGrade: { exposure: 0, saturation: 0, contrast: 0, hueShift: 0 },
    visualTags: record.id === "sol" ? ["home-system", "solar-neighborhood", "environment-painting"] : ["generated-system", "environment-painting"],
    notes: systemId
      ? `Canonical environment painting assigned exclusively to ${systemId}. Studio cards and clients consume derivatives generated from the exact PSD composite.`
      : "Canonical environment painting awaiting the next generated star-system assignment.",
    createdAt: "2026-07-26T00:00:00.000Z",
    updatedAt: "2026-07-26T00:00:00.000Z",
    publishedAt: "2026-07-26T00:00:00.000Z",
    validation: {
      status: "Ready With Warnings",
      parserCapabilities: {
        canvasMetadata: true,
        colorMode: true,
        bitDepth: true,
        layerGroups: false,
        flattenedPreview: true,
        luminanceAnalysis: false
      },
      issues: [
        { severity: "info", code: "psd_layer_review_manual", message: "Layer-group and luminance review remain artist-approved manual checks.", records: [canonicalId] }
      ]
    },
    derivatives: environmentPaintingDerivatives(record)
  };
}

export const canonicalStarSystemBackgrounds: StarSystemBackgroundRecord[] = [...derivativeData.records]
  .filter((record) => record.status === "published")
  .sort((left, right) => {
    if (left.id === "sol") return -1;
    if (right.id === "sol") return 1;
    return left.id.localeCompare(right.id, undefined, { numeric: true });
  })
  .map(buildEnvironmentPaintingRecord);

function normalizePath(path: string) {
  return path.replace(/\\/g, "/");
}

export function sanitizeStarSystemBackground(record: StarSystemBackgroundRecord): RuntimeStarSystemBackground | null {
  if (record.status !== "published") return null;
  const desktopPng = record.derivatives.find((derivative) => derivative.targetId === "desktop_png" && hasPublicDerivative(derivative));
  if (!hasPublicDerivative(desktopPng)) return null;
  const desktopWebp = record.derivatives.find((derivative) => derivative.targetId === "desktop_webp" && hasPublicDerivative(derivative));
  const desktopAvif = record.derivatives.find((derivative) => derivative.targetId === "desktop_avif" && hasPublicDerivative(derivative));
  const mobileWebp = record.derivatives.find((derivative) => derivative.targetId === "mobile_webp" && hasPublicDerivative(derivative));
  const mobilePng = record.derivatives.find((derivative) => derivative.targetId === "mobile_png" && hasPublicDerivative(derivative));
  const thumbnail = record.derivatives.find((derivative) => derivative.targetId === "thumbnail" && hasPublicDerivative(derivative));

  return {
    assetId: record.id,
    sourceType: "studio-authored",
    sourceFormat: "psd",
    sourceRevision: record.sourceRevision,
    runtimeRevision: record.runtimeRevision,
    mode: record.backgroundMode,
    desktop: {
      avif: desktopAvif?.publicPath,
      webp: desktopWebp?.publicPath,
      png: desktopPng.publicPath,
      width: desktopPng.width,
      height: desktopPng.height
    },
    mobile: mobilePng || mobileWebp ? {
      webp: mobileWebp?.publicPath,
      png: mobilePng?.publicPath ?? mobileWebp?.publicPath ?? desktopPng.publicPath,
      width: mobilePng?.width ?? mobileWebp?.width ?? desktopPng.width,
      height: mobilePng?.height ?? mobileWebp?.height ?? desktopPng.height
    } : undefined,
    thumbnail: thumbnail?.publicPath ?? desktopWebp?.publicPath ?? desktopPng.publicPath,
    focalPoint: record.focalPoint,
    starExclusionZone: record.starExclusionZone,
    contentSafeZone: record.contentSafeZone,
    fit: record.fit,
    anchor: record.anchor,
    blendMode: record.blendMode,
    opacity: record.opacity,
    colorGrade: record.colorGrade,
    checksum: desktopPng.checksum
  };
}

export function getRuntimeStarSystemBackgrounds() {
  return canonicalStarSystemBackgrounds.map(sanitizeStarSystemBackground).filter((record): record is RuntimeStarSystemBackground => Boolean(record));
}

export function resolveStarSystemBackground(systemId: string) {
  const direct = canonicalStarSystemBackgrounds.find((record) => record.assignedSystemIds.includes(systemId) && record.status === "published");
  return direct ? sanitizeStarSystemBackground(direct) : null;
}

export function buildStarSystemVisualProfile(systemId: string, visualSignatureId?: string): StarSystemVisualProfile {
  const background = resolveStarSystemBackground(systemId);
  return {
    systemId,
    visualSignatureId: visualSignatureId ?? `${systemId}:visual-signature`,
    backgroundMode: background?.mode ?? "procedural",
    starSystemBackgroundId: background?.assetId,
    backgroundRevision: background?.runtimeRevision,
    paletteId: undefined,
    visualVariantIndex: 0,
    visualTags: background ? ["authored-environment-painting"] : ["procedural-fallback"]
  };
}

export function starSystemBackgroundAssetLibraryRows() {
  return canonicalStarSystemBackgrounds.map((record) => ({
    id: record.id,
    displayName: record.name,
    assetType: "star-system-environment-painting" as const,
    sourceFormat: record.sourceFormat,
    runtimeFormats: ["avif", "webp", "png"],
    lineage: `PSD revision ${record.sourceRevision} -> flattened master -> runtime revision ${record.runtimeRevision}`,
    status: record.status,
    assignedSystemCount: record.assignedSystemIds.length
  }));
}

export function validateStarSystemBackgroundRecords(records: StarSystemBackgroundRecord[] = canonicalStarSystemBackgrounds): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const ids = records.map((record) => record.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const universe = generateUniverse("PROJECT-GENESIS-UNIVERSE");
  const galaxy = generateGalaxy(universe.universe_seed, 0);
  const sector = generateSector(galaxy, 0);
  const generatedSystemIds = new Set(generateStarSystems(sector, 12).map((system) => system.id));

  for (const id of duplicateIds) {
    issues.push({ severity: "error", code: "star_system_background_duplicate_id", message: "Star-system background IDs must be unique.", records: [id] });
  }

  const assignments = records.flatMap((record) => record.assignedSystemIds);
  const duplicateAssignments = [...new Set(assignments.filter((systemId, index) => assignments.indexOf(systemId) !== index))];
  for (const systemId of duplicateAssignments) {
    issues.push({ severity: "error", code: "star_system_environment_painting_reused", message: "An environment painting assignment must be exclusive; each star system may resolve exactly one painting.", records: [systemId] });
  }

  for (const record of records) {
    if (record.sourceFormat !== "psd" || !record.sourceFilename.toLowerCase().endsWith(".psd")) {
      issues.push({ severity: "error", code: "star_system_background_source_format_invalid", message: "Star-system backgrounds must retain PSD as the canonical source format.", records: [record.id] });
    }
    if (record.sourceFilename.includes("/Users/") || record.sourceFilename.includes("studio-private://")) {
      issues.push({ severity: "error", code: "star_system_background_private_path_leak", message: "Source filenames must not expose private local or storage paths.", records: [record.id] });
    }
    for (const path of record.derivatives.map((derivative) => derivative.publicPath).filter(Boolean)) {
      if (path && (/\.psd($|\?)/i.test(path) || /\/Users\//.test(path) || /studio-private:\/\//.test(path))) {
        issues.push({ severity: "error", code: "star_system_background_public_path_invalid", message: "Public derivatives must never expose PSD files or private paths.", records: [record.id, normalizePath(path)] });
      }
    }
    if (record.starExclusionZone.radius <= 0 || record.starExclusionZone.radius > 0.5 || record.starExclusionZone.x < 0 || record.starExclusionZone.x > 1 || record.starExclusionZone.y < 0 || record.starExclusionZone.y > 1) {
      issues.push({ severity: "error", code: "star_system_background_exclusion_zone_invalid", message: "Star exclusion zone must remain normalized inside the canvas.", records: [record.id] });
    }
    if (record.opacity < 0 || record.opacity > 1) {
      issues.push({ severity: "error", code: "star_system_background_opacity_invalid", message: "Background opacity must be normalized from 0 to 1.", records: [record.id] });
    }
    for (const systemId of record.assignedSystemIds) {
      if (!generatedSystemIds.has(systemId)) {
        issues.push({ severity: "warning", code: "star_system_background_assignment_unresolved", message: "Assigned star system is not present in the current generated library preview set.", records: [record.id, systemId] });
      }
    }
    if (record.status === "published") {
      const runtime = sanitizeStarSystemBackground(record);
      if (!runtime) {
        issues.push({ severity: "error", code: "star_system_background_published_runtime_missing", message: "Published backgrounds must have sanitized runtime derivatives.", records: [record.id] });
      }
      if (!record.derivatives.some((derivative) => derivative.targetId === "desktop_png" && derivative.publicPath)) {
        issues.push({ severity: "error", code: "star_system_background_png_fallback_missing", message: "Published backgrounds must include a desktop PNG fallback.", records: [record.id] });
      }
    }
    if (!record.mobileCrop && !record.derivatives.some((derivative) => derivative.targetId.startsWith("mobile_"))) {
      issues.push({ severity: "warning", code: "star_system_background_mobile_strategy_missing", message: "Background should define a mobile crop or generated mobile derivatives before publication.", records: [record.id] });
    }
    if (!record.validation.parserCapabilities.layerGroups) {
      issues.push({ severity: "info", code: "star_system_background_layer_validation_unsupported", message: "PSD layer-group validation is pending parser support and is not marked as passed.", records: [record.id] });
    }
  }

  return issues;
}

export function derivativeTargetPath(record: StarSystemBackgroundRecord, targetId: string, extension: "avif" | "webp" | "png") {
  return `${publicDerivativeBase}/${record.slug}/${targetId}.${extension}`;
}
