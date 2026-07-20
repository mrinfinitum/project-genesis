import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  Building2,
  CircleAlert,
  Database,
  Gem,
  ImageIcon,
  Orbit,
  Search,
  Sparkles,
} from "lucide-react";
import type { DashboardMetric, DataHealthCheck } from "@/types/schema";

export type DashboardLibraryStat = {
  label: string;
  href: string;
  count: number;
  ready: number;
};

export type DashboardContentStat = {
  label: string;
  count: number;
  complete: number;
  href: string;
};

export type DashboardAssetStat = {
  label: string;
  value: number;
};

type CommandCenterDashboardProps = {
  healthChecks: DataHealthCheck[];
  metrics: DashboardMetric[];
  totalRecords: number;
  libraryStats: DashboardLibraryStat[];
  contentStats: DashboardContentStat[];
  assetStats: DashboardAssetStat[];
};

type FocusStat = {
  label: string;
  description: string;
  href: string;
  count: number;
  ready: number;
  icon: typeof Gem;
  tone: "cyan" | "amber" | "emerald" | "rose";
};

const toneStyles = {
  cyan: {
    icon: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
    bar: "bg-cyan-300",
    value: "text-cyan-100",
  },
  amber: {
    icon: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    bar: "bg-amber-300",
    value: "text-amber-100",
  },
  emerald: {
    icon: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
    bar: "bg-emerald-300",
    value: "text-emerald-100",
  },
  rose: {
    icon: "border-rose-300/25 bg-rose-300/10 text-rose-200",
    bar: "bg-rose-300",
    value: "text-rose-100",
  },
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return clampPercent(Math.round((part / total) * 100));
}

function metricValue(metrics: DashboardMetric[], name: string, fallback: string) {
  return metrics.find((metric) => metric.metric_name === name)?.metric_value ?? fallback;
}

function findContent(stats: DashboardContentStat[], label: string) {
  return stats.find((stat) => stat.label === label);
}

function findLibrary(stats: DashboardLibraryStat[], label: string) {
  return stats.find((stat) => stat.label === label);
}

