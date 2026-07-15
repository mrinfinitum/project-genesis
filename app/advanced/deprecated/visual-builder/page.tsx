import Link from "next/link";
import { Archive, ExternalLink } from "lucide-react";
import { WorkspaceBadge, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getScreenDesignerState } from "@/lib/screen-designer";

export const dynamic = "force-dynamic";

export default async function VisualBuilderArchivePage() {
  const assetState = await getAssetProductionState();
  const screenState = await getScreenDesignerState(assetState);
  const assetRequirements = screenState.records.reduce((sum, record) => sum + record.assetRequirements.length, 0);
  const linkedComponents = screenState.records.reduce((sum, record) => sum + record.componentSpecs.length, 0);
  const references = screenState.records.reduce((sum, record) => sum + record.references.length, 0);

  return (
    <main className="space-y-6">
      <WorkspacePanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Advanced / Deprecated Tools</p>
            <h1 className="mt-2 flex items-center gap-3 text-4xl font-black text-white">
              <Archive className="h-8 w-8 text-cyan-200" />
              Visual Builder Archive
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
              Deprecated — historical reference only. Studio now owns canonical content, assets, semantic requirements, component contracts, handoffs, validation, and runtime publication. Exact screen layout and client rendering live in external design tools and client repositories.
            </p>
          </div>
          <WorkspaceBadge value="Read-only" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Archived Screens" value={screenState.records.length} />
          <WorkspaceStatTile label="Asset Requirements" value={assetRequirements} />
          <WorkspaceStatTile label="Linked Components" value={linkedComponents} />
          <WorkspaceStatTile label="Reference Records" value={references} />
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Migration Targets">
        <div className="flex flex-wrap gap-2">
          <Link href="/creative-production" className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Creative Production <ExternalLink className="h-4 w-4" /></Link>
          <Link href="/asset-library" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Asset Library <ExternalLink className="h-4 w-4" /></Link>
          <Link href="/screen-designer" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Screen Specifications <ExternalLink className="h-4 w-4" /></Link>
          <Link href="/component-library" className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Component Library <ExternalLink className="h-4 w-4" /></Link>
        </div>
      </WorkspacePanel>

      <section className="grid gap-3 xl:grid-cols-2">
        {screenState.records.map((record) => (
          <article key={record.screenId} className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-cyan-200">Archived Screen Reference</p>
                <h2 className="mt-1 truncate text-xl font-black text-white">{record.displayName}</h2>
                <p className="mt-1 truncate text-xs font-semibold text-cyan-100">{record.screenId}</p>
              </div>
              <WorkspaceBadge value={record.approvalStatus} />
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{record.description}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <WorkspaceStatTile label="Assets" value={record.assetRequirements.length} />
              <WorkspaceStatTile label="Components" value={record.componentSpecs.length} />
              <WorkspaceStatTile label="References" value={record.references.length} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/screen-designer/${record.screenId}`} className="inline-flex h-9 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-xs font-black uppercase tracking-[0.12em] text-cyan-100">Open Screen Spec</Link>
              <Link href={`/creative-production?area=${record.screenId === "research" ? "research" : "top-hud"}`} className="inline-flex h-9 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-xs font-black uppercase tracking-[0.12em] text-slate-200">Open Production</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
