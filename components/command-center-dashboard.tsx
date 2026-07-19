import Link from "next/link";
import type { DashboardMetric, DataHealthCheck, ProjectSystem } from "@/types/schema";

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
  systems: ProjectSystem[];
  healthChecks: DataHealthCheck[];
  metrics: DashboardMetric[];
  totalRecords: number;
  libraryStats: DashboardLibraryStat[];
  contentStats: DashboardContentStat[];
  assetStats: DashboardAssetStat[];
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function metricValue(metrics: DashboardMetric[], name: string, fallback: string) {
  return metrics.find((metric) => metric.metric_name === name)?.metric_value ?? fallback;
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return clampPercent(Math.round((part / total) * 100));
}

function ShortBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-cyan-300/10">
      <div className="h-full rounded-full bg-cyan-300/70" style={{ width: `${clampPercent(value)}%` }} />
    </div>
  );
}

function OverallCompletionRing({ value, size = 178 }: { value: number; size?: number }) {
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampPercent(value) / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(56, 213, 255, 0.12)" strokeWidth="12" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#overallRing)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="12"
          className="drop-shadow-[0_0_16px_rgba(56,213,255,0.65)] transition-all duration-700"
        />
        <defs>
          <linearGradient id="overallRing" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#67e8f9" />
            <stop offset="1" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <div className="text-4xl font-black text-white">{Math.round(value)}%</div>
        <div className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">Complete</div>
      </div>
    </div>
  );
}

const creationActions = [
  { label: "Generate Planet", href: "/planet-generation", description: "Create a new planet, subclass prompt, and render-ready art brief." },
  { label: "Open Planet Library", href: "/planets", description: "Browse generated planets and Sol bodies with artwork." },
  { label: "Generate Galaxy", href: "/galaxy", description: "Create or expand canonical galaxy records." },
  { label: "Generate Research", href: "/research", description: "Draft research records with dependencies and prompts." },
  { label: "Generate Building", href: "/buildings", description: "Create civilization building records and art requirements." },
  { label: "Open Asset Library", href: "/asset-library", description: "Browse uploaded art and canonical asset records." }
];

