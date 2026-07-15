"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Boxes, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { CompactWorkspaceToolbar, DensityInspector, cardShellClass, collectionGridClass, previewBoxClass, useWorkspaceDensitySettings, type DensitySettings } from "@/components/ui/density";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceSearchBar, WorkspaceStatTile } from "@/components/ui/workspace";
import type { ComponentApprovalStatus, ComponentCategory, ComponentDesignStatus, ComponentLibraryState, ComponentParityStatus } from "@/lib/component-library";
import { cn } from "@/lib/utils";

const categoryOptions: ComponentCategory[] = ["Navigation", "HUD", "Panels", "Buttons", "Cards", "Lists", "Progress", "Forms", "Overlays", "Feedback", "Data Display", "Game-Specific", "Accessibility", "Utility"];
const statuses: Array<"All" | ComponentDesignStatus> = ["All", "Not Started", "Draft", "In Design", "Ready for Review", "Approved", "Implemented", "Needs Revision", "Deprecated"];
const approvals: Array<"All" | ComponentApprovalStatus> = ["All", "Unreviewed", "Changes Requested", "Approved"];
const parityStatuses: Array<"All" | ComponentParityStatus> = ["All", "Not Reviewed", "Needs Work", "Close", "Approved"];
const targets = ["All", "Vite Web", "Roblox", "Unity", "Unreal", "Godot"] as const;

function SelectFilter<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ComponentCard({ component, settings, selected, onSelect }: { component: ComponentLibraryState["components"][number]; settings: DensitySettings; selected: boolean; onSelect: () => void }) {
  const readiness = Math.round((component.checklistComplete / Math.max(1, component.checklistTotal)) * 100);
  const vite = component.implementationTargets.find((target) => target.target === "Vite Web")?.status ?? "Not Started";
  const roblox = component.implementationTargets.find((target) => target.target === "Roblox")?.status ?? "Not Started";
  if (settings.density === "list") {
    return (
      <button type="button" onClick={onSelect} className={cardShellClass(settings, selected)}>
        <div className={cn("overflow-hidden rounded-md", previewBoxClass(settings))}>
          <AssetPreview preview={{ ...component.visualPreview, size: "small" }} allowFullscreen={false} compact />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black text-white">{component.displayName}</h2>
          <p className="mt-1 truncate font-mono text-xs text-cyan-200">{component.componentId}</p>
        </div>
        <WorkspaceBadge value={component.category} />
        <WorkspaceBadge value={component.status} />
        <p className="truncate text-xs text-slate-400">v{component.version}</p>
        <p className="truncate text-xs text-slate-300">{component.approvalStatus}</p>
      </button>
    );
  }
  return (
    <button type="button" onClick={onSelect} className={cardShellClass(settings, selected)}>
      <div className={previewBoxClass(settings)}>
        <AssetPreview preview={{ ...component.visualPreview, size: settings.previewSize === "large" ? "large" : "small" }} allowFullscreen={false} compact={settings.density === "compact"} />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <WorkspaceBadge value={component.category} />
            <WorkspaceBadge value={component.status} />
            <WorkspaceBadge value={component.approvalStatus} />
          </div>
          <h2 className={cn("mt-3 font-black text-white", settings.density === "compact" ? "text-base" : "text-xl")}>{component.displayName}</h2>
          <p className="mt-1 truncate font-mono text-xs text-cyan-200">{component.componentId}</p>
        </div>
        {component.approvalStatus === "Approved" ? <ShieldCheck className="h-6 w-6 text-emerald-200" /> : <Boxes className="h-6 w-6 text-cyan-200" />}
      </div>
      <p className={cn("mt-3 line-clamp-2 text-sm leading-6 text-slate-300", settings.density === "compact" && "hidden")}>{component.description}</p>
      <div className={cn("mt-3 grid gap-2", settings.density === "compact" ? "grid-cols-2" : "sm:grid-cols-2")}>
        <WorkspaceMiniStat label="Designer" value={component.assignedTo} />
        <WorkspaceMiniStat label="Version" value={`v${component.version}`} />
        {settings.density !== "compact" ? <WorkspaceMiniStat label="Vite" value={vite} /> : null}
        {settings.density !== "compact" ? <WorkspaceMiniStat label="Roblox" value={roblox} /> : null}
      </div>
      <div className={cn("mt-4", settings.density === "compact" && "hidden")}>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>Guardrails</span>
          <span>{readiness}%</span>
        </div>
        <WorkspaceProgressBar value={readiness} className="mt-2" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <WorkspaceBadge value={`parity ${component.parityStatus}`} />
        {component.breakingChanges.some((change) => !change.resolved) ? <WorkspaceBadge value="Breaking Change" /> : null}
      </div>
    </button>
  );
}

