"use client";

import Link from "next/link";
import { BookOpen, Compass, Database, Search } from "lucide-react";
import { DiscoveryLibraryTree, type DiscoveryTreeNode } from "@/components/discovery-library-tree";
import { ResizableDiscoveryLayout } from "@/components/resizable-discovery-layout";
import { WorkspaceBadge, WorkspaceMiniStat } from "@/components/ui/workspace";
import type { EncyclopediaEntry, EncyclopediaPublicationState } from "@/lib/encyclopedia";
import { cn } from "@/lib/utils";

export type EncyclopediaBrowserEntry = Pick<
  EncyclopediaEntry,
  "id" | "entityType" | "canonicalRecordId" | "displayName" | "category" | "subcategory" | "summary" | "description" | "publicationState" | "completeness"
>;

export type EncyclopediaBrowserSection = {
  id: string;
  label: string;
  status: "active" | "planned";
  count: number;
  categories: Array<{
    id: string;
    label: string;
    count: number;
    subcategories: Array<{ id: string; label: string; count: number }>;
  }>;
};

type EncyclopediaBrowserProps = {
  sections: EncyclopediaBrowserSection[];
  entries: EncyclopediaBrowserEntry[];
  selectedSectionId: string;
  selectedCategory: string;
  selectedSubcategory: string;
  query: string;
  matchedCount: number;
  sectionTotal: number;
  limit: number;
};

function statusClass(status: EncyclopediaPublicationState) {
  if (/published|ready|complete/i.test(status)) return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  if (/missing|blocked|invalid/i.test(status)) return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  return "border-amber-300/35 bg-amber-400/10 text-amber-100";
}

function encyclopediaHref(section: string, category = "", subcategory = "", query = "", limit = 96) {
  const params = new URLSearchParams({ section });
  if (category) params.set("category", category);
  if (subcategory) params.set("subcategory", subcategory);
  if (query) params.set("q", query);
  if (limit !== 96) params.set("limit", String(limit));
  return `/encyclopedia?${params.toString()}`;
}

function treeNodes(sections: EncyclopediaBrowserSection[]): DiscoveryTreeNode[] {
  return sections.map((section) => ({
    id: section.id,
    label: section.label,
    href: encyclopediaHref(section.id),
    count: section.count,
    icon: "folder",
    children: section.categories.map((category) => ({
      id: `${section.id}:${category.id}`,
      label: category.label,
      href: encyclopediaHref(section.id, category.label),
      count: category.count,
      children: category.subcategories.map((subcategory) => ({
        id: `${section.id}:${category.id}:${subcategory.id}`,
        label: subcategory.label,
        href: encyclopediaHref(section.id, category.label, subcategory.label),
        count: subcategory.count
      }))
    }))
  }));
}

function EntryCard({ entry, sectionId }: { entry: EncyclopediaBrowserEntry; sectionId: string }) {
  return (
    <Link
      href={`/encyclopedia?section=${sectionId}&entry=${encodeURIComponent(entry.id)}`}
      scroll={false}
      className="group flex min-h-[14rem] flex-col rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 transition hover:border-cyan-300/55 hover:bg-cyan-300/5 focus-visible:border-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{entry.category}</p>
          <h2 className="mt-2 truncate text-lg font-black text-white" title={entry.displayName}>{entry.displayName}</h2>
          <p className="mt-1 truncate text-sm font-bold text-cyan-100" title={entry.canonicalRecordId}>{entry.canonicalRecordId}</p>
        </div>
        <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.1em]", statusClass(entry.publicationState))}>{entry.publicationState.replaceAll("_", " ")}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{entry.summary || entry.description || "Editorial summary pending."}</p>
      <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
        <WorkspaceMiniStat label="Data" value={`${entry.completeness.dataReadiness}%`} />
        <WorkspaceMiniStat label="Art" value={`${entry.completeness.artReadiness}%`} />
        <WorkspaceMiniStat label="Edit" value={`${entry.completeness.editorialReadiness}%`} />
      </div>
    </Link>
  );
}

