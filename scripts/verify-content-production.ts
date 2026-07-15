import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getArchitectureState } from "@/lib/architecture";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assertNoActiveBuilder(label: string, text: string) {
  assert(!text.includes("visualBuilderHref"), `${label} must not retain active visualBuilderHref wiring.`);
  assert(!text.includes("mode=visual-builder"), `${label} must not link to visual-builder mode.`);
  assert(!text.includes("Open Visual Builder"), `${label} must not expose Open Visual Builder.`);
}

async function main() {
  const appShell = read("components/app-shell.tsx");
  const creativeProduction = read("components/creative-production-workspace.tsx");
  const assetProduction = read("components/asset-production-workspace.tsx");
  const architectureSource = read("lib/architecture/index.ts");
  const packageJson = read("package.json");

  assert(existsSync(path.join(process.cwd(), "app/visual-screen-builder/page.tsx")), "Deprecated visual-screen-builder redirect route must exist.");
  assert(existsSync(path.join(process.cwd(), "app/advanced/deprecated/visual-builder/page.tsx")), "Visual Builder archive route must exist.");
  assert(read("app/visual-screen-builder/page.tsx").includes("redirect(\"/creative-production?deprecated=visual-builder\")"), "General builder route must redirect to Creative Production.");
  assert(read("app/advanced/deprecated/visual-builder/page.tsx").includes("Deprecated — historical reference only"), "Archive page must be clearly labeled deprecated.");

  assert(appShell.includes("Deprecated Visual Builder Archive"), "Advanced nav must include the read-only deprecated archive.");
  assert(appShell.includes('label: "Screen Specifications"'), "Primary creative nav must use Screen Specifications naming.");
  assert(!appShell.includes('label: "Visual Builder"'), "App shell must not include active Visual Builder nav.");
  assert(!appShell.includes('label: "Visual Screen Builder"'), "App shell must not include active Visual Screen Builder nav.");

  assertNoActiveBuilder("Creative Production", creativeProduction);
  assertNoActiveBuilder("Asset Production", assetProduction);
  assert(creativeProduction.includes("Open Asset Library"), "Creative Production must expose Asset Library actions.");
  assert(creativeProduction.includes("screenSpecLabel") && creativeProduction.includes("Open {screenSpecLabel(area)}"), "Creative Production must expose spec/contract actions.");
  assert(creativeProduction.includes("Generate Game Handoff"), "Creative Production must expose game handoff generation.");
  assert(creativeProduction.includes("Generate Roblox Handoff"), "Creative Production must expose Roblox handoff generation.");
  assert(creativeProduction.includes("Generate Mobile Handoff"), "Creative Production must expose mobile handoff generation.");
  assert(assetProduction.includes("Open Screen Specification"), "Asset Production must use Screen Specification actions.");
  assert(assetProduction.includes("Game Handoff") && assetProduction.includes("Roblox Handoff"), "Asset Production must expose client handoff actions.");

  assert(architectureSource.includes("ARCH-DECISION-CONTENT-ASSET-IDE"), "Architecture decision must be source-controlled.");
  assert(architectureSource.includes("Studio Is the Canonical Content and Asset IDE"), "Architecture decision title is missing.");
  assert(architectureSource.includes("Screen layout and client rendering are implemented in external design tools and client repositories."), "Architecture must define client ownership.");
  assert(!packageJson.includes("verify:visual-screen-builder"), "Active visual screen builder verifier script must be retired.");
  assert(packageJson.includes("verify:screen-requirements"), "Screen requirements verifier script must exist.");
  assert(packageJson.includes("verify:content-production"), "Content production verifier script must exist.");

  const [architecture, assetState, runtime] = await Promise.all([
    getArchitectureState(),
    getAssetProductionState(),
    buildCanonicalRuntimeExportPayload()
  ]);
  assert(architecture.decisions.some((decision) => decision.id === "ARCH-DECISION-CONTENT-ASSET-IDE" && decision.status === "Accepted"), "Accepted architecture decision must resolve in state.");
  assert(assetState.assetLibraryInventory.items.length > assetState.assets.length, "Asset requirements must remain available after builder retirement.");
  assert(assetState.assetLibraryInventory.items.some((item) => item.referencedByScreens.length > 0 || item.referencedByComponents.length > 0 || item.referencedByPlaceholders.length > 0), "Asset usage relationships must remain linked.");
  assert(runtime.metadata.contentVersion === 17, `Content-only workflow refocus must not bump contentVersion; received ${runtime.metadata.contentVersion}.`);
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);
  assert(!JSON.stringify(runtime).includes("visualBuilder"), "Runtime must not export archived builder data.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
    assert(!JSON.stringify(engineExport).includes("visualBuilder"), `${targets[index]} export must not include archived builder data.`);
  }

  console.log(JSON.stringify({
    ok: true,
    decision: "ARCH-DECISION-CONTENT-ASSET-IDE",
    activeBuilderLinksRemoved: true,
    archiveRoute: "/advanced/deprecated/visual-builder",
    redirectRoute: "/visual-screen-builder",
    assetRequirements: assetState.assetLibraryInventory.items.length,
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      checksum: runtime.metadata.checksum,
      validationStatus: runtime.metadata.validationStatus
    },
    engineExports: Object.fromEntries(exports.map((engineExport, index) => [targets[index], engineExport.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
