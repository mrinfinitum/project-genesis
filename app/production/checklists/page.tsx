import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { formatChecklist, productionChecklists } from "@/lib/production";

export default function ProductionChecklistsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader title="Production Checklists" description="Reusable Markdown checklists for common production tasks. Checked state is not persisted." />
      <ProductionCardGrid>
        {productionChecklists.map((checklist) => (
          <ProductionReferenceCard key={checklist.id} title={checklist.title} description={`${checklist.tasks.length} production QA tasks.`} badge="Checklist" copyText={formatChecklist(checklist)}>
            <div className="space-y-2">
              {checklist.tasks.slice(0, 5).map((task) => <p key={task} className="text-sm font-semibold text-slate-300">- [ ] {task}</p>)}
            </div>
          </ProductionReferenceCard>
        ))}
      </ProductionCardGrid>
    </main>
  );
}
