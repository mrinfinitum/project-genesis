"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Copy, Leaf, RefreshCw } from "lucide-react";
import { generatePlantLifeDraft, plantLifeCategories, plantLifeGrowthPatterns, plantLifeHabitats, type PlantLifeCategory, type PlantLifeGrowthPattern, type PlantLifeHabitat } from "@/lib/life/plant-system";
import { PlantPromptPanel } from "@/components/plant-prompt-panel";
import { SpeciesPlatePromptCard } from "@/components/species-plate-prompt-card";
import { speciesPlateSourceFromPlant } from "@/lib/species-plates/adapters";

const inputClass = "w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-slate-100 outline-none focus:border-cyan-200/60";

export function PlantLifeGeneratorWorkspace() {
  const [seed, setSeed] = useState("NOVERIS-PLANT-001");
  const [category, setCategory] = useState<PlantLifeCategory>("flora");
  const [habitat, setHabitat] = useState<PlantLifeHabitat>("surface");
  const [growthPattern, setGrowthPattern] = useState<PlantLifeGrowthPattern>("groundcover");
  const [draft, setDraft] = useState(() => generatePlantLifeDraft(seed, { category, habitat, growthPattern }));
  const [copied, setCopied] = useState(false);
  const json = useMemo(() => JSON.stringify(draft, null, 2), [draft]);
  const generate = () => setDraft(generatePlantLifeDraft(seed, { category, habitat, growthPattern }));
  const copy = async () => { await navigator.clipboard.writeText(json); setCopied(true); window.setTimeout(() => setCopied(false), 1200); };

  return <main className="space-y-6">
    <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-6"><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Environment Composer · Life</p><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="mt-2 text-3xl font-black text-white">Plant Life Generator</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Create deterministic plant-life drafts for flora, fungi, coral, mosses, trees, flowers, seeds, and spores. This is an authoring preview; the Game owns runtime growth and simulation.</p></div><span className="inline-flex items-center gap-2 rounded-md border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs font-bold text-amber-100"><Leaf className="h-4 w-4" /> Preview only</span></div></section>
    <section className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-black text-white">Generation Inputs</h2><Leaf className="h-5 w-5 text-cyan-200" /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Seed"><input className={inputClass} value={seed} onChange={(event) => setSeed(event.target.value)} /></Field><Field label="Category"><select className={inputClass} value={category} onChange={(event) => setCategory(event.target.value as PlantLifeCategory)}>{plantLifeCategories.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Habitat"><select className={inputClass} value={habitat} onChange={(event) => setHabitat(event.target.value as PlantLifeHabitat)}>{plantLifeHabitats.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Growth Pattern"><select className={inputClass} value={growthPattern} onChange={(event) => setGrowthPattern(event.target.value as PlantLifeGrowthPattern)}>{plantLifeGrowthPatterns.map((value) => <option key={value}>{value}</option>)}</select></Field></div><button type="button" onClick={generate} className="mt-6 inline-flex items-center gap-2 rounded-md border border-cyan-200/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-black text-cyan-100 hover:bg-cyan-300/20"><RefreshCw className="h-4 w-4" /> Generate Preview</button></div>
      <div className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Deterministic Plant Preview</p><h2 className="mt-2 text-2xl font-black text-white">{draft.displayName}</h2><p className="mt-1 text-sm text-slate-400">{draft.category} · {draft.habitat}</p></div><button type="button" onClick={copy} title="Copy plant JSON" className="inline-flex items-center gap-2 rounded-md border border-slate-600/60 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-200/50"><Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy JSON"}</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="ID" value={draft.id} /><Info label="Seed" value={draft.seed} /><Info label="Growth Pattern" value={draft.growthPattern} /><Info label="Ecological Role" value={draft.ecologicalRole} /></div><div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-900/40 p-4"><p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-500">Authoring boundary</p><p className="mt-2 text-sm leading-6 text-slate-300">{draft.authoringBoundary}</p></div><pre className="mt-4 max-h-64 overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/70 p-4 text-xs leading-5 text-cyan-100">{json}</pre></div>
    </section>
    <SpeciesPlatePromptCard source={speciesPlateSourceFromPlant(draft)} />
    <PlantPromptPanel plant={draft} />
  </main>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="space-y-2"><span className="block text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>{children}</label>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-md border border-cyan-300/10 bg-slate-900/35 p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-100" title={value}>{value}</p></div>; }
