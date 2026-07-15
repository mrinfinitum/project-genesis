"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  BookOpen,
  Building2,
  ChevronRight,
  CircleDot,
  Clapperboard,
  FileImage,
  ImageIcon,
  Landmark,
  Loader,
  LogIn,
  Map as MapIcon,
  MonitorCog,
  Music,
  PackageCheck,
  Palette,
  Search,
  Settings,
  Sparkles,
  UploadCloud,
  WandSparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cardShellClass, previewBoxClass, useWorkspaceDensitySettings, type DensitySettings } from "@/components/ui/density";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceSearchBar, WorkspaceStatTile, workspaceBadgeClass } from "@/components/ui/workspace";
import type { AssetProductionState } from "@/lib/assets/asset-production";
import type { AssetLibraryCategoryId } from "@/lib/assets/asset-library-routing";
import {
  resolveAssetClass,
  resolveProductionClasses,
  resolveProductionClassSummaries,
  resolveProductionItemsForClass,
  type ProductionClassSummary
} from "@/lib/assets/production-classification";
import { cn } from "@/lib/utils";
import type { GameData } from "@/types/schema";

type InventoryItem = AssetProductionState["assetLibraryInventory"]["items"][number];
type InventoryStatus = InventoryItem["status"];
type CreativeCardType = "icon" | "landscape" | "portrait" | "banner" | "panel" | "button" | "audio" | "video" | "requirement" | "group_summary";
type ProductionAreaId =
  | "overview"
  | "top-hud"
  | "left-navigation"
  | "research"
  | "buildings"
  | "upgrades"
  | "ai-agents"
  | "discovery"
  | "encyclopedia"
  | "civilizations"
  | "galaxy"
  | "planets"
  | "settings"
  | "login-account"
  | "loading"
  | "icons"
  | "backgrounds"
  | "animations"
  | "audio"
  | "video";

type ProductionArea = {
  id: ProductionAreaId;
  label: string;
  shortLabel?: string;
  categoryIds?: AssetLibraryCategoryId[];
  icon: LucideIcon;
  accent: string;
  screenSpecHref?: string;
  advancedHref?: string;
  description: string;
  groups?: string[];
  matcher?: (item: InventoryItem) => boolean;
};

const statusCredit: Record<InventoryStatus, number> = {
  published: 1,
  approved: 0.9,
  needs_review: 0.55,
  uploaded: 0.45,
  processing: 0.35,
  missing: 0,
  invalid: 0,
  deprecated: 0,
  unmapped: 0.2
};

