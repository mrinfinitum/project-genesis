import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { buildGameEngineExport, type EngineTarget } from "@/lib/export/game-engine";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { getScreenDesignerState, screenHandoffText } from "@/lib/screen-designer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function assertNoPrivateLeak(label: string, value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  assert(!/\/Users\/|studio-private:\/\/|SERVICE_ROLE|PRIVATE_KEY|clientSecret|apiKey|databaseUrl/i.test(text), `${label} leaked a private path or secret marker.`);
}

async function main() {
  const screenSource = read("lib/screen-designer/index.ts");
  const screenWorkspace = read("components/screen-designer-workspace.tsx");
  const redirectRoute = read("app/visual-screen-builder/page.tsx");
  const archiveRoute = read("app/advanced/deprecated/visual-builder/page.tsx");

  assert(existsSync(path.join(process.cwd(), "app/screen-designer/page.tsx")), "Screen Specifications index route must exist.");
  assert(existsSync(path.join(process.cwd(), "app/screen-designer/[screenId]/page.tsx")), "Screen Specification detail route must exist.");
  assert(redirectRoute.includes("/creative-production?deprecated=visual-builder"), "Deprecated builder bookmarks must redirect to Creative Production.");
  assert(archiveRoute.includes("Read-only"), "Deprecated archive must be read-only.");
  assert(archiveRoute.includes("Open Screen Spec"), "Archive must point users to Screen Specifications.");

  assert(screenSource.includes("Studio ownership: canonical data requirements"), "Screen handoffs must state Studio ownership.");
  assert(screenSource.includes("Client ownership: exact coordinates"), "Screen handoffs must state client ownership.");
  assert(!screenSource.includes("Authored in 4K Visual Screen Builder coordinates"), "Screen requirements must not describe active Visual Builder coordinates.");
  assert(!screenSource.includes("Research management master screen draft in the Visual Screen Builder"), "Screen requirements must not describe active Visual Builder drafts.");
  assert(!screenWorkspace.includes("Open Visual Builder"), "Screen workspace must not expose active Visual Builder actions.");

  const assetState = await getAssetProductionState();
  const state = await getScreenDesignerState(assetState);
  assert(state.records.length > 0, "Screen Specifications must have records.");
  for (const record of state.records) {
    assert(record.screenId && record.displayName, `Screen record is missing identity: ${record.id}.`);
    assert(record.description.length > 0, `${record.screenId} must include purpose/description.`);
    if (record.screenType === "shell") {
      assert(record.shellBinding?.coordinateOrigin === "shell" && record.shellBinding.workspaceSlotId, `${record.screenId} shell record must include shell presentation metadata.`);
    } else if (record.screenType === "full_screen_takeover") {
      assert(record.shellBinding?.presentationMode === "full_screen_takeover" && record.shellBinding.coordinateOrigin === "shell", `${record.screenId} takeover record must include takeover presentation metadata.`);
    } else {
      assert(record.shellBinding?.shellId && record.shellBinding.workspaceSlotId, `${record.screenId} must include shell dependency metadata.`);
    }
    assert(record.dataRequirements.length > 0, `${record.screenId} must include canonical data requirements.`);
    assert(record.stateSpecs.length > 0, `${record.screenId} must include states.`);
    assert(record.responsiveRules.length > 0, `${record.screenId} must include responsive/mobile guidance.`);
    assert(record.accessibilityRequirements.length > 0, `${record.screenId} must include accessibility requirements.`);
    assertNoPrivateLeak(`${record.screenId} references`, record.references);
    const handoff = screenHandoffText(record, "Game Codex");
    assert(handoff.includes("Studio ownership:"), `${record.screenId} handoff must state Studio ownership.`);
    assert(handoff.includes("Client ownership:"), `${record.screenId} handoff must state client ownership.`);
    assertNoPrivateLeak(`${record.screenId} handoff`, handoff);
  }
  const keyScreenIds = new Set(["noveris-app-shell", "dashboard", "research", "buildings", "upgrades"]);
  const keyScreens = state.records.filter((record) => keyScreenIds.has(record.screenId));
  assert(keyScreens.length === keyScreenIds.size, "Key screen requirement records must exist.");
  assert(keyScreens.every((record) => record.assetRequirements.length > 0), "Key screen requirements must include asset requirements.");
  assert(keyScreens.some((record) => record.componentSpecs.length > 0), "Screen requirements must include component contracts.");
  assert(keyScreens.some((record) => record.interactionSpecs.length > 0 || record.componentSpecs.some((component) => component.interactions.length > 0)), "Screen requirements must include interaction guidance.");

  const runtime = await buildCanonicalRuntimeExportPayload();
  assert(runtime.metadata.validationStatus === "Ready", `Runtime must remain Ready; received ${runtime.metadata.validationStatus}.`);
  assert(!JSON.stringify(runtime).includes("screenDesigner"), "Screen Specification drafts must not leak into runtime export.");
  assert(!JSON.stringify(runtime).includes("visualBuilder"), "Archived visual builder data must not leak into runtime export.");

  const targets: EngineTarget[] = ["generic", "roblox", "web", "unity", "unreal", "godot"];
  const exports = await Promise.all(targets.map((target) => buildGameEngineExport(target)));
  for (const [index, engineExport] of exports.entries()) {
    assert(engineExport.validation.status === "Ready", `${targets[index]} export must remain Ready; received ${engineExport.validation.status}.`);
  }

  console.log(JSON.stringify({
    ok: true,
    route: "/screen-designer",
    records: state.records.length,
    redirectRoute: "/visual-screen-builder",
    archiveRoute: "/advanced/deprecated/visual-builder",
    runtime: {
      contentVersion: runtime.metadata.contentVersion,
      validationStatus: runtime.metadata.validationStatus,
      checksum: runtime.metadata.checksum
    },
    engineExports: Object.fromEntries(exports.map((engineExport, index) => [targets[index], engineExport.validation.status]))
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
