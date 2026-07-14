import { existsSync } from "node:fs";
import path from "node:path";
import { getGameData } from "@/lib/data";
import { buildCanonicalRuntimeExportPayload } from "@/lib/runtime/game-runtime";
import { primaryHudEconomyIds } from "@/lib/economy/definitions";
import type {
  BuildingResourceEffect,
  EconomyBehaviorContract,
  EconomyRateBreakdownDefinition,
  EconomyScopeRule,
  EconomyTransactionReason,
  OfflineProgressionPolicy,
  ResourceProducerDefinition
} from "@/types/runtime";
import type { Building, GameData } from "@/types/schema";

export type EconomyDesignerView = {
  metadata: {
    architectureVersion: string;
    runtimeVersion: string;
    contentVersion: number;
    checksum: string;
    validationStatus: string;
    generatedAt: string;
    privateDataLeakCheck: "passed" | "failed";
  };
  summary: {
    canonicalEconomies: number;
    inspectedEconomies: number;
    producers: number;
    consumers: number;
    buildingEffects: number;
    contractCompleteness: number;
    scopeCoverage: number;
    offlineEligibleProducers: number;
    validationWarnings: number;
    circularDependencyWarnings: number;
    disconnectedProducers: number;
    unreachableResources: number;
    unsafePremiumSources: number;
    premiumSafetyStatus: "Ready" | "Critical";
  };
  economies: EconomyInspector[];
  graph: EconomyGraph;
  buildingEffects: EconomyBuildingEffectView[];
  populationModel: EconomyFocusedModel;
  researchModel: EconomyFocusedModel;
  creditsModel: EconomyFocusedModel;
  premiumSafety: PremiumSafetyView;
  scopeRollups: ScopeRollupRule[];
  eraTimeline: EraEconomyTimelineItem[];
  balanceSandbox: EconomyScenario;
  validationIssues: EconomyValidationIssue[];
  handoffs: EconomyHandoff[];
  performance: {
    defaultNodeLimit: number;
    defaultEdgeLimit: number;
    cacheKey: string;
    strategy: string[];
  };
};

export type EconomyInspector = {
  economyId: string;
  displayName: string;
  description: string;
  iconKey: string;
  behaviorType: EconomyBehaviorContract["behaviorType"];
  startingAmount: number;
  basePassiveRate: number;
  manualProduction: string;
  aiAgentProduction: string;
  buildingProduction: string;
  eventDiscoveryProduction: string;
  purchaseProduction: string;
  spendable: boolean;
  premium: boolean;
  capacityResource: boolean;
  integerRules: string;
  offlineEligibility: boolean;
  capPolicy: string;
  scope: string;
  hudSlot: number;
  eraPresentationOverrides: Array<{ eraId: string; label: string; iconKey: string; primary: boolean; clickTarget: boolean }>;
  saveBehavior: string[];
  validationStatus: "Ready" | "Needs Review" | "Critical";
  producedBy: ResourceProducerDefinition[];
  consumedBy: EconomyConsumerReference[];
  modifiedBy: string[];
  unlockedBy: string[];
  displayedIn: string[];
  rolledUpFrom: string[];
  rateBreakdown?: EconomyRateBreakdownDefinition;
  transactionReasons: EconomyTransactionReason[];
  offlinePolicy?: OfflineProgressionPolicy;
};

export type EconomyConsumerReference = {
  id: string;
  sourceType: "building_cost" | "upgrade_cost" | "research_cost" | "mission_cost" | "trade" | "conversion" | "capacity_reservation" | "premium_spend" | "event_spend";
  sourceId: string;
  displayName: string;
  economyId: string;
  amount: number | null;
  status: "Ready" | "Needs Review" | "Missing";
  href: string;
};

export type EconomyGraph = {
  nodes: EconomyGraphNode[];
  edges: EconomyGraphEdge[];
  filters: {
    economyIds: string[];
    eras: string[];
    scopes: string[];
    sourceTypes: string[];
    statuses: string[];
  };
  warnings: EconomyValidationIssue[];
};

export type EconomyGraphNode = {
  id: string;
  label: string;
  type: "economy" | "building" | "upgrade" | "research" | "ai_agent" | "mission" | "event" | "planet" | "settlement" | "colony" | "trade_route" | "conversion" | "capacity" | "producer";
  economyId?: string;
  eraId?: string;
  scope?: string;
  status: "Ready" | "Draft" | "Missing" | "Invalid" | "Needs Review";
  previewKey?: string;
  href?: string;
  badges: string[];
};

