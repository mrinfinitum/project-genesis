"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Database, ImageIcon, Search } from "lucide-react";
import { DiscoveryLibraryTree, type DiscoveryTreeNode } from "@/components/discovery-library-tree";
import { ResizableDiscoveryLayout } from "@/components/resizable-discovery-layout";
import { CanonicalIndex, WorkspaceStatTile } from "@/components/ui/workspace";
import {
  AI_BROWSE_MODES,
  groupAiRecords,
  parseAiBrowseMode,
  searchAiRecords,
  type AiAgentBrowserRecord,
  type AiAgentBrowserState,
  type AiBrowseGroup,
  type AiBrowseMode
} from "@/lib/ai-agents/browser-utils";
import { cn } from "@/lib/utils";

const INITIAL_CARD_LIMIT = 48;
const BROWSE_MODE_STORAGE_KEY = "project-genesis-ai-library-browse-mode";
const browseModeLabels: Record<AiBrowseMode, string> = {
  volume: "Volume",
  category: "Category",
  rarity: "Rarity",
  origin: "Origin",
  "discovery-location": "Discovery Location"
};

const rarityClasses: Record<string, string> = {
  Common: "border-slate-400/35 bg-slate-400/10 text-slate-200",
  Uncommon: "border-emerald-300/35 bg-emerald-400/10 text-emerald-100",
  Rare: "border-sky-300/35 bg-sky-400/10 text-sky-100",
  Epic: "border-violet-300/35 bg-violet-400/10 text-violet-100",
  Legendary: "border-yellow-300/40 bg-yellow-400/10 text-yellow-100",
  Ancient: "border-orange-300/40 bg-orange-400/10 text-orange-100",
  Genesis: "border-cyan-100/50 bg-cyan-100/10 text-white"
};

function href(browse: AiBrowseMode, group?: string, subcategory?: string, assistant?: string) {
  const params = new URLSearchParams({ browse });
  if (group) params.set("group", group);
  if (subcategory) params.set("subcategory", subcategory);
  if (assistant) params.set("assistant", assistant);
  return `/ai-agents?${params.toString()}`;
}

function buildTree(groups: AiBrowseGroup[], browse: AiBrowseMode): DiscoveryTreeNode[] {
  return groups.map((group) => ({
    id: group.id,
    label: group.label,
    href: href(browse, group.id),
    count: group.count,
    icon: "folder" as const,
    children: group.children.map((child) => ({
      id: `${group.id}:${child.id}`,
      label: child.label,
      href: href(browse, group.id, child.id),
      count: child.count,
      icon: "folder" as const,
      children: child.records.map((agent) => ({
        id: agent.id,
        label: agent.name,
        href: href(browse, group.id, child.id, agent.id),
        count: agent.libraryIndex,
        icon: "curiosity" as const
      }))
    }))
  }));
}

function RarityBadge({ rarity }: { rarity: string }) {
  return <span className={cn("rounded-md border px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em]", rarityClasses[rarity] ?? rarityClasses.Common)}>{rarity}</span>;
}

