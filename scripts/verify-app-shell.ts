import { appShellBounds, appShellId, appShellVersion, fullScreenTakeoverTypes, mainWorkspaceSlotId, navigationContract, normalWorkspaceScreenIds } from "@/lib/app-shell";
import { getComponentLibraryState } from "@/lib/component-library";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { getScreenDesignerState } from "@/lib/screen-designer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const [screenState, componentState, runtime] = await Promise.all([
    getScreenDesignerState(),
    getComponentLibraryState(),
    buildCanonicalRuntimeExportPayload()
  ]);

  const shellRecords = screenState.records.filter((record) => record.screenType === "shell");
  assert(shellRecords.length === 1, `Expected exactly one primary App Shell; received ${shellRecords.length}.`);
  const shell = shellRecords[0];
  assert(shell.screenId === appShellId, `Primary App Shell must be ${appShellId}.`);
  assert(shell.layoutSpec.panelBounds.some((panel) => panel.id === mainWorkspaceSlotId), "Main Workspace Slot is missing from App Shell layout.");
  assert(shell.layoutSpec.panelBounds.some((panel) => panel.id === "top-civilization-hud"), "Top Civilization HUD bounds are missing.");
  assert(shell.layoutSpec.panelBounds.some((panel) => panel.id === "left-navigation-rail"), "Left Navigation Rail bounds are missing.");
  assert(shell.componentSpecs.some((component) => component.componentLibraryId === "TopHudBar"), "App Shell must own TopHudBar.");
  assert(shell.componentSpecs.some((component) => component.componentLibraryId === "SideNavigationRail"), "App Shell must own SideNavigationRail.");
  assert(shell.componentSpecs.some((component) => component.componentLibraryId === "MainWorkspaceSlot"), "App Shell must own MainWorkspaceSlot.");

  for (const screenId of normalWorkspaceScreenIds) {
    const record = screenState.records.find((item) => item.screenId === screenId);
    assert(record, `Missing normal workspace screen ${screenId}.`);
    assert(record.screenType === "workspace", `${screenId} must be a workspace screen.`);
    assert(record.shellBinding.shellId === appShellId, `${screenId} must reference the App Shell.`);
    assert(record.shellBinding.shellVersion === appShellVersion, `${screenId} shell version mismatch.`);
    assert(record.shellBinding.workspaceSlotId === mainWorkspaceSlotId, `${screenId} must target Main Workspace Slot.`);
    assert(record.shellBinding.presentationMode === "shell_workspace", `${screenId} must use shell_workspace presentation.`);
    assert(record.shellBinding.coordinateOrigin === "workspace", `${screenId} must use workspace-local coordinates.`);
    assert(record.navigationMetadata?.workspaceTarget === mainWorkspaceSlotId, `${screenId} navigation metadata must target Main Workspace Slot.`);
    assert(!record.componentSpecs.some((component) => component.componentLibraryId === "TopHudBar" || component.componentLibraryId === "SideNavigationRail"), `${screenId} duplicates shell-owned HUD or navigation components.`);
    for (const panel of record.layoutSpec.panelBounds) {
      if (panel.width <= appShellBounds.mainWorkspaceSlot.width && panel.height <= appShellBounds.mainWorkspaceSlot.height) continue;
      assert(panel.id === "reference" || panel.id === "research-master-reference", `${screenId} panel ${panel.id} exceeds Main Workspace Slot local bounds.`);
    }
  }

  for (const takeover of screenState.records.filter((record) => record.screenType === "full_screen_takeover")) {
    assert(takeover.shellBinding.presentationMode === "full_screen_takeover", `${takeover.screenId} takeover must use full_screen_takeover presentation.`);
    assert(Boolean(takeover.shellBinding.fullScreenTakeoverReason), `${takeover.screenId} takeover reason is missing.`);
    assert(fullScreenTakeoverTypes.includes(String(takeover.shellBinding.fullScreenTakeoverReason)), `${takeover.screenId} takeover reason is not approved.`);
  }

  const appShellComponents = ["NoverisAppShell", "TopHudBar", "SideNavigationRail", "MainWorkspaceSlot", "GlobalOverlayRoot", "RouteWorkspaceRoot", "WorkspaceBackground", "LocalOverlayRoot", "FullScreenTakeover"];
  for (const componentId of appShellComponents) {
    assert(componentState.records.some((record) => record.componentId === componentId), `Component Library is missing ${componentId}.`);
  }

  for (const route of navigationContract) {
    assert(screenState.records.some((record) => record.screenId === route.screenId), `Navigation contract target does not resolve: ${route.screenId}.`);
  }

  const runtimeText = JSON.stringify(runtime);
  for (const forbidden of [appShellId, mainWorkspaceSlotId, "Screen Designer", "Component Library", "Research Master Reference", "/mnt/data/", "/Users/"]) {
    assert(!runtimeText.includes(forbidden), `Draft shell/screen builder content leaked into public runtime: ${forbidden}.`);
  }

  console.log(JSON.stringify({
    ok: true,
    shellId: shell.screenId,
    shellVersion: appShellVersion,
    workspaceSlot: appShellBounds.mainWorkspaceSlot,
    migratedScreens: normalWorkspaceScreenIds.length,
    fullScreenTakeovers: screenState.records.filter((record) => record.screenType === "full_screen_takeover").length,
    navigationTargets: navigationContract.length,
    runtimeContentVersion: runtime.metadata.contentVersion,
    runtimeValidation: runtime.metadata.validationStatus
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
