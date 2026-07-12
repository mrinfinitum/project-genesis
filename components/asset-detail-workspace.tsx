"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Download, FileImage, GitBranch, History, Layers3, PackageCheck, RefreshCcw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile, WorkspaceTabs } from "@/components/ui/workspace";
import type { ProductionAsset } from "@/lib/assets/asset-production";

type DetailTab = "overview" | "source_files" | "versions" | "derivatives" | "requirements" | "engine_mappings" | "review" | "history";

const tabs: DetailTab[] = ["overview", "source_files", "versions", "derivatives", "requirements", "engine_mappings", "review", "history"];

function field(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function payloadFrom(form: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, field(form, key)]).filter(([, value]) => value));
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

function Input({ name, placeholder, type = "text" }: { name: string; placeholder: string; type?: string }) {
  return <input name={name} type={type} placeholder={placeholder} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-500" />;
}

function Textarea({ name, placeholder }: { name: string; placeholder: string }) {
  return <textarea name={name} placeholder={placeholder} className="min-h-20 rounded-md border border-cyan-300/15 bg-slate-950/60 p-3 text-sm text-white outline-none placeholder:text-slate-500" />;
}

function previewFor(asset: ProductionAsset) {
  return asset.derivatives.find((derivative) => derivative.publicUrl)?.publicUrl || asset.sourceFiles.find((source) => source.previewUrl)?.previewUrl || "";
}

