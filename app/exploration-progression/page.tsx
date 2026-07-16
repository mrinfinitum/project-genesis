import { Compass, GitBranch, LockKeyhole, Radar, Rocket, ScanSearch } from "lucide-react";
import { getRows } from "@/lib/data";
import type { ResearchNode, UnlockMatrixRow } from "@/types/schema";

export const dynamic = "force-dynamic";

const progressionSystems = [
  { title: "Sector Scanning", featureId: "sector_scan", icon: ScanSearch, detail: "Controls sector visibility, probe rules, and generated sector inspection." },
  { title: "Star System Scanning", featureId: "system_scan", icon: Radar, detail: "Controls system-level scans, star signatures, and body reveal permissions." },
  { title: "Planet Scanning", featureId: "planet_scan", icon: Compass, detail: "Controls planet stat visibility, resource detail visibility, and survey depth." },
  { title: "Claim Technology", featureId: "claim_planet", icon: LockKeyhole, detail: "Controls claim/colony-claim capability and future ownership workflows." },
  { title: "Colonization", featureId: "colonization", icon: Rocket, detail: "Controls settlement readiness and colony creation prerequisites." },
  { title: "Intergalactic Travel", featureId: "intergalactic_travel", icon: GitBranch, detail: "Controls galaxy-to-galaxy travel and long-range route eligibility." }
];

function matchRows(rows: UnlockMatrixRow[], featureId: string) {
  const needle = featureId.replace(/_/g, " ").toLowerCase();
  return rows.filter((row) => [row.unlock_id, row.unlock_name, row.unlock_type, row.notes].some((value) => String(value ?? "").toLowerCase().includes(featureId) || String(value ?? "").toLowerCase().includes(needle)));
}

function linkedResearch(rows: ResearchNode[], featureId: string) {
  const needle = featureId.replace(/_/g, " ").toLowerCase();
  return rows.filter((row) => [row.id, row.name, row.unlock_summary, row.space_system_unlocked, row.primary_unlock_type, row.gameplay_effect].some((value) => String(value ?? "").toLowerCase().includes(featureId) || String(value ?? "").toLowerCase().includes(needle)));
}

function statTile(label: string, value: string | number) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-slate-950/40 p-4">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default async function ExplorationProgressionPage() {
  const [researchRows, unlockRows] = await Promise.all([
    getRows("research") as Promise<ResearchNode[]>,
    getRows("unlock_matrix") as Promise<UnlockMatrixRow[]>
  ]);

  const linkedUnlockCount = progressionSystems.reduce((sum, system) => sum + matchRows(unlockRows, system.featureId).length, 0);
  const linkedResearchCount = progressionSystems.reduce((sum, system) => sum + linkedResearch(researchRows, system.featureId).length, 0);

  return (
    <main className="space-y-6">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Gameplay Progression</p>
        <h1 className="mt-2 text-4xl font-black text-white">Exploration Progression</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Owns research gates, scanning capability, probe technology, travel technology, claim technology, colony technology, and the exploration unlock matrix. Universe Libraries stay focused on generated records.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {statTile("Research Rows", researchRows.length)}
          {statTile("Unlock Rows", unlockRows.length)}
          {statTile("Linked Gate Rows", linkedUnlockCount + linkedResearchCount)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {progressionSystems.map((system) => {
          const Icon = system.icon;
          const unlocks = matchRows(unlockRows, system.featureId);
          const research = linkedResearch(researchRows, system.featureId);
          return (
            <article key={system.featureId} className="rounded-md border border-cyan-300/15 bg-[#07101e]/82 p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/20 bg-cyan-400/10">
                  <Icon className="h-5 w-5 text-cyan-200" />
                </div>
                <div>
                  <p className="text-xl font-black text-white">{system.title}</p>
                  <p className="mt-1 font-mono text-xs text-cyan-100">{system.featureId}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{system.detail}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {statTile("Research", research.length)}
                {statTile("Unlocks", unlocks.length)}
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/82 p-5">
        <div className="flex items-center gap-3">
          <GitBranch className="h-5 w-5 text-cyan-200" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Research Unlock Matrix</p>
            <h2 className="text-2xl font-black text-white">Exploration Technology Sources</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {unlockRows.slice(0, 12).map((row) => (
            <div key={row.id} className="grid gap-3 rounded-md border border-cyan-300/10 bg-slate-950/35 p-3 md:grid-cols-[1fr_1fr_auto]">
              <div>
                <p className="font-bold text-white">{row.source_name}</p>
                <p className="mt-1 text-xs text-slate-500">{row.source_era}</p>
              </div>
              <div>
                <p className="font-bold text-cyan-100">{row.unlock_name}</p>
                <p className="mt-1 text-xs text-slate-500">{row.unlock_type}</p>
              </div>
              <span className="rounded-md border border-cyan-300/25 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">{row.implementation_status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
