export const environmentComposerContractVersion = "environment-composer-v1";

export type EnvironmentTypeId =
  | "universe"
  | "galaxy"
  | "sector"
  | "star_system"
  | "planet_surface"
  | "settlement"
  | "space_station"
  | "mission_location";

export type EnvironmentLayerBlendMode = "normal" | "screen" | "add" | "multiply" | "soft_light";
export type EnvironmentLayerStatus = "draft" | "review" | "approved" | "published";
export type EnvironmentAssetVisualFamily = "stars" | "nebula" | "dust" | "haze" | "light" | "planet" | "orbit" | "fog" | "terrain" | "ui";

export type EnvironmentLayerAsset = {
  id: string;
  semanticKey: string;
  displayName: string;
  environmentTypeIds: EnvironmentTypeId[];
  folderId: string;
  layerRoleId: string;
  themeIds: string[];
  tags: string[];
  resolution: { width: number; height: number };
  publicPath: string | null;
  sourceMaster: "psd" | "psb" | "tiff" | "png";
  exportedFormat: "png" | "webp";
  hasTransparency: boolean;
  status: EnvironmentLayerStatus;
  usageCount: number;
  visualFamily: EnvironmentAssetVisualFamily;
};

export type EnvironmentTreeNode = {
  id: string;
  label: string;
  order: number;
  children: EnvironmentTreeNode[];
};

export type EnvironmentLayerTemplate = {
  id: string;
  name: string;
  order: number;
  folderId: string;
  assetId: string | null;
  visible: boolean;
  locked: boolean;
  opacity: number;
  depth: number;
  blendMode: EnvironmentLayerBlendMode;
  rotation: number;
  scale: number;
  offset: { x: number; y: number };
  tint: string;
  parallax: number;
  visibilityRules: string[];
  seedVariationRules: { enabled: boolean; assetPoolIds: string[]; opacityVariance: number; rotationVariance: number };
  animation: { enabled: boolean; type: "none" | "drift" | "pulse" | "rotate"; speed: number; reducedMotionFallback: "static" };
};

export type EnvironmentArtisticConstraints = {
  centerSafeZone: { width: number; height: number };
  maximumBrightness: number;
  maximumNebulas: number;
  darkCorners: boolean;
  primaryPalette: string[];
  secondaryPalette: string[];
  maximumParticleDensity: number;
  noUiObstruction: boolean;
  singleFocalPoint: boolean;
};

export type EnvironmentProfile = {
  id: string;
  environmentTypeId: EnvironmentTypeId;
  displayName: string;
  description: string;
  defaultThemeId: string;
  seed: string;
  layers: EnvironmentLayerTemplate[];
  constraints: EnvironmentArtisticConstraints;
  status: EnvironmentLayerStatus;
};

export type EnvironmentTheme = {
  id: string;
  displayName: string;
  description: string;
  allowedAssetIds: string[];
  colorPalette: string[];
  lighting: { exposure: number; contrast: number; temperature: number };
  fog: { density: number; color: string };
  particleDensity: number;
  depthOfField: number;
  bloom: number;
};

export type EnvironmentComposerContract = {
  id: "environment-composer";
  version: typeof environmentComposerContractVersion;
  ownership: {
    studioOwns: string[];
    clientOwns: string[];
    sourceMasterPolicy: string;
    runtimeTexturePolicy: string;
  };
  environmentTypes: Array<{ id: EnvironmentTypeId; displayName: string; description: string }>;
  layerTrees: Record<EnvironmentTypeId, EnvironmentTreeNode[]>;
  layerAssets: EnvironmentLayerAsset[];
  themes: EnvironmentTheme[];
  profiles: EnvironmentProfile[];
  runtimeRules: {
    embedsTextures: false;
    publishesReferencesOnly: true;
    deterministicOrdering: true;
    clientsOwnRendering: true;
  };
};

