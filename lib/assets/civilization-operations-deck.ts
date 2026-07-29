import { createHash } from "node:crypto";

export const CIVILIZATION_OPERATIONS_VERSION = "1.0.0";

export type OperationsBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OperationsAssetStatus =
  | "Ready"
  | "Source Master Pending"
  | "Slice Mapping Pending"
  | "Export Pending"
  | "Validation Warning"
  | "Deprecated";

export type CivilizationOperationsAsset = {
  id: string;
  displayName: string;
  semanticKey: string;
  sourceSlotId: string;
  psdLayerGroup: string;
  exportFilename: string;
  runtimePath: string;
  assetType: "backplate" | "header" | "row" | "progress" | "button" | "indicator";
  spriteType: "simple" | "sliced";
  nineSlice: { enabled: boolean; border: [number, number, number, number] };
  pivot: [number, number];
  defaultScale: number;
  expectedMasterSize: [number, number];
  atlasGroup: "civilization_operations";
  status: OperationsAssetStatus;
};

export type CivilizationOperationsDeckContract = {
  id: "civilization-operations-deck";
  screenId: "civilization-command";
  regionId: "civilization_operations_deck";
  version: string;
  logicalResolution: [1920, 1200];
  masterResolution: [3840, 2400];
  logicalToMasterScale: 2;
  criticalSafeRegion: {
    aspectRatio: "16:9";
    logicalBounds: OperationsBounds;
    masterBounds: OperationsBounds;
  };
  geometryAudit: {
    auditedAtContractVersion: string;
    currentShellMasterResolution: [3840, 2160];
    currentShellBounds: {
      topHud: OperationsBounds;
      leftNavigation: OperationsBounds;
      mainWorkspace: OperationsBounds;
    };
    preservedRegions: Array<{
      id: string;
      status: "preserved";
      coordinateStatus: "canonical" | "asset-reference-only";
      evidence: string;
      intrinsicAssetSize?: [number, number];
    }>;
    deviations: string[];
  };
  bounds: OperationsBounds;
  masterBounds: OperationsBounds;
  children: Array<{
    regionId: string;
    displayName: string;
    purpose: string;
    logicalBounds: OperationsBounds;
    masterBounds: OperationsBounds;
    internalRegions: Array<{
      id: string;
      role: "artwork" | "live-content" | "critical-action";
      bounds: OperationsBounds;
    }>;
  }>;
  exportProfile: {
    id: "CivilizationOperationsExportProfile";
    referenceResolution: [3840, 2400];
    logicalResolution: [1920, 1200];
    exportScale: 2;
    transparentBackground: true;
    pixelsPerUnit: 100;
    safeMargins: [number, number, number, number];
    padding: [number, number, number, number];
    spriteAtlas: {
      id: "CivilizationOperationsAtlas";
      manifestPath: string;
      maxTextureSize: 4096;
      allowRotation: false;
      trimTransparent: true;
    };
    compressionProfile: {
      desktop: "BC7";
      tablet: "ASTC_6x6";
      fallback: "RGBA32";
    };
    presentationProfiles: Array<{
      id: "desktop_16_10" | "desktop_16_9" | "tablet_landscape" | "compact_landscape";
      layout: string;
      criticalActionsVisible: true;
      scrolling: "none" | "root" | "stack" | "tabs_or_drawers";
      notes: string;
    }>;
  };
  assets: CivilizationOperationsAsset[];
  iconReferenceSlots: Array<{ id: string; canonicalIconId: string | null; purpose: string }>;
  liveContentFields: string[];
  presentationContracts: {
    activeActions: {
      supportedTypes: string[];
      fields: string[];
      storesPlayerState: false;
    };
    nextPriorities: {
      supportedTypes: string[];
      fields: string[];
      resolutionOwner: "Unity";
    };
    recentActivity: {
      supportedTypes: string[];
      fields: string[];
      storesPlayerHistory: false;
    };
    civilizationForecast: {
      supportedMetrics: string[];
      fields: string[];
      calculationOwner: "Unity";
    };
  };
  visualAudit: {
    pendingOutline: "#FF2A2A";
    pendingOutlineLogicalPixels: 3;
    pendingFill: "rgba(255, 42, 42, 0.10)";
    supportedStatuses: OperationsAssetStatus[];
  };
  assetPack: {
    id: "CivilizationOperationsDeck";
    filename: "CivilizationOperationsDeck.artpack";
    packageRoot: "CivilizationOperationsDeck";
    manifestPath: string;
  };
  validationStatus: "Ready";
  hash: string;
};

