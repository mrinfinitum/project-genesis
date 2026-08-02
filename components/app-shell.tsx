"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Bot,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Compass,
  Cpu,
  Dna,
  FileText,
  FlaskConical,
  Gem,
  GalleryHorizontalEnd,
  Images,
  Landmark,
  Layers3,
  LayoutDashboard,
  Map,
  Menu,
  Monitor,
  Orbit,
  Palette,
  PackageCheck,
  Radar,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StudioCommandPalette } from "@/components/studio-command-palette";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  future?: boolean;
  activePaths?: string[];
  nested?: boolean;
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
    id: "home",
    label: "Home",
    icon: LayoutDashboard,
    items: [
      { href: "/", label: "Universe Command Center", icon: LayoutDashboard, activePaths: ["/"] },
      { href: "/asset-library", label: "Asset Library", icon: PackageCheck },
      { href: "/conceptual-art", label: "Art & Screens", icon: Images },
      { href: "/inspiration-board", label: "Inspiration Board", icon: GalleryHorizontalEnd },
      { href: "/encyclopedia", label: "Encyclopedia", icon: BookOpen },
      { href: "/architecture", label: "Architecture", icon: FileText },
      { href: "/settings#users", label: "Admin Users", icon: ShieldCheck }
    ]
  },
  {
    id: "discoveries",
    label: "Discoveries",
    icon: Compass,
    items: [
      { href: "/discovery", label: "Discovery Library", icon: Compass },
      { href: "/resource-catalog", label: "Resource Library", icon: Gem },
      { href: "/species", label: "Species Library", icon: Dna }
    ]
  },
  {
    id: "universe",
    label: "Universe",
    icon: Orbit,
    items: [
      { href: "/galaxy", label: "Galaxy Library", icon: Star },
      { href: "/sector-map", label: "Galactic Region Library", icon: Map },
      { href: "/star-system-map", label: "Star System Library", icon: Radar },
      { href: "/celestial-bodies", label: "Star Library", icon: CircleDot },
      { href: "/planets", label: "Planet Library", icon: Orbit }
    ]
  },
  {
    id: "environment-composer",
    label: "Environment Composer",
    icon: Layers3,
    items: [
      { href: "/universe-layer-generator", label: "Universe Generator", icon: GalleryHorizontalEnd },
      { href: "/galaxy-layer-generator", label: "Galaxy Generator", icon: GalleryHorizontalEnd },
      { href: "/sector-layer-generator", label: "Galactic Region Generator", icon: GalleryHorizontalEnd },
      { href: "/star-system-layer-generator", label: "Star System Generator", icon: GalleryHorizontalEnd },
      { href: "/planet-generation", label: "Planet Generator", icon: Orbit },
      { href: "/life-generator", label: "Life Generator", icon: Dna },
      { href: "/environment-composer/themes", label: "Themes", icon: WandSparkles },
      { href: "/environment-composer/export", label: "Runtime Export", icon: FileText }
    ]
  },
  {
    id: "creative-production",
    label: "Creative Production",
    icon: Monitor,
    items: [
      { href: "/creative-production/asset-production", label: "Asset Production", icon: PackageCheck },
      { href: "/creative-production/render-hub", label: "Render Hub", icon: WandSparkles },
      { href: "/backgrounds", label: "Background Library", icon: Images },
      { href: "/visual-production", label: "Visual Production Engine", icon: Sparkles },
      { href: "/visual-production/species-plates", label: "Species Plates", icon: Layers3 },
      { href: "/creative-production/design-system", label: "Design System", icon: Palette },
      { href: "/creative-production/design-system/component-library", label: "Component Library", icon: Layers3, nested: true },
      { href: "/creative-production/design-system/screen-templates", label: "Screen Templates", icon: Monitor, nested: true },
      { href: "/creative-production/ui-screens/planet-detail", label: "Planet Detail Screen", icon: Monitor },
      { href: "/creative-production/ui-screens/civilization-operations", label: "Civilization Operations", icon: Monitor }
    ]
  },
  {
    id: "civilization",
    label: "Civilization",
    icon: Landmark,
    items: [
      { href: "/buildings", label: "Building Library", icon: Building2 },
      { href: "/research", label: "Research Library", icon: FlaskConical },
      { href: "/upgrades", label: "Upgrade Library", icon: WandSparkles },
      { href: "/population", label: "Population", icon: Landmark },
      { href: "/economy", label: "Economy & Trade", icon: BadgeDollarSign },
      { href: "/ai-agents", label: "AI Agent Libraries", icon: Bot }
    ]
  },
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
  if (/layer-generator/.test(pathname)) return "assets";
  if (/environment-composer/.test(pathname)) return "assets";
  if (/asset/.test(pathname)) return "assets";
  if (/discovery/.test(pathname)) return "discovery";
  if (/galaxy|sector|star|planet|civilization|universe/.test(pathname)) return "universe";
  if (/research|resource|building|ai-agents/.test(pathname)) return "research";
  if (/economy|population|colonies|missions|dynamic-events|actions/.test(pathname)) return "civilization";
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const currentSearchParams = useMemo(() => new URLSearchParams(currentSearch), [currentSearch]);
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");
  const activeGroup = useMemo(() => activeGroupForPath(pathname), [pathname]);
  const environment = useMemo(() => workspaceEnvironmentForPath(pathname), [pathname]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => uniqueSections(["home", "universe", activeGroup?.id]));

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

    const defaults = uniqueSections(["home", "universe", activeGroup?.id]);
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

  function renderNavigationPanel(mobile = false) {
    return (
      <>
        <Link href="/" scroll={false} className="mb-6 flex items-center gap-3" onClick={() => mobile && setMobileNavOpen(false)}>
          <span className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/35 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,0.14)]">
            <Cpu className="h-5 w-5 text-cyan-200" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Project</span>
            <span className="block text-xl font-bold text-white">Genesis Studio</span>
          </span>
        </Link>
        <nav className={cn("space-y-2 overflow-y-auto pr-1", mobile ? "max-h-[calc(100vh-6rem)]" : "h-[calc(100vh-7rem)]")}>
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
                          scroll={false}
                          onClick={() => {
                            setCurrentSearch(hrefSearch(item.href ?? "") ? `?${hrefSearch(item.href ?? "")}` : "");
                            if (mobile) setMobileNavOpen(false);
                          }}
                          className={cn(
                            "flex h-8 items-center gap-3 rounded-md border border-transparent px-2 text-sm font-semibold text-slate-400 transition hover:border-cyan-300/20 hover:bg-cyan-300/10 hover:text-cyan-50",
                            item.nested && "ml-4 h-7 text-xs",
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
      </>
    );
  }

  return (
    <div data-studio-environment={environment} className="studio-cinematic-shell min-h-screen bg-genesis-void text-slate-100">
      <aside className="studio-material-navigation fixed inset-y-0 left-0 z-20 hidden w-80 px-4 py-5 lg:block">
        {renderNavigationPanel()}
      </aside>

      <div className="lg:pl-80">
        <header className="sticky top-0 z-10 border-b border-cyan-400/10 bg-[#06111f]/68 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Universe Creation Studio</p>
              <h1 className="text-lg font-semibold text-white">Project Genesis Studio</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-green-300/25 bg-green-300/10 px-3 py-1 text-green-200">Studio Online</span>
              <span className="hidden rounded-full border border-cyan-300/20 px-3 py-1 sm:inline-flex">v0.1.0</span>
            </div>
          </div>
        </header>
        <main className="studio-orbital-grid min-h-[calc(100vh-4rem)] px-5 py-8 lg:px-10">{children}</main>
      </div>
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
          <aside className="studio-material-navigation relative h-full w-[min(22rem,calc(100vw-2rem))] overflow-hidden px-4 py-5 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md border border-cyan-300/20 bg-slate-950/70 text-slate-200"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            {renderNavigationPanel(true)}
          </aside>
        </div>
      ) : null}
      <StudioCommandPalette />
    </div>
  );
}
