"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, FileJson, ImageIcon, Link2, UploadCloud, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBadge, WorkspaceHeader, WorkspacePanel, WorkspaceStatTile } from "@/components/ui/workspace";
import type { GameArtImportPreview, GameArtImportRequest, GameArtImportSourceType } from "@/lib/assets/game-art-import";

type WorkspaceState = {
  history: Array<{
    importId: string;
    sourceProject: string;
    sourceType: string;
    timestamp: string;
    importedFiles: number;
    matchedAssets: number;
    createdAssets: number;
    updatedAssets: number;
    ignoredFiles: number;
    conflicts: number;
    warnings: number;
    user: string;
  }>;
  assetCount: number;
  missingCount: number;
  endpoint: string;
  applyEndpoint: string;
};

const sourceTypes: GameArtImportSourceType[] = ["roblox_project", "web_game_project", "unity_project", "unreal_project", "godot_project", "generic_assets"];

function compactDate(value: string) {
  return new Date(value).toLocaleString();
}

function safeParseJson(value: string) {
  const parsed = JSON.parse(value);
  if (Array.isArray(parsed)) return { files: parsed };
  return parsed;
}

function extensionFor(filename: string) {
  const match = filename.match(/\.[^.]+$/);
  return match?.[0]?.toLowerCase() ?? "";
}

function mimeFor(file: File) {
  if (file.type) return file.type;
  const ext = extensionFor(file.name);
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".ogg") return "audio/ogg";
  return "application/octet-stream";
}