const scaleBounds = (bounds: OperationsBounds): OperationsBounds => ({
  x: bounds.x * 2,
  y: bounds.y * 2,
  width: bounds.width * 2,
  height: bounds.height * 2
});

const rootBounds: OperationsBounds = { x: 232, y: 820, width: 1622, height: 340 };

const childSeeds = [
  {
    regionId: "operations_active_actions",
    displayName: "Active Actions",
    purpose: "Current timed actions and canonical queues.",
    logicalBounds: { x: 232, y: 820, width: 683, height: 340 },
    internalRegions: [
      { id: "active_actions_header", role: "live-content" as const, bounds: { x: 20, y: 16, width: 643, height: 44 } },
      { id: "active_actions_queue_summary", role: "live-content" as const, bounds: { x: 473, y: 16, width: 170, height: 44 } },
      { id: "active_actions_list", role: "live-content" as const, bounds: { x: 20, y: 72, width: 643, height: 208 } },
      { id: "active_actions_footer", role: "critical-action" as const, bounds: { x: 20, y: 292, width: 643, height: 28 } }
    ]
  },
  {
    regionId: "operations_next_priorities",
    displayName: "Next Priorities",
    purpose: "Recommended next actions resolved from live civilization state.",
    logicalBounds: { x: 929, y: 820, width: 432, height: 340 },
    internalRegions: [
      { id: "next_priorities_header", role: "live-content" as const, bounds: { x: 20, y: 16, width: 392, height: 44 } },
      { id: "next_priorities_cards", role: "live-content" as const, bounds: { x: 20, y: 72, width: 392, height: 208 } },
      { id: "next_priorities_footer", role: "critical-action" as const, bounds: { x: 20, y: 292, width: 392, height: 28 } }
    ]
  },
  {
    regionId: "operations_recent_activity",
    displayName: "Recent Activity",
    purpose: "Recent civilization events and state changes.",
    logicalBounds: { x: 1375, y: 820, width: 479, height: 210 },
    internalRegions: [
      { id: "recent_activity_header", role: "live-content" as const, bounds: { x: 20, y: 16, width: 439, height: 38 } },
      { id: "recent_activity_list", role: "live-content" as const, bounds: { x: 20, y: 62, width: 439, height: 110 } },
      { id: "recent_activity_footer", role: "live-content" as const, bounds: { x: 20, y: 178, width: 439, height: 24 } }
    ]
  },
  {
    regionId: "operations_civilization_forecast",
    displayName: "Civilization Forecast",
    purpose: "Short-range projections and the next likely bottleneck.",
    logicalBounds: { x: 1375, y: 1045, width: 479, height: 115 },
    internalRegions: [
      { id: "civilization_forecast_header", role: "live-content" as const, bounds: { x: 20, y: 12, width: 439, height: 28 } },
      { id: "civilization_forecast_metrics", role: "live-content" as const, bounds: { x: 20, y: 45, width: 264, height: 52 } },
      { id: "civilization_forecast_bottleneck", role: "live-content" as const, bounds: { x: 299, y: 45, width: 160, height: 52 } }
    ]
  }
] as const;

type AssetSeed = {
  id: string;
  slot: string;
  type: CivilizationOperationsAsset["assetType"];
  size: [number, number];
  sliced?: boolean;
};

