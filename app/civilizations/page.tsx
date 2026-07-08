import { Activity, BadgeCheck, BrainCircuit, Compass, Landmark, Sparkles, TrendingUp } from "lucide-react";
import { civilizationAges } from "@/data/civilization-identity";
import { getRows } from "@/lib/data";
import type {
  CivilizationAlignmentHistory,
  CivilizationAlignmentScore,
  CivilizationBonus,
  CivilizationIdentity,
  CivilizationMilestone,
  CivilizationTitle,
  CivilizationUnlockedMilestone
} from "@/types/schema";

export const dynamic = "force-dynamic";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function sortByScore(rows: CivilizationAlignmentScore[]) {
  return [...rows].sort((left, right) => right.score - left.score);
}

function alignmentColor(alignment: string) {
  const colors: Record<string, string> = {
    Eco: "#2ecc71",
    Technology: "#38bdf8",
    Industry: "#f59e0b",
    Cyber: "#a78bfa",
    Nature: "#84cc16",
    Exploration: "#22d3ee",
    Science: "#60a5fa",
    Harmony: "#f0abfc",
    Commerce: "#facc15"
  };

  return colors[alignment] ?? "#67e8f9";
}

function currentAgeIndex(age: string) {
  return Math.max(
    0,
    civilizationAges.findIndex((entry) => entry.name === age)
  );
}

function statCard(label: string, value: string | number, helper: string) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{helper}</p>
    </div>
  );
}

function findMilestone(milestones: CivilizationMilestone[], id: string) {
  return milestones.find((milestone) => milestone.id === id);
}

