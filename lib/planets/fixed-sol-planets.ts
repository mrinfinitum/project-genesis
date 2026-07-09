import { getLocalBubbleSystems } from "@/lib/universe/fallback-data";
import { imageVariantsFromRender, matchPlanetRender } from "@/lib/planets/render-library";
import { generateCelestialBodies, type CelestialBodyNode } from "@/lib/universe/generator";
import { ResourceService } from "@/lib/resources/service";
import type { GeneratedPlanet, PlanetRenderLibraryRecord } from "@/types/schema";

const SOL_SEED_PREFIX = "PROJECT-GENESIS-UNIVERSE:milky-way:local-bubble:sol";

const rarityDiscoveryPoints: Record<string, number> = {
  Common: 150,
  Uncommon: 350,
  Rare: 750,
  Epic: 1600,
  Legendary: 4200,
  Mythic: 9000,
  Relic: 22000,
  Cosmic: 65000,
  Genesis: 100000
};

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fixedPlanetId(body: CelestialBodyNode) {
  return `fixed-sol-${slug(body.name)}`;
}

function bodyMoons(body: CelestialBodyNode, allBodies: CelestialBodyNode[]) {
  return allBodies.filter((candidate) => candidate.orbit_parent === body.name && candidate.celestial_body_type === "Moon").length;
}

function fallbackStory(body: CelestialBodyNode) {
  const parentText = body.orbit_parent ? ` orbiting ${body.orbit_parent}` : "";
  const classText = body.planet_class ? `${body.planet_class.toLowerCase()} ${body.celestial_body_type.toLowerCase()}` : body.celestial_body_type.toLowerCase();
  return `${body.name} is a fixed Sol System ${classText}${parentText}. ${body.notes}`;
}

function hasResourceId(resources: string[], ids: string[]) {
  const resourceIds = new Set(resources.map((resource) => ResourceService.resolveId(resource)).filter(Boolean));
  return ids.some((id) => resourceIds.has(id));
}

function visualTheme(body: CelestialBodyNode): Record<string, string> {
  if (body.uses_orbital_gameplay || body.planet_class === "Gas Giant") {
    return {
      sky_color: "Deep Space",
      fog_color: "Atmospheric Bands",
      rock_color: "None",
      ground_color: "None",
      water_color: "None",
      vegetation_color: "None",
      lighting: "Orbital",
      cloud_density: "Dense",
      aurora: "Magnetic"
    };
  }

  return {
    sky_color: body.atmosphere ?? "None",
    fog_color: body.atmosphere ?? "None",
    rock_color: body.biome ?? body.planet_subclass ?? "Mixed",
    ground_color: body.biome ?? body.planet_class ?? "Mixed",
    water_color: hasResourceId(body.resources, ["RES-0041"]) ? "Frozen" : "None",
    vegetation_color: body.name === "Earth" ? "Temperate" : "None",
    lighting: "Sol",
    cloud_density: body.atmosphere && body.atmosphere !== "None" ? "Variable" : "None",
    aurora: body.planet_rarity === "Rare" ? "Possible" : "None"
  };
}

