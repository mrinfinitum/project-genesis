import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import {
  civilizationOperationsDeckContract,
  type OperationsAssetStatus
} from "@/lib/assets/civilization-operations-deck";

const SOURCE_ROOT = path.join(process.cwd(), "source-masters", "ui", "hud", "civilization-operations");

const sourceSlots = [
  { id: "operations-deck", directory: "01_operations-deck", displayName: "Operations Deck" },
  { id: "active-actions", directory: "02_active-actions", displayName: "Active Actions" },
  { id: "next-priorities", directory: "03_next-priorities", displayName: "Next Priorities" },
  { id: "recent-activity", directory: "04_recent-activity", displayName: "Recent Activity" },
  { id: "civilization-forecast", directory: "05_civilization-forecast", displayName: "Civilization Forecast" },
  { id: "action-row", directory: "06_action-row", displayName: "Action Row" },
  { id: "priority-card", directory: "07_priority-card", displayName: "Priority Card" },
  { id: "activity-row", directory: "08_activity-row", displayName: "Activity Row" },
  { id: "forecast-metrics", directory: "09_forecast-metrics", displayName: "Forecast Metrics" }
] as const;

export type CivilizationOperationsSourceAudit = {
  id: string;
  displayName: string;
  sourceDirectory: string;
  sourceFiles: Array<{ filename: string; bytes: number }>;
  status: OperationsAssetStatus;
};

export async function auditCivilizationOperationsSources() {
  const sources: CivilizationOperationsSourceAudit[] = [];

  for (const slot of sourceSlots) {
    const directory = path.join(SOURCE_ROOT, slot.directory);
    const names = await readdir(directory).catch(() => []);
    const sourceFiles = [];
    for (const filename of names.filter((name) => [".psd", ".psb"].includes(path.extname(name).toLowerCase())).sort()) {
      const fileStat = await stat(path.join(directory, filename)).catch(() => null);
      if (fileStat?.isFile()) sourceFiles.push({ filename, bytes: fileStat.size });
    }
    sources.push({
      id: slot.id,
      displayName: slot.displayName,
      sourceDirectory: slot.directory,
      sourceFiles,
      status: sourceFiles.length ? "Slice Mapping Pending" : "Source Master Pending"
    });
  }

  const sourceIdsWithFiles = new Set(sources.filter((source) => source.sourceFiles.length).map((source) => source.id));
  const assets = civilizationOperationsDeckContract.assets.map((asset) => ({
    ...asset,
    studioStatus: sourceIdsWithFiles.has(asset.sourceSlotId) ? "Slice Mapping Pending" as const : asset.status
  }));

  return {
    sourceRootLabel: "source-masters/ui/hud/civilization-operations/",
    sources,
    assets,
    summary: {
      sourceSlots: sources.length,
      sourceMastersPresent: sources.reduce((count, source) => count + source.sourceFiles.length, 0),
      readyAssets: assets.filter((asset) => asset.studioStatus === "Ready").length,
      pendingAssets: assets.filter((asset) => asset.studioStatus !== "Ready").length
    }
  };
}
