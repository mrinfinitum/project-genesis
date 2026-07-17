import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function exists(relativePath: string) {
  return existsSync(path.join(process.cwd(), relativePath));
}

function assertIncludes(label: string, text: string, values: string[]) {
  for (const value of values) {
    assert(text.includes(value), `${label} missing ${value}.`);
  }
}

function assertNoPrivateLeak(label: string, value: unknown) {
  const text = JSON.stringify(value);
  assert(!/\/Users\/|studio-private:\/\/|SERVICE_ROLE|PRIVATE_KEY|clientSecret|databaseUrl/i.test(text), `${label} leaked a private path or secret marker.`);
}

async function main() {
  const appShell = read("components/app-shell.tsx");
  const globals = read("app/globals.css");
  const workspaceUi = read("components/ui/workspace.tsx");
  const experienceWorkspace = read("components/experience-design-workspace.tsx");
  const bibleWorkspace = read("components/experience-bible-workspace.tsx");

  assert(exists("components/app-shell.tsx"), "App shell is missing.");
  assert(exists("components/ui/workspace.tsx"), "Workspace UI primitives are missing.");

  assertIncludes("App shell", appShell, [
    "workspaceEnvironmentForPath",
    "data-studio-environment",
    "studio-cinematic-shell",
    "studio-material-navigation",
    "studio-orbital-grid",
    "backdrop-blur-xl"
  ]);

  for (const environment of ["experience", "assets", "universe", "discovery", "research", "civilization", "runtime", "command"]) {
    assert(appShell.includes(`"${environment}"`), `App shell does not map ${environment} environment.`);
  }

  assertIncludes("Studio CSS", globals, [
    ".studio-cinematic-shell",
    ".studio-cinematic-shell::before",
    ".studio-cinematic-shell::after",
    ".studio-orbital-grid",
    ".studio-material-command",
    ".studio-material-projection",
    ".studio-material-reading",
    ".studio-material-navigation",
    ".studio-reading-prose",
    ".studio-mood-board-canvas",
    ".studio-hover-drift",
    "prefers-reduced-motion"
  ]);

  for (const environment of ["universe", "discovery", "runtime", "civilization", "experience", "assets", "research"]) {
    assert(globals.includes(`data-studio-environment="${environment}"`), `Studio CSS missing ${environment} background environment.`);
  }

  assertIncludes("Studio material primitives", workspaceUi, [
    "studio-material-command",
    "studio-material-projection"
  ]);

  assertIncludes("Experience Design workspace", experienceWorkspace, [
    "ExperienceShowcasePanel",
    "Civilization Observatory",
    "MoodBoardCanvasPreview",
    "studio-mood-board-canvas",
    "PureRef Inspired",
    "Civilization Before Technology",
    "Runtime Boundary"
  ]);

  assertIncludes("Experience Bible workspace", bibleWorkspace, [
    "studio-material-reading",
    "studio-reading-prose",
    "scroll-mt-24"
  ]);

  for (const forbidden of ["Jira", "Confluence", "Monday", "Azure DevOps"]) {
    assert(!experienceWorkspace.includes(forbidden), `Experience workspace should not reference ${forbidden}.`);
    assert(!appShell.includes(forbidden), `App shell should not reference ${forbidden}.`);
  }

  const runtime = await buildCanonicalRuntimeExportPayload();
  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const engineExports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));

  assert(runtime.metadata.contentVersion === 32, `ED-02 presentation pass must not change contentVersion; received ${runtime.metadata.contentVersion}.`);
  assert(runtime.metadata.schemaVersion === "game-runtime-v1", `ED-02 presentation pass must not change runtimeVersion; received ${runtime.metadata.schemaVersion}.`);
  assert(runtime.metadata.validationStatus === "Ready", "Runtime must remain Ready.");
  assertNoPrivateLeak("Canonical runtime", runtime);

  for (const [index, engineExport] of engineExports.entries()) {
    assert(engineExport.metadata.validationStatus === "Ready", `${targets[index]} export must remain Ready.`);
    assert(engineExport.metadata.contentVersion === runtime.metadata.contentVersion, `${targets[index]} export contentVersion must remain unchanged.`);
    assert(engineExport.metadata.runtimeVersion === runtime.metadata.schemaVersion, `${targets[index]} export runtimeVersion must remain unchanged.`);
    assertNoPrivateLeak(`${targets[index]} export`, engineExport);
  }

  console.log(JSON.stringify({
    ok: true,
    framework: "ED-02",
    shell: "cinematic",
    environments: ["command", "universe", "discovery", "civilization", "research", "assets", "experience", "runtime"],
    materials: ["Command Glass", "Projection Glass", "Reading Glass", "Navigation Glass"],
    readingMode: "premium",
    moodBoardExperience: "immersive canvas",
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      runtimeVersion: runtime.metadata.schemaVersion,
      validationStatus: runtime.metadata.validationStatus
    },
    engineExports: Object.fromEntries(engineExports.map((engineExport, index) => [targets[index], engineExport.metadata.validationStatus]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
