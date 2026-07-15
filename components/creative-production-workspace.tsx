"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bot,
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
import { CompactWorkspaceToolbar, cardShellClass, collectionGridClass, previewBoxClass, useWorkspaceDensitySettings, type DensitySettings } from "@/components/ui/density";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile, workspaceBadgeClass } from "@/components/ui/workspace";
import type { AssetProductionState } from "@/lib/assets/asset-production";
import type { AssetLibraryCategoryId } from "@/lib/assets/asset-library-routing";
import { cn } from "@/lib/utils";

type InventoryItem = AssetProductionState["assetLibraryInventory"]["items"][number];
type InventoryStatus = InventoryItem["status"];
type ProductionAreaId =
  | "overview"
  | "top-hud"
  | "left-navigation"
  | "research"
  | "buildings"
  | "upgrades"
  | "ai-agents"
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
  visualBuilderHref?: string;
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
  { id: "top-hud", label: "Top HUD", categoryIds: ["top-hud"], icon: MonitorCog, accent: "from-cyan-300/25 to-emerald-300/10", visualBuilderHref: "/screen-designer/noveris-app-shell", screenSpecHref: "/component-library/TopHudBar", description: "Panel background, fixed economy slots, identity frame, utility controls, and shell usage.", groups: ["Panel Background", "Civilization Identity", "Labor", "Credits", "Population", "Research", "Premium Crystal", "Calendar", "Trophy", "Settings"] },
  { id: "left-navigation", label: "Left Navigation", categoryIds: ["left-navigation"], icon: MapIcon, accent: "from-sky-300/25 to-cyan-300/10", visualBuilderHref: "/screen-designer/noveris-app-shell", screenSpecHref: "/component-library/SideNavigationRail", description: "Navigation rail background, icons, active states, locked states, and route usage.", groups: ["Rail Background", "Navigation Icons", "Active State", "Locked State", "Collapse Control"] },
  { id: "research", label: "Research", categoryIds: ["research-ui"], icon: Sparkles, accent: "from-violet-300/25 to-cyan-300/10", visualBuilderHref: "/screen-designer/research", screenSpecHref: "/screen-designer/research", advancedHref: "/research", description: "Research screen shell, branch sidebar, icons, tree background, nodes, states, buttons, and timeline.", groups: ["Screen Shell", "Branch Sidebar", "Branch Icons", "Tree Background", "Research Nodes", "Connection States", "Detail Panel", "Benefits", "Unlocks", "Requirements", "Buttons", "Era Timeline"] },
  { id: "buildings", label: "Buildings", categoryIds: ["buildings-ui"], icon: Building2, accent: "from-amber-300/25 to-cyan-300/10", screenSpecHref: "/screen-designer/buildings", advancedHref: "/buildings", description: "Workspace background, category tabs, building cards, icons, cost rows, requirements, and construction states.", groups: ["Workspace Background", "Header", "Category Tabs", "Building Cards", "Building Icons", "Building Details", "Cost Rows", "Requirements", "Build Buttons", "Locked States"] },
  { id: "upgrades", label: "Upgrades", categoryIds: ["upgrade-categories"], icon: WandSparkles, accent: "from-fuchsia-300/25 to-cyan-300/10", screenSpecHref: "/screen-designer/upgrades", advancedHref: "/upgrades", description: "Upgrade icons, card states, category panels, shared fallback background, and dedicated category background workflow.", groups: ["Workforce Background", "Industry Background", "Science Background", "Technology Background", "Shared Fallback", "Cards", "Buttons", "Upgrade Icons"] },
  { id: "ai-agents", label: "AI Agents", categoryIds: ["ai-agents"], icon: Bot, accent: "from-emerald-300/25 to-cyan-300/10", advancedHref: "/ai-agents", description: "Agent heads, open eyes, blink, offline, working, thinking, warning, celebration, accessories, and personality badges.", groups: ["Agent", "Variant", "Open Eyes", "Blink", "Offline", "Working", "Thinking", "Warning", "Celebration", "Accessories", "Personality Badges"] },
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

