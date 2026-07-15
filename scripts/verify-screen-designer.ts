import { getScreenDesignerState, screenDesignerInitialRecords, validateScreenDesign, screenHandoffText } from "@/lib/screen-designer";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const state = await getScreenDesignerState();
  assert(state.screens.length >= 14, `Expected at least 14 screen records; received ${state.screens.length}.`);

  for (const screenId of ["dashboard", "production", "research", "buildings", "resources", "upgrades", "civilization", "events", "galaxy", "spaceport", "earth", "solar-system", "discovery", "settings"]) {
    assert(state.records.some((record) => record.screenId === screenId), `Missing screen design record: ${screenId}.`);
  }

  const research = state.records.find((record) => record.screenId === "research");
  assert(research, "Research starter screen design is missing.");
  assert(research.componentSpecs.length >= 14, "Research starter design must include the required draft components.");
  assert(research.layoutSpec.designWidth === 3840 && research.layoutSpec.designHeight === 2160, "Research master screen must use the 3840x2160 4K canvas.");
  assert(research.layoutSpec.coordinateSystem === "hud_overlay_4k", "Research master screen must use hud_overlay_4k coordinates.");
  assert(research.referenceViewport === "3840x2160", "Research master reference viewport must be 3840x2160.");
  assert(research.references.some((reference) => reference.id === "research-master-reference" && reference.source === "/mnt/data/CF773185-E780-4A10-AB7D-421CD15F7D62.jpeg" && reference.notes.includes("opacity 50%") && reference.notes.includes("excluded from runtime export")), "Research master reference layer metadata is missing.");
  for (const panelId of ["research-top-hud", "research-left-nav", "research-branch-sidebar", "research-tree-workspace", "research-detail-panel", "era-timeline", "modal-layer", "overlay-layer"]) {
    assert(research.layoutSpec.panelBounds.some((panel) => panel.id === panelId), `Research master layout is missing panel bounds: ${panelId}.`);
  }
  for (const componentId of ["ResearchScreenShell", "ResearchBranchSidebar", "ResearchTreeCanvas", "ResearchNode", "ResearchConnection", "ResearchDetailPanel", "ResearchActionButton", "EraResearchTimeline"]) {
    assert(research.componentSpecs.some((component) => component.componentLibraryId === componentId), `Research master screen is missing component placeholder: ${componentId}.`);
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
