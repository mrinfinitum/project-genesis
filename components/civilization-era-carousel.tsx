"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, CircleDot, Lock, Sparkles } from "lucide-react";
import type { TimelineEra } from "@/components/civilization-timeline";
import { cn } from "@/lib/utils";

type CivilizationEraCarouselProps = {
  eras: TimelineEra[];
  className?: string;
};

const eraAccent: Record<string, string> = {
  survival: "#5ef2a1",
  ancient: "#ffd166",
  medieval: "#7dd3fc",
  renaissance: "#f5d0fe",
  industrial: "#fed7aa",
  modern: "#bfdbfe",
  "space-age": "#38d5ff",
  interstellar: "#ddd6fe",
  galactic: "#99f6e4"
};

function accentFor(era: TimelineEra) {
  return eraAccent[era.id] ?? "#38d5ff";
}

function nodeState(index: number, activeIndex: number) {
  if (index < activeIndex) return "completed";
  if (index === activeIndex) return "current";
  return "locked";
}

function NodeIcon({ state }: { state: "completed" | "current" | "locked" | "preview" }) {
  if (state === "completed") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (state === "current") return <Sparkles className="h-4 w-4" />;
  if (state === "preview") return <CircleDot className="h-3.5 w-3.5" />;
  return <Lock className="h-3 w-3" />;
}

function ProgressRing({ value, accent }: { value: number; accent: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <span
      className="absolute -inset-2 rounded-full opacity-95"
      style={{ background: `conic-gradient(${accent} ${clamped * 3.6}deg, rgba(100,116,139,0.28) 0deg)` }}
      aria-hidden="true"
    >
      <span className="absolute inset-[3px] rounded-full bg-[#06101e]" />
    </span>
  );
}

function HexNode({
  era,
  index,
  activeIndex,
  previewIndex,
  onPreview,
  onCurrentInfo
}: {
  era: TimelineEra;
  index: number;
  activeIndex: number;
  previewIndex: number;
  onPreview: (index: number) => void;
  onCurrentInfo: (open: boolean) => void;
}) {
  const state = nodeState(index, activeIndex);
  const current = state === "current";
  const adjacent = Math.abs(index - previewIndex) === 1;
  const preview = index === previewIndex && !current;
  const accent = accentFor(era);

  return (
    <button
      type="button"
      onClick={() => {
        onPreview(index);
        if (current) onCurrentInfo(true);
      }}
      onMouseEnter={() => {
        if (current) onCurrentInfo(true);
      }}
      onMouseLeave={() => {
        if (current) onCurrentInfo(false);
      }}
      onFocus={() => {
        if (current) onCurrentInfo(true);
      }}
      onBlur={() => {
        if (current) onCurrentInfo(false);
      }}
      className={cn(
        "group relative grid place-items-center text-cyan-50 transition duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200",
        "[clip-path:polygon(25%_4%,75%_4%,100%_50%,75%_96%,25%_96%,0_50%)]",
        current ? "h-20 w-20 sm:h-24 sm:w-24" : adjacent ? "h-12 w-12 sm:h-14 sm:w-14" : "h-6 w-6 sm:h-7 sm:w-7",
        current ? "era-carousel-pulse" : "",
        !current && !adjacent ? "opacity-65 hover:opacity-100" : "",
        preview ? "scale-110" : ""
      )}
      style={{
        background: current
          ? `linear-gradient(145deg, rgba(56,213,255,0.28), rgba(6,16,30,0.88) 52%, ${accent}33)`
          : state === "completed"
            ? "linear-gradient(145deg, rgba(94,242,161,0.28), rgba(6,16,30,0.85))"
            : "linear-gradient(145deg, rgba(148,163,184,0.16), rgba(6,16,30,0.9))",
        border: `1px solid ${current || preview ? accent : state === "completed" ? "rgba(94,242,161,0.55)" : "rgba(100,116,139,0.48)"}`,
        boxShadow: current ? `0 0 30px ${accent}40, inset 0 0 24px rgba(56,213,255,0.08)` : undefined
      }}
      aria-label={`${era.displayName} era ${state}`}
    >
      {current ? <ProgressRing value={era.completionPercent} accent={accent} /> : null}
      <span className="relative z-10 grid place-items-center">
        <NodeIcon state={preview ? "preview" : state} />
        {current ? <span className="mt-0.5 text-[0.65rem] font-black">{era.eraNumber}</span> : null}
      </span>
    </button>
  );
}

