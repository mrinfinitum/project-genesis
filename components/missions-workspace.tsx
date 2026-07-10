"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Eye, Flag, Play, RotateCcw, Target, Trophy, XCircle } from "lucide-react";
import {
  MISSIONS_UPDATED_EVENT,
  abandonMission,
  acceptMission,
  readMissionBundle,
  resetGeneratedMissions,
  setMissionTracked,
  type MissionBundle,
  type MissionObjective,
  type MissionRecord,
  type MissionReward
} from "@/lib/missions/procedural";
import { ResourceService } from "@/lib/resources/service";
import { WorkspaceBadge as Badge, WorkspaceHeader, WorkspacePanel, WorkspaceProgressBar as ProgressBar, WorkspaceSearchBar, WorkspaceStatTile as StatTile, WorkspaceTabs } from "@/components/ui/workspace";

type MissionTab = "available" | "active" | "completed" | "failed";

const tabCopy: Record<MissionTab, string> = {
  available: "Available",
  active: "Active",
  completed: "Completed",
  failed: "Failed / Expired"
};

function missionProgress(mission: MissionRecord, objectives: MissionObjective[]) {
  const rows = objectives.filter((objective) => mission.objectiveIds.includes(objective.id) && !objective.optional);
  if (!rows.length) return 0;
  const completed = rows.filter((objective) => objective.completed).length;
  return Math.round((completed / rows.length) * 100);
}

function rewardLabel(reward: MissionReward) {
  if (reward.resourceId) return `${reward.amount} ${ResourceService.nameForId(reward.resourceId)}`;
  if (reward.researchId) return `${reward.amount} research unlock`;
  if (reward.factionId) return `${reward.amount} reputation`;
  return `${reward.amount} ${reward.rewardType.replaceAll("_", " ")}`;
}