function uploadHref(item?: InventoryItem, area?: ProductionArea) {
  const params = new URLSearchParams({ upload: "asset" });
  if (area) params.set("category", area.label);
  if (item) {
    params.set("assetKey", item.semanticAssetKey);
    params.set("name", item.displayName);
    params.set("role", item.role);
    params.set("requiredDimensions", item.requiredDimensions);
    if (item.requirementId) params.set("requirement", item.requirementId);
  }
  return `/asset-library?${params.toString()}`;
}

function statusSort(items: InventoryItem[]) {
  return [...items].sort((left, right) => priorityRank(left) - priorityRank(right) || statusCredit[left.status] - statusCredit[right.status] || usageCount(right) - usageCount(left) || left.displayName.localeCompare(right.displayName));
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

function AreaCard({ area, summary, onOpen }: { area: ProductionArea; summary: ReturnType<typeof areaSummary>; onOpen: (areaId: ProductionAreaId) => void }) {
  const Icon = area.icon;
  return (
    <article className="group rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 shadow-glow transition hover:border-cyan-300/45 hover:bg-[#0a1728]">
      <button type="button" onClick={() => onOpen(area.id)} className="block w-full text-left">
        <div className={`relative h-20 overflow-hidden rounded-md border border-cyan-300/10 bg-gradient-to-br ${area.accent}`}>
          {summary.blocker?.previewUrl ? <img src={summary.blocker.previewUrl} alt="" className="h-full w-full object-cover opacity-75" /> : <PlaceholderPreview area={area} />}
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
      </button>
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
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onOpen(area.id)} className="inline-flex h-9 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Open Production</button>
        <Link href={uploadHref(undefined, area)} className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200"><UploadCloud className="h-4 w-4" />Upload</Link>
      </div>
    </article>
  );
}

