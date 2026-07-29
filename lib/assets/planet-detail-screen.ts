import { createHash } from "node:crypto";
import derivativeData from "@/data/planet-detail-screen-derivatives.json";

export const PLANET_DETAIL_SCREEN_VERSION = "1.2.0";
export const PLANET_DETAIL_SCREEN_ID = "planet-detail" as const;

export type PlanetDetailScreenSlice = {
  id: string;
  displayName: string;
  semanticKey: string;
  sourceDocumentId: string | null;
  psdLayerGroup: string;
  exportFilename: string;
  runtimePath: string;
  spriteType: "simple" | "sliced";
  nineSlice: {
    enabled: boolean;
    border: [number, number, number, number];
  };
  pivot: [number, number];
  defaultScale: number;
};

export type PlanetDetailScreenRuntimeContract = {
  id: "planet-detail-screen";
  screen: "planet-detail";
  version: string;
  referenceResolution: [number, number];
  exportProfile: {
    id: "PlanetDetailScreenExportProfile";
    resolutions: Array<{ id: string; width: number; height: number }>;
    nineSliceSupport: true;
    spriteAtlas: {
      id: string;
      manifestPath: string;
      maxTextureSize: number;
      allowRotation: false;
      trimTransparent: true;
    };
    textureCompression: {
      desktop: "BC7";
      mobile: "ASTC_6x6";
      fallback: "RGBA32";
    };
    pixelsPerUnit: number;
    safeMargins: [number, number, number, number];
  };
  assetPack: {
    id: "PlanetDetailScreen";
    filename: "PlanetDetailScreen.artpack";
    manifestPath: string;
    packageRoot: "PlanetDetailScreen";
  };
  manifest: {
    screen: "planet-detail";
    version: string;
    referenceResolution: [number, number];
    assets: Record<string, string>;
    sourceArtwork: Record<string, string>;
  };
  sourceArtwork: Array<{
    id: string;
    displayName: string;
    status: "published";
    width: number;
    height: number;
    gamePngPath: string;
    previewPath: string;
    thumbnailPath: string;
    gamePngChecksum: string;
    alphaPolicy: "remove_edge_white_matte";
    transparentPixelCount: number;
  }>;
  slices: PlanetDetailScreenSlice[];
  theme: "noveris";
  hash: string;
  validationStatus: "Ready";
};

type SliceSeed = {
  id: string;
  key: string;
  source: string | null;
  sliced?: boolean;
  pivot?: [number, number];
};

const sliceSeeds: SliceSeed[] = [
  { id: "PlanetScreen_Background", key: "planetScreenBackground", source: null, sliced: true },
  { id: "LeftNavigation_Backplate", key: "leftNavigation", source: null, sliced: true },
  { id: "PlanetHero_Backplate", key: "planetHero", source: null, sliced: true },
  { id: "PlanetOverview_Backplate", key: "planetOverview", source: null, sliced: true },
  { id: "Resources_Backplate", key: "resources", source: "resources", sliced: true },
  { id: "Biome_Backplate", key: "biome", source: "biome-environment", sliced: true },
  { id: "Weather_Backplate", key: "weather", source: "weather-climate", sliced: true },
  { id: "Season_Backplate", key: "season", source: "weather-climate", sliced: true },
  { id: "Creatures_Backplate", key: "creatures", source: "creatures-life", sliced: true },
  { id: "Atmosphere_Backplate", key: "atmosphere", source: "biome-environment", sliced: true },
  { id: "Composition_Backplate", key: "composition", source: "resources", sliced: true },
  { id: "PlanetFeatures_Backplate", key: "planetFeatures", source: "biome-environment", sliced: true },
  { id: "AdditionalData_Backplate", key: "additionalData", source: null, sliced: true },
  { id: "Breadcrumb_Backplate", key: "breadcrumb", source: null, sliced: true },
  { id: "PreviousButton", key: "previousButton", source: null },
  { id: "NextButton", key: "nextButton", source: null },
  { id: "PlanetPlaceholder", key: "planetPlaceholder", source: null },
  { id: "BiomePlaceholder", key: "biomePlaceholder", source: "biome-environment" },
  { id: "CreaturePlaceholder01", key: "creaturePlaceholder01", source: "creatures-life" },
  { id: "CreaturePlaceholder02", key: "creaturePlaceholder02", source: "creatures-life" },
  { id: "CreaturePlaceholder03", key: "creaturePlaceholder03", source: "creatures-life" },
  { id: "WeatherIcon", key: "weatherIcon", source: "weather-climate" },
  { id: "SeasonOrbit", key: "seasonOrbit", source: "weather-climate", pivot: [0.5, 0.5] },
  { id: "AtmosphereChart", key: "atmosphereChart", source: "biome-environment" },
  { id: "CompositionChart", key: "compositionChart", source: "resources" }
];

