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
  assert(research.dataRequirements.some((item) => item.classification === "Canonical Studio Definition" && item.source === "research"), "Research definitions must be mapped as canonical data.");
  assert(research.dataRequirements.some((item) => item.classification === "Player Runtime State" && item.status === "Missing"), "Research player progress must be classified as missing player runtime state.");
  assert(research.assetRequirements.length >= 3, "Research starter design must include asset requirements.");
  assert(research.interactionSpecs.length >= 4, "Research starter design must include interaction specs.");
  assert(research.stateSpecs.some((stateSpec) => stateSpec.label === "Locked" && stateSpec.designed), "Research locked state must be represented.");
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
