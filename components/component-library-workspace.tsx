"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Download,
  Eye,
  Grid3X3,
  Layers3,
  ListTree,
  MousePointer2,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Table2
} from "lucide-react";
import {
  componentCategoryDefinitions,
  componentPreviewModes,
  componentStates,
  noverisComponentLibrary,
  type CanonicalComponentDefinition,
  type ComponentCategory,
  type ComponentPreviewMode,
  type ComponentState
} from "@/lib/component-library";
import { cn } from "@/lib/utils";

type ComponentSection = "overview" | "preview" | "validation" | "unity-export" | ComponentCategory;

const library = noverisComponentLibrary;
const categoryDefinitions = componentCategoryDefinitions();

const previewModeLabels: Record<ComponentPreviewMode, string> = {
  "light-grid": "Light Grid",
  "dark-grid": "Dark Grid",
  transparent: "Transparent",
  "16:10": "16:10"
};

function labelFor(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-100/75">{children}</p>;
}

function TokenPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-cyan-300/15 bg-slate-950/60 px-2 py-1 font-mono text-[10px] text-slate-300">{children}</span>;
}

function ComponentPreview({ component, state, variant, mode }: { component: CanonicalComponentDefinition; state: ComponentState; variant: string; mode: ComponentPreviewMode }) {
  const isButton = component.category === "buttons";
  const isRing = component.category === "technology-rings";
  const isInput = component.category === "inputs";
  const isTable = component.category === "tables";
  const isList = component.category === "lists";
  const isProgress = component.category === "progress";
  const isBadge = component.category === "badges";
  const isDisabled = state === "disabled" || state === "hidden";
  const canvasClass = {
    "light-grid": "bg-slate-200 text-slate-950",
    "dark-grid": "bg-slate-950 text-slate-50",
    transparent: "bg-transparent text-slate-100",
    "16:10": "bg-slate-950 text-slate-50"
  }[mode];

  return (
    <div className={cn("relative grid min-h-[270px] place-items-center overflow-hidden rounded-md border border-cyan-300/20 p-7", canvasClass, mode !== "transparent" && "bg-[linear-gradient(rgba(77,178,203,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(77,178,203,0.1)_1px,transparent_1px)] bg-[size:24px_24px]", mode === "16:10" && "aspect-[16/10] min-h-0") }>
      {isRing ? <div className={cn("grid h-28 w-28 place-items-center rounded-full border-[7px] border-cyan-300/70 bg-slate-950/70 shadow-[0_0_28px_rgba(66,218,255,0.3)]", state === "inactive" || state === "hidden" ? "opacity-40" : "") }><div className="grid h-20 w-20 place-items-center rounded-full border border-cyan-100/25"><CircleDot className="h-7 w-7 text-cyan-100" /><span className="mt-[-12px] text-[10px] font-bold uppercase tracking-wider text-cyan-50">{state}</span></div></div> : null}
      {isButton ? <button type="button" disabled={isDisabled} className={cn("inline-flex min-w-40 items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-semibold transition", component.id.includes("danger") ? "border-rose-300/45 bg-rose-400/15 text-rose-50" : component.id.includes("ghost") ? "border-cyan-200/25 bg-transparent text-cyan-50" : component.id.includes("secondary") ? "border-cyan-300/35 bg-slate-950/80 text-cyan-50" : "border-cyan-200/50 bg-cyan-300/15 text-cyan-50", state === "hover" || state === "focused" ? "ring-2 ring-cyan-200/50" : "", state === "pressed" ? "translate-y-px bg-cyan-300/25" : "", isDisabled ? "cursor-not-allowed opacity-40" : "") }><MousePointer2 className="h-4 w-4" />{component.id.includes("icon") ? "Icon Action" : `${labelFor(variant)} Action`}</button> : null}
      {isInput ? <div className="w-full max-w-md rounded-md border border-cyan-300/25 bg-slate-950/80 p-3"><div className="flex items-center gap-2 text-sm text-slate-400"><Search className="h-4 w-4" /><span>{component.id.includes("search") ? "Search canonical records" : `${component.displayName} value`}</span></div><div className="mt-3 h-2 rounded bg-cyan-100/15"><div className="h-2 w-2/5 rounded bg-cyan-200/55" /></div></div> : null}
      {isTable ? <div className="w-full max-w-xl overflow-hidden rounded-md border border-cyan-300/20 bg-slate-950/80"><div className="grid grid-cols-3 border-b border-cyan-300/15 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-cyan-100"><span>Component</span><span>State</span><span>Version</span></div>{["Primary Button", "Research Ring", "Planet Card"].map((row, index) => <div key={row} className="grid grid-cols-3 px-4 py-3 text-xs text-slate-300"><span>{row}</span><span>{index === 1 ? "Selected" : "Ready"}</span><span>v1.0.0</span></div>)}</div> : null}
      {isList ? <div className="w-full max-w-md space-y-2 rounded-md border border-cyan-300/20 bg-slate-950/80 p-3">{["Noveris Prime", "Research Vector", "Discovery Catalog"].map((row, index) => <div key={row} className={cn("flex items-center justify-between rounded border px-3 py-2 text-sm", index === 0 ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-50" : "border-white/10 text-slate-300")}><span>{row}</span><ChevronRight className="h-4 w-4" /></div>)}</div> : null}
      {isProgress ? <div className="w-full max-w-md"><div className="flex justify-between text-xs text-slate-300"><span>Canonical progress</span><span>64%</span></div><div className="mt-2 h-3 rounded-full bg-slate-700/60"><div className="h-full w-[64%] rounded-full bg-cyan-300/65" /></div></div> : null}
      {isBadge ? <span className="rounded border border-cyan-300/40 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-cyan-50">{state === "error" ? "Attention" : "Ready"}</span> : null}
      {!isButton && !isRing && !isInput && !isTable && !isList && !isProgress && !isBadge ? <div className="w-full max-w-lg rounded-md border border-cyan-300/20 bg-slate-950/80 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.28)]"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-slate-50">{component.displayName}</p><p className="mt-1 text-sm text-slate-400">{component.description}</p></div><span className="rounded border border-cyan-300/25 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-100">{state}</span></div><div className="mt-5 flex gap-2"><div className="h-9 flex-1 rounded border border-cyan-300/15 bg-cyan-300/10" /><div className="h-9 w-20 rounded border border-cyan-300/15 bg-slate-800" /></div></div> : null}
      <span className="absolute bottom-3 left-4 font-mono text-[10px] text-slate-500">{component.id} / {variant} / {state}</span>
    </div>
  );
}

function Inspector({ component }: { component: CanonicalComponentDefinition }) {
  return <aside className="space-y-4 rounded-md border border-cyan-300/15 bg-slate-950/55 p-4 xl:sticky xl:top-5 xl:h-[calc(100vh-7rem)] xl:overflow-y-auto">
    <div className="flex items-center justify-between gap-3"><div><SectionLabel>Inspector</SectionLabel><h2 className="mt-1 text-base font-semibold text-slate-50">{component.displayName}</h2></div><span className="rounded border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">{component.validation.status}</span></div>
    <p className="text-sm leading-6 text-slate-400">{component.description}</p>
    <div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded border border-white/10 p-2"><SectionLabel>Version</SectionLabel><p className="mt-1 font-mono text-slate-200">{component.version}</p></div><div className="rounded border border-white/10 p-2"><SectionLabel>Category</SectionLabel><p className="mt-1 text-slate-200">{labelFor(component.category)}</p></div></div>
    <div><SectionLabel>Unity Prefab</SectionLabel><p className="mt-2 break-all rounded border border-white/10 bg-black/20 p-2 font-mono text-[11px] text-cyan-100">{component.unityPrefabId}</p></div>
    <div><SectionLabel>Slots</SectionLabel><div className="mt-2 space-y-1.5">{component.slots.map((slot) => <div key={slot.id} className="flex items-center justify-between gap-2 rounded border border-white/10 px-2 py-1.5 text-xs"><span className="text-slate-200">{slot.displayName}</span><span className="text-slate-500">{slot.required ? "Required" : "Optional"}</span></div>)}</div></div>
    <div><SectionLabel>Token References</SectionLabel><div className="mt-2 flex flex-wrap gap-1.5">{Object.values(component.designTokens).flat().map((token) => <TokenPill key={token}>{token}</TokenPill>)}</div></div>
    <div><SectionLabel>Used By</SectionLabel><div className="mt-2 flex flex-wrap gap-1.5">{component.usedBy.map((screen) => <TokenPill key={screen}>{screen}</TokenPill>)}</div></div>
    <div className="border-t border-white/10 pt-3"><SectionLabel>Inheritance</SectionLabel><p className="mt-2 font-mono text-[11px] text-slate-400">{component.inheritsFrom.id} v{component.inheritsFrom.version}</p>{component.extendsComponentId ? <p className="mt-1 font-mono text-[11px] text-cyan-100">extends {component.extendsComponentId}</p> : null}</div>
  </aside>;
}

export function ComponentLibraryWorkspace() {
  const [section, setSection] = useState<ComponentSection>("overview");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("component.button.primary");
  const [previewMode, setPreviewMode] = useState<ComponentPreviewMode>("dark-grid");
  const [previewState, setPreviewState] = useState<ComponentState>("default");
  const selected = library.components.find((component) => component.id === selectedId) ?? library.components[0];
  const selectedVariant = selected.variants[0]?.id ?? "standard";
  const [variant, setVariant] = useState(selectedVariant);

  const displayedComponents = useMemo(() => library.components.filter((component) => {
    const matchesSection = section === "overview" || section === "preview" || section === "validation" || section === "unity-export" || component.category === section;
    const haystack = [component.id, component.displayName, component.category, component.description, ...component.tags, ...component.usedBy].join(" ").toLowerCase();
    return matchesSection && haystack.includes(query.toLowerCase());
  }), [query, section]);

  function selectComponent(component: CanonicalComponentDefinition) {
    setSelectedId(component.id);
    setVariant(component.variants[0]?.id ?? "standard");
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Design System</p><h1 className="mt-2 text-3xl font-semibold text-slate-50">NOVERIS Component Library</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Canonical component contracts for Unity. Components inherit token references from the NOVERIS Design Language; Unity owns rendering and screen assembly.</p></div><div className="flex items-center gap-2"><span className="rounded border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 font-mono text-xs text-cyan-50">v{library.version}</span><a href={library.unityExport.endpoint} download className="inline-flex items-center gap-2 rounded-md border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-50 hover:bg-cyan-300/20"><Download className="h-4 w-4" />Unity JSON</a></div></div>

        <div className="grid gap-5 xl:grid-cols-[245px_minmax(0,1fr)_310px]">
          <nav aria-label="Component library sections" className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-3 xl:sticky xl:top-5 xl:h-fit"><SectionLabel>Component Library</SectionLabel><div className="mt-3 space-y-1"><button type="button" onClick={() => setSection("overview")} className={cn("flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm", section === "overview" ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><Grid3X3 className="h-4 w-4" />Overview</button>{categoryDefinitions.map((category) => <button key={category.id} type="button" onClick={() => setSection(category.id)} className={cn("flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm", section === category.id ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><span className="flex items-center gap-2"><Box className="h-4 w-4" />{category.displayName}</span><span className="font-mono text-[10px] text-slate-500">{category.count}</span></button>)}</div><div className="mt-4 border-t border-white/10 pt-3"><button type="button" onClick={() => setSection("preview")} className={cn("flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm", section === "preview" ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><Eye className="h-4 w-4" />Preview</button><button type="button" onClick={() => setSection("validation")} className={cn("mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm", section === "validation" ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><ShieldCheck className="h-4 w-4" />Validation</button><button type="button" onClick={() => setSection("unity-export")} className={cn("mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm", section === "unity-export" ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><Download className="h-4 w-4" />Unity Export</button></div></nav>

          <section className="min-w-0 space-y-5">
            {(section === "overview" || section === "preview") ? <div className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><SectionLabel>Live Preview</SectionLabel><h2 className="mt-1 text-xl font-semibold text-slate-50">{selected.displayName}</h2><p className="mt-1 text-sm text-slate-400">{selected.id}</p></div><Link href="/creative-production/design-system" className="text-sm font-medium text-cyan-100 hover:text-cyan-50">Open Design Language</Link></div><div className="mt-5 grid gap-3 md:grid-cols-3"><label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Surface<select value={previewMode} onChange={(event) => setPreviewMode(event.target.value as ComponentPreviewMode)} className="mt-2 block w-full rounded border border-cyan-300/20 bg-slate-950 px-3 py-2 text-sm normal-case tracking-normal text-slate-100">{componentPreviewModes.map((mode) => <option key={mode} value={mode}>{previewModeLabels[mode]}</option>)}</select></label><label className="text-xs font-semibold uppercase tracking-wider text-slate-500">State<select value={previewState} onChange={(event) => setPreviewState(event.target.value as ComponentState)} className="mt-2 block w-full rounded border border-cyan-300/20 bg-slate-950 px-3 py-2 text-sm normal-case tracking-normal text-slate-100">{componentStates.map((state) => <option key={state} value={state}>{labelFor(state)}</option>)}</select></label><label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Variant<select value={variant} onChange={(event) => setVariant(event.target.value)} className="mt-2 block w-full rounded border border-cyan-300/20 bg-slate-950 px-3 py-2 text-sm normal-case tracking-normal text-slate-100">{selected.variants.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}</select></label></div><div className="mt-4"><ComponentPreview component={selected} state={previewState} variant={variant} mode={previewMode} /></div></div> : null}

            {section === "validation" ? <div className="rounded-md border border-emerald-300/20 bg-emerald-300/5 p-5"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-200" /><div><SectionLabel>Validation</SectionLabel><h2 className="mt-1 text-xl font-semibold text-slate-50">Component Library Ready</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded border border-white/10 bg-black/20 p-4 text-sm text-slate-300">{library.components.length} unique components with canonical IDs, token references, prefab IDs, preview contracts, slots, states, variants, and animations.</div><div className="rounded border border-white/10 bg-black/20 p-4 text-sm text-slate-300">Validation prevents duplicate records, missing tokens, missing animations or slots, bad inheritance, unused components, and unknown Unity component use.</div></div></div> : null}
            {section === "unity-export" ? <div className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-5"><SectionLabel>Unity Export</SectionLabel><h2 className="mt-1 text-xl font-semibold text-slate-50">Contract-only delivery</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">The JSON references canonical tokens, animations, slots, variants, prefab identifiers, and design inheritance. It does not ship pixel values, generated UI, or per-screen style overrides.</p><a href={library.unityExport.endpoint} download className="mt-5 inline-flex items-center gap-2 rounded-md border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-50 hover:bg-cyan-300/20"><Download className="h-4 w-4" />Download Component Library JSON</a></div> : null}

            <div className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><label className="relative block min-w-[240px] flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search components, screens, tokens" className="w-full rounded border border-cyan-300/20 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-200/50 focus:outline-none" /></label><span className="rounded border border-white/10 px-2 py-1 font-mono text-xs text-slate-400">{displayedComponents.length} shown</span></div></div>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{displayedComponents.map((component) => <button key={component.id} type="button" onClick={() => selectComponent(component)} className={cn("group rounded-md border p-4 text-left transition", selected.id === component.id ? "border-cyan-200/50 bg-cyan-300/10" : "border-cyan-300/15 bg-slate-950/55 hover:border-cyan-300/35 hover:bg-slate-950/80")}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-50">{component.displayName}</p><p className="mt-1 text-xs text-slate-500">{labelFor(component.category)}</p></div><span className="rounded border border-emerald-300/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100">Ready</span></div><p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-400">{component.description}</p><div className="mt-4 flex flex-wrap gap-1.5">{component.variants.slice(0, 3).map((item) => <TokenPill key={item.id}>{item.displayName}</TokenPill>)}{component.variants.length > 3 ? <TokenPill>+{component.variants.length - 3}</TokenPill> : null}</div><p className="mt-4 truncate font-mono text-[11px] text-cyan-100/70">{component.unityPrefabId}</p></button>)}</div>
          </section>

          <Inspector component={selected} />
        </div>
      </div>
    </main>
  );
}
