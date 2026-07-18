import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { futureIntegrations } from "@/lib/render";

export default function FutureIntegrationsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader eyebrow="Render" title="Future Integrations" description="Reference notes for future external renderer and engine integrations. No API integration exists yet." />
      <ProductionCardGrid>
        {futureIntegrations.map((integration) => (
          <ProductionReferenceCard
            key={integration.id}
            title={integration.title}
            description={integration.purpose}
            badge={integration.status}
            copyText={`${integration.title}\nPurpose: ${integration.purpose}\nStatus: ${integration.status}\nFuture API: ${integration.futureApi}`}
          />
        ))}
      </ProductionCardGrid>
    </main>
  );
}