const environmentTypes: EnvironmentComposerContract["environmentTypes"] = [
  ["universe", "Universe", "Deep cosmic compositions viewed above the galaxy scale."],
  ["galaxy", "Galaxy", "Galaxy-scale artwork, exploration overlays, and depth layers."],
  ["sector", "Sector", "Regional stellar fields, navigation overlays, and discovery fog."],
  ["star_system", "Star System", "Layered system scenes containing stellar, orbital, celestial, and interaction art."],
  ["planet_surface", "Planet Surface", "Surface compositions made from sky, terrain, atmosphere, weather, and lighting."],
  ["settlement", "Settlement", "Civilization environments composed from skyline, structures, atmosphere, and activity layers."],
  ["space_station", "Space Station", "Interior or exterior station compositions with structure, traffic, lighting, and effects."],
  ["mission_location", "Mission Location", "Reusable authored locations for mission presentation."]
].map(([id, displayName, description]) => ({ id: id as EnvironmentTypeId, displayName, description }));

function leaf(id: string, label: string, order: number): EnvironmentTreeNode {
  return { id, label, order, children: [] };
}

function branch(id: string, label: string, order: number, children: string[]): EnvironmentTreeNode {
  return { id, label, order, children: children.map((label, index) => leaf(`${id}-${slug(label)}`, label, index + 1)) };
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const layerTrees: EnvironmentComposerContract["layerTrees"] = {
  universe: [
    branch("universe-background", "01 Background", 1, ["Far Cosmic Background", "Distant Galaxies", "Cosmic Web"]),
    branch("universe-atmosphere", "02 Atmosphere", 2, ["Cosmic Dust", "Deep Haze", "Foreground Dust"]),
    branch("universe-lighting", "03 Lighting", 3, ["Light Rays", "Vignette"])
  ],
  galaxy: [
    leaf("galaxy-background", "Background", 1),
    leaf("galaxy-spiral-arms", "Spiral Arms", 2),
    leaf("galaxy-core-glow", "Core Glow", 3),
    leaf("galaxy-dust-lanes", "Dust Lanes", 4),
    leaf("galaxy-nebulas", "Nebulas", 5),
    leaf("galaxy-star-clouds", "Star Clouds", 6),
    leaf("galaxy-sector-overlay", "Sector Overlay", 7),
    leaf("galaxy-exploration-fog", "Exploration Fog", 8),
    leaf("galaxy-particles", "Particles", 9)
  ],
  sector: [
    leaf("sector-deep-stars", "Deep Stars", 1),
    leaf("sector-star-clusters", "Star Clusters", 2),
    leaf("sector-nebulas", "Nebulas", 3),
    leaf("sector-dust", "Dust", 4),
    leaf("sector-navigation-grid", "Navigation Grid", 5),
    leaf("sector-probe-routes", "Probe Routes", 6),
    leaf("sector-fog", "Fog", 7),
    leaf("sector-labels", "Labels", 8)
  ],
  star_system: [
    branch("system-background", "01 Background", 1, ["Far Stars", "Mid Stars", "Deep Space"]),
    branch("system-nebulas", "02 Nebulas", 2, ["Rear Nebulas", "Front Nebulas"]),
    branch("system-atmosphere", "03 Atmosphere", 3, ["Haze", "Dust", "Volumetric Clouds"]),
    branch("system-lighting", "04 Lighting", 4, ["Light Rays", "Star Glow", "Lens Glow"]),
    branch("system-stellar", "05 Stellar Objects", 5, ["Stars", "Binary Stars"]),
    branch("system-orbital", "06 Orbital", 6, ["Orbit Styles", "Asteroid Belts"]),
    branch("system-planets", "07 Planets", 7, ["Terrestrial", "Gas Giants", "Ice", "Lava", "Ocean", "Desert"]),
    leaf("system-moons", "08 Moons", 8),
    branch("system-effects", "09 Effects", 9, ["Selection", "Discovery", "Ping", "Highlight"]),
    leaf("system-fog", "10 Fog", 10),
    branch("system-ui", "11 UI", 11, ["Labels", "Icons", "Routes"])
  ],
  planet_surface: [
    leaf("surface-sky", "Sky", 1),
    leaf("surface-clouds", "Clouds", 2),
    leaf("surface-atmosphere", "Atmosphere", 3),
    leaf("surface-mountains", "Mountains", 4),
    leaf("surface-terrain", "Terrain", 5),
    leaf("surface-water", "Water", 6),
    leaf("surface-vegetation", "Vegetation", 7),
    leaf("surface-weather", "Weather", 8),
    leaf("surface-fog", "Fog", 9),
    leaf("surface-lighting", "Lighting", 10),
    leaf("surface-particles", "Particles", 11)
  ],
  settlement: [
    leaf("settlement-sky", "Sky", 1),
    leaf("settlement-horizon", "Horizon", 2),
    leaf("settlement-structures", "Structures", 3),
    leaf("settlement-infrastructure", "Infrastructure", 4),
    leaf("settlement-activity", "Activity", 5),
    leaf("settlement-atmosphere", "Atmosphere", 6),
    leaf("settlement-lighting", "Lighting", 7),
    leaf("settlement-effects", "Effects", 8)
  ],
  space_station: [
    leaf("station-background", "Background", 1),
    leaf("station-structure", "Station Structure", 2),
    leaf("station-docks", "Docks", 3),
    leaf("station-traffic", "Traffic", 4),
    leaf("station-lighting", "Lighting", 5),
    leaf("station-particles", "Particles", 6),
    leaf("station-fog", "Fog", 7),
    leaf("station-ui", "UI", 8)
  ],
  mission_location: [
    leaf("mission-background", "Background", 1),
    leaf("mission-environment", "Environment", 2),
    leaf("mission-subject", "Primary Subject", 3),
    leaf("mission-foreground", "Foreground", 4),
    leaf("mission-atmosphere", "Atmosphere", 5),
    leaf("mission-lighting", "Lighting", 6),
    leaf("mission-effects", "Effects", 7)
  ]
};

const themeDefinitions: Array<Omit<EnvironmentTheme, "allowedAssetIds">> = [
  { id: "midnight-sapphire", displayName: "Midnight Sapphire", description: "Deep blue-black space with restrained cyan energy.", colorPalette: ["#020617", "#082f49", "#22d3ee", "#a5f3fc"], lighting: { exposure: 0.82, contrast: 1.12, temperature: -12 }, fog: { density: 0.18, color: "#082f49" }, particleDensity: 0.42, depthOfField: 0.24, bloom: 0.34 },
  { id: "emerald-frontier", displayName: "Emerald Frontier", description: "Verdant teal atmosphere with exploratory clarity.", colorPalette: ["#031712", "#064e3b", "#34d399", "#d1fae5"], lighting: { exposure: 0.9, contrast: 1.05, temperature: -4 }, fog: { density: 0.22, color: "#064e3b" }, particleDensity: 0.38, depthOfField: 0.2, bloom: 0.26 },
  { id: "golden-expanse", displayName: "Golden Expanse", description: "Warm stellar light against dark graphite fields.", colorPalette: ["#0c0a09", "#78350f", "#f59e0b", "#fef3c7"], lighting: { exposure: 0.94, contrast: 1.14, temperature: 18 }, fog: { density: 0.14, color: "#451a03" }, particleDensity: 0.3, depthOfField: 0.18, bloom: 0.4 },
  { id: "frozen-silence", displayName: "Frozen Silence", description: "Cold, sparse compositions with pale ice light.", colorPalette: ["#020617", "#164e63", "#bae6fd", "#f8fafc"], lighting: { exposure: 0.86, contrast: 1.08, temperature: -28 }, fog: { density: 0.3, color: "#164e63" }, particleDensity: 0.18, depthOfField: 0.3, bloom: 0.18 },
  { id: "crimson-rift", displayName: "Crimson Rift", description: "Volatile red energy and high-contrast silhouettes.", colorPalette: ["#090404", "#7f1d1d", "#fb7185", "#ffe4e6"], lighting: { exposure: 0.88, contrast: 1.22, temperature: 24 }, fog: { density: 0.2, color: "#450a0a" }, particleDensity: 0.5, depthOfField: 0.28, bloom: 0.46 },
  { id: "ancient-violet", displayName: "Ancient Violet", description: "Mysterious violet structures and archival light.", colorPalette: ["#080312", "#4c1d95", "#a78bfa", "#ede9fe"], lighting: { exposure: 0.84, contrast: 1.16, temperature: 2 }, fog: { density: 0.24, color: "#2e1065" }, particleDensity: 0.34, depthOfField: 0.32, bloom: 0.38 },
  { id: "deep-void", displayName: "Deep Void", description: "Near-black negative space with very limited illumination.", colorPalette: ["#000000", "#020617", "#1e293b", "#64748b"], lighting: { exposure: 0.68, contrast: 1.28, temperature: -8 }, fog: { density: 0.08, color: "#020617" }, particleDensity: 0.12, depthOfField: 0.12, bloom: 0.08 }
];

const assetSeeds: Array<[string, string, string, EnvironmentAssetVisualFamily, EnvironmentTypeId[], string[], string[]]> = [
  ["far-stars-001", "Far Stars 001", "system-background-far-stars", "stars", ["universe", "galaxy", "sector", "star_system"], ["midnight-sapphire", "frozen-silence", "deep-void"], ["stars", "distant", "blue", "background"]],
  ["far-stars-002", "Far Stars 002", "system-background-far-stars", "stars", ["universe", "galaxy", "sector", "star_system"], ["golden-expanse", "crimson-rift"], ["stars", "distant", "warm", "background"]],
  ["mid-stars-001", "Mid Stars 001", "system-background-mid-stars", "stars", ["sector", "star_system"], ["midnight-sapphire", "emerald-frontier"], ["stars", "mid", "cyan"]],
  ["deep-space-001", "Deep Space 001", "system-background-deep-space", "stars", ["universe", "galaxy", "sector", "star_system"], ["deep-void", "midnight-sapphire"], ["deep", "space", "black"]],
  ["nebula-blue-004", "Nebula Blue 004", "system-nebulas-rear-nebulas", "nebula", ["galaxy", "sector", "star_system"], ["midnight-sapphire", "frozen-silence"], ["blue", "nebula", "rear"]],
  ["nebula-violet-002", "Nebula Violet 002", "system-nebulas-front-nebulas", "nebula", ["galaxy", "sector", "star_system"], ["ancient-violet"], ["violet", "nebula", "front"]],
  ["dust-008", "Dust 008", "system-atmosphere-dust", "dust", ["universe", "galaxy", "sector", "star_system"], ["midnight-sapphire", "golden-expanse", "deep-void"], ["dust", "transparent", "foreground"]],
  ["haze-003", "Haze 003", "system-atmosphere-haze", "haze", ["galaxy", "sector", "star_system", "planet_surface"], ["midnight-sapphire", "emerald-frontier", "frozen-silence"], ["haze", "soft", "atmosphere"]],
  ["light-ray-002", "Light Ray 002", "system-lighting-light-rays", "light", ["universe", "star_system", "planet_surface", "settlement"], ["golden-expanse", "frozen-silence"], ["light", "ray", "directional"]],
  ["star-glow-001", "Star Glow 001", "system-lighting-star-glow", "light", ["galaxy", "star_system"], ["golden-expanse", "crimson-rift"], ["star", "glow", "bloom"]],
  ["terrestrial-001", "Terrestrial 001", "system-planets-terrestrial", "planet", ["star_system"], ["midnight-sapphire", "emerald-frontier"], ["planet", "terrestrial", "blue"]],
  ["gas-giant-001", "Gas Giant 001", "system-planets-gas-giants", "planet", ["star_system"], ["golden-expanse", "ancient-violet"], ["planet", "gas", "giant"]],
  ["orbit-style-001", "Orbit Style 001", "system-orbital-orbit-styles", "orbit", ["star_system"], ["midnight-sapphire", "deep-void"], ["orbit", "line", "navigation"]],
  ["selection-ring-001", "Selection Ring 001", "system-effects-selection", "ui", ["star_system"], ["midnight-sapphire", "emerald-frontier"], ["selection", "ring", "ui"]],
  ["fog-002", "Exploration Fog 002", "system-fog", "fog", ["galaxy", "sector", "star_system"], ["deep-void", "midnight-sapphire"], ["fog", "exploration", "dark"]],
  ["mountains-001", "Mountains 001", "surface-mountains", "terrain", ["planet_surface"], ["frozen-silence", "golden-expanse"], ["mountains", "terrain", "horizon"]],
  ["atmosphere-emerald-001", "Emerald Atmosphere 001", "surface-atmosphere", "haze", ["planet_surface", "settlement"], ["emerald-frontier"], ["green", "atmosphere", "planet"]],
  ["foreground-dust-011", "Foreground Dust 011", "mission-foreground", "dust", ["universe", "galaxy", "sector", "star_system", "planet_surface", "mission_location"], ["golden-expanse", "deep-void"], ["foreground", "dust", "particles"]]
];

export const environmentLayerAssets: EnvironmentLayerAsset[] = assetSeeds.map(([id, displayName, folderId, visualFamily, environmentTypeIds, themeIds, tags], index) => ({
  id: `env-asset-${id}`,
  semanticKey: id,
  displayName,
  environmentTypeIds,
  folderId,
  layerRoleId: folderId.split("-").slice(-2).join("-"),
  themeIds,
  tags,
  resolution: index % 4 === 0 ? { width: 4096, height: 2160 } : { width: 3244, height: 1804 },
  publicPath: null,
  sourceMaster: "psd",
  exportedFormat: "png",
  hasTransparency: !["stars", "terrain"].includes(visualFamily),
  status: "draft",
  usageCount: index % 5,
  visualFamily
}));

export const environmentThemes: EnvironmentTheme[] = themeDefinitions.map((theme) => ({
  ...theme,
  allowedAssetIds: environmentLayerAssets.filter((asset) => asset.themeIds.includes(theme.id)).map((asset) => asset.id)
}));

const profileLayerNames: Record<EnvironmentTypeId, string[]> = {
  universe: ["Far Cosmic Background", "Distant Galaxies", "Cosmic Dust", "Cosmic Web", "Deep Haze", "Foreground Dust", "Light Rays", "Vignette"],
  galaxy: ["Far Stars", "Spiral Galaxy", "Core Glow", "Dust Lanes", "Nebula Back", "Nebula Front", "Sector Overlay", "Exploration Fog", "Particles", "Foreground Dust"],
  sector: ["Deep Stars", "Star Clusters", "Background Nebula", "Dust", "Haze", "Navigation Grid", "Probe Routes", "Fog Of War", "Foreground Dust"],
  star_system: ["Far Stars", "Mid Stars", "Rear Nebula", "Front Nebula", "Haze", "Dust", "Central Star", "Orbit Lines", "Planets", "Moons", "Asteroid Belts", "Particles", "Foreground Dust", "Fog Of War", "Labels", "Selection Effects"],
  planet_surface: ["Sky", "Clouds", "Atmosphere", "Mountains", "Foreground Terrain", "Particles", "Fog", "Lighting"],
  settlement: ["Sky", "Horizon", "Structures", "Infrastructure", "Activity", "Atmosphere", "Lighting", "Effects"],
  space_station: ["Background", "Station Structure", "Docks", "Traffic", "Lighting", "Particles", "Fog", "UI"],
  mission_location: ["Background", "Environment", "Primary Subject", "Foreground", "Atmosphere", "Lighting", "Effects"]
};

function defaultLayer(environmentTypeId: EnvironmentTypeId, name: string, index: number): EnvironmentLayerTemplate {
  const normalized = slug(name);
  const asset = environmentLayerAssets.find((candidate) => candidate.environmentTypeIds.includes(environmentTypeId) && (candidate.tags.some((tag) => normalized.includes(tag)) || normalized.includes(candidate.visualFamily)));
  return {
    id: `${environmentTypeId}-layer-${String(index + 1).padStart(2, "0")}-${normalized}`,
    name,
    order: index + 1,
    folderId: asset?.folderId ?? `${environmentTypeId}-${normalized}`,
    assetId: asset?.id ?? null,
    visible: true,
    locked: false,
    opacity: index === 0 ? 1 : 0.72,
    depth: index * 10,
    blendMode: /glow|ray|particle|star/i.test(name) ? "screen" : "normal",
    rotation: 0,
    scale: 1,
    offset: { x: 0, y: 0 },
    tint: "#ffffff",
    parallax: Math.min(1, index * 0.06),
    visibilityRules: [],
    seedVariationRules: { enabled: false, assetPoolIds: [], opacityVariance: 0, rotationVariance: 0 },
    animation: { enabled: false, type: "none", speed: 0, reducedMotionFallback: "static" }
  };
}

export const environmentProfiles: EnvironmentProfile[] = environmentTypes.map((environment, index) => ({
  id: `environment-profile-${environment.id}`,
  environmentTypeId: environment.id,
  displayName: `${environment.displayName} Default`,
  description: environment.description,
  defaultThemeId: index % 2 ? "deep-void" : "midnight-sapphire",
  seed: `NOVERIS-${environment.id.toUpperCase()}-001`,
  layers: profileLayerNames[environment.id].map((name, layerIndex) => defaultLayer(environment.id, name, layerIndex)),
  constraints: {
    centerSafeZone: { width: 0.42, height: 0.34 },
    maximumBrightness: 0.92,
    maximumNebulas: environment.id === "star_system" ? 2 : 3,
    darkCorners: true,
    primaryPalette: ["#020617", "#082f49", "#22d3ee"],
    secondaryPalette: ["#f59e0b", "#a5f3fc"],
    maximumParticleDensity: 0.55,
    noUiObstruction: true,
    singleFocalPoint: true
  },
  status: "draft"
}));

export const environmentComposerContract: EnvironmentComposerContract = {
  id: "environment-composer",
  version: environmentComposerContractVersion,
  ownership: {
    studioOwns: ["environment profiles", "layer ordering", "asset references", "themes", "artistic constraints", "presentation intent"],
    clientOwns: ["Unity scene rendering", "camera", "shaders", "lighting implementation", "controls", "platform optimization"],
    sourceMasterPolicy: "PSD remains private master artwork. Studio references approved exported image layers and never edits PSD content.",
    runtimeTexturePolicy: "Runtime exports stable semantic asset references only. Texture binaries and private source paths are never embedded."
  },
  environmentTypes,
  layerTrees,
  layerAssets: environmentLayerAssets,
  themes: environmentThemes,
  profiles: environmentProfiles,
  runtimeRules: {
    embedsTextures: false,
    publishesReferencesOnly: true,
    deterministicOrdering: true,
    clientsOwnRendering: true
  }
};

export function validateEnvironmentComposerContract(contract: EnvironmentComposerContract = environmentComposerContract) {
  const issues: Array<{ severity: "error" | "warning"; code: string; message: string; records: string[] }> = [];
  const environmentIds = new Set(contract.environmentTypes.map((environment) => environment.id));
  const assetIds = new Set(contract.layerAssets.map((asset) => asset.id));
  const themeIds = new Set(contract.themes.map((theme) => theme.id));
  const duplicate = (values: string[]) => values.filter((value, index) => values.indexOf(value) !== index);

  for (const [name, ids] of [
    ["environment types", contract.environmentTypes.map((row) => row.id)],
    ["layer assets", contract.layerAssets.map((row) => row.id)],
    ["themes", contract.themes.map((row) => row.id)],
    ["profiles", contract.profiles.map((row) => row.id)]
  ] as const) {
    const duplicates = [...new Set(duplicate(ids))];
    if (duplicates.length) issues.push({ severity: "error", code: "duplicate_id", message: `${name} contain duplicate IDs.`, records: duplicates });
  }

  for (const environmentId of environmentIds) {
    if (!contract.layerTrees[environmentId]?.length) {
      issues.push({ severity: "error", code: "layer_tree_missing", message: "Every environment type requires a layer tree.", records: [environmentId] });
    }
    if (!contract.profiles.some((profile) => profile.environmentTypeId === environmentId)) {
      issues.push({ severity: "error", code: "profile_missing", message: "Every environment type requires a default profile.", records: [environmentId] });
    }
  }

  for (const profile of contract.profiles) {
    if (!environmentIds.has(profile.environmentTypeId)) issues.push({ severity: "error", code: "profile_environment_missing", message: "Profile environmentTypeId must resolve.", records: [profile.id, profile.environmentTypeId] });
    if (!themeIds.has(profile.defaultThemeId)) issues.push({ severity: "error", code: "profile_theme_missing", message: "Profile defaultThemeId must resolve.", records: [profile.id, profile.defaultThemeId] });
    const orders = profile.layers.map((layer) => layer.order);
    if (new Set(orders).size !== orders.length) issues.push({ severity: "error", code: "layer_order_duplicate", message: "Layer order must be unique within a profile.", records: [profile.id] });
    for (const layer of profile.layers) {
      if (layer.assetId && !assetIds.has(layer.assetId)) issues.push({ severity: "error", code: "layer_asset_missing", message: "Layer assetId must resolve.", records: [profile.id, layer.id, layer.assetId] });
      if (layer.opacity < 0 || layer.opacity > 1 || layer.parallax < 0 || layer.parallax > 1) issues.push({ severity: "error", code: "layer_range_invalid", message: "Opacity and parallax values must be normalized.", records: [profile.id, layer.id] });
    }
  }

  for (const asset of contract.layerAssets) {
    if (!asset.environmentTypeIds.length || asset.environmentTypeIds.some((id) => !environmentIds.has(id))) issues.push({ severity: "error", code: "asset_environment_missing", message: "Layer assets must reference valid environments.", records: [asset.id] });
    if (!asset.semanticKey || /\/Users\/|studio-private:\/\//i.test(JSON.stringify(asset))) issues.push({ severity: "error", code: "asset_reference_unsafe", message: "Layer asset references must be stable and sanitized.", records: [asset.id] });
    if (asset.publicPath && !asset.publicPath.startsWith("/")) issues.push({ severity: "error", code: "asset_public_path_invalid", message: "Public paths must be safe runtime paths.", records: [asset.id, asset.publicPath] });
  }

  if (!contract.runtimeRules.publishesReferencesOnly || contract.runtimeRules.embedsTextures || !contract.runtimeRules.clientsOwnRendering) {
    issues.push({ severity: "error", code: "runtime_boundary_invalid", message: "Environment Composer runtime must publish references only and keep rendering client-owned.", records: [contract.id] });
  }

  return issues;
}

export function environmentComposerRuntimeContract(): EnvironmentComposerContract {
  return {
    ...environmentComposerContract,
    layerAssets: environmentComposerContract.layerAssets.map((asset) => ({
      ...asset,
      publicPath: asset.status === "published" ? asset.publicPath : null
    }))
  };
}
