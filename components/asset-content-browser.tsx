"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Box, Boxes, ChevronRight, FileImage, Folder, FolderOpen, Search } from "lucide-react";
import { WorkspaceMiniStat, WorkspaceSearchBar } from "@/components/ui/workspace";
import type { AssetProductionState } from "@/lib/assets/asset-production";

type InventoryItem = AssetProductionState["assetLibraryInventory"]["items"][number];
type InventoryStatus = InventoryItem["status"];

type ContentBrowserNode = {
  id: string;
  label: string;
  categoryIds?: InventoryItem["categoryId"][];
  terms?: string[];
  children?: ContentBrowserNode[];
};

const contentTree: ContentBrowserNode[] = [
  {
    id: "universe",
    label: "Universe",
    categoryIds: ["galaxy-ui", "planet-ui"],
    children: [
      { id: "universe/galaxies", label: "Galaxies", categoryIds: ["galaxy-ui"], terms: ["galaxy"] },
      { id: "universe/sectors", label: "Sectors", categoryIds: ["galaxy-ui"], terms: ["sector"] },
      { id: "universe/star-systems", label: "Star Systems", categoryIds: ["galaxy-ui"], terms: ["star system", "system"] },
      { id: "universe/stars", label: "Stars", categoryIds: ["galaxy-ui"], terms: ["star"] },
      { id: "universe/planets", label: "Planets", categoryIds: ["planet-ui"], terms: ["planet"] },
      { id: "universe/moons", label: "Moons", categoryIds: ["planet-ui"], terms: ["moon"] },
      { id: "universe/asteroid-belts", label: "Asteroid Belts", categoryIds: ["planet-ui"], terms: ["asteroid"] },
      { id: "universe/comets", label: "Comets", categoryIds: ["planet-ui"], terms: ["comet"] },
      { id: "universe/black-holes", label: "Black Holes", categoryIds: ["galaxy-ui"], terms: ["black hole"] },
      { id: "universe/nebulae", label: "Nebulae", categoryIds: ["galaxy-ui"], terms: ["nebula"] }
    ]
  },
  {
    id: "civilization",
    label: "Civilization",
    categoryIds: ["buildings-ui", "research-ui", "icons", "backgrounds"],
    children: [
      { id: "civilization/buildings", label: "Buildings", categoryIds: ["buildings-ui"], terms: ["building"] },
      { id: "civilization/research", label: "Research", categoryIds: ["research-ui"], terms: ["research"] },
      { id: "civilization/resources", label: "Resources", categoryIds: ["icons"], terms: ["resource", "economy"] },
      { id: "civilization/population", label: "Population", categoryIds: ["top-hud", "icons"], terms: ["population"] },
      { id: "civilization/colonies", label: "Colonies", categoryIds: ["buildings-ui", "planet-ui"], terms: ["colony", "colonies"] },
      { id: "civilization/districts", label: "Districts", categoryIds: ["buildings-ui"], terms: ["district"] },
      { id: "civilization/vehicles", label: "Vehicles", categoryIds: ["illustrations"], terms: ["vehicle"] },
      { id: "civilization/ships", label: "Ships", categoryIds: ["illustrations"], terms: ["ship"] },
      { id: "civilization/units", label: "Units (future)", categoryIds: ["illustrations"], terms: ["unit"] }
    ]
  },
  {
    id: "discovery",
    label: "Discovery",
    categoryIds: ["discovery"],
    children: [
      { id: "discovery/artifacts", label: "Artifacts", categoryIds: ["discovery"], terms: ["artifact"] },
      { id: "discovery/ancient-technology", label: "Ancient Technology", categoryIds: ["discovery"], terms: ["ancient", "technology"] },
      { id: "discovery/lifeforms", label: "Lifeforms", categoryIds: ["discovery"], terms: ["lifeform"] },
      { id: "discovery/plants", label: "Plants", categoryIds: ["discovery"], terms: ["plant"] },
      { id: "discovery/creatures", label: "Creatures", categoryIds: ["discovery"], terms: ["creature"] },
      { id: "discovery/rare-matter", label: "Rare Matter", categoryIds: ["discovery"], terms: ["rare matter"] },
      { id: "discovery/signals", label: "Signals", categoryIds: ["discovery"], terms: ["signal"] },
      { id: "discovery/anomalies", label: "Anomalies", categoryIds: ["discovery"], terms: ["anomaly", "anomalies"] }
    ]
  },
  {
    id: "world-systems",
    label: "World Systems",
    categoryIds: ["ai-agents", "icons", "backgrounds", "animations"],
    children: [
      { id: "world-systems/actions", label: "Actions", categoryIds: ["icons"], terms: ["action"] },
      { id: "world-systems/events", label: "Events", categoryIds: ["icons", "backgrounds"], terms: ["event"] },
      { id: "world-systems/missions", label: "Missions", categoryIds: ["icons", "backgrounds"], terms: ["mission"] },
      { id: "world-systems/expeditions", label: "Expeditions", categoryIds: ["icons"], terms: ["expedition"] },
      { id: "world-systems/economy", label: "Economy", categoryIds: ["top-hud", "icons"], terms: ["economy", "credits", "labor"] },
      { id: "world-systems/trade", label: "Trade", categoryIds: ["icons"], terms: ["trade"] },
      { id: "world-systems/logistics", label: "Logistics", categoryIds: ["icons"], terms: ["logistics"] },
      { id: "world-systems/ai-agents", label: "AI Agents", categoryIds: ["ai-agents"], terms: ["ai agent", "robot"] }
    ]
  },
  {
    id: "user-interface",
    label: "User Interface",
    categoryIds: ["top-hud", "left-navigation", "settings-ui", "login-ui", "loading-ui", "upgrade-categories", "icons", "backgrounds", "animations"],
    children: [
      { id: "user-interface/hud", label: "HUD", categoryIds: ["top-hud"], terms: ["hud"] },
      { id: "user-interface/menus", label: "Menus", categoryIds: ["left-navigation", "settings-ui"], terms: ["menu", "navigation"] },
      { id: "user-interface/inventory", label: "Inventory", categoryIds: ["icons"], terms: ["inventory"] },
      { id: "user-interface/buttons", label: "Buttons", categoryIds: ["icons", "upgrade-categories"], terms: ["button"] },
      { id: "user-interface/icons", label: "Icons", categoryIds: ["icons", "top-hud", "left-navigation"], terms: ["icon"] },
      { id: "user-interface/backgrounds", label: "Backgrounds", categoryIds: ["backgrounds", "loading-ui"], terms: ["background"] },
      { id: "user-interface/panels", label: "Panels", categoryIds: ["top-hud", "upgrade-categories", "settings-ui"], terms: ["panel"] },
      { id: "user-interface/animations", label: "Animations", categoryIds: ["animations"], terms: ["animation"] }
    ]
  },
  { id: "audio", label: "Audio", categoryIds: ["audio"] },
  { id: "video", label: "Video", categoryIds: ["video"] },
  { id: "marketing", label: "Marketing", categoryIds: ["illustrations", "backgrounds"], terms: ["marketing", "hero"] },
  { id: "components", label: "Components", terms: ["component"] },
  { id: "engine", label: "Engine", categoryIds: ["unmapped"], terms: ["runtime", "engine", "mapping"] }
];

