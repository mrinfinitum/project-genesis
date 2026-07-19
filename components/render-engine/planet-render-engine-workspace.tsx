"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileJson, Layers3, Lock, Send } from "lucide-react";
import { ProductionCopyButton } from "@/components/production/copy-button";
import {
  cameraProfiles,
  canonicalPlanetRenderContract,
  cloudProfile,
  compositorProfile,
  formatJson,
  layerProfiles,
  lightingRig,
  noverisPlanetRenderEngine,
  planetRenderLayers,
  renderOutputs,
  surfaceProfileRock,
  worldProfile
} from "@/lib/render-engine/canonical-render-engine";
import { validatePlanetRenderContract } from "@/lib/render-engine/render-validation";
import type { PlanetRenderContract, RenderProfile } from "@/types/render-engine";

function Badge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "green" | "amber" | "slate" }) {
  const toneClass = tone === "green" ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : tone === "amber" ? "border-amber-300/25 bg-amber-300/10 text-amber-100" : tone === "slate" ? "border-slate-500/30 bg-slate-950/50 text-slate-300" : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  return <span className={`rounded-md border px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] ${toneClass}`}>{children}</span>;
}

function Panel({ id, title, children, action }: { id: string; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section id={id} className="rounded-md border border-cyan-300/15 bg-[#07101e]/84 p-4 shadow-glow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-black text-white"><Layers3 className="h-5 w-5 text-cyan-200" /> {title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function copyProfile(profile: RenderProfile) {
  return formatJson(profile);
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

function ProfilePanel({ profile }: { profile: RenderProfile }) {
  return (
    <details className="rounded-md border border-cyan-300/15 bg-slate-950/45 p-4" open={profile.id === "Surface_Profile_Rock_v001" || profile.id === "Cloud_Profile_v001"}>
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-cyan-200">{profile.category}</p>
            <h3 className="mt-1 text-xl font-black text-white">{profile.id}</h3>
            <p className="mt-1 text-sm text-slate-400">{profile.objectName} / scale {profile.objectScale.toFixed(3)}</p>
          </div>
          <Badge tone={profile.status === "Canonical" ? "green" : profile.status === "Pending Validation" ? "amber" : "cyan"}>{profile.status}</Badge>
        </div>
      </summary>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-md border border-cyan-300/10 bg-[#07101e]/70 p-3">
          <p className="font-black text-white">Supported Engines</p>
          <p className="mt-1 text-sm text-slate-300">{profile.supportedEngines.join(", ")}</p>
          <p className="mt-3 font-black text-white">Editable Parameters</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.editableParameters.map((param) => <Badge key={param} tone="slate">{param}</Badge>)}
          </div>
        </div>
        <div className="rounded-md border border-cyan-300/10 bg-[#07101e]/70 p-3">
          <p className="font-black text-white">Node Flow</p>
          {profile.nodeFlow ? <ul className="mt-2 space-y-1 text-sm text-slate-300">{profile.nodeFlow.map((flow) => <li key={flow}>{flow}</li>)}</ul> : <p className="mt-2 text-sm font-bold text-amber-100">Final Blender 5.2 node implementation remains under validation. Canonical parameters are approved, but the final node graph must not be labeled Ready until validated in Blender.</p>}
        </div>
      </div>
      {"materialValues" in profile ? <pre className="mt-4 overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/70 p-3 text-xs leading-5 text-slate-200">{formatJson(profile.materialValues)}</pre> : null}
      {"approvedParameters" in profile ? <pre className="mt-4 overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/70 p-3 text-xs leading-5 text-slate-200">{formatJson(profile.approvedParameters)}</pre> : null}
      {"approvedValues" in profile ? <pre className="mt-4 overflow-auto rounded-md border border-cyan-300/10 bg-slate-950/70 p-3 text-xs leading-5 text-slate-200">{formatJson(profile.approvedValues)}</pre> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <ProductionCopyButton label="Copy Profile" text={copyProfile(profile)} />
      </div>
    </details>
  );
}

export function PlanetRenderEngineWorkspace() {
  const [contract, setContract] = useState<PlanetRenderContract>(canonicalPlanetRenderContract);
  const [jsonDraft, setJsonDraft] = useState(formatJson(canonicalPlanetRenderContract));
  const [dirty, setDirty] = useState(false);
  const validation = useMemo(() => validatePlanetRenderContract(contract), [contract]);

  function updatePlanetId(value: string) {
    const next = { ...contract, planetId: value, metadata: { ...contract.metadata, lastUpdatedAt: new Date().toISOString() } };
    setContract(next);
    setJsonDraft(formatJson(next));
    setDirty(true);
  }

  function updateJson(value: string) {
    setJsonDraft(value);
    setDirty(true);
    try {
      const parsed = JSON.parse(value) as PlanetRenderContract;
      setContract(parsed);
    } catch {
      // The validation panel reports malformed JSON through the dirty editor state.
    }
  }

  function resetContract() {
    setContract(canonicalPlanetRenderContract);
    setJsonDraft(formatJson(canonicalPlanetRenderContract));
    setDirty(false);
  }

  return (
    <main className="space-y-5">
      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/88 p-5 shadow-glow">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Render Engine</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">NOVERIS Planet Render Engine</h1>
            <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-300">Canonical rendering architecture for procedural planets, moons, atmospheres, clouds, lighting, cameras, outputs, and future automated production. Project Genesis Studio owns the renderer definitions and publishes implementation-ready contracts for Blender and other supported engines.</p>
          </div>
          <div className="flex max-w-xl flex-wrap gap-2">{noverisPlanetRenderEngine.badges.map((badge) => <Badge key={badge} tone={badge === "Canonical" ? "green" : "cyan"}>{badge}</Badge>)}</div>
        </div>
      </section>

      <Panel id="summary" title="Engine Status Summary">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Renderer", noverisPlanetRenderEngine.renderer],
            ["Blender Version", noverisPlanetRenderEngine.blenderVersion],
            ["Primary Engine", noverisPlanetRenderEngine.primaryEngine],
            ["Compatible Engine", noverisPlanetRenderEngine.compatibleEngine],
            ["Asset Type", noverisPlanetRenderEngine.assetType],
            ["Template ID", noverisPlanetRenderEngine.templateId],
            ["Execution", noverisPlanetRenderEngine.execution],
            ["Studio Responsibility", noverisPlanetRenderEngine.studioResponsibility],
            ["Blender Responsibility", noverisPlanetRenderEngine.blenderResponsibility]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="layers" title="Planet Layer Architecture">
        <div className="grid gap-3">
          {planetRenderLayers.map((layer) => (
            <article key={layer.id} className="grid gap-3 rounded-md border border-cyan-300/15 bg-slate-950/45 p-4 lg:grid-cols-[4rem_1fr_auto]">
              <div className="grid h-12 w-12 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-lg font-black text-cyan-100">{layer.order}</div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-white">{layer.layerName}</h3>
                  <Badge tone={layer.required ? "green" : "slate"}>{layer.required ? "Required" : "Optional"}</Badge>
                  <Badge tone={layer.validationStatus === "Pending Validation" ? "amber" : "cyan"}>{layer.validationStatus}</Badge>
                </div>
                <p className="mt-1 text-sm text-cyan-100">{layer.objectName} / {layer.materialProfile} / scale {layer.scale.toFixed(3)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{layer.purpose}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{layer.supportedRenderer}</p>
              </div>
              <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                <a href="#layer-profiles" className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-black text-cyan-100">Open Profile</a>
                <ProductionCopyButton label="Copy Contract" text={formatJson(layer)} />
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel id="layer-profiles" title="Layer Profiles">
        <div className="space-y-3">{layerProfiles.map((profile) => <ProfilePanel key={profile.id} profile={profile} />)}</div>
      </Panel>

      <Panel id="lighting" title="Lighting Rig" action={<ProductionCopyButton label="Copy Lighting Contract" text={formatJson(lightingRig)} />}>
        <h3 className="text-lg font-black text-white">{lightingRig.title}</h3>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {lightingRig.lights.map((light) => (
            <article key={light.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="text-lg font-black text-white">{light.name}</p><p className="text-sm text-cyan-100">{light.type}</p></div>
                <Badge tone={light.required ? "green" : "slate"}>{light.required ? "Required" : "Optional"}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-300">{light.purpose}</p>
              <div className="mt-3 flex flex-wrap gap-2">{light.fields.map((field) => <Badge key={field.key} tone="slate">{field.key}: {field.value}</Badge>)}</div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel id="cameras" title="Camera Profiles" action={<ProductionCopyButton label="Copy Camera Contract" text={formatJson(cameraProfiles)} />}>
        <div className="grid gap-3 lg:grid-cols-5">
          {cameraProfiles.map((camera) => (
            <article key={camera.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex items-start justify-between gap-2"><h3 className="font-black text-white">{camera.name}</h3><Badge tone={camera.status === "Draft" ? "slate" : "cyan"}>{camera.status}</Badge></div>
              <p className="mt-2 text-sm text-cyan-100">{camera.objectName}</p>
              <p className="mt-1 text-sm text-slate-300">Lens {camera.lens}</p>
              <p className="mt-1 text-sm text-slate-400">Location X {camera.location.x} / Y {camera.location.y} / Z {camera.location.z}</p>
              <p className="mt-2 text-xs text-slate-500">{camera.targetFraming}</p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel id="world" title="World and Background">
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-black text-white">{worldProfile.id}</h3><Badge tone="slate">{worldProfile.status}</Badge></div>
          <p className="mt-3 text-sm text-slate-300">No placeholder URLs or fake assets are attached. Editable fields define future Blender/environment settings only.</p>
          <div className="mt-3 flex flex-wrap gap-2">{worldProfile.editableFields.map((field) => <Badge key={field} tone="slate">{field}</Badge>)}</div>
        </div>
      </Panel>

      <Panel id="compositor" title="Compositor">
        <p className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">{compositorProfile.note}</p>
        <div className="mt-3 grid gap-2 md:grid-cols-4">{compositorProfile.stages.map((stage) => <div key={stage.name} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"><p className="font-black text-white">{stage.name}</p><p className="mt-1 text-sm text-slate-400">{stage.enabled ? "Enabled" : "Disabled"}</p></div>)}</div>
      </Panel>

      <Panel id="outputs" title="Render Outputs" action={<ProductionCopyButton label="Copy Output Contract" text={formatJson(renderOutputs)} />}>
        <div className="grid gap-3 xl:grid-cols-3">
          {renderOutputs.map((output) => (
            <article key={output.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <div className="flex items-start justify-between gap-2"><h3 className="text-lg font-black text-white">{output.name}</h3><Badge tone={output.status === "Canonical" ? "green" : "slate"}>{output.status}</Badge></div>
              <p className="mt-2 text-sm text-slate-300">{output.description}</p>
              <p className="mt-3 text-sm font-black text-cyan-100">{output.width} x {output.height} / {output.format} / {output.colorMode} / {output.bitDepth}</p>
              <p className="mt-1 text-xs text-slate-500">{output.outputPathPattern}</p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel id="contract" title="Render Contract Editor">
        <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
          <div className="space-y-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={dirty ? "amber" : "green"}>{dirty ? "Dirty Draft" : "Canonical Defaults"}</Badge>
              <Badge>{contract.schemaVersion}</Badge>
              <Badge>{contract.renderer}/{contract.renderEngine}</Badge>
            </div>
            <label className="block text-sm font-black text-white">
              Planet ID
              <input value={contract.planetId} onChange={(event) => updatePlanetId(event.target.value)} placeholder="planet id" className="mt-2 h-10 w-full rounded-md border border-cyan-300/15 bg-[#07101e] px-3 text-sm text-white outline-none focus:border-cyan-200/60" />
            </label>
            <div className="grid gap-2">
              <button type="button" onClick={resetContract} className="rounded-md border border-slate-500/35 bg-slate-950/45 px-3 py-2 text-sm font-black text-slate-200">Reset to Canonical Defaults</button>
              <ProductionCopyButton label="Copy JSON" text={formatJson(contract)} />
              <button type="button" onClick={() => downloadJson("noveris-planet-render-contract.json", formatJson(contract))} className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-black text-cyan-100"><Download className="h-4 w-4" /> Download JSON</button>
            </div>
            <p className="text-xs font-semibold text-slate-500">Studio publishes parameters and contracts only. Studio does not directly modify Blender nodes.</p>
          </div>
          <textarea value={jsonDraft} onChange={(event) => updateJson(event.target.value)} spellCheck={false} className="min-h-[32rem] rounded-md border border-cyan-300/10 bg-slate-950/70 p-4 font-mono text-xs leading-5 text-slate-200 outline-none focus:border-cyan-200/60" aria-label="Live JSON render contract editor" />
        </div>
      </Panel>

      <Panel id="validation" title="Validation">
        <div className="flex flex-wrap items-center gap-3">
          {validation.status === "Valid" ? <CheckCircle2 className="h-6 w-6 text-emerald-200" /> : <AlertTriangle className="h-6 w-6 text-amber-200" />}
          <Badge tone={validation.status === "Valid" ? "green" : validation.status === "Invalid" ? "amber" : "cyan"}>{validation.status}</Badge>
          <Badge tone="slate">Actual render execution disabled</Badge>
        </div>
        <div className="mt-4 space-y-2">
          {validation.issues.length ? validation.issues.map((row) => <div key={`${row.target}-${row.message}`} className="rounded-md border border-amber-300/15 bg-amber-300/10 p-3 text-sm text-amber-100"><strong>{row.target}</strong>: {row.message}</div>) : <p className="rounded-md border border-emerald-300/15 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">Canonical rules validate. Pending Blender validation still remains for draft/pending profiles.</p>}
          <p className="rounded-md border border-amber-300/15 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">Profiles pending Blender validation must display a warning. The Atmosphere Glow final node graph is intentionally not declared Ready.</p>
        </div>
      </Panel>

      <Panel id="export" title="Export">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ProductionCopyButton label="Copy Full Render Contract" text={formatJson(contract)} />
          <button type="button" onClick={() => downloadJson("noveris-planet-render-contract.json", formatJson(contract))} className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-black text-cyan-100"><FileJson className="h-4 w-4" /> Download Full Render Contract JSON</button>
          <ProductionCopyButton label="Copy Surface Profile" text={formatJson(surfaceProfileRock)} />
          <ProductionCopyButton label="Copy Cloud Profile" text={formatJson(cloudProfile)} />
          <ProductionCopyButton label="Copy Atmosphere Glow Profile" text={formatJson(layerProfiles.find((profile) => profile.id === "Atmosphere_Glow_Profile_v001"))} />
          <ProductionCopyButton label="Copy Atmosphere Volume Profile" text={formatJson(layerProfiles.find((profile) => profile.id === "Atmosphere_Volume_Profile_v001"))} />
          <ProductionCopyButton label="Copy Lighting Contract" text={formatJson(lightingRig)} />
          <ProductionCopyButton label="Copy Camera Contract" text={formatJson(cameraProfiles)} />
          <ProductionCopyButton label="Copy Output Contract" text={formatJson(renderOutputs)} />
          <button type="button" disabled title="External renderer execution is not implemented. Export the canonical contract for use by a future Blender integration." className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-md border border-slate-600/30 bg-slate-950/40 px-3 py-2 text-sm font-black text-slate-500"><Send className="h-4 w-4" /> Send to Blender</button>
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-400"><Lock className="h-4 w-4 text-cyan-200" /> External renderer execution is not implemented. Export the canonical contract for future Blender integration.</p>
      </Panel>
    </main>
  );
}
