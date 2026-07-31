"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Copy, Dna, RefreshCw, Sparkles } from "lucide-react";
import { creatureEcologicalRoles, creatureFunctionalCategories, creatureHabitats, generateSpeciesDraft, type CreatureGenerationMode, type SpeciesRecord } from "@/lib/life/creature-system";
import { CreaturePromptPanel } from "@/components/creature-prompt-panel";

const inputClass = "w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-slate-100 outline-none focus:border-cyan-200/60";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-2"><span className="block text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>{children}</label>;
}

export function CreatureGeneratorWorkspace() {
  const [seed, setSeed] = useState("NOVERIS-CREATURE-001");
  const [mode, setMode] = useState<CreatureGenerationMode>("scientific");
  const [category, setCategory] = useState<(typeof creatureFunctionalCategories)[number]>("terrestrial");
  const [habitat, setHabitat] = useState<(typeof creatureHabitats)[number]>("surface");
  const [role, setRole] = useState<(typeof creatureEcologicalRoles)[number]>("grazer");
  const [draft, setDraft] = useState<SpeciesRecord>(() => generateSpeciesDraft(seed, { generationMode: mode, functionalCategory: category, habitat, ecologicalRole: role }));
  const [copied, setCopied] = useState(false);
  const generate = () => setDraft(generateSpeciesDraft(seed, { generationMode: mode, functionalCategory: category, habitat, ecologicalRole: role }));
  const json = useMemo(() => JSON.stringify(draft, null, 2), [draft]);
  const copy = async () => { await navigator.clipboard.writeText(json); setCopied(true); window.setTimeout(() => setCopied(false), 1200); };

  return <main className="space-y-6">
    <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Creative Production · Life</p><h1 className="mt-2 text-3xl font-black text-white">Creature Generator</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Create deterministic species previews from canonical taxonomy, planet, biome, resource, discovery, and art contracts. A preview becomes canonical only after author review.</p></div>
        <div className="flex items-center gap-2 rounded-md border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs font-bold text-amber-100"><Dna className="h-4 w-4" /> Preview only</div>
      </div>
    </section>
    <section className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-black text-white">Generation Inputs</h2><Sparkles className="h-5 w-5 text-cyan-200" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Seed"><input className={inputClass} value={seed} onChange={(event) => setSeed(event.target.value)} /></Field>
          <Field label="Generation Mode"><select className={inputClass} value={mode} onChange={(event) => setMode(event.target.value as CreatureGenerationMode)}>{["scientific", "cinematic", "exotic", "artificial"].map((value) => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Functional Type"><select className={inputClass} value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>{creatureFunctionalCategories.map((value) => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Habitat"><select className={inputClass} value={habitat} onChange={(event) => setHabitat(event.target.value as typeof habitat)}>{creatureHabitats.map((value) => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Ecological Role"><select className={inputClass} value={role} onChange={(event) => setRole(event.target.value as typeof role)}>{creatureEcologicalRoles.map((value) => <option key={value}>{value}</option>)}</select></Field>
        </div>
        <button type="button" onClick={generate} className="mt-6 inline-flex items-center gap-2 rounded-md border border-cyan-200/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-black text-cyan-100 hover:bg-cyan-300/20"><RefreshCw className="h-4 w-4" /> Generate Preview</button>
      </div>
      <div className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Deterministic Species Preview</p><h2 className="mt-2 text-2xl font-black text-white">{draft.displayName}</h2><p className="mt-1 text-sm italic text-slate-400">{draft.scientificName}</p></div><button type="button" onClick={copy} title="Copy species JSON" className="inline-flex items-center gap-2 rounded-md border border-slate-600/60 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-200/50"><Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy JSON"}</button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><Info label="Body Plan" value={draft.appearance.bodyPlan} /><Info label="Habitat" value={draft.habitats.join(", ")} /><Info label="Role" value={draft.ecologicalRoles.join(", ")} /></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><Info label="Taxonomy" value={`${draft.taxonomy.kingdom} · ${draft.taxonomy.class}`} /><Info label="Movement" value={draft.appearance.locomotion.join(", ")} /><Info label="Compatibility" value={`${draft.compatibility.gravityRange.join("–")} G · ${draft.compatibility.temperatureRangeC.join("–")}°C`} /><Info label="Confidence" value={draft.confidence} /></div>
        <div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-900/40 p-4"><p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-500">Authoring boundary</p><p className="mt-2 text-sm leading-6 text-slate-300">Studio owns this definition and its approved references. The Game owns spawned creatures, animation runtime, simulation, and player-specific collection state.</p></div>
      </div>
    </section>
    <CreaturePromptPanel species={draft} />
  </main>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-md border border-cyan-300/10 bg-slate-900/35 p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-100" title={value}>{value}</p></div>; }
