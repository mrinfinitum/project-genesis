import { ProductionCopyButton } from "@/components/production/copy-button";
import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { fileNamingGroups, formatSection } from "@/lib/production";

export default function FileNamingStandardsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader title="File Naming Standards" description="Canonical naming examples for source files, texture maps, renders, thumbnails, and runtime derivatives." />
      <ProductionCardGrid>
        {fileNamingGroups.map((group) => (
          <ProductionReferenceCard key={group.id} title={group.title} description="Copy a single filename, this naming group, or the full standard." badge="Naming" copyText={formatSection(group.title, group.examples, "plain")}>
            <div className="space-y-2">
              {group.examples.map((filename) => (
                <div key={filename} className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-2">
                  <code className="truncate text-xs font-bold text-cyan-100">{filename}</code>
                  <ProductionCopyButton label="Copy" text={filename} className="px-2 py-1 text-xs" />
                </div>
              ))}
            </div>
          </ProductionReferenceCard>
        ))}
      </ProductionCardGrid>
    </main>
  );
}