const productionAreas: ProductionArea[] = [
  { id: "top-hud", label: "Top HUD", categoryIds: ["top-hud"], icon: MonitorCog, accent: "from-cyan-300/25 to-emerald-300/10", screenSpecHref: "/component-library/TopHudBar", description: "Panel background, fixed economy slots, identity frame, utility controls, and shell usage.", groups: ["Panel Background", "Civilization Identity", "Labor", "Credits", "Population", "Research", "Premium Crystal", "Calendar", "Trophy", "Settings"] },
  { id: "left-navigation", label: "Left Navigation", categoryIds: ["left-navigation"], icon: MapIcon, accent: "from-sky-300/25 to-cyan-300/10", screenSpecHref: "/component-library/SideNavigationRail", description: "Navigation rail background, icons, active states, locked states, and route usage.", groups: ["Rail Background", "Navigation Icons", "Active State", "Locked State", "Collapse Control"] },
  { id: "research", label: "Research", categoryIds: ["research-ui"], icon: Sparkles, accent: "from-violet-300/25 to-cyan-300/10", screenSpecHref: "/screen-designer/research", advancedHref: "/research", description: "Research screen shell, branch sidebar, icons, tree background, nodes, states, buttons, and timeline.", groups: ["Screen Shell", "Branch Sidebar", "Branch Icons", "Tree Background", "Research Nodes", "Connection States", "Detail Panel", "Benefits", "Unlocks", "Requirements", "Buttons", "Era Timeline"] },
  { id: "buildings", label: "Buildings", categoryIds: ["buildings-ui"], icon: Building2, accent: "from-amber-300/25 to-cyan-300/10", screenSpecHref: "/screen-designer/buildings", advancedHref: "/buildings", description: "Workspace background, category tabs, building cards, icons, cost rows, requirements, and construction states.", groups: ["Workspace Background", "Header", "Category Tabs", "Building Cards", "Building Icons", "Building Details", "Cost Rows", "Requirements", "Build Buttons", "Locked States"] },
  { id: "upgrades", label: "Upgrades", categoryIds: ["upgrade-categories"], icon: WandSparkles, accent: "from-fuchsia-300/25 to-cyan-300/10", screenSpecHref: "/screen-designer/upgrades", advancedHref: "/upgrades", description: "Upgrade icons, card states, category panels, shared fallback background, and dedicated category background workflow.", groups: ["Workforce Background", "Industry Background", "Science Background", "Technology Background", "Shared Fallback", "Cards", "Buttons", "Upgrade Icons"] },
  { id: "ai-agents", label: "AI Agents", categoryIds: ["ai-agents"], icon: Bot, accent: "from-emerald-300/25 to-cyan-300/10", advancedHref: "/ai-agents", description: "Agent heads, open eyes, blink, offline, working, thinking, warning, celebration, accessories, and personality badges.", groups: ["Agent", "Variant", "Open Eyes", "Blink", "Offline", "Working", "Thinking", "Warning", "Celebration", "Accessories", "Personality Badges"] },
  { id: "discovery", label: "Discovery", categoryIds: ["discovery"], icon: Search, accent: "from-indigo-300/25 to-cyan-300/10", advancedHref: "/discovery", description: "Artifacts, lifeforms, alien technology, signals, anomalies, rare matter, ruins, scan art, and collectible discovery production.", groups: ["Artifacts", "Lifeforms", "Alien Technology", "Signals", "Anomalies", "Rare Matter", "Ruins"] },
  { id: "encyclopedia", label: "Encyclopedia", categoryIds: ["encyclopedia"], icon: BookOpen, accent: "from-cyan-300/20 to-violet-300/10", advancedHref: "/encyclopedia", description: "Entry icons, cards, hero art, diagrams, progression art, and Galactopedia-ready visual requirements.", groups: ["Buildings", "Research", "Resources", "Planets", "Civilizations", "Factions", "Wonders", "Megastructures"] },
  { id: "civilizations", label: "Civilizations", icon: Landmark, accent: "from-yellow-300/20 to-cyan-300/10", advancedHref: "/civilizations", description: "Civilization command art, era identity, crests, timeline nodes, and command-center presentation.", matcher: (item) => /civilization|era|timeline|command/i.test(searchText(item)) },
  { id: "galaxy", label: "Galaxy", categoryIds: ["galaxy-ui"], icon: MapIcon, accent: "from-blue-300/25 to-cyan-300/10", advancedHref: "/galaxy", description: "Galaxy cards, map states, spaceport art, scanning visuals, and universe navigation." },
  { id: "planets", label: "Planets", categoryIds: ["planet-ui"], icon: CircleDot, accent: "from-lime-300/20 to-cyan-300/10", advancedHref: "/planets", description: "Planet cards, planet details, Sol body art, celestial bodies, biome visuals, and scan states." },
  { id: "settings", label: "Settings", categoryIds: ["settings-ui"], icon: Settings, accent: "from-slate-300/20 to-cyan-300/10", advancedHref: "/settings", description: "Settings panels, account controls, sliders, toggles, cloud save status, and modal states." },
  { id: "login-account", label: "Login & Account", categoryIds: ["login-ui"], icon: LogIn, accent: "from-rose-300/20 to-cyan-300/10", advancedHref: "/login", description: "Login, account, password reset, MFA, onboarding, and authentication presentation." },
  { id: "loading", label: "Loading", categoryIds: ["loading-ui"], icon: Loader, accent: "from-indigo-300/25 to-cyan-300/10", description: "Launch, loading, splash, wordmark, and transition artwork." },
  { id: "icons", label: "Icons", categoryIds: ["icons"], icon: PackageCheck, accent: "from-teal-300/25 to-cyan-300/10", description: "General UI icons, economy icons, navigation icons, category icons, and small-state artwork." },
  { id: "backgrounds", label: "Backgrounds", categoryIds: ["backgrounds"], icon: ImageIcon, accent: "from-cyan-300/20 to-blue-300/10", description: "Workspace backgrounds, panel art, hero art, app-shell backgrounds, and category panels." },
  { id: "animations", label: "Animations", categoryIds: ["animations"], icon: Clapperboard, accent: "from-orange-300/20 to-cyan-300/10", description: "Blink loops, idle loops, screen motion previews, and state animation references." },
  { id: "audio", label: "Audio", categoryIds: ["audio"], icon: Music, accent: "from-pink-300/20 to-cyan-300/10", description: "Audio, sound effects, UI feedback, ambient tracks, and future voice assets." },
  { id: "video", label: "Video", categoryIds: ["video"], icon: FileImage, accent: "from-purple-300/20 to-cyan-300/10", description: "Video, cinematics, motion references, loading loops, and future trailer assets." }
];

const areaById = Object.fromEntries(productionAreas.map((area) => [area.id, area])) as Record<Exclude<ProductionAreaId, "overview">, ProductionArea>;
const filterTabs = ["all", "missing", "uploaded", "needs_review", "approved", "published", "invalid", "unmapped"] as const;
const defaultCreativeDisplaySettings: Partial<DensitySettings> = { density: "compact", previewSize: "small", columns: "auto", filter: "all", groupBy: "none", sort: "priority" };
const featureCardAreaIds = new Set<ProductionAreaId>(["upgrades", "research", "buildings", "top-hud", "left-navigation"]);

function searchText(item: InventoryItem) {
  return [
    item.displayName,
    item.semanticAssetKey,
    item.role,
    item.status,
    item.categoryPath,
    item.referencedByScreens.map((reference) => reference.name).join(" "),
    item.referencedByComponents.map((reference) => reference.name).join(" "),
    item.referencedByPlaceholders.map((reference) => reference.name).join(" "),
    Object.entries(item.platformReadiness).map(([platform, status]) => `${platform}:${status}`).join(" ")
  ].join(" ");
}

function areaItems(state: AssetProductionState, area: ProductionArea) {
  const categoryIds = new Set(area.categoryIds ?? []);
  return state.assetLibraryInventory.items.filter((item) => {
    const inCategory = categoryIds.has(item.categoryId);
    const custom = area.matcher?.(item) ?? false;
    if (area.id === "upgrades") {
      return inCategory || /upgrade_panel_.*_background|upgrade category|shared fallback/i.test(searchText(item));
    }
    return inCategory || custom;
  });
}

