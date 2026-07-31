"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Check, Clipboard, Download } from "lucide-react";
import { buildCreaturePromptPack, compileCreaturePrompt, creaturePromptModelProfiles, creaturePromptOutputTypes, validateCreaturePrompt, type CreaturePromptMode, type CreaturePromptModel, type CreaturePromptOutputType, type SpeciesRecord } from "@/lib/life/creature-system";

export function CreaturePromptPanel({ species }: { species: SpeciesRecord }) {
  const [outputType, setOutputType] = useState<CreaturePromptOutputType>("full-body-creature");
  const [model, setModel] = useState<CreaturePromptModel>("generic-image-model");
  const [mode, setMode] = useState<CreaturePromptMode>("detailed");
  const [copied, setCopied] = useState<string | null>(null);
  const prompt = useMemo(() => compileCreaturePrompt(species, { outputType, modelProfileId: model, mode }), [species, outputType, model, mode]);
  const validation = useMemo(() => validateCreaturePrompt(prompt, species), [prompt, species]);
  const copy = async (kind: "positive" | "negative" | "combined") => {
    const value = kind === "positive" ? prompt.positivePrompt : kind === "negative" ? prompt.negativePrompt : `${prompt.positivePrompt}\n\nNEGATIVE PROMPT\n${prompt.negativePrompt}`;
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  };
  const downloadPack = (format: "json" | "md" | "txt") => {
    const pack = buildCreaturePromptPack(species, { modelProfileId: model, mode });
    const value = format === "json" ? pack.json : format === "md" ? pack.markdown : pack.text;
    const blob = new Blob([value], { type: format === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${species.id}_visual_prompts.${format}`; anchor.click(); URL.revokeObjectURL(url);
  };
  return <section className="rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Art Production · Copyable Prompts</p><h2 className="mt-2 text-xl font-black text-white">Visual Prompt Compiler</h2><p className="mt-1 text-sm text-slate-400">Prompts inherit locked anatomy, compatibility, ecology, and visual traits from the canonical species record.</p></div><div className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${validation.status === "Ready" ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-amber-300/25 bg-amber-300/10 text-amber-100"}`}>{validation.status}</div></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_1fr_0.8fr]"><label className="space-y-2"><span className="block text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Output Type</span><select className="w-full rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white" value={outputType} onChange={(event) => setOutputType(event.target.value as CreaturePromptOutputType)}>{creaturePromptOutputTypes.map((value) => <option key={value}>{value}</option>)}</select></label><label className="space-y-2"><span className="block text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Model Profile</span><select className="w-full rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white" value={model} onChange={(event) => setModel(event.target.value as CreaturePromptModel)}>{creaturePromptModelProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName}</option>)}</select></label><label className="space-y-2"><span className="block text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Prompt Mode</span><select className="w-full rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white" value={mode} onChange={(event) => setMode(event.target.value as CreaturePromptMode)}><option value="detailed">Detailed</option><option value="compact">Compact</option></select></label></div>
    <div className="mt-4 grid gap-4 xl:grid-cols-2"><PromptBox label="Positive Prompt" value={prompt.positivePrompt} onCopy={() => copy("positive")} copied={copied === "positive"} /><PromptBox label="Negative Prompt" value={prompt.negativePrompt} onCopy={() => copy("negative")} copied={copied === "negative"} /></div>
    <div className="mt-4 flex flex-wrap items-center gap-2"><CopyButton label="Copy Combined Prompt" icon={<Clipboard className="h-4 w-4" />} onClick={() => copy("combined")} copied={copied === "combined"} /><DownloadButton label="JSON" onClick={() => downloadPack("json")} /><DownloadButton label="Markdown" onClick={() => downloadPack("md")} /><DownloadButton label="Text" onClick={() => downloadPack("txt")} /><span className="ml-auto text-xs font-semibold text-slate-500">v{prompt.promptVersion} · {prompt.generatorVersion} · ~{prompt.tokenEstimate} tokens</span></div>
    <div className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-2 lg:grid-cols-4"><Meta label="Source Species" value={prompt.speciesId} /><Meta label="Preset" value={prompt.presetId} /><Meta label="Seed" value={prompt.seed} /><Meta label="Locked Fields" value={`${prompt.lockedFields.length} protected`} /></div>
  </section>;
}

function PromptBox({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) { return <div className="rounded-md border border-cyan-300/10 bg-slate-900/35 p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p><CopyButton label={copied ? "Copied" : "Copy"} icon={copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />} onClick={onCopy} copied={copied} /></div><p className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-200">{value}</p></div>; }
function CopyButton({ label, icon, onClick, copied }: { label: string; icon: ReactNode; onClick: () => void; copied: boolean }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black ${copied ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-cyan-200/20 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/15"}`}>{icon}{label}</button>; }
function DownloadButton({ label, onClick }: { label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-md border border-slate-600/60 px-3 py-2 text-xs font-black text-slate-200 hover:border-cyan-200/40"><Download className="h-3.5 w-3.5" />{label}</button>; }
function Meta({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><span className="block uppercase tracking-[0.16em] text-slate-600">{label}</span><span className="mt-1 block truncate font-bold text-slate-300" title={value}>{value}</span></div>; }
