"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Files, ImageIcon, Layers3, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportIssue, StarSystemBackgroundRecord, StarSystemBackgroundTemplateSpec } from "@/types/runtime";

const tabs = ["Overview", "Source PSD", "Composition", "Visual Matching", "Assignments", "Runtime Derivatives", "Validation", "History"] as const;

type AssignmentSystem = {
  id: string;
  name: string;
  type: string;
  readiness: string;
};

type StarSystemBackgroundsWorkspaceProps = {
  records: StarSystemBackgroundRecord[];
  templateSpec: StarSystemBackgroundTemplateSpec;
  validationIssues: ImportIssue[];
  systems: AssignmentSystem[];
};

function statusClass(status: string) {
  if (/published|approved|ready/i.test(status)) return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  if (/warning|review|draft/i.test(status)) return "border-amber-300/35 bg-amber-400/10 text-amber-100";
  return "border-rose-300/35 bg-rose-400/10 text-rose-100";
}

function SmallMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-cyan-300/10 bg-slate-950/35 px-3 py-2">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-lg font-black text-white">{value}</p>
    </div>
  );
}

function PreviewPanel({ record }: { record: StarSystemBackgroundRecord }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-md border border-cyan-300/20 bg-[#050b16]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(125,211,252,0.18),transparent_13%),radial-gradient(circle_at_25%_35%,rgba(34,211,238,0.10),transparent_24%),linear-gradient(135deg,rgba(8,47,73,0.55),rgba(2,6,23,0.96))]" />
      <div className="absolute inset-8 rounded-full border border-cyan-100/15" />
      <div className="absolute inset-16 rounded-full border border-cyan-100/10" />
      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_42px_rgba(125,211,252,0.42)]" />
      <div
        className="absolute rounded-full border border-amber-200/60"
        style={{
          left: `${(record.starExclusionZone.x - record.starExclusionZone.radius) * 100}%`,
          top: `${(record.starExclusionZone.y - record.starExclusionZone.radius) * 100}%`,
          width: `${record.starExclusionZone.radius * 200}%`,
          height: `${record.starExclusionZone.radius * 200}%`
        }}
      />
      <div className="absolute bottom-3 left-3 rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
        Runtime overlay preview
      </div>
    </div>
  );
}