function priorityFor(item: InventoryItem): "P0" | "P1" | "P2" | "P3" {
  const text = searchText(item).toLowerCase();
  if (item.status === "invalid" || (/top hud|left navigation|dashboard|app shell/.test(text) && item.status === "missing")) return "P0";
  if (item.referencedByScreens.length || item.referencedByComponents.length) return "P1";
  if (item.status === "missing") return "P2";
  return "P3";
}

function priorityRank(item: InventoryItem) {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[priorityFor(item)];
}

function usageCount(item: InventoryItem) {
  return item.referencedByScreens.length + item.referencedByComponents.length + item.referencedByPlaceholders.length;
}

function resolveCreativeAssetPresentation(item: InventoryItem): {
  preferredCardType: CreativeCardType;
  preferredAspectRatio: string;
  previewFit: "cover" | "contain";
  minimumWidth: number;
  maximumWidth: number;
  defaultSpan: string;
} {
  const text = `${item.semanticAssetKey} ${item.displayName} ${item.role} ${item.requiredDimensions}`.toLowerCase();
  if (/audio|sound|music|voice/.test(text)) return { preferredCardType: "audio", preferredAspectRatio: "16 / 5", previewFit: "contain", minimumWidth: 260, maximumWidth: 520, defaultSpan: "md:col-span-2" };
  if (/video|cinematic|movie/.test(text)) return { preferredCardType: "video", preferredAspectRatio: "16 / 9", previewFit: "cover", minimumWidth: 280, maximumWidth: 640, defaultSpan: "md:col-span-2" };
  if (/portrait|agent|avatar|character/.test(text)) return { preferredCardType: "portrait", preferredAspectRatio: "3 / 4", previewFit: "contain", minimumWidth: 180, maximumWidth: 300, defaultSpan: "" };
  if (/banner|top[_ -]?bar|rail|strip/.test(text)) return { preferredCardType: "banner", preferredAspectRatio: "21 / 6", previewFit: "cover", minimumWidth: 280, maximumWidth: 720, defaultSpan: "md:col-span-2" };
  if (/background|hero|workspace|screen/.test(text)) return { preferredCardType: "landscape", preferredAspectRatio: "16 / 9", previewFit: "cover", minimumWidth: 260, maximumWidth: 640, defaultSpan: "md:col-span-2" };
  if (/button|tab|toggle|control/.test(text)) return { preferredCardType: "button", preferredAspectRatio: "5 / 2", previewFit: "contain", minimumWidth: 220, maximumWidth: 420, defaultSpan: "" };
  if (/panel|card|frame|drawer|modal/.test(text)) return { preferredCardType: "panel", preferredAspectRatio: "4 / 3", previewFit: "cover", minimumWidth: 220, maximumWidth: 460, defaultSpan: "" };
  if (/icon|crystal|credits|population|research|labor|calendar|settings|trophy/.test(text)) return { preferredCardType: "icon", preferredAspectRatio: "1 / 1", previewFit: "contain", minimumWidth: 160, maximumWidth: 260, defaultSpan: "" };
  return { preferredCardType: "requirement", preferredAspectRatio: "4 / 3", previewFit: "cover", minimumWidth: 220, maximumWidth: 420, defaultSpan: "" };
}

function roleAwareAssetGridClass(settings: DensitySettings) {
  if (settings.density === "list") return "grid gap-2";
  if (settings.density === "large") return "grid auto-rows-fr gap-4 md:grid-cols-2 2xl:grid-cols-3";
  if (settings.density === "medium") return "grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";
  return "grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5";
}

function cardPreviewHeight(item: InventoryItem, settings: DensitySettings) {
  const presentation = resolveCreativeAssetPresentation(item);
  if (settings.previewSize === "hide") return "hidden";
  if (settings.density === "list") return previewBoxClass(settings);
  if (settings.previewSize === "large") return presentation.preferredCardType === "icon" ? "h-36" : "h-48";
  if (settings.previewSize === "medium") return presentation.preferredCardType === "icon" ? "h-28" : "h-36";
  if (presentation.preferredCardType === "banner" || presentation.preferredCardType === "button") return "h-20";
  if (presentation.preferredCardType === "icon") return "h-24";
  return "h-28";
}

function readinessFor(items: InventoryItem[]) {
  if (!items.length) return 0;
  const score = items.reduce((sum, item) => sum + (statusCredit[item.status] ?? 0), 0);
  return Math.round((score / items.length) * 100);
}

function areaSummary(state: AssetProductionState, area: ProductionArea) {
  const items = areaItems(state, area);
  const missing = items.filter((item) => item.status === "missing").length;
  const needsReview = items.filter((item) => item.status === "needs_review").length;
  const invalid = items.filter((item) => item.status === "invalid").length;
  const published = items.filter((item) => item.status === "published").length;
  const uploaded = items.filter((item) => item.status === "uploaded" || item.status === "processing").length;
  const approved = items.filter((item) => item.status === "approved").length;
  const blocker = [...items]
    .filter((item) => ["missing", "invalid", "needs_review", "unmapped"].includes(item.status))
    .sort((left, right) => priorityRank(left) - priorityRank(right) || usageCount(right) - usageCount(left) || left.displayName.localeCompare(right.displayName))[0];
  return {
    items,
    readiness: readinessFor(items),
    missing,
    needsReview,
    invalid,
    published,
    uploaded,
    approved,
    unmapped: items.filter((item) => item.status === "unmapped").length,
    blocker
  };
}

