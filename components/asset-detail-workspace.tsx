"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, Eye, FileImage, GitBranch, History, Layers3, PackageCheck, RefreshCcw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile, WorkspaceTabs } from "@/components/ui/workspace";
import type { ProcessingJobRecord, ProductionAsset, SourceFileRecord, AssetDerivativeRecord } from "@/lib/assets/asset-production";

type DetailTab = "overview" | "source_files" | "versions" | "previews" | "derivatives" | "requirements" | "engine_mappings" | "review" | "usage" | "history";

const tabs: DetailTab[] = ["overview", "source_files", "versions", "previews", "derivatives", "requirements", "engine_mappings", "review", "usage", "history"];

function validTab(value?: string): DetailTab {
  return tabs.includes(value as DetailTab) ? value as DetailTab : "overview";
}

function field(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function payloadFrom(form: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, field(form, key)]).filter(([, value]) => value));
}

function bytes(value: number) {
  if (!value) return "Unknown";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function dateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "No date";
}

function sourcePreview(asset: ProductionAsset) {
  return asset.sourceFiles.find((source) => source.isPrimaryPreview && source.previewUrl)?.previewUrl
    || asset.sourceFiles.find((source) => source.isCurrent && source.previewUrl)?.previewUrl
    || asset.sourceFiles.find((source) => source.previewUrl)?.previewUrl
    || "";
}

function previewFor(asset: ProductionAsset) {
  return asset.derivatives.find((derivative) => derivative.publishStatus === "published" && derivative.publicUrl)?.publicUrl
    || asset.derivatives.find((derivative) => derivative.approvalStatus === "approved" && derivative.publicUrl)?.publicUrl
    || asset.derivatives.find((derivative) => derivative.publicUrl)?.publicUrl
    || sourcePreview(asset);
}

function derivativeLabel(derivative: AssetDerivativeRecord) {
  return `${derivative.derivativeType} / ${derivative.format}`;
}

function engineValue(mapping: unknown) {
  if (!mapping || typeof mapping !== "object") return "Missing";
  const value = mapping as { path?: string; assetId?: string; status?: string; key?: string };
  return value.path ?? value.assetId ?? value.key ?? value.status ?? "Mapped";
}

function engineReady(mapping: unknown) {
  return mapping ? "Ready" : "Missing";
}

function privateState(source: SourceFileRecord) {
  return source.storagePath.startsWith("studio-private://") ? "Private" : source.storagePath.startsWith("/uploads/") ? "Public upload" : "Protected";
}

function derivativesForSource(asset: ProductionAsset, sourceId: string) {
  return asset.derivatives.filter((derivative) => derivative.sourceFileId === sourceId);
}

function ActionForm({
  title,
  children,
  onSubmit,
  submitLabel = "Apply"
}: {
  title: string;
  children: React.ReactNode;
  onSubmit: (form: FormData) => void;
  submitLabel?: string;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
      }}
      className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"
    >
      <p className="font-black text-white">{title}</p>
      <div className="mt-3 grid gap-3">{children}</div>
      <Button type="submit" className="mt-3">
        <CheckCircle2 className="h-4 w-4" />
        {submitLabel}
      </Button>
    </form>
  );
}

function Input({ name, placeholder, type = "text", defaultValue = "" }: { name: string; placeholder: string; type?: string; defaultValue?: string }) {
  return <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-500" />;
}

function Textarea({ name, placeholder, defaultValue = "" }: { name: string; placeholder: string; defaultValue?: string }) {
  return <textarea name={name} defaultValue={defaultValue} placeholder={placeholder} className="min-h-20 rounded-md border border-cyan-300/15 bg-slate-950/60 p-3 text-sm text-white outline-none placeholder:text-slate-500" />;
}

function PreviewPane({ url, label }: { url: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/55">
      <div className="grid aspect-video place-items-center">
        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : (
          <div className="text-center">
            <FileImage className="mx-auto h-10 w-10 text-cyan-200" />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">No Preview</p>
          </div>
        )}
      </div>
      <p className="border-t border-cyan-300/10 px-3 py-2 text-xs font-bold text-slate-300">{label}</p>
    </div>
  );
}

