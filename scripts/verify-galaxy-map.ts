import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

const root = process.cwd();
const page = readFileSync(resolve(root, "app/galaxy/page.tsx"), "utf8");
const component = readFileSync(resolve(root, "components/interactive-galaxy-map.tsx"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as { dependencies?: Record<string, string> };

const universe = generateUniverse(DEFAULT_UNIVERSE_SEED);
const galaxy = generateGalaxy(universe.universe_seed, 0);
const sector = generateSector(galaxy, 0);
const system = generateStarSystem(sector, 0);
const bodies = generateCelestialBodies(system);
const bodyIds = new Set(bodies.map((body) => body.id));

assert(page.includes("InteractiveGalaxyMap"), "/galaxy must render InteractiveGalaxyMap.");
assert(!page.includes("<GalaxyLibrary />"), "/galaxy must not use GalaxyLibrary as the normal production map.");
assert(component.includes("<Canvas"), "Galaxy map must mount a React Three Fiber Canvas.");
assert(component.includes("camera={{ fov: 45"), "Canvas must configure a perspective camera.");
assert(component.includes("semanticLevel"), "Galaxy map must preserve semantic zoom state.");
assert(component.includes("rendererMode") && component.includes("2d-fallback"), "Galaxy map must expose explicit WebGL/fallback renderer modes.");
const missingContractIds = component.match(/id: "[A-Z_]+_CONTRACT"/g) ?? [];
assert(component.includes("missingContracts") && missingContractIds.length === 13, "Galaxy diagnostics must list exactly 13 missing runtime contracts.");
assert(Boolean(pkg.dependencies?.three), "three dependency is required.");
assert(Boolean(pkg.dependencies?.["@react-three/fiber"]), "@react-three/fiber dependency is required.");
assert(Boolean(pkg.dependencies?.["@react-three/drei"]), "@react-three/drei dependency is required.");
assert(bodyIds.has("body-sol"), "Canonical Sol star must be present.");
assert(bodyIds.has("body-earth"), "Canonical Earth body must be present.");
assert(system.id === "system-sol", "Galaxy map verification must use canonical Sol system.");

console.log(JSON.stringify({
  ok: true,
  renderer: "WebGL 3D",
  route: "/galaxy",
  galaxy: galaxy.name,
  sector: sector.sector_name,
  system: system.system_name,
  bodies: bodies.length,
  hierarchySource: "canonical generator",
  fallbackMode: "explicit 2D fallback only"
}, null, 2));
