import { Sparkles } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import { dynamicEventFramework, validateDynamicEventFramework } from "@/lib/events/framework";

export const dynamic = "force-dynamic";

export default function DynamicEventsPage() {
  const issues = validateDynamicEventFramework();
  const errors = issues.filter((issue) => issue.severity === "error");

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="World Systems"
        title="Dynamic Events"
        description="Author and inspect canonical event categories, event definitions, triggers, eligibility, probability, phases, choices, outcomes, chains, and knowledge-safe presentation rules."
        stats={[
          { label: "Events", value: dynamicEventFramework.eventDefinitions.length },
          { label: "Categories", value: dynamicEventFramework.eventCategoryDefinitions.length },
          { label: "Chains", value: dynamicEventFramework.eventChainDefinitions.length },
          { label: "Validation", value: errors.length ? "Needs Work" : "Ready" }
        ]}
      />

      <WorkspacePanel title="Event Contract" icon={Sparkles}>
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Types" value={dynamicEventFramework.eventTypeDefinitions.length} />
          <WorkspaceStatTile label="Triggers" value={dynamicEventFramework.eventTriggerPolicies.length} />
          <WorkspaceStatTile label="Effects" value={dynamicEventFramework.eventEffectDefinitions.length} />
          <WorkspaceStatTile label="Choices" value={dynamicEventFramework.eventChoiceDefinitions.length} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <WorkspaceBadge value={dynamicEventFramework.id} />
          <WorkspaceBadge value={dynamicEventFramework.eventKnowledgeVisibility.some((rule) => rule.fallbackText === "???") ? "Knowledge Safe" : "Review Knowledge"} />
          <WorkspaceBadge value={errors.length ? "Needs Work" : "Ready"} />
        </div>
      </WorkspacePanel>

      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {dynamicEventFramework.eventDefinitions.map((event) => (
          <article key={event.id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-white">{event.displayName}</h2>
                <p className="mt-1 truncate text-sm font-semibold text-cyan-100">{event.id}</p>
              </div>
              <WorkspaceBadge value={event.categoryId} />
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{event.publicDescription}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
