import { ProductionCardGrid, ProductionHeader, ProductionNavCard } from "@/components/production/production-components";
import { toolsAndUtilities } from "@/lib/production";

export default function ToolsUtilitiesPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader title="Tools & Utilities" description="Reference list of production tools and utilities. This page does not integrate with tools directly." />
      <ProductionCardGrid>
        {toolsAndUtilities.map((tool) => <ProductionNavCard key={tool.id} card={tool} />)}
      </ProductionCardGrid>
    </main>
  );
}
