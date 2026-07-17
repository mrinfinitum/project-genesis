export type CanonicalRecordArtworkTone = "galaxy" | "sector" | "system" | "star" | "planet" | "discovery" | "civilization" | "building" | "research" | "neutral";

export type CanonicalRecordArtworkInput = {
  id: string;
  name: string;
  type: string;
  classification?: string;
  parent?: string;
  tone?: CanonicalRecordArtworkTone;
  thumbnailUrl?: string;
  thumbnailAvifUrl?: string;
  thumbnailWebpUrl?: string;
  thumbnailRetinaUrl?: string;
  thumbnailSrcSet?: string;
  mediumPreviewUrl?: string;
  previewUrl?: string;
  artworkUrl?: string;
  primaryArtworkAssetId?: string;
  thumbnailAssetId?: string;
  previewAssetId?: string;
  approvedArtworkVersionId?: string;
  focalPoint?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  altText?: string;
};

export type CanonicalArtworkFallbackReason =
  | "record_specific_approved_thumbnail_derivative"
  | "record_specific_current_thumbnail_derivative"
  | "record_specific_approved_preview_derivative"
  | "record_specific_current_preview_derivative"
  | "record_specific_approved_artwork_asset"
  | "record_specific_current_artwork_asset"
  | "semantic_library_thumbnail_derivative"
  | "approved_type_fallback_artwork"
  | "minimal_neutral_placeholder";

export type CanonicalArtworkState =
  | "record_thumbnail_ready"
  | "record_preview_ready"
  | "record_artwork_ready"
  | "semantic_thumbnail_ready"
  | "type_fallback_ready"
  | "neutral_placeholder";

export type CanonicalRecordArtworkResolution = {
  sourceAssetId: string;
  sourceAvailability: "record_specific" | "semantic_catalog" | "type_fallback" | "none";
  artworkState: CanonicalArtworkState;
  fallbackReason: CanonicalArtworkFallbackReason;
  thumbnail: {
    url?: string;
    retinaUrl?: string;
    avifUrl?: string;
    webpUrl?: string;
    srcSet?: string;
    width: number;
    height: number;
    aspectRatio: number;
  };
  previewUrl?: string;
  sourceUrl?: string;
  focalPoint: string;
  altText: string;
  status: "resolved" | "fallback" | "missing";
};

export type CanonicalArtworkCatalogEntry = {
  id: string;
  title: string;
  sourceUrl: string;
  thumbnailUrl: string;
  retinaThumbnailUrl: string;
  previewUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  focalPoint: string;
  tones: CanonicalRecordArtworkTone[];
  recordNames?: string[];
  recordTypes?: string[];
  classificationKeywords?: string[];
  generalKeywords?: string[];
  semanticStrength: "record" | "class" | "type";
};

const PUBLIC_IMAGE_DERIVATIVE_ROOT = "/assets/library-thumbnails";

function derivativeUrl(sourceUrl: string, size: 480 | 960) {
  const filename = sourceUrl.split("/").pop() ?? "artwork.png";
  const basename = filename.replace(/\.[^.]+$/, "");
  return `${PUBLIC_IMAGE_DERIVATIVE_ROOT}/${basename}-${size}.webp`;
}

function catalogEntry(input: Omit<CanonicalArtworkCatalogEntry, "thumbnailUrl" | "retinaThumbnailUrl" | "previewUrl" | "width" | "height" | "aspectRatio">): CanonicalArtworkCatalogEntry {
  return {
    ...input,
    thumbnailUrl: derivativeUrl(input.sourceUrl, 480),
    retinaThumbnailUrl: derivativeUrl(input.sourceUrl, 960),
    previewUrl: derivativeUrl(input.sourceUrl, 960),
    width: 480,
    height: 270,
    aspectRatio: 16 / 9
  };
}

