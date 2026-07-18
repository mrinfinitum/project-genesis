"use client";

import { useMemo, useState } from "react";
import { Bot, Database, Filter, Search } from "lucide-react";
import { CanonicalIndex } from "@/components/ui/workspace";
import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import type { AiAgentLibraryState } from "@/lib/ai-agents";

function toCardRecord(agent: AiAgentLibraryState["agents"][number]): GeneratedLibraryCardRecord {
  return {
    id: agent.id,
    name: agent.displayName,
    type: "AI Agent",
    classification: agent.rarity,
    parent: agent.personalityId,
    contains: `${agent.supportedStates.length} states`,
    status: agent.publishState,
    href: `/ai-agents?agent=${encodeURIComponent(agent.id)}`,
    tone: "neutral",
    thumbnailUrl: agent.primaryPreview.url || undefined
  };
}

export function AiAgentsLibrary({ state }: { state: AiAgentLibraryState }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const indexItems = useMemo(() => [
    { label: "Agents", value: state.stats.total.toLocaleString(), detail: "canonical companions" },
    { label: "Published", value: state.stats.published.toLocaleString(), detail: "runtime ready" },
    { label: "Web Ready", value: state.stats.webReady.toLocaleString(), detail: "mapped art" },
    { label: "Needs Art", value: state.stats.missingArtwork.toLocaleString(), detail: "blocking visuals" }
  ], [state.stats]);
  const filteredAgents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.agents.filter((agent) => {
      const matchesStatus = status === "all" || agent.publishState === status;
      const matchesQuery = !needle || [
        agent.displayName,
        agent.shortDisplayName,
        agent.id,
        agent.personalityId,
        agent.rarity,
        agent.description,
        ...agent.supportedStates,
        ...agent.componentLibraryReferences
      ].join(" ").toLowerCase().includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [query, state.agents, status]);

  return (
    <main className="space-y-6">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
            <Bot className="h-6 w-6 text-cyan-100" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Canonical Library</p>
            <h1 className="mt-2 text-4xl font-black text-white">AI Agents</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Browse canonical companion agents, state artwork, rarity, and runtime readiness.</p>
          </div>
        </div>
      </section>

      <CanonicalIndex
        title="AI Agents"
        description="Agents use the same library browsing pattern as planets, stars, research, and buildings. Production details live inside each opened record."
        items={indexItems}
      />

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_16rem]">
          <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
            <Search className="h-4 w-4 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search AI agents"
              className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600"
            />
          </label>
          <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
            <Filter className="h-4 w-4 text-cyan-200" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 flex-1 bg-transparent text-sm font-bold text-white outline-none">
              <option value="all" className="bg-slate-950">All Status</option>
              <option value="published" className="bg-slate-950">Published</option>
              <option value="draft" className="bg-slate-950">Draft</option>
            </select>
          </label>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-300">
          <Database className="h-4 w-4 text-cyan-200" />
          {filteredAgents.length.toLocaleString()} shown / {state.agents.length.toLocaleString()} total
        </div>
      </section>

      <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredAgents.map((agent) => <GeneratedLibraryCard key={agent.id} record={toCardRecord(agent)} />)}
      </section>
    </main>
  );
}