const assetSeeds: AssetSeed[] = [
  { id: "operations_deck_background", slot: "operations-deck", type: "backplate", size: [3244, 680], sliced: true },
  { id: "active_actions_backplate", slot: "active-actions", type: "backplate", size: [1366, 680], sliced: true },
  { id: "active_actions_header", slot: "active-actions", type: "header", size: [1286, 88], sliced: true },
  { id: "active_action_row_default", slot: "action-row", type: "row", size: [1286, 116], sliced: true },
  { id: "active_action_row_active", slot: "action-row", type: "row", size: [1286, 116], sliced: true },
  { id: "active_action_row_paused", slot: "action-row", type: "row", size: [1286, 116], sliced: true },
  { id: "active_action_progress_track", slot: "action-row", type: "progress", size: [920, 16], sliced: true },
  { id: "active_action_progress_fill", slot: "action-row", type: "progress", size: [920, 16], sliced: true },
  { id: "active_actions_footer_button", slot: "active-actions", type: "button", size: [1286, 56], sliced: true },
  { id: "next_priorities_backplate", slot: "next-priorities", type: "backplate", size: [864, 680], sliced: true },
  { id: "next_priorities_header", slot: "next-priorities", type: "header", size: [784, 88], sliced: true },
  { id: "priority_card_default", slot: "priority-card", type: "row", size: [784, 136], sliced: true },
  { id: "priority_card_recommended", slot: "priority-card", type: "row", size: [784, 136], sliced: true },
  { id: "priority_card_blocked", slot: "priority-card", type: "row", size: [784, 136], sliced: true },
  { id: "priority_card_progress_track", slot: "priority-card", type: "progress", size: [560, 16], sliced: true },
  { id: "priority_card_progress_fill", slot: "priority-card", type: "progress", size: [560, 16], sliced: true },
  { id: "next_priorities_footer_button", slot: "next-priorities", type: "button", size: [784, 56], sliced: true },
  { id: "recent_activity_backplate", slot: "recent-activity", type: "backplate", size: [958, 420], sliced: true },
  { id: "recent_activity_header", slot: "recent-activity", type: "header", size: [878, 76], sliced: true },
  { id: "activity_row_default", slot: "activity-row", type: "row", size: [878, 72], sliced: true },
  { id: "activity_row_important", slot: "activity-row", type: "row", size: [878, 72], sliced: true },
  { id: "activity_row_warning", slot: "activity-row", type: "row", size: [878, 72], sliced: true },
  { id: "recent_activity_footer_button", slot: "recent-activity", type: "button", size: [878, 48], sliced: true },
  { id: "civilization_forecast_backplate", slot: "civilization-forecast", type: "backplate", size: [958, 230], sliced: true },
  { id: "civilization_forecast_header", slot: "civilization-forecast", type: "header", size: [878, 56], sliced: true },
  { id: "forecast_metric_background", slot: "forecast-metrics", type: "row", size: [528, 104], sliced: true },
  { id: "forecast_bottleneck_background", slot: "forecast-metrics", type: "row", size: [320, 104], sliced: true },
  { id: "forecast_warning_indicator", slot: "forecast-metrics", type: "indicator", size: [48, 48] }
];

