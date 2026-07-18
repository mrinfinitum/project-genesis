import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { batchJobs } from "@/lib/render";

export default function BatchJobsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader eyebrow="Render" title="Batch Jobs" description="Disabled placeholders for future batch render actions. No render jobs are created." />
      <ProductionCardGrid>
        {batchJobs.map((job) => (
          <ProductionReferenceCard key={job.id} title={job.title} description={job.description} badge={job.status} copyText={`${job.title}\nStatus: ${job.status}\n${job.description}`} />
        ))}
      </ProductionCardGrid>
    </main>
  );
}
