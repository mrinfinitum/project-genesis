"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Copy,
  FileImage,
  Folder,
  Image as ImageIcon,
  Layers3,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildEnvironmentLayerAssetRecord,
  buildEnvironmentLayerPrompt,
  calculateEnvironmentGeneratorProgress,
  defaultEnvironmentGeneratorControls,
  environmentArtStandard,
  environmentGeneratorStatuses,
  extractFixedExclusions,
  migrateEnvironmentLayerProgress,
  nextEnvironmentLayerFilename,
  starSystemAstronomicalMattePaintingPrompt,
  type EnvironmentGeneratorControls,
  type EnvironmentGeneratorDefinition,
  type EnvironmentGeneratorStatus,
  type EnvironmentLayerAssetRecord,
  type EnvironmentLayerDefinition,
  type EnvironmentLayerProgress
} from "@/lib/environment-layer-generators";

type WorkspaceState = {
  controls: EnvironmentGeneratorControls;
  progress: Record<string, EnvironmentLayerProgress>;
};

const emptyLayerProgress: EnvironmentLayerProgress = {
  status: "not_started",
  editablePromptAdditions: "",
  filenameSuffix: "DeepVoid",
  previewRelativePath: "",
  notes: ""
};

const statusLabels: Record<EnvironmentGeneratorStatus, string> = {
  not_started: "Not Started",
  prompt_copied: "Prompt Copied",
  generated: "Generated",
  psd_saved: "PSD Saved",
  exported: "Exported",
  registered: "Registered",
  approved: "Approved",
  needs_revision: "Needs Revision"
};