export type EconomyGraphEdge = {
  id: string;
  from: string;
  to: string;
  type: "produces" | "consumes" | "unlocks" | "multiplies" | "converts" | "requires" | "caps" | "rolls_up" | "transfers";
  economyId?: string;
  label: string;
  status: "Ready" | "Needs Review" | "Invalid";
};

export type EconomyBuildingEffectView = {
  id: string;
  buildingId: string;
  buildingName: string;
  previewKey: string;
  era: string;
  tier: string;
  scope: string;
  staffingRequirement: number;
  inputRequirements: string[];
  productionOutputs: string[];
  capacityOutputs: string[];
  growthOutputs: string[];
  multipliers: string[];
  offlineEligibility: boolean;
  activeConditions: string[];
  validationStatus: "Ready" | "Needs Review" | "Critical";
  href: string;
};

export type EconomyFocusedModel = {
  economyId: string;
  title: string;
  cards: Array<{ label: string; value: string; detail: string; status: "Ready" | "Needs Review" | "Critical" }>;
  warnings: EconomyValidationIssue[];
  rows: Array<{ id: string; label: string; detail: string; status: "Ready" | "Needs Review" | "Critical" }>;
};

export type PremiumSafetyView = {
  allowedSourceClasses: string[];
  unsafeSources: EconomyValidationIssue[];
  transactionReasons: EconomyTransactionReason[];
  auditReadiness: "Ready" | "Critical";
};

export type ScopeRollupRule = {
  id: string;
  path: string[];
  nativeScope: string;
  rollupDestination: string;
  aggregationMode: string;
  transferRule: string;
  localOnly: boolean;
  doubleCountPrevention: string;
  visibleInCivilizationHud: boolean;
};

export type EraEconomyTimelineItem = {
  eraId: string;
  displayName: string;
  activeCanonicalEconomies: string[];
  primaryEconomyId: string;
  clickTarget: string | null;
  displayLabels: Array<{ economyId: string; label: string; iconKey: string }>;
  permittedProducerSystems: string[];
};

export type EconomyScenario = {
  id: string;
  title: string;
  sandboxOnly: true;
  inputs: EconomyScenarioInput;
  result: EconomyScenarioResult;
  projections: EconomyProjection[];
};

export type EconomyScenarioInput = {
  eraId: string;
  ownedBuildingIds: string[];
  aiAgentLevel: number;
  staffingPercent: number;
  activeBoostMultiplier: number;
  elapsedSeconds: number;
};

export type EconomyScenarioResult = {
  laborPerSecond: number;
  creditsPerSecond: number;
  researchPerSecond: number;
  populationCapacity: number;
  premiumCrystalChanges: number;
  multiplierOrder: string[];
  sourceBreakdown: Array<{ label: string; economyId: string; amount: number }>;
};

export type EconomyProjection = {
  label: string;
  durationSeconds: number;
  projectedGain: Record<string, number>;
  notes: string[];
};

export type EconomyValidationIssue = {
  id: string;
  severity: "warning" | "critical";
  category: string;
  title: string;
  detail: string;
  nodeId?: string;
};

export type DependencyPath = {
  id: string;
  outcome: string;
  mode: "shortest" | "all_paths";
  nodes: string[];
  missingLinks: string[];
};

export type EconomyHandoff = {
  target: "NOVERIS Game Codex" | "Roblox Codex" | "iOS/Android" | "Balance QA" | "Content Design";
  title: string;
  bullets: string[];
};

const inspectedEconomyIds = [...primaryHudEconomyIds];

function statusForIssues(issues: EconomyValidationIssue[], economyId: string) {
  const matching = issues.filter((issue) => issue.nodeId?.includes(economyId) || issue.detail.includes(economyId));
  if (matching.some((issue) => issue.severity === "critical")) return "Critical" as const;
  if (matching.length) return "Needs Review" as const;
  return "Ready" as const;
}

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function eraId(value: string) {
  return value.toLowerCase().replace(/\s+age$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/^space$/, "space-age");
}

function buildingHref(id: string) {
  return `/buildings#${id}`;
}

function researchHref(id: string) {
  return `/research#${id}`;
}

function upgradeHref(id: string) {
  return `/upgrades#${id}`;
}

function buildingName(data: GameData, id: string) {
  return data.buildings.find((building) => building.id === id)?.name ?? id;
}

function researchName(data: GameData, id: string) {
  return data.research.find((research) => research.id === id)?.name ?? id;
}

function upgradeName(data: GameData, id: string) {
  return data.upgrades.find((upgrade) => upgrade.id === id)?.name ?? id;
}