function screenSpecLabel(area: ProductionArea) {
  if (area.screenSpecHref?.startsWith("/component-library")) return "Component Contract";
  return "Screen Specification";
}

function handoffHref(area: ProductionArea, target: "game" | "roblox" | "mobile") {
  const params = new URLSearchParams({ target, area: area.id });
  return `/codex-handoffs?${params.toString()}`;
}

function uploadHref(item?: InventoryItem, area?: ProductionArea, productionClassId?: string, assetRole?: string) {
  const params = new URLSearchParams({ upload: "asset" });
  if (area) params.set("category", area.label);
  if (productionClassId && productionClassId !== "all") params.set("class", productionClassId);
  if (assetRole && assetRole !== "All") params.set("role", assetRole);
  if (item) {
    params.set("assetKey", item.semanticAssetKey);
    params.set("name", item.displayName);
    params.set("role", assetRole ?? item.role);
    params.set("requiredDimensions", item.requiredDimensions);
    if (item.requirementId) params.set("requirement", item.requirementId);
  }
  return `/asset-library?${params.toString()}`;
}

function statusSort(items: InventoryItem[]) {
  return [...items].sort((left, right) => priorityRank(left) - priorityRank(right) || statusCredit[left.status] - statusCredit[right.status] || usageCount(right) - usageCount(left) || left.displayName.localeCompare(right.displayName));
}

function productionSort(items: InventoryItem[], settings: DensitySettings, areaId: ProductionAreaId, studioData: GameData) {
  const statusRank: Record<InventoryStatus, number> = {
    invalid: 0,
    missing: 1,
    needs_review: 2,
    uploaded: 3,
    processing: 4,
    approved: 5,
    unmapped: 6,
    published: 7,
    deprecated: 8
  };
  const classOrder = new Map(resolveProductionClasses(areaId, studioData).map((item) => [item.classId, item.displayOrder]));
  return [...items].sort((left, right) => {
    if (settings.sort === "name") return left.displayName.localeCompare(right.displayName);
    if (settings.sort === "status") return (statusRank[left.status] ?? 9) - (statusRank[right.status] ?? 9) || left.displayName.localeCompare(right.displayName);
    if (settings.sort === "usage") return usageCount(right) - usageCount(left) || left.displayName.localeCompare(right.displayName);
    if (settings.sort === "class") {
      const leftClass = resolveAssetClass(left, areaId, studioData).classId;
      const rightClass = resolveAssetClass(right, areaId, studioData).classId;
      return (classOrder.get(leftClass) ?? 999) - (classOrder.get(rightClass) ?? 999) || left.displayName.localeCompare(right.displayName);
    }
    return priorityRank(left) - priorityRank(right) || (statusRank[left.status] ?? 9) - (statusRank[right.status] ?? 9) || usageCount(right) - usageCount(left) || left.displayName.localeCompare(right.displayName);
  });
}

function PlaceholderPreview({ item, area }: { item?: InventoryItem; area?: ProductionArea }) {
  return (
    <div className={`grid h-full place-items-center bg-gradient-to-br ${area?.accent ?? "from-cyan-300/15 to-slate-950"} px-3 text-center`}>
      <div>
        <ImageIcon className="mx-auto h-5 w-5 text-cyan-100/70" />
        <p className="mt-2 line-clamp-2 text-xs font-black text-white">{item?.displayName ?? area?.label ?? "Preview"}</p>
        <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-cyan-100/60">{item ? priorityFor(item) : "Area"}</p>
      </div>
    </div>
  );
}

function SafePreviewImage({ src, item, area }: { src?: string | null; item?: InventoryItem; area?: ProductionArea }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) return <PlaceholderPreview item={item} area={area} />;
  const fit = item ? resolveCreativeAssetPresentation(item).previewFit : "cover";
  return <img src={src} alt="" onError={() => setFailed(true)} className={`h-full w-full rounded-md ${fit === "contain" ? "object-contain p-3" : "object-cover"}`} />;
}

function QuickAssetPreview({ item, area }: { item: InventoryItem; area: ProductionArea }) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-40 hidden w-80 translate-x-5 rounded-md border border-cyan-300/30 bg-slate-950/95 p-3 shadow-2xl group-hover:block group-focus-within:block">
      <div className="h-48 overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/70">
        <SafePreviewImage src={item.previewUrl} item={item} area={area} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{item.displayName}</p>
          <p className="mt-1 truncate text-xs font-semibold text-cyan-200">{item.semanticAssetKey}</p>
        </div>
        <WorkspaceBadge value={item.status} className="shrink-0 text-[0.56rem]" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <WorkspaceMiniStat label="Dimensions" value={item.currentDimensions || item.requiredDimensions} />
        <WorkspaceMiniStat label="Usage" value={usageCount(item)} />
      </div>
    </div>
  );
}