const defaultExpanded = ["universe", "civilization", "discovery", "world-systems", "user-interface"];
const statusFilters: Array<"all" | InventoryStatus | "missing_art"> = ["all", "missing_art", "approved", "published", "needs_review", "missing", "uploaded", "unmapped"];
const sortOptions = ["name", "newest", "oldest", "status", "recently_updated", "recently_used"] as const;
const engineFilters = ["all", "web", "roblox", "ios", "android"] as const;
const typeFilters = ["all", "icon", "background", "panel", "animation", "audio", "video", "artwork"] as const;
const resolutionFilters = ["all", "small", "medium", "large", "unknown"] as const;

function flattenTree(nodes: ContentBrowserNode[]): ContentBrowserNode[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children ?? [])]);
}

const flatNodes = flattenTree(contentTree);

const categoryInitialNodeMap: Partial<Record<InventoryItem["categoryId"], string>> = {
  "top-hud": "user-interface/hud",
  "left-navigation": "user-interface/menus",
  "upgrade-categories": "user-interface/buttons",
  "research-ui": "civilization/research",
  "buildings-ui": "civilization/buildings",
  "galaxy-ui": "universe/galaxies",
  "planet-ui": "universe/planets",
  "settings-ui": "user-interface/menus",
  "login-ui": "user-interface/menus",
  "loading-ui": "user-interface/backgrounds",
  discovery: "discovery",
  encyclopedia: "civilization",
  "ai-agents": "world-systems/ai-agents",
  icons: "user-interface/icons",
  backgrounds: "user-interface/backgrounds",
  illustrations: "marketing",
  animations: "user-interface/animations",
  audio: "audio",
  video: "video",
  unmapped: "engine"
};

