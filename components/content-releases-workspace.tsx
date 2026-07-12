"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clipboard, FileCheck2, History, RotateCcw, Rocket, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";

type ValidationSummary = {
  valid: boolean;
  status: string;
  errorCount: number;
  warningCount: number;
  checkedAt: string;
  checklist: string[];
  issues: Array<{ severity: string; code: string; message: string; records: string[] }>;
};

type ReleaseSummary = {
  id: string;
  contentVersion: number;
  version: string;
  status: "published";
  title: string;
  notes: string;
  publishedAt: string;
  contentHash: string;
  validationStatus: string;
  errorCount: number;
  warningCount: number;
  moduleCounts: Record<string, number>;
  rollbackOf?: number;
};

type ReleaseState = {
  latest: ReleaseSummary | null;
  draft: {
    draftVersion: string;
    validation: ValidationSummary;
    moduleCounts: Record<string, number>;
    contentHash: string;
    checkedAt: string;
  };
  releases: ReleaseSummary[];
  endpoints: {
    manifest: string;
    snapshot: string;
  };
};

function shortHash(hash: string) {
  return hash ? hash.slice(0, 12) : "pending";
}

function endpointText(state: ReleaseState) {
  return [`Manifest: ${state.endpoints.manifest}`, `Snapshot: ${state.endpoints.snapshot}`].join("\n");
}