function consumersForEconomy(data: GameData, economyId: string): EconomyConsumerReference[] {
  const rows: EconomyConsumerReference[] = [];
  for (const building of data.buildings) {
    const amount = economyId === "ECON-CREDITS" ? building.cost_credits : economyId === "ECON-LABOR" ? building.cost_labor : economyId === "ECON-RESEARCH" ? building.cost_experimental : 0;
    if (Number(amount) > 0) {
      rows.push({ id: `consumer-building-${building.id}-${economyId}`, sourceType: "building_cost", sourceId: building.id, displayName: building.name, economyId, amount: Number(amount), status: "Ready", href: buildingHref(building.id) });
    }
  }
  for (const research of data.research) {
    if (economyId === "ECON-RESEARCH" && Number(research.cost_experimental) > 0) {
      rows.push({ id: `consumer-research-${research.id}`, sourceType: "research_cost", sourceId: research.id, displayName: research.name, economyId, amount: Number(research.cost_experimental), status: "Ready", href: researchHref(research.id) });
    }
  }
  for (const upgrade of data.upgrades) {
    const cost = String(upgrade.cost_resource ?? "");
    const mapsToEconomy = cost === economyId || cost.toLowerCase().includes(economyId.toLowerCase().replace("econ-", ""));
    if (mapsToEconomy) {
      rows.push({ id: `consumer-upgrade-${upgrade.id}-${economyId}`, sourceType: "upgrade_cost", sourceId: upgrade.id, displayName: upgrade.name, economyId, amount: Number(upgrade.base_cost) || null, status: "Ready", href: upgradeHref(upgrade.id) });
    }
  }
  if (economyId === "ECON-PREMIUM-CRYSTALS") {
    rows.push({ id: "consumer-premium-spend", sourceType: "premium_spend", sourceId: "premium_spend", displayName: "Premium spend reason codes", economyId, amount: null, status: "Ready", href: "/economy-designer" });
  }
  return rows;
}

function producerDisplayName(data: GameData, producer: ResourceProducerDefinition) {
  if (producer.sourceType === "building") return buildingName(data, producer.sourceId);
  if (producer.sourceType === "research") return researchName(data, producer.sourceId);
  if (producer.sourceType === "ai_agent") return "AI Agent Labor Assistance";
  if (producer.sourceType === "manual_click") return "Manual Click";
  if (producer.sourceType === "base_system") return "Base System";
  return titleCase(producer.sourceId || producer.sourceType);
}

function graphNodeForProducer(data: GameData, producer: ResourceProducerDefinition): EconomyGraphNode {
  const type = producer.sourceType === "building" ? "building" : producer.sourceType === "ai_agent" ? "ai_agent" : producer.sourceType === "manual_click" ? "producer" : producer.sourceType === "trade_route" ? "trade_route" : producer.sourceType === "mission" ? "mission" : producer.sourceType === "event" ? "event" : "producer";
  const building = producer.sourceType === "building" ? data.buildings.find((row) => row.id === producer.sourceId) : undefined;
  return {
    id: `node-producer-${producer.id}`,
    label: producerDisplayName(data, producer),
    type,
    economyId: producer.economyId,
    eraId: building ? eraId(building.era) : producer.requirements.eraId as string | undefined,
    scope: producer.scope,
    status: "Ready",
    previewKey: building?.icon_name || undefined,
    href: producer.sourceType === "building" ? buildingHref(producer.sourceId) : "/economy-designer",
    badges: [producer.sourceType, producer.productionMode, producer.offlineEligible ? "offline" : "live"]
  };
}

