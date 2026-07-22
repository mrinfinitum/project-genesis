import type { GalaxyEnginePresentationContract, ImportIssue } from "@/types/runtime";
import { proceduralUniverseVisualContract, validateVisualSignature, generateVisualSignature } from "@/lib/universe/visual-signatures";
import { getRuntimeStarSystemBackgrounds, starSystemBackgroundTemplateSpec, validateStarSystemBackgroundRecords, buildStarSystemVisualProfile } from "@/lib/star-system-backgrounds";
import { generateGalaxy, generateSector, generateStarSystems, generateUniverse } from "@/lib/universe/generator";

export const galaxyEngineContractVersion = "1.0.0";

export const galaxyEnginePresentationContract: GalaxyEnginePresentationContract = {
  id: "galaxy_engine_presentation_contract",
  version: galaxyEngineContractVersion,
  ownership: {
    studioOwns: [
      "semantic zoom hierarchy",
      "technology gates",
      "knowledge visibility",
      "presentation intent",
      "celestial presentation classes",
      "asset roles",
      "platform rendering recommendations",
      "procedural fallback rules"
    ],
    gameOwns: ["Three.js", "React Three Fiber", "camera", "shaders", "lighting", "controls", "rendering implementation"]
  },
  semanticZoom: [
    {
      id: "galaxy",
      displayName: "Galaxy",
      hierarchyLevel: 1,
      canonicalEntityType: "galaxy",
      parentEntityType: "universe",
      childEntityTypes: ["sector"],
      defaultKnowledgeState: "charted",
      navigationIntent: "Browse generated galaxies and enter sector-scale exploration.",
      labelBehavior: "Show galaxy name when known; unknown distant galaxies use ???."
    },
    {
      id: "sector",
      displayName: "Sector",
      hierarchyLevel: 2,
      canonicalEntityType: "sector",
      parentEntityType: "galaxy",
      childEntityTypes: ["star_system"],
      defaultKnowledgeState: "detected",
      navigationIntent: "Reveal and navigate generated sectors without generating the entire galaxy.",
      labelBehavior: "Show sector designation after detection; full metadata requires scanning."
    },
    {
      id: "star_system",
      displayName: "Star System",
      hierarchyLevel: 3,
      canonicalEntityType: "star_system",
      parentEntityType: "sector",
      childEntityTypes: ["star", "planet", "moon", "asteroid_belt"],
      defaultKnowledgeState: "unknown",
      navigationIntent: "Inspect stars, planets, moons, belts, and major bodies inside a generated system.",
      labelBehavior: "Show system name after detection; body counts and resources follow knowledge visibility rules."
    }
  ],
  technologyGates: [
    {
      id: "survival",
      displayName: "Survival",
      requiredResearchIds: [],
      unlockedZoom: ["star_system"],
      unlockedInteractions: ["view_home_planet", "view_local_star", "basic_orbit_context"],
      maximumViewDistance: 1,
      maximumProbeDistance: 0,
      maximumTravelDistance: 0,
      distanceUnit: "au",
      notes: "Starting state is local and planet-focused; no galaxy-scale navigation is available."
    },
    {
      id: "planetary",
      displayName: "Planetary",
      requiredResearchIds: ["planet_scan"],
      unlockedZoom: ["star_system"],
      unlockedInteractions: ["scan_planet", "inspect_known_moons", "view_orbital_bodies"],
      maximumViewDistance: 50,
      maximumProbeDistance: 5,
      maximumTravelDistance: 1,
      distanceUnit: "au",
      notes: "Planetary technology reveals local body details without leaving the home system."
    },
    {
      id: "interplanetary",
      displayName: "Interplanetary",
      requiredResearchIds: ["system_scan"],
      unlockedZoom: ["star_system"],
      unlockedInteractions: ["probe_system_bodies", "chart_inner_system", "inspect_asteroid_belts"],
      maximumViewDistance: 500,
      maximumProbeDistance: 80,
      maximumTravelDistance: 50,
      distanceUnit: "au",
      notes: "Interplanetary technology supports full system navigation and probe gameplay."
    },
    {
      id: "interstellar",
      displayName: "Interstellar",
      requiredResearchIds: ["sector_scan", "interstellar_navigation"],
      unlockedZoom: ["sector", "star_system"],
      unlockedInteractions: ["detect_nearby_systems", "probe_star_system", "travel_to_star_system"],
      maximumViewDistance: 100,
      maximumProbeDistance: 25,
      maximumTravelDistance: 12,
      distanceUnit: "light_years",
      notes: "Interstellar technology opens sector-scale navigation while preserving fog-of-war."
    },
    {
      id: "galactic",
      displayName: "Galactic",
      requiredResearchIds: ["galactic_cartography"],
      unlockedZoom: ["galaxy", "sector", "star_system"],
      unlockedInteractions: ["generate_sector", "chart_sector", "plot_galactic_route"],
      maximumViewDistance: 100000,
      maximumProbeDistance: 2500,
      maximumTravelDistance: 500,
      distanceUnit: "light_years",
      notes: "Galactic technology lets clients present galaxy-scale context without pre-generating every sector."
    },
    {
      id: "intergalactic",
      displayName: "Intergalactic",
      requiredResearchIds: ["intergalactic_travel"],
      unlockedZoom: ["galaxy", "sector", "star_system"],
      unlockedInteractions: ["detect_distant_galaxy", "probe_galaxy", "travel_between_galaxies"],
      maximumViewDistance: 12,
      maximumProbeDistance: 3,
      maximumTravelDistance: 1,
      distanceUnit: "galactic_index",
      notes: "Intergalactic technology permits other procedural galaxies as generated records, not fixed hardcoded galaxies."
    }
  ],
  knowledgeVisibility: [
    { id: "unknown", displayName: "Unknown", order: 1, unknownDisplayName: "???", canShowName: false, canShowRegistry: false, canShowResources: false, canShowBodyCount: false, canShowDiscoveries: false, canShowTravelRoutes: false, notes: "Unknown objects render as ??? with silhouette or neutral fallback only." },
    { id: "detected", displayName: "Detected", order: 2, unknownDisplayName: "???", canShowName: true, canShowRegistry: false, canShowResources: false, canShowBodyCount: false, canShowDiscoveries: false, canShowTravelRoutes: false, notes: "Detected objects can show a name or signal label but not gameplay details." },
    { id: "probed", displayName: "Probed", order: 3, unknownDisplayName: "???", canShowName: true, canShowRegistry: true, canShowResources: false, canShowBodyCount: true, canShowDiscoveries: false, canShowTravelRoutes: false, notes: "Probe data reveals rough registry and body-count information." },
    { id: "scanned", displayName: "Scanned", order: 4, unknownDisplayName: "???", canShowName: true, canShowRegistry: true, canShowResources: false, canShowBodyCount: true, canShowDiscoveries: true, canShowTravelRoutes: false, notes: "Scan data reveals discoveries and stats but keeps deeper resources gated." },
    { id: "charted", displayName: "Charted", order: 5, unknownDisplayName: "???", canShowName: true, canShowRegistry: true, canShowResources: false, canShowBodyCount: true, canShowDiscoveries: true, canShowTravelRoutes: true, notes: "Charted objects can appear in navigation and route planning." },
    { id: "explored", displayName: "Explored", order: 6, unknownDisplayName: "???", canShowName: true, canShowRegistry: true, canShowResources: true, canShowBodyCount: true, canShowDiscoveries: true, canShowTravelRoutes: true, notes: "Explored objects reveal resource and deeper detail layers." },
    { id: "colonized", displayName: "Colonized", order: 7, unknownDisplayName: "???", canShowName: true, canShowRegistry: true, canShowResources: true, canShowBodyCount: true, canShowDiscoveries: true, canShowTravelRoutes: true, notes: "Colonized objects are player/civilization managed in client-owned save state." },
    { id: "mastered", displayName: "Mastered", order: 8, unknownDisplayName: "???", canShowName: true, canShowRegistry: true, canShowResources: true, canShowBodyCount: true, canShowDiscoveries: true, canShowTravelRoutes: true, notes: "Mastered objects expose all canonical presentation and registry information." }
  ],
  presentationClasses: [
    { id: "galaxy", displayName: "Galaxy", presentationClass: "macro_galaxy", proceduralAllowed: true, heroArtRequired: false, supportsAtmosphere: false, supportsClouds: false, supportsRings: false, lodIntent: "macro", assetRoleIds: ["galaxy", "unknown", "selection"], notes: "Macro-scale presentation for generated galaxy records." },
    { id: "sector", displayName: "Sector", presentationClass: "sector_density_field", proceduralAllowed: true, heroArtRequired: false, supportsAtmosphere: false, supportsClouds: false, supportsRings: false, lodIntent: "regional", assetRoleIds: ["sector", "navigation", "selection"], notes: "Sector presentation should communicate density and navigation state." },
    { id: "star", displayName: "Star", presentationClass: "stellar_primary", proceduralAllowed: true, heroArtRequired: false, supportsAtmosphere: false, supportsClouds: false, supportsRings: false, lodIntent: "stellar", assetRoleIds: ["star", "unknown"], notes: "Star presentation is procedural by default and can be overridden by approved art." },
    { id: "planet", displayName: "Planet", presentationClass: "orbital_planet", proceduralAllowed: true, heroArtRequired: false, supportsAtmosphere: true, supportsClouds: true, supportsRings: true, lodIntent: "orbital", assetRoleIds: ["planet", "unknown", "selection"], notes: "Planet presentation may use generated renders or approved planet art." },
    { id: "moon", displayName: "Moon", presentationClass: "orbital_moon", proceduralAllowed: true, heroArtRequired: false, supportsAtmosphere: true, supportsClouds: false, supportsRings: false, lodIntent: "orbital", assetRoleIds: ["moon", "unknown"], notes: "Moon presentation uses lighter orbital detail than planets." },
    { id: "asteroid_belt", displayName: "Asteroid Belt", presentationClass: "belt_field", proceduralAllowed: true, heroArtRequired: false, supportsAtmosphere: false, supportsClouds: false, supportsRings: false, lodIntent: "belt", assetRoleIds: ["navigation", "unknown"], notes: "Belts are major celestial records when canonical data exists." }
  ],
  platformRenderingProfiles: [
    { id: "desktop_ultra", displayName: "Desktop Ultra", platform: "desktop", renderScale: 1, lod: "ultra", textureTier: "ultra", particleDensity: 1, bloom: true, nebula: true, clouds: true, atmosphere: true, labelBudget: 240, recommendationOnly: true, notes: "Highest visual budget for powerful desktop clients." },
    { id: "desktop_high", displayName: "Desktop High", platform: "desktop", renderScale: 0.9, lod: "high", textureTier: "high", particleDensity: 0.8, bloom: true, nebula: true, clouds: true, atmosphere: true, labelBudget: 180, recommendationOnly: true, notes: "Default high-end web presentation target." },
    { id: "desktop_medium", displayName: "Desktop Medium", platform: "desktop", renderScale: 0.75, lod: "medium", textureTier: "medium", particleDensity: 0.55, bloom: true, nebula: true, clouds: true, atmosphere: true, labelBudget: 120, recommendationOnly: true, notes: "Balanced desktop profile." },
    { id: "steam", displayName: "Steam", platform: "steam", renderScale: 0.85, lod: "high", textureTier: "high", particleDensity: 0.75, bloom: true, nebula: true, clouds: true, atmosphere: true, labelBudget: 160, recommendationOnly: true, notes: "PC packaged client recommendation." },
    { id: "iphone", displayName: "iPhone", platform: "ios", renderScale: 0.65, lod: "mobile", textureTier: "mobile", particleDensity: 0.35, bloom: false, nebula: true, clouds: false, atmosphere: true, labelBudget: 48, recommendationOnly: true, notes: "Phone profile prioritizes readability, battery, and touch performance." },
    { id: "ipad", displayName: "iPad", platform: "ios", renderScale: 0.75, lod: "mobile", textureTier: "mobile", particleDensity: 0.5, bloom: true, nebula: true, clouds: true, atmosphere: true, labelBudget: 90, recommendationOnly: true, notes: "Tablet profile allows richer labels and moderate effects." },
    { id: "android_phone", displayName: "Android Phone", platform: "android", renderScale: 0.6, lod: "mobile", textureTier: "mobile", particleDensity: 0.3, bloom: false, nebula: true, clouds: false, atmosphere: true, labelBudget: 42, recommendationOnly: true, notes: "Conservative baseline for varied Android phone GPUs." },
    { id: "android_tablet", displayName: "Android Tablet", platform: "android", renderScale: 0.72, lod: "mobile", textureTier: "mobile", particleDensity: 0.45, bloom: true, nebula: true, clouds: true, atmosphere: true, labelBudget: 80, recommendationOnly: true, notes: "Tablet baseline for larger Android layouts." },
    { id: "reduced", displayName: "Reduced", platform: "accessibility", renderScale: 0.55, lod: "reduced", textureTier: "low", particleDensity: 0.1, bloom: false, nebula: false, clouds: false, atmosphere: false, labelBudget: 32, recommendationOnly: true, notes: "Reduced motion/effects profile; clients own exact accessibility implementation." }
  ],
  assetRoles: [
    { id: "galaxy", displayName: "Galaxy", category: "celestial", semanticAssetKey: "galaxy_presentation", requiredFor: ["galaxy"], fallbackRuleId: "fallback_macro_procedural" },
    { id: "sector", displayName: "Sector", category: "celestial", semanticAssetKey: "sector_presentation", requiredFor: ["sector"], fallbackRuleId: "fallback_sector_field" },
    { id: "star", displayName: "Star", category: "celestial", semanticAssetKey: "star_presentation", requiredFor: ["star"], fallbackRuleId: "fallback_stellar_procedural" },
    { id: "planet", displayName: "Planet", category: "celestial", semanticAssetKey: "planet_presentation", requiredFor: ["planet"], fallbackRuleId: "fallback_orbital_body" },
    { id: "moon", displayName: "Moon", category: "celestial", semanticAssetKey: "moon_presentation", requiredFor: ["moon"], fallbackRuleId: "fallback_orbital_body" },
    { id: "navigation", displayName: "Navigation", category: "navigation", semanticAssetKey: "galaxy_navigation", requiredFor: ["galaxy", "sector", "star_system"], fallbackRuleId: "fallback_label_only" },
    { id: "probe", displayName: "Probe", category: "interaction", semanticAssetKey: "galaxy_probe", requiredFor: ["sector", "star_system", "planet"], fallbackRuleId: "fallback_label_only" },
    { id: "travel", displayName: "Travel", category: "interaction", semanticAssetKey: "galaxy_travel", requiredFor: ["galaxy", "sector", "star_system"], fallbackRuleId: "fallback_label_only" },
    { id: "unknown", displayName: "Unknown", category: "state", semanticAssetKey: "unknown_object", requiredFor: ["galaxy", "sector", "star_system", "planet", "moon"], fallbackRuleId: "fallback_unknown_silhouette" },
    { id: "selection", displayName: "Selection", category: "interaction", semanticAssetKey: "galaxy_selection", requiredFor: ["galaxy", "sector", "star_system", "planet"], fallbackRuleId: "fallback_label_only" }
  ],
  proceduralFallbackRules: [
    { id: "fallback_macro_procedural", appliesToClassIds: ["galaxy"], fallbackMode: "procedural_shader", allowedWhenArtMissing: true, clientOwnsImplementation: true, notes: "Clients may procedurally render galaxy-scale visuals when approved art is absent." },
    { id: "fallback_sector_field", appliesToClassIds: ["sector"], fallbackMode: "procedural_shader", allowedWhenArtMissing: true, clientOwnsImplementation: true, notes: "Clients may represent sectors as density fields or navigation markers." },
    { id: "fallback_stellar_procedural", appliesToClassIds: ["star"], fallbackMode: "procedural_shader", allowedWhenArtMissing: true, clientOwnsImplementation: true, notes: "Clients may render stars procedurally from star class and spectral data." },
    { id: "fallback_orbital_body", appliesToClassIds: ["planet", "moon", "asteroid_belt"], fallbackMode: "procedural_shader", allowedWhenArtMissing: true, clientOwnsImplementation: true, notes: "Clients may render bodies procedurally from canonical class/subclass data." },
    { id: "fallback_unknown_silhouette", appliesToClassIds: ["galaxy", "sector", "star", "planet", "moon", "asteroid_belt"], fallbackMode: "neutral_silhouette", allowedWhenArtMissing: true, clientOwnsImplementation: true, notes: "Unknown records use ??? and neutral silhouette treatment until knowledge visibility allows details." },
    { id: "fallback_label_only", appliesToClassIds: ["galaxy", "sector", "star", "planet", "moon", "asteroid_belt"], fallbackMode: "label_only", allowedWhenArtMissing: true, clientOwnsImplementation: true, notes: "UI-only interaction assets may fall back to semantic labels/icons." }
  ],
  proceduralUniverse: proceduralUniverseVisualContract,
  starSystemBackgroundTemplate: starSystemBackgroundTemplateSpec,
  starSystemBackgrounds: getRuntimeStarSystemBackgrounds(),
  starSystemVisualProfiles: (() => {
    const universe = generateUniverse("PROJECT-GENESIS-UNIVERSE");
    const galaxy = generateGalaxy(universe.universe_seed, 0);
    const sector = generateSector(galaxy, 0);
    return generateStarSystems(sector, 12).map((system) => buildStarSystemVisualProfile(system.id, system.visual_signature?.fingerprint));
  })(),
  validationRules: [
    "Studio publishes semantic contracts only; clients own renderer implementation.",
    "Unknown objects must display ??? when canShowName is false.",
    "Technology gates must resolve to supported semantic zoom levels.",
    "Asset roles must resolve to fallback rules.",
    "Platform rendering profiles are recommendations only and must not include engine-specific code.",
    "Star-system background exports must never include PSD URLs, private storage paths, unpublished revisions, or artist-private notes."
  ]
};

