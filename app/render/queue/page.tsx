import { ProductionHeader, ProductionSection } from "@/components/production/production-components";
import { WorkspaceMiniStat } from "@/components/ui/workspace";
import { renderQueueStatuses } from "@/lib/render";

export default function RenderQueuePage() {
  return (
    <main className="space-y-6">
      <ProductionHeader eyebrow="Render" title="Render Queue" description="Status-only queue foundation. No backend queue, render job creation, or external renderer integration is implemented." />
      <ProductionSection title="Queue Statuses">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {renderQueueStatuses.map((status) => <WorkspaceMiniStat key={status} label={status} value="0" />)}
        </div>
      </ProductionSection>
    </main>
  );
}
