import { validateNanoBananaVisualPrompt, type PromptIssue } from "@/lib/visual-production/nano-banana-2";

export type CelestialVisualKind = "galaxy" | "galactic-region" | "star-system" | "planet" | "planet-surface" | "orbital-platform";
export type StarSystemVisualMode = "complete-system" | "environment-painting";
export type PlanetVisualMode = "orbit" | "surface" | "orbital-platform";

export type CelestialVisualPrompt = {
  canonicalData: Record<string, unknown>;
  visualSummary: string;
  visualPrompt: string;
  negativePrompt: string;
  combinedPrompt: string;
  resolvedVisualVariables: Record<string, string>;
  unresolvedVisualVariables: string[];
  modelProfileId: "nano-banana-2";
  promptVersion: "3.0.0";
  promptHash: string;
  generatedAt: string;
  validation: PromptIssue[];
};

const hash = (value: string) => {
  let current = 2166136261;
  for (const character of value) current = Math.imul(current ^ character.charCodeAt(0), 16777619);
  return (current >>> 0).toString(16).padStart(8, "0");
};

const sharedNegative = [
  "no text", "no labels", "no watermark", "no logo", "no user interface", "no border", "no frame", "no infographic", "no blueprint", "no diagram", "no collage", "no fantasy nebula", "no oversaturation", "no decorative star field", "no dramatic focal glow", "no visible banding"
].join(", ");

