"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive,
  Atom,
  Bot,
  Building2,
  CircleDot,
  Compass,
  Database,
  Download,
  FileText,
  Fingerprint,
  FlaskConical,
  Gem,
  GitBranch,
  History,
  Image,
  Landmark,
  Layers,
  ListChecks,
  Map as MapIcon,
  Orbit,
  Package,
  Palette,
  Pickaxe,
  Rocket,
  Scroll,
  Sparkles,
  Sun,
  TriangleAlert,
  TrendingUp,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { CodexReadinessItem, DashboardMetric, DataHealthCheck, ProjectSystem, ProjectSystemHistory } from "@/types/schema";

type CommandCenterDashboardProps = {
  systems: ProjectSystem[];
  history: ProjectSystemHistory[];
  healthChecks: DataHealthCheck[];
  codexItems: CodexReadinessItem[];
  metrics: DashboardMetric[];
  totalRecords: number;
};

const groupOrder = ["Core Foundation", "Planet Generation", "Gameplay Database", "Galaxy Content", "Production"];

const iconMap: Record<string, LucideIcon> = {
  Archive,
  Atom,
  Bot,
  Building2,
  CircleDot,
  Compass,
  Database,
  Download,
  FileText,
  Fingerprint,
  FlaskConical,
  Gem,
  GitBranch,
  History,
  Image,
  Landmark,
  Layers,
  ListChecks,
  Map: MapIcon,
  Orbit,
  Package,
  Palette,
  Pickaxe,
  Rocket,
  Scroll,
  Sparkles,
  Sun,
  TriangleAlert,
  TrendingUp
};

const severityStyles: Record<string, string> = {
  Low: "border-blue-300/35 bg-blue-400/10 text-blue-100",
  Medium: "border-yellow-300/35 bg-yellow-400/10 text-yellow-100",
  High: "border-orange-300/35 bg-orange-400/10 text-orange-100",
  Critical: "border-red-300/40 bg-red-400/10 text-red-100"
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function metricValue(metrics: DashboardMetric[], name: string, fallback: string) {
  return metrics.find((metric) => metric.metric_name === name)?.metric_value ?? fallback;
}

function priorityRank(priority: string) {
  return { Critical: 0, High: 1, Medium: 2, Low: 3 }[priority] ?? 4;
}

function OverallCompletionRing({ value, size = 178 }: { value: number; size?: number }) {
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampPercent(value) / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
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

function MiniRing({ value }: { value: number }) {
  const size = 58;
  const radius = 23;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampPercent(value) / 100) * circumference;

  return (
    <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148, 163, 184, 0.18)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#67e8f9"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth="6"
        className="drop-shadow-[0_0_10px_rgba(103,232,249,0.55)]"
      />
    </svg>
  );
}

function GlowingProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-900 ring-1 ring-cyan-400/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 shadow-[0_0_18px_rgba(56,213,255,0.55)] transition-all duration-700"
        style={{ width: `${clampPercent(value)}%` }}
      />
    </div>
  );
}

