import Link from "next/link";
import { ProductionCopyButton } from "@/components/production/copy-button";
import { ProductionHeader, ProductionSection } from "@/components/production/production-components";
import { WorkspaceMiniStat } from "@/components/ui/workspace";
import { formatRenderContract, planetRenderContractFields } from "@/lib/render";

export default function RendererContractsPage() {
  return (
    <main className="space-y-6">
      <ProductionHeader eyebrow="Render" title="Renderer Contracts" description="Canonical contract documentation for future external render engines." />
      <ProductionSection
        title="Planet Render Contract"
        action={<div className="flex flex-wrap gap-2">
          <ProductionCopyButton label="Copy Plain Text" text={formatRenderContract("plain")} />
          <ProductionCopyButton label="Copy Markdown" text={formatRenderContract("markdown")} />
          <ProductionCopyButton label="Copy JSON" text={formatRenderContract("json")} />
        </div>}
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <WorkspaceMiniStat label="Fields" value={planetRenderContractFields.length} />
          <Link href="/render/templates/planet-renderer" className="inline-flex items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15">
            Open Planet Renderer
          </Link>
        </div>
      </ProductionSection>
    </main>
  );
}