function ProductionItemCard({ item, settings, area }: { item: InventoryItem; settings: DensitySettings; area: ProductionArea }) {
  const count = usageCount(item);
  const preview = item.previewUrl;
  const linkedHref = item.sourceAssetId ? `/assets/${encodeURIComponent(item.sourceAssetId)}` : uploadHref(item, area);
  if (settings.density === "list") {
    return (
      <article className={cardShellClass(settings)}>
        <div className={previewBoxClass(settings)}>{preview ? <img src={preview} alt="" className="h-full w-full rounded-md object-cover" /> : <PlaceholderPreview item={item} area={area} />}</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{item.displayName}</p>
          <p className="truncate text-xs text-cyan-200">{item.semanticAssetKey}</p>
        </div>
        <span className={cn("rounded-md border px-2 py-1 text-xs font-black uppercase tracking-[0.12em]", workspaceBadgeClass(item.status))}>{item.status.replaceAll("_", " ")}</span>
        <p className="truncate text-xs text-slate-400">{priorityFor(item)}</p>
        <p className="truncate text-xs text-slate-300">{count} usage</p>
        <Link href={linkedHref} className="text-xs font-bold text-cyan-100 hover:text-white">{item.sourceAssetId ? "Open" : "Upload"}</Link>
      </article>
    );
  }
  return (
    <article className={cardShellClass(settings)}>
      <div className={previewBoxClass(settings)}>
        {preview ? <img src={preview} alt="" className="h-full w-full rounded-md object-cover" /> : <PlaceholderPreview item={item} area={area} />}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{item.displayName}</p>
          <p className="mt-1 truncate text-xs text-cyan-200">{item.semanticAssetKey}</p>
        </div>
        <WorkspaceBadge value={item.status} className="shrink-0 text-[0.58rem]" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <WorkspaceMiniStat label="Priority" value={priorityFor(item)} />
        <WorkspaceMiniStat label="Usage" value={count} />
        {settings.density !== "compact" ? <WorkspaceMiniStat label="Role" value={item.role} /> : null}
        {settings.density !== "compact" ? <WorkspaceMiniStat label="Required" value={item.requiredDimensions} /> : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={uploadHref(item, area)} className="inline-flex h-8 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-2 text-xs font-bold text-cyan-100">{item.status === "missing" ? "Upload Asset" : "New Version"}</Link>
        <Link href={linkedHref} className="inline-flex h-8 items-center rounded-md border border-slate-600 bg-slate-950/40 px-2 text-xs font-bold text-slate-200">{item.sourceAssetId ? "Open Inspector" : "Open Requirement"}</Link>
      </div>
    </article>
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
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/asset-library?section=backgrounds" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Open Upgrade Category Workflow</Link>
        <Link href="/asset-library?section=upgrade-categories" className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Open Upgrade Inventory</Link>
      </div>
    </WorkspacePanel>
  );
}

function AreaDetail({ state, area, onBack }: { state: AssetProductionState; area: ProductionArea; onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof filterTabs)[number]>("all");
  const [settings, setSettings] = useWorkspaceDensitySettings(`project-genesis-density-creative-production-${area.id}`, { density: "compact", previewSize: "small", columns: "auto", filter: "all", groupBy: "none" });
  const summary = areaSummary(state, area);
  const items = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return statusSort(summary.items).filter((item) => {
      const text = searchText(item).toLowerCase();
      return (status === "all" || item.status === status) && (!needle || text.includes(needle));
    });
  }, [summary.items, query, status]);
  return (
    <div className="space-y-5">
      <WorkspacePanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button type="button" onClick={onBack} className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Creative Production</button>
            <h2 className="mt-2 text-3xl font-black text-white">{area.label} Production</h2>
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
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={uploadHref(undefined, area)} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100"><UploadCloud className="h-4 w-4" />Upload Asset</Link>
          <Link href={`/asset-library?section=${encodeURIComponent(area.categoryIds?.[0] ?? "missing")}`} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Asset Library</Link>
          {area.visualBuilderHref ? <Link href={area.visualBuilderHref} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Visual Builder</Link> : null}
          {area.screenSpecHref ? <Link href={area.screenSpecHref} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Screen Specification</Link> : null}
          {area.advancedHref ? <Link href={area.advancedHref} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Advanced Designer</Link> : null}
        </div>
      </WorkspacePanel>
      {area.id === "upgrades" ? <UpgradeCategoryStatus state={state} /> : null}
      {area.groups?.length ? (
        <WorkspacePanel title={`${area.label} Groups`} icon={Search}>
          <div className="flex flex-wrap gap-2">
            {area.groups.map((group) => <WorkspaceBadge key={group} value={group} />)}
          </div>
        </WorkspacePanel>
      ) : null}
      <div className="flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-2">
        {filterTabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setStatus(tab)} className={`rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${status === tab ? "bg-cyan-300/20 text-white" : "text-slate-400 hover:bg-cyan-300/10 hover:text-slate-100"}`}>
            {tab.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <CompactWorkspaceToolbar query={query} onQueryChange={setQuery} settings={settings} onSettingsChange={setSettings} resultCount={items.length} totalCount={summary.items.length} placeholder={`Search ${area.label} production`} />
      {items.length ? (
        <div className={collectionGridClass(settings)}>
          {items.map((item) => <ProductionItemCard key={item.id} item={item} settings={settings} area={area} />)}
        </div>
      ) : (
        <WorkspacePanel>
          <p className="text-sm font-semibold text-slate-300">No assets or requirements have been defined for this area.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/asset-library?section=missing" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Generate Requirements from Screens and Components</Link>
            <Link href={uploadHref(undefined, area)} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Upload Asset</Link>
            {area.visualBuilderHref ? <Link href={area.visualBuilderHref} className="inline-flex h-10 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">Open Visual Builder</Link> : null}
          </div>
        </WorkspacePanel>
      )}
    </div>
  );
}

export function CreativeProductionWorkspace({ state, initialArea }: { state: AssetProductionState; initialArea?: string | null }) {
  const normalizedInitial = initialArea && initialArea in areaById ? initialArea as Exclude<ProductionAreaId, "overview"> : null;
  const [activeArea, setActiveArea] = useState<ProductionAreaId>(normalizedInitial ?? "overview");
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
    return <AreaDetail state={state} area={areaById[activeArea as Exclude<ProductionAreaId, "overview">]} onBack={() => openArea("overview")} />;
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