function ComponentInspector({ component }: { component: ComponentLibraryState["components"][number] }) {
  const readiness = Math.round((component.checklistComplete / Math.max(1, component.checklistTotal)) * 100);
  return (
    <DensityInspector title={component.displayName}>
      <AssetPreview preview={{ ...component.visualPreview, size: "large" }} allowFullscreen={false} />
      <div className="flex flex-wrap gap-2">
        <WorkspaceBadge value={component.category} />
        <WorkspaceBadge value={component.status} />
        <WorkspaceBadge value={component.approvalStatus} />
      </div>
      <p className="text-sm leading-6 text-slate-300">{component.description}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <WorkspaceMiniStat label="Version" value={`v${component.version}`} />
        <WorkspaceMiniStat label="Designer" value={component.assignedTo} />
        <WorkspaceMiniStat label="Screens" value={component.screenUsages.length} />
        <WorkspaceMiniStat label="Variants" value={component.variants.length} />
        <WorkspaceMiniStat label="States" value={component.stateCount} />
        <WorkspaceMiniStat label="Missing Assets" value={component.missingAssets} />
      </div>
      <WorkspaceProgressBar value={readiness} />
      <Link href={`/component-library/${component.componentId}`} className="inline-flex h-9 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20">
        Open Component Detail
      </Link>
    </DensityInspector>
  );
}