function ViewOptionsButton({ settings, onSettingsChange }: { settings: DensitySettings; onSettingsChange: (patch: Partial<DensitySettings>) => void }) {
  const [open, setOpen] = useState(false);
  const selectClass = "h-9 rounded-md border border-cyan-300/15 bg-slate-950/80 px-2 text-xs font-bold text-white outline-none";
  const reset = () => onSettingsChange(defaultCreativeDisplaySettings);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="relative rounded-md border border-cyan-300/15 bg-slate-950/45"
    >
      <summary aria-expanded={open} className="cursor-pointer px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">View Options</summary>
      <div className="absolute right-0 top-11 z-30 grid w-[min(34rem,calc(100vw-2rem))] gap-3 rounded-md border border-cyan-300/20 bg-slate-950/95 p-3 shadow-2xl sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">
          View mode
          <select value={settings.density} onChange={(event) => onSettingsChange({ density: event.target.value as DensitySettings["density"] })} className={selectClass}>
            <option value="compact">Compact</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="list">List</option>
          </select>
        </label>
        <label className="grid gap-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">
          Preview size
          <select value={settings.previewSize} onChange={(event) => onSettingsChange({ previewSize: event.target.value as DensitySettings["previewSize"] })} className={selectClass}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="hide">Hide</option>
          </select>
        </label>
        <label className="grid gap-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">
          Columns
          <select value={settings.columns} onChange={(event) => onSettingsChange({ columns: event.target.value as DensitySettings["columns"] })} className={selectClass}>
            <option value="auto">Auto</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </label>
        <label className="grid gap-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">
          Sort
          <select value={settings.sort} onChange={(event) => onSettingsChange({ sort: event.target.value })} className={selectClass}>
            <option value="priority">Production Priority</option>
            <option value="missing">Missing First</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="usage">Usage</option>
            <option value="class">Class Order</option>
          </select>
        </label>
        <label className="grid gap-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">
          Filter
          <select value={settings.filter} onChange={(event) => onSettingsChange({ filter: event.target.value })} className={selectClass}>
            <option value="all">All</option>
            <option value="with-preview">With preview</option>
            <option value="without-preview">Without preview</option>
          </select>
        </label>
        <label className="grid gap-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">
          Group
          <select value={settings.groupBy} onChange={(event) => onSettingsChange({ groupBy: event.target.value })} className={selectClass}>
            <option value="none">None</option>
            <option value="feature">Feature</option>
            <option value="status">Status</option>
            <option value="role">Role</option>
          </select>
        </label>
        <button type="button" onClick={reset} className="sm:col-span-2 lg:col-span-3 h-9 rounded-md border border-slate-600 bg-slate-950/70 px-3 text-xs font-black uppercase tracking-[0.14em] text-slate-200 hover:border-cyan-300/40">Reset display settings</button>
      </div>
    </details>
  );
}

function AreaCard({ area, summary, onOpen }: { area: ProductionArea; summary: ReturnType<typeof areaSummary>; onOpen: (areaId: ProductionAreaId) => void }) {
  const Icon = area.icon;
  return (
    <button
      type="button"
      onClick={() => onOpen(area.id)}
      className="group block rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 text-left shadow-glow outline-none transition hover:border-cyan-300/45 hover:bg-[#0a1728] focus-visible:border-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300/35"
    >
      <div className={`relative h-20 overflow-hidden rounded-md border border-cyan-300/10 bg-gradient-to-br ${area.accent}`}>
        {summary.blocker?.previewUrl ? <SafePreviewImage src={summary.blocker.previewUrl} item={summary.blocker} area={area} /> : <PlaceholderPreview area={area} />}
        <div className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-md border border-cyan-200/20 bg-slate-950/60">
          <Icon className="h-5 w-5 text-cyan-100" />
        </div>
        <span className="absolute right-3 top-3 rounded-md border border-cyan-200/20 bg-slate-950/75 px-2 py-1 text-xs font-black text-cyan-100">{summary.readiness}%</span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-white">{area.label}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{area.description}</p>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <div className="mt-3">
        <WorkspaceProgressBar value={summary.readiness} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <WorkspaceMiniStat label="Published" value={summary.published} />
        <WorkspaceMiniStat label="Missing" value={summary.missing} />
        <WorkspaceMiniStat label="Review" value={summary.needsReview} />
      </div>
      <div className="mt-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-2">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-slate-500">Top Blocker</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-100">{summary.blocker?.displayName ?? "No blocker"}</p>
      </div>
    </button>
  );
}

