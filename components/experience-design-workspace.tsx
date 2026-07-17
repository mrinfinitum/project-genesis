"use client";

import Link from "next/link";
import type { ChangeEvent, ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  GalleryHorizontalEnd,
  History,
  ImageIcon,
  Info,
  Layers3,
  Library,
  MessageSquareText,
  Palette,
  Presentation,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceSearchBar, WorkspaceStatTile, WorkspaceTabs } from "@/components/ui/workspace";
import type { ExperienceComponentDefinition, ExperienceDesignKind, ExperienceDesignRecord, ExperienceDesignSection, ExperienceDesignState, ExperienceDesignToken, ExperienceInteractionPatternDefinition, ExperienceMaterialDefinition, ExperienceMotionDefinition, ExperienceScreenDefinition } from "@/lib/experience-design";
import type { InspirationWallImage, InspirationWallManifest } from "@/lib/experience-design/inspiration-wall";
import { cn } from "@/lib/utils";

type ExperienceTab = "dashboard" | "library" | "models" | "reviews" | "history";

const sectionIcons: Record<string, ComponentType<{ className?: string }>> = {
  dashboard: Palette,
  bible: BookOpen,
  "inspiration-wall": GalleryHorizontalEnd,
  concepts: Sparkles,
  screens: Layers3,
  tokens: Palette,
  materials: Layers3,
  motion: Route,
  components: Library,
  themes: Palette,
  brand: ShieldCheck,
  accessibility: Eye,
  journey: Route,
  reviews: MessageSquareText
};

function kindLabel(kind: ExperienceDesignKind) {
  return kind.split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function sectionForRecord(state: ExperienceDesignState, record: ExperienceDesignRecord) {
  return state.sections.find((section) => section.kinds.includes(record.kind)) ?? state.sections[0];
}

function ExperienceSectionCard({ section, count, active }: { section: ExperienceDesignSection; count: number; active?: boolean }) {
  const Icon = sectionIcons[section.id] ?? FileText;
  return (
    <Link
      href={section.route}
      className={cn(
        "group rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 transition hover:border-cyan-200/45 hover:bg-cyan-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200",
        active && "border-cyan-200/55 bg-cyan-300/12"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
          <Icon className="h-5 w-5" />
        </span>
        <WorkspaceBadge value={`${count} Records`} />
      </div>
      <h3 className="mt-4 text-lg font-black text-white">{section.label}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{section.description}</p>
    </Link>
  );
}

function ExperienceRecordCard({ state, record }: { state: ExperienceDesignState; record: ExperienceDesignRecord }) {
  const section = sectionForRecord(state, record);
  return (
    <article className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{kindLabel(record.kind)}</p>
          <h3 className="mt-2 truncate text-xl font-black text-white" title={record.name}>{record.name}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500">{section.label}</p>
        </div>
        <WorkspaceBadge value={record.status} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{record.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {record.tags.slice(0, 5).map((tag) => <WorkspaceBadge key={tag} value={tag} className="text-[0.62rem]" />)}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="Version" value={record.version} />
        <WorkspaceMiniStat label="Approval" value={record.approvalStatus} />
        <WorkspaceMiniStat label="Author" value={record.author} />
      </div>
    </article>
  );
}

function ExperienceShowcasePanel({ state }: { state: ExperienceDesignState }) {
  const pillars = ["Civilization Before Technology", "Universe Always Present", "Monumental Achievement", "Light as Progress", "Calm Intelligence"];
  return (
    <section className="studio-material-reading relative overflow-hidden rounded-lg p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden="true">
        <div className="absolute right-[-8rem] top-[-10rem] h-80 w-80 rounded-full border border-cyan-300/25" />
        <div className="absolute right-20 top-16 h-52 w-52 rounded-full border border-amber-300/15" />
        <div className="absolute bottom-8 left-10 h-px w-2/3 bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />
      </div>
      <div className="relative grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">Civilization Observatory</p>
          <h2 className="mt-3 text-3xl font-black text-white">Experience Design is the creative command center for NOVERIS.</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">The Bible, inspiration boards, concept library, screen intent, design tokens, materials, motion, and themes now share one premium reading and review environment. Studio remains the canonical authoring surface while the Game owns implementation.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {pillars.map((pillar) => <WorkspaceBadge key={pillar} value={pillar} />)}
          </div>
        </div>
        <div className="grid gap-3">
          <WorkspaceMiniStat label="Bible Releases" value={state.experienceBible.contentReleases.length} />
          <WorkspaceMiniStat label="Creative Records" value={state.records.length} />
          <WorkspaceMiniStat label="Runtime Boundary" value={state.runtimePublishing.replaceAll("_", " ")} />
        </div>
      </div>
    </section>
  );
}

function InspirationWallImageTile({
  image,
  selected,
  onSelect,
  onOpen
}: {
  image: InspirationWallImage;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onOpen}
      className={cn(
        "group mb-3 block w-full break-inside-avoid overflow-hidden rounded-lg bg-slate-950 text-left shadow-[0_18px_55px_rgba(0,0,0,0.30)] ring-1 ring-white/5 transition hover:ring-cyan-200/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200",
        selected && "ring-2 ring-cyan-200/70"
      )}
      aria-label={`Select ${image.title}`}
    >
      <img
        src={image.publicUrl}
        alt={image.title}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        className="h-auto w-full bg-slate-950 object-cover"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      />
      <span className="sr-only">{image.filename}</span>
    </button>
  );
}

function InspirationWallViewer({
  image,
  index,
  total,
  onClose,
  onPrevious,
  onNext,
  onMetadata
}: {
  image: InspirationWallImage;
  index: number;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onMetadata: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/96 text-white" role="dialog" aria-modal="true" aria-label={`${image.title} viewer`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{image.title}</p>
          <p className="text-xs text-slate-500">{index + 1} / {total}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onMetadata} className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"><Info className="inline h-4 w-4" /> Metadata</button>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-white/15 hover:bg-white/10" aria-label="Close viewer"><X className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
        <button type="button" onClick={onPrevious} className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/15 hover:bg-white/10" aria-label="Previous image"><ChevronLeft className="h-7 w-7" /></button>
        <img src={image.publicUrl} alt={image.title} className="max-h-full max-w-full object-contain" decoding="async" />
        <button type="button" onClick={onNext} className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/15 hover:bg-white/10" aria-label="Next image"><ChevronRight className="h-7 w-7" /></button>
      </div>
    </div>
  );
}

function InspirationWallMetadata({ image, onClose }: { image: InspirationWallImage; onClose: () => void }) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-4xl rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-white shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-xl" role="dialog" aria-label={`${image.title} metadata`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Image Metadata</p>
          <h3 className="mt-1 truncate text-xl font-black">{image.title}</h3>
          <p className="mt-1 truncate text-sm text-slate-400">{image.publicUrl}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-white/15 hover:bg-white/10" aria-label="Close metadata"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <WorkspaceMiniStat label="Dimensions" value={`${image.width}x${image.height}`} />
        <WorkspaceMiniStat label="Aspect" value={image.aspectRatio} />
        <WorkspaceMiniStat label="Folder" value={image.folder} />
        <WorkspaceMiniStat label="Size" value={`${Math.round(image.fileSize / 1024)} KB`} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {image.palette.map((color) => (
          <button key={color} type="button" onClick={() => navigator.clipboard?.writeText(color)} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-200">
            <span className="h-4 w-4 rounded-full ring-1 ring-white/20" style={{ backgroundColor: color }} />
            {color}
          </button>
        ))}
        <WorkspaceBadge value={`${image.warmth} palette`} />
        <WorkspaceBadge value={`${image.luminance} luminance`} />
      </div>
    </div>
  );
}