function resolveInitialNode(value?: string | null) {
  if (value && flatNodes.some((node) => node.id === value)) return value;
  if (value && value in categoryInitialNodeMap) return categoryInitialNodeMap[value as InventoryItem["categoryId"]] ?? "user-interface";
  return "user-interface";
}

function nodeById(id: string) {
  return flatNodes.find((node) => node.id === id) ?? contentTree[0];
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  if (status === "published") return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  if (status === "approved") return "border-cyan-300/25 bg-cyan-400/10 text-cyan-100";
  if (status === "uploaded" || status === "needs_review" || status === "processing") return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  if (status === "invalid") return "border-rose-300/25 bg-rose-400/10 text-rose-100";
  return "border-slate-500/35 bg-slate-500/10 text-slate-200";
}

function searchText(item: InventoryItem) {
  return [
    item.displayName,
    item.semanticAssetKey,
    item.role,
    item.status,
    item.categoryPath,
    item.sourceType,
    item.requiredDimensions,
    item.currentDimensions,
    item.referencedByScreens.map((reference) => reference.name).join(" "),
    item.referencedByComponents.map((reference) => reference.name).join(" "),
    item.referencedByPlaceholders.map((reference) => reference.name).join(" ")
  ].join(" ").toLowerCase();
}

function itemMatchesNode(item: InventoryItem, node: ContentBrowserNode) {
  const categoryMatch = node.categoryIds?.includes(item.categoryId) ?? false;
  const text = searchText(item);
  const termMatch = node.terms?.some((term) => text.includes(term.toLowerCase())) ?? false;
  return categoryMatch || termMatch;
}

function usageCount(item: InventoryItem) {
  return item.referencedByScreens.length + item.referencedByComponents.length + item.referencedByPlaceholders.length;
}

function itemHref(item: InventoryItem) {
  return item.sourceAssetId ? `/assets/${encodeURIComponent(item.sourceAssetId)}` : `/assets?upload=asset&assetKey=${encodeURIComponent(item.semanticAssetKey)}`;
}

function imageFor(item: InventoryItem) {
  return item.previewUrl;
}

function resolutionBucket(item: InventoryItem) {
  const match = item.currentDimensions.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return "unknown";
  const width = Number(match[1]);
  const height = Number(match[2]);
  const max = Math.max(width, height);
  if (max >= 2000) return "large";
  if (max >= 512) return "medium";
  return "small";
}

function isAnimated(item: InventoryItem) {
  return /animation|animated|blink|idle|gif|video|mp4|webm/i.test(`${item.role} ${item.semanticAssetKey} ${item.displayName}`);
}

