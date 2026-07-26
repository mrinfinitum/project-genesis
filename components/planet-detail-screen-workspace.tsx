"use client";

import { useState } from "react";
import {
  Boxes,
  CheckCircle2,
  Download,
  FileArchive,
  FileImage,
  Gauge,
  Grid3X3,
  Layers3,
  Monitor,
  PackageOpen,
  Settings2,
  ShieldAlert
} from "lucide-react";
import type {
  PlanetDetailSliceAudit,
  PlanetDetailSourceAudit
} from "@/lib/assets/planet-detail-screen-server";
import type { PlanetDetailScreenRuntimeContract } from "@/lib/assets/planet-detail-screen";
import { cn } from "@/lib/utils";

type TabId = "source" | "settings" | "slices" | "preview" | "package";

type Props = {
  contract: PlanetDetailScreenRuntimeContract;
  audit: {
    sourceRootLabel: string;
    sources: PlanetDetailSourceAudit[];
    slices: PlanetDetailSliceAudit[];
    summary: {
      sourceCount: number;
      sourceFilesPresent: number;
      sliceCount: number;
      mappedSlices: number;
      pendingSlices: number;
    };
  };
};

const tabs: Array<{ id: TabId; label: string; icon: typeof FileImage }> = [
  { id: "source", label: "PSD Source", icon: FileImage },
  { id: "settings", label: "Export Settings", icon: Settings2 },
  { id: "slices", label: "Asset Slices", icon: Grid3X3 },
  { id: "preview", label: "Runtime Preview", icon: Monitor },
  { id: "package", label: "Export Package", icon: PackageOpen }
];