function FocusMetricCard({ stat }: { stat: FocusStat }) {
  const readiness = percent(stat.ready, stat.count);
  const Icon = stat.icon;
  const tone = toneStyles[stat.tone];

  return (
    <Link
      href={stat.href}
      className="group flex min-h-40 flex-col rounded-md border border-slate-700/70 bg-[#07101f]/80 p-4 transition hover:border-cyan-300/35 hover:bg-[#0a1728] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${tone.icon}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-cyan-200" aria-hidden="true" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{stat.label}</div>
          <div className={`mt-1 text-3xl font-black ${tone.value}`}>{stat.count.toLocaleString()}</div>
        </div>
        <div className="pb-1 text-right text-xs text-slate-500">{readiness}% ready</div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${readiness}%` }} />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{stat.description}</p>
    </Link>
  );
}

const quickActions = [
  { label: "Generate Planet", href: "/planet-generation", icon: Sparkles },
  { label: "Search Encyclopedia", href: "/encyclopedia", icon: Search },
  { label: "Browse Assets", href: "/asset-library", icon: ImageIcon },
  { label: "Open Discoveries", href: "/discovery", icon: BookOpen },
];

export function CommandCenterDashboard({
  healthChecks,
  metrics,
  totalRecords,
  libraryStats,
  contentStats,
  assetStats,
}: CommandCenterDashboardProps) {
  const openIssues = healthChecks.filter((check) => !check.resolved);
  const criticalIssues = openIssues.filter((check) => check.severity === "Critical").length;
  const databaseVersion = metricValue(metrics, "Database Version", "v0.4.0");
  const discoveryStat = findLibrary(libraryStats, "Discovery Library");
  const resourceStat = findContent(contentStats, "Resources");
  const upgradeStat = findContent(contentStats, "Upgrades");
  const buildingStat = findContent(contentStats, "Buildings");
  const readyLibraryRecords = libraryStats.reduce((sum, stat) => sum + stat.ready, 0);
  const libraryRecords = libraryStats.reduce((sum, stat) => sum + stat.count, 0);
  const readyContentRecords = contentStats.reduce((sum, stat) => sum + stat.complete, 0);
  const contentRecords = contentStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalAssetRecords = assetStats.find((stat) => stat.label === "Total Assets")?.value ?? 0;
  const maxContentCount = Math.max(1, ...contentStats.map((stat) => stat.count), discoveryStat?.count ?? 0);
  const maxLibraryCount = Math.max(1, ...libraryStats.map((stat) => stat.count));
  const focusStats: FocusStat[] = [
    {
      label: "Resources",
      description: "Canonical materials, compounds, energy, and manufactured goods.",
      href: resourceStat?.href ?? "/resource-catalog",
      count: resourceStat?.count ?? 0,
      ready: resourceStat?.complete ?? 0,
      icon: Gem,
      tone: "cyan",
    },
    {
      label: "Upgrades",
      description: "Civilization capabilities across workforce, industry, science, and technology.",
      href: upgradeStat?.href ?? "/upgrades",
      count: upgradeStat?.count ?? 0,
      ready: upgradeStat?.complete ?? 0,
      icon: Boxes,
      tone: "amber",
    },
    {
      label: "Buildings",
      description: "Infrastructure, production, research, utility, and settlement records.",
      href: buildingStat?.href ?? "/buildings",
      count: buildingStat?.count ?? 0,
      ready: buildingStat?.complete ?? 0,
      icon: Building2,
      tone: "emerald",
    },
    {
      label: "Discoveries",
      description: "Biological, geological, relic, technology, and structural curiosities.",
      href: discoveryStat?.href ?? "/discovery",
      count: discoveryStat?.count ?? 0,
      ready: discoveryStat?.ready ?? 0,
      icon: Orbit,
      tone: "rose",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-md border border-cyan-300/20 bg-[#050c17]/95">
        <div className="absolute inset-y-0 right-0 hidden w-2/5 border-l border-cyan-300/10 bg-cyan-300/[0.025] lg:block" aria-hidden="true" />
        <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.25fr_0.75fr] lg:p-9">
          <div className="min-w-0">
            <div className="max-w-[34rem]">
              <Image
                src="/brand/noveris-wordmark.svg"
                alt="NOVERIS"
                width={1040}
                height={118}
                priority
                className="h-auto w-full"
              />
            </div>
            <div className="mt-7 flex items-center gap-3">
              <span className="h-px w-10 bg-cyan-300/70" />
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Canonical Universe Studio</p>
            </div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Universe Command Center</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              A live view of the worlds, systems, content, and discoveries that define the NOVERIS universe.
            </p>
          </div>

          <div className="grid content-center gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="border-l-2 border-cyan-300/60 pl-4">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">Canonical Records</div>
              <div className="mt-1 text-3xl font-black text-white">{totalRecords.toLocaleString()}</div>
            </div>
            <div className="border-l-2 border-emerald-300/50 pl-4">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">Content Readiness</div>
              <div className="mt-1 text-3xl font-black text-white">{percent(readyContentRecords, contentRecords)}%</div>
            </div>
            <div className="border-l-2 border-amber-300/50 pl-4">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">Critical Issues</div>
              <div className="mt-1 text-3xl font-black text-white">{criticalIssues}</div>
            </div>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-cyan-300/10 px-5 py-3 text-xs text-slate-500 sm:px-7 lg:px-9">
          <span>Database {databaseVersion}</span>
          <span>{libraryRecords.toLocaleString()} universe records</span>
          <span>{totalAssetRecords.toLocaleString()} art and asset records</span>
          <span className={openIssues.length ? "text-amber-200" : "text-emerald-200"}>{openIssues.length ? `${openIssues.length} health checks open` : "All systems nominal"}</span>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Game Content</p>
            <h2 className="mt-1 text-xl font-black text-white">Canonical systems at a glance</h2>
          </div>
          <Link href="/encyclopedia" className="hidden text-xs font-bold text-slate-400 transition hover:text-cyan-200 sm:inline-flex">
            Open Encyclopedia
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {focusStats.map((stat) => <FocusMetricCard key={stat.label} stat={stat} />)}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border border-slate-700/70 bg-[#07101f]/80 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Content Distribution</p>
              <h2 className="mt-1 text-xl font-black text-white">Authored game systems</h2>
            </div>
            <Database className="h-5 w-5 text-slate-600" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-4">
            {contentStats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="group grid grid-cols-[7rem_1fr_auto] items-center gap-3 sm:grid-cols-[9rem_1fr_auto]">
                <span className="truncate text-sm font-bold text-slate-300 group-hover:text-white">{stat.label}</span>
                <span className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <span
                    className="block h-full rounded-full bg-cyan-300/70 transition group-hover:bg-cyan-200"
                    style={{ width: `${Math.max(2, percent(stat.count, maxContentCount))}%` }}
                  />
                </span>
                <span className="w-14 text-right text-sm font-black text-white">{stat.count.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-700/70 bg-[#07101f]/80 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Universe Inventory</p>
              <h2 className="mt-1 text-xl font-black text-white">Generated libraries</h2>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-white">{percent(readyLibraryRecords, libraryRecords)}%</div>
              <div className="text-[0.65rem] uppercase tracking-[0.15em] text-slate-600">ready</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
            {libraryStats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="group rounded-md border border-slate-700/60 bg-slate-950/35 p-3 hover:border-cyan-300/30">
                <div className="truncate text-xs font-bold text-slate-400 group-hover:text-cyan-100">{stat.label.replace(" Library", "")}</div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <span className="text-xl font-black text-white">{stat.count.toLocaleString()}</span>
                  <span className="text-[0.65rem] text-slate-600">{percent(stat.ready, stat.count)}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-emerald-300/70" style={{ width: `${percent(stat.ready, stat.count)}%` }} />
                </div>
                <div className="mt-2 h-0.5 rounded-full bg-cyan-300/15">
                  <div className="h-full rounded-full bg-cyan-300/50" style={{ width: `${Math.max(3, percent(stat.count, maxLibraryCount))}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="rounded-md border border-slate-700/70 bg-[#07101f]/80 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">Art Inventory</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
            {assetStats.map((stat) => (
              <div key={stat.label} className="border-l border-slate-700 pl-3">
                <div className="text-2xl font-black text-white">{stat.value.toLocaleString()}</div>
                <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-stretch gap-2 lg:max-w-[36rem]">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex min-h-20 min-w-[10rem] flex-1 items-center gap-3 rounded-md border border-slate-700/70 bg-[#07101f]/80 px-4 text-sm font-bold text-slate-300 transition hover:border-cyan-300/35 hover:text-white"
              >
                <Icon className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </section>

      {criticalIssues > 0 ? (
        <Link href="/architecture" className="flex items-center justify-between gap-4 rounded-md border border-rose-300/25 bg-rose-300/[0.06] px-4 py-3 text-sm">
          <span className="flex items-center gap-3 font-bold text-rose-100">
            <CircleAlert className="h-4 w-4" aria-hidden="true" />
            {criticalIssues} critical project {criticalIssues === 1 ? "issue requires" : "issues require"} attention
          </span>
          <ArrowUpRight className="h-4 w-4 text-rose-200" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
