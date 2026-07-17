"use client";

import Link from "next/link";
import { useState } from "react";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";

export type GeneratedLibraryCardTone = "galaxy" | "sector" | "system" | "star" | "planet" | "discovery" | "civilization" | "building" | "research" | "neutral";

export type GeneratedLibraryCardRecord = {
  id: string;
  name: string;
  type: string;
  classification?: string;
  parent?: string;
  contains?: string;
  status: string;
  href: string;
  tone?: GeneratedLibraryCardTone;
  thumbnailUrl?: string;
  thumbnailAvifUrl?: string;
  thumbnailWebpUrl?: string;
  thumbnailSrcSet?: string;
  mediumPreviewUrl?: string;
  focalPoint?: string;
};

export type LibraryCardArtworkResolution = {
  sourceAssetId: string;
  thumbnail: {
    url?: string;
    avifUrl?: string;
    webpUrl?: string;
    srcSet?: string;
  };
  quickPreviewUrl?: string;
  focalPoint: string;
  altText: string;
  status: "resolved" | "fallback" | "missing";
  fallbackReason: "published_thumbnail" | "canonical_derivative" | "type_fallback" | "missing_art";
};

const toneClasses: Record<GeneratedLibraryCardTone, string> = {
  galaxy: "from-indigo-400/30 via-cyan-300/15 to-fuchsia-300/20",
  sector: "from-cyan-300/25 via-slate-700/20 to-blue-500/20",
  system: "from-amber-300/25 via-cyan-300/10 to-slate-800/20",
  star: "from-amber-200/45 via-orange-300/20 to-slate-900/20",
  planet: "from-emerald-300/25 via-cyan-300/10 to-blue-500/20",
  discovery: "from-violet-300/25 via-cyan-300/10 to-slate-900/20",
  civilization: "from-rose-300/20 via-cyan-300/10 to-amber-300/15",
  building: "from-teal-300/25 via-cyan-300/10 to-slate-900/20",
  research: "from-sky-300/25 via-cyan-300/10 to-indigo-500/15",
  neutral: "from-cyan-300/20 via-slate-700/20 to-slate-950/20"
};

export function resolveLibraryCardArtwork(record: GeneratedLibraryCardRecord): LibraryCardArtworkResolution {
  const hasThumbnail = Boolean(record.thumbnailUrl || record.thumbnailAvifUrl || record.thumbnailWebpUrl || record.thumbnailSrcSet);
  const hasPreview = Boolean(record.mediumPreviewUrl);
  const thumbnailUrl = record.thumbnailUrl ?? record.thumbnailWebpUrl ?? record.thumbnailAvifUrl ?? record.mediumPreviewUrl;
  const status = hasThumbnail ? "resolved" : hasPreview ? "fallback" : "missing";
  return {
    sourceAssetId: record.id,
    thumbnail: {
      url: thumbnailUrl,
      avifUrl: record.thumbnailAvifUrl,
      webpUrl: record.thumbnailWebpUrl,
      srcSet: record.thumbnailSrcSet
    },
    quickPreviewUrl: record.mediumPreviewUrl,
    focalPoint: record.focalPoint ?? "center",
    altText: `${record.name} ${record.type} thumbnail`,
    status,
    fallbackReason: hasThumbnail ? "published_thumbnail" : hasPreview ? "canonical_derivative" : "missing_art"
  };
}

function statusClass(status: string) {
  if (/ready|published|approved|generated|active|complete/i.test(status)) return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  if (/invalid|broken|blocked|missing/i.test(status)) return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  return "border-amber-300/35 bg-amber-400/10 text-amber-100";
}

function MetadataField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="min-w-0 rounded-md border border-cyan-300/10 bg-slate-950/35 px-3 py-2" title={value}>
      <p className="truncate text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 truncate break-all text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}

function CardThumbnail({ record, hovered }: { record: GeneratedLibraryCardRecord; hovered: boolean }) {
  const tone = record.tone ?? "neutral";
  const artwork = resolveLibraryCardArtwork(record);
  const imageUrl = hovered && artwork.quickPreviewUrl ? artwork.quickPreviewUrl : artwork.thumbnail.url;
  const useThumbnailSources = !hovered || !artwork.quickPreviewUrl;
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-md border border-cyan-300/15 bg-gradient-to-br", toneClasses[tone])}>
      {imageUrl ? (
        <picture>
          {useThumbnailSources && artwork.thumbnail.avifUrl ? <source srcSet={artwork.thumbnail.avifUrl} type="image/avif" /> : null}
          {useThumbnailSources && (artwork.thumbnail.webpUrl || artwork.thumbnail.srcSet) ? <source srcSet={artwork.thumbnail.srcSet ?? artwork.thumbnail.webpUrl} type="image/webp" /> : null}
          <img
            src={imageUrl}
            srcSet={useThumbnailSources ? artwork.thumbnail.srcSet : undefined}
            sizes="(min-width: 1536px) 23vw, (min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw"
            alt={artwork.altText}
            width={480}
            height={270}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ objectPosition: artwork.focalPoint }}
          />
        </picture>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,rgba(6,182,212,0.15),transparent_55%)]" />
          <div className="absolute inset-x-5 top-5 h-px bg-cyan-200/25" />
          <div className="absolute left-5 top-4 h-5 w-20 rounded-sm border border-cyan-200/25 bg-cyan-200/10" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="h-1.5 w-2/3 rounded-full bg-cyan-200/45" />
            <div className="mt-2 h-1.5 w-1/3 rounded-full bg-white/20" />
          </div>
          <Database className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-cyan-100/35" />
        </>
      )}
    </div>
  );
}

export function GeneratedLibraryCard({ record }: { record: GeneratedLibraryCardRecord }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={record.href}
      onMouseEnter={() => setHovered(true)}
      onFocus={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onBlur={() => setHovered(false)}
      className="group flex h-full min-h-[21rem] flex-col rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 transition hover:border-cyan-300/55 hover:bg-cyan-300/5 focus-visible:border-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30"
    >
      <CardThumbnail record={record} hovered={hovered} />
      <div className="mt-3 flex min-h-[4.25rem] items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-white" title={record.name}>{record.name}</p>
          <p className="mt-1 truncate text-sm font-semibold text-cyan-100" title={record.type}>{record.type}</p>
          {record.classification ? <p className="truncate text-xs font-semibold text-slate-400" title={record.classification}>{record.classification}</p> : null}
        </div>
        <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em]", statusClass(record.status))}>{record.status}</span>
      </div>
      <div className="mt-2 grid min-h-[4.5rem] grid-cols-2 gap-2 text-xs">
        <MetadataField label="Parent" value={record.parent} />
        <MetadataField label="Contains" value={record.contains} />
      </div>
      <div className="mt-auto flex items-center justify-end pt-3">
        <span className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-black text-cyan-100 transition group-hover:border-cyan-200/60 group-hover:text-white">
          Open
        </span>
      </div>
    </Link>
  );
}