function ProductionItemCard({ item, settings, area }: { item: InventoryItem; settings: DensitySettings; area: ProductionArea }) {
  const count = usageCount(item);
  const preview = item.previewUrl;
  const linkedHref = item.sourceAssetId ? `/assets/${encodeURIComponent(item.sourceAssetId)}` : uploadHref(item, area);
  const presentation = resolveCreativeAssetPresentation(item);
  const usefulFact = item.status === "missing" ? item.requiredDimensions : item.status === "needs_review" || item.status === "uploaded" ? item.currentDimensions : `${count} use${count === 1 ? "" : "s"}`;
  if (settings.density === "list") {
    return (
      <Link href={linkedHref} className={`${cardShellClass(settings)} group relative outline-none transition hover:border-cyan-300/45 hover:bg-[#0a1728] focus-visible:border-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300/35`}>
        <QuickAssetPreview item={item} area={area} />
        <div className={previewBoxClass(settings)}><SafePreviewImage src={preview} item={item} area={area} /></div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{item.displayName}</p>
          <p className="truncate text-xs text-cyan-200">{item.semanticAssetKey}</p>
        </div>
        <span className={cn("rounded-md border px-2 py-1 text-xs font-black uppercase tracking-[0.12em]", workspaceBadgeClass(item.status))}>{item.status.replaceAll("_", " ")}</span>
        <p className="truncate text-xs text-slate-400">{priorityFor(item)}</p>
        <p className="truncate text-xs text-slate-300">{count} usage</p>
        <ChevronRight className="h-4 w-4 text-cyan-200 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </Link>
    );
  }
  return (
    <Link href={linkedHref} className={`${cardShellClass(settings)} ${presentation.defaultSpan} group relative block outline-none transition hover:border-cyan-300/45 hover:bg-[#0a1728] focus-visible:border-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300/35`}>
      <QuickAssetPreview item={item} area={area} />
      <div className={`${cardPreviewHeight(item, settings)} overflow-hidden rounded-md border border-cyan-300/10 bg-slate-950/60`}>
        <SafePreviewImage src={preview} item={item} area={area} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{item.displayName}</p>
          <p className="mt-1 truncate text-xs text-slate-400">{usefulFact}</p>
        </div>
        <WorkspaceBadge value={item.status} className="shrink-0 text-[0.58rem]" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs font-bold text-cyan-100">
        <span>{item.sourceAssetId ? "Inspect asset" : "Upload asset"}</span>
        <ChevronRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
    </Link>
  );
}

