import { BarChart3, Gem, Gauge, TrendingUp } from "lucide-react";
import { CanonicalIndex, WorkspaceBadge, WorkspaceMiniStat, WorkspacePanel } from "@/components/ui/workspace";
import { canonicalProgressionSystem, generateProgressionLevels } from "@/lib/progression/progression-system";

export const dynamic = "force-dynamic";

type ProgressionPageProps = { searchParams?: Promise<{ view?: string; profile?: string }> };

const views = ["dashboard", "profiles", "curves", "eras", "crystals", "balance", "validation", "runtime"];

export default async function ProgressionPage({ searchParams }: ProgressionPageProps) {
  const params = await searchParams;
  const view = views.includes(params?.view ?? "") ? params?.view ?? "dashboard" : "dashboard";
  const selected = canonicalProgressionSystem.progressionProfiles.find((profile) => profile.id === params?.profile) ?? canonicalProgressionSystem.progressionProfiles[0];
  const levels = generateProgressionLevels(selected);
  const samples = [1, 10, 25, 50, 75, 100].map((level) => levels[level - 1]);
  const comparison = [canonicalProgressionSystem.progressionProfiles[0], canonicalProgressionSystem.progressionProfiles[4], canonicalProgressionSystem.progressionProfiles[8]];

  return (
    <main className="space-y-4">
      <CanonicalIndex
        title="Progression"
        description="Canonical deterministic progression curves, explicit level values, XP sources, labor gates, era scaling, and protected Crystal acceleration. Player progress remains Game-owned."
        items={[
          { label: "Profiles", value: canonicalProgressionSystem.progressionProfiles.length, detail: "approved era curves" },
          { label: "Generated Rows", value: canonicalProgressionSystem.generatedLevelCount.toLocaleString(), detail: "explicit profile levels" },
          { label: "XP Sources", value: canonicalProgressionSystem.upgradeXpSourceProfiles.length, detail: "canonical activity sources" },
          { label: "Validation", value: canonicalProgressionSystem.validationStatus, detail: "runtime contract" }
        ]}
      />

      <nav className="flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 shadow-glow" aria-label="Progression workspace sections">
        {views.map((item) => (
          <a key={item} href={`/progression?view=${item}`} className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${view === item ? "border-cyan-200/60 bg-cyan-300/15 text-white" : "border-cyan-300/15 text-slate-400 hover:text-cyan-100"}`}>
            {item.replace(/-/g, " ")}
          </a>
        ))}
      </nav>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.8fr)]">
        <WorkspacePanel title="Level 1-100 Balance Preview" icon={BarChart3}>
          <div className="flex flex-wrap gap-2">
            {canonicalProgressionSystem.progressionProfiles.map((profile) => (
              <a key={profile.id} href={`/progression?view=${view}&profile=${profile.id}`} className={`rounded-md border px-3 py-2 text-xs font-bold ${profile.id === selected.id ? "border-cyan-200/60 bg-cyan-300/15 text-white" : "border-cyan-300/15 text-slate-400"}`}>{profile.era}</a>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-500"><tr>{["Level", "XP", "Cumulative", "Labor", "Money", "Duration", "Output", "Crystals"].map((label) => <th key={label} className="border-b border-cyan-300/15 px-3 py-2">{label}</th>)}</tr></thead>
              <tbody>{samples.map((row) => <tr key={row.level} className="border-b border-cyan-300/10 text-slate-200"><td className="px-3 py-3 font-black text-white">{row.level}</td><td className="px-3 py-3">{row.xpRequired.toLocaleString()}</td><td className="px-3 py-3">{row.cumulativeXp.toLocaleString()}</td><td className="px-3 py-3">{row.laborCost.toLocaleString()}</td><td className="px-3 py-3">{row.moneyCost.toLocaleString()}</td><td className="px-3 py-3">{row.durationSeconds.toLocaleString()}s</td><td className="px-3 py-3">{row.outputValue}</td><td className="px-3 py-3">{row.crystalAccelerationCost}</td></tr>)}</tbody>
            </table>
          </div>
        </WorkspacePanel>

        <div className="space-y-4">
          <WorkspacePanel title="Selected Profile" icon={Gauge}>
            <div className="flex flex-wrap gap-2"><WorkspaceBadge value={selected.era} /><WorkspaceBadge value={selected.tier} /><WorkspaceBadge value={selected.curveMode} /></div>
            <h2 className="mt-3 text-xl font-black text-white">{selected.displayName}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{selected.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-2"><WorkspaceMiniStat label="Minimum" value={selected.minLevel} /><WorkspaceMiniStat label="Mastery" value={selected.maxLevel} /><WorkspaceMiniStat label="Milestones" value={selected.milestoneRules.length} /><WorkspaceMiniStat label="Version" value={selected.version} /></div>
          </WorkspacePanel>
          <WorkspacePanel title="Crystal Safety" icon={Gem}>
            <p className="text-sm leading-6 text-slate-300">Crystals accelerate valid actions. They never unlock unavailable content or bypass hard prerequisites.</p>
            <div className="mt-3 flex flex-wrap gap-2">{canonicalProgressionSystem.crystalAccelerationProfiles.map((profile) => <WorkspaceBadge key={profile.id} value={profile.displayName} />)}</div>
          </WorkspacePanel>
        </div>
      </section>

      <WorkspacePanel title="Era Comparison" icon={TrendingUp}>
        <div className="grid gap-3 md:grid-cols-3">{comparison.map((profile) => {
          const mastery = generateProgressionLevels(profile)[99];
          return <article key={profile.id} className="rounded-md border border-cyan-300/15 bg-[#050c18] p-4"><WorkspaceBadge value={profile.tier} /><h3 className="mt-3 text-lg font-black capitalize text-white">{profile.era}</h3><div className="mt-3 grid grid-cols-2 gap-2"><WorkspaceMiniStat label="Mastery XP" value={mastery.cumulativeXp.toLocaleString()} /><WorkspaceMiniStat label="Duration" value={`${Math.round(mastery.durationSeconds / 3600)}h`} /><WorkspaceMiniStat label="Labor" value={mastery.laborCost.toLocaleString()} /><WorkspaceMiniStat label="Output" value={mastery.outputValue} /></div></article>;
        })}</div>
      </WorkspacePanel>
    </main>
  );
}
