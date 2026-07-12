"use client";

import { useState } from "react";
import { CheckCircle2, Clipboard, Download, FileJson, Rocket, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceHeader, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import type { PrototypeSnapshot } from "@/lib/game-content/prototype";

type PrototypeState = {
  latest: PrototypeSnapshot;
  draftValidation: PrototypeSnapshot["validation"];
  endpoint: string;
  downloadPath: string;
};

function compactDate(value: string) {
  return new Date(value).toLocaleString();
}

export function PrototypeContentWorkspace({ initialState }: { initialState: PrototypeState }) {
  const [state, setState] = useState(initialState);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  async function generateSnapshot() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(state.endpoint, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Snapshot generation failed.");
        return;
      }
      setState((current) => ({ ...current, latest: payload, draftValidation: payload.validation }));
      setMessage(`Generated contentVersion ${payload.contentVersion}.`);
    } finally {
      setBusy(false);
    }
  }

  async function copyEndpoint() {
    await navigator.clipboard.writeText(`${window.location.origin}${state.endpoint}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const validation = state.draftValidation;
  const latest = state.latest;

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Studio Prototype Export"
        title="Prototype Content"
        description="Generate a lightweight published snapshot so the separate Project Genesis Game prototype can consume real Studio resource data without Supabase or a live full API."
        stats={[
          { label: "Content Version", value: latest.contentVersion },
          { label: "Schema Version", value: latest.schemaVersion },
          { label: "Resources", value: latest.resources.length },
          { label: "Validation", value: validation.status }
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <section className="space-y-5">
          <WorkspacePanel title="Generate Prototype Snapshot" icon={Rocket}>
            <div className="grid gap-4 md:grid-cols-3">
              <WorkspaceStatTile label="Current Version" value={latest.contentVersion} />
              <WorkspaceStatTile label="Last Generated" value={compactDate(latest.generatedAt)} />
              <WorkspaceStatTile label="Resource Count" value={latest.resources.length} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" onClick={generateSnapshot} disabled={busy || !validation.valid} className="h-11 border-emerald-300/30 bg-emerald-400/10 text-emerald-100">
                <FileJson className="h-4 w-4" />
                {busy ? "Generating..." : "Generate Snapshot"}
              </Button>
              <a href={state.downloadPath} download="project-genesis-prototype-content.json" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20">
                <Download className="h-4 w-4" />
                Download Snapshot
              </a>
              <Button type="button" onClick={copyEndpoint} className="h-11">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                {copied ? "Copied" : "Copy Endpoint URL"}
              </Button>
              {message ? <span className="inline-flex h-11 items-center rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 text-sm font-semibold text-cyan-100">{message}</span> : null}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Prototype Payload">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["resources", latest.resources.length],
                ["eras", latest.eras.length],
                ["alignments", latest.alignments.length],
                ["research", latest.research.length],
                ["unlockMatrix", latest.unlockMatrix.length],
                ["productionChains", latest.productionChains.length],
                ["planets", latest.planets.length],
                ["solarSystem bodies", latest.solarSystem.bodies.length]
              ].map(([label, value]) => (
                <WorkspaceStatTile key={String(label)} label={String(label)} value={String(value)} />
              ))}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Endpoint Reference" icon={FileJson}>
            <a href={state.endpoint} target="_blank" className="block rounded-md border border-cyan-300/10 bg-slate-950/45 p-4 font-mono text-sm text-cyan-100">
              {state.endpoint}
            </a>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The prototype endpoint returns the latest generated lightweight snapshot. The static download mirrors the same payload at <code className="text-cyan-100">{state.downloadPath}</code>.
            </p>
          </WorkspacePanel>
        </section>

        <aside className="space-y-5">
          <WorkspacePanel title="Validation Status" icon={validation.valid ? ShieldCheck : ShieldAlert}>
            <div className="grid gap-3">
              <WorkspaceStatTile label="Status" value={validation.status} />
              <WorkspaceStatTile label="Errors" value={validation.errorCount} />
              <WorkspaceStatTile label="Warnings" value={validation.warningCount} />
              <WorkspaceStatTile label="Checked" value={compactDate(validation.checkedAt)} />
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Validation Issues">
            {validation.issues.length ? (
              <div className="space-y-2">
                {validation.issues.slice(0, 8).map((issue) => (
                  <div key={`${issue.code}-${issue.records.join("-")}`} className="rounded-md border border-rose-300/20 bg-rose-400/10 p-3">
                    <p className="text-sm font-black text-rose-100">{issue.code}</p>
                    <p className="mt-1 text-sm leading-5 text-rose-100/80">{issue.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-100">
                No prototype snapshot validation issues found.
              </div>
            )}
          </WorkspacePanel>
        </aside>
      </div>
    </main>
  );
}
