import { UpgradeTreeWorkspace } from "@/components/upgrade-tree-workspace";
import { getAssetProductionAssets } from "@/lib/assets/asset-production";
import { getRows } from "@/lib/data";
import { getGameRuntimeData } from "@/lib/runtime/game-runtime";
import { buildUpgradeArtReport } from "@/lib/upgrades/art-previews";
import type { Upgrade } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function UpgradesPage() {
  const [rows, assets, runtime] = await Promise.all([getRows("upgrades"), getAssetProductionAssets(), getGameRuntimeData()]);
  const upgrades = rows as Upgrade[];
  const report = buildUpgradeArtReport(upgrades, assets);
  const art = report.items.map((item) => ({
    upgradeId: item.upgradeId,
    matchStatus: item.matchStatus,
    previewStatus: item.previewStatus,
    resolvedPreviewUrl: item.resolvedPreviewUrl,
    hasApprovedPreview: item.hasApprovedPreview,
    hasThumbnail: item.hasThumbnail,
    hasPreview: item.hasPreview,
    hasWebMapping: item.hasWebMapping,
    hasRobloxMapping: item.hasRobloxMapping
  }));
  return <UpgradeTreeWorkspace upgrades={upgrades} tree={runtime.upgradeTree} art={art} />;
}
