"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckSquare, Download, FileJson, ImageIcon, Printer, Search, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile } from "@/components/ui/workspace";
import type { EraArtGroup, EraArtInventory, EraArtRequirementCard, EraArtStatus } from "@/lib/assets/era-art-inventory";

type StatusFilter =
  | "All"
  | "Missing"
  | "Draft"
  | "In Review"
  | "Approved"
  | "Published"
  | "Required"
  | "Optional"
  | "Source Missing"
  | "PSD Uploaded"
  | "Roblox Unmapped"
  | "Web Unpublished";

const statusFilters: StatusFilter[] = ["All", "Missing", "Draft", "In Review", "Approved", "Published", "Required", "Optional", "Source Missing", "PSD Uploaded", "Roblox Unmapped", "Web Unpublished"];
const groupFilters: Array<"All Groups" | EraArtGroup> = ["All Groups", "Era Identity", "Research", "Buildings", "Resources", "Events", "Missions", "UI", "Audio/Video"];

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
      {card.previewUrl ? <img src={card.previewUrl} alt="" className="h-full w-full object-cover" /> : (
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
  if (status === "Published" || status === "Approved") return "border-emerald-300/25";
  if (status === "In Review") return "border-cyan-300/30";
  return "border-slate-700/70";
}

function RequirementCard({ card }: { card: EraArtRequirementCard }) {
  const detailHref = card.assetId ? `/assets/${encodeURIComponent(card.assetId)}?returnTo=${encodeURIComponent(`/assets/eras/${card.eraId}`)}` : "/game-art-import";
  return (
    <article className={`rounded-md border bg-[#07101e]/85 p-4 shadow-glow ${cardStatusTone(card.status)}`}>
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
        <WorkspaceMiniStat label="Derivative" value={card.derivativeStatus} />
        <WorkspaceMiniStat label="Approval" value={card.approvalStatus} />
        <WorkspaceMiniStat label="Publish" value={card.publishStatus} />
        <WorkspaceMiniStat label="Roblox" value={card.robloxMapping} />
        <WorkspaceMiniStat label="Web" value={card.webMapping} />
        <WorkspaceMiniStat label="Dimensions" value={card.requiredDimensions} />
        <WorkspaceMiniStat label="Format" value={card.format} />
      </div>

      <div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
        <p><span className="font-bold text-cyan-100">Linked:</span> {card.linkedObjectType} / {card.linkedObjectName}</p>
        <p><span className="font-bold text-cyan-100">Preset:</span> {card.derivativePreset} / {card.aspectRatio}</p>
        {card.status === "Missing" ? <p><span className="font-bold text-cyan-100">Needed:</span> {card.requiredDimensions}, {card.format}, assigned artist pending.</p> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={detailHref} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
          {card.assetId ? "Open Asset" : "Create Asset Record"}
        </Link>
        <Link href={card.assetId ? `${detailHref}&tab=source_files` : "/game-art-import"} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
          <UploadCloud className="h-4 w-4" />
          Upload Source
        </Link>
        <Link href={card.assetId ? `${detailHref}&tab=derivatives` : "/game-art-import"} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
          Upload Derivative
        </Link>
        <button type="button" className="inline-flex h-10 items-center rounded-md border border-slate-600/70 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">
          Assign Artist
        </button>
        <button type="button" className="inline-flex h-10 items-center rounded-md border border-slate-600/70 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">
          Mark Not Required
        </button>
      </div>
    </article>
  );
}

function BulkActions({ inventory, cards }: { inventory: EraArtInventory; cards: EraArtRequirementCard[] }) {
  const hasUnapprovedRequired = cards.some((card) => card.required && !["Approved", "Published", "Needs Roblox Mapping", "Needs Web Publish"].includes(card.status));

  function exportJson() {
    downloadFile(`project-genesis-${inventory.era.id}-art-checklist.json`, "application/json", JSON.stringify(inventory.checklist, null, 2));
  }

  function exportCsv() {
    const headers = Object.keys(inventory.checklist[0] ?? {});
    const rows = [headers.join(","), ...inventory.checklist.map((row) => headers.map((header) => csvEscape(row[header])).join(","))];
    downloadFile(`project-genesis-${inventory.era.id}-art-checklist.csv`, "text/csv", `${rows.join("\n")}\n`);
  }

  function exportManifest() {
    downloadFile(`project-genesis-${inventory.era.id}-asset-manifest.json`, "application/json", JSON.stringify({
      era: inventory.era,
      summary: inventory.summary,
      assets: cards.map((card) => ({
        id: card.canonicalAssetId,
        assetId: card.assetId,
        group: card.group,
        artKey: card.artKey,
        iconKey: card.iconKey,
        requirementType: card.requirementType,
        status: card.status,
        robloxMapping: card.robloxMapping,
        webMapping: card.webMapping
      }))
    }, null, 2));
  }

  return (
    <WorkspacePanel title="Bulk Actions" icon={CheckSquare}>
      <div className="flex flex-wrap gap-2">
        <Button type="button">Generate Missing Asset Tasks</Button>
        <Button type="button">Assign Artist</Button>
        <Button type="button">Set Priority</Button>
        <Button type="button">Submit Selected for Review</Button>
        <Button type="button">Approve Selected</Button>
        <Button type="button" disabled={hasUnapprovedRequired} title={hasUnapprovedRequired ? "Required assets must be approved before bulk publish." : "Publish selected approved assets to Web."}>
          Publish Selected to Web
        </Button>
        <Button type="button" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
        <Button type="button" onClick={exportJson}><FileJson className="mr-2 h-4 w-4" />Export JSON</Button>
        <Button type="button" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Printable View</Button>
        <Button type="button" onClick={exportManifest}>Download Era Asset Manifest</Button>
      </div>
      {hasUnapprovedRequired ? <p className="mt-3 text-sm font-semibold text-amber-100">Bulk Web publish is locked until required assets are approved.</p> : null}
    </WorkspacePanel>
  );
}

export function EraArtInventoryWorkspace({ inventory }: { inventory: EraArtInventory }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [groupFilter, setGroupFilter] = useState<(typeof groupFilters)[number]>("All Groups");
  const [query, setQuery] = useState("");

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return inventory.cards.filter((card) => {
      const groupOk = groupFilter === "All Groups" || card.group === groupFilter;
      const statusOk = statusMatches(card, statusFilter);
      const searchOk = !normalizedQuery || [card.assetName, card.canonicalAssetId, card.artKey, card.iconKey, card.linkedObjectName, card.linkedObjectType]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return groupOk && statusOk && searchOk;
    });
  }, [groupFilter, inventory.cards, query, statusFilter]);

  const stats = [
    { label: "Completion", value: `${inventory.summary.completionPercent}%` },
    { label: "Required", value: inventory.summary.requiredAssetCount },
    { label: "Complete", value: inventory.summary.completedAssetCount },
    { label: "Missing", value: inventory.summary.missingAssetCount }
  ];

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow={`Era ${inventory.era.eraNumber} Art Inventory`}
        title={inventory.era.displayName}
        description={inventory.era.description}
        stats={stats}
      />

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

      <BulkActions inventory={inventory} cards={filteredCards} />

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
        {filteredCards.map((card) => <RequirementCard key={card.id} card={card} />)}
      </section>

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