export function AssetDetailWorkspace({ asset }: { asset: ProductionAsset }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [message, setMessage] = useState("");
  const preview = previewFor(asset);

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
        reviewer: form ? field(form, "reviewer") : "studio",
        notes: form ? field(form, "notes") : "",
        adminOverride: form?.get("adminOverride") === "on",
        payload: { ...extra, ...(form ? payloadFrom(form, ["filename", "storagePath", "previewUrl", "publicUrl", "derivativeType", "format", "width", "height", "path", "assetId"]) : {}) }
      })
    });
    const result = await response.json();
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
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Source upload failed.");
      return;
    }
    setMessage("Source uploaded. Refreshing...");
    window.location.reload();
  }

  async function uploadDerivativeFile(form: FormData) {
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
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Derivative upload failed.");
      return;
    }
    await runAction("derivative.upload", undefined, {
      derivativeType,
      format: "PNG",
      publicUrl: result.file_url,
      storagePath: result.path,
      generationMethod: "manual_upload"
    });
  }

  return (
    <main className="space-y-6">
      <Link href="/assets" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to Asset Dashboard
      </Link>

      <WorkspaceHeader
        eyebrow="Asset Detail"
        title={asset.name}
        description="Production workspace for source masters, preview status, source versions, derivatives, requirements, engine mappings, review, and publishing."
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
            <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
              <div className="grid min-h-64 place-items-center overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/55">
                {preview ? <img src={preview} alt="" className="h-full max-h-96 w-full object-cover" /> : <FileImage className="h-12 w-12 text-cyan-200" />}
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <WorkspaceBadge value={asset.productionStatus} />
                  <WorkspaceBadge value={asset.approvalStatus} />
                  <WorkspaceBadge value={asset.status} />
                </div>
                <WorkspaceProgressBar value={asset.completionPercent} />
                <div className="grid gap-3 md:grid-cols-2">
                  <WorkspaceMiniStat label="artKey" value={asset.artKey || "None"} />
                  <WorkspaceMiniStat label="iconKey" value={asset.iconKey || "None"} />
                  <WorkspaceMiniStat label="Category" value={asset.category} />
                  <WorkspaceMiniStat label="Profile" value={asset.requirementProfileId} />
                </div>
                {asset.publishBlockers.length ? <p className="text-sm leading-6 text-amber-100">Publish blockers: {asset.publishBlockers.join(", ")}</p> : <p className="text-sm font-semibold text-emerald-100">No required publish blockers.</p>}
              </div>
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Quick Actions" icon={UploadCloud}>
            <div className="space-y-3">
              <Button type="button" onClick={() => runAction("review.submit_review")}>Submit for Review</Button>
              <Button type="button" onClick={() => runAction("review.approve")}>Approve</Button>
              <Button type="button" onClick={() => runAction("review.publish")}>Publish</Button>
              <Button type="button" onClick={() => runAction("review.request_changes")}>Request Changes</Button>
            </div>
          </WorkspacePanel>
        </div>
      ) : null}

      {activeTab === "source_files" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <div className="space-y-3">
            {asset.sourceFiles.map((source) => (
              <WorkspacePanel key={source.id} title={source.filename} icon={FileImage}>
                <div className="grid gap-3 md:grid-cols-5">
                  <WorkspaceMiniStat label="Version" value={source.versionLabel} />
                  <WorkspaceMiniStat label="Current" value={source.isCurrent ? "Yes" : "No"} />
                  <WorkspaceMiniStat label="Preview" value={source.previewStatus ?? "missing"} />
                  <WorkspaceMiniStat label="Format" value={source.extension} />
                  <WorkspaceMiniStat label="Size" value={source.fileSizeBytes || "Unknown"} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => runAction("source.set_current", undefined, { sourceFileId: source.id })}>Set Current</Button>
                  <Button type="button" onClick={() => runAction("source.restore", undefined, { sourceFileId: source.id })}>Restore</Button>
                  <Button type="button" onClick={() => runAction("source.archive", undefined, { sourceFileId: source.id })}>Archive</Button>
                  <Link href={`/api/assets/production/source/${source.id}`} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
                    <Download className="h-4 w-4" />
                    Download Source
                  </Link>
                </div>
              </WorkspacePanel>
            ))}
            {!asset.sourceFiles.length ? <WorkspacePanel><p className="text-sm font-semibold text-slate-300">No source versions yet.</p></WorkspacePanel> : null}
          </div>
          <ActionForm title="Record Source Version" onSubmit={(form) => runAction("source.upload_version", form)} submitLabel="Add Version">
            <Input name="filename" placeholder="earth-master.psd" />
            <Input name="storagePath" placeholder="studio-private://assets/..." />
            <Input name="previewUrl" placeholder="Optional preview URL" />
            <Textarea name="notes" placeholder="Version notes" />
          </ActionForm>
          <ActionForm title="Upload Source File" onSubmit={uploadSourceFile} submitLabel="Upload Source">
            <input name="file" type="file" accept=".psd,.psb,.ai,.svg,.png,.jpg,.jpeg,.webp,.tif,.tiff,.pdf,.blend,.mp3,.wav,.ogg,.mp4,.mov" className="rounded-md border border-cyan-300/15 bg-slate-950/60 p-2 text-sm text-white" />
            <p className="text-sm leading-6 text-slate-400">Source masters are stored privately and never exported to public runtime data.</p>
          </ActionForm>
        </div>
      ) : null}

      {activeTab === "versions" ? (
        <div className="space-y-3">
          {asset.sourceFiles.map((source) => (
            <div key={source.id} className="grid gap-3 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 md:grid-cols-[1fr_8rem_8rem_10rem] md:items-center">
              <div>
                <p className="font-black text-white">{source.versionLabel} / {source.filename}</p>
                <p className="mt-1 break-all text-sm text-slate-400">{source.storagePath}</p>
              </div>
              <WorkspaceBadge value={source.isCurrent ? "current" : "previous"} />
              <WorkspaceBadge value={source.previewStatus ?? "missing"} />
              <p className="text-sm text-slate-300">{source.uploadedAt ? new Date(source.uploadedAt).toLocaleString() : "No date"}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === "derivatives" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <div className="space-y-3">
            {asset.derivatives.map((derivative) => (
              <WorkspacePanel key={derivative.id} title={`${derivative.derivativeType} / ${derivative.format}`} icon={Layers3}>
                <div className="grid gap-3 md:grid-cols-5">
                  <WorkspaceMiniStat label="Status" value={derivative.status} />
                  <WorkspaceMiniStat label="Approval" value={derivative.approvalStatus ?? "pending"} />
                  <WorkspaceMiniStat label="Publish" value={derivative.publishStatus ?? "draft"} />
                  <WorkspaceMiniStat label="Size" value={derivative.width && derivative.height ? `${derivative.width}x${derivative.height}` : "Unknown"} />
                  <WorkspaceMiniStat label="Method" value={derivative.generationMethod} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => runAction("derivative.approve", undefined, { derivativeId: derivative.id })}>Mark Approved</Button>
                  <Button type="button" onClick={() => runAction("derivative.needs_changes", undefined, { derivativeId: derivative.id })}>Needs Changes</Button>
                  {derivative.publicUrl ? <Link href={derivative.publicUrl} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Download</Link> : null}
                </div>
              </WorkspacePanel>
            ))}
          </div>
          <ActionForm title="Upload / Replace Derivative" onSubmit={(form) => runAction("derivative.upload", form)} submitLabel="Save Derivative">
            <Input name="derivativeType" placeholder="icon, card, hero, banner" />
            <Input name="format" placeholder="PNG, WebP, JPG" />
            <Input name="width" placeholder="Width" type="number" />
            <Input name="height" placeholder="Height" type="number" />
            <Input name="publicUrl" placeholder="Published or preview URL" />
            <Textarea name="notes" placeholder="Derivative notes" />
          </ActionForm>
          <ActionForm title="Upload Derivative PNG" onSubmit={uploadDerivativeFile} submitLabel="Upload Derivative">
            <Input name="derivativeType" placeholder="icon, card, hero, banner" />
            <input name="file" type="file" accept=".png" className="rounded-md border border-cyan-300/15 bg-slate-950/60 p-2 text-sm text-white" />
          </ActionForm>
        </div>
      ) : null}

      {activeTab === "requirements" ? (
        <WorkspacePanel title="Requirement Completion" icon={CheckCircle2}>
          <div className="grid gap-3 md:grid-cols-3">
            {asset.missingRequirements.map((requirement) => <WorkspaceStatTile key={requirement} label={requirement} value="Missing" />)}
            {asset.optionalMissingRequirements.map((requirement) => <WorkspaceStatTile key={requirement} label={requirement} value="Optional" />)}
            {!asset.missingRequirements.length && !asset.optionalMissingRequirements.length ? <WorkspaceStatTile label="Required" value="Complete" /> : null}
          </div>
        </WorkspacePanel>
      ) : null}

      {activeTab === "engine_mappings" ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <WorkspacePanel title="Current Mappings" icon={GitBranch}>
            <pre className="overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/60 p-3 text-xs text-cyan-50">{JSON.stringify(asset.platformMappings, null, 2)}</pre>
          </WorkspacePanel>
          <div className="space-y-4">
            <ActionForm title="Publish Web Asset" onSubmit={(form) => runAction("mapping.web_publish", form)} submitLabel="Publish Web">
              <Input name="derivativeId" placeholder="Derivative ID" />
              <Input name="path" placeholder="/assets/published/earth-card.webp" />
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300"><input name="adminOverride" type="checkbox" /> Admin override</label>
            </ActionForm>
            <ActionForm title="Map Roblox Asset ID" onSubmit={(form) => runAction("mapping.roblox", form)} submitLabel="Map Roblox">
              <Input name="assetId" placeholder="123456789 or rbxassetid://123456789" />
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
                  <p className="mt-1 text-sm text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
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
              <option value="review.publish">Publish</option>
              <option value="review.unpublish">Unpublish</option>
            </select>
            <Input name="reviewer" placeholder="Reviewer" />
            <Textarea name="notes" placeholder="Review notes" />
          </ActionForm>
        </div>
      ) : null}

      {activeTab === "history" ? (
        <WorkspacePanel title="Production History" icon={History}>
          <div className="space-y-3">
            {asset.historyEvents.map((event) => (
              <div key={event.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <p className="font-black text-white">{event.title}</p>
                <p className="mt-1 text-sm text-slate-400">{event.eventType} / {new Date(event.timestamp).toLocaleString()}</p>
                {event.notes ? <p className="mt-2 text-sm text-slate-300">{event.notes}</p> : null}
              </div>
            ))}
            {!asset.historyEvents.length ? <p className="text-sm font-semibold text-slate-300">No production history yet.</p> : null}
          </div>
        </WorkspacePanel>
      ) : null}
    </main>
  );
}
