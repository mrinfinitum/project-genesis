import { ListChecks } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import { canonicalActionSystem, validateActionSystem } from "@/lib/actions/action-system";

export const dynamic = "force-dynamic";

export default function ActionsPage() {
  const issues = validateActionSystem();
  const errors = issues.filter((issue) => issue.severity === "error");

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="World Systems"
        title="Actions"
        description="Author and inspect canonical action definitions, queues, durations, phases, requirements, outputs, automation, and acceleration policies."
        stats={[
          { label: "Actions", value: canonicalActionSystem.actionDefinitions.length },
          { label: "Categories", value: canonicalActionSystem.actionCategories.length },
          { label: "States", value: canonicalActionSystem.actionStates.length },
          { label: "Validation", value: errors.length ? "Needs Work" : "Ready" }
        ]}
      />

      <WorkspacePanel title="Action Contract" icon={ListChecks}>
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Queue Rules" value={canonicalActionSystem.actionQueueRules.length} />
          <WorkspaceStatTile label="Durations" value={canonicalActionSystem.actionDurationDefinitions.length} />
          <WorkspaceStatTile label="Phase Templates" value={canonicalActionSystem.actionPhaseTemplates.length} />
          <WorkspaceStatTile label="Presentation" value={canonicalActionSystem.actionPresentationContracts.length} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <WorkspaceBadge value={canonicalActionSystem.id} />
          <WorkspaceBadge value={canonicalActionSystem.timeActionContractId} />
          <WorkspaceBadge value={errors.length ? "Needs Work" : "Ready"} />
        </div>
      </WorkspacePanel>

      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {canonicalActionSystem.actionDefinitions.slice(0, 18).map((action) => (
          <article key={action.id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-white">{action.displayName}</h2>
                <p className="mt-1 truncate text-sm font-semibold text-cyan-100">{action.id}</p>
              </div>
              <WorkspaceBadge value={action.category} />
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{action.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
