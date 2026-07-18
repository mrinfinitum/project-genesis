"use client";

import { useState } from "react";
import { ProductionCopyButton } from "@/components/production/copy-button";
import { ProductionSection } from "@/components/production/production-components";
import { WorkspaceBadge, WorkspaceMiniStat } from "@/components/ui/workspace";
import { formatRenderContract, planetRenderContractFields, planetRendererDetail } from "@/lib/render";
import type { CopyFormat } from "@/lib/production";

const formats: CopyFormat[] = ["plain", "markdown", "json"];

function formatLabel(format: CopyFormat) {
  if (format === "plain") return "Plain Text";
  if (format === "markdown") return "Markdown";
  return "JSON";
}

export function PlanetRendererDetail() {
  const [format, setFormat] = useState<CopyFormat>("plain");
  return (
    <main className="space-y-6">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Renderer Template</p>
            <h1 className="mt-3 text-4xl font-black text-white">Planet Renderer</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">Canonical documentation contract for future planet rendering. This page does not call Blender, Python, subprocesses, or render engines.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="rounded-md border border-cyan-300/15 bg-slate-950/50 px-3 py-2 text-sm font-bold text-slate-200">
              <span className="sr-only">Copy format</span>
              <select value={format} onChange={(event) => setFormat(event.target.value as CopyFormat)} className="bg-transparent outline-none">
                {formats.map((item) => <option key={item} value={item} className="bg-slate-950">{formatLabel(item)}</option>)}
              </select>
            </label>
            <ProductionCopyButton label={`Copy ${formatLabel(format)}`} getText={() => formatRenderContract(format)} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMiniStat label="Renderer Version" value={planetRendererDetail.rendererVersion} />
        <WorkspaceMiniStat label="Master Blend File" value={planetRendererDetail.masterBlendFile} />
        <WorkspaceMiniStat label="Supported Outputs" value={planetRendererDetail.supportedOutputs.length} />
        <WorkspaceMiniStat label="Contract Fields" value={planetRenderContractFields.length} />
      </section>

      <ProductionSection title="Supported Outputs">
        <div className="flex flex-wrap gap-2">
          {planetRendererDetail.supportedOutputs.map((item) => <WorkspaceBadge key={item} value={item} />)}
        </div>
      </ProductionSection>

      <ProductionSection title="Supported Parameters">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {planetRenderContractFields.map((field) => (
            <div key={field.path} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="font-mono text-sm font-black text-cyan-100">{field.path}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{field.type}</p>
              <p className="mt-2 text-sm leading-5 text-slate-300">{field.description}</p>
            </div>
          ))}
        </div>
      </ProductionSection>

      <ProductionSection title="Supported Maps">
        <div className="flex flex-wrap gap-2">
          {planetRendererDetail.supportedMaps.map((item) => <WorkspaceBadge key={item} value={item} />)}
        </div>
      </ProductionSection>

      <ProductionSection title="Supported Runtime Assets">
        <div className="flex flex-wrap gap-2">
          {planetRendererDetail.supportedRuntimeAssets.map((item) => <WorkspaceBadge key={item} value={item} />)}
        </div>
      </ProductionSection>

      <ProductionSection title="Future Blender Integration">
        <p className="text-sm leading-6 text-slate-300">{planetRendererDetail.futureBlenderIntegration}</p>
      </ProductionSection>
    </main>
  );
}
