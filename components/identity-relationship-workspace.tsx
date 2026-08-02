"use client";

import { useMemo, useState } from "react";
import { Boxes, ChevronRight, GitFork, Link2, Network, Search, ShieldCheck } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceSearchBar, WorkspaceStatTile } from "@/components/ui/workspace";
import {
  calculateChangeImpact,
  findCanonicalIdentity,
  getAssets,
  getChildren,
  getDependencies,
  getParent,
  getPrompt,
  getReferences,
  getRuntime,
  type CanonicalIdentity,
  type IdentityRelationshipGraph
} from "@/lib/identity-relationships";
import { cn } from "@/lib/utils";

type IdentityRelationshipWorkspaceProps = {
  graph: IdentityRelationshipGraph;
};

function RecordLink({ record, onOpen }: { record: CanonicalIdentity; onOpen: (canonicalId: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(record.canonicalId)}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2 text-left transition hover:border-cyan-200/35 hover:bg-cyan-300/5"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-slate-100">{record.displayName}</span>
        <span className="block truncate text-xs text-slate-500">{record.recordType}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-cyan-200" />
    </button>
  );
}

function Identifier({ label, value }: { label: string; value: string }) {
  return <WorkspaceMiniStat label={label} value={value} />;
}

export function IdentityRelationshipWorkspace({ graph }: IdentityRelationshipWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(graph.records[0]?.canonicalId ?? "");
  const recordById = useMemo(() => new Map(graph.records.map((record) => [record.canonicalId, record])), [graph.records]);
  const matchingRecords = useMemo(() => findCanonicalIdentity(graph, query), [graph, query]);
  const selected = recordById.get(selectedId) ?? matchingRecords[0] ?? graph.records[0] ?? null;
  const parent = selected ? getParent(graph, selected.canonicalId) : null;
  const children = selected ? getChildren(graph, selected.canonicalId) : [];
  const dependencies = selected ? getDependencies(graph, selected.canonicalId) : [];
  const references = selected ? getReferences(graph, selected.canonicalId) : [];
  const assets = selected ? getAssets(graph, selected.canonicalId) : [];
  const prompts = selected ? getPrompt(graph, selected.canonicalId) : [];
  const runtime = selected ? getRuntime(graph, selected.canonicalId) : [];
  const impact = selected ? calculateChangeImpact(graph, selected.canonicalId) : null;
  const errors = graph.validation.issues.filter((issue) => issue.severity === "error").length;
  const visibleRecords = matchingRecords.slice(0, 160);

  const open = (canonicalId: string) => setSelectedId(canonicalId);

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Canonical Foundation"
        title="Identity & Relationships"
        description="Stable identities and typed relationships derived from NOVERIS canonical records. Studio owns the full graph; clients receive only gameplay-safe references."
        stats={[
          { label: "Records", value: graph.records.length },
          { label: "Relationships", value: graph.relationships.length },
          { label: "Validation", value: graph.validation.status },
          { label: "Schema", value: graph.version }
        ]}
      />

      <section className="grid gap-3 md:grid-cols-4">
        <WorkspaceStatTile label="Canonical Records" value={graph.records.length} />
        <WorkspaceStatTile label="Typed Links" value={graph.relationships.length} />
        <WorkspaceStatTile label="Types" value={new Set(graph.records.map((record) => record.recordType)).size} />
        <WorkspaceStatTile label="Blocking Issues" value={errors} />
      </section>

      <WorkspaceSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search canonical ID, name, slug, type, owner, parent, child, dependency, or reference"
      />

      <section className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <WorkspacePanel title={`Canonical Index · ${matchingRecords.length} matches`} icon={Search} className="min-w-0">
          <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {visibleRecords.map((record) => (
              <button
                type="button"
                key={record.canonicalId}
                onClick={() => open(record.canonicalId)}
                className={cn(
                  "w-full rounded-md border px-3 py-3 text-left transition",
                  selected?.canonicalId === record.canonicalId
                    ? "border-cyan-200/55 bg-cyan-300/10 shadow-[inset_3px_0_0_rgba(103,232,249,0.95)]"
                    : "border-cyan-300/10 bg-slate-950/35 hover:border-cyan-300/30 hover:bg-cyan-300/5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-white">{record.displayName}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">{record.canonicalId}</span>
                  </span>
                  <WorkspaceBadge value={record.recordType} />
                </div>
              </button>
            ))}
            {matchingRecords.length > visibleRecords.length ? <p className="px-2 py-3 text-xs text-slate-500">Showing the first {visibleRecords.length} results. Refine the search to narrow the index.</p> : null}
            {!matchingRecords.length ? <p className="rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-6 text-center text-sm text-slate-400">No canonical records match this search.</p> : null}
          </div>
        </WorkspacePanel>

        <div className="min-w-0 space-y-4">
          {selected ? (
            <>
              <WorkspacePanel title="Record Inspector" icon={Network}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{selected.recordType}</p>
                    <h2 className="mt-2 truncate text-2xl font-black text-white">{selected.displayName}</h2>
                    <p className="mt-2 break-all font-mono text-xs text-slate-500">{selected.canonicalId}</p>
                  </div>
                  <WorkspaceBadge value={selected.status} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Identifier label="Source ID" value={selected.sourceId} />
                  <Identifier label="Slug" value={selected.slug} />
                  <Identifier label="Version" value={selected.version} />
                  <Identifier label="Owner" value={recordById.get(selected.canonicalOwnerId)?.displayName ?? selected.canonicalOwnerId} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Identifier label="Created" value={selected.createdAt.slice(0, 10)} />
                  <Identifier label="Updated" value={selected.updatedAt.slice(0, 10)} />
                  <Identifier label="Children" value={String(selected.childCount)} />
                  <Identifier label="Dependencies" value={String(selected.dependencyCount)} />
                </div>
              </WorkspacePanel>

              <section className="grid gap-4 xl:grid-cols-2">
                <WorkspacePanel title="Hierarchy" icon={GitFork}>
                  <div className="space-y-3">
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Parent</p>
                      {parent ? <RecordLink record={parent} onOpen={open} /> : <p className="rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2 text-sm text-slate-500">Root canonical record</p>}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Children</p>
                      <div className="space-y-2">{children.length ? children.slice(0, 12).map((record) => <RecordLink key={record.canonicalId} record={record} onOpen={open} />) : <p className="text-sm text-slate-500">No child records.</p>}</div>
                    </div>
                  </div>
                </WorkspacePanel>

                <WorkspacePanel title="Dependencies & References" icon={Link2}>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Dependencies</p>
                      <div className="space-y-2">{dependencies.length ? dependencies.map((record) => <RecordLink key={record.canonicalId} record={record} onOpen={open} />) : <p className="text-sm text-slate-500">No direct dependencies.</p>}</div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">References</p>
                      <div className="space-y-2">{references.length ? references.slice(0, 10).map((record) => <RecordLink key={record.canonicalId} record={record} onOpen={open} />) : <p className="text-sm text-slate-500">No direct references.</p>}</div>
                    </div>
                  </div>
                </WorkspacePanel>
              </section>

              <section className="grid gap-4 xl:grid-cols-2">
                <WorkspacePanel title="Assets, Prompts & Runtime" icon={Boxes}>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <WorkspaceStatTile label="Affected Assets" value={assets.length} />
                    <WorkspaceStatTile label="Prompt Links" value={prompts.length} />
                    <WorkspaceStatTile label="Runtime Links" value={runtime.length} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {assets.slice(0, 8).map((record) => <button key={record.canonicalId} type="button" onClick={() => open(record.canonicalId)}><WorkspaceBadge value={record.displayName} /></button>)}
                    {prompts.slice(0, 8).map((record) => <button key={record.canonicalId} type="button" onClick={() => open(record.canonicalId)}><WorkspaceBadge value={record.displayName} /></button>)}
                    {!assets.length && !prompts.length ? <p className="text-sm text-slate-500">No linked canonical assets or prompts.</p> : null}
                  </div>
                </WorkspacePanel>

                <WorkspacePanel title="Change Impact" icon={ShieldCheck}>
                  <p className="text-sm leading-6 text-slate-400">Impact is calculated before a record is changed or removed. Studio can use this view to protect dependent objects and gameplay exports.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <WorkspaceStatTile label="Affected Objects" value={impact?.affectedObjectIds.length ?? 0} />
                    <WorkspaceStatTile label="Unity Exports" value={impact?.unityExportIds.length ?? 0} />
                    <WorkspaceStatTile label="Production" value={impact?.productionIds.length ?? 0} />
                  </div>
                </WorkspacePanel>
              </section>

              <WorkspacePanel title="History" icon={Network}>
                <p className="text-sm leading-6 text-slate-400">Identity history is retained from the canonical source record. Production review history remains in the asset-production system and is intentionally not copied into the gameplay graph.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Identifier label="Canonical Record Created" value={selected.createdAt} />
                  <Identifier label="Last Canonical Update" value={selected.updatedAt} />
                </div>
              </WorkspacePanel>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
