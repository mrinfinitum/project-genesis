"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Archive, Boxes, CheckCircle2, ChevronDown, FileImage, GitBranch, History, ImageIcon, Layers3, PackageCheck, Search, ShieldCheck, Sparkles, Timer, TriangleAlert, Upload, UploadCloud } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { Button } from "@/components/ui/button";
import { CompactWorkspaceToolbar, cardShellClass, collectionGridClass, previewBoxClass, useWorkspaceDensitySettings, type DensitySettings } from "@/components/ui/density";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile } from "@/components/ui/workspace";
import { resolveMissingRequirementPreview, resolveProductionAssetPreview, sanitizePreviewUrl } from "@/lib/assets/visual-previews";
import { assetLibraryCategoryLabels, normalizeAssetLibraryCategoryId, resolveAssetLibraryCategoryView, type AssetLibraryCategoryId } from "@/lib/assets/asset-library-routing";
import type { AssetProductionState, ProductionAsset } from "@/lib/assets/asset-production";
import { upgradeCategoryBackgroundDerivativePresetIds, upgradeCategoryBackgroundDimensions } from "@/lib/upgrades/category-presentation";

export type AssetProductionView = "dashboard" | "source" | "generated" | "published" | "missing" | "processing" | "import-history";
type DamNodeId = AssetProductionView
  | "all-assets"
  | "recently-uploaded"
  | "needs-review"
  | "approved-assets"
  | AssetLibraryCategoryId;

type UpgradeCategoryAssetStatus = AssetProductionState["upgradeCategoryAssets"][number];
type LocalUploadPreview = { url: string; sizeLabel: string; fileName: string };

const viewMeta: Record<AssetProductionView, { eyebrow: string; title: string; description: string }> = {
  dashboard: {
    eyebrow: "Creative Assets",
    title: "Asset Library",
    description: "Upload, organize, approve, and publish game assets without exposing import mechanics or runtime mapping details."
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
    eyebrow: "Advanced / Internal",
    title: "Legacy Import",
    description: "Internal migration records for bulk Roblox imports, legacy asset recovery, and historical mapping audits."
  }
};

function viewLinks(preferredRoute: string): Array<{ href: string; label: string; view: AssetProductionView }> {
  return [
    { href: preferredRoute, label: "Asset Library", view: "dashboard" },
    { href: `${preferredRoute}?section=source`, label: "Source Files", view: "source" },
    { href: `${preferredRoute}?section=generated`, label: "Generated", view: "generated" },
    { href: `${preferredRoute}?section=published`, label: "Published", view: "published" },
    { href: `${preferredRoute}?section=missing`, label: "Missing", view: "missing" },
    { href: `${preferredRoute}?section=processing`, label: "Processing", view: "processing" },
    { href: `${preferredRoute}?section=import-history`, label: "Advanced", view: "import-history" }
  ];
}

