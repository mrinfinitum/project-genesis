"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  LayoutDashboard,
  Search,
  ShieldCheck
} from "lucide-react";
import {
  noverisScreenTemplateLibrary,
  screenTemplateCategoryDefinitions,
  screenLayoutModes,
  type ScreenLayoutMode,
  type ScreenTemplateCategory,
  type ScreenTemplateDefinition
} from "@/lib/screen-template-library";
import { cn } from "@/lib/utils";

type ScreenTemplateSection = "overview" | "preview" | "validation" | "unity-export" | ScreenTemplateCategory;

const library = noverisScreenTemplateLibrary;
const categoryDefinitions = screenTemplateCategoryDefinitions();

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-100/75">{children}</p>;
}

function TokenPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-cyan-300/15 bg-slate-950/60 px-2 py-1 font-mono text-[10px] text-slate-300">{children}</span>;
}

function regionClass(regionId: string) {
  if (regionId === "top-navigation") return "col-span-full min-h-10";
  if (regionId === "page-header") return "col-span-full min-h-14";
  if (regionId === "left-sidebar") return "row-span-2 min-h-28";
  if (regionId === "right-inspector") return "row-span-2 min-h-28";
  if (regionId === "primary-workspace" || regionId === "content-tree") return "min-h-28";
  if (regionId === "bottom-footer") return "col-span-full min-h-9";
  if (regionId.includes("modal")) return "col-span-full min-h-16";
  if (regionId.includes("inspector")) return "col-span-full min-h-16";
  return "min-h-12";
}

