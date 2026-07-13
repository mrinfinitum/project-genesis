"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clipboard, MonitorCog, Send, ShieldCheck, TriangleAlert } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { WorkspaceBadge, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile, WorkspaceTabs } from "@/components/ui/workspace";
import type { VisualPreview } from "@/lib/assets/visual-previews";
import type { ScreenDesignRecord } from "@/lib/screen-designer";

type Tab = "overview" | "layout" | "components" | "data" | "assets" | "states" | "interactions" | "responsive" | "motion" | "accessibility" | "review" | "handoff" | "history";

const tabs: Tab[] = ["overview", "layout", "components", "data", "assets", "states", "interactions", "responsive", "motion", "accessibility", "review", "handoff", "history"];
const labels: Partial<Record<Tab, string>> = {
  overview: "Overview",
  layout: "Layout",
  components: "Components",
  data: "Data",
  assets: "Assets",
  states: "States",
  interactions: "Interactions",
  responsive: "Responsive",
  motion: "Motion",
  accessibility: "Accessibility",
  review: "Review",
  handoff: "Handoff",
  history: "History"
};

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function TextList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div key={item} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-200">{item}</div>
      ))}
    </div>
  );
}

function Checklist({ record }: { record: ScreenDesignRecord }) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {Object.entries(record.checklist).map(([key, done]) => (
        <div key={key} className="flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
          <span className={`grid h-5 w-5 place-items-center rounded border text-xs ${done ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-100" : "border-amber-300/35 bg-amber-400/10 text-amber-100"}`}>{done ? "✓" : "!"}</span>
          <span className="text-sm font-semibold text-slate-200">{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}</span>
        </div>
      ))}
    </div>
  );
}

function DetailTable<T>({ rows, render }: { rows: T[]; render: (row: T) => React.ReactNode }) {
  return <div className="grid gap-3">{rows.map(render)}</div>;
}

async function postWorkflow(screenId: string, action: "ready_for_review" | "request_changes" | "approve", comments: string) {
  const response = await fetch("/api/screen-designer/action", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ screenId, action, comments })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "Screen Designer action failed.");
  window.location.reload();
}

type ScreenDesignValidation = {
  valid: boolean;
  issues: string[];
  checklist: { complete: number; total: number };
};

