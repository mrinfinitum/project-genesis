"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Download, ExternalLink, FileCode2, ServerCog, ShieldAlert, ShieldCheck } from "lucide-react";
import type { EngineTarget, EngineTargetConfig, ExportValidationIssue } from "@/lib/export/game-engine";

type ExportValidationSummary = {
  valid: boolean;
  status: string;
  errorCount: number;
  warningCount: number;
  checkedAt: string;
  checklist: string[];
  issues: ExportValidationIssue[];
};

type ModuleCount = {
  key: string;
  count: number;
};

type GameEngineExportsWorkspaceProps = {
  targets: EngineTargetConfig[];
  moduleCounts: ModuleCount[];
  validation: ExportValidationSummary;
};

const instructions: Record<EngineTarget, string> = {
  roblox:
    "Import the Lua ModuleScripts into ReplicatedStorage and keep live data refreshes pointed at Studio export endpoints. Roblox consumes the Studio export; it does not become the source generator.",
  unity:
    "Import JSON into ScriptableObjects for editor convenience, then regenerate those assets from Studio exports whenever canonical data changes.",
  unreal:
    "Use DataTable-ready JSON for static builds or HTTP JSON for tools. Preserve Studio IDs as FString keys across structs and Blueprint references.",
  godot:
    "Load exported JSON through FileAccess or HTTPRequest, then hydrate autoload services from the canonical payload.",
  web:
    "Use the generated TypeScript interfaces, API client, and normalized store example to hydrate game UI from the Studio export.",
  generic:
    "Use this as the clean foundation for every engine. It includes normalized data, schema notes, validation results, and relationship maps."
};

function targetColor(target: EngineTarget) {
  return {
    roblox: "border-sky-300/35 bg-sky-400/10 text-sky-100",
    unity: "border-zinc-300/35 bg-zinc-300/10 text-zinc-100",
    unreal: "border-indigo-300/35 bg-indigo-400/10 text-indigo-100",
    godot: "border-cyan-300/35 bg-cyan-400/10 text-cyan-100",
    web: "border-emerald-300/35 bg-emerald-400/10 text-emerald-100",
    generic: "border-amber-300/35 bg-amber-400/10 text-amber-100"
  }[target];
}

