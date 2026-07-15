"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BadgeDollarSign, Boxes, Brain, CircuitBoard, Clock, Coins, Diamond, Download, Gauge, GitBranch, Hammer, Layers3, MousePointerClick, Network, Search, ShieldCheck, Sigma, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EconomyDesignerView, EconomyFocusedModel, EconomyGraphNode, EconomyInspector } from "@/lib/economy-designer";
import { CompactWorkspaceToolbar, collectionGridClass, useWorkspaceDensitySettings } from "@/components/ui/density";
import { WorkspaceBadge as Badge, WorkspaceHeader, WorkspaceMiniStat, WorkspacePanel as Panel, WorkspaceProgressBar, WorkspaceStatTile, WorkspaceTabs } from "@/components/ui/workspace";
import { cn } from "@/lib/utils";

type EconomyDesignerTab = "inspector" | "graph" | "producers" | "building_effects" | "models" | "scope" | "timeline" | "sandbox" | "validation" | "handoff";

const tabs: EconomyDesignerTab[] = ["inspector", "graph", "producers", "building_effects", "models", "scope", "timeline", "sandbox", "validation", "handoff"];
const tabLabels: Record<EconomyDesignerTab, string> = {
  inspector: "Resource Inspector",
  graph: "Flow Graph",
  producers: "Producers & Consumers",
  building_effects: "Building Effects",
  models: "Focused Models",
  scope: "Scope & Rollups",
  timeline: "Era Timeline",
  sandbox: "Balance Sandbox",
  validation: "Validation",
  handoff: "Decision/Handoff"
};

const economyIcons: Record<string, LucideIcon> = {
  "ECON-LABOR": Hammer,
  "ECON-CREDITS": Coins,
  "ECON-POPULATION": Users,
  "ECON-RESEARCH": Brain,
  "ECON-PREMIUM-CRYSTALS": Diamond
};

function formatRate(value: number) {
  if (!value) return "0";
  return value > 0 ? `+${value}/s` : `${value}/s`;
}

