"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildCosmicGenerationPrompt,
  type CosmicGenerationPromptTemplate
} from "@/data/cosmic-generation-prompts";

function groupedRows(rows: CosmicGenerationPromptTemplate[]) {
  return rows.reduce<Record<string, CosmicGenerationPromptTemplate[]>>((groups, row) => {
    groups[row.category] = [...(groups[row.category] ?? []), row];
    return groups;
  }, {});
}

export function CosmicGenerationPromptLibrary({
  title,
  masterPrompt,
  rows,
  description,
  authoringRule,
  searchPlaceholder,
  allTypesLabel
}: {
  title: string;
  masterPrompt: string;
  rows: CosmicGenerationPromptTemplate[];
  description: string;
  authoringRule: string;
  searchPlaceholder: string;
  allTypesLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const categories = useMemo(() => [...new Set(rows.map((row) => row.category))], [rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesCategory = category === "all" || row.category === category;
      const searchText = `${row.category} ${row.subclass} ${row.displayName} ${row.prompt}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [category, query, rows]);
  const groups = useMemo(() => groupedRows(filteredRows), [filteredRows]);

  async function copyPrompt(value: string, id: string) {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1400);
  }

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Prompt Library</p>
            <h1 className="mt-2 text-4xl font-bold text-white">{title}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{description}</p>
          </div>
          <Button type="button" className="h-9 border-cyan-400/25 bg-cyan-300/10 px-3 text-cyan-100 hover:bg-cyan-300/20" onClick={() => copyPrompt(masterPrompt, "master")}>
            {copiedId === "master" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Master Prompt
          </Button>
        </div>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 text-xs leading-5 text-slate-300 shadow-glow">{masterPrompt}</pre>
        <div className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Authoring Rule</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{authoringRule}</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-[1fr_260px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} className="h-12 w-full rounded-md border border-cyan-400/20 bg-[#07101e]/85 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 rounded-md border border-cyan-400/20 bg-[#07101e]/85 px-4 text-sm text-white outline-none transition focus:border-cyan-300/60">
          <option value="all">{allTypesLabel}</option>
          {categories.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </section>

      <div className="rounded-md border border-cyan-400/15 bg-[#07101e]/70 px-4 py-3 text-sm font-semibold text-slate-300">{filteredRows.length} shown / {rows.length} total</div>

      {Object.entries(groups).map(([group, items]) => (
        <section key={group} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{group}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {items.map((row) => {
              const id = `${row.category}-${row.subclass}`;
              return (
                <article key={id} className="flex min-h-56 flex-col rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{row.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{row.displayName}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{row.subclass}</p>
                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{row.prompt}</p>
                  <Button type="button" className="mt-5 h-9 border-cyan-400/25 bg-cyan-300/10 px-3 text-cyan-100 hover:bg-cyan-300/20" onClick={() => copyPrompt(buildCosmicGenerationPrompt(masterPrompt, row), id)}>
                    {copiedId === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedId === id ? "Prompt Copied" : "Copy Prompt"}
                  </Button>
                </article>
              );
            })}
          </div>
        </section>
      ))}
      {!filteredRows.length ? <section className="rounded-md border border-dashed border-cyan-400/20 py-16 text-center text-sm text-slate-500">No handcrafted prompt matches this search.</section> : null}
    </div>
  );
}
