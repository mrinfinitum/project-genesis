import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";
import { GitBranch, Network, ScanSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const rows = await getRows("research");
  const complete = rows.filter((row) => String(row.status ?? "") === "Ready" || String(row.status ?? "") === "Complete").length;
  const missingPrerequisites = rows.filter((row) => !row.prerequisite_id && Number(row.era_order ?? 0) > 1).length;
  const designerMetrics = [
    { label: "Dependency Tree", value: `${rows.length} nodes`, icon: GitBranch },
    { label: "Linked Unlocks", value: `${complete} ready`, icon: Network },
    { label: "Validation", value: `${missingPrerequisites} missing prereqs`, icon: ScanSearch }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-5 shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Civilization Workflow</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Research Designer</h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          Next evolution: tree and dependency view for research nodes. The editable data table remains below as the raw record layer.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {designerMetrics.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-md border border-cyan-400/10 bg-slate-950/45 p-4">
              <Icon className="h-5 w-5 text-cyan-200" />
              <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <AdminTable config={tableConfigs.research} initialRows={rows} />
    </div>
  );
}
