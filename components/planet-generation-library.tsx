"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Clipboard, Copy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildPlanetPrompt,
  PLANET_MASTER_PROMPT,
  PLANET_MOON_CHARACTERISTICS,
  type PlanetPromptTemplate
} from "@/data/planet-generation-prompts";

type CopyTarget = {
  id: string;
  kind: "description" | "full" | "master";
};

function classKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function groupedPrompts(rows: PlanetPromptTemplate[]) {
  return rows.reduce<Record<string, PlanetPromptTemplate[]>>((groups, row) => {
    groups[row.planetClass] = [...(groups[row.planetClass] ?? []), row];
    return groups;
  }, {});
}

function promptId(row: PlanetPromptTemplate) {
  return `${row.planetClass}-${row.subclass}`;
}

function randomMoonCharacteristic() {
  return (PLANET_MOON_CHARACTERISTICS[Math.floor(Math.random() * PLANET_MOON_CHARACTERISTICS.length)] ?? PLANET_MOON_CHARACTERISTICS[0]).prompt;
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
  const [planetClass, setPlanetClass] = useState(rows[0]?.planetClass ?? "");
  const [subclass, setSubclass] = useState(rows[0]?.subclass ?? "");
  const [copied, setCopied] = useState<CopyTarget | null>(null);

  const classes = useMemo(() => [...new Set(rows.map((row) => row.planetClass))], [rows]);
  const groups = useMemo(() => groupedPrompts(rows), [rows]);
  const classCounts = useMemo(
    () =>
      classes.map((className) => ({
        name: className,
        count: groups[className]?.length ?? 0
      })),
    [classes, groups]
  );
  const visibleSubclasses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedRows = groups[planetClass] ?? [];

    return selectedRows.filter((row) => {
      const searchText = `${row.planetClass} ${row.subclass} ${row.displayName} ${row.imagePrompt}`.toLowerCase();
      return !normalizedQuery || searchText.includes(normalizedQuery);
    });
  }, [groups, planetClass, query]);
  const selectedPrompt = useMemo(
    () => visibleSubclasses.find((row) => row.subclass === subclass) ?? visibleSubclasses[0] ?? null,
    [subclass, visibleSubclasses]
  );

  useEffect(() => {
    if (!classes.length) {
      return;
    }

    if (!planetClass || !classes.includes(planetClass)) {
      setPlanetClass(classes[0]);
    }
  }, [classes, planetClass]);

  useEffect(() => {
    if (!visibleSubclasses.length) {
      setSubclass("");
      return;
    }

    if (!visibleSubclasses.some((row) => row.subclass === subclass)) {
      setSubclass(visibleSubclasses[0].subclass);
    }
  }, [subclass, visibleSubclasses]);

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
              Master render prompt and planet type inserts for consistent black-background planet assets. Full prompt copies include a randomized moon characteristic.
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Moon Roll</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {PLANET_MOON_CHARACTERISTICS.map((moonCharacteristic) => (
              <div key={moonCharacteristic.label} className="rounded border border-slate-700/70 bg-slate-950/45 px-3 py-2 text-xs leading-5 text-slate-300">
                <p className="font-semibold uppercase tracking-[0.14em] text-slate-100">{moonCharacteristic.label}</p>
                <p className="mt-1 text-slate-400">{moonCharacteristic.prompt || "No moon instruction is added to the copied prompt."}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-3 shadow-glow">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Biomes</p>
            <span className="text-xs font-semibold text-slate-500">{classes.length}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {classCounts.map((classItem) => {
              const active = classItem.name === planetClass;
              return (
                <button
                  key={classItem.name}
                  type="button"
                  onClick={() => {
                    setPlanetClass(classItem.name);
                    setQuery("");
                  }}
                  className={`flex h-12 items-center justify-between rounded border px-3 text-left text-sm font-semibold transition ${
                    active
                      ? "border-cyan-300/70 bg-cyan-300/15 text-white shadow-[0_0_18px_rgba(34,211,238,0.16)]"
                      : "border-cyan-400/10 bg-slate-950/35 text-slate-300 hover:border-cyan-300/35 hover:bg-cyan-300/10"
                  }`}
                >
                  <span className="uppercase tracking-[0.12em]">{classItem.name}</span>
                  <span className={active ? "text-cyan-100" : "text-slate-500"}>{classItem.count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-4 shadow-glow">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Sub-Biomes</p>
                <h3 id={classKey(planetClass)} className="mt-1 text-2xl font-semibold text-white">
                  {planetClass || "No biome selected"}
                </h3>
              </div>
              <label className="relative block lg:w-80">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search sub-biomes"
                  className="h-11 w-full rounded-md border border-cyan-400/20 bg-slate-950/50 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {visibleSubclasses.map((row) => {
                const active = selectedPrompt?.subclass === row.subclass;
                return (
                  <button
                    key={promptId(row)}
                    type="button"
                    onClick={() => setSubclass(row.subclass)}
                    className={`min-h-16 rounded border px-3 py-2 text-left transition ${
                      active
                        ? "border-cyan-300/70 bg-cyan-300/15 text-white"
                        : "border-cyan-400/10 bg-slate-950/35 text-slate-300 hover:border-cyan-300/35 hover:bg-cyan-300/10"
                    }`}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{row.subclass}</span>
                    <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-400">{row.imagePrompt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPrompt ? (
            <article className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-5 shadow-glow">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{selectedPrompt.planetClass}</p>
                  <h4 className="mt-2 text-3xl font-semibold text-white">{selectedPrompt.displayName}</h4>
                  <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{selectedPrompt.imagePrompt}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <CopyButton
                    value={selectedPrompt.imagePrompt}
                    copied={copied?.id === promptId(selectedPrompt) && copied.kind === "description"}
                    title="Copy planet type insert"
                    onCopy={(value) => copyValue(value, { id: promptId(selectedPrompt), kind: "description" })}
                  >
                    Type
                  </CopyButton>
                  <Button
                    type="button"
                    className="h-9 border-slate-700 bg-slate-900/70 px-3 text-slate-200 hover:bg-slate-800"
                    title="Copy full planet prompt with randomized moon characteristic"
                    onClick={() =>
                      copyValue(buildPlanetPrompt(selectedPrompt.imagePrompt, randomMoonCharacteristic()), {
                        id: promptId(selectedPrompt),
                        kind: "full"
                      })
                    }
                  >
                    {copied?.id === promptId(selectedPrompt) && copied.kind === "full" ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                    Full
                  </Button>
                </div>
              </div>
            </article>
          ) : (
            <div className="rounded-md border border-cyan-400/15 bg-[#07101e]/85 p-8 text-center text-sm text-slate-400 shadow-glow">
              No sub-biomes match the current search.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
