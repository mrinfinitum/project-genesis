"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, TreePine } from "lucide-react";
import { GeneratedLibraryCard } from "@/components/generated-library-card";
import type { SpeciesRecord } from "@/lib/life/creature-system";

export function SpeciesLibrary({ species }: { species: SpeciesRecord[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => species.filter((row) => `${row.displayName} ${row.scientificName} ${row.functionalCategories.join(" ")} ${row.ecologicalRoles.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [species, query]);
  return <main className="space-y-6">
    <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Libraries · Life</p><h1 className="mt-2 text-3xl font-black text-white">Species Library</h1><p className="mt-2 text-sm text-slate-400">Canonical species definitions, taxonomy, ecology, yields, and production references.</p></div><Link href="/creature-generator" className="rounded-md border border-cyan-200/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-black text-cyan-100 hover:bg-cyan-300/20">Open Creature Generator</Link></div></section>
    <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-4"><div className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 py-2"><Search className="h-4 w-4 text-slate-500" /><input className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-100 outline-none" placeholder="Search species, taxonomy, habitat, role" value={query} onChange={(event) => setQuery(event.target.value)} /><span className="text-xs font-bold text-slate-500">{filtered.length} shown</span></div></section>
    {filtered.length ? <section className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">{filtered.map((row) => <GeneratedLibraryCard key={row.id} record={{ id: row.id, name: row.displayName, type: "Species", classification: row.functionalCategories[0], parent: row.originPlanetId ?? "Unassigned", contains: row.ecologicalRoles[0], status: row.canonStatus, href: "/species/" + row.id, tone: "species" }} />)}</section> : <section className="rounded-lg border border-dashed border-cyan-300/20 bg-slate-950/30 p-12 text-center"><TreePine className="mx-auto h-8 w-8 text-cyan-200" /><h2 className="mt-4 text-lg font-black text-white">No species match this view</h2><p className="mt-2 text-sm text-slate-400">Generate a deterministic preview, then promote it into the canonical Species Library through author review.</p></section>}
  </main>;
}
