"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  ClipboardCopy,
  Code2,
  Copy,
  ExternalLink,
  FileWarning,
  FolderTree,
  GitFork,
  Heart,
  History,
  Library,
  Link2,
  Network,
  PackageCheck,
  Plus,
  ShieldCheck,
  Star,
  X
} from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceSearchBar, WorkspaceStatTile } from "@/components/ui/workspace";
import {
  buildUniverseExplorerModel,
  calculateExplorerChangeImpact,
  flattenExplorerTree,
  getExplorerBreadcrumbs,
  getExplorerCreateHref,
  getExplorerCreatableTypes,
  getExplorerGeneratorHref,
  getExplorerLibraryHref,
  getExplorerRelationshipGroups,
  getExplorerVisibleIds,
  getExplorerVirtualWindow,
  universeExplorerModes,
  universeExplorerSortModes,
  type ExplorerValidationStatus,
  type UniverseExplorerMode,
  type UniverseExplorerNode,
  type UniverseExplorerSortMode
} from "@/lib/universe-explorer";
import type { CanonicalRecordType, IdentityRelationshipGraph } from "@/lib/identity-relationships";
import { cn } from "@/lib/utils";

type UniverseExplorerWorkspaceProps = {
  graph: IdentityRelationshipGraph;
};

type StoredExplorerPreferences = {
  expandedIds?: string[];
  favoriteIds?: string[];
  recentIds?: string[];
  mode?: UniverseExplorerMode;
  sortMode?: UniverseExplorerSortMode;
};

const preferencesKey = "project-genesis-universe-explorer-preferences-v1";
const treeRowHeight = 38;

const modeLabels: Record<UniverseExplorerMode, string> = {
  universe: "Universe Hierarchy",
  civilization: "Civilization Hierarchy",
  progression: "Progression Hierarchy",
  production: "Production Relationships",
  runtime: "Runtime Relationships",
  favorites: "Favorites",
  recent: "Recently Opened",
  orphans: "Orphans",
  validation: "Validation Issues"
};

const nodeIcon = (recordType: CanonicalRecordType) => {
  if (["Universe", "Galaxy", "Galactic Region", "Star System", "Star", "Planet", "Moon"].includes(recordType)) return Network;
  if (["Asset", "Background", "Species Plate"].includes(recordType)) return PackageCheck;
  if (["Prompt", "Screen Template", "Component", "Design Token"].includes(recordType)) return Code2;
  if (["Research", "Upgrade", "Building"].includes(recordType)) return GitFork;
  if (["Creature", "Plant", "Fungus", "Microorganism"].includes(recordType)) return Star;
  return Boxes;
};

function statusTone(status: ExplorerValidationStatus) {
  if (status === "valid") return "border-emerald-300/35 bg-emerald-300/10 text-emerald-100";
  if (status === "warning") return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  if (status === "error") return "border-rose-300/35 bg-rose-300/10 text-rose-100";
  return "border-orange-300/35 bg-orange-300/10 text-orange-100";
}

function validationLabel(status: ExplorerValidationStatus) {
  return status === "valid" ? "Valid" : status[0].toUpperCase() + status.slice(1);
}

function getStoredPreferences(): StoredExplorerPreferences {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(preferencesKey) ?? "{}") as StoredExplorerPreferences;
  } catch {
    return {};
  }
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value);
}

function RelationshipRecordLink({ node, onSelect }: { node: UniverseExplorerNode; onSelect: (id: string) => void }) {
  const Icon = nodeIcon(node.recordType);
  return (
    <button
      type="button"
      onClick={() => onSelect(node.canonicalId)}
      className="flex w-full items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/35 px-2.5 py-2 text-left transition hover:border-cyan-200/35 hover:bg-cyan-300/5"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-200" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-100">{node.displayName}</span>
        <span className="block truncate text-[11px] text-slate-500">{node.recordType}</span>
      </span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
    </button>
  );
}

