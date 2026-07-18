import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { runtimeTargets } from "@/lib/production";

export default function RuntimeTargetsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader title="Runtime Targets" description="Recommended delivery resolutions and target notes for production outputs. These are references, not exported runtime logic." />
      <ProductionCardGrid>
        {runtimeTargets.map((target) => (
          <ProductionReferenceCard
            key={target.id}
            title={target.title}
            description={target.useCase}
            badge={target.resolution}
            copyText={`${target.title}\nUse Case: ${target.useCase}\nResolution: ${target.resolution}\nNotes: ${target.notes}`}
          />
        ))}
      </ProductionCardGrid>
    </main>
  );
}
