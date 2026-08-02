"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { VisualPromptOutput } from "@/components/visual-prompt-output";
import { compileStarSystemVisualPrompt, type StarSystemVisualMode } from "@/lib/visual-production/celestial-prompt-compiler";
import type { StarSystemPromptTemplate } from "@/data/star-system-generation-prompts";

function groupPrompts(rows: StarSystemPromptTemplate[]) {
  return rows.reduce<Record<string, StarSystemPromptTemplate[]>>((groups, row) => {
    groups[row.systemClass] = [...(groups[row.systemClass] ?? []), row];
    return groups;
  }, {});
}

export function StarSystemGenerationLibrary({ rows }: { rows: StarSystemPromptTemplate[] }) {
  const [query, setQuery] = useState("");
  const [systemClass, setSystemClass] = useState("all");
  const [mode, setMode] = useState<StarSystemVisualMode>("complete-system");
  const [selectedId, setSelectedId] = useState(() => `${rows[0]?.systemClass}-${rows[0]?.subclass}`);
  const classes = useMemo(() => [...new Set(rows.map((row) => row.systemClass))], [rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => (systemClass === "all" || row.systemClass === systemClass) && (!normalizedQuery || `${row.systemClass} ${row.subclass} ${row.displayName} ${row.systemPrompt}`.toLowerCase().includes(normalizedQuery)));
  }, [query, rows, systemClass]);
  const groups = useMemo(() => groupPrompts(filteredRows), [filteredRows]);
  const selected = rows.find((row) => `${row.systemClass}-${row.subclass}` === selectedId) ?? rows[0];
  const prompt = useMemo(() => compileStarSystemVisualPrompt(selected, mode), [mode, selected]);

  return <div className="space-y-7">
    <section><p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Star System Generator</p><h1 className="mt-2 text-4xl font-bold text-white">Handcrafted Star System Prompts</h1><p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">Select a system profile and resolve a concise, model-ready visual prompt. Canonical systems, IDs, seeds, and body records remain separate from the image instruction.</p></section>
    <section className="grid gap-3 md:grid-cols-[1fr_260px_260px]"><label className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search star system prompts" className="h-12 w-full rounded-md border border-cyan-400/20 bg-[#07101e]/85 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60" /></label><select value={systemClass} onChange={(event) => setSystemClass(event.target.value)} className="h-12 rounded-md border border-cyan-400/20 bg-[#07101e]/85 px-4 text-sm text-white outline-none transition focus:border-cyan-300/60"><option value="all">All system types</option>{classes.map((value) => <option key={value} value={value}>{value}</option>)}</select><select value={mode} onChange={(event) => setMode(event.target.value as StarSystemVisualMode)} className="h-12 rounded-md border border-cyan-400/20 bg-[#07101e]/85 px-4 text-sm text-white outline-none transition focus:border-cyan-300/60"><option value="complete-system">Complete System Reference</option><option value="environment-painting">Environment Painting</option></select></section>
    <div className="rounded-md border border-cyan-400/15 bg-[#07101e]/70 px-4 py-3 text-sm font-semibold text-slate-300">{filteredRows.length} shown / {rows.length} total</div>
    {Object.entries(groups).map(([group, items]) => <section key={group} className="space-y-3"><h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{group}</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{items.map((row) => { const id = `${row.systemClass}-${row.subclass}`; const active = id === selectedId; return <button type="button" key={id} onClick={() => setSelectedId(id)} className={`flex min-h-52 flex-col rounded-md border p-4 text-left shadow-glow transition ${active ? "border-cyan-300/60 bg-cyan-300/10" : "border-cyan-400/15 bg-[#07101e]/85 hover:border-cyan-300/35"}`}><p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{row.systemClass}</p><h3 className="mt-2 text-lg font-semibold text-white">{row.displayName}</h3><p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{row.subclass}</p><p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{row.systemPrompt}</p><span className="mt-5 inline-flex h-9 items-center rounded-md border border-cyan-400/25 bg-cyan-300/10 px-3 text-xs font-bold text-cyan-100">{active ? "Selected" : "Select profile"}</span></button>; })}</div></section>)}
    {!filteredRows.length ? <section className="rounded-md border border-dashed border-cyan-400/20 py-16 text-center text-sm text-slate-500">No star system profile matches this search.</section> : null}
    {selected ? <VisualPromptOutput prompt={prompt} /> : null}
  </div>;
}