export function CommandCenterDashboard({ systems, healthChecks, metrics, totalRecords, libraryStats, contentStats, assetStats }: CommandCenterDashboardProps) {
  const overallCompletion = systems.length
    ? Math.round(systems.reduce((sum, system) => sum + system.completion_percent, 0) / systems.length)
    : 0;
  const openIssues = healthChecks.filter((check) => !check.resolved);
  const criticalIssues = openIssues.filter((check) => check.severity === "Critical").length;
  const readyLibraryRecords = libraryStats.reduce((sum, stat) => sum + stat.ready, 0);
  const libraryRecords = libraryStats.reduce((sum, stat) => sum + stat.count, 0);
  const maxLibraryCount = Math.max(1, ...libraryStats.map((stat) => stat.count));
  const maxContentCount = Math.max(1, ...contentStats.map((stat) => stat.count));
  const maxAssetValue = Math.max(1, ...assetStats.map((stat) => stat.value));
  const heroMetrics = [
    { label: "Database Version", value: metricValue(metrics, "Database Version", "v0.4.0") },
    { label: "Total Records", value: totalRecords.toLocaleString() },
    { label: "Library Records", value: libraryRecords.toLocaleString() },
    { label: "Critical Issues", value: String(criticalIssues) }
  ];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-md border border-cyan-300/20 bg-[#07101f]/90 shadow-[0_0_60px_rgba(56,213,255,0.12)]">
        <div className="grid gap-6 p-5 lg:grid-cols-[220px_1fr] lg:p-7">
          <div className="flex justify-center lg:justify-start">
            <OverallCompletionRing value={overallCompletion} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Universe Creation Studio</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">Universe Command Center</h2>
            <p className="mt-3 max-w-3xl text-base text-slate-300">
              Create, generate, explore, and open canonical worlds. Architecture stays available, but creation is the first experience again.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-md border border-cyan-400/15 bg-slate-950/45 p-3">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{metric.label}</div>
                  <div className="mt-2 min-h-10 text-xl font-bold text-white">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101f]/80 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Continue Creating</p>
            <h3 className="mt-2 text-2xl font-black text-white">What do you want to make next?</h3>
          </div>
          <Link href="/planet-generation" className="inline-flex h-10 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20">
            Generate Planet
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {creationActions.map((action) => (
            <Link key={action.href} href={action.href} className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-4 transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
              <div className="text-lg font-black text-white">{action.label}</div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-md border border-cyan-300/15 bg-[#07101f]/80 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Generated Libraries</p>
              <h3 className="mt-2 text-2xl font-black text-white">Canonical Record Coverage</h3>
            </div>
            <div className="text-right text-sm text-slate-400">
              <span className="block text-xl font-black text-white">{percent(readyLibraryRecords, libraryRecords)}%</span>
              ready
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {libraryStats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3 transition hover:border-cyan-300/35 hover:bg-cyan-300/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-white">{stat.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{stat.ready.toLocaleString()} ready / {stat.count.toLocaleString()} records</div>
                  </div>
                  <div className="text-xl font-black text-cyan-100">{stat.count.toLocaleString()}</div>
                </div>
                <div className="mt-3 grid h-10 grid-cols-[1fr_auto] items-end gap-3">
                  <div className="flex h-full items-end gap-1">
                    <span className="w-full rounded-t bg-cyan-300/20" style={{ height: `${Math.max(10, percent(stat.count, maxLibraryCount))}%` }} />
                    <span className="w-full rounded-t bg-emerald-300/50" style={{ height: `${Math.max(10, percent(stat.ready, maxLibraryCount))}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{percent(stat.ready, stat.count)}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-300/15 bg-[#07101f]/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Health</p>
          <h3 className="mt-2 text-2xl font-black text-white">Open Issues</h3>
          <div className="mt-4 grid gap-3">
            {["Critical", "High", "Medium", "Low"].map((severity) => {
              const count = openIssues.filter((check) => check.severity === severity).reduce((sum, check) => sum + Math.max(1, check.affected_count), 0);
              return (
                <div key={severity} className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-bold text-white">{severity}</span>
                    <span className="font-black text-slate-300">{count}</span>
                  </div>
                  <ShortBar value={percent(count, Math.max(1, openIssues.reduce((sum, check) => sum + Math.max(1, check.affected_count), 0)))} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-md border border-cyan-300/15 bg-[#07101f]/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Content Libraries</p>
          <h3 className="mt-2 text-2xl font-black text-white">Authoring Readiness</h3>
          <div className="mt-5 space-y-3">
            {contentStats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="grid gap-2 rounded-md border border-cyan-300/10 bg-slate-950/35 p-3 transition hover:border-cyan-300/35 hover:bg-cyan-300/10">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-bold text-white">{stat.label}</span>
                  <span className="text-slate-400">{stat.complete.toLocaleString()} / {stat.count.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-[1fr_3rem] items-center gap-3">
                  <div className="h-2 overflow-hidden rounded-full bg-cyan-300/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${percent(stat.complete, stat.count)}%` }} />
                  </div>
                  <span className="text-right text-xs font-black text-cyan-100">{percent(stat.complete, stat.count)}%</span>
                </div>
                <div className="h-8 rounded bg-cyan-300/10" style={{ width: `${Math.max(8, percent(stat.count, maxContentCount))}%` }} />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-300/15 bg-[#07101f]/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Asset Library</p>
          <h3 className="mt-2 text-2xl font-black text-white">Art Pipeline Snapshot</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {assetStats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
                <div className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
                <div className="mt-2 text-2xl font-black text-white">{stat.value.toLocaleString()}</div>
                <div className="mt-3 h-14 overflow-hidden rounded bg-cyan-300/10">
                  <div className="h-full rounded-r bg-cyan-300/30" style={{ width: `${Math.max(8, percent(stat.value, maxAssetValue))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
