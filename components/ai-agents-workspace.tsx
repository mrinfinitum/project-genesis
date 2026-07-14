"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bot, Eye, Layers3, MessageSquareText, Palette, Search, Sparkles, UploadCloud } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { WorkspaceBadge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel, WorkspaceProgressBar, WorkspaceSearchBar, WorkspaceStatTile } from "@/components/ui/workspace";
import type { AiAgentArtworkSlot, AiAgentLibraryState, AiAgentRecord, AiAgentRarity, AiAgentState } from "@/lib/ai-agents";

const rarityOptions: Array<"All" | AiAgentRarity> = ["All", "Common", "Uncommon", "Rare", "Epic", "Legendary"];
const stateOptions: Array<"All" | AiAgentState> = ["All", "Idle", "Blink", "Thinking", "Working", "Research", "Offline", "Warning", "Celebration", "Sleeping", "Surprised"];

function SourceUploadForm({ slot }: { slot: AiAgentArtworkSlot }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <form
      className="mt-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        const form = new FormData(event.currentTarget);
        form.set("upload_kind", "source");
        form.set("source_table", "assets");
        form.set("source_id", slot.artKey);
        form.set("asset_id", `asset-${slot.artKey}`);
        form.set("asset_name", slot.label);
        try {
          const response = await fetch("/api/assets/upload", { method: "POST", body: form });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? "Upload failed.");
          setMessage("Source uploaded. Generate derivatives in Asset Production.");
          window.location.reload();
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Upload failed.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Upload Layered Source</span>
        <input name="file" type="file" accept=".png,.svg,.psd,.psb,.zip,image/png,image/svg+xml" className="rounded-md border border-cyan-300/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-300/15 file:px-3 file:py-1.5 file:text-cyan-100" />
      </label>
      <button type="submit" disabled={busy} className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? "Uploading..." : "Upload Source"}
      </button>
      {message ? <p className="mt-2 text-xs font-semibold text-slate-300">{message}</p> : null}
    </form>
  );
}

