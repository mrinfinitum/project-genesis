import { ListChecks } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import { canonicalActionSystem, validateActionSystem } from "@/lib/actions/action-system";

export const dynamic = "force-dynamic";

export default async function ActionsPage({ searchParams }: { searchParams?: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const view = params?.view ?? "dashboard";
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

      <WorkspacePanel title={`${view.replace(/_/g, " ")} Profiles`} icon={ListChecks}>
        <div className="grid gap-3 md:grid-cols-5">
          <WorkspaceStatTile label="Action Profiles" value={canonicalActionSystem.canonicalActionProfiles.length} />
          <WorkspaceStatTile label="Cost Profiles" value={canonicalActionSystem.actionCostProfiles.length} />
          <WorkspaceStatTile label="Requirements" value={canonicalActionSystem.actionRequirementProfiles.length} />
          <WorkspaceStatTile label="Rewards" value={canonicalActionSystem.actionRewardProfiles.length} />
          <WorkspaceStatTile label="Queues" value={canonicalActionSystem.actionQueueProfiles.length} />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">Every normalized profile resolves to the existing shared Action System. Studio publishes definitions and Unity owns active timers, queue state, progress, and saves.</p>
      </WorkspacePanel>

      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {canonicalActionSystem.canonicalActionProfiles.map((profile) => {
          const action = canonicalActionSystem.actionDefinitions.find((item) => item.id === profile.actionDefinitionId)!;
          return (
          <article key={profile.id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-white">{action.displayName}</h2>
                <p className="mt-1 truncate text-sm font-semibold text-cyan-100">{action.id}</p>
              </div>
              <WorkspaceBadge value={action.category} />
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{action.description}</p>
            <div className="mt-3 flex flex-wrap gap-2"><WorkspaceBadge value={profile.durationProfileId} /><WorkspaceBadge value={profile.queueProfileId} /></div>
          </article>
        )})}
      </section>
    </main>
  );
}