function buildValidationIssues(runtime: Awaited<ReturnType<typeof buildCanonicalRuntimeExportPayload>>, graphNodes: EconomyGraphNode[], graphEdges: EconomyGraphEdge[], effects: BuildingResourceEffect[], data: GameData): EconomyValidationIssue[] {
  const issues: EconomyValidationIssue[] = [];
  const nodeIds = new Set(graphNodes.map((node) => node.id));
  const producerIds = runtime.resourceProducerDefinitions.map((producer) => producer.id);
  const duplicateProducers = producerIds.filter((id, index) => producerIds.indexOf(id) !== index);
  for (const id of duplicateProducers) {
    issues.push({ id: `duplicate-producer-${id}`, severity: "critical", category: "Producer", title: "Duplicate producer definition", detail: `${id} appears more than once.`, nodeId: `node-producer-${id}` });
  }
  for (const producer of runtime.resourceProducerDefinitions) {
    if (!runtime.economyDefinitions.some((definition) => definition.id === producer.economyId)) {
      issues.push({ id: `producer-missing-economy-${producer.id}`, severity: "critical", category: "Producer", title: "Producer with no economy", detail: `${producer.id} references ${producer.economyId}.`, nodeId: `node-producer-${producer.id}` });
    }
    if (producer.economyId === "ECON-CREDITS" && producer.sourceType === "base_system") {
      issues.push({ id: `credits-fallback-${producer.id}`, severity: "critical", category: "Credits", title: "Credits fallback production", detail: "Credits cannot use default passive fallback.", nodeId: `node-producer-${producer.id}` });
    }
    if (producer.economyId === "ECON-PREMIUM-CRYSTALS" && (producer.sourceType === "building" || producer.sourceType === "base_system" || producer.sourceType === "ai_agent" || producer.offlineEligible)) {
      issues.push({ id: `premium-unsafe-${producer.id}`, severity: "critical", category: "Premium", title: "Unsafe Premium Crystal source", detail: `${producer.id} uses ${producer.sourceType}.`, nodeId: `node-producer-${producer.id}` });
    }
  }
  if (!runtime.resourceProducerDefinitions.some((producer) => producer.economyId === "ECON-RESEARCH")) {
    issues.push({ id: "research-no-producer", severity: "warning", category: "Research", title: "Research has no active producer", detail: "Research requires canonical producer definitions before clients can generate it." });
  }
  for (const effect of effects) {
    const building = data.buildings.find((row) => row.id === effect.buildingId);
    if (building && /housing|house|habitat|shelter/i.test(`${building.name} ${building.description}`) && effect.economyId === "ECON-POPULATION" && effect.effectKind !== "capacity_increase") {
      issues.push({ id: `population-capacity-warning-${effect.id}`, severity: "warning", category: "Population", title: "Housing without capacity metadata", detail: `${building.name} reads like housing but does not export a capacity effect.`, nodeId: `node-producer-producer_${effect.id}` });
    }
  }
  for (const edge of graphEdges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      issues.push({ id: `edge-missing-node-${edge.id}`, severity: "critical", category: "Graph", title: "Graph edge references a missing node", detail: `${edge.from} -> ${edge.to}`, nodeId: edge.from });
    }
  }
  const civilizationRule = runtime.economyScopeRules.find((rule) => rule.scope === "civilization");
  if (!civilizationRule || !inspectedEconomyIds.every((economyId) => civilizationRule.appliesToEconomyIds.includes(economyId))) {
    issues.push({ id: "scope-rollup-coverage", severity: "critical", category: "Scope", title: "Top HUD scope coverage gap", detail: "Civilization rollup rule must cover all five permanent HUD economies." });
  }
  return issues;
}

function buildGraph(runtime: Awaited<ReturnType<typeof buildCanonicalRuntimeExportPayload>>, data: GameData): EconomyGraph {
  const nodes: EconomyGraphNode[] = runtime.economyDefinitions
    .filter((definition) => inspectedEconomyIds.includes(definition.id as typeof primaryHudEconomyIds[number]))
    .map((definition, index) => ({
      id: `node-economy-${definition.id}`,
      label: definition.displayName,
      type: "economy",
      economyId: definition.id,
      scope: "civilization",
      status: "Ready",
      previewKey: definition.iconKey,
      href: `/economy-designer?economy=${definition.id}`,
      badges: [`slot ${index + 1}`, definition.premium ? "premium" : "standard"]
    }));

  const producerNodes = runtime.resourceProducerDefinitions.map((producer) => graphNodeForProducer(data, producer));
  nodes.push(...producerNodes);
  const edges: EconomyGraphEdge[] = runtime.resourceProducerDefinitions.map((producer) => ({
    id: `edge-producer-${producer.id}-${producer.economyId}`,
    from: `node-producer-${producer.id}`,
    to: `node-economy-${producer.economyId}`,
    type: "produces",
    economyId: producer.economyId,
    label: `${producer.productionMode} ${producer.baseAmount}`,
    status: "Ready"
  }));

  for (const economyId of inspectedEconomyIds) {
    for (const consumer of consumersForEconomy(data, economyId)) {
      const nodeId = `node-consumer-${consumer.id}`;
      nodes.push({ id: nodeId, label: consumer.displayName, type: consumer.sourceType === "research_cost" ? "research" : consumer.sourceType === "upgrade_cost" ? "upgrade" : "building", economyId, status: consumer.status, href: consumer.href, badges: [consumer.sourceType] });
      edges.push({ id: `edge-consumer-${consumer.id}`, from: `node-economy-${economyId}`, to: nodeId, type: "consumes", economyId, label: consumer.amount == null ? "consumes" : String(consumer.amount), status: consumer.status === "Ready" ? "Ready" : "Needs Review" });
    }
  }

  return {
    nodes,
    edges,
    filters: {
      economyIds: inspectedEconomyIds,
      eras: runtime.eras.map((era) => era.id),
      scopes: [...new Set(runtime.resourceProducerDefinitions.map((producer) => producer.scope))],
      sourceTypes: [...new Set(runtime.resourceProducerDefinitions.map((producer) => producer.sourceType))],
      statuses: ["Ready", "Draft", "Missing", "Invalid", "Needs Review"]
    },
    warnings: []
  };
}