function displayName(id: string) {
  return id.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2");
}

export const planetDetailScreenSlices: PlanetDetailScreenSlice[] = sliceSeeds.map((slice) => ({
  id: slice.id,
  displayName: displayName(slice.id),
  semanticKey: `planet_detail.${slice.key}`,
  sourceDocumentId: slice.source,
  psdLayerGroup: slice.id,
  exportFilename: `${slice.id}.png`,
  runtimePath: `sprites/${slice.id}.png`,
  spriteType: slice.sliced ? "sliced" : "simple",
  nineSlice: {
    enabled: Boolean(slice.sliced),
    border: slice.sliced ? [24, 24, 24, 24] : [0, 0, 0, 0]
  },
  pivot: slice.pivot ?? [0.5, 0.5],
  defaultScale: 1
}));

const manifestAssets = Object.fromEntries(
  sliceSeeds.map((slice) => [slice.key, `sprites/${slice.id}.png`])
);

const sourceArtwork = derivativeData.records.map((record) => {
  const gamePng = record.derivatives.find((item) => item.id === "game_png");
  const preview = record.derivatives.find((item) => item.id === "web_preview");
  const thumbnail = record.derivatives.find((item) => item.id === "library_thumbnail");
  if (!gamePng || !preview || !thumbnail) throw new Error(`Incomplete PSD derivative set: ${record.id}.`);
  return {
    id: record.id,
    displayName: record.displayName,
    status: "published" as const,
    width: record.source.width,
    height: record.source.height,
    gamePngPath: gamePng.path,
    previewPath: preview.path,
    thumbnailPath: thumbnail.path,
    gamePngChecksum: gamePng.checksum,
    alphaPolicy: record.source.alphaPolicy as "remove_edge_white_matte",
    transparentPixelCount: gamePng.alpha.transparentPixelCount
  };
});

const contractWithoutHash = {
  id: "planet-detail-screen" as const,
  screen: PLANET_DETAIL_SCREEN_ID as "planet-detail",
  version: PLANET_DETAIL_SCREEN_VERSION,
  referenceResolution: [1536, 1024] as [number, number],
  exportProfile: {
    id: "PlanetDetailScreenExportProfile" as const,
    resolutions: [
      { id: "reference", width: 1536, height: 1024 },
      { id: "desktop", width: 1920, height: 1080 },
      { id: "qhd", width: 2560, height: 1440 },
      { id: "4k", width: 3840, height: 2160 }
    ],
    nineSliceSupport: true as const,
    spriteAtlas: {
      id: "PlanetDetailScreenAtlas",
      manifestPath: "atlas/PlanetDetailScreen.spriteatlas.json",
      maxTextureSize: 4096,
      allowRotation: false as const,
      trimTransparent: true as const
    },
    textureCompression: {
      desktop: "BC7" as const,
      mobile: "ASTC_6x6" as const,
      fallback: "RGBA32" as const
    },
    pixelsPerUnit: 100,
    safeMargins: [48, 48, 48, 48] as [number, number, number, number]
  },
  assetPack: {
    id: "PlanetDetailScreen" as const,
    filename: "PlanetDetailScreen.artpack" as const,
    manifestPath: "PlanetDetailScreen/PlanetDetailScreen.manifest.json",
    packageRoot: "PlanetDetailScreen" as const
  },
  manifest: {
    screen: PLANET_DETAIL_SCREEN_ID as "planet-detail",
    version: PLANET_DETAIL_SCREEN_VERSION,
    referenceResolution: [1536, 1024] as [number, number],
    assets: manifestAssets,
    sourceArtwork: Object.fromEntries(sourceArtwork.map((asset) => [asset.id, asset.gamePngPath]))
  },
  sourceArtwork,
  slices: planetDetailScreenSlices,
  theme: "noveris" as const,
  validationStatus: "Ready" as const
};

const contractHash = createHash("sha256")
  .update(JSON.stringify(contractWithoutHash))
  .digest("hex");

