"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { VisualPromptOutput } from "@/components/visual-prompt-output";
import { compileGalacticRegionVisualPrompt, compileGalaxyVisualPrompt } from "@/lib/visual-production/celestial-prompt-compiler";
import type { CosmicGenerationPromptTemplate } from "@/data/cosmic-generation-prompts";

function groupedRows(rows: CosmicGenerationPromptTemplate[]) {
  return rows.reduce<Record<string, CosmicGenerationPromptTemplate[]>>((groups, row) => {
    groups[row.category] = [...(groups[row.category] ?? []), row];
    return groups;
  }, {});
}

export function CosmicGenerationPromptLibrary({
  title,
  rows,
  description,
  searchPlaceholder,
  allTypesLabel,
  kind
}: {
  title: string;
  rows: CosmicGenerationPromptTemplate[];
  description: string;
  searchPlaceholder: string;
  allTypesLabel: string;
  kind: "galaxy" | "galactic-region";
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(() => `${rows[0]?.category}-${rows[0]?.subclass}`);
  const categories = useMemo(() => [...new Set(rows.map((row) => row.category))], [rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => (category === "all" || row.category === category) && (!normalizedQuery || `${row.category} ${row.subclass} ${row.displayName} ${row.prompt}`.toLowerCase().includes(normalizedQuery)));
  }, [category, query, rows]);
  const groups = useMemo(() => groupedRows(filteredRows), [filteredRows]);
  const selected = rows.find((row) => `${row.category}-${row.subclass}` === selectedId) ?? rows[0];
  const visualPrompt = useMemo(() => kind === "galaxy" ? compileGalaxyVisualPrompt(selected) : compileGalacticRegionVisualPrompt(selected), [kind, selected]);

  return (
    <div className="space-y-7">
      <section className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{kind === "galaxy" ? "Galaxy Generator" : "Galactic Region Generator"}</p><h1 className="text-4xl font-bold text-white">{title}</h1><p className="max-w-4xl text-sm leading-6 text-slate-300">{description} Select a profile to resolve a model-ready visual prompt; Studio keeps the associated canonical data separate.</p></section>
      <section className="grid gap-3 md:grid-cols-[1fr_260px]"><label className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} className="h-12 w-full rounded-md border border-cyan-400/20 bg-[#07101e]/85 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 rounded-md border border-cyan-400/20 bg-[#07101e]/85 px-4 text-sm text-white outline-none transition focus:border-cyan-300/60"><option value="all">{allTypesLabel}</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></section>
      <div className="rounded-md border border-cyan-400/15 bg-[#07101e]/70 px-4 py-3 text-sm font-semibold text-slate-300">{filteredRows.length} shown / {rows.length} total</div>
      {Object.entries(groups).map(([group, items]) => <section key={group} className="space-y-3"><h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{group}</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{items.map((row) => { const id = `${row.category}-${row.subclass}`; const selectedRow = id === selectedId; return <button type="button" key={id} onClick={() => setSelectedId(id)} className={`flex min-h-52 flex-col rounded-md border p-4 text-left shadow-glow transition ${selectedRow ? "border-cyan-300/60 bg-cyan-300/10" : "border-cyan-400/15 bg-[#07101e]/85 hover:border-cyan-300/35"}`}><p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{row.category}</p><h3 className="mt-2 text-lg font-semibold text-white">{row.displayName}</h3><p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{row.subclass}</p><p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{row.prompt}</p><span className="mt-5 inline-flex h-9 items-center rounded-md border border-cyan-400/25 bg-cyan-300/10 px-3 text-xs font-bold text-cyan-100">{selectedRow ? "Selected" : "Select profile"}</span></button>; })}</div></section>)}
      {!filteredRows.length ? <section className="rounded-md border border-dashed border-cyan-400/20 py-16 text-center text-sm text-slate-500">No profile matches this search.</section> : null}
      {selected ? <VisualPromptOutput prompt={visualPrompt} /> : null}
    </div>
  );
}