function AssetNav({ active, preferredRoute }: { active: AssetProductionView; preferredRoute: string }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-2">
      {viewLinks(preferredRoute).map((item) => (
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

async function postProductionAction(body: Record<string, unknown>, options: { reload?: boolean } = {}) {
  const response = await fetch("/api/assets/production/action", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Production action failed.");
  if (options.reload ?? true) window.location.reload();
  return result;
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

const assetBelongsOptions = ["UI", "Research", "Buildings", "AI Agents", "Icons", "Backgrounds", "Galaxy", "Planet", "Audio", "Video", "Other"];
const assetRoleOptions = ["Screen Background", "Panel Background", "Button", "Tab", "Icon", "Overlay", "Placeholder Replacement", "Agent State", "Audio Cue", "Video"];

function slugForAssetKey(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "new_asset";
}

function UploadAssetWorkflow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentSize, setCurrentSize] = useState("No file selected");
  const [belongsTo, setBelongsTo] = useState(params?.get("category") ?? "UI");
  const [role, setRole] = useState(params?.get("role") ?? "Screen Background");
  const [target, setTarget] = useState(params?.get("name") ?? params?.get("assetKey") ?? "Workforce Upgrade Background");
  const [notes, setNotes] = useState(params?.get("requirement") ? `Linked requirement: ${params.get("requirement")}` : "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const semanticKey = params?.get("assetKey") ?? `${slugForAssetKey(role)}_${slugForAssetKey(target)}`;

  if (!open) return null;

  return (
    <WorkspacePanel title="Upload Asset" icon={UploadCloud}>
      <form
        className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!file) {
            setMessage("Choose a source file first.");
            return;
          }
          setBusy(true);
          setMessage("");
          const formData = new FormData();
          formData.set("upload_kind", "source");
          formData.set("source_table", "assets");
          formData.set("source_id", semanticKey);
          formData.set("asset_id", semanticKey);
          formData.set("asset_name", target);
          formData.set("file", file);
          try {
            const response = await fetch("/api/assets/upload", { method: "POST", body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error ?? "Upload failed.");
            setMessage(`Uploaded ${file.name}. Studio will track review, platform readiness, and derivatives from ${semanticKey}.`);
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Upload failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">1. Choose File</span>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg,.psd,.psb,.tiff,.tif,.mp3,.wav,.ogg,.mp4,.mov,image/*,audio/*,video/*"
                className="rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-300/15 file:px-3 file:py-1.5 file:text-cyan-100"
                onChange={async (event) => {
                  const nextFile = event.currentTarget.files?.[0] ?? null;
                  setFile(nextFile);
                  setMessage("");
                  if (!nextFile) {
                    setPreviewUrl(null);
                    setCurrentSize("No file selected");
                    return;
                  }
                  const canPreview = nextFile.type.startsWith("image/") && !nextFile.type.includes("tiff") && !/\.(psd|psb)$/i.test(nextFile.name);
                  setPreviewUrl(canPreview ? URL.createObjectURL(nextFile) : null);
                  const imageSize = await readBrowserImageSize(nextFile);
                  setCurrentSize(sizeLabel(imageSize));
                }}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">2. Belongs To</span>
              <select value={belongsTo} onChange={(event) => setBelongsTo(event.target.value)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                {assetBelongsOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">3. Asset Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
                {assetRoleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">4. Canonical Target</span>
              <input value={target} onChange={(event) => setTarget(event.target.value)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none" />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">5. Notes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Production notes, usage intent, geometry notes" className="min-h-20 rounded-md border border-cyan-300/15 bg-slate-950/60 p-3 text-sm text-white outline-none" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy || !file}>{busy ? "Uploading..." : "6. Upload"}</Button>
            <Button type="button" onClick={onClose}>Close</Button>
          </div>
          {message ? <p className="rounded-md border border-cyan-300/15 bg-cyan-300/10 p-3 text-sm font-semibold text-cyan-100">{message}</p> : null}
        </div>
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Review</p>
          {previewUrl ? <img src={previewUrl} alt="Selected asset preview" className="mt-3 h-40 w-full rounded-md border border-cyan-300/15 object-cover" /> : <div className="mt-3 grid h-40 place-items-center rounded-md border border-cyan-300/15 bg-slate-950/60 text-sm font-bold text-slate-400">Preview unavailable until derivative</div>}
          <div className="mt-3 grid gap-2">
            <WorkspaceMiniStat label="Source Dimensions" value={currentSize} />
            <WorkspaceMiniStat label="Required Dimensions" value={params?.get("requiredDimensions") ?? (belongsTo === "UI" ? "Use selected requirement" : "Not assigned")} />
            <WorkspaceMiniStat label="Semantic Asset Key" value={semanticKey} />
            <WorkspaceMiniStat label="Target Platforms" value="Web / Roblox / Mobile" />
            {params?.get("requirement") ? <WorkspaceMiniStat label="Requirement" value={params.get("requirement") ?? ""} /> : null}
          </div>
          <details className="mt-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-slate-400">Advanced</summary>
            <p className="mt-3 text-sm leading-6 text-slate-300">Studio stores the source privately, queues platform readiness, and keeps runtime URLs, checksums, and platform mappings in developer details.</p>
          </details>
        </div>
      </form>
    </WorkspacePanel>
  );
}

const damTree: Array<{ id: DamNodeId; label: string; children?: Array<{ id: DamNodeId; label: string }> }> = [
  { id: "all-assets", label: "All Assets" },
  { id: "recently-uploaded", label: "Recently Uploaded" },
  { id: "missing", label: "Missing Assets" },
  { id: "needs-review", label: "Needs Review" },
  { id: "approved-assets", label: "Approved" },
  { id: "published", label: "Published" },
  {
    id: "top-hud",
    label: "UI",
    children: [
      { id: "top-hud", label: "Top HUD" },
      { id: "left-navigation", label: "Left Navigation" },
      { id: "upgrade-categories", label: "Upgrade Categories" },
      { id: "research-ui", label: "Research" },
      { id: "buildings-ui", label: "Buildings" },
      { id: "galaxy-ui", label: "Galaxy" },
      { id: "planet-ui", label: "Planet" },
      { id: "settings-ui", label: "Settings" },
      { id: "login-ui", label: "Login" },
      { id: "loading-ui", label: "Loading" }
    ]
  },
  { id: "ai-agents", label: "AI Agents" },
  { id: "icons", label: "Icons" },
  { id: "backgrounds", label: "Backgrounds" },
  { id: "illustrations", label: "Illustrations" },
  { id: "animations", label: "Animations" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "unmapped", label: "Unmapped" },
  {
    id: "dashboard",
    label: "Advanced",
    children: [
      { id: "dashboard", label: "Readiness Dashboard" },
      { id: "source", label: "Source Files" },
      { id: "generated", label: "Generated Derivatives" },
      { id: "processing", label: "Processing" },
      { id: "import-history", label: "Legacy Import" }
    ]
  }
];

const implementedNodeLabels: Record<DamNodeId, string> = {
  "all-assets": "All Assets",
  "recently-uploaded": "Recently Uploaded",
  "needs-review": "Needs Review",
  "approved-assets": "Approved",
  dashboard: "Dashboard",
  source: "Source Art",
  generated: "Generated Assets",
  published: "Published Assets",
  missing: "Missing Assets",
  processing: "Processing Queue",
  "import-history": "Legacy Import",
  ...assetLibraryCategoryLabels
};

function isAssetProductionView(node: DamNodeId): node is AssetProductionView {
  return ["dashboard", "source", "generated", "published", "missing", "processing", "import-history"].includes(node);
}

function normalizeDamNode(value: unknown, fallback: DamNodeId): DamNodeId {
  const categoryId = normalizeAssetLibraryCategoryId(value);
  if (categoryId) return categoryId;
  if (typeof value === "string" && value in implementedNodeLabels) return value as DamNodeId;
  return fallback;
}

function treeItemClass(active: boolean) {
  return `flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-bold transition ${active ? "border border-cyan-300/30 bg-cyan-300/15 text-white" : "text-slate-400 hover:bg-cyan-300/10 hover:text-slate-100"}`;
}

function AssetProductionTree({ active, onSelect }: { active: DamNodeId; onSelect: (node: DamNodeId) => void }) {
  return (
    <aside className="rounded-md border border-cyan-300/15 bg-[#07101e]/90 p-3 shadow-glow">
      <div className="flex items-center gap-2 px-2 py-2">
        <Boxes className="h-4 w-4 text-cyan-200" />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Asset Library</p>
          <p className="text-xs text-slate-500">Content browser</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {damTree.map((item) => (
          <div key={item.id}>
            <button type="button" onClick={() => onSelect(item.id)} className={treeItemClass(active === item.id || Boolean(item.children?.some((child) => child.id === active)))}>
              <span>{item.label}</span>
              {item.children?.length ? <ChevronDown className="h-4 w-4" /> : null}
            </button>
            {item.children?.length ? (
              <div className="ml-3 mt-1 border-l border-cyan-300/10 pl-2">
                {item.children.map((child) => (
                  <button key={child.id} type="button" onClick={() => onSelect(child.id)} className={treeItemClass(active === child.id)}>
                    <span>{child.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}

function readBrowserImageSize(file: File) {
  if (!file.type.startsWith("image/") || file.type.includes("tiff")) return Promise.resolve(null);
  return new Promise<{ width: number; height: number } | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

function sizeLabel(size?: { width: number; height: number } | null) {
  return size ? `${size.width}x${size.height}` : "Pending inspection";
}

function compactSizeLabel(value: string) {
  return value === "Pending inspection" ? "Pending" : value;
}

function statusLabel(record: UpgradeCategoryAssetStatus) {
  if (record.status === "published") return "Published";
  if (record.approvalStatus === "approved") return "Approved";
  if (record.sourceFile) return "Needs Review";
  return "Missing";
}

function semanticAssetKey(record: UpgradeCategoryAssetStatus) {
  return record.semanticAssetKey;
}

function upgradeCategoryGridClass(settings: DensitySettings) {
  if (settings.density === "list") return "grid gap-2";
  if (settings.density === "large") return "grid gap-4 xl:grid-cols-2";
  return "grid gap-3 lg:grid-cols-2 2xl:grid-cols-4";
}

function upgradeCategoryPreviewClass(settings: DensitySettings) {
  if (settings.previewSize === "hide") return "hidden";
  if (settings.previewSize === "large") return "h-44";
  if (settings.previewSize === "medium") return "h-36";
  return "h-32";
}

function UpgradeCategoryUploadForm({
  record,
  onUploaded
}: {
  record: UpgradeCategoryAssetStatus;
  onUploaded: (categoryId: string, preview: LocalUploadPreview) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentSize, setCurrentSize] = useState<string>("No file selected");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!file) {
          setMessage("Choose a PNG, PSD, PSB, TIFF, or SVG source first.");
          return;
        }
        setBusy(true);
        setMessage("");
        const formData = new FormData();
        formData.set("categoryId", record.categoryId);
        formData.set("file", file);
        formData.set("sourceVersion", String(record.sourceFile ? Number(record.sourceFile.version) + 1 : 1));
        formData.set("approvalState", "Needs Review");
        formData.set("notes", `Designer upload from Asset Production DAM for ${record.displayName}.`);
        try {
          const response = await fetch("/api/assets/upgrade-category-background", { method: "POST", body: formData });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? "Upload failed.");
          if (previewUrl) onUploaded(record.categoryId, { url: previewUrl, sizeLabel: currentSize, fileName: file.name });
          setMessage(`Uploaded ${file.name}. Preview is available now; reload will show the persisted Studio record.`);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Upload failed.");
        } finally {
          setBusy(false);
        }
      }}
      className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"
    >
      <label className="flex cursor-pointer flex-col rounded-md border border-dashed border-cyan-300/30 bg-cyan-300/5 p-3 transition hover:border-cyan-300/60 hover:bg-cyan-300/10">
        <span className="flex items-center gap-2 text-sm font-black text-cyan-100"><Upload className="h-4 w-4" /> Upload Background</span>
        <span className="mt-1 text-xs leading-5 text-slate-400">PNG, PSD, PSB, TIFF, or SVG. Master target {upgradeCategoryBackgroundDimensions.masterWidth}x{upgradeCategoryBackgroundDimensions.masterHeight}.</span>
        <input
          type="file"
          accept=".png,.psd,.psb,.tiff,.tif,.svg,image/png,image/svg+xml,image/tiff"
          className="sr-only"
          onChange={async (event) => {
            const nextFile = event.currentTarget.files?.[0] ?? null;
            setFile(nextFile);
            setMessage("");
            if (!nextFile) {
              setPreviewUrl(null);
              setCurrentSize("No file selected");
              return;
            }
            const ext = nextFile.name.split(".").pop()?.toUpperCase() ?? "SOURCE";
            const canPreview = nextFile.type.startsWith("image/") && !nextFile.type.includes("tiff") && !["PSD", "PSB"].includes(ext);
            if (canPreview) {
              const url = URL.createObjectURL(nextFile);
              setPreviewUrl(url);
            } else {
              setPreviewUrl(null);
            }
            const imageSize = await readBrowserImageSize(nextFile);
            setCurrentSize(sizeLabel(imageSize));
          }}
        />
      </label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <WorkspaceMiniStat label="Required Size" value={`${record.expectedDimensions.masterWidth}x${record.expectedDimensions.masterHeight}`} />
        <WorkspaceMiniStat label="Current Size" value={currentSize} />
        <WorkspaceMiniStat label="Status" value={file ? "Ready to upload" : "Waiting"} />
        <WorkspaceMiniStat label="Transparency" value={record.transparencyRequired ? "Required" : "Optional"} />
      </div>
      {previewUrl ? (
        <div className="mt-3 overflow-hidden rounded-md border border-cyan-300/15 bg-black/30">
          <img src={previewUrl} alt={`${record.displayName} uploaded preview`} className="h-36 w-full object-cover" />
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" disabled={busy || !file}>{busy ? "Uploading..." : record.sourceFile ? "Replace Asset" : "Upload Asset"}</Button>
      </div>
      {message ? <p className="mt-3 text-sm leading-6 text-cyan-100">{message}</p> : null}
    </form>
  );
}

function UpgradeCategoryAssetCard({ record, localPreview, onUploaded, settings }: { record: UpgradeCategoryAssetStatus; localPreview?: LocalUploadPreview; onUploaded: (categoryId: string, preview: LocalUploadPreview) => void; settings: DensitySettings }) {
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState<string>("");
  const previewUrl = localPreview?.url ?? sanitizePreviewUrl(record.currentBackgroundPreview);
  const displayedSize = localPreview?.sizeLabel ?? sizeLabel(record.dimensions);
  const assetId = semanticAssetKey(record);

  async function runAction(label: string, body: Record<string, unknown>) {
    setBusy(label);
    setError("");
    try {
      await postProductionAction(body);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed.");
      setBusy("");
    }
  }

  async function generateDerivatives() {
    setBusy("Generate Derivatives");
    setError("");
    try {
      for (const presetId of upgradeCategoryBackgroundDerivativePresetIds) {
        await postProductionAction({ action: "derivative.generate", assetId, presetId, notes: `Queued ${record.displayName} upgrade background derivative.` }, { reload: false });
      }
      window.location.reload();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Derivative queue failed.");
      setBusy("");
    }
  }

  async function approveAndPublish() {
    setBusy("Approve + Publish");
    setError("");
    try {
      await postProductionAction({ action: "review.approve", assetId, reviewer: "studio", notes: `Approved semantic key ${assetId}.` }, { reload: false });
      await postProductionAction({
        action: "review.publish",
        assetId,
        reviewer: "studio",
        adminOverride: true,
        payload: { publicationTargets: ["web", "roblox", "ios", "android"] },
        notes: `Published semantic upgrade category background key ${assetId}.`
      });
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Publish failed.");
      setBusy("");
    }
  }

  return (
    <article className={`${cardShellClass(settings)} overflow-hidden`}>
      <div className="grid gap-3">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.64rem] font-black uppercase tracking-[0.2em] text-cyan-200">Upgrade Workspace</p>
              <h3 className="mt-1 truncate text-xl font-black text-white">{record.displayName}</h3>
              <p className="mt-1 truncate text-xs font-semibold text-cyan-100" title={assetId}>{assetId}</p>
            </div>
            <div className="shrink-0">
              <WorkspaceBadge value={statusLabel(record)} />
            </div>
          </div>
          <div className={`mt-4 overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/70 ${settings.previewSize === "hide" ? "hidden" : ""}`}>
            <div className={`relative bg-[radial-gradient(circle_at_35%_20%,rgba(103,232,249,0.22),transparent_26%),linear-gradient(135deg,rgba(8,14,28,0.95),rgba(2,6,23,0.98))] ${upgradeCategoryPreviewClass(settings)}`}>
              {previewUrl ? <img src={previewUrl} alt={`${record.displayName} upgrade category background preview`} className="absolute inset-0 h-full w-full object-cover" /> : null}
              <div className="absolute inset-[8%] border border-cyan-200/25" />
              <div className="absolute left-[6%] top-[7%] h-[10%] w-[38%] border border-emerald-200/35 bg-emerald-300/5" />
              <div className="absolute left-[7%] top-[23%] h-px w-[82%] bg-cyan-200/35" />
              {!previewUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
                  <ImageIcon className="h-6 w-6 text-slate-600" />
                  <p className="text-base font-black text-white">Background Needed</p>
                  <p className="max-w-[13rem] text-xs leading-5 text-slate-400">Upload or replace artwork to preview this panel.</p>
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <WorkspaceMiniStat label="Required Size" value={`${record.expectedDimensions.masterWidth}x${record.expectedDimensions.masterHeight}`} />
            <WorkspaceMiniStat label="Current Size" value={compactSizeLabel(displayedSize)} />
            <WorkspaceMiniStat label="Geometry" value={record.geometryConsistent ? "Matches" : localPreview ? "Check on save" : "Pending"} />
            {settings.density !== "compact" ? <WorkspaceMiniStat label="Web" value={record.webReady ? "Ready" : "Missing"} /> : null}
            {settings.density !== "compact" ? <WorkspaceMiniStat label="Roblox" value={record.robloxReady ? "Ready" : "Missing"} /> : null}
            {settings.density !== "compact" ? <WorkspaceMiniStat label="Derivatives" value={`${record.derivativeRequirements.length - record.missingDerivativeWarnings.length}/${record.derivativeRequirements.length}`} /> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" disabled={Boolean(busy)} onClick={generateDerivatives}><Sparkles className="h-4 w-4" /> Generate</Button>
            <Button type="button" disabled={Boolean(busy)} onClick={() => runAction("Approve", { action: "review.approve", assetId, reviewer: "studio", notes: `Approved ${record.displayName} category background.` })}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
            <Button type="button" disabled={Boolean(busy)} onClick={approveAndPublish}><PackageCheck className="h-4 w-4" /> Publish</Button>
            <Link href={`/assets/${encodeURIComponent(record.assetId ?? assetId)}?tab=history`} className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20"><History className="h-4 w-4" /> History</Link>
            <Link href={`/screen-designer/upgrades?category=${record.categoryId}&mode=visual-builder`} aria-label="Open in Visual Builder" title="Open in Visual Builder" className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20">Visual Builder</Link>
            <Link href="/screen-designer/upgrades" aria-label="Open in Screen Specification" title="Open in Screen Specification" className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20">Spec</Link>
          </div>
          {busy ? <p className="mt-3 text-sm font-semibold text-cyan-100">{busy}...</p> : null}
          {error ? <p className="mt-3 text-sm font-semibold text-rose-100">{error}</p> : null}
          {record.sourceFile ? <p className="mt-3 text-sm leading-6 text-slate-400">Source: {record.sourceFile.filename} / v{record.sourceFile.version} / {record.sourceFile.format}</p> : null}
        </div>
        {settings.density === "list" ? null : (
          <details className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Upload / Replace Background</summary>
            <div className="mt-3">
              <UpgradeCategoryUploadForm record={record} onUploaded={onUploaded} />
            </div>
          </details>
        )}
      </div>
    </article>
  );
}

function UpgradeCategoriesWorkspace({ state }: { state: AssetProductionState }) {
  const [localPreviews, setLocalPreviews] = useState<Record<string, LocalUploadPreview>>({});
  const [query, setQuery] = useState("");
  const [settings, setSettings] = useWorkspaceDensitySettings("project-genesis-density-upgrade-categories");
  const missing = state.upgradeCategoryAssets.filter((record) => !record.sourceFile).length;
  const approved = state.upgradeCategoryAssets.filter((record) => record.approvalStatus === "approved" || record.status === "published").length;
  const visible = state.upgradeCategoryAssets.filter((record) => {
    const needle = query.trim().toLowerCase();
    return !needle || [record.displayName, record.categoryId, record.semanticAssetKey, record.status].join(" ").toLowerCase().includes(needle);
  });

  return (
    <div className="space-y-5">
      <WorkspacePanel title="Upgrade Category Backgrounds" icon={Layers3}>
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Categories" value={state.upgradeCategoryAssets.length} />
          <WorkspaceStatTile label="Missing" value={missing} />
          <WorkspaceStatTile label="Approved" value={approved} />
          <WorkspaceStatTile label="Required Master" value={`${upgradeCategoryBackgroundDimensions.masterWidth}x${upgradeCategoryBackgroundDimensions.masterHeight}`} />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Designers can upload source backgrounds directly here. The Studio keeps the source private, queues the six runtime-ready derivative families, and publishes stable semantic keys for clients and the Visual Builder.
        </p>
      </WorkspacePanel>
      <CompactWorkspaceToolbar query={query} onQueryChange={setQuery} settings={settings} onSettingsChange={setSettings} resultCount={visible.length} totalCount={state.upgradeCategoryAssets.length} placeholder="Search upgrade category assets" />
      <div className={upgradeCategoryGridClass(settings)}>
        {visible.map((record) => (
          <UpgradeCategoryAssetCard
            key={record.categoryId}
            record={record}
            localPreview={localPreviews[record.categoryId]}
            onUploaded={(categoryId, preview) => setLocalPreviews((current) => ({ ...current, [categoryId]: preview }))}
            settings={settings}
          />
        ))}
      </div>
    </div>
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

function AssetCard({ asset, settings }: { asset: ProductionAsset; settings: DensitySettings }) {
  const preview = resolveProductionAssetPreview(asset, { size: "card", mode: asset.category.includes("hero") ? "hero" : "card" });
  if (settings.density === "list") {
    return (
      <Link href={`/assets/${encodeURIComponent(asset.id)}`} className={cardShellClass(settings)}>
        <div className={previewBoxClass(settings)}>
          <AssetPreview preview={{ ...preview, size: "small" }} allowFullscreen={false} compact />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{asset.name}</p>
          <p className="mt-1 truncate text-xs text-cyan-200">{asset.artKey || asset.iconKey || asset.id}</p>
        </div>
        <WorkspaceBadge value={asset.category || asset.type} />
        <WorkspaceBadge value={asset.productionStatus} />
        <p className="truncate text-xs text-slate-400">{asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : "Unknown"}</p>
        <p className="truncate text-xs text-slate-300">{asset.sourceFiles[0]?.versionLabel ?? "v1"} / {asset.publishedAt ? "Published" : asset.approvalStatus}</p>
      </Link>
    );
  }
  return (
    <Link href={`/assets/${encodeURIComponent(asset.id)}`} className={cardShellClass(settings)}>
      <div className={previewBoxClass(settings)}>
        <AssetPreview preview={{ ...preview, size: settings.previewSize === "large" ? "large" : "small" }} allowFullscreen={false} compact={settings.density === "compact"} />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`truncate font-black text-white ${settings.density === "compact" ? "text-base" : "text-lg"}`}>{asset.name}</p>
          <p className="mt-1 truncate text-sm text-cyan-200">{asset.artKey || asset.iconKey || asset.id}</p>
        </div>
        <WorkspaceBadge value={asset.productionStatus} />
      </div>
      <div className={settings.density === "compact" ? "mt-3 hidden" : "mt-4"}>
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>Completion</span>
          <span>{asset.completionPercent}%</span>
        </div>
        <WorkspaceProgressBar value={asset.completionPercent} className="mt-2" />
      </div>
      <div className={`mt-3 grid gap-2 ${settings.density === "compact" ? "grid-cols-2" : "grid-cols-3"}`}>
        <WorkspaceMiniStat label="Source" value={asset.sourceFiles.length} />
        <WorkspaceMiniStat label="Deriv." value={asset.derivatives.length} />
        {settings.density !== "compact" ? <WorkspaceMiniStat label="Engines" value={platformCount(asset)} /> : null}
      </div>
      <div className={settings.density === "compact" ? "mt-3 hidden" : "mt-3 flex flex-wrap gap-2"}>
        <WorkspaceBadge value={`master ${asset.masterSourceStatus}`} />
        <WorkspaceBadge value={`${asset.derivativeCompleteness.current}/${asset.derivativeCompleteness.required} current`} />
        <WorkspaceBadge value={`preview ${preview.status}`} />
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
      <WorkspacePanel title="Legacy Migration Reports" icon={GitBranch}>
        <p className="text-sm leading-6 text-slate-400">No internal legacy migration reports have been recorded yet.</p>
      </WorkspacePanel>
    );
  }

  return (
    <WorkspacePanel title="Legacy Migration Reports" icon={GitBranch}>
      <div className="grid gap-3 sm:grid-cols-3">
        <WorkspaceMiniStat label="Uploaded" value={report.importedAssets} />
        <WorkspaceMiniStat label="Matched" value={report.matchedAssets} />
        <WorkspaceMiniStat label="New" value={report.newAssets} />
        <WorkspaceMiniStat label="Sources" value={report.sourceFilesCreated} />
        <WorkspaceMiniStat label="Placeholders" value={report.placeholderAssets.length} />
        <WorkspaceMiniStat label="Conflicts" value={report.conflicts.length} />
      </div>
      <details className="mt-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
        <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-slate-400">Developer Details</summary>
        <p className="mt-3 break-all text-xs leading-5 text-slate-500">{report.manifestPath || report.sourceRoot}</p>
      </details>
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
  const uiCategoryIds: InventoryItem["categoryId"][] = ["top-hud", "left-navigation", "upgrade-categories", "research-ui", "buildings-ui", "galaxy-ui", "planet-ui", "settings-ui", "login-ui", "loading-ui"];
  const uiSummaries = uiCategoryIds.map((id) => state.assetLibraryInventory.categorySummaries[id]);
  const uiTotal = uiSummaries.reduce((sum, row) => sum + row.total, 0);
  const uiMissing = uiSummaries.reduce((sum, row) => sum + row.missing, 0);
  const uiPublished = uiSummaries.reduce((sum, row) => sum + row.published, 0);
  const screensWithMissingAssets = new Set(state.assetLibraryInventory.items.filter((item) => item.status === "missing").flatMap((item) => item.referencedByScreens.map((reference) => reference.id))).size;
  const componentsWithMissingAssets = new Set(state.assetLibraryInventory.items.filter((item) => item.status === "missing").flatMap((item) => item.referencedByComponents.map((reference) => reference.id))).size;
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
            <WorkspaceStatTile label="Visual Records" value={state.dashboard.visualRecords} />
            <WorkspaceStatTile label="Preview Ready" value={state.dashboard.previewReady} />
            <WorkspaceStatTile label="Preview Missing" value={state.dashboard.previewMissing} />
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Asset Library Inventory" icon={Boxes}>
          <div className="grid gap-3 md:grid-cols-3">
            <WorkspaceStatTile label="UI Assets Total" value={uiTotal} />
            <WorkspaceStatTile label="Missing UI Assets" value={uiMissing} />
            <WorkspaceStatTile label="Published UI Assets" value={uiPublished} />
            <WorkspaceStatTile label="Uncategorized" value={state.assetLibraryInventory.unmappedAssets.length} />
            <WorkspaceStatTile label="Screens Missing Assets" value={screensWithMissingAssets} />
            <WorkspaceStatTile label="Components Missing Assets" value={componentsWithMissingAssets} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/asset-library?section=top-hud" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Top HUD</Link>
            <Link href="/asset-library?section=research-ui" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Research UI</Link>
            <Link href="/asset-library?section=buildings-ui" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Buildings UI</Link>
            <Link href="/asset-library?section=unmapped" className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Unmapped</Link>
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Visual Preview Readiness" icon={ImageIcon}>
          <div className="grid gap-3 md:grid-cols-3">
            <WorkspaceMiniStat label="Ready" value={state.visualPreviewReport.previewReady} />
            <WorkspaceMiniStat label="Missing" value={state.visualPreviewReport.previewMissing} />
            <WorkspaceMiniStat label="Stale" value={state.visualPreviewReport.previewStale} />
            <WorkspaceMiniStat label="Approved" value={state.visualPreviewReport.approvedPreview} />
            <WorkspaceMiniStat label="Published" value={state.visualPreviewReport.publishedPreview} />
            <WorkspaceMiniStat label="Low Res" value={state.visualPreviewReport.lowResolution} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {state.visualPreviewReport.issues.slice(0, 8).map((issue) => (
              <div key={issue.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-white">{issue.title}</p>
                  <WorkspaceBadge value={issue.status} />
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">{issue.objectType} / {issue.action}</p>
              </div>
            ))}
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

        <WorkspacePanel title="Recent Uploads" icon={History}>
          <div className="space-y-2">
            {state.importHistory.slice(0, 5).map((entry) => (
              <div key={entry.importId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <p className="font-black text-white">{entry.sourceProject}</p>
                <p className="mt-1 text-sm text-slate-400">Created {entry.createdAssets} / Updated {entry.updatedAssets}</p>
              </div>
            ))}
            {!state.importHistory.length ? <p className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-300">No upload history recorded yet.</p> : null}
          </div>
        </WorkspacePanel>

        <RobloxManifestReport state={state} />
      </aside>
    </div>
  );
}

function AssetGrid({ assets, empty, storageKey }: { assets: ProductionAsset[]; empty: string; storageKey: string }) {
  const [query, setQuery] = useState("");
  const [settings, setSettings] = useWorkspaceDensitySettings(storageKey);
  const visibleAssets = assets.filter((asset) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [asset.name, asset.id, asset.artKey, asset.iconKey, asset.category, asset.productionStatus, asset.tags.join(" ")].join(" ").toLowerCase().includes(needle);
  });

  return assets.length ? (
    <div className="space-y-4">
      <CompactWorkspaceToolbar query={query} onQueryChange={setQuery} settings={settings} onSettingsChange={setSettings} resultCount={visibleAssets.length} totalCount={assets.length} placeholder="Search assets, art keys, categories, status" />
      <div className={collectionGridClass(settings)}>
        {visibleAssets.slice(0, 48).map((asset) => <AssetCard key={asset.id} asset={asset} settings={settings} />)}
      </div>
      {visibleAssets.length > 48 ? <p className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-300">Showing first 48 assets for grid performance. Use filters or detail pages for deeper inspection.</p> : null}
    </div>
  ) : (
    <WorkspacePanel>
      <p className="text-sm font-semibold text-slate-300">{empty}</p>
    </WorkspacePanel>
  );
}

type InventoryItem = AssetProductionState["assetLibraryInventory"]["items"][number];
type InventoryStatus = InventoryItem["status"];

const inventoryStatusFilters: Array<"all" | InventoryStatus> = ["all", "missing", "uploaded", "needs_review", "approved", "published", "invalid", "unmapped"];

function inventoryStatusClass(status: InventoryStatus) {
  if (status === "published") return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  if (status === "approved") return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
  if (status === "uploaded" || status === "needs_review") return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  if (status === "invalid") return "border-rose-300/30 bg-rose-400/10 text-rose-100";
  if (status === "unmapped") return "border-slate-500/40 bg-slate-500/10 text-slate-200";
  return "border-rose-300/30 bg-rose-400/10 text-rose-100";
}

function uploadHrefForInventoryItem(item: InventoryItem) {
  const params = new URLSearchParams({
    upload: "asset",
    category: item.categoryPath.split("/").pop()?.trim() ?? item.categoryId,
    role: item.role,
    assetKey: item.semanticAssetKey,
    name: item.displayName,
    requiredDimensions: item.requiredDimensions
  });
  if (item.requirementId) params.set("requirement", item.requirementId);
  return `/asset-library?${params.toString()}`;
}

function InventoryCard({ item, settings }: { item: InventoryItem; settings: DensitySettings }) {
  const usageCount = item.referencedByScreens.length + item.referencedByComponents.length + item.referencedByPlaceholders.length;
  const linkedAssetHref = item.sourceAssetId ? `/assets/${encodeURIComponent(item.sourceAssetId)}` : uploadHrefForInventoryItem(item);
  if (settings.density === "list") {
    return (
      <article className={`${cardShellClass(settings)} text-left`}>
        <div className={previewBoxClass(settings)}>
          {item.previewUrl ? <img src={item.previewUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-slate-500" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{item.displayName}</p>
          <p className="truncate text-xs text-cyan-200">{item.semanticAssetKey}</p>
        </div>
        <span className={`rounded-md border px-2 py-1 text-xs font-black uppercase tracking-[0.12em] ${inventoryStatusClass(item.status)}`}>{item.status.replaceAll("_", " ")}</span>
        <p className="truncate text-xs text-slate-400">{item.role}</p>
        <p className="truncate text-xs text-slate-300">{usageCount} usage</p>
      </article>
    );
  }

  return (
    <article className={cardShellClass(settings)}>
      <div className="block w-full text-left">
        <div className={previewBoxClass(settings)}>
          {item.previewUrl ? <img src={item.previewUrl} alt="" className="h-full w-full object-cover" /> : (
            <div className="grid h-full place-items-center bg-slate-950/60">
              <ImageIcon className="h-7 w-7 text-slate-500" />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{item.displayName}</p>
            <p className="mt-1 truncate text-xs text-cyan-200">{item.semanticAssetKey}</p>
          </div>
          <span className={`shrink-0 rounded-md border px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] ${inventoryStatusClass(item.status)}`}>{item.status.replaceAll("_", " ")}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <WorkspaceMiniStat label="Role" value={item.role} />
          <WorkspaceMiniStat label="Usage" value={usageCount} />
          {settings.density !== "compact" ? <WorkspaceMiniStat label="Required" value={item.requiredDimensions} /> : null}
          {settings.density !== "compact" ? <WorkspaceMiniStat label="Current" value={item.currentDimensions} /> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={uploadHrefForInventoryItem(item)} className="inline-flex h-9 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">{item.status === "missing" ? "Upload Asset" : "New Version"}</Link>
        <Link href={linkedAssetHref} className="inline-flex h-9 items-center rounded-md border border-slate-600 bg-slate-950/40 px-3 text-sm font-bold text-slate-200">{item.sourceAssetId ? "Open Record" : "Upload Details"}</Link>
      </div>
    </article>
  );
}

function AssetLibraryCategoryInventory({ state, categoryId }: { state: AssetProductionState; categoryId: InventoryItem["categoryId"] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InventoryStatus>("all");
  const [settings, setSettings] = useWorkspaceDensitySettings(`project-genesis-density-asset-library-${categoryId}`);
  const allItems = state.assetLibraryInventory.items.filter((item) => item.categoryId === categoryId);
  const summary = state.assetLibraryInventory.categorySummaries[categoryId];
  const visible = allItems.filter((item) => {
    const needle = query.trim().toLowerCase();
    const text = [
      item.displayName,
      item.semanticAssetKey,
      item.role,
      item.status,
      item.categoryPath,
      item.referencedByScreens.map((reference) => reference.name).join(" "),
      item.referencedByComponents.map((reference) => reference.name).join(" ")
    ].join(" ").toLowerCase();
    return (statusFilter === "all" || item.status === statusFilter) && (!needle || text.includes(needle));
  });
  return (
    <div className="space-y-5">
      <WorkspacePanel title={summary?.label ?? implementedNodeLabels[categoryId]} icon={ImageIcon}>
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceStatTile label="Assets" value={summary?.total ?? 0} />
          <WorkspaceStatTile label="Missing" value={summary?.missing ?? 0} />
          <WorkspaceStatTile label="Needs Review" value={summary?.needsReview ?? 0} />
          <WorkspaceStatTile label="Published" value={summary?.published ?? 0} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <WorkspaceMiniStat label="Screen refs" value={summary?.screenReferences ?? 0} />
          <WorkspaceMiniStat label="Component refs" value={summary?.componentReferences ?? 0} />
          <WorkspaceMiniStat label="Builder placeholders" value={summary?.placeholderReferences ?? 0} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/asset-library?upload=asset&category=${encodeURIComponent(summary?.label ?? categoryId)}`} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Upload Asset</Link>
          <Button type="button">Generate Missing Requirements</Button>
          <WorkspaceBadge value="All statuses shown" />
        </div>
      </WorkspacePanel>
      <div className="flex flex-wrap gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-2">
        {inventoryStatusFilters.map((status) => (
          <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${statusFilter === status ? "bg-cyan-300/20 text-white" : "text-slate-400 hover:bg-cyan-300/10 hover:text-slate-100"}`}>
            {status.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <CompactWorkspaceToolbar query={query} onQueryChange={setQuery} settings={settings} onSettingsChange={setSettings} resultCount={visible.length} totalCount={allItems.length} placeholder="Search display name, semantic key, role, screen, component, status" />
      <div className={collectionGridClass(settings)}>
        {visible.map((item) => <InventoryCard key={item.id} item={item} settings={settings} />)}
      </div>
    </div>
  );
}

function SourceFiles({ state }: { state: AssetProductionState }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {state.sourceFiles.map((source) => (
        <WorkspacePanel key={source.id} title={source.filename} icon={FileImage}>
          <AssetPreview preview={{
            id: `${source.assetId}:${source.id}`,
            objectId: source.assetId,
            objectType: "source",
            title: source.filename,
            status: source.previewStatus === "ready" ? "Generated" : source.previewStatus === "failed" ? "Error" : source.previewStatus === "manual_required" ? "Pending Generation" : "Missing",
            mode: "thumbnail",
            size: "card",
            url: sanitizePreviewUrl(source.previewUrl),
            alt: `${source.filename} source preview`,
            source: sanitizePreviewUrl(source.previewUrl) ? "source_preview" : "missing",
            mimeType: source.mimeType.startsWith("video/") ? "video" : source.mimeType.startsWith("audio/") ? "audio" : source.mimeType === "image/svg+xml" ? "svg" : source.mimeType.startsWith("image/") ? "image" : "unknown",
            width: source.width ?? null,
            height: source.height ?? null,
            format: source.masterFormat ?? source.extension,
            sourceVersion: source.versionLabel,
            approvalStatus: "studio-only",
            publishStatus: "private-source",
            dimensionsLabel: source.width && source.height ? `${source.width}x${source.height}` : "Dimensions pending",
            metadata: [{ label: "Source", value: source.sourceRole ?? "source" }, { label: "Preview", value: source.previewStatus ?? "missing" }],
            safeForPublicRuntime: false,
            sanitized: !sanitizePreviewUrl(source.previewUrl)
          }} />
          <div className="grid gap-3 sm:grid-cols-3">
            <WorkspaceMiniStat label="Version" value={source.versionLabel} />
            <WorkspaceMiniStat label="Format" value={source.masterFormat ?? (source.extension || "source")} />
            <WorkspaceMiniStat label="Current" value={source.isCurrent ? "Yes" : "No"} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <WorkspaceBadge value={source.sourceRole ?? "source"} />
            <WorkspaceBadge value={source.previewStatus ?? "preview pending"} />
          </div>
          <details className="mt-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-slate-400">Developer Details</summary>
            <p className="mt-3 break-all text-sm leading-6 text-slate-400">{source.storagePath || "Private Studio storage pending."}</p>
          </details>
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
        const preview = resolveMissingRequirementPreview(item, linkedAsset);
        return (
          <div key={item.id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
            <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
              <AssetPreview preview={preview} allowFullscreen={Boolean(preview.url)} />
              <div className="min-w-0">
                <div className="grid gap-3 md:grid-cols-[1fr_9rem_9rem_7rem] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-white">{item.objectName}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.objectType.replaceAll("_", " ")} / {item.requiredDerivative} / {item.artKey}</p>
                  </div>
                  <WorkspaceBadge value={item.currentStatus} />
                  <WorkspaceBadge value={item.priority} />
                  <p className="text-sm font-black text-cyan-100">{item.completionPercent}%</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {linkedAsset ? <Link href={`/assets/${encodeURIComponent(linkedAsset.id)}`} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Open Asset</Link> : null}
              <Link href={linkedAsset ? `/assets/${encodeURIComponent(linkedAsset.id)}?tab=source_files` : "/asset-library?upload=asset"} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Upload Asset</Link>
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
              <WorkspaceMiniStat label="Uploaded" value={report.importedAssets} />
                <WorkspaceMiniStat label="Matched" value={report.matchedAssets} />
                <WorkspaceMiniStat label="New" value={report.newAssets} />
                <WorkspaceMiniStat label="Placeholders" value={report.placeholderAssets.length} />
                <WorkspaceMiniStat label="Unused Studio" value={report.unusedStudioAssets.length} />
                <WorkspaceMiniStat label="Unused Local" value={report.unusedLocalFiles.length} />
              </div>
            </div>
          ))}
          {!state.robloxManifestReports.length ? <p className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-300">No legacy migration reports yet.</p> : null}
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

export function AssetProductionWorkspace({ state, view, preferredRoute = "/asset-library", initialSection }: { state: AssetProductionState; view: AssetProductionView; preferredRoute?: string; initialSection?: string | null }) {
  const defaultNode: DamNodeId = preferredRoute === "/asset-library" && view === "dashboard" ? "all-assets" : view;
  const routeNode = normalizeDamNode(initialSection, defaultNode);
  const [activeNode, setActiveNode] = useState<DamNodeId>(routeNode);
  const [uploadOpen, setUploadOpen] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("upload") === "asset");
  const pickerMode = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("picker") : null;
  const deprecated = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("deprecated") : null;
  const categoryRoute = useMemo(() => resolveAssetLibraryCategoryView(activeNode), [activeNode]);
  const meta = isAssetProductionView(activeNode) ? viewMeta[activeNode] : {
    eyebrow: "Asset Library",
    title: implementedNodeLabels[activeNode],
    description: activeNode === "upgrade-categories"
      ? "Designer-facing DAM workflow for the Workforce, Industry, Science, and Technology upgrade panel backgrounds."
      : "Upload, organize, approve, and publish game assets through a compact content browser."
  };
  const stats = [
    { label: "Assets", value: state.dashboard.totalAssets },
    { label: "Source Files", value: state.dashboard.sourceFilesUploaded },
    { label: "Missing", value: state.dashboard.missingAssets },
    { label: "Published", value: state.dashboard.published }
  ];

  function selectNode(node: DamNodeId) {
    const nextNode = normalizeDamNode(node, defaultNode);
    setActiveNode(nextNode);
    if (typeof window !== "undefined") {
      const path = nextNode === "all-assets" ? preferredRoute : `${preferredRoute}?section=${encodeURIComponent(nextNode)}`;
      window.history.replaceState(null, "", path);
    }
  }

  useEffect(() => {
    setActiveNode(routeNode);
  }, [routeNode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function syncFromLocation() {
      const section = new URLSearchParams(window.location.search).get("section");
      setActiveNode(normalizeDamNode(section, defaultNode));
    }
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [defaultNode]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const diagnostic = {
      routeCategoryId: initialSection ?? null,
      normalizedCategoryId: categoryRoute.categoryId,
      resolvedCategoryViewType: categoryRoute.viewType,
      selectedRenderer: categoryRoute.viewType,
      hydrationState: "mounted",
      persistedSettingsLoaded: "presentation-settings-only",
      inventoryReadiness: state.assetLibraryInventory.items.length > 0 ? "ready" : "empty",
      reason: categoryRoute.reason
    };
    console.debug("[asset-library-category-routing]", diagnostic);
  }, [categoryRoute, initialSection, state.assetLibraryInventory.items.length]);

  return (
    <main className="space-y-6">
      <WorkspaceHeader eyebrow={meta.eyebrow} title={meta.title} description={meta.description} stats={stats} />
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3 shadow-glow">
        <Button type="button" onClick={() => setUploadOpen((value) => !value)} className="h-10">
          <UploadCloud className="h-4 w-4" />
          Upload Asset
        </Button>
        <Link href={`${preferredRoute}?section=upgrade-categories`} onClick={(event) => { event.preventDefault(); selectNode("upgrade-categories"); }} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Upgrade Categories</Link>
        <Link href={`${preferredRoute}?section=missing`} onClick={(event) => { event.preventDefault(); selectNode("missing"); }} className="inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Missing Assets</Link>
        {pickerMode ? <WorkspaceBadge value={`Picker: ${pickerMode}`} /> : null}
        {deprecated ? <WorkspaceBadge value="Moved to Asset Library" /> : null}
      </div>
      <UploadAssetWorkflow open={uploadOpen} onClose={() => setUploadOpen(false)} />
      {pickerMode ? (
        <WorkspacePanel title="Asset Library Picker" icon={Search}>
          <p className="text-sm leading-6 text-slate-300">Search, filter, preview, and select a published asset. Placeholder replacement preserves geometry, layer order, bindings, and interactions in the calling screen or component.</p>
        </WorkspacePanel>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <AssetProductionTree active={activeNode} onSelect={selectNode} />
        <section className="min-w-0 space-y-5">
          {isAssetProductionView(activeNode) ? <AssetNav active={activeNode} preferredRoute={preferredRoute} /> : null}
          {activeNode === "all-assets" ? <AssetGrid assets={state.assets} empty="No assets here yet. Upload artwork or create an asset requirement to get started." storageKey="project-genesis-density-asset-library-all" /> : null}
          {activeNode === "recently-uploaded" ? <AssetGrid assets={[...state.assets].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, 48)} empty="No recent uploads yet. Upload artwork or create an asset requirement to get started." storageKey="project-genesis-density-asset-library-recent" /> : null}
          {activeNode === "needs-review" ? <AssetGrid assets={state.assets.filter((asset) => asset.approvalStatus !== "approved" && asset.productionStatus !== "published")} empty="No assets need review." storageKey="project-genesis-density-asset-library-review" /> : null}
          {activeNode === "approved-assets" ? <AssetGrid assets={state.assets.filter((asset) => asset.approvalStatus === "approved")} empty="No approved assets yet." storageKey="project-genesis-density-asset-library-approved" /> : null}
          {activeNode === "dashboard" ? <Dashboard state={state} /> : null}
          {activeNode === "source" ? <SourceFiles state={state} /> : null}
          {activeNode === "generated" ? <AssetGrid assets={state.generatedAssets} empty="No generated derivatives are available yet." storageKey="project-genesis-density-assets-generated" /> : null}
          {activeNode === "published" ? <AssetGrid assets={state.publishedAssets} empty="No assets have reached published status yet." storageKey="project-genesis-density-assets-published" /> : null}
          {activeNode === "missing" ? <MissingAssets state={state} /> : null}
          {activeNode === "processing" ? <ProcessingQueue state={state} /> : null}
          {activeNode === "import-history" ? <ImportHistory state={state} /> : null}
          {categoryRoute.viewType === "upgrade_category_workflow" ? <UpgradeCategoriesWorkspace state={state} /> : null}
          {categoryRoute.viewType === "generic_inventory" && categoryRoute.categoryId ? <AssetLibraryCategoryInventory state={state} categoryId={categoryRoute.categoryId} /> : null}
          {["ai_agent_workflow", "audio_workflow", "video_workflow"].includes(categoryRoute.viewType) && categoryRoute.categoryId ? <AssetLibraryCategoryInventory state={state} categoryId={categoryRoute.categoryId} /> : null}
        </section>
      </div>
      <WorkspacePanel title="Workflow Guardrails" icon={Archive}>
        <p className="text-sm leading-6 text-slate-300">
          Source masters stay private, public runtime exports only receive sanitized derivative metadata and engine mappings, and canonical gameplay records continue to reference artKey, iconKey, audioKey, or modelKey.
        </p>
      </WorkspacePanel>
    </main>
  );
}