export function GameEngineExportsWorkspace({ targets, moduleCounts, validation }: GameEngineExportsWorkspaceProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<EngineTarget>("generic");
  const [copied, setCopied] = useState(false);
  const selectedTarget = useMemo(() => targets.find((target) => target.id === selectedTargetId) ?? targets[0], [selectedTargetId, targets]);

  async function copyInstructions() {
    await navigator.clipboard.writeText(
      [
        `Project Genesis Studio export target: ${selectedTarget.label}`,
        `Endpoint: ${selectedTarget.endpoint}`,
        `Format: ${selectedTarget.format}`,
        "",
        "Folder structure:",
        ...selectedTarget.folderStructure.map((item) => `- ${item}`),
        "",
        "Generated modules:",
        ...selectedTarget.generatedModules.map((item) => `- ${item}`),
        "",
        "Integration rule:",
        instructions[selectedTarget.id]
      ].join("\n")
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_28rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Engine-Agnostic Export Hub</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white">Game Engine Exports</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">
            Prepare Project Genesis Studio data for Roblox, Unity, Unreal, Godot, Web, and clean Generic JSON without forking gameplay rules.
          </p>
        </div>
        <div className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Validation Status</p>
              <h2 className="mt-2 text-2xl font-black text-white">{validation.status}</h2>
            </div>
            {validation.valid ? <ShieldCheck className="h-7 w-7 text-emerald-200" /> : <ShieldAlert className="h-7 w-7 text-red-200" />}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-center">
              <p className="text-2xl font-black text-white">{validation.checklist.length}</p>
              <p className="mt-1 text-xs text-slate-500">Checks</p>
            </div>
            <div className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-center">
              <p className="text-2xl font-black text-red-100">{validation.errorCount}</p>
              <p className="mt-1 text-xs text-red-200/70">Errors</p>
            </div>
            <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-3 text-center">
              <p className="text-2xl font-black text-amber-100">{validation.warningCount}</p>
              <p className="mt-1 text-xs text-amber-200/70">Warnings</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#081120]/90 shadow-glow">
        <div className="border-b border-cyan-300/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Engine Target Selector</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
            {targets.map((target) => (
              <button
                key={target.id}
                type="button"
                onClick={() => setSelectedTargetId(target.id)}
                className={`rounded-md border px-3 py-3 text-left transition hover:bg-cyan-300/10 ${selectedTarget.id === target.id ? targetColor(target.id) : "border-cyan-300/10 bg-slate-950/45 text-slate-300"}`}
              >
                <span className="block text-sm font-black">{target.label.split(" / ")[0]}</span>
                <span className="mt-1 block text-xs text-slate-400">{target.id === "generic" ? "JSON API" : target.label.split(" / ")[1]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[1fr_26rem]">
          <div className="space-y-5 p-4">
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${targetColor(selectedTarget.id)}`}>
                    {selectedTarget.label}
                  </span>
                  <h2 className="mt-3 text-3xl font-black text-white">Export Summary</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{selectedTarget.format}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={selectedTarget.endpoint} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20">
                    <ExternalLink className="h-4 w-4" />
                    Open API
                  </a>
                  <a href={`${selectedTarget.endpoint}?download=1`} className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-300/25 bg-emerald-400/10 px-3 text-sm font-bold text-emerald-100 transition hover:border-emerald-200/60 hover:bg-emerald-400/15">
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-cyan-200" />
                  <h3 className="text-lg font-black text-white">Generated Modules</h3>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedTarget.generatedModules.map((moduleName) => (
                    <div key={moduleName} className="rounded-md border border-cyan-300/10 bg-[#07101e]/80 px-3 py-2 text-sm font-semibold text-slate-200">
                      {moduleName}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex items-center gap-2">
                  <ServerCog className="h-5 w-5 text-cyan-200" />
                  <h3 className="text-lg font-black text-white">API Endpoint References</h3>
                </div>
                <div className="mt-3 space-y-2">
                  {targets.map((target) => (
                    <div key={target.id} className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-[#07101e]/80 px-3 py-2">
                      <span className="text-sm font-semibold text-slate-300">{target.label}</span>
                      <code className="text-xs font-bold text-cyan-100">{target.endpoint}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Copy-Ready Integration Instructions</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{instructions[selectedTarget.id]}</p>
                </div>
                <button
                  type="button"
                  onClick={copyInstructions}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <aside className="border-t border-cyan-300/10 p-4 xl:border-l xl:border-t-0">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">Data Modules Included</h3>
            <div className="mt-3 grid gap-2">
              {moduleCounts.map((module) => (
                <div key={module.key} className="flex items-center justify-between rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-300">{module.key}</span>
                  <span className="text-sm font-black text-white">{module.count}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 shadow-glow">
        <div className="border-b border-cyan-300/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Validation Checklist</p>
          <h2 className="mt-1 text-2xl font-black text-white">Export Readiness</h2>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {validation.checklist.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-md border border-emerald-300/15 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              {item}
            </div>
          ))}
        </div>
        <div className="divide-y divide-cyan-300/10 border-t border-cyan-300/10">
          {validation.issues.length ? (
            validation.issues.map((issue) => (
              <article key={`${issue.code}-${issue.message}`} className="grid gap-3 p-4 lg:grid-cols-[9rem_1fr]">
                <span className={`w-fit rounded-md border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${issue.severity === "error" ? "border-red-300/35 bg-red-400/10 text-red-100" : issue.severity === "warning" ? "border-amber-300/35 bg-amber-400/10 text-amber-100" : "border-cyan-300/35 bg-cyan-400/10 text-cyan-100"}`}>
                  {issue.severity}
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">{issue.code}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{issue.message}</p>
                  {issue.records.length ? <p className="mt-2 text-xs text-slate-500">{issue.records.slice(0, 8).join(", ")}</p> : null}
                </div>
              </article>
            ))
          ) : (
            <div className="p-4 text-sm font-semibold text-emerald-100">No export validation issues found.</div>
          )}
        </div>
      </section>
    </main>
  );
}
