"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  Clock3,
  Copy,
  FileCheck2,
  History,
  ImageOff,
  PackageCheck,
  Play,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  WandSparkles
} from "lucide-react";
import type { AssetProductionState } from "@/lib/assets/asset-production";
import {
  buildProviderDispatchPacket,
  buildRenderHubCatalog,
  buildRuntimePublicationCheck,
  compileRenderPrompt,
  renderHubPromptTemplates,
  renderHubProviders,
  type CompiledRenderPrompt,
  type RenderHubCanonicalRecord,
  type RenderHubProvider
} from "@/lib/render-hub";
import { cn } from "@/lib/utils";
import {
  CanonicalIndex,
  WorkspaceBadge,
  WorkspaceHeader,
  WorkspaceMiniStat,
  WorkspacePanel,
  WorkspaceSearchBar,
  WorkspaceTabs
} from "@/components/ui/workspace";

type RenderHubSection =
  | "dashboard"
  | "compiler"
  | "providers"
  | "queue"
  | "completed"
  | "history"
  | "templates"
  | "settings"
  | "validation"
  | "publishing";

const sections: RenderHubSection[] = ["dashboard", "compiler", "providers", "queue", "completed", "history", "templates", "settings", "validation", "publishing"];

const sectionLabels: Record<RenderHubSection, string> = {
  dashboard: "Dashboard",
  compiler: "Prompt Compiler",
  providers: "Render Providers",
  queue: "Prompt Queue",
  completed: "Completed Renders",
  history: "Prompt History",
  templates: "Prompt Templates",
  settings: "Provider Settings",
  validation: "Validation",
  publishing: "Publishing"
};

function Preview({ record, className }: { record: RenderHubCanonicalRecord; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!record.previewUrl || failed) {
    return <div className={cn("flex aspect-video items-center justify-center rounded-md border border-cyan-300/10 bg-slate-950/55 text-slate-600", className)}><ImageOff className="h-7 w-7" /></div>;
  }
  return <img src={record.previewUrl} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn("aspect-video w-full rounded-md border border-cyan-300/10 bg-slate-950/55 object-cover", className)} />;
}

function ProviderCapabilities({ provider, compact = false }: { provider: RenderHubProvider; compact?: boolean }) {
  const capabilities = [
    provider.supportsReferenceImages && "References",
    provider.supportsNegativePrompt && "Negative prompt",
    provider.supportsBatch && "Batch",
    provider.supportsSeed && "Seed",
    provider.supportsImageEditing && "Image editing",
    provider.supportsUpscaling && "Upscale",
    provider.supportsVariations && "Variations",
    provider.supportsTransparent && "Transparent"
  ].filter(Boolean) as string[];
  return <div className="flex flex-wrap gap-1.5">{capabilities.slice(0, compact ? 4 : undefined).map((capability) => <span key={capability} className="rounded border border-cyan-300/15 bg-cyan-400/[0.06] px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-cyan-100">{capability}</span>)}</div>;
}

function CopyAction({ label, value, onCopy }: { label: string; value: string; onCopy: (label: string, value: string) => void }) {
  return <button type="button" onClick={() => onCopy(label, value)} className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-300/20 bg-slate-950/45 px-3 text-xs font-bold text-slate-200 transition hover:border-cyan-300/50 hover:bg-cyan-400/10"><Copy className="h-3.5 w-3.5 text-cyan-200" />{label}</button>;
}

function PromptField({ title, value, className }: { title: string; value: string; className?: string }) {
  return <div className={cn("rounded-md border border-cyan-300/10 bg-slate-950/45 p-3", className)}><p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">{title}</p><pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-200">{value}</pre></div>;
}

