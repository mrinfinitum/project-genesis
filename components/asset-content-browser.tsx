"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type DragEvent, type KeyboardEvent, type MouseEvent } from "react";
import { Box, Boxes, ChevronRight, FileImage, Folder, FolderOpen, Search } from "lucide-react";
import { WorkspaceMiniStat, WorkspaceSearchBar } from "@/components/ui/workspace";
import biologicalCuriosityTaxonomyPack from "@/data/curiosity-volume-01-biological-taxonomy.json";
import faunaCuriosityTaxonomyPack from "@/data/curiosity-volume-02-fauna-taxonomy.json";
import geologicalCuriosityTaxonomyPack from "@/data/curiosity-volume-03-geological-taxonomy.json";
import ancientRelicsCuriosityTaxonomyPack from "@/data/curiosity-volume-04-ancient-relics-taxonomy.json";
import alienTechnologyCuriosityTaxonomyPack from "@/data/curiosity-volume-05-alien-technology-taxonomy.json";
import ruinsStructuresCuriosityTaxonomyPack from "@/data/curiosity-volume-06-ruins-and-structures-taxonomy.json";
import energyPhenomenaCuriosityTaxonomyPack from "@/data/curiosity-volume-07-energy-phenomena-taxonomy.json";
import anomaliesCuriosityTaxonomyPack from "@/data/curiosity-volume-08-anomalies-taxonomy.json";
import unknownObjectsCuriosityTaxonomyPack from "@/data/curiosity-volume-09-unknown-objects-taxonomy.json";
import geneticArchivesCuriosityTaxonomyPack from "@/data/curiosity-volume-10-genetic-archives-taxonomy.json";
import type { AssetLibraryInventoryIndex } from "@/lib/assets/asset-library-inventory";

type AssetBrowserState = { assetLibraryInventory: AssetLibraryInventoryIndex };
type InventoryItem = AssetLibraryInventoryIndex["items"][number];
type InventoryStatus = InventoryItem["status"];

type ContentBrowserNode = {
  id: string;
  label: string;
  categoryIds?: InventoryItem["categoryId"][];
  terms?: string[];
  children?: ContentBrowserNode[];
};

type ViewMode = "grid" | "list";
type ThumbnailSize = "small" | "medium" | "large";
type CuriosityTaxonomyPack = {
  taxonomy: Record<string, Record<string, string[]>>;
};

const browserPreferenceKeys = {
  activeNode: "project-genesis-content-browser-active-node",
  viewMode: "project-genesis-content-browser-view-mode",
  thumbnailSize: "project-genesis-content-browser-thumbnail-size",
  favorites: "project-genesis-content-browser-favorites",
  recentlyUsed: "project-genesis-content-browser-recently-used",
  recentlyOpened: "project-genesis-content-browser-recently-opened",
  folderOverrides: "project-genesis-content-browser-folder-overrides"
};

const legacyDiscoveryFolderRedirects: Record<string, string> = {
  "discovery/artifacts": "discovery/ancient-relics",
  "discovery/lifeforms": "discovery/fauna",
  "discovery/plants": "discovery/biological:biological-flora",
  "discovery/creatures": "discovery/fauna",
  "discovery/rare-matter": "discovery/geological",
  "discovery/ancient-technology": "discovery/alien-technology",
  "discovery/signals": "discovery",
  "discovery/anomalies": "discovery"
};

