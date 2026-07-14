import { civilizationAges } from "@/data/civilization-identity";
import { contentPacks, type ContentPack, type ContentPackCategory, type ContentPackStatus } from "@/data/content-packs/survival";
import type { AiAgentLibraryState } from "@/lib/ai-agents";
import type { AssetProductionState, MissingAssetRequirement, ProductionAsset, ProductionTaskRecord } from "@/lib/assets/asset-production";
import type { EraArtSummaryByEra } from "@/lib/assets/era-art-inventory";
import type { ComponentDesignSummary, ComponentLibraryState } from "@/lib/component-library";
import { productionTasksForScaffold, type ContentAuthoringState, type EraScaffold } from "@/lib/content-authoring/templates";
import type { ScreenDesignerState, ScreenDesignSummary } from "@/lib/screen-designer";
import { buildUpgradeArtReport, type UpgradeArtReport } from "@/lib/upgrades/art-previews";
import type { Building, BuildingChain, GameData, ResearchNode, ResourceCatalogItem, UnlockMatrixRow } from "@/types/schema";

export type ProductionPriority = "Critical" | "High" | "Medium" | "Low";
export type ProductionQueueItem = {
  id: string;
  title: string;
  priority: ProductionPriority;
  type: "Asset" | "Research" | "Building" | "Resource" | "Mission" | "Event" | "Production Chain" | "Screen Design" | "Component" | "AI Agent";
  status: string;
  era: string;
  href: string;
  reason: string;
  blockers: string[];
};

export type ProductionMetric = {
  label: string;
  value: number;
  complete: number;
  total: number;
  detail: string;
};

export type ProductionKanbanColumn = {
  id: "backlog" | "ready" | "in_progress" | "review" | "approved" | "published" | "done";
  title: string;
  cards: ProductionQueueItem[];
};

export type ProductionBlocker = {
  id: string;
  title: string;
  type: string;
  era: string;
  blockers: Array<{ label: string; done: boolean }>;
};

export type ProductionReport = {
  label: string;
  count: number;
  href: string;
  severity: ProductionPriority;
  description: string;
};

export type ProductionTimeline = {
  label: "Yesterday" | "Today" | "This Week" | "This Month";
  assetsCompleted: number;
  researchCompleted: number;
  buildingsCompleted: number;
  artPublished: number;
};

export type EraProductionHeatmap = {
  id: string;
  displayName: string;
  completion: number;
  research: number;
  buildings: number;
  art: number;
  status?: "Complete" | "In Progress" | "Needs Work";
  contentPackId?: string;
  contentPackStatus?: ContentPackStatus;
  contentPackCompletion?: number;
  outstandingWork?: number;
  draftScaffoldId?: string;
  draftItemCount?: number;
  estimatedHours?: number;
  categoryScores?: Array<{ label: string; value: number }>;
};

export type ProductionPlan = {
  overallCompletion: number;
  metrics: ProductionMetric[];
  workQueue: Record<ProductionPriority, ProductionQueueItem[]>;
  kanban: ProductionKanbanColumn[];
  blockers: ProductionBlocker[];
  heatmap: EraProductionHeatmap[];
  timeline: ProductionTimeline[];
  reports: ProductionReport[];
  generatedAt: string;
};

const kanbanColumns: ProductionKanbanColumn["id"][] = ["backlog", "ready", "in_progress", "review", "approved", "published", "done"];
const completePackStatuses: ContentPackStatus[] = ["Complete", "Approved", "Published", "Ready"];
const contentPackCategoryLabels: Record<ContentPackCategory, string> = {
  resources: "Resources",
  buildings: "Buildings",
  research: "Research",
  productionChains: "Chains",
  missions: "Missions",
  events: "Events",
  collectibles: "Collectibles",
  art: "Art",
  audio: "Audio",
  ui: "UI",
  balance: "Balance",
  progression: "Progression"
};

function clamp(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? Math.round(value) : 0));
}

function percent(complete: number, total: number) {
  return total ? clamp((complete / total) * 100) : 0;
}

function ageId(value: string) {
  const normalized = value.toLowerCase().replace(/\s+age$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized === "space" ? "space-age" : normalized;
}

function displayAge(value: string) {
  return value.replace(/\s+age$/i, "") || value;
}

function isCompleteStatus(value: string | null | undefined) {
  const status = String(value ?? "").toLowerCase();
  return Boolean(status) && !/(missing|blocked|draft|open|todo|needs|pending)/.test(status);
}

function contentPackItemComplete(status: ContentPackStatus) {
  return completePackStatuses.includes(status);
}

function contentPackItems(pack: ContentPack) {
  return Object.values(pack.categories).flat();
}

function contentPackCategoryScores(pack: ContentPack) {
  return Object.entries(pack.categories).map(([category, items]) => ({
    category: category as ContentPackCategory,
    label: contentPackCategoryLabels[category as ContentPackCategory],
    complete: items.filter((item) => contentPackItemComplete(item.status)).length,
    total: items.length,
    value: percent(items.filter((item) => contentPackItemComplete(item.status)).length, items.length)
  }));
}

function contentPackScore(pack: ContentPack) {
  const items = contentPackItems(pack);
  return {
    complete: items.filter((item) => contentPackItemComplete(item.status)).length,
    total: items.length,
    value: percent(items.filter((item) => contentPackItemComplete(item.status)).length, items.length)
  };
}

function completeContentPackForEra(eraId: string) {
  return contentPacks.find((pack) => pack.eraId === eraId && contentPackScore(pack).value >= 100);
}

function isCoveredByCompleteContentPack(item: ProductionQueueItem) {
  const eraId = ageId(item.era);
  return Boolean(completeContentPackForEra(eraId) || contentPacks.some((pack) => contentPackScore(pack).value >= 100 && item.title.toLowerCase().includes(pack.eraName.toLowerCase())));
}

function assetComplete(asset: ProductionAsset) {
  return asset.productionStatus === "published" || asset.approvalStatus === "approved" || asset.completionPercent >= 100;
}

function priorityFor(item: { required?: boolean; blocker?: boolean; optional?: boolean; status?: string }): ProductionPriority {
  if (item.blocker) return "Critical";
  if (item.required) return "High";
  if (item.optional) return "Medium";
  return item.status?.toLowerCase().includes("enhancement") ? "Low" : "Low";
}

function queueItem(input: Omit<ProductionQueueItem, "priority"> & { priority?: ProductionPriority; required?: boolean; blocker?: boolean; optional?: boolean }): ProductionQueueItem {
  return {
    ...input,
    priority: input.priority ?? priorityFor(input)
  };
}

function groupQueue(items: ProductionQueueItem[]) {
  const grouped: Record<ProductionPriority, ProductionQueueItem[]> = { Critical: [], High: [], Medium: [], Low: [] };
  for (const item of items.sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority))) {
    grouped[item.priority].push(item);
  }
  return grouped;
}

