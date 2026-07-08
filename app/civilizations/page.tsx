import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircleDashed,
  Code2,
  Database,
  GitBranch,
  Landmark,
  Layers3,
  Network,
  Palette,
  Rocket,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { civilizationAges } from "@/data/civilization-identity";
import { getRows } from "@/lib/data";
import type { Building, ProjectSystem, ResearchNode, UnlockMatrixRow, Upgrade, Wonder } from "@/types/schema";

export const dynamic = "force-dynamic";

type AgeMetric = {
  age: string;
  shortAge: string;
  completion: number;
  researchLinked: number;
  researchTarget: number;
  buildingsLinked: number;
  buildingTarget: number;
  upgradesLinked: number;
  upgradeTarget: number;
  unlockRules: number;
  unlockTarget: number;
  bonuses: number;
  bonusTarget: number;
  artwork: number;
  artworkTarget: number;
  events: number;
  eventTarget: number;
  wonders: number;
  wonderTarget: number;
  resourcesComplete: boolean;
  missingDependencies: string[];
  validationStatus: "Complete" | "Partial" | "Needs Work";
};

type ValidationIssue = {
  severity: "Critical" | "High" | "Medium";
  title: string;
  affectedRecords: string;
  action: string;
};

const ageTargets: Record<string, { research: number; buildings: number; upgrades: number; unlocks: number; bonuses: number; artwork: number; events: number; wonders: number }> = {
  Survival: { research: 16, buildings: 12, upgrades: 12, unlocks: 18, bonuses: 3, artwork: 8, events: 8, wonders: 1 },
  Village: { research: 18, buildings: 16, upgrades: 14, unlocks: 20, bonuses: 3, artwork: 10, events: 10, wonders: 1 },
  Town: { research: 22, buildings: 18, upgrades: 16, unlocks: 24, bonuses: 4, artwork: 12, events: 12, wonders: 2 },
  Industrial: { research: 26, buildings: 22, upgrades: 18, unlocks: 28, bonuses: 4, artwork: 14, events: 12, wonders: 2 },
  Modern: { research: 40, buildings: 25, upgrades: 30, unlocks: 36, bonuses: 5, artwork: 18, events: 15, wonders: 6 },
  Future: { research: 42, buildings: 28, upgrades: 32, unlocks: 40, bonuses: 6, artwork: 20, events: 16, wonders: 6 },
  Interstellar: { research: 36, buildings: 22, upgrades: 26, unlocks: 34, bonuses: 6, artwork: 18, events: 14, wonders: 5 },
  Galactic: { research: 32, buildings: 20, upgrades: 24, unlocks: 30, bonuses: 6, artwork: 18, events: 14, wonders: 5 },
  Genesis: { research: 20, buildings: 12, upgrades: 16, unlocks: 22, bonuses: 8, artwork: 16, events: 12, wonders: 4 }
};

const alignmentDesignRows = [
  { name: "Technology", status: "Rules Complete", detail: "Research and automation hooks are represented.", percent: 82 },
  { name: "Industry", status: "Needs Bonus Definitions", detail: "Production bonuses need final values and unlock sources.", percent: 58 },
  { name: "Harmony", status: "Missing Event Rules", detail: "Harmony needs event triggers and escalation rules.", percent: 35 },
  { name: "Nature", status: "Needs Building Modifiers", detail: "Nature needs building and terraforming modifiers.", percent: 44 },
  { name: "Exploration", status: "Needs Reward Scaling", detail: "Discovery point scaling needs validation.", percent: 52 },
  { name: "Commerce", status: "Needs Trade Bonuses", detail: "Trade, market, and export bonuses need definitions.", percent: 28 },
  { name: "Science", status: "Complete", detail: "Research bonuses and discovery hooks are usable.", percent: 90 }
];

const dependencyGraph = [
  {
    title: "Modern Age",
    dependsOn: ["Satellites", "Computing", "Global Networks", "Orbital Launch"],
    note: "Modern establishes the first orbital production bridge."
  },
  {
    title: "Future Age",
    dependsOn: ["Fusion Power", "Terraforming", "Orbital Habitats", "Gas Giant Harvesting"],
    note: "Future connects home-system industry to off-world settlement."
  },
  {
    title: "Interstellar Age",
    dependsOn: ["Fusion Propulsion", "Colony Ships", "Planetary Colonization", "Warp Engineering", "Artificial Wormholes"],
    note: "Interstellar must not unlock until colony and propulsion chains are connected."
  },
  {
    title: "Genesis Age",
    dependsOn: ["Genesis Gate", "Reality Engineering", "Harmony Ascendant", "Universal Navigation"],
    note: "Genesis is the endgame validation layer."
  }
];

