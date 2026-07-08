"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Compass,
  Cpu,
  Database,
  Download,
  FlaskConical,
  Gamepad2,
  Gauge,
  Gem,
  GitBranch,
  History,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Map,
  Network,
  Orbit,
  Palette,
  Pickaxe,
  Radar,
  Rocket,
  ScrollText,
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

const STORAGE_KEY = "project-genesis-nav-section";

const navigationGroups: NavigationGroup[] = [
  {
    id: "command-center",
    label: "Command Center",
    icon: LayoutDashboard,
    fallbackProgress: 64,
    systemIds: ["dashboard-metrics", "tasks", "codex-handoffs"],
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, activePaths: ["/"] },
      { href: "/tasks", label: "Current Sprint", icon: ListChecks },
      { href: "/codex-handoffs", label: "Ready for Codex", icon: Cpu },
      { href: "/#data-health", label: "Data Health", icon: Database, activePaths: [] },
      { href: "/database", label: "Design Review Export", icon: Download }
    ]
  },
  {
    id: "universe",
    label: "Universe",
    icon: Star,
    fallbackProgress: 58,
    systemIds: ["planet-generation", "ancient-civilizations", "planet-traits", "anomalies", "hazards", "expeditions"],
    items: [
      { href: "/galaxy", label: "Galaxy Generator", icon: Star },
      { href: "/sector-map", label: "Sector Generator", icon: Map },
      { href: "/star-system-map", label: "Star System Generator", icon: Radar },
      { href: "/celestial-bodies", label: "Celestial Body Designer", icon: CircleDot },
      { href: "/planets", label: "Planet Designer", icon: Orbit },
      { href: "/planetary-rules", label: "Generation Rules", icon: GitBranch }
    ]
  },
  {
    id: "civilization",
    label: "Civilization",
    icon: Landmark,
    fallbackProgress: 84,
    systemIds: ["research", "buildings", "upgrades", "districts", "wonders"],
    items: [
      { href: "/civilizations", label: "Civilization Design Studio", icon: Landmark },
      { href: "/research", label: "Research Designer", icon: FlaskConical },
      { href: "/upgrades", label: "Upgrade Designer", icon: Gauge },
      { href: "/buildings", label: "Building Designer", icon: Building2 },
      { href: "/districts", label: "District Designer", icon: Network },
      { href: "/wonders", label: "Wonder Designer", icon: Sparkles }
    ]
  },
  {
    id: "economy",
    label: "Economy",
    icon: Gem,
    fallbackProgress: 47,
    systemIds: ["resources", "collectibles"],
    items: [
      { href: "/resource-catalog", label: "Resource Catalog", icon: Gem },
      { href: "/planet-resource-profiles", label: "Planet Resources", icon: CircleDot },
      { label: "Resource Distribution Designer", icon: Pickaxe, future: true },
      { href: "/collectibles", label: "Collectibles", icon: Archive },
      { label: "Trading", icon: Boxes, future: true },
      { label: "Manufacturing", icon: Building2, future: true }
    ]
  },
  {
    id: "systems",
    label: "Systems",
    icon: GitBranch,
    fallbackProgress: 61,
    systemIds: ["unlock-matrix"],
    items: [
      { href: "/unlock-matrix", label: "Unlock Matrix", icon: GitBranch },
      { href: "/building-relationships", label: "Relationship Graph", icon: Network },
      { href: "/building-chains", label: "Balance Designer", icon: Gauge },
      { href: "/validation-engine", label: "Validation Engine", icon: Database },
      { label: "Events", icon: Sparkles, future: true },
      { label: "Achievements", icon: Star, future: true }
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
      { href: "/hero-discovery-shots", label: "Hero Discovery Shots", icon: Star },
      { href: "/prompt-library", label: "Prompt Library", icon: ScrollText },
      { href: "/conceptual-art", label: "Concept Art", icon: Palette },
      { href: "/assets", label: "Asset Library", icon: Archive },
      { href: "/assets", label: "UI Assets", icon: Gamepad2, activePaths: [] }
    ]
  },
  {
    id: "project",
    label: "Project",
    icon: Settings,
    fallbackProgress: 52,
    systemIds: ["tasks", "release-notes", "changelog", "codex-handoffs"],
    items: [
      { href: "/tasks", label: "Tasks", icon: ListChecks },
      { href: "/database", label: "Database", icon: Database },
      { href: "/settings", label: "Imports / Exports", icon: UploadCloud },
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

function activeGroupForPath(pathname: string) {
  return navigationGroups.find((group) =>
    group.items.some((item) => {
      if (!item.href) {
        return false;
      }

      if (item.activePaths) {
        return item.activePaths.includes(pathname);
      }

      return item.href.split("#")[0] === pathname;
    })
  );
}

function isItemActive(item: NavigationItem, pathname: string) {
  if (!item.href) {
    return false;
  }

  if (item.activePaths) {
    return item.activePaths.includes(pathname);
  }

  return item.href.split("#")[0] === pathname;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");
  const activeGroup = useMemo(() => activeGroupForPath(pathname), [pathname]);
  const [expandedGroup, setExpandedGroup] = useState(activeGroup?.id ?? "command-center");
  const [systems, setSystems] = useState<ProjectSystemProgress[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setExpandedGroup(activeGroup?.id ?? stored ?? "command-center");
  }, [activeGroup?.id]);

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
    const next = expandedGroup === groupId ? "" : groupId;
    setExpandedGroup(next);
    window.localStorage.setItem(STORAGE_KEY, next);
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
            const expanded = expandedGroup === group.id;
            const groupActive = activeGroup?.id === group.id;
            const progress = progressForGroup(group, systems);

            return (
              <section
                key={group.id}
                className={cn(
                  "rounded-md border border-cyan-400/10 bg-slate-950/25 transition",
                  groupActive && "border-cyan-300/30 bg-cyan-300/[0.04]"
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
                      const active = isItemActive(item, pathname);

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
                          className={cn(
                            "flex h-9 items-center gap-3 rounded-md px-2 text-sm text-slate-300 transition hover:bg-cyan-300/10 hover:text-white",
                            active && "border border-cyan-300/25 bg-cyan-300/15 text-cyan-100"
                          )}
                        >
                          <ItemIcon className="h-4 w-4" />
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