export const CANONICAL_LIBRARY_ARTWORK_CATALOG: CanonicalArtworkCatalogEntry[] = [
  catalogEntry({ id: "library-artwork-milky-way", title: "Milky Way galaxy library art", sourceUrl: "/images/05-nebula-ark.png", focalPoint: "center", tones: ["galaxy"], recordNames: ["milky way"], recordTypes: ["galaxy"], generalKeywords: ["galaxy", "milky", "nebula"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-galaxy", title: "Galaxy library art", sourceUrl: "/images/20-civilization-horizon.png", focalPoint: "center", tones: ["galaxy"], recordTypes: ["galaxy"], generalKeywords: ["galaxy", "civilization horizon"], semanticStrength: "type" }),
  catalogEntry({ id: "library-artwork-sector", title: "Sector library art", sourceUrl: "/images/14-stellar-nursery.png", focalPoint: "center", tones: ["sector"], recordTypes: ["sector"], generalKeywords: ["sector", "stellar", "nursery"], semanticStrength: "type" }),
  catalogEntry({ id: "library-artwork-local-bubble", title: "Local Bubble sector art", sourceUrl: "/images/01-aurora-gate.png", focalPoint: "center", tones: ["sector"], recordNames: ["local bubble"], recordTypes: ["sector"], generalKeywords: ["aurora", "sector"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-sol-system", title: "Sol system art", sourceUrl: "/images/08-solar-forge.png", focalPoint: "center", tones: ["system", "star"], recordNames: ["sol"], recordTypes: ["star system", "yellow main sequence"], generalKeywords: ["solar", "forge", "sol"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-black-hole-system", title: "Black hole system art", sourceUrl: "/images/10-black-hole-route.png", focalPoint: "center", tones: ["system", "star"], recordTypes: ["black hole"], classificationKeywords: ["black hole"], semanticStrength: "class" }),
  catalogEntry({ id: "library-artwork-system", title: "Star system library art", sourceUrl: "/images/10-wormhole-survey.png", focalPoint: "center", tones: ["system"], recordTypes: ["star system"], generalKeywords: ["system", "wormhole", "route"], semanticStrength: "type" }),
  catalogEntry({ id: "library-artwork-star", title: "Star library art", sourceUrl: "/images/14-stellar-nursery.png", focalPoint: "center", tones: ["star"], recordTypes: ["star", "yellow main sequence", "red dwarf", "blue giant", "binary pair"], generalKeywords: ["star", "stellar"], semanticStrength: "type" }),
  catalogEntry({ id: "library-artwork-earth", title: "Earth and cradle world art", sourceUrl: "/images/09-cradle-world.png", focalPoint: "center", tones: ["planet"], recordNames: ["earth"], classificationKeywords: ["earthlike", "terrestrial", "forest"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-garden-world", title: "Garden world art", sourceUrl: "/images/09-lost-garden-orbit.png", focalPoint: "center", tones: ["planet"], classificationKeywords: ["earthlike", "forest", "garden", "living"], semanticStrength: "class" }),
  catalogEntry({ id: "library-artwork-moon", title: "Moon art", sourceUrl: "/images/03-archive-moon.png", focalPoint: "center", tones: ["planet"], recordNames: ["moon"], recordTypes: ["moon"], classificationKeywords: ["moon", "dead", "airless", "cratered"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-ancient-machine-moon", title: "Ancient machine moon art", sourceUrl: "/images/04-ancient-machine-moon.png", focalPoint: "center", tones: ["planet"], recordTypes: ["moon"], classificationKeywords: ["ancient", "machine", "artificial", "captured asteroid", "dead"], semanticStrength: "class" }),
  catalogEntry({ id: "library-artwork-mercury-barren", title: "Barren rocky planet art", sourceUrl: "/images/02-rogue-planet-camps.png", focalPoint: "center", tones: ["planet"], recordNames: ["mercury"], classificationKeywords: ["barren", "dead", "rocky"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-venus-toxic", title: "Toxic storm world art", sourceUrl: "/images/06-crystal-storm-world.png", focalPoint: "center", tones: ["planet"], recordNames: ["venus"], classificationKeywords: ["toxic", "green atmosphere", "chemical", "storm"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-mars-desert", title: "Desert planet art", sourceUrl: "/images/16-desert-skyport.png", focalPoint: "center", tones: ["planet"], recordNames: ["mars"], classificationKeywords: ["desert", "rock desert", "dunes", "mesa"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-asteroid-belt", title: "Asteroid Belt art", sourceUrl: "/images/08-asteroid-city.png", focalPoint: "center", tones: ["planet"], recordNames: ["asteroid belt"], recordTypes: ["asteroid belt"], classificationKeywords: ["asteroid", "belt"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-asteroid-moon", title: "Captured asteroid moon art", sourceUrl: "/images/03-ring-miner-convoy.png", focalPoint: "center", tones: ["planet"], recordNames: ["phobos", "deimos"], recordTypes: ["moon"], classificationKeywords: ["captured asteroid", "asteroid"], semanticStrength: "record" }),
  catalogEntry({ id: "library-artwork-gas-giant", title: "Gas giant and orbital harvest art", sourceUrl: "/images/07-gravity-harvesters.png", focalPoint: "center", tones: ["planet"], classificationKeywords: ["gas giant", "ice giant", "storm giant", "banded"], semanticStrength: "class" }),
  catalogEntry({ id: "library-artwork-ocean-world", title: "Ocean world art", sourceUrl: "/images/07-ocean-leviathan-scan.png", focalPoint: "center", tones: ["planet", "discovery"], classificationKeywords: ["ocean", "frozen ocean", "subglacial", "water"], semanticStrength: "class" }),
  catalogEntry({ id: "library-artwork-colony", title: "Colony library art", sourceUrl: "/images/06-dawn-colony-ridge.png", focalPoint: "center", tones: ["civilization"], recordTypes: ["human colony", "independent settlement"], generalKeywords: ["colony", "settlement"], semanticStrength: "type" }),
  catalogEntry({ id: "library-artwork-civilization", title: "Civilization library art", sourceUrl: "/images/18-migrating-arks.png", focalPoint: "center", tones: ["civilization"], recordTypes: ["alien civilization", "trade coalition", "scientific order"], generalKeywords: ["civilization", "faction"], semanticStrength: "type" }),
  catalogEntry({ id: "library-artwork-discovery", title: "Discovery library art", sourceUrl: "/images/17-quantum-obelisk.png", focalPoint: "center", tones: ["discovery"], recordTypes: ["anomaly", "artifact", "discovery"], generalKeywords: ["discovery", "artifact", "anomaly"], semanticStrength: "type" }),
  catalogEntry({ id: "library-artwork-building", title: "Building library art", sourceUrl: "/images/01-orbital-elevator.png", focalPoint: "center", tones: ["building"], recordTypes: ["building"], generalKeywords: ["building", "infrastructure"], semanticStrength: "type" }),
  catalogEntry({ id: "library-artwork-research", title: "Research library art", sourceUrl: "/images/19-atlas-beacon-field.png", focalPoint: "center", tones: ["research"], recordTypes: ["research"], generalKeywords: ["research", "beacon", "science"], semanticStrength: "type" })
];

const TYPE_FALLBACKS: Partial<Record<CanonicalRecordArtworkTone, CanonicalArtworkCatalogEntry>> = {
  galaxy: CANONICAL_LIBRARY_ARTWORK_CATALOG.find((entry) => entry.id === "library-artwork-galaxy"),
  sector: CANONICAL_LIBRARY_ARTWORK_CATALOG.find((entry) => entry.id === "library-artwork-sector"),
  system: CANONICAL_LIBRARY_ARTWORK_CATALOG.find((entry) => entry.id === "library-artwork-system"),
  star: CANONICAL_LIBRARY_ARTWORK_CATALOG.find((entry) => entry.id === "library-artwork-star"),
  planet: CANONICAL_LIBRARY_ARTWORK_CATALOG.find((entry) => entry.id === "library-artwork-mercury-barren"),
  discovery: CANONICAL_LIBRARY_ARTWORK_CATALOG.find((entry) => entry.id === "library-artwork-discovery"),
  civilization: CANONICAL_LIBRARY_ARTWORK_CATALOG.find((entry) => entry.id === "library-artwork-civilization"),
  building: CANONICAL_LIBRARY_ARTWORK_CATALOG.find((entry) => entry.id === "library-artwork-building"),
  research: CANONICAL_LIBRARY_ARTWORK_CATALOG.find((entry) => entry.id === "library-artwork-research")
};

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function textFor(record: CanonicalRecordArtworkInput) {
  return [record.id, record.name, record.type, record.classification, record.parent, record.tone].map(normalize).join(" ");
}

function isSafePublicUrl(value: string | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.includes("..") || value.includes("/Users/") || value.includes("studio-private://")) return false;
  if (/^\/?images\//.test(value.replace(/^\//, ""))) return false;
  if (/\.(psd|psb|ai|tiff?)($|\?)/i.test(value)) return false;
  return true;
}

function resolutionFromUrl(record: CanonicalRecordArtworkInput, url: string, fallbackReason: CanonicalArtworkFallbackReason, state: CanonicalArtworkState, sourceAvailability: CanonicalRecordArtworkResolution["sourceAvailability"]): CanonicalRecordArtworkResolution {
  const width = record.width && record.width <= 960 ? record.width : 480;
  const height = record.height && record.height <= 540 ? record.height : 270;
  const aspectRatio = record.aspectRatio ?? width / height;
  return {
    sourceAssetId: record.thumbnailAssetId ?? record.previewAssetId ?? record.primaryArtworkAssetId ?? record.approvedArtworkVersionId ?? record.id,
    sourceAvailability,
    artworkState: state,
    fallbackReason,
    thumbnail: {
      url,
      retinaUrl: record.thumbnailRetinaUrl,
      avifUrl: record.thumbnailAvifUrl,
      webpUrl: record.thumbnailWebpUrl,
      srcSet: record.thumbnailSrcSet,
      width,
      height,
      aspectRatio
    },
    previewUrl: record.previewUrl ?? record.mediumPreviewUrl ?? url,
    sourceUrl: record.artworkUrl,
    focalPoint: record.focalPoint ?? "center",
    altText: record.altText ?? `${record.name} ${record.type} artwork`,
    status: state === "neutral_placeholder" ? "missing" : state.includes("fallback") ? "fallback" : "resolved"
  };
}

function resolutionFromCatalog(record: CanonicalRecordArtworkInput, entry: CanonicalArtworkCatalogEntry, fallbackReason: CanonicalArtworkFallbackReason, state: CanonicalArtworkState): CanonicalRecordArtworkResolution {
  return {
    sourceAssetId: entry.id,
    sourceAvailability: fallbackReason === "approved_type_fallback_artwork" ? "type_fallback" : "semantic_catalog",
    artworkState: state,
    fallbackReason,
    thumbnail: {
      url: entry.thumbnailUrl,
      retinaUrl: entry.retinaThumbnailUrl,
      webpUrl: entry.thumbnailUrl,
      srcSet: `${entry.thumbnailUrl} 480w, ${entry.retinaThumbnailUrl} 960w`,
      width: entry.width,
      height: entry.height,
      aspectRatio: entry.aspectRatio
    },
    previewUrl: entry.previewUrl,
    sourceUrl: entry.sourceUrl,
    focalPoint: record.focalPoint ?? entry.focalPoint,
    altText: record.altText ?? `${record.name} ${record.type} artwork`,
    status: fallbackReason === "approved_type_fallback_artwork" ? "fallback" : "resolved"
  };
}

function scoreCatalogEntry(record: CanonicalRecordArtworkInput, entry: CanonicalArtworkCatalogEntry) {
  const normalizedName = normalize(record.name);
  const normalizedType = normalize(record.type);
  const text = textFor(record);
  let score = 0;

  if (entry.recordNames?.some((name) => normalize(name) === normalizedName)) score += 120;
  if (entry.recordTypes?.some((type) => normalize(type) === normalizedType || text.includes(normalize(type)))) score += 32;
  if (entry.tones.includes(record.tone ?? "neutral")) score += 18;
  for (const keyword of entry.classificationKeywords ?? []) {
    if (text.includes(normalize(keyword))) score += 18;
  }
  for (const keyword of entry.generalKeywords ?? []) {
    if (text.includes(normalize(keyword))) score += 8;
  }

  if (entry.semanticStrength === "record" && score >= 100) score += 20;
  return score;
}

function semanticCatalogMatch(record: CanonicalRecordArtworkInput) {
  const scored = CANONICAL_LIBRARY_ARTWORK_CATALOG
    .map((entry) => ({ entry, score: scoreCatalogEntry(record, entry) }))
    .filter((row) => row.score >= 36)
    .sort((left, right) => right.score - left.score || left.entry.id.localeCompare(right.entry.id));
  return scored[0]?.entry;
}

export function resolveCanonicalRecordArtwork(record: CanonicalRecordArtworkInput): CanonicalRecordArtworkResolution {
  if (isSafePublicUrl(record.thumbnailUrl)) {
    return resolutionFromUrl(record, record.thumbnailUrl, "record_specific_approved_thumbnail_derivative", "record_thumbnail_ready", "record_specific");
  }
  const currentThumbnailUrl = record.thumbnailWebpUrl ?? record.thumbnailAvifUrl ?? record.thumbnailSrcSet?.split(" ")[0];
  if (isSafePublicUrl(currentThumbnailUrl)) {
    return resolutionFromUrl(record, currentThumbnailUrl, "record_specific_current_thumbnail_derivative", "record_thumbnail_ready", "record_specific");
  }
  if (isSafePublicUrl(record.previewUrl)) {
    return resolutionFromUrl(record, record.previewUrl, "record_specific_approved_preview_derivative", "record_preview_ready", "record_specific");
  }
  if (isSafePublicUrl(record.mediumPreviewUrl)) {
    return resolutionFromUrl(record, record.mediumPreviewUrl, "record_specific_current_preview_derivative", "record_preview_ready", "record_specific");
  }
  if (isSafePublicUrl(record.artworkUrl)) {
    return resolutionFromUrl(record, record.artworkUrl, record.approvedArtworkVersionId ? "record_specific_approved_artwork_asset" : "record_specific_current_artwork_asset", "record_artwork_ready", "record_specific");
  }

  const semantic = semanticCatalogMatch(record);
  if (semantic) {
    return resolutionFromCatalog(record, semantic, "semantic_library_thumbnail_derivative", "semantic_thumbnail_ready");
  }

  const fallback = TYPE_FALLBACKS[record.tone ?? "neutral"];
  if (fallback) {
    return resolutionFromCatalog(record, fallback, "approved_type_fallback_artwork", "type_fallback_ready");
  }

  return {
    sourceAssetId: record.id,
    sourceAvailability: "none",
    artworkState: "neutral_placeholder",
    fallbackReason: "minimal_neutral_placeholder",
    thumbnail: {
      width: 480,
      height: 270,
      aspectRatio: 16 / 9
    },
    focalPoint: "center",
    altText: record.altText ?? `${record.name} ${record.type} artwork unavailable`,
    status: "missing"
  };
}

export function buildCanonicalLibraryArtworkReport(records: CanonicalRecordArtworkInput[]) {
  const resolutions = records.map((record) => ({ record, artwork: resolveCanonicalRecordArtwork(record) }));
  return {
    totalVisualRecords: resolutions.length,
    recordSpecificArtworkReady: resolutions.filter((row) => row.artwork.sourceAvailability === "record_specific").length,
    semanticArtworkReady: resolutions.filter((row) => row.artwork.sourceAvailability === "semantic_catalog").length,
    typeFallbackInUse: resolutions.filter((row) => row.artwork.sourceAvailability === "type_fallback").length,
    genericFallbackInUse: resolutions.filter((row) => row.artwork.fallbackReason === "minimal_neutral_placeholder").length,
    thumbnailReady: resolutions.filter((row) => Boolean(row.artwork.thumbnail.url)).length,
    thumbnailMissing: resolutions.filter((row) => !row.artwork.thumbnail.url).length,
    previewFallbackInUse: resolutions.filter((row) => row.artwork.artworkState === "record_preview_ready").length,
    noArtworkRelationship: resolutions.filter((row) => row.artwork.sourceAvailability !== "record_specific").length,
    brokenArtworkRelationship: 0,
    privatePathViolations: resolutions.filter((row) => JSON.stringify(row).includes("/Users/") || JSON.stringify(row).includes("studio-private://")).length,
    duplicateArtworkAssignments: resolutions.length - new Set(resolutions.map((row) => `${row.record.id}:${row.artwork.sourceAssetId}`)).size,
    byFallbackReason: resolutions.reduce<Record<string, number>>((counts, row) => {
      counts[row.artwork.fallbackReason] = (counts[row.artwork.fallbackReason] ?? 0) + 1;
      return counts;
    }, {}),
    unresolvedRecords: resolutions
      .filter((row) => row.artwork.status === "missing")
      .map((row) => ({ id: row.record.id, name: row.record.name, type: row.record.type, reason: row.artwork.fallbackReason }))
  };
}
