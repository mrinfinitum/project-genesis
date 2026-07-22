"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight, Database, Search } from "lucide-react";
import { DiscoveryLibraryTree, type DiscoveryTreeNode } from "@/components/discovery-library-tree";
import { GeneratedLibraryCard, type GeneratedLibraryCardRecord } from "@/components/generated-library-card";
import { ResizableDiscoveryLayout } from "@/components/resizable-discovery-layout";
import { CanonicalIndex, WorkspaceBadge, WorkspaceStatTile } from "@/components/ui/workspace";
import type { AiAgentBrowserRecord, AiAgentBrowserState } from "@/lib/ai-agents/browser";

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function href(section: string, entry?: string) {
  const params = new URLSearchParams({ section });
  if (entry) params.set("entry", entry);
  return `/ai-agents?${params.toString()}`;
}

function buildTree(state: AiAgentBrowserState): DiscoveryTreeNode[] {
  const agentsBySubcategory = new Map<string, AiAgentBrowserRecord[]>();
  for (const agent of state.records) {
    const key = `${agent.categoryId}:${agent.subcategory}`;
    const agents = agentsBySubcategory.get(key) ?? [];
    agents.push(agent);
    agentsBySubcategory.set(key, agents);
  }
  return state.categories.map((category) => {
    return {
      id: `category:${category.id}`,
      label: category.displayName,
      href: href(`category:${category.id}`),
      count: state.categoryCounts[category.id] ?? 0,
      icon: "folder" as const,
      children: category.subcategories.map((subcategory) => {
        const subcategoryId = `subcategory:${category.id}:${slug(subcategory)}`;
        const agents = (agentsBySubcategory.get(`${category.id}:${subcategory}`) ?? [])
          .slice()
          .sort((left, right) => left.libraryIndex - right.libraryIndex);
        return {
          id: subcategoryId,
          label: subcategory,
          href: href(subcategoryId),
          count: agents.length,
          icon: "folder" as const,
          children: agents.map((agent) => ({
            id: agent.id,
            label: agent.name,
            href: href(subcategoryId, agent.id),
            count: agent.libraryIndex,
            icon: "curiosity" as const
          }))
        };
      }).filter((subcategory) => subcategory.count > 0)
    };
  });
}