function generatedPlanetFromSolBody(body: CelestialBodyNode, allBodies: CelestialBodyNode[], renderLibrary: PlanetRenderLibraryRecord[] = []): GeneratedPlanet {
  const gasGiant = body.uses_orbital_gameplay || body.planet_class === "Gas Giant";
  const rarity = body.planet_rarity ?? "Common";
  const moonCount = bodyMoons(body, allBodies);

  const planet: GeneratedPlanet = {
    id: fixedPlanetId(body),
    seed: `${SOL_SEED_PREFIX}:${slug(body.name)}`,
    name: body.name,
    galaxy_sector: "Local Bubble",
    star_system: "Sol",
    orbit_position: body.orbit_position ?? 0,
    discovery_order: body.orbit_position ?? 0,
    rarity,
    star_type: "Yellow Main Sequence",
    distance_from_star: body.orbit_parent === "Sol" ? `Orbit ${body.orbit_position ?? "outer"}` : `Moon of ${body.orbit_parent ?? "Sol"}`,
    orbit_speed: body.orbit_parent === "Sol" ? "Canonical Solar Orbit" : "Canonical Moon Orbit",
    planet_class: body.planet_class ?? body.celestial_body_type,
    planet_subclass: body.planet_subclass ?? body.celestial_body_type,
    primary_biome: body.biome ?? body.planet_subclass ?? body.planet_class ?? body.celestial_body_type,
    climate: gasGiant ? "Atmospheric" : body.biome ?? "Variable",
    atmosphere: body.atmosphere ?? "None",
    temperature: gasGiant ? "Variable Atmospheric Layers" : body.planet_class === "Lava" ? "Extreme Heat" : body.planet_class === "Ice" ? "Frozen" : "Variable",
    gravity: body.gravity ?? "Standard",
    water_coverage: hasResourceId(body.resources, ["RES-0041", "RES-0044", "RES-0045", "RES-0047", "RES-0186"]) ? "Trace / Ice" : "Low",
    moons: moonCount ? String(moonCount) : body.celestial_body_type === "Moon" ? "0" : "None",
    resources: body.resources,
    flora: body.name === "Earth" ? "Established Biosphere" : "None Confirmed",
    fauna: body.name === "Earth" ? "Established Biosphere" : "None Confirmed",
    ancient_civilization: "None Confirmed",
    ruins: "None Confirmed",
    hazards: gasGiant ? ["High Pressure", "Radiation Belts", "Atmospheric Turbulence"] : body.landable ? ["Vacuum Exposure", "Radiation"] : ["Extreme Environment"],
    traits: [body.celestial_body_type, body.colonizable_status, body.unlock_requirement].filter(Boolean),
    anomalies: body.name === "Earth" ? ["Human Homeworld"] : [],
    modifiers: body.is_starting_body ? ["Starting Body"] : ["Fixed Sol Body"],
    collectible_pools: gasGiant ? ["Atmospheric Samples", "Fuel Isotopes"] : ["Survey Data", "Mineral Samples"],
    visual_theme: visualTheme(body),
    weather: gasGiant ? ["Magnetic Storms", "Jet Streams"] : body.atmosphere && body.atmosphere !== "None" ? ["Local Weather"] : ["None"],
    colonization: {
      difficulty: body.colonizable ? (body.colonizable_status === "Already Colonized" ? 0 : 65) : 100,
      food_modifier: body.name === "Earth" ? 100 : 0,
      power_modifier: gasGiant ? 90 : 40,
      terraform_cost: body.colonizable_status === "Terraforming Required" ? 95 : 40,
      expansion_modifier: body.colonizable ? 50 : 0,
      population_capacity: body.colonizable ? 45 : 0,
      construction_modifier: body.landable ? 45 : 0
    },
    science: {
      rare_research: rarityDiscoveryPoints[rarity] ?? 150,
      artifact_bonus: body.is_starting_body ? 20 : 5,
      research_bonus: gasGiant ? 40 : 20,
      discovery_bonus: rarityDiscoveryPoints[rarity] ?? 150,
      ancient_knowledge: 0,
      technology_chance: gasGiant ? 35 : 15
    },
    economy: {
      mining_value: body.resources.length * 12,
      trade_value: gasGiant ? 80 : 35,
      colony_value: body.colonizable ? 55 : 0,
      fuel_value: gasGiant ? 95 : hasResourceId(body.resources, ["RES-0177", "RES-0178", "RES-0180", "RES-0049", "RES-0048"]) ? 60 : 15
    },
    event_pool: gasGiant ? ["Survey Atmosphere", "Deploy Harvester", "Fuel Economy Discovery"] : ["Survey Surface", "Resource Scan", "Outpost Planning"],
    story: fallbackStory(body),
    colonizable: body.colonizable,
    landable: body.landable,
    surface_exploration: body.landable,
    terrain_generation: body.landable,
    uses_orbital_gameplay: gasGiant,
    orbital_slot_count: gasGiant ? 8 : body.celestial_body_type === "Moon" ? 1 : 2,
    orbital_platforms_built: [],
    atmospheric_harvest_rate: gasGiant ? 25 : 0,
    gas_giant_hazard_level: gasGiant ? 75 : 0,
    required_technology: [body.unlock_requirement],
    resource_transport_options: gasGiant ? ["Orbital Depot", "Fuel Tanker", "Skyhook Platform"] : ["Cargo Lander", "Orbital Depot"],
    colonized: body.colonizable_status === "Already Colonized",
    terraform_level: body.colonizable_status === "Already Colonized" ? 100 : 0,
    discovery_points: rarityDiscoveryPoints[rarity] ?? 150,
    completion_percent: body.is_starting_body ? 100 : 25,
    orbit_view_prompt: null,
    orbit_view_image_url: null,
    surface_landscape_prompt: null,
    surface_landscape_image_url: null,
    surface_landscape_status: "Placeholder",
    surface_landscape_notes: "Fixed Sol body. Add unique canonical Sol artwork from the planet render library when available.",
    image_url: null,
    image_prompt: null,
    image_status: "Placeholder Artwork",
    image_variants: null,
    created_at: "2000-01-01T00:00:00.000Z",
    notes: `${body.notes}\nFixed Sol System record.`
  };

  const renderMatch = matchPlanetRender(planet, renderLibrary);

  if (!renderMatch) {
    return planet;
  }

  const secondaryArtworkUrl = planet.uses_orbital_gameplay
    ? renderMatch.render.orbital_image_url || renderMatch.render.landscape_image_url || ""
    : renderMatch.render.landscape_image_url || "";

  return {
    ...planet,
    image_url: renderMatch.render.file_url,
    orbit_view_image_url: renderMatch.render.file_url,
    surface_landscape_image_url: secondaryArtworkUrl || planet.surface_landscape_image_url,
    surface_landscape_status: secondaryArtworkUrl ? "Library Match" : planet.surface_landscape_status,
    image_prompt: `Matched pre-rendered planet library asset "${renderMatch.render.name}" with score ${Math.round(renderMatch.score)} (${renderMatch.reasons.join(", ")}).`,
    orbit_view_prompt: planet.orbit_view_prompt ?? planet.image_prompt,
    image_status: "Library Match",
    image_variants: imageVariantsFromRender(renderMatch.render),
    notes: `${planet.notes}\nMatched planet render library asset ${renderMatch.render.id}.`
  };
}

export function fixedSolGeneratedPlanets(renderLibrary: PlanetRenderLibraryRecord[] = []) {
  const { systems } = getLocalBubbleSystems(1);
  const sol = systems[0];

  if (!sol) {
    return [];
  }

  const bodies = generateCelestialBodies(sol).filter((body) => ["Planet", "Dwarf Planet", "Moon"].includes(body.celestial_body_type));

  return bodies.map((body) => generatedPlanetFromSolBody(body, bodies, renderLibrary));
}

export function isFixedSolGeneratedPlanet(row: Pick<GeneratedPlanet, "id" | "seed">) {
  return row.id.startsWith("fixed-sol-") || row.seed.startsWith(SOL_SEED_PREFIX);
}

export function withFixedSolGeneratedPlanets(rows: GeneratedPlanet[], renderLibrary: PlanetRenderLibraryRecord[] = []) {
  const fixedRows = fixedSolGeneratedPlanets(renderLibrary);
  const existingIds = new Set(rows.map((row) => row.id));
  const existingSeeds = new Set(rows.map((row) => row.seed));
  const missingFixedRows = fixedRows.filter((row) => !existingIds.has(row.id) && !existingSeeds.has(row.seed));

  return [...rows, ...missingFixedRows];
}