function AssistantCard({ agent, destination }: { agent: AiAgentBrowserRecord; destination: string }) {
  return (
    <Link href={destination} scroll={false} className="group flex min-h-[17rem] flex-col rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 transition hover:border-cyan-300/55 hover:bg-cyan-300/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
      <div className="relative aspect-video overflow-hidden rounded-md border border-cyan-300/12 bg-[linear-gradient(135deg,rgba(103,232,249,0.1),rgba(2,6,23,0.75))]">
        {agent.portraitUrl ? <img src={agent.portraitUrl} alt={`${agent.name} portrait`} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><ImageIcon className="h-8 w-8 text-slate-600" /><span className="sr-only">No portrait artwork attached</span></div>}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="truncate text-base font-black text-white" title={agent.name}>{agent.name}</p><p className="mt-1 truncate text-xs font-bold text-cyan-100/75" title={agent.title ?? agent.codename}>{agent.title ?? agent.codename}</p></div>
        <RarityBadge rarity={agent.rarity} />
      </div>
      <div className="mt-3 space-y-1 text-xs font-semibold text-slate-400"><p className="truncate" title={agent.volumeLabel}>{agent.volumeLabel}</p><p className="truncate" title={`${agent.categoryName} / ${agent.subcategory}`}>{agent.categoryName} / {agent.subcategory}</p></div>
      <div className="mt-auto flex items-center justify-between pt-4 text-xs font-black"><span className="uppercase tracking-[0.12em] text-slate-500">{agent.runtimeStatus}</span><span className="text-cyan-100 transition group-hover:text-white">Inspect</span></div>
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">{title}</p><div className="mt-3">{children}</div></section>;
}

function AssistantDetail({ agent, closeHref }: { agent: AiAgentBrowserRecord; closeHref: string }) {
  return (
    <section className="rounded-md border border-cyan-300/25 bg-[#07101e]/95 p-4 shadow-glow sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="flex flex-wrap items-center gap-2"><RarityBadge rarity={agent.rarity} /><span className="rounded-md border border-cyan-300/20 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-cyan-100">{agent.runtimeStatus}</span></div><h2 className="mt-3 text-3xl font-black text-white">{agent.name}</h2><p className="mt-1 font-bold text-cyan-100/75">{agent.title ?? agent.codename}</p><p className="mt-2 text-sm text-slate-400">{agent.volumeLabel} · {agent.categoryName} · {agent.subcategory}</p></div>
        <Link href={closeHref} scroll={false} className="rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Close Profile</Link>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[20rem_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-md border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(103,232,249,0.1),rgba(2,6,23,0.85))]">
          {agent.portraitUrl ? <img src={agent.portraitUrl} alt={`${agent.name}, ${agent.title ?? agent.codename}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-center"><div><Bot className="mx-auto h-12 w-12 text-slate-600" /><p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Portrait artwork not attached</p></div></div>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <WorkspaceStatTile label="Labor/sec" value={agent.baseLaborPerSecond} />
          <WorkspaceStatTile label="Manual Labor" value={agent.baseClickLaborBonus} />
          <WorkspaceStatTile label="Offline Multiplier" value={`${agent.offlineGenerationMultiplier}×`} />
          <WorkspaceStatTile label="XP Multiplier" value={`${agent.experienceRateMultiplier}×`} />
          <WorkspaceStatTile label="Max Level" value={agent.maxLevel} />
          <WorkspaceStatTile label="Evolution" value={agent.evolutionName} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Section title="Signature Passive"><p className="font-black text-white">{agent.signaturePassiveName}</p><p className="mt-2 text-sm leading-6 text-slate-300">{agent.signaturePassiveDescription}</p></Section>
        <Section title="Identity"><dl className="grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Personality</dt><dd className="font-bold text-slate-200">{agent.personalityPrimary} / {agent.personalitySecondary}</dd></div><div><dt className="text-slate-500">Voice</dt><dd className="font-bold text-slate-200">{agent.voiceStyle}</dd></div><div><dt className="text-slate-500">Origin</dt><dd className="font-bold text-slate-200">{agent.origin}</dd></div><div><dt className="text-slate-500">Discovery</dt><dd className="font-bold text-slate-200">{agent.discoveryLocation}</dd></div></dl></Section>
        <Section title="Canonical Function"><p className="text-sm font-bold text-slate-200">{agent.primaryFunction}</p><p className="mt-2 text-sm text-slate-400">{agent.secondaryFunction}</p></Section>
        <Section title="Relationships"><p className="text-sm text-slate-300">Parent: <strong>{agent.volumeLabel}</strong></p><p className="mt-1 text-sm text-slate-300">{agent.categoryName} / {agent.subcategory}</p><div className="mt-3 flex flex-wrap gap-1.5">{agent.tags.map((tag) => <span key={tag} className="rounded border border-cyan-300/10 bg-cyan-300/5 px-2 py-1 text-[0.65rem] font-bold text-slate-400">{tag}</span>)}</div></Section>
      </div>

      <Section title="Memory Fragments"><ol className="grid gap-3 md:grid-cols-3">{agent.memoryFragments.map((fragment, index) => <li key={`${agent.id}-memory-${index}`} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500">Fragment {index + 1}</p><p className="mt-2 text-sm leading-6 text-slate-300">{fragment}</p></li>)}</ol></Section>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Section title="Dialogue"><div className="space-y-2">{agent.dialogueExamples.map((line, index) => <blockquote key={`${agent.id}-dialogue-${index}`} className="border-l-2 border-cyan-300/30 pl-3 text-sm italic leading-6 text-slate-300">“{line}”</blockquote>)}</div></Section>
        <Section title="Lore"><p className="text-sm leading-6 text-slate-300">{agent.description}</p><p className="mt-3 text-sm leading-6 text-slate-400">{agent.lore}</p></Section>
      </div>
      <details className="mt-3 rounded-md border border-cyan-300/10 bg-slate-950/35 p-4"><summary className="cursor-pointer text-xs font-black uppercase tracking-[0.18em] text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Production Metadata</summary><p className="mt-3 text-sm leading-6 text-slate-400">{agent.portraitPrompt || "No portrait production prompt has been authored."}</p><p className="mt-3 break-all text-xs font-bold text-slate-500">Canonical ID: {agent.id}</p></details>
    </section>
  );
}

export function AiAgentsLibrary({ state, initialBrowse, initialGroup, initialSubcategory, initialAssistant }: { state: AiAgentBrowserState; initialBrowse?: string; initialGroup?: string; initialSubcategory?: string; initialAssistant?: string }) {
  const router = useRouter();
  const [browseMode, setBrowseMode] = useState<AiBrowseMode>(() => parseAiBrowseMode(initialBrowse));
  const [query, setQuery] = useState("");
  const [cardLimit, setCardLimit] = useState(INITIAL_CARD_LIMIT);
  const groups = useMemo(() => groupAiRecords(state.records, browseMode), [browseMode, state.records]);
  const tree = useMemo(() => buildTree(groups, browseMode), [browseMode, groups]);
  const selectedGroup = groups.find((group) => group.id === initialGroup);
  const selectedSubgroup = selectedGroup?.children.find((child) => child.id === initialSubcategory);
  const collectionRecords = selectedSubgroup?.records ?? selectedGroup?.records ?? state.records;
  const visibleRecords = useMemo(() => searchAiRecords(collectionRecords, query), [collectionRecords, query]);
  const selectedAgent = state.records.find((agent) => agent.id === initialAssistant || agent.aliases.includes(initialAssistant ?? ""));
  const title = selectedSubgroup?.label ?? selectedGroup?.label ?? "AI Assistant Library";
  const activeFolder = selectedAgent?.id ?? (selectedSubgroup ? `${selectedGroup?.id}:${selectedSubgroup.id}` : selectedGroup?.id ?? "");

  useEffect(() => {
    if (initialBrowse) return;
    const stored = window.localStorage.getItem(BROWSE_MODE_STORAGE_KEY);
    if (stored) setBrowseMode(parseAiBrowseMode(stored));
  }, [initialBrowse]);

  useEffect(() => setCardLimit(INITIAL_CARD_LIMIT), [browseMode, initialGroup, initialSubcategory, query]);

  function changeBrowseMode(mode: AiBrowseMode) {
    setBrowseMode(mode);
    window.localStorage.setItem(BROWSE_MODE_STORAGE_KEY, mode);
    router.replace(href(mode), { scroll: false });
  }

  const indexItems = [
    { label: "Assistants", value: collectionRecords.length, detail: `${visibleRecords.length} shown / ${collectionRecords.length} in library` },
    { label: "Canonical Total", value: state.totalRecords, detail: "normalized AI records" },
    { label: "Groups", value: groups.length, detail: `${browseModeLabels[browseMode]} browse groups` },
    { label: "Diagnostics", value: state.validationWarnings.length, detail: state.validationWarnings.length ? "non-blocking warnings" : "all required fields resolve" }
  ];

  return (
    <main className="min-h-[calc(100vh-5rem)] space-y-3">
      <header className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 px-4 py-3 shadow-glow"><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Canonical Content Browser</p><h1 className="text-2xl font-black text-white">AI Agent Libraries</h1></header>
      <ResizableDiscoveryLayout preferenceKey="project-genesis-ai-agent-tree-width" label="AI Agent tree" sidebar={(
        <aside className="min-h-0 rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-3 shadow-glow lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
          <div className="mb-3 flex items-start gap-2 px-1"><Bot className="mt-0.5 h-4 w-4 text-cyan-200" /><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Content Tree</p><p className="text-xs text-slate-500">Browse canonical assistants</p></div></div>
          <div className="mb-3 grid grid-cols-2 gap-1" aria-label="AI Library browse mode">{AI_BROWSE_MODES.map((mode) => <button key={mode} type="button" onClick={() => changeBrowseMode(mode)} aria-pressed={browseMode === mode} className={cn("rounded-md border px-2 py-1.5 text-left text-[0.66rem] font-black uppercase tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200", browseMode === mode ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-100" : "border-cyan-300/10 text-slate-500 hover:text-slate-200")}>{browseModeLabels[mode]}</button>)}</div>
          <DiscoveryLibraryTree nodes={tree} activeFolder={activeFolder} ariaLabel={`AI Assistant Library grouped by ${browseModeLabels[browseMode]}`} expandTopLevel={false} />
        </aside>
      )}>
        <section className="space-y-3">
          <CanonicalIndex title={title} description="Collectible intelligent personalities with canonical Labor, progression, dialogue, memory, portrait, and runtime contracts." items={indexItems} />
          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-3"><label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2"><Search className="h-4 w-4 text-cyan-200" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, IDs, volumes, taxonomy, origins, passives, and tags" className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600" /></label><div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-300"><Database className="h-4 w-4 text-cyan-200" />{visibleRecords.length} shown / {collectionRecords.length} in library / {state.totalRecords} canonical</div></section>
          {selectedAgent ? <AssistantDetail agent={selectedAgent} closeHref={href(browseMode, initialGroup, initialSubcategory)} /> : null}
          {visibleRecords.length ? <><section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visibleRecords.slice(0, cardLimit).map((agent) => <AssistantCard key={agent.id} agent={agent} destination={href(browseMode, initialGroup, initialSubcategory, agent.id)} />)}</section>{cardLimit < visibleRecords.length ? <div className="flex justify-center"><button type="button" onClick={() => setCardLimit((current) => current + INITIAL_CARD_LIMIT)} className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Show more assistants ({visibleRecords.length - cardLimit} remaining)</button></div> : null}</> : <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-8 text-center"><Bot className="mx-auto h-8 w-8 text-slate-600" /><p className="mt-3 text-xl font-black text-white">{query ? "No assistants match your search." : selectedGroup ? "This grouping has no canonical records." : "Select an assistant to inspect its canonical profile."}</p><p className="mt-2 text-sm text-slate-400">Try another collection or browse mode. No placeholder records are created.</p></section>}
        </section>
      </ResizableDiscoveryLayout>
    </main>
  );
}