function MissionCard({ mission, objectives, selected, onSelect }: { mission: MissionRecord; objectives: MissionObjective[]; selected: boolean; onSelect: () => void }) {
  const progress = missionProgress(mission, objectives);
  return (
    <button type="button" onClick={onSelect} className={`rounded-md border bg-[#07101e]/85 p-4 text-left shadow-glow transition hover:border-cyan-300/55 ${selected ? "border-cyan-300/65" : "border-cyan-300/15"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge value={mission.status} />
            <Badge value={mission.difficulty} />
            <Badge value={mission.missionType} />
          </div>
          <h2 className="mt-3 line-clamp-2 text-2xl font-black text-white">{mission.displayName ?? mission.title}</h2>
          <p className="mt-1 font-mono text-xs text-slate-500">{mission.id}</p>
        </div>
        <ClipboardList className="h-6 w-6 shrink-0 text-cyan-200" />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{mission.description}</p>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>Objectives</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
    </button>
  );
}

function Tracker({ bundle, onSelect }: { bundle: MissionBundle; onSelect: (id: string) => void }) {
  const tracked = bundle.missions.filter((mission) => bundle.trackedMissionIds.includes(mission.id) || mission.tracked).slice(0, 3);
  return (
    <WorkspacePanel title="Active Tracker" icon={Target}>
      <div className="grid gap-3">
        {tracked.length ? tracked.map((mission) => (
          <button key={mission.id} type="button" onClick={() => onSelect(mission.id)} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-left transition hover:border-cyan-300/45">
            <div className="flex items-center justify-between gap-3">
              <span className="line-clamp-1 font-black text-white">{mission.displayName ?? mission.title}</span>
              <Badge value={`${missionProgress(mission, bundle.objectives)}%`} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{mission.starSystemId ?? mission.colonyId ?? mission.marketId ?? "Studio-wide"}</p>
          </button>
        )) : <p className="text-sm font-semibold text-slate-500">Track accepted missions to pin them here.</p>}
      </div>
    </WorkspacePanel>
  );
}

export function MissionsWorkspace() {
  const [bundle, setBundle] = useState<MissionBundle>(() => readMissionBundle());
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<MissionTab>("available");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function refresh() {
    const next = readMissionBundle();
    setBundle(next);
    setSelectedId((current) => current ?? next.missions[0]?.id ?? null);
  }

  useEffect(() => {
    refresh();
    window.addEventListener(MISSIONS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(MISSIONS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const totals = useMemo(() => {
    return {
      available: bundle.missions.filter((mission) => mission.status === "available").length,
      active: bundle.missions.filter((mission) => ["accepted", "active"].includes(mission.status)).length,
      completed: bundle.missions.filter((mission) => mission.status === "completed").length,
      rewards: bundle.rewards.reduce((sum, reward) => sum + reward.amount, 0)
    };
  }, [bundle]);

  const filtered = bundle.missions.filter((mission) => {
    const tabMatch =
      tab === "available"
        ? mission.status === "available"
        : tab === "active"
          ? ["accepted", "active"].includes(mission.status)
          : tab === "completed"
            ? mission.status === "completed"
            : ["failed", "expired", "abandoned"].includes(mission.status);
    const haystack = [mission.title, mission.displayName, mission.description, mission.missionType, mission.status, mission.difficulty, mission.tags.join(" "), mission.issuingFactionId, mission.starSystemId, mission.planetId, mission.colonyId, mission.marketId, mission.tradeRouteId].join(" ").toLowerCase();
    return tabMatch && (!query.trim() || haystack.includes(query.toLowerCase()));
  });
  const selected = bundle.missions.find((mission) => mission.id === selectedId) ?? filtered[0] ?? bundle.missions[0];
  const selectedObjectives = selected ? bundle.objectives.filter((objective) => selected.objectiveIds.includes(objective.id)) : [];
  const selectedRewards = selected ? bundle.rewards.filter((reward) => selected.rewardIds.includes(reward.id)) : [];

  function run(action: () => MissionBundle) {
    const next = action();
    setBundle(next);
    setSelectedId((current) => current ?? next.missions[0]?.id ?? null);
  }

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Procedural Mission Layer"
        title="Missions"
        description="Deterministic missions generated from discovery, factions, colonies, resources, markets, trade routes, research, and timeline state."
        stats={[
          { label: "Available", value: totals.available },
          { label: "Active", value: totals.active },
          { label: "Completed", value: totals.completed },
          { label: "Reward Value", value: totals.rewards }
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search missions, objectives, factions, routes" />
        <button type="button" onClick={() => run(resetGeneratedMissions)} className="inline-flex h-16 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-400/10 px-4 text-sm font-bold text-cyan-100">
          <RotateCcw className="h-4 w-4" />
          Regenerate Missions
        </button>
      </div>

      <Tracker bundle={bundle} onSelect={setSelectedId} />

      <WorkspaceTabs tabs={Object.keys(tabCopy) as MissionTab[]} active={tab} onChange={setTab} labels={tabCopy} />

      <section className="grid gap-5 xl:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.22fr)]">
        <div className="grid content-start gap-4">
          {filtered.map((mission) => (
            <MissionCard key={mission.id} mission={mission} objectives={bundle.objectives} selected={selected?.id === mission.id} onSelect={() => setSelectedId(mission.id)} />
          ))}
          {!filtered.length ? <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-4 text-sm font-semibold text-amber-100">No missions match this view.</div> : null}
        </div>

        {selected ? (
          <div className="space-y-4">
            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge value={selected.status} />
                    <Badge value={selected.difficulty} />
                    <Badge value={selected.rarity} />
                  </div>
                  <h2 className="mt-3 text-4xl font-black text-white">{selected.displayName ?? selected.title}</h2>
                  <p className="mt-2 font-mono text-xs text-slate-500">{selected.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.status === "available" ? (
                    <button type="button" onClick={() => run(() => acceptMission(selected.id))} className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-300/35 bg-emerald-400/10 px-3 text-sm font-bold text-emerald-100">
                      <Play className="h-4 w-4" />
                      Accept
                    </button>
                  ) : null}
                  {["accepted", "active"].includes(selected.status) ? (
                    <button type="button" onClick={() => run(() => setMissionTracked(selected.id, !selected.tracked))} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-400/10 px-3 text-sm font-bold text-cyan-100">
                      <Eye className="h-4 w-4" />
                      {selected.tracked ? "Untrack" : "Track"}
                    </button>
                  ) : null}
                  {["accepted", "active"].includes(selected.status) ? (
                    <button type="button" onClick={() => run(() => abandonMission(selected.id))} className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-300/35 bg-rose-400/10 px-3 text-sm font-bold text-rose-100">
                      <XCircle className="h-4 w-4" />
                      Abandon
                    </button>
                  ) : null}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{selected.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile label="Progress" value={`${missionProgress(selected, bundle.objectives)}%`} />
                <StatTile label="Priority" value={selected.priority} />
                <StatTile label="Objectives" value={selected.objectiveIds.length} />
                <StatTile label="Rewards" value={selected.rewardIds.length} />
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <WorkspacePanel title="Objectives" icon={Target}>
                <div className="grid gap-3">
                  {selectedObjectives.map((objective) => (
                    <div key={objective.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge value={objective.objectiveType} />
                        <Badge value={objective.completed ? "complete" : `${objective.currentCount}/${objective.targetCount}`} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{objective.description}</p>
                      <p className="mt-2 font-mono text-xs text-slate-500">{objective.targetType}: {objective.targetId}</p>
                    </div>
                  ))}
                </div>
              </WorkspacePanel>

              <WorkspacePanel title="Rewards" icon={Trophy}>
                <div className="grid gap-3">
                  {selectedRewards.map((reward) => (
                    <div key={reward.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge value={reward.rewardType} />
                        <span className="font-black text-white">{rewardLabel(reward)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{reward.description}</p>
                    </div>
                  ))}
                </div>
              </WorkspacePanel>
            </section>

            <WorkspacePanel title="Mission Links" icon={Flag}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label="Faction" value={selected.issuingFactionId ?? "None"} />
                <StatTile label="System" value={selected.starSystemId ?? "Any"} />
                <StatTile label="Colony" value={selected.colonyId ?? "Any"} />
                <StatTile label="Market" value={selected.marketId ?? selected.tradeRouteId ?? "Any"} />
              </div>
            </WorkspacePanel>

            <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
              <h3 className="text-lg font-black text-white">History</h3>
              <div className="mt-4 grid gap-3">
                {selected.history.map((event) => (
                  <div key={event.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-black text-white">{event.title}</h4>
                      <Badge value={event.eventType} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{event.description}</p>
                    <p className="mt-2 font-mono text-xs text-slate-500">{event.timestamp}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
