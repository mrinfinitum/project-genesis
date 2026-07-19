"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, ImageIcon, Paperclip, Trash2, X } from "lucide-react";
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

function CardThumbnail({ record, hovered, className }: { record: GeneratedLibraryCardRecord; hovered: boolean; className?: string }) {
  const tone = record.tone ?? "neutral";
  const imageUrl = hovered && record.mediumPreviewUrl ? record.mediumPreviewUrl : record.thumbnailUrl;
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-md border border-cyan-300/15 bg-gradient-to-br", toneClasses[tone], className)}>
      {imageUrl ? (
        <picture>
          {record.thumbnailAvifUrl ? <source srcSet={record.thumbnailAvifUrl} type="image/avif" /> : null}
          {record.thumbnailWebpUrl || record.thumbnailSrcSet ? <source srcSet={record.thumbnailSrcSet ?? record.thumbnailWebpUrl} type="image/webp" /> : null}
          <img
            src={imageUrl}
            srcSet={record.thumbnailSrcSet}
            sizes="(min-width: 1536px) 23vw, (min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ objectPosition: record.focalPoint ?? "center" }}
          />
        </picture>
      ) : (
        <>
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(103,232,249,0.08),transparent_56%)]" />
          <ImageIcon className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-slate-500/65" />
          <span className="sr-only">Missing library thumbnail</span>
        </>
      )}
    </div>
  );
}

function LibraryRecordModal({
  record,
  onClose
}: {
  record: GeneratedLibraryCardRecord;
  onClose: () => void;
}) {
  const attachHref = `/asset-library?q=${encodeURIComponent(record.name)}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={`library-record-${record.id}`}>
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-md border border-cyan-300/25 bg-[#07101e] shadow-2xl shadow-cyan-950/40">
        <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[1.3fr_0.9fr]">
          <div className="p-4 sm:p-6">
            <CardThumbnail record={record} hovered className="rounded-md" />
            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{record.type}</p>
                <h2 id={`library-record-${record.id}`} className="mt-2 text-3xl font-black text-white">{record.name}</h2>
                {record.classification ? <p className="mt-1 text-sm font-bold text-slate-400">{record.classification}</p> : null}
              </div>
              <span className={cn("rounded-md border px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em]", statusClass(record.status))}>{record.status}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MetadataField label="Parent" value={record.parent} />
              <MetadataField label="Contains" value={record.contains} />
              <MetadataField label="Type" value={record.type} />
              <MetadataField label="Class" value={record.classification} />
            </div>
          </div>
          <aside className="border-t border-cyan-300/15 bg-slate-950/35 p-4 sm:p-6 lg:border-l lg:border-t-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Record Actions</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Open the full record or attach uploaded artwork from the Asset Library.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-600/60 bg-slate-950/50 p-2 text-slate-300 transition hover:border-cyan-300/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                aria-label="Close record preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-3">
              <Link href={record.href} className="flex items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15">
                <ExternalLink className="h-4 w-4" />
                Open Record
              </Link>
              <Link href={attachHref} className="flex items-center justify-center gap-2 rounded-md border border-slate-500/35 bg-slate-950/45 px-4 py-3 text-sm font-black text-slate-200 transition hover:border-cyan-200/45 hover:text-white">
                <Paperclip className="h-4 w-4" />
                Attach Uploaded Asset
              </Link>
            </div>
            <div className="mt-6 rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Canonical Key</p>
              <p className="mt-2 break-all text-sm font-bold text-slate-200">{record.id}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function GeneratedLibraryCard({
  record,
  onDelete
}: {
  record: GeneratedLibraryCardRecord;
  onDelete?: (record: GeneratedLibraryCardRecord) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [locallyDeleted, setLocallyDeleted] = useState(false);
  if (locallyDeleted) return null;
  const deleteRecord = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const confirmed = window.confirm(`Remove ${record.name} from this library view? This does not delete canonical data.`);
    if (!confirmed) return;
    if (onDelete) {
      onDelete(record);
    } else {
      setLocallyDeleted(true);
    }
  };
  return (
    <>
    <article
      role="button"
      tabIndex={0}
      onClick={() => setModalOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setModalOpen(true);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onFocus={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onBlur={() => setHovered(false)}
      className="group flex h-full min-h-[21rem] flex-col rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-3 transition hover:border-cyan-300/55 hover:bg-cyan-300/5 focus-visible:border-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30"
    >
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={deleteRecord}
          className="rounded-md border border-rose-300/20 bg-rose-400/10 p-2 text-rose-100/80 opacity-70 transition hover:border-rose-200/50 hover:text-white hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
          aria-label={`Remove ${record.name} from this library view`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <CardThumbnail record={record} hovered={hovered} />
      <div className="mt-3 flex min-h-[4.25rem] items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-white" title={record.name}>{record.name}</p>
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
    </article>
    {modalOpen ? <LibraryRecordModal record={record} onClose={() => setModalOpen(false)} /> : null}
    </>
  );
}