function UpgradeCategoryStatus({ state }: { state: AssetProductionState }) {
  const records = state.upgradeCategoryAssets;
  return (
    <WorkspacePanel title="Upgrade Category Workflow" icon={WandSparkles}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {records.map((record) => (
          <div key={record.categoryId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <p className="text-sm font-black text-white">{record.displayName}</p>
            <p className="mt-1 truncate text-xs text-cyan-200">{record.semanticAssetKey}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <WorkspaceBadge value={record.sourceFile ? "source uploaded" : "source needed"} />
              <WorkspaceBadge value={record.status} />
            </div>
          </div>
        ))}
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
          <p className="text-sm font-black text-white">Shared Fallback</p>
          <p className="mt-1 text-xs text-cyan-200">upgrade_panel_shared_background</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <WorkspaceBadge value="tracked in backgrounds" />
          </div>
        </div>
      </div>
    </WorkspacePanel>
  );
}

function FeatureSummaryCard({ summary, area, onOpen }: { summary: ProductionClassSummary<InventoryItem>; area: ProductionArea; onOpen: (classId: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(summary.classId)}
      className="group block rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 text-left shadow-glow outline-none transition hover:border-cyan-300/45 hover:bg-[#0a1728] focus-visible:border-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300/35"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-cyan-200">{area.label}</p>
          <h3 className="mt-2 truncate text-xl font-black text-white">{summary.displayName}</h3>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <WorkspaceMiniStat label="Assets" value={summary.itemCount} />
        <WorkspaceMiniStat label="Missing" value={summary.missingCount} />
        <WorkspaceMiniStat label="Published" value={summary.publishedCount} />
        <WorkspaceMiniStat label="Review" value={summary.needsReviewCount} />
      </div>
      <div className="mt-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-2">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-slate-500">Top Blocker</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-100">{summary.topBlocker?.displayName ?? "No blocker"}</p>
      </div>
    </button>
  );
}

function AreaDetail({ state, studioData, area, initialClassId, onBack }: { state: AssetProductionState; studioData: GameData; area: ProductionArea; initialClassId: string | null; onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof filterTabs)[number]>("all");
  const [selectedClassId, setSelectedClassId] = useState(initialClassId ?? "all");
  const [selectedRole, setSelectedRole] = useState("All");
  const [settings, setSettings] = useWorkspaceDensitySettings(`project-genesis-density-creative-production-${area.id}`, defaultCreativeDisplaySettings);
  const summary = areaSummary(state, area);
  const classes = useMemo(() => resolveProductionClasses(area.id, studioData), [area.id, studioData]);
  const classSummaries = useMemo(() => resolveProductionClassSummaries(summary.items, area.id, studioData), [summary.items, area.id, studioData]);
  const currentClass = classes.find((item) => item.classId === selectedClassId);
  const hasFeatureCards = featureCardAreaIds.has(area.id) && classes.length > 0;
  const roleOptions = useMemo(() => {
    const baseItems = resolveProductionItemsForClass(summary.items, area.id, selectedClassId, studioData);
    return ["All", ...Array.from(new Set(baseItems.map((item) => resolveAssetClass(item, area.id, studioData).assetRole))).sort()];
  }, [summary.items, area.id, selectedClassId, studioData]);
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const classItems = resolveProductionItemsForClass(summary.items, area.id, selectedClassId, studioData);
    return productionSort(classItems, settings, area.id, studioData).filter((item) => {
      const text = searchText(item).toLowerCase();
      const displayFilterMatches = settings.filter === "without-preview" ? !item.previewUrl : settings.filter === "with-preview" ? Boolean(item.previewUrl) : true;
      const roleMatches = selectedRole === "All" || resolveAssetClass(item, area.id, studioData).assetRole === selectedRole;
      return roleMatches && displayFilterMatches && (status === "all" || item.status === status) && (!needle || text.includes(needle));
    });
  }, [summary.items, area.id, selectedClassId, selectedRole, studioData, settings, query, status]);

  useEffect(() => {
    const requestedClass = initialClassId ?? "all";
    const validClass = requestedClass === "all" || classes.some((item) => item.classId === requestedClass) ? requestedClass : "all";
    setSelectedClassId(validClass);
    setSelectedRole("All");
  }, [area.id, initialClassId, classes]);

  function selectClass(classId: string) {
    setSelectedClassId(classId);
    setSelectedRole("All");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("area", area.id);
      if (classId === "all") params.delete("class");
      else params.set("class", classId);
      window.history.replaceState(null, "", `/creative-production?${params.toString()}`);
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.debug("[creative-production-display]", {
      pageType: "primary_creative_area",
      selectedProductionArea: area.id,
      selectedClassId,
      resolvedCardPresentation: items.slice(0, 5).map((item) => ({ id: item.id, role: item.role, ...resolveCreativeAssetPresentation(item) })),
      activeHiddenDisplayPreferences: settings,
      viewOptionsState: "closed_by_default",
      featureGroupingStatus: hasFeatureCards ? "card_navigation" : "not_configured"
    });
  }, [area.id, selectedClassId, items, settings, hasFeatureCards]);

  return (
    <div className="space-y-5">
      <WorkspacePanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button type="button" onClick={onBack} className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Creative Production</button>
            <h2 className="mt-2 text-3xl font-black text-white">{area.label}{selectedClassId !== "all" && currentClass ? ` / ${currentClass.displayName}` : ""} Production</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{area.description}</p>
          </div>
          <div className="min-w-48">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Readiness</p>
            <p className="mt-1 text-3xl font-black text-white">{summary.readiness}%</p>
            <WorkspaceProgressBar value={summary.readiness} className="mt-2" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <WorkspaceStatTile label="Published" value={summary.published} />
          <WorkspaceStatTile label="Missing" value={summary.missing} />
          <WorkspaceStatTile label="Needs Review" value={summary.needsReview} />
          <WorkspaceStatTile label="Invalid" value={summary.invalid} />
          <WorkspaceStatTile label="Unmapped" value={summary.unmapped} />
        </div>
        <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-400/10 p-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-100">Top Blocker</p>
          <p className="mt-2 truncate text-sm font-black text-white">{summary.blocker?.displayName ?? "No blockers"}</p>
          {summary.blocker ? <p className="mt-1 truncate text-xs font-semibold text-amber-100/80">{summary.blocker.semanticAssetKey}</p> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={uploadHref(undefined, area, selectedClassId, selectedRole)} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100"><UploadCloud className="h-4 w-4" />Upload Asset</Link>
          <Link href={`/asset-library?section=${encodeURIComponent(area.categoryIds?.[0] ?? "missing")}`} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Open Asset Library</Link>
          {area.screenSpecHref ? <Link href={area.screenSpecHref} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Open {screenSpecLabel(area)}</Link> : null}
          {area.advancedHref ? <Link href={area.advancedHref} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Advanced Designer</Link> : null}
          <Link href={handoffHref(area, "game")} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Generate Game Handoff</Link>
          <Link href={handoffHref(area, "roblox")} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Generate Roblox Handoff</Link>
          <Link href={handoffHref(area, "mobile")} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Generate Mobile Handoff</Link>
        </div>
      </WorkspacePanel>
      {area.id === "upgrades" ? <UpgradeCategoryStatus state={state} /> : null}
      {hasFeatureCards && selectedClassId === "all" ? (
        <div className={roleAwareAssetGridClass(settings)}>
          {classSummaries.map((classSummary) => <FeatureSummaryCard key={classSummary.classId} summary={classSummary} area={area} onOpen={selectClass} />)}
        </div>
      ) : items.length ? (
        <>
          <WorkspacePanel>
            {selectedClassId !== "all" ? (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/40 p-3">
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500">Feature</p>
                  <p className="mt-1 text-sm font-black text-white">{currentClass?.displayName ?? area.label}</p>
                </div>
                <button type="button" onClick={() => selectClass("all")} className="inline-flex h-9 items-center justify-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-xs font-black uppercase tracking-[0.12em] text-slate-200 hover:border-cyan-300/40 hover:text-white">Back to Feature Cards</button>
              </div>
            ) : null}
            <div className="grid gap-3 xl:grid-cols-[minmax(18rem,1fr)_auto] xl:items-start">
              <WorkspaceSearchBar value={query} onChange={setQuery} placeholder={`Search ${currentClass?.displayName ?? area.label} assets`} className="p-2" />
              <ViewOptionsButton settings={settings} onSettingsChange={setSettings} />
            </div>
            {selectedClassId !== "all" ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500" htmlFor={`role-filter-${area.id}`}>Role</label>
                <select id={`role-filter-${area.id}`} value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className="h-9 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-xs font-bold text-white outline-none">
                  {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <span className="text-xs font-semibold text-slate-500">Secondary asset-role filter</span>
              </div>
            ) : null}
            <div role="tablist" aria-label={`${area.label} production status`} className="mt-3 flex gap-2 overflow-x-auto rounded-md border border-cyan-300/15 bg-slate-950/35 p-2">
              {filterTabs.map((tab) => (
                <button key={tab} type="button" role="tab" aria-selected={status === tab} onClick={() => setStatus(tab)} className={`shrink-0 rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${status === tab ? "bg-cyan-300/20 text-white" : "text-slate-400 hover:bg-cyan-300/10 hover:text-slate-100"}`}>
                  {tab.replaceAll("_", " ")}
                </button>
              ))}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2 text-xs font-semibold text-slate-400">
              <Search className="h-4 w-4" />
              {items.length} shown / {summary.items.length} total
            </div>
          </WorkspacePanel>
          <div className={roleAwareAssetGridClass(settings)}>
            {items.map((item) => <ProductionItemCard key={item.id} item={item} settings={settings} area={area} />)}
          </div>
        </>
      ) : (
        <WorkspacePanel>
          <p className="text-sm font-semibold text-slate-300">No assets or requirements have been defined for this area.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/asset-library?section=missing" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Generate Requirements from Screens and Components</Link>
            <Link href={uploadHref(undefined, area, selectedClassId, selectedRole)} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Upload Asset</Link>
            {area.screenSpecHref ? <Link href={area.screenSpecHref} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Open {screenSpecLabel(area)}</Link> : null}
          </div>
        </WorkspacePanel>
      )}
    </div>
  );
}

