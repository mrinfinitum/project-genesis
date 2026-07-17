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
  Eye,
  FileCode2,
  FileCheck2,
  FileText,
  FlaskConical,
  Gauge,
  Gem,
  GitBranch,
  History,
  Landmark,
  Layers3,
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
  Route,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StudioCommandPalette } from "@/components/studio-command-palette";
import { cn } from "@/lib/utils";

type StudioHealthMetric = {
  id: "content" | "art";
  label: string;
  percent: number;
  href: string;
  tooltip: string;
  details: string[];
};

type StudioHealthCheck = {
  id: "exports" | "verification" | "build" | "runtime";
  label: string;
  ok: boolean;
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
    id: "experience-design",
    label: "Experience Design",
    icon: Palette,
    items: [
      { href: "/experience-design", label: "Dashboard", icon: Palette },
      { href: "/experience-design/bible", label: "Experience Bible", icon: BookOpen },
      { href: "/experience-design/inspiration-boards", label: "Inspiration Boards", icon: Palette },
      { href: "/experience-design/concepts", label: "Concept Library", icon: Sparkles },
      { href: "/experience-design/screens", label: "Screen Library", icon: MonitorCog },
      { href: "/experience-design/tokens", label: "Design Tokens", icon: CopyPlus },
      { href: "/experience-design/materials", label: "Material Library", icon: Layers3 },
      { href: "/experience-design/motion", label: "Motion Library", icon: Orbit },
      { href: "/experience-design/components", label: "Component Library", icon: Network },
      { href: "/experience-design/patterns", label: "Interaction Patterns", icon: Route },
      { href: "/experience-design/themes", label: "Theme Library", icon: Palette },
      { href: "/experience-design/brand", label: "Brand System", icon: ShieldCheck },
      { href: "/experience-design/accessibility", label: "Accessibility", icon: Eye },
      { href: "/experience-design/journey", label: "Experience Journey", icon: Compass },
      { href: "/experience-design/reviews", label: "Reviews", icon: FileCheck2 }
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

function workspaceEnvironmentForPath(pathname: string) {
  if (/experience-design|architecture/.test(pathname)) return "experience";
  if (/asset|component-library|screen-designer|visual-screen-builder/.test(pathname)) return "assets";
  if (/discovery/.test(pathname)) return "discovery";
  if (/galaxy|sector|star|planet|civilization|universe/.test(pathname)) return "universe";
  if (/research|resource|building|ai-agents/.test(pathname)) return "research";
  if (/economy|population|colonies|missions|dynamic-events|actions/.test(pathname)) return "civilization";
  if (/runtime|export|validation|database/.test(pathname)) return "runtime";
  return "command";
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
  return metric.id === "content" ? "Content Readiness" : "Art Production";
}

function StatusText({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "font-semibold",
        ok === false ? "text-amber-200" : "text-slate-500"
      )}
    >
      {children}
    </span>
  );
}

