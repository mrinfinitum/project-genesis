import { notFound } from "next/navigation";
import { PlanetRendererDetail } from "@/components/production/render-contract-detail";
import { ProductionHeader, ProductionSection } from "@/components/production/production-components";
import { WorkspaceBadge, WorkspaceMiniStat } from "@/components/ui/workspace";
import { rendererTemplates } from "@/lib/render";

export function generateStaticParams() {
  return rendererTemplates.map((template) => ({ templateId: template.id }));
}

export default async function RendererTemplateDetailPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const template = rendererTemplates.find((item) => item.id === templateId);
  if (!template) notFound();
  if (template.id === "planet-renderer") return <PlanetRendererDetail />;

  return (
    <main className="space-y-6">
      <ProductionHeader eyebrow="Renderer Template" title={template.name} description={`${template.description} This is a contract-only detail page; no rendering is implemented.`} />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMiniStat label="Version" value={template.version} />
        <WorkspaceMiniStat label="Status" value={template.status} />
        <WorkspaceMiniStat label="Renderer" value={template.renderer} />
        <WorkspaceMiniStat label="Output Types" value={template.outputTypes.length} />
      </section>
      <ProductionSection title="Output Types">
        <div className="flex flex-wrap gap-2">
          {template.outputTypes.map((item) => <WorkspaceBadge key={item} value={item} />)}
        </div>
      </ProductionSection>
    </main>
  );
}