function cleanVisualSummary(value: string) {
  return value
    .replace(/\bhighly detailed\b/gi, "")
    .replace(/\bpremium sci-fi strategy game quality\b/gi, "NOVERIS scientific realism")
    .replace(/\bcinematic lighting\b/gi, "controlled lighting")
    .replace(/\bmasterpiece\b/gi, "")
    .replace(/\baward[- ]winning\b/gi, "")
    .replace(/\bbreathtaking\b/gi, "")
    .replace(/\bprofessionally engineered\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1")
    .trim();
}

const visualOnly = (kind: CelestialVisualKind, canonicalData: Record<string, unknown>, variables: Record<string, string>, summary: string, visualPrompt: string, extraNegative: string[] = []): CelestialVisualPrompt => {
  const negativePrompt = [sharedNegative, ...extraNegative].join(", ");
  const combinedPrompt = `VISUAL PROMPT:\n${visualPrompt}\n\nNEGATIVE / EXCLUDE:\n${negativePrompt}`;
  return {
    canonicalData: { kind, ...canonicalData },
    visualSummary: summary,
    visualPrompt,
    negativePrompt,
    combinedPrompt,
    resolvedVisualVariables: variables,
    unresolvedVisualVariables: [],
    modelProfileId: "nano-banana-2",
    promptVersion: "3.0.0",
    promptHash: hash(combinedPrompt),
    generatedAt: "deterministic-build",
    validation: validateNanoBananaVisualPrompt({ visualPrompt, negativePrompt, combinedPrompt }, { min: 80, max: 240 })
  };
};

export function compileGalaxyVisualPrompt(profile: { category: string; subclass: string; displayName: string; prompt: string }): CelestialVisualPrompt {
  const variables = {
    galaxyProfile: profile.displayName,
    galaxyClassification: profile.category,
    structuralCharacter: profile.subclass,
    galacticStructure: profile.prompt,
    coreBrightness: "subtle and non-dominant",
    colorPalette: "deep black, midnight blue, faint cool violet, and rare ivory starlight"
  };
  const visualPrompt = [
    `Create a premium NOVERIS visual of a single ${profile.displayName.toLowerCase()} galaxy in three-quarter view.`,
    `It is a ${profile.category.toLowerCase()} with ${profile.subclass.toLowerCase()} structure: ${profile.prompt}`,
    "Keep the composition dark, sparse, scientifically plausible, and quietly immense. Use a restrained luminous core, delicate arm or halo structure where appropriate, tiny natural stars, and broad uninterrupted negative space.",
    "The galaxy should read as a distant astronomical subject, never as poster art. Use deep black, midnight blue, faint cool violet, and occasional ivory starlight. Keep the center open and avoid a bright anchor point.",
    "3840 x 2400, 16:10, premium astronomical matte painting, subtle tilt-shift lens depth, no visible banding in the center. No text, watermark, logo, interface, border, frame, planet, spacecraft, or decorative effects."
  ].join(" ");
  return visualOnly("galaxy", profile, variables, `${profile.displayName} is a quiet ${profile.category.toLowerCase()} composition with restrained, scientifically plausible structure.`, visualPrompt, ["no close planet", "no recognizable Milky Way", "no large bright core"]);
}

export function compileGalacticRegionVisualPrompt(profile: { category: string; subclass: string; displayName: string; prompt: string }): CelestialVisualPrompt {
  const variables = {
    galacticRegionProfile: profile.displayName,
    regionCharacter: profile.prompt,
    starDensity: /core|bar|arm/i.test(profile.subclass) ? "moderate, primarily tiny distant stars" : "sparse, primarily tiny distant stars",
    nebulaDensity: "very low, fragmented, and low contrast",
    colorPalette: "deep black, midnight blue, dark indigo, faint cyan, and rare ivory stars"
  };
  const visualPrompt = [
    `Create a premium NOVERIS visual of the ${profile.displayName} galactic region.`,
    `${profile.prompt}`,
    "Show distant astronomical structure only: a quiet field of mostly tiny stars, faint fragmented molecular clouds, and low-contrast interstellar haze that appears thousands of light years away.",
    "Keep 85 to 90 percent of the frame visually quiet with generous open negative space for future gameplay. Use deep black, midnight blue, dark indigo, faint cyan, and rare ivory stars. Avoid visual spectacle and any obvious framing.",
    "3840 x 2400, 16:10, premium astronomical matte painting, subtle tilt-shift lens depth, no visible banding in the center. No text, watermark, logo, interface, border, frame, planets, suns, orbit lines, stations, or large nebulae."
  ].join(" ");
  return visualOnly("galactic-region", profile, variables, `${profile.displayName} is a restrained galactic region with sparse, distant astronomical texture and a protected open center.`, visualPrompt, ["no large cloud formations", "no bright focal star", "no recognizable galaxy disk"]);
}

export function compileStarSystemVisualPrompt(profile: { systemClass: string; subclass: string; displayName: string; systemPrompt: string }, mode: StarSystemVisualMode = "complete-system"): CelestialVisualPrompt {
  const variables = {
    starSystemProfile: profile.displayName,
    primaryStarProfile: profile.systemClass,
    canonicalBodySummary: profile.systemPrompt,
    systemCharacter: profile.subclass,
    colorPalette: "deep black, midnight blue, faint cool violet, restrained cyan, and rare ivory highlights"
  };
  const environmentOnly = mode === "environment-painting";
  const visualPrompt = environmentOnly
    ? [
      "Create a premium NOVERIS environment painting for an interactive star system.",
      `${profile.systemPrompt}`,
      "Show only quiet deep space with mostly tiny, faint stars, a nearly open center, and extremely subtle fragmented molecular haze far in the distance. Preserve large uninterrupted negative space for a future star, planets, orbit paths, and interface elements.",
      "Use a restrained deep-black, midnight-blue, dark-indigo, faint-cyan palette with rare warm ivory stars. The image should feel scientifically plausible, silent, lonely, and immense rather than decorative.",
      "3840 x 2160, 16:9, astronomical matte painting, subtle tilt-shift lens depth, no visible banding in the center. No text, watermark, logo, interface, border, frame, planets, suns, moons, galaxies, orbit lines, spacecraft, stations, black holes, or bright focal points."
    ].join(" ")
    : [
      `Create a premium NOVERIS visual of one ${profile.displayName.toLowerCase()} star system.`,
      `${profile.systemPrompt}`,
      "Show a scientifically plausible orbital hierarchy with a readable primary star, proportionate planets and moons, restrained thin orbit paths, and generous dark negative space. Keep all bodies distinct, physically credible, and secondary to the system's calm overall composition.",
      "Use deep black, midnight blue, faint cool violet, restrained cyan, and rare ivory highlights. Avoid spectacle, crowded object fields, or wallpaper composition.",
      "3840 x 2400, 16:10, premium astronomical matte painting, subtle tilt-shift lens depth, no visible banding in the center. No text, watermark, logo, interface, border, frame, spaceships, stations, unrelated planets, diagram labels, or decorative effects."
    ].join(" ");
  return visualOnly("star-system", { ...profile, mode }, variables, `${profile.displayName} is a ${profile.subclass.toLowerCase()} composition with a clear, scientifically plausible orbital identity.`, visualPrompt, environmentOnly ? ["no central star", "no planets", "no orbit paths"] : ["no extra stars", "no duplicate planets", "no impossible orbital paths"]);
}

export function compilePlanetVisualPrompt(
  profile: { planetClass: string; planetSubclass: string; visualSummary: string; rarity?: string; biome?: string; anomalies?: string[] },
  mode: PlanetVisualMode = "orbit"
): CelestialVisualPrompt {
  const visualSummary = cleanVisualSummary(profile.visualSummary);
  const variables = {
    planetClass: profile.planetClass,
    planetSubclass: profile.planetSubclass,
    visualCharacter: visualSummary,
    biome: profile.biome || profile.planetClass,
    rarity: profile.rarity || "common",
    anomalies: profile.anomalies?.join(", ") || "none"
  };
  const orbit = mode === "orbit";
  const surface = mode === "surface";
  const visualPrompt = orbit
    ? [
      `Create a premium NOVERIS visual of one ${profile.planetSubclass.toLowerCase()} ${profile.planetClass.toLowerCase()} planet.`,
      visualSummary,
      "Show one complete spherical world from orbit with scientifically plausible geography, atmosphere, cloud systems, materials, and restrained terminator lighting. Keep the planet centered, fully visible, and clearly readable at a glance.",
      "Use a pure black background, soft upper-left illumination, crisp contained silhouette edges, and generous negative space for clean asset extraction. Keep any atmosphere tightly contained within the visible planet edge.",
      "3840 x 3840, 1:1, premium scientific realism. No text, labels, watermark, logo, interface, border, stars, moons, rings unless stated, spacecraft, cities, external terrain, lens flare, bloom, or duplicate bodies."
    ].join(" ")
    : surface
      ? [
        `Create a premium NOVERIS surface environment for a ${profile.planetSubclass.toLowerCase()} ${profile.planetClass.toLowerCase()} world.`,
        visualSummary,
        "Show a broad, scientifically plausible landscape with a clear horizon, natural geology, physically believable atmosphere, and conditions that explain the planet's visible materials and climate. Match any supplied orbit reference only as visual context; do not redesign the world.",
        "Use natural expedition-scale composition, restrained color, clear foreground-to-horizon depth, and a readable focal hierarchy. 3840 x 2160, 16:9, premium environmental realism.",
        "No text, labels, watermark, logo, interface, border, people, vehicles, spacecraft, fantasy structures, exaggerated glow, lens flare, or contradictory biome."
      ].join(" ")
      : [
        `Create a premium NOVERIS orbital industry scene above a ${profile.planetSubclass.toLowerCase()} ${profile.planetClass.toLowerCase()} world.`,
        visualSummary,
        "Show restrained, physically plausible collectors, refineries, research platforms, or depots in orbit with the planet as the dominant environmental subject. Emphasize scale, safe separation, and believable engineering rather than spectacle.",
        "Use deep space, controlled illumination, and a clear readable composition. 3840 x 2160, 16:9, premium scientific realism.",
        "No text, labels, watermark, logo, interface, border, surface landing, dense fleet formations, fantasy megastructures, excessive lens flare, or invented celestial bodies."
      ].join(" ");
  const summary = `${profile.planetSubclass} ${profile.planetClass.toLowerCase()} world with ${visualSummary.replace(/\.$/, "").toLowerCase()}.`;
  return visualOnly(mode === "orbit" ? "planet" : mode === "surface" ? "planet-surface" : "orbital-platform", { ...profile, mode }, variables, summary, visualPrompt, orbit ? ["no duplicate planet", "no cropped sphere", "no external atmosphere glow"] : surface ? ["no alien city", "no decorative wallpaper composition"] : ["no landing scene", "no ground terrain"]);
}

export function compileCelestialBodyVisualPrompt(
  profile: { displayName: string; bodyType: string; bodyClass?: string | null; bodySubclass?: string | null; visualSummary: string },
  mode: "orbit" | "surface" = "orbit"
): CelestialVisualPrompt {
  const visualSummary = cleanVisualSummary(profile.visualSummary);
  const bodyType = profile.bodyType.toLowerCase();
  const isStar = /star|sun/.test(bodyType);
  const isBelt = /belt|debris|asteroid/.test(bodyType);
  const visualPrompt = isStar
    ? [
      `Create a premium NOVERIS visual of ${profile.displayName}, a single ${profile.bodyClass?.toLowerCase() || "stellar"} star.`,
      visualSummary,
      "Show a physically plausible stellar surface, controlled corona, restrained prominences, and a readable outer edge with generous dark negative space. Keep brightness contained so the stellar form remains visible.",
      "Use deep black space, subtle cool and warm stellar color variation, and a calm scientific-realism presentation. 3840 x 3840, 1:1. No text, labels, watermark, logo, interface, border, planets, spacecraft, fantasy flames, bloom, or overexposure."
    ].join(" ")
    : isBelt
      ? [
        `Create a premium NOVERIS visual of ${profile.displayName}, a ${profile.bodyType.toLowerCase()}.`,
        visualSummary,
        "Show a quiet, physically plausible distribution of rock, ice, and dust with clearly separated debris, restrained scale variation, and broad dark negative space. Keep the formation calm and observational rather than crowded or decorative.",
        "Use deep black space, subtle reflected light, and scientific realism. 3840 x 2160, 16:9. No text, labels, watermark, logo, interface, border, spacecraft, stations, planets, dense battle debris, or exaggerated glow."
      ].join(" ")
      : mode === "surface"
        ? [
          `Create a premium NOVERIS surface environment for ${profile.displayName}, a ${profile.bodyType.toLowerCase()}.`,
          visualSummary,
          "Show broad, scientifically plausible terrain, atmosphere, and material conditions with clear foreground-to-horizon depth. Preserve the visual identity of the body and keep the landscape readable rather than theatrical.",
          "Use restrained natural light, subtle color, and scientific realism. 3840 x 2160, 16:9. No text, labels, watermark, logo, interface, border, people, vehicles, spacecraft, fantasy structures, or decorative lens flare."
        ].join(" ")
        : [
          `Create a premium NOVERIS visual of ${profile.displayName}, a single ${profile.bodyType.toLowerCase()}.`,
          visualSummary,
          "Show the complete celestial body from orbit with physically plausible materials, surface or atmospheric structure, and restrained terminator lighting. Keep the subject fully visible, centered, and immediately readable.",
          "Use a pure black background, clean silhouette edges, subtle upper-left illumination, and generous negative space for clean extraction. 3840 x 3840, 1:1. No text, labels, watermark, logo, interface, border, stars, moons, rings unless stated, spacecraft, cities, lens flare, bloom, or duplicate bodies."
        ].join(" ");
  return visualOnly(
    isStar ? "star-system" : mode === "surface" ? "planet-surface" : "planet",
    { ...profile, mode },
    {
      bodyName: profile.displayName,
      bodyType: profile.bodyType,
      bodyClass: profile.bodyClass || "unclassified",
      bodySubclass: profile.bodySubclass || "unclassified",
      visualCharacter: visualSummary
    },
    `${profile.displayName} is a ${profile.bodyType.toLowerCase()} with ${visualSummary.replace(/\.$/, "").toLowerCase()}.`,
    visualPrompt,
    isStar ? ["no solar-system diagram", "no duplicate star"] : isBelt ? ["no dense debris wall", "no named bodies"] : ["no duplicate celestial body", "no cropped subject"]
  );
}

export function compileEnvironmentVisualPrompt(profile: {
  contextType: string;
  ownerName?: string;
  environment?: string;
  visualPalette?: string;
  nebulaDensity?: string;
  dustDensity?: string;
  starDensity?: string;
  brightness?: string;
  contrast?: string;
  focalPoint?: string;
  artDirection?: string;
  prohibitedElements?: string[];
}): CelestialVisualPrompt {
  const context = profile.contextType.replaceAll("_", " ");
  const visualPrompt = [
    `Create a premium NOVERIS environment painting for ${profile.ownerName || `a ${context} scene`}.`,
    `Show quiet ${profile.environment || "deep space"} with ${profile.starDensity || "sparse"} mostly tiny distant stars, ${profile.nebulaDensity || "very low"} fragmented molecular haze, and ${profile.dustDensity || "very low"} interstellar dust.`,
    `Use ${profile.visualPalette || "deep black, midnight blue, dark indigo, faint cyan, and rare ivory stars"}, ${profile.brightness || "very dark"} brightness, and ${profile.contrast || "low"} contrast. Preserve broad negative space and a calm ${profile.focalPoint || "open central field"}.`,
    profile.artDirection || "Keep every astronomical structure subtle, distant, scientifically plausible, and secondary to future gameplay.",
    "3840 x 2400, 16:10, premium astronomical matte painting, subtle tilt-shift lens depth, no visible banding in the center. No text, labels, watermark, logo, user interface, border, frame, planets, stars large enough to dominate, spacecraft, stations, orbit lines, gameplay indicators, or decorative effects."
  ].join(" ");
  return visualOnly(
    "star-system",
    profile,
    {
      context,
      environment: profile.environment || "deep space",
      palette: profile.visualPalette || "restrained dark space",
      focalPoint: profile.focalPoint || "open central field"
    },
    `${profile.ownerName || context} uses a quiet, restrained deep-space treatment with protected visual negative space.`,
    visualPrompt,
    ["no interactive objects", "no dense star field", "no bright central focal point", ...(profile.prohibitedElements || [])]
  );
}