function RecordSelector({ records, activeId, onSelect }: { records: RenderHubCanonicalRecord[]; activeId: string | null; onSelect: (recordId: string) => void }) {
  return <div className="max-h-[29rem] overflow-y-auto rounded-md border border-cyan-300/10 bg-slate-950/25 p-2">{records.map((record) => <button key={record.id} type="button" onClick={() => onSelect(record.id)} className={cn("flex w-full items-center gap-3 rounded-md p-2 text-left transition", activeId === record.id ? "bg-cyan-400/15 text-white" : "text-slate-300 hover:bg-cyan-400/[0.06]")}><div className="w-20 shrink-0"><Preview record={record} className="aspect-[16/9]" /></div><div className="min-w-0"><p className="truncate text-sm font-bold">{record.displayName}</p><p className="mt-1 truncate text-xs text-slate-500">{record.assetType} · {record.assetCategory}</p></div></button>)}</div>;
}

function RenderHubDashboard({ state, onOpenCompiler }: { state: AssetProductionState; onOpenCompiler: () => void }) {
  const catalog = useMemo(() => buildRenderHubCatalog(state.assets), [state.assets]);
  const queueCount = catalog.queue.filter((item) => item.status === "queued").length;
  const rendering = catalog.queue.filter((item) => item.status === "rendering").length;
  const completed = catalog.queue.filter((item) => item.status === "completed").length;
  const awaitingReview = catalog.records.filter((record) => /awaiting_review|generated/i.test(record.productionStatus)).length;
  const groups = [
    ["Backgrounds", /background|environment|galaxy|region|system/i],
    ["Life", /creature|plant|fungus|species/i],
    ["Planets", /planet|moon|star/i],
    ["Interface", /hud|icon|card|screen/i]
  ].map(([label, expression]) => ({ label: label as string, value: catalog.records.filter((record) => (expression as RegExp).test(`${record.assetType} ${record.assetCategory}`)).length }));
  return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><WorkspaceMiniStat label="Prompt Ready" value={catalog.prompts.filter((prompt) => prompt.validation.every((issue) => issue.severity !== "error")).length} /><WorkspaceMiniStat label="In Queue" value={queueCount} /><WorkspaceMiniStat label="Rendering" value={rendering} /><WorkspaceMiniStat label="Awaiting Review" value={awaitingReview} /></div><CanonicalIndex title="Render Coverage" description="Every prompt is compiled from a canonical record, the NOVERIS Design Language, a template, an output profile, and a provider profile." items={groups} /><div className="grid gap-5 xl:grid-cols-[1fr_20rem]"><WorkspacePanel title="Production Readiness" icon={Sparkles}><div className="grid gap-3 sm:grid-cols-3"><WorkspaceMiniStat label="Completed Renders" value={completed} /><WorkspaceMiniStat label="Approved Assets" value={catalog.records.filter((record) => record.approvalStatus === "approved").length} /><WorkspaceMiniStat label="Published Runtime Assets" value={buildRuntimePublicationCheck(catalog).length} /></div><p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">Studio owns prompts, versioning, provider profiles, review state, and publication history. The renderer receives a provider-ready packet; Unity receives approved asset metadata only.</p></WorkspacePanel><WorkspacePanel title="Next Action" icon={WandSparkles}><p className="text-sm leading-6 text-slate-300">Compile a selected canonical asset into a provider-ready request, then copy its payload into the renderer of choice.</p><button type="button" onClick={onOpenCompiler} className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/35 bg-cyan-400/10 px-3 text-sm font-bold text-cyan-50 hover:bg-cyan-400/20"><Play className="h-4 w-4" />Open Prompt Compiler</button></WorkspacePanel></div></div>;
}

