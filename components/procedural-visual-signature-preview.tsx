"use client";

import { useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { galaxyArchetypes, generateUniqueVisualSignature, generateVisualSignature, paletteFamilies, parentAffinity, sectorArchetypes, starSystemArchetypes, validateVisualSignature, visualDistance, type VisualSemanticLevel } from "@/lib/universe/visual-signatures";

type Props = { semanticLevel: Exclude<VisualSemanticLevel, "universe">; defaultObjectId: string };

export function ProceduralVisualSignaturePreview({ semanticLevel, defaultObjectId }: Props) {
  const [universeSeed, setUniverseSeed] = useState("PROJECT-GENESIS-UNIVERSE");
  const [objectId, setObjectId] = useState(defaultObjectId);
  const [salt, setSalt] = useState(0);
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [overridePaletteId, setOverridePaletteId] = useState("palette_cyan_amber");
  const [overrideArchetypeId, setOverrideArchetypeId] = useState("");
  const archetypes = semanticLevel === "galaxy" ? galaxyArchetypes : semanticLevel === "sector" ? sectorArchetypes : starSystemArchetypes;
  const result = useMemo(() => {
    const parentLevel: VisualSemanticLevel = semanticLevel === "system" ? "sector" : semanticLevel === "sector" ? "galaxy" : "universe";
    const parent = generateVisualSignature({ universeSeed, generationVersion: "seeded-cascade-v1", semanticLevel: parentLevel, canonicalObjectId: `${objectId}:parent` });
    const siblings = [0, 1, 2].map((index) => generateVisualSignature({ universeSeed, generationVersion: "seeded-cascade-v1", semanticLevel, canonicalObjectId: `${objectId}:sibling:${index}` }));
    const signature = generateUniqueVisualSignature({ universeSeed, generationVersion: "seeded-cascade-v1", semanticLevel, canonicalObjectId: objectId, parentSignature: parent, visualSalt: `studio_preview_${salt}`, override: overrideEnabled ? { paletteId: overridePaletteId, ...(overrideArchetypeId ? { archetypeId: overrideArchetypeId } : {}) } : undefined }, siblings);
    return { signature, parent, siblings, issues: validateVisualSignature(signature) };
  }, [objectId, overrideArchetypeId, overrideEnabled, overridePaletteId, salt, semanticLevel, universeSeed]);
  const palette = paletteFamilies.find((item) => item.id === result.signature.paletteId);
  const minimumSiblingDistance = Math.min(...result.siblings.map((item) => visualDistance(result.signature, item)));
  const metrics = [
    ["Parent affinity", parentAffinity(result.signature, result.parent)], ["Sibling distance", minimumSiblingDistance],
    ["Stellar density", result.signature.stellarDensity], ["Nebula density", result.signature.nebulaDensity],
    ["Dust density", result.signature.dustDensity], ["Luminosity", result.signature.luminosity]
  ] as const;

  return (
    <details className="rounded-md border border-cyan-300/15 bg-[#07101e]/78">
      <summary className="cursor-pointer px-4 py-3 text-sm font-black text-cyan-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Visual Identity Inspector</summary>
      <div className="border-t border-cyan-300/10 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto]">
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Universe Seed<input value={universeSeed} onChange={(event) => setUniverseSeed(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-300/50" /></label>
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Canonical Object ID<input value={objectId} onChange={(event) => setObjectId(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-300/50" /></label>
          <button type="button" onClick={() => setSalt((value) => value + 1)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 text-sm font-black text-cyan-100"><RefreshCw className="h-4 w-4" /> Salt</button>
          <button type="button" onClick={() => navigator.clipboard?.writeText(`${universeSeed}\n${objectId}`)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-slate-500/30 px-3 text-sm font-black text-slate-200"><Copy className="h-4 w-4" /> Copy</button>
        </div>
        <div className="mt-3 grid gap-3 border-t border-cyan-300/10 pt-3 md:grid-cols-[auto_1fr_1fr]">
          <label className="flex h-10 items-center gap-2 text-sm font-bold text-slate-200"><input type="checkbox" checked={overrideEnabled} onChange={(event) => setOverrideEnabled(event.target.checked)} className="h-4 w-4 accent-cyan-300" /> Authored override</label>
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Palette<select disabled={!overrideEnabled} value={overridePaletteId} onChange={(event) => setOverridePaletteId(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm normal-case tracking-normal text-white disabled:opacity-45">{paletteFamilies.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}</select></label>
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Archetype<select disabled={!overrideEnabled} value={overrideArchetypeId} onChange={(event) => setOverrideArchetypeId(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm normal-case tracking-normal text-white disabled:opacity-45"><option value="">Generated default</option>{archetypes.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}</select></label>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[18rem_1fr]">
          <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">{result.signature.archetypeId.replaceAll("_", " ")}</p>
            <p className="mt-1 text-sm font-bold text-white">{palette?.displayName ?? result.signature.paletteId}</p>
            <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Resolved palette swatches">
              {[result.signature.primaryHue, result.signature.secondaryHue, result.signature.accentHue].map((hue, index) => <div key={index} className="h-12 rounded border border-white/10" style={{ backgroundColor: `hsl(${hue} 68% 52%)` }} title={`Hue ${hue}`} />)}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs"><div><dt className="text-slate-500">Fingerprint</dt><dd className="font-mono text-slate-200">{result.signature.fingerprint}</dd></div><div><dt className="text-slate-500">Attempt</dt><dd className="font-mono text-slate-200">{result.signature.attemptIndex}</dd></div></dl>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map(([label, value]) => <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><div className="flex justify-between text-xs font-bold text-slate-300"><span>{label}</span><span>{Math.round(value * 100)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded bg-slate-800"><div className="h-full bg-cyan-300/70" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} /></div></div>)}
          </div>
        </div>
        <p className={`mt-3 text-xs font-bold ${result.issues.length ? "text-amber-300" : "text-emerald-300"}`}>{result.issues.length ? `${result.issues.length} diagnostic warning(s)` : "Signature passes range, readability, and uniqueness checks."}</p>
      </div>
    </details>
  );
}
