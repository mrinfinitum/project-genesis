"use client";

import Link from "next/link";
import { memo, useDeferredValue, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CheckSquare, ClipboardList, Download, FileJson, ImageIcon, Printer, Search, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile } from "@/components/ui/workspace";
import type { EraArtGroup, EraArtInventory, EraArtRequirementCard, EraArtStatus } from "@/lib/assets/era-art-inventory";

type StatusFilter =
  | "All"
  | "Missing"
  | "Draft"
  | "In Review"
  | "Source Ready"
  | "Derivative Ready"
  | "Needs Review"
  | "Approved"
  | "Published"
  | "Complete"
  | "Required"
  | "Optional"
  | "Source Missing"
  | "PSD Uploaded"
  | "Roblox Unmapped"
  | "Web Unpublished";

const statusFilters: StatusFilter[] = ["All", "Missing", "Draft", "In Review", "Source Ready", "Derivative Ready", "Needs Review", "Approved", "Published", "Complete", "Required", "Optional", "Source Missing", "PSD Uploaded", "Roblox Unmapped", "Web Unpublished"];
const groupFilters: Array<"All Groups" | EraArtGroup> = ["All Groups", "Era Identity", "Research", "Buildings", "Resources", "Events", "Missions", "UI", "Audio/Video"];
const initialCardPageSize = 24;

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function downloadFile(filename: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function field(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function splitDimensions(value: string) {
  const [width, height] = value.split(/[xX]/).map((part) => Number(part.trim()));
  return { width: Number.isFinite(width) ? width : undefined, height: Number.isFinite(height) ? height : undefined };
}

function requirementPayload(card: EraArtRequirementCard) {
  const { width, height } = splitDimensions(card.requiredDimensions);
  return {
    missingRequirementId: card.id,
    eraId: card.eraId,
    linkedObjectId: card.linkedObjectId,
    linkedObjectType: card.linkedObjectType,
    category: card.group,
    requirementType: card.requirementType,
    assetName: card.assetName,
    artKey: card.artKey,
    iconKey: card.iconKey,
    width,
    height,
    priority: card.priority,
    assignedArtist: card.assignedArtist,
    dueDate: card.dueDate,
    productionNotes: card.productionNotes || card.notes
  };
}

function checklistRows(cards: EraArtRequirementCard[]) {
  return cards.map((card) => ({
    era: card.eraName,
    group: card.group,
    linkedObject: `${card.linkedObjectType}:${card.linkedObjectId}`,
    assetRequirement: card.assetName,
    required: card.required,
    dimensions: card.requiredDimensions,
    format: card.format,
    status: card.status,
    sourceStatus: card.sourcePsdStatus,
    approvalStatus: card.approvalStatus,
    robloxMapping: card.robloxMapping,
    webMapping: card.webMapping,
    assignedArtist: card.assignedArtist,
    dueDate: card.dueDate,
    notes: card.notes,
    currentSourceFilename: card.currentSourceFilename,
    sourceVersionCount: card.sourceVersionCount,
    derivativeCount: card.derivativeCount,
    engineReadiness: JSON.stringify(card.engineReadiness),
    linkedAssetId: card.linkedAssetId ?? "",
    requirementProfileId: card.requirementProfileId,
    dashboardPriorityGroup: card.dashboardPriorityGroup,
    readinessStage: card.readinessStage,
    placeholder: card.placeholder
  }));
}

function statusMatches(card: EraArtRequirementCard, filter: StatusFilter) {
  if (filter === "All") return true;
  if (filter === "Required") return card.required;
  if (filter === "Optional") return !card.required;
  if (filter === "Source Missing") return card.sourcePsdStatus === "Missing";
  if (filter === "PSD Uploaded") return card.sourcePsdStatus === "PSD Uploaded";
  if (filter === "Roblox Unmapped") return card.robloxMapping === "Unmapped";
  if (filter === "Web Unpublished") return card.webMapping === "Unpublished";
  if (filter === "Draft") return card.status === "Draft" || card.status === "Source Uploaded";
  return card.status === filter;
}

function AssetPreview({ card }: { card: EraArtRequirementCard }) {
  return (
    <div className="grid aspect-[16/10] place-items-center overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/60">
      {card.previewUrl ? <img src={card.previewUrl} alt="" loading="lazy" decoding="async" width={512} height={320} className="h-full w-full object-cover" /> : (
        <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(15,23,42,0.95))]">
          <div className="text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-cyan-200" />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Missing Art</p>
          </div>
        </div>
      )}
    </div>
  );
}