export function CivilizationEraCarousel({ eras, className }: CivilizationEraCarouselProps) {
  const activeIndex = Math.max(0, eras.findIndex((era) => era.state === "active"));
  const [previewIndex, setPreviewIndex] = useState(activeIndex);
  const [infoOpen, setInfoOpen] = useState(false);
  const activeEra = eras[activeIndex] ?? eras[0];
  const previewEra = eras[previewIndex] ?? activeEra;
  const nextEra = eras[activeIndex + 1] ?? null;
  const previewing = previewIndex !== activeIndex;
  const unlockProgress = useMemo(() => Math.min(100, Math.round((activeEra.researchProgress + activeEra.buildingProgress) / 2)), [activeEra]);

  return (
    <section className={cn("relative overflow-visible px-2 pb-1 pt-4", className)}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06101e]/95 via-[#06101e]/58 to-transparent" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="relative flex min-h-28 items-end justify-center">
          <span className="absolute bottom-[3.45rem] left-6 right-6 h-px bg-cyan-200/18" />
          <span
            className="absolute bottom-[3.45rem] left-6 h-px bg-gradient-to-r from-emerald-300 via-cyan-300 to-cyan-100 transition-all duration-500 ease-out"
            style={{ width: `${eras.length > 1 ? (activeIndex / (eras.length - 1)) * 100 : 0}%`, maxWidth: "calc(100% - 3rem)" }}
          />

          <div className="grid w-full grid-cols-9 items-end gap-1 sm:gap-3">
            {eras.map((era, index) => (
              <div key={era.id} className="grid justify-items-center gap-2">
                <HexNode
                  era={era}
                  index={index}
                  activeIndex={activeIndex}
                  previewIndex={previewIndex}
                  onPreview={setPreviewIndex}
                  onCurrentInfo={setInfoOpen}
                />
                {index === activeIndex ? (
                  <div className="min-h-10 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white">{activeEra.shortDisplayName ?? activeEra.displayName}</p>
                    <p className="mt-0.5 text-sm font-black text-cyan-100">{activeEra.completionPercent}%</p>
                  </div>
                ) : index === activeIndex - 1 || index === activeIndex + 1 ? (
                  <p className="hidden min-h-10 max-w-20 text-center text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-400 sm:block">{era.shortDisplayName ?? era.displayName}</p>
                ) : (
                  <span className="min-h-10" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 rounded-md border border-cyan-300/10 bg-slate-950/30 px-3 py-2 backdrop-blur-sm">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-500">Unlock</p>
            <p className="text-sm font-black text-cyan-100">{nextEra ? `${nextEra.shortDisplayName ?? nextEra.displayName} ${unlockProgress}%` : "Mastered"}</p>
          </div>

          <Link href="/civilizations#full-civilization-timeline" className="absolute bottom-0 right-0 rounded-md border border-cyan-300/15 bg-slate-950/30 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-sm transition hover:bg-cyan-300/10">
            Full Timeline
          </Link>

          {(infoOpen || previewing) ? (
            <div className="absolute bottom-24 left-1/2 z-20 w-[min(22rem,calc(100vw-3rem))] -translate-x-1/2 rounded-md border border-cyan-200/25 bg-[#06101e]/95 p-3 shadow-[0_0_32px_rgba(56,213,255,0.18)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-300">{previewing ? "Preview" : "Current Era"}</p>
                  <h3 className="mt-1 text-lg font-black text-white">{previewEra.displayName}</h3>
                </div>
                {previewing ? (
                  <button type="button" onClick={() => setPreviewIndex(activeIndex)} className="rounded-md border border-emerald-300/20 px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-emerald-100 hover:bg-emerald-300/10">
                    Return
                  </button>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/50 p-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">Complete</p>
                  <p className="text-sm font-black text-white">{previewEra.completionPercent}%</p>
                </div>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/50 p-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">Research</p>
                  <p className="text-sm font-black text-white">{previewEra.researchProgress}%</p>
                </div>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/50 p-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">Build</p>
                  <p className="text-sm font-black text-white">{previewEra.buildingProgress}%</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