function shortAgeName(age: string) {
  return age.replace(/\s+Age$/i, "");
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function percent(count: number, target: number) {
  if (!target) return 100;
  return clampPercent((count / target) * 100);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return clampPercent(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function includesAge(value: string | null | undefined, age: string) {
  const normalized = String(value ?? "").toLowerCase();
  const shortAge = shortAgeName(age).toLowerCase();
  return normalized === age.toLowerCase() || normalized === shortAge || normalized.includes(shortAge);
}

function countByAge<T>(rows: T[], age: string, selector: (row: T) => string | null | undefined) {
  return rows.filter((row) => includesAge(selector(row), age)).length;
}

function countWondersByAge(wonders: Wonder[], research: ResearchNode[], age: string) {
  const researchIds = new Set(research.filter((node) => includesAge(node.era, age)).map((node) => node.id));
  return wonders.filter((wonder) => wonder.unlock_research_id && researchIds.has(wonder.unlock_research_id)).length;
}

function hasDependency(research: ResearchNode[], unlocks: UnlockMatrixRow[], dependency: string) {
  const needle = dependency.toLowerCase();
  return (
    research.some((node) =>
      `${node.name} ${node.unlock_summary} ${node.space_system_unlocked} ${node.primary_unlock_type} ${node.gameplay_effect}`
        .toLowerCase()
        .includes(needle)
    ) ||
    unlocks.some((row) => `${row.source_name} ${row.unlock_name} ${row.notes}`.toLowerCase().includes(needle))
  );
}

function progressRing(label: string, value: number, helper: string) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex items-center gap-4">
        <div
          className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#67e8f9 ${value * 3.6}deg, rgba(15, 23, 42, 0.9) 0deg)`
          }}
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#07101e] text-lg font-bold text-white">{value}%</div>
        </div>
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">{label}</p>
          <p className="mt-1 text-sm leading-5 text-slate-400">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function statusBadge(status: string) {
  const style =
    status === "Complete" || status === "Connected" || status === "Ready"
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
      : status === "Missing" || status === "Blocked" || status === "Needs Work"
        ? "border-rose-300/30 bg-rose-400/10 text-rose-100"
        : "border-amber-300/30 bg-amber-400/10 text-amber-100";

  return <span className={`rounded border px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] ${style}`}>{status}</span>;
}

function designMetric(label: string, value: string, status: "good" | "partial" | "missing" = "partial") {
  const color = status === "good" ? "text-emerald-100" : status === "missing" ? "text-rose-100" : "text-cyan-100";
  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/40 p-3">
      <p className="text-[0.63rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-1 font-bold ${color}`}>{value}</p>
    </div>
  );
}

function pageButton(label: string) {
  return (
    <button className="rounded-md border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15">
      {label}
    </button>
  );
}

function ageCompletion(metric: AgeMetric) {
  return average([
    percent(metric.researchLinked, metric.researchTarget),
    percent(metric.buildingsLinked, metric.buildingTarget),
    percent(metric.upgradesLinked, metric.upgradeTarget),
    percent(metric.unlockRules, metric.unlockTarget),
    percent(metric.bonuses, metric.bonusTarget),
    percent(metric.artwork, metric.artworkTarget),
    percent(metric.events, metric.eventTarget),
    percent(metric.wonders, metric.wonderTarget)
  ]);
}