export function CreativeProductionWorkspace({ state, studioData, initialArea, initialClassId }: { state: AssetProductionState; studioData: GameData; initialArea?: string | null; initialClassId?: string | null }) {
  const normalizedInitial = initialArea && initialArea in areaById ? initialArea as Exclude<ProductionAreaId, "overview"> : null;
  const [activeArea, setActiveArea] = useState<ProductionAreaId>(normalizedInitial ?? "overview");
  useEffect(() => {
    setActiveArea(normalizedInitial ?? "overview");
  }, [normalizedInitial]);
  const summaries = useMemo(() => productionAreas.map((area) => ({ area, summary: areaSummary(state, area) })), [state]);
  const allItems = summaries.flatMap((entry) => entry.summary.items);
  const uniqueItems = new Map(allItems.map((item) => [item.id, item]));
  const totalItems = [...uniqueItems.values()];
  const overallReadiness = readinessFor(totalItems);
  const p0 = totalItems.filter((item) => priorityFor(item) === "P0" && ["missing", "invalid", "needs_review"].includes(item.status)).length;
  const p1 = totalItems.filter((item) => priorityFor(item) === "P1" && ["missing", "invalid", "needs_review"].includes(item.status)).length;

  function openArea(areaId: ProductionAreaId) {
    setActiveArea(areaId);
    if (typeof window !== "undefined") {
      const path = areaId === "overview" ? "/creative-production" : `/creative-production?area=${encodeURIComponent(areaId)}`;
      window.history.replaceState(null, "", path);
    }
  }

  if (activeArea !== "overview") {
    return <AreaDetail state={state} studioData={studioData} area={areaById[activeArea as Exclude<ProductionAreaId, "overview">]} initialClassId={initialClassId ?? null} onBack={() => openArea("overview")} />;
  }

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Creative Production"
        title="Creative Production"
        description="See what is missing, upload assets, and finish each part of NOVERIS."
        stats={[
          { label: "Readiness", value: `${overallReadiness}%` },
          { label: "P0 Blockers", value: p0 },
          { label: "P1 Blockers", value: p1 },
          { label: "Published", value: totalItems.filter((item) => item.status === "published").length }
        ]}
      />
      <WorkspacePanel title="Creative Production Readiness" icon={Palette}>
        <div className="grid gap-3 md:grid-cols-5">
          <WorkspaceStatTile label="Overall" value={`${overallReadiness}%`} />
          <WorkspaceStatTile label="Missing" value={totalItems.filter((item) => item.status === "missing").length} />
          <WorkspaceStatTile label="Needs Review" value={totalItems.filter((item) => item.status === "needs_review").length} />
          <WorkspaceStatTile label="Published" value={totalItems.filter((item) => item.status === "published").length} />
          <WorkspaceStatTile label="Invalid" value={totalItems.filter((item) => item.status === "invalid").length} />
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-400">Readiness formula: published 100%, approved 90%, needs review 55%, uploaded 45%, processing 35%, unmapped 20%, missing or invalid 0%. P0 means visible shell/app blockers; P1 means approved screen or component blockers; P2 means required production asset; P3 means future/backlog.</p>
      </WorkspacePanel>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {summaries.map(({ area, summary }) => <AreaCard key={area.id} area={area} summary={summary} onOpen={openArea} />)}
      </div>
      <WorkspacePanel title="Advanced / Systems Authoring" icon={Landmark}>
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
          {[
            ["/civilizations", "Civilization Design Studio"],
            ["/content-authoring", "Content Authoring"],
            ["/research", "Research Designer"],
            ["/unlock-matrix", "Unlock Matrix"],
            ["/upgrades", "Upgrade Designer"],
            ["/buildings", "Building Designer"],
            ["/wonders", "Wonder Designer"],
            ["/districts", "District Designer"],
            ["/economy-designer", "Economy Designer"],
            ["/architecture", "Architecture"],
            ["/game-engine-exports", "Game Engine Exports"],
            ["/validation-engine", "Validation Center"]
          ].map(([href, label]) => <Link key={href} href={href} className="rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-200 hover:border-cyan-300/35 hover:text-white">{label}</Link>)}
        </div>
      </WorkspacePanel>
    </main>
  );
}
