import path from "node:path";
import { readFile } from "node:fs/promises";

process.env.PROJECT_GENESIS_ASSET_PRODUCTION_STORE ??= path.join("/private/tmp", "project-genesis-visual-preview-assets.json");
process.env.PROJECT_GENESIS_SCREEN_DESIGNER_STORE ??= path.join("/private/tmp", "project-genesis-visual-preview-screens.json");
process.env.PROJECT_GENESIS_COMPONENT_LIBRARY_STORE ??= path.join("/private/tmp", "project-genesis-visual-preview-components.json");

type ProductionAsset = import("@/lib/assets/asset-production").ProductionAsset;

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function mockAsset(overrides: Partial<ProductionAsset> = {}): ProductionAsset {
  return {
    id: "asset_visual_verify",
    name: "Visual Verify Asset",
    type: "image",
    category: "ui",
    artKey: "visual_verify_asset",
    iconKey: "visual_verify_icon",
    audioKey: "",
    modelKey: "",
    description: "Verifier asset.",
    status: "draft",
    productionStatus: "in_progress",
    approvalStatus: "pending",
    reviewEvents: [],
    sourceFiles: [],
    variants: [],
    derivatives: [],
    platformMappings: {},
    usageReferences: [],
    requirementProfileId: "ui_requirement_profile",
    tags: [],
    aliases: [],
    notes: "",
    completionPercent: 0,
    missingRequirements: ["preview"],
    createdAt: "",
    updatedAt: "",
    approvedAt: "",
    publishedAt: "",
    publishBlockers: [],
    optionalMissingRequirements: [],
    historyEvents: [],
    masterSourceStatus: "missing",
    currentMasterSourceId: null,
    derivativeCompleteness: { required: 1, current: 0, stale: 0, missing: 1, published: 0 },
    qualityIssues: [],
    ...overrides
  };
}

