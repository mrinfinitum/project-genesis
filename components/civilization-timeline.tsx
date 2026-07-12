import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Lock, Sparkles } from "lucide-react";
import { WorkspaceBadge, WorkspaceMiniStat, WorkspaceProgressBar } from "@/components/ui/workspace";
import { cn } from "@/lib/utils";

export type TimelineEraState = "locked" | "active" | "completed" | "mastered";

export type TimelineEra = {
  id: string;
  eraNumber: number;
  displayName: string;
  shortDisplayName?: string;
  state: TimelineEraState;
  completionPercent: number;
  researchProgress: number;
  buildingProgress: number;
  unlockRequirements: string[];
  masteryRequirements: string[];
  missingArtwork: boolean;
  iconKey?: string;
};

export const canonicalTimelineEras = [
  "Survival",
  "Ancient",
  "Medieval",
  "Renaissance",
  "Industrial",
  "Modern",
  "Space Age",
  "Interstellar",
  "Galactic"
];

function eraId(name: string) {
  return name.toLowerCase().replace(/\s+age$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function createDefaultTimeline(currentEraName = "Survival Age"): TimelineEra[] {
  const normalizedCurrent = eraId(currentEraName);
  const activeIndex = Math.max(0, canonicalTimelineEras.findIndex((name) => eraId(name) === normalizedCurrent));
  return canonicalTimelineEras.map((name, index) => ({
    id: eraId(name),
    eraNumber: index + 1,
    displayName: name,
    shortDisplayName: name === "Space Age" ? "Space" : name,
    state: index < activeIndex ? "completed" : index === activeIndex ? "active" : "locked",
    completionPercent: index < activeIndex ? 100 : index === activeIndex ? 42 : 0,
    researchProgress: index < activeIndex ? 100 : index === activeIndex ? 48 : 0,
    buildingProgress: index < activeIndex ? 100 : index === activeIndex ? 36 : 0,
    unlockRequirements: index === 0 ? ["Start"] : [`Complete ${canonicalTimelineEras[index - 1]}`],
    masteryRequirements: ["Research complete", "Core buildings complete", "Era unlocks complete"],
    missingArtwork: true,
    iconKey: `era-${eraId(name)}`
  }));
}

function stateIcon(state: TimelineEraState) {
  if (state === "completed" || state === "mastered") return CheckCircle2;
  if (state === "locked") return Lock;
  return Sparkles;
}

function stateClasses(state: TimelineEraState, current = false) {
  if (current || state === "active") return "border-cyan-200/60 bg-cyan-300/15 text-cyan-50 shadow-[0_0_35px_rgba(56,213,255,0.16)]";
  if (state === "completed" || state === "mastered") return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  return "border-slate-600/60 bg-slate-950/55 text-slate-300";
}

export function EraJourneyConnector({ state }: { state: TimelineEraState }) {
  return (
    <div className="hidden items-center md:flex">
      <span className={cn("h-px flex-1", state === "locked" ? "bg-slate-700" : "bg-cyan-300/45")} />
      <ArrowRight className={cn("mx-2 h-4 w-4", state === "locked" ? "text-slate-600" : "text-cyan-200")} />
      <span className={cn("h-px flex-1", state === "locked" ? "bg-slate-700" : "bg-cyan-300/45")} />
    </div>
  );
}

export function EraJourneyNode({ era, emphasis = "normal" }: { era: TimelineEra; emphasis?: "muted" | "normal" | "current" }) {
  const Icon = stateIcon(era.state);
  const current = emphasis === "current";
  return (
    <div className={cn("rounded-md border p-4 transition", stateClasses(era.state, current), emphasis === "muted" ? "hidden lg:block" : "")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-current/70">Era {era.eraNumber}</p>
          <h3 className={cn("mt-2 font-black text-white", current ? "text-3xl" : "text-xl")}>{era.shortDisplayName ?? era.displayName}</h3>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md border border-current/25 bg-slate-950/35">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-current/70">
          <span>{era.state}</span>
          <span>{era.completionPercent}%</span>
        </div>
        <WorkspaceProgressBar value={era.completionPercent} />
      </div>
    </div>
  );
}

export function CurrentEraJourney({ eras, className }: { eras: TimelineEra[]; className?: string }) {
  const activeIndex = Math.max(0, eras.findIndex((era) => era.state === "active"));
  const previous = eras[activeIndex - 1] ?? null;
  const current = eras[activeIndex] ?? eras[0];
  const next = eras[activeIndex + 1] ?? null;

  return (
    <section className={cn("rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Current Journey</p>
          <h2 className="mt-2 text-2xl font-black text-white">{current.displayName}</h2>
        </div>
        <Link href="/civilizations#full-civilization-timeline" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
          View Full Timeline
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_3rem_1fr] xl:grid-cols-[1fr_3rem_1.25fr_3rem_1fr]">
        {previous ? <EraJourneyNode era={previous} emphasis="muted" /> : null}
        {previous ? (
          <div className="hidden lg:block">
            <EraJourneyConnector state={current.state} />
          </div>
        ) : null}
        <EraJourneyNode era={current} emphasis="current" />
        {next ? <EraJourneyConnector state={next.state} /> : null}
        {next ? <EraJourneyNode era={next} /> : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <WorkspaceMiniStat label="Current Era Completion" value={`${current.completionPercent}%`} />
        <WorkspaceMiniStat label="Next Era Unlock" value={next ? `${Math.min(100, Math.round((current.researchProgress + current.buildingProgress) / 2))}%` : "Complete"} />
      </div>
    </section>
  );
}

export function TimelineEraCard({ era }: { era: TimelineEra }) {
  const Icon = stateIcon(era.state);
  return (
    <article className={cn("rounded-md border p-4", stateClasses(era.state))}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-current/70">Era {era.eraNumber}</p>
          <h3 className="mt-2 text-2xl font-black text-white">{era.displayName}</h3>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-md border border-current/25 bg-slate-950/35">
          <Icon className="h-6 w-6" />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-current/70">
            <span>Completion</span>
            <span>{era.completionPercent}%</span>
          </div>
          <WorkspaceProgressBar value={era.completionPercent} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <WorkspaceMiniStat label="Research" value={`${era.researchProgress}%`} />
          <WorkspaceMiniStat label="Buildings" value={`${era.buildingProgress}%`} />
        </div>
        <div className="flex flex-wrap gap-2">
          <WorkspaceBadge value={era.state} />
          <WorkspaceBadge value={era.missingArtwork ? "art missing" : "art ready"} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">
        <p><span className="font-bold text-cyan-100">Unlock:</span> {era.unlockRequirements.join(", ")}</p>
        <p><span className="font-bold text-cyan-100">Mastery:</span> {era.masteryRequirements.join(", ")}</p>
      </div>

      <Link href={`/civilizations#era-${era.id}`} className="mt-4 inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
        Open Era
      </Link>
    </article>
  );
}

export function FullCivilizationTimeline({ eras }: { eras: TimelineEra[] }) {
  return (
    <section id="full-civilization-timeline" className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Full Civilization Timeline</p>
          <h2 className="mt-1 text-2xl font-black text-white">All Nine Canonical Eras</h2>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <CircleDashed className="h-4 w-4 text-cyan-200" />
          Responsive roadmap, no squeezed labels
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {eras.map((era) => <TimelineEraCard key={era.id} era={era} />)}
      </div>
    </section>
  );
}