function ContentTreeNode({
  node,
  activeId,
  expanded,
  counts,
  depth = 0,
  onToggle,
  onSelect
}: {
  node: ContentBrowserNode;
  activeId: string;
  expanded: Set<string>;
  counts: Map<string, number>;
  depth?: number;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expanded.has(node.id);
  const active = activeId === node.id;
  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-md text-sm transition ${active ? "bg-cyan-300/14 text-white" : "text-slate-400 hover:bg-cyan-300/8 hover:text-slate-100"}`}
        style={{ paddingLeft: `${0.35 + depth * 0.85}rem` }}
      >
        <button
          type="button"
          className="grid h-7 w-6 shrink-0 place-items-center rounded text-slate-500 transition hover:bg-cyan-300/10 hover:text-cyan-100"
          onClick={() => hasChildren ? onToggle(node.id) : onSelect(node.id)}
          aria-label={hasChildren ? `${isExpanded ? "Collapse" : "Expand"} ${node.label}` : `Open ${node.label}`}
        >
          {hasChildren ? <ChevronRight className={`h-3.5 w-3.5 transition ${isExpanded ? "rotate-90" : ""}`} /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />}
        </button>
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left" onClick={() => onSelect(node.id)}>
          {hasChildren ? isExpanded ? <FolderOpen className="h-4 w-4 shrink-0 text-cyan-200/80" /> : <Folder className="h-4 w-4 shrink-0 text-cyan-200/60" /> : <Box className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
          <span className="truncate font-semibold">{node.label}</span>
          <span className="ml-auto rounded border border-cyan-300/10 bg-slate-950/45 px-1.5 py-0.5 text-[0.62rem] font-bold text-slate-500">{counts.get(node.id) ?? 0}</span>
        </button>
      </div>
      {hasChildren && isExpanded ? (
        <div className="mt-0.5">
          {node.children?.map((child) => (
            <ContentTreeNode key={child.id} node={child} activeId={activeId} expanded={expanded} counts={counts} depth={depth + 1} onToggle={onToggle} onSelect={onSelect} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ContentBrowserTree({
  activeId,
  counts,
  onSelect
}: {
  activeId: string;
  counts: Map<string, number>;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded));

  useEffect(() => {
    const stored = window.localStorage.getItem("project-genesis-content-browser-expanded");
    if (stored) setExpanded(new Set(JSON.parse(stored) as string[]));
  }, []);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      window.localStorage.setItem("project-genesis-content-browser-expanded", JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <aside className="min-h-0 rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-3 shadow-glow lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Boxes className="h-4 w-4 text-cyan-200" />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Content Tree</p>
          <p className="text-xs text-slate-500">Browse canonical assets</p>
        </div>
      </div>
      <div className="space-y-0.5">
        {contentTree.map((node) => (
          <ContentTreeNode key={node.id} node={node} activeId={activeId} expanded={expanded} counts={counts} onToggle={toggle} onSelect={onSelect} />
        ))}
      </div>
    </aside>
  );
}

function PreviewSurface({ item, className = "h-full" }: { item: InventoryItem; className?: string }) {
  const image = imageFor(item);
  if (image) {
    return <img src={image} alt={`${item.displayName} library thumbnail`} width={480} height={270} loading="lazy" decoding="async" className={`${className} w-full object-cover`} />;
  }
  return (
    <div className={`${className} grid w-full place-items-center bg-[radial-gradient(circle_at_35%_25%,rgba(103,232,249,0.12),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))]`}>
      <div className="text-center">
        <FileImage className="mx-auto h-5 w-5 text-cyan-100/40" />
        <p className="mt-2 text-xs font-black text-slate-300">{item.status === "missing" ? "Artwork Needed" : statusLabel(item.status)}</p>
      </div>
    </div>
  );
}

function AssetBrowserCard({
  item,
  selected,
  checked,
  onSelect,
  onToggle
}: {
  item: InventoryItem;
  selected: boolean;
  checked: boolean;
  onSelect: (item: InventoryItem) => void;
  onToggle: (item: InventoryItem) => void;
}) {
  return (
    <article
      className={`group relative h-[176px] overflow-visible rounded-md border bg-[#07101e]/88 shadow-sm transition ${selected ? "border-cyan-200/70 ring-1 ring-cyan-300/30" : "border-cyan-300/15 hover:border-cyan-300/45"}`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "220px 176px" }}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        onDoubleClick={() => window.location.assign(itemHref(item))}
        className="flex h-full w-full flex-col text-left focus:outline-none focus:ring-2 focus:ring-cyan-200/60"
      >
        <div className="aspect-video overflow-hidden rounded-t-md border-b border-cyan-300/10 bg-slate-950/70">
          <PreviewSurface item={item} />
        </div>
        <div className="min-w-0 flex-1 p-2.5">
          <p className="truncate text-sm font-black text-white" title={item.displayName}>{item.displayName}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className={`truncate rounded border px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.1em] ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
            <span className="truncate text-[0.65rem] font-semibold text-slate-500">{item.role}</span>
          </div>
        </div>
      </button>
      <label className={`absolute left-2 top-2 z-20 grid h-6 w-6 place-items-center rounded border border-cyan-300/25 bg-slate-950/80 transition group-hover:opacity-100 ${checked ? "opacity-100" : "opacity-0"}`} aria-label={`Select ${item.displayName}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(item)}
          onClick={(event) => event.stopPropagation()}
          className="h-3.5 w-3.5 accent-cyan-300"
        />
      </label>
      <div className="absolute bottom-2 right-2 z-20 hidden gap-1 group-hover:flex">
        <Link href={itemHref(item)} className="rounded border border-cyan-300/25 bg-slate-950/90 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-cyan-100">Open</Link>
        <Link href={itemHref(item)} className="rounded border border-slate-600 bg-slate-950/90 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-slate-200">Inspect</Link>
      </div>
      <div className="pointer-events-none absolute left-3 top-3 z-30 hidden w-80 translate-x-8 rounded-md border border-cyan-300/30 bg-slate-950/96 p-3 shadow-2xl group-hover:block">
        <div className="aspect-video overflow-hidden rounded border border-cyan-300/15">
          <PreviewSurface item={item} />
        </div>
        <p className="mt-3 truncate text-sm font-black text-white">{item.displayName}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <WorkspaceMiniStat label="Dimensions" value={item.currentDimensions} />
          <WorkspaceMiniStat label="Status" value={statusLabel(item.status)} />
        </div>
        <div className="mt-3 flex gap-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-cyan-100">
          <span>Preview</span>
          <span>Open</span>
          <span>Replace</span>
          <span>Usage</span>
          {item.sourceAssetId ? <span>Download</span> : null}
        </div>
      </div>
    </article>
  );
}

