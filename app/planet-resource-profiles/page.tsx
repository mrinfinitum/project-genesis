import { AdminTable } from "@/components/admin-table";
import { handoffData } from "@/data/handoff";
import { getRows } from "@/lib/data";
import { normalizePlanetResourceProfile } from "@/lib/resources/planet-resource-profiles";
import { tableConfigs } from "@/lib/tables";
import type { PlanetResourceProfile } from "@/types/schema";

export const dynamic = "force-dynamic";

export default async function PlanetResourceProfilesPage() {
  const rows = await getRows("planet_resource_profiles");
  const profileRows = (rows.length ? rows : handoffData.planet_resource_profiles) as PlanetResourceProfile[];
  const normalizedRows = profileRows.map((row) => {
    const normalized = normalizePlanetResourceProfile(row);
    return {
      ...row,
      primary_resource_ids: normalized.primaryResourceIds,
      secondary_resource_ids: normalized.secondaryResourceIds,
      rare_resource_ids: normalized.rareResourceIds,
      exotic_resource_ids: normalized.exoticResourceIds,
      resource_weights: normalized.resourceWeights,
      abundance_range: normalized.abundanceRange,
      mining_difficulty_modifier: normalized.miningDifficultyModifier,
      refinement_difficulty_modifier: normalized.refinementDifficultyModifier
    };
  });

  return <AdminTable config={tableConfigs.planet_resource_profiles} initialRows={normalizedRows} />;
}
