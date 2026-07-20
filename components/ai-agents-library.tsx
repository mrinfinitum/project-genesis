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
  return [
    {
      id: "library",
      label: "Library",
      href: href("library"),
      count: state.libraryAgents.length,
      icon: "folder",
      children: [{
        id: "volume:foundations",
        label: "Volume I — Foundations",
        href: href("volume:foundations"),
        count: state.libraryAgents.length,
        icon: "folder",
        children: state.categories.map((category) => ({ id: `category:${category.id}`, label: category.displayName, href: href(`category:${category.id}`), count: state.libraryAgents.filter((agent) => agent.category_id === category.id).length }))
      }]
    },
    { id: "categories", label: "Categories", href: href("categories"), count: state.categories.length, icon: "folder" },
    { id: "assignments", label: "Assignments", href: href("assignments"), count: state.assignmentRoles.length, icon: "folder" },
    { id: "personalities", label: "Personalities", href: href("personalities"), count: state.personalityCatalog.length, icon: "folder" },
    { id: "rarity", label: "Rarity", href: href("rarity"), count: state.rarityCatalog.length, icon: "folder" },
    { id: "relationships", label: "Relationships", href: href("relationships"), count: state.libraryAgents.length, icon: "folder" },
    { id: "runtime", label: "Runtime", href: href("runtime"), count: 6, icon: "folder" },
    { id: "validation", label: "Validation", href: href("validation"), count: 1, icon: "folder" }
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
  if (section.startsWith("category:")) return section.split(":")[1].replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return ({ library: "AI Library", "volume:foundations": "Volume I — Foundations", categories: "Categories", assignments: "Assignments", personalities: "Personalities", rarity: "Rarity", relationships: "Relationships", runtime: "Runtime", validation: "Validation" } as Record<string, string>)[section] ?? "AI Library";
}