function bytes(value: number | null) {
  if (value === null) return "Unavailable";
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function SourcePanel({ audit }: Pick<Props, "audit">) {
  return (
    <section className="space-y-4">
      <div className="rounded-md border border-cyan-900/70 bg-slate-950/55 px-4 py-3">
        <div className="text-xs font-bold uppercase text-cyan-200">Canonical Source</div>
        <div className="mt-1 font-mono text-sm text-slate-200">{audit.sourceRootLabel}</div>
        <p className="mt-2 text-sm text-slate-400">
          Master PSDs remain private and in place. Studio audits them directly; public runtime exports contain no PSD filenames or local paths.
        </p>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {audit.sources.map((source) => (
          <article key={source.id} className="rounded-md border border-slate-800 bg-slate-950/65 p-4">
            <div className="mb-4 aspect-video overflow-hidden rounded border border-slate-800 bg-slate-950">
              {source.previewPath ? (
                <img
                  src={source.previewPath}
                  alt={`${source.displayName} game derivative preview`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold uppercase text-slate-600">Preview Pending</div>
              )}
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-white">{source.displayName}</h3>
                <p className="mt-1 truncate font-mono text-xs text-cyan-200">{source.filename}</p>
              </div>
              <span className={cn(
                "shrink-0 rounded border px-2 py-1 text-[11px] font-bold uppercase",
                source.exists ? "border-emerald-800 text-emerald-200" : "border-red-900 text-red-200"
              )}>
                {source.derivativeStatus === "Published" ? "Game Ready" : source.exists ? "Present" : "Missing"}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              <div><dt className="text-xs uppercase text-slate-500">Dimensions</dt><dd className="mt-1 text-slate-200">{source.width && source.height ? `${source.width} × ${source.height}` : "—"}</dd></div>
              <div><dt className="text-xs uppercase text-slate-500">Size</dt><dd className="mt-1 text-slate-200">{bytes(source.bytes)}</dd></div>
              <div><dt className="text-xs uppercase text-slate-500">Layers</dt><dd className="mt-1 text-slate-200">{source.layerNames.length}</dd></div>
            </dl>
            {source.gamePngPath && (
              <a
                className="mt-3 inline-flex text-xs font-bold text-cyan-200 hover:text-white"
                href={source.gamePngPath}
                download
              >
                Download native PNG
              </a>
            )}
            <div className="mt-3 truncate font-mono text-[11px] text-slate-500" title={source.checksum ?? undefined}>
              SHA-256 {source.checksum ?? "Unavailable"}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPanel({ contract }: Pick<Props, "contract">) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      <article className="rounded-md border border-slate-800 bg-slate-950/65 p-4">
        <div className="flex items-center gap-2 text-cyan-200"><Monitor size={18} /><h3 className="font-bold text-white">Resolution Profiles</h3></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {contract.exportProfile.resolutions.map((resolution) => (
            <div key={resolution.id} className="rounded-md border border-slate-800 p-3">
              <div className="text-xs font-bold uppercase text-slate-500">{resolution.id}</div>
              <div className="mt-1 text-lg font-bold text-white">{resolution.width} × {resolution.height}</div>
            </div>
          ))}
        </div>
      </article>
      <article className="rounded-md border border-slate-800 bg-slate-950/65 p-4">
        <div className="flex items-center gap-2"><Gauge size={18} className="text-cyan-200" /><h3 className="font-bold text-white">Sprite Production</h3></div>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Profile</dt><dd className="font-mono text-slate-100">{contract.exportProfile.id}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Nine Slice</dt><dd className="text-slate-100">Enabled</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Pixels Per Unit</dt><dd className="text-slate-100">{contract.exportProfile.pixelsPerUnit}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Desktop</dt><dd className="text-slate-100">{contract.exportProfile.textureCompression.desktop}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Mobile</dt><dd className="text-slate-100">{contract.exportProfile.textureCompression.mobile}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Atlas Size</dt><dd className="text-slate-100">{contract.exportProfile.spriteAtlas.maxTextureSize}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Safe Margins</dt><dd className="text-slate-100">{contract.exportProfile.safeMargins.join(" / ")}</dd></div>
        </dl>
      </article>
    </section>
  );
}

function SlicesPanel({ audit }: Pick<Props, "audit">) {
  return (
    <section>
      <div className="mb-4 flex items-start gap-3 rounded-md border border-amber-900/70 bg-amber-950/20 p-4">
        <ShieldAlert className="mt-0.5 shrink-0 text-amber-300" size={19} />
        <div>
          <h3 className="font-bold text-amber-100">PSD layer mapping required</h3>
          <p className="mt-1 text-sm text-amber-100/70">
            The masters use generic flattened layer names. Export regions are canonical, but Studio will not claim a slice is ready until its named PSD group exists.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-800">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-xs uppercase text-slate-500">
            <tr><th className="p-3">Slice</th><th className="p-3">Source PSD</th><th className="p-3">Layer Group</th><th className="p-3">Sprite</th><th className="p-3">Pivot</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {audit.slices.map((slice) => (
              <tr key={slice.id} className="border-t border-slate-800 bg-slate-950/45">
                <td className="p-3"><div className="font-semibold text-white">{slice.displayName}</div><div className="mt-1 font-mono text-[11px] text-cyan-300">{slice.semanticKey}</div></td>
                <td className="p-3 text-slate-300">{slice.sourceFilename ?? "Assignment required"}</td>
                <td className="p-3 font-mono text-xs text-slate-300">{slice.psdLayerGroup}</td>
                <td className="p-3 text-slate-300">{slice.spriteType}{slice.nineSlice.enabled ? " / 9-slice" : ""}</td>
                <td className="p-3 font-mono text-xs text-slate-300">{slice.pivot.join(", ")}</td>
                <td className="p-3"><span className={cn("rounded border px-2 py-1 text-[10px] font-bold uppercase", slice.layerMapped ? "border-emerald-800 text-emerald-200" : "border-amber-900 text-amber-200")}>{slice.sourceStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RuntimePreview({ contract }: Pick<Props, "contract">) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <div className="aspect-[3/2] rounded-md border border-cyan-900/80 bg-slate-950 p-4">
        <div className="grid h-full grid-cols-[18%_1fr] gap-3">
          <div className="rounded border border-cyan-900/70 bg-cyan-950/15 p-2 text-[10px] uppercase text-cyan-200">Left Navigation</div>
          <div className="grid min-w-0 grid-rows-[10%_34%_1fr] gap-3">
            <div className="rounded border border-slate-700 p-2 text-[10px] uppercase text-slate-400">Breadcrumb</div>
            <div className="grid grid-cols-[1.4fr_1fr] gap-3">
              <div className="rounded border border-cyan-800/70 bg-cyan-950/20 p-2 text-[10px] uppercase text-cyan-200">Planet Hero</div>
              <div className="rounded border border-slate-700 p-2 text-[10px] uppercase text-slate-400">Overview</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Resources", "Biome", "Weather", "Creatures", "Atmosphere", "Composition"].map((label) => (
                <div key={label} className="rounded border border-slate-800 p-2 text-[10px] uppercase text-slate-400">{label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <article className="rounded-md border border-slate-800 bg-slate-950/65 p-4">
        <div className="flex items-center gap-2"><Layers3 size={18} className="text-cyan-200" /><h3 className="font-bold text-white">Runtime Contract</h3></div>
        <dl className="mt-4 space-y-3 text-sm">
          <div><dt className="text-xs uppercase text-slate-500">Screen</dt><dd className="mt-1 text-slate-100">{contract.screen}</dd></div>
          <div><dt className="text-xs uppercase text-slate-500">Asset Pack</dt><dd className="mt-1 text-slate-100">{contract.assetPack.id}</dd></div>
          <div><dt className="text-xs uppercase text-slate-500">Manifest</dt><dd className="mt-1 break-all font-mono text-xs text-slate-300">{contract.assetPack.manifestPath}</dd></div>
          <div><dt className="text-xs uppercase text-slate-500">Atlas</dt><dd className="mt-1 break-all font-mono text-xs text-slate-300">{contract.exportProfile.spriteAtlas.manifestPath}</dd></div>
          <div><dt className="text-xs uppercase text-slate-500">Theme</dt><dd className="mt-1 text-slate-100">{contract.theme}</dd></div>
          <div><dt className="text-xs uppercase text-slate-500">Hash</dt><dd className="mt-1 break-all font-mono text-[11px] text-slate-400">{contract.hash}</dd></div>
        </dl>
      </article>
    </section>
  );
}

function PackagePanel({ contract, audit }: Props) {
  const ready = audit.summary.pendingSlices === 0;
  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <article className="rounded-md border border-slate-800 bg-slate-950/65 p-5">
        <div className="flex items-center gap-3"><FileArchive className="text-cyan-200" /><div><h3 className="text-lg font-bold text-white">{contract.assetPack.filename}</h3><p className="text-sm text-slate-400">Canonical package descriptor and manifest</p></div></div>
        <div className="mt-5 grid gap-2 text-sm text-slate-300">
          {["PlanetDetailScreen.manifest.json", "metadata.json", "atlas/PlanetDetailScreen.spriteatlas.json", "sprites/index.json"].map((file) => (
            <div key={file} className="flex items-center gap-2 rounded border border-slate-800 px-3 py-2"><Boxes size={15} className="text-cyan-300" /><span className="font-mono text-xs">{file}</span></div>
          ))}
        </div>
        <a href="/api/creative-production/planet-detail-screen/artpack" download className="mt-5 inline-flex items-center gap-2 rounded-md border border-cyan-700 bg-cyan-950/40 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-400">
          <Download size={17} /> Download Artpack Descriptor
        </a>
      </article>
      <article className="rounded-md border border-slate-800 bg-slate-950/65 p-5">
        <div className="flex items-center gap-2">
          {ready ? <CheckCircle2 className="text-emerald-300" /> : <ShieldAlert className="text-amber-300" />}
          <h3 className="font-bold text-white">{ready ? "Production Ready" : "Source Mapping Pending"}</h3>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The descriptor is safe to publish now. Production sprite files remain intentionally absent until the named PSD layer groups are authored or mapped.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded border border-slate-800 p-3"><dt className="text-xs uppercase text-slate-500">Mapped</dt><dd className="mt-1 text-xl font-bold text-white">{audit.summary.mappedSlices}</dd></div>
          <div className="rounded border border-slate-800 p-3"><dt className="text-xs uppercase text-slate-500">Pending</dt><dd className="mt-1 text-xl font-bold text-white">{audit.summary.pendingSlices}</dd></div>
        </dl>
      </article>
    </section>
  );
}

export function PlanetDetailScreenWorkspace({ contract, audit }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("source");
  return (
    <div className="space-y-5">
      <header className="rounded-md border border-slate-800 bg-slate-950/60 p-5">
        <div className="text-xs font-bold uppercase text-cyan-300">Creative Production / UI Screens</div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-white">Planet Detail Screen</h1><p className="mt-2 text-sm text-slate-400">Canonical PSD source management, sprite contracts, and Unity-targeted package metadata.</p></div>
          <div className="flex gap-2">
            <span className="rounded border border-slate-700 px-2 py-1 text-xs font-bold text-slate-300">v{contract.version}</span>
            <span className="rounded border border-amber-900 px-2 py-1 text-xs font-bold text-amber-200">{audit.summary.pendingSlices} mappings pending</span>
          </div>
        </div>
      </header>

      <nav className="flex overflow-x-auto rounded-md border border-slate-800 bg-slate-950/70 p-1" aria-label="Planet Detail Screen workflow">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cn("inline-flex shrink-0 items-center gap-2 rounded px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400", activeTab === tab.id ? "bg-cyan-950 text-cyan-100" : "text-slate-400 hover:text-white")}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === "source" && <SourcePanel audit={audit} />}
      {activeTab === "settings" && <SettingsPanel contract={contract} />}
      {activeTab === "slices" && <SlicesPanel audit={audit} />}
      {activeTab === "preview" && <RuntimePreview contract={contract} />}
      {activeTab === "package" && <PackagePanel contract={contract} audit={audit} />}
    </div>
  );
}
