"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDot, Lock, RotateCcw, Sparkles } from "lucide-react";
import type { PointerEvent } from "react";
import type { TimelineEra } from "@/components/civilization-timeline";
import { WorkspaceProgressBar } from "@/components/ui/workspace";
import { cn } from "@/lib/utils";

type CivilizationEraCarouselProps = {
  eras: TimelineEra[];
  className?: string;
};

const eraTones: Record<string, { border: string; glow: string; accent: string; surface: string }> = {
  survival: { border: "border-emerald-300/45", glow: "shadow-[0_0_54px_rgba(94,242,161,0.18)]", accent: "from-emerald-300/30 via-cyan-300/18 to-transparent", surface: "bg-emerald-300/10" },
  ancient: { border: "border-amber-200/45", glow: "shadow-[0_0_54px_rgba(255,209,102,0.16)]", accent: "from-amber-200/28 via-cyan-300/14 to-transparent", surface: "bg-amber-200/10" },
  medieval: { border: "border-sky-300/45", glow: "shadow-[0_0_54px_rgba(125,211,252,0.16)]", accent: "from-sky-300/26 via-cyan-300/16 to-transparent", surface: "bg-sky-300/10" },
  renaissance: { border: "border-fuchsia-200/45", glow: "shadow-[0_0_54px_rgba(245,208,254,0.16)]", accent: "from-fuchsia-200/24 via-cyan-300/18 to-transparent", surface: "bg-fuchsia-200/10" },
  industrial: { border: "border-orange-200/45", glow: "shadow-[0_0_54px_rgba(254,215,170,0.15)]", accent: "from-orange-200/24 via-cyan-300/14 to-transparent", surface: "bg-orange-200/10" },
  modern: { border: "border-blue-200/45", glow: "shadow-[0_0_54px_rgba(191,219,254,0.16)]", accent: "from-blue-200/26 via-cyan-300/16 to-transparent", surface: "bg-blue-200/10" },
  "space-age": { border: "border-cyan-200/55", glow: "shadow-[0_0_60px_rgba(56,213,255,0.2)]", accent: "from-cyan-200/30 via-blue-400/18 to-transparent", surface: "bg-cyan-300/10" },
  interstellar: { border: "border-violet-200/50", glow: "shadow-[0_0_60px_rgba(221,214,254,0.18)]", accent: "from-violet-200/28 via-cyan-300/16 to-transparent", surface: "bg-violet-200/10" },
  galactic: { border: "border-teal-200/55", glow: "shadow-[0_0_64px_rgba(153,246,228,0.19)]", accent: "from-teal-200/30 via-cyan-300/20 to-transparent", surface: "bg-teal-200/10" }
};

function toneFor(era: TimelineEra) {
  return eraTones[era.id] ?? eraTones.survival;
}

function stateLabel(activeIndex: number, index: number, previewing: boolean) {
  if (previewing) return "Preview";
  if (index < activeIndex) return "Completed";
  if (index === activeIndex) return "Current";
  return "Locked";
}

function stateIcon(era: TimelineEra, activeIndex: number, index: number, previewing: boolean) {
  if (previewing) return CircleDot;
  if (index < activeIndex) return CheckCircle2;
  if (index === activeIndex) return Sparkles;
  return Lock;
}

