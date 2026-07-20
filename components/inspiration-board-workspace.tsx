"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ChevronLeft, ChevronRight, Expand, GalleryHorizontalEnd, ImageIcon, Play, Search, UploadCloud, X } from "lucide-react";
import type { InspirationWallImage, InspirationWallManifest } from "@/lib/experience-design/inspiration-wall";

function WallImage({ image, onOpen }: { image: InspirationWallImage; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-md border border-cyan-300/10 bg-slate-950 text-left transition hover:border-cyan-200/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
    >
      <span className="relative block w-full overflow-hidden" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
        <Image
          src={image.publicUrl}
          alt={image.title}
          fill
          sizes="(min-width: 1800px) 16vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          quality={68}
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-3 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-3 pb-3 pt-9 transition group-hover:translate-y-0 group-focus-visible:translate-y-0">
          <span className="truncate text-xs font-bold text-white">{image.title}</span>
          <Expand className="h-4 w-4 shrink-0 text-cyan-100" />
        </span>
      </span>
    </button>
  );
}

function ImageViewer({ images, initialIndex, autoPlay, onClose }: { images: InspirationWallImage[]; initialIndex: number; autoPlay: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const image = images[index];

  useEffect(() => setIndex(initialIndex), [initialIndex]);
  useEffect(() => {
    if (!autoPlay || images.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [autoPlay, images.length]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setIndex((current) => (current + 1) % images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, onClose]);

  if (!image) return null;
  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label={`${image.title} preview`}>
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{image.title}</p>
          <p className="text-xs text-slate-500">{index + 1} of {images.length} · {image.width}×{image.height}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-white/15 hover:bg-white/10" aria-label="Close preview"><X className="h-5 w-5" /></button>
      </header>
      <div className="relative min-h-0 flex-1">
        <Image src={image.publicUrl} alt={image.title} fill priority sizes="100vw" quality={85} className="object-contain p-6" />
        <button type="button" onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white hover:bg-white/10" aria-label="Previous image"><ChevronLeft className="h-6 w-6" /></button>
        <button type="button" onClick={() => setIndex((current) => (current + 1) % images.length)} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white hover:bg-white/10" aria-label="Next image"><ChevronRight className="h-6 w-6" /></button>
      </div>
    </div>
  );
}

export function InspirationBoardWorkspace({ initialManifest }: { initialManifest: InspirationWallManifest }) {
  const [manifest, setManifest] = useState(initialManifest);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [orientation, setOrientation] = useState("all");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [message, setMessage] = useState("");
  const folders = useMemo(() => [...new Set(manifest.images.map((image) => image.folder))].sort(), [manifest.images]);
  const images = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return manifest.images.filter((image) => {
      if (folder !== "all" && image.folder !== folder) return false;
      if (orientation !== "all" && image.orientation !== orientation) return false;
      return !needle || `${image.title} ${image.filename} ${image.folder}`.toLowerCase().includes(needle);
    });
  }, [folder, manifest.images, orientation, query]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setMessage("Uploading image…");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/experience-design/inspiration-wall/upload", { method: "POST", body: formData });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error ?? "Upload failed.");
      return;
    }
    const refreshed = await fetch("/api/experience-design/inspiration-wall", { cache: "no-store" });
    if (refreshed.ok) setManifest(await refreshed.json());
    setMessage(`${file.name} added to the board.`);
  }

  function present() {
    if (!images.length) return;
    setAutoPlay(true);
    setViewerIndex(0);
  }

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#05070b]/92 px-4 py-3 backdrop-blur-xl">
        <div className="mr-auto flex min-w-0 items-center gap-3">
          <GalleryHorizontalEnd className="h-5 w-5 text-cyan-200" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black">Inspiration Board</h1>
            <p className="text-xs text-slate-500">{images.length} of {manifest.images.length} images</p>
          </div>
        </div>
        <label className="flex h-10 min-w-[15rem] flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 lg:max-w-xl">
          <Search className="h-4 w-4 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search images and folders" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600" />
        </label>
        <select value={folder} onChange={(event) => setFolder(event.target.value)} className="h-10 max-w-48 rounded-md border border-white/10 bg-slate-950 px-3 text-sm font-bold text-slate-200"><option value="all">All folders</option>{folders.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select value={orientation} onChange={(event) => setOrientation(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm font-bold text-slate-200"><option value="all">All shapes</option>{["landscape", "portrait", "square", "panoramic"].map((value) => <option key={value}>{value}</option>)}</select>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/15"><UploadCloud className="h-4 w-4" />Upload<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" className="sr-only" onChange={upload} /></label>
        <button type="button" onClick={present} disabled={!images.length} className="inline-flex h-10 items-center gap-2 rounded-md border border-white/15 px-3 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:opacity-40"><Play className="h-4 w-4" />Present</button>
      </header>

      {message ? <p className="mx-4 mt-3 rounded-md border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100">{message}</p> : null}
      <section className="p-3 sm:p-4" aria-label="Inspiration images">
        {images.length ? (
          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 min-[1800px]:columns-6">
            {images.map((image, index) => <WallImage key={image.id} image={image} onOpen={() => { setAutoPlay(false); setViewerIndex(index); }} />)}
          </div>
        ) : (
          <div className="grid min-h-[55vh] place-items-center text-center">
            <div><ImageIcon className="mx-auto h-12 w-12 text-slate-600" /><h2 className="mt-4 text-xl font-black">No matching images</h2><p className="mt-2 text-sm text-slate-500">Adjust the filters or add artwork to public/images.</p></div>
          </div>
        )}
      </section>
      {viewerIndex !== null ? <ImageViewer images={images} initialIndex={viewerIndex} autoPlay={autoPlay} onClose={() => { setViewerIndex(null); setAutoPlay(false); }} /> : null}
    </main>
  );
}