function InspirationBoardsWorkspace({ wall }: { wall?: InspirationWallManifest }) {
  const images = wall?.images ?? [];
  const folders = Array.from(new Set(images.map((image) => image.folder))).sort();
  const [query, setQuery] = useState("");
  const [orientation, setOrientation] = useState("all");
  const [folder, setFolder] = useState("all");
  const [selectedId, setSelectedId] = useState(images[0]?.id ?? "");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const filteredImages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return images.filter((image) => {
      if (orientation !== "all" && image.orientation !== orientation) return false;
      if (folder !== "all" && image.folder !== folder) return false;
      if (!normalized) return true;
      return [image.filename, image.title, image.folder, image.relativePath].join(" ").toLowerCase().includes(normalized);
    });
  }, [folder, images, orientation, query]);

  const selectedImage = filteredImages.find((image) => image.id === selectedId) ?? filteredImages[0];
  const selectedIndex = selectedImage ? Math.max(0, filteredImages.findIndex((image) => image.id === selectedImage.id)) : -1;

  function selectOffset(offset: number) {
    if (!filteredImages.length) return;
    const currentIndex = selectedImage ? filteredImages.findIndex((image) => image.id === selectedImage.id) : 0;
    const nextIndex = (currentIndex + offset + filteredImages.length) % filteredImages.length;
    setSelectedId(filteredImages[nextIndex].id);
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setUploadMessage("Uploading to local public/images...");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/experience-design/inspiration-wall/upload", { method: "POST", body: formData });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setUploadMessage(payload.error ?? "Upload failed.");
      return;
    }
    setUploadMessage(`Uploaded ${payload.publicUrl}. Refresh if the image is not visible yet.`);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!selectedImage) return;
      if (event.key === "ArrowRight") selectOffset(1);
      if (event.key === "ArrowLeft") selectOffset(-1);
      if (event.key === "Enter") setViewerOpen(true);
      if (event.key === " ") {
        event.preventDefault();
        setViewerOpen(true);
      }
      if (event.key === "Escape") {
        setViewerOpen(false);
        setMetadataOpen(false);
        setPresentation(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredImages, selectedImage]);

  const wallContent = (
    <section className={cn("min-h-screen bg-[#05070b] text-white", presentation && "fixed inset-0 z-[70] overflow-auto p-4")}>
      <div className="sticky top-0 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#05070b]/92 px-1 py-3 backdrop-blur-xl">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black">Inspiration Wall</h1>
          <p className="text-xs text-slate-500">{filteredImages.length} / {images.length} images from public/images</p>
        </div>
        <div className="flex min-w-[16rem] flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          <Search className="h-4 w-4 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search images, folders, filenames" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
        </div>
        <select value={orientation} onChange={(event) => setOrientation(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm font-bold text-slate-200">
          {["all", "landscape", "portrait", "square", "panoramic"].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={folder} onChange={(event) => setFolder(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm font-bold text-slate-200">
          <option value="all">all folders</option>
          {folders.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/15">
          <UploadCloud className="h-4 w-4" />
          Upload
          <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" className="sr-only" onChange={uploadImage} />
        </label>
        <button type="button" onClick={() => setPresentation((current) => !current)} className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-bold text-slate-200 hover:bg-white/10">
          <Presentation className="h-4 w-4" />
          {presentation ? "Exit" : "Present"}
        </button>
        {selectedImage ? <button type="button" onClick={() => setMetadataOpen(true)} className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-slate-300 hover:bg-white/10" aria-label="Reveal metadata"><Info className="h-4 w-4" /></button> : null}
      </div>

      {uploadMessage ? <p className="mb-3 rounded-md border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100">{uploadMessage}</p> : null}

      {filteredImages.length ? (
        <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 min-[1800px]:columns-6">
          {filteredImages.map((image) => (
            <InspirationWallImageTile
              key={image.id}
              image={image}
              selected={selectedImage?.id === image.id}
              onSelect={() => setSelectedId(image.id)}
              onOpen={() => {
                setSelectedId(image.id);
                setViewerOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="grid min-h-[50vh] place-items-center rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div>
            <ImageIcon className="mx-auto h-10 w-10 text-slate-500" />
            <h2 className="mt-4 text-xl font-black">No supported images found</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Add jpg, jpeg, png, webp, avif, or gif images to public/images, or upload in local development mode.</p>
          </div>
        </div>
      )}

      {selectedImage && metadataOpen ? <InspirationWallMetadata image={selectedImage} onClose={() => setMetadataOpen(false)} /> : null}
      {selectedImage && viewerOpen ? (
        <InspirationWallViewer
          image={selectedImage}
          index={selectedIndex}
          total={filteredImages.length}
          onClose={() => setViewerOpen(false)}
          onPrevious={() => selectOffset(-1)}
          onNext={() => selectOffset(1)}
          onMetadata={() => setMetadataOpen(true)}
        />
      ) : null}
    </section>
  );

  return presentation ? wallContent : <div className="lg:col-span-2 2xl:col-span-3">{wallContent}</div>;
}

function DesignTokenCard({ token }: { token: ExperienceDesignToken }) {
  return (
    <article id={token.id} className="scroll-mt-24 rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{token.category}</p>
          <h3 className="mt-2 truncate text-xl font-black text-white" title={token.semanticPath}>{token.semanticPath}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500">{token.name}</p>
        </div>
        <WorkspaceBadge value={token.status} />
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">{token.purpose}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="Version" value={token.version} />
        <WorkspaceMiniStat label="Owner" value={token.owner} />
        <WorkspaceMiniStat label="Review" value={token.reviewStatus} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {token.tags.slice(0, 6).map((tag) => <WorkspaceBadge key={tag} value={tag} className="text-[0.62rem]" />)}
      </div>
    </article>
  );
}

function DesignTokensWorkspace({ state, tokens }: { state: ExperienceDesignState; tokens: ExperienceDesignToken[] }) {
  return (
    <div className="space-y-4 lg:col-span-2 2xl:col-span-3">
      <section aria-label="Token Browser" className="rounded-2xl border border-cyan-300/10 bg-slate-950/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Token Browser</p>
            <h3 className="mt-1 text-2xl font-black text-white">Color, Typography, Spacing, Motion, Glass</h3>
          </div>
          <WorkspaceBadge value={state.designTokens.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {state.designTokens.libraries.slice(0, 12).map((library) => <WorkspaceBadge key={library.id} value={library.name.replace(" Tokens", "")} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {tokens.map((token) => <DesignTokenCard key={token.id} token={token} />)}
      </section>
    </div>
  );
}

function MaterialDefinitionCard({ material }: { material: ExperienceMaterialDefinition }) {
  return (
    <article id={material.id} className="scroll-mt-24 rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{material.category}</p>
          <h3 className="mt-2 truncate text-xl font-black text-white" title={material.name}>{material.name}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500">{material.id}</p>
        </div>
        <WorkspaceBadge value={material.status} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{material.emotionalIntent}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="Tokens" value={material.relatedTokens.length} />
        <WorkspaceMiniStat label="Previews" value={material.previewSupport.length} />
        <WorkspaceMiniStat label="Runtime" value="Future" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {material.relatedTokens.slice(0, 5).map((token) => <WorkspaceBadge key={token} value={token} className="text-[0.62rem]" />)}
      </div>
    </article>
  );
}

function MaterialsWorkspace({ state, materials }: { state: ExperienceDesignState; materials: ExperienceMaterialDefinition[] }) {
  return (
    <div className="space-y-4 lg:col-span-2 2xl:col-span-3">
      <section aria-label="Material Gallery" className="rounded-2xl border border-cyan-300/10 bg-slate-950/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Material Gallery</p>
            <h3 className="mt-1 text-2xl font-black text-white">Glass, Projection, Energy, Atmosphere, Planetary</h3>
          </div>
          <WorkspaceBadge value={state.materials.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {state.materials.categories.slice(0, 12).map((category) => <WorkspaceBadge key={category.id} value={category.name} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {materials.map((material) => <MaterialDefinitionCard key={material.id} material={material} />)}
      </section>
    </div>
  );
}

function MotionDefinitionCard({ motion }: { motion: ExperienceMotionDefinition }) {
  return (
    <article id={motion.id} className="scroll-mt-24 rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{motion.category}</p>
          <h3 className="mt-2 truncate text-xl font-black text-white" title={motion.id}>{motion.id}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500">{motion.name}</p>
        </div>
        <WorkspaceBadge value={motion.status} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{motion.emotionalIntent}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="Intensity" value={motion.intensity} />
        <WorkspaceMiniStat label="Attention" value={motion.playerAttentionLevel} />
        <WorkspaceMiniStat label="Runtime" value="Future" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {motion.accessibilityNotes.slice(0, 4).map((note) => <WorkspaceBadge key={note} value={note} className="text-[0.62rem]" />)}
      </div>
    </article>
  );
}

function MotionWorkspace({ state, motions }: { state: ExperienceDesignState; motions: ExperienceMotionDefinition[] }) {
  return (
    <div className="space-y-4 lg:col-span-2 2xl:col-span-3">
      <section aria-label="Motion Library" className="rounded-2xl border border-cyan-300/10 bg-slate-950/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Motion Library</p>
            <h3 className="mt-1 text-2xl font-black text-white">Arrival, Focus, Discovery, Navigation, Camera</h3>
          </div>
          <WorkspaceBadge value={state.motion.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {state.motion.categories.slice(0, 12).map((category) => <WorkspaceBadge key={category.id} value={category.name} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {motions.map((motion) => <MotionDefinitionCard key={motion.id} motion={motion} />)}
      </section>
    </div>
  );
}

function ComponentDefinitionCard({ component }: { component: ExperienceComponentDefinition }) {
  return (
    <article id={component.id} className="scroll-mt-24 rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{component.category}</p>
          <h3 className="mt-2 truncate text-xl font-black text-white" title={component.name}>{component.name}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500">{component.id}</p>
        </div>
        <WorkspaceBadge value={component.status} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{component.purpose}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="States" value={component.states.length} />
        <WorkspaceMiniStat label="Sizes" value={component.sizes.length} />
        <WorkspaceMiniStat label="Runtime" value="Future" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {component.accessibilityNotes.slice(0, 4).map((note) => <WorkspaceBadge key={note} value={note} className="text-[0.62rem]" />)}
      </div>
    </article>
  );
}

function ComponentLibraryWorkspace({ state, components }: { state: ExperienceDesignState; components: ExperienceComponentDefinition[] }) {
  return (
    <div className="space-y-4 lg:col-span-2 2xl:col-span-3">
      <section aria-label="Component Browser" className="rounded-2xl border border-cyan-300/10 bg-slate-950/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Component Browser</p>
            <h3 className="mt-1 text-2xl font-black text-white">Navigation, Command, Layout, Information, Runtime</h3>
          </div>
          <WorkspaceBadge value={state.componentLibrary.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {state.componentLibrary.categories.map((category) => <WorkspaceBadge key={category.id} value={category.name} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {components.map((component) => <ComponentDefinitionCard key={component.id} component={component} />)}
      </section>
    </div>
  );
}

function InteractionPatternCard({ pattern }: { pattern: ExperienceInteractionPatternDefinition }) {
  return (
    <article id={pattern.id} className="scroll-mt-24 rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{pattern.category}</p>
          <h3 className="mt-2 truncate text-xl font-black text-white" title={pattern.name}>{pattern.name}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500">{pattern.id}</p>
        </div>
        <WorkspaceBadge value={pattern.status} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{pattern.problemSolved}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="Components" value={pattern.relatedComponents.length} />
        <WorkspaceMiniStat label="Flow Steps" value={7} />
        <WorkspaceMiniStat label="Runtime" value="Future" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {pattern.previewSupport.slice(0, 4).map((preview) => <WorkspaceBadge key={preview} value={preview} className="text-[0.62rem]" />)}
      </div>
    </article>
  );
}

function InteractionPatternsWorkspace({ state, patterns }: { state: ExperienceDesignState; patterns: ExperienceInteractionPatternDefinition[] }) {
  return (
    <div className="space-y-4 lg:col-span-2 2xl:col-span-3">
      <section aria-label="Pattern Browser" className="rounded-2xl border border-cyan-300/10 bg-slate-950/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Pattern Browser</p>
            <h3 className="mt-1 text-2xl font-black text-white">Navigation, Workspace, Exploration, Review, Runtime</h3>
          </div>
          <WorkspaceBadge value={state.interactionPatterns.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {state.interactionPatterns.categories.slice(0, 12).map((category) => <WorkspaceBadge key={category.id} value={category.name} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {patterns.map((pattern) => <InteractionPatternCard key={pattern.id} pattern={pattern} />)}
      </section>
    </div>
  );
}

function ScreenDefinitionCard({ screen }: { screen: ExperienceScreenDefinition }) {
  return (
    <article id={screen.id} className="scroll-mt-24 rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{screen.category}</p>
          <h3 className="mt-2 truncate text-xl font-black text-white" title={screen.name}>{screen.name}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500">{screen.id}</p>
        </div>
        <WorkspaceBadge value={screen.status} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{screen.summary}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="Pattern" value={screen.primaryInteractionPattern.replace("pattern.", "")} />
        <WorkspaceMiniStat label="Components" value={screen.componentComposition.length} />
        <WorkspaceMiniStat label="Regions" value={screen.layoutRegions.length} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {screen.interactionZones.slice(0, 4).map((zone) => <WorkspaceBadge key={zone} value={zone} className="text-[0.62rem]" />)}
      </div>
    </article>
  );
}

function ScreenLibraryWorkspace({ state, screens }: { state: ExperienceDesignState; screens: ExperienceScreenDefinition[] }) {
  return (
    <div className="space-y-4 lg:col-span-2 2xl:col-span-3">
      <section aria-label="Screen Gallery" className="rounded-2xl border border-cyan-300/10 bg-slate-950/35 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Screen Gallery</p>
            <h3 className="mt-1 text-2xl font-black text-white">Civilization, Universe, Colony, Economy, Runtime</h3>
          </div>
          <WorkspaceBadge value={state.screenLibrary.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {state.screenLibrary.categories.map((category) => <WorkspaceBadge key={category.id} value={category.name} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {screens.map((screen) => <ScreenDefinitionCard key={screen.id} screen={screen} />)}
      </section>
    </div>
  );
}

export function ExperienceDesignWorkspace({ state, initialSection = "dashboard", inspirationWall }: { state: ExperienceDesignState; initialSection?: string; inspirationWall?: InspirationWallManifest }) {
  const resolvedSection = state.sections.some((section) => section.id === initialSection) ? initialSection : "dashboard";
  const isHome = resolvedSection === "dashboard";
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ExperienceTab>(resolvedSection === "dashboard" ? "dashboard" : "library");
  const [sectionId, setSectionId] = useState(resolvedSection);

  const currentSection = state.sections.find((section) => section.id === sectionId) ?? state.sections[0];
  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.records.filter((record) => {
      const sectionMatch = sectionId === "dashboard" || currentSection.kinds.length === 0 || currentSection.kinds.includes(record.kind);
      if (!sectionMatch) return false;
      if (!normalized) return true;
      const text = [record.id, record.name, record.description, record.kind, record.status, record.author, record.tags.join(" "), record.notes.join(" "), JSON.stringify(record.fields)].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [currentSection.kinds, query, sectionId, state.records]);

  const filteredTokens = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.designTokens.tokens.filter((token) => {
      if (!normalized) return true;
      const text = [
        token.id,
        token.name,
        token.semanticPath,
        token.category,
        token.purpose,
        token.description,
        token.tags.join(" "),
        token.experienceBibleReferences.join(" "),
        token.visualDnaReferences.join(" "),
        token.relatedMaterials.join(" "),
        token.relatedComponents.join(" "),
        token.relatedScreens.join(" ")
      ].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [query, state.designTokens.tokens]);

  const filteredMaterials = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.materials.materials.filter((material) => {
      if (!normalized) return true;
      const text = [
        material.id,
        material.name,
        material.category,
        material.purpose,
        material.description,
        material.emotionalIntent,
        material.lightingNotes,
        material.transparencyNotes,
        material.reflectionNotes,
        material.depthNotes,
        material.motionNotes,
        material.accessibilityNotes,
        material.relatedTokens.join(" "),
        material.relatedComponents.join(" "),
        material.relatedScreens.join(" "),
        material.relatedInspirationBoards.join(" "),
        material.experienceBibleReferences.join(" "),
        material.visualDnaReferences.join(" "),
        material.previewSupport.join(" "),
        material.tags.join(" ")
      ].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [query, state.materials.materials]);

  const filteredMotions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.motion.motions.filter((motion) => {
      if (!normalized) return true;
      const text = [
        motion.id,
        motion.name,
        motion.category,
        motion.purpose,
        motion.description,
        motion.emotionalIntent,
        motion.trigger,
        motion.completionCondition,
        motion.expectedDuration,
        motion.intensity,
        motion.playerAttentionLevel,
        motion.accessibilityNotes.join(" "),
        motion.relatedTokens.join(" "),
        motion.relatedMaterials.join(" "),
        motion.relatedComponents.join(" "),
        motion.relatedScreens.join(" "),
        motion.relatedInspirationBoards.join(" "),
        motion.experienceBibleReferences.join(" "),
        motion.visualDnaReferences.join(" "),
        motion.previewSupport.join(" "),
        motion.tags.join(" ")
      ].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [query, state.motion.motions]);

  const filteredComponents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.componentLibrary.components.filter((component) => {
      if (!normalized) return true;
      const text = [
        component.id,
        component.name,
        component.category,
        component.purpose,
        component.description,
        component.playerIntent,
        component.studioIntent,
        component.states.join(" "),
        component.sizes.join(" "),
        component.accessibilityNotes.join(" "),
        component.responsiveNotes.join(" "),
        component.interactionNotes.join(" "),
        component.relatedTokens.join(" "),
        component.relatedMaterials.join(" "),
        component.relatedMotion.join(" "),
        component.relatedComponents.join(" "),
        component.relatedScreens.join(" "),
        component.relatedInspirationBoards.join(" "),
        component.experienceBibleReferences.join(" "),
        component.visualDnaReferences.join(" "),
        component.previewSupport.join(" "),
        component.tags.join(" ")
      ].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [query, state.componentLibrary.components]);

  const filteredPatterns = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.interactionPatterns.patterns.filter((pattern) => {
      if (!normalized) return true;
      const text = [
        pattern.id,
        pattern.name,
        pattern.category,
        pattern.purpose,
        pattern.problemSolved,
        pattern.description,
        pattern.primaryUserIntent,
        pattern.studioIntent,
        pattern.gameplayIntent,
        Object.values(pattern.interactionFlow).flat().join(" "),
        pattern.accessibilityNotes.join(" "),
        pattern.responsiveNotes.join(" "),
        pattern.relatedTokens.join(" "),
        pattern.relatedMaterials.join(" "),
        pattern.relatedMotion.join(" "),
        pattern.relatedComponents.join(" "),
        pattern.relatedScreens.join(" "),
        pattern.relatedInspirationBoards.join(" "),
        pattern.experienceBibleReferences.join(" "),
        pattern.visualDnaReferences.join(" "),
        pattern.previewSupport.join(" "),
        pattern.tags.join(" ")
      ].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [query, state.interactionPatterns.patterns]);

  const filteredScreens = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.screenLibrary.screens.filter((screen) => {
      if (!normalized) return true;
      const text = [
        screen.id,
        screen.name,
        screen.category,
        screen.purpose,
        screen.playerGoal,
        screen.studioGoal,
        screen.emotionalGoal,
        screen.summary,
        screen.primaryInteractionPattern,
        screen.supportingPatterns.join(" "),
        screen.componentComposition.join(" "),
        screen.materialComposition.join(" "),
        screen.motionComposition.join(" "),
        screen.tokenReferences.join(" "),
        screen.interactionZones.join(" "),
        screen.layoutRegions.join(" "),
        screen.platformVariants.join(" "),
        screen.experienceBibleReferences.join(" "),
        screen.visualDnaReferences.join(" "),
        screen.relatedInspirationBoards.join(" "),
        screen.tags.join(" ")
      ].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [query, state.screenLibrary.screens]);

  const reviewCounts = state.reviewWorkflow.map((status) => ({
    status,
    count: state.records.filter((record) => record.status === status).length
  }));

  if (!isHome) {
    const workspaceContent = (
      <>
        {currentSection.id === "inspiration-wall" ? <InspirationBoardsWorkspace wall={inspirationWall} /> : null}
        {currentSection.id === "tokens" ? <DesignTokensWorkspace state={state} tokens={filteredTokens} /> : null}
        {currentSection.id === "materials" ? <MaterialsWorkspace state={state} materials={filteredMaterials} /> : null}
        {currentSection.id === "motion" ? <MotionWorkspace state={state} motions={filteredMotions} /> : null}
        {currentSection.id === "components" ? <ComponentLibraryWorkspace state={state} components={filteredComponents} /> : null}
        {currentSection.id === "patterns" ? <InteractionPatternsWorkspace state={state} patterns={filteredPatterns} /> : null}
        {currentSection.id === "screens" ? <ScreenLibraryWorkspace state={state} screens={filteredScreens} /> : null}
        {currentSection.id !== "inspiration-wall" && currentSection.id !== "tokens" && currentSection.id !== "materials" && currentSection.id !== "motion" && currentSection.id !== "components" && currentSection.id !== "patterns" && currentSection.id !== "screens" ? filteredRecords.map((record) => <ExperienceRecordCard key={record.id} state={state} record={record} />) : null}
      </>
    );

    return (
      <main className="space-y-5">
        {currentSection.id === "inspiration-wall" ? (
          <InspirationBoardsWorkspace wall={inspirationWall} />
        ) : (
          <>
            <header className="rounded-2xl border border-cyan-300/10 bg-slate-950/35 p-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                    <Link href="/experience-design" className="hover:text-cyan-100">Experience Design Home</Link>
                    <span className="mx-2 text-slate-600">/</span>
                    Content First Workspace
                  </p>
                  <h1 className="mt-2 text-3xl font-black text-white">{currentSection.label}</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{currentSection.description}</p>
                </div>
                <WorkspaceBadge value="Content First" />
              </div>
            </header>

            <WorkspaceSearchBar value={query} onChange={setQuery} placeholder={`Search ${currentSection.label}`} />

            <section aria-label={`${currentSection.label} content-first workspace`} className={currentSection.id === "tokens" || currentSection.id === "materials" || currentSection.id === "motion" || currentSection.id === "components" || currentSection.id === "patterns" || currentSection.id === "screens" ? "" : "grid gap-4 lg:grid-cols-2 2xl:grid-cols-3"}>
              {workspaceContent}
              {currentSection.id === "tokens" && !filteredTokens.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Design Tokens match this search.</p> : null}
              {currentSection.id === "materials" && !filteredMaterials.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Materials match this search.</p> : null}
              {currentSection.id === "motion" && !filteredMotions.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Motion definitions match this search.</p> : null}
              {currentSection.id === "components" && !filteredComponents.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Component definitions match this search.</p> : null}
              {currentSection.id === "patterns" && !filteredPatterns.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Interaction Patterns match this search.</p> : null}
              {currentSection.id === "screens" && !filteredScreens.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Screen definitions match this search.</p> : null}
              {currentSection.id !== "inspiration-wall" && currentSection.id !== "tokens" && currentSection.id !== "materials" && currentSection.id !== "motion" && currentSection.id !== "components" && currentSection.id !== "patterns" && currentSection.id !== "screens" && !filteredRecords.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Experience Design records match this search.</p> : null}
            </section>
          </>
        )}
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Creative Direction Command"
        title="Experience Design Home"
        description="Progress, recent activity, reviews, approval queue, creative health, status, and library overview live here. Individual workspaces now open directly into their creative content."
        stats={[
          { label: "Framework", value: state.frameworkId },
          { label: "Version", value: state.version },
          { label: "Records", value: state.records.length },
          { label: "Runtime", value: "Not Published" }
        ]}
      />

      <ExperienceShowcasePanel state={state} />

      <WorkspacePanel title="Ownership Boundary" icon={ShieldCheck}>
        <div className="grid gap-3 lg:grid-cols-3">
          {state.implementationBoundary.map((rule) => (
            <div key={rule} className="rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2 text-sm leading-6 text-slate-300">{rule}</div>
          ))}
        </div>
      </WorkspacePanel>

      <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <WorkspacePanel title="Dashboard" icon={Palette}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <WorkspaceStatTile label="Sections" value={state.sections.length - 1} />
            <WorkspaceStatTile label="Content Models" value={state.contentModels.length} />
            <WorkspaceStatTile label="Draft / Review" value={state.dashboard.draftReviews.length} />
            <WorkspaceStatTile label="Approved" value={state.dashboard.approvedChanges.length} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {reviewCounts.map((item) => (
              <WorkspaceMiniStat key={item.status} label={item.status} value={item.count} />
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Recent Activity" icon={Clock3}>
          <div className="space-y-2">
            {state.dashboard.recentActivity.map((entry) => (
              <div key={entry.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <p className="text-sm font-black text-white">{entry.action.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{entry.notes}</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </section>

      <WorkspacePanel title="Experience Bible" icon={BookOpen}>
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{state.experienceBible.id} / Version {state.experienceBible.version}</p>
            <h2 className="mt-2 text-2xl font-black text-white">{state.experienceBible.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">A living creative bible with stable Parts I-VII, Chapters 1-65, structured authoring, review, version history, references, and no runtime publication.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/experience-design/bible" className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">Open Experience Bible</Link>
              <Link href="/experience-design/bible/versions" className="rounded-md border border-slate-600 px-3 py-2 text-sm font-bold text-slate-200">Version History</Link>
            </div>
          </div>
          <div className="grid gap-2">
            <WorkspaceMiniStat label="Parts" value={state.experienceBible.parts.length} />
            <WorkspaceMiniStat label="Chapters" value={state.experienceBible.chapters.length} />
            <WorkspaceMiniStat label="Status" value={state.experienceBible.status} />
          </div>
        </div>
      </WorkspacePanel>

      <div className="flex flex-wrap items-center gap-3">
        <WorkspaceTabs tabs={["dashboard", "library", "models", "reviews", "history"]} active={tab} onChange={setTab} />
        <div className="flex items-center gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 px-3 py-2">
          <Search className="h-4 w-4 text-slate-500" />
          <select
            value={sectionId}
            onChange={(event) => {
              setSectionId(event.target.value);
              if (event.target.value !== "dashboard") setTab("library");
            }}
            className="bg-transparent text-sm font-bold text-slate-200 outline-none"
          >
            {state.sections.map((section) => <option key={section.id} value={section.id} className="bg-slate-950">{section.label}</option>)}
          </select>
        </div>
      </div>

      <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search Bible, inspiration boards, concepts, screens, tokens, materials, motion, components, themes, journeys, reviews" />

      {tab === "dashboard" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {state.sections.filter((section) => section.id !== "dashboard").map((section) => (
            <ExperienceSectionCard
              key={section.id}
              section={section}
              active={section.id === sectionId}
              count={state.records.filter((record) => section.kinds.includes(record.kind)).length}
            />
          ))}
        </section>
      ) : null}

      {tab === "library" ? (
        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {currentSection.id === "inspiration-wall" ? <InspirationBoardsWorkspace wall={inspirationWall} /> : null}
          {currentSection.id === "tokens" ? <DesignTokensWorkspace state={state} tokens={filteredTokens} /> : null}
          {currentSection.id === "materials" ? <MaterialsWorkspace state={state} materials={filteredMaterials} /> : null}
          {currentSection.id === "motion" ? <MotionWorkspace state={state} motions={filteredMotions} /> : null}
          {currentSection.id === "components" ? <ComponentLibraryWorkspace state={state} components={filteredComponents} /> : null}
          {currentSection.id === "patterns" ? <InteractionPatternsWorkspace state={state} patterns={filteredPatterns} /> : null}
          {currentSection.id === "screens" ? <ScreenLibraryWorkspace state={state} screens={filteredScreens} /> : null}
          {currentSection.id !== "inspiration-wall" && currentSection.id !== "tokens" && currentSection.id !== "materials" && currentSection.id !== "motion" && currentSection.id !== "components" && currentSection.id !== "patterns" && currentSection.id !== "screens" ? filteredRecords.map((record) => <ExperienceRecordCard key={record.id} state={state} record={record} />) : null}
          {currentSection.id !== "inspiration-wall" && currentSection.id !== "tokens" && currentSection.id !== "materials" && currentSection.id !== "motion" && currentSection.id !== "components" && currentSection.id !== "patterns" && currentSection.id !== "screens" && !filteredRecords.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Experience Design records match this view.</p> : null}
          {currentSection.id === "tokens" && !filteredTokens.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Design Tokens match this view.</p> : null}
          {currentSection.id === "materials" && !filteredMaterials.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Materials match this view.</p> : null}
          {currentSection.id === "motion" && !filteredMotions.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Motion definitions match this view.</p> : null}
          {currentSection.id === "components" && !filteredComponents.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Component definitions match this view.</p> : null}
          {currentSection.id === "patterns" && !filteredPatterns.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Interaction Patterns match this view.</p> : null}
          {currentSection.id === "screens" && !filteredScreens.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Screen definitions match this view.</p> : null}
        </section>
      ) : null}

      {tab === "models" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {state.contentModels.map((model) => (
            <article key={model.kind} className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{model.kind}</p>
                  <h3 className="mt-2 text-xl font-black text-white">{model.displayName}</h3>
                </div>
                <WorkspaceBadge value={`${model.requiredFields.length} Fields`} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{model.description}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Required Fields</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{model.requiredFields.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Capabilities</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{model.supportedCapabilities.join(", ")}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {tab === "reviews" ? (
        <WorkspacePanel title="Creative Review Workflow" icon={CheckCircle2}>
          <div className="grid gap-3 md:grid-cols-5">
            {state.reviewWorkflow.map((status, index) => (
              <div key={status} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Step {index + 1}</p>
                <h3 className="mt-2 text-lg font-black text-white">{status}</h3>
                <p className="mt-2 text-sm text-slate-400">{state.records.filter((record) => record.status === status).length} records</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {state.dashboard.draftReviews.map((record) => <ExperienceRecordCard key={record.id} state={state} record={record} />)}
          </div>
        </WorkspacePanel>
      ) : null}

      {tab === "history" ? (
        <WorkspacePanel title="Version History" icon={History}>
          <div className="space-y-3">
            {state.records.flatMap((record) => record.history.map((entry) => ({ record, entry }))).map(({ record, entry }) => (
              <div key={entry.id} className="grid gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 md:grid-cols-[12rem_1fr_10rem]">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{entry.action}</p>
                  <p className="mt-1 text-sm font-bold text-white">{record.name}</p>
                </div>
                <p className="text-sm leading-6 text-slate-300">{entry.notes}</p>
                <div className="text-sm text-slate-500">
                  <p>{entry.author}</p>
                  <p>{entry.timestamp.slice(0, 10)}</p>
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      ) : null}

      <WorkspacePanel title="Attachments and Relationships" icon={Archive}>
        <div className="grid gap-3 md:grid-cols-3">
          <WorkspaceMiniStat label="Attachment Types" value="Images / Video / PDF / Notes" />
          <WorkspaceMiniStat label="Asset Links" value="Supported" />
          <WorkspaceMiniStat label="Runtime Export" value="Not Published" />
        </div>
      </WorkspacePanel>
    </main>
  );
}
