"use client";

import { useState } from "react";
import { ProductionCopyButton } from "@/components/production/copy-button";
import { ProductionSection } from "@/components/production/production-components";
import { WorkspaceBadge } from "@/components/ui/workspace";
import { formatAssetSpecification, formatRenderOutputLine, formatSection, type AssetSpecification, type CopyFormat } from "@/lib/production";

const formats: CopyFormat[] = ["plain", "markdown", "json"];

function formatLabel(format: CopyFormat) {
  if (format === "plain") return "Plain Text";
  if (format === "markdown") return "Markdown";
  return "JSON";
}

export function AssetSpecificationDetail({ spec }: { spec: AssetSpecification }) {
  const [format, setFormat] = useState<CopyFormat>("plain");
  const sourceLines = spec.sourceFiles;
  const surfaceLines = spec.surfaceMaps.length
    ? spec.surfaceMaps.map((item) => `${item.name} — ${item.resolution.replace("x", "×")} — ${item.format} — ${item.required ? "Required" : "Optional"}`)
    : ["Pending"];
  const renderLines = spec.renderOutputs.map(formatRenderOutputLine);
  const metadataLines = spec.metadata;

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Asset Specification</p>
            <h1 className="mt-3 text-4xl font-black text-white">{spec.title}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{spec.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2 text-sm font-bold text-slate-200">
              <span className="sr-only">Copy format</span>
              <select value={format} onChange={(event) => setFormat(event.target.value as CopyFormat)} className="bg-transparent outline-none">
                {formats.map((item) => <option key={item} value={item} className="bg-slate-950">{formatLabel(item)}</option>)}
              </select>
            </label>
            <ProductionCopyButton label={`Copy as ${formatLabel(format)}`} copiedLabel="Copied" getText={() => formatAssetSpecification(spec, format)} />
          </div>
        </div>
      </section>

      <ProductionSection title="Source Files" action={<ProductionCopyButton getText={() => formatSection("Source Files", sourceLines, format)} />}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sourceLines.map((item) => <div key={item} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-bold text-slate-100">{item}</div>)}
        </div>
      </ProductionSection>

      <ProductionSection title="Surface Maps" action={<ProductionCopyButton getText={() => formatSection("Surface Maps", surfaceLines, format)} />}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {spec.surfaceMaps.length ? spec.surfaceMaps.map((item) => (
            <div key={item.name} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-black text-white">{item.name}</h2>
                <WorkspaceBadge value={item.required ? "Required" : "Optional"} className="text-[0.55rem]" />
              </div>
              <p className="mt-2 text-sm font-bold text-cyan-100">{item.resolution.replace("x", "×")} / {item.format}</p>
            </div>
          )) : <p className="text-sm text-slate-400">Surface map rules pending.</p>}
        </div>
      </ProductionSection>

      <ProductionSection title="Render Outputs" action={<ProductionCopyButton getText={() => formatSection("Render Outputs", renderLines, format)} />}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {spec.renderOutputs.map((item) => (
            <div key={item.name} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <h2 className="font-black text-white">{item.name}</h2>
              <p className="mt-2 text-sm font-bold text-cyan-100">{item.resolution.replace("x", "×")} / {item.format}</p>
            </div>
          ))}
        </div>
      </ProductionSection>

      <ProductionSection title="Metadata" action={<ProductionCopyButton getText={() => formatSection("Metadata", metadataLines, format)} />}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metadataLines.map((item) => <div key={item} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm font-bold text-slate-100">{item}</div>)}
        </div>
      </ProductionSection>
    </div>
  );
}
