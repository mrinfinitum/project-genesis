import { buildPlanetPrompt, planetTypeFeaturePrompt, PLANET_PROMPT_LIBRARY } from "@/data/planet-generation-prompts";
import { resourceNames } from "@/lib/resources/service";
import type { PlanetPromptTemplate } from "@/data/planet-generation-prompts";
import type { GeneratedPlanet } from "@/types/schema";

type PlanetArtworkPromptInput = {
  planetClass: string;
  planetSubclass: string;
  rarity?: string;
  biome?: string;
  anomalies?: string[];
};

type SurfaceLandscapePromptOptions = {
  referenceImageUrl?: string;
  useOrbitReference?: boolean;
};

function listText(values: string[] | null | undefined) {
  return Array.isArray(values) ? values.filter(Boolean).join(", ") : "";
}

function promptLibraryMatch(planet: GeneratedPlanet) {
  const planetClass = planet.planet_class?.toLowerCase();
  const planetSubclass = planet.planet_subclass?.toLowerCase();

  return PLANET_PROMPT_LIBRARY.find(
    (row) => row.planetClass.toLowerCase() === planetClass && row.subclass.toLowerCase() === planetSubclass
  );
}

function planetFeatureDescription(planet: GeneratedPlanet) {
  const match = promptLibraryMatch(planet);

  if (match) {
    return planetTypeFeaturePrompt(match);
  }

  return [
    `${planet.planet_subclass || planet.primary_biome || "Unique"} ${planet.planet_class || "planet"} with a ${planet.climate?.toLowerCase() || "distinct"} climate.`,
    planet.atmosphere ? `${planet.atmosphere} atmosphere.` : "",
    listText(planet.traits) ? `Visible traits: ${listText(planet.traits)}.` : "",
    listText(planet.anomalies) ? `Contained anomalies: ${listText(planet.anomalies)}.` : ""
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildOrbitViewPrompt(planet: GeneratedPlanet) {
  return buildPlanetPrompt(planetFeatureDescription(planet));
}

function commonPromptFacts(input: PlanetArtworkPromptInput) {
  return [
    "Planet Class",
    input.planetClass || "Unknown",
    "",
    "Planet Subclass",
    input.planetSubclass || "Unknown",
    "",
    "Planet Rarity",
    input.rarity || "Common",
    "",
    "Primary Biome",
    input.biome || input.planetClass || "Unknown",
    "",
    "Planet Anomalies",
    listText(input.anomalies) || "None",
    "",
    "Visual Style",
    "Cinematic realistic AAA science-fiction exploration game"
  ].join("\n");
}

function planetInputFromGeneratedPlanet(planet: GeneratedPlanet): PlanetArtworkPromptInput {
  return {
    planetClass: planet.planet_class || "Unknown",
    planetSubclass: planet.planet_subclass || "Unknown",
    rarity: planet.rarity || "Common",
    biome: planet.primary_biome || planet.planet_class || "Unknown",
    anomalies: planet.anomalies
  };
}

function planetInputFromTemplate(row: PlanetPromptTemplate): PlanetArtworkPromptInput {
  return {
    planetClass: row.planetClass,
    planetSubclass: row.subclass,
    rarity: "Common",
    biome: row.planetClass,
    anomalies: []
  };
}

function buildSurfaceLandscapePromptForInput(input: PlanetArtworkPromptInput, options: SurfaceLandscapePromptOptions = {}) {
  const referenceImageUrl = options.referenceImageUrl ?? "";
  const useOrbitReference = options.useOrbitReference ?? true;
  const referenceLines = useOrbitReference
    ? [
        "Reference Image",
        "@img1",
        referenceImageUrl ? `@img1 URL: ${referenceImageUrl}` : "",
        "",
        "REFERENCE RULE",
        "Use @img1 as the visual anchor for this planet.",
        "Create the surface landscape that belongs to this exact world, matching its colors, atmosphere, geology, lighting mood, planet class, subclass, and biome.",
        "Do not redesign the planet or invent a different world. Interpret @img1 as a real place viewed from ground level.",
        "",
        "Create one ultra-realistic 16:9 photographic surface landscape from @img1."
      ]
    : [
        "Reference Image",
        "None selected",
        "",
        "REFERENCE RULE",
        "Create the surface landscape from the planet class, subclass, biome, rarity, and notes below.",
        "Do not use @img1 unless an orbit-view render has already been intentionally selected as a reference.",
        "",
        "Create one ultra-realistic 16:9 photographic surface landscape."
      ];

  return [
    ...referenceLines,
    "It should look like a real expedition photograph or high-end cinema still from an actual alien planet, not artwork.",
    "",
    commonPromptFacts(input),
    "",
    "SCENE",
    "Show a massive open landscape with believable planetary scale, real geology, natural atmosphere, physical weather, and terrain appropriate to the selected planet.",
    "Use mountains, cliffs, canyons, oceans, ice, lava, crystal formations, alien vegetation, ruins, or artificial structures only when they fit the planet data and @img1.",
    "",
    "PHOTOGRAPHY STYLE",
    "Ultra-realistic photography, documentary science-fiction realism, natural materials, realistic textures, physically plausible lighting, detailed foreground, clear midground, distant horizon, high dynamic range, sharp focus.",
    "Camera at human eye height with a wide cinematic lens. The scene must feel captured by a real camera in a real environment.",
    "",
    "LIGHTING",
    "Physically believable planetary lighting, natural exposure, realistic shadow falloff, no lens flare, no excessive bloom, no fantasy glow.",
    "",
    "SKY",
    "Generate a sky appropriate for @img1 and the planet data. Aurora, storm systems, dense atmosphere, thin atmosphere, or alien cloud formations may appear only if appropriate. No moons or companion bodies unless explicitly requested.",
    "",
    "ATMOSPHERE",
    "Use subtle natural atmospheric effects only when appropriate: dust, fog, snow, ash, mist, crystal particles, spores, or toxic haze. Keep them realistic and physically grounded.",
    "",
    "ENVIRONMENTAL STORYTELLING",
    "If the planet contains Ancient Civilization or Artificial World traits, include subtle evidence such as ruined temples, collapsed arcologies, machine infrastructure, ancient roads, or orbital elevator remains. Do not dominate the composition.",
    "",
    "QUALITY",
    "Ultra detailed, photorealistic, realistic color grading, crisp, sharp, natural, cinematic, physically believable, premium science-fiction location photography.",
    "",
    "AVOID",
    "Do not contradict @img1. Do not change the planet's color palette. Do not invent a different biome. Avoid cartoon, anime, illustration, painterly style, brush strokes, digital painting, concept art, stylized art, matte painting, flat game art, toy-like 3D render, over-saturated colors, fantasy diorama, miniature scene, text, UI, watermark, logos, signatures, characters, vehicles, spacecraft, or anything that looks hand-painted.",
    "",
    "GOAL",
    "The viewer should immediately believe they are standing on the real surface of the exact planet shown in @img1."
  ].join("\n");
}

function buildOrbitalPlatformPromptForInput(input: PlanetArtworkPromptInput, referenceImageUrl = "", resources = "", hazards = "") {
  const defaultAtmosphericResources = resourceNames(["RES-0177", "RES-0178", "RES-0147"]).join(", ");

  return [
    "Reference Image",
    "@img1",
    referenceImageUrl ? `@img1 URL: ${referenceImageUrl}` : "",
    "",
    "IMPORTANT",
    "@img1 is the visual reference for this non-landable Gas Giant.",
    "Do not create a surface landscape. Gas Giants are orbital resource worlds.",
    "",
    "Create one ultra-high-resolution cinematic 16:9 orbital platform scene showing industrial harvesting infrastructure operating above @img1.",
    "",
    commonPromptFacts(input),
    "",
    "ORBITAL GAMEPLAY",
    "Show believable orbital resource infrastructure such as atmospheric collectors, orbital harvesters, gas refineries, fusion fuel platforms, storm research stations, orbital depots, skyhook platforms, or floating platforms.",
    "",
    "RESOURCES",
    `Atmospheric resources: ${resources || defaultAtmosphericResources}.`,
    `Hazards: ${hazards || "extreme winds, high pressure, lightning storms, radiation belts"}.`,
    "",
    "COMPOSITION",
    "16:9 cinematic view from orbit, massive gas giant below or behind the platform, clear scale, professional space-game key art, no surface landing, no terrain exploration.",
    "",
    "QUALITY",
    "Ultra detailed, photorealistic, premium AAA science-fiction environment, physically believable lighting, sharp, HDR.",
    "",
    "AVOID",
    "No ground landscape, no landable surface, no fantasy styling, no text, no UI, no watermark, no logos, no characters dominating the frame."
  ].join("\n");
}

export function buildSurfaceLandscapePrompt(planet: GeneratedPlanet, referenceImageUrl: string) {
  return buildSurfaceLandscapePromptForInput(planetInputFromGeneratedPlanet(planet), {
    referenceImageUrl,
    useOrbitReference: Boolean(referenceImageUrl)
  });
}

export function buildOrbitalPlatformPrompt(planet: GeneratedPlanet, referenceImageUrl: string) {
  return buildOrbitalPlatformPromptForInput(planetInputFromGeneratedPlanet(planet), referenceImageUrl, listText(planet.resources), listText(planet.hazards));
}

export function buildPlanetSecondaryArtworkPrompt(planet: GeneratedPlanet, referenceImageUrl: string) {
  return planet.uses_orbital_gameplay || planet.planet_class === "Gas Giant"
    ? buildOrbitalPlatformPrompt(planet, referenceImageUrl)
    : buildSurfaceLandscapePrompt(planet, referenceImageUrl);
}

export function buildPlanetLandscapePromptForTemplate(row: PlanetPromptTemplate, options: SurfaceLandscapePromptOptions = {}) {
  const input = planetInputFromTemplate(row);

  return row.planetClass === "Gas Giant"
    ? buildOrbitalPlatformPromptForInput(input)
    : buildSurfaceLandscapePromptForInput(input, options);
}
