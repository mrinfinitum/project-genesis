"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArchiveRestore,
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  FileStack,
  History,
  ImageOff,
  Images,
  Layers3,
  PackageCheck,
  PanelTop,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  WandSparkles
} from "lucide-react";
import type { AssetProductionState, ProductionAsset } from "@/lib/assets/asset-production";
import {
  buildAssetProductionCatalog,
  searchAssetProductionRecords,
  type AssetProductionRecord,
  type AssetProductionRecordSource
} from "@/lib/assets/asset-production-system";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CanonicalIndex, WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceSearchBar, WorkspaceTabs } from "@/components/ui/workspace";

type AssetProductionSection =
  | "dashboard"
  | "queue"
  | "asset_library"
  | "backgrounds"
  | "species_plates"
  | "prompts"
  | "providers"
  | "source_masters"
  | "approvals"
  | "publishing"
  | "validation"
  | "history";

const sections: AssetProductionSection[] = [
  "dashboard",
  "queue",
  "asset_library",
  "backgrounds",
  "species_plates",
  "prompts",
  "providers",
  "source_masters",
  "approvals",
  "publishing",
  "validation",
  "history"
];

const sectionLabels: Record<AssetProductionSection, string> = {
  dashboard: "Production Dashboard",
  queue: "Production Queue",
  asset_library: "Asset Library",
  backgrounds: "Background Library",
  species_plates: "Species Plates",
  prompts: "Prompt Library",
  providers: "Render Providers",
  source_masters: "Source Masters",
  approvals: "Approvals",
  publishing: "Publishing",
  validation: "Validation",
  history: "History"
};

const groupDefinitions = [
  ["Backgrounds", /background|environment/i],
  ["Creatures", /creature|fauna/i],
  ["Plants", /plant|flora|tree|moss|fung/i],
  ["HUD", /hud/i],
  ["Planets", /planet/i],
  ["Stars", /star/i],
  ["Galaxies", /galaxy|galactic/i],
  ["Species Plates", /species plate|plate/i],
  ["Cards", /card/i],
  ["Icons", /icon/i]
] as const;

function recordSource(asset: ProductionAsset): AssetProductionRecordSource {
  const preview = asset.derivatives.find((derivative) => derivative.publicUrl)?.publicUrl
    || asset.variants.find((derivative) => derivative.publicUrl)?.publicUrl
    || asset.sourceFiles.find((source) => source.previewUrl)?.previewUrl
    || null;
  const thumbnail = asset.derivatives.find((derivative) => /thumb|preview|card/i.test(`${derivative.derivativeType} ${derivative.presetId}`) && derivative.publicUrl)?.publicUrl || preview;
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    category: asset.category,
    artKey: asset.artKey,
    status: asset.status,
    productionStatus: asset.productionStatus,
    approvalStatus: asset.approvalStatus,
    previewUrl: preview,
    thumbnailUrl: thumbnail,
    sourceMasterId: asset.currentMasterSourceId,
    hasSourceMaster: asset.masterSourceStatus === "current" || asset.masterSourceStatus === "legacy_raster",
    platformMappings: asset.platformMappings,
    usageReferences: asset.usageReferences,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    checksum: asset.sourceFiles.find((source) => source.isCurrent)?.checksum,
    history: asset.historyEvents.map((event) => ({
      id: event.id,
      eventType: /publish/i.test(event.eventType) ? "published" : /approve/i.test(event.eventType) ? "approved" : /reject/i.test(event.eventType) ? "rejected" : "status_changed",
      timestamp: event.timestamp,
      actor: "studio",
      previousStatus: null,
      status: "planned",
      note: event.notes || event.title || event.eventType
    }))
  };
}

function Preview({ record, className, mode = "fill" }: { record: AssetProductionRecord; className?: string; mode?: "fit" | "fill" | "transparent" | "black" | "zoom" }) {
  const [failed, setFailed] = useState(false);
  if (!record.previewUrl || failed) {
    return (
      <div className={cn("flex aspect-video items-center justify-center border-b border-cyan-300/10 bg-slate-950/55 text-slate-600", className)}>
        <ImageOff className="h-7 w-7" aria-label="Preview unavailable" />
      </div>
    );
  }
  return <img src={record.previewUrl} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn("aspect-video w-full border-b border-cyan-300/10", mode === "fit" || mode === "transparent" || mode === "black" ? "object-contain" : "object-cover", mode === "transparent" ? "bg-slate-800" : mode === "black" ? "bg-black" : "bg-slate-950/55", mode === "zoom" && "scale-125 cursor-zoom-out", className)} />;
}

