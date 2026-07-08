import { getGameData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ChangelogPage() {
  const data = await getGameData();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Project</p>
        <h2 className="mt-2 text-4xl font-black text-white">Changelog</h2>
        <p className="mt-2 max-w-3xl text-slate-300">Tracked schema, content, and production changes across the studio database.</p>
      </section>

      <section className="overflow-hidden rounded-md border border-cyan-400/15 bg-genesis-panel/90">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="bg-slate-950/55 text-xs uppercase tracking-[0.14em] text-slate-400">
            <tr>
              <th className="border-b border-cyan-400/15 px-4 py-3 font-medium">Version</th>
              <th className="border-b border-cyan-400/15 px-4 py-3 font-medium">Table</th>
              <th className="border-b border-cyan-400/15 px-4 py-3 font-medium">Type</th>
              <th className="border-b border-cyan-400/15 px-4 py-3 font-medium">Summary</th>
              <th className="border-b border-cyan-400/15 px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.changelog.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-800/80">
                <td className="px-4 py-3 text-cyan-100">{entry.version}</td>
                <td className="px-4 py-3 text-slate-300">{entry.sheet_or_table}</td>
                <td className="px-4 py-3 text-slate-300">{entry.change_type}</td>
                <td className="max-w-[520px] px-4 py-3 text-slate-300">{entry.change_summary}</td>
                <td className="px-4 py-3 text-slate-500">{entry.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
