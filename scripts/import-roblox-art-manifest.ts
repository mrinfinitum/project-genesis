import { readFile } from "node:fs/promises";
import path from "node:path";
import { applyAssetProductionAction, type RobloxArtManifest, type RobloxArtManifestImportReport } from "@/lib/assets/asset-production";
import { getEraArtSummaryByEra } from "@/lib/assets/era-art-inventory";
import { buildProductionPlan } from "@/lib/production/planner";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getGameData } from "@/lib/data";

function manifestPath() {
  const input = process.argv[2] ?? "Roblox/art-export/roblox-art-manifest.json";
  return path.resolve(process.cwd(), input);
}

async function main() {
  const inputPath = manifestPath();
  const previewOnly = process.argv.includes("--preview");
  const sourceRoot = path.resolve(path.dirname(inputPath), "..");
  const manifest = JSON.parse(await readFile(inputPath, "utf8")) as RobloxArtManifest;
  const preview = await applyAssetProductionAction({
    action: "roblox_manifest.import.preview",
    payload: {
      manifest,
      manifestPath: inputPath,
      sourceRoot,
      sourceProject: "Project Genesis Roblox"
    }
  }) as RobloxArtManifestImportReport;

  const report = previewOnly
    ? preview
    : await applyAssetProductionAction({
        action: "roblox_manifest.import",
        payload: {
          manifest,
          manifestPath: inputPath,
          sourceRoot,
          sourceProject: "Project Genesis Roblox"
        }
      }) as RobloxArtManifestImportReport;

  const [eraCompletion, productionState, data] = await Promise.all([
    getEraArtSummaryByEra(),
    getAssetProductionState(),
    getGameData()
  ]);
  const productionPlan = buildProductionPlan(data, productionState, eraCompletion);

  console.log(JSON.stringify({
    importedAssets: report.importedAssets,
    previewedBeforeMutation: true,
    applied: !previewOnly,
    preview: {
      importedAssets: preview.importedAssets,
      matchedAssets: preview.matchedAssets,
      newAssets: preview.newAssets,
      duplicateAssets: preview.duplicateAssets,
      sourceFilesCreated: preview.sourceFilesCreated,
      robloxOnlyAssets: preview.robloxOnlyAssets,
      placeholderAssets: preview.placeholderAssets.length,
      missingSourceFiles: preview.missingSourceFiles?.length ?? 0,
      assetsNeedingWebPublication: preview.assetsNeedingWebPublication?.length ?? 0,
      conflicts: preview.conflicts.length
    },
    matchedAssets: report.matchedAssets,
    newAssets: report.newAssets,
    duplicateAssets: report.duplicateAssets,
    sourceFilesCreated: report.sourceFilesCreated,
    robloxOnlyAssets: report.robloxOnlyAssets,
    placeholderAssets: report.placeholderAssets.length,
    missingSourceFiles: report.missingSourceFiles?.length ?? 0,
    assetsNeedingWebPublication: report.assetsNeedingWebPublication?.length ?? 0,
    unusedStudioAssets: report.unusedStudioAssets.length,
    unusedLocalFiles: report.unusedLocalFiles.length,
    conflicts: report.conflicts.length,
    updatedEraCompletion: Object.entries(eraCompletion).map(([eraId, summary]) => ({
      eraId,
      completionPercent: summary.required ? Math.round((summary.complete / summary.required) * 100) : 0,
      status: summary.status
    })),
    updatedProductionDashboard: {
      totalAssets: productionState.dashboard.totalAssets,
      sourceFilesUploaded: productionState.dashboard.sourceFilesUploaded,
      missingAssets: productionState.dashboard.missingAssets,
      engineMappingsIncomplete: productionState.dashboard.engineMappingsIncomplete,
      overallCompletion: productionPlan.overallCompletion,
      highPriorityWorkItems: productionPlan.workQueue.High.length,
      criticalWorkItems: productionPlan.workQueue.Critical.length
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
