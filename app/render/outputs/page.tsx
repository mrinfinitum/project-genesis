import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { formatRenderOutput, renderOutputs } from "@/lib/render";

export default function RenderOutputsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader eyebrow="Render" title="Render Outputs" description="Canonical output definitions for future render pipelines." />
      <ProductionCardGrid>
        {renderOutputs.map((output) => (
          <ProductionReferenceCard key={output.id} title={output.title} description={output.purpose} badge={output.format} copyText={formatRenderOutput(output)}>
            <p className="text-xs font-bold text-cyan-100">{output.resolution}</p>
          </ProductionReferenceCard>
        ))}
      </ProductionCardGrid>
    </main>
  );
}
