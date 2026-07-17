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
  Layers3,
  Library,
  MessageSquareText,
  Palette,
  Route,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceSearchBar, WorkspaceStatTile, WorkspaceTabs } from "@/components/ui/workspace";
import type { ExperienceDesignKind, ExperienceDesignRecord, ExperienceDesignSection, ExperienceDesignState } from "@/lib/experience-design";
import { cn } from "@/lib/utils";

type ExperienceTab = "dashboard" | "library" | "models" | "reviews" | "history";

const sectionIcons: Record<string, ComponentType<{ className?: string }>> = {
  dashboard: Palette,
  bible: BookOpen,
  "mood-boards": GalleryHorizontalEnd,
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

  const reviewCounts = state.reviewWorkflow.map((status) => ({
    status,
    count: state.records.filter((record) => record.status === status).length
  }));

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Canonical Creative Authoring"
        title="Experience Design"
        description="ED-01 establishes Studio as the source of truth for NOVERIS creative direction: Bible, mood boards, concepts, screen intent, design systems, motion, themes, journeys, reviews, and history. Runtime and game implementation remain untouched."
        stats={[
          { label: "Framework", value: state.frameworkId },
          { label: "Version", value: state.version },
          { label: "Records", value: state.records.length },
          { label: "Runtime", value: "Not Published" }
        ]}
      />

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

      <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search Bible, mood boards, concepts, screens, tokens, materials, motion, components, themes, journeys, reviews" />

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
          {filteredRecords.map((record) => <ExperienceRecordCard key={record.id} state={state} record={record} />)}
          {!filteredRecords.length ? <p className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-6 text-sm font-semibold text-slate-400">No Experience Design records match this view.</p> : null}
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
