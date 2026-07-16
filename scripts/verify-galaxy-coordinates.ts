import {
  generateCelestialBodies,
  generateGalaxy,
  generateSector,
  generateStarSystem,
  generateUniverse
} from "@/lib/universe/generator";
import { DEFAULT_UNIVERSE_SEED } from "@/lib/universe/fallback-data";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const universe = generateUniverse(DEFAULT_UNIVERSE_SEED);
const galaxy = generateGalaxy(universe.universe_seed, 0);
const sector = generateSector(galaxy, 0);
const system = generateStarSystem(sector, 0);
const first = generateCelestialBodies(system);
const second = generateCelestialBodies(system);

assert(JSON.stringify(first.map((body) => [body.id, body.orbit_position, body.parent_body_id])) === JSON.stringify(second.map((body) => [body.id, body.orbit_position, body.parent_body_id])), "Sol body layout inputs must be deterministic.");
assert(first.some((body) => body.parent_body_id === "body-earth" && body.name === "Moon"), "Earth moon hierarchy must resolve.");
assert(first.some((body) => body.parent_body_id === "body-saturn" && body.name === "Titan"), "Saturn moon hierarchy must resolve.");
assert(first.some((body) => body.name === "Asteroid Belt" && body.uses_orbital_gameplay), "Asteroid belt must remain an orbital gameplay body.");

console.log(JSON.stringify({
  ok: true,
  galaxyId: galaxy.id,
  sectorId: sector.id,
  systemId: system.id,
  bodyCount: first.length,
  deterministic: true
}, null, 2));