export function ScreenDesignDetail({
  record,
  preview,
  validation,
  handoffs
}: {
  record: ScreenDesignRecord;
  preview: VisualPreview;
  validation: ScreenDesignValidation;
  handoffs: Record<"Game Codex" | "Roblox Codex", string>;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [target, setTarget] = useState<"Game Codex" | "Roblox Codex">("Game Codex");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [referenceViewport, setReferenceViewport] = useState(record.referenceViewport);
  const handoff = useMemo(() => handoffs[target], [handoffs, target]);
  const checklistPercent = Math.round((validation.checklist.complete / Math.max(1, validation.checklist.total)) * 100);

  async function copyHandoff() {
    await navigator.clipboard.writeText(handoff);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function runAction(action: "ready_for_review" | "request_changes" | "approve") {
    setBusy(action);
    setError("");
    try {
      await postWorkflow(record.screenId, action, comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Screen Designer action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function addReference() {
    if (!referenceUrl.trim()) return;
    setBusy("reference.add");
    setError("");
    try {
      const response = await fetch("/api/screen-designer/action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          screenId: record.screenId,
          action: "reference.add",
          payload: {
            source: referenceUrl,
            type: "reference UI",
            viewport: referenceViewport,
            notes: "Reference screenshot added from Screen Designer visual preview header."
          }
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Reference upload failed.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reference upload failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="space-y-6">
      <Link href="/screen-designer" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Screen Designer
      </Link>

      <section className="grid gap-5 xl:grid-cols-[1fr_28rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Screen Specification</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white">{record.displayName}</h1>
          <p className="mt-2 font-mono text-xs text-cyan-200">{record.screenId}</p>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">{record.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <WorkspaceBadge value={record.status} />
            <WorkspaceBadge value={record.approvalStatus} />
            <WorkspaceBadge value={`v${record.version}`} />
            {record.approvedVersion ? <WorkspaceBadge value={`approved v${record.approvedVersion}`} /> : null}
          </div>
        </div>
        <WorkspacePanel title="Readiness" icon={validation.valid ? ShieldCheck : TriangleAlert}>
          <div className="grid grid-cols-2 gap-3">
            <WorkspaceStatTile label="Checklist" value={`${validation.checklist.complete}/${validation.checklist.total}`} />
            <WorkspaceStatTile label="Issues" value={validation.issues.length} />
          </div>
          <WorkspaceProgressBar value={checklistPercent} className="mt-4" />
          {validation.issues.length ? (
            <div className="mt-4 grid gap-2">
              {validation.issues.map((issue) => (
                <p key={issue} className="rounded-md border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">{issue}</p>
              ))}
            </div>
          ) : null}
        </WorkspacePanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <AssetPreview preview={preview} />
        <WorkspacePanel title="Visual Preview Header" icon={MonitorCog}>
          <div className="grid gap-3">
            <WorkspaceMiniStat label="Primary Preview" value={preview.status} />
            <WorkspaceMiniStat label="Source" value={preview.source.replaceAll("_", " ")} />
            <WorkspaceMiniStat label="Reference" value={preview.dimensionsLabel} />
            <WorkspaceMiniStat label="Mode" value={preview.mode.replaceAll("_", " ")} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">Use this header for reference screenshots, Studio design previews, Vite/Roblox captures, and parity review images. Missing previews stay Studio-only and become production work.</p>
          <div className="mt-4 grid gap-2">
            <input value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} placeholder="/assets/previews/dashboard-reference.webp" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm text-white outline-none" />
            <input value={referenceViewport} onChange={(event) => setReferenceViewport(event.target.value)} placeholder="1920x1080" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm text-white outline-none" />
            <button type="button" disabled={busy === "reference.add"} onClick={addReference} className="inline-flex h-10 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
              {busy === "reference.add" ? "Saving..." : "Add Reference Screenshot"}
            </button>
          </div>
        </WorkspacePanel>
      </section>

      <WorkspaceTabs tabs={tabs} active={tab} onChange={setTab} labels={labels} />

      {tab === "overview" ? (
        <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
          <WorkspacePanel title="Screen Summary" icon={MonitorCog}>
            <p className="text-sm leading-6 text-slate-300">{record.description}</p>
            <FieldGrid>
              <WorkspaceMiniStat label="Assigned Designer" value={record.assignedTo} />
              <WorkspaceMiniStat label="Reference Viewport" value={record.referenceViewport} />
              <WorkspaceMiniStat label="Supported Viewports" value={record.supportedViewports.length} />
              <WorkspaceMiniStat label="Components" value={record.componentSpecs.length} />
              <WorkspaceMiniStat label="Data Requirements" value={record.dataRequirements.length} />
              <WorkspaceMiniStat label="Asset Requirements" value={record.assetRequirements.length} />
            </FieldGrid>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {record.implementationTargets.map((target) => (
                <div key={target.target} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">{target.target}</p>
                    <WorkspaceBadge value={target.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{target.notes}</p>
                </div>
              ))}
            </div>
          </WorkspacePanel>
          <WorkspacePanel title="Readiness Checklist" icon={CheckCircle2}>
            <Checklist record={record} />
          </WorkspacePanel>
        </section>
      ) : null}

      {tab === "layout" ? (
        <WorkspacePanel title="Layout Specification" icon={MonitorCog}>
          <FieldGrid>
            <WorkspaceMiniStat label="Design Width" value={record.layoutSpec.designWidth} />
            <WorkspaceMiniStat label="Design Height" value={record.layoutSpec.designHeight} />
            <WorkspaceMiniStat label="Coordinate System" value={record.layoutSpec.coordinateSystem} />
            <WorkspaceMiniStat label="Layout Mode" value={record.layoutSpec.layoutMode} />
            <WorkspaceMiniStat label="Columns" value={record.layoutSpec.columns} />
            <WorkspaceMiniStat label="Rows" value={record.layoutSpec.rows} />
          </FieldGrid>
          <div className="mt-4 grid gap-3">
            {record.layoutSpec.panelBounds.map((panel) => (
              <div key={panel.id} className="grid gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 md:grid-cols-[1fr_repeat(5,5rem)]">
                <p className="font-bold text-white">{panel.label}</p>
                <p className="text-sm text-slate-300">x {panel.x}</p>
                <p className="text-sm text-slate-300">y {panel.y}</p>
                <p className="text-sm text-slate-300">w {panel.width}</p>
                <p className="text-sm text-slate-300">h {panel.height}</p>
                <p className="text-sm text-slate-300">z {panel.zIndex}</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      ) : null}

      {tab === "components" ? (
        <WorkspacePanel title="Component Specifications" icon={MonitorCog}>
          <DetailTable
            rows={record.componentSpecs}
            render={(component) => (
              <article key={component.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-cyan-200">{component.id}</p>
                    <h2 className="mt-1 text-xl font-black text-white">{component.displayName}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {component.componentLibraryId ? <WorkspaceBadge value={component.componentLibraryId} /> : null}
                    <WorkspaceBadge value={component.dimensions} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{component.purpose}</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <WorkspaceMiniStat label="Positioning" value={component.positioning} />
                  <WorkspaceMiniStat label="Responsive" value={component.responsiveBehavior} />
                  <WorkspaceMiniStat label="Data Inputs" value={component.dataInputs.join(", ") || "None"} />
                  <WorkspaceMiniStat label="Asset Keys" value={component.assetKeys.join(", ") || "None"} />
                </div>
                {component.componentLibraryId ? (
                  <Link href={`/component-library/${component.componentLibraryId}`} className="mt-3 inline-flex rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
                    Open Shared Component
                  </Link>
                ) : null}
              </article>
            )}
          />
        </WorkspacePanel>
      ) : null}

      {tab === "data" ? (
        <WorkspacePanel title="Canonical Data Requirements" icon={MonitorCog}>
          <DetailTable
            rows={record.dataRequirements}
            render={(item) => (
              <div key={item.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-cyan-200">{item.id}</p>
                    <h2 className="mt-1 text-lg font-black text-white">{item.label}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <WorkspaceBadge value={item.classification} />
                    <WorkspaceBadge value={item.status} />
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-400">Source: {item.source}</p>
                {item.notes ? <p className="mt-2 text-sm leading-6 text-slate-300">{item.notes}</p> : null}
              </div>
            )}
          />
        </WorkspacePanel>
      ) : null}

      {tab === "assets" ? (
        <WorkspacePanel title="Asset Requirements" icon={MonitorCog}>
          <DetailTable
            rows={record.assetRequirements}
            render={(item) => (
              <div key={item.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-cyan-200">{item.artKey ?? item.iconKey ?? item.id}</p>
                    <h2 className="mt-1 text-lg font-black text-white">{item.label}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <WorkspaceBadge value={item.category} />
                    <WorkspaceBadge value={item.status} />
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.notes}</p>
                {item.linkedAssetId ? (
                  <Link href={`/assets/${item.linkedAssetId}`} className="mt-3 inline-flex rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">
                    Open Asset
                  </Link>
                ) : null}
              </div>
            )}
          />
        </WorkspacePanel>
      ) : null}

      {tab === "states" ? (
        <WorkspacePanel title="UI State Matrix" icon={MonitorCog}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {record.stateSpecs.map((state) => (
              <div key={state.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-white">{state.label}</p>
                  <WorkspaceBadge value={state.designed ? "Designed" : "Missing"} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{state.notes}</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      ) : null}

      {tab === "interactions" ? (
        <WorkspacePanel title="Interaction Specifications" icon={MonitorCog}>
          <DetailTable
            rows={record.interactionSpecs}
            render={(item) => (
              <div key={item.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <h2 className="text-lg font-black text-white">{item.trigger}</h2>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <WorkspaceMiniStat label="Result" value={item.resultingState} />
                  <WorkspaceMiniStat label="Data Action" value={item.dataAction} />
                  <WorkspaceMiniStat label="Animation" value={item.animation} />
                  <WorkspaceMiniStat label="Failure" value={item.failureBehavior} />
                </div>
              </div>
            )}
          />
        </WorkspacePanel>
      ) : null}

      {tab === "responsive" ? (
        <WorkspacePanel title="Responsive Preview Rules" icon={MonitorCog}>
          <div className="grid gap-3 md:grid-cols-2">
            {record.responsiveRules.map((rule) => (
              <div key={rule.viewport} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-white">{rule.viewport}</p>
                  <WorkspaceBadge value={rule.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{rule.behavior}</p>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      ) : null}

      {tab === "motion" ? <WorkspacePanel title="Motion Rules" icon={MonitorCog}><TextList items={record.animationSpecs} /></WorkspacePanel> : null}
      {tab === "accessibility" ? <WorkspacePanel title="Accessibility Requirements" icon={MonitorCog}><TextList items={record.accessibilityRequirements} /></WorkspacePanel> : null}

      {tab === "review" ? (
        <WorkspacePanel title="Approval Workflow" icon={ShieldCheck}>
          <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
            <div>
              <Checklist record={record} />
              {error ? <p className="mt-4 rounded-md border border-rose-300/25 bg-rose-400/10 p-3 text-sm font-semibold text-rose-100">{error}</p> : null}
            </div>
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Review Comments</span>
                <textarea value={comments} onChange={(event) => setComments(event.target.value)} className="min-h-28 rounded-md border border-cyan-300/15 bg-slate-950/80 p-3 text-sm text-white outline-none" placeholder="Required changes, approval notes, or parity comments" />
              </label>
              <div className="mt-3 grid gap-2">
                <button type="button" disabled={Boolean(busy)} onClick={() => runAction("ready_for_review")} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
                  <Send className="h-4 w-4" />
                  {busy === "ready_for_review" ? "Saving..." : "Ready for Review"}
                </button>
                <button type="button" disabled={Boolean(busy)} onClick={() => runAction("request_changes")} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-300/25 bg-amber-300/10 px-3 text-sm font-bold text-amber-100">
                  <TriangleAlert className="h-4 w-4" />
                  {busy === "request_changes" ? "Saving..." : "Request Changes"}
                </button>
                <button type="button" disabled={Boolean(busy)} onClick={() => runAction("approve")} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-300/25 bg-emerald-400/10 px-3 text-sm font-bold text-emerald-100">
                  <CheckCircle2 className="h-4 w-4" />
                  {busy === "approve" ? "Saving..." : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </WorkspacePanel>
      ) : null}

      {tab === "handoff" ? (
        <WorkspacePanel title="Copy-Ready Handoff" icon={Clipboard}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <select value={target} onChange={(event) => setTarget(event.target.value as "Game Codex" | "Roblox Codex")} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
              <option>Game Codex</option>
              <option>Roblox Codex</option>
            </select>
            <button type="button" onClick={copyHandoff} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Handoff"}
            </button>
          </div>
          <pre className="mt-4 max-h-[32rem] overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/70 p-4 text-xs leading-5 text-slate-200">{handoff}</pre>
        </WorkspacePanel>
      ) : null}

      {tab === "history" ? (
        <WorkspacePanel title="Review History" icon={MonitorCog}>
          {record.reviewHistory.length ? (
            <DetailTable
              rows={record.reviewHistory}
              render={(entry) => (
                <div key={entry.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-black text-white">{entry.reviewer}</p>
                    <WorkspaceBadge value={entry.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{new Date(entry.date).toLocaleString()}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{entry.comments}</p>
                </div>
              )}
            />
          ) : <p className="text-sm text-slate-400">No review history yet.</p>}
        </WorkspacePanel>
      ) : null}
    </main>
  );
}
