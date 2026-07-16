import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const component = readFileSync(resolve(process.cwd(), "components/interactive-galaxy-map.tsx"), "utf8");

assert(component.includes("minDistance={semanticLevel === \"system\" ? 4 : 18}"), "System and semantic zoom min distance must be constrained.");
assert(component.includes("maxDistance={semanticLevel === \"system\" ? 58 : 180}"), "System and semantic zoom max distance must be constrained.");
assert(component.includes("minPolarAngle={0.1}"), "Camera tilt must not be locked flat.");
assert(component.includes("maxPolarAngle={Math.PI - 0.08}"), "Camera tilt must allow a wide orbit range.");
assert(component.includes("near: 0.1") && component.includes("far: 260"), "Perspective camera near/far ranges must be explicit.");

console.log(JSON.stringify({
  ok: true,
  systemDistance: [4, 58],
  semanticDistance: [18, 180],
  polarRange: "0.1..PI-0.08",
  cameraClip: [0.1, 260]
}, null, 2));