function AgentCard({ agent }: { agent: AiAgentLibraryState["agents"][number] }) {
  const artworkPercent = Math.round((agent.artworkReady / Math.max(1, agent.artworkTotal)) * 100);
  const expressionPercent = Math.round((agent.expressionReady / Math.max(1, agent.expressionTotal)) * 100);
  return (
    <article className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
      <AssetPreview preview={agent.primaryPreview} allowFullscreen={false} />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <WorkspaceBadge value={agent.rarity} />
            <WorkspaceBadge value={`${agent.supportedStates.length} states`} />
          </div>
          <h2 className="mt-3 text-2xl font-black text-white">{agent.displayName}</h2>
          <p className="mt-1 truncate font-mono text-xs text-cyan-200">{agent.id}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
          <Bot className="h-5 w-5 text-cyan-100" />
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{agent.description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <WorkspaceMiniStat label="Artwork" value={`${agent.artworkReady}/${agent.artworkTotal}`} />
        <WorkspaceMiniStat label="Expressions" value={`${agent.expressionReady}/${agent.expressionTotal}`} />
        <WorkspaceMiniStat label="Components" value={agent.componentLibraryReferences.join(", ")} />
        <WorkspaceMiniStat label="Unlocks" value={agent.unlockRequirements.join(", ")} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            <span>Artwork</span>
            <span>{artworkPercent}%</span>
          </div>
          <WorkspaceProgressBar value={artworkPercent} className="mt-2" />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            <span>Expressions</span>
            <span>{expressionPercent}%</span>
          </div>
          <WorkspaceProgressBar value={expressionPercent} className="mt-2" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {agent.supportedStates.map((state) => <WorkspaceBadge key={state} value={state} />)}
      </div>
      {agent.blockers.length ? <p className="mt-4 text-sm leading-6 text-amber-100">Needs: {agent.blockers.slice(0, 4).join("; ")}{agent.blockers.length > 4 ? "..." : ""}</p> : null}
    </article>
  );
}

function AgentDetail({ record }: { record: AiAgentRecord }) {
  return (
    <WorkspacePanel title={record.displayName} icon={Bot}>
      <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-300">{record.description}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <WorkspaceMiniStat label="Theme Primary" value={record.colorTheme.primary} />
            <WorkspaceMiniStat label="Theme Secondary" value={record.colorTheme.secondary} />
            <WorkspaceMiniStat label="Theme Accent" value={record.colorTheme.accent} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {record.artworkSlots.map((slot) => (
              <div key={slot.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{slot.label}</p>
                    <p className="mt-1 font-mono text-xs text-cyan-200">{slot.artKey}</p>
                  </div>
                  <WorkspaceBadge value={slot.status} />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <WorkspaceMiniStat label="Source" value={slot.acceptedSourceFormats.join(" / ")} />
                  <WorkspaceMiniStat label="Derivatives" value={slot.derivativePresetIds.length} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{slot.notes}</p>
                <SourceUploadForm slot={slot} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <WorkspacePanel title="Dialogue Profile" icon={MessageSquareText}>
            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <p><span className="font-bold text-white">Tone:</span> {record.dialogueProfile.tone}</p>
              <p>{record.dialogueProfile.greeting}</p>
              <p>{record.dialogueProfile.thinkingLine}</p>
              <p>{record.dialogueProfile.warningLine}</p>
              <p>{record.dialogueProfile.celebrationLine}</p>
            </div>
          </WorkspacePanel>
          <WorkspacePanel title="Expression Variants" icon={Eye}>
            <div className="space-y-2">
              {record.expressionVariants.map((variant) => (
                <div key={variant.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-white">{variant.label}</p>
                    <WorkspaceBadge value={variant.status} />
                  </div>
                  <p className="mt-1 font-mono text-xs text-cyan-200">{variant.artKey}</p>
                </div>
              ))}
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </WorkspacePanel>
  );
}

function VariantCard({ variant }: { variant: AiAgentLibraryState["variants"][number] }) {
  return (
    <article className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white">{variant.displayName}</p>
          <p className="mt-1 font-mono text-xs text-cyan-200">{variant.id}</p>
        </div>
        <WorkspaceBadge value={variant.publishState} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{variant.description}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMiniStat label="Agent" value={variant.agentId} />
        <WorkspaceMiniStat label="Unlock" value={variant.unlockText} />
        <WorkspaceMiniStat label="Web" value={variant.platformReadiness.web} />
        <WorkspaceMiniStat label="Roblox" value={variant.platformReadiness.roblox} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {Object.entries(variant.assetKeys).map(([slot, artKey]) => (
          <WorkspaceMiniStat key={slot} label={slot} value={artKey} />
        ))}
      </div>
    </article>
  );
}

export function AiAgentsWorkspace({ state }: { state: AiAgentLibraryState }) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<(typeof rarityOptions)[number]>("All");
  const [agentState, setAgentState] = useState<(typeof stateOptions)[number]>("All");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.agents.filter((agent) => {
      const text = [agent.id, agent.displayName, agent.description, agent.rarity, agent.unlockRequirements.join(" "), agent.supportedStates.join(" ")].join(" ").toLowerCase();
      return (!needle || text.includes(needle))
        && (rarity === "All" || agent.rarity === rarity)
        && (agentState === "All" || agent.supportedStates.includes(agentState));
    });
  }, [agentState, query, rarity, state.agents]);

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Creative / Canonical Characters"
        title="AI Agents"
        description="Canonical assistant-agent library for head artwork, eyes, idle and blink animation, expression variants, color themes, unlock rules, dialogue, and future voice profiles. Components consume agent IDs instead of fixed robot PNGs."
        stats={[
          { label: "Agents", value: state.stats.total },
          { label: "Published", value: state.stats.published },
          { label: "Variants", value: state.variants.length },
          { label: "Selectable", value: state.stats.selectableVariants },
          { label: "3-State Art", value: state.stats.completeThreeStateArtSets },
          { label: "Missing Art", value: state.stats.missingArtwork },
          { label: "Outputs / Slot", value: state.stats.derivativeOutputsPerSlot }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_28rem]">
        <WorkspacePanel title="Derivative Contract" icon={Layers3}>
          <div className="grid gap-3 sm:grid-cols-3">
            {state.derivativePresetIds.map((presetId) => (
              <WorkspaceMiniStat key={presetId} label={presetId.replace("ai_agent_", "").replace("_png", " px")} value="PNG" />
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">Layered PNG and PSD sources are private production inputs. Runtime clients receive approved generated derivatives only.</p>
        </WorkspacePanel>
        <WorkspacePanel title="Upload Intake" icon={UploadCloud}>
          <div className="space-y-3 text-sm leading-6 text-slate-300">
            <p>Accepted source formats: {state.acceptedSourceFormats.join(", ")}.</p>
            <p>Use Asset Production to upload source masters with the agent artKey, then generate the AI Agent preset family.</p>
            <Link href="/assets/source" className="inline-flex h-9 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20">
              Open Source Art
            </Link>
          </div>
        </WorkspacePanel>
      </section>

      <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-4 shadow-glow">
        <div className="grid gap-3 xl:grid-cols-[1fr_12rem_12rem]">
          <WorkspaceSearchBar value={query} onChange={setQuery} placeholder="Search AI agents, unlocks, states, dialogue roles" />
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Rarity</span>
            <select value={rarity} onChange={(event) => setRarity(event.target.value as typeof rarity)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
              {rarityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">State</span>
            <select value={agentState} onChange={(event) => setAgentState(event.target.value as typeof agentState)} className="h-11 rounded-md border border-cyan-300/15 bg-slate-950/80 px-3 text-sm font-bold text-white outline-none">
              {stateOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2 text-sm font-semibold text-slate-400">
          <Search className="h-4 w-4" />
          {filtered.length} shown
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {filtered.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
      </section>

      <WorkspacePanel title="Published Variant Contract" icon={Sparkles}>
        <div className="grid gap-3 sm:grid-cols-4">
          <WorkspaceStatTile label="Published Variants" value={state.stats.publishedVariants} />
          <WorkspaceStatTile label="Selectable Agents" value={state.stats.selectableAgents} />
          <WorkspaceStatTile label="Selectable Variants" value={state.stats.selectableVariants} />
          <WorkspaceStatTile label="Automation Power" value="Upgrade Levels" />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">Variants are visual identity only. Labor Assistance strength remains controlled by automation upgrade levels and existing automation IDs.</p>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {state.variants.map((variant) => <VariantCard key={variant.id} variant={variant} />)}
        </div>
      </WorkspacePanel>

      <section className="grid gap-4">
        {state.records.map((record) => <AgentDetail key={record.id} record={record} />)}
      </section>

      <WorkspacePanel title="Component Library Contract" icon={Palette}>
        <div className="grid gap-3 sm:grid-cols-3">
          <WorkspaceStatTile label="References" value={state.stats.componentReferences} />
          <WorkspaceStatTile label="Canonical Input" value="aiAgentId" />
          <WorkspaceStatTile label="Fixed PNGs" value="Rejected" />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">AiAgentPortrait and related UI components must resolve head, eyes, states, and expressions from this library. Static assistant image references are treated as production debt.</p>
      </WorkspacePanel>

      <WorkspacePanel title="Future Voice" icon={Sparkles}>
        <p className="text-sm leading-6 text-slate-300">Voice profiles are reserved as canonical planning records only. No client audio, provider secrets, or private voice data are exported from this workspace.</p>
      </WorkspacePanel>
    </main>
  );
}