export function AssetDetailWorkspace({
  asset,
  processingJobs,
  initialTab,
  returnTo,
  returnEraId
}: {
  asset: ProductionAsset;
  processingJobs: ProcessingJobRecord[];
  initialTab?: string;
  returnTo?: string;
  returnEraId?: string;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>(validTab(initialTab));
  const [message, setMessage] = useState("");
  const [compareLeft, setCompareLeft] = useState(asset.sourceFiles[0]?.id ?? "");
  const [compareRight, setCompareRight] = useState(asset.sourceFiles[1]?.id ?? asset.sourceFiles[0]?.id ?? "");
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const preview = previewFor(asset);
  const currentSource = asset.sourceFiles.find((source) => source.isCurrent) ?? asset.sourceFiles[0] ?? null;
  const primaryPreview = sourcePreview(asset);
  const backHref = returnTo || (returnEraId ? `/assets/eras/${returnEraId}` : "/assets");
  const backLabel = returnEraId ? `Back to ${returnEraId.replaceAll("-", " ")} Art Inventory` : returnTo ? "Back to Art Inventory" : "Back to Asset Dashboard";
  const engineMappings = asset.platformMappings as Record<string, unknown>;
  const sourceById = useMemo(() => Object.fromEntries(asset.sourceFiles.map((source) => [source.id, source])), [asset.sourceFiles]);
  const leftSource = sourceById[compareLeft];
  const rightSource = sourceById[compareRight];

  async function runAction(action: string, form?: FormData, extra: Record<string, unknown> = {}) {
    setMessage("");
    const response = await fetch("/api/assets/production/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        assetId: asset.id,
        sourceFileId: String(extra.sourceFileId ?? (form ? field(form, "sourceFileId") : "")),
        derivativeId: String(extra.derivativeId ?? (form ? field(form, "derivativeId") : "")),
        missingRequirementId: String(extra.missingRequirementId ?? (form ? field(form, "missingRequirementId") : "")),
        presetId: String(extra.presetId ?? (form ? field(form, "presetId") : "")),
        reviewer: form ? field(form, "reviewer") : "studio",
        notes: form ? field(form, "notes") : String(extra.notes ?? ""),
        adminOverride: form?.get("adminOverride") === "on" || Boolean(extra.adminOverride),
        payload: {
          ...extra,
          ...(form ? payloadFrom(form, ["filename", "storagePath", "previewUrl", "publicUrl", "derivativeType", "format", "width", "height", "path", "key", "assetId", "sourceFileId", "presetId", "cropMode", "focalPoint", "notes"]) : {}),
          ...(form?.get("isPrimaryPreview") === "on" ? { isPrimaryPreview: true } : {})
        }
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error ?? "Action failed.");
      return;
    }
    setMessage("Saved. Refreshing...");
    window.location.reload();
  }

  async function uploadSourceFile(form: FormData) {
    const file = form.get("file");
    if (!(file instanceof File) || !file.name) {
      setMessage("Choose a source file first.");
      return;
    }
    const upload = new FormData();
    upload.set("file", file);
    upload.set("source_table", "assets");
    upload.set("asset_id", asset.id);
    upload.set("asset_name", asset.name);
    upload.set("upload_kind", "source");
    const response = await fetch("/api/assets/upload", { method: "POST", body: upload });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error ?? "Source upload failed.");
      return;
    }
    await runAction("source.upload_version", undefined, {
      filename: file.name,
      storagePath: result.source_file_url ?? result.path,
      previewUrl: file.type.startsWith("image/") ? result.file_url ?? "" : "",
      fileSizeBytes: file.size,
      notes: field(form, "notes")
    });
  }

  async function uploadDerivativeFile(form: FormData, replace = false) {
    const file = form.get("file");
    if (!(file instanceof File) || !file.name) {
      setMessage("Choose a derivative PNG first.");
      return;
    }
    const derivativeType = field(form, "derivativeType") || "card";
    const upload = new FormData();
    upload.set("file", file);
    upload.set("source_table", "assets");
    upload.set("asset_id", asset.id);
    upload.set("asset_name", asset.name);
    upload.set("upload_kind", "export");
    const response = await fetch("/api/assets/upload", { method: "POST", body: upload });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error ?? "Derivative upload failed.");
      return;
    }
    await runAction(replace ? "derivative.replace" : "derivative.upload", form, {
      derivativeId: replace ? field(form, "derivativeId") : "",
      derivativeType,
      format: "PNG",
      publicUrl: result.file_url,
      storagePath: result.path,
      sourceFileId: currentSource?.id ?? "",
      generationMethod: "manual_upload"
    });
  }

  return (
    <main className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold capitalize text-cyan-200 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <WorkspaceHeader
        eyebrow="Asset Detail"
        title={asset.name}
        description="Authoritative source-art workspace for source versions, previews, derivatives, requirements, engine mappings, review, usage, and production history."
        stats={[
          { label: "Completion", value: `${asset.completionPercent}%` },
          { label: "Source Versions", value: asset.sourceFiles.length },
          { label: "Derivatives", value: asset.derivatives.length },
          { label: "Mappings", value: Object.keys(asset.platformMappings).length }
        ]}
      />

      <WorkspaceTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      {message ? <div className="rounded-md border border-cyan-300/15 bg-cyan-300/10 p-3 text-sm font-bold text-cyan-100">{message}</div> : null}

      {activeTab === "overview" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_26rem]">
          <WorkspacePanel title="Overview" icon={PackageCheck}>
            <div className="grid gap-5 lg:grid-cols-[24rem_1fr]">
              <PreviewPane url={preview} label="Approved/current preview" />
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <WorkspaceBadge value={asset.productionStatus} />
                  <WorkspaceBadge value={asset.approvalStatus} />
                  <WorkspaceBadge value={asset.status} />
                  <WorkspaceBadge value={asset.publishBlockers.length ? "blocked" : "publishable"} />
                </div>
                <WorkspaceProgressBar value={asset.completionPercent} />
                <div className="grid gap-3 md:grid-cols-3">
                  <WorkspaceMiniStat label="Canonical ID" value={asset.id} />
                  <WorkspaceMiniStat label="artKey" value={asset.artKey || "None"} />
                  <WorkspaceMiniStat label="iconKey" value={asset.iconKey || "None"} />
                  <WorkspaceMiniStat label="audioKey" value={asset.audioKey || "None"} />
                  <WorkspaceMiniStat label="modelKey" value={asset.modelKey || "None"} />
                  <WorkspaceMiniStat label="Category" value={asset.category} />
                  <WorkspaceMiniStat label="Source Status" value={currentSource ? currentSource.previewStatus ?? "source uploaded" : "missing"} />
                  <WorkspaceMiniStat label="Derivative Completion" value={`${asset.derivatives.length} derivative(s)`} />
                  <WorkspaceMiniStat label="Publication" value={asset.publishedAt ? "Published" : asset.productionStatus} />
                  <WorkspaceMiniStat label="Web" value={engineReady(engineMappings.web)} />
                  <WorkspaceMiniStat label="Roblox" value={engineReady(engineMappings.roblox)} />
                  <WorkspaceMiniStat label="Profile" value={asset.requirementProfileId} />
                </div>
                <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
                  <p><span className="font-bold text-cyan-100">Linked content:</span> {asset.usageReferences.length ? asset.usageReferences.map((usage) => `${usage.type}:${usage.name}`).join(", ") : "No linked records yet"}</p>
                  <p><span className="font-bold text-cyan-100">Current source:</span> {currentSource ? `${currentSource.versionLabel} / ${currentSource.filename}` : "Missing"}</p>
                  <p><span className="font-bold text-cyan-100">Current blockers:</span> {asset.publishBlockers.length ? asset.publishBlockers.join(", ") : "None"}</p>
                </div>
              </div>
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Quick Actions" icon={UploadCloud}>
            <div className="space-y-3">
              <Button type="button" onClick={() => setActiveTab("source_files")}>Upload New Source Version</Button>
              <Button type="button" onClick={() => setActiveTab("previews")}>Upload Preview</Button>
              <Button type="button" onClick={() => runAction("derivative.generate", undefined, { presetId: "manual_derivative" })}>Generate Derivatives</Button>
              <Button type="button" onClick={() => runAction("review.submit_review")}>Submit for Review</Button>
              <Button type="button" onClick={() => runAction("review.approve")}>Approve</Button>
              <Button type="button" onClick={() => runAction("review.publish")}>Publish</Button>
              {asset.usageReferences[0] ? <Link href={`/${asset.usageReferences[0].type}`} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Open Linked Content</Link> : null}
            </div>
          </WorkspacePanel>
        </div>
      ) : null}

      {activeTab === "source_files" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <div className="space-y-3">
            {asset.sourceFiles.map((source) => (
              <WorkspacePanel key={source.id} title={source.filename} icon={FileImage}>
                <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-6">
                  <WorkspaceMiniStat label="Version" value={source.versionLabel} />
                  <WorkspaceMiniStat label="Type" value={source.extension || "source"} />
                  <WorkspaceMiniStat label="Size" value={bytes(source.fileSizeBytes)} />
                  <WorkspaceMiniStat label="Dimensions" value={source.width && source.height ? `${source.width}x${source.height}` : "Unknown"} />
                  <WorkspaceMiniStat label="Checksum" value={source.checksum || "None"} />
                  <WorkspaceMiniStat label="Uploaded" value={dateLabel(source.uploadedAt)} />
                  <WorkspaceMiniStat label="Current" value={source.isCurrent ? "Yes" : "No"} />
                  <WorkspaceMiniStat label="Preview" value={source.previewStatus ?? "missing"} />
                  <WorkspaceMiniStat label="Access" value={privateState(source)} />
                  <WorkspaceMiniStat label="Derivatives" value={derivativesForSource(asset, source.id).length} />
                </div>
                {source.notes ? <p className="mt-3 text-sm leading-6 text-slate-300">{source.notes}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => runAction("source.set_current", undefined, { sourceFileId: source.id })}>Set Current</Button>
                  <Button type="button" onClick={() => runAction("source.restore", undefined, { sourceFileId: source.id })}>Restore</Button>
                  <Button type="button" onClick={() => runAction("source.archive", undefined, { sourceFileId: source.id })}>Archive</Button>
                  <Button type="button" onClick={() => {
                    const notes = window.prompt("Source notes", source.notes);
                    if (notes !== null) runAction("source.notes", undefined, { sourceFileId: source.id, notes });
                  }}>Add Notes</Button>
                  <Link href={`/api/assets/production/source/${source.id}`} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
                    <Download className="h-4 w-4" />
                    Download
                  </Link>
                </div>
              </WorkspacePanel>
            ))}
            {!asset.sourceFiles.length ? <WorkspacePanel><p className="text-sm font-semibold text-slate-300">No source versions yet.</p></WorkspacePanel> : null}
          </div>
          <ActionForm title="Upload Replacement as New Version" onSubmit={uploadSourceFile} submitLabel="Upload Source">
            <input name="file" type="file" accept=".psd,.psb,.ai,.svg,.png,.jpg,.jpeg,.webp,.tif,.tiff,.pdf,.blend,.mp3,.wav,.ogg,.mp4,.mov" className="rounded-md border border-cyan-300/15 bg-slate-950/60 p-2 text-sm text-white" />
            <Textarea name="notes" placeholder="Version notes" />
            <p className="text-sm leading-6 text-slate-400">New uploads create a new version. The existing source copy is preserved.</p>
          </ActionForm>
          <ActionForm title="Record External Source Version" onSubmit={(form) => runAction("source.upload_version", form)} submitLabel="Add Version">
            <Input name="filename" placeholder="earth-master.psd" />
            <Input name="storagePath" placeholder="studio-private://assets/..." />
            <Input name="previewUrl" placeholder="Optional preview URL" />
            <Textarea name="notes" placeholder="Version notes" />
          </ActionForm>
        </div>
      ) : null}

      {activeTab === "versions" ? (
        <div className="space-y-5">
          <WorkspacePanel title="Compare Source Versions" icon={Eye}>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_12rem]">
              <select value={compareLeft} onChange={(event) => setCompareLeft(event.target.value)} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none">
                {asset.sourceFiles.map((source) => <option key={source.id} value={source.id}>{source.versionLabel} / {source.filename}</option>)}
              </select>
              <select value={compareRight} onChange={(event) => setCompareRight(event.target.value)} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none">
                {asset.sourceFiles.map((source) => <option key={source.id} value={source.id}>{source.versionLabel} / {source.filename}</option>)}
              </select>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Overlay {overlayOpacity}%
                <input type="range" min="0" max="100" value={overlayOpacity} onChange={(event) => setOverlayOpacity(Number(event.target.value))} className="mt-2 w-full" />
              </label>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <PreviewPane url={leftSource?.previewUrl ?? ""} label={leftSource ? `${leftSource.versionLabel} / ${bytes(leftSource.fileSizeBytes)} / ${leftSource.checksum || "no checksum"}` : "Left version"} />
              <div className="relative">
                <PreviewPane url={rightSource?.previewUrl ?? ""} label={rightSource ? `${rightSource.versionLabel} / ${bytes(rightSource.fileSizeBytes)} / ${rightSource.checksum || "no checksum"}` : "Right version"} />
                {leftSource?.previewUrl && rightSource?.previewUrl ? <img src={leftSource.previewUrl} alt="" style={{ opacity: overlayOpacity / 100 }} className="pointer-events-none absolute inset-0 h-[calc(100%-2.5rem)] w-full rounded-md object-cover" /> : null}
              </div>
            </div>
          </WorkspacePanel>

          {asset.sourceFiles.map((source) => (
            <div key={source.id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4">
              <div className="grid gap-4 lg:grid-cols-[12rem_1fr_12rem] lg:items-start">
                <PreviewPane url={source.previewUrl ?? ""} label={source.previewStatus ?? "preview missing"} />
                <div>
                  <p className="font-black text-white">{source.versionLabel} / {source.filename}</p>
                  <p className="mt-1 text-sm text-slate-400">{source.uploadedBy} / {dateLabel(source.uploadedAt)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{source.notes || "No notes recorded."}</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-4">
                    <WorkspaceMiniStat label="Derivatives" value={derivativesForSource(asset, source.id).map(derivativeLabel).join(", ") || "None"} />
                    <WorkspaceMiniStat label="Approvals" value={asset.reviewEvents.filter((event) => event.approvedSourceVersionId === source.id).length} />
                    <WorkspaceMiniStat label="Published" value={asset.derivatives.filter((derivative) => derivative.sourceFileId === source.id && derivative.publishStatus === "published").length} />
                    <WorkspaceMiniStat label="Checksum" value={source.checksum || "None"} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="button" onClick={() => runAction("source.set_current", undefined, { sourceFileId: source.id })}>Set Current</Button>
                  <Button type="button" onClick={() => runAction("source.restore", undefined, { sourceFileId: source.id })}>Restore</Button>
                  <Button type="button" onClick={() => runAction("source.archive", undefined, { sourceFileId: source.id })}>Archive</Button>
                  <Link href={`/api/assets/production/source/${source.id}`} className="inline-flex h-10 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Download</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === "previews" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <div className="grid gap-4 lg:grid-cols-2">
            {asset.sourceFiles.map((source) => (
              <WorkspacePanel key={source.id} title={`${source.versionLabel} Preview`} icon={FileImage}>
                <PreviewPane url={source.previewUrl ?? ""} label={source.filename} />
                <div className="mt-4 grid gap-2 md:grid-cols-3">
                  <WorkspaceMiniStat label="Format" value={source.previewUrl?.split(".").pop()?.toUpperCase() || "Unknown"} />
                  <WorkspaceMiniStat label="Dimensions" value={source.width && source.height ? `${source.width}x${source.height}` : "Unknown"} />
                  <WorkspaceMiniStat label="Status" value={source.previewStatus ?? "missing"} />
                  <WorkspaceMiniStat label="Method" value={source.previewUrl ? "manual/source" : "pending"} />
                  <WorkspaceMiniStat label="Created" value={dateLabel(source.uploadedAt)} />
                  <WorkspaceMiniStat label="Primary" value={source.isPrimaryPreview || source.previewUrl === primaryPreview ? "Yes" : "No"} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => runAction("source.preview", undefined, { sourceFileId: source.id, previewUrl: source.previewUrl, isPrimaryPreview: true })}>Set Primary Preview</Button>
                  <Button type="button" onClick={() => {
                    const previewUrl = window.prompt("Preview URL", source.previewUrl ?? "");
                    if (previewUrl) runAction("source.preview", undefined, { sourceFileId: source.id, previewUrl, isPrimaryPreview: true });
                  }}>Replace</Button>
                  <Button type="button" onClick={() => runAction("preview.regenerate", undefined, { presetId: "source_preview", sourceFileId: source.id })}>Regenerate</Button>
                  {source.previewUrl ? <Link href={source.previewUrl} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Download</Link> : null}
                  <Button type="button" onClick={() => runAction("source.preview", undefined, { sourceFileId: source.id, previewUrl: "", isPrimaryPreview: false })}>Archive</Button>
                </div>
              </WorkspacePanel>
            ))}
          </div>
          <ActionForm title="Manual Preview Upload" onSubmit={(form) => runAction("source.preview", form)} submitLabel="Save Preview">
            <select name="sourceFileId" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none">
              {asset.sourceFiles.map((source) => <option key={source.id} value={source.id}>{source.versionLabel} / {source.filename}</option>)}
            </select>
            <Input name="previewUrl" placeholder="/assets/previews/asset.png" />
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300"><input name="isPrimaryPreview" type="checkbox" /> Set as primary preview</label>
          </ActionForm>
        </div>
      ) : null}

      {activeTab === "derivatives" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <div className="space-y-3">
            {asset.derivatives.map((derivative) => (
              <WorkspacePanel key={derivative.id} title={derivativeLabel(derivative)} icon={Layers3}>
                <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
                  <PreviewPane url={derivative.publicUrl} label={derivative.staleSince ? "stale derivative" : "current derivative"} />
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <WorkspaceBadge value={derivative.status} />
                      <WorkspaceBadge value={derivative.approvalStatus ?? "pending"} />
                      <WorkspaceBadge value={derivative.publishStatus ?? "draft"} />
                      {derivative.staleSince ? <WorkspaceBadge value="Stale" /> : null}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <WorkspaceMiniStat label="Preset" value={derivative.presetId || derivative.derivativeType} />
                      <WorkspaceMiniStat label="Size" value={derivative.width && derivative.height ? `${derivative.width}x${derivative.height}` : "Unknown"} />
                      <WorkspaceMiniStat label="Quality" value={derivative.quality ?? "Default"} />
                      <WorkspaceMiniStat label="Crop" value={derivative.cropMode || "manual/default"} />
                      <WorkspaceMiniStat label="Focal" value={derivative.focalPoint || "center"} />
                      <WorkspaceMiniStat label="Source" value={sourceById[derivative.sourceFileId ?? ""]?.versionLabel ?? "Unknown"} />
                      <WorkspaceMiniStat label="Generated" value={dateLabel(derivative.generatedAt)} />
                      <WorkspaceMiniStat label="Mappings" value={Object.keys(derivative.platformMappings ?? {}).join(", ") || "None"} />
                    </div>
                    {derivative.staleSince ? <p className="mt-3 text-sm font-semibold text-amber-100">Stale: {derivative.staleReason || "Source or preset changed"} / generated from {sourceById[derivative.sourceFileId ?? ""]?.versionLabel ?? "unknown source"} while current is {currentSource?.versionLabel ?? "unknown"}.</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" onClick={() => runAction("derivative.generate", undefined, { presetId: derivative.presetId || derivative.derivativeType })}>Generate</Button>
                      <Button type="button" onClick={() => runAction("derivative.reprocess_stale", undefined, { derivativeId: derivative.id, presetId: derivative.presetId || derivative.derivativeType })}>Reprocess</Button>
                      <Button type="button" onClick={() => runAction("derivative.approve", undefined, { derivativeId: derivative.id })}>Mark Approved</Button>
                      <Button type="button" onClick={() => runAction("derivative.needs_changes", undefined, { derivativeId: derivative.id })}>Request Changes</Button>
                      <Button type="button" onClick={() => runAction("mapping.web_publish", undefined, { derivativeId: derivative.id, path: derivative.publicUrl, adminOverride: true })}>Publish Web</Button>
                      <Button type="button" onClick={() => setActiveTab("engine_mappings")}>Map Roblox ID</Button>
                      <Button type="button" onClick={() => runAction("derivative.archive", undefined, { derivativeId: derivative.id })}>Archive</Button>
                    </div>
                  </div>
                </div>
              </WorkspacePanel>
            ))}
            {!asset.derivatives.length ? <WorkspacePanel><p className="text-sm font-semibold text-slate-300">No derivatives yet.</p></WorkspacePanel> : null}
          </div>
          <ActionForm title="Upload / Replace Derivative" onSubmit={(form) => uploadDerivativeFile(form, Boolean(field(form, "derivativeId")))} submitLabel="Save Derivative">
            <select name="derivativeId" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none">
              <option value="">New derivative</option>
              {asset.derivatives.map((derivative) => <option key={derivative.id} value={derivative.id}>Replace {derivativeLabel(derivative)}</option>)}
            </select>
            <Input name="derivativeType" placeholder="icon, card, hero, banner" />
            <Input name="presetId" placeholder="Preset ID" />
            <Input name="width" placeholder="Width" type="number" />
            <Input name="height" placeholder="Height" type="number" />
            <Input name="cropMode" placeholder="contain, cover, crop, manual" />
            <Input name="focalPoint" placeholder="center" />
            <input name="file" type="file" accept=".png" className="rounded-md border border-cyan-300/15 bg-slate-950/60 p-2 text-sm text-white" />
          </ActionForm>
          <WorkspacePanel title="Processing Jobs" icon={RefreshCcw}>
            <div className="space-y-2">
              {processingJobs.map((job) => (
                <div key={job.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">{job.presetId}</p>
                    <WorkspaceBadge value={job.status} />
                  </div>
                  <WorkspaceProgressBar value={job.progress} />
                  {job.errorMessage ? <p className="mt-2 text-sm text-amber-100">{job.errorMessage}</p> : null}
                  <div className="mt-3 flex gap-2">
                    <Button type="button" onClick={() => runAction("queue.retry", undefined, { jobId: job.id })}>Retry</Button>
                    <Link href="/assets/processing" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">View Queue</Link>
                  </div>
                </div>
              ))}
              {!processingJobs.length ? <p className="text-sm font-semibold text-slate-300">No active processing jobs.</p> : null}
            </div>
          </WorkspacePanel>
        </div>
      ) : null}

      {activeTab === "requirements" ? (
        <WorkspacePanel title="Requirement Completion" icon={CheckCircle2}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {asset.missingRequirements.map((requirement) => (
              <div key={requirement} className="rounded-md border border-amber-300/20 bg-amber-300/5 p-3">
                <WorkspaceMiniStat label={requirement} value="Required blocker" />
                <p className="mt-2 text-sm text-amber-100">No matching derivative is available for this required output.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => runAction("derivative.generate", undefined, { presetId: requirement })}>Generate</Button>
                  <Button type="button" onClick={() => setActiveTab("derivatives")}>Upload</Button>
                  <Button type="button" onClick={() => runAction("missing.mark_not_required", undefined, { missingRequirementId: `missing_${asset.id}_${requirement}` })}>Mark Not Required</Button>
                </div>
              </div>
            ))}
            {asset.optionalMissingRequirements.map((requirement) => (
              <div key={requirement} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <WorkspaceMiniStat label={requirement} value="Optional missing" />
                <p className="mt-2 text-sm text-slate-300">Optional output. It can be restored/generated later.</p>
              </div>
            ))}
            {asset.derivatives.map((derivative) => (
              <div key={derivative.id} className="rounded-md border border-emerald-300/15 bg-emerald-300/5 p-3">
                <WorkspaceMiniStat label={derivative.derivativeType} value={derivative.approvalStatus ?? derivative.status} />
                <p className="mt-2 text-sm text-slate-300">{derivative.width && derivative.height ? `${derivative.width}x${derivative.height}` : "Dimensions unknown"} / {derivative.format}</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      ) : null}

      {activeTab === "engine_mappings" ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <WorkspacePanel title="Current Mappings" icon={GitBranch}>
            <div className="grid gap-3 md:grid-cols-2">
              {["web", "roblox", "unity", "unreal", "godot"].map((engine) => (
                <div key={engine} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black capitalize text-white">{engine}</p>
                    <WorkspaceBadge value={engineReady(engineMappings[engine])} />
                  </div>
                  <p className="mt-2 break-all text-sm text-slate-300">{engineValue(engineMappings[engine])}</p>
                </div>
              ))}
            </div>
            <pre className="mt-4 overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/60 p-3 text-xs text-cyan-50">{JSON.stringify(asset.platformMappings, null, 2)}</pre>
          </WorkspacePanel>
          <div className="space-y-4">
            <ActionForm title="Publish Web Asset" onSubmit={(form) => runAction("mapping.web_publish", form)} submitLabel="Publish Web">
              <select name="derivativeId" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none">
                {asset.derivatives.map((derivative) => <option key={derivative.id} value={derivative.id}>{derivativeLabel(derivative)}</option>)}
              </select>
              <Input name="path" placeholder="/assets/published/earth-card.webp" />
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300"><input name="adminOverride" type="checkbox" /> Admin override</label>
            </ActionForm>
            <ActionForm title="Map Roblox Asset ID" onSubmit={(form) => runAction("mapping.roblox", form)} submitLabel="Map Roblox">
              <Input name="assetId" placeholder="123456789 or rbxassetid://123456789" />
              <Textarea name="notes" placeholder="Roblox upload notes" />
            </ActionForm>
            <ActionForm title="Map Unity Addressable" onSubmit={(form) => runAction("mapping.unity", form)} submitLabel="Map Unity">
              <Input name="key" placeholder="Assets/ProjectGenesis/Eras/survival_icon" />
            </ActionForm>
            <ActionForm title="Map Unreal Asset Path" onSubmit={(form) => runAction("mapping.unreal", form)} submitLabel="Map Unreal">
              <Input name="path" placeholder="/Game/ProjectGenesis/Eras/SurvivalIcon" />
            </ActionForm>
            <ActionForm title="Map Godot Resource" onSubmit={(form) => runAction("mapping.godot", form)} submitLabel="Map Godot">
              <Input name="path" placeholder="res://project_genesis/eras/survival_icon.png" />
            </ActionForm>
          </div>
        </div>
      ) : null}

      {activeTab === "review" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <WorkspacePanel title="Review Timeline" icon={History}>
            <div className="space-y-3">
              {asset.reviewEvents.map((event) => (
                <div key={event.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">{event.action.replaceAll("_", " ")}</p>
                    <WorkspaceBadge value={event.reviewer} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{dateLabel(event.timestamp)}</p>
                  <p className="mt-1 text-xs text-slate-500">Source: {event.approvedSourceVersionId ?? "none"} / Derivatives: {event.approvedDerivativeIds?.join(", ") || "none"}</p>
                  {event.notes ? <p className="mt-2 text-sm text-slate-300">{event.notes}</p> : null}
                </div>
              ))}
              {!asset.reviewEvents.length ? <p className="text-sm font-semibold text-slate-300">No review actions yet.</p> : null}
            </div>
          </WorkspacePanel>
          <ActionForm title="Review Action" onSubmit={(form) => runAction(field(form, "reviewAction"), form)} submitLabel="Record Review">
            <select name="reviewAction" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none">
              <option value="review.submit_review">Submit for Review</option>
              <option value="review.approve">Approve</option>
              <option value="review.request_changes">Request Changes</option>
              <option value="review.reject">Reject</option>
              <option value="review.reopen">Reopen</option>
              <option value="review.publish">Publish</option>
              <option value="review.unpublish">Unpublish</option>
            </select>
            <Input name="reviewer" placeholder="Reviewer" />
            <Textarea name="notes" placeholder="Review notes" />
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300"><input name="adminOverride" type="checkbox" /> Admin override</label>
          </ActionForm>
        </div>
      ) : null}

      {activeTab === "usage" ? (
        <WorkspacePanel title="Usage" icon={GitBranch}>
          <div className="space-y-3">
            {asset.usageReferences.map((usage) => (
              <div key={`${usage.type}:${usage.id}`} className="grid gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 md:grid-cols-[1fr_10rem] md:items-center">
                <div>
                  <p className="font-black text-white">{usage.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{usage.type} / relationship key: artKey or iconKey / usage context: canonical content</p>
                </div>
                <Link href={`/${usage.type}`} className="inline-flex h-10 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Open Record</Link>
              </div>
            ))}
            {!asset.usageReferences.length ? <p className="text-sm font-semibold text-slate-300">No linked canonical records yet.</p> : null}
            {asset.usageReferences.length ? <p className="rounded-md border border-amber-300/20 bg-amber-300/5 p-3 text-sm font-semibold text-amber-100">Used assets should not be deprecated without replacing their canonical art/icon key references.</p> : null}
          </div>
        </WorkspacePanel>
      ) : null}

      {activeTab === "history" ? (
        <WorkspacePanel title="Production History" icon={History}>
          <div className="space-y-3">
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="font-black text-white">Asset created/imported</p>
              <p className="mt-1 text-sm text-slate-400">{dateLabel(asset.createdAt)} / studio</p>
            </div>
            {asset.historyEvents.map((event) => (
              <div key={event.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <p className="font-black text-white">{event.title}</p>
                <p className="mt-1 text-sm text-slate-400">{event.eventType} / {dateLabel(event.timestamp)}</p>
                {event.notes ? <p className="mt-2 text-sm text-slate-300">{event.notes}</p> : null}
              </div>
            ))}
            {!asset.historyEvents.length ? <p className="text-sm font-semibold text-slate-300">No additional production history yet.</p> : null}
          </div>
        </WorkspacePanel>
      ) : null}
    </main>
  );
}
