"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Archive, BookOpen, CheckCircle2, ChevronDown, ChevronRight, Clock3, Edit3, FileText, History, MessageSquareText, Search, ShieldCheck } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceSearchBar, WorkspaceStatTile } from "@/components/ui/workspace";
import type { ExperienceBibleChapter, ExperienceBiblePart, ExperienceBibleState } from "@/lib/experience-design";
import { adjacentExperienceBibleChapters } from "@/lib/experience-design";
import { cn } from "@/lib/utils";

type BibleMode = "landing" | "part" | "chapter" | "edit" | "history" | "review" | "versions";

const storageKey = "project-genesis-experience-bible-parts";

function statusCounts(chapters: ExperienceBibleChapter[]) {
  return {
    approved: chapters.filter((chapter) => chapter.reviewStatus === "Approved").length,
    draft: chapters.filter((chapter) => chapter.reviewStatus === "Draft").length,
    inReview: chapters.filter((chapter) => chapter.reviewStatus === "In Review").length,
    deprecated: chapters.filter((chapter) => chapter.reviewStatus === "Deprecated").length,
    archived: chapters.filter((chapter) => chapter.reviewStatus === "Archived").length
  };
}

function chaptersForPart(state: ExperienceBibleState, partId: string) {
  return state.chapters.filter((chapter) => chapter.partId === partId).sort((left, right) => left.chapterNumber - right.chapterNumber);
}

function partForChapter(state: ExperienceBibleState, chapter: ExperienceBibleChapter) {
  return state.parts.find((part) => part.id === chapter.partId);
}

function chapterHref(chapter: ExperienceBibleChapter, mode: "read" | "edit" | "history" | "review" = "read") {
  const suffix = mode === "read" ? "" : `/${mode}`;
  return `/experience-design/bible/chapter/${chapter.slug}${suffix}`;
}