function buildingEffectView(data: GameData, effect: BuildingResourceEffect, producers: ResourceProducerDefinition[]): EconomyBuildingEffectView {
  const building = data.buildings.find((row) => row.id === effect.buildingId);
  const producer = producers.find((row) => row.id === `producer_${effect.id}`);
  return {
    id: effect.id,
    buildingId: effect.buildingId,
    buildingName: effect.buildingName,
    previewKey: building?.icon_name || building?.asset_id || "building_placeholder",
    era: effect.eraId,
    tier: building?.upgrade_chain || building?.building_size || "base",
    scope: effect.scope,
    staffingRequirement: effect.staffingRequirement,
    inputRequirements: producer?.inputCosts.map((cost) => `${cost.amount} ${cost.economyId ?? cost.resourceId}`) ?? [],
    productionOutputs: effect.effectKind === "production" ? [`${effect.amount} ${effect.economyId}/${effect.intervalSeconds ?? 1}s`] : [],
    capacityOutputs: effect.effectKind === "capacity_increase" ? [`+${effect.amount} ${effect.economyId} capacity`] : [],
    growthOutputs: effect.effectKind === "growth_rate" ? [`+${effect.amount} ${effect.economyId} growth`] : [],
    multipliers: producer?.multipliers.map((multiplier) => `${multiplier.appliesTo} ${multiplier.mode} ${multiplier.value}`) ?? [],
    offlineEligibility: producer?.offlineEligible ?? false,
    activeConditions: producer?.activeConditions ?? [],
    validationStatus: effect.economyId === "ECON-PREMIUM-CRYSTALS" ? "Critical" : "Ready",
    href: buildingHref(effect.buildingId)
  };
}

function focusedModel(economyId: string, title: string, inspectors: EconomyInspector[], issues: EconomyValidationIssue[], effects: EconomyBuildingEffectView[]): EconomyFocusedModel {
  const inspector = inspectors.find((item) => item.economyId === economyId);
  return {
    economyId,
    title,
    cards: [
      { label: "Behavior", value: inspector?.behaviorType ?? "missing", detail: inspector?.description ?? "No contract found.", status: inspector ? "Ready" : "Critical" },
      { label: "Produced By", value: String(inspector?.producedBy.length ?? 0), detail: "Canonical producers only.", status: "Ready" },
      { label: "Consumed By", value: String(inspector?.consumedBy.length ?? 0), detail: "Costs, spends, and reservations.", status: "Ready" },
      { label: "Offline", value: inspector?.offlineEligibility ? "Eligible" : "Blocked", detail: inspector?.offlinePolicy?.producerEligibility ?? "No offline policy.", status: inspector?.offlineEligibility || economyId === "ECON-PREMIUM-CRYSTALS" ? "Ready" : "Needs Review" }
    ],
    warnings: issues.filter((issue) => issue.category.toLowerCase().includes(title.toLowerCase().split(" ")[0]) || issue.detail.includes(economyId)),
    rows: effects.filter((effect) => effect.productionOutputs.join(" ").includes(economyId) || effect.capacityOutputs.join(" ").includes(economyId) || effect.growthOutputs.join(" ").includes(economyId)).slice(0, 24).map((effect) => ({ id: effect.id, label: effect.buildingName, detail: [...effect.productionOutputs, ...effect.capacityOutputs, ...effect.growthOutputs].join(", "), status: effect.validationStatus }))
  };
}