async function dimensionsFor(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return {};
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = reject;
    });
    image.src = url;
    const result = await loaded;
    return { width: result.naturalWidth, height: result.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function GameArtImportWorkspace({ initialState }: { initialState: WorkspaceState }) {
  const [sourceType, setSourceType] = useState<GameArtImportSourceType>("roblox_project");
  const [sourceProject, setSourceProject] = useState("Project Genesis Roblox");
  const [sourceRoot, setSourceRoot] = useState("");
  const [manifestText, setManifestText] = useState(`{
  "files": [
    {
      "filename": "survival-era-bg.webp",
      "category": "eras",
      "width": 1920,
      "height": 1080,
      "webPath": "/assets/eras/survival-era-bg.webp"
    },
    {
      "filename": "resource_iron_icon.png",
      "category": "resources",
      "width": 256,
      "height": 256,
      "robloxAssetId": "rbxassetid://000000000"
    }
  ]
}`);
  const [preview, setPreview] = useState<GameArtImportPreview | null>(null);
  const [lastPreviewRequest, setLastPreviewRequest] = useState<GameArtImportRequest | null>(null);
  const [history, setHistory] = useState(initialState.history);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const validation = preview?.validation;
  const selectedStats = useMemo(() => ({
    files: preview?.fileCount ?? 0,
    matched: preview?.matchedAssetCount ?? 0,
    unmatched: preview?.unmatchedFileCount ?? 0,
    duplicates: preview?.duplicateCount ?? 0
  }), [preview]);

  async function requestFromManifest(): Promise<GameArtImportRequest> {
    const payload = safeParseJson(manifestText) as GameArtImportRequest;
    return {
      sourceProject,
      sourceType,
      sourceRoot,
      inputType: "json_asset_manifest",
      files: [...(payload.files ?? []), ...(payload.assets ?? [])]
    };
  }

  async function runPreview(request?: GameArtImportRequest) {
    setBusy(true);
    setMessage("");
    try {
      const body = request ?? await requestFromManifest();
      const response = await fetch(initialState.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json();
      setPreview(payload);
      setLastPreviewRequest(body);
      setMessage(`Preview generated: ${payload.validation.status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Preview failed.");
    } finally {
      setBusy(false);
    }
  }

  async function applyImport() {
    if (!preview || !lastPreviewRequest) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(initialState.applyEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lastPreviewRequest)
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Apply failed.");
        return;
      }
      setHistory((current) => [payload.result, ...current].slice(0, 50));
      setMessage(`Applied ${payload.result.importId}.`);
    } finally {
      setBusy(false);
    }
  }

  async function previewFiles(files: FileList | null) {
    if (!files?.length) return;
    const filePayload = await Promise.all([...files].map(async (file) => ({
      filename: file.name,
      mimeType: mimeFor(file),
      fileSizeBytes: file.size,
      ...(await dimensionsFor(file))
    })));
    await runPreview({
      sourceProject,
      sourceType,
      sourceRoot,
      inputType: "direct_uploads",
      files: filePayload
    });
  }

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Creative Asset Intake"
        title="Game Art Import"
        description="Import and map game art manifests from Roblox, Web, Unity, Unreal, Godot, or generic asset folders without putting platform paths inside gameplay records."
        stats={[
          { label: "Imported Assets", value: initialState.assetCount },
          { label: "Missing Artwork", value: initialState.missingCount },
          { label: "Imports", value: history.length },
          { label: "Preview Status", value: validation?.status ?? "Idle" }
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_28rem]">
        <section className="space-y-5">
          <WorkspacePanel title="Import Source" icon={UploadCloud}>
            <div className="grid gap-3 md:grid-cols-3">
              {sourceTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSourceType(item)}
                  className={`rounded-md border px-3 py-3 text-left text-sm font-black transition ${sourceType === item ? "border-cyan-300/40 bg-cyan-400/15 text-white" : "border-cyan-300/10 bg-slate-950/45 text-slate-400 hover:bg-cyan-400/10"}`}
                >
                  {item.replaceAll("_", " ")}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Source project
                <input value={sourceProject} onChange={(event) => setSourceProject(event.target.value)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Source root
                <input value={sourceRoot} onChange={(event) => setSourceRoot(event.target.value)} placeholder="Optional; local paths are redacted" className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 text-sm text-white outline-none" />
              </label>
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Manifest / Direct Files" icon={FileJson}>
            <label className="grid gap-2 text-sm font-semibold text-slate-300">
              JSON asset manifest
              <textarea value={manifestText} onChange={(event) => setManifestText(event.target.value)} className="min-h-72 rounded-md border border-cyan-300/15 bg-slate-950/60 p-3 font-mono text-sm text-cyan-50 outline-none" />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" onClick={() => runPreview()} disabled={busy}>
                <FileJson className="h-4 w-4" />
                {busy ? "Working..." : "Preview Manifest"}
              </Button>
              <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20">
                <ImageIcon className="h-4 w-4" />
                Preview Files
                <input type="file" multiple accept=".png,.jpg,.jpeg,.webp,.svg,.mp3,.wav,.ogg" onChange={(event) => previewFiles(event.target.files)} className="hidden" />
              </label>
              <Button type="button" onClick={applyImport} disabled={busy || !preview || !lastPreviewRequest || !preview.validation.valid} className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100">
                <ClipboardCheck className="h-4 w-4" />
                Apply Import
              </Button>
              {message ? <span className="inline-flex h-10 items-center rounded-md border border-cyan-300/15 bg-slate-950/45 px-3 text-sm font-semibold text-cyan-100">{message}</span> : null}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Import Preview">
            <div className="grid gap-3 md:grid-cols-4">
              <WorkspaceStatTile label="Files" value={selectedStats.files} />
              <WorkspaceStatTile label="Matched" value={selectedStats.matched} />
              <WorkspaceStatTile label="Unmatched" value={selectedStats.unmatched} />
              <WorkspaceStatTile label="Duplicates" value={selectedStats.duplicates} />
            </div>
            {preview?.items.length ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {preview.items.map((item) => (
                  <div key={item.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">{item.filename}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.detectedType} / {item.mimeType}</p>
                      </div>
                      <WorkspaceBadge value={item.action} />
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-md border border-cyan-300/10 bg-[#07101e]/70 p-2">
                        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">artKey</p>
                        <p className="mt-1 break-all text-sm font-semibold text-cyan-100">{item.proposedArtKey}</p>
                      </div>
                      <div className="rounded-md border border-cyan-300/10 bg-[#07101e]/70 p-2">
                        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Match</p>
                        <p className="mt-1 break-all text-sm font-semibold text-slate-200">{item.matchedAssetId ?? "New asset"}</p>
                      </div>
                    </div>
                    {item.warnings.length ? <p className="mt-3 text-xs leading-5 text-amber-100">{item.warnings.join(" ")}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </WorkspacePanel>
        </section>

        <aside className="space-y-5">
          <WorkspacePanel title="Validation" icon={validation?.valid ? CheckCircle2 : XCircle}>
            <div className="grid gap-3">
              <WorkspaceStatTile label="Status" value={validation?.status ?? "Idle"} />
              <WorkspaceStatTile label="Errors" value={validation?.errorCount ?? 0} />
              <WorkspaceStatTile label="Warnings" value={validation?.warningCount ?? 0} />
            </div>
            <div className="mt-4 space-y-2">
              {validation?.issues.slice(0, 10).map((issue) => (
                <div key={`${issue.code}-${issue.records.join("-")}`} className="rounded-md border border-amber-300/20 bg-amber-400/10 p-3">
                  <p className="text-sm font-black text-amber-100">{issue.code}</p>
                  <p className="mt-1 text-sm leading-5 text-amber-100/80">{issue.message}</p>
                </div>
              ))}
              {validation && !validation.issues.length ? <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-100">No import validation issues.</div> : null}
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="Mapping Rules" icon={Link2}>
            <div className="space-y-2 text-sm leading-6 text-slate-300">
              <p>Auto-match order: artKey, iconKey, canonical ID, filename alias, normalized filename, Roblox asset mapping, then manual mapping.</p>
              <p>Local source paths are redacted and public exports only receive safe platform mappings.</p>
            </div>
          </WorkspacePanel>

          <WorkspacePanel title="History">
            {history.length ? (
              <div className="space-y-2">
                {history.slice(0, 8).map((entry) => (
                  <div key={entry.importId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-black text-white">{entry.sourceProject}</p>
                      <WorkspaceBadge value={entry.sourceType} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{compactDate(entry.timestamp)}</p>
                    <p className="mt-2 text-xs text-slate-300">Files {entry.importedFiles} / Created {entry.createdAssets} / Updated {entry.updatedAssets}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-semibold text-slate-300">No game art imports yet.</div>
            )}
          </WorkspacePanel>
        </aside>
      </div>
    </main>
  );
}
