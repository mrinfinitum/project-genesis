import { CommandCenterDashboard } from "@/components/command-center-dashboard";
import { getAiAgentLibraryState } from "@/lib/ai-agents";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getEraArtSummaryByEra } from "@/lib/assets/era-art-inventory";
import { getComponentLibraryState } from "@/lib/component-library";
import { getContentAuthoringState } from "@/lib/content-authoring/store";
import { getGameData } from "@/lib/data";
import { buildProductionPlan } from "@/lib/production/planner";
import { getScreenDesignerState } from "@/lib/screen-designer";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [data, assetProductionState, eraArtSummary, contentAuthoringState] = await Promise.all([
    getGameData(),
    getAssetProductionState(),
    getEraArtSummaryByEra(),
    getContentAuthoringState()
  ]);
  const screenDesignerState = await getScreenDesignerState(assetProductionState);
  const componentLibraryState = await getComponentLibraryState(assetProductionState);
  const aiAgentState = await getAiAgentLibraryState(assetProductionState);
  const productionPlan = buildProductionPlan(data, assetProductionState, eraArtSummary, contentAuthoringState, screenDesignerState, componentLibraryState, aiAgentState);
  const totalRecords = [
    data.research,
    data.buildings,
    data.upgrades,
    data.unlock_matrix,
    data.districts,
    data.wonders,
    data.assets,
    data.conceptual_art,
    data.planets,
    data.planet_resource_profiles,
    data.resource_catalog,
    data.generated_planets,
    data.planet_render_library,
    data.release_notes,
    data.changelog
  ].reduce((sum, rows) => sum + rows.length, 0);

  return (
    <CommandCenterDashboard
      systems={data.project_systems}
      history={data.project_system_history}
      healthChecks={data.data_health_checks}
      codexItems={data.codex_readiness_items}
      metrics={data.dashboard_metrics}
      totalRecords={totalRecords}
      currentCivilizationAge={data.civilization_identity[0]?.current_age}
      productionPlan={productionPlan}
    />
  );
}
