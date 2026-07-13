"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Boxes, CheckCircle2, Clipboard, GitBranch, Send, ShieldCheck, TriangleAlert } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { WorkspaceBadge, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceStatTile, WorkspaceTabs } from "@/components/ui/workspace";
import type { VisualPreview } from "@/lib/assets/visual-previews";
import type { ComponentDesignRecord } from "@/lib/component-library";

type Tab = "overview" | "anatomy" | "layout" | "tokens" | "assets" | "data" | "variants" | "states" | "interactions" | "responsive" | "motion" | "accessibility" | "usage" | "implementation" | "review" | "handoff" | "history";

const tabs: Tab[] = ["overview", "anatomy", "layout", "tokens", "assets", "data", "variants", "states", "interactions", "responsive", "motion", "accessibility", "usage", "implementation", "review", "handoff", "history"];
const labels: Partial<Record<Tab, string>> = {
  overview: "Overview",
  anatomy: "Anatomy",
  layout: "Layout",
  tokens: "Tokens",
  assets: "Assets",
  data: "Data",
  variants: "Variants",
  states: "States",
  interactions: "Interactions",
  responsive: "Responsive",
  motion: "Motion",
  accessibility: "Accessibility",
  usage: "Screen Usage",
  implementation: "Implementation",
  review: "Review",
  handoff: "Handoff",
  history: "History"
};

type Validation = {
  valid: boolean;
  issues: string[];
  checklist: { complete: number; total: number; checks: Record<string, boolean> };
};

function List({ items }: { items: string[] }) {
  return <div className="grid gap-2">{items.map((item) => <p key={item} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-200">{item}</p>)}</div>;
}

function Guardrails({ validation }: { validation: Validation }) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {Object.entries(validation.checklist.checks).map(([key, done]) => (
        <div key={key} className="flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
          <span className={`grid h-5 w-5 place-items-center rounded border text-xs ${done ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-100" : "border-amber-300/35 bg-amber-400/10 text-amber-100"}`}>{done ? "✓" : "!"}</span>
          <span className="text-sm font-semibold text-slate-200">{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}</span>
        </div>
      ))}
    </div>
  );
}

async function postWorkflow(componentId: string, action: "ready_for_review" | "request_changes" | "approve" | "record_major_change", comments: string) {
  const response = await fetch("/api/component-library/action", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ componentId, action, comments })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "Component Library action failed.");
  window.location.reload();
}

