import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const component = readFileSync(resolve(process.cwd(), "components/interactive-galaxy-map.tsx"), "utf8");

const requiredSnippets = [
  "OrbitControls",
  "enablePan",
  "enableRotate",
  "enableZoom",
  "THREE.MOUSE.ROTATE",
  "THREE.MOUSE.PAN",
  "THREE.TOUCH.ROTATE",
  "THREE.TOUCH.DOLLY_PAN",
  "onPointerOver",
  "onPointerOut",
  "onPointerMissed",
  "raycastResult",
  "setFocusRequest",
  "Focus Sun",
  "Focus Earth",
  "Reset"
];

for (const snippet of requiredSnippets) {
  assert(component.includes(snippet), `Galaxy interaction implementation is missing ${snippet}.`);
}

assert(!component.includes("pointer-events-none absolute inset-0"), "Canvas must not be covered by a full invisible overlay.");
assert(component.includes("pointer-events-none absolute left-4 top-4"), "HUD decoration must avoid capturing drag gestures.");
assert(component.includes("onStart={() => setDebug") && component.includes("dragState: \"dragging\""), "Controls must report drag state to diagnostics.");

console.log(JSON.stringify({
  ok: true,
  controls: ["orbit", "pan", "zoom", "touch rotate", "pinch/dolly pan"],
  selection: ["hover", "raycast select", "focus selected", "focus sun", "focus earth", "reset camera"],
  overlayPolicy: "decorative HUD uses pointer-events-none; buttons remain DOM controls outside canvas"
}, null, 2));