function priorityRank(priority: ProductionPriority) {
  return { Critical: 0, High: 1, Medium: 2, Low: 3 }[priority];
}

function chainComplete(chain: BuildingChain) {
  return [chain.level_1, chain.level_2, chain.level_3, chain.level_4, chain.level_5].every(Boolean);
}

function resourceComplete(resource: ResourceCatalogItem) {
  return Boolean(resource.id && resource.resource_name && resource.description && resource.category && resource.rarity);
}

function researchComplete(research: ResearchNode) {
  return isCompleteStatus(research.status) && Boolean(research.icon_name || research.asset_id);
}

function buildingComplete(building: Building) {
  return Boolean(building.name && building.description && (building.icon_name || building.asset_id) && building.unlock_research_id);
}

function unlockComplete(row: UnlockMatrixRow) {
  return isCompleteStatus(row.implementation_status) && Boolean(row.unlock_id || row.unlock_name);
}

function assetStatusToKanban(asset: ProductionAsset): ProductionKanbanColumn["id"] {
  if (asset.productionStatus === "published" || asset.status.toLowerCase() === "published") return "published";
  if (asset.approvalStatus === "approved") return "approved";
  if (asset.status.toLowerCase() === "review" || asset.productionStatus === "in_review") return "review";
  if (asset.sourceFiles.length || asset.derivatives.length) return "in_progress";
  return "backlog";
}

function taskStatusToKanban(task: ProductionTaskRecord): ProductionKanbanColumn["id"] {
  if (task.status === "complete") return "done";
  if (task.status === "in_review") return "review";
  if (task.status === "in_progress") return "in_progress";
  return "ready";
}

function missingRequirementTitle(requirement: MissingAssetRequirement) {
  return `${requirement.objectName} ${requirement.requiredDerivative}`;
}

function assetWorkItems(assetState: AssetProductionState) {
  const items: ProductionQueueItem[] = [];

  for (const requirement of assetState.missingRequirements.slice(0, 80)) {
    items.push(queueItem({
      id: `missing-asset-${requirement.id}`,
      title: `Create ${missingRequirementTitle(requirement)}`,
      type: "Asset",
      status: requirement.currentStatus,
      era: "Art",
      href: "/assets/missing",
      reason: "Required artwork is missing from the production profile.",
      blockers: [`Missing ${requirement.requiredDerivative}`],
      required: true
    }));
  }

  for (const asset of assetState.assets) {
    const preview = assetState.visualPreviewReport.issues.find((issue) => issue.id.includes(asset.id));
    if (preview) {
      items.push(queueItem({
        id: `preview-${asset.id}`,
        title: `${preview.action} for ${asset.name}`,
        type: "Asset",
        status: preview.status,
        era: "Art",
        href: `/assets/${asset.id}?tab=previews`,
        reason: "Visual-first Studio workspaces need an approved thumbnail or preview.",
        blockers: [preview.status === "Stale" ? "Preview is stale" : "Preview is missing"],
        required: true
      }));
    }
    if (asset.approvalStatus === "pending" && asset.derivatives.length) {
      items.push(queueItem({
        id: `review-${asset.id}`,
        title: `Review ${asset.name}`,
        type: "Asset",
        status: "Review",
        era: "Art",
        href: `/assets/${asset.id}?tab=review`,
        reason: "Derivative exists but has not been approved.",
        blockers: [],
        required: true
      }));
    }
    if (asset.approvalStatus === "approved" && !asset.platformMappings.roblox) {
      items.push(queueItem({
        id: `roblox-${asset.id}`,
        title: `Map ${asset.name} to Roblox`,
        type: "Asset",
        status: "Approved",
        era: "Art",
        href: `/assets/${asset.id}?tab=engine_mappings`,
        reason: "Approved art still needs Roblox mapping.",
        blockers: ["Roblox asset ID missing"],
        required: true
      }));
    }
    if (asset.approvalStatus === "approved" && !asset.platformMappings.web) {
      items.push(queueItem({
        id: `web-${asset.id}`,
        title: `Publish ${asset.name} to Web`,
        type: "Asset",
        status: "Approved",
        era: "Art",
        href: `/assets/${asset.id}?tab=engine_mappings`,
        reason: "Approved art needs a public web derivative.",
        blockers: ["Web publish path missing"],
        required: true
      }));
    }
  }

  return items;
}

function aiAgentWorkItems(aiAgentState?: AiAgentLibraryState) {
  const items: ProductionQueueItem[] = [];
  if (!aiAgentState) return items;

  for (const agent of aiAgentState.records) {
    const missingSlots = agent.artworkSlots.filter((slot) => slot.required && !["Approved", "Published"].includes(slot.status));
    for (const slot of missingSlots) {
      items.push(queueItem({
        id: `ai-agent-art-${agent.id}-${slot.id}`,
        title: `Create ${agent.shortDisplayName} ${slot.label}`,
        type: "AI Agent",
        status: slot.status,
        era: "AI Agent",
        href: "/ai-agents",
        reason: "Required AI Agent state artwork is missing from the canonical companion library.",
        blockers: [`${slot.minimumDimensions} minimum`, "Alpha required", `${slot.derivativePresetIds.length} derivatives required`],
        priority: agent.defaultForNewPlayers ? "High" : "Medium"
      }));
    }
  }

  return items;
}

function aiAgentComplete(agentState?: AiAgentLibraryState) {
  if (!agentState) return { complete: 0, total: 1, value: 0 };
  const complete = agentState.records.filter((agent) =>
    agent.publishState === "published"
    && agent.artworkSlots.filter((slot) => slot.required).every((slot) => ["Approved", "Published"].includes(slot.status))
  ).length;
  return { complete, total: Math.max(1, agentState.records.length), value: percent(complete, agentState.records.length) };
}

