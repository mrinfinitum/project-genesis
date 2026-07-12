import { buildCanonicalRuntimeExportPayload, buildRobloxRuntimePayload } from "@/lib/runtime/game-runtime";
import { applyAssetProductionAction, getAssetProductionState, type RobloxArtWebPublishReport } from "@/lib/assets/asset-production";

async function main() {
  const sourceRoot = process.argv[2] || "/Users/geofftracy/Projects/neo-city-tycoon/Roblox";
  const before = await buildCanonicalRuntimeExportPayload();
  const report = await applyAssetProductionAction({
    action: "roblox_web.publish",
    payload: { sourceRoot }
  }) as RobloxArtWebPublishReport;
  const after = await buildCanonicalRuntimeExportPayload();
  const roblox = buildRobloxRuntimePayload(after);
  const state = await getAssetProductionState();
  const serialized = JSON.stringify(after);

  if (serialized.includes("/Users/") || serialized.includes("studio-private://") || serialized.includes("C:\\")) {
    throw new Error("Private source path leaked into public canonical runtime export.");
  }

  console.log(JSON.stringify({
    webMappingsCreated: report.webMappingsCreated,
    dashboardAssetsWebReady: report.dashboardAssetsWebReady,
    dashboardAssetsTotal: report.dashboardAssetsTotal,
    assetsStillMissingWebDerivatives: report.missingWebDerivatives.length,
    placeholderCount: report.placeholders.length,
    unresolvedConflictCount: report.unresolvedConflicts.length,
    sourceMissingTasks: report.sourceMissingTasks.length,
    placeholderTasks: report.placeholderTasks.length,
    copiedFiles: report.copiedFiles.length,
    skippedFiles: report.skippedFiles.length,
    previousContentVersion: before.metadata.contentVersion,
    newContentVersion: after.metadata.contentVersion,
    previousChecksum: before.metadata.checksum,
    newChecksum: after.metadata.checksum,
    canonicalRuntime: after.metadata.validationStatus,
    robloxRuntime: roblox.metadata.validationStatus,
    productionDashboard: state.dashboard
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