export function ComponentDesignDetail({
  record,
  preview,
  validation,
  handoffs
}: {
  record: ComponentDesignRecord;
  preview: VisualPreview;
  validation: Validation;
  handoffs: Record<"Game Codex" | "Roblox Codex", string>;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [target, setTarget] = useState<"Game Codex" | "Roblox Codex">("Game Codex");
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [referenceViewport, setReferenceViewport] = useState("1920x1080");
  const handoff = useMemo(() => handoffs[target], [handoffs, target]);
  const readiness = Math.round((validation.checklist.complete / Math.max(1, validation.checklist.total)) * 100);
  const primaryReference = record.references.find((reference) => reference.source === preview.url) ?? record.references[0];
  const viteReference = record.references.find((reference) => reference.type === "Vite screenshot");
  const robloxReference = record.references.find((reference) => reference.type === "Roblox screenshot");
  const viteTarget = record.implementationTargets.find((item) => item.target === "Vite Web");
  const robloxTarget = record.implementationTargets.find((item) => item.target === "Roblox");

  async function copyHandoff() {
    await navigator.clipboard.writeText(handoff);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function run(action: "ready_for_review" | "request_changes" | "approve" | "record_major_change") {
    setBusy(action);
    setError("");
    try {
      await postWorkflow(record.componentId, action, comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Component Library action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function addReference() {
    if (!referenceUrl.trim()) return;
    setBusy("reference.add");
    setError("");
    try {
      const response = await fetch("/api/component-library/action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          componentId: record.componentId,
          action: "reference.add",
          payload: {
            source: referenceUrl,
            type: "annotated reference",
            viewport: referenceViewport,
            version: record.version,
            notes: "Reference preview added from Component Library visual preview header."
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
      <Link href="/component-library" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Component Library
      </Link>

      <section className="grid gap-5 xl:grid-cols-[1fr_28rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Reusable Component Spec</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white">{record.displayName}</h1>
          <p className="mt-2 font-mono text-xs text-cyan-200">{record.componentId}</p>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">{record.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <WorkspaceBadge value={record.category} />
            <WorkspaceBadge value={record.status} />
            <WorkspaceBadge value={record.approvalStatus} />
            <WorkspaceBadge value={`v${record.version}`} />
            {record.approvedVersion ? <WorkspaceBadge value={`approved v${record.approvedVersion}`} /> : null}
          </div>
        </div>
        <WorkspacePanel title="Guardrails" icon={validation.valid ? ShieldCheck : TriangleAlert}>
          <div className="grid grid-cols-2 gap-3">
            <WorkspaceStatTile label="Checklist" value={`${validation.checklist.complete}/${validation.checklist.total}`} />
            <WorkspaceStatTile label="Issues" value={validation.issues.length} />
          </div>
          <WorkspaceProgressBar value={readiness} className="mt-4" />
          {validation.issues.length ? <div className="mt-4 grid gap-2">{validation.issues.map((issue) => <p key={issue} className="rounded-md border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">{issue}</p>)}</div> : null}
        </WorkspacePanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <AssetPreview preview={preview} />
        <WorkspacePanel title="Component Visual Preview" icon={Boxes}>
          <div className="grid gap-3">
            <WorkspaceMiniStat label="Preview" value={preview.status} />
            <WorkspaceMiniStat label="Mode" value={preview.mode.replaceAll("_", " ")} />
            <WorkspaceMiniStat label="Variants" value={record.variants.length} />
            <WorkspaceMiniStat label="States" value={record.states.length} />
            <WorkspaceMiniStat label="Vite Ref" value={viteReference?.source ?? viteTarget?.implementationPath ?? "Not captured"} />
            <WorkspaceMiniStat label="Roblox Ref" value={robloxReference?.source ?? robloxTarget?.implementationPath ?? "Not captured"} />
          </div>
          {primaryReference?.outputs?.length ? (
            <div className="mt-4 grid gap-2">
              {primaryReference.outputs.map((output) => (
                <div key={output.role} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <WorkspaceBadge value={output.role.replaceAll("_", " ")} />
                    <span className="font-mono text-xs text-slate-400">{output.width}x{output.height} {output.format}</span>
                  </div>
                  <p className="mt-2 truncate font-mono text-[0.68rem] text-cyan-200">{output.source}</p>
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Overlay Comparison</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{viteReference && robloxReference ? "Vite and Roblox references are available for overlay review." : "Overlay comparison is pending until both Vite and Roblox reference screenshots exist."}</p>
          </div>
          {primaryReference?.captureBlockers?.length ? (
            <div className="mt-4 grid gap-2">
              {primaryReference.captureBlockers.map((blocker) => <p key={blocker} className="rounded-md border border-amber-300/20 bg-amber-400/10 p-2 text-xs font-semibold text-amber-100">{blocker}</p>)}
            </div>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-slate-300">Component previews represent anatomy, variants, implementation screenshots, or missing state requirements without exposing private source files.</p>
          <div className="mt-4 grid gap-2">
            <input value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} placeholder="/assets/previews/button-states.webp" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm text-white outline-none" />
            <input value={referenceViewport} onChange={(event) => setReferenceViewport(event.target.value)} placeholder="1920x1080" className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm text-white outline-none" />
            <button type="button" disabled={busy === "reference.add"} onClick={addReference} className="inline-flex h-10 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
              {busy === "reference.add" ? "Saving..." : "Add Component Preview"}
            </button>
          </div>
        </WorkspacePanel>
      </section>

      <WorkspaceTabs tabs={tabs} active={tab} onChange={setTab} labels={labels} />

      {tab === "overview" ? (
        <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
          <WorkspacePanel title="Component Summary" icon={Boxes}>
            <p className="text-sm leading-6 text-slate-300">{record.description}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <WorkspaceMiniStat label="Assigned Designer" value={record.assignedTo} />
              <WorkspaceMiniStat label="Anatomy Parts" value={record.anatomy.length} />
              <WorkspaceMiniStat label="Token Refs" value={record.designTokens.length} />
              <WorkspaceMiniStat label="Assets" value={record.assetKeys.length} />
              <WorkspaceMiniStat label="Variants" value={record.variants.length} />
              <WorkspaceMiniStat label="Screens" value={record.screenUsages.length} />
            </div>
          </WorkspacePanel>
          <WorkspacePanel title="Approval Guardrails" icon={CheckCircle2}>
            <Guardrails validation={validation} />
          </WorkspacePanel>
        </section>
      ) : null}

      {tab === "anatomy" ? <WorkspacePanel title="Component Anatomy" icon={Boxes}><div className="grid gap-3">{record.anatomy.map((part) => <div key={part.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-black text-white">{part.label}</h2><WorkspaceBadge value={part.source} /></div><p className="mt-2 text-sm leading-6 text-slate-300">{part.notes}</p></div>)}</div></WorkspacePanel> : null}
      {tab === "layout" ? <WorkspacePanel title="Layout Rules" icon={Boxes}><p className="mb-4 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-200">{record.dimensions}</p><List items={record.layoutRules} /></WorkspacePanel> : null}
      {tab === "tokens" ? <WorkspacePanel title="Design Tokens" icon={Boxes}><div className="grid gap-3 md:grid-cols-2">{record.designTokens.map((token) => <div key={`${token.group}-${token.tokenId}`} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><div className="flex flex-wrap gap-2"><WorkspaceBadge value={token.group} /><WorkspaceBadge value={token.tokenId} /></div><p className="mt-2 text-sm text-slate-300">{token.usage}</p>{token.override ? <p className="mt-1 text-xs text-amber-100">Override: {token.override}</p> : null}</div>)}</div></WorkspacePanel> : null}
      {tab === "assets" ? <WorkspacePanel title="Asset References" icon={Boxes}><div className="grid gap-3">{record.assetKeys.map((asset) => <div key={asset.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs text-cyan-200">{asset.assetKey}</p><h2 className="mt-1 font-black text-white">{asset.label}</h2></div><WorkspaceBadge value={asset.status} /></div>{asset.linkedAssetId ? <Link href={`/assets/${asset.linkedAssetId}`} className="mt-3 inline-flex rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20">Open Asset</Link> : null}</div>)}</div></WorkspacePanel> : null}
      {tab === "data" ? <WorkspacePanel title="Typed Data Input Contract" icon={Boxes}><div className="grid gap-3">{record.dataInputs.map((input) => <div key={input.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs text-cyan-200">{input.id}: {input.type}</p><h2 className="mt-1 font-black text-white">{input.label}</h2></div><WorkspaceBadge value={input.classification} /></div><p className="mt-2 text-sm text-slate-300">{input.notes}</p></div>)}</div></WorkspacePanel> : null}
      {tab === "variants" ? <WorkspacePanel title="Variants" icon={Boxes}><div className="grid gap-3 md:grid-cols-2">{record.variants.map((variant) => <div key={variant.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4"><h2 className="font-black text-white">{variant.displayName}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{variant.visualDifferences}</p><p className="mt-2 text-xs font-semibold text-slate-500">Allowed: {variant.allowedStates.join(", ")}</p></div>)}</div></WorkspacePanel> : null}
      {tab === "states" ? <WorkspacePanel title="State Matrix" icon={Boxes}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{record.states.map((state) => <div key={state.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><div className="flex items-center justify-between gap-3"><p className="font-black text-white">{state.label}</p><WorkspaceBadge value={state.designed ? "Designed" : "Missing"} /></div><p className="mt-2 text-sm text-slate-400">{state.notes}</p></div>)}</div></WorkspacePanel> : null}
      {tab === "interactions" ? <WorkspacePanel title="Interaction Contracts" icon={Boxes}><div className="grid gap-3">{record.interactions.map((item) => <div key={item.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4"><h2 className="font-black text-white">{item.trigger}</h2><div className="mt-3 grid gap-2 md:grid-cols-2"><WorkspaceMiniStat label="Action" value={item.action} /><WorkspaceMiniStat label="Transition" value={item.stateTransition} /><WorkspaceMiniStat label="Runtime" value={item.runtimeAction} /><WorkspaceMiniStat label="Keyboard" value={item.keyboardControllerBehavior} /></div></div>)}</div></WorkspacePanel> : null}
      {tab === "responsive" ? <WorkspacePanel title="Responsive Rules" icon={Boxes}><div className="grid gap-3 md:grid-cols-2">{record.responsiveRules.map((rule) => <div key={rule.viewport} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4"><h2 className="font-black text-white">{rule.viewport}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{rule.scalingBehavior}</p><p className="mt-2 text-xs text-slate-500">{rule.textHandling}</p></div>)}</div></WorkspacePanel> : null}
      {tab === "motion" ? <WorkspacePanel title="Motion Rules" icon={Boxes}><List items={record.motionRules} /></WorkspacePanel> : null}
      {tab === "accessibility" ? <WorkspacePanel title="Accessibility Requirements" icon={Boxes}><List items={record.accessibilityRequirements} /></WorkspacePanel> : null}
      {tab === "usage" ? <WorkspacePanel title="Screen Usage Graph" icon={GitBranch}><div className="grid gap-3 md:grid-cols-2">{record.screenUsages.map((usage) => <Link key={`${usage.screenId}-${usage.variant}`} href={`/screen-designer/${usage.screenId}`} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4 transition hover:border-cyan-300/40"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-black text-white">{usage.screenName}</h2><WorkspaceBadge value={usage.variant} /></div><p className="mt-2 text-sm text-slate-400">{usage.notes}</p></Link>)}</div></WorkspacePanel> : null}
      {tab === "implementation" ? <WorkspacePanel title="Implementation Targets" icon={Boxes}><div className="grid gap-3">{record.implementationTargets.map((target) => <div key={target.target} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-black text-white">{target.target}</h2><div className="flex flex-wrap gap-2"><WorkspaceBadge value={target.status} /><WorkspaceBadge value={`parity ${target.parityStatus}`} /></div></div><div className="mt-3 grid gap-2 md:grid-cols-3"><WorkspaceMiniStat label="Path" value={target.implementationPath || "Not mapped"} /><WorkspaceMiniStat label="Module" value={target.moduleName} /><WorkspaceMiniStat label="Parity" value={`${target.parityScore}%`} /></div></div>)}</div></WorkspacePanel> : null}
      {tab === "review" ? (
        <WorkspacePanel title="Approval Workflow" icon={ShieldCheck}>
          <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
            <Guardrails validation={validation} />
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <textarea value={comments} onChange={(event) => setComments(event.target.value)} className="min-h-28 w-full rounded-md border border-cyan-300/15 bg-slate-950/80 p-3 text-sm text-white outline-none" placeholder="Review comments or breaking-change migration notes" />
              {error ? <p className="mt-3 rounded-md border border-rose-300/25 bg-rose-400/10 p-3 text-sm font-semibold text-rose-100">{error}</p> : null}
              <div className="mt-3 grid gap-2">
                <button type="button" disabled={Boolean(busy)} onClick={() => run("ready_for_review")} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100"><Send className="h-4 w-4" />{busy === "ready_for_review" ? "Saving..." : "Ready for Review"}</button>
                <button type="button" disabled={Boolean(busy)} onClick={() => run("request_changes")} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-300/25 bg-amber-300/10 px-3 text-sm font-bold text-amber-100"><TriangleAlert className="h-4 w-4" />{busy === "request_changes" ? "Saving..." : "Request Changes"}</button>
                <button type="button" disabled={Boolean(busy)} onClick={() => run("approve")} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-300/25 bg-emerald-400/10 px-3 text-sm font-bold text-emerald-100"><CheckCircle2 className="h-4 w-4" />{busy === "approve" ? "Saving..." : "Approve"}</button>
                <button type="button" disabled={Boolean(busy)} onClick={() => run("record_major_change")} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-300/25 bg-rose-400/10 px-3 text-sm font-bold text-rose-100"><GitBranch className="h-4 w-4" />{busy === "record_major_change" ? "Saving..." : "Record Major Change"}</button>
              </div>
            </div>
          </div>
        </WorkspacePanel>
      ) : null}
      {tab === "handoff" ? <WorkspacePanel title="Copy-Ready Handoff" icon={Clipboard}><div className="flex flex-wrap items-center justify-between gap-3"><select value={target} onChange={(event) => setTarget(event.target.value as "Game Codex" | "Roblox Codex")} className="h-10 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none"><option>Game Codex</option><option>Roblox Codex</option></select><button type="button" onClick={async () => { await navigator.clipboard.writeText(handoff); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }} className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">{copied ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}{copied ? "Copied" : "Copy Handoff"}</button></div><pre className="mt-4 max-h-[32rem] overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/70 p-4 text-xs leading-5 text-slate-200">{handoff}</pre></WorkspacePanel> : null}
      {tab === "history" ? <WorkspacePanel title="History & Breaking Changes" icon={GitBranch}><div className="grid gap-3">{[...record.breakingChanges.map((change) => ({ id: change.id, title: change.title, body: `${change.type}: ${change.description}`, badge: change.resolved ? "Resolved" : "Open" })), ...record.reviewHistory.map((entry) => ({ id: entry.id, title: entry.reviewer, body: entry.comments, badge: entry.status }))].map((item) => <div key={item.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-black text-white">{item.title}</h2><WorkspaceBadge value={item.badge} /></div><p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p></div>)}</div></WorkspacePanel> : null}
    </main>
  );
}
