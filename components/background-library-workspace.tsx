"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileImage, ImageOff, Search, Sparkles } from "lucide-react";
import {
  backgroundContextTypes,
  compileBackgroundPrompt,
  type BackgroundContextType,
  type BackgroundRecord
} from "@/lib/production/backgrounds";
import { cn } from "@/lib/utils";

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusTone(status: BackgroundRecord["productionStatus"]) {
  if (status === "published") return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  if (status === "extracted") return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  return "border-amber-300/25 bg-amber-300/10 text-amber-100";
}

function BackgroundCard({ record }: { record: BackgroundRecord }) {
  return (
    <article className="group overflow-hidden rounded-md border border-cyan-300/15 bg-[#07101e]/90 transition hover:border-cyan-200/40 focus-within:border-cyan-200/50">
      <div className="relative aspect-video overflow-hidden border-b border-cyan-300/10 bg-slate-950/70">
        {record.thumbnailAssetReference ? (
          // The paths are generated local derivatives, not external images.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={record.thumbnailAssetReference}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-600">
            <div className="text-center">
              <ImageOff className="mx-auto h-7 w-7" />
              <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.16em]">Derivative pending</p>
            </div>
          </div>
        )}
        <span className={cn("absolute right-3 top-3 rounded border px-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.14em]", statusTone(record.productionStatus))}>
          {label(record.productionStatus)}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-cyan-300">{label(record.contextType)}</p>
        <h2 className="mt-1 truncate text-base font-black text-white" title={record.name}>{record.name}</h2>
        <p className="mt-1 truncate text-xs text-slate-500" title={record.canonicalOwnerId ?? "Unassigned"}>{record.canonicalOwnerId ?? "Unassigned source master"}</p>
        <div className="mt-3 flex items-center justify-between border-t border-cyan-300/10 pt-3 text-xs">
          <span className="text-slate-500">{record.aspectRatio} · v{record.version}</span>
          <span className="font-bold text-slate-300">{record.runtimeTargets.length ? `${record.runtimeTargets.length} targets` : "Internal"}</span>
        </div>
      </div>
    </article>
  );
}

export function BackgroundLibraryWorkspace({
  records,
  title = "Background Library",
  description = "Flat decorative artwork for Unity screens. Studio owns production and approval; Unity owns composition, coordinates, and interaction.",
  initialContext = "all",
  lockedContext = false
}: {
  records: BackgroundRecord[];
  title?: string;
  description?: string;
  initialContext?: BackgroundContextType | "all";
  lockedContext?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState<BackgroundContextType | "all">(initialContext);
  const [copied, setCopied] = useState(false);
  const filtered = useMemo(() => records.filter((record) => {
    const matchesContext = context === "all" || record.contextType === context;
    const haystack = `${record.name} ${record.contextType} ${record.canonicalOwnerId ?? ""}`.toLowerCase();
    return matchesContext && haystack.includes(query.trim().toLowerCase());
  }), [context, query, records]);
  const published = records.filter((record) => record.productionStatus === "published").length;
  const prompt = compileBackgroundPrompt({ contextType: context === "all" ? "generic_space" : context });

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="space-y-5">
      <section className="studio-material-command rounded-md p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Creative Production</p>
            <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
          </div>
          <button type="button" onClick={copyPrompt} className="inline-flex items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-50">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy base prompt"}
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[["Records", records.length], ["Published", published], ["Needs production", records.length - published]].map(([name, value]) => (
            <div key={name} className="rounded-md border border-cyan-300/10 bg-slate-950/35 px-4 py-3">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.17em] text-slate-500">{name}</p>
              <p className="mt-1 text-xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-material-command rounded-md p-4">
        <div className={cn("grid gap-3", !lockedContext && "lg:grid-cols-[minmax(18rem,1fr)_18rem]")}>
          <label className="flex h-11 items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/45 px-3">
            <Search className="h-4 w-4 text-cyan-200" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search backgrounds and owners" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
          </label>
          {!lockedContext ? (
            <select value={context} onChange={(event) => setContext(event.target.value as BackgroundContextType | "all")} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/75 px-3 text-sm font-bold text-white outline-none">
              <option value="all">All contexts</option>
              {backgroundContextTypes.map((value) => <option key={value} value={value}>{label(value)}</option>)}
            </select>
          ) : null}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><FileImage className="h-4 w-4" />{filtered.length} shown</div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((record) => <BackgroundCard key={record.id} record={record} />)}
      </section>

      <section className="studio-material-command rounded-md p-4">
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-cyan-200" /><h2 className="text-sm font-black text-white">Prompt contract</h2></div>
        <p className="mt-2 text-xs leading-5 text-slate-500">Nano Banana 2 prompts inherit the flat-background rule, safe-area intent, prohibited gameplay elements, and 3840 × 2400 master profile.</p>
      </section>
    </main>
  );
}