export default async function CivilizationsPage() {
  const [researchRows, buildingRows, upgradeRows, unlockRows, wonderRows, projectSystemRows] = await Promise.all([
    getRows("research") as Promise<ResearchNode[]>,
    getRows("buildings") as Promise<Building[]>,
    getRows("upgrades") as Promise<Upgrade[]>,
    getRows("unlock_matrix") as Promise<UnlockMatrixRow[]>,
    getRows("wonders") as Promise<Wonder[]>,
    getRows("project_systems") as Promise<ProjectSystem[]>
  ]);

  const ageMetrics: AgeMetric[] = civilizationAges.map((ageEntry) => {
    const shortAge = shortAgeName(ageEntry.name);
    const target = ageTargets[shortAge] ?? ageTargets.Survival;
    const researchLinked = countByAge(researchRows, ageEntry.name, (row) => row.era);
    const buildingsLinked = countByAge(buildingRows, ageEntry.name, (row) => row.era);
    const upgradesLinked = countByAge(upgradeRows, ageEntry.name, (row) => row.era);
    const unlockRules = countByAge(unlockRows, ageEntry.name, (row) => row.source_era);
    const wonders = countWondersByAge(wonderRows, researchRows, ageEntry.name);
    const bonuses = Math.max(0, Math.round((researchLinked + buildingsLinked + upgradesLinked) / 18));
    const artwork = Math.max(0, Math.round((buildingsLinked + wonders) / 2.5));
    const events = 0;
    const missingDependencies = dependencyGraph.find((item) => item.title === ageEntry.name)?.dependsOn.filter((dependency) => !hasDependency(researchRows, unlockRows, dependency)) ?? [];
    const metric: AgeMetric = {
      age: ageEntry.name,
      shortAge,
      completion: 0,
      researchLinked,
      researchTarget: target.research,
      buildingsLinked,
      buildingTarget: target.buildings,
      upgradesLinked,
      upgradeTarget: target.upgrades,
      unlockRules,
      unlockTarget: target.unlocks,
      bonuses,
      bonusTarget: target.bonuses,
      artwork,
      artworkTarget: target.artwork,
      events,
      eventTarget: target.events,
      wonders,
      wonderTarget: target.wonders,
      resourcesComplete: researchLinked > 0 && unlockRules > 0,
      missingDependencies,
      validationStatus: "Partial"
    };
    metric.completion = ageCompletion(metric);
    metric.validationStatus = metric.completion >= 82 && !missingDependencies.length ? "Complete" : metric.completion < 45 || missingDependencies.length > 2 ? "Needs Work" : "Partial";
    return metric;
  });

  const frameworkCompletion = average(ageMetrics.map((metric) => metric.completion));
  const researchIntegration = percent(researchRows.filter((node) => node.unlock_summary || node.space_system_unlocked || node.primary_unlock_type).length, Math.max(1, researchRows.length));
  const buildingsConnected = percent(buildingRows.filter((building) => building.unlock_research_id || building.district_id || building.upgrade_chain).length, Math.max(1, buildingRows.length));
  const unlockCompleteness = percent(unlockRows.filter((row) => row.implementation_status !== "Missing" && row.implementation_status !== "Blocked").length, Math.max(1, unlockRows.length));
  const wonderDefinitions = percent(wonderRows.filter((wonder) => wonder.status !== "Missing" && wonder.bonuses?.length).length, Math.max(1, wonderRows.length || 6));
  const civilizationSystem = projectSystemRows.find((system) => system.id === "civilization-identity" || system.name.toLowerCase().includes("civilization"));
  const exportReady = civilizationSystem?.completion_percent ?? average([researchIntegration, buildingsConnected, unlockCompleteness]);

  const validationIssues: ValidationIssue[] = [
    ...ageMetrics
      .filter((metric) => metric.wonders === 0 && ["Future", "Interstellar", "Galactic", "Genesis"].includes(metric.shortAge))
      .map((metric): ValidationIssue => ({
        severity: "High",
        title: `${metric.shortAge} age has no Wonder definition.`,
        affectedRecords: metric.age,
        action: "Open Wonders"
      })),
    ...ageMetrics
      .filter((metric) => metric.buildingsLinked < Math.ceil(metric.buildingTarget * 0.35))
      .slice(0, 3)
      .map((metric): ValidationIssue => ({
        severity: "Medium",
        title: `${metric.shortAge} age needs more linked buildings.`,
        affectedRecords: `${metric.buildingsLinked}/${metric.buildingTarget} buildings`,
        action: "Open Buildings"
      })),
    ...dependencyGraph.flatMap((group) =>
      group.dependsOn
        .filter((dependency) => !hasDependency(researchRows, unlockRows, dependency))
        .slice(0, 2)
        .map((dependency): ValidationIssue => ({
          severity: group.title === "Genesis Age" ? "Critical" : "High",
          title: `${dependency} dependency is not connected.`,
          affectedRecords: group.title,
          action: "Open Research"
        }))
    )
  ].slice(0, 8);

  const missingTasks = [
    { label: "Missing Research", value: ageMetrics.filter((metric) => metric.researchLinked < metric.researchTarget).length, href: "Research" },
    { label: "Missing Buildings", value: ageMetrics.filter((metric) => metric.buildingsLinked < metric.buildingTarget).length, href: "Buildings" },
    { label: "Missing Bonuses", value: alignmentDesignRows.filter((row) => row.percent < 70).length, href: "Alignment Rules" },
    { label: "Missing Wonders", value: ageMetrics.filter((metric) => metric.wonders < metric.wonderTarget).length, href: "Wonders" },
    { label: "Missing Artwork", value: ageMetrics.filter((metric) => metric.artwork < metric.artworkTarget).length, href: "Assets" },
    { label: "Missing Events", value: ageMetrics.filter((metric) => metric.events < metric.eventTarget).length, href: "Events" },
    { label: "Missing Unlock Rules", value: ageMetrics.filter((metric) => metric.unlockRules < metric.unlockTarget).length, href: "Unlock Matrix" }
  ];

  const linkedSystems = [
    { label: "Research", percent: researchIntegration, icon: GitBranch },
    { label: "Buildings", percent: buildingsConnected, icon: Landmark },
    { label: "Unlock Matrix", percent: unlockCompleteness, icon: Network },
    { label: "Resources", percent: 76, icon: Boxes },
    { label: "Galaxy", percent: 68, icon: Rocket },
    { label: "Planet Generation", percent: 72, icon: Sparkles },
    { label: "Collectibles", percent: 46, icon: Layers3 },
    { label: "Events", percent: 18, icon: AlertTriangle },
    { label: "Artwork", percent: 12, icon: Palette },
    { label: "Prompt Library", percent: 64, icon: Code2 }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/85 shadow-glow">
        <div className="grid gap-6 border-b border-cyan-300/15 p-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Civilization Authoring</p>
            <h2 className="mt-2 text-4xl font-bold text-white">Civilization Design Studio</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              IDE workspace for designing civilization ages, dependencies, alignment rules, bonuses, unlocks, and export readiness.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {designMetric("Completion", `${frameworkCompletion}%`, frameworkCompletion >= 70 ? "good" : "partial")}
            {designMetric("Version", "2.1", "good")}
            {designMetric("Current Sprint", "Sprint 4", "partial")}
            {designMetric("Database Health", validationIssues.some((issue) => issue.severity === "Critical") ? "Needs Review" : "Excellent", validationIssues.some((issue) => issue.severity === "Critical") ? "missing" : "good")}
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          {progressRing("Civilization Ages", 100, `${ageMetrics.length} / ${civilizationAges.length} age cards defined.`)}
          {progressRing("Research Integration", researchIntegration, "Research rows connected to unlock and space progression fields.")}
          {progressRing("Buildings Connected", buildingsConnected, "Buildings linked through research, districts, or upgrade chains.")}
          {progressRing("Alignment Rules", average(alignmentDesignRows.map((row) => row.percent)), "Alignment rule and bonus coverage across major identity axes.")}
          {progressRing("Wonder Definitions", wonderDefinitions, "Wonder records with bonuses and validation status.")}
          {progressRing("Event Integration", 18, "Event hooks are not yet implemented as a dedicated table.")}
          {progressRing("Artwork", 12, "Civilization visual assets need dedicated production coverage.")}
          {progressRing("Exports Ready", exportReady, "Civilization data readiness for JSON, CSV, Supabase, and Roblox handoff.")}
        </div>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Age Design Matrix</p>
            <h3 className="mt-1 text-2xl font-bold text-white">What Still Needs To Be Designed</h3>
          </div>
          {pageButton("Open Age Editor")}
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {ageMetrics.map((metric) => (
            <div key={metric.age} className="rounded-md border border-cyan-300/15 bg-slate-950/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-cyan-300">{metric.shortAge}</p>
                  <p className="mt-1 text-2xl font-bold text-white">{metric.completion}%</p>
                </div>
                {statusBadge(metric.validationStatus)}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900">
                <div className="h-full rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.45)]" style={{ width: `${metric.completion}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {designMetric("Research", `${metric.researchLinked} / ${metric.researchTarget}`, metric.researchLinked >= metric.researchTarget ? "good" : "partial")}
                {designMetric("Buildings", `${metric.buildingsLinked} / ${metric.buildingTarget}`, metric.buildingsLinked >= metric.buildingTarget ? "good" : "partial")}
                {designMetric("Unlock Rules", `${metric.unlockRules} / ${metric.unlockTarget}`, metric.unlockRules >= metric.unlockTarget ? "good" : "partial")}
                {designMetric("Bonuses", `${metric.bonuses} / ${metric.bonusTarget}`, metric.bonuses >= metric.bonusTarget ? "good" : "partial")}
                {designMetric("Artwork", `${metric.artwork} / ${metric.artworkTarget}`, metric.artwork >= metric.artworkTarget ? "good" : "missing")}
                {designMetric("Events", `${metric.events} / ${metric.eventTarget}`, metric.events >= metric.eventTarget ? "good" : "missing")}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Dependencies: {metric.missingDependencies.length ? `${metric.missingDependencies.length} missing` : "Clear"}
                </p>
                {pageButton("Open Age")}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Alignment Designer</p>
              <h3 className="text-xl font-bold text-white">Rule Completion</h3>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {alignmentDesignRows.map((row) => (
              <div key={row.name} className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{row.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{row.detail}</p>
                  </div>
                  {statusBadge(row.status === "Complete" || row.status === "Rules Complete" ? "Complete" : "Partial")}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900">
                  <div className="h-full rounded-full bg-cyan-300" style={{ width: `${row.percent}%` }} />
                </div>
                <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">{row.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <Network className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Dependency Graph</p>
              <h3 className="text-xl font-bold text-white">Age Gate Requirements</h3>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {dependencyGraph.map((group) => (
              <div key={group.title} className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-bold text-white">{group.title}</p>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                  <p className="text-xs text-slate-400">{group.note}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.dependsOn.map((dependency) => {
                    const connected = hasDependency(researchRows, unlockRows, dependency);
                    return (
                      <span
                        key={dependency}
                        className={`rounded border px-3 py-1 text-xs font-semibold ${connected ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" : "border-rose-300/25 bg-rose-400/10 text-rose-100"}`}
                      >
                        {connected ? "Connected" : "Missing"}: {dependency}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Validation Panel</p>
              <h3 className="text-xl font-bold text-white">Database Scan</h3>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {validationIssues.map((issue) => (
              <div key={`${issue.title}-${issue.affectedRecords}`} className="grid gap-3 rounded-md border border-cyan-300/10 bg-slate-950/40 p-3 md:grid-cols-[7rem_1fr_auto]">
                {statusBadge(issue.severity)}
                <div>
                  <p className="font-semibold text-white">{issue.title}</p>
                  <p className="mt-1 text-xs text-slate-400">Affected records: {issue.affectedRecords}</p>
                </div>
                {pageButton(issue.action)}
              </div>
            ))}
            {!validationIssues.length ? (
              <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-4 text-emerald-100">
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                No civilization design validation warnings detected.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <CircleDashed className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Missing Content</p>
              <h3 className="text-xl font-bold text-white">Generated Task List</h3>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {missingTasks.map((task) => (
              <div key={task.label} className="flex items-center justify-between gap-4 rounded-md border border-cyan-300/10 bg-slate-950/40 p-3">
                <div>
                  <p className="font-semibold text-white">{task.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{task.value} age/system area{task.value === 1 ? "" : "s"} need attention.</p>
                </div>
                {pageButton(task.href)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Linked Systems</p>
              <h3 className="text-xl font-bold text-white">Integration Status</h3>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {linkedSystems.map((system) => {
              const Icon = system.icon;
              const status = system.percent >= 70 ? "Connected" : system.percent >= 35 ? "Partial" : "Missing";
              return (
                <div key={system.label} className="rounded-md border border-cyan-300/10 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-cyan-200" />
                      <p className="font-semibold text-white">{system.label}</p>
                    </div>
                    {statusBadge(status)}
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900">
                    <div className="h-full rounded-full bg-cyan-300" style={{ width: `${system.percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <Code2 className="h-5 w-5 text-cyan-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Export Status</p>
              <h3 className="text-xl font-bold text-white">Handoff Readiness</h3>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { label: "JSON", status: exportReady >= 65 ? "Ready" : "Needs Validation" },
              { label: "CSV", status: "Ready" },
              { label: "Supabase", status: validationIssues.some((issue) => issue.severity === "Critical") ? "Blocked" : "Needs Validation" },
              { label: "Roblox", status: exportReady >= 75 ? "Ready" : "Needs Validation" }
            ].map((exportItem) => (
              <div key={exportItem.label} className="flex items-center justify-between rounded-md border border-cyan-300/10 bg-slate-950/40 p-3">
                <p className="font-semibold text-white">{exportItem.label}</p>
                {statusBadge(exportItem.status)}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
