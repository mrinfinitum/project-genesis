import {
  generateCelestialBodies as generateBaseCelestialBodies,
  generateGalaxy as generateBaseGalaxy,
  generateSector as generateBaseSector,
  generateSectors,
  generateStarSystem as generateBaseStarSystem,
  generateStarSystems,
  generateStars,
  generateUniverse,
  type GalaxyNode,
  type SectorNode,
  type StarSystemNode
} from "@/lib/universe/generator";

export type GalaxyCascadePreview = {
  universe: ReturnType<typeof generateUniverse>;
  galaxy: GalaxyNode;
  sectors: SectorNode[];
};

export type SectorCascadePreview = {
  galaxy: GalaxyNode;
  sector: SectorNode;
  star_systems: StarSystemNode[];
};

export type StarSystemCascadePreview = {
  sector: SectorNode;
  star_system: StarSystemNode;
  stars: ReturnType<typeof generateStars>;
  celestial_bodies: ReturnType<typeof generateBaseCelestialBodies>;
};

export function generateGalaxy(seed: string, options?: { galaxyIndex?: number; sectorLimit?: number }): GalaxyCascadePreview {
  const universe = generateUniverse(seed);
  const galaxy = generateBaseGalaxy(universe.universe_seed, options?.galaxyIndex ?? 0);
  const sectors = generateSectors(galaxy, options?.sectorLimit ?? 64);

  return { universe, galaxy, sectors };
}

export function generateSector(seed: string, galaxyContext: GalaxyNode, options?: { sectorIndex?: number; systemLimit?: number }): SectorCascadePreview {
  const sector = generateBaseSector(galaxyContext, options?.sectorIndex ?? 0);
  const starSystems = generateStarSystems(sector, options?.systemLimit ?? 24);

  return {
    galaxy: galaxyContext,
    sector: {
      ...sector,
      generation_parent_seed: galaxyContext.seed ?? galaxyContext.galaxy_seed
    },
    star_systems: starSystems.map((system) => ({
      ...system,
      generation_parent_seed: sector.seed ?? sector.sector_seed
    }))
  };
}

export function generateStarSystem(seed: string, sectorContext: SectorNode, options?: { systemIndex?: number }): StarSystemCascadePreview {
  const starSystem = generateBaseStarSystem(sectorContext, options?.systemIndex ?? 0);
  const stars = generateStars(starSystem);
  const celestialBodies = generateBaseCelestialBodies(starSystem);

  return {
    sector: sectorContext,
    star_system: {
      ...starSystem,
      generation_parent_seed: sectorContext.seed ?? sectorContext.sector_seed
    },
    stars: stars.map((star) => ({
      ...star,
      generation_parent_seed: starSystem.seed ?? starSystem.system_seed
    })),
    celestial_bodies: celestialBodies.map((body) => ({
      ...body,
      generation_parent_seed: starSystem.seed ?? starSystem.system_seed
    }))
  };
}

export function generateCelestialBodies(seed: string, systemContext: StarSystemNode) {
  return generateBaseCelestialBodies({
    ...systemContext,
    system_seed: systemContext.seed ?? systemContext.system_seed
  });
}

export function restoreFixedSolSystem() {
  const { universe, galaxy, sectors } = generateGalaxy("PROJECT-GENESIS-UNIVERSE", { galaxyIndex: 0, sectorLimit: 1 });
  const sector = sectors[0];
  const starSystem = generateBaseStarSystem(sector, 0);

  return {
    universe,
    galaxy,
    sector,
    star_system: starSystem,
    stars: generateStars(starSystem),
    celestial_bodies: generateBaseCelestialBodies(starSystem)
  };
}
