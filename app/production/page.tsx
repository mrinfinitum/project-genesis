import { ProductionCardGrid, ProductionHeader, ProductionNavCard } from "@/components/production/production-components";
import { productionHomeCards } from "@/lib/production";

export default function ProductionPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader
        title="Production"
        description="Reference center for creating game assets: documentation, standards, pipelines, asset specifications, and production tools. This workspace does not modify gameplay, runtime, exports, or canonical content."
      />
      <ProductionCardGrid>
        {productionHomeCards.map((card) => <ProductionNavCard key={card.id} card={card} />)}
      </ProductionCardGrid>
    </main>
  );
}