function breadcrumbFor(node: ContentBrowserNode) {
  const parts = node.id.split("/");
  if (parts.length === 1) return [node.label];
  const parent = nodeById(parts[0]);
  return [parent.label, node.label];
}

function sortItems(items: InventoryItem[], sort: typeof sortOptions[number]) {
  const rows = [...items];
  if (sort === "name") return rows.sort((left, right) => left.displayName.localeCompare(right.displayName));
  if (sort === "status") return rows.sort((left, right) => left.status.localeCompare(right.status) || left.displayName.localeCompare(right.displayName));
  if (sort === "recently_used") return rows.sort((left, right) => usageCount(right) - usageCount(left) || left.displayName.localeCompare(right.displayName));
  if (sort === "oldest") return rows.sort((left, right) => left.sortOrder - right.sortOrder);
  return rows.sort((left, right) => right.sortOrder - left.sortOrder);
}

function BulkActionBar({
  selectedCount,
  message,
  onAction
}: {
  selectedCount: number;
  message: string;
  onAction: (action: string) => void;
}) {
  const actions = ["Delete", "Move", "Replace", "Tag", "Publish", "Approve"];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 shadow-glow">
      <p className="text-xs font-semibold text-slate-400">{selectedCount ? `${selectedCount} selected` : "Select assets for bulk operations"}</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            disabled={!selectedCount}
            onClick={() => onAction(action)}
            className="h-8 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900/40 disabled:text-slate-600"
          >
            {action}
          </button>
        ))}
      </div>
      {message ? <p className="basis-full text-xs font-semibold text-cyan-100">{message}</p> : null}
    </div>
  );
}

