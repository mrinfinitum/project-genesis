"use client";

import { useMemo } from "react";
import Link from "next/link";
import { LayoutTemplate, Sparkles } from "lucide-react";
import { compileSpeciesPlatePrompt, type SpeciesPlateSource } from "@/lib/species-plates/compiler";
import { speciesPlatePresets } from "@/lib/species-plates/master-template";
import { VisualPromptOutput } from "@/components/visual-prompt-output";

export function SpeciesPlatePromptCard({ source }: { source: SpeciesPlateSource }) {
  const prompt = useMemo(() => compileSpeciesPlatePrompt(source), [source]);
  const preset = speciesPlatePresets.find((item) => item.id === prompt.presetId);
  return <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Visual Production · Species Plates</p><h2 className="mt-2 text-xl font-black text-white">{source.displayName} Reference Plate</h2><p className="mt-1 text-sm text-slate-400">4K museum plate prompt with locked canonical traits and extractable panel planning.</p></div><span className="rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-100">Prompt ready</span></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-3"><Meta label="Template" value="SPECIES_PLATE_MASTER_V1" /><Meta label="Preset" value={preset?.displayName ?? prompt.presetId} /><Meta label="Prompt hash" value={prompt.promptHash} /></div>
    <div className="mt-4 flex flex-wrap gap-2"><Link href={`/visual-production/species-plates?source=${encodeURIComponent(source.id)}&domain=${encodeURIComponent(source.domain)}`} className="inline-flex items-center gap-2 rounded-md border border-slate-600/60 px-3 py-2 text-xs font-black text-slate-200 hover:border-cyan-200/50"><LayoutTemplate className="h-3.5 w-3.5" />Open Plate Workspace</Link><span className="inline-flex items-center gap-2 rounded-md border border-violet-300/20 bg-violet-300/5 px-3 py-2 text-xs font-black text-violet-100"><Sparkles className="h-3.5 w-3.5" />{prompt.requestedVersionCount} controlled versions</span></div>
    <div className="mt-4"><VisualPromptOutput prompt={{ canonicalData: prompt.canonicalData, visualSummary: prompt.visualSummary, visualPrompt: prompt.visualPrompt, negativePrompt: prompt.negativePrompt, combinedPrompt: prompt.combinedPrompt, promptHash: prompt.promptHash, promptVersion: prompt.compilerVersion, modelProfileId: prompt.modelProfileId, resolvedVisualVariables: prompt.resolvedVariables, unresolvedVisualVariables: prompt.unresolvedVariables, validation: prompt.validation }} /></div>
  </section>;
}
function Meta({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-md border border-cyan-300/10 bg-slate-900/35 p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-100" title={value}>{value}</p></div>; }