function PartToc({
  state,
  activePartId,
  activeChapterId
}: {
  state: ExperienceBibleState;
  activePartId?: string;
  activeChapterId?: string;
}) {
  const [expanded, setExpanded] = useState<string[]>(state.parts.map((part) => part.id));
  const [query, setQuery] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) setExpanded(parsed.filter((item): item is string => typeof item === "string"));
    } catch {
      setExpanded(state.parts.map((part) => part.id));
    }
  }, [state.parts]);

  function toggle(partId: string) {
    const next = expanded.includes(partId) ? expanded.filter((id) => id !== partId) : [...expanded, partId];
    setExpanded(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  const normalized = query.trim().toLowerCase();

  return (
    <aside className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-3" aria-label="Experience Bible table of contents">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-cyan-200" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chapters"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-600"
        />
      </div>
      <div className="mt-3 space-y-2">
        {state.parts.map((part) => {
          const chapters = chaptersForPart(state, part.id).filter((chapter) => {
            if (!normalized) return true;
            return [chapter.title, chapter.subtitle, chapter.summary, chapter.tags.join(" "), chapter.keywords.join(" ")].join(" ").toLowerCase().includes(normalized);
          });
          if (!chapters.length) return null;
          const open = expanded.includes(part.id);
          const counts = statusCounts(chaptersForPart(state, part.id));
          return (
            <section key={part.id} className={cn("rounded-md border border-cyan-300/10", activePartId === part.id && "border-cyan-200/45 bg-cyan-300/5")}>
              <button
                type="button"
                onClick={() => toggle(part.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
                aria-expanded={open}
              >
                {open ? <ChevronDown className="h-4 w-4 text-cyan-200" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Part {part.roman}</span>
                  <span className="block truncate text-sm font-black text-white">{part.title}</span>
                </span>
                <span className="text-xs font-bold text-slate-500">{counts.approved}/{chaptersForPart(state, part.id).length}</span>
              </button>
              {open ? (
                <div className="border-t border-cyan-300/10 p-2">
                  {chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={chapterHref(chapter)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-slate-400 transition hover:bg-cyan-300/10 hover:text-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200",
                        activeChapterId === chapter.id && "bg-cyan-300/15 text-white"
                      )}
                    >
                      <span className="w-7 shrink-0 text-xs font-black text-cyan-300">{chapter.chapterNumber}</span>
                      <span className="min-w-0 flex-1 truncate">{chapter.title}</span>
                      <span className="shrink-0 text-[0.62rem] uppercase tracking-[0.12em] text-slate-600">{chapter.reviewStatus}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function ChapterCard({ chapter, part }: { chapter: ExperienceBibleChapter; part?: ExperienceBiblePart }) {
  return (
    <Link href={chapterHref(chapter)} className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4 transition hover:border-cyan-200/45 hover:bg-cyan-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Chapter {chapter.chapterNumber}</p>
          <h3 className="mt-2 truncate text-lg font-black text-white">{chapter.title}</h3>
          <p className="mt-1 truncate text-sm text-slate-500">{part?.title}</p>
        </div>
        <WorkspaceBadge value={chapter.reviewStatus} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{chapter.purpose}</p>
    </Link>
  );
}

function ChapterDetail({ state, chapter, mode }: { state: ExperienceBibleState; chapter: ExperienceBibleChapter; mode: BibleMode }) {
  const part = partForChapter(state, chapter);
  const adjacent = adjacentExperienceBibleChapters(chapter);
  const reading = mode === "chapter";
  return (
    <div className="space-y-4">
      <WorkspacePanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Part {part?.roman} / Chapter {chapter.chapterNumber}</p>
            <h1 className="mt-3 text-4xl font-black text-white">{chapter.title}</h1>
            <p className="mt-2 text-lg text-slate-400">{chapter.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <WorkspaceBadge value={chapter.canonicalStatus} />
            <WorkspaceBadge value={chapter.reviewStatus} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={chapterHref(chapter)} className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm font-bold text-cyan-100">Read</Link>
          <Link href={chapterHref(chapter, "edit")} className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm font-bold text-cyan-100">Edit</Link>
          <Link href={chapterHref(chapter, "review")} className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm font-bold text-cyan-100">Review</Link>
          <Link href={chapterHref(chapter, "history")} className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm font-bold text-cyan-100">History</Link>
        </div>
      </WorkspacePanel>

      {mode === "edit" ? (
        <WorkspacePanel title="Authoring Workflow" icon={Edit3}>
          <div className="grid gap-3 md:grid-cols-3">
            <WorkspaceMiniStat label="Structured Sections" value={chapter.bodySections.length} />
            <WorkspaceMiniStat label="Attachments" value={chapter.attachments.length} />
            <WorkspaceMiniStat label="Linked Records" value={chapter.linkedConcepts.length + chapter.linkedMoodBoards.length + chapter.linkedScreens.length} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {["Add Section", "Reorder Sections", "Select Attachments", "Link Records", "Preview Mode", "Submit for Review"].map((action) => (
              <button key={action} type="button" className="rounded-md border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-left text-sm font-bold text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200">{action}</button>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">DV-02A establishes the authoring surface and workflow controls. Persisted editing actions can attach to the existing Studio action API in a later implementation pass.</p>
        </WorkspacePanel>
      ) : null}

      {mode === "review" ? (
        <WorkspacePanel title="Review" icon={MessageSquareText}>
          <div className="grid gap-3 md:grid-cols-5">
            {["Draft", "In Review", "Approved", "Deprecated", "Archived"].map((stateName) => <WorkspaceMiniStat key={stateName} label={stateName} value={stateName === chapter.reviewStatus ? "Current" : "Available"} />)}
          </div>
          <div className="mt-4 space-y-2">
            {chapter.reviewNotes.length ? chapter.reviewNotes.map((note) => <p key={note} className="rounded-md border border-cyan-300/10 p-3 text-sm text-slate-300">{note}</p>) : <p className="text-sm text-slate-400">No review notes yet.</p>}
          </div>
        </WorkspacePanel>
      ) : null}

      {mode === "history" ? (
        <WorkspacePanel title="Version History" icon={History}>
          <div className="space-y-3">
            {chapter.changeHistory.map((entry) => (
              <div key={entry.id} className="grid gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 md:grid-cols-[12rem_1fr_10rem]">
                <p className="font-black text-cyan-100">{entry.action}</p>
                <p className="text-sm text-slate-300">{entry.notes}</p>
                <p className="text-sm text-slate-500">{entry.timestamp.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      ) : null}

      {reading ? (
        <WorkspacePanel title="Reading Mode" icon={BookOpen} className="bg-[#081322]/95">
          <article className="mx-auto max-w-4xl space-y-6">
            <p className="text-xl leading-9 text-slate-200">{chapter.summary}</p>
            {chapter.bodySections.map((section) => (
              <section key={section.id} id={section.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{section.type.replaceAll("_", " ")}</p>
                <h2 className="mt-2 text-2xl font-black text-white">{section.title}</h2>
                <p className="mt-3 leading-7 text-slate-300">{section.content}</p>
              </section>
            ))}
          </article>
        </WorkspacePanel>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <WorkspacePanel title="Principles" icon={ShieldCheck}>
          <p className="text-sm text-slate-400">{chapter.designPrinciples.length ? chapter.designPrinciples.join(", ") : "No principles authored yet."}</p>
        </WorkspacePanel>
        <WorkspacePanel title="Must Always" icon={CheckCircle2}>
          <p className="text-sm text-slate-400">{chapter.mustAlways.length ? chapter.mustAlways.join(", ") : "No must-always rules authored yet."}</p>
        </WorkspacePanel>
        <WorkspacePanel title="Must Never" icon={Archive}>
          <p className="text-sm text-slate-400">{chapter.mustNever.length ? chapter.mustNever.join(", ") : "No must-never rules authored yet."}</p>
        </WorkspacePanel>
      </section>

      <WorkspacePanel title="References, Links, and Attachments" icon={FileText}>
        <div className="grid gap-3 md:grid-cols-4">
          <WorkspaceMiniStat label="References" value={chapter.references.length} />
          <WorkspaceMiniStat label="Attachments" value={chapter.attachments.length} />
          <WorkspaceMiniStat label="Linked Screens" value={chapter.linkedScreens.length} />
          <WorkspaceMiniStat label="Linked Concepts" value={chapter.linkedConcepts.length} />
        </div>
      </WorkspacePanel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {adjacent.previous ? <Link href={chapterHref(adjacent.previous)} className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm font-bold text-cyan-100">Previous: {adjacent.previous.title}</Link> : <span />}
        {adjacent.next ? <Link href={chapterHref(adjacent.next)} className="rounded-md border border-cyan-300/20 px-3 py-2 text-sm font-bold text-cyan-100">Next: {adjacent.next.title}</Link> : null}
      </div>
    </div>
  );
}

export function ExperienceBibleWorkspace({
  state,
  mode = "landing",
  partId,
  chapter
}: {
  state: ExperienceBibleState;
  mode?: BibleMode;
  partId?: string;
  chapter?: ExperienceBibleChapter;
}) {
  const [query, setQuery] = useState("");
  const counts = statusCounts(state.chapters);
  const activePart = partId ? state.parts.find((part) => part.id === partId) : chapter ? partForChapter(state, chapter) : undefined;
  const normalized = query.trim().toLowerCase();
  const visibleChapters = state.chapters.filter((item) => {
    const partMatch = mode === "part" && partId ? item.partId === partId : true;
    if (!partMatch) return false;
    if (!normalized) return true;
    return [item.title, item.subtitle, item.summary, item.purpose, item.tags.join(" "), item.keywords.join(" "), item.bodySections.map((section) => section.content).join(" ")].join(" ").toLowerCase().includes(normalized);
  });

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="DV-02 / Experience Bible"
        title={mode === "part" && activePart ? activePart.title : state.title}
        description="The living creative bible for NOVERIS. DV-02A owns the structure and DV-02B drafts Part I as reviewable creative guidance without publishing anything to runtime."
        stats={[
          { label: "Release", value: `${state.release.id} v${state.release.version}` },
          { label: "Status", value: state.status },
          { label: "Parts", value: state.parts.length },
          { label: "Chapters", value: state.chapters.length }
        ]}
      />

      <section className="grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <PartToc state={state} activePartId={activePart?.id} activeChapterId={chapter?.id} />
        <div className="space-y-5">
          {mode === "versions" ? (
            <WorkspacePanel title="Bible Version History" icon={History}>
              <div className="grid gap-3 md:grid-cols-3">
                <WorkspaceMiniStat label="Releases" value={state.contentReleases.length} />
                <WorkspaceMiniStat label="Latest Draft" value={`${state.contentReleases.at(-1)?.id ?? state.release.id} v${state.contentReleases.at(-1)?.version ?? state.release.version}`} />
                <WorkspaceMiniStat label="Status" value={state.contentReleases.at(-1)?.status ?? state.release.status} />
              </div>
              <div className="mt-4 space-y-3">
                {state.contentReleases.map((release) => (
                  <section key={release.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{release.id} / v{release.version}</p>
                        <h3 className="mt-1 text-lg font-black text-white">{release.title}</h3>
                      </div>
                      <WorkspaceBadge value={release.status} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <WorkspaceMiniStat label="Created" value={release.createdAt.slice(0, 10)} />
                      <WorkspaceMiniStat label="Chapters" value={release.chapterIds.length} />
                    </div>
                    <div className="mt-3 space-y-2">
                      {release.notes.map((note) => <p key={note} className="text-sm leading-6 text-slate-300">{note}</p>)}
                    </div>
                  </section>
                ))}
              </div>
            </WorkspacePanel>
          ) : null}

          {chapter ? <ChapterDetail state={state} chapter={chapter} mode={mode === "edit" || mode === "history" || mode === "review" ? mode : "chapter"} /> : null}

          {!chapter ? (
            <>
              <section className="grid gap-3 md:grid-cols-5">
                <WorkspaceStatTile label="Approved" value={counts.approved} />
                <WorkspaceStatTile label="Draft" value={counts.draft} />
                <WorkspaceStatTile label="In Review" value={counts.inReview} />
                <WorkspaceStatTile label="Deprecated" value={counts.deprecated} />
                <WorkspaceStatTile label="Archived" value={counts.archived} />
              </section>

              <WorkspacePanel title="Governance" icon={ShieldCheck}>
                <div className="grid gap-2 lg:grid-cols-2">
                  {state.governanceRules.map((rule) => <p key={rule} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm text-slate-300">{rule}</p>)}
                </div>
              </WorkspacePanel>

              <WorkspacePanel title="noveris.life Reference Framework" icon={BookOpen}>
                <div className="grid gap-3 lg:grid-cols-[1fr_18rem]">
                  <div className="flex flex-wrap gap-2">
                    {state.noverisLifeReferenceFramework.supportedReferenceTypes.map((item) => <WorkspaceBadge key={item} value={item} />)}
                  </div>
                  <div className="space-y-2">
                    {state.noverisLifeReferenceFramework.guidance.map((item) => <p key={item} className="text-sm text-slate-300">{item}</p>)}
                  </div>
                </div>
              </WorkspacePanel>

              <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search chapters, body sections, principles, tags, keywords, references, and open questions" />

              {mode === "part" && activePart ? (
                <WorkspacePanel title={`Part ${activePart.roman}: ${activePart.title}`} icon={BookOpen}>
                  <p className="text-sm leading-6 text-slate-300">{activePart.summary}</p>
                </WorkspacePanel>
              ) : null}

              <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {visibleChapters.map((item) => <ChapterCard key={item.id} chapter={item} part={partForChapter(state, item)} />)}
              </section>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