export function ComponentLibraryWorkspace({ state }: { state: ComponentLibraryState }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | ComponentCategory>("All");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [approval, setApproval] = useState<(typeof approvals)[number]>("All");
  const [target, setTarget] = useState<(typeof targets)[number]>("All");
  const [parity, setParity] = useState<(typeof parityStatuses)[number]>("All");
  const [missingAssets, setMissingAssets] = useState(false);
  const [missingStates, setMissingStates] = useState(false);
  const [densitySettings, setDensitySettings] = useWorkspaceDensitySettings("project-genesis-density-component-library");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.components.filter((component) => {
      const targetMatches = target === "All" || component.implementationTargets.some((item) => item.target === target);
      return (!needle || [component.displayName, component.componentId, component.description, component.assignedTo, component.category, component.screenUsages.map((usage) => usage.screenName).join(" ")].join(" ").toLowerCase().includes(needle))
        && (category === "All" || component.category === category)
        && (status === "All" || component.status === status)
        && (approval === "All" || component.approvalStatus === approval)
        && (parity === "All" || component.parityStatus === parity)
        && targetMatches
        && (!missingAssets || component.missingAssets > 0)
        && (!missingStates || component.missingStates > 0);
    });
  }, [approval, category, missingAssets, missingStates, parity, query, state.components, status, target]);
  const first = filtered[0] ?? state.components[0];
  const [selectedId, setSelectedId] = useState(first?.componentId ?? "");
  const selected = filtered.find((component) => component.componentId === selectedId) ?? first;

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Creative / Design System"
        title="Component Library"
        description="Studio-managed reusable game UI component specifications for Vite Web, Roblox, Unity, Unreal, and Godot. Component records track anatomy, tokens, assets, variants, states, data contracts, parity, and handoff without replacing client code."
        stats={[
          { label: "Components", value: state.stats.total },
          { label: "In Design", value: state.stats.inDesign },
          { label: "Approved", value: state.stats.approved },
          { label: "Implemented", value: state.stats.implemented }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <WorkspacePanel title="Component Readiness" icon={Boxes}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <WorkspaceStatTile label="Parity Approved" value={state.stats.parityApproved} />
            <WorkspaceStatTile label="Missing Assets" value={state.stats.missingAssets} />
            <WorkspaceStatTile label="Missing States" value={state.stats.missingStates} />
            <WorkspaceStatTile label="Breaking Changes" value={state.stats.breakingChanges} />
            <WorkspaceStatTile label="Preview Pending" value={state.stats.componentPreviewsPending} />
            <WorkspaceStatTile label="Preview Generated" value={state.stats.componentPreviewsGenerated} />
            <WorkspaceStatTile label="Needs Review" value={state.stats.componentPreviewsNeedsReview} />
            <WorkspaceStatTile label="Capture Blocked" value={state.stats.componentPreviewsBlockedByMissingBrowserCapture} />
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Export Safety" icon={TriangleAlert}>
          <p className="text-sm leading-6 text-slate-300">Component drafts are Studio-only design records. Public runtime exports stay sanitized; only separately promoted presentation hints may become runtime data later.</p>
          <WorkspaceMiniStat className="mt-3" label="Affected Screens" value={state.stats.screensAffectedByPendingChanges} />
        </WorkspacePanel>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
        <div className="grid gap-3 xl:grid-cols-[1fr_repeat(5,11rem)]">
          <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search components, IDs, screens, designers, variants" />
          <SelectFilter label="Category" value={category} options={["All", ...categoryOptions]} onChange={setCategory} />
          <SelectFilter label="Status" value={status} options={statuses} onChange={setStatus} />
          <SelectFilter label="Approval" value={approval} options={approvals} onChange={setApproval} />
          <SelectFilter label="Target" value={target} options={targets} onChange={setTarget} />
          <SelectFilter label="Parity" value={parity} options={parityStatuses} onChange={setParity} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-200">
            <input type="checkbox" checked={missingAssets} onChange={(event) => setMissingAssets(event.target.checked)} />
            Missing assets
          </label>
          <label className="inline-flex items-center gap-2 rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-200">
            <input type="checkbox" checked={missingStates} onChange={(event) => setMissingStates(event.target.checked)} />
            Missing states
          </label>
          <span className="inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2 text-sm font-semibold text-slate-400">
            <Search className="h-4 w-4" />
            {filtered.length} shown
          </span>
        </div>
      </section>

      <CompactWorkspaceToolbar
        query={query}
        onQueryChange={setQuery}
        settings={densitySettings}
        onSettingsChange={(patch) => {
          if (patch.filter) setStatus(patch.filter === "all" ? "All" : patch.filter as typeof status);
          setDensitySettings(patch);
        }}
        resultCount={filtered.length}
        totalCount={state.components.length}
        placeholder="Search components, IDs, screens, designers, variants"
        filterOptions={[{ value: "all", label: "All" }, ...statuses.filter((item) => item !== "All").map((item) => ({ value: item, label: item }))]}
        groupOptions={[{ value: "none", label: "None" }, { value: "category", label: "Category" }, { value: "status", label: "Status" }, { value: "component", label: "Component" }, { value: "published", label: "Published" }, { value: "missing", label: "Missing" }]}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className={collectionGridClass(densitySettings)}>
          {filtered.map((component) => (
            <ComponentCard key={component.componentId} component={component} settings={densitySettings} selected={selected?.componentId === component.componentId} onSelect={() => setSelectedId(component.componentId)} />
          ))}
        </div>
        {selected ? <ComponentInspector component={selected} /> : null}
      </section>
    </main>
  );
}