function compact(value: number) {
  return Intl.NumberFormat("en", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function EconomyPill({ economy, selected, onClick }: { economy: EconomyInspector; selected: boolean; onClick: () => void }) {
  const Icon = economyIcons[economy.economyId] ?? BadgeDollarSign;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border p-3 text-left transition",
        selected ? "border-cyan-300/65 bg-cyan-300/15 shadow-[0_0_22px_rgba(34,211,238,0.12)]" : "border-cyan-300/15 bg-slate-950/35 hover:border-cyan-300/35"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
          <Icon className="h-5 w-5 text-cyan-100" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-white">{economy.displayName}</span>
          <span className="block truncate font-mono text-[0.7rem] text-slate-500">{economy.economyId}</span>
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge value={economy.behaviorType} />
        <Badge value={economy.validationStatus} />
      </div>
    </button>
  );
}

function BoolBadge({ label, value }: { label: string; value: boolean }) {
  return <Badge value={`${label}: ${value ? "Yes" : "No"}`} className={value ? undefined : "border-slate-600 bg-slate-900/60 text-slate-300"} />;
}

function InspectorPanel({ economy }: { economy: EconomyInspector }) {
  const Icon = economyIcons[economy.economyId] ?? BadgeDollarSign;
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.65fr)]">
      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10">
                <Icon className="h-7 w-7 text-cyan-100" />
              </span>
              <div>
                <h2 className="text-3xl font-black text-white">{economy.displayName}</h2>
                <p className="font-mono text-xs text-slate-500">{economy.economyId} / {economy.iconKey}</p>
              </div>
            </div>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">{economy.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge value={economy.behaviorType} />
            <Badge value={`HUD ${economy.hudSlot}`} />
            <Badge value={economy.validationStatus} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <WorkspaceMiniStat label="Starting Amount" value={economy.startingAmount} />
          <WorkspaceMiniStat label="Base Passive" value={formatRate(economy.basePassiveRate)} />
          <WorkspaceMiniStat label="Scope" value={economy.scope} />
          <WorkspaceMiniStat label="Cap Policy" value={economy.capPolicy.split(":")[0]} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            ["Manual Production", economy.manualProduction],
            ["AI Agent Production", economy.aiAgentProduction],
            ["Building Production", economy.buildingProduction],
            ["Event / Discovery", economy.eventDiscoveryProduction],
            ["Purchase Production", economy.purchaseProduction],
            ["Integer / Fraction", economy.integerRules]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-cyan-300/10 bg-slate-950/40 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <BoolBadge label="Spendable" value={economy.spendable} />
          <BoolBadge label="Premium" value={economy.premium} />
          <BoolBadge label="Capacity" value={economy.capacityResource} />
          <BoolBadge label="Offline" value={economy.offlineEligibility} />
        </div>
      </Panel>

      <div className="grid gap-4">
        <Panel title="Produced By" icon={CircuitBoard}>
          <div className="grid gap-2">
            {economy.producedBy.slice(0, 8).map((producer) => (
              <div key={producer.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-bold text-white">{producer.id}</p>
                  <Badge value={producer.sourceType} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{producer.productionMode} / {producer.scope} / {producer.offlineEligible ? "offline" : "live"}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Consumed By" icon={Download}>
          <div className="grid gap-2">
            {economy.consumedBy.slice(0, 8).map((consumer) => (
              <a key={consumer.id} href={consumer.href} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 transition hover:border-cyan-300/35">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-bold text-white">{consumer.displayName}</p>
                  <Badge value={consumer.sourceType} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{consumer.amount ?? "variable"} / {consumer.status}</p>
              </a>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Era Presentation Overrides" icon={Clock} className="xl:col-span-2">
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-9">
          {economy.eraPresentationOverrides.map((override) => (
            <div key={override.eraId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">{override.eraId}</p>
              <p className="mt-1 truncate text-sm font-black text-white">{override.label}</p>
              <p className="mt-1 truncate text-xs text-slate-400">{override.iconKey}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {override.primary ? <Badge value="Primary" /> : null}
                {override.clickTarget ? <Badge value="Click" /> : null}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function FlowGraph({ view, selectedEconomyId, query }: { view: EconomyDesignerView; selectedEconomyId: string; query: string }) {
  const nodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return view.graph.nodes
      .filter((node) => node.type === "economy" || node.economyId === selectedEconomyId)
      .filter((node) => !q || `${node.label} ${node.id} ${node.badges.join(" ")}`.toLowerCase().includes(q))
      .slice(0, view.performance.defaultNodeLimit);
  }, [query, selectedEconomyId, view]);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = view.graph.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)).slice(0, view.performance.defaultEdgeLimit);
  const economyNode = nodes.find((node) => node.id === `node-economy-${selectedEconomyId}`);
  const producers = nodes.filter((node) => node.type !== "economy" && view.graph.edges.some((edge) => edge.from === node.id && edge.to === economyNode?.id));
  const consumers = nodes.filter((node) => node.type !== "economy" && view.graph.edges.some((edge) => edge.from === economyNode?.id && edge.to === node.id));

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(18rem,0.6fr)_minmax(0,1fr)_minmax(18rem,0.6fr)]">
      <Panel title="Produces" icon={ArrowRight}>
        <GraphColumn nodes={producers} />
      </Panel>
      <Panel title="Focused Flow Graph" icon={Network}>
        <div className="rounded-md border border-cyan-300/10 bg-slate-950/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <Badge value={`${nodes.length} nodes`} />
            <Badge value={`${edges.length} edges`} />
            <Badge value="fit view" />
          </div>
          <div className="mt-5 grid place-items-center gap-4">
            {economyNode ? <GraphNode node={economyNode} featured /> : null}
            <div className="grid w-full gap-2 sm:grid-cols-3">
              <Badge value="zoom" />
              <Badge value="pan" />
              <Badge value="minimap-ready" />
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {edges.slice(0, 16).map((edge) => (
              <div key={edge.id} className="flex items-center gap-2 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2 text-xs text-slate-300">
                <span className="truncate">{edge.from.replace("node-producer-", "").replace("node-economy-", "")}</span>
                <ArrowRight className="h-3 w-3 shrink-0 text-cyan-200" />
                <span className="truncate">{edge.to.replace("node-consumer-", "").replace("node-economy-", "")}</span>
                <Badge value={edge.type} />
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <Panel title="Consumes" icon={Download}>
        <GraphColumn nodes={consumers} />
      </Panel>
    </div>
  );
}

function GraphColumn({ nodes }: { nodes: EconomyGraphNode[] }) {
  return (
    <div className="grid gap-2">
      {nodes.slice(0, 18).map((node) => <GraphNode key={node.id} node={node} />)}
      {!nodes.length ? <p className="text-sm text-slate-500">No visible nodes for the current filter.</p> : null}
    </div>
  );
}

function GraphNode({ node, featured = false }: { node: EconomyGraphNode; featured?: boolean }) {
  return (
    <a href={node.href ?? "/economy-designer"} className={cn("block rounded-md border border-cyan-300/15 bg-slate-950/45 p-3 transition hover:border-cyan-300/45", featured && "w-full max-w-md border-cyan-300/45 bg-cyan-300/10 p-5 text-center")}>
      <p className={cn("truncate font-black text-white", featured ? "text-2xl" : "text-sm")}>{node.label}</p>
      <p className="mt-1 truncate font-mono text-[0.65rem] text-slate-500">{node.id}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <Badge value={node.type} />
        {node.badges.slice(0, 2).map((badge) => <Badge key={badge} value={badge} />)}
      </div>
    </a>
  );
}

function ProducerBrowser({ economy, query }: { economy: EconomyInspector; query: string }) {
  const q = query.trim().toLowerCase();
  const producers = economy.producedBy.filter((producer) => !q || `${producer.id} ${producer.sourceType} ${producer.productionMode} ${producer.scope}`.toLowerCase().includes(q));
  const consumers = economy.consumedBy.filter((consumer) => !q || `${consumer.displayName} ${consumer.sourceType} ${consumer.sourceId}`.toLowerCase().includes(q));
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Producer Browser" icon={CircuitBoard}>
        <div className="grid gap-2">
          {producers.slice(0, 80).map((producer) => (
            <div key={producer.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="truncate text-sm font-black text-white">{producer.id}</p>
                <Badge value={producer.sourceType} />
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                <WorkspaceMiniStat label="Mode" value={producer.productionMode} />
                <WorkspaceMiniStat label="Amount" value={producer.baseAmount} />
                <WorkspaceMiniStat label="Scope" value={producer.scope} />
                <WorkspaceMiniStat label="Offline" value={producer.offlineEligible ? "Yes" : "No"} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Consumer Browser" icon={Download}>
        <div className="grid gap-2">
          {consumers.slice(0, 80).map((consumer) => (
            <a key={consumer.id} href={consumer.href} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 transition hover:border-cyan-300/35">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="truncate text-sm font-black text-white">{consumer.displayName}</p>
                <Badge value={consumer.sourceType} />
              </div>
              <p className="mt-2 text-xs text-slate-400">{consumer.sourceId} / {consumer.amount ?? "variable"}</p>
            </a>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function BuildingEffects({ view, selectedEconomyId, query }: { view: EconomyDesignerView; selectedEconomyId: string; query: string }) {
  const rows = view.buildingEffects.filter((effect) => {
    const haystack = `${effect.buildingName} ${effect.id} ${effect.era} ${effect.scope} ${effect.productionOutputs.join(" ")} ${effect.capacityOutputs.join(" ")} ${effect.growthOutputs.join(" ")}`.toLowerCase();
    return haystack.includes(selectedEconomyId.toLowerCase()) && (!query.trim() || haystack.includes(query.toLowerCase()));
  });
  return (
    <Panel title="Structured Building Effects" icon={Boxes}>
      <div className="grid gap-2">
        {rows.slice(0, 120).map((effect) => (
          <a key={effect.id} href={effect.href} className="grid gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 transition hover:border-cyan-300/35 lg:grid-cols-[1.2fr_repeat(5,0.6fr)] lg:items-center">
            <div>
              <p className="font-black text-white">{effect.buildingName}</p>
              <p className="font-mono text-[0.65rem] text-slate-500">{effect.id}</p>
            </div>
            <Badge value={effect.era} />
            <Badge value={effect.scope} />
            <span className="text-sm text-slate-300">Staff {effect.staffingRequirement}</span>
            <span className="text-sm text-slate-300">{[...effect.productionOutputs, ...effect.capacityOutputs, ...effect.growthOutputs].join(", ")}</span>
            <Badge value={effect.validationStatus} />
          </a>
        ))}
      </div>
    </Panel>
  );
}

function FocusedModel({ model }: { model: EconomyFocusedModel }) {
  return (
    <Panel title={model.title} icon={Sigma}>
      <div className="grid gap-3 md:grid-cols-4">
        {model.cards.map((card) => (
          <div key={card.label} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
              <Badge value={card.status} />
            </div>
            <p className="mt-2 text-lg font-black text-white">{card.value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{card.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {model.rows.slice(0, 8).map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 px-3 py-2">
            <div>
              <p className="text-sm font-bold text-white">{row.label}</p>
              <p className="text-xs text-slate-500">{row.detail}</p>
            </div>
            <Badge value={row.status} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function EconomyDesignerWorkspace({ view }: { view: EconomyDesignerView }) {
  const [tab, setTab] = useState<EconomyDesignerTab>("inspector");
  const [selectedEconomyId, setSelectedEconomyId] = useState(view.economies[0]?.economyId ?? "ECON-LABOR");
  const [query, setQuery] = useState("");
  const [densitySettings, setDensitySettings] = useWorkspaceDensitySettings("project-genesis-density-economy-designer");
  const selectedEconomy = view.economies.find((economy) => economy.economyId === selectedEconomyId) ?? view.economies[0];

  return (
    <main className="space-y-6">
      <WorkspaceHeader
        eyebrow="Studio Authoring Workspace"
        title="Economy Designer"
        description="Inspect canonical economy contracts, producers, consumers, building effects, scope rollups, era presentation, and safe sandbox projections without mutating player state."
        stats={[
          { label: "Economies", value: view.summary.canonicalEconomies },
          { label: "Producers", value: compact(view.summary.producers) },
          { label: "Building Effects", value: compact(view.summary.buildingEffects) },
          { label: "Safety", value: view.summary.premiumSafetyStatus }
        ]}
      />

      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <WorkspaceStatTile label="Contract Complete" value={`${view.summary.contractCompleteness}%`} />
        <WorkspaceStatTile label="Consumers" value={compact(view.summary.consumers)} />
        <WorkspaceStatTile label="Scope Coverage" value={`${view.summary.scopeCoverage}%`} />
        <WorkspaceStatTile label="Offline Producers" value={compact(view.summary.offlineEligibleProducers)} />
        <WorkspaceStatTile label="Warnings" value={view.summary.validationWarnings} />
        <WorkspaceStatTile label="Disconnected" value={view.summary.disconnectedProducers} />
        <WorkspaceStatTile label="Unreachable" value={view.summary.unreachableResources} />
        <WorkspaceStatTile label="Premium Unsafe" value={view.summary.unsafePremiumSources} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(22rem,0.35fr)]">
        <CompactWorkspaceToolbar
          query={query}
          onQueryChange={setQuery}
          settings={densitySettings}
          onSettingsChange={setDensitySettings}
          resultCount={view.economies.length}
          totalCount={view.economies.length}
          placeholder="Search economy IDs, producers, buildings, scopes, reason codes"
          filterOptions={[{ value: "all", label: "All" }, { value: "ready", label: "Ready" }, { value: "warning", label: "Warnings" }]}
          groupOptions={[{ value: "none", label: "None" }, { value: "status", label: "Status" }, { value: "type", label: "Type" }, { value: "era", label: "Era" }]}
        />
        <Panel>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Runtime</span>
              <Badge value={view.metadata.validationStatus} />
            </div>
            <p className="font-mono text-xs text-slate-400">v{view.metadata.contentVersion} / {view.metadata.runtimeVersion}</p>
            <p className="truncate font-mono text-[0.65rem] text-slate-600">{view.metadata.checksum}</p>
          </div>
        </Panel>
      </div>

      <div className={collectionGridClass(densitySettings)}>
        {view.economies.map((economy) => <EconomyPill key={economy.economyId} economy={economy} selected={selectedEconomyId === economy.economyId} onClick={() => setSelectedEconomyId(economy.economyId)} />)}
      </div>

      <WorkspaceTabs tabs={tabs} active={tab} onChange={setTab} labels={tabLabels} />

      {tab === "inspector" && selectedEconomy ? <InspectorPanel economy={selectedEconomy} /> : null}
      {tab === "graph" ? <FlowGraph view={view} selectedEconomyId={selectedEconomyId} query={query} /> : null}
      {tab === "producers" && selectedEconomy ? <ProducerBrowser economy={selectedEconomy} query={query} /> : null}
      {tab === "building_effects" ? <BuildingEffects view={view} selectedEconomyId={selectedEconomyId} query={query} /> : null}
      {tab === "models" ? (
        <div className="grid gap-4">
          <FocusedModel model={view.populationModel} />
          <FocusedModel model={view.researchModel} />
          <FocusedModel model={view.creditsModel} />
          <Panel title="Premium Crystal Safety" icon={ShieldCheck}>
            <div className="flex flex-wrap gap-2">
              {view.premiumSafety.allowedSourceClasses.map((item) => <Badge key={item} value={item} />)}
            </div>
            <div className="mt-4 grid gap-2">
              {view.premiumSafety.transactionReasons.map((reason) => (
                <div key={reason.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3">
                  <p className="text-sm font-black text-white">{reason.id}</p>
                  <p className="mt-1 text-xs text-slate-400">{reason.operation} / server authoritative: {reason.serverAuthoritativeRequired ? "yes" : "no"}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}
      {tab === "scope" ? (
        <Panel title="Scope & Rollup Designer" icon={Layers3}>
          <div className="grid gap-3">
            {view.scopeRollups.map((rule) => (
              <div key={rule.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {rule.path.map((step, index) => (
                    <span key={`${rule.id}-${step}`} className="inline-flex items-center gap-2">
                      <Badge value={step} />
                      {index < rule.path.length - 1 ? <ArrowRight className="h-4 w-4 text-cyan-200" /> : null}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-slate-300">{rule.doubleCountPrevention}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge value={rule.aggregationMode} />
                  <Badge value={rule.localOnly ? "local only" : "rolls up"} />
                  <Badge value={rule.visibleInCivilizationHud ? "HUD visible" : "local display"} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
      {tab === "timeline" ? (
        <Panel title="Era Economy Timeline" icon={GitBranch}>
          <div className="grid gap-3 xl:grid-cols-3">
            {view.eraTimeline.map((era) => (
              <div key={era.eraId} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black text-white">{era.displayName}</h3>
                  <Badge value={era.primaryEconomyId} />
                </div>
                <p className="mt-2 text-xs text-slate-500">Click target: {era.clickTarget ?? "none"}</p>
                <div className="mt-3 grid gap-2">
                  {era.displayLabels.map((label) => (
                    <div key={`${era.eraId}-${label.economyId}`} className="flex items-center justify-between gap-2 rounded-md bg-slate-950/60 px-2 py-1">
                      <span className="text-xs text-slate-300">{label.label}</span>
                      <span className="font-mono text-[0.65rem] text-slate-500">{label.iconKey}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
      {tab === "sandbox" ? (
        <Panel title={view.balanceSandbox.title} icon={Gauge}>
          <div className="grid gap-3 md:grid-cols-5">
            <WorkspaceStatTile label="Labor/sec" value={view.balanceSandbox.result.laborPerSecond} />
            <WorkspaceStatTile label="Credits/sec" value={view.balanceSandbox.result.creditsPerSecond} />
            <WorkspaceStatTile label="Research/sec" value={view.balanceSandbox.result.researchPerSecond} />
            <WorkspaceStatTile label="Population Cap" value={view.balanceSandbox.result.populationCapacity} />
            <WorkspaceStatTile label="Premium" value={view.balanceSandbox.result.premiumCrystalChanges} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <h4 className="font-black text-white">Rate Breakdown</h4>
              <div className="mt-3 grid gap-2">
                {view.balanceSandbox.result.sourceBreakdown.map((row) => (
                  <div key={`${row.label}-${row.economyId}`} className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-300">{row.label}</span>
                    <span className="font-bold text-cyan-100">{row.amount}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">Multiplier order: {view.balanceSandbox.result.multiplierOrder.join(" -> ")}</p>
            </div>
            <div className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
              <h4 className="font-black text-white">Time Projection</h4>
              <div className="mt-3 grid gap-2">
                {view.balanceSandbox.projections.map((projection) => (
                  <div key={projection.label} className="rounded-md bg-slate-950/60 p-2">
                    <p className="text-sm font-bold text-white">{projection.label}</p>
                    <p className="mt-1 text-xs text-slate-400">Labor {projection.projectedGain["ECON-LABOR"]} / Credits {projection.projectedGain["ECON-CREDITS"]} / Research {projection.projectedGain["ECON-RESEARCH"]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      ) : null}
      {tab === "validation" ? (
        <Panel title="Validation Issues" icon={AlertTriangle}>
          <div className="grid gap-3">
            {!view.validationIssues.length ? (
              <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100">No actionable economy designer validation issues.</div>
            ) : view.validationIssues.map((issue) => (
              <div key={issue.id} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-black text-white">{issue.title}</h4>
                  <Badge value={issue.severity} />
                </div>
                <p className="mt-2 text-sm text-slate-300">{issue.detail}</p>
                <p className="mt-1 font-mono text-[0.65rem] text-slate-500">{issue.id}</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
      {tab === "handoff" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_0.7fr]">
          <Panel title="Copy-Ready Handoffs" icon={Search}>
            <div className="grid gap-3">
              {view.handoffs.map((handoff) => (
                <div key={handoff.target} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-4">
                  <Badge value={handoff.target} />
                  <h4 className="mt-3 text-lg font-black text-white">{handoff.title}</h4>
                  <ul className="mt-3 space-y-1 text-sm text-slate-300">
                    {handoff.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Performance Strategy" icon={CircuitBoard}>
            <div className="grid gap-3">
              <WorkspaceMiniStat label="Default Nodes" value={view.performance.defaultNodeLimit} />
              <WorkspaceMiniStat label="Default Edges" value={view.performance.defaultEdgeLimit} />
              <WorkspaceMiniStat label="Cache Key" value={view.performance.cacheKey.slice(0, 12)} />
              {view.performance.strategy.map((item) => (
                <div key={item} className="rounded-md border border-cyan-300/10 bg-slate-950/45 p-3 text-sm text-slate-300">{item}</div>
              ))}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Private Data Leak Check</p>
                <WorkspaceProgressBar value={view.metadata.privateDataLeakCheck === "passed" ? 100 : 0} />
              </div>
            </div>
          </Panel>
        </div>
      ) : null}
    </main>
  );
}