function upgradeArtWorkItems(report: UpgradeArtReport) {
  const items: ProductionQueueItem[] = [];
  for (const item of report.items.filter((row) => row.matchStatus !== "matched" || !row.resolvedPreviewUrl).slice(0, 60)) {
    items.push(queueItem({
      id: `upgrade-art-${item.upgradeId}`,
      title: item.matchStatus === "ambiguous" ? `Review upgrade icon candidates for ${item.displayName}` : `Create upgrade icon for ${item.displayName}`,
      type: "Asset",
      status: item.previewStatus,
      era: "Upgrade Art",
      href: "/upgrades",
      reason: item.missingReason || "Upgrade workspace needs an actual icon preview instead of a generic placeholder.",
      blockers: item.matchStatus === "ambiguous" ? ["Ambiguous imported-art match"] : ["Upgrade icon missing", "Preview derivative missing"],
      priority: item.matchStatus === "ambiguous" ? "Medium" : "High"
    }));
  }
  return items;
}

function contentWorkItems(data: GameData) {
  const items: ProductionQueueItem[] = [];

  for (const row of data.research.filter((item) => !researchComplete(item)).slice(0, 40)) {
    items.push(queueItem({
      id: `research-${row.id}`,
      title: `Finish ${row.name}`,
      type: "Research",
      status: row.status || "Missing",
      era: displayAge(row.era),
      href: "/research",
      reason: "Research node needs complete status and usable art/link data.",
      blockers: [row.status ? "" : "Status missing", row.icon_name || row.asset_id ? "" : "Icon or asset missing"].filter(Boolean),
      blocker: !row.status
    }));
  }

  for (const row of data.buildings.filter((item) => !buildingComplete(item)).slice(0, 40)) {
    items.push(queueItem({
      id: `building-${row.id}`,
      title: `Finish ${row.name}`,
      type: "Building",
      status: "Needs Work",
      era: displayAge(row.era),
      href: "/buildings",
      reason: "Building needs unlock and art/model readiness.",
      blockers: [row.unlock_research_id ? "" : "Unlock research missing", row.icon_name || row.asset_id ? "" : "Card/icon art missing"].filter(Boolean),
      blocker: !row.unlock_research_id
    }));
  }

  for (const row of data.building_chains.filter((item) => !chainComplete(item)).slice(0, 20)) {
    items.push(queueItem({
      id: `chain-${row.id}`,
      title: `Complete ${row.chain}`,
      type: "Production Chain",
      status: "Needs Work",
      era: "Systems",
      href: "/building-chains",
      reason: "Production chain has empty level slots.",
      blockers: ["Missing chain level"],
      blocker: true
    }));
  }

  if (!("missions" in data)) {
    items.push(queueItem({
      id: "mission-table",
      title: "Create canonical mission production records",
      type: "Mission",
      status: "Missing",
      era: "Studio",
      href: "/missions",
      reason: "Missions exist as procedural workspace output, but no canonical mission table is present.",
      blockers: ["Canonical mission table missing"],
      blocker: true
    }));
  }

  items.push(queueItem({
    id: "event-table",
    title: "Create canonical event production records",
    type: "Event",
    status: "Missing",
    era: "Studio",
    href: "/universe-timeline",
    reason: "Timeline events exist, but production events are not tracked as content records yet.",
    blockers: ["Canonical event content table missing"],
    blocker: true
  }));

  return items;
}

function buildKanban(items: ProductionQueueItem[], assetState: AssetProductionState): ProductionKanbanColumn[] {
  const columnMap = new Map<ProductionKanbanColumn["id"], ProductionQueueItem[]>();
  for (const column of kanbanColumns) columnMap.set(column, []);

  for (const task of assetState.productionTasks) {
    columnMap.get(taskStatusToKanban(task))?.push(queueItem({
      id: task.id,
      title: task.requirementType ? `${task.linkedObject} ${task.requirementType}` : task.linkedObject,
      type: "Asset",
      status: task.status,
      era: task.era,
      href: task.assetLink || "/assets",
      reason: task.notes || "Generated production task.",
      blockers: [],
      priority: task.priority === "critical" ? "Critical" : task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Low"
    }));
  }

  for (const asset of assetState.assets.slice(0, 80)) {
    columnMap.get(assetStatusToKanban(asset))?.push(queueItem({
      id: `asset-${asset.id}`,
      title: asset.name,
      type: "Asset",
      status: asset.productionStatus,
      era: asset.category,
      href: `/assets/${asset.id}`,
      reason: asset.publishBlockers[0] ?? "Asset production status.",
      blockers: asset.publishBlockers,
      priority: asset.publishBlockers.length ? "High" : asset.approvalStatus === "approved" ? "Medium" : "Low"
    }));
  }

  for (const item of items) {
    const column: ProductionKanbanColumn["id"] = item.priority === "Critical" ? "backlog" : item.status.toLowerCase().includes("review") ? "review" : "ready";
    columnMap.get(column)?.push(item);
  }

  return kanbanColumns.map((id) => ({
    id,
    title: id.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    cards: (columnMap.get(id) ?? []).slice(0, 8)
  }));
}

function categoryScoresForScaffold(scaffold: EraScaffold) {
  const categoryMap = [
    ["Resources", "resource"],
    ["Buildings", "building"],
    ["Research", "research"],
    ["Chains", "production_chain"],
    ["Missions", "mission"],
    ["Events", "event"]
  ] as const;
  return categoryMap.map(([label, type]) => ({
    label,
    value: scaffold.items.some((item) => item.type === type) ? 0 : 0
  }));
}

