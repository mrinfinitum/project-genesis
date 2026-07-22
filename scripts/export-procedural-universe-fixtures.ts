import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { generateGalaxy, generateSector, generateStarSystem, generateUniverse, SEED_GENERATION_VERSION } from "@/lib/universe/generator";
import { generateVisualSignature, parentAffinity, visualDistance } from "@/lib/universe/visual-signatures";

async function main() {
  const universe = generateUniverse("NOVERIS-CROSS-ENGINE-FIXTURE-001");
  const galaxies = [0, 1, 3].map((index) => generateGalaxy(universe.universe_seed, index));
  const sectors = [0, 1, 2].map((index) => generateSector(galaxies[0], index));
  const systems = [0, 1, 2].map((index) => generateStarSystem(sectors[0], index));
  const output = {
    fixtureVersion: "1.0.0",
    purpose: "Cross-engine deterministic visual signature parity fixture",
    universe,
    galaxies,
    sectors,
    systems,
    overrideExample: {
      input: { canonicalObjectId: "galaxy-fixture-override", paletteId: "palette_crimson_amber", archetypeId: "ring_galaxy" },
      resolvedSignature: generateVisualSignature({ universeSeed: universe.universe_seed, generationVersion: SEED_GENERATION_VERSION, semanticLevel: "galaxy", canonicalObjectId: "galaxy-fixture-override", override: { paletteId: "palette_crimson_amber", archetypeId: "ring_galaxy" } })
    },
    comparisons: {
      galaxyDistance: visualDistance(galaxies[0].visual_signature!, galaxies[1].visual_signature!),
      sectorParentAffinity: parentAffinity(sectors[0].visual_signature!, galaxies[0].visual_signature!),
      systemParentAffinity: parentAffinity(systems[0].visual_signature!, sectors[0].visual_signature!)
    }
  };
  const path = join(process.cwd(), "data/universe/fixtures/procedural-visual-signatures-v1.json");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(path);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
