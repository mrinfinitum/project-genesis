"use client";

import Link from "next/link";
import { useState } from "react";
import { Archive, CheckCircle2, FileImage, GitBranch, History, ImageIcon, Layers3, PackageCheck, ShieldCheck, Timer, TriangleAlert, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile } from "@/components/ui/workspace";
import type { AssetProductionState, ProductionAsset } from "@/lib/assets/asset-production";

export type AssetProductionView = "dashboard" | "source" | "generated" | "published" | "missing" | "processing" | "import-history";

const viewMeta: Record<AssetProductionView, { eyebrow: string; title: string; description: string }> = {
  dashboard: {
    eyebrow: "Game Assets",
    title: "Asset Dashboard",
    description: "Production control center for source artwork, derivatives, review state, engine mappings, and publishing readiness."
  },
  source: {
    eyebrow: "Master Files",
    title: "Source Art",
    description: "Private source masters, current versions, source formats, and version readiness."
  },
  generated: {
    eyebrow: "Derivatives",
    title: "Generated Assets",
    description: "Game-ready derivatives, previews, generated outputs, and production variants."
  },
  published: {
    eyebrow: "Runtime Artwork",
    title: "Published Assets",
    description: "Approved assets with engine mappings ready for public runtime consumption."
  },
  missing: {
    eyebrow: "Production Gaps",
    title: "Missing Assets",
    description: "Canonical content that still needs required art derivatives before publishing."
  },
  processing: {
    eyebrow: "Pipeline Queue",
    title: "Processing Queue",
    description: "Queued derivative work for source art that has missing outputs."
  },
  "import-history": {
    eyebrow: "Intake Log",
    title: "Import History",
    description: "Prior game art imports, created assets, matched assets, warnings, and source projects."
  }
};

const links: Array<{ href: string; label: string; view: AssetProductionView }> = [
  { href: "/assets", label: "Dashboard", view: "dashboard" },
  { href: "/assets/source", label: "Source Art", view: "source" },
  { href: "/assets/generated", label: "Generated", view: "generated" },
  { href: "/assets/published", label: "Published", view: "published" },
  { href: "/assets/missing", label: "Missing", view: "missing" },
  { href: "/assets/processing", label: "Queue", view: "processing" },
  { href: "/assets/import-history", label: "Import History", view: "import-history" }
];

function AssetNav({ active }: { active: AssetProductionView }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-2">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-md px-3 py-2 text-sm font-bold transition ${active === item.view ? "bg-cyan-300/20 text-white" : "text-slate-400 hover:bg-cyan-300/10 hover:text-slate-100"}`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function platformCount(asset: ProductionAsset) {
  return Object.keys(asset.platformMappings ?? {}).length;
}

async function postProductionAction(body: Record<string, unknown>) {
  const response = await fetch("/api/assets/production/action", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Production action failed.");
  window.location.reload();
}

function ActionButton({ children, body }: { children: React.ReactNode; body: Record<string, unknown> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await postProductionAction(body);
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
    </Button>
  );
}

function PresetEditor() {
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        const form = new FormData(event.currentTarget);
        try {
          await postProductionAction({
            action: "preset.upsert",
            payload: {
              name: String(form.get("name") ?? ""),
              category: String(form.get("category") ?? ""),
              derivativeType: String(form.get("derivativeType") ?? ""),
              width: String(form.get("width") ?? ""),
              height: String(form.get("height") ?? ""),
              outputFormat: String(form.get("outputFormat") ?? "PNG"),
              cropMode: String(form.get("cropMode") ?? "contain"),
              focalPoint: String(form.get("focalPoint") ?? "center"),
              profileGroup: String(form.get("profileGroup") ?? ""),
              outputRole: String(form.get("outputRole") ?? ""),
              sourcePolicy: String(form.get("sourcePolicy") ?? "master_only"),
              scale: String(form.get("scale") ?? ""),
              safeArea: String(form.get("safeArea") ?? ""),
              padding: String(form.get("padding") ?? ""),
              alignment: String(form.get("alignment") ?? ""),
              notes: String(form.get("notes") ?? "")
            }
          });
        } finally {
          setBusy(false);
        }
      }}
      className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"
    >
      <p className="font-black text-white">Create / Edit Preset</p>
      <div className="mt-3 grid gap-2">
        <input name="name" placeholder="Preset name" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="category" placeholder="Category" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="derivativeType" placeholder="icon/card/hero" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="width" placeholder="Width" type="number" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="height" placeholder="Height" type="number" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="outputFormat" placeholder="PNG/WebP/JPG" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="cropMode" placeholder="contain/cover/crop" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
        </div>
        <input name="focalPoint" placeholder="center/top-left/manual" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="profileGroup" placeholder="profile group: ui_icons" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="outputRole" placeholder="output role: hero_art" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="sourcePolicy" placeholder="master_only" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="scale" placeholder="1x / 2x / 4k" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="safeArea" placeholder="safe area: center 90%" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
          <input name="padding" placeholder="padding" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
        </div>
        <input name="alignment" placeholder="alignment: center" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
        <textarea name="notes" placeholder="Preset notes" className="min-h-16 rounded-md border border-cyan-300/15 bg-slate-950/60 p-3 text-sm text-white outline-none" />
      </div>
      <Button type="submit" disabled={busy} className="mt-3">{busy ? "Saving..." : "Save Preset"}</Button>
    </form>
  );
}

