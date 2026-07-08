import {
  generateCelestialBodies,
  generateGalaxy,
  generateSectors,
  generateStarSystems,
  generateUniverse,
  type CelestialBodyNode,
  type StarSystemNode
} from "@/lib/universe/generator";

export const DEFAULT_UNIVERSE_SEED = "PROJECT-GENESIS-UNIVERSE";

export function getLocalBubbleSystems(limit = 24) {
  const universe = generateUniverse(DEFAULT_UNIVERSE_SEED);
  const galaxy = generateGalaxy(universe.universe_seed, 0);
  const sector = generateSectors(galaxy, 1)[0];
  return {
    universe,
    galaxy,
    sector,
    systems: generateStarSystems(sector, limit)
  };
}

export function generatedStarSystemRows(limit = 24) {
  return getLocalBubbleSystems(limit).systems.map((system): StarSystemNode & { created_at: string } => ({
    ...system,
    created_at: "derived"
  }));
}

export function generatedCelestialBodyRows(systemLimit = 5) {
  const { systems } = getLocalBubbleSystems(systemLimit);

  return systems.flatMap((system) =>
    generateCelestialBodies(system).map((body) => ({
      ...body,
      orbit_view_prompt: null,
      orbit_view_image_url: null,
      surface_landscape_prompt: null,
      surface_landscape_image_url: null,
      surface_landscape_status: "Not Started",
      surface_landscape_notes: null,
      hero_discovery_prompt: null,
      hero_discovery_image_url: null,
      hero_discovery_status: "Future",
      created_at: "derived",
      updated_at: "derived"
    }))
  );
}