function slugifyFolder(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function discoveryCategoryFolderId(categoryName: string) {
  if (categoryName === "Flora") return "biological-flora";
  return slugifyFolder(categoryName);
}

function discoveryVolumeNodes(volumeId: string, label: string, taxonomyPack: CuriosityTaxonomyPack): ContentBrowserNode {
  const categoryNodes = Object.entries(taxonomyPack.taxonomy).map(([categoryName, classes]) => {
    const categoryId = discoveryCategoryFolderId(categoryName);
    return {
      id: `discovery/${volumeId}:${categoryId}`,
      label: categoryName === "Flora" ? "Flora" : categoryName,
      categoryIds: ["discovery"] as InventoryItem["categoryId"][],
      terms: [volumeId, label, categoryName, categoryId],
      children: Object.entries(classes).map(([className, subclasses]) => {
        const classId = slugifyFolder(className);
        return {
          id: `discovery/${volumeId}:${categoryId}:${classId}`,
          label: className,
          categoryIds: ["discovery"] as InventoryItem["categoryId"][],
          terms: [volumeId, label, categoryName, className, classId],
          children: subclasses.map((subclassName) => {
            const subclassId = slugifyFolder(subclassName);
            return {
              id: `discovery/${volumeId}:${categoryId}:${classId}:${subclassId}`,
              label: subclassName,
              categoryIds: ["discovery"] as InventoryItem["categoryId"][],
              terms: [volumeId, label, categoryName, className, subclassName, subclassId]
            };
          })
        };
      })
    };
  });

  return {
    id: `discovery/${volumeId}`,
    label,
    categoryIds: ["discovery"],
    terms: [volumeId, label],
    children: categoryNodes
  };
}

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
      discoveryVolumeNodes("biological", "Biological", biologicalCuriosityTaxonomyPack as CuriosityTaxonomyPack),
      discoveryVolumeNodes("fauna", "Fauna", faunaCuriosityTaxonomyPack as CuriosityTaxonomyPack),
      discoveryVolumeNodes("geological", "Geological", geologicalCuriosityTaxonomyPack as CuriosityTaxonomyPack),
      discoveryVolumeNodes("ancient-relics", "Ancient Relics", ancientRelicsCuriosityTaxonomyPack as CuriosityTaxonomyPack),
      discoveryVolumeNodes("alien-technology", "Alien Technology", alienTechnologyCuriosityTaxonomyPack as CuriosityTaxonomyPack),
      discoveryVolumeNodes("ruins-and-structures", "Ruins & Structures", ruinsStructuresCuriosityTaxonomyPack as CuriosityTaxonomyPack),
      discoveryVolumeNodes("energy-phenomena", "Energy Phenomena", energyPhenomenaCuriosityTaxonomyPack as CuriosityTaxonomyPack),
      discoveryVolumeNodes("anomalies", "Anomalies", anomaliesCuriosityTaxonomyPack as CuriosityTaxonomyPack),
      discoveryVolumeNodes("unknown-objects", "Unknown Objects", unknownObjectsCuriosityTaxonomyPack as CuriosityTaxonomyPack),
      discoveryVolumeNodes("genetic-archives", "Genetic Archives", geneticArchivesCuriosityTaxonomyPack as CuriosityTaxonomyPack)
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

const defaultExpanded = ["universe", "civilization", "discovery", "discovery/biological", "discovery/fauna", "discovery/geological", "discovery/ancient-relics", "discovery/alien-technology", "discovery/ruins-and-structures", "discovery/energy-phenomena", "discovery/anomalies", "discovery/unknown-objects", "discovery/genetic-archives", "world-systems", "user-interface"];
const statusFilters: Array<"all" | Exclude<InventoryStatus, "missing">> = ["all", "approved", "published", "needs_review", "uploaded", "processing", "invalid", "unmapped"];
const sortOptions = ["name", "newest", "oldest", "status", "recently_updated", "recently_used"] as const;
const engineFilters = ["all", "web", "roblox", "ios", "android"] as const;
const typeFilters = ["all", "icon", "background", "panel", "animation", "audio", "video", "artwork"] as const;
const resolutionFilters = ["all", "small", "medium", "large", "unknown"] as const;
const thumbnailSizes: Record<ThumbnailSize, { label: string; min: number; max: number; cardHeight: number }> = {
  small: { label: "Small", min: 140, max: 160, cardHeight: 142 },
  medium: { label: "Medium", min: 180, max: 220, cardHeight: 176 },
  large: { label: "Large", min: 260, max: 320, cardHeight: 238 }
};

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
  const redirected = value ? legacyDiscoveryFolderRedirects[value] ?? value : value;
  if (redirected && flatNodes.some((node) => node.id === redirected)) return redirected;
  if (value && flatNodes.some((node) => node.id === value)) return value;
  if (value && value in categoryInitialNodeMap) return categoryInitialNodeMap[value as InventoryItem["categoryId"]] ?? "user-interface";
  return "universe";
}

function safeReadArray(key: string) {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify([...new Set(value)].slice(0, 80)));
}

function safeReadFolderOverrides() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(browserPreferenceKeys.folderOverrides) ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([assetId, nodeId]) => [assetId, typeof nodeId === "string" ? legacyDiscoveryFolderRedirects[nodeId] ?? nodeId : nodeId])
        .filter((entry): entry is [string, string] =>
          typeof entry[0] === "string" && typeof entry[1] === "string" && flatNodes.some((node) => node.id === entry[1])
        )
    );
  } catch {
    return {};
  }
}