function ScreenWireframe({ template, mode }: { template: ScreenTemplateDefinition; mode: ScreenLayoutMode }) {
  const visibleRegions = template.layoutRegions.filter((region) => !(mode === "inspector-hidden" && region.id === "right-inspector"));
  return (
    <div className="overflow-hidden rounded-md border border-cyan-300/20 bg-slate-950/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-cyan-300/15 pb-3">
        <div><SectionLabel>Semantic Preview</SectionLabel><p className="mt-1 text-sm font-semibold text-slate-100">{template.displayName} / {mode.replaceAll("-", " ")}</p></div>
        <span className="rounded border border-cyan-300/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-100">Unity owns layout</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {visibleRegions.map((region) => (
          <div key={region.id} className={cn("relative overflow-hidden rounded border border-cyan-300/20 bg-[linear-gradient(rgba(77,178,203,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(77,178,203,0.08)_1px,transparent_1px)] bg-slate-950/80 bg-[size:18px_18px] p-3", regionClass(region.id), region.required ? "border-cyan-300/30" : "border-slate-700/70") }>
            <div className="flex items-start justify-between gap-2"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-100">{region.displayName}</p><span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", region.required ? "bg-cyan-300/10 text-cyan-100" : "bg-slate-800 text-slate-400")}>{region.required ? "Required" : region.visibility.replaceAll("-", " ")}</span></div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{region.componentIds.map((id) => id.replace("component.", "")).join(" / ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateInspector({ template }: { template: ScreenTemplateDefinition }) {
  const usage = library.screenUsage.find((item) => item.screenTemplateId === template.id);
  return (
    <aside className="space-y-4 rounded-md border border-cyan-300/15 bg-slate-950/55 p-4 xl:sticky xl:top-5 xl:h-[calc(100vh-7rem)] xl:overflow-y-auto">
      <div className="flex items-center justify-between gap-3"><div><SectionLabel>Screen Inspector</SectionLabel><h2 className="mt-1 text-base font-semibold text-slate-50">{template.displayName}</h2></div><span className="rounded border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">{template.validation.status}</span></div>
      <p className="text-sm leading-6 text-slate-400">{template.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded border border-white/10 p-2"><SectionLabel>Version</SectionLabel><p className="mt-1 font-mono text-slate-200">{template.version}</p></div><div className="rounded border border-white/10 p-2"><SectionLabel>Category</SectionLabel><p className="mt-1 text-slate-200">{template.category.replaceAll("-", " ")}</p></div></div>
      <div><SectionLabel>Required Components</SectionLabel><div className="mt-2 flex flex-wrap gap-1.5">{template.requiredComponents.map((id) => <TokenPill key={id}>{id.replace("component.", "")}</TokenPill>)}</div></div>
      <div><SectionLabel>Optional Components</SectionLabel><div className="mt-2 flex flex-wrap gap-1.5">{template.optionalComponents.map((id) => <TokenPill key={id}>{id.replace("component.", "")}</TokenPill>)}</div></div>
      <div><SectionLabel>Asset Slots</SectionLabel><div className="mt-2 space-y-1.5">{template.assetSlots.map((slot) => <div key={slot.id} className="rounded border border-white/10 p-2"><div className="flex items-center justify-between gap-2 text-xs"><span className="font-medium text-slate-200">{slot.displayName}</span><span className={slot.required ? "text-cyan-100" : "text-slate-500"}>{slot.required ? "Required" : "Optional"}</span></div><p className="mt-1 font-mono text-[10px] text-slate-500">{slot.roleId}</p></div>)}</div></div>
      <div><SectionLabel>Runtime Contracts</SectionLabel><div className="mt-2 flex flex-wrap gap-1.5">{template.runtimeContracts.map((contract) => <TokenPill key={contract.id}>{contract.id}</TokenPill>)}</div></div>
      {usage ? <div className="border-t border-white/10 pt-3"><SectionLabel>Unity Binding</SectionLabel><p className="mt-2 break-all font-mono text-[11px] text-cyan-100">{usage.unityScreenId}</p><p className="mt-1 text-xs text-slate-500">{usage.implementationStatus} / component and asset coverage {usage.componentCoverage}</p></div> : null}
    </aside>
  );
}

export function ScreenTemplateLibraryWorkspace() {
  const [section, setSection] = useState<ScreenTemplateSection>("overview");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("screen.planet-detail");
  const [previewMode, setPreviewMode] = useState<ScreenLayoutMode>("desktop");
  const selected = library.templates.find((template) => template.id === selectedId) ?? library.templates[0];
  const displayedTemplates = useMemo(() => library.templates.filter((template) => {
    const matchesSection = section === "overview" || section === "preview" || section === "validation" || section === "unity-export" || template.category === section;
    const searchable = [template.id, template.displayName, template.category, template.description, ...template.requiredComponents, ...template.optionalComponents, ...template.assetSlots.flatMap((slot) => [slot.id, slot.roleId])].join(" ").toLowerCase();
    return matchesSection && searchable.includes(query.toLowerCase());
  }), [query, section]);

  function selectTemplate(template: ScreenTemplateDefinition) {
    setSelectedId(template.id);
    setSection("preview");
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Design System</p><h1 className="mt-2 text-3xl font-semibold text-slate-50">NOVERIS Screen Template Library</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Canonical Unity screen contracts for semantic hierarchy, required components, asset roles, and available layout modes. Studio does not own coordinates, anchors, rendering, or player interaction.</p></div><div className="flex items-center gap-2"><span className="rounded border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 font-mono text-xs text-cyan-50">v{library.version}</span><a href={library.unityExport.endpoint} download className="inline-flex items-center gap-2 rounded-md border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-50 hover:bg-cyan-300/20"><Download className="h-4 w-4" />Unity JSON</a></div></div>

        <div className="grid gap-5 xl:grid-cols-[245px_minmax(0,1fr)_320px]">
          <nav aria-label="Screen template library sections" className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-3 xl:sticky xl:top-5 xl:h-fit"><SectionLabel>Screen Templates</SectionLabel><div className="mt-3 space-y-1"><button type="button" onClick={() => setSection("overview")} className={cn("flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm", section === "overview" ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><LayoutDashboard className="h-4 w-4" />Overview</button>{categoryDefinitions.map((category) => <button key={category.id} type="button" onClick={() => setSection(category.id)} className={cn("flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm", section === category.id ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><span className="flex items-center gap-2"><Box className="h-4 w-4" />{category.displayName}</span><span className="font-mono text-[10px] text-slate-500">{category.count}</span></button>)}</div><div className="mt-4 border-t border-white/10 pt-3"><button type="button" onClick={() => setSection("preview")} className={cn("flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm", section === "preview" ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><Eye className="h-4 w-4" />Preview</button><button type="button" onClick={() => setSection("validation")} className={cn("mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm", section === "validation" ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><ShieldCheck className="h-4 w-4" />Validation</button><button type="button" onClick={() => setSection("unity-export")} className={cn("mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm", section === "unity-export" ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}><Download className="h-4 w-4" />Unity Export</button></div></nav>

          <section className="min-w-0 space-y-5">
            {(section === "overview" || section === "preview") ? <div className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><SectionLabel>{section === "preview" ? "Read-only Preview" : "Selected Screen"}</SectionLabel><h2 className="mt-1 text-xl font-semibold text-slate-50">{selected.displayName}</h2><p className="mt-1 font-mono text-xs text-slate-500">{selected.id} / inherits {selected.inheritsFrom}</p></div><Link href="/creative-production/design-system/component-library" className="text-sm font-medium text-cyan-100 hover:text-cyan-50">Open Component Library</Link></div><label className="mt-5 block max-w-sm text-xs font-semibold uppercase tracking-wider text-slate-500">Layout Mode<select value={previewMode} onChange={(event) => setPreviewMode(event.target.value as ScreenLayoutMode)} className="mt-2 block w-full rounded border border-cyan-300/20 bg-slate-950 px-3 py-2 text-sm normal-case tracking-normal text-slate-100">{screenLayoutModes.map((mode) => <option key={mode} value={mode}>{mode.replaceAll("-", " ")}</option>)}</select></label><div className="mt-4"><ScreenWireframe template={selected} mode={previewMode} /></div></div> : null}

            {section === "validation" ? <div className="rounded-md border border-emerald-300/20 bg-emerald-300/5 p-5"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-200" /><div><SectionLabel>Validation</SectionLabel><h2 className="mt-1 text-xl font-semibold text-slate-50">Screen Template Library Ready</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded border border-white/10 bg-black/20 p-4 text-sm text-slate-300">{library.templates.length} screen templates validate against the canonical Design Language and Component Library.</div><div className="rounded border border-white/10 bg-black/20 p-4 text-sm text-slate-300">Validation rejects missing or duplicate regions and slots, unknown components or roles, missing runtime contracts, broken hierarchy, and local layout ownership.</div></div></div> : null}
            {section === "unity-export" ? <div className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-5"><SectionLabel>Unity Export</SectionLabel><h2 className="mt-1 text-xl font-semibold text-slate-50">Contract-only screen delivery</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Unity receives screen IDs, semantic regions, component IDs, asset-slot IDs, layout modes, token references, and runtime contracts. It never receives coordinates, anchors, or Studio-owned interaction behavior.</p><a href={library.unityExport.endpoint} download className="mt-5 inline-flex items-center gap-2 rounded-md border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-50 hover:bg-cyan-300/20"><Download className="h-4 w-4" />Download Screen Templates JSON</a></div> : null}

            <div className="rounded-md border border-cyan-300/15 bg-slate-950/55 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><label className="relative block min-w-[240px] flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search screens, components, asset slots" className="w-full rounded border border-cyan-300/20 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-200/50 focus:outline-none" /></label><span className="rounded border border-white/10 px-2 py-1 font-mono text-xs text-slate-400">{displayedTemplates.length} shown</span></div></div>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{displayedTemplates.map((template) => <button key={template.id} type="button" onClick={() => selectTemplate(template)} className={cn("group rounded-md border p-4 text-left transition", selected.id === template.id ? "border-cyan-200/50 bg-cyan-300/10" : "border-cyan-300/15 bg-slate-950/55 hover:border-cyan-300/35 hover:bg-slate-950/80")}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-50">{template.displayName}</p><p className="mt-1 text-xs capitalize text-slate-500">{template.category.replaceAll("-", " ")}</p></div><span className="rounded border border-emerald-300/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100">Ready</span></div><p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-400">{template.description}</p><div className="mt-4 flex items-center gap-4 text-xs text-slate-500"><span>{template.layoutRegions.length} regions</span><span>{template.assetSlots.length} slots</span><span>{template.requiredComponents.length} required</span></div><p className="mt-4 truncate font-mono text-[11px] text-cyan-100/70">{template.id}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-100">Preview contract <ChevronRight className="h-3.5 w-3.5" /></span></button>)}</div>
          </section>

          <TemplateInspector template={selected} />
        </div>
      </div>
    </main>
  );
}