function AssetCard({ asset }: { asset: ProductionAsset }) {
  const preview = asset.derivatives[0]?.publicUrl;
  return (
    <Link href={`/assets/${encodeURIComponent(asset.id)}`} className="block rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow transition hover:border-cyan-300/40 hover:bg-[#0a1728]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-16 w-20 shrink-0 place-items-center overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/55">
            {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-cyan-200" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-white">{asset.name}</p>
            <p className="mt-1 truncate text-sm text-cyan-200">{asset.artKey || asset.iconKey || asset.id}</p>
          </div>
        </div>
        <WorkspaceBadge value={asset.productionStatus} />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>Completion</span>
          <span>{asset.completionPercent}%</span>
        </div>
        <WorkspaceProgressBar value={asset.completionPercent} className="mt-2" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <WorkspaceMiniStat label="Source" value={asset.sourceFiles.length} />
        <WorkspaceMiniStat label="Deriv." value={asset.derivatives.length} />
        <WorkspaceMiniStat label="Engines" value={platformCount(asset)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <WorkspaceBadge value={`master ${asset.masterSourceStatus}`} />
        <WorkspaceBadge value={`${asset.derivativeCompleteness.current}/${asset.derivativeCompleteness.required} current`} />
        {asset.qualityIssues.length ? <WorkspaceBadge value={`${asset.qualityIssues.length} quality`} /> : null}
      </div>
      {asset.missingRequirements.length ? (
        <p className="mt-3 text-sm leading-6 text-amber-100">Missing {asset.missingRequirements.join(", ")}</p>
      ) : null}
    </Link>
  );
}

function RobloxManifestReport({ state }: { state: AssetProductionState }) {
  const report = state.robloxManifestReports[0];
  const webReport = state.webPublishReports[0];
  if (!report) {
    return (
      <WorkspacePanel title="Roblox Art Manifest" icon={GitBranch}>
        <p className="text-sm leading-6 text-slate-400">No Roblox art manifest has been imported yet.</p>
      </WorkspacePanel>
    );
  }

  return (
    <WorkspacePanel title="Roblox Art Manifest" icon={GitBranch}>
      <div className="grid gap-3 sm:grid-cols-3">
        <WorkspaceMiniStat label="Imported" value={report.importedAssets} />
        <WorkspaceMiniStat label="Matched" value={report.matchedAssets} />
        <WorkspaceMiniStat label="New" value={report.newAssets} />
        <WorkspaceMiniStat label="Sources" value={report.sourceFilesCreated} />
        <WorkspaceMiniStat label="Placeholders" value={report.placeholderAssets.length} />
        <WorkspaceMiniStat label="Conflicts" value={report.conflicts.length} />
      </div>
      <p className="mt-3 break-all text-xs leading-5 text-slate-500">{report.manifestPath || report.sourceRoot}</p>
      {report.placeholderAssets.length ? (
        <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-400/10 p-3">
          <p className="text-sm font-black text-amber-100">Placeholder cleanup required</p>
          <p className="mt-1 text-sm text-slate-300">{report.placeholderAssets.length} references still use rbxassetid://0.</p>
        </div>
      ) : null}
      {report.conflicts.length ? (
        <div className="mt-3 rounded-md border border-rose-300/20 bg-rose-400/10 p-3">
          <p className="text-sm font-black text-rose-100">Mapping review required</p>
          <p className="mt-1 text-sm text-slate-300">{report.conflicts.length} existing Roblox mappings were preserved because the incoming IDs differed.</p>
        </div>
      ) : null}
      {webReport ? (
        <div className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-400/10 p-3">
          <p className="text-sm font-black text-emerald-100">Web publish readiness</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <WorkspaceMiniStat label="Web Maps" value={webReport.webMappingsCreated} />
            <WorkspaceMiniStat label="Dash Ready" value={`${webReport.dashboardAssetsWebReady}/${webReport.dashboardAssetsTotal}`} />
            <WorkspaceMiniStat label="Missing" value={webReport.missingWebDerivatives.length} />
          </div>
        </div>
      ) : null}
    </WorkspacePanel>
  );
}

function Dashboard({ state }: { state: AssetProductionState }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_26rem]">
      <section className="space-y-5">
        <WorkspacePanel title="Production Health" icon={PackageCheck}>
          <div className="grid gap-3 md:grid-cols-3">
            <WorkspaceStatTile label="Assets" value={state.dashboard.totalAssets} />
            <WorkspaceStatTile label="Source Files" value={state.dashboard.sourceFilesUploaded} />
            <WorkspaceStatTile label="Derivatives" value={state.dashboard.derivativesComplete} />
            <WorkspaceStatTile label="Awaiting Review" value={state.dashboard.awaitingReview} />
            <WorkspaceStatTile label="Approved" value={state.dashboard.approved} />
            <WorkspaceStatTile label="Published" value={state.dashboard.published} />
            <WorkspaceStatTile label="Missing Requirements" value={state.dashboard.missingAssets} />
            <WorkspaceStatTile label="Queue Failures" value={state.dashboard.failedProcessingJobs} />
            <WorkspaceStatTile label="Mapping Gaps" value={state.dashboard.engineMappingsIncomplete} />
            <WorkspaceStatTile label="Master Current" value={state.dashboard.masterSourcesCurrent} />
            <WorkspaceStatTile label="Missing Masters" value={state.dashboard.missingMasterSources} />
            <WorkspaceStatTile label="Quality Issues" value={state.dashboard.qualityIssues} />
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="PSD-Centric Pipeline v3" icon={ShieldCheck}>
          <div className="grid gap-3 md:grid-cols-4">
            <WorkspaceMiniStat label="Master Formats" value="PSD / PSB / AI / SVG / TIFF" />
            <WorkspaceMiniStat label="Derivative Profiles" value={state.derivativeProfiles.length} />
            <WorkspaceMiniStat label="Stale Outputs" value={state.dashboard.staleDerivatives} />
            <WorkspaceMiniStat label="Missing 4K" value={state.assetQualityReport.needs4k} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {state.derivativeProfiles.map((profile) => (
              <div key={profile.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{profile.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{profile.description}</p>
                  </div>
                  <WorkspaceBadge value={`${profile.presetIds.length} outputs`} />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{profile.engineTargets.join(" / ")}</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Asset Quality Report" icon={TriangleAlert}>
          <div className="grid gap-3 md:grid-cols-3">
            <WorkspaceMiniStat label="Missing Master" value={state.assetQualityReport.missingMaster} />
            <WorkspaceMiniStat label="Manual Raster Sources" value={state.assetQualityReport.manualPngSources} />
            <WorkspaceMiniStat label="Needs 2x" value={state.assetQualityReport.needs2x} />
            <WorkspaceMiniStat label="Needs 4K" value={state.assetQualityReport.needs4k} />
            <WorkspaceMiniStat label="Upscaled Risk" value={state.assetQualityReport.upscaled} />
            <WorkspaceMiniStat label="Stale" value={state.assetQualityReport.staleDerivatives} />
          </div>
          <div className="mt-4 space-y-2">
            {state.assetQualityReport.issues.slice(0, 8).map((issue) => (
              <div key={issue.id} className="rounded-md border border-amber-300/15 bg-amber-400/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-white">{issue.title}</p>
                  <WorkspaceBadge value={issue.severity} />
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-300">{issue.detail}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">{issue.recommendedAction}</p>
              </div>
            ))}
            {!state.assetQualityReport.issues.length ? <p className="rounded-md border border-emerald-300/15 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-100">No asset quality issues detected.</p> : null}
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Requirement Audit" icon={CheckCircle2}>
          <div className="grid gap-3 lg:grid-cols-2">
            {state.audit.map((row) => (
              <div key={row.category} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black capitalize text-white">{row.category.replaceAll("_", " ")}</h3>
                  <WorkspaceBadge value={row.missingAssetSets ? "needs assets" : "ready"} />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <WorkspaceMiniStat label="Records" value={row.recordsRequiringAssets} />
                  <WorkspaceMiniStat label="Complete" value={row.completeAssetSets} />
                  <WorkspaceMiniStat label="Partial" value={row.partialAssetSets} />
                  <WorkspaceMiniStat label="Missing" value={row.missingAssetSets} />
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </section>

      <aside className="space-y-5">
        <WorkspacePanel title="Derivative Presets" icon={Layers3}>
          <div className="space-y-2">
            {state.derivativePresets.slice(0, 10).map((preset) => (
              <div key={preset.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black text-white">{preset.name}</p>
                  <WorkspaceBadge value={preset.format} />
                </div>
                <p className="mt-1 text-sm text-slate-400">{preset.width} x {preset.height} / {preset.derivativeType}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{preset.profileGroup ?? "legacy"} / {preset.outputRole ?? preset.category}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ActionButton body={{ action: "preset.duplicate", presetId: preset.id }}>Duplicate</ActionButton>
                  <ActionButton body={{ action: "preset.archive", presetId: preset.id }}>Archive</ActionButton>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <PresetEditor />
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Recent Imports" icon={History}>
          <div className="space-y-2">
            {state.importHistory.slice(0, 5).map((entry) => (
              <div key={entry.importId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <p className="font-black text-white">{entry.sourceProject}</p>
                <p className="mt-1 text-sm text-slate-400">Created {entry.createdAssets} / Updated {entry.updatedAssets}</p>
              </div>
            ))}
            {!state.importHistory.length ? <p className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-300">No imports recorded yet.</p> : null}
          </div>
        </WorkspacePanel>

        <RobloxManifestReport state={state} />
      </aside>
    </div>
  );
}

function AssetGrid({ assets, empty }: { assets: ProductionAsset[]; empty: string }) {
  return assets.length ? (
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
    </div>
  ) : (
    <WorkspacePanel>
      <p className="text-sm font-semibold text-slate-300">{empty}</p>
    </WorkspacePanel>
  );
}

function SourceFiles({ state }: { state: AssetProductionState }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {state.sourceFiles.map((source) => (
        <WorkspacePanel key={source.id} title={source.filename} icon={FileImage}>
          <div className="grid gap-3 sm:grid-cols-3">
            <WorkspaceMiniStat label="Version" value={source.versionLabel} />
            <WorkspaceMiniStat label="Format" value={source.masterFormat ?? (source.extension || "source")} />
            <WorkspaceMiniStat label="Current" value={source.isCurrent ? "Yes" : "No"} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <WorkspaceBadge value={source.sourceRole ?? "source"} />
            <WorkspaceBadge value={source.previewStatus ?? "preview pending"} />
          </div>
          <p className="mt-3 break-all text-sm leading-6 text-slate-400">{source.storagePath || "Private Studio storage pending."}</p>
        </WorkspacePanel>
      ))}
      {!state.sourceFiles.length ? <WorkspacePanel><p className="text-sm font-semibold text-slate-300">No source masters uploaded yet.</p></WorkspacePanel> : null}
    </div>
  );
}

function MissingAssets({ state }: { state: AssetProductionState }) {
  return (
    <div className="space-y-3">
      {state.missingRequirements.slice(0, 120).map((item) => {
        const linkedAsset = state.assets.find((asset) => asset.artKey === item.artKey || asset.iconKey === item.iconKey || asset.id === item.artKey);
        return (
          <div key={item.id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
            <div className="grid gap-3 md:grid-cols-[1fr_9rem_9rem_7rem] md:items-center">
              <div className="min-w-0">
                <p className="truncate text-lg font-black text-white">{item.objectName}</p>
                <p className="mt-1 text-sm text-slate-400">{item.objectType.replaceAll("_", " ")} / {item.requiredDerivative} / {item.artKey}</p>
              </div>
              <WorkspaceBadge value={item.currentStatus} />
              <WorkspaceBadge value={item.priority} />
              <p className="text-sm font-black text-cyan-100">{item.completionPercent}%</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {linkedAsset ? <Link href={`/assets/${encodeURIComponent(linkedAsset.id)}`} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Open Asset</Link> : null}
              <Link href={linkedAsset ? `/assets/${encodeURIComponent(linkedAsset.id)}?tab=source_files` : "/game-art-import"} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Upload Source</Link>
              <ActionButton body={{ action: "missing.mark_not_required", missingRequirementId: item.id }}>Mark Not Required</ActionButton>
            </div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                await postProductionAction({
                  action: "missing.update",
                  missingRequirementId: item.id,
                  payload: {
                    priority: String(form.get("priority") ?? item.priority),
                    assignedArtist: String(form.get("assignedArtist") ?? ""),
                    dueDate: String(form.get("dueDate") ?? "")
                  }
                });
              }}
              className="mt-3 grid gap-2 md:grid-cols-[10rem_1fr_10rem_8rem]"
            >
              <select name="priority" defaultValue={item.priority} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <input name="assignedArtist" placeholder="Assigned artist" defaultValue={item.assignedArtist} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
              <input name="dueDate" type="date" defaultValue={item.dueDate} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
              <Button type="submit">Save</Button>
            </form>
          </div>
        );
      })}
      {!state.missingRequirements.length ? <WorkspacePanel><p className="text-sm font-semibold text-emerald-100">No required asset gaps detected.</p></WorkspacePanel> : null}
    </div>
  );
}

function ProcessingQueue({ state }: { state: AssetProductionState }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <ActionButton body={{ action: "queue.clear_completed" }}>Clear Completed</ActionButton>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {state.processingJobs.map((job) => (
          <WorkspacePanel key={job.id} title={job.id} icon={Timer}>
            <div className="grid gap-3 sm:grid-cols-3">
              <WorkspaceMiniStat label="Status" value={job.status} />
              <WorkspaceMiniStat label="Queue" value={job.queueLabel ?? job.status} />
              <WorkspaceMiniStat label="Preset" value={job.presetId} />
              <WorkspaceMiniStat label="Retries" value={job.retryCount} />
            </div>
            <WorkspaceProgressBar value={job.progress} className="mt-4" />
            {job.requestedOutputs?.length ? <p className="mt-3 text-sm leading-6 text-cyan-100">{job.requestedOutputs.join(", ")}</p> : null}
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Source policy: {job.sourcePolicy ?? "master_only"}</p>
            {job.errorMessage ? <p className="mt-3 text-sm leading-6 text-rose-100">{job.errorMessage}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton body={{ action: "queue.retry", payload: { jobId: job.id } }}>Retry</ActionButton>
              <ActionButton body={{ action: "queue.cancel", payload: { jobId: job.id } }}>Cancel</ActionButton>
              <ActionButton body={{ action: "queue.reprocess", payload: { jobId: job.id } }}>Reprocess</ActionButton>
              <Link href={`/assets/${encodeURIComponent(job.assetId)}`} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Open Asset</Link>
            </div>
          </WorkspacePanel>
        ))}
        {!state.processingJobs.length ? <WorkspacePanel><p className="text-sm font-semibold text-slate-300">No derivative jobs are queued.</p></WorkspacePanel> : null}
      </div>
    </div>
  );
}

function ImportHistory({ state }: { state: AssetProductionState }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        {state.importHistory.map((entry) => (
          <WorkspacePanel key={entry.importId} title={entry.sourceProject} icon={UploadCloud}>
            <div className="grid gap-3 sm:grid-cols-4">
              <WorkspaceMiniStat label="Files" value={entry.importedFiles} />
              <WorkspaceMiniStat label="Matched" value={entry.matchedAssets} />
              <WorkspaceMiniStat label="Created" value={entry.createdAssets} />
              <WorkspaceMiniStat label="Warnings" value={entry.warnings} />
            </div>
            <p className="mt-3 text-sm text-slate-400">{entry.sourceType} / {new Date(entry.timestamp).toLocaleString()}</p>
          </WorkspacePanel>
        ))}
        {!state.importHistory.length ? <WorkspacePanel><p className="text-sm font-semibold text-slate-300">No import history yet.</p></WorkspacePanel> : null}
      </div>

      <WorkspacePanel title="Roblox Manifest Reports" icon={GitBranch}>
        <div className="grid gap-3 lg:grid-cols-2">
          {state.robloxManifestReports.map((report) => (
            <div key={report.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{report.sourceProject}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(report.importedAt).toLocaleString()}</p>
                </div>
                <WorkspaceBadge value={report.conflicts.length ? "review" : "imported"} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <WorkspaceMiniStat label="Imported" value={report.importedAssets} />
                <WorkspaceMiniStat label="Matched" value={report.matchedAssets} />
                <WorkspaceMiniStat label="New" value={report.newAssets} />
                <WorkspaceMiniStat label="Placeholders" value={report.placeholderAssets.length} />
                <WorkspaceMiniStat label="Unused Studio" value={report.unusedStudioAssets.length} />
                <WorkspaceMiniStat label="Unused Local" value={report.unusedLocalFiles.length} />
              </div>
            </div>
          ))}
          {!state.robloxManifestReports.length ? <p className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-300">No Roblox manifest reports yet.</p> : null}
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Dashboard Web Readiness" icon={PackageCheck}>
        {state.webPublishReports[0] ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <WorkspaceStatTile label="Web Mappings" value={state.webPublishReports[0].webMappingsCreated} />
              <WorkspaceStatTile label="Dashboard Ready" value={`${state.webPublishReports[0].dashboardAssetsWebReady}/${state.webPublishReports[0].dashboardAssetsTotal}`} />
              <WorkspaceStatTile label="Missing Web" value={state.webPublishReports[0].missingWebDerivatives.length} />
              <WorkspaceStatTile label="Placeholders" value={state.webPublishReports[0].placeholders.length} />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {state.webPublishReports[0].dashboardReadiness.slice(0, 24).map((item) => (
                <div key={item.assetId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-white">{item.artKey}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-cyan-200">{item.priorityGroup}</p>
                    </div>
                    <WorkspaceBadge value={item.webReady ? "web ready" : "missing web"} />
                  </div>
                  <p className="mt-2 break-all text-xs text-slate-500">{item.path || item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-300">No Web publish report yet.</p>
        )}
      </WorkspacePanel>
    </div>
  );
}

export function AssetProductionWorkspace({ state, view }: { state: AssetProductionState; view: AssetProductionView }) {
  const meta = viewMeta[view];
  const stats = [
    { label: "Assets", value: state.dashboard.totalAssets },
    { label: "Source Files", value: state.dashboard.sourceFilesUploaded },
    { label: "Missing", value: state.dashboard.missingAssets },
    { label: "Published", value: state.dashboard.published }
  ];

  return (
    <main className="space-y-6">
      <WorkspaceHeader eyebrow={meta.eyebrow} title={meta.title} description={meta.description} stats={stats} />
      <AssetNav active={view} />
      {view === "dashboard" ? <Dashboard state={state} /> : null}
      {view === "source" ? <SourceFiles state={state} /> : null}
      {view === "generated" ? <AssetGrid assets={state.generatedAssets} empty="No generated derivatives are available yet." /> : null}
      {view === "published" ? <AssetGrid assets={state.publishedAssets} empty="No assets have reached published status yet." /> : null}
      {view === "missing" ? <MissingAssets state={state} /> : null}
      {view === "processing" ? <ProcessingQueue state={state} /> : null}
      {view === "import-history" ? <ImportHistory state={state} /> : null}
      <WorkspacePanel title="Workflow Guardrails" icon={Archive}>
        <p className="text-sm leading-6 text-slate-300">
          Source masters stay private, public runtime exports only receive sanitized derivative metadata and engine mappings, and canonical gameplay records continue to reference artKey, iconKey, audioKey, or modelKey.
        </p>
      </WorkspacePanel>
    </main>
  );
}
