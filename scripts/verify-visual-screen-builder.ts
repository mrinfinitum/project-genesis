import { appShellBounds, appShellId, blankInnerWorkspaceTemplate, derivedShellProfiles, mainWorkspaceSlotId, visualBuilderModes } from "@/lib/app-shell";
import { getScreenDesignerState } from "@/lib/screen-designer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const state = await getScreenDesignerState();
  const shell = state.records.find((record) => record.screenId === appShellId);
  assert(shell, "App Shell screen record is missing.");
  assert(shell.layoutSpec.designWidth === 3840 && shell.layoutSpec.designHeight === 2160, "App Shell must use the 3840x2160 master canvas.");
  assert(shell.layoutSpec.coordinateSystem === "hud_overlay_4k", "App Shell must use hud_overlay_4k.");
  assert(shell.previewModes.join("|") === visualBuilderModes.join("|"), "App Shell must expose all visual builder modes.");

  const slot = shell.layoutSpec.panelBounds.find((panel) => panel.id === mainWorkspaceSlotId);
  assert(slot, "App Shell Main Workspace Slot bounds are missing.");
  assert(slot.x === appShellBounds.mainWorkspaceSlot.x && slot.y === appShellBounds.mainWorkspaceSlot.y && slot.width === appShellBounds.mainWorkspaceSlot.width && slot.height === appShellBounds.mainWorkspaceSlot.height, "Main Workspace Slot 4K bounds changed unexpectedly.");

  assert(blankInnerWorkspaceTemplate.shellId === appShellId, "Blank Inner Workspace template must reference App Shell.");
  assert(blankInnerWorkspaceTemplate.workspaceSlotId === mainWorkspaceSlotId, "Blank Inner Workspace template must target Main Workspace Slot.");
  assert(blankInnerWorkspaceTemplate.layers.includes("local content root"), "Blank Inner Workspace template is missing local content root.");
  assert(blankInnerWorkspaceTemplate.forbiddenChildren.includes("Top HUD") && blankInnerWorkspaceTemplate.forbiddenChildren.includes("Left Navigation"), "Blank Inner Workspace template must forbid global shell children.");

  for (const profileId of ["desktop_4k", "desktop_1440", "desktop_1080", "desktop_720", "ios_landscape", "android_landscape", "tablet_landscape"]) {
    assert(derivedShellProfiles.some((profile) => profile.id === profileId), `Missing derived shell profile ${profileId}.`);
  }
  const desktop1080 = derivedShellProfiles.find((profile) => profile.id === "desktop_1080");
  assert(desktop1080?.scale === 0.5, "desktop_1080 profile must derive at 0.5 scale.");
  assert(desktop1080.workspaceBounds.width === Math.round(appShellBounds.mainWorkspaceSlot.width * 0.5), "desktop_1080 workspace width is not derived from 4K shell bounds.");

  for (const screenId of ["civilization-command", "buildings", "research", "upgrades", "civilization", "events", "galaxy", "spaceport"]) {
    const screen = state.records.find((record) => record.screenId === screenId);
    assert(screen, `Missing workspace screen ${screenId}.`);
    assert(screen.previewModes.includes("Workspace Only"), `${screenId} is missing Workspace Only mode.`);
    assert(screen.previewModes.includes("Shell Context"), `${screenId} is missing Shell Context mode.`);
    assert(screen.previewModes.includes("Full Composition Preview"), `${screenId} is missing Full Composition Preview mode.`);
    assert(screen.shellBinding.coordinateOrigin === "workspace", `${screenId} must use workspace-local coordinates.`);
  }

  console.log(JSON.stringify({
    ok: true,
    shellId: shell.screenId,
    builderModes: visualBuilderModes,
    blankTemplate: blankInnerWorkspaceTemplate.id,
    derivedProfiles: derivedShellProfiles.map((profile) => profile.id),
    workspaceSlot: slot
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
