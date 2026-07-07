import { CommandCenterDashboard } from "@/components/command-center-dashboard";
import { getGameData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getGameData();
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
    />
  );
}
