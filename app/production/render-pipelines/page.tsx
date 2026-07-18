import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { formatPipeline, renderPipelines } from "@/lib/production";

export default function RenderPipelinesPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader title="Render Pipelines" description="Reference workflows for moving from Studio records to game-ready assets." />
      <ProductionCardGrid>
        {renderPipelines.map((pipeline) => (
          <ProductionReferenceCard key={pipeline.id} title={pipeline.title} description={pipeline.description} badge="Workflow" copyText={formatPipeline(pipeline)}>
            <div className="space-y-2">
              {pipeline.steps.map((step, index) => (
                <div key={step} className="text-sm font-bold text-slate-200">{index > 0 ? "→ " : ""}{step}</div>
              ))}
            </div>
          </ProductionReferenceCard>
        ))}
      </ProductionCardGrid>
    </main>
  );
}
