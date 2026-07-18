import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { formatRendererTemplate, rendererTemplates } from "@/lib/render";

export default function RendererTemplatesPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader eyebrow="Render" title="Renderer Templates" description="Template contracts for future renderers. No renderer execution is implemented." />
      <ProductionCardGrid>
        {rendererTemplates.map((template) => (
          <ProductionReferenceCard
            key={template.id}
            title={template.name}
            description={template.description}
            badge={template.status}
            href={`/render/templates/${template.id}`}
            copyText={formatRendererTemplate(template)}
          >
            <p className="text-xs font-bold text-cyan-100">{template.version} / {template.outputTypes.length} outputs</p>
          </ProductionReferenceCard>
        ))}
      </ProductionCardGrid>
    </main>
  );
}