function StudioHealthPanel({ metrics, checks, status }: { metrics: StudioHealthMetric[]; checks: StudioHealthCheck[]; status?: StudioStatus }) {
  return (
    <section className="mb-3 border-y border-cyan-400/10 py-2.5" aria-label="Studio health and status">
      <div className="space-y-0.5 text-[0.64rem] leading-4 text-slate-600">
        <p className="truncate">
          <StatusText ok={status?.studioOnline ?? true}>{status?.studioOnline ? "Studio Online" : "Studio Offline"}</StatusText>
          <span className="px-1.5 text-slate-700">/</span>
          <span>v{status?.contentVersion ?? "..."}</span>
          <span className="px-1.5 text-slate-700">/</span>
          <span>Arch {status?.architectureVersion ?? "..."}</span>
        </p>
        <p className="truncate">
          <StatusText ok={status?.runtimeReady ?? true}>{status?.runtimeReady ? "Runtime Ready" : "Runtime Issue"}</StatusText>
          <span className="px-1.5 text-slate-700">/</span>
          <StatusText ok={status?.gitClean ?? true}>{status?.gitClean ? "Git Clean" : "Git Dirty"}</StatusText>
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {metrics.length ? metrics.map((metric) => {
          const alert = metric.percent < 50;
          return (
            <Link key={metric.id} href={metric.href} title={`${metric.tooltip} ${metric.details.join(" ")}`} className="group block rounded-sm text-slate-500 transition hover:text-slate-200">
              <span className="flex items-center justify-between gap-3 text-[0.68rem]">
                <span className="truncate font-semibold uppercase tracking-[0.16em]">{metricLabel(metric)}</span>
                <span className={cn("font-semibold tabular-nums", alert ? "text-amber-200" : "text-slate-400")}>{metric.percent}%</span>
              </span>
              <span className="mt-1 block h-0.5 overflow-hidden rounded-full bg-slate-800/80">
                <span className={cn("block h-full rounded-full transition-all", healthLineClass(metric.percent))} style={{ width: `${Math.max(0, Math.min(100, metric.percent))}%` }} />
              </span>
            </Link>
          );
        }) : (
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-600">Calculating health...</p>
        )}
      </div>

      {checks.length ? (
        <div className="mt-2 space-y-1 border-t border-cyan-400/10 pt-2">
          {checks.map((check) => (
            <Link
              key={check.id}
              href={check.href}
              title={`${check.tooltip} ${check.details.join(" ")}`}
              aria-label={`${check.label}: ${check.ok ? "healthy" : "needs attention"}`}
              className={cn(
                "flex items-center justify-between gap-2 rounded-sm text-[0.66rem] font-semibold leading-4 transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan-300/50",
                check.ok ? "text-slate-500 hover:text-slate-300" : "text-amber-200 hover:text-amber-100"
              )}
            >
              <span className="truncate">{check.label}</span>
              <span aria-hidden="true">{check.ok ? "OK" : "!"}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState("");
  const currentSearchParams = useMemo(() => new URLSearchParams(currentSearch), [currentSearch]);
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");
  const activeGroup = useMemo(() => activeGroupForPath(pathname), [pathname]);
  const environment = useMemo(() => workspaceEnvironmentForPath(pathname), [pathname]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => uniqueSections(["command-center", activeGroup?.id]));
  const [healthMetrics, setHealthMetrics] = useState<StudioHealthMetric[]>([]);
  const [healthChecks, setHealthChecks] = useState<StudioHealthCheck[]>([]);
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
      .then((payload: { status?: StudioStatus; metrics?: StudioHealthMetric[]; checks?: StudioHealthCheck[] } | null) => {
        if (!cancelled && payload?.metrics) {
          setHealthMetrics(payload.metrics);
          setHealthChecks(payload.checks ?? []);
          setStudioStatus(payload.status);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHealthMetrics([]);
          setHealthChecks([]);
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
    <div data-studio-environment={environment} className="studio-cinematic-shell min-h-screen bg-genesis-void text-slate-100">
      <aside className="studio-material-navigation fixed inset-y-0 left-0 z-20 hidden w-80 px-4 py-5 lg:block">
        <Link href="/" className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/35 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,0.14)]">
            <Cpu className="h-5 w-5 text-cyan-200" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Project</span>
            <span className="block text-xl font-bold text-white">Genesis Studio</span>
          </span>
        </Link>
        <StudioHealthPanel metrics={healthMetrics} checks={healthChecks} status={studioStatus} />

        <nav className="h-[calc(100vh-14.5rem)] space-y-2 overflow-y-auto pr-1">
          {navigationGroups.map((group) => {
            const Icon = group.icon;
            const expanded = expandedGroups.includes(group.id);
            const groupActive = activeGroup?.id === group.id;

            return (
              <section
                key={group.id}
                className={cn(
                  "rounded-md border border-cyan-400/10 bg-slate-950/20 transition",
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
        <header className="sticky top-0 z-10 border-b border-cyan-400/10 bg-[#06111f]/68 backdrop-blur-xl">
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
        <main className="studio-orbital-grid min-h-[calc(100vh-4rem)] px-5 py-8 lg:px-10">{children}</main>
      </div>
      <StudioCommandPalette />
    </div>
  );
}
