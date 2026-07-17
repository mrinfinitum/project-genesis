import type { DashboardMetric, DataHealthCheck, ProjectSystem } from "@/types/schema";

type CommandCenterDashboardProps = {
  systems: ProjectSystem[];
  healthChecks: DataHealthCheck[];
  metrics: DashboardMetric[];
  totalRecords: number;
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function metricValue(metrics: DashboardMetric[], name: string, fallback: string) {
  return metrics.find((metric) => metric.metric_name === name)?.metric_value ?? fallback;
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

export function CommandCenterDashboard({ systems, healthChecks, metrics, totalRecords }: CommandCenterDashboardProps) {
  const overallCompletion = systems.length
    ? Math.round(systems.reduce((sum, system) => sum + system.completion_percent, 0) / systems.length)
    : 0;
  const criticalIssues = healthChecks.filter((check) => !check.resolved && check.severity === "Critical").length;
  const heroMetrics = [
    { label: "Current Sprint", value: metricValue(metrics, "Current Sprint", "Sprint 0 Universe Foundation") },
    { label: "Database Version", value: metricValue(metrics, "Database Version", "v0.4.0") },
    { label: "Total Records", value: totalRecords.toLocaleString() },
    { label: "Critical Issues", value: String(criticalIssues) }
  ];

  return (
    <section className="overflow-hidden rounded-md border border-cyan-300/20 bg-[#07101f]/90 shadow-[0_0_60px_rgba(56,213,255,0.12)]">
      <div className="grid gap-6 p-5 lg:grid-cols-[220px_1fr] lg:p-7">
        <div className="flex justify-center lg:justify-start">
          <OverallCompletionRing value={overallCompletion} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Studio Mission Control</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">Project Genesis Command Center</h2>
          <p className="mt-3 max-w-3xl text-base text-slate-300">
            Quiet overview for canonical content, records, and project health. Detailed workflows live in their dedicated workspaces.
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
  );
}