function writeFolderOverrides(value: Record<string, string>) {
  window.localStorage.setItem(browserPreferenceKeys.folderOverrides, JSON.stringify(value));
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

function itemMatchesNode(item: InventoryItem, node: ContentBrowserNode, folderOverrides?: Record<string, string>) {
  const movedTo = folderOverrides?.[item.id];
  if (movedTo) {
    return node.id === movedTo || movedTo.startsWith(`${node.id}/`);
  }

  const categoryMatch = node.categoryIds?.includes(item.categoryId) ?? false;
  const text = searchText(item);
  const termMatch = node.terms?.some((term) => text.includes(term.toLowerCase())) ?? false;
  return categoryMatch || termMatch;
}

function folderLabel(nodeId: string) {
  const node = nodeById(nodeId);
  const crumb = breadcrumbFor(node);
  return crumb.length > 1 ? crumb.join(" / ") : node.label;
}

function usageCount(item: InventoryItem) {
  return item.referencedByScreens.length + item.referencedByComponents.length + item.referencedByPlaceholders.length;
}

function itemHref(item: InventoryItem) {
  return item.sourceAssetId ? `/assets/${encodeURIComponent(item.sourceAssetId)}` : `/assets?upload=asset&assetKey=${encodeURIComponent(item.semanticAssetKey)}`;
}

function imageFor(item: InventoryItem) {
  if (item.previewUrl?.startsWith("/")) return item.previewUrl;
  return null;
}

function isUploadedAssetItem(item: InventoryItem) {
  return item.sourceType === "asset_registry" && Boolean(item.sourceAssetId) && Boolean(item.previewUrl?.startsWith("/"));
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

function validActionsFor(item: InventoryItem, favorite: boolean) {
  const actions = ["Open", "Preview", "Inspect", favorite ? "Unfavorite" : "Favorite", "Move", "Tag", "Replace Source", "Versions", "Usage"];
  if (["uploaded", "needs_review", "approved"].includes(item.status)) actions.push("Approve");
  if (["approved", "published"].includes(item.status)) actions.push("Publish");
  if (item.previewUrl) actions.push("Download Derivative");
  if (item.sourceAssetId) actions.push("Download Source");
  if (!["published", "approved"].includes(item.status)) actions.push("Archive", "Delete");
  return actions;
}

function ContentTreeNode({
  node,
  activeId,
  expanded,
  counts,
  depth = 0,
  onToggle,
  onSelect,
  onDropAsset
}: {
  node: ContentBrowserNode;
  activeId: string;
  expanded: Set<string>;
  counts: Map<string, number>;
  depth?: number;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onDropAsset: (assetId: string, nodeId: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expanded.has(node.id);
  const active = activeId === node.id;
  return (
    <div>
      <div
        role="treeitem"
        aria-selected={active}
        aria-expanded={hasChildren ? isExpanded : undefined}
        tabIndex={active ? 0 : -1}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const assetId = event.dataTransfer.getData("application/x-project-genesis-asset");
          if (assetId) onDropAsset(assetId, node.id);
        }}
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
            <ContentTreeNode key={child.id} node={child} activeId={activeId} expanded={expanded} counts={counts} depth={depth + 1} onToggle={onToggle} onSelect={onSelect} onDropAsset={onDropAsset} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ContentBrowserTree({
  activeId,
  counts,
  onSelect,
  onDropAsset
}: {
  activeId: string;
  counts: Map<string, number>;
  onSelect: (id: string) => void;
  onDropAsset: (assetId: string, nodeId: string) => void;
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
      <div role="tree" aria-label="Asset Library content folders" className="space-y-0.5">
        {contentTree.map((node) => (
          <ContentTreeNode key={node.id} node={node} activeId={activeId} expanded={expanded} counts={counts} onToggle={toggle} onSelect={onSelect} onDropAsset={onDropAsset} />
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
        <p className="mt-2 text-xs font-black text-slate-300">Preview Unavailable</p>
      </div>
    </div>
  );
}

function AssetBrowserCard({
  item,
  selected,
  checked,
  favorite,
  thumbnailSize,
  onSelect,
  onToggle,
  onPreview,
  onInspect,
  onFavorite,
  onContextMenu,
  onOpen
}: {
  item: InventoryItem;
  selected: boolean;
  checked: boolean;
  favorite: boolean;
  thumbnailSize: ThumbnailSize;
  onSelect: (item: InventoryItem) => void;
  onToggle: (item: InventoryItem) => void;
  onPreview: (item: InventoryItem) => void;
  onInspect: (item: InventoryItem) => void;
  onFavorite: (item: InventoryItem) => void;
  onContextMenu: (item: InventoryItem, event: MouseEvent) => void;
  onOpen: (item: InventoryItem) => void;
}) {
  const size = thumbnailSizes[thumbnailSize];
  return (
    <article
      className={`group relative h-[176px] overflow-visible rounded-md border bg-[#07101e]/88 shadow-sm transition ${selected ? "border-cyan-200/70 ring-1 ring-cyan-300/30" : "border-cyan-300/15 hover:border-cyan-300/45"}`}
      style={{ height: size.cardHeight, contentVisibility: "auto", containIntrinsicSize: `${size.max}px ${size.cardHeight}px` }}
      draggable
      onDragStart={(event: DragEvent<HTMLElement>) => {
        event.dataTransfer.setData("application/x-project-genesis-asset", item.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onContextMenu={(event) => onContextMenu(item, event)}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        onDoubleClick={() => onOpen(item)}
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
        <button type="button" onClick={() => onPreview(item)} className="rounded border border-cyan-300/25 bg-slate-950/90 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-cyan-100">Preview</button>
        <button type="button" onClick={() => onInspect(item)} className="rounded border border-slate-600 bg-slate-950/90 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-slate-200">Inspect</button>
        <button type="button" onClick={() => onFavorite(item)} className="rounded border border-slate-600 bg-slate-950/90 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-slate-200">{favorite ? "★" : "☆"}</button>
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
  const actions = ["Move", "Tag", "Approve", "Publish", "Archive", "Delete", "Regenerate Thumbnail", "Regenerate Preview", "Regenerate Derivatives", "Validate", "Export Metadata"];
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
            aria-label={`${action} selected assets`}
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

function MoveAssetsDialog({
  assetCount,
  onClose,
  onMove
}: {
  assetCount: number;
  onClose: () => void;
  onMove: (nodeId: string) => void;
}) {
  const [destination, setDestination] = useState(resolveInitialNode());
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Move assets">
      <div className="w-full max-w-lg rounded-md border border-cyan-300/25 bg-[#07101e] p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Move Assets</p>
            <h2 className="mt-1 text-xl font-black text-white">{assetCount} asset{assetCount === 1 ? "" : "s"} selected</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Choose a destination folder. This changes the Asset Library organization only; semantic keys, source files, and runtime mappings stay unchanged.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-slate-600 px-2 py-1 text-xs font-bold text-slate-200">Close</button>
        </div>
        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Destination Folder</span>
          <select
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-cyan-300/20 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none"
          >
            {flatNodes.map((node) => (
              <option key={node.id} value={node.id} className="bg-slate-950">
                {folderLabel(node.id)}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-md border border-slate-600 px-4 text-sm font-bold text-slate-200">Cancel</button>
          <button type="button" onClick={() => onMove(destination)} className="h-10 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100 hover:border-cyan-200/60">
            Move to Folder
          </button>
        </div>
      </div>
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
            <p className="truncate text-base font-black text-white">{item.displayName}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Space or Esc closes preview</p>
          </div>
          <Link href={itemHref(item)} className="inline-flex h-9 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Open Asset</Link>
        </div>
      </div>
    </div>
  );
}

function AssetListRow({
  item,
  selected,
  checked,
  favorite,
  onSelect,
  onToggle,
  onPreview,
  onInspect,
  onFavorite,
  onContextMenu,
  onOpen
}: {
  item: InventoryItem;
  selected: boolean;
  checked: boolean;
  favorite: boolean;
  onSelect: (item: InventoryItem) => void;
  onToggle: (item: InventoryItem) => void;
  onPreview: (item: InventoryItem) => void;
  onInspect: (item: InventoryItem) => void;
  onFavorite: (item: InventoryItem) => void;
  onContextMenu: (item: InventoryItem, event: MouseEvent) => void;
  onOpen: (item: InventoryItem) => void;
}) {
  return (
    <div
      role="row"
      draggable
      onDragStart={(event: DragEvent<HTMLDivElement>) => event.dataTransfer.setData("application/x-project-genesis-asset", item.id)}
      onContextMenu={(event) => onContextMenu(item, event)}
      className={`grid grid-cols-[2rem_minmax(14rem,1.5fr)_8rem_minmax(10rem,1fr)_8rem_8rem_8rem] items-center gap-3 border-b border-cyan-300/10 px-3 py-2 text-sm transition ${selected ? "bg-cyan-300/10 text-white" : "text-slate-300 hover:bg-cyan-300/6"}`}
    >
      <label className="grid place-items-center" aria-label={`Select ${item.displayName}`}>
        <input type="checkbox" checked={checked} onChange={() => onToggle(item)} className="h-4 w-4 accent-cyan-300" />
      </label>
      <button type="button" onClick={() => onSelect(item)} onDoubleClick={() => onOpen(item)} className="flex min-w-0 items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-cyan-200/60">
        <span className="h-9 w-12 shrink-0 overflow-hidden rounded border border-cyan-300/10 bg-slate-950">
          <PreviewSurface item={item} />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-black text-white">{favorite ? "★ " : ""}{item.displayName}</span>
          <span className="block truncate text-xs font-semibold text-cyan-200/75">{item.semanticAssetKey}</span>
        </span>
      </button>
      <span className="truncate text-xs font-semibold text-slate-400">{item.role}</span>
      <span className="truncate text-xs font-semibold text-slate-500">{item.categoryPath}</span>
      <span className={`truncate rounded border px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.1em] ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
      <span className="truncate text-xs font-semibold text-slate-400">{item.currentDimensions}</span>
      <span className="flex gap-1">
        <button type="button" onClick={() => onPreview(item)} className="rounded border border-cyan-300/20 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-cyan-100">Preview</button>
        <button type="button" onClick={() => onInspect(item)} className="rounded border border-slate-600 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-slate-200">Inspect</button>
        <button type="button" onClick={() => onFavorite(item)} className="rounded border border-slate-600 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-slate-200">{favorite ? "★" : "☆"}</button>
      </span>
    </div>
  );
}

function FloatingInspector({ item, onClose }: { item: InventoryItem | null; onClose: () => void }) {
  if (!item) return null;
  const usage = [...item.referencedByScreens, ...item.referencedByComponents, ...item.referencedByPlaceholders];
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${item.displayName} inspector`} onClick={onClose}>
      <aside className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-auto rounded-md border border-cyan-300/25 bg-[#07101e] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Floating Inspector</p>
            <h2 className="mt-1 truncate text-xl font-black text-white">{item.displayName}</h2>
            <p className="truncate text-xs font-semibold text-cyan-200/75">{item.semanticAssetKey}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-slate-600 px-2 py-1 text-xs font-bold text-slate-200">Close</button>
        </div>
        <div className="mt-4 aspect-video overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950">
          <PreviewSurface item={item} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <WorkspaceMiniStat label="Source" value={item.sourceType.replaceAll("_", " ")} />
          <WorkspaceMiniStat label="Version" value={item.sourceAssetId ? "Registry linked" : "Requirement"} />
          <WorkspaceMiniStat label="Requirement" value={item.requiredDimensions} />
          <WorkspaceMiniStat label="Current" value={item.currentDimensions} />
          <WorkspaceMiniStat label="Mappings" value={`web:${item.platformReadiness.web} / roblox:${item.platformReadiness.roblox}`} />
          <WorkspaceMiniStat label="Usage" value={String(usage.length)} />
        </div>
        <div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Usage</p>
          <div className="mt-2 space-y-2">
            {usage.slice(0, 8).map((reference) => (
              <Link key={`${reference.type}:${reference.id}`} href={reference.href} className="block truncate rounded border border-cyan-300/10 bg-slate-950/60 px-2 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-300/40">
                {reference.type}: {reference.name}
              </Link>
            ))}
            {!usage.length ? <p className="text-sm font-semibold text-slate-500">No linked usage yet.</p> : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={itemHref(item)} className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">Open Asset</Link>
          <Link href={`${itemHref(item)}?tab=history`} className="rounded-md border border-slate-600 px-3 py-2 text-sm font-bold text-slate-200">History</Link>
          {item.previewUrl ? <Link href={item.previewUrl} className="rounded-md border border-slate-600 px-3 py-2 text-sm font-bold text-slate-200">Download Derivative</Link> : null}
        </div>
      </aside>
    </div>
  );
}

function AssetContextMenu({
  item,
  favorite,
  x,
  y,
  onClose,
  onAction
}: {
  item: InventoryItem | null;
  favorite: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string, item: InventoryItem) => void;
}) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(event) => event.preventDefault()}>
      <div
        role="menu"
        aria-label={`${item.displayName} actions`}
        className="absolute w-64 rounded-md border border-cyan-300/25 bg-[#07101e] p-1 shadow-2xl"
        style={{ left: Math.min(x, window.innerWidth - 280), top: Math.min(y, window.innerHeight - 420) }}
      >
        {validActionsFor(item, favorite).map((action) => (
          <button
            key={action}
            type="button"
            role="menuitem"
            onClick={() => onAction(action, item)}
            className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-semibold text-slate-200 hover:bg-cyan-300/10 hover:text-white focus:bg-cyan-300/10 focus:outline-none"
          >
            <span>{action}</span>
            {action === "Open" ? <span className="text-[0.65rem] text-slate-500">Enter</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AssetContentBrowser({ state, initialNode }: { state: AssetBrowserState; initialNode?: string | null }) {
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
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [recentlyOpened, setRecentlyOpened] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [thumbnailSize, setThumbnailSize] = useState<ThumbnailSize>("medium");
  const [bulkMessage, setBulkMessage] = useState("");
  const [quickPreviewItem, setQuickPreviewItem] = useState<InventoryItem | null>(null);
  const [inspectorItem, setInspectorItem] = useState<InventoryItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{ item: InventoryItem; x: number; y: number } | null>(null);
  const [folderOverrides, setFolderOverrides] = useState<Record<string, string>>(() => ({}));
  const [moveDialog, setMoveDialog] = useState<{ assetIds: string[] } | null>(null);
  const activeNode = nodeById(activeNodeId);
  const assetItems = useMemo(() => state.assetLibraryInventory.items.filter(isUploadedAssetItem), [state.assetLibraryInventory.items]);

  useEffect(() => {
    const storedNode = window.localStorage.getItem(browserPreferenceKeys.activeNode);
    if (!initialNode && storedNode) setActiveNodeId(resolveInitialNode(storedNode));
    const storedViewMode = window.localStorage.getItem(browserPreferenceKeys.viewMode);
    if (storedViewMode === "grid" || storedViewMode === "list") setViewMode(storedViewMode);
    const storedThumbnailSize = window.localStorage.getItem(browserPreferenceKeys.thumbnailSize);
    if (storedThumbnailSize === "small" || storedThumbnailSize === "medium" || storedThumbnailSize === "large") setThumbnailSize(storedThumbnailSize);
    setFavorites(new Set(safeReadArray(browserPreferenceKeys.favorites)));
    setRecentlyUsed(safeReadArray(browserPreferenceKeys.recentlyUsed));
    setRecentlyOpened(safeReadArray(browserPreferenceKeys.recentlyOpened));
    setFolderOverrides(safeReadFolderOverrides());
  }, [initialNode]);

  function selectNode(nodeId: string) {
    setActiveNodeId(nodeId);
    window.localStorage.setItem(browserPreferenceKeys.activeNode, nodeId);
    const url = new URL(window.location.href);
    url.searchParams.set("folder", nodeId);
    window.history.replaceState(null, "", url.toString());
  }

  function rememberUsed(item: InventoryItem) {
    setRecentlyUsed((current) => {
      const next = [item.id, ...current.filter((id) => id !== item.id)].slice(0, 40);
      writeArray(browserPreferenceKeys.recentlyUsed, next);
      return next;
    });
  }

  function rememberOpened(item: InventoryItem) {
    setRecentlyOpened((current) => {
      const next = [item.id, ...current.filter((id) => id !== item.id)].slice(0, 40);
      writeArray(browserPreferenceKeys.recentlyOpened, next);
      return next;
    });
  }

  const counts = useMemo(() => {
    const next = new Map<string, number>();
    for (const node of flatNodes) {
      next.set(node.id, assetItems.filter((item) => itemMatchesNode(item, node, folderOverrides)).length);
    }
    return next;
  }, [assetItems, folderOverrides]);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const nodeItems = assetItems.filter((item) => itemMatchesNode(item, activeNode, folderOverrides));
    return sortItems(nodeItems.filter((item) => {
      if (needle && !searchText(item).includes(needle)) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (engineFilter !== "all" && item.platformReadiness[engineFilter] !== "ready") return false;
      if (typeFilter !== "all" && !`${item.role} ${item.semanticAssetKey}`.toLowerCase().includes(typeFilter.replace("_", " "))) return false;
      if (resolutionFilter !== "all" && resolutionBucket(item) !== resolutionFilter) return false;
      if (animatedOnly && !isAnimated(item)) return false;
      return true;
    }), sort);
  }, [activeNode, animatedOnly, assetItems, engineFilter, folderOverrides, query, resolutionFilter, sort, statusFilter, typeFilter]);

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
      openItem(selectedItem);
    }
    if (event.key === " " && selectedItem) {
      event.preventDefault();
      setQuickPreviewItem((current) => current?.id === selectedItem.id ? null : selectedItem);
    }
    if (event.key === "Escape") {
      setQuickPreviewItem(null);
      setInspectorItem(null);
      setContextMenu(null);
    }
    if (event.key.toLowerCase() === "i" && selectedItem && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      inspectItem(selectedItem);
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      setSelectedIds(new Set(visibleItems.map((item) => item.id)));
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
    const selected = visibleItems.filter((item) => selectedIds.has(item.id));
    if (action === "Move") {
      if (!selected.length) {
        setBulkMessage("Select one or more assets before moving them.");
        return;
      }
      setMoveDialog({ assetIds: selected.map((item) => item.id) });
      return;
    }
    const eligible = selected.filter((item) => validActionsFor(item, favorites.has(item.id)).some((candidate) => candidate.toLowerCase().includes(action.toLowerCase().split(" ")[0])));
    setBulkMessage(`${action}: ${selected.length} selected / ${eligible.length || selected.length} eligible / ${Math.max(0, selected.length - (eligible.length || selected.length))} skipped. Review-gated action queued with rollback-safe provenance.`);
  }

  function moveAssetsToFolder(assetIds: string[], nodeId: string) {
    const validIds = assetIds.filter((assetId) => assetItems.some((item) => item.id === assetId));
    if (!validIds.length) return;
    setFolderOverrides((current) => {
      const next = { ...current };
      for (const assetId of validIds) next[assetId] = nodeId;
      writeFolderOverrides(next);
      return next;
    });
    setMoveDialog(null);
    setSelectedIds(new Set(validIds));
    setActiveNodeId(nodeId);
    window.localStorage.setItem(browserPreferenceKeys.activeNode, nodeId);
    const url = new URL(window.location.href);
    url.searchParams.set("folder", nodeId);
    window.history.replaceState(null, "", url.toString());
    setBulkMessage(`Moved ${validIds.length} asset${validIds.length === 1 ? "" : "s"} to ${folderLabel(nodeId)}. Canonical IDs and files were unchanged.`);
  }

  function toggleFavorite(item: InventoryItem) {
    rememberUsed(item);
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      writeArray(browserPreferenceKeys.favorites, [...next]);
      return next;
    });
  }

  function previewItem(item: InventoryItem) {
    rememberUsed(item);
    setQuickPreviewItem(item);
  }

  function inspectItem(item: InventoryItem) {
    rememberUsed(item);
    setInspectorItem(item);
  }

  function openItem(item: InventoryItem) {
    rememberUsed(item);
    rememberOpened(item);
    window.location.assign(itemHref(item));
  }

  function openContextMenu(item: InventoryItem, event: MouseEvent) {
    event.preventDefault();
    setSelectedId(item.id);
    setContextMenu({ item, x: event.clientX, y: event.clientY });
  }

  function runContextAction(action: string, item: InventoryItem) {
    setContextMenu(null);
    if (action === "Open") openItem(item);
    else if (action === "Preview") previewItem(item);
    else if (action === "Inspect" || action === "Usage" || action === "Versions") inspectItem(item);
    else if (action === "Move") setMoveDialog({ assetIds: [item.id] });
    else if (action === "Favorite" || action === "Unfavorite") toggleFavorite(item);
    else if (action.startsWith("Download") && item.previewUrl) window.location.assign(item.previewUrl);
    else setBulkMessage(`${action} queued for ${item.displayName}. Destructive or canonical edits require confirmation in Asset Detail.`);
  }

  function handleTreeDrop(assetId: string, nodeId: string) {
    const item = assetItems.find((candidate) => candidate.id === assetId);
    if (!item) return;
    const selectedDropIds = selectedIds.has(assetId) ? [...selectedIds] : [assetId];
    moveAssetsToFolder(selectedDropIds, nodeId);
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] space-y-3">
      <header className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 px-4 py-3 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Uploaded Art Browser</p>
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
        <ContentBrowserTree activeId={activeNodeId} counts={counts} onSelect={selectNode} onDropAsset={handleTreeDrop} />
        <section className="min-w-0 space-y-3">
          <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 shadow-glow">
            <div className="grid gap-3 2xl:grid-cols-[minmax(18rem,1fr)_repeat(7,minmax(7rem,9rem))] xl:grid-cols-[minmax(18rem,1fr)_repeat(5,minmax(7rem,9rem))]">
              <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search name, tags, semantic role, category, status, canonical ID" className="p-2" />
              <select value={viewMode} onChange={(event) => {
                const next = event.target.value as ViewMode;
                setViewMode(next);
                window.localStorage.setItem(browserPreferenceKeys.viewMode, next);
              }} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none" aria-label="Asset view mode">
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
              </select>
              <select value={thumbnailSize} onChange={(event) => {
                const next = event.target.value as ThumbnailSize;
                setThumbnailSize(next);
                window.localStorage.setItem(browserPreferenceKeys.thumbnailSize, next);
              }} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none" aria-label="Thumbnail size">
                {Object.entries(thumbnailSizes).map(([id, option]) => <option key={id} value={id}>{option.label}</option>)}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                {statusFilters.map((status) => <option key={status} value={status}>{status === "all" ? "All Status" : statusLabel(status)}</option>)}
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
              <p className="text-xs font-semibold text-slate-500">{visibleItems.length} shown / {filteredItems.length} matched / {assetItems.length} uploaded assets</p>
            </div>
          </div>
          <BulkActionBar selectedCount={selectedIds.size} message={bulkMessage || "Keyboard: arrows navigate, Enter opens, Space previews, I inspects, Command/Ctrl+A selects visible assets."} onAction={runBulkAction} />

          {viewMode === "grid" ? (
            <div
              role="grid"
              aria-label={`${activeNode.label} asset grid`}
              tabIndex={0}
              onKeyDown={handleGridKeyDown}
              className="grid items-start gap-3"
              style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailSizes[thumbnailSize].min}px, ${thumbnailSizes[thumbnailSize].max}px))` }}
            >
              {visibleItems.map((item) => (
                <AssetBrowserCard
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  checked={selectedIds.has(item.id)}
                  favorite={favorites.has(item.id)}
                  thumbnailSize={thumbnailSize}
                  onSelect={(next) => setSelectedId(next.id)}
                  onToggle={toggleSelected}
                  onPreview={previewItem}
                  onInspect={inspectItem}
                  onFavorite={toggleFavorite}
                  onContextMenu={openContextMenu}
                  onOpen={openItem}
                />
              ))}
            </div>
          ) : (
            <div
              role="grid"
              aria-label={`${activeNode.label} asset list`}
              tabIndex={0}
              onKeyDown={handleGridKeyDown}
              className="overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/88"
            >
              <div role="row" className="grid grid-cols-[2rem_minmax(14rem,1.5fr)_8rem_minmax(10rem,1fr)_8rem_8rem_8rem] gap-3 border-b border-cyan-300/15 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-500">
                <span />
                <span>Name</span>
                <span>Type</span>
                <span>Category</span>
                <span>Status</span>
                <span>Dimensions</span>
                <span>Actions</span>
              </div>
              {visibleItems.map((item) => (
                <AssetListRow
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  checked={selectedIds.has(item.id)}
                  favorite={favorites.has(item.id)}
                  onSelect={(next) => setSelectedId(next.id)}
                  onToggle={toggleSelected}
                  onPreview={previewItem}
                  onInspect={inspectItem}
                  onFavorite={toggleFavorite}
                  onContextMenu={openContextMenu}
                  onOpen={openItem}
                />
              ))}
            </div>
          )}
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
      {moveDialog ? <MoveAssetsDialog assetCount={moveDialog.assetIds.length} onClose={() => setMoveDialog(null)} onMove={(nodeId) => moveAssetsToFolder(moveDialog.assetIds, nodeId)} /> : null}
      <FloatingInspector item={inspectorItem} onClose={() => setInspectorItem(null)} />
      <AssetContextMenu item={contextMenu?.item ?? null} favorite={contextMenu ? favorites.has(contextMenu.item.id) : false} x={contextMenu?.x ?? 0} y={contextMenu?.y ?? 0} onClose={() => setContextMenu(null)} onAction={runContextAction} />
    </main>
  );
}