function MiniSparkline({ points }: { points: ProjectSystemHistory[] }) {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.length ? sorted.map((point) => clampPercent(point.completion_percent)) : [0, 0];
  const path = values
    .map((value, index) => {
      const x = values.length === 1 ? 100 : (index / (values.length - 1)) * 100;
      const y = 30 - (value / 100) * 26;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="h-9 w-full" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" stroke="rgba(56, 213, 255, 0.2)" strokeWidth="8" points={path} strokeLinecap="round" strokeLinejoin="round" />
      <polyline fill="none" stroke="#67e8f9" strokeWidth="2.5" points={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusDonut({ systems }: { systems: ProjectSystem[] }) {
  const buckets = [
    { label: "Complete", color: "#5ef2a1", count: systems.filter((system) => system.status === "Complete").length },
    { label: "In Progress", color: "#38d5ff", count: systems.filter((system) => system.status === "In Progress").length },
    { label: "Needs Review", color: "#ffd166", count: systems.filter((system) => system.status === "Needs Review").length },
    { label: "Missing Data", color: "#f97316", count: systems.filter((system) => system.missing_required_fields > 0).length },
    { label: "Blocked", color: "#ff6b6b", count: systems.filter((system) => system.blocked_records > 0).length }
  ];
  const total = Math.max(1, buckets.reduce((sum, bucket) => sum + bucket.count, 0));
  let cursor = 0;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid gap-4 sm:grid-cols-[120px_1fr] sm:items-center">
      <svg className="-rotate-90" width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="14" />
        {buckets.map((bucket) => {
          const dash = (bucket.count / total) * circumference;
          const segment = (
            <circle
              key={bucket.label}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={bucket.color}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-cursor}
              strokeLinecap="round"
              strokeWidth="14"
            />
          );
          cursor += dash;
          return segment;
        })}
      </svg>
      <div className="grid gap-2">
        {buckets.map((bucket) => (
          <div key={bucket.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: bucket.color }} />
              {bucket.label}
            </span>
            <span className="font-semibold text-white">{bucket.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemHealthBars({ systems }: { systems: ProjectSystem[] }) {
  const average = systems.length
    ? Math.round(systems.reduce((sum, system) => sum + system.completion_percent, 0) / systems.length)
    : 0;
  const totalRecords = Math.max(1, systems.reduce((sum, system) => sum + system.total_records, 0));
  const completeRecords = systems.reduce((sum, system) => sum + system.complete_records, 0);
  const missing = systems.reduce((sum, system) => sum + system.missing_required_fields, 0);
  const codexReady = systems.reduce((sum, system) => sum + system.codex_ready_count, 0);

  const bars = [
    { label: "Content", value: average },
    { label: "Data Quality", value: Math.max(0, 100 - Math.round((missing / totalRecords) * 100)) },
    { label: "Codex Readiness", value: Math.min(100, codexReady * 14) },
    { label: "Assets", value: Math.round((completeRecords / totalRecords) * 100) },
    { label: "Gameplay Integration", value: Math.max(12, average - 8) }
  ];

  return (
    <div className="space-y-4">
      {bars.map((bar) => (
        <div key={bar.label}>
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em]">
            <span className="text-slate-400">{bar.label}</span>
            <span className="text-cyan-100">{bar.value}%</span>
          </div>
          <GlowingProgressBar value={bar.value} />
        </div>
      ))}
    </div>
  );
}

function SystemProgressCard({
  system,
  trend,
  onDetails
}: {
  system: ProjectSystem;
  trend: ProjectSystemHistory[];
  onDetails: (system: ProjectSystem) => void;
}) {
  const Icon = iconMap[system.icon] ?? Database;

  return (
    <article className="group rounded-md border border-cyan-400/15 bg-[#07101f]/85 p-4 shadow-[0_0_32px_rgba(56,213,255,0.08)] transition hover:border-cyan-300/45 hover:shadow-[0_0_42px_rgba(56,213,255,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10">
            <Icon className="h-5 w-5 text-cyan-200" />
          </span>
          <div>
            <h3 className="font-semibold text-white">{system.name}</h3>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">{system.group_name}</p>
          </div>
        </div>
        <MiniRing value={system.completion_percent} />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-cyan-50">{system.completion_percent}% Complete</span>
          <StatusBadge value={system.status} />
        </div>
        <GlowingProgressBar value={system.completion_percent} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <StatTile label="Total" value={system.total_records} />
        <StatTile label="Complete" value={system.complete_records} />
        <StatTile label="Review" value={system.needs_review_records} />
        <StatTile label="Missing" value={system.missing_required_fields} />
      </div>

      <div className="mt-4">
        <MiniSparkline points={trend} />
      </div>

      <p className="mt-4 min-h-10 text-sm leading-5 text-slate-300">{system.next_action}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={cn("rounded-full border px-2.5 py-1 text-xs", severityStyles[system.priority] ?? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100")}>
          {system.priority}
        </span>
        <Button type="button" onClick={() => onDetails(system)}>
          View Details
        </Button>
      </div>
    </article>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-slate-700/70 bg-slate-950/45 p-2.5">
      <div className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-100">{value}</div>
    </div>
  );
}

function NextStepsPanel({ systems }: { systems: ProjectSystem[] }) {
  return (
    <Panel title="Next Production Steps" eyebrow="Priority Queue">
      <div className="space-y-3">
        {[...systems]
          .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.completion_percent - b.completion_percent)
          .slice(0, 5)
          .map((system) => (
            <div key={system.id} className="rounded-md border border-cyan-400/10 bg-slate-950/45 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className={cn("rounded-full border px-2 py-0.5 text-xs", severityStyles[system.priority] ?? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100")}>
                  {system.priority}
                </span>
                <span className="text-xs text-slate-500">{system.group_name}</span>
              </div>
              <h4 className="mt-3 text-sm font-semibold text-white">{system.name}</h4>
              <p className="mt-1 text-sm text-slate-300">{system.next_action}</p>
              <p className="mt-2 text-xs text-cyan-200">Impact: unlocks downstream {system.group_name.toLowerCase()} work.</p>
              <Button className="mt-3 w-full" type="button">
                Create Task
              </Button>
            </div>
          ))}
      </div>
    </Panel>
  );
}

function DataHealthPanel({ checks }: { checks: DataHealthCheck[] }) {
  return (
    <Panel title="Data Health" eyebrow="Warnings">
      <div className="space-y-3">
        {checks.filter((check) => !check.resolved).map((check) => (
          <div key={check.id} className="rounded-md border border-cyan-400/10 bg-slate-950/45 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={cn("rounded-full border px-2 py-0.5 text-xs", severityStyles[check.severity] ?? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100")}>
                {check.severity}
              </span>
              <span className="text-xs text-slate-400">{check.affected_count} records</span>
            </div>
            <h4 className="mt-3 text-sm font-semibold text-white">{check.issue}</h4>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-200">{check.system}</p>
            <p className="mt-2 text-sm text-slate-300">{check.recommended_action}</p>
            <Button className="mt-3 w-full" type="button">
              View Records
            </Button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CodexReadinessPanel({ items }: { items: CodexReadinessItem[] }) {
  return (
    <Panel title="Ready for Codex" eyebrow="Handoff Queue">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-cyan-400/10 bg-slate-950/45 p-3">
            <div className="flex items-center justify-between gap-3">
              <StatusBadge value={item.status} />
              <span className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.priority}</span>
            </div>
            <h4 className="mt-3 text-sm font-semibold text-white">{item.title}</h4>
            <p className="mt-1 text-sm text-slate-300">{item.description}</p>
            <p className="mt-2 text-xs text-cyan-200">{item.related_tables.join(", ")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href={item.export_path} className="inline-flex h-9 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm text-cyan-100 hover:bg-cyan-400/20">
                Export
              </Link>
              <Button type="button">Codex Task</Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-cyan-400/15 bg-[#07101f]/85 p-4 shadow-[0_0_36px_rgba(56,213,255,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-bold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SystemDetailModal({
  system,
  trend,
  checks,
  codexItems,
  onClose
}: {
  system: ProjectSystem;
  trend: ProjectSystemHistory[];
  checks: DataHealthCheck[];
  codexItems: CodexReadinessItem[];
  onClose: () => void;
}) {
  const relatedChecks = checks.filter((check) => check.system === system.name);
  const relatedCodex = codexItems.filter((item) => item.system === system.name);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-md border border-cyan-300/25 bg-[#07101f] shadow-[0_0_70px_rgba(56,213,255,0.2)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-cyan-400/15 bg-[#07101f]/95 p-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{system.group_name}</p>
            <h2 className="mt-2 text-2xl font-black text-white">{system.name}</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-300">{system.description}</p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[240px_1fr]">
          <div className="space-y-4">
            <div className="rounded-md border border-cyan-400/15 bg-slate-950/45 p-4">
              <OverallCompletionRing value={system.completion_percent} size={196} />
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-slate-950/45 p-4">
              <MiniSparkline points={trend} />
              <p className="mt-2 text-xs text-slate-400">Recent completion trend</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Total Records" value={system.total_records} />
              <StatTile label="Complete" value={system.complete_records} />
              <StatTile label="Needs Review" value={system.needs_review_records} />
              <StatTile label="Missing Fields" value={system.missing_required_fields} />
              <StatTile label="Blocked" value={system.blocked_records} />
              <StatTile label="Codex Ready" value={system.codex_ready_count} />
            </div>
            <Panel title="Recommended Action" eyebrow="Next Step">
              <p className="text-sm text-slate-300">{system.next_action}</p>
            </Panel>
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Related Health Checks" eyebrow="Risks">
                {relatedChecks.length ? (
                  <div className="space-y-3">
                    {relatedChecks.map((check) => (
                      <p key={check.id} className="text-sm text-slate-300">{check.issue}: {check.recommended_action}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No active checks for this system.</p>
                )}
              </Panel>
              <Panel title="Related Codex Tasks" eyebrow="Handoff">
                {relatedCodex.length ? (
                  <div className="space-y-3">
                    {relatedCodex.map((item) => (
                      <p key={item.id} className="text-sm text-slate-300">{item.title}: {item.status}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No Codex handoff items yet.</p>
                )}
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommandCenterDashboard({ systems, history, healthChecks, codexItems, metrics, totalRecords }: CommandCenterDashboardProps) {
  const [selectedSystem, setSelectedSystem] = useState<ProjectSystem | null>(null);
  const overallCompletion = systems.length
    ? Math.round(systems.reduce((sum, system) => sum + system.completion_percent, 0) / systems.length)
    : 0;
  const groupedSystems = useMemo(
    () =>
      groupOrder.map((groupName) => ({
        groupName,
        systems: systems.filter((system) => system.group_name === groupName)
      })),
    [systems]
  );
  const historyBySystem = useMemo(() => {
    const map = new Map<string, ProjectSystemHistory[]>();
    for (const item of history) {
      map.set(item.system_id, [...(map.get(item.system_id) ?? []), item]);
    }
    return map;
  }, [history]);

  const criticalIssues = healthChecks.filter((check) => !check.resolved && check.severity === "Critical").length;
  const readyForCodex = codexItems.filter((item) => item.status === "Ready").length || Number(metricValue(metrics, "Ready for Codex", "0"));
  const heroMetrics = [
    { label: "Current Sprint", value: metricValue(metrics, "Current Sprint", "Sprint 0 Universe Foundation") },
    { label: "Database Version", value: metricValue(metrics, "Database Version", "v0.4.0") },
    { label: "Total Records", value: totalRecords.toLocaleString() },
    { label: "Critical Issues", value: String(criticalIssues) },
    { label: "Ready for Codex", value: String(readyForCodex) }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-md border border-cyan-300/20 bg-[#07101f]/90 shadow-[0_0_60px_rgba(56,213,255,0.12)]">
        <div className="grid gap-6 p-5 lg:grid-cols-[220px_1fr] lg:p-7">
          <div className="flex justify-center lg:justify-start">
            <OverallCompletionRing value={overallCompletion} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Studio Mission Control</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">Project Genesis Command Center</h2>
            <p className="mt-3 max-w-3xl text-base text-slate-300">
              Track database progress, content readiness, and next production priorities across the entire Project Genesis universe.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr]">
        <Panel title="Status Breakdown" eyebrow="Systems">
          <StatusDonut systems={systems} />
        </Panel>
        <Panel title="System Health" eyebrow="Readiness">
          <SystemHealthBars systems={systems} />
        </Panel>
        <CodexReadinessPanel items={codexItems} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {groupedSystems.map((group) => (
            <section key={group.groupName} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-[0.28em] text-cyan-200">{group.groupName}</h2>
                <span className="h-px flex-1 bg-cyan-400/15" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {group.systems.map((system) => (
                  <SystemProgressCard
                    key={system.id}
                    system={system}
                    trend={historyBySystem.get(system.id) ?? []}
                    onDetails={setSelectedSystem}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="space-y-5">
          <NextStepsPanel systems={systems} />
          <DataHealthPanel checks={healthChecks} />
        </aside>
      </section>

      {selectedSystem ? (
        <SystemDetailModal
          system={selectedSystem}
          trend={historyBySystem.get(selectedSystem.id) ?? []}
          checks={healthChecks}
          codexItems={codexItems}
          onClose={() => setSelectedSystem(null)}
        />
      ) : null}
    </div>
  );
}
