"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Clipboard, Copy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildPlanetPrompt,
  PLANET_MASTER_PROMPT,
  type PlanetPromptTemplate
} from "@/data/planet-generation-prompts";

type CopyTarget = {
  id: string;
  kind: "description" | "full" | "master" | "sync";
};

const PLANET_RENDER_FOLDER_EXAMPLE = "planet-renders/organic/living-world/planet_organic_living_world_00001.png";
const PLANET_RENDER_SYNC_COMMAND = "npm run sync:planet-renders -- ./planet-renders";
const PLANET_RENDER_OVERWRITE_COMMAND = "npm run sync:planet-renders -- ./planet-renders --overwrite";

function classKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function groupedPrompts(rows: PlanetPromptTemplate[]) {
  return rows.reduce<Record<string, PlanetPromptTemplate[]>>((groups, row) => {
    groups[row.planetClass] = [...(groups[row.planetClass] ?? []), row];
    return groups;
  }, {});
}

function CopyButton({
  value,
  copied,
  onCopy,
  children,
  title
}: {
  value: string;
  copied: boolean;
  onCopy: (value: string) => void;
  children: ReactNode;
  title: string;
}) {
  return (
    <Button
      type="button"
      className="h-9 border-cyan-400/25 bg-cyan-300/10 px-3 text-cyan-100 hover:bg-cyan-300/20"
      title={title}
      onClick={() => onCopy(value)}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {children}
    </Button>
  );
}

export function PlanetGenerationLibrary({ rows }: { rows: PlanetPromptTemplate[] }) {
  const [query, setQuery] = useState("");
  const [planetClass, setPlanetClass] = useState("all");
  const [copied, setCopied] = useState<CopyTarget | null>(null);

  const classes = useMemo(() => [...new Set(rows.map((row) => row.planetClass))], [rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesClass = planetClass === "all" || row.planetClass === planetClass;
      const searchText = `${row.planetClass} ${row.subclass} ${row.displayName} ${row.imagePrompt}`.toLowerCase();
      return matchesClass && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [planetClass, query, rows]);
  const groups = useMemo(() => groupedPrompts(filteredRows), [filteredRows]);

  async function copyValue(value: string, target: CopyTarget) {
    await navigator.clipboard.writeText(value);
    setCopied(target);
    window.setTimeout(() => {
      setCopied((current) => (current?.id === target.id && current.kind === target.kind ? null : current));
    }, 1400);
  }

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Prompt Library</p>
            <h2 className="mt-2 text-4xl font-bold text-white">Planet Generation</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
              Master render prompt and planet type inserts for consistent black-background planet assets. Full prompt copies now explicitly request one centered planet with no moons or companion bodies.
            </p>
          </div>
          <CopyButton
            value={PLANET_MASTER_PROMPT}
            copied={copied?.id === "master" && copied.kind === "master"}
            title="Copy master prompt"
            onCopy={(value) => copyValue(value, { id: "master", kind: "master" })}
          >
            Master Prompt
          </CopyButton>
        </div>

        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 text-xs leading-5 text-slate-300 shadow-glow">
          {PLANET_MASTER_PROMPT}
        </pre>

        <div className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Render Rule</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Planet images should stay planet-only. Moon counts can remain gameplay data on generated planet cards, but copied art prompts exclude moons, satellites, and companion bodies for cleaner assets.
          </p>
          <div className="mt-5 border-t border-cyan-400/10 pt-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Render Sync Workflow</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Add a planet PNG/PSD to the matching class and subclass folder, then run the sync command. This writes the JSON metadata and registers the render in Supabase.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton
                  value={PLANET_RENDER_SYNC_COMMAND}
                  copied={copied?.id === "planet-render-sync" && copied.kind === "sync"}
                  title="Copy planet render sync command"
                  onCopy={(value) => copyValue(value, { id: "planet-render-sync", kind: "sync" })}
                >
                  Sync Command
                </CopyButton>
                <CopyButton
                  value={PLANET_RENDER_OVERWRITE_COMMAND}
                  copied={copied?.id === "planet-render-overwrite" && copied.kind === "sync"}
                  title="Copy planet render overwrite sync command"
                  onCopy={(value) => copyValue(value, { id: "planet-render-overwrite", kind: "sync" })}
                >
                  Overwrite Sync
                </CopyButton>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
              <div className="rounded border border-slate-700/70 bg-slate-950/45 p-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Folder Pattern</p>
                <code className="mt-2 block overflow-x-auto whitespace-nowrap text-sm text-cyan-100">{PLANET_RENDER_FOLDER_EXAMPLE}</code>
              </div>
              <div className="rounded border border-slate-700/70 bg-slate-950/45 p-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Normal Sync</p>
                <code className="mt-2 block overflow-x-auto whitespace-nowrap text-sm text-cyan-100">{PLANET_RENDER_SYNC_COMMAND}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-[1fr_260px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search planet prompts"
            className="h-12 w-full rounded-md border border-cyan-400/20 bg-[#07101e]/85 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
          />
        </label>
        <select
          value={planetClass}
          onChange={(event) => setPlanetClass(event.target.value)}
          className="h-12 rounded-md border border-cyan-400/20 bg-[#07101e]/85 px-4 text-sm text-white outline-none transition focus:border-cyan-300/60"
        >
          <option value="all">All classes</option>
          {classes.map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-8">
        {classes
          .filter((className) => groups[className]?.length)
          .map((className) => (
            <div key={className} id={classKey(className)} className="space-y-3">
              <div className="flex items-center justify-between gap-4 border-b border-cyan-400/15 pb-2">
                <h3 className="text-xl font-semibold uppercase tracking-[0.2em] text-cyan-200">{className}</h3>
                <span className="rounded border border-cyan-400/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                  {groups[className].length}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {groups[className].map((row) => {
                  const id = `${row.planetClass}-${row.subclass}`;
                  return (
                    <article key={id} className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
                      <div className="flex min-h-24 flex-col justify-between gap-3">
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">{row.planetClass}</p>
                          <h4 className="mt-2 text-lg font-semibold text-white">{row.displayName}</h4>
                        </div>
                        <p className="line-clamp-4 text-sm leading-6 text-slate-300">{row.imagePrompt}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <CopyButton
                          value={row.imagePrompt}
                          copied={copied?.id === id && copied.kind === "description"}
                          title="Copy planet type insert"
                          onCopy={(value) => copyValue(value, { id, kind: "description" })}
                        >
                          Type
                        </CopyButton>
                        <Button
                          type="button"
                          className="h-9 border-slate-700 bg-slate-900/70 px-3 text-slate-200 hover:bg-slate-800"
                          title="Copy full planet prompt with no moons"
                          onClick={() => copyValue(buildPlanetPrompt(row.imagePrompt), { id, kind: "full" })}
                        >
                          {copied?.id === id && copied.kind === "full" ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                          Full
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
