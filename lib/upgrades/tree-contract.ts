import type { CivilizationAlignmentScore, Upgrade } from "@/types/schema";
import type {
  EraDefinition,
  ImportIssue,
  UpgradeDefinition,
  UpgradeTreeContract,
  UpgradeTreeEdge,
  UpgradeTreeInfluence,
  UpgradeTreeNode
} from "@/types/runtime";

export const upgradeTreeContractVersion = "upgrade-tree-v1";

const branchDefinitions: UpgradeTreeContract["branches"] = [
  { id: "workforce", displayName: "Workforce", order: 1, preferredLane: "top" },
  { id: "science", displayName: "Science", order: 2, preferredLane: "upper-middle" },
  { id: "technology", displayName: "Technology", order: 3, preferredLane: "lower-middle" },
  { id: "industry", displayName: "Industry", order: 4, preferredLane: "bottom" }
];

const eraBandDefinitions: UpgradeTreeContract["eraBands"] = [
  { id: "survival", canonicalEraId: "survival", sourceEraNames: ["Survival"], displayName: "Survival", order: 1, positionX: 80, width: 1580 },
  { id: "village", canonicalEraId: "ancient", sourceEraNames: ["Village"], displayName: "Village", order: 2, positionX: 1700, width: 1580 },
  { id: "town", canonicalEraId: "medieval", sourceEraNames: ["Town"], displayName: "Town", order: 3, positionX: 3320, width: 1580 },
  { id: "industrial", canonicalEraId: "industrial", sourceEraNames: ["Industrial"], displayName: "Industrial", order: 4, positionX: 4940, width: 1580 },
  { id: "modern", canonicalEraId: "modern", sourceEraNames: ["Modern"], displayName: "Modern", order: 5, positionX: 6560, width: 1580 },
  {
    id: "future",
    canonicalEraId: "space-age",
    sourceEraNames: [
      "Future Core",
      "Eco-Green Utopia",
      "High Tech Singularity",
      "Industrial Empire",
      "Cyberpunk Megacity",
      "Metropolis Prime",
      "Harmony Ascendant"
    ],
    displayName: "Future",
    order: 6,
    positionX: 8180,
    width: 6200
  }
];

const futureCivilizations: UpgradeTreeContract["futureCivilizations"] = [
  { id: "ERA007", displayName: "Eco-Green Utopia", revealCondition: "future_trajectory_revealed" },
  { id: "ERA008", displayName: "High Tech Singularity", revealCondition: "future_trajectory_revealed" },
  { id: "ERA009", displayName: "Industrial Empire", revealCondition: "future_trajectory_revealed" },
  { id: "ERA010", displayName: "Cyberpunk Megacity", revealCondition: "future_trajectory_revealed" }
];

const sourceEraOrder = new Map(
  eraBandDefinitions.flatMap((band) => band.sourceEraNames.map((name) => [name, band.order] as const))
);

const branchY = new Map([
  ["workforce", 130],
  ["science", 350],
  ["technology", 580],
  ["industry", 810]
]);

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function branchId(value: string) {
  const normalized = slug(value);
  if (normalized.includes("work") || normalized.includes("labor")) return "workforce";
  if (normalized.includes("science") || normalized.includes("research")) return "science";
  if (normalized.includes("industry") || normalized.includes("production")) return "industry";
  return "technology";
}

function eraBandFor(sourceEra: string) {
  return eraBandDefinitions.find((band) => band.sourceEraNames.includes(sourceEra)) ?? eraBandDefinitions[5];
}

function uniqueInfluences(rows: UpgradeTreeInfluence[]) {
  const byId = new Map<string, number>();
  for (const row of rows) byId.set(row.id, Math.max(byId.get(row.id) ?? 0, row.weight));
  return [...byId].map(([id, weight]) => ({ id, weight })).sort((left, right) => left.id.localeCompare(right.id));
}