const title = (id: string) => id.split("_").map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`).join(" ");

export const civilizationOperationsAssets: CivilizationOperationsAsset[] = assetSeeds.map((asset) => ({
  id: asset.id,
  displayName: title(asset.id),
  semanticKey: `civilization_operations.${asset.id}`,
  sourceSlotId: asset.slot,
  psdLayerGroup: asset.id,
  exportFilename: `${asset.id}.png`,
  runtimePath: `sprites/${asset.id}.png`,
  assetType: asset.type,
  spriteType: asset.sliced ? "sliced" : "simple",
  nineSlice: {
    enabled: Boolean(asset.sliced),
    border: asset.sliced ? [24, 24, 24, 24] : [0, 0, 0, 0]
  },
  pivot: [0.5, 0.5],
  defaultScale: 1,
  expectedMasterSize: asset.size,
  atlasGroup: "civilization_operations",
  status: "Source Master Pending"
}));

const contractWithoutHash = {
  id: "civilization-operations-deck" as const,
  screenId: "civilization-command" as const,
  regionId: "civilization_operations_deck" as const,
  version: CIVILIZATION_OPERATIONS_VERSION,
  logicalResolution: [1920, 1200] as [1920, 1200],
  masterResolution: [3840, 2400] as [3840, 2400],
  logicalToMasterScale: 2 as const,
  criticalSafeRegion: {
    aspectRatio: "16:9" as const,
    logicalBounds: { x: 0, y: 60, width: 1920, height: 1080 },
    masterBounds: { x: 0, y: 120, width: 3840, height: 2160 }
  },
  geometryAudit: {
    auditedAtContractVersion: CIVILIZATION_OPERATIONS_VERSION,
    currentShellMasterResolution: [3840, 2160] as [3840, 2160],
    currentShellBounds: {
      topHud: { x: 0, y: 0, width: 3840, height: 220 },
      leftNavigation: { x: 54, y: 276, width: 360, height: 1668 },
      mainWorkspace: { x: 464, y: 260, width: 3244, height: 1804 }
    },
    preservedRegions: [
      { id: "top_civilization_hud", status: "preserved" as const, coordinateStatus: "canonical" as const, evidence: "app-shell", intrinsicAssetSize: [3840, 220] as [number, number] },
      { id: "left_navigation", status: "preserved" as const, coordinateStatus: "canonical" as const, evidence: "app-shell", intrinsicAssetSize: [360, 1668] as [number, number] },
      { id: "click_power_panel", status: "preserved" as const, coordinateStatus: "asset-reference-only" as const, evidence: "asset_clicker_hud_background", intrinsicAssetSize: [350, 780] as [number, number] },
      { id: "ai_agent_panel", status: "preserved" as const, coordinateStatus: "asset-reference-only" as const, evidence: "canonical-ai-agent-contract" },
      { id: "civilization_hero", status: "preserved" as const, coordinateStatus: "asset-reference-only" as const, evidence: "civilization-command-screen" },
      { id: "objective_panel", status: "preserved" as const, coordinateStatus: "asset-reference-only" as const, evidence: "asset_objective_panel", intrinsicAssetSize: [351, 105] as [number, number] },
      { id: "era_progression", status: "preserved" as const, coordinateStatus: "asset-reference-only" as const, evidence: "asset_era_progression_hex", intrinsicAssetSize: [58, 58] as [number, number] },
      { id: "alignment_panel", status: "preserved" as const, coordinateStatus: "asset-reference-only" as const, evidence: "asset_alignment_panel", intrinsicAssetSize: [1000, 929] as [number, number] },
      { id: "active_event_panel", status: "preserved" as const, coordinateStatus: "asset-reference-only" as const, evidence: "asset_active_event_panel", intrinsicAssetSize: [1005, 510] as [number, number] }
    ],
    deviations: [
      "Root x moved from 180 to 232 logical pixels to clear the canonical left navigation and align with the main workspace.",
      "Root width reduced from 1710 to 1622 logical pixels to match the canonical main workspace.",
      "Child widths were proportionally reduced while preserving the four-area hierarchy.",
      "Active Actions and Next Priorities footer actions moved from local y 296 to 292 so critical controls end at the 16:9 safe boundary."
    ]
  },
  bounds: rootBounds,
  masterBounds: scaleBounds(rootBounds),
  children: childSeeds.map((child) => ({
    ...child,
    masterBounds: scaleBounds(child.logicalBounds),
    internalRegions: child.internalRegions.map((region) => ({ ...region }))
  })),
  exportProfile: {
    id: "CivilizationOperationsExportProfile" as const,
    referenceResolution: [3840, 2400] as [3840, 2400],
    logicalResolution: [1920, 1200] as [1920, 1200],
    exportScale: 2,
    transparentBackground: true,
    pixelsPerUnit: 100,
    safeMargins: [32, 32, 32, 32] as [number, number, number, number],
    padding: [20, 16, 20, 16] as [number, number, number, number],
    spriteAtlas: {
      id: "CivilizationOperationsAtlas" as const,
      manifestPath: "atlas/CivilizationOperations.spriteatlas.json",
      maxTextureSize: 4096,
      allowRotation: false as const,
      trimTransparent: true as const
    },
    compressionProfile: {
      desktop: "BC7" as const,
      tablet: "ASTC_6x6" as const,
      fallback: "RGBA32" as const
    },
    presentationProfiles: [
      { id: "desktop_16_10" as const, layout: "four_area", criticalActionsVisible: true as const, scrolling: "none" as const, notes: "All areas remain visible." },
      { id: "desktop_16_9" as const, layout: "primary_plus_compact_secondary", criticalActionsVisible: true as const, scrolling: "root" as const, notes: "Active Actions and Next Priorities remain primary; secondary areas may compact." },
      { id: "tablet_landscape" as const, layout: "stacked_primary", criticalActionsVisible: true as const, scrolling: "stack" as const, notes: "Active Actions is full width; remaining areas stack with touch-safe controls." },
      { id: "compact_landscape" as const, layout: "single_panel", criticalActionsVisible: true as const, scrolling: "tabs_or_drawers" as const, notes: "One primary panel is shown at a time." }
    ]
  },
  assets: civilizationOperationsAssets,
  iconReferenceSlots: [
    { id: "action_type_icon", canonicalIconId: null, purpose: "Resolve from the canonical action type." },
    { id: "priority_type_icon", canonicalIconId: null, purpose: "Resolve from the recommendation type." },
    { id: "activity_type_icon", canonicalIconId: null, purpose: "Resolve from the activity type." },
    { id: "forecast_metric_icon", canonicalIconId: null, purpose: "Resolve from the canonical economy or capacity metric." }
  ],
  liveContentFields: [
    "panel titles", "action names", "action categories", "timers", "queue counts", "progress values", "assigned Labor",
    "pause and cancel controls", "priority names", "recommendation explanations", "costs", "milestone progress",
    "recent-activity messages", "timestamps", "forecast values", "bottleneck descriptions", "navigation labels", "button labels"
  ],
  presentationContracts: {
    activeActions: {
      supportedTypes: ["Construction", "Research", "Upgrade", "AI Agent", "Mission", "Expedition", "Scan", "Resource Processing", "Colony Preparation", "Era Advancement", "Terraforming", "Settlement Action", "Canonical Action"],
      fields: ["actionId", "actionType", "iconId", "displayName", "supportingText", "status", "progress", "remainingTime", "totalDuration", "LaborAssigned", "queuePosition", "canPause", "canResume", "canCancel", "destinationScreenId", "priority", "warning", "artworkVariantId"],
      storesPlayerState: false as const
    },
    nextPriorities: {
      supportedTypes: ["Current Objective", "Next Upgrade", "Recommended Building", "Recommended Research", "Population Milestone", "Resource Bottleneck", "Era Requirement", "Exploration Opportunity", "Mission Opportunity", "Settlement Need", "AI Agent Opportunity"],
      fields: ["recommendationType", "iconId", "title", "explanationTemplate", "progressType", "destinationScreenId", "importance", "artworkVariantId", "completionMetricIds", "displayOrder"],
      resolutionOwner: "Unity" as const
    },
    recentActivity: {
      supportedTypes: ["action completed", "upgrade completed", "building completed", "research completed", "population changed", "resource discovered", "mission completed", "expedition returned", "discovery recorded", "alignment changed", "weather changed", "event started", "event ended", "AI Agent leveled", "Era advanced", "settlement changed", "anomaly detected"],
      fields: ["iconId", "titleTemplate", "messageTemplate", "severity", "artworkVariantId", "destinationScreenId", "retentionCategory"],
      storesPlayerHistory: false as const
    },
    civilizationForecast: {
      supportedMetrics: ["projected Labor", "projected Credits", "projected Population", "projected Research", "projected resource production", "queue completion", "housing capacity", "storage capacity", "energy capacity", "food capacity", "Labor shortage", "resource shortage", "expected unlock", "expected Era requirement completion"],
      fields: ["metricId", "label", "iconId", "unit", "formatting", "forecastWindow", "warningThreshold", "criticalThreshold", "destinationScreenId"],
      calculationOwner: "Unity" as const
    }
  },
  visualAudit: {
    pendingOutline: "#FF2A2A" as const,
    pendingOutlineLogicalPixels: 3,
    pendingFill: "rgba(255, 42, 42, 0.10)" as const,
    supportedStatuses: ["Ready", "Source Master Pending", "Slice Mapping Pending", "Export Pending", "Validation Warning", "Deprecated"] as OperationsAssetStatus[]
  },
  assetPack: {
    id: "CivilizationOperationsDeck" as const,
    filename: "CivilizationOperationsDeck.artpack" as const,
    packageRoot: "CivilizationOperationsDeck" as const,
    manifestPath: "CivilizationOperationsDeck/CivilizationOperationsDeck.manifest.json"
  },
  validationStatus: "Ready" as const
} satisfies Omit<CivilizationOperationsDeckContract, "hash">;

const hashContract = (contract: unknown) => createHash("sha256").update(JSON.stringify(contract)).digest("hex");

export const civilizationOperationsDeckContract: CivilizationOperationsDeckContract = {
  ...contractWithoutHash,
  hash: hashContract(contractWithoutHash)
};

export function validateCivilizationOperationsDeckContract(
  contract: CivilizationOperationsDeckContract = civilizationOperationsDeckContract
) {
  const issues: string[] = [];
  const assetIds = new Set<string>();
  const semanticKeys = new Set<string>();
  const safeBottom = contract.criticalSafeRegion.logicalBounds.y + contract.criticalSafeRegion.logicalBounds.height;
  const leftNavigationRight = contract.geometryAudit.currentShellBounds.leftNavigation.x / contract.logicalToMasterScale
    + contract.geometryAudit.currentShellBounds.leftNavigation.width / contract.logicalToMasterScale;

  if (contract.bounds.x < leftNavigationRight) issues.push("Operations Deck overlaps the canonical left navigation.");
  if (contract.bounds.x * 2 !== contract.masterBounds.x || contract.bounds.width * 2 !== contract.masterBounds.width) {
    issues.push("Root master bounds must be exactly 2x logical bounds.");
  }
  if (contract.children.length !== 4) issues.push("Operations Deck must expose exactly four canonical child regions.");
  if (contract.assets.length !== 28) issues.push(`Expected 28 production assets, received ${contract.assets.length}.`);
  if (contract.exportProfile.presentationProfiles.length !== 4) issues.push("All four responsive presentation profiles are required.");

  for (const child of contract.children) {
    const rootRight = contract.bounds.x + contract.bounds.width;
    const rootBottom = contract.bounds.y + contract.bounds.height;
    if (
      child.logicalBounds.x < contract.bounds.x
      || child.logicalBounds.y < contract.bounds.y
      || child.logicalBounds.x + child.logicalBounds.width > rootRight
      || child.logicalBounds.y + child.logicalBounds.height > rootBottom
    ) issues.push(`Child region falls outside the Operations Deck: ${child.regionId}.`);
    if (
      child.masterBounds.x !== child.logicalBounds.x * 2
      || child.masterBounds.y !== child.logicalBounds.y * 2
      || child.masterBounds.width !== child.logicalBounds.width * 2
      || child.masterBounds.height !== child.logicalBounds.height * 2
    ) issues.push(`Master bounds are not 2x logical bounds: ${child.regionId}.`);
    for (const region of child.internalRegions.filter((item) => item.role === "critical-action")) {
      if (child.logicalBounds.y + region.bounds.y + region.bounds.height > safeBottom) {
        issues.push(`Critical action falls outside the 16:9 safe region: ${region.id}.`);
      }
    }
  }

  for (const asset of contract.assets) {
    if (assetIds.has(asset.id)) issues.push(`Duplicate production asset ID: ${asset.id}.`);
    if (semanticKeys.has(asset.semanticKey)) issues.push(`Duplicate production semantic key: ${asset.semanticKey}.`);
    assetIds.add(asset.id);
    semanticKeys.add(asset.semanticKey);
    if (asset.status === "Ready") issues.push(`Artwork cannot be Ready before source masters exist: ${asset.id}.`);
    if (!asset.runtimePath.startsWith("sprites/") || !asset.runtimePath.endsWith(".png")) {
      issues.push(`Invalid package-relative asset path: ${asset.id}.`);
    }
  }

  const serialized = JSON.stringify(contract);
  for (const forbidden of ["/Users/", "source-masters", ".psd", ".psb", "studio-private://"]) {
    if (serialized.includes(forbidden)) issues.push(`Public contract leaks private source data: ${forbidden}.`);
  }
  const { hash: _hash, ...withoutHash } = contract;
  if (hashContract(withoutHash) !== contract.hash) issues.push("Operations Deck contract hash does not match its sanitized payload.");

  return issues;
}

export function buildCivilizationOperationsArtpackDescriptor() {
  return {
    format: "noveris-artpack-v1",
    package: civilizationOperationsDeckContract.assetPack,
    metadata: {
      screenId: civilizationOperationsDeckContract.screenId,
      regionId: civilizationOperationsDeckContract.regionId,
      version: civilizationOperationsDeckContract.version,
      hash: civilizationOperationsDeckContract.hash,
      generatedFrom: "canonical-screen-region-contract"
    },
    files: {
      "CivilizationOperationsDeck/CivilizationOperationsDeck.manifest.json": civilizationOperationsDeckContract,
      "CivilizationOperationsDeck/metadata.json": {
        logicalResolution: civilizationOperationsDeckContract.logicalResolution,
        masterResolution: civilizationOperationsDeckContract.masterResolution,
        bounds: civilizationOperationsDeckContract.bounds,
        exportProfile: civilizationOperationsDeckContract.exportProfile,
        validationStatus: civilizationOperationsDeckContract.validationStatus
      },
      "CivilizationOperationsDeck/atlas/CivilizationOperations.spriteatlas.json": {
        ...civilizationOperationsDeckContract.exportProfile.spriteAtlas,
        sprites: civilizationOperationsDeckContract.assets.map((asset) => asset.runtimePath)
      },
      "CivilizationOperationsDeck/sprites/index.json": civilizationOperationsDeckContract.assets.map((asset) => ({
        id: asset.id,
        semanticKey: asset.semanticKey,
        path: asset.runtimePath,
        status: asset.status,
        spriteType: asset.spriteType,
        nineSlice: asset.nineSlice,
        pivot: asset.pivot,
        expectedMasterSize: asset.expectedMasterSize
      }))
    }
  };
}
