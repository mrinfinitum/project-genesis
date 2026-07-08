import { AlertTriangle, CheckCircle2, Database, FileWarning, ImageOff, KeyRound, Link2Off, ScanSearch } from "lucide-react";
import { getRows } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { DataHealthCheck } from "@/types/schema";

export const dynamic = "force-dynamic";

const validationTypes = [
  { label: "Missing Fields", icon: FileWarning, description: "Required schema fields that are blank or incomplete." },
  { label: "Broken References", icon: Link2Off, description: "Foreign keys, source IDs, or unlock IDs that do not resolve." },
  { label: "Duplicate IDs", icon: KeyRound, description: "Conflicting identifiers that will break exports or Roblox modules." },
  { label: "Missing Assets", icon: ImageOff, description: "Records that need icon, render, landscape, PSD, or asset references." },
  { label: "Missing Prompts", icon: ScanSearch, description: "Creative outputs that are not yet connected to generation prompts." },
  { label: "Export Blockers", icon: Database, description: "Issues that should be fixed before JSON, CSV, or Lua handoff." }
];

const severityStyles: Record<string, string> = {
  Low: "border-blue-300/35 bg-blue-400/10 text-blue-100",
  Medium: "border-yellow-300/35 bg-yellow-400/10 text-yellow-100",
  High: "border-orange-300/35 bg-orange-400/10 text-orange-100",
  Critical: "border-red-300/40 bg-red-400/10 text-red-100"
};

function severityRank(value: string) {
  return { Critical: 0, High: 1, Medium: 2, Low: 3 }[value] ?? 4;
}

export default async function ValidationEnginePage() {
  const checks = ((await getRows("data_health_checks")) as DataHealthCheck[]).sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  const unresolved = checks.filter((check) => !check.resolved);
  const affectedRecords = unresolved.reduce((sum, check) => sum + check.affected_count, 0);
  const critical = unresolved.filter((check) => check.severity === "Critical").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Systems Workflow</p>
          <h1 className="mt-3 text-5xl font-bold text-white">Validation Engine</h1>
          <p className="mt-3 max-w-4xl text-lg leading-8 text-slate-300">
            Global production checks for missing fields, broken references, duplicate IDs, missing assets, missing prompts, and export blockers.
          </p>
        </div>
        <div className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Export Readiness</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-3xl font-black text-white">{unresolved.length}</p>
              <p className="text-xs text-slate-400">Open Checks</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">{affectedRecords}</p>
              <p className="text-xs text-slate-400">Affected</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">{critical}</p>
              <p className="text-xs text-slate-400">Critical</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {validationTypes.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
              <Icon className="h-5 w-5 text-cyan-200" />
              <h2 className="mt-3 text-lg font-bold text-white">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 shadow-glow">
        <div className="flex items-center justify-between gap-4 border-b border-cyan-400/15 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Active Findings</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Data Health Queue</h2>
          </div>
          {unresolved.length ? <AlertTriangle className="h-6 w-6 text-amber-200" /> : <CheckCircle2 className="h-6 w-6 text-emerald-200" />}
        </div>
        <div className="divide-y divide-cyan-400/10">
          {unresolved.map((check) => (
            <article key={check.id} className="grid gap-4 p-4 xl:grid-cols-[12rem_1fr_10rem] xl:items-center">
              <div>
                <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", severityStyles[check.severity] ?? severityStyles.Low)}>
                  {check.severity}
                </span>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-200">{check.system}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{check.issue}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">{check.description}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{check.recommended_action}</p>
              </div>
              <div className="rounded-md border border-cyan-400/10 bg-slate-950/45 p-3 text-center">
                <p className="text-2xl font-black text-white">{check.affected_count}</p>
                <p className="text-xs text-slate-500">records</p>
              </div>
            </article>
          ))}
          {!unresolved.length ? (
            <div className="p-6 text-sm text-slate-300">No unresolved validation checks. Export pipeline is clear.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
