"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Boxes,
  Building2,
  ChartNoAxesCombined,
  Cpu,
  FlaskConical,
  Gem,
  GitBranch,
  LayoutDashboard,
  Rocket,
  Settings,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/research", label: "Research", icon: FlaskConical },
  { href: "/buildings", label: "Buildings", icon: Building2 },
  { href: "/building-relationships", label: "Relationships", icon: GitBranch },
  { href: "/unlock-matrix", label: "Unlock Matrix", icon: GitBranch },
  { href: "/upgrades", label: "Upgrades", icon: ChartNoAxesCombined },
  { href: "/civilizations", label: "Civilizations", icon: Sparkles },
  { href: "/galaxy", label: "Galaxy", icon: Rocket },
  { href: "/collectibles", label: "Collectibles", icon: Gem },
  { href: "/assets", label: "Assets", icon: Archive },
  { href: "/releases", label: "Releases", icon: Boxes },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-genesis-void text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-cyan-400/15 bg-[#07101e]/95 px-4 py-5 shadow-glow backdrop-blur lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/35 bg-cyan-300/10">
            <Cpu className="h-5 w-5 text-cyan-200" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Project</span>
            <span className="block text-xl font-bold text-white">Genesis Studio</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {sections.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-slate-300 transition hover:bg-cyan-300/10 hover:text-white",
                  active && "border border-cyan-300/25 bg-cyan-300/15 text-cyan-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-cyan-400/15 bg-[#07101e]/85 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Internal Content Database</p>
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
