import { ProductionCardGrid, ProductionHeader, ProductionNavCard, ProductionSection } from "@/components/production/production-components";
import { renderHomeCards, renderPipelineSteps } from "@/lib/render";

export default function RenderPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader
        eyebrow="Render"
        title="Render"
        description="Foundation for the future NOVERIS Render Engine. This workspace defines templates, contracts, profiles, outputs, settings, and placeholders only. It does not launch Blender, Python, render jobs, or external software."
      />
      <ProductionCardGrid>
        {renderHomeCards.map((card) => <ProductionNavCard key={card.id} card={card} />)}
      </ProductionCardGrid>
      <ProductionSection title="Render Pipeline">
        <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
          {renderPipelineSteps.map((step, index) => (
            <div key={step} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-black text-slate-100">
              <span className="text-cyan-200">{index + 1}.</span> {step}
            </div>
          ))}
        </div>
      </ProductionSection>
    </main>
  );
}
