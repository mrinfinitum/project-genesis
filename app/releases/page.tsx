import { getGameData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReleasesPage() {
  const data = await getGameData();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Project</p>
        <h2 className="mt-2 text-4xl font-black text-white">Release Notes</h2>
        <p className="mt-2 max-w-3xl text-slate-300">Versioned milestone notes for Project Genesis Studio and production handoff.</p>
      </section>

      <section className="grid gap-4">
        {data.release_notes.map((release) => (
          <article key={release.id} className="rounded-md border border-cyan-400/15 bg-genesis-panel/90 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{release.version}</p>
                <h3 className="mt-2 text-xl font-bold text-white">{release.release_name}</h3>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{release.created_at}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-200">{release.purpose}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{release.notes}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
