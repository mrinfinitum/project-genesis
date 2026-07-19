"use client";

import { CheckCircle2, Download, FileJson, Layers3, ShieldCheck } from "lucide-react";
import { ProductionCopyButton } from "@/components/production/copy-button";
import {
  blenderFieldMappings,
  canonicalSurfaceShaderContract,
  formatJson,
  getModuleContract,
  relatedRenderSystems,
  surfaceShaderModules
} from "@/lib/render-engine/canonical-render-engine";
import { validateSurfaceProfile } from "@/lib/render-engine/render-validation";

function Badge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "green" | "amber" | "slate" }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
      : tone === "amber"
        ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
        : tone === "slate"
          ? "border-slate-500/30 bg-slate-950/50 text-slate-300"
          : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  return <span className={`rounded-md border px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] ${toneClass}`}>{children}</span>;
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-white"><Layers3 className="h-5 w-5 text-cyan-200" /> {title}</h2>
          {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{description}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const staticProfileGroups = [
  {
    title: "Surface Profiles",
    status: "Ready",
    items: [canonicalSurfaceShaderContract.profileName],
    note: "Canonical planet surface shader profile exported for Blender."
  },
  {
    title: "Cloud Profiles",
    status: "Contract Summary",
    items: ["Clouds"],
    note: "Related render system is preserved as a contract summary; no fake cloud authoring UI is exposed."
  },
  {
    title: "Atmosphere Profiles",
    status: "Contract Summary",
    items: ["Atmosphere Glow", "Atmosphere Volume"],
    note: "Atmosphere systems remain technical definitions until Blender-side implementation is connected."
  },
  {
    title: "Lighting Profiles",
    status: "Definition",
    items: ["Lighting"],
    note: "Studio defines integration intent; Blender performs lighting execution."
  },
  {
    title: "Camera Profiles",
    status: "Definition",
    items: ["Camera"],
    note: "Studio stores canonical camera contract fields and mappings only."
  },
  {
    title: "Output Profiles",
    status: "Definition",
    items: ["Output"],
    note: "Export targets are contract definitions, not render jobs."
  }
];

export function PlanetRenderEngineWorkspace() {
  const validation = validateSurfaceProfile(canonicalSurfaceShaderContract);

  return (
    <main className="space-y-5">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Renderer Definition</p>
            <h1 className="mt-3 text-4xl font-black text-white">Render Engine</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">Canonical renderer definitions and Blender integration.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={validation.status === "Ready" ? "green" : "amber"}>{validation.status}</Badge>
            <Badge tone="slate">Blender 5.2 LTS</Badge>
            <Badge tone="slate">External Execution Only</Badge>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Schema", canonicalSurfaceShaderContract.schemaVersion],
            ["Profile", canonicalSurfaceShaderContract.profileId],
            ["Modules", String(surfaceShaderModules.length)],
            ["Blender Mappings", String(blenderFieldMappings.length)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
              <p className="mt-2 truncate text-sm font-black text-white" title={value}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      <Panel title="Render Profiles" description="Technical profile groups available to Studio and future Blender tooling. This page does not author planets or launch renders.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {staticProfileGroups.map((group) => (
            <article key={group.title} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-black text-white">{group.title}</h3>
                <Badge tone={group.status === "Ready" ? "green" : "slate"}>{group.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => <Badge key={item}>{item}</Badge>)}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{group.note}</p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Surface Profile Modules" description="The canonical surface profile remains intact. These are renderer contract modules, not creative planet controls.">
        <div className="grid gap-3">
          {surfaceShaderModules.map((module, index) => (
            <article key={module.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <div className="grid gap-3 lg:grid-cols-[3rem_1fr_auto]">
                <div className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-100">{index + 1}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-white">{module.title}</h3>
                    <Badge tone="green">{module.status}</Badge>
                    <Badge tone="slate">{module.parameters.length} fields</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{module.responsibility}</p>
                  <p className="mt-2 text-sm font-bold text-cyan-100">{module.blenderNodes.join(" / ")}</p>
                </div>
                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  <ProductionCopyButton label="Copy Module JSON" text={formatJson(getModuleContract(canonicalSurfaceShaderContract, module.id))} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Related Render Systems" description="Read-only render-system summaries. No placeholder production workflows or fake render queues are shown.">
        <div className="grid gap-3 md:grid-cols-3">
          {relatedRenderSystems.map((system) => (
            <article key={system.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black text-white">{system.label}</h3>
                <Badge tone="slate">{system.status}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{system.note}</p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Validation">
        <div className="flex flex-wrap items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-200" />
          <Badge tone={validation.status === "Ready" ? "green" : "amber"}>{validation.status}</Badge>
          <Badge tone="slate">Render contracts preserved</Badge>
          <Badge tone="slate">External Blender execution only</Badge>
        </div>
        <div className="mt-4 space-y-2">
          {validation.issues.length ? validation.issues.map((row) => (
            <p key={`${row.moduleId}-${row.field}-${row.message}`} className="rounded-md border border-amber-300/15 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">{row.moduleId} / {row.field}: {row.message}</p>
          )) : <p className="rounded-md border border-emerald-300/15 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">Canonical renderer contract validates successfully.</p>}
        </div>
      </Panel>

      <Panel title="Blender Mappings" description="Studio fields mapped to Blender object, material, node, and socket names.">
        <div className="overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/45">
          <table className="w-full min-w-[56rem] border-separate border-spacing-0 text-left text-sm">
            <thead className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">
              <tr><th className="p-3">Studio Field</th><th className="p-3">Blender Object</th><th className="p-3">Material</th><th className="p-3">Node</th><th className="p-3">Socket / Property</th></tr>
            </thead>
            <tbody>
              {blenderFieldMappings.map((row) => (
                <tr key={`${row.studioField}-${row.blenderNode}`} className="text-slate-200">
                  <td className="border-t border-cyan-300/10 p-3 font-black text-cyan-100">{row.studioField}</td>
                  <td className="border-t border-cyan-300/10 p-3">{row.blenderObject}</td>
                  <td className="border-t border-cyan-300/10 p-3">{row.blenderMaterial}</td>
                  <td className="border-t border-cyan-300/10 p-3">{row.blenderNode}</td>
                  <td className="border-t border-cyan-300/10 p-3">{row.blenderSocket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Render Contracts and Exports" description="Sanitized contract exports for Studio consumers and future NOVERIS Toolkit integration.">
        <div className="grid gap-3 md:grid-cols-3">
          <ProductionCopyButton label="Copy Surface Contract" text={formatJson(canonicalSurfaceShaderContract)} />
          <button type="button" onClick={() => downloadJson(`${canonicalSurfaceShaderContract.profileId}.json`, formatJson(canonicalSurfaceShaderContract))} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15"><Download className="h-4 w-4" /> Download Contract JSON</button>
          <a href="/api/export/render-surface-profiles.json" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-500/35 bg-slate-950/45 px-4 py-2 text-sm font-black text-slate-200 transition hover:border-cyan-200/60 hover:text-cyan-100"><FileJson className="h-4 w-4" /> Open Export Endpoint</a>
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-400"><ShieldCheck className="h-4 w-4 text-cyan-200" /> Studio defines generation rules, render profiles, canonical defaults, validation, and exports. Blender generates planets and renders images.</p>
      </Panel>
    </main>
  );
}
