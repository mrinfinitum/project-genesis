"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Database, Filter, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UniverseLibraryKind, UniverseLibraryRecord } from "@/lib/universe/library";

type GeneratedUniverseLibraryProps = {
  kind: UniverseLibraryKind;
  title: string;
  description: string;
  generateLabel: string;
  records: UniverseLibraryRecord[];
  emptyMessage: string;
};

const previewStyles: Record<UniverseLibraryRecord["previewTone"], string> = {
  galaxy: "from-indigo-400/30 via-cyan-300/15 to-fuchsia-300/20",
  sector: "from-cyan-300/25 via-slate-700/20 to-blue-500/20",
  system: "from-amber-300/25 via-cyan-300/10 to-slate-800/20",
  star: "from-amber-200/45 via-orange-300/20 to-slate-900/20",
  planet: "from-emerald-300/25 via-cyan-300/10 to-blue-500/20",
  discovery: "from-violet-300/25 via-cyan-300/10 to-slate-900/20",
  civilization: "from-rose-300/20 via-cyan-300/10 to-amber-300/15"
};

function statusClass(status: UniverseLibraryRecord["status"]) {
  if (status === "Published" || status === "Approved" || status === "Generated") return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  if (status === "Invalid") return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  return "border-amber-300/35 bg-amber-400/10 text-amber-100";
}

function readinessClass(readiness: UniverseLibraryRecord["readiness"]) {
  if (readiness === "Ready") return "border-cyan-300/35 bg-cyan-400/10 text-cyan-100";
  if (readiness === "Invalid" || readiness === "Missing Required Relationship") return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  return "border-amber-300/35 bg-amber-400/10 text-amber-100";
}

function LibraryPreview({ record }: { record: UniverseLibraryRecord }) {
  return (
    <div className={cn("relative h-28 overflow-hidden rounded-md border border-cyan-300/15 bg-gradient-to-br", previewStyles[record.previewTone])}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,rgba(6,182,212,0.15),transparent_55%)]" />
      <div className="absolute inset-x-5 top-5 h-px bg-cyan-200/25" />
      <div className="absolute bottom-4 left-5 right-5">
        <div className="h-1.5 w-2/3 rounded-full bg-cyan-200/45" />
        <div className="mt-2 h-1.5 w-1/3 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

function GeneratedRecordCard({ record }: { record: UniverseLibraryRecord }) {
  return (
    <Link
      href={record.href}
      className="group block rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 transition hover:border-cyan-300/55 hover:bg-cyan-300/5 focus-visible:border-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30"
    >
      <LibraryPreview record={record} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-white">{record.name}</p>
          <p className="mt-1 truncate text-sm font-semibold text-cyan-100">{record.type}</p>
          {record.subtype ? <p className="truncate text-xs font-semibold text-slate-400">{record.subtype}</p> : null}
        </div>
        <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em]", statusClass(record.status))}>{record.status}</span>
      </div>
      <div className="mt-3 grid gap-2 text-xs">
        {record.parentLabel ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/35 px-3 py-2">
            <span className="text-slate-500">Parent</span>
            <span className="truncate font-bold text-slate-200">{record.parentLabel}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/35 px-3 py-2">
          <span className="text-slate-500">ID</span>
          <span className="truncate font-mono text-cyan-100">{record.id}</span>
        </div>
        {record.seed ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/35 px-3 py-2">
            <span className="text-slate-500">Seed</span>
            <span className="truncate font-mono text-slate-200">{record.seed}</span>
          </div>
        ) : null}
        {record.childCountLabel ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/35 px-3 py-2">
            <span className="text-slate-500">Contains</span>
            <span className="truncate font-bold text-slate-200">{record.childCountLabel}</span>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className={cn("rounded-md border px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em]", readinessClass(record.readiness))}>{record.readiness}</span>
        <span className="text-sm font-black text-cyan-100 transition group-hover:text-white">Open</span>
      </div>
    </Link>
  );
}

export function GeneratedUniverseLibrary({ title, description, generateLabel, records, emptyMessage }: GeneratedUniverseLibraryProps) {
  const [query, setQuery] = useState("");
  const [readiness, setReadiness] = useState("all");
  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesReadiness = readiness === "all" || record.readiness === readiness;
      const matchesQuery = !needle || [record.name, record.id, record.type, record.subtype, record.parentLabel, record.seed].some((value) => String(value ?? "").toLowerCase().includes(needle));
      return matchesReadiness && matchesQuery;
    });
  }, [query, readiness, records]);

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
          {filteredRecords.length.toLocaleString()} shown / {records.length.toLocaleString()} total
        </div>
      </section>

      {filteredRecords.length ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredRecords.map((record) => <GeneratedRecordCard key={record.id} record={record} />)}
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