function EraCarouselCard({
  era,
  index,
  activeIndex,
  variant,
  previewing,
  onPreview
}: {
  era: TimelineEra;
  index: number;
  activeIndex: number;
  variant: "previous" | "current" | "next";
  previewing: boolean;
  onPreview: (index: number) => void;
}) {
  const tone = toneFor(era);
  const Icon = stateIcon(era, activeIndex, index, previewing);
  const compact = variant !== "current";
  const nextUnlock = era.unlockRequirements[0] ?? "Era progression";

  return (
    <button
      type="button"
      onClick={() => onPreview(index)}
      className={cn(
        "group relative flex min-h-[15rem] flex-col overflow-hidden border text-left transition duration-500 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200",
        "[clip-path:polygon(7%_0,93%_0,100%_12%,100%_88%,93%_100%,7%_100%,0_88%,0_12%)]",
        compact ? "scale-[0.86] opacity-55 hover:scale-[0.9] hover:opacity-85" : "era-carousel-pulse z-10 scale-100 opacity-100",
        variant === "previous" ? "-translate-x-10 sm:-translate-x-16" : "",
        variant === "next" ? "translate-x-10 sm:translate-x-16" : "",
        compact ? "p-4" : "p-5 sm:p-6",
        tone.border,
        compact ? "bg-[#07101e]/70 shadow-[0_0_28px_rgba(56,213,255,0.08)]" : `bg-[#07101e]/95 ${tone.glow}`
      )}
      aria-label={`${previewing ? "Previewing" : "Preview"} ${era.displayName} era`}
    >
      <span className={cn("absolute inset-0 bg-gradient-to-br", tone.accent)} />
      <span className="absolute inset-x-6 top-0 h-px bg-cyan-200/55" />
      {!compact ? <span className="era-carousel-sweep absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-cyan-100/12 to-transparent" /> : null}

      <span className="relative z-10 flex items-start justify-between gap-3">
        <span>
          <span className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-cyan-100/70">Era {era.eraNumber}</span>
          <span className={cn("mt-2 block font-black text-white", compact ? "text-xl" : "text-4xl sm:text-5xl")}>{era.shortDisplayName ?? era.displayName}</span>
        </span>
        <span className={cn("grid place-items-center border border-current/25 bg-slate-950/45 text-cyan-100", compact ? "h-10 w-10 rounded-md" : "h-14 w-14 rounded-lg")}>
          <Icon className={cn(compact ? "h-5 w-5" : "h-7 w-7")} />
        </span>
      </span>

      <span className="relative z-10 mt-auto block">
        <span className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">
          <span>{stateLabel(activeIndex, index, previewing)}</span>
          <span>{era.completionPercent}%</span>
        </span>
        <WorkspaceProgressBar value={era.completionPercent} />
        {!compact ? (
          <span className="mt-4 grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
            <span className={cn("inline-flex w-fit items-center rounded-md border border-current/20 px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-100", tone.surface)}>
              {era.missingArtwork ? "Art pending" : "Art ready"}
            </span>
            <span className="text-sm font-semibold text-slate-300">Next unlock: {nextUnlock}</span>
          </span>
        ) : null}
      </span>
    </button>
  );
}