export function RenderHubWorkspace({ state }: { state: AssetProductionState }) {
  const [section, setSection] = useState<RenderHubSection>("dashboard");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [providerId, setProviderId] = useState("nano-banana-2");
  const [outputType, setOutputType] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);
  const catalog = useMemo(() => buildRenderHubCatalog(state.assets), [state.assets]);
  const records = useMemo(() => catalog.records.filter((record) => `${record.displayName} ${record.assetType} ${record.assetCategory} ${record.id}`.toLowerCase().includes(query.trim().toLowerCase())), [catalog.records, query]);
  const selected = records.find((record) => record.id === selectedId) || catalog.records.find((record) => record.id === selectedId) || records[0] || catalog.records[0] || null;
  const compiled = useMemo(() => selected ? compileRenderPrompt(selected, { providerId, outputType: outputType || undefined }) : null, [selected, providerId, outputType]);
  const provider = renderHubProviders.find((item) => item.id === (compiled?.providerId || providerId)) || renderHubProviders[0];
  const template = selected ? renderHubPromptTemplates.find((item) => item.assetType.toLowerCase() === selected.assetType.toLowerCase()) || renderHubPromptTemplates[0] : renderHubPromptTemplates[0];
  const completedRecords = records.filter((record) => /approved|published|generated/i.test(record.productionStatus));
  const copy = async (label: string, value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
  };
  const selectRecord = (recordId: string) => {
    setSelectedId(recordId);
    setOutputType("");
  };
  const openCompiler = () => setSection("compiler");

  return <main className="space-y-5"><WorkspaceHeader eyebrow="Creative Production" title="Render Hub" description="Canonical prompt compilation and provider-neutral render management. Studio compiles requests, preserves history and approvals, and publishes approved assets without exposing prompt data to Unity." stats={[{ label: "Canonical Assets", value: catalog.records.length }, { label: "Providers", value: catalog.providers.length }, { label: "Prompt Templates", value: catalog.templates.length }, { label: "Validation", value: catalog.validation.some((issue) => issue.severity === "error") ? "Review" : "Ready" }]} /><WorkspaceTabs tabs={sections} active={section} onChange={setSection} labels={sectionLabels} />
    {section === "dashboard" ? <RenderHubDashboard state={state} onOpenCompiler={openCompiler} /> : null}
    {section === "compiler" ? <div className="grid gap-5 xl:grid-cols-[19rem_1fr]"><WorkspacePanel title="Canonical Assets" icon={Clipboard}><WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Find an asset to compile" className="mb-3" /><RecordSelector records={records} activeId={selected?.id || null} onSelect={selectRecord} /></WorkspacePanel>{selected && compiled && provider ? <WorkspacePanel title="Prompt Compiler" icon={WandSparkles}><div className="grid gap-3 lg:grid-cols-3"><WorkspaceMiniStat label="Canonical Record" value={selected.displayName} /><WorkspaceMiniStat label="Prompt Hash" value={compiled.promptHash} /><WorkspaceMiniStat label="Estimated Length" value={`${compiled.estimatedLength} chars`} /></div><div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Provider<select value={providerId} onChange={(event) => setProviderId(event.target.value)} className="mt-2 block h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/65 px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none"><option value="">Use canonical default</option>{renderHubProviders.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}</select></label><label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Output Type<select value={outputType} onChange={(event) => setOutputType(event.target.value)} className="mt-2 block h-10 w-full rounded-md border border-cyan-300/15 bg-slate-950/65 px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none"><option value="">{template.outputTypes[0]}</option>{template.outputTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div><div className="mt-4 flex flex-wrap gap-2"><CopyAction label="Copy Positive" value={compiled.positivePrompt} onCopy={copy} /><CopyAction label="Copy Negative" value={compiled.negativePrompt} onCopy={copy} /><CopyAction label="Copy Combined" value={compiled.combinedPrompt} onCopy={copy} /><CopyAction label="Copy Visual Summary" value={compiled.visualSummary} onCopy={copy} /><CopyAction label="Copy Metadata" value={JSON.stringify(compiled.metadata, null, 2)} onCopy={copy} /><CopyAction label="Copy Provider Packet" value={JSON.stringify(buildProviderDispatchPacket(compiled), null, 2)} onCopy={copy} />{copied ? <span className="inline-flex h-9 items-center gap-2 px-2 text-xs font-bold text-emerald-200"><CheckCircle2 className="h-4 w-4" />{copied} copied</span> : null}</div><div className="mt-4 grid gap-3"><PromptField title="Visual Summary" value={compiled.visualSummary} /><PromptField title="Positive Prompt" value={compiled.positivePrompt} /><PromptField title="Negative Prompt" value={compiled.negativePrompt} /><PromptField title="Combined Prompt" value={compiled.combinedPrompt} /><PromptField title="Metadata" value={JSON.stringify(compiled.metadata, null, 2)} /></div><div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/35 p-3"><p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Provider Compatibility</p><p className="mt-2 text-sm font-bold text-white">{provider.displayName} · {provider.promptFormat.replaceAll("_", " ")}</p><p className="mt-1 text-sm leading-6 text-slate-400">{provider.providerNotes}</p><div className="mt-3"><ProviderCapabilities provider={provider} /></div></div>{compiled.validation.length ? <div className="mt-4 space-y-2">{compiled.validation.map((issue) => <p key={`${issue.code}-${issue.message}`} className={cn("rounded-md border px-3 py-2 text-sm", issue.severity === "error" ? "border-rose-300/25 bg-rose-400/[0.07] text-rose-100" : "border-amber-300/20 bg-amber-400/[0.06] text-amber-100")}>{issue.message}</p>)}</div> : <p className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-400/[0.06] px-3 py-2 text-sm font-semibold text-emerald-100">Ready to dispatch through the selected provider.</p>}</WorkspacePanel> : <WorkspacePanel title="Prompt Compiler"><p className="text-sm text-slate-400">No canonical assets are available to compile yet.</p></WorkspacePanel>}</div> : null}
    {section === "providers" || section === "settings" ? <div className="grid gap-4 xl:grid-cols-2">{renderHubProviders.map((item) => <WorkspacePanel key={item.id} title={item.displayName} icon={Settings2}><div className="flex items-center justify-between gap-3"><WorkspaceBadge value={item.status} /><span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{item.promptFormat.replaceAll("_", " ")}</span></div><p className="mt-3 text-sm leading-6 text-slate-400">{item.providerNotes}</p><div className="mt-4"><ProviderCapabilities provider={item} /></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><WorkspaceMiniStat label="Prompt Limit" value={`${item.promptLimits.maximumCharacters} chars`} /><WorkspaceMiniStat label="Models" value={item.supportedModels.join(", ") || "Adapter pending"} /></div><div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/40 p-3"><p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Prompt Syntax</p><p className="mt-2 text-sm leading-6 text-slate-300">{item.promptSyntax}</p><p className="mt-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Recommended Settings</p><ul className="mt-2 space-y-1 text-sm text-slate-400">{item.recommendedSettings.map((setting) => <li key={setting}>• {setting}</li>)}</ul></div></WorkspacePanel>)}</div> : null}
    {section === "queue" ? <WorkspacePanel title="Prompt Queue" icon={Clock3}><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500"><tr>{["Status", "Asset", "Provider", "Prompt", "Generated Asset", "Updated", "Actions"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead><tbody>{catalog.queue.filter((item) => records.some((record) => record.id === item.canonicalRecordId)).map((item) => { const record = catalog.records.find((candidate) => candidate.id === item.canonicalRecordId)!; return <tr key={item.id} className="border-t border-cyan-300/10 text-slate-300"><td className="px-3 py-3"><WorkspaceBadge value={item.status} className="text-[0.55rem]" /></td><td className="px-3 py-3 font-bold text-white">{record.displayName}</td><td className="px-3 py-3">{renderHubProviders.find((providerItem) => providerItem.id === item.providerId)?.displayName || item.providerId}</td><td className="px-3 py-3 font-mono text-xs text-cyan-100">{catalog.prompts.find((prompt) => prompt.id === item.promptId)?.promptHash}</td><td className="px-3 py-3">{item.generatedAssetId || "Pending"}</td><td className="px-3 py-3 text-slate-500">{item.updatedAt.slice(0, 10)}</td><td className="px-3 py-3"><button type="button" onClick={() => { selectRecord(record.id); openCompiler(); }} className="text-xs font-bold text-cyan-100 hover:text-white">Open compiler</button></td></tr>; })}</tbody></table></div></WorkspacePanel> : null}
    {section === "completed" ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{completedRecords.map((record) => <button key={record.id} type="button" onClick={() => { selectRecord(record.id); openCompiler(); }} className="overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/45 text-left transition hover:border-cyan-300/45"><Preview record={record} /><div className="p-3"><div className="flex items-start justify-between gap-2"><p className="truncate font-bold text-white">{record.displayName}</p><WorkspaceBadge value={record.approvalStatus} className="shrink-0 text-[0.55rem]" /></div><p className="mt-1 truncate text-xs text-slate-500">{record.assetType} · {record.productionStatus}</p></div></button>)}</div> : null}
    {section === "history" ? <WorkspacePanel title="Prompt History" icon={History}><div className="space-y-2">{catalog.records.flatMap((record) => record.history.map((event) => ({ ...event, record }))).sort((left, right) => right.timestamp.localeCompare(left.timestamp)).map((event) => <div key={event.id} className="flex flex-col gap-2 rounded-md border border-cyan-300/10 bg-slate-950/35 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-white">{event.record.displayName}</p><p className="mt-1 text-sm text-slate-400">{event.note}</p></div><div className="shrink-0 text-right"><WorkspaceBadge value={event.eventType} className="text-[0.55rem]" /><p className="mt-2 text-xs text-slate-500">{event.timestamp.slice(0, 10)}</p></div></div>)}{!catalog.records.some((record) => record.history.length) ? <p className="text-sm text-slate-400">Asset history will appear here as source, render, approval, and publication events are recorded.</p> : null}</div></WorkspacePanel> : null}
    {section === "templates" ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{renderHubPromptTemplates.map((item) => <WorkspacePanel key={item.id} title={item.assetType} icon={FileCheck2}><p className="text-sm leading-6 text-slate-300">{item.positiveDirection}</p><p className="mt-4 text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Outputs</p><div className="mt-2 flex flex-wrap gap-1.5">{item.outputTypes.map((output) => <span key={output} className="rounded border border-cyan-300/15 px-2 py-1 text-xs text-cyan-100">{output}</span>)}</div><p className="mt-4 text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Built-in exclusions</p><p className="mt-2 text-sm leading-6 text-slate-400">{item.negativeRules.join(", ")}</p></WorkspacePanel>)}</div> : null}
    {section === "validation" ? <WorkspacePanel title="Render Hub Validation" icon={ShieldCheck}>{catalog.validation.length ? <div className="space-y-2">{catalog.validation.map((issue, index) => <div key={`${issue.code}-${index}`} className={cn("rounded-md border p-3", issue.severity === "error" ? "border-rose-300/25 bg-rose-400/[0.07]" : "border-amber-300/20 bg-amber-400/[0.06]")}><p className="font-bold text-white">{issue.code.replaceAll("_", " ")}</p><p className="mt-1 text-sm text-slate-300">{issue.message}</p></div>)}</div> : <div className="rounded-md border border-emerald-300/25 bg-emerald-400/[0.06] p-4 text-emerald-100"><div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" />All compiled prompts are ready for provider review.</div><p className="mt-2 text-sm leading-6 text-emerald-100/80">Prompts contain visual language only and do not expose raw records, implementation instructions, source paths, or runtime publication data.</p></div>}</WorkspacePanel> : null}
    {section === "publishing" ? <WorkspacePanel title="Runtime Publishing" icon={PackageCheck}><div className="grid gap-3 sm:grid-cols-3"><WorkspaceMiniStat label="Approved Assets" value={catalog.records.filter((record) => record.approvalStatus === "approved").length} /><WorkspaceMiniStat label="Published Assets" value={catalog.records.filter((record) => /published/i.test(record.productionStatus)).length} /><WorkspaceMiniStat label="Runtime Manifest Entries" value={buildRuntimePublicationCheck(catalog).length} /></div><div className="mt-4 rounded-md border border-cyan-300/10 bg-slate-950/35 p-4"><p className="font-bold text-white">Unity publication boundary</p><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Runtime publishing provides approved asset IDs, runtime keys, previews, thumbnails, checksums, and versions. Prompt content, provider profiles, source-master paths, and production notes remain Studio-only.</p></div></WorkspacePanel> : null}
  </main>;
}