function authoredInfluences(upgrade: Upgrade) {
  const text = `${upgrade.name} ${upgrade.description} ${upgrade.bonus_type} ${upgrade.civilization}`.toLowerCase();
  const alignment: UpgradeTreeInfluence[] = [];
  if (/eco|green|nature|sustain|terraform|biolog|garden|restoration/.test(text)) alignment.push({ id: "alignment-nature", weight: 2 });
  if (/cyber|neural|synthetic|automation|robot|artificial intelligence|hive mind/.test(text)) alignment.push({ id: "alignment-cyber", weight: 2 });
  if (/trade|market|corporate|commerce|credit|logistics/.test(text)) alignment.push({ id: "alignment-corporate", weight: 2 });
  if (/science|research|quantum|technology|engineering|discovery|analysis/.test(text)) alignment.push({ id: "alignment-technology", weight: 1 });
  if (/industry|industrial|factory|manufactur|production|mining|extraction|construction/.test(text)) alignment.push({ id: "alignment-industry", weight: 1 });

  const resolved = uniqueInfluences(alignment);
  const future: UpgradeTreeInfluence[] = [];
  for (const influence of resolved) {
    if (influence.id === "alignment-nature") future.push({ id: "ERA007", weight: influence.weight });
    if (influence.id === "alignment-technology") future.push({ id: "ERA008", weight: influence.weight });
    if (influence.id === "alignment-industry") future.push({ id: "ERA009", weight: influence.weight });
    if (influence.id === "alignment-cyber" || influence.id === "alignment-corporate") future.push({ id: "ERA010", weight: influence.weight });
  }
  return { alignment: resolved, future: uniqueInfluences(future) };
}

function consequenceSummary(upgrade: Upgrade, influences: UpgradeTreeInfluence[]) {
  if (!influences.length) return "Improves civilization capability without a direct alignment shift.";
  const labels = influences.map((row) => row.id.replace("alignment-", "")).join(" and ");
  return `Encourages ${labels} development through ${upgrade.bonus_type || "civilization progression"}.`;
}

function nodeType(upgrade: Upgrade): UpgradeTreeNode["treeNodeType"] {
  if (/master/i.test(upgrade.name) || /master/i.test(upgrade.tier)) return "mastery_upgrade";
  if (/milestone|breakthrough|singularity|consciousness|infinite/i.test(upgrade.name)) return "major_upgrade";
  if (upgrade.max_level > 1) return "repeatable_upgrade";
  return "standard_upgrade";
}

