import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const appShell = read("components/app-shell.tsx");
const dashboard = read("components/command-center-dashboard.tsx");
const tasksPage = read("app/tasks/page.tsx");

for (const label of ["Home", "Universe", "Civilization", "Discovery", "Inspiration Wall", "Runtime", "Verification", "Experience Design"]) {
  assert(appShell.includes(`label: "${label}"`), `Primary navigation is missing ${label}.`);
}

assert(appShell.includes('id: "home"') && appShell.includes('href: "/asset-library"'), "Home navigation must include Asset Library.");
assert(!appShell.includes('id: "asset-library"'), "Asset Library should not be its own primary navigation group.");

for (const href of ["/planet-generation", "/prompt-library", "/planet-artwork", "/surface-landscapes", "/hero-discovery-shots"]) {
  assert(appShell.includes(`href: "${href}"`), `Planet prompt workspace is not discoverable in navigation: ${href}.`);
}

for (const text of ["Universe Command Center", "Continue Creating", "Generate Planet", "Open Planet Library", "Generate Galaxy", "Generate Research", "Generate Building"]) {
  assert(dashboard.includes(text), `Home dashboard is missing creation-first affordance: ${text}.`);
}

assert(!appShell.includes("Current Sprint"), "Current Sprint should not appear in primary navigation.");
assert(!appShell.includes("Sprint: Phase"), "Sprint chip should not appear in the top Studio chrome.");
assert(tasksPage.includes('redirect("/")'), "/tasks should redirect to the Universe Command Center.");

console.log("Universe-first UX verification passed.");
