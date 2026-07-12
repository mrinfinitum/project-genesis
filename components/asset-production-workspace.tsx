import Link from "next/link";
import { Archive, CheckCircle2, FileImage, GitBranch, History, ImageIcon, Layers3, PackageCheck, Timer, UploadCloud } from "lucide-react";
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

function AssetCard({ asset }: { asset: ProductionAsset }) {
  const preview = asset.derivatives[0]?.publicUrl;
  return (
    <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
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
      {asset.missingRequirements.length ? (
        <p className="mt-3 text-sm leading-6 text-amber-100">Missing {asset.missingRequirements.join(", ")}</p>
      ) : null}
    </div>
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
              </div>
            ))}
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
            <WorkspaceMiniStat label="Format" value={source.extension || "source"} />
            <WorkspaceMiniStat label="Current" value={source.isCurrent ? "Yes" : "No"} />
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
      {state.missingRequirements.slice(0, 120).map((item) => (
        <div key={item.id} className="grid gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow md:grid-cols-[1fr_9rem_9rem_7rem] md:items-center">
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-white">{item.objectName}</p>
            <p className="mt-1 text-sm text-slate-400">{item.objectType.replaceAll("_", " ")} / {item.requiredDerivative} / {item.artKey}</p>
          </div>
          <WorkspaceBadge value={item.currentStatus} />
          <WorkspaceBadge value={item.priority} />
          <p className="text-sm font-black text-cyan-100">{item.completionPercent}%</p>
        </div>
      ))}
      {!state.missingRequirements.length ? <WorkspacePanel><p className="text-sm font-semibold text-emerald-100">No required asset gaps detected.</p></WorkspacePanel> : null}
    </div>
  );
}

function ProcessingQueue({ state }: { state: AssetProductionState }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {state.processingJobs.map((job) => (
        <WorkspacePanel key={job.id} title={job.id} icon={Timer}>
          <div className="grid gap-3 sm:grid-cols-3">
            <WorkspaceMiniStat label="Status" value={job.status} />
            <WorkspaceMiniStat label="Preset" value={job.presetId} />
            <WorkspaceMiniStat label="Retries" value={job.retryCount} />
          </div>
          <WorkspaceProgressBar value={job.progress} className="mt-4" />
        </WorkspacePanel>
      ))}
      {!state.processingJobs.length ? <WorkspacePanel><p className="text-sm font-semibold text-slate-300">No derivative jobs are queued.</p></WorkspacePanel> : null}
    </div>
  );
}

function ImportHistory({ state }: { state: AssetProductionState }) {
  return (
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