export function buildUpgradeTreeContract(
  sourceUpgrades: Upgrade[],
  runtimeUpgrades: UpgradeDefinition[]
): UpgradeTreeContract {
  const runtimeById = new Map(runtimeUpgrades.map((upgrade) => [upgrade.id, upgrade]));
  const ordered = sourceUpgrades
    .map((upgrade, sourceIndex) => ({ upgrade, sourceIndex, branch: branchId(upgrade.type), band: eraBandFor(upgrade.era) }))
    .sort((left, right) =>
      left.band.order - right.band.order ||
      (branchDefinitions.find((branch) => branch.id === left.branch)?.order ?? 99) - (branchDefinitions.find((branch) => branch.id === right.branch)?.order ?? 99) ||
      left.sourceIndex - right.sourceIndex
    );

  const nodes: UpgradeTreeNode[] = [];
  const edges: UpgradeTreeEdge[] = [];
  const lastNodeByPath = new Map<string, UpgradeTreeNode>();
  const firstNodeByBandAndBranch = new Map<string, UpgradeTreeNode>();
  const countByPath = new Map<string, number>();

  for (const item of ordered) {
    const { upgrade, branch, band } = item;
    const sourceCluster = slug(upgrade.era);
    const pathKey = `${branch}:${sourceCluster}`;
    const index = countByPath.get(pathKey) ?? 0;
    countByPath.set(pathKey, index + 1);
    const prior = lastNodeByPath.get(pathKey);
    const influences = authoredInfluences(upgrade);
    const clusterOffset = band.id === "future"
      ? Math.max(0, band.sourceEraNames.indexOf(upgrade.era)) * 760
      : 0;
    const wave = Math.sin((index + branch.length) * 0.78) * 44;
    const node: UpgradeTreeNode = {
      id: `upgrade-tree-node-${upgrade.id}`,
      upgradeId: upgrade.id,
      treeBranchId: branch,
      treeEraId: band.canonicalEraId,
      sourceEra: upgrade.era,
      treeNodeType: nodeType(upgrade),
      treePositionX: band.positionX + 80 + clusterOffset + index * 92,
      treePositionY: (branchY.get(branch) ?? 580) + wave + (band.id === "future" ? Math.max(0, band.sourceEraNames.indexOf(upgrade.era)) % 2 * 64 : 0),
      treeWidth: 156,
      treeHeight: 82,
      clusterId: `${band.id}-${sourceCluster}`,
      importance: /master|milestone|singularity|consciousness|infinite/i.test(upgrade.name) ? "major" : "standard",
      authoredPositionLocked: true,
      semanticZoomLevel: /master|milestone|singularity|consciousness|infinite/i.test(upgrade.name) ? 1 : 2,
      visibility: {
        visibilityMode: "progressive",
        revealRule: prior ? "previous_completed" : band.order === 1 ? "start" : "era_reached",
        revealDepth: 1,
        mysteryUntilPreviousCompleted: Boolean(prior),
        revealWhenPreviousAvailable: false,
        revealWhenEraReached: !prior && band.order > 1,
        revealWhenResearchCompleted: [],
        revealWhenDiscoveryCompleted: [],
        previewAsQuestionMark: true,
        allowSilhouette: true,
        allowBranchHint: true,
        hiddenName: true,
        hiddenDescription: true,
        hiddenEffect: true,
        hiddenCost: true,
        hiddenIcon: true,
        revealTransitionId: "upgrade-node-reveal"
      },
      prerequisiteNodeIds: prior ? [prior.id] : [],
      alignmentInfluences: influences.alignment,
      futureCivilizationInfluences: influences.future,
      consequenceSummary: consequenceSummary(upgrade, influences.alignment),
      trajectoryHint: influences.alignment.length
        ? `Tends toward ${influences.alignment.map((row) => row.id.replace("alignment-", "")).join(", ")}.`
        : "No strong trajectory shift.",
      choiceGroupId: null,
      mutuallyExclusiveUpgradeIds: []
    };
    nodes.push(node);
    if (prior) {
      edges.push({
        id: `upgrade-tree-edge-${prior.upgradeId}-${upgrade.id}`,
        sourceNodeId: prior.id,
        targetNodeId: node.id,
        relationship: "required",
        mysterySafe: true
      });
    }
    lastNodeByPath.set(pathKey, node);
    firstNodeByBandAndBranch.set(`${band.id}:${branch}`, firstNodeByBandAndBranch.get(`${band.id}:${branch}`) ?? node);
    if (!runtimeById.has(upgrade.id)) {
      node.trajectoryHint = "Runtime definition missing.";
    }
  }

  for (const branch of branchDefinitions) {
    for (let index = 1; index < eraBandDefinitions.length; index += 1) {
      const previousBand = eraBandDefinitions[index - 1];
      const currentBand = eraBandDefinitions[index];
      const previousCandidates = nodes.filter((node) => node.treeBranchId === branch.id && eraBandFor(node.sourceEra).id === previousBand.id);
      const source = previousCandidates.at(-1);
      const target = firstNodeByBandAndBranch.get(`${currentBand.id}:${branch.id}`);
      if (!source || !target || target.prerequisiteNodeIds.includes(source.id)) continue;
      target.prerequisiteNodeIds.push(source.id);
      edges.push({
        id: `upgrade-tree-era-edge-${source.upgradeId}-${target.upgradeId}`,
        sourceNodeId: source.id,
        targetNodeId: target.id,
        relationship: "era_progression",
        mysterySafe: true
      });
    }
  }

  const futureCoreLastByBranch = new Map(
    branchDefinitions.map((branch) => [
      branch.id,
      nodes.filter((node) => node.treeBranchId === branch.id && node.sourceEra === "Future Core").at(-1)
    ])
  );
  for (const branch of branchDefinitions) {
    for (const specialization of eraBandDefinitions[5].sourceEraNames.slice(1)) {
      const source = futureCoreLastByBranch.get(branch.id);
      const target = nodes.find((node) => node.treeBranchId === branch.id && node.sourceEra === specialization);
      if (!source || !target || target.prerequisiteNodeIds.includes(source.id)) continue;
      target.prerequisiteNodeIds.push(source.id);
      edges.push({
        id: `upgrade-tree-future-edge-${source.upgradeId}-${target.upgradeId}`,
        sourceNodeId: source.id,
        targetNodeId: target.id,
        relationship: "unlocks",
        mysterySafe: true
      });
    }
  }

  const contract: UpgradeTreeContract = {
    id: "canonical-upgrade-tree",
    version: upgradeTreeContractVersion,
    direction: "left_to_right",
    progressionMode: "connected_tree",
    playerStateBoundary: "client_owned",
    alignmentPresentationModes: ["hidden", "subtle", "directional", "exact_development"],
    trajectoryStates: ["undetermined", "emerging", "leaning", "strongly_aligned", "converging", "future_path_established"],
    branches: branchDefinitions,
    eraBands: eraBandDefinitions,
    eraGates: eraBandDefinitions.slice(1).map((band, index) => ({
      id: `upgrade-tree-era-gate-${eraBandDefinitions[index].id}-${band.id}`,
      fromEraId: eraBandDefinitions[index].canonicalEraId,
      toEraId: band.canonicalEraId,
      actionSystemId: "canonical-action-system",
      requirements: { previousEraId: eraBandDefinitions[index].canonicalEraId }
    })),
    futureCivilizations,
    nodes,
    edges,
    choiceGroups: [],
    mysteryPresentation: {
      icon: "question_mark",
      accessibleLabel: "Unknown upgrade",
      tooltip: "Unknown upgrade",
      exposeCanonicalDetails: false
    },
    validation: { status: "Ready", errorCount: 0, warningCount: 0 }
  };
  const validation = validateUpgradeTreeContract(contract, {
    upgrades: runtimeUpgrades,
    eras: [],
    alignmentIds: new Set(["alignment-industry", "alignment-technology", "alignment-cyber", "alignment-nature", "alignment-corporate"])
  });
  contract.validation = {
    status: validation.some((issue) => issue.severity === "error") ? "Blocked" : validation.length ? "Ready With Warnings" : "Ready",
    errorCount: validation.filter((issue) => issue.severity === "error").length,
    warningCount: validation.filter((issue) => issue.severity === "warning").length
  };
  return contract;
}

