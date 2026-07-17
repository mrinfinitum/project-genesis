"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, FileText, GitBranch, Landmark, Network, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceSearchBar, WorkspaceStatTile, WorkspaceTabs } from "@/components/ui/workspace";
import type { ArchitectureDecision, ArchitectureSection, ArchitectureState } from "@/lib/architecture";
import { cn } from "@/lib/utils";

type ArchitectureTab = "sections" | "decisions" | "standards" | "clients" | "audit";

function statusTone(status: string) {
  if (/accepted|current|healthy/i.test(status)) return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  if (/proposed|review|draft/i.test(status)) return "border-amber-300/35 bg-amber-400/10 text-amber-100";
  return "border-rose-300/35 bg-rose-400/10 text-rose-100";
}

function SectionCard({ section }: { section: ArchitectureSection }) {
  return (
    <article className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{section.category}</p>
          <h3 className="mt-2 text-xl font-black text-white">{section.title}</h3>
        </div>
        <span className={cn("rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em]", statusTone(section.status))}>{section.status}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{section.summary}</p>
      <div className="mt-4 space-y-2">
        {section.content.slice(0, 5).map((line) => (
          <p key={line} className="rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2 text-sm text-slate-300">{line}</p>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {section.systems.slice(0, 6).map((system) => <WorkspaceBadge key={system} value={system} />)}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <WorkspaceMiniStat label="Owner" value={section.owner} />
        <WorkspaceMiniStat label="Updated" value={section.lastUpdated} />
        <WorkspaceMiniStat label="Review" value={section.reviewDate} />
      </div>
    </article>
  );
}

function DecisionCard({ decision }: { decision: ArchitectureDecision }) {
  return (
    <article className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{decision.id} / {decision.date}</p>
          <h3 className="mt-2 text-lg font-black text-white">{decision.title}</h3>
        </div>
        <span className={cn("rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em]", statusTone(decision.status))}>{decision.status}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-cyan-100">{decision.decision}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{decision.reason}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {decision.affectedSystems.map((system) => <WorkspaceBadge key={system} value={system} />)}
      </div>
    </article>
  );
}

function ArchitectureHealth({ state }: { state: ArchitectureState }) {
  const blockers = state.coreArchitectureAudit.healthMetrics.find((metric) => metric.id === "game_ingestion_blockers")?.value ?? 0;
  return (
    <WorkspacePanel title="Architecture Health" icon={ShieldCheck}>
      <div className="grid gap-3 md:grid-cols-4">
        <WorkspaceStatTile label="Health" value={`${state.healthScore}%`} />
        <WorkspaceStatTile label="Sections" value={state.sections.length} />
        <WorkspaceStatTile label="Decisions" value={state.decisions.length} />
        <WorkspaceStatTile label="Outstanding" value={state.outstandingDecisions.length} />
        <WorkspaceStatTile label="Blockers" value={blockers} />
      </div>
      <div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
        <div className="flex items-center gap-3">
          {state.architectureHealth === "Healthy" ? <CheckCircle2 className="h-5 w-5 text-emerald-200" /> : <TriangleAlert className="h-5 w-5 text-amber-200" />}
          <p className="font-black text-white">{state.architectureHealth}</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">{state.codexHandoffRule}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{state.runtimeSafetyRule}</p>
      </div>
    </WorkspacePanel>
  );
}

function CoreAuditPanel({ state }: { state: ArchitectureState }) {
  const audit = state.coreArchitectureAudit;
  const needsReview = audit.healthMetrics.filter((metric) => metric.status !== "Healthy");
  return (
    <WorkspacePanel title="Core Architecture Audit" icon={Network}>
      <div className="grid gap-3 md:grid-cols-4">
        <WorkspaceStatTile label="Ownership Rows" value={audit.ownershipMatrix.length} />
        <WorkspaceStatTile label="Dependency Edges" value={audit.dependencyGraph.length} />
        <WorkspaceStatTile label="Runtime Roots" value={audit.runtimeRootFieldInventory.length} />
        <WorkspaceStatTile label="Gaps" value={audit.missingFoundationGaps.length} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Needs Review</p>
          <div className="mt-3 space-y-2">
            {needsReview.map((metric) => (
              <div key={metric.id} className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 px-3 py-2">
                <span className="text-sm font-bold text-slate-300">{metric.label}</span>
                <WorkspaceBadge value={`${metric.value}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Safe Remediation</p>
          <div className="mt-3 space-y-2">
            {audit.safeRemediationPerformed.map((item) => (
              <p key={item} className="rounded-md border border-cyan-300/10 px-3 py-2 text-sm text-slate-300">{item}</p>
            ))}
          </div>
        </div>
      </div>
    </WorkspacePanel>
  );
}

export function ArchitectureWorkspace({ state }: { state: ArchitectureState }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ArchitectureTab>("sections");
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...Array.from(new Set(state.sections.map((section) => section.category))).sort()], [state.sections]);
  const searchableSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.sections.filter((section) => {
      const categoryMatch = category === "All" || section.category === category;
      if (!categoryMatch) return false;
      if (!normalized) return true;
      const text = [section.title, section.category, section.summary, section.systems.join(" "), section.clients.join(" "), section.content.join(" ")].join(" ").toLowerCase();
      return text.includes(normalized);
    });
  }, [category, query, state.sections]);
  const searchableDecisions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.decisions.filter((decision) => {
      if (!normalized) return true;
      return [decision.title, decision.decision, decision.reason, decision.affectedSystems.join(" "), decision.status].join(" ").toLowerCase().includes(normalized);
    });
  }, [query, state.decisions]);
  const standards = searchableSections.filter((section) => /standards|ui|ux|screen|component|asset|animation/i.test(`${section.id} ${section.category} ${section.title}`));
  const clientSections = searchableSections.filter((section) => section.clients.some((client) => client !== "Studio") || ["game", "roblox", "mobile", "release-targets"].includes(section.id));

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Studio Constitution"
        title="Architecture"
        description="The permanent NOVERIS architecture workspace. Studio owns it, future prompts reference it, and clients consume the canonical systems it points to."
        stats={[
          { label: "Architecture", value: state.architectureVersion.current },
          { label: "Runtime", value: state.currentRuntimeVersion },
          { label: "Content", value: state.currentContentVersion },
          { label: "Save", value: state.currentSaveVersion }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <WorkspacePanel title="Vision" icon={Landmark}>
          <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{state.gameName}</p>
              <h2 className="mt-2 text-3xl font-black text-white">{state.tagline}</h2>
              <p className="mt-3 text-lg leading-8 text-slate-300">{state.mission}</p>
              <p className="mt-4 text-sm leading-6 text-slate-400">Optimistic civilization, exploration, science, automation, and humanity's potential. Not war. Not conquest. Not survival horror.</p>
            </div>
            <div className="grid gap-2">
              {["No Man's Sky", "Cells to Singularity", "Stellaris", "Dyson Sphere Program", "Satisfactory"].map((item) => <WorkspaceMiniStat key={item} label="Inspiration" value={item} />)}
            </div>
          </div>
        </WorkspacePanel>
        <ArchitectureHealth state={state} />
      </section>

      <CoreAuditPanel state={state} />

      <section className="grid gap-4 lg:grid-cols-3">
        <WorkspacePanel title="Recent Decisions" icon={GitBranch}>
          <div className="space-y-3">
            {state.recentDecisions.slice(0, 4).map((decision) => (
              <div key={decision.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-white">{decision.title}</p>
                  <WorkspaceBadge value={decision.status} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{decision.decision}</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Outstanding Decisions" icon={TriangleAlert}>
          <div className="space-y-3">
            {state.outstandingDecisions.map((decision) => (
              <div key={decision.id} className="rounded-md border border-amber-300/20 bg-amber-300/5 p-3">
                <p className="font-bold text-amber-100">{decision.title}</p>
                <p className="mt-2 text-sm text-slate-300">{decision.reason}</p>
              </div>
            ))}
            {!state.outstandingDecisions.length ? <p className="text-sm text-slate-400">No pending architecture decisions.</p> : null}
          </div>
        </WorkspacePanel>
        <WorkspacePanel title="Supported Clients" icon={FileText}>
          <div className="grid grid-cols-2 gap-2">
            {state.supportedClients.map((client) => <WorkspaceMiniStat key={client} label="Client" value={client} />)}
          </div>
        </WorkspacePanel>
      </section>

      <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search by topic, system, client, decision, component, economy, AI, runtime, or mobile" />
      <div className="flex flex-wrap items-center gap-3">
        <WorkspaceTabs tabs={["sections", "decisions", "standards", "clients", "audit"]} active={tab} onChange={setTab} />
        <div className="flex items-center gap-2 rounded-md border border-cyan-300/15 bg-[#07101e]/85 px-3 py-2">
          <Search className="h-4 w-4 text-slate-500" />
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent text-sm font-bold text-slate-200 outline-none">
            {categories.map((item) => <option key={item} value={item} className="bg-slate-950">{item}</option>)}
          </select>
        </div>
      </div>

      {tab === "sections" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {searchableSections.map((section) => <SectionCard key={section.id} section={section} />)}
        </section>
      ) : null}
      {tab === "decisions" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {searchableDecisions.map((decision) => <DecisionCard key={decision.id} decision={decision} />)}
        </section>
      ) : null}
      {tab === "standards" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {standards.map((section) => <SectionCard key={section.id} section={section} />)}
        </section>
      ) : null}
      {tab === "clients" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {clientSections.map((section) => <SectionCard key={section.id} section={section} />)}
        </section>
      ) : null}
      {tab === "audit" ? (
        <section className="space-y-4">
          <WorkspacePanel title="Ownership Matrix" icon={ShieldCheck}>
            <div className="grid gap-3 lg:grid-cols-2">
              {state.coreArchitectureAudit.ownershipMatrix.map((row) => (
                <article key={row.domain} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">{row.canonicalOwner}</p>
                      <h3 className="mt-1 font-black text-white">{row.domain}</h3>
                    </div>
                    <WorkspaceBadge value={row.runtimePublisher} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{row.publicExportedData.join(", ")}</p>
                </article>
              ))}
            </div>
          </WorkspacePanel>
          <WorkspacePanel title="Dependency Graph" icon={GitBranch}>
            <div className="grid gap-3 lg:grid-cols-2">
              {state.coreArchitectureAudit.dependencyGraph.map((edge) => (
                <article key={`${edge.from}-${edge.to}`} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-white">{edge.from}</span>
                    <span className="text-cyan-300">-&gt;</span>
                    <span className="font-black text-white">{edge.to}</span>
                    <WorkspaceBadge value={edge.kind} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{edge.reason}</p>
                </article>
              ))}
            </div>
          </WorkspacePanel>
          <WorkspacePanel title="Prioritized Gaps" icon={TriangleAlert}>
            <div className="grid gap-3 lg:grid-cols-2">
              {state.coreArchitectureAudit.missingFoundationGaps.map((gap) => (
                <article key={gap.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-black text-white">{gap.title}</h3>
                    <WorkspaceBadge value={gap.priority} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{gap.reason}</p>
                  <p className="mt-2 text-sm text-cyan-100">{gap.recommendedFollowUp}</p>
                </article>
              ))}
            </div>
          </WorkspacePanel>
        </section>
      ) : null}

      <WorkspacePanel title="Architecture Versioning" icon={BookOpen}>
        <div className="grid gap-3 md:grid-cols-3">
          <WorkspaceStatTile label="Current" value={state.architectureVersion.current} />
          <WorkspaceStatTile label="Previous" value={state.architectureVersion.previous} />
          <WorkspaceStatTile label="Review Date" value={state.architectureVersion.reviewDate} />
        </div>
        <div className="mt-4 space-y-2">
          {state.architectureVersion.changeLog.map((item) => (
            <div key={item.version} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="font-black text-white">{item.version} / {item.date}</p>
              <p className="mt-1 text-sm text-slate-400">{item.summary}</p>
            </div>
          ))}
        </div>
      </WorkspacePanel>
    </main>
  );
}
