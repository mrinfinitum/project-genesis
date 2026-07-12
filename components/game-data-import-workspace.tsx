"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, FileJson, History, Link2, UploadCloud, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import type { GameRuntimeData, ImportPreview, ImportResult, ImportIssue } from "@/types/runtime";

type ImportWorkspaceState = {
  runtimeData: GameRuntimeData;
  validation: ImportPreview["validation"];
  history: ImportResult[];
  endpoint: string;
  previewEndpoint: string;
  applyEndpoint: string;
};

type ImportSourceType = ImportPreview["sourceType"];

type ImportRequest = {
  sourceType: ImportSourceType;
  source: string;
  importedFrom: string;
  sourceProject: string;
  sourceFormat: string;
  environment: string;
  payload: unknown;
};

const sourceLabels: Record<ImportSourceType, string> = {
  pasted_json: "Pasted JSON",
  json_file: "JSON File",
  local_endpoint: "Local Endpoint",
  existing_project_migration: "Existing Project"
};

function compactDate(value: string) {
  return new Date(value).toLocaleString();
}

function total(values: Record<string, string[]>) {
  return Object.values(values).reduce((sum, rows) => sum + rows.length, 0);
}

function issueColor(issue: ImportIssue) {
  if (issue.severity === "error") return "border-rose-300/20 bg-rose-400/10 text-rose-100";
  if (issue.severity === "warning") return "border-amber-300/20 bg-amber-400/10 text-amber-100";
  return "border-cyan-300/20 bg-cyan-400/10 text-cyan-100";
}

