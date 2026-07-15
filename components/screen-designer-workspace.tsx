"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, MonitorCog, Search, ShieldAlert } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { CompactWorkspaceToolbar, DensityInspector, cardShellClass, collectionGridClass, previewBoxClass, useWorkspaceDensitySettings, type DensitySettings } from "@/components/ui/density";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceSearchBar, WorkspaceStatTile } from "@/components/ui/workspace";
import type { ScreenDesignerState, ScreenDesignStatus, ScreenApprovalStatus } from "@/lib/screen-designer";
import { cn } from "@/lib/utils";

const statusOptions: Array<"All" | ScreenDesignStatus> = ["All", "Not Started", "Draft", "In Design", "Ready for Review", "Approved", "Implemented", "Needs Revision"];
const approvalOptions: Array<"All" | ScreenApprovalStatus> = ["All", "Unreviewed", "Changes Requested", "Approved"];
const targets = ["All", "Vite Web", "Roblox", "Unity", "Unreal", "Godot"] as const;

function SelectFilter<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ScreenCard({ screen, settings, selected, onSelect }: { screen: ScreenDesignerState["screens"][number]; settings: DensitySettings; selected: boolean; onSelect: () => void }) {
  const completion = Math.round((screen.checklistComplete / Math.max(1, screen.checklistTotal)) * 100);
  const vite = screen.implementationTargets.find((target) => target.target === "Vite Web")?.status ?? "Not Started";
  const roblox = screen.implementationTargets.find((target) => target.target === "Roblox")?.status ?? "Not Started";

  if (settings.density === "list") {
    return (
      <button type="button" onClick={onSelect} className={cardShellClass(settings, selected)}>
        <div className={cn("overflow-hidden rounded-md", previewBoxClass(settings))}>
          <AssetPreview preview={{ ...screen.visualPreview, size: "small" }} allowFullscreen={false} compact />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black text-white">{screen.displayName}</h2>
          <p className="mt-1 truncate font-mono text-xs text-cyan-200">{screen.screenId}</p>
        </div>
        <WorkspaceBadge value={screen.status} />
        <WorkspaceBadge value={screen.approvalStatus} />
        <p className="truncate text-xs text-slate-400">{new Date(screen.updatedAt).toLocaleDateString()}</p>
        <p className="truncate text-xs text-slate-300">v{screen.version} / {screen.responsivePreviewReady ? "Preview" : "Needs Review"}</p>
      </button>
    );
  }

  return (
    <button type="button" onClick={onSelect} className={cardShellClass(settings, selected)}>
      <div className={previewBoxClass(settings)}>
        <AssetPreview preview={{ ...screen.visualPreview, size: settings.previewSize === "large" ? "large" : "small" }} allowFullscreen={false} compact={settings.density === "compact"} />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <WorkspaceBadge value={screen.status} />
            <WorkspaceBadge value={screen.approvalStatus} />
          </div>
          <h2 className={cn("mt-3 font-black text-white", settings.density === "compact" ? "text-base" : "text-2xl")}>{screen.displayName}</h2>
          <p className="mt-1 truncate font-mono text-xs text-cyan-200">{screen.screenId}</p>
        </div>
        {screen.approvalStatus === "Approved" ? <CheckCircle2 className="h-6 w-6 text-emerald-200" /> : <MonitorCog className="h-6 w-6 text-cyan-200" />}
      </div>
      <p className={cn("mt-3 line-clamp-2 text-sm leading-6 text-slate-300", settings.density === "compact" && "hidden")}>{screen.description}</p>
      <div className={cn("mt-3 grid gap-2", settings.density === "compact" ? "grid-cols-2" : "sm:grid-cols-2")}>
        <WorkspaceMiniStat label="Designer" value={screen.assignedTo} />
        <WorkspaceMiniStat label="Updated" value={new Date(screen.updatedAt).toLocaleDateString()} />
        {settings.density !== "compact" ? <WorkspaceMiniStat label="Vite Impl." value={vite} /> : null}
        {settings.density !== "compact" ? <WorkspaceMiniStat label="Roblox Impl." value={roblox} /> : null}
      </div>
      <div className={cn("mt-4", settings.density === "compact" && "hidden")}>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>Readiness Checklist</span>
          <span>{completion}%</span>
        </div>
        <WorkspaceProgressBar value={completion} className="mt-2" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <WorkspaceBadge value={screen.responsivePreviewReady ? "Responsive Preview Ready" : "Responsive Needs Review"} />
        <WorkspaceBadge value={`v${screen.version}`} />
      </div>
    </button>
  );
}