function SmallAction({ href, icon: Icon, children }: { href: string; icon: typeof ExternalLink; children: React.ReactNode }) {
  return (
    <Link href={href} scroll={false} className="inline-flex items-center gap-1.5 rounded-md border border-cyan-300/25 bg-cyan-300/5 px-2.5 py-1.5 text-xs font-bold text-cyan-50 transition hover:border-cyan-200/55 hover:bg-cyan-300/10">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </Link>
  );
}

export function UniverseExplorerWorkspace({ graph }: UniverseExplorerWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const model = useMemo(() => buildUniverseExplorerModel(graph), [graph]);
  const initialPreferences = useRef<StoredExplorerPreferences | null>(null);
  if (!initialPreferences.current) initialPreferences.current = getStoredPreferences();
  const initial = initialPreferences.current;
  const defaultRootId = model.rootIds[0] ?? "";
  const requestedSelectedId = searchParams.get("selected");
  const [selectedId, setSelectedId] = useState(() => requestedSelectedId && model.nodeById.has(requestedSelectedId) ? requestedSelectedId : defaultRootId);
  const [mode, setMode] = useState<UniverseExplorerMode>(initial.mode ?? "universe");
  const [sortMode, setSortMode] = useState<UniverseExplorerSortMode>(initial.sortMode ?? "canonical");
  const [query, setQuery] = useState("");
  const [recordType, setRecordType] = useState<CanonicalRecordType | "all">("all");
  const [validation, setValidation] = useState<ExplorerValidationStatus | "all">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(initial.expandedIds?.filter((id) => model.nodeById.has(id)) ?? model.rootIds));
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(initial.favoriteIds?.filter((id) => model.nodeById.has(id)) ?? []));
  const [recentIds, setRecentIds] = useState<string[]>(() => initial.recentIds?.filter((id) => model.nodeById.has(id)) ?? []);
  const [multiSelection, setMultiSelection] = useState<Set<string>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const [treeViewportHeight, setTreeViewportHeight] = useState(580);
  const treeViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preferences: StoredExplorerPreferences = {
      expandedIds: [...expandedIds],
      favoriteIds: [...favoriteIds],
      recentIds,
      mode,
      sortMode
    };
    window.localStorage.setItem(preferencesKey, JSON.stringify(preferences));
  }, [expandedIds, favoriteIds, mode, recentIds, sortMode]);

  useEffect(() => {
    if (!requestedSelectedId || !model.nodeById.has(requestedSelectedId)) return;
    setSelectedId(requestedSelectedId);
  }, [model, requestedSelectedId]);

  useEffect(() => {
    const element = treeViewportRef.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver(([entry]) => setTreeViewportHeight(entry.contentRect.height));
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  const visibleIds = useMemo(() => getExplorerVisibleIds(model, {
    mode,
    query,
    recordType,
    validation,
    favorites: favoriteIds,
    recent: recentIds
  }), [favoriteIds, mode, model, query, recentIds, recordType, validation]);
  const rows = useMemo(() => flattenExplorerTree(model, { visibleIds, expandedIds, sortMode, forceExpandedIds: query.trim() ? visibleIds : undefined }), [expandedIds, model, query, sortMode, visibleIds]);
  const virtualWindow = useMemo(() => getExplorerVirtualWindow(rows.length, scrollTop, treeViewportHeight, treeRowHeight), [rows.length, scrollTop, treeViewportHeight]);
  const renderedRows = rows.slice(virtualWindow.start, virtualWindow.end);
  const selected = model.nodeById.get(selectedId) ?? model.nodeById.get(defaultRootId) ?? null;
  const breadcrumbs = selected ? getExplorerBreadcrumbs(model, selected.canonicalId) : [];
  const selectedChildIds = useMemo(() => selected
    ? (model.childIdsByParentId.get(selected.canonicalId) ?? []).filter((id) => visibleIds.has(id))
    : [], [model, selected, visibleIds]);
  const relationships = useMemo(() => selected
    ? getExplorerRelationshipGroups(model, selected.canonicalId, { visibleIds, maxRecordsPerGroup: 40 })
    : [], [model, selected, visibleIds]);
  const impact = selected ? calculateExplorerChangeImpact(model, selected.canonicalId) : null;
  const issues = selected ? model.issuesByRecordId.get(selected.canonicalId) ?? [] : [];
  const creatableTypes = getExplorerCreatableTypes(selected);
  const allRecordTypes = useMemo(() => [...new Set(model.nodes.map((node) => node.recordType))].sort(), [model.nodes]);
  const blockingIssues = model.nodes.filter((node) => node.validationStatus === "error").length;

  const selectNode = (node: UniverseExplorerNode, multi = false) => {
    setSelectedId(node.canonicalId);
    setRecentIds((current) => [node.canonicalId, ...current.filter((id) => id !== node.canonicalId)].slice(0, 40));
    if (multi) setMultiSelection((current) => new Set(current.has(node.canonicalId) ? [...current].filter((id) => id !== node.canonicalId) : [...current, node.canonicalId]));
    else setMultiSelection(new Set([node.canonicalId]));
  };

  const revealNode = (node: UniverseExplorerNode) => {
    const ancestorIds = getExplorerBreadcrumbs(model, node.canonicalId).map((crumb) => crumb.canonicalId);
    setExpandedIds((current) => new Set([...current, ...ancestorIds]));
    setMode("universe");
    selectNode(node);
  };

  const toggleExpanded = (node: UniverseExplorerNode) => {
    if (!node.isExpandable) return;
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(node.canonicalId)) next.delete(node.canonicalId);
      else next.add(node.canonicalId);
      return next;
    });
  };

  const toggleFavorite = () => {
    if (!selected) return;
    setFavoriteIds((current) => new Set(current.has(selected.canonicalId) ? [...current].filter((id) => id !== selected.canonicalId) : [...current, selected.canonicalId]));
  };

  const handleTreeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = rows.findIndex((row) => row.node.canonicalId === selected?.canonicalId);
    if (event.key === "ArrowDown" && currentIndex < rows.length - 1) {
      event.preventDefault();
      selectNode(rows[currentIndex + 1].node);
    }
    if (event.key === "ArrowUp" && currentIndex > 0) {
      event.preventDefault();
      selectNode(rows[currentIndex - 1].node);
    }
    if (event.key === "ArrowRight" && selected?.hasChildren) {
      event.preventDefault();
      setExpandedIds((current) => new Set([...current, selected.canonicalId]));
    }
    if (event.key === "ArrowLeft" && selected) {
      event.preventDefault();
      if (expandedIds.has(selected.canonicalId)) setExpandedIds((current) => new Set([...current].filter((id) => id !== selected.canonicalId)));
      else if (selected.parentId) {
        const parent = model.nodeById.get(selected.parentId);
        if (parent) selectNode(parent);
      }
    }
    if (event.key === "Enter" && selected) router.push(getExplorerGeneratorHref(selected), { scroll: false });
  };

  return (
    <main className="space-y-5">
      <WorkspaceHeader
        eyebrow="Canonical Navigation"
        title="Universe Explorer"
        description="Navigate the connected NOVERIS canon through the Identity & Relationship graph. Existing generators and libraries remain the editors for each record."
        stats={[
          { label: "Records", value: model.nodes.length.toLocaleString() },
          { label: "Relationships", value: graph.relationships.length.toLocaleString() },
          { label: "Validation", value: graph.validation.status },
          { label: "Blocking", value: blockingIssues }
        ]}
      />

      <section className="grid gap-3 md:grid-cols-4">
        <WorkspaceStatTile label="Universe Records" value={model.nodes.filter((node) => ["Universe", "Galaxy", "Galactic Region", "Star System", "Star", "Planet", "Moon"].includes(node.recordType)).length} />
        <WorkspaceStatTile label="Production Links" value={model.nodes.filter((node) => ["Prompt", "Asset", "Background", "Species Plate"].includes(node.recordType)).length} />
        <WorkspaceStatTile label="Favorites" value={favoriteIds.size} />
        <WorkspaceStatTile label="Validation Issues" value={model.nodes.filter((node) => node.validationStatus !== "valid").length} />
      </section>

      <section className="grid gap-4 2xl:grid-cols-[minmax(19rem,0.8fr)_minmax(28rem,1.2fr)_minmax(20rem,0.85fr)]">
        <WorkspacePanel title="Explorer" icon={FolderTree} className="min-w-0">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">View</span>
              <select value={mode} onChange={(event) => setMode(event.target.value as UniverseExplorerMode)} className="studio-input w-full text-sm">
                {universeExplorerModes.map((candidate) => <option key={candidate} value={candidate}>{modeLabels[candidate]}</option>)}
              </select>
            </label>
            <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search ID, name, type, owner, or relationship" />
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Type</span>
                <select value={recordType} onChange={(event) => setRecordType(event.target.value as CanonicalRecordType | "all")} className="studio-input w-full text-xs">
                  <option value="all">All types</option>
                  {allRecordTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Sort</span>
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value as UniverseExplorerSortMode)} className="studio-input w-full text-xs">
                  {universeExplorerSortModes.map((candidate) => <option key={candidate} value={candidate}>{candidate.replaceAll("_", " ")}</option>)}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "valid", "warning", "error", "orphan"] as const).map((candidate) => (
                <button key={candidate} type="button" onClick={() => setValidation(candidate)} className={cn("rounded-md border px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] transition", validation === candidate ? "border-cyan-200/55 bg-cyan-300/10 text-cyan-50" : "border-cyan-300/10 text-slate-500 hover:text-slate-200")}>
                  {candidate}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <span>{rows.length.toLocaleString()} visible</span>
              <span>{model.nodes.length.toLocaleString()} canonical</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => setExpandedIds(new Set(model.nodes.filter((node) => node.isExpandable).map((node) => node.canonicalId)))} className="rounded border border-cyan-300/15 px-1.5 py-1 text-[10px] font-bold hover:bg-cyan-300/5">Expand</button>
                <button type="button" onClick={() => setExpandedIds(new Set(model.rootIds))} className="rounded border border-cyan-300/15 px-1.5 py-1 text-[10px] font-bold hover:bg-cyan-300/5">Collapse</button>
              </div>
            </div>
          </div>

          <div ref={treeViewportRef} tabIndex={0} onKeyDown={handleTreeKeyDown} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)} className="mt-3 h-[min(58vh,42rem)] overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/35 p-1 outline-none focus-visible:ring-1 focus-visible:ring-cyan-200/60">
            <div style={{ height: virtualWindow.height, position: "relative" }}>
              <div style={{ transform: `translateY(${virtualWindow.top}px)` }}>
                {renderedRows.map(({ node, depth }) => {
                  const Icon = nodeIcon(node.recordType);
                  const isSelected = node.canonicalId === selected?.canonicalId;
                  const isExpanded = expandedIds.has(node.canonicalId);
                  return (
                    <div key={node.canonicalId} className="flex h-[38px] items-center gap-1" style={{ paddingLeft: `${depth * 14}px` }}>
                      <button type="button" onClick={() => toggleExpanded(node)} className={cn("grid h-5 w-5 shrink-0 place-items-center rounded text-slate-500 hover:bg-cyan-300/10 hover:text-cyan-100", !node.isExpandable && "invisible")} aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.displayName}`}>
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onDoubleClick={() => router.push(getExplorerGeneratorHref(node), { scroll: false })}
                        onClick={(event) => selectNode(node, event.metaKey || event.ctrlKey)}
                        className={cn("flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left transition", isSelected ? "bg-cyan-300/13 text-white shadow-[inset_3px_0_0_rgb(103_232_249)]" : "text-slate-300 hover:bg-cyan-300/5")}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-200/75" />
                        <span className="truncate text-xs font-semibold">{node.displayName}</span>
                        {node.validationStatus !== "valid" ? <span className={cn("ml-auto h-1.5 w-1.5 shrink-0 rounded-full", node.validationStatus === "error" ? "bg-rose-300" : node.validationStatus === "orphan" ? "bg-orange-300" : "bg-amber-300")} /> : null}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </WorkspacePanel>

        <div className="min-w-0 space-y-4">
          {selected ? (
            <>
              <WorkspacePanel title="Record Summary" icon={Network}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{selected.recordType}</p>
                    <h2 className="mt-1 truncate text-2xl font-black text-white">{selected.displayName}</h2>
                    <p className="mt-2 break-all font-mono text-[11px] text-slate-500">{selected.canonicalId}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <span className={cn("rounded-md border px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em]", statusTone(selected.validationStatus))}>{validationLabel(selected.validationStatus)}</span>
                    <WorkspaceBadge value={selected.runtimeStatus === "ready" ? "Runtime Ready" : selected.runtimeStatus.replaceAll("_", " ")} />
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <WorkspaceMiniStat label="Parent" value={selected.parentId ? model.nodeById.get(selected.parentId)?.displayName ?? selected.parentId : "Root"} />
                  <WorkspaceMiniStat label="Children" value={selectedChildIds.length} />
                  <WorkspaceMiniStat label="Dependencies" value={selected.dependencyCount} />
                  <WorkspaceMiniStat label="Version" value={selected.metadata.version} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <SmallAction href={getExplorerGeneratorHref(selected)} icon={ExternalLink}>Open Generator</SmallAction>
                  <SmallAction href={getExplorerLibraryHref(selected)} icon={Library}>Open Library</SmallAction>
                  <button type="button" onClick={toggleFavorite} className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold transition", favoriteIds.has(selected.canonicalId) ? "border-amber-200/55 bg-amber-300/10 text-amber-50" : "border-cyan-300/25 bg-cyan-300/5 text-cyan-50 hover:border-cyan-200/55")}><Heart className="h-3.5 w-3.5" />{favoriteIds.has(selected.canonicalId) ? "Favorited" : "Favorite"}</button>
                  <button type="button" onClick={() => copyText(selected.canonicalId)} className="inline-flex items-center gap-1.5 rounded-md border border-cyan-300/25 bg-cyan-300/5 px-2.5 py-1.5 text-xs font-bold text-cyan-50 transition hover:border-cyan-200/55"><ClipboardCopy className="h-3.5 w-3.5" />Copy ID</button>
                  <button type="button" onClick={() => copyText(breadcrumbs.map((crumb) => crumb.displayName).join(" / "))} className="inline-flex items-center gap-1.5 rounded-md border border-cyan-300/25 bg-cyan-300/5 px-2.5 py-1.5 text-xs font-bold text-cyan-50 transition hover:border-cyan-200/55"><Copy className="h-3.5 w-3.5" />Copy Path</button>
                </div>
              </WorkspacePanel>

              <WorkspacePanel title="Canonical Path" icon={GitFork}>
                <nav className="flex flex-wrap items-center gap-1.5" aria-label="Canonical record path">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.canonicalId} className="flex items-center gap-1.5">
                      {index ? <ChevronRight className="h-3.5 w-3.5 text-slate-600" /> : null}
                      <button type="button" onClick={() => revealNode(crumb)} className="max-w-[12rem] truncate text-xs font-bold text-cyan-100 hover:text-cyan-300">{crumb.displayName}</button>
                    </span>
                  ))}
                </nav>
              </WorkspacePanel>

              <section className="grid gap-4 xl:grid-cols-2">
                <WorkspacePanel title="Children" icon={FolderTree}>
                  <div className="space-y-2">
                    {selectedChildIds.slice(0, 10).map((id) => model.nodeById.get(id)).filter((node): node is UniverseExplorerNode => Boolean(node)).map((node) => <RelationshipRecordLink key={node.canonicalId} node={node} onSelect={(id) => { const target = model.nodeById.get(id); if (target) revealNode(target); }} />)}
                    {!selectedChildIds.length ? <p className="text-sm text-slate-500">No child records are defined in this view.</p> : null}
                    {selectedChildIds.length > 10 ? <p className="text-xs text-slate-500">{selectedChildIds.length - 10} additional children remain in the hierarchy tree.</p> : null}
                  </div>
                  {creatableTypes.length ? <div className="mt-4 border-t border-cyan-300/10 pt-3"><p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Create in context</p><div className="flex flex-wrap gap-2">{creatableTypes.map((type) => { const href = getExplorerCreateHref(selected, type); return href ? <SmallAction key={type} href={href} icon={Plus}>Create {type}</SmallAction> : null; })}</div></div> : null}
                </WorkspacePanel>
                <WorkspacePanel title="Context & Activity" icon={History}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <WorkspaceMiniStat label="Canonical status" value={selected.metadata.status} />
                    <WorkspaceMiniStat label="Production" value={selected.productionStatus} />
                    <WorkspaceMiniStat label="Modified" value={selected.metadata.updatedAt.slice(0, 10)} />
                    <WorkspaceMiniStat label="Owner" value={model.nodeById.get(selected.metadata.ownerId)?.displayName ?? selected.metadata.ownerId} />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">This navigation state is personal to your Studio session. It is never included in canonical runtime exports.</p>
                </WorkspacePanel>
              </section>
            </>
          ) : null}
        </div>

        <div className="min-w-0 space-y-4">
          <WorkspacePanel title="Relationship Inspector" icon={Link2}>
            <div className="space-y-4">
              {relationships.map((group) => (
                <div key={`${group.direction}:${group.relationshipType}`}>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{group.direction} · {group.relationshipType.replaceAll("_", " ")}</p>
                  <div className="space-y-2">{group.records.slice(0, 7).map((node) => <RelationshipRecordLink key={node.canonicalId} node={node} onSelect={(id) => { const target = model.nodeById.get(id); if (target) revealNode(target); }} />)}</div>
                  {group.totalCount > 7 ? <p className="mt-2 text-xs text-slate-500">{group.totalCount - 7} more relationships are available in this view.</p> : null}
                </div>
              ))}
              {!relationships.length ? <p className="rounded-md border border-cyan-300/10 bg-slate-950/35 px-3 py-5 text-center text-sm text-slate-500">No additional typed relationships are defined.</p> : null}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Validation & Impact" icon={ShieldCheck}>
            <div className="flex items-center justify-between gap-3"><span className={cn("rounded-md border px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em]", statusTone(selected?.validationStatus ?? "valid"))}>{validationLabel(selected?.validationStatus ?? "valid")}</span><span className="text-xs text-slate-500">{issues.length} issue{issues.length === 1 ? "" : "s"}</span></div>
            {issues.length ? <div className="mt-3 space-y-2">{issues.map((issue) => <div key={`${issue.code}:${issue.records.join(":")}`} className="rounded-md border border-amber-300/15 bg-amber-300/5 p-2.5"><p className="text-xs font-bold text-amber-100">{issue.code.replaceAll("_", " ")}</p><p className="mt-1 text-xs leading-5 text-slate-400">{issue.message}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No validation issues for this record.</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <WorkspaceMiniStat label="Affected records" value={impact?.affectedObjectIds.length ?? 0} />
              <WorkspaceMiniStat label="Runtime exports" value={impact?.unityExportIds.length ?? 0} />
              <WorkspaceMiniStat label="Assets" value={impact?.affectedAssetIds.length ?? 0} />
              <WorkspaceMiniStat label="Prompts" value={impact?.affectedPromptIds.length ?? 0} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Move and delete remain protected actions: this impact summary must be reviewed before a canonical relationship changes.</p>
          </WorkspacePanel>

          <WorkspacePanel title="Explorer Actions" icon={CircleCheck}>
            <div className="grid gap-2">
              <button type="button" onClick={() => copyText([...multiSelection].join("\n"))} disabled={!multiSelection.size} className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/5 px-3 py-2 text-xs font-bold text-cyan-50 transition hover:border-cyan-200/55 disabled:cursor-not-allowed disabled:opacity-40"><Copy className="h-3.5 w-3.5" />Export {multiSelection.size || "selected"} ID{multiSelection.size === 1 ? "" : "s"}</button>
              <button type="button" onClick={() => setMultiSelection(new Set())} disabled={!multiSelection.size} className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-300/15 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-cyan-300/5 disabled:cursor-not-allowed disabled:opacity-40"><X className="h-3.5 w-3.5" />Clear Selection</button>
              <button type="button" onClick={() => { setMode("validation"); setValidation("all"); }} className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-300/15 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-cyan-300/5"><FileWarning className="h-3.5 w-3.5" />Open Validation View</button>
            </div>
          </WorkspacePanel>
        </div>
      </section>
    </main>
  );
}