function buildScenario(runtime: Awaited<ReturnType<typeof buildCanonicalRuntimeExportPayload>>, effects: EconomyBuildingEffectView[]): EconomyScenario {
  const selectedEffects = effects.filter((effect) => effect.era === "survival").slice(0, 4);
  const laborFromBuildings = selectedEffects.reduce((sum, effect) => sum + effect.productionOutputs.filter((row) => row.includes("ECON-LABOR")).reduce((inner, row) => inner + Number(row.match(/[-+]?\d+(\.\d+)?/)?.[0] ?? 0), 0), 0);
  const creditsFromBuildings = selectedEffects.reduce((sum, effect) => sum + effect.productionOutputs.filter((row) => row.includes("ECON-CREDITS")).reduce((inner, row) => inner + Number(row.match(/[-+]?\d+(\.\d+)?/)?.[0] ?? 0), 0), 0);
  const researchFromBuildings = selectedEffects.reduce((sum, effect) => sum + effect.productionOutputs.filter((row) => row.includes("ECON-RESEARCH")).reduce((inner, row) => inner + Number(row.match(/[-+]?\d+(\.\d+)?/)?.[0] ?? 0), 0), 0);
  const baseLabor = runtime.economyBehaviorContracts.find((contract) => contract.economyId === "ECON-LABOR")?.basePassiveRate ?? 0;
  const result: EconomyScenarioResult = {
    laborPerSecond: baseLabor + 2 + laborFromBuildings,
    creditsPerSecond: creditsFromBuildings,
    researchPerSecond: researchFromBuildings,
    populationCapacity: selectedEffects.reduce((sum, effect) => sum + effect.capacityOutputs.reduce((inner, row) => inner + Number(row.match(/[-+]?\d+(\.\d+)?/)?.[0] ?? 0), 0), 0),
    premiumCrystalChanges: 0,
    multiplierOrder: runtime.economyCalculationRules.multiplierOrder,
    sourceBreakdown: [
      { label: "Base Passive Labor", economyId: "ECON-LABOR", amount: baseLabor },
      { label: "AI Agent Labor Assistance", economyId: "ECON-LABOR", amount: 2 },
      { label: "Selected Buildings", economyId: "ECON-LABOR", amount: laborFromBuildings },
      { label: "Selected Commerce", economyId: "ECON-CREDITS", amount: creditsFromBuildings },
      { label: "Selected Labs", economyId: "ECON-RESEARCH", amount: researchFromBuildings }
    ]
  };
  return {
    id: "scenario-survival-starter",
    title: "Survival starter sandbox",
    sandboxOnly: true,
    inputs: { eraId: "survival", ownedBuildingIds: selectedEffects.map((effect) => effect.buildingId), aiAgentLevel: 1, staffingPercent: 100, activeBoostMultiplier: 1, elapsedSeconds: 60 },
    result,
    projections: [60, 600, 3600, 28800, 86400].map((duration) => ({
      label: duration === 60 ? "1 minute" : duration === 600 ? "10 minutes" : duration === 3600 ? "1 hour" : duration === 28800 ? "8 hours offline" : "24 hours offline",
      durationSeconds: duration,
      projectedGain: {
        "ECON-LABOR": Number((result.laborPerSecond * duration).toFixed(2)),
        "ECON-CREDITS": Number((result.creditsPerSecond * duration).toFixed(2)),
        "ECON-RESEARCH": Number((result.researchPerSecond * duration).toFixed(2)),
        "ECON-PREMIUM-CRYSTALS": 0
      },
      notes: duration > 3600 ? ["Offline policy applies only to eligible producers.", "Premium Crystals remain excluded."] : ["Sandbox only; no player state mutation."]
    }))
  };
}

function buildScopeRollups(scopeRules: EconomyScopeRule[]): ScopeRollupRule[] {
  return scopeRules.map((rule) => ({
    id: rule.id,
    path: rule.scope === "civilization" ? ["Civilization"] : rule.scope === "planet" ? ["Planet", "Civilization"] : rule.scope === "settlement" ? ["Settlement", "Planet"] : ["Star System", "Civilization"],
    nativeScope: titleCase(rule.scope),
    rollupDestination: rule.rollupBehavior === "local_only" ? titleCase(rule.scope) : "Civilization",
    aggregationMode: rule.rollupBehavior,
    transferRule: rule.notes,
    localOnly: rule.rollupBehavior === "local_only",
    doubleCountPrevention: rule.doubleCountingRule,
    visibleInCivilizationHud: rule.appliesToEconomyIds.some((economyId) => inspectedEconomyIds.includes(economyId as typeof primaryHudEconomyIds[number])) && rule.rollupBehavior !== "local_only"
  }));
}

function buildHandoffs(runtime: Awaited<ReturnType<typeof buildCanonicalRuntimeExportPayload>>): EconomyHandoff[] {
  const common = [
    `runtimeVersion: ${runtime.metadata.schemaVersion}`,
    `contentVersion: ${runtime.metadata.contentVersion}`,
    `checksum: ${runtime.metadata.checksum}`,
    `HUD IDs: ${inspectedEconomyIds.join(", ")}`,
    "Use economyBehaviorContracts, resourceProducerDefinitions, buildingResourceEffects, scope rules, rate breakdowns, and offline policies."
  ];
  return [
    { target: "NOVERIS Game Codex", title: "Implement economy runtime from canonical contracts", bullets: [...common, "Manual click targets ECON-LABOR only.", "Do not use Credits fallback production."] },
    { target: "Roblox Codex", title: "Read Studio-published economy modules", bullets: [...common, "Map EconomyDefinitionsModule fields into Lua runtime registry.", "Keep existing modules as fallback until verified."] },
    { target: "iOS/Android", title: "Mobile economy HUD contract", bullets: [...common, "Fixed five HUD slots remain ordered; labels may use era presentation overrides."] },
    { target: "Balance QA", title: "Audit producer rates and rollups", bullets: [...common, "Use Balance Sandbox projections as hypothetical checks only."] },
    { target: "Content Design", title: "Author buildings with structured effects", bullets: [...common, "Every production/capacity building needs a structured BuildingResourceEffect."] }
  ];
}