function statusClass(status: EnvironmentGeneratorStatus) {
  if (status === "approved") return "border-emerald-300/35 bg-emerald-300/10 text-emerald-100";
  if (status === "needs_revision") return "border-rose-300/35 bg-rose-300/10 text-rose-100";
  if (status === "not_started") return "border-slate-600/60 bg-slate-900/60 text-slate-300";
  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

function parseState(value: string | null, definition: EnvironmentGeneratorDefinition): WorkspaceState {
  if (!value) return { controls: defaultEnvironmentGeneratorControls, progress: {} };
  try {
    const parsed = JSON.parse(value) as Partial<WorkspaceState>;
    return {
      controls: { ...defaultEnvironmentGeneratorControls, ...(parsed.controls ?? {}) },
      progress: migrateEnvironmentLayerProgress(definition.id, parsed.progress ?? {})
    };
  } catch {
    return { controls: defaultEnvironmentGeneratorControls, progress: {} };
  }
}

function inputClass() {
  return "h-10 w-full rounded border border-cyan-400/20 bg-[#050d1a] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60";
}

function TextField({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input className={inputClass()} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded border border-cyan-400/15 bg-slate-950/35 px-3 py-2.5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-100" title={String(value)}>{value}</p>
    </div>
  );
}

function EnvironmentArtStandardPanel() {
  return (
    <section className="overflow-hidden rounded-md border border-cyan-300/25 bg-[#050d19]/95 shadow-glow">
      <div className="border-b border-cyan-300/15 px-4 py-3 lg:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-300">Permanent Visual Benchmark</p>
            <h2 className="mt-1 text-xl font-bold text-white">NOVERIS Environment Standard</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded border border-cyan-300/25 bg-cyan-300/[0.07] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-cyan-100">
              Version {environmentArtStandard.version}
            </span>
            <span className="rounded border border-emerald-300/30 bg-emerald-300/[0.07] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-emerald-100">
              Quiet Mode · Enabled
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <figure className="border-b border-cyan-300/15 bg-black lg:border-b-0 lg:border-r">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={environmentArtStandard.referenceImagePath}
            alt="Canonical NOVERIS deep-space environment artwork benchmark"
            className="aspect-video h-full max-h-[360px] w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <figcaption className="border-t border-cyan-300/10 px-4 py-2 text-xs text-slate-500">
            Canonical reference for restraint, stellar density, cloud scale, and negative space.
          </figcaption>
        </figure>

        <div className="space-y-4 p-4 lg:p-5">
          <p className="text-sm leading-6 text-slate-300">{environmentArtStandard.philosophy}</p>
          <div className="grid grid-cols-2 gap-2">
            <Metric
              label="Visual Quiet"
              value={`${environmentArtStandard.backgroundOccupancy.quietMinimumPercent}-${environmentArtStandard.backgroundOccupancy.quietMaximumPercent}%`}
            />
            <Metric
              label="Artwork Occupancy"
              value={`${environmentArtStandard.backgroundOccupancy.artworkMinimumPercent}-${environmentArtStandard.backgroundOccupancy.artworkMaximumPercent}%`}
            />
            <Metric label="Tiny Stars" value={`${environmentArtStandard.starDensity.tinyPercent}%`} />
            <Metric label="Bright Stars" value={`${environmentArtStandard.starDensity.brightPercent}%`} />
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.17em] text-slate-500">Visual Hierarchy</p>
            <ol className="mt-2 flex flex-wrap gap-1.5">
              {environmentArtStandard.visualHierarchy.map((item, index) => (
                <li key={item} className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="rounded border border-cyan-300/20 bg-cyan-300/[0.05] px-2 py-1">
                    {index + 1}. {item}
                  </span>
                  {index < environmentArtStandard.visualHierarchy.length - 1 ? <span className="text-slate-700">›</span> : null}
                </li>
              ))}
            </ol>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Molecular clouds: {environmentArtStandard.molecularCloudQualities.join(", ")}. They should feel thousands of light years away.
          </p>
          <div className="rounded border border-cyan-300/15 bg-[#030916] p-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.17em] text-cyan-300">Quiet Mode</p>
            <p className="mt-1 text-xs font-semibold text-emerald-200">Enabled</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {starSystemAstronomicalMattePaintingPrompt.quietMode.description.join(" ")}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {starSystemAstronomicalMattePaintingPrompt.quietMode.depthTreatment}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-cyan-300/15 px-4 py-4 lg:px-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.17em] text-cyan-300">Approval Checklist</p>
        <ul className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2 xl:grid-cols-5">
          {environmentArtStandard.reviewChecklist.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-5 text-slate-300">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-cyan-300/30 text-cyan-200">
                <Check className="h-3 w-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LayerPreview({ path, name }: { path: string; name: string }) {
  const canRender = path.startsWith("/") || path.startsWith("https://");
  return (
    <div className="flex aspect-video items-center justify-center overflow-hidden rounded border border-cyan-400/15 bg-[#030916]">
      {canRender ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={path} alt={`${name} preview`} className="h-full w-full object-contain" loading="lazy" decoding="async" />
      ) : (
        <div className="text-center text-slate-600">
          <ImageIcon className="mx-auto h-8 w-8" />
          <p className="mt-2 text-xs">{path ? "Preview reference saved" : "Preview not attached"}</p>
        </div>
      )}
    </div>
  );
}