function RecordList({
  records,
  selectedId,
  onSelect
}: {
  records: StarSystemBackgroundRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {records.map((record) => (
        <button
          key={record.id}
          type="button"
          onClick={() => onSelect(record.id)}
          className={cn(
            "w-full rounded-md border bg-slate-950/35 p-3 text-left transition hover:border-cyan-300/45",
            selectedId === record.id ? "border-cyan-300/55 shadow-[0_0_24px_rgba(34,211,238,0.10)]" : "border-cyan-300/12"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{record.name}</p>
              <p className="mt-1 truncate text-xs font-bold text-cyan-100">{record.id}</p>
            </div>
            <span className={cn("rounded-md border px-2 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em]", statusClass(record.status))}>{record.status}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <SmallMetric label="Source" value={`r${record.sourceRevision}`} />
            <SmallMetric label="Runtime" value={`r${record.runtimeRevision}`} />
          </div>
        </button>
      ))}
    </div>
  );
}

function TabContent({ tab, record, templateSpec, validationIssues, systems }: { tab: typeof tabs[number]; record: StarSystemBackgroundRecord; templateSpec: StarSystemBackgroundTemplateSpec; validationIssues: ImportIssue[]; systems: AssignmentSystem[] }) {
  const issues = validationIssues.filter((issue) => issue.records.includes(record.id));
  const assignedSystems = useMemo(() => {
    return record.assignedSystemIds.map((id) => systems.find((system) => system.id === id) ?? { id, name: id, type: "Unresolved", readiness: "Not Published" });
  }, [record.assignedSystemIds, systems]);

  if (tab === "Source PSD") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <SmallMetric label="Source format" value={record.sourceFormat.toUpperCase()} />
        <SmallMetric label="Source filename" value={record.sourceFilename} />
        <SmallMetric label="Source asset" value={record.sourceAssetId} />
        <SmallMetric label="Parser support" value={record.validation.parserCapabilities.layerGroups ? "Layer parsing" : "Metadata only"} />
        <div className="md:col-span-2 rounded-md border border-amber-300/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          Full PSD layer parsing is not marked as supported yet. Studio tracks the PSD as the private canonical source and publishes only runtime derivatives.
        </div>
      </div>
    );
  }

  if (tab === "Composition") {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <PreviewPanel record={record} />
        <div className="grid gap-3">
          <SmallMetric label="Fit" value={record.fit} />
          <SmallMetric label="Blend" value={record.blendMode} />
          <SmallMetric label="Opacity" value={record.opacity} />
          <SmallMetric label="Star exclusion" value={`${Math.round(record.starExclusionZone.radius * 100)}% radius`} />
          <SmallMetric label="Focal point" value={`${record.focalPoint.x}, ${record.focalPoint.y}`} />
        </div>
      </div>
    );
  }

  if (tab === "Visual Matching") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {record.compatiblePaletteIds.map((id) => <span key={id} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">{id}</span>)}
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <SmallMetric label="Exposure" value={record.colorGrade.exposure} />
          <SmallMetric label="Saturation" value={record.colorGrade.saturation} />
          <SmallMetric label="Contrast" value={record.colorGrade.contrast} />
          <SmallMetric label="Hue shift" value={record.colorGrade.hueShift} />
        </div>
      </div>
    );
  }

  if (tab === "Assignments") {
    return (
      <div className="space-y-3">
        {assignedSystems.map((system) => (
          <div key={system.id} className="rounded-md border border-cyan-300/12 bg-slate-950/35 p-4">
            <p className="text-sm font-black text-white">{system.name}</p>
            <p className="mt-1 text-xs font-bold text-cyan-100">{system.id}</p>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "Runtime Derivatives") {
    return (
      <div className="space-y-3">
        {templateSpec.derivativeTargets.map((target) => {
          const derivative = record.derivatives.find((row) => row.targetId === target.id);
          return (
            <div key={target.id} className="grid gap-3 rounded-md border border-cyan-300/12 bg-slate-950/35 p-4 md:grid-cols-[1fr_8rem_8rem_8rem]">
              <div>
                <p className="text-sm font-black text-white">{target.id}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{target.width}x{target.height} {target.format.toUpperCase()}</p>
              </div>
              <span className="text-sm font-bold text-slate-300">{target.publicRuntime ? "Runtime" : "Review"}</span>
              <span className={cn("rounded-md border px-2 py-1 text-center text-[0.62rem] font-black uppercase tracking-[0.14em]", statusClass(derivative?.status ?? "pending"))}>{derivative?.status ?? "pending"}</span>
              <span className="truncate text-xs font-bold text-slate-500">{derivative?.publicPath ?? "Not generated"}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (tab === "Validation") {
    return (
      <div className="space-y-3">
        {issues.map((issue) => (
          <div key={`${issue.code}-${issue.records.join("-")}`} className={cn("rounded-md border p-4", issue.severity === "error" ? "border-rose-300/25 bg-rose-400/10" : issue.severity === "warning" ? "border-amber-300/25 bg-amber-400/10" : "border-cyan-300/15 bg-cyan-400/10")}>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{issue.severity} / {issue.code}</p>
            <p className="mt-2 text-sm font-bold text-white">{issue.message}</p>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "History") {
    return (
      <div className="space-y-3">
        <SmallMetric label="Created" value={record.createdAt.slice(0, 10)} />
        <SmallMetric label="Updated" value={record.updatedAt.slice(0, 10)} />
        <SmallMetric label="Published" value={record.publishedAt ? record.publishedAt.slice(0, 10) : "Not published"} />
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <SmallMetric label="Record ID" value={record.id} />
      <SmallMetric label="Status" value={record.status} />
      <SmallMetric label="Assigned systems" value={record.assignedSystemIds.length} />
      <SmallMetric label="Mode" value={record.backgroundMode} />
      <div className="md:col-span-4 rounded-md border border-cyan-300/12 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300">{record.notes}</div>
    </div>
  );
}

export function StarSystemBackgroundsWorkspace({ records: initialRecords, templateSpec, validationIssues, systems }: StarSystemBackgroundsWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialRecords[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Overview");
  const records = useMemo(() => initialRecords.filter((record) => [record.name, record.id, record.sourceFilename, ...record.visualTags].join(" ").toLowerCase().includes(query.toLowerCase())), [initialRecords, query]);
  const selected = initialRecords.find((record) => record.id === selectedId) ?? initialRecords[0];
  const errorCount = validationIssues.filter((issue) => issue.severity === "error").length;
  const warningCount = validationIssues.filter((issue) => issue.severity === "warning").length;

  return (
    <main className="space-y-6">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Universe Assets</p>
            <h1 className="mt-2 text-4xl font-black text-white">Star System Backgrounds</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
              Canonical PSD source records, composition metadata, assignment rules, and sanitized runtime derivatives for face-on star-system atlas backgrounds.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60">
              <Files className="h-4 w-4" />
              Template Spec
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-md border border-slate-500/35 bg-slate-950/45 px-4 py-3 text-sm font-black text-slate-200 transition hover:border-cyan-200/45">
              <ImageIcon className="h-4 w-4" />
              Add PSD Source
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <SmallMetric label="Records" value={initialRecords.length} />
        <SmallMetric label="Published" value={initialRecords.filter((record) => record.status === "published").length} />
        <SmallMetric label="Warnings" value={warningCount} />
        <SmallMetric label="Errors" value={errorCount} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[22rem_1fr]">
        <aside className="space-y-4 rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          <label className="flex items-center gap-3 rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2">
            <Search className="h-4 w-4 text-cyan-200" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search backgrounds" className="h-10 min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600" />
          </label>
          <RecordList records={records} selectedId={selectedId} onSelect={setSelectedId} />
        </aside>

        {selected ? (
          <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Background Record</p>
                <h2 className="mt-2 truncate text-3xl font-black text-white">{selected.name}</h2>
                <p className="mt-1 truncate text-sm font-bold text-cyan-100">{selected.id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={cn("rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em]", statusClass(selected.status))}>{selected.status}</span>
                <span className={cn("rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.14em]", statusClass(selected.validation.status))}>{selected.validation.status}</span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-b border-cyan-300/10 pb-3">
              {tabs.map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={cn("rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.13em] transition", activeTab === tab ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100" : "border-cyan-300/10 bg-slate-950/35 text-slate-400 hover:border-cyan-300/35 hover:text-white")}>{tab}</button>
              ))}
            </div>
            <div className="mt-5">
              <TabContent tab={activeTab} record={selected} templateSpec={templateSpec} validationIssues={validationIssues} systems={systems} />
            </div>
          </section>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          <Layers3 className="h-5 w-5 text-cyan-200" />
          <h3 className="mt-3 text-lg font-black text-white">PSD Template Rules</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{templateSpec.masterDesktop.width}x{templateSpec.masterDesktop.height} master, {templateSpec.minimumDesktop.width}x{templateSpec.minimumDesktop.height} minimum.</p>
        </div>
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          <ShieldCheck className="h-5 w-5 text-cyan-200" />
          <h3 className="mt-3 text-lg font-black text-white">Public Runtime Safety</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Exports include derivative URLs and composition metadata only. PSD files and private source paths are blocked.</p>
        </div>
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/78 p-4">
          {errorCount ? <AlertTriangle className="h-5 w-5 text-amber-200" /> : <CheckCircle2 className="h-5 w-5 text-emerald-200" />}
          <h3 className="mt-3 text-lg font-black text-white">Procedural Fallback</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Unpublished or missing authored backgrounds resolve to deterministic procedural star-system atlas rendering.</p>
        </div>
      </section>
    </main>
  );
}