export function EncyclopediaBrowser({ sections, entries, selectedSectionId, selectedCategory, selectedSubcategory, query, matchedCount, sectionTotal, limit }: EncyclopediaBrowserProps) {
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0];
  const selectedCategoryNode = selectedSection?.categories.find((category) => category.label === selectedCategory);
  const selectedSubcategoryNode = selectedCategoryNode?.subcategories.find((subcategory) => subcategory.label === selectedSubcategory);
  const activeFolder = selectedSubcategoryNode
    ? `${selectedSection.id}:${selectedCategoryNode?.id}:${selectedSubcategoryNode.id}`
    : selectedCategoryNode
      ? `${selectedSection.id}:${selectedCategoryNode.id}`
      : selectedSection?.id ?? selectedSectionId;
  const activeTitle = selectedSubcategoryNode?.label ?? selectedCategoryNode?.label ?? selectedSection?.label ?? "Encyclopedia";
  const nodes = treeNodes(sections);

  return (
    <main className="space-y-3">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 px-4 py-3 shadow-glow">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
            <BookOpen className="h-5 w-5 text-cyan-100" />
          </div>
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-cyan-300">Home Library</p>
            <h1 className="text-2xl font-black text-white">Encyclopedia</h1>
          </div>
        </div>
      </section>

      <ResizableDiscoveryLayout
        preferenceKey="project-genesis-encyclopedia-tree-width"
        label="encyclopedia tree"
        sidebar={(
          <aside className="min-h-0 rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-3 shadow-glow lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
            <div className="mb-3 flex items-center gap-2 px-1">
              <Compass className="h-4 w-4 text-cyan-200" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Content Tree</p>
                <p className="text-xs text-slate-500">Browse canonical knowledge</p>
              </div>
            </div>
            <DiscoveryLibraryTree nodes={nodes} activeFolder={activeFolder} ariaLabel="Encyclopedia content folders" expandTopLevel={false} />
          </aside>
        )}
      >
        <div className="space-y-3">
          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Canonical Index</p>
                <h2 className="mt-1 text-2xl font-black text-white">{activeTitle}</h2>
                <p className="mt-1 text-sm text-slate-400">{matchedCount.toLocaleString()} matched / {sectionTotal.toLocaleString()} in {selectedSection?.label ?? "section"}</p>
              </div>
              {selectedSection ? <WorkspaceBadge value={selectedSection.status} className="text-[0.58rem]" /> : null}
            </div>
          </section>

          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-3">
            <form className="grid gap-3 lg:grid-cols-[1fr_auto_auto]" action="/encyclopedia">
              <input type="hidden" name="section" value={selectedSectionId} />
              {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
              {selectedSubcategory ? <input type="hidden" name="subcategory" value={selectedSubcategory} /> : null}
              <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
                <Search className="h-4 w-4 text-cyan-200" />
                <input name="q" defaultValue={query} placeholder="Search encyclopedia entries" className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600" />
              </label>
              <button type="submit" className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15">Search</button>
              <Link href="/asset-library?q=encyclopedia" className="inline-flex items-center justify-center rounded-md border border-cyan-300/15 bg-slate-950/45 px-4 py-3 text-sm font-black text-slate-300 transition hover:border-cyan-200/45 hover:text-white">Asset Library</Link>
            </form>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-300">
              <Database className="h-4 w-4 text-cyan-200" />
              {entries.length.toLocaleString()} shown / {matchedCount.toLocaleString()} matched
            </div>
          </section>

          {entries.length ? (
            <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {entries.map((entry) => <EntryCard key={entry.id} entry={entry} sectionId={selectedSectionId} />)}
            </section>
          ) : (
            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-8 text-center text-sm text-slate-400">No encyclopedia entries match this folder.</section>
          )}

          {entries.length < matchedCount ? (
            <div className="flex justify-center pt-2">
              <Link href={encyclopediaHref(selectedSectionId, selectedCategory, selectedSubcategory, query, limit + 96)} scroll={false} className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15">
                Load 96 More
              </Link>
            </div>
          ) : null}
        </div>
      </ResizableDiscoveryLayout>
    </main>
  );
}
