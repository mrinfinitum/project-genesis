import { appShellId, mainWorkspaceSlotId } from "@/lib/app-shell";
import { getScreenDesignerState } from "@/lib/screen-designer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const state = await getScreenDesignerState();
  const research = state.records.find((record) => record.screenId === "research");
  assert(research, "Research screen is missing.");
  assert(research.screenType === "workspace", "Research must be a workspace screen.");
  assert(research.shellBinding.shellId === appShellId, "Research must reference the App Shell.");
  assert(research.shellBinding.workspaceSlotId === mainWorkspaceSlotId, "Research must target Main Workspace Slot.");
  assert(research.shellBinding.defaultBuilderMode === "Workspace Only", "Research default builder mode must be Workspace Only.");
  assert(research.navigationMetadata?.navigationId === "research", "Research navigation metadata is missing.");

  const panelIds = new Set(research.layoutSpec.panelBounds.map((panel) => panel.id));
  for (const requiredPanel of ["workspace-root", "workspace-background", "local-content-root", "research-header", "research-branch-sidebar", "research-tree-workspace", "research-detail-panel", "era-timeline", "local-modal-drawer-root", "local-overlay-root"]) {
    assert(panelIds.has(requiredPanel), `Research workspace is missing panel ${requiredPanel}.`);
  }
  for (const forbiddenPanel of ["top-hud", "research-top-hud", "left-navigation", "research-left-nav", "modal-layer", "overlay-layer"]) {
    assert(!panelIds.has(forbiddenPanel), `Research still contains duplicated shell/global panel ${forbiddenPanel}.`);
  }

  const componentIds = new Set(research.componentSpecs.map((component) => component.componentLibraryId));
  for (const requiredComponent of ["RouteWorkspaceRoot", "WorkspaceBackground", "LocalOverlayRoot", "ResearchHeader", "ResearchBranchSidebar", "ResearchTreeCanvas", "ResearchDetailPanel", "EraResearchTimeline"]) {
    assert(componentIds.has(requiredComponent), `Research workspace is missing component ${requiredComponent}.`);
  }
  for (const forbiddenComponent of ["ResearchScreenShell", "TopHudBar", "SideNavigationRail"]) {
    assert(!componentIds.has(forbiddenComponent), `Research still duplicates shell/global component ${forbiddenComponent}.`);
  }

  const reference = research.references.find((item) => item.id === "research-master-reference");
  assert(reference, "Research master reference is missing.");
  assert(reference.excludedFromRuntime === true, "Research reference must be excluded from runtime.");
  assert(reference.workspaceCrop?.x === 464 && reference.workspaceCrop.y === 260 && reference.workspaceCrop.width === 3244 && reference.workspaceCrop.height === 1804, "Research workspace crop must align to Main Workspace Slot.");
  assert(reference.viewModes?.includes("Full Reference") && reference.viewModes.includes("Workspace Only"), "Research reference must support Full Reference and Workspace Only views.");
  assert(research.notes.some((note) => note.includes("TopHudBar") && note.includes("SideNavigationRail")), "Research notes must explicitly state that shell components are not duplicated.");

  console.log(JSON.stringify({
    ok: true,
    screenId: research.screenId,
    shellId: research.shellBinding.shellId,
    workspaceSlotId: research.shellBinding.workspaceSlotId,
    builderModes: research.previewModes,
    localPanelCount: research.layoutSpec.panelBounds.length,
    componentCount: research.componentSpecs.length,
    referenceCrop: reference.workspaceCrop
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