function buildHeatmap(data: GameData, eraSummary: EraArtSummaryByEra, authoringState?: ContentAuthoringState): EraProductionHeatmap[] {
  return civilizationAges.map((age) => {
    const id = ageId(age.name);
    const scaffold = authoringState?.scaffolds.find((row) => row.eraId === id);
    const researchRows = data.research.filter((row) => ageId(row.era) === id);
    const buildingRows = data.buildings.filter((row) => ageId(row.era) === id);
    const research = percent(researchRows.filter(researchComplete).length, researchRows.length);
    const buildings = percent(buildingRows.filter(buildingComplete).length, buildingRows.length);
    const art = eraSummary[id]?.required ? percent(eraSummary[id].complete, eraSummary[id].required) : 0;
    const pack = contentPacks.find((contentPack) => contentPack.eraId === id);
    if (pack) {
      const packScore = contentPackScore(pack);
      const categoryScores = contentPackCategoryScores(pack);
      return {
        id,
        displayName: displayAge(age.name),
        completion: packScore.value,
        research: categoryScores.find((score) => score.category === "research")?.value ?? research,
        buildings: categoryScores.find((score) => score.category === "buildings")?.value ?? buildings,
        art: categoryScores.find((score) => score.category === "art")?.value ?? art,
        status: packScore.value >= 100 ? "Complete" : "In Progress",
        contentPackId: pack.id,
        contentPackStatus: pack.status,
        contentPackCompletion: packScore.value,
        outstandingWork: Math.max(0, packScore.total - packScore.complete),
        categoryScores: categoryScores.map((score) => ({ label: score.label, value: score.value }))
      };
    }
    if (scaffold) {
      const baseCompletion = clamp((research + buildings + art) / 3);
      return {
        id,
        displayName: displayAge(age.name),
        completion: baseCompletion,
        research,
        buildings,
        art,
        status: "In Progress",
        draftScaffoldId: scaffold.id,
        draftItemCount: scaffold.items.length,
        estimatedHours: scaffold.estimates.hours,
        outstandingWork: scaffold.items.length,
        categoryScores: categoryScoresForScaffold(scaffold)
      };
    }
    return {
      id,
      displayName: displayAge(age.name),
      completion: clamp((research + buildings + art) / 3),
      research,
      buildings,
      art,
      status: clamp((research + buildings + art) / 3) >= 100 ? "Complete" : "Needs Work"
    };
  });
}

function buildBlockers(data: GameData, assetState: AssetProductionState): ProductionBlocker[] {
  const resources = new Set(data.resource_catalog.map((resource) => resource.id));
  const research = new Set(data.research.map((item) => item.id));
  const survivalPackComplete = Boolean(completeContentPackForEra("survival"));
  const missingAsset = assetState.missingRequirements[0];
  const building = data.buildings.find((row) => !buildingComplete(row)) ?? data.buildings[0];
  const chain = data.building_chains.find((row) => !chainComplete(row)) ?? data.building_chains[0];

  return [
    building ? {
      id: `blocker-${building.id}`,
      title: building.name,
      type: "Building",
      era: displayAge(building.era),
      blockers: [
        { label: "Unlock research", done: Boolean(building.unlock_research_id && research.has(building.unlock_research_id)) },
        { label: "Building icon/card art", done: Boolean(building.icon_name || building.asset_id) },
        { label: "Production chain", done: Boolean(building.upgrade_chain || building.district_id) },
        { label: "Model/render", done: Boolean(building.model_name || building.asset_id) }
      ]
    } : null,
    chain ? {
      id: `blocker-${chain.id}`,
      title: chain.chain,
      type: "Production Chain",
      era: chain.district || "Systems",
      blockers: [
        { label: "Level 1 building", done: Boolean(chain.level_1) },
        { label: "Level 2 building", done: Boolean(chain.level_2) },
        { label: "Level 3 building", done: Boolean(chain.level_3) },
        { label: "Level 4 building", done: Boolean(chain.level_4) },
        { label: "Level 5 building", done: Boolean(chain.level_5) }
      ]
    } : null,
    missingAsset ? {
      id: `blocker-${missingAsset.id}`,
      title: missingAsset.objectName,
      type: "Asset",
      era: missingAsset.objectType,
      blockers: [
        { label: "Canonical record", done: true },
        { label: `${missingAsset.requiredDerivative} derivative`, done: false },
        { label: "Review approval", done: false },
        { label: "Engine mapping", done: false }
      ]
    } : null,
    {
      id: "blocker-resource-chain",
      title: "Resource Production Chain",
      type: "Resource",
      era: "Economy",
      blockers: [
        { label: "Resource catalog", done: resources.size > 0 },
        { label: "Production chains", done: data.building_chains.some(chainComplete) },
        { label: "Mission rewards", done: survivalPackComplete },
        { label: "Event hooks", done: survivalPackComplete }
      ]
    }
  ].filter(Boolean) as ProductionBlocker[];
}

