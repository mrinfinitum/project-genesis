"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import {
  Archive,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  GalleryHorizontalEnd,
  History,
  Link2,
  Layers3,
  Library,
  MessageSquareText,
  MousePointer2,
  Palette,
  PenLine,
  Presentation,
  Route,
  Search,
  ShieldCheck,
  Settings,
  Sparkles,
  Trash2,
  Type,
  UploadCloud,
  Users,
  ZoomIn
} from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceSearchBar, WorkspaceStatTile, WorkspaceTabs } from "@/components/ui/workspace";
import type { ExperienceComponentDefinition, ExperienceDesignKind, ExperienceDesignRecord, ExperienceDesignSection, ExperienceDesignState, ExperienceDesignToken, ExperienceInspirationBoard, ExperienceInteractionPatternDefinition, ExperienceMaterialDefinition, ExperienceMotionDefinition, ExperienceScreenDefinition } from "@/lib/experience-design";
import { cn } from "@/lib/utils";

type ExperienceTab = "dashboard" | "library" | "models" | "reviews" | "history";

const sectionIcons: Record<string, ComponentType<{ className?: string }>> = {
  dashboard: Palette,
  bible: BookOpen,
  "inspiration-boards": GalleryHorizontalEnd,
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

function InspirationBoardCanvasPreview({ state }: { state: ExperienceDesignState }) {
  const notes = ["Lighting", "Composition", "Atmosphere", "Scale", "Visual DNA"];
  return (
    <section className="relative min-h-[28rem] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(253,214,114,0.18),transparent_28%),radial-gradient(circle_at_74%_22%,rgba(92,229,255,0.14),transparent_30%),linear-gradient(135deg,rgba(246,241,226,0.10),rgba(9,17,31,0.94)_35%,rgba(4,8,17,0.98))] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/10 bg-slate-950/35 px-4 py-3 backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">{state.inspirationBoards.id} / Canvas</p>
          <h3 className="truncate text-lg font-black text-white">NOVERIS Inspiration Wall</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1"><Users className="h-3.5 w-3.5 text-cyan-200" /> Creative Direction</span>
          <button type="button" className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-emerald-100">Publish</button>
          <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-100">Export</button>
          <button type="button" aria-label="Board settings" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-200"><Settings className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-5 flex gap-4">
        <div className="sticky top-4 hidden h-max shrink-0 rounded-full border border-white/10 bg-slate-950/35 p-2 backdrop-blur-xl md:grid">
          {[MousePointer2, UploadCloud, Palette, Type, Link2, PenLine, ZoomIn, Presentation, Trash2].map((Icon, index) => (
            <button key={index} type="button" className="grid h-10 w-10 place-items-center rounded-full text-slate-300 transition hover:bg-cyan-300/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200">
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {["Upload", "Color", "Note", "Text", "Link", "Draw", "Zoom", "Present"].map((action) => (
              <button key={action} type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-200 backdrop-blur transition hover:border-cyan-200/40 hover:bg-cyan-300/10 hover:text-white">
                {action}
              </button>
            ))}
          </div>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
            {notes.map((note, index) => (
              <div key={note} className={cn(
                "group mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white/[0.065] shadow-[0_22px_60px_rgba(0,0,0,0.24)] ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.09] hover:shadow-[0_28px_80px_rgba(0,0,0,0.34)]",
                index === 0 && "min-h-72",
                index === 1 && "min-h-96",
                index === 2 && "min-h-64",
                index === 3 && "min-h-80",
                index === 4 && "min-h-[26rem]"
              )}>
                <div className={cn(
                  "h-full min-h-[inherit] bg-[radial-gradient(circle_at_24%_20%,rgba(253,214,114,0.28),transparent_32%),radial-gradient(circle_at_78%_30%,rgba(92,229,255,0.20),transparent_35%),linear-gradient(145deg,rgba(8,15,28,0.98),rgba(20,31,52,0.78))] p-5",
                  index === 2 && "bg-[radial-gradient(circle_at_24%_20%,rgba(120,255,196,0.22),transparent_32%),linear-gradient(145deg,rgba(9,16,31,0.98),rgba(32,42,56,0.76))]",
                  index === 3 && "bg-[radial-gradient(circle_at_72%_26%,rgba(168,118,255,0.22),transparent_36%),linear-gradient(145deg,rgba(7,12,27,0.98),rgba(28,30,60,0.76))]"
                )}>
                  <div className="flex h-full min-h-[inherit] flex-col justify-end">
                    <div className="translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100">{note}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-100">Visual note layer prepared for annotations, Experience Bible links, Visual DNA, comments, and creative review.</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-[#d7ad4b] p-5 text-slate-950 shadow-[0_22px_60px_rgba(0,0,0,0.24)]">
              <p className="text-xs font-black uppercase tracking-[0.18em]">Color Card</p>
              <h4 className="mt-16 text-2xl font-black">Civilization Gold</h4>
              <p className="mt-2 font-mono text-sm font-bold">#D7AD4B</p>
              <p className="mt-3 text-sm font-semibold">Token relationship: accent.civilization.gold</p>
            </div>
            <div className="mb-4 break-inside-avoid rounded-2xl border border-white/10 bg-slate-950/55 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.24)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Typography Card</p>
              <h4 className="mt-8 text-4xl font-black text-white">Headlines</h4>
              <p className="mt-4 text-sm leading-6 text-slate-300">Future font studies, reading rhythm, labels, navigation, and body tone belong on the canvas beside visual references.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InspirationBoardCard({ board }: { board: ExperienceInspirationBoard }) {
  const heights = ["h-72", "h-80", "h-96", "h-[28rem]", "h-[32rem]"];
  const heightClass = heights[board.title.length % heights.length];

  return (
    <article id={board.id} className="group mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-white/[0.06] shadow-[0_22px_70px_rgba(0,0,0,0.26)] ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.09] hover:shadow-[0_30px_90px_rgba(0,0,0,0.34)] scroll-mt-24">
      <div className={cn("relative min-h-64 bg-[radial-gradient(circle_at_25%_20%,rgba(253,214,114,0.24),transparent_34%),radial-gradient(circle_at_78%_30%,rgba(92,229,255,0.20),transparent_34%),linear-gradient(135deg,rgba(6,15,30,0.95),rgba(11,22,45,0.78))]", heightClass)} aria-label={`${board.title} visual reference card`}>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/92 via-slate-950/40 to-transparent p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">{board.categoryId.replace("inspiration-", "").replaceAll("-", " ")}</p>
          <h3 className="mt-2 text-2xl font-black text-white" title={board.title}>{board.title.replace(" Inspiration Board", "")}</h3>
          <div className="mt-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="line-clamp-3 text-sm leading-6 text-slate-200">{board.creativeGoal}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {board.signatureReinforcement.slice(0, 3).map((tag) => <WorkspaceBadge key={tag} value={tag} className="border-white/15 bg-white/10 text-[0.58rem] text-white" />)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function InspirationBoardsWorkspace({ state, boards }: { state: ExperienceDesignState; boards: ExperienceInspirationBoard[] }) {
  return (
    <div className="space-y-5 lg:col-span-2 2xl:col-span-3">
      <InspirationBoardCanvasPreview state={state} />
      <section aria-label="Inspiration Board infinite masonry canvas" className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.22)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Infinite Canvas / Masonry</p>
            <h3 className="text-2xl font-black text-white">Creative reference wall</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Hope", "Wonder", "Civilization", "Discovery", "Architecture", "Galaxy", "Lighting"].map((cluster) => (
              <span key={cluster} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">{cluster}</span>
            ))}
          </div>
        </div>
        <div className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
        {boards.map((board) => <InspirationBoardCard key={board.id} board={board} />)}
        </div>
      </section>
    </div>
  );
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
      <section className="studio-material-command rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{state.designTokens.id} / Version {state.designTokens.version}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{state.designTokens.title}</h3>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{state.designTokens.purpose}</p>
          </div>
          <WorkspaceBadge value={state.designTokens.status} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <WorkspaceMiniStat label="Libraries" value={state.designTokens.libraries.length} />
          <WorkspaceMiniStat label="Tokens" value={state.designTokens.tokens.length} />
          <WorkspaceMiniStat label="Values" value={state.designTokens.implementationValuesPublished ? "Published" : "Not Published"} />
          <WorkspaceMiniStat label="Runtime" value="Future Milestone" />
        </div>
      </section>

      <WorkspacePanel title="Semantic Libraries" icon={Palette}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {state.designTokens.libraries.map((library) => (
            <div key={library.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-white">{library.name}</p>
                <WorkspaceBadge value={`${library.tokenIds.length}`} className="text-[0.62rem]" />
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{library.purpose}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Rules and Boundaries" icon={ShieldCheck}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Philosophy</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.designTokens.philosophy.join(" ")}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Naming Rules</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.designTokens.namingRules.join(" ")}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Consumers</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.designTokens.consumers.join(", ")}</p>
          </div>
        </div>
      </WorkspacePanel>

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
      <section className="studio-material-command rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{state.materials.id} / Version {state.materials.version}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{state.materials.title}</h3>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{state.materials.purpose}</p>
          </div>
          <WorkspaceBadge value={state.materials.status} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <WorkspaceMiniStat label="Categories" value={state.materials.categories.length} />
          <WorkspaceMiniStat label="Materials" value={state.materials.materials.length} />
          <WorkspaceMiniStat label="Preview Modes" value={state.materials.previewSupport.length} />
          <WorkspaceMiniStat label="Runtime" value="Future Milestone" />
        </div>
      </section>

      <WorkspacePanel title="Material Categories" icon={Layers3}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {state.materials.categories.map((category) => (
            <div key={category.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-white">{category.name}</p>
                <WorkspaceBadge value={`${category.materialIds.length}`} className="text-[0.62rem]" />
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{category.purpose}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Material Rules and Preview Support" icon={ShieldCheck}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Philosophy</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.materials.philosophy.join(" ")}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Relationships</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.materials.relationshipTargets.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Preview Metadata</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.materials.previewSupport.join(", ")}</p>
          </div>
        </div>
      </WorkspacePanel>

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
      <section className="studio-material-command rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{state.motion.id} / Version {state.motion.version}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{state.motion.title}</h3>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{state.motion.purpose}</p>
          </div>
          <WorkspaceBadge value={state.motion.status} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <WorkspaceMiniStat label="Categories" value={state.motion.categories.length} />
          <WorkspaceMiniStat label="Motions" value={state.motion.motions.length} />
          <WorkspaceMiniStat label="Camera Moves" value={state.motion.cameraLanguage.length} />
          <WorkspaceMiniStat label="Runtime" value="Future Milestone" />
        </div>
      </section>

      <WorkspacePanel title="Motion Categories" icon={Route}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {state.motion.categories.map((category) => (
            <div key={category.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-white">{category.name}</p>
                <WorkspaceBadge value={`${category.motionIds.length}`} className="text-[0.62rem]" />
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{category.purpose}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Camera Language" icon={Eye}>
        <div className="grid gap-3 md:grid-cols-5">
          {state.motion.cameraLanguage.map((cameraMove) => (
            <div key={cameraMove.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{cameraMove.from}</p>
              <p className="mt-2 text-lg font-black text-white">{cameraMove.to}</p>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{cameraMove.purpose}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Rules and Accessibility" icon={ShieldCheck}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Always</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.motion.rules.always.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Never</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.motion.rules.never.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Accessibility</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.motion.accessibilitySupport.join(", ")}</p>
          </div>
        </div>
      </WorkspacePanel>

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
      <section className="studio-material-command rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{state.componentLibrary.id} / Version {state.componentLibrary.version}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{state.componentLibrary.title}</h3>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{state.componentLibrary.purpose}</p>
          </div>
          <WorkspaceBadge value={state.componentLibrary.status} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <WorkspaceMiniStat label="Categories" value={state.componentLibrary.categories.length} />
          <WorkspaceMiniStat label="Components" value={state.componentLibrary.components.length} />
          <WorkspaceMiniStat label="States" value={state.componentLibrary.states.length} />
          <WorkspaceMiniStat label="Runtime" value="Future Milestone" />
        </div>
      </section>

      <WorkspacePanel title="Component Categories" icon={Library}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {state.componentLibrary.categories.map((category) => (
            <div key={category.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-white">{category.name}</p>
                <WorkspaceBadge value={`${category.componentIds.length}`} className="text-[0.62rem]" />
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{category.purpose}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="States, Sizes, and Accessibility" icon={ShieldCheck}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Semantic States</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.componentLibrary.states.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Semantic Sizes</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.componentLibrary.sizes.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Accessibility</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{state.componentLibrary.accessibilitySupport.join(", ")}</p>
          </div>
        </div>
      </WorkspacePanel>

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
      <section className="studio-material-command rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{state.interactionPatterns.id} / Version {state.interactionPatterns.version}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{state.interactionPatterns.title}</h3>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{state.interactionPatterns.purpose}</p>
          </div>
          <WorkspaceBadge value={state.interactionPatterns.status} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <WorkspaceMiniStat label="Categories" value={state.interactionPatterns.categories.length} />
          <WorkspaceMiniStat label="Patterns" value={state.interactionPatterns.patterns.length} />
          <WorkspaceMiniStat label="Contracts" value={state.interactionPatterns.designContracts.status} />
          <WorkspaceMiniStat label="Runtime" value="Future Milestone" />
        </div>
      </section>

      <WorkspacePanel title="Pattern Categories" icon={Route}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {state.interactionPatterns.categories.map((category) => (
            <div key={category.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-white">{category.name}</p>
                <WorkspaceBadge value={`${category.patternIds.length}`} className="text-[0.62rem]" />
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{category.purpose}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Design Contracts" icon={ShieldCheck}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {state.interactionPatterns.designContracts.checks.map((check) => (
            <div key={check.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-white">{check.label}</p>
                <WorkspaceBadge value={check.status} className="text-[0.62rem]" />
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{check.notes}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>

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
      <section className="studio-material-command rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{state.screenLibrary.id} / Version {state.screenLibrary.version}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{state.screenLibrary.title}</h3>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{state.screenLibrary.purpose}</p>
          </div>
          <WorkspaceBadge value={state.screenLibrary.status} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <WorkspaceMiniStat label="Categories" value={state.screenLibrary.categories.length} />
          <WorkspaceMiniStat label="Screens" value={state.screenLibrary.screens.length} />
          <WorkspaceMiniStat label="Contracts" value={state.screenLibrary.designContracts.status} />
          <WorkspaceMiniStat label="Runtime" value="Future Milestone" />
        </div>
      </section>

      <WorkspacePanel title="Screen Categories" icon={Layers3}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.screenLibrary.categories.map((category) => (
            <div key={category.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-white">{category.name}</p>
                <WorkspaceBadge value={`${category.screenIds.length}`} className="text-[0.62rem]" />
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{category.purpose}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Design Contracts" icon={ShieldCheck}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {state.screenLibrary.designContracts.checks.map((check) => (
            <div key={check.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-white">{check.label}</p>
                <WorkspaceBadge value={check.status} className="text-[0.62rem]" />
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{check.notes}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {screens.map((screen) => <ScreenDefinitionCard key={screen.id} screen={screen} />)}
      </section>
    </div>
  );
}

export function ExperienceDesignWorkspace({ state, initialSection = "dashboard" }: { state: ExperienceDesignState; initialSection?: string }) {
  const resolvedSection = state.sections.some((section) => section.id === initialSection) ? initialSection : "dashboard";
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

  const filteredBoards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.inspirationBoards.boards.filter((board) => {
      if (!normalized) return true;
      const text = [
        board.id,
        board.title,
        board.subtitle,
        board.purpose,
        board.creativeGoal,
        board.status,
        board.owner,
        board.tags.join(" "),
        board.keywords.join(" "),
        board.notes.join(" "),
        board.annotationCategories.join(" "),
        board.signatureReinforcement.join(" "),
        board.experienceBibleReferences.join(" "),
        board.visualDnaReferences.join(" ")
      ].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [query, state.inspirationBoards.boards]);

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

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Canonical Creative Authoring"
        title="Experience Design"
        description="ED-01 establishes Studio as the source of truth for NOVERIS creative direction: Bible, inspiration boards, concepts, screen intent, design systems, motion, themes, journeys, reviews, and history. Runtime and game implementation remain untouched."
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
          {currentSection.id === "inspiration-boards" ? <InspirationBoardsWorkspace state={state} boards={filteredBoards} /> : null}
          {currentSection.id === "tokens" ? <DesignTokensWorkspace state={state} tokens={filteredTokens} /> : null}
          {currentSection.id === "materials" ? <MaterialsWorkspace state={state} materials={filteredMaterials} /> : null}
          {currentSection.id === "motion" ? <MotionWorkspace state={state} motions={filteredMotions} /> : null}
          {currentSection.id === "components" ? <ComponentLibraryWorkspace state={state} components={filteredComponents} /> : null}
          {currentSection.id === "patterns" ? <InteractionPatternsWorkspace state={state} patterns={filteredPatterns} /> : null}
          {currentSection.id === "screens" ? <ScreenLibraryWorkspace state={state} screens={filteredScreens} /> : null}
          {currentSection.id !== "inspiration-boards" && currentSection.id !== "tokens" && currentSection.id !== "materials" && currentSection.id !== "motion" && currentSection.id !== "components" && currentSection.id !== "patterns" && currentSection.id !== "screens" ? filteredRecords.map((record) => <ExperienceRecordCard key={record.id} state={state} record={record} />) : null}
          {currentSection.id !== "inspiration-boards" && currentSection.id !== "tokens" && currentSection.id !== "materials" && currentSection.id !== "motion" && currentSection.id !== "components" && currentSection.id !== "patterns" && currentSection.id !== "screens" && !filteredRecords.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Experience Design records match this view.</p> : null}
          {currentSection.id === "inspiration-boards" && !filteredBoards.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Inspiration Boards match this view.</p> : null}
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
