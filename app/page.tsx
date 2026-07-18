import { CommandCenterDashboard } from "@/components/command-center-dashboard";
import { getGameData } from "@/lib/data";
import { getUniverseLibraryData } from "@/lib/universe/library";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getGameData();
  const universeLibraries = getUniverseLibraryData();
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
  const libraryStats = [
    { label: "Galaxy Library", href: "/galaxy", rows: universeLibraries.galaxies },
    { label: "Sector Library", href: "/sector-map", rows: universeLibraries.sectors },
    { label: "Star System Library", href: "/star-system-map", rows: universeLibraries.starSystems },
    { label: "Star Library", href: "/celestial-bodies", rows: universeLibraries.stars },
    { label: "Planet Library", href: "/planets", rows: universeLibraries.planets },
    { label: "Discovery Library", href: "/discovery-journal", rows: universeLibraries.discoveries }
  ].map((library) => ({
    label: library.label,
    href: library.href,
    count: library.rows.length,
    ready: library.rows.filter((row) => row.readiness === "Ready").length
  }));
  const contentStats = [
    { label: "Research", href: "/research", rows: data.research },
    { label: "Buildings", href: "/buildings", rows: data.buildings },
    { label: "Resources", href: "/resource-catalog", rows: data.resource_catalog },
    { label: "Upgrades", href: "/upgrades", rows: data.upgrades },
    { label: "Planet Profiles", href: "/planet-resource-profiles", rows: data.planet_resource_profiles },
    { label: "Unlock Matrix", href: "/unlock-matrix", rows: data.unlock_matrix }
  ].map((content) => ({
    label: content.label,
    href: content.href,
    count: content.rows.length,
    complete: content.rows.filter((row) => {
      const status = "status" in row ? String(row.status).toLowerCase() : "ready";
      const implementationStatus = "implementation_status" in row ? String(row.implementation_status).toLowerCase() : "";
      return ["ready", "complete", "published", "approved"].some((token) => status.includes(token) || implementationStatus.includes(token));
    }).length
  }));
  const assetStats = [
    { label: "Asset Records", value: data.assets.length },
    { label: "Concept Art", value: data.conceptual_art.length },
    { label: "Planet Renders", value: data.planet_render_library.length },
    { label: "Prompt Rows", value: data.planet_prompt_library.length }
  ];

  return (
    <CommandCenterDashboard
      systems={data.project_systems}
      healthChecks={data.data_health_checks}
      metrics={data.dashboard_metrics}
      totalRecords={totalRecords}
      libraryStats={libraryStats}
      contentStats={contentStats}
      assetStats={assetStats}
    />
  );
}
