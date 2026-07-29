"use client";

import { useMemo, useState } from "react";
import {
  Boxes,
  Download,
  FileImage,
  Grid3X3,
  Monitor,
  PackageOpen,
  Ruler,
  Settings2,
  ShieldAlert
} from "lucide-react";
import type { CivilizationOperationsDeckContract } from "@/lib/assets/civilization-operations-deck";
import type { auditCivilizationOperationsSources } from "@/lib/assets/civilization-operations-deck-server";
import { cn } from "@/lib/utils";

type SourceAudit = Awaited<ReturnType<typeof auditCivilizationOperationsSources>>;
type TabId = "source" | "settings" | "slices" | "preview" | "package";
type PreviewProfile = "desktop_16_10" | "desktop_16_9" | "tablet_landscape";
type ToggleKey = "bounds" | "ids" | "dimensions" | "live" | "artwork" | "missing";

const tabs: Array<{ id: TabId; label: string; icon: typeof FileImage }> = [
  { id: "source", label: "PSD Source", icon: FileImage },
  { id: "settings", label: "Export Settings", icon: Settings2 },
  { id: "slices", label: "Asset Slices", icon: Grid3X3 },
  { id: "preview", label: "Runtime Preview", icon: Monitor },
  { id: "package", label: "Export Package", icon: PackageOpen }
];

