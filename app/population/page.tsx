import { Landmark } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import { populationSimulationFramework, validatePopulationSimulationFramework } from "@/lib/population/framework";

export const dynamic = "force-dynamic";

export default function PopulationPage() {
  const issues = validatePopulationSimulationFramework();
  const errors = issues.filter((issue) => issue.severity === "error");

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="World Systems"
        title="Population"
        description="Author and inspect canonical population categories, life stages, workforce roles, growth, capacity, needs, migration, automation, and integration contracts."
        stats={[
          { label: "Categories", value: populationSimulationFramework.populationCategoryDefinitions.length },
          { label: "Workforce Roles", value: populationSimulationFramework.populationWorkforceRoleDefinitions.length },
          { label: "Needs", value: populationSimulationFramework.populationNeedDefinitions.length },
          { label: "Validation", value: errors.length ? "Needs Work" : "Ready" }
        ]}
      />

      <WorkspacePanel title="Population Contract" icon={Landmark}>
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Growth Rules" value={populationSimulationFramework.populationGrowthDefinitions.length} />
          <WorkspaceStatTile label="Capacity Rules" value={populationSimulationFramework.populationCapacityDefinitions.length} />
          <WorkspaceStatTile label="Migration Rules" value={populationSimulationFramework.populationMigrationDefinitions.length} />
          <WorkspaceStatTile label="Assignments" value={populationSimulationFramework.workforceAssignmentDefinitions.length} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <WorkspaceBadge value={populationSimulationFramework.id} />
          <WorkspaceBadge value={populationSimulationFramework.calculationVersion} />
          <WorkspaceBadge value={errors.length ? "Needs Work" : "Ready"} />
        </div>
      </WorkspacePanel>

      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {populationSimulationFramework.populationWorkforceRoleDefinitions.slice(0, 18).map((role) => (
          <article key={role.id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-white">{role.displayName}</h2>
                <p className="mt-1 truncate text-sm font-semibold text-cyan-100">{role.id}</p>
              </div>
              <WorkspaceBadge value={`${role.supportedBuildingFamilyIds.length} families`} />
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{role.notes}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