function cardStatusTone(status: EraArtStatus) {
  if (status === "Missing" || status === "Needs Roblox Mapping" || status === "Needs Web Publish") return "border-amber-300/30";
  if (status === "Published" || status === "Approved" || status === "Complete" || status === "Roblox Ready" || status === "Web Ready") return "border-emerald-300/25";
  if (status === "In Review") return "border-cyan-300/30";
  return "border-slate-700/70";
}

function RequirementCard({
  card,
  selected,
  onToggle,
  onCreateAsset,
  onUploadSource,
  onUploadDerivative,
  onUploadPreview,
  onAssign,
  onReview,
  onOpenReview,
  onPublishWeb,
  onMapRoblox,
  onMarkNotRequired
}: {
  card: EraArtRequirementCard;
  selected: boolean;
  onToggle: () => void;
  onCreateAsset: (card: EraArtRequirementCard) => void;
  onUploadSource: (card: EraArtRequirementCard, form: FormData) => void;
  onUploadDerivative: (card: EraArtRequirementCard, form: FormData, replace?: boolean) => void;
  onUploadPreview: (card: EraArtRequirementCard) => void;
  onAssign: (card: EraArtRequirementCard) => void;
  onReview: (card: EraArtRequirementCard, action: string) => void;
  onOpenReview: (card: EraArtRequirementCard) => void;
  onPublishWeb: (card: EraArtRequirementCard) => void;
  onMapRoblox: (card: EraArtRequirementCard) => void;
  onMarkNotRequired: (card: EraArtRequirementCard) => void;
}) {
  const detailHref = card.assetId ? `/assets/${encodeURIComponent(card.assetId)}?returnTo=${encodeURIComponent(`/assets/eras/${card.eraId}`)}` : "/game-art-import";
  return (
    <article className={`rounded-md border bg-[#07101e]/85 p-4 shadow-glow ${cardStatusTone(card.status)}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
          <input type="checkbox" checked={selected} onChange={onToggle} className="h-4 w-4 accent-cyan-300" />
          Select
        </label>
        <button type="button" onClick={() => onOpenReview(card)} className="inline-flex h-8 items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 text-xs font-bold text-cyan-100">
          Review
        </button>
      </div>

      <Link href={detailHref} className="block">
        <AssetPreview card={card} />
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-white">{card.assetName}</p>
            <p className="mt-1 truncate text-sm text-cyan-200">{card.canonicalAssetId}</p>
          </div>
          <WorkspaceBadge value={card.status} />
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap gap-2">
        <WorkspaceBadge value={card.group} />
        <WorkspaceBadge value={card.required ? "Required" : "Optional"} />
        <WorkspaceBadge value={card.priority} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="artKey" value={card.artKey} />
        <WorkspaceMiniStat label="Type" value={card.requirementType} />
        <WorkspaceMiniStat label="Usage" value={card.usageCount} />
        <WorkspaceMiniStat label="Source" value={card.sourcePsdStatus} />
        <WorkspaceMiniStat label="Version" value={card.sourceVersion} />
        <WorkspaceMiniStat label="Source File" value={card.currentSourceFilename} />
        <WorkspaceMiniStat label="Source Type" value={card.sourceType} />
        <WorkspaceMiniStat label="Versions" value={card.sourceVersionCount} />
        <WorkspaceMiniStat label="Preview" value={card.previewStatus} />
        <WorkspaceMiniStat label="Derivatives" value={card.derivativeCount} />
        <WorkspaceMiniStat label="Derivative" value={card.derivativeStatus} />
        <WorkspaceMiniStat label="Approval" value={card.approvalStatus} />
        <WorkspaceMiniStat label="Publish" value={card.publishStatus} />
        <WorkspaceMiniStat label="Roblox" value={card.robloxMapping} />
        <WorkspaceMiniStat label="Web" value={card.webMapping} />
        <WorkspaceMiniStat label="Dimensions" value={card.requiredDimensions} />
        <WorkspaceMiniStat label="Format" value={card.format} />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        {Object.entries(card.engineReadiness).map(([engine, status]) => (
          <WorkspaceMiniStat key={engine} label={engine} value={status} />
        ))}
      </div>

      <div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
        <p><span className="font-bold text-cyan-100">Linked:</span> {card.linkedObjectType} / {card.linkedObjectName}</p>
        <p><span className="font-bold text-cyan-100">Preset:</span> {card.derivativePreset} / {card.aspectRatio}</p>
        <p><span className="font-bold text-cyan-100">Owner:</span> {card.assignedArtist || "Unassigned"} {card.dueDate ? `/ Due ${card.dueDate}` : ""}</p>
        {card.productionNotes ? <p><span className="font-bold text-cyan-100">Notes:</span> {card.productionNotes}</p> : null}
        {card.status === "Missing" ? <p><span className="font-bold text-cyan-100">Needed:</span> {card.requiredDimensions}, {card.format}, assigned artist pending.</p> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.assetId ? (
          <Link href={detailHref} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
            Open Asset Detail
          </Link>
        ) : (
          <button type="button" onClick={() => onCreateAsset(card)} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
            Create Asset Record
          </button>
        )}
        <button type="button" onClick={() => onAssign(card)} className="inline-flex h-10 items-center rounded-md border border-slate-600/70 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">
          Assign Artist
        </button>
        {card.currentSourceFileId ? (
          <Link href={`/api/assets/production/source/${card.currentSourceFileId}`} className="inline-flex h-10 items-center rounded-md border border-slate-600/70 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">
            Download Source
          </Link>
        ) : null}
        <button type="button" onClick={() => onUploadPreview(card)} className="inline-flex h-10 items-center rounded-md border border-slate-600/70 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">
          Upload Preview
        </button>
        <button type="button" onClick={() => onReview(card, "review.approve")} className="inline-flex h-10 items-center rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 text-sm font-bold text-emerald-100">
          Approve
        </button>
        <button type="button" onClick={() => onReview(card, "review.request_changes")} className="inline-flex h-10 items-center rounded-md border border-amber-300/25 bg-amber-300/10 px-3 text-sm font-bold text-amber-100">
          Request Changes
        </button>
        <button type="button" onClick={() => onPublishWeb(card)} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
          Publish Web
        </button>
        <button type="button" onClick={() => onMapRoblox(card)} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
          Roblox ID
        </button>
        <button type="button" onClick={() => onMarkNotRequired(card)} className="inline-flex h-10 items-center rounded-md border border-slate-600/70 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">
          Mark Not Required
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onUploadSource(card, new FormData(event.currentTarget));
          }}
          className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"
        >
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Upload Source</p>
          <input name="file" type="file" accept=".psd,.psb,.ai,.svg,.png,.jpg,.jpeg,.webp,.tif,.tiff,.pdf,.blend,.mp3,.wav,.ogg,.mp4,.mov" className="mt-3 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 p-2 text-xs text-white" />
          <button type="submit" className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-xs font-bold text-cyan-100">
            <UploadCloud className="h-4 w-4" />
            Source File
          </button>
        </form>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onUploadDerivative(card, new FormData(event.currentTarget));
          }}
          className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"
        >
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Upload Derivative</p>
          <input name="file" type="file" accept=".png" className="mt-3 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 p-2 text-xs text-white" />
          <button type="submit" className="mt-3 inline-flex h-9 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-xs font-bold text-cyan-100">
            Upload {card.requirementType}
          </button>
        </form>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onUploadDerivative(card, new FormData(event.currentTarget), true);
          }}
          className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"
        >
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Replace Derivative</p>
          <input name="file" type="file" accept=".png" className="mt-3 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 p-2 text-xs text-white" />
          <button type="submit" className="mt-3 inline-flex h-9 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-xs font-bold text-cyan-100">
            Replace
          </button>
        </form>
      </div>
    </article>
  );
}

const MemoizedRequirementCard = memo(RequirementCard);

function BulkActions({
  inventory,
  cards,
  selectedCards,
  onGenerateTasks,
  onBulkMissingUpdate,
  onBulkReview,
  onBulkPublishWeb,
  onSelectAll
}: {
  inventory: EraArtInventory;
  cards: EraArtRequirementCard[];
  selectedCards: EraArtRequirementCard[];
  onGenerateTasks: (cards: EraArtRequirementCard[]) => void;
  onBulkMissingUpdate: (cards: EraArtRequirementCard[], patch: Record<string, unknown>) => void;
  onBulkReview: (cards: EraArtRequirementCard[], action: string) => void;
  onBulkPublishWeb: (cards: EraArtRequirementCard[]) => void;
  onSelectAll: () => void;
}) {
  const actionCards = selectedCards.length ? selectedCards : cards;
  const hasUnapprovedRequired = actionCards.some((card) => card.required && !["Approved", "Published", "Needs Roblox Mapping", "Needs Web Publish"].includes(card.status));

  function exportJson() {
    downloadFile(`project-genesis-${inventory.era.id}-art-checklist.json`, "application/json", JSON.stringify(checklistRows(cards), null, 2));
  }

  function exportCsv() {
    const checklist = checklistRows(cards);
    const headers = Object.keys(checklist[0] ?? {});
    const rows = [headers.join(","), ...checklist.map((row) => headers.map((header) => csvEscape(row[header as keyof typeof row])).join(","))];
    downloadFile(`project-genesis-${inventory.era.id}-art-checklist.csv`, "text/csv", `${rows.join("\n")}\n`);
  }

  function exportManifest() {
    downloadFile(`project-genesis-${inventory.era.id}-asset-manifest.json`, "application/json", JSON.stringify({
      era: inventory.era,
      summary: inventory.summary,
      completion: {
        requiredCompletionPercent: inventory.summary.requiredCompletionPercent,
        optionalCompletionPercent: inventory.summary.optionalCompletionPercent,
        overallProductionCompletion: inventory.summary.overallProductionCompletion
      },
      assets: cards.map((card) => ({
        id: card.canonicalAssetId,
        assetId: card.assetId,
        group: card.group,
        requirementId: card.id,
        linkedObjectId: card.linkedObjectId,
        linkedObjectType: card.linkedObjectType,
        artKey: card.artKey,
        iconKey: card.iconKey,
        requirementType: card.requirementType,
        status: card.status,
        approvalStatus: card.approvalStatus,
        publishStatus: card.publishStatus,
        sourceVersions: {
          currentFilename: card.currentSourceFilename,
          currentSourceFileId: card.currentSourceFileId,
          count: card.sourceVersionCount,
          previewStatus: card.previewStatus
        },
        derivatives: {
          latestDerivativeId: card.latestDerivativeId,
          count: card.derivativeCount,
          status: card.derivativeStatus
        },
        production: {
          assignedArtist: card.assignedArtist,
          priority: card.priority,
          dueDate: card.dueDate,
          notes: card.productionNotes
        },
        engineMappings: card.engineReadiness,
        robloxMapping: card.robloxMapping,
        webMapping: card.webMapping
      }))
    }, null, 2));
  }

  return (
    <WorkspacePanel title="Bulk Actions" icon={CheckSquare}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onSelectAll}><ClipboardList className="mr-2 h-4 w-4" />Select Filtered</Button>
        <Button type="button" onClick={() => onGenerateTasks(actionCards)}>Generate Missing Asset Tasks</Button>
        <Button type="button" onClick={() => {
          const assignedArtist = window.prompt("Assign artist");
          if (assignedArtist !== null) onBulkMissingUpdate(actionCards, { assignedArtist });
        }}>Assign Artist</Button>
        <Button type="button" onClick={() => {
          const priority = window.prompt("Priority: low, medium, high, critical", "high");
          if (priority) onBulkMissingUpdate(actionCards, { priority });
        }}>Set Priority</Button>
        <Button type="button" onClick={() => {
          const dueDate = window.prompt("Due date (YYYY-MM-DD)");
          if (dueDate !== null) onBulkMissingUpdate(actionCards, { dueDate });
        }}>Set Due Date</Button>
        <Button type="button" onClick={() => onBulkReview(actionCards, "review.submit_review")}>Submit Selected for Review</Button>
        <Button type="button" onClick={() => onBulkReview(actionCards, "review.approve")}>Approve Selected</Button>
        <Button type="button" onClick={() => onBulkReview(actionCards, "review.request_changes")}>Request Changes</Button>
        <Button type="button" disabled={hasUnapprovedRequired} onClick={() => onBulkPublishWeb(actionCards)} title={hasUnapprovedRequired ? "Required assets must be approved before bulk publish." : "Publish selected approved assets to Web."}>
          Publish Selected to Web
        </Button>
        <Button type="button" onClick={() => onBulkMissingUpdate(actionCards, { publishStatus: "ready", productionNotes: "Needs manual Roblox asset upload." })}>Mark Needs Roblox Upload</Button>
        <Button type="button" onClick={() => onBulkMissingUpdate(actionCards, { notRequired: true, status: "approved" })}>Mark Not Required</Button>
        <Button type="button" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
        <Button type="button" onClick={exportJson}><FileJson className="mr-2 h-4 w-4" />Export JSON</Button>
        <Button type="button" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Printable View</Button>
        <Button type="button" onClick={exportManifest}>Download Era Asset Manifest</Button>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-300">Actions target {selectedCards.length ? `${selectedCards.length} selected requirement(s)` : "the current filtered set"}.</p>
      {hasUnapprovedRequired ? <p className="mt-3 text-sm font-semibold text-amber-100">Bulk Web publish is locked until required assets are approved.</p> : null}
    </WorkspacePanel>
  );
}

export function EraArtInventoryWorkspace({ inventory }: { inventory: EraArtInventory }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [groupFilter, setGroupFilter] = useState<(typeof groupFilters)[number]>("All Groups");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [visibleCardCount, setVisibleCardCount] = useState(initialCardPageSize);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [reviewCard, setReviewCard] = useState<EraArtRequirementCard | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  async function postProductionAction(body: Record<string, unknown>) {
    setMessage("");
    const response = await fetch("/api/assets/production/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error ?? "Asset production action failed.");
    }
    return result as { assetId?: string; ok?: boolean };
  }

  async function ensureAssetRecord(card: EraArtRequirementCard) {
    if (card.assetId) return card.assetId;
    const result = await postProductionAction({
      action: "requirement.create_asset",
      missingRequirementId: card.id,
      payload: requirementPayload(card)
    });
    return String(result.assetId ?? card.canonicalAssetId);
  }

  async function runAndRefresh(action: () => Promise<void>, success = "Saved. Refreshing...") {
    try {
      await action();
      setMessage(success);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
    }
  }

  function createAssetRecord(card: EraArtRequirementCard) {
    runAndRefresh(async () => {
      await ensureAssetRecord(card);
    }, "Asset record created. Refreshing...");
  }

  function uploadSource(card: EraArtRequirementCard, form: FormData) {
    runAndRefresh(async () => {
      const file = form.get("file");
      if (!(file instanceof File) || !file.name) throw new Error("Choose a source file first.");
      const assetId = await ensureAssetRecord(card);
      const upload = new FormData();
      upload.set("file", file);
      upload.set("source_table", "assets");
      upload.set("asset_id", assetId);
      upload.set("asset_name", card.assetName);
      upload.set("upload_kind", "source");
      const response = await fetch("/api/assets/upload", { method: "POST", body: upload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Source upload failed.");
      await postProductionAction({
        action: "source.upload_version",
        assetId,
        missingRequirementId: card.id,
        notes: `${card.requirementType} source uploaded from Era Art Inventory.`,
        payload: {
          filename: file.name,
          storagePath: result.source_file_url ?? result.path,
          previewUrl: file.type.startsWith("image/") ? result.file_url ?? "" : "",
          fileSizeBytes: file.size
        }
      });
    }, "Source uploaded. Refreshing...");
  }

  function uploadDerivative(card: EraArtRequirementCard, form: FormData, replace = false) {
    runAndRefresh(async () => {
      const file = form.get("file");
      if (!(file instanceof File) || !file.name) throw new Error("Choose a derivative PNG first.");
      const assetId = await ensureAssetRecord(card);
      const upload = new FormData();
      upload.set("file", file);
      upload.set("source_table", "assets");
      upload.set("asset_id", assetId);
      upload.set("asset_name", card.assetName);
      upload.set("upload_kind", "export");
      const response = await fetch("/api/assets/upload", { method: "POST", body: upload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Derivative upload failed.");
      const { width, height } = splitDimensions(card.requiredDimensions);
      await postProductionAction({
        action: replace ? "derivative.replace" : "derivative.upload",
        assetId,
        derivativeId: replace ? card.latestDerivativeId : "",
        missingRequirementId: card.id,
        payload: {
          derivativeType: card.requirementType,
          format: "PNG",
          width,
          height,
          publicUrl: result.file_url,
          storagePath: result.path,
          generationMethod: "manual_upload"
        }
      });
    }, "Derivative uploaded. Refreshing...");
  }

  function uploadPreview(card: EraArtRequirementCard) {
    const previewUrl = window.prompt("Preview URL", card.previewUrl);
    if (!previewUrl) return;
    runAndRefresh(async () => {
      const assetId = await ensureAssetRecord(card);
      if (card.currentSourceFileId) {
        await postProductionAction({
          action: "source.preview",
          assetId,
          sourceFileId: card.currentSourceFileId,
          payload: { previewUrl }
        });
      } else {
        await postProductionAction({
          action: "source.upload_version",
          assetId,
          payload: {
            filename: `${card.artKey}-preview.png`,
            storagePath: "studio-private://preview-only",
            previewUrl
          }
        });
      }
    }, "Preview updated. Refreshing...");
  }

  function assignRequirement(card: EraArtRequirementCard) {
    const assignedArtist = window.prompt("Assigned artist", card.assignedArtist);
    if (assignedArtist === null) return;
    const priority = window.prompt("Priority: low, medium, high, critical", card.priority) ?? card.priority;
    const dueDate = window.prompt("Due date (YYYY-MM-DD)", card.dueDate) ?? card.dueDate;
    const productionNotes = window.prompt("Production notes", card.productionNotes || card.notes) ?? card.productionNotes;
    runAndRefresh(async () => {
      await postProductionAction({
        action: "missing.update",
        missingRequirementId: card.id,
        payload: { assignedArtist, priority, dueDate, productionNotes, assetId: card.assetId ?? "" }
      });
    });
  }

  function reviewRequirement(card: EraArtRequirementCard, action: string) {
    runAndRefresh(async () => {
      const assetId = await ensureAssetRecord(card);
      await postProductionAction({ action, assetId, reviewer: "studio", notes: reviewNotes || `${card.requirementType} ${action.replace("review.", "").replaceAll("_", " ")} from Era Art Inventory.` });
      if (action === "review.approve") {
        await postProductionAction({
          action: "missing.update",
          missingRequirementId: card.id,
          payload: { status: "approved", approvalStatus: "approved", assetId }
        });
      }
      if (action === "review.request_changes") {
        await postProductionAction({
          action: "missing.update",
          missingRequirementId: card.id,
          payload: { status: "changes_requested", approvalStatus: "changes_requested", assetId }
        });
      }
    });
    setReviewCard(null);
    setReviewNotes("");
  }

  function publishWeb(card: EraArtRequirementCard) {
    runAndRefresh(async () => {
      if (!card.latestDerivativeId) throw new Error("Upload a derivative before publishing to Web.");
      const assetId = await ensureAssetRecord(card);
      const path = window.prompt("Public Web path", card.previewUrl || `/assets/${card.eraId}/${card.requirementType}.png`);
      if (!path) throw new Error("A public Web path is required.");
      await postProductionAction({
        action: "mapping.web_publish",
        assetId,
        derivativeId: card.latestDerivativeId,
        adminOverride: true,
        payload: { path }
      });
      await postProductionAction({
        action: "missing.update",
        missingRequirementId: card.id,
        payload: { status: "published", publishStatus: "published", assetId }
      });
    }, "Web mapping published. Refreshing...");
  }

  function mapRoblox(card: EraArtRequirementCard) {
    const robloxAssetId = window.prompt("Roblox asset ID", card.robloxMapping === "Unmapped" ? "" : card.robloxMapping);
    if (!robloxAssetId) return;
    runAndRefresh(async () => {
      const assetId = await ensureAssetRecord(card);
      await postProductionAction({
        action: "mapping.roblox",
        assetId,
        payload: { assetId: robloxAssetId }
      });
    }, "Roblox mapping saved. Refreshing...");
  }

  function markNotRequired(card: EraArtRequirementCard) {
    if (!window.confirm(`Mark ${card.assetName} as not required for this era?`)) return;
    runAndRefresh(async () => {
      await postProductionAction({
        action: "missing.mark_not_required",
        missingRequirementId: card.id,
        payload: { notRequired: true, status: "approved", productionNotes: "Marked not required from Era Art Inventory." }
      });
    }, "Requirement marked not required. Refreshing...");
  }

  const filteredCards = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return inventory.cards.filter((card) => {
      const groupOk = groupFilter === "All Groups" || card.group === groupFilter;
      const statusOk = statusMatches(card, statusFilter);
      const searchOk = !normalizedQuery || [card.assetName, card.canonicalAssetId, card.artKey, card.iconKey, card.linkedObjectName, card.linkedObjectType]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return groupOk && statusOk && searchOk;
    });
  }, [deferredQuery, groupFilter, inventory.cards, statusFilter]);

  useEffect(() => {
    setVisibleCardCount(initialCardPageSize);
  }, [deferredQuery, groupFilter, statusFilter]);

  const visibleCards = useMemo(() => filteredCards.slice(0, visibleCardCount), [filteredCards, visibleCardCount]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const stats = [
    { label: "Completion", value: `${inventory.summary.completionPercent}%` },
    { label: "Required", value: inventory.summary.requiredAssetCount },
    { label: "Complete", value: inventory.summary.completedAssetCount },
    { label: "Missing", value: inventory.summary.missingAssetCount }
  ];

  const selectedCards = useMemo(() => {
    const ids = new Set(selectedIds);
    return inventory.cards.filter((card) => ids.has(card.id));
  }, [inventory.cards, selectedIds]);

  function toggleCard(cardId: string) {
    setSelectedIds((current) => current.includes(cardId) ? current.filter((id) => id !== cardId) : [...current, cardId]);
  }

  function selectFiltered() {
    setSelectedIds(filteredCards.map((card) => card.id));
  }

  function generateTasks(cards: EraArtRequirementCard[]) {
    runAndRefresh(async () => {
      await postProductionAction({
        action: "task.generate_missing",
        payload: {
          missingRequirementIds: cards.map((card) => card.id),
          requirements: cards.map((card) => ({
            id: card.id,
            era: card.eraName,
            linkedObject: `${card.linkedObjectType}:${card.linkedObjectName}`,
            requirementType: card.requirementType,
            dimensions: card.requiredDimensions,
            format: card.format,
            priority: card.priority,
            assignedArtist: card.assignedArtist,
            dueDate: card.dueDate,
            assetLink: card.assetId ? `/assets/${card.assetId}` : `/assets/eras/${card.eraId}`,
            sourceUploadLink: card.assetId ? `/assets/${card.assetId}?tab=source_files` : `/assets/eras/${card.eraId}`,
            notes: card.productionNotes || card.notes
          }))
        }
      });
    }, "Missing asset tasks generated. Refreshing...");
  }

  function bulkMissingUpdate(cards: EraArtRequirementCard[], patch: Record<string, unknown>) {
    runAndRefresh(async () => {
      await postProductionAction({
        action: "bulk.missing_update",
        payload: { missingRequirementIds: cards.map((card) => card.id), ...patch }
      });
    });
  }

  function bulkReview(cards: EraArtRequirementCard[], action: string) {
    runAndRefresh(async () => {
      for (const card of cards) {
        if (!card.assetId && action !== "review.submit_review") continue;
        const assetId = await ensureAssetRecord(card);
        await postProductionAction({ action, assetId, reviewer: "studio", notes: `Bulk ${action.replace("review.", "").replaceAll("_", " ")} from Era Art Inventory.` });
      }
    });
  }

  function bulkPublishWeb(cards: EraArtRequirementCard[]) {
    runAndRefresh(async () => {
      for (const card of cards) {
        if (!card.assetId || !card.latestDerivativeId) continue;
        await postProductionAction({
          action: "mapping.web_publish",
          assetId: card.assetId,
          derivativeId: card.latestDerivativeId,
          adminOverride: true,
          payload: { path: card.previewUrl || `/assets/${card.eraId}/${card.requirementType}.png` }
        });
      }
    }, "Selected Web mappings published. Refreshing...");
  }

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow={`Era ${inventory.era.eraNumber} Art Inventory`}
        title={inventory.era.displayName}
        description={inventory.era.description}
        stats={stats}
      />

      {message ? <div className="rounded-md border border-cyan-300/15 bg-cyan-300/10 p-3 text-sm font-bold text-cyan-100">{message}</div> : null}

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <WorkspaceStatTile label="Art Status" value={inventory.summary.artReadinessStatus} />
          <WorkspaceStatTile label="Required" value={inventory.summary.requiredAssetCount} />
          <WorkspaceStatTile label="Complete" value={inventory.summary.completedAssetCount} />
          <WorkspaceStatTile label="Missing" value={inventory.summary.missingAssetCount} />
          <WorkspaceStatTile label="Draft" value={inventory.summary.draftCount} />
          <WorkspaceStatTile label="Approved" value={inventory.summary.approvedCount} />
          <WorkspaceStatTile label="Published" value={inventory.summary.publishedCount} />
          <WorkspaceStatTile label="Mappings" value={inventory.summary.needsRobloxMapping + inventory.summary.needsWebPublish} />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>Required Completion</span>
              <span>{inventory.summary.requiredComplete} / {inventory.summary.requiredAssetCount}</span>
            </div>
            <WorkspaceProgressBar value={inventory.summary.requiredCompletionPercent} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>Optional Completion</span>
              <span>{inventory.summary.optionalComplete} / {inventory.summary.optionalAssetCount}</span>
            </div>
            <WorkspaceProgressBar value={inventory.summary.optionalCompletionPercent} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>Overall Production</span>
              <span>{inventory.summary.overallProductionCompletion}%</span>
            </div>
            <WorkspaceProgressBar value={inventory.summary.overallProductionCompletion} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-4">
        {inventory.groups.map((group) => (
          <div key={group.group} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-white">{group.group}</h2>
              <WorkspaceBadge value={group.missing ? "needs art" : "tracked"} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <WorkspaceMiniStat label="Total" value={group.total} />
              <WorkspaceMiniStat label="Done" value={group.complete} />
              <WorkspaceMiniStat label="Missing" value={group.missing} />
            </div>
          </div>
        ))}
      </section>

      <BulkActions
        inventory={inventory}
        cards={filteredCards}
        selectedCards={selectedCards}
        onGenerateTasks={generateTasks}
        onBulkMissingUpdate={bulkMissingUpdate}
        onBulkReview={bulkReview}
        onBulkPublishWeb={bulkPublishWeb}
        onSelectAll={selectFiltered}
      />

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 shadow-glow">
        <div className="grid gap-3 lg:grid-cols-[1fr_14rem_14rem]">
          <label className="flex items-center gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search era art" className="h-11 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-11 rounded-md border border-cyan-300/10 bg-slate-950/60 px-3 text-sm font-bold text-white outline-none">
            {statusFilters.map((filter) => <option key={filter}>{filter}</option>)}
          </select>
          <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value as (typeof groupFilters)[number])} className="h-11 rounded-md border border-cyan-300/10 bg-slate-950/60 px-3 text-sm font-bold text-white outline-none">
            {groupFilters.map((filter) => <option key={filter}>{filter}</option>)}
          </select>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {visibleCards.map((card) => (
          <MemoizedRequirementCard
            key={card.id}
            card={card}
            selected={selectedIdSet.has(card.id)}
            onToggle={() => toggleCard(card.id)}
            onCreateAsset={createAssetRecord}
            onUploadSource={uploadSource}
            onUploadDerivative={uploadDerivative}
            onUploadPreview={uploadPreview}
            onAssign={assignRequirement}
            onReview={reviewRequirement}
            onOpenReview={(card) => {
              setReviewCard(card);
              setReviewNotes(card.productionNotes || card.notes);
            }}
            onPublishWeb={publishWeb}
            onMapRoblox={mapRoblox}
            onMarkNotRequired={markNotRequired}
          />
        ))}
      </section>

      {visibleCards.length < filteredCards.length ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCardCount((count) => Math.min(filteredCards.length, count + initialCardPageSize))}
            className="inline-flex h-11 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20"
          >
            Load More Art Cards ({visibleCards.length} / {filteredCards.length})
          </button>
        </div>
      ) : null}

      {reviewCard ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-md border border-cyan-300/20 bg-[#07101e] p-5 shadow-glow">
            <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
              <AssetPreview card={reviewCard} />
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Inline Review</p>
                    <h2 className="mt-2 text-2xl font-black text-white">{reviewCard.assetName}</h2>
                    <p className="mt-1 text-sm text-slate-400">{reviewCard.linkedObjectType} / {reviewCard.linkedObjectName}</p>
                  </div>
                  <button type="button" onClick={() => setReviewCard(null)} className="h-9 rounded-md border border-slate-600/70 px-3 text-sm font-bold text-slate-200">Close</button>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-3">
                  <WorkspaceMiniStat label="Requirement" value={reviewCard.requirementType} />
                  <WorkspaceMiniStat label="Dimensions" value={reviewCard.requiredDimensions} />
                  <WorkspaceMiniStat label="Source" value={`${reviewCard.sourceVersion} / ${reviewCard.currentSourceFilename}`} />
                  <WorkspaceMiniStat label="Preview" value={reviewCard.previewStatus} />
                  <WorkspaceMiniStat label="Derivative" value={reviewCard.derivativeStatus} />
                  <WorkspaceMiniStat label="Approval" value={reviewCard.approvalStatus} />
                  <WorkspaceMiniStat label="Web" value={reviewCard.webMapping} />
                  <WorkspaceMiniStat label="Roblox" value={reviewCard.robloxMapping} />
                  <WorkspaceMiniStat label="Latest Update" value={reviewCard.latestUpdateAt ? new Date(reviewCard.latestUpdateAt).toLocaleString() : "None"} />
                </div>
                <textarea
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  placeholder="Review notes"
                  className="mt-4 min-h-28 w-full rounded-md border border-cyan-300/15 bg-slate-950/60 p-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => reviewRequirement(reviewCard, "review.submit_review")}><CheckCircle2 className="h-4 w-4" />Submit</Button>
                  <Button type="button" onClick={() => reviewRequirement(reviewCard, "review.approve")}>Approve</Button>
                  <Button type="button" onClick={() => reviewRequirement(reviewCard, "review.request_changes")}>Request Changes</Button>
                  <Button type="button" onClick={() => reviewRequirement(reviewCard, "review.reject")}>Reject</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!filteredCards.length ? (
        <WorkspacePanel>
          <p className="text-sm font-semibold text-slate-300">No era art requirements match the current filters.</p>
        </WorkspacePanel>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link href="/civilizations#full-civilization-timeline" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
          Back to Timeline
        </Link>
        <Link href={`/civilizations#era-${inventory.era.id}`} className="inline-flex h-10 items-center rounded-md border border-slate-600/70 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">
          Edit Era Content
        </Link>
      </div>
    </main>
  );
}
