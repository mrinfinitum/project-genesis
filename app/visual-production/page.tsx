import Link from "next/link";
import { Camera, CheckCircle2, Dna, Flower2, Layers3, Sparkles } from "lucide-react";
import { backgroundProfiles, cameraProfiles, compositionProfiles, creatureArchetypes, lightingProfiles, plantArchetypes, productionOutputs, variationProfiles } from "@/lib/visual-production/nano-banana-2";

const modules = [
  { label: "Creature Archetypes", value: creatureArchetypes.length, detail: "Canonical families and locked morphology grammar", icon: Dna },
  { label: "Plant Archetypes", value: plantArchetypes.length, detail: "Canonical growth and structure grammar", icon: Flower2 },
  { label: "Output Grammars", value: productionOutputs.length, detail: "Production, reference, scan, UI, and PSD outputs", icon: Layers3 },
  { label: "Variation Profiles", value: variationProfiles.length, detail: "Controlled interpretations inside locked canon", icon: Sparkles }
];

export default function VisualProductionPage() {
  return <main className="space-y-6">
    <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Creative Production · Visual Production Engine</p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-5">
        <div><h1 className="text-3xl font-black text-white">Nano Banana 2 Prompt Compiler</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Studio-only deterministic prompt composition for canonical life records. Locked canonical traits are preserved; game runtimes receive only sanitized provenance when an asset is approved.</p></div>
        <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-100"><CheckCircle2 className="h-4 w-4" /> Compiler Ready</span>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{modules.map(({ label, value, detail, icon: Icon }) => <div key={label} className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5"><Icon className="h-5 w-5 text-cyan-200" /><p className="mt-4 text-[0.68rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-white">{value}</p><p className="mt-2 text-sm leading-5 text-slate-400">{detail}</p></div>)}</section>

    <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-6"><div className="flex items-center gap-3"><Camera className="h-5 w-5 text-cyan-200" /><h2 className="text-xl font-black text-white">Shared Production Grammar</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Grammar label="Camera Profiles" value={cameraProfiles.length} /><Grammar label="Lighting Profiles" value={lightingProfiles.length} /><Grammar label="Background Profiles" value={backgroundProfiles.length} /><Grammar label="Composition Profiles" value={compositionProfiles.length} /></div><p className="mt-5 text-sm leading-6 text-slate-400">The compiler resolves canonical data, archetype grammar, selected output, environmental framing, production rules, negative rules, and a controlled variation profile in a deterministic order.</p></div>
      <div className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-6"><h2 className="text-xl font-black text-white">Authoring Surfaces</h2><p className="mt-2 text-sm leading-6 text-slate-400">Open a generator to assemble, copy, validate, and export a Nano Banana 2 prompt pack.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/creature-generator" className="rounded-md border border-cyan-200/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-black text-cyan-100 hover:bg-cyan-300/20">Creature Generator</Link><Link href="/plant-life-generator" className="rounded-md border border-cyan-200/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-black text-cyan-100 hover:bg-cyan-300/20">Plant Generator</Link><Link href="/species" className="rounded-md border border-slate-600/60 px-4 py-2.5 text-sm font-black text-slate-200 hover:border-cyan-200/50">Species Library</Link></div></div>
    </section>
  </main>;
}

function Grammar({ label, value }: { label: string; value: number }) { return <div className="rounded-md border border-cyan-300/10 bg-slate-900/35 p-4"><p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-white">{value}</p></div>; }