export function validateUpgradeTreeContract(
  contract: UpgradeTreeContract,
  context: {
    upgrades: UpgradeDefinition[];
    eras: EraDefinition[];
    alignmentIds: Set<string>;
  }
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const upgradeIds = new Set(context.upgrades.map((upgrade) => upgrade.id));
  const nodeIds = new Set(contract.nodes.map((node) => node.id));
  const nodeUpgradeIds = contract.nodes.map((node) => node.upgradeId);
  const futureIds = new Set(contract.futureCivilizations.map((row) => row.id));
  const validEraIds = new Set(context.eras.map((era) => era.id));

  for (const upgrade of context.upgrades) {
    if (!nodeUpgradeIds.includes(upgrade.id)) {
      issues.push({ severity: "error", code: "upgrade_tree_node_missing", message: "Existing upgrade is missing from the connected tree.", records: [upgrade.id] });
    }
  }
  for (const duplicate of nodeUpgradeIds.filter((id, index) => nodeUpgradeIds.indexOf(id) !== index)) {
    issues.push({ severity: "error", code: "upgrade_tree_node_duplicate", message: "An upgrade may have only one linked tree node.", records: [duplicate] });
  }
  for (const node of contract.nodes) {
    if (!upgradeIds.has(node.upgradeId)) {
      issues.push({ severity: "error", code: "upgrade_tree_upgrade_missing", message: "Tree node upgradeId must resolve.", records: [node.id, node.upgradeId] });
    }
    if (context.eras.length && !validEraIds.has(node.treeEraId)) {
      issues.push({ severity: "error", code: "upgrade_tree_era_missing", message: "Tree node era must resolve to a canonical era.", records: [node.id, node.treeEraId] });
    }
    if (!Number.isFinite(node.treePositionX) || !Number.isFinite(node.treePositionY)) {
      issues.push({ severity: "error", code: "upgrade_tree_position_invalid", message: "Authored tree position must be finite.", records: [node.id] });
    }
    for (const prerequisite of node.prerequisiteNodeIds) {
      if (!nodeIds.has(prerequisite)) {
        issues.push({ severity: "error", code: "upgrade_tree_prerequisite_missing", message: "Tree prerequisite must resolve.", records: [node.id, prerequisite] });
      }
    }
    for (const influence of node.alignmentInfluences) {
      if (!context.alignmentIds.has(influence.id)) {
        issues.push({ severity: "error", code: "upgrade_tree_alignment_missing", message: "Alignment influence must resolve.", records: [node.id, influence.id] });
      }
      if (influence.weight > 3) {
        issues.push({ severity: "warning", code: "upgrade_tree_alignment_excessive", message: "A standard upgrade has excessive alignment influence.", records: [node.id, influence.id] });
      }
    }
    for (const influence of node.futureCivilizationInfluences) {
      if (!futureIds.has(influence.id)) {
        issues.push({ severity: "error", code: "upgrade_tree_future_missing", message: "Future civilization influence must resolve.", records: [node.id, influence.id] });
      }
      if (influence.weight > 3) {
        issues.push({ severity: "warning", code: "upgrade_tree_future_excessive", message: "A minor upgrade may not determine a future civilization.", records: [node.id, influence.id] });
      }
    }
    if (node.visibility.previewAsQuestionMark && (
      !node.visibility.hiddenName ||
      !node.visibility.hiddenDescription ||
      !node.visibility.hiddenEffect ||
      !node.visibility.hiddenCost ||
      !node.visibility.hiddenIcon
    )) {
      issues.push({ severity: "error", code: "upgrade_tree_mystery_leak", message: "Mystery presentation leaks canonical upgrade details.", records: [node.id] });
    }
  }
  for (const edge of contract.edges) {
    if (!nodeIds.has(edge.sourceNodeId) || !nodeIds.has(edge.targetNodeId)) {
      issues.push({ severity: "error", code: "upgrade_tree_edge_missing", message: "Tree edge endpoints must resolve.", records: [edge.id] });
    }
  }
  if (contract.mysteryPresentation.accessibleLabel !== "Unknown upgrade" || contract.mysteryPresentation.tooltip !== "Unknown upgrade") {
    issues.push({ severity: "error", code: "upgrade_tree_accessibility_leak", message: "Mystery accessibility strings must not reveal canonical details.", records: [contract.id] });
  }
  return issues;
}

export function upgradeTreeAlignmentIds(rows: CivilizationAlignmentScore[]) {
  return new Set(rows.map((row) => row.id));
}

export function sourceUpgradeEraOrder(value: string) {
  return sourceEraOrder.get(value) ?? 99;
}
