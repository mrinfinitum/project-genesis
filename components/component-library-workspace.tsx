"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Boxes, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceSearchBar, WorkspaceStatTile } from "@/components/ui/workspace";
import type { ComponentApprovalStatus, ComponentCategory, ComponentDesignStatus, ComponentLibraryState, ComponentParityStatus } from "@/lib/component-library";

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

function ComponentCard({ component }: { component: ComponentLibraryState["components"][number] }) {
  const readiness = Math.round((component.checklistComplete / Math.max(1, component.checklistTotal)) * 100);
  const vite = component.implementationTargets.find((target) => target.target === "Vite Web")?.status ?? "Not Started";
  const roblox = component.implementationTargets.find((target) => target.target === "Roblox")?.status ?? "Not Started";
  return (
    <Link href={`/component-library/${component.componentId}`} className="block rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow transition hover:border-cyan-300/50 hover:bg-[#0a1728]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <WorkspaceBadge value={component.category} />
            <WorkspaceBadge value={component.status} />
            <WorkspaceBadge value={component.approvalStatus} />
          </div>
          <h2 className="mt-3 text-xl font-black text-white">{component.displayName}</h2>
          <p className="mt-1 truncate font-mono text-xs text-cyan-200">{component.componentId}</p>
        </div>
        {component.approvalStatus === "Approved" ? <ShieldCheck className="h-6 w-6 text-emerald-200" /> : <Boxes className="h-6 w-6 text-cyan-200" />}
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{component.description}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <WorkspaceMiniStat label="Designer" value={component.assignedTo} />
        <WorkspaceMiniStat label="Version" value={`v${component.version}`} />
        <WorkspaceMiniStat label="Vite" value={vite} />
        <WorkspaceMiniStat label="Roblox" value={roblox} />
        <WorkspaceMiniStat label="Screens" value={component.screenUsages.length} />
        <WorkspaceMiniStat label="Variants" value={component.variants.length} />
        <WorkspaceMiniStat label="Missing Assets" value={component.missingAssets} />
        <WorkspaceMiniStat label="Missing States" value={component.missingStates} />
      </div>
      <div className="mt-4">
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
    </Link>
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

      <section className="grid gap-4 xl:grid-cols-2">
        {filtered.map((component) => <ComponentCard key={component.componentId} component={component} />)}
      </section>
    </main>
  );
}
