"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Database, Filter, Plus, Search } from "lucide-react";
import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { CanonicalIndex } from "@/components/ui/workspace";
import type { UniverseLibraryKind, UniverseLibraryRecord } from "@/lib/universe/library";

type GeneratedUniverseLibraryProps = {
  kind: UniverseLibraryKind;
  title: string;
  description: string;
  generateLabel: string;
  records: UniverseLibraryRecord[];
  emptyMessage: string;
  totalRecords?: number;
  currentPage?: number;
  pageCount?: number;
  pageHref?: string;
};

function toGeneratedCardRecord(record: UniverseLibraryRecord): GeneratedLibraryCardRecord {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    classification: record.subtype,
    parent: record.parentLabel,
    contains: record.childCountLabel,
    status: record.readiness,
    href: record.href,
    tone: record.previewTone,
    thumbnailUrl: record.thumbnailUrl,
    thumbnailWebpUrl: record.thumbnailWebpUrl,
    thumbnailAvifUrl: record.thumbnailAvifUrl,
    thumbnailSrcSet: record.thumbnailSrcSet,
    mediumPreviewUrl: record.mediumPreviewUrl,
    focalPoint: record.focalPoint
  };
}

export function GeneratedUniverseLibrary({ kind, title, description, generateLabel, records, emptyMessage, totalRecords, currentPage, pageCount, pageHref }: GeneratedUniverseLibraryProps) {
  const [query, setQuery] = useState("");
  const [readiness, setReadiness] = useState("all");
  const storageKey = `project-genesis-hidden-library-records:${kind}`;
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      setHiddenIds(JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as string[]);
    } catch {
      setHiddenIds([]);
    }
  }, [storageKey]);
  const visibleRecords = useMemo(() => records.filter((record) => !hiddenIds.includes(record.id)), [hiddenIds, records]);
  const indexItems = useMemo(() => {
    const readyCount = visibleRecords.filter((record) => /^ready$/i.test(record.readiness)).length;
    const typeCount = new Set(visibleRecords.map((record) => record.type).filter(Boolean)).size;
    const parentCount = new Set(visibleRecords.map((record) => record.parentLabel).filter(Boolean)).size;

    return [
      { label: "Records", value: (totalRecords ?? visibleRecords.length).toLocaleString(), detail: "generated only" },
      { label: "Ready", value: readyCount.toLocaleString(), detail: "runtime ready" },
      { label: "Types", value: typeCount.toLocaleString(), detail: "canonical classes" },
      { label: "Parents", value: parentCount.toLocaleString(), detail: "resolved links" }
    ];
  }, [totalRecords, visibleRecords]);
  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return visibleRecords.filter((record) => {
      const matchesReadiness = readiness === "all" || record.readiness === readiness;
      const matchesQuery = !needle || [record.name, record.id, record.type, record.subtype, record.parentLabel, record.seed].some((value) => String(value ?? "").toLowerCase().includes(needle));
      return matchesReadiness && matchesQuery;
    });
  }, [query, readiness, visibleRecords]);
  const hideRecord = (record: GeneratedLibraryCardRecord) => {
    setHiddenIds((current) => {
      const next = current.includes(record.id) ? current : [...current, record.id];
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className="space-y-6">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Universe Library</p>
            <h1 className="mt-2 text-4xl font-black text-white">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15">
              <Plus className="h-4 w-4" />
              {generateLabel}
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-md border border-slate-500/35 bg-slate-950/45 px-4 py-3 text-sm font-black text-slate-200 transition hover:border-cyan-200/45">
              Import
            </button>
          </div>
        </div>
      </section>

      <CanonicalIndex
        title={title}
        description="Generated canonical records only. Gameplay progression, screen workflows, and implementation details live in their dedicated workspaces."
        items={indexItems}
      />

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_16rem]">
          <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
            <Search className="h-4 w-4 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}`}
              className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600"
            />
          </label>
          <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
            <Filter className="h-4 w-4 text-cyan-200" />
            <select value={readiness} onChange={(event) => setReadiness(event.target.value)} className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none">
              <option value="all" className="bg-slate-950">All Readiness</option>
              <option value="Ready" className="bg-slate-950">Ready</option>
              <option value="Not Published" className="bg-slate-950">Not Published</option>
              <option value="Invalid" className="bg-slate-950">Invalid</option>
              <option value="Missing Required Relationship" className="bg-slate-950">Missing Required Relationship</option>
            </select>
          </label>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-300">
          <Database className="h-4 w-4 text-cyan-200" />
          {filteredRecords.length.toLocaleString()} shown / {(totalRecords ?? visibleRecords.length).toLocaleString()} total
        </div>
        {pageHref && currentPage && pageCount && pageCount > 1 ? (
          <nav className="mt-3 flex items-center justify-between gap-3 border-t border-cyan-300/10 pt-3" aria-label={`${title} pages`}>
            <Link href={`${pageHref}?page=${Math.max(1, currentPage - 1)}`} scroll={false} aria-disabled={currentPage === 1} className={`rounded-md border px-3 py-2 text-xs font-black ${currentPage === 1 ? "pointer-events-none border-slate-700/40 text-slate-600" : "border-cyan-300/20 text-cyan-100 hover:border-cyan-300/50"}`}>Previous</Link>
            <span className="text-xs font-bold text-slate-400">Page {currentPage.toLocaleString()} of {pageCount.toLocaleString()}</span>
            <Link href={`${pageHref}?page=${Math.min(pageCount, currentPage + 1)}`} scroll={false} aria-disabled={currentPage === pageCount} className={`rounded-md border px-3 py-2 text-xs font-black ${currentPage === pageCount ? "pointer-events-none border-slate-700/40 text-slate-600" : "border-cyan-300/20 text-cyan-100 hover:border-cyan-300/50"}`}>Next</Link>
          </nav>
        ) : null}
      </section>

      {filteredRecords.length ? (
        <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredRecords.map((record) => <GeneratedLibraryCard key={record.id} record={toGeneratedCardRecord(record)} onDelete={hideRecord} />)}
        </section>
      ) : (
        <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-8 text-center">
          <p className="text-xl font-black text-white">{emptyMessage}</p>
          <p className="mt-2 text-sm text-slate-400">Generate or import a canonical record before this catalog displays cards.</p>
        </section>
      )}
    </main>
  );
}
