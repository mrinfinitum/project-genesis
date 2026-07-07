import { buildPlanetPrompt, planetTypeFeaturePrompt, PLANET_PROMPT_LIBRARY } from "@/data/planet-generation-prompts";
import type { PlanetPromptTemplate } from "@/data/planet-generation-prompts";
import type { GeneratedPlanet } from "@/types/schema";

type PlanetArtworkPromptInput = {
  planetClass: string;
  planetSubclass: string;
  rarity?: string;
  biome?: string;
  anomalies?: string[];
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

function buildSurfaceLandscapePromptForInput(input: PlanetArtworkPromptInput, referenceImageUrl = "") {
  return [
    "Reference Image",
    "@img1",
    referenceImageUrl ? `@img1 URL: ${referenceImageUrl}` : "",
    "",
    "IMPORTANT",
    "@img1 is the official orbit-view render of this planet.",
    "The generated landscape must depict the surface of this exact world.",
    "Preserve the visual identity of the reference image including surface colors, geological formations, atmosphere, cloud coverage, lighting mood, planet class, planet subclass, and biome.",
    "Do not redesign the planet. Interpret the reference image from ground level.",
    "",
    "Create one ultra-high-resolution cinematic 16:9 landscape showing what an explorer would see standing on the surface of @img1.",
    "",
    commonPromptFacts(input),
    "",
    "ENVIRONMENT",
    "Create a massive open landscape that feels like an entire planet.",
    "Use terrain appropriate for the selected planet including mountains, cliffs, canyons, oceans, ice, lava, crystal formations, alien forests, organic terrain, ancient ruins, or artificial structures only when appropriate.",
    "",
    "CAMERA",
    "Human eye height, ultra-wide cinematic composition, strong foreground, detailed midground, massive distant horizon, and enormous planetary scale.",
    "",
    "LIGHTING",
    "Physically believable planetary lighting, low sun, long shadows, HDR, soft volumetric lighting where appropriate, no lens flare, no excessive bloom.",
    "",
    "SKY",
    "Generate a sky appropriate for the reference planet. Nearby moons, aurora, storm systems, dense atmosphere, thin atmosphere, or alien cloud formations may appear only if appropriate.",
    "",
    "ATMOSPHERE",
    "Use subtle atmospheric effects only when appropriate: dust, fog, snow, ash, crystal particles, or spores. Do not overuse effects.",
    "",
    "ENVIRONMENTAL STORYTELLING",
    "If the planet contains Ancient Civilization or Artificial World traits, include subtle evidence such as ruined temples, collapsed arcologies, machine infrastructure, ancient roads, or orbital elevator remains. Do not dominate the composition.",
    "",
    "QUALITY",
    "Ultra detailed, photorealistic, premium concept art, HDR, sharp, physically believable, AAA science-fiction environment.",
    "",
    "AVOID",
    "Do not contradict @img1. Do not change the planet's color palette. Do not invent a different biome. No text, UI, watermark, logos, signatures, characters, vehicles, spacecraft, fantasy elements, cartoon styling, miniature scenes, or diorama appearance.",
    "",
    "GOAL",
    "The viewer should immediately believe they are standing on the surface of the exact planet shown in @img1. The orbit-view render and the surface landscape should feel like two views of the same world."
  ].join("\n");
}

function buildOrbitalPlatformPromptForInput(input: PlanetArtworkPromptInput, referenceImageUrl = "", resources = "", hazards = "") {
  return [
    "Reference Image",
    "@img1",
    referenceImageUrl ? `@img1 URL: ${referenceImageUrl}` : "",
    "",
    "IMPORTANT",
    "@img1 is the official orbit-view render of this non-landable Gas Giant.",
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
    `Atmospheric resources: ${resources || "Hydrogen, Helium, exotic gases"}.`,
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
  return buildSurfaceLandscapePromptForInput(planetInputFromGeneratedPlanet(planet), referenceImageUrl);
}

export function buildOrbitalPlatformPrompt(planet: GeneratedPlanet, referenceImageUrl: string) {
  return buildOrbitalPlatformPromptForInput(planetInputFromGeneratedPlanet(planet), referenceImageUrl, listText(planet.resources), listText(planet.hazards));
}

export function buildPlanetSecondaryArtworkPrompt(planet: GeneratedPlanet, referenceImageUrl: string) {
  return planet.uses_orbital_gameplay || planet.planet_class === "Gas Giant"
    ? buildOrbitalPlatformPrompt(planet, referenceImageUrl)
    : buildSurfaceLandscapePrompt(planet, referenceImageUrl);
}

export function buildPlanetLandscapePromptForTemplate(row: PlanetPromptTemplate) {
  const input = planetInputFromTemplate(row);

  return row.planetClass === "Gas Giant"
    ? buildOrbitalPlatformPromptForInput(input)
    : buildSurfaceLandscapePromptForInput(input);
}
