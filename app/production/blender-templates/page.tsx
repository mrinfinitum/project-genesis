import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { blenderTemplates } from "@/lib/production";

export default function BlenderTemplatesPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader title="Blender Templates" description="Master Blender files for creating consistent source renders and runtime derivatives." />
      <ProductionCardGrid>
        {blenderTemplates.map((template) => (
          <ProductionReferenceCard
            key={template.id}
            title={template.title}
            description={template.description}
            badge={template.status}
            copyText={`${template.title}\n\n${template.description}\n\nSupported Outputs\n- ${template.supportedOutputs.join("\n- ")}\n\nVersion: ${template.version}\nStatus: ${template.status}\nNotes: ${template.notes}`}
          >
            <p className="text-xs font-bold text-cyan-100">{template.version} / {template.supportedOutputs.length} outputs</p>
          </ProductionReferenceCard>
        ))}
      </ProductionCardGrid>
    </main>
  );
}