function privateLeakCheck(view: unknown) {
  const text = JSON.stringify(view);
  return !/\/Users\/|studio-private:\/\/|SERVICE_ROLE|PRIVATE_KEY|clientSecret|databaseUrl/i.test(text);
}

export async function getEconomyDesignerState(): Promise<EconomyDesignerView> {
  const [runtime, data] = await Promise.all([buildCanonicalRuntimeExportPayload(), getGameData()]);
  const graph = buildGraph(runtime, data);
  const buildingEffects = runtime.buildingResourceEffects.map((effect) => buildingEffectView(data, effect, runtime.resourceProducerDefinitions));
  const issues = buildValidationIssues(runtime, graph.nodes, graph.edges, runtime.buildingResourceEffects, data);
  graph.warnings = issues.filter((issue) => issue.category === "Graph" || issue.nodeId);
  const consumers = Object.fromEntries(inspectedEconomyIds.map((economyId) => [economyId, consumersForEconomy(data, economyId)]));
  const inspectors: EconomyInspector[] = inspectedEconomyIds.map((economyId, index) => {
    const definition = runtime.economyDefinitions.find((item) => item.id === economyId);
    const contract = runtime.economyBehaviorContracts.find((item) => item.economyId === economyId);
    if (!definition || !contract) throw new Error(`Missing economy designer inputs for ${economyId}.`);
    return {
      economyId,
      displayName: definition.displayName,
      description: definition.description,
      iconKey: definition.iconKey,
      behaviorType: contract.behaviorType,
      startingAmount: contract.startingAmount,
      basePassiveRate: contract.basePassiveRate,
      manualProduction: contract.manualProduction.enabled ? contract.manualProduction.formula : "Disabled",
      aiAgentProduction: contract.automatedProduction.aiAgentTarget ? contract.automatedProduction.formula : "Disabled",
      buildingProduction: contract.buildingProduction.enabled ? `${contract.buildingProduction.allowedModes.join(", ")}` : "Disabled",
      eventDiscoveryProduction: [...contract.eventProduction.allowedSourceTypes, ...contract.discoveryProduction.allowedSourceTypes].join(", ") || "Disabled",
      purchaseProduction: contract.purchaseProduction.enabled ? `Enabled: ${contract.purchaseProduction.allowedSourceTypes.join(", ")}` : "Disabled",
      spendable: contract.spendable,
      premium: contract.premiumResource,
      capacityResource: contract.capacityResource,
      integerRules: contract.integerOnly ? "Integer only" : `Display precision ${runtime.economyCalculationRules.rounding.displayPrecision}`,
      offlineEligibility: contract.offlineProgressEligible,
      capPolicy: `${contract.capPolicy.type}: ${contract.capPolicy.notes}`,
      scope: "Civilization HUD aggregate",
      hudSlot: index + 1,
      eraPresentationOverrides: runtime.eraEconomyProfiles.map((profile) => {
        const override = profile.displayOverrides[economyId];
        return { eraId: profile.eraId, label: override?.displayName ?? definition.displayName, iconKey: override?.iconKey ?? definition.iconKey, primary: profile.primaryEconomyIds.includes(economyId), clickTarget: profile.manualClickTarget === economyId };
      }),
      saveBehavior: contract.saveBehavior.migrationNotes,
      validationStatus: statusForIssues(issues, economyId),
      producedBy: runtime.resourceProducerDefinitions.filter((producer) => producer.economyId === economyId),
      consumedBy: consumers[economyId],
      modifiedBy: runtime.economyRateBreakdownDefinitions.find((row) => row.economyId === economyId)?.labels.filter((label) => label.operation === "multiply").map((label) => label.displayName) ?? [],
      unlockedBy: runtime.economyUsageRelationships.eraUnlocks[economyId] ?? [],
      displayedIn: ["Top HUD", "Economy Designer", "Runtime route", "Engine exports"],
      rolledUpFrom: runtime.economyScopeRules.filter((rule) => rule.appliesToEconomyIds.includes(economyId)).map((rule) => rule.scope),
      rateBreakdown: runtime.economyRateBreakdownDefinitions.find((row) => row.economyId === economyId),
      transactionReasons: runtime.economyTransactionReasons.filter((reason) => reason.economyId === economyId),
      offlinePolicy: runtime.offlineProgressionPolicies.find((policy) => policy.economyId === economyId)
    };
  });
  const premiumIssues = issues.filter((issue) => issue.category === "Premium");
  const view: EconomyDesignerView = {
    metadata: {
      architectureVersion: runtime.metadata.architectureVersion ?? "1.0.0",
      runtimeVersion: runtime.metadata.schemaVersion,
      contentVersion: runtime.metadata.contentVersion,
      checksum: runtime.metadata.checksum,
      validationStatus: runtime.metadata.validationStatus,
      generatedAt: new Date().toISOString(),
      privateDataLeakCheck: "passed"
    },
    summary: {
      canonicalEconomies: runtime.economyDefinitions.length,
      inspectedEconomies: inspectors.length,
      producers: runtime.resourceProducerDefinitions.length,
      consumers: Object.values(consumers).reduce((sum, rows) => sum + rows.length, 0),
      buildingEffects: buildingEffects.length,
      contractCompleteness: Math.round((inspectors.length / inspectedEconomyIds.length) * 100),
      scopeCoverage: Math.round((inspectedEconomyIds.filter((economyId) => runtime.economyScopeRules.some((rule) => rule.appliesToEconomyIds.includes(economyId))).length / inspectedEconomyIds.length) * 100),
      offlineEligibleProducers: runtime.resourceProducerDefinitions.filter((producer) => producer.offlineEligible).length,
      validationWarnings: issues.filter((issue) => issue.severity === "warning").length,
      circularDependencyWarnings: 0,
      disconnectedProducers: runtime.resourceProducerDefinitions.filter((producer) => !graph.edges.some((edge) => edge.from === `node-producer-${producer.id}`)).length,
      unreachableResources: runtime.economyUsageRelationships.unresolved.length,
      unsafePremiumSources: premiumIssues.length,
      premiumSafetyStatus: premiumIssues.length ? "Critical" : "Ready"
    },
    economies: inspectors,
    graph,
    buildingEffects,
    populationModel: focusedModel("ECON-POPULATION", "Population Model", inspectors, issues, buildingEffects),
    researchModel: focusedModel("ECON-RESEARCH", "Research Model", inspectors, issues, buildingEffects),
    creditsModel: focusedModel("ECON-CREDITS", "Credits Model", inspectors, issues, buildingEffects),
    premiumSafety: {
      allowedSourceClasses: ["discovery", "milestone", "achievement", "event", "grant", "entitlement", "verified purchase", "refund", "adjustment"],
      unsafeSources: premiumIssues,
      transactionReasons: runtime.economyTransactionReasons.filter((reason) => reason.economyId === "ECON-PREMIUM-CRYSTALS"),
      auditReadiness: premiumIssues.length ? "Critical" : "Ready"
    },
    scopeRollups: buildScopeRollups(runtime.economyScopeRules),
    eraTimeline: runtime.eraEconomyProfiles.map((profile) => ({
      eraId: profile.eraId,
      displayName: runtime.eras.find((era) => era.id === profile.eraId)?.displayName ?? titleCase(profile.eraId),
      activeCanonicalEconomies: profile.visibleHudEconomyIds,
      primaryEconomyId: profile.primaryEconomyId,
      clickTarget: profile.manualClickTarget,
      displayLabels: inspectedEconomyIds.map((economyId) => {
        const definition = runtime.economyDefinitions.find((item) => item.id === economyId);
        const override = profile.displayOverrides[economyId];
        return { economyId, label: override?.displayName ?? definition?.displayName ?? economyId, iconKey: override?.iconKey ?? definition?.iconKey ?? "missing" };
      }),
      permittedProducerSystems: profile.permittedProducerSystems
    })),
    balanceSandbox: buildScenario(runtime, buildingEffects),
    validationIssues: issues,
    handoffs: buildHandoffs(runtime),
    performance: {
      defaultNodeLimit: 80,
      defaultEdgeLimit: 120,
      cacheKey: runtime.metadata.checksum,
      strategy: ["Derived once from runtime checksum", "Default filter by selected economy", "Render visible subgraph only", "Keep sandbox local and unsaved"]
    }
  };
  view.metadata.privateDataLeakCheck = privateLeakCheck(view) ? "passed" : "failed";
  return view;
}

export function economyDesignerRouteExists() {
  return existsSync(path.join(process.cwd(), "app", "economy-designer", "page.tsx"));
}
