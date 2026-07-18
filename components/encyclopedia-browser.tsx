"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Database, Search } from "lucide-react";
import { WorkspaceBadge, WorkspaceMiniStat } from "@/components/ui/workspace";
import type { EncyclopediaEntry, EncyclopediaSection } from "@/lib/encyclopedia";
import { cn } from "@/lib/utils";

type EncyclopediaBrowserProps = {
  sections: EncyclopediaSection[];
  entries: EncyclopediaEntry[];
  initialSectionId: string;
  initialQuery: string;
};

function statusClass(status: string) {
  if (/published|ready|complete/i.test(status)) return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  if (/missing|blocked|invalid/i.test(status)) return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  return "border-amber-300/35 bg-amber-400/10 text-amber-100";
}

function EntryCard({ entry }: { entry: EncyclopediaEntry }) {
  return (
    <Link
      href={`/encyclopedia?section=${entry.entityType}&entry=${encodeURIComponent(entry.id)}`}
      className="group flex min-h-[14rem] flex-col rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-4 transition hover:border-cyan-300/55 hover:bg-cyan-300/5 focus-visible:border-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{entry.category}</p>
          <h2 className="mt-2 truncate text-xl font-black text-white" title={entry.displayName}>{entry.displayName}</h2>
          <p className="mt-1 truncate text-sm font-bold text-cyan-100" title={entry.canonicalRecordId}>{entry.canonicalRecordId}</p>
        </div>
        <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em]", statusClass(entry.publicationState))}>{entry.publicationState}</span>
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

export function EncyclopediaBrowser({ sections, entries, initialSectionId, initialQuery }: EncyclopediaBrowserProps) {
  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
  const [query, setQuery] = useState(initialQuery);
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0];
  const sectionEntries = selectedSection ? selectedSection.entries : entries;
  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sectionEntries.filter((entry) => {
      if (!needle) return true;
      return [
        entry.displayName,
        entry.canonicalRecordId,
        entry.category,
        entry.subcategory,
        entry.era,
        entry.summary,
        entry.description,
        ...entry.tags
      ].join(" ").toLowerCase().includes(needle);
    });
  }, [query, sectionEntries]);

  return (
    <main className="space-y-5">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
            <BookOpen className="h-6 w-6 text-cyan-100" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Home Library</p>
            <h1 className="mt-2 text-4xl font-black text-white">Encyclopedia</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Browse canonical game knowledge with the same content-browser rhythm as Asset Library.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[18rem_1fr]">
        <aside className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3">
          <p className="px-2 pb-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Content Tree</p>
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setSelectedSectionId(section.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-black transition",
                  selectedSection?.id === section.id ? "bg-cyan-300/12 text-white" : "text-slate-400 hover:bg-cyan-300/5 hover:text-slate-100"
                )}
              >
                <span className="truncate">{section.label}</span>
                <span className="rounded-md border border-cyan-300/10 bg-slate-950/45 px-2 py-1 text-xs text-slate-400">{section.entries.length}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
                <Search className="h-4 w-4 text-cyan-200" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search encyclopedia entries"
                  className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600"
                />
              </label>
              <Link href="/asset-library?q=encyclopedia" className="inline-flex items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15">
                Asset Library
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-300">
                <Database className="h-4 w-4 text-cyan-200" />
                {filteredEntries.length.toLocaleString()} shown / {sectionEntries.length.toLocaleString()} total
              </span>
              {selectedSection ? <WorkspaceBadge value={selectedSection.status} className="text-[0.58rem]" /> : null}
            </div>
          </section>

          <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredEntries.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
          </section>
        </div>
      </section>
    </main>
  );
}