function LayerCard({
  definition,
  layer,
  controls,
  progress,
  assets,
  expanded,
  copiedKey,
  onToggle,
  onProgress,
  onCopy,
  onRegister
}: {
  definition: EnvironmentGeneratorDefinition;
  layer: EnvironmentLayerDefinition;
  controls: EnvironmentGeneratorControls;
  progress: EnvironmentLayerProgress;
  assets: EnvironmentLayerAssetRecord[];
  expanded: boolean;
  copiedKey: string;
  onToggle: () => void;
  onProgress: (patch: Partial<EnvironmentLayerProgress>) => void;
  onCopy: (key: string, value: string) => void;
  onRegister: (record: EnvironmentLayerAssetRecord) => Promise<void>;
}) {
  const layerAssets = assets.filter((asset) => asset.environmentType === definition.id && asset.layerNumber === layer.number);
  const psdCount = layerAssets.filter((asset) => /\.psd$/i.test(asset.sourceRelativePath)).length;
  const filename = nextEnvironmentLayerFilename(
    layer.prefix,
    progress.filenameSuffix,
    layerAssets.map((asset) => asset.sourceRelativePath)
  );
  const prompt = buildEnvironmentLayerPrompt(layer, controls, progress.editablePromptAdditions);
  const exclusions = extractFixedExclusions(layer.canonicalPrompt);
  const isLockedEnvironmentPainting = layer.id === starSystemAstronomicalMattePaintingPrompt.layerId;
  const [registering, setRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  async function register() {
    setRegistering(true);
    setRegistrationError("");
    try {
      const record = buildEnvironmentLayerAssetRecord({
        definition,
        layer,
        filename,
        previewRelativePath: progress.previewRelativePath,
        status: progress.status === "not_started" ? "registered" : progress.status,
        notes: progress.notes,
        controls
      });
      await onRegister(record);
      onProgress({ status: "registered" });
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : "Asset registration failed.");
    } finally {
      setRegistering(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-md border border-cyan-400/20 bg-[#07101e]/90 shadow-glow">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left outline-none transition hover:bg-cyan-300/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
        aria-expanded={expanded}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-cyan-300/25 bg-cyan-300/10 text-sm font-bold text-cyan-100">
          {String(layer.number).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-bold text-white">{layer.name}</span>
          <span className="mt-1 block truncate text-xs text-slate-400">{layer.prefix} · {layer.output.width} × {layer.output.height} · {layer.output.transparency}</span>
        </span>
        <span className={`hidden rounded border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] sm:block ${statusClass(progress.status)}`}>
          {statusLabels[progress.status]}
        </span>
        <span className="hidden text-xs text-slate-500 lg:block">{psdCount} PSD · {layerAssets.length} registered</span>
        {expanded ? <ChevronDown className="h-5 w-5 text-cyan-200" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
      </button>

      {expanded ? (
        <div className="border-t border-cyan-400/15 p-4 lg:p-5">
          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">
            <div className="space-y-4">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">Purpose</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{layer.purpose}</p>
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                        {isLockedEnvironmentPainting ? "Canonical Render Prompt" : "Finished Image Prompt"}
                      </p>
                      {isLockedEnvironmentPainting ? (
                        <>
                          <span className="rounded border border-emerald-300/30 bg-emerald-300/[0.07] px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-emerald-100">
                            Locked
                          </span>
                          <span className="rounded border border-cyan-300/20 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                            Version {starSystemAstronomicalMattePaintingPrompt.version}
                          </span>
                        </>
                      ) : null}
                    </div>
                    {isLockedEnvironmentPainting ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Approved production prompt used to generate every NOVERIS Star System Environment Painting.
                      </p>
                    ) : null}
                  </div>
                  <Button type="button" className="h-8 px-3" onClick={() => onCopy(`${layer.id}:prompt`, prompt)}>
                    {copiedKey === `${layer.id}:prompt` ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                    Copy Prompt
                  </Button>
                </div>
                <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded border border-cyan-400/15 bg-[#030916] p-4 text-xs leading-5 text-slate-300">
                  {prompt}
                </pre>
              </div>
              {isLockedEnvironmentPainting ? null : (
                <label className="block space-y-1.5">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Editable Prompt Additions</span>
                  <textarea
                    value={progress.editablePromptAdditions}
                    onChange={(event) => onProgress({ editablePromptAdditions: event.target.value })}
                    placeholder="Add controlled details for this layer without changing its canonical purpose."
                    className="min-h-24 w-full rounded border border-cyan-400/20 bg-[#050d1a] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/60"
                  />
                </label>
              )}
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Fixed Exclusions</p>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">
                  {exclusions.map((row) => <li key={row}>• {row}</li>)}
                </ul>
              </div>
            </div>

            <aside className="space-y-4">
              <LayerPreview path={progress.previewRelativePath} name={layer.name} />
              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Preview Image Reference</span>
                <input
                  value={progress.previewRelativePath}
                  onChange={(event) => onProgress({ previewRelativePath: event.target.value })}
                  placeholder="public/uploads/... or repository-relative preview"
                  className={inputClass()}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Dimensions" value={`${layer.output.width} × ${layer.output.height}`} />
                <Metric label="Aspect" value={layer.output.aspectRatio} />
                <Metric label="Transparency" value={layer.output.transparency} />
                <Metric label="Registered" value={layerAssets.length} />
              </div>
              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Production Status</span>
                <select
                  className={inputClass()}
                  value={progress.status}
                  onChange={(event) => onProgress({ status: event.target.value as EnvironmentGeneratorStatus })}
                >
                  {environmentGeneratorStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Filename Suffix</span>
                <input className={inputClass()} value={progress.filenameSuffix} onChange={(event) => onProgress({ filenameSuffix: event.target.value })} />
              </label>
              <div className="space-y-2 rounded border border-cyan-400/15 bg-[#030916] p-3">
                <PathCopyRow label="PSD filename" value={filename} copyKey={`${layer.id}:filename`} copiedKey={copiedKey} onCopy={onCopy} />
                <PathCopyRow label="PSD folder" value={layer.folder} copyKey={`${layer.id}:psd`} copiedKey={copiedKey} onCopy={onCopy} />
                <PathCopyRow label="Runtime folder" value={layer.runtimeExportFolder} copyKey={`${layer.id}:runtime`} copiedKey={copiedKey} onCopy={onCopy} />
              </div>
              <label className="block space-y-1.5">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Notes</span>
                <textarea
                  value={progress.notes}
                  onChange={(event) => onProgress({ notes: event.target.value })}
                  className="min-h-20 w-full rounded border border-cyan-400/20 bg-[#050d1a] p-3 text-sm text-white outline-none focus:border-cyan-300/60"
                />
              </label>
              <Button type="button" className="w-full" disabled={registering} onClick={register}>
                <Save className="h-4 w-4" />
                {registering ? "Registering..." : "Register Asset"}
              </Button>
              {registrationError ? <p className="text-xs leading-5 text-rose-300">{registrationError}</p> : null}
            </aside>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function PathCopyRow({
  label,
  value,
  copyKey,
  copiedKey,
  onCopy
}: {
  label: string;
  value: string;
  copyKey: string;
  copiedKey: string;
  onCopy: (key: string, value: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-600">{label}</p>
        <p className="mt-0.5 truncate text-xs text-cyan-100" title={value}>{value}</p>
      </div>
      <button type="button" title={`Copy ${label}`} onClick={() => onCopy(copyKey, value)} className="rounded p-2 text-slate-400 transition hover:bg-cyan-300/10 hover:text-cyan-100">
        {copiedKey === copyKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function EnvironmentLayerGenerator({ definition }: { definition: EnvironmentGeneratorDefinition }) {
  const storageKey = `project-genesis-environment-generator:${definition.id}:v1`;
  const [workspace, setWorkspace] = useState<WorkspaceState>({ controls: defaultEnvironmentGeneratorControls, progress: {} });
  const [assets, setAssets] = useState<EnvironmentLayerAssetRecord[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([definition.layers[0]?.id ?? ""]);
  const [query, setQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWorkspace(parseState(window.localStorage.getItem(storageKey), definition));
    setHydrated(true);
    fetch("/api/environment-layer-assets")
      .then((response) => response.json())
      .then((payload) => setAssets(Array.isArray(payload.records) ? payload.records : []))
      .catch(() => setAssets([]));
  }, [definition, storageKey]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(workspace));
  }, [hydrated, storageKey, workspace]);

  const progress = useMemo(
    () => calculateEnvironmentGeneratorProgress(definition, workspace.progress, assets),
    [assets, definition, workspace.progress]
  );
  const visibleLayers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return definition.layers;
    return definition.layers.filter((layer) => `${layer.name} ${layer.prefix} ${layer.layerType} ${layer.purpose}`.toLowerCase().includes(needle));
  }, [definition.layers, query]);

  function updateControls<K extends keyof EnvironmentGeneratorControls>(key: K, value: EnvironmentGeneratorControls[K]) {
    setWorkspace((current) => ({ ...current, controls: { ...current.controls, [key]: value } }));
  }

  function updateProgress(layerId: string, patch: Partial<EnvironmentLayerProgress>) {
    setWorkspace((current) => ({
      ...current,
      progress: {
        ...current.progress,
        [layerId]: { ...emptyLayerProgress, ...(current.progress[layerId] ?? {}), ...patch }
      }
    }));
  }

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((current) => current === key ? "" : current), 1400);
    if (key.endsWith(":prompt")) {
      const layerId = key.slice(0, -7);
      updateProgress(layerId, { status: "prompt_copied" });
    }
  }

  async function registerAsset(record: EnvironmentLayerAssetRecord) {
    const response = await fetch("/api/environment-layer-assets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(record)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Asset registration failed.");
    setAssets((current) => [...current, payload.record]);
  }

  function resetProgress() {
    if (!window.confirm(`Reset all local ${definition.name} progress? Registered Studio assets will not be deleted.`)) return;
    setWorkspace({ controls: defaultEnvironmentGeneratorControls, progress: {} });
    window.localStorage.removeItem(storageKey);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Environment Artwork Production</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{definition.name}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
            Work through every canonical layer from prompt to approved registered asset. These pages guide source-layer production; they do not generate final scenes or replace artistic review.
          </p>
        </div>
        <Button type="button" className="border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800" onClick={resetProgress}>
          <RefreshCcw className="h-4 w-4" />
          Reset Page Progress
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Started" value={`${progress.started} / ${progress.total}`} />
        <Metric label="Approved" value={progress.approved} />
        <Metric label="Needs Revision" value={progress.needsRevision} />
        <Metric label="PSD Masters" value={progress.psdSaved} />
        <Metric label="Runtime Exports" value={progress.exported} />
        <Metric label="Registered Assets" value={progress.registered} />
        <Metric label="Missing Previews" value={progress.missingPreviews} />
        <Metric label="Missing Approved Exports" value={progress.missingApprovedExports} />
        <div className="sm:col-span-2">
          <Metric label="Source Root" value={definition.sourceRoot} />
        </div>
      </section>

      {definition.layers.some((layer) => layer.layerType === "environment-painting") ? <EnvironmentArtStandardPanel /> : null}

      <details className="rounded-md border border-cyan-400/20 bg-[#07101e]/90 p-4 shadow-glow">
        <summary className="cursor-pointer list-none text-sm font-bold text-white">
          <span className="inline-flex items-center gap-2"><Layers3 className="h-4 w-4 text-cyan-300" /> Artist Controls</span>
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <TextField label="Theme" value={workspace.controls.theme} onChange={(value) => updateControls("theme", value)} />
          <TextField label="Palette" value={workspace.controls.palette} onChange={(value) => updateControls("palette", value)} />
          <TextField label="Mood" value={workspace.controls.mood} onChange={(value) => updateControls("mood", value)} />
          <TextField label="Primary Color" value={workspace.controls.primaryColorFamily} onChange={(value) => updateControls("primaryColorFamily", value)} />
          <TextField label="Secondary Color" value={workspace.controls.secondaryColorFamily} onChange={(value) => updateControls("secondaryColorFamily", value)} />
          <TextField label="Accent Color" value={workspace.controls.accentColorFamily} onChange={(value) => updateControls("accentColorFamily", value)} />
          <TextField label="Density" value={workspace.controls.density} onChange={(value) => updateControls("density", value)} />
          <TextField label="Brightness" value={workspace.controls.brightness} onChange={(value) => updateControls("brightness", value)} />
          <TextField label="Negative Space" value={workspace.controls.negativeSpacePreference} onChange={(value) => updateControls("negativeSpacePreference", value)} />
          <TextField label="Central Safe Zone %" type="number" value={workspace.controls.centralSafeZonePercentage} onChange={(value) => updateControls("centralSafeZonePercentage", Math.max(0, Math.min(100, Number(value))))} />
          <TextField label="Master Resolution" value={workspace.controls.masterResolution} onChange={(value) => updateControls("masterResolution", value)} />
          <TextField label="Runtime Resolution" value={workspace.controls.runtimeExportResolution} onChange={(value) => updateControls("runtimeExportResolution", value)} />
          <TextField label="Aspect Ratio" value={workspace.controls.aspectRatio} onChange={(value) => updateControls("aspectRatio", value)} />
          <TextField label="Transparency" value={workspace.controls.transparencyRequirement} onChange={(value) => updateControls("transparencyRequirement", value)} />
          <div className="sm:col-span-2">
            <TextField label="Style Notes" value={workspace.controls.styleNotes} onChange={(value) => updateControls("styleNotes", value)} />
          </div>
          <div className="sm:col-span-2">
            <TextField label="Additional Exclusions" value={workspace.controls.additionalExclusions} onChange={(value) => updateControls("additionalExclusions", value)} />
          </div>
        </div>
      </details>

      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-md border border-cyan-400/20 bg-[#07101e]/90 p-3 xl:sticky xl:top-20">
          <div className="flex items-center gap-2 px-2 py-2">
            <Folder className="h-4 w-4 text-cyan-300" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Canonical Layer Tree</p>
              <p className="text-xs text-slate-500">{definition.layers.length} required layers</p>
            </div>
          </div>
          <nav className="mt-2 space-y-1">
            {definition.layers.map((layer) => {
              const layerProgress = { ...emptyLayerProgress, ...(workspace.progress[layer.id] ?? {}) };
              return (
                <button
                  type="button"
                  key={layer.id}
                  onClick={() => {
                    setExpandedIds((current) => current.includes(layer.id) ? current : [...current, layer.id]);
                    document.getElementById(layer.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-slate-300 transition hover:bg-cyan-300/10 hover:text-white"
                >
                  <span className="w-6 text-xs text-slate-600">{String(layer.number).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 truncate">{layer.name}</span>
                  <span className={`h-2 w-2 rounded-full ${layerProgress.status === "approved" ? "bg-emerald-300" : layerProgress.status === "not_started" ? "bg-slate-700" : "bg-cyan-300"}`} />
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 space-y-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input className={`${inputClass()} h-12 pl-11`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search layer name, prefix, purpose" />
          </label>
          <div className="flex items-center gap-2 rounded border border-cyan-400/15 bg-cyan-300/[0.04] px-3 py-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            PSD masters remain private. Registration stores repository-relative references only.
          </div>
          {visibleLayers.map((layer) => {
            const layerProgress = { ...emptyLayerProgress, ...(workspace.progress[layer.id] ?? {}) };
            return (
              <div id={layer.id} key={layer.id} className="scroll-mt-24">
                <LayerCard
                  definition={definition}
                  layer={layer}
                  controls={workspace.controls}
                  progress={layerProgress}
                  assets={assets}
                  expanded={expandedIds.includes(layer.id)}
                  copiedKey={copiedKey}
                  onToggle={() => setExpandedIds((current) => current.includes(layer.id) ? current.filter((id) => id !== layer.id) : [...current, layer.id])}
                  onProgress={(patch) => updateProgress(layer.id, patch)}
                  onCopy={copyValue}
                  onRegister={registerAsset}
                />
              </div>
            );
          })}
          {!visibleLayers.length ? (
            <div className="rounded border border-dashed border-cyan-400/20 py-16 text-center text-slate-500">
              <FileImage className="mx-auto h-8 w-8" />
              <p className="mt-3 text-sm">No canonical layers match this search.</p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
