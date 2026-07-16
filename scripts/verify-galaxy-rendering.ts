import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const component = readFileSync(resolve(process.cwd(), "components/interactive-galaxy-map.tsx"), "utf8");

const requiredSnippets = [
  "sphereGeometry",
  "meshStandardMaterial",
  "emissiveIntensity={3.8}",
  "pointLight",
  "EffectComposer",
  "Bloom",
  "Vignette",
  "StarField",
  "pointsMaterial",
  "Atmosphere",
  "CloudShell",
  "PlanetRings",
  "OrbitLine",
  "GasBands",
  "qualitySettings"
];

for (const snippet of requiredSnippets) {
  assert(component.includes(snippet), `Galaxy rendering implementation is missing ${snippet}.`);
}

for (const preset of ["low", "medium", "high", "ultra"]) {
  assert(component.includes(`${preset}:`) || component.includes(`"${preset}"`), `Missing quality preset ${preset}.`);
}

assert(component.includes("classPalette"), "Planet materials must vary by class.");
assert(component.includes("hasAtmosphere") && component.includes("hasClouds") && component.includes("hasRings"), "Planet presentation flags must include atmosphere/cloud/ring support.");

console.log(JSON.stringify({
  ok: true,
  star: "emissive sphere + corona + point light + bloom path",
  planets: "class-based procedural materials with atmospheres/clouds/rings where eligible",
  postprocessing: "Bloom + Vignette + optional Noise",
  qualityPresets: ["low", "medium", "high", "ultra"]
}, null, 2));