export function GameDataImportWorkspace({ initialState }: { initialState: ImportWorkspaceState }) {
  const [sourceType, setSourceType] = useState<ImportSourceType>("pasted_json");
  const [source, setSource] = useState("Pasted JSON");
  const [endpointUrl, setEndpointUrl] = useState("http://localhost:3000/api/game-content/prototype-snapshot");
  const [jsonText, setJsonText] = useState("{\n  \"metadata\": {\n    \"sourceProject\": \"Project Genesis Prototype\"\n  },\n  \"upgradeCategories\": [],\n  \"upgrades\": [],\n  \"assets\": []\n}");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [history, setHistory] = useState(initialState.history);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const currentValidation = preview?.validation ?? initialState.validation;
  const currentCounts = preview?.counts ?? {
    eras: initialState.runtimeData.eras.length,
    resources: initialState.runtimeData.resources.length,
    categories: initialState.runtimeData.upgradeCategories.length,
    upgrades: initialState.runtimeData.upgrades.length,
    assets: initialState.runtimeData.assets.length,
    balanceValues: 7,
    clientProfiles: Object.keys(initialState.runtimeData.clientProfiles).length
  };

  const lastRequest = useMemo<ImportRequest | null>(() => {
    if (!preview) return null;
    return {
      sourceType,
      source,
      importedFrom: sourceType,
      sourceProject: preview.normalizedRuntimeData.metadata.sourceProject,
      sourceFormat: "json",
      environment: "development",
      payload: preview.normalizedRuntimeData
    };
  }, [preview, source, sourceType]);

  async function payloadForSource() {
    if (sourceType === "existing_project_migration") return {};
    if (sourceType === "local_endpoint") {
      const response = await fetch(endpointUrl);
      if (!response.ok) throw new Error(`Endpoint returned ${response.status}`);
      return response.json();
    }
    return JSON.parse(jsonText);
  }

  async function runPreview() {
    setBusy(true);
    setMessage("");
    try {
      const payload = await payloadForSource();
      const request: ImportRequest = {
        sourceType,
        source: sourceType === "local_endpoint" ? endpointUrl : source,
        importedFrom: sourceType,
        sourceProject: "Project Genesis Prototype",
        sourceFormat: "json",
        environment: "development",
        payload
      };
      const response = await fetch(initialState.previewEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request)
      });
      const nextPreview = await response.json();
      setPreview(nextPreview);
      setMessage(`Preview generated with ${nextPreview.validation.status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import preview failed.");
    } finally {
      setBusy(false);
    }
  }

  async function applyImport() {
    if (!lastRequest || !preview) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(initialState.applyEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lastRequest)
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Apply import failed.");
        return;
      }
      setHistory((current) => [payload.result, ...current].slice(0, 50));
      setMessage(`Applied ${payload.result.importId}.`);
    } finally {
      setBusy(false);
    }
  }

  async function readFile(file: File | null) {
    if (!file) return;
    setSourceType("json_file");
    setSource(file.name);
    setJsonText(await file.text());
  }

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Canonical Runtime"
        title="Game Data Import"
        description="Preview prototype game payloads, normalize them into engine-agnostic runtime records, validate references, and apply only confirmed imports."
        stats={[
          { label: "Runtime Schema", value: initialState.runtimeData.metadata.schemaVersion },
          { label: "Content Version", value: initialState.runtimeData.metadata.contentVersion },
          { label: "Validation", value: currentValidation.status },
          { label: "Imports", value: history.length }
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_28rem]">
        <section className="space-y-5">
          <WorkspacePanel title="Source" icon={UploadCloud}>
            <div className="grid gap-3 md:grid-cols-4">
              {(Object.keys(sourceLabels) as ImportSourceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSourceType(type)}
                  className={`rounded-md border px-3 py-3 text-left text-sm font-black transition ${sourceType === type ? "border-cyan-300/40 bg-cyan-400/15 text-white" : "border-cyan-300/10 bg-slate-950/45 text-slate-400 hover:bg-cyan-400/10"}`}
                >
                  {sourceLabels[type]}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              {sourceType === "local_endpoint" ? (
                <label className="grid gap-2 text-sm font-semibold text-slate-300">
                  Local endpoint
                  <input value={endpointUrl} onChange={(event) => setEndpointUrl(event.target.value)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
                </label>
              ) : null}

              {sourceType === "json_file" ? (
                <label className="grid gap-2 text-sm font-semibold text-slate-300">
                  JSON file
                  <input type="file" accept="application/json,.json" onChange={(event) => readFile(event.target.files?.[0] ?? null)} className="rounded-md border border-cyan-300/15 bg-slate-950/60 p-3 text-sm text-slate-300" />
                </label>
              ) : null}

              {sourceType === "pasted_json" || sourceType === "json_file" ? (
                <label className="grid gap-2 text-sm font-semibold text-slate-300">
                  JSON payload
                  <textarea value={jsonText} onChange={(event) => setJsonText(event.target.value)} className="min-h-72 rounded-md border border-cyan-300/15 bg-slate-950/60 p-3 font-mono text-sm text-cyan-50 outline-none" />
                </label>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" onClick={runPreview} disabled={busy}>
                <FileJson className="h-4 w-4" />
                {busy ? "Working..." : "Generate Preview"}
              </Button>
              <Button type="button" onClick={applyImport} disabled={busy || !preview || !preview.validation.valid} className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100">
                <ClipboardCheck className="h-4 w-4" />
                Apply Import
              </Button>
              {message ? <span className="inline-flex h-10 items-center rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 text-sm font-semibold text-cyan-100">{message}</span> : null}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Import Preview" icon={FileJson}>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <WorkspaceStatTile label="Eras" value={currentCounts.eras} />
              <WorkspaceStatTile label="Resources" value={currentCounts.resources} />
              <WorkspaceStatTile label="Categories" value={currentCounts.categories} />
              <WorkspaceStatTile label="Upgrades" value={currentCounts.upgrades} />
              <WorkspaceStatTile label="Assets" value={currentCounts.assets} />
              <WorkspaceStatTile label="Profiles" value={currentCounts.clientProfiles} />
            </div>

            {preview ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <WorkspaceStatTile label="New Records" value={total(preview.changes.newRecords)} />
                <WorkspaceStatTile label="Updated Records" value={total(preview.changes.updatedRecords)} />
                <WorkspaceStatTile label="Unchanged Records" value={total(preview.changes.unchangedRecords)} />
              </div>
            ) : null}
          </WorkspacePanel>

          <WorkspacePanel title="Conflicts">
            {preview?.changes.conflicts.length ? (
              <div className="space-y-2">
                {preview.changes.conflicts.slice(0, 12).map((conflict) => (
                  <div key={`${conflict.category}-${conflict.id}-${conflict.field}`} className="rounded-md border border-amber-300/20 bg-amber-400/10 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <WorkspaceBadge value={conflict.category} />
                      <span className="text-sm font-black text-white">{conflict.id}</span>
                      <span className="text-sm text-amber-100">{conflict.field}</span>
                    </div>
                    <p className="mt-2 text-xs text-amber-100/80">Recommended: {conflict.recommendedResolution.replaceAll("_", " ")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-100">No field-level conflicts in the current preview.</div>
            )}
          </WorkspacePanel>

          <WorkspacePanel title="Relationship Map" icon={Link2}>
            <div className="grid gap-3 md:grid-cols-3">
              <WorkspaceStatTile label="Categories Linked" value={Object.keys(preview?.relationshipMap.upgradesByCategory ?? {}).length} />
              <WorkspaceStatTile label="Eras Linked" value={Object.keys(preview?.relationshipMap.upgradesByEra ?? {}).length} />
              <WorkspaceStatTile label="Asset Keys" value={Object.keys(preview?.relationshipMap.assetsByKey ?? {}).length} />
            </div>
          </WorkspacePanel>
        </section>

        <aside className="space-y-5">
          <WorkspacePanel title="Validation" icon={currentValidation.valid ? CheckCircle2 : XCircle}>
            <div className="grid gap-3">
              <WorkspaceStatTile label="Status" value={currentValidation.status} />
              <WorkspaceStatTile label="Errors" value={currentValidation.errorCount} />
              <WorkspaceStatTile label="Warnings" value={currentValidation.warningCount} />
              <WorkspaceStatTile label="Checked" value={compactDate(currentValidation.checkedAt)} />
            </div>
            <div className="mt-4 space-y-2">
              {currentValidation.issues.slice(0, 8).map((issue) => (
                <div key={`${issue.code}-${issue.records.join("-")}`} className={`rounded-md border p-3 ${issueColor(issue)}`}>
                  <p className="text-sm font-black">{issue.code}</p>
                  <p className="mt-1 text-sm leading-5 opacity-80">{issue.message}</p>
                </div>
              ))}
              {!currentValidation.issues.length ? <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-100">Runtime schema validation is clean.</div> : null}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Import Summary">
            <div className="space-y-2">
              {["newRecords", "updatedRecords", "unchangedRecords"].map((key) => (
                <div key={key} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{key.replace(/([A-Z])/g, " $1")}</p>
                  <p className="mt-1 text-2xl font-black text-white">{preview ? total(preview.changes[key as keyof Pick<ImportPreview["changes"], "newRecords" | "updatedRecords" | "unchangedRecords">]) : 0}</p>
                </div>
              ))}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="History" icon={History}>
            {history.length ? (
              <div className="space-y-2">
                {history.slice(0, 8).map((entry) => (
                  <div key={entry.importId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-black text-white">{entry.source}</p>
                      <WorkspaceBadge value={entry.result} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{compactDate(entry.timestamp)}</p>
                    <p className="mt-2 text-xs text-slate-300">Added {entry.recordsAdded} / Updated {entry.recordsUpdated} / Conflicts {entry.conflicts}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-300">No applied runtime imports yet.</div>
            )}
          </WorkspacePanel>

          <WorkspacePanel title="Canonical Endpoint">
            <a href={initialState.endpoint} target="_blank" className="block rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 font-mono text-sm text-cyan-100">
              {initialState.endpoint}
            </a>
          </WorkspacePanel>
        </aside>
      </div>
    </main>
  );
}
