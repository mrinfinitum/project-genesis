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
    generateCelestialBodies(system).map((body): CelestialBodyNode & { created_at: string; updated_at: string } => ({
      ...body,
      created_at: "derived",
      updated_at: "derived"
    }))
  );
}