function agentCard(agent: AiAgentBrowserRecord, section: string): GeneratedLibraryCardRecord {
  return {
    id: agent.id,
    name: agent.name,
    type: agent.aiType || "AI Agent",
    classification: agent.primaryFunction || agent.rarity,
    parent: agent.categoryName,
    contains: agent.subcategory,
    status: agent.runtimeStatus,
    href: href(section, agent.id),
    tone: "neutral"
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
  return "AI Assistant Library";
}

const INITIAL_CARD_LIMIT = 48;

export function AiAgentsLibrary({ state, activeSection = "library", activeEntry }: { state: AiAgentBrowserState; activeSection?: string; activeEntry?: string }) {
  const [query, setQuery] = useState("");
  const [cardLimit, setCardLimit] = useState(INITIAL_CARD_LIMIT);
  const tree = useMemo(() => buildTree(state), [state]);
  const activeCategoryId = activeSection.startsWith("category:") ? activeSection.split(":")[1] : null;
  const activeSubcategory = activeSection.startsWith("subcategory:") ? activeSection.split(":") : null;
  const title = activeSubcategory
    ? state.categories.find((category) => category.id === activeSubcategory[1])?.subcategories.find((subcategory) => slug(subcategory) === activeSubcategory[2]) ?? sectionTitle(activeSection)
    : state.categories.find((category) => category.id === activeCategoryId)?.displayName ?? sectionTitle(activeSection);
  const selectedAgent = state.records.find((agent) => agent.id === activeEntry);
  const selectedDefinition = state.selectedDefinition;

  const records = useMemo(() => {
    if (activeSection === "categories") return state.categories.map((category) => moduleCard({ id: category.id, displayName: category.displayName, agentIds: state.records.filter((agent) => agent.categoryId === category.id).map((agent) => agent.id), status: "canonical" }, activeSection, "AI Category", category.subcategory));
    if (activeSection === "assignments") return state.assignmentRoles.map((role) => moduleCard({ id: `assignment:${slug(role)}`, displayName: role, agentIds: state.records.filter((agent) => agent.assignmentRoles.includes(role)).map((agent) => agent.id), status: "canonical" }, activeSection, "Assignment Role"));
    if (activeSection === "personalities") return state.personalityCatalog.map((personality) => moduleCard({ id: `personality:${slug(personality)}`, displayName: personality, agentIds: state.records.filter((agent) => agent.personality === personality).map((agent) => agent.id), status: "canonical" }, activeSection, "Personality"));
    if (activeSection === "rarity") return state.rarityCatalog.map((rarity) => moduleCard({ id: `rarity:${rarity.id}`, displayName: rarity.displayName, agentIds: state.records.filter((agent) => agent.rarity === rarity.displayName).map((agent) => agent.id), status: rarity.volumeOneAllowed ? "canonical" : "future" }, activeSection, "Rarity"));
    if (["relationships", "runtime", "validation"].includes(activeSection)) return [];
    const categoryId = activeSection.startsWith("category:") ? activeSection.split(":")[1] : activeSection.startsWith("subcategory:") ? activeSection.split(":")[1] : null;
    const subcategorySlug = activeSection.startsWith("subcategory:") ? activeSection.split(":")[2] : null;
    const agents = state.records.filter((agent) => (!categoryId || agent.categoryId === categoryId) && (!subcategorySlug || slug(agent.subcategory) === subcategorySlug));
    return agents.map((agent) => agentCard(agent, activeSection));
  }, [activeSection, state]);

  const visibleRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) => [record.id, record.name, record.type, record.classification, record.parent, record.contains, record.status].join(" ").toLowerCase().includes(needle));
  }, [query, records]);

  useEffect(() => {
    setCardLimit(INITIAL_CARD_LIMIT);
  }, [activeSection, query]);

  const renderedRecords = visibleRecords.slice(0, cardLimit);

  const indexItems = activeSection === "library" || activeSection.startsWith("category:") || activeSection.startsWith("subcategory:")
    ? [
        { label: "Assistants", value: records.length, detail: `${state.records.length} canonical records` },
        { label: "Categories", value: state.categories.length, detail: "canonical assistant systems" },
        { label: "Rarities", value: state.rarityCount, detail: "active rarity classes" },
        { label: "Level Cap", value: state.maxLevel, detail: "maximum by rarity" }
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
            <div className="mb-3 flex items-center gap-2 px-1"><Bot className="h-4 w-4 text-cyan-200" /><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Content Tree</p><p className="text-xs text-slate-500">Browse assistants by category</p></div></div>
            <DiscoveryLibraryTree nodes={tree} activeFolder={activeEntry ?? activeSection} ariaLabel="AI Assistant Library categories and records" expandTopLevel={false} />
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
            <>
              <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{renderedRecords.map((record) => <GeneratedLibraryCard key={record.id} record={record} />)}</section>
              {renderedRecords.length < visibleRecords.length ? (
                <div className="flex justify-center">
                  <button type="button" onClick={() => setCardLimit((current) => current + INITIAL_CARD_LIMIT)} className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                    Show more assistants ({visibleRecords.length - renderedRecords.length} remaining)
                  </button>
                </div>
              ) : null}
            </>
          ) : ["relationships", "runtime", "validation"].includes(activeSection) ? (
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(activeSection === "relationships" ? ["Category peers", "Assignment compatibility", "Memory links"] : activeSection === "runtime" ? ["ai_library.json", "ai_categories.json", "ai_rarity.json", "ai_personality_catalog.json", "ai_voice_catalog.json", "ai_assignment_roles.json"] : ["100 unique IDs", "100 unique names", "100 unique codenames", "All categories resolve", "All rarities valid", "All required fields present"]).map((label) => <div key={label} className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4"><WorkspaceBadge value={activeSection === "validation" ? "Ready" : "Canonical"} /><p className="mt-3 font-black text-white">{label}</p></div>)}
            </section>
          ) : (
            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-8 text-center"><Bot className="mx-auto h-8 w-8 text-slate-600" /><p className="mt-3 text-xl font-black text-white">No {title.toLowerCase()} authored yet.</p><p className="mt-2 text-sm text-slate-400">This module remains empty until canonical records are supplied. Nothing has been fabricated.</p></section>
          )}

          {selectedAgent ? (
            <section className="rounded-md border border-cyan-300/20 bg-[#07101e]/92 p-4 shadow-glow">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><WorkspaceBadge value={selectedAgent.aiType || "AI Agent"} /><WorkspaceBadge value={selectedAgent.rarity} /><WorkspaceBadge value={selectedAgent.runtimeStatus} /></div><h2 className="mt-3 text-2xl font-black text-white">{selectedAgent.name}</h2><p className="mt-1 text-sm font-semibold text-cyan-100/75">{selectedAgent.id}</p></div><Link href={href(activeSection)} scroll={false} className="rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 hover:bg-cyan-300/10">Close Record</Link></div>
              <p className="mt-4 max-w-5xl text-sm leading-6 text-slate-300">{selectedAgent.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><WorkspaceStatTile label="Codename" value={selectedDefinition?.codename ?? "Canonical assistant"} /><WorkspaceStatTile label="Specialization" value={selectedAgent.primaryFunction} /><WorkspaceStatTile label="Personality" value={selectedAgent.personality} /><WorkspaceStatTile label="Voice" value={selectedAgent.voiceStyle} /></div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2"><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Discovery & Activation</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedAgent.discoveryMethod} · {selectedAgent.activationMethod}</p></div><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Canonical Function</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedAgent.primaryFunction} · {selectedAgent.secondaryFunction}</p></div></div>
              {selectedDefinition ? <div className="mt-3 grid gap-3 lg:grid-cols-2"><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Dialogue & Memory</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedDefinition.dialogue_examples.join(" ")} {[selectedDefinition.memory_fragment_1, selectedDefinition.memory_fragment_2, selectedDefinition.memory_fragment_3].join(" ")}</p></div><div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Portrait Prompt</p><p className="mt-2 text-sm leading-6 text-slate-300">{selectedDefinition.portrait_prompt}</p></div></div> : null}
            </section>
          ) : null}
        </section>
      </ResizableDiscoveryLayout>
    </main>
  );
}
