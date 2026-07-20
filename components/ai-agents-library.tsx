"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight, Database, Search } from "lucide-react";
import { DiscoveryLibraryTree, type DiscoveryTreeNode } from "@/components/discovery-library-tree";
import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { ResizableDiscoveryLayout } from "@/components/resizable-discovery-layout";
import { CanonicalIndex, WorkspaceBadge, WorkspaceStatTile } from "@/components/ui/workspace";
import type { AiAgentLibraryState } from "@/lib/ai-agents";

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function href(section: string, entry?: string) {
  const params = new URLSearchParams({ section });
  if (entry) params.set("entry", entry);
  return `/ai-agents?${params.toString()}`;
}

function buildTree(state: AiAgentLibraryState): DiscoveryTreeNode[] {
  const classes = [...new Set(state.records.map((agent) => agent.agentClass ?? "Studio Companions"))].sort();
  return [
    {
      id: "agents",
      label: "AI Agents",
      href: href("agents"),
      count: state.records.length,
      icon: "folder",
      children: classes.map((agentClass) => ({
        id: `class:${slug(agentClass)}`,
        label: agentClass,
        href: href(`class:${slug(agentClass)}`),
        count: state.records.filter((agent) => (agent.agentClass ?? "Studio Companions") === agentClass).length
      }))
    },
    { id: "terminals", label: "Forgotten Terminals", href: href("terminals"), count: state.terminals.length, icon: "folder" },
    { id: "personalities", label: "Personalities", href: href("personalities"), count: state.catalogPersonalities.length, icon: "folder" },
    { id: "memory-fragments", label: "Memory Fragments", href: href("memory-fragments"), count: state.memoryFragments.length, icon: "folder" },
    { id: "dialogue-packs", label: "Dialogue Packs", href: href("dialogue-packs"), count: state.dialoguePacks.length, icon: "folder" },
    { id: "relationships", label: "Relationships", href: href("relationships"), count: state.relationships.length, icon: "folder" }
  ];
}

function agentCard(agent: AiAgentLibraryState["agents"][number], section: string): GeneratedLibraryCardRecord {
  return {
    id: agent.id,
    name: agent.displayName,
    type: agent.agentClass ?? "AI Agent",
    classification: agent.specialization ?? agent.catalogRarity ?? agent.rarity,
    parent: agent.terminalType ?? agent.personalityId,
    contains: `${agent.supportedStates.length} states`,
    status: agent.publishState,
    href: href(section, agent.id),
    tone: "neutral",
    thumbnailUrl: agent.primaryPreview.url || undefined
  };
}

function moduleCard(record: { id: string; displayName: string; agentIds: string[]; status: string }, section: string, type: string, parent?: string): GeneratedLibraryCardRecord {
  return {
    id: record.id,
    name: record.displayName,
    type,
    classification: `${record.agentIds.length} linked agent${record.agentIds.length === 1 ? "" : "s"}`,
    parent,
    contains: record.agentIds.join(", ") || "No linked agents",
    status: record.status,
    href: href(section, record.id),
    tone: "neutral"
  };
}

function sectionTitle(section: string) {
  if (section.startsWith("class:")) return section.split(":")[1].replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return ({ agents: "All AI Agents", terminals: "Forgotten Terminals", personalities: "Personalities", "memory-fragments": "Memory Fragments", "dialogue-packs": "Dialogue Packs", relationships: "Relationships" } as Record<string, string>)[section] ?? "All AI Agents";
}