function ScreenInspector({ screen }: { screen: ScreenDesignerState["screens"][number] }) {
  const completion = Math.round((screen.checklistComplete / Math.max(1, screen.checklistTotal)) * 100);
  return (
    <DensityInspector title={screen.displayName}>
      <AssetPreview preview={{ ...screen.visualPreview, size: "large" }} allowFullscreen={false} />
      <div className="flex flex-wrap gap-2">
        <WorkspaceBadge value={screen.status} />
        <WorkspaceBadge value={screen.approvalStatus} />
        <WorkspaceBadge value={`v${screen.version}`} />
      </div>
      <p className="text-sm leading-6 text-slate-300">{screen.description}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <WorkspaceMiniStat label="Modified" value={new Date(screen.updatedAt).toLocaleDateString()} />
        <WorkspaceMiniStat label="Designer" value={screen.assignedTo} />
        <WorkspaceMiniStat label="Missing Assets" value={screen.missingAssets} />
        <WorkspaceMiniStat label="Data Gaps" value={screen.unresolvedDataRequirements} />
        <WorkspaceMiniStat label="Vite Parity" value={screen.parityStatus.vite} />
        <WorkspaceMiniStat label="Roblox Parity" value={screen.parityStatus.roblox} />
      </div>
      <WorkspaceProgressBar value={completion} />
      <Link href={`/screen-designer/${screen.screenId}`} className="inline-flex h-9 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20">
        Open Screen Specification
      </Link>
      <Link href={`/asset-library?picker=screen&screen=${encodeURIComponent(screen.screenId)}`} className="inline-flex h-9 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20">
        Replace Asset from Library
      </Link>
    </DensityInspector>
  );
}

export function ScreenDesignerWorkspace({ state }: { state: ScreenDesignerState }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("All");
  const [approval, setApproval] = useState<(typeof approvalOptions)[number]>("All");
  const [target, setTarget] = useState<(typeof targets)[number]>("All");
  const [onlyMissingAssets, setOnlyMissingAssets] = useState(false);
  const [onlyMissingData, setOnlyMissingData] = useState(false);
  const [densitySettings, setDensitySettings] = useWorkspaceDensitySettings("project-genesis-density-screen-designer");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.screens.filter((screen) => {
      const targetMatches = target === "All" || screen.implementationTargets.some((item) => item.target === target);
      return (!needle || [screen.displayName, screen.screenId, screen.description, screen.assignedTo].join(" ").toLowerCase().includes(needle))
        && (status === "All" || screen.status === status)
        && (approval === "All" || screen.approvalStatus === approval)
        && targetMatches
        && (!onlyMissingAssets || screen.missingAssets > 0)
        && (!onlyMissingData || screen.unresolvedDataRequirements > 0);
    });
  }, [approval, onlyMissingAssets, onlyMissingData, query, state.screens, status, target]);
  const selected = filtered[0] ?? state.screens[0];
  const [selectedId, setSelectedId] = useState(selected?.screenId ?? "");
  const selectedScreen = filtered.find((screen) => screen.screenId === selectedId) ?? selected;

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Creative / UX Specification"
        title="Screen Designer"
        description="Studio-only workspace for designing, reviewing, approving, and handing off major game screens using canonical data, asset mappings, state matrices, and implementation parity tracking."
        stats={[
          { label: "Screens", value: state.stats.total },
          { label: "In Design", value: state.stats.inDesign },
          { label: "Approved", value: state.stats.approved },
          { label: "Implemented", value: state.stats.implemented }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <WorkspacePanel title="Screen Readiness" icon={MonitorCog}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <WorkspaceStatTile label="Not Started" value={state.stats.notStarted} />
            <WorkspaceStatTile label="Ready Review" value={state.stats.readyForReview} />
            <WorkspaceStatTile label="Missing Assets" value={state.stats.blockedByMissingAssets} />
            <WorkspaceStatTile label="Missing Data" value={state.stats.blockedByMissingData} />
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Safety Rules" icon={ShieldAlert}>
          <div className="space-y-2 text-sm leading-6 text-slate-300">
            <p>Screen designs are Studio-only drafts until a separate promotion process exists.</p>
            <p>No player save state, private source paths, or unfinished designs are included in public runtime exports.</p>
          </div>
        </WorkspacePanel>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
        <div className="grid gap-3 xl:grid-cols-[1fr_repeat(3,13rem)]">
          <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search screens, canonical IDs, designers, notes" />
          <SelectFilter label="Status" value={status} options={statusOptions} onChange={setStatus} />
          <SelectFilter label="Approval" value={approval} options={approvalOptions} onChange={setApproval} />
          <SelectFilter label="Target" value={target} options={targets} onChange={setTarget} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-200">
            <input type="checkbox" checked={onlyMissingAssets} onChange={(event) => setOnlyMissingAssets(event.target.checked)} />
            Missing assets
          </label>
          <label className="inline-flex items-center gap-2 rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-200">
            <input type="checkbox" checked={onlyMissingData} onChange={(event) => setOnlyMissingData(event.target.checked)} />
            Missing data
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
        totalCount={state.screens.length}
        placeholder="Search screens, canonical IDs, designers, notes"
        filterOptions={[{ value: "all", label: "All" }, ...statusOptions.filter((item) => item !== "All").map((item) => ({ value: item, label: item }))]}
        groupOptions={[{ value: "none", label: "None" }, { value: "status", label: "Status" }, { value: "screen", label: "Screen" }, { value: "published", label: "Published" }, { value: "missing", label: "Missing" }]}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className={collectionGridClass(densitySettings)}>
          {filtered.map((screen) => (
            <ScreenCard key={screen.screenId} screen={screen} settings={densitySettings} selected={selectedScreen?.screenId === screen.screenId} onSelect={() => setSelectedId(screen.screenId)} />
          ))}
        </div>
        {selectedScreen ? <ScreenInspector screen={selectedScreen} /> : null}
      </section>
    </main>
  );
}
