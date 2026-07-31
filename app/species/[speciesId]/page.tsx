import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Dna, FileText, Leaf, ShieldCheck } from "lucide-react";
import { CreaturePromptPanel } from "@/components/creature-prompt-panel";
import { canonicalSpecies } from "@/lib/life/creature-system";
import { SpeciesPlatePromptCard } from "@/components/species-plate-prompt-card";
import { speciesPlateSourceFromCreature } from "@/lib/species-plates/adapters";

export function generateStaticParams() { return canonicalSpecies.map((species) => ({ speciesId: species.id })); }

export default async function SpeciesDetailPage({ params }: { params: Promise<{ speciesId: string }> }) {
  const { speciesId } = await params;
  const species = canonicalSpecies.find((row) => row.id === speciesId);
  if (!species) notFound();
  return <main className="space-y-6">
    <Link href="/species" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-white"><ArrowLeft className="h-4 w-4" /> Species Library</Link>
    <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Canonical Species Record</p><h1 className="mt-2 text-3xl font-black text-white">{species.displayName}</h1><p className="mt-1 text-sm italic text-slate-400">{species.scientificName}</p></div><span className="rounded-md border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-100">{species.canonStatus}</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><RecordField label="ID" value={species.id} /><RecordField label="Seed" value={species.seed} /><RecordField label="Functional Type" value={species.functionalCategories.join(", ")} /><RecordField label="Habitat" value={species.habitats.join(", ")} /></div></section>
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"><DetailCard icon={<Dna />} title="Taxonomy" value={`${species.taxonomy.kingdom} · ${species.taxonomy.phylum} · ${species.taxonomy.class}`} /><DetailCard icon={<Leaf />} title="Ecology" value={`${species.ecologicalRoles.join(", ")}. Diet: ${species.ecology.diet.join(", ")}.`} /><DetailCard icon={<ShieldCheck />} title="Compatibility" value={`${species.compatibility.gravityRange.join("–")} G · ${species.compatibility.temperatureRangeC.join("–")}°C`} /><DetailCard icon={<FileText />} title="Production" value={`Art: ${species.artProfileId}. Animation: ${species.animationProfileId}. Audio: ${species.audioProfileId}.`} /></section>
    <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-6"><h2 className="text-lg font-black text-white">Canonical Notes</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{species.notes}</p><div className="mt-5 flex flex-wrap gap-2">{species.variants.map((variant) => <span key={variant} className="rounded-md border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-xs font-bold text-cyan-100">{variant}</span>)}</div></section>
    <SpeciesPlatePromptCard source={speciesPlateSourceFromCreature(species)} />
    <CreaturePromptPanel species={species} availableSpecies={canonicalSpecies} />
  </main>;
}

function RecordField({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-md border border-cyan-300/10 bg-slate-900/35 p-3"><p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-100" title={value}>{value}</p></div>; }
function DetailCard({ icon, title, value }: { icon: ReactNode; title: string; value: string }) { return <div className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5"><div className="flex items-center gap-2 text-cyan-200">{icon}<h2 className="text-sm font-black uppercase tracking-[0.14em]">{title}</h2></div><p className="mt-4 text-sm leading-6 text-slate-300">{value}</p></div>; }