export default async function CivilizationsPage() {
  const [identityRows, alignmentRows, historyRows, milestoneRows, unlockedRows, titleRows, bonusRows] = await Promise.all([
    getRows("civilization_identity") as Promise<CivilizationIdentity[]>,
    getRows("civilization_alignment_scores") as Promise<CivilizationAlignmentScore[]>,
    getRows("civilization_alignment_history") as Promise<CivilizationAlignmentHistory[]>,
    getRows("civilization_milestones") as Promise<CivilizationMilestone[]>,
    getRows("civilization_unlocked_milestones") as Promise<CivilizationUnlockedMilestone[]>,
    getRows("civilization_titles") as Promise<CivilizationTitle[]>,
    getRows("civilization_bonuses") as Promise<CivilizationBonus[]>
  ]);
  const identity = identityRows[0];
  const sortedAlignments = sortByScore(alignmentRows);
  const unlockedMilestoneIds = new Set(unlockedRows.map((row) => row.milestone_id));
  const unlockedMilestones = unlockedRows
    .map((row) => findMilestone(milestoneRows, row.milestone_id))
    .filter(Boolean) as CivilizationMilestone[];
  const recentChanges = [...historyRows].sort((left, right) => String(right.created_at).localeCompare(String(left.created_at))).slice(0, 4);
  const activeBonuses = bonusRows.filter((bonus) => bonus.active);
  const ageIndex = currentAgeIndex(identity?.current_age ?? "Survival Age");
  const nextAge = civilizationAges[ageIndex + 1];
  const predictedTitle = titleRows.find((title) => title.title === identity?.civilization_title) ?? titleRows[0];

  if (!identity) {
    return (
      <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-8 text-slate-300 shadow-glow">
        Civilization Identity data is not available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/85 shadow-glow">
        <div className="grid gap-6 border-b border-cyan-300/15 p-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Civilization Identity</p>
            <h2 className="mt-2 text-4xl font-bold text-white">{identity.civilization_name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              A persistent record of humanity's evolution through ages, alignments, discoveries, milestones, wonders, and permanent bonuses.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[identity.current_age, identity.civilization_title, identity.future_prediction].map((item) => (
                <span key={item} className="rounded border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-md border border-cyan-300/25 bg-cyan-400/10 text-cyan-100">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Future Prediction</p>
                <p className="text-xl font-bold text-white">{identity.future_prediction}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Likely path is driven by {identity.primary_alignment}, supported by {identity.secondary_alignment}, with {identity.emerging_alignment} rising from recent progression.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Shift it through research choices, buildings, upgrades, events, colonization decisions, wonders, and milestone unlocks.
            </p>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          {statCard("Population", formatNumber(identity.population), "Current civilization population baseline.")}
          {statCard("Discovery Points", formatNumber(identity.total_discovery_points), "Accumulated exploration identity signal.")}
          {statCard("Colonized Worlds", identity.total_colonized_worlds, "Worlds contributing to civilization history.")}
          {statCard("Wonders Built", identity.total_wonders_built, "Permanent identity landmarks completed.")}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Alignments</p>
              <h3 className="text-xl font-bold text-white">What Humanity Is Becoming</h3>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {sortedAlignments.map((alignment) => (
              <div key={alignment.id}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-100">{alignment.alignment_name}</span>
                  <span className="font-mono text-xs text-slate-400">{alignment.score}/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, alignment.score))}%`,
                      backgroundColor: alignmentColor(alignment.alignment_name),
                      boxShadow: `0 0 18px ${alignmentColor(alignment.alignment_name)}66`
                    }}
                  />
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{alignment.bonus_summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Age Progression</p>
              <h3 className="text-xl font-bold text-white">{identity.current_age}</h3>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {civilizationAges.map((age, index) => {
              const active = age.name === identity.current_age;
              const past = index < ageIndex;

              return (
                <div
                  key={age.name}
                  className={[
                    "rounded-md border p-3",
                    active ? "border-cyan-300/50 bg-cyan-400/10" : past ? "border-emerald-300/20 bg-emerald-400/5" : "border-cyan-300/10 bg-slate-950/35 opacity-70"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">{age.name}</p>
                    {active ? <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cyan-200">Current</span> : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{age.description}</p>
                </div>
              );
            })}
          </div>
          {nextAge ? <p className="mt-4 text-xs text-slate-500">Next threshold: {nextAge.name}</p> : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <Compass className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Civilization Timeline</p>
              <h3 className="text-xl font-bold text-white">Milestones</h3>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {milestoneRows
              .sort((left, right) => left.sort_order - right.sort_order)
              .map((milestone) => {
                const unlocked = unlockedMilestoneIds.has(milestone.id);

                return (
                  <div
                    key={milestone.id}
                    className={[
                      "grid gap-3 rounded-md border p-3 md:grid-cols-[10rem_1fr]",
                      unlocked ? "border-cyan-300/35 bg-cyan-400/10" : "border-cyan-300/10 bg-slate-950/35 opacity-65"
                    ].join(" ")}
                  >
                    <div>
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{milestone.age}</p>
                      <p className="mt-1 text-xs font-semibold text-cyan-100">{unlocked ? "Unlocked" : "Locked"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{milestone.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{milestone.description}</p>
                      <p className="mt-2 text-[0.65rem] uppercase tracking-[0.14em] text-slate-500">Unlocked by {milestone.unlocked_by}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-cyan-200" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Active Bonuses</p>
                <h3 className="text-xl font-bold text-white">Permanent Effects</h3>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {activeBonuses.map((bonus) => (
                <div key={bonus.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-white">{bonus.bonus_name}</p>
                    <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-[0.65rem] font-semibold text-cyan-100">{bonus.bonus_value}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{bonus.description}</p>
                  <p className="mt-2 text-[0.65rem] uppercase tracking-[0.14em] text-slate-500">{bonus.source_type}: {bonus.source_id}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-cyan-200" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Title Logic</p>
                <h3 className="text-xl font-bold text-white">{predictedTitle?.title ?? identity.civilization_title}</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{predictedTitle?.requirement_summary ?? "Title is derived from age, alignment scores, and gameplay history."}</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">{predictedTitle?.bonus_summary ?? "Bonuses are applied as permanent civilization identity modifiers."}</p>
          </div>

          <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-cyan-200" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Recent Changes</p>
                <h3 className="text-xl font-bold text-white">Identity Signals</h3>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {recentChanges.map((change) => (
                <div key={change.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{change.alignment_name}</p>
                    <span className="font-mono text-xs text-cyan-200">+{change.change_amount}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{change.reason}</p>
                </div>
              ))}
              {unlockedMilestones.slice(0, 2).map((milestone) => (
                <div key={milestone.id} className="rounded-md border border-emerald-300/10 bg-emerald-400/5 p-3">
                  <p className="font-semibold text-white">{milestone.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">Milestone unlocked in {milestone.age}.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
