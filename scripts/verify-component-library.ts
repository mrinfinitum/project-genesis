import { createHash } from "node:crypto";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { componentCategories, componentHandoffText, componentLibraryInitialRecords, getComponentLibraryState, validateComponentDesign } from "@/lib/component-library";
import { generatedComponentPreviewIds, isGeneratedComponentPreviewId } from "@/lib/component-preview-generation";
import { getScreenDesignerState } from "@/lib/screen-designer";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function checksum(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function assertPublicPreviewFile(source: string, expectedChecksum?: string) {
  assert(source.startsWith("/assets/component-previews/"), `Generated preview source must be a public component preview path: ${source}.`);
  assert(!source.includes("/Users/"), `Generated preview leaked a private path: ${source}.`);
  assert(!source.includes("studio-private://"), `Generated preview leaked a private Studio URI: ${source}.`);
  const filePath = path.join(process.cwd(), "public", source.replace(/^\//, ""));
  const info = await stat(filePath);
  assert(info.isFile(), `Generated preview file is missing: ${source}.`);
  const content = await readFile(filePath, "utf8");
  assert(content.startsWith("<svg"), `Generated preview file is not SVG content: ${source}.`);
  if (expectedChecksum) {
    assert(checksum(content) === expectedChecksum, `Generated preview checksum mismatch for ${source}.`);
  }
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

  const generatedRecords = componentState.records.filter((record) => isGeneratedComponentPreviewId(record.componentId));
  assert(generatedRecords.length === generatedComponentPreviewIds.length, `Expected ${generatedComponentPreviewIds.length} generated component preview records; received ${generatedRecords.length}.`);
  assert(componentState.stats.componentPreviewsPending === 0, `Generated component preview pending count should be 0; received ${componentState.stats.componentPreviewsPending}.`);
  assert(componentState.stats.componentPreviewsGenerated === generatedComponentPreviewIds.length, `Generated component preview count should be ${generatedComponentPreviewIds.length}.`);
  assert(componentState.stats.componentPreviewsNeedsReview === generatedComponentPreviewIds.length, `Generated previews should remain Needs Review until human approval.`);

  for (const record of generatedRecords) {
    const generatedReference = record.references.find((reference) => reference.captureSource === "Studio-rendered component specimen");
    assert(generatedReference, `${record.componentId} is missing generated Studio specimen metadata.`);
    assert(generatedReference.previewStatus === "Needs Review", `${record.componentId} generated preview must be Needs Review.`);
    assert(generatedReference.approvalStatus !== "Approved", `${record.componentId} generated preview must not be auto-approved.`);
    assert(generatedReference.width && generatedReference.width > 0, `${record.componentId} generated preview is missing width.`);
    assert(generatedReference.height && generatedReference.height > 0, `${record.componentId} generated preview is missing height.`);
    assert(Boolean(generatedReference.checksum), `${record.componentId} generated preview is missing checksum.`);
    assert((generatedReference.outputs?.length ?? 0) >= 4, `${record.componentId} generated preview is missing derivative output records.`);
    assert((generatedReference.captureBlockers?.length ?? 0) > 0, `${record.componentId} should record implementation screenshot capture blockers.`);
    await assertPublicPreviewFile(generatedReference.source, generatedReference.checksum);
    for (const output of generatedReference.outputs ?? []) {
      assert(output.width > 0 && output.height > 0, `${record.componentId} output ${output.role} is missing dimensions.`);
      assert(Boolean(output.checksum), `${record.componentId} output ${output.role} is missing checksum.`);
      await assertPublicPreviewFile(output.source, output.checksum);
    }
  }

  for (const component of componentState.components) {
    if (component.visualPreview.status === "Missing") {
      const record = componentState.records.find((item) => item.componentId === component.componentId);
      const blockers = record?.assetKeys.filter((asset) => asset.required && asset.status !== "Ready") ?? [];
      assert(blockers.length > 0, `Component ${component.componentId} resolved to Missing Preview without a recorded asset blocker.`);
    }
  }

  for (const componentId of ["SideNavigationRail", "TopHudBar", "HudEconomySlot", "ClickPowerControl", "AutoClickControl", "BottomDrawer", "EraNode", "ImageBackedActionButton", "EconomyCounter", "UnlockRequirementList"]) {
    assert(componentState.records.some((record) => record.componentId === componentId), `Missing seeded Dashboard/shared component: ${componentId}.`);
  }
  for (const componentId of ["AiAgentPortrait", "AiAgentPanel", "AiAgentStatus", "AiAgentSelector", "AiAgentCard", "AiAgentVariantCard", "AiAgentExpressionPreview", "AiAgentBlinkPreview"]) {
    const record = componentState.records.find((item) => item.componentId === componentId);
    assert(record, `Missing seeded AI Agent component: ${componentId}.`);
    assert(record.dataInputs.some((input) => input.id === "aiAgentId" || input.id === "aiAgents" || input.id === "aiAgentVariantId" || input.id === "aiAgentVariant" || input.id === "animationProfile"), `${componentId} must consume AI Agent canonical data.`);
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
    componentPreviewsPending: componentState.stats.componentPreviewsPending,
    componentPreviewsGenerated: componentState.stats.componentPreviewsGenerated,
    componentPreviewsNeedsReview: componentState.stats.componentPreviewsNeedsReview,
    componentPreviewsBlockedByMissingBrowserCapture: componentState.stats.componentPreviewsBlockedByMissingBrowserCapture,
    screenReferences: screenComponentRefs.length,
    runtimeValidation: runtime.metadata.validationStatus
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
