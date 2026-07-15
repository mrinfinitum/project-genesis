import Link from "next/link";
import { BookOpen, Boxes, GitBranch, Layers3, Search, ShieldCheck } from "lucide-react";
import { WorkspaceBadge, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile } from "@/components/ui/workspace";
import { getAssetProductionState } from "@/lib/assets/asset-production";
import { getGameData } from "@/lib/data";
import { buildCivilizationEncyclopediaState, type EncyclopediaEntry, type EncyclopediaSection } from "@/lib/encyclopedia";

export const dynamic = "force-dynamic";

function SectionCard({ section, active }: { section: EncyclopediaSection; active: boolean }) {
  return (
    <Link href={`/encyclopedia?section=${section.id}`} className={`rounded-md border p-4 transition hover:border-cyan-300/45 focus-visible:border-cyan-200 focus-visible:outline-none ${active ? "border-cyan-300/50 bg-cyan-300/10" : "border-cyan-300/15 bg-slate-950/45"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-white">{section.label}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{section.description}</p>
        </div>
        <WorkspaceBadge value={section.status} className="text-[0.55rem]" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <WorkspaceMiniStat label="Entries" value={section.entries.length} />
        <WorkspaceMiniStat label="Hierarchy" value={section.hierarchy.join(" / ")} />
      </div>
      {section.plannedReason ? <p className="mt-3 text-xs leading-5 text-amber-100/80">{section.plannedReason}</p> : null}
    </Link>
  );
}

function EntryCard({ entry }: { entry: EncyclopediaEntry }) {
  return (
    <Link href={`/encyclopedia?section=${entry.entityType}&entry=${encodeURIComponent(entry.id)}`} className="rounded-md border border-cyan-300/15 bg-slate-950/50 p-4 transition hover:border-cyan-300/45 focus-visible:border-cyan-200 focus-visible:outline-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-200">{entry.category}</p>
          <h3 className="mt-2 truncate text-xl font-black text-white">{entry.displayName}</h3>
          <p className="mt-1 truncate text-sm font-bold text-cyan-100">{entry.canonicalRecordId}</p>
        </div>
        <WorkspaceBadge value={entry.publicationState} className="text-[0.55rem]" />
      </div>
      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-300">{entry.summary || "Editorial summary missing."}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <WorkspaceMiniStat label="Data" value={`${entry.completeness.dataReadiness}%`} />
        <WorkspaceMiniStat label="Art" value={`${entry.completeness.artReadiness}%`} />
        <WorkspaceMiniStat label="Editorial" value={`${entry.completeness.editorialReadiness}%`} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <WorkspaceBadge value={entry.era} className="text-[0.55rem]" />
        <WorkspaceBadge value={entry.priority} className="text-[0.55rem]" />
        <WorkspaceBadge value={`${entry.assetReadiness.missing} missing assets`} className="text-[0.55rem]" />
      </div>
    </Link>
  );
}

export default async function EncyclopediaPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const selectedSectionId = typeof params?.section === "string" ? params.section : "building";
  const query = typeof params?.q === "string" ? params.q.trim().toLowerCase() : "";
  const [data, assetState] = await Promise.all([getGameData(), getAssetProductionState()]);
  const state = buildCivilizationEncyclopediaState(data, assetState.assets);
  const selectedSection = state.sections.find((section) => section.id === selectedSectionId) ?? state.sections[0];
  const selectedEntryId = typeof params?.entry === "string" ? params.entry : "";
  const sectionEntries = selectedSection.entries.filter((entry) => {
    if (!query) return true;
    return [
      entry.displayName,
      entry.canonicalRecordId,
      entry.category,
      entry.subcategory,
      entry.era,
      entry.summary,
      entry.description,
      ...entry.tags,
      ...entry.effects,
      ...entry.inputs,
      ...entry.outputs,
      ...entry.locations
    ].join(" ").toLowerCase().includes(query);
  });
  const selectedEntry = state.entries.find((entry) => entry.id === selectedEntryId) ?? sectionEntries[0] ?? null;
  const buildingFamilies = selectedSection.id === "building"
    ? Object.entries(sectionEntries.reduce<Record<string, number>>((map, entry) => {
      map[entry.category] = (map[entry.category] ?? 0) + 1;
      return map;
    }, {})).sort(([left], [right]) => left.localeCompare(right))
    : [];

  return (
    <main className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_32rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Civilization Encyclopedia</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white">Civilization Encyclopedia</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">The canonical knowledge system of NOVERIS.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/asset-library?section=encyclopedia" className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">Asset Library / Encyclopedia</Link>
            <Link href="/creative-production?area=encyclopedia" className="rounded-md border border-slate-600 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-200">Creative Production Readiness</Link>
            <Link href="/screen-designer?filter=encyclopedia" className="rounded-md border border-slate-600 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-200">Screen Specs</Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <WorkspaceStatTile label="Total Entries" value={state.metrics.totalEntries} />
          <WorkspaceStatTile label="Active Sections" value={state.metrics.activeSections} />
          <WorkspaceStatTile label="Scaffold Entries" value={state.metrics.scaffoldEntries} />
          <WorkspaceStatTile label="Missing Hero Art" value={state.metrics.missingHeroArt} />
        </div>
      </section>

      <WorkspacePanel title="Encyclopedia Home" icon={BookOpen}>
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceMiniStat label="Published Entries" value={state.metrics.publishedEntries} />
          <WorkspaceMiniStat label="Missing Descriptions" value={state.metrics.missingDescriptions} />
          <WorkspaceMiniStat label="Broken Relationships" value={state.metrics.brokenRelationships} />
          <WorkspaceMiniStat label="In-Game Export" value={state.metrics.inGameExportReadiness} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {state.sections.map((section) => <SectionCard key={section.id} section={section} active={section.id === selectedSection.id} />)}
        </div>
      </WorkspacePanel>

      <WorkspacePanel title={`${selectedSection.label} Browser`} icon={Layers3}>
        <form className="flex flex-wrap gap-3" action="/encyclopedia">
          <input type="hidden" name="section" value={selectedSection.id} />
          <label className="flex min-w-80 flex-1 items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/70 px-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input name="q" defaultValue={typeof params?.q === "string" ? params.q : ""} placeholder="Search entries, IDs, categories, eras, effects, locations..." className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </label>
          <button className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-bold text-cyan-100">Search</button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedSection.hierarchy.map((item) => <WorkspaceBadge key={item} value={item} className="text-[0.55rem]" />)}
        </div>
        {buildingFamilies.length ? (
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {buildingFamilies.slice(0, 16).map(([family, count]) => (
              <div key={family} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <p className="truncate text-sm font-black text-white">{family}</p>
                <p className="mt-1 text-xs font-bold text-cyan-100">{count} buildings</p>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {sectionEntries.slice(0, 24).map((entry) => <EntryCard key={entry.id} entry={entry} />)}
        </div>
      </WorkspacePanel>

      {selectedEntry ? (
        <WorkspacePanel title="Entry Detail" icon={Boxes}>
          <div className="grid gap-5 xl:grid-cols-[1fr_28rem]">
            <div>
              <div className="aspect-[16/9] rounded-md border border-cyan-300/15 bg-slate-950/70 p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">{selectedEntry.entityType}</p>
                <h2 className="mt-3 text-4xl font-black text-white">{selectedEntry.displayName}</h2>
                <p className="mt-2 text-sm font-bold text-cyan-100">{selectedEntry.canonicalRecordId}</p>
                <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-300">{selectedEntry.description || selectedEntry.summary || "Editorial content has not been written yet."}</p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <WorkspaceMiniStat label="Category" value={selectedEntry.category} />
                <WorkspaceMiniStat label="Subcategory" value={selectedEntry.subcategory} />
                <WorkspaceMiniStat label="Era" value={selectedEntry.era} />
                <WorkspaceMiniStat label="Tier" value={selectedEntry.tier ?? "n/a"} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <WorkspacePanel title="Relationships">
                  <div className="space-y-2 text-sm text-slate-300">
                    {[...selectedEntry.unlockRequirements, ...selectedEntry.dependencies, ...selectedEntry.progression].slice(0, 8).map((item) => <p key={item}>{item}</p>)}
                    {!selectedEntry.unlockRequirements.length && !selectedEntry.dependencies.length && !selectedEntry.progression.length ? <p>No relationships authored yet.</p> : null}
                  </div>
                </WorkspacePanel>
                <WorkspacePanel title="Effects">
                  <div className="space-y-2 text-sm text-slate-300">
                    {selectedEntry.effects.slice(0, 8).map((item) => <p key={item}>{item}</p>)}
                    {!selectedEntry.effects.length ? <p>No approved gameplay effects to display.</p> : null}
                  </div>
                </WorkspacePanel>
                <WorkspacePanel title="Assets">
                  <div className="space-y-3">
                    <WorkspaceProgressBar value={selectedEntry.assetReadiness.artCompletion} />
                    {selectedEntry.assetReadiness.requirements.map((requirement) => (
                      <div key={requirement.id} className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-2 text-xs">
                        <span className="font-bold text-slate-200">{requirement.role}</span>
                        <WorkspaceBadge value={requirement.status} className="text-[0.52rem]" />
                      </div>
                    ))}
                  </div>
                </WorkspacePanel>
              </div>
            </div>
            <div className="space-y-3">
              <WorkspaceStatTile label="Data Readiness" value={`${selectedEntry.completeness.dataReadiness}%`} />
              <WorkspaceStatTile label="Editorial Readiness" value={`${selectedEntry.completeness.editorialReadiness}%`} />
              <WorkspaceStatTile label="Art Readiness" value={`${selectedEntry.completeness.artReadiness}%`} />
              <WorkspaceStatTile label="Publication Readiness" value={`${selectedEntry.completeness.publicationReadiness}%`} />
            </div>
          </div>
        </WorkspacePanel>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <WorkspacePanel title="Building Collections" icon={Boxes}>
          <div className="grid gap-3 md:grid-cols-2">
            {state.buildingCollections.map((collection) => (
              <div key={collection.id} className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black text-white">{collection.displayName}</h3>
                  <WorkspaceBadge value={collection.status} className="text-[0.55rem]" />
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-300">{collection.description}</p>
                <p className="mt-3 text-xs font-bold text-cyan-100">{collection.buildingIds.length} canonical buildings</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Progression Chains" icon={GitBranch}>
          <div className="space-y-3">
            {state.buildingProgressionChains.map((chain) => (
              <div key={chain.chainId} className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black text-white">{chain.displayName}</h3>
                  <WorkspaceBadge value={chain.validationStatus} className="text-[0.55rem]" />
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">{chain.familyId} / {chain.subcategoryId}</p>
                <p className="mt-3 text-sm text-slate-300">{chain.nodes.length} nodes: {chain.nodes.map((node) => node.relationshipType).join(" -> ")}</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <WorkspacePanel title="Relationship Graph" icon={GitBranch}>
          <WorkspaceMiniStat label="Nodes" value={state.relationshipGraph.nodes.length} />
          <WorkspaceMiniStat label="Edges" value={state.relationshipGraph.edges.length} className="mt-3" />
          <WorkspaceMiniStat label="Broken" value={state.relationshipGraph.brokenRelationships.length} className="mt-3" />
        </WorkspacePanel>
        <WorkspacePanel title="Galactopedia Contract" icon={ShieldCheck}>
          <WorkspaceBadge value={state.galactopediaContract.status} />
          <p className="mt-3 text-sm leading-6 text-slate-300">{state.galactopediaContract.rule}</p>
          <p className="mt-3 text-xs font-bold text-slate-500">Not exported to public runtime in this task.</p>
        </WorkspacePanel>
        <WorkspacePanel title="Bulk Requirement Preview" icon={Boxes}>
          <WorkspaceMiniStat label="Scopes" value={state.bulkRequirementPreview.scopes.length} />
          <WorkspaceMiniStat label="Generated Requirements" value={state.bulkRequirementPreview.generatedRequirements} className="mt-3" />
          <WorkspaceMiniStat label="Mutation Required" value={String(state.bulkRequirementPreview.mutationRequired)} className="mt-3" />
        </WorkspacePanel>
      </div>
    </main>
  );
}
