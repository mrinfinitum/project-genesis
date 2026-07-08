import { AdminTable } from "@/components/admin-table";
import { getRows } from "@/lib/data";
import { tableConfigs } from "@/lib/tables";
import { Building2, Layers3, ScanSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
  const rows = await getRows("buildings");
  const categories = new Set(rows.map((row) => String(row.category ?? "")).filter(Boolean)).size;
  const eras = new Set(rows.map((row) => String(row.era ?? "")).filter(Boolean)).size;
  const missingAssets = rows.filter((row) => !row.asset_id && !row.icon_name && !row.model_name).length;
  const designerMetrics = [
    { label: "Building Cards", value: `${rows.length} records`, icon: Building2 },
    { label: "Era / Category Groups", value: `${eras} eras / ${categories} categories`, icon: Layers3 },
    { label: "Validation", value: `${missingAssets} missing assets`, icon: ScanSearch }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-5 shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Civilization Workflow</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Building Designer</h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          Next evolution: card layout grouped by age and category. The editable data table remains below as the raw record layer.
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
      <AdminTable config={tableConfigs.buildings} initialRows={rows} />
    </div>
  );
}