function buildReports(data: GameData, assetState: AssetProductionState, authoringState?: ContentAuthoringState, screenState?: ScreenDesignerState, componentState?: ComponentLibraryState, upgradeArtReport?: UpgradeArtReport, aiAgentState?: AiAgentLibraryState): ProductionReport[] {
  const missingResearch = data.research.filter((row) => !researchComplete(row)).length;
  const missingBuildings = data.buildings.filter((row) => !buildingComplete(row)).length;
  const missingChains = data.building_chains.filter((row) => !chainComplete(row)).length;
  const missingResources = data.resource_catalog.filter((row) => !resourceComplete(row)).length;
  const survivalPack = contentPacks.find((pack) => pack.eraId === "survival");
  const survivalScores = survivalPack ? contentPackCategoryScores(survivalPack) : [];
  const survivalCategoryMissing = (category: ContentPackCategory) => {
    const score = survivalScores.find((item) => item.category === category);
    return score ? Math.max(0, score.total - score.complete) : 1;
  };
  const missingMissions = survivalCategoryMissing("missions");
  const missingEvents = survivalCategoryMissing("events");
  const missingCollectibles = survivalCategoryMissing("collectibles");
  const draftScaffoldCount = authoringState?.scaffolds.length ?? 0;
  const screenAssetBlockers = screenState?.stats.blockedByMissingAssets ?? 0;
  const screenDataBlockers = screenState?.stats.blockedByMissingData ?? 0;
  const screenInteractionBlockers = screenState?.stats.blockedByMissingInteractionSpecs ?? 0;
  const componentAssetBlockers = componentState?.stats.missingAssets ?? 0;
  const componentStateBlockers = componentState?.stats.missingStates ?? 0;
  const componentBreakingChanges = componentState?.stats.breakingChanges ?? 0;
  const componentPreviewReview = componentState?.stats.componentPreviewsNeedsReview ?? 0;
  const previewGaps = assetState.visualPreviewReport.previewMissing + assetState.visualPreviewReport.previewStale + assetState.visualPreviewReport.lowResolution;
  const upgradeArtGaps = (upgradeArtReport?.stats.missing ?? 0) + (upgradeArtReport?.stats.ambiguous ?? 0);
  const mobileScreenBlockers = (screenState?.stats.safeAreaBlockers ?? 0) + (screenState?.stats.touchBlockers ?? 0) + (screenState?.stats.mobileAssetBlockers ?? 0);
  const mobileComponentBlockers = (componentState?.stats.touchBlockers ?? 0) + (componentState?.stats.safeAreaBlockers ?? 0);
  const missingAgentCoreArt = (aiAgentState?.stats.missingOpenEyeArt ?? 0) + (aiAgentState?.stats.missingBlinkArt ?? 0) + (aiAgentState?.stats.missingOfflineArt ?? 0);

  return [
    { label: "Missing Assets", count: assetState.missingRequirements.length, href: "/assets/missing", severity: "High", description: "Required derivatives or source artwork still missing." },
    { label: "Preview Quality Gaps", count: previewGaps, href: "/assets", severity: previewGaps ? "High" : "Low", description: "Missing, stale, or low-resolution Studio thumbnails/previews." },
    { label: "Upgrade Art Gaps", count: upgradeArtGaps, href: "/upgrades", severity: upgradeArtGaps ? "High" : "Low", description: "Upgrade records without a resolved real icon preview or needing candidate review." },
    { label: "Missing Research", count: missingResearch, href: "/research", severity: missingResearch ? "High" : "Low", description: "Research nodes needing status, icon, or asset completion." },
    { label: "Missing Buildings", count: missingBuildings, href: "/buildings", severity: missingBuildings ? "High" : "Low", description: "Buildings missing unlocks or visual production links." },
    { label: "Missing Missions", count: missingMissions, href: "/missions", severity: missingMissions ? "Critical" : "Low", description: "Active content-pack mission records needing production completion." },
    { label: "Missing Events", count: missingEvents, href: "/universe-timeline", severity: missingEvents ? "Critical" : "Low", description: "Active content-pack event records needing production completion." },
    { label: "Missing Production Chains", count: missingChains, href: "/building-chains", severity: missingChains ? "Critical" : "Low", description: "Building chains with missing level definitions." },
    { label: "Missing Collectibles", count: missingCollectibles, href: "/collectibles", severity: missingCollectibles ? "Medium" : "Low", description: "Active content-pack collectible records needing production completion." },
    { label: "Missing Resources", count: missingResources, href: "/resource-catalog", severity: missingResources ? "High" : "Low", description: "Resource catalog records with incomplete required fields." },
    { label: "Draft Era Scaffolds", count: draftScaffoldCount, href: "/content-authoring", severity: draftScaffoldCount ? "Medium" : "Low", description: "Generated era starter kits waiting for authoring and promotion." },
    { label: "Screen Asset Blockers", count: screenAssetBlockers, href: "/screen-designer", severity: screenAssetBlockers ? "High" : "Low", description: "Screen designs blocked by missing, unpublished, or unapproved visual assets." },
    { label: "Screen Data Blockers", count: screenDataBlockers, href: "/screen-designer", severity: screenDataBlockers ? "Critical" : "Low", description: "Screen designs depending on missing or player-runtime data requirements." },
    { label: "Screen Interaction Gaps", count: screenInteractionBlockers, href: "/screen-designer", severity: screenInteractionBlockers ? "Medium" : "Low", description: "Screen designs with incomplete states, interactions, motion, review, or accessibility checklist items." },
    { label: "Component Asset Blockers", count: componentAssetBlockers, href: "/component-library", severity: componentAssetBlockers ? "High" : "Low", description: "Shared UI components with missing, unpublished, or unapproved semantic assets." },
    { label: "Component State Gaps", count: componentStateBlockers, href: "/component-library", severity: componentStateBlockers ? "Medium" : "Low", description: "Shared UI components missing required state treatments." },
    { label: "Component Preview Review", count: componentPreviewReview, href: "/component-library", severity: componentPreviewReview ? "Medium" : "Low", description: "Generated component specimens waiting for human review before approval." },
    { label: "Mobile Screen Blockers", count: mobileScreenBlockers, href: "/screen-designer", severity: mobileScreenBlockers ? "High" : "Low", description: "Screens needing safe-area, touch, iOS, Android, or mobile asset readiness." },
    { label: "Mobile Component Blockers", count: mobileComponentBlockers, href: "/component-library", severity: mobileComponentBlockers ? "High" : "Low", description: "Shared components needing touch, compact, safe-area, or mobile implementation readiness." },
    { label: "AI Agent Core Art", count: missingAgentCoreArt, href: "/ai-agents", severity: missingAgentCoreArt ? "High" : "Low", description: "Default/agent open-eye, blink, and offline states needing transparent source art and derivatives." },
    { label: "AI Agent Review", count: aiAgentState?.stats.pendingReview ?? 0, href: "/ai-agents", severity: aiAgentState?.stats.pendingReview ? "Medium" : "Low", description: "AI Agent derivatives waiting for review before publication." },
    { label: "Store Art Readiness", count: assetState.missingRequirements.filter((item) => /store|app icon|splash|launch|wordmark|loading/i.test(`${item.objectName} ${item.requiredDerivative}`)).length, href: "/assets/missing", severity: "Medium", description: "Mobile store, app brand, launch, and loading artwork requirements needing source art." },
    { label: "Component Breaking Changes", count: componentBreakingChanges, href: "/component-library", severity: componentBreakingChanges ? "Critical" : "Low", description: "Major component changes requiring dependent screen review." }
  ];
}