function JourneyTrack({ eras, activeIndex, previewIndex }: { eras: TimelineEra[]; activeIndex: number; previewIndex: number }) {
  return (
    <div className="mt-5">
      <div className="relative flex items-center justify-between gap-2 px-1">
        <span className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-slate-700/70" />
        <span
          className="absolute left-3 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-emerald-300 via-cyan-300 to-cyan-200 transition-all duration-500 ease-out"
          style={{ width: `${eras.length > 1 ? (activeIndex / (eras.length - 1)) * 100 : 0}%`, maxWidth: "calc(100% - 1.5rem)" }}
        />
        {eras.map((era, index) => {
          const completed = index < activeIndex;
          const current = index === activeIndex;
          const preview = index === previewIndex && previewIndex !== activeIndex;
          return (
            <span key={era.id} className="relative z-10 grid justify-items-center gap-1">
              <span
                className={cn(
                  "grid h-4 w-4 place-items-center rounded-full border text-[0.55rem] font-black transition duration-500",
                  completed ? "border-emerald-200 bg-emerald-300 text-slate-950" : "",
                  current ? "h-5 w-5 border-cyan-100 bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(56,213,255,0.55)]" : "",
                  preview ? "border-fuchsia-200 bg-fuchsia-300 text-slate-950 shadow-[0_0_16px_rgba(245,208,254,0.35)]" : "",
                  !completed && !current && !preview ? "border-slate-600 bg-slate-950 text-slate-500" : ""
                )}
                title={`Era ${era.eraNumber}: ${era.displayName}`}
              >
                {era.eraNumber}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function CivilizationEraCarousel({ eras, className }: CivilizationEraCarouselProps) {
  const activeIndex = Math.max(0, eras.findIndex((era) => era.state === "active"));
  const [previewIndex, setPreviewIndex] = useState(activeIndex);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const current = eras[previewIndex] ?? eras[activeIndex] ?? eras[0];
  const previous = eras[previewIndex - 1] ?? null;
  const next = eras[previewIndex + 1] ?? null;
  const previewing = previewIndex !== activeIndex;
  const unlockProgress = useMemo(() => {
    const active = eras[activeIndex] ?? current;
    return Math.min(100, Math.round((active.researchProgress + active.buildingProgress) / 2));
  }, [activeIndex, current, eras]);

  function movePreview(direction: -1 | 1) {
    setPreviewIndex((index) => Math.min(eras.length - 1, Math.max(0, index + direction)));
  }

  function handleWheel(event: React.WheelEvent<HTMLElement>) {
    if (Math.abs(event.deltaX) < 24 && Math.abs(event.deltaY) < 40) return;
    movePreview(event.deltaX + event.deltaY > 0 ? 1 : -1);
  }

  function handlePointerEnd(event: PointerEvent<HTMLElement>) {
    if (dragStart === null) return;
    const delta = event.clientX - dragStart;
    setDragStart(null);
    if (Math.abs(delta) < 40) return;
    movePreview(delta < 0 ? 1 : -1);
  }

  return (
    <section
      className={cn("relative overflow-hidden rounded-md border border-cyan-300/15 bg-[#060d1a]/80 p-4 shadow-[0_0_60px_rgba(56,213,255,0.12)] sm:p-5", className)}
      onWheel={handleWheel}
      onPointerDown={(event) => setDragStart(event.clientX)}
      onPointerUp={handlePointerEnd}
      onPointerCancel={() => setDragStart(null)}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cyan-950/35 to-transparent" />
      <div className="pointer-events-none absolute -inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Current Journey</p>
          <h2 className="mt-2 text-2xl font-black text-white">Civilization Era Carousel</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {previewing ? (
            <button type="button" onClick={() => setPreviewIndex(activeIndex)} className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 text-sm font-bold text-emerald-100 hover:bg-emerald-300/20">
              <RotateCcw className="h-4 w-4" />
              Current Era
            </button>
          ) : null}
          <Link href="/civilizations#full-civilization-timeline" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
            View Full Timeline
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
        <button
          type="button"
          onClick={() => movePreview(-1)}
          disabled={previewIndex === 0}
          className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/20 bg-slate-950/55 text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Preview previous era"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="grid min-h-[18rem] grid-cols-[0.42fr_1fr_0.42fr] items-center overflow-hidden px-1 sm:px-4">
          <div className="min-w-0">{previous ? <EraCarouselCard era={previous} index={previewIndex - 1} activeIndex={activeIndex} variant="previous" previewing={false} onPreview={setPreviewIndex} /> : null}</div>
          <EraCarouselCard era={current} index={previewIndex} activeIndex={activeIndex} variant="current" previewing={previewing} onPreview={setPreviewIndex} />
          <div className="min-w-0">{next ? <EraCarouselCard era={next} index={previewIndex + 1} activeIndex={activeIndex} variant="next" previewing={false} onPreview={setPreviewIndex} /> : null}</div>
        </div>

        <button
          type="button"
          onClick={() => movePreview(1)}
          disabled={previewIndex === eras.length - 1}
          className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/20 bg-slate-950/55 text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Preview next era"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="relative z-10 mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <JourneyTrack eras={eras} activeIndex={activeIndex} previewIndex={previewIndex} />
        <div className="grid gap-2 sm:grid-cols-2 lg:w-80">
          <div className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-3">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-500">Current Completion</p>
            <p className="mt-1 text-xl font-black text-white">{eras[activeIndex]?.completionPercent ?? 0}%</p>
          </div>
          <div className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-3">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-500">Next Unlock</p>
            <p className="mt-1 text-xl font-black text-white">{activeIndex === eras.length - 1 ? "Complete" : `${unlockProgress}%`}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