async function main() {
  const visual = await import("@/lib/assets/visual-previews");
  const assetProduction = await import("@/lib/assets/asset-production");
  const screenDesigner = await import("@/lib/screen-designer");
  const componentLibrary = await import("@/lib/component-library");

  assert(visual.sanitizePreviewUrl("/Users/geoff/private/source.png") === "", "Private /Users paths must be sanitized.");
  assert(visual.sanitizePreviewUrl("studio-private://asset/source.psd") === "", "studio-private URLs must be sanitized.");
  assert(visual.sanitizePreviewUrl("rbxassetid://123") === "", "Roblox asset IDs must not render directly in browser previews.");
  assert(visual.sanitizePreviewUrl("/assets/published/card.webp") === "/assets/published/card.webp", "Safe public paths should survive sanitization.");

  const orderedAsset = mockAsset({
    approvalStatus: "approved",
    sourceFiles: [{
      id: "source_primary",
      assetId: "asset_visual_verify",
      filename: "visual.psd",
      extension: ".psd",
      mimeType: "image/vnd.adobe.photoshop",
      storagePath: "studio-private://visual.psd",
      fileSizeBytes: 100,
      checksum: "source",
      version: 1,
      versionLabel: "v1",
      uploadedAt: "",
      uploadedBy: "verify",
      isCurrent: true,
      previewUrl: "/assets/previews/primary.webp",
      previewStatus: "ready",
      width: 512,
      height: 512,
      notes: "",
      isPrimaryPreview: true,
      masterFormat: "PSD",
      sourceRole: "master"
    }],
    derivatives: [{
      id: "derivative_approved",
      assetId: "asset_visual_verify",
      sourceFileId: "source_primary",
      derivativeType: "card",
      format: "WebP",
      width: 256,
      height: 256,
      aspectRatio: "1:1",
      quality: 92,
      storagePath: "/assets/previews/derivative.webp",
      publicUrl: "/assets/previews/derivative.webp",
      checksum: "derivative",
      generatedAt: "",
      generationMethod: "manual",
      status: "ready",
      approvalStatus: "approved",
      publishStatus: "ready",
      derivativeStatus: "current"
    }]
  });
  const orderedPreview = visual.resolveProductionAssetPreview(orderedAsset);
  assert(orderedPreview.source === "approved_primary_preview", "Primary preview must win over approved derivative.");
  assert(orderedPreview.url === "/assets/previews/primary.webp", "Primary preview URL should be selected.");

  const stalePreview = visual.resolveProductionAssetPreview(mockAsset({
    derivatives: [{
      id: "derivative_stale",
      assetId: "asset_visual_verify",
      sourceFileId: null,
      derivativeType: "card",
      format: "WebP",
      width: 128,
      height: 128,
      aspectRatio: "1:1",
      quality: 92,
      storagePath: "/assets/previews/stale.webp",
      publicUrl: "/assets/previews/stale.webp",
      checksum: "stale",
      generatedAt: "",
      generationMethod: "manual",
      status: "ready",
      approvalStatus: "approved",
      publishStatus: "stale",
      staleSince: "2026-07-13T00:00:00.000Z",
      staleReason: "New source version uploaded",
      derivativeStatus: "stale"
    }]
  }));
  assert(stalePreview.status === "Stale" || stalePreview.status === "Missing", "Stale derivative must not be treated as a clean current preview.");

  const missingPreview = visual.resolveProductionAssetPreview(mockAsset());
  assert(missingPreview.status === "Missing", "Missing asset must resolve to missing preview state.");
  assert(missingPreview.url === "", "Missing preview must not emit a broken image URL.");
  assert(Boolean(missingPreview.requirement?.actionLabel), "Missing preview should include a direct action.");

  const webMappedPreview = visual.resolveProductionAssetPreview(mockAsset({
    platformMappings: { web: { path: "/assets/roblox-art/asset_dashboard_background/asset_dashboard_background.png", status: "published" } }
  }));
  assert(webMappedPreview.status === "Published", "A valid Web mapping must be enough to render a preview.");
  assert(webMappedPreview.url.includes("asset_dashboard_background"), "Web-mapped preview should use the published path.");

  const aliasAsset = mockAsset({
    id: "asset_dashboard_background",
    name: "Dashboard Background",
    artKey: "dashboard_background",
    aliases: ["assets/UI/hud_background_1920x1080.png"],
    platformMappings: { web: { path: "/assets/roblox-art/asset_dashboard_background/asset_dashboard_background.png" } }
  });
  const aliasMatch = visual.findAssetForPreviewKeys([aliasAsset], ["dashboard_hero"]);
  assert(aliasMatch?.id === "asset_dashboard_background", "Screen design aliases should resolve to imported canonical assets.");

  const assetState = await assetProduction.getAssetProductionState();
  assert(assetState.visualPreviewReport.totalVisualRecords >= assetState.assets.length, "Visual preview report must cover asset records.");
  assert(assetState.derivativePresets.some((preset) => preset.id === "preview_card_256_webp"), "Preview derivative presets must be registered.");

  const source = await readFile(path.join(process.cwd(), "components", "asset-preview.tsx"), "utf8");
  assert(source.includes('loading="lazy"'), "AssetPreview images must lazy-load.");
  assert(source.includes("MissingPreview"), "AssetPreview must render a missing state instead of broken images.");
  assert(source.includes("Escape"), "Preview modal should close with Escape.");

  await screenDesigner.addScreenReference({
    screenId: "dashboard",
    source: "/assets/previews/dashboard-reference.webp",
    type: "reference UI",
    viewport: "1920x1080",
    notes: "Verifier screenshot."
  });
  const screenState = await screenDesigner.getScreenDesignerState(assetState);
  const dashboard = screenState.screens.find((screen) => screen.screenId === "dashboard");
  assert(dashboard?.visualPreview.status !== "Missing", "Screen Designer card preview should resolve after adding reference metadata.");
  assert(dashboard?.visualPreview.mode === "screenshot", "Screen Designer preview mode should be screenshot.");

  await componentLibrary.addComponentReference({
    componentId: "PrimaryActionButton",
    source: "/assets/previews/primary-action-button.webp",
    type: "annotated reference",
    viewport: "1920x1080",
    notes: "Verifier component preview."
  });
  const componentState = await componentLibrary.getComponentLibraryState(assetState);
  const button = componentState.components.find((component) => component.componentId === "PrimaryActionButton");
  assert(button?.visualPreview.status !== "Missing", "Component card preview should resolve after adding reference metadata.");
  assert(button?.visualPreview.mode === "variant_grid", "Component preview mode should be variant grid.");

  const report = visual.buildVisualPreviewReport({
    assets: assetState.assets,
    screenPreviews: screenState.screens.map((screen) => screen.visualPreview),
    componentPreviews: componentState.components.map((component) => component.visualPreview)
  });
  assert(report.totalVisualRecords > 0, "Combined visual preview report must include records.");
  assert(report.parityReferencesMissing >= 0, "Parity missing metric must be present.");

  console.log(JSON.stringify({
    ok: true,
    previewPresets: assetState.derivativePresets.filter((preset) => preset.id.startsWith("preview_") || preset.id.startsWith("screen_preview_")).length,
    visualRecords: assetState.visualPreviewReport.totalVisualRecords,
    previewReady: assetState.visualPreviewReport.previewReady,
    previewMissing: assetState.visualPreviewReport.previewMissing,
    screenPreview: dashboard?.visualPreview.status,
    componentPreview: button?.visualPreview.status,
    combinedReport: {
      totalVisualRecords: report.totalVisualRecords,
      missing: report.previewMissing,
      stale: report.previewStale,
      parityReferencesMissing: report.parityReferencesMissing
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
