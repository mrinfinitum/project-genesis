import { getScreenDesignerState, screenDesignerInitialRecords, validateScreenDesign, screenHandoffText } from "@/lib/screen-designer";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { appShellId, appShellVersion, mainWorkspaceSlotId } from "@/lib/app-shell";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const state = await getScreenDesignerState();
  assert(state.screens.length >= 14, `Expected at least 14 screen records; received ${state.screens.length}.`);

  for (const screenId of [appShellId, "civilization-command", "dashboard", "production", "research", "buildings", "resources", "upgrades", "civilization", "events", "galaxy", "spaceport", "earth", "solar-system", "discovery", "settings"]) {
    assert(state.records.some((record) => record.screenId === screenId), `Missing screen design record: ${screenId}.`);
  }

  const appShell = state.records.find((record) => record.screenId === appShellId);
  assert(appShell, "NOVERIS App Shell screen design is missing.");
  assert(appShell.screenType === "shell", "NOVERIS App Shell must be marked as screenType=shell.");
  assert(appShell.layoutSpec.panelBounds.some((panel) => panel.id === mainWorkspaceSlotId), "App Shell must define the Main Workspace Slot.");
  assert(appShell.componentSpecs.some((component) => component.componentLibraryId === "TopHudBar"), "App Shell must own TopHudBar.");
  assert(appShell.componentSpecs.some((component) => component.componentLibraryId === "SideNavigationRail"), "App Shell must own SideNavigationRail.");

  const research = state.records.find((record) => record.screenId === "research");
  assert(research, "Research starter screen design is missing.");
  assert(research.componentSpecs.length >= 14, "Research starter design must include the required draft components.");
  assert(research.screenType === "workspace", "Research must be an inner workspace screen.");
  assert(research.shellBinding.shellId === appShellId && research.shellBinding.shellVersion === appShellVersion && research.shellBinding.workspaceSlotId === mainWorkspaceSlotId, "Research must target the App Shell Main Workspace Slot.");
  assert(research.shellBinding.coordinateOrigin === "workspace", "Research must use workspace-local coordinates.");
  assert(research.shellBinding.defaultBuilderMode === "Workspace Only", "Research must default to Workspace Only mode.");
  assert(research.layoutSpec.designWidth === 3244 && research.layoutSpec.designHeight === 1804, "Research workspace must use Main Workspace Slot-local canvas dimensions.");
  assert(research.layoutSpec.coordinateSystem === "hud_overlay_4k", "Research master screen must use hud_overlay_4k coordinates.");
  assert(research.referenceViewport === "3840x2160", "Research master reference viewport must be 3840x2160.");
  assert(research.references.some((reference) => reference.id === "research-master-reference" && reference.source === "/mnt/data/CF773185-E780-4A10-AB7D-421CD15F7D62.jpeg" && reference.notes.includes("opacity 50%") && reference.excludedFromRuntime === true && reference.workspaceCrop?.x === 464 && reference.viewModes?.includes("Workspace Only")), "Research master reference layer metadata is missing.");
  for (const panelId of ["workspace-root", "workspace-background", "local-content-root", "research-branch-sidebar", "research-tree-workspace", "research-detail-panel", "era-timeline", "local-modal-drawer-root", "local-overlay-root"]) {
    assert(research.layoutSpec.panelBounds.some((panel) => panel.id === panelId), `Research master layout is missing panel bounds: ${panelId}.`);
  }
  for (const forbiddenPanelId of ["research-top-hud", "research-left-nav", "top-hud", "left-navigation"]) {
    assert(!research.layoutSpec.panelBounds.some((panel) => panel.id === forbiddenPanelId), `Research must not duplicate shell panel bounds: ${forbiddenPanelId}.`);
  }
  for (const componentId of ["RouteWorkspaceRoot", "WorkspaceBackground", "LocalOverlayRoot", "ResearchBranchSidebar", "ResearchTreeCanvas", "ResearchNode", "ResearchConnection", "ResearchDetailPanel", "ResearchActionButton", "EraResearchTimeline"]) {
    assert(research.componentSpecs.some((component) => component.componentLibraryId === componentId), `Research master screen is missing component placeholder: ${componentId}.`);
  }
  for (const forbiddenComponentId of ["ResearchScreenShell", "TopHudBar", "SideNavigationRail"]) {
    assert(!research.componentSpecs.some((component) => component.componentLibraryId === forbiddenComponentId), `Research must not duplicate shell component: ${forbiddenComponentId}.`);
  }
  assert(research.dataRequirements.some((item) => item.classification === "Canonical Studio Definition" && item.source === "research"), "Research definitions must be mapped as canonical data.");
  assert(research.dataRequirements.some((item) => item.classification === "Player Runtime State" && item.status === "Missing"), "Research player progress must be classified as missing player runtime state.");
  assert(research.assetRequirements.length >= 20, "Research master design must include the required asset requirements.");
  assert(research.assetRequirements.every((item) => item.status === "Pending Upload"), "Research master asset requirements must stay Pending Upload until final assets are supplied.");
  assert(research.interactionSpecs.length >= 13, "Research master design must include the interaction contracts.");
  assert(research.stateSpecs.some((stateSpec) => stateSpec.label === "node locked" && stateSpec.designed), "Research locked node state must be represented.");
  assert(research.responsiveRules.some((rule) => rule.viewport === "1920x1080" && rule.behavior.includes("0.5 scale")), "Research desktop_1080 derivation rule is missing.");
  assert(screenHandoffText(research, "Game Codex").includes("PROJECT GENESIS SCREEN IMPLEMENTATION HANDOFF"), "Research handoff text is not generated.");

  const approvedRecords = state.records.filter((record) => record.approvalStatus === "Approved");
  for (const record of approvedRecords) {
    const validation = validateScreenDesign(record);
    assert(validation.valid, `Approved screen ${record.screenId} failed validation: ${validation.issues.join("; ")}`);
    assert(record.approvedVersion, `Approved screen ${record.screenId} must preserve an approved version.`);
  }

  const runtime = await buildCanonicalRuntimeExportPayload();
  const runtimeText = JSON.stringify(runtime);
  assert(!runtimeText.includes("screenDesigner"), "Screen Designer drafts leaked into runtime export.");
  assert(!runtimeText.includes("Screen Designer"), "Screen Designer labels leaked into runtime export.");

  console.log(JSON.stringify({
    ok: true,
    initialRecords: screenDesignerInitialRecords.length,
    screenRecords: state.screens.length,
    approved: state.stats.approved,
    inDesign: state.stats.inDesign,
    notStarted: state.stats.notStarted,
    blockedByMissingAssets: state.stats.blockedByMissingAssets,
    blockedByMissingData: state.stats.blockedByMissingData,
    researchComponents: research.componentSpecs.length,
    runtimeValidation: runtime.metadata.validationStatus
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