function SourcePanel({ audit }: { audit: SourceAudit }) {
  return (
    <section className="space-y-4">
      <div className="rounded-md border border-cyan-900/70 bg-slate-950/55 px-4 py-3">
        <div className="text-xs font-bold uppercase text-cyan-200">Canonical private source</div>
        <div className="mt-1 font-mono text-sm text-slate-200">{audit.sourceRootLabel}</div>
        <p className="mt-2 text-sm text-slate-400">
          PSD and PSB masters remain private. Runtime manifests expose production status and package-relative PNG targets only.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {audit.sources.map((source) => (
          <article key={source.id} className="rounded-md border border-slate-800 bg-slate-950/65 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-white">{source.displayName}</h3>
                <p className="mt-1 truncate font-mono text-xs text-cyan-200">{source.sourceDirectory}/</p>
              </div>
              <span className={cn(
                "shrink-0 rounded border px-2 py-1 text-[10px] font-bold uppercase",
                source.sourceFiles.length ? "border-amber-700 text-amber-200" : "border-red-900 text-red-200"
              )}>
                {source.sourceFiles.length ? "Mapping pending" : "Source pending"}
              </span>
            </div>
            <div className="mt-4 rounded border border-dashed border-red-500/55 bg-red-500/10 px-3 py-5 text-center">
              <FileImage className="mx-auto h-6 w-6 text-red-300" />
              <p className="mt-2 text-xs font-bold uppercase text-red-200">
                {source.sourceFiles.length ? `${source.sourceFiles.length} master${source.sourceFiles.length === 1 ? "" : "s"} found` : "Source Master Pending"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPanel({ contract }: { contract: CivilizationOperationsDeckContract }) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-md border border-slate-800 bg-slate-950/65 p-4">
        <div className="flex items-center gap-2"><Ruler className="h-5 w-5 text-cyan-200" /><h3 className="font-bold text-white">Canonical Geometry</h3></div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["Logical", contract.logicalResolution.join(" × ")],
            ["Master", contract.masterResolution.join(" × ")],
            ["Scale", `${contract.logicalToMasterScale}×`],
            ["16:9 Safe", `${contract.criticalSafeRegion.masterBounds.width} × ${contract.criticalSafeRegion.masterBounds.height}`],
            ["Root logical", `${contract.bounds.x}, ${contract.bounds.y} · ${contract.bounds.width} × ${contract.bounds.height}`],
            ["Root master", `${contract.masterBounds.x}, ${contract.masterBounds.y} · ${contract.masterBounds.width} × ${contract.masterBounds.height}`]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-slate-800 p-3"><dt className="text-xs font-bold uppercase text-slate-500">{label}</dt><dd className="mt-1 font-mono text-sm text-white">{value}</dd></div>
          ))}
        </dl>
      </article>
      <article className="rounded-md border border-slate-800 bg-slate-950/65 p-4">
        <div className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-cyan-200" /><h3 className="font-bold text-white">Production Profile</h3></div>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Profile</dt><dd className="font-mono text-slate-100">{contract.exportProfile.id}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Transparent</dt><dd className="text-slate-100">Yes</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Atlas</dt><dd className="text-slate-100">{contract.exportProfile.spriteAtlas.id}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Desktop</dt><dd className="text-slate-100">{contract.exportProfile.compressionProfile.desktop}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Tablet</dt><dd className="text-slate-100">{contract.exportProfile.compressionProfile.tablet}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-400">Nine Slice</dt><dd className="text-slate-100">{contract.assets.filter((asset) => asset.nineSlice.enabled).length} assets</dd></div>
        </dl>
      </article>
      <article className="rounded-md border border-amber-900/70 bg-amber-950/15 p-4 xl:col-span-2">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <h3 className="font-bold text-amber-100">Audited geometry adjustment</h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-100/75">
              {contract.geometryAudit.deviations.map((deviation) => <li key={deviation}>• {deviation}</li>)}
            </ul>
          </div>
        </div>
      </article>
    </section>
  );
}

function SlicesPanel({ audit }: { audit: SourceAudit }) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-xs uppercase text-slate-500">
            <tr><th className="p-3">Asset</th><th className="p-3">Source slot</th><th className="p-3">Master size</th><th className="p-3">Sprite</th><th className="p-3">Runtime target</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {audit.assets.map((asset) => (
              <tr key={asset.id} className="border-t border-slate-800 bg-slate-950/45">
                <td className="p-3"><div className="font-semibold text-white">{asset.displayName}</div><div className="mt-1 font-mono text-xs text-cyan-200">{asset.semanticKey}</div></td>
                <td className="p-3 font-mono text-xs text-slate-300">{asset.sourceSlotId}</td>
                <td className="p-3 text-slate-300">{asset.expectedMasterSize.join(" × ")}</td>
                <td className="p-3 text-slate-300">{asset.spriteType}{asset.nineSlice.enabled ? " · nine-slice" : ""}</td>
                <td className="p-3 font-mono text-xs text-slate-400">{asset.runtimePath}</td>
                <td className="p-3"><span className="rounded border border-red-900 bg-red-950/20 px-2 py-1 text-[10px] font-bold uppercase text-red-200">{asset.studioStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PreviewPanel({ contract }: { contract: CivilizationOperationsDeckContract }) {
  const [profile, setProfile] = useState<PreviewProfile>("desktop_16_10");
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    bounds: true,
    ids: true,
    dimensions: true,
    live: true,
    artwork: true,
    missing: false
  });
  const view = profile === "desktop_16_9" ? "0 60 1920 1080" : profile === "tablet_landscape" ? "0 0 1366 1024" : "0 0 1920 1200";
  const isTablet = profile === "tablet_landscape";
  const tabletRegions = [
    { ...contract.children[0], logicalBounds: { x: 40, y: 250, width: 1286, height: 260 } },
    { ...contract.children[1], logicalBounds: { x: 40, y: 530, width: 620, height: 210 } },
    { ...contract.children[2], logicalBounds: { x: 680, y: 530, width: 646, height: 210 } },
    { ...contract.children[3], logicalBounds: { x: 40, y: 760, width: 1286, height: 150 } }
  ];
  const regions = isTablet ? tabletRegions : contract.children;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["desktop_16_10", "desktop_16_9", "tablet_landscape"] as PreviewProfile[]).map((id) => (
          <button key={id} type="button" onClick={() => setProfile(id)} className={cn("rounded-md border px-3 py-2 text-xs font-bold", profile === id ? "border-cyan-400 bg-cyan-400/15 text-cyan-100" : "border-slate-800 text-slate-400 hover:text-white")}>
            {id.replaceAll("_", " ")}
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-slate-800" />
        {(Object.keys(toggles) as ToggleKey[]).map((key) => (
          <label key={key} className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-800 px-2.5 py-2 text-xs font-semibold text-slate-300">
            <input type="checkbox" checked={toggles[key]} onChange={(event) => setToggles((current) => ({ ...current, [key]: event.target.checked }))} />
            {key === "missing" ? "Show Missing Only" : `Show ${key.slice(0, 1).toUpperCase()}${key.slice(1)}`}
          </label>
        ))}
      </div>
      <div className="overflow-hidden rounded-md border border-slate-800 bg-[#030711] p-3">
        <svg viewBox={view} className={cn("block w-full", profile === "desktop_16_10" ? "aspect-[16/10]" : profile === "desktop_16_9" ? "aspect-video" : "aspect-[4/3]")} role="img" aria-label={`${profile} Operations Deck geometry preview`}>
          <rect width={isTablet ? 1366 : 1920} height={isTablet ? 1024 : 1200} fill="#030711" />
          {!isTablet && <rect x="0" y="60" width="1920" height="1080" fill="none" stroke="#64748b" strokeDasharray="10 8" strokeWidth="2" />}
          <rect x="0" y="0" width={isTablet ? 1366 : 1920} height={isTablet ? 88 : 110} fill="#0b1726" stroke="#1e3a4b" />
          <text x={isTablet ? 28 : 30} y={isTablet ? 52 : 65} fill="#94a3b8" fontSize={isTablet ? 20 : 24} fontWeight="700">EXISTING TOP HUD · PRESERVED</text>
          {!isTablet && <rect x="27" y="138" width="180" height="834" rx="8" fill="#07111f" stroke="#1e3a4b" />}
          {!isTablet && <text x="55" y="178" fill="#64748b" fontSize="18" fontWeight="700">LEFT NAV</text>}
          {!isTablet && <rect x="232" y="130" width="1622" height="650" rx="8" fill="#07101b" stroke="#1e3a4b" />}
          {!isTablet && <text x="270" y="180" fill="#64748b" fontSize="22" fontWeight="700">EXISTING CIVILIZATION COMMAND REGIONS · PRESERVED</text>}
          {regions.map((region) => {
            const bounds = region.logicalBounds;
            return (
              <g key={region.regionId}>
                {toggles.artwork && (
                  <rect
                    x={bounds.x}
                    y={bounds.y}
                    width={bounds.width}
                    height={bounds.height}
                    rx="8"
                    fill="rgba(255,42,42,0.10)"
                    stroke="#FF2A2A"
                    strokeWidth="3"
                  />
                )}
                {toggles.ids && <text x={bounds.x + 16} y={bounds.y + 31} fill="#fecaca" fontSize={isTablet ? 16 : 14} fontWeight="800">{region.regionId}</text>}
                {toggles.dimensions && <text x={bounds.x + 16} y={bounds.y + 54} fill="#fca5a5" fontSize={isTablet ? 14 : 12}>{bounds.width} × {bounds.height} logical</text>}
                {toggles.live && !isTablet && region.internalRegions.map((internal) => (
                  <rect
                    key={internal.id}
                    x={bounds.x + internal.bounds.x}
                    y={bounds.y + internal.bounds.y}
                    width={internal.bounds.width}
                    height={internal.bounds.height}
                    fill="rgba(34,211,238,0.05)"
                    stroke={internal.role === "critical-action" ? "#facc15" : "#22d3ee"}
                    strokeDasharray="6 5"
                  />
                ))}
              </g>
            );
          })}
          {toggles.bounds && !isTablet && <rect x={contract.bounds.x} y={contract.bounds.y} width={contract.bounds.width} height={contract.bounds.height} fill="none" stroke="#e2e8f0" strokeWidth="2" />}
        </svg>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span><i className="mr-2 inline-block h-2.5 w-2.5 border border-red-500 bg-red-500/10" />Pending artwork</span>
        <span><i className="mr-2 inline-block h-2.5 w-2.5 border border-cyan-400 bg-cyan-400/10" />Live Unity content</span>
        <span><i className="mr-2 inline-block h-2.5 w-2.5 border border-yellow-400 bg-yellow-400/10" />Critical action</span>
      </div>
    </section>
  );
}

function PackagePanel({ contract, audit }: { contract: CivilizationOperationsDeckContract; audit: SourceAudit }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
      <article className="rounded-md border border-slate-800 bg-slate-950/65 p-4">
        <PackageOpen className="h-6 w-6 text-cyan-200" />
        <h3 className="mt-3 text-lg font-bold text-white">{contract.assetPack.filename}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">The package descriptor includes the sanitized manifest, sprite index, atlas definition, expected paths, and unresolved production statuses.</p>
        <a href="/api/creative-production/civilization-operations/artpack" download className="mt-5 inline-flex items-center gap-2 rounded-md border border-cyan-700 bg-cyan-950/40 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-900/40">
          <Download className="h-4 w-4" />Download artpack descriptor
        </a>
      </article>
      <article className="rounded-md border border-slate-800 bg-slate-950/65 p-4">
        <h3 className="font-bold text-white">Package readiness</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded border border-slate-800 p-3"><dt className="text-xs uppercase text-slate-500">Assets</dt><dd className="mt-1 text-2xl font-black text-white">{contract.assets.length}</dd></div>
          <div className="rounded border border-slate-800 p-3"><dt className="text-xs uppercase text-slate-500">Ready</dt><dd className="mt-1 text-2xl font-black text-emerald-300">{audit.summary.readyAssets}</dd></div>
          <div className="rounded border border-red-900/70 p-3"><dt className="text-xs uppercase text-red-300">Pending</dt><dd className="mt-1 text-2xl font-black text-red-200">{audit.summary.pendingAssets}</dd></div>
        </dl>
        <div className="mt-4 break-all rounded border border-slate-800 bg-black/20 p-3 font-mono text-xs text-slate-400">SHA-256 {contract.hash}</div>
      </article>
    </section>
  );
}

export function CivilizationOperationsWorkspace({ contract, audit }: { contract: CivilizationOperationsDeckContract; audit: SourceAudit }) {
  const [tab, setTab] = useState<TabId>("preview");
  const selectedPanel = useMemo(() => {
    if (tab === "source") return <SourcePanel audit={audit} />;
    if (tab === "settings") return <SettingsPanel contract={contract} />;
    if (tab === "slices") return <SlicesPanel audit={audit} />;
    if (tab === "preview") return <PreviewPanel contract={contract} />;
    return <PackagePanel contract={contract} audit={audit} />;
  }, [audit, contract, tab]);

  return (
    <div className="space-y-5">
      <header className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Creative Production · UI Screens</p>
            <h1 className="mt-2 text-3xl font-black text-white">Civilization Operations Deck</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Canonical lower-dashboard geometry, live-content schemas, pending source artwork, and engine-neutral export contracts.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded border border-emerald-800 px-2.5 py-1 text-xs font-bold uppercase text-emerald-200">Contract Ready</span>
            <span className="rounded border border-red-900 px-2.5 py-1 text-xs font-bold uppercase text-red-200">{audit.summary.pendingAssets} art pending</span>
          </div>
        </div>
      </header>
      <nav className="flex gap-1 overflow-x-auto rounded-md border border-slate-800 bg-slate-950/65 p-1" aria-label="Operations Deck workspace sections">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn("inline-flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm font-bold", tab === item.id ? "bg-cyan-400/15 text-cyan-100" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
              <Icon className="h-4 w-4" />{item.label}
            </button>
          );
        })}
      </nav>
      {selectedPanel}
      <footer className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950/45 px-4 py-3 text-xs text-slate-500">
        <Boxes className="h-4 w-4 text-cyan-300" />
        Studio defines presentation; Unity owns live queues, progress, recommendations, activity history, forecasts, interaction, and scrolling.
      </footer>
    </div>
  );
}
