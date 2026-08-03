import { UpgradeLibrary } from "@/components/upgrade-library";
import { getAssetProductionAssets } from "@/lib/assets/asset-production";
import { getRows } from "@/lib/data";
import { canonicalProgressionSystem } from "@/lib/progression/progression-system";
import { buildUpgradeArtReport } from "@/lib/upgrades/art-previews";
import type { Upgrade } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function UpgradesPage() {
  const [rows, assets] = await Promise.all([getRows("upgrades"), getAssetProductionAssets()]);
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
  return <UpgradeLibrary upgrades={upgrades} art={art} progression={{
    profiles: canonicalProgressionSystem.progressionProfiles.length,
    maxLevel: Math.max(...canonicalProgressionSystem.progressionProfiles.map((profile) => profile.maxLevel)),
    xpSources: canonicalProgressionSystem.upgradeXpSourceProfiles.length
  }} />;
}
