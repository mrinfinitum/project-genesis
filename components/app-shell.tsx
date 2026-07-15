"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BadgeDollarSign,
  Bot,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Compass,
  CopyPlus,
  Cpu,
  Database,
  FileCode2,
  FileCheck2,
  FileText,
  FlaskConical,
  Gauge,
  Gem,
  GitBranch,
  History,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Map,
  MonitorCog,
  Network,
  Orbit,
  Palette,
  PackageCheck,
  Pickaxe,
  Radar,
  ScrollText,
  Search,
  Settings,
  Sparkles,
  Star,
  UploadCloud
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectSystemProgress = {
  id: string;
  group_name: string;
  completion_percent: number;
};

type NavigationItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  future?: boolean;
  activePaths?: string[];
};

type NavigationGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  fallbackProgress: number;
  systemIds: string[];
  items: NavigationItem[];
};

const STORAGE_SECTIONS_KEY = "project-genesis-nav-sections";

const navigationGroups: NavigationGroup[] = [
  {
    id: "command-center",
    label: "Command Center",
    icon: LayoutDashboard,
    fallbackProgress: 64,
    systemIds: ["dashboard-metrics", "tasks"],
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, activePaths: ["/"] },
      { href: "/tasks", label: "Current Sprint", icon: ListChecks }
    ]
  },
  {
    id: "studio",
    label: "Advanced / Systems Authoring",
    icon: FileText,
    fallbackProgress: 92,
    systemIds: ["architecture", "research", "unlock-matrix", "buildings", "upgrades", "dashboard-metrics"],
    items: [
      { href: "/civilizations", label: "Civilization Library", icon: Landmark },
      { href: "/content-authoring", label: "Content Authoring", icon: CopyPlus },
      { href: "/research", label: "Research Designer", icon: FlaskConical },
      { href: "/unlock-matrix", label: "Unlock Matrix", icon: GitBranch },
      { href: "/upgrades", label: "Upgrade Designer", icon: Gauge },
      { href: "/buildings", label: "Building Designer", icon: Building2 },
      { href: "/wonders", label: "Wonder Designer", icon: Sparkles },
      { href: "/districts", label: "District Designer", icon: Network },
      { href: "/economy-designer", label: "Economy Designer", icon: BadgeDollarSign },
      { href: "/architecture", label: "Architecture", icon: FileText },
      { href: "/advanced/deprecated/visual-builder", label: "Deprecated Visual Builder Archive", icon: Archive }
    ]
  },
  {
    id: "universe",
    label: "Universe Libraries",
    icon: Star,
    fallbackProgress: 58,
    systemIds: ["planet-generation", "ancient-civilizations", "planet-traits", "anomalies", "hazards", "expeditions"],
    items: [
      { href: "/galaxy", label: "Galaxy Library", icon: Star },
      { href: "/sector-map", label: "Sector Library", icon: Map },
      { href: "/star-system-map", label: "Star System Library", icon: Radar },
      { href: "/celestial-bodies", label: "Star Library", icon: CircleDot },
      { href: "/planets", label: "Planet Library", icon: Orbit },
      { href: "/discovery-journal", label: "Discovery Library", icon: ScrollText },
      { href: "/universe-timeline", label: "Universe Timeline", icon: History },
      { href: "/missions", label: "Missions", icon: ClipboardList },
      { href: "/planetary-rules", label: "Rules", icon: GitBranch }
    ]
  },
  {
    id: "operations",
    label: "World & Operations",
    icon: BadgeDollarSign,
    fallbackProgress: 52,
    systemIds: ["resources", "collectibles", "ancient-civilizations"],
    items: [
      { href: "/factions", label: "Factions", icon: Landmark },
      { href: "/colonies", label: "Colonies", icon: Building2 },
      { href: "/economy", label: "Economy & Trade", icon: BadgeDollarSign },
      { href: "/celestial-bodies", label: "Star Library", icon: CircleDot }
    ]
  },
  {
    id: "civilization",
    label: "Creative Production",
    icon: Palette,
    fallbackProgress: 38,
    systemIds: ["assets", "research", "buildings", "upgrades"],
    items: [
      { href: "/creative-production", label: "Overview", icon: LayoutDashboard },
      { href: "/creative-production?area=top-hud", label: "Top HUD", icon: MonitorCog },
      { href: "/creative-production?area=left-navigation", label: "Left Navigation", icon: Map },
      { href: "/creative-production?area=research", label: "Research", icon: FlaskConical },
      { href: "/creative-production?area=buildings", label: "Buildings", icon: Building2 },
      { href: "/creative-production?area=upgrades", label: "Upgrades", icon: Gauge },
      { href: "/creative-production?area=ai-agents", label: "AI Agents", icon: Bot },
      { href: "/creative-production?area=discovery", label: "Discovery", icon: Search },
      { href: "/creative-production?area=encyclopedia", label: "Encyclopedia", icon: BookOpen },
      { href: "/creative-production?area=civilizations", label: "Civilizations", icon: Landmark },
      { href: "/creative-production?area=galaxies", label: "Galaxies", icon: Star },
      { href: "/creative-production?area=sectors", label: "Sectors", icon: Map },
      { href: "/creative-production?area=star-systems", label: "Star Systems", icon: Orbit },
      { href: "/creative-production?area=stars", label: "Stars", icon: Star },
      { href: "/creative-production?area=planets", label: "Planets", icon: Orbit },
      { href: "/creative-production?area=settings", label: "Settings", icon: Settings },
      { href: "/creative-production?area=login-account", label: "Login & Account", icon: FileText },
      { href: "/creative-production?area=loading", label: "Loading", icon: UploadCloud },
      { href: "/creative-production?area=icons", label: "Icons", icon: PackageCheck },
      { href: "/creative-production?area=backgrounds", label: "Backgrounds", icon: Palette },
      { href: "/creative-production?area=animations", label: "Animations", icon: Sparkles },
      { href: "/creative-production?area=audio", label: "Audio", icon: BadgeDollarSign },
      { href: "/creative-production?area=video", label: "Video", icon: FileCode2 }
    ]
  },
  {
    id: "resources",
    label: "Resources",
    icon: Gem,
    fallbackProgress: 47,
    systemIds: ["resources", "collectibles"],
    items: [
      { href: "/resource-catalog", label: "Resource Catalog", icon: Gem },
      { href: "/planet-resource-profiles", label: "Planet Resource Profiles", icon: CircleDot },
      { label: "Resource Distribution", icon: Pickaxe, future: true },
      { href: "/collectibles", label: "Collectibles", icon: Archive }
    ]
  },
  {
    id: "creative",
    label: "Creative",
    icon: Palette,
    fallbackProgress: 18,
    systemIds: ["assets"],
    items: [
      { href: "/planet-artwork", label: "Planet Artwork", icon: Sparkles },
      { href: "/surface-landscapes", label: "Surface Landscapes", icon: Palette },
      { href: "/hero-discovery-shots", label: "Hero Discovery", icon: Star },
      { href: "/prompt-library", label: "Prompt Library", icon: ScrollText },
      { href: "/ai-agents", label: "AI Agents", icon: Bot },
      { href: "/discovery", label: "Discovery", icon: Search },
      { href: "/encyclopedia", label: "Civilization Encyclopedia", icon: BookOpen },
      { href: "/screen-designer", label: "Screen Specifications", icon: MonitorCog },
      { href: "/component-library", label: "Component Library", icon: PackageCheck },
      { href: "/asset-library", label: "Asset Library", icon: PackageCheck },
      { href: "/conceptual-art", label: "Concept Art", icon: Palette }
    ]
  },
  {
    id: "engine",
    label: "Engine & Validation",
    icon: GitBranch,
    fallbackProgress: 61,
    systemIds: ["unlock-matrix"],
    items: [
      { href: "/game-engine-exports", label: "Game Engine Exports", icon: FileCode2 },
      { href: "/game-data-import", label: "Game Data Import", icon: UploadCloud },
      { href: "/content-releases", label: "Content Releases", icon: FileCheck2 },
      { href: "/prototype-content", label: "Prototype Content", icon: ClipboardList },
      { href: "/building-relationships", label: "Relationship Graph", icon: Network },
      { href: "/validation-engine", label: "Validation Center", icon: Database },
      { href: "/building-chains", label: "Balance Designer", icon: Gauge },
      { label: "Rule Engine", icon: Cpu, future: true }
    ]
  },
  {
    id: "developer",
    label: "Developer",
    icon: Settings,
    fallbackProgress: 52,
    systemIds: ["tasks", "release-notes", "changelog", "codex-handoffs"],
    items: [
      { href: "/tasks", label: "ChatGPT Tasks", icon: ListChecks, activePaths: [] },
      { href: "/database", label: "Database", icon: Database },
      { href: "/settings#imports-exports", label: "Imports / Exports", icon: UploadCloud, activePaths: [] },
      { href: "/universe-explorer", label: "Developer Seed Explorer", icon: Compass },
      { href: "/changelog", label: "Changelog", icon: History },
      { href: "/releases", label: "Release Notes", icon: ScrollText },
      { href: "/settings", label: "Settings", icon: Settings }
    ]
  }
];

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function progressForGroup(group: NavigationGroup, systems: ProjectSystemProgress[]) {
  const matches = systems.filter((system) => group.systemIds.includes(system.id));
  if (!matches.length) {
    return group.fallbackProgress;
  }

  return Math.round(matches.reduce((sum, system) => sum + clampPercent(system.completion_percent), 0) / matches.length);
}

