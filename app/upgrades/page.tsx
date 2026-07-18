import { UpgradeLibrary } from "@/components/upgrade-library";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getRows } from "@/lib/data";
import { buildUpgradeArtReport } from "@/lib/upgrades/art-previews";
import type { Upgrade } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function UpgradesPage() {
  const [rows, assetState] = await Promise.all([getRows("upgrades"), getAssetProductionState()]);
  const upgrades = rows as Upgrade[];
  const report = buildUpgradeArtReport(upgrades, assetState.assets);
  return <UpgradeLibrary upgrades={upgrades} report={report} />;
}
