import { buildPlanetPrompt, planetTypeFeaturePrompt, PLANET_PROMPT_LIBRARY } from "@/data/planet-generation-prompts";
import { compilePlanetVisualPrompt } from "@/lib/visual-production/celestial-prompt-compiler";
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

function visualSummary(input: PlanetArtworkPromptInput) {
  const anomalies = listText(input.anomalies);
  return [
    `${input.planetSubclass || "distinct"} ${input.planetClass || "planet"} world`,
    input.biome ? `with a ${input.biome.toLowerCase()} environmental character` : "",
    anomalies ? `and subtle signs of ${anomalies}` : ""
  ].filter(Boolean).join(" ");
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
  const hasOrbitReference = Boolean(options.useOrbitReference && options.referenceImageUrl);
  return compilePlanetVisualPrompt({
    ...input,
    visualSummary: `${visualSummary(input)}. ${hasOrbitReference ? "Match the supplied orbit reference for color, atmospheric character, and geology without redesigning the world." : "Establish the world from its visible planet characteristics."}`
  }, "surface").visualPrompt;
}

function buildOrbitalPlatformPromptForInput(input: PlanetArtworkPromptInput, referenceImageUrl = "", resources = "", hazards = "") {
  const context = [
    visualSummary(input),
    referenceImageUrl ? "Match the supplied orbit reference for atmospheric scale and palette." : "",
    resources ? `Show restrained industrial use of ${resources}.` : "",
    hazards ? `The engineering should credibly withstand ${hazards}.` : ""
  ].filter(Boolean).join(" ");
  return compilePlanetVisualPrompt({ ...input, visualSummary: context }, "orbital-platform").visualPrompt;
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