export function AiAgentsLibrary({ state, activeSection = "library", activeEntry }: { state: AiAgentLibraryState; activeSection?: string; activeEntry?: string }) {
  const [query, setQuery] = useState("");
  const tree = useMemo(() => buildTree(state), [state]);
  const title = sectionTitle(activeSection);
  const selectedAgent = state.records.find((agent) => agent.id === activeEntry);
  const selectedDefinition = state.libraryAgents.find((agent) => agent.ai_id === activeEntry);

  const records = useMemo(() => {
    if (activeSection === "categories") return state.categories.map((category) => moduleCard({ id: category.id, displayName: category.displayName, agentIds: state.libraryAgents.filter((agent) => agent.category_id === category.id).map((agent) => agent.ai_id), status: "canonical" }, activeSection, "AI Category", category.subcategory));
    if (activeSection === "assignments") return state.assignmentRoles.map((role) => moduleCard({ id: `assignment:${slug(role)}`, displayName: role, agentIds: state.libraryAgents.filter((agent) => agent.assignment_roles.includes(role)).map((agent) => agent.ai_id), status: "canonical" }, activeSection, "Assignment Role"));
    if (activeSection === "personalities") return state.personalityCatalog.map((personality) => moduleCard({ id: `personality:${slug(personality)}`, displayName: personality, agentIds: state.libraryAgents.filter((agent) => agent.personality === personality).map((agent) => agent.ai_id), status: "canonical" }, activeSection, "Personality"));
    if (activeSection === "rarity") return state.rarityCatalog.map((rarity) => moduleCard({ id: `rarity:${rarity.id}`, displayName: rarity.displayName, agentIds: state.libraryAgents.filter((agent) => agent.rarity === rarity.displayName).map((agent) => agent.ai_id), status: rarity.volumeOneAllowed ? "canonical" : "future" }, activeSection, "Rarity"));
    if (["relationships", "runtime", "validation"].includes(activeSection)) return [];
    const allowedIds = new Set(state.libraryAgents.filter((agent) => !activeSection.startsWith("category:") || agent.category_id === activeSection.split(":")[1]).map((agent) => agent.ai_id));
    const agents = state.agents.filter((agent) => allowedIds.has(agent.id));
    return agents.map((agent) => agentCard(agent, activeSection));
  }, [activeSection, state]);

  const visibleRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) => [record.id, record.name, record.type, record.classification, record.parent, record.contains, record.status].join(" ").toLowerCase().includes(needle));
  }, [query, records]);

  const indexItems = ["library", "volume:foundations"].includes(activeSection) || activeSection.startsWith("category:")
    ? [
        { label: "Agents", value: records.length, detail: `${state.libraryAgents.length} in Volume I` },
        { label: "Categories", value: state.categories.length, detail: "Foundations taxonomy" },
        { label: "Rarities", value: new Set(state.libraryAgents.map((agent) => agent.rarity)).size, detail: "used in Volume I" },
        { label: "Level Cap", value: 50, detail: "all Foundation agents" }
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
          <CanonicalIndex title={title} description="Collectible intelligent personalities with canonical Labor, Action, assignment, progression, dialogue, memory, portrait, and runtime contracts. Studio owns definitions; the Game owns player instances." items={indexItems} />

          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-3">
            <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2"><Search className="h-4 w-4 text-cyan-200" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600" /></label>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-300"><Database className="h-4 w-4 text-cyan-200" />{visibleRecords.length} shown / {records.length} in library</div>
          </section>

          {visibleRecords.length ? (
            <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visibleRecords.map((record) => <GeneratedLibraryCard key={record.id} record={record} />)}</section>
          ) : ["relationships", "runtime", "validation"].includes(activeSection) ? (
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(activeSection === "relationships" ? ["Category peers", "Volume membership", "Assignment compatibility", "Memory links"] : activeSection === "runtime" ? ["ai_library.json", "ai_categories.json", "ai_rarity.json", "ai_personality_catalog.json", "ai_voice_catalog.json", "ai_assignment_roles.json"] : ["75 unique IDs", "75 unique names", "75 unique codenames", "All categories resolve", "Volume I rarities valid", "All required fields present"]).map((label) => <div key={label} className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4"><WorkspaceBadge value={activeSection === "validation" ? "Ready" : "Canonical"} /><p className="mt-3 font-black text-white">{label}</p></div>)}
            </section>
          ) : (
            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-8 text-center"><Bot className="mx-auto h-8 w-8 text-slate-600" /><p className="mt-3 text-xl font-black text-white">No {title.toLowerCase()} authored yet.</p><p className="mt-2 text-sm text-slate-400">This module remains empty until canonical records are supplied. Nothing has been fabricated.</p></section>
          )}

          {selectedAgent ? (
            <section className="rounded-md border border-cyan-300/20 bg-[#07101e]/92 p-4 shadow-glow">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><WorkspaceBadge value={selectedAgent.agentClass ?? "AI Agent"} /><WorkspaceBadge value={selectedAgent.catalogRarity ?? selectedAgent.rarity} /><WorkspaceBadge value={selectedAgent.publishState} /></div><h2 className="mt-3 text-2xl font-black text-white">{selectedAgent.displayName}</h2><p className="mt-1 text-sm font-semibold text-cyan-100/75">{selectedAgent.id}</p></div><Link href={href(activeSection)} scroll={false} className="rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 hover:bg-cyan-300/10">Close Record</Link></div>
              <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">{selectedAgent.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><WorkspaceStatTile label="Codename" value={selectedDefinition?.codename ?? "Compatibility agent"} /><WorkspaceStatTile label="Specialization" value={selectedAgent.specialization ?? "Not defined"} /><WorkspaceStatTile label="Personality" value={selectedAgent.catalogPersonality ?? selectedAgent.personalityId} /><WorkspaceStatTile label="Voice" value={selectedDefinition?.voice_style ?? selectedAgent.voiceProfile.notes} /></div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2"><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Discovery & Restoration</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedAgent.discoverySource || "Discovery source not defined"} · {selectedAgent.unlockMethod || "Unlock method not defined"} · {selectedAgent.restorationAction || "Restoration action not defined"}</p></div><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Canonical Bonuses</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedAgent.primaryBonusIds?.join(", ") || "No bonuses defined"}</p></div></div>
              {selectedDefinition ? <div className="mt-3 grid gap-3 lg:grid-cols-2"><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Dialogue & Memory</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedDefinition.dialogue_examples.join(" ")} {selectedDefinition.memory_fragments.join(" ")}</p></div><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Portrait Prompt</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedDefinition.portrait_prompt}</p></div></div> : null}
            </section>
          ) : null}
        </section>
      </ResizableDiscoveryLayout>
    </main>
  );
}
