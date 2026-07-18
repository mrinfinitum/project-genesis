import { ProductionCardGrid, ProductionHeader, ProductionReferenceCard } from "@/components/production/production-components";
import { ProductionCopyButton } from "@/components/production/copy-button";
import { aiPromptStandards, formatPromptStandard } from "@/lib/production";

export default function AiPromptStandardsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader title="AI Prompt Standards" description="Copy-ready prompt structures for production reference generation. Prompts are documentation, not runtime data." />
      <ProductionCardGrid>
        {aiPromptStandards.map((prompt) => (
          <ProductionReferenceCard key={prompt.id} title={prompt.title} description={prompt.purpose} badge="Prompt" copyText={formatPromptStandard(prompt, "plain")}>
            <div className="flex flex-wrap gap-2">
              <ProductionCopyButton label="Copy Prompt Template" text={prompt.promptTemplate} />
              <ProductionCopyButton label="Copy Negative Prompt" text={prompt.negativePrompt} />
            </div>
          </ProductionReferenceCard>
        ))}
      </ProductionCardGrid>
    </main>
  );
}
