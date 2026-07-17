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

type StudioHealthMetric = {
  id: "content" | "art" | "exports" | "verification";
  label: string;
  percent: number;
  href: string;
  tooltip: string;
  details: string[];
};

type StudioStatus = {
  studioOnline: boolean;
  contentVersion: number | string;
  architectureVersion: string;
  runtimeReady: boolean;
  gitClean: boolean;
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
  items: NavigationItem[];
};

const STORAGE_SECTIONS_KEY = "project-genesis-nav-sections";

const navigationGroups: NavigationGroup[] = [
  {
    id: "command-center",
    label: "Command Center",
    icon: LayoutDashboard,
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, activePaths: ["/"] },
      { href: "/tasks", label: "Current Sprint", icon: ListChecks }
    ]
  },
  {
    id: "content-libraries",
    label: "Content Libraries",
    icon: PackageCheck,
    items: [
      { href: "/asset-library", label: "Asset Library", icon: PackageCheck },
      { href: "/galaxy", label: "Galaxy Library", icon: Star },
      { href: "/sector-map", label: "Sector Library", icon: Map },
      { href: "/star-system-map", label: "Star System Library", icon: Radar },
      { href: "/celestial-bodies", label: "Star Library", icon: CircleDot },
      { href: "/planets", label: "Planet Library", icon: Orbit },
      { href: "/discovery-journal", label: "Discovery Library", icon: ScrollText },
      { href: "/civilizations", label: "Civilization Library", icon: Landmark },
      { href: "/encyclopedia", label: "Encyclopedia", icon: BookOpen }
    ]
  },
  {
    id: "world-systems",
    label: "World Systems",
    icon: BadgeDollarSign,
    items: [
      { href: "/actions", label: "Actions", icon: ListChecks },
      { href: "/colonies", label: "Colonies", icon: Building2 },
      { href: "/population", label: "Population", icon: Landmark },
      { href: "/economy", label: "Economy & Trade", icon: BadgeDollarSign },
      { href: "/missions", label: "Missions", icon: ClipboardList },
      { href: "/dynamic-events", label: "Dynamic Events", icon: Sparkles }
    ]
  },
  {
    id: "authoring",
    label: "Authoring",
    icon: GitBranch,
    items: [
      { href: "/research", label: "Research", icon: FlaskConical },
      { href: "/buildings", label: "Buildings", icon: Building2 },
      { href: "/resource-catalog", label: "Resources", icon: Gem },
      { href: "/ai-agents", label: "AI Agents", icon: Bot },
      { href: "/runtime", label: "Runtime", icon: Database },
      { href: "/game-engine-exports", label: "Exports", icon: FileCode2 },
      { href: "/architecture", label: "Architecture", icon: FileText }
    ]
  }
];

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
    return pathname !== "/asset-library" || (!searchParams.has("category") && !searchParams.has("section"));
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

function healthLineClass(percent: number) {
  if (percent >= 100) return "bg-slate-500";
  if (percent >= 75) return "bg-cyan-500/70";
  if (percent >= 50) return "bg-amber-400/70";
  if (percent >= 25) return "bg-orange-400/80";
  return "bg-rose-400";
}

function metricLabel(metric: StudioHealthMetric) {
  if (metric.id === "content") return "Content";
  if (metric.id === "art") return "Art";
  if (metric.id === "exports") return "Exports";
  return "Verification";
}

function metricValue(metric: StudioHealthMetric) {
  if (metric.id === "exports" && metric.percent === 100) return "Ready";
  return `${metric.percent}%`;
}

function StatusChip({ label, ok, muted }: { label: string; ok?: boolean; muted?: boolean }) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 text-[0.62rem] font-semibold leading-none",
        muted && "border-slate-700/70 bg-transparent text-slate-500",
        ok === true && "border-slate-700/70 bg-transparent text-slate-400",
        ok === false && "border-amber-400/35 bg-amber-400/5 text-amber-200"
      )}
    >
      {label}
    </span>
  );
}

function StudioHealthPanel({ metrics, status }: { metrics: StudioHealthMetric[]; status?: StudioStatus }) {
  return (
    <section className="mb-4 border-y border-cyan-400/10 py-3">
      <div className="flex flex-wrap gap-1.5">
        <StatusChip label={status?.studioOnline ? "Studio Online" : "Studio Offline"} ok={status?.studioOnline ?? true} />
        <StatusChip label={`v${status?.contentVersion ?? "..."}`} muted />
        <StatusChip label={`Arch ${status?.architectureVersion ?? "..."}`} muted />
        <StatusChip label={status?.runtimeReady ? "Runtime Ready" : "Runtime Issue"} ok={status?.runtimeReady ?? true} />
        <StatusChip label={status?.gitClean ? "Git Clean" : "Git Dirty"} ok={status?.gitClean ?? true} />
      </div>

      <div className="mt-3 space-y-2">
        {metrics.length ? metrics.map((metric) => {
          const alert = metric.percent < 50 || (metric.id === "exports" && metric.percent < 100) || (metric.id === "verification" && metric.percent < 100);
          return (
            <Link key={metric.id} href={metric.href} title={`${metric.tooltip} ${metric.details.join(" ")}`} className="group block rounded-sm text-slate-500 transition hover:text-slate-200">
              <span className="flex items-center justify-between gap-3 text-[0.68rem]">
                <span className="truncate font-semibold uppercase tracking-[0.16em]">{metricLabel(metric)}</span>
                <span className={cn("font-semibold tabular-nums", alert ? "text-amber-200" : "text-slate-400")}>{metricValue(metric)}</span>
              </span>
              <span className="mt-1 block h-px overflow-hidden rounded-full bg-slate-800/80">
                <span className={cn("block h-full rounded-full transition-all", healthLineClass(metric.percent))} style={{ width: `${Math.max(0, Math.min(100, metric.percent))}%` }} />
              </span>
            </Link>
          );
        }) : (
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-600">Calculating health...</p>
        )}
      </div>
    </section>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState("");
  const currentSearchParams = useMemo(() => new URLSearchParams(currentSearch), [currentSearch]);
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");
  const activeGroup = useMemo(() => activeGroupForPath(pathname), [pathname]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => uniqueSections(["command-center", activeGroup?.id]));
  const [healthMetrics, setHealthMetrics] = useState<StudioHealthMetric[]>([]);
  const [studioStatus, setStudioStatus] = useState<StudioStatus>();

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

    fetch("/api/studio-health")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { status?: StudioStatus; metrics?: StudioHealthMetric[] } | null) => {
        if (!cancelled && payload?.metrics) {
          setHealthMetrics(payload.metrics);
          setStudioStatus(payload.status);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHealthMetrics([]);
          setStudioStatus(undefined);
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
        <StudioHealthPanel metrics={healthMetrics} status={studioStatus} />

        <nav className="h-[calc(100vh-16rem)] space-y-2 overflow-y-auto pr-1">
          {navigationGroups.map((group) => {
            const Icon = group.icon;
            const expanded = expandedGroups.includes(group.id);
            const groupActive = activeGroup?.id === group.id;

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
                    <span className="truncate text-xs font-bold uppercase tracking-[0.2em] text-slate-100">{group.label}</span>
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