export function AiAgentsLibrary({ state, activeSection = "agents", activeEntry }: { state: AiAgentLibraryState; activeSection?: string; activeEntry?: string }) {
  const [query, setQuery] = useState("");
  const tree = useMemo(() => buildTree(state), [state]);
  const title = sectionTitle(activeSection);
  const selectedAgent = state.records.find((agent) => agent.id === activeEntry);
  const selectedTerminal = state.terminals.find((record) => record.id === activeEntry);
  const selectedPersonality = state.catalogPersonalities.find((record) => record.id === activeEntry);

  const records = useMemo(() => {
    if (activeSection === "terminals") return state.terminals.map((record) => moduleCard(record, activeSection, "Forgotten Terminal", record.discoverySources.join(", ")));
    if (activeSection === "personalities") return state.catalogPersonalities.map((record) => moduleCard(record, activeSection, "Personality"));
    if (activeSection === "memory-fragments") return state.memoryFragments.map((record) => moduleCard(record, activeSection, "Memory Fragment"));
    if (activeSection === "dialogue-packs") return state.dialoguePacks.map((record) => moduleCard(record, activeSection, "Dialogue Pack"));
    if (activeSection === "relationships") return state.relationships.map((record) => moduleCard(record, activeSection, "Relationship Group"));
    const agents = activeSection.startsWith("class:")
      ? state.agents.filter((agent) => slug(agent.agentClass ?? "Studio Companions") === activeSection.split(":")[1])
      : state.agents;
    return agents.map((agent) => agentCard(agent, activeSection));
  }, [activeSection, state]);

  const visibleRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) => [record.id, record.name, record.type, record.classification, record.parent, record.contains, record.status].join(" ").toLowerCase().includes(needle));
  }, [query, records]);

  const indexItems = activeSection === "agents" || activeSection.startsWith("class:")
    ? [
        { label: "Agents", value: records.length, detail: `${state.records.length} canonical total` },
        { label: "Published", value: state.stats.published, detail: "runtime ready" },
        { label: "Forgotten Terminals", value: state.terminals.length, detail: "discovery sources" },
        { label: "Needs Artwork", value: records.filter((record) => record.status !== "published").length, detail: "draft production" }
      ]
    : [
        { label: "Records", value: records.length, detail: title },
        { label: "Linked Agents", value: new Set(records.flatMap((record) => record.contains?.split(", ") ?? [])).size, detail: "canonical relationships" },
        { label: "Published", value: records.filter((record) => record.status === "published").length, detail: "runtime ready" },
        { label: "Draft", value: records.filter((record) => record.status === "draft").length, detail: "awaiting authoring" }
      ];

  return (
    <main className="min-h-[calc(100vh-5rem)] space-y-3">
      <header className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 px-4 py-3 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Canonical Content Browser</p><h1 className="text-2xl font-black text-white">AI Agent Libraries</h1></div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400"><span>Civilization</span><ChevronRight className="h-3 w-3 text-slate-600" /><span>AI Agent Libraries</span><ChevronRight className="h-3 w-3 text-slate-600" /><span className="text-cyan-100">{title}</span></div>
        </div>
      </header>

      <ResizableDiscoveryLayout
        preferenceKey="project-genesis-ai-agent-tree-width"
        label="AI Agent tree"
        sidebar={(
          <aside className="min-h-0 rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-3 shadow-glow lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
            <div className="mb-3 flex items-center gap-2 px-1"><Bot className="h-4 w-4 text-cyan-200" /><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Content Tree</p><p className="text-xs text-slate-500">Browse AI systems</p></div></div>
            <DiscoveryLibraryTree nodes={tree} activeFolder={activeSection} ariaLabel="AI Agent Library folders" expandTopLevel={false} />
          </aside>
        )}
      >
        <section className="space-y-3">
          <CanonicalIndex title={title} description="Discoverable AI companions and their restoration, identity, memory, dialogue, and relationship records. Draft module records stay out of published runtime until approved." items={indexItems} />

          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-3">
            <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2"><Search className="h-4 w-4 text-cyan-200" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600" /></label>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-300"><Database className="h-4 w-4 text-cyan-200" />{visibleRecords.length} shown / {records.length} in library</div>
          </section>

          {visibleRecords.length ? (
            <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visibleRecords.map((record) => <GeneratedLibraryCard key={record.id} record={record} />)}</section>
          ) : (
            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-8 text-center"><Bot className="mx-auto h-8 w-8 text-slate-600" /><p className="mt-3 text-xl font-black text-white">No {title.toLowerCase()} authored yet.</p><p className="mt-2 text-sm text-slate-400">This module remains empty until canonical records are supplied. Nothing has been fabricated.</p></section>
          )}

          {selectedAgent ? (
            <section className="rounded-md border border-cyan-300/20 bg-[#07101e]/92 p-4 shadow-glow">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><WorkspaceBadge value={selectedAgent.agentClass ?? "AI Agent"} /><WorkspaceBadge value={selectedAgent.catalogRarity ?? selectedAgent.rarity} /><WorkspaceBadge value={selectedAgent.publishState} /></div><h2 className="mt-3 text-2xl font-black text-white">{selectedAgent.displayName}</h2><p className="mt-1 text-sm font-semibold text-cyan-100/75">{selectedAgent.id}</p></div><Link href={href(activeSection)} scroll={false} className="rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 hover:bg-cyan-300/10">Close Record</Link></div>
              <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">{selectedAgent.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><WorkspaceStatTile label="Specialization" value={selectedAgent.specialization ?? "Not defined"} /><WorkspaceStatTile label="Personality" value={selectedAgent.catalogPersonality ?? selectedAgent.personalityId} /><WorkspaceStatTile label="Terminal" value={selectedAgent.terminalType ?? "Not defined"} /><WorkspaceStatTile label="Memory Integrity" value={selectedAgent.memoryIntegrityStart ?? "Not defined"} /></div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2"><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Discovery & Restoration</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedAgent.discoverySource || "Discovery source not defined"} · {selectedAgent.unlockMethod || "Unlock method not defined"} · {selectedAgent.restorationAction || "Restoration action not defined"}</p></div><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Canonical Bonuses</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedAgent.primaryBonusIds?.join(", ") || "No bonuses defined"}</p></div></div>
            </section>
          ) : null}

          {selectedTerminal ? (
            <section className="rounded-md border border-cyan-300/20 bg-[#07101e]/92 p-4 shadow-glow"><div className="flex items-start justify-between gap-3"><div><WorkspaceBadge value={selectedTerminal.status} /><h2 className="mt-3 text-2xl font-black text-white">{selectedTerminal.displayName}</h2><p className="mt-2 text-sm text-slate-300">Found through {selectedTerminal.discoverySources.join(", ")}. Restoration action: {selectedTerminal.restorationAction || "not defined"}.</p></div><Link href={href(activeSection)} scroll={false} className="rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 hover:bg-cyan-300/10">Close Record</Link></div></section>
          ) : null}

          {selectedPersonality ? (
            <section className="rounded-md border border-cyan-300/20 bg-[#07101e]/92 p-4 shadow-glow"><div className="flex items-start justify-between gap-3"><div><WorkspaceBadge value={selectedPersonality.status} /><h2 className="mt-3 text-2xl font-black text-white">{selectedPersonality.displayName}</h2><p className="mt-2 text-sm text-slate-300">Linked agents: {selectedPersonality.agentIds.join(", ")}</p></div><Link href={href(activeSection)} scroll={false} className="rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 hover:bg-cyan-300/10">Close Record</Link></div></section>
          ) : null}
        </section>
      </ResizableDiscoveryLayout>
    </main>
  );
}