export function validateGalaxyEnginePresentationContract(contract: GalaxyEnginePresentationContract = galaxyEnginePresentationContract): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const zoomIds = new Set(contract.semanticZoom.map((row) => row.id));
  const knowledgeIds = new Set(contract.knowledgeVisibility.map((row) => row.id));
  const presentationClassIds = new Set(contract.presentationClasses.map((row) => row.id));
  const fallbackIds = new Set(contract.proceduralFallbackRules.map((row) => row.id));
  const roleIds = new Set(contract.assetRoles.map((row) => row.id));
  const duplicate = (rows: Array<{ id: string }>) => rows.map((row) => row.id).filter((id, index, ids) => ids.indexOf(id) !== index);

  for (const [moduleName, rows] of Object.entries({
    semanticZoom: contract.semanticZoom,
    technologyGates: contract.technologyGates,
    knowledgeVisibility: contract.knowledgeVisibility,
    presentationClasses: contract.presentationClasses,
    platformRenderingProfiles: contract.platformRenderingProfiles,
    assetRoles: contract.assetRoles,
    proceduralFallbackRules: contract.proceduralFallbackRules
  })) {
    const duplicates = duplicate(rows);
    if (duplicates.length) issues.push({ severity: "error", code: "galaxy_engine_duplicate_id", message: `${moduleName} contains duplicate IDs.`, records: duplicates });
  }

  for (const id of ["galaxy", "sector", "star_system"] as const) {
    if (!zoomIds.has(id)) issues.push({ severity: "error", code: "galaxy_engine_zoom_missing", message: "Semantic zoom hierarchy is incomplete.", records: [id] });
  }
  for (const id of ["unknown", "detected", "probed", "scanned", "charted", "explored", "colonized", "mastered"] as const) {
    if (!knowledgeIds.has(id)) issues.push({ severity: "error", code: "galaxy_engine_knowledge_missing", message: "Knowledge visibility states are incomplete.", records: [id] });
  }
  const unknown = contract.knowledgeVisibility.find((row) => row.id === "unknown");
  if (!unknown || unknown.canShowName || unknown.unknownDisplayName !== "???") {
    issues.push({ severity: "error", code: "galaxy_engine_unknown_visibility_invalid", message: "Unknown objects must hide names and display ???.", records: ["unknown"] });
  }
  for (const gate of contract.technologyGates) {
    for (const zoom of gate.unlockedZoom) {
      if (!zoomIds.has(zoom)) issues.push({ severity: "error", code: "galaxy_engine_gate_zoom_missing", message: "Technology gates must resolve unlocked zoom IDs.", records: [gate.id, zoom] });
    }
    if (gate.maximumViewDistance < gate.maximumProbeDistance || gate.maximumProbeDistance < gate.maximumTravelDistance) {
      issues.push({ severity: "error", code: "galaxy_engine_gate_distance_invalid", message: "Technology gate distances must follow view >= probe >= travel.", records: [gate.id] });
    }
  }
  for (const presentationClass of contract.presentationClasses) {
    for (const roleId of presentationClass.assetRoleIds) {
      if (!roleIds.has(roleId as GalaxyEnginePresentationContract["assetRoles"][number]["id"])) {
        issues.push({ severity: "error", code: "galaxy_engine_class_role_missing", message: "Presentation class asset roles must resolve.", records: [presentationClass.id, roleId] });
      }
    }
  }
  for (const role of contract.assetRoles) {
    if (!fallbackIds.has(role.fallbackRuleId)) {
      issues.push({ severity: "error", code: "galaxy_engine_role_fallback_missing", message: "Asset role fallback rules must resolve.", records: [role.id, role.fallbackRuleId] });
    }
  }
  for (const fallback of contract.proceduralFallbackRules) {
    for (const classId of fallback.appliesToClassIds) {
      if (!presentationClassIds.has(classId)) {
        issues.push({ severity: "error", code: "galaxy_engine_fallback_class_missing", message: "Fallback rules must resolve presentation classes.", records: [fallback.id, classId] });
      }
    }
  }
  for (const profile of contract.platformRenderingProfiles) {
    if (profile.recommendationOnly !== true) {
      issues.push({ severity: "error", code: "galaxy_engine_profile_not_recommendation", message: "Platform rendering profiles must remain recommendations only.", records: [profile.id] });
    }
  }
  if (contract.proceduralUniverse.visualSignatureVersion !== "visual-signature-v1") {
    issues.push({ severity: "error", code: "visual_signature_version_invalid", message: "Procedural universe visual signature version is missing or unsupported.", records: [contract.proceduralUniverse.visualSignatureVersion] });
  }
  const fixtureSignature = generateVisualSignature({ universeSeed: "validation", generationVersion: "seeded-cascade-v1", semanticLevel: "galaxy", canonicalObjectId: "validation-galaxy" });
  for (const issue of validateVisualSignature(fixtureSignature)) issues.push({ severity: issue.severity, code: issue.code, message: issue.message, records: ["proceduralUniverse"] });
  for (const issue of validateStarSystemBackgroundRecords()) {
    issues.push(issue);
  }
  const profileIds = Object.values(contract.proceduralUniverse.profileLibraries).flatMap((library) => library.map((profile) => profile.id));
  const duplicateProfileIds = profileIds.filter((id, index) => profileIds.indexOf(id) !== index);
  if (duplicateProfileIds.length) {
    issues.push({ severity: "error", code: "visual_profile_id_duplicate", message: "Procedural visual profile IDs must be globally unique.", records: [...new Set(duplicateProfileIds)] });
  }
  const unknownVisibility = contract.proceduralUniverse.discoveryVisibility.find((state) => state.id === "unknown");
  if (!unknownVisibility || unknownVisibility.canShowName || unknownVisibility.canShowClassification || unknownVisibility.canShowResources || unknownVisibility.canShowChildCounts || unknownVisibility.canShowDiscoveries || unknownVisibility.canShowRoutes || unknownVisibility.canShowRegistry || unknownVisibility.canShowOwnership) {
    issues.push({ severity: "error", code: "procedural_unknown_visibility_invalid", message: "Unknown procedural objects must redact authored knowledge and display ???.", records: ["unknown"] });
  }
  const forbiddenPlayerStateKeys = new Set(["selectedObject", "camera", "probeState", "fogRevealMasks", "knownRoutes", "bookmarks", "saveData", "playerDiscovery"]);
  const findForbiddenKeys = (value: unknown, trail: string[] = []): string[] => {
    if (!value || typeof value !== "object") return [];
    return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => {
      const nextTrail = [...trail, key];
      return [...(forbiddenPlayerStateKeys.has(key) ? [nextTrail.join(".")] : []), ...findForbiddenKeys(nested, nextTrail)];
    });
  };
  const playerStateLeaks = findForbiddenKeys(contract.proceduralUniverse);
  if (playerStateLeaks.length) {
    issues.push({ severity: "error", code: "procedural_player_state_leak", message: "Procedural universe exports must not contain player or renderer state.", records: playerStateLeaks });
  }
  const rendererOwnedConfigKeys = new Set(["threeJsConfig", "reactThreeFiberConfig", "cameraConfig", "shaderConfig", "lightingRig", "controlScheme", "rendererSettings"]);
  const findRendererConfigKeys = (value: unknown, trail: string[] = []): string[] => {
    if (!value || typeof value !== "object") return [];
    return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => {
      const nextTrail = [...trail, key];
      const ownLeak = rendererOwnedConfigKeys.has(key) ? [nextTrail.join(".")] : [];
      return [...ownLeak, ...findRendererConfigKeys(nested, nextTrail)];
    });
  };
  const rendererConfigKeys = findRendererConfigKeys(contract);
  if (rendererConfigKeys.length) {
    issues.push({
      severity: "error",
      code: "galaxy_engine_renderer_leak",
      message: "Galaxy Engine contract must not publish renderer implementation config.",
      records: rendererConfigKeys
    });
  }
  const backgroundIds = new Set(contract.starSystemBackgrounds.map((background) => background.assetId));
  const visualProfileSystemIds = contract.starSystemVisualProfiles.map((profile) => profile.systemId);
  const duplicateVisualProfiles = visualProfileSystemIds.filter((id, index) => visualProfileSystemIds.indexOf(id) !== index);
  if (duplicateVisualProfiles.length) {
    issues.push({ severity: "error", code: "star_system_visual_profile_duplicate", message: "Star-system visual profiles must be unique per system.", records: [...new Set(duplicateVisualProfiles)] });
  }
  for (const profile of contract.starSystemVisualProfiles) {
    if (profile.starSystemBackgroundId && !backgroundIds.has(profile.starSystemBackgroundId)) {
      issues.push({ severity: "error", code: "star_system_visual_profile_background_missing", message: "Visual profiles may only reference sanitized published background assets.", records: [profile.systemId, profile.starSystemBackgroundId] });
    }
    if (profile.backgroundMode !== "procedural" && !profile.starSystemBackgroundId) {
      issues.push({ severity: "error", code: "star_system_visual_profile_mode_invalid", message: "Authored or hybrid background modes require a published background asset.", records: [profile.systemId] });
    }
  }
  const publicBackgroundLeaks = findForbiddenKeys(contract.starSystemBackgrounds, ["starSystemBackgrounds"]).filter((key) => /sourceUrl|private|artistNotes|storagePath/i.test(key));
  if (publicBackgroundLeaks.length) {
    issues.push({ severity: "error", code: "star_system_background_private_metadata_leak", message: "Public background exports must contain runtime derivatives only.", records: publicBackgroundLeaks });
  }
  const serializedBackgrounds = JSON.stringify(contract.starSystemBackgrounds);
  if (/\.psd|\/Users\/|studio-private:\/\//i.test(serializedBackgrounds)) {
    issues.push({ severity: "error", code: "star_system_background_source_leak", message: "Public background exports must not expose PSD files or private source paths.", records: ["starSystemBackgrounds"] });
  }

  return issues;
}