function dateWindow(now: Date, label: ProductionTimeline["label"]) {
  const start = new Date(now);
  if (label === "Today") start.setHours(0, 0, 0, 0);
  if (label === "Yesterday") {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
  }
  if (label === "This Week") start.setDate(start.getDate() - 7);
  if (label === "This Month") start.setDate(start.getDate() - 30);
  const end = new Date(now);
  if (label === "Yesterday") {
    end.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

function inWindow(value: string | undefined, start: Date, end: Date) {
  if (!value) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date >= start && date <= end;
}

function buildTimeline(data: GameData, assetState: AssetProductionState): ProductionTimeline[] {
  const now = new Date();
  return (["Yesterday", "Today", "This Week", "This Month"] as ProductionTimeline["label"][]).map((label) => {
    const { start, end } = dateWindow(now, label);
    return {
      label,
      assetsCompleted: assetState.assets.filter((asset) => inWindow(asset.approvedAt || asset.publishedAt, start, end)).length,
      researchCompleted: data.research.filter((row) => researchComplete(row) && inWindow(row.notes?.match(/\d{4}-\d{2}-\d{2}/)?.[0], start, end)).length,
      buildingsCompleted: data.buildings.filter((row) => buildingComplete(row) && inWindow(row.notes?.match(/\d{4}-\d{2}-\d{2}/)?.[0], start, end)).length,
      artPublished: assetState.assets.filter((asset) => inWindow(asset.publishedAt, start, end)).length
    };
  });
}

function scaffoldWorkItems(authoringState?: ContentAuthoringState) {
  if (!authoringState?.scaffolds.length) return [];
  return authoringState.scaffolds.flatMap((scaffold) =>
    productionTasksForScaffold(scaffold).slice(0, 18).map((task) => queueItem({
      id: task.id,
      title: task.title,
      type: task.type === "resource" ? "Resource" : task.type === "building" ? "Building" : task.type === "research" ? "Research" : task.type === "mission" ? "Mission" : task.type === "event" ? "Event" : "Production Chain",
      status: task.status,
      era: scaffold.eraName,
      href: "/content-authoring",
      reason: `${scaffold.eraName} draft was generated by the Content Authoring starter kit.`,
      blockers: task.blockers,
      priority: task.type === "research" || task.type === "building" || task.type === "resource" ? "High" : "Medium"
    }))
  );
}

function screenDesignComplete(screen: ScreenDesignSummary) {
  return screen.approvalStatus === "Approved" || screen.status === "Implemented";
}

function screenDesignWorkItems(screenState?: ScreenDesignerState) {
  if (!screenState) return [];
  const items: ProductionQueueItem[] = [];
  for (const screen of screenState.screens) {
    if (screen.status === "Not Started") {
      items.push(queueItem({
        id: `screen-start-${screen.screenId}`,
        title: `Start ${screen.displayName} screen design`,
        type: "Screen Design",
        status: screen.status,
        era: "UX",
        href: `/screen-designer/${screen.screenId}`,
        reason: "Major game screen has no approved design specification.",
        blockers: ["Layout", "components", "data requirements", "states", "interactions"],
        priority: "High"
      }));
      continue;
    }
    if (screen.missingAssets > 0 || screen.unresolvedDataRequirements > 0) {
      items.push(queueItem({
        id: `screen-blocker-${screen.screenId}`,
        title: `Resolve ${screen.displayName} design blockers`,
        type: "Screen Design",
        status: screen.status,
        era: "UX",
        href: `/screen-designer/${screen.screenId}`,
        reason: "Screen design has unresolved asset or data requirements.",
        blockers: [`${screen.missingAssets} missing assets`, `${screen.unresolvedDataRequirements} data gaps`].filter((item) => !item.startsWith("0 ")),
        priority: screen.unresolvedDataRequirements > 0 ? "Critical" : "High"
      }));
    }
    if (screen.checklistComplete < screen.checklistTotal) {
      items.push(queueItem({
        id: `screen-checklist-${screen.screenId}`,
        title: `Finish ${screen.displayName} design checklist`,
        type: "Screen Design",
        status: screen.status,
        era: "UX",
        href: `/screen-designer/${screen.screenId}`,
        reason: "Approval checklist is incomplete.",
        blockers: [`${screen.checklistTotal - screen.checklistComplete} checklist items open`],
        priority: "Medium"
      }));
    }
  }
  return items;
}

function componentComplete(component: ComponentDesignSummary) {
  return component.approvalStatus === "Approved" || component.status === "Implemented";
}

function componentWorkItems(componentState?: ComponentLibraryState) {
  if (!componentState) return [];
  const items: ProductionQueueItem[] = [];
  for (const component of componentState.components) {
    if (component.status === "Not Started" || component.status === "Draft") {
      items.push(queueItem({
        id: `component-start-${component.componentId}`,
        title: `Finish ${component.displayName} component spec`,
        type: "Component",
        status: component.status,
        era: "UI",
        href: `/component-library/${component.componentId}`,
        reason: "Reusable game UI component needs anatomy, state, interaction, responsive, and handoff coverage.",
        blockers: [`${component.checklistTotal - component.checklistComplete} guardrails open`],
        priority: "High"
      }));
    }
    if (component.missingAssets > 0 || component.missingStates > 0) {
      items.push(queueItem({
        id: `component-blocker-${component.componentId}`,
        title: `Resolve ${component.displayName} component blockers`,
        type: "Component",
        status: component.status,
        era: "UI",
        href: `/component-library/${component.componentId}`,
        reason: "Component has missing assets or required states.",
        blockers: [`${component.missingAssets} missing assets`, `${component.missingStates} missing states`].filter((item) => !item.startsWith("0 ")),
        priority: component.missingAssets > 0 ? "High" : "Medium"
      }));
    }
    if (component.visualPreview.status === "Needs Review") {
      items.push(queueItem({
        id: `component-preview-review-${component.componentId}`,
        title: `Review ${component.displayName} generated preview`,
        type: "Component",
        status: "Needs Review",
        era: "UI",
        href: `/component-library/${component.componentId}`,
        reason: "Studio specimen preview was generated from component metadata and needs human review before approval or publication.",
        blockers: ["Implementation screenshot capture unavailable", "Preview approval required"],
        priority: "Medium"
      }));
    }
    if (component.breakingChanges.some((change) => !change.resolved)) {
      items.push(queueItem({
        id: `component-breaking-${component.componentId}`,
        title: `Review ${component.displayName} breaking change`,
        type: "Component",
        status: "Breaking Change",
        era: "UI",
        href: `/component-library/${component.componentId}`,
        reason: "Major component change can affect approved screen designs.",
        blockers: component.breakingChanges.flatMap((change) => change.affectedScreenIds).slice(0, 4),
        priority: "Critical"
      }));
    }
  }
  return items;
}

function mobileReadinessWorkItems(screenState?: ScreenDesignerState, componentState?: ComponentLibraryState) {
  const items: ProductionQueueItem[] = [];
  for (const screen of screenState?.screens ?? []) {
    if (screen.mobileReadiness.safeAreaReadiness !== "Ready" || screen.mobileReadiness.touchReadiness !== "Ready" || screen.mobileReadiness.mobileDesignStatus === "Not Started") {
      items.push(queueItem({
        id: `mobile-screen-${screen.screenId}`,
        title: `Prepare ${screen.displayName} mobile layout`,
        type: "Screen Design",
        status: screen.mobileReadiness.mobileDesignStatus,
        era: "Mobile",
        href: `/screen-designer/${screen.screenId}`,
        reason: "iOS and Android presentation need landscape, safe-area, touch, and asset readiness before client implementation.",
        blockers: [
          screen.mobileReadiness.safeAreaReadiness !== "Ready" ? "Safe-area review" : "",
          screen.mobileReadiness.touchReadiness !== "Ready" ? "Touch readiness" : "",
          screen.mobileReadiness.mobileAssetReadiness !== "Ready" ? "Mobile assets" : ""
        ].filter(Boolean),
        priority: ["welcome", "login", "dashboard", "settings", "account", "cloud-saves", "save-conflict"].includes(screen.screenId) ? "High" : "Medium"
      }));
    }
  }
  for (const component of componentState?.components ?? []) {
    if (component.mobileReadiness.touchVariantStatus !== "Ready" || component.mobileReadiness.compactVariantStatus !== "Ready") {
      items.push(queueItem({
        id: `mobile-component-${component.componentId}`,
        title: `Define ${component.displayName} mobile variants`,
        type: "Component",
        status: component.mobileReadiness.touchVariantStatus,
        era: "Mobile UI",
        href: `/component-library/${component.componentId}`,
        reason: "Shared UI components need compact/touch variants for Capacitor iOS and Android shells.",
        blockers: ["Touch variant", "Compact variant", component.mobileReadiness.safeAreaBehavior === "Needs Review" ? "Safe-area behavior" : ""].filter(Boolean),
        priority: component.category === "HUD" || component.category === "Navigation" ? "High" : "Medium"
      }));
    }
  }
  return items.slice(0, 80);
}

export function buildProductionPlan(data: GameData, assetState: AssetProductionState, eraSummary: EraArtSummaryByEra, authoringState?: ContentAuthoringState, screenState?: ScreenDesignerState, componentState?: ComponentLibraryState, aiAgentState?: AiAgentLibraryState): ProductionPlan {
  const upgradeArtReport = buildUpgradeArtReport(data.upgrades, assetState.assets);
  const artComplete = assetState.assets.filter(assetComplete).length;
  const artTotal = Math.max(1, assetState.assets.length + assetState.missingRequirements.length);
  const researchCompleteCount = data.research.filter(researchComplete).length;
  const buildingCompleteCount = data.buildings.filter(buildingComplete).length;
  const chainCompleteCount = data.building_chains.filter(chainComplete).length;
  const resourceCompleteCount = data.resource_catalog.filter(resourceComplete).length;
  const unlockCompleteCount = data.unlock_matrix.filter(unlockComplete).length;
  const survivalPack = contentPacks.find((pack) => pack.eraId === "survival");
  const survivalScore = survivalPack ? contentPackScore(survivalPack) : { complete: 0, total: 0, value: 0 };
  const survivalMissionTotal = survivalPack?.categories.missions.length ?? 0;
  const survivalEventTotal = survivalPack?.categories.events.length ?? 0;
  const survivalMissionComplete = survivalPack?.categories.missions.filter((item) => contentPackItemComplete(item.status)).length ?? 0;
  const survivalEventComplete = survivalPack?.categories.events.filter((item) => contentPackItemComplete(item.status)).length ?? 0;
  const draftScaffoldItems = authoringState?.stats.draftItemCount ?? 0;
  const screenCompleteCount = screenState?.screens.filter(screenDesignComplete).length ?? 0;
  const screenTotal = screenState?.screens.length ?? 0;
  const componentCompleteCount = componentState?.components.filter(componentComplete).length ?? 0;
  const componentTotal = componentState?.components.length ?? 0;
  const componentPreviewGenerated = componentState?.stats.componentPreviewsGenerated ?? 0;
  const componentPreviewTotal = componentPreviewGenerated + (componentState?.stats.componentPreviewsPending ?? 0);
  const mobileReadyScreens = screenState?.stats.mobileReadyScreens ?? 0;
  const mobileScreenTotal = screenState?.stats.total ?? 0;
  const mobileReadyComponents = componentState?.stats.mobileReadyComponents ?? 0;
  const mobileComponentTotal = componentState?.stats.total ?? 0;
  const aiAgentScore = aiAgentComplete(aiAgentState);
  const previewReady = assetState.visualPreviewReport.previewReady;
  const previewTotal = Math.max(1, assetState.visualPreviewReport.totalVisualRecords);
  const upgradeArtReady = upgradeArtReport.stats.previewReady;
  const upgradeArtTotal = Math.max(1, upgradeArtReport.stats.total);

  const metrics: ProductionMetric[] = [
    { label: "Overall Game Completion", complete: 0, total: 0, value: 0, detail: "Average of all production systems." },
    { label: "Era Completion", complete: civilizationAges.filter((age) => (eraSummary[ageId(age.name)]?.complete ?? 0) > 0).length, total: civilizationAges.length, value: 0, detail: "Era research/building/art readiness." },
    { label: "Art Completion", complete: artComplete, total: artTotal, value: percent(artComplete, artTotal), detail: `${artComplete} complete assets, ${assetState.missingRequirements.length} missing requirements.` },
    { label: "Preview Readiness", complete: previewReady, total: previewTotal, value: percent(previewReady, previewTotal), detail: `${assetState.visualPreviewReport.previewMissing} missing, ${assetState.visualPreviewReport.previewStale} stale, ${assetState.visualPreviewReport.lowResolution} low-resolution previews.` },
    { label: "Upgrade Art Readiness", complete: upgradeArtReady, total: upgradeArtTotal, value: percent(upgradeArtReady, upgradeArtTotal), detail: `${upgradeArtReport.stats.missing} missing, ${upgradeArtReport.stats.ambiguous} need review, ${upgradeArtReport.stats.webReady} web-ready upgrade icons.` },
    { label: "Research Completion", complete: researchCompleteCount, total: data.research.length, value: percent(researchCompleteCount, data.research.length), detail: "Complete research nodes with usable icon/asset links." },
    { label: "Building Completion", complete: buildingCompleteCount, total: data.buildings.length, value: percent(buildingCompleteCount, data.buildings.length), detail: "Buildings with unlocks and visual references." },
    { label: "Production Chain Completion", complete: chainCompleteCount, total: data.building_chains.length, value: percent(chainCompleteCount, data.building_chains.length), detail: "Building chains with all level slots filled." },
    { label: "Resource Completion", complete: resourceCompleteCount, total: data.resource_catalog.length, value: percent(resourceCompleteCount, data.resource_catalog.length), detail: "Canonical resources with required identity fields." },
    { label: "Mission Completion", complete: survivalMissionComplete, total: Math.max(1, survivalMissionTotal), value: percent(survivalMissionComplete, survivalMissionTotal), detail: "Authored mission content from active content packs." },
    { label: "Event Completion", complete: survivalEventComplete, total: Math.max(1, survivalEventTotal), value: percent(survivalEventComplete, survivalEventTotal), detail: "Authored event content from active content packs." },
    { label: "Screen Design Completion", complete: screenCompleteCount, total: Math.max(1, screenTotal), value: percent(screenCompleteCount, screenTotal), detail: "Major game screens with approved or implemented Studio design specifications." },
    { label: "Component Library Completion", complete: componentCompleteCount, total: Math.max(1, componentTotal), value: percent(componentCompleteCount, componentTotal), detail: "Reusable game UI components with approved or implemented design-system specifications." },
    { label: "Component Preview Generation", complete: componentPreviewGenerated, total: Math.max(1, componentPreviewTotal), value: percent(componentPreviewGenerated, componentPreviewTotal), detail: `${componentState?.stats.componentPreviewsNeedsReview ?? 0} generated previews need review, ${componentState?.stats.componentPreviewsBlockedByMissingBrowserCapture ?? 0} blocked from implementation screenshot capture.` },
    { label: "Mobile Screen Readiness", complete: mobileReadyScreens, total: Math.max(1, mobileScreenTotal), value: percent(mobileReadyScreens, mobileScreenTotal), detail: `${screenState?.stats.safeAreaBlockers ?? 0} safe-area blockers, ${screenState?.stats.touchBlockers ?? 0} touch blockers, ${screenState?.stats.iosBlockers ?? 0} iOS blockers, ${screenState?.stats.androidBlockers ?? 0} Android blockers.` },
    { label: "Mobile Component Readiness", complete: mobileReadyComponents, total: Math.max(1, mobileComponentTotal), value: percent(mobileReadyComponents, mobileComponentTotal), detail: `${componentState?.stats.touchBlockers ?? 0} touch blockers, ${componentState?.stats.safeAreaBlockers ?? 0} safe-area blockers, ${componentState?.stats.iosBlockers ?? 0} iOS blockers, ${componentState?.stats.androidBlockers ?? 0} Android blockers.` },
    { label: "AI Agent Readiness", complete: aiAgentScore.complete, total: aiAgentScore.total, value: aiAgentScore.value, detail: `${aiAgentState?.stats.missingOpenEyeArt ?? 0} missing open-eye, ${aiAgentState?.stats.missingBlinkArt ?? 0} missing blink, ${aiAgentState?.stats.missingOfflineArt ?? 0} missing offline, ${aiAgentState?.stats.webReady ?? 0} web-ready, ${aiAgentState?.stats.robloxReady ?? 0} Roblox-ready, ${aiAgentState?.stats.mobileReady ?? 0} mobile-ready.` }
  ];
  if (survivalPack) {
    metrics.splice(2, 0, { label: "Survival Content Pack", complete: survivalScore.complete, total: survivalScore.total, value: survivalScore.value, detail: `${survivalPack.title} is ${survivalScore.value}% production-ready.` });
  }
  if (authoringState?.scaffolds.length) {
    metrics.splice(3, 0, { label: "Draft Era Scaffolds", complete: 0, total: draftScaffoldItems, value: 0, detail: `${draftScaffoldItems} generated draft records are ready for authoring.` });
  }

  const heatmap = buildHeatmap(data, eraSummary, authoringState);
  const eraMetric = metrics.find((metric) => metric.label === "Era Completion");
  if (eraMetric) {
    eraMetric.complete = heatmap.filter((era) => era.completion >= 100).length;
    eraMetric.total = heatmap.length;
    eraMetric.value = heatmap.length ? clamp(heatmap.reduce((sum, era) => sum + era.completion, 0) / heatmap.length) : 0;
    eraMetric.detail = `${eraMetric.complete} eras are 100% complete in the Production Dashboard.`;
  }
  const overall = clamp(metrics.filter((metric) => metric.label !== "Overall Game Completion").reduce((sum, metric) => sum + metric.value, 0) / Math.max(1, metrics.length - 1));
  metrics[0] = { ...metrics[0], complete: metrics.reduce((sum, metric) => sum + metric.complete, 0), total: metrics.reduce((sum, metric) => sum + metric.total, 0), value: overall };

  const queue = [...aiAgentWorkItems(aiAgentState), ...mobileReadinessWorkItems(screenState, componentState), ...componentWorkItems(componentState), ...screenDesignWorkItems(screenState), ...scaffoldWorkItems(authoringState), ...upgradeArtWorkItems(upgradeArtReport), ...assetWorkItems(assetState), ...contentWorkItems(data)].filter((item) => !isCoveredByCompleteContentPack(item)).slice(0, 220);
  return {
    overallCompletion: overall,
    metrics,
    workQueue: groupQueue(queue),
    kanban: buildKanban(queue, assetState),
    blockers: buildBlockers(data, assetState),
    heatmap,
    timeline: buildTimeline(data, assetState),
    reports: buildReports(data, assetState, authoringState, screenState, componentState, upgradeArtReport, aiAgentState),
    generatedAt: new Date().toISOString()
  };
}
