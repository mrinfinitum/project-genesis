"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";

type PaletteResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
  status?: string;
};

const commandSeeds: PaletteResult[] = [
  { id: "command:dashboard", type: "Workspace", title: "Open Dashboard", subtitle: "Command Center", href: "/" },
  { id: "command:asset-library", type: "Workspace", title: "Open Asset Library", subtitle: "Content Browser", href: "/asset-library" },
  { id: "command:upload-asset", type: "Asset Pipeline", title: "Upload Asset", subtitle: "Create or replace source art", href: "/assets?upload=asset" },
  { id: "command:production-health", type: "Health", title: "Open Production Health", subtitle: "Assets, routes, exports, verification", href: "/asset-library?section=all-assets" },
  { id: "command:runtime", type: "Runtime", title: "Open Runtime", subtitle: "Published canonical runtime", href: "/runtime" },
  { id: "command:exports", type: "Exports", title: "Open Game Engine Exports", subtitle: "Generic, Roblox, Web, Unity, Unreal, Godot", href: "/game-engine-exports" },
  { id: "command:experience-design", type: "Experience Design", title: "Open Experience Design", subtitle: "Creative direction authoring", href: "/experience-design" },
  { id: "command:experience-bible", type: "Experience Design", title: "Open Experience Bible", subtitle: "NOVERIS creative canon framework", href: "/experience-design/bible" },
  { id: "command:inspiration-wall", type: "Experience Design", title: "Open Inspiration Wall", subtitle: "Local public/images visual reference wall", href: "/experience-design/inspiration-wall" },
  { id: "command:screen-library", type: "Experience Design", title: "Open Screen Library", subtitle: "DS-06 canonical semantic screen definitions", href: "/experience-design/screens" },
  { id: "command:design-tokens", type: "Experience Design", title: "Open Design Tokens", subtitle: "DS-02 canonical semantic token libraries", href: "/experience-design/tokens" },
  { id: "command:material-library", type: "Experience Design", title: "Open Material Library", subtitle: "DS-03 canonical semantic material library", href: "/experience-design/materials" },
  { id: "command:motion-library", type: "Experience Design", title: "Open Motion Library", subtitle: "DS-04 canonical semantic motion system", href: "/experience-design/motion" },
  { id: "command:component-library", type: "Experience Design", title: "Open Component Library", subtitle: "DS-05 canonical semantic component library", href: "/experience-design/components" },
  { id: "command:interaction-patterns", type: "Experience Design", title: "Open Interaction Patterns", subtitle: "DS-05A canonical semantic interaction pattern library", href: "/experience-design/patterns" },
  { id: "command:verification", type: "Verification", title: "Run Verification", subtitle: "Open validation engine", href: "/validation-engine" },
  { id: "command:publish-runtime", type: "Runtime", title: "Publish Runtime", subtitle: "Content release workflow", href: "/content-releases" },
  { id: "command:recent-assets", type: "Asset Library", title: "Open Recent Assets", subtitle: "Recently opened Studio assets", href: "/asset-library?folder=recently-opened" },
  { id: "command:favorites", type: "Asset Library", title: "Open Favorite Assets", subtitle: "Studio-only favorites", href: "/asset-library?folder=favorites" }
];

export function StudioCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PaletteResult[]>(commandSeeds);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      fetch(`/api/studio-search?q=${encodeURIComponent(query)}&limit=24`, { signal: controller.signal })
        .then((response) => response.ok ? response.json() : null)
        .then((payload: { results?: PaletteResult[] } | null) => {
          const remote = payload?.results ?? [];
          setResults(query.trim() ? remote : [...commandSeeds, ...remote.filter((item) => !commandSeeds.some((seed) => seed.href === item.href)).slice(0, 8)]);
          setActiveIndex(0);
        })
        .catch(() => {
          setResults(commandSeeds);
        });
    }, 120);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [open, query]);

  const active = results[activeIndex] ?? results[0];
  const visibleResults = useMemo(() => results.slice(0, 24), [results]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(visibleResults.length - 1, current + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, current - 1));
    }
    if (event.key === "Enter" && active) {
      event.preventDefault();
      window.location.assign(active.href);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Studio command palette" onClick={() => setOpen(false)}>
      <div className="mx-auto mt-16 w-full max-w-3xl overflow-hidden rounded-md border border-cyan-300/25 bg-[#07101e] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-cyan-300/15 px-4 py-3">
          <Search className="h-5 w-5 text-cyan-200" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Studio or run a command"
            className="h-10 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-600"
          />
          <span className="hidden rounded border border-slate-700 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500 sm:inline">Command+K / Ctrl+K</span>
          <span className="rounded border border-slate-700 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500">Esc</span>
        </div>
        <div className="max-h-[60vh] overflow-auto p-2">
          {visibleResults.map((result, index) => (
            <Link
              key={result.id}
              href={result.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between gap-4 rounded-md px-3 py-2 text-left transition ${index === activeIndex ? "bg-cyan-300/12 text-white" : "text-slate-300 hover:bg-cyan-300/8 hover:text-white"}`}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-black">{result.title}</span>
                <span className="block truncate text-xs font-semibold text-slate-500">{result.subtitle}</span>
              </span>
              <span className="shrink-0 rounded border border-cyan-300/15 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-cyan-100">{result.type}</span>
            </Link>
          ))}
          {!visibleResults.length ? <p className="p-6 text-center text-sm font-semibold text-slate-500">No Studio records found.</p> : null}
        </div>
      </div>
    </div>
  );
}
