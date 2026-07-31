import Link from "next/link";
import { Dna, Leaf, Orbit, ArrowRight, Layers3 } from "lucide-react";

const tools = [
  { href: "/creature-generator", label: "Creature Generator", description: "Generate deterministic species drafts from canonical taxonomy, habitats, ecology, and planet context.", icon: Dna },
  { href: "/plant-life-generator", label: "Plant Life Generator", description: "Generate deterministic flora, fungi, coral, moss, tree, flower, seed, and spore drafts.", icon: Leaf },
  { href: "/visual-production/species-plates", label: "Species Plates", description: "Compile canonical creature and life-record reference boards for review, source masters, and approved asset extraction.", icon: Layers3 },
  { href: "/species", label: "Species Library", description: "Browse approved and draft creature records connected to their canonical world references.", icon: Orbit }
];

export function LifeGeneratorWorkspace() {
  return <main className="space-y-6">
    <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Environment Composer · Life</p>
      <h1 className="mt-2 text-3xl font-black text-white">Life Generator</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Author deterministic creature and plant-life drafts against canonical planet, biome, resource, discovery, and art contracts. Drafts remain subject to author review before they become canonical content.</p>
    </section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tools.map(({ href, label, description, icon: Icon }) => <Link key={href} href={href} className="group rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5 transition hover:border-cyan-200/45 hover:bg-cyan-300/5">
        <div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"><Icon className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-100" /></div>
        <h2 className="mt-5 text-lg font-black text-white">{label}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </Link>)}
    </section>
  </main>;
}