function AssetCard({ record, selected, onSelect }: { record: AssetProductionRecord; selected: boolean; onSelect: (record: AssetProductionRecord) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(record)}
      className={cn("min-w-0 overflow-hidden rounded-md border text-left transition", selected ? "border-cyan-300/70 bg-cyan-400/10" : "border-cyan-300/15 bg-slate-950/55 hover:border-cyan-300/45")}
    >
      <Preview record={record} />
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate font-bold text-white" title={record.displayName}>{record.displayName}</p>
          <WorkspaceBadge value={record.productionStatus} className="shrink-0 text-[0.58rem]" />
        </div>
        <p className="mt-1 truncate text-xs text-slate-400">{record.assetType} · {record.assetCategory}</p>
      </div>
    </button>
  );
}

function QueueTable({ records, onSelect }: { records: AssetProductionRecord[]; onSelect: (record: AssetProductionRecord) => void }) {
  return (
    <div className="overflow-x-auto rounded-md border border-cyan-300/15">
      <table className="min-w-[1100px] w-full text-left text-sm">
        <thead className="bg-slate-950/75 text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">
          <tr>{["Status", "Preview", "Asset Name", "Category", "Canonical Owner", "Render Provider", "Prompt Version", "Approval", "Runtime Targets", "Updated", "Actions"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t border-cyan-300/10 text-slate-200 hover:bg-cyan-300/[0.04]">
              <td className="px-3 py-3"><WorkspaceBadge value={record.productionStatus} className="text-[0.55rem]" /></td>
              <td className="w-20 px-3 py-2"><Preview record={record} className="w-14 rounded-sm border" /></td>
              <td className="max-w-52 px-3 py-3 font-bold text-white"><span className="block truncate" title={record.displayName}>{record.displayName}</span></td>
              <td className="px-3 py-3 text-slate-400">{record.assetType}</td>
              <td className="max-w-40 px-3 py-3"><span className="block truncate text-slate-400" title={record.canonicalOwnerId}>{record.canonicalOwnerId}</span></td>
              <td className="px-3 py-3 text-slate-400">{record.renderProvider}</td>
              <td className="px-3 py-3 text-slate-400">{record.promptVersion || "Awaiting prompt"}</td>
              <td className="px-3 py-3"><WorkspaceBadge value={record.approvalStatus} className="text-[0.55rem]" /></td>
              <td className="max-w-40 px-3 py-3"><span className="block truncate text-slate-400">{record.runtimeTargets.join(", ") || "Not mapped"}</span></td>
              <td className="px-3 py-3 text-slate-500">{record.updatedAt.slice(0, 10)}</td>
              <td className="px-3 py-3"><Button onClick={() => onSelect(record)}><SlidersHorizontal className="h-4 w-4" />Inspect</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Inspector({ record }: { record: AssetProductionRecord | null }) {
  const [previewMode, setPreviewMode] = useState<"fit" | "fill" | "transparent" | "black" | "zoom">("fill");
  if (!record) return null;
  return (
    <WorkspacePanel title="Asset Inspector" icon={SlidersHorizontal} className="h-fit xl:sticky xl:top-5">
      <div className="overflow-hidden rounded-md border border-cyan-300/15">
        <Preview record={record} mode={previewMode} className="rounded-md border-0" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Preview controls">
        {(["fit", "fill", "transparent", "black", "zoom"] as const).map((mode) => (
          <button key={mode} type="button" onClick={() => setPreviewMode(mode)} className={cn("rounded border px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em]", previewMode === mode ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-100" : "border-cyan-300/15 text-slate-400 hover:border-cyan-300/35")}>{mode}</button>
        ))}
        <span title="Version comparison becomes available whenever prior or approved derivatives are linked to this record." className="rounded border border-cyan-300/15 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-500">Compare versions</span>
      </div>
      <div className="mt-4 space-y-3">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Canonical Owner</p><p className="mt-1 break-words font-bold text-white">{record.canonicalOwnerId}</p></div>
        <div className="grid grid-cols-2 gap-3">
          <WorkspaceMiniStat label="Provider" value={record.renderProvider} />
          <WorkspaceMiniStat label="Approval" value={record.approvalStatus} />
          <WorkspaceMiniStat label="Prompt" value={record.promptVersion || "Awaiting prompt"} />
          <WorkspaceMiniStat label="Runtime" value={record.runtimeTargets.join(", ") || "Not mapped"} />
        </div>
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Source Master</p><p className="mt-1 break-all text-sm font-semibold text-slate-200">{record.sourceMasterId || "Missing"}</p></div>
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Screen Usage</p><p className="mt-1 text-sm text-slate-300">{record.usage.length ? record.usage.map((usage) => usage.name).join(", ") : "No screen usage linked"}</p></div>
        <Link href={`/assets/${record.id}`} className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20"><FileStack className="h-4 w-4" />Open asset record</Link>
      </div>
    </WorkspacePanel>
  );
}

export function AssetProductionSystemWorkspace({ state }: { state: AssetProductionState }) {
  const [section, setSection] = useState<AssetProductionSection>("dashboard");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const catalog = useMemo(() => buildAssetProductionCatalog(state.assets.map(recordSource)), [state.assets]);
  const records = useMemo(() => searchAssetProductionRecords(catalog.records, query), [catalog.records, query]);
  const selected = catalog.records.find((record) => record.id === selectedId) || null;
  const groupCounts = groupDefinitions.map(([label, pattern]) => ({ label, value: catalog.records.filter((record) => pattern.test(`${record.assetType} ${record.assetCategory} ${record.displayName}`)).length }));
  const visibleRecords = section === "backgrounds"
    ? records.filter((record) => record.assetType === "Background")
    : section === "species_plates"
      ? records.filter((record) => /Species Plate|Botanical Plate/.test(record.assetType))
      : section === "approvals"
        ? records.filter((record) => ["awaiting_review", "approved", "rejected", "revision_required"].includes(record.productionStatus))
        : section === "publishing"
          ? records.filter((record) => ["approved", "published"].includes(record.productionStatus))
          : records;

  return (
    <main className="space-y-5">
      <WorkspaceHeader
        eyebrow="Creative Production"
        title="Asset Production"
        description="The canonical production pipeline for every NOVERIS visual asset. Studio manages ownership, prompts, review, approval, publishing, and runtime manifests; renderers and Unity remain separate clients."
        stats={[
          { label: "Assets Planned", value: state.dashboard.totalAssets },
          { label: "Awaiting Review", value: state.dashboard.awaitingReview },
          { label: "Approved", value: state.dashboard.approved },
          { label: "Published", value: state.dashboard.published }
        ]}
      />

      <WorkspaceTabs tabs={sections} active={section} onChange={setSection} labels={sectionLabels} />

      <CanonicalIndex title="Production Index" description="Counts are derived from the canonical Asset Registry and existing source-master records." items={groupCounts} />

      {section === "dashboard" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <WorkspaceMiniStat label="Prompt Ready" value={catalog.records.filter((record) => record.productionStatus === "prompt_ready").length} />
              <WorkspaceMiniStat label="Rendering" value={catalog.records.filter((record) => record.productionStatus === "rendering").length} />
              <WorkspaceMiniStat label="Stale" value={catalog.records.filter((record) => record.productionStatus === "stale").length} />
              <WorkspaceMiniStat label="Rejected" value={catalog.records.filter((record) => record.productionStatus === "rejected").length} />
            </div>
            <WorkspacePanel title="Production Queue" icon={ClipboardCheck}>
              <QueueTable records={catalog.records.slice(0, 12)} onSelect={(record) => setSelectedId(record.id)} />
            </WorkspacePanel>
          </div>
          <WorkspacePanel title="Pipeline" icon={WandSparkles}>
            <ol className="space-y-3 text-sm text-slate-300">
              {["Canonical Record", "Prompt Generation", "External Renderer", "Generated Asset", "Review", "Approval", "Publishing", "Unity Runtime"].map((step, index) => <li key={step} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 text-xs font-black text-cyan-200">{index + 1}</span><span className="font-semibold">{step}</span></li>)}
            </ol>
          </WorkspacePanel>
        </div>
      ) : null}

      {section === "providers" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {catalog.renderProviders.map((provider) => (
            <WorkspacePanel key={provider.providerId} title={provider.displayName} icon={Sparkles}>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between"><span>Provider status</span><WorkspaceBadge value={provider.status} /></div>
                <p>Prompt format: <span className="font-semibold text-white">{provider.promptFormat}</span></p>
                <p>Resolutions: <span className="font-semibold text-white">{provider.supportedResolutions.join(", ") || "Provider-specific"}</span></p>
                <p>Capabilities: <span className="font-semibold text-white">{[provider.supportsReferenceImages && "references", provider.supportsBatch && "batch", provider.supportsSeed && "seed", provider.supportsNegativePrompt && "negative prompts", provider.supportsUpscaling && "upscaling"].filter(Boolean).join(", ") || "Pending"}</span></p>
              </div>
            </WorkspacePanel>
          ))}
        </div>
      ) : null}

      {section === "prompts" ? (
        <WorkspacePanel title="Prompt Library" icon={WandSparkles}>
          <p className="max-w-4xl text-sm leading-6 text-slate-300">Studio owns positive, negative, combined, versioned, and hashed prompts. Providers receive prompt requests; prompts and provider notes never cross the publishing boundary into Unity.</p>
          <QueueTable records={records.filter((record) => record.promptId || ["awaiting_prompt", "prompt_ready"].includes(record.productionStatus))} onSelect={(record) => setSelectedId(record.id)} />
        </WorkspacePanel>
      ) : null}

      {section === "source_masters" ? (
        <WorkspacePanel title="Source Masters" icon={Upload}>
          <p className="mb-4 text-sm text-slate-300">Source masters remain Studio-private. Runtime exports include approved assets only and never expose Photoshop paths or original render locations.</p>
          <QueueTable records={records.filter((record) => record.sourceMasterId)} onSelect={(record) => setSelectedId(record.id)} />
        </WorkspacePanel>
      ) : null}

      {section === "validation" ? (
        <WorkspacePanel title="Production Validation" icon={ShieldCheck}>
          <div className="mb-4 flex items-center gap-3"><WorkspaceBadge value={catalog.validation.status} /><p className="text-sm text-slate-400">Validates owner, prompts, provider, preview, source master, duplicates, staleness, approval, and runtime publication rules.</p></div>
          <div className="space-y-2">{catalog.validation.issues.length ? catalog.validation.issues.map((issue) => <div key={`${issue.code}-${issue.records.join("-")}`} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm"><WorkspaceBadge value={issue.severity} className="mr-2 text-[0.55rem]" />{issue.message}</div>) : <p className="rounded-md border border-emerald-300/20 bg-emerald-400/5 p-4 text-sm font-semibold text-emerald-100">All canonical production records pass lifecycle validation.</p>}</div>
        </WorkspacePanel>
      ) : null}

      {section === "history" ? (
        <WorkspacePanel title="Production History" icon={History}>
          <div className="space-y-2">{catalog.records.flatMap((record) => record.history.map((event) => ({ record, event }))).sort((left, right) => right.event.timestamp.localeCompare(left.event.timestamp)).slice(0, 80).map(({ record, event }) => <button type="button" key={event.id} onClick={() => setSelectedId(record.id)} className="flex w-full items-center justify-between gap-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-left hover:border-cyan-300/40"><span><span className="font-bold text-white">{record.displayName}</span><span className="ml-2 text-sm text-slate-400">{event.note}</span></span><span className="shrink-0 text-xs text-slate-500">{event.timestamp.slice(0, 10)}</span></button>)}</div>
        </WorkspacePanel>
      ) : null}

      {["queue", "asset_library", "backgrounds", "species_plates", "approvals", "publishing"].includes(section) ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search asset, owner, provider, status, category, screen, planet, creature, or prompt" />
            {section === "queue" ? <QueueTable records={visibleRecords} onSelect={(record) => setSelectedId(record.id)} /> : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visibleRecords.map((record) => <AssetCard key={record.id} record={record} selected={record.id === selectedId} onSelect={(selectedRecord) => setSelectedId(selectedRecord.id)} />)}</div>
            )}
          </div>
          <Inspector record={selected} />
        </div>
      ) : null}

      {section === "dashboard" ? <Inspector record={selected} /> : null}
    </main>
  );
}