export function ContentReleasesWorkspace({ initialState }: { initialState: ReleaseState }) {
  const [state, setState] = useState(initialState);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const latest = state.latest;
  const moduleEntries = useMemo(() => Object.entries(state.draft.moduleCounts), [state.draft.moduleCounts]);

  async function refresh() {
    const response = await fetch("/api/game-content/releases");
    if (response.ok) setState(await response.json());
  }

  async function runAction(action: "validate" | "publish" | "rollback", contentVersion?: number) {
    setBusyAction(contentVersion ? `${action}-${contentVersion}` : action);
    setMessage("");
    try {
      const response = await fetch("/api/game-content/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, contentVersion, title, notes })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Action failed.");
        return;
      }

      if (action === "validate") {
        setMessage(`Draft validation: ${payload.validation?.status ?? "checked"}`);
      } else {
        setTitle("");
        setNotes("");
        setMessage(`${payload.version} published.`);
      }
      await refresh();
    } finally {
      setBusyAction(null);
    }
  }

  async function copyEndpoints() {
    await navigator.clipboard.writeText(endpointText(state));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Published Game Content API"
        title="Content Releases"
        description="Validate and publish approved Studio content for the separate Project Genesis Game repository. Draft Studio data stays private until it is published."
        stats={[
          { label: "Latest Version", value: latest?.version ?? "None" },
          { label: "Published Releases", value: state.releases.length },
          { label: "Draft Status", value: state.draft.validation.status },
          { label: "Snapshot Modules", value: moduleEntries.length }
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <section className="space-y-5">
          <WorkspacePanel title="Draft -> Validate -> Publish" icon={Rocket}>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Draft</p>
                <h3 className="mt-2 text-xl font-black text-white">Current Studio Data</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">Draft content includes the current canonical Studio state, but game clients cannot pull it until publishing creates a versioned snapshot.</p>
              </div>
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Validate</p>
                <h3 className="mt-2 text-xl font-black text-white">{state.draft.validation.status}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">Uses the existing Generic export validator before content is eligible for publishing.</p>
              </div>
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Publish</p>
                <h3 className="mt-2 text-xl font-black text-white">Version +1</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">Publishing creates an immutable snapshot and increments the public content version.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Release title" className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/65 px-3 text-sm text-white outline-none placeholder:text-slate-500" />
              <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Release notes" className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/65 px-3 text-sm text-white outline-none placeholder:text-slate-500" />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" onClick={() => runAction("validate")} disabled={Boolean(busyAction)}>
                <ShieldCheck className="h-4 w-4" />
                {busyAction === "validate" ? "Validating..." : "Validate Draft"}
              </Button>
              <Button type="button" onClick={() => runAction("publish")} disabled={Boolean(busyAction) || !state.draft.validation.valid} className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100">
                <FileCheck2 className="h-4 w-4" />
                {busyAction === "publish" ? "Publishing..." : "Publish Snapshot"}
              </Button>
              {message ? <span className="inline-flex items-center rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 text-sm font-semibold text-cyan-100">{message}</span> : null}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Published Release History" icon={History}>
            <div className="space-y-3">
              {state.releases.map((release) => {
                const isLatest = latest?.contentVersion === release.contentVersion;
                return (
                  <article key={release.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <WorkspaceBadge value={isLatest ? "latest published" : release.status} />
                          {release.rollbackOf ? <WorkspaceBadge value={`rollback of v${release.rollbackOf}`} /> : null}
                        </div>
                        <h3 className="mt-3 text-2xl font-black text-white">{release.title}</h3>
                        <p className="mt-1 text-sm font-bold text-cyan-100">{release.version} · contentVersion {release.contentVersion}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{release.notes}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a href={`/api/game-content/snapshot?version=${release.contentVersion}`} target="_blank" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100">
                          Open Snapshot
                        </a>
                        {!isLatest ? (
                          <Button type="button" onClick={() => runAction("rollback", release.contentVersion)} disabled={Boolean(busyAction)} className="border-amber-300/30 bg-amber-400/10 text-amber-100">
                            <RotateCcw className="h-4 w-4" />
                            {busyAction === `rollback-${release.contentVersion}` ? "Rolling Back..." : "Rollback"}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <WorkspaceStatTile label="Validation" value={release.validationStatus} />
                      <WorkspaceStatTile label="Errors" value={release.errorCount} />
                      <WorkspaceStatTile label="Warnings" value={release.warningCount} />
                      <WorkspaceStatTile label="Hash" value={shortHash(release.contentHash)} />
                    </div>
                  </article>
                );
              })}
            </div>
          </WorkspacePanel>
        </section>

        <aside className="space-y-5">
          <WorkspacePanel title="Game API Endpoints" icon={Clipboard}>
            <div className="space-y-3">
              <a href={state.endpoints.manifest} target="_blank" className="block rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-bold text-cyan-100">
                {state.endpoints.manifest}
              </a>
              <a href={state.endpoints.snapshot} target="_blank" className="block rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-bold text-cyan-100">
                {state.endpoints.snapshot}
              </a>
              <Button type="button" onClick={copyEndpoints}>
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                {copied ? "Copied" : "Copy Endpoints"}
              </Button>
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Snapshot Validation" icon={state.draft.validation.valid ? ShieldCheck : ShieldAlert}>
            <div className="grid gap-3">
              <WorkspaceStatTile label="Status" value={state.draft.validation.status} />
              <WorkspaceStatTile label="Errors" value={state.draft.validation.errorCount} />
              <WorkspaceStatTile label="Warnings" value={state.draft.validation.warningCount} />
              <WorkspaceStatTile label="Draft Hash" value={shortHash(state.draft.contentHash)} />
            </div>
            <div className="mt-4 space-y-2">
              {state.draft.validation.issues.length ? (
                state.draft.validation.issues.slice(0, 5).map((issue) => (
                  <div key={`${issue.code}-${issue.message}`} className="rounded-md border border-amber-300/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                    <p className="font-black">{issue.code}</p>
                    <p className="mt-1 text-amber-100/80">{issue.message}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-100">
                  No validation issues found.
                </div>
              )}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Published Modules">
            <div className="grid gap-2">
              {moduleEntries.map(([key, count]) => (
                <div key={key} className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-300">{key}</span>
                  <span className="text-sm font-black text-white">{count}</span>
                </div>
              ))}
            </div>
          </WorkspacePanel>
        </aside>
      </div>
    </main>
  );
}
