import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { assetSpecifications, formatAssetSpecification } from "@/lib/production";

export default function AssetSpecificationsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader
        title="Asset Specifications"
        description="One production reference per asset type. Cards open into detail pages with source, map, render, metadata, and copy-ready specification sections."
      />
      <ProductionCardGrid>
        {assetSpecifications.map((spec) => (
          <ProductionReferenceCard
            key={spec.id}
            title={spec.title}
            description={spec.description}
            badge="Specification"
            copyText={formatAssetSpecification(spec, "plain")}
            href={`/production/asset-specifications/${spec.id}`}
          />
        ))}
      </ProductionCardGrid>
    </main>
  );
}