export const planetDetailScreenRuntimeContract: PlanetDetailScreenRuntimeContract = {
  ...contractWithoutHash,
  hash: contractHash
};

export function validatePlanetDetailScreenContract(
  contract: PlanetDetailScreenRuntimeContract = planetDetailScreenRuntimeContract
) {
  const issues: string[] = [];
  const ids = new Set<string>();
  const keys = new Set<string>();

  if (contract.referenceResolution[0] !== 1536 || contract.referenceResolution[1] !== 1024) {
    issues.push("Reference resolution must be 1536 x 1024.");
  }
  if (contract.slices.length !== 25) {
    issues.push(`Expected 25 canonical slices, received ${contract.slices.length}.`);
  }
  if (contract.sourceArtwork.length !== 4) {
    issues.push(`Expected four published source artwork derivatives, received ${contract.sourceArtwork.length}.`);
  }
  for (const artwork of contract.sourceArtwork) {
    if (!artwork.gamePngPath.endsWith(".png")) issues.push(`Game derivative must be PNG: ${artwork.id}.`);
    if (!artwork.previewPath.endsWith(".webp") || !artwork.thumbnailPath.endsWith(".webp")) {
      issues.push(`Web derivatives must be WebP: ${artwork.id}.`);
    }
    if (!artwork.width || !artwork.height || !artwork.gamePngChecksum) {
      issues.push(`Published artwork metadata is incomplete: ${artwork.id}.`);
    }
    if (artwork.alphaPolicy !== "remove_edge_white_matte" || artwork.transparentPixelCount <= 0) {
      issues.push(`Published UI artwork must contain PSD-derived transparency: ${artwork.id}.`);
    }
  }
  for (const slice of contract.slices) {
    if (ids.has(slice.id)) issues.push(`Duplicate slice ID: ${slice.id}.`);
    if (keys.has(slice.semanticKey)) issues.push(`Duplicate semantic key: ${slice.semanticKey}.`);
    ids.add(slice.id);
    keys.add(slice.semanticKey);
    if (!slice.runtimePath.startsWith("sprites/") || !slice.runtimePath.endsWith(".png")) {
      issues.push(`Invalid package-relative runtime path for ${slice.id}.`);
    }
  }

  const serialized = JSON.stringify(contract);
  for (const forbidden of ["/Users/", "source-masters", ".psd", "studio-private://"]) {
    if (serialized.includes(forbidden)) issues.push(`Public contract leaks private source data: ${forbidden}.`);
  }

  const expectedHash = createHash("sha256")
    .update(JSON.stringify({ ...contract, hash: undefined }))
    .digest("hex");
  if (contract.hash !== expectedHash) issues.push("Contract hash does not match the sanitized payload.");

  return issues;
}

export function buildPlanetDetailArtpackDescriptor() {
  return {
    format: "noveris-artpack-v1",
    package: planetDetailScreenRuntimeContract.assetPack,
    metadata: {
      screen: PLANET_DETAIL_SCREEN_ID,
      version: PLANET_DETAIL_SCREEN_VERSION,
      theme: planetDetailScreenRuntimeContract.theme,
      hash: planetDetailScreenRuntimeContract.hash,
      generatedFrom: "canonical-screen-contract"
    },
    files: {
      "PlanetDetailScreen/PlanetDetailScreen.manifest.json": planetDetailScreenRuntimeContract.manifest,
      "PlanetDetailScreen/metadata.json": {
        referenceResolution: planetDetailScreenRuntimeContract.referenceResolution,
        exportProfile: planetDetailScreenRuntimeContract.exportProfile,
        validationStatus: planetDetailScreenRuntimeContract.validationStatus
      },
      "PlanetDetailScreen/source-artwork/index.json": planetDetailScreenRuntimeContract.sourceArtwork,
      "PlanetDetailScreen/atlas/PlanetDetailScreen.spriteatlas.json": {
        ...planetDetailScreenRuntimeContract.exportProfile.spriteAtlas,
        sprites: planetDetailScreenRuntimeContract.slices.map((slice) => slice.runtimePath)
      },
      "PlanetDetailScreen/sprites/index.json": planetDetailScreenRuntimeContract.slices.map((slice) => ({
        id: slice.id,
        semanticKey: slice.semanticKey,
        path: slice.runtimePath,
        spriteType: slice.spriteType,
        nineSlice: slice.nineSlice,
        pivot: slice.pivot,
        defaultScale: slice.defaultScale
      }))
    }
  };
}
