import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { componentCategories, componentHandoffText, componentLibraryInitialRecords, getComponentLibraryState, validateComponentDesign } from "@/lib/component-library";
import { getScreenDesignerState } from "@/lib/screen-designer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const [componentState, screenState, runtime] = await Promise.all([
    getComponentLibraryState(),
    getScreenDesignerState(),
    buildCanonicalRuntimeExportPayload()
  ]);

  assert(componentState.components.length >= 50, `Expected at least 50 component records; received ${componentState.components.length}.`);
  assert(componentLibraryInitialRecords.length === componentState.components.length, "Initial component record count and resolved component count diverged.");

  const ids = componentState.records.map((record) => record.componentId);
  assert(new Set(ids).size === ids.length, "Component IDs must be unique.");
  for (const record of componentState.records) {
    assert(componentCategories.includes(record.category), `Invalid component category for ${record.componentId}: ${record.category}.`);
    assert(record.designTokens.length > 0, `${record.componentId} is missing design token references.`);
    assert(record.states.length > 0, `${record.componentId} is missing state matrix.`);
    assert(record.implementationTargets.length >= 5, `${record.componentId} is missing implementation target tracking.`);
    assert(record.responsiveRules.length >= 6, `${record.componentId} is missing responsive rules.`);
    assert(!JSON.stringify(record).includes("/Users/"), `${record.componentId} leaked a private local path.`);
    assert(!JSON.stringify(record).includes("studio-private://"), `${record.componentId} leaked a private Studio URI.`);
    const validation = validateComponentDesign(record);
    if (record.approvalStatus === "Approved") {
      assert(validation.valid, `Approved component ${record.componentId} failed validation: ${validation.issues.join("; ")}`);
    }
  }

  for (const componentId of ["SideNavigationRail", "TopHudBar", "HudEconomySlot", "ClickPowerControl", "AutoClickControl", "BottomDrawer", "EraNode", "ImageBackedActionButton", "EconomyCounter", "UnlockRequirementList"]) {
    assert(componentState.records.some((record) => record.componentId === componentId), `Missing seeded Dashboard/shared component: ${componentId}.`);
  }

  const screenIds = new Set(screenState.screens.map((screen) => screen.screenId));
  for (const record of componentState.records) {
    for (const usage of record.screenUsages) {
      assert(screenIds.has(usage.screenId), `${record.componentId} references missing screen ${usage.screenId}.`);
    }
  }

  const screenComponentRefs = screenState.records.flatMap((screen) => screen.componentSpecs.map((component) => component.componentLibraryId).filter(Boolean));
  const componentIds = new Set(componentState.records.map((record) => record.componentId));
  for (const componentId of screenComponentRefs) {
    assert(componentIds.has(String(componentId)), `Screen Designer references missing component library record ${componentId}.`);
  }

  const eraNode = componentState.records.find((record) => record.componentId === "EraNode");
  assert(eraNode, "EraNode component is missing.");
  assert(eraNode.anatomy.some((part) => part.id === "connector-anchor"), "EraNode must include connector anchor anatomy.");
  assert(eraNode.variants.some((variant) => variant.id === "current"), "EraNode current variant is missing.");

  const handoff = componentHandoffText(eraNode, "Game Codex");
  assert(handoff.includes("PROJECT GENESIS COMPONENT IMPLEMENTATION HANDOFF"), "Component handoff text was not generated.");
  assert(handoff.includes("Canonical component ID: EraNode"), "Component handoff is missing canonical ID.");

  const runtimeText = JSON.stringify(runtime);
  assert(!runtimeText.includes("componentLibrary"), "Component Library drafts leaked into runtime export.");
  assert(!runtimeText.includes("Component Library"), "Component Library labels leaked into runtime export.");

  console.log(JSON.stringify({
    ok: true,
    initialRecords: componentLibraryInitialRecords.length,
    componentRecords: componentState.components.length,
    categories: componentCategories.length,
    inDesign: componentState.stats.inDesign,
    implemented: componentState.stats.implemented,
    missingAssets: componentState.stats.missingAssets,
    missingStates: componentState.stats.missingStates,
    screenReferences: screenComponentRefs.length,
    runtimeValidation: runtime.metadata.validationStatus
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