function QuickPreviewOverlay({ item, onClose }: { item: InventoryItem | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-md border border-cyan-300/25 bg-[#07101e] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="aspect-video overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/70">
          <PreviewSurface item={item} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-white">{item.displayName}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Space or Esc closes preview</p>
          </div>
          <Link href={itemHref(item)} className="inline-flex h-9 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Open Asset</Link>
        </div>
      </div>
    </div>
  );
}

export function AssetContentBrowser({ state, initialNode }: { state: AssetProductionState; initialNode?: string | null }) {
  const [activeNodeId, setActiveNodeId] = useState(() => resolveInitialNode(initialNode));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("all");
  const [engineFilter, setEngineFilter] = useState<(typeof engineFilters)[number]>("all");
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]>("all");
  const [resolutionFilter, setResolutionFilter] = useState<(typeof resolutionFilters)[number]>("all");
  const [animatedOnly, setAnimatedOnly] = useState(false);
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("name");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkMessage, setBulkMessage] = useState("");
  const [quickPreviewItem, setQuickPreviewItem] = useState<InventoryItem | null>(null);
  const activeNode = nodeById(activeNodeId);

  const counts = useMemo(() => {
    const next = new Map<string, number>();
    for (const node of flatNodes) {
      next.set(node.id, state.assetLibraryInventory.items.filter((item) => itemMatchesNode(item, node)).length);
    }
    return next;
  }, [state.assetLibraryInventory.items]);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const nodeItems = state.assetLibraryInventory.items.filter((item) => itemMatchesNode(item, activeNode));
    return sortItems(nodeItems.filter((item) => {
      if (needle && !searchText(item).includes(needle)) return false;
      if (statusFilter === "missing_art" && !["missing", "unmapped", "invalid"].includes(item.status)) return false;
      if (statusFilter !== "all" && statusFilter !== "missing_art" && item.status !== statusFilter) return false;
      if (engineFilter !== "all" && item.platformReadiness[engineFilter] !== "ready") return false;
      if (typeFilter !== "all" && !`${item.role} ${item.semanticAssetKey}`.toLowerCase().includes(typeFilter.replace("_", " "))) return false;
      if (resolutionFilter !== "all" && resolutionBucket(item) !== resolutionFilter) return false;
      if (animatedOnly && !isAnimated(item)) return false;
      return true;
    }), sort);
  }, [activeNode, animatedOnly, engineFilter, query, resolutionFilter, sort, state.assetLibraryInventory.items, statusFilter, typeFilter]);

  useEffect(() => {
    setSelectedId((current) => current && filteredItems.some((item) => item.id === current) ? current : filteredItems[0]?.id ?? null);
  }, [filteredItems]);

  const selectedItem = filteredItems.find((item) => item.id === selectedId) ?? null;
  const visibleItems = filteredItems.slice(0, 320);
  const crumbs = breadcrumbFor(activeNode);

  function handleGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!visibleItems.length) return;
    const currentIndex = Math.max(0, visibleItems.findIndex((item) => item.id === selectedId));
    const columnCount = window.matchMedia("(min-width: 1536px)").matches ? 5 : window.matchMedia("(min-width: 1280px)").matches ? 4 : window.matchMedia("(min-width: 1024px)").matches ? 3 : window.matchMedia("(min-width: 640px)").matches ? 2 : 1;
    const nextIndex =
      event.key === "ArrowRight" ? Math.min(visibleItems.length - 1, currentIndex + 1) :
      event.key === "ArrowLeft" ? Math.max(0, currentIndex - 1) :
      event.key === "ArrowDown" ? Math.min(visibleItems.length - 1, currentIndex + columnCount) :
      event.key === "ArrowUp" ? Math.max(0, currentIndex - columnCount) :
      currentIndex;
    if (nextIndex !== currentIndex) {
      event.preventDefault();
      setSelectedId(visibleItems[nextIndex].id);
    }
    if (event.key === "Enter" && selectedItem) {
      window.location.assign(itemHref(selectedItem));
    }
    if (event.key === " " && selectedItem) {
      event.preventDefault();
      setQuickPreviewItem((current) => current?.id === selectedItem.id ? null : selectedItem);
    }
    if (event.key === "Escape") {
      setQuickPreviewItem(null);
    }
  }

  function toggleSelected(item: InventoryItem) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  function runBulkAction(action: string) {
    setBulkMessage(`${action} is ready for ${selectedIds.size} selected asset${selectedIds.size === 1 ? "" : "s"}. Open Asset Detail for record-level review before destructive changes.`);
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] space-y-3">
      <header className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 px-4 py-3 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Content Browser</p>
            <h1 className="text-2xl font-black text-white">Asset Library</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-400">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb}:${index}`} className="inline-flex items-center gap-2">
                {index ? <ChevronRight className="h-3 w-3 text-slate-600" /> : null}
                <span className={index === crumbs.length - 1 ? "text-cyan-100" : ""}>{crumb}</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <ContentBrowserTree activeId={activeNodeId} counts={counts} onSelect={setActiveNodeId} />
        <section className="min-w-0 space-y-3">
          <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 shadow-glow">
            <div className="grid gap-3 xl:grid-cols-[minmax(18rem,1fr)_repeat(5,minmax(7rem,9rem))]">
              <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search name, tags, semantic role, category, status, canonical ID" className="p-2" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                {statusFilters.map((status) => <option key={status} value={status}>{status === "all" ? "All Status" : status === "missing_art" ? "Missing Art" : statusLabel(status)}</option>)}
              </select>
              <select value={engineFilter} onChange={(event) => setEngineFilter(event.target.value as typeof engineFilter)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                {engineFilters.map((engine) => <option key={engine} value={engine}>{engine === "all" ? "All Engines" : engine.toUpperCase()}</option>)}
              </select>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                {typeFilters.map((type) => <option key={type} value={type}>{type === "all" ? "All Types" : statusLabel(type)}</option>)}
              </select>
              <select value={resolutionFilter} onChange={(event) => setResolutionFilter(event.target.value as typeof resolutionFilter)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                {resolutionFilters.map((resolution) => <option key={resolution} value={resolution}>{resolution === "all" ? "Any Resolution" : statusLabel(resolution)}</option>)}
              </select>
              <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                {sortOptions.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}
              </select>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                <input type="checkbox" checked={animatedOnly} onChange={(event) => setAnimatedOnly(event.target.checked)} className="h-4 w-4 accent-cyan-300" />
                Animated
              </label>
              <p className="text-xs font-semibold text-slate-500">{visibleItems.length} shown / {filteredItems.length} matched / {state.assetLibraryInventory.items.length} indexed</p>
            </div>
          </div>
          <BulkActionBar selectedCount={selectedIds.size} message={bulkMessage} onAction={runBulkAction} />

          <div
            role="grid"
            aria-label={`${activeNode.label} asset grid`}
            tabIndex={0}
            onKeyDown={handleGridKeyDown}
            className="grid items-start gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 220px))" }}
          >
            {visibleItems.map((item) => (
              <AssetBrowserCard
                key={item.id}
                item={item}
                selected={selectedId === item.id}
                checked={selectedIds.has(item.id)}
                onSelect={(next) => setSelectedId(next.id)}
                onToggle={toggleSelected}
              />
            ))}
          </div>
          {filteredItems.length > visibleItems.length ? (
            <p className="rounded-md border border-cyan-300/10 bg-slate-950/50 p-3 text-sm font-semibold text-slate-400">
              Showing the first {visibleItems.length} assets for bounded browser performance. Search or filter to narrow the result set.
            </p>
          ) : null}
          {!filteredItems.length ? (
            <div className="grid min-h-80 place-items-center rounded-md border border-cyan-300/15 bg-[#07101e]/80 text-center">
              <div>
                <Search className="mx-auto h-8 w-8 text-cyan-100/35" />
                <p className="mt-3 text-sm font-bold text-slate-400">No assets match this folder and filter set.</p>
              </div>
            </div>
          ) : null}
        </section>
      </section>
      <QuickPreviewOverlay item={quickPreviewItem} onClose={() => setQuickPreviewItem(null)} />
    </main>
  );
}