function hrefPath(href: string) {
  return href.split("#")[0].split("?")[0];
}

function hrefSearch(href: string) {
  return href.split("#")[0].split("?")[1] ?? "";
}

function activeGroupForPath(pathname: string) {
  return navigationGroups.find((group) =>
    group.items.some((item) => {
      if (!item.href) {
        return false;
      }

      if (item.activePaths) {
        return item.activePaths.includes(pathname);
      }

      return hrefPath(item.href) === pathname;
    })
  );
}

function isItemActive(item: NavigationItem, pathname: string, searchParams: { get: (key: string) => string | null; has: (key: string) => boolean }) {
  if (!item.href) {
    return false;
  }

  if (item.activePaths) {
    return item.activePaths.includes(pathname);
  }

  if (hrefPath(item.href) !== pathname) {
    return false;
  }

  const itemSearch = hrefSearch(item.href);
  if (!itemSearch) {
    return pathname !== "/creative-production" || !searchParams.has("area");
  }

  const itemParams = new URLSearchParams(itemSearch);
  for (const [key, value] of itemParams.entries()) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

function uniqueSections(ids: Array<string | undefined>) {
  return ids.filter((id, index, values): id is string => Boolean(id) && values.indexOf(id) === index);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState("");
  const currentSearchParams = useMemo(() => new URLSearchParams(currentSearch), [currentSearch]);
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");
  const activeGroup = useMemo(() => activeGroupForPath(pathname), [pathname]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => uniqueSections(["command-center", activeGroup?.id]));
  const [systems, setSystems] = useState<ProjectSystemProgress[]>([]);

  useEffect(() => {
    const storedSections = window.localStorage.getItem(STORAGE_SECTIONS_KEY);
    const legacyStoredSection = window.localStorage.getItem("project-genesis-nav-section");
    let stored: string[] = [];

    if (storedSections) {
      try {
        const parsed = JSON.parse(storedSections) as unknown;
        stored = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
      } catch {
        stored = [];
      }
    } else if (legacyStoredSection) {
      stored = [legacyStoredSection];
      window.localStorage.removeItem("project-genesis-nav-section");
    }

    const defaults = uniqueSections(["command-center", activeGroup?.id]);
    const next = stored.length ? uniqueSections([...stored, activeGroup?.id]) : defaults;
    setExpandedGroups(next);
    window.localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(next));
  }, [activeGroup?.id]);

  useEffect(() => {
    function syncSearch() {
      setCurrentSearch(window.location.search);
    }
    syncSearch();
    window.addEventListener("popstate", syncSearch);
    return () => window.removeEventListener("popstate", syncSearch);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/data/project_systems")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { rows?: ProjectSystemProgress[] } | null) => {
        if (!cancelled && payload?.rows) {
          setSystems(payload.rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSystems([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  function toggleGroup(groupId: string) {
    const next = expandedGroups.includes(groupId)
      ? expandedGroups.filter((id) => id !== groupId)
      : [...expandedGroups, groupId];
    setExpandedGroups(next);
    window.localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(next));
  }

  return (
    <div className="min-h-screen bg-genesis-void text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-80 border-r border-cyan-400/15 bg-[#07101e]/95 px-4 py-5 shadow-glow backdrop-blur lg:block">
        <Link href="/" className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/35 bg-cyan-300/10">
            <Cpu className="h-5 w-5 text-cyan-200" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Project</span>
            <span className="block text-xl font-bold text-white">Genesis Studio</span>
          </span>
        </Link>

        <nav className="h-[calc(100vh-6.5rem)] space-y-2 overflow-y-auto pr-1">
          {navigationGroups.map((group) => {
            const Icon = group.icon;
            const expanded = expandedGroups.includes(group.id);
            const groupActive = activeGroup?.id === group.id;
            const progress = progressForGroup(group, systems);

            return (
              <section
                key={group.id}
                className={cn(
                  "rounded-md border border-cyan-400/10 bg-slate-950/25 transition",
                  expanded && !groupActive && "border-cyan-400/20 shadow-[0_0_18px_rgba(34,211,238,0.06)]",
                  groupActive && "border-cyan-300/35 shadow-[0_0_24px_rgba(34,211,238,0.10)]"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left"
                  aria-expanded={expanded}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-md border border-cyan-300/15 bg-cyan-300/10 text-cyan-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold uppercase tracking-[0.2em] text-slate-100">{group.label}</span>
                      <span className="text-[0.65rem] font-semibold text-cyan-200">{progress}%</span>
                    </span>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </span>
                  </span>
                  {expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                </button>

                {expanded ? (
                  <div className="space-y-1 border-t border-cyan-400/10 p-2">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isItemActive(item, pathname, currentSearchParams);

                      if (!item.href || item.future) {
                        return (
                          <div
                            key={`${group.id}-${item.label}`}
                            className="flex h-9 items-center gap-3 rounded-md px-2 text-sm text-slate-500"
                            aria-disabled="true"
                          >
                            <ItemIcon className="h-4 w-4" />
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
                              Future
                            </span>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={`${group.id}-${item.label}`}
                          href={item.href}
                          onClick={() => setCurrentSearch(hrefSearch(item.href ?? "") ? `?${hrefSearch(item.href ?? "")}` : "")}
                          className={cn(
                            "flex h-8 items-center gap-3 rounded-md border border-transparent px-2 text-sm font-semibold text-slate-400 transition hover:border-cyan-300/20 hover:bg-cyan-300/10 hover:text-cyan-50",
                            active && "border-cyan-300/35 bg-cyan-300/15 text-cyan-50 shadow-[inset_2px_0_0_rgba(103,232,249,0.9)]"
                          )}
                        >
                          <ItemIcon className={cn("h-4 w-4 shrink-0", active ? "text-cyan-100" : "text-slate-500")} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-80">
        <header className="sticky top-0 z-10 border-b border-cyan-400/15 bg-[#07101e]/85 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Universe Authoring IDE</p>
              <h1 className="text-lg font-semibold text-white">Project Genesis Studio</h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-green-300/25 bg-green-300/10 px-3 py-1 text-green-200">Studio Online</span>
              <span className="hidden rounded-full border border-cyan-300/20 px-3 py-1 sm:inline-flex">v0.1.0</span>
              <span className="hidden rounded-full border border-blue-300/20 px-3 py-1 sm:inline-flex">Sprint: Phase 1</span>
            </div>
          </div>
        </header>
        <main className="genesis-grid min-h-[calc(100vh-4rem)] px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
