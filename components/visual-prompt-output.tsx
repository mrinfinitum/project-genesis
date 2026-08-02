"use client";

import { useState } from "react";
import { Check, Clipboard, History, RefreshCw, RotateCcw } from "lucide-react";

export type VisualPromptOutputValue = {
  canonicalData: Record<string, unknown>;
  visualSummary: string;
  visualPrompt: string;
  negativePrompt: string;
  combinedPrompt: string;
  promptHash: string;
  promptVersion: string;
  modelProfileId: string;
  resolvedVisualVariables: Record<string, string>;
  unresolvedVisualVariables: string[];
  validation?: Array<{ severity: string; code: string; message: string }>;
};

type CopyKind = "visual" | "negative" | "combined" | "canonical";

export function VisualPromptOutput({
  prompt,
  onRegenerateVisualSummary,
  onResetToCanonicalTemplate
}: {
  prompt: VisualPromptOutputValue;
  onRegenerateVisualSummary?: () => void;
  onResetToCanonicalTemplate?: () => void;
}) {
  const [copied, setCopied] = useState<CopyKind | null>(null);
  const [showCanonicalData, setShowCanonicalData] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [previousPrompt, setPreviousPrompt] = useState<VisualPromptOutputValue | null>(null);
  const copy = async (kind: CopyKind) => {
    const value = kind === "visual" ? prompt.visualPrompt : kind === "negative" ? prompt.negativePrompt : kind === "combined" ? prompt.combinedPrompt : JSON.stringify(prompt.canonicalData, null, 2);
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1200);
  };
  const regenerate = () => {
    setPreviousPrompt(prompt);
    onRegenerateVisualSummary?.();
  };
  const reset = () => {
    setPreviousPrompt(prompt);
    onResetToCanonicalTemplate?.();
  };
  const hasErrors = prompt.validation?.some((issue) => /error|conflict/i.test(issue.severity));

  return (
    <section className="space-y-4 rounded-lg border border-cyan-300/15 bg-slate-950/45 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Nano Banana 2 · Visual Prompt v{prompt.promptVersion}</p>
          <h2 className="mt-2 text-xl font-black text-white">Visual Prompt</h2>
          <p className="mt-1 text-sm text-slate-400">Canonical data is kept separate from the model-ready visual direction.</p>
        </div>
        <span className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${hasErrors ? "border-rose-300/25 bg-rose-300/10 text-rose-100" : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"}`}>{hasErrors ? "Needs review" : "Visual prompt ready"}</span>
      </div>

      <PromptSection label="Visual Summary" value={prompt.visualSummary} />
      <PromptSection label="Visual Prompt" value={prompt.visualPrompt} onCopy={() => copy("visual")} copied={copied === "visual"} />
      <PromptSection label="Negative Prompt" value={prompt.negativePrompt} onCopy={() => copy("negative")} copied={copied === "negative"} />
      <PromptSection label="Combined Prompt" value={prompt.combinedPrompt} onCopy={() => copy("combined")} copied={copied === "combined"} />

      <div className="flex flex-wrap gap-2">
        <Action label="Copy Visual Prompt" onClick={() => copy("visual")} copied={copied === "visual"} />
        <Action label="Copy Negative Prompt" onClick={() => copy("negative")} copied={copied === "negative"} />
        <Action label="Copy Combined Prompt" onClick={() => copy("combined")} copied={copied === "combined"} />
        <Action label="Copy Canonical JSON" onClick={() => copy("canonical")} copied={copied === "canonical"} />
        <button type="button" onClick={regenerate} className="inline-flex items-center gap-2 rounded-md border border-cyan-200/20 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/10"><RefreshCw className="h-3.5 w-3.5" />Regenerate Visual Summary</button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-md border border-slate-600/60 px-3 py-2 text-xs font-black text-slate-200 hover:border-cyan-200/40"><RotateCcw className="h-3.5 w-3.5" />Reset to Canonical Template</button>
        <button type="button" onClick={() => setShowPrevious((value) => !value)} className="inline-flex items-center gap-2 rounded-md border border-slate-600/60 px-3 py-2 text-xs font-black text-slate-200 hover:border-cyan-200/40"><History className="h-3.5 w-3.5" />View Previous Version</button>
      </div>

      <details open={showCanonicalData} onToggle={(event) => setShowCanonicalData(event.currentTarget.open)} className="rounded-md border border-cyan-300/10 bg-slate-900/35 p-4">
        <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Canonical Data</summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-300">{JSON.stringify(prompt.canonicalData, null, 2)}</pre>
      </details>
      {showPrevious ? <section className="rounded-md border border-cyan-300/10 bg-slate-900/35 p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Previous Version</p><p className="mt-2 text-sm leading-6 text-slate-300">{previousPrompt?.visualPrompt ?? "No previous visual revision exists in this session."}</p></section> : null}
      <div className="grid gap-3 text-xs sm:grid-cols-2 xl:grid-cols-4"><Meta label="Model" value={prompt.modelProfileId} /><Meta label="Version" value={prompt.promptVersion} /><Meta label="Prompt Hash" value={prompt.promptHash} /><Meta label="Resolved Variables" value={`${Object.keys(prompt.resolvedVisualVariables).length}`} /></div>
      {prompt.validation?.length ? <div className="rounded-md border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100">{prompt.validation.map((issue) => issue.message).join(" ")}</div> : null}
    </section>
  );
}

function PromptSection({ label, value, onCopy, copied }: { label: string; value: string; onCopy?: () => void; copied?: boolean }) {
  return <div className="rounded-md border border-cyan-300/10 bg-slate-900/35 p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>{onCopy ? <Action label={copied ? "Copied" : "Copy"} onClick={onCopy} copied={Boolean(copied)} /> : null}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{value}</p></div>;
}
function Action({ label, onClick, copied }: { label: string; onClick: () => void; copied: boolean }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-black ${copied ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-cyan-200/20 bg-cyan-300/5 text-cyan-100 hover:bg-cyan-300/15"}`}>{copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}{label}</button>; }
function Meta({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><span className="block uppercase tracking-[0.16em] text-slate-600">{label}</span><span className="mt-1 block truncate font-bold text-slate-300" title={value}>{value}</span></div>; }
