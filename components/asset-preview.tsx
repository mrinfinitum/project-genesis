"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, FileImage, ImageIcon, Maximize2, Search, X, ZoomIn, ZoomOut } from "lucide-react";
import { WorkspaceBadge, WorkspaceMiniStat } from "@/components/ui/workspace";
import type { PreviewMode, PreviewSize, VisualPreview } from "@/lib/assets/visual-previews";
import { cn } from "@/lib/utils";

const sizeClass: Record<PreviewSize, string> = {
  tiny: "h-16",
  small: "h-32",
  card: "aspect-[16/10]",
  large: "aspect-video min-h-72",
  hero: "aspect-[21/9] min-h-80",
  fullscreen: "h-[80vh]"
};

const modeLabel: Record<PreviewMode, string> = {
  thumbnail: "Thumbnail",
  card: "Card Preview",
  hero: "Hero Preview",
  icon: "Icon Preview",
  panel: "Panel Preview",
  screenshot: "Screenshot",
  state_comparison: "State Comparison",
  variant_grid: "Variant Grid",
  before_after: "Before / After",
  overlay_comparison: "Overlay Comparison"
};

function MissingPreview({ preview }: { preview: VisualPreview }) {
  const label = preview.status === "Error" ? "Preview Error" : preview.status === "Pending Generation" ? "Preview Pending" : preview.source === "placeholder" ? "Preview Placeholder" : "Artwork Needed";
  return (
    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(15,23,42,0.96))] p-4 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
          {preview.status === "Error" ? <AlertTriangle className="h-6 w-6 text-amber-100" /> : <ImageIcon className="h-6 w-6 text-cyan-100" />}
        </div>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">{label}</p>
        <p className="mt-2 text-sm font-semibold text-slate-300">{preview.requirement?.label ?? "Visual required"}</p>
        <p className="mt-1 text-xs text-slate-500">{preview.requirement?.dimensions ?? preview.dimensionsLabel} / {preview.requirement?.format ?? preview.format}</p>
      </div>
    </div>
  );
}

function PreviewMedia({ preview, className = "" }: { preview: VisualPreview; className?: string }) {
  if (!preview.url || preview.sanitized || preview.status === "Missing" || preview.source === "placeholder") return <MissingPreview preview={preview} />;
  if (preview.mimeType === "video") return <video src={preview.url} controls preload="metadata" className={cn("h-full w-full object-contain", className)} />;
  if (preview.mimeType === "audio") {
    return (
      <div className={cn("grid h-full w-full place-items-center bg-slate-950/80 p-4", className)}>
        <FileImage className="h-10 w-10 text-cyan-200" />
        <audio src={preview.url} controls preload="metadata" className="mt-4 w-full" />
      </div>
    );
  }
  return <img src={preview.url} alt={preview.alt} loading="lazy" decoding="async" width={preview.width ?? 512} height={preview.height ?? 320} className={cn("h-full w-full object-cover", className)} />;
}

export function PreviewModal({ preview, onClose }: { preview: VisualPreview | null; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "+" || event.key === "=") setZoom((value) => Math.min(3, value + 0.25));
      if (event.key === "-") setZoom((value) => Math.max(0.5, value - 0.25));
    }
    if (preview) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, preview]);

  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-50 grid bg-slate-950/90 backdrop-blur">
      <div className="grid min-h-0 grid-rows-[auto_1fr]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-300/15 bg-slate-950/80 p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">{modeLabel[preview.mode]}</p>
            <h2 className="text-xl font-black text-white">{preview.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setZoom(1)} className="h-10 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">Fit</button>
            <button type="button" onClick={() => setZoom(1)} className="h-10 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">100%</button>
            <button type="button" onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))} className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
            <button type="button" onClick={() => setZoom((value) => Math.min(3, value + 0.25))} className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
            {preview.url && preview.safeForPublicRuntime ? <a href={preview.url} className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100" aria-label="Open approved derivative"><ExternalLink className="h-4 w-4" /></a> : null}
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-slate-600 bg-slate-900 text-slate-100" aria-label="Close preview"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="grid min-h-0 gap-4 overflow-hidden p-4 xl:grid-cols-[1fr_22rem]">
          <div className="overflow-auto rounded-md border border-cyan-300/15 bg-black/40">
            <div className="grid min-h-full place-items-center p-6">
              <div style={{ transform: `scale(${zoom})` }} className="max-h-full max-w-full origin-center transition-transform">
                <PreviewMedia preview={preview} className="max-h-[72vh] rounded-md object-contain" />
              </div>
            </div>
          </div>
          <aside className="overflow-auto rounded-md border border-cyan-300/15 bg-[#07101e]/95 p-4">
            <div className="flex flex-wrap gap-2">
              <WorkspaceBadge value={preview.status} />
              <WorkspaceBadge value={preview.source.replaceAll("_", " ")} />
              <WorkspaceBadge value={preview.format} />
            </div>
            <div className="mt-4 grid gap-2">
              <WorkspaceMiniStat label="Dimensions" value={preview.dimensionsLabel} />
              <WorkspaceMiniStat label="Version" value={preview.sourceVersion} />
              <WorkspaceMiniStat label="Approval" value={preview.approvalStatus} />
              <WorkspaceMiniStat label="Publish" value={preview.publishStatus} />
            </div>
            {preview.metadata.length ? (
              <div className="mt-4 grid gap-2">
                {preview.metadata.map((item) => <WorkspaceMiniStat key={`${item.label}-${item.value}`} label={item.label} value={item.value} />)}
              </div>
            ) : null}
            {preview.requirement ? (
              <a href={preview.requirement.actionHref} className="mt-4 inline-flex h-10 items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
                {preview.requirement.actionLabel}
              </a>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}

export function AssetPreview({
  preview,
  className,
  allowFullscreen = true,
  compact = false
}: {
  preview: VisualPreview;
  className?: string;
  allowFullscreen?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("group relative overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/60", sizeClass[preview.size], className)}>
      <PreviewMedia preview={preview} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
        <p className="truncate text-sm font-black text-white">{preview.title}</p>
        {!compact ? <p className="mt-1 truncate text-xs font-semibold text-cyan-100">{preview.sourceVersion} / {preview.dimensionsLabel}</p> : null}
      </div>
      <div className="absolute left-2 top-2 flex flex-wrap gap-1">
        <span className="rounded border border-cyan-300/20 bg-slate-950/75 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-cyan-100">{preview.status}</span>
      </div>
      {allowFullscreen ? (
        <button type="button" onClick={() => setOpen(true)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-md border border-cyan-300/20 bg-slate-950/75 text-cyan-100 opacity-0 transition hover:bg-cyan-300/15 group-hover:opacity-100" aria-label={`Open ${preview.title} preview`}>
          <Maximize2 className="h-4 w-4" />
        </button>
      ) : null}
      {preview.status === "Missing" ? (
        <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-md border border-amber-300/25 bg-amber-400/10 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-amber-100">
          <Search className="h-3 w-3" />
          Needed
        </div>
      ) : null}
      <PreviewModal preview={open ? preview : null} onClose={() => setOpen(false)} />
    </div>
  );
}
